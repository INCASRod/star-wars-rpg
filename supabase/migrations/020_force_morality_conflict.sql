-- Migration 020: Force sensitivity, morality setup, and conflict tracking

-- ── characters additions ──────────────────────────────────────────────────────
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS force_rating           integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS force_rating_committed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS morality_configured    boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN characters.force_rating IS
  'Total Force Rating from all sources, cached from derived stats engine.';
COMMENT ON COLUMN characters.force_rating_committed IS
  'Force dice currently committed to ongoing effects. Reduces available pool.';

-- ── ref_moralities ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ref_moralities (
  key          text PRIMARY KEY,
  name         text NOT NULL,
  type         text NOT NULL CHECK (type IN ('Strength', 'Weakness')),
  description  text,
  paired_key   text  -- matched weakness for a Strength entry (or vice versa)
);

ALTER TABLE ref_moralities ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public read ref_moralities"
  ON ref_moralities FOR SELECT USING (true);

-- ── character_conflicts ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS character_conflicts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  uuid REFERENCES characters(id) ON DELETE CASCADE,
  campaign_id   uuid REFERENCES campaigns(id)  ON DELETE CASCADE,
  description   text,
  session_label text,
  is_resolved   boolean NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  resolved_at   timestamptz,
  created_by    uuid REFERENCES auth.users(id)
);

ALTER TABLE character_conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public all character_conflicts"
  ON character_conflicts FOR ALL USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE character_conflicts;

-- ── force_spec_requests ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS force_spec_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   uuid REFERENCES campaigns(id)   ON DELETE CASCADE,
  character_id  uuid REFERENCES characters(id)  ON DELETE CASCADE,
  spec_key      text NOT NULL,
  spec_name     text NOT NULL,
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'denied')),
  created_at    timestamptz DEFAULT now(),
  resolved_at   timestamptz,
  resolved_by   uuid REFERENCES auth.users(id)
);

ALTER TABLE force_spec_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public all force_spec_requests"
  ON force_spec_requests FOR ALL USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE force_spec_requests;
