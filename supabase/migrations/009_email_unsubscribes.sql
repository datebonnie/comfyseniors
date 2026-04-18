-- ============================================================
-- Migration 009 — Email Unsubscribes
-- Tracks facility email addresses that have opted out of
-- marketing/campaign emails (CAN-SPAM compliance via
-- List-Unsubscribe header + RFC 8058 one-click POST).
--
-- NOTE: This ONLY controls future marketing-email sends.
-- It does NOT delist the facility from the directory.
-- ============================================================

create table if not exists email_unsubscribes (
  id                uuid primary key default gen_random_uuid(),
  email             text unique not null,
  unsubscribed_at   timestamptz default now(),
  source            text,  -- e.g. 'one-click', 'page-form', 'manual'
  user_agent        text,
  ip_hash           text
);

comment on table  email_unsubscribes is 'CAN-SPAM unsubscribe list. Prevents future marketing emails to these addresses. Does NOT remove the facility from the public directory.';
comment on column email_unsubscribes.source is 'How the unsubscribe happened: one-click (Gmail/Yahoo header), page-form (manual), or manual (admin action).';
comment on column email_unsubscribes.ip_hash is 'Truncated SHA-256 of requester IP for abuse tracking. Not PII.';

-- Fast lookup by email during campaign send-loop
create unique index if not exists idx_email_unsubscribes_email
  on email_unsubscribes (email);

-- ── RLS policies ──────────────────────────────────────────
alter table email_unsubscribes enable row level security;

-- Allow anonymous inserts (the /api/unsubscribe route uses the anon key).
-- The route itself verifies HMAC tokens before calling insert, so an
-- attacker cannot insert arbitrary emails without knowing the secret.
drop policy if exists "anon can insert unsubscribes" on email_unsubscribes;
create policy "anon can insert unsubscribes"
  on email_unsubscribes
  for insert
  to anon
  with check (true);

-- No SELECT/UPDATE/DELETE policies = only service_role can read/modify.
-- The campaign script uses the service-role key, so it can query the list.
