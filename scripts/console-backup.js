#!/usr/bin/env node
/* Standing backup: reads all documents in console_documents and writes one
   timestamped JSON file to a path outside the repo.

   Since Auth B4 console_documents is GM-only under RLS, so the old anon-key
   REST read returns nothing. This reads through DATABASE_URL (.env.local),
   read-only (a single SELECT), and prints no secret.

   Usage:
     node scripts/console-backup.js [--campaign <uuid>] [--out-dir <path>]

   Default --out-dir is C:\Projects\Holocron\private\console-backups (one
   level above this repo, gitignored regardless via the parent path). Writes
   console-backup-<ISO-timestamp>.json containing the full row set (every
   column, not just blocks) for every document in the given campaign.
*/
var fs = require('fs')
var path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
var postgres = require('postgres')

var args = process.argv.slice(2)
function opt(n, d) { var i = args.indexOf(n); return i === -1 ? d : args[i + 1] }
var CAMPAIGN = opt('--campaign', '6ba1c2c4-1281-4cca-826a-6677b333a68f')
var OUT_DIR = opt('--out-dir', path.join(__dirname, '..', '..', 'private', 'console-backups'))

if (!process.env.DATABASE_URL) {
  console.error('Set DATABASE_URL in .env.local.')
  process.exit(2)
}
var sql = postgres(process.env.DATABASE_URL, { max: 1 })

sql`select * from console_documents where campaign_id = ${CAMPAIGN} order by id asc`.then(function (rows) {
  if (!rows.length) { console.error('No rows returned -- wrong campaign id.'); process.exit(1) }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  var stamp = new Date().toISOString().replace(/[:.]/g, '-')
  var outPath = path.join(OUT_DIR, 'console-backup-' + stamp + '.json')
  fs.writeFileSync(outPath, JSON.stringify({ campaign_id: CAMPAIGN, backed_up_at: new Date().toISOString(), documents: rows }, null, 1))

  console.log('backup written  : ' + outPath)
  console.log('documents        : ' + rows.length)
  rows.forEach(function (r) {
    console.log('  ' + r.id + '  ' + String((r.blocks || []).length).padStart(4) + ' blocks  ' + (r.title || ''))
  })
  console.log('writes issued    : none (SELECT only)')
  console.log('\nPASS')
  return sql.end().then(function () { process.exit(0) })
}).catch(function (e) { console.error('\n' + e.message); process.exit(1) })
