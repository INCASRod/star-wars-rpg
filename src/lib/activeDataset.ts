import type { SupabaseClient } from '@supabase/supabase-js'

let _cached: string | null = null

export async function fetchActiveDataset(supabase: SupabaseClient): Promise<string> {
  if (_cached) return _cached
  const { data } = await supabase
    .from('campaign_settings')
    .select('active_dataset')
    .limit(1)
    .single()
  const result: string = data?.active_dataset ?? 'respec'
  _cached = result
  return result
}
