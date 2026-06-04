'use client'

import { FS, HUD, FONT_DISPLAY, FONT_BODY } from '@/lib/tokens'

const FORCE_BLUE   = '#7EC8E3'
const DARK_PURPLE  = '#8B2BE2'

interface DarkSidePipsStepProps {
  /** Pips the character has available for free (light for normal, dark for fallen). */
  lightPips:      number
  /** Costly pips available to optionally use (dark for normal, light for fallen). */
  darkPips:       number
  /** How many costly pips the player has chosen to use. */
  darkPipsUsed:   number
  onChangeDark:   (n: number) => void
  /** When true, mechanics are inverted — dark is free, light is costly. */
  isFallen?:      boolean
}

export function DarkSidePipsStep({
  lightPips, darkPips, darkPipsUsed, onChangeDark, isFallen = false,
}: DarkSidePipsStepProps) {
  const totalFP = lightPips + darkPipsUsed

  const accentColor   = isFallen ? FORCE_BLUE : '#E03A1E'
  const accentMuted   = isFallen ? 'rgba(126,200,227,0.4)' : 'rgba(224,58,30,0.4)'
  const costlyLabel   = isFallen ? 'light side' : 'dark side'
  const freeLabel     = isFallen ? 'dark side' : 'light side'
  const destinyFlip   = isFallen ? 'dark → light' : 'light → dark'
  const headerIcon    = isFallen ? '✦' : '⚠'
  const headerTitle   = isFallen ? 'Light Side Temptation' : 'Dark Side Temptation'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Warning header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: FS.sm,
          fontWeight: 700,
          color: accentColor,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}>
          {headerIcon} {headerTitle}
        </div>
        <div style={{ width: 40, height: 2, background: accentMuted }} />
      </div>

      {/* Explanation */}
      <div style={{
        fontFamily: FONT_BODY,
        fontSize: FS.label,
        color: HUD.text,
        lineHeight: 1.6,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div>
          You rolled{' '}
          <strong style={{ color: accentColor }}>
            {darkPips} {costlyLabel} Force Point{darkPips !== 1 ? 's' : ''}
          </strong>.
        </div>
        <div>Using {costlyLabel} Force Points requires:</div>
        <div style={{ paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div>• Flip 1 Destiny Point {destinyFlip}</div>
          <div>• Suffer <strong style={{ color: accentColor }}>{darkPipsUsed} strain</strong> (1 per <i className="ffi ffi-swrpg-force" aria-hidden="true" /> used)</div>
          {!isFallen && <div>• Gain Conflict (your GM will be notified)</div>}
        </div>
        <div style={{ color: HUD.textDim }}>
          You already have {lightPips} {freeLabel} Force Point{lightPips !== 1 ? 's' : ''} available without consequence.
        </div>
      </div>

      {/* Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: HUD.textFaint, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          {isFallen ? 'Light' : 'Dark'} <i className="ffi ffi-swrpg-force" aria-hidden="true" /> to use
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => onChangeDark(Math.max(0, darkPipsUsed - 1))}
            style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', cursor: 'pointer', color: 'var(--hud-text-dim)', fontSize: FS.sm, fontFamily: "var(--font-body)" }}
          >−</button>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: darkPipsUsed > 0 ? accentColor : HUD.textFaint, minWidth: 32, textAlign: 'center' }}>
            {darkPipsUsed}
          </div>
          <button
            onClick={() => onChangeDark(Math.min(darkPips, darkPipsUsed + 1))}
            style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', cursor: 'pointer', color: 'var(--hud-text-dim)', fontSize: FS.sm, fontFamily: "var(--font-body)" }}
          >+</button>
        </div>

        {/* Live cost summary */}
        {darkPipsUsed > 0 && (
          <div style={{ padding: '10px 12px', background: isFallen ? 'rgba(126,200,227,0.06)' : 'rgba(144,96,208,0.08)', border: `1px solid ${isFallen ? 'rgba(126,200,227,0.2)' : 'rgba(144,96,208,0.2)'}`, borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim }}>
              Using {darkPipsUsed} {costlyLabel} <i className="ffi ffi-swrpg-force" aria-hidden="true" />:
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: HUD.textFaint, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div>Strain cost:   {darkPipsUsed}</div>
              <div>Destiny flip:  1 {destinyFlip}</div>
              <div style={{ color: HUD.text }}>Total FP:      {totalFP}</div>
            </div>
          </div>
        )}
      </div>

      {/* Decision guidance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        {darkPipsUsed > 0 && (
          <div style={{ padding: '8px 10px', background: isFallen ? 'rgba(126,200,227,0.05)' : 'rgba(224,58,30,0.06)', border: `1px solid ${isFallen ? 'rgba(126,200,227,0.2)' : 'rgba(224,58,30,0.2)'}`, borderRadius: 6 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: isFallen ? HUD.textDim : 'rgba(224,58,30,0.75)', lineHeight: 1.4 }}>
              Remember: suffer {darkPipsUsed} strain and flip 1 Destiny Point when the GM confirms.
            </div>
          </div>
        )}
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, fontStyle: 'italic' }}>
          Adjust the selector above then click Continue to proceed.
        </div>
      </div>
    </div>
  )
}
