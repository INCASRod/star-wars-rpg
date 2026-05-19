'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { C } from './design-tokens'
import { FONT_BODY, FS, RADIUS, SHADOW, SP, Z } from '@/lib/tokens'
import { CriticalInjuryPips, type CritPip } from '@/components/character/CriticalInjuryPip'
import { EncumbranceBar } from '@/components/character/EncumbranceBar'
import type { Character } from '@/lib/types'
import type { EffectiveStats } from '@/lib/derivedStats'

interface HudStatusStripProps {
  character: Character
  effectiveStats: EffectiveStats | undefined
  engineBreakdown: { woundThreshold: { label: string; value: number }[]; strainThreshold: { label: string; value: number }[] } | undefined
  woundBonus: number
  encumbranceCurrent: number
  encumbranceBonus: number
  crits: Array<{ id: string; severity: string; custom_name?: string | null; description?: string | null; roll_result?: number | null; session_label?: string | null }>
  forceRating: number
  isCombat: boolean
  onVitalAdjust: (field: 'wound_current' | 'strain_current', delta: number) => Promise<void>
  onHealCrit: (id: string) => void
}

function groupSources(sources: { label: string; value: number }[]): { label: string; value: number }[] {
  const map = new Map<string, number>()
  for (const s of sources) map.set(s.label, (map.get(s.label) ?? 0) + s.value)
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
}

const CTRL_BTN: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--hud-vital-sep)',
  borderRadius: RADIUS.md, width: 20, height: 20,
  cursor: 'pointer', color: 'var(--hud-vital-text-dim)',
  fontFamily: FONT_BODY,
  fontSize: FS.caption,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}

const LABEL_S: React.CSSProperties = {
  fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase',
  color: 'var(--hud-vital-text-dim)', whiteSpace: 'nowrap',
}

const NUM_S: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: FS.caption,
  color: 'var(--hud-vital-text)', userSelect: 'none',
  minWidth: 32, textAlign: 'center',
}

const DIVIDER: React.CSSProperties = {
  width: 1, background: 'var(--hud-vital-sep)', alignSelf: 'stretch', flexShrink: 0,
}

interface VitalTooltipProps {
  breakdown: { label: string; value: number }[]
  top: number
  left: number
}

function VitalTooltip({ breakdown, top, left }: VitalTooltipProps) {
  return createPortal(
    <div style={{
      position: 'fixed', top, left, zIndex: Z.tooltip,
      background: 'var(--hud-surface-hi)', border: '1px solid var(--hud-border-hi)',
      borderRadius: RADIUS.lg, padding: '8px 12px', minWidth: 140,
      pointerEvents: 'none', boxShadow: SHADOW.lg,
    }}>
      {breakdown.map(({ label, value }, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', gap: SP[4],
          fontFamily: FONT_BODY,
          fontSize: FS.caption,
          color: i === 0 ? 'var(--hud-text-faint)' : 'var(--hud-text-dim)',
          marginBottom: i < breakdown.length - 1 ? SP[1] : 0,
        }}>
          <span>{label}</span>
          <span style={{ color: i === 0 ? 'var(--hud-text-dim)' : C.gold }}>
            {i === 0 ? value : `+${value}`}
          </span>
        </div>
      ))}
    </div>,
    document.body,
  )
}

export function HudStatusStrip({
  character, effectiveStats, engineBreakdown, woundBonus,
  encumbranceCurrent, encumbranceBonus, crits,
  forceRating, isCombat,
  onVitalAdjust, onHealCrit,
}: HudStatusStripProps) {
  const [woundTipPos,  setWoundTipPos]  = useState<{ top: number; left: number } | null>(null)
  const [strainTipPos, setStrainTipPos] = useState<{ top: number; left: number } | null>(null)

  const wThreshold = effectiveStats?.woundThreshold ?? character.wound_threshold
  const sThreshold = effectiveStats?.strainThreshold ?? character.strain_threshold
  const wCurrent   = character.wound_current
  const sCurrent   = character.strain_current
  const wPct = wThreshold > 0 ? Math.min((wCurrent / (wThreshold + woundBonus)) * 100, 100) : 0
  const sPct = sThreshold > 0 ? Math.min((sCurrent / sThreshold) * 100, 100) : 0
  const wOver = wCurrent >= wThreshold + woundBonus
  const sOver = sCurrent >= sThreshold
  const encThreshold = character.encumbrance_threshold + encumbranceBonus

  const woundBreakdown  = groupSources(engineBreakdown?.woundThreshold  ?? [])
  const strainBreakdown = groupSources(engineBreakdown?.strainThreshold ?? [])

  const critPips: CritPip[] = crits.map(c => ({
    id: c.id, severity: c.severity, name: c.custom_name || 'Injury',
    description: c.description ?? undefined, rollResult: c.roll_result ?? undefined,
    sessionLabel: c.session_label ?? undefined,
  }))

  return (
    <div style={{
      gridColumn: '1 / -1',
      background: 'var(--hud-vital-bg)',
      backdropFilter: 'blur(8px)',
      borderBottom: `2px solid var(--hud-vital-border)`,
      display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
      padding: '6px var(--space-3)', flexShrink: 0,
      transition: 'background 0.6s, border-color 0.6s',
    }}>
      {/* WOUNDS */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, position: 'relative' }}
        onMouseEnter={e => {
          const r = e.currentTarget.getBoundingClientRect()
          setWoundTipPos({ top: r.bottom + 6, left: r.left })
        }}
        onMouseLeave={() => setWoundTipPos(null)}
      >
        {woundTipPos && woundBreakdown.length > 0 && (
          <VitalTooltip breakdown={woundBreakdown} top={woundTipPos.top} left={woundTipPos.left} />
        )}
        <span style={LABEL_S}>Wounds</span>
        <button style={CTRL_BTN} onClick={() => onVitalAdjust('wound_current', -1)}>−</button>
        <div style={{ width: 56, height: 7, background: 'rgba(0,0,0,.35)', borderRadius: RADIUS.md, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{
            height: '100%', width: `${wPct}%`,
            background: wOver ? 'rgba(255,112,80,.45)' : 'var(--hud-vital-wounds)',
            borderRadius: RADIUS.md, transition: 'width 300ms ease, background 300ms ease',
          }} />
        </div>
        <span style={NUM_S}>
          {wCurrent}/{wThreshold}
          {woundBonus > 0 && <span style={{ color: C.gold, marginLeft: 2 }}>+{woundBonus}</span>}
        </span>
        <button style={CTRL_BTN} onClick={() => onVitalAdjust('wound_current', 1)}>+</button>
      </div>

      <div style={DIVIDER} />

      {/* STRAIN */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, position: 'relative' }}
        onMouseEnter={e => {
          const r = e.currentTarget.getBoundingClientRect()
          setStrainTipPos({ top: r.bottom + 6, left: r.left })
        }}
        onMouseLeave={() => setStrainTipPos(null)}
      >
        {strainTipPos && strainBreakdown.length > 0 && (
          <VitalTooltip breakdown={strainBreakdown} top={strainTipPos.top} left={strainTipPos.left} />
        )}
        <span style={LABEL_S}>Strain</span>
        <button style={CTRL_BTN} onClick={() => onVitalAdjust('strain_current', -1)}>−</button>
        <div style={{ width: 56, height: 7, background: 'rgba(0,0,0,.35)', borderRadius: RADIUS.md, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{
            height: '100%', width: `${sPct}%`,
            background: sOver ? 'rgba(255,176,96,.45)' : 'var(--hud-vital-strain)',
            borderRadius: RADIUS.md, transition: 'width 300ms ease, background 300ms ease',
          }} />
        </div>
        <span style={NUM_S}>{sCurrent}/{sThreshold}</span>
        <button style={CTRL_BTN} onClick={() => onVitalAdjust('strain_current', 1)}>+</button>
      </div>

      <div style={DIVIDER} />

      {/* ENC — compact inline display */}
      <EncumbranceBar
        current={encumbranceCurrent}
        threshold={encThreshold}
        brawn={character.brawn}
        compact
      />

      <div style={DIVIDER} />

      {/* CRITS — blood-drop pips, null when empty */}
      <CriticalInjuryPips crits={critPips} onHeal={onHealCrit} />

      {/* Spacer */}
      <div style={{ flex: 1 }} />
    </div>
  )
}
