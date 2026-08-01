'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

// Scoped cinematic fonts — this component is a cinematic surface, not a UI
// surface, so it deliberately does NOT use FONT_BODY/FONT_DISPLAY from
// @/lib/tokens (the app's sealed two-UI-font system). StarJediOutline (logo)
// and NewsCycleCrawl (everything else) are component-local @font-face
// declarations, used nowhere else in the app — the same carve-out pattern
// StarJediOutline already established here, now extended to a second face.
const FONT_FACE_CSS = `
  @font-face {
    font-family: 'StarJediOutline';
    src: url('/fonts/StarJediOutline-y0xm.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'StarJediSolid';
    src: url('/fonts/Starjedi.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'NewsCycleCrawl';
    src: url('/fonts/News_Cycle/NewsCycle-Bold.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`
// StarJediOutline is hollow letterforms — kept declared (unused) since the
// film logo needs a solid fill, not an outline. StarJediSolid is that solid face.
const FONT_LOGO  = "'StarJediSolid'"
const FONT_CRAWL = "'NewsCycleCrawl'"

// Cinematic colour — exact Star Wars crawl yellow; not a UI token.
const CRAWL_GOLD = '#ffe84d'
// Intro text blue — exact match for the classic "A long time ago" treatment.
const INTRO_BLUE = '#5a7fa8'

// ── Timeline durations (seconds) — Prompt 2 target schedule ────────────────
const D_INTRO_IN     = 0.8
const D_INTRO_HOLD    = 2.0
const D_INTRO_OUT     = 0.6
const D_LOGO_IN       = 0.5
const D_LOGO_HOLD     = 1.0
const D_LOGO_SHRINK   = 3.2
const LOGO_MIN_SCALE  = 0.035
const D_CRAWL_STAGE_IN = 0.3
const D_CRAWL_SCROLL  = 84 // 70 * 1.2 — slowed 20%, text was scrolling too fast

// Absolute start times, derived from the durations above so the schedule
// stays internally consistent if any duration is retuned later.
const LOGO_FADE_IN_AT = D_INTRO_IN + D_INTRO_HOLD + D_INTRO_OUT           // 3.2 — overlaps the tail of the intro fade-out
const LOGO_SHRINK_AT  = LOGO_FADE_IN_AT + D_LOGO_IN + D_LOGO_HOLD         // 4.7
const CRAWL_START_AT  = LOGO_SHRINK_AT + D_LOGO_SHRINK * 0.5             // 6.3 — crawl enters at roughly half-shrink, not after the logo finishes

// Audio hard-stop — 83s, confirmed as the real existing value (the "73
// seconds" figure in earlier prose was a stale restatement; withdrawn).
const T_AUDIO_STOP = 83_000

interface Props {
  heading: string
  subheading: string
  body: string
}

// ── Deterministic LCG (Numerical Recipes constants) — same recurrence the
// old 2D starfield used (`(i*9301+49297) % 233280`), adapted into a proper
// sequential generator (chained state) since the three.js field now needs
// several pseudo-random values per star (position, depth, brightness, tint)
// rather than just two (x, y). Same seed -> identical field every play.
function makeLcg(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const STARFIELD_SEED = 20260616

// Soft circular sprite for star points — PointsMaterial with no map/alphaMap
// renders flat-shaded squares (confirmed by direct pixel readback, see below).
// Tight core + fast falloff so points read as pinpoints with a subtle glow,
// not fuzzy blobs.
function makeStarSprite(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const c = size / 2
  const gradient = ctx.createRadialGradient(c, c, 0, c, c, c)
  gradient.addColorStop(0,    'rgba(255,255,255,1)')
  gradient.addColorStop(0.2,  'rgba(255,255,255,0.85)')
  gradient.addColorStop(0.5,  'rgba(255,255,255,0.18)')
  gradient.addColorStop(1,    'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Layered like TalentsPanel's HeroConstellation (near/far THREE.Points
// layers) — extended to three depth bands so size (via per-layer material
// size + perspective sizeAttenuation) and brightness (via per-vertex vertex
// colours) both vary continuously rather than reading as uniform dots.
// Sizes are the same order of magnitude as HeroConstellation's own proven
// values (0.04/0.06 at a comparable camera-distance range) — an earlier
// pass at 0.55-2.1 was 10-50x too large: under sizeAttenuation, PointsMaterial
// renders points as flat-shaded SQUARES (no default circular sprite texture),
// so oversized points rendered as giant overlapping tiles instead of dots,
// confirmed by direct canvas pixel readback in testing.
const STAR_LAYERS = [
  { count: 3192, zMin: -60, zMax: -22, size: 0.025, lumMin: 0.08, lumMax: 0.35 },
  { count: 840,  zMin: -22, zMax: -8,  size: 0.045, lumMin: 0.30, lumMax: 0.68 },
  { count: 70,   zMin: -8,  zMax: -3,  size: 0.07,  lumMin: 0.70, lumMax: 1.00 },
] as const

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

// ── Crawl perspective-plane geometry ────────────────────────────────────────
// The crawl stage projects the track through a fixed perspective(280px) +
// rotateX(28deg) on the "Perspective stage" wrapper (below) — these constants
// must match those two CSS values exactly. Animating the track's `bottom`
// (pre-transform layout space) makes content project near the vanishing
// point instead of entering from the screen's bottom edge, since a flat-space
// offset doesn't correspond linearly to a projected-screen offset once
// perspective divide is in play. The fix animates translateY INSIDE the
// transform chain (translateX(-50%) rotateX(28deg) translateY(Ypx)) — because
// CSS composes transform functions right-to-left, translateY is applied to
// the point before rotateX, so the shift itself gets rotated into the tilted
// plane rather than sliding the whole projected image up/down the screen.
//
// solveTranslateY inverts that same composition: given the track's rotation
// origin sits at the container's bottom edge (transform-origin: 50% 100%,
// track positioned bottom:0), a point at local offset `yRel` from that origin
// (yRel = pointLocalY - trackHeight) projects to container-relative screen Y:
//   screenY = originY + (yRel + Y)*cos(a) / (1 - (yRel + Y)*sin(a) / P)  [+ perspective-origin term]
// This solves that equation for Y given a desired screenY target. Verified
// against a standalone rendered-DOM probe (not just derived) before landing.
const CRAWL_PERSPECTIVE_PX     = 280
const CRAWL_ROTATE_X_DEG       = 28
const CRAWL_PERSPECTIVE_ORIGIN_Y_FRAC = 0.18
const CRAWL_ROTATE_X_RAD = CRAWL_ROTATE_X_DEG * Math.PI / 180
const CRAWL_COS_RX = Math.cos(CRAWL_ROTATE_X_RAD)
const CRAWL_SIN_RX = Math.sin(CRAWL_ROTATE_X_RAD)

function solveCrawlTranslateY(containerH: number, yRel: number, targetScreenY: number): number {
  const perspOriginY = containerH * CRAWL_PERSPECTIVE_ORIGIN_Y_FRAC
  const k = (targetScreenY - containerH) /
    (CRAWL_COS_RX + (targetScreenY - perspOriginY) * CRAWL_SIN_RX / CRAWL_PERSPECTIVE_PX)
  return k - yRel
}

export function OpeningCrawlCanvas({ heading, subheading, body }: Props) {
  const containerRef      = useRef<HTMLDivElement>(null)
  const starfieldMountRef = useRef<HTMLDivElement>(null)
  const introRef          = useRef<HTMLDivElement>(null)
  const logoRef           = useRef<HTMLDivElement>(null)
  const crawlStageRef     = useRef<HTMLDivElement>(null)
  const crawlTrackRef     = useRef<HTMLDivElement>(null)

  const audioRef            = useRef<HTMLAudioElement | null>(null)
  const audioPlayPromiseRef = useRef<Promise<void> | null>(null)
  const audioTeardownRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [containerWidth, setContainerWidth] = useState(0)

  // ── Container-relative typography (Prompt 4) — plain React state, wholly
  // independent of the GSAP timeline below (which never touches font-size).
  // A resize only updates these numbers; it never restarts the timeline.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width
      if (w) setContainerWidth(w)
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  const bodyFS    = clamp(containerWidth * 0.026, 11, 48)
  const headingFS = clamp(containerWidth * 0.020, 9, 38)
  const titleFS   = clamp(containerWidth * 0.042, 16, 78)
  const introFS   = clamp(containerWidth * 0.022, 11, 40)
  const logoFS    = clamp(containerWidth * 0.13, 44, 240)

  // ── Starfield — three.js, STATIC (Prompt 2). Rendered once at setup and
  // again on resize; no animation loop, no rotation, no twinkle. Disposal
  // sequence matches PresenceSmoke.tsx/HeroConstellation verbatim.
  useEffect(() => {
    const mount = starfieldMountRef.current
    if (!mount) return

    // alpha:true (not opaque) — matches PresenceSmoke.tsx/HeroConstellation's
    // established config exactly. The container's own CSS `background:'#000'`
    // (root div, above) is what provides the opaque black backdrop; an
    // opaque-context request here is the one config difference from every
    // other three.js usage in this codebase and was reproducibly failing
    // context creation in testing ("Canvas has an existing context of a
    // different type") — switching to alpha:true (and dropping the redundant
    // scene.background, which the other two components also don't set)
    // resolved it.
    // preserveDrawingBuffer:true is load-bearing here, unlike PresenceSmoke/
    // HeroConstellation — those two run a continuous renderer.setAnimationLoop
    // every frame, so the default (cleared-after-compositor-swap) buffer gets
    // refreshed constantly and it never matters. This starfield deliberately
    // renders ONCE (static field, no loop) — without this flag the canvas
    // goes blank shortly after that single render, since WebGL's default
    // behaviour clears the drawing buffer once the compositor has swapped it.
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    camera.position.z = 0

    const starTexture = makeStarSprite()

    const rand = makeLcg(STARFIELD_SEED)
    const layers = STAR_LAYERS.map(def => {
      const positions = new Float32Array(def.count * 3)
      const colors    = new Float32Array(def.count * 3)
      for (let i = 0; i < def.count; i++) {
        const z       = def.zMin + rand() * (def.zMax - def.zMin)
        const spreadY = Math.abs(z) * 0.62
        const spreadX = spreadY * 2.6 // generous — covers wide/ultrawide map-area aspect ratios
        positions[i * 3]     = (rand() - 0.5) * 2 * spreadX
        positions[i * 3 + 1] = (rand() - 0.5) * 2 * spreadY
        positions[i * 3 + 2] = z

        // Power-curve bias toward lumMin — most stars in a layer read as dim,
        // only a minority near rand()=1 approach the layer's bright ceiling.
        const lum      = def.lumMin + Math.pow(rand(), 1.6) * (def.lumMax - def.lumMin)
        const tintRoll = rand()
        let r = lum, b = lum
        const g = lum
        if (tintRoll < 0.12)      { b = Math.min(1, b + 0.08); r = Math.max(0, r - 0.03) } // faint cool
        else if (tintRoll > 0.92) { r = Math.min(1, r + 0.07); b = Math.max(0, b - 0.04) } // faint warm
        colors[i * 3] = r; colors[i * 3 + 1] = g; colors[i * 3 + 2] = b
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const material = new THREE.PointsMaterial({
        size: def.size, vertexColors: true, sizeAttenuation: true,
        map: starTexture, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      const points = new THREE.Points(geometry, material)
      scene.add(points)
      return { points, geometry, material }
    })

    const render = () => renderer.render(scene, camera)

    const resize = () => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      render() // static field — resize must re-render explicitly, there is no loop to pick it up
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    return () => {
      ro.disconnect()
      layers.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose() })
      starTexture.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  // ── Audio (Prompt 1) — StrictMode-safe. The teardown a cleanup would
  // normally run synchronously is instead deferred one tick; if the effect
  // re-fires immediately after (StrictMode's dev-only phantom
  // mount->cleanup->remount), the pending teardown is cancelled and the SAME
  // Audio element is reused instead of a second one being constructed — so
  // under StrictMode this creates exactly one Audio, issues exactly one
  // .play() call, and never pauses/restarts it mid-flight. A genuine unmount
  // has no following remount to cancel the deferred teardown, so it fires
  // for real on the next tick. The teardown always awaits the captured
  // .play() promise before pausing, so a late-resolving play can never
  // outlive (and audibly blip past) its own pause.
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio('/sounds/star-wars-theme-song.mp3')
      audio.volume = 0.85
      audioRef.current = audio
      audioPlayPromiseRef.current = audio.play().catch(() => { /* autoplay may be blocked by browser policy */ })
    } else if (audioTeardownRef.current) {
      clearTimeout(audioTeardownRef.current)
      audioTeardownRef.current = null
    }

    const stopTimer = setTimeout(() => {
      const audio = audioRef.current
      if (!audio) return
      const finish = () => { audio.pause(); audio.src = ''; audioRef.current = null }
      const p = audioPlayPromiseRef.current
      if (p) p.then(finish).catch(finish)
      else finish()
    }, T_AUDIO_STOP)

    return () => {
      clearTimeout(stopTimer)
      audioTeardownRef.current = setTimeout(() => {
        const audio = audioRef.current
        if (!audio) return
        const finish = () => { audio.pause(); audio.src = ''; audioRef.current = null }
        const p = audioPlayPromiseRef.current
        if (p) p.then(finish).catch(finish)
        else finish()
      }, 0)
    }
  }, [])

  // ── Master GSAP timeline (Prompt 3) — replaces the old setTimeout/RAF
  // chain entirely. Track start position is measured against the CONTAINER
  // (not the viewport) after fonts are ready, so the track is guaranteed
  // fully below the visible bottom edge before playback begins (Prompt 5).
  useEffect(() => {
    const container  = containerRef.current
    const intro       = introRef.current
    const logo         = logoRef.current
    const crawlStage  = crawlStageRef.current
    const track        = crawlTrackRef.current
    if (!container || !intro || !logo || !crawlStage || !track) return

    let cancelled = false
    let tl: gsap.core.Timeline | null = null

    gsap.set(intro, { opacity: 0 })
    gsap.set(logo, { opacity: 0, scale: 1 })
    gsap.set(crawlStage, { opacity: 0 })

    async function setup() {
      if (typeof document !== 'undefined' && document.fonts) {
        try {
          await Promise.race([
            document.fonts.ready,
            new Promise(resolve => setTimeout(resolve, 2000)), // timeout fallback — a stuck font load must not block the sequence forever
          ])
        } catch { /* proceed with whatever metrics are available */ }
      }
      if (cancelled || !container || !track) return

      // Track's rotation origin (transform-origin: 50% 100%, track positioned
      // bottom:0) sits at the container's own bottom edge. `startY` targets a
      // point at the TOP of the track box (yRel = -trackH, where the episode
      // heading lives — the first, topmost content) landing 1.5x the
      // container height down (comfortably below the visible frame, with a
      // fixed safety margin below the perspective-projection's positive-side
      // singularity regardless of container size). `endY` targets the
      // track's own BOTTOM edge (yRel = 0 — at or after every real line of
      // text, so it's the last point to clear) landing 150px above the top
      // edge (comfortably within the projection's reachable range, which is
      // asymptotically bounded on the negative side).
      const vh     = container.offsetHeight
      const trackH = track.offsetHeight
      const startY = solveCrawlTranslateY(vh, -trackH, vh * 1.5)
      const endY   = solveCrawlTranslateY(vh, 0, -150)

      const applyTranslateY = (y: number) => {
        track.style.transform = `translateX(-50%) rotateX(${CRAWL_ROTATE_X_DEG}deg) translateY(${y}px)`
      }
      gsap.set(track, { bottom: 0 })
      applyTranslateY(startY)

      const crawlY = { y: startY }

      tl = gsap.timeline()
      tl.to(intro, { opacity: 1, duration: D_INTRO_IN, ease: 'power1.inOut' }, 0)
        .to(intro, { opacity: 0, duration: D_INTRO_OUT, ease: 'power1.inOut' }, D_INTRO_IN + D_INTRO_HOLD)
        .to(logo, { opacity: 1, duration: D_LOGO_IN, ease: 'power1.inOut' }, LOGO_FADE_IN_AT)
        .to(logo, { scale: LOGO_MIN_SCALE, duration: D_LOGO_SHRINK, ease: 'power2.inOut' }, LOGO_SHRINK_AT)
        .to(logo, { opacity: 0, duration: D_LOGO_SHRINK * 0.2, ease: 'power1.in' }, LOGO_SHRINK_AT + D_LOGO_SHRINK * 0.8)
        .to(crawlStage, { opacity: 1, duration: D_CRAWL_STAGE_IN, ease: 'power1.inOut' }, CRAWL_START_AT)
        .to(crawlY, {
          y: endY, duration: D_CRAWL_SCROLL, ease: 'none',
          onUpdate: () => applyTranslateY(crawlY.y),
        }, CRAWL_START_AT)
    }
    void setup()

    return () => {
      cancelled = true
      tl?.kill()
    }
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}
    >
      <style>{FONT_FACE_CSS}</style>

      {/* Starfield — three.js canvas mounts here */}
      <div ref={starfieldMountRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Phase 1 — Intro text */}
      <div
        ref={introRef}
        style={{
          position: 'absolute', inset: 0, zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT_CRAWL,
          fontStyle: 'italic',
          fontSize: `${introFS}px`,
          color: INTRO_BLUE,
          opacity: 0,
        }}
      >
        A long time ago, in a galaxy far, far away….
      </div>

      {/* Phase 2 — STAR / WARS logo */}
      <div
        ref={logoRef}
        style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT_LOGO,
          fontSize: `${logoFS}px`,
          lineHeight: 1.05,
          color: CRAWL_GOLD,
          textAlign: 'center',
          transformOrigin: '50% 50%',
          opacity: 0,
        }}
      >
        <div>STAR</div>
        <div>WARS</div>
      </div>

      {/* Phase 3 — Crawl stage */}
      <div
        ref={crawlStageRef}
        style={{ position: 'absolute', inset: 0, zIndex: 3, overflow: 'hidden', opacity: 0 }}
      >
        {/* Top fade — masks text as it disappears into the distance */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '40%',
          background: 'linear-gradient(to bottom, #000 28%, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Perspective stage */}
        <div style={{
          position: 'absolute', inset: 0,
          perspective: `${CRAWL_PERSPECTIVE_PX}px`,
          perspectiveOrigin: `50% ${CRAWL_PERSPECTIVE_ORIGIN_Y_FRAC * 100}%`,
        }}>
          {/* Crawl track — position animated by the master timeline */}
          <div
            ref={crawlTrackRef}
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              // translateY is overwritten imperatively by the master timeline
              // (see the GSAP effect) — translateY must stay last in this
              // list so it composes inside the rotated plane, not the flat
              // screen axis.
              transform: `translateX(-50%) rotateX(${CRAWL_ROTATE_X_DEG}deg) translateY(0px)`,
              transformOrigin: '50% 100%',
              width: '62%',
              textAlign: 'justify',
            }}
          >
            {/* Episode heading */}
            <div style={{
              fontFamily: FONT_CRAWL,
              fontSize: `${headingFS}px`,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              textAlign: 'center',
              color: CRAWL_GOLD,
              marginBottom: '1.5em',
            }}>
              {heading}
            </div>

            {/* Episode title — same face as everything else, differentiated by size/letterspacing only */}
            <div style={{
              fontFamily: FONT_CRAWL,
              fontSize: `${titleFS}px`,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textAlign: 'center',
              color: CRAWL_GOLD,
              marginBottom: '1.5em',
            }}>
              {subheading}
            </div>

            {/* Body crawl text */}
            <div style={{
              fontFamily: FONT_CRAWL,
              fontSize: `${bodyFS}px`,
              lineHeight: 1.85,
              color: CRAWL_GOLD,
              whiteSpace: 'pre-wrap',
            }}>
              {body}
            </div>
          </div>
        </div>

        {/* Bottom fade — masks text entering from below; tuned taller/more opaque
            at its base than the original so entry reads as emergence, not pop-in */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '24%',
          background: 'linear-gradient(to top, #000 48%, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}
