'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Combat participant row (from DB) ──────────────────────────────────────────
export interface CombatParticipantRow {
  id: string
  character_id: string
  slot_type: 'pc' | 'npc'
  active_weapon_key: string | null
  active_weapon_name: string | null
  secondary_weapon_name: string | null
  secondary_weapon_key: string | null
  default_character_id: string | null
  active_character_id: string | null
  active_character_name: string | null
  has_acted_this_round: boolean
}

/**
 * Subscribes to the combat_participants table for a given campaign.
 * Returns the current map (keyed by character_id) and a setter for
 * optimistic updates in the parent component.
 */
export function useCombatParticipants(campaignId: string) {
  const supabase = createClient()
  const [combatParticipants, setCombatParticipants] = useState<Record<string, CombatParticipantRow>>({})

  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('combat_participants')
      .select('id, character_id, slot_type, active_weapon_key, active_weapon_name, secondary_weapon_name, secondary_weapon_key, default_character_id, active_character_id, active_character_name, has_acted_this_round')
      .eq('campaign_id', campaignId)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, CombatParticipantRow> = {}
        for (const r of data as CombatParticipantRow[]) {
          map[r.character_id] = r
        }
        setCombatParticipants(map)
      })
    const ch = supabase
      .channel(`combat-participants-${campaignId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'combat_participants',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const old = payload.old as { character_id: string }
          setCombatParticipants(prev => {
            const next = { ...prev }
            delete next[old.character_id]
            return next
          })
        } else if (payload.new) {
          const r = payload.new as CombatParticipantRow
          setCombatParticipants(prev => ({ ...prev, [r.character_id]: r }))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  return { combatParticipants, setCombatParticipants }
}
