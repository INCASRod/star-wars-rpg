-- ── Group Sheet: campaigns + group_assets ─────────────────────────────────────

-- Extend campaigns with group-level fields
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS group_name                    text,
  ADD COLUMN IF NOT EXISTS group_name_editable           boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS base_of_operations_name       text,
  ADD COLUMN IF NOT EXISTS base_of_operations_description text,
  ADD COLUMN IF NOT EXISTS contribution_rank             integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contribution_rank_descriptions jsonb   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_alliance_reward          jsonb   DEFAULT NULL;

-- Group assets accumulated by the party
CREATE TABLE IF NOT EXISTS group_assets (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid        REFERENCES campaigns(id) ON DELETE CASCADE,
  asset_type  text        NOT NULL CHECK (asset_type IN ('npc','vehicle','starship','safe_house','strategic_asset','other')),
  name        text        NOT NULL,
  description text,
  added_by    text,
  created_at  timestamptz DEFAULT now(),
  is_archived boolean     DEFAULT false
);

-- RLS: public role (matches the rest of the app — no Supabase auth)
ALTER TABLE group_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public select group_assets"
  ON group_assets FOR SELECT TO public USING (true);

CREATE POLICY "public insert group_assets"
  ON group_assets FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "public update group_assets"
  ON group_assets FOR UPDATE TO public USING (true);

CREATE POLICY "public delete group_assets"
  ON group_assets FOR DELETE TO public USING (true);

-- Realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE group_assets;
-- campaigns already in supabase_realtime publication from earlier migration
