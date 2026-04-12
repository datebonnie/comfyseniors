-- ============================================================
-- Tokenized Inquiry Code System
-- Enables referral tracking without storing family PII
-- ============================================================

-- Add code and conversion tracking to leads table
alter table leads add column if not exists code text unique;
alter table leads add column if not exists converted_at timestamptz;
alter table leads add column if not exists conversion_notes text;

create index if not exists idx_leads_code on leads (code);
create index if not exists idx_leads_converted on leads (converted_at) where converted_at is not null;

comment on column leads.code is 'Unique reference code (e.g. CS-7K4J9) shown to family and facility. Used for referral tracking.';
comment on column leads.converted_at is 'Timestamp when facility marked this inquiry as converted to a move-in. Triggers placement fee invoicing.';
comment on column leads.conversion_notes is 'Optional notes from facility when marking conversion.';

-- Policy: allow facility admins to update their own leads (we handle auth at app level)
-- For now, reads/writes go through service role key
