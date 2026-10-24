-- Stackable weapons (grenades): one character_weapons row can now carry a count.
-- Default 1 keeps every existing row exactly as it was (one row = one weapon).
-- Stacking is decided in app code (src/lib/weaponStacking.ts: 'Grenade' category).
ALTER TABLE character_weapons
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'character_weapons_quantity_check' AND conrelid = 'character_weapons'::regclass
  ) THEN
    ALTER TABLE character_weapons
      ADD CONSTRAINT character_weapons_quantity_check CHECK (quantity >= 1);
  END IF;
END $$;
