'use client'

import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import { stripBBCode } from '@/lib/utils'
import { FS } from '@/lib/tokens'

const FONT_C = "var(--font-rajdhani), 'Cinzel', serif"
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"

const FORCE_BLUE     = '#7EC8E3'
const FORCE_BLUE_DIM = 'rgba(126,200,227,0.15)'
const FORCE_BLUE_SEL = 'rgba(126,200,227,0.1)'
const TEXT = 'var(--hud-text)'
const TEXT_DIM = 'var(--hud-text-dim)'

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
        fontFamily: "var(--font-body)",
        fontSize: FS.overline,
        color: 'rgba(58,12,4,0.55)',
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
          <div style={{ fontFamily: FONT_R, fontSize: FS.sm, color: TEXT_DIM }}>
            No Force powers purchased yet.
          </div>
          <div style={{ fontFamily: FONT_R, fontSize: FS.caption, color: 'rgba(58,12,4,0.4)' }}>
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
                  <span style={{ color: '#3A0C04', opacity: 0.8, fontSize: 11 }}>✦</span>
                  <span style={{
                    fontFamily: FONT_C,
                    fontSize: FS.sm,
                    fontWeight: 700,
                    color: '#3A0C04',
                  }}>
                    {p.powerName}
                  </span>
                </div>
                {desc && (
                  <div style={{
                    fontFamily: FONT_R,
                    fontSize: FS.label,
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
                  fontFamily: "var(--font-body)",
                  fontSize: FS.overline,
                  color: 'rgba(58,12,4,0.5)',
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

