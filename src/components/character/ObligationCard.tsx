'use client'

import { useEffect, useState } from 'react'
import { stripBBCode } from '@/lib/utils'

// ── Design tokens ─────────────────────────────────────────────────────────────
const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const TEXT = '#C8D8C0'
const DIM = '#6A8070'

function getThreatTier(value: number): {
  color: string
  bg: string
  border: string
  label: string
  warning?: string
} {
  if (value >= 100) return {
    color: '#C878F0',
    bg: 'rgba(160,80,220,0.08)',
    border: 'rgba(160,80,220,0.45)',
    label: 'Critical',
    warning: 'OBLIGATION MAXED — Triggered every session until reduced.',
  }
  if (value >= 67) return {
    color: '#E05050',
    bg: 'rgba(224,80,80,0.07)',
    border: 'rgba(224,80,80,0.3)',
    label: 'Severe',
    warning: 'High risk — this obligation is likely to trigger this session.',
  }
  if (value >= 34) return {
    color: '#E09050',
    bg: 'rgba(224,144,80,0.07)',
    border: 'rgba(224,144,80,0.28)',
    label: 'Elevated',
    warning: undefined,
  }
  return {
    color: '#4EC87A',
    bg: 'rgba(78,200,122,0.06)',
    border: 'rgba(78,200,122,0.2)',
    label: 'Low',
    warning: undefined,
  }
}

interface ObligationCardProps {
  obligationType: string
  obligationValue: number
  obligationLore?: string
  obligationCustomName?: string | null
}

export function ObligationCard({ obligationType, obligationValue, obligationLore, obligationCustomName }: ObligationCardProps) {
  const displayName = obligationCustomName || obligationType
  const value = Math.min(100, Math.max(0, obligationValue))
  const tier = getThreatTier(value)
  const [pulse, setPulse] = useState(false)

  // Pulsing animation only at 100
  useEffect(() => {
    if (value < 100) { setPulse(false); return }
    const id = setInterval(() => setPulse(p => !p), 900)
    return () => clearInterval(id)
  }, [value])

  const panelStyle: React.CSSProperties = {
    position: 'relative',
    background: tier.bg,
    backdropFilter: 'blur(12px)',
    border: `1px solid ${pulse ? tier.color : tier.border}`,
    borderRadius: 6,
    padding: '14px 16px',
    transition: 'border-color 0.4s ease',
  }

  // Threat bar: 5 segments
  const filled = Math.ceil((value / 100) * 5)

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: FC, fontSize: 10, fontWeight: 700, color: tier.color, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 2 }}>
            Obligation
          </div>
          <div style={{ fontFamily: FC, fontSize: 14, fontWeight: 700, color: TEXT }}>
            {displayName}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: FC, fontSize: 22, fontWeight: 700, color: tier.color, lineHeight: 1 }}>
            {obligationValue}
          </div>
          <div style={{ fontFamily: FC, fontSize: 9, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
            / 100
          </div>
        </div>
      </div>

      {/* Threat meter — 5 segments */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map(seg => (
          <div key={seg} style={{
            flex: 1, height: 5, borderRadius: 2,
            background: seg <= filled ? tier.color : `${tier.color}18`,
            border: `1px solid ${seg <= filled ? tier.color : `${tier.color}30`}`,
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Tier badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: tier.warning ? 8 : (obligationLore ? 10 : 0) }}>
        <span style={{
          fontFamily: FC, fontSize: 9, fontWeight: 700,
          color: tier.color, background: `${tier.color}18`,
          border: `1px solid ${tier.color}40`,
          borderRadius: 3, padding: '1px 6px',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {tier.label}
        </span>
        <span style={{ fontFamily: FC, fontSize: 10, color: DIM }}>Threat Level</span>
      </div>

      {/* Warning banner */}
      {tier.warning && (
        <div style={{
          background: `${tier.color}12`,
          border: `1px solid ${tier.color}35`,
          borderRadius: 4,
          padding: '6px 10px',
          marginBottom: obligationLore ? 10 : 0,
          fontFamily: FC,
          fontSize: 10,
          color: tier.color,
          letterSpacing: '0.04em',
          lineHeight: 1.4,
        }}>
          ⚠ {tier.warning}
        </div>
      )}

      {/* Lore */}
      {obligationLore && (
        <div style={{
          borderTop: `1px solid ${tier.color}18`,
          paddingTop: 8,
          fontFamily: FC,
          fontSize: 11,
          color: DIM,
          lineHeight: 1.6,
          fontStyle: 'italic',
        }}>
          {stripBBCode(obligationLore)}
        </div>
      )}
    </div>
  )
}
