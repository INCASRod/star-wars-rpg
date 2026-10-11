/**
 * Parser for "Copy for Archive" blocks pasted from the Legacy of Rebellion
 * console's VEHICLE cards (format "lor-console/vehicle@1"). Pure function — no
 * Supabase calls, no imports from the editor. Output plugs directly into
 * VehicleEditor's form-state shape. Sibling of importConsoleAdversary.ts and
 * follows the same rules: never guess silently (every default or inference is
 * a flag), never auto-save, keep the console's raw text wherever parsing could
 * have lost something.
 */
import type { ImportReport, ImportReportFlag } from './importConsoleAdversary'

export interface ConsoleVehicleBlock {
  format: string
  exportedAt?: string
  source?: { docId?: string; docTitle?: string; blockId?: string }
  name: string
  classRaw: string | null
  silhouette: number | null
  speed: number | null
  handling: number | null
  defense: { fore: number | null; aft: number | null }
  armor: number | null
  hull: number | null
  strain: number | null
  sensorRange: string
  crew: string
  passengers: string
  encumbrance: string
  consumables: string
  hyperdrive: string
  navicomputer: string
  weapons: { raw: string }[]
  weaponsRaw: string
  extraRows: { label: string; value: string }[]
}

/* ── Form-value shapes — mirror VehicleEditor's local entry types ───────── */
export interface ImportedVehicleWeapon {
  weaponKey: string
  count: number
  turret: boolean
  location: string
  qualitiesText: string
  arcFore: boolean; arcAft: boolean; arcPort: boolean
  arcStarboard: boolean; arcDorsal: boolean; arcVentral: boolean
}

export interface ImportedVehicleFormValues {
  name: string
  type: string
  isStarship: boolean
  silhouette: number
  speed: number
  handling: number
  defFore: number; defAft: number; defPort: number; defStarboard: number
  armor: number
  hullTrauma: number
  systemStrain: number
  crew: string
  passengers: number
  encumbranceCapacity: number
  consumables: string
  hyperdrivePrimary: number | null
  hyperdriveBackup: number | null
  naviComputer: boolean
  sensorRange: string
  maxAltitude: string
  massiveValue: number | null
  hardPoints: number | null
  abilities: { name: string; description: string }[]
  weapons: ImportedVehicleWeapon[]
  description: string
}

export type ImportConsoleVehicleResult =
  | { ok: true; formValues: ImportedVehicleFormValues; report: ImportReport }
  | { ok: false; error: string }

/** What the editor owns, passed in so this stays a pure function of its inputs. */
export interface ImportConsoleVehicleContext {
  /** VehicleEditor's VEHICLE_TYPES (includes 'Other'). */
  vehicleTypes: string[]
  /** The subset of vehicleTypes that VehicleEditor treats as starships. */
  starshipTypes: string[]
  /** vehicles.ts ALL_VEHICLE_WEAPONS. */
  weaponCatalogue: { key: string; name: string; damage: number; range: string; crit?: number }[]
}

const SENSOR_RANGES = ['Close', 'Short', 'Medium', 'Long', 'Extreme']
const KNOWN_QUALITY_KEYS = ['LINKED', 'LIMITEDAMMO', 'BREACH', 'SLOWFIRING', 'BLAST', 'GUIDED', 'ACCURATE', 'TRACTOR', 'ION']
const STARSHIP_WORDS = /\b(star\s?ship|spacecraft|ship|starfighter|fighter|freighter|frigate|corvette|cruiser|shuttle|destroyer)\b/i
const COUNT_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
}

const isNone = (s: string) => !s.trim() || /^none\b/i.test(s.trim())

/** Fire-arc words → editor arc fields. "All" = the four horizontal arcs. */
function parseArcs(text: string): Pick<ImportedVehicleWeapon, 'arcFore' | 'arcAft' | 'arcPort' | 'arcStarboard' | 'arcDorsal' | 'arcVentral'> | null {
  const out = { arcFore: false, arcAft: false, arcPort: false, arcStarboard: false, arcDorsal: false, arcVentral: false }
  let any = false
  for (const tok of text.split(/[\/,&]|\band\b/i).map(t => t.trim().toLowerCase()).filter(Boolean)) {
    if (/^(forward|fore|front)$/.test(tok)) { out.arcFore = true; any = true }
    else if (/^(aft|rear)$/.test(tok)) { out.arcAft = true; any = true }
    else if (tok === 'port') { out.arcPort = true; any = true }
    else if (/^(starboard|stbd)$/.test(tok)) { out.arcStarboard = true; any = true }
    else if (tok === 'dorsal') { out.arcDorsal = true; any = true }
    else if (tok === 'ventral') { out.arcVentral = true; any = true }
    else if (tok === 'all') { out.arcFore = out.arcAft = out.arcPort = out.arcStarboard = true; any = true }
  }
  return any ? out : null
}

/** How many of this weapon: "x4", "4x", a leading number or number word. Defaults to 1. */
function parseCount(name: string): number {
  let m = name.match(/\bx\s*(\d+)\b/i) ?? name.match(/\b(\d+)\s*x\b/i)
  if (m) return Math.max(1, parseInt(m[1], 10))
  m = name.match(/^\s*(\d+)\b/)
  if (m) return Math.max(1, parseInt(m[1], 10))
  const w = name.trim().split(/\s+/)[0]?.toLowerCase()
  return w && COUNT_WORDS[w] ? COUNT_WORDS[w] : 1
}

/** Strip mount/count words so "Forward mounted twin light laser cannons x2" → "light laser cannon". */
function weaponCoreName(name: string): string {
  let s = name.toLowerCase()
    .replace(/[-–]/g, ' ')
    .replace(/\bx\s*\d+\b|\b\d+\s*x\b/g, ' ')
    .replace(/\b(forward|aft|port|starboard|dorsal|ventral|flank|chin|nose|tail|ventrally|dorsally|turret|mounted|twin|dual|quad|pair|of)\b/g, ' ')
    .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\b/g, ' ')
    .replace(/\s+/g, ' ').trim()
  s = s.replace(/s$/, '')                       // cannons → cannon, launchers → launcher
  return s
}

function parseQualities(parts: string[], flags: ImportReportFlag[], weaponName: string): string {
  const out: string[] = []
  for (const part of parts) {
    for (const q of part.split(/,\s*/).map(x => x.trim()).filter(Boolean)) {
      const m = q.match(/^(.*?)(?:\s+(\d+))?$/)
      const key = (m?.[1] ?? q).toUpperCase().replace(/[^A-Z]/g, '')
      if (!key) continue
      const count = m?.[2] ? parseInt(m[2], 10) : 1
      if (!KNOWN_QUALITY_KEYS.includes(key)) {
        flags.push({ field: 'weapons', message: `Weapon "${weaponName}": quality "${q}" is not one of the usual vehicle qualities — kept as ${key}. Verify.` })
      }
      out.push(count > 1 ? `${key} ${count}` : key)
    }
  }
  return out.join(', ')
}

/**
 * Parse a pasted console vehicle block into VehicleEditor form values.
 * @param pasted Raw pasted text (expected to be JSON matching ConsoleVehicleBlock).
 * @param ctx The editor's own lists (types, starship types, weapon catalogue).
 */
export function importConsoleVehicle(pasted: string, ctx: ImportConsoleVehicleContext): ImportConsoleVehicleResult {
  let block: ConsoleVehicleBlock
  try {
    block = JSON.parse(pasted)
  } catch {
    return { ok: false, error: 'Could not parse pasted text as JSON.' }
  }
  if (!block || typeof block !== 'object' || block.format !== 'lor-console/vehicle@1') {
    return { ok: false, error: 'Pasted block is not a recognized console vehicle export (expected format "lor-console/vehicle@1").' }
  }
  if (!block.name || typeof block.name !== 'string') {
    return { ok: false, error: 'Pasted block has no vehicle name.' }
  }

  const flags: ImportReportFlag[] = []
  const notes: string[] = []
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const num = (field: string, label: string, v: number | null | undefined, dflt: number): number => {
    if (v == null) {
      flags.push({ field, message: `${label} missing from block — defaulted to ${dflt}. Verify.` })
      return dflt
    }
    return v
  }

  /* ── Performance + durability ──────────────────────────────────────── */
  const silhouette = num('silhouette', 'Silhouette', block.silhouette, 3)
  const speed = num('speed', 'Speed', block.speed, 2)
  const handling = num('handling', 'Handling', block.handling, 0)
  const armor = num('armor', 'Armour', block.armor, 2)
  const hullTrauma = num('hullTrauma', 'Hull trauma threshold', block.hull, 10)
  const systemStrain = num('systemStrain', 'System strain threshold', block.strain, 8)
  const defFore = num('defFore', 'Fore defence', block.defense?.fore, 0)
  const defAft = num('defAft', 'Aft defence', block.defense?.aft, 0)
  flags.push({ field: 'defPort', message: 'The console card has no Port/Starboard defence — both left at 0. Set them if this vehicle has any.' })

  /* ── Hyperdrive ────────────────────────────────────────────────────── */
  const hd = str(block.hyperdrive)
  let hyperdrivePrimary: number | null = null
  let hyperdriveBackup: number | null = null
  if (!isNone(hd)) {
    const backup = hd.match(/backup[^0-9]*(\d+)/i)
    const primary = hd.match(/primary[^0-9]*(\d+)/i) ?? (backup ? null : hd.match(/class[^0-9]*(\d+)/i)) ?? hd.match(/^\D*(\d+)\b/)
    hyperdrivePrimary = primary ? parseInt(primary[1], 10) : null
    hyperdriveBackup = backup ? parseInt(backup[1], 10) : null
    if (hyperdrivePrimary == null && hyperdriveBackup == null) {
      flags.push({ field: 'hyperdrive', message: `Hyperdrive "${hd}" has no class number I could read — left blank. Fill it in manually.` })
      notes.push(`Hyperdrive (console): ${hd}`)
    }
  }
  const nc = str(block.navicomputer)
  const naviComputer = !isNone(nc)
  if (naviComputer && !/^(yes|true|installed|present|navicomputer)$/i.test(nc)) {
    flags.push({ field: 'naviComputer', message: `Navicomputer "${nc}" is not a plain yes/no — ticked as present. Verify.` })
    notes.push(`Navicomputer (console): ${nc}`)
  }

  /* ── Type + starship ───────────────────────────────────────────────── */
  const classRaw = str(block.classRaw)
  const types = ctx.vehicleTypes.filter(t => t !== 'Other')
  const firstSeg = classRaw.split(/[,;—–]/)[0]?.trim().toLowerCase() ?? ''
  let type = types.find(t => t.toLowerCase() === firstSeg)
  if (!type && classRaw) {
    type = [...types].sort((a, b) => b.length - a.length)
      .find(t => new RegExp(`\\b${t.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(classRaw.toLowerCase()))
  }
  if (!type) {
    type = 'Other'
    flags.push({ field: 'type', message: `Class "${classRaw || '(none)'}" did not match any vehicle type — set to Other. Pick the right type.` })
  }
  const hasHyperdrive = hyperdrivePrimary != null || hyperdriveBackup != null
  let isStarship = ctx.starshipTypes.includes(type)
  if (!isStarship && (STARSHIP_WORDS.test(classRaw) || hasHyperdrive)) {
    isStarship = true
    flags.push({ field: 'isStarship', message: `Marked as a Starship because ${hasHyperdrive ? 'it has a hyperdrive' : `its class "${classRaw}" reads as a ship`}. Verify.` })
  }
  if (classRaw) notes.push(`Class (console): ${classRaw}`)

  /* ── Crew, cargo ───────────────────────────────────────────────────── */
  const crew = isNone(str(block.crew)) ? '' : str(block.crew)
  const consumables = isNone(str(block.consumables)) ? '' : str(block.consumables)

  let passengers = 0
  const pRaw = str(block.passengers)
  if (!isNone(pRaw)) {
    const m = pRaw.match(/^\D*(\d+)\b/)
    if (m) passengers = parseInt(m[1], 10)
    else {
      flags.push({ field: 'passengers', message: `Passengers "${pRaw}" has no number — left at 0; full text saved in Description.` })
      notes.push(`Passengers (console): ${pRaw}`)
    }
  }
  let encumbranceCapacity = 0
  const eRaw = str(block.encumbrance)
  if (!isNone(eRaw)) {
    const m = eRaw.match(/^(\d+)\b/)
    if (m) encumbranceCapacity = parseInt(m[1], 10)
    else {
      flags.push({ field: 'encumbranceCapacity', message: `Encumbrance "${eRaw.length > 60 ? eRaw.slice(0, 60) + '…' : eRaw}" is not a plain number — left at 0; full text saved in Description.` })
      notes.push(`Encumbrance (console): ${eRaw}`)
    }
  }

  /* ── Sensor range ──────────────────────────────────────────────────── */
  const sRaw = str(block.sensorRange)
  const sensorRange = SENSOR_RANGES.find(r => r.toLowerCase() === sRaw.toLowerCase().replace(/[\[\]]/g, '').split(/\s+/)[0]) ?? ''
  if (sRaw && !isNone(sRaw) && !sensorRange) {
    flags.push({ field: 'sensorRange', message: `Sensor range "${sRaw}" is not Close/Short/Medium/Long/Extreme — left blank. Set it manually.` })
  }

  /* ── Weapons ───────────────────────────────────────────────────────── */
  const weapons: ImportedVehicleWeapon[] = []
  const unmatched: string[] = []
  const items = (block.weapons?.length ? block.weapons : []).map(w => str(w?.raw)).filter(Boolean)
  for (const raw of items) {
    const m = raw.match(/^(.*?)\s*\(([\s\S]*)\)\s*$/)
    const name = (m ? m[1] : raw).trim()
    const params = m ? m[2].split(/;\s*/).map(p => p.trim()).filter(Boolean) : []
    let arcText = '', range = '', damage: number | null = null, crit: number | null = null
    const qualityParts: string[] = []
    for (const p of params) {
      if (/^fire\s*arcs?\b/i.test(p)) arcText = p.replace(/^fire\s*arcs?\s*/i, '')
      else if (/^range\b/i.test(p)) range = p.replace(/^range\s*/i, '').replace(/[\[\]]/g, '').trim()
      else if (/^damage\b/i.test(p)) { const d = p.match(/(\d+)/); damage = d ? parseInt(d[1], 10) : null }
      else if (/^crit(ical)?\b/i.test(p)) { const c = p.match(/(\d+)/); crit = c ? parseInt(c[1], 10) : null }
      else qualityParts.push(p)
    }
    const arcs = parseArcs(arcText)
    if (!arcs) {
      flags.push({ field: 'weapons', message: `Weapon "${name}": no readable fire arc${arcText ? ` ("${arcText}")` : ''} — defaulted to Fore. Verify.` })
    }
    // catalogue link: the NAME must match AND the printed stats must agree, otherwise the weapon would silently change damage on save
    const core = weaponCoreName(name)
    const sameName = ctx.weaponCatalogue.filter(c => c.name.toLowerCase() === core)
    const statsAgree = (c: (typeof sameName)[number]) =>
      (damage == null || c.damage === damage) && (crit == null || c.crit === crit) && (!range || c.range.toLowerCase() === range.toLowerCase())
    const hit = sameName.find(statsAgree)
    if (!hit) {
      const stats = [damage != null ? `Damage ${damage}` : null, crit != null ? `Critical ${crit}` : null, range ? `Range ${range}` : null].filter(Boolean).join(', ')
      const why = sameName.length
        ? `its name matches ${sameName[0].name} (Damage ${sameName[0].damage}, Critical ${sameName[0].crit ?? '–'}, Range ${sameName[0].range}) but the stats differ`
        : 'it is not in the vehicle weapon catalogue'
      flags.push({
        field: 'weapons',
        message: `Weapon "${name}" (${stats || 'no stats'}) not linked: ${why}. Row added with no weapon selected — pick one or ✕ Remove it; the full console line is in Description.`,
      })
      unmatched.push(raw)
    }
    weapons.push({
      weaponKey: hit?.key ?? '',
      count: parseCount(name),
      turret: /turret/i.test(name),
      location: '',
      qualitiesText: parseQualities(qualityParts, flags, name),
      arcFore: arcs ? arcs.arcFore : true, arcAft: arcs ? arcs.arcAft : false, arcPort: arcs ? arcs.arcPort : false,
      arcStarboard: arcs ? arcs.arcStarboard : false, arcDorsal: arcs ? arcs.arcDorsal : false, arcVentral: arcs ? arcs.arcVentral : false,
    })
  }
  if (unmatched.length) notes.push(`Weapons not linked to the catalogue (console):\n${unmatched.map(u => `• ${u}`).join('\n')}`)
  if (!items.length && str(block.weaponsRaw) && !isNone(str(block.weaponsRaw))) {
    flags.push({ field: 'weapons', message: 'Weapons row present but could not be split into weapons — full text saved in Description.' })
    notes.push(`Weapons (console): ${str(block.weaponsRaw)}`)
  }

  /* ── Extra rows: pick up the few fields the editor has, the rest go to Description ── */
  let maxAltitude = ''
  let massiveValue: number | null = null
  let hardPoints: number | null = null
  for (const row of block.extraRows ?? []) {
    const label = str(row.label), value = str(row.value)
    const n = value.match(/^\D*(\d+)\b/)
    if (/^hard\s*points?$/i.test(label) && n) hardPoints = parseInt(n[1], 10)
    else if (/^massive$/i.test(label) && n) massiveValue = parseInt(n[1], 10)
    else if (/^max(imum)?\s*altitude$/i.test(label)) maxAltitude = value
    else notes.push(`${label}: ${value}`)
  }

  if (notes.length) flags.push({ field: 'description', message: 'The console card’s free-text rows (and any text that could not be turned into a field) were saved in Description.' })

  const formValues: ImportedVehicleFormValues = {
    name: block.name.trim(), type, isStarship,
    silhouette, speed, handling,
    defFore, defAft, defPort: 0, defStarboard: 0,
    armor, hullTrauma, systemStrain,
    crew, passengers, encumbranceCapacity, consumables,
    hyperdrivePrimary, hyperdriveBackup, naviComputer, sensorRange,
    maxAltitude, massiveValue, hardPoints,
    abilities: [],
    weapons,
    description: notes.join('\n\n'),
  }
  return { ok: true, formValues, report: { docTitle: block.source?.docTitle ?? null, flags } }
}
