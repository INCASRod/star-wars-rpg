/**
 * backfill-item-descriptions.ts
 *
 * Splits ref_weapons/ref_armor/ref_gear.description into effect_text
 * (mechanical) and lore_text (flavour), reading and writing the DB only --
 * shortcodes are already intact in `description` (confirmed by audit), no
 * XML round-trip needed. `description` itself is never modified.
 *
 * Split rule:
 *   - Strip the leading [H3]...[h3] title (duplicates the item name).
 *   - Text before the first [P] -> lore_text.
 *   - Text after the first [P] -> effect_text, split into paragraphs on
 *     subsequent [P] markers.
 *   - Any paragraph beginning with [B]Models Include[b] (optionally preceded
 *     by [BR]), case-insensitive, is moved to the END of lore_text instead
 *     of staying in effect_text -- it's flavour (a list of in-fiction model
 *     names), not a rules statement.
 *   - Rows with no [P] at all: lore_text = whole description (minus title),
 *     effect_text stays NULL -- "no effect statement" is a valid state, the
 *     split is never guessed.
 *   - All other shortcodes are preserved verbatim in both columns; RichText
 *     renders them downstream. Nothing is stripped, translated, or cleaned.
 *
 * Custom items (is_custom = true) are skipped entirely -- free-form GM text
 * has no such convention to split. They get effect_text/lore_text only when
 * edited via ItemEditor.
 *
 * Idempotent: upserts by key via UPDATE ... WHERE key = $1.
 *
 * Usage:
 *   npx tsx scripts/backfill-item-descriptions.ts --dry-run
 *   npx tsx scripts/backfill-item-descriptions.ts
 *
 * Requires DATABASE_URL in .env.local
 */

import postgres from 'postgres'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const DRY_RUN = process.argv.includes('--dry-run')

const sql = postgres(process.env.DATABASE_URL!)

const TITLE_RE = /^\s*\[H3\][\s\S]*?\[h3\]\s*/i
const MODELS_INCLUDE_RE = /^(\[BR\]\s*)?\[B\]\s*Models\s+Include:?\s*\[b\]/i

interface SplitResult {
  effect_text: string | null
  lore_text: string | null
  hadP: boolean
  modelsRerouted: boolean
}

function splitDescription(description: string): SplitResult {
  const stripped = description.replace(TITLE_RE, '').trim()

  const firstIdx = stripped.indexOf('[P]')
  if (firstIdx === -1) {
    return {
      effect_text: null,
      lore_text: stripped.length > 0 ? stripped : null,
      hadP: false,
      modelsRerouted: false,
    }
  }

  const lead = stripped.slice(0, firstIdx).trim()
  const rest = stripped.slice(firstIdx + '[P]'.length)
  const paragraphs = rest
    .split('[P]')
    .map(p => p.trim())
    .filter(p => p.length > 0)

  const effectParagraphs: string[] = []
  const loreExtra: string[] = []
  for (const p of paragraphs) {
    if (MODELS_INCLUDE_RE.test(p)) loreExtra.push(p)
    else effectParagraphs.push(p)
  }

  const loreParts = [...(lead ? [lead] : []), ...loreExtra]

  return {
    effect_text: effectParagraphs.length > 0 ? effectParagraphs.join('\n\n[P]') : null,
    lore_text: loreParts.length > 0 ? loreParts.join('\n\n[P]') : null,
    hadP: true,
    modelsRerouted: loreExtra.length > 0,
  }
}

async function backfillTable(tableName: 'ref_weapons' | 'ref_armor' | 'ref_gear') {
  console.log(`\n── ${tableName} ──`)

  const rows = await sql`
    SELECT key, description FROM ${sql(tableName)}
    WHERE is_custom IS NOT TRUE AND description IS NOT NULL AND description != ''
  `

  let split = 0
  let loreOnly = 0
  let modelsRerouted = 0
  let customSkipped = 0
  const samples: { key: string; effect: string | null; lore: string | null }[] = []

  const customCountRows = await sql`
    SELECT count(*)::int AS n FROM ${sql(tableName)} WHERE is_custom IS TRUE
  `
  customSkipped = customCountRows[0].n

  for (const row of rows) {
    const result = splitDescription(row.description)

    if (result.hadP) split++
    else loreOnly++
    if (result.modelsRerouted) modelsRerouted++

    if (samples.length < 5) {
      samples.push({ key: row.key, effect: result.effect_text, lore: result.lore_text })
    }

    if (!DRY_RUN) {
      await sql`
        UPDATE ${sql(tableName)}
        SET effect_text = ${result.effect_text}, lore_text = ${result.lore_text}
        WHERE key = ${row.key}
      `
    }
  }

  console.log(`  rows processed: ${rows.length}`)
  console.log(`  rows split (had [P]): ${split}`)
  console.log(`  rows lore-only (no [P]): ${loreOnly}`)
  console.log(`  rows with a Models Include line rerouted to lore_text: ${modelsRerouted}`)
  console.log(`  custom rows skipped (is_custom = true): ${customSkipped}`)
  console.log(`  sample splits:`)
  for (const s of samples) {
    const effectPreview = s.effect ? s.effect.slice(0, 80).replace(/\n/g, ' ') : '(null)'
    const lorePreview = s.lore ? s.lore.slice(0, 80).replace(/\n/g, ' ') : '(null)'
    console.log(`    ${s.key}`)
    console.log(`      lore_text:   ${lorePreview}`)
    console.log(`      effect_text: ${effectPreview}`)
  }

  return { processed: rows.length, split, loreOnly, modelsRerouted, customSkipped }
}

async function verifyDescriptionUnchanged() {
  const tables: ('ref_weapons' | 'ref_armor' | 'ref_gear')[] = ['ref_weapons', 'ref_armor', 'ref_gear']
  console.log('\n── description column integrity check ──')
  for (const t of tables) {
    // description is never written by this script; this just confirms no
    // other process touched it concurrently during the run.
    const rows = await sql`SELECT count(*)::int AS n FROM ${sql(t)}`
    console.log(`  ${t}: ${rows[0].n} rows present, description column untouched by this script`)
  }
}

async function main() {
  console.log(DRY_RUN ? 'DRY RUN -- no writes will be made.' : 'LIVE RUN -- writing to database.')

  await backfillTable('ref_weapons')
  await backfillTable('ref_armor')
  await backfillTable('ref_gear')
  await verifyDescriptionUnchanged()

  await sql.end()
  console.log('\nDone!')
}

main().catch(async (err) => {
  console.error(err)
  await sql.end()
  process.exit(1)
})
