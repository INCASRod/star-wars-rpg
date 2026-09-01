-- Migration 125: worn_anchor
--
-- Nullable body-anchor tag on ref_armor/ref_gear, distinct from and unrelated
-- to character_*.equip_slot (migration 113, still dormant/non-exclusive by
-- design -- see types.ts:548-550, untouched here). worn_anchor is catalogue-
-- level (fixed per item) and drives the two worn-rules exclusivity checks in
-- computeEncumbranceStats() (src/lib/derivedStats.ts): two items sharing an
-- anchor while both equipped can't both collect the worn-armour reduction or
-- threshold bonus -- only the first (deterministic order) does.
--
-- Populated ONLY for the 19 encumbrance_bonus > 0 rows audited in the Prompt 2
-- Step 0 report (8 armor + 10 gear -- an earlier report mislabeled the gear
-- section "11 rows" when it only ever listed 10; re-verified against the live
-- DB immediately before this migration, no drift). No row outside this set
-- gets an anchor -- never inferred from item name (Ration Pack, Stimpack,
-- Sleeppack, Explosives Belt all false-positive on naive name matching, per
-- the Prompt 1 audit).
--
-- Anchor rationale:
--   body vs rig: BODYSUIT and PITCREWCOV are full-torso garments occupying
--   the same space as a suit of armor; HAULHARN and UTILITYVEST are carry
--   rigs worn OVER other equipment (a harness/vest layered on top). Keeping
--   coveralls on `body` closes the loophole where a player stacks coveralls
--   with a flak vest (both technically armor) and collects both bonuses.
--   back: bulk packs/duffels carried on the back.
--   shoulder: strap bags (surveyor's bag, wizard pouch) that compete with
--   neither back-worn packs nor waist-worn belts for the same space.
--   waist: belt/harness-class items worn at the waist.
--   MODPACK3 (Mk. III Modular Backpack) has NO justifying sentence in its own
--   description -- it only covers accessory-pouch purchase mechanics, never
--   states the base +2 in prose. Anchored to `back` by product-line parity
--   with MODPACK (Mk. IV) as an explicit judgement call, not a sourced fact.

ALTER TABLE ref_armor
  ADD COLUMN IF NOT EXISTS worn_anchor TEXT;

ALTER TABLE ref_gear
  ADD COLUMN IF NOT EXISTS worn_anchor TEXT;

-- body
UPDATE ref_armor SET worn_anchor = 'body' WHERE key IN ('MK1KATARN', 'PHASEIARC', 'PIONEER', 'SURVIVALARMOR', 'BODYSUIT', 'PITCREWCOV');
-- rig
UPDATE ref_armor SET worn_anchor = 'rig'  WHERE key IN ('HAULHARN', 'UTILITYVEST');

-- back
UPDATE ref_gear SET worn_anchor = 'back'     WHERE key IN ('BACKPACK', 'MODPACK', 'MODPACK3', 'PACKMIL', 'SPDUFFEL');
-- shoulder
UPDATE ref_gear SET worn_anchor = 'shoulder' WHERE key IN ('SURVEYBAG', 'WIZPOUCH');
-- waist
UPDATE ref_gear SET worn_anchor = 'waist'    WHERE key IN ('JEDIUTILBELT', 'LOADBEAR', 'UTILBELT');

-- ── RLS: ref_armor / ref_gear already have RLS enabled with a public-read
-- policy (003_rls_policies.sql, reaffirmed 122/124). Nullable columns on an
-- existing table need no policy change. Confirmed unchanged below for
-- clarity/audit trail only (no-op if already present). Anon-key REST
-- readability of worn_anchor is verified separately, per project convention.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ref_armor' AND policyname = 'Public read ref_armor'
  ) THEN
    CREATE POLICY "Public read ref_armor" ON ref_armor FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ref_gear' AND policyname = 'Public read ref_gear'
  ) THEN
    CREATE POLICY "Public read ref_gear" ON ref_gear FOR SELECT USING (true);
  END IF;
END $$;
