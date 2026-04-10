/**
 * seed-vehicle-tokens.js
 *
 * Uploads VehicleImages PNGs to Supabase Storage (tokens bucket, vehicles/ prefix)
 * and upserts rows into vehicle_token_images.
 *
 * Images are matched to vehicles by filename = vehicle key (e.g. 1LTANK.png → key "1LTANK").
 * 316 of 430 vehicles have a matching image.
 *
 * Usage: node scripts/seed-vehicle-tokens.js
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

const fs   = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const IMAGES_DIR  = path.join(__dirname, '../oggdude/DataCustom/VehicleImages')
const VEHICLES_JSON = path.join(__dirname, '../public/vehicles.json')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

async function uploadToken(imagePath, vehicleKey) {
  const file = fs.readFileSync(imagePath)
  const storagePath = `vehicles/${vehicleKey.toLowerCase()}.png`

  const { error: upErr } = await supabase.storage
    .from('tokens')
    .upload(storagePath, file, { contentType: 'image/png', upsert: true })
  if (upErr) throw upErr

  const { data } = supabase.storage.from('tokens').getPublicUrl(storagePath)

  const { error: dbErr } = await supabase
    .from('vehicle_token_images')
    .upsert({ vehicle_key: vehicleKey, token_image_url: data.publicUrl })
  if (dbErr) throw dbErr

  return data.publicUrl
}

async function main() {
  const vehicles  = JSON.parse(fs.readFileSync(VEHICLES_JSON, 'utf-8'))
  const vehicleKeys = new Set(vehicles.map(v => v.key))
  const images    = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.png'))

  // Match image filename (without .png) to vehicle key
  const matches = images
    .map(f => ({ file: f, key: f.replace(/\.png$/i, '') }))
    .filter(({ key }) => vehicleKeys.has(key))

  console.log(`Found ${matches.length} image→vehicle matches. Starting upload…`)

  let ok = 0, fail = 0
  for (const { file, key } of matches) {
    try {
      const url = await uploadToken(path.join(IMAGES_DIR, file), key)
      console.log(`  ✓ ${key} → ${url}`)
      ok++
    } catch (err) {
      console.error(`  ✗ ${key}: ${err.message}`)
      fail++
    }
  }

  console.log(`\nDone. ${ok} uploaded, ${fail} failed.`)
}

main().catch(err => { console.error(err); process.exit(1) })
