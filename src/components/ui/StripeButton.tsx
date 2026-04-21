"use client";

import { useState } from "react";

interface StripeButtonProps {
  plan:
    | "verified_monthly"
    | "verified_annual"
    | "medicaid_monthly"
    | "claim_monthly"
    | "founding_monthly";
  /**
   * Required — the facility being claimed. Without this the checkout
   * API returns 400 and the webhook has nothing to link the payment to.
   * Pre-onboarding-sprint the button passed null; that silently
   * broke every real payment. Now enforced at the type level too.
   */
  facilityId: string;
  adminEmail?: string;
  /** Externally-controlled disable (e.g., claim-form incomplete). */
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function StripeButton({
  plan,
  facilityId,
  adminEmail,
  disabled = false,
  className = "",
  children,
}: StripeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (disabled) return;
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, facilityId, adminEmail }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Unable to start checkout. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {loading ? "Redirecting..." : children}
    </button>
  );
}
