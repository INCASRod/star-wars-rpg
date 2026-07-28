-- 101_force_power_dataset_scoping_prep.sql
-- Stage 1 (pre-step) of the ref_force_powers dataset-scoping fix.
--
-- ref_force_powers has never had dataset_source/is_retired columns (unlike
-- ref_talents, ref_force_abilities, ref_specializations, ref_careers, which
-- got them in migration 062). Migration 079 and 100 worked around the gap by
-- writing ReSpecialized-tagged content under mangled keys (USERFP1, IMBUERE,
-- etc.) to avoid colliding with the single-row-per-key PK — leaving one live
-- row per concept but under the wrong key, and in one case (ALTER) migration
-- 100's ON CONFLICT (key) DO UPDATE overwrote the oggdude rollback row's
-- description with a placeholder stub from respec's plain-file source
-- ("Enter description for Force Power \"Alter\" here.").
--
-- This migration must run BEFORE the corrected snapshot reseed
-- (102_respec_force_power_reseed.sql) inserts respec-flavored duplicate rows
-- under the shared keys — the single-column PK on `key` alone would reject
-- them otherwise. It must run AFTER nothing (it is additive/corrective only).

-- 1. Add the two columns the other four ref tables already have.
ALTER TABLE ref_force_powers
  ADD COLUMN dataset_source text NOT NULL DEFAULT 'oggdude',
  ADD COLUMN is_retired boolean NOT NULL DEFAULT false;

-- 2. Restore ALTER's true oggdude description, corrupted by migration 100.
--    True value confirmed live against oggdude/DataCustom/Force Powers/Alter.xml
--    (parsed with the same XML pipeline used by this repo's seed scripts) —
--    not reconstructed from a migration file, since migration 004 only
--    creates the table (no literal seed data was ever checked in; the
--    original seed ran via scripts/seed-supabase.ts against parsed oggdude
--    JSON, never committed as SQL).
UPDATE ref_force_powers
SET description = '[H4]Force Power: Alter[h4]
Many Force users have the ability to sense the life force of the environment around them. Some Force users take this sense a bit further. By tapping into that living gestalt, the can manipulate the land around them. Intruders may find vines choking their path or mists rising up to block their sight. Meanwhile, allies find that trails and paths mysteriously open up before them, only to vanish once they have reached their destination.'
WHERE key = 'ALTER' AND dataset_source = 'oggdude';

-- 3. Swap the single-column PK for a composite one, matching ref_talents,
--    ref_force_abilities, ref_specializations, ref_careers. Safe at this
--    point: every existing row still has a distinct `key` (dataset_source is
--    uniformly 'oggdude' from the DEFAULT above), so the composite pair is
--    trivially unique too.
--    ref_force_abilities_power_key_fkey depends on this PK, so it must be
--    dropped first — it is re-added as a composite FK in
--    103_force_power_dataset_scoping_finish.sql, once 102's respec-flavored
--    rows exist for it to validate against. There is a brief window (only
--    inside this multi-migration transaction, never visible to a committed
--    reader) where ref_force_abilities.power_key has no FK at all.
ALTER TABLE ref_force_abilities DROP CONSTRAINT ref_force_abilities_power_key_fkey;
ALTER TABLE ref_force_powers DROP CONSTRAINT ref_force_powers_pkey;
ALTER TABLE ref_force_powers ADD PRIMARY KEY (key, dataset_source);
