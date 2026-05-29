'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { rollPool, rollForceDice } from './dice-engine'
import type { ForceDie } from './dice-engine'
import type { Character, CharacterSkill } from '@/lib/types'
import { C, FONT_CINZEL, FONT_RAJDHANI, DICE_META, panelBase, FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4, FS_H3 } from './design-tokens'

const FORCE_BLUE  = 'var(--die-force)'
const LIGHT_COLOR = 'var(--state-light-fp)'
const DARK_COLOR  = '#9090C0'

// ── Dice pool builder ──────────────────────────────────────────
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
    <div className="flex items-center" style={{ gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          width: 40, height: 40, borderRadius: 'var(--space-1-5, 0.375rem)',
          border: `2px solid ${color}`,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT_CINZEL, fontWeight: 700, fontSize: FS_SM, color,
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
      width: 44, height: 44, borderRadius: '50%',
      border: `2px solid color-mix(in srgb, var(--die-force) 50%, transparent)`,
      background: 'rgba(90,170,224,0.07)',
      gap: 3, padding: 7,
    }}>
      {pips.map((p, i) =>
        p === 'blank' ? (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(90,170,224,0.18)' }} />
        ) : (
          <div key={i} style={{
            width: 9, height: 9, borderRadius: '50%',
            background: p === 'light' ? LIGHT_COLOR : '#1a1a2e',
            border: p === 'dark' ? `1px solid ${DARK_COLOR}` : 'none',
            boxShadow: p === 'light' ? `0 0 5px ${LIGHT_COLOR}` : 'none',
          }} />
        )
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
interface Props {
  character:      Character
  skills:         CharacterSkill[]
  initiativeType: 'cool' | 'vigilance'
  campaignId:     string
  forceRating?:   number
  onClose:        () => void
}

export function InitiativeRollModal({ character, skills, initiativeType, campaignId, forceRating = 0, onClose }: Props) {
  const { proficiency, ability, charStat, skillRank } = buildPool(character, skills, initiativeType)

  const [rolled,    setRolled]    = useState(false)
  const [successes, setSuccesses] = useState(0)
  const [baseAdv,   setBaseAdv]   = useState(0)
  const [forceDice, setForceDice] = useState<ForceDie[]>([])
  const [pipsSpent, setPipsSpent] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [busy,      setBusy]      = useState(false)

  const supabase   = useMemo(() => createClient(), [])
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const ch = supabase.channel(`initiative-${campaignId}`)
    ch.subscribe()
    channelRef.current = ch
    return () => { supabase.removeChannel(ch); channelRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const skillName = initiativeType === 'cool' ? 'Cool' : 'Vigilance'
  const charLabel = initiativeType === 'cool' ? 'Presence' : 'Willpower'

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

    setSubmitted(true)
    setBusy(false)
    setTimeout(onClose, 1400)
  }

  return (
    <Modal open onClose={onClose} maxWidth={440}>

        {/* ── Header ── */}
        <div style={{ padding: '0.875rem var(--space-4-5, 1.125rem)', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.textDim, marginBottom: 3 }}>
            Initiative Roll
          </div>
          <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: C.gold }}>
            {skillName} — {charLabel} {charStat}
            {skillRank > 0 && ` · Rank ${skillRank}`}
          </div>
        </div>

        <div className="flex flex-col" style={{ padding: 'var(--space-4-5, 1.125rem)', gap: 16 }}>

          {/* ── Dice pool display ── */}
          <div>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.textDim, marginBottom: '0.625rem' }}>
              Dice Pool
            </div>
            <div className="flex flex-wrap items-center" style={{ gap: '0.625rem' }}>
              {proficiency > 0 && <DiePip color={DICE_META.proficiency.color} label="Y" count={proficiency} />}
              {ability > 0     && <DiePip color={DICE_META.ability.color}     label="G" count={ability} />}
              {proficiency === 0 && ability === 0 && (
                <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textFaint, fontStyle: 'italic' }}>No pool — stat is 0</span>
              )}
              {/* Force dice shown in pool if applicable */}
              {forceRating > 0 && (<>
                <div style={{ width: 1, height: 32, background: C.border, margin: '0 2px' }} />
                {Array.from({ length: forceRating }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center" style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: `2px solid color-mix(in srgb, var(--die-force) 70%, transparent)`,
                    background: 'rgba(90,170,224,0.07)',
                    fontFamily: FONT_CINZEL, fontWeight: 700, fontSize: FS_SM, color: FORCE_BLUE,
                  }}>◈</div>
                ))}
                <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: FORCE_BLUE }}>Force</span>
              </>)}
            </div>
            {forceRating > 0 && (
              <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: FORCE_BLUE, opacity: 0.7, marginTop: 6 }}>
                Force user — can spend pips for +3 Adv each after rolling
              </div>
            )}
          </div>

          {/* ── Roll / Re-roll button ── */}
          {!submitted && (
            <button
              onClick={handleRoll}
              className="hov-gold-bg w-full cursor-pointer"
              style={{
                padding: '0.625rem 0',
                background: `${C.gold}18`, border: `1px solid ${C.borderHi}`,
                borderRadius: 4,
                fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 700,
                letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase',
                transition: 'var(--ease-default)',
              }}
            >
              {rolled ? '↺ Re-Roll' : '▶ Roll Initiative'}
            </button>
          )}

          {/* ── Results ── */}
          {rolled && !submitted && (
            <div className="flex flex-col" style={{ gap: 12 }}>

              {/* Successes + Advantages — read-only */}
              <div className="flex" style={{ gap: '0.625rem' }}>
                {[
                  { label: 'Successes',  value: successes,       color: 'var(--state-success)', hint: 'Determines order' },
                  { label: 'Advantages', value: totalAdvantages, color: C.gold,                 hint: 'Tiebreaker only' },
                ].map(({ label, value, color, hint }) => (
                  <div key={label} style={{
                    flex: 1,
                    background: `color-mix(in srgb, ${color} 5%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${color} 16%, transparent)`,
                    borderRadius: 4, padding: 'var(--space-2) 0.625rem', textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textDim, marginBottom: 'var(--space-1)' }}>
                      {label}
                    </div>
                    <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H3, fontWeight: 700, color, lineHeight: 1, marginBottom: 3 }}>
                      {value}
                    </div>
                    <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim, fontStyle: 'italic' }}>
                      {hint}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Force pip section ── */}
              {forceRating > 0 && forceDice.length > 0 && (
                <div className="flex flex-col" style={{
                  background: 'rgba(90,170,224,0.05)',
                  border: '1px solid rgba(90,170,224,0.22)',
                  borderRadius: 4, padding: '0.625rem var(--space-3)',
                  gap: 'var(--space-2)',
                }}>
                  <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: FORCE_BLUE }}>
                    ◈ Force Dice — spend pips for +3 Adv each
                  </div>

                  {/* Die results */}
                  <div className="flex items-center flex-wrap" style={{ gap: 'var(--space-2)' }}>
                    {forceDice.map((die, i) => <ForceDieDisplay key={i} die={die} />)}
                    <div style={{ marginLeft: 'var(--space-1)' }}>
                      {totalLight > 0 && (
                        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: LIGHT_COLOR }}>
                          ○ {totalLight} Light
                        </div>
                      )}
                      {totalDark > 0 && (
                        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: DARK_COLOR }}>
                          ● {totalDark} Dark
                        </div>
                      )}
                      {totalPips === 0 && (
                        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textFaint, fontStyle: 'italic' }}>
                          No pips rolled
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spend counter */}
                  {totalPips > 0 && (
                    <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                      <span className="flex-1" style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim }}>
                        Spend pips:
                      </span>
                      <button
                        onClick={() => setPipsSpent(v => Math.max(0, v - 1))}
                        disabled={pipsSpent === 0}
                        className={pipsSpent === 0 ? 'cursor-default' : 'cursor-pointer'}
                        style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, width: 26, height: 26, fontFamily: FONT_CINZEL, fontSize: FS_SM, color: C.textDim, lineHeight: 1, opacity: pipsSpent === 0 ? 0.3 : 1 }}
                      >−</button>
                      <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: FORCE_BLUE, minWidth: 28, textAlign: 'center', lineHeight: 1 }}>
                        {pipsSpent}
                      </span>
                      <button
                        onClick={() => setPipsSpent(v => Math.min(totalPips, v + 1))}
                        disabled={pipsSpent >= totalPips}
                        className={pipsSpent >= totalPips ? 'cursor-default' : 'cursor-pointer'}
                        style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, width: 26, height: 26, fontFamily: FONT_CINZEL, fontSize: FS_SM, color: C.textDim, lineHeight: 1, opacity: pipsSpent >= totalPips ? 0.3 : 1 }}
                      >+</button>
                      <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700, color: FORCE_BLUE, minWidth: 48 }}>
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
                  width: '100%', padding: '0.625rem 0',
                  background: 'color-mix(in srgb, var(--state-success) 15%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--state-success) 50%, transparent)',
                  borderRadius: 4,
                  fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 700,
                  letterSpacing: '0.2em', color: 'var(--state-success)', textTransform: 'uppercase',
                  opacity: busy ? 0.6 : 1, transition: 'var(--ease-default)',
                }}
              >
                ✓ Submit to GM
              </button>
            </div>
          )}

          {/* ── Submitted state ── */}
          {submitted && (
            <div style={{ textAlign: 'center', padding: '0.625rem 0' }}>
              <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: 'var(--state-success)', marginBottom: 'var(--space-1)' }}>
                ✓ Submitted
              </div>
              <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim }}>
                {successes} suc · {totalAdvantages} adv
                {pipsSpent > 0 && <span style={{ color: FORCE_BLUE }}> ({pipsSpent} ◈ spent)</span>}
              </div>
            </div>
          )}

          {/* ── Cancel ── */}
          {!submitted && (
            <button
              onClick={onClose}
              className="cursor-pointer self-center"
              style={{ background: 'transparent', border: 'none', fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, textDecoration: 'underline', padding: 0 }}
            >
              Cancel
            </button>
          )}

        </div>
    </Modal>
  )
}
