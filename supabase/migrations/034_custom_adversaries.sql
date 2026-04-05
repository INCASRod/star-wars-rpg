-- Migration 034: ref_adversaries table for GM-created custom adversaries
-- OggDude adversaries remain in /public/adversaries.json (JSON, not DB).
-- This table only stores custom adversaries (is_custom = true always).

CREATE TABLE IF NOT EXISTS ref_adversaries (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text         NOT NULL,
  type             text         NOT NULL DEFAULT 'rival'
                               CHECK (type IN ('minion', 'rival', 'nemesis')),
  brawn            int          NOT NULL DEFAULT 2,
  agility          int          NOT NULL DEFAULT 2,
  intellect        int          NOT NULL DEFAULT 2,
  cunning          int          NOT NULL DEFAULT 2,
  willpower        int          NOT NULL DEFAULT 2,
  presence         int          NOT NULL DEFAULT 2,
  soak             int          NOT NULL DEFAULT 2,
  wound_threshold  int          NOT NULL DEFAULT 10,
  strain_threshold int,
  defense_melee    int          NOT NULL DEFAULT 0,
  defense_ranged   int          NOT NULL DEFAULT 0,
  -- skill_ranks: { "Ranged (Heavy)": 2, "Melee": 1 }
  skill_ranks      jsonb        NOT NULL DEFAULT '{}',
  -- weapons: array of { name, damage, range, skillCategory, qualities }
  weapons          jsonb        NOT NULL DEFAULT '[]',
  -- talents: array of { name, description }
  talents          jsonb        NOT NULL DEFAULT '[]',
  -- abilities: array of { name, description }
  abilities        jsonb        NOT NULL DEFAULT '[]',
  gear             jsonb        NOT NULL DEFAULT '[]',
  description      text,
  is_custom        boolean      NOT NULL DEFAULT true,
  campaign_id      uuid         REFERENCES campaigns(id) ON DELETE CASCADE,
  custom_notes     text,
  created_at       timestamptz  NOT NULL DEFAULT now(),
  updated_at       timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE ref_adversaries ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read custom adversaries
CREATE POLICY "ref_adv_select" ON ref_adversaries
  FOR SELECT TO authenticated USING (true);

-- Only custom adversaries can be inserted
CREATE POLICY "ref_adv_insert" ON ref_adversaries
  FOR INSERT TO authenticated
  WITH CHECK (is_custom = true);

-- Only custom adversaries can be updated
CREATE POLICY "ref_adv_update" ON ref_adversaries
  FOR UPDATE TO authenticated
  USING (is_custom = true)
  WITH CHECK (is_custom = true);

-- Only custom adversaries can be deleted
CREATE POLICY "ref_adv_delete" ON ref_adversaries
  FOR DELETE TO authenticated
  USING (is_custom = true);
