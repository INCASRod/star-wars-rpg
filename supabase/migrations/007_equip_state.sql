-- Add equip_state to character_weapons, character_armor, character_gear
-- States: 'equipped' (on body/wielded) | 'carrying' (in pack, counts enc) | 'stowed' (in storage, 0 enc)

ALTER TABLE character_weapons
  ADD COLUMN IF NOT EXISTS equip_state text NOT NULL DEFAULT 'carrying';

UPDATE character_weapons
  SET equip_state = CASE WHEN is_equipped THEN 'equipped' ELSE 'carrying' END;

ALTER TABLE character_armor
  ADD COLUMN IF NOT EXISTS equip_state text NOT NULL DEFAULT 'carrying';

UPDATE character_armor
  SET equip_state = CASE WHEN is_equipped THEN 'equipped' ELSE 'carrying' END;

ALTER TABLE character_gear
  ADD COLUMN IF NOT EXISTS equip_state text NOT NULL DEFAULT 'carrying';

UPDATE character_gear
  SET equip_state = CASE WHEN is_equipped THEN 'equipped' ELSE 'carrying' END;
