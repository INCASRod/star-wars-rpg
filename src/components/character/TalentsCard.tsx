'use client'

import { HudCard } from '../ui/HudCard'

export interface TalentDisplay {
  name: string
  rank: number
  activation: string // 'Passive', 'Maneuver', etc.
}

const ACTIVATION_COLORS: Record<string, string> = {
  Passive: 'var(--blue)',
  Action: 'var(--red)',
  Maneuver: 'var(--amber)',
  Incidental: 'var(--green)',
  'Incidental (OOT)': 'var(--green)',
}

interface TalentsCardProps {
  talents: TalentDisplay[]
  animClass?: string
  onOpenTree?: () => void
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function TalentsCard({ talents, animClass = 'ar d4', onOpenTree, collapsible, defaultCollapsed }: TalentsCardProps) {
  return (
    <HudCard title="Talents" animClass={animClass} collapsible={collapsible} defaultCollapsed={defaultCollapsed}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {talents.map((tal, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'var(--parch)', border: '1px solid var(--bdr-l)',
            padding: '0.35rem 0.7rem', margin: '0 0.25rem 0.25rem 0',
            fontSize: 'var(--font-sm)', transition: '.2s', cursor: 'default',
          }}>
            <div style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 800,
              color: 'var(--gold-d)', background: 'var(--gold-glow)',
              width: '1.1rem', height: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {tal.rank}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--txt)' }}>{tal.name}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)',
                fontWeight: 600, color: ACTIVATION_COLORS[tal.activation] || 'var(--txt2)', letterSpacing: '0.06rem',
              }}>
                {tal.activation}
              </div>
            </div>
          </div>
        ))}
      </div>
      {onOpenTree && (
        <button
          onClick={onOpenTree}
          style={{
            width: '100%', marginTop: '0.4rem',
            background: 'rgba(200,162,78,.08)',
            border: '1px solid var(--gold)',
            padding: '0.3rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)',
            fontWeight: 700, letterSpacing: '0.1rem',
            color: 'var(--gold-d)', textAlign: 'center',
            transition: '.2s',
          }}
        >
          VIEW TALENT TREE
        </button>
      )}
    </HudCard>
  )
}
