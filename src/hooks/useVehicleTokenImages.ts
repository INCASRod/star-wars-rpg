'use client'

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import { createClient } from '@/lib/supabase/client'

/** Loads vehicle_token_images once on mount. Returns the map and its setter for optimistic updates. */
export function useVehicleTokenImages(): {
  tokenImages:    Record<string, string>
  setTokenImages: Dispatch<SetStateAction<Record<string, string>>>
} {
  const [tokenImages, setTokenImages] = useState<Record<string, string>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('vehicle_token_images')
      .select('vehicle_key, token_image_url')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string> = {}
        for (const row of data as { vehicle_key: string; token_image_url: string }[]) {
          map[row.vehicle_key] = row.token_image_url
        }
        setTokenImages(map)
      })
  }, []) // load once on mount

  return { tokenImages, setTokenImages }
}
