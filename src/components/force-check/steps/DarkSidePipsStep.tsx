'use client'

const FONT_C = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M = "'Share Tech Mono', 'Courier New', monospace"
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

  const accentColor   = isFallen ? FORCE_BLUE : '#E05252'
  const accentMuted   = isFallen ? 'rgba(126,200,227,0.4)' : 'rgba(224,82,82,0.4)'
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
          fontFamily: FONT_C,
          fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
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
        fontFamily: FONT_R,
        fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)',
        color: 'rgba(232,223,200,0.8)',
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
          <div>• Suffer <strong style={{ color: accentColor }}>{darkPipsUsed} strain</strong> (1 per pip used)</div>
          {!isFallen && <div>• Gain Conflict (your GM will be notified)</div>}
        </div>
        <div style={{ color: isFallen ? `${FORCE_BLUE}90` : `${FORCE_BLUE}90` }}>
          You already have {lightPips} {freeLabel} Force Point{lightPips !== 1 ? 's' : ''} available without consequence.
        </div>
      </div>

      {/* Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)', color: 'rgba(232,223,200,0.45)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          {isFallen ? 'Light' : 'Dark'} pips to use
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => onChangeDark(Math.max(0, darkPipsUsed - 1))}
            style={{ width: 36, height: 36, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', color: 'rgba(232,223,200,0.8)', fontSize: 'clamp(0.9rem,1.4vw,1.1rem)', fontFamily: FONT_M }}
          >−</button>
          <div style={{ fontFamily: FONT_C, fontSize: 'clamp(1.2rem, 2vw, 1.6rem)', fontWeight: 700, color: darkPipsUsed > 0 ? accentColor : 'rgba(232,223,200,0.4)', minWidth: 32, textAlign: 'center' }}>
            {darkPipsUsed}
          </div>
          <button
            onClick={() => onChangeDark(Math.min(darkPips, darkPipsUsed + 1))}
            style={{ width: 36, height: 36, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', color: 'rgba(232,223,200,0.8)', fontSize: 'clamp(0.9rem,1.4vw,1.1rem)', fontFamily: FONT_M }}
          >+</button>
        </div>

        {/* Live cost summary */}
        {darkPipsUsed > 0 && (
          <div style={{ padding: '10px 12px', background: isFallen ? 'rgba(126,200,227,0.06)' : 'rgba(144,96,208,0.08)', border: `1px solid ${isFallen ? 'rgba(126,200,227,0.2)' : 'rgba(144,96,208,0.2)'}`, borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', color: 'rgba(232,223,200,0.7)' }}>
              Using {darkPipsUsed} {costlyLabel} pip{darkPipsUsed !== 1 ? 's' : ''}:
            </div>
            <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)', color: 'rgba(232,223,200,0.5)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div>Strain cost:   {darkPipsUsed}</div>
              <div>Destiny flip:  1 {destinyFlip}</div>
              <div style={{ color: FORCE_BLUE }}>Total FP:      {totalFP}</div>
            </div>
          </div>
        )}
      </div>

      {/* Decision guidance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        {darkPipsUsed > 0 && (
          <div style={{ padding: '8px 10px', background: isFallen ? 'rgba(126,200,227,0.05)' : 'rgba(224,82,82,0.06)', border: `1px solid ${isFallen ? 'rgba(126,200,227,0.2)' : 'rgba(224,82,82,0.2)'}`, borderRadius: 6 }}>
            <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)', color: isFallen ? 'rgba(126,200,227,0.7)' : 'rgba(224,82,82,0.7)', lineHeight: 1.4 }}>
              Remember: suffer {darkPipsUsed} strain and flip 1 Destiny Point when the GM confirms.
            </div>
          </div>
        )}
        <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)', color: 'rgba(232,223,200,0.4)', fontStyle: 'italic' }}>
          Adjust the selector above then click Continue to proceed.
        </div>
      </div>
    </div>
  )
}
