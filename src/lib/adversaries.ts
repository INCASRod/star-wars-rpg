export interface AdversaryWeapon {
  name: string
  damage: number | string
  range: string
  qualities?: string[]
  special?: string
}

export interface AdversaryTalent {
  name: string
  description?: string
  activation?: string
}

export interface Adversary {
  id: string
  name: string
  type: 'minion' | 'rival' | 'nemesis'
  description?: string
  brawn: number
  agility: number
  intellect: number
  cunning: number
  willpower: number
  presence: number
  soak: number
  wound: number         // wound threshold (or wounds per minion)
  strain?: number       // nemesis only
  defense: number[]     // [melee, ranged]
  skills?: string[]
  skillRanks: Record<string, number>   // { Cool: 4, Vigilance: 2 } — normalized from object or array
  talents?: AdversaryTalent[]
  abilities?: { name: string; description: string }[]
  weapons?: AdversaryWeapon[]
  // raw fields from API differ — normalize on fetch
  [key: string]: unknown
}

export interface AdversaryInstance {
  instanceId: string
  sourceId: string
  name: string
  type: 'minion' | 'rival' | 'nemesis'
  groupSize: number
  groupRemaining: number
  revealed: boolean
  characteristics: {
    brawn: number; agility: number; intellect: number
    cunning: number; willpower: number; presence: number
  }
  soak: number
  woundThreshold: number
  strainThreshold?: number
  defense: { melee: number; ranged: number }
  skills: unknown[]
  skillRanks: Record<string, number>   // normalized skill ranks for dice pool building
  talents: AdversaryTalent[]
  abilities: { name: string; description: string }[]
  weapons: AdversaryWeapon[]
  woundsCurrent?: number
  minionWounds?: number[]
}

const ADVERSARY_URL = '/adversaries.json'

// Parse weapon string from new repo format:
// "Blaster pistol (Ranged [Light]; Damage 5; Critical 3; Range [Medium]; Stun setting)"
// "Claws (Brawn+2; Critical 4; Range [Engaged]; Knockdown)"
function parseWeaponString(raw: string): AdversaryWeapon {
  const name = raw.replace(/\s*\(.*/, '').trim() || raw
  let damage: number | string = 0
  let range = 'Engaged'
  const qualities: string[] = []

  const parenMatch = raw.match(/\(([^)]+)\)/)
  if (parenMatch) {
    for (const part of parenMatch[1].split(/;\s*/)) {
      const p = part.trim()
      const dmgMatch = p.match(/^Damage\s+(\d+)$/i)
      if (dmgMatch) { damage = parseInt(dmgMatch[1]); continue }
      const brawnMatch = p.match(/^Brawn([+-]\d+)$/i)
      if (brawnMatch) { damage = `Brawn${brawnMatch[1]}`; continue }
      const rangeMatch = p.match(/^Range\s+\[([^\]]+)\]$/i)
      if (rangeMatch) { range = rangeMatch[1]; continue }
      if (!p.match(/^Critical\s+\d+/i) && !p.match(/^(Ranged|Melee)\s+\[/i)) {
        qualities.push(p)
      }
    }
  }
  return { name, damage, range, qualities: qualities.length > 0 ? qualities : undefined }
}

// Normalize raw API data to our Adversary type
// Handles both old format (flat lowercase keys) and new repo format (characteristics object + derived object)
function normalize(raw: Record<string, unknown>): Adversary {
  const chars = (raw.characteristics as Record<string, unknown>) ?? {}
  const derived = (raw.derived as Record<string, unknown>) ?? {}

  // Characteristics: new format uses capitalized keys inside characteristics{}; old format uses flat lowercase
  const stat = (key: string) =>
    Number(chars[key] ?? chars[key[0].toUpperCase() + key.slice(1)] ?? raw[key] ?? 2)

  const defense = Array.isArray(raw.defense) ? raw.defense as number[]
    : typeof raw.defense === 'object' && raw.defense
      ? [Number((raw.defense as Record<string, unknown>).melee ?? 0), Number((raw.defense as Record<string, unknown>).ranged ?? 0)]
      : [0, 0]

  const typeRaw = String(raw.type ?? '').toLowerCase()
  const type = (['minion', 'rival', 'nemesis'].includes(typeRaw) ? typeRaw : 'rival') as Adversary['type']

  // Weapons: new format is string[], old format is AdversaryWeapon[]
  const weapons = Array.isArray(raw.weapons)
    ? raw.weapons.map(w => typeof w === 'string' ? parseWeaponString(w) : w as AdversaryWeapon)
    : []

  // Skills: rivals/nemeses use object { Cool: 4, Vigilance: 2 }, minions use string[] (rank=1 each)
  const skillRanks: Record<string, number> = {}
  if (raw.skills && !Array.isArray(raw.skills) && typeof raw.skills === 'object') {
    for (const [k, v] of Object.entries(raw.skills as Record<string, unknown>)) {
      skillRanks[k] = Number(v)
    }
  } else if (Array.isArray(raw.skills)) {
    for (const s of raw.skills as string[]) { skillRanks[String(s)] = 1 }
  }

  return {
    ...raw,
    id: String(raw.id ?? raw.name ?? Math.random()),
    name: String(raw.name ?? 'Unknown'),
    type,
    brawn:     stat('brawn'),
    agility:   stat('agility'),
    intellect: stat('intellect'),
    cunning:   stat('cunning'),
    willpower: stat('willpower'),
    presence:  stat('presence'),
    soak:      Number(derived.soak ?? raw.soak ?? 0),
    wound:     Number(derived.wounds ?? derived.wound ?? raw.wound ?? raw.wounds ?? raw.woundThreshold ?? 10),
    strain:    derived.strain !== undefined ? Number(derived.strain) : raw.strain !== undefined ? Number(raw.strain) : undefined,
    defense,
    skills:     Array.isArray(raw.skills) ? raw.skills as string[] : Object.keys(skillRanks),
    skillRanks,
    talents:   Array.isArray(raw.talents) ? raw.talents as AdversaryTalent[] : [],
    abilities: Array.isArray(raw.abilities)
      ? raw.abilities.map(ab => typeof ab === 'string' ? { name: ab, description: '' } : ab as { name: string; description: string })
      : [],
    weapons,
  }
}

let _cache: Adversary[] | null = null

export async function fetchAdversaries(): Promise<Adversary[]> {
  if (_cache) return _cache
  const res = await fetch(ADVERSARY_URL)
  if (!res.ok) throw new Error(`Failed to fetch adversaries: ${res.status}`)
  const raw = await res.json() as Record<string, unknown>[]
  _cache = raw.map(normalize)
  return _cache
}

export function adversaryToInstance(adv: Adversary, groupSize = 4): AdversaryInstance {
  return {
    instanceId: `${adv.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sourceId: adv.id,
    name: adv.name,
    type: adv.type,
    groupSize: adv.type === 'minion' ? groupSize : 1,
    groupRemaining: adv.type === 'minion' ? groupSize : 1,
    revealed: false,
    characteristics: {
      brawn: adv.brawn, agility: adv.agility, intellect: adv.intellect,
      cunning: adv.cunning, willpower: adv.willpower, presence: adv.presence,
    },
    soak: adv.soak,
    woundThreshold: adv.wound,
    strainThreshold: adv.strain,
    defense: {
      melee:  Array.isArray(adv.defense) ? (adv.defense[0] ?? 0) : 0,
      ranged: Array.isArray(adv.defense) ? (adv.defense[1] ?? 0) : 0,
    },
    skills: adv.skills ?? [],
    skillRanks: adv.skillRanks ?? {},
    talents: adv.talents ?? [],
    abilities: adv.abilities ?? [],
    weapons: adv.weapons ?? [],
  }
}
