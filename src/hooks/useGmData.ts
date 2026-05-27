'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character, Campaign, RefDutyType, RefObligationType, CriticalInjuryRequest, RefCriticalInjury, CharacterCriticalInjury } from '@/lib/types'
import type { ForceNotification } from '@/components/gm/ForceNotificationCard'

export interface RefMorality {
  key: string
  name: string
  description?: string
  type: 'Strength' | 'Weakness'
}

export interface UseGmDataReturn {
  campaign:                Campaign | null
  setCampaign:             React.Dispatch<React.SetStateAction<Campaign | null>>
  characters:              Character[]
  setCharacters:           React.Dispatch<React.SetStateAction<Character[]>>
  activeChars:             Character[]
  archivedChars:           Character[]
  players:                 Record<string, string>
  charSpecs:               Record<string, string[]>
  loading:                 boolean
  error:                   string | null
  dutyTypes:               RefDutyType[]
  obligationTypes:         RefObligationType[]
  moralityStrengths:       RefMorality[]
  moralityWeaknesses:      RefMorality[]
  refCritsDb:              RefCriticalInjury[]
  charActiveCritCounts:    Record<string, number>
  setCharActiveCritCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>
  charCrits:               Record<string, CharacterCriticalInjury[]>
  setCharCrits:            React.Dispatch<React.SetStateAction<Record<string, CharacterCriticalInjury[]>>>
  activeSessions:          Record<string, string>
  setActiveSessions:       React.Dispatch<React.SetStateAction<Record<string, string>>>
  rolledCritRequests:      CriticalInjuryRequest[]
  setRolledCritRequests:   React.Dispatch<React.SetStateAction<CriticalInjuryRequest[]>>
  forceNotifications:      ForceNotification[]
  setForceNotifications:   React.Dispatch<React.SetStateAction<ForceNotification[]>>
  handleCharacterUpdated:  (id: string, updates: Partial<Character>) => void
  loadData:                (silent?: boolean) => Promise<void>
}

export function useGmData(campaignId: string | null): UseGmDataReturn {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])

  const [campaign,             setCampaign]             = useState<Campaign | null>(null)
  const [characters,           setCharacters]           = useState<Character[]>([])
  const [players,              setPlayers]              = useState<Record<string, string>>({})
  const [charSpecs,            setCharSpecs]            = useState<Record<string, string[]>>({})
  const [loading,              setLoading]              = useState(true)
  const [error,                setError]                = useState<string | null>(null)
  const [dutyTypes,            setDutyTypes]            = useState<RefDutyType[]>([])
  const [obligationTypes,      setObligationTypes]      = useState<RefObligationType[]>([])
  const [moralityStrengths,    setMoralityStrengths]    = useState<RefMorality[]>([])
  const [moralityWeaknesses,   setMoralityWeaknesses]   = useState<RefMorality[]>([])
  const [refCritsDb,           setRefCritsDb]           = useState<RefCriticalInjury[]>([])
  const [charActiveCritCounts, setCharActiveCritCounts] = useState<Record<string, number>>({})
  const [charCrits,            setCharCrits]            = useState<Record<string, CharacterCriticalInjury[]>>({})
  const [activeSessions,       setActiveSessions]       = useState<Record<string, string>>({})
  const [rolledCritRequests,   setRolledCritRequests]   = useState<CriticalInjuryRequest[]>([])
  const [forceNotifications,   setForceNotifications]   = useState<ForceNotification[]>([])

  const activeChars   = useMemo(() => characters.filter(c => !c.is_archived), [characters])
  const archivedChars = useMemo(() => characters.filter(c =>  c.is_archived), [characters])

  const loadData = useCallback(async (silent = false) => {
    if (!campaignId) {
      setError('No campaign ID provided')
      setLoading(false)
      return
    }
    if (!silent) setLoading(true)
    try {
      await supabase.auth.getSession()

      const [campRes, charRes, playerRes, sessRes, dutyTypesRes, oblTypesRes, moralityRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', campaignId).single(),
        supabase.from('characters').select('*').eq('campaign_id', campaignId).eq('is_archived', false),
        supabase.from('players').select('id, display_name').eq('campaign_id', campaignId).eq('is_gm', false),
        supabase.from('character_sessions').select('character_id, session_key').eq('campaign_id', campaignId).eq('is_active', true),
        supabase.from('ref_duty_types').select('key, name, description').order('name'),
        supabase.from('ref_obligation_types').select('key, name, description').order('name'),
        supabase.from('ref_moralities').select('key, name, description, type').order('name'),
      ])

      if (campRes.error) throw new Error(campRes.error.message)
      setCampaign(campRes.data as Campaign)

      if (dutyTypesRes.error) throw new Error(`Failed to load Duty types: ${dutyTypesRes.error.message}`)
      if (dutyTypesRes.data) setDutyTypes(dutyTypesRes.data as RefDutyType[])

      if (oblTypesRes.error) throw new Error(`Failed to load Obligation types: ${oblTypesRes.error.message}`)
      if (oblTypesRes.data) setObligationTypes(oblTypesRes.data as RefObligationType[])

      if (moralityRes.data) {
        type RawMorality = { key: string; name: string; description?: string; type: string }
        const all = moralityRes.data as RawMorality[]
        setMoralityStrengths(all.filter(m => m.type === 'Strength') as RefMorality[])
        setMoralityWeaknesses(all.filter(m => m.type === 'Weakness') as RefMorality[])
      }

      const chars = (charRes.data as Character[]) || []
      setCharacters(chars)
      setPlayers(
        Object.fromEntries((playerRes.data || []).map((p: { id: string; display_name: string }) => [p.id, p.display_name]))
      )
      setActiveSessions(
        Object.fromEntries((sessRes.data || []).map((s: { character_id: string; session_key: string }) => [s.character_id, s.session_key]))
      )

      if (chars.length > 0) {
        const [specRes, critsRes, refCritsRes] = await Promise.all([
          supabase.from('character_specializations').select('character_id, specialization_key').in('character_id', chars.map(c => c.id)).order('purchase_order'),
          supabase.from('character_critical_injuries').select('*').in('character_id', chars.map(c => c.id)).eq('is_healed', false).order('received_at', { ascending: true }),
          supabase.from('ref_critical_injuries').select('*').order('roll_min'),
        ])
        const specMap: Record<string, string[]> = {}
        for (const row of specRes.data || []) {
          const r = row as { character_id: string; specialization_key: string }
          if (!specMap[r.character_id]) specMap[r.character_id] = []
          specMap[r.character_id].push(r.specialization_key)
        }
        setCharSpecs(specMap)
        const critCounts: Record<string, number> = {}
        const critMap: Record<string, CharacterCriticalInjury[]> = {}
        for (const row of critsRes.data || []) {
          const r = row as CharacterCriticalInjury
          critCounts[r.character_id] = (critCounts[r.character_id] ?? 0) + 1
          ;(critMap[r.character_id] ??= []).push(r)
        }
        setCharActiveCritCounts(critCounts)
        setCharCrits(critMap)
        if (refCritsRes.data) setRefCritsDb(refCritsRes.data as RefCriticalInjury[])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  useEffect(() => { void loadData() }, [loadData])

  // Load pending force notifications on mount
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('force_notifications')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setForceNotifications(data as ForceNotification[]) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // Load rolled crit requests on mount
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('critical_injury_requests')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'rolled')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setRolledCritRequests(data as CriticalInjuryRequest[]) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // Realtime subscription
  useEffect(() => {
    if (!campaignId) return
    const channel = supabase
      .channel(`gm-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'characters' }, (payload) => {
        const row = payload.new as Character | undefined
        if (row?.campaign_id === campaignId) void loadData(true)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_skills' }, () => void loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_talents' }, () => void loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_weapons' }, () => void loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_armor' }, () => void loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_gear' }, () => void loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_specializations' }, () => void loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_force_abilities' }, () => void loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_critical_injuries' }, () => void loadData(true))
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'critical_injury_requests',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        const row = payload.new as CriticalInjuryRequest | undefined
        if (!row) return
        if (row.status === 'rolled') {
          setRolledCritRequests(prev =>
            prev.some(r => r.id === row.id) ? prev.map(r => r.id === row.id ? row : r) : [row, ...prev]
          )
        } else if (row.status === 'dismissed') {
          setRolledCritRequests(prev => prev.filter(r => r.id !== row.id))
        }
      })
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'force_notifications',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        setForceNotifications(prev => [payload.new as ForceNotification, ...prev])
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'character_sessions',
        filter: `campaign_id=eq.${campaignId}`,
      }, async () => {
        const { data } = await supabase
          .from('character_sessions')
          .select('character_id, session_key')
          .eq('campaign_id', campaignId)
          .eq('is_active', true)
        setActiveSessions(
          Object.fromEntries((data || []).map((s: { character_id: string; session_key: string }) => [s.character_id, s.session_key]))
        )
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, loadData])

  const handleCharacterUpdated = useCallback((id: string, updates: Partial<Character>) => {
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  return {
    campaign, setCampaign,
    characters, setCharacters,
    activeChars, archivedChars,
    players, charSpecs,
    loading, error,
    dutyTypes, obligationTypes, moralityStrengths, moralityWeaknesses,
    refCritsDb, charActiveCritCounts, setCharActiveCritCounts, charCrits, setCharCrits,
    activeSessions, setActiveSessions,
    rolledCritRequests, setRolledCritRequests,
    forceNotifications, setForceNotifications,
    handleCharacterUpdated, loadData,
  }
}
