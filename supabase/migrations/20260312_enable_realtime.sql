-- ============================================================
-- REALTIME FIX — run this once in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/peodenvcchftqqtikdhx/sql/new
-- ============================================================

-- ── 1. Create roll_log if it doesn't exist yet ───────────────
CREATE TABLE IF NOT EXISTS roll_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id    UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  character_id   UUID,
  character_name TEXT NOT NULL DEFAULT '',
  roll_label     TEXT,
  pool           JSONB NOT NULL DEFAULT '{}',
  result         JSONB NOT NULL DEFAULT '{}',
  is_dm          BOOLEAN NOT NULL DEFAULT false,
  hidden         BOOLEAN NOT NULL DEFAULT false,
  rolled_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_roll_log_campaign ON roll_log(campaign_id, rolled_at DESC);

-- ── 2. Fix combat_encounters RLS (was: auth only → now: public) ─
-- The old policies block the anon key entirely.
DROP POLICY IF EXISTS "Anyone authenticated can read combat_encounters"   ON combat_encounters;
DROP POLICY IF EXISTS "Anyone authenticated can insert combat_encounters" ON combat_encounters;
DROP POLICY IF EXISTS "Anyone authenticated can update combat_encounters" ON combat_encounters;
CREATE POLICY "Public read combat_encounters"   ON combat_encounters FOR SELECT USING (true);
CREATE POLICY "Public insert combat_encounters" ON combat_encounters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update combat_encounters" ON combat_encounters FOR UPDATE USING (true);
CREATE POLICY "Public delete combat_encounters" ON combat_encounters FOR DELETE USING (true);

-- ── 3. RLS for roll_log ──────────────────────────────────────
ALTER TABLE roll_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read roll_log"   ON roll_log FOR SELECT USING (true);
CREATE POLICY "Public insert roll_log" ON roll_log FOR INSERT WITH CHECK (true);

-- ── 4. Add all tables to supabase_realtime publication ───────
-- (safe: skips tables already in the publication)
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'characters',
    'character_skills',
    'character_talents',
    'character_weapons',
    'character_armor',
    'character_gear',
    'character_critical_injuries',
    'character_specializations',
    'campaigns',
    'combat_encounters',
    'roll_log'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
      RAISE NOTICE 'Added % to supabase_realtime', t;
    ELSE
      RAISE NOTICE '% already in publication — skipped', t;
    END IF;
  END LOOP;
END $$;

-- ── 5. REPLICA IDENTITY FULL ─────────────────────────────────
-- Required so UPDATE/DELETE events carry the full row, enabling
-- filtered subscriptions on non-PK columns (e.g. character_id).
ALTER TABLE characters                  REPLICA IDENTITY FULL;
ALTER TABLE character_skills            REPLICA IDENTITY FULL;
ALTER TABLE character_talents           REPLICA IDENTITY FULL;
ALTER TABLE character_weapons           REPLICA IDENTITY FULL;
ALTER TABLE character_armor             REPLICA IDENTITY FULL;
ALTER TABLE character_gear              REPLICA IDENTITY FULL;
ALTER TABLE character_critical_injuries REPLICA IDENTITY FULL;
ALTER TABLE character_force_abilities   REPLICA IDENTITY FULL;
ALTER TABLE character_specializations   REPLICA IDENTITY FULL;
ALTER TABLE campaigns                   REPLICA IDENTITY FULL;
ALTER TABLE combat_encounters           REPLICA IDENTITY FULL;
ALTER TABLE roll_log                    REPLICA IDENTITY FULL;
