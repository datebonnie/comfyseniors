-- ============================================================
-- Migration 013 — Engagement Events
-- Site-wide event log for facility-side engagement signals.
-- Populated by anon writes from site JS (/api/engagement/log);
-- read-only for the admin email.
--
-- Event types (controlled vocabulary, enforced in application code):
--   facility_self_lookup   — admin used the "See Your Facility Page" widget
--   cta_click_verified     — admin clicked a Verified/Claim/Grow CTA
--   chain_form_submit      — chain operator submitted /for-chains form
-- ============================================================

create table if not exists engagement_events (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null,
  facility_id uuid references facilities(id) on delete set null,
  metadata    jsonb default '{}'::jsonb,
  user_agent  text,
  ip_hash     text,
  created_at  timestamptz default now()
);

comment on table  engagement_events is 'Facility-side engagement signals. Anon inserts, admin reads. Not family-PII.';
comment on column engagement_events.ip_hash is 'Truncated SHA-256 of requester IP for abuse tracking. Not reversible.';
comment on column engagement_events.event_type is 'Controlled vocabulary enforced in application code.';

create index if not exists idx_engagement_events_type_created
  on engagement_events (event_type, created_at desc);

create index if not exists idx_engagement_events_facility
  on engagement_events (facility_id)
  where facility_id is not null;

alter table engagement_events enable row level security;

drop policy if exists "admin reads engagement" on engagement_events;
create policy "admin reads engagement"
  on engagement_events
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'hello@comfyseniors.com');

drop policy if exists "anon inserts engagement" on engagement_events;
create policy "anon inserts engagement"
  on engagement_events
  for insert
  to anon
  with check (true);

-- GRANT is required in addition to the RLS policy. Policies gate what
-- a role CAN do; grants determine whether the role can attempt it
-- at all. See migration 017 for the same fix applied across every
-- anon-inserts table in the project.
grant insert on table engagement_events to anon;
