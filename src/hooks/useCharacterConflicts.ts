'use client'

import { useState, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ConflictEntry } from '@/components/player-hud/ForcePanel'

export function useCharacterConflicts(
  characterId: string | undefined,
  supabase: SupabaseClient,
) {
  const [conflicts, setConflicts] = useState<ConflictEntry[]>([])

  useEffect(() => {
    if (!characterId) return
    supabase
      .from('character_conflicts')
      .select('id, description, session_label, is_resolved, created_at')
      .eq('character_id', characterId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setConflicts(data as ConflictEntry[]) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  return { conflicts, setConflicts }
}
