import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { session_key, campaign_id } = await req.json()
  if (!session_key || !campaign_id) return new Response('Bad Request', { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  await supabase
    .from('character_sessions')
    .delete()
    .eq('session_key', session_key)
    .eq('campaign_id', campaign_id)

  return new Response('OK')
}
