// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Combat Check Utility Functions
//
// Pure helpers for the guided combat check overlay: difficulty calculation,
// pool assembly, and result formatting.
// ═══════════════════════════════════════════════════════════════════════════

import type { RollResult } from '@/components/player-hud/dice-engine'
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
  isDefault:       boolean
  defaultNote?:    string
}

export function getMeleeDifficulty(
  target: AdversaryInstance,
): MeleeDifficultyResult {
  const ranks = target.skillRanks ?? {}
  // skillRanks stores by display name ("Melee") in adversary data
  let meleeRank: number = ranks['Melee'] ?? ranks['MELEE'] ?? -1
  let isDefault = false
  let defaultNote: string | undefined

  if (meleeRank < 0) {
    isDefault = true
    meleeRank = 0
    defaultNote = `Melee not listed — defaulting to rank 0`
  }

  const brawn = target.characteristics?.brawn ?? 2
  const proficiency = Math.min(brawn, meleeRank)
  const ability     = Math.abs(brawn - meleeRank)

  return {
    difficultyDice:  ability,
    challengeDice:   proficiency,
    targetMeleeRank: meleeRank,
    targetBrawn:     brawn,
    isDefault,
    defaultNote,
  }
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
