'use client'

const ENC_WARN   = '#E07855'
const ENC_OK     = 'rgba(90,170,224,0.7)'
const GOLD_DIM   = 'rgba(200,170,80,0.5)'
const FONT_C     = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M     = "'Share Tech Mono','Courier New',monospace"

interface EncumbranceBarProps {
  current: number
  threshold: number
  /** Compact inline display (no bar, just text) */
  compact?: boolean
  /** Override the label font-size clamp for desktop contexts */
  labelFontSize?: string
}

export function EncumbranceBar({ current, threshold, compact = false, labelFontSize }: EncumbranceBarProps) {
  const pct  = threshold > 0 ? Math.min(100, (current / threshold) * 100) : 0
  const over = current > threshold
  const fill = over ? ENC_WARN : ENC_OK

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          fontFamily: FONT_C,
          fontSize: labelFontSize ?? 'clamp(0.6rem, 2.4vw, 0.72rem)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: GOLD_DIM,
        }}>
          ENC
        </span>
        <span style={{
          fontFamily: FONT_M,
          fontSize: 'clamp(0.65rem, 2.5vw, 0.78rem)',
          color: over ? ENC_WARN : 'rgba(200,170,80,0.7)',
        }}>
          {current}/{threshold}
        </span>
        {over && <span style={{ fontSize: '0.65rem', color: ENC_WARN }}>⚠</span>}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{
          fontFamily: FONT_C,
          fontSize: labelFontSize ?? 'clamp(0.58rem, 0.9vw, 0.68rem)',
          textTransform: 'uppercase', letterSpacing: '0.15em',
          color: GOLD_DIM,
        }}>
          ENC
        </span>
        <span style={{
          fontFamily: FONT_M,
          fontSize: 'clamp(0.68rem, 1.0vw, 0.8rem)',
          color: over ? ENC_WARN : 'rgba(232,223,200,0.6)',
        }}>
          {current}/{threshold}{over && ' ⚠'}
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: fill, borderRadius: 3,
          transition: 'width 300ms ease',
        }} />
      </div>
    </div>
  )
}
