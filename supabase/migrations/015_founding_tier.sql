-- ============================================================
-- Migration 015 — Subscription Tier + Verified Timestamp
-- Tracks which paid tier a facility is on (needed for Founding Member
-- cap enforcement and for the "Founding Partner" badge). Adds a
-- verified_at timestamp with an is_estimated flag so backfilled rows
-- can display "Verified" without a fabricated date.
-- ============================================================

alter table facilities
  add column if not exists subscription_tier text;

alter table facilities
  add column if not exists verified_at timestamptz;

alter table facilities
  add column if not exists verified_at_is_estimated boolean default false;

comment on column facilities.subscription_tier is
  'Current paid tier: claim | verified | medicaid | founding | null. Set by Stripe webhook on checkout.session.completed.';
comment on column facilities.verified_at is
  'Timestamp facility became verified. Backfilled rows have is_estimated=true and should NOT display a date — the stamp is a best-effort proxy from updated_at.';
comment on column facilities.verified_at_is_estimated is
  'True = timestamp is a proxy from updated_at, display without a date. False = real verification timestamp, safe to display.';

create index if not exists idx_facilities_subscription_tier
  on facilities (subscription_tier)
  where subscription_tier is not null;

create index if not exists idx_facilities_verified_at
  on facilities (verified_at desc)
  where is_verified = true;

-- Backfill: existing is_verified=true rows get updated_at as a proxy
-- timestamp, with the estimation flag set so display logic hides the
-- date until admins re-confirm.
update facilities
   set verified_at = coalesce(verified_at, updated_at),
       verified_at_is_estimated = true
 where is_verified = true
   and verified_at is null;
