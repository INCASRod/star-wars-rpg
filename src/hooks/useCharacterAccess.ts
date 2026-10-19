'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ViewMode } from '@/contexts/ViewModeContext'

interface Access {
  status: 'loading' | 'ready'
  mode: ViewMode
  /** The viewer's own character, for "Back to my character" in Preview Only. */
  ownCharacterId: string | null
}

/**
 * Decides how the signed-in viewer sees a character (Auth B3). Preview only applies to a viewer who is signed in AND
 * bound to a character that is not this one. Signed out, unbound, or a GM: today's behaviour. UI only; no policy
 * depends on it until the RLS lock-down.
 */
export function useCharacterAccess(characterId: string): Access {
  const [state, setState] = useState<Access & { forId: string }>({ status: 'loading', mode: 'owner', ownCharacterId: null, forId: characterId })

  useEffect(() => {
    let live = true
    const finish = (mode: ViewMode, ownCharacterId: string | null) => { if (live) setState({ status: 'ready', mode, ownCharacterId, forId: characterId }) }
    void (async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return finish('owner', null)
      const { data: gm } = await supabase.rpc('is_gm')
      if (gm === true) return finish('gm', null)
      const { data: players } = await supabase.from('players').select('id').eq('user_id', session.user.id)
      const playerIds = (players ?? []).map(p => p.id as string)
      if (playerIds.length === 0) return finish('owner', null)
      const { data: chars } = await supabase.from('characters').select('id').in('player_id', playerIds).eq('is_archived', false)
      const owned = (chars ?? []).map(c => c.id as string)
      if (owned.length === 0 || owned.includes(characterId)) return finish('owner', owned[0] ?? null)
      finish('preview', owned[0])
    })()
    return () => { live = false }
  }, [characterId])

  // A stale result for a previous character id counts as loading.
  return state.forId === characterId ? state : { status: 'loading', mode: 'owner', ownCharacterId: null }
}
