import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CombatEncounter } from '@/lib/combat'

export interface UseEncounterStateResult {
  encounter:  CombatEncounter | null
  isLoading:  boolean
}

/**
 * Subscribes to the active combat encounter for a given campaign.
 * Returns the live encounter object and an isLoading flag.
 * Cleans up the Realtime channel on unmount or when campaignId changes.
 */
export function useEncounterState(campaignId: string | null): UseEncounterStateResult {
  const [encounter,  setEncounter]  = useState<CombatEncounter | null>(null)
  const [isLoading,  setIsLoading]  = useState(true)
  const supabase = createClient()

  // Initial fetch — load the current active encounter
  useEffect(() => {
    if (!campaignId) {
      setEncounter(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    supabase
      .from('combat_encounters')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setEncounter(data && data.length > 0 ? (data[0] as CombatEncounter) : null)
        setIsLoading(false)
      })
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime subscription — keep encounter in sync with DB changes
  useEffect(() => {
    if (!campaignId) return
    const channel = supabase
      .channel(`combat-player-${campaignId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'combat_encounters',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        if (payload.new) setEncounter(payload.new as CombatEncounter)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  return { encounter, isLoading }
}
