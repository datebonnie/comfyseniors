import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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

  const validPlans = ["verified_monthly", "verified_annual"];
  if (!plan || !validPlans.includes(plan)) {
    return NextResponse.json(
      { error: "Invalid plan." },
      { status: 400 }
    );
  }

  const priceId =
    plan === "verified_monthly"
      ? process.env.STRIPE_VERIFIED_MONTHLY_PRICE_ID
      : process.env.STRIPE_VERIFIED_ANNUAL_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price not configured." },
      { status: 503 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://comfyseniors.com";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/for-facilities?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/for-facilities?canceled=true`,
      metadata: {
        facility_id: facilityId || "",
        plan: "verified",
      },
      subscription_data: {
        metadata: {
          facility_id: facilityId || "",
          plan: "verified",
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
