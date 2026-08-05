'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Character, Campaign } from '@/lib/types'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import type { AdversaryInstance, Adversary } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'
import type { MapToken } from '@/hooks/useMapTokens'
import { adversaryToInstance } from '@/lib/adversaries'
import { ensureEncounterForMap } from '@/lib/encounters'

export interface UseGmSessionReturn {
  sessionMode:              'exploration' | 'combat'
  combatRound:              number
  sessionBusy:              boolean
  stagingEncounter:         CombatEncounter | null
  setStagingEncounter:      React.Dispatch<React.SetStateAction<CombatEncounter | null>>
  stagingInitRoster:        AdversaryInstance[]
  setStagingInitRoster:     React.Dispatch<React.SetStateAction<AdversaryInstance[]>>
  stagingVehicleRoster:     VehicleInstance[]
  setStagingVehicleRoster:  React.Dispatch<React.SetStateAction<VehicleInstance[]>>
  stagingGroupSizes:        Record<string, number>
  setStagingGroupSizes:     React.Dispatch<React.SetStateAction<Record<string, number>>>
  endEncounter:             () => Promise<void>
  broadcastCombatState:     (mode: 'combat' | 'exploration', round: number) => void
  openStagingCombatModal:   () => Promise<void>
  handleStagingCombatStart: (data: Omit<CombatEncounter, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  stagingAddToEncounter:    (adv: Adversary, alignment: 'enemy' | 'allied_npc', successes?: number, advantages?: number) => Promise<void>
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
  const [stagingVehicleRoster, setStagingVehicleRoster] = useState<VehicleInstance[]>([])
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

  // Encounter deck subscription — one persistent row per map (migration 115).
  // Keyed on the active map, not on `is_active`: the deck exists and loads
  // whether or not combat is live, and switching maps swaps decks.
  useEffect(() => {
    if (!campaignId) return
    if (!activeMapId) { setStagingEncounter(null); lastAppliedUpdatedAtRef.current = null; return }
    supabase
      .from('combat_encounters')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('map_id', activeMapId)
      .maybeSingle()
      .then(({ data }) => {
        setStagingEncounter((data as CombatEncounter) ?? null)
        lastAppliedUpdatedAtRef.current = (data as CombatEncounter)?.updated_at ?? null
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

          // Only this map's deck. `is_active` is no longer a row-existence
          // flag (migration 115) — an encounter with combat ended is still the
          // live deck, so nulling state on !is_active would empty the deck the
          // moment combat ends, which is exactly the old bug.
          if (incoming.map_id !== activeMapId) return

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
  }, [campaignId, activeMapId])

  const broadcastCombatState = useCallback((mode: 'combat' | 'exploration', round: number) => {
    for (const c of characters) {
      sendToChar(c.id, { type: 'combat-state', mode, round })
    }
  }, [characters, sendToChar])

  const endEncounter = useCallback(async () => {
    if (!campaignId) return
    setSessionBusy(true)
    // Ends the COMBAT PHASE only (migration 115). The encounter deck itself —
    // adversaries, vehicles, their tokens and the token↔instance `slot_key`
    // links — survives into exploration and stays loaded with its map.
    // Previously this also flipped `is_active = false` on the row (emptying the
    // deck for every map) and nulled `map_tokens.slot_key` campaign-wide
    // (permanently detaching every surviving token from its instance).
    //
    // Initiative slots do not persist outside combat — Begin Combat regenerates
    // them wholesale — but they are kept here rather than cleared so tokens
    // placed during this fight keep resolving their instance until then; the
    // per-slot combat state is reset instead.
    const clearedSlots = (stagingEncounter?.initiative_slots ?? []).map(s => ({
      ...s, acted: false, current: false,
    }))
    await Promise.all([
      supabase.from('campaigns').update({ session_mode: 'exploration', combat_round: 0, mode_changed_at: new Date().toISOString() }).eq('id', campaignId),
      supabase.from('combat_encounters').update({
        is_active: false, round: 1, current_slot_index: 0,
        initiative_slots: clearedSlots,
        updated_at: new Date().toISOString(),
      }).eq('campaign_id', campaignId).eq('is_active', true),
    ])
    setSessionMode('exploration')
    setCombatRound(1)
    broadcastCombatState('exploration', 0)
    setSessionBusy(false)
    toast('Combat ended — deck kept, exploration mode.')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, broadcastCombatState, stagingEncounter])

  // Builds the Begin Combat roster straight from the encounter itself —
  // `stagingEncounter.adversaries`/`.vehicles` are already the correct
  // AdversaryInstance[]/VehicleInstance[] shape InitiativeSetupModal wants
  // (same data the Recheck-initiative modal hands it directly, see
  // GmShell.tsx). Filtering by `map_id` mirrors EncounterDeck's `buildRoster`
  // exactly, so map scoping (Prompt 12) and off-map/benched entities (no
  // token yet, but still map_id-stamped) both carry over for free. This
  // replaces a prior implementation that rebuilt a roster from `stagingTokens`
  // by matching each token's label against the ref catalog's exact `name` —
  // that silently dropped any entry whose token label didn't match verbatim,
  // which is every auto-numbered duplicate (minion groups, 2nd+ spawns of the
  // same adversary/vehicle) and any custom-nicknamed token, while requiring a
  // placed token at all (excluding off-map entries outright).
  const openStagingCombatModal = useCallback(async () => {
    setStagingInitRoster((stagingEncounter?.adversaries ?? []).filter(a => a.map_id === activeMapId))
    setStagingVehicleRoster((stagingEncounter?.vehicles ?? []).filter(v => v.map_id === activeMapId))
    // Caller opens the modal by setting activeModal = 'staging-init'
  }, [stagingEncounter, activeMapId])

  const handleStagingCombatStart = useCallback(async (
    encounterData: Omit<CombatEncounter, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!campaignId) return
    if (!activeMapId) { toast.error('No active map — cannot start combat.'); return }
    setSessionBusy(true)

    // Combat runs on the active map's existing deck (migration 115) — this no
    // longer inserts a row, so the adversaries/vehicles staged before combat
    // are the ones that fight. Initiative slots are regenerated wholesale from
    // the setup modal every Begin Combat; they carry no state between fights.
    const deck = await ensureEncounterForMap(supabase, campaignId, activeMapId)
    if (!deck) { setSessionBusy(false); toast.error('Could not open the encounter for this map.'); return }

    // Merge rather than replace the rosters: the setup modal only ever sees
    // this map's entries and may have edited them (group sizes), but the deck
    // also holds entries the GM left out of the initiative order — those stay
    // on the deck as non-combatants instead of being wiped by the modal's
    // narrower list.
    const mergeById = <T extends { instanceId: string }>(deckRows: T[], modalRows: T[]): T[] => {
      const edited = new Map(modalRows.map(r => [r.instanceId, r]))
      const merged = deckRows.map(r => edited.get(r.instanceId) ?? r)
      const known = new Set(deckRows.map(r => r.instanceId))
      return [...merged, ...modalRows.filter(r => !known.has(r.instanceId))]
    }
    const { data } = await supabase
      .from('combat_encounters')
      .update({
        ...encounterData,
        // Never let the modal's payload move the deck off its map.
        map_id: activeMapId,
        adversaries: mergeById(deck.adversaries ?? [], encounterData.adversaries ?? []),
        vehicles:    mergeById(deck.vehicles ?? [], encounterData.vehicles ?? []),
        is_active: true, updated_at: new Date().toISOString(),
      })
      .eq('id', deck.id)
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

    // Vehicle tokens (rectangle shape) — wire slot_key for vehicles the GM
    // gave their own initiative slot. Vehicles left off the order (no slot)
    // simply keep slot_key null, same as any unrolled adversary.
    const vehicleSlots = enc.initiative_slots.filter(s => s.type === 'npc' && s.vehicleInstanceId)
    const vehicleInstanceToName = new Map((enc.vehicles ?? []).map(v => [v.instanceId, v.name]))
    const vehicleSlotsByName = new Map<string, string[]>()
    for (const slot of vehicleSlots) {
      const name = vehicleInstanceToName.get(slot.vehicleInstanceId!) ?? ''
      vehicleSlotsByName.set(name, [...(vehicleSlotsByName.get(name) ?? []), slot.id])
    }
    const usedVehicleSlots = new Set<string>()
    for (const token of stagingTokens.filter(
      t => t.participant_type === 'adversary' && t.token_shape === 'rectangle' && !!t.label
    )) {
      const available = (vehicleSlotsByName.get(token.label!) ?? []).find(id => !usedVehicleSlots.has(id))
      if (!available) continue
      usedVehicleSlots.add(available)
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
    if (!campaignId) return
    if (!activeMapId) { toast.error('No active map — open a map before adding to the encounter.'); return }
    // Creates this map's deck on first add rather than bailing when combat has
    // never been started (migration 115) — the silent early return here was why
    // off-map adds from the Encounter Deck did nothing at all.
    const enc = await ensureEncounterForMap(supabase, campaignId, activeMapId)
    if (!enc) { toast.error('Could not open the encounter for this map.'); return }
    const size     = stagingGroupSizes[adv.id] ?? (adv.type === 'minion' ? 4 : 1)
    const instance = adversaryToInstance(adv, size)
    instance.map_id = activeMapId
    const slotId   = crypto.randomUUID()
    const newSlot: InitiativeSlot = {
      id: slotId, type: 'npc', alignment,
      order: (enc.initiative_slots?.length ?? 0) + 1,
      name: adv.name, acted: false, current: false, successes, advantages,
      adversaryInstanceId: instance.instanceId,
    }
    const { error } = await supabase.from('combat_encounters').update({
      adversaries:      [...(enc.adversaries ?? []), instance],
      initiative_slots: [...(enc.initiative_slots ?? []), newSlot],
      updated_at:       new Date().toISOString(),
    }).eq('id', enc.id)
    if (error) { toast.error(`Could not add ${adv.name}: ${error.message}`); return }
    toast.success(`${adv.name} added off-map.`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, stagingGroupSizes, activeMapId])

  return {
    sessionMode, combatRound, sessionBusy,
    stagingEncounter, setStagingEncounter,
    stagingInitRoster, setStagingInitRoster,
    stagingVehicleRoster, setStagingVehicleRoster,
    stagingGroupSizes, setStagingGroupSizes,
    endEncounter,
    broadcastCombatState,
    openStagingCombatModal, handleStagingCombatStart,
    stagingAddToEncounter,
    markEncounterPending, clearEncounterPending,
  }
}
