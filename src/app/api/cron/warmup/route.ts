import { NextRequest, NextResponse } from "next/server";
import { unsubscribeUrl } from "@/lib/unsubscribe-token";

/**
 * Domain warmup cron — sends 10 varied emails per day from
 * hello@comfyseniors.com to a single recipient to build Resend
 * sender reputation before the real outreach campaign launches.
 *
 * Triggered daily by Vercel Cron (see vercel.json).
 * Protected by CRON_SECRET env var.
 */

const WARMUP_RECIPIENT = "brandol.monter@gmail.com";
const EMAILS_PER_DAY = 10;

// Varied subject lines — rotates to avoid looking like bulk mail
const SUBJECT_TEMPLATES = [
  "Quick update from the ComfySeniors team",
  "Weekly product notes",
  "New facility data imported this week",
  "How we track inspection deficiencies",
  "Behind the scenes at ComfySeniors",
  "Why transparency matters in senior care",
  "Data source notes — CMS update",
  "Feature recap: value score explained",
  "Monthly engineering log",
  "What families asked us this week",
  "Notes on our referral program",
  "A short read on pricing transparency",
  "Dev diary: the AI answer engine",
  "Inspection timelines — a quick primer",
  "How we calculate county benchmarks",
  "Site reliability update",
  "A walk-through of the verified badge",
  "Care Match Quiz — small improvements",
  "Honest reflections from the team",
  "Thinking about what families need most",
];

// Short varied bodies — plaintext, conversational, no marketing language
const BODY_TEMPLATES = [
  `Hey,

Just a quick note from the ComfySeniors side of things. We've been refining
how inspection deficiencies are summarized — the raw CMS data is dense and
hard for families to parse, so we're working on plain-English summaries.

More soon.

— The ComfySeniors team`,

  `Hi,

Notes from this week: imported a fresh batch of facility data from CMS,
refreshed our county pricing benchmarks, and fixed a small display bug on
the facility cards. Nothing exciting to share publicly yet.

Talk soon,
ComfySeniors`,

  `Good morning,

Reading "The Checklist Manifesto" on the train this week. The argument —
that checklists catch what memory and expertise don't — applies directly to
touring a senior care facility. Might turn it into a blog post.

— Team ComfySeniors`,

  `Hey,

A family asked us last week how to verify a facility's staffing ratio
independently. The honest answer: CMS publishes this data, but it takes
about 4 clicks to find. We're making it one click from the facility page.

Short update, nothing urgent.

ComfySeniors`,

  `Hi,

Interesting data point: facilities with RN turnover above 60% have, on
average, 2.3x more serious-harm citations than facilities under 30%. We
surface RN turnover on every profile. Families deserve to see this.

— ComfySeniors team`,

  `Hey there,

The Care Match Quiz got a small copy edit — less jargon, more direct
language. Still ten questions, still takes under three minutes.

Cheers,
ComfySeniors`,

  `Hi,

Had a long conversation yesterday about what "verified" should actually
mean. Our position: a facility is verified when they've claimed their
listing and confirmed ownership, period. No pay-to-play.

Back to building.

— Team ComfySeniors`,

  `Good afternoon,

Quick one: we refreshed the sitemap generation to include all 20,000+
facility pages. Google should pick up the new structure within a week.

That's it for today.

ComfySeniors`,

  `Hey,

Reading through CMS deficiency records is depressing work, but it's the
most valuable thing we do. Every citation we surface is one question a
family doesn't have to think to ask.

— The ComfySeniors team`,

  `Hi,

Thinking about how to present staff turnover without overwhelming readers.
Current version: a two-number summary (RN + total) with a color-coded
comparison to the state average. Trying a few variations this week.

More soon.

ComfySeniors`,

  `Hey,

Family feedback we got yesterday: "I wish I'd seen the inspection
timeline before signing the contract." That's exactly what we built
inspection timelines for. Validating signal.

— Team ComfySeniors`,

  `Hi,

Domain-registration paperwork is a slog. Counting down to the LLC being
finalized so we can flip Stripe to live and start accepting facility
subscriptions properly.

Talk soon.
ComfySeniors`,

  `Good morning,

We added hospice to our directory last month and coverage is already
solid across the Northeast. Hospice is an under-served vertical for
directory data — most comparison tools skip it entirely.

— ComfySeniors team`,

  `Hey there,

Small rant: the phrase "luxury senior living" is meaningless. It
correlates weakly with staffing, not at all with clinical outcomes, and
strongly with price. We're trying to reward substance, not marketing.

Back to work,
ComfySeniors`,

  `Hi,

A quick thank-you note to everyone who's shared the site with a friend
or family member. Organic word-of-mouth is doing more for us than any
paid channel could.

Cheers,
The ComfySeniors team`,

  `Hey,

Tweaked the homepage hero copy today — less clever, more direct. "Find
senior care with real prices and honest inspection data." If the value
prop fits in one sentence, use one sentence.

— ComfySeniors`,

  `Hi,

Notes from a call with a geriatric care manager: families routinely
shortlist facilities based on tour vibes and forget to look at citation
history. We're trying to flip that default.

Short update.
ComfySeniors team`,

  `Hey,

Adding a "tour questions" section to every facility page — a printable
list of 12 questions worth asking, personalized based on that facility's
recent citations. Launching next week.

More soon,
ComfySeniors`,

  `Good afternoon,

Refactored the search results page this morning. Faster, cleaner,
filters work on mobile now. Nothing families will notice, but the code
is a lot healthier.

— ComfySeniors team`,

  `Hi,

End-of-week note: 4,164 facility emails collected, 16,310 to go.
Slow and steady.

Talk soon.
ComfySeniors`,
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest) {
  // Auth — Vercel Cron sends a Bearer token matching CRON_SECRET
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  // Warmup is part of the cold-outreach reputation pipeline — always
  // send from the outreach FROM, never the transactional one.
  const fromEmail =
    process.env.RESEND_FROM_EMAIL_OUTREACH || "hello@comfyseniors.com";

  if (!resendKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured" },
      { status: 500 }
    );
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  const results: { ok: boolean; subject: string; error?: string }[] = [];
  const usedSubjects = new Set<string>();
  const usedBodies = new Set<number>();

  for (let i = 0; i < EMAILS_PER_DAY; i++) {
    // Pick unique subject + body each iteration
    let subject = pickRandom(SUBJECT_TEMPLATES);
    let guard = 0;
    while (usedSubjects.has(subject) && guard++ < 20) {
      subject = pickRandom(SUBJECT_TEMPLATES);
    }
    usedSubjects.add(subject);

    let bodyIdx = Math.floor(Math.random() * BODY_TEMPLATES.length);
    guard = 0;
    while (usedBodies.has(bodyIdx) && guard++ < 20) {
      bodyIdx = Math.floor(Math.random() * BODY_TEMPLATES.length);
    }
    usedBodies.add(bodyIdx);
    const body = BODY_TEMPLATES[bodyIdx];

    try {
      // Build List-Unsubscribe headers if the secret is configured.
      // If not, warmup still sends — but WITHOUT matching production's
      // header pattern, so you lose some reputation-building value.
      const headers: Record<string, string> = {};
      try {
        const unsubUrl = unsubscribeUrl(WARMUP_RECIPIENT);
        headers["List-Unsubscribe"] =
          `<${unsubUrl}>, <mailto:unsubscribe@comfyseniors.com?subject=unsubscribe>`;
        headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
      } catch {
        // UNSUBSCRIBE_SECRET not set — send without headers rather than fail
      }

      await resend.emails.send({
        from: `ComfySeniors <${fromEmail}>`,
        to: WARMUP_RECIPIENT,
        subject,
        text: body,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });
      results.push({ ok: true, subject });
    } catch (err) {
      results.push({
        ok: false,
        subject,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    // Spread sends over ~3-5 seconds (small jitter between each)
    if (i < EMAILS_PER_DAY - 1) {
      await sleep(300 + Math.floor(Math.random() * 400));
    }
  }

  const sentOk = results.filter((r) => r.ok).length;
  return NextResponse.json({
    ok: true,
    sent: sentOk,
    failed: EMAILS_PER_DAY - sentOk,
    results,
  });
}
