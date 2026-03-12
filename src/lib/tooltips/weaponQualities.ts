/** Static tooltip content for FFG/Genesys weapon qualities */

export interface QualityTooltip {
  name:   string
  rule:   string
  effect: string
}

export const QUALITY_TIPS: Record<string, QualityTooltip> = {
  PIERCE: {
    name:   'Pierce',
    rule:   'Pierce X',
    effect: 'Each hit reduces the target\'s Soak by X when calculating damage. Spending a Triumph can activate Pierce on weapons that don\'t have it.',
  },
  STUN_SETTING: {
    name:   'Stun Setting',
    rule:   'Stun Setting',
    effect: 'This weapon can be switched to deal Stun damage instead of Wounds. Stun damage fills Strain and cannot kill. Switch modes with a maneuver.',
  },
  STUN: {
    name:   'Stun',
    rule:   'Stun X',
    effect: 'Successful hits deal X Strain to the target in addition to any other damage. This Strain is dealt regardless of whether the attack hits or misses.',
  },
  CUMBERSOME: {
    name:   'Cumbersome',
    rule:   'Cumbersome X',
    effect: 'Requires a Brawn of X or higher to wield without penalty. Each point of Brawn below X adds a Setback die (black) to all attack checks.',
  },
  AUTO_FIRE: {
    name:   'Auto-fire',
    rule:   'Auto-fire',
    effect: 'Spend 3 Advantage to activate. Makes additional hits on other enemies in medium range. Each additional hit costs 2 Advantage and deals base weapon damage.',
  },
  VICIOUS: {
    name:   'Vicious',
    rule:   'Vicious X',
    effect: 'Add X×10 to any Critical Injury result rolled with this weapon. The higher the result, the more severe the injury.',
  },
  SLOW_FIRING: {
    name:   'Slow-Firing',
    rule:   'Slow-Firing X',
    effect: 'After firing, the weapon cannot be fired again for X rounds. The wielder may spend a maneuver each round to reduce the count.',
  },
  ACCURATE: {
    name:   'Accurate',
    rule:   'Accurate X',
    effect: 'Add X Boost dice (blue) to all attack checks made with this weapon. Precision engineering makes it easier to land shots.',
  },
  INACCURATE: {
    name:   'Inaccurate',
    rule:   'Inaccurate X',
    effect: 'Add X Setback dice (black) to all attack checks made with this weapon.',
  },
  BLAST: {
    name:   'Blast',
    rule:   'Blast X',
    effect: 'On a successful hit, spend 2 Advantage or a Triumph to deal X damage to all characters in short range of the target.',
  },
  BREACH: {
    name:   'Breach',
    rule:   'Breach X',
    effect: 'Ignores X points of the target\'s armor rating. Effectively reduces armor soak by X×10 (vehicle scale). Devastating against heavy armor.',
  },
  BURN: {
    name:   'Burn',
    rule:   'Burn X',
    effect: 'Spend 2 Advantage to set the target on fire. They suffer X damage at the start of each round until they or an ally extinguishes the flames (action).',
  },
  CONCUSSIVE: {
    name:   'Concussive',
    rule:   'Concussive X',
    effect: 'Spend 2 Advantage to disorient the target for X rounds. A disoriented character adds a Setback die to all checks.',
  },
  CORTOSIS: {
    name:   'Cortosis',
    rule:   'Cortosis',
    effect: 'Lightsabers that strike this weapon are deactivated for 1 round. The weapon itself is not damaged. A rare and prized quality.',
  },
  DEFENSIVE: {
    name:   'Defensive',
    rule:   'Defensive X',
    effect: 'While wielding this weapon, add X to your melee defense. Does not stack with itself but does stack with Deflect and other defense sources.',
  },
  DEFLECTION: {
    name:   'Deflection',
    rule:   'Deflection X',
    effect: 'While wielding this weapon, add X to your ranged defense.',
  },
  DISORIENT: {
    name:   'Disorient',
    rule:   'Disorient X',
    effect: 'Spend 2 Advantage to disorient the target for X rounds, adding a Setback die to all their checks.',
  },
  ENSNARE: {
    name:   'Ensnare',
    rule:   'Ensnare X',
    effect: 'Spend 2 Advantage to immobilize the target for X rounds. They cannot move and add a Setback die to all checks. An action frees them.',
  },
  GUIDED: {
    name:   'Guided',
    rule:   'Guided X',
    effect: 'After firing, the operator can spend a maneuver guiding the projectile. Makes a Computers or Piloting check with Difficulty X to redirect mid-flight.',
  },
  KNOCKDOWN: {
    name:   'Knockdown',
    rule:   'Knockdown',
    effect: 'Spend 2 Advantage to knock the target prone. A prone character suffers a Setback die on ranged attacks and opponents gain Boost dice in melee.',
  },
  LINKED: {
    name:   'Linked',
    rule:   'Linked X',
    effect: 'Spend 1 Advantage for each extra hit after the first (up to X). Each hit deals base damage. Powerful in sustained fire situations.',
  },
  PREPARE: {
    name:   'Prepare',
    rule:   'Prepare X',
    effect: 'Requires X maneuvers to ready before each attack. You cannot fire the weapon until fully prepared. Powerful but demands patience.',
  },
  REINFORCED: {
    name:   'Reinforced',
    rule:   'Reinforced',
    effect: 'This weapon cannot be disarmed unless the attacker spends a Triumph. Specially constructed grips and locks prevent removal.',
  },
  STAGGERING: {
    name:   'Staggering',
    rule:   'Staggering X',
    effect: 'Spend 2 Advantage to stagger the target for X rounds. Staggered characters cannot perform actions (only free actions and maneuvers).',
  },
  SUNDER: {
    name:   'Sunder',
    rule:   'Sunder',
    effect: 'Spend 2 Advantage to damage the target\'s weapon or armor. Damaged items add a Setback die to checks. Destroyed items are unusable.',
  },
  SUPERIOR: {
    name:   'Superior',
    rule:   'Superior',
    effect: 'This weapon grants 1 automatic Advantage on all attacks. Mastercraft craftsmanship at its finest.',
  },
  TRACTOR: {
    name:   'Tractor',
    rule:   'Tractor X',
    effect: 'On a hit, spend 2 Advantage to tractor lock. The target ship is held fast; pilot must beat the lock with Piloting vs Difficulty X or remain immobile.',
  },
  UNWIELDY: {
    name:   'Unwieldy',
    rule:   'Unwieldy X',
    effect: 'Requires Agility X or higher. Each point of Agility below X adds a Setback die to all attacks with this weapon.',
  },
  LIMITED_AMMO: {
    name:   'Limited Ammo',
    rule:   'Limited Ammo X',
    effect: 'This weapon has only X shots total. Once depleted it cannot be reloaded in the field. Use wisely.',
  },
  ENGAGE: {
    name:   'Engage',
    rule:   'Engage',
    effect: 'Can only be used at engaged range. If the target moves out of engaged range, this weapon cannot be used until engaged again.',
  },
}

/** Look up a quality tooltip by its display name or key (case-insensitive).
 *  Handles numbered qualities like "Pierce 2" → strips trailing digit → "PIERCE" */
export function getQualityTip(key: string): QualityTooltip | undefined {
  const normalised = key.toUpperCase().replace(/[\s-]/g, '_').replace(/[^A-Z_]/g, '').replace(/_+$/, '')
  return QUALITY_TIPS[normalised]
}
