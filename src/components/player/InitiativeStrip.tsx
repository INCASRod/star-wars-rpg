'use client'

import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useCombatParticipants } from '@/hooks/useCombatParticipants'
import { useCharacterPortraits } from '@/hooks/useCharacterPortraits'
import { useAdversaryTokenImages } from '@/hooks/useAdversaryTokenImages'
import type { Character } from '@/lib/types'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import { HUD, FONT_BODY, FS, SP, RADIUS, Z, EASE, COLOR, CHAR_COLOR } from '@/lib/tokens'

// ── Design tokens ──
const PANEL_BG   = 'var(--hud-surface-lo)'
const BORDER     = 'var(--hud-border)'
const BORDER_MD  = 'var(--hud-border-hi)'
const CHAR_BR    = CHAR_COLOR.brawn    // adversary slots — vivid red-sun (#E03A1E)
const CHAR_AG    = '#F8DAD4'           // PC/player slots — red-pale hex required for alpha-suffix tinting
const CHAR_WIL   = 'var(--hud-text-dim)' // "acted" checkmark badge
const TEXT_MUTED = 'var(--hud-text-faint)'
const BG         = 'var(--hud-bg)'

export interface GmControls {
  onMoveLeft:  (index: number) => void
  onMoveRight: (index: number) => void
  onSwap:      (slotIdA: string, slotIdB: string) => void
}

interface Props {
  encounter:   CombatEncounter
  character:   Character
  gmControls?: GmControls
  compact?:    boolean
}

export function InitiativeStrip({ encounter, character, gmControls, compact = false }: Props) {
  const [swapAnchor, setSwapAnchor] = useState<{ slotId: string; top: number; left: number } | null>(null)

  const { combatParticipants } = useCombatParticipants(encounter.campaign_id ?? '')

  const slotAssignments = useMemo<Record<string, string | null>>(() => {
    const map: Record<string, string | null> = {}
    for (const row of Object.values(combatParticipants)) {
      if (row.slot_type === 'pc') map[row.character_id] = row.active_character_name
    }
    return map
  }, [combatParticipants])

  const pcSlotIds = useMemo(
    () => encounter.initiative_slots
      .filter(s => s.type === 'pc' && s.characterId)
      .map(s => s.characterId as string),
    [encounter.initiative_slots],
  )
  const portraits = useCharacterPortraits(pcSlotIds)
  const { tokenImages: advTokenImages } = useAdversaryTokenImages()

  function getSwapTargets(slotId: string): InitiativeSlot[] {
    const slot = encounter.initiative_slots.find(s => s.id === slotId)
    if (!slot || slot.acted) return []
    return encounter.initiative_slots.filter(s =>
      s.id !== slotId && s.type === slot.type && !s.acted
    )
  }

  function openSwapPicker(slotId: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (swapAnchor?.slotId === slotId) { setSwapAnchor(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    setSwapAnchor({ slotId, top: rect.bottom + 6, left: rect.left + rect.width / 2 })
  }

  const slots  = encounter.initiative_slots
  const lastIdx = slots.length - 1

  return (
    <>
      {/* ── Turn Strip ── */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: Z.raised,
        borderBottom: `1px solid ${BORDER}`, padding: compact ? `${SP[2]} ${SP[3]}` : `${SP[3]} ${SP[4]}`,
        overflowX: 'auto', display: 'flex', alignItems: 'center', gap: 0,
        background: PANEL_BG,
      }}>
        {slots.map((slot, i) => {
          const isPC      = slot.type === 'pc'
          const isCurrent = slot.current
          const isActed   = slot.acted
          const activeName = isPC && slot.characterId
            ? (slotAssignments[slot.characterId] ?? slot.name)
            : slot.name
          const isMe = isPC && (
            slot.characterId === character.id ||
            activeName === character.name
          )
          const adv        = slot.adversaryInstanceId
            ? encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
            : null
          const isRevealed  = adv?.revealed ?? true
          const displayName = !isPC && !isRevealed ? '???' : activeName
          const ringColor   = isCurrent ? (isPC ? CHAR_AG : CHAR_BR) : 'transparent'

          const showControls = !!gmControls && !isActed
          const canMoveLeft  = showControls && i > 0 && !slots[i - 1].acted
          const canMoveRight = showControls && i < lastIdx && !slots[i + 1].acted
          const swapTargets  = showControls ? getSwapTargets(slot.id) : []

          return (
            <div key={slot.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className={showControls ? 'init-slot-card' : undefined}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compact ? '0.1875rem' : '0.3125rem', minWidth: compact ? '4rem' : '4.75rem', padding: `0 ${SP[1]}` }}
              >
                {/* Avatar */}
                <div style={{
                  width: compact ? '2.75rem' : '3.25rem', height: compact ? '2.75rem' : '3.25rem', borderRadius: RADIUS.full, flexShrink: 0,
                  background: isActed ? 'var(--hud-surface-hi)' : isPC ? `${CHAR_AG}20` : `${CHAR_BR}20`,
                  border: isCurrent
                    ? `2px solid ${ringColor}`
                    : `1px solid ${isPC ? `${CHAR_AG}40` : `${CHAR_BR}40`}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700,
                  color: isActed ? 'var(--hud-text-faint)' : isPC ? CHAR_AG : CHAR_BR,
                  position: 'relative', overflow: 'hidden',
                  filter: isActed ? 'grayscale(100%)' : 'none',
                  boxShadow: isCurrent ? `0 0 14px ${ringColor}70` : 'none',
                  transition: `all ${EASE.default}`,
                }}>
                  {isPC && slot.characterId && portraits[slot.characterId] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={portraits[slot.characterId]}
                      alt={displayName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : !isPC && (isRevealed || !!gmControls) && advTokenImages[slot.name] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={advTokenImages[slot.name]}
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
                      width: '1.0625rem', height: '1.0625rem', borderRadius: RADIUS.full,
                      background: CHAR_WIL, border: `1px solid ${BG}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: FS.caption, color: BG, fontWeight: 700,
                    }}>✓</div>
                  )}
                </div>

                {/* "NOW" arrow */}
                {isCurrent && (
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: isPC ? CHAR_AG : CHAR_BR, animation: 'pulse-dot 1.2s ease-in-out infinite', lineHeight: 1 }}>
                    ▲
                  </div>
                )}

                {/* Name */}
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, color: isMe ? HUD.gold : TEXT_MUTED, textAlign: 'center', maxWidth: '4.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isMe ? 'YOU' : displayName}
                </div>

                {/* GM reorder / swap controls — hover-revealed via CSS */}
                {showControls && (
                  <div className="init-slot-gm-bar">
                    <button
                      disabled={!canMoveLeft}
                      onClick={() => gmControls!.onMoveLeft(i)}
                      title="Move left"
                    >←</button>
                    <button
                      disabled={swapTargets.length === 0}
                      onClick={e => openSwapPicker(slot.id, e)}
                      title="Swap with…"
                    >⇄</button>
                    <button
                      disabled={!canMoveRight}
                      onClick={() => gmControls!.onMoveRight(i)}
                      title="Move right"
                    >→</button>
                  </div>
                )}
              </div>

              {/* Connector dash */}
              {i < lastIdx && (
                <div style={{ width: compact ? '0.75rem' : '1rem', height: compact ? 1 : 2, background: BORDER_MD, flexShrink: 0 }} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Swap picker portal ── */}
      {swapAnchor && gmControls && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop — closes picker on outside click */}
          <div
            onClick={() => setSwapAnchor(null)}
            style={{ position: 'fixed', inset: 0, zIndex: Z.backdrop }}
          />
          <div style={{
            position:    'fixed',
            top:         swapAnchor.top,
            left:        swapAnchor.left,
            transform:   'translateX(-50%)',
            zIndex:      Z.tooltip,
            background:  'var(--hud-panel)',
            border:      '1px solid var(--hud-border-hi)',
            borderRadius: RADIUS.lg,
            padding:     '0.375rem',
            display:     'flex',
            flexDirection: 'column',
            gap:         '0.1875rem',
            minWidth:    '6.875rem',
            boxShadow:   '0 4px 20px rgba(0,0,0,0.55)',
          }}>
            <div style={{
              fontFamily:    FONT_BODY,
              fontSize:      FS.overline,
              fontWeight:    700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         'var(--hud-text-dim)',
              paddingBottom: SP[1],
              borderBottom:  '1px solid var(--hud-border)',
              marginBottom:  '0.125rem',
            }}>
              Swap with…
            </div>
            {getSwapTargets(swapAnchor.slotId).map(target => {
              const tName = target.type === 'pc' && target.characterId
                ? (slotAssignments[target.characterId] ?? target.name)
                : target.name
              return (
                <button
                  key={target.id}
                  className="init-swap-target"
                  onClick={() => {
                    gmControls.onSwap(swapAnchor.slotId, target.id)
                    setSwapAnchor(null)
                  }}
                >
                  {tName}
                </button>
              )
            })}
          </div>
        </>,
        document.body,
      )}
    </>
  )
}
