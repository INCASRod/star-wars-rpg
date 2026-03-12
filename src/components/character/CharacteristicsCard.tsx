'use client'

import { HudCard } from '../ui/HudCard'

interface CharacteristicsCardProps {
  brawn: number
  agility: number
  intellect: number
  cunning: number
  willpower: number
  presence: number
  animClass?: string
  isGmMode?: boolean
  onCharacteristicChange?: (field: string, delta: number) => void
}

const CHARS: { key: string; label: string }[] = [
  { key: 'brawn', label: 'Brawn' },
  { key: 'agility', label: 'Agility' },
  { key: 'intellect', label: 'Intellect' },
  { key: 'cunning', label: 'Cunning' },
  { key: 'willpower', label: 'Willpower' },
  { key: 'presence', label: 'Presence' },
]

const gmBtnStyle: React.CSSProperties = {
  width: 20, height: 20, fontSize: 'var(--text-caption)', fontWeight: 700,
  background: 'var(--gold-glow)', border: '1px solid var(--gold)',
  color: 'var(--gold-d)', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 0,
  lineHeight: 1, flexShrink: 0,
}

export function CharacteristicsCard(props: CharacteristicsCardProps) {
  const { animClass = 'al d1', isGmMode, onCharacteristicChange } = props
  const values: Record<string, number> = {
    brawn: props.brawn,
    agility: props.agility,
    intellect: props.intellect,
    cunning: props.cunning,
    willpower: props.willpower,
    presence: props.presence,
  }

  return (
    <HudCard title="Characteristics" animClass={animClass}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '0.25rem',
      }}>
        {CHARS.map(ch => (
          <div key={ch.key} style={{
            textAlign: 'center',
            padding: 'var(--sp-sm) 0.25rem',
            background: 'var(--parch)',
            border: '1px solid var(--bdr-l)',
            transition: '.2s',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {isGmMode && onCharacteristicChange ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <button style={gmBtnStyle} onClick={() => onCharacteristicChange(ch.key, -1)}>−</button>
                <div style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: 'var(--font-2xl)',
                  fontWeight: 900,
                  color: 'var(--ink)',
                  lineHeight: 1,
                  minWidth: 20,
                }}>
                  {values[ch.key]}
                </div>
                <button style={gmBtnStyle} onClick={() => onCharacteristicChange(ch.key, 1)}>+</button>
              </div>
            ) : (
              <div style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: 'var(--font-2xl)',
                fontWeight: 900,
                color: 'var(--ink)',
                lineHeight: 1,
              }}>
                {values[ch.key]}
              </div>
            )}
            <div style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: 'var(--font-xs)',
              fontWeight: 700,
              letterSpacing: '0.15rem',
              color: 'var(--txt3)',
              marginTop: '0.25rem',
              textTransform: 'uppercase',
            }}>
              {ch.label}
            </div>
          </div>
        ))}
      </div>
    </HudCard>
  )
}
