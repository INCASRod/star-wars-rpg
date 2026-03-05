/**
 * Seed Supabase ref tables from parsed OggDude JSON via direct PostgreSQL.
 *
 * Usage:
 *   1. First run: npx tsx scripts/parse-oggdude.ts
 *   2. Then run:  npx tsx scripts/seed-supabase.ts
 */

import postgres from 'postgres'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const sql = postgres({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.peodenvcchftqqtikdhx',
  password: process.env.DB_PASSWORD!,
})

const PARSED_DIR = path.join(__dirname, '..', 'oggdude', 'parsed')

function loadJSON(filename: string): Record<string, unknown>[] {
  return JSON.parse(fs.readFileSync(path.join(PARSED_DIR, filename), 'utf-8'))
}

async function seedTable(tableName: string, jsonFile: string, primaryKey = 'key') {
  const data = loadJSON(jsonFile)
  console.log(`Seeding ${tableName}: ${data.length} rows...`)

  // Build column list from first row
  const columns = Object.keys(data[0])

  // Insert in batches of 50
  const batchSize = 50
  let inserted = 0
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const values = batch.map(row =>
      `(${columns.map(col => {
        const val = row[col]
        if (val === null || val === undefined) return 'NULL'
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'
        if (typeof val === 'number') return String(val)
        if (Array.isArray(val)) {
          if (val.length === 0) return `'{}'`
          // Check if it's a JSONB array (objects inside) or TEXT[]
          if (typeof val[0] === 'object') {
            return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`
          }
          return `ARRAY[${val.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',')}]::text[]`
        }
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`
        return `'${String(val).replace(/'/g, "''")}'`
      }).join(', ')})`
    ).join(',\n')

    try {
      await sql.unsafe(`
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES ${values}
        ON CONFLICT (${primaryKey}) DO NOTHING
      `)
      inserted += batch.length
    } catch (err: any) {
      console.error(`  Error batch ${i}: ${err.message}`)
    }
  }
  console.log(`  ✓ ${inserted} rows`)
}

async function main() {
  console.log('Seeding Supabase reference tables via direct SQL...\n')

  await seedTable('ref_skills', 'ref_skills.json')
  await seedTable('ref_species', 'ref_species.json')
  await seedTable('ref_careers', 'ref_careers.json')
  await seedTable('ref_talents', 'ref_talents.json')
  await seedTable('ref_specializations', 'ref_specializations.json')
  await seedTable('ref_weapons', 'ref_weapons.json')
  await seedTable('ref_armor', 'ref_armor.json')
  await seedTable('ref_gear', 'ref_gear.json')
  await seedTable('ref_moralities', 'ref_moralities.json')
  await seedTable('ref_obligations', 'ref_obligations.json')
  await seedTable('ref_duties', 'ref_duties.json')
  await seedTable('ref_item_descriptors', 'ref_item_descriptors.json')

  // Verify counts
  console.log('\nVerifying...')
  const counts = await sql`
    SELECT 'ref_skills' as t, count(*) as c FROM ref_skills UNION ALL
    SELECT 'ref_species', count(*) FROM ref_species UNION ALL
    SELECT 'ref_careers', count(*) FROM ref_careers UNION ALL
    SELECT 'ref_talents', count(*) FROM ref_talents UNION ALL
    SELECT 'ref_specializations', count(*) FROM ref_specializations UNION ALL
    SELECT 'ref_weapons', count(*) FROM ref_weapons UNION ALL
    SELECT 'ref_armor', count(*) FROM ref_armor UNION ALL
    SELECT 'ref_gear', count(*) FROM ref_gear UNION ALL
    SELECT 'ref_moralities', count(*) FROM ref_moralities UNION ALL
    SELECT 'ref_obligations', count(*) FROM ref_obligations UNION ALL
    SELECT 'ref_duties', count(*) FROM ref_duties UNION ALL
    SELECT 'ref_item_descriptors', count(*) FROM ref_item_descriptors UNION ALL
    SELECT 'ref_critical_injuries', count(*) FROM ref_critical_injuries
    ORDER BY t
  `
  for (const row of counts) {
    console.log(`  ${row.t}: ${row.c}`)
  }

  await sql.end()
  console.log('\nDone!')
}

main().catch(async (err) => {
  console.error(err)
  await sql.end()
  process.exit(1)
})
