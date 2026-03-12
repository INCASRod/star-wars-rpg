'use client'

import { useEffect } from 'react'
import { C, FONT_CINZEL, FONT_RAJDHANI } from './design-tokens'
import type { ForceRollResult, ForceDie } from './dice-engine'

const FORCE_BLUE  = '#5AAAE0'
const LIGHT_COLOR = '#E8E8FF'
const DARK_COLOR  = '#1a1a2e'
const DARK_BORDER = '#6060A0'

// A single force die face showing ○ and ● pips
function ForceDieFace({ die }: { die: ForceDie }) {
  const isEmpty = die.light === 0 && die.dark === 0
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      background: 'rgba(90,170,224,0.08)',
      border: `2px solid ${FORCE_BLUE}60`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 3, flexShrink: 0,
      boxShadow: `0 0 8px ${FORCE_BLUE}20`,
    }}>
      {isEmpty && (
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 16, color: `${FORCE_BLUE}40` }}>—</span>
      )}
      {die.light > 0 && (
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: die.light }).map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: LIGHT_COLOR, border: `1px solid ${LIGHT_COLOR}`,
              boxShadow: `0 0 4px ${LIGHT_COLOR}`,
            }} />
          ))}
        </div>
      )}
      {die.dark > 0 && (
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: die.dark }).map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: DARK_COLOR, border: `1px solid ${DARK_BORDER}`,
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

interface ForceRollModalProps {
  result:      ForceRollResult
  forceRating: number
  onDismiss:   () => void
}

export function ForceRollModal({ result, forceRating, onDismiss }: ForceRollModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onDismiss])

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(4,8,6,0.88)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: 'rgba(6,13,9,0.97)',
          border: `1px solid ${FORCE_BLUE}50`,
          borderRadius: 8,
          boxShadow: `0 0 48px ${FORCE_BLUE}18, 0 8px 48px rgba(0,0,0,0.5)`,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 14px', borderBottom: `1px solid ${C.border}`,
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: `${FORCE_BLUE}90`, marginBottom: 6,
          }}>
            Force Rating {forceRating} — {forceRating} {forceRating === 1 ? 'Die' : 'Dice'}
          </div>
          <div style={{
            fontFamily: FONT_CINZEL, fontSize: 28, fontWeight: 700,
            color: FORCE_BLUE, letterSpacing: '0.06em', lineHeight: 1,
            textShadow: `0 0 24px ${FORCE_BLUE}60`,
          }}>
            Force Roll
          </div>
        </div>

        {/* Dice row */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {result.dice.map((die, i) => <ForceDieFace key={i} die={die} />)}
          </div>
        </div>

        {/* Totals */}
        <div style={{
          padding: '16px 24px', display: 'flex', gap: 12, justifyContent: 'center',
        }}>
          {/* Light side total */}
          <div style={{
            flex: 1, textAlign: 'center',
            background: `${LIGHT_COLOR}0A`, border: `1px solid ${LIGHT_COLOR}30`,
            borderRadius: 6, padding: '12px 8px',
          }}>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              {Array.from({ length: result.totalLight }).map((_, i) => (
                <div key={i} style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: LIGHT_COLOR, boxShadow: `0 0 6px ${LIGHT_COLOR}`,
                }} />
              ))}
              {result.totalLight === 0 && (
                <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 14, color: `${LIGHT_COLOR}30` }}>—</span>
              )}
            </div>
            <div style={{ fontFamily: FONT_CINZEL, fontSize: 24, fontWeight: 700, color: LIGHT_COLOR, lineHeight: 1 }}>
              {result.totalLight}
            </div>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${LIGHT_COLOR}70`, marginTop: 4 }}>
              Light Side ○
            </div>
          </div>

          {/* Dark side total */}
          <div style={{
            flex: 1, textAlign: 'center',
            background: `${DARK_BORDER}0A`, border: `1px solid ${DARK_BORDER}40`,
            borderRadius: 6, padding: '12px 8px',
          }}>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              {Array.from({ length: result.totalDark }).map((_, i) => (
                <div key={i} style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: DARK_COLOR, border: `1px solid ${DARK_BORDER}`,
                }} />
              ))}
              {result.totalDark === 0 && (
                <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 14, color: `${DARK_BORDER}50` }}>—</span>
              )}
            </div>
            <div style={{ fontFamily: FONT_CINZEL, fontSize: 24, fontWeight: 700, color: DARK_BORDER, lineHeight: 1 }}>
              {result.totalDark}
            </div>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${DARK_BORDER}80`, marginTop: 4 }}>
              Dark Side ●
            </div>
          </div>
        </div>

        {/* Context hint */}
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{
            background: `${FORCE_BLUE}08`, border: `1px solid ${FORCE_BLUE}20`,
            borderRadius: 4, padding: '8px 12px',
            fontFamily: FONT_RAJDHANI, fontSize: 12, color: `${FORCE_BLUE}90`, lineHeight: 1.5,
          }}>
            Use ○ Light or ● Dark points to activate force power abilities. Unspent points are lost at end of turn.
          </div>
        </div>

        {/* Dismiss */}
        <div style={{ padding: '0 24px 20px', textAlign: 'center' }}>
          <button
            onClick={onDismiss}
            style={{
              background: 'transparent', border: `1px solid ${C.border}`,
              borderRadius: 4, padding: '8px 40px',
              fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 600,
              letterSpacing: '0.1em', color: C.textDim, cursor: 'pointer', transition: '.2s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = FORCE_BLUE; (e.target as HTMLElement).style.color = FORCE_BLUE }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = C.border; (e.target as HTMLElement).style.color = C.textDim }}
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  )
}
