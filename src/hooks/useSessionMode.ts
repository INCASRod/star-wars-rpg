'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type SessionMode = 'exploration' | 'combat'

interface SessionModeState {
  mode:               SessionMode
  round:              number
  transitionPending:  boolean
  prevMode:           SessionMode | null
}

export function useSessionMode(campaignId: string | null | undefined) {
  const [state, setState] = useState<SessionModeState>({
    mode:              'exploration',
    round:             0,
    transitionPending: false,
    prevMode:          null,
  })

  const supabase = createClient()

  useEffect(() => {
    if (!campaignId) return

    // Initial fetch
    supabase
      .from('campaigns')
      .select('session_mode, combat_round')
      .eq('id', campaignId)
      .single()
      .then(({ data }) => {
        if (data) {
          setState(s => ({
            ...s,
            mode:  (data.session_mode as SessionMode) ?? 'exploration',
            round: data.combat_round ?? 0,
          }))
        }
      })

    // Realtime subscription
    const channel = supabase
      .channel(`campaign-mode-${campaignId}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'campaigns',
        filter: `id=eq.${campaignId}`,
      }, (payload) => {
        const newMode  = payload.new.session_mode as SessionMode
        const prevMode = payload.old.session_mode as SessionMode
        const newRound = payload.new.combat_round ?? 0

        if (newMode !== prevMode) {
          setState(s => ({ ...s, transitionPending: true, prevMode }))
          setTimeout(() => {
            setState(s => ({ ...s, mode: newMode, round: newRound, transitionPending: false }))
          }, 1200)
        } else {
          setState(s => ({ ...s, round: newRound }))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}
