'use client'

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface MapPlanet {
  id:          string
  campaign_id: string
  name:        string
  created_at?: string
}

/** Subscribes to map_planets for a campaign with full realtime (INSERT/UPDATE/DELETE). */
export function useMapPlanets(campaignId: string): {
  planets:    MapPlanet[]
  setPlanets: Dispatch<SetStateAction<MapPlanet[]>>
} {
  const [planets, setPlanets] = useState<MapPlanet[]>([])

  useEffect(() => {
    if (!campaignId) return
    const supabase = createClient()

    supabase
      .from('map_planets')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('name')
      .then(({ data }) => { if (data) setPlanets(data as MapPlanet[]) })

    const ch = supabase
      .channel(`map-planets-${campaignId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'map_planets',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPlanets(prev => [...prev, payload.new as MapPlanet].sort((a, b) => a.name.localeCompare(b.name)))
        } else if (payload.eventType === 'UPDATE') {
          setPlanets(prev => prev.map(p => p.id === (payload.new as MapPlanet).id ? payload.new as MapPlanet : p))
        } else if (payload.eventType === 'DELETE') {
          setPlanets(prev => prev.filter(p => p.id !== (payload.old as MapPlanet).id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  return { planets, setPlanets }
}
