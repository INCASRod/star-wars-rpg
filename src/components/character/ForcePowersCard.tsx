'use client'

import { HudCard } from '../ui/HudCard'

interface ForcePowerChip {
  powerKey: string
  powerName: string
  purchasedCount: number
  totalCount: number
}

interface ForcePowersCardProps {
  powers: ForcePowerChip[]
  forceRating: number
  onViewTree: (powerKey: string) => void
}

export function ForcePowersCard({ powers, forceRating, onViewTree }: ForcePowersCardProps) {
  if (powers.length === 0) return null

  return (
    <HudCard title={`Force Powers (${powers.length})`} collapsible>
      {/* Force Rating badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '0.5rem', paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--bdr-l)',
      }}>
        <span style={{
          fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)',
          fontWeight: 700, letterSpacing: '0.12rem', color: 'var(--txt3)',
        }}>
          FORCE RATING
        </span>
        <span style={{
          fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)',
          fontWeight: 800, color: 'var(--blue)',
        }}>
          {forceRating}
        </span>
      </div>

      {/* Power chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {powers.map(p => (
          <button
            key={p.powerKey}
            onClick={() => onViewTree(p.powerKey)}
            style={{
              background: 'rgba(200,162,78,.06)',
              border: '1px solid var(--bdr-l)',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              transition: '.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'var(--gold-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bdr-l)'; e.currentTarget.style.background = 'rgba(200,162,78,.06)' }}
          >
            <span style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)',
              fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink)',
            }}>
              {p.powerName}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)',
              fontWeight: 600, color: 'var(--txt3)',
            }}>
              {p.purchasedCount}/{p.totalCount}
            </span>
          </button>
        ))}
      </div>
    </HudCard>
  )
}
