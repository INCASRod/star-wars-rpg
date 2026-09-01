-- Migration 123: campaign-scoped item icon overrides
-- Lets a GM pin a specific image to a specific catalogue item (weapon,
-- armor, or gear), scoped to one campaign. Path construction stays in
-- application code -- this table only stores the chosen image identifier
-- (e.g. an equipment image key), not a full path, so the asset directory
-- can move later without a data migration.
--
-- Out of scope / untouched: item_image_url columns on character_weapons,
-- character_armor, character_gear -- those are a separate per-instance
-- mechanism.

CREATE TABLE item_icon_overrides (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id  UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  item_table   TEXT NOT NULL CHECK (item_table IN ('weapon', 'armor', 'gear')),
  item_key     TEXT NOT NULL,
  image_key    TEXT NOT NULL,
  set_by       UUID REFERENCES players(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, item_table, item_key)
);

-- ── RLS: same permissive campaign-scoped pattern as character_talents
-- (003_rls_policies.sql / 049_custom_talents.sql) -- access control for who
-- may write is enforced at the app layer (GM PIN), not in SQL, matching
-- every other campaign-scoped table in this project.

ALTER TABLE item_icon_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "item_icon_overrides_select" ON item_icon_overrides
  FOR SELECT USING (true);

CREATE POLICY "item_icon_overrides_insert" ON item_icon_overrides
  FOR INSERT WITH CHECK (true);

CREATE POLICY "item_icon_overrides_update" ON item_icon_overrides
  FOR UPDATE USING (true);

CREATE POLICY "item_icon_overrides_delete" ON item_icon_overrides
  FOR DELETE USING (true);
