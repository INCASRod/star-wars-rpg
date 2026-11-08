'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character, RefDutyType, RefObligationType } from '@/lib/types'
import { DutyObligationSetupModal } from './DutyObligationSetupModal'
import { SessionRollSimulator } from './SessionRollSimulator'
import { resolveDutyName, resolveObligationName } from '@/lib/dutyObligationUtils'
import { HUD, FONT_BODY, RADIUS, EASE, FS, SP } from '@/lib/tokens'
import { NumberField } from '@/components/ui/NumberField'
import { useXpHold, setXpHold } from '@/lib/xpSpendingFreeze'

// ── Colours ───────────────────────────────────────────────────────────────────
// All four threat bands and the duty colour come from the theme-agnostic state
// tokens in src/styles/state-tokens.css (--state-info/-success/-warning/-failure/-critical).
// Every one must be defined there: an undefined var() renders as no colour at all.
const BLUE  = 'var(--state-info)'     // duty
const RED   = 'var(--state-failure)'  // obligation, 67-99
const AMBER = 'var(--state-warning)'  // obligation, 34-66
// Layout dimensions below (bar height, dot size, column widths, grid minmax) are sizes, not
// spacing, and have no token. HAIR is the 2px minimum for sub-SP[1] gaps and padding.
const HAIR = '2px'

const panelBase: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--hud-bg) 88%, transparent)',
  border: `1px solid ${HUD.border}`,
  borderRadius: RADIUS.lg,
  padding: SP[3],
}

function sectionHeader(label: string, color: string) {
  return (
    <div style={{
      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color, borderBottom: `1px solid color-mix(in srgb, ${color} 13%, transparent)`,
      paddingBottom: SP[1], marginBottom: SP[2],
    }}>
      {label}
    </div>
  )
}

function getThreatColor(value: number): string {
  if (value >= 100) return 'var(--state-critical)'
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
      <NumberField
        value={local}
        autoFocus
        onChange={e => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        style={{
          width: '3.25rem', textAlign: 'center',
          background: 'color-mix(in srgb, var(--hud-bg) 50%, transparent)',
          border: `1px solid color-mix(in srgb, ${color} 38%, transparent)`,
          borderRadius: RADIUS.sm, color,
          fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
          padding: `${HAIR} ${SP[1]}`, outline: 'none',
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
        cursor: 'pointer', borderBottom: `1px dashed color-mix(in srgb, ${color} 25%, transparent)`,
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
    <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], padding: `${SP[1]} 0`, borderBottom: `1px solid var(--hud-surface-hi)` }}>
      <div style={{ flex: '2 1 9rem', minWidth: 0 }}>
        <div title={character.name} style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: HUD.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {character.name}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, display: 'flex', alignItems: 'center', gap: SP[1] }}>
          {resolvedTypeName}
          {hasCustomName && (
            <span title="Custom name set by GM" style={{ fontSize: FS.overline, color: HUD.gold, opacity: 0.7 }}>✎</span>
          )}
        </div>
      </div>
      <div style={{ flex: '1 1 4rem', height: '0.375rem', background: `color-mix(in srgb, ${rowColor} 8%, transparent)`, borderRadius: RADIUS.sm, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, barPct)}%`,
          background: rowColor,
          borderRadius: RADIUS.sm,
          transition: EASE.smooth,
        }} />
      </div>
      <div style={{ width: '3rem', flexShrink: 0, textAlign: 'right' }}>
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
          width: '0.5rem', height: '0.5rem', borderRadius: RADIUS.full,
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

// ── XP hold: GM pause on player XP spending ──────────────────────────────────
// Manual only. Players keep earning XP; the database refuses their spending while on (migration 161).

function XpHoldPanel({ partyObligation }: { partyObligation: number }) {
  const hold = useXpHold()
  // The typed text; null means "show the saved reason" (kept after a hold is lifted so it can be reused).
  const [draft, setDraft] = useState<string | null>(null)
  const reason = draft ?? hold.reason ?? ''
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    if (!hold.id || busy) return
    setBusy(true)
    setError(null)
    const err = await setXpHold(createClient(), hold.id, !hold.frozen, reason)
    if (err) setError(err)
    else setDraft(null)
    setBusy(false)
  }

  const over = partyObligation > 100
  const ready = !!hold.id && !hold.loading
  return (
    <div style={panelBase}>
      {sectionHeader('XP Spending', hold.frozen ? 'var(--state-warning)' : HUD.textDim)}
      {over && (
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--state-critical)', lineHeight: 1.4, marginBottom: SP[2],
        }}>
          Party Obligation is over 100. By the rules, XP spending is frozen until it drops back to 100.
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: SP[2] }}>
        <input
          type="text"
          value={reason}
          maxLength={80}
          disabled={hold.frozen}
          onChange={e => setDraft(e.target.value)}
          placeholder="e.g. Party Obligation is over 100"
          aria-label="Reason shown to players"
          style={{
            flex: '1 1 14rem', minWidth: 0, fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.text,
            background: 'color-mix(in srgb, var(--hud-bg) 50%, transparent)', border: `1px solid ${HUD.border}`,
            borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[2]}`,
          }}
        />
        <button
          type="button"
          role="switch"
          aria-checked={hold.frozen}
          disabled={!ready || busy}
          onClick={() => void toggle()}
          style={{
            fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, cursor: ready && !busy ? 'pointer' : 'not-allowed',
            borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[3]}`, transition: EASE.quick,
            color: hold.frozen ? 'var(--state-warning)' : HUD.textDim,
            background: hold.frozen ? 'color-mix(in srgb, var(--state-warning) 12%, transparent)' : 'transparent',
            border: `1px solid ${hold.frozen ? 'color-mix(in srgb, var(--state-warning) 45%, transparent)' : HUD.border}`,
          }}
        >
          {hold.frozen ? 'Resume XP spending' : 'Pause XP spending'}
        </button>
      </div>
      {hold.frozen && (
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textDim, marginTop: SP[2] }}>
          Players cannot spend XP. They can still earn it.
        </div>
      )}
      {error && <div role="alert" style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--state-failure)', marginTop: SP[2] }}>{error}</div>}
    </div>
  )
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
    borderRadius: RADIUS.sm, padding: `${HAIR} ${SP[1]}`, cursor: 'pointer',
    background: 'transparent', color: HUD.textDim, transition: EASE.quick,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[4] }}>

      {/* ── Unconfigured banner ── */}
      {unconfigured.length > 0 && (
        <div style={{
          background: 'color-mix(in srgb, var(--gold) 6%, transparent)',
          border: '1px solid color-mix(in srgb, var(--gold) 30%, transparent)',
          borderRadius: RADIUS.lg, padding: `${SP[2]} ${SP[3]}`,
        }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, color: HUD.gold, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: SP[1] }}>
            ⚑ Setup Required
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1] }}>
            {unconfigured.map(c => (
              <button
                key={c.id}
                onClick={() => setSetupTarget(c)}
                style={{
                  fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
                  border: '1px solid color-mix(in srgb, var(--gold) 40%, transparent)',
                  borderRadius: RADIUS.md, padding: `${SP[1]} ${SP[2]}`,
                  background: 'color-mix(in srgb, var(--gold) 10%, transparent)', color: HUD.gold, cursor: 'pointer',
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
          background: 'color-mix(in srgb, var(--state-critical) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--state-critical) 40%, transparent)',
          borderRadius: RADIUS.lg, padding: `${SP[1]} ${SP[2]}`,
        }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, color: 'var(--state-critical)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: SP[1] }}>
            ☠ Critical Obligation
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--state-critical)', lineHeight: 1.4 }}>
            {criticalObl.map(c => c.name).join(', ')} — obligation at 100. Triggers automatically every session until reduced.
          </div>
        </div>
      )}

      <XpHoldPanel partyObligation={characters.reduce((sum, c) => sum + (c.obligation_value ?? 0), 0)} />

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 22rem), 1fr))', gap: SP[3] }}>

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
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, marginTop: SP[2], textAlign: 'right' }}>
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
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, marginTop: SP[2], textAlign: 'right' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
            {configured.map(c => (
              <div key={c.id} style={{
                background: 'color-mix(in srgb, var(--hud-bg) 50%, transparent)',
                border: '1px solid var(--hud-surface-hi)',
                borderRadius: RADIUS.md, padding: `${SP[1]} ${SP[2]}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SP[1] }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SP[1] }}>
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: HAIR, display: 'flex', alignItems: 'center', gap: SP[1] }}>
                      Duty — {resolveDutyName(c, dutyTypes)} ({c.duty_value ?? 0})
                      {c.duty_custom_name && <span title="Custom name set by GM" style={{ fontSize: FS.overline, color: HUD.gold, opacity: 0.7 }}>✎</span>}
                    </div>
                    {(c.duty_lore || c.duty_notes) && (
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, lineHeight: 1.5, fontStyle: 'italic' }}>
                        {c.duty_lore || c.duty_notes}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: getThreatColor(c.obligation_value ?? 0), letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: HAIR, display: 'flex', alignItems: 'center', gap: SP[1] }}>
                      Obligation — {resolveObligationName(c, obligationTypes)} ({c.obligation_value ?? 0})
                      {c.obligation_custom_name && <span title="Custom name set by GM" style={{ fontSize: FS.overline, color: HUD.gold, opacity: 0.7 }}>✎</span>}
                    </div>
                    {(c.obligation_lore || c.obligation_notes) && (
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, lineHeight: 1.5, fontStyle: 'italic' }}>
                        {c.obligation_lore || c.obligation_notes}
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
