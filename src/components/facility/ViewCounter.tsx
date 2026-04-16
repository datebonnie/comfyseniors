"use client";

import { useEffect, useState } from "react";

interface ViewCounterProps {
  facilityId: string;
  isVerified: boolean;
}

export default function ViewCounter({
  facilityId,
  isVerified,
}: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Record the view
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facilityId }),
    })
      .then((r) => r.json())
      .catch(() => {});

    // Fetch current month's view count
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    fetch(
      `/api/views?facilityId=${facilityId}&month=${month}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.count !== undefined) setViews(data.count);
      })
      .catch(() => {});
  }, [facilityId]);

  if (views === null) return null;

  return (
    <div
      className={`rounded-btn p-3 text-center ${
        isVerified
          ? "border border-cs-border bg-cs-lavender-mist"
          : "border border-cs-amber-warn/30 bg-[#FEF3C7]"
      }`}
    >
      <p
        className={`text-2xl font-semibold ${
          isVerified ? "text-cs-blue-dark" : "text-[#92400E]"
        }`}
      >
        {views.toLocaleString()}
      </p>
      <p
        className={`text-xs ${
          isVerified ? "text-cs-muted" : "text-[#92400E]"
        }`}
      >
        {views === 1 ? "family" : "families"} viewed this listing this month
      </p>
      {!isVerified && views > 0 && (
        <p className="mt-1 text-[10px] font-medium text-[#92400E]">
          All of them saw the &ldquo;Not Verified&rdquo; warning.
        </p>
      )}
    </div>
  );
}
