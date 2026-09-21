-- 134_mod_cybernetic_categories.sql
--
-- The Archive — Phase 1: MOD & CYBERNETIC categories + mod install lifecycle.
--
-- DESIGN (settled by the architect before this migration — do not re-derive):
--   * Loose mods are ORDINARY `character_gear` rows. No new ref table, no new
--     FK type, no polymorphic item reference.
--   * A MOD catalogue entry is a `ref_gear` row whose `categories` array
--     contains 'Mod' plus exactly one subtype tag:
--         'Mod:Weapon'      -> installs into a non-lightsaber weapon
--         'Mod:Lightsaber'  -> installs into a lightsaber weapon (skill_key = 'LTSABER')
--         'Mod:Armor'       -> installs into armor
--     The subtype convention 'Mod:<Target>' is used verbatim everywhere the
--     app filters (see src/lib/itemCategories.ts — the single TS source).
--   * A CYBERNETIC item is a `ref_gear` row already tagged 'Cybernetics'
--     (live data, seeded long before this migration). Derived mapping only —
--     this migration does not touch those rows.
--   * `ref_gear.attachment_key` (the ONE schema addition here) links a MOD
--     catalogue row back to its `ref_item_attachments` source row, which is
--     where hp_required / base_mods / category_limits actually live.
--   * Vehicle-type attachments are excluded entirely (deferred). The live
--     `ref_item_attachments` table currently holds only type Weapon (147) and
--     Armor (65) rows — zero vehicle rows — but the WHERE clause below is
--     explicit anyway so a future vehicle import cannot leak into the
--     player/marketplace surfaces by accident.
--
-- Installed attachments keep living in `character_weapons.attachments` /
-- `character_armor.attachments` (jsonb array) — the path derivedStats.ts
-- already reads. Entry shape is extended from `{key}` to `{key, instance_id}`;
-- derivedStats.ts reads only `.key` and is unaffected. The normalized
-- `character_weapon_attachments` / `character_armor_attachments` tables stay
-- untouched and unused.

-- ── 1. Schema addition ───────────────────────────────────────────────────────

ALTER TABLE ref_gear
  ADD COLUMN IF NOT EXISTS attachment_key TEXT REFERENCES ref_item_attachments(key);

COMMENT ON COLUMN ref_gear.attachment_key IS
  'Non-null only on MOD catalogue rows (categories @> ARRAY[''Mod'']). Points at the ref_item_attachments row carrying the mod''s hp_required / base_mods / category_limits.';

CREATE INDEX IF NOT EXISTS ref_gear_attachment_key_idx ON ref_gear (attachment_key);

-- ── 2. Seed MOD catalogue rows from ref_item_attachments ─────────────────────
-- One ref_gear row per purchasable attachment. `encumbrance` is deliberately
-- left NULL — computeEncumbranceStats() treats a null/absent encumbrance as 0
-- (`ref?.encumbrance || 0`), which is the intended "a loose mod weighs
-- nothing" rule, enforced in exactly one place.
-- Verified before writing: zero key collisions between ref_item_attachments
-- and ref_gear, so the attachment key doubles as the gear key.

INSERT INTO ref_gear (key, name, description, encumbrance, price, rarity, is_custom, restricted, categories, attachment_key)
SELECT
  a.key,
  a.name,
  a.description,
  NULL,                                -- encumbrance: see note above
  COALESCE(a.price, 0),
  COALESCE(a.rarity, 0),
  FALSE,
  FALSE,                               -- ref_item_attachments has no restricted column
  ARRAY['Mod']::text[] || ARRAY[
    CASE
      WHEN a.type = 'Armor' THEN 'Mod:Armor'
      WHEN COALESCE(a.category_limits, '{}'::text[]) && ARRAY['Lightsaber', 'Lightsaber Hilt'] THEN 'Mod:Lightsaber'
      ELSE 'Mod:Weapon'
    END
  ]::text[],
  a.key
FROM ref_item_attachments a
WHERE a.type IN ('Weapon', 'Armor')
ON CONFLICT (key) DO NOTHING;

-- ── 3. install_mod ───────────────────────────────────────────────────────────
-- SECURITY INVOKER: runs as the caller, RLS is respected. One transaction
-- (a plpgsql function body is one). Reentrancy: the inventory row is taken
-- FOR UPDATE and then DELETEd, so a concurrent second call blocks and then
-- fails the NOT FOUND check — one call consumes one row and appends one
-- attachment entry, never two.
--
-- Returns jsonb: { attachment_instance_id: uuid, attachment_key: text,
--                  warnings: text[] }
-- Warnings are NON-BLOCKING by design (no Mechanics check, no GM gate — the
-- table is the witness). The UI surfaces them and NEVER disables Install.

CREATE OR REPLACE FUNCTION install_mod(
  p_character_id     UUID,
  p_inventory_row_id UUID,
  p_target_kind      TEXT,
  p_target_item_id   UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_gear_key        TEXT;
  v_gear_cats       TEXT[];
  v_attachment_key  TEXT;
  v_subtype         TEXT;
  v_att             ref_item_attachments%ROWTYPE;
  v_instance_id     UUID := gen_random_uuid();
  v_warnings        TEXT[] := ARRAY[]::TEXT[];
  v_skill_key       TEXT;
  v_target_cats     TEXT[];
  v_hard_points     INT;
  v_hp_used         INT;
  v_attachments     JSONB;
BEGIN
  IF p_target_kind NOT IN ('weapon', 'armor') THEN
    RAISE EXCEPTION 'install_mod: p_target_kind must be ''weapon'' or ''armor'', got %', p_target_kind;
  END IF;

  -- Own the inventory row (lock it for the whole transaction).
  -- COALESCE so "no such row" (NULL) stays distinguishable from "row exists
  -- but has a null gear_key" ('').
  SELECT COALESCE(g.gear_key, '') INTO v_gear_key
  FROM character_gear g
  WHERE g.id = p_inventory_row_id
    AND g.character_id = p_character_id
    AND g.is_dropped = FALSE
  FOR UPDATE;

  IF v_gear_key IS NULL THEN
    RAISE EXCEPTION 'install_mod: inventory row % does not belong to character % (or is already consumed)',
      p_inventory_row_id, p_character_id;
  END IF;

  SELECT rg.attachment_key, COALESCE(rg.categories, '{}'::text[])
    INTO v_attachment_key, v_gear_cats
  FROM ref_gear rg WHERE rg.key = v_gear_key;

  IF v_attachment_key IS NULL THEN
    RAISE EXCEPTION 'install_mod: gear "%" is not an installable mod (no attachment_key)', v_gear_key;
  END IF;

  SELECT * INTO v_att FROM ref_item_attachments WHERE key = v_attachment_key;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'install_mod: attachment "%" not found in ref_item_attachments', v_attachment_key;
  END IF;

  v_subtype := CASE
    WHEN v_gear_cats && ARRAY['Mod:Lightsaber'] THEN 'lightsaber'
    WHEN v_gear_cats && ARRAY['Mod:Armor']      THEN 'armor'
    WHEN v_gear_cats && ARRAY['Mod:Weapon']     THEN 'weapon'
    ELSE NULL
  END;
  IF v_subtype IS NULL THEN
    RAISE EXCEPTION 'install_mod: gear "%" carries no Mod:<target> subtype tag', v_gear_key;
  END IF;

  -- Own the target row and read what we need to validate/warn against.
  IF p_target_kind = 'weapon' THEN
    SELECT COALESCE(cw.attachments, '[]'::jsonb), rw.skill_key, COALESCE(rw.hard_points, 0), COALESCE(rw.categories, '{}'::text[])
      INTO v_attachments, v_skill_key, v_hard_points, v_target_cats
    FROM character_weapons cw
    LEFT JOIN ref_weapons rw ON rw.key = cw.weapon_key
    WHERE cw.id = p_target_item_id AND cw.character_id = p_character_id
    FOR UPDATE OF cw;
  ELSE
    SELECT COALESCE(ca.attachments, '[]'::jsonb), NULL::text, COALESCE(ra.hard_points, 0), COALESCE(ra.categories, '{}'::text[])
      INTO v_attachments, v_skill_key, v_hard_points, v_target_cats
    FROM character_armor ca
    LEFT JOIN ref_armor ra ON ra.key = ca.armor_key
    WHERE ca.id = p_target_item_id AND ca.character_id = p_character_id
    FOR UPDATE OF ca;
  END IF;

  IF v_attachments IS NULL THEN
    RAISE EXCEPTION 'install_mod: target % "%" does not belong to character %',
      p_target_kind, p_target_item_id, p_character_id;
  END IF;

  -- ── Subtype/target match — HARD, raises (never a silent no-op) ──
  IF v_subtype = 'armor' AND p_target_kind <> 'armor' THEN
    RAISE EXCEPTION 'install_mod: "%" is an armour mod and cannot be installed on a %', v_att.name, p_target_kind;
  END IF;
  IF v_subtype IN ('weapon', 'lightsaber') AND p_target_kind <> 'weapon' THEN
    RAISE EXCEPTION 'install_mod: "%" is a weapon mod and cannot be installed on a %', v_att.name, p_target_kind;
  END IF;
  IF v_subtype = 'lightsaber' AND COALESCE(v_skill_key, '') <> 'LTSABER' THEN
    RAISE EXCEPTION 'install_mod: "%" is a lightsaber mod and can only be installed on a lightsaber weapon (target skill is %)',
      v_att.name, COALESCE(v_skill_key, 'unknown');
  END IF;
  IF v_subtype = 'weapon' AND COALESCE(v_skill_key, '') = 'LTSABER' THEN
    RAISE EXCEPTION 'install_mod: "%" is a non-lightsaber weapon mod and cannot be installed on a lightsaber', v_att.name;
  END IF;

  -- ── Non-blocking warnings ──
  SELECT COALESCE(SUM(COALESCE(ria.hp_required, 0)), 0)::int INTO v_hp_used
  FROM jsonb_array_elements(v_attachments) e
  JOIN ref_item_attachments ria ON ria.key = e->>'key';

  IF v_hp_used + COALESCE(v_att.hp_required, 0) > v_hard_points THEN
    v_warnings := v_warnings || format(
      'Exceeds hard points: %s of %s used, this mod needs %s.',
      v_hp_used, v_hard_points, COALESCE(v_att.hp_required, 0));
  END IF;

  IF COALESCE(array_length(v_att.category_limits, 1), 0) > 0
     AND NOT (v_att.category_limits && v_target_cats) THEN
    v_warnings := v_warnings || format(
      'Category may not apply: this mod is listed for %s.',
      array_to_string(v_att.category_limits, ', '));
  END IF;

  -- ── Mutate: consume the inventory row, append the attachment entry ──
  DELETE FROM character_gear WHERE id = p_inventory_row_id AND character_id = p_character_id;

  IF p_target_kind = 'weapon' THEN
    UPDATE character_weapons
       SET attachments = v_attachments || jsonb_build_array(
             jsonb_build_object('key', v_attachment_key, 'instance_id', v_instance_id))
     WHERE id = p_target_item_id AND character_id = p_character_id;
  ELSE
    UPDATE character_armor
       SET attachments = v_attachments || jsonb_build_array(
             jsonb_build_object('key', v_attachment_key, 'instance_id', v_instance_id))
     WHERE id = p_target_item_id AND character_id = p_character_id;
  END IF;

  RETURN jsonb_build_object(
    'attachment_instance_id', v_instance_id,
    'attachment_key',         v_attachment_key,
    'warnings',               to_jsonb(v_warnings)
  );
END;
$$;

-- ── 4. uninstall_mod ─────────────────────────────────────────────────────────
-- Exact inverse of install_mod: drops the entry matching p_attachment_instance_id
-- from the target's attachments jsonb and re-creates the loose character_gear
-- row it came from. Returns jsonb: { inventory_row_id, gear_key }.

CREATE OR REPLACE FUNCTION uninstall_mod(
  p_character_id            UUID,
  p_target_kind             TEXT,
  p_target_item_id          UUID,
  p_attachment_instance_id  UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_attachments    JSONB;
  v_entry          JSONB;
  v_attachment_key TEXT;
  v_gear_key       TEXT;
  v_new_row_id     UUID;
BEGIN
  IF p_target_kind NOT IN ('weapon', 'armor') THEN
    RAISE EXCEPTION 'uninstall_mod: p_target_kind must be ''weapon'' or ''armor'', got %', p_target_kind;
  END IF;

  IF p_target_kind = 'weapon' THEN
    SELECT COALESCE(cw.attachments, '[]'::jsonb) INTO v_attachments
    FROM character_weapons cw
    WHERE cw.id = p_target_item_id AND cw.character_id = p_character_id
    FOR UPDATE;
  ELSE
    SELECT COALESCE(ca.attachments, '[]'::jsonb) INTO v_attachments
    FROM character_armor ca
    WHERE ca.id = p_target_item_id AND ca.character_id = p_character_id
    FOR UPDATE;
  END IF;

  IF v_attachments IS NULL THEN
    RAISE EXCEPTION 'uninstall_mod: target % "%" does not belong to character %',
      p_target_kind, p_target_item_id, p_character_id;
  END IF;

  SELECT e INTO v_entry
  FROM jsonb_array_elements(v_attachments) e
  WHERE e->>'instance_id' = p_attachment_instance_id::text
  LIMIT 1;

  IF v_entry IS NULL THEN
    RAISE EXCEPTION 'uninstall_mod: no installed attachment with instance_id % on % %',
      p_attachment_instance_id, p_target_kind, p_target_item_id;
  END IF;

  v_attachment_key := v_entry->>'key';

  SELECT rg.key INTO v_gear_key FROM ref_gear rg WHERE rg.attachment_key = v_attachment_key LIMIT 1;
  IF v_gear_key IS NULL THEN
    RAISE EXCEPTION 'uninstall_mod: no MOD catalogue row references attachment "%" — cannot return it to inventory', v_attachment_key;
  END IF;

  -- Drop the ONE matching entry (instance-scoped, so two copies of the same
  -- mod key on one item stay independently removable).
  IF p_target_kind = 'weapon' THEN
    UPDATE character_weapons
       SET attachments = COALESCE((
             SELECT jsonb_agg(e) FROM jsonb_array_elements(v_attachments) e
             WHERE e->>'instance_id' IS DISTINCT FROM p_attachment_instance_id::text
           ), '[]'::jsonb)
     WHERE id = p_target_item_id AND character_id = p_character_id;
  ELSE
    UPDATE character_armor
       SET attachments = COALESCE((
             SELECT jsonb_agg(e) FROM jsonb_array_elements(v_attachments) e
             WHERE e->>'instance_id' IS DISTINCT FROM p_attachment_instance_id::text
           ), '[]'::jsonb)
     WHERE id = p_target_item_id AND character_id = p_character_id;
  END IF;

  INSERT INTO character_gear (character_id, gear_key, quantity, equip_state, is_equipped)
  VALUES (p_character_id, v_gear_key, 1, 'carrying', FALSE)
  RETURNING id INTO v_new_row_id;

  RETURN jsonb_build_object('inventory_row_id', v_new_row_id, 'gear_key', v_gear_key);
END;
$$;

GRANT EXECUTE ON FUNCTION install_mod(UUID, UUID, TEXT, UUID)   TO authenticated, anon;
GRANT EXECUTE ON FUNCTION uninstall_mod(UUID, TEXT, UUID, UUID) TO authenticated, anon;
