# ComfySeniors.com — Claude Code Build Brief
> Read this entire file before writing a single line of code.
> This is the single source of truth for the entire project.

---

## 1. What We're Building

**ComfySeniors.com** is a senior care directory for New Jersey — the honest alternative to A Place for Mom and Caring.com.

It lists every state-licensed senior care facility in NJ with real prices, state inspection records, and unfiltered reviews. Families browse freely without being called, sold to, or having their data harvested.

**Core promise:** "Real prices. Real records. No pressure."

**Who uses it:** Adult children, spouses, and seniors in NJ searching for assisted living, memory care, independent living, nursing homes, and home care.

**Revenue model:**
- Free for families — always
- Facilities pay $300–$500/month for featured placement
- No per-admission referral fees
- No lead selling — ever

---

## 2. Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR for SEO, fast page loads |
| Styling | Tailwind CSS | Utility-first, consistent spacing |
| Database | Supabase (PostgreSQL) | Facilities, reviews, subscriptions |
| Auth | Supabase Auth | Facility dashboard login only |
| Scraping | crawl4ai (Python) | NJ Dept of Health data pipeline |
| AI Features | Anthropic Claude API (claude-sonnet-4-6) | Care match quiz + FAQ engine |
| Hosting | Vercel | Auto-deploy from GitHub |
| Analytics | Plausible | Privacy-first, no cookies |
| Email | Resend | Facility inquiry relay |
| Payments | Stripe | Featured listing subscriptions |

---

## 3. Brand System

### Name
**ComfySeniors.com**

### Tagline
"New Jersey's most honest senior care directory."

### Hero sub-tagline
"Real prices. Real records. No pressure."

### Color Palette
```css
--cs-sage:        #3A7D6E;   /* Primary — trust, calm */
--cs-sage-dark:   #1A4D45;   /* Headings, dark text */
--cs-sage-light:  #E8F4F1;   /* Cards, highlights */
--cs-amber:       #E8825A;   /* Accent — warmth, CTA buttons */
--cs-amber-light: #FDF0E8;   /* Amber tint backgrounds */
--cs-linen:       #F7F5F0;   /* Page background */
--cs-charcoal:    #2C2C2A;   /* Body text */
--cs-muted:       #6B6B68;   /* Secondary text */
--cs-border:      #E0DDD5;   /* Borders, dividers */
--cs-white:       #FFFFFF;   /* Cards */
--cs-red-alert:   #C0392B;   /* Citation warnings */
--cs-green-ok:    #2D7D3A;   /* Clean record badges */
```

### Typography
```css
/* Display headings — emotional, warm */
font-family: 'DM Serif Display', Georgia, serif;

/* All UI — nav, body, labels, buttons */
font-family: 'DM Sans', system-ui, sans-serif;
```

Load from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale
- Hero: DM Serif Display, 48px desktop / 32px mobile
- H2: DM Sans 500, 28px
- H3: DM Sans 500, 20px
- Body: DM Sans 400, 16px, line-height 1.7
- Label: DM Sans 500, 11–12px, uppercase, letter-spacing 0.06em

### Care Type Badge Colors
```
Assisted Living    → bg #E8F4F1  text #0F6E56
Memory Care        → bg #FDF0E8  text #854F0B
Independent Living → bg #E6F1FB  text #0C447C
Nursing Home       → bg #EEEDFE  text #534AB7
Home Care          → bg #F7F5F0  text #5F5E5A
Clean Record       → bg #EAF3DE  text #3B6D11
Inspection Alert   → bg #FCEBEB  text #791F1F
Featured           → bg #3A7D6E  text #FFFFFF
```

---

## 4. Database Schema (Supabase)

### `facilities` table
```sql
id                  uuid primary key default gen_random_uuid()
name                text not null
slug                text unique not null
care_types          text[]
address             text
city                text
state               text default 'NJ'
zip                 text
county              text
phone               text
website             text
email               text
price_min           integer
price_max           integer
beds                integer
license_number      text
license_status      text
citation_count      integer default 0
last_inspection     date
inspection_summary  text
inspection_url      text
accepts_medicaid    boolean default false
accepts_medicare    boolean default false
accepts_private     boolean default true
languages           text[]
description         text
amenities           text[]
is_featured         boolean default false
featured_since      date
featured_expires    date
is_verified         boolean default false
lat                 numeric(10,7)
lng                 numeric(10,7)
created_at          timestamptz default now()
updated_at          timestamptz default now()
```

### `reviews` table
```sql
id              uuid primary key default gen_random_uuid()
facility_id     uuid references facilities(id)
reviewer_name   text
relationship    text
rating          integer
body            text
is_published    boolean default true
-- NEVER suppress negative reviews.
-- Only set is_published = false for spam or profanity.
-- Never for negative facility content.
created_at      timestamptz default now()
```

### `leads` table
```sql
id              uuid primary key default gen_random_uuid()
facility_id     uuid references facilities(id)
inquiry_type    text
message         text
created_at      timestamptz default now()
-- Do NOT store family name, phone, or email here.
-- Families contact facilities via Resend email relay only.
-- We never store or sell family contact information.
```

### `featured_subscriptions` table
```sql
id                  uuid primary key default gen_random_uuid()
facility_id         uuid references facilities(id)
stripe_customer_id  text
stripe_sub_id       text
plan                text
status              text
started_at          timestamptz
expires_at          timestamptz
```

### `faq_questions` table
```sql
id          uuid primary key default gen_random_uuid()
question    text
answer      text
category    text
order_index integer
created_at  timestamptz default now()
```

---

## 5. Site Architecture

```
comfyseniors.com/
├── /                           Homepage
├── /search                     Search + filter results
├── /facility/[slug]            Individual facility profile
├── /match                      AI care match quiz
├── /faq                        FAQ hub + AI answer engine
├── /about                      Our story + brand manifesto
├── /how-it-works               How the directory works
├── /for-facilities             Facility upsell page
├── /for-facilities/dashboard   Facility admin (auth required)
├── /cities/[city-slug]         City landing pages
└── /care-types/[type-slug]     Care type landing pages
```

---

## 6. Page Specifications

### 6.1 Homepage (`/`)

**Hero:**
- Headline (DM Serif Display): "Find the right care for your loved one. No pressure."
- Subhead: "Every licensed senior care facility in New Jersey — with real prices and state inspection records."
- Search bar → routes to /search
- Trust strip below search (inline, small text):
  - "700+ NJ facilities listed"
  - "Real prices shown"
  - "We never sell your number"
  - "State inspection records included"

**Care type filter strip:**
Assisted Living · Memory Care · Independent Living · Nursing Home · Home Care
Each routes to /search?type=[care_type]

**How it works (3 steps):**
1. Search or browse — no signup needed
2. Compare prices, reviews, and inspection records side by side
3. Contact facilities directly on your own terms

**Featured facilities (3 cards):**
- Only render if featured facilities exist in DB
- Show: name, city, care type badge, price range, citation status

**Why ComfySeniors — 4 differentiators:**
- Real prices listed
- Zero phone harvesting
- State inspection records
- All reviews published unfiltered

**FAQ preview:** 3 top questions collapsed, link to /faq

**Facility CTA:** "Are you a senior care facility in NJ? Get listed free →"

---

### 6.2 Search Results (`/search`)

**Filters (sidebar desktop / drawer mobile):**
- Care type (multi-select checkboxes)
- County (dropdown)
- City (text input)
- Price range (slider $0–$15,000/mo)
- Accepts Medicaid (toggle)
- Accepts Medicare (toggle)
- Languages spoken (multi-select)
- Clean record only (toggle)
- Sort: Relevance / Price low–high / Price high–low / Fewest citations

**Result card:**
- Facility name (linked to /facility/[slug])
- Care type badge(s)
- City, County
- Price: "From $X,XXX/mo" or "Contact for pricing"
- Citation: green "Clean record" or red "X citations"
- Star rating + review count
- 2-line description
- "View facility" button
- Featured badge if applicable

**Pagination:** 20 results per page

---

### 6.3 Facility Page (`/facility/[slug]`)

Most important page. Honest, detailed profile.

**Header:**
- Facility name (h1, DM Serif Display)
- Care type badges
- City, County, NJ
- Star rating + review count
- Featured badge if applicable

**Price block — always above the fold, never hidden:**
```
Monthly cost
From $X,XXX – $X,XXX / month
```
If unknown: "Pricing not listed — contact facility directly"

**Inspection record block — always visible:**
```
State inspection record
Last inspected: [date]
Citations in last 12 months: X
[View full NJ Dept of Health report →]
```
- 0 citations → green "Clean record"
- 1–2 → amber "X citations"
- 3+ → red "X citations — review carefully"
- Plain-English summary of what citations were for

**Tabs:**
1. Overview — description, amenities, languages, bed count
2. Reviews — all reviews, unfiltered, newest first
3. Pricing — detailed breakdown if available
4. Inspection history — full citation timeline
5. Location — map embed

**Contact sidebar:**
```
Contact this facility directly

[Send a message]      ← Resend email relay (no data stored)
[Visit website →]     ← external link
[Call: XXX-XXX-XXXX]  ← we show the number, family dials

We never share your contact info.
You are in control.
```

**Similar facilities:** 3 nearby, same care type

---

### 6.4 AI Care Match Quiz (`/match`)

5 steps, one question per screen. Progress bar. No signup required.

1. Who needs care? — parent / spouse / myself / other
2. What type? — not sure / assisted living / memory care / independent / nursing home / home care
3. Where in NJ? — city or zip + radius (5 / 10 / 25 miles)
4. Budget? — under $3K / $3–5K / $5–8K / over $8K / not sure
5. Insurance? — private pay / Medicare / Medicaid / long-term care insurance / not sure

**Results:**
- Claude API call with quiz answers + matching Supabase facilities
- Returns 3–5 ranked matches with 1-sentence match reason
- "See all results" → /search with filters pre-applied

**Claude API prompt:**
```
You are a senior care matching assistant for ComfySeniors.com,
a New Jersey senior care directory.

A family answered:
- Relationship: [answer]
- Care type: [answer]
- Location: [city/zip], within [X] miles
- Budget: [answer]
- Insurance: [answer]

Matching facilities (JSON):
[inject Supabase query results]

Return a JSON array of top 3–5 matches with:
- facility_id
- match_reason (1 plain-English sentence)
- priority_rank (1–5)

Return JSON only. No preamble.
```

---

### 6.5 FAQ Hub (`/faq`)

**Categories:**
- Understanding care types
- Costs & paying for care
- Medicare & Medicaid in NJ
- What to look for in a facility
- How to read inspection records
- NJ-specific rules & resources
- Using ComfySeniors

**AI answer engine:**
- Search bar: "Ask anything about senior care in NJ..."
- Claude API call on submit, response streamed
- System prompt: "You are a helpful, honest senior care guide for NJ families. Plain English only. Be specific to NJ where relevant. Never recommend a specific facility. Keep answers under 200 words."

**Seed FAQ (hardcode these first):**
1. What's the difference between assisted living and a nursing home?
2. How much does assisted living cost in New Jersey?
3. Does Medicare cover assisted living in NJ?
4. What does Medicaid cover for senior care in NJ?
5. What are NJ state inspection citations?
6. How do I know if a facility is licensed in NJ?
7. What questions should I ask on a facility tour?
8. What is memory care and when is it needed?
9. Can my parent be on multiple waiting lists?
10. What's the difference between independent and assisted living?
11. How do I pay for senior care if I can't afford it?
12. What is a CCRC?
13. How do I find NJ Medicaid-approved facilities?
14. What should I look for in online reviews?
15. How often does NJ inspect senior care facilities?

---

### 6.6 City Landing Pages (`/cities/[city-slug]`)

Auto-generated for every NJ city with 1+ facility.

- H1: "Senior Care in [City], NJ"
- SEO intro paragraph
- All facilities in that city (same card as search)
- Nearby cities links
- Local FAQ: "How much does assisted living cost in [City], NJ?"

**Priority cities:**
Newark, Jersey City, Trenton, Camden, Paterson, Elizabeth, Edison,
Woodbridge, Lakewood, Toms River, Hamilton, Clifton, Cherry Hill,
Passaic, Hoboken, Union City, Bayonne, Vineland, New Brunswick, Perth Amboy

---

### 6.7 About Page (`/about`)

**Tone:** Direct, honest, slightly frustrated on behalf of families.

**Structure:**
1. Why we built this — the A Place for Mom problem stated plainly
2. Our 5 promises to families
3. How we make money — transparent (featured listings only)
4. What we will never do
5. Who built this

**The 5 Promises:**
1. We show real prices on every listing
2. We never share your contact info with anyone
3. We list every licensed NJ facility — paying or not
4. We publish every review — positive and negative
5. We show state inspection records on every page

---

### 6.8 For Facilities Page (`/for-facilities`)

- Why list on ComfySeniors
- Free vs. Featured comparison table
- Featured benefits: top placement, enhanced profile, direct inquiry button, analytics dashboard
- Pricing: $300/mo monthly · $250/mo annual
- "Claim your free listing" CTA
- "Upgrade to featured" CTA → Stripe checkout

---

### 6.9 Facility Dashboard (`/for-facilities/dashboard`)

Auth-gated via Supabase Auth.

Tabs:
1. Profile — edit info, pricing, description, amenities
2. Reviews — view all, cannot delete, can reply
3. Analytics — page views, clicks, inquiries (30 days)
4. Subscription — plan, billing, upgrade/cancel

---

## 7. Data Pipeline (crawl4ai — Phase 2)

### Sources:
1. NJ DOH Licensing: `https://healthapps.state.nj.us/facilities/`
2. NJ DOH Inspections: `https://www11.state.nj.us/doh/hpsinspection/`
3. CMS Care Compare: `https://data.cms.gov/provider-data/` (JSON API)

### Scripts (`/scripts/`):
- `scrape_facilities.py` — crawl NJ DOH, extract facilities, geocode, upsert to Supabase
- `scrape_inspections.py` — get citation count, date, summary per facility
- `generate_slugs.py` — create URL slugs (facility-name-city-nj)
- `seed_faq.py` — populate faq_questions table

### Run order:
```bash
python -m pip install crawl4ai
python -m crawl4ai-setup
python scripts/scrape_facilities.py
python scripts/scrape_inspections.py
python scripts/generate_slugs.py
python scripts/seed_faq.py
```

---

## 8. Component Library

Build these before any pages:

```
/components/
├── ui/
│   ├── FacilityCard.tsx
│   ├── CitationBadge.tsx
│   ├── CareTypeBadge.tsx
│   ├── PriceDisplay.tsx
│   ├── StarRating.tsx
│   ├── SearchBar.tsx
│   └── Button.tsx
├── layout/
│   ├── Nav.tsx
│   ├── Footer.tsx
│   └── PageWrapper.tsx
├── facility/
│   ├── FacilityHeader.tsx
│   ├── InspectionBlock.tsx
│   ├── ContactBlock.tsx
│   ├── ReviewsList.tsx
│   └── SimilarFacilities.tsx
├── match/
│   ├── QuizStep.tsx
│   ├── QuizProgress.tsx
│   └── MatchResults.tsx
└── faq/
    ├── FAQAccordion.tsx
    └── AIAnswerBox.tsx
```

---

## 9. SEO

Every page needs:
- Unique `<title>` and `<meta description>`
- Open Graph tags
- JSON-LD structured data (LocalBusiness on facility pages)
- Canonical URL
- Auto-generated `sitemap.xml` and `robots.txt`

**Title formats:**
- Facility: `[Name] — [Care Type] in [City], NJ | ComfySeniors`
- City: `Senior Care in [City], NJ — [X] Facilities | ComfySeniors`
- Care type: `[Type] in New Jersey — [X] Facilities | ComfySeniors`

---

## 10. Privacy Rules — Non-Negotiable

1. **No family contact info stored.** Contact form sends relay email via Resend. No name, email, or phone logged in the database.

2. **No lead selling.** No endpoint, export, or mechanism exists to send family data to facilities or third parties.

3. **No review suppression.** `is_published` defaults to `true`. Only valid reason to set `false` is spam or profanity — never negative facility content.

4. **No citation hiding.** Citation data displays on every facility page regardless of payment status.

5. **Analytics:** Plausible only. No Google Analytics. No Meta Pixel. No tracking cookies.

---

## 11. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_FEATURED_MONTHLY_PRICE_ID=
STRIPE_FEATURED_ANNUAL_PRICE_ID=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@comfyseniors.com

# App
NEXT_PUBLIC_APP_URL=https://comfyseniors.com
```

---

## 12. Build Order

Execute in order. Do not skip phases.

### Phase 1 — Foundation
- [ ] Next.js 14 project scaffold with App Router
- [ ] Tailwind config with brand colors + fonts
- [ ] Supabase project + schema migration
- [ ] Base layout: Nav, Footer, PageWrapper
- [ ] Core UI components: Button, Badge, Card, SearchBar

### Phase 2 — Data
- [ ] crawl4ai scraping pipeline
- [ ] Seed NJ facilities into Supabase
- [ ] Seed inspection data
- [ ] Generate slugs
- [ ] Seed FAQ questions

### Phase 3 — Core Pages
- [ ] Homepage
- [ ] Search results + filters
- [ ] Individual facility page
- [ ] About page

### Phase 4 — Features
- [ ] AI care match quiz (/match)
- [ ] FAQ hub + AI answer engine (/faq)
- [ ] City landing pages
- [ ] Care type landing pages

### Phase 5 — Monetization
- [ ] For Facilities page
- [ ] Stripe integration
- [ ] Facility dashboard

### Phase 6 — Launch
- [ ] SEO (meta, JSON-LD, sitemap, robots.txt)
- [ ] Plausible analytics
- [ ] Vercel deployment + comfyseniors.com domain
- [ ] Google Search Console

---

## 13. Not Building Yet

- Mobile app
- Live chat
- Video tours
- Waitlist management
- Facility comparison tool
- Blog (Phase 2)

---

## 14. Voice & Tone

- Honest over polished
- "Your loved one" not "the patient"
- No urgency or pressure tactics ever
- Plain English — define any healthcare term used
- Always show prices, never hide numbers
- "We never sell your number" appears in: hero, facility pages, footer, about page

---

*ComfySeniors.com — New Jersey Senior Care Directory*
*Scope: New Jersey, Phase 1*
*Last updated: April 2026*
