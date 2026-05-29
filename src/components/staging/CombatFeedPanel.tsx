'use client'

import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useEncounterState } from '@/hooks/useEncounterState'
import { useCombatParticipants } from '@/hooks/useCombatParticipants'
import { usePendingDamage } from '@/hooks/usePendingDamage'
import { useEquippedWeapons } from '@/hooks/useEquippedWeapons'
import type { CombatParticipantRow } from '@/hooks/useCombatParticipants'
import type { PendingDamage } from '@/hooks/usePendingDamage'
import type { CharacterWeapon } from '@/hooks/useEquippedWeapons'
import { advanceInitiative } from '@/lib/combat'
import type { CombatEncounter, InitiativeSlot, SlotAlignment } from '@/lib/combat'
import type { Character } from '@/lib/types'
import { applyDamageToAdversary } from '@/lib/damageEngine'
import type { AdversaryInstance } from '@/lib/adversaries'
import { HUD, FS, SP, FONT_BODY, RADIUS, Z, EASE, COLOR } from '@/lib/tokens'

/* ── Design tokens ────────────────────────────────────────── */
const FC         = FONT_BODY
const BG         = 'var(--hud-bg)'
const PANEL_BG   = 'var(--hud-surface-mid)'
const RAISED_BG  = 'var(--hud-surface-lo)'
const BORDER     = 'var(--hud-border)'
const BORDER_MD  = 'var(--hud-border-hi)'
const RED        = COLOR.red          // var(--red)
const BLUE       = COLOR.blue         // var(--blue)
const GREEN      = COLOR.green        // var(--green)
const TEAL       = '#52e0a8'          // no token — keep as-is (used for ✓ Acted indicator)
const TEXT       = HUD.text
const TEXT_MUTED = HUD.textDim

/* ── Props ────────────────────────────────────────────────── */
export interface CombatFeedPanelProps {
  campaignId: string
  characters: Character[]
}

/* ── Ghost button style ───────────────────────────────────── */
const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  border: `1px solid ${BORDER_MD}`,
  borderRadius: RADIUS.md, padding: `${SP[1]} 0.625rem`, cursor: 'pointer',
  fontFamily: FC, fontSize: FS.label, color: TEXT,
  transition: EASE.default, lineHeight: 1,
}
const smallBtn: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${BORDER_MD}`,
  borderRadius: RADIUS.sm, width: '1.375rem', height: '1.375rem', cursor: 'pointer',
  fontFamily: FC, fontSize: FS.sm, color: HUD.textDim,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: EASE.default, lineHeight: 1, flexShrink: 0,
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

  /* ── Combat participants, pending damage, equipped weapons ── */
  const { combatParticipants: participants } = useCombatParticipants(campaignId)
  const { pendingDamages, setPendingDamages, editedDamages, setEditedDamages } = usePendingDamage(campaignId)
  const equippedByChar = useEquippedWeapons(characters.map(c => c.id))

  /* ── Reassign dropdown ───────────────────────────────────── */
  const [reassignSlotId,   setReassignSlotId]   = useState<string | null>(null)
  const [reassignAnchor,   setReassignAnchor]   = useState<DOMRect | null>(null)

  const supabase = createClient()

  /* ── Core save helper ────────────────────────────────────── */
  const saveEncounter = useCallback(async (partial: Partial<CombatEncounter>) => {
    if (!encounter?.id) return
    await supabase
      .from('combat_encounters')
      .update({ ...partial, updated_at: new Date().toISOString() })
      .eq('id', encounter.id)
  }, [encounter?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Pending damage handlers ────────────────────────────── */
  const applyPendingDamage = useCallback(async (pd: PendingDamage, damageAmount: number) => {
    if (!encounter) return
    const targetAdv = pd.target_instance_id
      ? encounter.adversaries.find((a: AdversaryInstance) => a.instanceId === pd.target_instance_id)
      : null

    if (targetAdv) {
      const result = applyDamageToAdversary({
        type:           targetAdv.type,
        name:           targetAdv.name,
        woundThreshold: targetAdv.woundThreshold,
        groupSize:      targetAdv.groupSize,
        groupRemaining: targetAdv.groupRemaining,
        woundsCurrent:  targetAdv.woundsCurrent ?? 0,
      }, damageAmount)

      const updatedAdversaries = encounter.adversaries.map((a: AdversaryInstance) =>
        a.instanceId === pd.target_instance_id
          ? { ...a, woundsCurrent: result.woundsCurrent, groupRemaining: result.groupRemaining }
          : a
      )
      await saveEncounter({ adversaries: updatedAdversaries })

      if (result.defeatMessage && encounter.id) {
        await supabase.from('combat_log').insert({
          campaign_id: campaignId, encounter_id: encounter.id,
          participant_name: 'SYSTEM', alignment: 'system', roll_type: 'system',
          result_summary: result.defeatMessage, is_visible_to_players: true,
        })
      }
    }

    const isModified = damageAmount !== pd.net_damage
    await supabase.from('pending_damage').update({
      status:         isModified ? 'modified' : 'applied',
      applied_damage: damageAmount,
      resolved_at:    new Date().toISOString(),
    }).eq('id', pd.id)
    setEditedDamages(prev => { const next = { ...prev }; delete next[pd.id]; return next })
  }, [encounter, campaignId, saveEncounter]) // eslint-disable-line react-hooks/exhaustive-deps

  const dismissPendingDamage = useCallback(async (id: string) => {
    await supabase.from('pending_damage').update({
      status: 'dismissed', resolved_at: new Date().toISOString(),
    }).eq('id', id)
    setEditedDamages(prev => { const next = { ...prev }; delete next[id]; return next })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReassign = useCallback(async (defaultCharId: string, newCharId: string, newCharName: string) => {
    const isRestoringDefault = newCharId === (participants[defaultCharId]?.default_character_id ?? defaultCharId)
    await supabase.from('combat_participants').update({
      active_character_id:      isRestoringDefault ? null : newCharId,
      active_character_name:    isRestoringDefault ? null : newCharName,
      active_weapon_key:        null,
      active_weapon_name:       null,
      secondary_weapon_name:    null,
      secondary_weapon_key:     null,
    }).eq('campaign_id', campaignId).eq('character_id', defaultCharId)
  }, [campaignId, participants]) // eslint-disable-line react-hooks/exhaustive-deps

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
      <div style={{ padding: `${SP[8]} ${SP[4]}`, textAlign: 'center', fontFamily: FC, fontSize: FS.sm, color: HUD.textDim }}>
        Loading…
      </div>
    )
  }

  if (!encounter) {
    return (
      <div style={{
        padding: `2.5rem ${SP[4]}`, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '0.625rem',
      }}>
        <div style={{ fontSize: '1.75rem', opacity: 0.3 }}>⚔</div>
        <div style={{ fontFamily: FC, fontSize: FS.sm, color: HUD.textDim, textAlign: 'center' }}>
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
        padding: `0.625rem 0.875rem`, display: 'flex', flexDirection: 'column', gap: SP[2],
      }}>
        {/* Row 1: Round badge + acting banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Round */}
          <div style={{
            background: `color-mix(in srgb, ${HUD.gold} 9%, transparent)`, border: `1px solid color-mix(in srgb, ${HUD.gold} 25%, transparent)`,
            borderRadius: RADIUS.md, padding: `${SP[1]} 0.625rem`, flexShrink: 0,
            display: 'flex', alignItems: 'baseline', gap: '0.3125rem',
          }}>
            <span style={{ fontFamily: FC, fontSize: FS.caption, color: HUD.textDim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Round</span>
            <span style={{ fontFamily: FC, fontSize: FS.h4, fontWeight: 700, color: HUD.gold, lineHeight: 1 }}>{encounter.round}</span>
          </div>

          {/* Acting now banner */}
          {currentSlot && (
            <div style={{
              flex: 1, background: `${bannerColor}15`, border: `1px solid ${bannerColor}50`,
              borderRadius: RADIUS.md, padding: `0.3125rem 0.625rem`,
              display: 'flex', alignItems: 'center', gap: '0.4375rem', minWidth: 0,
            }}>
              <div style={{
                width: '0.4375rem', height: '0.4375rem', borderRadius: RADIUS.full, background: bannerColor,
                boxShadow: `0 0 8px ${bannerColor}`, flexShrink: 0,
                animation: 'pulse-dot 1.4s ease-in-out infinite',
              }} />
              <span style={{
                fontFamily: FC, fontSize: FS.label, color: bannerColor, fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {currentSlot.name}
              </span>
            </div>
          )}
        </div>

        {/* Row 2: Prev / Acted / Skip controls */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button
            onClick={() => void handlePrev()}
            className="hov-gold-bg"
            style={ghostBtn}
          >← Prev</button>
          <button
            onClick={() => void handleMarkActed()}
            className="hov-gold-bg"
            style={{ ...ghostBtn, border: `1px solid color-mix(in srgb, ${HUD.gold} 38%, transparent)`, color: HUD.gold, background: `color-mix(in srgb, ${HUD.gold} 8%, transparent)` }}
          >✓ Acted / Next →</button>
        </div>
      </div>

      {/* ── Pending Damage ───────────────────────────────────── */}
      {pendingDamages.length > 0 && (
        <div style={{
          flexShrink: 0, padding: `0.625rem ${SP[3]}`,
          borderBottom: `1px solid rgba(224,82,82,0.25)`,
          display: 'flex', flexDirection: 'column', gap: SP[2],
          background: 'rgba(224,82,82,0.04)',
        }}>
          {/* Section header */}
          <div style={{
            fontFamily: FC, fontSize: FS.label, fontWeight: 700,
            color: RED, textTransform: 'uppercase', letterSpacing: '0.15em',
            display: 'flex', alignItems: 'center', gap: '0.375rem',
          }}>
            ⚔ Pending Damage
            <span style={{
              fontFamily: FC, fontSize: FS.overline,
              background: 'rgba(224,82,82,0.15)', border: '1px solid rgba(224,82,82,0.3)',
              borderRadius: RADIUS.sm, padding: '1px 5px', color: RED,
            }}>{pendingDamages.length}</span>
          </div>

          {pendingDamages.map(pd => {
            const editedVal  = editedDamages[pd.id] ?? pd.net_damage
            const setEdited  = (v: number) => setEditedDamages(prev => ({ ...prev, [pd.id]: Math.max(0, v) }))
            const isSecondary = pd.status === 'pending_secondary'

            return (
              <div key={pd.id} style={{
                background:   isSecondary ? `color-mix(in srgb, ${HUD.gold} 3%, transparent)` : 'rgba(224,82,82,0.06)',
                border:       isSecondary ? `1px solid color-mix(in srgb, ${HUD.gold} 25%, transparent)` : '1px solid rgba(224,82,82,0.3)',
                borderRadius: RADIUS.lg, padding: `0.625rem`,
              }}>
                {/* Secondary hit label */}
                {isSecondary && (
                  <div style={{
                    fontFamily: FC, fontSize: FS.caption, fontWeight: 700,
                    color: HUD.gold, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.375rem',
                  }}>⚔ Secondary Hit Available</div>
                )}

                {/* Attacker → Target */}
                <div style={{ fontFamily: FC, fontSize: FS.sm, fontWeight: 700, color: HUD.gold, marginBottom: 2 }}>
                  {pd.attacker_name} → {pd.target_name}
                </div>

                {/* Weapon line */}
                {pd.weapon_name && (
                  <div style={{ fontFamily: FC, fontSize: FS.label, color: HUD.textDim, fontStyle: 'italic', marginBottom: '0.375rem' }}>
                    {pd.weapon_name}
                    {pd.attack_type && ` (${pd.attack_type.charAt(0).toUpperCase() + pd.attack_type.slice(1)})`}
                    {pd.range_band  && ` · ${pd.range_band.charAt(0).toUpperCase() + pd.range_band.slice(1)}`}
                  </div>
                )}

                {isSecondary && (
                  <div style={{ fontFamily: FC, fontSize: FS.caption, color: HUD.textDim, fontStyle: 'italic', marginBottom: '0.375rem' }}>
                    Requires ◇◇ or ★ to hit. Confirm before applying.
                  </div>
                )}

                {/* Damage breakdown */}
                <div style={{ marginBottom: SP[2], display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: FC, fontSize: FS.label, color: HUD.textDim }}>Raw</span>
                    <span style={{ fontFamily: FC, fontSize: FS.label, color: HUD.textDim }}>{pd.raw_damage}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: FC, fontSize: FS.label, color: BLUE }}>Soak</span>
                    <span style={{ fontFamily: FC, fontSize: FS.label, color: BLUE }}>− {pd.soak_value}</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    borderTop: `1px solid ${BORDER}`, paddingTop: 3, marginTop: 1,
                  }}>
                    <span style={{ fontFamily: FC, fontSize: FS.sm, fontWeight: 700, color: HUD.gold }}>Net</span>
                    <span style={{ fontFamily: FC, fontSize: FS.sm, fontWeight: 700, color: HUD.gold }}>{pd.net_damage}</span>
                  </div>
                </div>

                {/* Critical notification */}
                {pd.crit_eligible && (
                  <div style={{
                    marginBottom: SP[2], padding: `0.375rem ${SP[2]}`,
                    background: 'rgba(255,152,0,0.08)', border: '1px solid rgba(255,152,0,0.4)',
                    borderRadius: RADIUS.md,
                  }}>
                    <div style={{ fontFamily: FC, fontSize: FS.caption, fontWeight: 700, color: COLOR.amber, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                      ⚠ Crit Available{isSecondary ? ' (if secondary hits)' : ''}
                    </div>
                    <div style={{ fontFamily: FC, fontSize: FS.caption, color: `${COLOR.amber}cc` }}>
                      {pd.crit_triggered_by_triumph ? 'Triumph' : `Crit ${pd.crit_rating ?? 4}`}
                      {pd.crit_modifier > 0 && ` · Roll +${pd.crit_modifier}`}
                    </div>
                  </div>
                )}

                {/* Editable apply value */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: SP[2] }}>
                  <span style={{ fontFamily: FC, fontSize: FS.label, color: HUD.textDim }}>
                    {isSecondary ? 'Secondary dmg:' : 'Apply:'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <button
                      onClick={() => setEdited(editedVal - 1)} disabled={editedVal <= 0}
                      style={{ ...smallBtn, color: editedVal <= 0 ? HUD.textDim : HUD.gold, borderColor: BORDER_MD }}
                    >−</button>
                    <span style={{ fontFamily: FC, fontSize: FS.sm, fontWeight: 700, color: HUD.gold, minWidth: '1.5rem', textAlign: 'center' }}>
                      {editedVal}
                    </span>
                    <button
                      onClick={() => setEdited(editedVal + 1)}
                      style={{ ...smallBtn, color: HUD.gold, borderColor: BORDER_MD, background: `color-mix(in srgb, ${HUD.gold} 6%, transparent)` }}
                    >+</button>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button
                    onClick={() => void dismissPendingDamage(pd.id)}
                    style={{
                      flex: 1, padding: `0.375rem 0`,
                      background: 'transparent', border: `1px solid ${BORDER_MD}`,
                      borderRadius: RADIUS.md, cursor: 'pointer',
                      fontFamily: FC, fontSize: FS.label, color: HUD.textDim,
                    }}
                  >{isSecondary ? '✗ No Hit' : '✗ Dismiss'}</button>
                  <button
                    onClick={() => void applyPendingDamage(pd, editedVal)}
                    style={{
                      flex: 2, padding: `0.375rem 0`,
                      background: isSecondary ? `color-mix(in srgb, ${HUD.gold} 9%, transparent)` : 'rgba(224,82,82,0.15)',
                      border:     isSecondary ? `1px solid color-mix(in srgb, ${HUD.gold} 31%, transparent)` : '1px solid rgba(224,82,82,0.5)',
                      borderRadius: RADIUS.md, cursor: 'pointer',
                      fontFamily: FC, fontSize: FS.label, fontWeight: 700,
                      color: isSecondary ? HUD.gold : RED,
                    }}
                  >{isSecondary ? '✓ Apply Secondary' : '✓ Apply Damage'}</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Slot list ─────────────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: `0.625rem ${SP[3]}`, display: 'flex', flexDirection: 'column', gap: '0.375rem',
      }}>
        {slots.length === 0 && (
          <div style={{ padding: `1.5rem 0`, textAlign: 'center', fontFamily: FC, fontSize: FS.sm, color: HUD.textDim, fontStyle: 'italic' }}>
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
          const defaultCharId = p?.default_character_id ?? slot.characterId
          const activeCharId  = p?.active_character_id ?? slot.characterId
          const activeChar    = !isNPC ? characters.find(c => c.id === activeCharId) : null
          const displayName   = activeChar?.name ?? slot.name
          const isReassigned  = !isNPC && !!p?.active_character_id && p.active_character_id !== defaultCharId
          const defaultChar   = isReassigned ? characters.find(c => c.id === defaultCharId) : null

          // Weapon data
          const isDualSelected = !isNPC && !!p?.active_weapon_name && !!p?.secondary_weapon_name
          const hasSingleSelected = !isNPC && !!p?.active_weapon_name && !p?.secondary_weapon_name
          const pcEquipped = !isNPC && activeCharId ? (equippedByChar[activeCharId] ?? []) : []

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
                borderRadius: RADIUS.lg,
                opacity: isKilled ? 0.55 : isActed ? 0.48 : 1,
                padding: `${SP[2]} 0.625rem ${SP[2]} ${SP[3]}`,
                display: 'flex', flexDirection: 'column', gap: '0.375rem',
                transition: EASE.default,
                boxShadow: isCurrent ? `0 0 12px ${accent}30` : 'none',
              }}
            >
              {/* ── Row 1: name + badges + remove ─────────────── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>

                {/* Current indicator */}
                {isCurrent && (
                  <div style={{
                    width: '0.4375rem', height: '0.4375rem', borderRadius: RADIUS.full, background: accent,
                    boxShadow: `0 0 7px ${accent}`, flexShrink: 0,
                    animation: 'pulse-dot 1.2s ease-in-out infinite',
                  }} />
                )}
                {isActed && (
                  <span style={{ fontSize: '0.6875rem', color: TEAL, flexShrink: 0 }}>✓</span>
                )}

                {/* Name + reassigned indicator */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{
                    fontFamily: FC, fontSize: FS.sm, fontWeight: 700, color: TEXT,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    opacity: isActed ? 0.65 : 1,
                  }}>
                    {displayName}
                  </span>
                  {isReassigned && defaultChar && (
                    <span style={{ fontFamily: FC, fontSize: FS.caption, color: HUD.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      ↳ {defaultChar.name}
                    </span>
                  )}
                </div>

                {/* Type badge */}
                <TypeBadge type={isNPC ? (slot.vehicleInstanceId ? 'vehicle' : 'npc') : 'pc'} />

                {/* Reassign button for PC slots */}
                {!isNPC && (
                  <button
                    onClick={e => {
                      if (reassignSlotId === slot.id) {
                        setReassignSlotId(null); setReassignAnchor(null)
                      } else {
                        setReassignSlotId(slot.id)
                        setReassignAnchor(e.currentTarget.getBoundingClientRect())
                      }
                    }}
                    title="Reassign character"
                    style={{
                      ...smallBtn,
                      width: 'auto', padding: '1px 6px',
                      color: isReassigned ? HUD.gold : HUD.textDim,
                      borderColor: isReassigned ? `color-mix(in srgb, ${HUD.gold} 31%, transparent)` : BORDER_MD,
                      background: isReassigned ? `color-mix(in srgb, ${HUD.gold} 6%, transparent)` : 'transparent',
                      fontSize: '0.75rem',
                    }}
                  >⇄</button>
                )}

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
                    display: 'flex', alignItems: 'center', gap: '0.3125rem',
                    background: PANEL_BG, border: `1px solid ${RED}40`,
                    borderRadius: RADIUS.md, padding: `2px 0.4375rem`,
                  }}>
                    <span style={{ fontFamily: FC, fontSize: FS.caption, color: `${RED}bb`, whiteSpace: 'nowrap' }}>
                      Remove?
                    </span>
                    <button onClick={() => setRemoveConfirm(null)}
                      style={{ ...smallBtn, color: HUD.textDim, borderColor: BORDER }}
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
                      color: 'rgba(244,67,54,0.4)', fontSize: '1rem', lineHeight: 1,
                      padding: '1px 4px', borderRadius: RADIUS.sm, transition: `color ${EASE.default}`,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(244,67,54,0.85)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(244,67,54,0.4)' }}
                  >×</button>
                ) : <div style={{ width: '1.375rem', flexShrink: 0 }} />}
              </div>

              {/* ── Weapon row (PC only) ──────────────────────── */}
              {!isNPC && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1], minHeight: '1.125rem' }}>
                  {isDualSelected ? (
                    <div style={{
                      display: 'flex', flexDirection: 'column', gap: 2,
                      background: `${GREEN}0e`, border: `1px solid ${GREEN}40`,
                      borderRadius: RADIUS.sm, padding: `2px 0.4375rem`,
                    }}>
                      <span style={{ fontFamily: FC, fontSize: FS.caption, color: TEAL, letterSpacing: '0.06em' }}>⚔⚔ SELECTED</span>
                      <span style={{ fontFamily: FC, fontSize: FS.caption, color: GREEN }}>▸ {p!.active_weapon_name}</span>
                      <span style={{ fontFamily: FC, fontSize: FS.caption, color: `${GREEN}bb` }}>▸ {p!.secondary_weapon_name}</span>
                    </div>
                  ) : hasSingleSelected ? (
                    <span style={{
                      fontFamily: FC, fontSize: FS.caption, color: GREEN,
                      background: `${GREEN}12`, border: `1px solid ${GREEN}40`,
                      borderRadius: RADIUS.sm, padding: `2px 0.4375rem`, whiteSpace: 'nowrap',
                    }}>
                      ⚔ {p!.active_weapon_name}
                    </span>
                  ) : pcEquipped.length > 0 ? (
                    pcEquipped.map(ew => (
                      <span key={ew.id} style={{
                        fontFamily: FC, fontSize: FS.caption, color: HUD.textDim,
                        background: 'var(--hud-surface-lo)', border: `1px solid ${BORDER}`,
                        borderRadius: RADIUS.sm, padding: `2px 0.4375rem`, whiteSpace: 'nowrap',
                      }}>
                        ⚔ {ew.custom_name || ew.weapon_key}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontFamily: FC, fontSize: FS.caption, color: HUD.textDim, fontStyle: 'italic' }}>
                      no weapon equipped
                    </span>
                  )}
                </div>
              )}

              {/* ── Row 2: wounds + action buttons ────────────── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>

                {/* PC wounds */}
                {!isNPC && pcWT > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
                    <button onClick={() => void adjustPCWound(slot.id, -1)} style={smallBtn}>−</button>
                    <span style={{
                      fontFamily: FC, fontSize: FS.label, fontWeight: 700,
                      color: pcCrit ? RED : pcWounds > 0 ? COLOR.amber : HUD.textDim,
                      minWidth: '2.125rem', textAlign: 'center',
                      background: `${RED}10`, border: `1px solid ${RED}30`,
                      borderRadius: RADIUS.sm, padding: '1px 4px',
                    }}>
                      {pcWounds}/{pcWT}
                    </span>
                    <button onClick={() => void adjustPCWound(slot.id, 1)} style={smallBtn}>+</button>
                    <span style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textDim, letterSpacing: '0.1em' }}>W</span>
                  </div>
                )}

                {/* NPC adversary wounds */}
                {advInst && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
                    <button onClick={() => void adjustNPCWound(advInst.instanceId, -1)} style={smallBtn}>−</button>
                    <span style={{
                      fontFamily: FC, fontSize: FS.label, fontWeight: 700,
                      color: isKilled ? RED : (advInst.woundsCurrent ?? 0) > 0 ? COLOR.amber : HUD.textDim,
                      minWidth: '2.625rem', textAlign: 'center',
                      background: `${RED}10`, border: `1px solid ${RED}30`,
                      borderRadius: RADIUS.sm, padding: '1px 4px',
                    }}>
                      {advInst.woundsCurrent ?? 0}/{
                        advInst.type === 'minion'
                          ? `${advInst.woundThreshold}×${advInst.groupSize}`
                          : advInst.woundThreshold
                      }
                    </span>
                    <button onClick={() => void adjustNPCWound(advInst.instanceId, 1)} style={smallBtn}>+</button>
                    <span style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textDim, letterSpacing: '0.1em' }}>W</span>
                  </div>
                )}

                {/* Vehicle hull trauma */}
                {vehInst && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
                    <button onClick={() => void adjustVehicleHull(vehInst.instanceId, -1)} style={smallBtn}>−</button>
                    <span style={{
                      fontFamily: FC, fontSize: FS.label, fontWeight: 700,
                      color: isKilled ? RED : vehInst.hullTraumaCurrent > 0 ? COLOR.amber : HUD.textDim,
                      minWidth: '2.125rem', textAlign: 'center',
                      background: `${RED}10`, border: `1px solid ${RED}30`,
                      borderRadius: RADIUS.sm, padding: '1px 4px',
                    }}>
                      {vehInst.hullTraumaCurrent}/{vehInst.hullTraumaThreshold}
                    </span>
                    <button onClick={() => void adjustVehicleHull(vehInst.instanceId, 1)} style={smallBtn}>+</button>
                    <span style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textDim, letterSpacing: '0.1em' }}>HT</span>
                  </div>
                )}

                <div style={{ flex: 1 }} />

                {/* Acted badge / Acted + Skip buttons */}
                {isActed ? (
                  <span style={{
                    fontFamily: FC, fontSize: FS.label, fontWeight: 700, color: TEAL,
                    border: `1px solid ${TEAL}50`, borderRadius: RADIUS.sm, padding: `2px 0.4375rem`,
                    whiteSpace: 'nowrap',
                  }}>✓ Acted</span>
                ) : isCurrent ? (
                  <div style={{ display: 'flex', gap: '0.3125rem' }}>
                    <button
                      onClick={() => void handleMarkActed()}
                      className="hov-gold-bg"
                      style={{ ...ghostBtn, border: `1px solid color-mix(in srgb, ${HUD.gold} 38%, transparent)`, color: HUD.gold, background: `color-mix(in srgb, ${HUD.gold} 8%, transparent)`, padding: `0.1875rem ${SP[2]}` }}
                    >Acted</button>
                    <button
                      onClick={() => void handleSkip(trueIdx)}
                      className="hov-gold-bg"
                      style={{ ...ghostBtn, padding: `0.1875rem ${SP[2]}` }}
                    >Skip</button>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Reassign dropdown (portal) ────────────────────── */}
      {reassignSlotId && reassignAnchor && typeof document !== 'undefined' && (() => {
        const slot = encounter.initiative_slots.find(s => s.id === reassignSlotId)
        if (!slot || slot.type === 'npc') return null
        const participant   = slot.characterId ? participants[slot.characterId] : null
        const activeCharId  = participant?.active_character_id ?? slot.characterId
        const defaultCharId = participant?.default_character_id ?? slot.characterId
        const top   = reassignAnchor.bottom + 4
        const right = window.innerWidth - reassignAnchor.right

        return createPortal(
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: Z.backdrop }}
              onClick={() => { setReassignSlotId(null); setReassignAnchor(null) }}
            />
            <div style={{
              position: 'fixed', top, right, zIndex: Z.modal,
              background: 'var(--hud-surface-hi)', border: `1px solid ${BORDER_MD}`,
              borderRadius: RADIUS.lg, backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)', minWidth: '12.5rem',
              padding: `${SP[1]} 0`, boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            }}>
              <div style={{
                padding: `2px ${SP[3]} ${SP[1]}`, fontFamily: FC, fontSize: FS.caption,
                color: HUD.textDim, borderBottom: `1px solid ${BORDER}`, marginBottom: SP[1],
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                Assign slot to:
              </div>

              {characters.map(c => {
                const isActive  = c.id === activeCharId
                const isDefault = c.id === defaultCharId
                const hasActed  = participants[c.id]?.has_acted_this_round ?? false
                return (
                  <button
                    key={c.id}
                    disabled={hasActed}
                    onClick={() => {
                      if (!slot.characterId) return
                      void handleReassign(slot.characterId, c.id, c.name)
                      setReassignSlotId(null); setReassignAnchor(null)
                    }}
                    style={{
                      width: '100%', padding: `${SP[1]} ${SP[3]}`,
                      background: isActive ? `${BLUE}10` : 'transparent',
                      border: 'none', cursor: hasActed ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: SP[2],
                      opacity: hasActed ? 0.38 : 1, transition: EASE.default,
                    }}
                    onMouseEnter={e => { if (!hasActed) (e.currentTarget as HTMLElement).style.background = `${BLUE}18` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isActive ? `${BLUE}10` : 'transparent' }}
                  >
                    <span style={{ fontFamily: FC, fontSize: FS.caption, color: BLUE, width: '0.75rem', flexShrink: 0 }}>
                      {isActive ? '●' : '○'}
                    </span>
                    <span style={{ fontFamily: FC, fontSize: FS.sm, color: hasActed ? HUD.textDim : TEXT, flex: 1, textAlign: 'left' }}>
                      {c.name}
                    </span>
                    {isDefault && (
                      <span style={{ fontFamily: FC, fontSize: FS.caption, color: HUD.textDim, fontStyle: 'italic', flexShrink: 0 }}>
                        default
                      </span>
                    )}
                    {hasActed && (
                      <span style={{ fontFamily: FC, fontSize: FS.caption, color: HUD.textDim, fontStyle: 'italic', flexShrink: 0 }}>
                        acted
                      </span>
                    )}
                  </button>
                )
              })}

              <div style={{ padding: `${SP[1]} ${SP[3]} 2px`, borderTop: `1px solid ${BORDER}`, marginTop: SP[1] }}>
                <button
                  onClick={() => { setReassignSlotId(null); setReassignAnchor(null) }}
                  style={{ ...ghostBtn, fontSize: FS.caption }}
                >Cancel</button>
              </div>
            </div>
          </>,
          document.body,
        )
      })()}
    </div>
  )
}

/* ── TypeBadge ────────────────────────────────────────────── */
function TypeBadge({ type }: { type: 'pc' | 'npc' | 'vehicle' }) {
  const cfg = {
    pc:      { color: BLUE,      label: 'PC' },
    npc:     { color: RED,       label: 'NPC' },
    vehicle: { color: HUD.gold,  label: 'VEH' },
  }[type]
  return (
    <span style={{
      fontFamily: FC, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em',
      color: cfg.color, border: `1px solid ${cfg.color}50`,
      borderRadius: RADIUS.sm, padding: '1px 5px', background: `${cfg.color}15`,
      flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}
