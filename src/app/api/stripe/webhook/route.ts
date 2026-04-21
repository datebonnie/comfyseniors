import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/welcome-email";

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Service role: webhook handler runs server-side with a verified
  // Stripe signature. Writes to facilities + featured_subscriptions
  // under privileged access.
  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const facilityId = session.metadata?.facility_id;
      const facilityName = session.metadata?.facility_name || "";
      // The checkout route writes the planTag (claim | verified |
      // medicaid | founding) into metadata.plan. We persist that to
      // facilities.subscription_tier so UI can branch on it (Founding
      // Partner badge, pricing grid cap enforcement, etc.).
      const planTag = (session.metadata?.plan || "verified") as
        | "verified"
        | "claim"
        | "medicaid"
        | "founding";

      // Admin email — prefer customer_details (what the buyer typed at
      // Stripe Checkout), fall back to the customer_email we hinted in
      // the session create.
      const adminEmail =
        session.customer_details?.email ||
        (typeof session.customer_email === "string"
          ? session.customer_email
          : null);

      if (facilityId) {
        // 1. Subscription record
        // expires_at is a best-effort hint for display; actual
        // subscription lifecycle is driven by
        // customer.subscription.{updated,deleted} events from Stripe.
        // Default to +30 days; annual subs get extended on each
        // successful renewal automatically via the update events.
        await supabase.from("featured_subscriptions").insert({
          facility_id: facilityId,
          stripe_customer_id: session.customer as string,
          stripe_sub_id: session.subscription as string,
          plan: planTag,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });

        // 2. Flip facility to verified + set tier + real verified_at
        const nowIso = new Date().toISOString();
        await supabase
          .from("facilities")
          .update({
            is_featured: true,
            is_verified: true,
            featured_since: nowIso.split("T")[0],
            subscription_tier: planTag,
            verified_at: nowIso,
            verified_at_is_estimated: false,
          })
          .eq("id", facilityId);

        // 3. Invite the admin: generate a one-time magic link for the
        //    email they gave at checkout, then email it to them via
        //    Resend with a proper welcome. The link redirects to
        //    /for-facilities/welcome?fid=... which binds the newly-
        //    authenticated user to the facility in facility_users.
        if (adminEmail) {
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            "https://www.comfyseniors.com";
          const redirectTarget = `${appUrl}/auth/callback?redirect=/for-facilities/welcome%3Ffid%3D${facilityId}`;

          try {
            const { data: linkData, error: linkError } =
              await supabase.auth.admin.generateLink({
                type: "magiclink",
                email: adminEmail,
                options: {
                  redirectTo: redirectTarget,
                },
              });

            if (linkError || !linkData?.properties?.action_link) {
              console.error(
                "[stripe-webhook] magic-link generate failed:",
                linkError
              );
            } else {
              await sendWelcomeEmail({
                to: adminEmail,
                facilityName: facilityName || "your facility",
                planTag,
                magicLinkUrl: linkData.properties.action_link,
              });
            }
          } catch (err) {
            console.error("[stripe-webhook] admin invite failed:", err);
          }
        } else {
          console.warn(
            `[stripe-webhook] checkout ${session.id} completed with no admin email — cannot send welcome link`
          );
        }
      }
      break;
    }

    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const facilityId = subscription.metadata?.facility_id;

      if (facilityId) {
        const isActive = subscription.status === "active";

        await supabase
          .from("featured_subscriptions")
          .update({ status: subscription.status })
          .eq("stripe_sub_id", subscription.id);

        // On cancellation, drop is_featured and clear subscription_tier.
        // Leave is_verified + verified_at intact — a past Verified
        // status is historical truth; we don't rewrite it.
        await supabase
          .from("facilities")
          .update({
            is_featured: isActive,
            subscription_tier: isActive
              ? subscription.metadata?.plan || null
              : null,
          })
          .eq("id", facilityId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
