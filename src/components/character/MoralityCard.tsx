'use client'

import { useState } from 'react'
import { HudCard } from '../ui/HudCard'

interface MoralityCardProps {
  value: number
  strength: string
  weakness: string
  animClass?: string
  isGmMode?: boolean
  onMoralityChange?: (delta: number) => void
  onMoralityKeyChange?: (field: string, value: string) => void
}

const gmBtnStyle: React.CSSProperties = {
  width: 20, height: 20, fontSize: 'var(--text-caption)', fontWeight: 700,
  background: 'var(--gold-glow)', border: '1px solid var(--gold)',
  color: 'var(--gold-d)', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 0,
  lineHeight: 1, flexShrink: 0,
}

export function MoralityCard({ value, strength, weakness, animClass = 'al d3', isGmMode, onMoralityChange, onMoralityKeyChange }: MoralityCardProps) {
  const [editStrength, setEditStrength] = useState(strength)
  const [editWeakness, setEditWeakness] = useState(weakness)

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
        {isGmMode && onMoralityChange ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <button style={gmBtnStyle} onClick={() => onMoralityChange(-5)}>−</button>
            <span>{value} / 100</span>
            <button style={gmBtnStyle} onClick={() => onMoralityChange(5)}>+</button>
          </div>
        ) : (
          <>{value} / 100</>
        )}
      </div>

      {/* Gradient track */}
      <div style={{
        height: '0.4rem',
        borderRadius: '0.2rem',
        background: 'linear-gradient(90deg, var(--red-l), var(--amber), var(--gold-l), var(--blue-l))',
        position: 'relative',
        margin: '0 0 0.5rem',
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
      {isGmMode && onMoralityKeyChange ? (
        <div style={{
          display: 'flex', gap: 8, marginTop: '0.25rem', alignItems: 'center', justifyContent: 'center',
        }}>
          <input
            value={editStrength}
            onChange={e => setEditStrength(e.target.value)}
            onBlur={() => onMoralityKeyChange('strength', editStrength)}
            style={{
              fontSize: 'var(--text-body-sm)', padding: '2px 6px', fontWeight: 600,
              color: 'var(--blue)', background: 'var(--white)',
              border: '1px solid var(--bdr-l)', width: 100, textAlign: 'center',
            }}
          />
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--txt3)' }}>/</span>
          <input
            value={editWeakness}
            onChange={e => setEditWeakness(e.target.value)}
            onBlur={() => onMoralityKeyChange('weakness', editWeakness)}
            style={{
              fontSize: 'var(--text-body-sm)', padding: '2px 6px', fontWeight: 600,
              color: 'var(--red)', background: 'var(--white)',
              border: '1px solid var(--bdr-l)', width: 100, textAlign: 'center',
            }}
          />
        </div>
      ) : (
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
      )}
    </HudCard>
  )
}
