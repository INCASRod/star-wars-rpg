'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CombatEncounter } from '@/lib/combat'
import type { VehicleInstance } from '@/lib/vehicles'
import { HUD, FONT_BODY, FS, SP, RADIUS, EASE } from '@/lib/tokens'

/* ── Design tokens ────────────────────────────────────────── */
const PANEL_BG  = 'var(--hud-surface-mid)'
const BORDER    = 'var(--hud-border)'
const RED       = '#e05252'
const BLUE      = '#52a8e0'
const GREEN     = '#52e08a'
const AMBER     = '#FF9800'
const PURPLE    = '#9C27B0'
const TEXT      = 'var(--hud-text)'
const TEXT_MUTED = 'var(--hud-text-faint)'

export interface EncounterVehiclePanelProps {
  campaignId: string
  encounter:  CombatEncounter | null
}

/**
 * EncounterVehiclePanel — live vehicle wound tracker for the staging right drawer.
 * Receives encounter state via props (from useGmSession in GmShell) to avoid
 * competing Supabase Realtime subscriptions.
 */
export function EncounterVehiclePanel({ campaignId, encounter }: EncounterVehiclePanelProps) {
  const supabase = createClient()

  /* ── save helper ─────────────────────────────────────────── */
  const saveEncounter = useCallback(async (partial: Partial<CombatEncounter>) => {
    if (!encounter?.id) return
    await supabase
      .from('combat_encounters')
      .update({ ...partial, updated_at: new Date().toISOString() })
      .eq('id', encounter.id)
  }, [encounter?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mutations ───────────────────────────────────────────── */
  const adjustHullTrauma = useCallback(async (vehicle: VehicleInstance, delta: number) => {
    if (!encounter) return
    const next = Math.max(0, Math.min(vehicle.hullTraumaThreshold, vehicle.hullTraumaCurrent + delta))
    const updated = (encounter.vehicles ?? []).map(v =>
      v.instanceId !== vehicle.instanceId ? v : { ...v, hullTraumaCurrent: next }
    )
    await saveEncounter({ vehicles: updated })
    // Sync wound_pct on map token
    const vSlot = encounter.initiative_slots.find(s => s.vehicleInstanceId === vehicle.instanceId)
    if (vSlot) {
      const pct = Math.min(1, next / Math.max(1, vehicle.hullTraumaThreshold))
      await supabase.from('map_tokens').update({ wound_pct: pct }).eq('slot_key', vSlot.id).eq('campaign_id', campaignId)
    }
    // Log disable event
    const wasDisabled = vehicle.hullTraumaCurrent >= vehicle.hullTraumaThreshold
    if (!wasDisabled && next >= vehicle.hullTraumaThreshold && encounter.id) {
      await supabase.from('combat_log').insert({
        campaign_id: campaignId, encounter_id: encounter.id,
        participant_name: 'SYSTEM', alignment: 'system', roll_type: 'system',
        result_summary: `${vehicle.name} — DISABLED (Hull Trauma ${next}/${vehicle.hullTraumaThreshold})`,
        is_visible_to_players: true,
      })
    }
  }, [encounter, campaignId, saveEncounter]) // eslint-disable-line react-hooks/exhaustive-deps

  const adjustSystemStrain = useCallback(async (vehicle: VehicleInstance, delta: number) => {
    if (!encounter) return
    const next = Math.max(0, Math.min(vehicle.systemStrainThreshold, vehicle.systemStrainCurrent + delta))
    const updated = (encounter.vehicles ?? []).map(v =>
      v.instanceId !== vehicle.instanceId ? v : { ...v, systemStrainCurrent: next }
    )
    await saveEncounter({ vehicles: updated })
  }, [encounter, saveEncounter])

  const vehicles = encounter?.vehicles ?? []

  if (!encounter || vehicles.length === 0) {
    return (
      <div style={{ padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{ fontSize: 28, opacity: 0.3 }}>△</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: TEXT_MUTED, textAlign: 'center' }}>
          No vehicles in this encounter.
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '0.75rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {vehicles.map(vehicle => {
        const vSlot = encounter.initiative_slots.find(s => s.vehicleInstanceId === vehicle.instanceId)
        const alignment = vSlot?.alignment ?? vehicle.alignment ?? 'enemy'
        const accent = alignment === 'allied_npc' ? GREEN : BLUE
        const isDisabled = vehicle.hullTraumaCurrent >= vehicle.hullTraumaThreshold

        return (
          <div key={vehicle.instanceId} style={{
            background: PANEL_BG,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '0.375rem',
            borderTop: `2px solid ${isDisabled ? RED : `${accent}80`}`,
            borderRight: `1px solid ${BORDER}`,
            borderBottom: `1px solid ${BORDER}`,
            borderLeft: `3px solid ${isDisabled ? RED : accent}`,
            opacity: isDisabled ? 0.65 : 1,
            transition: 'opacity 0.4s ease',
          }}>
            {/* Header */}
            <div style={{ padding: '0.625rem 0.75rem 0.25rem', display: 'flex', alignItems: 'center', gap: SP[2] }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: TEXT, flex: 1 }}>
                {vehicle.name}
              </span>
              {isDisabled && (
                <span style={{
                  fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em',
                  color: TEXT_MUTED, border: `1px solid var(--hud-border)`,
                  borderRadius: '0.1875rem', padding: '1px 0.3125rem', background: 'var(--hud-surface-lo)',
                }}>DISABLED</span>
              )}
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.overline, color: BLUE,
                border: `1px solid ${BLUE}50`, borderRadius: RADIUS.sm,
                padding: '1px 0.3125rem', background: `${BLUE}15`,
              }}>VEHICLE</span>
            </div>

            {/* Sil + Speed row */}
            <div style={{ padding: '0 0.75rem 0.375rem', display: 'flex', gap: SP[2], flexWrap: 'wrap' }}>
              {[
                { label: 'Sil',   value: vehicle.silhouette,          color: HUD.gold },
                { label: 'Speed', value: vehicle.speed,               color: HUD.gold },
                { label: 'Def',   value: vehicle.defense.fore,         color: TEXT_MUTED },
                { label: 'Armor', value: vehicle.armor,               color: TEXT_MUTED },
                { label: 'HT',    value: vehicle.hullTraumaThreshold,  color: RED },
                { label: 'SS',    value: vehicle.systemStrainThreshold, color: AMBER },
              ].map(s => (
                <div key={s.label} style={{
                  background: `${s.color}12`, border: `1px solid ${s.color}30`,
                  borderRadius: '0.1875rem', padding: '0.125rem 0.375rem', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value ?? '—'}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUTED }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Wound trackers */}
            <div style={{ padding: '0 0.75rem 0.625rem' }}>
              <VehicleWoundTracker
                vehicle={vehicle}
                onAdjustHullTrauma={delta => void adjustHullTrauma(vehicle, delta)}
                onAdjustSystemStrain={delta => void adjustSystemStrain(vehicle, delta)}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── VehicleWoundTracker (mirrored from CombatPanel) ─────── */
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
  const htColor = htPct >= 1 ? PURPLE : htPct >= 0.8 ? RED : htPct >= 0.5 ? AMBER : RED
  const ssPct   = ssMax > 0 ? Math.min(1, ssCur / ssMax) : 0
  const ssColor = ssPct >= 1 ? PURPLE : ssPct >= 0.8 ? AMBER : AMBER

  const btnBase: React.CSSProperties = {
    width: '2.25rem', height: '1.75rem', borderRadius: '0.3125rem',
    background: 'var(--hud-surface-lo)',
    border: '1px solid var(--hud-border)',
    cursor: 'pointer', fontFamily: FONT_BODY, fontSize: FS.h4, lineHeight: 1,
    color: TEXT,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color .12s', flexShrink: 0,
  }

  return (
    <div>
      {/* Hull Trauma */}
      <div style={{ marginBottom: htMax > 0 && ssMax > 0 ? '0.625rem' : 0 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: RED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.1875rem' }}>
          Hull Trauma
        </div>
        <div style={{ height: '0.375rem', background: 'var(--hud-surface-lo)', borderRadius: '0.1875rem', overflow: 'hidden', marginBottom: '0.125rem' }}>
          <div style={{ width: `${htPct * 100}%`, height: '100%', background: htColor, borderRadius: '0.1875rem', transition: `width var(--ease-smooth)` }} />
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: TEXT_MUTED, textAlign: 'right', marginBottom: '0.1875rem' }}>
          {htCur} / {htMax}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
          <button onClick={() => onAdjustHullTrauma(-1)} disabled={htCur === 0}
            className="vhp-ht-btn"
            style={{ ...btnBase, cursor: htCur === 0 ? 'not-allowed' : 'pointer', color: htCur === 0 ? 'var(--hud-text-faint)' : TEXT }}
          >−</button>
          <span style={{ flex: 1, textAlign: 'center', fontFamily: FONT_BODY, fontSize: FS.label, color: TEXT }}>
            {htCur} trauma
          </span>
          <button onClick={() => onAdjustHullTrauma(1)} className="vhp-ht-btn" style={btnBase}
          >+</button>
        </div>
      </div>

      {/* System Strain */}
      {ssMax > 0 && (
        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: AMBER, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.1875rem', marginTop: '0.125rem' }}>
            System Strain
          </div>
          <div style={{ height: '0.375rem', background: 'var(--hud-surface-lo)', borderRadius: '0.1875rem', overflow: 'hidden', marginBottom: '0.125rem' }}>
            <div style={{ width: `${ssPct * 100}%`, height: '100%', background: ssColor, borderRadius: '0.1875rem', transition: `width var(--ease-smooth)` }} />
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: TEXT_MUTED, textAlign: 'right', marginBottom: '0.1875rem' }}>
            {ssCur} / {ssMax}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
            <button onClick={() => onAdjustSystemStrain(-1)} disabled={ssCur === 0}
              className="vhp-ss-btn"
              style={{ ...btnBase, cursor: ssCur === 0 ? 'not-allowed' : 'pointer', color: ssCur === 0 ? 'var(--hud-text-faint)' : TEXT }}
            >−</button>
            <span style={{ flex: 1, textAlign: 'center', fontFamily: FONT_BODY, fontSize: FS.label, color: TEXT }}>
              {ssCur} strain
            </span>
            <button onClick={() => onAdjustSystemStrain(1)} className="vhp-ss-btn" style={btnBase}
            >+</button>
          </div>
        </div>
      )}
    </div>
  )
}
