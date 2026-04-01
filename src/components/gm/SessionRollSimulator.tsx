'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character, RefDutyType, RefObligationType } from '@/lib/types'
import type { SessionRollState } from '@/hooks/useSessionRollState'
import { resolveDutyName, resolveObligationName } from '@/lib/dutyObligationUtils'

// ── Design tokens ─────────────────────────────────────────────────────────────
const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_MONO = "'Share Tech Mono', 'Courier New', monospace"
const GOLD = '#C8AA50'
const TEXT = '#C8D8C0'
const DIM = '#6A8070'
const FAINT = '#2A3A2E'
const BORDER = 'rgba(200,170,80,0.14)'
const BLUE = '#4FC3F7'
const RED = '#E05050'
const GREEN = '#4CAF50'

const panelBase: React.CSSProperties = {
  background: 'rgba(8,16,10,0.88)',
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  padding: '16px',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot ? GREEN : `${GREEN}80`, display: 'inline-block', transition: 'background .4s' }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 'clamp(0.68rem, 1vw, 0.78rem)', color: 'rgba(232,223,200,0.4)' }}>
            Result revealed to players.
          </span>
        </div>
        <button
          disabled={busy}
          onClick={onHide}
          style={{
            fontFamily: FC, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', fontWeight: 700,
            border: '1px solid rgba(232,223,200,0.25)', borderRadius: 4, padding: '3px 12px',
            background: 'transparent', color: 'rgba(232,223,200,0.4)', cursor: 'pointer',
            opacity: busy ? 0.5 : 1,
          }}
        >
          🔒 Hide from Players
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 'clamp(0.68rem, 1vw, 0.78rem)', color: 'rgba(232,223,200,0.4)' }}>
        Players cannot see this result.
      </span>
      <button
        disabled={busy}
        onClick={onReveal}
        style={{
          fontFamily: FC, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', fontWeight: 700,
          border: `1px solid rgba(200,170,80,0.35)`, borderRadius: 4, padding: '3px 12px',
          background: `rgba(200,170,80,0.08)`, color: GOLD, cursor: 'pointer',
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
    <div style={{ background: bg, border, borderRadius: 6, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: FC, fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>
          {result.roll}
        </span>
        <span style={{ fontFamily: FC, fontSize: 11, color: DIM }}>/ {result.groupTotal} total</span>
        {result.isDoubles && (
          <span style={{
            fontFamily: FC, fontSize: 9, fontWeight: 700,
            color: GOLD, background: `${GOLD}18`, border: `1px solid ${GOLD}40`,
            borderRadius: 3, padding: '1px 6px', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>Doubles</span>
        )}
      </div>
      <div style={{
        fontFamily: FC, fontSize: 12, fontWeight: 700,
        color: result.triggered ? color : DIM,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        marginBottom: (result.triggeredEntry || result.doublesNote) ? 8 : 0,
      }}>
        {result.triggered ? `▶ ${label} Triggered` : `— No ${label}`}
      </div>
      {result.triggeredEntry && (
        <div style={{
          background: `${color}08`, border: `1px solid ${color}25`,
          borderRadius: 4, padding: '6px 10px',
          marginBottom: result.doublesNote ? 8 : 0,
        }}>
          <div style={{ fontFamily: FC, fontSize: 10, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Character</div>
          <div style={{ fontFamily: FC, fontSize: 14, fontWeight: 700, color: TEXT }}>{result.triggeredEntry.characterName}</div>
          {result.triggeredEntry.typeName && (
            <div style={{ fontFamily: FC, fontSize: 11, color, marginTop: 1 }}>{result.triggeredEntry.typeName}</div>
          )}
          <div style={{ fontFamily: FC, fontSize: 10, color: DIM, marginTop: 2 }}>
            Range {result.triggeredEntry.rangeLow}–{result.triggeredEntry.rangeHigh} (value {result.triggeredEntry.value})
          </div>
        </div>
      )}
      {result.doublesNote && (
        <div style={{ fontFamily: FC, fontSize: 10, color: GOLD, lineHeight: 1.4 }}>✦ {result.doublesNote}</div>
      )}
    </div>
  )
}

function RangeTable({ entries, color }: { entries: RangeEntry[]; color: string }) {
  if (entries.length === 0) return (
    <div style={{ fontFamily: FC, fontSize: 11, color: DIM, fontStyle: 'italic' }}>No values set.</div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {entries.map(e => (
        <div key={e.characterId} style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: FC, fontSize: 11, color: DIM, padding: '2px 0',
          borderBottom: `1px solid ${FAINT}`,
        }}>
          <span style={{ color: TEXT }}>{e.characterName}</span>
          <span style={{ color }}>
            {e.rangeLow === e.rangeHigh ? e.rangeLow : `${e.rangeLow}–${e.rangeHigh}`}
            <span style={{ color: DIM, marginLeft: 6 }}>(+{e.value})</span>
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
  const [savedState,  setSavedState]  = useState<SessionRollState | null>(null)
  const [busyReveal,  setBusyReveal]  = useState<{ duty: boolean; obl: boolean }>({ duty: false, obl: false })
  const [busyRoll,    setBusyRoll]    = useState(false)
  const [showTables,  setShowTables]  = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [busyReset,   setBusyReset]   = useState(false)

  // ── Load saved state and subscribe ──
  useEffect(() => {
    if (!campaignId) return

    supabase.from('session_roll_state').select('*').eq('campaign_id', campaignId).single()
      .then(({ data }) => {
        if (data) {
          const s = data as SessionRollState
          setSavedState(s)
          // Reconstruct display results from saved state
          setDutyResult(reconstructResult(s.duty_roll, s.duty_triggered, s.duty_triggered_char_id, s.duty_is_doubles, dutyTable))
          setOblResult(reconstructResult(s.obligation_roll, s.obligation_triggered, s.obligation_triggered_char_id, false, oblTable))
        }
      })

    const channel = supabase
      .channel(`gm-session-roll-${campaignId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'session_roll_state',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        setSavedState(payload.new as SessionRollState)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

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
    fontFamily: FC, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', border: '1px solid',
    borderRadius: 4, padding: '7px 16px', cursor: 'pointer', transition: '.15s',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Roll buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button disabled={busyRoll} onClick={rollBoth}
          style={{ ...btnBase, borderColor: GOLD, background: 'rgba(200,170,80,0.12)', color: GOLD, opacity: busyRoll ? 0.5 : 1 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={panelBase}>
            <div style={{ fontFamily: FC, fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Duty Range Table</div>
            <RangeTable entries={dutyTable} color={BLUE} />
          </div>
          <div style={panelBase}>
            <div style={{ fontFamily: FC, fontSize: 10, fontWeight: 700, color: RED, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Obligation Range Table</div>
            <RangeTable entries={oblTable} color={RED} />
          </div>
        </div>
      )}

      {/* Reset */}
      {campaignId && (
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          {!resetConfirm ? (
            <button
              onClick={() => setResetConfirm(true)}
              style={{
                fontFamily: FC, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                border: `1px solid rgba(232,223,200,0.25)`, borderRadius: 4, padding: '5px 14px',
                background: 'transparent', color: 'rgba(232,223,200,0.3)', cursor: 'pointer',
              }}
            >
              Reset Session Rolls
            </button>
          ) : (
            <>
              <span style={{ fontFamily: FC, fontSize: 11, color: 'rgba(232,223,200,0.55)' }}>
                Reset all session rolls? This cannot be undone.
              </span>
              <button
                onClick={() => setResetConfirm(false)}
                style={{ fontFamily: FC, fontSize: 10, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '4px 12px', background: 'transparent', color: DIM, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={busyReset}
                style={{ fontFamily: FC, fontSize: 10, fontWeight: 700, border: `1px solid rgba(224,80,80,0.4)`, borderRadius: 4, padding: '4px 12px', background: 'rgba(224,80,80,0.1)', color: RED, cursor: 'pointer', opacity: busyReset ? 0.5 : 1 }}
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
