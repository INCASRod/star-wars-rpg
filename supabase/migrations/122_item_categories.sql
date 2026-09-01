-- Migration 122: category columns for ref_armor and ref_gear
-- Matches ref_weapons.categories exactly (TEXT[], nullable, no default) so
-- item category/type data can be surfaced and filtered the same way across
-- weapons, armor, and gear. Source data on the reSpec side is shaped
-- differently per table (Armor uses <Categories><Category>, Gear uses a
-- single <Type> string) -- both are normalized into this same TEXT[] shape
-- by scripts/backfill-item-categories.ts.

ALTER TABLE ref_armor
  ADD COLUMN IF NOT EXISTS categories TEXT[];

ALTER TABLE ref_gear
  ADD COLUMN IF NOT EXISTS categories TEXT[];

-- ── RLS: ref_armor / ref_gear already have RLS enabled with a public-read
-- policy (003_rls_policies.sql). Adding a nullable column requires no policy
-- change -- the existing "Public read ref_armor" / "Public read ref_gear"
-- policies already cover the new column. Confirmed unchanged below for
-- clarity/audit trail only (no-op if already present).

DO $$
BEGIN
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
