-- Migration 096: Force-sensitive tags for Force & Destiny specializations, retire
-- the four (three seeded) gateway universals.
--
-- ref_specializations.is_force_sensitive is authored, not derived — reSpec's XML
-- does not encode Force-sensitivity. This flags the 36 respec rows confirmed by
-- name-match audit to exist in the dataset (several list entries — Archivist,
-- Lancer, Shaman, Reclaimer, Trickster, Champion, Slayer, and the four Jedi
-- specs — are newer reSpec additions not yet seeded and are deliberately
-- skipped, not created). Also retires the gateway universals a character should
-- no longer be able to newly select. Force Sensitive Outcast has no respec row
-- and is skipped. NIGHTSISTER (oggdude) is already flagged and is untouched —
-- the picker filters strictly by dataset_source so it has no visible effect.
--
-- Additive/idempotent: only ever sets flags to true, never false. Re-running
-- this migration is a no-op.

UPDATE ref_specializations
SET is_force_sensitive = true
WHERE dataset_source = 'respec'
  AND key IN (
    'ARBITER', 'ASCETIC', 'HEALER', 'SAGE', 'TEACHER',
    'ARMORER', 'PEACE', 'PROTECT', 'WARDEN', 'WARLEADER',
    'ADVISOR', 'ALCHEMIST', 'MAGUS', 'PROPHET', 'SEER',
    'EXECUTIONER', 'HERMIT', 'HUNTER', 'NAVIGATOR', 'PATH',
    'ARTISAN', 'INVESTIGATOR', 'RACER', 'SENTRY', 'SHADOW',
    'AGGRES', 'COLOSSUS', 'STARACE', 'STEELHANDADEPT',
    'ATARU', 'JUYOBERSERKER', 'MAKASHI', 'NIMAN', 'SHIEN', 'SHIICHO', 'SORESU'
  )
  AND is_force_sensitive = false;

-- Gateway universals: retired means "cannot be newly selected" (excluded from
-- the buy modal and creation picker via existing is_retired = false filters).
-- The owned-spec fallback in useCharacterData.ts no longer filters on
-- is_retired (fixed alongside this migration), so characters who already own
-- one of these keep their spec name, talent tree, and career skills intact.
UPDATE ref_specializations
SET is_retired = true
WHERE dataset_source = 'respec'
  AND key IN ('FORCESENSITIVEEXILE', 'FORCESENSITIVEEMERGENT', 'PADAWANSURVIVOR')
  AND is_retired = false;
