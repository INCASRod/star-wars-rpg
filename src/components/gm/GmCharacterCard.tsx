'use client'

import { useRouter } from 'next/navigation'
import type { Character, RefCriticalInjury, RefDutyType, RefObligationType } from '@/lib/types'
import { HUD } from '@/lib/tokens'

/* ── Design tokens (scoped to this component) ── */
const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FR = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const PANEL_BG = 'rgba(8,16,10,0.88)'
const GOLD_DIM = '#7A6830'
const TEXT = '#C8D8C0'
const DIM = '#6A8070'
const FAINT = '#2A3A2E'
const BORDER = 'rgba(200,170,80,0.14)'
const GREEN = '#4EC87A'
const RED = '#E05050'
const BLUE = '#5AAAE0'
const CYAN = '#60C8E0'
const ORANGE = '#E07855'

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'
const FS_SM       = 'var(--text-sm)'

const panelBase: React.CSSProperties = {
  background: PANEL_BG,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  position: 'relative',
}
const rowHdrMb2: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2,
}
const hpBarBg: React.CSSProperties = { height: 7, background: FAINT, borderRadius: 2, overflow: 'hidden' }
const rowCritStat: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  fontFamily: FR, fontSize: FS_CAPTION, color: DIM,
}
const btnStepSm: React.CSSProperties = {
  background: 'rgba(100,100,100,0.15)', border: '1px solid rgba(100,100,100,0.2)',
  borderRadius: 2, width: 18, height: 18, cursor: 'pointer', color: DIM,
  fontSize: FS_OVERLINE, padding: 0,
}
const statLabelSpan: React.CSSProperties = {
  fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, color: DIM,
  textTransform: 'uppercase', letterSpacing: '0.1em',
}
const btnSmall: React.CSSProperties = {
  background: 'rgba(200,170,80,0.08)',
  border: `1px solid rgba(200,170,80,0.2)`,
  color: DIM,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  padding: '4px 10px',
  borderRadius: 3,
  cursor: 'pointer',
}

function CornerBrackets() {
  const s: React.CSSProperties = { position: 'absolute', width: 8, height: 8 }
  return (<>
    <div style={{ ...s, top: 0, left: 0, borderTop: '1px solid rgba(200,170,80,0.35)', borderLeft: '1px solid rgba(200,170,80,0.35)' }} />
    <div style={{ ...s, top: 0, right: 0, borderTop: '1px solid rgba(200,170,80,0.35)', borderRight: '1px solid rgba(200,170,80,0.35)' }} />
    <div style={{ ...s, bottom: 0, left: 0, borderBottom: '1px solid rgba(200,170,80,0.35)', borderLeft: '1px solid rgba(200,170,80,0.35)' }} />
    <div style={{ ...s, bottom: 0, right: 0, borderBottom: '1px solid rgba(200,170,80,0.35)', borderRight: '1px solid rgba(200,170,80,0.35)' }} />
  </>)
}

export interface GmCharacterCardProps {
  c:                  Character
  campaignId:         string | null
  players:            Record<string, string>
  obligationTypes:    RefObligationType[]
  dutyTypes:          RefDutyType[]
  charActiveCritCounts: Record<string, number>
  critReqOpenFor:     string | null
  critReqVicious:     number
  critReqLethal:      number
  critReqGm:          number
  critReqBusy:        boolean
  onAddWound:         (charId: string) => void
  onHealWounds:       (charId: string) => void
  onAddStrain:        (charId: string) => void
  onHealStrain:       (charId: string) => void
  onAdjustObligation: (charId: string, delta: number) => void
  onAdjustDuty:       (charId: string, delta: number) => void
  onAdjustMorality:   (charId: string, delta: number) => void
  onMoralitySetup:    (c: Character) => void
  onFallenConfirm:    (payload: { id: string; name: string; isFallen: boolean; morality?: number | null }) => void
  onArchiveConfirm:   (payload: { id: string; name: string }) => void
  onCritOpen:         (charId: string) => void
  onCritClose:        () => void
  onSetCritVicious:   React.Dispatch<React.SetStateAction<number>>
  onSetCritLethal:    React.Dispatch<React.SetStateAction<number>>
  onSetCritGm:        React.Dispatch<React.SetStateAction<number>>
  onSendCritRequest:  (charId: string) => void
  refCritsDb:         RefCriticalInjury[]
  addCritOpenFor:     string | null
  addCritRefId:       number | null
  addCritName:        string
  addCritDesc:        string
  addCritSeverity:    string
  addCritBusy:        boolean
  onAddCritOpen:      (charId: string) => void
  onAddCritClose:     () => void
  onSelectAddCritRef: (refId: number) => void
  onSetAddCritName:   React.Dispatch<React.SetStateAction<string>>
  onSetAddCritDesc:   React.Dispatch<React.SetStateAction<string>>
  onAddCritApply:     (charId: string) => Promise<void>
}

export function GmCharacterCard({
  c, campaignId, players, obligationTypes, dutyTypes, charActiveCritCounts,
  critReqOpenFor, critReqVicious, critReqLethal, critReqGm, critReqBusy,
  onAddWound, onHealWounds, onAddStrain, onHealStrain,
  onAdjustObligation, onAdjustDuty, onAdjustMorality,
  onMoralitySetup, onFallenConfirm, onArchiveConfirm,
  onCritOpen, onCritClose, onSetCritVicious, onSetCritLethal, onSetCritGm,
  onSendCritRequest,
  refCritsDb,
  addCritOpenFor, addCritRefId, addCritName, addCritDesc, addCritSeverity, addCritBusy,
  onAddCritOpen, onAddCritClose, onSelectAddCritRef,
  onSetAddCritName, onSetAddCritDesc, onAddCritApply,
}: GmCharacterCardProps) {
  const router = useRouter()

  const cardAccent = HUD.gold
  const isIncap = c.wound_current >= c.wound_threshold
  const isStrainHigh = c.strain_current > c.strain_threshold * 0.75
  const leftBorderColor = isIncap ? RED : isStrainHigh ? CYAN : 'transparent'
  const wPct = Math.min(100, (c.wound_current / c.wound_threshold) * 100)
  const sPct = Math.min(100, (c.strain_current / c.strain_threshold) * 100)
  const wColor = wPct >= 100 ? RED : wPct >= 75 ? ORANGE : GREEN
  const sColor = sPct >= 100 ? RED : sPct >= 75 ? CYAN : '#60C8E0'
  const playerName = players[c.player_id] || ''

  return (
    <div
      style={{
        ...panelBase,
        padding: 12,
        borderLeft: `3px solid ${leftBorderColor}`,
        boxShadow: isIncap ? '0 0 12px rgba(224,80,80,0.2)' : undefined,
      }}
    >
      <CornerBrackets />

      {/* Header: avatar + info */}
      <div
        onClick={() => router.push(`/character/${c.id}?gm=1&campaign=${campaignId}`)}
        style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, cursor: 'pointer' }}
      >
        {c.portrait_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.portrait_url}
            alt={c.name}
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(200,170,80,0.35)', flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `${cardAccent}14`, border: `1.5px solid ${cardAccent}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FC, fontSize: FS_SM, color: cardAccent, flexShrink: 0,
          }}>
            {c.name.charAt(0)}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {c.name}
          </div>
          <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 600, color: DIM, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>
            {c.species_key} · {c.career_key}
          </div>
          {playerName && (
            <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 600, color: GOLD_DIM, marginTop: 1 }}>{playerName}</div>
          )}
        </div>
      </div>

      {/* Dark Side badge */}
      {c.is_dark_side_fallen && (
        <div style={{ marginBottom: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '2px 7px',
            background: 'rgba(139,43,226,0.12)',
            border: '1px solid rgba(139,43,226,0.4)',
            borderRadius: 4,
            fontFamily: "'Share Tech Mono','Courier New',monospace",
            fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            color: 'rgba(139,43,226,0.8)',
          }}>
            ☠ DARK SIDE
          </span>
        </div>
      )}

      {/* Wound bar */}
      <div style={{ marginBottom: 5 }}>
        <div style={rowHdrMb2}>
          <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 600, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase' }}>WOUNDS</span>
          <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: c.wound_current >= c.wound_threshold ? RED : DIM }}>
            {c.wound_current}/{c.wound_threshold}
          </span>
        </div>
        <div style={hpBarBg}>
          <div style={{ height: '100%', width: `${wPct}%`, background: wColor, boxShadow: `0 0 4px ${wColor}60`, transition: '.3s', borderRadius: 2 }} />
        </div>
      </div>

      {/* Strain bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={rowHdrMb2}>
          <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 600, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase' }}>STRAIN</span>
          <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: c.strain_current >= c.strain_threshold ? RED : DIM }}>
            {c.strain_current}/{c.strain_threshold}
          </span>
        </div>
        <div style={hpBarBg}>
          <div style={{ height: '100%', width: `${sPct}%`, background: sColor, boxShadow: `0 0 4px ${sColor}60`, transition: '.3s', borderRadius: 2 }} />
        </div>
      </div>

      {/* Action buttons 2x2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        <button
          onClick={() => onAddWound(c.id)}
          style={{ background: 'rgba(224,80,80,0.12)', border: '1px solid rgba(224,80,80,0.3)', borderRadius: 3, padding: '3px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.06em', color: RED }}
        >W +1</button>
        <button
          onClick={() => onHealWounds(c.id)}
          style={{ background: 'rgba(78,200,122,0.12)', border: '1px solid rgba(78,200,122,0.3)', borderRadius: 3, padding: '3px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.06em', color: GREEN }}
        >W −1</button>
        <button
          onClick={() => onAddStrain(c.id)}
          style={{ background: 'rgba(96,200,224,0.12)', border: '1px solid rgba(96,200,224,0.3)', borderRadius: 3, padding: '3px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.06em', color: CYAN }}
        >S +1</button>
        <button
          onClick={() => onHealStrain(c.id)}
          style={{ background: 'rgba(200,170,80,0.10)', border: '1px solid rgba(200,170,80,0.3)', borderRadius: 3, padding: '3px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.06em', color: HUD.gold }}
        >S −1</button>
      </div>

      {/* Obligation / Duty / Morality */}
      {(c.obligation_type || c.duty_type || c.morality_value !== undefined) && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5, borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>

          {c.obligation_type && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
              <div style={{ minWidth: 0 }}>
                <span style={statLabelSpan}>Obl </span>
                <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM }}>{c.obligation_custom_name || obligationTypes.find(o => o.key === c.obligation_type)?.name || c.obligation_type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                <button onClick={() => onAdjustObligation(c.id, -1)} style={{ background: 'rgba(224,80,80,0.10)', border: '1px solid rgba(224,80,80,0.25)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: RED, lineHeight: 1, padding: 0 }}>−</button>
                <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: (c.obligation_value || 0) > 0 ? ORANGE : DIM, minWidth: 20, textAlign: 'center' }}>{c.obligation_value || 0}</span>
                <button onClick={() => onAdjustObligation(c.id, 1)} style={{ background: 'rgba(224,120,85,0.10)', border: '1px solid rgba(224,120,85,0.25)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: ORANGE, lineHeight: 1, padding: 0 }}>+</button>
              </div>
            </div>
          )}

          {c.duty_type && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
              <div style={{ minWidth: 0 }}>
                <span style={statLabelSpan}>Duty </span>
                <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM }}>{c.duty_custom_name || dutyTypes.find(d => d.key === c.duty_type)?.name || c.duty_type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                <button onClick={() => onAdjustDuty(c.id, -1)} style={{ background: 'rgba(78,200,122,0.08)', border: '1px solid rgba(78,200,122,0.2)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: GREEN, lineHeight: 1, padding: 0 }}>−</button>
                <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: (c.duty_value || 0) > 0 ? GREEN : DIM, minWidth: 20, textAlign: 'center' }}>{c.duty_value || 0}</span>
                <button onClick={() => onAdjustDuty(c.id, 1)} style={{ background: 'rgba(78,200,122,0.08)', border: '1px solid rgba(78,200,122,0.2)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: GREEN, lineHeight: 1, padding: 0 }}>+</button>
              </div>
            </div>
          )}

          {c.morality_value !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={rowHdrMb2}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={statLabelSpan}>Morality</span>
                    {(c.force_rating ?? 0) >= 1 && c.morality_configured && (
                      <button
                        onClick={() => onMoralitySetup(c)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: BLUE, padding: 0, opacity: 0.7 }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <button onClick={() => onAdjustMorality(c.id, -1)} style={{ background: 'rgba(224,80,80,0.10)', border: '1px solid rgba(224,80,80,0.25)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: RED, lineHeight: 1, padding: 0 }}>−</button>
                    <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: (c.morality_value ?? 50) >= 50 ? BLUE : RED, minWidth: 24, textAlign: 'center' }}>{c.morality_value ?? 50}</span>
                    <button onClick={() => onAdjustMorality(c.id, 1)} style={{ background: 'rgba(90,170,224,0.10)', border: '1px solid rgba(90,170,224,0.25)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: BLUE, lineHeight: 1, padding: 0 }}>+</button>
                  </div>
                </div>
                <div style={{ height: 4, background: FAINT, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, transition: '.3s',
                    width: `${c.morality_value ?? 50}%`,
                    background: `linear-gradient(90deg, ${RED}, #4EC87A 60%, ${BLUE})`,
                  }} />
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* XP / Credits footer */}
      <div style={{ marginTop: 6, fontFamily: FR, fontSize: FS_LABEL, fontWeight: 600, textTransform: 'uppercase', color: GOLD_DIM, textAlign: 'center' }}>
        {c.xp_available} XP · {c.credits} cr
      </div>

      {/* Morality config banner — Force-sensitive, not yet configured */}
      {(c.force_rating ?? 0) >= 1 && !c.morality_configured && (
        <div style={{
          marginTop: 6, padding: '6px 10px',
          background: 'rgba(90,170,224,0.06)',
          border: '1px solid rgba(90,170,224,0.25)',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: 'rgba(90,170,224,0.7)', lineHeight: 1.4 }}>
            ⚠ Morality not yet configured
          </span>
          <button
            onClick={() => onMoralitySetup(c)}
            style={{
              background: 'rgba(90,170,224,0.12)',
              border: '1px solid rgba(90,170,224,0.35)',
              borderRadius: 4, padding: '2px 10px', cursor: 'pointer',
              fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700,
              color: BLUE, whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            Configure Now
          </button>
        </div>
      )}

      {/* Dark Side Fall / Redemption — Force-sensitive only */}
      {(c.force_rating ?? 0) >= 1 && (
        <div style={{ marginTop: 6 }}>
          {!c.is_dark_side_fallen ? (
            <button
              onClick={() => onFallenConfirm({ id: c.id, name: c.name, isFallen: false, morality: c.morality_value })}
              style={{
                width: '100%',
                background: 'rgba(139,43,226,0.06)',
                border: '1px solid rgba(139,43,226,0.4)',
                borderRadius: 8, padding: '4px 0', cursor: 'pointer',
                fontFamily: FR, fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
                fontWeight: 700, letterSpacing: '0.05em',
                color: 'rgba(139,43,226,0.8)', transition: '.15s',
              }}
            >
              ☠ Declare: Fallen to the Dark Side
            </button>
          ) : (
            <button
              onClick={() => onFallenConfirm({ id: c.id, name: c.name, isFallen: true })}
              style={{
                width: '100%',
                background: 'rgba(126,200,227,0.06)',
                border: '1px solid rgba(126,200,227,0.4)',
                borderRadius: 8, padding: '4px 0', cursor: 'pointer',
                fontFamily: FR, fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
                fontWeight: 700, letterSpacing: '0.05em',
                color: '#7EC8E3', transition: '.15s',
              }}
            >
              ✦ Grant Redemption
            </button>
          )}
        </div>
      )}

      {/* Critical Injury Actions */}
      <div style={{ marginTop: 8, borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>
        {critReqOpenFor === c.id ? (
          /* ── Existing roll request form (unchanged) ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: RED, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
              ⚡ Crit Injury Roll
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
              <span>Existing injuries</span>
              <span style={{ color: RED, fontWeight: 700 }}>+{(charActiveCritCounts[c.id] ?? 0) * 10}</span>
            </div>
            <div style={rowCritStat}>
              <span>Vicious (ranks)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => onSetCritVicious(v => Math.max(0, v - 1))} style={btnStepSm}>−</button>
                <span style={{ fontFamily: "'Share Tech Mono',monospace", color: critReqVicious > 0 ? RED : DIM, minWidth: 16, textAlign: 'center' }}>{critReqVicious}</span>
                <button onClick={() => onSetCritVicious(v => v + 1)} style={btnStepSm}>+</button>
              </div>
            </div>
            <div style={rowCritStat}>
              <span>Lethal Blows (ranks)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => onSetCritLethal(v => Math.max(0, v - 1))} style={btnStepSm}>−</button>
                <span style={{ fontFamily: "'Share Tech Mono',monospace", color: critReqLethal > 0 ? RED : DIM, minWidth: 16, textAlign: 'center' }}>{critReqLethal}</span>
                <button onClick={() => onSetCritLethal(v => v + 1)} style={btnStepSm}>+</button>
              </div>
            </div>
            <div style={rowCritStat}>
              <span>Additional mod</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => onSetCritGm(v => Math.max(0, v - 10))} style={btnStepSm}>−</button>
                <span style={{ fontFamily: "'Share Tech Mono',monospace", color: critReqGm > 0 ? RED : DIM, minWidth: 24, textAlign: 'center' }}>{critReqGm}</span>
                <button onClick={() => onSetCritGm(v => v + 10)} style={btnStepSm}>+</button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Share Tech Mono',monospace", fontSize: FS_CAPTION, color: RED, fontWeight: 700, borderTop: `1px solid rgba(220,20,60,0.15)`, paddingTop: 4 }}>
              <span>Total modifier</span>
              <span>+{(charActiveCritCounts[c.id] ?? 0) * 10 + critReqVicious * 10 + critReqLethal * 10 + critReqGm}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
              <button
                onClick={onCritClose}
                style={{ flex: 1, background: 'transparent', border: `1px solid rgba(100,100,100,0.25)`, borderRadius: 4, padding: '4px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}
              >
                Cancel
              </button>
              <button
                onClick={() => onSendCritRequest(c.id)}
                disabled={critReqBusy}
                style={{ flex: 2, background: 'rgba(220,20,60,0.12)', border: `1px solid rgba(220,20,60,0.4)`, borderRadius: 4, padding: '4px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.06em', color: RED }}
              >
                {critReqBusy ? '…' : 'Send Roll Request'}
              </button>
            </div>
          </div>
        ) : addCritOpenFor === c.id ? (
          /* ── Add Critical Injury form ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: RED, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
              ＋ Add Critical Injury
            </div>
            {/* Reference injury selector */}
            <div>
              <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Reference injury</div>
              <select
                value={addCritRefId ?? ''}
                onChange={e => { if (e.target.value) onSelectAddCritRef(Number(e.target.value)) }}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(220,20,60,0.25)`, borderRadius: 4,
                  padding: '4px 8px', color: TEXT, fontFamily: FR, fontSize: FS_CAPTION,
                  boxSizing: 'border-box',
                }}
              >
                <option value="">— select from ref table —</option>
                {refCritsDb.map(r => (
                  <option key={r.id} value={r.id}>{r.name} — {r.severity}</option>
                ))}
              </select>
            </div>
            {/* Severity badge (read-only, from ref) */}
            {addCritSeverity && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Severity</span>
                <span style={{ background: 'rgba(220,20,60,0.15)', border: `1px solid rgba(220,20,60,0.35)`, borderRadius: 3, padding: '2px 6px', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: RED }}>
                  {addCritSeverity}
                </span>
              </div>
            )}
            {/* Editable name */}
            <div>
              <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Injury name</div>
              <input
                value={addCritName}
                onChange={e => onSetAddCritName(e.target.value)}
                placeholder="e.g. Crippled Arm"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(220,20,60,0.25)`, borderRadius: 4,
                  padding: '4px 8px', color: TEXT, fontFamily: FR, fontSize: FS_CAPTION,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {/* Editable description */}
            <div>
              <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Description</div>
              <textarea
                value={addCritDesc}
                onChange={e => onSetAddCritDesc(e.target.value)}
                placeholder="What does this injury entail?"
                rows={3}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(220,20,60,0.25)`, borderRadius: 4,
                  padding: '4px 8px', color: TEXT, fontFamily: FR, fontSize: FS_CAPTION,
                  boxSizing: 'border-box', resize: 'vertical',
                }}
              />
            </div>
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
              <button
                onClick={onAddCritClose}
                style={{ flex: 1, background: 'transparent', border: `1px solid rgba(100,100,100,0.25)`, borderRadius: 4, padding: '4px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}
              >
                Cancel
              </button>
              <button
                onClick={() => { void onAddCritApply(c.id) }}
                disabled={!addCritName.trim() || addCritBusy}
                style={{
                  flex: 2, background: 'rgba(220,20,60,0.12)', border: `1px solid rgba(220,20,60,0.4)`,
                  borderRadius: 4, padding: '4px 0', cursor: !addCritName.trim() || addCritBusy ? 'not-allowed' : 'pointer',
                  fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.06em',
                  color: RED, opacity: !addCritName.trim() || addCritBusy ? 0.4 : 1,
                }}
              >
                {addCritBusy ? '…' : '✓ Apply Injury'}
              </button>
            </div>
          </div>
        ) : (
          /* ── Default: two-button row ── */
          <div style={{ display: 'flex', gap: 5 }}>
            <button
              onClick={() => onCritOpen(c.id)}
              style={{
                flex: 1,
                background: 'rgba(220,20,60,0.06)',
                border: `1px solid rgba(220,20,60,0.4)`,
                borderRadius: 8, padding: '5px 0', cursor: 'pointer',
                fontFamily: FR, fontSize: FS_CAPTION,
                fontWeight: 700, letterSpacing: '0.06em',
                color: RED,
              }}
            >
              ⚡ Crit Roll
            </button>
            <button
              onClick={() => onAddCritOpen(c.id)}
              style={{
                flex: 1,
                background: 'rgba(220,20,60,0.06)',
                border: `1px solid rgba(220,20,60,0.4)`,
                borderRadius: 8, padding: '5px 0', cursor: 'pointer',
                fontFamily: FR, fontSize: FS_CAPTION,
                fontWeight: 700, letterSpacing: '0.06em',
                color: RED,
              }}
            >
              ＋ Add Injury
            </button>
          </div>
        )}
      </div>

      {/* Archive button */}
      <div style={{ marginTop: 8, borderTop: `1px solid ${BORDER}`, paddingTop: 6 }}>
        <button
          onClick={() => onArchiveConfirm({ id: c.id, name: c.name })}
          style={{
            ...btnSmall,
            width: '100%', background: 'transparent',
            border: `1px solid rgba(100,100,100,0.25)`,
            borderRadius: 3, padding: '3px 0',
            fontFamily: FR, fontSize: FS_OVERLINE,
            fontWeight: 700, letterSpacing: '0.06em',
            color: 'rgba(150,150,150,0.55)',
            textTransform: 'uppercase',
          }}
        >
          Archive
        </button>
      </div>
    </div>
  )
}
