'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Campaign, Player, Character } from '@/lib/types'

interface CampaignState {
  campaign: Campaign | null
  players: Player[]
  characters: Character[]
  loading: boolean
  error: string | null
  load: (campaignId: string) => Promise<void>
  verifyGmPin: (pin: string) => boolean
}

export const useCampaign = create<CampaignState>((set, get) => ({
  campaign: null,
  players: [],
  characters: [],
  loading: false,
  error: null,

  load: async (campaignId: string) => {
    set({ loading: true, error: null })
    const supabase = createClient()

    try {
      const [campRes, playersRes, charsRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', campaignId).single(),
        supabase.from('players').select('*').eq('campaign_id', campaignId),
        supabase.from('characters').select('*').eq('campaign_id', campaignId),
      ])

      if (campRes.error) throw campRes.error

      set({
        campaign: campRes.data as Campaign,
        players: (playersRes.data as Player[]) || [],
        characters: (charsRes.data as Character[]) || [],
        loading: false,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: message, loading: false })
    }
  },

  verifyGmPin: (pin: string) => {
    const campaign = get().campaign
    if (!campaign) return false
    return campaign.gm_pin === pin
  },
}))
