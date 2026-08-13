-- Add hand_placed_keys to character_hand_state: passive talents the player
-- has voluntarily placed into the fan (disjoint from discarded_keys).
ALTER TABLE character_hand_state
  ADD COLUMN IF NOT EXISTS hand_placed_keys TEXT[] NOT NULL DEFAULT '{}';
