-- 093_fix_respec_career_specialization_keys.sql
-- Adds specialization keys that are missing from ref_careers.specialization_keys for the
-- respec dataset, for the 4 careers where the array is a genuine subset of the current
-- source XML (respec project data/Careers/*.xml) and every missing key already has a
-- matching ref_specializations row.
--
-- Audit findings (see conversation for full detail):
-- - CONSULAR, GUARD, SEEKER, SENTINEL each hold only half their career's specialization
--   list (3 of 6) in the DB; the other 3 exist as real ref_specializations rows but were
--   never added to the career's array.
-- - MYSTIC and WAR already match their source XML exactly (WAR's JUYOBERSERKER /
--   STEELHANDADEPT are the correctly-renamed forms of the XML's short JUYO / STEELHAND
--   keys, which have no ref_specializations row of their own).
-- - DIPLOMAT (missing ANALYSTRES) and SPY (missing 6 keys) are intentionally NOT touched
--   here: none of those keys exist as ref_specializations rows, so adding them would
--   create dangling references. Flagged separately, not a "gap" this migration can close.
-- - Non-F&D careers (Smuggler, Engineer, Diplomat, etc.) hold a deliberate superset of
--   old-era + new "reSpecialized" keys per migration 069's union approach — not touched.
-- - The seven Lightsaber Form universal specializations (Ataru Striker, Juyo Berserker,
--   Makashi Duelist, Niman Disciple, Shien Expert, Shii-Cho Knight, Soresu Defender) are
--   NOT added anywhere by this migration. They are already present in their respective
--   careers' arrays (Consular/Guardian/Seeker/Sentinel/Mystic/Warrior) in both the DB and
--   the current source XML -- untouched either way.
--
-- Idempotent: each UPDATE is guarded by a "does not already contain these keys" check,
-- so re-running this migration is a no-op the second time.

UPDATE ref_careers
SET specialization_keys = specialization_keys || ARRAY['ARBITER', 'ASCETIC', 'TEACHER']::text[]
WHERE dataset_source = 'respec'
  AND key = 'CONSULAR'
  AND NOT (specialization_keys @> ARRAY['ARBITER', 'ASCETIC', 'TEACHER']::text[]);

UPDATE ref_careers
SET specialization_keys = specialization_keys || ARRAY['ARMORER', 'WARDEN', 'WARLEADER']::text[]
WHERE dataset_source = 'respec'
  AND key = 'GUARD'
  AND NOT (specialization_keys @> ARRAY['ARMORER', 'WARDEN', 'WARLEADER']::text[]);

UPDATE ref_careers
SET specialization_keys = specialization_keys || ARRAY['EXECUTIONER', 'HERMIT', 'NAVIGATOR']::text[]
WHERE dataset_source = 'respec'
  AND key = 'SEEKER'
  AND NOT (specialization_keys @> ARRAY['EXECUTIONER', 'HERMIT', 'NAVIGATOR']::text[]);

UPDATE ref_careers
SET specialization_keys = specialization_keys || ARRAY['INVESTIGATOR', 'RACER', 'SENTRY']::text[]
WHERE dataset_source = 'respec'
  AND key = 'SENTINEL'
  AND NOT (specialization_keys @> ARRAY['INVESTIGATOR', 'RACER', 'SENTRY']::text[]);
