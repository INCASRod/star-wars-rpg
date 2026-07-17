/**
 * Generates a migration seeding ref_sig_abilities + ref_sig_ability_nodes
 * from the reSpec Signature Ability dataset.
 *
 * Source data — "respec project data/" at the repo root, the actual directory
 * scripts/parse-respec.ts and scripts/gen-migration-079.ts read from for every
 * other reSpec seed. (An earlier version of this script pointed at
 * oggdude/DataCustom/ instead, believing "respec project data" no longer
 * existed on disk — it did, just not checked out; it had been swept into a
 * stash's untracked-files snapshot. Restored via
 * `git checkout stash@{0}^3 -- "respec project data"`. The two trees disagree:
 * respec has 40 signature abilities vs oggdude's 37, plus a differently
 * structured SigAbilityNodes.xml — respec is the correct, current source.)
 *   - respec project data/SigAbilities/*.xml   — one file per signature ability,
 *     each with a 3-row AbilityRow tree (row 0 = base node, rows 1-2 = upgrades)
 *   - respec project data/SigAbilityNodes.xml  — flat lookup of node Key -> Name/
 *     Description, shared across all abilities (does NOT carry cost; cost comes
 *     from the per-ability file's own <Costs> array)
 *
 * Row 0 always repeats the same <Key> across all 4 <Abilities> slots (that's
 * how a full-width span is encoded — there's no explicit ColSpan tag) and its
 * <Costs> block is sometimes 4 entries, sometimes a padded 16 — either way the
 * first entry is the real (and only) cost. Rows 1+ always have exactly 4
 * distinct slots (col_span = 1 each), though the same node key can legitimately
 * appear at two non-adjacent columns in one row (two access points into the
 * same upgrade) — each column still gets its own row in ref_sig_ability_nodes.
 * <Direction> children are omitted entirely when false (not e.g. <Up>false</Up>)
 * in this source — the parser's isTruthy() already treats a missing field as
 * false, so this needs no special-casing.
 *
 * Idempotent: the generated migration deletes existing dataset_source='respec'
 * rows before inserting, so re-running scripts/seed-sig-abilities.ts and
 * re-applying its output is always safe.
 *
 * Usage: npx tsx scripts/seed-sig-abilities.ts
 */

import * as xml2js from 'xml2js'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR        = path.join(__dirname, '..', 'respec project data')
const SIG_DIR         = path.join(DATA_DIR, 'SigAbilities')
const NODES_FILE      = path.join(DATA_DIR, 'SigAbilityNodes.xml')
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations')
const MIGRATION_NUMBER = '092'

// ── SQL helpers (matches scripts/gen-migration-079.ts convention) ───────────

function sqlEsc(s: string | null | undefined): string {
  if (s === null || s === undefined) return 'NULL'
  const escaped = s
    .replace(/'/g, "''")
    .replace(/‘/g, "''")
    .replace(/’/g, "''")
  return `'${escaped}'`
}

// ── xml2js helpers ───────────────────────────────────────────────────────────

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

// ── SigAbilityNodes.xml — flat Key -> Name/Description lookup ──────────────

interface NodeMeta { name: string; description: string }

async function parseNodeLookup(): Promise<Map<string, NodeMeta>> {
  const data = await parseXmlFile(NODES_FILE)
  const raw: any[] = data.SigAbilityNodes?.SigAbilityNode ?? []
  const map = new Map<string, NodeMeta>()
  for (const n of raw) {
    const key = text(n.Key)
    map.set(key, { name: text(n.Name), description: text(n.Description) })
  }
  return map
}

// ── SigAbilities/*.xml — tree structure ─────────────────────────────────────

interface ParsedNode {
  rowIndex: number
  colIndex: number
  colSpan: number
  nodeKey: string
  xpCost: number
  connectUp: boolean
  connectDown: boolean
  connectLeft: boolean
  connectRight: boolean
}

interface ParsedAbility {
  key: string
  name: string
  description: string
  careerKey: string
  nodes: ParsedNode[]
}

async function parseSigAbility(filePath: string): Promise<ParsedAbility> {
  const data = await parseXmlFile(filePath)
  const a = data.SigAbility

  const key = text(a.Key)
  const name = text(a.Name)
  const description = text(a.Description)
  const careerKey = text(a.Careers?.[0]?.Key)

  const rawRows: any[] = a.AbilityRows?.[0]?.AbilityRow ?? []
  const nodes: ParsedNode[] = []

  rawRows.forEach((row: any, rowIndex: number) => {
    const abilities = texts(row.Abilities?.[0]?.Key)
    const costs = texts(row.Costs?.[0]?.Cost).map(Number)
    const rawDirs: any[] = row.Directions?.[0]?.Direction ?? []
    const directions = rawDirs.map(d => ({
      up: isTruthy(d.Up), down: isTruthy(d.Down),
      left: isTruthy(d.Left), right: isTruthy(d.Right),
    }))

    if (rowIndex === 0) {
      // Base node: same key repeated across all 4 slots = full-width span.
      // Cost block is sometimes padded to 16 entries — first value is the real cost.
      nodes.push({
        rowIndex, colIndex: 0, colSpan: 4,
        nodeKey: abilities[0], xpCost: costs[0],
        connectUp: false, connectDown: directions[0]?.down ?? false,
        connectLeft: false, connectRight: false,
      })
      return
    }

    // Upgrade row: 4 distinct column slots, col_span 1 each.
    for (let col = 0; col < abilities.length; col++) {
      nodes.push({
        rowIndex, colIndex: col, colSpan: 1,
        nodeKey: abilities[col], xpCost: costs[col],
        connectUp: directions[col]?.up ?? false,
        connectDown: directions[col]?.down ?? false,
        connectLeft: directions[col]?.left ?? false,
        connectRight: directions[col]?.right ?? false,
      })
    }
  })

  return { key, name, description, careerKey, nodes }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Reading SigAbilityNodes.xml...')
  const nodeLookup = await parseNodeLookup()
  console.log(`  -> ${nodeLookup.size} node definitions`)

  console.log('Reading SigAbilities/*.xml...')
  const files = fs.readdirSync(SIG_DIR).filter(f => f.endsWith('.xml')).sort()
  const abilities: ParsedAbility[] = []
  for (const file of files) {
    abilities.push(await parseSigAbility(path.join(SIG_DIR, file)))
  }
  const totalNodes = abilities.reduce((sum, a) => sum + a.nodes.length, 0)
  console.log(`  -> ${abilities.length} signature abilities, ${totalNodes} tree nodes`)

  const missing: string[] = []
  for (const a of abilities) {
    for (const n of a.nodes) {
      if (!nodeLookup.has(n.nodeKey)) missing.push(`${a.key}/${n.nodeKey}`)
    }
  }
  if (missing.length > 0) {
    console.error(`Fatal: ${missing.length} node keys have no SigAbilityNodes.xml entry:`, missing.slice(0, 10))
    process.exit(1)
  }

  const lines: string[] = []
  lines.push(`-- ${MIGRATION_NUMBER}_seed_respec_sig_abilities.sql`)
  lines.push('-- Seed reSpec dataset: signature abilities and their tree nodes.')
  lines.push('-- Generated by scripts/seed-sig-abilities.ts -- do not edit by hand.')
  lines.push('--')
  lines.push('-- Supersedes 089_seed_respec_sig_abilities.sql, which read from the wrong')
  lines.push('-- source (oggdude/DataCustom/) — this reseeds from the real')
  lines.push('-- "respec project data/" tree (40 abilities vs the old 37; adds Peerless')
  lines.push('-- Interception, Shadow Lord, Unmatched Ambition).')
  lines.push('')
  lines.push("-- Idempotent: clear this dataset's rows before reinserting.")
  lines.push("DELETE FROM ref_sig_ability_nodes WHERE dataset_source = 'respec';")
  lines.push("DELETE FROM ref_sig_abilities WHERE dataset_source = 'respec';")
  lines.push('')

  lines.push('-- ── ref_sig_abilities (respec) ──────────────────────────────────────────')
  for (const a of abilities) {
    lines.push(
      `INSERT INTO ref_sig_abilities (key, name, description, career_key, dataset_source, is_retired)` +
      ` VALUES (${sqlEsc(a.key)}, ${sqlEsc(a.name)}, ${sqlEsc(a.description)}, ${sqlEsc(a.careerKey)}, 'respec', false)` +
      ` ON CONFLICT (key, dataset_source) DO NOTHING;`
    )
  }
  lines.push('')

  lines.push('-- ── ref_sig_ability_nodes (respec) ──────────────────────────────────────')
  for (const a of abilities) {
    for (const n of a.nodes) {
      const meta = nodeLookup.get(n.nodeKey)!
      lines.push(
        `INSERT INTO ref_sig_ability_nodes` +
        ` (sig_ability_key, dataset_source, row_index, col_index, col_span, node_key, name, description, xp_cost, connect_up, connect_down, connect_left, connect_right)` +
        ` VALUES (${sqlEsc(a.key)}, 'respec', ${n.rowIndex}, ${n.colIndex}, ${n.colSpan}, ${sqlEsc(n.nodeKey)}, ${sqlEsc(meta.name)}, ${sqlEsc(meta.description)}, ${n.xpCost}, ${n.connectUp}, ${n.connectDown}, ${n.connectLeft}, ${n.connectRight});`
      )
    }
  }
  lines.push('')

  const outPath = path.join(MIGRATIONS_DIR, `${MIGRATION_NUMBER}_seed_respec_sig_abilities.sql`)
  fs.writeFileSync(outPath, lines.join('\n'), 'utf-8')
  console.log(`Written: ${outPath}`)
  console.log(`  ${abilities.length} ref_sig_abilities rows, ${totalNodes} ref_sig_ability_nodes rows`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
