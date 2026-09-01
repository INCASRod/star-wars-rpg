-- Migration 124: effect_text and lore_text columns
--
-- Additive split of the existing `description` column into mechanical text
-- (effect_text) and flavour text (lore_text) for the player-facing item
-- detail panel rebuild. `description` is NOT modified, renamed, or cleared --
-- every existing surface that reads it keeps working unchanged. Backfilled
-- by scripts/backfill-item-descriptions.ts (ref rows only; custom items are
-- skipped by the backfill and get these columns only when edited via
-- ItemEditor).

ALTER TABLE ref_weapons
  ADD COLUMN IF NOT EXISTS effect_text TEXT,
  ADD COLUMN IF NOT EXISTS lore_text   TEXT;

ALTER TABLE ref_armor
  ADD COLUMN IF NOT EXISTS effect_text TEXT,
  ADD COLUMN IF NOT EXISTS lore_text   TEXT;

ALTER TABLE ref_gear
  ADD COLUMN IF NOT EXISTS effect_text TEXT,
  ADD COLUMN IF NOT EXISTS lore_text   TEXT;

-- ── RLS: ref_weapons / ref_armor / ref_gear already have RLS enabled with a
-- public-read policy (003_rls_policies.sql, reaffirmed 122). Nullable columns
-- on an existing table need no policy change -- the existing "Public read
-- ref_*" policies already cover effect_text/lore_text. Confirmed unchanged
-- below for clarity/audit trail only (no-op if already present). Anon-key
-- REST readability of the new columns is verified separately, per project
-- convention -- policy presence in pg_policies is necessary but not
-- sufficient proof.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ref_weapons' AND policyname = 'Public read ref_weapons'
  ) THEN
    CREATE POLICY "Public read ref_weapons" ON ref_weapons FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ref_armor' AND policyname = 'Public read ref_armor'
  ) THEN
    CREATE POLICY "Public read ref_armor" ON ref_armor FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ref_gear' AND policyname = 'Public read ref_gear'
  ) THEN
    CREATE POLICY "Public read ref_gear" ON ref_gear FOR SELECT USING (true);
  END IF;
END $$;
