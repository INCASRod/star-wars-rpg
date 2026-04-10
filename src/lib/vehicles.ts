import type { AdversaryInstance } from './adversaries'

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
    weapons: v.weapons.map(w => ({
      name:     `${w.count > 1 ? `${w.count}× ` : ''}${w.weaponKey}${w.turret ? ' (Turret)' : ''}`,
      damage:   0,
      range:    'Short',
      qualities: w.qualities.map(q => `${q.key}${q.count > 1 ? ` ${q.count}` : ''}`),
    })),
    gear:      [],
    _isVehicle: true,
  } as AdversaryInstance & { _isVehicle: true }
}
