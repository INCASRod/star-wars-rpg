'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useMapPlanets, type MapPlanet } from '@/hooks/useMapPlanets'
import type { ActiveMap, CrawlContent } from '@/hooks/useActiveMap'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, Z, RADIUS, EASE } from '@/lib/tokens'

/* ── SVG/geometry constants ─────────────────────────────────── */
const SVG_W   = 200
const SVG_H   = 200
const PUCK_CX = 180
const PUCK_CY = 180
const R_PUCK  = 18
const R_OUT   = 72
const R_IN    = 46
const R_ICON  = 59

/* Arc definitions */
const ARC_DEFS = [
  { id: 0 as const, startDeg: 182, endDeg: 208, icon: '◫', label: 'MAP LIBRARY'   },
  { id: 1 as const, startDeg: 213, endDeg: 239, icon: '▶', label: 'OPENING CRAWL' },
  { id: 2 as const, startDeg: 244, endDeg: 270, icon: '⊕', label: 'TOKEN SCALE'   },
]

type ArcId = 0 | 1 | 2

/* SVG colour exceptions — CSS vars unsupported in SVG stroke/fill attributes */
const GOLD       = '#C8A030' // approved SVG exception
const GOLD_DIM   = '#4A3C14' // approved SVG exception
const GOLD_FAINT = '#C8A030' // approved SVG exception (opacity applied per-element)

/* ── Polar → SVG cartesian ──────────────────────────────────── */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = deg * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r1: number, r2: number, startDeg: number, endDeg: number): string {
  const s1 = polar(cx, cy, r1, startDeg)
  const e1 = polar(cx, cy, r1, endDeg)
  const s2 = polar(cx, cy, r2, startDeg)
  const e2 = polar(cx, cy, r2, endDeg)
  const large = (endDeg - startDeg > 180) ? 1 : 0
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${r1} ${r1} 0 ${large} 1 ${e1.x} ${e1.y}`,
    `L ${e2.x} ${e2.y}`,
    `A ${r2} ${r2} 0 ${large} 0 ${s2.x} ${s2.y}`,
    'Z',
  ].join(' ')
}

/* ── Props ──────────────────────────────────────────────────── */
export interface MapToolsRadialProps {
  campaignId:       string
  allMaps:          ActiveMap[]     // standard maps only (crawl row excluded)
  activeMap:        ActiveMap | null
  onDeleteMap:      (mapId: string) => void
  tokenScale:       number
  adjustTokenScale: (delta: number) => void
}

/* ── Component ──────────────────────────────────────────────── */
export function MapToolsRadial({
  campaignId,
  allMaps,
  activeMap,
  onDeleteMap,
  tokenScale,
  adjustTokenScale,
}: MapToolsRadialProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  /* Drag state — widget position relative to its parent */
  const [dragPos,     setDragPos]     = useState<{ x: number; y: number } | null>(null)
  const dragOffsetRef = useRef<{ ox: number; oy: number } | null>(null)
  const widgetRef     = useRef<HTMLDivElement>(null)

  /* Arc menu state */
  const [isOpen,    setIsOpen]    = useState(false)
  const [activeArc, setActiveArc] = useState<ArcId | null>(null)

  /* Drag handlers */
  const onPuckMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    const rect = widgetRef.current?.getBoundingClientRect()
    if (!rect) return
    // Snapshot offset ONCE — do not recalculate on mousemove
    const parentRect = widgetRef.current?.parentElement?.getBoundingClientRect()
    if (!parentRect) return
    dragOffsetRef.current = {
      ox: e.clientX - rect.left,
      oy: e.clientY - rect.top,
    }
    // Capture current absolute position relative to parent
    const initX = rect.left - parentRect.left
    const initY = rect.top  - parentRect.top
    setDragPos({ x: initX, y: initY })

    function onMove(me: MouseEvent) {
      if (!dragOffsetRef.current || !parentRect) return
      const parentNow = widgetRef.current?.parentElement?.getBoundingClientRect() ?? parentRect
      setDragPos({
        x: me.clientX - parentNow.left - dragOffsetRef.current.ox,
        y: me.clientY - parentNow.top  - dragOffsetRef.current.oy,
      })
    }
    function onUp() {
      dragOffsetRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }, [])

  /* Position style — default bottom-right; dragged = left/top */
  const posStyle: React.CSSProperties = dragPos
    ? { position: 'absolute', left: dragPos.x, top: dragPos.y, bottom: 'auto', right: 'auto' }
    : { position: 'absolute', bottom: '1rem',  right: '1rem' }

  return (
    <div
      ref={widgetRef}
      style={{
        ...posStyle,
        width:         SVG_W,
        height:        SVG_H,
        zIndex:        Z.fab,
        pointerEvents: 'none',
        userSelect:    'none',
      }}
    >
      {/* ── Three.js background canvas (z=0) ── */}
      {/* placeholder — wired in Task 4 */}
      <canvas
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          zIndex: 0, pointerEvents: 'none', borderRadius: RADIUS.lg,
        }}
      />

      {/* ── SVG: arcs + puck (z=1) ── */}
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'visible', pointerEvents: 'none' }}
      >
        {/* Puck */}
        <circle
          cx={PUCK_CX} cy={PUCK_CY} r={R_PUCK}
          fill={HUD.bg}
          stroke={GOLD}
          strokeWidth={1.5}
          style={{ pointerEvents: 'none' }}
        />
        {/* Puck icon — ✦ hamburger */}
        <text
          x={PUCK_CX} y={PUCK_CY}
          textAnchor="middle" dominantBaseline="central"
          fill={GOLD}
          fontSize={10}
          fontFamily={FONT_BODY}
          style={{ pointerEvents: 'none' }}
        >
          ✦
        </text>
      </svg>

      {/* ── Puck hit area (z=2) — drag + click ── */}
      <div
        onMouseDown={onPuckMouseDown}
        onClick={() => setIsOpen(o => !o)}
        style={{
          position:     'absolute',
          left:         PUCK_CX - R_PUCK - 6,
          top:          PUCK_CY - R_PUCK - 6,
          width:        (R_PUCK + 6) * 2,
          height:       (R_PUCK + 6) * 2,
          borderRadius: RADIUS.full,
          zIndex:       2,
          cursor:       'grab',
          pointerEvents:'auto',
        }}
      />
    </div>
  )
}
