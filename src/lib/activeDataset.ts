import type { SupabaseClient } from '@supabase/supabase-js'

let _cached: string | null = null

export async function fetchActiveDataset(supabase: SupabaseClient): Promise<string> {
  if (_cached) return _cached
  const { data, error } = await supabase
    .from('campaign_settings')
    .select('active_dataset')
    .limit(1)
    .single()
  if (error || !data?.active_dataset) return 'respec'
  _cached = data.active_dataset as string
  return _cached
}

export function resetActiveDatasetCache(): void {
  _cached = null
}
