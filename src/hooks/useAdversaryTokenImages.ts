'use client'

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import { createClient } from '@/lib/supabase/client'

/** Loads adversary_token_images once on mount. Returns the map and its setter for optimistic updates. */
export function useAdversaryTokenImages(): {
  tokenImages:    Record<string, string>
  setTokenImages: Dispatch<SetStateAction<Record<string, string>>>
} {
  const [tokenImages, setTokenImages] = useState<Record<string, string>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('adversary_token_images')
      .select('adversary_key, token_image_url')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string> = {}
        for (const row of data as { adversary_key: string; token_image_url: string }[]) {
          map[row.adversary_key] = row.token_image_url
        }
        setTokenImages(map)
      })
  }, []) // load once on mount

  return { tokenImages, setTokenImages }
}
