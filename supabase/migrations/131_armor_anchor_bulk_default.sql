-- Migration 131: bulk worn_anchor default for remaining ref_armor rows
--
-- Prompt 9 classified all 111 ref_armor rows left unanchored by migration 125
-- (FULL SUIT / CLOTHING / SPECIALIST GARMENT / NOT WORN BY CHARACTER /
-- UNDER-LAYER / AMBIGUOUS). DECISION (Prompt 10): bulk-assign rather than
-- hand-classify each row, with a GM override (see ItemDatabaseTab) as the
-- correction path for anything that surfaces wrong at the table.
--
-- rig (7 rows) -- USER-ASSIGNED, not researched. GM reviewed the over-layer
-- candidate shortlist (a name/stat-triaged pass over the 111, not a full
-- per-row description read -- see Prompt 10 conversation) and picked these
-- as add-on/partial pieces worn alongside a body suit rather than instead of
-- one:
--   CATCHVEST, BLASTVEST, FLAKVEST, KOROHALFVEST, ALLENGHELVEST, FABPROT,
--   TAILOREDJACKET
-- GM explicitly excluded from rig (assigned body instead, see below):
--   TJ-type Armor Plating (custom_6ba1c2c4_1780274504425), BX Droid Armor
--   Plating (custom_copy_PROTECTOR_6ba1c2c4), Armored Clothing (AC),
--   MODARMORIII, PAD, SITHPAIN, HC
--
-- body (all remaining unanchored rows after the rig UPDATE, ~104 rows) --
-- BULK DEFAULT, NOT PER-ROW RESEARCH. Every row in this bucket was reviewed
-- only at the classification-label level (Prompt 9), never individually
-- decided for anchor purposes. This deliberately includes:
--   - rows Prompt 9 flagged NOT WORN BY CHARACTER (ANIPRO, CAPARIBEAST,
--     DESTRIBEAST, MEGAFAUNA, RIDINGTACK) -- beast/mount gear, arguably
--     shouldn't take the worn -3 at all, left as body anyway
--   - UNDER-LAYER rows (REFBODYGL, SECSKIN) -- worn under other clothing,
--     inverse of the rig case, anchored body anyway
--   - AMBIGUOUS rows (GSUIT, INDFLDDISR, PDS) -- energy-field/strain
--     devices, not classic body-slot armor, anchored body anyway
-- A future reader must not mistake any row in this bucket for a researched
-- assignment -- it is a default, and Task 2's GM override is the intended
-- correction mechanism.
--
-- Side effect: this closes the sibling-suit loophole flagged in Prompt 9 --
-- KATARNCOMM, PHASEIIARC, PHASEICLONE, PHASEIICLONE (unanchored siblings of
-- already-anchored MK1KATARN/PHASEIARC/etc. from migration 125) now anchor
-- to `body` and can no longer be double-stacked with their anchored siblings
-- for two worn-armour discounts at once.
--
-- Does NOT touch the 18 rows anchored by migration 125, and does NOT touch
-- ref_gear. Existing character loadouts are NOT audited or migrated --
-- some live characters' numbers will change; the GM corrects what surfaces
-- via the Task 2 override.

UPDATE ref_armor
SET worn_anchor = 'rig'
WHERE worn_anchor IS NULL
  AND key IN (
    'CATCHVEST', 'BLASTVEST', 'FLAKVEST', 'KOROHALFVEST',
    'ALLENGHELVEST', 'FABPROT', 'TAILOREDJACKET'
  );

UPDATE ref_armor
SET worn_anchor = 'body'
WHERE worn_anchor IS NULL;
