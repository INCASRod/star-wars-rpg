'use client'

// GmInitiativeDrawer is now a thin shim — all logic and portal mounting live in InitiativeStrip.
// This file is kept so existing imports in GmShell.tsx require no path change.
export { InitiativeStrip as GmInitiativeDrawer } from '@/components/player/InitiativeStrip'
export type { InitiativeStripProps as GmInitiativeDrawerProps, GmControls } from '@/components/player/InitiativeStrip'
