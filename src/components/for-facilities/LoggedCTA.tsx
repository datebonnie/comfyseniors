"use client";

import { useState } from "react";
import type { EngagementEventType } from "@/lib/engagement";

/**
 * Wraps a Stripe checkout CTA so a click logs an engagement event
 * before navigating. Uses the shared /api/engagement/log endpoint so
 * the event list stays honest.
 *
 * Why a wrapper and not a hook inside StripeButton?
 *   - StripeButton is plan-typed (verified_monthly, etc.) and we want
 *     to log a different event_type per plan
 *   - Wrapping keeps StripeButton dumb + reusable
 *   - The event is logged FIRST, then we let the child button's
 *     native onClick (Stripe redirect) run normally. Keepalive fetch
 *     makes this safe even when the page is navigating.
 */
export default function LoggedCTA({
  eventType,
  metadata,
  children,
}: {
  eventType: EngagementEventType;
  metadata?: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const [logged, setLogged] = useState(false);

  function handleClickCapture() {
    if (logged) return; // avoid double-logging on a mis-click
    setLogged(true);
    fetch("/api/engagement/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: eventType, metadata: metadata ?? {} }),
      keepalive: true,
    }).catch(() => {});
  }

  // onClickCapture fires during the capture phase, before the child's
  // own onClick — guarantees we log before Stripe redirect starts.
  return <div onClickCapture={handleClickCapture}>{children}</div>;
}
