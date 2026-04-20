-- ============================================================
-- Migration 014 — Portfolio Leads
-- Multi-facility operator inquiries from /for-chains. Anon insert,
-- admin read. Custom-negotiated deals, not standard subscriptions.
-- ============================================================

create table if not exists portfolio_leads (
  id                     uuid primary key default gen_random_uuid(),
  chain_name             text not null,
  total_facilities_count integer not null check (total_facilities_count >= 25),
  primary_state          text not null,
  contact_name           text not null,
  contact_email          text not null,
  contact_phone          text not null,
  status                 text default 'new',  -- new | contacted | qualified | signed | dead
  notes                  text,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

comment on table  portfolio_leads is 'Multi-facility operator leads from /for-chains. Custom-negotiated deals, not standard subscriptions.';
comment on column portfolio_leads.status is 'Pipeline stage: new | contacted | qualified | signed | dead';

create index if not exists idx_portfolio_leads_created on portfolio_leads (created_at desc);
create index if not exists idx_portfolio_leads_status on portfolio_leads (status);

-- Auto-update updated_at on row change (reuses existing trigger fn
-- from migration 001)
drop trigger if exists trg_portfolio_leads_updated_at on portfolio_leads;
create trigger trg_portfolio_leads_updated_at
  before update on portfolio_leads
  for each row execute function update_updated_at();

alter table portfolio_leads enable row level security;

drop policy if exists "admin full access portfolio" on portfolio_leads;
create policy "admin full access portfolio"
  on portfolio_leads
  for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'hello@comfyseniors.com')
  with check ((auth.jwt() ->> 'email') = 'hello@comfyseniors.com');

drop policy if exists "anon submits portfolio" on portfolio_leads;
create policy "anon submits portfolio"
  on portfolio_leads
  for insert
  to anon
  with check (true);

-- See migration 017 for why GRANT is required alongside RLS policy.
grant insert on table portfolio_leads to anon;
