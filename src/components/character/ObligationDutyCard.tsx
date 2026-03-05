'use client'

import { HudCard } from '../ui/HudCard'

interface ObligationDutyCardProps {
  obligation?: { type: string; value: number }
  duty?: { type: string; value: number }
}

export function ObligationDutyCard({ obligation, duty }: ObligationDutyCardProps) {
  if (!obligation && !duty) return null

  return (
    <HudCard title="Obligation & Duty" animClass="au d3">
      <div style={{ display: 'flex', gap: 'var(--sp-xl)' }}>
        {obligation && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600,
                letterSpacing: '0.12rem', color: 'var(--txt3)', marginBottom: '0.15rem',
              }}>OBLIGATION</div>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt)' }}>{obligation.type}</div>
            </div>
            <div style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--red)',
            }}>{obligation.value}</div>
          </div>
        )}
        {obligation && duty && (
          <div style={{ width: '1px', background: 'var(--bdr-l)' }} />
        )}
        {duty && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600,
                letterSpacing: '0.12rem', color: 'var(--txt3)', marginBottom: '0.15rem',
              }}>DUTY</div>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt)' }}>{duty.type}</div>
            </div>
            <div style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--blue)',
            }}>{duty.value}</div>
          </div>
        )}
      </div>
    </HudCard>
  )
}
