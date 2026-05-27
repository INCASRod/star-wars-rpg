'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { archiveCharacter, restoreCharacter } from '@/lib/characters'
import type { Character, CriticalInjuryRequest, RefCriticalInjury, CharacterCriticalInjury } from '@/lib/types'
import type { RefMorality } from './useGmData'
import type { GmConflictRow } from './useGmCampaignConflicts'
export interface MoralitySetupState {
  id: string; name: string
  score: number
  strengthKey: string; weaknessKey: string
  strengthDesc: string; weaknessDesc: string
}

export interface UseGmCharacterActionsReturn {
  // Crit injury request
  critReqOpenFor:          string | null
  setCritReqOpenFor:       React.Dispatch<React.SetStateAction<string | null>>
  critReqVicious:          number
  setCritReqVicious:       React.Dispatch<React.SetStateAction<number>>
  critReqLethal:           number
  setCritReqLethal:        React.Dispatch<React.SetStateAction<number>>
  critReqGm:               number
  setCritReqGm:            React.Dispatch<React.SetStateAction<number>>
  critReqBusy:             boolean
  critCustomNames:         Record<string, string>
  setCritCustomNames:      React.Dispatch<React.SetStateAction<Record<string, string>>>
  sendCritRequest:         (charId: string) => Promise<void>
  confirmCritResult:       (req: CriticalInjuryRequest) => Promise<void>
  cancelCritResult:        (req: CriticalInjuryRequest) => Promise<void>
  overrideCritResult:      (req: CriticalInjuryRequest, injuryId: number) => Promise<void>
  healCrit:                (critId: string, charId: string) => Promise<void>
  healCritInjury:          (injuryId: string) => Promise<void>
  resolveConflict:         (conflictId: string) => Promise<void>
  // Add critical injury (direct apply)
  addCritOpenFor:    string | null
  setAddCritOpenFor: React.Dispatch<React.SetStateAction<string | null>>
  addCritRefId:      number | null
  addCritName:       string
  setAddCritName:    React.Dispatch<React.SetStateAction<string>>
  addCritDesc:       string
  setAddCritDesc:    React.Dispatch<React.SetStateAction<string>>
  addCritSeverity:   string
  addCritBusy:       boolean
  selectAddCritRef:  (refId: number) => void
  closeAddCrit:      () => void
  addCriticalInjury: (charId: string) => Promise<void>
  // Wound / strain
  addWound:    (charId: string, amount: number) => Promise<void>
  healWounds:  (charId: string, amount: number) => Promise<void>
  addStrain:   (charId: string, amount: number) => Promise<void>
  healStrain:  (charId: string, amount: number) => Promise<void>
  // D&O
  odMode:       'group' | 'individual'
  setOdMode:    React.Dispatch<React.SetStateAction<'group' | 'individual'>>
  odType:       'obligation' | 'duty'
  setOdType:    React.Dispatch<React.SetStateAction<'obligation' | 'duty'>>
  odAmount:     string
  setOdAmount:  React.Dispatch<React.SetStateAction<string>>
  odTarget:     string
  setOdTarget:  React.Dispatch<React.SetStateAction<string>>
  odBusy:       boolean
  adjustObligation: (charId: string, delta: number) => Promise<void>
  adjustDuty:       (charId: string, delta: number) => Promise<void>
  adjustMorality:   (charId: string, delta: number) => Promise<void>
  handleBulkOD:     () => Promise<void>
  handleIndividualOD: () => Promise<void>
  // Morality setup
  moralitySetup:   MoralitySetupState | null
  setMoralitySetup: React.Dispatch<React.SetStateAction<MoralitySetupState | null>>
  moralityBusy:    boolean
  openMoralitySetup:  (c: Character) => void
  handleMoralitySave: () => Promise<void>
  // Archive / restore
  archiveConfirm:  { id: string; name: string } | null
  setArchiveConfirm: React.Dispatch<React.SetStateAction<{ id: string; name: string } | null>>
  archiveBusy:     boolean
  archiveOpen:     boolean
  setArchiveOpen:  React.Dispatch<React.SetStateAction<boolean>>
  handleArchive:   () => Promise<void>
  handleRestore:   (charId: string, charName: string) => Promise<void>
  // Dark side fall / redemption
  fallenConfirm:   { id: string; name: string; isFallen: boolean; morality?: number | null } | null
  setFallenConfirm: React.Dispatch<React.SetStateAction<{ id: string; name: string; isFallen: boolean; morality?: number | null } | null>>
  fallenBusy:      boolean
  handleFallenToggle: () => Promise<void>
  // Session management
  forceLogout:          (charId: string) => Promise<void>
  releaseAllSessions:   () => Promise<void>
}

export function useGmCharacterActions(params: {
  campaignId:              string | null
  characters:              Character[]
  activeChars:             Character[]
  setCharacters:           React.Dispatch<React.SetStateAction<Character[]>>
  charActiveCritCounts:    Record<string, number>
  setCharActiveCritCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>
  refCritsDb:              RefCriticalInjury[]
  setRolledCritRequests:   React.Dispatch<React.SetStateAction<CriticalInjuryRequest[]>>
  charCrits:               Record<string, CharacterCriticalInjury[]>
  setCharCrits:            React.Dispatch<React.SetStateAction<Record<string, CharacterCriticalInjury[]>>>
  conflicts:               GmConflictRow[]
  setConflicts:            React.Dispatch<React.SetStateAction<GmConflictRow[]>>
  activeSessions:          Record<string, string>
  setActiveSessions:       React.Dispatch<React.SetStateAction<Record<string, string>>>
  moralityStrengths:       RefMorality[]
  moralityWeaknesses:      RefMorality[]
  notify:                  (charId: string, type: 'toast' | 'dialog', message: string) => void
  sendToChar:              (charId: string, payload: Record<string, unknown>) => void
  flash:                   (msg: string) => void
  flashError:              (msg: string) => void
}): UseGmCharacterActionsReturn {
  const {
    campaignId, characters, activeChars, setCharacters,
    charActiveCritCounts, setCharActiveCritCounts, refCritsDb, setRolledCritRequests,
    charCrits, setCharCrits,
    conflicts, setConflicts,
    activeSessions, setActiveSessions,
    notify, sendToChar, flash, flashError,
  } = params
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])

  // Crit injury
  const [critReqOpenFor,  setCritReqOpenFor]  = useState<string | null>(null)
  const [critReqVicious,  setCritReqVicious]  = useState(0)
  const [critReqLethal,   setCritReqLethal]   = useState(0)
  const [critReqGm,       setCritReqGm]       = useState(0)
  const [critReqBusy,     setCritReqBusy]     = useState(false)
  const [critCustomNames, setCritCustomNames] = useState<Record<string, string>>({})
  const [addCritOpenFor,  setAddCritOpenFor]  = useState<string | null>(null)
  const [addCritRefId,    setAddCritRefId]    = useState<number | null>(null)
  const [addCritName,     setAddCritName]     = useState('')
  const [addCritDesc,     setAddCritDesc]     = useState('')
  const [addCritSeverity, setAddCritSeverity] = useState('')
  const [addCritBusy,     setAddCritBusy]     = useState(false)
  // D&O
  const [odMode,   setOdMode]   = useState<'group' | 'individual'>('group')
  const [odType,   setOdType]   = useState<'obligation' | 'duty'>('obligation')
  const [odAmount, setOdAmount] = useState('')
  const [odTarget, setOdTarget] = useState('')
  const [odBusy,   setOdBusy]   = useState(false)
  // Morality
  const [moralitySetup, setMoralitySetup] = useState<MoralitySetupState | null>(null)
  const [moralityBusy,  setMoralityBusy]  = useState(false)
  // Archive
  const [archiveConfirm, setArchiveConfirm] = useState<{ id: string; name: string } | null>(null)
  const [archiveBusy,    setArchiveBusy]    = useState(false)
  const [archiveOpen,    setArchiveOpen]    = useState(false)
  // Fallen
  const [fallenConfirm, setFallenConfirm] = useState<{ id: string; name: string; isFallen: boolean; morality?: number | null } | null>(null)
  const [fallenBusy,    setFallenBusy]    = useState(false)

  // ── Wound / strain ─────────���────────────────────────────────────

  const addWound = useCallback(async (charId: string, amount: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newVal = Math.min(char.wound_threshold, char.wound_current + amount)
    await supabase.from('characters').update({ wound_current: newVal }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, wound_current: newVal } : c))
    notify(charId, 'toast', `You suffered ${amount} wound${amount !== 1 ? 's' : ''}!`)
  }, [characters, setCharacters, notify, supabase])

  const healWounds = useCallback(async (charId: string, amount: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newVal = Math.max(0, char.wound_current - amount)
    await supabase.from('characters').update({ wound_current: newVal }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, wound_current: newVal } : c))
    notify(charId, 'toast', `You healed ${amount} wound${amount !== 1 ? 's' : ''}!`)
  }, [characters, setCharacters, notify, supabase])

  const addStrain = useCallback(async (charId: string, amount: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newVal = Math.min(char.strain_threshold, char.strain_current + amount)
    await supabase.from('characters').update({ strain_current: newVal }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, strain_current: newVal } : c))
    notify(charId, 'toast', `You suffered ${amount} strain!`)
  }, [characters, setCharacters, notify, supabase])

  const healStrain = useCallback(async (charId: string, amount: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newVal = Math.max(0, char.strain_current - amount)
    await supabase.from('characters').update({ strain_current: newVal }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, strain_current: newVal } : c))
    notify(charId, 'toast', `You recovered ${amount} strain!`)
  }, [characters, setCharacters, notify, supabase])

  // ── D&O ─────────────────────────��───────────────────────────────

  const adjustObligation = useCallback(async (charId: string, delta: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const next = Math.max(0, (char.obligation_value || 0) + delta)
    await supabase.from('characters').update({ obligation_value: next }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, obligation_value: next } : c))
    notify(charId, 'toast', `Obligation ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`)
  }, [characters, setCharacters, notify, supabase])

  const adjustDuty = useCallback(async (charId: string, delta: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const next = Math.max(0, (char.duty_value || 0) + delta)
    await supabase.from('characters').update({ duty_value: next }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, duty_value: next } : c))
    notify(charId, 'toast', `Duty ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`)
  }, [characters, setCharacters, notify, supabase])

  const adjustMorality = useCallback(async (charId: string, delta: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const next = Math.min(100, Math.max(0, (char.morality_value ?? 50) + delta))
    await supabase.from('characters').update({ morality_value: next }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, morality_value: next } : c))
    notify(charId, 'toast', `Morality ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`)
  }, [characters, setCharacters, notify, supabase])

  const getODValue = (c: Character, type: 'obligation' | 'duty') =>
    type === 'obligation' ? (c.obligation_value || 0) : (c.duty_value || 0)

  const handleBulkOD = useCallback(async () => {
    const amount = parseInt(odAmount, 10)
    if (!amount || activeChars.length === 0) return
    setOdBusy(true)
    const field = odType === 'obligation' ? 'obligation_value' : 'duty_value'
    const label = odType === 'obligation' ? 'Obligation' : 'Duty'
    try {
      await Promise.all(activeChars.map(c => {
        const current = getODValue(c, odType)
        return supabase.from('characters').update({ [field]: Math.max(0, current + amount) }).eq('id', c.id)
      }))
      setCharacters(prev => prev.map(c => c.is_archived ? c : { ...c, [field]: Math.max(0, getODValue(c, odType) + amount) }))
      for (const c of activeChars) notify(c.id, 'toast', `${label} ${amount > 0 ? 'increased' : 'decreased'} by ${Math.abs(amount)}`)
      setOdAmount('')
      flash(`${amount > 0 ? 'Added' : 'Reduced'} ${Math.abs(amount)} ${label} for ${activeChars.length} characters`)
    } catch (err: unknown) { flashError(err instanceof Error ? err.message : String(err)) }
    setOdBusy(false)
  }, [odAmount, odType, activeChars, setCharacters, notify, flash, flashError, supabase])

  const handleIndividualOD = useCallback(async () => {
    const amount = parseInt(odAmount, 10)
    if (!amount || !odTarget) return
    const char = characters.find(c => c.id === odTarget)
    if (!char) return
    setOdBusy(true)
    const field = odType === 'obligation' ? 'obligation_value' : 'duty_value'
    const label = odType === 'obligation' ? 'Obligation' : 'Duty'
    const current = getODValue(char, odType)
    try {
      await supabase.from('characters').update({ [field]: Math.max(0, current + amount) }).eq('id', odTarget)
      setCharacters(prev => prev.map(c => c.id === odTarget ? { ...c, [field]: Math.max(0, current + amount) } : c))
      notify(odTarget, 'toast', `${label} ${amount > 0 ? 'increased' : 'decreased'} by ${Math.abs(amount)}`)
      setOdAmount(''); setOdTarget('')
      flash(`${amount > 0 ? 'Added' : 'Reduced'} ${Math.abs(amount)} ${label} for ${char.name}`)
    } catch (err: unknown) { flashError(err instanceof Error ? err.message : String(err)) }
    setOdBusy(false)
  }, [odAmount, odTarget, odType, characters, setCharacters, notify, flash, flashError, supabase])

  // ── Morality setup ─────────────────────────���─────────────────────

  const openMoralitySetup = useCallback((c: Character) => {
    setMoralitySetup({
      id: c.id, name: c.name, score: c.morality_value ?? 50,
      strengthKey: c.morality_strength_key ?? '', weaknessKey: c.morality_weakness_key ?? '',
      strengthDesc: '', weaknessDesc: '',
    })
  }, [])

  const handleMoralitySave = useCallback(async () => {
    if (!moralitySetup) return
    setMoralityBusy(true)
    const { id, name, score, strengthKey, weaknessKey } = moralitySetup
    const update: Partial<Character> = {
      morality_value:        Math.min(100, Math.max(1, score)),
      morality_strength_key: strengthKey || undefined,
      morality_weakness_key: weaknessKey || undefined,
      morality_configured:   true,
    }
    await supabase.from('characters').update(update).eq('id', id)
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...update } : c))
    flash(`Morality configured for ${name}.`)
    setMoralitySetup(null)
    setMoralityBusy(false)
  }, [moralitySetup, supabase, flash, setCharacters])

  // ── Crit injury ──────────────────────────────────────────────────

  const sendCritRequest = useCallback(async (charId: string) => {
    if (!campaignId) return
    setCritReqBusy(true)
    const existingCount = charActiveCritCounts[charId] ?? 0
    const total = existingCount * 10 + critReqVicious * 10 + critReqLethal * 10 + critReqGm
    await supabase.from('critical_injury_requests').insert({
      campaign_id: campaignId, character_id: charId, total_modifier: total,
      vicious_mod: critReqVicious * 10, lethal_mod: critReqLethal * 10,
      gm_modifier: critReqGm, existing_mod: existingCount * 10, status: 'pending',
    })
    flash('Critical injury roll requested!')
    setCritReqOpenFor(null)
    setCritReqVicious(0); setCritReqLethal(0); setCritReqGm(0)
    setCritReqBusy(false)
  }, [campaignId, charActiveCritCounts, critReqVicious, critReqLethal, critReqGm, flash, supabase])

  const confirmCritResult = useCallback(async (req: CriticalInjuryRequest) => {
    const customName = critCustomNames[req.id]?.trim()
    if (customName) {
      const { data } = await supabase.from('character_critical_injuries')
        .select('id').eq('character_id', req.character_id).eq('total_roll', req.final_result)
        .order('received_at', { ascending: false }).limit(1)
      if (data?.[0]) {
        await supabase.from('character_critical_injuries').update({ custom_name: customName }).eq('id', (data[0] as { id: string }).id)
      }
    }
    await supabase.from('critical_injury_requests').update({ status: 'dismissed', resolved_at: new Date().toISOString() }).eq('id', req.id)
    setRolledCritRequests(prev => prev.filter(r => r.id !== req.id))
    setCritCustomNames(prev => { const n = { ...prev }; delete n[req.id]; return n })
  }, [critCustomNames, supabase, setRolledCritRequests])

  const cancelCritResult = useCallback(async (req: CriticalInjuryRequest) => {
    const { data } = await supabase.from('character_critical_injuries')
      .select('id').eq('character_id', req.character_id).eq('total_roll', req.final_result)
      .order('received_at', { ascending: false }).limit(1)
    if (data?.[0]) {
      const injuryId = (data[0] as { id: string }).id
      await supabase.from('character_critical_injuries').delete().eq('id', injuryId)
      setCharActiveCritCounts(prev => ({ ...prev, [req.character_id]: Math.max(0, (prev[req.character_id] ?? 1) - 1) }))
      setCharCrits(prev => ({
        ...prev,
        [req.character_id]: (prev[req.character_id] ?? []).filter(inj => inj.id !== injuryId),
      }))
    }
    await supabase.from('critical_injury_requests').update({ status: 'dismissed', resolved_at: new Date().toISOString() }).eq('id', req.id)
    setRolledCritRequests(prev => prev.filter(r => r.id !== req.id))
    setCritCustomNames(prev => { const n = { ...prev }; delete n[req.id]; return n })
    flash('Critical injury cancelled.')
  }, [supabase, setRolledCritRequests, setCharActiveCritCounts, setCharCrits, flash])

  const overrideCritResult = useCallback(async (req: CriticalInjuryRequest, injuryId: number) => {
    const injury = refCritsDb.find(r => r.id === injuryId)
    if (!injury) return
    const { data } = await supabase.from('character_critical_injuries')
      .select('id').eq('character_id', req.character_id).eq('total_roll', req.final_result)
      .order('received_at', { ascending: false }).limit(1)
    if (data?.[0]) {
      const rowId = (data[0] as { id: string }).id
      const customName = critCustomNames[req.id]?.trim()
      await supabase.from('character_critical_injuries').update({
        injury_id: injury.id, custom_name: customName || injury.name,
        severity: injury.severity, description: injury.description,
      }).eq('id', rowId)
      setCharCrits(prev => ({
        ...prev,
        [req.character_id]: (prev[req.character_id] ?? []).map(inj =>
          inj.id !== rowId ? inj : {
            ...inj,
            injury_id:   injury.id,
            custom_name: customName || injury.name,
            severity:    injury.severity,
            description: injury.description,
          }
        ),
      }))
    }
    await supabase.from('critical_injury_requests').update({ injury_key: injuryId, status: 'dismissed', resolved_at: new Date().toISOString() }).eq('id', req.id)
    setRolledCritRequests(prev => prev.filter(r => r.id !== req.id))
    setCritCustomNames(prev => { const n = { ...prev }; delete n[req.id]; return n })
    flash('Critical injury result overridden.')
  }, [refCritsDb, critCustomNames, supabase, setRolledCritRequests, setCharCrits, flash])

  const healCrit = useCallback(async (critId: string, charId: string) => {
    await supabase.from('character_critical_injuries').update({ is_healed: true }).eq('id', critId)
    setCharActiveCritCounts(prev => ({ ...prev, [charId]: Math.max(0, (prev[charId] ?? 1) - 1) }))
  }, [supabase, setCharActiveCritCounts])

  const healCritInjury = useCallback(async (injuryId: string) => {
    let foundCharId: string | undefined
    for (const [cid, injuries] of Object.entries(charCrits)) {
      if (injuries.some(inj => inj.id === injuryId)) { foundCharId = cid; break }
    }
    if (!foundCharId) return
    const charId = foundCharId
    const { error } = await supabase.from('character_critical_injuries').update({ is_healed: true }).eq('id', injuryId)
    if (error) { flashError('Failed to heal injury: ' + error.message); return }
    setCharCrits(prev => ({
      ...prev,
      [charId]: (prev[charId] ?? []).filter(inj => inj.id !== injuryId),
    }))
    setCharActiveCritCounts(prev => ({ ...prev, [charId]: Math.max(0, (prev[charId] ?? 1) - 1) }))
    notify(charId, 'toast', 'Critical injury healed')
  }, [charCrits, setCharCrits, supabase, setCharActiveCritCounts, notify, flashError])

  const resolveConflict = useCallback(async (conflictId: string) => {
    let foundCharId: string | undefined
    for (const c of conflicts) {
      if (c.id === conflictId) { foundCharId = c.character_id; break }
    }
    if (!foundCharId) return
    const charId = foundCharId
    const { error } = await supabase
      .from('character_conflicts')
      .update({ is_resolved: true })
      .eq('id', conflictId)
    if (error) { flashError('Failed to resolve conflict: ' + error.message); return }
    setConflicts(prev => prev.filter(c => c.id !== conflictId))
    notify(charId, 'toast', 'Conflict resolved')
  }, [conflicts, setConflicts, supabase, notify, flashError])

  const selectAddCritRef = useCallback((refId: number) => {
    const ref = refCritsDb.find(r => r.id === refId)
    if (!ref) return
    setAddCritRefId(refId)
    setAddCritName(ref.name)
    setAddCritDesc(ref.description ?? '')
    setAddCritSeverity(ref.severity)
  }, [refCritsDb])

  const closeAddCrit = useCallback(() => {
    setAddCritOpenFor(null)
    setAddCritRefId(null)
    setAddCritName('')
    setAddCritDesc('')
    setAddCritSeverity('')
    setAddCritBusy(false)
  }, [])

  const addCriticalInjury = useCallback(async (charId: string) => {
    if (!addCritName.trim()) return
    setAddCritBusy(true)
    try {
      const { data: newInjury, error } = await supabase.from('character_critical_injuries').insert({
        character_id: charId,
        injury_id:    addCritRefId ?? undefined,
        custom_name:  addCritName.trim(),
        severity:     addCritSeverity || 'Average',
        description:  addCritDesc.trim() || undefined,
        is_healed:    false,
        received_at:  new Date().toISOString(),
      }).select().single()
      if (error) throw error
      setCharActiveCritCounts(prev => ({ ...prev, [charId]: (prev[charId] ?? 0) + 1 }))
      if (newInjury) {
        setCharCrits(prev => ({
          ...prev,
          [charId]: [...(prev[charId] ?? []), newInjury as CharacterCriticalInjury],
        }))
      }
      sendToChar(charId, {
        type:        'crit-injury-added',
        name:        addCritName.trim(),
        severity:    addCritSeverity || 'Average',
        description: addCritDesc.trim(),
      })
      flash('Critical injury applied!')
      closeAddCrit()
    } catch (err: unknown) {
      flashError('Failed to apply injury: ' + (err instanceof Error ? err.message : String(err)))
    }
    setAddCritBusy(false)
  }, [addCritName, addCritRefId, addCritSeverity, addCritDesc, sendToChar, flash, flashError, supabase, setCharActiveCritCounts, setCharCrits, closeAddCrit])

  // ── Archive / restore ────────────────────────────���───────────────

  const handleArchive = useCallback(async () => {
    if (!archiveConfirm) return
    setArchiveBusy(true)
    try {
      sendToChar(archiveConfirm.id, { type: 'force-logout' })
      await archiveCharacter(archiveConfirm.id)
      if (campaignId) {
        await supabase.from('combat_participants').delete()
          .eq('character_id', archiveConfirm.id).eq('campaign_id', campaignId)
      }
      setCharacters(prev => prev.map(c =>
        c.id === archiveConfirm.id ? { ...c, is_archived: true, archived_at: new Date().toISOString() } : c
      ))
      flash(`${archiveConfirm.name} archived`)
    } catch (err: unknown) {
      flashError('Archive failed: ' + (err instanceof Error ? err.message : String(err)))
    }
    setArchiveConfirm(null)
    setArchiveBusy(false)
  }, [archiveConfirm, campaignId, supabase, sendToChar, flash, flashError, setCharacters])

  const handleRestore = useCallback(async (charId: string, charName: string) => {
    try {
      await restoreCharacter(charId)
      setCharacters(prev => prev.map(c =>
        c.id === charId ? { ...c, is_archived: false, archived_at: undefined } : c
      ))
      flash(`${charName} restored`)
    } catch (err: unknown) {
      flashError('Restore failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }, [flash, flashError, setCharacters])

  // ── Dark side ─────────────────────────────��──────────────────────

  const handleFallenToggle = useCallback(async () => {
    if (!fallenConfirm) return
    setFallenBusy(true)
    const { id, name, isFallen } = fallenConfirm
    try {
      const update = isFallen
        ? { is_dark_side_fallen: false, redeemed_at: new Date().toISOString() }
        : { is_dark_side_fallen: true,  dark_side_fallen_at: new Date().toISOString() }
      await supabase.from('characters').update(update).eq('id', id)
      setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...update } : c))
      flash(isFallen ? `${name} has been redeemed.` : `${name} has fallen to the Dark Side.`)
    } catch (err: unknown) { flashError('Update failed: ' + (err instanceof Error ? err.message : String(err))) }
    setFallenConfirm(null)
    setFallenBusy(false)
  }, [fallenConfirm, supabase, flash, flashError, setCharacters])

  // ── Session management ───────────────────────────────────────────

  const forceLogout = useCallback(async (charId: string) => {
    sendToChar(charId, { type: 'force-logout' })
    const sessionKey = activeSessions[charId]
    if (sessionKey && campaignId) {
      await supabase.from('character_sessions').delete().eq('session_key', sessionKey).eq('campaign_id', campaignId)
    }
    flash('Player kicked')
  }, [activeSessions, campaignId, sendToChar, supabase, flash])

  const releaseAllSessions = useCallback(async () => {
    if (!campaignId) return
    activeChars.forEach(c => sendToChar(c.id, { type: 'force-logout' }))
    await supabase.from('character_sessions').delete().eq('campaign_id', campaignId)
    setActiveSessions({})
    flash('All sessions released')
  }, [campaignId, activeChars, sendToChar, supabase, setActiveSessions, flash])

  return {
    critReqOpenFor, setCritReqOpenFor, critReqVicious, setCritReqVicious,
    critReqLethal, setCritReqLethal, critReqGm, setCritReqGm,
    critReqBusy, critCustomNames, setCritCustomNames,
    sendCritRequest, confirmCritResult, cancelCritResult, overrideCritResult, healCrit, healCritInjury, resolveConflict,
    addCritOpenFor, setAddCritOpenFor,
    addCritRefId, addCritName, setAddCritName,
    addCritDesc, setAddCritDesc,
    addCritSeverity, addCritBusy,
    selectAddCritRef, closeAddCrit, addCriticalInjury,
    addWound, healWounds, addStrain, healStrain,
    odMode, setOdMode, odType, setOdType, odAmount, setOdAmount, odTarget, setOdTarget, odBusy,
    adjustObligation, adjustDuty, adjustMorality, handleBulkOD, handleIndividualOD,
    moralitySetup, setMoralitySetup, moralityBusy, openMoralitySetup, handleMoralitySave,
    archiveConfirm, setArchiveConfirm, archiveBusy, archiveOpen, setArchiveOpen,
    handleArchive, handleRestore,
    fallenConfirm, setFallenConfirm, fallenBusy, handleFallenToggle,
    forceLogout, releaseAllSessions,
  }
}
