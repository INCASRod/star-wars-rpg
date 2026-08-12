-- 119_talent_skill_relevance.sql
-- Talent -> skill relevance mapping, authored lazily at spec-purchase time
-- rather than all at once (H1). Feeds the future hand-of-cards check-time glow
-- (H2+) and SkillRollPopover's existing talent-hint feature.
--
-- A DIFFERENT, PARTIAL version of this mapping already exists and is already
-- live: ref_talents.modifiers->'relevant_skills' (jsonb array of skill keys),
-- populated for 83/1170 active respec talents and 87/632 oggdude talents,
-- already read by HudModalsOverlay.tsx (SkillRollPopover's talentHints) to
-- show "this talent is relevant to the skill you're rolling." Every skill key
-- in it resolves against ref_skills (checked before writing this migration:
-- zero unresolvable keys across both datasets). Rather than starting this new,
-- normalized table empty and duplicating/diverging from that authoring work,
-- this migration backfills from it. modifiers.relevant_skills itself is left
-- untouched — HudModalsOverlay's existing read path keeps working unchanged;
-- this table is additive, not a replacement, in this prompt.
--
-- UNMAPPED VS. DELIBERATELY-EMPTY: a talent may map to zero, one, or several
-- skills, and "zero rows in talent_skill_relevance" must NOT be read as
-- "confirmed no relevant skills" — it's indistinguishable from "nobody has
-- looked at this talent yet." The junction-table shape below cannot carry that
-- distinction on its own (a skill_key is required by its own PK/FK, so there is
-- no legal "authored, zero skills" row in it). Fixed with a second, minimal
-- tracking table rather than a sentinel skill_key (a sentinel would either
-- violate the FK to ref_skills or require making it nullable inside a
-- composite PK, which Postgres does not allow) — presence of a row in
-- talent_skill_relevance_authored means "reviewed," independent of how many
-- (if any) rows that talent has in talent_skill_relevance.

CREATE TABLE IF NOT EXISTS talent_skill_relevance (
  talent_key      text NOT NULL,
  dataset_source  text NOT NULL,
  skill_key       text NOT NULL REFERENCES ref_skills(key),
  PRIMARY KEY (talent_key, dataset_source, skill_key),
  FOREIGN KEY (talent_key, dataset_source) REFERENCES ref_talents(key, dataset_source)
);

-- Reviewed-tracking: presence = "a GM/author has reviewed this talent for
-- skill relevance," independent of the resulting skill count (0, 1, or many).
CREATE TABLE IF NOT EXISTS talent_skill_relevance_authored (
  talent_key      text NOT NULL,
  dataset_source  text NOT NULL,
  authored_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (talent_key, dataset_source),
  FOREIGN KEY (talent_key, dataset_source) REFERENCES ref_talents(key, dataset_source)
);

CREATE INDEX IF NOT EXISTS idx_talent_skill_relevance_skill
  ON talent_skill_relevance (skill_key);

-- ── Backfill from the existing modifiers.relevant_skills data ────────────────
INSERT INTO talent_skill_relevance (talent_key, dataset_source, skill_key)
SELECT rt.key, rt.dataset_source, sk.value
FROM ref_talents rt, jsonb_array_elements_text(rt.modifiers -> 'relevant_skills') AS sk(value)
WHERE rt.modifiers ? 'relevant_skills'
ON CONFLICT (talent_key, dataset_source, skill_key) DO NOTHING;

-- Every talent that had the field at all (even an empty array, if one exists)
-- counts as already-reviewed — it was deliberately authored by whatever
-- process populated modifiers.relevant_skills, not left untouched.
INSERT INTO talent_skill_relevance_authored (talent_key, dataset_source)
SELECT rt.key, rt.dataset_source
FROM ref_talents rt
WHERE rt.modifiers ? 'relevant_skills'
ON CONFLICT (talent_key, dataset_source) DO NOTHING;

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Reference-table convention: ref_* tables are public-read; write policies are
-- permissive for the same reason as every character-progress table (no
-- GM/player auth split — see 117_pending_actions.sql's rationale comment).
ALTER TABLE talent_skill_relevance ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_skill_relevance_authored ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read talent_skill_relevance"   ON talent_skill_relevance;
DROP POLICY IF EXISTS "Public insert talent_skill_relevance" ON talent_skill_relevance;
DROP POLICY IF EXISTS "Public update talent_skill_relevance" ON talent_skill_relevance;
DROP POLICY IF EXISTS "Public delete talent_skill_relevance" ON talent_skill_relevance;

CREATE POLICY "Public read talent_skill_relevance"
  ON talent_skill_relevance FOR SELECT USING (true);
CREATE POLICY "Public insert talent_skill_relevance"
  ON talent_skill_relevance FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update talent_skill_relevance"
  ON talent_skill_relevance FOR UPDATE USING (true);
CREATE POLICY "Public delete talent_skill_relevance"
  ON talent_skill_relevance FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read talent_skill_relevance_authored"   ON talent_skill_relevance_authored;
DROP POLICY IF EXISTS "Public insert talent_skill_relevance_authored" ON talent_skill_relevance_authored;
DROP POLICY IF EXISTS "Public update talent_skill_relevance_authored" ON talent_skill_relevance_authored;
DROP POLICY IF EXISTS "Public delete talent_skill_relevance_authored" ON talent_skill_relevance_authored;

CREATE POLICY "Public read talent_skill_relevance_authored"
  ON talent_skill_relevance_authored FOR SELECT USING (true);
CREATE POLICY "Public insert talent_skill_relevance_authored"
  ON talent_skill_relevance_authored FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update talent_skill_relevance_authored"
  ON talent_skill_relevance_authored FOR UPDATE USING (true);
CREATE POLICY "Public delete talent_skill_relevance_authored"
  ON talent_skill_relevance_authored FOR DELETE USING (true);
