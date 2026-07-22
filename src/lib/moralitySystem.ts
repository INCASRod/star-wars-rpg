import type { SupabaseClient } from '@supabase/supabase-js'

export type MoralitySystem = 'vanilla' | 'force_presence'

let _cached: MoralitySystem | null = null

export async function fetchMoralitySystem(supabase: SupabaseClient): Promise<MoralitySystem> {
  if (_cached) return _cached
  const { data, error } = await supabase
    .from('campaign_settings')
    .select('morality_system')
    .limit(1)
    .single()
  if (error || !data?.morality_system) {
    console.error('[moralitySystem] failed to fetch campaign_settings.morality_system:', error)
    throw error ?? new Error('campaign_settings.morality_system missing or null')
  }
  _cached = data.morality_system as MoralitySystem
  return _cached
}

export function resetMoralitySystemCache(): void {
  _cached = null
}
