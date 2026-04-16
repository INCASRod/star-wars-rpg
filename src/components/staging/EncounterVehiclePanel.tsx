'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEncounterState } from '@/hooks/useEncounterState'
import type { CombatEncounter } from '@/lib/combat'
import type { VehicleInstance } from '@/lib/vehicles'
import { FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4 } from '@/components/player-hud/design-tokens'

/* ── Design tokens ────────────────────────────────────────── */
const PANEL_BG  = 'rgba(8,16,10,0.88)'
const GOLD      = '#C8AA50'
const BORDER    = 'rgba(200,170,80,0.18)'
const RED       = '#e05252'
const BLUE      = '#52a8e0'
const GREEN     = '#52e08a'
const AMBER     = '#FF9800'
const PURPLE    = '#9C27B0'
const TEXT      = '#E8DFC8'
const TEXT_MUTED = 'rgba(232,223,200,0.45)'
const FC        = "'Rajdhani', sans-serif"

export interface EncounterVehiclePanelProps {
  campaignId: string
}

/**
 * EncounterVehiclePanel — live vehicle wound tracker for the staging right drawer.
 * Self-contained: owns its Supabase subscription via useEncounterState.
 * Fully functional — hull trauma and system strain adjustments write directly
 * to the same combat_encounters row as CombatPanel.
 */
export function EncounterVehiclePanel({ campaignId }: EncounterVehiclePanelProps) {
  const { encounter, isLoading } = useEncounterState(campaignId)
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

  /* ── empty / loading ─────────────────────────────────────── */
  if (isLoading) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', fontFamily: FC, fontSize: FS_SM, color: TEXT_MUTED }}>
        Loading…
      </div>
    )
  }

  const vehicles = encounter?.vehicles ?? []

  if (!encounter || vehicles.length === 0) {
    return (
      <div style={{ padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 28, opacity: 0.3 }}>△</div>
        <div style={{ fontFamily: FC, fontSize: FS_SM, color: TEXT_MUTED, textAlign: 'center' }}>
          No vehicles in this encounter.
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
            borderRadius: 6,
            borderTop: `2px solid ${isDisabled ? RED : `${accent}80`}`,
            borderRight: `1px solid ${BORDER}`,
            borderBottom: `1px solid ${BORDER}`,
            borderLeft: `3px solid ${isDisabled ? RED : accent}`,
            opacity: isDisabled ? 0.65 : 1,
            transition: 'opacity 400ms',
          }}>
            {/* Header */}
            <div style={{ padding: '10px 12px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT, flex: 1 }}>
                {vehicle.name}
              </span>
              {isDisabled && (
                <span style={{
                  fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em',
                  color: 'rgba(232,223,200,0.3)', border: '1px solid rgba(232,223,200,0.15)',
                  borderRadius: 3, padding: '1px 5px', background: 'rgba(232,223,200,0.05)',
                }}>DISABLED</span>
              )}
              <span style={{
                fontFamily: FC, fontSize: FS_OVERLINE, color: BLUE,
                border: `1px solid ${BLUE}50`, borderRadius: 2,
                padding: '1px 5px', background: `${BLUE}15`,
              }}>VEHICLE</span>
            </div>

            {/* Sil + Speed row */}
            <div style={{ padding: '0 12px 6px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Sil',   value: vehicle.silhouette,          color: GOLD },
                { label: 'Speed', value: vehicle.speed,               color: GOLD },
                { label: 'Def',   value: vehicle.defense.fore,         color: TEXT_MUTED },
                { label: 'Armor', value: vehicle.armor,               color: TEXT_MUTED },
                { label: 'HT',    value: vehicle.hullTraumaThreshold,  color: RED },
                { label: 'SS',    value: vehicle.systemStrainThreshold, color: AMBER },
              ].map(s => (
                <div key={s.label} style={{
                  background: `${s.color}12`, border: `1px solid ${s.color}30`,
                  borderRadius: 3, padding: '2px 6px', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value ?? '—'}</div>
                  <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Wound trackers */}
            <div style={{ padding: '0 12px 10px' }}>
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
    width: 36, height: 28, borderRadius: 5,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    cursor: 'pointer', fontFamily: FC, fontSize: 16, lineHeight: 1,
    color: 'rgba(232,223,200,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color .12s', flexShrink: 0,
  }

  return (
    <div>
      {/* Hull Trauma */}
      <div style={{ marginBottom: htMax > 0 && ssMax > 0 ? 10 : 0 }}>
        <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: RED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>
          Hull Trauma
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 2 }}>
          <div style={{ width: `${htPct * 100}%`, height: '100%', background: htColor, borderRadius: 3, transition: 'width 300ms ease' }} />
        </div>
        <div style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_CAPTION, color: TEXT_MUTED, textAlign: 'right', marginBottom: 3 }}>
          {htCur} / {htMax}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => onAdjustHullTrauma(-1)} disabled={htCur === 0}
            style={{ ...btnBase, cursor: htCur === 0 ? 'not-allowed' : 'pointer', color: htCur === 0 ? 'rgba(232,223,200,0.2)' : 'rgba(232,223,200,0.8)' }}
            onMouseEnter={e => { if (htCur > 0) (e.currentTarget as HTMLElement).style.borderColor = `${RED}66` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
          >−</button>
          <span style={{ flex: 1, textAlign: 'center', fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_LABEL, color: 'rgba(232,223,200,0.8)' }}>
            {htCur} trauma
          </span>
          <button onClick={() => onAdjustHullTrauma(1)} style={btnBase}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${RED}66` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
          >+</button>
        </div>
      </div>

      {/* System Strain */}
      {ssMax > 0 && (
        <div>
          <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: AMBER, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3, marginTop: 2 }}>
            System Strain
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 2 }}>
            <div style={{ width: `${ssPct * 100}%`, height: '100%', background: ssColor, borderRadius: 3, transition: 'width 300ms ease' }} />
          </div>
          <div style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_CAPTION, color: TEXT_MUTED, textAlign: 'right', marginBottom: 3 }}>
            {ssCur} / {ssMax}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => onAdjustSystemStrain(-1)} disabled={ssCur === 0}
              style={{ ...btnBase, cursor: ssCur === 0 ? 'not-allowed' : 'pointer', color: ssCur === 0 ? 'rgba(232,223,200,0.2)' : 'rgba(232,223,200,0.8)' }}
              onMouseEnter={e => { if (ssCur > 0) (e.currentTarget as HTMLElement).style.borderColor = `${AMBER}66` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
            >−</button>
            <span style={{ flex: 1, textAlign: 'center', fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_LABEL, color: 'rgba(232,223,200,0.8)' }}>
              {ssCur} strain
            </span>
            <button onClick={() => onAdjustSystemStrain(1)} style={btnBase}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${AMBER}66` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
            >+</button>
          </div>
        </div>
      )}
    </div>
  )
}
