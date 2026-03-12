import postgres from 'postgres'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

async function run() {
  console.log('Running combat mode migration...')

  await sql`
    alter table campaigns
      add column if not exists session_mode text default 'exploration'
        check (session_mode in ('exploration', 'combat')),
      add column if not exists combat_round integer default 0,
      add column if not exists mode_changed_at timestamptz
  `
  console.log('✓ campaigns columns added')

  await sql`
    create table if not exists roll_log (
      id             uuid primary key default gen_random_uuid(),
      campaign_id    uuid references campaigns(id) on delete cascade,
      character_id   uuid references characters(id) on delete set null,
      character_name text not null,
      roll_label     text,
      pool           jsonb not null,
      result         jsonb not null,
      rolled_at      timestamptz default now(),
      is_dm          boolean default false,
      hidden         boolean default false
    )
  `
  console.log('✓ roll_log table created')

  await sql`
    create index if not exists roll_log_campaign_idx
      on roll_log(campaign_id, rolled_at desc)
  `
  console.log('✓ index created')

  await sql`alter table roll_log enable row level security`

  try {
    await sql`
      create policy "roll_log_all" on roll_log
        for all using (true) with check (true)
    `
    console.log('✓ RLS policy created')
  } catch {
    console.log('  (RLS policy already exists, skipping)')
  }

  console.log('\n✅ Migration complete.')
  await sql.end()
}

run().catch(e => { console.error(e); process.exit(1) })
