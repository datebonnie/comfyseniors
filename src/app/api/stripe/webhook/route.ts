import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase";

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

  const supabase = createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const facilityId = session.metadata?.facility_id;
      const plan = session.metadata?.plan || "monthly";

      if (facilityId) {
        // Create subscription record
        await supabase.from("featured_subscriptions").insert({
          facility_id: facilityId,
          stripe_customer_id: session.customer as string,
          stripe_sub_id: session.subscription as string,
          plan,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: plan === "annual"
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        // Mark facility as featured
        await supabase
          .from("facilities")
          .update({
            is_featured: true,
            featured_since: new Date().toISOString().split("T")[0],
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

        // Update subscription status
        await supabase
          .from("featured_subscriptions")
          .update({ status: subscription.status })
          .eq("stripe_sub_id", subscription.id);

        // Update facility featured status
        await supabase
          .from("facilities")
          .update({ is_featured: isActive })
          .eq("id", facilityId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
