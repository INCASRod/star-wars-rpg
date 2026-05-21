-- 054: conflict player acknowledgment + narrative field
-- Adds player_acknowledged (delivery flag) and narrative (longer description body)
-- to character_conflicts. Backfills existing rows so pre-feature data is silent.

ALTER TABLE character_conflicts
  ADD COLUMN player_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN narrative TEXT;

UPDATE character_conflicts SET player_acknowledged = TRUE;

ALTER TABLE character_conflicts ALTER COLUMN player_acknowledged SET DEFAULT FALSE;
