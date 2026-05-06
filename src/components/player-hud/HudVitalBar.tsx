'use client'

import { C, FONT_RAJDHANI, FS_OVERLINE, FS_CAPTION, FS_SM } from './design-tokens'

export function CompactVital({ label, current, threshold, bonus = 0, color }: { label: string; current: number; threshold: number; bonus?: number; color: string }) {
  const effective = threshold + bonus
  const pct = effective > 0 ? Math.min((current / effective) * 100, 100) : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, color: C.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color }}>{current}/{threshold}</span>
          {bonus > 0 && <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.65rem, 1vw, 0.75rem)', color: C.gold }}>+{bonus}</span>}
        </span>
      </div>
      <div style={{ height: 5, background: C.textFaint, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .3s' }} />
      </div>
    </div>
  )
}

export function VitalBar({ label, current, threshold, bonus = 0, color, onInc, onDec }: {
  label: string; current: number; threshold: number; bonus?: number; color: string
  onInc?: () => void; onDec?: () => void
}) {
  const effective = threshold + bonus
  const pct = effective > 0 ? Math.min((current / effective) * 100, 100) : 0
  const overLimit = current >= effective
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textDim }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {onDec && <button onClick={onDec} style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, width: 16, height: 16, cursor: 'pointer', color: C.textDim, fontSize: FS_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>}
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: overLimit ? '#E05050' : color, fontWeight: 700 }}>{current}/{threshold}</span>
          {bonus > 0 && <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.65rem, 1vw, 0.75rem)', color: C.gold }}>+{bonus}</span>}
          {onInc && <button onClick={onInc} style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, width: 16, height: 16, cursor: 'pointer', color: C.textDim, fontSize: FS_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>}
        </div>
      </div>
      <div style={{ height: 6, background: C.textFaint, borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 3, transition: 'width .3s' }} />
      </div>
      {/* Pip row — base pips + bonus pips in gold */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {Array.from({ length: threshold }).map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: 2,
            background: i < current ? color : 'transparent',
            border: `1px solid ${i < current ? color : C.textFaint}`,
            transition: '.15s',
          }} />
        ))}
        {bonus > 0 && Array.from({ length: bonus }).map((_, i) => (
          <div key={`bonus-${i}`} style={{
            width: 8, height: 8, borderRadius: 2,
            background: (threshold + i) < current ? C.gold : 'transparent',
            border: `1px solid ${C.gold}60`,
            transition: '.15s',
          }} />
        ))}
      </div>
    </div>
  )
}
