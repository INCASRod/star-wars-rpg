'use client'

import { useCallback, useRef } from 'react'
import { toast } from 'sonner'
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
      void writeFn()
        .catch(err => {
          const msg = (err as { message?: string })?.message ?? 'Unknown error'
          console.error(`Encounter write failed [${key}]`, msg, err)
          toast.error(`Failed to save encounter changes: ${msg}`)
        })
        .finally(() => clearPending(key))
    }, WRITE_DEBOUNCE_MS)
    debounceTimers.current.set(key, timer)
  }, [markPending, clearPending])

  const adjustAdversaryWounds = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (!encounter) return

    // Everything that reads a MUTABLE field (woundsCurrent, groupRemaining,
    // groupSize) must happen inside the setEncounter updater, against `prev`
    // — not against the `adv` closure param — so that two rapid invocations
    // sharing the same `adv` reference each read the OTHER's already-applied
    // write instead of both computing from the same stale baseline.
    let result: ReturnType<typeof applyDamageToAdversary> | null = null
    let wasDefeated = false
    let groupSizeAtWrite = adv.groupSize
    let skipped = false

    setEncounter(prev => {
      if (!prev) return prev
      const live = prev.adversaries.find(a => a.instanceId === adv.instanceId)
      if (!live) { skipped = true; return prev }

      const currentWounds = live.woundsCurrent ?? 0
      const clampedDelta  = delta < 0 ? Math.max(delta, -currentWounds) : delta
      if (clampedDelta === 0 && delta < 0) { skipped = true; return prev }

      wasDefeated = adv.type === 'minion'
        ? live.groupRemaining === 0
        : currentWounds >= adv.woundThreshold

      groupSizeAtWrite = live.groupSize
      result = applyDamageToAdversary({
        type: adv.type, name: adv.name,
        woundThreshold: adv.woundThreshold,
        groupSize: live.groupSize, groupRemaining: live.groupRemaining,
        woundsCurrent: currentWounds,
      }, clampedDelta)

      return {
        ...prev,
        adversaries: prev.adversaries.map(a =>
          a.instanceId !== adv.instanceId ? a
            : { ...a, woundsCurrent: Math.max(0, result!.woundsCurrent), groupRemaining: result!.groupRemaining }
        ),
      }
    })

    if (skipped || !result) return
    const finalResult = result as ReturnType<typeof applyDamageToAdversary>

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
          ? 1 - (finalResult.groupRemaining / Math.max(1, groupSizeAtWrite))
          : Math.min(1, finalResult.woundsCurrent / Math.max(1, adv.woundThreshold))
        void updateTokenWoundPct(tok.id, pct)
      }
    }

    if (!wasDefeated && finalResult.isDefeated && encounter.id) {
      const msg = finalResult.defeatMessage ?? `${adv.name} — DEFEATED`
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

    let skipped = false

    setEncounter(prev => {
      if (!prev) return prev
      const live = prev.adversaries.find(a => a.instanceId === adv.instanceId)
      if (!live) { skipped = true; return prev }

      const strainMax = adv.strainThreshold ?? 0
      const current   = live.strainCurrent ?? 0
      const next      = Math.max(0, Math.min(strainMax > 0 ? strainMax : 999, current + delta))

      return { ...prev, adversaries: prev.adversaries.map(a =>
        a.instanceId !== adv.instanceId ? a : { ...a, strainCurrent: next }
      ) }
    })

    if (skipped) return

    scheduleWrite(`${adv.instanceId}:strain`, async () => {
      let latest: AdversaryInstance[] = []
      setEncounter(prev => { latest = prev?.adversaries ?? []; return prev })
      await saveEncounter({ adversaries: latest })
    })
  }, [encounter, saveEncounter, setEncounter, scheduleWrite])

  const adjustGroupSize = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (!encounter || adv.type !== 'minion') return

    let newGroupSize = 0
    let newGroupRemaining = 0
    let skipped = false

    setEncounter(prev => {
      if (!prev) return prev
      const live = prev.adversaries.find(a => a.instanceId === adv.instanceId)
      if (!live) { skipped = true; return prev }

      const groupSize = Math.max(1, live.groupSize + delta)
      if (groupSize === live.groupSize) { skipped = true; return prev }

      let groupRemaining: number
      let woundsCurrent: number
      if (delta > 0) {
        groupRemaining = live.groupRemaining + 1
        woundsCurrent  = live.woundsCurrent ?? 0
      } else {
        groupRemaining = Math.min(live.groupRemaining, groupSize)
        woundsCurrent  = Math.min(live.woundsCurrent ?? 0, adv.woundThreshold * groupSize)
      }

      newGroupSize      = groupSize
      newGroupRemaining = groupRemaining

      return { ...prev, adversaries: prev.adversaries.map(a =>
        a.instanceId !== adv.instanceId ? a
          : { ...a, groupSize, groupRemaining, woundsCurrent }
      ) }
    })

    if (skipped) return

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

    let next = 0
    let wasDisabled = false
    let skipped = false

    setEncounter(prev => {
      if (!prev) return prev
      const live = (prev.vehicles ?? []).find(v => v.instanceId === vehicle.instanceId)
      if (!live) { skipped = true; return prev }

      const current = live.hullTraumaCurrent
      wasDisabled = current >= vehicle.hullTraumaThreshold
      next = Math.max(0, Math.min(vehicle.hullTraumaThreshold, current + delta))

      return { ...prev, vehicles: (prev.vehicles ?? []).map(v =>
        v.instanceId !== vehicle.instanceId ? v : { ...v, hullTraumaCurrent: next }
      ) }
    })

    if (skipped) return

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

    let skipped = false

    setEncounter(prev => {
      if (!prev) return prev
      const live = (prev.vehicles ?? []).find(v => v.instanceId === vehicle.instanceId)
      if (!live) { skipped = true; return prev }

      const next = Math.max(0, Math.min(vehicle.systemStrainThreshold, live.systemStrainCurrent + delta))

      return { ...prev, vehicles: (prev.vehicles ?? []).map(v =>
        v.instanceId !== vehicle.instanceId ? v : { ...v, systemStrainCurrent: next }
      ) }
    })

    if (skipped) return

    scheduleWrite(`${vehicle.instanceId}:systemStrain`, async () => {
      let latest: VehicleInstance[] = []
      setEncounter(prev => { latest = prev?.vehicles ?? []; return prev })
      await saveEncounter({ vehicles: latest })
    })
  }, [encounter, saveEncounter, setEncounter, scheduleWrite])

  return { adjustAdversaryWounds, adjustAdversaryStrain, adjustGroupSize, adjustHullTrauma, adjustSystemStrain }
}
