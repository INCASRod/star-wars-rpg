'use client'

import type { ForceRollResult } from '@/lib/forceRoll'
import type { TargetEntry } from './ForceTargetStep'
import { stripBBCode } from '@/lib/utils'
import { FS, HUD, FONT_DISPLAY, FONT_BODY } from '@/lib/tokens'

// pip identity colours — pre-approved Force mechanic exceptions
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
      <div style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: HUD.textFaint, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.text }}>
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
      <div style={{ textAlign: 'center', paddingBottom: 12, borderBottom: '1px solid color-mix(in srgb, var(--hud-accent-purple) 15%, transparent)' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: HUD.text, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          ✦ Force Power Activated
        </div>
      </div>

      {/* Summary fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 14px', background: 'color-mix(in srgb, var(--hud-accent-purple) 4%, transparent)', border: '1px solid color-mix(in srgb, var(--hud-accent-purple) 12%, transparent)', borderRadius: 8 }}>
        <Field label="Power">{powerName}</Field>
        <Field label="Force Points">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {isFallen
              ? <PipRow light={0} dark={freePips} />
              : <PipRow light={freePips} dark={0} />
            }
            {costlyUsed > 0 && (
              <span style={{ color: 'color-mix(in srgb, var(--hud-accent-purple) 80%, transparent)', fontSize: FS.caption }}>
                + {isFallen
                  ? <PipRow light={costlyUsed} dark={0} />
                  : <PipRow light={0} dark={costlyUsed} />
                } {isFallen ? 'light' : 'dark'} used
              </span>
            )}
            <span style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: HUD.textFaint }}>
              ({totalFP} total FP)
            </span>
          </span>
        </Field>
        <Field label="Target(s)">{targetLabel}</Field>
      </div>

      {/* Power description */}
      {desc && (
        <div style={{ padding: '10px 12px', background: 'color-mix(in srgb, var(--hud-accent-purple) 3%, transparent)', border: '1px solid color-mix(in srgb, var(--hud-accent-purple) 10%, transparent)', borderRadius: 6 }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textDim, lineHeight: 1.55 }}>
            {desc}
          </div>
        </div>
      )}

      {/* Consequence reminder */}
      {costlyUsed > 0 && (
        <div style={{ padding: '8px 12px', background: 'color-mix(in srgb, var(--hud-accent-purple) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--hud-accent-purple) 22%, transparent)', borderRadius: 6 }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, lineHeight: 1.45 }}>
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
            background: 'color-mix(in srgb, var(--hud-accent-purple) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--hud-accent-purple) 30%, transparent)',
            fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: HUD.text,
            transition: 'all .15s',
          }}
        >
          ✦ Use Again
        </button>
        <button
          onClick={onDone}
          style={{
            flex: 1, height: 44, borderRadius: 8, cursor: 'pointer',
            background: 'rgba(224,58,30,0.12)',
            border: '1px solid rgba(224,58,30,0.4)',
            fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--hud-gold)',
            transition: 'all .15s',
          }}
        >
          Done
        </button>
      </div>
    </div>
  )
}
