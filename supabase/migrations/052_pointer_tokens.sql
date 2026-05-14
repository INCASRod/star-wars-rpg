-- ═══════════════════════════════════════════════════════════════
-- HOLOCRON Migration 052: Pointer Token Type
-- ═══════════════════════════════════════════════════════════════
-- Adds a token_type discriminator to map_tokens so the GM can
-- place non-combat visual pointer markers (green / red / orange).
-- All existing rows remain unaffected (token_type defaults to NULL).
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE map_tokens ADD COLUMN IF NOT EXISTS token_type text;
