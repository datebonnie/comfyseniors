-- ============================================================
-- Migration 016 — Facility Last-Verified Timestamps
-- Adds per-facility timestamps displayed at the bottom of the public
-- facility page. Each data-freshness signal has an is_estimated flag
-- so backfilled rows show "from NJ DOH" without a fabricated date.
-- ============================================================

alter table facilities
  add column if not exists data_last_verified_at timestamptz,
  add column if not exists data_last_verified_at_is_estimated boolean default false,
  add column if not exists profile_last_updated_by_admin_at timestamptz,
  add column if not exists profile_last_updated_by_admin_name text;

comment on column facilities.data_last_verified_at is
  'Timestamp the DOH/CMS scraper last refreshed this facility. Backfilled rows have is_estimated=true and should display without a date.';
comment on column facilities.data_last_verified_at_is_estimated is
  'True = proxy timestamp from updated_at, display source without a date. False = real scrape timestamp, safe to display.';
comment on column facilities.profile_last_updated_by_admin_at is
  'Timestamp the facility admin last saved profile changes via /for-facilities/dashboard/profile.';
comment on column facilities.profile_last_updated_by_admin_name is
  'Display name (or email) of the admin who last saved profile changes. Free text, set by the dashboard on save.';

create index if not exists idx_facilities_data_last_verified
  on facilities (data_last_verified_at desc)
  where data_last_verified_at is not null;

-- Backfill: stamp every existing facility's data_last_verified_at
-- from updated_at, flagged as estimated. The DOH/CMS scrape scripts
-- will flip the flag off as they refresh rows going forward.
update facilities
   set data_last_verified_at = coalesce(data_last_verified_at, updated_at),
       data_last_verified_at_is_estimated = true
 where data_last_verified_at is null;
