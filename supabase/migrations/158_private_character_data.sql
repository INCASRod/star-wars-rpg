-- Auth B5b: private character data. Another player must not read a character's inventory, notes or backstory
-- through the database. Owner + GM keep full access. Credits and the duty / obligation text stay on `characters`
-- and stay member-readable (Sebastian, 2026-11-02).

-- ── 1. character_private: notes, backstory, motivation description moved out of `characters` ─────────────
create table public.character_private (
  character_id           uuid primary key references public.characters(id) on delete cascade,
  notes                  text not null default '',
  backstory              text not null default '',
  motivation_description text,
  updated_at             timestamptz not null default now()
);

alter table public.character_private enable row level security;
create policy character_private_select on public.character_private for select to authenticated
  using (public.can_write_character(character_id));
create policy character_private_insert on public.character_private for insert to authenticated
  with check (public.can_write_character(character_id));
create policy character_private_update on public.character_private for update to authenticated
  using (public.can_write_character(character_id)) with check (public.can_write_character(character_id));
create policy character_private_delete on public.character_private for delete to authenticated
  using (public.can_write_character(character_id));
revoke all on public.character_private from anon;
grant select, insert, update, delete on public.character_private to authenticated;

insert into public.character_private (character_id, notes, backstory, motivation_description)
select id, coalesce(notes, ''), coalesce(backstory, ''), motivation_description from public.characters;

-- Verify the copy before dropping anything: every character has a row and the text matches.
do $$
declare missing int;
begin
  select count(*) into missing from public.characters c
  left join public.character_private p on p.character_id = c.id
  where p.character_id is null
     or p.notes is distinct from coalesce(c.notes, '')
     or p.backstory is distinct from coalesce(c.backstory, '')
     or p.motivation_description is distinct from c.motivation_description;
  if missing > 0 then raise exception 'character_private copy mismatch on % rows', missing; end if;
end $$;

alter table public.characters drop column notes, drop column backstory, drop column motivation_description;

-- ── 2. Inventory: owner + GM read (replaces B5's member SELECT) ──────────────────────────────────────────
drop policy character_weapons_select on public.character_weapons;
drop policy character_armor_select   on public.character_armor;
drop policy character_gear_select    on public.character_gear;
create policy character_weapons_select on public.character_weapons for select to authenticated
  using (public.can_write_character(character_id));
create policy character_armor_select on public.character_armor for select to authenticated
  using (public.can_write_character(character_id));
create policy character_gear_select on public.character_gear for select to authenticated
  using (public.can_write_character(character_id));

-- ── 3. Group storage listing for every member (the one screen that shows another player's items) ─────────
-- Returns only what the storage sheet shows for rows stowed in that group asset: ids, owner, key, name, quantity.
create or replace function public.group_storage_rows(p_asset_id uuid) returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare v_campaign uuid;
begin
  select campaign_id into v_campaign from public.group_assets where id = p_asset_id;
  if v_campaign is null or not (public.is_member(v_campaign) or public.is_gm(v_campaign)) then
    return jsonb_build_object('weapons', '[]'::jsonb, 'armor', '[]'::jsonb, 'gear', '[]'::jsonb);
  end if;
  return jsonb_build_object(
    'weapons', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'character_id', character_id, 'weapon_key', weapon_key, 'custom_name', custom_name))
                         from public.character_weapons
                         where stow_location_id = p_asset_id and equip_state = 'stowed' and is_dropped is not true), '[]'::jsonb),
    'armor',   coalesce((select jsonb_agg(jsonb_build_object('id', id, 'character_id', character_id, 'armor_key', armor_key, 'custom_name', custom_name))
                         from public.character_armor
                         where stow_location_id = p_asset_id and equip_state = 'stowed' and is_dropped is not true), '[]'::jsonb),
    'gear',    coalesce((select jsonb_agg(jsonb_build_object('id', id, 'character_id', character_id, 'gear_key', gear_key, 'quantity', quantity, 'custom_name', custom_name))
                         from public.character_gear
                         where stow_location_id = p_asset_id and equip_state = 'stowed' and is_dropped is not true), '[]'::jsonb)
  );
end $$;
revoke all on function public.group_storage_rows(uuid) from public, anon;
grant execute on function public.group_storage_rows(uuid) to authenticated;
