-- 028_critical_injury_system.sql
-- Extends character_critical_injuries with roll tracking fields
-- and adds the critical_injury_requests table for the GM→player roll request flow.

-- ── Extend character_critical_injuries ───────────────────────────────────────
ALTER TABLE character_critical_injuries
  ADD COLUMN IF NOT EXISTS roll_result   integer,
  ADD COLUMN IF NOT EXISTS total_roll    integer,
  ADD COLUMN IF NOT EXISTS session_label text,
  ADD COLUMN IF NOT EXISTS vicious_mod   integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lethal_mod    integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gm_modifier   integer DEFAULT 0;

-- ── critical_injury_requests ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS critical_injury_requests (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id    uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  character_id   uuid REFERENCES characters(id) ON DELETE CASCADE,
  total_modifier integer NOT NULL DEFAULT 0,
  vicious_mod    integer NOT NULL DEFAULT 0,
  lethal_mod     integer NOT NULL DEFAULT 0,
  gm_modifier    integer NOT NULL DEFAULT 0,
  existing_mod   integer NOT NULL DEFAULT 0,
  status         text    NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'rolled', 'dismissed')),
  roll_result    integer,
  final_result   integer,
  injury_key     integer,  -- id of matched ref_critical_injuries row
  created_at     timestamptz DEFAULT now(),
  resolved_at    timestamptz
);

-- ── RLS (matches existing open policy pattern for campaign data) ──────────────
ALTER TABLE critical_injury_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write critical_injury_requests"
  ON critical_injury_requests FOR ALL
  USING (true) WITH CHECK (true);

-- ── Realtime ─────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE critical_injury_requests;
