'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSessionRollState } from '@/hooks/useSessionRollState'
import type { SessionRollState } from '@/hooks/useSessionRollState'
import type { Character, RefDutyType, RefObligationType } from '@/lib/types'
import { resolveDutyName, resolveObligationName } from '@/lib/dutyObligationUtils'
import { HUD, FONT_BODY, EASE, FS, RADIUS } from '@/lib/tokens'

// ── Design tokens ─────────────────────────────────────────────────────────────
const TEXT   = HUD.text
const DIM    = HUD.textDim
const FAINT  = HUD.textFaint
const BORDER = HUD.border
const BLUE   = '#4FC3F7'   // pre-approved: force/duty identity color
const RED    = 'var(--state-failure)'
const GREEN  = 'var(--state-success)'

const panelBase: React.CSSProperties = {
  background: HUD.panel,
  border: `1px solid ${BORDER}`,
  borderRadius: RADIUS.lg,
  padding: '1rem',
}

// ── Range table ───────────────────────────────────────────────────────────────

interface RangeEntry {
  characterId: string
  characterName: string
  typeName?: string
  value: number
  rangeLow: number
  rangeHigh: number
}

function buildRangeTable(
  chars: Character[],
  field: 'duty_value' | 'obligation_value',
  resolveTypeName?: (c: Character) => string,
): RangeEntry[] {
  const sorted = [...chars]
    .filter(c => (c[field] ?? 0) > 0)
    .sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0))
  let cursor = 0
  return sorted.map(c => {
    const val = c[field] ?? 0
    const entry: RangeEntry = {
      characterId: c.id, characterName: c.name, value: val,
      rangeLow: cursor + 1, rangeHigh: cursor + val,
      typeName: resolveTypeName ? resolveTypeName(c) : undefined,
    }
    cursor += val
    return entry
  })
}

// ── Roll computation ──────────────────────────────────────────────────────────

interface RollResult {
  roll: number
  groupTotal: number
  isDoubles: boolean
  triggered: boolean
  triggeredEntry?: RangeEntry
  doublesNote?: string
}

function computeRoll(rangeTable: RangeEntry[]): RollResult {
  const roll = Math.floor(Math.random() * 100) + 1
  const groupTotal = rangeTable.reduce((sum, e) => sum + e.value, 0)
  const isDoubles = roll % 11 === 0
  const triggered = roll <= groupTotal
  const triggeredEntry = triggered
    ? rangeTable.find(e => roll >= e.rangeLow && roll <= e.rangeHigh)
    : undefined
  return {
    roll, groupTotal, isDoubles, triggered, triggeredEntry,
    doublesNote: isDoubles ? 'Doubles — special complication or advantage at GM discretion.' : undefined,
  }
}

function reconstructResult(
  roll: number | null,
  triggered: boolean | null,
  triggeredCharId: string | null,
  isDoubles: boolean,
  rangeTable: RangeEntry[],
): RollResult | null {
  if (roll == null) return null
  const groupTotal = rangeTable.reduce((s, e) => s + e.value, 0)
  const triggeredEntry = triggeredCharId
    ? rangeTable.find(e => e.characterId === triggeredCharId)
    : undefined
  return {
    roll, groupTotal, isDoubles, triggered: triggered ?? false, triggeredEntry,
    doublesNote: isDoubles ? 'Doubles — special complication or advantage at GM discretion.' : undefined,
  }
}

// ── Reveal control ────────────────────────────────────────────────────────────

function RevealControl({
  revealed, busy, onReveal, onHide,
}: { revealed: boolean; busy: boolean; onReveal: () => void; onHide: () => void }) {
  const [dot, setDot] = useState(true)
  useEffect(() => {
    if (!revealed) return
    const id = setInterval(() => setDot(d => !d), 700)
    return () => clearInterval(id)
  }, [revealed])

  if (revealed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.625rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3125rem' }}>
          <span style={{ width: '0.4375rem', height: '0.4375rem', borderRadius: RADIUS.full, background: dot ? GREEN : `${GREEN}80`, display: 'inline-block', transition: `background ${EASE.smooth}` }} />
          <span style={{ fontFamily: FONT_BODY, fontSize: 'clamp(0.68rem, 1vw, 0.78rem)', color: HUD.textFaint }}>
            Result revealed to players.
          </span>
        </div>
        <button
          disabled={busy}
          onClick={onHide}
          style={{
            fontFamily: FONT_BODY, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', fontWeight: 700,
            border: `1px solid rgba(232,223,200,0.25)`, borderRadius: RADIUS.md, padding: '0.1875rem 0.75rem',
            background: 'transparent', color: HUD.textFaint, cursor: 'pointer',
            opacity: busy ? 0.5 : 1,
          }}
        >
          🔒 Hide from Players
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.625rem' }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: 'clamp(0.68rem, 1vw, 0.78rem)', color: HUD.textFaint }}>
        Players cannot see this result.
      </span>
      <button
        disabled={busy}
        onClick={onReveal}
        style={{
          fontFamily: FONT_BODY, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', fontWeight: 700,
          border: `1px solid rgba(200,170,80,0.35)`, borderRadius: RADIUS.md, padding: '0.1875rem 0.75rem',
          background: `rgba(200,170,80,0.08)`, color: HUD.gold, cursor: 'pointer',
          opacity: busy ? 0.5 : 1,
        }}
      >
        📢 Reveal to Players
      </button>
    </div>
  )
}

// ── Result panel ──────────────────────────────────────────────────────────────

function RollDisplay({ result, label, color }: { result: RollResult; label: string; color: string }) {
  const bg = result.triggered ? `${color}12` : 'rgba(8,16,10,0.6)'
  const border = result.triggered ? `1px solid ${color}40` : `1px solid ${BORDER}`

  return (
    <div style={{ background: bg, border, borderRadius: RADIUS.lg, padding: '0.875rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.h2, fontWeight: 700, color, lineHeight: 1 }}>
          {result.roll}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM }}>/ {result.groupTotal} total</span>
        {result.isDoubles && (
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            color: HUD.gold, background: `color-mix(in srgb, ${HUD.gold} 9%, transparent)`, border: `1px solid color-mix(in srgb, ${HUD.gold} 25%, transparent)`,
            borderRadius: RADIUS.sm, padding: '0.0625rem 0.375rem', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>Doubles</span>
        )}
      </div>
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
        color: result.triggered ? color : DIM,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        marginBottom: (result.triggeredEntry || result.doublesNote) ? '0.5rem' : 0,
      }}>
        {result.triggered ? `▶ ${label} Triggered` : `— No ${label}`}
      </div>
      {result.triggeredEntry && (
        <div style={{
          background: `${color}08`, border: `1px solid ${color}25`,
          borderRadius: RADIUS.md, padding: '0.375rem 0.625rem',
          marginBottom: result.doublesNote ? '0.5rem' : 0,
        }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.125rem' }}>Character</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: TEXT }}>{result.triggeredEntry.characterName}</div>
          {result.triggeredEntry.typeName && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color, marginTop: '0.0625rem' }}>{result.triggeredEntry.typeName}</div>
          )}
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, marginTop: '0.125rem' }}>
            Range {result.triggeredEntry.rangeLow}–{result.triggeredEntry.rangeHigh} (value {result.triggeredEntry.value})
          </div>
        </div>
      )}
      {result.doublesNote && (
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.gold, lineHeight: 1.4 }}>✦ {result.doublesNote}</div>
      )}
    </div>
  )
}

function RangeTable({ entries, color }: { entries: RangeEntry[]; color: string }) {
  if (entries.length === 0) return (
    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, fontStyle: 'italic' }}>No values set.</div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
      {entries.map(e => (
        <div key={e.characterId} style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, padding: '0.125rem 0',
          borderBottom: `1px solid ${FAINT}`,
        }}>
          <span style={{ color: TEXT }}>{e.characterName}</span>
          <span style={{ color }}>
            {e.rangeLow === e.rangeHigh ? e.rangeLow : `${e.rangeLow}–${e.rangeHigh}`}
            <span style={{ color: DIM, marginLeft: '0.375rem' }}>(+{e.value})</span>
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface SessionRollSimulatorProps {
  characters: Character[]
  campaignId?: string | null
  dutyTypes?: RefDutyType[]
  obligationTypes?: RefObligationType[]
}

export function SessionRollSimulator({ characters, campaignId, dutyTypes = [], obligationTypes = [] }: SessionRollSimulatorProps) {
  const supabase = useRef(createClient()).current

  const dutyTable = buildRangeTable(characters, 'duty_value', c => resolveDutyName(c, dutyTypes))
  const oblTable  = buildRangeTable(characters, 'obligation_value', c => resolveObligationName(c, obligationTypes))

  const [dutyResult,  setDutyResult]  = useState<RollResult | null>(null)
  const [oblResult,   setOblResult]   = useState<RollResult | null>(null)
  const [busyReveal,  setBusyReveal]  = useState<{ duty: boolean; obl: boolean }>({ duty: false, obl: false })
  const [busyRoll,    setBusyRoll]    = useState(false)
  const [showTables,  setShowTables]  = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [busyReset,   setBusyReset]   = useState(false)

  // ── Live session roll state via hook (replaces manual DB fetch + subscription) ──
  const savedState = useSessionRollState(campaignId ?? null)
  const initialized = useRef(false)

  // One-time restoration of display results when the DB state first loads
  useEffect(() => {
    if (initialized.current || !savedState) return
    initialized.current = true
    setDutyResult(reconstructResult(savedState.duty_roll, savedState.duty_triggered, savedState.duty_triggered_char_id, savedState.duty_is_doubles, dutyTable))
    setOblResult(reconstructResult(savedState.obligation_roll, savedState.obligation_triggered, savedState.obligation_triggered_char_id, false, oblTable))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedState])

  // ── Persist roll to DB ──
  const persistRoll = useCallback(async (
    field: 'duty' | 'obligation',
    result: RollResult,
  ) => {
    if (!campaignId) return
    const isDoubles = result.isDoubles
    const payload = field === 'duty'
      ? {
          campaign_id: campaignId,
          duty_roll: result.roll,
          duty_triggered: result.triggered,
          duty_triggered_char_id: result.triggeredEntry?.characterId ?? null,
          duty_is_doubles: isDoubles,
          duty_revealed: false,
          updated_at: new Date().toISOString(),
        }
      : {
          campaign_id: campaignId,
          obligation_roll: result.roll,
          obligation_triggered: result.triggered,
          obligation_triggered_char_id: result.triggeredEntry?.characterId ?? null,
          obligation_revealed: false,
          updated_at: new Date().toISOString(),
        }
    await supabase
      .from('session_roll_state')
      .upsert(payload, { onConflict: 'campaign_id' })
  }, [campaignId, supabase])

  // ── Roll handlers ──
  const rollDuty = useCallback(async () => {
    setBusyRoll(true)
    const r = computeRoll(dutyTable)
    setDutyResult(r)
    await persistRoll('duty', r)
    setBusyRoll(false)
  }, [dutyTable, persistRoll])

  const rollObl = useCallback(async () => {
    setBusyRoll(true)
    const r = computeRoll(oblTable)
    setOblResult(r)
    await persistRoll('obligation', r)
    setBusyRoll(false)
  }, [oblTable, persistRoll])

  const rollBoth = useCallback(async () => {
    setBusyRoll(true)
    const dr = computeRoll(dutyTable)
    const or = computeRoll(oblTable)
    setDutyResult(dr)
    setOblResult(or)
    if (campaignId) {
      await supabase.from('session_roll_state').upsert({
        campaign_id: campaignId,
        duty_roll: dr.roll,
        duty_triggered: dr.triggered,
        duty_triggered_char_id: dr.triggeredEntry?.characterId ?? null,
        duty_is_doubles: dr.isDoubles,
        duty_revealed: false,
        obligation_roll: or.roll,
        obligation_triggered: or.triggered,
        obligation_triggered_char_id: or.triggeredEntry?.characterId ?? null,
        obligation_revealed: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'campaign_id' })
    }
    setBusyRoll(false)
  }, [campaignId, dutyTable, oblTable, supabase])

  // ── Reveal / hide ──
  const setReveal = useCallback(async (field: 'duty' | 'obligation', revealed: boolean) => {
    if (!campaignId) return
    setBusyReveal(prev => ({ ...prev, [field]: true }))
    const col = field === 'duty' ? 'duty_revealed' : 'obligation_revealed'
    await supabase.from('session_roll_state')
      .update({ [col]: revealed, updated_at: new Date().toISOString() })
      .eq('campaign_id', campaignId)
    setBusyReveal(prev => ({ ...prev, [field]: false }))
  }, [campaignId, supabase])

  // ── Reset ──
  const handleReset = useCallback(async () => {
    if (!campaignId) return
    setBusyReset(true)
    await supabase.from('session_roll_state').upsert({
      campaign_id: campaignId,
      duty_roll: null,
      duty_triggered: null,
      duty_triggered_char_id: null,
      duty_is_doubles: false,
      duty_revealed: false,
      obligation_roll: null,
      obligation_triggered: null,
      obligation_triggered_char_id: null,
      obligation_revealed: false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'campaign_id' })
    setDutyResult(null)
    setOblResult(null)
    setResetConfirm(false)
    setBusyReset(false)
  }, [campaignId, supabase])

  const dutyRevealed = savedState?.duty_revealed ?? false
  const oblRevealed  = savedState?.obligation_revealed ?? false

  const btnBase: React.CSSProperties = {
    fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', border: '1px solid',
    borderRadius: RADIUS.md, padding: '0.4375rem 1rem', cursor: 'pointer', transition: EASE.quick,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Roll buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button disabled={busyRoll} onClick={rollBoth}
          style={{ ...btnBase, borderColor: HUD.gold, background: 'rgba(200,170,80,0.12)', color: HUD.gold, opacity: busyRoll ? 0.5 : 1 }}>
          Roll Both (D100)
        </button>
        <button disabled={busyRoll} onClick={rollDuty}
          style={{ ...btnBase, borderColor: `${BLUE}60`, background: `${BLUE}0a`, color: BLUE, opacity: busyRoll ? 0.5 : 1 }}>
          Roll Duty
        </button>
        <button disabled={busyRoll} onClick={rollObl}
          style={{ ...btnBase, borderColor: `${RED}60`, background: `${RED}0a`, color: RED, opacity: busyRoll ? 0.5 : 1 }}>
          Roll Obligation
        </button>
        <button
          onClick={() => setShowTables(s => !s)}
          style={{ ...btnBase, borderColor: BORDER, background: 'transparent', color: DIM, marginLeft: 'auto' }}>
          {showTables ? 'Hide' : 'Show'} Ranges
        </button>
      </div>

      {/* Results with reveal controls */}
      {(dutyResult || oblResult) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {dutyResult && (
            <div>
              <RollDisplay result={dutyResult} label="Duty" color={BLUE} />
              {campaignId && (
                <RevealControl
                  revealed={dutyRevealed}
                  busy={busyReveal.duty}
                  onReveal={() => setReveal('duty', true)}
                  onHide={() => setReveal('duty', false)}
                />
              )}
            </div>
          )}
          {oblResult && (
            <div>
              <RollDisplay result={oblResult} label="Obligation" color={RED} />
              {campaignId && (
                <RevealControl
                  revealed={oblRevealed}
                  busy={busyReveal.obl}
                  onReveal={() => setReveal('obligation', true)}
                  onHide={() => setReveal('obligation', false)}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Range tables */}
      {showTables && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={panelBase}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, color: BLUE, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Duty Range Table</div>
            <RangeTable entries={dutyTable} color={BLUE} />
          </div>
          <div style={panelBase}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, color: RED, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Obligation Range Table</div>
            <RangeTable entries={oblTable} color={RED} />
          </div>
        </div>
      )}

      {/* Reset */}
      {campaignId && (
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {!resetConfirm ? (
            <button
              onClick={() => setResetConfirm(true)}
              style={{
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em',
                border: `1px solid rgba(232,223,200,0.25)`, borderRadius: RADIUS.md, padding: '0.3125rem 0.875rem',
                background: 'transparent', color: HUD.textFaint, cursor: 'pointer',
              }}
            >
              Reset Session Rolls
            </button>
          ) : (
            <>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim }}>
                Reset all session rolls? This cannot be undone.
              </span>
              <button
                onClick={() => setResetConfirm(false)}
                style={{ fontFamily: FONT_BODY, fontSize: FS.overline, border: `1px solid ${BORDER}`, borderRadius: RADIUS.md, padding: '0.25rem 0.75rem', background: 'transparent', color: DIM, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={busyReset}
                style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, border: `1px solid rgba(224,80,80,0.4)`, borderRadius: RADIUS.md, padding: '0.25rem 0.75rem', background: 'rgba(224,80,80,0.1)', color: RED, cursor: 'pointer', opacity: busyReset ? 0.5 : 1 }}
              >
                {busyReset ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
