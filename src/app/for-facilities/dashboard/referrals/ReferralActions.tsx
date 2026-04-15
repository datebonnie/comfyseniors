"use client";

import { useState } from "react";
import { createFacilityReferral } from "@/app/actions/referral";

interface ReferralActionsProps {
  facilityId: string;
}

export default function ReferralActions({ facilityId }: ReferralActionsProps) {
  const [referredEmail, setReferredEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "creating" | "created">("idle");
  const [shareUrl, setShareUrl] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setStatus("creating");

    const result = await createFacilityReferral(
      facilityId,
      referredEmail || undefined
    );

    if (result.success && result.shareUrl && result.code) {
      setShareUrl(result.shareUrl);
      setCode(result.code);
      setStatus("created");
    } else {
      alert(result.error || "Failed to create referral.");
      setStatus("idle");
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  if (status === "created") {
    return (
      <div className="space-y-3">
        <div className="rounded-btn border border-cs-blue bg-white p-4">
          <p className="label mb-1 text-cs-lavender">Your referral link</p>
          <p className="break-all font-mono text-sm text-cs-blue-dark">
            {shareUrl}
          </p>
          <p className="mt-2 text-xs text-cs-muted">
            Code: <strong>{code}</strong>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 rounded-btn bg-cs-blue px-4 py-2 text-sm font-semibold text-white hover:bg-cs-blue-dark"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          <a
            href={`mailto:${referredEmail || ""}?subject=Join ComfySeniors — get 50% off your first month&body=Hey, I've been using ComfySeniors to get direct family leads. Use my referral link to get 50% off your first month:%0A%0A${encodeURIComponent(shareUrl)}%0A%0AIt's $297/month with zero placement fees. One bed filled pays for 20 months of membership.`}
            className="flex-1 rounded-btn border border-cs-border px-4 py-2 text-center text-sm font-medium text-cs-body hover:bg-cs-lavender-mist"
          >
            Send via email
          </a>
        </div>

        <button
          onClick={() => {
            setStatus("idle");
            setReferredEmail("");
            setShareUrl("");
            setCode("");
          }}
          className="text-xs text-cs-muted hover:text-cs-blue"
        >
          Generate another referral
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="email"
        value={referredEmail}
        onChange={(e) => setReferredEmail(e.target.value)}
        placeholder="Their email (optional — for tracking)"
        className="w-full rounded-btn border border-cs-border px-4 py-2.5 text-sm outline-none placeholder:text-cs-muted/60 focus:ring-2 focus:ring-cs-blue/10"
      />
      <button
        onClick={handleGenerate}
        disabled={status === "creating"}
        className="w-full rounded-btn bg-cs-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-cs-blue-dark disabled:opacity-50"
      >
        {status === "creating" ? "Generating..." : "Generate referral link"}
      </button>
    </div>
  );
}
