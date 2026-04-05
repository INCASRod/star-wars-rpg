-- Add slot_key to map_tokens to track adversary initiative-slot IDs
-- (adversaries are stored in combat_encounters.initiative_slots JSONB, not in combat_participants,
--  so participant_id UUID FK cannot be used for them)
ALTER TABLE map_tokens ADD COLUMN IF NOT EXISTS slot_key text;
