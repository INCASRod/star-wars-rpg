import { NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/auth/server'

/**
 * Called by navigator.sendBeacon when a player leaves. Runs as the signed-in caller (the beacon carries the
 * auth cookie), so RLS on character_sessions (owner or GM, migration 157) decides what can be deleted.
 */
export async function POST(req: NextRequest) {
  const { session_key, campaign_id } = await req.json()
  if (!session_key || !campaign_id) return new Response('Bad Request', { status: 400 })

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  await supabase
    .from('character_sessions')
    .delete()
    .eq('session_key', session_key)
    .eq('campaign_id', campaign_id)

  return new Response('OK')
}
