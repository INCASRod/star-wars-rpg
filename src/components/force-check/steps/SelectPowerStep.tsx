'use client'

import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import { stripBBCode } from '@/lib/utils'
import { FS, HUD, FONT_DISPLAY, FONT_BODY } from '@/lib/tokens'

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
        color: HUD.textDim,
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
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: TEXT_DIM }}>
            No Force powers purchased yet.
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint }}>
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
                  <span style={{ color: HUD.text, opacity: 0.8, fontSize: 11 }}>✦</span>
                  <span style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: FS.sm,
                    fontWeight: 700,
                    color: HUD.text,
                  }}>
                    {p.powerName}
                  </span>
                </div>
                {desc && (
                  <div style={{
                    fontFamily: FONT_BODY,
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
                  color: HUD.textFaint,
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
