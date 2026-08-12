'use client'

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import gsap from 'gsap'
import type { SupabaseClient } from '@supabase/supabase-js'
import { RichText } from '@/components/ui/RichText'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useTalentSkillRelevance } from '@/hooks/useTalentSkillRelevance'
import { ACTIVATION_TOKEN, Z } from '@/lib/tokens'
import type { CharacterTalent, HudTalent, RefTalent, RefSpecialization, RefForcePower } from '@/lib/types'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import { ForcePowerFocusView } from './ForcePowerFocusView'
import { TalentFocusView } from './TalentFocusView'
import { ForceNameplateField } from './ForceNameplateField'
import styles from './HandOverlay.module.css'

// Phoenix rank-pip mask — approximated path from the reviewed mockups
// (talent-hand-v2/v3.html), ported verbatim pending a final asset from design.
const PHOENIX_MASK =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 4 L60 22 Q56 26 56 32 Q73 30 84 44 Q92 55 90 70 Q80 94 50 97 Q20 94 10 70 Q8 55 16 44 Q27 30 44 32 Q44 26 40 22 Z M50 40 Q38 40 32 50 Q27 59 30 70 Q36 82 50 84 Q64 82 70 70 Q73 59 68 50 Q62 40 50 40 Z'/%3E%3C/svg%3E")`

// Card geometry (172x238, fan spread/rotation math) is ported 1:1 from
// talent-hand-v3.html and lives in HandOverlay.module.css (fixed dimensions)
// plus the fan-layout effect below (spread/rotation, computed once per hand
// size — no fan-internal reorder in H3 either, that's H8).

/** Pure per-slot transform — a separable function of (index, count, spread),
    confirmed in Step 0b. Used both by the layout effect (every card) and by
    H8's drag-drop snap (the dragged card's own final slot), so the two can
    never compute a different answer for the same slot. */
function slotTransform(i: number, n: number, spread: number) {
  const off = i - (n - 1) / 2
  return { x: off * (spread + 46), y: Math.abs(off) * 14, r: off * 6.5 }
}

// `.card`'s CSS sets `transform-origin: 50% 118%` — the fan pivots around a
// point BELOW the card (per the reviewed mockup's "cards held in a hand"
// silhouette), not its own center. Rotating around an off-center pivot adds
// a LATERAL shift beyond the plain `translateX` offset — live-measured and
// confirmed against the actual pivot geometry (card height 238 * (0.5+0.18)
// ≈ 161.8px lever arm): a naive "rotate about center" bounding-box estimate
// under-predicted the outermost card's true on-screen position by ~36px at
// n=5, which is exactly why an earlier version of this fix still collided
// with the discard corner at 1366px despite getting the rotated WIDTH right.
const CARD_W = 172, CARD_H = 238
const PIVOT_LEVER = CARD_H * 0.68 // (0.5 + 0.18), matches transform-origin's 118%

/** True half-extent (center-offset + rotated bounding half-width) of the
    OUTERMOST card's on-screen footprint at a given spread, accounting for
    the off-center pivot above. Pure function of (offMax, spread). */
function outerCardHalfExtent(offMax: number, spread: number): number {
  if (offMax === 0) return CARD_W / 2
  const rotRad = (offMax * 6.5 * Math.PI) / 180
  const translateX = offMax * (spread + 46)
  const extraShift = PIVOT_LEVER * Math.sin(rotRad)
  const centerOffset = Math.abs(translateX) + Math.abs(extraShift)
  const boundHalf = (CARD_W * Math.abs(Math.cos(rotRad)) + CARD_H * Math.abs(Math.sin(rotRad))) / 2
  return centerOffset + boundHalf
}

/** Largest spread (capped 58, floored 18 so cards never fully overlap into
    illegibility) whose outermost card's real on-screen half-extent still
    fits inside `safeHalf` — solved numerically (binary search) rather than
    a closed form, since `outerCardHalfExtent` isn't linear in spread once
    the pivot-shift term is included. `safeHalf: null` (unmeasured corners,
    or tucked) falls back to a generous constant matching the pre-H8
    default's rough scale — collision safety doesn't matter when the stacks
    are hidden anyway. */
function computeFanSpread(n: number, safeHalf: number | null): number {
  if (n <= 1) return 58
  const offMax = (n - 1) / 2
  const half = safeHalf ?? 253
  if (outerCardHalfExtent(offMax, 58) <= half) return 58
  if (outerCardHalfExtent(offMax, 18) > half) return 18
  let lo = 18, hi = 58
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (outerCardHalfExtent(offMax, mid) <= half) lo = mid; else hi = mid
  }
  return lo
}

export interface HandCard {
  key:             string
  kind:            'talent' | 'force'
  /** Raw talent_key for talent cards (unprefixed, species_ stripped) — the
      talent_skill_relevance lookup key. null for Force cards (H5: Force
      relevance is out of scope, that table is talent-keyed only). */
  talentKey:       string | null
  name:            string
  description?:    string
  activationLabel: string   // 'Action' | 'Maneuver' | 'Incidental' | 'Incidental (OOT)' | 'Passive' | 'Force Power'
  headerBg:        string
  headerText:      string
  specLabel:       string | null
  isForceTalent:   boolean
  rank:            number
  isRanked:        boolean
}

// Force-power header colour — no ACTIVATION_TOKEN entry exists for it (that
// map is Passive/Action/Maneuver/Incidental only), so it's composed from
// existing tokens rather than a literal hex: a near-black purple field
// (mixed from --hud-accent-purple, the same sealed hue TalentTree.tsx's
// force glyph and this card's own ✦ spark already use) with the purple's own
// light-tinted foreground text.
// H9 — layered with a faint --force-spark radial so a Force header always
// reads as textured, not flat, EVEN under reduced motion (no shader canvas
// mounts then, per usePrefersReducedMotion — this static gradient IS the
// "layered gradient nameplate" fallback the shader sits on top of when
// motion is allowed). --force-spark is the same token this card's ✦ glyph
// and text-shadow already use — no new literal.
export const FORCE_HEADER_BG   = 'radial-gradient(ellipse 140% 180% at 15% 120%, color-mix(in srgb, var(--force-spark) 16%, transparent) 0%, transparent 65%), color-mix(in srgb, var(--hud-accent-purple) 24%, black)'
export const FORCE_HEADER_TEXT = 'color-mix(in srgb, var(--hud-accent-purple) 25%, white)'

interface HandOverlayProps {
  characterId:     string
  supabase:        SupabaseClient
  talents:         CharacterTalent[]
  hudTalents:      HudTalent[]
  refTalentMap:    Record<string, RefTalent>
  refSpecMap:      Record<string, RefSpecialization>
  allForcePowers:  ForcePowerDisplay[]
  refForcePowerMap: Record<string, RefForcePower>
  /** The skill key of the currently-active Skill or Combat Check, if any
      (H5) — null when no check is active. Force cards never glow regardless
      (talent_skill_relevance is talent-keyed only). */
  activeCheckSkillKey?: string | null
  /** Hand-of-cards tuck/discard state — lifted to PlayerHUDDesktop so the
      left rail's toggle can read/set `tucked` too (this prompt); discard
      state was already write-heavy enough to keep the same lift. */
  tucked:          boolean
  discardedKeys:   string[]
  discardCard:     (key: string) => void
  returnCard:      (key: string) => void
  /** H8 — persisted card order (partial ordering hint: a card whose key is
      absent — new arrival, or never-yet-reordered — is appended in its
      existing default position, never dropped; see `orderedFanCards` below).
      `reorderCards` writes the full order once per completed drag, not per
      pixel of live-shuffle. */
  cardOrder:       string[]
  reorderCards:    (next: string[]) => void
  /** Map panel's DOM node — deck/discard corners anchor to its bounds via
      ResizeObserver rather than the viewport, so they clear the roll feed
      and stay put through notifications-drawer resizes (see the design
      note for this prompt). */
  mapPanelRef:     RefObject<HTMLDivElement | null>
  /** H7 — "Play Power" in the Force-power focus view opens the Force Check
      modal with this power pre-selected; owned by PlayerHUDDesktop
      (forceCheckOpen lives there), forwarded straight through. */
  onPlayPower:     (powerKey: string) => void
}

const ACTIVATION_KEY_BY_LABEL: Record<string, keyof typeof ACTIVATION_TOKEN> = {
  Action: 'active',
  Maneuver: 'maneuver',
  Incidental: 'incidental',
  'Incidental (OOT)': 'incidental',
  Passive: 'passive',
}

/** Real spec key for a hudTalents entry — species-rank grants prefix their
    `.key` with `species_`; everything else's `.key` IS the raw talent_key. */
function rawTalentKey(ht: HudTalent): string {
  return ht.key.startsWith('species_') ? ht.key.slice('species_'.length) : ht.key
}

export function HandOverlay({
  characterId, supabase, talents, hudTalents, refTalentMap, refSpecMap, allForcePowers, refForcePowerMap,
  activeCheckSkillKey = null,
  tucked, discardedKeys, discardCard, returnCard, cardOrder, reorderCards, mapPanelRef, onPlayPower,
}: HandOverlayProps) {
  useEffect(() => {
    document.documentElement.style.setProperty('--phx-mask', PHOENIX_MASK)
  }, [])

  // H5 — check-time glow. Set-membership check per card (a talent can map to
  // more than one skill); Force cards (talentKey === null) never match.
  const talentSkillMap = useTalentSkillRelevance(supabase)
  function isRelevant(card: HandCard): boolean {
    if (!activeCheckSkillKey || !card.talentKey) return false
    return talentSkillMap[card.talentKey]?.has(activeCheckSkillKey) ?? false
  }

  const prefersReducedMotion = usePrefersReducedMotion()

  // ── Map-panel-anchored corners — deck/discard stacks track the map
  // panel's bottom corners (inset by --space-4) instead of the viewport, so
  // they clear the top-right roll feed and move correctly with the panel
  // through notifications-drawer opens / viewport resizes. HandOverlay mounts
  // outside the grid the map panel lives in, so this has to be ref-measured
  // (ResizeObserver), not plain CSS anchoring — see the design note. ──
  const CORNER_INSET = 16 // px — matches --space-4, hardcoded because this is a computed `fixed` coordinate, not a CSS declaration that can reference the token
  const [corners, setCorners] = useState<{ left: number; right: number; bottom: number } | null>(null)
  useEffect(() => {
    const el = mapPanelRef.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      setCorners({
        left: r.left + CORNER_INSET,
        right: window.innerWidth - r.right + CORNER_INSET,
        bottom: window.innerHeight - r.bottom + CORNER_INSET,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [mapPanelRef])
  const [showPassives, setShowPassives] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)
  // H6 — Force power focus view. Talent cards stay inert on click (per H2's
  // original design intent); only Force cards open, keyed by powerKey so the
  // full ForcePowerDisplay (treeNodes/treeConnections/abilities) can be
  // re-resolved from allForcePowers rather than carried on the card itself.
  const [focusPowerKey, setFocusPowerKey] = useState<string | null>(null)
  const focusPower = focusPowerKey ? allForcePowers.find(fp => fp.powerKey === focusPowerKey) ?? null : null
  // Talent card focus view — same click-to-open interaction, now extended to
  // talent cards (this prompt intentionally adds it; H2's original inert-on-
  // click behavior for talents was a stated design intent then, not a bug).
  const [focusTalentKey, setFocusTalentKey] = useState<string | null>(null)

  // ── Single card builder, shared by active talents AND passives — the two
  // differ only in which hudTalents subset feeds it, never in per-card shape.
  // Reusing this (rather than a second builder) is what lets the passive-deck
  // grid and the discard grid render through the exact same <CardFace/>. ──
  function buildTalentCard(ht: HudTalent): HandCard {
    const rawKey = rawTalentKey(ht)
    const ref = refTalentMap[rawKey]
    // Source spec: read from the RAW CharacterTalent[] array, never
    // hudTalents (which collapses multi-spec ownership away — H0's finding).
    // A talent owned via more than one spec shows the first owning spec found
    // in that array — a stated simplification, not a canonical claim.
    // Species-granted talents with no owned CharacterTalent row have no raw
    // row at all — specLabel is "Species" for those instead of null.
    const rawRow = talents.find(t => t.talent_key === rawKey)
    const specKey = rawRow?.specialization_key
    const specLabel = specKey ? (refSpecMap[specKey]?.name ?? null) : (ht.isSpeciesGranted ? 'Species' : null)
    const activationKey = ACTIVATION_KEY_BY_LABEL[ht.activation] ?? 'incidental'

    return {
      key: ht.key,
      kind: 'talent',
      talentKey: rawKey,
      name: ht.name,
      description: ht.description,
      activationLabel: ht.activation,
      headerBg: ACTIVATION_TOKEN[activationKey].bg,
      headerText: ACTIVATION_TOKEN[activationKey].text,
      specLabel,
      isForceTalent: ref?.is_force_talent ?? false,
      rank: ht.rank,
      isRanked: ref?.is_ranked ?? false,
    }
  }

  const activeTalentCards = useMemo(
    () => hudTalents.filter(ht => ht.activation !== 'Passive').map(buildTalentCard),
    [hudTalents, refTalentMap, talents, refSpecMap], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const passiveCards = useMemo(
    () => hudTalents.filter(ht => ht.activation === 'Passive').map(buildTalentCard),
    [hudTalents, refTalentMap, talents, refSpecMap], // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Force power base nodes only. basicAbilityKey is the structural base-node
  // identifier fixed in the earlier Force overhaul (row 0 / span-4 — resolved
  // once in useForcePowers.ts, not re-derived here). Upgrade nodes never
  // appear here; they belong to the H6 focus view.
  const forceCards = useMemo((): HandCard[] => {
    const out: HandCard[] = []
    for (const fp of allForcePowers) {
      if (!fp.basicAbilityKey) continue
      const baseAbility = fp.abilities.find(a => a.key === fp.basicAbilityKey)
      if (!baseAbility || baseAbility.purchasedRanks <= 0) continue
      const minFR = refForcePowerMap[fp.powerKey]?.min_force_rating
      out.push({
        key: `force_${fp.powerKey}`,
        kind: 'force',
        talentKey: null,
        name: fp.powerName,
        description: baseAbility.description,
        activationLabel: 'Force Power',
        headerBg: FORCE_HEADER_BG,
        headerText: FORCE_HEADER_TEXT,
        specLabel: minFR ? `FR ${minFR}+` : null,
        isForceTalent: true,
        rank: 0,
        isRanked: false,
      })
    }
    return out
  }, [allForcePowers, refForcePowerMap])

  // Card keys discardable in H3 are exactly the H2 hand's own contents —
  // active talents + Force base powers, using the SAME composite key scheme
  // H2 already established (talent keys unprefixed except species_-granted
  // ones; Force cards prefixed `force_<powerKey>`). That scheme already
  // disambiguates talent vs Force power on read, so discarded_keys entries
  // need no further tagging — confirmed in Step 0, not a new decision.
  const ownedCards = useMemo(() => [...activeTalentCards, ...forceCards], [activeTalentCards, forceCards])
  const focusTalentCard = focusTalentKey ? ownedCards.find(c => c.key === focusTalentKey) ?? null : null
  const discardedSet = useMemo(() => new Set(discardedKeys), [discardedKeys])
  const fanCards = useMemo(() => ownedCards.filter(c => !discardedSet.has(c.key)), [ownedCards, discardedSet])
  const discardedCards = useMemo(() => ownedCards.filter(c => discardedSet.has(c.key)), [ownedCards, discardedSet])

  // ── H8 — order merge. `cardOrder` is a PARTIAL ordering hint (H1's schema
  // intent, confirmed in Step 0): a card whose key isn't in it — never
  // reordered yet, a fresh purchase, or one just back from the discard pile —
  // appends in fanCards' own existing (default) order rather than vanishing.
  // A card that WAS in cardOrder before being discarded keeps its saved slot
  // (its key simply isn't found in `fanCards` while discarded, so `known`
  // filters it out of `ordered` for that render only — nothing is mutated),
  // so returning it lands it back where it was, not at the end. ──
  const orderedFanCards = useMemo(() => {
    const byKey = new Map(fanCards.map(c => [c.key, c] as const))
    const seen = new Set<string>()
    const ordered: HandCard[] = []
    for (const key of cardOrder) {
      const c = byKey.get(key)
      if (c && !seen.has(key)) { ordered.push(c); seen.add(key) }
    }
    for (const c of fanCards) if (!seen.has(c.key)) ordered.push(c)
    return ordered
  }, [cardOrder, fanCards])

  // ── H9 — visible Force POWER card keys (kind === 'force' only), in the
  // SAME visible set the fan actually renders (`orderedFanCards` — discarded
  // cards drop out automatically, matching H8's own discard/return handling;
  // no separate tracking needed). Recomputed only when membership/order
  // changes, not per frame — ForceNameplateField reads this via a ref and
  // measures each key's live header rect itself every frame. ──
  const forceCardKeys = useMemo(
    () => orderedFanCards.filter(c => c.kind === 'force').map(c => c.key),
    [orderedFanCards],
  )

  // ── H8 — live drag-reorder preview. null outside of an in-progress
  // reorder drag; while dragging, holds the full key order INCLUDING the
  // dragged card's live slot, recomputed as slot boundaries are crossed. The
  // layout effect below renders from this when present, falling back to
  // `orderedFanCards` (the persisted-plus-merge view) otherwise — so a drag
  // never touches `cardOrder`/the DB until it completes (Step 2: "write on
  // reorder completion", not per pixel). ──
  const [dragOrderKeys, setDragOrderKeys] = useState<string[] | null>(null)
  const displayCards = useMemo(() => {
    if (!dragOrderKeys) return orderedFanCards
    const byKey = new Map(orderedFanCards.map(c => [c.key, c] as const))
    return dragOrderKeys.map(k => byKey.get(k)).filter((c): c is HandCard => !!c)
  }, [dragOrderKeys, orderedFanCards])

  // ── H8 — viewport-aware fan width (Step 0f: available space between the
  // two corner stacks is the correct basis, not raw viewport width alone —
  // it already folds in the map panel's own width via `corners` (H-chrome
  // prompt's ResizeObserver) and degrades safely when `corners` is unknown
  // (pre-measure, or tucked — the stacks are hidden then too, so a generous
  // fallback is harmless). `fanSafeHalf` is the raw available half-width on
  // the tighter side, in px — card-rotation geometry is deliberately NOT
  // baked in here (it depends on card COUNT, via `computeFanSpread` below),
  // only on `corners`/viewport, which is what actually changes on resize. ──
  const fanSafeHalf = useMemo(() => {
    if (typeof window === 'undefined' || !corners) return null
    const vw = window.innerWidth
    const STACK_WIDTH = 84 // .deckStack width (HandOverlay.module.css)
    const MARGIN       = 20
    const leftSafe  = vw / 2 - corners.left  - STACK_WIDTH - MARGIN
    const rightSafe = vw / 2 - corners.right - STACK_WIDTH - MARGIN
    return Math.max(80, Math.min(leftSafe, rightSafe))
  }, [corners])

  // ── Fan layout — computed on every fan-membership/order change, AND on
  // every card-count/spread change (viewport-aware fan width above), so
  // slot positions never drift stale after a reorder. Reused verbatim from
  // H2/H3 for the per-slot transform math (now `slotTransform`, extracted
  // above); H8 adds two things: (1) it reads `displayCards` (drag-preview-
  // aware) instead of raw `fanCards`, and (2) it skips tweening AND skips
  // writing the home dataset for the ACTIVELY DRAGGED card — that card is
  // being positioned directly by the pointer in handleCardPointerMove, which
  // anchors to the home it captured at drag-START (frozen in `dragRef`), not
  // to a live-updating dataset value. Letting this effect keep rewriting
  // that dataset while dragging caused a real, live-caught bug: pointermove
  // used to re-read `el.dataset.homeX` every tick and add the CUMULATIVE
  // pointer delta on top, so each time live-shuffle moved the dragged card's
  // own slot, the anchor jumped too and the card ran away from the pointer,
  // compounding with every boundary crossing — confirmed via Playwright
  // (drag drifted off the discard pile's hit-test rect on longer drags). ──
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  // Declared here (rather than down by the other drag state) because the
  // layout effect below needs to read it to skip the dragged card.
  const dragRef = useRef<{ key: string; startX: number; startY: number; moved: boolean; homeX: number; homeY: number } | null>(null)
  useEffect(() => {
    const n = displayCards.length
    if (n === 0) return
    const spread = computeFanSpread(n, fanSafeHalf)
    displayCards.forEach((c, i) => {
      const el = cardRefs.current.get(c.key)
      if (!el) return
      if (dragRef.current?.key === c.key) return // pointer owns this card's home/transform right now
      const { x, y, r } = slotTransform(i, n, spread)
      el.dataset.homeX = String(x)
      el.dataset.homeY = String(y)
      el.dataset.homeR = String(r)
      el.style.zIndex = String(10 + i)
      if (prefersReducedMotion) {
        gsap.set(el, { x, y, rotation: r, scale: 1 })
      } else {
        gsap.to(el, { x, y, rotation: r, scale: 1, duration: 0.45, ease: 'power3.out' })
      }
    })
  }, [displayCards, fanSafeHalf, prefersReducedMotion])

  // Entrance — cards rise from below once on mount only, not on every discard/
  // return (those already animate via the layout effect above + the drag/
  // return handlers below). Gated on the FIRST time the fan goes non-empty.
  const enteredRef = useRef(false)
  useEffect(() => {
    if (enteredRef.current || prefersReducedMotion || fanCards.length === 0) return
    enteredRef.current = true
    const els = fanCards.map(c => cardRefs.current.get(c.key)).filter((el): el is HTMLDivElement => !!el)
    if (els.length === 0) return
    gsap.from(els, { y: 220, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, delay: 0.3 })
  }, [fanCards, prefersReducedMotion])

  // ── Hover lift — GSAP y-lift + drop-shadow only, never boxShadow/border,
  // so it can never fight the card's own border-colour/glow styling (same
  // convention EncounterDeck's EntityCard hover uses, H0's audit). Suppressed
  // while a drag is in progress (dragRef, declared above with cardRefs) so
  // the lift tween doesn't fight the drag's own gsap.set calls. ──
  function handleEnter(el: HTMLDivElement) {
    if (prefersReducedMotion || dragRef.current) return
    gsap.to(el, { y: -64, rotation: 0, scale: 1.13, duration: 0.35, ease: 'power3.out' })
    el.style.zIndex = '40'
    el.style.filter = 'drop-shadow(0 22px 30px rgba(0,0,0,0.55))'
  }
  function handleLeave(el: HTMLDivElement) {
    if (prefersReducedMotion || dragRef.current) return
    const x = Number(el.dataset.homeX ?? 0)
    const y = Number(el.dataset.homeY ?? 0)
    const r = Number(el.dataset.homeR ?? 0)
    gsap.to(el, { x, y, rotation: r, scale: 1, duration: 0.45, ease: 'power3.out' })
    el.style.zIndex = ''
    el.style.filter = ''
  }

  // ── Drag-to-discard — lightweight native pointer events, matching the
  // reviewed mockup, NOT dnd-kit. This project's one existing dnd-kit usage
  // (InitiativeSetupModal.tsx) is exclusively useSortable/SortableContext —
  // reordering within/between lists. Discard is a different shape: one card
  // dragged onto ONE static drop target, never reordered against siblings.
  // dnd-kit's sortable machinery (collision strategy, SortableContext,
  // DragOverlay) solves a problem this interaction doesn't have; the mockup's
  // ~40-line pointerdown/move/up + setPointerCapture + rect hit-test already
  // does exactly what's needed and is what was reviewed/approved. ──
  const discardPileRef = useRef<HTMLButtonElement>(null)
  const handRef = useRef<HTMLDivElement>(null)
  const [pileHover, setPileHover] = useState(false)
  const MOVE_THRESHOLD = 6 // px — below this, a pointerdown+up is a click, not a drag

  function handleCardPointerDown(e: ReactPointerEvent<HTMLDivElement>, key: string) {
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    // H8 — anchor frozen at drag START, not re-read from the (live-shuffling)
    // dataset on every move. See the layout effect's comment above for the
    // drift bug this fixes.
    const homeX = Number(el.dataset.homeX ?? 0)
    const homeY = Number(el.dataset.homeY ?? 0)
    dragRef.current = { key, startX: e.clientX, startY: e.clientY, moved: false, homeX, homeY }
    gsap.set(el, { zIndex: 70 })
    el.classList.add(styles.dragging)
  }
  function handleCardPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.key !== (e.currentTarget.dataset.cardKey)) return
    const el = e.currentTarget
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (Math.hypot(dx, dy) > MOVE_THRESHOLD) drag.moved = true
    if (!drag.moved) return
    gsap.set(el, { x: drag.homeX + dx, y: drag.homeY + dy, rotation: 0, scale: 1.05 })
    const pile = discardPileRef.current
    if (pile) {
      const pr = pile.getBoundingClientRect()
      const cr = el.getBoundingClientRect()
      const over = cr.left < pr.right && cr.right > pr.left && cr.top < pr.bottom && cr.bottom > pr.top
      setPileHover(over)
    }

    // ── H8 — live-shuffle. Slot boundary crossing is measured from the
    // dragged card's own current on-screen center relative to the fan's own
    // center (not the pointer directly — the card already tracks the
    // pointer 1:1 above, so its rect IS the pointer position, offset by
    // where the grab happened). Runs unconditionally while moved, including
    // while hovering the discard pile — harmless, since pointerup's discard
    // branch is checked FIRST and wins regardless of any live reorder
    // computed underneath it (unambiguous precedence, per Step 0). ──
    const handEl = handRef.current
    if (handEl) {
      const handRect = handEl.getBoundingClientRect()
      const centerX = handRect.left + handRect.width / 2
      const cardRect = el.getBoundingClientRect()
      const cardCenterX = cardRect.left + cardRect.width / 2
      const baseline = dragOrderKeys ?? orderedFanCards.map(c => c.key)
      const n = baseline.length
      if (n > 0) {
        const spread = computeFanSpread(n, fanSafeHalf)
        const rawIdx = (cardCenterX - centerX) / (spread + 46) + (n - 1) / 2
        const targetIdx = Math.max(0, Math.min(n - 1, Math.round(rawIdx)))
        const currentIdx = baseline.indexOf(drag.key)
        if (currentIdx !== -1 && targetIdx !== currentIdx) {
          const next = baseline.slice()
          next.splice(currentIdx, 1)
          next.splice(targetIdx, 0, drag.key)
          setDragOrderKeys(next)
        }
      }
    }
  }
  function handleCardPointerUp(e: ReactPointerEvent<HTMLDivElement>, key: string) {
    const drag = dragRef.current
    dragRef.current = null
    const el = e.currentTarget
    el.style.zIndex = ''
    el.classList.remove(styles.dragging)
    if (!drag || drag.key !== key) return
    const pile = discardPileRef.current
    const overPile = pileHover
    setPileHover(false)
    if (drag.moved && overPile && pile) {
      // Animate the card shrinking into the pile, then commit the discard —
      // matches the optimistic-then-persist model from useHandState: local
      // fan membership updates the instant the DB write is queued, not after
      // it resolves (same shape as useMapTokens' removeToken, H0's audit).
      gsap.to(el, {
        scale: 0.4, opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => discardCard(key),
      })
      // H8 — discard wins hit-test precedence; drop any live reorder preview
      // unpersisted (orderedFanCards naturally excludes the discarded key
      // next render regardless, this just avoids a stale intermediate frame).
      setDragOrderKeys(null)
    } else if (drag.moved) {
      // H8 — snap to the FINAL slot, computed directly from the same order
      // array that's about to be persisted (or the unchanged current order,
      // if this drag never crossed a boundary) — not from `el.dataset.home*`,
      // which the layout effect deliberately never wrote for this card while
      // it was being dragged (see that effect's comment).
      const finalOrder = dragOrderKeys ?? orderedFanCards.map(c => c.key)
      const n = finalOrder.length
      const idx = finalOrder.indexOf(key)
      if (n > 0 && idx !== -1) {
        const spread = computeFanSpread(n, fanSafeHalf)
        const { x, y, r } = slotTransform(idx, n, spread)
        gsap.to(el, { x, y, rotation: r, scale: 1, duration: 0.45, ease: 'power3.out' })
      }
      // H8 — reorder completion: write once here, not per slot-boundary
      // crossing during the drag (Step 2). dragOrderKeys is null when the
      // drag never actually crossed a slot boundary (e.g. a pure toward-
      // discard-and-back drag, or vertical-only movement) — nothing to
      // persist in that case.
      if (dragOrderKeys) {
        reorderCards(dragOrderKeys)
        setDragOrderKeys(null)
      }
    } else {
      // A tap with no movement is a click. Force cards open H6's focus view;
      // talent cards now open this prompt's lattice-less TalentFocusView —
      // both give full un-clamped text, matching each card kind's own shape.
      const card = ownedCards.find(c => c.key === key)
      if (card?.kind === 'force') {
        const powerKey = card.key.slice('force_'.length)
        setFocusPowerKey(powerKey)
      } else if (card?.kind === 'talent') {
        setFocusTalentKey(card.key)
      }
    }
  }

  // Empty state: nothing rendered when there is NOTHING to show anywhere —
  // no fan cards, no passives, no discards. Any one of those existing gives
  // the deck/discard triggers a reason to be on screen even if the fan itself
  // is momentarily empty (e.g. everything discarded) — so the overlay only
  // fully disappears when the character truly has no hand-eligible talents
  // or Force powers at all AND nothing shelved.
  if (fanCards.length === 0 && passiveCards.length === 0 && discardedCards.length === 0) return null

  return (
    <>
      {/* Z.popover (420) — see the full reasoning where it's set below; the
          same tier is used for every element this component renders
          (fan, tuck control, deck/discard triggers, and their grid overlays),
          relying on DOM order (later JSX = later paint) for correct stacking
          among siblings at the same z-index rather than inventing new tiers. */}
      <div className={`${styles.handZone} ${tucked ? styles.handZoneTucked : ''}`} style={{ zIndex: Z.popover }}>
        <div className={styles.hand} ref={handRef}>
          {/* H8 — deliberately rendered in `orderedFanCards` (STABLE) order,
              never `displayCards` (the live drag-preview order): reordering
              actual DOM nodes mid-drag silently breaks native
              setPointerCapture (confirmed live — pointerup stopped reaching
              this element's own handler the instant its DOM position moved,
              even though the browser-level pointerup still fired). Visual
              slot position is driven entirely by the layout effect's gsap
              transforms (keyed by card key via cardRefs, independent of DOM
              order), so `displayCards` still drives what's ON SCREEN without
              ever touching the DOM's actual child order. */}
          {orderedFanCards.map(c => (
            <div
              key={c.key}
              data-card-key={c.key}
              ref={el => { if (el) cardRefs.current.set(c.key, el); else cardRefs.current.delete(c.key) }}
              className={`${styles.card} ${c.kind === 'force' ? styles.forceCard : ''} ${isRelevant(c) ? styles.relevant : ''}`}
              onMouseEnter={e => handleEnter(e.currentTarget)}
              onMouseLeave={e => handleLeave(e.currentTarget)}
              onPointerDown={e => handleCardPointerDown(e, c.key)}
              onPointerMove={handleCardPointerMove}
              onPointerUp={e => handleCardPointerUp(e, c.key)}
            >
              <CardFace card={c} />
            </div>
          ))}
        </div>
      </div>

      {/* ── H9 — shared Force-nameplate shader canvas. Mount/unmount IS the
          gate (matches ForcePresenceCard's own PresenceSmoke convention):
          tucking, or the fan having zero visible Force cards, or reduced
          motion, all unmount this and run its full WebGL teardown rather
          than merely hiding a still-running canvas. Placed right after the
          fan (later DOM = paints on top of the cards) and before the deck/
          discard corners and any grid/focus overlays. ── */}
      {!tucked && !prefersReducedMotion && forceCardKeys.length > 0 && (
        <ForceNameplateField cardRefs={cardRefs} forceCardKeys={forceCardKeys} />
      )}

      {/* ── Passive deck trigger — anchored to the map panel's bottom-left
          corner (ref-measured, see `corners` above), clear of the fan at any
          hand size. Tucking hides it entirely — "not thinking about cards"
          clears the whole system except the rail's own toggle. ── */}
      {!tucked && corners && (
        <div className={styles.deckCorner} style={{ zIndex: Z.popover, left: corners.left, bottom: corners.bottom }}>
          <button
            type="button"
            className={styles.deckStack}
            onClick={() => setShowPassives(true)}
            title="View passive talents"
          >
            <span className={styles.deckStackCard1} />
            <span className={styles.deckStackCard2} />
            <span className={styles.deckStackFace}>
              <span className={styles.deckStackN}>{passiveCards.length}</span>
              <span className={styles.deckStackL}>Passive</span>
            </span>
          </button>
        </div>
      )}

      {/* ── Discard pile — map panel's bottom-right corner. Tuck control
          moved into the left rail (this prompt); no longer rendered here. ── */}
      {!tucked && corners && (
        <div className={styles.discardCorner} style={{ zIndex: Z.popover, right: corners.right, bottom: corners.bottom }}>
          {/* Always rendered (a live drop target even at 0), dashed border per
              the reviewed mockup's visual language. */}
          <button
            ref={discardPileRef}
            type="button"
            className={`${styles.deckStack} ${styles.discardStack} ${pileHover ? styles.discardStackHover : ''}`}
            onClick={() => { if (!dragRef.current) setShowDiscard(true) }}
            title="Discarded talents"
          >
            <span className={`${styles.deckStackCard1} ${styles.discardCard}`} />
            <span className={`${styles.deckStackCard2} ${styles.discardCard}`} />
            <span className={`${styles.deckStackFace} ${styles.discardCard}`}>
              <span className={styles.deckStackN}>{discardedCards.length}</span>
              <span className={styles.deckStackL}>Discard</span>
            </span>
          </button>
        </div>
      )}

      {showPassives && (
        <CardGridOverlay
          title="Passive Talents"
          cards={passiveCards}
          emptyText="No passive talents owned."
          onClose={() => setShowPassives(false)}
        />
      )}

      {showDiscard && (
        <CardGridOverlay
          // Shortened from "Discarded — hover a card to take back" — that
          // string, at .gridTitle's heavy 0.3em letter-spacing, exceeded the
          // width .gridPanel's min-width (600px) minus the space reserved
          // for .gridClose (H3), truncating to "…TAKE BA…". Same meaning,
          // fits the existing budget rather than chasing a new min-width.
          title="Discarded — hover to take back"
          cards={discardedCards}
          emptyText="No talents discarded."
          onClose={() => setShowDiscard(false)}
          onReturn={key => returnCard(key)}
        />
      )}

      {focusPower && (
        <ForcePowerFocusView power={focusPower} onClose={() => setFocusPowerKey(null)} onPlayPower={onPlayPower} />
      )}

      {focusTalentCard && (
        <TalentFocusView card={focusTalentCard} onClose={() => setFocusTalentKey(null)} />
      )}
    </>
  )
}

// ── Shared card visual — used by the fan, the passive-deck grid, the
// discard grid, AND the talents route's ephemeral hand-reveal ceremony
// (H4b) — one implementation, never a second renderer. ──
export function CardFace({ card }: { card: HandCard }) {
  return (
    <>
      {/* data-force-nameplate — H9's shared canvas queries this to find each
          Force POWER card's header sub-rect (kind === 'force' only, not
          isForceTalent — a force-flavoured TALENT card is not a Force power
          and gets no shader). Harmless no-op attribute on every other card. */}
      <div
        className={styles.cardHeader}
        data-force-nameplate={card.kind === 'force' ? 'true' : undefined}
        style={{ background: card.headerBg, color: card.headerText }}
      >
        <span>{card.name}</span>
        {card.isForceTalent && <span className={styles.forceGlyph}>✦</span>}
      </div>
      <div className={styles.cardMeta}>
        <span className={styles.cardType}>{card.activationLabel}</span>
        {card.specLabel && <span className={styles.cardSpec}>{card.specLabel}</span>}
      </div>
      <div className={styles.cardBody}>
        {card.description && <RichText text={card.description} />}
      </div>
      <div className={styles.cardFooter}>
        {card.isRanked && card.rank > 0 && (
          <div className={styles.ranks}>
            {Array.from({ length: card.rank }, (_, i) => <span key={i} className={styles.phoenix} />)}
          </div>
        )}
      </div>
    </>
  )
}

// ── Shared grid overlay — passive deck viewer AND discard viewer both mount
// this; `onReturn` presence is the only behavioural difference (discard gets
// a "return to hand" action, passive view is pure read-only). ──
function CardGridOverlay({
  title, cards, emptyText, onClose, onReturn,
}: {
  title: string
  cards: HandCard[]
  emptyText: string
  onClose: () => void
  onReturn?: (key: string) => void
}) {
  return (
    <div className={styles.gridBackdrop} style={{ zIndex: Z.popover }} onClick={onClose}>
      <div className={styles.gridPanel} onClick={e => e.stopPropagation()}>
        <div className={styles.gridTitle}>{title}</div>
        <button type="button" className={styles.gridClose} onClick={onClose}>✕ Close</button>
        {cards.length === 0 ? (
          <div className={styles.gridEmpty}>{emptyText}</div>
        ) : (
          <div className={styles.grid}>
            {cards.map(c => (
              <div key={c.key} className={`${styles.card} ${styles.gridCard} ${c.kind === 'force' ? styles.forceCard : ''}`}>
                <CardFace card={c} />
                {onReturn && (
                  <button type="button" className={styles.takeback} onClick={() => onReturn(c.key)}>
                    ↑ Return to hand
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
