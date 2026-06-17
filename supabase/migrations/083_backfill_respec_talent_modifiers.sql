-- Migration 083: Backfill respec talent modifiers + fix character thresholds
--
-- Root cause: The respec dataset rows in ref_talents were seeded without copying
-- the modifiers JSON from the oggdude source. When the active_dataset switched to
-- 'respec', refTalentMap was built from those null-modifier rows, so applyTalentModifiers
-- silently returned {} for every talent, and computeDerivedStats accumulated no
-- soakBonus, defense, or force_rating bonuses from talents.
--
-- Part 1: Copy oggdude modifiers into every respec row that still has modifiers = NULL.
--         Affects 94+ talents including Enduring, Grit, Toughened, Sixth Sense, etc.
UPDATE ref_talents AS r
SET modifiers = o.modifiers
FROM ref_talents AS o
WHERE r.key             = o.key
  AND r.dataset_source  = 'respec'
  AND o.dataset_source  = 'oggdude'
  AND r.modifiers       IS NULL
  AND o.modifiers       IS NOT NULL;

-- Part 2: Fix wound_threshold for characters who have Toughened (TOUGH) purchased
--         but whose stored threshold was never incremented (+2 per rank).
--         Guard: only update where stored value == species base (brawn + species offset),
--         meaning the bonus was definitely not applied.
UPDATE characters c
SET wound_threshold = c.wound_threshold + (
  SELECT COALESCE(SUM(ct.ranks * 2), 0)
  FROM character_talents ct
  WHERE ct.character_id = c.id
    AND ct.talent_key   = 'TOUGH'
)
FROM ref_species rs
WHERE rs.key             = c.species_key
  AND c.wound_threshold  = c.brawn + rs.wound_threshold
  AND EXISTS (
    SELECT 1 FROM character_talents ct
    WHERE ct.character_id = c.id
      AND ct.talent_key   = 'TOUGH'
  );

-- Part 3: Fix strain_threshold for characters who have Grit (GRIT) purchased
--         but whose stored threshold was never incremented (+1 per rank).
--         Guard: only update where stored value == species base (willpower + species offset).
UPDATE characters c
SET strain_threshold = c.strain_threshold + (
  SELECT COALESCE(SUM(ct.ranks * 1), 0)
  FROM character_talents ct
  WHERE ct.character_id = c.id
    AND ct.talent_key   = 'GRIT'
)
FROM ref_species rs
WHERE rs.key              = c.species_key
  AND c.strain_threshold  = c.willpower + rs.strain_threshold
  AND EXISTS (
    SELECT 1 FROM character_talents ct
    WHERE ct.character_id = c.id
      AND ct.talent_key   = 'GRIT'
  );
