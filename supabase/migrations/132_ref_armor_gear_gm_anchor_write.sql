-- Migration 132: GM write access for worn_anchor on non-custom ref rows
--
-- Prompt 10, Task 2: the GM anchor override in ItemDatabaseTab needs to
-- write worn_anchor on ANY ref_armor/ref_gear row, including system
-- (is_custom = false) rows -- e.g. every row touched by migrations 125/131.
-- Existing RLS ("GM write custom ref_armor/ref_gear", "Anon/Authenticated
-- can update custom armor/gear") only covers is_custom = true rows scoped to
-- a campaign. worn_anchor is a global reference value, not campaign-scoped,
-- so this policy is intentionally NOT gated on is_custom or campaign_id --
-- only on the acting user being a GM in at least one campaign, matching the
-- "GM write custom ref_*" policy's own is_gm check.
--
-- No column-level restriction is enforced here (Postgres RLS is row-scoped,
-- not column-scoped) -- the app UI is the only thing limiting this policy's
-- use to the worn_anchor field in practice, same as every other write policy
-- in this schema.
--
-- DECISION (Prompt 10, Task 2 conversation): no provenance/tracking column
-- added to distinguish researched vs bulk-default vs GM-edited worn_anchor
-- values -- value only, no source metadata.

CREATE POLICY "GM write worn_anchor ref_armor" ON ref_armor
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM players WHERE players.user_id = auth.uid() AND players.is_gm = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM players WHERE players.user_id = auth.uid() AND players.is_gm = true)
  );

CREATE POLICY "GM write worn_anchor ref_gear" ON ref_gear
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM players WHERE players.user_id = auth.uid() AND players.is_gm = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM players WHERE players.user_id = auth.uid() AND players.is_gm = true)
  );
