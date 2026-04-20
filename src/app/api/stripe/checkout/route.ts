import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Plan → Stripe price-ID + plan-tag mapping.
 * Add a new row here to introduce a new subscription product.
 */
const PLANS = {
  verified_monthly: {
    envVar: "STRIPE_VERIFIED_MONTHLY_PRICE_ID",
    planTag: "verified",
  },
  verified_annual: {
    envVar: "STRIPE_VERIFIED_ANNUAL_PRICE_ID",
    planTag: "verified",
  },
  medicaid_monthly: {
    envVar: "STRIPE_MEDICAID_MONTHLY_PRICE_ID",
    planTag: "medicaid",
  },
  claim_monthly: {
    envVar: "STRIPE_CLAIM_MONTHLY_PRICE_ID",
    planTag: "claim",
  },
  // Founding Member tier — capped at first 20 Bergen County facilities.
  // Hidden on /for-facilities once count >= 20. Webhook sets
  // subscription_tier='founding' on checkout completion, which the
  // facility page uses to show the "Founding Partner" badge.
  founding_monthly: {
    envVar: "STRIPE_FOUNDING_MONTHLY_PRICE_ID",
    planTag: "founding",
  },
} as const;

type PlanKey = keyof typeof PLANS;

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

  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const { envVar, planTag } = PLANS[plan as PlanKey];
  const priceId = process.env[envVar];

  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price not configured (${envVar}).` },
      { status: 503 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://comfyseniors.com";
  const successRedirectBase =
    planTag === "medicaid" ? "/for-facilities/medicaid" : "/for-facilities";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}${successRedirectBase}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}${successRedirectBase}?canceled=true`,
      metadata: {
        facility_id: facilityId || "",
        plan: planTag,
      },
      subscription_data: {
        metadata: {
          facility_id: facilityId || "",
          plan: planTag,
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
