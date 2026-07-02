-- ref_armor never had an encumbrance_bonus column, unlike ref_gear. Armor items
-- whose OggDude source data carries an ENCTADD/ENCTADDn BaseMods entry (e.g. Pit
-- Crew Coveralls: "increases the wearer's encumbrance threshold by 1") had that
-- bonus dropped entirely on import — parseArmor() in scripts/parse-oggdude.ts
-- never inspected BaseMods, unlike parseGear() which already handled ENCTADD.
-- computeEncumbranceStats()/useCharacterData.ts only ever summed this bonus from
-- equipped gear, so no armor item could contribute to a character's threshold.

ALTER TABLE ref_armor ADD COLUMN IF NOT EXISTS encumbrance_bonus integer;

-- Backfill the known OggDude armor items with an ENCTADD/ENCTADDn mod, sourced
-- from Armor.xml BaseMods (ENCTADD uses <Count> as the bonus; ENCTADD3 is a
-- fixed +3 regardless of Count, per OggDude's mod-key convention).
UPDATE ref_armor SET encumbrance_bonus = 1 WHERE key = 'BODYSUIT';      -- Polis Massan Bodysuit
UPDATE ref_armor SET encumbrance_bonus = 6 WHERE key = 'HAULHARN';      -- Hauling Harness
UPDATE ref_armor SET encumbrance_bonus = 3 WHERE key = 'MK1KATARN';     -- Mk I Katarn-Class Commando Armor
UPDATE ref_armor SET encumbrance_bonus = 3 WHERE key = 'PHASEIARC';     -- Phase I ARC Trooper Armor
UPDATE ref_armor SET encumbrance_bonus = 3 WHERE key = 'PIONEER';       -- Pioneer Armor
UPDATE ref_armor SET encumbrance_bonus = 1 WHERE key = 'PITCREWCOV';    -- Pit Crew Coveralls
UPDATE ref_armor SET encumbrance_bonus = 1 WHERE key = 'SURVIVALARMOR'; -- Survivalist Armor
UPDATE ref_armor SET encumbrance_bonus = 2 WHERE key = 'UTILITYVEST';   -- A/KT Tracker Utility Vest
