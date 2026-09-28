#!/usr/bin/env node
/* Standing backup: reads all documents in console_documents through the
   anon-key REST endpoint (GET only, never the service-role key -- privileged
   SQL sees rows the client cannot and would verify the wrong thing) and
   writes one timestamped JSON file to a path outside the repo.

   One-off manual backups (a bare curl + a scratch file) do not scale once a
   task is going to write to real documents more than once -- this replaces
   that ad hoc process with a single standing script.

   Usage:
     SUPABASE_URL=https://xxxx.supabase.co \
     SUPABASE_ANON_KEY=eyJ... \
     node scripts/console-backup.js [--campaign <uuid>] [--out-dir <path>]

   Default --out-dir is C:\Projects\Holocron\private\console-backups (one
   level above this repo, gitignored regardless via the parent path -- see
   the "outside the repo or gitignored" standard from step 4). Writes
   console-backup-<ISO-timestamp>.json containing the full row set (every
   column, not just blocks) for every document in the given campaign.
*/
var fs = require('fs')
var path = require('path')

var args = process.argv.slice(2)
function opt(n, d) { var i = args.indexOf(n); return i === -1 ? d : args[i + 1] }
var CAMPAIGN = opt('--campaign', '6ba1c2c4-1281-4cca-826a-6677b333a68f')
var OUT_DIR = opt('--out-dir', path.join(__dirname, '..', '..', 'private', 'console-backups'))

var URL_ = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_ANON_KEY
if (!URL_ || !KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY (anon key, not service role).')
  process.exit(2)
}
if (/service_role/.test(Buffer.from(String(KEY).split('.')[1] || '', 'base64').toString())) {
  console.error('That looks like a service-role key. Anon key only.')
  process.exit(2)
}

function get(path_) {
  return fetch(URL_.replace(/\/$/, '') + '/rest/v1/' + path_, {
    method: 'GET',
    headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, Accept: 'application/json' },
  }).then(function (r) {
    if (!r.ok) return r.text().then(function (t) { throw new Error('HTTP ' + r.status + ': ' + t.slice(0, 300)) })
    return r.json()
  })
}

get('console_documents?campaign_id=eq.' + encodeURIComponent(CAMPAIGN) + '&select=*&order=id.asc').then(function (rows) {
  if (!rows.length) { console.error('No rows returned -- wrong campaign id, or RLS is hiding them from the anon key.'); process.exit(1) }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  var stamp = new Date().toISOString().replace(/[:.]/g, '-')
  var outPath = path.join(OUT_DIR, 'console-backup-' + stamp + '.json')
  fs.writeFileSync(outPath, JSON.stringify({ campaign_id: CAMPAIGN, backed_up_at: new Date().toISOString(), documents: rows }, null, 1))

  console.log('backup written  : ' + outPath)
  console.log('documents        : ' + rows.length)
  rows.forEach(function (r) {
    console.log('  ' + r.id + '  ' + String((r.blocks || []).length).padStart(4) + ' blocks  ' + (r.title || ''))
  })
  console.log('writes issued    : none (GET only)')
  console.log('\nPASS')
  process.exit(0)
}).catch(function (e) { console.error('\n' + e.message); process.exit(1) })
