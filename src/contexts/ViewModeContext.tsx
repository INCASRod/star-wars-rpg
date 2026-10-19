'use client'

import { createContext, useContext, useLayoutEffect, useMemo, type ReactNode } from 'react'
import { setWritesBlocked } from '@/lib/supabase/client'

/**
 * How the viewer relates to the character on screen.
 *  - owner:   today's behaviour (the bound owner, or a signed-out / unbound viewer during the transition period)
 *  - gm:      a signed-in GM (unrestricted; GM edit controls still come from `?gm=1`)
 *  - preview: a signed-in player bound to a DIFFERENT character: read-only, build only
 */
export type ViewMode = 'owner' | 'gm' | 'preview'

interface ViewModeValue { mode: ViewMode; canWrite: boolean }

const ViewModeContext = createContext<ViewModeValue>({ mode: 'owner', canWrite: true })

export function ViewModeProvider({ mode, children }: { mode: ViewMode; children: ReactNode }) {
  const value = useMemo<ViewModeValue>(() => ({ mode, canWrite: mode !== 'preview' }), [mode])
  // The choke point: in Preview Only the shared Supabase client refuses every write (see lib/supabase/client.ts),
  // so a control that was missed in the UI still cannot change anything. Layout effect: runs before any data effect.
  useLayoutEffect(() => {
    setWritesBlocked(mode === 'preview')
    return () => setWritesBlocked(false)
  }, [mode])
  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>
}

export const useViewMode = () => useContext(ViewModeContext)
