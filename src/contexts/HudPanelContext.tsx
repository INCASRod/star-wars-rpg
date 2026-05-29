'use client'

import { createContext, useContext } from 'react'

interface HudPanelContextValue {
  isOpen: boolean
}

export const HudPanelContext = createContext<HudPanelContextValue>({ isOpen: false })

export function useHudPanelContext() {
  return useContext(HudPanelContext)
}
