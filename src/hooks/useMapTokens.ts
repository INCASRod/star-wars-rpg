'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  token_shape: 'circle' | 'rectangle'
  token_type?: string | null
  updated_at: string
}

export interface UseMapTokensOptions {
  /**
   * Player-facing callers only. Filters is_visible=true server-side on the
   * initial fetch and drops hidden rows from realtime updates, so a hidden
   * token's data never sits resident in the client's React state at rest
   * (Prompt 11 — the prior client-side `.filter(t => t.is_visible)` pattern
   * pulled every row, hidden included, into state first and only hid it
   * visually). This does NOT close the underlying gap: map_tokens RLS is
   * `USING (true)` (032_maps.sql) with no session-aware policy, so Realtime
   * itself still evaluates that permissive policy and could broadcast a
   * single hidden-row UPDATE payload over the wire before this filters it
   * out client-side. Closing that fully needs an RLS policy change — a
   * migration, out of scope here.
   */
  visibleOnly?: boolean
}

export function useMapTokens(mapId: string | null, options: UseMapTokensOptions = {}) {
  const { visibleOnly = false } = options
  const supabase = useMemo(() => createClient(), [])
  // Unique suffix per hook instance so multiple callers with the same mapId
  // don't share a Realtime channel on the singleton client — unsubscribing one
  // would otherwise kill the other's subscription.
  const instanceId = useRef(Math.random().toString(36).slice(2, 8)).current
  const [tokens, setTokens] = useState<MapToken[]>([])

  useEffect(() => {
    if (!mapId) { setTokens([]); return }

    let query = supabase.from('map_tokens').select('*').eq('map_id', mapId)
    if (visibleOnly) query = query.eq('is_visible', true)
    query.then(({ data }) => { if (data) setTokens(data as MapToken[]) })

    const ch = supabase
      .channel(`map-tokens-${mapId}-${instanceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'map_tokens', filter: `map_id=eq.${mapId}` },
        (payload) => {
          const { eventType, new: n, old: o } = payload
          setTokens(prev => {
            if (eventType === 'INSERT') {
              const incoming = n as MapToken
              if (visibleOnly && !incoming.is_visible) return prev
              return prev.some(t => t.id === incoming.id) ? prev : [...prev, incoming]
            }
            if (eventType === 'UPDATE') {
              const incoming = n as MapToken
              // A token flipping to hidden must disappear entirely for
              // visibleOnly callers, not just re-render with is_visible:false.
              if (visibleOnly && !incoming.is_visible) return prev.filter(t => t.id !== incoming.id)
              return prev.some(t => t.id === incoming.id)
                ? prev.map(t => t.id === incoming.id ? incoming : t)
                : (visibleOnly ? [...prev, incoming] : prev)
            }
            if (eventType === 'DELETE') return prev.filter(t =>
              t.id !== (o as { id: string }).id)
            return prev
          })
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [mapId, visibleOnly]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const removeAllTokens = useCallback(async () => {
    if (!mapId) return
    setTokens([])
    await supabase.from('map_tokens').delete().eq('map_id', mapId)
  }, [mapId, supabase])

  const addToken = useCallback(async (token: Omit<MapToken, 'id' | 'updated_at'>) => {
    const { data } = await supabase.from('map_tokens').insert(token).select().single()
    if (data) setTokens(prev => [...prev, data as MapToken])
    return data as MapToken | null
  }, [supabase])

  const updateWoundPct = useCallback(async (id: string, wound_pct: number) => {
    setTokens(prev => prev.map(t => t.id === id ? { ...t, wound_pct } : t))
    await supabase.from('map_tokens').update({ wound_pct }).eq('id', id)
  }, [supabase])

  return { tokens, moveToken, toggleVisibility, removeToken, removeAllTokens, addToken, updateWoundPct, supabase }
}
