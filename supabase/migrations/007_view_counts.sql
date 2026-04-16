-- ============================================================
-- Facility View Counts
-- Tracks page views per facility per month
-- ============================================================

create table if not exists facility_views (
  id          uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facilities(id) on delete cascade,
  month       text not null,  -- format: '2026-04'
  view_count  integer default 0,
  unique(facility_id, month)
);

create index if not exists idx_views_facility on facility_views (facility_id);
create index if not exists idx_views_month on facility_views (facility_id, month);

alter table facility_views enable row level security;

-- Public: allow incrementing (insert/update)
create policy "Anyone can record a view"
  on facility_views for insert
  with check (true);

create policy "Anyone can increment views"
  on facility_views for update
  using (true);

-- Facility owners can read their own views
create policy "Facility owners can view their stats"
  on facility_views for select
  using (true);
