'use client'

import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

/** talent_key -> Set of relevant skill_keys (H1's talent_skill_relevance,
    migration 119). Scoped to dataset_source = 'respec' — the active dataset
    (campaign_settings.active_dataset) per CLAUDE.md; talents are a
    respec-owned domain. Loaded once; the table is small and static (no
    realtime subscription needed — GM authoring happens elsewhere/offline
    relative to a live player session). */
export function useTalentSkillRelevance(supabase: SupabaseClient) {
  const [map, setMap] = useState<Record<string, Set<string>>>({})

  useEffect(() => {
    let cancelled = false
    supabase
      .from('talent_skill_relevance')
      .select('talent_key, skill_key')
      .eq('dataset_source', 'respec')
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        const next: Record<string, Set<string>> = {}
        for (const row of data as { talent_key: string; skill_key: string }[]) {
          if (!next[row.talent_key]) next[row.talent_key] = new Set()
          next[row.talent_key].add(row.skill_key)
        }
        setMap(next)
      })
    return () => { cancelled = true }
  }, [supabase])

  return map
}
