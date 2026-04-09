'use client'

// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD     = '#C8AA50'
const GOLD_DIM = 'rgba(200,170,80,0.5)'
const GOLD_BD  = 'rgba(200,170,80,0.15)'
const TEXT     = 'rgba(255,255,255,0.85)'
const CARD_BG  = 'rgba(255,255,255,0.03)'
const FONT_C   = "var(--font-cinzel), 'Cinzel', serif"

interface AttackTypeStepProps {
  onSelect: (type: 'ranged' | 'melee') => void
}

interface TypeCard {
  type:     'ranged' | 'melee'
  label:    string
  icon:     string
}

const CARDS: TypeCard[] = [
  { type: 'ranged', label: 'Ranged',  icon: '⊙' },
  { type: 'melee',  label: 'Melee',   icon: '⚔' },
]

export function AttackTypeStep({ onSelect }: AttackTypeStepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{
        fontFamily: FONT_C,
        fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)',
        color: GOLD_DIM,
        margin: '0 0 8px',
        letterSpacing: '0.05em',
      }}>
        Select the type of attack to make.
      </p>

      {CARDS.map(card => (
        <button
          key={card.type}
          onClick={() => onSelect(card.type)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '20px 20px',
            background: CARD_BG,
            border: `1px solid ${GOLD_BD}`,
            borderRadius: 12,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'border-color 120ms, background 120ms, transform 120ms',
            width: '100%',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = GOLD
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,170,80,0.06)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = GOLD_BD
            ;(e.currentTarget as HTMLButtonElement).style.background = CARD_BG
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
          }}
        >
          <span style={{
            fontSize: 'clamp(1.6rem, 3vw, 2rem)',
            lineHeight: 1,
            color: GOLD,
            flexShrink: 0,
            width: 36,
            textAlign: 'center',
          }}>
            {card.icon}
          </span>
          <div>
            <div style={{
              fontFamily: FONT_C,
              fontSize: 'clamp(0.85rem, 1.4vw, 1rem)',
              fontWeight: 700,
              color: TEXT,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              {card.label}
            </div>
            <div style={{
              fontFamily: "'Share Tech Mono', 'Courier New', monospace",
              fontSize: 'clamp(0.62rem, 0.9vw, 0.72rem)',
              color: GOLD_DIM,
              marginTop: 3,
            }}>
              {card.type === 'ranged' && 'Ranged Light · Ranged Heavy · Gunnery'}
              {card.type === 'melee'  && 'Melee · Brawl · Lightsaber'}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
