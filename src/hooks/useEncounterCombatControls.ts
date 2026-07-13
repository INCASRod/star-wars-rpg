'use client'

import { useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { applyDamageToAdversary } from '@/lib/damageEngine'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'
import type { MapToken } from '@/hooks/useMapTokens'

type SupabaseClientType = ReturnType<typeof createClient>

const WRITE_DEBOUNCE_MS = 350

interface UseEncounterCombatControlsOptions {
  onDefeat?:       (msg: string) => void
  onDisbandSquad?: (instanceId: string) => Promise<void>
}

interface UseEncounterCombatControlsParams {
  encounter:          CombatEncounter | null
  setEncounter:       React.Dispatch<React.SetStateAction<CombatEncounter | null>>
  saveEncounter:      (partial: Partial<CombatEncounter>) => Promise<void>
  supabase:           SupabaseClientType
  campaignId:         string
  tokens:             MapToken[]
  updateTokenWoundPct: (id: string, wound_pct: number) => Promise<void>
  markPending:        (key: string) => void
  clearPending:       (key: string) => void
  options?:           UseEncounterCombatControlsOptions
}

export function useEncounterCombatControls({
  encounter, setEncounter, saveEncounter, supabase, campaignId, tokens, updateTokenWoundPct,
  markPending, clearPending, options,
}: UseEncounterCombatControlsParams) {
  const { onDefeat, onDisbandSquad } = options ?? {}
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const scheduleWrite = useCallback((key: string, writeFn: () => Promise<void>) => {
    markPending(key)
    const existing = debounceTimers.current.get(key)
    if (existing) clearTimeout(existing)
    const timer = setTimeout(() => {
      debounceTimers.current.delete(key)
      void writeFn().finally(() => clearPending(key))
    }, WRITE_DEBOUNCE_MS)
    debounceTimers.current.set(key, timer)
  }, [markPending, clearPending])

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

    // Optimistic, synchronous, stale-closure-proof: setEncounter's functional
    // form always receives the latest state, even across rapid clicks fired
    // faster than a re-render — this is the fix for the lost-click bug where
    // two rapid clicks previously both read the same pre-first-click value.
    setEncounter(prev => {
      if (!prev) return prev
      return {
        ...prev,
        adversaries: prev.adversaries.map(a =>
          a.instanceId !== adv.instanceId ? a
            : { ...a, woundsCurrent: Math.max(0, result.woundsCurrent), groupRemaining: result.groupRemaining }
        ),
      }
    })

    const key = `${adv.instanceId}:wounds`
    scheduleWrite(key, async () => {
      // Read the latest encounter via the same functional form at write time —
      // setEncounter's updater always sees whatever local state accumulated
      // during the debounce window, not the value captured when this closure
      // was created.
      let latestAdversaries: AdversaryInstance[] = []
      setEncounter(prev => { latestAdversaries = prev?.adversaries ?? []; return prev })
      await saveEncounter({ adversaries: latestAdversaries })
    })

    const advSlot = encounter.initiative_slots.find(
      (s: InitiativeSlot) => s.adversaryInstanceId === adv.instanceId
    )
    if (advSlot) {
      const tok = tokens.find(t => t.slot_key === advSlot.id)
      if (tok) {
        const pct = adv.type === 'minion'
          ? 1 - (result.groupRemaining / Math.max(1, adv.groupSize))
          : Math.min(1, result.woundsCurrent / Math.max(1, adv.woundThreshold))
        void updateTokenWoundPct(tok.id, pct)
      }
    }

    if (!wasDefeated && result.isDefeated && encounter.id) {
      const msg = result.defeatMessage ?? `${adv.name} — DEFEATED`
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
  }, [encounter, campaignId, saveEncounter, setEncounter, supabase, tokens, updateTokenWoundPct, scheduleWrite, onDefeat, onDisbandSquad])

  const adjustAdversaryStrain = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (!encounter || adv.type !== 'nemesis') return
    const strainMax = adv.strainThreshold ?? 0
    const current   = adv.strainCurrent ?? 0
    const next      = Math.max(0, Math.min(strainMax > 0 ? strainMax : 999, current + delta))
    setEncounter(prev => {
      if (!prev) return prev
      return { ...prev, adversaries: prev.adversaries.map(a =>
        a.instanceId !== adv.instanceId ? a : { ...a, strainCurrent: next }
      ) }
    })
    scheduleWrite(`${adv.instanceId}:strain`, async () => {
      let latest: AdversaryInstance[] = []
      setEncounter(prev => { latest = prev?.adversaries ?? []; return prev })
      await saveEncounter({ adversaries: latest })
    })
  }, [encounter, saveEncounter, setEncounter, scheduleWrite])

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

    setEncounter(prev => {
      if (!prev) return prev
      return { ...prev, adversaries: prev.adversaries.map(a =>
        a.instanceId !== adv.instanceId ? a
          : { ...a, groupSize: newGroupSize, groupRemaining: newGroupRemaining, woundsCurrent: newWoundsCurrent }
      ) }
    })

    scheduleWrite(`${adv.instanceId}:groupSize`, async () => {
      let latest: AdversaryInstance[] = []
      setEncounter(prev => { latest = prev?.adversaries ?? []; return prev })
      await saveEncounter({ adversaries: latest })
    })

    const advSlot = encounter.initiative_slots.find(
      (s: InitiativeSlot) => s.adversaryInstanceId === adv.instanceId
    )
    if (advSlot) {
      const tok = tokens.find(t => t.slot_key === advSlot.id)
      if (tok) {
        const pct = 1 - (newGroupRemaining / Math.max(1, newGroupSize))
        void updateTokenWoundPct(tok.id, pct)
      }
    }
  }, [encounter, saveEncounter, setEncounter, tokens, updateTokenWoundPct, scheduleWrite])

  const adjustHullTrauma = useCallback(async (vehicle: VehicleInstance, delta: number) => {
    if (!encounter) return
    const next = Math.max(0, Math.min(vehicle.hullTraumaThreshold, vehicle.hullTraumaCurrent + delta))

    setEncounter(prev => {
      if (!prev) return prev
      return { ...prev, vehicles: (prev.vehicles ?? []).map(v =>
        v.instanceId !== vehicle.instanceId ? v : { ...v, hullTraumaCurrent: next }
      ) }
    })

    scheduleWrite(`${vehicle.instanceId}:hullTrauma`, async () => {
      let latest: VehicleInstance[] = []
      setEncounter(prev => { latest = prev?.vehicles ?? []; return prev })
      await saveEncounter({ vehicles: latest })
    })

    const vSlot = encounter.initiative_slots.find(s => s.vehicleInstanceId === vehicle.instanceId)
    if (vSlot) {
      const tok = tokens.find(t => t.slot_key === vSlot.id)
      if (tok) {
        const pct = Math.min(1, next / Math.max(1, vehicle.hullTraumaThreshold))
        void updateTokenWoundPct(tok.id, pct)
      }
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
  }, [encounter, campaignId, saveEncounter, setEncounter, supabase, tokens, updateTokenWoundPct, scheduleWrite])

  const adjustSystemStrain = useCallback(async (vehicle: VehicleInstance, delta: number) => {
    if (!encounter) return
    const next = Math.max(0, Math.min(vehicle.systemStrainThreshold, vehicle.systemStrainCurrent + delta))
    setEncounter(prev => {
      if (!prev) return prev
      return { ...prev, vehicles: (prev.vehicles ?? []).map(v =>
        v.instanceId !== vehicle.instanceId ? v : { ...v, systemStrainCurrent: next }
      ) }
    })
    scheduleWrite(`${vehicle.instanceId}:systemStrain`, async () => {
      let latest: VehicleInstance[] = []
      setEncounter(prev => { latest = prev?.vehicles ?? []; return prev })
      await saveEncounter({ vehicles: latest })
    })
  }, [encounter, saveEncounter, setEncounter, scheduleWrite])

  return { adjustAdversaryWounds, adjustAdversaryStrain, adjustGroupSize, adjustHullTrauma, adjustSystemStrain }
}
