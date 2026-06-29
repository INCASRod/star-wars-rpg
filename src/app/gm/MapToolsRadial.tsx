'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useMapPlanets, type MapPlanet } from '@/hooks/useMapPlanets'
import type { ActiveMap, CrawlContent } from '@/hooks/useActiveMap'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, Z, RADIUS, EASE } from '@/lib/tokens'
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

  // ── Supabase client ──────────────────────────────────────────────
  const supabase = useMemo(() => createClient(), [])

  // ── Opening Crawl state ──────────────────────────────────────────
  const [crawlMapId,      setCrawlMapId]      = useState<string | null>(null)
  const [crawlHeading,    setCrawlHeading]    = useState('')
  const [crawlSubheading, setCrawlSubheading] = useState('')
  const [crawlBody,       setCrawlBody]       = useState('')
  const [crawlBusy,       setCrawlBusy]       = useState(false)
  const [previousMapId,   setPreviousMapId]   = useState<string | null>(null)

  const activeMapId   = activeMap?.id ?? null
  const isCrawlActive = crawlMapId !== null && activeMapId === crawlMapId

  async function fetchOrCreateCrawlRow(): Promise<string | null> {
    if (crawlMapId) return crawlMapId
    if (!campaignId) return null
    const { data: rows } = await supabase
      .from('maps').select('id, crawl_content')
      .eq('campaign_id', campaignId).eq('map_type', 'crawl').limit(1)
    if (rows && rows.length > 0) {
      const row = rows[0]
      const content = row.crawl_content as CrawlContent | null
      if (content) {
        setCrawlHeading(content.heading ?? '')
        setCrawlSubheading(content.subheading ?? '')
        setCrawlBody(content.body ?? '')
      }
      setCrawlMapId(row.id as string)
      return row.id as string
    }
    const { data: inserted } = await supabase.from('maps').insert({
      campaign_id: campaignId, name: 'Opening Crawl', image_url: '',
      grid_enabled: false, grid_size: 50, is_active: false, is_visible_to_players: false,
      map_type: 'crawl', crawl_content: { heading: '', subheading: '', body: '' },
    }).select('id').single()
    if (inserted) { setCrawlMapId(inserted.id as string); return inserted.id as string }
    return null
  }

  // Fetch crawl row when Opening Crawl panel is opened
  useEffect(() => {
    if (openPanel === 1 && !crawlMapId) { void fetchOrCreateCrawlRow() }
  }, [openPanel]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSaveCrawl() {
    if (crawlBusy) return; setCrawlBusy(true)
    const id = await fetchOrCreateCrawlRow()
    if (id) await supabase.from('maps').update({
      crawl_content: { heading: crawlHeading, subheading: crawlSubheading, body: crawlBody },
    }).eq('id', id)
    setCrawlBusy(false)
  }

  async function handlePlayCrawl() {
    if (crawlBusy) return; setCrawlBusy(true)
    const id = await fetchOrCreateCrawlRow()
    if (id) {
      await supabase.from('maps').update({
        crawl_content: { heading: crawlHeading, subheading: crawlSubheading, body: crawlBody },
      }).eq('id', id)
      setPreviousMapId(activeMapId)
      await supabase.from('maps').update({ is_active: false }).eq('campaign_id', campaignId)
      await supabase.from('maps').update({ is_active: true, is_visible_to_players: true }).eq('id', id)
    }
    setCrawlBusy(false)
  }

  async function handleStopCrawl() {
    if (crawlBusy) return
    const id = crawlMapId ?? await fetchOrCreateCrawlRow()
    if (!id) return; setCrawlBusy(true)
    await supabase.from('maps').update({ is_visible_to_players: false }).eq('id', id)
    await supabase.from('maps').update({ is_active: false }).eq('campaign_id', campaignId)
    if (previousMapId) await supabase.from('maps').update({ is_active: true }).eq('id', previousMapId)
    setPreviousMapId(null); setCrawlBusy(false)
  }

  // ── Map Library state ─────────────────────────────────────────────
  const { planets } = useMapPlanets(campaignId)
  const [expandedId,          setExpandedId]          = useState<string | 'all' | 'unassigned' | null>(null)
  const [planetSearch,        setPlanetSearch]        = useState('')
  const [newPlanetOpen,       setNewPlanetOpen]       = useState(false)
  const [newPlanetName,       setNewPlanetName]       = useState('')
  const [planetBusy,          setPlanetBusy]          = useState(false)
  const [deletePlanetConfirm, setDeletePlanetConfirm] = useState<string | null>(null)
  const [uploadOpen,          setUploadOpen]          = useState(false)
  const [mapBusy,             setMapBusy]             = useState(false)
  const [deleteConfirm,       setDeleteConfirm]       = useState<string | null>(null)

  const filteredPlanets = useMemo(() =>
    planetSearch.trim()
      ? planets.filter(p => p.name.toLowerCase().includes(planetSearch.toLowerCase()))
      : planets,
    [planets, planetSearch],
  )

  const { mapsByPlanetId, unassignedMaps } = useMemo(() => {
    const byId: Record<string, ActiveMap[]> = {}
    const unassigned: ActiveMap[] = []
    for (const m of allMaps) {
      if (m.planet_id) { byId[m.planet_id] = [...(byId[m.planet_id] ?? []), m] }
      else { unassigned.push(m) }
    }
    return { mapsByPlanetId: byId, unassignedMaps: unassigned }
  }, [allMaps])

  async function handleSetActiveMap(mapId: string) {
    if (mapBusy) return; setMapBusy(true)
    await supabase.from('maps').update({ is_active: false }).eq('campaign_id', campaignId)
    await supabase.from('maps').update({ is_active: true }).eq('id', mapId)
    setMapBusy(false)
  }

  async function handleToggleVisible(m: ActiveMap) {
    await supabase.from('maps').update({ is_visible_to_players: !m.is_visible_to_players }).eq('id', m.id)
  }

  async function handleDeleteMap(mapId: string) {
    const { error } = await supabase.from('maps').delete().eq('id', mapId)
    if (!error) { onDeleteMap(mapId); setDeleteConfirm(null) }
  }

  async function handleCreatePlanet() {
    if (!newPlanetName.trim() || planetBusy) return; setPlanetBusy(true)
    await supabase.from('map_planets').insert({ campaign_id: campaignId, name: newPlanetName.trim() })
    setNewPlanetName(''); setNewPlanetOpen(false); setPlanetBusy(false)
  }

  async function handleDeletePlanet(planetId: string) {
    await supabase.from('map_planets').delete().eq('id', planetId)
    setDeletePlanetConfirm(null)
    if (expandedId === planetId) setExpandedId(null)
  }

  async function handleAssignPlanet(mapId: string, planetId: string | null) {
    await supabase.from('maps').update({ planet_id: planetId }).eq('id', mapId)
  }

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

      {/* ── Popup panels (portals to escape overflow:hidden) ── */}
      {mounted && openPanel !== null && createPortal(
        <FloatingPanel
          title={ARC_DEFS[openPanel].label}
          onClose={() => setOpenPanel(null)}
          arcId={openPanel}
        >
          {openPanel === 0 && (
            <MapLibraryContent
              campaignId={campaignId}
              allMaps={allMaps}
              planets={planets}
              filteredPlanets={filteredPlanets}
              mapsByPlanetId={mapsByPlanetId}
              unassignedMaps={unassignedMaps}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              planetSearch={planetSearch}
              setPlanetSearch={setPlanetSearch}
              newPlanetOpen={newPlanetOpen}
              setNewPlanetOpen={setNewPlanetOpen}
              newPlanetName={newPlanetName}
              setNewPlanetName={setNewPlanetName}
              planetBusy={planetBusy}
              deletePlanetConfirm={deletePlanetConfirm}
              setDeletePlanetConfirm={setDeletePlanetConfirm}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              mapBusy={mapBusy}
              uploadOpen={uploadOpen}
              setUploadOpen={setUploadOpen}
              onSetActiveMap={handleSetActiveMap}
              onToggleVisible={handleToggleVisible}
              onDeleteMap={handleDeleteMap}
              onCreatePlanet={handleCreatePlanet}
              onDeletePlanet={handleDeletePlanet}
              onAssignPlanet={handleAssignPlanet}
            />
          )}
          {openPanel === 1 && (
            <OpeningCrawlContent
              crawlHeading={crawlHeading}
              crawlSubheading={crawlSubheading}
              crawlBody={crawlBody}
              setCrawlHeading={setCrawlHeading}
              setCrawlSubheading={setCrawlSubheading}
              setCrawlBody={setCrawlBody}
              crawlBusy={crawlBusy}
              crawlMapId={crawlMapId}
              isCrawlActive={isCrawlActive}
              onSave={() => void handleSaveCrawl()}
              onPlay={() => void handlePlayCrawl()}
              onStop={() => void handleStopCrawl()}
            />
          )}
          {openPanel === 2 && (
            <TokenScaleContent
              tokenScale={tokenScale}
              adjustTokenScale={adjustTokenScale}
              hasActiveMap={!!activeMap}
            />
          )}
        </FloatingPanel>,
        document.body,
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   POPUP PANEL COMPONENTS
   ══════════════════════════════════════════════════════════════════ */

/* ── Shared constants for popup panels ──────────────────────────── */
const PANEL_STYLE: React.CSSProperties = {
  position:             'fixed',
  top:                  '50%',
  left:                 '20%',
  transform:            'translate(-50%, -50%)',
  width:                340,
  maxHeight:            '70vh',
  overflowY:            'auto',
  zIndex:               Z.modal,
  background:           HUD.bg,
  border:               `1px solid ${HUD.borderHi}`,
  borderRadius:         RADIUS.xl,
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow:            '0 8px 40px rgba(0,0,0,0.7)',
}

const POPUP_INPUT: React.CSSProperties = {
  background:   'var(--hud-surface-lo)',
  border:       `1px solid ${HUD.borderHi}`,
  borderRadius: RADIUS.md,
  color:        HUD.text,
  fontFamily:   FONT_BODY,
  fontSize:     FS.label,
  padding:      `${SP[1]} ${SP[2]}`,
  width:        '100%',
  boxSizing:    'border-box',
  outline:      'none',
}

const RED   = 'var(--state-failure)'
const GREEN = 'var(--state-success)'
const BLUE  = 'var(--state-wounds)'
const DIM   = HUD.textFaint
const TEXT  = HUD.text

/* ── FloatingPanel wrapper ──────────────────────────────────────── */
function FloatingPanel({
  title, onClose, arcId, children,
}: {
  title: string; onClose: () => void; arcId: ArcId; children: React.ReactNode
}) {
  return (
    <div style={PANEL_STYLE}>
      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        `${SP[2]} ${SP[3]} ${SP[1]}`,
        borderBottom:   `1px solid ${HUD.border}`,
        position:       'sticky',
        top:            0,
        background:     HUD.bg,
        zIndex:         Z.raised,
      }}>
        <span style={{
          fontFamily:    FONT_BODY,
          fontSize:      FS.label,
          fontWeight:    700,
          color:         HUD.gold,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          {ARC_DEFS[arcId].icon} {title}
        </span>
        <button
          onClick={onClose}
          style={{
            background:     'transparent',
            border:         `1px solid ${HUD.border}`,
            borderRadius:   RADIUS.md,
            width:          26,
            height:         26,
            cursor:         'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            color:          HUD.textFaint,
            fontSize:       FS.h4,
            lineHeight:     1,
          }}
        >&times;</button>
      </div>
      {/* Body */}
      <div style={{ padding: SP[2] }}>
        {children}
      </div>
    </div>
  )
}

/* ── Opening Crawl sub-component ────────────────────────────────── */
function OpeningCrawlContent({
  crawlHeading, crawlSubheading, crawlBody,
  setCrawlHeading, setCrawlSubheading, setCrawlBody,
  crawlBusy, crawlMapId, isCrawlActive,
  onSave, onPlay, onStop,
}: {
  crawlHeading:       string
  crawlSubheading:    string
  crawlBody:          string
  setCrawlHeading:    (v: string) => void
  setCrawlSubheading: (v: string) => void
  setCrawlBody:       (v: string) => void
  crawlBusy:    boolean
  crawlMapId:   string | null
  isCrawlActive: boolean
  onSave: () => void
  onPlay: () => void
  onStop: () => void
}) {
  const isEmpty = !crawlHeading.trim() && !crawlSubheading.trim() && !crawlBody.trim()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
      <input
        value={crawlHeading}
        onChange={e => setCrawlHeading(e.target.value)}
        placeholder="Heading (e.g. Episode IV)"
        style={POPUP_INPUT}
      />
      <input
        value={crawlSubheading}
        onChange={e => setCrawlSubheading(e.target.value)}
        placeholder="Sub-heading (e.g. A NEW HOPE)"
        style={POPUP_INPUT}
      />
      <textarea
        value={crawlBody}
        onChange={e => setCrawlBody(e.target.value)}
        placeholder="Crawl body text..."
        rows={5}
        style={{ ...POPUP_INPUT, resize: 'vertical' }}
      />
      <div style={{ display: 'flex', gap: SP[1], marginTop: 2 }}>
        <button
          onClick={onSave}
          disabled={crawlBusy || !crawlMapId}
          style={{
            flex:          1,
            padding:       `${SP[1]} 0`,
            borderRadius:  RADIUS.md,
            background:    'var(--hud-surface-lo)',
            border:        `1px solid ${HUD.borderHi}`,
            color:         TEXT,
            fontFamily:    FONT_BODY,
            fontSize:      FS.caption,
            fontWeight:    700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor:        'pointer',
            opacity:       (crawlBusy || !crawlMapId) ? 0.45 : 1,
          }}
        >Save</button>
        {isCrawlActive ? (
          <button
            onClick={onStop}
            disabled={crawlBusy}
            style={{
              flex:          1,
              padding:       `${SP[1]} 0`,
              borderRadius:  RADIUS.md,
              background:    `color-mix(in srgb, ${RED} 12%, transparent)`,
              border:        `1px solid color-mix(in srgb, ${RED} 40%, transparent)`,
              color:         RED,
              fontFamily:    FONT_BODY,
              fontSize:      FS.caption,
              fontWeight:    700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor:        'pointer',
              opacity:       crawlBusy ? 0.45 : 1,
            }}
          >Stop Crawl</button>
        ) : (
          <button
            onClick={onPlay}
            disabled={crawlBusy || !crawlMapId || isEmpty}
            style={{
              flex:          1,
              padding:       `${SP[1]} 0`,
              borderRadius:  RADIUS.md,
              background:    `color-mix(in srgb, ${GREEN} 12%, transparent)`,
              border:        `1px solid color-mix(in srgb, ${GREEN} 40%, transparent)`,
              color:         GREEN,
              fontFamily:    FONT_BODY,
              fontSize:      FS.caption,
              fontWeight:    700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor:        'pointer',
              opacity:       (crawlBusy || !crawlMapId || isEmpty) ? 0.45 : 1,
            }}
          >Play Opening</button>
        )}
      </div>
    </div>
  )
}

/* ── Token Scale sub-component ──────────────────────────────────── */
function TokenScaleContent({
  tokenScale, adjustTokenScale, hasActiveMap,
}: {
  tokenScale:       number
  adjustTokenScale: (delta: number) => void
  hasActiveMap:     boolean
}) {
  const stepBtnStyle: React.CSSProperties = {
    width:          32,
    height:         32,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    background:     'var(--hud-surface-mid)',
    border:         `1px solid ${HUD.borderHi}`,
    borderRadius:   RADIUS.md,
    cursor:         hasActiveMap ? 'pointer' : 'not-allowed',
    color:          hasActiveMap ? HUD.gold : HUD.textFaint,
    fontFamily:     FONT_BODY,
    fontSize:       FS.h4,
    lineHeight:     1,
  }
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      gap:            SP[3],
      justifyContent: 'center',
      padding:        `${SP[1]} 0`,
    }}>
      <button
        disabled={!hasActiveMap || tokenScale <= 0.25}
        onClick={() => adjustTokenScale(-0.25)}
        style={stepBtnStyle}
      >&minus;</button>
      <span style={{
        fontFamily:    FONT_BODY,
        fontSize:      FS.sm,
        fontWeight:    700,
        color:         hasActiveMap ? HUD.gold : HUD.textFaint,
        minWidth:      '3.5rem',
        textAlign:     'center',
        letterSpacing: '0.04em',
      }}>
        {tokenScale.toFixed(2)}&times;
      </span>
      <button
        disabled={!hasActiveMap || tokenScale >= 4.0}
        onClick={() => adjustTokenScale(0.25)}
        style={stepBtnStyle}
      >+</button>
    </div>
  )
}

/* ── Map Library sub-components ─────────────────────────────────── */

interface PanelFolderRowProps {
  label:    string
  count:    number
  expanded: boolean
  onToggle: () => void
  onDelete?: () => void
}

function PanelFolderRow({ label, count, expanded, onToggle, onDelete }: PanelFolderRowProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggle}
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         SP[2],
        padding:     `${SP[1]} ${SP[2]}`,
        borderBottom:`1px solid ${HUD.border}`,
        background:  (expanded || hovered) ? 'var(--hud-surface-lo)' : 'transparent',
        cursor:      'pointer',
        transition:  `background ${EASE.default}`,
        userSelect:  'none',
      }}
    >
      <span style={{ color: expanded ? HUD.gold : HUD.textFaint, fontSize: 9, flexShrink: 0, lineHeight: 1 }}>
        {expanded ? '▾' : '▶'}
      </span>
      <span style={{
        fontFamily:    FONT_BODY,
        fontSize:      FS.caption,
        fontWeight:    700,
        color:         expanded ? HUD.gold : HUD.text,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        flex:          1,
        minWidth:      0,
        overflow:      'hidden',
        textOverflow:  'ellipsis',
        whiteSpace:    'nowrap',
      }}>
        {label}
      </span>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, flexShrink: 0 }}>
        {count}
      </span>
      {onDelete && (hovered || expanded) && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          title={`Delete ${label}`}
          style={{
            background:  'transparent',
            border:      'none',
            cursor:      'pointer',
            color:       `color-mix(in srgb, ${RED} 55%, transparent)`,
            fontSize:    FS.body,
            lineHeight:  1,
            padding:     '0 2px',
            flexShrink:  0,
            marginLeft:  2,
          }}
        >&times;</button>
      )}
    </div>
  )
}

function PanelFolderEmpty({ label }: { label: string }) {
  return (
    <div style={{
      padding:      `${SP[2]} ${SP[3]}`,
      fontFamily:   FONT_BODY,
      fontSize:     FS.caption,
      color:        HUD.textFaint,
      borderBottom: `1px solid ${HUD.border}`,
    }}>
      {label}
    </div>
  )
}

interface PanelMapRowProps {
  map:              ActiveMap
  planets:          MapPlanet[]
  mapBusy:          boolean
  deleteConfirm:    string | null
  setDeleteConfirm: (v: string | null) => void
  onSetActive:      (mapId: string) => void
  onToggleVisible:  (m: ActiveMap) => void
  onDeleteMap:      (mapId: string) => void
  onAssignPlanet:   (mapId: string, planetId: string | null) => void
}

function PanelMapRow({
  map, planets, mapBusy, deleteConfirm, setDeleteConfirm,
  onSetActive, onToggleVisible, onDeleteMap, onAssignPlanet,
}: PanelMapRowProps) {
  return (
    <div style={{
      padding:     `${SP[1]} ${SP[2]} ${SP[1]} ${SP[3]}`,
      borderBottom:`1px solid ${HUD.border}`,
      background:  map.is_active ? 'var(--hud-surface-lo)' : 'transparent',
    }}>
      {/* Thumbnail + name + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={map.image_url}
          alt={map.name}
          style={{
            width:        46,
            height:       32,
            objectFit:    'cover',
            borderRadius: RADIUS.sm,
            flexShrink:   0,
            border:       `1px solid ${map.is_active ? HUD.borderHi : HUD.border}`,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily:   FONT_BODY,
            fontSize:     FS.label,
            fontWeight:   700,
            color:        map.is_active ? HUD.gold : TEXT,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {map.name}
            {map.is_active && (
              <span style={{ marginLeft: 6, fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.gold }}>
                &starf; ACTIVE
              </span>
            )}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, marginTop: 1 }}>
            {map.grid_enabled ? `Grid ${map.grid_size}px` : 'No grid'}
            {map.is_visible_to_players && (
              <span style={{ marginLeft: 6, color: GREEN }}>&bull; Visible</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: SP[1], flexShrink: 0 }}>
          {!map.is_active && (
            <button
              onClick={() => onSetActive(map.id)}
              disabled={mapBusy}
              style={{
                background:   'var(--hud-surface-lo)',
                border:       `1px solid ${HUD.border}`,
                color:        mapBusy ? HUD.textFaint : HUD.gold,
                fontFamily:   FONT_BODY,
                fontSize:     FS.caption,
                padding:      `2px ${SP[1]}`, /* 2px minimum touch target */
                borderRadius: RADIUS.sm,
                cursor:       mapBusy ? 'not-allowed' : 'pointer',
              }}
            >Set Active</button>
          )}
          <button
            onClick={() => setDeleteConfirm(map.id)}
            title="Delete map"
            style={{
              background:   `color-mix(in srgb, ${RED} 7%, transparent)`,
              border:       `1px solid color-mix(in srgb, ${RED} 22%, transparent)`,
              color:        RED,
              fontFamily:   FONT_BODY,
              fontSize:     FS.label,
              padding:      `2px ${SP[1]}`, /* 2px minimum touch target */
              borderRadius: RADIUS.sm,
              cursor:       'pointer',
              lineHeight:   1,
            }}
          >&times;</button>
        </div>
      </div>

      {/* Planet assignment */}
      <div style={{ marginTop: SP[1], display: 'flex', alignItems: 'center', gap: SP[1] }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: DIM, flexShrink: 0 }}>Planet:</span>
        <select
          value={map.planet_id ?? ''}
          onChange={e => onAssignPlanet(map.id, e.target.value || null)}
          style={{
            background:   'var(--hud-surface-hi)',
            border:       `1px solid ${HUD.border}`,
            borderRadius: RADIUS.sm,
            color:        map.planet_id ? TEXT : DIM,
            fontFamily:   FONT_BODY,
            fontSize:     FS.caption,
            padding:      '2px 4px', /* 2px minimum touch target */
            flex:         1,
            minWidth:     0,
            cursor:       'pointer',
            outline:      'none',
          }}
        >
          <option value="">&#8212; none &#8212;</option>
          {planets.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Visibility toggle (active map only) */}
      {map.is_active && (
        <button
          onClick={() => onToggleVisible(map)}
          style={{
            marginTop:     SP[1],
            width:         '100%',
            padding:       `${SP[1]} 0`,
            borderRadius:  RADIUS.sm,
            border:        'none',
            background:    map.is_visible_to_players
              ? `color-mix(in srgb, ${GREEN} 12%, transparent)`
              : 'var(--hud-surface-lo)',
            color:         map.is_visible_to_players ? GREEN : DIM,
            fontFamily:    FONT_BODY,
            fontSize:      FS.caption,
            fontWeight:    700,
            letterSpacing: '0.06em',
            cursor:        'pointer',
            transition:    EASE.default,
          }}
        >
          {map.is_visible_to_players ? '◉ Visible to players' : '◯ Hidden from players'}
        </button>
      )}

      {/* Delete confirm */}
      {deleteConfirm === map.id && (
        <div style={{
          marginTop:     SP[2],
          padding:       `${SP[1]} ${SP[2]}`,
          borderRadius:  RADIUS.md,
          background:    `color-mix(in srgb, ${RED} 8%, transparent)`,
          border:        `1px solid color-mix(in srgb, ${RED} 30%, transparent)`,
          display:       'flex',
          flexDirection: 'column',
          gap:           SP[1],
        }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: RED }}>
            Delete &quot;{map.name}&quot;? This cannot be undone.
          </div>
          <div style={{ display: 'flex', gap: SP[1] }}>
            <button
              onClick={() => setDeleteConfirm(null)}
              style={{
                flex:         1,
                padding:      `${SP[1]} 0`,
                borderRadius: RADIUS.sm,
                background:   'transparent',
                border:       `1px solid ${HUD.border}`,
                color:        DIM,
                fontFamily:   FONT_BODY,
                fontSize:     FS.caption,
                cursor:       'pointer',
              }}
            >Cancel</button>
            <button
              onClick={() => onDeleteMap(map.id)}
              style={{
                flex:         2,
                padding:      `${SP[1]} 0`,
                borderRadius: RADIUS.sm,
                background:   `color-mix(in srgb, ${RED} 15%, transparent)`,
                border:       `1px solid color-mix(in srgb, ${RED} 50%, transparent)`,
                color:        RED,
                fontFamily:   FONT_BODY,
                fontSize:     FS.caption,
                fontWeight:   700,
                cursor:       'pointer',
              }}
            >Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── MapLibraryContent ──────────────────────────────────────────── */
interface MapLibraryContentProps {
  campaignId:             string
  allMaps:                ActiveMap[]
  planets:                MapPlanet[]
  filteredPlanets:        MapPlanet[]
  mapsByPlanetId:         Record<string, ActiveMap[]>
  unassignedMaps:         ActiveMap[]
  expandedId:             string | 'all' | 'unassigned' | null
  setExpandedId:          (id: string | 'all' | 'unassigned' | null) => void
  planetSearch:           string
  setPlanetSearch:        (v: string) => void
  newPlanetOpen:          boolean
  setNewPlanetOpen:       (v: boolean) => void
  newPlanetName:          string
  setNewPlanetName:       (v: string) => void
  planetBusy:             boolean
  deletePlanetConfirm:    string | null
  setDeletePlanetConfirm: (v: string | null) => void
  deleteConfirm:          string | null
  setDeleteConfirm:       (v: string | null) => void
  mapBusy:                boolean
  uploadOpen:             boolean
  setUploadOpen:          (v: boolean) => void
  onSetActiveMap:         (mapId: string) => void
  onToggleVisible:        (m: ActiveMap) => void
  onDeleteMap:            (mapId: string) => void
  onCreatePlanet:         () => void
  onDeletePlanet:         (planetId: string) => void
  onAssignPlanet:         (mapId: string, planetId: string | null) => void
}

function MapLibraryContent({
  campaignId, allMaps, planets, filteredPlanets,
  mapsByPlanetId, unassignedMaps,
  expandedId, setExpandedId,
  planetSearch, setPlanetSearch,
  newPlanetOpen, setNewPlanetOpen, newPlanetName, setNewPlanetName, planetBusy,
  deletePlanetConfirm, setDeletePlanetConfirm,
  deleteConfirm, setDeleteConfirm,
  mapBusy, uploadOpen, setUploadOpen,
  onSetActiveMap, onToggleVisible, onDeleteMap,
  onCreatePlanet, onDeletePlanet, onAssignPlanet,
}: MapLibraryContentProps) {
  function toggleExpand(id: string | 'all' | 'unassigned') {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: `0 -${SP[2]}` }}>
      {/* Search + planet actions */}
      <div style={{
        padding:       `${SP[1]} ${SP[2]}`,
        borderBottom:  `1px solid ${HUD.border}`,
        display:       'flex',
        flexDirection: 'column',
        gap:           SP[1],
      }}>
        <input
          value={planetSearch}
          onChange={e => setPlanetSearch(e.target.value)}
          placeholder="Search planets..."
          style={POPUP_INPUT}
        />
        {newPlanetOpen ? (
          <div style={{ display: 'flex', gap: SP[1] }}>
            <input
              value={newPlanetName}
              onChange={e => setNewPlanetName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onCreatePlanet()
                if (e.key === 'Escape') { setNewPlanetOpen(false); setNewPlanetName('') }
              }}
              placeholder="Planet name..."
              autoFocus
              style={{ ...POPUP_INPUT, flex: 1 }}
            />
            <button
              onClick={onCreatePlanet}
              disabled={planetBusy || !newPlanetName.trim()}
              style={{
                background:   'var(--hud-surface-lo)',
                border:       `1px solid ${HUD.borderHi}`,
                color:        HUD.gold,
                fontFamily:   FONT_BODY,
                fontSize:     FS.sm,
                fontWeight:   700,
                padding:      `0 ${SP[2]}`,
                borderRadius: RADIUS.md,
                cursor:       'pointer',
                opacity:      (!newPlanetName.trim() || planetBusy) ? 0.45 : 1,
              }}
            >&#10003;</button>
            <button
              onClick={() => { setNewPlanetOpen(false); setNewPlanetName('') }}
              style={{
                background:   'transparent',
                border:       `1px solid ${HUD.border}`,
                color:        DIM,
                fontFamily:   FONT_BODY,
                fontSize:     FS.sm,
                padding:      `0 ${SP[1]}`,
                borderRadius: RADIUS.md,
                cursor:       'pointer',
              }}
            >&times;</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: SP[1] }}>
            <button
              onClick={() => setNewPlanetOpen(true)}
              style={{
                flex:          1,
                padding:       `${SP[1]} 0`,
                borderRadius:  RADIUS.md,
                background:    'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
                border:        '1px solid color-mix(in srgb, var(--hud-accent) 30%, transparent)',
                color:         BLUE,
                fontFamily:    FONT_BODY,
                fontSize:      FS.caption,
                fontWeight:    700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor:        'pointer',
              }}
            >&#8853; New Planet</button>
            <button
              onClick={() => setUploadOpen(true)}
              style={{
                flex:          1,
                padding:       `${SP[1]} 0`,
                borderRadius:  RADIUS.md,
                background:    'var(--hud-surface-lo)',
                border:        `1px solid ${HUD.border}`,
                color:         HUD.gold,
                fontFamily:    FONT_BODY,
                fontSize:      FS.caption,
                fontWeight:    700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor:        'pointer',
              }}
            >&#8593; Upload Map</button>
          </div>
        )}
      </div>

      {/* All Maps folder */}
      <PanelFolderRow
        label="All Maps"
        count={allMaps.length}
        expanded={expandedId === 'all'}
        onToggle={() => toggleExpand('all')}
      />
      {expandedId === 'all' && (
        allMaps.length === 0
          ? <PanelFolderEmpty label="No maps uploaded yet." />
          : allMaps.map(map => (
              <PanelMapRow
                key={map.id}
                map={map}
                planets={planets}
                mapBusy={mapBusy}
                deleteConfirm={deleteConfirm}
                setDeleteConfirm={setDeleteConfirm}
                onSetActive={onSetActiveMap}
                onToggleVisible={onToggleVisible}
                onDeleteMap={onDeleteMap}
                onAssignPlanet={onAssignPlanet}
              />
            ))
      )}

      {/* Named planet folders */}
      {filteredPlanets.map(planet => (
        <div key={planet.id}>
          <PanelFolderRow
            label={planet.name}
            count={mapsByPlanetId[planet.id]?.length ?? 0}
            expanded={expandedId === planet.id}
            onToggle={() => toggleExpand(planet.id)}
            onDelete={() => setDeletePlanetConfirm(planet.id)}
          />
          {deletePlanetConfirm === planet.id && (
            <div style={{
              padding:     `${SP[1]} ${SP[2]}`,
              background:  `color-mix(in srgb, ${RED} 6%, transparent)`,
              borderBottom:`1px solid ${HUD.border}`,
            }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: RED, marginBottom: SP[1] }}>
                Delete &quot;{planet.name}&quot;? Maps will become unassigned.
              </div>
              <div style={{ display: 'flex', gap: SP[1] }}>
                <button
                  onClick={() => setDeletePlanetConfirm(null)}
                  style={{
                    flex:         1,
                    padding:      `${SP[1]} 0`,
                    borderRadius: RADIUS.sm,
                    background:   'transparent',
                    border:       `1px solid ${HUD.border}`,
                    color:        DIM,
                    fontFamily:   FONT_BODY,
                    fontSize:     FS.caption,
                    cursor:       'pointer',
                  }}
                >Cancel</button>
                <button
                  onClick={() => onDeletePlanet(planet.id)}
                  style={{
                    flex:         2,
                    padding:      `${SP[1]} 0`,
                    borderRadius: RADIUS.sm,
                    background:   `color-mix(in srgb, ${RED} 15%, transparent)`,
                    border:       `1px solid color-mix(in srgb, ${RED} 50%, transparent)`,
                    color:        RED,
                    fontFamily:   FONT_BODY,
                    fontSize:     FS.caption,
                    fontWeight:   700,
                    cursor:       'pointer',
                  }}
                >Delete Planet</button>
              </div>
            </div>
          )}
          {expandedId === planet.id && (
            (mapsByPlanetId[planet.id]?.length ?? 0) === 0
              ? <PanelFolderEmpty label="No maps in this planet yet." />
              : (mapsByPlanetId[planet.id] ?? []).map(map => (
                  <PanelMapRow
                    key={map.id}
                    map={map}
                    planets={planets}
                    mapBusy={mapBusy}
                    deleteConfirm={deleteConfirm}
                    setDeleteConfirm={setDeleteConfirm}
                    onSetActive={onSetActiveMap}
                    onToggleVisible={onToggleVisible}
                    onDeleteMap={onDeleteMap}
                    onAssignPlanet={onAssignPlanet}
                  />
                ))
          )}
        </div>
      ))}

      {/* No search results */}
      {planetSearch.trim() && filteredPlanets.length === 0 && (
        <div style={{ padding: SP[2], fontFamily: FONT_BODY, fontSize: FS.caption, color: DIM }}>
          No planets match &quot;{planetSearch}&quot;.
        </div>
      )}

      {/* Unassigned folder */}
      <PanelFolderRow
        label="Unassigned"
        count={unassignedMaps.length}
        expanded={expandedId === 'unassigned'}
        onToggle={() => toggleExpand('unassigned')}
      />
      {expandedId === 'unassigned' && (
        unassignedMaps.length === 0
          ? <PanelFolderEmpty label="All maps are assigned to a planet." />
          : unassignedMaps.map(map => (
              <PanelMapRow
                key={map.id}
                map={map}
                planets={planets}
                mapBusy={mapBusy}
                deleteConfirm={deleteConfirm}
                setDeleteConfirm={setDeleteConfirm}
                onSetActive={onSetActiveMap}
                onToggleVisible={onToggleVisible}
                onDeleteMap={onDeleteMap}
                onAssignPlanet={onAssignPlanet}
              />
            ))
      )}

      {uploadOpen && (
        <PanelMapUploadModal
          campaignId={campaignId}
          planets={planets}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </div>
  )
}

/* ── Map Upload Modal ────────────────────────────────────────────── */
interface PanelMapUploadModalProps {
  campaignId: string
  planets:    MapPlanet[]
  onClose:    () => void
}

function PanelMapUploadModal({ campaignId, planets, onClose }: PanelMapUploadModalProps) {
  const supabase   = useMemo(() => createClient(), [])
  const [name,        setName]        = useState('')
  const [planetId,    setPlanetId]    = useState<string>('')
  const [file,        setFile]        = useState<File | null>(null)
  const [gridEnabled, setGridEnabled] = useState(false)
  const [gridSize,    setGridSize]    = useState(50)
  const [busy,        setBusy]        = useState(false)
  const [err,         setErr]         = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim() || !file) { setErr('Name and image are required.'); return }
    if (file.size > 10 * 1024 * 1024) { setErr('Image must be under 10 MB.'); return }
    setBusy(true); setErr(null)
    try {
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `${campaignId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('maps').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('maps').getPublicUrl(path)
      await supabase.from('maps').insert({
        campaign_id:           campaignId,
        name:                  name.trim(),
        image_url:             urlData.publicUrl,
        grid_enabled:          gridEnabled,
        grid_size:             gridSize,
        is_active:             false,
        is_visible_to_players: false,
        planet_id:             planetId || null,
      })
      onClose()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally { setBusy(false) }
  }

  if (typeof document === 'undefined') return null
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         Z.tooltip,
        background:     'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:    'var(--hud-surface-hi)',
          border:        `1px solid ${HUD.borderHi}`,
          borderRadius:  RADIUS.lg,
          padding:       SP[6],
          width:         '100%',
          maxWidth:      440,
          display:       'flex',
          flexDirection: 'column',
          gap:           SP[2],
          boxShadow:     '0 20px 60px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, color: HUD.gold }}>Upload New Map</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: HUD.textFaint, fontSize: FS.h4, lineHeight: 1 }}>&times;</button>
        </div>

        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, marginBottom: SP[1] }}>Map Name</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tatooine Cantina" style={POPUP_INPUT} />
        </div>

        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, marginBottom: SP[1] }}>Planet (optional)</div>
          <select
            value={planetId}
            onChange={e => setPlanetId(e.target.value)}
            style={{ ...POPUP_INPUT, cursor: 'pointer', color: planetId ? HUD.text : HUD.textFaint }}
          >
            <option value="">&#8212; none &#8212;</option>
            {planets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, marginBottom: SP[1] }}>Image (JPG / PNG / WebP, max 10 MB)</div>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] ?? null)} style={POPUP_INPUT} />
          {file && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, marginTop: SP[1] }}>
              {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: SP[2], cursor: 'pointer' }}>
            <input type="checkbox" checked={gridEnabled} onChange={e => setGridEnabled(e.target.checked)} style={{ accentColor: HUD.gold }} />
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.text }}>Grid overlay</span>
          </label>
          {gridEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], marginLeft: 'auto' }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint }}>Cell size (px)</span>
              <input
                type="number" value={gridSize}
                onChange={e => setGridSize(Math.max(10, Number(e.target.value)))}
                style={{ ...POPUP_INPUT, width: 64, textAlign: 'center' }}
              />
            </div>
          )}
        </div>

        {err && <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: RED }}>{err}</div>}

        <div style={{ display: 'flex', gap: SP[2], justifyContent: 'flex-end', marginTop: SP[1] }}>
          <button
            onClick={onClose}
            style={{
              background:   'transparent',
              border:       `1px solid ${HUD.border}`,
              color:        HUD.textFaint,
              fontFamily:   FONT_BODY,
              fontSize:     FS.caption,
              fontWeight:   700,
              padding:      `${SP[1]} ${SP[3]}`,
              borderRadius: RADIUS.md,
              cursor:       'pointer',
            }}
          >Cancel</button>
          <button
            onClick={() => void handleSave()}
            disabled={busy}
            style={{
              background:   'var(--hud-surface-lo)',
              border:       `1px solid ${HUD.borderHi}`,
              color:        HUD.gold,
              fontFamily:   FONT_BODY,
              fontSize:     FS.caption,
              fontWeight:   700,
              padding:      `${SP[1]} ${SP[3]}`,
              borderRadius: RADIUS.md,
              cursor:       busy ? 'not-allowed' : 'pointer',
              opacity:      busy ? 0.6 : 1,
            }}
          >{busy ? 'Uploading...' : 'Upload Map'}</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

