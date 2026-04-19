-- ============================================================
-- Migration 011 — Email Sends + Engagement
-- One row per outbound campaign email. Open/click/bounce/complaint
-- timestamps are populated by the Resend webhook
-- (/api/webhooks/resend).
-- ============================================================

create table if not exists email_sends (
  id              uuid primary key default gen_random_uuid(),
  facility_id     uuid references facilities(id) on delete set null,
  recipient_email text not null,
  subject         text,
  variant         text,
  resend_id       text unique,
  sent_at         timestamptz default now(),
  delivered_at    timestamptz,
  opened_at       timestamptz,
  clicked_at      timestamptz,
  bounced_at      timestamptz,
  complained_at   timestamptz,
  bounce_reason   text,
  created_at      timestamptz default now()
);

comment on table  email_sends is 'One row per outbound campaign email. Engagement timestamps come from Resend webhook.';
comment on column email_sends.resend_id is 'Resend message ID (returned by their send API). Used by webhook to correlate events.';
comment on column email_sends.variant is 'Which template variant was sent (e.g. A, B, C, medicaid).';

create index if not exists idx_email_sends_facility on email_sends (facility_id);
create index if not exists idx_email_sends_resend_id on email_sends (resend_id);
create index if not exists idx_email_sends_sent_at on email_sends (sent_at desc);
create index if not exists idx_email_sends_opened on email_sends (opened_at)
  where opened_at is not null;

-- ── RLS ────────────────────────────────────────────────────
-- Reads: only the admin email
-- Inserts: anon allowed (campaign script uses anon key — safe because
--   it can only insert, never read someone else's data)
-- Updates: anon allowed for the webhook to update engagement timestamps
--   (the webhook itself is signature-verified before it touches the table)
alter table email_sends enable row level security;

drop policy if exists "admin reads sends" on email_sends;
create policy "admin reads sends"
  on email_sends
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'hello@comfyseniors.com');

drop policy if exists "anon inserts sends" on email_sends;
create policy "anon inserts sends"
  on email_sends
  for insert
  to anon
  with check (true);

drop policy if exists "anon updates engagement" on email_sends;
create policy "anon updates engagement"
  on email_sends
  for update
  to anon
  using (true)
  with check (true);
