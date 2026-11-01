-- Auth B5: lock-down 2. Character data readable by campaign members, writable by owner + GM. No anon access.
-- Shared play state (roll_log, destiny, pending_*, group_assets, quartermaster, combat_*, map_tokens writes,
-- session_roll_state) is B6 and untouched here.

-- ── Helpers (STABLE, DEFINER, fixed search_path, authenticated only) ────────────────────────────
create or replace function public.is_member(p_campaign_id uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from public.players p where p.user_id = auth.uid() and p.campaign_id = p_campaign_id);
$$;

create or replace function public.owns_character(p_character_id uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.characters c join public.players p on p.id = c.player_id
    where c.id = p_character_id and p.user_id = auth.uid()
  );
$$;

create or replace function public.character_campaign(p_character_id uuid) returns uuid
language sql stable security definer set search_path = public, pg_temp as $$
  select campaign_id from public.characters where id = p_character_id;
$$;

-- Child rows (character_id): readable by campaign members, writable by the owner or the GM.
create or replace function public.can_read_character(p_character_id uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select public.is_member(public.character_campaign(p_character_id));
$$;

create or replace function public.can_write_character(p_character_id uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select public.owns_character(p_character_id) or public.is_gm(public.character_campaign(p_character_id));
$$;

revoke all on function public.is_member(uuid), public.owns_character(uuid), public.character_campaign(uuid),
  public.can_read_character(uuid), public.can_write_character(uuid) from public, anon;
grant execute on function public.is_member(uuid), public.owns_character(uuid), public.character_campaign(uuid),
  public.can_read_character(uuid), public.can_write_character(uuid) to authenticated;

-- ── Drop the old open policies on exactly these tables ──────────────────────────────────────────
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and (
      tablename like 'character\_%' or tablename in
      ('characters','xp_transactions','critical_injury_requests','force_notifications','force_spec_requests','players'))
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- ── character_* child tables + xp_transactions (character_id) ───────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'character_armor','character_conflicts','character_critical_injuries','character_force_abilities',
    'character_gear','character_hand_state','character_obligations','character_sig_ability_nodes',
    'character_skills','character_specializations','character_talents','character_weapons','xp_transactions']
  loop
    execute format('create policy %I on public.%I for select to authenticated using (public.can_read_character(character_id))', t||'_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.can_write_character(character_id))', t||'_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.can_write_character(character_id)) with check (public.can_write_character(character_id))', t||'_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.can_write_character(character_id))', t||'_delete', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

-- ── characters ──────────────────────────────────────────────────────────────────────────────────
create policy characters_select on public.characters for select to authenticated
  using (public.is_member(campaign_id));
create policy characters_insert on public.characters for insert to authenticated
  with check (
    public.is_gm(campaign_id)
    or (public.is_member(campaign_id) and exists (
          select 1 from public.players p
          where p.id = player_id and p.user_id = auth.uid() and p.campaign_id = characters.campaign_id))
  );
create policy characters_update on public.characters for update to authenticated
  using (public.owns_character(id) or public.is_gm(campaign_id))
  with check (public.owns_character(id) or public.is_gm(campaign_id));
create policy characters_delete on public.characters for delete to authenticated
  using (public.is_gm(campaign_id));
revoke all on public.characters from anon;

-- ── request / notification tables: owner + GM read / insert / update, GM deletes ────────────────
-- (the owner updates critical_injury_requests when they roll, so update is not GM-only.)
do $$
declare t text;
begin
  foreach t in array array['critical_injury_requests','force_notifications','force_spec_requests']
  loop
    execute format('create policy %I on public.%I for select to authenticated using (public.can_write_character(character_id))', t||'_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.can_write_character(character_id))', t||'_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.can_write_character(character_id)) with check (public.can_write_character(character_id))', t||'_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_gm(campaign_id))', t||'_delete', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

-- ── players: members read; only the GM inserts / edits / deletes (claim + unbind are B2 DEFINER RPCs) ──
create policy players_select on public.players for select to authenticated
  using (user_id = auth.uid() or public.is_member(campaign_id));
create policy players_insert on public.players for insert to authenticated with check (public.is_gm(campaign_id));
create policy players_update on public.players for update to authenticated
  using (public.is_gm(campaign_id)) with check (public.is_gm(campaign_id));
create policy players_delete on public.players for delete to authenticated using (public.is_gm(campaign_id));
revoke all on public.players from anon;

-- ── character_sessions: own rows (or GM) only ───────────────────────────────────────────────────
create policy character_sessions_select on public.character_sessions for select to authenticated
  using (public.owns_character(character_id) or public.is_gm(campaign_id));
create policy character_sessions_insert on public.character_sessions for insert to authenticated
  with check (public.owns_character(character_id) or public.is_gm(campaign_id));
create policy character_sessions_update on public.character_sessions for update to authenticated
  using (public.owns_character(character_id) or public.is_gm(campaign_id))
  with check (public.owns_character(character_id) or public.is_gm(campaign_id));
create policy character_sessions_delete on public.character_sessions for delete to authenticated
  using (public.owns_character(character_id) or public.is_gm(campaign_id));
revoke all on public.character_sessions from anon;

-- ── portraits bucket: public read unchanged; write = owner of the character in the path, or GM ──
drop policy if exists portraits_public_insert on storage.objects;
drop policy if exists portraits_public_update on storage.objects;
drop policy if exists portraits_public_delete on storage.objects;
create policy portraits_write_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'portraits' and name ~ '^[0-9a-f-]{36}\.' and public.can_write_character(split_part(name, '.', 1)::uuid));
create policy portraits_write_update on storage.objects for update to authenticated
  using (bucket_id = 'portraits' and name ~ '^[0-9a-f-]{36}\.' and public.can_write_character(split_part(name, '.', 1)::uuid));
create policy portraits_write_delete on storage.objects for delete to authenticated
  using (bucket_id = 'portraits' and name ~ '^[0-9a-f-]{36}\.' and public.can_write_character(split_part(name, '.', 1)::uuid));
