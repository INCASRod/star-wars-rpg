'use client'

import type { ForceRollResult } from '@/lib/forceRoll'
import { rollForceDice } from '@/components/player-hud/dice-engine'
import { DiceFace } from '@/components/dice/DiceFace'

const FONT_C = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M = "'Share Tech Mono', 'Courier New', monospace"
const FORCE_BLUE     = '#7EC8E3'
const FORCE_BLUE_DIM = 'rgba(126,200,227,0.35)'
const LIGHT_COLOR    = '#E8E8FF'
const DARK_COLOR     = 'rgba(80,40,120,0.9)'
const DARK_BORDER    = '#6060A0'

interface RollForceDiceStepProps {
  forceRating:     number
  committedForce:  number
  result:          ForceRollResult | null
  isDathomiri:     boolean
  /** When true, dark pips are free and light pips carry the consequence cost. */
  isFallen?:       boolean
  onRoll:          (result: ForceRollResult) => void
}

function ForceDieFace({ die }: { die: { light: number; dark: number } }) {
  const empty = die.light === 0 && die.dark === 0
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 6,
      background: 'rgba(126,200,227,0.06)',
      border: `1.5px solid rgba(126,200,227,0.3)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 3, flexShrink: 0,
    }}>
      {empty && (
        <span style={{ fontFamily: FONT_R, fontSize: 'clamp(0.72rem,1.1vw,0.85rem)', color: 'rgba(126,200,227,0.25)' }}>—</span>
      )}
      {die.light > 0 && (
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: die.light }).map((_, i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: LIGHT_COLOR, boxShadow: `0 0 4px ${LIGHT_COLOR}80` }} />
          ))}
        </div>
      )}
      {die.dark > 0 && (
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: die.dark }).map((_, i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: DARK_COLOR, border: `1px solid ${DARK_BORDER}` }} />
          ))}
        </div>
      )}
    </div>
  )
}

export function RollForceDiceStep({
  forceRating, committedForce, result, isDathomiri, isFallen = false, onRoll,
}: RollForceDiceStepProps) {
  const available = Math.max(0, forceRating - committedForce)

  function handleRoll() {
    onRoll(rollForceDice(available))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Pool info */}
      <div>
        <div style={{
          fontFamily: FONT_M,
          fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)',
          color: 'rgba(126,200,227,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.18em',
          marginBottom: 10,
        }}>
          Your Force Dice Pool
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
          <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)', color: 'rgba(126,200,227,0.6)' }}>
            Force Rating: {forceRating}
          </div>
          {committedForce > 0 && (
            <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', color: 'rgba(126,200,227,0.4)', fontStyle: 'italic' }}>
              ({committedForce} committed to ongoing effects)
            </div>
          )}
          <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)', color: FORCE_BLUE }}>
            Available: {available}
          </div>
        </div>

        {/* Die icons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Array.from({ length: available }).map((_, i) => (
            <DiceFace key={i} type="force" size={36} active={false} />
          ))}
          {available === 0 && (
            <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)', color: 'rgba(126,200,227,0.35)', fontStyle: 'italic' }}>
              No Force dice available
            </div>
          )}
        </div>
      </div>

      {/* Roll button / result */}
      {result === null ? (
        <button
          onClick={handleRoll}
          disabled={available === 0}
          style={{
            width: '100%', height: 52, borderRadius: 10,
            background: available > 0
              ? 'linear-gradient(135deg, rgba(126,200,227,0.3), rgba(126,200,227,0.15))'
              : 'rgba(126,200,227,0.05)',
            border: `1px solid ${available > 0 ? 'rgba(126,200,227,0.6)' : FORCE_BLUE_DIM}`,
            cursor: available > 0 ? 'pointer' : 'not-allowed',
            fontFamily: FONT_C,
            fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
            fontWeight: 700,
            color: available > 0 ? FORCE_BLUE : 'rgba(126,200,227,0.3)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'all .15s',
          }}
        >
          <span>✦</span>
          Roll {available} Force {available === 1 ? 'Die' : 'Dice'}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Section label */}
          <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)', color: 'rgba(126,200,227,0.55)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            Result
          </div>

          {/* Individual dice */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {result.dice.map((die, i) => <ForceDieFace key={i} die={die} />)}
          </div>

          {/* Totals — dark first for fallen characters */}
          <div style={{ display: 'flex', gap: 10, flexDirection: isFallen ? 'row-reverse' : 'row' }}>
            {/* Light pip block */}
            <div style={{
              flex: 1, textAlign: 'center', padding: '10px 8px',
              background: isFallen ? 'rgba(126,200,227,0.04)' : 'rgba(232,232,255,0.05)',
              border: `1px solid ${isFallen ? 'rgba(126,200,227,0.2)' : 'rgba(232,232,255,0.15)'}`,
              borderRadius: 6,
            }}>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                {Array.from({ length: result.totalLight }).map((_, i) => (
                  <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: LIGHT_COLOR, boxShadow: `0 0 4px ${LIGHT_COLOR}` }} />
                ))}
                {result.totalLight === 0 && <span style={{ fontFamily: FONT_R, color: 'rgba(232,232,255,0.2)', fontSize: 'clamp(0.72rem,1.1vw,0.85rem)' }}>—</span>}
              </div>
              <div style={{ fontFamily: FONT_C, fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)', fontWeight: 700, color: LIGHT_COLOR, lineHeight: 1 }}>{result.totalLight}</div>
              <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isFallen ? 'rgba(126,200,227,0.5)' : 'rgba(232,232,255,0.5)', marginTop: 3 }}>
                Light ○{isFallen ? ' (cost)' : ''}
              </div>
            </div>
            {/* Dark pip block */}
            <div style={{
              flex: 1, textAlign: 'center', padding: '10px 8px',
              background: isFallen ? 'rgba(139,43,226,0.1)' : 'rgba(96,96,160,0.08)',
              border: `1px solid ${isFallen ? 'rgba(139,43,226,0.35)' : 'rgba(96,96,160,0.25)'}`,
              borderRadius: 6,
            }}>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                {Array.from({ length: result.totalDark }).map((_, i) => (
                  <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: DARK_COLOR, border: `1px solid ${DARK_BORDER}` }} />
                ))}
                {result.totalDark === 0 && <span style={{ fontFamily: FONT_R, color: 'rgba(96,96,160,0.3)', fontSize: 'clamp(0.72rem,1.1vw,0.85rem)' }}>—</span>}
              </div>
              <div style={{ fontFamily: FONT_C, fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)', fontWeight: 700, color: isFallen ? '#8B2BE2' : DARK_BORDER, lineHeight: 1 }}>{result.totalDark}</div>
              <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isFallen ? 'rgba(139,43,226,0.7)' : 'rgba(96,96,160,0.6)', marginTop: 3 }}>
                Dark ●{isFallen ? ' (free)' : ''}
              </div>
            </div>
          </div>

          {/* Zero warning — inverted for fallen characters */}
          {!isFallen && result.totalLight === 0 && (
            <div style={{ padding: '8px 12px', background: 'rgba(200,170,80,0.06)', border: '1px solid rgba(200,170,80,0.2)', borderRadius: 6 }}>
              <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', color: 'rgba(200,170,80,0.7)', lineHeight: 1.45 }}>
                ⚠ No light side Force Points generated. The power activates but has no effect. You may still use dark side pips.
              </div>
            </div>
          )}
          {isFallen && result.totalDark === 0 && (
            <div style={{ padding: '8px 12px', background: 'rgba(200,170,80,0.06)', border: '1px solid rgba(200,170,80,0.2)', borderRadius: 6 }}>
              <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', color: 'rgba(200,170,80,0.7)', lineHeight: 1.45 }}>
                ⚠ No dark side Force Points generated. The power activates but has no effect. You may still use light side pips.
              </div>
            </div>
          )}

          {/* Consequence warning */}
          {!isFallen && result.totalDark > 0 && !isDathomiri && (
            <div style={{ padding: '8px 12px', background: 'rgba(224,82,82,0.07)', border: '1px solid rgba(224,82,82,0.22)', borderRadius: 6 }}>
              <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', color: 'rgba(224,82,82,0.8)', fontStyle: 'italic', lineHeight: 1.45 }}>
                ⚠ Dark side Force Points available. Using them has consequences. See next step.
              </div>
            </div>
          )}
          {isFallen && result.totalLight > 0 && (
            <div style={{ padding: '8px 12px', background: 'rgba(126,200,227,0.05)', border: '1px solid rgba(126,200,227,0.2)', borderRadius: 6 }}>
              <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', color: 'rgba(126,200,227,0.7)', fontStyle: 'italic', lineHeight: 1.45 }}>
                ✦ Light side Force Points available. Using them costs Destiny + strain. See next step.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
