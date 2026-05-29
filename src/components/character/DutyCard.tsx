'use client'

import { stripBBCode } from '@/lib/utils'
import { HUD, COLOR, FS, SP, RADIUS, EASE, FONT_BODY } from '@/lib/tokens'

const panelStyle: React.CSSProperties = {
  position: 'relative',
  background: 'var(--hud-surface-lo)',
  backdropFilter: 'blur(12px)',
  border: `1px solid rgba(79,195,247,0.2)`,
  borderRadius: RADIUS.lg,
  padding: `${SP[3]} ${SP[4]}`,
}

function contributionRank(value: number): { rank: number; label: string } {
  if (value >= 90) return { rank: 5, label: 'Hero of the Alliance' }
  if (value >= 70) return { rank: 4, label: 'Distinguished Service' }
  if (value >= 50) return { rank: 3, label: 'Proven Rebel' }
  if (value >= 30) return { rank: 2, label: 'Trusted Operative' }
  return { rank: 1, label: 'Recruit' }
}

interface DutyCardProps {
  dutyType: string
  dutyValue: number
  dutyLore?: string
  dutyCustomName?: string | null
  resolvedTypeName?: string
}

export function DutyCard({ dutyType, dutyValue, dutyLore, dutyCustomName, resolvedTypeName }: DutyCardProps) {
  const displayName = dutyCustomName || resolvedTypeName || dutyType
  const progress = Math.min(100, Math.max(0, dutyValue))
  const { rank, label } = contributionRank(progress)

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SP[2] }}>
        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, color: COLOR.blue, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: SP[1] }}>
            Duty
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: HUD.text }}>
            {displayName}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.h3, fontWeight: 700, color: COLOR.blue, lineHeight: 1 }}>
            {dutyValue}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: SP[1] }}>
            / 100
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(79,195,247,0.12)', borderRadius: RADIUS.sm, marginBottom: SP[2], overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: `linear-gradient(90deg, rgba(79,195,247,0.5), ${COLOR.blue})`,
          borderRadius: RADIUS.sm,
          transition: EASE.default,
        }} />
      </div>

      {/* Contribution rank */}
      <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], marginBottom: dutyLore ? SP[2] : 0 }}>
        <div style={{ display: 'flex', gap: SP[1] }}>
          {[1, 2, 3, 4, 5].map(r => (
            <div key={r} style={{
              width: 8, height: 8, borderRadius: RADIUS.sm,
              background: r <= rank ? COLOR.blue : 'rgba(79,195,247,0.12)',
              border: `1px solid ${r <= rank ? COLOR.blue : 'rgba(79,195,247,0.2)'}`,
            }} />
          ))}
        </div>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, letterSpacing: '0.06em' }}>
          CR{rank} — {label}
        </span>
      </div>

      {/* Lore */}
      {dutyLore && (
        <div style={{
          borderTop: '1px solid rgba(79,195,247,0.12)',
          paddingTop: SP[2],
          fontFamily: FONT_BODY,
          fontSize: FS.label,
          color: HUD.textDim,
          lineHeight: 1.6,
          fontStyle: 'italic',
        }}>
          {stripBBCode(dutyLore)}
        </div>
      )}
    </div>
  )
}
