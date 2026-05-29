'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { InitiativeSlot } from '@/lib/combat'
import { resolveWeapon, type WeaponRef } from '@/lib/resolve-weapon'
import { HUD, FONT_BODY, FS, RADIUS, EASE, COLOR, CHAR_COLOR } from '@/lib/tokens'

// ── Design tokens ──
const PANEL_BG   = 'var(--hud-surface-lo)'
const BORDER     = 'var(--hud-border)'
const BORDER_MD  = 'var(--hud-border-hi)'
const TEXT       = 'var(--hud-text)'
const TEXT_SEC   = 'var(--hud-text-dim)'
const TEXT_MUTED = 'var(--hud-text-faint)'


// Characteristic colors — use CHAR_COLOR from tokens
const CHAR_BR  = CHAR_COLOR.brawn
const CHAR_AG  = CHAR_COLOR.agility
const CHAR_CUN = CHAR_COLOR.cunning
const CHAR_INT = CHAR_COLOR.intellect
const CHAR_WIL = CHAR_COLOR.willpower
const CHAR_PR  = CHAR_COLOR.presence

const CHAR_COLORS      = [CHAR_BR, CHAR_AG, CHAR_INT, CHAR_CUN, CHAR_WIL, CHAR_PR]
const CHAR_KEYS        = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const
const CHAR_ABBR_LABELS = ['BR', 'AG', 'INT', 'CUN', 'WIL', 'PR']
const TALENT_COLORS: Record<string, string> = {
  passive: TEXT_MUTED, incidental: HUD.gold, maneuver: CHAR_AG,
  action: CHAR_BR, 'out of turn': CHAR_WIL,
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    minion: TEXT_MUTED, rival: HUD.gold, nemesis: CHAR_BR, pc: CHAR_AG, npc: CHAR_BR,
  }
  const color = colors[type] ?? TEXT_MUTED
  return (
    <span style={{
      fontFamily: FONT_BODY, fontSize: FS.label, color,
      border: `1px solid ${color}50`, borderRadius: RADIUS.sm,
      padding: `1px 0.3125rem`, background: `${color}15`,
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
    <div style={{ flex: 1, overflowY: 'auto', padding: `0.875rem 1rem` }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.625rem' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: `color-mix(in srgb, ${HUD.gold} 70%, transparent)`, flex: 1 }}>
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
              className="hov-gold"
              style={{
                height: '1.75rem', borderRadius: RADIUS.md, padding: `0 0.625rem`,
                fontFamily: FONT_BODY,
                fontSize: 'clamp(0.6rem, 0.92vw, 0.72rem)',
                textTransform: 'uppercase',
                background: 'transparent',
                border: '1px solid var(--hud-border)',
                color: 'var(--hud-text-faint)',
                cursor: 'pointer',
              }}
            >
              {anyExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          )
        })()}
      </div>

      {revealedAdversaries.length === 0 && (
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: TEXT_MUTED, fontStyle: 'italic' }}>
          No adversaries revealed yet
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {revealedAdversaries.map(adv => {
          const isActiveTurn = currentSlot?.adversaryInstanceId === adv.instanceId
          const isExpanded   = isActiveTurn || !cardCollapsed[adv.instanceId]
          const advSlot      = initiativeSlots.find(s => s.adversaryInstanceId === adv.instanceId)
          const alignment    = advSlot?.alignment ?? 'enemy'
          const advColor     = alignment === 'allied_npc' ? COLOR.green : CHAR_BR

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
              borderRadius: RADIUS.lg,
              position: 'relative',
              borderTop: `2px solid ${advColor}80`,
              borderRight: `1px solid ${isActiveTurn ? 'var(--hud-border-hi)' : BORDER}`,
              borderBottom: `1px solid ${isActiveTurn ? 'var(--hud-border-hi)' : BORDER}`,
              borderLeft: `3px solid ${advColor}`,
              overflow: 'hidden',
              animation: isActiveTurn ? 'activeTurnPulse 2s ease-in-out infinite' : 'none',
              minHeight: '2.75rem',
            }}>
              {/* Collapsed header — always visible, click to expand/collapse */}
              <div
                onClick={() => { if (!isActiveTurn) setCardCollapsed(prev => ({ ...prev, [adv.instanceId]: !prev[adv.instanceId] })) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: `0.625rem 0.875rem`,
                  cursor: isActiveTurn ? 'default' : 'pointer',
                  minHeight: '2.75rem',
                }}
              >
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: advColor, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {adv.name}
                </span>
                {/* Wound inline */}
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text)', flexShrink: 0 }}>
                  ❤ {woundsCur}/{woundsMax}
                </span>
                {/* Strain inline — nemesis only */}
                {adv.type === 'nemesis' && strainMax > 0 && (
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-dim)', flexShrink: 0 }}>
                    🧠 {strainCur}/{strainMax}
                  </span>
                )}
                {/* Minion count inline */}
                {adv.type === 'minion' && (
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: CHAR_BR, flexShrink: 0 }}>
                    👤 {adv.groupRemaining}
                  </span>
                )}
                <span style={{ color: 'var(--hud-text-faint)', fontSize: FS.label, flexShrink: 0, transition: `transform ${EASE.default}` }}>
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>

              {/* Expanded content */}
              <div style={{
                maxHeight: isExpanded ? '2000px' : 0,
                overflow: 'hidden',
                transition: `max-height 250ms ease-out`,
                padding: isExpanded ? `0 0.875rem 0.75rem` : `0 0.875rem`,
                borderTop: isExpanded ? `1px solid ${BORDER}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: TEXT }}>{adv.name}</span>
                  <TypeBadge type={adv.type} />
                  {adv.type === 'minion' && (
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: CHAR_BR }}>{adv.groupRemaining}/{adv.groupSize}</span>
                  )}
                </div>

                {/* Stats row: characteristic boxes | divider | derived stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', flexWrap: 'nowrap' }}>

                  {/* Characteristic boxes */}
                  <div style={{ display: 'flex', gap: '0.1875rem', flexShrink: 0 }}>
                    {CHAR_KEYS.map((key, i) => (
                      <div key={key} style={{
                        background: `${CHAR_COLORS[i]}12`,
                        border: `1px solid ${CHAR_COLORS[i]}35`,
                        borderRadius: RADIUS.sm, padding: `0.1875rem 0.3125rem`, textAlign: 'center', minWidth: '1.875rem',
                      }}>
                        <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 700, color: CHAR_COLORS[i], lineHeight: 1 }}>
                          {adv.characteristics[key]}
                        </div>
                        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUTED, marginTop: 1 }}>{CHAR_ABBR_LABELS[i]}</div>
                      </div>
                    ))}
                  </div>

                  {/* Vertical divider */}
                  <div style={{ width: 1, height: '2.375rem', background: BORDER_MD, flexShrink: 0 }} />

                  {/* Derived stats — single inline row */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
                    {[
                      { label: 'SOAK',  value: adv.soak,           color: CHAR_WIL },
                      { label: 'M.DEF', value: adv.defense.melee,  color: CHAR_CUN },
                      { label: 'R.DEF', value: adv.defense.ranged, color: CHAR_INT },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: TEXT_MUTED }}>{s.label}</div>
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
                          <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 700, lineHeight: 1, color: dead ? CHAR_BR : TEXT }}>
                            <span style={{ color: dead ? CHAR_BR : crit ? CHAR_CUN : TEXT }}>{cur}</span>
                            <span style={{ color: TEXT_MUTED, fontSize: FS.label }}>/</span>
                            <span style={{ color: woundColor }}>{max}</span>
                          </div>
                          <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: dead ? CHAR_BR : TEXT_MUTED }}>
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
                  // Bar threshold colors: critical=purple(#9C27B0), danger=red(#f44336), warning=amber(#FF9800)
                  const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_BR
                  return (
                    <div style={{ marginBottom: '0.625rem' }}>
                      <div style={{ height: '0.3125rem', background: 'var(--hud-border)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct * 100}%`, height: '100%', background: barColor,
                          borderRadius: RADIUS.sm, transition: `width 300ms ease`,
                          animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
                        }} />
                      </div>
                      <div style={{
                        fontFamily: FONT_BODY,
                        fontSize: 'clamp(0.62rem,0.9vw,0.72rem)', color: 'var(--hud-text-faint)',
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
                  // Bar threshold colors: critical=purple(#9C27B0), danger=red(#f44336), warning=amber(#FF9800)
                  const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_BR
                  const skillRank = Math.max(0, groupAlive - 1)
                  return (
                    <div style={{ marginBottom: '0.625rem' }}>
                      <div style={{ height: '0.3125rem', background: 'var(--hud-border)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct * 100}%`, height: '100%', background: barColor,
                          borderRadius: RADIUS.sm, transition: `width 300ms ease`,
                          animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
                        }} />
                      </div>
                      <div style={{
                        fontFamily: FONT_BODY,
                        fontSize: 'clamp(0.62rem,0.9vw,0.72rem)', color: 'var(--hud-text-faint)',
                        textAlign: 'right', marginTop: 2,
                      }}>
                        {cur} / {minionWoundTotal} wounds
                      </div>
                      <div style={{
                        fontFamily: FONT_BODY, fontSize: FS.label, color: TEXT_MUTED,
                        marginTop: '0.1875rem', display: 'flex', gap: '0.625rem',
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
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    {adv.talents.map((t, i) => {
                      const color = TALENT_COLORS[(t.activation ?? 'passive').toLowerCase()] ?? TEXT_MUTED
                      return (
                        <span key={i} style={{ fontFamily: FONT_BODY, fontSize: FS.label, color, background: `${color}15`, border: `1px solid ${color}40`, borderRadius: RADIUS.sm, padding: `2px 0.375rem` }} title={t.description}>
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
                        <div key={i} style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: COLOR.green }}>
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
