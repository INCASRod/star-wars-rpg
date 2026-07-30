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
}

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
  ])
}
