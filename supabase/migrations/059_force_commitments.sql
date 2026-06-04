-- Add force_commitments JSONB column to characters
-- Tracks which powers have Force dice committed
-- Shape: [{ power_key, power_name, effect_name, dice_count }]

ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS
    force_commitments JSONB DEFAULT '[]'::jsonb;

-- No RLS change needed — characters table RLS already covers this column.
