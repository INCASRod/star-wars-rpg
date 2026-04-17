'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { InitiativeSlot } from '@/lib/combat'
import { resolveWeapon, type WeaponRef } from '@/lib/resolve-weapon'
import { FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4 } from '@/components/player-hud/design-tokens'

// ── Design tokens (mirrored from CombatTracker) ──
const PANEL_BG   = 'rgba(8,16,10,0.88)'
const RAISED_BG  = 'rgba(14,26,18,0.9)'
const GOLD       = '#C8AA50'
const BORDER     = 'rgba(200,170,80,0.18)'
const BORDER_MD  = 'rgba(200,170,80,0.32)'
const CHAR_BR    = '#e05252'
const CHAR_AG    = '#52a8e0'
const CHAR_CUN   = '#e0a852'
const CHAR_INT   = '#a852e0'
const CHAR_WIL   = '#52e0a8'
const CHAR_PR    = '#e05298'
const TEXT       = '#E8DFC8'
const TEXT_SEC   = 'rgba(232,223,200,0.6)'
const TEXT_MUTED = 'rgba(232,223,200,0.35)'
const TEXTGR     = '#72B421'
const FC         = "'Rajdhani', sans-serif"
const FR         = "'Rajdhani', sans-serif"
const FM         = "'Rajdhani', sans-serif"

void RAISED_BG; void TEXT_SEC; void FR

const CHAR_COLORS      = [CHAR_BR, CHAR_AG, CHAR_INT, CHAR_CUN, CHAR_WIL, CHAR_PR]
const CHAR_KEYS        = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const
const CHAR_ABBR_LABELS = ['BR', 'AG', 'INT', 'CUN', 'WIL', 'PR']
const TALENT_COLORS: Record<string, string> = {
  passive: TEXT_MUTED, incidental: GOLD, maneuver: CHAR_AG,
  action: CHAR_BR, 'out of turn': CHAR_WIL,
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    minion: TEXT_MUTED, rival: GOLD, nemesis: CHAR_BR, pc: CHAR_AG, npc: CHAR_BR,
  }
  const color = colors[type] ?? TEXT_MUTED
  return (
    <span style={{
      fontFamily: FM, fontSize: FS_LABEL, color,
      border: `1px solid ${color}50`, borderRadius: 2,
      padding: '1px 5px', background: `${color}15`,
    }}>
      {type.toUpperCase()}
    </span>
  )
}

interface Props {
  revealedAdversaries: AdversaryInstance[]
  currentSlot:         InitiativeSlot | undefined
  initiativeSlots:     InitiativeSlot[]
  cardCollapsed:       Record<string, boolean>
  setCardCollapsed:    Dispatch<SetStateAction<Record<string, boolean>>>
  weaponRef:           Record<string, WeaponRef>
}

export function AdversaryCardList({
  revealedAdversaries,
  currentSlot,
  initiativeSlots,
  cardCollapsed,
  setCardCollapsed,
  weaponRef,
}: Props) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}b3`, flex: 1 }}>
          Adversaries
        </div>
        {revealedAdversaries.length > 0 && (() => {
          const anyExpanded = revealedAdversaries.some(a =>
            currentSlot?.adversaryInstanceId !== a.instanceId && !cardCollapsed[a.instanceId]
          )
          return (
            <button
              onClick={() => setCardCollapsed(
                anyExpanded
                  ? Object.fromEntries(revealedAdversaries.map(a => [a.instanceId, true]))
                  : {}
              )}
              style={{
                height: 28, borderRadius: 5, padding: '0 10px',
                fontFamily: "'Share Tech Mono', 'Courier New', monospace",
                fontSize: 'clamp(0.6rem, 0.92vw, 0.72rem)',
                textTransform: 'uppercase',
                background: 'transparent',
                border: '1px solid rgba(200,170,80,0.25)',
                color: 'rgba(200,170,80,0.5)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(200,170,80,0.6)'
                el.style.color = 'rgba(200,170,80,0.6)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(200,170,80,0.25)'
                el.style.color = 'rgba(200,170,80,0.5)'
              }}
            >
              {anyExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          )
        })()}
      </div>

      {revealedAdversaries.length === 0 && (
        <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: TEXT_MUTED, fontStyle: 'italic' }}>
          No adversaries revealed yet
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {revealedAdversaries.map(adv => {
          const isActiveTurn = currentSlot?.adversaryInstanceId === adv.instanceId
          const isExpanded   = isActiveTurn || !cardCollapsed[adv.instanceId]
          const advSlot      = initiativeSlots.find(s => s.adversaryInstanceId === adv.instanceId)
          const alignment    = advSlot?.alignment ?? 'enemy'
          const advColor     = alignment === 'allied_npc' ? '#4CAF50' : CHAR_BR

          // Inline wound display for collapsed header
          const woundsCur = adv.woundsCurrent ?? 0
          const woundsMax = adv.type === 'minion'
            ? adv.woundThreshold * adv.groupSize
            : adv.woundThreshold
          const strainCur = adv.strainCurrent ?? 0
          const strainMax = adv.strainThreshold ?? 0

          return (
            <div key={adv.instanceId} style={{
              background: PANEL_BG,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 6,
              position: 'relative',
              borderTop: `2px solid ${advColor}80`,
              borderRight: `1px solid ${isActiveTurn ? 'rgba(200,170,80,0.3)' : BORDER}`,
              borderBottom: `1px solid ${isActiveTurn ? 'rgba(200,170,80,0.3)' : BORDER}`,
              borderLeft: `3px solid ${advColor}`,
              overflow: 'hidden',
              animation: isActiveTurn ? 'activeTurnPulse 2s ease-in-out infinite' : 'none',
              minHeight: 44,
            }}>
              {/* Collapsed header — always visible, click to expand/collapse */}
              <div
                onClick={() => { if (!isActiveTurn) setCardCollapsed(prev => ({ ...prev, [adv.instanceId]: !prev[adv.instanceId] })) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px',
                  cursor: isActiveTurn ? 'default' : 'pointer',
                  minHeight: 44,
                }}
              >
                <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: advColor, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {adv.name}
                </span>
                {/* Wound inline */}
                <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_LABEL, color: 'rgba(232,223,200,0.8)', flexShrink: 0 }}>
                  ❤ {woundsCur}/{woundsMax}
                </span>
                {/* Strain inline — nemesis only */}
                {adv.type === 'nemesis' && strainMax > 0 && (
                  <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_LABEL, color: 'rgba(232,223,200,0.6)', flexShrink: 0 }}>
                    🧠 {strainCur}/{strainMax}
                  </span>
                )}
                {/* Minion count inline */}
                {adv.type === 'minion' && (
                  <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_LABEL, color: CHAR_BR, flexShrink: 0 }}>
                    👤 {adv.groupRemaining}
                  </span>
                )}
                <span style={{ color: 'rgba(232,223,200,0.35)', fontSize: FS_LABEL, flexShrink: 0, transition: 'transform 200ms' }}>
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>

              {/* Expanded content */}
              <div style={{
                maxHeight: isExpanded ? '2000px' : 0,
                overflow: 'hidden',
                transition: 'max-height 250ms ease-out',
                padding: isExpanded ? '0 14px 12px' : '0 14px',
                borderTop: isExpanded ? `1px solid ${BORDER}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{adv.name}</span>
                  <TypeBadge type={adv.type} />
                  {adv.type === 'minion' && (
                    <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: CHAR_BR }}>{adv.groupRemaining}/{adv.groupSize}</span>
                  )}
                </div>

                {/* Stats row: characteristic boxes | divider | derived stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'nowrap' }}>

                  {/* Characteristic boxes */}
                  <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                    {CHAR_KEYS.map((key, i) => (
                      <div key={key} style={{
                        background: `${CHAR_COLORS[i]}12`,
                        border: `1px solid ${CHAR_COLORS[i]}35`,
                        borderRadius: 3, padding: '3px 5px', textAlign: 'center', minWidth: 30,
                      }}>
                        <div style={{ fontFamily: FM, fontSize: FS_H4, fontWeight: 700, color: CHAR_COLORS[i], lineHeight: 1 }}>
                          {adv.characteristics[key]}
                        </div>
                        <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginTop: 1 }}>{CHAR_ABBR_LABELS[i]}</div>
                      </div>
                    ))}
                  </div>

                  {/* Vertical divider */}
                  <div style={{ width: 1, height: 38, background: BORDER_MD, flexShrink: 0 }} />

                  {/* Derived stats — single inline row */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                    {[
                      { label: 'SOAK',  value: adv.soak,           color: CHAR_WIL },
                      { label: 'M.DEF', value: adv.defense.melee,  color: CHAR_CUN },
                      { label: 'R.DEF', value: adv.defense.ranged, color: CHAR_INT },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED }}>{s.label}</div>
                      </div>
                    ))}
                    {/* Wounds — current/threshold for rival/nemesis */}
                    {adv.type !== 'minion' && (() => {
                      const cur = adv.woundsCurrent ?? 0
                      const max = adv.woundThreshold
                      const dead = cur >= max
                      const crit = cur > 0 && cur >= max * 0.75
                      const woundColor = dead ? CHAR_BR : crit ? CHAR_CUN : CHAR_BR
                      return (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, lineHeight: 1, color: dead ? CHAR_BR : TEXT }}>
                            <span style={{ color: dead ? CHAR_BR : crit ? CHAR_CUN : TEXT }}>{cur}</span>
                            <span style={{ color: TEXT_MUTED, fontSize: FS_LABEL }}>/</span>
                            <span style={{ color: woundColor }}>{max}</span>
                          </div>
                          <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: dead ? CHAR_BR : TEXT_MUTED }}>
                            {dead ? '☠ KILLED' : 'WOUNDS'}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Wound bar — rival/nemesis */}
                {adv.type !== 'minion' && (() => {
                  const cur = adv.woundsCurrent ?? 0
                  const max = adv.woundThreshold
                  const pct = max > 0 ? Math.min(1, cur / max) : 0
                  const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_BR
                  return (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct * 100}%`, height: '100%', background: barColor,
                          borderRadius: 3, transition: 'width 300ms ease',
                          animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
                        }} />
                      </div>
                      <div style={{
                        fontFamily: "'Share Tech Mono','Courier New',monospace",
                        fontSize: 'clamp(0.62rem,0.9vw,0.72rem)', color: 'rgba(232,223,200,0.4)',
                        textAlign: 'right', marginTop: 2,
                      }}>
                        {cur} / {max} wounds
                      </div>
                    </div>
                  )
                })()}

                {/* Wound bar — minion group */}
                {adv.type === 'minion' && (() => {
                  const cur          = adv.woundsCurrent ?? 0
                  const groupAlive   = adv.groupRemaining
                  const groupInitial = adv.groupSize
                  const minionWoundTotal = adv.woundThreshold * groupAlive
                  const pct = groupAlive === 0 ? 1 : (minionWoundTotal > 0 ? Math.min(1, cur / minionWoundTotal) : 0)
                  const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_BR
                  const skillRank = Math.max(0, groupAlive - 1)
                  return (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct * 100}%`, height: '100%', background: barColor,
                          borderRadius: 3, transition: 'width 300ms ease',
                          animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
                        }} />
                      </div>
                      <div style={{
                        fontFamily: "'Share Tech Mono','Courier New',monospace",
                        fontSize: 'clamp(0.62rem,0.9vw,0.72rem)', color: 'rgba(232,223,200,0.4)',
                        textAlign: 'right', marginTop: 2,
                      }}>
                        {cur} / {minionWoundTotal} wounds
                      </div>
                      <div style={{
                        fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED,
                        marginTop: 3, display: 'flex', gap: 10,
                      }}>
                        <span>
                          <span style={{ color: groupAlive === 0 ? CHAR_BR : TEXT_SEC }}>{groupAlive}</span>
                          {' remaining (of '}{groupInitial}{')'}
                        </span>
                        <span style={{ color: TEXT_MUTED }}>· Skill rank: {skillRank}</span>
                      </div>
                    </div>
                  )
                })()}

                {/* Talent chips */}
                {adv.talents && adv.talents.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {adv.talents.map((t, i) => {
                      const color = TALENT_COLORS[(t.activation ?? 'passive').toLowerCase()] ?? TEXT_MUTED
                      return (
                        <span key={i} style={{ fontFamily: FM, fontSize: FS_LABEL, color, background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 3, padding: '2px 6px' }} title={t.description}>
                          {t.name}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Weapons */}
                {adv.weapons && adv.weapons.length > 0 && (
                  <div>
                    {adv.weapons.map((w, i) => {
                      const { dmg, range, crit } = resolveWeapon(w, adv.characteristics.brawn, weaponRef)
                      const quals = w.qualities?.length ? ` — ${w.qualities.join(', ')}` : ''
                      return (
                        <div key={i} style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXTGR }}>
                          {w.name} — DMG {dmg}{crit !== undefined ? ` — Crit ${crit}` : ''} — {range}{quals}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
