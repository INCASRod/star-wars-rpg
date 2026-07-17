-- Migration 091: RLS policies for Signature Abilities tables
--
-- Root cause (confirmed via diagnostic): migration 088 created
-- ref_sig_abilities, ref_sig_ability_nodes, and character_sig_ability_nodes
-- with a comment claiming "no RLS", but never disabled it. This Supabase
-- project defaults new tables to RLS-enabled, and no policies were ever
-- added — so all three tables returned zero rows to the anon/authenticated
-- client while privileged SQL saw everything, which is why
-- availableSigAbilities came back empty and why lock-in/purchase writes
-- would have silently no-op'd too.
--
-- Policies below mirror the exact shape already in place for ref_talents
-- (public SELECT, qual: true) and character_talents (public SELECT/INSERT/
-- DELETE, qual/with_check: true) — confirmed via pg_policies before writing
-- this file. No UPDATE policy: character_talents has one, but nothing in
-- this feature updates a purchased node row, so it wasn't requested and
-- isn't added here.

ALTER TABLE ref_sig_abilities            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_sig_ability_nodes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_sig_ability_nodes  ENABLE ROW LEVEL SECURITY;

-- ── ref_sig_abilities — public read, matches "Public read ref_talents" ──────
CREATE POLICY "Public read ref_sig_abilities" ON ref_sig_abilities
  FOR SELECT USING (true);

-- ── ref_sig_ability_nodes — public read, matches "Public read ref_talents" ──
CREATE POLICY "Public read ref_sig_ability_nodes" ON ref_sig_ability_nodes
  FOR SELECT USING (true);

-- ── character_sig_ability_nodes — matches character_talents' SELECT/INSERT/DELETE ──
CREATE POLICY "Public read character_sig_ability_nodes" ON character_sig_ability_nodes
  FOR SELECT USING (true);

CREATE POLICY "Public insert character_sig_ability_nodes" ON character_sig_ability_nodes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public delete character_sig_ability_nodes" ON character_sig_ability_nodes
  FOR DELETE USING (true);
