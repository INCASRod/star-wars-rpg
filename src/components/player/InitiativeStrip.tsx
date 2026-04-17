'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/lib/types'
import type { CombatEncounter } from '@/lib/combat'
import { FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_H4, FS_H3 } from '@/components/player-hud/design-tokens'

// ── Design tokens (mirrored from CombatTracker) ──
const RAISED_BG  = 'rgba(14,26,18,0.9)'
const PANEL_BG   = 'rgba(8,16,10,0.88)'
const GOLD       = '#C8AA50'
const BORDER     = 'rgba(200,170,80,0.18)'
const BORDER_MD  = 'rgba(200,170,80,0.32)'
const CHAR_BR    = '#e05252'
const CHAR_AG    = '#52a8e0'
const CHAR_WIL   = '#52e0a8'
const TEXT       = '#E8DFC8'
const TEXT_MUTED = 'rgba(232,223,200,0.35)'
const BG         = '#060D09'
const FC  = "'Rajdhani', sans-serif"
const FM  = "'Rajdhani', sans-serif"

interface Props {
  encounter:  CombatEncounter
  character:  Character
}

export function InitiativeStrip({ encounter, character }: Props) {
  const supabase = createClient()
  // Active character assignments keyed by default character_id
  const [slotAssignments, setSlotAssignments] = useState<Record<string, string | null>>({})
  // Portrait URLs keyed by characterId
  const [portraits, setPortraits] = useState<Record<string, string>>({})

  // Subscribe to combat_participants for real-time slot assignment updates
  useEffect(() => {
    const cid = encounter.campaign_id
    if (!cid) return
    supabase
      .from('combat_participants')
      .select('character_id, active_character_name')
      .eq('campaign_id', cid)
      .eq('slot_type', 'pc')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string | null> = {}
        for (const r of data as { character_id: string; active_character_name: string | null }[]) {
          map[r.character_id] = r.active_character_name
        }
        setSlotAssignments(map)
      })
    const ch = supabase
      .channel(`is-participants-${cid}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'combat_participants',
        filter: `campaign_id=eq.${cid}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const old = payload.old as { character_id: string }
          setSlotAssignments(prev => {
            const next = { ...prev }
            delete next[old.character_id]
            return next
          })
        } else if (payload.new) {
          const r = payload.new as { character_id: string; active_character_name: string | null; slot_type: string }
          if (r.slot_type === 'pc') {
            setSlotAssignments(prev => ({ ...prev, [r.character_id]: r.active_character_name }))
          }
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [encounter.campaign_id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch portrait URLs for all PC slots in the encounter
  useEffect(() => {
    const ids = encounter.initiative_slots
      .filter(s => s.type === 'pc' && s.characterId)
      .map(s => s.characterId as string)
    if (ids.length === 0) return
    supabase
      .from('characters')
      .select('id, portrait_url')
      .in('id', ids)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string> = {}
        for (const row of data as { id: string; portrait_url: string | null }[]) {
          if (row.portrait_url) map[row.id] = row.portrait_url
        }
        setPortraits(map)
      })
  }, [encounter.initiative_slots]) // eslint-disable-line react-hooks/exhaustive-deps

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
          <div style={{ fontFamily: FC, fontSize: FS_H3, fontWeight: 700, color: GOLD, lineHeight: 1 }}>{encounter.round}</div>
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
                <div style={{ fontFamily: FM, fontSize: FS_LABEL, fontWeight: 700, color: isMe ? GOLD : TEXT_MUTED, textAlign: 'center', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
