"use client";

import { useEffect, useState } from "react";

interface ViewCounterProps {
  facilityId: string;
  isVerified: boolean;
}

/**
 * Qualitative interest indicator for the facility profile page.
 *
 * Displays a label derived from real monthly view data in
 * facility_views. When view volume is too low to form an honest
 * signal, the widget renders nothing — better to say nothing than
 * to imply a level of interest the data doesn't support.
 *
 * Thresholds (per month):
 *   <  10  views  →  hidden, no signal yet
 *   10-24 views  →  "Families are viewing this listing"
 *   25-74 views  →  "This facility gets moderate interest from families"
 *   75+   views  →  "This facility gets frequent interest from families"
 *
 * The labels are intentionally fuzzy so a facility at 24 vs 25 vs 74
 * doesn't jump around — the band it sits in is what matters.
 *
 * For unverified facilities, the label is followed by the "Not
 * Verified warning" nudge so operators see the implied cost of
 * leaving their listing un-verified.
 */

const HIDE_BELOW = 10;

function interestLabel(views: number): string | null {
  if (views < HIDE_BELOW) return null;
  if (views < 25) return "Families are viewing this listing.";
  if (views < 75) return "This facility gets moderate interest from families.";
  return "This facility gets frequent interest from families.";
}

export default function ViewCounter({
  facilityId,
  isVerified,
}: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Record the view for real analytics — independent of what we
    // render. Fire-and-forget; tracking failures never surface.
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facilityId }),
    }).catch(() => {});

    // Fetch this month's real count. If the GET is down or the RLS
    // layer rejects, views stays null and the widget stays hidden.
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    fetch(`/api/views?facilityId=${facilityId}&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.count === "number") setViews(data.count);
      })
      .catch(() => {});
  }, [facilityId]);

  // Loading state: render nothing until the real count arrives.
  // Avoids flashing a label that might then disappear.
  if (views === null) return null;

  const label = interestLabel(views);

  // Below threshold — render nothing. Honest silence beats a weak signal.
  if (!label) return null;

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
        {label}
      </p>
      {!isVerified && (
        <p
          className={`mt-1 text-[10px] font-medium text-[#92400E]`}
        >
          Every family who visited saw the &ldquo;Not Verified&rdquo; warning.
        </p>
      )}
    </div>
  );
}
