// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Weapon Handedness Utility
//
// Determines whether a weapon is one-handed or two-handed based on its skill
// key, with support for GM overrides. Used for loadout validation and dual
// wield detection.
// ═══════════════════════════════════════════════════════════════════════════

// Skill keys that are inherently one-handed
const ONE_HANDED_SKILLS = ['RANGLT', 'BRAWL']

// Skill keys that are inherently two-handed
const TWO_HANDED_SKILLS = ['RANGHVY', 'GUNN']

// MELEE weapon_keys that are one-handed by nature (Enc ≤2, no Cumbersome quality).
// Enc 0–1: daggers, knives, small blades, batons, whips
// Enc 2: swords, rapiers, sabres, clubs, truncheons that don't require two hands
// Excluded despite Enc 2: ELECTRONET (thrown net), ENERGYBUCK (shield), FUSCUT (tool), IONPIKE (pike)
const ONE_HANDED_MELEE_KEYS = new Set([
  // Enc 0–1
  'THNDRBOLT', 'AKRABDAG', 'BLADEBREAKER', 'BORNEURLASH', 'KNIFE',
  'CS12STUNMAST', 'ELECTPULSEDIS', 'ENTRENCHTOOL', 'KALDAGGER', 'M8KNIFE',
  'MMD18DAG', 'MOLSTILETTO', 'MSW12', 'NEURWHIP', 'OUROBLADE',
  'PARRDAGG', 'PARRVIBRO', 'PUNCHDAGGER', 'CRYOWHIP', 'OBSIDIANDAGGER',
  'SNAPBATON', 'STVIBKN', 'VIBKN', 'VIBRORANGMELEE',
  // Enc 2
  'CERBLADE', 'CUTLASSCOR', 'DIIRO', 'DUSKBLADE', 'EXPKNIFE',
  'FLASHSTICK', 'SHISBLADE', 'STUNBATON', 'STUNCLUB', 'SWORDCANE',
  'THERMCUTW', 'TRUNCH', 'TZ97SHOCKBATON', 'VIBROMACH', 'VIBRORAPIER', 'Z6RIOT',
])

export interface WeaponForLoadout {
  id?: string
  name: string
  skill_key: string
  weapon_key?: string | null
  is_one_handed_override?: boolean | null
  is_two_handed_override?: boolean | null
}

export interface LoadoutValidation {
  valid: boolean
  reason: string | null
}

export function getWeaponHandedness(weapon: {
  skill_key: string
  weapon_key?: string | null
  is_one_handed_override?: boolean | null
  is_two_handed_override?: boolean | null
}): 'one' | 'two' {
  // GM override takes highest priority
  if (weapon.is_one_handed_override === true) return 'one'
  if (weapon.is_two_handed_override === true) return 'two'

  // Auto-detect from skill
  if (ONE_HANDED_SKILLS.includes(weapon.skill_key)) return 'one'
  if (TWO_HANDED_SKILLS.includes(weapon.skill_key)) return 'two'

  // For MELEE, check the weapon key against known one-handed weapons
  if (weapon.skill_key === 'MELEE' && weapon.weapon_key && ONE_HANDED_MELEE_KEYS.has(weapon.weapon_key)) {
    return 'one'
  }

  // Default: two-handed
  return 'two'
}

export function canDualWield(weapon: Parameters<typeof getWeaponHandedness>[0]): boolean {
  return getWeaponHandedness(weapon) === 'one'
}

/**
 * Validates a set of weapons that would be simultaneously equipped.
 * Pass exactly the weapons that would be in the equipped set after the action.
 */
export function validateLoadout(equipped: WeaponForLoadout[]): LoadoutValidation {
  if (equipped.length <= 1) return { valid: true, reason: null }

  if (equipped.length > 2) {
    return {
      valid: false,
      reason: 'Cannot equip more than 2 weapons at once.',
    }
  }

  // Two weapons — both must be one-handed
  const twoHanded = equipped.filter(w => getWeaponHandedness(w) === 'two')

  if (twoHanded.length === 2) {
    return {
      valid: false,
      reason: 'Cannot equip two two-handed weapons simultaneously.',
    }
  }

  if (twoHanded.length === 1) {
    return {
      valid: false,
      reason: `${twoHanded[0].name} requires two hands. Stow your other weapon first.`,
    }
  }

  return { valid: true, reason: null }
}
