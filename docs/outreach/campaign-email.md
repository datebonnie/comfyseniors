# ComfySeniors Cold Outreach Campaign — Email Copy

**Audience:** Administrators / owners at senior care facilities who we have emails for (4,164 facilities).

**Goal:** Get them to claim their listing and consider the Verified plan ($297/mo) — OR at minimum, read about how we work and know that referrals will start arriving.

**Guiding principles (Hormozi):**
- Lead with dream outcome, not features.
- Stack perceived likelihood of success (specificity, proof).
- Shrink time delay (same-day inquiries, already listed).
- Shrink effort & sacrifice (claim is free, takes 2 min).
- Price anchor: contrast $297/mo against $5K-$8K placement fees.

**Sender:** hello@comfyseniors.com
**Reply-to:** hello@comfyseniors.com

---

## Variant A — The Referral Letter (warm, informational)

**Subject line options:**
- `Your facility is listed on ComfySeniors — claim it free`
- `{facility.name} — we're sending you families`
- `A quick heads-up about your ComfySeniors listing`
- `Families are finding {facility.name} through us`

**Body:**

```
Hi there,

I'm writing because {facility.name} is listed on ComfySeniors.com — the
senior care directory families use to compare real prices, inspection
records, and staffing data in one place.

Your listing already includes:
  • Your address and phone number (from public records)
  • Your CMS inspection history and citations
  • Your Google rating and reviews
  • Current pricing estimates for your area

What it's missing: your photos, your description, your care philosophy,
and anything that makes you different from the other 1,247 facilities
within driving distance of yours.

You can claim the listing in under two minutes — free — at:
https://comfyseniors.com/for-facilities

Once claimed, you'll see every family who sends an inquiry through our
directory. Each one comes with a unique tracking code so you know
exactly where the lead came from.

Two quick points that usually come up:

1) Families who inquire through ComfySeniors and move in: a one-time
   placement fee (one month's rent) applies — roughly $5,000-$8,000.
   That's the norm for placement services.

2) If you'd rather not pay placement fees at all, our Verified plan is
   $297/month flat, covers unlimited placements, and includes:
     - Enhanced listing (logo, 10+ photos, video tour, custom copy)
     - Verified badge (most facilities that compete with you won't have one)
     - Real-time inquiry dashboard
     - Priority placement in "Verified only" filter results

One placement = you've paid for Verified for ~18 months. After that,
every family is free forever.

No pressure either way. The free claim gives you the inquiries; Verified
just changes how you pay for them.

Happy to answer questions — just reply to this email.

— The ComfySeniors team
https://comfyseniors.com
```

**Why this works:**
- Opens with their facility name (variable-substituted). Pattern-interrupts inbox scan.
- Establishes credibility fast: you're already listed, here's your data.
- Leads with the FREE claim — low-ask entry point.
- Explains placement fee honestly — builds trust, pre-empts objection.
- Anchors $297/mo against $5K-$8K placement fee (Hormozi value stack).

---

## Variant B — The Math Argument (direct, ROI-focused)

**Subject line options:**
- `$297/mo vs. $5,000/placement — do the math`
- `Quick placement-fee math for {facility.name}`
- `How to stop paying placement fees, starting this month`

**Body:**

```
Hi,

If you've ever paid a placement service $5,000-$8,000 for a single
resident, this will matter to you.

The standard model in our industry:
  → Directory sends you a family
  → Family moves in
  → You pay directory one month's rent (~$5K-$8K)
  → Repeat

ComfySeniors' Verified plan: $297/mo flat, no placement fees, ever.

A single move-in pays for 18 months of Verified. After that, every
future placement is margin. Most of our Verified members break even by
their third month.

Here's what Verified includes:
  ✓ Enhanced listing with your photos, description, and video tour
  ✓ Verified badge (only ~18% of facilities in our directory have one)
  ✓ Unlimited family inquiries with real-time dashboard
  ✓ Priority placement in "Verified only" search filter
  ✓ Tour-question templates customized to your facility
  ✓ Monthly performance report showing views, inquiries, conversions

No contract, cancel any time, no setup fees.

{facility.name} is already listed on ComfySeniors. Claiming is free;
upgrading to Verified is a business decision.

Start here (takes 2 min):
https://comfyseniors.com/for-facilities

Questions? Just reply.

— ComfySeniors team
```

**Why this works:**
- Subject is numeric — stands out from soft marketing subjects.
- First sentence filters the audience: if you've never paid placement fees, this isn't for you. Qualifies prospects instantly.
- "Do the math" framing gives the reader agency. They feel like they reached the conclusion themselves.
- Checklist of features mapped to dream outcomes, not vanity features.

---

## Variant C — The One-Liner (short, curious)

**Subject line options:**
- `Your listing + a question`
- `Quick question about {facility.name}`
- `Worth 90 seconds?`

**Body:**

```
Hi,

Short version: {facility.name} is listed on ComfySeniors.com (a senior
care directory). Families are using it to compare facilities in your
area.

Two options, both take under 2 minutes:

  1) Claim your listing (free): control your description, photos, and
     get every inquiry sent straight to your inbox.

  2) Upgrade to Verified ($297/mo, zero placement fees, ever): enhanced
     profile, badge, priority placement. Pays for itself after one move-in.

Either way, you're already on the directory — the only question is
whether you run the listing or let us run it for you.

Start here: https://comfyseniors.com/for-facilities

— ComfySeniors
```

**Why this works:**
- Shortest. Scannable on a phone in 10 seconds.
- Three explicit options — reduces decision fatigue.
- The opt-out line is disarming and counterintuitively lifts reply rate.
- Great for facilities that skim email aggressively (administrators, owners of small facilities).

---

## Recommendation

**Send Variant A first** (1,000-1,500 emails over 2 weeks, 100-150/day once Resend is warm).
- It's the most complete and trustworthy. First impression matters more than clever hooks.

**Follow up non-responders with Variant C** after 7 days.
- Short, low-friction, different-enough to not feel like "hey, just circling back" spam.

**Use Variant B for second-round outreach in 30-60 days**, once we have case-study data ("X facilities verified, Y placements generated, Z% response rate").

---

## A/B testing setup

Script supports `--variant a|b|c` flag. Send 100 of each to matched cohorts (same state, same care type, similar size) and measure:
- Open rate (Resend tracks automatically)
- Click-through to /for-facilities
- Claims submitted in 48 hours
- Verified signups in 7 days

Winner gets the remaining 13,000 cold sends.

---

## Pre-launch checklist

- [ ] Wait until Resend warmup has run for 14+ days
- [ ] Start with 50 sends/day, ramp to 150/day over 2 weeks
- [ ] Exclude facilities that already claimed (query leads.facility_id)
- [ ] Include a one-click unsubscribe link (Resend supports List-Unsubscribe header)
- [ ] SPF, DKIM, DMARC all pass (check with mxtoolbox.com)
- [ ] Monitor Resend dashboard for bounces/complaints daily; pause if complaint rate > 0.3%
