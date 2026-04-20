-- ============================================================
-- Migration 012 — Featured implies Verified
-- A facility marked is_featured=true must also be is_verified=true.
-- Showing "Featured" + "Not Verified" simultaneously is a conversion
-- killer and contradicts the badge's meaning.
-- ============================================================

-- 1. Clean up existing rows that violate the new invariant.
update facilities
   set is_featured = false
 where is_featured = true
   and is_verified = false;

-- 2. Enforce the invariant going forward.
alter table facilities
  drop constraint if exists chk_featured_implies_verified;

alter table facilities
  add constraint chk_featured_implies_verified
  check (not (is_featured = true and is_verified = false));

comment on constraint chk_featured_implies_verified on facilities is
  'A facility cannot be featured without being verified — the Verified badge is the underlying trust signal.';
