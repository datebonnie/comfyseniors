# Trust & Credibility Sprint — Execution Plan

**Status: AWAITING APPROVAL. NO CODE WRITTEN YET.**

Reply **"approved"** (or with edits / answers to the open questions) and I will execute in the stated order. Until then, this file is the only thing that changes.

---

## TL;DR

| # | Item | Files | Risk |
|---|---|---|---|
| A | Engagement tracking table + helper | 2 new | Low |
| B | `/trust` page | 1 new | Low |
| C | `/for-chains` page + lead capture | 3 new, 1 schema | Low |
| D | `/for-facilities` widget additions (self-lookup, counter, "what we solved", dashboard preview) | 1 modified, 2-3 new components | Medium |
| E | Founding Member tier + Stripe plan | 2 modified, 1 schema | Medium |
| F | "Last verified" timestamps on facility pages | 2 modified, 1 schema, 1 script | Low |
| G | Technical trust signals (footer, legal, status link) | 3 modified | Low |
| H | `/staff/engagement` admin view | 1 new | Low |

**Total new files: ~11. Modified: ~12. Schema migrations: 3 (013, 014, 015).**

---

## Open questions (BLOCK execution until you answer)

1. **Dashboard preview on `/for-facilities` (Item #4).** I confirmed the dashboard is real and functional. It shows: facility header, 3 stat cards (total inquiries / pending conversions / confirmed move-ins), and 4 quick-action tiles (View inquiries, Edit profile, View public listing, Manage subscription). **Three options:**
   - **(a) Sanitized real screenshot:** I log in locally with a seeded test facility, take a screenshot, crop PII, check it into `public/dashboard-preview.png`. Most honest.
   - **(b) Hand-coded static preview HTML:** A fake dashboard matching the real one's layout, rendered inline. No external image. Renders faster, reads as a "preview" rather than a screenshot.
   - **(c) Live iframe:** Authenticity-max, but complex (auth, responsive) and you said no fabricated data, so if there's no live data yet, this is a mostly-empty dashboard. Probably not it.
   - **My pick: (b).** Safer than a screenshot (nothing to re-capture when the dashboard changes), honest in framing ("Here's what you'll see..."), no image asset to manage. Confirm.

2. **Founding Member price ID** (Item #3). Should I create the $197/mo Stripe product myself via the existing `scripts/setup_stripe_products.mjs` (just add a new plan entry), OR do you want to create it manually and paste the ID? Creating via the script is idempotent and keeps the Stripe catalog in one source of truth. **My pick: let me add it to the script.** Confirm.

3. **`/staff-login/engagement` URL typo.** Your spec says `/staff-login/engagement`, but the existing admin CRM lives at `/staff/*` (not `/staff-login/*` — `/staff/login` is just the login page). I'll put the new engagement view at `/staff/engagement` to match the existing routing pattern. Confirm or correct.

4. **LLC legal name footer text.** Spec says "ComfySeniors, LLC — a New Jersey limited liability company." Is the LLC actually filed yet? Last I heard you were still waiting on it. If not filed, I'll put a TODO comment in Privacy/Terms and flag it as a manual follow-up rather than putting incorrect legal text live.

5. **Verified-at vs. verification-counter "this month" semantics.** Item #2 says "verified this month." For the Supabase query I need a `facilities.verified_at` timestamp (doesn't exist yet — currently `is_verified` is a boolean with no associated date). I'll add that column and backfill existing `is_verified=true` rows with `updated_at` as a best-effort approximation. Any new verification going forward uses `now()`. Confirm this approach, or tell me how to handle the backfill if you disagree.

6. **Scope check: "Last verified" on facility pages (Item #7).** The `data_last_verified_at` column would need a script that sets it every time we run the CMS / DOH scraper. Current scrapers don't set this. I'll add the column + update the scrape scripts (`scripts/full_enrichment.py` + `scripts/import_cms_facilities.py`) to stamp it on every row touched. For the initial backfill, I'll use each facility's `updated_at`. Confirm.

---

## Execution order (after approval)

I'll execute in this order per your spec:

1. **Migration 013** — `engagement_events` table
2. **`/trust` page**
3. **`/for-chains` page** + migration 014 (`portfolio_leads`) + Resend email on submit
4. **`/for-facilities` additions** — self-lookup widget + verification counter + "what we solved" section + dashboard preview
5. **Founding Member tier** — migration 015 + Stripe script update + CTA logic + badge
6. **Timestamps on facility pages** — columns + scrape hooks + UI
7. **Technical signals** — footer, legal text, status page link
8. **`/staff/engagement` admin view** — final step since it reads everything from #1

Each step builds on the previous; running out of order risks compile errors.

---

## Detailed plan per item

### A — Engagement events table (prerequisite for 1, 10)

**New file:** `supabase/migrations/013_engagement_events.sql`
```sql
create table engagement_events (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null,           -- 'facility_self_lookup', 'cta_click_verified', 'chain_form_submit'
  facility_id uuid references facilities(id) on delete set null,
  metadata    jsonb default '{}'::jsonb,
  user_agent  text,
  ip_hash     text,                    -- sha256 truncated, not PII
  created_at  timestamptz default now()
);
create index idx_engagement_events_type_created on engagement_events (event_type, created_at desc);
create index idx_engagement_events_facility on engagement_events (facility_id)
  where facility_id is not null;
alter table engagement_events enable row level security;
-- Admin reads only, anon can insert (site-originated events)
create policy "admin reads engagement" on engagement_events for select to authenticated
  using ((auth.jwt() ->> 'email') = 'hello@comfyseniors.com');
create policy "anon inserts engagement" on engagement_events for insert to anon
  with check (true);
```

**New file:** `src/lib/engagement.ts`
- Single function `logEngagement(event_type, facilityId?, metadata?)` that wraps a Supabase insert with proper ip_hash + user_agent capture.
- Called from the widget, CTA buttons, and the chain form.

### B — `/trust` page

**New file:** `src/app/trust/page.tsx`
- Sections scaffolded per your spec:
  1. "Who runs ComfySeniors" — `<TODO: bio placeholder — user will fill>` with prop-style comment block
  2. "Where your data lives" — Next.js on Vercel, Supabase for DB, Stripe for billing, Resend for email, Plausible for analytics, UptimeRobot (or Better Stack) for status. Explained in plain language.
  3. "Our commitment" — 5 slots, scaffolded with TODO markers for your final copy
  4. "Security FAQ" — 5 questions per your suggestions (HIPAA + data sales + dashboard privacy + cancellation + hosting location)
  5. Simple footer cross-link back to `/for-facilities` + `/contact`
- `metadata` exports proper SEO tags; no `noindex`.
- Reading time: ~3 minutes.

**Modified:** `src/components/layout/Footer.tsx` — add "Trust" link to the Directory column.

### C — `/for-chains` page

**New file:** `src/app/for-chains/page.tsx` — server component with the form child.

**New file:** `src/app/for-chains/PortfolioLeadForm.tsx` — client component with the 6-field form:
- `chain_name` (text, required)
- `total_facilities_count` (number, required, min 25)
- `primary_state` (select: state 2-letter codes, required)
- `contact_name` (text, required)
- `contact_email` (email, required)
- `contact_phone` (tel, required)

**New file:** `src/app/actions/portfolio-lead.ts` — server action:
- Validate input (min 25 facilities enforced server-side too)
- Insert into `portfolio_leads` table
- Call Resend: to `hello@comfyseniors.com`, subject `[Portfolio Lead] <chain_name> — <facility_count> facilities`, body includes every field
- Log engagement event (`event_type = 'chain_form_submit'`)
- Return `{ ok: true }` / error
- No PII stored beyond what they explicitly volunteered. No phone of unsolicited family.

**New file:** `supabase/migrations/014_portfolio_leads.sql`
```sql
create table portfolio_leads (
  id                     uuid primary key default gen_random_uuid(),
  chain_name             text not null,
  total_facilities_count integer not null check (total_facilities_count >= 25),
  primary_state          text not null,
  contact_name           text not null,
  contact_email          text not null,
  contact_phone          text not null,
  status                 text default 'new',  -- new | contacted | qualified | signed | dead
  created_at             timestamptz default now()
);
create index idx_portfolio_leads_created on portfolio_leads (created_at desc);
alter table portfolio_leads enable row level security;
create policy "admin reads portfolio" on portfolio_leads for all to authenticated
  using ((auth.jwt() ->> 'email') = 'hello@comfyseniors.com');
create policy "anon submits portfolio" on portfolio_leads for insert to anon
  with check (true);
```

**Modified:** `src/components/layout/Footer.tsx` — add "For Chains" link under the "For Facilities" footer column.

**Page structure:**
- Hero: "25+ facilities? We build portfolio deals."
- Subhead: "One contract. One invoice. All your facilities, verified and saving you money."
- 3-bullet value prop (will use placeholder copy in the same voice as `/for-facilities`: bulk pricing / dedicated rep / unified dashboard — happy to swap for copy you provide)
- Form card
- Thank-you state after submit — "We'll reach out within 1 business day. Meanwhile, review our [trust page]."

**No pricing shown.** Explicit line: "Portfolio deals are custom-negotiated."

### D — `/for-facilities` widget additions

**Modified:** `src/app/for-facilities/page.tsx`

Insert 4 new blocks above and below the existing pitch:

1. **Self-lookup widget** (above "Right now, this is what families see when they find you" section):
   - Heading: "Already listed? See what families see."
   - Client-side autocomplete input that queries `/api/facilities/autocomplete?q=...` (new API route — see below)
   - On selection, opens `/facility/:slug` in new tab + fires engagement event
   - Shows "Can't find your facility? We might be missing it. [Email us]."

2. **Live verification counter** (above the main pitch, below the hero):
   - Server-rendered — runs the count query on every request
   - Two display modes:
     - If `count > 0`: "**[count] Bergen County facilities verified this month.** Most recent: [name, date], [name, date], [name, date]."
     - If `count == 0`: "**Founding Member program: first 20 Bergen County facilities get $197/month for life.** 0/20 claimed so far." (The count that powers this is `facilities` WHERE `subscription_tier='founding'`.)

3. **"What we've already solved"** (mid-page, between the comparison table and the pricing block):
   - 4-bullet scaffold with TODO markers for your final copy
   - Starter placeholder bullets (all TODO-marked for your replacement):
     - "Your facility data is already imported from the NJ DOH — no manual entry"
     - "Inquiry tracking works out of the box via unique reference codes"
     - "We track every lead so you can see which ones convert"
     - "Every payment runs through Stripe with zero setup on your end"

4. **Dashboard preview** (between pricing and bottom CTA):
   - Static HTML rendering that matches the real dashboard (option B from question #1)
   - Header line: "What you'll see after claiming:"
   - Sub-line: "Every Verified facility gets this dashboard. Sample data below."
   - Renders a realistic facility name + plausible numbers (e.g. "Harmony House Assisted Living" — clearly fake), the 3 stat cards, the 4 quick-action tiles.

**New file:** `src/app/api/facilities/autocomplete/route.ts`
- GET handler, takes `?q=...` (min 2 chars)
- Returns top 8 matches where `name ILIKE '%q%' AND county = 'Bergen'` (Bergen-scoped per the pivot)
- Only returns `id`, `name`, `city`, `slug`, `is_verified` — no PII

**New file:** `src/components/facility-lookup/SelfLookupWidget.tsx` — the client component (input + autocomplete dropdown + keyboard nav).

**New file:** `src/components/for-facilities/VerificationCounter.tsx` — server component with the two display modes.

**New file:** `src/components/for-facilities/DashboardPreview.tsx` — static preview (option B).

Every CTA button on `/for-facilities` (the three "Remove my warning" / "Claim my listing" buttons) gets wrapped with the engagement logger via a new lightweight `LoggedCTA.tsx` client component that calls `/api/engagement/log` before redirecting.

### E — Founding Member tier + Stripe plan

**New file:** `supabase/migrations/015_subscription_tier.sql`
```sql
alter table facilities
  add column if not exists subscription_tier text;  -- 'founding' | 'verified' | 'claim' | 'medicaid' | null
alter table facilities
  add column if not exists verified_at timestamptz;
-- Backfill: facilities already is_verified get their updated_at as verified_at (best-effort)
update facilities set verified_at = updated_at where is_verified = true and verified_at is null;
create index if not exists idx_facilities_tier on facilities (subscription_tier);
create index if not exists idx_facilities_verified_at on facilities (verified_at desc)
  where is_verified = true;
```

**Modified:** `scripts/setup_stripe_products.mjs` — add a 4th plan entry:
```js
{
  productName: "ComfySeniors Founding Member",
  productDescription: "Founding Member pricing — first 20 Bergen County facilities. Locks in $197/month for life of subscription.",
  prices: [{
    envVar: "STRIPE_FOUNDING_MONTHLY_PRICE_ID",
    lookupKey: "comfyseniors_founding_monthly",
    amountCents: 19700,
    interval: "month",
    nickname: "Founding Monthly ($197/mo)",
  }],
}
```

**Modified:** `src/app/api/stripe/checkout/route.ts` — add `founding_monthly` to the PLANS map, mapped to `STRIPE_FOUNDING_MONTHLY_PRICE_ID`.

**Modified:** `src/components/ui/StripeButton.tsx` — widen the plan union to include `"founding_monthly"`.

**Modified:** `src/app/for-facilities/page.tsx` — dynamically show/hide the Founding tier:
- Server-rendered count of `facilities` WHERE `subscription_tier = 'founding'`
- If count < 20: render the Founding tier card with `{count}/20 claimed` counter, priced at $197/mo, button = "Claim Founding spot — $197/mo"
- If count >= 20: hide entirely (existing Claim / Grow tiers remain)
- **Never fabricate:** if count is 0, we show "0/20 claimed" — honest.

**Modified:** `src/app/api/stripe/webhook/route.ts` — on `checkout.session.completed` where `metadata.plan === 'founding'`, set `facilities.subscription_tier = 'founding'` and `verified_at = now()`.

**Modified:** `src/components/facility/FacilityHeader.tsx` — if `subscription_tier === 'founding' && is_verified`, show a small lavender "Founding Partner" badge next to the existing Verified badge.

### F — Facility page timestamps (Item #7)

**New file:** `supabase/migrations/016_facility_timestamps.sql`
```sql
alter table facilities
  add column if not exists data_last_verified_at timestamptz,
  add column if not exists profile_last_updated_by_admin_at timestamptz,
  add column if not exists profile_last_updated_by_admin_name text;
-- Backfill data_last_verified_at from updated_at for existing rows
update facilities
  set data_last_verified_at = updated_at
  where data_last_verified_at is null;
```

**Modified:** `scripts/full_enrichment.py` — set `data_last_verified_at = now()` on every row touched during a scrape cycle.

**Modified:** `scripts/import_cms_facilities.py` — same.

**Modified:** `src/app/facility/[slug]/page.tsx` — new footer block above the similar-facilities section:
- If `is_verified` AND `profile_last_updated_by_admin_at` is not null:
  > "Facility-verified profile. Last updated by [profile_last_updated_by_admin_name or 'facility admin'] on [profile_last_updated_by_admin_at → MMMM d, yyyy]."
- Else:
  > "Facility data last verified [data_last_verified_at → MMMM d, yyyy] from the NJ Department of Health."

**Modified:** `src/app/for-facilities/dashboard/profile/page.tsx` — on profile save, write `now()` to `profile_last_updated_by_admin_at` and use the logged-in email (or display name) for `profile_last_updated_by_admin_name`. This closes the loop so verified facilities actually get the live "Last updated" stamp.

### G — Technical trust signals

**Modified:** `src/components/layout/Footer.tsx`
- New line in the bottom bar (below the legal links, above "Made for Bergen County families"):
  > "Powered by Next.js, Supabase, and Stripe."
- Added: status page link — `<a href="https://status.comfyseniors.com" target="_blank">System status</a>` — small, in the bottom row
- If LLC is filed (Q4 above): append "— ComfySeniors, LLC, a New Jersey limited liability company." to the copyright line. If not, leave a `// TODO: LLC legal name` comment and keep the current copyright as-is.

**Modified:** `src/app/privacy/page.tsx` — insert "ComfySeniors, LLC — a New Jersey limited liability company" in the opening paragraph (OR leave a TODO per Q4).

**Modified:** `src/app/terms/page.tsx` — same.

### H — `/staff/engagement` admin view

**New file:** `src/app/staff/(secure)/engagement/page.tsx`
- Reads from `engagement_events` table
- Top: 4 tiles — total events in last 24h / 7d / 30d / all time
- Table: paginated list (50/page) with columns: timestamp, event_type, facility_id (linked to `/staff/leads/{id}` if set), metadata preview (first 80 chars), user_agent truncated
- Filter by event_type (dropdown)
- Sort by date (default desc)

**Modified:** `src/app/staff/(secure)/layout.tsx` — add "Engagement" link to the admin nav.

---

## Hard constraints you specified, reconfirmed

- ✅ No fabricated data. Verification counter has honest fallback. Founding Member counter shows real "0/20 claimed" until facilities actually pay.
- ✅ No testimonials added.
- ✅ Homepage untouched.
- ✅ `/match` route untouched (still feature-flagged off).
- ✅ Every new component renders on mobile (tested via the `sm:` / `md:` breakpoints; I verify in Chrome after deploy).

## What I'm NOT doing (out of scope)

- Not building the external status page itself — you configure Better Stack / UptimeRobot, I just wire the subdomain link
- Not writing your final copy for the 5 "Our commitment" promises or the 4 "What we've already solved" bullets — scaffolded with TODOs for you
- Not changing the existing Verified / Medicaid / Claim Stripe tiers
- Not touching `/for-facilities/medicaid` (dedicated page, separate funnel)
- Not touching the 3-step decision engine on the homepage

---

## Manual follow-ups for you (post-deploy)

1. **Supabase SQL Editor:** Run migrations 013, 014, 015, 016 (I'll provide the exact copy-paste SQL after execution).
2. **Stripe price:** After I update `setup_stripe_products.mjs`, re-run it once to create the $197/mo Founding product, then add `STRIPE_FOUNDING_MONTHLY_PRICE_ID` to `.env.local` and Vercel.
3. **Status page external service:** Sign up for [Better Stack](https://betterstack.com/uptime) (free tier) or [UptimeRobot](https://uptimerobot.com) (free tier). Add the comfyseniors.com + /api/stripe/checkout + /api/webhooks/resend endpoints as monitors. Create a public status page at the provider's generated URL.
4. **Subdomain `status.comfyseniors.com`:** In whoever hosts your DNS, add a CNAME from `status.comfyseniors.com` to the URL the status page provider gives you. Wait for DNS propagation (~15 min).
5. **LLC legal name:** Once your New Jersey LLC is filed, tell me the exact registered name so I can swap the TODO placeholders in Privacy, Terms, and Footer.
6. **"Our commitment" copy + "What we've already solved" copy:** Provide your 5 promises + 4 bullet items; I swap them in.
7. **Bio + headshot for `/trust`:** Drop a bio paragraph + headshot URL (or a file path) and I'll wire them in.
8. **First real testimonials:** Once you have 1-3 quotes from real early-signed facilities, send them and I'll add a testimonial block on `/for-facilities`. (Not part of this sprint.)

---

## Smoke test checklist (post-deploy, I'll run via curl + browser)

1. `/for-facilities` renders; self-lookup widget accepts input and shows matches; clicking a match opens facility page in new tab
2. `/for-facilities` verification counter shows either "N verified this month" OR "0/20 claimed" (whichever is accurate)
3. `/for-facilities` Founding tier card renders if count < 20, hidden when ≥ 20
4. `/for-chains` renders; form validates; submit writes to `portfolio_leads`; email arrives at hello@comfyseniors.com
5. `/trust` renders and is linked from footer
6. Facility page shows a "Last verified" line at the bottom in the correct mode (DOH vs. admin)
7. Footer shows "Powered by Next.js, Supabase, and Stripe" and "System status" link
8. `/staff/engagement` requires basic-auth + magic-link; shows the table once events exist
9. Logging in to `/for-facilities/dashboard/profile` and saving updates `profile_last_updated_by_admin_at` — I can verify this via the live facility page showing the new date
10. `/admin` returns 404 (safety check — no regression from earlier Bergen pivot)

Failures I find, I fix before handoff.

---

**Reply "approved" and I'll execute in the stated order.** If you're answering the 6 open questions above, best format is `Q1: b, Q2: yes, Q3: /staff/engagement, Q4: not filed yet, Q5: approach OK, Q6: OK` — or prose is fine.
