'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TalentTreeConnection } from '@/components/character/TalentTree'

// ─────────────────────────────────────────────────────────────────────────────
// useConnectorLayout — measured-DOM connector bar geometry, shared by the
// specialization tree (TalentTree.tsx) and the signature ability tree
// (TalentSurface.tsx / SigNodeGrid).
//
// Both trees derive connections the same way (direction flags → a list of
// {fromRow,fromCol,toRow,toCol} edges) but differ in how a cell is looked up:
// the spec tree keys every cell "row-col"; the sig tree's wide base node has
// no single column, so it uses a fixed key regardless of column. Each caller
// supplies its own `cellKey` resolver and tags its cells with a matching
// `data-cell-key` attribute — this hook only measures, it never assumes a key
// format.
// ─────────────────────────────────────────────────────────────────────────────

export interface ConnectorBar {
  id: string
  top: number
  left: number
  width: number
  height: number
  active: boolean
}

const DEFAULT_THICKNESS = 6
const MAX_ZERO_DIMENSION_RETRIES = 5

export function useConnectorLayout(opts: {
  containerRef: React.RefObject<HTMLElement | null>
  connections: TalentTreeConnection[]
  /** Resolve a connection endpoint to the `data-cell-key` value on its DOM cell. */
  cellKey: (row: number, col: number) => string
  /** Whether the node at (row, col) is owned/purchased — drives the active/glow state. */
  isOwned: (row: number, col: number) => boolean
  /** Bar thickness in px. Not a colour/spacing token — a connector-specific geometry constant, same precedent as the plaque's clip-path notch size (Prompt 3). */
  barThickness?: number
  /** Extra invalidation triggers beyond connections/cellKey/isOwned (e.g. active spec key). */
  deps?: unknown[]
}): ConnectorBar[] {
  const { containerRef, connections, cellKey, isOwned, barThickness = DEFAULT_THICKNESS, deps = [] } = opts
  const [bars, setBars] = useState<ConnectorBar[]>([])
  const rafRef = useRef<number | null>(null)
  const retryRef = useRef(0)

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const nextBars: ConnectorBar[] = []
    let sawZeroDimension = false

    for (const conn of connections) {
      const fromEl = container.querySelector<HTMLElement>(`[data-cell-key="${cellKey(conn.fromRow, conn.fromCol)}"]`)
      const toEl   = container.querySelector<HTMLElement>(`[data-cell-key="${cellKey(conn.toRow, conn.toCol)}"]`)
      if (!fromEl || !toEl) continue

      const fromRect = fromEl.getBoundingClientRect()
      const toRect   = toEl.getBoundingClientRect()
      // First-paint guard: cells can still be zero-sized on the very first
      // measure pass (layout not yet committed) — skip drawing collapsed bars
      // and retry next frame instead of committing a bad layout.
      if (fromRect.width === 0 || fromRect.height === 0 || toRect.width === 0 || toRect.height === 0) {
        sawZeroDimension = true
        continue
      }

      const active = isOwned(conn.fromRow, conn.fromCol) && isOwned(conn.toRow, conn.toCol)
      const isVertical = conn.fromCol === conn.toCol
      const id = `${cellKey(conn.fromRow, conn.fromCol)}>${cellKey(conn.toRow, conn.toCol)}`

      let bar: ConnectorBar
      if (isVertical) {
        // Bottom edge centre of the upper node → top edge centre of the lower node.
        const centerX = (((fromRect.left + fromRect.right) / 2) + ((toRect.left + toRect.right) / 2)) / 2 - containerRect.left
        const y1 = fromRect.bottom - containerRect.top
        const y2 = toRect.top - containerRect.top
        bar = {
          id,
          top: Math.min(y1, y2),
          left: centerX - barThickness / 2,
          width: barThickness,
          height: Math.abs(y2 - y1),
          active,
        }
      } else {
        // Right edge centre of the left node → left edge centre of the right node.
        const centerY = (((fromRect.top + fromRect.bottom) / 2) + ((toRect.top + toRect.bottom) / 2)) / 2 - containerRect.top
        const x1 = fromRect.right - containerRect.left
        const x2 = toRect.left - containerRect.left
        bar = {
          id,
          top: centerY - barThickness / 2,
          left: Math.min(x1, x2),
          width: Math.abs(x2 - x1),
          height: barThickness,
          active,
        }
      }
      nextBars.push(bar)
    }

    if (sawZeroDimension && retryRef.current < MAX_ZERO_DIMENSION_RETRIES) {
      retryRef.current += 1
      requestAnimationFrame(measure)
      return
    }
    retryRef.current = 0
    setBars(nextBars)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, connections, cellKey, isOwned, barThickness])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scheduleMeasure = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        measure()
      })
    }

    scheduleMeasure()

    const ro = new ResizeObserver(scheduleMeasure)
    ro.observe(container)

    return () => {
      ro.disconnect()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, measure, ...deps])

  return bars
}
