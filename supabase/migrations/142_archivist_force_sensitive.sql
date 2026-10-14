-- Migration 142: ARCHIVIST is a Force-sensitive specialization (Force Star in the
-- reSpecialized Primer v2.1). Migration 096 skipped it because it had not been
-- seeded yet; it has been in ref_specializations since the Jun/Jul 2026 snapshot
-- but was left is_force_sensitive = false.
--
-- is_force_sensitive is authored, not derived (see 096). Additive/idempotent:
-- only ever sets the flag to true. respec rows only — oggdude is untouched.

UPDATE ref_specializations
SET is_force_sensitive = true
WHERE dataset_source = 'respec'
  AND key = 'ARCHIVIST'
  AND is_force_sensitive = false;
