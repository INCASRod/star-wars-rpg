'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEncounterState } from '@/hooks/useEncounterState'
import { advanceInitiative } from '@/lib/combat'
import type { CombatEncounter, InitiativeSlot, SlotAlignment } from '@/lib/combat'
import type { Character } from '@/lib/types'
import { FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4 } from '@/components/player-hud/design-tokens'

/* ── Design tokens ────────────────────────────────────────── */
const BG        = '#060D09'
const PANEL_BG  = 'rgba(8,16,10,0.88)'
const RAISED_BG = 'rgba(14,26,18,0.9)'
const GOLD      = '#C8AA50'
const BORDER    = 'rgba(200,170,80,0.18)'
const BORDER_MD = 'rgba(200,170,80,0.32)'
const RED       = '#e05252'
const BLUE      = '#52a8e0'
const GREEN     = '#52e08a'
const TEAL      = '#52e0a8'
const TEXT      = '#E8DFC8'
const TEXT_MUTED = 'rgba(232,223,200,0.45)'
const FC        = "'Rajdhani', sans-serif"

/* ── Types ────────────────────────────────────────────────── */
interface CombatParticipantRow {
  character_id:          string
  active_character_id:   string | null
  active_character_name: string | null
  has_acted_this_round:  boolean
  slot_type:             'pc' | 'npc'
}

/* ── Props ────────────────────────────────────────────────── */
export interface CombatFeedPanelProps {
  campaignId: string
  characters: Character[]
}

/* ── Ghost button style ───────────────────────────────────── */
const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  border: `1px solid ${BORDER_MD}`,
  borderRadius: 4, padding: '4px 10px', cursor: 'pointer',
  fontFamily: FC, fontSize: FS_LABEL, color: TEXT,
  transition: '.15s', lineHeight: 1,
}
const smallBtn: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${BORDER_MD}`,
  borderRadius: 3, width: 22, height: 22, cursor: 'pointer',
  fontFamily: FC, fontSize: FS_SM, color: TEXT_MUTED,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: '.15s', lineHeight: 1, flexShrink: 0,
}

/**
 * CombatFeedPanel — a self-contained, fully-interactive initiative tracker
 * rendered inside the Combat Feed StagingLeftDrawer slot.
 *
 * Owns its own Supabase subscriptions (separate from CombatPanel's).
 * Both panels write to the same `combat_encounters` row so all GMs/views
 * stay live-synced via realtime.
 *
 * Supported mutations:
 *   - ← Prev: move current pointer back one slot (no acted change)
 *   - ✓ Acted / Next →: mark current slot acted, advance pointer
 *   - Skip: mark current slot acted, skip to next without round logic
 *   - Adjust PC wounds (+/−)
 *   - Adjust NPC wounds (+/−)
 *   - Adjust vehicle hull trauma (+/−)
 *   - Toggle slot alignment (enemy ↔ allied_npc)
 *   - Remove slot (with inline confirmation)
 */
export function CombatFeedPanel({ campaignId, characters }: CombatFeedPanelProps) {
  const { encounter, isLoading } = useEncounterState(campaignId)

  /* ── Combat participants (PC active-character names) ─────── */
  const [participants, setParticipants] = useState<Record<string, CombatParticipantRow>>({})

  const supabase = createClient()

  useEffect(() => {
    if (!campaignId) return
    // Initial load
    supabase.from('combat_participants').select(
      'character_id, active_character_id, active_character_name, has_acted_this_round, slot_type'
    ).eq('campaign_id', campaignId).then(({ data }) => {
      if (!data) return
      const map: Record<string, CombatParticipantRow> = {}
      for (const r of data as CombatParticipantRow[]) map[r.character_id] = r
      setParticipants(map)
    })
    // Realtime
    const ch = supabase.channel(`cf-participants-${campaignId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'combat_participants',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const old = payload.old as { character_id: string }
          setParticipants(prev => { const n = { ...prev }; delete n[old.character_id]; return n })
        } else if (payload.new) {
          const r = payload.new as CombatParticipantRow
          setParticipants(prev => ({ ...prev, [r.character_id]: r }))
        }
      })
      .subscribe()
    return () => { void supabase.removeChannel(ch) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Core save helper ────────────────────────────────────── */
  const saveEncounter = useCallback(async (partial: Partial<CombatEncounter>) => {
    if (!encounter?.id) return
    await supabase
      .from('combat_encounters')
      .update({ ...partial, updated_at: new Date().toISOString() })
      .eq('id', encounter.id)
  }, [encounter?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Mutations ───────────────────────────────────────────── */

  // Advance turn: mark current slot acted, move pointer
  const handleMarkActed = useCallback(async () => {
    if (!encounter) return
    const currentSlot = encounter.initiative_slots[encounter.current_slot_index]

    // Update combat_participants for PC slots (has_acted_this_round flag)
    if (currentSlot?.type === 'pc' && currentSlot.characterId) {
      const p = participants[currentSlot.characterId]
      const activeId = p?.active_character_id ?? currentSlot.characterId
      await supabase.from('combat_participants')
        .update({ has_acted_this_round: true })
        .eq('campaign_id', campaignId)
        .eq('character_id', activeId)
    }

    const result = advanceInitiative(
      encounter.initiative_slots,
      encounter.current_slot_index,
      encounter.round,
    )

    // New round: reset all PC participants
    if (result.round > encounter.round) {
      await supabase.from('combat_participants')
        .update({
          active_character_id: null,
          active_character_name: null,
          has_acted_this_round: false,
          active_weapon_key: null,
          active_weapon_name: null,
          secondary_weapon_name: null,
          secondary_weapon_key: null,
          active_weapon_updated_at: null,
        })
        .eq('campaign_id', campaignId)
        .eq('slot_type', 'pc')
    }

    await saveEncounter({
      initiative_slots: result.slots,
      current_slot_index: result.currentIndex,
      round: result.round,
    })
  }, [encounter, participants, campaignId, saveEncounter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Go back one slot (no acted state changes)
  const handlePrev = useCallback(async () => {
    if (!encounter) return
    const prev = Math.max(0, encounter.current_slot_index - 1)
    const updated = encounter.initiative_slots.map((s: InitiativeSlot, i: number) => ({
      ...s, current: i === prev,
    }))
    await saveEncounter({ initiative_slots: updated, current_slot_index: prev })
  }, [encounter, saveEncounter])

  // Skip current slot without round-advance logic
  const handleSkip = useCallback(async (idx: number) => {
    if (!encounter) return
    const nextIdx = idx + 1
    const updated = encounter.initiative_slots.map((s: InitiativeSlot, i: number) =>
      i === idx    ? { ...s, acted: true,  current: false }
      : i === nextIdx ? { ...s, current: true }
      : s
    )
    await saveEncounter({ initiative_slots: updated, current_slot_index: nextIdx })
  }, [encounter, saveEncounter])

  // PC wound adjustment (stored on initiative_slot)
  const adjustPCWound = useCallback(async (slotId: string, delta: number) => {
    if (!encounter) return
    const updated = encounter.initiative_slots.map((s: InitiativeSlot) => {
      if (s.id !== slotId) return s
      const ch = characters.find(c => c.id === s.characterId)
      const max = ch?.wound_threshold ?? 99
      const base = s.woundsCurrent ?? ch?.wound_current ?? 0
      return { ...s, woundsCurrent: Math.max(0, Math.min(max, base + delta)) }
    })
    await saveEncounter({ initiative_slots: updated })
  }, [encounter, characters, saveEncounter])

  // NPC wound adjustment (stored on adversary instance)
  const adjustNPCWound = useCallback(async (instanceId: string, delta: number) => {
    if (!encounter) return
    const updated = encounter.adversaries.map(a =>
      a.instanceId !== instanceId ? a
        : { ...a, woundsCurrent: Math.max(0, (a.woundsCurrent ?? 0) + delta) }
    )
    await saveEncounter({ adversaries: updated })
  }, [encounter, saveEncounter])

  // Vehicle hull trauma adjustment
  const adjustVehicleHull = useCallback(async (instanceId: string, delta: number) => {
    if (!encounter) return
    const updated = encounter.vehicles.map(v =>
      v.instanceId !== instanceId ? v
        : { ...v, hullTraumaCurrent: Math.max(0, Math.min(v.hullTraumaThreshold, v.hullTraumaCurrent + delta)) }
    )
    await saveEncounter({ vehicles: updated })
  }, [encounter, saveEncounter])

  // Toggle alignment
  const toggleAlignment = useCallback(async (slotId: string) => {
    if (!encounter) return
    const updated = encounter.initiative_slots.map((s: InitiativeSlot) => {
      if (s.id !== slotId) return s
      const cur: SlotAlignment = s.alignment ?? 'enemy'
      return { ...s, alignment: cur === 'enemy' ? 'allied_npc' : 'enemy' as SlotAlignment }
    })
    await saveEncounter({ initiative_slots: updated })
  }, [encounter, saveEncounter])

  /* ── Remove slot state + handler ─────────────────────────── */
  const [removeConfirm, setRemoveConfirm] = useState<{
    slotId: string
    isPC:   boolean
    charId: string | null
    name:   string
  } | null>(null)

  const confirmRemove = useCallback(async () => {
    if (!encounter || !removeConfirm) return
    const updatedSlots = encounter.initiative_slots.filter(
      (s: InitiativeSlot) => s.id !== removeConfirm.slotId
    )
    await saveEncounter({ initiative_slots: updatedSlots })
    if (removeConfirm.isPC && removeConfirm.charId) {
      await supabase.from('combat_participants').delete()
        .eq('character_id', removeConfirm.charId)
        .eq('campaign_id', campaignId)
    }
    setRemoveConfirm(null)
  }, [encounter, removeConfirm, campaignId, saveEncounter]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Hover state ─────────────────────────────────────────── */
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null)

  /* ── Empty / loading states ──────────────────────────────── */
  if (isLoading) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', fontFamily: FC, fontSize: FS_SM, color: TEXT_MUTED }}>
        Loading…
      </div>
    )
  }

  if (!encounter) {
    return (
      <div style={{
        padding: '40px 16px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 10,
      }}>
        <div style={{ fontSize: 28, opacity: 0.3 }}>⚔</div>
        <div style={{ fontFamily: FC, fontSize: FS_SM, color: TEXT_MUTED, textAlign: 'center' }}>
          No active combat encounter.<br />Begin combat from the top bar.
        </div>
      </div>
    )
  }

  const slots = encounter.initiative_slots.filter(
    (s: InitiativeSlot) => !s.squad_suppressed
  )
  const currentSlot = encounter.initiative_slots[encounter.current_slot_index] ?? null
  const curAlign: SlotAlignment = currentSlot?.alignment ?? (currentSlot?.type === 'npc' ? 'enemy' : 'player')
  const bannerColor = curAlign === 'allied_npc' ? GREEN : curAlign === 'player' ? BLUE : RED

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header: round + acting now ───────────────────────── */}
      <div style={{
        flexShrink: 0,
        background: RAISED_BG, borderBottom: `1px solid ${BORDER}`,
        padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {/* Row 1: Round badge + acting banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Round */}
          <div style={{
            background: `${GOLD}18`, border: `1px solid ${GOLD}40`,
            borderRadius: 4, padding: '4px 10px', flexShrink: 0,
            display: 'flex', alignItems: 'baseline', gap: 5,
          }}>
            <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT_MUTED, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Round</span>
            <span style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: GOLD, lineHeight: 1 }}>{encounter.round}</span>
          </div>

          {/* Acting now banner */}
          {currentSlot && (
            <div style={{
              flex: 1, background: `${bannerColor}15`, border: `1px solid ${bannerColor}50`,
              borderRadius: 4, padding: '5px 10px',
              display: 'flex', alignItems: 'center', gap: 7, minWidth: 0,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%', background: bannerColor,
                boxShadow: `0 0 8px ${bannerColor}`, flexShrink: 0,
                animation: 'pulse-dot 1.4s ease-in-out infinite',
              }} />
              <span style={{
                fontFamily: FC, fontSize: FS_LABEL, color: bannerColor, fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {currentSlot.name}
              </span>
            </div>
          )}
        </div>

        {/* Row 2: Prev / Acted / Skip controls */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => void handlePrev()}
            style={ghostBtn}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${GOLD}0f` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >← Prev</button>
          <button
            onClick={() => void handleMarkActed()}
            style={{ ...ghostBtn, border: `1px solid ${GOLD}60`, color: GOLD, background: `${GOLD}15` }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${GOLD}22` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${GOLD}15` }}
          >✓ Acted / Next →</button>
        </div>
      </div>

      {/* ── Slot list ─────────────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {slots.length === 0 && (
          <div style={{ padding: '24px 0', textAlign: 'center', fontFamily: FC, fontSize: FS_SM, color: TEXT_MUTED, fontStyle: 'italic' }}>
            No initiative slots yet
          </div>
        )}

        {slots.map((slot: InitiativeSlot, displayIdx: number) => {
          // Find true index in full slots array for skip/wound ops
          const trueIdx = encounter.initiative_slots.findIndex(s => s.id === slot.id)

          const isNPC      = slot.type === 'npc'
          const isCurrent  = slot.current
          const isActed    = slot.acted
          const effectiveAlign: SlotAlignment = slot.alignment ?? (isNPC ? 'enemy' : 'player')
          const accent = effectiveAlign === 'allied_npc' ? GREEN
                       : effectiveAlign === 'player'     ? BLUE
                       : RED
          const isKilled = (() => {
            if (!isNPC) return false
            if (slot.vehicleInstanceId) {
              const v = encounter.vehicles.find(v => v.instanceId === slot.vehicleInstanceId)
              return v ? (v.hullTraumaCurrent >= v.hullTraumaThreshold) : false
            }
            if (slot.adversaryInstanceId) {
              const a = encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
              if (!a) return false
              return a.type !== 'minion' && (a.woundsCurrent ?? 0) >= (a.woundThreshold ?? 99)
            }
            return false
          })()

          // PC data
          const p = !isNPC && slot.characterId ? participants[slot.characterId] : null
          const activeCharId = p?.active_character_id ?? slot.characterId
          const activeChar = !isNPC ? characters.find(c => c.id === activeCharId) : null
          const displayName = activeChar?.name ?? slot.name

          // Wound data
          const pcWT     = activeChar?.wound_threshold ?? 0
          const pcWounds = slot.woundsCurrent ?? activeChar?.wound_current ?? 0
          const pcCrit   = !isNPC && pcWT > 0 && pcWounds >= pcWT

          const advInst = slot.adversaryInstanceId
            ? encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId) ?? null
            : null
          const vehInst = slot.vehicleInstanceId
            ? encounter.vehicles.find(v => v.instanceId === slot.vehicleInstanceId) ?? null
            : null

          return (
            <div
              key={slot.id}
              onMouseEnter={() => setHoveredSlotId(slot.id)}
              onMouseLeave={() => setHoveredSlotId(null)}
              style={{
                position: 'relative',
                background: isKilled ? `${RED}08` : isCurrent ? `${accent}0a` : PANEL_BG,
                border: `1px solid ${isKilled ? `${RED}40` : isCurrent ? `${accent}80` : BORDER}`,
                borderLeft: `3px solid ${accent}`,
                borderRadius: 6,
                opacity: isKilled ? 0.55 : isActed ? 0.48 : 1,
                padding: '8px 10px 8px 12px',
                display: 'flex', flexDirection: 'column', gap: 6,
                transition: '.2s',
                boxShadow: isCurrent ? `0 0 12px ${accent}30` : 'none',
              }}
            >
              {/* ── Row 1: name + badges + remove ─────────────── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                {/* Current indicator */}
                {isCurrent && (
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', background: accent,
                    boxShadow: `0 0 7px ${accent}`, flexShrink: 0,
                    animation: 'pulse-dot 1.2s ease-in-out infinite',
                  }} />
                )}
                {isActed && (
                  <span style={{ fontSize: 11, color: TEAL, flexShrink: 0 }}>✓</span>
                )}

                {/* Name */}
                <span style={{
                  fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT,
                  flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  opacity: isActed ? 0.65 : 1,
                }}>
                  {displayName}
                </span>

                {/* Type badge */}
                <TypeBadge type={isNPC ? (slot.vehicleInstanceId ? 'vehicle' : 'npc') : 'pc'} />

                {/* Alignment toggle for NPC slots */}
                {isNPC && !slot.vehicleInstanceId && (
                  <button
                    onClick={() => void toggleAlignment(slot.id)}
                    title="Toggle alignment"
                    style={{
                      ...smallBtn,
                      width: 'auto', padding: '1px 5px',
                      color: effectiveAlign === 'allied_npc' ? GREEN : RED,
                      borderColor: effectiveAlign === 'allied_npc' ? `${GREEN}50` : `${RED}50`,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                  >
                    {effectiveAlign === 'allied_npc' ? '🤝' : '⚔'}
                  </button>
                )}

                {/* Remove (hover reveal) */}
                {removeConfirm?.slotId === slot.id ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: PANEL_BG, border: `1px solid ${RED}40`,
                    borderRadius: 4, padding: '2px 7px',
                  }}>
                    <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: `${RED}bb`, whiteSpace: 'nowrap' }}>
                      Remove?
                    </span>
                    <button onClick={() => setRemoveConfirm(null)}
                      style={{ ...smallBtn, color: TEXT_MUTED, borderColor: BORDER }}
                    >✕</button>
                    <button onClick={() => void confirmRemove()}
                      style={{ ...smallBtn, color: RED, borderColor: `${RED}50` }}
                    >✓</button>
                  </div>
                ) : hoveredSlotId === slot.id ? (
                  <button
                    onClick={() => {
                      setRemoveConfirm({ slotId: slot.id, isPC: !isNPC, charId: slot.characterId ?? null, name: displayName })
                      setTimeout(() => setRemoveConfirm(p => p?.slotId === slot.id ? null : p), 5000)
                    }}
                    title={`Remove ${displayName}`}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(244,67,54,0.4)', fontSize: 16, lineHeight: 1,
                      padding: '1px 4px', borderRadius: 3, transition: 'color .15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(244,67,54,0.85)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(244,67,54,0.4)' }}
                  >×</button>
                ) : <div style={{ width: 22, flexShrink: 0 }} />}
              </div>

              {/* ── Row 2: wounds + action buttons ────────────── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                {/* PC wounds */}
                {!isNPC && pcWT > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button onClick={() => void adjustPCWound(slot.id, -1)} style={smallBtn}>−</button>
                    <span style={{
                      fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700,
                      color: pcCrit ? RED : pcWounds > 0 ? '#FF9800' : TEXT_MUTED,
                      minWidth: 34, textAlign: 'center',
                      background: `${RED}10`, border: `1px solid ${RED}30`,
                      borderRadius: 3, padding: '1px 4px',
                    }}>
                      {pcWounds}/{pcWT}
                    </span>
                    <button onClick={() => void adjustPCWound(slot.id, 1)} style={smallBtn}>+</button>
                    <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT_MUTED, letterSpacing: '0.1em' }}>W</span>
                  </div>
                )}

                {/* NPC adversary wounds */}
                {advInst && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button onClick={() => void adjustNPCWound(advInst.instanceId, -1)} style={smallBtn}>−</button>
                    <span style={{
                      fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700,
                      color: isKilled ? RED : (advInst.woundsCurrent ?? 0) > 0 ? '#FF9800' : TEXT_MUTED,
                      minWidth: 42, textAlign: 'center',
                      background: `${RED}10`, border: `1px solid ${RED}30`,
                      borderRadius: 3, padding: '1px 4px',
                    }}>
                      {advInst.woundsCurrent ?? 0}/{
                        advInst.type === 'minion'
                          ? `${advInst.woundThreshold}×${advInst.groupSize}`
                          : advInst.woundThreshold
                      }
                    </span>
                    <button onClick={() => void adjustNPCWound(advInst.instanceId, 1)} style={smallBtn}>+</button>
                    <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT_MUTED, letterSpacing: '0.1em' }}>W</span>
                  </div>
                )}

                {/* Vehicle hull trauma */}
                {vehInst && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button onClick={() => void adjustVehicleHull(vehInst.instanceId, -1)} style={smallBtn}>−</button>
                    <span style={{
                      fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700,
                      color: isKilled ? RED : vehInst.hullTraumaCurrent > 0 ? '#FF9800' : TEXT_MUTED,
                      minWidth: 34, textAlign: 'center',
                      background: `${RED}10`, border: `1px solid ${RED}30`,
                      borderRadius: 3, padding: '1px 4px',
                    }}>
                      {vehInst.hullTraumaCurrent}/{vehInst.hullTraumaThreshold}
                    </span>
                    <button onClick={() => void adjustVehicleHull(vehInst.instanceId, 1)} style={smallBtn}>+</button>
                    <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT_MUTED, letterSpacing: '0.1em' }}>HT</span>
                  </div>
                )}

                <div style={{ flex: 1 }} />

                {/* Acted badge / Acted + Skip buttons */}
                {isActed ? (
                  <span style={{
                    fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: TEAL,
                    border: `1px solid ${TEAL}50`, borderRadius: 3, padding: '2px 7px',
                    whiteSpace: 'nowrap',
                  }}>✓ Acted</span>
                ) : isCurrent ? (
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button
                      onClick={() => void handleMarkActed()}
                      style={{ ...ghostBtn, border: `1px solid ${GOLD}60`, color: GOLD, background: `${GOLD}15`, padding: '3px 8px' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${GOLD}22` }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${GOLD}15` }}
                    >Acted</button>
                    <button
                      onClick={() => void handleSkip(trueIdx)}
                      style={{ ...ghostBtn, padding: '3px 8px' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${GOLD}0f` }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >Skip</button>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── TypeBadge ────────────────────────────────────────────── */
function TypeBadge({ type }: { type: 'pc' | 'npc' | 'vehicle' }) {
  const cfg = {
    pc:      { color: BLUE,  label: 'PC' },
    npc:     { color: RED,   label: 'NPC' },
    vehicle: { color: GOLD,  label: 'VEH' },
  }[type]
  return (
    <span style={{
      fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em',
      color: cfg.color, border: `1px solid ${cfg.color}50`,
      borderRadius: 3, padding: '1px 5px', background: `${cfg.color}15`,
      flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}
