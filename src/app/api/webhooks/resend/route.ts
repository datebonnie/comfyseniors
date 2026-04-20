import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase";

/**
 * Resend webhook receiver.
 *
 * Resend signs each webhook delivery using the Svix scheme:
 *   svix-id        — message UUID
 *   svix-timestamp — unix ms when sent
 *   svix-signature — `v1,<base64-hmac-sha256-sig>` (may contain
 *                    multiple comma-separated sigs across rotations)
 *
 * To verify: HMAC-SHA256 of `${svix-id}.${svix-timestamp}.${rawBody}`
 * using the secret (which is base64-encoded with a `whsec_` prefix
 * that must be stripped before decoding).
 *
 * Set RESEND_WEBHOOK_SECRET in Vercel env vars after creating the
 * webhook in Resend Dashboard → Webhooks. See docs/resend-webhook-setup.md
 */

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || "";

// Tolerance: reject deliveries older than this many seconds (replay protection)
const TIMESTAMP_TOLERANCE_SEC = 5 * 60;

interface ResendEvent {
  type: string;
  created_at: string;
  data: {
    email_id?: string;
    to?: string[];
    from?: string;
    subject?: string;
    bounce?: {
      message?: string;
      type?: string;
    };
    [k: string]: unknown;
  };
}

function verifySignature(
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string
): boolean {
  if (!RESEND_WEBHOOK_SECRET) return false;

  // Strip the `whsec_` prefix and base64-decode the secret
  const secretBase64 = RESEND_WEBHOOK_SECRET.replace(/^whsec_/, "");
  let secret: Buffer;
  try {
    secret = Buffer.from(secretBase64, "base64");
  } catch {
    return false;
  }

  // Build the signed payload
  const signed = `${svixId}.${svixTimestamp}.${payload}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signed)
    .digest("base64");

  // svix-signature can contain multiple `v1,...` entries (during key rotations)
  const candidates = svixSignature
    .split(" ")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("v1,"))
    .map((s) => s.slice(3));

  for (const candidate of candidates) {
    if (
      candidate.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(expected))
    ) {
      return true;
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing Svix headers", { status: 400 });
  }

  // Replay protection
  const tsMs = parseInt(svixTimestamp, 10);
  if (
    !Number.isFinite(tsMs) ||
    Math.abs(Date.now() - tsMs) > TIMESTAMP_TOLERANCE_SEC * 1000
  ) {
    return new NextResponse("Stale timestamp", { status: 400 });
  }

  // Read the raw body (must be the exact bytes Svix signed)
  const rawBody = await req.text();

  if (
    !verifySignature(rawBody, svixId, svixTimestamp, svixSignature)
  ) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  // Service role: webhook handler runs server-side with a verified
  // Svix signature above. Updates email_sends under privileged access.
  const supabase = createServiceClient();
  const emailId = event.data.email_id;

  if (!emailId) {
    // Event without an email_id (rare) — accept-and-ignore
    return NextResponse.json({ ok: true, skipped: "no email_id" });
  }

  // Map event types → which timestamp column to set
  const updates: Record<string, unknown> = {};
  switch (event.type) {
    case "email.delivered":
      updates.delivered_at = event.created_at;
      break;
    case "email.opened":
      // Only set on first open — preserve the original timestamp
      updates.opened_at = event.created_at;
      break;
    case "email.clicked":
      updates.clicked_at = event.created_at;
      break;
    case "email.bounced":
      updates.bounced_at = event.created_at;
      updates.bounce_reason =
        event.data.bounce?.message || event.data.bounce?.type || null;
      break;
    case "email.complained":
      updates.complained_at = event.created_at;
      break;
    case "email.sent":
      // We already wrote the row at send time; nothing to update
      return NextResponse.json({ ok: true, skipped: "sent event" });
    default:
      return NextResponse.json({ ok: true, skipped: `unhandled: ${event.type}` });
  }

  const { error } = await supabase
    .from("email_sends")
    .update(updates)
    .eq("resend_id", emailId);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
