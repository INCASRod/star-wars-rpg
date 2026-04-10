-- ── Nemesis system columns ────────────────────────────────────────────────────
-- is_pc: true for player characters (default), false for GM-owned characters
-- adversary_type: classification for non-PC characters; null means PC

ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS is_pc boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS adversary_type text
    CHECK (adversary_type IN ('minion', 'rival', 'nemesis'));

-- Backfill: all existing characters are player characters
UPDATE characters SET is_pc = true WHERE is_pc IS NULL;

-- Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_characters_is_pc ON characters (campaign_id, is_pc);
CREATE INDEX IF NOT EXISTS idx_characters_adversary_type ON characters (campaign_id, adversary_type);
