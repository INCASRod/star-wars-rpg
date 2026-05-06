'use client'
import { ForcePanel, type ForcePowerDisplay, type ConflictEntry } from './ForcePanel'
import type { Character } from '@/lib/types'
import type { EffectiveStats } from '@/lib/derivedStats'

interface HudForceTabProps {
  character: Character
  forceRating: number
  effectiveStats?: EffectiveStats | null
  allForcePowers: ForcePowerDisplay[]
  conflicts: ConflictEntry[]
  onPurchaseForceAbility: (abilityKey: string, row: number, col: number, cost: number, powerKey: string) => void
  onViewPower: (pk: string) => void
  onAdd: () => void
}

export function HudForceTab({
  character, forceRating, effectiveStats,
  allForcePowers, conflicts,
  onPurchaseForceAbility, onViewPower, onAdd,
}: HudForceTabProps) {
  return (
    <ForcePanel
      forceRating={effectiveStats?.forceRating ?? forceRating}
      committedForce={character.force_rating_committed ?? 0}
      moralityValue={character.morality_value ?? 50}
      moralityStrength={character.morality_strength_key || ''}
      moralityWeakness={character.morality_weakness_key || ''}
      moralityConfigured={character.morality_configured}
      forcePowers={allForcePowers.filter(fp => fp.purchasedCount > 0)}
      conflicts={conflicts}
      xpAvailable={character.xp_available}
      onPurchasePower={onPurchaseForceAbility}
      onViewPower={onViewPower}
      onAdd={onAdd}
      isFallen={character.is_dark_side_fallen === true}
    />
  )
}
