import { NextRequest, NextResponse } from "next/server";
import {
  isValidEventType,
  logEngagement,
  extractIpFromHeaders,
} from "@/lib/engagement";

/**
 * Lightweight POST endpoint for client-side engagement tracking.
 *
 * Request body:
 *   { event_type: "cta_click_verified", facility_id?: "uuid", metadata?: {...} }
 *
 * Writes are best-effort (see lib/engagement.ts). Always returns ok:true
 * so callers don't need error branching for tracking failures.
 */
export async function POST(req: NextRequest) {
  let body: {
    event_type?: string;
    facility_id?: string;
    metadata?: Record<string, unknown>;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.event_type || !isValidEventType(body.event_type)) {
    return NextResponse.json(
      { ok: false, error: "Invalid or missing event_type" },
      { status: 400 }
    );
  }

  await logEngagement({
    event_type: body.event_type,
    facility_id: body.facility_id ?? null,
    metadata: body.metadata ?? {},
    user_agent: req.headers.get("user-agent"),
    ip: extractIpFromHeaders(req.headers),
  });

  return NextResponse.json({ ok: true });
}
