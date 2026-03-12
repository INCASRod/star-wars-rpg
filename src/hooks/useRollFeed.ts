'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DiceType } from '@/components/player-hud/design-tokens'

export interface RollEntry {
  id:             string
  campaign_id:    string
  character_id:   string | null
  character_name: string
  roll_label:     string | null
  pool:           Record<DiceType, number>
  result:         {
    netSuccess:   number
    netAdvantage: number
    triumph:      number
    despair:      number
    succeeded:    boolean
  }
  rolled_at:      string
  is_dm:          boolean
  hidden:         boolean
}

export function useRollFeed(campaignId: string | null | undefined) {
  const [rolls, setRolls] = useState<RollEntry[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!campaignId) return

    // Load last 20 rolls
    supabase
      .from('roll_log')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('rolled_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setRolls((data as RollEntry[]).reverse())
      })

    // Subscribe to new rolls
    const channel = supabase
      .channel(`rolls-${campaignId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'roll_log',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        setRolls(prev => [...prev.slice(-49), payload.new as RollEntry])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  return rolls
}
