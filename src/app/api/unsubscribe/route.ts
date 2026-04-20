import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

/**
 * Unsubscribe endpoint — handles both:
 *   1. GET /api/unsubscribe?e=...&t=... (redirect from /unsubscribe page)
 *   2. POST /api/unsubscribe?e=...&t=... with body "List-Unsubscribe=One-Click"
 *      (RFC 8058 one-click — Gmail, Yahoo, Apple Mail native unsubscribe button)
 *
 * Both verify the HMAC token before inserting into email_unsubscribes.
 *
 * IMPORTANT: This only prevents FUTURE marketing emails. It does NOT
 * remove the facility from the public directory.
 */

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function extractIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}

async function recordUnsubscribe(
  email: string,
  source: string,
  userAgent: string,
  ip: string
): Promise<{ ok: boolean; error?: string }> {
  // Service role: insert + subsequent row reads for idempotency.
  // The route already verifies an HMAC token before touching the DB.
  const supabase = createServiceClient();

  // Upsert on unique email — if already unsubscribed, silent success
  const { error } = await supabase
    .from("email_unsubscribes")
    .insert({
      email: email.trim().toLowerCase(),
      source,
      user_agent: userAgent.slice(0, 512),
      ip_hash: hashIp(ip),
    });

  if (error && error.code !== "23505") {
    // 23505 = unique_violation. Treat as success (already unsubscribed).
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/**
 * GET — called when the user clicks the link on the /unsubscribe page.
 * Verifies token, records, returns JSON so the page can render confirmation.
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("e");
  const token = req.nextUrl.searchParams.get("t");

  if (!email || !token) {
    return NextResponse.json(
      { ok: false, error: "Missing email or token." },
      { status: 400 }
    );
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.json(
      { ok: false, error: "Invalid token." },
      { status: 400 }
    );
  }

  const result = await recordUnsubscribe(
    email,
    "page-form",
    req.headers.get("user-agent") || "",
    extractIp(req)
  );

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email });
}

/**
 * POST — called by Gmail/Yahoo/Apple Mail when user clicks the native
 * "Unsubscribe" button above the email subject. Body per RFC 8058:
 *     List-Unsubscribe=One-Click
 *
 * Must succeed with no user interaction. Returns 200 on success/duplicate.
 */
export async function POST(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("e");
  const token = req.nextUrl.searchParams.get("t");

  if (!email || !token) {
    return new NextResponse("Missing parameters.", { status: 400 });
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return new NextResponse("Invalid token.", { status: 400 });
  }

  // Body should contain "List-Unsubscribe=One-Click" per RFC 8058, but some
  // mail clients send empty bodies. Accept either.
  const result = await recordUnsubscribe(
    email,
    "one-click",
    req.headers.get("user-agent") || "",
    extractIp(req)
  );

  if (!result.ok) {
    return new NextResponse(result.error || "Server error.", { status: 500 });
  }

  return new NextResponse("Unsubscribed.", { status: 200 });
}
