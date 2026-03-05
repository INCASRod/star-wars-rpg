-- Migration 003: Row Level Security policies
-- NOTE: For initial development, we use permissive policies.
-- These will be tightened when Supabase Auth is integrated.

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_talents ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_armor ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_gear ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_critical_injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- Reference tables: public read access
ALTER TABLE ref_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_talents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_armor ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_gear ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_moralities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_item_descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_critical_injuries ENABLE ROW LEVEL SECURITY;

-- Permissive read policies for all reference tables
CREATE POLICY "Public read ref_species" ON ref_species FOR SELECT USING (true);
CREATE POLICY "Public read ref_skills" ON ref_skills FOR SELECT USING (true);
CREATE POLICY "Public read ref_careers" ON ref_careers FOR SELECT USING (true);
CREATE POLICY "Public read ref_specializations" ON ref_specializations FOR SELECT USING (true);
CREATE POLICY "Public read ref_talents" ON ref_talents FOR SELECT USING (true);
CREATE POLICY "Public read ref_weapons" ON ref_weapons FOR SELECT USING (true);
CREATE POLICY "Public read ref_armor" ON ref_armor FOR SELECT USING (true);
CREATE POLICY "Public read ref_gear" ON ref_gear FOR SELECT USING (true);
CREATE POLICY "Public read ref_moralities" ON ref_moralities FOR SELECT USING (true);
CREATE POLICY "Public read ref_obligations" ON ref_obligations FOR SELECT USING (true);
CREATE POLICY "Public read ref_duties" ON ref_duties FOR SELECT USING (true);
CREATE POLICY "Public read ref_item_descriptors" ON ref_item_descriptors FOR SELECT USING (true);
CREATE POLICY "Public read ref_critical_injuries" ON ref_critical_injuries FOR SELECT USING (true);

-- Permissive policies for campaign data (pre-auth, PIN-based)
CREATE POLICY "Public read campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read characters" ON characters FOR SELECT USING (true);
CREATE POLICY "Public update characters" ON characters FOR UPDATE USING (true);
CREATE POLICY "Public insert characters" ON characters FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read character_specializations" ON character_specializations FOR SELECT USING (true);
CREATE POLICY "Public all character_specializations" ON character_specializations FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read character_skills" ON character_skills FOR SELECT USING (true);
CREATE POLICY "Public update character_skills" ON character_skills FOR UPDATE USING (true);
CREATE POLICY "Public insert character_skills" ON character_skills FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read character_talents" ON character_talents FOR SELECT USING (true);
CREATE POLICY "Public insert character_talents" ON character_talents FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read character_weapons" ON character_weapons FOR SELECT USING (true);
CREATE POLICY "Public all character_weapons" ON character_weapons FOR ALL USING (true);

CREATE POLICY "Public read character_armor" ON character_armor FOR SELECT USING (true);
CREATE POLICY "Public all character_armor" ON character_armor FOR ALL USING (true);

CREATE POLICY "Public read character_gear" ON character_gear FOR SELECT USING (true);
CREATE POLICY "Public all character_gear" ON character_gear FOR ALL USING (true);

CREATE POLICY "Public read character_critical_injuries" ON character_critical_injuries FOR SELECT USING (true);
CREATE POLICY "Public all character_critical_injuries" ON character_critical_injuries FOR ALL USING (true);

CREATE POLICY "Public read xp_transactions" ON xp_transactions FOR SELECT USING (true);
CREATE POLICY "Public insert xp_transactions" ON xp_transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert campaigns" ON campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update campaigns" ON campaigns FOR UPDATE USING (true);
CREATE POLICY "Public insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update players" ON players FOR UPDATE USING (true);
