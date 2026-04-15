-- ============================================================
-- Facility Referral Program
-- One customer pays for two: refer a facility, get a month free
-- ============================================================

create table if not exists facility_referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_id     uuid not null references facilities(id) on delete cascade,
  referred_id     uuid references facilities(id) on delete set null,
  referral_code   text unique not null,
  referred_email  text,
  status          text default 'pending',  -- pending, signed_up, subscribed, credited
  credit_amount   integer default 29700,   -- $297.00 in cents
  created_at      timestamptz default now(),
  converted_at    timestamptz
);

create index if not exists idx_referrals_referrer on facility_referrals (referrer_id);
create index if not exists idx_referrals_code on facility_referrals (referral_code);
create index if not exists idx_referrals_status on facility_referrals (status);

alter table facility_referrals enable row level security;

create policy "Facility owners can view their referrals"
  on facility_referrals for select
  using (
    referrer_id in (
      select facility_id from facility_users
      where user_id = auth.uid()
    )
  );

create policy "Facility owners can create referrals"
  on facility_referrals for insert
  with check (
    referrer_id in (
      select facility_id from facility_users
      where user_id = auth.uid()
    )
  );

comment on table facility_referrals is 'Facility-to-facility referral program. Referrer gets $297 credit when referred facility subscribes.';
