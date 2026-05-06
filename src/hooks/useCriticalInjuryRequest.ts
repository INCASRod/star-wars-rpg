'use client'

import { useState, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CriticalInjuryRequest } from '@/lib/types'

export function useCriticalInjuryRequest(
  characterId: string | undefined,
  supabase: SupabaseClient,
) {
  const [pendingCritRequest, setPendingCritRequest] = useState<CriticalInjuryRequest | null>(null)

  useEffect(() => {
    if (!characterId) return
    supabase
      .from('critical_injury_requests')
      .select('*')
      .eq('character_id', characterId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setPendingCritRequest(data[0] as CriticalInjuryRequest) })
    const ch = supabase
      .channel(`crit-req-${characterId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public',
        table: 'critical_injury_requests',
        filter: `character_id=eq.${characterId}`,
      }, (payload) => {
        const row = payload.new as CriticalInjuryRequest | undefined
        if (row?.status === 'pending') {
          setPendingCritRequest(row)
        } else {
          setPendingCritRequest(prev => (prev?.id === row?.id ? null : prev))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  return { pendingCritRequest, setPendingCritRequest }
}
