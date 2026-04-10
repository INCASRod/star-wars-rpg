/**
 * seed-tokens.js
 *
 * Uploads HIGH-confidence token images from public/tokens/ to Supabase Storage
 * (tokens bucket) and upserts rows into adversary_token_images.
 *
 * REVIEW BEFORE RUNNING. Run with:
 *   node scripts/seed-tokens.js
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

const fs   = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const TOKENS_DIR = path.join(__dirname, '../public/tokens')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

// ── HIGH confidence matches ──────────────────────────────────────────────────
// Format: [ tokenFile, adversaryName (= adversary_key in adversary_token_images) ]
const HIGH_MATCHES = [
  ['BOSSAgent.png',           'BoSS Agent'],
  ['BothanSpy.png',           'Bothan Spy'],
  ['COMPNORAgent_Fem.png',    'COMPNOR Agent'],
  ['DarkTrooper.png',         'Stormtrooper: Dark Trooper'],
  ['DeStabAgent.png',         'Imperial DeStab Agent'],
  ['EmperorsHand.png',        "Emperor's Hand"],
  ['ImpAdvisor.png',          'Imperial Advisor'],
  ['ImpArmyOfficer.png',      'Imperial Army Officer'],
  ['ImpArmyTrooper.png',      'Imperial Army Trooper'],
  ['ImpCustomsInspector.png', 'Customs Inspector'],
  ['ImpGunneryCorps.png',     'Imperial Gunnery Corps'],
  ['ImpNavyOfficer.png',      'Imperial Navy Officer'],
  ['ImpVehicleCorps.png',     'Imperial Vehicle Corps'],
  ['ImperialMoff.png',        'Imperial Moff'],
  ['MilitaryInformant.png',   'Military Informant'],
  ['NavyTrooper.png',         'Imperial Navy Trooper'],
  ['RebCommander.png',        'Alliance Commander'],
  ['RebQuartermaster.png',    'Quartermaster'],
  ['RebelCellLeader.png',     'Rebel Cell Leader'],
  ['RebelInfantry.png',       'Alliance Infantry'],
  ['Sandtrooper.png',         'Stormtrooper: Sandtrooper'],
  ['ScoutTrooper.png',        'Stormtrooper: Scout Trooper'],
  ['Snowtrooper.png',         'Stormtrooper: Snowtrooper'],
  ['Stormtrooper.png',        'Imperial Stormtrooper'],
  ['TieAce.png',              'TIE Ace'],
  ['TiePilot.png',            'TIE Pilot'],

  // RebLiaison conflict resolved: Female art selected.
  ['RebLiaison_Female.png',   'Rebel Alliance Liaison'],

  // ── MEDIUM matches (reviewed and approved) ──────────────────────────────
  // ImpAgent → Imperial Intelligence Agent (most generic non-specialised imperial agent)
  ['ImpAgent.png',            'Imperial Intelligence Agent'],
  // ImpEngineer → Imperial Naval Engineer (closest named engineer in dataset)
  ['ImpEngineer.png',         'Imperial Naval Engineer'],
  // RebDiplomat_Fem → Diplomat (no Rebel-specific diplomat exists in dataset)
  ['RebDiplomat_Fem.png',     'Diplomat'],
  // RebInfiltrator → Rebel Specforce Infiltrator (per user direction)
  ['RebInfiltrator.png',      'Rebel Specforce Infiltrator'],
]

// ── MANUAL REVIEW NEEDED — no match found ───────────────────────────────────
// ['RebEngineer.png',   ??? ]   // No Rebel/Alliance Engineer in dataset
// ['RebLiaison_Male.png', ???]  // Conflicts with Female variant above — pick one
// ['RebPathFinder.png', ???]    // No Pathfinder adversary
// ['RebPilot.png',      ???]    // No Rebel Pilot adversary
// ['RebPilotAce.png',   ???]    // No Rebel Pilot Ace adversary
// ['Sergeant.png',      ???]    // No plain Sergeant adversary


async function uploadToken(file, adversaryKey) {
  const filePath   = path.join(TOKENS_DIR, file)
  const storagePath = file   // store as-is in the bucket

  const fileBuffer = fs.readFileSync(filePath)
  const mimeType   = file.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

  // Upload to tokens bucket
  const { error: upErr } = await supabase.storage
    .from('tokens')
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true })

  if (upErr) {
    console.error(`  ✗  UPLOAD FAILED  ${file}: ${upErr.message}`)
    return false
  }

  // Get public URL
  const { data } = supabase.storage
    .from('tokens')
    .getPublicUrl(storagePath)

  // Upsert into adversary_token_images
  const { error: dbErr } = await supabase
    .from('adversary_token_images')
    .upsert({ adversary_key: adversaryKey, token_image_url: data.publicUrl })

  if (dbErr) {
    console.error(`  ✗  DB UPSERT FAILED  ${adversaryKey}: ${dbErr.message}`)
    return false
  }

  console.log(`  ✓  ${file.padEnd(30)}→ ${adversaryKey}`)
  return true
}

async function main() {
  console.log(`\nUploading ${HIGH_MATCHES.length} HIGH-confidence token images…\n`)

  let ok = 0, fail = 0
  for (const [file, key] of HIGH_MATCHES) {
    const success = await uploadToken(file, key)
    success ? ok++ : fail++
  }

  console.log(`\nDone. ${ok} uploaded, ${fail} failed.\n`)

  if (fail > 0) {
    console.log('Re-run to retry failed uploads.')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
