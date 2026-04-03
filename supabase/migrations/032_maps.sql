-- ═══════════════════════════════════════
-- HOLOCRON Migration 032: Map System
-- ═══════════════════════════════════════

-- ── Storage buckets ──
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES
  ('maps',   'maps',   true, 10485760),
  ('tokens', 'tokens', true, 2097152)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS (anon allowed — app uses PIN auth, never supabase.auth.signIn)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'maps_select_public'   AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "maps_select_public"   ON storage.objects FOR SELECT USING (bucket_id = 'maps');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'maps_insert_anon'     AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "maps_insert_anon"     ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'maps');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'maps_update_anon'     AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "maps_update_anon"     ON storage.objects FOR UPDATE USING (bucket_id = 'maps');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'maps_delete_anon'     AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "maps_delete_anon"     ON storage.objects FOR DELETE USING (bucket_id = 'maps');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tokens_select_public' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "tokens_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'tokens');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tokens_insert_anon'   AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "tokens_insert_anon"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tokens');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tokens_update_anon'   AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "tokens_update_anon"   ON storage.objects FOR UPDATE USING (bucket_id = 'tokens');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tokens_delete_anon'   AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "tokens_delete_anon"   ON storage.objects FOR DELETE USING (bucket_id = 'tokens');
  END IF;
END $$;

-- ── Maps table ──
CREATE TABLE IF NOT EXISTS maps (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id           uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  image_url             text NOT NULL,
  grid_enabled          boolean NOT NULL DEFAULT false,
  grid_size             integer DEFAULT 50,
  is_active             boolean NOT NULL DEFAULT false,
  is_visible_to_players boolean NOT NULL DEFAULT false,
  created_at            timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_maps_one_active
  ON maps (campaign_id) WHERE is_active = true;

ALTER TABLE maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maps_all_anon" ON maps FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE maps;

-- ── Map tokens table ──
CREATE TABLE IF NOT EXISTS map_tokens (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id           uuid REFERENCES maps(id) ON DELETE CASCADE,
  campaign_id      uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  participant_type text NOT NULL CHECK (participant_type IN ('pc', 'adversary')),
  character_id     uuid REFERENCES characters(id) ON DELETE SET NULL,
  participant_id   uuid REFERENCES combat_participants(id) ON DELETE SET NULL,
  label            text,
  alignment        text,
  x                float NOT NULL DEFAULT 0.5,
  y                float NOT NULL DEFAULT 0.5,
  is_visible       boolean NOT NULL DEFAULT true,
  token_size       float NOT NULL DEFAULT 1.0,
  wound_pct        float,
  token_image_url  text,
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE map_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "map_tokens_all_anon" ON map_tokens FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE map_tokens;

-- ── Adversary token images (keyed by adversary id — cross-session) ──
CREATE TABLE IF NOT EXISTS adversary_token_images (
  adversary_key    text PRIMARY KEY,
  token_image_url  text NOT NULL,
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE adversary_token_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "adv_tokens_all_anon" ON adversary_token_images FOR ALL USING (true) WITH CHECK (true);
