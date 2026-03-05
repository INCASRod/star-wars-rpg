'use client'

import { HudCard } from '../ui/HudCard'

interface MoralityCardProps {
  value: number
  strength: string
  weakness: string
  animClass?: string
}

export function MoralityCard({ value, strength, weakness, animClass = 'al d3' }: MoralityCardProps) {
  return (
    <HudCard title="Morality" animClass={animClass}>
      <div style={{
        textAlign: 'center',
        fontFamily: 'var(--font-orbitron)',
        fontSize: 'var(--font-base)',
        fontWeight: 700,
        color: 'var(--txt)',
        marginBottom: '0.25rem',
      }}>
        {value} / 100
      </div>

      {/* Gradient track */}
      <div style={{
        height: '0.4rem',
        borderRadius: '0.2rem',
        background: 'linear-gradient(90deg, var(--red-l), var(--amber), var(--gold-l), var(--blue-l))',
        position: 'relative',
        margin: '0 0 0.4rem',
      }}>
        {/* Pin marker */}
        <div style={{
          position: 'absolute',
          top: '-0.3rem',
          left: `${value}%`,
          width: '0.2rem',
          height: '1rem',
          background: 'var(--ink)',
          borderRadius: '0.1rem',
          transform: 'translateX(-50%)',
          boxShadow: '0 0 6px rgba(0,0,0,.3)',
          transition: 'left .5s',
        }} />
      </div>

      {/* Labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-orbitron)',
        fontSize: 'var(--font-2xs)',
        fontWeight: 600,
        letterSpacing: '0.15rem',
        color: 'var(--txt3)',
      }}>
        <span style={{ color: 'var(--red)' }}>DARK SIDE</span>
        <span style={{ color: 'var(--blue)' }}>LIGHT SIDE</span>
      </div>

      {/* Strength / Weakness */}
      <div style={{
        textAlign: 'center',
        fontSize: 'var(--font-xs)',
        color: 'var(--txt2)',
        marginTop: '0.25rem',
      }}>
        <b style={{ color: 'var(--blue)' }}>{strength}</b>
        {' / '}
        <b style={{ color: 'var(--red)' }}>{weakness}</b>
      </div>
    </HudCard>
  )
}
