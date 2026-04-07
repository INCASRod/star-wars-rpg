// Seeds ref_motivations and ref_specific_motivations from OggDude XML
// node scripts/seed-motivations.js

const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://peodenvcchftqqtikdhx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlb2RlbnZjY2hmdHFxdGlrZGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTY0MjUsImV4cCI6MjA4ODE3MjQyNX0.IbXBomzcm9XbLZE5dpOVfuQvLzqgM4skOzgn10wa4aM'

const DATA_DIR = path.join(__dirname, '../oggdude/DataCustom')

function getTag(block, tag) {
  const open = `<${tag}>`
  const close = `</${tag}>`
  const start = block.indexOf(open)
  if (start === -1) return ''
  const end = block.indexOf(close, start)
  if (end === -1) return ''
  return block.slice(start + open.length, end).trim()
}

function getAllTags(block, tag) {
  const open = `<${tag}>`
  const close = `</${tag}>`
  const results = []
  let pos = 0
  while (true) {
    const start = block.indexOf(open, pos)
    if (start === -1) break
    const end = block.indexOf(close, start)
    if (end === -1) break
    results.push(block.slice(start + open.length, end).trim())
    pos = end + close.length
  }
  return results
}

function stripBBCode(s) {
  if (!s) return ''
  return s.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim()
}

function parseSource(block) {
  // Try <Source Page="N">Name</Source> first, then <Sources>
  const srcMatch = block.match(/<Source[^>]*>([^<]+)<\/Source>/)
  if (srcMatch) return srcMatch[1].trim()
  const srcMulti = block.match(/<Source[^>]*>([^<]+)<\/Source>/)
  if (srcMulti) return srcMulti[1].trim()
  return null
}

// ── Parse Motivations.xml ────────────────────────────────────────────────────
const motivXml = fs.readFileSync(path.join(DATA_DIR, 'Motivations.xml'), 'utf8')
const motivations = []

let pos = 0
while (true) {
  const start = motivXml.indexOf('<Motivation>', pos)
  if (start === -1) break
  const end = motivXml.indexOf('</Motivation>', start)
  if (end === -1) break
  const block = motivXml.slice(start + 12, end)
  pos = end + 13

  const key = getTag(block, 'Key')
  if (!key) continue

  const name = getTag(block, 'Name')
  const desc = stripBBCode(getTag(block, 'Description'))
  const source = parseSource(block)

  // Gather specific motivation keys from <SpecificMotivations>
  const smSection = block.match(/<SpecificMotivations>([\s\S]*?)<\/SpecificMotivations>/)
  const specificKeys = smSection
    ? getAllTags(smSection[1], 'Key')
    : []

  motivations.push({ key, name, description: desc || null, source, specific_motivation_keys: specificKeys })
}

console.log(`Parsed ${motivations.length} motivations`)

// ── Parse SpecificMotivations.xml ────────────────────────────────────────────
const specXml = fs.readFileSync(path.join(DATA_DIR, 'SpecificMotivations.xml'), 'utf8')
const specificMotivations = []

// Build reverse map: specificKey → motivationKey
const reverseMap = {}
for (const m of motivations) {
  for (const sk of m.specific_motivation_keys) {
    reverseMap[sk] = m.key
  }
}

pos = 0
while (true) {
  const start = specXml.indexOf('<SpecificMotivation>', pos)
  if (start === -1) break
  const end = specXml.indexOf('</SpecificMotivation>', start)
  if (end === -1) break
  const block = specXml.slice(start + 20, end)
  pos = end + 21

  const key = getTag(block, 'Key')
  if (!key) continue

  const name = getTag(block, 'Name')
  const desc = stripBBCode(getTag(block, 'Description'))
  const source = parseSource(block)
  const motivationKey = reverseMap[key] || null

  specificMotivations.push({ key, name, description: desc || null, source, motivation_key: motivationKey })
}

console.log(`Parsed ${specificMotivations.length} specific motivations`)

// ── Upsert helper ────────────────────────────────────────────────────────────
async function upsert(table, rows) {
  const BATCH = 25
  let done = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(batch),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`${table} HTTP ${res.status}: ${text}`)
    }
    done += batch.length
    process.stdout.write(`  ${table}: ${done}/${rows.length}\r`)
  }
  console.log(`  ${table}: ${done}/${rows.length} ✓`)
}

async function main() {
  console.log('Seeding ref_motivations...')
  await upsert('ref_motivations', motivations)

  console.log('Seeding ref_specific_motivations...')
  await upsert('ref_specific_motivations', specificMotivations)

  console.log('Done!')
}

main().catch(e => { console.error(e); process.exit(1) })
