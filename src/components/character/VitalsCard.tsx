'use client'

import { HudCard } from '../ui/HudCard'
import { VitalBar } from '../ui/VitalBar'

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
  width: 20, height: 20, fontSize: 'var(--text-caption)', fontWeight: 700,
  background: 'var(--gold-glow)', border: '1px solid var(--gold)',
  color: 'var(--gold-d)', cursor: 'pointer', display: 'flex',
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
          background: 'var(--parch)', border: '1px solid var(--bdr-l)',
          padding: '0.5rem 0.75rem', marginTop: '0.25rem',
        }}>
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt2)', letterSpacing: '0.06rem' }}>🛡 Soak</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button style={gmBtnStyle} onClick={() => onSoakChange(-1)}>−</button>
            <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--gold-d)', minWidth: 20, textAlign: 'center' }}>{soak}</span>
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
          background: 'var(--parch)', border: '1px solid var(--bdr-l)',
          padding: '0.5rem 0.75rem',
        }}>
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt2)', letterSpacing: '0.06rem' }}>Ranged</span>
          {isGmMode && onDefenseChange ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button style={gmBtnStyle} onClick={() => onDefenseChange('ranged', -1)}>−</button>
              <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--gold-d)', minWidth: 20, textAlign: 'center' }}>{defenseRanged}</span>
              <button style={gmBtnStyle} onClick={() => onDefenseChange('ranged', 1)}>+</button>
            </div>
          ) : (
            <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--gold-d)' }}>{defenseRanged}</span>
          )}
        </div>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--parch)', border: '1px solid var(--bdr-l)',
          padding: '0.5rem 0.75rem',
        }}>
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt2)', letterSpacing: '0.06rem' }}>Melee</span>
          {isGmMode && onDefenseChange ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button style={gmBtnStyle} onClick={() => onDefenseChange('melee', -1)}>−</button>
              <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--gold-d)', minWidth: 20, textAlign: 'center' }}>{defenseMelee}</span>
              <button style={gmBtnStyle} onClick={() => onDefenseChange('melee', 1)}>+</button>
            </div>
          ) : (
            <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--gold-d)' }}>{defenseMelee}</span>
          )}
        </div>
      </div>
    </HudCard>
  )
}
