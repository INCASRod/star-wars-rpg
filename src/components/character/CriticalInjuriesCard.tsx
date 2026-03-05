'use client'

import { useState } from 'react'
import { HudCard } from '../ui/HudCard'

export interface CriticalInjuryDisplay {
  id: string
  name: string
  severity: string
  description?: string
  isHealed: boolean
}

interface CriticalInjuriesCardProps {
  injuries: CriticalInjuryDisplay[]
  animClass?: string
  onRollCrit?: () => void
  onHealCrit?: (id: string) => void
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function CriticalInjuriesCard({ injuries, animClass = 'ar d5', onRollCrit, onHealCrit, collapsible, defaultCollapsed }: CriticalInjuriesCardProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <HudCard title="Critical Injuries" animClass={animClass} collapsible={collapsible} defaultCollapsed={defaultCollapsed}>
      {injuries.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '0.5rem 0',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)',
          color: 'var(--txt3)', letterSpacing: '0.15rem',
        }}>
          NO ACTIVE INJURIES
        </div>
      ) : (
        injuries.map((inj) => (
          <div key={inj.id} style={{
            padding: '0.35rem 0',
            borderBottom: '1px solid var(--bdr-l)',
            opacity: inj.isHealed ? 0.4 : 1,
          }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                cursor: inj.description ? 'pointer' : 'default',
              }}
              onClick={() => inj.description && setExpanded(expanded === inj.id ? null : inj.id)}
            >
              <div style={{
                width: '0.42rem', height: '0.42rem', borderRadius: '50%', flexShrink: 0,
                background: inj.isHealed ? 'var(--green)' : 'var(--red)',
                boxShadow: inj.isHealed ? 'none' : '0 0 0.4rem var(--red)',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt)' }}>{inj.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)', color: 'var(--txt3)' }}>{inj.severity}</div>
              </div>
              {!inj.isHealed && onHealCrit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onHealCrit(inj.id) }}
                  title="Heal this injury"
                  style={{
                    background: 'none', border: '1px solid var(--bdr-l)',
                    width: '1.2rem', height: '1.2rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'var(--font-sm)', color: 'var(--green)', fontWeight: 700,
                    transition: '.2s', flexShrink: 0,
                  }}
                >
                  +
                </button>
              )}
            </div>
            {expanded === inj.id && inj.description && (
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)',
                color: 'var(--txt2)', padding: '0.3rem 0 0.1rem 0.92rem',
                lineHeight: 1.4,
              }}>
                {inj.description}
              </div>
            )}
          </div>
        ))
      )}
      {onRollCrit && (
        <button
          onClick={onRollCrit}
          style={{
            width: '100%', marginTop: '0.4rem',
            background: 'rgba(191,64,64,.08)',
            border: '1px solid var(--red)',
            padding: '0.3rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)',
            fontWeight: 700, letterSpacing: '0.1rem',
            color: 'var(--red)', textAlign: 'center',
            transition: '.2s',
          }}
        >
          ROLL D100 CRITICAL
        </button>
      )}
    </HudCard>
  )
}
