'use client'

export const MELEE_SKILL_KEYS = ['MELEE', 'BRAWL', 'LTSABER'] as const

export function isMeleeSkill(skillKey: string | null | undefined): boolean {
  return MELEE_SKILL_KEYS.includes((skillKey ?? '') as typeof MELEE_SKILL_KEYS[number])
}

export interface WeaponDamageInfo {
  /** Weapon base damage (damage_add for brawn-scaled melee, damage for fixed/ranged) */
  baseDamage: number
  /** True → render "base+brawn (total)"; False → render flat number */
  isMelee:    boolean
  /** Character Brawn — only relevant when isMelee=true */
  brawn:      number
}

/** Renders weapon damage inline.
 *  Brawn-scaled melee: `base+brawn (total)` — e.g. "3+2 (5)"
 *  Fixed / ranged: flat number — e.g. "9" */
export function WeaponDamageDisplay({ baseDamage, isMelee, brawn }: WeaponDamageInfo) {
  if (!isMelee) return <>{baseDamage}</>
  const total = baseDamage + brawn
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2 }}>
      <span>{baseDamage}+{brawn}</span>
      <span style={{
        fontFamily: "'Share Tech Mono','Courier New',monospace",
        fontSize:   '0.75em',
        opacity:    0.6,
        marginLeft: 1,
      }}>({total})</span>
    </span>
  )
}

/** Build WeaponDamageInfo from raw ref_weapons fields. */
export function buildWeaponDamageInfo(
  skillKey:   string | null | undefined,
  damage:     number | null | undefined,
  damage_add: number | null | undefined,
  brawn:      number,
): WeaponDamageInfo {
  const isMeleeWeapon = isMeleeSkill(skillKey)
  const hasBrawnScale = isMeleeWeapon && damage_add != null
  return {
    baseDamage: hasBrawnScale ? (damage_add ?? 0) : (damage ?? 0),
    isMelee:    hasBrawnScale,
    brawn:      hasBrawnScale ? brawn : 0,
  }
}
