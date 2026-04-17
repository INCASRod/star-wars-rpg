import type { AdversaryInstance } from './adversaries'

// ── VehicleInstance — combat participant type for vehicles ─────────────────────
export interface VehicleInstance {
  instanceId:             string
  sourceId:               string
  name:                   string
  kind:                   'vehicle'    // discriminator — distinguishes from AdversaryInstance
  silhouette:             number
  speed:                  number
  handling:               number
  armor:                  number
  hullTraumaThreshold:    number
  systemStrainThreshold:  number
  hullTraumaCurrent:      number
  systemStrainCurrent:    number
  defense: {
    fore:      number
    aft:       number
    port:      number
    starboard: number
  }
  weapons:               VehicleWeapon[]
  revealed:              boolean
  alignment:             'enemy' | 'allied_npc'
  token_image_url?:      string | null
}

// ── Canonical stats for OggDude vehicle weapon keys ───────────────────────────
// Source: AoE Core Rulebook vehicle stat blocks + standard supplement tables.
// Tractor beams and utility devices have damage 0 (they don't deal hull trauma).
export interface VehicleWeaponEntry { name: string; damage: number; range: string; crit?: number }
const VEHICLE_WEAPON_STATS: Record<string, VehicleWeaponEntry> = {
  // Laser cannons
  LASERLT:           { name: 'Light Laser Cannon',           damage: 5,  range: 'Close',   crit: 3 },
  LASERMED:          { name: 'Medium Laser Cannon',          damage: 6,  range: 'Close',   crit: 3 },
  LASERHVY:          { name: 'Heavy Laser Cannon',           damage: 6,  range: 'Short',   crit: 3 },
  LASERLONG:         { name: 'Long-Range Laser Cannon',      damage: 5,  range: 'Long',    crit: 3 },
  LASERQUAD:         { name: 'Quad Laser Cannon',            damage: 5,  range: 'Close',   crit: 3 },
  LASERPTDEF:        { name: 'Point-Defence Laser Cannon',   damage: 4,  range: 'Close',   crit: 4 },
  LASCAN:            { name: 'Laser Cannon',                 damage: 6,  range: 'Medium',  crit: 3 },
  CLW:               { name: 'Close-Range Laser Weapon',     damage: 5,  range: 'Close',   crit: 3 },
  VL6:               { name: 'VL6 Laser Cannon',             damage: 4,  range: 'Close',   crit: 3 },
  // Blaster cannons
  BLASTCANLT:        { name: 'Light Blaster Cannon',         damage: 4,  range: 'Close',   crit: 4 },
  BLASTCANHVY:       { name: 'Heavy Blaster Cannon',         damage: 5,  range: 'Close',   crit: 4 },
  BLASTLTREP:        { name: 'Light Repeating Blaster',      damage: 4,  range: 'Short',   crit: 4 },
  BLASTHVYREP:       { name: 'Heavy Repeating Blaster',      damage: 5,  range: 'Short',   crit: 4 },
  LIGHTREPBLASVEH20: { name: 'Light Repeating Blaster',      damage: 3,  range: 'Close',   crit: 4 },
  LIGHTREPVEHICLE:   { name: 'Light Repeating Blaster',      damage: 3,  range: 'Close',   crit: 4 },
  AUTOBLAST:         { name: 'Auto-Blaster',                 damage: 3,  range: 'Close',   crit: 5 },
  ROTREPBLASTCAN:    { name: 'Rotating Repeating Blaster',   damage: 4,  range: 'Short',   crit: 4 },
  ANTIPERSLASER:     { name: 'Anti-Personnel Laser',         damage: 3,  range: 'Short',   crit: 4 },
  SUPPRESSCANNON:    { name: 'Suppression Cannon',           damage: 3,  range: 'Short',   crit: 5 },
  // Ion weapons
  IONLT:             { name: 'Light Ion Cannon',             damage: 5,  range: 'Close',   crit: 4 },
  IONMED:            { name: 'Medium Ion Cannon',            damage: 6,  range: 'Medium',  crit: 4 },
  IONHVY:            { name: 'Heavy Ion Cannon',             damage: 7,  range: 'Long',    crit: 4 },
  IONBATT:           { name: 'Ion Battery',                  damage: 7,  range: 'Medium',  crit: 4 },
  IONLONG:           { name: 'Long-Range Ion Cannon',        damage: 7,  range: 'Extreme', crit: 4 },
  HEAVYIONBLAS:      { name: 'Heavy Ion Blaster',            damage: 5,  range: 'Short',   crit: 4 },
  // Missiles & torpedoes
  PTL:               { name: 'Proton Torpedo Launcher',      damage: 8,  range: 'Short',   crit: 2 },
  CML:               { name: 'Concussion Missile Launcher',  damage: 6,  range: 'Short',   crit: 3 },
  CMLHK:             { name: 'Homing Missile Launcher',      damage: 6,  range: 'Medium',  crit: 3 },
  ACML:              { name: 'Advanced Missile Launcher',    damage: 6,  range: 'Medium',  crit: 3 },
  AFCML:             { name: 'Auto-Fire Missile Launcher',   damage: 6,  range: 'Short',   crit: 3 },
  PROTTORPHVY:       { name: 'Heavy Proton Torpedo',         damage: 10, range: 'Short',   crit: 2 },
  PROTONBAY:         { name: 'Proton Bomb Bay',              damage: 8,  range: 'Close',   crit: 2 },
  PROTONBOMB:        { name: 'Proton Bomb',                  damage: 8,  range: 'Close',   crit: 2 },
  TORPLAUNCH:        { name: 'Torpedo Launcher',             damage: 8,  range: 'Short',   crit: 2 },
  MINCONCLNCH:       { name: 'Mini Concussion Launcher',     damage: 4,  range: 'Short',   crit: 3 },
  MINIROCKET:        { name: 'Mini Rocket Pod',              damage: 4,  range: 'Short',   crit: 3 },
  CLUSTERBOMB:       { name: 'Cluster Bomb',                 damage: 5,  range: 'Close',   crit: 3 },
  MASSDRIVERCANNON:  { name: 'Mass Driver Cannon',           damage: 7,  range: 'Long',    crit: 3 },
  MASSDRIVMSL:       { name: 'Mass Driver Missile',          damage: 7,  range: 'Long',    crit: 3 },
  CONGRENLAUNCH:     { name: 'Concussion Grenade Launcher',  damage: 4,  range: 'Short',   crit: 4 },
  // Flak / anti-air
  FLAKLT:            { name: 'Light Flak Cannon',            damage: 4,  range: 'Short',   crit: 4 },
  FLAKMED:           { name: 'Medium Flak Cannon',           damage: 5,  range: 'Short',   crit: 4 },
  ANTIAIR:           { name: 'Anti-Air Cannon',              damage: 4,  range: 'Short',   crit: 4 },
  // Turbolasers (capital ship scale)
  TURBOLT:           { name: 'Light Turbolaser',             damage: 9,  range: 'Medium',  crit: 3 },
  TURBOMED:          { name: 'Medium Turbolaser',            damage: 10, range: 'Long',    crit: 3 },
  TURBOHVY:          { name: 'Heavy Turbolaser',             damage: 11, range: 'Long',    crit: 3 },
  SUPERLASER:        { name: 'Superlaser',                   damage: 60, range: 'Extreme', crit: 1 },
  // Specialty / utility
  ELECHARPOON:       { name: 'Electro-Harpoon',              damage: 6,  range: 'Short',   crit: 5 },
  TRACTLT:           { name: 'Light Tractor Beam',           damage: 0,  range: 'Close' },
  TRACTMED:          { name: 'Medium Tractor Beam',          damage: 0,  range: 'Short' },
  TRACTHVY:          { name: 'Heavy Tractor Beam',           damage: 0,  range: 'Medium' },
  LTTRACTCOUPLE:     { name: 'Light Tractor Coupling',       damage: 0,  range: 'Close' },
  XX23TRACER:        { name: 'XX-23 S-Thread Tracer',        damage: 0,  range: 'Medium' },
}

/** Resolve the display name for a vehicle weapon key, falling back to the raw key. */
export function vehicleWeaponDisplayName(key: string): string {
  return VEHICLE_WEAPON_STATS[key]?.name ?? key
}

/** Resolve the full stats entry for a vehicle weapon key, or undefined if unknown. */
export function vehicleWeaponStats(key: string): VehicleWeaponEntry | undefined {
  return VEHICLE_WEAPON_STATS[key]
}

/** All known vehicle weapon entries, sorted by display name — for use in editor dropdowns. */
export const ALL_VEHICLE_WEAPONS: (VehicleWeaponEntry & { key: string })[] =
  Object.entries(VEHICLE_WEAPON_STATS)
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => a.name.localeCompare(b.name))

export interface VehicleWeaponQuality {
  key:   string
  count: number
}

export interface VehicleFiringArcs {
  fore:      boolean
  aft:       boolean
  port:      boolean
  starboard: boolean
  dorsal:    boolean
  ventral:   boolean
}

export interface VehicleWeapon {
  weaponKey:   string
  count:       number
  turret:      boolean
  location:    string
  firingArcs:  VehicleFiringArcs
  qualities:   VehicleWeaponQuality[]
}

export interface VehicleAbility {
  name:        string
  description: string
}

export interface Vehicle {
  key:                string
  name:               string
  description?:       string
  type:               string       // "Landspeeder", "Starship", etc.
  categories:         string[]
  source?:            string
  isStarship:         boolean

  // Performance
  silhouette:         number
  speed:              number
  handling:           number

  // Defense arcs
  defFore:            number
  defAft:             number
  defPort:            number
  defStarboard:       number

  // Durability
  armor:              number
  hullTrauma:         number
  systemStrain:       number

  // Crew & cargo
  crew?:              string
  passengers?:        number
  encumbranceCapacity?: number
  consumables?:       string

  // Optional
  maxAltitude?:       string
  hyperdrivePrimary?: number
  hyperdriveBackup?:  number
  naviComputer?:      boolean
  sensorRange?:       string
  massiveValue?:      number
  hardPoints?:        number

  weapons:            VehicleWeapon[]
  abilities?:         VehicleAbility[]

  // Set on custom DB rows
  _isCustom?: boolean
  _dbId?:     string
}

const VEHICLE_URL = '/vehicles.json'
let _cache: Vehicle[] | null = null

export async function fetchVehicles(): Promise<Vehicle[]> {
  if (_cache) return _cache
  const res = await fetch(VEHICLE_URL)
  if (!res.ok) throw new Error(`Failed to fetch vehicles: ${res.status}`)
  _cache = await res.json() as Vehicle[]
  return _cache
}

/** Convert a custom DB row to a Vehicle */
export function dbRowToVehicle(row: Record<string, unknown>): Vehicle & { _isCustom: true; _dbId: string } {
  return {
    key:               String(row.id),
    name:              String(row.name),
    type:              String(row.type ?? 'Speeder'),
    categories:        (row.categories as string[]) ?? [],
    isStarship:        Boolean(row.is_starship),
    silhouette:        Number(row.silhouette ?? 3),
    speed:             Number(row.speed      ?? 2),
    handling:          Number(row.handling   ?? 0),
    defFore:           Number(row.def_fore       ?? 0),
    defAft:            Number(row.def_aft        ?? 0),
    defPort:           Number(row.def_port       ?? 0),
    defStarboard:      Number(row.def_starboard  ?? 0),
    armor:             Number(row.armor          ?? 2),
    hullTrauma:        Number(row.hull_trauma     ?? 10),
    systemStrain:      Number(row.system_strain   ?? 8),
    crew:              row.crew         ? String(row.crew)         : undefined,
    passengers:        row.passengers   != null ? Number(row.passengers)   : undefined,
    encumbranceCapacity: row.encumbrance_capacity != null ? Number(row.encumbrance_capacity) : undefined,
    consumables:       row.consumables  ? String(row.consumables)  : undefined,
    hyperdrivePrimary: row.hyperdrive_primary != null ? Number(row.hyperdrive_primary) : undefined,
    hyperdriveBackup:  row.hyperdrive_backup  != null ? Number(row.hyperdrive_backup)  : undefined,
    naviComputer:      row.navi_computer != null ? Boolean(row.navi_computer) : undefined,
    sensorRange:       row.sensor_range  ? String(row.sensor_range)  : undefined,
    maxAltitude:       row.max_altitude  ? String(row.max_altitude)  : undefined,
    massiveValue:      row.massive_value != null ? Number(row.massive_value) : undefined,
    hardPoints:        row.hard_points   != null ? Number(row.hard_points)   : undefined,
    weapons:           (row.weapons as VehicleWeapon[]) ?? [],
    abilities:         (row.abilities as VehicleAbility[]) ?? [],
    description:       row.description  ? String(row.description)  : undefined,
    _isCustom:         true,
    _dbId:             String(row.id),
  } as Vehicle & { _isCustom: true; _dbId: string }
}

/**
 * Convert a Vehicle to an AdversaryInstance so it can be added to combat.
 * Vehicles are treated as 'nemesis' type units:
 *   - soak          = armor
 *   - woundThreshold = hullTrauma
 *   - strainThreshold = systemStrain
 *   - defense        = fore arc for both melee/ranged
 */
export function vehicleToInstance(v: Vehicle): AdversaryInstance & { _isVehicle: true } {
  const arcs = `${v.defFore}/${v.defAft}/${v.defPort}/${v.defStarboard}`
  return {
    instanceId:      `${v.key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sourceId:        v.key,
    name:            v.name,
    type:            'nemesis',
    groupSize:       1,
    groupRemaining:  1,
    revealed:        false,
    characteristics: { brawn: 2, agility: 2, intellect: 2, cunning: 2, willpower: 2, presence: 2 },
    soak:            v.armor,
    woundThreshold:  v.hullTrauma,
    strainThreshold: v.systemStrain,
    defense: {
      melee:  v.defFore,
      ranged: v.defFore,
    },
    skills:    [],
    skillRanks: {},
    talents:   [],
    abilities: [
      {
        name:        `Sil ${v.silhouette} · Spd ${v.speed} · Hdl ${v.handling >= 0 ? '+' : ''}${v.handling}`,
        description: `Defense (F/A/P/S): ${arcs}${v.isStarship ? ' · Starship' : ''}`,
      },
      ...(v.abilities ?? []),
    ],
    weapons: v.weapons.map(w => {
      const stats = VEHICLE_WEAPON_STATS[w.weaponKey]
      const displayName = stats?.name ?? w.weaponKey
      return {
        name:      `${w.count > 1 ? `${w.count}× ` : ''}${displayName}${w.turret ? ' (Turret)' : ''}`,
        damage:    stats?.damage ?? 0,
        range:     stats?.range  ?? 'Short',
        crit:      stats?.crit,
        qualities: w.qualities.map(q => `${q.key}${q.count > 1 ? ` ${q.count}` : ''}`),
      }
    }),
    gear:      [],
    _isVehicle: true,
  } as AdversaryInstance & { _isVehicle: true }
}

/**
 * Convert a Vehicle to a VehicleInstance for use in encounter.vehicles[].
 * Unlike vehicleToInstance (which produces an AdversaryInstance shim),
 * this creates a properly typed VehicleInstance with its own field names.
 */
export function vehicleToVehicleInstance(
  v: Vehicle,
  alignment: 'enemy' | 'allied_npc' = 'enemy',
  tokenImageUrl?: string | null,
): VehicleInstance {
  return {
    instanceId:            `veh-${v.key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sourceId:              v.key,
    name:                  v.name,
    kind:                  'vehicle',
    silhouette:            v.silhouette,
    speed:                 v.speed,
    handling:              v.handling,
    armor:                 v.armor,
    hullTraumaThreshold:   v.hullTrauma,
    systemStrainThreshold: v.systemStrain,
    hullTraumaCurrent:     0,
    systemStrainCurrent:   0,
    defense: {
      fore:      v.defFore,
      aft:       v.defAft,
      port:      v.defPort,
      starboard: v.defStarboard,
    },
    weapons:        v.weapons,
    revealed:       false,
    alignment,
    token_image_url: tokenImageUrl ?? null,
  }
}
