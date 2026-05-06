'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CombatEncounter } from '@/lib/combat'
import type { AdversaryInstance } from '@/lib/adversaries'

export interface UseEncounterDataResult {
  encounter:        CombatEncounter | null
  setEncounter:     React.Dispatch<React.SetStateAction<CombatEncounter | null>>
  roster:           AdversaryInstance[]
  setRoster:        React.Dispatch<React.SetStateAction<AdversaryInstance[]>>
  groupSizes:       Record<string, number>
  setGroupSizes:    React.Dispatch<React.SetStateAction<Record<string, number>>>
}

export function useEncounterData(campaignId: string): UseEncounterDataResult {
  const supabase = createClient()

  const [encounter, setEncounter] = useState<CombatEncounter | null>(null)
  const [roster, setRoster] = useState<AdversaryInstance[]>([])
  const [groupSizes, setGroupSizes] = useState<Record<string, number>>({})

  // Load active encounter for this campaign
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('combat_encounters')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const enc = data[0] as CombatEncounter
          setEncounter(enc)
          setRoster(enc.adversaries ?? [])
        }
      })
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime subscription — mirrors combat_encounters changes for this campaign
  useEffect(() => {
    if (!campaignId) return
    const channel = supabase
      .channel(`combat-${campaignId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'combat_encounters',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        if (payload.new) {
          const enc = payload.new as CombatEncounter
          if (enc.is_active) {
            setEncounter(enc)
            setRoster(enc.adversaries ?? [])
          } else {
            setEncounter(null)
            setRoster([])
          }
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  return { encounter, setEncounter, roster, setRoster, groupSizes, setGroupSizes }
}
