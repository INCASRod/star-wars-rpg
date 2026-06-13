'use client'
import { FONT_DISPLAY, FS, SP, HUD } from '@/lib/tokens'

const WOUNDS_COLOR = '#E85A2A' /* wounds display — Ember Tatooine exception */

interface VitalCellProps {
  label: string
  valueStr: string
  color: string
  current: number
  max: number
}

function VitalCell({ label, valueStr, color, current, max }: VitalCellProps) {
  const pct = max > 0 ? Math.min(1, current / max) : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.overline,
        letterSpacing: '0.15em', textTransform: 'uppercase', color: HUD.textFaint,
      }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700, color }}>
        {valueStr}
      </div>
      <div style={{
        height: 2, borderRadius: 1,
        background: `color-mix(in srgb, ${color} 20%, transparent)`,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 1,
          width: `${pct * 100}%`,
          background: color,
        }} />
      </div>
    </div>
  )
}

interface MobileVitalsStripProps {
  woundCurrent: number
  woundThreshold: number
  strainCurrent: number
  strainThreshold: number
  soak: number
  defMelee: number
  defRanged: number
}

export function MobileVitalsStrip({
  woundCurrent, woundThreshold,
  strainCurrent, strainThreshold,
  soak, defMelee, defRanged,
}: MobileVitalsStripProps) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      gap: SP[2], padding: `${SP[1]} ${SP[2]}`,
      background: 'var(--hud-surface-lo)',
      borderBottom: `1px solid var(--hud-border)`,
      flexShrink: 0,
    }}>
      <VitalCell
        label="Wounds" valueStr={`${woundCurrent}/${woundThreshold}`}
        color={WOUNDS_COLOR} current={woundCurrent} max={woundThreshold}
      />
      <VitalCell
        label="Strain" valueStr={`${strainCurrent}/${strainThreshold}`}
        color="var(--hud-gold)" current={strainCurrent} max={strainThreshold}
      />
      <VitalCell
        label="Soak" valueStr={String(soak)}
        color="var(--blue)" current={soak} max={10}
      />
      {/* Def M·R has no meaningful max so we render without VitalCell progress bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.overline,
          letterSpacing: '0.15em', textTransform: 'uppercase', color: HUD.textFaint,
        }}>
          Def M·R
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700, color: HUD.textDim }}>
          {defMelee}·{defRanged}
        </div>
        <div style={{ height: 2, borderRadius: 1, background: `color-mix(in srgb, var(--hud-border) 40%, transparent)` }} />
      </div>
    </div>
  )
}
