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
        borderBottom: '1px solid var(--bs-bdr-mid)',
      }}>
        <span style={{
          fontFamily: 'var(--font-rajdhani)', fontSize: 'var(--font-xs)',
          fontWeight: 700, letterSpacing: '0.12rem', color: 'var(--bs-txt3)',
        }}>
          FORCE RATING
        </span>
        <span style={{
          fontFamily: 'var(--font-rajdhani)', fontSize: 'var(--font-md)',
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
            className="force-power-chip"
            style={{
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-rajdhani)', fontSize: 'var(--font-2xs)',
              fontWeight: 700, letterSpacing: '0.06em', color: 'var(--bs-ink)',
            }}>
              {p.powerName}
            </span>
            <span style={{
              fontFamily: 'var(--font-rajdhani)', fontSize: 'var(--font-2xs)',
              fontWeight: 600, color: 'var(--bs-txt3)',
            }}>
              {p.purchasedCount}/{p.totalCount}
            </span>
          </button>
        ))}
      </div>
    </HudCard>
  )
}
