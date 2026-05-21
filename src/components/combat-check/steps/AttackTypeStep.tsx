'use client'
import { HUD, FS } from '@/lib/tokens'

const FONT_C = 'var(--font-body)'

interface AttackTypeStepProps {
  onSelect: (type: 'ranged' | 'melee') => void
}

const CARDS = [
  { type: 'ranged' as const, label: 'Ranged', icon: '⊙', sub: 'Ranged Light · Ranged Heavy · Gunnery' },
  { type: 'melee'  as const, label: 'Melee',  icon: '⚔', sub: 'Melee · Brawl · Lightsaber' },
]

export function AttackTypeStep({ onSelect }: AttackTypeStepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{
        fontFamily: FONT_C, fontSize: FS.caption,
        color: 'var(--hud-text-dim)', margin: '0 0 8px', letterSpacing: '0.05em',
      }}>
        Select the type of attack to make.
      </p>

      {CARDS.map(card => (
        <button
          key={card.type}
          onClick={() => onSelect(card.type)}
          className="hov-gold-border"
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '20px 20px',
            background: 'rgba(224,58,30,0.04)',
            border: `1px solid var(--hud-border)`,
            borderRadius: 12, cursor: 'pointer', textAlign: 'left',
            transition: 'border-color 120ms, background 120ms',
            width: '100%',
          }}
        >
          <span style={{
            fontSize: FS.h4, lineHeight: 1,
            color: HUD.gold, flexShrink: 0, width: 36, textAlign: 'center',
          }}>
            {card.icon}
          </span>
          <div>
            <div style={{
              fontFamily: FONT_C, fontSize: FS.sm, fontWeight: 700,
              color: 'var(--hud-text)', textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              {card.label}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: FS.overline,
              color: 'var(--hud-text-dim)', marginTop: 3,
            }}>
              {card.sub}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
