-- ============================================================
-- Migration 010 — Admin CRM
-- Internal CRM for tracking facility outreach. Restricted to
-- the admin email (hello@comfyseniors.com by default).
-- ============================================================

-- ── crm_facility_leads ──────────────────────────────────────
-- One row per facility we're actively pursuing. Lazily created —
-- a facility doesn't get a row until you take an action on it.
create table if not exists crm_facility_leads (
  id                  uuid primary key default gen_random_uuid(),
  facility_id         uuid not null references facilities(id) on delete cascade,
  status              text not null default 'new',
  source              text,
  priority            integer default 0,
  last_contacted_at   timestamptz,
  next_followup_at    timestamptz,
  value_estimate      integer,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (facility_id)
);

comment on table  crm_facility_leads is 'CRM tracking for facility outreach. One row per pursued facility, lazily created.';
comment on column crm_facility_leads.status is 'new | contacted | replied | demo | paying | lost | unresponsive';
comment on column crm_facility_leads.source is 'cold_email | cold_call | inbound | referral | other';
comment on column crm_facility_leads.priority is '0 = normal, 1 = high, 2 = urgent';
comment on column crm_facility_leads.value_estimate is 'Estimated MRR if they convert (e.g. 297 or 397)';

create index if not exists idx_crm_leads_facility on crm_facility_leads (facility_id);
create index if not exists idx_crm_leads_status   on crm_facility_leads (status);
create index if not exists idx_crm_leads_followup on crm_facility_leads (next_followup_at)
  where next_followup_at is not null;

-- Auto-update updated_at
drop trigger if exists trg_crm_leads_updated_at on crm_facility_leads;
create trigger trg_crm_leads_updated_at
  before update on crm_facility_leads
  for each row execute function update_updated_at();


-- ── crm_lead_notes ──────────────────────────────────────────
-- Free-form notes the admin attaches to a lead during outreach.
create table if not exists crm_lead_notes (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references crm_facility_leads(id) on delete cascade,
  body        text not null,
  author      text,
  created_at  timestamptz default now()
);

comment on table  crm_lead_notes is 'Free-form notes attached to a CRM lead.';
comment on column crm_lead_notes.author is 'Email of the admin who wrote the note.';

create index if not exists idx_crm_notes_lead on crm_lead_notes (lead_id, created_at desc);


-- ── RLS — only the admin email can touch these tables ──────
-- Using auth.jwt() ->> 'email' = ADMIN_EMAIL pattern. Hardcoded to
-- hello@comfyseniors.com here; if you change the admin email, update
-- both this policy and the ADMIN_EMAIL env var in Vercel.
alter table crm_facility_leads enable row level security;
alter table crm_lead_notes     enable row level security;

drop policy if exists "admin full access leads" on crm_facility_leads;
create policy "admin full access leads"
  on crm_facility_leads
  for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'hello@comfyseniors.com')
  with check ((auth.jwt() ->> 'email') = 'hello@comfyseniors.com');

drop policy if exists "admin full access notes" on crm_lead_notes;
create policy "admin full access notes"
  on crm_lead_notes
  for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'hello@comfyseniors.com')
  with check ((auth.jwt() ->> 'email') = 'hello@comfyseniors.com');
