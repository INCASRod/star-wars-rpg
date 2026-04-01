'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SessionRollState {
  id?: string
  campaign_id: string
  duty_roll: number | null
  duty_triggered: boolean | null
  duty_triggered_char_id: string | null
  duty_is_doubles: boolean
  duty_revealed: boolean
  obligation_roll: number | null
  obligation_triggered: boolean | null
  obligation_triggered_char_id: string | null
  obligation_revealed: boolean
}

/** Compute the session Duty wound threshold bonus for a specific character. */
export function getWoundThresholdBonus(
  characterId: string,
  state: SessionRollState | null,
): number {
  if (!state || !state.duty_revealed || !state.duty_triggered) return 0
  const doubles = state.duty_is_doubles
  if (state.duty_triggered_char_id === characterId) return doubles ? 4 : 2
  return doubles ? 2 : 1
}

/** Subscribe to session_roll_state for a campaign. Loads initial row and keeps live. */
export function useSessionRollState(campaignId: string | null): SessionRollState | null {
  const [state, setState] = useState<SessionRollState | null>(null)
  const supabase = useRef(createClient()).current

  useEffect(() => {
    if (!campaignId) return

    // Initial load
    supabase
      .from('session_roll_state')
      .select('*')
      .eq('campaign_id', campaignId)
      .single()
      .then(({ data }) => { if (data) setState(data as SessionRollState) })

    // Realtime subscription
    const channel = supabase
      .channel(`session-roll-${campaignId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'session_roll_state', filter: `campaign_id=eq.${campaignId}` },
        (payload) => { setState(payload.new as SessionRollState) },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [campaignId, supabase])

  return state
}
