-- Migration 002: Campaign & character tables (read/write)

CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  gm_pin TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  display_name TEXT NOT NULL,
  campaign_id UUID REFERENCES campaigns(id),
  is_gm BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  name TEXT NOT NULL,
  species_key TEXT REFERENCES ref_species(key),
  career_key TEXT REFERENCES ref_careers(key),
  gender TEXT,
  portrait_url TEXT,
  brawn INT NOT NULL DEFAULT 2,
  agility INT NOT NULL DEFAULT 2,
  intellect INT NOT NULL DEFAULT 2,
  cunning INT NOT NULL DEFAULT 2,
  willpower INT NOT NULL DEFAULT 2,
  presence INT NOT NULL DEFAULT 2,
  wound_threshold INT NOT NULL DEFAULT 10,
  wound_current INT NOT NULL DEFAULT 0,
  strain_threshold INT NOT NULL DEFAULT 10,
  strain_current INT NOT NULL DEFAULT 0,
  soak INT NOT NULL DEFAULT 2,
  defense_ranged INT NOT NULL DEFAULT 0,
  defense_melee INT NOT NULL DEFAULT 0,
  xp_total INT NOT NULL DEFAULT 0,
  xp_available INT NOT NULL DEFAULT 0,
  credits INT NOT NULL DEFAULT 500,
  encumbrance_threshold INT NOT NULL DEFAULT 5,
  morality_value INT DEFAULT 50,
  morality_strength_key TEXT,
  morality_weakness_key TEXT,
  obligation_type TEXT,
  obligation_value INT DEFAULT 10,
  obligation_notes TEXT,
  duty_type TEXT,
  duty_value INT DEFAULT 0,
  duty_notes TEXT,
  backstory TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE character_specializations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  specialization_key TEXT REFERENCES ref_specializations(key),
  is_starting BOOLEAN DEFAULT FALSE,
  purchase_order INT DEFAULT 0
);

CREATE TABLE character_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  skill_key TEXT REFERENCES ref_skills(key),
  rank INT NOT NULL DEFAULT 0,
  is_career BOOLEAN DEFAULT FALSE,
  UNIQUE(character_id, skill_key)
);

CREATE TABLE character_talents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  talent_key TEXT REFERENCES ref_talents(key),
  specialization_key TEXT,
  tree_row INT,
  tree_col INT,
  ranks INT DEFAULT 1,
  xp_cost INT
);

CREATE TABLE character_weapons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  weapon_key TEXT REFERENCES ref_weapons(key),
  custom_name TEXT,
  is_equipped BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  notes TEXT
);

CREATE TABLE character_armor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  armor_key TEXT REFERENCES ref_armor(key),
  custom_name TEXT,
  is_equipped BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  notes TEXT
);

CREATE TABLE character_gear (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  gear_key TEXT REFERENCES ref_gear(key),
  custom_name TEXT,
  quantity INT DEFAULT 1,
  is_equipped BOOLEAN DEFAULT FALSE,
  notes TEXT
);

CREATE TABLE character_critical_injuries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  injury_id INT REFERENCES ref_critical_injuries(id),
  custom_name TEXT,
  severity TEXT,
  description TEXT,
  is_healed BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE xp_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
