'use client'

import { useState } from 'react'
import { HudCard } from '../ui/HudCard'
import { HUD, FS, FONT_BODY } from '@/lib/tokens'

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
  width: 20, height: 20, fontSize: FS.caption, fontWeight: 700,
  background: 'var(--hud-accent-10)', border: `1px solid var(--hud-accent)`,
  color: 'var(--hud-accent)', cursor: 'pointer', display: 'flex',
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
        fontFamily: FONT_BODY,
        fontSize: FS.body,
        fontWeight: 700,
        color: HUD.text,
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
        // Pre-approved: `var(--red-l)` and `var(--amber)` are palette vars, not --bs-*
        // `var(--hud-accent)` replaces --bs-red-hi; `var(--blue-l)` is a palette var
        background: 'linear-gradient(90deg, var(--red-l), var(--amber), var(--hud-accent), var(--blue-l))',
        position: 'relative',
        margin: '0 0 0.5rem',
      }}>
        {/* Pin marker — left is dynamic (runtime value%), kept as inline style */}
        <div style={{
          position: 'absolute',
          top: '-0.3rem',
          left: `${value}%`,
          width: '0.2rem',
          height: '1rem',
          background: HUD.text,
          borderRadius: '0.1rem',
          transform: 'translateX(-50%)',
          // Pre-approved: rgba(0,0,0,*) overlay shadow
          boxShadow: '0 0 6px rgba(0,0,0,.3)',
          transition: 'left .5s',
        }} />
      </div>

      {/* Labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: FONT_BODY,
        fontSize: FS.caption,
        fontWeight: 600,
        letterSpacing: '0.15rem',
        color: HUD.textFaint,
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
              fontSize: FS.sm, padding: '2px 6px', fontWeight: 600,
              color: 'var(--blue)', background: 'var(--hud-surface-lo)',
              border: `1px solid ${HUD.borderHi}`, width: 100, textAlign: 'center',
            }}
          />
          <span style={{ fontSize: FS.label, color: HUD.textFaint }}>/</span>
          <input
            value={editWeakness}
            onChange={e => setEditWeakness(e.target.value)}
            onBlur={() => onMoralityKeyChange('weakness', editWeakness)}
            style={{
              fontSize: FS.sm, padding: '2px 6px', fontWeight: 600,
              color: 'var(--red)', background: 'var(--hud-surface-lo)',
              border: `1px solid ${HUD.borderHi}`, width: 100, textAlign: 'center',
            }}
          />
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          fontSize: FS.label,
          color: HUD.textDim,
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
