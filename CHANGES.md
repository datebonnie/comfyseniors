# Bergen County Pivot — Execution Summary

**Status: SHIPPED.** All 8 changes from the original sprint spec are implemented and the production build passes locally.

---

## Files modified (29) and created (4)

### Created
| File | Purpose |
|---|---|
| `supabase/migrations/012_featured_implies_verified.sql` | Cleans existing rows + adds CHECK constraint forbidding `is_featured && !is_verified` |
| `src/app/match/MatchClient.tsx` | The original quiz client logic (extracted from `page.tsx` so the page can become a server-side flag check) |
| `next.config.mjs` (rewritten from empty) | 4 permanent redirects for removed care-type routes |
| `CHANGES.md` (this file) | This summary |

### Modified
| File | Change |
|---|---|
| `src/types/database.ts` | `CareType` union narrowed to `"Assisted Living" \| "Memory Care"` |
| `src/components/search/FilterSidebar.tsx` | `CARE_TYPES` array trimmed to active two |
| `src/components/ui/CareTypeBadge.tsx` | Accepts `string` (legacy DB values still render with their original badge styling); falls back to default style for unknown values |
| `src/app/care-types/[type-slug]/page.tsx` | `CARE_TYPE_MAP` trimmed; "Nationwide" → "Bergen County, NJ"; metadata Bergen-focused; bottom CTA now links to `/search?type=…` instead of `/match` |
| `src/app/sitemap.ts` | Dropped `/match` + 4 dropped care-type slugs from output |
| `src/components/layout/Footer.tsx` | Care Types section trimmed to 2; "Care Match Quiz" link removed; "For Admins" section removed |
| `src/components/layout/Nav.tsx` | Trimmed to: logo + 2 plain links (Find Care, About) + 1 emphasized CTA (For Facilities). Care Match Quiz + FAQ removed |
| `src/app/layout.tsx` | Root `metadata` (title, description, og, twitter) rewritten to Bergen County focus |
| `src/app/page.tsx` | Full rewrite: new H1, 2 trust chips, longer trust line, 3-FAQ section, bottom facility CTA. **Deleted:** care-type pills strip, How-It-Works, Featured Facilities carousel, Why-ComfySeniors 4-card section |
| `src/app/search/page.tsx` | Default `county = "Bergen"` when no `?county=` param; metadata updated; explicit empty `?county=` allowed as escape hatch |
| `src/lib/queries.ts` | `getFeaturedFacilities` now filters `county = "Bergen"` AND `is_verified = true` (mirrors migration 012 invariant) |
| `src/components/ui/SearchBar.tsx` | Default placeholder = "Search Bergen County" |
| `src/app/match/page.tsx` | NEW server-component shell: redirects to `/search` when `NEXT_PUBLIC_ENABLE_QUIZ !== "true"`; renders `<MatchClient />` otherwise. Quiz code preserved verbatim in MatchClient.tsx |
| `src/app/cities/[city-slug]/page.tsx` | "Take the Care Match Quiz" CTA replaced with city-specific search CTA |
| `src/app/partners/page.tsx` | Removed "Care Match Quiz" tile (only the FAQ + Search tiles remain) |
| `src/app/for-facilities/page.tsx` | New H1 + subhead. CTA copy → "Remove my warning". 4 pillar sections → 1 "What you get" section (6 bullets). New 2-tier pricing block (Claim $97 / Grow $297) added above the bottom CTA. Comparison table + math section unchanged. Bergen-aware copy throughout. |
| `src/app/api/stripe/checkout/route.ts` | Added `claim_monthly` plan mapping → `STRIPE_CLAIM_MONTHLY_PRICE_ID` env var → `planTag = "claim"`. TODO comment included for the manual Stripe-Dashboard step. |
| `src/components/ui/StripeButton.tsx` | Plan union extended to include `"claim_monthly"` |
| `src/middleware.ts` | Extended to add HTTP Basic Auth gate on `/staff/*` and `/api/staff/*` (using `ADMIN_BASIC_AUTH_USER` + `ADMIN_BASIC_AUTH_PASS` env vars). Bypasses if vars unset to prevent first-deploy lockout. Existing `/for-facilities/dashboard` Supabase guard preserved. |
| `src/app/auth/callback/route.ts` | Admin redirect path `/admin` → `/staff` |
| `src/lib/admin-auth.ts` | `requireAdmin()` redirects to `/staff/login` instead of `/admin/login` |
| `src/app/robots.ts` | Disallow list expanded: `/staff`, `/match`, `/unsubscribe`, `/auth/` (in addition to existing `/for-facilities/dashboard` + `/api/`) |
| `src/components/ui/FacilityCard.tsx` | Defensive guard: never renders the "Featured" badge unless `is_verified` is also true. Border-color logic also follows the guard. |
| `src/components/facility/FacilityHeader.tsx` | Same defensive guard on the facility detail page |
| `src/app/about/page.tsx` | Metadata + hero + bottom-CTA copy → Bergen County (was "America's"). |
| `src/app/terms/page.tsx` | Section "Who We Are" rewritten to Bergen County focus + drops enumeration of removed care types |
| `src/app/faq/page.tsx` | Hero subtitle → Bergen County focus |

### Renamed (entire directories)
| Old path | New path |
|---|---|
| `src/app/admin/` | `src/app/staff/` |
| `src/app/api/admin/` | `src/app/api/staff/` |

All internal hrefs and `fetch()` URLs inside these directories were updated from `/admin*` → `/staff*` and `/api/admin/*` → `/api/staff/*`.

---

## Routes affected

### Permanently redirected (301)
| Old route | New route |
|---|---|
| `/care-types/independent-living` | `/search?type=Assisted%20Living` |
| `/care-types/nursing-home` | `/search?type=Assisted%20Living` |
| `/care-types/home-care` | `/search` |
| `/care-types/hospice` | `/search` |

### Renamed (no auto-redirect — `/admin/*` is now 404)
| Old route | New route |
|---|---|
| `/admin` | `/staff` |
| `/admin/login` | `/staff/login` |
| `/admin/leads` | `/staff/leads` |
| `/admin/leads/[id]` | `/staff/leads/[id]` |
| `/api/admin/lead` | `/api/staff/lead` |
| `/api/admin/lead-note` | `/api/staff/lead-note` |

### Newly gated
| Route | Gate |
|---|---|
| `/staff/*` | HTTP Basic Auth (middleware) → magic-link auth (page-level) |
| `/api/staff/*` | HTTP Basic Auth (middleware) → admin-email check (route handler) |

### Soft-disabled (feature-flagged off)
| Route | Behavior |
|---|---|
| `/match` | Redirects to `/search` when `NEXT_PUBLIC_ENABLE_QUIZ !== "true"`. Code preserved at `MatchClient.tsx`. |

### Bergen-defaulted
| Route | Default behavior |
|---|---|
| `/search` (no `?county=` param) | Filters to Bergen. Set `?county=` (empty) to override. |
| `/` homepage featured query | Now Bergen-only AND requires `is_verified=true` |

---

## Manual follow-ups for you

### REQUIRED before next deploy is fully functional

| # | Action | Notes |
|---|---|---|
| 1 | **Run migration 012** in Supabase SQL Editor | Cleans existing `is_featured=true && is_verified=false` rows + adds CHECK constraint |
| 2 | **Set Vercel env `NEXT_PUBLIC_ENABLE_QUIZ`** | Set to `false` (or just leave unset; default behavior is OFF). Value-of-true would re-enable `/match`. |
| 3 | **Set Vercel env `ADMIN_BASIC_AUTH_USER` + `ADMIN_BASIC_AUTH_PASS`** | Required to lock down `/staff/*`. Without them, the basic-auth gate is bypassed (so the deploy doesn't hard-lock you out, but the staff CRM is then only protected by magic-link auth). Pick a strong unique password. |
| 4 | **Update Supabase Auth Redirect URLs** | Add `https://www.comfyseniors.com/auth/callback?redirect=/staff` to the allow list. Old `/admin` redirect URL can be removed. |

### REQUIRED before $97 Claim tier works

| # | Action | Notes |
|---|---|---|
| 5 | **Create $97/mo Stripe price** | Stripe Dashboard → Products → ComfySeniors Claim → recurring monthly $97 USD. Copy the `price_xxxxx` ID. |
| 6 | **Set Vercel env `STRIPE_CLAIM_MONTHLY_PRICE_ID`** | Paste the price ID from step 5. Mirror to `.env.local`. Until set, clicking the "Claim my listing" button returns a 503. |

### OPTIONAL but recommended

| # | Action | Notes |
|---|---|---|
| 7 | **Review FAQ rows in `faq_questions` table** | The static page header was updated, but FAQ content is database-driven. Edit any rows that mention nursing homes / hospice / home care / independent living to be neutral or removed. |
| 8 | **Update Plausible / Google Search Console** | Submit the new sitemap (`/sitemap.xml`) so deprecated care-type routes get re-crawled and the 301s register. |
| 9 | **Refresh county_benchmarks table** | If county benchmarks were pre-computed nationally, the Bergen-only featured query may produce stale comparisons until you re-run `python scripts/full_enrichment.py` step5. Low priority. |

### Decisions deferred (not in this sprint)

- **Subdomain admin** — left as `/staff` per the "at minimum" path. If you later want `staff.comfyseniors.com` or similar: add the subdomain in Vercel + DNS, and the basic-auth middleware will continue to gate it.
- **Admin URL slug obscurity** — went with the readable `/staff` rather than a random suffix. Combined with basic auth + magic-link + robots disallow + middleware lockout, this is sufficient defense in depth.
- **Existing /admin/* bookmarks** — return 404. If you want to soft-redirect them to `/staff/*` for the people who already had the URL, add a one-liner redirect in `next.config.mjs`. I haven't added this because exposing `/admin → /staff` defeats the obscurity purpose.

---

## Build verification

`npm run build` passes locally. All TypeScript types resolve. All routes register. The narrowed `CareType` union flagged the legacy `CareTypeBadge` styles as a type error; resolved by widening that one component's prop to `string` while preserving the legacy style mappings (so existing facilities with old `care_types` arrays still render with the right colors).

Production routes summary from the build output:
- 4 dropped care-type slugs no longer in the route table (handled by the `next.config.mjs` redirects)
- `/staff/*` routes present (renamed from `/admin/*`)
- `/api/staff/*` routes present (renamed from `/api/admin/*`)
- `/match` still in the route table — but the page server-side-redirects to `/search` unless the flag is enabled

---

## Quick sanity-check after deploy

1. `https://www.comfyseniors.com/` — new H1 about Bergen County; no care-type pills; no featured carousel; no How-It-Works; FAQ block + facility CTA at bottom.
2. `https://www.comfyseniors.com/care-types/nursing-home` → 301 to `/search?type=Assisted%20Living`.
3. `https://www.comfyseniors.com/match` → 307 to `/search` (assuming `NEXT_PUBLIC_ENABLE_QUIZ` is unset/false).
4. `https://www.comfyseniors.com/search` — county filter pre-set to Bergen; only 2 care-type checkboxes visible.
5. `https://www.comfyseniors.com/for-facilities` — new "Every month you're not verified..." H1; 2-tier pricing block visible; Comparison table + math section preserved; CTA button reads "Remove my warning — $297/month".
6. `https://www.comfyseniors.com/admin` → 404. `https://www.comfyseniors.com/staff` → basic-auth prompt → magic-link login → CRM.
7. Footer: Care Types section shows only Assisted Living + Memory Care; no "For Admins" section; no "Care Match Quiz" link.
