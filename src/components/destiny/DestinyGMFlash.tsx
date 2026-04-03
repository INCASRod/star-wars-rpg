'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// ── Design tokens ─────────────────────────────────────────────────────────────
const FONT_C    = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono','Courier New',monospace"
const DARK_CLR  = '#8B2BE2'
const LIGHT_CLR = '#7EC8E3'
const TEXT      = 'rgba(232,223,200,0.85)'
const DIM       = '#6A8070'
const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'
const FS_LABEL  = 'var(--text-label)'
const FS_SM     = 'var(--text-sm)'
const FS_H4     = 'var(--text-h4)'

interface DestinyGMFlashProps {
  /** Pool counts BEFORE the spend */
  prevLightCount: number
  prevDarkCount:  number
  /** Pool counts AFTER the spend */
  newLightCount:  number
  newDarkCount:   number
  onDismiss:      () => void
}

export function DestinyGMFlash({
  prevLightCount, prevDarkCount,
  newLightCount, newDarkCount,
  onDismiss,
}: DestinyGMFlashProps) {
  const [flashOpacity,  setFlashOpacity]  = useState(1)
  const [bannerVisible, setBannerVisible] = useState(false)
  const [bannerOut,     setBannerOut]     = useState(false)

  useEffect(() => {
    // Flash: fade out quickly
    const t1 = setTimeout(() => setFlashOpacity(0), 50)
    // Banner: slide in
    const t2 = setTimeout(() => setBannerVisible(true), 80)
    // Auto-dismiss after 4 seconds
    const t3 = setTimeout(() => {
      setBannerOut(true)
      setTimeout(onDismiss, 350)
    }, 4000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const TokenDots = ({ count, color }: { count: number; color: string }) => (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
        <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: `${color}50`, border: `1.5px solid ${color}` }} />
      ))}
      {count > 6 && <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color }}>+{count - 6}</span>}
      {count === 0 && <span style={{ fontFamily: FONT_M, fontSize: FS_CAP, color: DIM }}>—</span>}
    </span>
  )

  const content = (
    <>
      {/* Purple flash overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 990,
          background: 'rgba(139,43,226,0.18)',
          pointerEvents: 'none',
          opacity: flashOpacity,
          transition: 'opacity 600ms ease-out',
        }}
      />

      {/* Banner */}
      <div
        onClick={onDismiss}
        style={{
          position: 'fixed', top: 0, left: '50%', zIndex: 991,
          transform: `translateX(-50%) translateY(${bannerVisible && !bannerOut ? '0' : '-110%'})`,
          transition: 'transform 300ms ease-out, opacity 300ms ease-out',
          opacity: bannerOut ? 0 : 1,
          background: 'rgba(139,43,226,0.14)',
          border: `1px solid rgba(139,43,226,0.55)`,
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          padding: 'clamp(12px, 2vh, 18px) clamp(20px, 3vw, 32px)',
          boxShadow: '0 8px 32px rgba(139,43,226,0.3)',
          cursor: 'pointer',
          minWidth: 'clamp(260px, 50vw, 420px)',
          textAlign: 'center',
        }}
      >
        {/* Title */}
        <div style={{
          fontFamily: FONT_C, fontSize: FS_H4, fontWeight: 700,
          color: DARK_CLR, letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          ⚡ GM Has Used a Destiny Point!
        </div>

        {/* Pool before → after */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <span style={{ fontFamily: FONT_R, fontSize: FS_LABEL, color: DARK_CLR, fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
              Dark Side:
            </span>
            <TokenDots count={prevDarkCount}  color={DARK_CLR} />
            <span style={{ fontFamily: FONT_M, fontSize: FS_CAP, color: DIM }}>→</span>
            <TokenDots count={newDarkCount}   color={DARK_CLR} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <span style={{ fontFamily: FONT_R, fontSize: FS_LABEL, color: LIGHT_CLR, fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
              Light Side:
            </span>
            <TokenDots count={prevLightCount} color={LIGHT_CLR} />
            <span style={{ fontFamily: FONT_M, fontSize: FS_CAP, color: DIM }}>→</span>
            <TokenDots count={newLightCount}  color={LIGHT_CLR} />
          </div>
        </div>

        <div style={{ fontFamily: FONT_R, fontSize: FS_CAP, color: 'rgba(139,43,226,0.6)', marginTop: 10, letterSpacing: '0.06em' }}>
          Tap to dismiss
        </div>
      </div>
    </>
  )

  if (typeof window === 'undefined') return null
  return createPortal(content, document.body)
}

// ── Considering banner — shown to other players ───────────────────────────────
interface DestinyConsideringBannerProps {
  characterName: string
  onDismiss: () => void
}

export function DestinyConsideringBanner({ characterName, onDismiss }: DestinyConsideringBannerProps) {
  const [visible, setVisible] = useState(false)
  const [out,     setOut]     = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 30)
    const t2 = setTimeout(() => { setOut(true); setTimeout(onDismiss, 350) }, 10000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const banner = (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
      background: 'rgba(126,200,227,0.07)',
      borderBottom: '1px solid rgba(126,200,227,0.22)',
      padding: 'clamp(6px, 1vh, 10px) clamp(12px, 2vw, 20px)',
      transform: `translateY(${visible && !out ? '0' : '-100%'})`,
      transition: 'transform 300ms ease-out, opacity 300ms ease-out',
      opacity: out ? 0 : 1,
      textAlign: 'center',
    }}>
      <span style={{ fontFamily: FONT_R, fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)', color: 'rgba(232,223,200,0.72)', fontStyle: 'italic', letterSpacing: '0.04em' }}>
        ⚠ {characterName} is considering spending a Destiny Point
      </span>
    </div>
  )

  if (typeof window === 'undefined') return null
  return createPortal(banner, document.body)
}
