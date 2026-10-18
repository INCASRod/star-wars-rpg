'use client'

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Graph, Hazard, RouteResult } from '@/lib/astrogation'
import styles from './galaxy.module.css'

export interface MapPin { id: string; name: string; x: number; y: number }
export type RouteStyle = 'lane' | 'hop'

interface View { tx: number; ty: number; k: number }

const MIN_K = 0.05
const MAX_K = 6
const LABEL_PX = 10 // label font size, screen px
const LABEL_SETTLE_MS = 100 // labels re-place this long after zoom/pan stops
const CHAR_W = LABEL_PX * 0.6 // JetBrains Mono advance
// text sits 3px below the dot; its rendered box measures ~13px tall, so reserve 8px above and 7px below the dot's y
const LABEL_UP = 8
const LABEL_DOWN = 7
const CLICK_SLOP = 4 // px of pointer travel that turns a click into a drag

/**
 * Background photo (scripts/galaxy-bg.py). Atmosphere only, it is not aligned to the lanes. Tune by eye here:
 * `cx`/`cy` = map point under the galactic core (default: the planet cloud's centroid), `dx`/`dy` nudge it,
 * `rotate` turns it further (degrees clockwise; the script already baked in -1.56), `size` is the image's width in
 * map units (the image is square), `opacity` dims it.
 */
const BG_CONFIG = {
  src: '/galaxy/ngc6217.webp',
  cx: 2363.9, cy: 2314.6,
  dx: 0, dy: 0,
  rotate: 0,
  size: 5423,
  opacity: 0.25,
}

interface Props {
  graph: Graph
  hazards: Hazard[]
  pins: MapPin[]
  route: RouteResult | null
  routeStyle: RouteStyle
  pinMode: boolean
  /** held current location, drawn as a dashed ring */
  current: { x: number; y: number } | null
  onPlanet: (id: string) => void
  onPin: (id: string) => void
  onDropPin: (x: number, y: number) => void
}

interface Label { key: string; name: string; x: number; y: number; end: boolean; strong: boolean }
interface Cand { key: string; name: string; x: number; y: number; strong: boolean }
type Box = { x0: number; x1: number; y0: number; y1: number }

const hits = (a: Box, b: Box) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0

/**
 * Greedy collision-free label placement in screen px. `must` candidates (route stops, origin, destination) are always placed, right of the dot;
 * the rest, already in priority order, are placed only when their box misses every placed label and `blocked` box. Right of the dot first, then left.
 */
export function placeLabels(must: Cand[], rest: Cand[], blocked: Box[], k: number, tx: number, ty: number): Label[] {
  const placed: Box[] = [...blocked]
  const out: Label[] = []
  const box = (c: Cand, end: boolean): Box => {
    const w = c.name.length * CHAR_W + 4
    const sx = c.x * k + tx
    const sy = c.y * k + ty
    return end ? { x0: sx - 6 - w, x1: sx - 6, y0: sy - LABEL_UP, y1: sy + LABEL_DOWN } : { x0: sx + 6, x1: sx + 6 + w, y0: sy - LABEL_UP, y1: sy + LABEL_DOWN }
  }
  for (const c of must) {
    placed.push(box(c, false))
    out.push({ ...c, end: false })
  }
  for (const c of rest) {
    for (const end of [false, true]) {
      const b = box(c, end)
      if (placed.some(p => hits(p, b))) continue
      placed.push(b)
      out.push({ ...c, end })
      break
    }
  }
  return out
}

interface Hover { name: string; sub: string; sx: number; sy: number }

/** Lanes never depend on zoom (non-scaling strokes), so this layer renders once per graph. */
const LaneLayer = memo(function LaneLayer({ nodes, edges }: { nodes: Map<string, { x: number; y: number }>; edges: Graph['edges'] }) {
  const { minor, major } = useMemo(() => {
    const seg = (cls: string) =>
      edges
        .filter(e => e.class === cls)
        .map(e => {
          const a = nodes.get(e.a)
          const b = nodes.get(e.b)
          return a && b ? `M${a.x} ${a.y}L${b.x} ${b.y}` : ''
        })
        .join('')
    return { minor: seg('minor'), major: seg('major') }
  }, [nodes, edges])
  return (
    <g>
      <path d={minor} className={`${styles.lane} ${styles.laneMin}`} />
      <path d={major} className={`${styles.lane} ${styles.laneMaj}`} />
    </g>
  )
})

const DotLayer = memo(function DotLayer({ graph, hazardIds, k, onHover, onPlanet }: {
  graph: Graph; hazardIds: Set<string>; k: number
  onHover: (id: string | null, e?: React.PointerEvent) => void
  onPlanet: (id: string) => void
}) {
  const r = 3 / k
  const hit = 9 / k
  return (
    <g>
      {graph.nodes.map(n => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={hazardIds.has(n.id) ? r * 1.6 : r} className={hazardIds.has(n.id) ? styles.dotHz : n.on_lane ? styles.dotOn : styles.dot} />
          <circle
            cx={n.x} cy={n.y} r={hit} className={styles.hit} data-obj=""
            onPointerEnter={e => onHover(n.id, e)}
            onPointerMove={e => onHover(n.id, e)}
            onPointerLeave={() => onHover(null)}
            onClick={() => onPlanet(n.id)}
          />
        </g>
      ))}
    </g>
  )
})

export function GalaxyMap({ graph, hazards, pins, route, routeStyle, pinMode, current, onPlanet, onPin, onDropPin }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const routeRef = useRef<SVGGElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [view, setView] = useState<View>({ tx: 0, ty: 0, k: 0.2 })
  const [drag, setDrag] = useState(false)
  const [hover, setHover] = useState<Hover | null>(null)
  const fitted = useRef(false)

  const byId = useMemo(() => new Map(graph.nodes.map(n => [n.id, n])), [graph])
  const hazardIds = useMemo(() => new Set(hazards.map(h => h.system)), [hazards])
  const hazardNote = useMemo(() => new Map(hazards.map(h => [h.system, h.note ?? 'hazard'])), [hazards])

  const fitBox = useCallback((pts: { x: number; y: number }[], pad: number) => {
    if (!pts.length || !size.w || !size.h) return
    const xs = pts.map(p => p.x)
    const ys = pts.map(p => p.y)
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
    const bw = Math.max(maxX - minX, 40)
    const bh = Math.max(maxY - minY, 40)
    const k = Math.min(MAX_K, Math.max(MIN_K, Math.min((size.w - pad * 2) / bw, (size.h - pad * 2) / bh)))
    setView({ k, tx: size.w / 2 - ((minX + maxX) / 2) * k, ty: size.h / 2 - ((minY + maxY) / 2) * k })
  }, [size])

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!fitted.current && size.w && graph.nodes.length) {
      fitted.current = true
      fitBox(graph.nodes, 24)
    }
  }, [size, graph, fitBox])

  // Wheel zoom about the cursor. Non-passive listener so preventDefault stops page scroll.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      setView(v => {
        const k = Math.min(MAX_K, Math.max(MIN_K, v.k * Math.exp(-e.deltaY * 0.0015)))
        const f = k / v.k
        return { k, tx: px - (px - v.tx) * f, ty: py - (py - v.ty) * f }
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const zoomBy = (f: number) =>
    setView(v => {
      const k = Math.min(MAX_K, Math.max(MIN_K, v.k * f))
      const g = k / v.k
      return { k, tx: size.w / 2 - (size.w / 2 - v.tx) * g, ty: size.h / 2 - (size.h / 2 - v.ty) * g }
    })

  // Drag to pan; a press that barely moves is a click (pin drop in pin mode).
  const down = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean; onObject: boolean } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    down.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, moved: false, onObject: !!(e.target as Element).closest('[data-obj]') }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = down.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.moved && Math.hypot(dx, dy) < CLICK_SLOP) return
    if (!d.moved) {
      d.moved = true
      setDrag(true)
      wrapRef.current?.setPointerCapture(e.pointerId)
      setHover(null)
    }
    setView(v => ({ ...v, tx: d.tx + dx, ty: d.ty + dy }))
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const d = down.current
    down.current = null
    setDrag(false)
    if (!d || d.moved || d.onObject || !pinMode) return
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    onDropPin(Math.round((e.clientX - rect.left - view.tx) / view.k), Math.round((e.clientY - rect.top - view.ty) / view.k))
  }

  const onHover = useCallback((id: string | null, e?: React.PointerEvent) => {
    if (!id || !e || down.current?.moved) { setHover(null); return }
    const n = byId.get(id)
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!n || !rect) return
    const bits = [n.sector, n.region].filter(Boolean).join(' · ')
    const flags = [!n.on_lane ? 'no lane' : '', hazardNote.has(id) ? 'hazard' : ''].filter(Boolean).join(' · ')
    setHover({ name: n.name, sub: [bits, flags].filter(Boolean).join(' · '), sx: e.clientX - rect.left, sy: e.clientY - rect.top })
  }, [byId, hazardNote])

  // Route segments, split by leg so each takes its own style.
  const segments = useMemo(() => {
    if (!route) return []
    const at = new Map(route.stops.map(s => [s.id, s]))
    return route.legs.flatMap(l => {
      const a = at.get(l.from)
      const b = at.get(l.to)
      if (!a || !b) return []
      const cls = l.kind === 'lane' ? (l.class === 'major' ? styles.rMaj : styles.rMin) : routeStyle === 'hop' ? styles.rHop : styles.rOff
      return [{ d: `M${a.x} ${a.y}L${b.x} ${b.y}`, cls, solid: l.kind === 'lane' }]
    })
  }, [route, routeStyle])

  // Draw-in: lane segments stroke on in order, off-lane / hop segments fade in after theirs.
  useLayoutEffect(() => {
    const g = routeRef.current
    if (!g || !segments.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = Array.from(g.querySelectorAll<SVGPathElement>('path[data-seg]'))
    const tl = gsap.timeline()
    const each = Math.min(0.35, 1.6 / els.length)
    els.forEach((p, i) => {
      if (p.dataset.solid === '1') {
        tl.fromTo(p, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: each, ease: 'none', clearProps: 'strokeDasharray,strokeDashoffset' }, i * each)
      } else {
        tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: each, clearProps: 'opacity' }, i * each)
      }
    })
    return () => { tl.kill(); els.forEach(p => gsap.set(p, { clearProps: 'all' })) }
  }, [segments])

  const fitRoute = () => (route ? fitBox(route.stops, 80) : fitBox(graph.nodes, 24))

  // Auto-frame a freshly plotted route.
  useEffect(() => {
    if (route && route.stops.length) fitBox(route.stops, 80)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-frame only when the route changes, not on every resize
  }, [route])

  // Labels settle 100 ms after zoom/pan stops; nothing is computed during the drag itself.
  const [labels, setLabels] = useState<Label[]>([])
  const [labelMs, setLabelMs] = useState(0)
  const majorIds = useMemo(() => new Set(graph.edges.filter(e => e.class === 'major').flatMap(e => [e.a, e.b])), [graph])
  useEffect(() => {
    if (!size.w || drag) return
    const timer = setTimeout(() => {
      const t0 = performance.now()
      const { k, tx, ty } = view
      const inView = (x: number, y: number) => {
        const sx = x * k + tx
        const sy = y * k + ty
        return sx >= -40 && sx <= size.w + 40 && sy >= -20 && sy <= size.h + 20
      }
      const must: Cand[] = []
      const seen = new Set<string>()
      for (const s of route?.stops ?? []) {
        if (s.dropoff) continue
        must.push({ key: `s-${s.id}`, name: s.name, x: s.x, y: s.y, strong: true })
        seen.add(s.id)
      }
      const blocked: Box[] = []
      for (const s of [route?.stops[0], route?.stops[route.stops.length - 1]]) {
        if (!s) continue
        const sx = s.x * k + tx
        const sy = s.y * k + ty
        blocked.push({ x0: sx - 8, x1: sx + 8, y0: sy - 8, y1: sy + 8 })
      }
      const rank = (n: Graph['nodes'][number]) => (hazardIds.has(n.id) ? 1 : majorIds.has(n.id) ? 2 : n.on_lane ? 3 : 4)
      const rest: Cand[] = [
        ...pins.filter(p => inView(p.x, p.y)).map(p => ({ key: `p-${p.id}`, name: p.name, x: p.x, y: p.y, strong: false })),
        ...graph.nodes
          .filter(n => !seen.has(n.id) && inView(n.x, n.y))
          .sort((a, b) => rank(a) - rank(b))
          .map(n => ({ key: n.id, name: n.name, x: n.x, y: n.y, strong: false })),
      ]
      setLabels(placeLabels(must, rest, blocked, k, tx, ty))
      setLabelMs(performance.now() - t0)
    }, LABEL_SETTLE_MS)
    return () => clearTimeout(timer)
  }, [view, size, drag, route, pins, graph, hazardIds, majorIds])

  const first = route?.stops[0]
  const last = route?.stops[route.stops.length - 1]
  const mr = 7 / view.k

  return (
    <div
      ref={wrapRef}
      className={`${styles.map} ${drag ? styles.mapDrag : ''} ${pinMode ? styles.mapPin : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { down.current = null; setDrag(false) }}
      data-testid="galaxy-map"
      data-label-count={labels.length}
      data-label-ms={labelMs.toFixed(2)}
    >
      <svg role="img" aria-label="Galaxy map">
        <g transform={`translate(${view.tx} ${view.ty}) scale(${view.k})`}>
          <image
            href={BG_CONFIG.src} x={-BG_CONFIG.size / 2} y={-BG_CONFIG.size / 2} width={BG_CONFIG.size} height={BG_CONFIG.size}
            opacity={BG_CONFIG.opacity} className={styles.bg} aria-hidden
            transform={`translate(${BG_CONFIG.cx + BG_CONFIG.dx} ${BG_CONFIG.cy + BG_CONFIG.dy}) rotate(${BG_CONFIG.rotate})`}
          />
          <LaneLayer nodes={byId} edges={graph.edges} />
          <DotLayer graph={graph} hazardIds={hazardIds} k={view.k} onHover={onHover} onPlanet={onPlanet} />
          <g ref={routeRef}>
            {segments.map((s, i) => (
              <path key={i} d={s.d} className={s.cls} data-seg="" data-solid={s.solid ? '1' : '0'} pathLength={1} />
            ))}
          </g>
          {route?.stops.filter(s => s.dropoff).map(s => (
            <rect key={s.id} x={s.x - mr * 0.6} y={s.y - mr * 0.6} width={mr * 1.2} height={mr * 1.2} transform={`rotate(45 ${s.x} ${s.y})`} className={styles.mkDrop} />
          ))}
          {current && <circle cx={current.x} cy={current.y} r={mr * 1.8} className={styles.mkCurrent} />}
          {first && <circle cx={first.x} cy={first.y} r={mr} className={styles.mkOrigin} />}
          {last && <circle cx={last.x} cy={last.y} r={mr} className={styles.mkDest} />}
          {pins.map(p => (
            <g key={p.id} data-obj="" onClick={e => { e.stopPropagation(); onPin(p.id) }}>
              <rect x={p.x - mr * 0.7} y={p.y - mr * 0.7} width={mr * 1.4} height={mr * 1.4} transform={`rotate(45 ${p.x} ${p.y})`} className={styles.mkPin} />
            </g>
          ))}
          {labels.map(l => (
            <text
              key={l.key} x={l.x + (l.end ? -6 : 6) / view.k} y={l.y + 3 / view.k} fontSize={LABEL_PX / view.k}
              textAnchor={l.end ? 'end' : 'start'} className={`${styles.lbl} ${l.strong ? styles.lblStop : ''}`}
            >{l.name}</text>
          ))}
        </g>
      </svg>
      {pinMode && <div className={styles.banner}>Click the map to drop a pin</div>}
      {hover && (
        // cursor position is runtime data, not a design value
        <div className={styles.tip} style={{ left: hover.sx, top: hover.sy }}>
          <b>{hover.name}</b>
          {hover.sub && <span>{hover.sub}</span>}
        </div>
      )}
      <div className={styles.zoom}>
        <button type="button" onClick={() => zoomBy(1.4)} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => zoomBy(1 / 1.4)} aria-label="Zoom out">−</button>
        <button type="button" onClick={fitRoute} aria-label={route ? 'Fit route' : 'Fit galaxy'} title={route ? 'Fit route' : 'Fit galaxy'}>⌖</button>
      </div>
      <div className={styles.credit}>
        <span>Lanes: Wookieepedia (CC BY-SA 3.0)</span>
        <span>
          Background: NGC 6217,{' '}
          <a href="https://esahubble.org/images/heic0910s/" target="_blank" rel="noopener noreferrer">NASA, ESA and the Hubble SM4 ERO Team</a>
          {' '}(CC BY 4.0), rotated and dimmed
        </span>
      </div>
    </div>
  )
}
