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
 * Uses the same Supabase client path the app itself uses — @supabase/supabase-js
 * with the anon key (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 * from .env.local) — so the import exercises the same RLS path the browser
 * will, rather than a privileged DATABASE_URL/service-role connection.
 *
 * The `body` field on documents is a derived plain-text duplicate of `blocks`
 * and is stripped before storage ONLY when `blocks` is a non-empty array. For a
 * document with no blocks, `body` is the sole copy of the content (the console
 * converts it to blocks on first open), so it is preserved in `data`.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
if (!url || !anonKey) fail('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY required in .env.local')

const supabase = createClient(url, anonKey)

async function apply() {
  console.log('\nApplying...')

  const { error: campaignErr } = await supabase
    .from('console_campaign_state')
    .upsert({ campaign_id: CAMPAIGN_ID, data: parsed.campaign }, { onConflict: 'campaign_id' })
  if (campaignErr) fail(`console_campaign_state write failed: ${campaignErr.message}`)

  if (docPlans.length > 0) {
    const rows = docPlans.map((d) => ({
      campaign_id: CAMPAIGN_ID,
      id: d.id,
      title: d.title,
      folder: d.folder,
      blocks: d.blocks,
      data: d.data,
    }))
    const { error } = await supabase.from('console_documents').upsert(rows, { onConflict: 'campaign_id,id' })
    if (error) fail(`console_documents write failed: ${error.message}`)
  }

  if (recordPlans.length > 0) {
    const rows = recordPlans.map((r) => ({
      campaign_id: CAMPAIGN_ID,
      kind: r.kind,
      id: r.id,
      data: r.data,
    }))
    const { error } = await supabase.from('console_records').upsert(rows, { onConflict: 'campaign_id,kind,id' })
    if (error) fail(`console_records write failed: ${error.message}`)
  }

  console.log('Writes complete. Round-trip verifying...\n')
  await verify()
}

async function verify() {
  let anyFail = false
  const results: { collection: string; expected: number; actual: number; pass: boolean; note: string }[] = []

  const { data: campaignRow, error: campaignReadErr } = await supabase
    .from('console_campaign_state')
    .select('data')
    .eq('campaign_id', CAMPAIGN_ID)
    .maybeSingle()
  const campaignPass = !campaignReadErr && !!campaignRow &&
    deepEqualCanonical(campaignRow.data, parsed.campaign)
  results.push({
    collection: 'campaign',
    expected: 1,
    actual: campaignRow ? 1 : 0,
    pass: campaignPass,
    note: campaignReadErr ? campaignReadErr.message : campaignPass ? 'content matches' : 'content mismatch (see diff below)',
  })
  if (!campaignPass && campaignRow) {
    console.error('\ncampaign content mismatch — canonical diff:')
    console.error(diffCanonical(parsed.campaign, campaignRow.data))
  }
  if (!campaignPass) anyFail = true

  const { data: docRows, error: docReadErr } = await supabase
    .from('console_documents')
    .select('id, blocks')
    .eq('campaign_id', CAMPAIGN_ID)
  if (docReadErr) {
    results.push({ collection: 'docs', expected: docPlans.length, actual: 0, pass: false, note: docReadErr.message })
    anyFail = true
  } else {
    const byId = new Map((docRows ?? []).map((r: any) => [r.id, r]))
    let docsOk = (docRows?.length ?? 0) === docPlans.length
    let blockMismatch = ''
    for (const plan of docPlans) {
      const row = byId.get(plan.id)
      if (!row) {
        docsOk = false
        blockMismatch = `doc "${plan.id}" missing on read-back`
        break
      }
      const gotIds = (row.blocks ?? []).map((b: any) => b?.id)
      const wantIds = plan.blocks.map((b: any) => b?.id)
      if (row.blocks.length !== plan.blocks.length || JSON.stringify(gotIds) !== JSON.stringify(wantIds)) {
        docsOk = false
        blockMismatch = `doc "${plan.id}" block count/id sequence mismatch (want ${wantIds.length}, got ${row.blocks.length})`
        break
      }
    }
    results.push({
      collection: 'docs',
      expected: docPlans.length,
      actual: docRows?.length ?? 0,
      pass: docsOk,
      note: docsOk ? 'counts + block id sequences match' : blockMismatch,
    })
    if (!docsOk) anyFail = true
  }

  for (const kind of RECORD_KINDS) {
    const expected = recordPlans.filter((r) => r.kind === kind).length
    const { count, error } = await supabase
      .from('console_records')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', CAMPAIGN_ID)
      .eq('kind', kind)
    const pass = !error && count === expected
    results.push({
      collection: kind,
      expected,
      actual: count ?? 0,
      pass,
      note: error ? error.message : pass ? 'count matches' : 'count mismatch',
    })
    if (!pass) anyFail = true
  }

  console.table(results)

  if (anyFail) {
    console.error('\nROUND-TRIP VERIFY FAILED.')
    process.exit(1)
  } else {
    console.log('\nRound-trip verify passed for all collections.')
    process.exit(0)
  }
}

apply()
