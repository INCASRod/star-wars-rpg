'use client'

import { getSkillPool, applyModifiers } from '@/components/player-hud/dice-engine'
import type { Character, CharacterWeapon, CharacterSkill, RefWeapon, RefSkill, SpeciesAbility } from '@/lib/types'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { RangeBand, DualWieldPoolResult } from '@/lib/combatCheckUtils'
import {
  getRangedDifficulty, getMeleeDifficulty, getDualWieldPool,
  RANGE_VALUE_MAP, CHAR_FIELD_MAP,
} from '@/lib/combatCheckUtils'
import { useEffect } from 'react'

// Re-exported so existing `import type { ManualAdjustments } from
// '.../DicePoolReviewStep'` call sites keep working — the type now lives in
// dice-engine.ts so both panels (and applyModifiers) share one declaration.
import type { ManualAdjustments } from '@/components/player-hud/dice-engine'
export type { ManualAdjustments } from '@/components/player-hud/dice-engine'
export { EMPTY_ADJUSTMENTS } from '@/components/player-hud/dice-engine'

export interface DualWieldState {
  enabled:         boolean
  primaryWeapon:   CharacterWeapon
  secondaryWeapon: CharacterWeapon
}

interface DicePoolReviewStepProps {
  attackType:      'ranged' | 'melee'
  character:       Character
  weapon:          CharacterWeapon | null
  refWeapon:       RefWeapon | null
  refSkill:        RefSkill | null
  charSkills:      CharacterSkill[]
  targets:         AdversaryInstance[]
  rangeBand:       RangeBand | null
  skillModifiers:  Record<string, SkillDiceModifier>
  adjustments:     ManualAdjustments
  onAdjustChange:  (adj: ManualAdjustments) => void
  onPoolChange?:   (pool: Record<string, number>) => void
  /** When set, overrides standard pool calculation with dual wield rules */
  dualWield?:      DualWieldState | null
  refWeaponMap?:   Record<string, RefWeapon>
  refSkillMap?:    Record<string, RefSkill>
  speciesAbilities?: SpeciesAbility[]
  speciesName?:    string
}

export function DicePoolReviewStep({
  attackType, character, weapon, refWeapon, refSkill, charSkills,
  targets, rangeBand, skillModifiers, adjustments, onAdjustChange,
  dualWield, refWeaponMap, refSkillMap, speciesAbilities = [], speciesName,
  onPoolChange,
}: DicePoolReviewStepProps) {
  const isUnarmed = weapon?.id === '__unarmed__'
  const skillKey  = isUnarmed ? 'BRAWL' : (refWeapon?.skill_key ?? '')

  // ── Determine if dual wield mode is active ────────────────────────────────
  const isDualWield = dualWield?.enabled === true && refWeaponMap && refSkillMap

  // ── Standard pool (used when not dual wield) ──────────────────────────────
  const charKey  = refSkill?.characteristic_key
  const charVal  = charKey ? ((character[CHAR_FIELD_MAP[charKey] as keyof Character] as number) ?? 0) : (isUnarmed ? character.brawn : 0)
  const skillData = charSkills.find(s => s.skill_key === skillKey)
  const rank = skillData?.rank ?? 0
  const { proficiency: stdPro, ability: stdAbl } = getSkillPool(charVal, rank)

  // ── Dual wield pool calculation ───────────────────────────────────────────
  let dwPrimarySkillKey    = ''
  let dwSecondarySkillKey  = ''
  let dwPool: DualWieldPoolResult | null = null
  let dwPenaltyLabel       = ''
  let dwPrimarySkillLabel  = ''
  let dwSecondarySkillLabel = ''

  if (isDualWield && dualWield && refWeaponMap && refSkillMap) {
    const primaryRef   = refWeaponMap[dualWield.primaryWeapon.weapon_key]
    const secondaryRef = refWeaponMap[dualWield.secondaryWeapon.weapon_key]

    dwPrimarySkillKey   = primaryRef?.skill_key ?? ''
    dwSecondarySkillKey = secondaryRef?.skill_key ?? ''

    const primarySkillRef   = refSkillMap[dwPrimarySkillKey]
    const secondarySkillRef = refSkillMap[dwSecondarySkillKey]

    const primaryCharKey   = primarySkillRef?.characteristic_key ?? ''
    const secondaryCharKey = secondarySkillRef?.characteristic_key ?? ''

    const dwPrimaryCharVal   = primaryCharKey   ? ((character[CHAR_FIELD_MAP[primaryCharKey]   as keyof Character] as number) ?? 0) : 0
    const dwSecondaryCharVal = secondaryCharKey ? ((character[CHAR_FIELD_MAP[secondaryCharKey] as keyof Character] as number) ?? 0) : 0

    const dwPrimarySkillRank   = charSkills.find(s => s.skill_key === dwPrimarySkillKey)?.rank   ?? 0
    const dwSecondarySkillRank = charSkills.find(s => s.skill_key === dwSecondarySkillKey)?.rank ?? 0

    const primaryWeaponMaxRange   = primaryRef?.range_value   ? (RANGE_VALUE_MAP[primaryRef.range_value]   ?? 'extreme') : 'extreme'
    const secondaryWeaponMaxRange = secondaryRef?.range_value ? (RANGE_VALUE_MAP[secondaryRef.range_value] ?? 'extreme') : 'extreme'

    dwPool = getDualWieldPool(
      dwPrimarySkillKey, dwSecondarySkillKey,
      dwPrimaryCharVal, dwSecondaryCharVal,
      dwPrimarySkillRank, dwSecondarySkillRank,
      rangeBand, primaryWeaponMaxRange, secondaryWeaponMaxRange,
    )

    dwPenaltyLabel  = dwPool.sameSkill
      ? `+1 difficulty (same skill: ${primarySkillRef?.name ?? dwPrimarySkillKey})`
      : '+2 difficulty (different skills)'

    dwPrimarySkillLabel   = primarySkillRef?.name   ?? dwPrimarySkillKey
    dwSecondarySkillLabel = secondarySkillRef?.name ?? dwSecondarySkillKey
  }

  // ── Final pool values ─────────────────────────────────────────────────────
  let baseProf: number, baseAbl: number, baseDiff: number, baseChal: number

  if (isDualWield && dwPool) {
    // difficultyAdd is applied uniformly below via applyModifiers — do not
    // fold it into baseDiff here, or it would be applied twice.
    baseDiff = dwPool.difficulty
    baseChal = 0
    baseProf = dwPool.proficiency
    baseAbl  = dwPool.ability
  } else {
    baseProf = stdPro
    baseAbl  = stdAbl

    let difficultyDice = 0
    let challengeDice  = 0

    if (attackType === 'ranged' && rangeBand) {
      const result = getRangedDifficulty(rangeBand, skillKey, refWeapon?.range_value ? (RANGE_VALUE_MAP[refWeapon.range_value] ?? 'extreme') : 'extreme')
      difficultyDice = result.difficultyDice
      challengeDice  = result.challengeDice
    } else if (attackType === 'melee') {
      const result = getMeleeDifficulty(targets[0] ?? null)
      difficultyDice = result.difficultyDice
      challengeDice  = result.challengeDice
    }
    baseDiff = difficultyDice
    baseChal = challengeDice
  }

  // Talent bonuses (use primary skill key for dual wield)
  const activeSk       = isDualWield ? dwPrimarySkillKey : skillKey
  const talentMod: SkillDiceModifier | undefined = skillModifiers[activeSk]
  const talentBoost    = talentMod?.boostAdd ?? 0
  const talentSbRemove = talentMod?.setbackRemove ?? 0

  // Add step (difficultyAdd) then upgrade step (upgradeAbility/upgradeDifficulty),
  // then flat boost/setback/challenge/force additions — see applyModifiers.
  const finalPool = applyModifiers(
    { proficiency: baseProf, ability: baseAbl, difficulty: baseDiff, challenge: baseChal },
    adjustments,
    { talentBoost, talentSetbackRemove: talentSbRemove },
  )

  // Emit pool to parent (CombatCheckOverlay renders the Roll button)
  const { proficiency, ability, boost, difficulty, challenge, setback, force } = finalPool
  useEffect(() => {
    onPoolChange?.({ proficiency, ability, boost, difficulty, challenge, setback, force })
  }, [onPoolChange, proficiency, ability, boost, difficulty, challenge, setback, force])

  const adjFloors: Record<keyof ManualAdjustments, number> = {
    boostAdd:           -talentBoost,
    setbackAdd:         0,
    difficultyAdd:      -(baseDiff),
    challengeAdd:       -(baseChal),
    forceAdd:           0,
    abilityUpgrades:    0,
    difficultyUpgrades: 0,
  }
  function adj(key: keyof ManualAdjustments, delta: number) {
    const floor = adjFloors[key] ?? 0
    onAdjustChange({ ...adjustments, [key]: Math.max(floor, adjustments[key] + delta) })
  }



  // ── Headless calculator ────────────────────────────────────────────────────
  // Mounted inside a `display:'none'` wrapper by CombatCheckOverlay purely to
  // derive the pool and emit it through onPoolChange — the focus-console stage
  // rail owns every visible control now. The old rendered UI (context summary,
  // dice rows, AdjustControl steppers) never painted and has been removed,
  // along with the dead handleUpgradeCheck/handleDowngradeCheck pair. Pool
  // derivation, `adj`, `adjFloors` and the onPoolChange effect are untouched.
  return null
}
