'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { C, FONT_RAJDHANI } from './design-tokens'
import { CharacterAvatar } from './CharacterAvatar'
import { CriticalInjuryPips, type CritPip } from '@/components/character/CriticalInjuryPip'
import { EncumbranceBar } from '@/components/character/EncumbranceBar'
import type { Character } from '@/lib/types'

interface HudLeftColumnProps {
  character: Character
  effectiveStats: { woundThreshold: number; strainThreshold: number; forceRating: number; soak: number } | undefined
  engineBreakdown: { woundThreshold: { label: string; value: number }[]; strainThreshold: { label: string; value: number }[] } | undefined
  woundBonus: number
  encumbranceCurrent: number
  encumbranceBonus: number
  crits: Array<{ id: string; severity: string; custom_name?: string | null; description?: string | null; roll_result?: number | null; session_label?: string | null }>
  careerName: string
  specNames: string
  onVitalAdjust: (field: 'wound_current' | 'strain_current', delta: number) => Promise<void>
  onHealCrit: (id: string) => void
  onPortraitUpload: (file: File) => Promise<void>
  onPortraitDelete: () => Promise<void>
}

export function HudLeftColumn({
  character,
  effectiveStats,
  engineBreakdown,
  woundBonus,
  encumbranceCurrent,
  encumbranceBonus,
  crits,
  careerName,
  specNames,
  onVitalAdjust,
  onHealCrit,
  onPortraitUpload,
  onPortraitDelete,
}: HudLeftColumnProps) {
  const [woundTipPos, setWoundTipPos] = useState<{ top: number; left: number } | null>(null)
  const [strainTipPos, setStrainTipPos] = useState<{ top: number; left: number } | null>(null)

  const wThreshold = effectiveStats?.woundThreshold ?? character.wound_threshold
  const sThreshold = effectiveStats?.strainThreshold ?? character.strain_threshold
  const wCurrent = character.wound_current
  const sCurrent = character.strain_current
  const wPct = wThreshold > 0 ? Math.min((wCurrent / (wThreshold + woundBonus)) * 100, 100) : 0
  const sPct = sThreshold > 0 ? Math.min((sCurrent / sThreshold) * 100, 100) : 0
  const wOver = wCurrent >= wThreshold + woundBonus
  const sOver = sCurrent >= sThreshold
  const wFill = wOver ? '#9C27B0' : '#e05252'
  const sFill = sOver ? '#9C27B0' : '#FF9800'
  const encThreshold = character.encumbrance_threshold + encumbranceBonus

  const LABEL_STYLE: React.CSSProperties = {
    fontFamily: FONT_RAJDHANI,
    fontSize: 'clamp(0.58rem, 0.9vw, 0.68rem)',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: 'rgba(224,58,30,0.5)',
    marginBottom: 5,
  }
  const CTRL_BTN: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    width: 22, height: 22,
    cursor: 'pointer',
    color: C.textDim,
    fontFamily: "'Share Tech Mono','Courier New',monospace",
    fontSize: 'clamp(0.7rem, 1.1vw, 0.82rem)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }
  const NUM_STYLE: React.CSSProperties = {
    fontFamily: "'Share Tech Mono','Courier New',monospace",
    fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)',
    color: 'rgba(90,40,24,0.7)',
    userSelect: 'none',
  }

  const critPips: CritPip[] = crits.map(c => ({
    id:          c.id,
    severity:    c.severity,
    name:        c.custom_name || 'Injury',
    description: c.description ?? undefined,
    rollResult:  c.roll_result ?? undefined,
    sessionLabel:c.session_label ?? undefined,
  }))

  const groupSources = (sources: { label: string; value: number }[]) => {
    const map = new Map<string, number>()
    for (const s of sources) {
      map.set(s.label, (map.get(s.label) ?? 0) + s.value)
    }
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
  }

  const woundBreakdown  = groupSources(engineBreakdown?.woundThreshold  ?? [])
  const strainBreakdown = groupSources(engineBreakdown?.strainThreshold ?? [])

  const VitalTooltip = ({ breakdown, top, left }: { breakdown: { label: string; value: number }[]; top: number; left: number }) => createPortal(
    <div style={{
      position: 'fixed',
      top, left,
      zIndex: 9999,
      background: 'var(--hud-surface-hi)',
      border: '1px solid rgba(224,58,30,0.35)',
      borderRadius: 8,
      padding: '8px 12px',
      minWidth: 140,
      pointerEvents: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
    }}>
      {breakdown.map(({ label, value }, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16,
          fontFamily: "'Share Tech Mono','Courier New',monospace",
          fontSize: '0.72rem', color: i === 0 ? 'rgba(90,40,24,0.55)' : 'rgba(90,40,24,0.85)',
          marginBottom: i < breakdown.length - 1 ? 3 : 0,
        }}>
          <span>{label}</span>
          <span style={{ color: i === 0 ? 'rgba(224,58,30,0.6)' : C.gold }}>{i === 0 ? value : `+${value}`}</span>
        </div>
      ))}
    </div>,
    document.body,
  )

  return (
    <div style={{
      background: 'var(--hud-surface-lo)',
      borderRight: `1px solid ${C.border}`,
      overflowY: 'auto', overflowX: 'hidden',
      padding: 'var(--space-2) var(--space-2)',
      display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
    }}>
      {/* Avatar */}
      <CharacterAvatar
        avatarUrl={character.portrait_url}
        characterName={character.name}
        career={careerName}
        spec={specNames}
        onUpload={onPortraitUpload}
        onDelete={onPortraitDelete}
      />

      {/* ── Vitals Panel (wounds + strain + crit pips) ── */}
      <div style={{
        border: '1px solid rgba(224,58,30,0.2)',
        borderRadius: 10,
        background: 'var(--hud-surface-lo)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: 14,
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* WOUNDS */}
          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}
            onMouseEnter={e => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
              setWoundTipPos({ top: r.bottom + 6, left: r.left })
            }}
            onMouseLeave={() => setWoundTipPos(null)}
          >
            {woundTipPos && woundBreakdown.length > 0 && (
              <VitalTooltip breakdown={woundBreakdown} top={woundTipPos.top} left={woundTipPos.left} />
            )}
            <div style={LABEL_STYLE}>WOUNDS</div>
            <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{
                height: '100%', width: `${wPct}%`,
                background: wFill, borderRadius: 5,
                transition: 'width 300ms ease, background 300ms ease',
              }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
              <button style={CTRL_BTN} onClick={() => onVitalAdjust('wound_current', -1)}>−</button>
              <span style={NUM_STYLE}>
                {wCurrent}/{wThreshold}
                {woundBonus > 0 && <span style={{ color: C.gold, marginLeft: 2 }}>+{woundBonus}</span>}
              </span>
              <button style={CTRL_BTN} onClick={() => onVitalAdjust('wound_current', 1)}>+</button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: 'rgba(224,58,30,0.12)', alignSelf: 'stretch', flexShrink: 0 }} />

          {/* STRAIN */}
          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}
            onMouseEnter={e => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
              setStrainTipPos({ top: r.bottom + 6, left: r.left })
            }}
            onMouseLeave={() => setStrainTipPos(null)}
          >
            {strainTipPos && strainBreakdown.length > 0 && (
              <VitalTooltip breakdown={strainBreakdown} top={strainTipPos.top} left={strainTipPos.left} />
            )}
            <div style={LABEL_STYLE}>STRAIN</div>
            <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{
                height: '100%', width: `${sPct}%`,
                background: sFill, borderRadius: 5,
                transition: 'width 300ms ease, background 300ms ease',
              }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
              <button style={CTRL_BTN} onClick={() => onVitalAdjust('strain_current', -1)}>−</button>
              <span style={NUM_STYLE}>{sCurrent}/{sThreshold}</span>
              <button style={CTRL_BTN} onClick={() => onVitalAdjust('strain_current', 1)}>+</button>
            </div>
          </div>
        </div>

        {/* Encumbrance bar */}
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(224,58,30,0.08)' }}>
          <EncumbranceBar current={encumbranceCurrent} threshold={encThreshold} brawn={character.brawn} />
        </div>

        {/* Critical injury pips */}
        <CriticalInjuryPips crits={critPips} onHeal={onHealCrit} />
      </div>

      {/* ── Characteristics strip ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 4,
      }}>
        {([
          { label: 'Brawn',     value: character.brawn },
          { label: 'Agility',   value: character.agility },
          { label: 'Intellect', value: character.intellect },
          { label: 'Cunning',   value: character.cunning },
          { label: 'Willpower', value: character.willpower },
          { label: 'Presence',  value: character.presence },
        ] as const).map(ch => (
          <div key={ch.label} style={{
            textAlign: 'center',
            padding: '6px 4px',
            background: 'var(--hud-surface-lo)',
            border: '1px solid rgba(224,58,30,0.2)',
            borderRadius: 6,
          }}>
            <div style={{
              fontFamily: "'Share Tech Mono','Courier New',monospace",
              fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
              fontWeight: 700,
              color: C.gold,
              lineHeight: 1,
            }}>
              {ch.value}
            </div>
            <div style={{
              fontFamily: FONT_RAJDHANI,
              fontSize: 'clamp(0.48rem, 0.72vw, 0.58rem)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'rgba(224,58,30,0.5)',
              marginTop: 3,
              textTransform: 'uppercase',
            }}>
              {ch.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
