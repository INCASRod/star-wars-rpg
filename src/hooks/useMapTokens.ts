'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface MapToken {
  id: string
  map_id: string
  campaign_id: string
  participant_type: 'pc' | 'adversary'
  character_id: string | null
  participant_id: string | null
  slot_key: string | null
  label: string | null
  alignment: string | null
  x: number
  y: number
  is_visible: boolean
  token_size: number
  wound_pct: number | null
  token_image_url: string | null
  updated_at: string
}

export function useMapTokens(mapId: string | null) {
  const supabase = useMemo(() => createClient(), [])
  const [tokens, setTokens] = useState<MapToken[]>([])

  useEffect(() => {
    if (!mapId) { setTokens([]); return }

    supabase
      .from('map_tokens')
      .select('*')
      .eq('map_id', mapId)
      .then(({ data }) => { if (data) setTokens(data as MapToken[]) })

    const ch = supabase
      .channel(`map-tokens-${mapId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'map_tokens', filter: `map_id=eq.${mapId}` },
        (payload) => {
          const { eventType, new: n, old: o } = payload
          setTokens(prev => {
            if (eventType === 'INSERT') return [...prev, n as MapToken]
            if (eventType === 'UPDATE') return prev.map(t =>
              t.id === (n as MapToken).id ? n as MapToken : t)
            if (eventType === 'DELETE') return prev.filter(t =>
              t.id !== (o as { id: string }).id)
            return prev
          })
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [mapId]) // eslint-disable-line react-hooks/exhaustive-deps

  const moveToken = useCallback(async (id: string, x: number, y: number) => {
    // Optimistic update
    setTokens(prev => prev.map(t => t.id === id ? { ...t, x, y } : t))
    await supabase
      .from('map_tokens')
      .update({ x, y, updated_at: new Date().toISOString() })
      .eq('id', id)
  }, [supabase])

  const toggleVisibility = useCallback(async (id: string, visible: boolean) => {
    setTokens(prev => prev.map(t => t.id === id ? { ...t, is_visible: visible } : t))
    await supabase.from('map_tokens').update({ is_visible: visible }).eq('id', id)
  }, [supabase])

  const removeToken = useCallback(async (id: string) => {
    setTokens(prev => prev.filter(t => t.id !== id))
    await supabase.from('map_tokens').delete().eq('id', id)
  }, [supabase])

  const addToken = useCallback(async (token: Omit<MapToken, 'id' | 'updated_at'>) => {
    const { data } = await supabase.from('map_tokens').insert(token).select().single()
    if (data) setTokens(prev => [...prev, data as MapToken])
    return data as MapToken | null
  }, [supabase])

  const updateWoundPct = useCallback(async (id: string, wound_pct: number) => {
    setTokens(prev => prev.map(t => t.id === id ? { ...t, wound_pct } : t))
    await supabase.from('map_tokens').update({ wound_pct }).eq('id', id)
  }, [supabase])

  return { tokens, moveToken, toggleVisibility, removeToken, addToken, updateWoundPct, supabase }
}
