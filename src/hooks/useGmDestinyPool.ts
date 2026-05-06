'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DestinyPoolRecord } from '@/components/destiny/DestinyPoolDisplay'
import type { Campaign, Character } from '@/lib/types'

export function useGmDestinyPool(params: {
  campaignId: string | null
  campaign: Campaign | null
  characters: Character[]
  sendToChar: (id: string, payload: Record<string, unknown>) => void
}) {
  const { campaignId, campaign, characters, sendToChar } = params

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])

  // ── State ──
  const [destinyPool,          setDestinyPool]          = useState<Array<'light' | 'dark'>>(['light', 'light', 'dark', 'dark', 'dark'])
  const [destinyPoolRecord,    setDestinyPoolRecord]    = useState<DestinyPoolRecord | null>(null)
  const [destinyGenerateOpen,  setDestinyGenerateOpen]  = useState(false)
  const [manualAdjustOpen,     setManualAdjustOpen]     = useState(false)
  const [gmSpendConfirm,       setGmSpendConfirm]       = useState(false)
  const [manualLight,          setManualLight]          = useState(0)
  const [manualDark,           setManualDark]           = useState(0)
  const [manualBusy,           setManualBusy]           = useState(false)

  // ── Destiny Pool DB subscription ──
  useEffect(() => {
    if (!campaignId) return
    // Load active pool on mount
    supabase.from('destiny_pool').select('*').eq('campaign_id', campaignId).eq('is_active', true).maybeSingle()
      .then(({ data }) => { if (data) setDestinyPoolRecord(data as DestinyPoolRecord) })
    // Subscribe to changes
    const ch = supabase
      .channel(`destiny-pool-gm-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'destiny_pool', filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          const row = payload.new as DestinyPoolRecord
          if (row.is_active) {
            setDestinyPoolRecord(row)
          } else if (destinyPoolRecord?.id === row.id) {
            setDestinyPoolRecord(null)
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── Sync manual counters when active pool changes ──
  useEffect(() => {
    setManualLight(destinyPoolRecord?.light_count ?? 0)
    setManualDark(destinyPoolRecord?.dark_count   ?? 0)
  }, [destinyPoolRecord])

  // ── GM spend dark destiny ──
  const handleGmSpendDark = useCallback(async () => {
    if (!destinyPoolRecord || destinyPoolRecord.dark_count < 1) return
    if (!gmSpendConfirm) { setGmSpendConfirm(true); return }
    setGmSpendConfirm(false)
    const prev = { light: destinyPoolRecord.light_count, dark: destinyPoolRecord.dark_count }
    const newLight = prev.light + 1
    const newDark  = prev.dark  - 1
    await supabase.from('destiny_pool').update({ light_count: newLight, dark_count: newDark }).eq('id', destinyPoolRecord.id)
    await supabase.from('destiny_spend_log').insert({
      campaign_id: campaignId, pool_id: destinyPoolRecord.id,
      spent_by: 'GM', side_spent: 'dark',
    })
    // Broadcast flash to all players
    for (const c of characters) {
      sendToChar(c.id, {
        type:           'destiny-gm-spent',
        prevLightCount: prev.light,
        prevDarkCount:  prev.dark,
        newLightCount:  newLight,
        newDarkCount:   newDark,
      })
    }
  }, [destinyPoolRecord, gmSpendConfirm, campaignId, characters, sendToChar, supabase])

  const handleApplyManual = useCallback(async () => {
    if (!campaignId) return
    setManualBusy(true)
    try {
      const { data: existing } = await supabase
        .from('destiny_pool')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .single()
      if (existing) {
        await supabase.from('destiny_pool')
          .update({ light_count: manualLight, dark_count: manualDark })
          .eq('id', existing.id)
      } else {
        await supabase.from('destiny_pool')
          .insert({ campaign_id: campaignId, light_count: manualLight, dark_count: manualDark, session_label: 'Manual', is_active: true })
      }
      setManualAdjustOpen(false)
    } finally {
      setManualBusy(false)
    }
  }, [manualLight, manualDark, campaignId, supabase])

  // ── Destiny Pool token mutations (persist to campaigns.settings) ──
  const flipDestinyToken = useCallback(async (idx: number) => {
    const newPool = destinyPool.map((t, i) => i === idx ? (t === 'light' ? 'dark' : 'light') : t) as Array<'light' | 'dark'>
    setDestinyPool(newPool)
    if (!campaignId || !campaign) return
    const settings = (campaign as Campaign & { settings?: Record<string, unknown> }).settings || {}
    await supabase.from('campaigns').update({ settings: { ...settings, destiny_pool: newPool } }).eq('id', campaignId)
  }, [destinyPool, campaignId, campaign, supabase])

  const addDestinyToken = useCallback(async () => {
    const newPool = [...destinyPool, 'light'] as Array<'light' | 'dark'>
    setDestinyPool(newPool)
    if (!campaignId || !campaign) return
    const settings = (campaign as Campaign & { settings?: Record<string, unknown> }).settings || {}
    await supabase.from('campaigns').update({ settings: { ...settings, destiny_pool: newPool } }).eq('id', campaignId)
  }, [destinyPool, campaignId, campaign, supabase])

  const removeDestinyToken = useCallback(async () => {
    if (destinyPool.length === 0) return
    const newPool = destinyPool.slice(0, -1)
    setDestinyPool(newPool)
    if (!campaignId || !campaign) return
    const settings = (campaign as Campaign & { settings?: Record<string, unknown> }).settings || {}
    await supabase.from('campaigns').update({ settings: { ...settings, destiny_pool: newPool } }).eq('id', campaignId)
  }, [destinyPool, campaignId, campaign, supabase])

  return {
    destinyPool,         setDestinyPool,
    destinyPoolRecord,   setDestinyPoolRecord,
    destinyGenerateOpen, setDestinyGenerateOpen,
    manualAdjustOpen,    setManualAdjustOpen,
    gmSpendConfirm,      setGmSpendConfirm,
    manualLight,         setManualLight,
    manualDark,          setManualDark,
    manualBusy,
    handleGmSpendDark,
    handleApplyManual,
    flipDestinyToken,
    addDestinyToken,
    removeDestinyToken,
  }
}
