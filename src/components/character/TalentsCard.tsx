'use client'

import { HUD, FS, SP, RADIUS, EASE, FONT_DISPLAY, FONT_BODY, ACTIVATION_COLOR } from '@/lib/tokens'
import { HudCard } from '../ui/HudCard'
import { removeBtnStyle as baseRemoveBtnStyle } from '@/lib/styles'

export interface TalentDisplay {
  name: string
  rank: number
  activation: string // 'Passive', 'Maneuver', etc.
  id?: string
  xpCost?: number
}

const removeBtnStyle: React.CSSProperties = { ...baseRemoveBtnStyle, marginLeft: 4 }

interface TalentsCardProps {
  talents: TalentDisplay[]
  animClass?: string
  onOpenTree?: () => void
  collapsible?: boolean
  defaultCollapsed?: boolean
  isGmMode?: boolean
  onRemoveTalent?: (id: string, xpCost: number) => void
}

export function TalentsCard({ talents, animClass = 'ar d4', onOpenTree, collapsible, defaultCollapsed, isGmMode, onRemoveTalent }: TalentsCardProps) {
  return (
    <HudCard title="Talents" animClass={animClass} collapsible={collapsible} defaultCollapsed={defaultCollapsed}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {talents.map((tal, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: SP[2],
            background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.borderHi}`,
            padding: `${SP[2]} ${SP[3]}`, margin: `0 ${SP[1]} ${SP[1]} 0`,
            fontSize: FS.sm, transition: EASE.default, cursor: 'default',
          }}>
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 800,
              color: 'var(--hud-accent)', background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
              width: '1.1rem', height: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {tal.rank}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: HUD.text }}>{tal.name}</div>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                fontWeight: 600, color: ACTIVATION_COLOR[tal.activation] || HUD.textDim, letterSpacing: '0.06rem',
              }}>
                {tal.activation}
              </div>
            </div>
            {isGmMode && onRemoveTalent && tal.id && (
              <button
                style={removeBtnStyle}
                title={`Remove talent (refund ${tal.xpCost || 0} XP)`}
                onClick={() => {
                  if (window.confirm(`Remove ${tal.name}? (Refund ${tal.xpCost || 0} XP)`)) {
                    onRemoveTalent(tal.id!, tal.xpCost || 0)
                  }
                }}
              >✕</button>
            )}
          </div>
        ))}
      </div>
      {onOpenTree && (
        <button
          onClick={onOpenTree}
          style={{
            width: '100%', marginTop: SP[2],
            background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
            border: `1px solid var(--hud-gold)`,
            padding: SP[2],
            cursor: 'pointer',
            fontFamily: FONT_BODY, fontSize: FS.overline,
            fontWeight: 700, letterSpacing: '0.1rem',
            color: 'var(--hud-accent)', textAlign: 'center',
            transition: EASE.default,
          }}
        >
          VIEW TALENT TREE
        </button>
      )}
    </HudCard>
  )
}
