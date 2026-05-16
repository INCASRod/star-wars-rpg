'use client'

import { useMemo } from 'react'
import { useCombatParticipants } from '@/hooks/useCombatParticipants'
import { useCharacterPortraits } from '@/hooks/useCharacterPortraits'
import type { Character } from '@/lib/types'
import type { CombatEncounter } from '@/lib/combat'
import { FS_OVERLINE, FS_LABEL } from '@/components/player-hud/design-tokens'
import { HUD } from '@/lib/tokens'

// ── Design tokens ──
const PANEL_BG   = 'var(--hud-surface-lo)'
const BORDER     = 'var(--hud-border)'
const BORDER_MD  = 'var(--hud-border-hi)'
const CHAR_BR    = 'var(--bs-red-sun)'   // adversary slots — vivid red-sun
const CHAR_AG    = 'var(--bs-red-pale)'  // PC/player slots — soft red-pale
const CHAR_WIL   = 'var(--hud-text-dim)' // "acted" checkmark badge
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

  return (
    <>
      {/* ── Turn Strip ── */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 1,
        borderBottom: `1px solid ${BORDER}`, padding: '8px 12px',
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 54, padding: '0 3px' }}>
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: isActed ? 'var(--hud-surface-hi)' : isPC ? `${CHAR_AG}20` : `${CHAR_BR}20`,
                  border: isCurrent
                    ? `2px solid ${ringColor}`
                    : `1px solid ${isPC ? `${CHAR_AG}40` : `${CHAR_BR}40`}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FC, fontSize: FS_LABEL, color: isActed ? 'var(--hud-text-faint)' : isPC ? CHAR_AG : CHAR_BR,
                  position: 'relative', overflow: 'hidden',
                  filter: isActed ? 'grayscale(100%)' : 'none',
                  boxShadow: isCurrent ? `0 0 10px ${ringColor}60` : 'none',
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
                      position: 'absolute', top: -1, right: -1,
                      width: 13, height: 13, borderRadius: '50%',
                      background: CHAR_WIL, border: `1px solid ${BG}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, color: BG, fontWeight: 700,
                    }}>✓</div>
                  )}
                </div>
                {/* "NOW" arrow */}
                {isCurrent && (
                  <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: isPC ? CHAR_AG : CHAR_BR, animation: 'pulse-dot 1.2s ease-in-out infinite', lineHeight: 1 }}>
                    ▲
                  </div>
                )}
                {/* Name */}
                <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, fontWeight: 700, color: isMe ? HUD.gold : TEXT_MUTED, textAlign: 'center', maxWidth: 52, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isMe ? 'YOU' : displayName}
                </div>
              </div>
              {/* Connector dash */}
              {i < encounter.initiative_slots.length - 1 && (
                <div style={{ width: 10, height: 1, background: BORDER_MD, flexShrink: 0 }} />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
