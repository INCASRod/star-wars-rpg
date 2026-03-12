-- Migration 004: Force Powers tables

-- Reference: force powers with ability tree structure
CREATE TABLE ref_force_powers (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  min_force_rating INT DEFAULT 1,
  sources JSONB,
  ability_tree JSONB
);

-- Reference: individual force abilities (for name/description lookup)
CREATE TABLE ref_force_abilities (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  power_key TEXT REFERENCES ref_force_powers(key),
  sources JSONB
);

-- Character's purchased force abilities
CREATE TABLE character_force_abilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  force_power_key TEXT NOT NULL,
  force_ability_key TEXT NOT NULL,
  tree_row INT,
  tree_col INT,
  xp_cost INT DEFAULT 0,
  UNIQUE(character_id, force_power_key, tree_row, tree_col)
);

-- RLS
ALTER TABLE ref_force_powers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_force_abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_force_abilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ref_force_powers" ON ref_force_powers FOR SELECT USING (true);
CREATE POLICY "Public read ref_force_abilities" ON ref_force_abilities FOR SELECT USING (true);
CREATE POLICY "Public all character_force_abilities" ON character_force_abilities FOR ALL USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE character_force_abilities;
