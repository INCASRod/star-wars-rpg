/**
 * Generates migration 079: new reSpec force powers and their pips.
 * Inserts INSIGHTRESPEC and IMBUERE into ref_force_powers, then their 27 pips into ref_force_abilities.
 * Usage: npx tsx scripts/gen-migration-079.ts
 */

import * as xml2js from 'xml2js'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR       = path.join(__dirname, '..', 'respec project data')
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations')

// ---- SQL helpers ------------------------------------------------------------

function sqlEsc(s: string | null | undefined): string {
  if (s === null || s === undefined) return 'NULL'
  // Escape ASCII apostrophe (U+0027) and typographic quotes (U+2018 left, U+2019 right).
  // Supabase MCP normalises curly quotes to U+0027 before sending to PG.
  const escaped = s
    .replace(/'/g, "''")
    .replace(/‘/g, "''")
    .replace(/’/g, "''")
  return `'${escaped}'`
}

function sqlJsonb(obj: unknown): string {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`
}

// ---- xml2js helpers --------------------------------------------------------

async function parseXmlFile(filePath: string): Promise<any> {
  const xml = fs.readFileSync(filePath, 'utf-8')
  return xml2js.parseStringPromise(xml, { explicitArray: true, trim: true })
}

function text(field: string[] | undefined): string {
  if (!field || field.length === 0) return ''
  return field[0] ?? ''
}

function isTruthy(field: string[] | undefined): boolean {
  return text(field).toLowerCase() === 'true'
}

function texts(field: string[] | undefined): string[] {
  if (!field || field.length === 0) return []
  return field.filter(Boolean)
}

// ---- Force Power parser ----------------------------------------------------

interface ForcePowerRow {
  index:      number
  costs:      number[]
  spans:      number[]
  abilities:  string[]
  directions: Array<{ up: boolean; down: boolean; left: boolean; right: boolean }>
}

interface ForcePowerData {
  key:         string
  name:        string
  description: string | null
  rows:        ForcePowerRow[]
}

async function parseForcePower(filePath: string): Promise<ForcePowerData> {
  const data    = await parseXmlFile(filePath)
  const fp      = data.ForcePower
  const key     = text(fp.Key)
  const name    = text(fp.Name)
  const description = text(fp.Description) || null

  const rawRows: any[] = fp.AbilityRows?.[0]?.AbilityRow ?? []
  const rows: ForcePowerRow[] = rawRows.map((row: any, idx: number) => {
    const abilitiesNode = row.Abilities?.[0]
    const abilities     = texts(abilitiesNode?.Key)

    const spansNode  = row.AbilitySpan?.[0]
    const costNodes  = row.Costs?.[0]
    const spans      = (texts(spansNode?.Span)).map(Number)
    const costs      = (texts(costNodes?.Cost)).map(Number)

    const rawDirs: any[] = row.Directions?.[0]?.Direction ?? []
    const directions = rawDirs.map((d: any) => ({
      up:    isTruthy(d.Up),
      down:  isTruthy(d.Down),
      left:  isTruthy(d.Left),
      right: isTruthy(d.Right),
    }))

    return { index: idx, costs, spans, abilities, directions }
  })

  return { key, name, description, rows }
}

// ---- Force Ability (pip) parser --------------------------------------------

interface PipData {
  key:         string
  name:        string
  description: string | null
  powerName:   string | null
  power_key:   string
}

// <Power> display names in Force Abilities.xml -> canonical DB power key
const POWER_KEY_MAP: Record<string, string> = {
  'Insight (Respec)': 'INSIGHTRESPEC',
  'Imbue (Respec)':   'IMBUERE',
}

// min_force_rating for each new power
const MIN_FR: Record<string, number> = {
  'INSIGHTRESPEC': 1,
  'IMBUERE':       2,
}

// Canonical sources for reSpec custom powers
const SOURCES_JSON = [{ book: 'reSpecialized' }]

async function parsePips(): Promise<PipData[]> {
  const data          = await parseXmlFile(path.join(DATA_DIR, 'Force Abilities.xml'))
  const rawAbilities: any[] = data.ForceAbilities?.ForceAbility ?? []
  return rawAbilities
    .map((a: any) => ({
      key:         text(a.Key),
      name:        text(a.Name),
      description: text(a.Description) || null,
      powerName:   text(a.Power) || null,
    }))
    .filter(a => a.powerName && (a.powerName in POWER_KEY_MAP))
    .map(a => ({ ...a, power_key: POWER_KEY_MAP[a.powerName!] }))
}

// ---- Main ------------------------------------------------------------------

async function main() {
  // Parse both new force power XML files
  const insight = await parseForcePower(
    path.join(DATA_DIR, 'Force Powers', 'Insight (reSpecialized) 1.0.xml')
  )
  const imbue   = await parseForcePower(
    path.join(DATA_DIR, 'Force Powers', 'Imbue_Exhaust (reSpecialized) 1.0.xml')
  )
  const pips    = await parsePips()

  console.log(`Force powers: ${insight.key}, ${imbue.key}`)
  console.log(`Pips: ${pips.length} (${pips.filter(p => p.power_key === 'INSIGHTRESPEC').length} insight, ${pips.filter(p => p.power_key === 'IMBUERE').length} imbue)`)

  const lines: string[] = []
  lines.push('-- 079_seed_respec_insight_imbue_force_abilities.sql')
  lines.push('-- Adds reSpec Insight (INSIGHTRESPEC) and Imbue/Exhaust (IMBUERE) to ref_force_powers')
  lines.push('-- and their 27 ability pips to ref_force_abilities.')
  lines.push('-- Generated by scripts/gen-migration-079.ts -- do not edit by hand.')
  lines.push('')

  // ---- ref_force_powers ---------------------------------------------------
  lines.push('-- ref_force_powers: new reSpec force powers')
  for (const fp of [insight, imbue]) {
    const key        = sqlEsc(fp.key)
    const name       = sqlEsc(fp.name)
    const desc       = sqlEsc(fp.description)
    const minFr      = MIN_FR[fp.key] ?? 1
    const sources    = sqlJsonb(SOURCES_JSON)
    const tree       = sqlJsonb({ rows: fp.rows })
    lines.push(
      `INSERT INTO ref_force_powers (key, name, description, min_force_rating, sources, ability_tree)` +
      ` VALUES (${key}, ${name}, ${desc}, ${minFr}, ${sources}, ${tree})` +
      ` ON CONFLICT (key) DO NOTHING;`
    )
  }
  lines.push('')

  // ---- ref_force_abilities ------------------------------------------------
  lines.push('-- ref_force_abilities: pips for both new powers')
  for (const p of pips) {
    const key      = sqlEsc(p.key)
    const name     = sqlEsc(p.name)
    const desc     = sqlEsc(p.description)
    const powerKey = sqlEsc(p.power_key)
    lines.push(
      `INSERT INTO ref_force_abilities (key, name, description, power_key, dataset_source, is_retired, pip_cost, sources)` +
      ` VALUES (${key}, ${name}, ${desc}, ${powerKey}, 'respec', false, 1, NULL)` +
      ` ON CONFLICT (key, dataset_source) DO NOTHING;`
    )
  }
  lines.push('')

  // ---- pip_cost recalc ---------------------------------------------------
  lines.push('-- Recalculate pip_cost for all reSpec force abilities')
  lines.push(`UPDATE ref_force_abilities`)
  lines.push(`SET pip_cost = GREATEST(`)
  lines.push(`  1,`)
  lines.push(`  (`)
  lines.push(`    CHAR_LENGTH(COALESCE(description, ''))`)
  lines.push(`    - CHAR_LENGTH(REPLACE(COALESCE(description, ''), '[FP]', ''))`)
  lines.push(`  ) / 4`)
  lines.push(`)`)
  lines.push(`WHERE dataset_source = 'respec';`)
  lines.push('')

  const out = path.join(MIGRATIONS_DIR, '079_seed_respec_insight_imbue_force_abilities.sql')
  fs.writeFileSync(out, lines.join('\n'), 'utf-8')
  console.log(`Written: ${out}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
