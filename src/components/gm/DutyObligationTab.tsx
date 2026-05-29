'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character, RefDutyType, RefObligationType } from '@/lib/types'
import { DutyObligationSetupModal } from './DutyObligationSetupModal'
import { SessionRollSimulator } from './SessionRollSimulator'
import { resolveDutyName, resolveObligationName } from '@/lib/dutyObligationUtils'
import { HUD, FONT_BODY, RADIUS, EASE, FS } from '@/lib/tokens'

// ── Design tokens ─────────────────────────────────────────────────────────────
// Pre-approved: rgba(0,0,0,*) overlays kept as-is per exception rules.
// Force conflict purple (#C878F0) is force-identity color — pre-approved exception.
// Duty blue (#4FC3F7) and obligation red (#E05050) map to CSS state tokens.
const BLUE = 'var(--state-info)'     // #4FC3F7 → duty colour
const RED  = 'var(--state-failure)'  // #E05050 → obligation / threat colour
const AMBER = 'var(--state-warning)' // #E09050 → mid-threat colour

const panelBase: React.CSSProperties = {
  background: 'rgba(8,16,10,0.88)',
  border: `1px solid ${HUD.border}`,
  borderRadius: RADIUS.lg,
  padding: '1rem',
}

function sectionHeader(label: string, color: string) {
  return (
    <div style={{
      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color, borderBottom: `1px solid ${color}22`,
      paddingBottom: '0.375rem', marginBottom: '0.75rem',
    }}>
      {label}
    </div>
  )
}

function getThreatColor(value: number): string {
  if (value >= 100) return 'var(--hud-accent-purple)'
  if (value >= 67) return RED
  if (value >= 34) return AMBER
  return 'var(--state-success)'
}

// ── Value cell: click to edit inline ─────────────────────────────────────────

interface InlineValueProps {
  value: number
  characterId: string
  field: 'duty_value' | 'obligation_value'
  color: string
  onUpdated: (id: string, field: 'duty_value' | 'obligation_value', val: number) => void
}

function InlineValue({ value, characterId, field, color, onUpdated }: InlineValueProps) {
  const [editing, setEditing]   = useState(false)
  const [local, setLocal]       = useState(String(value))
  const [busy, setBusy]         = useState(false)

  const commit = useCallback(async () => {
    const n = parseInt(local, 10)
    if (isNaN(n) || n === value) { setEditing(false); return }
    setBusy(true)
    const supabase = createClient()
    await supabase.from('characters').update({ [field]: n }).eq('id', characterId)
    onUpdated(characterId, field, n)
    setBusy(false)
    setEditing(false)
  }, [local, value, characterId, field, onUpdated])

  if (editing) {
    return (
      <input
        type="number"
        value={local}
        autoFocus
        onChange={e => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        style={{
          width: '3.25rem', textAlign: 'center',
          background: 'rgba(0,0,0,0.5)',
          border: `1px solid ${color}60`,
          borderRadius: RADIUS.sm, color,
          fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
          padding: '0.125rem 0.25rem', outline: 'none',
        }}
      />
    )
  }

  return (
    <span
      title="Click to edit"
      onClick={() => { setLocal(String(value)); setEditing(true) }}
      style={{
        fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 700, color,
        cursor: 'pointer', borderBottom: `1px dashed ${color}40`,
        opacity: busy ? 0.5 : 1,
      }}
    >
      {value}
    </span>
  )
}

// ── Single character chart row ────────────────────────────────────────────────

interface ChartRowProps {
  character: Character
  field: 'duty_value' | 'obligation_value'
  color: string
  maxValue: number
  resolvedTypeName: string
  hasCustomName: boolean
  onUpdated: (id: string, field: 'duty_value' | 'obligation_value', val: number) => void
}

function ChartRow({ character, field, color, maxValue, resolvedTypeName, hasCustomName, onUpdated }: ChartRowProps) {
  const value = character[field] ?? 0
  const barPct = maxValue > 0 ? (value / maxValue) * 100 : 0
  const isDuty = field === 'duty_value'
  const rowColor = isDuty ? color : getThreatColor(value)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: `1px solid var(--hud-surface-hi)` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: HUD.text, marginBottom: '0.0625rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {character.name}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {resolvedTypeName}
          {hasCustomName && (
            <span title="Custom name set by GM" style={{ fontSize: FS.overline, color: HUD.gold, opacity: 0.7 }}>✎</span>
          )}
        </div>
      </div>
      <div style={{ flex: 2, height: '0.375rem', background: `${rowColor}14`, borderRadius: RADIUS.sm, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, barPct)}%`,
          background: rowColor,
          borderRadius: RADIUS.sm,
          transition: EASE.smooth,
        }} />
      </div>
      <div style={{ width: '3rem', textAlign: 'right' }}>
        <InlineValue
          value={value}
          characterId={character.id}
          field={field}
          color={rowColor}
          onUpdated={onUpdated}
        />
      </div>
      {!isDuty && (
        <div style={{
          width: '0.5rem', height: '0.5rem', borderRadius: '50%',
          background: getThreatColor(value),
          flexShrink: 0,
        }} />
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface DutyObligationTabProps {
  characters: Character[]
  dutyTypes: RefDutyType[]
  obligationTypes: RefObligationType[]
  onCharacterUpdated: (id: string, updates: Partial<Character>) => void
  campaignId?: string | null
}

export function DutyObligationTab({
  characters,
  dutyTypes,
  obligationTypes,
  onCharacterUpdated,
  campaignId,
}: DutyObligationTabProps) {
  const [setupTarget, setSetupTarget] = useState<Character | null>(null)

  const unconfigured = characters.filter(c => !c.duty_obligation_configured)
  const configured   = characters.filter(c => c.duty_obligation_configured)

  const maxDuty = Math.max(1, ...characters.map(c => c.duty_value ?? 0))
  const maxObl  = Math.max(1, ...characters.map(c => c.obligation_value ?? 0))

  const criticalObl = characters.filter(c => (c.obligation_value ?? 0) >= 100)

  const handleInlineUpdate = useCallback((id: string, field: 'duty_value' | 'obligation_value', val: number) => {
    onCharacterUpdated(id, { [field]: val })
  }, [onCharacterUpdated])

  const handleSetupSaved = useCallback((updates: Partial<Character>) => {
    if (!setupTarget) return
    onCharacterUpdated(setupTarget.id, updates)
    setSetupTarget(null)
  }, [setupTarget, onCharacterUpdated])

  // Sort duty descending, obligation descending
  const sortedByDuty = [...characters].sort((a, b) => (b.duty_value ?? 0) - (a.duty_value ?? 0))
  const sortedByObl  = [...characters].sort((a, b) => (b.obligation_value ?? 0) - (a.obligation_value ?? 0))

  const btnEdit: React.CSSProperties = {
    fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', border: `1px solid ${HUD.border}`,
    borderRadius: RADIUS.sm, padding: '0.125rem 0.5rem', cursor: 'pointer',
    background: 'transparent', color: HUD.textDim, transition: EASE.quick,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Unconfigured banner ── */}
      {unconfigured.length > 0 && (
        <div style={{
          background: 'rgba(200,170,80,0.06)',
          border: `1px solid rgba(200,170,80,0.3)`,
          borderRadius: RADIUS.lg, padding: '0.75rem 1rem',
        }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, color: HUD.gold, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            ⚑ Setup Required
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {unconfigured.map(c => (
              <button
                key={c.id}
                onClick={() => setSetupTarget(c)}
                style={{
                  fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
                  border: `1px solid rgba(200,170,80,0.4)`,
                  borderRadius: RADIUS.md, padding: '0.3125rem 0.875rem',
                  background: 'rgba(200,170,80,0.1)', color: HUD.gold, cursor: 'pointer',
                }}
              >
                Configure {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Critical Obligation banner ── */}
      {/* Pre-approved exception: #C878F0 is force-identity purple */}
      {criticalObl.length > 0 && (
        <div style={{
          background: 'rgba(160,80,220,0.08)',
          border: '1px solid rgba(160,80,220,0.4)',
          borderRadius: RADIUS.lg, padding: '0.625rem 0.875rem',
        }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, color: '#C878F0', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            ☠ Critical Obligation
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: '#C878F0', lineHeight: 1.4 }}>
            {criticalObl.map(c => c.name).join(', ')} — obligation at 100. Triggers automatically every session until reduced.
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Duty chart */}
        <div style={panelBase}>
          {sectionHeader('Duty', BLUE)}
          {sortedByDuty.map(c => (
            <ChartRow
              key={c.id}
              character={c}
              field="duty_value"
              color={BLUE}
              maxValue={maxDuty}
              resolvedTypeName={resolveDutyName(c, dutyTypes)}
              hasCustomName={!!c.duty_custom_name}
              onUpdated={handleInlineUpdate}
            />
          ))}
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, marginTop: '0.625rem', textAlign: 'right' }}>
            Group Total: <span style={{ color: BLUE, fontWeight: 700 }}>{characters.reduce((s, c) => s + (c.duty_value ?? 0), 0)}</span>
          </div>
        </div>

        {/* Obligation chart */}
        <div style={panelBase}>
          {sectionHeader('Obligation', RED)}
          {sortedByObl.map(c => (
            <ChartRow
              key={c.id}
              character={c}
              field="obligation_value"
              color={RED}
              maxValue={maxObl}
              resolvedTypeName={resolveObligationName(c, obligationTypes)}
              hasCustomName={!!c.obligation_custom_name}
              onUpdated={handleInlineUpdate}
            />
          ))}
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, marginTop: '0.625rem', textAlign: 'right' }}>
            Group Total: <span style={{ color: RED, fontWeight: 700 }}>{characters.reduce((s, c) => s + (c.obligation_value ?? 0), 0)}</span>
          </div>
        </div>
      </div>

      {/* ── Session Roll Simulator ── */}
      <div style={panelBase}>
        {sectionHeader('Session Roll Simulator', HUD.gold)}
        <SessionRollSimulator
          characters={characters}
          campaignId={campaignId}
          dutyTypes={dutyTypes}
          obligationTypes={obligationTypes}
        />
      </div>

      {/* ── Per-character detail ── */}
      {configured.length > 0 && (
        <div style={panelBase}>
          {sectionHeader('Character Details', HUD.textDim)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {configured.map(c => (
              <div key={c.id} style={{
                background: 'rgba(8,16,10,0.5)',
                border: `1px solid var(--hud-surface-hi)`,
                borderRadius: RADIUS.md, padding: '0.625rem 0.875rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.body, fontWeight: 700, color: HUD.text }}>
                    {c.name}
                  </div>
                  <button
                    onClick={() => setSetupTarget(c)}
                    style={btnEdit}
                  >
                    Edit
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Duty — {resolveDutyName(c, dutyTypes)} ({c.duty_value ?? 0})
                      {c.duty_custom_name && <span title="Custom name set by GM" style={{ fontSize: FS.overline, color: HUD.gold, opacity: 0.7 }}>✎</span>}
                    </div>
                    {c.duty_lore && (
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, lineHeight: 1.5, fontStyle: 'italic' }}>
                        {c.duty_lore}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: getThreatColor(c.obligation_value ?? 0), letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Obligation — {resolveObligationName(c, obligationTypes)} ({c.obligation_value ?? 0})
                      {c.obligation_custom_name && <span title="Custom name set by GM" style={{ fontSize: FS.overline, color: HUD.gold, opacity: 0.7 }}>✎</span>}
                    </div>
                    {c.obligation_lore && (
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, lineHeight: 1.5, fontStyle: 'italic' }}>
                        {c.obligation_lore}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Setup Modal ── */}
      {setupTarget && (
        <DutyObligationSetupModal
          character={setupTarget}
          dutyTypes={dutyTypes}
          obligationTypes={obligationTypes}
          onClose={() => setSetupTarget(null)}
          onSaved={handleSetupSaved}
        />
      )}
    </div>
  )
}
