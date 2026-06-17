'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useCombatParticipants } from '@/hooks/useCombatParticipants'
import { useCharacterPortraits } from '@/hooks/useCharacterPortraits'
import { useAdversaryTokenImages } from '@/hooks/useAdversaryTokenImages'
import type { Character } from '@/lib/types'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import { HUD, FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, Z, EASE } from '@/lib/tokens'

// ── Locally scoped Z value — do not add to Z token map ──
const Z_STRIP = (Z.raised as number) + 10

// ── UI affordance constants (fixed geometry, not spacing tokens) ──
const CARD_W     = 64   // dossier card width px
const CARD_H     = 78   // dossier card height px
const CONN_W     = 14   // connector dash width px
const MIN_DRUM   = 14   // minimum rendered drum items
const STRIP_H_GM = 158  // strip height with GM controls (card 78 + pip 7 + name 12 + gm-bar 13 + gaps/padding ≈ 158)
const STRIP_H_PL = 115  // strip height player-only (card 78 + pip 7 + name 12 + gaps ≈ 115)

// ── Chamfered clip-paths — octagonal, no triangular corner artefacts ──
const OUTER_CLIP = 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 8px)'
const INNER_CLIP = 'polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 6px)'
const HALO_CLIP  = 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 7px), calc(100% - 7px) 100%, 7px 100%, 0% calc(100% - 7px), 0% 10px)'

// ── Per-slot CRT flicker timing — deterministic, wide spread so only 1-2 cards flicker at once ──
const FLICKER_PARAMS: Array<{ duration: string; delay: string }> = [
  { duration: '7.2s',  delay: '-1.1s'  },
  { duration: '11.5s', delay: '-4.8s'  },
  { duration: '8.8s',  delay: '-7.3s'  },
  { duration: '13.1s', delay: '-2.6s'  },
  { duration: '6.4s',  delay: '-5.9s'  },
  { duration: '9.7s',  delay: '-0.4s'  },
  { duration: '12.3s', delay: '-8.1s'  },
  { duration: '7.9s',  delay: '-3.5s'  },
  { duration: '10.6s', delay: '-6.2s'  },
  { duration: '8.1s',  delay: '-1.8s'  },
  { duration: '14.0s', delay: '-9.4s'  },
  { duration: '6.9s',  delay: '-4.1s'  },
]

export interface GmControls {
  onMoveLeft:    (index: number) => void
  onMoveRight:   (index: number) => void
  onSwap:        (slotIdA: string, slotIdB: string) => void
  onAdvanceTurn: () => void
  onEndCombat:   () => void
}

export interface InitiativeStripProps {
  encounter:   CombatEncounter | null
  character:   Character
  gmControls?: GmControls
  compact?:    boolean
  /**
   * When true, renders as a fixed-position portal overlay at the top of the viewport.
   * When false (default), renders inline within the parent container.
   */
  asOverlay?:  boolean
  /** Vertical offset from top of viewport (only used when asOverlay=true). */
  offsetTop?:  string
}

// ── Drum queue types ─────────────────────────────────────────────
type DrumSlot = { kind: 'slot'; slot: InitiativeSlot; slotIndex: number; isActed: boolean }
type DrumDiv  = { kind: 'divider'; roundNum: number }
type DrumItem = DrumSlot | DrumDiv

function buildDrum(
  slots: InitiativeSlot[],
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
    items.push({ kind: 'slot', slot: slots[i], slotIndex: i, isActed: cycles > 0 ? false : slots[i].acted })
    i++
  }
  return items
}

// ── Sub-component: round divider marker ─────────────────────────
function DividerMarker({ roundNum, isNext }: { roundNum: number; isNext: boolean }) {
  const textColor = isNext
    ? HUD.gold
    : `color-mix(in srgb, ${HUD.gold} 28%, transparent)`
  const lineColor = isNext
    ? `color-mix(in srgb, ${HUD.gold} 55%, transparent)`
    : `color-mix(in srgb, ${HUD.gold} 18%, transparent)`
  return (
    <div style={{
      width: 38, alignSelf: 'stretch', flexShrink: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: SP[1],
    }}>
      <div style={{ width: 1, flex: 1, maxHeight: 40, background: lineColor }} />
      <div style={{
        fontFamily: FONT_DISPLAY,
        fontSize: FS.overline,
        fontWeight: 700,
        letterSpacing: '0.15em',
        color: textColor,
        writingMode: 'vertical-lr' as const,
        transform: 'rotate(180deg)',
        transition: `color ${EASE.default}`,
      }}>
        RND {roundNum}
      </div>
      <div style={{ width: 1, flex: 1, maxHeight: 40, background: lineColor }} />
    </div>
  )
}

// ── Internal hook: manages the drum queue + animation state ─────
function useDrum(encounter: CombatEncounter | null) {
  const [drumItems, setDrumItems] = useState<DrumItem[]>([])
  const [localRound, setLocalRound] = useState(1)
  const trackRef     = useRef<HTMLDivElement>(null)
  const firstRef     = useRef<HTMLDivElement>(null)
  const prevIdxRef   = useRef<number>(-1)
  const prevOrderRef = useRef<string>('')
  const encRef       = useRef(encounter)
  encRef.current     = encounter

  // Unified effect: initial build, reorder rebuild, and turn-advance animation.
  // Distinguishes reorder (swap/move) from advance using slot-ID order as a key.
  useEffect(() => {
    if (!encounter) return
    const idx      = encounter.current_slot_index ?? 0
    const orderKey = encounter.initiative_slots.map(s => s.id).join(',')

    if (prevIdxRef.current === -1) {
      prevIdxRef.current   = idx
      prevOrderRef.current = orderKey
      setDrumItems(buildDrum(encounter.initiative_slots, idx, encounter.round ?? 1))
      setLocalRound(encounter.round ?? 1)
      return
    }

    const idxChanged   = idx !== prevIdxRef.current
    const orderChanged = orderKey !== prevOrderRef.current
    prevOrderRef.current = orderKey

    if (!idxChanged && !orderChanged) return  // only acted flags changed — ignore

    // Slot order changed (swap or move) — instant rebuild, no conveyor animation
    if (orderChanged) {
      prevIdxRef.current = idx
      setDrumItems(buildDrum(encounter.initiative_slots, idx, encounter.round ?? 1))
      setLocalRound(encounter.round ?? 1)
      return
    }

    // Only index changed — turn advanced — run conveyor animation
    prevIdxRef.current = idx

    const track = trackRef.current
    const first = firstRef.current
    if (!track || !first) {
      setDrumItems(buildDrum(encounter.initiative_slots, idx, encounter.round ?? 1))
      setLocalRound(encounter.round ?? 1)
      return
    }

    const departW = first.getBoundingClientRect().width + CONN_W
    requestAnimationFrame(() => {
      track.style.transition = `transform ${EASE.panel}`
      track.style.transform  = `translateX(${-departW}px)`

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
          if (enc && list.filter(x => x.kind === 'slot').length < MIN_DRUM - 2) {
            return buildDrum(enc.initiative_slots, enc.current_slot_index ?? 0, enc.round ?? 1)
          }
          return list
        })
        setLocalRound(enc?.round ?? 1)
      }
      track.addEventListener('transitionend', onEnd, { once: true })
    })
  }, [encounter])  // eslint-disable-line react-hooks/exhaustive-deps

  return { drumItems, localRound, trackRef, firstRef }
}

// ── Card role ─────────────────────────────────────────────────────
type CardRole = 'active' | 'pc' | 'enemy' | 'friendly' | 'done'

function getCardRole(slot: InitiativeSlot, isActed: boolean, isCurrent: boolean): CardRole {
  if (isActed)                         return 'done'
  if (isCurrent)                       return 'active'
  if (slot.type === 'pc')              return 'pc'
  if (slot.alignment === 'allied_npc') return 'friendly'
  return 'enemy'
}

// ── Dossier card colour system ────────────────────────────────────
// Sealed gradient constants for the Imperial Dossier visual treatment.
// Multi-stop gradients cannot be expressed as single CSS custom property tokens.
const CARD_TOKENS = {
  active: {
    plateBg:     'linear-gradient(155deg, rgba(200,160,48,.18) 0%, rgba(80,60,10,.25) 45%, rgba(10,9,4,.9) 100%)',
    bevelTop:    'linear-gradient(90deg, transparent, rgba(220,180,60,.9) 40%, rgba(220,180,60,.6) 60%, transparent)',
    bevelLeft:   'linear-gradient(180deg, rgba(220,180,60,.8), rgba(200,160,48,.3) 60%, transparent)',
    bevelBottom: 'linear-gradient(90deg, transparent, rgba(200,160,48,.4) 30%, rgba(200,160,48,.2) 70%, transparent)',
    cornerColor: 'rgba(220,180,60,.9)',
    hlineColor:  'rgba(200,160,48,.18)',
    leakColor:   'rgba(220,180,60,.72)',
    arcColor:    'rgba(255,220,80,.9)',
    nameColor:   'var(--hud-gold)',
    glowFilter:  'drop-shadow(0 0 10px rgba(200,160,48,.45)) drop-shadow(0 0 22px rgba(200,160,48,.2))',
    haloShadow:  '0 0 0 1px rgba(200,160,48,.55), 0 0 20px rgba(200,160,48,.3), 0 0 40px rgba(200,160,48,.15)',
  },
  pc: {
    plateBg:     'linear-gradient(155deg, rgba(160,90,240,.15) 0%, rgba(60,25,100,.2) 45%, rgba(7,5,15,.9) 100%)',
    bevelTop:    'linear-gradient(90deg, transparent, rgba(180,110,255,.7) 40%, rgba(160,90,240,.45) 60%, transparent)',
    bevelLeft:   'linear-gradient(180deg, rgba(180,110,255,.65), rgba(140,80,220,.25) 60%, transparent)',
    bevelBottom: 'linear-gradient(90deg, transparent, rgba(160,90,240,.3) 30%, rgba(140,80,220,.15) 70%, transparent)',
    cornerColor: 'rgba(180,110,255,.75)',
    hlineColor:  'rgba(160,90,240,.18)',
    leakColor:   'rgba(180,110,255,.55)',
    arcColor:    'rgba(180,110,255,.7)',
    nameColor:   'rgba(170,110,255,.85)',
    glowFilter:  'none',
    haloShadow:  'none',
  },
  enemy: {
    plateBg:     'linear-gradient(155deg, rgba(200,65,55,.18) 0%, rgba(70,18,14,.25) 45%, rgba(10,4,4,.9) 100%)',
    bevelTop:    'linear-gradient(90deg, transparent, rgba(220,80,65,.75) 40%, rgba(200,65,55,.45) 60%, transparent)',
    bevelLeft:   'linear-gradient(180deg, rgba(220,80,65,.65), rgba(185,60,50,.25) 60%, transparent)',
    bevelBottom: 'linear-gradient(90deg, transparent, rgba(200,65,55,.3) 30%, rgba(185,60,50,.15) 70%, transparent)',
    cornerColor: 'rgba(220,80,65,.75)',
    hlineColor:  'rgba(200,65,55,.18)',
    leakColor:   'rgba(200,65,55,.52)',
    arcColor:    'rgba(220,80,65,.65)',
    nameColor:   'rgba(200,70,60,.8)',
    glowFilter:  'none',
    haloShadow:  'none',
  },
  friendly: {
    plateBg:     'linear-gradient(155deg, rgba(60,195,140,.15) 0%, rgba(18,70,52,.22) 45%, rgba(4,10,8,.9) 100%)',
    bevelTop:    'linear-gradient(90deg, transparent, rgba(80,210,155,.7) 40%, rgba(60,195,140,.45) 60%, transparent)',
    bevelLeft:   'linear-gradient(180deg, rgba(80,210,155,.6), rgba(60,185,130,.22) 60%, transparent)',
    bevelBottom: 'linear-gradient(90deg, transparent, rgba(60,195,140,.28) 30%, rgba(50,180,120,.14) 70%, transparent)',
    cornerColor: 'rgba(80,210,155,.72)',
    hlineColor:  'rgba(60,195,140,.18)',
    leakColor:   'rgba(60,195,140,.50)',
    arcColor:    'rgba(80,210,155,.6)',
    nameColor:   'rgba(80,195,120,.8)',
    glowFilter:  'none',
    haloShadow:  'none',
  },
  done: {
    plateBg:     'rgba(15,18,22,.7)',
    bevelTop:    'rgba(150,168,180,.08)',
    bevelLeft:   'rgba(150,168,180,.08)',
    bevelBottom: 'rgba(150,168,180,.08)',
    cornerColor: 'rgba(150,168,180,.15)',
    hlineColor:  'rgba(150,168,180,.1)',
    leakColor:   'transparent',
    arcColor:    'transparent',
    nameColor:   'rgba(150,168,180,.2)',
    glowFilter:  'none',
    haloShadow:  'none',
  },
} as const

// ── SlotCard sub-component ────────────────────────────────────────
interface SlotCardProps {
  outerRef?:    React.RefObject<HTMLDivElement | null>
  slot:         InitiativeSlot
  slotIndex:    number
  role:         CardRole
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
}

function SlotCard({
  outerRef, slot, slotIndex, role, isYou, displayName, portrait, staggerMs, visible,
  gmControls, canLeft, canRight, hasSwapTgts, canPass, onSwapOpen,
}: SlotCardProps) {
  const tokens   = CARD_TOKENS[role]
  const isDone   = role === 'done'
  const isActive = role === 'active'
  const showGm   = !!gmControls && !isDone

  // Per-slot animation delays derived from stable slot.order — UI affordance constants
  const ord         = slot.order ?? 0
  const flickerP    = FLICKER_PARAMS[ord % FLICKER_PARAMS.length]
  const pulseDelay  = `${ord * 1.1}s`
  const glitchDelay = `${ord * 1.3}s`
  const arcDelay    = `${ord * 0.2}s`
  const leak1Delay  = `${ord * 0.6}s`
  const leak2Delay  = `${ord * 0.6 + 0.8}s`

  return (
    <div
      ref={outerRef}
      className={showGm ? 'init-slot-gm' : undefined}
      style={{
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        gap:             SP[1],
        width:           CARD_W,
        paddingBottom:   SP[1],
        opacity:         visible ? 1 : 0,
        transform:       visible ? 'translateY(0)' : 'translateY(-8px)',
        transition:      `opacity ${EASE.default}, transform ${EASE.default}`,
        transitionDelay: `${staggerMs}ms`,
      }}
    >
      {/* ── Card visual area ── */}
      {/*
        CardContextDiv: position:relative container with NO filter/clip/overflow so that:
        - light leak blooms (top:-8) bleed upward unclipped
        - arc flash overlays sit above the plate without being clipped by it
        - the filter wrapper's compositing layer does not swallow overflowing children
      */}
      <div style={{
        position:   'relative',
        width:      CARD_W,
        height:     CARD_H,
        flexShrink: 0,
      }}>
        {/* Active halo ring — outside the plate, follows chamfered clip-path */}
        {isActive && (
          <div style={{
            position:      'absolute',
            inset:         -5,
            clipPath:      HALO_CLIP,
            boxShadow:     tokens.haloShadow,
            pointerEvents: 'none',
          }} />
        )}

        {/* Light leak blooms — siblings of the filter wrapper so the filter's
            compositing layer cannot clip them at the layout-box boundary */}
        {!isDone && (<>
          <div style={{
            position:      'absolute',
            top:           -8,
            left:          5,
            width:         48,
            height:        18,
            borderRadius:  '50%',
            background:    tokens.leakColor,
            filter:        'blur(10px)',
            animation:     `init-leak-pulse 3.8s ${leak1Delay} infinite`,
            pointerEvents: 'none',
          }} />
          <div style={{
            position:      'absolute',
            top:           -6,
            right:         3,
            width:         30,
            height:        14,
            borderRadius:  '50%',
            background:    tokens.leakColor,
            filter:        'blur(10px)',
            animation:     `init-leak-pulse 4.5s ${leak2Delay} infinite`,
            pointerEvents: 'none',
          }} />
        </>)}

        {/* Static discharge arcs — outside both plate (overflow:hidden) and filter
            wrapper so neither clipping context can suppress them. zIndex:2 paints
            them above the filter wrapper (z-index:auto). Gradient fades to
            transparent at edges so the lack of chamfer clip is imperceptible. */}
        {!isDone && (<>
          <div style={{ position:'absolute', top:'15%', left:0, right:0, height:2, zIndex:2, pointerEvents:'none',
            background:`linear-gradient(90deg, transparent, ${tokens.arcColor} 20%, transparent 40%, ${tokens.arcColor} 60%, transparent 80%)`,
            animation:`init-arc-flash-a 3.5s ${arcDelay} infinite`, opacity:0 }} />
          <div style={{ position:'absolute', top:'38%', left:0, right:0, height:3, zIndex:2, pointerEvents:'none',
            background:`linear-gradient(90deg, transparent 10%, ${tokens.arcColor} 30%, transparent 50%, ${tokens.arcColor} 70%, transparent 90%)`,
            animation:`init-arc-flash-b 2.8s ${arcDelay} infinite`, opacity:0 }} />
          <div style={{ position:'absolute', top:'60%', left:0, right:0, height:2, zIndex:2, pointerEvents:'none',
            background:`linear-gradient(90deg, transparent 5%, ${tokens.arcColor} 25%, transparent 45%, ${tokens.arcColor} 65%, transparent)`,
            animation:`init-arc-flash-c 4.4s ${arcDelay} infinite`, opacity:0 }} />
        </>)}

        {/* Filter + CRT flicker wrapper — position:absolute so it occupies exactly
            the card face area. CRT flicker here causes the whole plate to pulse in
            opacity. filter:drop-shadow follows the chamfered plate shape. */}
        <div style={{
          position:  'absolute',
          inset:     0,
          filter:    isActive ? tokens.glowFilter : undefined,
          animation: !isDone ? `init-crt-flicker ${flickerP.duration} ease-in-out ${flickerP.delay} infinite` : undefined,
        }}>

        {/* Outer plate */}
        <div style={{
          position:   'absolute',
          inset:      0,
          clipPath:   OUTER_CLIP,
          background: tokens.plateBg,
          overflow:   'hidden',
        }}>
          {/* Bevel edges */}
          <div style={{ position:'absolute', top:0, left:8, right:8, height:1, background:tokens.bevelTop, pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:8, left:0, bottom:5, width:1, background:tokens.bevelLeft, pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:8, right:0, bottom:5, width:1, background:'rgba(0,0,0,.4)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:0, left:5, right:5, height:1, background:tokens.bevelBottom, pointerEvents:'none' }} />

          {/* Corner L-marks — 1.5px two-sided borders */}
          <div style={{ position:'absolute', top:0, left:0, width:8, height:8, borderTop:`1.5px solid ${tokens.cornerColor}`, borderLeft:`1.5px solid ${tokens.cornerColor}`, pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:0, right:0, width:8, height:8, borderTop:`1.5px solid ${tokens.cornerColor}`, borderRight:`1.5px solid ${tokens.cornerColor}`, pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:0, left:5, width:8, height:8, borderBottom:`1.5px solid ${tokens.cornerColor}`, borderLeft:`1.5px solid ${tokens.cornerColor}`, pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:0, right:5, width:8, height:8, borderBottom:`1.5px solid ${tokens.cornerColor}`, borderRight:`1.5px solid ${tokens.cornerColor}`, pointerEvents:'none' }} />

          {/* Inner portrait frame — no animation here; CRT flicker is on the filter wrapper above */}
          <div style={{
            position:   'absolute',
            inset:      3,
            clipPath:   INNER_CLIP,
            overflow:   'hidden',
            background: '#07090d',
          }}>
            {/* Portrait or initials */}
            {portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portrait}
                alt={displayName}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  filter: isDone ? 'grayscale(90%) brightness(.35)' : 'none',
                }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700,
                color: tokens.nameColor,
                filter: isDone ? 'grayscale(90%) brightness(.35)' : 'none',
              }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Horizontal dossier lines */}
            {!isDone && (<>
              <div style={{ position:'absolute', top:'28%', left:0, right:0, height:1, pointerEvents:'none',
                background:`linear-gradient(90deg, transparent, ${tokens.hlineColor} 20%, ${tokens.hlineColor} 80%, transparent)` }} />
              <div style={{ position:'absolute', top:'56%', left:0, right:0, height:1, pointerEvents:'none',
                background:`linear-gradient(90deg, transparent, ${tokens.hlineColor} 20%, ${tokens.hlineColor} 80%, transparent)` }} />
            </>)}

            {/* Scanline sweep — active slot only */}
            {isActive && (
              <div style={{
                position:      'absolute',
                left:          0,
                right:         0,
                height:        3,
                background:    `linear-gradient(180deg, transparent, color-mix(in srgb, ${HUD.gold} 35%, transparent), transparent)`,
                animation:     'init-scan-sweep 2.4s cubic-bezier(.4,0,.6,1) infinite',
                pointerEvents: 'none',
              }} />
            )}

            {/* Power fluctuation overlay */}
            {!isDone && (
              <div style={{
                position:      'absolute',
                inset:         0,
                background:    'rgba(255,255,255,1)',
                animation:     `init-power-pulse 5s ${pulseDelay} infinite`,
                opacity:       0,
                pointerEvents: 'none',
              }} />
            )}

            {/* Horizontal glitch slice — portrait only */}
            {!isDone && portrait && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portrait}
                alt=""
                aria-hidden
                style={{
                  position:      'absolute',
                  inset:         0,
                  width:         '100%',
                  height:        '100%',
                  objectFit:     'cover',
                  filter:        'hue-rotate(180deg) saturate(2) brightness(1.4)',
                  animation:     `init-glitch-slice 6s ${glitchDelay} infinite`,
                  opacity:       0,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>

          {/* YOU badge */}
          {isYou && (
            <div className="init-you-badge" aria-label="Your character">YOU</div>
          )}
        </div>{/* /outer plate */}
        </div>{/* /filter+CRT wrapper */}
      </div>{/* /CardContextDiv */}

      {/* Active pip — downward triangle */}
      {isActive && (
        <div aria-label="Current turn" style={{
          width:        0,
          height:       0,
          flexShrink:   0,
          borderLeft:   '5px solid transparent',
          borderRight:  '5px solid transparent',
          borderTop:    `7px solid ${HUD.gold}`,
        }} />
      )}

      {/* Slot name */}
      <div style={{
        fontFamily:    FONT_BODY,
        fontSize:      FS.overline,
        fontWeight:    700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
        color:         tokens.nameColor,
        maxWidth:      76,
        overflow:      'hidden',
        textOverflow:  'ellipsis',
        whiteSpace:    'nowrap' as const,
        textAlign:     'center' as const,
        transition:    `color ${EASE.default}`,
      }}>
        {displayName}
      </div>

      {/* GM reorder row — revealed on hover via .init-slot-gm CSS rule */}
      {showGm && (
        <div className="init-gm-bar">
          <button className="init-gm-ar" disabled={!canLeft}
            onClick={() => gmControls!.onMoveLeft(slotIndex)} aria-label="Move left">←</button>
          <button className="init-gm-ar" disabled={!hasSwapTgts}
            onClick={e => onSwapOpen(slot.id, e)} aria-label="Swap">⇄</button>
          <button className="init-gm-ar" disabled={!canRight}
            onClick={() => gmControls!.onMoveRight(slotIndex)} aria-label="Move right">→</button>
        </div>
      )}

      {/* Pass Turn — player's own active slot only, no GM controls */}
      {isActive && isYou && !gmControls && (
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
  )
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
  onAdvanceTurn:   () => void
}

function DrumTrack({
  drumItems, trackRef, firstRef, encounter, character,
  slotAssignments, portraits, advTokenImages, gmControls,
  visible, onSwapOpen,
}: DrumTrackProps) {
  const slots   = encounter.initiative_slots
  const lastIdx = slots.length - 1

  return (
    <div
      ref={trackRef}
      style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: SP[2] }}
    >
      {(() => {
        const firstDivIdx = drumItems.findIndex(i => i.kind === 'divider')
        return drumItems.map((item, idx) => {
          if (item.kind === 'divider') {
            return (
              <div key={`div-${item.roundNum}-${idx}`} style={{ display: 'flex', alignItems: 'center' }}>
                <DividerMarker roundNum={item.roundNum} isNext={idx === firstDivIdx} />
              </div>
            )
          }

          const { slot, slotIndex, isActed } = item
          const isCurrent  = idx === 0
          const role       = getCardRole(slot, isActed, isCurrent)
          const isPC       = slot.type === 'pc'
          const activeName = isPC && slot.characterId
            ? (slotAssignments[slot.characterId] ?? slot.name)
            : slot.name
          const isMe = isPC && (
            slot.characterId === character.id ||
            activeName === character.name
          )
          const adv         = slot.adversaryInstanceId
            ? encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
            : null
          const isRevealed  = adv?.revealed ?? true
          const displayName = !isPC && !isRevealed ? '???' : activeName
          const portrait    = isPC && slot.characterId ? (portraits[slot.characterId] ?? null) : null
          const advToken    = !isPC && (isRevealed || !!gmControls) ? (advTokenImages[slot.name] ?? null) : null
          const effectivePortrait = portrait ?? advToken

          const showGm    = !!gmControls && !isActed
          const canLeft   = showGm && slotIndex > 0 && !slots[slotIndex - 1]?.acted
          const canRight  = showGm && slotIndex < lastIdx && !slots[slotIndex + 1]?.acted
          const swapTgts  = showGm
            ? slots.filter(s => s.id !== slot.id && s.type === slot.type && !s.acted)
            : []
          const canPass = !gmControls && isMe && isCurrent
            ? slots.filter(s => s.id !== slot.id && s.type === 'pc' && !s.acted).length > 0
            : false

          // Stagger entrance animation — 30ms per drum position is a UI physics constant
          const staggerMs = idx * 30

          return (
            <div key={`${slot.id}-${idx}`} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <SlotCard
                outerRef={idx === 0 ? firstRef : undefined}
                slot={slot}
                slotIndex={slotIndex}
                role={role}
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
              />
              {/* Connector dash */}
              {idx < drumItems.length - 1 && (
                <div style={{
                  width:      CONN_W,
                  height:     2,
                  flexShrink: 0,
                  alignSelf:  'center',
                  position:   'relative',
                  top:        -12,
                  background: isCurrent
                    ? `color-mix(in srgb, ${HUD.gold} 70%, transparent)`
                    : `color-mix(in srgb, ${HUD.textDim} 12%, transparent)`,
                  transition: `background ${EASE.default}`,
                }} />
              )}
            </div>
          )
        })
      })()}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────
export function InitiativeStrip({
  encounter, character, gmControls, compact = false,
  asOverlay = false, offsetTop = '0',
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
  const { drumItems, localRound, trackRef, firstRef } = useDrum(encounter)

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

  const advanceTurnInternal = useCallback(async () => {
    const enc = encRef.current
    if (!enc) return
    const slots = enc.initiative_slots
    if (!slots.length) return
    const current = enc.current_slot_index ?? 0
    const acted   = slots.map((s, i) => i === current ? { ...s, acted: true } : s)
    const allActed = acted.every(s => s.acted)
    if (allActed) {
      const reset = acted.map(s => ({ ...s, acted: false, current: false }))
      reset[0] = { ...reset[0], current: true }
      await supabase.from('combat_encounters').update({
        initiative_slots: reset, current_slot_index: 0,
        round: (enc.round ?? 1) + 1, updated_at: new Date().toISOString(),
      }).eq('id', enc.id)
    } else {
      let next = (current + 1) % slots.length
      while (acted[next].acted) next = (next + 1) % slots.length
      const updated = acted.map((s, i) => ({ ...s, current: i === next }))
      await supabase.from('combat_encounters').update({
        initiative_slots: updated, current_slot_index: next,
        updated_at: new Date().toISOString(),
      }).eq('id', enc.id)
    }
    gmControls?.onAdvanceTurn()
  }, [supabase, gmControls])

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

  const drumTrackProps: DrumTrackProps = {
    drumItems, trackRef, firstRef,
    encounter, character, slotAssignments, portraits, advTokenImages,
    gmControls, visible,
    onSwapOpen:    openSwapPicker,
    onAdvanceTurn: () => void advanceTurnInternal(),
  }

  // ── Swap / pass picker portal ────────────────────────────────────
  const swapPickerPortal = swapAnchor && mounted && createPortal(
    <>
      <div onClick={() => setSwapAnchor(null)} style={{ position: 'fixed', inset: 0, zIndex: Z.backdrop }} />
      <div style={{
        position: 'fixed', top: swapAnchor.top, left: swapAnchor.left,
        transform: 'translateX(-50%)', zIndex: Z.tooltip,
        background: HUD.panel, border: `1px solid ${HUD.borderHi}`,
        borderRadius: RADIUS.lg, padding: SP[1],
        display: 'flex', flexDirection: 'column' as const, gap: SP[1],
        minWidth: '6.875rem',
        boxShadow: 'color-mix(in srgb, var(--hud-bg) 55%, transparent) 0 4px 20px',
      }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase' as const,
          color: HUD.textDim, paddingBottom: SP[1], borderBottom: `1px solid ${HUD.border}`,
        }}>
          {gmControls ? 'Swap with…' : 'Pass to…'}
        </div>
        {encounter.initiative_slots
          .filter(s => {
            if (s.id === swapAnchor.slotId || s.acted) return false
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
          style={{
            position:      'absolute',
            top:           offsetTop ?? 0,
            left: 0, right: 0,
            zIndex:        Z_STRIP,
            display:       'flex',
            flexDirection: 'column',
            pointerEvents: 'none',
            transform:     visible ? 'translateY(0)' : 'translateY(-100%)',
            transition:    `transform ${EASE.panel}`,
          }}
        >
          {/* Drum row */}
          <div style={{ height: stripH, display: 'flex', alignItems: 'flex-end' }}>
            {/* LEFT BOOKEND — round counter */}
            <div style={{
              width: 58, flexShrink: 0, alignSelf: 'stretch',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: SP[2], pointerEvents: 'auto',
            }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, letterSpacing: '0.28em', color: HUD.textFaint, textTransform: 'uppercase' as const }}>
                ROUND
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h2, fontWeight: 900, color: HUD.gold, lineHeight: 1 }}>
                {localRound}
              </div>
            </div>

            {/* CENTER — drum viewport (clip-path extends 100px above for blooms/halos) */}
            <div style={{
              flex: 1, position: 'relative',
              alignSelf: 'stretch', display: 'flex', alignItems: 'flex-end',
              clipPath: 'inset(-100px 0 0 0)',
              pointerEvents: 'auto',
            }}>
              <DrumTrack {...drumTrackProps} />
            </div>
          </div>
        </div>
        {swapPickerPortal}
      </>
    )
  }

  // ── INLINE mode ───────────────────────────────────────────────────
  return (
    <>
      <div style={{
        position: 'relative', zIndex: Z.raised,
        padding: compact ? `${SP[1]} ${SP[2]}` : `${SP[2]} ${SP[3]}`,
        overflowX: 'scroll', overflowY: 'visible', display: 'flex', alignItems: 'center', gap: 0,
      }}>
        {/* Round counter */}
        <div style={{
          flexShrink: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', paddingRight: SP[2], gap: SP[1],
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, letterSpacing: '0.28em', color: HUD.textFaint, textTransform: 'uppercase' as const }}>
            RND
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h2, fontWeight: 900, color: HUD.gold, lineHeight: 1 }}>
            {localRound}
          </div>
        </div>
        <DrumTrack {...drumTrackProps} />
      </div>
      {swapPickerPortal}
    </>
  )
}
