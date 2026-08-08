'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { PendingAction } from '@/hooks/usePendingActions'
import { rollPool, rollForceDice } from './dice-engine'
import type { ForceDie } from './dice-engine'
import type { Character, CharacterSkill, HudSkill } from '@/lib/types'
import {
  HUD, FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, EASE, DICE_META,
} from '@/lib/tokens'

const FD = FONT_DISPLAY
const FB = FONT_BODY

const FORCE_BLUE  = 'var(--die-force)'
const LIGHT_COLOR = 'var(--state-light-fp)'
const DARK_COLOR  = 'var(--state-dark-fp)'
const FORCE_TINT  = 'color-mix(in srgb, var(--die-force) 7%, transparent)'

const BORDER    = 'var(--hud-border)'
const BORDER_HI = 'var(--hud-border-hi)'

// ── Dice pool builder ──────────────────────────────────────────
// Fallback path only — used when the full HudSkill catalog isn't supplied.
function buildPool(char: Character, skills: CharacterSkill[], type: 'cool' | 'vigilance') {
  const skillKey    = type === 'cool' ? 'COOL' : 'VIGIL'
  const charStat    = type === 'cool' ? (char.presence ?? 2) : (char.willpower ?? 2)
  const skillRank   = skills.find(s => s.skill_key === skillKey)?.rank ?? 0
  const proficiency = Math.min(charStat, skillRank)
  const ability     = Math.max(charStat, skillRank) - proficiency
  return { proficiency, ability, charStat, skillRank }
}

// ── Die pip display ────────────────────────────────────────────
function DiePip({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center" style={{ gap: SP[1] }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          width: 40, height: 40, borderRadius: RADIUS.md,
          border: `2px solid ${color}`,
          background: `color-mix(in srgb, ${color} 10%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FD, fontWeight: 700, fontSize: FS.sm, color,
        }}>{label}</div>
      ))}
    </div>
  )
}

// ── Single force die result ────────────────────────────────────
function ForceDieDisplay({ die }: { die: ForceDie }) {
  const pips: ('light' | 'dark' | 'blank')[] = []
  for (let i = 0; i < die.light; i++) pips.push('light')
  for (let i = 0; i < die.dark;  i++) pips.push('dark')
  if (pips.length === 0) pips.push('blank')

  return (
    <div className="flex flex-wrap items-center justify-center" style={{
      width: 44, height: 44, borderRadius: RADIUS.full,
      border: `2px solid color-mix(in srgb, var(--die-force) 50%, transparent)`,
      background: FORCE_TINT,
      // Sub-token metrics: pips are laid out inside a 44px die face, where SP[1]
      // (4→8px) overflows the circle. Pre-existing values, kept as-is.
      gap: 3, padding: 7,
    }}>
      {pips.map((p, i) =>
        p === 'blank' ? (
          <div key={i} style={{ width: 8, height: 8, borderRadius: RADIUS.full, background: 'color-mix(in srgb, var(--die-force) 18%, transparent)' }} />
        ) : (
          <div key={i} style={{
            width: 9, height: 9, borderRadius: RADIUS.full,
            background: p === 'light' ? LIGHT_COLOR : `color-mix(in srgb, ${DARK_COLOR} 30%, var(--hud-panel))`,
            border: p === 'dark' ? `1px solid ${DARK_COLOR}` : 'none',
            boxShadow: p === 'light' ? `0 0 5px ${LIGHT_COLOR}` : 'none',
          }} />
        )
      )}
    </div>
  )
}

// ── Body ───────────────────────────────────────────────────────
// Presentation-agnostic: owns every piece of roll logic and assumes NOTHING
// about its host. Rendered in two places — inline inside the notifications
// drawer's initiative card, and under the `Modal` shell below. One
// implementation, two hosts; the popup still fires alongside the queue, which
// is exactly why these must not be allowed to drift into two copies.
export interface InitiativeRollBodyProps {
  character:      Character
  skills:         CharacterSkill[]
  initiativeType: 'cool' | 'vigilance'
  campaignId:     string
  forceRating?:   number
  /** Full skill catalog with ranks + linked characteristic. Enables the skill override. */
  hudSkills?:     HudSkill[]
  /** Skill the GM asked for on this request — overrides the Cool/Vigilance default. */
  requestedSkillKey?: string
  /** This character's outstanding initiative row, or null if none (a request
   *  that predates the queue, or one delivered by broadcast alone).
   *
   *  Supplied by the host rather than fetched here on purpose: `createClient`
   *  is a singleton, so a second `usePendingActions` inside this component
   *  would open a second Realtime channel on the SAME topic
   *  (`pending-actions-<id>`) as the host's. Topics collide, and the host's
   *  subscription silently stops delivering — which is exactly the
   *  cross-host reflection this feature depends on. One instance, passed down. */
  pendingRow?:    PendingAction | null
  resolvePendingAction?: (id: string, resultPayload?: Record<string, unknown>) => Promise<void>
  /** Fired once the submit has been written. The modal host uses it to start
   *  its self-close; the inline host passes nothing, because resolution
   *  removes the card over Realtime and there is no close concept. */
  onSubmitted?:   () => void
  /** Renders the Cancel affordance. Omitted by hosts with nothing to cancel
   *  out of — the drawer card collapses instead. */
  onCancel?:      () => void
}

export function InitiativeRollBody({
  character, skills, initiativeType, campaignId, forceRating = 0,
  hudSkills, requestedSkillKey, pendingRow, resolvePendingAction, onSubmitted, onCancel,
}: InitiativeRollBodyProps) {
  const fallback = buildPool(character, skills, initiativeType)
  const defaultKey = requestedSkillKey ?? (initiativeType === 'cool' ? 'COOL' : 'VIGIL')

  const [skillKey,   setSkillKey]   = useState(defaultKey)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [rolled,     setRolled]     = useState(false)
  const [successes,  setSuccesses]  = useState(0)
  const [baseAdv,    setBaseAdv]    = useState(0)
  const [forceDice,  setForceDice]  = useState<ForceDie[]>([])
  const [pipsSpent,  setPipsSpent]  = useState(0)
  const [submitted,  setSubmitted]  = useState(false)
  const [busy,       setBusy]       = useState(false)

  const supabase   = useMemo(() => createClient(), [])
  const channelRef = useRef<RealtimeChannel | null>(null)
  // Promise-chain queue + a resolved-id set. React state is not a synchronous
  // mutex, so `busy`/`submitted` alone cannot stop two rapid submits (or two
  // live hosts) racing each other into a double resolve.
  const queueRef    = useRef<Promise<unknown>>(Promise.resolve())
  const resolvedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const ch = supabase.channel(`initiative-${campaignId}`)
    ch.subscribe()
    channelRef.current = ch
    return () => { supabase.removeChannel(ch); channelRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // `ref_skills.type` is the category field — 'stCombat' is exactly the six
  // combat skills, so the non-combat list is a data filter, not a name list.
  const selectableSkills = useMemo(
    () => (hudSkills ?? []).filter(s => s.type !== 'stCombat'),
    [hudSkills],
  )

  const selected  = (hudSkills ?? []).find(s => s.key === skillKey)
  const skillName = selected?.name ?? (initiativeType === 'cool' ? 'Cool' : 'Vigilance')
  const charLabel = selected
    ? selected.charKey.charAt(0).toUpperCase() + selected.charKey.slice(1)
    : (initiativeType === 'cool' ? 'Presence' : 'Willpower')
  const charStat  = selected?.charVal ?? fallback.charStat
  const skillRank = selected?.rank    ?? fallback.skillRank

  const proficiency = Math.min(charStat, skillRank)
  const ability     = Math.max(charStat, skillRank) - proficiency
  const isOverride  = skillKey !== defaultKey

  const handleRoll = () => {
    const result = rollPool({ proficiency, ability, boost: 0, challenge: 0, difficulty: 0, setback: 0, force: 0 })
    setSuccesses(Math.max(0, result.net.success + result.net.triumph))
    setBaseAdv(result.net.advantage)
    if (forceRating > 0) {
      setForceDice(rollForceDice(forceRating).dice)
    }
    setPipsSpent(0)
    setRolled(true)
  }

  // Switching skill invalidates the previous pool's numbers — no approval gate,
  // the player just rolls again with the new pool.
  const handleSkillChange = (key: string) => {
    setSkillKey(key)
    setPickerOpen(false)
    setRolled(false)
    setSuccesses(0)
    setBaseAdv(0)
    setForceDice([])
    setPipsSpent(0)
  }

  const totalPips      = forceDice.reduce((s, d) => s + d.light + d.dark, 0)
  const totalLight     = forceDice.reduce((s, d) => s + d.light, 0)
  const totalDark      = forceDice.reduce((s, d) => s + d.dark, 0)
  const totalAdvantages = baseAdv + pipsSpent * 3

  const handleSubmit = async () => {
    setBusy(true)
    const ch = channelRef.current
    if (ch) {
      await ch.send({
        type: 'broadcast',
        event: 'initiative-result',
        payload: {
          characterId:   character.id,
          characterName: character.name,
          successes,
          advantages: totalAdvantages,
          skillKey,
          skillName,
        },
      })
    }

    // Write to roll_log for feed visibility (fire-and-forget)
    supabase.from('roll_log').insert({
      campaign_id:    campaignId,
      character_id:   character.id,
      character_name: character.name,
      roll_label:     `${skillName} (Initiative)`,
      pool: { proficiency, ability, boost: 0, challenge: 0, difficulty: 0, setback: 0, force: 0 },
      result: {
        netSuccess:   successes,
        netAdvantage: totalAdvantages,
        triumph:      0,
        despair:      0,
        succeeded:    successes > 0,
      },
      is_dm:                false,
      hidden:               false,
      roll_type:            'initiative',
      alignment:            'player',
      is_visible_to_players: true,
    }).then(({ error }) => {
      if (error) console.warn('[initiative roll_log]:', error.message)
    })

    // Resolve the durable row, carrying the real result. Until Lock Order &
    // Start this is the only persistent record of the roll — roll_log is
    // append-only display and the GM's setup modal holds everything else in
    // React state that a reload wipes.
    //
    // No row is a normal case, not an error: a request that predates the queue,
    // or one delivered by broadcast alone. Submit succeeds either way.
    // Durable side of the request (migration 117). The broadcast above is the
    // fast path; this row is what survives a socket that was asleep.
    const row = pendingRow
    if (row && resolvePendingAction) {
      // Serialised through the queue so a burst can't interleave, and skipped
      // outright if this row was already resolved here. A row resolved in the
      // OTHER host has already left `pendingActions` over Realtime, so `find`
      // returns undefined and nothing is written — and `resolve` itself still
      // guards on `.eq('status','pending')` as a third line of defence.
      queueRef.current = queueRef.current.then(async () => {
        if (resolvedRef.current.has(row.id)) return
        resolvedRef.current.add(row.id)
        await resolvePendingAction!(row.id, {
          successes,
          advantages: totalAdvantages,
          skillKey,
          skillName,
        })
      })
      await queueRef.current
    }

    setSubmitted(true)
    setBusy(false)
    // The write is already done. Anything the host wants to do afterwards is
    // ceremony and never gates it.
    onSubmitted?.()
  }

  return (
    <>
        {/* ── Header ── */}
        <div style={{ padding: `${SP[2]} ${SP[3]}`, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontFamily: FB, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: HUD.textDim, marginBottom: 3 }}>
            Initiative Roll
          </div>
          <div style={{ fontFamily: FD, fontSize: FS.h4, fontWeight: 700, color: HUD.gold }}>
            {skillName} — {charLabel} {charStat}
            {skillRank > 0 && ` · Rank ${skillRank}`}
          </div>
        </div>

        <div className="flex flex-col" style={{ padding: SP[3], gap: SP[3] }}>

          {/* ── Dice pool display ── */}
          <div>
            <div style={{ fontFamily: FB, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: HUD.textDim, marginBottom: SP[1] }}>
              Dice Pool
            </div>
            <div className="flex flex-wrap items-center" style={{ gap: SP[1] }}>
              {proficiency > 0 && <DiePip color={DICE_META.proficiency.color} label="Y" count={proficiency} />}
              {ability > 0     && <DiePip color={DICE_META.ability.color}     label="G" count={ability} />}
              {proficiency === 0 && ability === 0 && (
                <span style={{ fontFamily: FB, fontSize: FS.label, color: HUD.textFaint, fontStyle: 'italic' }}>No pool — stat is 0</span>
              )}
              {/* Force dice shown in pool if applicable */}
              {forceRating > 0 && (<>
                <div style={{ width: 1, height: 32, background: BORDER, margin: `0 2px` }} />
                {Array.from({ length: forceRating }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center" style={{
                    width: 40, height: 40, borderRadius: RADIUS.full,
                    border: `2px solid color-mix(in srgb, var(--die-force) 70%, transparent)`,
                    background: FORCE_TINT,
                    fontFamily: FD, fontWeight: 700, fontSize: FS.sm, color: FORCE_BLUE,
                  }}>◈</div>
                ))}
                <span style={{ fontFamily: FB, fontSize: FS.overline, color: FORCE_BLUE }}>Force</span>
              </>)}
            </div>
            {forceRating > 0 && (
              <div style={{ fontFamily: FB, fontSize: FS.overline, color: FORCE_BLUE, opacity: 0.7, marginTop: SP[1] }}>
                Force user — can spend pips for +3 Adv each after rolling
              </div>
            )}
          </div>

          {/* ── Skill override ── */}
          {!submitted && selectableSkills.length > 0 && (
            <div className="flex flex-col" style={{ gap: SP[1] }}>
              {!pickerOpen ? (
                <button
                  onClick={() => setPickerOpen(true)}
                  className="cursor-pointer self-start"
                  style={{
                    background: 'transparent', border: 'none', padding: 0,
                    fontFamily: FB, fontSize: FS.caption,
                    color: isOverride ? HUD.gold : HUD.textDim, textDecoration: 'underline',
                  }}
                >
                  {isOverride ? `Using ${skillName} — change skill?` : 'Use a different skill?'}
                </button>
              ) : (
                <div className="flex items-center" style={{ gap: SP[2] }}>
                  <select
                    value={skillKey}
                    onChange={e => handleSkillChange(e.target.value)}
                    className="iset-skill-select cursor-pointer"
                    style={{
                      flex: 1, minWidth: 0,
                      background: 'var(--hud-surface-mid)', border: `1px solid ${BORDER_HI}`,
                      borderRadius: RADIUS.md, padding: `${SP[1]} ${SP[2]}`,
                      fontFamily: FB, fontSize: FS.label, color: HUD.text, outline: 'none',
                    }}
                  >
                    {selectableSkills.map(s => (
                      <option key={s.key} value={s.key}>
                        {s.name} — {s.charKey} {s.charVal}{s.rank > 0 ? ` · Rank ${s.rank}` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setPickerOpen(false)}
                    className="cursor-pointer"
                    style={{
                      background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: RADIUS.md,
                      padding: `${SP[1]} ${SP[2]}`, fontFamily: FB, fontSize: FS.caption, color: HUD.textDim,
                    }}
                  >✕</button>
                </div>
              )}
              {isOverride && (
                <div style={{ fontFamily: FB, fontSize: FS.overline, color: HUD.gold, opacity: 0.85 }}>
                  ⇄ The GM sees which skill you rolled with.
                </div>
              )}
            </div>
          )}

          {/* ── Roll / Re-roll button ── */}
          {!submitted && (
            <button
              onClick={handleRoll}
              className="hov-gold-bg w-full cursor-pointer"
              style={{
                padding: `${SP[2]} 0`,
                background: `color-mix(in srgb, ${HUD.gold} 9%, transparent)`, border: `1px solid ${BORDER_HI}`,
                borderRadius: RADIUS.md,
                fontFamily: FD, fontSize: FS.label, fontWeight: 700,
                letterSpacing: '0.2em', color: HUD.gold, textTransform: 'uppercase',
                transition: EASE.default,
              }}
            >
              {rolled ? '↺ Re-Roll' : '▶ Roll Initiative'}
            </button>
          )}

          {/* ── Results ── */}
          {rolled && !submitted && (
            <div className="flex flex-col" style={{ gap: SP[2] }}>

              {/* Successes + Advantages — read-only */}
              <div className="flex" style={{ gap: SP[1] }}>
                {[
                  { label: 'Successes',  value: successes,       color: 'var(--state-success)', hint: 'Determines order' },
                  { label: 'Advantages', value: totalAdvantages, color: HUD.gold,               hint: 'Tiebreaker only' },
                ].map(({ label, value, color, hint }) => (
                  <div key={label} style={{
                    flex: 1,
                    background: `color-mix(in srgb, ${color} 5%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${color} 16%, transparent)`,
                    borderRadius: RADIUS.md, padding: `${SP[2]} ${SP[1]}`, textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: FB, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: HUD.textDim, marginBottom: SP[1] }}>
                      {label}
                    </div>
                    <div style={{ fontFamily: FD, fontSize: FS.h3, fontWeight: 700, color, lineHeight: 1, marginBottom: 3 }}>
                      {value}
                    </div>
                    <div style={{ fontFamily: FB, fontSize: FS.overline, color: HUD.textDim, fontStyle: 'italic' }}>
                      {hint}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Force pip section ── */}
              {forceRating > 0 && forceDice.length > 0 && (
                <div className="flex flex-col" style={{
                  background: 'color-mix(in srgb, var(--die-force) 5%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--die-force) 22%, transparent)',
                  borderRadius: RADIUS.md, padding: `${SP[2]} ${SP[3]}`,
                  gap: SP[2],
                }}>
                  <div style={{ fontFamily: FB, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: FORCE_BLUE }}>
                    ◈ Force Dice — spend pips for +3 Adv each
                  </div>

                  {/* Die results */}
                  <div className="flex items-center flex-wrap" style={{ gap: SP[2] }}>
                    {forceDice.map((die, i) => <ForceDieDisplay key={i} die={die} />)}
                    <div style={{ marginLeft: SP[1] }}>
                      {totalLight > 0 && (
                        <div style={{ fontFamily: FB, fontSize: FS.label, color: LIGHT_COLOR }}>
                          ○ {totalLight} Light
                        </div>
                      )}
                      {totalDark > 0 && (
                        <div style={{ fontFamily: FB, fontSize: FS.label, color: DARK_COLOR }}>
                          ● {totalDark} Dark
                        </div>
                      )}
                      {totalPips === 0 && (
                        <div style={{ fontFamily: FB, fontSize: FS.label, color: HUD.textFaint, fontStyle: 'italic' }}>
                          No pips rolled
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spend counter */}
                  {totalPips > 0 && (
                    <div className="flex items-center" style={{ gap: SP[2] }}>
                      <span className="flex-1" style={{ fontFamily: FB, fontSize: FS.label, color: HUD.textDim }}>
                        Spend pips:
                      </span>
                      <button
                        onClick={() => setPipsSpent(v => Math.max(0, v - 1))}
                        disabled={pipsSpent === 0}
                        className={pipsSpent === 0 ? 'cursor-default' : 'cursor-pointer'}
                        style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm, width: 26, height: 26, fontFamily: FD, fontSize: FS.sm, color: HUD.textDim, lineHeight: 1, opacity: pipsSpent === 0 ? 0.3 : 1 }}
                      >−</button>
                      <span style={{ fontFamily: FD, fontSize: FS.h4, fontWeight: 700, color: FORCE_BLUE, minWidth: 28, textAlign: 'center', lineHeight: 1 }}>
                        {pipsSpent}
                      </span>
                      <button
                        onClick={() => setPipsSpent(v => Math.min(totalPips, v + 1))}
                        disabled={pipsSpent >= totalPips}
                        className={pipsSpent >= totalPips ? 'cursor-default' : 'cursor-pointer'}
                        style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm, width: 26, height: 26, fontFamily: FD, fontSize: FS.sm, color: HUD.textDim, lineHeight: 1, opacity: pipsSpent >= totalPips ? 0.3 : 1 }}
                      >+</button>
                      <span style={{ fontFamily: FB, fontSize: FS.label, fontWeight: 700, color: FORCE_BLUE, minWidth: 48 }}>
                        {pipsSpent > 0 ? `+${pipsSpent * 3} Adv` : `of ${totalPips}`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Submit ── */}
              <button
                onClick={handleSubmit}
                disabled={busy}
                className={busy ? 'cursor-default' : 'cursor-pointer'}
                style={{
                  width: '100%', padding: `${SP[2]} 0`,
                  background: 'color-mix(in srgb, var(--state-success) 15%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--state-success) 50%, transparent)',
                  borderRadius: RADIUS.md,
                  fontFamily: FD, fontSize: FS.label, fontWeight: 700,
                  letterSpacing: '0.2em', color: 'var(--state-success)', textTransform: 'uppercase',
                  opacity: busy ? 0.6 : 1, transition: EASE.default,
                }}
              >
                ✓ Submit to GM
              </button>
            </div>
          )}

          {/* ── Submitted state ── */}
          {submitted && (
            <div style={{ textAlign: 'center', padding: `${SP[2]} 0` }}>
              <div style={{ fontFamily: FD, fontSize: FS.h4, fontWeight: 700, color: 'var(--state-success)', marginBottom: SP[1] }}>
                ✓ Submitted
              </div>
              <div style={{ fontFamily: FB, fontSize: FS.label, color: HUD.textDim }}>
                {skillName} · {successes} suc · {totalAdvantages} adv
                {pipsSpent > 0 && <span style={{ color: FORCE_BLUE }}> ({pipsSpent} ◈ spent)</span>}
              </div>
            </div>
          )}

          {/* ── Cancel — only where the host has something to cancel out of ── */}
          {!submitted && onCancel && (
            <button
              onClick={onCancel}
              className="cursor-pointer self-center"
              style={{ background: 'transparent', border: 'none', fontFamily: FB, fontSize: FS.caption, color: HUD.textDim, textDecoration: 'underline', padding: 0 }}
            >
              Cancel
            </button>
          )}

        </div>
    </>
  )
}

// ── Modal host ─────────────────────────────────────────────────
// Thin wrapper: the `Modal` shell plus the close behaviour. It contributes no
// roll logic of its own — every mechanic lives in the body above.
//
// What `Modal` provides that the inline host does not have: a portal to
// document.body (escaping any ancestor containing block), a blurred backdrop
// with click-to-dismiss, and Escape-key handling. There is no focus trap and no
// scroll lock in this project's Modal, so the inline host loses nothing on
// those counts.
//
// Backdrop click and Escape still dismiss silently — but that no longer LOSES
// the request. The pending_actions row survives and the card stays in the
// notifications drawer, which is precisely the guarantee the queue exists to
// provide.
interface InitiativeRollModalProps extends Omit<InitiativeRollBodyProps, 'onSubmitted' | 'onCancel'> {
  /** Popup close. Backdrop click and Escape both route here. */
  onClose: () => void
}

export function InitiativeRollModal({ onClose, ...bodyProps }: InitiativeRollModalProps) {
  const submittedHereRef = useRef(false)
  const sawRowRef        = useRef(false)

  const hasRow = !!bodyProps.pendingRow
  useEffect(() => { if (hasRow) sawRowRef.current = true }, [hasRow])

  // Cross-host reflection: if the player resolved this request in the drawer,
  // the row leaves over Realtime and this popup has nothing left to submit.
  // Only fires when a row was actually seen first, so a legacy broadcast-only
  // request (which never had a row) is not closed the instant it opens.
  useEffect(() => {
    if (submittedHereRef.current) return
    if (!sawRowRef.current || hasRow) return
    onClose()
  }, [hasRow, onClose])

  return (
    <Modal open onClose={onClose} maxWidth={440}>
      <InitiativeRollBody
        {...bodyProps}
        onCancel={onClose}
        onSubmitted={() => {
          submittedHereRef.current = true
          // Lets the ✓ Submitted state read before the popup goes. Ceremony
          // only — the write already happened inside the body. This timer
          // exists in the modal host ONLY; the inline card has no close target.
          setTimeout(onClose, 1400)
        }}
      />
    </Modal>
  )
}
