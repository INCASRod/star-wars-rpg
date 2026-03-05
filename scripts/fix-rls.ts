/**
 * Add missing INSERT/UPDATE/DELETE RLS policies so the anon key
 * can fully read and write character sub-tables.
 *
 * Usage: npx tsx scripts/fix-rls.ts
 *
 * Requires DATABASE_URL in .env.local
 */

import postgres from 'postgres'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const sql = postgres(process.env.DATABASE_URL!)

const policies = [
  {
    name: 'Public delete character_weapons',
    table: 'character_weapons',
    operation: 'DELETE',
    expression: 'true',
  },
  {
    name: 'Public delete character_armor',
    table: 'character_armor',
    operation: 'DELETE',
    expression: 'true',
  },
  {
    name: 'Public delete character_gear',
    table: 'character_gear',
    operation: 'DELETE',
    expression: 'true',
  },
  {
    name: 'Public delete character_critical_injuries',
    table: 'character_critical_injuries',
    operation: 'DELETE',
    expression: 'true',
  },
  {
    name: 'Public update character_talents',
    table: 'character_talents',
    operation: 'UPDATE',
    expression: 'true',
  },
  {
    name: 'Public delete character_talents',
    table: 'character_talents',
    operation: 'DELETE',
    expression: 'true',
  },
  {
    name: 'Public update character_specializations',
    table: 'character_specializations',
    operation: 'UPDATE',
    expression: 'true',
  },
  {
    name: 'Public delete character_specializations',
    table: 'character_specializations',
    operation: 'DELETE',
    expression: 'true',
  },
  {
    name: 'Public delete character_skills',
    table: 'character_skills',
    operation: 'DELETE',
    expression: 'true',
  },
  {
    name: 'Public delete xp_transactions',
    table: 'xp_transactions',
    operation: 'DELETE',
    expression: 'true',
  },
  {
    name: 'Public delete characters',
    table: 'characters',
    operation: 'DELETE',
    expression: 'true',
  },
]

async function main() {
  console.log('Connecting to Supabase PostgreSQL...\n')
  console.log('Adding missing RLS policies for full CRUD on character sub-tables...\n')

  for (const policy of policies) {
    const stmt =
      `CREATE POLICY "${policy.name}" ON ${policy.table} FOR ${policy.operation} USING (${policy.expression})`

    try {
      await sql.unsafe(stmt)
      console.log(`  + ${policy.name}`)
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        console.log(`  = ${policy.name} (already exists)`)
      } else {
        console.error(`  x ${policy.name}: ${err.message}`)
        throw err
      }
    }
  }

  // Verify: list all policies on character-related tables
  const result = await sql`
    SELECT tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'characters',
        'character_weapons',
        'character_armor',
        'character_gear',
        'character_critical_injuries',
        'character_talents',
        'character_specializations',
        'character_skills',
        'xp_transactions'
      )
    ORDER BY tablename, cmd, policyname
  `

  console.log(`\nRLS policies on character tables (${result.length} total):`)
  for (const row of result) {
    console.log(`  ${row.tablename} | ${row.cmd.padEnd(8)} | ${row.policyname}`)
  }

  await sql.end()
  console.log('\nDone!')
}

main().catch(async (err) => {
  console.error(err)
  await sql.end()
  process.exit(1)
})
