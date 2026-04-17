'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { VehicleInstance } from '@/lib/vehicles'
import { vehicleWeaponDisplayName, vehicleWeaponStats } from '@/lib/vehicles'
import type { InitiativeSlot } from '@/lib/combat'
import { FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4 } from '@/components/player-hud/design-tokens'

// ── Design tokens (mirrored from AdversaryCardList) ──
const PANEL_BG   = 'rgba(8,16,10,0.88)'
const GOLD       = '#C8AA50'
const BORDER     = 'rgba(200,170,80,0.18)'
const BORDER_MD  = 'rgba(200,170,80,0.32)'
const CHAR_AG    = '#52a8e0'
const CHAR_BR    = '#e05252'
const CHAR_CUN   = '#e0a852'
const CHAR_INT   = '#a852e0'
const CHAR_WIL   = '#52e0a8'
const TEXT       = '#E8DFC8'
const TEXT_MUTED = 'rgba(232,223,200,0.35)'
const FC         = "'Rajdhani', sans-serif"
const FM         = "'Rajdhani', sans-serif"

void CHAR_INT; void CHAR_CUN

function VehicleBadge() {
  return (
    <span style={{
      fontFamily: FM, fontSize: FS_LABEL, color: CHAR_AG,
      border: `1px solid ${CHAR_AG}50`, borderRadius: 2,
      padding: '1px 5px', background: `${CHAR_AG}15`,
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
    <div style={{ padding: '0 16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, marginTop: 14 }}>
        <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${CHAR_AG}b3`, flex: 1 }}>
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
              style={{
                height: 28, borderRadius: 5, padding: '0 10px',
                fontFamily: "'Share Tech Mono', 'Courier New', monospace",
                fontSize: 'clamp(0.6rem, 0.92vw, 0.72rem)',
                textTransform: 'uppercase',
                background: 'transparent',
                border: '1px solid rgba(82,168,224,0.25)',
                color: 'rgba(82,168,224,0.5)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(82,168,224,0.6)'
                el.style.color = 'rgba(82,168,224,0.6)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(82,168,224,0.25)'
                el.style.color = 'rgba(82,168,224,0.5)'
              }}
            >
              {anyExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          )
        })()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {vehicles.map(v => {
          const isActiveTurn = currentSlot?.vehicleInstanceId === v.instanceId
          const isExpanded   = isActiveTurn || !cardCollapsed[v.instanceId]
          const vSlot        = initiativeSlots.find(s => s.vehicleInstanceId === v.instanceId)
          const alignment    = vSlot?.alignment ?? v.alignment ?? 'enemy'
          const vColor       = alignment === 'allied_npc' ? '#4CAF50' : CHAR_BR

          const htCur  = v.hullTraumaCurrent
          const htMax  = v.hullTraumaThreshold
          const ssCur  = v.systemStrainCurrent
          const ssMax  = v.systemStrainThreshold

          return (
            <div key={v.instanceId} style={{
              background: PANEL_BG,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 6,
              position: 'relative',
              borderTop: `2px solid ${vColor}80`,
              borderRight: `1px solid ${isActiveTurn ? 'rgba(200,170,80,0.3)' : BORDER}`,
              borderBottom: `1px solid ${isActiveTurn ? 'rgba(200,170,80,0.3)' : BORDER}`,
              borderLeft: `3px solid ${vColor}`,
              overflow: 'hidden',
              animation: isActiveTurn ? 'activeTurnPulse 2s ease-in-out infinite' : 'none',
              minHeight: 44,
            }}>
              {/* Collapsed header */}
              <div
                onClick={() => { if (!isActiveTurn) setCardCollapsed(prev => ({ ...prev, [v.instanceId]: !prev[v.instanceId] })) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px',
                  cursor: isActiveTurn ? 'default' : 'pointer',
                  minHeight: 44,
                }}
              >
                <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: vColor, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {v.name}
                </span>
                {/* Hull trauma inline */}
                <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_LABEL, color: 'rgba(232,223,200,0.8)', flexShrink: 0 }}>
                  🛡 {htCur}/{htMax}
                </span>
                {/* System strain inline */}
                {ssMax > 0 && (
                  <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_LABEL, color: 'rgba(232,223,200,0.6)', flexShrink: 0 }}>
                    ⚡ {ssCur}/{ssMax}
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
                {/* Name + badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{v.name}</span>
                  <VehicleBadge />
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
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
                      <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: BORDER_MD, marginBottom: 10 }} />

                {/* Hull trauma bar + controls */}
                {(() => {
                  const pct = htMax > 0 ? Math.min(1, htCur / htMax) : 0
                  const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_BR
                  return (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: TEXT_MUTED, flex: 1 }}>
                          Hull Trauma
                          <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", color: pct >= 1 ? CHAR_BR : TEXT, marginLeft: 6 }}>
                            {htCur}/{htMax}
                          </span>
                          {pct >= 1 && <span style={{ color: CHAR_BR, marginLeft: 6 }}>☠ DISABLED</span>}
                        </span>
                        {onAdjustHullTrauma && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => onAdjustHullTrauma(v.instanceId, -1)}
                              style={{ width: 20, height: 20, borderRadius: 3, cursor: 'pointer', background: 'transparent', border: `1px solid ${BORDER_MD}`, fontFamily: FM, fontSize: FS_SM, color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                            >−</button>
                            <button
                              onClick={() => onAdjustHullTrauma(v.instanceId, 1)}
                              style={{ width: 20, height: 20, borderRadius: 3, cursor: 'pointer', background: `${CHAR_BR}18`, border: `1px solid ${BORDER_MD}`, fontFamily: FM, fontSize: FS_SM, color: CHAR_BR, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                            >+</button>
                          </div>
                        )}
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct * 100}%`, height: '100%', background: barColor,
                          borderRadius: 3, transition: 'width 300ms ease',
                          animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
                        }} />
                      </div>
                    </div>
                  )
                })()}

                {/* System strain bar + controls */}
                {ssMax > 0 && (() => {
                  const pct = Math.min(1, ssCur / ssMax)
                  const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_WIL
                  return (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: TEXT_MUTED, flex: 1 }}>
                          System Strain
                          <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", color: pct >= 1 ? CHAR_BR : TEXT, marginLeft: 6 }}>
                            {ssCur}/{ssMax}
                          </span>
                          {pct >= 1 && <span style={{ color: CHAR_BR, marginLeft: 6 }}>⚠ STRAINED</span>}
                        </span>
                        {onAdjustSystemStrain && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => onAdjustSystemStrain(v.instanceId, -1)}
                              style={{ width: 20, height: 20, borderRadius: 3, cursor: 'pointer', background: 'transparent', border: `1px solid ${BORDER_MD}`, fontFamily: FM, fontSize: FS_SM, color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                            >−</button>
                            <button
                              onClick={() => onAdjustSystemStrain(v.instanceId, 1)}
                              style={{ width: 20, height: 20, borderRadius: 3, cursor: 'pointer', background: `${CHAR_WIL}18`, border: `1px solid ${BORDER_MD}`, fontFamily: FM, fontSize: FS_SM, color: CHAR_WIL, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                            >+</button>
                          </div>
                        )}
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct * 100}%`, height: '100%', background: barColor,
                          borderRadius: 3, transition: 'width 300ms ease',
                        }} />
                      </div>
                    </div>
                  )
                })()}

                {/* Weapons */}
                {v.weapons && v.weapons.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Weapons</div>
                    {v.weapons.map((w, i) => {
                      const displayName = vehicleWeaponDisplayName(w.weaponKey)
                      const stats       = vehicleWeaponStats(w.weaponKey)
                      const count  = w.count > 1 ? `${w.count}× ` : ''
                      const turret = w.turret ? ' (Turret)' : ''
                      const dmgStr = stats ? ` — DMG ${stats.damage} — ${stats.range}${stats.crit ? ` — Crit ${stats.crit}` : ''}` : ''
                      return (
                        <div key={i} style={{ fontFamily: FM, fontSize: FS_LABEL, color: '#72B421', marginBottom: 2 }}>
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
