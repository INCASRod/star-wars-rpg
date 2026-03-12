-- Combat encounters table for FFG narrative dice initiative system
create table if not exists combat_encounters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade not null,
  round integer default 1 not null,
  is_active boolean default true not null,
  current_slot_index integer default 0,
  initiative_type text check (initiative_type in ('cool', 'vigilance')) default 'vigilance',
  initiative_slots jsonb default '[]'::jsonb,
  adversaries jsonb default '[]'::jsonb,
  log_entries jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- initiative_slots schema per element:
-- { id: string, type: 'pc'|'npc', order: number, characterId?: string,
--   adversaryInstanceId?: string, acted: boolean, current: boolean,
--   successes: number, advantages: number, name: string }

-- adversaries schema per element:
-- { instanceId: string, sourceId: string, name: string, type: 'minion'|'rival'|'nemesis',
--   groupSize: number, groupRemaining: number, revealed: boolean,
--   characteristics: { brawn, agility, intellect, cunning, willpower, presence },
--   soak: number, woundThreshold: number, strainThreshold?: number,
--   defense: { melee: number, ranged: number },
--   skills: any[], talents: any[], abilities: any[], weapons: any[] }

-- log_entries schema per element:
-- { id: string, round: number, slot: number, actor: string, text: string, dmOnly: boolean, timestamp: string }

create index if not exists idx_combat_encounters_campaign on combat_encounters(campaign_id);

alter table combat_encounters enable row level security;
create policy "Anyone authenticated can read combat_encounters"
  on combat_encounters for select using (auth.role() = 'authenticated');
create policy "Anyone authenticated can insert combat_encounters"
  on combat_encounters for insert with check (auth.role() = 'authenticated');
create policy "Anyone authenticated can update combat_encounters"
  on combat_encounters for update using (auth.role() = 'authenticated');

-- Enable Realtime
alter publication supabase_realtime add table combat_encounters;

-- Updated_at trigger
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger update_combat_encounters_updated_at
  before update on combat_encounters
  for each row execute function update_updated_at_column();
