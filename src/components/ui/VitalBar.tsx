'use client'

interface VitalBarProps {
  label: string
  current: number
  max: number
  icon: string
  variant: 'wounds' | 'strain' | 'soak'
  onIncrement?: () => void
  onDecrement?: () => void
}

const VARIANT_STYLES = {
  wounds: {
    iconBg: 'var(--red-pale)',
    iconColor: 'var(--red)',
    numColor: 'var(--red)',
    fillGradient: 'linear-gradient(90deg, var(--red-l), var(--red))',
    fillClass: 'w',
  },
  strain: {
    iconBg: 'var(--amber-pale)',
    iconColor: 'var(--amber)',
    numColor: 'var(--amber)',
    fillGradient: 'linear-gradient(90deg, #D4A017, var(--amber))',
    fillClass: 's',
  },
  soak: {
    iconBg: 'var(--blue-pale)',
    iconColor: 'var(--blue)',
    numColor: 'var(--blue)',
    fillGradient: '',
    fillClass: 'k',
  },
}

export function VitalBar({ label, current, max, icon, variant, onIncrement, onDecrement }: VitalBarProps) {
  const s = VARIANT_STYLES[variant]
  const pct = max > 0 ? (current / max) * 100 : 0
  const showBar = variant !== 'soak'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)', padding: '0.4rem 0' }}>
      <div style={{
        width: '2.1rem', height: '2.1rem', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 'var(--font-lg)', flexShrink: 0,
        background: s.iconBg, color: s.iconColor,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 600,
            letterSpacing: '0.15rem', color: 'var(--txt3)', textTransform: 'uppercase' as const,
          }}>
            {label}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {onDecrement && (
              <button onClick={onDecrement} style={{ cursor: 'pointer', background: 'none', border: '1px solid var(--bdr-l)', width: '1.3rem', height: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-base)', color: 'var(--txt2)' }}>-</button>
            )}
            <span style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xl)', fontWeight: 800,
              color: s.numColor,
            }}>
              {current}
              {showBar && <span style={{ fontSize: 'var(--font-base)', color: 'var(--txt3)', fontWeight: 400 }}> / {max}</span>}
            </span>
            {onIncrement && (
              <button onClick={onIncrement} style={{ cursor: 'pointer', background: 'none', border: '1px solid var(--bdr-l)', width: '1.3rem', height: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-base)', color: 'var(--txt2)' }}>+</button>
            )}
          </div>
        </div>
        {showBar && (
          <div style={{ height: '0.2rem', background: 'var(--bdr-l)', marginTop: '0.3rem', overflow: 'hidden', borderRadius: '0.1rem' }}>
            <div style={{ height: '100%', borderRadius: '0.1rem', transition: 'width .4s', width: `${pct}%`, background: s.fillGradient }} />
          </div>
        )}
      </div>
    </div>
  )
}
