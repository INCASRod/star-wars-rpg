'use client'

import { useState } from 'react'
import { HudCard } from '../ui/HudCard'
import { HUD, FS, SP, RADIUS, EASE, FONT_BODY } from '@/lib/tokens'

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
          textAlign: 'center', padding: `${SP[1]} 0`,
          fontFamily: FONT_BODY, fontSize: FS.caption,
          color: HUD.textFaint, letterSpacing: '0.15rem',
        }}>
          NO ACTIVE INJURIES
        </div>
      ) : (
        injuries.map((inj) => (
          <div key={inj.id} style={{
            padding: `${SP[1]} 0`,
            borderBottom: `1px solid ${HUD.borderHi}`,
            opacity: inj.isHealed ? 0.4 : 1,
          }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: SP[1],
                cursor: inj.description ? 'pointer' : 'default',
              }}
              onClick={() => inj.description && setExpanded(expanded === inj.id ? null : inj.id)}
            >
              <div style={{
                width: '0.42rem', height: '0.42rem', borderRadius: RADIUS.full, flexShrink: 0,
                background: inj.isHealed ? 'var(--green)' : 'var(--red)',
                boxShadow: inj.isHealed ? 'none' : '0 0 0.4rem var(--red)',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: FS.label, fontWeight: 600, color: HUD.text }}>{inj.name}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint }}>{inj.severity}</div>
              </div>
              {!inj.isHealed && onHealCrit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onHealCrit(inj.id) }}
                  title="Heal this injury"
                  style={{
                    background: 'none', border: `1px solid ${HUD.borderHi}`,
                    width: '1.2rem', height: '1.2rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: FS.label, color: 'var(--green)', fontWeight: 700,
                    transition: EASE.default, flexShrink: 0,
                  }}
                >
                  +
                </button>
              )}
            </div>
            {expanded === inj.id && inj.description && (
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.caption,
                color: HUD.textDim, padding: `${SP[1]} 0 ${SP[1]} 1rem`,
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
            width: '100%', marginTop: SP[1],
            background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
            border: '1px solid var(--red)',
            padding: SP[1],
            cursor: 'pointer',
            fontFamily: FONT_BODY, fontSize: FS.caption,
            fontWeight: 700, letterSpacing: '0.1rem',
            color: 'var(--red)', textAlign: 'center',
            transition: EASE.default,
          }}
        >
          ROLL D100 CRITICAL
        </button>
      )}
    </HudCard>
  )
}
