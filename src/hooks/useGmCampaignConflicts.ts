'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface GmConflictRow {
  id:            string
  character_id:  string
  description:   string
  narrative?:    string
  session_label?: string
  created_at:    string
}

export function useGmCampaignConflicts(
  campaignId: string,
  forceSensitiveCharIds: string[],
) {
  const supabase = useMemo(() => createClient(), [])
  const [conflicts, setConflicts] = useState<GmConflictRow[]>([])

  const charIdsKey = forceSensitiveCharIds.join(',')

  useEffect(() => {
    if (!forceSensitiveCharIds.length) {
      setConflicts([])
      return
    }

    supabase
      .from('character_conflicts')
      .select('id, character_id, description, narrative, session_label, created_at')
      .in('character_id', forceSensitiveCharIds)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setConflicts(data as GmConflictRow[]) })

    const channel = supabase
      .channel(`gm-campaign-conflicts-${campaignId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'character_conflicts', filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          const row = payload.new as GmConflictRow
          if (forceSensitiveCharIds.includes(row.character_id)) {
            setConflicts(prev => [row, ...prev])
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, charIdsKey])

  return { conflicts, setConflicts }
}
