-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 026: Weapon handedness GM overrides
--
-- Adds per-weapon override columns so GMs can force a weapon to be treated
-- as one-handed (e.g. a melee weapon used one-handed by GM discretion) or
-- two-handed (reverse). Both default NULL = use auto-detection from skill key.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE character_weapons
  ADD COLUMN IF NOT EXISTS is_one_handed_override boolean,
  ADD COLUMN IF NOT EXISTS is_two_handed_override boolean;

COMMENT ON COLUMN character_weapons.is_one_handed_override IS
  'GM override: treat this weapon as one-handed regardless of skill type.';
COMMENT ON COLUMN character_weapons.is_two_handed_override IS
  'GM override: treat this weapon as two-handed regardless of skill type.';
