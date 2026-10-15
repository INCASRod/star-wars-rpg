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
  /** Per-placement footprint, base units (1.0 = 24px). Null = fall back to token_size. See lib/tokenGeometry.ts. */
  token_w?: number | null
  token_h?: number | null
  /** Degrees, clockwise. */
  token_rot?: number
  token_type?: string | null
  updated_at: string
}

/** The three per-placement geometry columns (migration 145); null w/h = fall back to token_size. */
export interface TokenGeometryPatch {
  token_w:   number | null
  token_h:   number | null
  token_rot: number
}

/** How long a settled local edit keeps shielding itself from a stale realtime echo. */
const GEO_ECHO_GRACE_MS = 3000

const sameGeometry = (t: Pick<MapToken, 'token_w' | 'token_h' | 'token_rot'>, g: TokenGeometryPatch) =>
  (t.token_w ?? null) === g.token_w && (t.token_h ?? null) === g.token_h && (t.token_rot ?? 0) === g.token_rot

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

  // ── Geometry write path (migration 145) ───────────────────────────────
  // `geoOverrides` holds the newest LOCAL geometry per token (an unsaved
  // preview or an in-flight write). A realtime UPDATE for that token has its
  // geometry columns replaced by the override, so a stale echo of an earlier
  // write can never bounce the token back. Once the last queued write
  // resolves the entry is `settled`; it is dropped when an echo carrying the
  // same values arrives, or after GEO_ECHO_GRACE_MS as a fallback.
  // `geoQueues` serialises writes per token row (promise chain).
  const geoOverrides = useRef(new Map<string, { geo: TokenGeometryPatch; settled: boolean; timer: ReturnType<typeof setTimeout> | null }>())
  const geoQueues    = useRef(new Map<string, Promise<void>>())
  const geoSeq       = useRef(new Map<string, number>())

  const dropGeoOverride = (id: string) => {
    const o = geoOverrides.current.get(id)
    if (o?.timer) clearTimeout(o.timer)
    geoOverrides.current.delete(id)
  }
  const setGeoOverride = (id: string, geo: TokenGeometryPatch, settled: boolean) => {
    const prev = geoOverrides.current.get(id)
    if (prev?.timer) clearTimeout(prev.timer)
    geoOverrides.current.set(id, { geo, settled, timer: null })
  }
  const settleGeoOverride = (id: string) => {
    const o = geoOverrides.current.get(id)
    if (!o) return
    o.settled = true
    if (o.timer) clearTimeout(o.timer)
    o.timer = setTimeout(() => dropGeoOverride(id), GEO_ECHO_GRACE_MS)
  }
  /** Applies the local override to an incoming realtime row (see above). */
  const shieldGeometry = (incoming: MapToken): MapToken => {
    const o = geoOverrides.current.get(incoming.id)
    if (!o) return incoming
    if (o.settled && sameGeometry(incoming, o.geo)) { dropGeoOverride(incoming.id); return incoming }
    return { ...incoming, ...o.geo }
  }

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
              const incoming = shieldGeometry(n as MapToken)
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
    let removed: MapToken | undefined
    setTokens(prev => {
      removed = prev.find(t => t.id === id)
      return prev.filter(t => t.id !== id)
    })
    const { error } = await supabase.from('map_tokens').delete().eq('id', id)
    if (error) {
      if (removed) setTokens(prev => prev.some(t => t.id === id) ? prev : [...prev, removed!])
      throw error
    }
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

  const renameToken = useCallback(async (id: string, label: string) => {
    setTokens(prev => prev.map(t => t.id === id ? { ...t, label } : t))
    await supabase.from('map_tokens').update({ label }).eq('id', id)
  }, [supabase])

  /**
   * Local-only live preview of a token's geometry (the GM inspector while the
   * user is typing). Nothing is written. Pass `null` to end the preview — call
   * it with the last saved values first to put the token back.
   */
  const previewTokenGeometry = useCallback((id: string, geo: TokenGeometryPatch | null) => {
    if (!geo) { dropGeoOverride(id); return }
    setGeoOverride(id, geo, false)
    setTokens(prev => prev.map(t => t.id === id ? { ...t, ...geo } : t))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Persists a token's per-placement width/height/rotation. Optimistic, then a
   * single .update() of exactly these three columns (never the whole row, so a
   * concurrent x/y move cannot be clobbered). Writes for one token are chained
   * so rapid edits land in order; see the echo guard above. Reset = pass
   * `{ token_w: null, token_h: null, token_rot: 0 }`.
   */
  const updateTokenGeometry = useCallback((id: string, geo: TokenGeometryPatch): Promise<void> => {
    setGeoOverride(id, geo, false)
    setTokens(prev => prev.map(t => t.id === id ? { ...t, ...geo } : t))
    const seq = (geoSeq.current.get(id) ?? 0) + 1
    geoSeq.current.set(id, seq)
    const run = async () => {
      const { error } = await supabase
        .from('map_tokens')
        .update({ token_w: geo.token_w, token_h: geo.token_h, token_rot: geo.token_rot })
        .eq('id', id)
      if (geoSeq.current.get(id) === seq) {
        if (error) {
          // Last write failed: forget the local edit and restore the stored row.
          dropGeoOverride(id)
          const { data } = await supabase.from('map_tokens').select('*').eq('id', id).maybeSingle()
          if (data) setTokens(prev => prev.map(t => t.id === id ? (data as MapToken) : t))
        } else {
          settleGeoOverride(id)
        }
      }
      if (error) console.warn('[token geometry]', error.message)
    }
    const next = (geoQueues.current.get(id) ?? Promise.resolve()).then(run, run)
    geoQueues.current.set(id, next)
    return next
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear any pending echo-grace timers when the hook unmounts.
  useEffect(() => {
    const overrides = geoOverrides.current
    return () => { overrides.forEach(o => { if (o.timer) clearTimeout(o.timer) }); overrides.clear() }
  }, [])

  return { tokens, moveToken, toggleVisibility, removeToken, removeAllTokens, addToken, updateWoundPct, renameToken, updateTokenGeometry, previewTokenGeometry, supabase }
}
