// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Combat Check Utility Functions
//
// Pure helpers for the guided combat check overlay: difficulty calculation,
// pool assembly, and result formatting.
// ═══════════════════════════════════════════════════════════════════════════

import { getSkillPool, type RollResult } from '@/components/player-hud/dice-engine'
import type { AdversaryInstance } from '@/lib/adversaries'

// ── Range band types ──────────────────────────────────────────────────────────

export type RangeBand = 'engaged' | 'short' | 'medium' | 'long' | 'extreme'

export const RANGE_BAND_ORDER: RangeBand[] = ['engaged', 'short', 'medium', 'long', 'extreme']

export const RANGE_BAND_LABELS: Record<RangeBand, string> = {
  engaged: 'Engaged',
  short:   'Short',
  medium:  'Medium',
  long:    'Long',
  extreme: 'Extreme',
}

/** Maps OggDude range_value strings to RangeBand enum */
export const RANGE_VALUE_MAP: Record<string, RangeBand> = {
  wrEngaged: 'engaged',
  wrShort:   'short',
  wrMedium:  'medium',
  wrLong:    'long',
  wrExtreme: 'extreme',
}

export function bandIndex(band: RangeBand): number {
  return RANGE_BAND_ORDER.indexOf(band)
}

// ── Ranged difficulty ─────────────────────────────────────────────────────────

export interface RangedDifficultyResult {
  difficultyDice: number
  challengeDice:  number
  notes:          string[]
  blocked:        boolean
}

const BASE_RANGED_DIFFICULTY: Record<RangeBand, number> = {
  engaged: 1,
  short:   1,
  medium:  2,
  long:    3,
  extreme: 4,
}

export function getRangedDifficulty(
  band: RangeBand,
  skillKey: string,
  weaponMaxRange: RangeBand,
): RangedDifficultyResult {
  // Beyond max range — blocked
  if (bandIndex(band) > bandIndex(weaponMaxRange)) {
    return { difficultyDice: 0, challengeDice: 0, notes: ['Beyond weapon range'], blocked: true }
  }

  let difficulty = BASE_RANGED_DIFFICULTY[band]
  const notes: string[] = []

  if (band === 'engaged') {
    if (skillKey === 'RANGLT') {
      difficulty += 1
      notes.push('+1 difficulty: Ranged (Light) at Engaged range')
    } else if (skillKey === 'RANGHVY') {
      difficulty += 2
      notes.push('+2 difficulty: Ranged (Heavy) at Engaged range')
    } else if (skillKey === 'GUNN') {
      return {
        difficultyDice: 0, challengeDice: 0,
        notes: ['Cannot use Gunnery at Engaged range'],
        blocked: true,
      }
    }
  }

  return { difficultyDice: difficulty, challengeDice: 0, notes, blocked: false }
}

// ── Melee opposed difficulty ──────────────────────────────────────────────────

export interface MeleeDifficultyResult {
  difficultyDice:  number
  challengeDice:   number
  targetMeleeRank: number
  targetBrawn:     number
  /** Set only when there is no target at all. Player sets difficulty manually. */
  fallbackReason?: string
}

export function getMeleeDifficulty(
  target: AdversaryInstance | null,
): MeleeDifficultyResult {
  if (!target) {
    return {
      difficultyDice: 0, challengeDice: 0,
      targetMeleeRank: 0, targetBrawn: 0,
      fallbackReason: 'No target selected — set difficulty manually',
    }
  }

  const ranks = target.skillRanks ?? {}
  // skillRanks stores by display name ("Melee") in adversary data, and it is a
  // SPARSE map — only skills with at least one rank are present.
  //
  // An absent key therefore means "0 ranks", NOT "this creature has no Melee
  // skill". Every character has every skill; with 0 ranks you simply roll the
  // linked characteristic. Defaulting to -1 and bailing out treated most
  // adversaries (5 of 9 in live encounter data) as unattackable in melee and
  // pushed the player to enter a difficulty by hand.
  //
  // With rank 0 the maths below already produces the correct FFG result:
  // proficiency = min(brawn, 0) = 0, ability = |brawn - 0| = brawn — i.e. an
  // unskilled Brawn 2 defender opposes with 2 difficulty and 0 challenge dice.
  const meleeRank: number = ranks['Melee'] ?? ranks['MELEE'] ?? 0

  const brawn = target.characteristics?.brawn ?? 2
  const proficiency = Math.min(brawn, meleeRank)
  const ability     = Math.abs(brawn - meleeRank)

  return {
    difficultyDice:  ability,
    challengeDice:   proficiency,
    targetMeleeRank: meleeRank,
    targetBrawn:     brawn,
  }
}

// ── Dual-wield pool and penalty ─────────────────────────────────────────────────
// AoE Core p.204: two-weapon combined check uses the LOWER of the two
// weapons' skill ranks and the LOWER of their linked characteristics, and
// suffers +1 difficulty (same skill) or +2 (different skills). No range-based
// challenge dice apply in dual wield — only the max of the two weapons'
// range-band difficulty dice feeds the base before the same/different penalty.

export interface DualWieldPoolResult {
  proficiency: number
  ability:     number
  /** Base range difficulty (max of the two weapons) plus the same/different-skill penalty. */
  difficulty:  number
  sameSkill:   boolean
}

export function getDualWieldPool(
  primarySkillKey:         string,
  secondarySkillKey:       string,
  primaryCharVal:          number,
  secondaryCharVal:        number,
  primarySkillRank:        number,
  secondarySkillRank:      number,
  rangeBand:               RangeBand | null,
  primaryWeaponMaxRange:   RangeBand,
  secondaryWeaponMaxRange: RangeBand,
): DualWieldPoolResult {
  const usedSkillRank = Math.min(primarySkillRank, secondarySkillRank)
  const usedChar      = Math.min(primaryCharVal, secondaryCharVal)
  const { proficiency, ability } = getSkillPool(usedChar, usedSkillRank)

  const primaryDiff   = rangeBand ? getRangedDifficulty(rangeBand, primarySkillKey,   primaryWeaponMaxRange).difficultyDice   : 0
  const secondaryDiff = rangeBand ? getRangedDifficulty(rangeBand, secondarySkillKey, secondaryWeaponMaxRange).difficultyDice : 0
  const baseDifficulty = Math.max(primaryDiff, secondaryDiff)

  const sameSkill  = primarySkillKey === secondarySkillKey
  const difficulty = baseDifficulty + (sameSkill ? 1 : 2)

  return { proficiency, ability, difficulty, sameSkill }
}

// ── Maneuver modifier merge ──────────────────────────────────────────────────
// Combat Check's maneuver toggles (Aim x2, Assist, Guarded) are separate local
// state from ManualAdjustments so the DSS steppers stay independent — this
// merges them into one adjustments object before it's fed to the pool review.
export interface ManualAdjustmentsLike {
  boostAdd:           number
  setbackAdd:         number
  difficultyAdd:      number
  challengeAdd:       number
  forceAdd:           number
  abilityUpgrades:    number
  difficultyUpgrades: number
}

export function mergeManeuverAdjustments<T extends ManualAdjustmentsLike>(
  adjustments:   T,
  aimBoosts:     number,
  assistActive:  boolean,
  guardedActive: boolean,
): T {
  return {
    ...adjustments,
    boostAdd:   adjustments.boostAdd + aimBoosts + (assistActive ? 1 : 0),
    setbackAdd: adjustments.setbackAdd + (guardedActive ? 1 : 0),
  }
}

/** Total dice count across a roll pool, ignoring negative/undefined entries. */
export function totalPoolDice(pool: Record<string, number>): number {
  return Object.values(pool).reduce((s, n) => s + Math.max(0, n ?? 0), 0)
}

// ── Skill type helpers ────────────────────────────────────────────────────────

export const RANGED_SKILL_KEYS = ['RANGLT', 'RANGHVY', 'GUNN']
export const MELEE_SKILL_KEYS  = ['MELEE', 'BRAWL', 'LTSABER']

export function isRangedSkill(key: string): boolean {
  return RANGED_SKILL_KEYS.includes(key)
}
export function isMeleeSkill(key: string): boolean {
  return MELEE_SKILL_KEYS.includes(key)
}

// ── Result formatting ─────────────────────────────────────────────────────────

export function formatResultSummary(
  result: RollResult,
  weaponName: string,
  targetName?: string,
  rangeBand?: RangeBand,
): string {
  const net = result.net
  const parts: string[] = []

  if (net.success > 0)        parts.push(`${net.success} Success`)
  else if (net.success < 0)   parts.push(`${Math.abs(net.success)} Failure`)
  else                         parts.push('Wash')

  if (net.advantage > 0)      parts.push(`${net.advantage} Advantage`)
  else if (net.advantage < 0) parts.push(`${Math.abs(net.advantage)} Threat`)

  if (net.triumph > 0)  parts.push(`${net.triumph} Triumph`)
  if (net.despair > 0)  parts.push(`${net.despair} Despair`)

  const contextParts = [weaponName]
  if (targetName) contextParts.push(`vs ${targetName}`)
  if (rangeBand)  contextParts.push(`at ${RANGE_BAND_LABELS[rangeBand]}`)

  return `${contextParts.join(' ')} — ${parts.join(' · ')}`
}

// ── Characteristic key mapping ────────────────────────────────────────────────
// Maps the 2-letter characteristic_key from ref_skills to the character field name

export const CHAR_FIELD_MAP: Record<string, keyof import('@/lib/types').Character> = {
  BR:  'brawn',
  AG:  'agility',
  INT: 'intellect',
  CUN: 'cunning',
  WIL: 'willpower',
  PR:  'presence',
}
