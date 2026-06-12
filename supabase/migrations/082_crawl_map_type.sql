-- 082_crawl_map_type.sql
-- Adds map_type and crawl_content to the maps table for the Opening Crawl feature.
-- A row with map_type='crawl' is a special system row per campaign, not a regular map.

ALTER TABLE maps
  ADD COLUMN IF NOT EXISTS map_type     text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS crawl_content jsonb;

-- Add CHECK constraint idempotently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'maps_map_type_check'
       AND conrelid = 'maps'::regclass
  ) THEN
    ALTER TABLE maps
      ADD CONSTRAINT maps_map_type_check CHECK (map_type IN ('standard', 'crawl'));
  END IF;
END$$;
