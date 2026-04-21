import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { computeOnboardingState } from "@/lib/onboarding";

/**
 * Daily cron — emails facility admins whose profile isn't fully set up
 * at the 48-hour and 7-day marks after their subscription started.
 *
 * Why two windows not continuous spam:
 *   - 48h: the "you paid, here's what you forgot" nudge. High intent,
 *     probably just distracted.
 *   - 7d:  the "it's been a week" nudge. If they still haven't
 *     finished, there's likely a block (confused about where to
 *     upload photos, technical friction). Second nudge is the
 *     offer-help escalation.
 *   - After 7d: stop. We don't turn this into a drip campaign — the
 *     honesty brand means we don't manipulate engagement.
 *
 * De-duplication uses engagement_events with event_type =
 * 'onboarding_nag_sent' and metadata.stage = '48h' | '7d'. We already
 * have this table so no new schema.
 *
 * Triggered daily by Vercel Cron (see vercel.json).
 * Protected by CRON_SECRET env var (same pattern as warmup cron).
 */

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = Date.now();

  // Widen the SQL range generously (1d-8d ago) so the cron catches
  // both stages on any schedule drift. Per-row classification below
  // does the exact stage assignment.
  const lowerBound = new Date(now - SEVEN_DAYS_MS - 24 * 60 * 60 * 1000);
  const upperBound = new Date(now - FORTY_EIGHT_HOURS_MS + 24 * 60 * 60 * 1000);

  // Pull verified facilities with active subscriptions — they're the
  // population we might nag. Featured_subscriptions started_at is the
  // clock we track off.
  const { data: subs } = await supabase
    .from("featured_subscriptions")
    .select("facility_id, started_at, plan, status")
    .eq("status", "active")
    .gte("started_at", lowerBound.toISOString())
    .lte("started_at", upperBound.toISOString());

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, candidates: 0, sent: 0 });
  }

  const results: { facility_id: string; stage: string; sent: boolean; reason?: string }[] = [];

  for (const sub of subs) {
    const startedAt = new Date(sub.started_at).getTime();
    const age = now - startedAt;

    // Decide stage (or skip)
    let stage: "48h" | "7d" | null = null;
    if (age >= SEVEN_DAYS_MS && age < SEVEN_DAYS_MS + 24 * 60 * 60 * 1000) {
      stage = "7d";
    } else if (
      age >= FORTY_EIGHT_HOURS_MS &&
      age < FORTY_EIGHT_HOURS_MS + 24 * 60 * 60 * 1000
    ) {
      stage = "48h";
    }

    if (!stage) continue;

    // Has this stage already been nagged for this facility?
    const { data: priorNag } = await supabase
      .from("engagement_events")
      .select("id")
      .eq("event_type", "onboarding_nag_sent")
      .eq("facility_id", sub.facility_id)
      .contains("metadata", { stage })
      .limit(1)
      .maybeSingle();

    if (priorNag) {
      results.push({ facility_id: sub.facility_id, stage, sent: false, reason: "already sent" });
      continue;
    }

    // Load facility + compute onboarding state
    const { data: facility } = await supabase
      .from("facilities")
      .select(
        "id, name, photos, description, amenities, price_min, price_max, phone, website, citation_count"
      )
      .eq("id", sub.facility_id)
      .maybeSingle();

    if (!facility) continue;

    const state = computeOnboardingState({
      facility,
      citationResponseCount: 0,
    });

    if (state.isComplete) {
      results.push({ facility_id: sub.facility_id, stage, sent: false, reason: "profile already complete" });
      continue;
    }

    // Look up admin email via facility_users → auth.users
    const { data: link } = await supabase
      .from("facility_users")
      .select("user_id")
      .eq("facility_id", sub.facility_id)
      .limit(1)
      .maybeSingle();

    if (!link) {
      results.push({ facility_id: sub.facility_id, stage, sent: false, reason: "no facility_users link" });
      continue;
    }

    const { data: userData } = await supabase.auth.admin.getUserById(
      link.user_id
    );
    const adminEmail = userData?.user?.email;
    if (!adminEmail) {
      results.push({ facility_id: sub.facility_id, stage, sent: false, reason: "no auth email" });
      continue;
    }

    // Send it
    const ok = await sendNagEmail({
      to: adminEmail,
      facilityName: facility.name,
      stage,
      completionPercent: state.completionPercent,
      pendingStepLabels: state.steps
        .filter((s) => !s.done)
        .map((s) => s.label)
        .slice(0, 4),
    });

    if (ok) {
      await supabase.from("engagement_events").insert({
        event_type: "onboarding_nag_sent",
        facility_id: sub.facility_id,
        metadata: { stage, completionPercent: state.completionPercent },
      });
    }

    results.push({ facility_id: sub.facility_id, stage, sent: ok });
  }

  const sent = results.filter((r) => r.sent).length;
  return NextResponse.json({
    ok: true,
    candidates: subs.length,
    sent,
    skipped: results.length - sent,
    details: results,
  });
}

async function sendNagEmail(args: {
  to: string;
  facilityName: string;
  stage: "48h" | "7d";
  completionPercent: number;
  pendingStepLabels: string[];
}): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return false;

  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "partners@comfyseniors.com";

  const subject =
    args.stage === "48h"
      ? `Quick nudge: ${args.facilityName}'s profile is ${args.completionPercent}% set up`
      : `A week in — anything blocking your ${args.facilityName} setup?`;

  const leadLine =
    args.stage === "48h"
      ? `Hey, quick nudge. You claimed ${args.facilityName} a couple of days ago. Your profile is ${args.completionPercent}% complete — here's what's left:`
      : `Hey, checking in. It's been a week since you claimed ${args.facilityName}. Your profile is at ${args.completionPercent}%. The remaining steps usually take 10 minutes; if something's blocking you, reply here and I'll help directly.`;

  const bullets = args.pendingStepLabels
    .map((label) => `  • ${label}`)
    .join("\n");

  const body = `Hi,

${leadLine}

${bullets}

Finish these and your listing converts at roughly 3x the rate of an unfinished one. Most of your competitors never get this far.

Dashboard: https://www.comfyseniors.com/for-facilities/dashboard

${
  args.stage === "7d"
    ? `Reply to this email if you're stuck on anything — comes straight to my inbox.`
    : `You'll get one more reminder at the one-week mark and then I'll stop. No drip-campaign spam from us.`
}

— Brandoll Montero, Founder
  ComfySeniors LLC
`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `ComfySeniors <${fromEmail}>`,
        to: args.to,
        reply_to: "bmontero@comfyseniors.com",
        subject,
        text: body,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
