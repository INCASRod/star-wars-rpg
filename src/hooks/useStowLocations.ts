'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StowableAsset } from '@/lib/types'

export function useStowLocations(campaignId: string | null): {
  stowableAssets: StowableAsset[]
  baseOfOperationsName: string | null
} {
  const [stowableAssets,       setStowableAssets]       = useState<StowableAsset[]>([])
  const [baseOfOperationsName, setBaseOfOperationsName]  = useState<string | null>(null)

  useEffect(() => {
    if (!campaignId) return
    const supabase = createClient()

    supabase
      .from('group_assets')
      .select('id, name, asset_type, is_group_storage')
      .eq('campaign_id', campaignId)
      .eq('is_archived', false)
      .in('asset_type', ['vehicle', 'starship', 'safe_house'])
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setStowableAssets(data.map(a => ({
          id:               a.id,
          name:             a.name,
          type:             a.asset_type as 'vehicle' | 'starship' | 'safe_house',
          is_group_storage: a.is_group_storage ?? false,
        })))
      })

    supabase
      .from('campaigns')
      .select('base_of_operations_name')
      .eq('id', campaignId)
      .maybeSingle()
      .then(({ data }) => { setBaseOfOperationsName(data?.base_of_operations_name ?? null) })
  }, [campaignId])

  return { stowableAssets, baseOfOperationsName }
}
