// Updates ref_careers with source + is_force_career from OggDude Careers/ folder
// node scripts/seed-careers-source.js

const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://peodenvcchftqqtikdhx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlb2RlbnZjY2hmdHFxdGlrZGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTY0MjUsImV4cCI6MjA4ODE3MjQyNX0.IbXBomzcm9XbLZE5dpOVfuQvLzqgM4skOzgn10wa4aM'

const CAREERS_DIR = path.join(__dirname, '../oggdude/DataCustom/Careers')
const SPECS_DIR = path.join(__dirname, '../oggdude/DataCustom/Specializations')

// Force career keys (have Force Rating 1+ by default)
const FORCE_CAREER_KEYS = new Set(['CONSULAR', 'GUARD', 'MYSTIC', 'SEEKER', 'SENTINEL', 'WAR', 'JEDI'])

function getTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
  return m ? m[1].trim() : ''
}

function getAttrTag(block, tag, attr) {
  const m = block.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*>`))
  return m ? m[1].trim() : ''
}

function parseSource(block) {
  // <Source Page="88">Age of Rebellion Core Rulebook</Source>
  const m = block.match(/<Source[^>]*>([^<]+)<\/Source>/)
  return m ? m[1].trim() : null
}

// ── Parse all career XMLs ────────────────────────────────────────────────────
const files = fs.readdirSync(CAREERS_DIR).filter(f => f.endsWith('.xml'))
const updates = []

for (const file of files) {
  const xml = fs.readFileSync(path.join(CAREERS_DIR, file), 'utf8')
  const key = getTag(xml, 'Key')
  if (!key) continue
  const source = parseSource(xml)
  const isForce = FORCE_CAREER_KEYS.has(key)
  updates.push({ key, source, is_force_career: isForce })
}

console.log(`Parsed ${updates.length} career files`)

// ── Parse all spec XMLs for source ──────────────────────────────────────────
const specFiles = fs.readdirSync(SPECS_DIR).filter(f => f.endsWith('.xml'))
const specUpdates = []

for (const file of specFiles) {
  const xml = fs.readFileSync(path.join(SPECS_DIR, file), 'utf8')
  const key = getTag(xml, 'Key')
  if (!key) continue
  const source = parseSource(xml)
  if (source) specUpdates.push({ key, source })
}

console.log(`Parsed ${specUpdates.length} specialization files with source`)

// ── Patch via REST ────────────────────────────────────────────────────────────
async function patchRow(table, key, patch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?key=eq.${encodeURIComponent(key)}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const text = await res.text()
    console.warn(`  WARN ${table} ${key}: HTTP ${res.status} ${text}`)
  }
}

async function main() {
  console.log('Updating ref_careers source + is_force_career...')
  for (let i = 0; i < updates.length; i++) {
    const { key, ...patch } = updates[i]
    await patchRow('ref_careers', key, patch)
    process.stdout.write(`  ${i + 1}/${updates.length}\r`)
  }
  console.log(`  ref_careers: ${updates.length} updated ✓`)

  console.log('Updating ref_specializations source...')
  for (let i = 0; i < specUpdates.length; i++) {
    const { key, ...patch } = specUpdates[i]
    await patchRow('ref_specializations', key, patch)
    process.stdout.write(`  ${i + 1}/${specUpdates.length}\r`)
  }
  console.log(`  ref_specializations: ${specUpdates.length} updated ✓`)

  console.log('Done!')
}

main().catch(e => { console.error(e); process.exit(1) })
