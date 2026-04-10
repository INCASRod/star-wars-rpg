// Seeds ref_item_attachments via Supabase REST API in batches
// Usage: SUPABASE_URL=... SUPABASE_KEY=... node scripts/seed-attachments.js
// Or just outputs the SQL batches to stdout for manual application

const fs = require('fs')
const path = require('path')

const raw = fs.readFileSync(path.join(__dirname, 'attachment_seed_rows.txt'), 'utf8').trim()

// Split on ),\n  (' pattern to get individual row strings
const parts = raw.split(/\),\r?\n  \('/).map((r, i, arr) => {
  if (i === 0) return r + ')'
  if (i === arr.length - 1) return "  ('" + r
  return "  ('" + r + ')'
})

const BATCH = 25
const batches = []
for (let i = 0; i < parts.length; i += BATCH) {
  batches.push(parts.slice(i, i + BATCH))
}

process.stderr.write(`${parts.length} rows, ${batches.length} batches of ${BATCH}\n`)

// Output as numbered SQL batch files
batches.forEach((batch, idx) => {
  const sql = `INSERT INTO ref_item_attachments
  (key, name, description, type, hp_required, price, rarity, category_limits, base_mods, added_mods, source)
VALUES
${batch.join(',\n')}
ON CONFLICT (key) DO UPDATE SET
  name             = EXCLUDED.name,
  description      = EXCLUDED.description,
  type             = EXCLUDED.type,
  hp_required      = EXCLUDED.hp_required,
  price            = EXCLUDED.price,
  rarity           = EXCLUDED.rarity,
  category_limits  = EXCLUDED.category_limits,
  base_mods        = EXCLUDED.base_mods,
  added_mods       = EXCLUDED.added_mods,
  source           = EXCLUDED.source;`
  fs.writeFileSync(path.join(__dirname, `attachment_batch_${String(idx).padStart(2, '0')}.sql`), sql)
})

process.stderr.write('Batch SQL files written.\n')
