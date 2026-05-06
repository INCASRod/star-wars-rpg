'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { DestinyPoolRecord } from '@/components/destiny/DestinyPoolDisplay'
import type { createClient } from '@/lib/supabase/client'

type SupabaseClient = ReturnType<typeof createClient>

export function useDestinyPool(
  campaignId: string | null,
  characterId: string,
  characterName: string | undefined,
  supabase: SupabaseClient,
): {
  destinyPool: Array<'light' | 'dark'>
  pendingSpend: number | null
  destinyPoolRecord: DestinyPoolRecord | null
  destinyRollRequest: { poolId: string } | null
  setDestinyRollRequest: (v: { poolId: string } | null) => void
  destinySpendOpen: boolean
  setDestinySpendOpen: (v: boolean) => void
  destinyGmFlash: { prevLight: number; prevDark: number; newLight: number; newDark: number } | null
  setDestinyGmFlash: (v: { prevLight: number; prevDark: number; newLight: number; newDark: number } | null) => void
  destinyConsidering: string | null
  setDestinyConsidering: (v: string | null) => void
  handleSpendDestiny: (idx: number) => Promise<void>
} {
  const [destinyPool, setDestinyPool]         = useState<Array<'light' | 'dark'>>([])
  const [pendingSpend, setPendingSpend]       = useState<number | null>(null)
  const pendingTimer                          = useRef<ReturnType<typeof setTimeout> | null>(null)
  const destinyChannelRef                     = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const [destinyPoolRecord, setDestinyPoolRecord]   = useState<DestinyPoolRecord | null>(null)
  const [destinyRollRequest, setDestinyRollRequest] = useState<{ poolId: string } | null>(null)
  const [destinySpendOpen, setDestinySpendOpen]     = useState(false)
  const [destinyGmFlash, setDestinyGmFlash]         = useState<{ prevLight: number; prevDark: number; newLight: number; newDark: number } | null>(null)
  const [destinyConsidering, setDestinyConsidering] = useState<string | null>(null)

  // Keep a stable ref to campaignId for use in the spend callback
  const campaignIdRef = useRef(campaignId)
  useEffect(() => { campaignIdRef.current = campaignId }, [campaignId])

  // ── Load pool on mount ──
  useEffect(() => {
    if (!campaignId) return
    supabase.from('campaigns').select('settings').eq('id', campaignId).single()
      .then(({ data }) => {
        const pool = (data?.settings as Record<string, unknown> | null)?.destiny_pool
        if (Array.isArray(pool)) setDestinyPool(pool as Array<'light' | 'dark'>)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── postgres_changes — pool syncs when GM or another player updates it ──
  useEffect(() => {
    if (!campaignId) return
    const ch = supabase
      .channel(`destiny-db-${campaignId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'campaigns', filter: `id=eq.${campaignId}` },
        (payload) => {
          const pool = (payload.new.settings as Record<string, unknown> | null)?.destiny_pool
          if (Array.isArray(pool)) setDestinyPool(pool as Array<'light' | 'dark'>)
        })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── Campaign events — spend notifications from other players ──
  useEffect(() => {
    if (!campaignId) return
    const ch = supabase
      .channel(`campaign-events-${campaignId}`)
      .on('broadcast', { event: 'destiny-spent' }, ({ payload }: { payload: Record<string, unknown> }) => {
        if (payload.characterId === characterId) return // own spend, skip
        const who  = payload.characterName as string
        const side = payload.tokenType === 'light' ? '○ Light' : '● Dark'
        import('sonner').then(m => m.toast.info(`${who} spent a ${side} Side destiny point`))
      })
      .subscribe()
    destinyChannelRef.current = ch
    return () => { supabase.removeChannel(ch); destinyChannelRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, characterId])

  // ── Destiny pool DB record + broadcast channel ──
  useEffect(() => {
    if (!campaignId) return
    // Load active pool record
    supabase.from('destiny_pool').select('*').eq('campaign_id', campaignId).eq('is_active', true).maybeSingle()
      .then(({ data }) => { if (data) setDestinyPoolRecord(data as DestinyPoolRecord) })
    // Subscribe to pool table changes
    const poolCh = supabase
      .channel(`destiny-pool-player-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'destiny_pool', filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          const row = payload.new as DestinyPoolRecord
          if (row.is_active) setDestinyPoolRecord(row)
          else setDestinyPoolRecord(prev => prev?.id === row.id ? null : prev)
        }
      )
      .subscribe()
    // Subscribe to destiny broadcast channel (considering / gm-spent)
    const destCh = supabase
      .channel(`destiny-${campaignId}`)
      .on('broadcast', { event: 'destiny_considering' }, ({ payload }: { payload: Record<string, unknown> }) => {
        if ((payload.characterName as string) === characterName) return
        setDestinyConsidering(payload.characterName as string)
      })
      .on('broadcast', { event: 'destiny_cancelled' }, ({ payload }: { payload: Record<string, unknown> }) => {
        setDestinyConsidering(prev => prev === (payload.characterName as string) ? null : prev)
      })
      .on('broadcast', { event: 'destiny_spent' }, ({ payload }: { payload: Record<string, unknown> }) => {
        setDestinyConsidering(null)
        const who  = payload.characterName as string
        const side = payload.side === 'light' ? '○ Light' : '● Dark'
        import('sonner').then(m => m.toast.info(`${who} spent a ${side} Side destiny point`))
      })
      .subscribe()
    return () => { supabase.removeChannel(poolCh); supabase.removeChannel(destCh) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const handleSpendDestiny = useCallback(async (idx: number) => {
    const cid = campaignIdRef.current
    if (!cid) return

    // Two-tap confirm: first tap highlights, second tap within 2s confirms
    if (pendingSpend !== idx) {
      setPendingSpend(idx)
      if (pendingTimer.current) clearTimeout(pendingTimer.current)
      pendingTimer.current = setTimeout(() => setPendingSpend(null), 2000)
      return
    }
    // Confirmed
    if (pendingTimer.current) clearTimeout(pendingTimer.current)
    setPendingSpend(null)

    const token   = destinyPool[idx]
    const newPool = destinyPool.map((t, i) =>
      i === idx ? (t === 'light' ? 'dark' : 'light') : t
    ) as Array<'light' | 'dark'>

    setDestinyPool(newPool)

    // Persist
    const { data: camp } = await supabase.from('campaigns').select('settings').eq('id', cid).single()
    const settings = ((camp?.settings as Record<string, unknown>) ?? {})
    await supabase.from('campaigns').update({ settings: { ...settings, destiny_pool: newPool } }).eq('id', cid)

    // Notify other players
    destinyChannelRef.current?.send({
      type: 'broadcast', event: 'destiny-spent',
      payload: { characterId, characterName, tokenType: token },
    })

    const side = token === 'light' ? '○ Light' : '● Dark'
    import('sonner').then(m => m.toast.success(`Spent a ${side} Side destiny point`))
  }, [destinyPool, characterId, characterName, supabase, pendingSpend])

  return {
    destinyPool,
    pendingSpend,
    destinyPoolRecord,
    destinyRollRequest,
    setDestinyRollRequest,
    destinySpendOpen,
    setDestinySpendOpen,
    destinyGmFlash,
    setDestinyGmFlash,
    destinyConsidering,
    setDestinyConsidering,
    handleSpendDestiny,
  }
}
