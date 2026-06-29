'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useMapPlanets, type MapPlanet } from '@/hooks/useMapPlanets'
import type { ActiveMap, CrawlContent } from '@/hooks/useActiveMap'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, Z, RADIUS, EASE } from '@/lib/tokens'
import gsap from 'gsap'

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

  /* Three.js background canvas */
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Dynamically import three to avoid SSR issues
    let renderer: import('three').WebGLRenderer
    let animId: number
    let cancelled = false

    import('three').then(THREE => {
      if (cancelled) return

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
      renderer.setSize(SVG_W, SVG_H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, SVG_W / SVG_H, 0.1, 100)
      camera.position.set(0, 0, 8)

      /* ── Star field ── */
      const starCount = 440
      const positions = new Float32Array(starCount * 3)
      const sizes     = new Float32Array(starCount)
      for (let i = 0; i < starCount; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 22
        positions[i * 3 + 1] = (Math.random() - 0.5) * 14
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8
        sizes[i] = 1.2 + Math.random() * 1.8
      }
      const starGeo = new THREE.BufferGeometry()
      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      starGeo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))

      const starMat = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: { time: { value: 0 } },
        vertexShader: `
          attribute float size;
          uniform float time;
          varying float va;
          void main() {
            va = 0.4 + 0.6 * sin(time * 0.8 + position.x * 3.0);
            vec4 mvp = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvp.z);
            gl_Position = projectionMatrix * mvp;
          }
        `,
        fragmentShader: `
          varying float va;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.0, d) * va;
            gl_FragColor = vec4(0.784, 0.627, 0.188, a);
          }
        `,
      })
      const stars = new THREE.Points(starGeo, starMat)
      scene.add(stars)

      /* ── Wireframe terrain ── */
      const terrainGeo = new THREE.PlaneGeometry(20, 12, 60, 36)
      const posArr = terrainGeo.attributes.position.array as Float32Array
      for (let i = 0; i < posArr.length; i += 3) {
        posArr[i + 2] = Math.sin(posArr[i] * 0.6) * Math.cos(posArr[i + 1] * 0.8) * 0.18
                      + (Math.random() - 0.5) * 0.04
      }
      terrainGeo.computeVertexNormals()
      const terrain = new THREE.Mesh(terrainGeo, new THREE.MeshBasicMaterial({
        color: 0x1a1208, wireframe: true, transparent: true, opacity: 0.18,
      }))
      terrain.rotation.x = -Math.PI / 3.2
      terrain.position.set(0, -2.5, -1)
      scene.add(terrain)

      /* ── Scan beam ── */
      const beam = new THREE.Mesh(
        new THREE.PlaneGeometry(22, 0.012),
        new THREE.MeshBasicMaterial({ color: 0xc8a030, transparent: true, opacity: 0.18 }),
      )
      scene.add(beam)

      /* ── Animate ── */
      let t = 0
      function animate() {
        animId = requestAnimationFrame(animate)
        t += 0.016
        starMat.uniforms.time.value = t
        stars.rotation.z += 0.0003
        terrain.rotation.z = Math.sin(t * 0.2) * 0.05
        beam.position.y = 4 - (t * 0.35) % 9
        renderer.render(scene, camera)
      }
      animate()
    })

    return () => {
      cancelled = true
      if (animId) cancelAnimationFrame(animId)
      if (renderer) renderer.dispose()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* GSAP element refs */
  const puckInnerRef  = useRef<SVGCircleElement>(null)
  const puckIconRef   = useRef<SVGTextElement>(null)
  const ringsGroupRef = useRef<SVGGElement>(null)
  const arcGroupRefs  = useRef<(SVGGElement | null)[]>([null, null, null])
  const labelTextRef  = useRef<SVGTextElement>(null)
  const hoverTlRefs   = useRef<(gsap.core.Timeline | null)[]>([null, null, null])

  /* Drag state — widget position relative to its parent */
  const [dragPos,     setDragPos]     = useState<{ x: number; y: number } | null>(null)
  const dragOffsetRef = useRef<{ ox: number; oy: number } | null>(null)
  const widgetRef     = useRef<HTMLDivElement>(null)

  /* Arc menu state */
  const [isOpen,    setIsOpen]    = useState(false)
  const [activeArc, setActiveArc] = useState<ArcId | null>(null)
  const [openPanel, setOpenPanel] = useState<ArcId | null>(null)

  function handleArcEnter(id: ArcId) {
    setActiveArc(id)
    const i = id
    hoverTlRefs.current[i]?.kill()
    const el = arcGroupRefs.current[i]
    if (!el) return
    const tl = gsap.timeline()
    hoverTlRefs.current[i] = tl
    tl.to(el.querySelector('path:first-child'), { fillOpacity: 0.18, duration: 0.16 }, 0)
    tl.to(el, { scale: 1.04, transformOrigin: `${PUCK_CX}px ${PUCK_CY}px`, duration: 0.2, ease: 'back.out(2)' }, 0)
    if (labelTextRef.current) tl.to(labelTextRef.current, { fillOpacity: 0.88, duration: 0.18 }, 0)
  }

  function handleArcLeave(id: ArcId) {
    setActiveArc(null)
    const i = id
    hoverTlRefs.current[i]?.kill()
    const el = arcGroupRefs.current[i]
    if (!el) return
    const tl = gsap.timeline()
    hoverTlRefs.current[i] = tl
    tl.to(el.querySelector('path:first-child'), { fillOpacity: 0.06, duration: 0.22 }, 0)
    tl.to(el, { scale: 1, duration: 0.22 }, 0)
    if (labelTextRef.current) tl.to(labelTextRef.current, { fillOpacity: 0, duration: 0.14 }, 0)
  }

  function handleArcPick(id: ArcId) {
    const el = arcGroupRefs.current[id]
    if (!el) { setOpenPanel(prev => prev === id ? null : id); setIsOpen(false); return }

    // Punch: scale up → down → back, then open panel + close fan
    gsap.timeline()
      .to(el, { scale: 1.09, transformOrigin: `${PUCK_CX}px ${PUCK_CY}px`, duration: 0.1, ease: 'power2.out' })
      .to(el, { scale: 0.88, duration: 0.1, ease: 'power2.in' })
      .to(el, { scale: 1.0,  duration: 0.08, onComplete: () => {
        setOpenPanel(prev => prev === id ? null : id)
        setIsOpen(false)
      }})
  }

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

  /* Initialize arc/ring elements as hidden on mount */
  useEffect(() => {
    arcGroupRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0 }) })
    if (ringsGroupRef.current) gsap.set(ringsGroupRef.current, { opacity: 0 })
  }, [])

  /* Open/close animation */
  useEffect(() => {
    if (isOpen) {
      // ── Open sequence ──
      const tl = gsap.timeline()

      // t=0: puck border + icon
      tl.to(puckInnerRef.current, {
        attr: { stroke: 'rgba(200,160,48,0.95)', strokeWidth: 2 }, duration: 0.2, ease: 'power2.out',
      }, 0)
      tl.to(puckIconRef.current, {
        rotation: 45, transformOrigin: `${PUCK_CX}px ${PUCK_CY}px`,
        fill: 'rgba(200,160,48,1.0)', duration: 0.35, ease: 'back.out(2)',
      }, 0)

      // t=0.04: rings scale in
      if (ringsGroupRef.current) {
        gsap.set(ringsGroupRef.current, { opacity: 0, scale: 0.7, transformOrigin: `${PUCK_CX}px ${PUCK_CY}px` })
        tl.to(ringsGroupRef.current, {
          opacity: 1, scale: 1, duration: 0.38, ease: 'expo.out',
        }, 0.04)
      }

      // t=0.08, 0.16, 0.24: arcs stagger in
      arcGroupRefs.current.forEach((el, i) => {
        if (!el) return
        gsap.set(el, { opacity: 0, scale: 0.55, transformOrigin: `${PUCK_CX}px ${PUCK_CY}px` })
        tl.to(el, {
          opacity: 1, scale: 1, duration: 0.42, ease: 'back.out(1.7)',
        }, 0.08 + i * 0.08)
      })
    } else {
      // ── Close sequence ──
      const tl = gsap.timeline()

      // Arcs out: reversed order
      arcGroupRefs.current.slice().reverse().forEach((el, i) => {
        if (!el) return
        tl.to(el, {
          opacity: 0, scale: 0.6,
          transformOrigin: `${PUCK_CX}px ${PUCK_CY}px`,
          duration: 0.22, ease: 'power2.in',
        }, i * 0.055)
      })

      // Rings out
      if (ringsGroupRef.current) {
        tl.to(ringsGroupRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.06)
      }

      // Puck reset
      tl.to(puckIconRef.current, {
        rotation: 0, transformOrigin: `${PUCK_CX}px ${PUCK_CY}px`,
        fill: 'rgba(200,160,48,0.75)', duration: 0.3, ease: 'back.out(1.6)',
      }, 0)
      tl.to(puckInnerRef.current, {
        attr: { stroke: 'rgba(200,160,48,0.45)', strokeWidth: 1.5 }, duration: 0.2,
      }, 0)
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Position style — default bottom-right; dragged = left/top */
  const posStyle: React.CSSProperties = dragPos
    ? { position: 'absolute', left: dragPos.x, top: dragPos.y, bottom: 'auto', right: 'auto' }
    : { position: 'absolute', bottom: '1rem', right: '1rem' } // 1rem widget offset

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
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          zIndex: Z.base, pointerEvents: 'none', borderRadius: RADIUS.lg,
        }}
      />

      {/* ── SVG: arcs + puck (z=1) ── */}
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ position: 'absolute', inset: 0, zIndex: Z.raised, overflow: 'visible' }}
      >
        {/* ── Always-visible faint construction arc ── */}
        <path
          d={arcPath(PUCK_CX, PUCK_CY, R_OUT + 14, R_OUT + 14, 178, 276)}
          fill="none"
          stroke={GOLD}        /* approved SVG exception */
          strokeOpacity={0.04}
          strokeWidth={0.5}
          style={{ pointerEvents: 'none' }}
        />

        {/* ── Rings group (GSAP-controlled visibility) ── */}
        <g id="rings" ref={ringsGroupRef} style={{ pointerEvents: 'none' }}>
            {/* Outer arc border */}
            <path d={arcPath(PUCK_CX, PUCK_CY, R_OUT + 2, R_OUT + 2, 175, 275)}
              fill="none" stroke={GOLD} strokeOpacity={0.16} strokeWidth={1.5} />
            {/* Fade arc */}
            <path d={arcPath(PUCK_CX, PUCK_CY, R_OUT - 6, R_OUT - 6, 175, 275)}
              fill="none" stroke={GOLD} strokeOpacity={0.05} strokeWidth={0.5} />
            {/* Inner arc */}
            <path d={arcPath(PUCK_CX, PUCK_CY, R_IN - 4, R_IN - 4, 175, 275)}
              fill="none" stroke={GOLD} strokeOpacity={0.22} strokeWidth={1} />
            {/* Fade inner arc */}
            <path d={arcPath(PUCK_CX, PUCK_CY, R_IN - 11, R_IN - 11, 175, 275)}
              fill="none" stroke={GOLD} strokeOpacity={0.10} strokeWidth={0.5} />

            {/* End ticks at 178° and 272° */}
            {[178, 272].map(deg => {
              const p1 = polar(PUCK_CX, PUCK_CY, R_OUT + 1, deg)
              const p2 = polar(PUCK_CX, PUCK_CY, R_OUT + 9, deg)
              return <line key={deg} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                       stroke={GOLD} strokeOpacity={0.45} strokeWidth={1.2} />
            })}

            {/* Gap divider ticks at 211° and 247° */}
            {[211, 247].map(deg => {
              const p1 = polar(PUCK_CX, PUCK_CY, R_OUT + 2, deg)
              const p2 = polar(PUCK_CX, PUCK_CY, R_IN - 4, deg)
              return <line key={deg} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                       stroke={GOLD} strokeOpacity={0.28} strokeWidth={0.8} />
            })}

            {/* Crosshair lines (±14px and ±22px from puck center) */}
            {[-22, -14, 14, 22].map(d => (
              <line key={`h${d}`}
                x1={PUCK_CX + d} y1={PUCK_CY - 1} x2={PUCK_CX + d} y2={PUCK_CY + 1}
                stroke={GOLD} strokeOpacity={0.30} strokeWidth={0.75} />
            ))}
            {[-22, -14, 14, 22].map(d => (
              <line key={`v${d}`}
                x1={PUCK_CX - 1} y1={PUCK_CY + d} x2={PUCK_CX + 1} y2={PUCK_CY + d}
                stroke={GOLD} strokeOpacity={0.30} strokeWidth={0.75} />
            ))}

            {/* Small centre circle */}
            <circle cx={PUCK_CX} cy={PUCK_CY} r={4}
              fill="none" stroke={GOLD} strokeOpacity={0.40} strokeWidth={0.75} />
        </g>

        {/* ── Arc blades (GSAP-controlled visibility) ── */}
        {ARC_DEFS.map(arc => {
          const midDeg = (arc.startDeg + arc.endDeg) / 2
          const iconPos = polar(PUCK_CX, PUCK_CY, R_ICON, midDeg)
          const isActive = activeArc === arc.id

          return (
            <g key={arc.id} id={`arc-${arc.id}`} ref={el => { arcGroupRefs.current[arc.id] = el }} style={{ pointerEvents: 'none' }}>
              {/* Blade fill */}
              <path
                d={arcPath(PUCK_CX, PUCK_CY, R_IN, R_OUT, arc.startDeg, arc.endDeg)}
                fill={GOLD}
                fillOpacity={isActive ? 0.18 : 0.06}
                stroke="none"
              />
              {/* Outer arc border */}
              <path
                d={arcPath(PUCK_CX, PUCK_CY, R_OUT, R_OUT, arc.startDeg, arc.endDeg)}
                fill="none"
                stroke={GOLD}
                strokeOpacity={isActive ? 0.7 : 0.28}
                strokeWidth={1}
              />
              {/* Inner arc border (brightens on hover) */}
              <path
                id={`inner-border-${arc.id}`}
                d={arcPath(PUCK_CX, PUCK_CY, R_IN, R_IN, arc.startDeg, arc.endDeg)}
                fill="none"
                stroke={GOLD}
                strokeOpacity={isActive ? 0.95 : 0.22}
                strokeWidth={1}
              />
              {/* Icon */}
              <text
                x={iconPos.x} y={iconPos.y}
                textAnchor="middle" dominantBaseline="central"
                fill={GOLD}
                fillOpacity={isActive ? 1.0 : 0.6}
                fontSize={10}
                fontFamily={FONT_BODY}
              >
                {arc.icon}
              </text>
            </g>
          )
        })}

        {/* ── Defs: hover label arc path ── */}
        <defs>
          <path
            id="label-arc-path"
            d={arcPath(PUCK_CX, PUCK_CY, 52, 52, 182, 272)}
            fill="none"
          />
        </defs>

        {/* ── Hover label (GSAP-controlled opacity) ── */}
        <text
          ref={labelTextRef}
          fill={GOLD}
          fillOpacity={0}
          fontSize={8}
          fontFamily={FONT_DISPLAY}
          fontWeight={700}
          letterSpacing="0.13em"
          style={{ pointerEvents: 'none' }}
        >
          <textPath href="#label-arc-path" startOffset="50%" textAnchor="middle">
            {activeArc !== null ? ARC_DEFS[activeArc].label : ''}
          </textPath>
        </text>

        {/* ── Arc hit areas ── */}
        {isOpen && ARC_DEFS.map(arc => (
          <path
            key={`hit-${arc.id}`}
            d={arcPath(PUCK_CX, PUCK_CY, R_IN - 4, R_OUT + 6, arc.startDeg - 1, arc.endDeg + 1)}
            fill="transparent"
            stroke="none"
            style={{ pointerEvents: 'all', cursor: 'pointer' }}
            onMouseEnter={() => handleArcEnter(arc.id)}
            onMouseLeave={() => handleArcLeave(arc.id)}
            onClick={() => handleArcPick(arc.id)}
          />
        ))}

        {/* Puck */}
        <circle
          ref={puckInnerRef}
          cx={PUCK_CX} cy={PUCK_CY} r={R_PUCK}
          fill={HUD.bg}
          stroke={GOLD}
          strokeWidth={1.5}
          style={{ pointerEvents: 'none' }}
        />
        {/* Puck icon — ✦ hamburger */}
        <text
          ref={puckIconRef}
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
          zIndex:       Z.raised + 1,
          cursor:       'grab',
          pointerEvents:'auto',
        }}
      />
    </div>
  )
}
