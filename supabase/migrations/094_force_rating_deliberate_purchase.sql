-- 094_force_rating_deliberate_purchase.sql
--
-- reSpecialized rule change: neither careers nor specializations auto-grant
-- Force Rating. A Force-sensitive specialization only makes a character
-- ELIGIBLE for Force Rating 1 — the player must deliberately spend 10 XP to
-- actually gain it (see handlePurchaseForceRating in useCharacterData.ts),
-- and may defer that purchase indefinitely.
--
-- 1. Careers no longer grant Force Rating under reSpec — zero out
--    ref_careers.force_rating for all respec rows (previously set to 1 for
--    the six Force & Destiny careers by migration 080). oggdude rows are an
--    inactive rollback dataset and are left untouched.
UPDATE ref_careers
SET force_rating = 0
WHERE dataset_source = 'respec';

-- 2. Deliberate-purchase flag: true once the player has spent 10 XP to gain
--    Force Rating 1. Default false — owning a Force-sensitive spec no longer
--    grants any Force Rating on its own.
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS force_rating_purchased boolean NOT NULL DEFAULT false;
