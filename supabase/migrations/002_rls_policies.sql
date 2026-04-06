-- ============================================================
-- ComfySeniors.com — Row Level Security Policies
-- Without these, anon key queries return zero rows.
-- ============================================================

-- FACILITIES: public read access
alter table facilities enable row level security;

create policy "Facilities are publicly readable"
  on facilities for select
  using (true);

-- REVIEWS: public read access for published reviews only
alter table reviews enable row level security;

create policy "Published reviews are publicly readable"
  on reviews for select
  using (is_published = true);

-- LEADS: public insert only (for contact form), no read access
alter table leads enable row level security;

create policy "Anyone can submit an inquiry"
  on leads for insert
  with check (true);

-- FAQ_QUESTIONS: public read access
alter table faq_questions enable row level security;

create policy "FAQ questions are publicly readable"
  on faq_questions for select
  using (true);

-- FEATURED_SUBSCRIPTIONS: no public access (admin only)
alter table featured_subscriptions enable row level security;

-- No public policy — only service role key can read/write
