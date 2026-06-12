'use client'

import { useEffect, useRef, useState } from 'react'
import { FONT_BODY, FONT_DISPLAY } from '@/lib/tokens'

// StarJediOutline is a local cinematic font used only in this component.
const FONT_FACE_CSS = `
  @font-face {
    font-family: 'StarJediOutline';
    src: url('/fonts/StarJediOutline-y0xm.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`

// Cinematic colour — exact Star Wars crawl yellow; not a UI token.
const CRAWL_GOLD = '#ffe84d'
// Intro text blue — exact match for the classic "A long time ago" treatment.
const INTRO_BLUE = '#5a7fa8'

// Phase timing (ms)
const T_INTRO_IN    = 800
const T_INTRO_HOLD  = 2500
const T_INTRO_OUT   = 800
const T_LOGO_IN     = 600
const T_LOGO_HOLD   = 1500
const T_LOGO_SHRINK = 3200
const T_CRAWL_IN    = 300
const T_CRAWL_DUR   = 70_000
const T_AUDIO_STOP  = 83_000

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

interface Props {
  heading: string
  subheading: string
  body: string
}

export function OpeningCrawlCanvas({ heading, subheading, body }: Props) {
  const containerRef   = useRef<HTMLDivElement>(null)
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const introRef       = useRef<HTMLDivElement>(null)
  const logoRef        = useRef<HTMLDivElement>(null)
  const crawlStageRef  = useRef<HTMLDivElement>(null)
  const crawlTrackRef  = useRef<HTMLDivElement>(null)
  const audioRef       = useRef<HTMLAudioElement | null>(null)
  const rafRef         = useRef<number>(0)

  const [showLogo,  setShowLogo]  = useState(false)
  const [showCrawl, setShowCrawl] = useState(false)

  // ── Starfield (drawn once; deterministic LCG — no random) ───────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.offsetWidth  || window.innerWidth
    const h = canvas.offsetHeight || window.innerHeight
    canvas.width  = w
    canvas.height = h
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 180; i++) {
      const x     = ((i * 9301 + 49297) % 233280) / 233280 * w
      const y     = ((i * 49297 + 233280) % 9301)  / 9301  * h
      const r     = i % 7 === 0 ? 1.5 : i % 3 === 0 ? 1.2 : 0.7
      const alpha = 0.4 + (i % 5) * 0.12
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [])

  // ── Audio ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio('/sounds/star-wars-theme-song.mp3')
    audio.volume = 0.85
    audioRef.current = audio
    void audio.play().catch(() => { /* autoplay may be blocked by browser policy */ })

    const stopTimer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }, T_AUDIO_STOP)

    return () => {
      clearTimeout(stopTimer)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, [])

  // ── Main sequence ───────────────────────────────────────────────────────
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay)
      timers.push(id)
    }

    // Phase 1 — Intro text
    schedule(() => {
      const el = introRef.current
      if (!el) return
      el.style.transition = `opacity ${T_INTRO_IN}ms ease`
      requestAnimationFrame(() => { if (el) el.style.opacity = '1' })
    }, 50)

    schedule(() => {
      const el = introRef.current
      if (!el) return
      el.style.transition = `opacity ${T_INTRO_OUT}ms ease`
      el.style.opacity = '0'
    }, 50 + T_INTRO_IN + T_INTRO_HOLD)

    // Phase 2 — Logo (starts after intro fully fades)
    const logoAt = 50 + T_INTRO_IN + T_INTRO_HOLD + T_INTRO_OUT

    schedule(() => setShowLogo(true), logoAt)

    schedule(() => {
      const el = logoRef.current
      if (!el) return
      el.style.transition = `opacity ${T_LOGO_IN}ms ease`
      requestAnimationFrame(() => { if (el) el.style.opacity = '1' })
    }, logoAt + 50)

    // Logo shrink via RAF
    schedule(() => {
      const el = logoRef.current
      if (!el) return
      el.style.transition = '' // hand off to RAF
      const start          = performance.now()
      const fadeThreshold  = T_LOGO_SHRINK * 0.85

      function animateLogo(now: number) {
        const elapsed = now - start
        const p       = Math.min(elapsed / T_LOGO_SHRINK, 1)
        const ep      = easeInOut(p)
        el!.style.transform = `scale(${1 - (1 - 0.04) * ep})`

        const fadeElapsed = elapsed - fadeThreshold
        if (fadeElapsed > 0) {
          const fp = fadeElapsed / (T_LOGO_SHRINK * 0.15)
          el!.style.opacity = String(Math.max(0, 1 - fp))
        }

        if (p < 1) {
          rafRef.current = requestAnimationFrame(animateLogo)
        } else {
          setShowLogo(false)
        }
      }
      rafRef.current = requestAnimationFrame(animateLogo)
    }, logoAt + 50 + T_LOGO_IN + T_LOGO_HOLD)

    // Phase 3 — Crawl (starts ~150ms after logo fully shrinks)
    const crawlAt = logoAt + 50 + T_LOGO_IN + T_LOGO_HOLD + T_LOGO_SHRINK + 150

    schedule(() => setShowCrawl(true), crawlAt)

    schedule(() => {
      const stage = crawlStageRef.current
      if (!stage) return
      stage.style.transition = `opacity ${T_CRAWL_IN}ms ease`
      requestAnimationFrame(() => { if (stage) stage.style.opacity = '1' })
    }, crawlAt + 50)

    // Crawl scroll via RAF
    schedule(() => {
      const container = containerRef.current
      const track     = crawlTrackRef.current
      if (!container || !track) return

      const vh          = container.offsetHeight
      const trackH      = track.offsetHeight
      const startBottom = -(trackH + vh * 0.1)
      const endBottom   = vh * 1.8

      track.style.bottom = `${startBottom}px`

      const start = performance.now()
      function animateCrawl(now: number) {
        const elapsed = now - start
        const p       = Math.min(elapsed / T_CRAWL_DUR, 1)
        if (track) track.style.bottom = `${startBottom + (endBottom - startBottom) * p}px`
        if (p < 1) rafRef.current = requestAnimationFrame(animateCrawl)
      }
      rafRef.current = requestAnimationFrame(animateCrawl)
    }, crawlAt + 50 + T_CRAWL_IN + 50)

    return () => {
      timers.forEach(clearTimeout)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}
    >
      <style>{FONT_FACE_CSS}</style>

      {/* Starfield */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Phase 1 — Intro text */}
      <div
        ref={introRef}
        style={{
          position: 'absolute', inset: 0, zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT_DISPLAY,
          fontStyle: 'italic',
          fontSize: '15px', // cinematic fixed size — not a UI element
          color: INTRO_BLUE,
          opacity: 0,
        }}
      >
        A long time ago, in a galaxy far, far away….
      </div>

      {/* Phase 2 — STAR / WARS logo */}
      {showLogo && (
        <div
          ref={logoRef}
          style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'StarJediOutline'",
            fontSize: '88px', // cinematic fixed size — not a UI element
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
      )}

      {/* Phase 3 — Crawl stage */}
      {showCrawl && (
        <div
          ref={crawlStageRef}
          style={{ position: 'absolute', inset: 0, zIndex: 3, overflow: 'hidden', opacity: 0 }}
        >
          {/* Top fade — masks text as it disappears into the distance */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '38%',
            background: 'linear-gradient(to bottom, #000 25%, transparent)',
            zIndex: 2, pointerEvents: 'none',
          }} />

          {/* Perspective stage */}
          <div style={{
            position: 'absolute', inset: 0,
            perspective: '280px',
            perspectiveOrigin: '50% 18%',
          }}>
            {/* Crawl track — position animated by RAF */}
            <div
              ref={crawlTrackRef}
              style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%) rotateX(28deg)',
                transformOrigin: '50% 100%',
                width: '58%',
                textAlign: 'justify',
              }}
            >
              {/* Episode heading */}
              <div style={{
                fontFamily: FONT_BODY,
                fontSize: '13px', // cinematic fixed size — not a UI element
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                textAlign: 'center',
                color: CRAWL_GOLD,
                marginBottom: '1.5em',
              }}>
                {heading}
              </div>

              {/* Episode title */}
              <div style={{
                fontFamily: FONT_DISPLAY,
                fontSize: '21px', // cinematic fixed size — not a UI element
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
                fontFamily: FONT_DISPLAY,
                fontSize: '14px', // cinematic fixed size — not a UI element
                lineHeight: 1.85,
                color: CRAWL_GOLD,
                whiteSpace: 'pre-wrap',
              }}>
                {body}
              </div>
            </div>
          </div>

          {/* Bottom fade — masks text entering from below */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '18%',
            background: 'linear-gradient(to top, #000 40%, transparent)',
            zIndex: 2, pointerEvents: 'none',
          }} />
        </div>
      )}
    </div>
  )
}
