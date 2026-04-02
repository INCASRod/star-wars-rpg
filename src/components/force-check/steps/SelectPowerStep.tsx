'use client'

import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import { stripBBCode } from '@/lib/utils'

const FONT_C = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M = "'Share Tech Mono', 'Courier New', monospace"
const FORCE_BLUE     = '#7EC8E3'
const FORCE_BLUE_DIM = 'rgba(126,200,227,0.15)'
const FORCE_BLUE_SEL = 'rgba(126,200,227,0.1)'
const TEXT     = 'rgba(232,223,200,0.9)'
const TEXT_DIM = 'rgba(232,223,200,0.5)'

interface SelectPowerStepProps {
  powers:           ForcePowerDisplay[]
  selectedPowerKey: string | null
  onSelect:         (key: string) => void
}

export function SelectPowerStep({ powers, selectedPowerKey, onSelect }: SelectPowerStepProps) {
  const purchased = powers.filter(p => p.purchasedCount > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        fontFamily: FONT_M,
        fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)',
        color: 'rgba(126,200,227,0.55)',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
      }}>
        Which power will you use?
      </div>

      {purchased.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '32px 16px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.85rem, 1.3vw, 1rem)', color: TEXT_DIM }}>
            No Force powers purchased yet.
          </div>
          <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', color: 'rgba(126,200,227,0.35)' }}>
            Visit the Force tab to purchase powers.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {purchased.map(p => {
            const selected = p.powerKey === selectedPowerKey
            const desc     = p.description ? stripBBCode(p.description) : ''
            return (
              <button
                key={p.powerKey}
                onClick={() => onSelect(p.powerKey)}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  background: selected ? FORCE_BLUE_SEL : 'rgba(126,200,227,0.04)',
                  border: `${selected ? 2 : 1}px solid ${selected ? FORCE_BLUE : FORCE_BLUE_DIM}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: desc ? 6 : 0 }}>
                  <span style={{ color: FORCE_BLUE, opacity: 0.8, fontSize: 11 }}>✦</span>
                  <span style={{
                    fontFamily: FONT_C,
                    fontSize: 'clamp(0.88rem, 1.4vw, 1.05rem)',
                    fontWeight: 700,
                    color: FORCE_BLUE,
                  }}>
                    {p.powerName}
                  </span>
                </div>
                {desc && (
                  <div style={{
                    fontFamily: FONT_R,
                    fontSize: 'clamp(0.8rem, 1.2vw, 0.92rem)',
                    color: TEXT_DIM,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: 4,
                  }}>
                    {desc}
                  </div>
                )}
                <div style={{
                  fontFamily: FONT_M,
                  fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)',
                  color: 'rgba(126,200,227,0.45)',
                }}>
                  {p.purchasedCount} upgrade{p.purchasedCount !== 1 ? 's' : ''} purchased
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
