// Outputs one SQL INSERT per row to stdout, one per line, ready for batching
const fs = require('fs'), path = require('path')
const xml = fs.readFileSync(path.join(__dirname, '../oggdude/DataCustom/ItemAttachments.xml'), 'utf8')

function getTag(b, t) {
  const s = b.indexOf(`<${t}>`); if (s === -1) return ''
  const e = b.indexOf(`</${t}>`, s); if (e === -1) return ''
  return b.slice(s + t.length + 2, e).trim()
}
function getMods(b, t) {
  const s = b.indexOf(`<${t}>`); if (s === -1) return null
  const e = b.indexOf(`</${t}>`, s); if (e === -1) return null
  const sec = b.slice(s + t.length + 2, e)
  const mods = []; let p = 0
  while (true) {
    const ms = sec.indexOf('<Mod>', p); if (ms === -1) break
    const me = sec.indexOf('</Mod>', ms); if (me === -1) break
    const mb = sec.slice(ms + 5, me)
    const key = getTag(mb, 'Key'), count = getTag(mb, 'Count'), md = getTag(mb, 'MiscDesc')
    if (key || md) mods.push({ key: key||null, count: count?parseInt(count,10):null, misc_desc: md||null })
    p = me + 6
  }
  return mods.length ? mods : null
}
function getCats(b) {
  const s = b.indexOf('<CategoryLimit>'); if (s === -1) return null
  const e = b.indexOf('</CategoryLimit>', s); if (e === -1) return null
  const sec = b.slice(s + 15, e); const cats = []; let p = 0
  while (true) {
    const cs = sec.indexOf('<Category>', p); if (cs === -1) break
    const ce = sec.indexOf('</Category>', cs); if (ce === -1) break
    cats.push(sec.slice(cs + 10, ce).trim()); p = ce + 11
  }
  return cats.length ? cats : null
}
function strip(s) { return (s||'').replace(/\[.*?\]/g,'').replace(/\s+/g,' ').trim() }
function sq(v) {
  if (v === null || v === undefined || v === '') return 'NULL'
  return "'" + String(v).replace(/'/g, "''") + "'"
}

const rows = []
let pos = 0
while (true) {
  const s = xml.indexOf('<ItemAttachment>', pos); if (s === -1) break
  const e = xml.indexOf('</ItemAttachment>', s); if (e === -1) break
  const b = xml.slice(s + 16, e); pos = e + 17
  if (!b.includes('<Type>Weapon</Type>') && !b.includes('<Type>Armor</Type>')) continue
  const key = getTag(b, 'Key'); if (!key) continue
  const cats = getCats(b)
  const bm = getMods(b, 'BaseMods')
  const am = getMods(b, 'AddedMods')
  const catsSQL = cats ? `ARRAY[${cats.map(c => sq(c)).join(',')}]::text[]` : 'NULL'
  const bmSQL = bm ? sq(JSON.stringify(bm)) + '::jsonb' : 'NULL'
  const amSQL = am ? sq(JSON.stringify(am)) + '::jsonb' : 'NULL'
  rows.push(`(${sq(key)},${sq(getTag(b,'Name'))},${sq(strip(getTag(b,'Description')))},${sq(getTag(b,'Type'))},${parseInt(getTag(b,'HP'),10)||0},${getTag(b,'Price')||'NULL'},${getTag(b,'Rarity')||'NULL'},${catsSQL},${bmSQL},${amSQL},${sq(getTag(b,'Source'))})`)
}

process.stderr.write(`${rows.length} rows\n`)
// Output JSON array of row SQL strings for programmatic use
process.stdout.write(JSON.stringify(rows))
