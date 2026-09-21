'use client'

import { useMemo } from 'react'
import { computeDerivedStats, type DerivedStatsResult } from '@/lib/derivedStats'
import type {
  Character,
  CharacterTalent,
  CharacterArmor,
  CharacterWeapon,
  RefTalent,
  RefArmor,
  RefWeapon,
  RefWeaponQuality,
  RefItemAttachment,
  SpeciesAbility,
  CharacterGear,
  RefGear,
  RefCyberneticEffect,
} from '@/lib/types'

interface DerivedStatsInput {
  character: Character | null
  forceRatingBase: number
  /** Career-only force rating (excludes FORCERAT talent ranks and the deliberate purchase) — see computeDerivedStats JSDoc */
  careerForceRatingBase: number
  talents: CharacterTalent[]
  refTalentMap: Record<string, RefTalent>
  armor: CharacterArmor[]
  refArmorMap: Record<string, RefArmor>
  refAttachmentMap: Record<string, RefItemAttachment>
  weapons?: CharacterWeapon[]
  refWeaponMap?: Record<string, RefWeapon>
  refWeaponQualityMap?: Record<string, RefWeaponQuality>
  speciesAbilities?: SpeciesAbility[]
  /** campaign_settings.morality_system — defaults 'vanilla' (byte-identical to pre-Force-Presence behaviour) when omitted, so mobile call sites that don't thread it stay unaffected. */
  moralitySystem?: 'vanilla' | 'force_presence'
  // ── Cybernetics layer (migration 135/136) ──
  // All optional: omitting them yields an empty CyberneticsResult that adds
  // zero, so a call site that hasn't been threaded through is unaffected.
  gear?: CharacterGear[]
  refGearMap?: Record<string, RefGear>
  cyberneticEffects?: RefCyberneticEffect[]
  /** character_skills.rank keyed by skill key — the base SKILL_MAX clamps against. */
  skillRanks?: Record<string, number>
}

// Module-level empty defaults. A `= []` / `= {}` default in the destructuring
// would allocate a NEW reference on every render and defeat the useMemo below.
const EMPTY_GEAR: CharacterGear[] = []
const EMPTY_REF_GEAR: Record<string, RefGear> = {}
const EMPTY_EFFECTS: RefCyberneticEffect[] = []
const EMPTY_RANKS: Record<string, number> = {}

/**
 * Memoised wrapper around computeDerivedStats.
 * Returns null when character is not yet loaded.
 */
export function useDerivedStats({
  character,
  forceRatingBase,
  careerForceRatingBase,
  talents,
  refTalentMap,
  armor,
  refArmorMap,
  refAttachmentMap,
  weapons = [],
  refWeaponMap = {},
  refWeaponQualityMap = {},
  speciesAbilities = [],
  moralitySystem = 'vanilla',
  gear = EMPTY_GEAR,
  refGearMap = EMPTY_REF_GEAR,
  cyberneticEffects = EMPTY_EFFECTS,
  skillRanks = EMPTY_RANKS,
}: DerivedStatsInput): DerivedStatsResult | null {
  return useMemo(() => {
    if (!character) return null
    return computeDerivedStats(
      character,
      forceRatingBase,
      careerForceRatingBase,
      talents,
      refTalentMap,
      armor,
      refArmorMap,
      refAttachmentMap,
      weapons,
      refWeaponMap,
      refWeaponQualityMap,
      speciesAbilities,
      moralitySystem,
      gear,
      refGearMap,
      cyberneticEffects,
      skillRanks,
    )
  }, [
    character,
    forceRatingBase,
    careerForceRatingBase,
    talents,
    refTalentMap,
    armor,
    refArmorMap,
    refAttachmentMap,
    weapons,
    refWeaponMap,
    refWeaponQualityMap,
    speciesAbilities,
    moralitySystem,
    gear,
    refGearMap,
    cyberneticEffects,
    skillRanks,
  ])
}
