-- Migration 001: Reference data tables (read-only, seeded from OggDude)

CREATE TABLE ref_species (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  brawn INT, agility INT, intellect INT,
  cunning INT, willpower INT, presence INT,
  wound_threshold INT, strain_threshold INT,
  starting_xp INT,
  abilities JSONB,
  option_choices JSONB,
  source_book TEXT, source_page INT
);

CREATE TABLE ref_skills (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  characteristic_key TEXT,
  type TEXT
);

CREATE TABLE ref_careers (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  career_skill_keys TEXT[],
  specialization_keys TEXT[]
);

CREATE TABLE ref_specializations (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  career_key TEXT REFERENCES ref_careers(key),
  career_skill_keys TEXT[],
  talent_tree JSONB
);

CREATE TABLE ref_talents (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  activation TEXT,
  is_force_talent BOOLEAN DEFAULT FALSE,
  is_ranked BOOLEAN DEFAULT FALSE
);

CREATE TABLE ref_weapons (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  skill_key TEXT,
  damage INT, damage_add INT,
  crit INT,
  range_value TEXT,
  encumbrance INT, hard_points INT,
  price INT, rarity INT, restricted BOOLEAN,
  qualities JSONB,
  categories TEXT[]
);

CREATE TABLE ref_armor (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  defense INT, soak INT,
  encumbrance INT, hard_points INT,
  price INT, rarity INT
);

CREATE TABLE ref_gear (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  encumbrance INT,
  price INT, rarity INT
);

CREATE TABLE ref_moralities (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  paired_key TEXT
);

CREATE TABLE ref_obligations (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE ref_duties (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE ref_item_descriptors (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_passive BOOLEAN
);

CREATE TABLE ref_critical_injuries (
  id SERIAL PRIMARY KEY,
  roll_min INT,
  roll_max INT,
  severity TEXT,
  name TEXT NOT NULL,
  description TEXT
);
