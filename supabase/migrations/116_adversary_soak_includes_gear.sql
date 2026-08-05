-- 116_adversary_soak_includes_gear.sql
--
-- `ref_adversaries.soak` stored bare Brawn, on the assumption that each gear
-- entry's "Soak +" value would be added at runtime. Only two read sites ever
-- did that (AdversaryLibrary's card line and AdversaryDetailPanel's stat box).
-- The Encounter Deck card, the dossier, `adversaryToInstance` (and therefore
-- every initiative instance) and combat damage resolution all read `soak` raw,
-- so a GM-created adversary's armour was worth nothing in play.
--
-- `soak` now means the FINAL soak everywhere — the same convention OggDude's
-- `derived.soak` already used for the static catalogue — and AdversaryEditor
-- totals Brawn + gear soak on save.
--
-- Every existing row currently satisfies soak = brawn (verified before writing
-- this), so adding the gear total is unambiguous and cannot double-count.

begin;

update ref_adversaries a
set    soak = a.brawn + coalesce((
         select sum((g->>'soak')::int)
         from   jsonb_array_elements(coalesce(a.gear, '[]'::jsonb)) g
         where  g ? 'soak' and jsonb_typeof(g->'soak') = 'number'
       ), 0)
where  a.soak = a.brawn;

-- Adversary instances already staged on an encounter deck carry their own
-- copied `soak`. Recompute from each instance's own gear so decks in progress
-- pick up the correction without being re-added.
update combat_encounters e
set    adversaries = (
         select coalesce(jsonb_agg(
           case
             when inst ? 'soak'
              and jsonb_typeof(inst->'soak') = 'number'
              and (inst->>'soak')::int = coalesce((inst->'characteristics'->>'brawn')::int, -1)
             then jsonb_set(inst, '{soak}', to_jsonb(
                    (inst->>'soak')::int + coalesce((
                      select sum((g->>'soak')::int)
                      from   jsonb_array_elements(coalesce(inst->'gear', '[]'::jsonb)) g
                      where  g ? 'soak' and jsonb_typeof(g->'soak') = 'number'
                    ), 0)))
             else inst
           end
           order by ord), '[]'::jsonb)
         from jsonb_array_elements(coalesce(e.adversaries, '[]'::jsonb))
              with ordinality t(inst, ord)
       ),
       updated_at = now()
where  jsonb_array_length(coalesce(e.adversaries, '[]'::jsonb)) > 0;

commit;
