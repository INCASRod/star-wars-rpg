-- Auth B5b follow-up: stow_location_id is text on the item tables, so compare as text (158 compared it to a uuid).
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
                         where stow_location_id::text = p_asset_id::text and equip_state = 'stowed' and is_dropped is not true), '[]'::jsonb),
    'armor',   coalesce((select jsonb_agg(jsonb_build_object('id', id, 'character_id', character_id, 'armor_key', armor_key, 'custom_name', custom_name))
                         from public.character_armor
                         where stow_location_id::text = p_asset_id::text and equip_state = 'stowed' and is_dropped is not true), '[]'::jsonb),
    'gear',    coalesce((select jsonb_agg(jsonb_build_object('id', id, 'character_id', character_id, 'gear_key', gear_key, 'quantity', quantity, 'custom_name', custom_name))
                         from public.character_gear
                         where stow_location_id::text = p_asset_id::text and equip_state = 'stowed' and is_dropped is not true), '[]'::jsonb)
  );
end $$;
revoke all on function public.group_storage_rows(uuid) from public, anon;
grant execute on function public.group_storage_rows(uuid) to authenticated;
