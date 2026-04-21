"use client";

import { useState } from "react";
import StripeButton from "@/components/ui/StripeButton";

interface Tier {
  id:
    | "founding_monthly"
    | "verified_monthly"
    | "claim_monthly"
    | "medicaid_monthly";
  name: string;
  priceLabel: string;
  /** Fine-print subtitle under the price (e.g., "flat, no placement fees"). */
  byline: string;
  includes: string[];
  /** If set, tier is visually emphasized as the recommendation. */
  highlighted?: boolean;
  /** If true, tier is rendered with the compact "special case" treatment. */
  secondary?: boolean;
  ctaLabel: string;
}

interface Props {
  facilityId: string;
  facilityName: string;
  acceptsMedicaid: boolean;
  acceptsMedicare: boolean;
  foundingAvailable: boolean;
}

/**
 * Renders the claim-flow tier picker. Shown after a facility admin
 * has selected their facility (either via /claim/[id] or via the
 * /claim facility selector). Every CTA routes to Stripe Checkout
 * with the facility_id already attached — so the webhook has what it
 * needs to create the facility_users link post-payment.
 *
 * The admin-email input is captured up-front: Stripe Checkout will
 * pre-fill it, and the webhook uses it to invite the admin via
 * magic-link. Without this, the buyer has no way to log into the
 * dashboard after paying.
 */
export default function ClaimTierPicker({
  facilityId,
  facilityName,
  acceptsMedicaid,
  acceptsMedicare,
  foundingAvailable,
}: Props) {
  const [adminEmail, setAdminEmail] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const isMedicaidFacility = acceptsMedicaid || acceptsMedicare;

  const tiers: Tier[] = [];

  if (foundingAvailable) {
    tiers.push({
      id: "founding_monthly",
      name: "Founding Member",
      priceLabel: "$197/month",
      byline: "Only the first 20 Bergen County facilities. Locks in for life.",
      includes: [
        "Everything in Grow",
        "Founding Partner badge on your public page",
        "Direct-to-founder feedback line",
        "Price lock for the life of your subscription",
      ],
      highlighted: true,
      ctaLabel: "Claim Founding spot — $197/month",
    });
  }

  tiers.push({
    id: "verified_monthly",
    name: "Grow",
    priceLabel: "$297/month",
    byline: "Flat, no placement fees. Ever.",
    includes: [
      "Verified badge — removes the \u201cNot Verified\u201d warning",
      "Direct family inquiries to your inbox",
      "Enhanced profile with photos, description, amenities",
      "Inspection response — your context next to every citation",
      "Priority placement in search",
      "Analytics dashboard",
    ],
    highlighted: !foundingAvailable,
    ctaLabel: "Remove my warning — $297/month",
  });

  tiers.push({
    id: "claim_monthly",
    name: "Claim",
    priceLabel: "$97/month",
    byline: "The basics, fast.",
    includes: [
      "Verified badge — removes the \u201cNot Verified\u201d warning",
      "Basic verified profile",
      "Respond to reviews publicly",
    ],
    ctaLabel: "Claim my listing — $97/month",
  });

  if (isMedicaidFacility) {
    tiers.push({
      id: "medicaid_monthly",
      name: "Medicare / Medicaid Listing",
      priceLabel: "$397/month",
      byline: "Built for facilities under reimbursement caps.",
      includes: [
        "Everything in Grow",
        "Priority placement in 'Accepts Medicare/Medicaid' filter",
        "Specialized support for government-payer operations",
      ],
      secondary: true,
      ctaLabel: "Get Listed — $397/month",
    });
  }

  const emailValid = adminEmail.includes("@") && adminEmail.length >= 6;
  const canCheckout = emailValid && acknowledged;

  return (
    <div className="space-y-8">
      {/* Admin-email + attestation — required before any CTA enables */}
      <div className="rounded-card border border-cs-border bg-white p-6">
        <h3 className="mb-1 font-sans text-base font-semibold text-cs-blue-dark">
          Before you claim
        </h3>
        <p className="mb-4 text-sm text-cs-muted">
          Two quick things. We need a working email to send your dashboard
          login, and we need you to confirm you&apos;re authorized to manage
          this facility.
        </p>

        <label className="label mb-1 block text-cs-blue-dark">
          Your work email
        </label>
        <input
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder={`you@${sanitizeDomain(facilityName)}.com`}
          autoComplete="email"
          required
          className="w-full rounded-btn border border-cs-border bg-white px-4 py-3 text-sm text-cs-body outline-none focus:border-cs-blue focus:ring-2 focus:ring-cs-blue/10"
        />
        <p className="mt-1 text-xs text-cs-muted">
          We&apos;ll pre-fill this at Stripe Checkout and send your
          dashboard login link to this address after payment.
        </p>

        <label className="mt-4 flex items-start gap-3 text-sm text-cs-body">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-cs-border text-cs-blue accent-cs-blue"
          />
          <span>
            I&apos;m authorized to manage{" "}
            <strong className="text-cs-blue-dark">{facilityName}</strong>.
            I understand that claiming a facility I don&apos;t own or operate
            is grounds for immediate refund and account termination.
          </span>
        </label>
      </div>

      {/* Tier cards */}
      <div
        className={`grid gap-4 ${
          tiers.length === 2
            ? "md:grid-cols-2"
            : tiers.length === 3
              ? "md:grid-cols-3"
              : "md:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {tiers.map((t) => (
          <TierCard
            key={t.id}
            tier={t}
            facilityId={facilityId}
            adminEmail={adminEmail}
            enabled={canCheckout}
          />
        ))}
      </div>

      {!canCheckout && (
        <p className="text-center text-xs text-cs-muted">
          Fill in your email + check the authorization box to enable
          checkout.
        </p>
      )}
    </div>
  );
}

function TierCard({
  tier,
  facilityId,
  adminEmail,
  enabled,
}: {
  tier: Tier;
  facilityId: string;
  adminEmail: string;
  enabled: boolean;
}) {
  const baseCard = "rounded-card p-6 flex flex-col";
  const containerClass = tier.highlighted
    ? `${baseCard} border-2 border-cs-lavender bg-cs-lavender-mist relative`
    : tier.secondary
      ? `${baseCard} border border-cs-border bg-white/60`
      : `${baseCard} border border-cs-border bg-white`;

  return (
    <div className={containerClass}>
      {tier.highlighted && (
        <span className="absolute -top-3 left-6 rounded-full bg-cs-lavender px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          {tier.id === "founding_monthly" ? "Limited" : "Recommended"}
        </span>
      )}

      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-display text-xl text-cs-blue-dark">{tier.name}</h3>
        <p className="text-xl font-semibold text-cs-blue-dark">
          {tier.priceLabel}
        </p>
      </div>
      <p className="mb-4 text-xs uppercase tracking-wide text-cs-muted">
        {tier.byline}
      </p>

      <ul className="mb-6 flex-1 space-y-2">
        {tier.includes.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-cs-body"
          >
            <span
              className={`mt-1.5 inline-block h-[7px] w-[7px] shrink-0 rounded-full ${
                tier.highlighted ? "bg-cs-lavender" : "bg-cs-green-ok"
              }`}
            />
            {item}
          </li>
        ))}
      </ul>

      <StripeButton
        plan={tier.id}
        facilityId={facilityId}
        adminEmail={adminEmail}
        disabled={!enabled}
        className={
          tier.highlighted
            ? "block w-full rounded-btn bg-cs-blue px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark"
            : "block w-full rounded-btn border border-cs-blue bg-white px-6 py-3 text-center text-sm font-medium text-cs-blue transition-colors hover:bg-cs-blue hover:text-white"
        }
      >
        {enabled ? tier.ctaLabel : "Fill in email + authorization first"}
      </StripeButton>
    </div>
  );
}

function sanitizeDomain(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 18) || "example"
  );
}
