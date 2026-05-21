'use client'

import type { Character } from '@/lib/types'
import { HUD } from '@/lib/tokens'

const FONT = 'var(--font-body)'
const RED   = '#C04040'
const AMBER = '#C08040'

interface Props {
  character:    Character
  onAddWound:   (id: string) => void
  onHealWound:  (id: string) => void
  onAddStrain:  (id: string) => void
  onHealStrain: (id: string) => void
  onClick:      () => void
}

export function GmPartyMiniCard({ character: c, onAddWound, onHealWound, onAddStrain, onHealStrain, onClick }: Props) {
  const wPct     = Math.min(100, (c.wound_current / c.wound_threshold) * 100)
  const sPct     = Math.min(100, (c.strain_current / c.strain_threshold) * 100)
  const isDown   = c.wound_current >= c.wound_threshold
  const isHurt   = !isDown && wPct >= 50
  const leftBdr  = isDown ? RED : 'transparent'

  const stepBtn: React.CSSProperties = {
    width:          18,
    height:         18,
    background:     'rgba(0,0,0,0.3)',
    border:         '1px solid var(--hud-border-hi)',
    borderRadius:   2,
    cursor:         'pointer',
    color:          'var(--hud-text-dim)',
    fontSize:       10,
    fontFamily:     FONT,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  }

  return (
    <div
      style={{
        background:  'var(--hud-surface-mid)',
        border:      `1px solid var(--hud-border-hi)`,
        borderLeft:  `3px solid ${leftBdr}`,
        borderRadius: 4,
        padding:     '8px 10px',
        cursor:      'pointer',
        transition:  'background 0.15s',
        boxShadow:   isDown ? '0 0 8px rgba(192,64,64,0.2)' : undefined,
      }}
      onClick={onClick}
    >
      {/* Name + species/career */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--hud-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {c.name}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: 'var(--hud-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 1 }}>
          {c.species_key} · {c.career_key}
        </div>
      </div>

      {/* Wounds */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
          <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: RED, fontWeight: 700, flex: 1 }}>W</span>
          <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: isDown ? RED : 'var(--hud-text)', fontWeight: 700 }}>
            {c.wound_current}<span style={{ color: 'var(--hud-text-dim)' }}>/{c.wound_threshold}</span>
          </span>
          <button onClick={e => { e.stopPropagation(); onHealWound(c.id) }} style={stepBtn}>−</button>
          <button onClick={e => { e.stopPropagation(); onAddWound(c.id) }} style={stepBtn}>+</button>
        </div>
        <div style={{ height: 3, background: 'var(--hud-surface-lo)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${wPct}%`, background: isDown ? RED : isHurt ? AMBER : HUD.gold, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Strain */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
          <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: '#5AAAE0', fontWeight: 700, flex: 1 }}>S</span>
          <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: 'var(--hud-text)', fontWeight: 700 }}>
            {c.strain_current}<span style={{ color: 'var(--hud-text-dim)' }}>/{c.strain_threshold}</span>
          </span>
          <button onClick={e => { e.stopPropagation(); onHealStrain(c.id) }} style={stepBtn}>−</button>
          <button onClick={e => { e.stopPropagation(); onAddStrain(c.id) }} style={stepBtn}>+</button>
        </div>
        <div style={{ height: 3, background: 'var(--hud-surface-lo)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${sPct}%`, background: sPct >= 100 ? RED : '#5AAAE0', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Soak */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: 'var(--hud-text-dim)' }}>Soak </span>
        <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, color: HUD.gold, marginLeft: 4 }}>{c.soak}</span>
      </div>
    </div>
  )
}
