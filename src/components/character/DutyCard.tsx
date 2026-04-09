'use client'

import { stripBBCode } from '@/lib/utils'

// ── Design tokens (inline — no import needed, file is standalone) ─────────────
const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const GOLD = '#C8AA50'
const TEXT = '#C8D8C0'
const DIM = '#6A8070'
const BLUE = '#4FC3F7'

const panelStyle: React.CSSProperties = {
  position: 'relative',
  background: 'rgba(8,16,10,0.88)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(79,195,247,0.2)',
  borderRadius: 6,
  padding: '14px 16px',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: FC, fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 2 }}>
            Duty
          </div>
          <div style={{ fontFamily: FC, fontSize: 14, fontWeight: 700, color: TEXT }}>
            {displayName}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: FC, fontSize: 22, fontWeight: 700, color: BLUE, lineHeight: 1 }}>
            {dutyValue}
          </div>
          <div style={{ fontFamily: FC, fontSize: 9, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
            / 100
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(79,195,247,0.12)', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: `linear-gradient(90deg, rgba(79,195,247,0.5), ${BLUE})`,
          borderRadius: 2,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Contribution rank */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: dutyLore ? 10 : 0 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[1, 2, 3, 4, 5].map(r => (
            <div key={r} style={{
              width: 8, height: 8, borderRadius: 1,
              background: r <= rank ? BLUE : 'rgba(79,195,247,0.12)',
              border: `1px solid ${r <= rank ? BLUE : 'rgba(79,195,247,0.2)'}`,
            }} />
          ))}
        </div>
        <span style={{ fontFamily: FC, fontSize: 10, color: DIM, letterSpacing: '0.06em' }}>
          CR{rank} — {label}
        </span>
      </div>

      {/* Lore */}
      {dutyLore && (
        <div style={{
          borderTop: '1px solid rgba(79,195,247,0.12)',
          paddingTop: 8,
          fontFamily: FC,
          fontSize: 11,
          color: DIM,
          lineHeight: 1.6,
          fontStyle: 'italic',
        }}>
          {stripBBCode(dutyLore)}
        </div>
      )}
    </div>
  )
}
