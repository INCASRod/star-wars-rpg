/**
 * reSpec Snapshot Update Generator
 *
 * Standing tool for all future reSpec dataset drops. Unlike parse-respec.ts /
 * gen-migration-079.ts (one-off, insert-only, fixed output filenames), this
 * script:
 *   - writes to a caller-supplied migration number (never a fixed filename)
 *   - refuses to overwrite an existing migration file
 *   - emits ON CONFLICT ... DO UPDATE so wording/value corrections on
 *     existing rows actually land, not just brand-new keys
 *   - resolves force-ability power_key from the actual parsed Force Powers
 *     XML key set instead of a name-transform + manual map
 *
 * Usage: npx tsx scripts/update-respec-snapshot.ts --migration 100
 */

import * as xml2js from 'xml2js'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '..', 'respec project data')
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations')

// ── CLI ───────────────────────────────────────────────────────────────────────

function parseMigrationArg(): number {
  const idx = process.argv.indexOf('--migration')
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error('Usage: npx tsx scripts/update-respec-snapshot.ts --migration <N>')
    process.exit(1)
  }
  const n = Number(process.argv[idx + 1])
  if (!Number.isInteger(n) || n <= 0) {
    console.error(`--migration must be a positive integer, got "${process.argv[idx + 1]}"`)
    process.exit(1)
  }
  return n
}

// ── SQL escaping ──────────────────────────────────────────────────────────────

function sqlEsc(s: string | null | undefined): string {
  if (s === null || s === undefined) return 'NULL'
  return `'${s.replace(/'/g, "''")}'`
}

function sqlStr(s: string): string {
  return `'${s.replace(/'/g, "''")}'`
}

function pgTextArray(values: string[]): string {
  if (values.length === 0) return 'ARRAY[]::text[]'
  return `ARRAY[${values.map(v => sqlStr(v)).join(', ')}]`
}

// ── xml2js helpers ────────────────────────────────────────────────────────────

async function parseXmlFile(filePath: string): Promise<any> {
  const xml = fs.readFileSync(filePath, 'utf-8')
  return xml2js.parseStringPromise(xml, { explicitArray: true, trim: true })
}

function text(field: string[] | undefined): string {
  if (!field || field.length === 0) return ''
  return field[0] ?? ''
}

function texts(field: string[] | undefined): string[] {
  if (!field || field.length === 0) return []
  return field.filter(Boolean)
}

function isTruthy(field: string[] | undefined): boolean {
  return text(field).toLowerCase() === 'true'
}

// ── Talent parser (copied verbatim from parse-respec.ts — same field mapping) ─

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

// ── Specialization parser (copied verbatim from parse-respec.ts) ──────────────
// NOTE: the versioned-override base-name regex below is carried over unchanged
// from parse-respec.ts. It only strips a trailing "(Tag).xml" pattern — for
// filenames of the form "Name (Tag) X.Y.xml" (a version number after the
// parenthetical, e.g. "Marshal (reSpecialized) 1.3.xml") the regex does not
// match and the override silently fails to apply, falling back to the plain
// file. This is a pre-existing quirk already baked into the current respec
// dataset via migrations 064/068 — reproduced here deliberately so specs that
// already seeded correctly continue to upsert to the same values, not
// different ones. Flagged in the audit report, not fixed here.

interface TalentTreeRow {
  index: number
  cost: number
  talents: string[]
  directions: Array<{ right: boolean; down: boolean; left: boolean; up: boolean }>
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

function parseTalentRows(s: any, sourceFile: string): TalentTreeRow[] {
  const rawRows: any[] = s.TalentRows?.[0]?.TalentRow ?? []
  return rawRows.map((row: any, idx: number) => {
    const cost = parseInt(text(row.Cost), 10)
    if (isNaN(cost)) {
      throw new Error(`NaN cost in file "${sourceFile}", row index ${idx}`)
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
}

async function parseSpecializations(): Promise<{ specs: RespecSpecialization[] }> {
  const specDir = path.join(DATA_DIR, 'Specializations')
  const allFiles = fs.readdirSync(specDir).filter(f => f.endsWith('.xml'))

  const versionedFiles = allFiles.filter(f => f.includes('(') && !f.startsWith('_')).sort()

  const versionedMap = new Map<string, string>()
  for (const f of versionedFiles) {
    const baseName = f.replace(/\s*\([^)]*\)\.xml$/, '').trim()
    versionedMap.set(baseName.toLowerCase(), path.join(specDir, f))
  }

  const plainFiles = allFiles.filter(f => !f.includes('(')).sort()

  const results: RespecSpecialization[] = []

  for (const file of plainFiles) {
    const filePath = path.join(specDir, file)
    const data = await parseXmlFile(filePath)
    const s = data.Specialization

    const key = text(s.Key)
    const name = text(s.Name)
    const description = text(s.Description) || null

    const baseName = file.replace(/\.xml$/, '')
    const versionedPath = versionedMap.get(baseName.toLowerCase())

    let career_skill_keys: string[]
    let rows: TalentTreeRow[]

    if (versionedPath) {
      const vData = await parseXmlFile(versionedPath)
      const vs = vData.Specialization
      const vsCareerSkillsNode = vs.CareerSkills?.[0]
      career_skill_keys = texts(vsCareerSkillsNode?.Key)
      rows = parseTalentRows(vs, path.basename(versionedPath))
    } else {
      const careerSkillsNode = s.CareerSkills?.[0]
      career_skill_keys = texts(careerSkillsNode?.Key)
      rows = parseTalentRows(s, file)
    }

    results.push({ key, name, description, career_skill_keys, talent_tree: { rows } })
  }

  return { specs: results }
}

// ── Career parser (copied verbatim from parse-respec.ts) ──────────────────────

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

// ── Force Power parser (NEW — parse-respec.ts never handled this directory) ───
// Groups files by their internal <Key> (not filename), since filenames are
// inconsistent (e.g. "Commune 1.0.xml" vs "Commune (reSpecialized) 1.0.xml"
// both contain <Key>COMMUNE</Key>). Per key, prefers a file whose name marks
// it as the reSpec revision ("reSpecialized"/"Respec"); ties broken by
// alphabetically-last filename (same tie-break rule parse-respec.ts documents
// for specs — numeric version suffixes like 1.0/1.1/1.31 happen to sort
// correctly as strings too).

interface ForcePowerRow {
  index: number
  costs: number[]
  spans: number[]
  abilities: string[]
  directions: Array<{ up: boolean; down: boolean; left: boolean; right: boolean }>
}

interface ForcePowerFile {
  key: string
  name: string
  description: string | null
  rows: ForcePowerRow[]
  fileName: string
}

async function parseForcePowerFile(filePath: string): Promise<ForcePowerFile> {
  const data = await parseXmlFile(filePath)
  const fp = data.ForcePower
  const key = text(fp.Key)
  const name = text(fp.Name)
  const description = text(fp.Description) || null

  const rawRows: any[] = fp.AbilityRows?.[0]?.AbilityRow ?? []
  const rows: ForcePowerRow[] = rawRows.map((row: any, idx: number) => {
    const abilitiesNode = row.Abilities?.[0]
    const abilities = texts(abilitiesNode?.Key)
    const spansNode = row.AbilitySpan?.[0]
    const costNodes = row.Costs?.[0]
    const spans = texts(spansNode?.Span).map(Number)
    const costs = texts(costNodes?.Cost).map(Number)
    const rawDirs: any[] = row.Directions?.[0]?.Direction ?? []
    const directions = rawDirs.map((d: any) => ({
      up: isTruthy(d.Up),
      down: isTruthy(d.Down),
      left: isTruthy(d.Left),
      right: isTruthy(d.Right),
    }))
    return { index: idx, costs, spans, abilities, directions }
  })

  return { key, name, description, rows, fileName: path.basename(filePath) }
}

function isRespecTagged(fileName: string): boolean {
  return /respecialized|respec/i.test(fileName)
}

interface ParsedForcePower {
  key: string
  name: string
  description: string | null
  rows: ForcePowerRow[]
  canonicalFile: string
  allFiles: ForcePowerFile[] // every file variant that resolved to this key — used for power_key name resolution
}

async function parseForcePowers(): Promise<ParsedForcePower[]> {
  const dir = path.join(DATA_DIR, 'Force Powers')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.xml')).sort()

  const parsed: ForcePowerFile[] = []
  for (const f of files) {
    parsed.push(await parseForcePowerFile(path.join(dir, f)))
  }

  const byKey = new Map<string, ForcePowerFile[]>()
  for (const p of parsed) {
    if (!byKey.has(p.key)) byKey.set(p.key, [])
    byKey.get(p.key)!.push(p)
  }

  const result: ParsedForcePower[] = []
  for (const [key, variants] of byKey) {
    const respecVariants = variants.filter(v => isRespecTagged(v.fileName)).sort((a, b) => a.fileName.localeCompare(b.fileName))
    const canonical = respecVariants.length > 0 ? respecVariants[respecVariants.length - 1] : variants[0]
    result.push({
      key,
      name: canonical.name,
      description: canonical.description,
      rows: canonical.rows,
      canonicalFile: canonical.fileName,
      allFiles: variants,
    })
  }

  return result
}

// ── Force Ability (pip) parser — power_key resolved from real XML keys ────────

interface RespecForceAbility {
  key: string
  name: string
  description: string | null
  power_key: string | null
  rawPowerName: string
}

/** Strip version tags / trailing version numbers / slash-spacing so pip
 * <Power> text and ForcePower <Name> text compare equal regardless of which
 * revision produced them. Deliberately conservative — if this still doesn't
 * match anything, the ability is reported unresolved rather than guessed. */
function normalizePowerName(raw: string): string {
  return raw
    .replace(/\((?:reSpecialized|Respec)\)/gi, '')
    .replace(/[\d]+(\.[\d]+)*\s*$/, '')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/** Powers whose display name is referenced by pip <Power> tags but which have
 * no corresponding file under "Force Powers/" (no XML source to parse tree
 * data from — these rows are not touched by this script at all). Confirmed
 * live against ref_force_powers (key, name) via Supabase MCP on 2026-07-27 —
 * not a guess. Extend only after the same live confirmation. */
const LIVE_CONFIRMED_POWER_FALLBACK: Record<string, string> = {
  "jerserra's influence": 'JERINF',
}

/** Known-bad/abbreviated <Power> text that maps to a real power's normalized
 * name, confirmed by manual review (not auto-fuzzy-matched — every other
 * unresolved case is intentionally left unresolved rather than guessed).
 * Keys are already run through normalizePowerName(); values must be too. */
const POWER_NAME_ALIASES: Record<string, string> = {
  'forsee': 'foresee', // source XML typo for Foresee
  'pr/un': 'protect/unleash', // abbreviated form used on some Protect/Unleash upgrade pips
}

function buildPowerNameIndex(powers: ParsedForcePower[]): Map<string, string> {
  const index = new Map<string, string>()
  for (const p of powers) {
    for (const variant of p.allFiles) {
      const normalized = normalizePowerName(variant.name)
      if (normalized) index.set(normalized, p.key)
    }
  }
  return index
}

async function parseForceAbilities(
  powerNameIndex: Map<string, string>,
): Promise<{ abilities: RespecForceAbility[]; unresolved: Array<{ key: string; rawPowerName: string }> }> {
  const data = await parseXmlFile(path.join(DATA_DIR, 'Force Abilities.xml'))
  const rawAbilities: any[] = data.ForceAbilities?.ForceAbility ?? []

  const abilities: RespecForceAbility[] = []
  const unresolved: Array<{ key: string; rawPowerName: string }> = []

  for (const a of rawAbilities) {
    const key = text(a.Key)
    const name = text(a.Name)
    const description = text(a.Description) || null
    const rawPowerName = text(a.Power) || ''
    const normalized = normalizePowerName(rawPowerName)
    const aliased = normalized ? POWER_NAME_ALIASES[normalized] ?? normalized : normalized
    const power_key = normalized
      ? powerNameIndex.get(aliased) ?? powerNameIndex.get(normalized) ?? LIVE_CONFIRMED_POWER_FALLBACK[normalized] ?? null
      : null

    if (!power_key) {
      unresolved.push({ key, rawPowerName })
      continue // do not emit a row with a fabricated/missing power_key
    }

    abilities.push({ key, name, description, power_key, rawPowerName })
  }

  return { abilities, unresolved }
}

// ── SQL generation ────────────────────────────────────────────────────────────
// Deliberate scope limit: UPDATE SET only touches columns the seed pipeline
// itself is authoritative over (name/description/wording/tree data). It does
// NOT touch is_retired, is_force_sensitive, or career_key — those are set by
// later, more specific migrations (096_force_sensitive_specs_and_retirements,
// manual retirement flags) layered on top of the seed. A blind "update every
// non-key column" would silently revert those flags on every re-run — e.g.
// the 3 respec specializations currently is_retired=true would flip back to
// false. Flagged prominently in the Step 2 report; not a silent deviation.

function buildTalentsSql(talents: RespecTalent[]): string[] {
  const lines: string[] = []
  lines.push('-- ref_talents (respec) — upsert, wording/value corrections land on existing keys')
  for (const t of talents) {
    lines.push(
      `INSERT INTO ref_talents (key, name, description, activation, is_ranked, is_force_talent, dataset_source, is_retired)` +
      ` VALUES (${sqlStr(t.key)}, ${sqlStr(t.name)}, ${sqlEsc(t.description)}, ${sqlEsc(t.activation)}, ${t.is_ranked}, ${t.is_force_talent}, 'respec', false)` +
      ` ON CONFLICT (key, dataset_source) DO UPDATE SET` +
      ` name = EXCLUDED.name, description = EXCLUDED.description, activation = EXCLUDED.activation,` +
      ` is_ranked = EXCLUDED.is_ranked, is_force_talent = EXCLUDED.is_force_talent;`
    )
  }
  return lines
}

function buildForceAbilitiesSql(abilities: RespecForceAbility[]): string[] {
  const lines: string[] = []
  lines.push('-- ref_force_abilities (respec) — upsert, power_key resolved from parsed Force Powers XML keys')
  for (const a of abilities) {
    lines.push(
      `INSERT INTO ref_force_abilities (key, name, description, power_key, dataset_source, is_retired, pip_cost, sources)` +
      ` VALUES (${sqlStr(a.key)}, ${sqlStr(a.name)}, ${sqlEsc(a.description)}, ${sqlEsc(a.power_key)}, 'respec', false, 1, NULL)` +
      ` ON CONFLICT (key, dataset_source) DO UPDATE SET` +
      ` name = EXCLUDED.name, description = EXCLUDED.description, power_key = EXCLUDED.power_key;`
    )
  }
  lines.push('')
  lines.push('-- Recalculate pip_cost for all reSpec force abilities (same formula as migration 060/079)')
  lines.push('UPDATE ref_force_abilities')
  lines.push('SET pip_cost = GREATEST(')
  lines.push('  1,')
  lines.push('  (')
  lines.push(`    CHAR_LENGTH(COALESCE(description, ''))`)
  lines.push(`    - CHAR_LENGTH(REPLACE(COALESCE(description, ''), '[FP]', ''))`)
  lines.push('  ) / 4')
  lines.push(')')
  lines.push(`WHERE dataset_source = 'respec';`)
  return lines
}

function buildSpecializationsSql(specs: RespecSpecialization[]): string[] {
  const lines: string[] = []
  lines.push('-- ref_specializations (respec) — upsert, wording/tree corrections land on existing keys')
  lines.push('-- NOTE: is_retired and career_key are intentionally NOT touched — see header comment.')
  for (const s of specs) {
    const talentTreeJson = sqlStr(JSON.stringify(s.talent_tree))
    lines.push(
      `INSERT INTO ref_specializations (key, name, description, career_key, career_skill_keys, talent_tree, dataset_source, is_retired)` +
      ` VALUES (${sqlStr(s.key)}, ${sqlStr(s.name)}, ${sqlEsc(s.description)}, NULL, ${pgTextArray(s.career_skill_keys)}, ${talentTreeJson}::jsonb, 'respec', false)` +
      ` ON CONFLICT (key, dataset_source) DO UPDATE SET` +
      ` name = EXCLUDED.name, description = EXCLUDED.description, career_skill_keys = EXCLUDED.career_skill_keys, talent_tree = EXCLUDED.talent_tree;`
    )
  }
  return lines
}

function buildCareersSql(careers: RespecCareer[]): string[] {
  const lines: string[] = []
  lines.push('-- ref_careers (respec) — upsert, wording corrections land on existing keys')
  lines.push('-- NOTE: is_retired, force_rating, is_force_career are intentionally NOT touched.')
  for (const c of careers) {
    lines.push(
      `INSERT INTO ref_careers (key, name, description, career_skill_keys, specialization_keys, dataset_source, is_retired)` +
      ` VALUES (${sqlStr(c.key)}, ${sqlStr(c.name)}, ${sqlEsc(c.description)}, ${pgTextArray(c.career_skill_keys)}, ${pgTextArray(c.specialization_keys)}, 'respec', false)` +
      ` ON CONFLICT (key, dataset_source) DO UPDATE SET` +
      ` name = EXCLUDED.name, description = EXCLUDED.description, career_skill_keys = EXCLUDED.career_skill_keys, specialization_keys = EXCLUDED.specialization_keys;`
    )
  }
  return lines
}

function buildForcePowersSql(powers: ParsedForcePower[]): string[] {
  const lines: string[] = []
  lines.push('-- ref_force_powers — upsert keyed on (key) only, table has no dataset_source column')
  lines.push('-- Shared with oggdude-keyed abilities where the power key already existed (e.g. MOVE, ALTER):')
  lines.push('-- updating this row affects both datasets, since there is only one row per power key.')
  for (const p of powers) {
    const tree = `'${JSON.stringify({ rows: p.rows }).replace(/'/g, "''")}'::jsonb`
    lines.push(
      `INSERT INTO ref_force_powers (key, name, description, min_force_rating, sources, ability_tree)` +
      ` VALUES (${sqlStr(p.key)}, ${sqlStr(p.name)}, ${sqlEsc(p.description)}, 1, NULL, ${tree})` +
      ` ON CONFLICT (key) DO UPDATE SET` +
      ` name = EXCLUDED.name, description = EXCLUDED.description, ability_tree = EXCLUDED.ability_tree;`
    )
  }
  return lines
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const migrationNumber = parseMigrationArg()
  const paddedNumber = String(migrationNumber).padStart(3, '0')
  const outPath = path.join(MIGRATIONS_DIR, `${paddedNumber}_respec_snapshot_update.sql`)

  if (fs.existsSync(outPath)) {
    console.error(`Refusing to overwrite existing migration file: ${outPath}`)
    process.exit(1)
  }

  console.log('Parsing reSpec XML snapshot...')

  const talents = await parseTalents()
  console.log(`  Talents.xml -> ${talents.length} talents`)

  const { specs } = await parseSpecializations()
  console.log(`  Specializations/*.xml -> ${specs.length} specializations`)

  const careers = await parseCareers()
  console.log(`  Careers/*.xml -> ${careers.length} careers`)

  const forcePowers = await parseForcePowers()
  console.log(`  Force Powers/*.xml -> ${forcePowers.length} unique force power keys`)

  const powerNameIndex = buildPowerNameIndex(forcePowers)
  const { abilities, unresolved } = await parseForceAbilities(powerNameIndex)
  console.log(`  Force Abilities.xml -> ${abilities.length} resolved, ${unresolved.length} unresolved`)

  const lines: string[] = []
  lines.push(`-- ${paddedNumber}_respec_snapshot_update.sql`)
  lines.push('-- reSpec dataset snapshot refresh — additive + wording/value corrections.')
  lines.push('-- Generated by scripts/update-respec-snapshot.ts — do not edit by hand.')
  lines.push('-- Never touches dataset_source = \'oggdude\' rows. Contains zero DELETE statements.')
  lines.push('')
  lines.push(...buildTalentsSql(talents))
  lines.push('')
  // ref_force_powers must be inserted before ref_force_abilities — the latter
  // has an outward FK (power_key -> ref_force_powers.key), and within a single
  // transaction a brand-new power's pips would violate that FK if inserted first.
  lines.push(...buildForcePowersSql(forcePowers))
  lines.push('')
  lines.push(...buildForceAbilitiesSql(abilities))
  lines.push('')
  lines.push(...buildSpecializationsSql(specs))
  lines.push('')
  lines.push(...buildCareersSql(careers))
  lines.push('')

  fs.writeFileSync(outPath, lines.join('\n'), 'utf-8')

  console.log('\nDone.')
  console.log(`  Written: ${outPath}`)
  console.log('\nSummary:')
  console.log(`  ref_talents:          ${talents.length} rows`)
  console.log(`  ref_force_abilities:  ${abilities.length} rows`)
  console.log(`  ref_specializations:  ${specs.length} rows`)
  console.log(`  ref_careers:          ${careers.length} rows`)
  console.log(`  ref_force_powers:     ${forcePowers.length} rows`)

  if (unresolved.length > 0) {
    console.log(`\nWARNING: ${unresolved.length} force abilities could not be resolved to a power_key and were NOT emitted:`)
    for (const u of unresolved) {
      console.log(`  ${u.key}  (Power: "${u.rawPowerName}")`)
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
