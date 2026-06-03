'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { applyDamageToAdversary } from '@/lib/damageEngine'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'

type SupabaseClientType = ReturnType<typeof createClient>

interface UseEncounterCombatControlsOptions {
  onDefeat?:       (msg: string) => void
  onDisbandSquad?: (instanceId: string) => Promise<void>
}

interface UseEncounterCombatControlsParams {
  encounter:     CombatEncounter | null
  saveEncounter: (partial: Partial<CombatEncounter>) => Promise<void>
  supabase:      SupabaseClientType
  campaignId:    string
  options?:      UseEncounterCombatControlsOptions
}

export function useEncounterCombatControls({
  encounter,
  saveEncounter,
  supabase,
  campaignId,
  options,
}: UseEncounterCombatControlsParams) {
  const { onDefeat, onDisbandSquad } = options ?? {}

  const adjustAdversaryWounds = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (!encounter) return
    const currentWounds = adv.woundsCurrent ?? 0
    const clampedDelta  = delta < 0 ? Math.max(delta, -currentWounds) : delta
    if (clampedDelta === 0 && delta < 0) return

    const wasDefeated = adv.type === 'minion'
      ? adv.groupRemaining === 0
      : currentWounds >= adv.woundThreshold

    const result = applyDamageToAdversary({
      type: adv.type, name: adv.name,
      woundThreshold: adv.woundThreshold,
      groupSize: adv.groupSize, groupRemaining: adv.groupRemaining,
      woundsCurrent: currentWounds,
    }, clampedDelta)

    const updatedAdversaries = encounter.adversaries.map(a =>
      a.instanceId !== adv.instanceId ? a
        : { ...a, woundsCurrent: Math.max(0, result.woundsCurrent), groupRemaining: result.groupRemaining }
    )
    await saveEncounter({ adversaries: updatedAdversaries })

    const advSlot = encounter.initiative_slots.find(
      (s: InitiativeSlot) => s.adversaryInstanceId === adv.instanceId
    )
    if (advSlot) {
      const pct = adv.type === 'minion'
        ? 1 - (result.groupRemaining / Math.max(1, adv.groupSize))
        : Math.min(1, result.woundsCurrent / Math.max(1, adv.woundThreshold))
      await supabase.from('map_tokens')
        .update({ wound_pct: pct })
        .eq('slot_key', advSlot.id)
        .eq('campaign_id', campaignId)
    }

    if (!wasDefeated && result.isDefeated && encounter.id) {
      const msg = result.defeatMessage ?? `${adv.name} — DEFEATED`
      // Caller is responsible for defeat notification UI (e.g. toast); hook handles DB writes.
      onDefeat?.(msg)
      await supabase.from('combat_log').insert({
        campaign_id:    campaignId,
        encounter_id:   encounter.id,
        participant_name: 'SYSTEM',
        alignment:      'system',
        roll_type:      'system',
        result_summary: msg,
        is_visible_to_players: true,
      })
      if (adv.squad_active) await onDisbandSquad?.(adv.instanceId)
    }
  }, [encounter, campaignId, saveEncounter, supabase, onDefeat, onDisbandSquad])

  const adjustAdversaryStrain = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (!encounter || adv.type !== 'nemesis') return
    const strainMax = adv.strainThreshold ?? 0
    const current   = adv.strainCurrent ?? 0
    const next      = Math.max(0, Math.min(strainMax > 0 ? strainMax : 999, current + delta))
    const updated   = encounter.adversaries.map(a =>
      a.instanceId !== adv.instanceId ? a : { ...a, strainCurrent: next }
    )
    await saveEncounter({ adversaries: updated })
  }, [encounter, saveEncounter])

  const adjustGroupSize = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (!encounter || adv.type !== 'minion') return
    const newGroupSize = Math.max(1, adv.groupSize + delta)
    if (newGroupSize === adv.groupSize) return

    let newGroupRemaining: number
    let newWoundsCurrent: number
    if (delta > 0) {
      newGroupRemaining = adv.groupRemaining + 1
      newWoundsCurrent  = adv.woundsCurrent ?? 0
    } else {
      newGroupRemaining = Math.min(adv.groupRemaining, newGroupSize)
      newWoundsCurrent  = Math.min(adv.woundsCurrent ?? 0, adv.woundThreshold * newGroupSize)
    }

    const updatedAdversaries = encounter.adversaries.map(a =>
      a.instanceId !== adv.instanceId ? a
        : { ...a, groupSize: newGroupSize, groupRemaining: newGroupRemaining, woundsCurrent: newWoundsCurrent }
    )
    await saveEncounter({ adversaries: updatedAdversaries })

    const advSlot = encounter.initiative_slots.find(
      (s: InitiativeSlot) => s.adversaryInstanceId === adv.instanceId
    )
    if (advSlot) {
      const pct = 1 - (newGroupRemaining / Math.max(1, newGroupSize))
      await supabase.from('map_tokens')
        .update({ wound_pct: pct })
        .eq('slot_key', advSlot.id)
        .eq('campaign_id', campaignId)
    }
  }, [encounter, campaignId, saveEncounter, supabase])

  const adjustHullTrauma = useCallback(async (vehicle: VehicleInstance, delta: number) => {
    if (!encounter) return
    const next = Math.max(0, Math.min(vehicle.hullTraumaThreshold, vehicle.hullTraumaCurrent + delta))
    const updated = (encounter.vehicles ?? []).map(v =>
      v.instanceId !== vehicle.instanceId ? v : { ...v, hullTraumaCurrent: next }
    )
    await saveEncounter({ vehicles: updated })

    const vSlot = encounter.initiative_slots.find(s => s.vehicleInstanceId === vehicle.instanceId)
    if (vSlot) {
      const pct = Math.min(1, next / Math.max(1, vehicle.hullTraumaThreshold))
      await supabase.from('map_tokens')
        .update({ wound_pct: pct })
        .eq('slot_key', vSlot.id)
        .eq('campaign_id', campaignId)
    }

    const wasDisabled = vehicle.hullTraumaCurrent >= vehicle.hullTraumaThreshold
    if (!wasDisabled && next >= vehicle.hullTraumaThreshold && encounter.id) {
      await supabase.from('combat_log').insert({
        campaign_id:    campaignId,
        encounter_id:   encounter.id,
        participant_name: 'SYSTEM',
        alignment:      'system',
        roll_type:      'system',
        result_summary: `${vehicle.name} — DISABLED (Hull Trauma ${next}/${vehicle.hullTraumaThreshold})`,
        is_visible_to_players: true,
      })
    }
  }, [encounter, campaignId, saveEncounter, supabase])

  const adjustSystemStrain = useCallback(async (vehicle: VehicleInstance, delta: number) => {
    if (!encounter) return
    const next = Math.max(0, Math.min(vehicle.systemStrainThreshold, vehicle.systemStrainCurrent + delta))
    const updated = (encounter.vehicles ?? []).map(v =>
      v.instanceId !== vehicle.instanceId ? v : { ...v, systemStrainCurrent: next }
    )
    await saveEncounter({ vehicles: updated })
  }, [encounter, saveEncounter])

  return { adjustAdversaryWounds, adjustAdversaryStrain, adjustGroupSize, adjustHullTrauma, adjustSystemStrain }
}
