// Parse ItemAttachments.xml and output SQL seed rows
// Usage: node scripts/parse-attachments.js > /tmp/attachment_seed.sql

const fs = require('fs')
const path = require('path')

const xmlPath = path.join(__dirname, '../oggdude/DataCustom/ItemAttachments.xml')
const xml = fs.readFileSync(xmlPath, 'utf8')

function stripBBCode(s) {
  if (!s) return ''
  return s.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim().replace(/'/g, "''")
}

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
      mods.push({
        key: key || null,
        count: count ? parseInt(count, 10) : null,
        misc_desc: miscDesc || null,
      })
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

function sqlStr(s) {
  if (s === null || s === undefined || s === '') return 'NULL'
  return `'${String(s).replace(/'/g, "''")}'`
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

  const name = getTag(block, 'Name')
  const desc = stripBBCode(getTag(block, 'Description'))
  const hp = parseInt(getTag(block, 'HP'), 10) || 0
  const priceStr = getTag(block, 'Price')
  const price = priceStr !== '' ? parseInt(priceStr, 10) : null
  const rarityStr = getTag(block, 'Rarity')
  const rarity = rarityStr !== '' ? parseInt(rarityStr, 10) : null
  const source = getTag(block, 'Source')
  const categoryLimits = getCategoryLimits(block)
  const baseMods = getMods(block, 'BaseMods')
  const addedMods = getMods(block, 'AddedMods')

  attachments.push({ key, name, desc, type, hp, price, rarity, source, categoryLimits, baseMods, addedMods })
}

process.stderr.write(`Parsed ${attachments.length} Weapon/Armor attachments\n`)

// Output SQL
const rows = attachments.map(a => {
  const cats = a.categoryLimits
    ? `ARRAY[${a.categoryLimits.map(c => sqlStr(c)).join(',')}]::text[]`
    : 'NULL'
  const base = a.baseMods ? `${sqlStr(JSON.stringify(a.baseMods))}::jsonb` : 'NULL'
  const added = a.addedMods ? `${sqlStr(JSON.stringify(a.addedMods))}::jsonb` : 'NULL'

  return `  (${sqlStr(a.key)}, ${sqlStr(a.name)}, ${sqlStr(a.desc)}, ${sqlStr(a.type)}, ${a.hp}, ${a.price ?? 'NULL'}, ${a.rarity ?? 'NULL'}, ${cats}, ${base}, ${added}, ${sqlStr(a.source)})`
})

process.stdout.write(rows.join(',\n') + '\n')
