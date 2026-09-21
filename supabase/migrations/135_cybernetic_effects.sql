-- ═══════════════════════════════════════════════════════════════════════════
-- 135 — The Archive, Phase 2: cybernetic implant effects
--
-- Adds the structured-effect table behind cybernetic implants, gives
-- cybernetics a worn anchor of their own, backfills the installed state for
-- cybernetics characters already have equipped, and drops the two confirmed-
-- dead attachment junction tables from migration 031.
--
-- ── ANCHOR MECHANISM (decision, documented per task brief) ──────────────────
-- Two separate things are needed and they live at two different levels:
--
--   1. GLOBAL, per catalogue row — `ref_gear.worn_anchor`. `worn_anchor` is
--      free TEXT with no CHECK constraint or enum, so 'cybernetics' needs no
--      ALTER; it becomes a 6th anchor value simply by being written here and
--      added to ANCHOR_OPTIONS in src/components/gm/ItemDatabaseTab.tsx.
--      Every 'Cybernetics'-tagged ref_gear row gets it below.
--
--   2. PER CHARACTER, per owned row — whether THIS character has THIS implant
--      surgically installed, as opposed to carrying a boxed one they bought
--      but have not had fitted. We REUSE the existing `character_gear.
--      equip_slot` column (free TEXT, no constraint, currently unused for
--      gear) with the value 'cybernetics' rather than adding a new column.
--      Rationale: equip_slot's existing semantics are already "which body
--      location does this equipped item occupy", which is exactly the
--      question "is this implant installed" asks; adding an `is_installed`
--      boolean next to it would leave two columns answering one question and
--      a new NULL-vs-false ambiguity on every legacy row. The pairing
--      (equip_state = 'equipped' AND equip_slot = 'cybernetics') is the
--      single definition of "installed" and is spelled once in code, as
--      CYBERNETIC_ANCHOR / isInstalledCybernetic in src/lib/derivedStats.ts.
--
-- ── IMPLANT CAP ─────────────────────────────────────────────────────────────
--   cap = (droid ? 6 : Brawn) + 2 (if a Biofeedback Regulator is installed)
--             + 1 per rank of the More Machine Than Man (MOREMACH) talent
--   used = count of installed rows with counts_toward_cap = true
-- Prosthetic replacements (CYREPLIMB / CYREPORG) and the Biofeedback
-- Regulator itself are counts_toward_cap = false per RAW.
--
-- NOTE on BIOFEEDREG: the effect_type enum below deliberately has no 'cap'
-- member (the task brief fixes the enum). BIOFEEDREG is therefore seeded as
-- effect_type='text' with value=2 and counts_toward_cap=false, and its cap
-- contribution is special-cased by gear_key in derivedStats.ts alongside the
-- MOREMACH talent — the two cap modifiers in the game live together in one
-- place rather than one in data and one in code.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Cybernetics worn anchor (global catalogue rows) ─────────────────────
UPDATE ref_gear
   SET worn_anchor = 'cybernetics'
 WHERE 'Cybernetics' = ANY(categories);

-- ── 2. ref_cybernetic_effects ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ref_cybernetic_effects (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gear_key           text NOT NULL REFERENCES ref_gear(key) ON DELETE CASCADE,
  effect_type        text NOT NULL CHECK (effect_type IN (
                       'characteristic','skill','talent','soak','defense',
                       'wound_threshold','strain_threshold','text')),
  -- characteristic key (BRAWN/AGILITY/INTELLECT/CUNNING/WILLPOWER/PRESENCE),
  -- ref_skills.key, or ref_talents.key. NULL for soak/defense/threshold/text.
  target             text,
  -- Flat bonus. For 'talent' this is the number of granted ranks. NULL for
  -- 'text' rows (except BIOFEEDREG, see header note).
  value              int,
  counts_toward_cap  boolean NOT NULL DEFAULT true,
  -- Members of the same stack_group apply their bonus ONCE no matter how many
  -- copies are installed (RAW: "the modifiers from both arms do not stack";
  -- cyberlegs "must be purchased as a pair" for a single bonus).
  stack_group        text,
  -- true = this effect is situational / narrative and is NOT applied
  -- mechanically by derivedStats.ts; it is surfaced as rules text only.
  needs_review       boolean NOT NULL DEFAULT false,
  notes              text
);

CREATE INDEX IF NOT EXISTS ref_cybernetic_effects_gear_key_idx
  ON ref_cybernetic_effects (gear_key);

ALTER TABLE ref_cybernetic_effects ENABLE ROW LEVEL SECURITY;

-- Read policies match the ref_item_attachments pattern exactly (separate anon
-- and authenticated SELECT policies, qual `true`).
DROP POLICY IF EXISTS "anon read ref_cybernetic_effects" ON ref_cybernetic_effects;
CREATE POLICY "anon read ref_cybernetic_effects" ON ref_cybernetic_effects
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "auth read ref_cybernetic_effects" ON ref_cybernetic_effects;
CREATE POLICY "auth read ref_cybernetic_effects" ON ref_cybernetic_effects
  FOR SELECT TO authenticated USING (true);

-- Write is GM-only. ref_gear's own GM-write policy scopes by campaign_id, but
-- this table is global reference data with no campaign_id, so the same
-- players/is_gm check is used unscoped: you must be a GM of SOME campaign.
DROP POLICY IF EXISTS "GM write ref_cybernetic_effects" ON ref_cybernetic_effects;
CREATE POLICY "GM write ref_cybernetic_effects" ON ref_cybernetic_effects
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players p WHERE p.user_id = auth.uid() AND p.is_gm = true))
  WITH CHECK (EXISTS (SELECT 1 FROM players p WHERE p.user_id = auth.uid() AND p.is_gm = true));

-- ── 3. Seed — all 42 'Cybernetics' ref_gear rows ───────────────────────────
-- Idempotent: clear first so re-running the migration does not duplicate.
DELETE FROM ref_cybernetic_effects;

INSERT INTO ref_cybernetic_effects
  (gear_key, effect_type, target, value, counts_toward_cap, stack_group, needs_review, notes)
VALUES
-- ── Pure narrative / no structured mechanical effect ───────────────────────
  ('CORTEXBOMB',     'text', NULL, NULL, true,  NULL, false, 'Detonates on a pre-set trigger word or signal, killing only the wearer. No stat effect.'),
  ('CYGANKCOMM',     'text', NULL, NULL, true,  NULL, false, 'Silent thought-based comm between characters with matching implants, up to several kilometres.'),
  ('CYSCANLIMB',     'text', NULL, NULL, true,  NULL, false, 'Cybernetic arm incorporating a portable scanner, concealed under synthflesh.'),
  ('VESSELIMP',      'text', NULL, NULL, true,  NULL, false, 'Subdermal secure data store. Daunting Perception check to find; wearer cannot read it.'),
  ('VOCALEMUIMP',    'text', NULL, NULL, true,  NULL, false, 'Voice disguise. Hard Deception check to mimic a specific individual.'),
  ('RETINALIMP',     'text', NULL, NULL, true,  NULL, false, 'Projects up to six retina patterns to fool retinal ID scanners. Difficulty varies by scanner.'),
  ('78BCOUR',        'text', NULL, NULL, true,  NULL, false, 'Concealed courier data store holding roughly four datapads worth of data. Wearer cannot access it.'),
-- Prosthetic replacements: restore normal function, grant nothing, and per
-- RAW do NOT count toward the implant cap.
  ('CYREPLIMB',      'text', NULL, NULL, false, NULL, false, 'Prosthetic limb replacement. Restores normal function, grants no bonus. Does not count toward the implant cap.'),
  ('CYREPORG',       'text', NULL, NULL, false, NULL, false, 'Prosthetic organ replacement. Restores normal function, grants no bonus. Does not count toward the implant cap.'),
-- Read from ref_gear.description rather than assumed: a cyber disguise DOES
-- carry a clean structured grant (2 ranks of Indistinguishable) on top of its
-- narrative disguise-kit text, so it is seeded as two rows, not one.
  ('CYBERDISGUISE',  'talent', 'INDIS', 2, true, NULL, false, 'Grants 2 ranks of Indistinguishable.'),
  ('CYBERDISGUISE',  'text', NULL, NULL, true,  NULL, false, 'Also provides all the benefits of a disguise kit. Hard Deception check to impersonate a specific individual.'),

-- ── Implant cap modifier (special-cased by key in derivedStats.ts) ─────────
  ('BIOFEEDREG',     'text', NULL, 2, false, NULL, false, 'Increases the cybernetic implant cap by 2 and does not count toward it. Cannot be installed on droids; only one per character.'),

-- ── Characteristics ───────────────────────────────────────────────────────
  ('CYARMV',         'characteristic', 'BRAWN',     1, true, 'cyberarm_v',  false, 'Mod V cyberarm: +1 Brawn. Both arms must be the same model and the bonus does not stack.'),
  ('CYARMVI',        'characteristic', 'AGILITY',   1, true, 'cyberarm_vi', false, 'Mod VI cyberarm: +1 Agility. Both arms must be the same model and the bonus does not stack.'),
  ('CYLEGII',        'characteristic', 'BRAWN',     1, true, 'cyberleg_ii', false, 'Mod II cyberlegs: +1 Brawn. Purchased and installed as a pair; the bonus counts once.'),
  ('CYLEGIII',       'characteristic', 'AGILITY',   1, true, 'cyberleg_iii',false, 'Mod III cyberlegs: +1 Agility. Purchased and installed as a pair; the bonus counts once.'),
  ('CYBRAIN',        'characteristic', 'INTELLECT', 1, true, NULL, false, '+1 Intelligence. Also includes a comlink and a computer access link.'),

-- ── Skills ────────────────────────────────────────────────────────────────
  ('CYEYE',          'skill', 'VIGIL', 1, true, NULL, false, 'Cybernetic eyes: +1 Vigilance.'),
  ('CYEYE',          'skill', 'PERC',  1, true, NULL, false, 'Cybernetic eyes: +1 Perception.'),
  ('CYIMIM',         'skill', 'RESIL', 1, true, NULL, false, '+1 Resilience. (Labelled a characteristic bonus in some printings; it is a skill rank.)'),
  ('CYAVIONCAAF2',   'skill', 'PILOTSP', 1, true, NULL, true,  'Seeded as Piloting - Space. RAW grants +1 to whichever of Piloting (Planetary) or Piloting (Space) applies, and requires at least 1 existing rank — GM/player picks the skill. Review before applying.'),

-- ── Soak ──────────────────────────────────────────────────────────────────
  ('CYIMARM',        'soak', NULL, 1, true, NULL, false, 'Implant armor: +1 soak.'),

-- ── Talent grants ─────────────────────────────────────────────────────────
  ('CYADRENAL',      'talent', 'RAPREC', 1, true, NULL, false, 'Grants 1 rank of Rapid Recovery.'),
  ('CYBERCAVITY',    'talent', 'HIDD',   1, true, NULL, false, 'Grants 1 rank of Hidden Storage; items may be concealed inside the character''s own body.'),
  ('CYREFLEX',       'talent', 'RAPREA', 1, true, NULL, false, 'Grants 1 rank of Rapid Reaction.'),
  ('DIGITALLOCKPICK','talent', 'BYP',    1, true, NULL, false, 'Grants 1 rank of Bypass Security.'),
  ('CYREPULSORFIST', 'talent', 'DEFSTA', 1, true, NULL, false, 'Grants 1 rank of Defensive Stance.'),
  ('CYREPULSORFIST', 'text', NULL, NULL, true, NULL, true,  'Also counts as a Brawl weapon: damage 8, Crit 3, Concussive 1, Slow-Firing 2. Weapon grant is not modelled as an inventory weapon.'),
  ('CYRESPIR',       'talent', 'BLO',    1, true, NULL, false, 'Grants 1 rank of Blooded.'),
  ('CYRESPIR',       'text', NULL, NULL, true, NULL, false, 'Also permanently provides the benefits of a breath mask and respirator.'),
  ('LOCKHAND',       'talent', 'BYP',    1, true, NULL, false, 'Grants 1 rank of Bypass Security.'),
  ('LOCKHAND',       'text', NULL, NULL, true, NULL, true,  'Also adds a boost die to Skulduggery and Computers checks made to defeat locks.'),

-- ── Situational / text-only mechanics (not auto-applied) ──────────────────
  ('APPRAISERSEYE',  'text', NULL, NULL, true, NULL, true, 'Automatic advantage on Negotiation and Streetwise checks made to buy or sell items.'),
  ('CRATARMENH',     'text', NULL, NULL, true, NULL, true, 'Two boost dice on Athletics checks involving the enhanced limbs. Despair shorts the unit out for 5 strain. Two boost dice are not a flat skill rank, so this is not applied as a skill bonus.'),
  ('CRATLEGENH',     'text', NULL, NULL, true, NULL, true, 'Two boost dice on Athletics checks involving the enhanced limbs. Despair shorts the unit out for 5 strain. Two boost dice are not a flat skill rank, so this is not applied as a skill bonus.'),
  ('CRATVISCYC',     'text', NULL, NULL, true, NULL, true, 'Upgrade the Perception dice pool once. Triumph grants a boost to all Perception checks for the encounter; despair can lock the unit in one mode.'),
  ('CYCYBERJACK',    'text', NULL, NULL, true, NULL, true, 'Once per check, suffer 2 strain to decrease the difficulty of a Computers check to slice a system or disable a security device by one.'),
  ('CYDROIDINTF',    'text', NULL, NULL, true, NULL, true, 'Requires a cybernetic brain implant. Connects to a droid''s comm port; upgrade the ability of all Computers checks once when prising information from an unwilling droid.'),
  ('CYNEUROMACH',    'text', NULL, NULL, true, NULL, true, 'When piloting a vehicle fitted with the linked control device, use Coordination in place of Piloting (Planetary) or Piloting (Space).'),
  ('CYRETINALTRACK', 'text', NULL, NULL, true, NULL, true, 'Automatic advantage on Gunnery and Ranged (Heavy) checks.'),
  ('CYWEPIMP',       'text', NULL, NULL, true, NULL, true, 'Retractable light blaster pistol deployed as an incidental. Cannot be removed, dropped, or disarmed. Not modelled as an inventory weapon.'),
  ('ESCCIR',         'text', NULL, NULL, true, NULL, true, 'Droids only. Resist a restraining bolt with an Easy Discipline check; spend two advantage to overload the bolt entirely.'),
  ('MULTITOOLHAND',  'text', NULL, NULL, true, NULL, true, 'Provides all the benefits of a tool kit.'),
  ('NETUPLINK',      'text', NULL, NULL, true, NULL, true, 'Droids only. Counts as a set of slicer gear; adds a setback die to Computers checks made to identify the slicer.'),
  ('NEURALREC',      'text', NULL, NULL, true, NULL, true, 'Easy Discipline check to recall in holorecorder-quality detail anything experienced while recording. Recordings can be copied to external storage.'),
  ('PAINDAMP',       'text', NULL, NULL, true, NULL, true, 'Upgrade the ability of all checks made to resist pain or physical torture once.'),
  ('SURGESWITCH',    'text', NULL, NULL, true, NULL, true, 'Once per encounter as an action, Average Discipline check to reactivate ion-disabled implants; 2 strain per implant reactivated.');

-- ── 4. Backfill installed state ────────────────────────────────────────────
-- Generic condition, not a hardcoded character: every already-equipped
-- cybernetic becomes an installed one. `is_dropped = false` matters — dropping
-- and selling are soft deletes in this schema (the row survives with
-- is_dropped = true and its old equip_state intact), so without this clause a
-- sold-off implant would be backfilled as installed and keep applying its
-- effects. derivedStats.ts filters the same way.
UPDATE character_gear cg
   SET equip_slot = 'cybernetics'
  FROM ref_gear g
 WHERE g.key = cg.gear_key
   AND 'Cybernetics' = ANY(g.categories)
   AND cg.equip_state = 'equipped'
   AND cg.is_dropped = false
   AND cg.equip_slot IS DISTINCT FROM 'cybernetics';

-- ── 5. Drop dead junction tables (migration 031) ───────────────────────────
-- Confirmed zero references in code, views, functions, triggers, or policies
-- outside their own creation migration. install_mod()/uninstall_mod()
-- (migration 134) write character_weapons.attachments / character_armor.
-- attachments jsonb instead; these two tables were never read.
DROP TABLE IF EXISTS character_weapon_attachments CASCADE;
DROP TABLE IF EXISTS character_armor_attachments  CASCADE;
