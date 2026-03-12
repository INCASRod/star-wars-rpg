'use client'

import { useState, useEffect } from 'react'

const GOLD = '#C8AA50'
const BG   = '#060D09'

const STEPS = [
  'CONNECTING TO HOLONET…',
  'DECRYPTING IMPERIAL RECORDS…',
  'LOADING CHARACTER DATA…',
  'SYNCING FORCE POWERS…',
  'CALIBRATING DICE ENGINE…',
  'HOLOCRON READY…',
]

const STEP_DURATION = 1.8          // seconds per step
const TOTAL         = STEPS.length * STEP_DURATION   // 10.8 s

export function HolocronLoader() {
  const [pct,     setPct]     = useState(0)
  const [stepIdx, setStepIdx] = useState(0)

  useEffect(() => {
    const start   = Date.now()
    const totalMs = TOTAL * 1000

    const tick = setInterval(() => {
      const elapsed  = Date.now() - start
      const progress = Math.min(elapsed / totalMs, 1)
      setPct(Math.round(progress * 100))
      setStepIdx(Math.min(Math.floor(elapsed / (STEP_DURATION * 1000)), STEPS.length - 1))
      if (progress >= 1) clearInterval(tick)
    }, 80)

    return () => clearInterval(tick)
  }, [])

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: BG, gap: 32, position: 'relative', overflow: 'hidden',
    }}>

      {/* Hex grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l20 20M40 0L20 20M0 40l20-20M40 40L20 20' stroke='%23C8AA50' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
      }} />

      {/* Logo */}
      <div style={{
        fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
        fontSize: 28, fontWeight: 700, letterSpacing: '0.55em',
        color: GOLD, textTransform: 'uppercase',
        animation: 'holo-pulse 2.4s ease-in-out infinite',
      }}>
        HOLOCRON
      </div>

      {/* Progress bar + percentage */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 320 }}>

        {/* Track */}
        <div style={{
          width: '100%', height: 2,
          background: `${GOLD}18`, borderRadius: 2, overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Fill — driven by CSS animation so it stays smooth */}
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            background: `linear-gradient(90deg, ${GOLD}80, ${GOLD})`,
            borderRadius: 2,
            boxShadow: `0 0 10px ${GOLD}60`,
            animation: `holo-bar ${TOTAL}s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
          }} />
          {/* Shimmer */}
          <div style={{
            position: 'absolute', top: 0, left: '-60%', height: '100%', width: '60%',
            background: `linear-gradient(90deg, transparent, ${GOLD}50, transparent)`,
            animation: 'holo-shimmer 1.6s ease-in-out infinite',
          }} />
        </div>

        {/* Percentage — React-driven, always correct */}
        <div style={{
          fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
          fontSize: 16, fontWeight: 600, letterSpacing: '0.25em',
          color: `${GOLD}CC`,
          fontVariantNumeric: 'tabular-nums',
        }}>
          — {pct}% —
        </div>
      </div>

      {/* Status message — one at a time, React-driven */}
      <div key={stepIdx} style={{
        fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
        fontSize: 13, letterSpacing: '0.2em',
        color: `${GOLD}88`,
        textTransform: 'uppercase',
        height: 20,
        textAlign: 'center',
        animation: 'holo-fade 0.3s ease forwards',
      }}>
        {STEPS[stepIdx]}
      </div>

      <style>{`
        @keyframes holo-pulse {
          0%, 100% { opacity: 0.7; text-shadow: 0 0 12px ${GOLD}40; }
          50%       { opacity: 1;   text-shadow: 0 0 28px ${GOLD}90; }
        }
        @keyframes holo-bar {
          0%   { width: 0% }
          15%  { width: 22% }
          30%  { width: 40% }
          50%  { width: 58% }
          65%  { width: 72% }
          80%  { width: 84% }
          95%  { width: 94% }
          100% { width: 100% }
        }
        @keyframes holo-shimmer {
          0%   { left: -60% }
          100% { left: 110% }
        }
        @keyframes holo-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
