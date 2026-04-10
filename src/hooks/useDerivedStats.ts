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
  talents: CharacterTalent[]
  refTalentMap: Record<string, RefTalent>
  armor: CharacterArmor[]
  refArmorMap: Record<string, RefArmor>
  refAttachmentMap: Record<string, RefItemAttachment>
  weapons?: CharacterWeapon[]
  refWeaponMap?: Record<string, RefWeapon>
  refWeaponQualityMap?: Record<string, RefWeaponQuality>
  speciesAbilities?: SpeciesAbility[]
}

/**
 * Memoised wrapper around computeDerivedStats.
 * Returns null when character is not yet loaded.
 */
export function useDerivedStats({
  character,
  forceRatingBase,
  talents,
  refTalentMap,
  armor,
  refArmorMap,
  refAttachmentMap,
  weapons = [],
  refWeaponMap = {},
  refWeaponQualityMap = {},
  speciesAbilities = [],
}: DerivedStatsInput): DerivedStatsResult | null {
  return useMemo(() => {
    if (!character) return null
    return computeDerivedStats(
      character,
      forceRatingBase,
      talents,
      refTalentMap,
      armor,
      refArmorMap,
      refAttachmentMap,
      weapons,
      refWeaponMap,
      refWeaponQualityMap,
      speciesAbilities,
    )
  }, [
    character,
    forceRatingBase,
    talents,
    refTalentMap,
    armor,
    refArmorMap,
    refAttachmentMap,
    weapons,
    refWeaponMap,
    refWeaponQualityMap,
    speciesAbilities,
  ])
}
