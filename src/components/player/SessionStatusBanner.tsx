'use client'

import type { SessionRollState } from '@/hooks/useSessionRollState'

// ── Design tokens ─────────────────────────────────────────────────────────────
const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_CINZEL = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const GOLD = '#C8AA50'
const TEXT_MUTED = 'rgba(232,223,200,0.7)'

const baseStyle: React.CSSProperties = {
  padding: '7px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 'clamp(0.78rem, 1.3vw, 0.9rem)',
  fontFamily: FC,
}

interface SessionStatusBannerProps {
  sessionRollState: SessionRollState | null
  characterId: string
  /** Map from characterId → characterName for the "X's duty triggered" message */
  characterNames: Record<string, string>
  /** The obligation_type of the triggered character (if applicable) */
  triggeredObligationType?: string
  /** The current obligation_value for threat-tier colouring of obligation banner */
  ownObligationValue?: number
}

function getObligationBannerColor(value: number | undefined) {
  if (value === undefined) return { color: '#E09050', bg: 'rgba(224,144,80,0.07)', border: '1px solid rgba(224,144,80,0.25)' }
  if (value >= 100) return { color: '#C878F0', bg: 'rgba(160,80,220,0.08)', border: '1px solid rgba(160,80,220,0.3)' }
  if (value >= 67) return  { color: '#E05050', bg: 'rgba(224,80,80,0.08)', border: '1px solid rgba(224,80,80,0.3)' }
  if (value >= 34) return  { color: '#E09050', bg: 'rgba(224,144,80,0.07)', border: '1px solid rgba(224,144,80,0.25)' }
  return { color: '#4EC87A', bg: 'rgba(78,200,122,0.06)', border: '1px solid rgba(78,200,122,0.2)' }
}

export function SessionStatusBanner({
  sessionRollState: s,
  characterId,
  characterNames,
  triggeredObligationType,
  ownObligationValue,
}: SessionStatusBannerProps) {
  if (!s) return null
  const showDuty = s.duty_revealed
  const showObl  = s.obligation_revealed
  if (!showDuty && !showObl) return null

  const dutyTriggeredName  = s.duty_triggered_char_id ? (characterNames[s.duty_triggered_char_id] ?? 'A character') : null
  const oblTriggeredName   = s.obligation_triggered_char_id ? (characterNames[s.obligation_triggered_char_id] ?? 'A character') : null
  const isMyDuty  = s.duty_triggered_char_id === characterId
  const isMyObl   = s.obligation_triggered_char_id === characterId

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Duty banner ── */}
      {showDuty && (() => {
        if (!s.duty_triggered) {
          return (
            <div style={{
              ...baseStyle,
              background: 'rgba(76,175,80,0.06)',
              borderBottom: '1px solid rgba(76,175,80,0.2)',
              color: TEXT_MUTED,
            }}>
              ✦ Duty Check: No Duty triggered this session.
            </div>
          )
        }
        if (isMyDuty) {
          const bonus = s.duty_is_doubles ? 4 : 2
          return (
            <div style={{
              ...baseStyle,
              background: 'rgba(200,170,80,0.1)',
              borderBottom: '1px solid rgba(200,170,80,0.4)',
              fontFamily: FONT_CINZEL,
              color: GOLD,
            }}>
              <div style={{ fontWeight: 700 }}>✦ YOUR Duty is triggered this session!</div>
              <div style={{ fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)', color: 'rgba(200,170,80,0.8)' }}>
                +{bonus} Wound Threshold active for this session.
                {s.duty_is_doubles && ' (Doubles)'}
              </div>
            </div>
          )
        }
        // Another character's duty
        const bonus = s.duty_is_doubles ? 2 : 1
        return (
          <div style={{
            ...baseStyle,
            background: 'rgba(78,200,122,0.08)',
            borderBottom: '1px solid rgba(78,200,122,0.3)',
            color: 'rgba(78,200,122,0.85)',
          }}>
            <div>✦ Duty triggered — {dutyTriggeredName}&apos;s Duty activates!</div>
            <div style={{ fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)', color: 'rgba(78,200,122,0.65)' }}>
              All characters: +{bonus} Wound Threshold active for this session.
              {s.duty_is_doubles && ' (Doubles)'}
            </div>
          </div>
        )
      })()}

      {/* ── Obligation banner ── */}
      {showObl && (() => {
        if (!s.obligation_triggered) {
          return (
            <div style={{
              ...baseStyle,
              background: 'rgba(200,170,80,0.04)',
              borderBottom: '1px solid rgba(200,170,80,0.15)',
              color: TEXT_MUTED,
            }}>
              ⚠ Obligation Check: No Obligation triggered this session.
            </div>
          )
        }
        if (isMyObl) {
          const { color, bg, border } = getObligationBannerColor(ownObligationValue)
          return (
            <div style={{
              ...baseStyle,
              background: bg,
              borderBottom: border,
              fontFamily: FONT_CINZEL,
              color,
            }}>
              <div style={{ fontWeight: 700 }}>⚠ YOUR Obligation is triggered this session.</div>
              <div style={{ fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)', color: `${color}bb` }}>
                Expect complications relating to your {triggeredObligationType ?? 'Obligation'}.
              </div>
            </div>
          )
        }
        return (
          <div style={{
            ...baseStyle,
            background: 'rgba(224,144,80,0.06)',
            borderBottom: '1px solid rgba(224,144,80,0.2)',
            color: 'rgba(224,144,80,0.75)',
          }}>
            ⚠ Obligation triggered — {oblTriggeredName}&apos;s Obligation activates.
          </div>
        )
      })()}
    </div>
  )
}
