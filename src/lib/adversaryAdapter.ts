// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Adversary → Combat Check Adapter
//
// Converts an AdversaryInstance into the Character/CharacterWeapon/CharacterSkill
// stubs required by CombatCheckOverlay and its steps, so the GM can make combat
// rolls on behalf of any adversary without a real character row in the database.
// ═══════════════════════════════════════════════════════════════════════════

import type { AdversaryInstance, AdversaryWeapon } from './adversaries'
import type { Character, CharacterWeapon, CharacterSkill, RefWeapon, RefSkill } from './types'
import { resolveWeapon } from './resolve-weapon'

// Melee skill key used for opposed check lookup
const MELEE_DISPLAY_NAMES = ['Melee', 'Brawl', 'Lightsaber']

// ── Skill display-name → SWRPG skill key ─────────────────────────────────────
const SKILL_NAME_TO_KEY: Record<string, string> = {
  'Athletics':              'ATHL',
  'Brawl':                  'BRAWL',
  'Charm':                  'CHARM',
  'Coercion':               'COERC',
  'Computers':              'COMP',
  'Cool':                   'COOL',
  'Coordination':           'COORD',
  'Deception':              'DECEP',
  'Discipline':             'DISC',
  'Gunnery':                'GUNN',
  'Leadership':             'LEAD',
  'Lightsaber':             'LTSABER',
  'Mechanics':              'MECH',
  'Medicine':               'MED',
  'Melee':                  'MELEE',
  'Negotiation':            'NEG',
  'Perception':             'PERC',
  'Piloting (Planetary)':   'PILOTPL',
  'Piloting: Planetary':    'PILOTPL',
  'Piloting (Space)':       'PILOTSP',
  'Piloting: Space':        'PILOTSP',
  'Ranged (Heavy)':         'RANGHVY',
  'Ranged: Heavy':          'RANGHVY',
  'Ranged (Light)':         'RANGLT',
  'Ranged: Light':          'RANGLT',
  'Resilience':             'RESIL',
  'Skulduggery':            'SKUL',
  'Stealth':                'STEAL',
  'Streetwise':             'STRT',
  'Survival':               'SURV',
  'Vigilance':              'VIGIL',
  'Astrogation':            'ASTRO',
  'Knowledge: Core Worlds': 'KNOW_CW',
  'Knowledge: Education':   'KNOW_ED',
  'Knowledge: Lore':        'KNOW_LORE',
  'Knowledge: Outer Rim':   'KNOW_OR',
  'Knowledge: Underworld':  'KNOW_UW',
  'Knowledge: Warfare':     'KNOW_WAR',
  'Knowledge: Xenology':    'KNOW_XEN',
}

// Reverse map: skill_key → display name (for building skillRanks from CharacterSkill[])
const SKILL_NAME_TO_KEY_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(SKILL_NAME_TO_KEY).map(([name, key]) => [key, name])
)

// ── Skill key → governing characteristic 2-letter key ────────────────────────
const SKILL_KEY_TO_CHAR: Record<string, string> = {
  'ATHL':      'BR',
  'BRAWL':     'BR',
  'LTSABER':   'BR',
  'MELEE':     'BR',
  'RESIL':     'BR',
  'COORD':     'AG',
  'GUNN':      'AG',
  'PILOTPL':   'AG',
  'PILOTSP':   'AG',
  'RANGHVY':   'AG',
  'RANGLT':    'AG',
  'STEAL':     'AG',
  'ASTRO':     'INT',
  'COMP':      'INT',
  'MECH':      'INT',
  'MED':       'INT',
  'KNOW_CW':   'INT',
  'KNOW_ED':   'INT',
  'KNOW_LORE': 'INT',
  'KNOW_OR':   'INT',
  'KNOW_UW':   'INT',
  'KNOW_WAR':  'INT',
  'KNOW_XEN':  'INT',
  'DECEP':     'CUN',
  'PERC':      'CUN',
  'SKUL':      'CUN',
  'STRT':      'CUN',
  'SURV':      'CUN',
  'COERC':     'WIL',
  'DISC':      'WIL',
  'VIGIL':     'WIL',
  'CHARM':     'PR',
  'COOL':      'PR',
  'LEAD':      'PR',
  'NEG':       'PR',
}

// Ranged (Heavy) weapon name fragments — checked before RANGLT to avoid false matches
const RANGHVY_NAME_FRAGMENTS = [
  'blaster rifle', 'heavy blaster pistol', 'heavy blaster rifle',
  'repeating blaster', 'sniper rifle', 'hunting rifle',
]

// Ranged (Light) weapon name fragments — catch-all for remaining ranged weapons
const RANGLT_NAME_FRAGMENTS = [
  'blaster', 'pistol', 'carbine', 'holdout', 'sporting blaster',
  'bowcaster', 'disruptor', 'slugthrower', 'grenade', 'launcher',
]

// Name fragments that indicate Brawl skill (engaged-range natural weapons)
const BRAWL_FRAGMENTS = [
  'fist', 'claw', 'bite', 'teeth', 'headbutt', 'stomp', 'trample',
  'tail', 'stinger', 'horn', 'tusk', 'paw', 'tentacle', 'slam', 'gore',
]

function weaponSkillKey(w: AdversaryWeapon): string {
  const range = (w.range ?? '').toLowerCase()
  const name  = (w.name  ?? '').toLowerCase()
  const cat   = (w.skillCategory ?? '').toLowerCase()

  // Use explicit skill category parsed from weapon string (most reliable)
  if (cat) {
    if (cat.includes('ranged') && (cat.includes('heavy') || cat.includes('hvy'))) return 'RANGHVY'
    if (cat.includes('gunnery'))   return 'GUNN'
    if (cat.includes('ranged'))    return 'RANGLT'
    if (cat.includes('brawl'))     return 'BRAWL'
    if (cat.includes('melee'))     return 'MELEE'
  }

  if (range !== 'engaged' && range !== '') {
    // Ranged weapon inferred from explicit range band
    if (name.includes('repeating blaster') || name.includes('heavy blaster rifle')) return 'RANGHVY'
    if (name.includes('gunnery') || name.includes('cannon') || name.includes('turret')) return 'GUNN'
    return 'RANGLT'
  }

  // No skill category and range is Engaged — try name-based heuristics before defaulting to Melee.
  // Check RANGHVY before RANGLT so "heavy blaster pistol" doesn't match the 'blaster' catch-all first.
  if (RANGHVY_NAME_FRAGMENTS.some(f => name.includes(f))) return 'RANGHVY'
  if (RANGLT_NAME_FRAGMENTS.some(f  => name.includes(f))) return 'RANGLT'

  // Engaged-range — Brawl for natural weapons, Melee for manufactured
  if (BRAWL_FRAGMENTS.some(f => name.includes(f))) return 'BRAWL'
  return 'MELEE'
}

function rangeToRangeValue(range: string): string {
  switch ((range ?? '').toLowerCase()) {
    case 'short':   return 'wrShort'
    case 'medium':  return 'wrMedium'
    case 'long':    return 'wrLong'
    case 'extreme': return 'wrExtreme'
    default:        return 'wrEngaged'
  }
}

function resolveWeaponDamage(w: AdversaryWeapon, _brawn: number): { damage: number; damage_add?: number } {
  // Fixed numeric damage (non-zero): flat value, not brawn-scaled
  if (typeof w.damage === 'number' && w.damage !== 0) {
    return { damage: w.damage }
  }
  // Brawn-scaled string "Brawn+N": separate out the bonus from brawn
  if (typeof w.damage === 'string') {
    const m = w.damage.match(/^Brawn([+-]\d+)$/i)
    if (m) return { damage: 0, damage_add: parseInt(m[1]) }
    const plain = parseInt(w.damage)
    if (!isNaN(plain)) return { damage: plain }
  }
  // Fallback: treat as Brawn+0 (name-only or unrecognised weapon)
  return { damage: 0, damage_add: 0 }
}

// ── Public output type ────────────────────────────────────────────────────────

export interface AdversaryAdapterResult {
  character:    Character
  charWeapons:  CharacterWeapon[]
  charSkills:   CharacterSkill[]
  refWeaponMap: Record<string, RefWeapon>
  refSkillMap:  Record<string, RefSkill>
}

/**
 * Convert an AdversaryInstance into the stubs required by CombatCheckOverlay.
 * All IDs are synthetic — nothing is persisted to the database.
 */
export function adaptAdversaryForCombatCheck(
  adv: AdversaryInstance,
  campaignId: string,
): AdversaryAdapterResult {
  const brawn = adv.characteristics.brawn

  // ── Character stub ────────────────────────────────────────────────────────
  const character: Character = {
    id:              adv.instanceId,
    campaign_id:     campaignId,
    player_id:       'gm',
    name:            adv.name,
    species_key:     '',
    career_key:      '',
    brawn:           adv.characteristics.brawn,
    agility:         adv.characteristics.agility,
    intellect:       adv.characteristics.intellect,
    cunning:         adv.characteristics.cunning,
    willpower:       adv.characteristics.willpower,
    presence:        adv.characteristics.presence,
    wound_threshold: adv.woundThreshold,
    wound_current:   adv.woundsCurrent ?? 0,
    strain_threshold: adv.strainThreshold ?? 10,
    strain_current:  0,
    soak:            adv.soak,
    defense_ranged:  adv.defense.ranged,
    defense_melee:   adv.defense.melee,
    xp_total:        0,
    xp_available:    0,
    credits:         0,
    encumbrance_threshold: 0,
    backstory:       '',
    notes:           '',
    created_at:      '',
    updated_at:      '',
  }

  // ── Weapons ────────────────────────────────────────────────────────────────
  const charWeapons: CharacterWeapon[] = []
  const refWeaponMap: Record<string, RefWeapon> = {}
  const refSkillMap:  Record<string, RefSkill>  = {}

  adv.weapons.forEach((w, i) => {
    const weaponKey = `adv-${adv.instanceId}-w${i}`
    const skillKey  = weaponSkillKey(w)
    const charKey   = SKILL_KEY_TO_CHAR[skillKey] ?? 'BR'
    const { damage, damage_add } = resolveWeaponDamage(w, brawn)

    const { crit: resolvedCrit } = resolveWeapon(w, brawn, {})

    charWeapons.push({
      id:           weaponKey,
      character_id: adv.instanceId,
      weapon_key:   weaponKey,
      custom_name:  w.name,
      is_equipped:  true,
      equip_state:  'equipped',
      attachments:  [],
    })

    refWeaponMap[weaponKey] = {
      key:          weaponKey,
      name:         w.name,
      skill_key:    skillKey,
      damage,
      damage_add,
      crit:         resolvedCrit ?? 4,
      range_value:  rangeToRangeValue(w.range ?? 'Engaged'),
      encumbrance:  0,
      hard_points:  0,
      price:        0,
      rarity:       0,
      restricted:   false,
    }

    if (!refSkillMap[skillKey]) {
      refSkillMap[skillKey] = {
        key:                skillKey,
        name:               skillKey,
        characteristic_key: charKey,
        type:               'stCombat',
      }
    }
  })

  // ── Skills from skillRanks ────────────────────────────────────────────────
  const charSkills: CharacterSkill[] = []
  const seenKeys = new Set<string>()

  for (const [displayName, rank] of Object.entries(adv.skillRanks)) {
    const skillKey = SKILL_NAME_TO_KEY[displayName]
    if (!skillKey || seenKeys.has(skillKey)) continue
    seenKeys.add(skillKey)

    // For minion groups, effective rank = groupRemaining - 1 (min 0)
    const effectiveRank = adv.type === 'minion'
      ? Math.max(0, (adv.groupRemaining ?? 1) - 1)
      : rank

    charSkills.push({
      id:           `adv-skill-${adv.instanceId}-${skillKey}`,
      character_id: adv.instanceId,
      skill_key:    skillKey,
      rank:         effectiveRank,
      is_career:    false,
    })

    if (!refSkillMap[skillKey]) {
      refSkillMap[skillKey] = {
        key:                skillKey,
        name:               displayName,
        characteristic_key: SKILL_KEY_TO_CHAR[skillKey] ?? 'BR',
        type:               'stCombat',
      }
    }
  }

  return { character, charWeapons, charSkills, refWeaponMap, refSkillMap }
}

/**
 * Convert player Characters into AdversaryInstance stubs for use as combat
 * targets when the GM is attacking on behalf of an adversary.
 *
 * @param skillsByChar - optional map of characterId → CharacterSkill[]; when
 *   provided, populates skillRanks so melee opposed checks use the real ranks.
 */
export function charactersToAdversaryStubs(
  characters: Character[],
  skillsByChar?: Record<string, CharacterSkill[]>,
): AdversaryInstance[] {
  return characters.map(char => {
    const skillRanks: Record<string, number> = {}

    if (skillsByChar?.[char.id]) {
      for (const cs of skillsByChar[char.id]) {
        // Map skill_key → display name so getMeleeDifficulty can find it by name
        const displayName = SKILL_NAME_TO_KEY_REVERSE[cs.skill_key]
        if (displayName) skillRanks[displayName] = cs.rank
      }
    }

    return {
      instanceId:      char.id,
      sourceId:        char.id,
      name:            char.name,
      type:            'rival' as const,
      groupSize:       1,
      groupRemaining:  1,
      revealed:        true,
      characteristics: {
        brawn:     char.brawn,
        agility:   char.agility,
        intellect: char.intellect,
        cunning:   char.cunning,
        willpower: char.willpower,
        presence:  char.presence,
      },
      soak:            char.soak ?? char.brawn,
      woundThreshold:  char.wound_threshold,
      strainThreshold: char.strain_threshold,
      defense:         { melee: char.defense_melee ?? 0, ranged: char.defense_ranged ?? 0 },
      skills:          MELEE_DISPLAY_NAMES,
      skillRanks,
      talents:         [],
      abilities:       [],
      weapons:         [],
      gear:            [],
      woundsCurrent:   char.wound_current,
    }
  })
}
