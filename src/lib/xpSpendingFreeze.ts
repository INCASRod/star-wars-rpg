import type { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

export const XP_FROZEN_MESSAGE = 'XP spending is temporarily paused by the GM'

/** Fresh read, never cached: the GM flips this mid-session and it must take effect on the next purchase. */
export async function isXpSpendingFrozen(supabase: SupabaseClient): Promise<boolean> {
  const { data } = await supabase.from('campaign_settings').select('xp_spending_frozen').limit(1).single()
  return data?.xp_spending_frozen === true
}

/** Purchase guard: true (and toasts) when spending is paused. Call before any optimistic update. */
export async function xpSpendingBlocked(supabase: SupabaseClient): Promise<boolean> {
  if (!(await isXpSpendingFrozen(supabase))) return false
  toast.error(XP_FROZEN_MESSAGE)
  return true
}
