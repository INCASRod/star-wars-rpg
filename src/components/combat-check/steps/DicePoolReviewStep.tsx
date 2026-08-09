'use client'

import { getSkillPool } from '@/components/player-hud/dice-engine'
import type { Character, CharacterWeapon, CharacterSkill, RefWeapon, RefSkill, SpeciesAbility } from '@/lib/types'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { RangeBand } from '@/lib/combatCheckUtils'
import {
  getRangedDifficulty, getMeleeDifficulty,
  RANGE_VALUE_MAP, CHAR_FIELD_MAP,
} from '@/lib/combatCheckUtils'
import { useEffect } from 'react'



export interface ManualAdjustments {
  boostAdd:           number
  setbackAdd:         number
  difficultyAdd:      number
  challengeAdd:       number  // direct challenge-die adjustments (upgrade/downgrade buttons)
  forceAdd:           number  // Force dice added to the check (Force talents/powers)
  abilityUpgrades:    number
  difficultyUpgrades: number
}

export const EMPTY_ADJUSTMENTS: ManualAdjustments = {
  boostAdd: 0, setbackAdd: 0, difficultyAdd: 0, challengeAdd: 0, forceAdd: 0,
  abilityUpgrades: 0, difficultyUpgrades: 0,
}

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
  let dwUsedSkillRank      = 0
  let dwUsedChar           = 0
  let dwBaseDifficulty     = 0
  let dwPenaltyLabel       = ''
  let dwPrimarySkillLabel  = ''
  let dwSecondarySkillLabel = ''
  let dwPrimarySkillRank   = 0
  let dwSecondarySkillRank = 0
  let dwPrimaryCharVal     = 0
  let dwSecondaryCharVal   = 0

  if (isDualWield && dualWield && refWeaponMap && refSkillMap) {
    const primaryRef   = refWeaponMap[dualWield.primaryWeapon.weapon_key]
    const secondaryRef = refWeaponMap[dualWield.secondaryWeapon.weapon_key]

    dwPrimarySkillKey   = primaryRef?.skill_key ?? ''
    dwSecondarySkillKey = secondaryRef?.skill_key ?? ''

    const primarySkillRef   = refSkillMap[dwPrimarySkillKey]
    const secondarySkillRef = refSkillMap[dwSecondarySkillKey]

    const primaryCharKey   = primarySkillRef?.characteristic_key ?? ''
    const secondaryCharKey = secondarySkillRef?.characteristic_key ?? ''

    dwPrimaryCharVal   = primaryCharKey   ? ((character[CHAR_FIELD_MAP[primaryCharKey]   as keyof Character] as number) ?? 0) : 0
    dwSecondaryCharVal = secondaryCharKey ? ((character[CHAR_FIELD_MAP[secondaryCharKey] as keyof Character] as number) ?? 0) : 0

    dwPrimarySkillRank   = charSkills.find(s => s.skill_key === dwPrimarySkillKey)?.rank   ?? 0
    dwSecondarySkillRank = charSkills.find(s => s.skill_key === dwSecondarySkillKey)?.rank ?? 0

    dwUsedSkillRank = Math.min(dwPrimarySkillRank, dwSecondarySkillRank)
    dwUsedChar      = Math.min(dwPrimaryCharVal,   dwSecondaryCharVal)

    const primaryWeaponMaxRange   = primaryRef?.range_value   ? (RANGE_VALUE_MAP[primaryRef.range_value]   ?? 'extreme') : 'extreme'
    const secondaryWeaponMaxRange = secondaryRef?.range_value ? (RANGE_VALUE_MAP[secondaryRef.range_value] ?? 'extreme') : 'extreme'

    const primaryDiff   = rangeBand ? getRangedDifficulty(rangeBand, dwPrimarySkillKey,   primaryWeaponMaxRange)   : { difficultyDice: 0 }
    const secondaryDiff = rangeBand ? getRangedDifficulty(rangeBand, dwSecondarySkillKey, secondaryWeaponMaxRange) : { difficultyDice: 0 }
    dwBaseDifficulty = Math.max(primaryDiff.difficultyDice, secondaryDiff.difficultyDice)

    const sameSkill = dwPrimarySkillKey === dwSecondarySkillKey
    dwPenaltyLabel  = sameSkill
      ? `+1 difficulty (same skill: ${primarySkillRef?.name ?? dwPrimarySkillKey})`
      : '+2 difficulty (different skills)'

    dwPrimarySkillLabel   = primarySkillRef?.name   ?? dwPrimarySkillKey
    dwSecondarySkillLabel = secondarySkillRef?.name ?? dwSecondarySkillKey
  }

  // ── Final pool values ─────────────────────────────────────────────────────
  let baseProf: number, baseAbl: number, baseDiff: number, baseChal: number

  if (isDualWield) {
    const { proficiency, ability } = getSkillPool(dwUsedChar, dwUsedSkillRank)
    const sameSkill = dwPrimarySkillKey === dwSecondarySkillKey
    baseDiff = dwBaseDifficulty + (sameSkill ? 1 : 2) + adjustments.difficultyAdd
    baseChal = 0
    baseProf = proficiency
    baseAbl  = ability
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

  // Apply ability upgrades — AoE Core p.24 "Upgrading Dice": each upgrade turns
  // an Ability die into a Proficiency die; if none remain, one Ability die is
  // ADDED first and the next upgrade converts it. Net effect for N upgrades
  // against A available: Proficiency +N, Ability -min(N, A). Previously the
  // upgrade count was clamped to the available dice, so upgrading past the
  // pool's ability dice silently did nothing.
  const upgrades = Math.min(adjustments.abilityUpgrades, baseAbl)
  const finalPro = baseProf + adjustments.abilityUpgrades
  const finalAbl = baseAbl - upgrades

  // Talent bonuses (use primary skill key for dual wield)
  const activeSk       = isDualWield ? dwPrimarySkillKey : skillKey
  const talentMod: SkillDiceModifier | undefined = skillModifiers[activeSk]
  const talentBoost    = talentMod?.boostAdd ?? 0
  const talentSbRemove = talentMod?.setbackRemove ?? 0

  // Apply difficulty upgrades — same rule, mirrored (AoE Core p.24, "Upgrade
  // Versus Increase"): "if a player needs to upgrade Difficulty dice into
  // Challenge dice but there are no more Difficulty dice remaining … First, one
  // additional Difficulty die is added; then if any more upgrades remain, the
  // Difficulty die is upgraded into a Challenge die."
  //
  // So N upgrades against D available difficulty dice always yield Challenge
  // +N, with Difficulty reduced by min(N, D) — never a no-op. Note upgrading is
  // NOT the same as increasing difficulty; that's the separate "Adjust
  // Difficulty" stepper, which adds/removes Difficulty dice outright.
  let finalDiff: number, finalChal: number
  const diffUpgrades = adjustments.difficultyUpgrades
  if (isDualWield) {
    finalDiff = baseDiff - Math.min(diffUpgrades, baseDiff)
    finalChal = diffUpgrades
  } else {
    const availableDiff = Math.max(0, baseDiff + adjustments.difficultyAdd)
    finalDiff = availableDiff - Math.min(diffUpgrades, availableDiff)
    finalChal = baseChal + diffUpgrades
  }

  const netSetback = Math.max(0, adjustments.setbackAdd - talentSbRemove)

  const finalPool = {
    proficiency: finalPro,
    ability:     finalAbl,
    boost:       talentBoost + adjustments.boostAdd,
    difficulty:  finalDiff,
    challenge:   finalChal + adjustments.challengeAdd,
    setback:     netSetback,
    force:       adjustments.forceAdd,
  }

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
