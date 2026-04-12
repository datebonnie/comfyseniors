-- ============================================================
-- Facility Auth: links Supabase Auth users to facilities
-- ============================================================

create table if not exists facility_users (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  facility_id uuid not null references facilities(id) on delete cascade,
  role        text default 'admin',
  created_at  timestamptz default now(),
  unique(user_id, facility_id)
);

create index if not exists idx_facility_users_user on facility_users (user_id);
create index if not exists idx_facility_users_facility on facility_users (facility_id);

-- RLS: users can only see their own facility links
alter table facility_users enable row level security;

create policy "Users can view their own facility links"
  on facility_users for select
  using (auth.uid() = user_id);

-- Allow facility owners to update their own facility
create policy "Facility owners can update their facility"
  on facilities for update
  using (
    id in (
      select facility_id from facility_users
      where user_id = auth.uid()
    )
  );

-- Allow facility owners to read their own leads
create policy "Facility owners can view their leads"
  on leads for select
  using (
    facility_id in (
      select facility_id from facility_users
      where user_id = auth.uid()
    )
  );

-- Allow facility owners to update their leads (mark conversions)
create policy "Facility owners can update their leads"
  on leads for update
  using (
    facility_id in (
      select facility_id from facility_users
      where user_id = auth.uid()
    )
  );
