'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ActiveMap {
  id: string
  campaign_id: string
  name: string
  image_url: string
  grid_enabled: boolean
  grid_size: number
  is_active: boolean
  is_visible_to_players: boolean
  token_scale: number
  created_at: string
}

/**
 * Subscribes to the maps table for a campaign.
 * Returns:
 *   activeMap  — the map where is_active=true (GM sees regardless of visibility)
 *   visibleMap — the map where is_active=true AND is_visible_to_players=true (player view)
 *   allMaps    — full list for GM management
 */
export function useActiveMap(campaignId: string | null) {
  const supabase = useMemo(() => createClient(), [])
  const [allMaps, setAllMaps] = useState<ActiveMap[]>([])

  useEffect(() => {
    if (!campaignId) return

    supabase
      .from('maps')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setAllMaps(data as ActiveMap[]) })

    const ch = supabase
      .channel(`maps-campaign-${campaignId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maps', filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          const { eventType, new: n, old: o } = payload
          setAllMaps(prev => {
            if (eventType === 'INSERT') return [n as ActiveMap, ...prev]
            if (eventType === 'UPDATE') return prev.map(m => m.id === (n as ActiveMap).id ? n as ActiveMap : m)
            if (eventType === 'DELETE') return prev.filter(m => m.id !== (o as { id: string }).id)
            return prev
          })
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeMap  = allMaps.find(m => m.is_active) ?? null
  const visibleMap = allMaps.find(m => m.is_active && m.is_visible_to_players) ?? null

  function removeMap(mapId: string) {
    setAllMaps(prev => prev.filter(m => m.id !== mapId))
  }

  return { activeMap, visibleMap, allMaps, supabase, removeMap }
}
