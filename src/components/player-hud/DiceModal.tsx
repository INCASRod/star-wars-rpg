'use client'

import { useEffect } from 'react'
import { C, SYM, DICE_META, FONT_CINZEL, FONT_RAJDHANI, type DiceType, type SymbolKey } from './design-tokens'
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
          fontFamily: FONT_RAJDHANI, fontWeight: 700,
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
  const label = die.symbols.length === 0 ? '—' : die.symbols.map(s => SYM[s]?.icon ?? s).join('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <DieShape type={die.type} size={44}>
        <span style={{ fontSize: 14 }}>{label}</span>
      </DieShape>
      <div style={{ fontSize: 12, color: C.textDim, fontFamily: FONT_RAJDHANI, textTransform: 'uppercase' }}>
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
      padding: '4px 12px', borderRadius: 4,
      background: `${color}18`, border: `1px solid ${color}50`,
      fontFamily: FONT_RAJDHANI, fontSize: 14, fontWeight: 700, color,
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onDismiss])

  const headlineColor = isSuccess ? '#4EC87A' : isFailure ? '#E05050' : '#C8AA50'
  const headlineText = isSuccess ? 'SUCCESS' : isFailure ? 'FAILURE' : 'WASH'

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(4,8,6,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560,
          background: 'rgba(6,13,9,0.96)',
          border: `1px solid ${C.borderHi}`,
          borderRadius: 8,
          boxShadow: `0 0 48px rgba(200,170,80,0.12), 0 8px 48px rgba(0,0,0,0.5)`,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 16px',
          borderBottom: `1px solid ${C.border}`,
          textAlign: 'center',
        }}>
          {skillName && (
            <div style={{
              fontFamily: FONT_RAJDHANI, fontSize: 14, fontWeight: 700,
              color: C.textDim, letterSpacing: '0.15em', textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              {skillName}
            </div>
          )}
          <div style={{
            fontFamily: FONT_CINZEL, fontSize: 34, fontWeight: 700,
            color: headlineColor, letterSpacing: '0.05em',
            textShadow: `0 0 24px ${headlineColor}80`,
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
            padding: 12, borderRadius: 6,
            background: 'rgba(112,200,232,0.08)',
            border: `1px solid rgba(112,200,232,0.2)`,
          }}>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 14, fontWeight: 700, color: '#70C8E8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
              Advantage Spending
            </div>
            {ADVANTAGE_HINTS.slice(0, Math.min(net.advantage + 1, ADVANTAGE_HINTS.length)).map((hint, i) => (
              <div key={i} style={{ fontFamily: FONT_RAJDHANI, fontSize: 14, color: C.textDim, lineHeight: 1.6, paddingLeft: 8 }}>
                • {hint}
              </div>
            ))}
          </div>
        )}

        {/* Threat hints */}
        {net.advantage < 0 && (
          <div style={{
            margin: '0 24px 16px',
            padding: 12, borderRadius: 6,
            background: 'rgba(176,96,208,0.08)',
            border: `1px solid rgba(176,96,208,0.2)`,
          }}>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 14, fontWeight: 700, color: '#B060D0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
              GM Threat Spending
            </div>
            {THREAT_HINTS.slice(0, Math.min(-net.advantage + 1, THREAT_HINTS.length)).map((hint, i) => (
              <div key={i} style={{ fontFamily: FONT_RAJDHANI, fontSize: 14, color: C.textDim, lineHeight: 1.6, paddingLeft: 8 }}>
                • {hint}
              </div>
            ))}
          </div>
        )}

        {/* Dismiss */}
        <div style={{ padding: '0 24px 24px', textAlign: 'center' }}>
          <button
            onClick={onDismiss}
            style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 4, padding: '8px 40px',
              fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 600,
              letterSpacing: '0.1em', color: C.textDim,
              cursor: 'pointer', transition: '.2s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = C.gold; (e.target as HTMLElement).style.color = C.gold }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = C.border; (e.target as HTMLElement).style.color = C.textDim }}
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  )
}
