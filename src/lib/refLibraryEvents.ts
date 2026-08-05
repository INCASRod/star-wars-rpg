'use client'

import { useEffect, useState } from 'react'

/**
 * Tiny cross-component refresh bus for the custom ref libraries
 * (`ref_adversaries` / `ref_vehicles`).
 *
 * Several unrelated trees fetch these tables independently and mount-once:
 * GmToolsPanel, EncounterDeck's inline search, AdversaryLibrary, VehicleLibrary,
 * StagingFloatingToolbar/StagingLeftRail's library mounts. Saving a new
 * adversary/vehicle in the editor previously only updated the tree that owned
 * the editor, so every other list stayed stale until a full page reload.
 *
 * The editors call `emitRefLibraryUpdated(kind)` after a successful write;
 * every consumer puts `useRefLibraryRefresh(kind)` in its fetch effect's dep
 * array and re-fetches.
 */

export type RefLibraryKind = 'adversary' | 'vehicle'

const EVENT_NAME = 'holocron:ref-library-updated'

export function emitRefLibraryUpdated(kind: RefLibraryKind) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<RefLibraryKind>(EVENT_NAME, { detail: kind }))
}

/**
 * Returns a counter that increments whenever a library of `kind` is written.
 * Omit `kind` to listen to both.
 */
export function useRefLibraryRefresh(kind?: RefLibraryKind): number {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<RefLibraryKind>).detail
      if (kind && detail !== kind) return
      setTick(t => t + 1)
    }
    window.addEventListener(EVENT_NAME, onUpdate)
    return () => window.removeEventListener(EVENT_NAME, onUpdate)
  }, [kind])

  return tick
}
