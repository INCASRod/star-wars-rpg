/**
 * parse-vehicles.js
 *
 * Parses all Vehicle XML files from oggdude/DataCustom/Vehicles/
 * and writes public/vehicles.json.
 *
 * Usage: node scripts/parse-vehicles.js
 */

const { XMLParser } = require('fast-xml-parser')
const fs   = require('fs')
const path = require('path')

const VEHICLES_DIR = path.join(__dirname, '../oggdude/DataCustom/Vehicles')
const OUT_FILE     = path.join(__dirname, '../public/vehicles.json')

function stripMarkup(text) {
  if (!text) return ''
  return String(text)
    .replace(/\[(H[1-6]|h[1-6]|P|B|b|I|i|BR)\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseVehicle(xml) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    isArray: (name) =>
      name === 'Category' ||
      name === 'VehicleWeapon' ||
      name === 'Quality',
  })

  const parsed = parser.parse(xml)
  const v = parsed.Vehicle
  if (!v) return null

  // ── Weapons ─────────────────────────────────────────────────────────────
  const rawWeapons = v.VehicleWeapons?.VehicleWeapon ?? []
  const weapons = rawWeapons.map(w => ({
    weaponKey: String(w.Key ?? ''),
    count:     Number(w.Count ?? 1),
    turret:    String(w.Turret) === 'true',
    location:  String(w.Location ?? ''),
    firingArcs: {
      fore:      String(w.FiringArcs?.Fore)      === 'true',
      aft:       String(w.FiringArcs?.Aft)       === 'true',
      port:      String(w.FiringArcs?.Port)      === 'true',
      starboard: String(w.FiringArcs?.Starboard) === 'true',
      dorsal:    String(w.FiringArcs?.Dorsal)    === 'true',
      ventral:   String(w.FiringArcs?.Ventral)   === 'true',
    },
    qualities: (w.Qualities?.Quality ?? [])
      .map(q => ({ key: String(q.Key ?? ''), count: Number(q.Count ?? 1) }))
      .filter(q => q.key),
  }))

  // ── Categories ───────────────────────────────────────────────────────────
  const cats = v.Categories?.Category ?? []
  const categories = (Array.isArray(cats) ? cats : [cats]).map(String)

  // ── Source text ──────────────────────────────────────────────────────────
  let source = ''
  if (v.Source) {
    source = typeof v.Source === 'object'
      ? String(v.Source['#text'] ?? '')
      : String(v.Source)
  }

  return {
    key:               String(v.Key   ?? ''),
    name:              String(v.Name  ?? ''),
    description:       stripMarkup(v.Description),
    type:              String(v.Type  ?? ''),
    categories,
    source,
    isStarship:        String(v.Starship) === 'true',
    silhouette:        Number(v.Silhouette   ?? 0),
    speed:             Number(v.Speed        ?? 0),
    handling:          Number(v.Handling     ?? 0),
    defFore:           Number(v.DefFore      ?? 0),
    defAft:            Number(v.DefAft       ?? 0),
    defPort:           Number(v.DefPort      ?? 0),
    defStarboard:      Number(v.DefStarboard ?? 0),
    armor:             Number(v.Armor        ?? 0),
    hullTrauma:        Number(v.HullTrauma   ?? 0),
    systemStrain:      Number(v.SystemStrain ?? 0),
    crew:              v.Crew              ? String(v.Crew)              : undefined,
    passengers:        v.Passengers != null ? Number(v.Passengers)        : undefined,
    encumbranceCapacity: v.EncumbranceCapacity != null ? Number(v.EncumbranceCapacity) : undefined,
    consumables:       v.Consumables       ? String(v.Consumables)       : undefined,
    maxAltitude:       v.MaxAltitude       ? String(v.MaxAltitude)       : undefined,
    hyperdrivePrimary: v.HyperdrivePrimary != null ? Number(v.HyperdrivePrimary) : undefined,
    hyperdriveBackup:  v.HyperdriveBackup  != null ? Number(v.HyperdriveBackup)  : undefined,
    naviComputer:      String(v.NaviComputer) === 'true',
    sensorRange:       v.SensorRangeValue  ? String(v.SensorRangeValue)  : undefined,
    massiveValue:      Number(v.Massive ?? 0),
    hardPoints:        v.HP != null ? Number(v.HP) : undefined,
    weapons,
  }
}

// ── Parse all files ──────────────────────────────────────────────────────────
const files = fs.readdirSync(VEHICLES_DIR).filter(f => f.endsWith('.xml'))
const vehicles = []
let errors = 0

for (const file of files) {
  const xml = fs.readFileSync(path.join(VEHICLES_DIR, file), 'utf-8')
  try {
    const v = parseVehicle(xml)
    if (v && v.key) vehicles.push(v)
  } catch (err) {
    console.error(`  ✗ Failed to parse ${file}: ${err.message}`)
    errors++
  }
}

// Deduplicate keys: if two XML files share the same Key, append _2, _3, etc.
const keyCounts = {}
for (const v of vehicles) {
  keyCounts[v.key] = (keyCounts[v.key] ?? 0) + 1
}
const keySeen = {}
for (const v of vehicles) {
  if (keyCounts[v.key] > 1) {
    keySeen[v.key] = (keySeen[v.key] ?? 0) + 1
    if (keySeen[v.key] > 1) {
      v.key = `${v.key}_${keySeen[v.key]}`
    }
  }
}

vehicles.sort((a, b) => a.name.localeCompare(b.name))
fs.writeFileSync(OUT_FILE, JSON.stringify(vehicles, null, 2))
console.log(`Wrote ${vehicles.length} vehicles to ${OUT_FILE} (${errors} errors)`)
