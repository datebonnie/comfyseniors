"use client";

import { useEffect, useState } from "react";

interface ViewCounterProps {
  facilityId: string;
  isVerified: boolean;
  /** From facilities.citation_count — used to diagnose "why families skip" */
  citationCount: number;
  /** True if photos[] has at least one entry */
  hasPhotos: boolean;
  /** True if description is non-empty and >= ~80 chars (enough for a real paragraph) */
  hasDescription: boolean;
  /** True if price_min is set (families care about affordability signals) */
  hasPrice: boolean;
  /** True if phone is set — direct-contact is the #1 family conversion action */
  hasPhone: boolean;
}

/**
 * Facility-page engagement widget — deliberately sells a leverage
 * narrative to operators who see their own listing.
 *
 * Two display modes, both grounded in real data:
 *
 *  HIGH SIGNAL (≥25 views/month)
 *    Qualitative band labels — "moderate interest" / "frequent interest."
 *    Positive social proof for families browsing.
 *
 *  LOW SIGNAL (<25 views/month)
 *    "Low engagement" framing + up to 3 specific, diagnosed reasons
 *    families skip the page, pulled from the actual facility row:
 *      • Not verified
 *      • Unanswered state citations
 *      • Missing photos / description / pricing / phone
 *    Each reason is real and fixable by claiming + upgrading the
 *    listing, which is the leverage an operator sees on a sales call:
 *    "This is what families see on your page right now. Fix these."
 *
 * Both modes honor the /trust promise — nothing is fabricated.
 * Real /api/views tracking still fires so internal analytics remain
 * accurate.
 */

const MODERATE_THRESHOLD = 25;
const FREQUENT_THRESHOLD = 75;

function interestLabel(views: number): string {
  if (views >= FREQUENT_THRESHOLD)
    return "This facility gets frequent interest from families.";
  return "This facility gets moderate interest from families.";
}

interface Diagnosis {
  label: string;
  /** Short weighting for sort order; higher = shown first */
  priority: number;
}

function diagnoseReasons(props: ViewCounterProps): Diagnosis[] {
  const reasons: Diagnosis[] = [];

  if (!props.isVerified) {
    reasons.push({
      label:
        "The page shows a \u201cNot Verified\u201d warning — families see this first.",
      priority: 100,
    });
  }

  if (props.citationCount > 0) {
    // If unverified, the operator can't respond publicly — that's the
    // whole problem. If verified but citations outstanding, it's that
    // they haven't posted a response yet. Either way, the citation is
    // unexplained from the family's perspective.
    const label = props.isVerified
      ? `${props.citationCount} state citation${props.citationCount === 1 ? "" : "s"} with no public response from the facility.`
      : `${props.citationCount} state citation${props.citationCount === 1 ? "" : "s"} with no explanation.`;
    reasons.push({ label, priority: 90 });
  }

  if (!props.hasPhotos) {
    reasons.push({
      label: "No photos on the profile.",
      priority: 70,
    });
  }

  if (!props.hasDescription) {
    reasons.push({
      label: "No detailed description of the community.",
      priority: 60,
    });
  }

  if (!props.hasPrice) {
    reasons.push({
      label: "No pricing information shown.",
      priority: 50,
    });
  }

  if (!props.hasPhone) {
    reasons.push({
      label: "No direct phone contact listed.",
      priority: 40,
    });
  }

  return reasons.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

export default function ViewCounter(props: ViewCounterProps) {
  const { facilityId, isVerified } = props;
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Fire-and-forget real-view tracking for internal analytics.
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facilityId }),
    }).catch(() => {});

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    fetch(`/api/views?facilityId=${facilityId}&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.count === "number") setViews(data.count);
        else setViews(0); // treat "no data" as zero rather than keep spinning
      })
      .catch(() => setViews(0));
  }, [facilityId]);

  // Avoid flash-on-load — wait until the real count resolves.
  if (views === null) return null;

  // ─── HIGH SIGNAL ───────────────────────────────────────────
  if (views >= MODERATE_THRESHOLD) {
    return (
      <div
        className={`rounded-btn p-3 text-center ${
          isVerified
            ? "border border-cs-border bg-cs-lavender-mist"
            : "border border-cs-amber-warn/30 bg-[#FEF3C7]"
        }`}
      >
        <p
          className={`text-sm font-medium ${
            isVerified ? "text-cs-blue-dark" : "text-[#92400E]"
          }`}
        >
          {interestLabel(views)}
        </p>
        {!isVerified && (
          <p className="mt-1 text-[10px] font-medium text-[#92400E]">
            Every family who visited saw the &ldquo;Not Verified&rdquo;
            warning.
          </p>
        )}
      </div>
    );
  }

  // ─── LOW SIGNAL — diagnostic leverage frame ────────────────
  const reasons = diagnoseReasons(props);

  // Edge case: verified facility with complete data and still low
  // traffic. No reasons list to show. Render a neutral "still
  // building" message rather than silence.
  if (reasons.length === 0) {
    return (
      <div className="rounded-btn border border-cs-border bg-cs-lavender-mist p-3 text-center">
        <p className="text-sm font-medium text-cs-blue-dark">
          Family interest is still building for this listing.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-btn border border-cs-amber-warn/40 bg-[#FEF3C7] p-4">
      <div className="flex items-start gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          stroke="#92400E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        >
          <path d="M10 9v4M10 17h.01" />
          <path d="M8.57 3.22L1.5 15a2 2 0 001.72 3h13.56a2 2 0 001.72-3L11.43 3.22a2 2 0 00-2.86 0z" />
        </svg>
        <p className="text-sm font-semibold text-[#92400E]">
          Low engagement from families.
        </p>
      </div>

      <p className="mt-2 text-xs text-[#92400E]">
        Top reasons families skip listings like this one:
      </p>

      <ul className="mt-2 space-y-1.5">
        {reasons.map((r) => (
          <li
            key={r.label}
            className="flex items-start gap-2 text-xs leading-snug text-[#7C2D12]"
          >
            <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-[#92400E]" />
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
