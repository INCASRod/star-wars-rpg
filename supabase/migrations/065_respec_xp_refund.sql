-- 065_respec_xp_refund.sql
-- Wipes all purchased talent nodes and Force Power upgrade nodes.
-- Inserts positive XP refund transactions for every affected character.
-- Updates characters.xp_available to reflect refunded amounts.

DO $$
DECLARE
  char_rec   RECORD;
  talent_xp  INTEGER;
  force_xp   INTEGER;
BEGIN
  FOR char_rec IN SELECT id FROM characters LOOP

    -- Talent refund
    SELECT COALESCE(SUM(COALESCE(xp_cost, 0)), 0)
    INTO talent_xp
    FROM character_talents
    WHERE character_id = char_rec.id;

    IF talent_xp > 0 THEN
      INSERT INTO xp_transactions (character_id, amount, reason)
      VALUES (
        char_rec.id,
        talent_xp,
        'reSpecialized migration: all talent purchases refunded'
      );
    END IF;

    -- Force Power upgrade refund (tree_row > 0 = upgrade nodes; tree_row = 0 = base power kept)
    SELECT COALESCE(SUM(COALESCE(xp_cost, 0)), 0)
    INTO force_xp
    FROM character_force_abilities
    WHERE character_id = char_rec.id
      AND tree_row > 0;

    IF force_xp > 0 THEN
      INSERT INTO xp_transactions (character_id, amount, reason)
      VALUES (
        char_rec.id,
        force_xp,
        'reSpecialized migration: Force Power upgrade nodes refunded'
      );
    END IF;

    -- Update xp_available
    IF (talent_xp + force_xp) > 0 THEN
      UPDATE characters
      SET xp_available = xp_available + talent_xp + force_xp
      WHERE id = char_rec.id;
    END IF;

  END LOOP;

  -- Wipe talent purchases
  DELETE FROM character_talents;

  -- Wipe Force Power upgrade nodes (keep base: tree_row = 0)
  DELETE FROM character_force_abilities WHERE tree_row > 0;

END;
$$;
