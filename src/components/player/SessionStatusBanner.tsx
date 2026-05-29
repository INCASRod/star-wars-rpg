'use client'

import type { SessionRollState } from '@/hooks/useSessionRollState'
import { HUD, FONT_BODY, FS, SP, COLOR } from '@/lib/tokens'

// ── Design tokens ─────────────────────────────────────────────────────────────
const baseStyle: React.CSSProperties = {
  padding: `0.4375rem ${SP[4]}`,
  display: 'flex',
  flexDirection: 'column',
  gap: SP[1],
  fontSize: FS.sm,
  fontFamily: FONT_BODY,
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
  if (value === undefined) return { color: COLOR.amber, bg: 'rgba(224,144,80,0.07)', border: '1px solid rgba(224,144,80,0.25)' }
  if (value >= 100) return { color: HUD.accentPurple, bg: 'rgba(160,80,220,0.08)', border: '1px solid rgba(160,80,220,0.3)' }
  if (value >= 67) return  { color: COLOR.red, bg: 'rgba(224,80,80,0.08)', border: '1px solid rgba(224,80,80,0.3)' }
  if (value >= 34) return  { color: COLOR.amber, bg: 'rgba(224,144,80,0.07)', border: '1px solid rgba(224,144,80,0.25)' }
  return { color: COLOR.green, bg: 'rgba(78,200,122,0.06)', border: '1px solid rgba(78,200,122,0.2)' }
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
              color: HUD.textDim,
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
              background: 'var(--hud-surface-lo)',
              borderBottom: '1px solid var(--hud-border-hi)',
              fontFamily: FONT_BODY,
              color: HUD.gold,
            }}>
              <div style={{ fontWeight: 700 }}>✦ YOUR Duty is triggered this session!</div>
              <div style={{ fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)', color: 'var(--hud-text-dim)' }}>
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
              background: 'var(--hud-surface-lo)',
              borderBottom: '1px solid var(--hud-border)',
              color: HUD.textDim,
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
              fontFamily: FONT_BODY,
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
