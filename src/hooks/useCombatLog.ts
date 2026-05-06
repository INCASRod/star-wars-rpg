'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type CombatLogAlignment = 'player' | 'allied_npc' | 'enemy' | 'system'

export interface CombatLogEntry {
  id: string
  created_at: string
  participant_name: string
  alignment: CombatLogAlignment
  roll_type: string | null
  weapon_name: string | null
  result_summary: string | null
  is_visible_to_players: boolean
}

export function useCombatLog(encounterId: string | null) {
  const [entries, setEntries] = useState<CombatLogEntry[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!encounterId) { setEntries([]); return }
    supabase
      .from('combat_log')
      .select('id, created_at, participant_name, alignment, roll_type, weapon_name, result_summary, is_visible_to_players')
      .eq('encounter_id', encounterId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setEntries(data as CombatLogEntry[]) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounterId])

  useEffect(() => {
    if (!encounterId) return
    const ch = supabase
      .channel(`combat-log-${encounterId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'combat_log',
        filter: `encounter_id=eq.${encounterId}`,
      }, (payload) => {
        setEntries(prev => [...prev, payload.new as CombatLogEntry])
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounterId])

  return { entries }
}
