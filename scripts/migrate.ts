/**
 * Apply all migrations and seeds via direct PostgreSQL connection.
 *
 * Usage: npx tsx scripts/migrate.ts
 *
 * Requires DATABASE_URL in .env.local
 */

import postgres from 'postgres'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const sql = postgres(process.env.DATABASE_URL!)

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations')

async function main() {
  console.log('Connecting to Supabase PostgreSQL...\n')

  // Apply migrations in order
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const file of migrationFiles) {
    console.log(`Applying migration: ${file}`)
    const sqlText = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8')
    try {
      await sql.unsafe(sqlText)
      console.log(`  ✓ ${file}`)
    } catch (err: any) {
      // Skip "already exists" errors so this is idempotent
      if (err.message?.includes('already exists')) {
        console.log(`  ⊘ ${file} (already applied)`)
      } else {
        console.error(`  ✗ ${file}: ${err.message}`)
        throw err
      }
    }
  }

  // Seed critical injuries
  const seedFile = path.join(__dirname, '..', 'supabase', 'seed_critical_injuries.sql')
  if (fs.existsSync(seedFile)) {
    console.log('\nSeeding critical injuries...')
    const seedSql = fs.readFileSync(seedFile, 'utf-8')
    try {
      await sql.unsafe(seedSql)
      console.log('  ✓ Critical injuries seeded')
    } catch (err: any) {
      if (err.message?.includes('duplicate key')) {
        console.log('  ⊘ Critical injuries already seeded')
      } else {
        console.error(`  ✗ Seed error: ${err.message}`)
      }
    }
  }

  // Verify
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `
  console.log(`\n${tables.length} tables in public schema:`)
  for (const t of tables) {
    console.log(`  • ${t.table_name}`)
  }

  await sql.end()
  console.log('\nDone!')
}

main().catch(async (err) => {
  console.error(err)
  await sql.end()
  process.exit(1)
})
