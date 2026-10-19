/**
 * console-import.ts
 *
 * One-shot importer for an external campaign Console JSON export
 * ("*.lor.json") into the console_campaign_state / console_documents /
 * console_records tables added by migration 137.
 *
 * DRY RUN BY DEFAULT. Without --apply this only reads, validates, and prints
 * what it would write — it never touches the database.
 *
 * Usage:
 *   npx tsx scripts/console-import.ts --file path/to/export.lor.json --campaign <uuid>
 *   npx tsx scripts/console-import.ts --file path/to/export.lor.json --campaign <uuid> --apply
 *
 * Writes through DATABASE_URL (.env.local), in ONE transaction: since Auth B4 these
 * three tables are GM-only under RLS, so the old anon-key path is refused. A failed
 * write rolls everything back. Nothing secret is printed.
 *
 * The `body` field on documents is a derived plain-text duplicate of `blocks`
 * and is stripped before storage ONLY when `blocks` is a non-empty array. For a
 * document with no blocks, `body` is the sole copy of the content (the console
 * converts it to blocks on first open), so it is preserved in `data`.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const RECORD_KINDS = ['arcs', 'threads', 'sessions', 'codex', 'planets', 'links', 'tags'] as const
type RecordKind = (typeof RECORD_KINDS)[number]

const COLLECTIONS = ['docs', ...RECORD_KINDS] as const

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1) return undefined
  return process.argv[i + 1]
}

const FILE = arg('file')
const CAMPAIGN_ID = arg('campaign')
const APPLY = process.argv.includes('--apply')

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function fail(msg: string): never {
  console.error(`ERROR: ${msg}`)
  process.exit(1)
}

// ── Deep, key-order-insensitive comparison ───────────────────────────────────
// Object keys are sorted recursively at every level before comparing. Array
// ORDER is never touched — block order and block-id sequence are meaningful
// data, only object key order is an artefact of JSON serialisation.
export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    return Object.keys(obj)
      .sort()
      .reduce((acc: Record<string, unknown>, k) => {
        acc[k] = canonicalize(obj[k])
        return acc
      }, {})
  }
  return value
}

export function deepEqualCanonical(a: unknown, b: unknown): boolean {
  return JSON.stringify(canonicalize(a)) === JSON.stringify(canonicalize(b))
}

export function diffCanonical(a: unknown, b: unknown): string {
  return [
    'expected (canonical):',
    JSON.stringify(canonicalize(a), null, 2),
    'actual (canonical):',
    JSON.stringify(canonicalize(b), null, 2),
  ].join('\n')
}

if (!FILE) fail('--file <path to .lor.json> is required')
if (!CAMPAIGN_ID) fail('--campaign <uuid> is required')
if (!UUID_RE.test(CAMPAIGN_ID!)) fail(`--campaign value "${CAMPAIGN_ID}" is not a uuid`)
if (!fs.existsSync(FILE!)) fail(`file not found: ${FILE}`)

interface RawDoc {
  id: string
  title?: string
  folder?: string
  blocks?: unknown[]
  body?: string
  v?: unknown
  updated?: unknown
  [k: string]: unknown
}

interface RawExport {
  campaign: Record<string, unknown>
  docs: RawDoc[]
  arcs: { id: string; [k: string]: unknown }[]
  threads: { id: string; [k: string]: unknown }[]
  sessions: { id: string; [k: string]: unknown }[]
  codex: { id: string; [k: string]: unknown }[]
  planets: { id: string; [k: string]: unknown }[]
  links: { id: string; [k: string]: unknown }[]
  tags: { id: string; [k: string]: unknown }[]
}

// ── Load + validate ──────────────────────────────────────────────────────────

const raw = fs.readFileSync(FILE!, 'utf-8')
let parsed: RawExport
try {
  parsed = JSON.parse(raw)
} catch (e) {
  fail(`file is not valid JSON: ${(e as Error).message}`)
}

const REQUIRED_COLLECTIONS = ['campaign', ...COLLECTIONS]
const missing = REQUIRED_COLLECTIONS.filter((c) => !(c in parsed))
if (missing.length > 0) {
  fail(`missing collection(s) in export: ${missing.join(', ')}`)
}

if (typeof parsed.campaign !== 'object' || parsed.campaign === null || Array.isArray(parsed.campaign)) {
  fail('`campaign` must be a single object')
}

const validationErrors: string[] = []

for (const coll of COLLECTIONS) {
  const arr = (parsed as any)[coll]
  if (!Array.isArray(arr)) {
    validationErrors.push(`\`${coll}\` must be an array`)
    continue
  }
  const seenIds = new Set<string>()
  arr.forEach((rec: any, idx: number) => {
    if (!rec || typeof rec !== 'object') {
      validationErrors.push(`${coll}[${idx}] is not an object`)
      return
    }
    if (typeof rec.id !== 'string' || rec.id.length === 0) {
      validationErrors.push(`${coll}[${idx}] is missing a string \`id\``)
      return
    }
    if (seenIds.has(rec.id)) {
      validationErrors.push(`${coll} has a duplicate id: "${rec.id}"`)
    }
    seenIds.add(rec.id)
  })
}

if (validationErrors.length > 0) {
  console.error('VALIDATION FAILED:')
  for (const e of validationErrors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log('Validation passed: all 9 collections present, every record has a unique id within its collection.\n')

// ── Build write plan ─────────────────────────────────────────────────────────

interface DocPlan {
  id: string
  title: string | null
  folder: string | null
  blocks: unknown[]
  data: Record<string, unknown>
  droppedBody: boolean
}

const docPlans: DocPlan[] = parsed.docs.map((d) => {
  const { id, title, folder, blocks, body, ...rest } = d
  // Conditional strip — see file header. Do NOT "tidy" into an unconditional
  // strip: for blockless docs (e.g. d-story) `body` is the only copy.
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0
  const data = hasBlocks || body === undefined ? rest : { ...rest, body }
  return {
    id,
    title: title ?? null,
    folder: folder ?? null,
    blocks: Array.isArray(blocks) ? blocks : [],
    data,
    droppedBody: hasBlocks && body !== undefined,
  }
})

interface RecordPlan {
  kind: RecordKind
  id: string
  data: Record<string, unknown>
}

const recordPlans: RecordPlan[] = []
for (const kind of RECORD_KINDS) {
  for (const rec of (parsed as any)[kind] as { id: string; [k: string]: unknown }[]) {
    recordPlans.push({ kind, id: rec.id, data: rec })
  }
}

// ── Report plan ──────────────────────────────────────────────────────────────

console.log('Write plan:')
console.table([
  { collection: 'campaign', target: 'console_campaign_state', rows: 1 },
  { collection: 'docs', target: 'console_documents', rows: docPlans.length },
  ...RECORD_KINDS.map((k) => ({
    collection: k,
    target: 'console_records',
    rows: recordPlans.filter((r) => r.kind === k).length,
  })),
])

const bodyDropCount = docPlans.filter((d) => d.droppedBody).length
if (bodyDropCount > 0) {
  console.log(`\nStripping \`body\` from ${bodyDropCount}/${docPlans.length} document(s) (derived duplicate of \`blocks\`).`)
}

if (!APPLY) {
  console.log('\nDry run only — no database writes performed. Pass --apply to write.')
  process.exit(0)
}

// ── Apply ─────────────────────────────────────────────────────────────────────

if (!process.env.DATABASE_URL) fail('DATABASE_URL required in .env.local')
const sql = postgres(process.env.DATABASE_URL, { max: 1 })
const CAMPAIGN = CAMPAIGN_ID as string // validated at the top of the file

async function apply() {
  console.log('\nApplying (one transaction)...')

  try {
    await sql.begin(async (txn) => {
      const tx = txn as unknown as postgres.Sql // postgres' TransactionSql loses its call signature under Omit<>
      await tx`
        insert into console_campaign_state (campaign_id, data)
        values (${CAMPAIGN}, ${tx.json(parsed.campaign as unknown as postgres.JSONValue)})
        on conflict (campaign_id) do update set data = excluded.data`

      for (const d of docPlans) {
        await tx`
          insert into console_documents (campaign_id, id, title, folder, blocks, data)
          values (${CAMPAIGN}, ${d.id}, ${d.title}, ${d.folder}, ${tx.json(d.blocks as unknown as postgres.JSONValue)}, ${tx.json(d.data as unknown as postgres.JSONValue)})
          on conflict (campaign_id, id) do update
            set title = excluded.title, folder = excluded.folder, blocks = excluded.blocks, data = excluded.data`
      }

      for (const r of recordPlans) {
        await tx`
          insert into console_records (campaign_id, kind, id, data)
          values (${CAMPAIGN}, ${r.kind}, ${r.id}, ${tx.json(r.data as unknown as postgres.JSONValue)})
          on conflict (campaign_id, kind, id) do update set data = excluded.data`
      }
    })
  } catch (e) {
    await sql.end()
    fail(`import failed, nothing written: ${(e as Error).message}`)
  }

  console.log('Writes complete. Round-trip verifying...\n')
  await verify()
}

async function verify() {
  let anyFail = false
  const results: { collection: string; expected: number; actual: number; pass: boolean; note: string }[] = []

  const [campaignRow] = await sql<{ data: unknown }[]>`select data from console_campaign_state where campaign_id = ${CAMPAIGN}`
  const campaignPass = !!campaignRow && deepEqualCanonical(campaignRow.data, parsed.campaign)
  results.push({
    collection: 'campaign',
    expected: 1,
    actual: campaignRow ? 1 : 0,
    pass: campaignPass,
    note: campaignPass ? 'content matches' : 'content mismatch (see diff below)',
  })
  if (!campaignPass && campaignRow) {
    console.error('\ncampaign content mismatch — canonical diff:')
    console.error(diffCanonical(parsed.campaign, campaignRow.data))
  }
  if (!campaignPass) anyFail = true

  const docRows = await sql<{ id: string; blocks: any[] | null }[]>`select id, blocks from console_documents where campaign_id = ${CAMPAIGN}`
  {
    const byId = new Map(docRows.map((r) => [r.id, r]))
    let docsOk = docRows.length === docPlans.length
    let blockMismatch = ''
    for (const plan of docPlans) {
      const row = byId.get(plan.id)
      if (!row) {
        docsOk = false
        blockMismatch = `doc "${plan.id}" missing on read-back`
        break
      }
      const blocks = row.blocks ?? []
      const gotIds = blocks.map((b: any) => b?.id)
      const wantIds = plan.blocks.map((b: any) => b?.id)
      if (blocks.length !== plan.blocks.length || JSON.stringify(gotIds) !== JSON.stringify(wantIds)) {
        docsOk = false
        blockMismatch = `doc "${plan.id}" block count/id sequence mismatch (want ${wantIds.length}, got ${blocks.length})`
        break
      }
    }
    results.push({
      collection: 'docs',
      expected: docPlans.length,
      actual: docRows.length,
      pass: docsOk,
      note: docsOk ? 'counts + block id sequences match' : blockMismatch,
    })
    if (!docsOk) anyFail = true
  }

  for (const kind of RECORD_KINDS) {
    const expected = recordPlans.filter((r) => r.kind === kind).length
    const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from console_records where campaign_id = ${CAMPAIGN} and kind = ${kind}`
    const pass = count === expected
    results.push({ collection: kind, expected, actual: count, pass, note: pass ? 'count matches' : 'count mismatch' })
    if (!pass) anyFail = true
  }

  console.table(results)
  await sql.end()

  if (anyFail) {
    console.error('\nROUND-TRIP VERIFY FAILED.')
    process.exit(1)
  } else {
    console.log('\nRound-trip verify passed for all collections.')
    process.exit(0)
  }
}

apply()
