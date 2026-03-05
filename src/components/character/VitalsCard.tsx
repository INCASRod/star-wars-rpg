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
  animClass?: string
}

export function VitalsCard({
  woundCurrent, woundThreshold,
  strainCurrent, strainThreshold,
  soak, defenseRanged, defenseMelee,
  onWoundChange, onStrainChange,
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
      <VitalBar
        label="Soak"
        current={soak}
        max={0}
        icon="🛡"
        variant="soak"
      />
      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.3rem' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--parch)', border: '1px solid var(--bdr-l)',
          padding: '0.35rem 0.65rem',
        }}>
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt2)', letterSpacing: '0.06rem' }}>Ranged</span>
          <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--gold-d)' }}>{defenseRanged}</span>
        </div>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--parch)', border: '1px solid var(--bdr-l)',
          padding: '0.35rem 0.65rem',
        }}>
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt2)', letterSpacing: '0.06rem' }}>Melee</span>
          <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--gold-d)' }}>{defenseMelee}</span>
        </div>
      </div>
    </HudCard>
  )
}
