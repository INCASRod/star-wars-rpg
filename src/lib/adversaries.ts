import { ABILITY_DESCRIPTIONS } from './adversary-abilities'
import { TALENT_DESCRIPTIONS, TALENT_ACTIVATION } from './adversary-talents'

// ── Lightsaber characteristic helpers ────────────────────────────────────────
/** Maps display name → short key (as used in ref_skills / DB) */
export const CHAR_NAME_TO_KEY: Record<string, string> = {
  'Brawn': 'BR', 'Agility': 'AGI', 'Intellect': 'INT',
  'Cunning': 'CUN', 'Willpower': 'WIL', 'Presence': 'PR',
}
/** Maps short key → display name */
export const CHAR_KEY_TO_NAME: Record<string, string> = {
  'BR': 'Brawn', 'AGI': 'Agility', 'INT': 'Intellect',
  'CUN': 'Cunning', 'WIL': 'Willpower', 'PR': 'Presence',
}
/** Maps short key → AdversaryInstance.characteristics field name */
export const CHAR_KEY_TO_FIELD: Record<string, string> = {
  'BR': 'brawn', 'AGI': 'agility', 'INT': 'intellect',
  'CUN': 'cunning', 'WIL': 'willpower', 'PR': 'presence',
}

export interface AdversaryWeapon {
  name: string
  damage: number | string
  range: string
  /** Skill category string extracted from the weapon's parenthetical, e.g. "Ranged [Light]" or "Melee [Engaged]" */
  skillCategory?: string
  qualities?: string[]
  special?: string
}

export interface AdversaryTalent {
  name: string
  description?: string
  activation?: string
}

export interface AdversaryGear {
  name: string
  encumbrance: string
  description: string
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
  /** Per-skill characteristic override. Only meaningful for 'Lightsaber'. Key = display skill name, value = short char key. */
  characteristicOverrides?: Record<string, string>
  talents?: AdversaryTalent[]
  abilities?: { name: string; description: string }[]
  weapons?: AdversaryWeapon[]
  gear?: AdversaryGear[]
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
  /** Per-skill characteristic override. Only meaningful for 'Lightsaber'. Key = display skill name, value = short char key. */
  characteristicOverrides?: Record<string, string>
  talents: AdversaryTalent[]
  abilities: { name: string; description: string }[]
  weapons: AdversaryWeapon[]
  gear: AdversaryGear[]
  woundsCurrent?: number
  strainCurrent?: number
  minionWounds?: number[]
  // Squad formation fields (rival/nemesis leaders only)
  squad_active?: boolean
  squad_minion_refs?: Array<{ instanceId: string; count: number }>
  squad_total_minions?: number
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

  let skillCategory: string | undefined
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
      const skillCatMatch = p.match(/^(Ranged|Melee)\s+\[([^\]]+)\]$/i)
      if (skillCatMatch) { skillCategory = p; continue }
      if (!p.match(/^Critical\s+\d+/i)) {
        qualities.push(p)
      }
    }
  }
  return { name, damage, range, skillCategory, qualities: qualities.length > 0 ? qualities : undefined }
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

  // Skills: rivals/nemeses use object { Cool: 4, Lightsaber (Intellect): 5 }, minions use string[]
  // For Lightsaber (X) entries: strip the parenthetical, normalise key to 'Lightsaber', record override.
  const skillRanks: Record<string, number> = {}
  const characteristicOverrides: Record<string, string> = {}
  if (raw.skills && !Array.isArray(raw.skills) && typeof raw.skills === 'object') {
    for (const [k, v] of Object.entries(raw.skills as Record<string, unknown>)) {
      const lsMatch = k.match(/^Lightsaber\s*\((\w+)\)$/i)
      if (lsMatch) {
        const charName = lsMatch[1]
        const charKey = CHAR_NAME_TO_KEY[charName as keyof typeof CHAR_NAME_TO_KEY]
        if (charKey && charKey !== 'BR') {
          characteristicOverrides['Lightsaber'] = charKey
        }
        skillRanks['Lightsaber'] = Number(v)
      } else {
        skillRanks[k] = Number(v)
      }
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
    characteristicOverrides: Object.keys(characteristicOverrides).length > 0 ? characteristicOverrides : undefined,
    talents: Array.isArray(raw.talents)
      ? raw.talents.map(t => {
          if (typeof t === 'string') {
            const base = t.replace(/\s+\d+$/, '').trim()
            const desc = TALENT_DESCRIPTIONS[t] ?? TALENT_DESCRIPTIONS[base] ?? ''
            const activation = TALENT_ACTIVATION[t] ?? TALENT_ACTIVATION[base] ?? 'passive'
            return { name: t, description: desc, activation }
          }
          const obj = t as AdversaryTalent
          const base = obj.name.replace(/\s+\d+$/, '').trim()
          return {
            ...obj,
            description: obj.description || TALENT_DESCRIPTIONS[obj.name] || TALENT_DESCRIPTIONS[base] || '',
            activation: obj.activation || TALENT_ACTIVATION[obj.name] || TALENT_ACTIVATION[base] || 'passive',
          }
        })
      : [],
    abilities: Array.isArray(raw.abilities)
      ? raw.abilities.map(ab => {
          if (typeof ab === 'string') {
            return { name: ab, description: ABILITY_DESCRIPTIONS[ab] ?? '' }
          }
          const obj = ab as { name: string; description: string }
          // Fill in description from lookup if the embedded one is empty
          return { name: obj.name, description: obj.description || ABILITY_DESCRIPTIONS[obj.name] || '' }
        })
      : [],
    weapons,
    gear: Array.isArray(raw.gear)
      ? raw.gear.map(g => typeof g === 'string'
          ? { name: g, encumbrance: '', description: '' }
          : g as AdversaryGear)
      : [],
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
    characteristicOverrides: adv.characteristicOverrides,
    talents: adv.talents ?? [],
    abilities: adv.abilities ?? [],
    weapons: adv.weapons ?? [],
    gear: adv.gear ?? [],
  }
}
