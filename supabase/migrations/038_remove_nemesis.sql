-- ── Remove Nemesis system ────────────────────────────────────────────────────
-- Delete all characters created as Nemeses
DELETE FROM characters WHERE adversary_type = 'nemesis';

-- Drop the nemesis-related columns and their index
DROP INDEX IF EXISTS idx_characters_adversary_type;
DROP INDEX IF EXISTS idx_characters_is_pc;

ALTER TABLE characters
  DROP COLUMN IF EXISTS adversary_type,
  DROP COLUMN IF EXISTS is_pc;
