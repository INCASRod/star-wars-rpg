'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Character, Campaign } from '@/lib/types'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import type { AdversaryInstance, Adversary } from '@/lib/adversaries'
import type { Vehicle } from '@/lib/vehicles'
import type { MapToken } from '@/hooks/useMapTokens'
import { adversaryToInstance, fetchAdversaries } from '@/lib/adversaries'
import { vehicleToVehicleInstance } from '@/lib/vehicles'

export interface UseGmSessionReturn {
  sessionMode:              'exploration' | 'combat'
  combatRound:              number
  sessionBusy:              boolean
  stagingEncounter:         CombatEncounter | null
  setStagingEncounter:      React.Dispatch<React.SetStateAction<CombatEncounter | null>>
  stagingInitRoster:        AdversaryInstance[]
  setStagingInitRoster:     React.Dispatch<React.SetStateAction<AdversaryInstance[]>>
  stagingGroupSizes:        Record<string, number>
  setStagingGroupSizes:     React.Dispatch<React.SetStateAction<Record<string, number>>>
  endEncounter:             () => Promise<void>
  broadcastCombatState:     (mode: 'combat' | 'exploration', round: number) => void
  openStagingCombatModal:   () => Promise<void>
  handleStagingCombatStart: (data: Omit<CombatEncounter, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  stagingAddToEncounter:    (adv: Adversary, alignment: 'enemy' | 'allied_npc', successes?: number, advantages?: number) => Promise<void>
  stagingAddVehicleToEncounter: (vehicle: Vehicle, alignment: 'enemy' | 'allied_npc', successes?: number, advantages?: number) => Promise<void>
  markEncounterPending:     (key: string) => void
  clearEncounterPending:    (key: string) => void
}

export function useGmSession(params: {
  campaignId:    string | null
  campaign:      Campaign | null
  activeChars:   Character[]
  characters:    Character[]
  stagingTokens: MapToken[]
  activeMapId:   string | null | undefined
  sendToChar:    (charId: string, payload: Record<string, unknown>) => void
}): UseGmSessionReturn {
  const { campaignId, campaign, activeChars, characters, stagingTokens, activeMapId, sendToChar } = params
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])

  const [sessionMode,          setSessionMode]          = useState<'exploration' | 'combat'>('exploration')
  const [combatRound,          setCombatRound]          = useState(1)
  const [sessionBusy,          setSessionBusy]          = useState(false)
  const [stagingEncounter,     setStagingEncounter]     = useState<CombatEncounter | null>(null)
  const [stagingInitRoster,    setStagingInitRoster]    = useState<AdversaryInstance[]>([])
  const [stagingGroupSizes,    setStagingGroupSizes]    = useState<Record<string, number>>({})

  // Keys (`${instanceId}:${statName}`) with an in-flight debounced local write
  // from useEncounterCombatControls. Guards the realtime merge below so an
  // echo of a stale row doesn't clobber a fresher optimistic edit.
  const pendingKeysRef = useRef<Set<string>>(new Set())

  // Tracks the `updated_at` of the most recently APPLIED combat_encounters
  // row (from initial fetch or realtime). Realtime echoes can arrive out of
  // order (Supabase Realtime gives no ordering guarantee across events), so
  // once a write's pending key clears, an older echo arriving late is no
  // longer protected by pendingKeysRef alone — this ref rejects any incoming
  // row that isn't strictly newer, independent of pending-key state.
  const lastAppliedUpdatedAtRef = useRef<string | null>(null)

  const markEncounterPending = useCallback((key: string) => {
    pendingKeysRef.current.add(key)
  }, [])

  const clearEncounterPending = useCallback((key: string) => {
    pendingKeysRef.current.delete(key)
  }, [])

  // Initialise from campaign data (called once after first load)
  useEffect(() => {
    if (!campaign) return
    const c = campaign as Campaign & { session_mode?: string; combat_round?: number }
    if (c.session_mode === 'combat') setSessionMode('combat')
    if (c.combat_round) setCombatRound(c.combat_round)
  }, [campaign])

  // Staging encounter subscription
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('combat_encounters')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setStagingEncounter(data?.[0] as CombatEncounter ?? null)
        lastAppliedUpdatedAtRef.current = data?.[0]?.updated_at ?? null
      })

    const ch = supabase
      .channel(`staging-encounter-page-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'combat_encounters', filter: `campaign_id=eq.${campaignId}` },
        payload => {
          if (!payload.new) return
          const incoming = payload.new as CombatEncounter

          // Staleness pre-check: reject any incoming row that doesn't
          // represent forward progress from the last row we actually
          // applied, regardless of pending-key state. ISO 8601 timestamp
          // strings compare correctly with plain string comparison. This
          // catches out-of-order realtime echoes that arrive AFTER their
          // pending key has already cleared (see comment on the ref above).
          if (lastAppliedUpdatedAtRef.current && incoming.updated_at <= lastAppliedUpdatedAtRef.current) {
            return
          }
          lastAppliedUpdatedAtRef.current = incoming.updated_at

          if (!incoming.is_active) { setStagingEncounter(null); return }

          setStagingEncounter(prev => {
            if (!prev || pendingKeysRef.current.size === 0) return incoming
            // Field-aware merge: for any adversary/vehicle instance with an
            // in-flight debounced local write (tracked by useEncounterCombatControls
            // via markEncounterPending), keep the local version of that instance
            // instead of the incoming row's — otherwise a realtime echo of an
            // older write (or a concurrent unrelated edit) would stomp a newer,
            // still-unwritten local optimistic edit. Everything else (initiative
            // slots, log entries, other untouched instances) takes the incoming row.
            const hasPending = (instanceId: string) => {
              for (const key of pendingKeysRef.current) if (key.startsWith(`${instanceId}:`)) return true
              return false
            }
            const mergedAdversaries = incoming.adversaries.map(incomingAdv => {
              if (!hasPending(incomingAdv.instanceId)) return incomingAdv
              const localAdv = prev.adversaries.find(a => a.instanceId === incomingAdv.instanceId)
              return localAdv ?? incomingAdv
            })
            const mergedVehicles = (incoming.vehicles ?? []).map(incomingVeh => {
              if (!hasPending(incomingVeh.instanceId)) return incomingVeh
              const localVeh = (prev.vehicles ?? []).find(v => v.instanceId === incomingVeh.instanceId)
              return localVeh ?? incomingVeh
            })
            return { ...incoming, adversaries: mergedAdversaries, vehicles: mergedVehicles }
          })
        })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const broadcastCombatState = useCallback((mode: 'combat' | 'exploration', round: number) => {
    for (const c of characters) {
      sendToChar(c.id, { type: 'combat-state', mode, round })
    }
  }, [characters, sendToChar])

  const endEncounter = useCallback(async () => {
    if (!campaignId) return
    setSessionBusy(true)
    await Promise.all([
      supabase.from('campaigns').update({ session_mode: 'exploration', combat_round: 0, mode_changed_at: new Date().toISOString() }).eq('id', campaignId),
      supabase.from('combat_encounters').update({ is_active: false, updated_at: new Date().toISOString() }).eq('campaign_id', campaignId).eq('is_active', true),
      supabase.from('map_tokens').update({ slot_key: null }).eq('campaign_id', campaignId).not('slot_key', 'is', null),
    ])
    setSessionMode('exploration')
    setCombatRound(1)
    setStagingEncounter(null)
    broadcastCombatState('exploration', 0)
    setSessionBusy(false)
    toast('Encounter ended — exploration mode.')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, broadcastCombatState])

  const openStagingCombatModal = useCallback(async () => {
    const advTokens = stagingTokens.filter(
      t => t.participant_type === 'adversary' && t.token_shape !== 'rectangle' && !!t.label
    )
    let roster: AdversaryInstance[] = []
    if (advTokens.length > 0) {
      const names = [...new Set(advTokens.map(t => t.label!))]
      const [{ data: globalData }, { data: customData }, staticAdvs] = await Promise.all([
        supabase.from('ref_adversaries').select('*').in('name', names).is('campaign_id', null),
        supabase.from('ref_adversaries').select('*').in('name', names).eq('campaign_id', campaignId ?? ''),
        fetchAdversaries(),
      ])
      const advMap = new Map<string, Adversary>()
      for (const a of staticAdvs) if (names.includes(a.name)) advMap.set(a.name, a)
      for (const row of [...(globalData ?? []), ...(customData ?? [])]) advMap.set((row as Adversary).name, row as Adversary)
      roster = advTokens
        .map(t => { const a = advMap.get(t.label!); return a ? adversaryToInstance(a, a.type === 'minion' ? 4 : 1) : null })
        .filter((x): x is AdversaryInstance => x !== null)
    }
    setStagingInitRoster(roster)
    // Caller opens the modal by setting activeModal = 'staging-init'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, stagingTokens])

  const handleStagingCombatStart = useCallback(async (
    encounterData: Omit<CombatEncounter, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!campaignId) return
    setSessionBusy(true)

    // Deactivate any staging encounter created during token placement so we
    // don't leave orphaned is_active=true rows alongside the new combat one.
    await supabase
      .from('combat_encounters')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('campaign_id', campaignId)
      .eq('is_active', true)

    const { data } = await supabase
      .from('combat_encounters')
      .upsert({ ...encounterData, campaign_id: campaignId })
      .select()
      .single()
    if (!data) { setSessionBusy(false); return }
    const enc = data as CombatEncounter

    const pcSlots = enc.initiative_slots.filter(s => s.type === 'pc' && s.characterId)
    if (pcSlots.length > 0) {
      await supabase.from('combat_participants').upsert(
        pcSlots.map(s => {
          const char = activeChars.find(c => c.id === s.characterId)
          return {
            campaign_id: campaignId, character_id: s.characterId!,
            slot_type: 'pc' as const,
            default_character_id: s.characterId!, active_character_id: s.characterId!,
            active_character_name: char?.name ?? s.name,
            has_acted_this_round: false,
            active_weapon_key: null, active_weapon_name: null,
            secondary_weapon_name: null, secondary_weapon_key: null,
          }
        }),
        { onConflict: 'campaign_id,character_id' }
      )
    }

    await supabase.from('combat_log').insert({
      campaign_id: campaignId, encounter_id: enc.id,
      participant_name: 'System', alignment: 'system',
      roll_type: 'system',
      result_summary: `Combat started — Round 1 · ${enc.initiative_type === 'cool' ? 'Cool' : 'Vigilance'} initiative`,
      is_visible_to_players: true,
    })

    const npcSlots = enc.initiative_slots.filter(s => s.type === 'npc' && s.adversaryInstanceId)
    const instanceToName = new Map(enc.adversaries.map(a => [a.instanceId, a.name]))
    const slotsByName = new Map<string, string[]>()
    for (const slot of npcSlots) {
      const name = instanceToName.get(slot.adversaryInstanceId!) ?? ''
      slotsByName.set(name, [...(slotsByName.get(name) ?? []), slot.id])
    }
    const usedSlots = new Set<string>()
    for (const token of stagingTokens.filter(
      t => t.participant_type === 'adversary' && t.token_shape !== 'rectangle' && !!t.label
    )) {
      const available = (slotsByName.get(token.label!) ?? []).find(id => !usedSlots.has(id))
      if (!available) continue
      usedSlots.add(available)
      await supabase.from('map_tokens').update({ slot_key: available }).eq('id', token.id)
    }

    const round = 1
    await supabase.from('campaigns').update({
      session_mode: 'combat', combat_round: round, mode_changed_at: new Date().toISOString(),
    }).eq('id', campaignId)
    setSessionMode('combat')
    setCombatRound(round)
    broadcastCombatState('combat', round)
    setStagingEncounter(enc)
    setSessionBusy(false)
    toast('Combat initiated — players notified.')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, activeChars, stagingTokens, broadcastCombatState])

  const stagingAddToEncounter = useCallback(async (
    adv: Adversary, alignment: 'enemy' | 'allied_npc', successes = 0, advantages = 0
  ) => {
    if (!stagingEncounter) return
    const size     = stagingGroupSizes[adv.id] ?? (adv.type === 'minion' ? 4 : 1)
    const instance = adversaryToInstance(adv, size)
    const slotId   = crypto.randomUUID()
    const newSlot: InitiativeSlot = {
      id: slotId, type: 'npc', alignment,
      order: stagingEncounter.initiative_slots.length + 1,
      name: adv.name, acted: false, current: false, successes, advantages,
      adversaryInstanceId: instance.instanceId,
    }
    await supabase.from('combat_encounters').update({
      adversaries:      [...stagingEncounter.adversaries, instance],
      initiative_slots: [...stagingEncounter.initiative_slots, newSlot],
      updated_at:       new Date().toISOString(),
    }).eq('id', stagingEncounter.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagingEncounter, stagingGroupSizes])

  const stagingAddVehicleToEncounter = useCallback(async (
    vehicle: Vehicle, alignment: 'enemy' | 'allied_npc', successes = 0, advantages = 0
  ) => {
    if (!stagingEncounter) return
    const instance = vehicleToVehicleInstance(vehicle, alignment)
    const slotId   = crypto.randomUUID()
    const newSlot: InitiativeSlot = {
      id: slotId, type: 'npc', alignment,
      order: stagingEncounter.initiative_slots.length + 1,
      name: vehicle.name, acted: false, current: false, successes, advantages,
      vehicleInstanceId: instance.instanceId,
    }
    await supabase.from('combat_encounters').update({
      vehicles:         [...(stagingEncounter.vehicles ?? []), instance],
      initiative_slots: [...stagingEncounter.initiative_slots, newSlot],
      updated_at:       new Date().toISOString(),
    }).eq('id', stagingEncounter.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagingEncounter])

  return {
    sessionMode, combatRound, sessionBusy,
    stagingEncounter, setStagingEncounter,
    stagingInitRoster, setStagingInitRoster,
    stagingGroupSizes, setStagingGroupSizes,
    endEncounter,
    broadcastCombatState,
    openStagingCombatModal, handleStagingCombatStart,
    stagingAddToEncounter, stagingAddVehicleToEncounter,
    markEncounterPending, clearEncounterPending,
  }
}
