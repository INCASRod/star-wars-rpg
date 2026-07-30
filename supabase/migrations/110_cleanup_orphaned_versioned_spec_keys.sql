-- 110_cleanup_orphaned_versioned_spec_keys.sql
-- Companion cleanup for migration 109. Two ref_specializations (respec) rows
-- were seeded, before today's parser fix, under a dirty key that leaked a
-- version-number fragment straight from the source XML's own <Key> field
-- (Ground Support: "GROUNDSUPP1.0", Wingmate: "WINGMATE1.0") instead of the
-- sanitized key ("GROUNDSUPP", "WINGMATE") migration 109 now correctly seeds.
-- Because ON CONFLICT upserts key off (key, dataset_source), migration 109's
-- corrected rows landed as brand-new inserts alongside these old rows rather
-- than replacing them — leaving two orphaned duplicates behind.
--
-- Safe to delete, verified same session:
--   - Zero character_specializations rows reference either dirty key (no
--     player has ever purchased Ground Support or Wingmate).
--   - ref_careers.specialization_keys (THEACE) referenced both dirty keys
--     before migration 109; migration 109's own ref_careers upsert already
--     rewrote that array to the clean keys, so nothing still points at the
--     rows being removed here.
--   - No occurrences of either key anywhere in application source.
DELETE FROM ref_specializations
WHERE dataset_source = 'respec' AND key IN ('GROUNDSUPP1.0', 'WINGMATE1.0');
