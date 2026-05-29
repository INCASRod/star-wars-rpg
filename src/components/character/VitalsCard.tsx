'use client'

import { HudCard } from '../ui/HudCard'
import { VitalBar } from '../ui/VitalBar'
import { FS, FONT_BODY, HUD } from '@/lib/tokens'

interface VitalsCardProps {
  woundCurrent: number
  woundThreshold: number
  strainCurrent: number
  strainThreshold: number
  soak: number
  defenseRanged: number
  defenseMelee: number
  onWoundChange?: (delta: number) => void
  onStrainChange?: (delta: number) => void
  isGmMode?: boolean
  onSoakChange?: (delta: number) => void
  onDefenseChange?: (type: 'ranged' | 'melee', delta: number) => void
  animClass?: string
}

const gmBtnStyle: React.CSSProperties = {
  width: 20, height: 20, fontSize: FS.caption, fontWeight: 700,
  background: 'var(--hud-accent-10)', border: `1px solid ${HUD.gold}`,
  color: 'var(--hud-accent)', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 0,
  lineHeight: 1, flexShrink: 0,
}

export function VitalsCard({
  woundCurrent, woundThreshold,
  strainCurrent, strainThreshold,
  soak, defenseRanged, defenseMelee,
  onWoundChange, onStrainChange,
  isGmMode, onSoakChange, onDefenseChange,
  animClass = 'al d2',
}: VitalsCardProps) {
  return (
    <HudCard title="Vitals" animClass={animClass}>
      <VitalBar
        label="Wounds"
        current={woundCurrent}
        max={woundThreshold}
        icon="♥"
        variant="wounds"
        onIncrement={onWoundChange ? () => onWoundChange(1) : undefined}
        onDecrement={onWoundChange ? () => onWoundChange(-1) : undefined}
      />
      <VitalBar
        label="Strain"
        current={strainCurrent}
        max={strainThreshold}
        icon="⚡"
        variant="strain"
        onIncrement={onStrainChange ? () => onStrainChange(1) : undefined}
        onDecrement={onStrainChange ? () => onStrainChange(-1) : undefined}
      />
      {isGmMode && onSoakChange ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.borderHi}`,
          padding: '0.5rem 0.75rem', marginTop: '0.25rem',
        }}>
          <span style={{ fontSize: FS.label, fontWeight: 600, color: HUD.textDim, letterSpacing: '0.06rem' }}>🛡 Soak</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button style={gmBtnStyle} onClick={() => onSoakChange(-1)}>−</button>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 800, color: 'var(--hud-accent)', minWidth: 20, textAlign: 'center' }}>{soak}</span>
            <button style={gmBtnStyle} onClick={() => onSoakChange(1)}>+</button>
          </div>
        </div>
      ) : (
        <VitalBar
          label="Soak"
          current={soak}
          max={0}
          icon="🛡"
          variant="soak"
        />
      )}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.borderHi}`,
          padding: '0.5rem 0.75rem',
        }}>
          <span style={{ fontSize: FS.label, fontWeight: 600, color: HUD.textDim, letterSpacing: '0.06rem' }}>Ranged</span>
          {isGmMode && onDefenseChange ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button style={gmBtnStyle} onClick={() => onDefenseChange('ranged', -1)}>−</button>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 800, color: 'var(--hud-accent)', minWidth: 20, textAlign: 'center' }}>{defenseRanged}</span>
              <button style={gmBtnStyle} onClick={() => onDefenseChange('ranged', 1)}>+</button>
            </div>
          ) : (
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 800, color: 'var(--hud-accent)' }}>{defenseRanged}</span>
          )}
        </div>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.borderHi}`,
          padding: '0.5rem 0.75rem',
        }}>
          <span style={{ fontSize: FS.label, fontWeight: 600, color: HUD.textDim, letterSpacing: '0.06rem' }}>Melee</span>
          {isGmMode && onDefenseChange ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button style={gmBtnStyle} onClick={() => onDefenseChange('melee', -1)}>−</button>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 800, color: 'var(--hud-accent)', minWidth: 20, textAlign: 'center' }}>{defenseMelee}</span>
              <button style={gmBtnStyle} onClick={() => onDefenseChange('melee', 1)}>+</button>
            </div>
          ) : (
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 800, color: 'var(--hud-accent)' }}>{defenseMelee}</span>
          )}
        </div>
      </div>
    </HudCard>
  )
}
