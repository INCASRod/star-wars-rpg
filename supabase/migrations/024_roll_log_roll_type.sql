-- 024: Extend roll_log with roll classification fields for type-specific feed rendering.
-- These columns are optional — legacy rows will have NULL values and fall back to
-- the pool.force heuristic / roll_label pattern detection in the classifier.
ALTER TABLE roll_log
  ADD COLUMN IF NOT EXISTS roll_type             text,
  ADD COLUMN IF NOT EXISTS weapon_name           text,
  ADD COLUMN IF NOT EXISTS target_name           text,
  ADD COLUMN IF NOT EXISTS range_band            text,
  ADD COLUMN IF NOT EXISTS alignment             text DEFAULT 'player',
  ADD COLUMN IF NOT EXISTS is_visible_to_players boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS roll_meta             jsonb;
