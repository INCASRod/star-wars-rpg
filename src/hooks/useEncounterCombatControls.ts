'use client'

import { useCallback, useRef, useEffect } from 'react'
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

  // Mirrors `encounter` so every mutator below always reads the truly-latest
  // value synchronously in plain JS, never via a setState updater. The
  // previous approach read "the latest state" with a
  // `setEncounter(prev => { latest = prev; return prev })` trick, which
  // silently depended on React's undocumented "eager state" bailout
  // optimization — that optimization only computes the updater synchronously
  // for the FIRST update dispatched while a fiber is otherwise quiescent. A
  // fast click burst queues multiple updates before React gets a chance to
  // re-render, so only the first click in a burst got the eager path; the
  // rest silently read a stale value and — critically — could skip
  // `scheduleWrite` entirely (see each mutator's early-return guards below),
  // leaving an earlier, now-stale debounced write for the same key
  // uncancelled. It would later fire on its own schedule carrying the
  // pre-burst value, visibly reverting the displayed number for seconds.
  // Writing to this ref happens directly and synchronously on every local
  // optimistic change (see each mutator), independent of React's render
  // timing, and it stays in sync with externally-driven changes (realtime
  // merges landing via `setEncounter` from outside this hook) through the
  // effect below.
  const encounterRef = useRef(encounter)
  useEffect(() => { encounterRef.current = encounter }, [encounter])

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
    const prev = encounterRef.current
    if (!prev) return
    const live = prev.adversaries.find(a => a.instanceId === adv.instanceId)
    if (!live) return

    const currentWounds = live.woundsCurrent ?? 0
    const clampedDelta  = delta < 0 ? Math.max(delta, -currentWounds) : delta
    if (clampedDelta === 0 && delta < 0) return

    const wasDefeated = adv.type === 'minion'
      ? live.groupRemaining === 0
      : currentWounds >= adv.woundThreshold

    const groupSizeAtWrite = live.groupSize
    const result = applyDamageToAdversary({
      type: adv.type, name: adv.name,
      woundThreshold: adv.woundThreshold,
      groupSize: live.groupSize, groupRemaining: live.groupRemaining,
      woundsCurrent: currentWounds,
    }, clampedDelta)

    const next: CombatEncounter = {
      ...prev,
      adversaries: prev.adversaries.map(a =>
        a.instanceId !== adv.instanceId ? a
          : { ...a, woundsCurrent: Math.max(0, result.woundsCurrent), groupRemaining: result.groupRemaining }
      ),
    }
    encounterRef.current = next
    setEncounter(next)

    scheduleWrite(`${adv.instanceId}:wounds`, async () => {
      await saveEncounter({ adversaries: encounterRef.current?.adversaries ?? [] })
    })

    const advSlot = next.initiative_slots.find(
      (s: InitiativeSlot) => s.adversaryInstanceId === adv.instanceId
    )
    if (advSlot) {
      const tok = tokens.find(t => t.slot_key === advSlot.id)
      if (tok) {
        const pct = adv.type === 'minion'
          ? 1 - (result.groupRemaining / Math.max(1, groupSizeAtWrite))
          : Math.min(1, result.woundsCurrent / Math.max(1, adv.woundThreshold))
        void updateTokenWoundPct(tok.id, pct)
      }
    }

    if (!wasDefeated && result.isDefeated && next.id) {
      const msg = result.defeatMessage ?? `${adv.name} — DEFEATED`
      onDefeat?.(msg)
      await supabase.from('combat_log').insert({
        campaign_id:    campaignId,
        encounter_id:   next.id,
        participant_name: 'SYSTEM',
        alignment:      'system',
        roll_type:      'system',
        result_summary: msg,
        is_visible_to_players: true,
      })
      if (adv.squad_active) await onDisbandSquad?.(adv.instanceId)
    }
  }, [campaignId, saveEncounter, setEncounter, supabase, tokens, updateTokenWoundPct, scheduleWrite, onDefeat, onDisbandSquad])

  const adjustAdversaryStrain = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (adv.type !== 'nemesis') return
    const prev = encounterRef.current
    if (!prev) return
    const live = prev.adversaries.find(a => a.instanceId === adv.instanceId)
    if (!live) return

    const strainMax    = adv.strainThreshold ?? 0
    const current       = live.strainCurrent ?? 0
    const nextStrain     = Math.max(0, Math.min(strainMax > 0 ? strainMax : 999, current + delta))

    const next: CombatEncounter = {
      ...prev,
      adversaries: prev.adversaries.map(a =>
        a.instanceId !== adv.instanceId ? a : { ...a, strainCurrent: nextStrain }
      ),
    }
    encounterRef.current = next
    setEncounter(next)

    scheduleWrite(`${adv.instanceId}:strain`, async () => {
      await saveEncounter({ adversaries: encounterRef.current?.adversaries ?? [] })
    })
  }, [saveEncounter, setEncounter, scheduleWrite])

  const adjustGroupSize = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (adv.type !== 'minion') return
    const prev = encounterRef.current
    if (!prev) return
    const live = prev.adversaries.find(a => a.instanceId === adv.instanceId)
    if (!live) return

    const groupSize = Math.max(1, live.groupSize + delta)
    if (groupSize === live.groupSize) return

    let groupRemaining: number
    let woundsCurrent: number
    if (delta > 0) {
      groupRemaining = live.groupRemaining + 1
      woundsCurrent  = live.woundsCurrent ?? 0
    } else {
      groupRemaining = Math.min(live.groupRemaining, groupSize)
      woundsCurrent  = Math.min(live.woundsCurrent ?? 0, adv.woundThreshold * groupSize)
    }

    const next: CombatEncounter = {
      ...prev,
      adversaries: prev.adversaries.map(a =>
        a.instanceId !== adv.instanceId ? a
          : { ...a, groupSize, groupRemaining, woundsCurrent }
      ),
    }
    encounterRef.current = next
    setEncounter(next)

    scheduleWrite(`${adv.instanceId}:groupSize`, async () => {
      await saveEncounter({ adversaries: encounterRef.current?.adversaries ?? [] })
    })

    const advSlot = next.initiative_slots.find(
      (s: InitiativeSlot) => s.adversaryInstanceId === adv.instanceId
    )
    if (advSlot) {
      const tok = tokens.find(t => t.slot_key === advSlot.id)
      if (tok) {
        const pct = 1 - (groupRemaining / Math.max(1, groupSize))
        void updateTokenWoundPct(tok.id, pct)
      }
    }
  }, [saveEncounter, setEncounter, tokens, updateTokenWoundPct, scheduleWrite])

  const adjustHullTrauma = useCallback(async (vehicle: VehicleInstance, delta: number) => {
    const prev = encounterRef.current
    if (!prev) return
    const live = (prev.vehicles ?? []).find(v => v.instanceId === vehicle.instanceId)
    if (!live) return

    const current      = live.hullTraumaCurrent
    const wasDisabled   = current >= vehicle.hullTraumaThreshold
    const nextTrauma     = Math.max(0, Math.min(vehicle.hullTraumaThreshold, current + delta))

    const next: CombatEncounter = {
      ...prev,
      vehicles: (prev.vehicles ?? []).map(v =>
        v.instanceId !== vehicle.instanceId ? v : { ...v, hullTraumaCurrent: nextTrauma }
      ),
    }
    encounterRef.current = next
    setEncounter(next)

    scheduleWrite(`${vehicle.instanceId}:hullTrauma`, async () => {
      await saveEncounter({ vehicles: encounterRef.current?.vehicles ?? [] })
    })

    const vSlot = next.initiative_slots.find(s => s.vehicleInstanceId === vehicle.instanceId)
    if (vSlot) {
      const tok = tokens.find(t => t.slot_key === vSlot.id)
      if (tok) {
        const pct = Math.min(1, nextTrauma / Math.max(1, vehicle.hullTraumaThreshold))
        void updateTokenWoundPct(tok.id, pct)
      }
    }

    if (!wasDisabled && nextTrauma >= vehicle.hullTraumaThreshold && next.id) {
      await supabase.from('combat_log').insert({
        campaign_id:    campaignId,
        encounter_id:   next.id,
        participant_name: 'SYSTEM',
        alignment:      'system',
        roll_type:      'system',
        result_summary: `${vehicle.name} — DISABLED (Hull Trauma ${nextTrauma}/${vehicle.hullTraumaThreshold})`,
        is_visible_to_players: true,
      })
    }
  }, [campaignId, saveEncounter, setEncounter, supabase, tokens, updateTokenWoundPct, scheduleWrite])

  const adjustSystemStrain = useCallback(async (vehicle: VehicleInstance, delta: number) => {
    const prev = encounterRef.current
    if (!prev) return
    const live = (prev.vehicles ?? []).find(v => v.instanceId === vehicle.instanceId)
    if (!live) return

    const nextStrain = Math.max(0, Math.min(vehicle.systemStrainThreshold, live.systemStrainCurrent + delta))

    const next: CombatEncounter = {
      ...prev,
      vehicles: (prev.vehicles ?? []).map(v =>
        v.instanceId !== vehicle.instanceId ? v : { ...v, systemStrainCurrent: nextStrain }
      ),
    }
    encounterRef.current = next
    setEncounter(next)

    scheduleWrite(`${vehicle.instanceId}:systemStrain`, async () => {
      await saveEncounter({ vehicles: encounterRef.current?.vehicles ?? [] })
    })
  }, [saveEncounter, setEncounter, scheduleWrite])

  return { adjustAdversaryWounds, adjustAdversaryStrain, adjustGroupSize, adjustHullTrauma, adjustSystemStrain }
}
