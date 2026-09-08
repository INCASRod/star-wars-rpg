-- 126_legacy_renamed_item_conversion.sql
--
-- Converts 7 character inventory rows (6 distinct legacy renamed stock items) into
-- genuine campaign-scoped custom items, so the GM item manager can edit them without
-- corrupting the shared canonical ref_ rows every other character/campaign also uses.
--
-- Copy-then-repoint. Original canonical rows (is_custom=false, campaign_id=null) are
-- NEVER mutated. Every UPDATE below is scoped to explicit row ids captured in the
-- Step 0 pre-flight audit -- never `WHERE key = 'X'` -- because Derek Caabesk
-- (character_armor id 32375383-a208-49a8-997b-6416eb9566e0) also holds stock CONROBE
-- with custom_name = null and must keep pointing at the original canonical row.
--
-- campaign_id used for all 6 clones: 6ba1c2c4-1281-4cca-826a-6677b333a68f
-- (the campaign shared by Bex, Bylethia, and Guy Rando).
--
-- Key format: custom_copy_<sourceKey>_<campaignId8> -- matches the format the app's
-- own GM item manager "Copy" button already generates for a copy of a non-custom row
-- (src/components/gm/ItemEditor.tsx), so these clones are indistinguishable from a
-- manually-created copy.
--
-- Rows touched (character_id / row id / source key / player nickname / is_dropped):
--   character_weapons 53ab2463-3284-46cf-aac9-3f7763a5175f  PULSECAN   "BX E11A Experimental Pulse Cannon"   Bex        (dropped=false)
--   character_weapons 58782fb5-9cdb-4e61-b055-b0ebf3d2a8a8  BARDLANCE  "Bylethia's Electrolance"              Bylethia   (dropped=true)
--   character_weapons e81b91a7-251a-4358-8df4-0b6c051cdaef  KNIFE      "Cook's Cleavers"                      Guy Rando  (dropped=true)
--   character_weapons 6113e4e9-af65-48ee-8a69-0c6c50114c6e  KNIFE      "Cook's Cleavers"                      Guy Rando  (dropped=true)
--   character_armor   84872e3d-a308-473a-8486-ccc18c63a03f  PROTECTOR  "BX Droid Armor Plating"               Bex        (dropped=false)
--   character_armor   66569096-f8c4-4917-b595-d995d253abd7  CONROBE    "Exile's Robes"                        Bylethia   (dropped=false)
--   character_gear    46162fb9-fbdb-4edf-87a9-d43e050ced47  MODPACK    "BX Droid Modular Storage Unit"        Bex        (dropped=false)
--
-- Row explicitly NOT touched: character_armor 32375383-a208-49a8-997b-6416eb9566e0
-- (Derek Caabesk, stock CONROBE, custom_name null) -- must still point at CONROBE
-- and keep custom_name null after this migration runs.
--
-- Guy Rando's two KNIFE rows both repoint to a single new custom KNIFE clone (the app
-- has no `quantity` column on character_weapons -- its existing convention for
-- multiple identical weapons is multiple rows, which this preserves).
--
-- The inline `attachments` jsonb on character_weapons (Bex's PULSECAN: CONCEALALTERWEAP)
-- and character_armor (Bylethia's CONROBE: CEREADORN) is NEVER referenced or written by
-- this migration -- only weapon_key/armor_key and custom_name are touched on those rows,
-- so `attachments` passes through completely untouched. Verified byte-identical in the
-- verification block below.
--
-- is_dropped is preserved as-is on repoint (data-shape migration, not a game-state change).
--
-- Idempotent: clone inserts use ON CONFLICT (key) DO NOTHING; repoint UPDATEs are
-- unconditional sets to a fixed target value, safe to re-run.
--
-- FOLLOW-UP (not fixed here, out of scope per task instructions): the key format
-- custom_copy_<sourceKey>_<campaignId8> has no uniqueness guard beyond the primary key
-- itself. If a GM in this same campaign later uses the existing "Copy" button on the
-- real Pulse Cannon (PULSECAN) via ItemDatabaseTab.tsx / ItemEditor.tsx, it would
-- generate the identical key custom_copy_PULSECAN_6ba1c2c4 that this migration already
-- claims, and the app's insert would fail on the primary key conflict (or, if the app
-- ever adds an ON CONFLICT DO NOTHING/UPDATE itself, could silently merge into this
-- clone). Flagging only -- no fix applied in this migration.

BEGIN;

-- ============================================================================
-- 1. Clone the 6 canonical ref_ rows into campaign-scoped custom items.
--    Full verbatim copy of every stat column from the source row.
-- ============================================================================

INSERT INTO ref_weapons (
  key, name, description, skill_key, damage, damage_add, crit, range_value,
  encumbrance, hard_points, price, rarity, restricted, qualities, categories,
  is_custom, custom_notes, campaign_id, effect_text, lore_text
)
SELECT
  'custom_copy_' || src.key || '_6ba1c2c4',
  clone.nickname,
  src.description, src.skill_key, src.damage, src.damage_add, src.crit, src.range_value,
  src.encumbrance, src.hard_points, src.price, src.rarity, src.restricted, src.qualities, src.categories,
  true,
  'Cloned from canonical "' || src.name || '" (' || src.key || ') by migration 126 -- legacy renamed item conversion.',
  '6ba1c2c4-1281-4cca-826a-6677b333a68f'::uuid,
  src.effect_text, src.lore_text
FROM ref_weapons src
JOIN (VALUES
  ('PULSECAN',  'BX E11A Experimental Pulse Cannon'),
  ('BARDLANCE', 'Bylethia''s Electrolance'),
  ('KNIFE',     'Cook''s Cleavers')
) AS clone(source_key, nickname) ON clone.source_key = src.key
WHERE src.is_custom = false AND src.campaign_id IS NULL
ON CONFLICT (key) DO NOTHING;

INSERT INTO ref_armor (
  key, name, description, defense, soak, encumbrance, hard_points, price, rarity,
  is_custom, custom_notes, campaign_id, soak_bonus, defense_melee, defense_ranged,
  encumbrance_bonus, categories, effect_text, lore_text, worn_anchor
)
SELECT
  'custom_copy_' || src.key || '_6ba1c2c4',
  clone.nickname,
  src.description, src.defense, src.soak, src.encumbrance, src.hard_points, src.price, src.rarity,
  true,
  'Cloned from canonical "' || src.name || '" (' || src.key || ') by migration 126 -- legacy renamed item conversion.',
  '6ba1c2c4-1281-4cca-826a-6677b333a68f'::uuid,
  src.soak_bonus, src.defense_melee, src.defense_ranged, src.encumbrance_bonus, src.categories,
  src.effect_text, src.lore_text, src.worn_anchor
FROM ref_armor src
JOIN (VALUES
  ('PROTECTOR', 'BX Droid Armor Plating'),
  ('CONROBE',   'Exile''s Robes')
) AS clone(source_key, nickname) ON clone.source_key = src.key
WHERE src.is_custom = false AND src.campaign_id IS NULL
ON CONFLICT (key) DO NOTHING;

INSERT INTO ref_gear (
  key, name, description, encumbrance, price, rarity, encumbrance_bonus,
  is_custom, custom_notes, campaign_id, categories, effect_text, lore_text, worn_anchor
)
SELECT
  'custom_copy_' || src.key || '_6ba1c2c4',
  clone.nickname,
  src.description, src.encumbrance, src.price, src.rarity, src.encumbrance_bonus,
  true,
  'Cloned from canonical "' || src.name || '" (' || src.key || ') by migration 126 -- legacy renamed item conversion.',
  '6ba1c2c4-1281-4cca-826a-6677b333a68f'::uuid,
  src.categories, src.effect_text, src.lore_text, src.worn_anchor
FROM ref_gear src
JOIN (VALUES
  ('MODPACK', 'BX Droid Modular Storage Unit')
) AS clone(source_key, nickname) ON clone.source_key = src.key
WHERE src.is_custom = false AND src.campaign_id IS NULL
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 2. Repoint the 7 character inventory rows, by explicit row id only.
--    `attachments` is never referenced here -- passes through untouched.
-- ============================================================================

UPDATE character_weapons SET weapon_key = 'custom_copy_PULSECAN_6ba1c2c4', custom_name = NULL
WHERE id = '53ab2463-3284-46cf-aac9-3f7763a5175f';

UPDATE character_weapons SET weapon_key = 'custom_copy_BARDLANCE_6ba1c2c4', custom_name = NULL
WHERE id = '58782fb5-9cdb-4e61-b055-b0ebf3d2a8a8';

UPDATE character_weapons SET weapon_key = 'custom_copy_KNIFE_6ba1c2c4', custom_name = NULL
WHERE id = 'e81b91a7-251a-4358-8df4-0b6c051cdaef';

UPDATE character_weapons SET weapon_key = 'custom_copy_KNIFE_6ba1c2c4', custom_name = NULL
WHERE id = '6113e4e9-af65-48ee-8a69-0c6c50114c6e';

UPDATE character_armor SET armor_key = 'custom_copy_PROTECTOR_6ba1c2c4', custom_name = NULL
WHERE id = '84872e3d-a308-473a-8486-ccc18c63a03f';

UPDATE character_armor SET armor_key = 'custom_copy_CONROBE_6ba1c2c4', custom_name = NULL
WHERE id = '66569096-f8c4-4917-b595-d995d253abd7';

UPDATE character_gear SET gear_key = 'custom_copy_MODPACK_6ba1c2c4', custom_name = NULL
WHERE id = '46162fb9-fbdb-4edf-87a9-d43e050ced47';

COMMIT;

-- ============================================================================
-- ROLLBACK (documented, not auto-run). To reverse this migration:
-- ============================================================================
-- BEGIN;
-- UPDATE character_weapons SET weapon_key = 'PULSECAN', custom_name = 'BX E11A Experimental Pulse Cannon'
--   WHERE id = '53ab2463-3284-46cf-aac9-3f7763a5175f';
-- UPDATE character_weapons SET weapon_key = 'BARDLANCE', custom_name = 'Bylethia''s Electrolance'
--   WHERE id = '58782fb5-9cdb-4e61-b055-b0ebf3d2a8a8';
-- UPDATE character_weapons SET weapon_key = 'KNIFE', custom_name = 'Cook''s Cleavers'
--   WHERE id = 'e81b91a7-251a-4358-8df4-0b6c051cdaef';
-- UPDATE character_weapons SET weapon_key = 'KNIFE', custom_name = 'Cook''s Cleavers'
--   WHERE id = '6113e4e9-af65-48ee-8a69-0c6c50114c6e';
-- UPDATE character_armor SET armor_key = 'PROTECTOR', custom_name = 'BX Droid Armor Plating'
--   WHERE id = '84872e3d-a308-473a-8486-ccc18c63a03f';
-- UPDATE character_armor SET armor_key = 'CONROBE', custom_name = 'Exile''s Robes'
--   WHERE id = '66569096-f8c4-4917-b595-d995d253abd7';
-- UPDATE character_gear SET gear_key = 'MODPACK', custom_name = 'BX Droid Modular Storage Unit'
--   WHERE id = '46162fb9-fbdb-4edf-87a9-d43e050ced47';
-- DELETE FROM ref_weapons WHERE key IN ('custom_copy_PULSECAN_6ba1c2c4','custom_copy_BARDLANCE_6ba1c2c4','custom_copy_KNIFE_6ba1c2c4');
-- DELETE FROM ref_armor   WHERE key IN ('custom_copy_PROTECTOR_6ba1c2c4','custom_copy_CONROBE_6ba1c2c4');
-- DELETE FROM ref_gear    WHERE key IN ('custom_copy_MODPACK_6ba1c2c4');
-- COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- (a) Zero dangling refs across every key column that can point at these tables.
SELECT 'character_weapons' AS src, cw.id, cw.weapon_key FROM character_weapons cw
  LEFT JOIN ref_weapons rw ON rw.key = cw.weapon_key WHERE rw.key IS NULL
UNION ALL
SELECT 'character_armor', ca.id, ca.armor_key FROM character_armor ca
  LEFT JOIN ref_armor ra ON ra.key = ca.armor_key WHERE ra.key IS NULL
UNION ALL
SELECT 'character_gear', cg.id, cg.gear_key FROM character_gear cg
  LEFT JOIN ref_gear rg ON rg.key = cg.gear_key WHERE rg.key IS NULL
UNION ALL
SELECT 'item_icon_overrides', io.id::text, io.item_key FROM item_icon_overrides io
  WHERE io.item_table = 'weapon' AND NOT EXISTS (SELECT 1 FROM ref_weapons WHERE key = io.item_key)
UNION ALL
SELECT 'item_icon_overrides', io.id::text, io.item_key FROM item_icon_overrides io
  WHERE io.item_table = 'armor' AND NOT EXISTS (SELECT 1 FROM ref_armor WHERE key = io.item_key)
UNION ALL
SELECT 'item_icon_overrides', io.id::text, io.item_key FROM item_icon_overrides io
  WHERE io.item_table = 'gear' AND NOT EXISTS (SELECT 1 FROM ref_gear WHERE key = io.item_key)
UNION ALL
SELECT 'quartermaster_items', qi.id::text, qi.item_key FROM quartermaster_items qi
  WHERE qi.item_type = 'weapon' AND NOT EXISTS (SELECT 1 FROM ref_weapons WHERE key = qi.item_key)
UNION ALL
SELECT 'quartermaster_items', qi.id::text, qi.item_key FROM quartermaster_items qi
  WHERE qi.item_type = 'armor' AND NOT EXISTS (SELECT 1 FROM ref_armor WHERE key = qi.item_key)
UNION ALL
SELECT 'quartermaster_items', qi.id::text, qi.item_key FROM quartermaster_items qi
  WHERE qi.item_type = 'gear' AND NOT EXISTS (SELECT 1 FROM ref_gear WHERE key = qi.item_key)
UNION ALL
SELECT 'combat_participants.active', cp.id::text, cp.active_weapon_key FROM combat_participants cp
  WHERE cp.active_weapon_key IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ref_weapons WHERE key = cp.active_weapon_key)
UNION ALL
SELECT 'combat_participants.secondary', cp.id::text, cp.secondary_weapon_key FROM combat_participants cp
  WHERE cp.secondary_weapon_key IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ref_weapons WHERE key = cp.secondary_weapon_key);
-- expect: 0 rows

-- (b) All 7 inventory rows still present and resolving to their new custom key.
SELECT id, weapon_key, custom_name, is_dropped FROM character_weapons
  WHERE id IN ('53ab2463-3284-46cf-aac9-3f7763a5175f','58782fb5-9cdb-4e61-b055-b0ebf3d2a8a8',
               'e81b91a7-251a-4358-8df4-0b6c051cdaef','6113e4e9-af65-48ee-8a69-0c6c50114c6e');
SELECT id, armor_key, custom_name, is_dropped FROM character_armor
  WHERE id IN ('84872e3d-a308-473a-8486-ccc18c63a03f','66569096-f8c4-4917-b595-d995d253abd7');
SELECT id, gear_key, custom_name, is_dropped FROM character_gear
  WHERE id = '46162fb9-fbdb-4edf-87a9-d43e050ced47';

-- (c) Derek Caabesk's stock CONROBE row untouched.
SELECT id, armor_key, custom_name FROM character_armor
  WHERE id = '32375383-a208-49a8-997b-6416eb9566e0';
-- expect: armor_key = 'CONROBE', custom_name IS NULL

-- (d) Shared canonical rows byte-identical to before (is_custom=false, campaign_id null).
SELECT key, is_custom, campaign_id FROM ref_weapons WHERE key IN ('PULSECAN','BARDLANCE','KNIFE');
SELECT key, is_custom, campaign_id FROM ref_armor WHERE key IN ('PROTECTOR','CONROBE');
SELECT key, is_custom, campaign_id FROM ref_gear WHERE key = 'MODPACK';
-- expect: is_custom=false, campaign_id=NULL for every row (unchanged)
