-- map_tokens was added to supabase_realtime publication but lacked REPLICA IDENTITY
-- FULL, so DELETE events only included the primary key in the old record payload.
-- The client-side filter `map_id=eq.${mapId}` therefore could never match DELETE
-- events, meaning external deletes (e.g. from EncounterAdversaryPanel removing a
-- slot-linked token by slot_key) were invisible to useMapTokens subscribers.
-- Setting REPLICA IDENTITY FULL makes every DELETE broadcast the complete old row,
-- so the map_id filter evaluates correctly and the token disappears from the map.

ALTER TABLE map_tokens REPLICA IDENTITY FULL;
