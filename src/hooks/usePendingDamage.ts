'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Pending damage row (from DB) ─────────────────────────────────────────────
export interface PendingDamage {
  id:                       string
  campaign_id:              string
  encounter_id:             string | null
  target_instance_id:       string | null
  target_name:              string
  attacker_name:            string
  raw_damage:               number
  soak_value:               number
  net_damage:               number
  status:                   'pending' | 'pending_secondary' | 'applied' | 'modified' | 'dismissed'
  weapon_name:              string | null
  attack_type:              string | null
  range_band:               string | null
  created_at:               string
  crit_eligible:            boolean
  crit_rating:              number | null
  crit_modifier:            number
  crit_triggered_by_triumph: boolean
}

export interface UsePendingDamageResult {
  pendingDamages:    PendingDamage[]
  setPendingDamages: React.Dispatch<React.SetStateAction<PendingDamage[]>>
  editedDamages:     Record<string, number>
  setEditedDamages:  React.Dispatch<React.SetStateAction<Record<string, number>>>
}

export function usePendingDamage(campaignId: string): UsePendingDamageResult {
  const supabase = createClient()

  const [pendingDamages, setPendingDamages] = useState<PendingDamage[]>([])
  const [editedDamages, setEditedDamages]   = useState<Record<string, number>>({})

  // Pending damage: initial load + realtime subscription
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('pending_damage')
      .select('*')
      .eq('campaign_id', campaignId)
      .in('status', ['pending', 'pending_secondary'])
      .order('created_at')
      .then(({ data }) => { if (data) setPendingDamages(data as PendingDamage[]) })

    const ch = supabase
      .channel(`pending-damage-${campaignId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'pending_damage',
        filter: `campaign_id=eq.${campaignId}`,
      }, payload => {
        setPendingDamages(prev => [...prev, payload.new as PendingDamage])
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'pending_damage',
        filter: `campaign_id=eq.${campaignId}`,
      }, payload => {
        if (payload.new.status !== 'pending' && payload.new.status !== 'pending_secondary') {
          setPendingDamages(prev => prev.filter(d => d.id !== payload.new.id))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  return { pendingDamages, setPendingDamages, editedDamages, setEditedDamages }
}
