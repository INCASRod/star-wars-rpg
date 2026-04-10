// Seeds ref_item_attachments via Supabase JS client
// node scripts/seed-attachments-api.js

const fs = require('fs')
const path = require('path')

// Inline Supabase client via fetch
const SUPABASE_URL = 'https://peodenvcchftqqtikdhx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlb2RlbnZjY2hmdHFxdGlrZGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTY0MjUsImV4cCI6MjA4ODE3MjQyNX0.IbXBomzcm9XbLZE5dpOVfuQvLzqgM4skOzgn10wa4aM'

// Re-parse the XML directly
const xml = fs.readFileSync(path.join(__dirname, '../oggdude/DataCustom/ItemAttachments.xml'), 'utf8')

function getTag(block, tag) {
  const open = `<${tag}>`
  const close = `</${tag}>`
  const start = block.indexOf(open)
  if (start === -1) return ''
  const end = block.indexOf(close, start)
  if (end === -1) return ''
  return block.slice(start + open.length, end).trim()
}

function getMods(block, tag) {
  const open = `<${tag}>`
  const close = `</${tag}>`
  const start = block.indexOf(open)
  if (start === -1) return null
  const end = block.indexOf(close, start)
  if (end === -1) return null
  const section = block.slice(start + open.length, end)
  const mods = []
  let pos = 0
  while (true) {
    const ms = section.indexOf('<Mod>', pos)
    if (ms === -1) break
    const me = section.indexOf('</Mod>', ms)
    if (me === -1) break
    const modBlock = section.slice(ms + 5, me)
    const key = getTag(modBlock, 'Key')
    const count = getTag(modBlock, 'Count')
    const miscDesc = getTag(modBlock, 'MiscDesc')
    if (key || miscDesc) {
      mods.push({ key: key || null, count: count ? parseInt(count, 10) : null, misc_desc: miscDesc || null })
    }
    pos = me + 6
  }
  return mods.length > 0 ? mods : null
}

function getCategoryLimits(block) {
  const open = '<CategoryLimit>'
  const close = '</CategoryLimit>'
  const start = block.indexOf(open)
  if (start === -1) return null
  const end = block.indexOf(close, start)
  if (end === -1) return null
  const section = block.slice(start + open.length, end)
  const cats = []
  let pos = 0
  while (true) {
    const cs = section.indexOf('<Category>', pos)
    if (cs === -1) break
    const ce = section.indexOf('</Category>', cs)
    if (ce === -1) break
    cats.push(section.slice(cs + 10, ce).trim())
    pos = ce + 11
  }
  return cats.length > 0 ? cats : null
}

function stripBBCode(s) {
  if (!s) return ''
  return s.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim()
}

const attachments = []
let pos = 0
while (true) {
  const start = xml.indexOf('<ItemAttachment>', pos)
  if (start === -1) break
  const end = xml.indexOf('</ItemAttachment>', start)
  if (end === -1) break
  const block = xml.slice(start + 16, end)
  pos = end + 17

  if (!block.includes('<Type>Weapon</Type>') && !block.includes('<Type>Armor</Type>')) continue

  const type = getTag(block, 'Type')
  const key = getTag(block, 'Key')
  if (!key) continue

  attachments.push({
    key,
    name: getTag(block, 'Name'),
    description: stripBBCode(getTag(block, 'Description')),
    type,
    hp_required: parseInt(getTag(block, 'HP'), 10) || 0,
    price: getTag(block, 'Price') ? parseInt(getTag(block, 'Price'), 10) : null,
    rarity: getTag(block, 'Rarity') ? parseInt(getTag(block, 'Rarity'), 10) : null,
    source: getTag(block, 'Source') || null,
    category_limits: getCategoryLimits(block),
    base_mods: getMods(block, 'BaseMods'),
    added_mods: getMods(block, 'AddedMods'),
  })
}

console.log(`Parsed ${attachments.length} entries`)

// Insert in batches of 20 via REST
async function insertBatch(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ref_item_attachments`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res
}

async function main() {
  const BATCH = 20
  let inserted = 0
  for (let i = 0; i < attachments.length; i += BATCH) {
    const batch = attachments.slice(i, i + BATCH)
    await insertBatch(batch)
    inserted += batch.length
    process.stdout.write(`Inserted ${inserted}/${attachments.length}\r`)
  }
  console.log(`\nDone! Seeded ${inserted} attachments.`)
}

main().catch(e => { console.error(e); process.exit(1) })
