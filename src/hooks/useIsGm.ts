'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Whether the signed-in user is a GM (public.is_gm()). `null` while unknown, `false` when signed out or not a GM.
 * UI convenience only: /gm and ?gm=1 are enforced server-side by the proxy, and RLS will enforce the data later.
 */
export function useIsGm(): boolean | null {
  const [isGm, setIsGm] = useState<boolean | null>(null)
  useEffect(() => {
    const supabase = createClient()
    let live = true
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (live) setIsGm(false); return }
      const { data, error } = await supabase.rpc('is_gm')
      if (live) setIsGm(!error && data === true)
    }
    void check()
    const { data: sub } = supabase.auth.onAuthStateChange(() => { void check() })
    return () => { live = false; sub.subscription.unsubscribe() }
  }, [])
  return isGm
}
