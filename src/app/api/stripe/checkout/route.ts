import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PLAN_PRICE_MAP: Record<string, string> = {
  pro_monthly: "STRIPE_PRO_MONTHLY_PRICE_ID",
  pro_annual: "STRIPE_PRO_ANNUAL_PRICE_ID",
  enterprise_monthly: "STRIPE_ENTERPRISE_MONTHLY_PRICE_ID",
  enterprise_annual: "STRIPE_ENTERPRISE_ANNUAL_PRICE_ID",
};

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 }
    );
  }

  const stripe = new Stripe(secretKey);
  const { plan, facilityId } = await req.json();

  const validPlans = Object.keys(PLAN_PRICE_MAP);
  if (!plan || !validPlans.includes(plan)) {
    return NextResponse.json(
      { error: `Invalid plan. Choose one of: ${validPlans.join(", ")}` },
      { status: 400 }
    );
  }

  const envKey = PLAN_PRICE_MAP[plan];
  const priceId = process.env[envKey];

  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price ID not configured for ${plan}. Set ${envKey} in environment variables.` },
      { status: 503 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://comfyseniors.com";

  // Determine tier from plan name
  const tier = plan.startsWith("enterprise") ? "enterprise" : "pro";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/for-facilities?success=true&plan=${tier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/for-facilities?canceled=true`,
      metadata: {
        facility_id: facilityId || "",
        plan: tier,
      },
      subscription_data: {
        metadata: {
          facility_id: facilityId || "",
          plan: tier,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
