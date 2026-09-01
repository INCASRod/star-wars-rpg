/**
 * process-images.ts
 * Copies OggDude PNG images to public/images/ with normalized names
 * and generates a manifest.json mapping key → image path | null.
 *
 * Usage: npx tsx scripts/process-images.ts
 *
 * --manifest-only: skip the copy step entirely and rebuild manifest.json
 * purely from whatever PNGs currently exist under public/images/equipment/
 * and public/images/species/ (by parsing their {type}-{key}.png filenames).
 * Added for The Archive Prompt 2: scripts/convert-equipment-images.py
 * converts equipment PNGs in place and moves some into equipment/photographic/,
 * which the normal copy-from-oggdude-source mode would silently overwrite
 * with the unconverted originals. This mode is safe to run after that
 * conversion -- it never touches a PNG, only re-derives the manifest from
 * the destination directory's current, post-conversion state.
 * Files under equipment/photographic/ are excluded (quarantined, not
 * resolvable images).
 */

import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')
const OGGDUDE = path.join(ROOT, 'oggdude', 'DataCustom')
const PUBLIC_IMAGES = path.join(ROOT, 'public', 'images')

const EQUIPMENT_SRC = path.join(OGGDUDE, 'EquipmentImages')
const SPECIES_SRC = path.join(OGGDUDE, 'SpeciesImages')

const EQUIPMENT_DEST = path.join(PUBLIC_IMAGES, 'equipment')
const SPECIES_DEST = path.join(PUBLIC_IMAGES, 'species')

const MANIFEST_ONLY = process.argv.includes('--manifest-only')

// Ensure output dirs exist
for (const dir of [EQUIPMENT_DEST, SPECIES_DEST]) {
  fs.mkdirSync(dir, { recursive: true })
}

interface Manifest {
  weapons: Record<string, string | null>
  armor: Record<string, string | null>
  gear: Record<string, string | null>
  species: Record<string, string | null>
}

const manifest: Manifest = { weapons: {}, armor: {}, gear: {}, species: {} }

if (MANIFEST_ONLY) {
  const TYPE_TO_SECTION = { weapon: 'weapons', armor: 'armor', gear: 'gear' } as const
  const equipDestFiles = fs.readdirSync(EQUIPMENT_DEST, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.toLowerCase().endsWith('.png'))
    .map(d => d.name)

  let weaponCount = 0, armorCount = 0, gearCount = 0
  for (const file of equipDestFiles) {
    const m = file.match(/^(weapon|armor|gear)-(.+)\.png$/i)
    if (!m) { console.warn(`  Skipping unrecognized file: ${file}`); continue }
    const type = m[1].toLowerCase() as 'weapon' | 'armor' | 'gear'
    const key = m[2]
    const webPath = `/images/equipment/${file}`
    const section = TYPE_TO_SECTION[type]
    manifest[section][key] = webPath
    if (type === 'weapon') weaponCount++
    else if (type === 'armor') armorCount++
    else gearCount++
  }

  const speciesDestFiles = fs.readdirSync(SPECIES_DEST, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.toLowerCase().endsWith('.png'))
    .map(d => d.name)
  let speciesCount = 0
  for (const file of speciesDestFiles) {
    const key = file.replace(/\.png$/i, '')
    manifest.species[key] = `/images/species/${file}`
    speciesCount++
  }

  const manifestPath = path.join(PUBLIC_IMAGES, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

  console.log(`\n✓ Manifest rebuilt from current public/images/ state (no files copied):`)
  console.log(`  Weapons: ${weaponCount}`)
  console.log(`  Armor:   ${armorCount}`)
  console.log(`  Gear:    ${gearCount}`)
  console.log(`  Species: ${speciesCount}`)
  console.log(`  Total:   ${weaponCount + armorCount + gearCount + speciesCount}`)
  console.log(`\n✓ Manifest written to: ${manifestPath}`)
  process.exit(0)
}

// --- Process Equipment Images ---
const equipFiles = fs.readdirSync(EQUIPMENT_SRC).filter(f => f.endsWith('.png'))
let weaponCount = 0, armorCount = 0, gearCount = 0

for (const file of equipFiles) {
  let type: 'weapon' | 'armor' | 'gear' | null = null
  let key: string = ''

  const lower = file.toLowerCase()
  if (lower.startsWith('weapon')) {
    type = 'weapon'
    key = file.replace(/^[Ww]eapon/i, '').replace(/\.png$/i, '')
  } else if (lower.startsWith('armor')) {
    type = 'armor'
    key = file.replace(/^[Aa]rmor/i, '').replace(/\.png$/i, '')
  } else if (lower.startsWith('gear')) {
    type = 'gear'
    key = file.replace(/^[Gg]ear/i, '').replace(/\.png$/i, '')
  } else {
    console.warn(`  Skipping unrecognized file: ${file}`)
    continue
  }

  const destName = `${type}-${key}.png`
  const destPath = path.join(EQUIPMENT_DEST, destName)
  const webPath = `/images/equipment/${destName}`

  fs.copyFileSync(path.join(EQUIPMENT_SRC, file), destPath)

  if (type === 'weapon') { manifest.weapons[key] = webPath; weaponCount++ }
  else if (type === 'armor') { manifest.armor[key] = webPath; armorCount++ }
  else if (type === 'gear') { manifest.gear[key] = webPath; gearCount++ }
}

// --- Process Species Images ---
const speciesFiles = fs.readdirSync(SPECIES_SRC).filter(f => f.endsWith('.png'))
let speciesCount = 0

for (const file of speciesFiles) {
  const key = file.replace(/\.png$/i, '')
  const destPath = path.join(SPECIES_DEST, file)
  const webPath = `/images/species/${file}`

  fs.copyFileSync(path.join(SPECIES_SRC, file), destPath)
  manifest.species[key] = webPath
  speciesCount++
}

// --- Write manifest ---
const manifestPath = path.join(PUBLIC_IMAGES, 'manifest.json')
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

console.log(`\n✓ Equipment images processed:`)
console.log(`  Weapons: ${weaponCount}`)
console.log(`  Armor:   ${armorCount}`)
console.log(`  Gear:    ${gearCount}`)
console.log(`  Species: ${speciesCount}`)
console.log(`  Total:   ${weaponCount + armorCount + gearCount + speciesCount}`)
console.log(`\n✓ Manifest written to: ${manifestPath}`)
