-- ============================================================
-- Migration 017 — Fix anon INSERT privileges
--
-- Previous migrations (009, 011, 013, 014) created RLS policies that
-- said "anon can insert" but did not issue the underlying PostgreSQL
-- GRANT INSERT to the anon role. In Supabase, a policy without the
-- matching grant still returns 42501 "row-level security policy
-- violation" — because the role can't even attempt the insert before
-- RLS checks.
--
-- This migration adds the missing grants. Idempotent (grant is a
-- no-op if already held).
--
-- Verified behaviors after running:
--   - Unsubscribe page one-click works
--   - /api/engagement/log accepts events
--   - /for-chains form submission writes leads
-- ============================================================

grant insert on table email_unsubscribes to anon;
grant update on table email_unsubscribes to anon;   -- webhook-triggered updates

grant insert on table email_sends to anon;
grant update on table email_sends to anon;          -- webhook-triggered updates

grant insert on table engagement_events to anon;

grant insert on table portfolio_leads to anon;

-- facility_views was added in migration 007 and also relies on anon
-- writes; grant here too for consistency. Safe no-op if already held.
grant insert on table facility_views to anon;
grant update on table facility_views to anon;

-- Future proof: if you add any new "anon inserts X" RLS policy,
-- remember to also `grant insert on X to anon` or it silently fails.
