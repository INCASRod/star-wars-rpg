-- Migration 090: add spec_slot to character_sig_ability_nodes
--
-- Found while implementing useCharacterSigAbilities (Step 3): the hook's
-- `lockedAbilities` is keyed by spec slot ("which specialization was this
-- signature ability locked in against"), and `lockInAbility(sigAbilityKey,
-- specSlot)` takes a specSlot argument — but migration 088's
-- character_sig_ability_nodes had no column to persist that association.
-- A character can own more than one in-career specialization and lock a
-- signature ability under each independently, so this can't be derived from
-- sig_ability_key/career_key alone. Table is empty (088+089 only touched
-- ref_* tables), so no backfill needed.

ALTER TABLE character_sig_ability_nodes
  ADD COLUMN IF NOT EXISTS spec_slot TEXT;

CREATE INDEX IF NOT EXISTS idx_character_sig_ability_nodes_spec_slot
  ON character_sig_ability_nodes (character_id, spec_slot);
