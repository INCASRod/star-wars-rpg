-- 115_encounters_per_map.sql
--
-- Encounters are per-map and permanent; combat is a phase they pass through.
--
-- Before this migration `combat_encounters` had no `map_id` at all: one
-- campaign-wide row was located by `.eq('is_active', true)`, that row was only
-- ever created by Begin Combat (or lazily by the staging toolbar), and
-- `endEncounter` set `is_active = false` — which made the GM's Encounter Deck
-- go empty for every map at once and nulled `map_tokens.slot_key` campaign-wide,
-- permanently unlinking surviving tokens from their adversary instances.
-- Map scoping was faked by stamping `map_id` onto each instance inside the
-- `adversaries`/`vehicles` JSONB and filtering rosters client-side.
--
-- New model:
--   * one persistent `combat_encounters` row per (campaign_id, map_id) — the
--     map's Encounter Deck, created lazily on first add, never deleted
--   * `is_active` now means exactly one thing: COMBAT IS LIVE on this row.
--     Only Begin Combat sets it true; End Encounter sets it false and leaves
--     the deck (adversaries, vehicles, tokens, slot links) fully intact.
--     Every player-side consumer that reads `is_active` keeps its old meaning.
--
-- Per the campaign owner's decision, existing encounter rows are NOT
-- backfilled onto maps — decks start clean.

begin;

-- Start clean: no backfill of the pre-map-scoped rows.
delete from combat_encounters;

alter table combat_encounters
  add column map_id uuid references maps(id) on delete cascade;

-- One deck per map. Rows with a null map_id cannot exist going forward, but the
-- column stays nullable so the FK cascade and any legacy insert path fail loudly
-- on the unique index rather than silently creating a second campaign-wide row.
create unique index combat_encounters_campaign_map_uniq
  on combat_encounters (campaign_id, map_id);

comment on column combat_encounters.map_id is
  'Map this encounter deck belongs to. One persistent row per (campaign_id, map_id); created lazily on first adversary/vehicle add via ensureEncounterForMap().';

comment on column combat_encounters.is_active is
  'True only while combat is live on this encounter. Begin Combat sets it; End Encounter clears it. Not a row-existence flag — the deck persists either way.';

commit;
