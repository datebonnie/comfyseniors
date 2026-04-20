import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase";

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
      // The checkout route writes the planTag (claim | verified |
      // medicaid | founding) into metadata.plan. We persist that to
      // facilities.subscription_tier so UI can branch on it (Founding
      // Partner badge, pricing grid cap enforcement, etc.).
      const planTag = session.metadata?.plan || "verified";

      if (facilityId) {
        await supabase.from("featured_subscriptions").insert({
          facility_id: facilityId,
          stripe_customer_id: session.customer as string,
          stripe_sub_id: session.subscription as string,
          plan: planTag,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: planTag === "annual"
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        // Mark facility as featured AND flip subscription_tier +
        // verified_at in one write. The is_estimated flag flips off
        // so facility pages show the real verification date.
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
