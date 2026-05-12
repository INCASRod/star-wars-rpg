'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Character, Campaign } from '@/lib/types'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import type { AdversaryInstance, Adversary } from '@/lib/adversaries'
import type { Vehicle } from '@/lib/vehicles'
import type { MapToken } from '@/hooks/useMapTokens'
import { adversaryToInstance, fetchAdversaries } from '@/lib/adversaries'
import { vehicleToVehicleInstance, fetchVehicles, dbRowToVehicle } from '@/lib/vehicles'

export interface UseGmSessionReturn {
  sessionMode:              'exploration' | 'combat'
  combatRound:              number
  sessionBusy:              boolean
  stagingEncounter:         CombatEncounter | null
  setStagingEncounter:      React.Dispatch<React.SetStateAction<CombatEncounter | null>>
  stagingInitRoster:        AdversaryInstance[]
  setStagingInitRoster:     React.Dispatch<React.SetStateAction<AdversaryInstance[]>>
  stagingLibrary:           (Adversary & { _isCustom?: boolean })[]
  stagingLibraryLoaded:     boolean
  stagingGroupSizes:        Record<string, number>
  setStagingGroupSizes:     React.Dispatch<React.SetStateAction<Record<string, number>>>
  beginCombat:              () => Promise<void>
  endEncounter:             () => Promise<void>
  changeRound:              (delta: number) => Promise<void>
  broadcastCombatState:     (mode: 'combat' | 'exploration', round: number) => void
  openStagingCombatModal:   () => Promise<void>
  handleStagingCombatStart: (data: Omit<CombatEncounter, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  stagingAddToEncounter:    (adv: Adversary, alignment: 'enemy' | 'allied_npc', successes?: number, advantages?: number) => Promise<void>
  stagingAddVehicleToEncounter: (vehicle: Vehicle, alignment: 'enemy' | 'allied_npc', successes?: number, advantages?: number) => Promise<void>
  loadStagingLibrary:       () => Promise<void>
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
  const [stagingLibrary,       setStagingLibrary]       = useState<(Adversary & { _isCustom?: boolean })[]>([])
  const [stagingLibraryLoaded, setStagingLibraryLoaded] = useState(false)
  const [stagingGroupSizes,    setStagingGroupSizes]    = useState<Record<string, number>>({})

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
      .then(({ data }) => setStagingEncounter(data?.[0] as CombatEncounter ?? null))

    const ch = supabase
      .channel(`staging-encounter-page-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'combat_encounters', filter: `campaign_id=eq.${campaignId}` },
        payload => {
          if (payload.new) {
            const enc = payload.new as CombatEncounter
            setStagingEncounter(enc.is_active ? enc : null)
          }
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

  const autoPopulateEncounterFromTokens = useCallback(async () => {
    if (!campaignId) return

    const { data: rows } = await supabase
      .from('combat_encounters')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    let enc: CombatEncounter | null = rows && rows.length > 0 ? (rows[0] as CombatEncounter) : null
    if (!enc) {
      const { data: created } = await supabase
        .from('combat_encounters')
        .insert({
          campaign_id: campaignId, round: 1, is_active: true, current_slot_index: 0,
          initiative_type: 'cool', initiative_slots: [], adversaries: [], vehicles: [], log_entries: [],
        })
        .select('*')
        .single()
      enc = created as CombatEncounter | null
    }
    if (!enc) return
    if (!activeMapId) return

    const pending = stagingTokens.filter(t => t.participant_type === 'adversary' && !t.slot_key && !!t.label)
    if (pending.length === 0) return

    const advTokens = pending.filter(t => t.token_shape !== 'rectangle')
    const vehTokens = pending.filter(t => t.token_shape === 'rectangle')

    const advNames = [...new Set(advTokens.map(t => t.label!))]
    const advMap = new Map<string, Adversary>()
    if (advNames.length > 0) {
      const { data } = await supabase.from('ref_adversaries').select('*').in('name', advNames)
      for (const row of (data ?? [])) advMap.set((row as Adversary).name, row as Adversary)
    }

    const vehNames = [...new Set(vehTokens.map(t => t.label!))]
    const vehMap = new Map<string, Vehicle>()
    if (vehNames.length > 0) {
      const { data: customRows } = await supabase.from('ref_vehicles').select('*').in('name', vehNames)
      for (const row of (customRows ?? [])) {
        const v = dbRowToVehicle(row as Record<string, unknown>)
        vehMap.set(v.name, v)
      }
      const missingNames = vehNames.filter(n => !vehMap.has(n))
      if (missingNames.length > 0) {
        const all = await fetchVehicles()
        for (const v of all) if (missingNames.includes(v.name)) vehMap.set(v.name, v)
      }
    }

    const newAdversaries = [...enc.adversaries]
    const newVehicles    = [...(enc.vehicles ?? [])]
    const newSlots       = [...enc.initiative_slots]
    const slotUpdates: Array<{ tokenId: string; slotId: string }> = []

    for (const token of advTokens) {
      const adv = advMap.get(token.label!)
      if (!adv) continue
      const instance = adversaryToInstance(adv, adv.type === 'minion' ? 4 : 1)
      const slotId   = crypto.randomUUID()
      newAdversaries.push(instance)
      newSlots.push({
        id: slotId, type: 'npc',
        alignment: token.alignment === 'allied_npc' ? 'allied_npc' : 'enemy',
        order: newSlots.length + 1, name: token.label ?? adv.name,
        acted: false, current: false, successes: 0, advantages: 0,
        adversaryInstanceId: instance.instanceId,
      } as InitiativeSlot)
      slotUpdates.push({ tokenId: token.id, slotId })
    }

    for (const token of vehTokens) {
      const veh = vehMap.get(token.label!)
      if (!veh) continue
      const alignment = token.alignment === 'allied_npc' ? 'allied_npc' : 'enemy'
      const instance  = vehicleToVehicleInstance(veh, alignment, token.token_image_url)
      const slotId    = crypto.randomUUID()
      newVehicles.push(instance)
      newSlots.push({
        id: slotId, type: 'npc', alignment,
        order: newSlots.length + 1, name: token.label ?? veh.name,
        acted: false, current: false, successes: 0, advantages: 0,
        vehicleInstanceId: instance.instanceId,
      } as InitiativeSlot)
      slotUpdates.push({ tokenId: token.id, slotId })
    }

    await supabase.from('combat_encounters').update({
      adversaries: newAdversaries, vehicles: newVehicles,
      initiative_slots: newSlots, updated_at: new Date().toISOString(),
    }).eq('id', enc.id)

    await Promise.all(
      slotUpdates.map(({ tokenId, slotId }) =>
        supabase.from('map_tokens').update({ slot_key: slotId }).eq('id', tokenId)
      )
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, stagingTokens, activeMapId])

  const beginCombat = useCallback(async () => {
    if (!campaignId) return
    setSessionBusy(true)
    const round = 1
    await supabase.from('campaigns').update({
      session_mode: 'combat', combat_round: round, mode_changed_at: new Date().toISOString(),
    }).eq('id', campaignId)
    setSessionMode('combat')
    setCombatRound(round)
    broadcastCombatState('combat', round)
    await autoPopulateEncounterFromTokens()
    setSessionBusy(false)
    toast('Combat initiated — players notified.')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, broadcastCombatState, autoPopulateEncounterFromTokens])

  const endEncounter = useCallback(async () => {
    if (!campaignId) return
    setSessionBusy(true)
    await Promise.all([
      supabase.from('campaigns').update({ session_mode: 'exploration', combat_round: 0, mode_changed_at: new Date().toISOString() }).eq('id', campaignId),
      supabase.from('combat_encounters').update({ is_active: false, updated_at: new Date().toISOString() }).eq('campaign_id', campaignId).eq('is_active', true),
    ])
    setSessionMode('exploration')
    setCombatRound(1)
    setStagingEncounter(null)
    broadcastCombatState('exploration', 0)
    setSessionBusy(false)
    toast('Encounter ended — exploration mode.')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, broadcastCombatState])

  const changeRound = useCallback(async (delta: number) => {
    if (!campaignId || sessionMode !== 'combat') return
    const next = Math.max(1, combatRound + delta)
    await supabase.from('campaigns').update({ combat_round: next }).eq('id', campaignId)
    setCombatRound(next)
    broadcastCombatState('combat', next)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, sessionMode, combatRound, broadcastCombatState])

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
      t => t.participant_type === 'adversary' && t.token_shape !== 'rectangle' && !t.slot_key && !!t.label
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

  const loadStagingLibrary = useCallback(async () => {
    if (stagingLibraryLoaded || !campaignId) return
    const [{ data: ref }, { data: custom }] = await Promise.all([
      supabase.from('ref_adversaries').select('*').is('campaign_id', null).order('name'),
      supabase.from('ref_adversaries').select('*').eq('campaign_id', campaignId).order('name'),
    ])
    const merged = [
      ...(ref ?? []).map((a: Adversary) => ({ ...a })),
      ...(custom ?? []).map((a: Adversary) => ({ ...a, _isCustom: true as const })),
    ]
    setStagingLibrary(merged as (Adversary & { _isCustom?: boolean })[])
    setStagingLibraryLoaded(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, stagingLibraryLoaded])

  return {
    sessionMode, combatRound, sessionBusy,
    stagingEncounter, setStagingEncounter,
    stagingInitRoster, setStagingInitRoster,
    stagingLibrary, stagingLibraryLoaded,
    stagingGroupSizes, setStagingGroupSizes,
    beginCombat, endEncounter, changeRound,
    broadcastCombatState,
    openStagingCombatModal, handleStagingCombatStart,
    stagingAddToEncounter, stagingAddVehicleToEncounter,
    loadStagingLibrary,
  }
}
