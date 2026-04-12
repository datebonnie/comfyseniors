-- ============================================================
-- Data enrichment fields for advanced facility features
-- ============================================================

-- Staff turnover (CMS data)
alter table facilities add column if not exists rn_turnover numeric(5,2);
alter table facilities add column if not exists total_staff_turnover numeric(5,2);

-- Detailed quality ratings (CMS 5-star scale)
alter table facilities add column if not exists overall_rating integer;
alter table facilities add column if not exists health_inspection_rating integer;
alter table facilities add column if not exists staffing_rating integer;
alter table facilities add column if not exists qm_rating integer;

-- Value score (0-100, calculated)
alter table facilities add column if not exists value_score integer;

-- Detailed deficiencies (separate table for efficient queries)
create table if not exists inspection_deficiencies (
  id            uuid primary key default gen_random_uuid(),
  facility_id   uuid not null references facilities(id) on delete cascade,
  survey_date   date,
  tag_number    text,           -- F-tag number (e.g. "0880")
  category      text,           -- e.g. "Infection Control Deficiencies"
  description   text,           -- Plain-English description
  severity      text,           -- A-L scale
  is_complaint  boolean default false,
  is_corrected  boolean default false,
  correction_date date,
  created_at    timestamptz default now()
);

create index if not exists idx_deficiencies_facility on inspection_deficiencies (facility_id);
create index if not exists idx_deficiencies_date on inspection_deficiencies (facility_id, survey_date desc);
create index if not exists idx_deficiencies_severity on inspection_deficiencies (severity);

comment on table inspection_deficiencies is 'Individual deficiency records from CMS inspections for detailed citation viewer.';

-- RLS: publicly readable
alter table inspection_deficiencies enable row level security;

create policy "Inspection deficiencies are publicly readable"
  on inspection_deficiencies for select
  using (true);

-- County cost benchmarks (materialized for speed)
create table if not exists county_benchmarks (
  county        text not null,
  care_type     text not null,
  avg_price_min integer,
  avg_price_max integer,
  median_price  integer,
  facility_count integer,
  updated_at    timestamptz default now(),
  primary key (county, care_type)
);

alter table county_benchmarks enable row level security;

create policy "County benchmarks are publicly readable"
  on county_benchmarks for select
  using (true);
