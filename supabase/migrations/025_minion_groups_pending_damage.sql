-- ════════════════════════════════════════════════════════════════════════════
-- Migration 025: Minion Group Fields + Pending Damage Table
--
-- Adds minion-group tracking columns to combat_participants and creates the
-- pending_damage table that the GM uses to approve/modify damage before it
-- is applied to targets.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Part 1: combat_participants — minion group tracking fields ────────────────

ALTER TABLE combat_participants
  ADD COLUMN IF NOT EXISTS is_minion_group        boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS minion_count_initial   integer,
  ADD COLUMN IF NOT EXISTS minion_count_current   integer,
  ADD COLUMN IF NOT EXISTS minion_wound_individual integer,
  ADD COLUMN IF NOT EXISTS minion_wound_total      integer,
  ADD COLUMN IF NOT EXISTS current_wounds          integer     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wound_threshold         integer;

COMMENT ON COLUMN combat_participants.is_minion_group IS
  'True when this row represents a minion group rather than an individual.';
COMMENT ON COLUMN combat_participants.minion_count_initial IS
  'Starting group size (set once at combat setup).';
COMMENT ON COLUMN combat_participants.minion_count_current IS
  'Remaining alive minions in the group.';
COMMENT ON COLUMN combat_participants.minion_wound_individual IS
  'Wound threshold of a single minion in this group.';
COMMENT ON COLUMN combat_participants.minion_wound_total IS
  'Current group wound pool ceiling = minion_wound_individual × minion_count_current.';
COMMENT ON COLUMN combat_participants.current_wounds IS
  'Total wounds inflicted. For minion groups, the shared group wound pool.';
COMMENT ON COLUMN combat_participants.wound_threshold IS
  'Individual wound threshold for rivals/nemeses.';

-- ── Part 2: pending_damage — GM approval queue ────────────────────────────────
--
-- Each successful combat check creates one row per target.  The GM sees these
-- in a panel, can edit the final value, then applies or dismisses each one.
--
-- target_instance_id:  adversary JSONB instanceId in combat_encounters.adversaries
-- target_id:           combat_participants.id — used for PC / DB-tracked targets

CREATE TABLE IF NOT EXISTS pending_damage (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id          uuid        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  encounter_id         uuid,
  target_instance_id   text,
  target_id            uuid        REFERENCES combat_participants(id) ON DELETE CASCADE,
  attacker_name        text        NOT NULL,
  target_name          text        NOT NULL,
  raw_damage           integer     NOT NULL,
  soak_value           integer     NOT NULL DEFAULT 0,
  net_damage           integer     NOT NULL,
  status               text        NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending','applied','modified','dismissed')),
  applied_damage       integer,
  weapon_name          text,
  attack_type          text,
  range_band           text,
  created_at           timestamptz DEFAULT now(),
  resolved_at          timestamptz,
  resolved_by          uuid        REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_pending_damage_campaign
  ON pending_damage (campaign_id, status, created_at DESC);

-- Enable row-level security (inherit campaign access)
ALTER TABLE pending_damage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign members can read pending_damage"
  ON pending_damage FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE owner_id = auth.uid()
      UNION
      SELECT campaign_id FROM campaign_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign members can insert pending_damage"
  ON pending_damage FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE owner_id = auth.uid()
      UNION
      SELECT campaign_id FROM campaign_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign members can update pending_damage"
  ON pending_damage FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE owner_id = auth.uid()
      UNION
      SELECT campaign_id FROM campaign_members WHERE user_id = auth.uid()
    )
  );

-- Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE pending_damage;
