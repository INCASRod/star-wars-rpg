'use client'

import type { ForceRollResult } from '@/lib/forceRoll'
import { rollForceDice } from '@/components/player-hud/dice-engine'
import { DiceFace } from '@/components/dice/DiceFace'
import { FS, HUD, FONT_DISPLAY, FONT_BODY, SP, EASE, RADIUS } from '@/lib/tokens'

// fallen/dark-side Force mechanic colours — pre-approved exception
const LIGHT_COLOR = '#E8E8FF'
const DARK_COLOR  = 'rgba(80,40,120,0.9)'  /* fallen/dark-side Force mechanic colour — pre-approved exception */
const DARK_BORDER = '#6060A0'               /* fallen/dark-side Force mechanic colour — pre-approved exception */

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
      width: 44, height: 44, borderRadius: 6, /* decorative die geometry — px intentional */
      background: 'color-mix(in srgb, var(--die-force) 6%, transparent)',
      border: `1.5px solid color-mix(in srgb, var(--die-force) 30%, transparent)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 3, flexShrink: 0, /* decorative die geometry — px intentional */
    }}>
      {empty && (
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint }}>—</span>
      )}
      {die.light > 0 && (
        <div style={{ display: 'flex', gap: 2 /* decorative die geometry — px intentional */ }}>
          {Array.from({ length: die.light }).map((_, i) => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: '50%', /* decorative die geometry — px intentional */
              background: LIGHT_COLOR, /* fallen/dark-side Force mechanic colour — pre-approved exception */
              boxShadow: `0 0 4px ${LIGHT_COLOR}80`,
            }} />
          ))}
        </div>
      )}
      {die.dark > 0 && (
        <div style={{ display: 'flex', gap: 2 /* decorative die geometry — px intentional */ }}>
          {Array.from({ length: die.dark }).map((_, i) => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: '50%', /* decorative die geometry — px intentional */
              background: DARK_COLOR, /* fallen/dark-side Force mechanic colour — pre-approved exception */
              border: `1px solid ${DARK_BORDER}`, /* fallen/dark-side Force mechanic colour — pre-approved exception */
            }} />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[5] }}>
      {/* Pool info */}
      <div>
        <div style={{
          fontFamily: FONT_BODY,
          fontSize: FS.overline,
          color: HUD.textDim,
          textTransform: 'uppercase', letterSpacing: '0.18em',
          marginBottom: SP[2],
        }}>
          Your Force Dice Pool
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginBottom: SP[3] }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.text }}>
            Force Rating: {forceRating}
          </div>
          {committedForce > 0 && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, fontStyle: 'italic' }}>
              ({committedForce} committed to ongoing effects)
            </div>
          )}
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.text }}>
            Available: {available}
          </div>
        </div>

        {/* Die icons */}
        <div style={{ display: 'flex', gap: SP[2], flexWrap: 'wrap' }}>
          {Array.from({ length: available }).map((_, i) => (
            <DiceFace key={i} type="force" size={36} active={false} />
          ))}
          {available === 0 && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textFaint, fontStyle: 'italic' }}>
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
            width: '100%',
            padding: `${SP[2]} 0`,
            borderRadius: RADIUS.md,
            background: available > 0
              ? 'color-mix(in srgb, var(--die-force) 14%, transparent)'
              : 'color-mix(in srgb, var(--die-force) 4%, transparent)',
            border: available > 0
              ? `1px solid color-mix(in srgb, var(--die-force) 40%, transparent)`
              : `1px solid color-mix(in srgb, var(--die-force) 18%, transparent)`,
            cursor: available > 0 ? 'pointer' : 'not-allowed',
            fontFamily: FONT_DISPLAY,
            fontSize: FS.sm,
            fontWeight: 700,
            color: available > 0 ? HUD.text : HUD.textFaint,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SP[2],
            transition: `background ${EASE.quick}, border-color ${EASE.quick}`,
          }}
        >
          <span>✦</span>
          {available === 0
            ? 'No Force Dice Available'
            : `Roll ${available} Force ${available === 1 ? 'Die' : 'Dice'}`}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: SP[3] }}>
          {/* Section label */}
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            Result
          </div>

          {/* Individual dice */}
          <div style={{ display: 'flex', gap: SP[2], flexWrap: 'wrap' }}>
            {result.dice.map((die, i) => <ForceDieFace key={i} die={die} />)}
          </div>

          {/* Totals — dark first for fallen characters */}
          <div style={{ display: 'flex', gap: SP[2], flexDirection: isFallen ? 'row-reverse' : 'row' }}>
            {/* Light pip block */}
            <div style={{
              flex: 1, textAlign: 'center', padding: `${SP[2]} ${SP[2]}`,
              background: 'color-mix(in srgb, var(--die-force) 8%, transparent)',
              border: `1px solid color-mix(in srgb, var(--die-force) 30%, transparent)`,
              borderRadius: RADIUS.md,
            }}>
              <div style={{ display: 'flex', gap: SP[1], justifyContent: 'center', marginBottom: SP[1], flexWrap: 'wrap' }}>
                {Array.from({ length: result.totalLight }).map((_, i) => (
                  <div key={i} style={{
                    width: '0.6875rem', height: '0.6875rem', /* pip dot — rem equivalent of 11px */
                    borderRadius: '50%',
                    background: isFallen
                      ? LIGHT_COLOR /* fallen: light pips are costly — pre-approved exception */
                      : 'color-mix(in srgb, var(--die-force) 80%, transparent)',
                    boxShadow: isFallen
                      ? `0 0 4px ${LIGHT_COLOR}`
                      : `0 0 4px color-mix(in srgb, var(--die-force) 50%, transparent)`,
                  }} />
                ))}
                {result.totalLight === 0 && (
                  <span style={{ fontFamily: FONT_BODY, color: 'color-mix(in srgb, var(--die-force) 20%, transparent)', fontSize: FS.caption }}>—</span>
                )}
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: isFallen ? LIGHT_COLOR : 'var(--die-force)', lineHeight: 1 }}>
                {result.totalLight}
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `color-mix(in srgb, var(--die-force) 50%, transparent)`, marginTop: SP[1] }}>
                Light ○{isFallen ? ' (cost)' : ''}
              </div>
            </div>

            {/* Dark pip block */}
            <div style={{
              flex: 1, textAlign: 'center', padding: `${SP[2]} ${SP[2]}`,
              background: isFallen
                ? 'rgba(139,43,226,0.1)' /* fallen/dark-side Force mechanic colour — pre-approved exception */
                : 'color-mix(in srgb, var(--state-activated) 6%, transparent)',
              border: isFallen
                ? `1px solid rgba(139,43,226,0.35)` /* fallen/dark-side Force mechanic colour — pre-approved exception */
                : `1px solid color-mix(in srgb, var(--state-activated) 25%, transparent)`,
              borderRadius: RADIUS.md,
            }}>
              <div style={{ display: 'flex', gap: SP[1], justifyContent: 'center', marginBottom: SP[1], flexWrap: 'wrap' }}>
                {Array.from({ length: result.totalDark }).map((_, i) => (
                  <div key={i} style={{
                    width: '0.6875rem', height: '0.6875rem', /* pip dot — rem equivalent of 11px */
                    borderRadius: '50%',
                    background: isFallen
                      ? '#8B2BE2' /* fallen/dark-side Force mechanic colour — pre-approved exception */
                      : 'color-mix(in srgb, var(--state-activated) 80%, transparent)',
                    border: isFallen
                      ? `1px solid rgba(139,43,226,0.8)` /* fallen/dark-side Force mechanic colour — pre-approved exception */
                      : `1px solid color-mix(in srgb, var(--state-activated) 50%, transparent)`,
                  }} />
                ))}
                {result.totalDark === 0 && (
                  <span style={{ fontFamily: FONT_BODY, color: isFallen ? 'rgba(139,43,226,0.3)' /* fallen — pre-approved exception */ : 'color-mix(in srgb, var(--state-activated) 20%, transparent)', fontSize: FS.caption }}>—</span>
                )}
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: isFallen ? '#8B2BE2' /* fallen — pre-approved exception */ : DARK_BORDER, lineHeight: 1 }}>
                {result.totalDark}
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isFallen ? 'rgba(139,43,226,0.7)' /* fallen — pre-approved exception */ : 'color-mix(in srgb, var(--state-activated) 60%, transparent)', marginTop: SP[1] }}>
                Dark ●{isFallen ? ' (free)' : ''}
              </div>
            </div>
          </div>

          {/* Zero warning — inverted for fallen characters */}
          {!isFallen && result.totalLight === 0 && (
            <div style={{ padding: `${SP[2]} ${SP[3]}`, background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', borderRadius: RADIUS.md }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-dim)', lineHeight: 1.45 }}>
                ⚠ No light side Force Points generated. The power activates but has no effect. You may still use dark side pips.
              </div>
            </div>
          )}
          {isFallen && result.totalDark === 0 && (
            <div style={{ padding: `${SP[2]} ${SP[3]}`, background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', borderRadius: RADIUS.md }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-dim)', lineHeight: 1.45 }}>
                ⚠ No dark side Force Points generated. The power activates but has no effect. You may still use light side pips.
              </div>
            </div>
          )}

          {/* Consequence warning */}
          {!isFallen && result.totalDark > 0 && !isDathomiri && (
            <div style={{ padding: `${SP[2]} ${SP[3]}`, background: 'rgba(224,58,30,0.07)', border: '1px solid rgba(224,58,30,0.22)', borderRadius: RADIUS.md }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'rgba(224,58,30,0.85)', fontStyle: 'italic', lineHeight: 1.45 }}>
                ⚠ Dark side Force Points available. Using them has consequences. See next step.
              </div>
            </div>
          )}
          {isFallen && result.totalLight > 0 && (
            <div style={{ padding: `${SP[2]} ${SP[3]}`, background: 'color-mix(in srgb, var(--die-force) 5%, transparent)', border: `1px solid color-mix(in srgb, var(--die-force) 20%, transparent)`, borderRadius: RADIUS.md }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'color-mix(in srgb, var(--die-force) 70%, transparent)', fontStyle: 'italic', lineHeight: 1.45 }}>
                ✦ Light side Force Points available. Using them costs Destiny + strain. See next step.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
