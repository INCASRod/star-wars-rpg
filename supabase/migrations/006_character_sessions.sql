-- Character lobby sessions — tracks which player has claimed which character
CREATE TABLE IF NOT EXISTS character_sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  character_id uuid REFERENCES characters(id) ON DELETE CASCADE,
  session_key  text NOT NULL,
  player_name  text NOT NULL,
  is_active    boolean DEFAULT true,
  claimed_at   timestamptz DEFAULT now(),
  UNIQUE(campaign_id, character_id)
);
CREATE INDEX IF NOT EXISTS idx_char_sessions_campaign ON character_sessions(campaign_id);
ALTER TABLE character_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read character_sessions" ON character_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert character_sessions" ON character_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update character_sessions" ON character_sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete character_sessions" ON character_sessions FOR DELETE USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE character_sessions;
