-- ============================================================
-- ComfySeniors.com — Initial Schema
-- New Jersey Senior Care Directory
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() if not already enabled
create extension if not exists "pgcrypto";


-- ============================================================
-- FACILITIES
-- Every state-licensed senior care facility in NJ.
-- ============================================================
create table facilities (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text unique not null,
  care_types          text[],                          -- e.g. {'Assisted Living','Memory Care'}
  address             text,
  city                text,
  state               text default 'NJ',
  zip                 text,
  county              text,
  phone               text,
  website             text,
  email               text,
  price_min           integer,                         -- monthly cost floor in USD
  price_max           integer,                         -- monthly cost ceiling in USD
  beds                integer,
  license_number      text,
  license_status      text,
  citation_count      integer default 0,
  last_inspection     date,
  inspection_summary  text,                            -- plain-English summary of citations
  inspection_url      text,                            -- link to NJ DOH report
  accepts_medicaid    boolean default false,
  accepts_medicare    boolean default false,
  accepts_private     boolean default true,
  languages           text[],                          -- e.g. {'English','Spanish'}
  description         text,
  amenities           text[],
  is_featured         boolean default false,
  featured_since      date,
  featured_expires    date,
  is_verified         boolean default false,
  lat                 numeric(10,7),
  lng                 numeric(10,7),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

comment on table  facilities                is 'Every state-licensed senior care facility in NJ.';
comment on column facilities.care_types     is 'Array: Assisted Living, Memory Care, Independent Living, Nursing Home, Home Care';
comment on column facilities.price_min      is 'Monthly cost floor in USD.';
comment on column facilities.price_max      is 'Monthly cost ceiling in USD.';
comment on column facilities.citation_count is 'Number of state inspection citations in last 12 months.';
comment on column facilities.inspection_url is 'Direct link to NJ Dept of Health inspection report.';
comment on column facilities.is_featured    is 'True if facility has an active paid featured subscription.';

-- Index for slug lookups (facility profile pages)
create unique index idx_facilities_slug on facilities (slug);

-- Index for search/filter by city, county, care type
create index idx_facilities_city   on facilities (city);
create index idx_facilities_county on facilities (county);

-- Index for featured facility queries
create index idx_facilities_featured on facilities (is_featured) where is_featured = true;

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_facilities_updated_at
  before update on facilities
  for each row execute function update_updated_at();


-- ============================================================
-- REVIEWS
-- Unfiltered reviews from families. NEVER suppress negative
-- reviews. Only set is_published = false for spam or profanity
-- — never for negative facility content.
-- ============================================================
create table reviews (
  id              uuid primary key default gen_random_uuid(),
  facility_id     uuid not null references facilities(id) on delete cascade,
  reviewer_name   text,
  relationship    text,                                -- e.g. 'daughter', 'spouse', 'self'
  rating          integer not null check (rating >= 1 and rating <= 5),
  body            text,
  is_published    boolean default true,
  -- POLICY: is_published defaults true. Only set false for
  -- spam or profanity. NEVER for negative facility content.
  created_at      timestamptz default now()
);

comment on table  reviews              is 'Family reviews — unfiltered. Never suppress negative content.';
comment on column reviews.is_published is 'Only false for spam/profanity. NEVER for negative facility content.';

create index idx_reviews_facility on reviews (facility_id);
create index idx_reviews_published on reviews (facility_id, is_published) where is_published = true;


-- ============================================================
-- LEADS
-- Inquiry tracking only. We NEVER store family name, phone,
-- or email. Families contact facilities via Resend email
-- relay only. We never store or sell family contact info.
-- ============================================================
create table leads (
  id              uuid primary key default gen_random_uuid(),
  facility_id     uuid not null references facilities(id) on delete cascade,
  inquiry_type    text,                                -- e.g. 'tour_request', 'pricing_question'
  message         text,
  created_at      timestamptz default now()
  -- POLICY: Do NOT store family name, phone, or email here.
  -- Families contact facilities via Resend email relay only.
  -- We never store or sell family contact information.
);

comment on table  leads is 'Inquiry tracking only. NO family PII stored. Contact via Resend relay.';

create index idx_leads_facility on leads (facility_id);


-- ============================================================
-- FEATURED SUBSCRIPTIONS
-- Stripe-managed paid listing upgrades for facilities.
-- ============================================================
create table featured_subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  facility_id         uuid not null references facilities(id) on delete cascade,
  stripe_customer_id  text,
  stripe_sub_id       text,
  plan                text,                            -- e.g. 'monthly', 'annual'
  status              text,                            -- e.g. 'active', 'canceled', 'past_due'
  started_at          timestamptz,
  expires_at          timestamptz
);

comment on table featured_subscriptions is 'Stripe subscriptions for featured facility placement.';

create index idx_featured_subs_facility on featured_subscriptions (facility_id);
create index idx_featured_subs_status   on featured_subscriptions (status);


-- ============================================================
-- FAQ QUESTIONS
-- Seed questions for the /faq hub. Also used by the AI
-- answer engine as context.
-- ============================================================
create table faq_questions (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text,
  category    text,
  order_index integer,
  created_at  timestamptz default now()
);

comment on table faq_questions is 'Curated FAQ content for /faq page and AI answer engine context.';

create index idx_faq_category on faq_questions (category);
create index idx_faq_order    on faq_questions (order_index);
