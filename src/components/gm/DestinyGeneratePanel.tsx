'use client'

import { useState, useEffect, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { Character } from '@/lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DestinyPoolRecord } from '@/components/destiny/DestinyPoolDisplay'
import { HUD, FONT_BODY } from '@/lib/tokens'

// ── Design tokens ─────────────────────────────────────────────────────────────
const TEXT      = HUD.text
const DIM       = HUD.textDim
const BORDER    = HUD.border
const LIGHT_CLR = '#0EA5E9'   // sky-blue Force light — PRE-APPROVED
const DARK_CLR  = '#A845F5'   // Sith-violet Force dark — PRE-APPROVED
const GREEN     = 'var(--state-success)'
const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'
const FS_LABEL  = 'var(--text-label)'
const FS_SM     = 'var(--text-sm)'
const FS_H4     = 'var(--text-h4)'

type RollStatus = {
  status:      'waiting' | 'rolled'
  lightRolled: number
  darkRolled:  number
  /** GM overrode this player's pips by hand — incoming realtime rows must not
   *  clobber it, and finalisePool writes it back as the canonical roll. */
  edited?:     boolean
}

interface DestinyGeneratePanelProps {
  campaignId:    string
  characters:    Character[]
  supabase:      SupabaseClient
  /** Existing active pool row (if any) — used to deactivate on new generation */
  activePool?:   DestinyPoolRecord | null
  sendToChar:    (charId: string, payload: Record<string, unknown>) => void
  onClose:       () => void
  onGenerated:   (pool: DestinyPoolRecord) => void
}

/** Compact −/value/+ control for one side's pips on one player's roll. */
function PipStepper({
  color, mask, value, onAdd, onSub,
}: { color: string; mask: string; value: number; onAdd: () => void; onSub: () => void }) {
  const btn = {
    fontFamily: FONT_BODY, fontSize: FS_CAP, lineHeight: 1,
    padding: '1px 5px', borderRadius: 3, cursor: 'pointer',
    background: 'transparent', border: `1px solid ${HUD.border}`, color,
  } as const
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
      <span style={{ display: 'inline-block', width: 10, height: 10, flexShrink: 0, WebkitMask: `url('${mask}') center/contain no-repeat`, mask: `url('${mask}') center/contain no-repeat`, background: color }} />
      <button onClick={onSub} disabled={value <= 0} style={{ ...btn, opacity: value <= 0 ? 0.3 : 1, cursor: value <= 0 ? 'not-allowed' : 'pointer' }}>−</button>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, color, minWidth: 12, textAlign: 'center' }}>{value}</span>
      <button onClick={onAdd} style={btn}>+</button>
    </span>
  )
}

export function DestinyGeneratePanel({
  campaignId, characters, supabase, activePool,
  sendToChar, onClose, onGenerated,
}: DestinyGeneratePanelProps) {
  type Phase = 'setup' | 'rolling' | 'complete'

  const [phase,         setPhase]         = useState<Phase>('setup')
  const [sessionLabel,  setSessionLabel]  = useState('')
  const [rollStatuses,  setRollStatuses]  = useState<Record<string, RollStatus>>({})
  const [poolRow,       setPoolRow]       = useState<DestinyPoolRecord | null>(null)
  const [busy,          setBusy]          = useState(false)
  const rollChRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Subscribe to destiny_pool_rolls for this pool once it's created
  useEffect(() => {
    if (!poolRow) return
    const ch = supabase
      .channel(`destiny-gen-rolls-${poolRow.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'destiny_pool_rolls', filter: `pool_id=eq.${poolRow.id}` },
        (payload) => {
          const row = payload.new as { character_id: string; light_rolled: number; dark_rolled: number }
          setRollStatuses(prev => {
            // A late-arriving player roll must not silently undo a GM edit.
            if (prev[row.character_id]?.edited) return prev
            return {
              ...prev,
              [row.character_id]: { status: 'rolled', lightRolled: row.light_rolled, darkRolled: row.dark_rolled },
            }
          })
        }
      )
      .subscribe()
    rollChRef.current = ch
    return () => { supabase.removeChannel(ch); rollChRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolRow?.id])

  /** GM adjusts one player's pips by hand. Local only — nothing is written
   *  until finalisePool reconciles, so a burst of +/- clicks can't race the
   *  DB and a cancelled generation leaves no trace. */
  const adjustRoll = (charId: string, side: 'light' | 'dark', delta: number) => {
    setRollStatuses(prev => {
      const cur = prev[charId] ?? { status: 'waiting' as const, lightRolled: 0, darkRolled: 0 }
      const next = {
        ...cur,
        status:      'rolled' as const,
        edited:      true,
        lightRolled: side === 'light' ? Math.max(0, cur.lightRolled + delta) : cur.lightRolled,
        darkRolled:  side === 'dark'  ? Math.max(0, cur.darkRolled  + delta) : cur.darkRolled,
      }
      return { ...prev, [charId]: next }
    })
  }

  /** Swap the pending pool in for the active one. Called automatically once
   *  every player has rolled, and manually by the GM when someone never does
   *  — a missing roll must not be able to strand the pool forever. */
  const finalisePool = async () => {
    if (!poolRow || busy) return
    setBusy(true)
    try {
      // Deactivate old pool only now — keeping it active until this moment
      // means the GM and players never lose sight of the current pool while
      // waiting on rolls.
      if (activePool?.id && activePool.id !== poolRow.id) {
        await supabase.from('destiny_pool').update({ is_active: false }).eq('id', activePool.id)
      }

      // ── Reconcile rolls ──────────────────────────────────────────────────
      // Persist every GM edit as that player's canonical roll row, then set
      // the pool counts absolutely from the merged set rather than trusting
      // the running increments each player's own submit wrote. Re-reading the
      // table first means a realtime event this panel happened to miss still
      // counts.
      const { data: dbRolls } = await supabase
        .from('destiny_pool_rolls')
        .select('character_id, light_rolled, dark_rolled')
        .eq('pool_id', poolRow.id)

      const merged = new Map<string, { light: number; dark: number }>()
      for (const r of (dbRolls ?? []) as Array<{ character_id: string; light_rolled: number; dark_rolled: number }>) {
        if (r.character_id) merged.set(r.character_id, { light: r.light_rolled, dark: r.dark_rolled })
      }
      for (const c of characters) {
        const s = rollStatuses[c.id]
        if (!s || s.status !== 'rolled') continue
        // GM edits win over whatever the player submitted.
        if (s.edited || !merged.has(c.id)) {
          merged.set(c.id, { light: s.lightRolled, dark: s.darkRolled })
        }
      }

      for (const c of characters) {
        const s = rollStatuses[c.id]
        if (!s?.edited) continue
        await supabase.from('destiny_pool_rolls').delete().eq('pool_id', poolRow.id).eq('character_id', c.id)
        await supabase.from('destiny_pool_rolls').insert({
          campaign_id:    campaignId,
          pool_id:        poolRow.id,
          character_id:   c.id,
          character_name: c.name,
          light_rolled:   s.lightRolled,
          dark_rolled:    s.darkRolled,
          die_result:     { gm_edited: true },
        })
      }

      let lightSum = 0, darkSum = 0
      for (const v of merged.values()) { lightSum += v.light; darkSum += v.dark }

      const { data } = await supabase
        .from('destiny_pool')
        .update({ is_active: true, light_count: lightSum, dark_count: darkSum })
        .eq('id', poolRow.id)
        .select()
        .single()

      if (data) {
        const updated = data as DestinyPoolRecord
        setPoolRow(updated)
        onGenerated(updated)
      }
      // Any player still holding the roll modal loses it — the pool is closed.
      for (const c of characters) {
        if (rollStatuses[c.id]?.status !== 'rolled') {
          sendToChar(c.id, { type: 'destiny-roll-cancel', poolId: poolRow.id })
        }
      }
      setPhase('complete')
    } finally {
      setBusy(false)
    }
  }

  /** Abort a pending generation: bin the inactive pool row and its rolls,
   *  release every player's modal, and leave the previous pool untouched. */
  const cancelGeneration = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (poolRow) {
        for (const c of characters) {
          sendToChar(c.id, { type: 'destiny-roll-cancel', poolId: poolRow.id })
        }
        await supabase.from('destiny_pool_rolls').delete().eq('pool_id', poolRow.id)
        await supabase.from('destiny_pool').delete().eq('id', poolRow.id)
      }
      setPoolRow(null)
      setRollStatuses({})
      setPhase('setup')
    } finally {
      setBusy(false)
      onClose()
    }
  }

  // When all players have rolled, activate the pool
  useEffect(() => {
    if (phase !== 'rolling' || !poolRow || characters.length === 0) return
    const allRolled = characters.every(c => rollStatuses[c.id]?.status === 'rolled')
    if (!allRolled) return
    // Once the GM has hand-edited anything, stop auto-activating — an edit
    // marks that player 'rolled', which would otherwise slam the panel shut
    // mid-edit. From then on it activates only on the explicit button.
    if (Object.values(rollStatuses).some(s => s.edited)) return
    void finalisePool()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollStatuses, phase, characters.length])

  const handleSendRollRequest = async () => {
    setBusy(true)
    try {
      // The existing pool stays active until the new one is finalised (see
      // finalisePool) — deactivating it here left the GM with no destiny
      // display, and no way back to one, whenever a player never rolled.

      // Create new pool row (inactive until all players roll)
      const { data: newPool } = await supabase
        .from('destiny_pool')
        .insert({
          campaign_id:   campaignId,
          session_label: sessionLabel.trim() || null,
          light_count:   0,
          dark_count:    0,
          is_active:     false,
        })
        .select()
        .single()

      if (!newPool) throw new Error('Failed to create destiny pool')

      const pool = newPool as DestinyPoolRecord
      setPoolRow(pool)

      // Init waiting statuses
      const statuses: Record<string, RollStatus> = {}
      for (const c of characters) {
        statuses[c.id] = { status: 'waiting', lightRolled: 0, darkRolled: 0 }
      }
      setRollStatuses(statuses)

      // Send roll request to each player
      for (const c of characters) {
        sendToChar(c.id, {
          type:    'destiny-roll-request',
          poolId:  pool.id,
          message: 'Roll your Force die for the Destiny Pool!',
        })
      }

      setPhase('rolling')
    } catch (err) {
      console.error('DestinyGeneratePanel error:', err)
    } finally {
      setBusy(false)
    }
  }

  const rolledCount  = Object.values(rollStatuses).filter(s => s.status === 'rolled').length
  const totalPlayers = characters.length
  const lightTotal   = Object.values(rollStatuses).reduce((s, r) => s + (r.status === 'rolled' ? r.lightRolled : 0), 0)
  const darkTotal    = Object.values(rollStatuses).reduce((s, r) => s + (r.status === 'rolled' ? r.darkRolled : 0), 0)

  const modal = (
    <Modal
      open
      onClose={phase === 'rolling' ? undefined : onClose}
      maxWidth={540}
    >
        {/* Header */}
        <div style={{ padding: '1.125rem 1.5rem 0.875rem', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS_H4, fontWeight: 700, color: HUD.gold, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ◈ Generate Destiny Pool
          </div>
          {phase !== 'rolling' && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: DIM, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: FS_SM }}>✕</button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {/* Phase: setup */}
          {phase === 'setup' && (<>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, color: TEXT }}>
              Each player will roll one Force die. Light pips add light side Destiny Points, dark pips add dark side.
            </div>

            {activePool && (
              <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(224,80,80,0.07)', border: '1px solid rgba(224,80,80,0.25)', borderRadius: 6 }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, color: 'var(--state-failure)' }}>
                  ⚠ An active pool already exists{activePool.session_label ? ` (${activePool.session_label})` : ''}. Generating a new one will replace it.
                </div>
              </div>
            )}

            {/* Session label */}
            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVER, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: HUD.borderHi, marginBottom: '0.375rem' }}>
                Session Label (optional)
              </div>
              <input
                value={sessionLabel}
                onChange={e => setSessionLabel(e.target.value)}
                placeholder="e.g. Session 5"
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${HUD.border}`, color: TEXT, fontFamily: FONT_BODY, fontSize: FS_LABEL, padding: 'clamp(6px, 1vh, 8px) 0.75rem', borderRadius: 4, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Player list */}
            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_OVER, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: HUD.borderHi, marginBottom: '0.5rem' }}>
                Players ({characters.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {characters.length === 0 ? (
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, color: DIM }}>No active players in campaign.</div>
                ) : characters.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: 'clamp(5px, 0.8vh, 7px) 0.625rem', background: 'rgba(0,0,0,0.2)', border: `1px solid ${BORDER}`, borderRadius: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: HUD.borderHi, flexShrink: 0 }} />
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, color: TEXT, flex: 1 }}>{c.name}</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, color: DIM }}>⬜ waiting</span>
                  </div>
                ))}
              </div>
            </div>
          </>)}

          {/* Phase: rolling */}
          {phase === 'rolling' && (<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, color: TEXT }}>
                Waiting for players to roll…
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_SM, color: HUD.gold }}>
                {rolledCount}/{totalPlayers}
              </div>
            </div>

            {/* Running tally */}
            <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.25)', borderRadius: 6, border: `1px solid ${BORDER}` }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, color: LIGHT_CLR, display: 'inline-flex', alignItems: 'center', gap: '0.3125rem' }}>
                <span style={{ display: 'inline-block', width: 13, height: 13, flexShrink: 0, WebkitMask: `url('/images/factions/LightSymbol.png') center/contain no-repeat`, mask: `url('/images/factions/LightSymbol.png') center/contain no-repeat`, background: LIGHT_CLR }} />
                {lightTotal}
              </span>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, color: DARK_CLR, display: 'inline-flex', alignItems: 'center', gap: '0.3125rem' }}>
                <span style={{ display: 'inline-block', width: 13, height: 13, flexShrink: 0, WebkitMask: `url('/images/factions/DarkSymbol.png') center/contain no-repeat`, mask: `url('/images/factions/DarkSymbol.png') center/contain no-repeat`, background: DARK_CLR }} />
                {darkTotal}
              </span>
            </div>

            {/* Player statuses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {characters.map(c => {
                const s = rollStatuses[c.id]
                const rolled = s?.status === 'rolled'
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: 'clamp(5px, 0.8vh, 7px) 0.625rem', background: rolled ? 'rgba(78,200,122,0.05)' : 'rgba(0,0,0,0.2)', border: `1px solid ${rolled ? 'rgba(78,200,122,0.2)' : BORDER}`, borderRadius: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: rolled ? GREEN : HUD.borderHi, flexShrink: 0 }} />
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, color: rolled ? TEXT : DIM, flex: 1 }}>{c.name}</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, color: rolled ? GREEN : DIM, flexShrink: 0 }}>
                      {s?.edited ? '✎ GM' : rolled ? '✓ rolled' : '⬜ waiting'}
                    </span>
                    {/* GM pip editors — usable whether or not the player rolled,
                        so a no-show never blocks the pool. */}
                    <PipStepper
                      color={LIGHT_CLR}
                      mask="/images/factions/LightSymbol.png"
                      value={s?.lightRolled ?? 0}
                      onAdd={() => adjustRoll(c.id, 'light', 1)}
                      onSub={() => adjustRoll(c.id, 'light', -1)}
                    />
                    <PipStepper
                      color={DARK_CLR}
                      mask="/images/factions/DarkSymbol.png"
                      value={s?.darkRolled ?? 0}
                      onAdd={() => adjustRoll(c.id, 'dark', 1)}
                      onSub={() => adjustRoll(c.id, 'dark', -1)}
                    />
                  </div>
                )
              })}
            </div>
          </>)}

          {/* Phase: complete */}
          {phase === 'complete' && poolRow && (<>
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS_H4, color: HUD.gold, marginBottom: '0.75rem' }}>Pool generated!</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS_SM, color: LIGHT_CLR, fontWeight: 700, minWidth: 60 }}>Light:</span>
                  <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
                    {Array.from({ length: Math.min(poolRow.light_count, 10) }).map((_, i) => (
                      <span key={i} style={{ display: 'inline-block', width: 14, height: 14, flexShrink: 0, WebkitMask: `url('/images/factions/LightSymbol.png') center/contain no-repeat`, mask: `url('/images/factions/LightSymbol.png') center/contain no-repeat`, background: LIGHT_CLR }} />
                    ))}
                  </span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS_SM, color: LIGHT_CLR }}>{poolRow.light_count}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS_SM, color: DARK_CLR, fontWeight: 700, minWidth: 60 }}>Dark:</span>
                  <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
                    {Array.from({ length: Math.min(poolRow.dark_count, 10) }).map((_, i) => (
                      <span key={i} style={{ display: 'inline-block', width: 14, height: 14, flexShrink: 0, WebkitMask: `url('/images/factions/DarkSymbol.png') center/contain no-repeat`, mask: `url('/images/factions/DarkSymbol.png') center/contain no-repeat`, background: DARK_CLR }} />
                    ))}
                  </span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS_SM, color: DARK_CLR }}>{poolRow.dark_count}</span>
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS_LABEL, color: DIM, marginTop: '0.25rem' }}>
                  Total: {poolRow.light_count + poolRow.dark_count} Destiny {poolRow.light_count + poolRow.dark_count === 1 ? 'Point' : 'Points'}
                </div>
              </div>
            </div>
          </>)}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.5rem 1.25rem', borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'flex-end', gap: '0.625rem' }}>
          {phase === 'setup' && (<>
            <button onClick={onClose} style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 'clamp(6px, 1vh, 9px) 0.875rem', borderRadius: 4, cursor: 'pointer', background: 'transparent', border: `1px solid ${BORDER}`, color: DIM }}>
              Cancel
            </button>
            <button
              onClick={handleSendRollRequest}
              disabled={busy || characters.length === 0}
              style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 'clamp(6px, 1vh, 9px) 1.125rem', borderRadius: 4, cursor: busy ? 'wait' : 'pointer', background: 'rgba(200,170,80,0.15)', border: `1px solid ${HUD.border}`, color: HUD.gold, opacity: busy || characters.length === 0 ? 0.4 : 1 }}
            >
              {busy ? 'Creating…' : 'Send Roll Request to All Players'}
            </button>
          </>)}
          {phase === 'rolling' && (<>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, color: DIM, fontStyle: 'italic', alignSelf: 'center', marginRight: 'auto' }}>
              Activates automatically once all players roll
            </div>
            <button
              onClick={cancelGeneration}
              disabled={busy}
              style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 'clamp(6px, 1vh, 9px) 0.875rem', borderRadius: 4, cursor: busy ? 'wait' : 'pointer', background: 'transparent', border: `1px solid ${BORDER}`, color: DIM, opacity: busy ? 0.4 : 1 }}
            >
              Cancel &amp; Reset
            </button>
            <button
              onClick={finalisePool}
              disabled={busy}
              style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 'clamp(6px, 1vh, 9px) 1.125rem', borderRadius: 4, cursor: busy ? 'wait' : 'pointer', background: 'rgba(200,170,80,0.15)', border: `1px solid ${HUD.border}`, color: HUD.gold, opacity: busy ? 0.4 : 1 }}
            >
              {busy ? '…' : `Activate Now (${rolledCount}/${totalPlayers})`}
            </button>
          </>)}
          {phase === 'complete' && (
            <button onClick={onClose} style={{ fontFamily: FONT_BODY, fontSize: FS_CAP, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 'clamp(6px, 1vh, 9px) 1.125rem', borderRadius: 4, cursor: 'pointer', background: 'rgba(200,170,80,0.15)', border: `1px solid ${HUD.border}`, color: HUD.gold }}>
              Done
            </button>
          )}
        </div>
    </Modal>
  )

  return modal
}
