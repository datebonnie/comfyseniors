"use client";

import { useState } from "react";

interface StripeButtonProps {
  plan:
    | "verified_monthly"
    | "verified_annual"
    | "medicaid_monthly"
    | "claim_monthly";
  className?: string;
  children: React.ReactNode;
}

export default function StripeButton({
  plan,
  className = "",
  children,
}: StripeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, facilityId: null }),
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
      disabled={loading}
      className={`${className} disabled:opacity-50`}
    >
      {loading ? "Redirecting..." : children}
    </button>
  );
}
