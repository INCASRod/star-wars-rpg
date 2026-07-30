'use client'
import { ForcePanel, type ForcePowerDisplay, type ConflictEntry } from './ForcePanel'
import type { Character, ForceCommitment } from '@/lib/types'
import type { EffectiveStats } from '@/lib/derivedStats'
import { createClient } from '@/lib/supabase/client'
import { logPurchaseNotification } from '@/lib/logRoll'
import { getAvailableForceRating, fetchFreshCommitState } from '@/lib/forceUtils'
import type { MoralitySystem } from '@/lib/moralitySystem'

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
  /** null while loading or on fetch failure — see moralitySystemError. Swap-point branch lives in ForcePanel, not here. */
  moralitySystem?: MoralitySystem | null
  moralitySystemError?: string | null
  onFlipBalancePoint?: (fromState: 'neutral' | 'light' | 'dark', toState: 'neutral' | 'light' | 'dark') => Promise<void>
}

export function HudForceTab({
  character, forceRating, effectiveStats,
  allForcePowers, conflicts,
  onPurchaseForceAbility, onViewPower, onAdd,
  canGainForceRating, onPurchaseForceRating,
  moralitySystem, moralitySystemError, onFlipBalancePoint,
}: HudForceTabProps) {
  // Race-safe fresh-fetch pattern — same shape as purchaseTalent/
  // purchaseForceAbility (useCharacterData.ts): re-read the two columns this
  // write depends on immediately before writing, and derive the new values
  // from THAT fresh read, not from the (possibly stale) `character` prop.
  // Shared with MobileHudLayout.tsx via forceUtils.ts — was a local
  // duplicate here until that duplication caused mobile's copy to diverge
  // (no fresh-fetch, no GM notification).
  const handleCancelCommit = async (powerKey: string, effectName: string) => {
    const supabase = createClient()
    const { committed, commitments } = await fetchFreshCommitState(supabase, character.id, {
      committed: character.force_rating_committed ?? 0,
      commitments: character.force_commitments ?? [],
    })
    const target = commitments.find(c => c.power_key === powerKey && c.effect_name === effectName)
    if (!target) return

    const updated: ForceCommitment[] = target.dice_count <= 1
      ? commitments.filter(c => !(c.power_key === powerKey && c.effect_name === effectName))
      : commitments.map(c =>
          c.power_key === powerKey && c.effect_name === effectName
            ? { ...c, dice_count: c.dice_count - 1 }
            : c,
        )
    const newCommitted = Math.max(0, committed - 1)

    await supabase
      .from('characters')
      .update({ force_rating_committed: newCommitted, force_commitments: updated })
      .eq('id', character.id)

    // GM roll-feed notification — same mechanism every other XP/purchase
    // event already uses (logPurchaseNotification → a hidden, alignment:
    // 'system' row in roll_log, rendered as a compact system entry in
    // RollFeedPanel; GM-only, matches "Players never see hidden rolls").
    // Reuses the existing 'force' purchase_type — xp_cost:0 since this
    // isn't an XP transaction, the label text carries the actual meaning.
    if (character.campaign_id) {
      logPurchaseNotification({
        campaignId: character.campaign_id,
        characterId: character.id,
        characterName: character.name,
        label: `${character.name} released 1 Force die from ${target.power_name} — ${target.effect_name}`,
        meta: { purchase_type: 'force', xp_cost: 0, refunded: false, force_power_key: powerKey, force_ability_key: target.ability_key },
      })
    }
  }

  /** New in this prompt — the first path that CREATES a commitment. Same
   * fresh-fetch race-safety as release above. Deliberately no capacity
   * guard: overcommitting must succeed (the GM polices it), it just renders
   * as failure-coloured excess sockets. */
  const handleCommit = async (powerKey: string, powerName: string, abilityKey: string, abilityName: string, diceCount: number) => {
    const supabase = createClient()
    const { committed, commitments } = await fetchFreshCommitState(supabase, character.id, {
      committed: character.force_rating_committed ?? 0,
      commitments: character.force_commitments ?? [],
    })

    // Existing release logic assumes exactly one entry per (power_key,
    // effect_name) — decrementing dice_count rather than removing one of
    // several duplicate rows (confirmed via Step 0 item 7 audit). Matched
    // the same way here: increment the existing entry if one already exists
    // for this ability, otherwise push a new one carrying ability_key too.
    const existing = commitments.find(c => c.power_key === powerKey && c.effect_name === abilityName)
    const updated: ForceCommitment[] = existing
      ? commitments.map(c =>
          c.power_key === powerKey && c.effect_name === abilityName
            ? { ...c, dice_count: c.dice_count + diceCount, ability_key: abilityKey }
            : c,
        )
      : [...commitments, { power_key: powerKey, power_name: powerName, effect_name: abilityName, dice_count: diceCount, ability_key: abilityKey }]
    const newCommitted = committed + diceCount

    await supabase
      .from('characters')
      .update({ force_rating_committed: newCommitted, force_commitments: updated })
      .eq('id', character.id)

    if (character.campaign_id) {
      logPurchaseNotification({
        campaignId: character.campaign_id,
        characterId: character.id,
        characterName: character.name,
        label: `${character.name} committed ${diceCount} Force ${diceCount === 1 ? 'die' : 'dice'} to ${powerName} — ${abilityName}`,
        meta: { purchase_type: 'force', xp_cost: 0, refunded: false, force_power_key: powerKey, force_ability_key: abilityKey },
      })
    }
  }

  // getAvailableForceRating (forceUtils.ts) previously had zero call sites —
  // this is its first real one. Computed here (not in ForcePanel) because
  // it needs the full Character object, which ForcePanel doesn't receive
  // (only individual primitives, since MobileSessionCompanion.tsx also
  // renders <ForcePanel> with its own separate prop set and stays untouched).
  const resolvedForceRating = effectiveStats?.forceRating ?? forceRating
  const availableForceRating = getAvailableForceRating(character, resolvedForceRating)

  return (
    <ForcePanel
      forceRating={resolvedForceRating}
      committedForce={character.force_rating_committed ?? 0}
      availableForceRating={availableForceRating}
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
      onCommit={handleCommit}
      canGainForceRating={canGainForceRating}
      onPurchaseForceRating={onPurchaseForceRating}
      moralitySystem={moralitySystem}
      moralitySystemError={moralitySystemError}
      lightPoints={character.light_points ?? 0}
      darkPoints={character.dark_points ?? 0}
      sessionConflict={character.session_conflict ?? 0}
      sessionTranquility={character.session_tranquility ?? 0}
      onFlipBalancePoint={onFlipBalancePoint}
    />
  )
}
