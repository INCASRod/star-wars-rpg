'use client'

import { useState } from 'react'
import type { Character } from '@/lib/types'
import { DutyCard } from '@/components/character/DutyCard'
import { ObligationCard } from '@/components/character/ObligationCard'
import { HUD } from '@/lib/tokens'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD_DIM = 'var(--hud-text-dim)'
const GOLD_BD  = 'var(--hud-border)'
const BORDER   = 'var(--hud-border)'
const TEXT     = 'var(--hud-text)'
const TEXT_DIM = 'var(--hud-text-dim)'
const CARD_BG  = 'var(--hud-surface-lo)'
const FONT_C   = 'var(--font-body)'
const FONT_R   = 'var(--font-body)'
const FONT_M   = 'var(--font-body)'

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: FONT_C,
      fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
      fontWeight: 700,
      color: HUD.gold,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      padding: '12px 16px 6px',
      borderBottom: `1px solid ${BORDER}`,
      marginBottom: 8,
    }}>
      {label}
    </div>
  )
}

interface NotesTabProps {
  character: Character
}

export function NotesTab({ character }: NotesTabProps) {
  const NOTES_KEY = `holocron_notes_${character.id}`
  const [localNotes, setLocalNotes] = useState<string>(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem(NOTES_KEY) ?? ''
  })

  const handleNotesChange = (value: string) => {
    setLocalNotes(value)
    try { localStorage.setItem(NOTES_KEY, value) } catch { /* storage full */ }
  }

  const hasDuty       = !!character.duty_type
  const hasObligation = !!character.obligation_type

  return (
    <div style={{ paddingBottom: 24 }}>

      {/* ── Obligation / Duty ── */}
      {(hasObligation || hasDuty) && (
        <>
          <SectionHeader label="Obligation / Duty" />
          <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {character.duty_obligation_configured ? (
              <>
                {hasDuty && character.duty_value !== undefined && (
                  <DutyCard
                    dutyType={character.duty_type!}
                    dutyValue={character.duty_value}
                    dutyLore={character.duty_lore}
                    dutyCustomName={character.duty_custom_name}
                  />
                )}
                {hasObligation && character.obligation_value !== undefined && (
                  <ObligationCard
                    obligationType={character.obligation_type!}
                    obligationValue={character.obligation_value}
                    obligationLore={character.obligation_lore}
                    obligationCustomName={character.obligation_custom_name}
                  />
                )}
              </>
            ) : (
              <>
                {hasObligation && (
                  <div style={{
                    background: CARD_BG, border: `1px solid ${GOLD_BD}`,
                    borderRadius: 8, padding: '10px 12px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div>
                      <div style={{ fontFamily: FONT_C, fontSize: 'clamp(0.55rem, 2.2vw, 0.7rem)', color: GOLD_DIM, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Obligation</div>
                      <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', fontWeight: 600, color: TEXT }}>{character.obligation_type}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontFamily: FONT_C, fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', fontWeight: 700, color: HUD.gold }}>
                      {character.obligation_value ?? '—'}
                    </div>
                  </div>
                )}
                {hasDuty && (
                  <div style={{
                    background: CARD_BG, border: `1px solid ${GOLD_BD}`,
                    borderRadius: 8, padding: '10px 12px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div>
                      <div style={{ fontFamily: FONT_C, fontSize: 'clamp(0.55rem, 2.2vw, 0.7rem)', color: GOLD_DIM, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Duty</div>
                      <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', fontWeight: 600, color: TEXT }}>{character.duty_type}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontFamily: FONT_C, fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', fontWeight: 700, color: '#4FC3F7' }}>
                      {character.duty_value ?? '—'}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* ── Motivation (backstory) ── */}
      {character.backstory && (
        <>
          <SectionHeader label="Motivation" />
          <div style={{ padding: '0 16px 12px' }}>
            <div style={{
              background: CARD_BG,
              border: `1px solid ${GOLD_BD}`,
              borderRadius: 8,
              padding: '10px 12px',
            }}>
              <p style={{
                fontFamily: FONT_R,
                fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
                color: TEXT,
                margin: 0,
                lineHeight: 1.55,
              }}>
                {character.backstory}
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── Session Notes ── */}
      <SectionHeader label="Session Notes" />
      <div style={{ padding: '0 16px' }}>
        <textarea
          value={localNotes}
          onChange={e => handleNotesChange(e.target.value)}
          placeholder="Session notes…"
          style={{
            width: '100%',
            minHeight: 200,
            background: 'var(--hud-surface-lo)',
            border: `1px solid ${GOLD_BD}`,
            borderRadius: 8,
            color: TEXT,
            fontFamily: FONT_M,
            fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',
            padding: 12,
            resize: 'vertical',
            outline: 'none',
            lineHeight: 1.5,
            boxSizing: 'border-box',
          }}
        />
        <p style={{
          fontFamily: FONT_R,
          fontSize: 'clamp(0.6rem, 2.4vw, 0.7rem)',
          color: GOLD_DIM,
          margin: '4px 0 0',
          textAlign: 'right',
        }}>
          Saved to this device
        </p>
      </div>
    </div>
  )
}
