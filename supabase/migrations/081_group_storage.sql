-- supabase/migrations/081_group_storage.sql

-- 1. Flag group assets as shared storage pools
ALTER TABLE group_assets
  ADD COLUMN is_group_storage boolean NOT NULL DEFAULT false;

-- 2. Atomic take operation used by useGroupStorage.takeItem()
--    Handles full ownership transfer (weapon/armor/gear) and partial qty split (gear).
CREATE OR REPLACE FUNCTION take_group_storage_item(
  p_item_id   uuid,
  p_item_type text,     -- 'weapon' | 'armor' | 'gear'
  p_taker_id  uuid,
  p_take_qty  integer   -- NULL means take all; only meaningful for gear
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_qty integer;
BEGIN
  IF p_item_type = 'weapon' THEN
    UPDATE character_weapons
    SET character_id       = p_taker_id,
        equip_state        = 'carrying',
        stow_location_id   = NULL,
        stow_location_name = NULL,
        stow_location_type = NULL
    WHERE id = p_item_id;

  ELSIF p_item_type = 'armor' THEN
    UPDATE character_armor
    SET character_id       = p_taker_id,
        equip_state        = 'carrying',
        stow_location_id   = NULL,
        stow_location_name = NULL,
        stow_location_type = NULL
    WHERE id = p_item_id;

  ELSIF p_item_type = 'gear' THEN
    SELECT qty INTO v_qty FROM character_gear WHERE id = p_item_id;

    IF p_take_qty IS NULL OR p_take_qty >= v_qty THEN
      -- Full transfer
      UPDATE character_gear
      SET character_id       = p_taker_id,
          equip_state        = 'carrying',
          stow_location_id   = NULL,
          stow_location_name = NULL,
          stow_location_type = NULL
      WHERE id = p_item_id;
    ELSE
      -- Partial: decrement original, clone row for taker
      UPDATE character_gear SET qty = qty - p_take_qty WHERE id = p_item_id;

      INSERT INTO character_gear (
        character_id, gear_key, equip_state, qty,
        is_equipped, notes, condition, item_image_url, is_dropped
      )
      SELECT
        p_taker_id, gear_key, 'carrying', p_take_qty,
        false, notes, condition, item_image_url, false
      FROM character_gear
      WHERE id = p_item_id;
    END IF;
  END IF;
END;
$$;
