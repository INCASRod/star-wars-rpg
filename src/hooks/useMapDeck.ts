import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchEncounterForMap } from '@/lib/encounters'
import type { CombatEncounter } from '@/lib/combat'

/**
 * The persistent encounter deck of one map (migration 115), live, whether or
 * not combat has begun. `useEncounterState` only returns a row once
 * `is_active = true`, so before Begin Combat a player sees no deck at all —
 * this hook is for anything that must show the true state of a map's
 * adversaries (group size, wounds) ahead of initiative, e.g. the map token
 * tooltip. It is the SAME row combat later runs on, so nothing is copied or
 * re-derived when combat starts.
 */
export function useMapDeck(campaignId: string | null, mapId: string | null): CombatEncounter | null {
  const supabase = useMemo(() => createClient(), [])
  const [deck, setDeck] = useState<CombatEncounter | null>(null)

  useEffect(() => {
    setDeck(null)
    if (!campaignId || !mapId) return
    let cancelled = false
    fetchEncounterForMap(supabase, campaignId, mapId).then(d => { if (!cancelled) setDeck(d) })
    const channel = supabase
      .channel(`map-deck-${mapId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'combat_encounters',
        filter: `campaign_id=eq.${campaignId}`,
      }, payload => {
        const row = payload.new as CombatEncounter | undefined
        if (row && row.map_id === mapId) setDeck(row)
      })
      .subscribe()
    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [campaignId, mapId, supabase])

  return deck
}
