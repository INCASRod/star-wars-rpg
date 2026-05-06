'use client'

import { useMemo } from 'react'
import { useCombatParticipants } from '@/hooks/useCombatParticipants'
import { useCharacterPortraits } from '@/hooks/useCharacterPortraits'
import type { Character } from '@/lib/types'
import type { CombatEncounter } from '@/lib/combat'
import { FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_H4, FS_H3 } from '@/components/player-hud/design-tokens'
import { HUD } from '@/lib/tokens'

// ── Design tokens (mirrored from CombatTracker) ──
const RAISED_BG  = 'var(--hud-surface-mid)'
const PANEL_BG   = 'var(--hud-surface-lo)'
const BORDER     = 'var(--hud-border)'
const BORDER_MD  = 'var(--hud-border-hi)'
const CHAR_BR    = '#e05252'
const CHAR_AG    = '#52a8e0'
const CHAR_WIL   = '#52e0a8'
const TEXT       = 'var(--hud-text)'
const TEXT_MUTED = 'var(--hud-text-faint)'
const BG         = 'var(--hud-bg)'
const FC  = 'var(--font-body)'
const FM  = 'var(--font-body)'

interface Props {
  encounter:  CombatEncounter
  character:  Character
}

export function InitiativeStrip({ encounter, character }: Props) {
  const { combatParticipants } = useCombatParticipants(encounter.campaign_id ?? '')

  // Derive slot assignments (character_id → active_character_name) from the hook
  const slotAssignments = useMemo<Record<string, string | null>>(() => {
    const map: Record<string, string | null> = {}
    for (const row of Object.values(combatParticipants)) {
      if (row.slot_type === 'pc') map[row.character_id] = row.active_character_name
    }
    return map
  }, [combatParticipants])

  // Fetch portraits for all PC slots in the encounter
  const pcSlotIds = useMemo(
    () => encounter.initiative_slots
      .filter(s => s.type === 'pc' && s.characterId)
      .map(s => s.characterId as string),
    [encounter.initiative_slots],
  )
  const portraits = useCharacterPortraits(pcSlotIds)

  const currentSlot = encounter.initiative_slots[encounter.current_slot_index]
  const isMyTurn = currentSlot?.characterId === character.id

  return (
    <>
      {/* ── Header Bar ── */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 1,
        background: RAISED_BG, borderBottom: `1px solid ${BORDER}`,
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {/* Character info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: TEXT }}>{character.name}</div>
          <div style={{ fontFamily: FM, fontSize: FS_CAPTION, color: TEXT_MUTED }}>{character.species_key} · {character.career_key}</div>
        </div>

        {/* Combat Active badge */}
        <div style={{
          background: `${CHAR_BR}18`, border: `1px solid ${CHAR_BR}60`,
          borderRadius: 4, padding: '5px 12px',
          display: 'flex', alignItems: 'center', gap: 6,
          animation: 'pulse-border 2s ease-in-out infinite',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: CHAR_BR, boxShadow: `0 0 6px ${CHAR_BR}` }} />
          <span style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.15em', color: CHAR_BR }}>
            COMBAT ACTIVE
          </span>
        </div>

        {/* Round */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FC, fontSize: FS_H3, fontWeight: 700, color: HUD.gold, lineHeight: 1 }}>{encounter.round}</div>
          <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Round</div>
        </div>
      </div>

      {/* ── Your Turn Alert ── */}
      {isMyTurn && (
        <div style={{
          flexShrink: 0, position: 'relative', zIndex: 1,
          background: `${CHAR_AG}18`, border: `1px solid ${CHAR_AG}60`,
          padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: `0 0 20px ${CHAR_AG}20`,
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: CHAR_AG,
            boxShadow: `0 0 10px ${CHAR_AG}`, flexShrink: 0,
            animation: 'pulse-dot 1s ease-in-out infinite',
          }} />
          <span style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: CHAR_AG, letterSpacing: '0.1em' }}>
            IT&apos;S YOUR TURN — {character.name} is acting now
          </span>
        </div>
      )}

      {/* ── Turn Strip ── */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 1,
        borderBottom: `1px solid ${BORDER}`, padding: '12px 16px',
        overflowX: 'auto', display: 'flex', alignItems: 'center', gap: 0,
        background: PANEL_BG,
      }}>
        {encounter.initiative_slots.map((slot, i) => {
          const isPC = slot.type === 'pc'
          const isCurrent = slot.current
          const isActed = slot.acted
          // Resolve active character for PC slots (may be reassigned by GM)
          const activeName = isPC && slot.characterId
            ? (slotAssignments[slot.characterId] ?? slot.name)
            : slot.name
          const isMe = isPC && (
            slot.characterId === character.id ||
            activeName === character.name
          )
          const adv = slot.adversaryInstanceId
            ? encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
            : null
          const isRevealed = adv?.revealed ?? true
          const displayName = !isPC && !isRevealed ? '???' : activeName
          const ringColor = isCurrent ? (isPC ? CHAR_AG : CHAR_BR) : 'transparent'

          return (
            <div key={slot.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 70, padding: '0 4px' }}>
                {/* Avatar */}
                <div style={{
                  width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                  background: isActed ? '#1a1a1a' : isPC ? `${CHAR_AG}20` : `${CHAR_BR}20`,
                  border: isCurrent
                    ? `3px solid ${ringColor}`
                    : `2px solid ${isPC ? `${CHAR_AG}40` : `${CHAR_BR}40`}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FC, fontSize: FS_H4, color: isActed ? '#555' : isPC ? CHAR_AG : CHAR_BR,
                  position: 'relative', overflow: 'hidden',
                  filter: isActed ? 'grayscale(100%)' : 'none',
                  boxShadow: isCurrent ? `0 0 16px ${ringColor}60` : 'none',
                  transition: '.3s',
                }}>
                  {isPC && slot.characterId && portraits[slot.characterId] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={portraits[slot.characterId]}
                      alt={displayName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                  {/* Acted checkmark */}
                  {isActed && (
                    <div style={{
                      position: 'absolute', top: -2, right: -2,
                      width: 16, height: 16, borderRadius: '50%',
                      background: CHAR_WIL, border: `2px solid ${BG}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: FS_LABEL, color: BG, fontWeight: 700,
                    }}>✓</div>
                  )}
                </div>
                {/* "NOW" label */}
                {isCurrent && (
                  <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: CHAR_AG, letterSpacing: '0.15em', animation: 'pulse-dot 1.2s ease-in-out infinite' }}>
                    ▲ NOW
                  </div>
                )}
                {/* Name */}
                <div style={{ fontFamily: FM, fontSize: FS_LABEL, fontWeight: 700, color: isMe ? HUD.gold : TEXT_MUTED, textAlign: 'center', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isMe ? `YOU · ` : ''}{displayName}
                </div>
              </div>
              {/* Connector dash */}
              {i < encounter.initiative_slots.length - 1 && (
                <div style={{ width: 20, height: 1, background: BORDER_MD, flexShrink: 0 }} />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
