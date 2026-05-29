'use client'

import { HUD, FONT_DISPLAY, FONT_BODY, FS, RADIUS, EASE, SYM, DICE_META, type DiceType, type SymbolKey } from '@/lib/tokens'
import { Modal } from '@/components/ui/Modal'
import { DiceFace } from '@/components/dice/DiceFace'
import type { RollResult, DieResult } from './dice-engine'

const ADVANTAGE_HINTS = [
  'Recover 1 strain',
  'Add a Boost die to an ally\'s next check',
  'Notice a useful detail in the environment',
  'Grant an ally an out-of-turn incidental',
  'Create an advantageous opportunity for next round',
]
const THREAT_HINTS = [
  'Impose a Setback die on the next allied check',
  'Lose a free maneuver this turn',
  'Enemy may immediately make an out-of-turn incidental',
  'Suffer 1 strain',
  'The situation deteriorates — GM decides how',
]

// Render a dice shape using SVG DiceFace with optional content overlay
function DieShape({ type, size, children }: {
  type: DiceType
  size: number
  children?: React.ReactNode
}) {
  const color = DICE_META[type].color
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <DiceFace type={type} size={size} />
      {children && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.28, color,
          fontFamily: FONT_BODY, fontWeight: 700,
          pointerEvents: 'none',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

function DieChip({ die }: { die: DieResult }) {
  const meta = DICE_META[die.type]
  const symbolKeys = die.symbols.filter(s => s in SYM) as SymbolKey[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <DieShape type={die.type} size={44}>
        {symbolKeys.length === 0
          ? <span style={{ fontSize: 14 }}>—</span>
          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              {symbolKeys.map((s, i) => <i key={i} className={`ffi ffi-${SYM[s].icon}`} style={{ fontSize: 13 }} />)}
            </span>
        }
      </DieShape>
      <div style={{ fontSize: FS.caption, color: HUD.textDim, fontFamily: FONT_BODY, textTransform: 'uppercase' }}>
        {meta.label}
      </div>
    </div>
  )
}

function NetPill({ count, symKey, label }: { count: number; symKey: SymbolKey; label: string }) {
  if (count === 0) return null
  const { icon, color } = SYM[symKey]
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: RADIUS.md,
      background: `${color}18`, border: `1px solid ${color}50`,
      fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color,
    }}>
      <i className={`ffi ffi-${icon}`} style={{ fontSize: 16 }} />
      {Math.abs(count)} {label}
    </div>
  )
}

interface DiceModalProps {
  result: RollResult
  skillName?: string
  onDismiss: () => void
}

export function DiceModal({ result, skillName, onDismiss }: DiceModalProps) {
  const { net, dice } = result
  const isSuccess = net.success > 0
  const isFailure = net.success < 0
  const netSuccess = Math.abs(net.success)
  const netAdvantage = Math.abs(net.advantage)

  // Dynamic — value changes based on JS state — kept as inline style with CSS vars
  const headlineColor = isSuccess ? 'var(--state-success)' : isFailure ? 'var(--state-failure)' : 'var(--hud-gold)'
  const headlineText = isSuccess ? 'SUCCESS' : isFailure ? 'FAILURE' : 'WASH'

  return (
    <Modal
      open
      onClose={onDismiss}
      maxWidth={560}
      shadow="0 8px 48px rgba(0,0,0,0.5)"
    >
        {/* Header */}
        <div style={{
          padding: '24px 24px 16px',
          borderBottom: `1px solid ${HUD.border}`,
          textAlign: 'center',
        }}>
          {skillName && (
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700,
              color: HUD.textDim, letterSpacing: '0.15em', textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              {skillName}
            </div>
          )}
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.h1, fontWeight: 700,
            color: headlineColor, letterSpacing: '0.05em',
            textShadow: `0 0 24px color-mix(in srgb, ${headlineColor} 50%, transparent)`,
            lineHeight: 1,
          }}>
            {headlineText}
          </div>

          {/* Net result pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            {net.success > 0 && <NetPill count={netSuccess} symKey="S" label={netSuccess === 1 ? 'Success' : 'Successes'} />}
            {net.success < 0 && <NetPill count={netSuccess} symKey="F" label={netSuccess === 1 ? 'Failure' : 'Failures'} />}
            {net.advantage > 0 && <NetPill count={netAdvantage} symKey="A" label={netAdvantage === 1 ? 'Advantage' : 'Advantages'} />}
            {net.advantage < 0 && <NetPill count={netAdvantage} symKey="H" label={netAdvantage === 1 ? 'Threat' : 'Threats'} />}
            {net.triumph > 0 && <NetPill count={net.triumph} symKey="T" label={net.triumph === 1 ? 'Triumph' : 'Triumphs'} />}
            {net.despair > 0 && <NetPill count={net.despair} symKey="D" label={net.despair === 1 ? 'Despair' : 'Despairs'} />}
          </div>
        </div>

        {/* Individual dice */}
        <div style={{ padding: '16px 24px' }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center',
          }}>
            {dice.map((die, i) => <DieChip key={i} die={die} />)}
          </div>
        </div>

        {/* Advantage hints */}
        {net.advantage > 0 && (
          <div style={{
            margin: '0 24px 16px',
            padding: 12, borderRadius: RADIUS.lg,
            background: 'color-mix(in srgb, var(--die-advantage) 8%, transparent)',
            border: `1px solid color-mix(in srgb, var(--die-advantage) 20%, transparent)`,
          }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: 'var(--die-advantage)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
              Advantage Spending
            </div>
            {ADVANTAGE_HINTS.slice(0, Math.min(net.advantage + 1, ADVANTAGE_HINTS.length)).map((hint, i) => (
              <div key={i} style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, lineHeight: 1.6, paddingLeft: 8 }}>
                • {hint}
              </div>
            ))}
          </div>
        )}

        {/* Threat hints */}
        {net.advantage < 0 && (
          <div style={{
            margin: '0 24px 16px',
            padding: 12, borderRadius: RADIUS.lg,
            background: 'color-mix(in srgb, var(--die-threat) 8%, transparent)',
            border: `1px solid color-mix(in srgb, var(--die-threat) 20%, transparent)`,
          }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: 'var(--die-threat)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
              GM Threat Spending
            </div>
            {THREAT_HINTS.slice(0, Math.min(-net.advantage + 1, THREAT_HINTS.length)).map((hint, i) => (
              <div key={i} style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, lineHeight: 1.6, paddingLeft: 8 }}>
                • {hint}
              </div>
            ))}
          </div>
        )}

        {/* Dismiss */}
        <div style={{ padding: '0 24px 24px', textAlign: 'center' }}>
          <button
            onClick={onDismiss}
            className="hov-gold"
            style={{
              background: 'transparent',
              border: `1px solid ${HUD.border}`,
              borderRadius: RADIUS.md, padding: '8px 40px',
              fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 600,
              letterSpacing: '0.1em', color: HUD.textDim,
              cursor: 'pointer',
            }}
          >
            DISMISS
          </button>
        </div>
    </Modal>
  )
}
