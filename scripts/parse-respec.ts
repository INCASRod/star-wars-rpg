/**
 * reSpec XML → SQL Migration Generator
 *
 * Reads reSpec dataset XML files and generates two SQL migration files:
 *   - supabase/migrations/063_seed_respec_talents_force_abilities.sql
 *   - supabase/migrations/064_seed_respec_specs_careers.sql
 *
 * Usage: npx tsx scripts/parse-respec.ts
 */

import * as xml2js from 'xml2js'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '..', 'respec project data')
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations')

// ── SQL escaping ──────────────────────────────────────────────────────────────

/** Escape a string value for use in SQL single-quoted literals. */
function sqlEsc(s: string | null | undefined): string {
  if (s === null || s === undefined) return 'NULL'
  return `'${s.replace(/'/g, "''")}'`
}

/** Escape a string as a SQL string literal (with single quotes). */
function sqlStr(s: string): string {
  return `'${s.replace(/'/g, "''")}'`
}

// ── xml2js helpers ────────────────────────────────────────────────────────────

async function parseXmlFile(filePath: string): Promise<any> {
  const xml = fs.readFileSync(filePath, 'utf-8')
  return xml2js.parseStringPromise(xml, { explicitArray: true, trim: true })
}

/** Extract the first string value from a possibly-array xml2js field. */
function text(field: string[] | undefined): string {
  if (!field || field.length === 0) return ''
  return field[0] ?? ''
}

/** Extract all string values from a possibly-array xml2js field. */
function texts(field: string[] | undefined): string[] {
  if (!field || field.length === 0) return []
  return field.filter(Boolean)
}

/** Test if a field value is truthy ("true"). */
function isTruthy(field: string[] | undefined): boolean {
  return text(field).toLowerCase() === 'true'
}

// ── Talent parser ─────────────────────────────────────────────────────────────

interface RespecTalent {
  key: string
  name: string
  description: string | null
  activation: string | null
  is_ranked: boolean
  is_force_talent: boolean
}

async function parseTalents(): Promise<RespecTalent[]> {
  const data = await parseXmlFile(path.join(DATA_DIR, 'Talents.xml'))
  const rawTalents: any[] = data.Talents?.Talent ?? []
  return rawTalents.map((t: any) => ({
    key: text(t.Key),
    name: text(t.Name),
    description: text(t.Description) || null,
    activation: text(t.ActivationValue) || null,
    is_ranked: isTruthy(t.Ranked),
    is_force_talent: isTruthy(t.ForceTalent),
  }))
}

// ── Force Ability parser ──────────────────────────────────────────────────────

interface RespecForceAbility {
  key: string
  name: string
  description: string | null
  power_key: string | null
}

/** Maps XML <Power> display names to the short-code keys used in ref_force_powers. */
const POWER_KEY_MAP: Record<string, string> = {
  'Battle Meditation': 'BATMED',
  'Ebb/Flow':          'EBBFLOW',
  'Heal/Harm':         'HEALHARM',
  "Jerserra's Influence": 'JERINF',
  'Protect/Unleash':   'PROTUNL',
  "Warde's Foresight": 'WARFOR',
}

async function parseForceAbilities(): Promise<RespecForceAbility[]> {
  const data = await parseXmlFile(path.join(DATA_DIR, 'Force Abilities.xml'))
  const rawAbilities: any[] = data.ForceAbilities?.ForceAbility ?? []
  return rawAbilities.map((a: any) => {
    const powerName = text(a.Power) || null
    const power_key = powerName ? (POWER_KEY_MAP[powerName] ?? powerName.toUpperCase()) : null
    return {
      key: text(a.Key),
      name: text(a.Name),
      description: text(a.Description) || null,
      power_key,
    }
  })
}

// ── Specialization parser ─────────────────────────────────────────────────────

interface TalentTreeRow {
  index: number
  cost: number
  talents: string[]
  directions: Array<{
    right: boolean
    down: boolean
    left: boolean
    up: boolean
  }>
}

interface TalentTree {
  rows: TalentTreeRow[]
}

interface RespecSpecialization {
  key: string
  name: string
  description: string | null
  career_skill_keys: string[]
  talent_tree: TalentTree
}

async function parseSpecializations(): Promise<RespecSpecialization[]> {
  const specDir = path.join(DATA_DIR, 'Specializations')
  const files = fs.readdirSync(specDir)
    .filter(f => f.endsWith('.xml') && !f.includes('('))
    .sort()

  const results: RespecSpecialization[] = []
  for (const file of files) {
    const filePath = path.join(specDir, file)
    const data = await parseXmlFile(filePath)
    const s = data.Specialization

    const key = text(s.Key)
    const name = text(s.Name)
    const description = text(s.Description) || null

    // Career skills — CareerSkills contains multiple <Key> children
    const careerSkillsNode = s.CareerSkills?.[0]
    const career_skill_keys = texts(careerSkillsNode?.Key)

    // Parse talent rows
    const rawRows: any[] = s.TalentRows?.[0]?.TalentRow ?? []
    const rows: TalentTreeRow[] = rawRows.map((row: any, idx: number) => {
      const cost = parseInt(text(row.Cost), 10)
      if (isNaN(cost)) {
        throw new Error(`NaN cost in file "${file}", row index ${idx}`)
      }
      const talentsNode = row.Talents?.[0]
      const talents = texts(talentsNode?.Key)

      const rawDirections: any[] = row.Directions?.[0]?.Direction ?? []
      const directions = rawDirections.map((dir: any) => ({
        right: isTruthy(dir.Right),
        down: isTruthy(dir.Down),
        left: isTruthy(dir.Left),
        up: isTruthy(dir.Up),
      }))

      return { index: idx, cost, talents, directions }
    })

    results.push({ key, name, description, career_skill_keys, talent_tree: { rows } })
  }

  return results
}

// ── Career parser ─────────────────────────────────────────────────────────────

interface RespecCareer {
  key: string
  name: string
  description: string | null
  career_skill_keys: string[]
  specialization_keys: string[]
}

async function parseCareers(): Promise<RespecCareer[]> {
  const careerDir = path.join(DATA_DIR, 'Careers')
  const files = fs.readdirSync(careerDir).filter(f => f.endsWith('.xml')).sort()

  const results: RespecCareer[] = []
  for (const file of files) {
    const filePath = path.join(careerDir, file)
    const data = await parseXmlFile(filePath)
    const c = data.Career

    const key = text(c.Key)
    const name = text(c.Name)
    const description = text(c.Description) || null

    const careerSkillsNode = c.CareerSkills?.[0]
    const career_skill_keys = texts(careerSkillsNode?.Key)

    const specializationsNode = c.Specializations?.[0]
    const specialization_keys = texts(specializationsNode?.Key)

    results.push({ key, name, description, career_skill_keys, specialization_keys })
  }

  return results
}

// ── SQL array helpers ─────────────────────────────────────────────────────────

/** Emit a PostgreSQL text[] array literal: ARRAY['val1', 'val2'] */
function pgTextArray(values: string[]): string {
  if (values.length === 0) return "ARRAY[]::text[]"
  return `ARRAY[${values.map(v => sqlStr(v)).join(', ')}]`
}

// ── SQL generation ────────────────────────────────────────────────────────────

const RETIRED_TALENT_KEYS = [
  'ALTDEAL', 'BYBOOK', 'COMARMS', 'DISCLORE', 'DISCSOUL', 'DISSTRIKE',
  'EXTREACH', 'FEARREP', 'IMPCOMARMS', 'IMPPRIDEJOY', 'IMPSECRETJEDI',
  'INSPLEAD', 'KNOWENEMY', 'KNOWROPES', 'MOSTIMP', 'PERSTARGINT',
  'PREPBOARD', 'PRIDEJOY', 'SECRETJEDI', 'SEENTHINGS', 'SUPPRIDEJOY',
  'TARGFIRE', 'TEMPTRAIN', 'TRUSTCAP', 'TRUSTNO',
]

function buildMigration063(
  talents: RespecTalent[],
  forceAbilities: RespecForceAbility[],
): string {
  const lines: string[] = []

  lines.push('-- 063_seed_respec_talents_force_abilities.sql')
  lines.push('-- Seed reSpec dataset: talents and force abilities.')
  lines.push('-- Generated by scripts/parse-respec.ts — do not edit by hand.')
  lines.push('')

  // ── ref_talents ──
  lines.push('-- ── ref_talents (respec) ─────────────────────────────────────────────────')
  for (const t of talents) {
    const key = sqlStr(t.key)
    const name = sqlStr(t.name)
    const desc = sqlEsc(t.description)
    const activation = sqlEsc(t.activation)
    const isRanked = t.is_ranked ? 'true' : 'false'
    const isForceTalent = t.is_force_talent ? 'true' : 'false'
    lines.push(
      `INSERT INTO ref_talents (key, name, description, activation, is_ranked, is_force_talent, dataset_source, is_retired)` +
      ` VALUES (${key}, ${name}, ${desc}, ${activation}, ${isRanked}, ${isForceTalent}, 'respec', false)` +
      ` ON CONFLICT (key, dataset_source) DO NOTHING;`
    )
  }
  lines.push('')

  // ── ref_force_abilities ──
  lines.push('-- ── ref_force_abilities (respec) ────────────────────────────────────────')
  for (const a of forceAbilities) {
    const key = sqlStr(a.key)
    const name = sqlStr(a.name)
    const desc = sqlEsc(a.description)
    const powerKey = sqlEsc(a.power_key)
    lines.push(
      `INSERT INTO ref_force_abilities (key, name, description, power_key, dataset_source, is_retired, pip_cost, sources)` +
      ` VALUES (${key}, ${name}, ${desc}, ${powerKey}, 'respec', false, 1, NULL)` +
      ` ON CONFLICT (key, dataset_source) DO NOTHING;`
    )
  }
  lines.push('')

  // ── Recalculate pip_cost for respec force abilities ──
  lines.push('-- ── Recalculate pip_cost for reSpec force abilities ─────────────────────')
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

  // ── Mark OggDude retired talents ──
  lines.push('-- ── Mark OggDude-only talents as retired ────────────────────────────────')
  const retiredList = RETIRED_TALENT_KEYS.map(k => sqlStr(k)).join(', ')
  lines.push(`UPDATE ref_talents`)
  lines.push(`SET is_retired = true`)
  lines.push(`WHERE dataset_source = 'oggdude'`)
  lines.push(`  AND key IN (${retiredList});`)
  lines.push('')

  return lines.join('\n')
}

function buildMigration064(
  specs: RespecSpecialization[],
  careers: RespecCareer[],
): string {
  const lines: string[] = []

  lines.push('-- 064_seed_respec_specs_careers.sql')
  lines.push('-- Seed reSpec dataset: specializations and careers.')
  lines.push('-- Generated by scripts/parse-respec.ts — do not edit by hand.')
  lines.push('')

  // ── ref_specializations ──
  lines.push('-- ── ref_specializations (respec) ───────────────────────────────────────')
  for (const s of specs) {
    const key = sqlStr(s.key)
    const name = sqlStr(s.name)
    const desc = sqlEsc(s.description)
    const careerSkillsArr = pgTextArray(s.career_skill_keys)
    const talentTreeJson = sqlStr(JSON.stringify(s.talent_tree))
    lines.push(
      `INSERT INTO ref_specializations (key, name, description, career_key, career_skill_keys, talent_tree, dataset_source, is_retired)` +
      ` VALUES (${key}, ${name}, ${desc}, NULL, ${careerSkillsArr}, ${talentTreeJson}::jsonb, 'respec', false)` +
      ` ON CONFLICT (key, dataset_source) DO NOTHING;`
    )
  }
  lines.push('')

  // ── ref_careers ──
  lines.push('-- ── ref_careers (respec) ───────────────────────────────────────────────')
  for (const c of careers) {
    const key = sqlStr(c.key)
    const name = sqlStr(c.name)
    const desc = sqlEsc(c.description)
    const careerSkillsArr = pgTextArray(c.career_skill_keys)
    const specializationKeysArr = pgTextArray(c.specialization_keys)
    lines.push(
      `INSERT INTO ref_careers (key, name, description, career_skill_keys, specialization_keys, dataset_source, is_retired)` +
      ` VALUES (${key}, ${name}, ${desc}, ${careerSkillsArr}, ${specializationKeysArr}, 'respec', false)` +
      ` ON CONFLICT (key, dataset_source) DO NOTHING;`
    )
  }
  lines.push('')

  // ── Mark OggDude PILOT and DRIVER as retired ──
  lines.push('-- ── Mark OggDude PILOT and DRIVER specializations as retired ───────────')
  lines.push(`UPDATE ref_specializations`)
  lines.push(`SET is_retired = true`)
  lines.push(`WHERE dataset_source = 'oggdude'`)
  lines.push(`  AND key IN ('PILOT', 'DRIVER');`)
  lines.push('')

  return lines.join('\n')
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Parsing reSpec XML data...')

  console.log('  Reading Talents.xml...')
  const talents = await parseTalents()
  console.log(`  → ${talents.length} talents`)

  console.log('  Reading Force Abilities.xml...')
  const forceAbilities = await parseForceAbilities()
  console.log(`  → ${forceAbilities.length} force abilities`)

  console.log('  Reading Specializations/*.xml (excluding version-suffix files)...')
  const specs = await parseSpecializations()
  console.log(`  → ${specs.length} specializations`)

  console.log('  Reading Careers/*.xml...')
  const careers = await parseCareers()
  console.log(`  → ${careers.length} careers`)

  console.log('\nGenerating SQL migrations...')

  const migration063 = buildMigration063(talents, forceAbilities)
  const out063 = path.join(MIGRATIONS_DIR, '063_seed_respec_talents_force_abilities.sql')
  fs.writeFileSync(out063, migration063, 'utf-8')
  console.log(`  → Written: ${out063}`)

  const migration064 = buildMigration064(specs, careers)
  const out064 = path.join(MIGRATIONS_DIR, '064_seed_respec_specs_careers.sql')
  fs.writeFileSync(out064, migration064, 'utf-8')
  console.log(`  → Written: ${out064}`)

  console.log('\nDone.')
  console.log(`  Migration 063: ${talents.length} talent INSERTs + ${forceAbilities.length} force ability INSERTs`)
  console.log(`  Migration 064: ${specs.length} spec INSERTs + ${careers.length} career INSERTs`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
