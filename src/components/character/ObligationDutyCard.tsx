'use client'

import { useState } from 'react'
import { HudCard } from '../ui/HudCard'

interface ObligationDutyCardProps {
  obligation?: { type: string; value: number }
  duty?: { type: string; value: number }
  isGmMode?: boolean
  onObligationChange?: (field: 'type' | 'value', value: string | number) => void
  onDutyChange?: (field: 'type' | 'value', value: string | number) => void
}

const gmBtnStyle: React.CSSProperties = {
  width: 20, height: 20, fontSize: 'var(--text-caption)', fontWeight: 700,
  background: 'var(--gold-glow)', border: '1px solid var(--gold)',
  color: 'var(--gold-d)', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 0,
  lineHeight: 1, flexShrink: 0,
}

function EditableSection({
  label, type, value, color, onChange,
}: {
  label: string; type: string; value: number; color: string
  onChange: (field: 'type' | 'value', value: string | number) => void
}) {
  const [editType, setEditType] = useState(type)
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600,
        letterSpacing: '0.12rem', color: 'var(--txt3)', marginBottom: '0.25rem',
      }}>{label}</div>
      <input
        value={editType}
        onChange={e => setEditType(e.target.value)}
        onBlur={() => onChange('type', editType)}
        style={{
          fontSize: 'var(--text-body-sm)', padding: '2px 6px', fontWeight: 600,
          color: 'var(--txt)', background: 'var(--white)',
          border: '1px solid var(--bdr-l)', width: '100%', marginBottom: 4,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button style={gmBtnStyle} onClick={() => onChange('value', Math.max(0, value - 5))}>−</button>
        <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)', fontWeight: 800, color, minWidth: 20, textAlign: 'center' }}>{value}</span>
        <button style={gmBtnStyle} onClick={() => onChange('value', value + 5)}>+</button>
      </div>
    </div>
  )
}

export function ObligationDutyCard({ obligation, duty, isGmMode, onObligationChange, onDutyChange }: ObligationDutyCardProps) {
  // In GM mode, show sections even if empty so GM can add values
  if (!isGmMode && !obligation && !duty) return null

  return (
    <HudCard title="Obligation & Duty" animClass="au d3">
      <div style={{ display: 'flex', gap: 'var(--sp-xl)' }}>
        {isGmMode && onObligationChange ? (
          <EditableSection
            label="OBLIGATION"
            type={obligation?.type || ''}
            value={obligation?.value || 0}
            color="var(--red)"
            onChange={onObligationChange}
          />
        ) : obligation ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600,
                letterSpacing: '0.12rem', color: 'var(--txt3)', marginBottom: '0.25rem',
              }}>OBLIGATION</div>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt)' }}>{obligation.type}</div>
            </div>
            <div style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--red)',
            }}>{obligation.value}</div>
          </div>
        ) : null}
        {(obligation || isGmMode) && (duty || isGmMode) && (
          <div style={{ width: '1px', background: 'var(--bdr-l)' }} />
        )}
        {isGmMode && onDutyChange ? (
          <EditableSection
            label="DUTY"
            type={duty?.type || ''}
            value={duty?.value || 0}
            color="var(--blue)"
            onChange={onDutyChange}
          />
        ) : duty ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600,
                letterSpacing: '0.12rem', color: 'var(--txt3)', marginBottom: '0.25rem',
              }}>DUTY</div>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt)' }}>{duty.type}</div>
            </div>
            <div style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--blue)',
            }}>{duty.value}</div>
          </div>
        ) : null}
      </div>
    </HudCard>
  )
}
