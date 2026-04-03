'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { rollForceDice } from '@/lib/forceRoll'
import type { SupabaseClient } from '@supabase/supabase-js'

// ── Design tokens ─────────────────────────────────────────────────────────────
const FONT_C    = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono','Courier New',monospace"
const GOLD      = '#C8AA50'
const GOLD_BD   = 'rgba(200,170,80,0.3)'
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const TEXT      = 'rgba(232,223,200,0.85)'
const DIM       = '#6A8070'
const BORDER    = 'rgba(200,170,80,0.14)'
const LIGHT_CLR = '#7EC8E3'
const DARK_CLR  = '#8B2BE2'
const BG        = 'rgba(6,13,9,0.98)'
const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'
const FS_LABEL  = 'var(--text-label)'
const FS_SM     = 'var(--text-sm)'
const FS_H4     = 'var(--text-h4)'

interface DestinyRollModalProps {
  poolId:        string
  campaignId:    string
  characterId:   string
  characterName: string
  supabase:      SupabaseClient
  onSubmitted:   () => void
}

export function DestinyRollModal({
  poolId, campaignId, characterId, characterName,
  supabase, onSubmitted,
}: DestinyRollModalProps) {
  const [lightRolled,   setLightRolled]   = useState<number | null>(null)
  const [darkRolled,    setDarkRolled]    = useState<number | null>(null)
  const [manualLight,   setManualLight]   = useState(0)
  const [manualDark,    setManualDark]    = useState(0)
  const [useManual,     setUseManual]     = useState(false)
  const [rolling,       setRolling]       = useState(false)
  const [busy,          setBusy]          = useState(false)
  const [dieSpinning,   setDieSpinning]   = useState(false)

  const hasResult = useManual
    ? (manualLight + manualDark > 0 || manualLight !== null)
    : lightRolled !== null

  const finalLight = useManual ? manualLight : (lightRolled ?? 0)
  const finalDark  = useManual ? manualDark  : (darkRolled  ?? 0)

  const handleRoll = () => {
    setRolling(true)
    setDieSpinning(true)
    setTimeout(() => {
      const result = rollForceDice(1)
      setLightRolled(result.totalLight)
      setDarkRolled(result.totalDark)
      setUseManual(false)
      setDieSpinning(false)
      setRolling(false)
    }, 600)
  }

  const handleSubmit = async () => {
    setBusy(true)
    try {
      // Insert roll record
      await supabase.from('destiny_pool_rolls').insert({
        campaign_id:    campaignId,
        pool_id:        poolId,
        character_id:   characterId,
        character_name: characterName,
        light_rolled:   finalLight,
        dark_rolled:    finalDark,
        die_result:     useManual ? { manual: true } : { light: finalLight, dark: finalDark },
      })

      // Increment pool totals
      const { data: pool } = await supabase
        .from('destiny_pool')
        .select('light_count, dark_count')
        .eq('id', poolId)
        .single()

      if (pool) {
        await supabase.from('destiny_pool').update({
          light_count: pool.light_count + finalLight,
          dark_count:  pool.dark_count  + finalDark,
        }).eq('id', poolId)
      }

      onSubmitted()
    } finally {
      setBusy(false)
    }
  }

  const modal = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9100,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: 'clamp(320px, 90vw, 480px)',
        background: BG,
        border: `2px solid rgba(126,200,227,0.4)`,
        borderRadius: 12,
        boxShadow: '0 16px 48px rgba(0,0,0,0.8), 0 0 40px rgba(126,200,227,0.08)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px 14px',
          borderBottom: `1px solid ${BORDER}`,
          background: 'rgba(126,200,227,0.04)',
        }}>
          <div style={{ fontFamily: FONT_C, fontSize: FS_H4, fontWeight: 700, color: LIGHT_CLR, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            ◈ Destiny Pool Generation
          </div>
          <div style={{ fontFamily: FONT_R, fontSize: FS_SM, color: TEXT }}>
            Your GM has started a new Destiny Pool.<br />Roll your Force die to contribute.
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Force die icon */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: `3px solid ${LIGHT_CLR}60`,
              background: 'rgba(126,200,227,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
              transition: 'transform 600ms ease',
              transform: dieSpinning ? 'rotate(720deg) scale(1.15)' : 'rotate(0deg) scale(1)',
            }}>
              ◯
            </div>
          </div>

          {/* Roll result */}
          {lightRolled !== null && !useManual && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(126,200,227,0.05)',
              border: `1px solid rgba(126,200,227,0.25)`,
              borderRadius: 6, textAlign: 'center',
            }}>
              <div style={{ fontFamily: FONT_R, fontSize: FS_CAP, color: DIM, marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                You rolled
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                <span style={{ fontFamily: FONT_M, fontSize: FS_SM, color: LIGHT_CLR }}>
                  ○ {lightRolled} light
                </span>
                <span style={{ fontFamily: FONT_M, fontSize: FS_SM, color: DARK_CLR }}>
                  ● {darkRolled} dark
                </span>
              </div>
            </div>
          )}

          {/* Roll button */}
          {!useManual && (
            <button
              onClick={handleRoll}
              disabled={rolling || busy}
              style={{
                fontFamily: FONT_R, fontSize: FS_SM, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: 'clamp(8px, 1.5vh, 12px) 20px', borderRadius: 6, cursor: rolling || busy ? 'wait' : 'pointer',
                background: 'rgba(126,200,227,0.12)',
                border: `1px solid rgba(126,200,227,0.4)`,
                color: LIGHT_CLR,
                transition: '.15s',
                opacity: rolling || busy ? 0.6 : 1,
              }}
            >
              {rolling ? 'Rolling…' : lightRolled !== null ? '🎲 Re-Roll' : '🎲 Roll Force Die'}
            </button>
          )}

          {/* Divider / manual toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
            <button
              onClick={() => setUseManual(!useManual)}
              style={{ fontFamily: FONT_R, fontSize: FS_CAP, color: DIM, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}
            >
              {useManual ? 'Use app roll instead' : 'Enter manually'}
            </button>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
          </div>

          {/* Manual entry */}
          {useManual && (
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: FONT_R, fontSize: FS_OVER, fontWeight: 700, color: LIGHT_CLR, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Light pips ○
                </span>
                <input
                  type="number" min={0} max={5}
                  value={manualLight}
                  onChange={e => setManualLight(Math.min(5, Math.max(0, parseInt(e.target.value) || 0)))}
                  style={{
                    width: 64, textAlign: 'center',
                    background: 'rgba(0,0,0,0.4)', border: `1px solid rgba(126,200,227,0.3)`,
                    color: LIGHT_CLR, fontFamily: FONT_M, fontSize: FS_H4,
                    padding: '8px 4px', borderRadius: 4, outline: 'none',
                  }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: FONT_R, fontSize: FS_OVER, fontWeight: 700, color: DARK_CLR, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Dark pips ●
                </span>
                <input
                  type="number" min={0} max={5}
                  value={manualDark}
                  onChange={e => setManualDark(Math.min(5, Math.max(0, parseInt(e.target.value) || 0)))}
                  style={{
                    width: 64, textAlign: 'center',
                    background: 'rgba(0,0,0,0.4)', border: `1px solid rgba(139,43,226,0.3)`,
                    color: DARK_CLR, fontFamily: FONT_M, fontSize: FS_H4,
                    padding: '8px 4px', borderRadius: 4, outline: 'none',
                  }}
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px 20px',
          borderTop: `1px solid ${BORDER}`,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <button
            onClick={handleSubmit}
            disabled={!hasResult || busy}
            style={{
              fontFamily: FONT_R, fontSize: FS_SM, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: 'clamp(9px, 1.5vh, 13px) 24px', borderRadius: 6,
              cursor: !hasResult || busy ? 'not-allowed' : 'pointer',
              background: 'rgba(200,170,80,0.15)',
              border: `1px solid ${GOLD_BD}`,
              color: GOLD,
              opacity: !hasResult || busy ? 0.4 : 1,
              transition: '.15s',
            }}
          >
            {busy ? 'Submitting…' : 'Submit'}
          </button>
          <div style={{ fontFamily: FONT_R, fontSize: FS_CAP, color: GOLD_DIM, textAlign: 'center', fontStyle: 'italic' }}>
            This roll is mandatory — you must submit a result.
          </div>
        </div>
      </div>
    </div>
  )

  if (typeof window === 'undefined') return null
  return createPortal(modal, document.body)
}
