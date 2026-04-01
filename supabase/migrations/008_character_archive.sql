-- 008_character_archive.sql
-- Soft-delete (archive) support for characters.
-- Archived characters are hidden from all player-facing views but remain
-- fully visible (and restorable) from the GM dashboard.

ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS is_archived  boolean      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at  timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by  uuid         REFERENCES auth.users(id);

-- Index for the character select query performance
CREATE INDEX IF NOT EXISTS idx_characters_is_archived
  ON characters (is_archived);

-- Composite index so the common player-facing query
-- (.eq('campaign_id', x).eq('is_archived', false)) hits a covering index.
CREATE INDEX IF NOT EXISTS idx_characters_campaign_active
  ON characters (campaign_id, is_archived);
