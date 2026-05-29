'use client'

import { HUD, FONT_DISPLAY, FONT_BODY, FS, RADIUS, EASE } from '@/lib/tokens'
import { Modal } from '@/components/ui/Modal'
import type { ForceRollResult, ForceDie } from './dice-engine'

// Force-die palette — using CSS vars so they theme-track correctly
const FORCE_BLUE  = 'var(--die-force)'
const LIGHT_COLOR = 'var(--die-forcepip)'
const DARK_COLOR  = 'var(--hud-bg)'
const DARK_BORDER = 'var(--hud-accent-purple)'

// A single force die face showing ○ and ● pips
function ForceDieFace({ die }: { die: ForceDie }) {
  const isEmpty = die.light === 0 && die.dark === 0
  return (
    <div style={{
      width: 48, height: 48, borderRadius: RADIUS.full,
      background: 'rgba(126,200,227,0.08)',
      border: `2px solid color-mix(in srgb, var(--die-force) 38%, transparent)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 3, flexShrink: 0,
      boxShadow: `0 0 8px color-mix(in srgb, var(--die-force) 12%, transparent)`,
    }}>
      {isEmpty && (
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: `color-mix(in srgb, var(--die-force) 25%, transparent)` }}>—</span>
      )}
      {die.light > 0 && (
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: die.light }).map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: RADIUS.full,
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
              width: 10, height: 10, borderRadius: RADIUS.full,
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
  return (
    <Modal
      open
      onClose={onDismiss}
      maxWidth={480}
      borderColor={`color-mix(in srgb, var(--die-force) 31%, transparent)`}
      shadow={`0 0 48px color-mix(in srgb, var(--die-force) 9%, transparent), 0 8px 48px rgba(0,0,0,0.5)`}
    >
        {/* Header */}
        <div style={{
          padding: '20px 24px 14px', borderBottom: `1px solid ${HUD.border}`,
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: `color-mix(in srgb, var(--die-force) 56%, transparent)`, marginBottom: 6,
          }}>
            Force Rating {forceRating} — {forceRating} {forceRating === 1 ? 'Die' : 'Dice'}
          </div>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.h2, fontWeight: 700,
            color: FORCE_BLUE, letterSpacing: '0.06em', lineHeight: 1,
            textShadow: `0 0 24px color-mix(in srgb, var(--die-force) 38%, transparent)`,
          }}>
            Force Roll
          </div>
        </div>

        {/* Dice row */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${HUD.border}` }}>
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
            background: `color-mix(in srgb, var(--die-forcepip) 4%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--die-forcepip) 19%, transparent)`,
            borderRadius: RADIUS.lg, padding: '12px 8px',
          }}>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              {Array.from({ length: result.totalLight }).map((_, i) => (
                <div key={i} style={{
                  width: 14, height: 14, borderRadius: RADIUS.full,
                  background: LIGHT_COLOR, boxShadow: `0 0 6px ${LIGHT_COLOR}`,
                }} />
              ))}
              {result.totalLight === 0 && (
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: `color-mix(in srgb, var(--die-forcepip) 19%, transparent)` }}>—</span>
              )}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700, color: LIGHT_COLOR, lineHeight: 1 }}>
              {result.totalLight}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: `color-mix(in srgb, var(--die-forcepip) 44%, transparent)`, marginTop: 4 }}>
              Light Side ○
            </div>
          </div>

          {/* Dark side total */}
          <div style={{
            flex: 1, textAlign: 'center',
            background: `color-mix(in srgb, var(--hud-accent-purple) 4%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--hud-accent-purple) 25%, transparent)`,
            borderRadius: RADIUS.lg, padding: '12px 8px',
          }}>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              {Array.from({ length: result.totalDark }).map((_, i) => (
                <div key={i} style={{
                  width: 14, height: 14, borderRadius: RADIUS.full,
                  background: DARK_COLOR, border: `1px solid ${DARK_BORDER}`,
                }} />
              ))}
              {result.totalDark === 0 && (
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: `color-mix(in srgb, var(--hud-accent-purple) 31%, transparent)` }}>—</span>
              )}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700, color: DARK_BORDER, lineHeight: 1 }}>
              {result.totalDark}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: `color-mix(in srgb, var(--hud-accent-purple) 50%, transparent)`, marginTop: 4 }}>
              Dark Side ●
            </div>
          </div>
        </div>

        {/* Context hint */}
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{
            background: `color-mix(in srgb, var(--die-force) 5%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--die-force) 12%, transparent)`,
            borderRadius: RADIUS.md, padding: '8px 12px',
            fontFamily: FONT_BODY, fontSize: FS.caption, color: `color-mix(in srgb, var(--die-force) 56%, transparent)`, lineHeight: 1.5,
          }}>
            Use ○ Light or ● Dark points to activate force power abilities. Unspent points are lost at end of turn.
          </div>
        </div>

        {/* Dismiss */}
        <div style={{ padding: '0 24px 20px', textAlign: 'center' }}>
          <button
            onClick={onDismiss}
            className="hov-gold"
            style={{
              background: 'transparent', border: `1px solid ${HUD.border}`,
              borderRadius: RADIUS.md, padding: '8px 40px',
              fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 600,
              letterSpacing: '0.1em', color: HUD.textDim, cursor: 'pointer',
            }}
          >
            DISMISS
          </button>
        </div>
    </Modal>
  )
}
