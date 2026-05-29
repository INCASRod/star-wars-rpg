'use client'

import { HUD, FS, SP, FONT_DISPLAY, FONT_BODY, COLOR } from '@/lib/tokens'
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
        display: 'flex', alignItems: 'center', gap: SP[2],
        marginBottom: SP[2], paddingBottom: SP[2],
        borderBottom: `1px solid ${HUD.borderHi}`,
      }}>
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.overline,
          fontWeight: 700, letterSpacing: '0.12rem', color: HUD.textFaint,
        }}>
          FORCE RATING
        </span>
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.body,
          fontWeight: 800, color: COLOR.blue,
        }}>
          {forceRating}
        </span>
      </div>

      {/* Power chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1] }}>
        {powers.map(p => (
          <button
            key={p.powerKey}
            onClick={() => onViewTree(p.powerKey)}
            className="force-power-chip"
            style={{
              padding: `${SP[1]} ${SP[2]}`,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: SP[1],
            }}
          >
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.caption,
              fontWeight: 700, letterSpacing: '0.06em', color: HUD.text,
            }}>
              {p.powerName}
            </span>
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.caption,
              fontWeight: 600, color: HUD.textFaint,
            }}>
              {p.purchasedCount}/{p.totalCount}
            </span>
          </button>
        ))}
      </div>
    </HudCard>
  )
}
