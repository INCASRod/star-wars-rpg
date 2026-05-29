'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { VehicleInstance } from '@/lib/vehicles'
import { vehicleWeaponDisplayName, vehicleWeaponStats } from '@/lib/vehicles'
import type { InitiativeSlot } from '@/lib/combat'
import { FONT_BODY, FS, RADIUS, EASE, COLOR, CHAR_COLOR } from '@/lib/tokens'

// ── Design tokens ──
const PANEL_BG   = 'var(--hud-surface-lo)'
const BORDER     = 'var(--hud-border)'
const BORDER_MD  = 'var(--hud-border-hi)'
const TEXT       = 'var(--hud-text)'
const TEXT_MUTED = 'var(--hud-text-faint)'

// Characteristic colors — use CHAR_COLOR from tokens
const CHAR_AG  = CHAR_COLOR.agility
const CHAR_BR  = CHAR_COLOR.brawn
const CHAR_CUN = CHAR_COLOR.cunning
const CHAR_WIL = CHAR_COLOR.willpower


function VehicleBadge() {
  return (
    <span style={{
      fontFamily: FONT_BODY, fontSize: FS.label, color: CHAR_AG,
      border: `1px solid ${CHAR_AG}50`, borderRadius: RADIUS.sm,
      padding: `1px 0.3125rem`, background: `${CHAR_AG}15`,
    }}>
      VEHICLE
    </span>
  )
}

interface Props {
  vehicles:         VehicleInstance[]
  currentSlot:      InitiativeSlot | undefined
  initiativeSlots:  InitiativeSlot[]
  cardCollapsed:    Record<string, boolean>
  setCardCollapsed: Dispatch<SetStateAction<Record<string, boolean>>>
  /** Called when GM clicks +/− on hull trauma. delta = +1 or -1. */
  onAdjustHullTrauma?:   (instanceId: string, delta: number) => void
  /** Called when GM clicks +/− on system strain. delta = +1 or -1. */
  onAdjustSystemStrain?: (instanceId: string, delta: number) => void
}

export function VehicleCardList({
  vehicles,
  currentSlot,
  initiativeSlots,
  cardCollapsed,
  setCardCollapsed,
  onAdjustHullTrauma,
  onAdjustSystemStrain,
}: Props) {
  if (vehicles.length === 0) return null

  return (
    <div style={{ padding: `0 1rem 0.875rem` }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.625rem', marginTop: '0.875rem' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${CHAR_AG}b3`, flex: 1 }}>
          Vehicles
        </div>
        {vehicles.length > 0 && (() => {
          const anyExpanded = vehicles.some(v =>
            currentSlot?.vehicleInstanceId !== v.instanceId && !cardCollapsed[v.instanceId]
          )
          return (
            <button
              onClick={() => setCardCollapsed(
                anyExpanded
                  ? Object.fromEntries(vehicles.map(v => [v.instanceId, true]))
                  : Object.fromEntries(vehicles.map(v => [v.instanceId, false]))
              )}
              className="hov-ag hov-ag-base"
              style={{
                height: '1.75rem', borderRadius: RADIUS.md, padding: `0 0.625rem`,
                fontFamily: FONT_BODY,
                fontSize: 'clamp(0.6rem, 0.92vw, 0.72rem)',
                textTransform: 'uppercase',
                background: 'transparent',
                border: '1px solid',
                cursor: 'pointer',
              }}
            >
              {anyExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          )
        })()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {vehicles.map(v => {
          const isActiveTurn = currentSlot?.vehicleInstanceId === v.instanceId
          const isExpanded   = isActiveTurn || !cardCollapsed[v.instanceId]
          const vSlot        = initiativeSlots.find(s => s.vehicleInstanceId === v.instanceId)
          const alignment    = vSlot?.alignment ?? v.alignment ?? 'enemy'
          const vColor       = alignment === 'allied_npc' ? COLOR.green : CHAR_BR

          const htCur  = v.hullTraumaCurrent
          const htMax  = v.hullTraumaThreshold
          const ssCur  = v.systemStrainCurrent
          const ssMax  = v.systemStrainThreshold

          return (
            <div key={v.instanceId} style={{
              background: PANEL_BG,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: RADIUS.lg,
              position: 'relative',
              borderTop: `2px solid ${vColor}80`,
              borderRight: `1px solid ${isActiveTurn ? 'var(--hud-border-hi)' : BORDER}`,
              borderBottom: `1px solid ${isActiveTurn ? 'var(--hud-border-hi)' : BORDER}`,
              borderLeft: `3px solid ${vColor}`,
              overflow: 'hidden',
              animation: isActiveTurn ? 'activeTurnPulse 2s ease-in-out infinite' : 'none',
              minHeight: '2.75rem',
            }}>
              {/* Collapsed header */}
              <div
                onClick={() => { if (!isActiveTurn) setCardCollapsed(prev => ({ ...prev, [v.instanceId]: !prev[v.instanceId] })) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: `0.625rem 0.875rem`,
                  cursor: isActiveTurn ? 'default' : 'pointer',
                  minHeight: '2.75rem',
                }}
              >
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: vColor, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {v.name}
                </span>
                {/* Hull trauma inline */}
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text)', flexShrink: 0 }}>
                  🛡 {htCur}/{htMax}
                </span>
                {/* System strain inline */}
                {ssMax > 0 && (
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-dim)', flexShrink: 0 }}>
                    ⚡ {ssCur}/{ssMax}
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
                {/* Name + badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: TEXT }}>{v.name}</span>
                  <VehicleBadge />
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'SIL',   value: v.silhouette,  color: CHAR_AG  },
                    { label: 'SPD',   value: v.speed,       color: CHAR_AG  },
                    { label: 'HDL',   value: v.handling >= 0 ? `+${v.handling}` : `${v.handling}`, color: CHAR_WIL },
                    { label: 'ARMOR', value: v.armor,       color: CHAR_WIL },
                    { label: 'F.DEF', value: v.defense.fore,      color: CHAR_CUN },
                    { label: 'A.DEF', value: v.defense.aft,       color: CHAR_CUN },
                    { label: 'P.DEF', value: v.defense.port,      color: CHAR_CUN },
                    { label: 'S.DEF', value: v.defense.starboard, color: CHAR_CUN },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUTED }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: BORDER_MD, marginBottom: '0.625rem' }} />

                {/* Hull trauma bar + controls */}
                {(() => {
                  const pct = htMax > 0 ? Math.min(1, htCur / htMax) : 0
                  // Bar threshold colors: critical=purple(#9C27B0), danger=red(#f44336), warning=amber(#FF9800)
                  const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_BR
                  return (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: TEXT_MUTED, flex: 1 }}>
                          Hull Trauma
                          <span style={{ fontFamily: FONT_BODY, color: pct >= 1 ? CHAR_BR : TEXT, marginLeft: '0.375rem' }}>
                            {htCur}/{htMax}
                          </span>
                          {pct >= 1 && <span style={{ color: CHAR_BR, marginLeft: '0.375rem' }}>☠ DISABLED</span>}
                        </span>
                        {onAdjustHullTrauma && (
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              onClick={() => onAdjustHullTrauma(v.instanceId, -1)}
                              style={{ width: '1.25rem', height: '1.25rem', borderRadius: RADIUS.sm, cursor: 'pointer', background: 'transparent', border: `1px solid ${BORDER_MD}`, fontFamily: FONT_BODY, fontSize: FS.sm, color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                            >−</button>
                            <button
                              onClick={() => onAdjustHullTrauma(v.instanceId, 1)}
                              style={{ width: '1.25rem', height: '1.25rem', borderRadius: RADIUS.sm, cursor: 'pointer', background: `${CHAR_BR}18`, border: `1px solid ${BORDER_MD}`, fontFamily: FONT_BODY, fontSize: FS.sm, color: CHAR_BR, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                            >+</button>
                          </div>
                        )}
                      </div>
                      <div style={{ height: '0.3125rem', background: 'var(--hud-border)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct * 100}%`, height: '100%', background: barColor,
                          borderRadius: RADIUS.sm, transition: `width 300ms ease`,
                          animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
                        }} />
                      </div>
                    </div>
                  )
                })()}

                {/* System strain bar + controls */}
                {ssMax > 0 && (() => {
                  const pct = Math.min(1, ssCur / ssMax)
                  // Bar threshold colors: critical=purple(#9C27B0), danger=red(#f44336), warning=amber(#FF9800)
                  const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_WIL
                  return (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: TEXT_MUTED, flex: 1 }}>
                          System Strain
                          <span style={{ fontFamily: FONT_BODY, color: pct >= 1 ? CHAR_BR : TEXT, marginLeft: '0.375rem' }}>
                            {ssCur}/{ssMax}
                          </span>
                          {pct >= 1 && <span style={{ color: CHAR_BR, marginLeft: '0.375rem' }}>⚠ STRAINED</span>}
                        </span>
                        {onAdjustSystemStrain && (
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              onClick={() => onAdjustSystemStrain(v.instanceId, -1)}
                              style={{ width: '1.25rem', height: '1.25rem', borderRadius: RADIUS.sm, cursor: 'pointer', background: 'transparent', border: `1px solid ${BORDER_MD}`, fontFamily: FONT_BODY, fontSize: FS.sm, color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                            >−</button>
                            <button
                              onClick={() => onAdjustSystemStrain(v.instanceId, 1)}
                              style={{ width: '1.25rem', height: '1.25rem', borderRadius: RADIUS.sm, cursor: 'pointer', background: `${CHAR_WIL}18`, border: `1px solid ${BORDER_MD}`, fontFamily: FONT_BODY, fontSize: FS.sm, color: CHAR_WIL, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                            >+</button>
                          </div>
                        )}
                      </div>
                      <div style={{ height: '0.3125rem', background: 'var(--hud-border)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct * 100}%`, height: '100%', background: barColor,
                          borderRadius: RADIUS.sm, transition: `width 300ms ease`,
                        }} />
                      </div>
                    </div>
                  )
                })()}

                {/* Weapons */}
                {v.weapons && v.weapons.length > 0 && (
                  <div style={{ marginTop: '0.375rem' }}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Weapons</div>
                    {v.weapons.map((w, i) => {
                      const displayName = vehicleWeaponDisplayName(w.weaponKey)
                      const stats       = vehicleWeaponStats(w.weaponKey)
                      const count  = w.count > 1 ? `${w.count}× ` : ''
                      const turret = w.turret ? ' (Turret)' : ''
                      const dmgStr = stats ? ` — DMG ${stats.damage} — ${stats.range}${stats.crit ? ` — Crit ${stats.crit}` : ''}` : ''
                      return (
                        <div key={i} style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: COLOR.green, marginBottom: 2 }}>
                          {count}{displayName}{turret}{dmgStr}
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
