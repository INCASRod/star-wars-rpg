'use client'

import React, { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CriticalInjuryRequest, RefCriticalInjury, CharacterCriticalInjury } from '@/lib/types'

const FONT_C = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M = "'Share Tech Mono','Courier New',monospace"

const CRIMSON = '#DC143C'
const GOLD    = '#C8AA50'
const TEXT    = 'rgba(232,223,200,0.85)'
const DIM     = 'rgba(200,170,80,0.5)'

interface CriticalInjuryModalProps {
  request:      CriticalInjuryRequest
  characterId:  string
  characterName:string
  campaignId:   string | null
  refCrits:     RefCriticalInjury[]
  currentCrits: CharacterCriticalInjury[]  // active (non-healed) — for existing crit count
  sessionLabel?: string | null
  onDismiss:    () => void
}

export function CriticalInjuryModal({
  request,
  characterId,
  characterName,
  refCrits,
  currentCrits,
  sessionLabel,
  onDismiss,
}: CriticalInjuryModalProps) {
  const supabase = createClient()

  // Dropdown values: tens (0-9) and ones (0-0)
  // Result 00 → 100
  const [tens, setTens] = useState<number | null>(null)
  const [ones, setOnes] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const rolled = tens !== null && ones !== null
  const baseRoll = rolled ? (tens === 0 && ones === 0 ? 100 : tens * 10 + ones) : null
  const finalResult = baseRoll != null ? baseRoll + request.total_modifier : null

  const lookupInjury = (total: number): RefCriticalInjury | undefined => {
    // Clamp to the highest entry if total exceeds max
    const sorted = [...refCrits].sort((a, b) => b.roll_min - a.roll_min)
    return refCrits.find(c => total >= c.roll_min && total <= c.roll_max)
      ?? sorted[0]
  }

  const previewInjury = finalResult != null ? lookupInjury(finalResult) : undefined

  const handleRollForMe = () => {
    const d100 = Math.floor(Math.random() * 100) + 1
    const t = d100 === 100 ? 0 : Math.floor(d100 / 10)
    const o = d100 === 100 ? 0 : d100 % 10
    setTens(t)
    setOnes(o)
  }

  const handleSubmit = useCallback(async () => {
    if (baseRoll == null || finalResult == null) return
    setBusy(true)
    try {
      const injury = lookupInjury(finalResult)

      // 1. Update request: mark as rolled
      await supabase.from('critical_injury_requests').update({
        status:       'rolled',
        roll_result:  baseRoll,
        final_result: finalResult,
        injury_key:   injury?.id ?? null,
        resolved_at:  new Date().toISOString(),
      }).eq('id', request.id)

      // 2. Insert new character_critical_injury row
      if (injury) {
        await supabase.from('character_critical_injuries').insert({
          character_id:  characterId,
          injury_id:     injury.id,
          custom_name:   injury.name,
          severity:      injury.severity,
          description:   injury.description,
          is_healed:     false,
          roll_result:   baseRoll,
          total_roll:    finalResult,
          session_label: sessionLabel ?? null,
          vicious_mod:   request.vicious_mod,
          lethal_mod:    request.lethal_mod,
          gm_modifier:   request.gm_modifier,
        })
      }

      onDismiss()
    } finally {
      setBusy(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseRoll, finalResult, request, characterId, sessionLabel])

  const modBreakdown: { label: string; value: number }[] = [
    { label: 'Existing injuries', value: request.existing_mod },
    { label: 'Vicious',           value: request.vicious_mod },
    { label: 'Lethal Blows',      value: request.lethal_mod },
    { label: 'Additional',        value: request.gm_modifier },
  ].filter(m => m.value > 0)

  return (
    // Full-screen backdrop
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 'clamp(320px, 45vw, 460px)',
        background: 'rgba(8,16,10,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `2px solid rgba(220,20,60,0.5)`,
        borderRadius: 14,
        padding: 24,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>

        {/* Header */}
        <div>
          <div style={{
            fontFamily: FONT_C,
            fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
            fontWeight: 700,
            color: CRIMSON,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 4,
          }}>
            ⚡ Critical Injury
          </div>
          <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)', color: TEXT }}>
            {characterName}, your GM has requested a Critical Injury roll.
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(220,20,60,0.2)' }} />

        {/* Modifier breakdown */}
        <div>
          <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)', textTransform: 'uppercase', letterSpacing: '0.12em', color: DIM, marginBottom: 8 }}>
            Roll Modifier
          </div>
          {modBreakdown.length === 0 ? (
            <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.3vw, 0.9rem)', color: TEXT }}>
              No modifier — roll d100 straight.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {modBreakdown.map(m => (
                <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_R, fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)', color: TEXT }}>
                  <span>{m.label}</span>
                  <span style={{ color: CRIMSON, fontWeight: 700 }}>+{m.value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'rgba(200,170,80,0.15)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_M, fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)', color: GOLD }}>
                <span>Total modifier</span>
                <span style={{ fontWeight: 700 }}>+{request.total_modifier}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 1, background: 'rgba(220,20,60,0.2)' }} />

        {/* Dice dropdowns */}
        <div>
          <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)', textTransform: 'uppercase', letterSpacing: '0.12em', color: DIM, marginBottom: 10 }}>
            Roll two ten-sided dice (d100)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            {/* Tens dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <label style={{ fontFamily: FONT_M, fontSize: 'clamp(0.52rem, 0.8vw, 0.62rem)', color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Tens
              </label>
              <select
                value={tens ?? ''}
                onChange={e => setTens(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: `1px solid rgba(220,20,60,0.3)`,
                  borderRadius: 6, padding: '8px 12px',
                  fontFamily: FONT_M, fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
                  color: TEXT, textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <option value="">—</option>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div style={{ fontFamily: FONT_C, fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', color: DIM, marginTop: 18 }}>×</div>

            {/* Ones dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <label style={{ fontFamily: FONT_M, fontSize: 'clamp(0.52rem, 0.8vw, 0.62rem)', color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Ones
              </label>
              <select
                value={ones ?? ''}
                onChange={e => setOnes(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: `1px solid rgba(220,20,60,0.3)`,
                  borderRadius: 6, padding: '8px 12px',
                  fontFamily: FONT_M, fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
                  color: TEXT, textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <option value="">—</option>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Roll for me */}
          <button
            onClick={handleRollForMe}
            style={{
              width: '100%',
              background: 'rgba(220,20,60,0.08)',
              border: `1px solid rgba(220,20,60,0.3)`,
              borderRadius: 6, padding: '9px 0',
              fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.2vw, 0.9rem)',
              fontWeight: 700, letterSpacing: '0.08em',
              color: CRIMSON, cursor: 'pointer',
              marginBottom: rolled ? 12 : 0,
            }}
          >
            🎲 Roll for Me
          </button>

          {/* Live result preview */}
          {rolled && baseRoll != null && finalResult != null && (
            <div style={{
              background: 'rgba(220,20,60,0.06)',
              border: `1px solid rgba(220,20,60,0.25)`,
              borderRadius: 6, padding: '10px 14px',
            }}>
              <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)', color: DIM, marginBottom: 4 }}>
                Result
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: FONT_M, fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)', color: TEXT, fontWeight: 700 }}>
                  {baseRoll}
                </span>
                {request.total_modifier > 0 && (
                  <>
                    <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.82rem, 1.2vw, 0.9rem)', color: DIM }}>+</span>
                    <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.85rem, 1.3vw, 1rem)', color: CRIMSON }}>
                      {request.total_modifier}
                    </span>
                    <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.82rem, 1.2vw, 0.9rem)', color: DIM }}>=</span>
                    <span style={{ fontFamily: FONT_M, fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)', color: GOLD, fontWeight: 700 }}>
                      {finalResult}
                    </span>
                  </>
                )}
              </div>
              {previewInjury && (
                <div style={{ marginTop: 8, fontFamily: FONT_R, fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)', color: TEXT }}>
                  <span style={{ color: CRIMSON, fontWeight: 700 }}>{previewInjury.name}</span>
                  {' '}
                  <span style={{ color: DIM, fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)' }}>({previewInjury.severity})</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          disabled={!rolled || busy}
          onClick={handleSubmit}
          style={{
            background: rolled ? 'rgba(220,20,60,0.15)' : 'rgba(100,100,100,0.1)',
            border: `1px solid ${rolled ? 'rgba(220,20,60,0.5)' : 'rgba(100,100,100,0.2)'}`,
            borderRadius: 8, padding: '12px 0',
            fontFamily: FONT_R, fontSize: 'clamp(0.88rem, 1.3vw, 1rem)',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            color: rolled ? CRIMSON : 'rgba(150,150,150,0.5)',
            cursor: rolled ? 'pointer' : 'not-allowed',
            transition: '.15s',
          }}
        >
          {busy ? 'Submitting…' : 'Submit Result'}
        </button>

        <div style={{
          fontFamily: FONT_M, fontSize: 'clamp(0.5rem, 0.78vw, 0.6rem)',
          color: 'rgba(200,170,80,0.3)', textAlign: 'center', letterSpacing: '0.1em',
        }}>
          This roll is mandatory — you must submit a result.
        </div>
      </div>
    </div>
  )
}
