'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character, RefDutyType, RefObligationType } from '@/lib/types'
import { DutyObligationSetupModal } from './DutyObligationSetupModal'
import { SessionRollSimulator } from './SessionRollSimulator'
import { resolveDutyName, resolveObligationName } from '@/lib/dutyObligationUtils'

// ── Design tokens ─────────────────────────────────────────────────────────────
const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const GOLD = '#C8AA50'
const TEXT = '#C8D8C0'
const DIM = '#6A8070'
const FAINT = '#2A3A2E'
const BORDER = 'rgba(200,170,80,0.14)'
const BLUE = '#4FC3F7'
const RED = '#E05050'
const AMBER = '#E09050'

const panelBase: React.CSSProperties = {
  background: 'rgba(8,16,10,0.88)',
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  padding: '16px',
}

function sectionHeader(label: string, color: string) {
  return (
    <div style={{
      fontFamily: FC, fontSize: 10, fontWeight: 700,
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color, borderBottom: `1px solid ${color}22`,
      paddingBottom: 6, marginBottom: 12,
    }}>
      {label}
    </div>
  )
}

function getThreatColor(value: number): string {
  if (value >= 100) return '#C878F0'
  if (value >= 67) return RED
  if (value >= 34) return AMBER
  return '#4EC87A'
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
          width: 52, textAlign: 'center',
          background: 'rgba(0,0,0,0.5)',
          border: `1px solid ${color}60`,
          borderRadius: 3, color,
          fontFamily: FC, fontSize: 15, fontWeight: 700,
          padding: '2px 4px', outline: 'none',
        }}
      />
    )
  }

  return (
    <span
      title="Click to edit"
      onClick={() => { setLocal(String(value)); setEditing(true) }}
      style={{
        fontFamily: FC, fontSize: 18, fontWeight: 700, color,
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${FAINT}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FC, fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {character.name}
        </div>
        <div style={{ fontFamily: FC, fontSize: 10, color: DIM, display: 'flex', alignItems: 'center', gap: 4 }}>
          {resolvedTypeName}
          {hasCustomName && (
            <span title="Custom name set by GM" style={{ fontSize: 9, color: GOLD, opacity: 0.7 }}>✎</span>
          )}
        </div>
      </div>
      <div style={{ flex: 2, height: 6, background: `${rowColor}14`, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, barPct)}%`,
          background: rowColor,
          borderRadius: 3,
          transition: 'width 0.3s',
        }} />
      </div>
      <div style={{ width: 48, textAlign: 'right' }}>
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
          width: 8, height: 8, borderRadius: '50%',
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
    fontFamily: FC, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', border: `1px solid ${BORDER}`,
    borderRadius: 3, padding: '2px 8px', cursor: 'pointer',
    background: 'transparent', color: DIM, transition: '.15s',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Unconfigured banner ── */}
      {unconfigured.length > 0 && (
        <div style={{
          background: 'rgba(200,170,80,0.06)',
          border: `1px solid rgba(200,170,80,0.3)`,
          borderRadius: 6, padding: '12px 16px',
        }}>
          <div style={{ fontFamily: FC, fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
            ⚑ Setup Required
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {unconfigured.map(c => (
              <button
                key={c.id}
                onClick={() => setSetupTarget(c)}
                style={{
                  fontFamily: FC, fontSize: 11, fontWeight: 700,
                  border: `1px solid rgba(200,170,80,0.4)`,
                  borderRadius: 4, padding: '5px 14px',
                  background: 'rgba(200,170,80,0.1)', color: GOLD, cursor: 'pointer',
                }}
              >
                Configure {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Critical Obligation banner ── */}
      {criticalObl.length > 0 && (
        <div style={{
          background: 'rgba(160,80,220,0.08)',
          border: '1px solid rgba(160,80,220,0.4)',
          borderRadius: 6, padding: '10px 14px',
        }}>
          <div style={{ fontFamily: FC, fontSize: 10, fontWeight: 700, color: '#C878F0', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4 }}>
            ☠ Critical Obligation
          </div>
          <div style={{ fontFamily: FC, fontSize: 11, color: '#C878F0', lineHeight: 1.4 }}>
            {criticalObl.map(c => c.name).join(', ')} — obligation at 100. Triggers automatically every session until reduced.
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

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
          <div style={{ fontFamily: FC, fontSize: 10, color: DIM, marginTop: 10, textAlign: 'right' }}>
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
          <div style={{ fontFamily: FC, fontSize: 10, color: DIM, marginTop: 10, textAlign: 'right' }}>
            Group Total: <span style={{ color: RED, fontWeight: 700 }}>{characters.reduce((s, c) => s + (c.obligation_value ?? 0), 0)}</span>
          </div>
        </div>
      </div>

      {/* ── Session Roll Simulator ── */}
      <div style={panelBase}>
        {sectionHeader('Session Roll Simulator', GOLD)}
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
          {sectionHeader('Character Details', DIM)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {configured.map(c => (
              <div key={c.id} style={{
                background: 'rgba(8,16,10,0.5)',
                border: `1px solid ${FAINT}`,
                borderRadius: 5, padding: '10px 14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontFamily: FC, fontSize: 13, fontWeight: 700, color: TEXT }}>
                    {c.name}
                  </div>
                  <button
                    onClick={() => setSetupTarget(c)}
                    style={btnEdit}
                  >
                    Edit
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: FC, fontSize: 9, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Duty — {resolveDutyName(c, dutyTypes)} ({c.duty_value ?? 0})
                      {c.duty_custom_name && <span title="Custom name set by GM" style={{ fontSize: 9, color: GOLD, opacity: 0.7 }}>✎</span>}
                    </div>
                    {c.duty_lore && (
                      <div style={{ fontFamily: FC, fontSize: 10, color: DIM, lineHeight: 1.5, fontStyle: 'italic' }}>
                        {c.duty_lore}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontFamily: FC, fontSize: 9, color: getThreatColor(c.obligation_value ?? 0), letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Obligation — {resolveObligationName(c, obligationTypes)} ({c.obligation_value ?? 0})
                      {c.obligation_custom_name && <span title="Custom name set by GM" style={{ fontSize: 9, color: GOLD, opacity: 0.7 }}>✎</span>}
                    </div>
                    {c.obligation_lore && (
                      <div style={{ fontFamily: FC, fontSize: 10, color: DIM, lineHeight: 1.5, fontStyle: 'italic' }}>
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
