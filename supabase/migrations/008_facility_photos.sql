-- ============================================================
-- Migration 008 — Facility Photos
-- Adds a photos column (text array of image URLs) so facilities
-- can display a photo gallery. Used by the 10 seed "Verified"
-- showcase profiles and future facility-uploaded photos.
-- ============================================================

alter table facilities
  add column if not exists photos text[] default '{}';

comment on column facilities.photos is 'Array of image URLs. Displayed in the PhotoGallery component on facility profile page.';
