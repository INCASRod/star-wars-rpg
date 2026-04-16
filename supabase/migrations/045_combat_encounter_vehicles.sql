-- Add vehicles JSONB column to combat_encounters
-- Stores VehicleInstance[] for vehicle participants in the encounter
alter table combat_encounters
  add column if not exists vehicles jsonb not null default '[]'::jsonb;
