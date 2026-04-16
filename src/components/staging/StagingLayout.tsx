'use client'

import type { ReactNode } from 'react'

/**
 * StagingLayout — Shell for the GM Staging view.
 *
 * Provides a three-slot layout (topBar, leftDrawerContent, rightDrawerContent)
 * over an arbitrary base layer (the map canvas). All map logic, Pixi.js canvas,
 * and token sync live inside `children` — this component only composes the
 * visual layers around it.
 *
 * Slots:
 *  - children            — base layer; fills the full area (map canvas goes here)
 *  - topBar              — absolute overlay pinned to the top edge
 *  - leftDrawerContent   — absolute overlay pinned to the left edge
 *  - rightDrawerContent  — absolute overlay pinned to the right edge
 *
 * All slot content is optional; omitting a slot renders nothing for that region.
 */
export interface StagingLayoutProps {
  /** The map canvas (or any full-area base layer). Fills 100% width/height. */
  children: ReactNode
  /** Content rendered in an absolute overlay at the top of the staging area. */
  topBar?: ReactNode
  /** Content rendered in an absolute overlay anchored to the left edge. */
  leftDrawerContent?: ReactNode
  /** Content rendered in an absolute overlay anchored to the right edge. */
  rightDrawerContent?: ReactNode
}

export function StagingLayout({
  children,
  topBar,
  leftDrawerContent,
  rightDrawerContent,
}: StagingLayoutProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Base layer: map canvas ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {children}
      </div>

      {/* ── Top bar overlay ── */}
      {topBar && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          {/* pointerEvents restored per-child via inline style or wrapper */}
          <div style={{ pointerEvents: 'auto' }}>{topBar}</div>
        </div>
      )}

      {/* ── Left drawer overlay ── */}
      {leftDrawerContent && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 40,
            pointerEvents: 'auto',
          }}
        >
          {leftDrawerContent}
        </div>
      )}

      {/* ── Right drawer overlay ── */}
      {rightDrawerContent && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            pointerEvents: 'auto',
          }}
        >
          {rightDrawerContent}
        </div>
      )}
    </div>
  )
}
