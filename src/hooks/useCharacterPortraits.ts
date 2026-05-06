import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

/** Fetches portrait_url for the given character IDs. Re-fetches when the ID set changes. */
export function useCharacterPortraits(characterIds: string[]): Record<string, string> {
  const [portraits, setPortraits] = useState<Record<string, string>>({})
  const key = characterIds.slice().sort().join(',')

  useEffect(() => {
    if (!key) return
    const supabase = createClient()
    supabase
      .from('characters')
      .select('id, portrait_url')
      .in('id', characterIds)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string> = {}
        for (const row of data as { id: string; portrait_url: string | null }[]) {
          if (row.portrait_url) map[row.id] = row.portrait_url
        }
        setPortraits(map)
      })
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return portraits
}
