'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useCombatParticipants } from '@/hooks/useCombatParticipants'
import { useCharacterPortraits } from '@/hooks/useCharacterPortraits'
import { useAdversaryTokenImages } from '@/hooks/useAdversaryTokenImages'
import type { Character } from '@/lib/types'
import { isSlotDefeated, type CombatEncounter, type InitiativeSlot } from '@/lib/combat'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'
import type { MapToken } from '@/hooks/useMapTokens'
import { Z, EASE } from '@/lib/tokens'

// ── Locally scoped Z value — do not add to Z token map ──
const Z_STRIP = (Z.raised as number) + 10

// ── Layout geometry (px). These are handed to the stylesheet as --init-* custom
// properties on the bar root, so the conveyor's JS measurement (CONN_W in
// departW) and the real card/gap widths are one set of numbers, never two. ──
const CARD_W        = 128  // card width — the hero is the SAME width         (was 64; v1 132, active 150)
const CARD_H        = 88   // normal card height                              (was 78)
const HERO_H        = 132  // the active (hero) card's height
const CONN_W        = 10   // gap between cards                               (was 14)
const ROUND_W       = 104  // left ROUND block width                          (was 58)
const DIV_W         = 18   // round divider width                             (was 38)
const FOOT_H_GM     = 24   // GM only: row under each card the reorder bar hangs in
const MIN_DRUM      = 14   // minimum rendered drum items
// Strip heights are the real content heights: 10 above + hero + (GM foot 24 + 6 | 10) + 8 thin scrollbar + 1px border.
// Exported because the GM's floating Advance Turn button anchors just under the GM strip.
export const STRIP_H_GM = 181  // 10 + 132 + 24 + 6 + 8 + 1                    (was 158)
const STRIP_H_PL        = 161  // 10 + 132 + 10 + 8 + 1                         (was 115)

const NO_TOKENS: StripToken[] = []

export interface GmControls {
  onMoveLeft:    (index: number) => void
  onMoveRight:   (index: number) => void
  onSwap:        (slotIdA: string, slotIdB: string) => void
}

export interface InitiativeStripProps {
  encounter:   CombatEncounter | null
  character:   Character
  gmControls?: GmControls
  /**
   * When true, renders as a fixed-position portal overlay at the top of the viewport.
   * When false (default), renders inline within the parent container.
   */
  asOverlay?:  boolean
  /** Vertical offset from top of viewport (only used when asOverlay=true). */
  offsetTop?:  string
  /** Map tokens, for the card <-> token hover link. Omit and the link is off. */
  tokens?:         StripToken[]
  /** The token currently hovered on the map or lit from a card. Owned by the parent view. */
  hoveredTokenId?: string | null
  onHoverToken?:   (tokenId: string | null) => void
}

export type StripToken = Pick<MapToken, 'id' | 'slot_key' | 'participant_type' | 'character_id'>

/**
 * The one map token a strip card stands for, or null. NPC / vehicle: `slot_key === slot.id`, the same
 * join EncounterDeck's buildRoster uses. PC: tokens carry no slot_key, so match the character.
 */
export function tokenIdForSlot(slot: InitiativeSlot, tokens: StripToken[]): string | null {
  if (slot.type === 'pc') {
    if (!slot.characterId) return null
    return tokens.find(t => t.participant_type === 'pc' && t.character_id === slot.characterId)?.id ?? null
  }
  return tokens.find(t => t.slot_key === slot.id)?.id ?? null
}

// ── Drum queue types ─────────────────────────────────────────────
type DrumSlot = { kind: 'slot'; slot: InitiativeSlot; slotIndex: number; isActed: boolean }
// A slot plus a render-time defeat flag. Added only for the drum (never persisted): buildDrum has
// no encounter, and its callers — including the conveyor's end-of-transition rebuilds — read the
// annotated copy held in useDrum's encRef, so the same rule applies on every rebuild path.
type SlotView = InitiativeSlot & { defeated?: boolean }

type EncView = Omit<CombatEncounter, 'initiative_slots'> & { initiative_slots: SlotView[] }

function withDefeat(enc: CombatEncounter): EncView {
  return { ...enc, initiative_slots: enc.initiative_slots.map(s => ({ ...s, defeated: isSlotDefeated(s, enc) })) }
}
type DrumDiv  = { kind: 'divider'; roundNum: number }
type DrumItem = DrumSlot | DrumDiv

function buildDrum(
  slots: SlotView[],
  fromIdx: number,
  startRound: number,
): DrumItem[] {
  if (!slots.length) return []
  const items: DrumItem[] = []
  let i = fromIdx, round = startRound, cycles = 0
  while (items.length < MIN_DRUM) {
    if (i >= slots.length) {
      items.push({ kind: 'divider', roundNum: round + 1 })
      round++; i = 0; cycles++
      if (cycles > 4) break
    }
    // Defeated slots are left out of the drum. Exception: the current slot (the hero) stays until the
    // GM advances, even if it is defeated mid-turn. Revived slots come back in their original position.
    if (slots[i].defeated && !(cycles === 0 && i === fromIdx)) { i++; continue }
    items.push({ kind: 'slot', slot: slots[i], slotIndex: i, isActed: cycles > 0 ? false : slots[i].acted })
    i++
  }
  return items
}

// ── Sub-component: round divider marker ─────────────────────────
function DividerMarker({ roundNum, isNext }: { roundNum: number; isNext: boolean }) {
  return (
    <div className={`init-div${isNext ? ' is-next' : ''}`} role="separator" aria-label={`Round ${roundNum}`}>
      <span className="init-div__line" />
      <span className="init-div__text">RD {roundNum}</span>
      <span className="init-div__line" />
    </div>
  )
}

// ── Internal hook: manages the drum queue + animation state ─────
function useDrum(encounter: CombatEncounter | null) {
  const [drumItems, setDrumItems] = useState<DrumItem[]>([])
  const [localRound, setLocalRound] = useState(1)
  const trackRef     = useRef<HTMLDivElement>(null)
  const viewportRef  = useRef<HTMLDivElement>(null)
  const firstRef     = useRef<HTMLDivElement>(null)
  const prevIdxRef   = useRef<number>(-1)
  const prevOrderRef = useRef<string>('')
  const prevDeadRef  = useRef<Set<string>>(new Set())
  const encRef       = useRef<EncView | null>(encounter ? withDefeat(encounter) : null)
  encRef.current     = encounter ? withDefeat(encounter) : null
  const reduced      = usePrefersReducedMotion()
  const reducedRef   = useRef(reduced)
  useEffect(() => { reducedRef.current = reduced }, [reduced])

  // Unified effect: initial build, reorder rebuild, and turn-advance animation.
  // Distinguishes reorder (swap/move) from advance using slot-ID order as a key.
  useEffect(() => {
    if (!encounter) return
    const ann      = encRef.current!                    // same encounter, slots carry the defeat flag
    const idx      = encounter.current_slot_index ?? 0
    const orderKey = encounter.initiative_slots.map(s => s.id).join(',')
    const dead     = new Set(ann.initiative_slots.filter(s => s.defeated).map(s => s.id))

    if (prevIdxRef.current === -1) {
      prevIdxRef.current   = idx
      prevOrderRef.current = orderKey
      prevDeadRef.current  = dead
      setDrumItems(buildDrum(ann.initiative_slots, idx, encounter.round ?? 1))
      setLocalRound(encounter.round ?? 1)
      return
    }

    const idxChanged   = idx !== prevIdxRef.current
    // A defeat/revival of anyone but the outgoing/incoming hero changes who is in the drum, so it
    // rebuilds like a reorder. The hero(es) are exempt: a defeated hero stays until the GM advances,
    // and the old hero leaving (defeated or not) is just the normal conveyor turn.
    const heroIds = new Set([ann.initiative_slots[prevIdxRef.current]?.id, ann.initiative_slots[idx]?.id])
    const defeatChanged = [...dead, ...prevDeadRef.current].some(id => !heroIds.has(id) && dead.has(id) !== prevDeadRef.current.has(id))
    prevDeadRef.current = dead
    const orderChanged = orderKey !== prevOrderRef.current || defeatChanged
    prevOrderRef.current = orderKey

    if (!idxChanged && !orderChanged) return  // only acted flags changed — ignore

    // Slot order changed (swap or move) — instant rebuild, no conveyor animation
    if (orderChanged) {
      prevIdxRef.current = idx
      setDrumItems(buildDrum(ann.initiative_slots, idx, encounter.round ?? 1))
      setLocalRound(encounter.round ?? 1)
      return
    }

    // Only index changed — turn advanced — run conveyor animation
    prevIdxRef.current = idx

    // Bring the hero back into view first, so the conveyor always animates on screen.
    viewportRef.current?.scrollTo({ left: 0, behavior: 'instant' })

    const track = trackRef.current
    const first = firstRef.current
    if (!track || !first) {
      setDrumItems(buildDrum(ann.initiative_slots, idx, encounter.round ?? 1))
      setLocalRound(encounter.round ?? 1)
      return
    }

    const departW = first.getBoundingClientRect().width + CONN_W
    requestAnimationFrame(() => {
      const onEnd = () => {
        track.removeEventListener('transitionend', onEnd)
        track.style.transition = 'none'
        track.style.transform  = 'translateX(0)'

        const enc = encRef.current
        setDrumItems(prev => {
          const [gone, ...rest] = prev
          if (!gone) return prev
          if (gone.kind === 'divider') setLocalRound(r => r + 1)
          const tail: DrumItem = gone.kind === 'slot' ? { ...gone, isActed: true } : gone
          const list = [...rest, tail]
          // Round boundary: the departed slot left a divider at the front.
          // Rebuild from DB state — this gives a full-length queue starting with
          // slot0 of the new round as active, with no extra Advance Turn needed.
          if (list[0]?.kind === 'divider' && enc) {
            return buildDrum(enc.initiative_slots, enc.current_slot_index ?? 0, enc.round ?? 1)
          }
          if (enc && list.filter(x => x.kind === 'slot').length < MIN_DRUM - 2) {
            return buildDrum(enc.initiative_slots, enc.current_slot_index ?? 0, enc.round ?? 1)
          }
          return list
        })
        setLocalRound(enc?.round ?? 1)
      }
      // Reduced motion: no transition will ever fire `transitionend`, so run the
      // very same rotation directly instead of waiting for it.
      if (reducedRef.current) { onEnd(); return }
      track.style.transition = `transform ${EASE.panel}`
      track.style.transform  = `translateX(${-departW}px)`
      track.addEventListener('transitionend', onEnd, { once: true })
    })
  }, [encounter])  // eslint-disable-line react-hooks/exhaustive-deps

  // A defeated hero that has just departed is appended to the tail as "acted" by the conveyor;
  // drop any defeated slot that is not the hero so it never lingers in the drum.
  useEffect(() => {
    const enc = encRef.current
    if (!enc) return
    const dead = new Set(enc.initiative_slots.filter(s => s.defeated).map(s => s.id))
    if (!dead.size) return
    setDrumItems(prev => {
      const next = prev.filter((it, i) => it.kind !== 'slot' || i === 0 || !dead.has(it.slot.id))
      return next.length === prev.length ? prev : next
    })
  }, [drumItems, encounter])

  return { drumItems, localRound, trackRef, firstRef, viewportRef }
}

// ── Card state ────────────────────────────────────────────────────
type CardRole = 'active' | 'queued' | 'done'

function getCardRole(isActed: boolean, isCurrent: boolean): CardRole {
  if (isActed)   return 'done'
  if (isCurrent) return 'active'
  return 'queued'
}

// ── Card identity: tier / allegiance, read-only join ──────────────
// slot.adversaryInstanceId -> encounter.adversaries (tier, minion squad);
// slot.vehicleInstanceId -> encounter.vehicles (allegiance). Colours are the
// --tier-* tokens (state-tokens.css), which mirror the map-token rings.
type CardTone = 'minion' | 'rival' | 'nemesis' | 'allied' | 'pc'

interface CardIdentity {
  tone:  CardTone
  label: string
  level: number                                  // 1/2/3 diamond pips for Minion/Rival/Nemesis, else 0
  squad: { alive: number; total: number } | null // minion groups only
}

function resolveIdentity(
  slot: InitiativeSlot,
  adv:  AdversaryInstance | undefined,
  veh:  VehicleInstance | undefined,
): CardIdentity {
  if (slot.type === 'pc') return { tone: 'pc', label: 'PLAYER', level: 0, squad: null }
  if (adv) {
    const allied = (slot.alignment ?? adv.alignment) === 'allied_npc'
    return {
      tone:  allied ? 'allied' : adv.type,
      label: allied ? 'ALLIED' : adv.type.toUpperCase(),
      level: allied ? 0 : adv.type === 'minion' ? 1 : adv.type === 'rival' ? 2 : 3,
      squad: adv.type === 'minion' && adv.groupSize != null
        ? { alive: adv.groupRemaining ?? 0, total: adv.groupSize }
        : null,
    }
  }
  if (veh) {
    return { tone: veh.alignment === 'allied_npc' ? 'allied' : 'minion', label: 'VEHICLE', level: 0, squad: null }
  }
  const allied = slot.alignment === 'allied_npc'
  return { tone: allied ? 'allied' : 'minion', label: allied ? 'ALLY' : 'ENEMY', level: 0, squad: null }
}

// ── SlotCard sub-component ────────────────────────────────────────
interface SlotCardProps {
  outerRef?:    React.RefObject<HTMLDivElement | null>
  slot:         InitiativeSlot
  slotIndex:    number
  role:         CardRole
  identity:     CardIdentity
  isYou:        boolean
  displayName:  string
  portrait:     string | null
  staggerMs:    number
  visible:      boolean
  gmControls?:  GmControls
  canLeft:      boolean
  canRight:     boolean
  hasSwapTgts:  boolean
  canPass:      boolean
  onSwapOpen:   (slotId: string, e: React.MouseEvent<HTMLButtonElement>) => void
  /** The map token this card links to, if any, and whether it is currently lit. */
  tokenId:      string | null
  lit:          boolean
  onHoverCard:  (tokenId: string, on: boolean) => void
}

function SlotCard({
  outerRef, slot, slotIndex, role, identity, isYou, displayName, portrait, staggerMs, visible,
  gmControls, canLeft, canRight, hasSwapTgts, canPass, onSwapOpen, tokenId, lit, onHoverCard,
}: SlotCardProps) {
  const isDone   = role === 'done'
  const isActive = role === 'active'
  const showGm   = !!gmControls && !isDone
  const showPass = isActive && isYou && !gmControls

  const slotClass = [
    'init-slot',
    showGm    ? 'init-slot-gm' : '',
    visible   ? 'is-in'        : '',
    isActive  ? 'is-active'    : '',
    isDone    ? 'is-done'      : '',
    lit       ? 'is-lit'       : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={outerRef}
      className={slotClass}
      style={{ '--stagger': `${staggerMs}ms` } as React.CSSProperties}
      data-token-id={tokenId ?? undefined}
      tabIndex={tokenId ? 0 : undefined}
      onMouseEnter={tokenId ? () => onHoverCard(tokenId, true) : undefined}
      onMouseLeave={tokenId ? () => onHoverCard(tokenId, false) : undefined}
      onFocus={tokenId ? () => onHoverCard(tokenId, true) : undefined}
      onBlur={tokenId ? () => onHoverCard(tokenId, false) : undefined}
    >
      <div className={`init-card init-card--${identity.tone}`}>
        <div className="init-card__plate">
          {portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="init-card__art" src={portrait} alt={displayName} />
          ) : (
            <div className="init-card__initial">{displayName.charAt(0).toUpperCase()}</div>
          )}
          <div className="init-card__shade" />
        </div>

        <div className="init-card__head">
          <span className="init-card__tier">{identity.label}</span>
          {identity.level > 0 && (
            <span className="init-card__dias" aria-hidden>
              {Array.from({ length: identity.level }).map((_, i) => <span key={i} className="init-dia" />)}
            </span>
          )}
          {isYou && !isActive && <span className="init-you-badge" aria-label="Your character">YOU</span>}
        </div>

        {isActive && (
          <span className={`init-card__now${isYou && !gmControls ? ' is-you' : ''}`} aria-label="Current turn">
            {isYou && !gmControls ? 'YOUR TURN' : 'NOW'}
          </span>
        )}
        {isDone && <span className="init-card__acted">ACTED</span>}

        <div className="init-card__body">
          <div className="init-card__name">{displayName}</div>
          {identity.squad && (
            <div
              className="init-card__squad"
              role="img"
              aria-label={`Squad ${identity.squad.alive} of ${identity.squad.total}`}
            >
              {Array.from({ length: identity.squad.total }).map((_, i) => (
                <span key={i} className={`init-sq${i < identity.squad!.alive ? ' is-alive' : ''}`} />
              ))}
            </div>
          )}

          {/* Pass Turn — inside the hero card, when it is the viewing player's */}
          {showPass && (
            <button
              className="init-pass-btn"
              disabled={!canPass}
              onClick={e => canPass && onSwapOpen(slot.id, e)}
              aria-label="Pass your turn"
            >
              PASS TURN
            </button>
          )}
        </div>
      </div>

      {/* GM reorder row — hangs below the card on hover via .init-slot-gm CSS rule */}
      {gmControls && (
        <div className="init-slot__foot">
          {showGm && (
            <div className="init-gm-bar">
              <button className="init-gm-ar" disabled={!canLeft}
                onClick={() => gmControls.onMoveLeft(slotIndex)} aria-label="Move left">←</button>
              <button className="init-gm-ar" disabled={!hasSwapTgts}
                onClick={e => onSwapOpen(slot.id, e)} aria-label="Swap">⇄</button>
              <button className="init-gm-ar" disabled={!canRight}
                onClick={() => gmControls.onMoveRight(slotIndex)} aria-label="Move right">→</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Token image for an adversary slot. `adversary_token_images` is keyed by the library name, but duplicates added
 * to an encounter are renamed "<name> 2", "<name> 3"... — so try the exact name, then the name without that suffix.
 */
function adversaryTokenImage(images: Record<string, string>, slotName: string): string | null {
  return images[slotName] ?? images[slotName.replace(/\s+\d+$/, '')] ?? null
}

// ── Shared drum track JSX ────────────────────────────────────────
interface DrumTrackProps {
  drumItems:       DrumItem[]
  trackRef:        React.RefObject<HTMLDivElement | null>
  firstRef:        React.RefObject<HTMLDivElement | null>
  encounter:       CombatEncounter
  character:       Character
  slotAssignments: Record<string, string | null>
  portraits:       Record<string, string>
  advTokenImages:  Record<string, string>
  gmControls?:     GmControls
  visible:         boolean
  onSwapOpen:      (slotId: string, e: React.MouseEvent<HTMLButtonElement>) => void
  tokens:          StripToken[]
  hoveredTokenId:  string | null
  onHoverCard:     (tokenId: string, on: boolean) => void
}

function DrumTrack({
  drumItems, trackRef, firstRef, encounter, character,
  slotAssignments, portraits, advTokenImages, gmControls,
  visible, onSwapOpen, tokens, hoveredTokenId, onHoverCard,
}: DrumTrackProps) {
  const slots   = encounter.initiative_slots

  // Defeated slots are hidden, so the GM arrows and swap picker only ever see live neighbours.
  const defeated = useMemo(
    () => new Set(slots.filter(s => isSlotDefeated(s, encounter)).map(s => s.id)),
    [slots, encounter],
  )
  const nearestLive = (from: number, dir: -1 | 1): InitiativeSlot | undefined => {
    for (let j = from + dir; j >= 0 && j < slots.length; j += dir) if (!defeated.has(slots[j].id)) return slots[j]
    return undefined
  }

  // Read-only lookup tables for the tier / squad join.
  const advByInstance = useMemo(
    () => new Map((encounter.adversaries ?? []).map(a => [a.instanceId, a])),
    [encounter.adversaries],
  )
  const vehByInstance = useMemo(
    () => new Map((encounter.vehicles ?? []).map(v => [v.instanceId, v])),
    [encounter.vehicles],
  )

  return (
    <div ref={trackRef} className="init-track">
      {(() => {
        const firstDivIdx = drumItems.findIndex(i => i.kind === 'divider')
        return drumItems.map((item, idx) => {
          if (item.kind === 'divider') {
            return (
              <div key={`div-${item.roundNum}-${idx}`} className="init-item init-item--div">
                <DividerMarker roundNum={item.roundNum} isNext={idx === firstDivIdx} />
              </div>
            )
          }

          const { slot, slotIndex, isActed } = item
          const isCurrent  = idx === 0
          const role       = getCardRole(isActed, isCurrent)
          const isPC       = slot.type === 'pc'
          const activeName = isPC && slot.characterId
            ? (slotAssignments[slot.characterId] ?? slot.name)
            : slot.name
          const isMe = isPC && (
            slot.characterId === character.id ||
            activeName === character.name
          )
          // Being on the initiative strip at all means visible to players —
          // no '???' name/token gating on adversary reveal state here.
          const displayName = activeName
          const portrait    = isPC && slot.characterId ? (portraits[slot.characterId] ?? null) : null
          const advToken    = !isPC ? adversaryTokenImage(advTokenImages, slot.name) : null
          const effectivePortrait = portrait ?? advToken

          const identity = resolveIdentity(
            slot,
            slot.adversaryInstanceId ? advByInstance.get(slot.adversaryInstanceId) : undefined,
            slot.vehicleInstanceId   ? vehByInstance.get(slot.vehicleInstanceId)   : undefined,
          )

          const showGm    = !!gmControls && !isActed
          const leftN     = showGm ? nearestLive(slotIndex, -1) : undefined
          const rightN    = showGm ? nearestLive(slotIndex, 1) : undefined
          const canLeft   = showGm && !!leftN && !leftN.acted
          const canRight  = showGm && !!rightN && !rightN.acted
          const swapTgts  = showGm
            ? slots.filter(s => s.id !== slot.id && s.type === slot.type && !s.acted && !defeated.has(s.id))
            : []
          const canPass = !gmControls && isMe && isCurrent
            ? slots.filter(s => s.id !== slot.id && s.type === 'pc' && !s.acted).length > 0
            : false

          // Stagger entrance animation — 30ms per drum position is a UI physics constant
          const staggerMs = idx * 30

          const tokenId = tokenIdForSlot(slot, tokens)

          return (
            <div key={`${slot.id}-${idx}`} className="init-item">
              <SlotCard
                outerRef={idx === 0 ? firstRef : undefined}
                slot={slot}
                slotIndex={slotIndex}
                role={role}
                identity={identity}
                isYou={isMe}
                displayName={displayName}
                portrait={effectivePortrait}
                staggerMs={staggerMs}
                visible={visible}
                gmControls={gmControls}
                canLeft={canLeft}
                canRight={canRight}
                hasSwapTgts={swapTgts.length > 0}
                canPass={canPass}
                onSwapOpen={onSwapOpen}
                tokenId={tokenId}
                lit={!!tokenId && tokenId === hoveredTokenId}
                onHoverCard={onHoverCard}
              />
              {/* Connector dash */}
              {idx < drumItems.length - 1 && (
                <div className="init-conn" />
              )}
            </div>
          )
        })
      })()}
    </div>
  )
}

// ── ROUND block (label, round number, queue count) ────────────────
function RoundBlock({ round, remaining, yourTurn }: {
  round: number
  remaining: number
  yourTurn: { now: boolean; n: number } | null
}) {
  return (
    <div className="init-round">
      <div className="init-round__label">ROUND</div>
      <div className="init-round__num">{round}</div>
      <div className="init-round__count">{remaining} LEFT</div>
      {yourTurn && (
        <div className={`init-round__yt${yourTurn.now ? ' is-now' : ''}`}>
          {yourTurn.now ? 'YOUR TURN' : `YOUR TURN IN ${yourTurn.n}`}
        </div>
      )}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────
export function InitiativeStrip({
  encounter, character, gmControls,
  asOverlay = false, offsetTop = '0',
  tokens, hoveredTokenId = null, onHoverToken,
}: InitiativeStripProps) {
  const supabase = useMemo(() => createClient(), [])

  const { combatParticipants } = useCombatParticipants(encounter?.campaign_id ?? '')
  const slotAssignments = useMemo<Record<string, string | null>>(() => {
    const map: Record<string, string | null> = {}
    for (const row of Object.values(combatParticipants)) {
      if (row.slot_type === 'pc') map[row.character_id] = row.active_character_name
    }
    return map
  }, [combatParticipants])

  const pcSlotIds = useMemo(
    () => (encounter?.initiative_slots ?? [])
      .filter(s => s.type === 'pc' && s.characterId)
      .map(s => s.characterId as string),
    [encounter?.initiative_slots],
  )
  const portraits = useCharacterPortraits(pcSlotIds)
  const { tokenImages: advTokenImages } = useAdversaryTokenImages()

  // ── SSR guard ────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // ── Entrance animation (overlay mode only) ───────────────────────
  const [visible, setVisible] = useState(!asOverlay)
  const prevIsActive = useRef<boolean | undefined>(undefined)
  useEffect(() => {
    if (!asOverlay) { setVisible(true); return }
    if (!encounter) return
    if (encounter.is_active && !prevIsActive.current) {
      requestAnimationFrame(() => setVisible(true))
    } else if (!encounter.is_active && prevIsActive.current) {
      setVisible(false)
    }
    prevIsActive.current = encounter.is_active
  }, [encounter?.is_active, asOverlay])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drum queue ───────────────────────────────────────────────────
  const { drumItems, localRound, trackRef, firstRef, viewportRef } = useDrum(encounter)

  // ── Card <-> token hover link ────────────────────────────────────
  // A card sets the shared hovered id; leaving clears it only if it is still that card's own,
  // so a fast move onto another card or a map token is never wiped by the stale leave.
  const reducedMotion = usePrefersReducedMotion()
  const hoveredRef    = useRef(hoveredTokenId)
  useEffect(() => { hoveredRef.current = hoveredTokenId }, [hoveredTokenId])
  const fromCardRef   = useRef<string | null>(null)
  const hoverCard = useCallback((tokenId: string, on: boolean) => {
    if (!onHoverToken) return
    if (on) { fromCardRef.current = tokenId; onHoverToken(tokenId) }
    else if (hoveredRef.current === tokenId) { fromCardRef.current = null; onHoverToken(null) }
  }, [onHoverToken])

  // A map token hover whose card is off-screen scrolls the strip to it. Never scrolls back on leave.
  useEffect(() => {
    if (!hoveredTokenId || fromCardRef.current === hoveredTokenId) return
    const vp = viewportRef.current
    const el = vp?.querySelector<HTMLElement>(`[data-token-id="${CSS.escape(hoveredTokenId)}"]`)
    if (!vp || !el) return
    const v = vp.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    if (r.left >= v.left && r.right <= v.right) return
    const left = r.left < v.left ? vp.scrollLeft - (v.left - r.left) : vp.scrollLeft + (r.right - v.right)
    vp.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [hoveredTokenId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Swap picker ──────────────────────────────────────────────────
  const [swapAnchor, setSwapAnchor] = useState<{ slotId: string; top: number; left: number } | null>(null)
  function openSwapPicker(slotId: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (swapAnchor?.slotId === slotId) { setSwapAnchor(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    setSwapAnchor({ slotId, top: rect.bottom + 6, left: rect.left + rect.width / 2 })
  }

  // ── Internal DB actions ──────────────────────────────────────────
  const encRef = useRef(encounter)
  encRef.current = encounter

  // Player-side pass: swap current slot's position with target (position-based)
  const passTurnInternal = useCallback(async (targetSlotId: string) => {
    const enc = encRef.current
    if (!enc) return
    const slots      = enc.initiative_slots
    const currentIdx = enc.current_slot_index ?? 0
    const targetIdx  = slots.findIndex(s => s.id === targetSlotId)
    if (targetIdx === -1) return
    const newSlots = [...slots];
    [newSlots[currentIdx], newSlots[targetIdx]] = [newSlots[targetIdx], newSlots[currentIdx]]
    await supabase.from('combat_encounters').update({
      initiative_slots:   newSlots.map((s, i) => ({ ...s, order: i + 1 })),
      current_slot_index: currentIdx,
      updated_at:         new Date().toISOString(),
    }).eq('id', enc.id)
  }, [supabase])

  // ── Early exits ──────────────────────────────────────────────────
  if (!encounter) return null

  const stripH = gmControls ? STRIP_H_GM : STRIP_H_PL

  // Geometry handed to the stylesheet; see the constants block above.
  const barVars = {
    '--init-card-w':        `${CARD_W}px`,
    '--init-card-h':        `${CARD_H}px`,
    '--init-hero-h':        `${HERO_H}px`,
    '--init-conn-w':        `${CONN_W}px`,
    '--init-round-w':       `${ROUND_W}px`,
    '--init-div-w':         `${DIV_W}px`,
    '--init-foot-h':        `${FOOT_H_GM}px`,
    '--init-strip-h':       `${stripH}px`,
    '--init-z':             String(Z_STRIP),
    '--init-top':           offsetTop,
  } as React.CSSProperties

  // Defeated combatants are out of the round: they are not "left" and do not stand before anyone.
  const remaining = encounter.initiative_slots.filter(s => !s.acted && !isSlotDefeated(s, encounter)).length

  // "YOUR TURN IN N": slot cards standing before the viewer's next un-acted slot in the drum
  // (dividers not counted). Player view only; hidden when the viewer has no slot.
  const isViewerSlot = (s: InitiativeSlot) => s.type === 'pc' && (
    s.characterId === character.id ||
    (s.characterId ? (slotAssignments[s.characterId] ?? s.name) : s.name) === character.name
  )
  const viewerIdx = !gmControls && character.id
    ? drumItems.findIndex(it => it.kind === 'slot' && !it.isActed && isViewerSlot(it.slot))
    : -1
  // The viewer has already acted and the drum window holds no un-acted copy of their slot:
  // count what is left this round plus the cards ahead of them in the next one.
  const viewerOrderPos = !gmControls && character.id
    ? encounter.initiative_slots.findIndex(isViewerSlot)
    : -1
  const yourTurn = viewerIdx >= 0
    ? { now: viewerIdx === 0, n: drumItems.slice(0, viewerIdx).filter(it => it.kind === 'slot').length }
    : viewerOrderPos >= 0
      ? { now: false, n: remaining + encounter.initiative_slots.slice(0, viewerOrderPos).filter(s => !isSlotDefeated(s, encounter)).length }
      : null

  const drumTrackProps: DrumTrackProps = {
    drumItems, trackRef, firstRef,
    encounter, character, slotAssignments, portraits, advTokenImages,
    gmControls, visible,
    onSwapOpen:    openSwapPicker,
    tokens:        tokens ?? NO_TOKENS,
    hoveredTokenId,
    onHoverCard:   hoverCard,
  }

  // ── Swap / pass picker portal ────────────────────────────────────
  const swapPickerPortal = swapAnchor && mounted && createPortal(
    <>
      <div className="init-swap-backdrop" onClick={() => setSwapAnchor(null)} style={{ zIndex: Z.backdrop }} />
      <div
        className="init-swap"
        style={{ top: swapAnchor.top, left: swapAnchor.left, transform: 'translateX(-50%)', zIndex: Z.tooltip }}
      >
        <div className="init-swap__title">
          {gmControls ? 'Swap with…' : 'Pass to…'}
        </div>
        {encounter.initiative_slots
          .filter(s => {
            if (s.id === swapAnchor.slotId || s.acted || isSlotDefeated(s, encounter)) return false
            const srcType = encounter.initiative_slots.find(x => x.id === swapAnchor.slotId)?.type
            return s.type === srcType
          })
          .map(target => {
            const tName = target.type === 'pc' && target.characterId
              ? (slotAssignments[target.characterId] ?? target.name)
              : target.name
            return (
              <button key={target.id} className="init-swap-target"
                onClick={() => {
                  if (gmControls) gmControls.onSwap(swapAnchor.slotId, target.id)
                  else void passTurnInternal(target.id)
                  setSwapAnchor(null)
                }}>
                {tName}
              </button>
            )
          })}
      </div>
    </>,
    document.body,
  )

  // ── OVERLAY mode ─────────────────────────────────────────────────
  if (asOverlay) {
    return (
      <>
        <div
          role="region"
          aria-label="Initiative order"
          className="init-bar init-bar--overlay"
          data-visible={visible}
          style={barVars}
        >
          <RoundBlock round={localRound} remaining={remaining} yourTurn={yourTurn} />
          <div className="init-viewport" ref={viewportRef}>
            <DrumTrack {...drumTrackProps} />
          </div>
          <div className="init-bar__fade" />
        </div>
        {swapPickerPortal}
      </>
    )
  }

  // ── INLINE mode ───────────────────────────────────────────────────
  return (
    <>
      <div role="region" aria-label="Initiative order" className="init-bar init-bar--inline" style={barVars}>
        <RoundBlock round={localRound} remaining={remaining} yourTurn={yourTurn} />
        <div className="init-viewport" ref={viewportRef}>
          <DrumTrack {...drumTrackProps} />
        </div>
        <div className="init-bar__fade" />
      </div>
      {swapPickerPortal}
    </>
  )
}
