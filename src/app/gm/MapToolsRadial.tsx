'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMapPlanets, type MapPlanet } from '@/hooks/useMapPlanets'
import type { ActiveMap, CrawlContent } from '@/hooks/useActiveMap'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, Z, RADIUS, EASE, MODAL } from '@/lib/tokens'
import gsap from 'gsap'

/* ── SVG/geometry constants ─────────────────────────────────── */
const SVG_W   = 380
const SVG_H   = 380
const PUCK_CX = 356
const PUCK_CY = 356
const R_PUCK  = 39
const R_OUT   = 176
const R_IN    = 88
const R_ICON  = 133
const R_LABEL = 80

/* Arc definitions */
const ARC_DEFS = [
  { id: 0 as const, startDeg: 178, endDeg: 197, icon: '◫', label: 'MAP LIBRARY'   },
  { id: 1 as const, startDeg: 203, endDeg: 222, icon: '▶', label: 'OPENING CRAWL' },
  { id: 2 as const, startDeg: 228, endDeg: 247, icon: '⊕', label: 'TOKEN SCALE'   },
  { id: 3 as const, startDeg: 253, endDeg: 272, icon: '⛶', label: 'TABLE DISPLAY' },
]

type ArcId = 0 | 1 | 2 | 3

/* Derived fan geometry — computed once from ARC_DEFS so adding/removing/
   reordering arcs needs no changes anywhere these are used. */
const FAN_START = Math.min(...ARC_DEFS.map(a => a.startDeg))
const FAN_END   = Math.max(...ARC_DEFS.map(a => a.endDeg))
const FAN_SPAN  = FAN_END - FAN_START

/* SVG colour exceptions — CSS vars unsupported in SVG stroke/fill attributes.
   Matches the GM view's Imperial Steel theme (--hud-gold under
   [data-theme="gm-imperial"], the only theme GmShell ever mounts this
   widget under) instead of a hardcoded warm gold. */
const GOLD       = '#8AAFC8' // approved SVG exception — matches --hud-gold (Imperial Steel)
const GOLD_FAINT = '#8AAFC8' // approved SVG exception (opacity applied per-element)

/* ── GSAP-animated colour strings ──────────────────────────────
   These are JS values handed to GSAP tween props (fill/stroke as tween
   *targets*, not static SVG presentation attributes) — CSS custom
   properties/color-mix() aren't valid GSAP colour interpolation targets,
   so these are exempt from the token system for the same reason the
   inline SVG hex exceptions above are. */
const GOLD_STROKE_HOT   = 'rgba(138,175,200,0.95)'
const BLADE_FLASH_FILL  = 'rgba(160,200,225,1)'
const PUCK_SWEEP_STROKE = 'rgba(160,200,225,0.9)'
const PUCK_RING_OUTER_HOT  = 'rgba(138,175,200,0.6)'
const PUCK_RING_OUTER_REST = 'rgba(90,120,155,0.28)'
const PUCK_RING_MID_REST   = 'rgba(90,120,155,0.55)'

/* Blade deploy stagger timing (Fix 3) */
const BLADE_OPEN_BASE_DELAY = 0.06
const BLADE_OPEN_STAGGER    = 0.07
const BLADE_CLOSE_STAGGER   = 0.055

/* Puck hover-sweep geometry (Fix 5) — small local coordinate space inset
   around the puck div; dasharray shows ~30 units of the ring's arc length. */
const PUCK_SWEEP_VB     = R_PUCK * 2 + 6
const PUCK_SWEEP_CENTER = PUCK_SWEEP_VB / 2
const PUCK_SWEEP_R      = PUCK_SWEEP_CENTER - 2
const PUCK_SWEEP_CIRC   = 2 * Math.PI * PUCK_SWEEP_R
const PUCK_SWEEP_DASH   = 30
const PUCK_SWEEP_GAP    = PUCK_SWEEP_CIRC - PUCK_SWEEP_DASH

/* Hover-label auto-fit + scramble (Fix 6) */
const LABEL_BASE_FONT_SIZE = 11
const LABEL_MIN_FONT_SIZE  = 7
const SCRAMBLE_CHARS       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789▪▫◊'

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

/* Open single-radius arc (no return leg) — required for <textPath>, where
   the path's actual length/direction matters. arcPath() above is a closed
   there-and-back ring shape: fine for a stroked ring (the return leg just
   overlaps the forward one), but a textPath laid on it treats that return
   leg as real path length — with r1===r2 it loops the long way back around
   almost the full circle, and startOffset="50%" lands mid-loop instead of
   centered on the visible arc. */
function arcOpenPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const p1 = polar(cx, cy, r, startDeg)
  const p2 = polar(cx, cy, r, endDeg)
  const large = (endDeg - startDeg > 180) ? 1 : 0
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`
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


  /* GSAP element refs */
  const puckOuterRef   = useRef<HTMLDivElement>(null)
  const puckMiddleRef  = useRef<HTMLDivElement>(null)
  const puckIconRef    = useRef<SVGSVGElement>(null)
  const ringsGroupRef  = useRef<SVGGElement>(null)
  const arcGroupRefs   = useRef<(SVGGElement | null)[]>(Array.from({ length: ARC_DEFS.length }, () => null))
  const overlayRefs    = useRef<(SVGPathElement | null)[]>(Array.from({ length: ARC_DEFS.length }, () => null))
  const flashRefs      = useRef<(SVGPathElement | null)[]>(Array.from({ length: ARC_DEFS.length }, () => null))
  const labelTextRef   = useRef<SVGTextElement>(null)
  const labelPathRef   = useRef<SVGTextPathElement>(null)
  const hoverTlRefs    = useRef<(gsap.core.Timeline | null)[]>(Array.from({ length: ARC_DEFS.length }, () => null))

  /* Puck hover-sweep */
  const puckSweepRef   = useRef<SVGCircleElement>(null)
  const puckSweepTlRef = useRef<gsap.core.Timeline | null>(null)

  /* Label scramble */
  const labelScrambleRef = useRef<{ cancelled: boolean; raf: number | null }>({ cancelled: true, raf: null })

  /* Drag state */
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
    // Single atomic RPC (migration 097) — see GmMapView.setActive for why two
    // separate .update() calls break the map wipe transition.
    await supabase.rpc('set_active_map', { p_campaign_id: campaignId, p_map_id: mapId })
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

  /* ── Hover label: auto-fit sizing + scramble/settle (Fix 6) ──────── */
  function fitLabelFontSize(target: string): number {
    const textEl = labelTextRef.current
    const pathEl  = labelPathRef.current
    if (!textEl || !pathEl) return LABEL_BASE_FONT_SIZE
    textEl.setAttribute('font-size', String(LABEL_BASE_FONT_SIZE))
    pathEl.textContent = target
    const measured = textEl.getComputedTextLength()
    const availableLength = 2 * Math.PI * R_LABEL * (FAN_SPAN / 360)
    const threshold = availableLength * 0.92
    const size = measured > threshold ? LABEL_BASE_FONT_SIZE * (threshold / measured) : LABEL_BASE_FONT_SIZE
    return Math.max(LABEL_MIN_FONT_SIZE, size)
  }

  function startLabelScramble(target: string) {
    const state = labelScrambleRef.current
    state.cancelled = false
    if (state.raf !== null) { cancelAnimationFrame(state.raf); state.raf = null }
    let frame = 0
    const step = () => {
      if (state.cancelled) return
      const pathEl = labelPathRef.current
      if (!pathEl) return
      let settled = true
      let out = ''
      for (let idx = 0; idx < target.length; idx++) {
        const ch = target[idx]
        if (ch === ' ') { out += ' '; continue }
        const settleAt = 3 + idx * 2
        if (frame >= settleAt) {
          out += ch
        } else {
          settled = false
          out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        }
      }
      pathEl.textContent = out
      frame += 1
      state.raf = settled ? null : requestAnimationFrame(step)
    }
    step()
  }

  function cancelLabelScramble() {
    const state = labelScrambleRef.current
    state.cancelled = true
    if (state.raf !== null) { cancelAnimationFrame(state.raf); state.raf = null }
    if (labelPathRef.current) labelPathRef.current.textContent = ''
  }

  function handleArcEnter(id: ArcId) {
    setActiveArc(id)
    const i = id
    hoverTlRefs.current[i]?.kill()
    const el      = arcGroupRefs.current[i]
    const overlay = overlayRefs.current[i]
    const tl = gsap.timeline()
    hoverTlRefs.current[i] = tl
    if (overlay) tl.to(overlay, { opacity: 1, duration: 0.16 }, 0)
    if (el) tl.to(el, { scale: 1.04, transformOrigin: `${PUCK_CX}px ${PUCK_CY}px`, duration: 0.2, ease: 'back.out(2)' }, 0)
    if (labelTextRef.current) tl.to(labelTextRef.current, { fillOpacity: 0.88, duration: 0.18 }, 0)

    const target  = ARC_DEFS[id].label
    const fitSize = fitLabelFontSize(target)
    if (labelTextRef.current) labelTextRef.current.setAttribute('font-size', String(fitSize))
    startLabelScramble(target)
  }

  function handleArcLeave(id: ArcId) {
    setActiveArc(null)
    const i = id
    hoverTlRefs.current[i]?.kill()
    const el      = arcGroupRefs.current[i]
    const overlay = overlayRefs.current[i]
    const tl = gsap.timeline()
    hoverTlRefs.current[i] = tl
    if (overlay) tl.to(overlay, { opacity: 0, duration: 0.22 }, 0)
    if (el) tl.to(el, { scale: 1, duration: 0.22 }, 0)
    if (labelTextRef.current) tl.to(labelTextRef.current, { fillOpacity: 0, duration: 0.14 }, 0)
    cancelLabelScramble()
  }

  /* ── Puck hover light sweep (Fix 5) — single pass, killable ──────── */
  function handlePuckHoverSweep() {
    puckSweepTlRef.current?.kill()
    const el = puckSweepRef.current
    if (!el) return
    gsap.set(el, { opacity: 1, rotation: -90, transformOrigin: '50% 50%' })
    const tl = gsap.timeline()
    puckSweepTlRef.current = tl
    tl.to(el, { rotation: 270, duration: 0.42, ease: 'power2.inOut' }, 0)
    tl.to(el, { opacity: 0, duration: 0.15, ease: 'power1.out' }, 0.27)
  }

  function handleArcPick(id: ArcId) {
    if (labelTextRef.current) gsap.to(labelTextRef.current, { fillOpacity: 0, duration: 0.1 })
    const el = arcGroupRefs.current[id]
    if (!el) { setOpenPanel(prev => prev === id ? null : id); setIsOpen(false); return }

    // Punch: scale up → down → back, then open panel + close fan
    gsap.timeline()
      .to(el, { scale: 1.09, transformOrigin: `${PUCK_CX}px ${PUCK_CY}px`, duration: 0.1, ease: 'power2.out' })
      .to(el, { scale: 0.88, duration: 0.1, ease: 'power2.in' })
      .to(el, { scale: 1.0,  duration: 0.08, onComplete: () => {
        if (id === 3) {
          window.open(`/table?campaign=${campaignId}`, '_blank')
        } else {
          setOpenPanel(prev => prev === id ? null : id)
        }
        setIsOpen(false)
      }})
  }

  /* Drag handler — moves widget via bottom/right, no React re-renders */
  const onDragMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    const rect = widgetRef.current?.getBoundingClientRect()
    if (!rect) return
    dragOffsetRef.current = {
      ox: e.clientX - rect.left,
      oy: e.clientY - rect.top,
    }
    function onMove(me: MouseEvent) {
      if (!dragOffsetRef.current) return
      const parentNow = widgetRef.current?.parentElement?.getBoundingClientRect()
      const el        = widgetRef.current
      if (!parentNow || !el) return
      const r = parentNow.width  - (me.clientX - parentNow.left) - SVG_W + dragOffsetRef.current.ox
      const b = parentNow.height - (me.clientY - parentNow.top)  - SVG_H + dragOffsetRef.current.oy
      el.style.right  = `${Math.max(0, r)}px`
      el.style.bottom = `${Math.max(0, b)}px`
      el.style.left   = 'auto'
      el.style.top    = 'auto'
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

      // t=0: puck rings + icon
      tl.to(puckMiddleRef.current, { borderColor: GOLD_STROKE_HOT, duration: 0.2, ease: 'power2.out' }, 0)
      tl.to(puckOuterRef.current, { borderColor: PUCK_RING_OUTER_HOT, duration: 0.2, ease: 'power2.out' }, 0)
      tl.to(puckIconRef.current, {
        rotation: 45, transformOrigin: '50% 50%',
        duration: 0.35, ease: 'back.out(2)',
      }, 0)

      // t=0.04: rings scale in
      if (ringsGroupRef.current) {
        gsap.set(ringsGroupRef.current, { opacity: 0, scale: 0.7, transformOrigin: `${PUCK_CX}px ${PUCK_CY}px` })
        tl.to(ringsGroupRef.current, {
          opacity: 1, scale: 1, duration: 0.38, ease: 'expo.out',
        }, 0.04)
      }

      // Blade deploy — rotation sweep from a common swept-back start angle.
      // FAN_START is derived from ARC_DEFS, so adding/removing/reordering
      // arcs needs no changes here.
      ARC_DEFS.forEach((arc, i) => {
        const el = arcGroupRefs.current[i]
        if (!el) return
        const sweepBack = FAN_START - arc.startDeg - 14
        gsap.set(el, { opacity: 0, rotation: sweepBack, transformOrigin: `${PUCK_CX}px ${PUCK_CY}px` })
        tl.to(el, {
          opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.15)',
          onComplete: () => {
            const flash = flashRefs.current[i]
            if (!flash) return
            gsap.timeline()
              .to(flash, { fillOpacity: 0.22, duration: 0.05 })
              .to(flash, { fillOpacity: 0, duration: 0.22, ease: 'power2.out' })
          },
        }, BLADE_OPEN_BASE_DELAY + i * BLADE_OPEN_STAGGER)
      })
    } else {
      // ── Close sequence ──
      const tl = gsap.timeline()

      // Label out immediately
      if (labelTextRef.current) tl.to(labelTextRef.current, { fillOpacity: 0, duration: 0.1 }, 0)
      cancelLabelScramble()

      // Blades out: reverse index order, sweep back to the same start angle
      ARC_DEFS.slice().reverse().forEach((arc, i) => {
        const el = arcGroupRefs.current[arc.id]
        if (!el) return
        const sweepBack = FAN_START - arc.startDeg - 14
        tl.to(el, {
          opacity: 0, rotation: sweepBack,
          transformOrigin: `${PUCK_CX}px ${PUCK_CY}px`,
          duration: 0.3, ease: 'power2.in',
        }, i * BLADE_CLOSE_STAGGER)
      })

      // Rings out
      if (ringsGroupRef.current) {
        tl.to(ringsGroupRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.06)
      }

      // Puck reset
      tl.to(puckIconRef.current, {
        rotation: 0, transformOrigin: '50% 50%',
        duration: 0.3, ease: 'back.out(1.6)',
      }, 0)
      tl.to(puckMiddleRef.current, { borderColor: PUCK_RING_MID_REST, duration: 0.2 }, 0)
      tl.to(puckOuterRef.current, { borderColor: PUCK_RING_OUTER_REST, duration: 0.2 }, 0)
    }
  }, [isOpen])

  return (
    <div
      ref={widgetRef}
      style={{
        position:   'absolute',
        bottom:     '24px',
        right:      '24px',
        width:      SVG_W,
        height:     SVG_H,
        zIndex:     Z.fab,
        userSelect: 'none',
        // Wrapper + SVG root are a 380x380 transparent box over the map canvas —
        // both hit-test their full rect and swallowed every click in that region.
        // Interactive children (puck, arc hit paths) opt back in explicitly.
        pointerEvents: 'none',
      }}
    >
      {/* ── SVG: arcs + puck (z=1) ── */}
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ position: 'absolute', inset: 0, zIndex: Z.raised, overflow: 'visible', pointerEvents: 'none' }}
      >
        {/* ── Defs: blade gradients/shadow + hover label arc path ── */}
        <defs>
          {/* Rest-state blade gradient — cold steel, light biased toward the puck */}
          <radialGradient id="bladeGrad" cx="1" cy="1" r="1.3">
            <stop offset="0.42" stopColor="rgba(9,11,15,0.97)" />   {/* approved SVG exception */}
            <stop offset="0.58" stopColor="rgba(24,30,40,0.96)" />  {/* approved SVG exception */}
            <stop offset="0.72" stopColor="rgba(18,23,30,0.96)" />  {/* approved SVG exception */}
            <stop offset="0.86" stopColor="rgba(10,13,17,0.97)" />  {/* approved SVG exception */}
          </radialGradient>
          {/* Hot-state (hover) blade gradient — crossfaded in via overlay opacity */}
          <radialGradient id="bladeGradHot" cx="1" cy="1" r="1.3">
            <stop offset="0.42" stopColor="rgba(14,18,26,0.97)" />  {/* approved SVG exception */}
            <stop offset="0.58" stopColor="rgba(34,46,62,0.96)" />  {/* approved SVG exception */}
            <stop offset="0.72" stopColor="rgba(26,34,46,0.96)" />  {/* approved SVG exception */}
            <stop offset="0.86" stopColor="rgba(14,18,24,0.97)" />  {/* approved SVG exception */}
          </radialGradient>
          <filter id="bladeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity={0.55} /> {/* approved SVG exception */}
          </filter>
          <path
            id="label-arc-path"
            d={arcOpenPath(PUCK_CX, PUCK_CY, R_LABEL, FAN_START, FAN_END)}
            fill="none"
          />
        </defs>

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

            {/* Gap divider ticks at 200°, 225° and 250° */}
            {[200, 225, 250].map(deg => {
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
          const midDeg    = (arc.startDeg + arc.endDeg) / 2
          const iconPos   = polar(PUCK_CX, PUCK_CY, R_ICON, midDeg)
          const isActive  = activeArc === arc.id
          const bladeD    = arcPath(PUCK_CX, PUCK_CY, R_IN, R_OUT, arc.startDeg, arc.endDeg)
          const lightD    = arcPath(PUCK_CX, PUCK_CY, R_IN + 2, R_IN + 2, arc.startDeg + 0.5, arc.endDeg - 0.5)
          const edgeIn1   = polar(PUCK_CX, PUCK_CY, R_IN,  arc.startDeg)
          const edgeOut1  = polar(PUCK_CX, PUCK_CY, R_OUT, arc.startDeg)
          const edgeIn2   = polar(PUCK_CX, PUCK_CY, R_IN,  arc.endDeg)
          const edgeOut2  = polar(PUCK_CX, PUCK_CY, R_OUT, arc.endDeg)

          return (
            <g key={arc.id} id={`arc-${arc.id}`} ref={el => { arcGroupRefs.current[arc.id] = el }} style={{ pointerEvents: 'none' }}>
              {/* Base blade fill — rest-state gradient, always fully opaque, lifted via drop shadow */}
              <path d={bladeD} fill="url(#bladeGrad)" stroke="none" filter="url(#bladeShadow)" />
              {/* Hover overlay — hot-state gradient, GSAP opacity-tweened crossfade */}
              <path
                ref={el => { overlayRefs.current[arc.id] = el }}
                d={bladeD}
                fill="url(#bladeGradHot)"
                stroke="none"
                opacity={0}
              />
              {/* Side edge strokes — contained "plate" silhouette */}
              <line x1={edgeIn1.x} y1={edgeIn1.y} x2={edgeOut1.x} y2={edgeOut1.y}
                stroke={GOLD} strokeOpacity={0.25} strokeWidth={0.75} />
              <line x1={edgeIn2.x} y1={edgeIn2.y} x2={edgeOut2.x} y2={edgeOut2.y}
                stroke={GOLD} strokeOpacity={0.25} strokeWidth={0.75} />
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
              {/* Inner-edge light-catch */}
              <path d={lightD} fill="none" stroke="rgba(160,200,225,0.28)" strokeWidth={1} /> {/* approved SVG exception */}
              {/* Icon */}
              <text
                x={iconPos.x} y={iconPos.y}
                textAnchor="middle" dominantBaseline="central"
                fill={GOLD}
                fillOpacity={isActive ? 1.0 : 0.6}
                fontSize={24}
                fontFamily={FONT_BODY}
              >
                {arc.icon}
              </text>
              {/* Lock-in flash — punched via fillOpacity on deploy onComplete, above icon, non-interactive */}
              <path
                ref={el => { flashRefs.current[arc.id] = el }}
                d={bladeD}
                fill={BLADE_FLASH_FILL}
                fillOpacity={0}
                stroke="none"
                style={{ pointerEvents: 'none' }}
              />
            </g>
          )
        })}

        {/* ── Hover label (GSAP-controlled opacity) — auto-fit + scramble driven imperatively ── */}
        <text
          ref={labelTextRef}
          fill={GOLD}
          fillOpacity={0}
          fontSize={LABEL_BASE_FONT_SIZE}
          fontFamily={FONT_DISPLAY}
          fontWeight={700}
          letterSpacing="0.13em"
          style={{ pointerEvents: 'none' }}
        >
          <textPath ref={labelPathRef} href="#label-arc-path" startOffset="50%" textAnchor="middle" />
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

      </svg>

      {/* ── Puck (z=2) — dial-face DOM widget: open/close + hover light sweep ── */}
      <div
        onClick={() => setIsOpen(o => !o)}
        onMouseEnter={handlePuckHoverSweep}
        style={{
          position:      'absolute',
          right:         8,
          bottom:        8,
          width:         R_PUCK * 2,
          height:        R_PUCK * 2,
          zIndex:        Z.raised + 1,
          cursor:        'pointer',
          pointerEvents: 'auto',
        }}
      >
        {/* Hover light sweep — single pass on mouseenter, not looping */}
        <svg
          viewBox={`0 0 ${PUCK_SWEEP_VB} ${PUCK_SWEEP_VB}`}
          style={{
            position: 'absolute', inset: -3,
            width: `calc(100% + 6px)`, height: `calc(100% + 6px)`,
            pointerEvents: 'none',
          }}
        >
          <circle
            ref={puckSweepRef}
            cx={PUCK_SWEEP_CENTER} cy={PUCK_SWEEP_CENTER} r={PUCK_SWEEP_R}
            fill="none"
            stroke={PUCK_SWEEP_STROKE}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray={`${PUCK_SWEEP_DASH} ${PUCK_SWEEP_GAP}`}
            opacity={0}
          />
        </svg>

        {/* Outer ring */}
        <div ref={puckOuterRef} style={{
          position: 'absolute', inset: 0, borderRadius: RADIUS.full,
          border: `1px solid ${PUCK_RING_OUTER_REST}`,
        }} />

        {/* Middle face — gradient + inset/outer shadow, dial-face physicality */}
        <div ref={puckMiddleRef} style={{
          position: 'absolute', inset: 7, borderRadius: RADIUS.full,
          border: `1.5px solid ${PUCK_RING_MID_REST}`,
          /* approved SVG/CSS exception — static radial gradient + shadow, recoloured cold steel to match Imperial Steel theme */
          background: 'radial-gradient(circle at 36% 30%, rgba(90,120,155,0.18) 0%, rgba(8,10,13,0.98) 62%, rgba(3,4,6,1) 100%)',
          boxShadow: 'inset 0 1px 1px rgba(160,200,225,0.12), inset 0 -2px 3px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.45)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px',
        }}>
          {/* Innermost faint ring */}
          <div style={{
            position: 'absolute', inset: 14, borderRadius: RADIUS.full,
            border: '0.5px solid rgba(90,120,155,0.18)', /* approved SVG exception */
          }} />
          {/* Icon — stylised map/compass glyph */}
          <svg ref={puckIconRef} viewBox="0 0 24 24" fill="none" width={22} height={22} style={{ position: 'relative', zIndex: 2 }}>
            <path d="M3 6.5 L8.5 4 L15.5 6.5 L21 4 V17.5 L15.5 20 L8.5 17.5 L3 20 Z"
              stroke={GOLD} strokeOpacity={0.9} strokeWidth={1.3} strokeLinejoin="round" />
            <path d="M8.5 4 V17.5 M15.5 6.5 V20" stroke={GOLD} strokeOpacity={0.45} strokeWidth={1} />
            <circle cx={12} cy={10.6} r={2.1} stroke={GOLD} strokeWidth={1.3} />
            <path d="M12 12.7 V15.2" stroke={GOLD} strokeWidth={1.3} strokeLinecap="round" />
          </svg>
          <span style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
            letterSpacing: '0.24em', color: 'rgba(138,175,200,0.85)', /* approved SVG exception */
            position: 'relative', zIndex: 2, lineHeight: 1, marginLeft: '0.24em',
          }}>
            MAP
          </span>
        </div>
      </div>
      {/* ── Drag handle (z=3) — move widget only ── */}
      <div
        onMouseDown={onDragMouseDown}
        style={{
          position:        'absolute',
          bottom:          -16,
          right:           8,
          width:           R_PUCK * 2,
          display:         'grid',
          gridTemplateColumns: 'repeat(4, 3px)',
          gap:             SP[1],
          justifyContent:  'center',
          padding:         SP[1],
          cursor:          'grab',
          zIndex:          Z.raised + 2,
          pointerEvents:   'auto',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            width:        3,
            height:       3,
            borderRadius: RADIUS.full,
            background:   `color-mix(in srgb, ${HUD.gold} 35%, transparent)`,
          }} />
        ))}
      </div>

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
  boxShadow:            MODAL.shadow,
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
      <div style={{ display: 'flex', gap: SP[1], marginTop: SP[1] }}>
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
      <span style={{ color: expanded ? HUD.gold : HUD.textFaint, fontSize: FS.overline, flexShrink: 0, lineHeight: 1 }}>
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
            padding:     `0 ${SP[1]}`,
            flexShrink:  0,
            marginLeft:  SP[1],
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
              <span style={{ marginLeft: SP[2], fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.gold }}>
                &starf; ACTIVE
              </span>
            )}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM }}>
            {map.grid_enabled ? `Grid ${map.grid_size}px` : 'No grid'}
            {map.is_visible_to_players && (
              <span style={{ marginLeft: SP[2], color: GREEN }}>&bull; Visible</span>
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
            padding:      `2px ${SP[1]}`, /* 2px minimum touch target */
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
  const router = useRouter()

  function toggleExpand(id: string | 'all' | 'unassigned') {
    setExpandedId(expandedId === id ? null : id)
  }

  function goToMapForge() {
    // Wipe any stale draft before navigating so MapForge always opens clean
    try { localStorage.removeItem(`mapforge_draft_${campaignId}`) } catch { /* ignore */ }
    router.push(`/gm/mapforge?campaign=${campaignId}`)
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
        {!newPlanetOpen && (
          <button
            onClick={goToMapForge}
            style={{
              width:         '100%',
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
          >&#9670; Generate Map</button>
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
        background:     MODAL.backdrop,
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
          boxShadow:     MODAL.shadow,
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

