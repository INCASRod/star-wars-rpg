-- ═══════════════════════════════════════════════════════════════════════════
-- 136 — The Archive, Phase 2b: cybernetic install / uninstall lifecycle
--
-- install_cybernetic() / uninstall_cybernetic() are the ONLY sanctioned path
-- for moving a `character_gear` row into (and out of) the surgically-installed
-- state defined by migration 135:
--
--     equip_slot = 'cybernetics' AND equip_state = 'equipped' AND is_dropped = false
--
-- No client may write `equip_slot = 'cybernetics'` directly. Same contract and
-- conventions as install_mod()/uninstall_mod() (migration 134):
--   * SECURITY INVOKER — runs as the caller, RLS is respected.
--   * One transaction (a plpgsql function body is one).
--   * The owned row is taken FOR UPDATE before anything is read off it, so a
--     concurrent second call blocks and then re-reads the mutated state.
--   * RAISE EXCEPTION for hard rule violations; everything else is a
--     NON-BLOCKING `warnings text[]`. The UI surfaces warnings and NEVER
--     disables Install — the table is the witness.
--
-- ── HARD RULES (the only two RAISE EXCEPTIONs on a valid, owned implant) ────
--   1. A Biofeedback Regulator cannot be installed on a droid.
--   2. A character may have at most one installed Biofeedback Regulator.
-- Both are RAW (migration 135's seed note on BIOFEEDREG). Over-cap is
-- deliberately NOT one of these — RAW makes exceeding the implant cap a
-- consequence, not a prohibition.
--
-- ── WARNINGS ───────────────────────────────────────────────────────────────
--   a. Over cap. The cap formula is duplicated here rather than approximated,
--      because an approximation would disagree with the number the sheet
--      shows and the mismatch would read as a bug:
--         cap  = (droid ? 6 : Brawn)
--                + BIOFEEDREG's own effect `value` (default 2) if installed
--                + 1 per rank of the MOREMACH talent
--         used = installed implants that count toward the cap; an implant with
--                NO seeded effect rows still occupies a slot
--      This mirrors computeCyberneticEffects() in src/lib/derivedStats.ts
--      line-for-line. If one changes, change both.
--   b. Stacking. `ref_cybernetic_effects.stack_group` means "these effects
--      apply ONCE no matter how many copies are installed". Two distinct
--      warnings come out of it, and BOTH are emitted because they describe
--      different mistakes:
--        b1. SAME stack_group already installed — e.g. a second Mod V
--            cyberarm. Legal and correct RAW (a matched pair), but the bonus
--            counts once, so the player should know before paying for it.
--        b2. DIFFERENT stack_group in the SAME family already installed —
--            e.g. a Mod VI arm going in next to a Mod V arm. RAW: "if both
--            arms are replaced they must be the same model". This is the
--            mismatched-pair warning the task brief asks for. Family is the
--            stack_group's first underscore-delimited segment ('cyberarm_v'
--            and 'cyberarm_vi' are both family 'cyberarm'), which is exactly
--            how migration 135 seeded them.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── install_cybernetic ─────────────────────────────────────────────────────
-- Returns jsonb: { gear_key: text, warnings: text[] }

CREATE OR REPLACE FUNCTION install_cybernetic(
  p_character_id UUID,
  p_gear_row_id  UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_gear_key      TEXT;
  v_cats          TEXT[];
  v_warnings      TEXT[] := ARRAY[]::TEXT[];
  v_is_droid      BOOLEAN;
  v_brawn         INT;
  v_cap           INT;
  v_used          INT;
  v_bio_value     INT;
  v_moremach      INT;
  v_counts        BOOLEAN;
  v_clash         TEXT;
BEGIN
  -- Own + lock the inventory row. COALESCE keeps "no such row" (NULL)
  -- distinguishable from "row exists but has a null gear_key" ('').
  SELECT COALESCE(g.gear_key, '') INTO v_gear_key
  FROM character_gear g
  WHERE g.id = p_gear_row_id
    AND g.character_id = p_character_id
    AND g.is_dropped = FALSE
  FOR UPDATE;

  IF v_gear_key IS NULL THEN
    RAISE EXCEPTION 'install_cybernetic: inventory row % does not belong to character % (or is dropped)',
      p_gear_row_id, p_character_id;
  END IF;

  SELECT COALESCE(rg.categories, '{}'::text[]) INTO v_cats
  FROM ref_gear rg WHERE rg.key = v_gear_key;

  IF v_cats IS NULL OR NOT (v_cats && ARRAY['Cybernetics']) THEN
    RAISE EXCEPTION 'install_cybernetic: gear "%" is not a cybernetic implant', v_gear_key;
  END IF;

  SELECT (c.species_key = 'DROID'), COALESCE(c.brawn, 0)
    INTO v_is_droid, v_brawn
  FROM characters c WHERE c.id = p_character_id;

  IF v_is_droid IS NULL THEN
    RAISE EXCEPTION 'install_cybernetic: character % not found or not visible', p_character_id;
  END IF;

  -- ── HARD RULE 1: no Biofeedback Regulator on a droid ──
  IF v_gear_key = 'BIOFEEDREG' AND v_is_droid THEN
    RAISE EXCEPTION 'install_cybernetic: a Biofeedback Regulator cannot be installed on a droid';
  END IF;

  -- ── HARD RULE 2: at most one installed Biofeedback Regulator ──
  IF v_gear_key = 'BIOFEEDREG' AND EXISTS (
    SELECT 1 FROM character_gear cg
    WHERE cg.character_id = p_character_id
      AND cg.gear_key = 'BIOFEEDREG'
      AND cg.equip_slot = 'cybernetics'
      AND cg.is_dropped = FALSE
      AND cg.id <> p_gear_row_id
  ) THEN
    RAISE EXCEPTION 'install_cybernetic: this character already has a Biofeedback Regulator installed; only one is permitted';
  END IF;

  -- ── WARNING (b): stack_group collisions against what is already installed ──
  -- b1 — same stack_group already present: bonus applies once.
  SELECT string_agg(DISTINCT other.name, ', ') INTO v_clash
  FROM ref_cybernetic_effects new_e
  -- NOT filtered on gear_key: a second copy of the SAME implant (a matched
  -- pair of Mod V arms) is the commonest case of this and must warn too —
  -- it is legal, but the bonus counts once. The cg.id <> p_gear_row_id
  -- clause below is what keeps this from matching the row being installed.
  JOIN ref_cybernetic_effects old_e
    ON old_e.stack_group = new_e.stack_group
  JOIN character_gear cg
    ON cg.gear_key = old_e.gear_key
   AND cg.character_id = p_character_id
   AND cg.equip_slot = 'cybernetics'
   AND cg.is_dropped = FALSE
   AND cg.id <> p_gear_row_id
  JOIN ref_gear other ON other.key = old_e.gear_key
  WHERE new_e.gear_key = v_gear_key
    AND new_e.stack_group IS NOT NULL;

  IF v_clash IS NOT NULL THEN
    v_warnings := v_warnings || format(
      'Bonus will not stack: %s is already installed and shares this implant''s effect group.', v_clash);
  END IF;

  -- b2 — different model in the same family (mismatched pair).
  SELECT string_agg(DISTINCT other.name, ', ') INTO v_clash
  FROM ref_cybernetic_effects new_e
  JOIN ref_cybernetic_effects old_e
    ON split_part(old_e.stack_group, '_', 1) = split_part(new_e.stack_group, '_', 1)
   AND old_e.stack_group <> new_e.stack_group
  JOIN character_gear cg
    ON cg.gear_key = old_e.gear_key
   AND cg.character_id = p_character_id
   AND cg.equip_slot = 'cybernetics'
   AND cg.is_dropped = FALSE
   AND cg.id <> p_gear_row_id
  JOIN ref_gear other ON other.key = old_e.gear_key
  WHERE new_e.gear_key = v_gear_key
    AND new_e.stack_group IS NOT NULL;

  IF v_clash IS NOT NULL THEN
    v_warnings := v_warnings || format(
      'Mismatched pair: %s is a different model of the same limb. Both must be the same model, and the bonus does not stack.', v_clash);
  END IF;

  -- ── Mutate: mark the row surgically installed ──
  UPDATE character_gear
     SET equip_slot  = 'cybernetics',
         equip_state = 'equipped',
         is_equipped = TRUE
   WHERE id = p_gear_row_id AND character_id = p_character_id;

  -- ── WARNING (a): over cap — computed AFTER the update so `used` counts the
  -- implant that was just installed, matching what the sheet will render. ──
  SELECT COALESCE(MAX(e.value), 2) INTO v_bio_value
  FROM ref_cybernetic_effects e WHERE e.gear_key = 'BIOFEEDREG' AND e.value IS NOT NULL;

  SELECT COALESCE(SUM(COALESCE(t.ranks, 1)), 0)::int INTO v_moremach
  FROM character_talents t
  WHERE t.character_id = p_character_id AND t.talent_key = 'MOREMACH';

  v_cap := CASE WHEN v_is_droid THEN 6 ELSE v_brawn END + v_moremach;
  IF EXISTS (
    SELECT 1 FROM character_gear cg
    WHERE cg.character_id = p_character_id AND cg.gear_key = 'BIOFEEDREG'
      AND cg.equip_slot = 'cybernetics' AND cg.is_dropped = FALSE
  ) THEN
    v_cap := v_cap + v_bio_value;
  END IF;

  SELECT COUNT(*)::int INTO v_used
  FROM character_gear cg
  WHERE cg.character_id = p_character_id
    AND cg.equip_slot = 'cybernetics'
    AND cg.is_dropped = FALSE
    AND (
      NOT EXISTS (SELECT 1 FROM ref_cybernetic_effects e WHERE e.gear_key = cg.gear_key)
      OR EXISTS (SELECT 1 FROM ref_cybernetic_effects e WHERE e.gear_key = cg.gear_key AND e.counts_toward_cap)
    );

  SELECT (
    NOT EXISTS (SELECT 1 FROM ref_cybernetic_effects e WHERE e.gear_key = v_gear_key)
    OR EXISTS (SELECT 1 FROM ref_cybernetic_effects e WHERE e.gear_key = v_gear_key AND e.counts_toward_cap)
  ) INTO v_counts;

  IF v_counts AND v_used > v_cap THEN
    v_warnings := v_warnings || format(
      'Over the implant cap: %s of %s used. Exceeding the cap is allowed but has consequences.',
      v_used, v_cap);
  END IF;

  RETURN jsonb_build_object('gear_key', v_gear_key, 'warnings', to_jsonb(v_warnings));
END;
$$;

-- ── uninstall_cybernetic ───────────────────────────────────────────────────
-- Exact inverse. NEVER deletes the row — an extracted implant becomes a
-- carried one, matching uninstall_mod()'s ('carrying', FALSE) convention.
-- Returns jsonb: { gear_key: text }

CREATE OR REPLACE FUNCTION uninstall_cybernetic(
  p_character_id UUID,
  p_gear_row_id  UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_gear_key TEXT;
  v_slot     TEXT;
BEGIN
  SELECT COALESCE(g.gear_key, ''), g.equip_slot INTO v_gear_key, v_slot
  FROM character_gear g
  WHERE g.id = p_gear_row_id
    AND g.character_id = p_character_id
    AND g.is_dropped = FALSE
  FOR UPDATE;

  IF v_gear_key IS NULL THEN
    RAISE EXCEPTION 'uninstall_cybernetic: inventory row % does not belong to character % (or is dropped)',
      p_gear_row_id, p_character_id;
  END IF;

  IF v_slot IS DISTINCT FROM 'cybernetics' THEN
    RAISE EXCEPTION 'uninstall_cybernetic: gear row % is not currently installed', p_gear_row_id;
  END IF;

  UPDATE character_gear
     SET equip_slot  = NULL,
         equip_state = 'carrying',
         is_equipped = FALSE
   WHERE id = p_gear_row_id AND character_id = p_character_id;

  RETURN jsonb_build_object('gear_key', v_gear_key);
END;
$$;

GRANT EXECUTE ON FUNCTION install_cybernetic(UUID, UUID)   TO authenticated, anon;
GRANT EXECUTE ON FUNCTION uninstall_cybernetic(UUID, UUID) TO authenticated, anon;
