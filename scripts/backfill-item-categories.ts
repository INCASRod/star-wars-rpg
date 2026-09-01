/**
 * backfill-item-categories.ts
 *
 * Populates ref_armor.categories and ref_gear.categories from the canonical
 * reSpec XML source ("respec project data/"), matching rows by key.
 *
 * Source shape differs per table (confirmed by inspection, not assumed):
 *   - Armor.xml   : <Categories><Category>...</Category></Categories> (array,
 *                   same shape as Weapons.xml)
 *   - Gear.xml    : category data lives in a single <Type> string element;
 *                   <Categories> is populated on only 1/584 entries and is
 *                   not used here. The single Type value is written as a
 *                   one-element array to match ref_weapons.categories' TEXT[]
 *                   shape.
 *
 * Idempotent: uses UPDATE ... WHERE key = $1 (upsert-equivalent for existing
 * rows -- ref_armor/ref_gear rows are seeded elsewhere; this script only
 * updates the categories column on rows that already exist).
 *
 * Usage:
 *   npx tsx scripts/backfill-item-categories.ts --dry-run
 *   npx tsx scripts/backfill-item-categories.ts
 *
 * Requires DATABASE_URL in .env.local
 */

import postgres from 'postgres'
import * as xml2js from 'xml2js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const DATA_DIR = path.join(__dirname, '..', 'respec project data')
const DRY_RUN = process.argv.includes('--dry-run')

const sql = postgres(process.env.DATABASE_URL!)

async function parseXmlFile(filePath: string): Promise<any> {
  const xml = fs.readFileSync(filePath, 'utf-8')
  return xml2js.parseStringPromise(xml, { explicitArray: true, trim: true })
}

function text(field: string[] | undefined): string {
  if (!field || field.length === 0) return ''
  return field[0] ?? ''
}

interface SourceEntry {
  key: string
  categories: string[]
}

// DB key -> canonical respec XML key, for armor rows whose DB key doesn't
// match the source XML's <Key> even though it's the same item (found via
// name cross-check after a --dry-run reported these as "no matching DB
// row" / "no source category data" on both sides). Same shape as the
// alias-mapping precedent in migrations 108-110 for specializations.
const ARMOR_KEY_ALIASES: Record<string, string> = {
  SITHPAIN:      'SITHPAINHARNESS',
  TIMBERCUIR:    'TIMBERCUIRASS',
  ANCBATARM:     'ANCIENTBATTLEARMOR',
  KATARNCOMM:    'KATARNCLASSARMOR',
  MK1KATARN:     'KATARNCLASSARMOR',
  ARC:           'PHASEIARCTROOPERARMOR',
  PHASEIARC:     'PHASEIARCTROOPERARMOR',
  MKINIGHTSTALK: 'NIGHSTALKERINFSUIT',
  CLIMBSUIT:     'AYELIXEKRONGBINGCLIMBSUIT',
  MKIXMIM:       'MKIXCONCEALMENTSUIT',
}

async function parseArmorCategories(): Promise<SourceEntry[]> {
  const data = await parseXmlFile(path.join(DATA_DIR, 'Armor.xml'))
  const rawArmors: any[] = data.Armors?.Armor ?? []
  return rawArmors.map((a: any) => {
    const key = text(a.Key)
    const cats: string[] = a.Categories?.[0]?.Category ?? []
    return { key, categories: cats.filter(Boolean) }
  })
}

async function parseGearCategories(): Promise<SourceEntry[]> {
  const data = await parseXmlFile(path.join(DATA_DIR, 'Gear.xml'))
  const rawGear: any[] = data.Gears?.Gear ?? []
  return rawGear.map((g: any) => {
    const key = text(g.Key)
    const type = text(g.Type)
    return { key, categories: type ? [type] : [] }
  })
}

function sameArray(a: string[] | null, b: string[]): boolean {
  const aa = a ?? []
  if (aa.length !== b.length) return false
  return aa.every((v, i) => v === b[i])
}

async function backfillTable(
  tableName: 'ref_armor' | 'ref_gear',
  sourceEntries: SourceEntry[],
  keyAliases: Record<string, string> = {},
) {
  console.log(`\n── ${tableName} ──`)

  const dbRows = await sql`
    SELECT key, categories FROM ${sql(tableName)}
  `
  const dbByKey = new Map<string, string[] | null>(dbRows.map(r => [r.key, r.categories]))
  const sourceByKey = new Map(sourceEntries.map(e => [e.key, e.categories]))

  let matched = 0
  let updated = 0
  let aliasMatched = 0
  const noSourceData: string[] = []
  const noDbRow: string[] = []

  for (const [dbKey] of dbByKey) {
    const sourceKey = sourceByKey.has(dbKey) ? dbKey : keyAliases[dbKey]
    const categories = sourceKey ? sourceByKey.get(sourceKey) : undefined
    if (!categories || categories.length === 0) continue // nothing to backfill for this row

    matched++
    if (sourceKey !== dbKey) aliasMatched++
    const current = dbByKey.get(dbKey) ?? null
    if (sameArray(current, categories)) continue

    updated++
    if (!DRY_RUN) {
      await sql`
        UPDATE ${sql(tableName)} SET categories = ${categories} WHERE key = ${dbKey}
      `
    }
  }

  for (const [key] of sourceByKey) {
    if (!dbByKey.has(key) && !Object.values(keyAliases).includes(key)) noDbRow.push(key)
  }
  for (const [key] of dbByKey) {
    const sourceKey = sourceByKey.has(key) ? key : keyAliases[key]
    const src = sourceKey ? sourceByKey.get(sourceKey) : undefined
    if (!src || src.length === 0) noSourceData.push(key)
  }

  console.log(`  rows matched (source has categories, DB row exists): ${matched} (${aliasMatched} via key alias)`)
  console.log(`  rows ${DRY_RUN ? 'that would be' : ''} updated: ${updated}`)
  console.log(`  DB rows with no source category data: ${noSourceData.length}`)
  console.log(`  source entries with no matching DB row: ${noDbRow.length}`)
  if (noDbRow.length > 0) {
    console.log(`    ${noDbRow.slice(0, 20).join(', ')}${noDbRow.length > 20 ? ', ...' : ''}`)
  }
}

async function main() {
  console.log(DRY_RUN ? 'DRY RUN -- no writes will be made.' : 'LIVE RUN -- writing to database.')

  const armorEntries = await parseArmorCategories()
  const gearEntries = await parseGearCategories()

  await backfillTable('ref_armor', armorEntries, ARMOR_KEY_ALIASES)
  await backfillTable('ref_gear', gearEntries)

  await sql.end()
  console.log('\nDone!')
}

main().catch(async (err) => {
  console.error(err)
  await sql.end()
  process.exit(1)
})
