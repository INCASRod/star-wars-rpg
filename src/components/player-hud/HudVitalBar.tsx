'use client'

import { HUD, FS, SP, RADIUS, EASE, FONT_BODY } from '@/lib/tokens'

export function CompactVital({ label, current, threshold, bonus = 0, color }: { label: string; current: number; threshold: number; bonus?: number; color: string }) {
  const effective = threshold + bonus
  const pct = effective > 0 ? Math.min((current / effective) * 100, 100) : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], width: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, color: HUD.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: SP[1] }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color }}>{current}/{threshold}</span>
          {bonus > 0 && <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.gold }}>+{bonus}</span>}
        </span>
      </div>
      <div style={{ height: 5, background: HUD.textFaint, borderRadius: RADIUS.md, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: RADIUS.md, transition: `width ${EASE.default}` }} />
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
    <div style={{ marginBottom: SP[2] }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SP[1] }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: HUD.textDim }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
          {onDec && <button onClick={onDec} style={{ background: 'transparent', border: `1px solid ${HUD.border}`, borderRadius: RADIUS.md, width: 16, height: 16, cursor: 'pointer', color: HUD.textDim, fontSize: FS.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>}
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: overLimit ? 'var(--state-wounds)' : color, fontWeight: 700 }}>{current}/{threshold}</span>
          {bonus > 0 && <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.gold }}>+{bonus}</span>}
          {onInc && <button onClick={onInc} style={{ background: 'transparent', border: `1px solid ${HUD.border}`, borderRadius: RADIUS.md, width: 16, height: 16, cursor: 'pointer', color: HUD.textDim, fontSize: FS.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>}
        </div>
      </div>
      <div style={{ height: 6, background: HUD.textFaint, borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SP[1] }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: RADIUS.md, transition: `width ${EASE.default}` }} />
      </div>
      {/* Pip row — base pips + bonus pips in gold */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: RADIUS.md }}>
        {Array.from({ length: threshold }).map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: RADIUS.sm,
            background: i < current ? color : 'transparent',
            border: `1px solid ${i < current ? color : HUD.textFaint}`,
            transition: EASE.default,
          }} />
        ))}
        {bonus > 0 && Array.from({ length: bonus }).map((_, i) => (
          <div key={`bonus-${i}`} style={{
            width: 8, height: 8, borderRadius: RADIUS.sm,
            background: (threshold + i) < current ? HUD.gold : 'transparent',
            border: `1px solid var(--hud-gold-40)`,
            transition: EASE.default,
          }} />
        ))}
      </div>
    </div>
  )
}
