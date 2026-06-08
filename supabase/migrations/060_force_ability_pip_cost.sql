-- Add pip_cost to ref_force_abilities.
-- Seeded by counting [FP] tokens in existing descriptions.
-- [FP] is 4 chars; dividing the delta length by 4 gives the count.
-- GREATEST(1, ...) ensures activatable abilities without explicit [FP] tokens
-- default to 1 rather than 0.

ALTER TABLE ref_force_abilities
  ADD COLUMN IF NOT EXISTS pip_cost integer NOT NULL DEFAULT 1;

UPDATE ref_force_abilities
SET pip_cost = GREATEST(
  1,
  (
    CHAR_LENGTH(COALESCE(description, ''))
    - CHAR_LENGTH(REPLACE(COALESCE(description, ''), '[FP]', ''))
  ) / 4
);
