'use client'

interface DiceHexProps {
  type: 'proficiency' | 'ability' // yellow or green
}

export function DiceHex({ type }: DiceHexProps) {
  const color = type === 'proficiency' ? '#C8A22C' : 'var(--green)'
  return (
    <div
      style={{
        width: '1rem',
        height: '1rem',
        background: color,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
        flexShrink: 0,
      }}
    />
  )
}

interface DicePoolDisplayProps {
  proficiency: number
  ability: number
}

export function DicePoolDisplay({ proficiency, ability }: DicePoolDisplayProps) {
  return (
    <div className="dice" style={{ display: 'flex', gap: '0.25rem', minWidth: '3.5rem', justifyContent: 'flex-end' }}>
      {Array.from({ length: proficiency }).map((_, i) => (
        <DiceHex key={`y-${i}`} type="proficiency" />
      ))}
      {Array.from({ length: ability }).map((_, i) => (
        <DiceHex key={`g-${i}`} type="ability" />
      ))}
    </div>
  )
}
