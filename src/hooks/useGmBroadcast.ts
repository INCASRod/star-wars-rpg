'use client'

import { useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/lib/types'

export interface UseGmBroadcastReturn {
  notify:     (charId: string, type: 'toast' | 'dialog', message: string) => void
  sendToChar: (charId: string, payload: Record<string, unknown>) => void
  broadcastAll: (payload: Record<string, unknown>, characters: Character[]) => void
}

export function useGmBroadcast(characters: Character[]): UseGmBroadcastReturn {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])
  const gmChannelsRef = useRef<Map<string, ReturnType<typeof supabase.channel>>>(new Map())

  // Add channels for new characters only — never destroy on re-render to avoid
  // the race where channels are unsubscribed when a broadcast is sent.
  useEffect(() => {
    const map = gmChannelsRef.current
    for (const c of characters) {
      if (!map.has(c.id)) {
        const ch = supabase.channel(`gm-notify-${c.id}`)
        ch.subscribe()
        map.set(c.id, ch)
      }
    }
  }, [characters, supabase])

  // Destroy channels only on unmount
  useEffect(() => {
    const map = gmChannelsRef.current
    return () => {
      for (const [, ch] of map) supabase.removeChannel(ch)
      map.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const notify = useCallback((charId: string, type: 'toast' | 'dialog', message: string) => {
    const ch = gmChannelsRef.current.get(charId)
    if (ch) ch.send({ type: 'broadcast', event: 'gm-action', payload: { type, message } })
  }, [])

  const sendToChar = useCallback((charId: string, payload: Record<string, unknown>) => {
    const ch = gmChannelsRef.current.get(charId)
    if (ch) ch.send({ type: 'broadcast', event: 'gm-action', payload })
  }, [])

  const broadcastAll = useCallback((payload: Record<string, unknown>, chars: Character[]) => {
    for (const c of chars) {
      const ch = gmChannelsRef.current.get(c.id)
      if (ch) ch.send({ type: 'broadcast', event: 'gm-action', payload })
    }
  }, [])

  return { notify, sendToChar, broadcastAll }
}
