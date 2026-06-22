'use client'
import { FONT_BODY, FONT_DISPLAY, FS, SP, HUD, COLOR } from '@/lib/tokens'

const WOUNDS_COLOR = '#E85A2A' /* wounds display — Ember Tatooine exception */

interface VitalCellProps {
  label: string
  valueStr: string
  color: string
  current: number
  max: number
  onClick?: () => void
}

function VitalCell({ label, valueStr, color, current, max, onClick }: VitalCellProps) {
  const pct = max > 0 ? Math.min(1, current / max) : 0
  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' /* 2px — minimum intra-cell gap */, minWidth: 0 }}>
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.overline,
        letterSpacing: '0.15em', textTransform: 'uppercase', color: HUD.textFaint,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700, color,
        ...(onClick ? { borderBottom: `1px solid color-mix(in srgb, ${color} 40%, transparent)` } : {}),
      }}>
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

  if (onClick) {
    return (
      <button
        onClick={onClick}
        aria-label={label === 'Wounds' ? 'Adjust wounds' : 'Adjust strain'}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: 0, textAlign: 'left',
          minHeight: 44, /* WCAG minimum touch target */
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          minWidth: 0,
        }}
      >
        {inner}
      </button>
    )
  }
  return inner
}

interface MobileVitalsStripProps {
  woundCurrent: number
  woundThreshold: number
  strainCurrent: number
  strainThreshold: number
  soak: number
  defMelee: number
  defRanged: number
  onWoundsTap?: () => void
  onStrainTap?: () => void
}

export function MobileVitalsStrip({
  woundCurrent, woundThreshold,
  strainCurrent, strainThreshold,
  soak, defMelee, defRanged,
  onWoundsTap, onStrainTap,
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
        onClick={onWoundsTap}
      />
      <VitalCell
        label="Strain" valueStr={`${strainCurrent}/${strainThreshold}`}
        color={HUD.gold} current={strainCurrent} max={strainThreshold}
        onClick={onStrainTap}
      />
      <VitalCell
        label="Soak" valueStr={String(soak)}
        color={COLOR.blue} current={soak} max={10}
      />
      {/* Def M·R has no meaningful max so we render without VitalCell progress bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' /* 2px — minimum intra-cell gap */, minWidth: 0 }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.overline,
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
