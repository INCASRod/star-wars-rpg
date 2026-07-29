'use client'
import { ForcePanel, type ForcePowerDisplay, type ConflictEntry } from './ForcePanel'
import type { Character, ForceCommitment } from '@/lib/types'
import type { EffectiveStats } from '@/lib/derivedStats'
import { createClient } from '@/lib/supabase/client'

interface HudForceTabProps {
  character: Character
  forceRating: number
  effectiveStats?: EffectiveStats | null
  allForcePowers: ForcePowerDisplay[]
  conflicts: ConflictEntry[]
  onPurchaseForceAbility: (abilityKey: string, row: number, col: number, cost: number, powerKey: string) => Promise<string | undefined> | void
  onViewPower: (pk: string) => void
  onAdd: () => void
  /** Eligible for Force Rating 1, currently at 0, not yet purchased — shows the buy CTA and locks power browsing. */
  canGainForceRating?: boolean
  onPurchaseForceRating?: () => void
}

export function HudForceTab({
  character, forceRating, effectiveStats,
  allForcePowers, conflicts,
  onPurchaseForceAbility, onViewPower, onAdd,
  canGainForceRating, onPurchaseForceRating,
}: HudForceTabProps) {
  const handleCancelCommit = async (powerKey: string, effectName: string) => {
    const current: ForceCommitment[] = character.force_commitments ?? []
    const target = current.find(
      c => c.power_key === powerKey && c.effect_name === effectName,
    )
    if (!target) return

    const updated: ForceCommitment[] = target.dice_count <= 1
      ? current.filter(
          c => !(c.power_key === powerKey && c.effect_name === effectName),
        )
      : current.map(c =>
          c.power_key === powerKey && c.effect_name === effectName
            ? { ...c, dice_count: c.dice_count - 1 }
            : c,
        )

    const newCommitted = Math.max(0, (character.force_rating_committed ?? 0) - 1)
    const supabase = createClient()
    await supabase
      .from('characters')
      .update({ force_rating_committed: newCommitted, force_commitments: updated })
      .eq('id', character.id)
  }

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
      commitments={character.force_commitments ?? []}
      onCancelCommit={handleCancelCommit}
      canGainForceRating={canGainForceRating}
      onPurchaseForceRating={onPurchaseForceRating}
    />
  )
}
