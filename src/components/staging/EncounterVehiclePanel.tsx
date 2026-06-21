'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CombatEncounter } from '@/lib/combat'
import type { VehicleInstance } from '@/lib/vehicles'
import { vehicleWeaponStats } from '@/lib/vehicles'
import { RichText } from '@/components/ui/RichText'
import { HUD, COLOR, FONT_BODY, FS, SP, RADIUS, EASE } from '@/lib/tokens'
import { useEncounterCombatControls } from '@/hooks/useEncounterCombatControls'

/* ── Design tokens ────────────────────────────────────────── */
const FC         = FONT_BODY
const PANEL_BG   = 'var(--hud-surface-mid)'
const BORDER     = 'var(--hud-border)'
const TEXT       = HUD.text
const TEXT_DIM   = HUD.textDim
const TEXT_MUTED = HUD.textFaint
const RED        = COLOR.red
const BLUE       = COLOR.blue
const GREEN      = COLOR.green
const AMBER      = COLOR.amber
const PURPLE     = '#9C27B0'   // no token — keep as-is (ability accent)

export interface EncounterVehiclePanelProps {
  campaignId: string
  encounter:  CombatEncounter | null
}

/**
 * EncounterVehiclePanel — live vehicle tracker for the GM enemy drawer.
 * Collapsible cards with full stat block, defense arcs, abilities, and weapons.
 */
export function EncounterVehiclePanel({ campaignId, encounter }: EncounterVehiclePanelProps) {
  const supabase = createClient()

  /* ── UI state ────────────────────────────────────────────── */
  const [openCards,     setOpenCards]     = useState<Set<string>>(new Set())
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null)

  /* ── save helper ─────────────────────────────────────────── */
  const saveEncounter = useCallback(async (partial: Partial<CombatEncounter>) => {
    if (!encounter?.id) return
    await supabase
      .from('combat_encounters')
      .update({ ...partial, updated_at: new Date().toISOString() })
      .eq('id', encounter.id)
  }, [encounter?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Remove vehicle ──────────────────────────────────────── */
  const removeVehicle = useCallback(async (instanceId: string) => {
    if (!encounter) return
    const vehicle      = (encounter.vehicles ?? []).find(v => v.instanceId === instanceId)
    const slotToRemove = encounter.initiative_slots.find(s => s.vehicleInstanceId === instanceId)
    const updatedVehicles = (encounter.vehicles ?? []).filter(v => v.instanceId !== instanceId)
    const updatedSlots    = encounter.initiative_slots.filter(s => s.vehicleInstanceId !== instanceId)
    await saveEncounter({ vehicles: updatedVehicles, initiative_slots: updatedSlots })
    if (slotToRemove) {
      await supabase.from('map_tokens')
        .delete()
        .eq('slot_key', slotToRemove.id)
        .eq('campaign_id', campaignId)
    }
    if (vehicle && encounter.id) {
      await supabase.from('combat_log').insert({
        campaign_id: campaignId, encounter_id: encounter.id,
        participant_name: 'System', alignment: 'system', roll_type: 'system',
        result_summary: `${vehicle.name} removed from encounter`, is_visible_to_players: false,
      })
    }
    setRemoveConfirm(null)
  }, [encounter, campaignId, saveEncounter]) // eslint-disable-line react-hooks/exhaustive-deps

  const { adjustHullTrauma, adjustSystemStrain } = useEncounterCombatControls({
    encounter,
    saveEncounter,
    supabase,
    campaignId,
  })

  const vehicles = encounter?.vehicles ?? []

  if (!encounter || vehicles.length === 0) {
    return (
      <div style={{ padding: `2.5rem ${SP[4]}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{ fontSize: FS.h1, opacity: 0.3 }}>△</div>
        <div style={{ fontFamily: FC, fontSize: FS.sm, color: TEXT_MUTED, textAlign: 'center' }}>
          No vehicles in this encounter.
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: `${SP[3]} 0.875rem`, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {vehicles.map(vehicle => {
        const isOpen = openCards.has(vehicle.instanceId)
        const toggleOpen = () => setOpenCards(prev => {
          const next = new Set(prev)
          isOpen ? next.delete(vehicle.instanceId) : next.add(vehicle.instanceId)
          return next
        })

        const vSlot     = encounter.initiative_slots.find(s => s.vehicleInstanceId === vehicle.instanceId)
        const alignment = vSlot?.alignment ?? vehicle.alignment ?? 'enemy'
        const accent    = alignment === 'allied_npc' ? GREEN : BLUE
        const isDisabled = vehicle.hullTraumaCurrent >= vehicle.hullTraumaThreshold

        return (
          <div key={vehicle.instanceId} style={{
            background:           PANEL_BG,
            backdropFilter:       'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius:         RADIUS.lg,
            position:             'relative',
            borderTop:    `2px solid ${isDisabled ? RED : `${accent}80`}`,
            borderRight:  `1px solid ${BORDER}`,
            borderBottom: `1px solid ${BORDER}`,
            borderLeft:   `1px solid ${BORDER}`,
            opacity:    isDisabled ? 0.65 : 1,
            transition: `opacity ${EASE.smooth}`,
          }}>

            {/* ── Header ──────────────────────────────────────── */}
            <div
              style={{ padding: `0.625rem ${SP[3]} ${SP[2]}`, display: 'flex', alignItems: 'center', gap: SP[2], cursor: 'pointer' }}
              onClick={toggleOpen}
            >
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: FC, fontSize: FS.sm, fontWeight: 700, color: TEXT }}>
                  {vehicle.name}
                </span>
                {isDisabled && (
                  <span style={{
                    fontFamily: FC, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em',
                    color: TEXT_MUTED, border: `1px solid ${BORDER}`,
                    borderRadius: RADIUS.sm, padding: '1px 5px', background: 'var(--hud-surface-lo)',
                  }}>DISABLED</span>
                )}
                <span style={{
                  fontFamily: FC, fontSize: FS.overline, color: BLUE,
                  border: `1px solid color-mix(in srgb, ${BLUE} 31%, transparent)`,
                  borderRadius: RADIUS.sm, padding: '1px 5px',
                  background: `color-mix(in srgb, ${BLUE} 10%, transparent)`,
                }}>VEHICLE</span>
              </div>

              <span style={{ color: TEXT_MUTED, fontSize: FS.sm }}>{isOpen ? '▲' : '▼'}</span>

              {/* Remove button */}
              {removeConfirm === vehicle.instanceId ? (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    background: 'var(--hud-surface-hi)',
                    border: `1px solid color-mix(in srgb, ${RED} 40%, transparent)`,
                    borderRadius: RADIUS.md, padding: `0.1875rem ${SP[2]}`, flexShrink: 0,
                  }}
                >
                  <span style={{ fontFamily: FC, fontSize: FS.caption, color: `color-mix(in srgb, ${RED} 85%, transparent)`, whiteSpace: 'nowrap' }}>Remove?</span>
                  <button onClick={() => setRemoveConfirm(null)} style={smallCtrlBtn}>Cancel</button>
                  <button
                    onClick={() => void removeVehicle(vehicle.instanceId)}
                    style={{ ...smallCtrlBtn, color: RED, borderColor: `color-mix(in srgb, ${RED} 50%, transparent)` }}
                  >Remove</button>
                </div>
              ) : (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setRemoveConfirm(vehicle.instanceId)
                    setTimeout(() => setRemoveConfirm(p => p === vehicle.instanceId ? null : p), 5000)
                  }}
                  title={`Remove ${vehicle.name}`}
                  className="hov-failure-btn"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
                    fontSize: FS.sm, lineHeight: 1,
                    padding: '2px 5px', borderRadius: RADIUS.sm,
                  }}
                >×</button>
              )}
            </div>

            {/* ── Compact stats row (always visible) ──────────── */}
            <div style={{ padding: `0 ${SP[3]} ${SP[2]}`, display: 'flex', gap: SP[1], flexWrap: 'wrap' }}>
              {([
                { label: 'Sil',   value: vehicle.silhouette,            color: HUD.gold },
                { label: 'Speed', value: vehicle.speed,                 color: HUD.gold },
                { label: 'Hdl',   value: vehicle.handling >= 0 ? `+${vehicle.handling}` : String(vehicle.handling), color: HUD.gold },
                { label: 'Armor', value: vehicle.armor,                 color: TEXT_MUTED },
                { label: 'HT',    value: vehicle.hullTraumaThreshold,   color: RED },
                { label: 'SS',    value: vehicle.systemStrainThreshold, color: AMBER },
              ] as { label: string; value: string | number; color: string }[]).map(s => (
                <div key={s.label} style={{
                  background: `color-mix(in srgb, ${s.color} 8%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${s.color} 25%, transparent)`,
                  borderRadius: RADIUS.sm, padding: `0.125rem 0.375rem`, textAlign: 'center',
                }}>
                  <div style={{ fontFamily: FC, fontSize: FS.h4, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value ?? '—'}</div>
                  <div style={{ fontFamily: FC, fontSize: FS.overline, color: TEXT_MUTED }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── Wound trackers (always visible) ─────────────── */}
            <div style={{ padding: `0 ${SP[3]} ${SP[2]}` }}>
              <VehicleWoundTracker
                vehicle={vehicle}
                onAdjustHullTrauma={delta => void adjustHullTrauma(vehicle, delta)}
                onAdjustSystemStrain={delta => void adjustSystemStrain(vehicle, delta)}
              />
            </div>

            {/* ── Expanded body ────────────────────────────────── */}
            {isOpen && (
              <div style={{ padding: `0 ${SP[3]} ${SP[3]}`, borderTop: `1px solid ${BORDER}` }}>

                {/* Full defense arcs */}
                <div style={{ marginTop: SP[2], marginBottom: SP[2] }}>
                  <div style={{ fontFamily: FC, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: `color-mix(in srgb, ${HUD.gold} 57%, transparent)`, marginBottom: '0.375rem' }}>
                    Defense Arcs
                  </div>
                  <div style={{ display: 'flex', gap: SP[1], flexWrap: 'wrap' }}>
                    {[
                      { label: 'Fore',  value: vehicle.defense.fore },
                      { label: 'Aft',   value: vehicle.defense.aft },
                      { label: 'Port',  value: vehicle.defense.port },
                      { label: 'Stbd',  value: vehicle.defense.starboard },
                    ].map(s => (
                      <div key={s.label} style={{
                        background: `color-mix(in srgb, ${BLUE} 8%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${BLUE} 25%, transparent)`,
                        borderRadius: RADIUS.sm, padding: `0.125rem 0.5rem`, textAlign: 'center',
                      }}>
                        <div style={{ fontFamily: FC, fontSize: FS.h4, fontWeight: 700, color: BLUE, lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontFamily: FC, fontSize: FS.overline, color: TEXT_MUTED }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Abilities */}
                {vehicle.abilities && vehicle.abilities.length > 0 && (
                  <div style={{ marginBottom: SP[2] }}>
                    <div style={{ fontFamily: FC, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: PURPLE, marginBottom: '0.375rem' }}>
                      Abilities
                    </div>
                    <div style={{ background: `color-mix(in srgb, ${PURPLE} 5%, transparent)`, border: `1px solid color-mix(in srgb, ${PURPLE} 25%, transparent)`, borderRadius: RADIUS.md, padding: `0.4375rem 0.5625rem`, display: 'flex', flexDirection: 'column', gap: '0.3125rem' }}>
                      {vehicle.abilities.map((ab, i) => (
                        <div key={i}>
                          <span style={{ fontFamily: FC, fontSize: FS.caption, fontWeight: 700, color: PURPLE }}>{ab.name}{ab.description ? ': ' : ''}</span>
                          {ab.description && <span style={{ fontFamily: FC, fontSize: FS.caption, color: TEXT_DIM }}><RichText text={ab.description} /></span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {vehicle.description && (
                  <div style={{ marginBottom: SP[2] }}>
                    <div style={{ fontFamily: FC, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: `color-mix(in srgb, ${HUD.gold} 57%, transparent)`, marginBottom: '0.375rem' }}>
                      Description
                    </div>
                    <div style={{ fontFamily: FC, fontSize: FS.caption, color: TEXT_DIM, lineHeight: 1.5 }}>
                      {vehicle.description}
                    </div>
                  </div>
                )}

                {/* Weapons */}
                {vehicle.weapons && vehicle.weapons.length > 0 && (
                  <div>
                    <div style={{ fontFamily: FC, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: `color-mix(in srgb, ${HUD.gold} 57%, transparent)`, marginBottom: '0.375rem' }}>
                      Weapons
                    </div>
                    {vehicle.weapons.map((w, i) => {
                      const stats       = vehicleWeaponStats(w.weaponKey)
                      const displayName = stats?.name ?? w.weaponKey
                      const quals       = w.qualities
                        .map(q => `${q.key}${q.count > 1 ? ` ${q.count}` : ''}`)
                        .join(', ')
                      const parts = [
                        `${w.count > 1 ? `${w.count}× ` : ''}${displayName}${w.turret ? ' (Turret)' : ''}`,
                        stats ? `DMG ${stats.damage}` : null,
                        stats?.crit !== undefined ? `Crit ${stats.crit}` : null,
                        stats?.range ?? null,
                        quals || null,
                      ].filter(Boolean).join(' — ')
                      return (
                        <div key={i} style={{ fontFamily: FC, fontSize: FS.label, fontWeight: 500, color: 'var(--state-success)', marginBottom: 2 }}>
                          {parts}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── VehicleWoundTracker ──────────────────────────────────── */
function VehicleWoundTracker({
  vehicle, onAdjustHullTrauma, onAdjustSystemStrain,
}: {
  vehicle: VehicleInstance
  onAdjustHullTrauma: (delta: number) => void
  onAdjustSystemStrain: (delta: number) => void
}) {
  const htCur = vehicle.hullTraumaCurrent
  const htMax = vehicle.hullTraumaThreshold
  const ssCur = vehicle.systemStrainCurrent
  const ssMax = vehicle.systemStrainThreshold

  const htPct   = htMax > 0 ? Math.min(1, htCur / htMax) : 0
  const htColor = htPct >= 1 ? PURPLE : htPct >= 0.8 ? COLOR.red : htPct >= 0.5 ? COLOR.amber : COLOR.red
  const ssPct   = ssMax > 0 ? Math.min(1, ssCur / ssMax) : 0
  const ssColor = ssPct >= 1 ? PURPLE : COLOR.amber

  const btnBase: React.CSSProperties = {
    width: '2.25rem', height: '1.75rem', borderRadius: RADIUS.md,
    background: 'var(--hud-surface-lo)',
    border: `1px solid var(--hud-border)`,
    cursor: 'pointer', fontFamily: FONT_BODY, fontSize: FS.h4, lineHeight: 1,
    color: HUD.text,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: `border-color ${EASE.quick}`, flexShrink: 0,
  }

  return (
    <div>
      {/* Hull Trauma */}
      <div style={{ marginBottom: htMax > 0 && ssMax > 0 ? '0.625rem' : 0 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: COLOR.red, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.1875rem' }}>
          Hull Trauma
        </div>
        <div style={{ height: '0.375rem', background: 'var(--hud-surface-lo)', borderRadius: RADIUS.sm, overflow: 'hidden', marginBottom: '0.125rem' }}>
          <div style={{ width: `${htPct * 100}%`, height: '100%', background: htColor, borderRadius: RADIUS.sm, transition: `width ${EASE.smooth}` }} />
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, textAlign: 'right', marginBottom: '0.1875rem' }}>
          {htCur} / {htMax}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
          <button onClick={() => onAdjustHullTrauma(-1)} disabled={htCur === 0}
            className="vhp-ht-btn"
            style={{ ...btnBase, cursor: htCur === 0 ? 'not-allowed' : 'pointer', color: htCur === 0 ? HUD.textFaint : HUD.text }}
          >−</button>
          <span style={{ flex: 1, textAlign: 'center', fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.text }}>
            {htCur} trauma
          </span>
          <button onClick={() => onAdjustHullTrauma(1)} className="vhp-ht-btn" style={btnBase}>+</button>
        </div>
      </div>

      {/* System Strain */}
      {ssMax > 0 && (
        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: COLOR.amber, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.1875rem', marginTop: '0.125rem' }}>
            System Strain
          </div>
          <div style={{ height: '0.375rem', background: 'var(--hud-surface-lo)', borderRadius: RADIUS.sm, overflow: 'hidden', marginBottom: '0.125rem' }}>
            <div style={{ width: `${ssPct * 100}%`, height: '100%', background: ssColor, borderRadius: RADIUS.sm, transition: `width ${EASE.smooth}` }} />
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, textAlign: 'right', marginBottom: '0.1875rem' }}>
            {ssCur} / {ssMax}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
            <button onClick={() => onAdjustSystemStrain(-1)} disabled={ssCur === 0}
              className="vhp-ss-btn"
              style={{ ...btnBase, cursor: ssCur === 0 ? 'not-allowed' : 'pointer', color: ssCur === 0 ? HUD.textFaint : HUD.text }}
            >−</button>
            <span style={{ flex: 1, textAlign: 'center', fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.text }}>
              {ssCur} strain
            </span>
            <button onClick={() => onAdjustSystemStrain(1)} className="vhp-ss-btn" style={btnBase}>+</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── smallCtrlBtn ─────────────────────────────────────────── */
const smallCtrlBtn: React.CSSProperties = {
  background: 'transparent', border: `1px solid var(--hud-border-hi)`,
  borderRadius: RADIUS.sm, padding: `1px 0.4375rem`, cursor: 'pointer',
  fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.text,
  transition: EASE.quick, lineHeight: 1,
}
