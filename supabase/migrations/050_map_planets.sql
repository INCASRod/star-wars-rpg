-- Map planets: folder-style grouping for the map library
CREATE TABLE map_planets (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_map_planets_campaign ON map_planets(campaign_id);

-- Planet assignment on each map (SET NULL when planet is deleted)
ALTER TABLE maps ADD COLUMN planet_id uuid REFERENCES map_planets(id) ON DELETE SET NULL;

CREATE INDEX idx_maps_planet ON maps(planet_id);

-- RLS: same open policy as the rest of the app
ALTER TABLE map_planets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "map_planets_select" ON map_planets FOR SELECT USING (true);
CREATE POLICY "map_planets_insert" ON map_planets FOR INSERT WITH CHECK (true);
CREATE POLICY "map_planets_update" ON map_planets FOR UPDATE USING (true);
CREATE POLICY "map_planets_delete" ON map_planets FOR DELETE USING (true);
