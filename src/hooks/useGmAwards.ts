'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/lib/types'

export type AwardLogEntry = {
  id: string
  type: 'xp' | 'credits'
  amount: number
  mode: 'group' | 'individual'
  target_name: string | null
  reason: string | null
  recipient_count: number | null
  created_at: string
}

export interface UseGmAwardsReturn {
  // XP
  xpAmount:               string
  setXpAmount:            React.Dispatch<React.SetStateAction<string>>
  xpReason:               string
  setXpReason:            React.Dispatch<React.SetStateAction<string>>
  xpBusy:                 boolean
  xpMode:                 'group' | 'individual'
  setXpMode:              React.Dispatch<React.SetStateAction<'group' | 'individual'>>
  xpTarget:               string
  setXpTarget:            React.Dispatch<React.SetStateAction<string>>
  xpConfirm:              { amount: number; reason: string; target?: string; targetName?: string } | null
  setXpConfirm:           React.Dispatch<React.SetStateAction<{ amount: number; reason: string; target?: string; targetName?: string } | null>>
  xpHistory:              AwardLogEntry[]
  xpHistoryExpanded:      boolean
  setXpHistoryExpanded:   React.Dispatch<React.SetStateAction<boolean>>
  requestXpConfirm:       () => void
  handleBulkXp:           () => Promise<void>
  handleIndividualXp:     () => Promise<void>
  // Credits
  creditsAmount:          string
  setCreditsAmount:       React.Dispatch<React.SetStateAction<string>>
  creditsBusy:            boolean
  creditsMode:            'group' | 'individual'
  setCreditsMode:         React.Dispatch<React.SetStateAction<'group' | 'individual'>>
  creditsTarget:          string
  setCreditsTarget:       React.Dispatch<React.SetStateAction<string>>
  creditsHistory:         AwardLogEntry[]
  creditsHistoryExpanded: boolean
  setCreditsHistoryExpanded: React.Dispatch<React.SetStateAction<boolean>>
  handleBulkCredits:      () => Promise<void>
  handleIndividualCredits: () => Promise<void>
}

export function useGmAwards(params: {
  campaignId:    string | null
  activeChars:   Character[]
  characters:    Character[]
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>
  notify:        (charId: string, type: 'toast' | 'dialog', message: string) => void
  flash:         (msg: string) => void
  flashError:    (msg: string) => void
}): UseGmAwardsReturn {
  const { campaignId, activeChars, characters, setCharacters, notify, flash, flashError } = params
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])

  // XP
  const [xpAmount,          setXpAmount]          = useState('')
  const [xpReason,          setXpReason]          = useState('')
  const [xpBusy,            setXpBusy]            = useState(false)
  const [xpMode,            setXpMode]            = useState<'group' | 'individual'>('group')
  const [xpTarget,          setXpTarget]          = useState('')
  const [xpConfirm,         setXpConfirm]         = useState<{ amount: number; reason: string; target?: string; targetName?: string } | null>(null)
  const [xpHistory,         setXpHistory]         = useState<AwardLogEntry[]>([])
  const [xpHistoryExpanded, setXpHistoryExpanded] = useState(false)

  // Credits
  const [creditsAmount,          setCreditsAmount]          = useState('')
  const [creditsBusy,            setCreditsBusy]            = useState(false)
  const [creditsMode,            setCreditsMode]            = useState<'group' | 'individual'>('group')
  const [creditsTarget,          setCreditsTarget]          = useState('')
  const [creditsHistory,         setCreditsHistory]         = useState<AwardLogEntry[]>([])
  const [creditsHistoryExpanded, setCreditsHistoryExpanded] = useState(false)

  const loadAwardHistory = useCallback(async () => {
    if (!campaignId) return
    const { data } = await supabase
      .from('gm_award_log')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (!data) return
    const entries = data as AwardLogEntry[]
    setXpHistory(entries.filter(e => e.type === 'xp'))
    setCreditsHistory(entries.filter(e => e.type === 'credits'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  useEffect(() => { void loadAwardHistory() }, [loadAwardHistory])

  const targetChars = activeChars

  const requestXpConfirm = useCallback(() => {
    const amount = parseInt(xpAmount, 10)
    if (!amount || activeChars.length === 0) return
    if (xpMode === 'individual') {
      if (!xpTarget) return
      const char = characters.find(c => c.id === xpTarget)
      if (!char) return
      setXpConfirm({ amount, reason: xpReason || (amount > 0 ? 'GM grant' : 'GM adjustment'), target: xpTarget, targetName: char.name })
    } else {
      if (amount <= 0) return
      setXpConfirm({ amount, reason: xpReason || 'GM bulk grant' })
    }
  }, [xpAmount, xpReason, xpMode, xpTarget, activeChars, characters])

  const handleBulkXp = useCallback(async () => {
    if (!xpConfirm) return
    const { amount, reason } = xpConfirm
    setXpConfirm(null)
    setXpBusy(true)
    try {
      const updates = targetChars.map(c =>
        supabase.from('characters').update({ xp_total: c.xp_total + amount, xp_available: c.xp_available + amount }).eq('id', c.id)
      )
      const transactions = targetChars.map(c =>
        supabase.from('xp_transactions').insert({ character_id: c.id, amount, reason, created_by: 'gm' })
      )
      await Promise.all([...updates, ...transactions])
      setCharacters(prev => prev.map(c => c.is_archived ? c : { ...c, xp_total: c.xp_total + amount, xp_available: c.xp_available + amount }))
      for (const c of activeChars) notify(c.id, 'dialog', `You received ${amount} XP!${reason ? ` Reason: ${reason}` : ''}`)
      const { data: logRow } = await supabase.from('gm_award_log').insert({
        campaign_id: campaignId, type: 'xp', amount, mode: 'group', reason, recipient_count: activeChars.length,
      }).select().single()
      if (logRow) setXpHistory(prev => [logRow as AwardLogEntry, ...prev])
      setXpAmount(''); setXpReason('')
      flash(`Granted ${amount} XP to ${activeChars.length} characters`)
    } catch (err: unknown) {
      flashError('Error granting XP: ' + (err instanceof Error ? err.message : String(err)))
    }
    setXpBusy(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xpConfirm, targetChars, activeChars, campaignId, notify, flash, flashError, setCharacters])

  const handleIndividualXp = useCallback(async () => {
    if (!xpConfirm || !xpConfirm.target) return
    const { amount, reason, target } = xpConfirm
    const char = characters.find(c => c.id === target)
    if (!char) return
    setXpConfirm(null)
    setXpBusy(true)
    try {
      await supabase.from('characters').update({ xp_total: char.xp_total + amount, xp_available: char.xp_available + amount }).eq('id', target)
      await supabase.from('xp_transactions').insert({ character_id: target, amount, reason, created_by: 'gm' })
      setCharacters(prev => prev.map(c => c.id === target ? { ...c, xp_total: c.xp_total + amount, xp_available: c.xp_available + amount } : c))
      notify(target, 'dialog', `You ${amount > 0 ? 'received' : 'lost'} ${Math.abs(amount)} XP!${reason ? ` Reason: ${reason}` : ''}`)
      const { data: logRow } = await supabase.from('gm_award_log').insert({
        campaign_id: campaignId, type: 'xp', amount, mode: 'individual', target_name: char.name, reason, recipient_count: 1,
      }).select().single()
      if (logRow) setXpHistory(prev => [logRow as AwardLogEntry, ...prev])
      setXpAmount(''); setXpReason(''); setXpTarget('')
      flash(`${amount > 0 ? 'Granted' : 'Took'} ${Math.abs(amount)} XP ${amount > 0 ? 'to' : 'from'} ${char.name}`)
    } catch (err: unknown) {
      flashError(err instanceof Error ? err.message : String(err))
    }
    setXpBusy(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xpConfirm, characters, campaignId, notify, flash, flashError, setCharacters])

  const handleBulkCredits = useCallback(async () => {
    const amount = parseInt(creditsAmount, 10)
    if (!amount || amount <= 0 || targetChars.length === 0) return
    setCreditsBusy(true)
    try {
      await Promise.all(targetChars.map(c =>
        supabase.from('characters').update({ credits: c.credits + amount }).eq('id', c.id)
      ))
      setCharacters(prev => prev.map(c => c.is_archived ? c : { ...c, credits: c.credits + amount }))
      for (const c of targetChars) notify(c.id, 'dialog', `You received ${amount} credits!`)
      const { data: logRow } = await supabase.from('gm_award_log').insert({
        campaign_id: campaignId, type: 'credits', amount, mode: 'group', recipient_count: targetChars.length,
      }).select().single()
      if (logRow) setCreditsHistory(prev => [logRow as AwardLogEntry, ...prev])
      setCreditsAmount('')
      flash(`Distributed ${amount} credits to ${targetChars.length} characters`)
    } catch (err: unknown) {
      flashError('Error distributing credits: ' + (err instanceof Error ? err.message : String(err)))
    }
    setCreditsBusy(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditsAmount, targetChars, campaignId, notify, flash, flashError, setCharacters])

  const handleIndividualCredits = useCallback(async () => {
    const amount = parseInt(creditsAmount, 10)
    if (!amount || !creditsTarget) return
    const char = characters.find(c => c.id === creditsTarget)
    if (!char) return
    setCreditsBusy(true)
    try {
      await supabase.from('characters').update({ credits: char.credits + amount }).eq('id', creditsTarget)
      setCharacters(prev => prev.map(c => c.id === creditsTarget ? { ...c, credits: char.credits + amount } : c))
      notify(creditsTarget, 'dialog', `You ${amount > 0 ? 'received' : 'lost'} ${Math.abs(amount)} credits!`)
      const { data: logRow } = await supabase.from('gm_award_log').insert({
        campaign_id: campaignId, type: 'credits', amount, mode: 'individual', target_name: char.name, recipient_count: 1,
      }).select().single()
      if (logRow) setCreditsHistory(prev => [logRow as AwardLogEntry, ...prev])
      setCreditsAmount(''); setCreditsTarget('')
      flash(`${amount > 0 ? 'Gave' : 'Took'} ${Math.abs(amount)} credits ${amount > 0 ? 'to' : 'from'} ${char.name}`)
    } catch (err: unknown) {
      flashError(err instanceof Error ? err.message : String(err))
    }
    setCreditsBusy(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditsAmount, creditsTarget, characters, campaignId, notify, flash, flashError, setCharacters])

  return {
    xpAmount, setXpAmount, xpReason, setXpReason, xpBusy,
    xpMode, setXpMode, xpTarget, setXpTarget,
    xpConfirm, setXpConfirm, xpHistory, xpHistoryExpanded, setXpHistoryExpanded,
    requestXpConfirm, handleBulkXp, handleIndividualXp,
    creditsAmount, setCreditsAmount, creditsBusy,
    creditsMode, setCreditsMode, creditsTarget, setCreditsTarget,
    creditsHistory, creditsHistoryExpanded, setCreditsHistoryExpanded,
    handleBulkCredits, handleIndividualCredits,
  }
}
