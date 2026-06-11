-- 080_fix_respec_force_rating_and_sensitive_specs.sql
-- Fixes two classes of data bugs introduced during the reSpec dataset migration:
--
-- 1. All six Force & Destiny careers had force_rating=0 in the respec dataset
--    (should be 1 -- F&D careers always grant Force Rating 1).
--
-- 2. Force Sensitive Emergent spec had is_force_sensitive=false in respec
--    (should be true -- it is a force-sensitive universal spec).

-- Fix F&D career force ratings in respec dataset
UPDATE ref_careers
SET force_rating = 1
WHERE dataset_source = 'respec'
  AND key IN ('CONSULAR', 'GUARD', 'MYSTIC', 'SEEKER', 'SENTINEL', 'WAR');

-- Fix Force Sensitive Emergent spec flag in respec dataset
UPDATE ref_specializations
SET is_force_sensitive = true
WHERE dataset_source = 'respec'
  AND key = 'FORCESENSITIVEEMERGENT';
