-- Migration 030: Destiny Pool — generation, roll log, spend log

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS destiny_pool (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  session_label   text,
  light_count     integer NOT NULL DEFAULT 0,
  dark_count      integer NOT NULL DEFAULT 0,
  generated_at    timestamptz DEFAULT now(),
  is_active       boolean NOT NULL DEFAULT true
);

-- Only one active pool per campaign at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_destiny_pool_active
  ON destiny_pool (campaign_id)
  WHERE is_active = true;

CREATE TABLE IF NOT EXISTS destiny_pool_rolls (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  pool_id         uuid REFERENCES destiny_pool(id) ON DELETE CASCADE,
  character_id    uuid REFERENCES characters(id) ON DELETE CASCADE,
  character_name  text NOT NULL,
  light_rolled    integer NOT NULL DEFAULT 0,
  dark_rolled     integer NOT NULL DEFAULT 0,
  die_result      jsonb,
  rolled_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS destiny_spend_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  pool_id         uuid REFERENCES destiny_pool(id) ON DELETE CASCADE,
  spent_by        text NOT NULL,
  spent_by_id     uuid,
  side_spent      text NOT NULL CHECK (side_spent IN ('light', 'dark')),
  spent_at        timestamptz DEFAULT now(),
  action_context  text
);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE destiny_pool        ENABLE ROW LEVEL SECURITY;
ALTER TABLE destiny_pool_rolls  ENABLE ROW LEVEL SECURITY;
ALTER TABLE destiny_spend_log   ENABLE ROW LEVEL SECURITY;

-- Permissive (same pattern as existing campaign tables — PIN-based auth)
CREATE POLICY "Public all destiny_pool"
  ON destiny_pool FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public all destiny_pool_rolls"
  ON destiny_pool_rolls FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public all destiny_spend_log"
  ON destiny_spend_log FOR ALL USING (true) WITH CHECK (true);

-- ── Realtime ─────────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE destiny_pool;
ALTER PUBLICATION supabase_realtime ADD TABLE destiny_pool_rolls;
ALTER PUBLICATION supabase_realtime ADD TABLE destiny_spend_log;
