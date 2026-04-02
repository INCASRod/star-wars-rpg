'use client'

import type { ForceRollResult } from '@/lib/forceRoll'
import type { TargetEntry } from './ForceTargetStep'
import { stripBBCode } from '@/lib/utils'

const FONT_C = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M = "'Share Tech Mono', 'Courier New', monospace"
const FORCE_BLUE  = '#7EC8E3'
const LIGHT_COLOR = '#E8E8FF'
const DARK_COLOR  = 'rgba(80,40,120,0.9)'
const DARK_BORDER = '#6060A0'

interface ForceResolveStepProps {
  powerName:      string
  powerDesc?:     string
  forceRoll:      ForceRollResult
  darkPipsUsed:   number
  targets:        TargetEntry[]
  targetContext:  'environment' | 'character' | null
  isCombat:       boolean
  /** When true, dark pips are free and darkPipsUsed tracks light pips used. */
  isFallen?:      boolean
  onUseAgain:     () => void
  onDone:         () => void
}

function PipRow({ light, dark }: { light: number; dark: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {Array.from({ length: light }).map((_, i) => (
        <span key={`l${i}`} style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: LIGHT_COLOR, boxShadow: `0 0 4px ${LIGHT_COLOR}` }} />
      ))}
      {Array.from({ length: dark }).map((_, i) => (
        <span key={`d${i}`} style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: DARK_COLOR, border: `1px solid ${DARK_BORDER}` }} />
      ))}
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)', color: 'rgba(200,170,80,0.55)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)', color: 'rgba(232,223,200,0.9)' }}>
        {children}
      </div>
    </div>
  )
}

export function ForceResolveStep({
  powerName, powerDesc,
  forceRoll, darkPipsUsed,
  targets, targetContext, isCombat,
  isFallen = false,
  onUseAgain, onDone,
}: ForceResolveStepProps) {
  const desc = powerDesc ? stripBBCode(powerDesc) : ''
  const targetLabel = targets.length > 0
    ? targets.map(t => t.name).join(', ')
    : isCombat ? 'None selected' : (targetContext === 'environment' ? 'Environment' : 'No specific target')

  // For fallen: free FP = dark pips, costly FP = light pips used (darkPipsUsed tracks light used)
  const freePips   = isFallen ? forceRoll.totalDark  : forceRoll.totalLight
  const costlyUsed = darkPipsUsed  // same value — just renamed for clarity
  const totalFP    = freePips + costlyUsed
  const destinyFlip = isFallen ? 'dark → light' : 'light → dark'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', paddingBottom: 12, borderBottom: '1px solid rgba(126,200,227,0.15)' }}>
        <div style={{ fontFamily: FONT_C, fontSize: 'clamp(1rem, 1.6vw, 1.2rem)', fontWeight: 700, color: FORCE_BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', textShadow: '0 0 16px rgba(126,200,227,0.4)' }}>
          ✦ Force Power Activated
        </div>
      </div>

      {/* Summary fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 14px', background: 'rgba(126,200,227,0.04)', border: '1px solid rgba(126,200,227,0.12)', borderRadius: 8 }}>
        <Field label="Power">{powerName}</Field>
        <Field label="Force Points">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {isFallen
              ? <PipRow light={0} dark={freePips} />
              : <PipRow light={freePips} dark={0} />
            }
            {costlyUsed > 0 && (
              <span style={{ color: isFallen ? 'rgba(126,200,227,0.8)' : 'rgba(144,96,208,0.8)', fontSize: 'clamp(0.75rem,1.2vw,0.88rem)' }}>
                + {isFallen
                  ? <PipRow light={costlyUsed} dark={0} />
                  : <PipRow light={0} dark={costlyUsed} />
                } {isFallen ? 'light' : 'dark'} used
              </span>
            )}
            <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.62rem,0.95vw,0.72rem)', color: 'rgba(232,223,200,0.45)' }}>
              ({totalFP} total FP)
            </span>
          </span>
        </Field>
        <Field label="Target(s)">{targetLabel}</Field>
      </div>

      {/* Power description */}
      {desc && (
        <div style={{ padding: '10px 12px', background: 'rgba(126,200,227,0.03)', border: '1px solid rgba(126,200,227,0.1)', borderRadius: 6 }}>
          <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)', color: 'rgba(232,223,200,0.65)', lineHeight: 1.55 }}>
            {desc}
          </div>
        </div>
      )}

      {/* Consequence reminder */}
      {costlyUsed > 0 && (
        <div style={{ padding: '8px 12px', background: isFallen ? 'rgba(126,200,227,0.06)' : 'rgba(144,96,208,0.08)', border: `1px solid ${isFallen ? 'rgba(126,200,227,0.22)' : 'rgba(144,96,208,0.22)'}`, borderRadius: 6 }}>
          <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)', color: isFallen ? 'rgba(126,200,227,0.75)' : 'rgba(200,150,255,0.75)', lineHeight: 1.45 }}>
            Reminder: suffer {costlyUsed} strain and flip 1 Destiny Point {destinyFlip}.
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          onClick={onUseAgain}
          style={{
            flex: 1, height: 44, borderRadius: 8, cursor: 'pointer',
            background: 'rgba(126,200,227,0.08)',
            border: '1px solid rgba(126,200,227,0.3)',
            fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: FORCE_BLUE,
            transition: 'all .15s',
          }}
        >
          ✦ Use Again
        </button>
        <button
          onClick={onDone}
          style={{
            flex: 1, height: 44, borderRadius: 8, cursor: 'pointer',
            background: 'rgba(200,170,80,0.12)',
            border: '1px solid rgba(200,170,80,0.4)',
            fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C8AA50',
            transition: 'all .15s',
          }}
        >
          Done
        </button>
      </div>
    </div>
  )
}
