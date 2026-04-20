import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase";

/**
 * Controlled vocabulary for engagement_events.event_type. Keep this
 * in sync with the migration 013 comment. Any new event must be
 * added here so /staff/engagement filters and dashboards stay
 * coherent — no free-text event names sneaking in.
 */
export const ENGAGEMENT_EVENTS = [
  "facility_self_lookup",
  "cta_click_verified",
  "cta_click_claim",
  "cta_click_grow",
  "cta_click_founding",
  "cta_click_medicaid",
  "chain_form_submit",
] as const;

export type EngagementEventType = (typeof ENGAGEMENT_EVENTS)[number];

export function isValidEventType(s: string): s is EngagementEventType {
  return (ENGAGEMENT_EVENTS as readonly string[]).includes(s);
}

export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export function extractIpFromHeaders(headers: Headers): string | null {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    null
  );
}

interface LogEngagementArgs {
  event_type: EngagementEventType;
  facility_id?: string | null;
  metadata?: Record<string, unknown>;
  user_agent?: string | null;
  ip?: string | null;
}

/**
 * Insert a row into engagement_events. Best-effort — never throws;
 * tracking failures should never break a user-facing flow.
 */
export async function logEngagement(args: LogEngagementArgs): Promise<void> {
  try {
    // Service role bypasses RLS. This path is always server-side (API
    // route handlers + server actions), never hydrated to the browser.
    const supabase = createServiceClient();
    await supabase.from("engagement_events").insert({
      event_type: args.event_type,
      facility_id: args.facility_id ?? null,
      metadata: args.metadata ?? {},
      user_agent: args.user_agent?.slice(0, 512) ?? null,
      ip_hash: hashIp(args.ip ?? null),
    });
  } catch {
    // Silent failure by design. Engagement tracking is a signal, not a
    // critical path. If Supabase is flaky, the user still completes
    // whatever they were doing.
  }
}
