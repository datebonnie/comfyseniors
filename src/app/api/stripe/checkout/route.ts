import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase";

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
  const { plan, facilityId, adminEmail } = await req.json();

  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  // facilityId is REQUIRED — before this change, buttons were calling
  // with null and the webhook's `if (facilityId)` branch never fired,
  // meaning real payments would complete but the facility would never
  // be flipped to verified. Cardinal sin. Now rejected at the edge.
  if (!facilityId || typeof facilityId !== "string") {
    return NextResponse.json(
      { error: "facilityId is required to start checkout." },
      { status: 400 }
    );
  }

  // Verify the facility actually exists before spinning up a Stripe
  // session. Prevents the webhook later trying to update a non-existent
  // row.
  const supabase = createServiceClient();
  const { data: facility, error: lookupError } = await supabase
    .from("facilities")
    .select("id, name, county, subscription_tier")
    .eq("id", facilityId)
    .maybeSingle();

  if (lookupError || !facility) {
    return NextResponse.json(
      { error: "Facility not found." },
      { status: 404 }
    );
  }

  // Founding tier cap: server-side enforcement. Count existing founding
  // rows; reject if >= 20. UI hides the tier at count>=20 but this
  // guards against anyone crafting a direct POST.
  const { envVar, planTag } = PLANS[plan as PlanKey];
  if (planTag === "founding") {
    const { count: foundingCount } = await supabase
      .from("facilities")
      .select("*", { count: "exact", head: true })
      .eq("subscription_tier", "founding");
    if ((foundingCount ?? 0) >= 20) {
      return NextResponse.json(
        {
          error:
            "Founding Member is sold out (20/20 claimed). Choose Claim, Grow, or Medicare/Medicaid instead.",
        },
        { status: 410 } // Gone — matches the semantic of a sold-out tier
      );
    }
  }

  const priceId = process.env[envVar];
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price not configured (${envVar}).` },
      { status: 503 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://comfyseniors.com";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // Land on /welcome post-payment — that page reads the session,
      // fires the magic-link email if not already sent, and guides the
      // new admin to their dashboard. Cancellation returns to the
      // claim page so they can try again or pick a different tier.
      success_url: `${appUrl}/for-facilities/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/for-facilities/claim/${facilityId}?canceled=true`,
      customer_email:
        typeof adminEmail === "string" && adminEmail.includes("@")
          ? adminEmail
          : undefined,
      metadata: {
        facility_id: facilityId,
        facility_name: facility.name,
        plan: planTag,
      },
      subscription_data: {
        metadata: {
          facility_id: facilityId,
          facility_name: facility.name,
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
