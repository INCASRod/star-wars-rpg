'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { rollPool } from './dice-engine'
import type { Character, CharacterSkill } from '@/lib/types'
import { C, FONT_CINZEL, FONT_RAJDHANI, DICE_META, panelBase, FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4, FS_H3 } from './design-tokens'

// ── Dice pool builder ─────────────────────────────────────────
function buildPool(char: Character, skills: CharacterSkill[], type: 'cool' | 'vigilance') {
  const skillKey  = type === 'cool' ? 'COOL' : 'VIGIL'
  const charStat  = type === 'cool' ? (char.presence ?? 2) : (char.willpower ?? 2)
  const skillRank = skills.find(s => s.skill_key === skillKey)?.rank ?? 0
  const proficiency = Math.min(charStat, skillRank)
  const ability     = Math.max(charStat, skillRank) - proficiency
  return { proficiency, ability, charStat, skillRank }
}

// ── Die pip ───────────────────────────────────────────────────
function DiePip({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          width: 40, height: 40, borderRadius: 6,
          border: `2px solid ${color}`,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT_CINZEL, fontWeight: 700, fontSize: FS_SM, color,
        }}>{label}</div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
interface Props {
  character:      Character
  skills:         CharacterSkill[]
  initiativeType: 'cool' | 'vigilance'
  campaignId:     string
  onClose:        () => void
}

export function InitiativeRollModal({ character, skills, initiativeType, campaignId, onClose }: Props) {
  const { proficiency, ability, charStat, skillRank } = buildPool(character, skills, initiativeType)

  const [rolled,     setRolled]     = useState(false)
  const [successes,  setSuccesses]  = useState(0)
  const [advantages, setAdvantages] = useState(0)
  const [submitted,  setSubmitted]  = useState(false)
  const [busy,       setBusy]       = useState(false)

  const supabase = useMemo(() => createClient(), [])
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Subscribe to the initiative channel at mount so it's ready when Submit is clicked
  useEffect(() => {
    const ch = supabase.channel(`initiative-${campaignId}`)
    ch.subscribe()
    channelRef.current = ch
    return () => { supabase.removeChannel(ch); channelRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const skillName  = initiativeType === 'cool' ? 'Cool' : 'Vigilance'
  const charLabel  = initiativeType === 'cool' ? 'Presence' : 'Willpower'

  const handleRoll = () => {
    const result = rollPool({ proficiency, ability, boost: 0, challenge: 0, difficulty: 0, setback: 0 })
    const netSuc = result.net.success + result.net.triumph
    setSuccesses(Math.max(0, netSuc))
    setAdvantages(result.net.advantage)
    setRolled(true)
  }

  const handleSubmit = async () => {
    setBusy(true)
    const ch = channelRef.current
    if (ch) {
      await ch.send({
        type: 'broadcast',
        event: 'initiative-result',
        payload: { characterId: character.id, characterName: character.name, successes, advantages },
      })
    }
    setSubmitted(true)
    setBusy(false)
    setTimeout(onClose, 1200)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        ...panelBase,
        width: '100%', maxWidth: 420,
        border: `1px solid ${C.borderHi}`,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.textDim, marginBottom: 3 }}>
            Initiative Roll
          </div>
          <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: C.gold }}>
            {skillName} — {charLabel} {charStat}
            {skillRank > 0 && ` · Rank ${skillRank}`}
          </div>
        </div>

        <div style={{ padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Dice pool */}
          <div>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.textDim, marginBottom: 10 }}>
              Dice Pool
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', minHeight: 48, alignItems: 'center' }}>
              {proficiency > 0 && <DiePip color={DICE_META.proficiency.color} label="Y" count={proficiency} />}
              {ability > 0     && <DiePip color={DICE_META.ability.color}     label="G" count={ability} />}
              {proficiency === 0 && ability === 0 && (
                <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textFaint, fontStyle: 'italic' }}>No pool — stat is 0</span>
              )}
            </div>
          </div>

          {/* Roll button */}
          {!submitted && (
            <button
              onClick={handleRoll}
              style={{
                width: '100%', padding: '10px 0',
                background: `${C.gold}18`, border: `1px solid ${C.borderHi}`,
                borderRadius: 4, cursor: 'pointer',
                fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 700,
                letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase',
                transition: '.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${C.gold}30` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${C.gold}18` }}
            >
              ▶ Roll Initiative
            </button>
          )}

          {/* Result + manual override */}
          {rolled && !submitted && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                {[
                  { label: 'Successes', value: successes, set: setSuccesses, color: '#4EC87A' },
                  { label: 'Advantages', value: advantages, set: setAdvantages, color: C.gold },
                ].map(({ label, value, set, color }) => (
                  <div key={label} style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.textDim, marginBottom: 4 }}>
                      {label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => set(v => Math.max(0, v - 1))} style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, width: 24, height: 24, cursor: 'pointer', fontFamily: FONT_CINZEL, fontSize: FS_SM, color: C.textDim, lineHeight: 1 }}>−</button>
                      <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_H3, fontWeight: 700, color, minWidth: 32, textAlign: 'center', lineHeight: 1 }}>{value}</span>
                      <button onClick={() => set(v => v + 1)}             style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, width: 24, height: 24, cursor: 'pointer', fontFamily: FONT_CINZEL, fontSize: FS_SM, color: C.textDim, lineHeight: 1 }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, fontStyle: 'italic' }}>
                Adjust if rolling physical dice instead.
              </div>
              <button
                onClick={handleSubmit}
                disabled={busy}
                style={{
                  width: '100%', padding: '10px 0',
                  background: 'rgba(78,200,122,0.15)', border: '1px solid rgba(78,200,122,0.5)',
                  borderRadius: 4, cursor: busy ? 'default' : 'pointer',
                  fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 700,
                  letterSpacing: '0.2em', color: '#4EC87A', textTransform: 'uppercase',
                  opacity: busy ? 0.6 : 1, transition: '.15s',
                }}
              >
                ✓ Submit to GM
              </button>
            </div>
          )}

          {/* Submitted state */}
          {submitted && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: '#4EC87A', marginBottom: 4 }}>
                ✓ Submitted
              </div>
              <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim }}>
                {successes} suc · {advantages} adv sent to GM
              </div>
            </div>
          )}

          {/* Cancel */}
          {!submitted && (
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, textDecoration: 'underline', padding: 0, alignSelf: 'center' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
