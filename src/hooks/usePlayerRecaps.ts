'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Session recaps the GM has shared with players (migration 162: `player_recaps`, member read, trigger-written).
 * Seen state is one localStorage key per user (`recap-seen:<userId>` = session_id of the newest recap acknowledged),
 * the same per-browser pattern as XpHoldNotice. Edits to a shared recap keep its session_id, so they never re-pop.
 */

export interface PlayerRecap {
  campaign_id: string
  session_id: string
  n: number
  title: string
  session_date: string
  summary: string
  shared_at: string
  updated_at: string
}

const seenListeners = new Set<() => void>()

async function seenKey(): Promise<string | null> {
  try {
    const { data: { user } } = await createClient().auth.getUser()
    return user ? `recap-seen:${user.id}` : null
  } catch { return null }
}

function byNewest(a: PlayerRecap, b: PlayerRecap) { return b.n - a.n }

export function usePlayerRecaps() {
  const [recaps, setRecaps] = useState<PlayerRecap[]>([])
  const [loaded, setLoaded] = useState(false)
  const [key, setKey] = useState<string | null>(null)
  const [seenId, setSeenId] = useState<string | null>(null)
  const [keyReady, setKeyReady] = useState(false)
  const channelId = useId()

  const load = useCallback(() => {
    return createClient().from('player_recaps').select('*').order('n', { ascending: false })
      .then(({ data, error }) => {
        if (error || !data) return // keep what we have; nothing is shown from a failed read
        setRecaps(data as PlayerRecap[])
        setLoaded(true)
      })
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`player-recaps-${channelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'player_recaps' }, payload => {
        if (payload.eventType === 'DELETE') return
        const row = payload.new as PlayerRecap
        setRecaps(prev => [row, ...prev.filter(r => r.session_id !== row.session_id)].sort(byNewest))
      })
      .subscribe(status => { if (status === 'SUBSCRIBED') void load() })
    void load().then(() => undefined)
    return () => { void supabase.removeChannel(channel) }
  }, [channelId, load])

  useEffect(() => {
    let live = true
    const read = (k: string | null) => { try { return k ? localStorage.getItem(k) : null } catch { return null } }
    void seenKey().then(k => {
      if (!live) return
      setKey(k)
      setSeenId(read(k))
      setKeyReady(true)
    })
    const sync = () => { void seenKey().then(k => { if (live) setSeenId(read(k)) }) }
    seenListeners.add(sync)
    return () => { live = false; seenListeners.delete(sync) }
  }, [])

  /** Acknowledge a recap: remembered for this user in this browser, and every mounted consumer updates. */
  const markSeen = useCallback((sessionId: string) => {
    setSeenId(sessionId)
    try { if (key) localStorage.setItem(key, sessionId) } catch { /* storage unavailable: once per page load */ }
    seenListeners.forEach(l => l())
  }, [key])

  const newest = recaps[0] ?? null
  /** The newest recap, only while the player has not acknowledged it (and only once everything has loaded). */
  const unseen = loaded && keyReady && newest && newest.session_id !== seenId ? newest : null

  return { recaps, newest, unseen, markSeen, seenId }
}
