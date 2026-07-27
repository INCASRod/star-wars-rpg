'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import gsap from 'gsap'
import type { Character } from '@/lib/types'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import { adversaryToInstance, fetchAdversaries, dbRowToAdversary, type Adversary, type AdversaryInstance } from '@/lib/adversaries'
import { vehicleToVehicleInstance, fetchVehicles, dbRowToVehicle, type Vehicle, type VehicleInstance } from '@/lib/vehicles'
import type { MapToken } from '@/hooks/useMapTokens'
import { useEncounterCombatControls } from '@/hooks/useEncounterCombatControls'
import { createClient } from '@/lib/supabase/client'
import { randomUUID } from '@/lib/utils'
import { HUD, FS, SP, FONT_BODY, FONT_DISPLAY, RADIUS, Z, EASE, COLOR } from '@/lib/tokens'

const FC = FONT_BODY
const FD = FONT_DISPLAY
const RED = COLOR.red
const GREEN = COLOR.green
const BORDER_HI = 'var(--hud-border-hi)'
const PANEL_BG = 'color-mix(in srgb, var(--hud-panel) 92%, transparent)'

// Every new adversary/vehicle used to spawn at a hardcoded (0.5, 0.5) — fine
// for the first add, but each subsequent one landed exactly on top of
// whatever was already there. Visually that reads as "the new token doesn't
// show up," since only one token in a stack of exactly-overlapping tokens is
// visible (whichever happens to be topmost in render order, which — because
// the map_tokens SELECT has no ORDER BY — isn't even guaranteed consistent
// between two independent page loads). A golden-angle spiral spreads
// successive spawns out from centre without needing a fixed pattern table.
function spawnPosition(existingCount: number): { x: number; y: number } {
  if (existingCount <= 0) return { x: 0.5, y: 0.5 }
  const angle  = existingCount * 137.5 * (Math.PI / 180)
  const radius = 0.05 + 0.015 * Math.floor(existingCount / 6)
  return {
    x: Math.min(0.95, Math.max(0.05, 0.5 + Math.cos(angle) * radius)),
    y: Math.min(0.95, Math.max(0.05, 0.5 + Math.sin(angle) * radius)),
  }
}

export interface EncounterDeckProps {
  campaignId:          string
  encounter:           CombatEncounter | null
  setEncounter:        React.Dispatch<React.SetStateAction<CombatEncounter | null>>
  saveEncounter:       (partial: Partial<CombatEncounter>) => Promise<void>
  tokens:              MapToken[]
  addToken:            (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  removeToken:         (id: string) => Promise<void>
  toggleVisibility:    (id: string, visible: boolean) => Promise<void>
  updateTokenWoundPct: (id: string, wound_pct: number) => Promise<void>
  markPending:         (key: string) => void
  clearPending:        (key: string) => void
  stagingAddToEncounter: (adv: import('@/lib/adversaries').Adversary, alignment: 'enemy' | 'allied_npc') => Promise<void>
  open:                boolean
  onOpenChange:        (open: boolean) => void
  characters:          Character[]
  onMapAreaResize?:    () => void
  focusedEntityId?:    string | null
  onOpenDossier?:      (entityId: string, rect: DOMRect) => void
  /** Shared card↔token hover-glow signal (Prompt 5) — a map_tokens.id, not an instanceId. */
  hoveredTokenId?:     string | null
  onHoverToken?:       (tokenId: string | null) => void
  /**
   * Active map id for newly-created tokens. Required — falling back to
   * `tokens[0]?.map_id` here previously created corrupt `map_tokens` rows
   * (`map_id: ''`) whenever the deck was opened on a map with zero existing
   * tokens. Every mount (including GmMapView.tsx's Task-9 temporary stub)
   * must pass the real `activeMap?.id ?? null`.
   */
  activeMapId:         string | null
  /**
   * Name/key-keyed token image maps — owned by GmMapView (a single shared
   * hook instance) and passed down here, rather than each component calling
   * useAdversaryTokenImages/useVehicleTokenImages itself. EncounterDossier
   * is a SIBLING of EncounterDeck (not a child), so a separate hook call in
   * each would give each component its own independent React state; an
   * image uploaded via the dossier would update the dossier's own copy but
   * never reach the deck's roster card, which would keep rendering the old
   * image (or the letter placeholder) until a full page reload. Sharing one
   * instance from their common parent fixes that.
   */
  advImages:           Record<string, string>
  vehImages:           Record<string, string>
}

export function EncounterDeck({
  campaignId, encounter, setEncounter, saveEncounter, tokens,
  addToken, removeToken, toggleVisibility, updateTokenWoundPct,
  markPending, clearPending, stagingAddToEncounter,
  open, onOpenChange, characters, onMapAreaResize, focusedEntityId,
  activeMapId, onOpenDossier, hoveredTokenId, onHoverToken,
  advImages, vehImages,
}: EncounterDeckProps) {
  const supabase = useMemo(() => createClient(), [])
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [search, setSearch] = useState('')

  // Adversary/vehicle ref-data candidates, fetched once via the same
  // reusable fetchAdversaries()/fetchVehicles() exports AdversaryLibrary and
  // VehicleLibrary themselves already use, PLUS each one's custom-DB row set
  // (ref_adversaries / ref_vehicles) merged in — AdversaryLibrary.tsx and
  // VehicleLibrary.tsx both do this same merge; the deck's own inline search
  // (below, replacing the previous full-panel AdversaryLibrary/VehicleLibrary
  // mount) had only ever reused the oggdude-json half of that pair, so
  // GM-created custom adversaries/vehicles never appeared in this search.
  const [offMapCandidates, setOffMapCandidates] = useState<Adversary[]>([])
  const [vehicleCandidates, setVehicleCandidates] = useState<Vehicle[]>([])
  useEffect(() => {
    let cancelled = false
    Promise.all([fetchAdversaries(), supabase.from('ref_adversaries').select('*').order('name')])
      .then(([oggdude, custom]) => {
        if (cancelled) return
        const customAdvs = (custom.data ?? []).map(r => dbRowToAdversary(r as Record<string, unknown>))
        setOffMapCandidates([...oggdude, ...customAdvs])
      }).catch(() => {})
    Promise.all([fetchVehicles(), supabase.from('ref_vehicles').select('*').order('name')])
      .then(([oggdude, custom]) => {
        if (cancelled) return
        const customVehs = (custom.data ?? []).map(r => dbRowToVehicle(r as Record<string, unknown>))
        setVehicleCandidates([...oggdude, ...customVehs])
      }).catch(() => {})
    return () => { cancelled = true }
  }, [supabase])
  // Shared default alignment for the "OFF-MAP" popup button — one small
  // toggle instead of a per-card sub-choice.
  const [offMapAlignment, setOffMapAlignment] = useState<'enemy' | 'allied_npc'>('enemy')

  // Deck-native inline search results — plain name substring match only, no
  // filter chips (descoped per Prompt 3: the GM is expected to know the
  // name). Combines both ref lists into one result set for the compact
  // result-card grid below.
  type LibraryResult =
    | { kind: 'adversary', item: Adversary }
    | { kind: 'vehicle', item: Vehicle }
  const searchResults = useMemo<LibraryResult[]>(() => {
    const q = search.toLowerCase().trim()
    if (!q) return []
    const advResults: LibraryResult[] = offMapCandidates
      .filter(a => a.name.toLowerCase().includes(q))
      .map(item => ({ kind: 'adversary' as const, item }))
    const vehResults: LibraryResult[] = vehicleCandidates
      .filter(v => v.name.toLowerCase().includes(q))
      .map(item => ({ kind: 'vehicle' as const, item }))
    return [...advResults, ...vehResults]
  }, [offMapCandidates, vehicleCandidates, search])
  // Which result card's inline Enemy/Friendly add-prompt is open, keyed by
  // `adv:<id>` / `veh:<key>` — mirrors the mockup's per-card ADD-AS popup.
  const [addPromptFor, setAddPromptFor] = useState<string | null>(null)
  useEffect(() => { if (search === '') setAddPromptFor(null) }, [search])

  // Only wounds are edited from the roster card (Option B, Prompt 6) — strain
  // and group-size editing live in the dossier, which owns its own
  // useEncounterCombatControls instance already (Prompt 2 Task 4).
  const { adjustAdversaryWounds, adjustHullTrauma } =
    useEncounterCombatControls({
      encounter, setEncounter, saveEncounter,
      supabase, campaignId, tokens, updateTokenWoundPct, markPending, clearPending,
    })

  const nextAutoName = useCallback((baseName: string, sourceKey: string) => {
    const count = (encounter?.adversaries ?? []).filter(a => a.sourceId === sourceKey).length
                + (encounter?.vehicles ?? []).filter(v => v.sourceId === sourceKey).length
    return count > 0 ? `${baseName} ${count + 1}` : baseName
  }, [encounter])

  // ── Add (token + card) ────────────────────────────────────────────────
  const handleAddAdversary = useCallback(async (
    adv: Adversary & { _isCustom?: boolean; _tokenImageUrl?: string | null },
    alignment: 'enemy' | 'allied_npc',
  ) => {
    if (!encounter) return
    if (!activeMapId) { console.warn('[EncounterDeck] no activeMapId; skipping adversary add'); return }
    // adversaryToInstance takes exactly 2 args on this branch — AdversaryInstance
    // carries no `alignment` field of its own. Alignment lives entirely on the
    // matching initiative_slots entry, assigned below on `newSlot`.
    const instance = adversaryToInstance(adv, adv.type === 'minion' ? 4 : 1)
    instance.name = nextAutoName(adv.name, adv.id)
    instance.map_id = activeMapId
    const slotId = randomUUID()
    const newSlot: InitiativeSlot = {
      id: slotId, type: 'npc', alignment,
      order: encounter.initiative_slots.length + 1,
      name: instance.name, acted: false, current: false, successes: 0, advantages: 0,
      adversaryInstanceId: instance.instanceId,
    }
    await saveEncounter({
      adversaries: [...encounter.adversaries, instance],
      initiative_slots: [...encounter.initiative_slots, newSlot],
    })
    const pos = spawnPosition(tokens.filter(t => t.map_id === activeMapId).length)
    await addToken({
      map_id: activeMapId, campaign_id: campaignId,
      participant_type: 'adversary', character_id: null, participant_id: null,
      slot_key: slotId, label: instance.name,
      alignment: alignment === 'allied_npc' ? 'allied_npc' : adv.type,
      x: pos.x, y: pos.y, is_visible: true, token_size: 1.0, wound_pct: null,
      token_image_url: advImages[adv.name] ?? adv._tokenImageUrl ?? null, token_shape: 'circle',
    })
  }, [encounter, saveEncounter, addToken, activeMapId, campaignId, nextAutoName, advImages, tokens])

  const handleAddVehicle = useCallback(async (
    vehicle: Vehicle & { _isCustom?: boolean; _tokenImageUrl?: string | null },
    alignment: 'enemy' | 'allied_npc',
  ) => {
    if (!encounter) return
    if (!activeMapId) { console.warn('[EncounterDeck] no activeMapId; skipping vehicle add'); return }
    const resolvedImageUrl = vehImages[vehicle.key] ?? vehicle._tokenImageUrl ?? null
    const instance = vehicleToVehicleInstance(vehicle, alignment, resolvedImageUrl)
    instance.name = nextAutoName(vehicle.name, vehicle.key)
    instance.map_id = activeMapId
    const slotId = randomUUID()
    const newSlot: InitiativeSlot = {
      id: slotId, type: 'npc', alignment,
      order: encounter.initiative_slots.length + 1,
      name: instance.name, acted: false, current: false, successes: 0, advantages: 0,
      vehicleInstanceId: instance.instanceId,
    }
    await saveEncounter({
      vehicles: [...(encounter.vehicles ?? []), instance],
      initiative_slots: [...encounter.initiative_slots, newSlot],
    })
    const pos = spawnPosition(tokens.filter(t => t.map_id === activeMapId).length)
    await addToken({
      map_id: activeMapId, campaign_id: campaignId,
      participant_type: 'adversary', character_id: null, participant_id: null,
      slot_key: slotId, label: instance.name, alignment,
      x: pos.x, y: pos.y, is_visible: true, token_size: 1.0, wound_pct: null,
      token_image_url: resolvedImageUrl, token_shape: 'rectangle',
    })
  }, [encounter, saveEncounter, addToken, activeMapId, campaignId, nextAutoName, vehImages, tokens])

  // ── Off-map add (card only, no token) ───────────────────────────────
  // stagingAddToEncounter only accepts Adversary, not Vehicle (pre-existing
  // asymmetry in the reused hook — not introduced by this task). The library
  // rail below only exposes off-map add for adversaries; vehicles always
  // require a token via handleAddVehicle.
  const handleAddOffMap = useCallback(async (
    adv: Adversary, alignment: 'enemy' | 'allied_npc',
  ) => {
    await stagingAddToEncounter(adv, alignment)
  }, [stagingAddToEncounter])

  // Note: benchEntry/deployEntry/removeEntry/toggleHiddenEntry (hoisted
  // below, exported) no longer have local useCallback wrappers here —
  // Option B (Prompt 6) moves Bench/Deploy/Remove/Reveal-Hide off the
  // roster card entirely; EncounterDossier already calls these same
  // exported functions directly (see GmMapView.tsx's dossier mount), so
  // there's nothing left in this file to wrap.

  // GSAP open/close — height + opacity on the body, never display:none toggling
  // (display toggling would skip the transition entirely).
  //
  // 336 (was 236 pre-Prompt-6, matching the old '14.75rem' inner-column
  // height): the Option B roster card's true natural content height is
  // ~246px (measured live: 108px portrait + 136px body + 3px accent bar),
  // which does not fit inside the old 236px budget at all. Bumping this is
  // a deliberate, necessary consequence of Prompt 6's card redesign, not a
  // scope violation — without it, "portrait renders at the enlarged height
  // with no cropping" (this prompt's own acceptance criterion #1) is
  // structurally impossible to satisfy. Search-result cards (Prompt 3/4,
  // already exactly sized to the OLD budget) are unaffected in height —
  // they just gain some unused vertical headroom now, no clipping risk.
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    if (open) {
      gsap.to(el, {
        height: 336, duration: 0.4, ease: 'power3.out',
        onComplete: () => onMapAreaResize?.(),
      })
    } else {
      gsap.to(el, {
        height: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => onMapAreaResize?.(),
      })
    }
  }, [open, onMapAreaResize])

  // Map-scoped (Prompt 12) — same filter as buildRoster, so the collapsed
  // handle's enemy/friendly counts never disagree with the cards actually
  // shown when the deck is expanded.
  const adversaries = (encounter?.adversaries ?? []).filter(a => a.map_id === activeMapId)
  const vehicles     = (encounter?.vehicles ?? []).filter(v => v.map_id === activeMapId)
  const slots        = encounter?.initiative_slots ?? []

  // AdversaryInstance carries no `alignment` field of its own — alignment lives
  // on the matching initiative_slots entry (SlotAlignment, set at add-time / by
  // the CombatFeedPanel toggle). VehicleInstance, by contrast, does carry its
  // own `alignment` field directly (src/lib/vehicles.ts). Deriving both counts
  // via a single lookup so a defeated/unslotted adversary safely counts as an
  // enemy default, matching the convention used elsewhere (GmMapView.tsx,
  // CombatFeedPanel.tsx) rather than inventing a new one here.
  const advAlignment = (instanceId: string) =>
    slots.find(s => s.adversaryInstanceId === instanceId)?.alignment ?? 'enemy'

  const enemyCount    = adversaries.filter(a => advAlignment(a.instanceId) !== 'allied_npc').length
                      + vehicles.filter(v => v.alignment !== 'allied_npc').length
  const friendlyCount = adversaries.filter(a => advAlignment(a.instanceId) === 'allied_npc').length
                      + vehicles.filter(v => v.alignment === 'allied_npc').length

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column',
      zIndex: Z.deck, pointerEvents: 'none',
    }}>
      <button
        onClick={() => onOpenChange(!open)}
        style={{
          pointerEvents: 'auto', alignSelf: 'center',
          display: 'flex', alignItems: 'center', gap: SP[3],
          padding: `${SP[1]} ${SP[6]} ${SP[1]} ${SP[6]}`,
          background: 'color-mix(in srgb, var(--hud-panel) 92%, transparent)',
          border: `1px solid ${BORDER_HI}`, borderBottom: 'none',
          borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg,
          cursor: 'pointer', transition: `background ${EASE.quick}`,
        }}
      >
        <span style={{
          color: HUD.gold, fontSize: FS.caption,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: `transform ${EASE.default}`,
        }}>▲</span>
        <span style={{
          fontFamily: FD, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.24em', color: HUD.gold, textTransform: 'uppercase',
        }}>Encounter Deck</span>
        <span style={{ display: 'flex', gap: SP[1] }}>
          <b style={{
            fontSize: FS.overline, fontWeight: 700, padding: `1px ${SP[1]}`, borderRadius: RADIUS.sm,
            color: RED, border: `1px solid color-mix(in srgb, ${RED} 40%, transparent)`,
          }}>{enemyCount}</b>
          <b style={{
            fontSize: FS.overline, fontWeight: 700, padding: `1px ${SP[1]}`, borderRadius: RADIUS.sm,
            color: GREEN, border: `1px solid color-mix(in srgb, ${GREEN} 40%, transparent)`,
          }}>{friendlyCount}</b>
        </span>
      </button>

      <div
        ref={bodyRef}
        style={{
          pointerEvents: 'auto', height: 0, overflow: 'hidden',
          background: 'color-mix(in srgb, var(--hud-bg) 94%, transparent)',
          borderTop: `1px solid ${BORDER_HI}`,
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          zIndex: Z.deckExpanded,
        }}
      >
        {/* 21rem = 336px, matches the GSAP-animated height above exactly. */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '21rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: SP[3],
            padding: `2px ${SP[4]}`, // below the SP floor — panel should be only barely taller than the search input itself
            borderBottom: `1px solid var(--hud-border)`,
          }}>
            <div style={{ flex: '0 0 18.75rem', position: 'relative' }}>
              <span style={{
                position: 'absolute', left: SP[2], top: '50%', transform: 'translateY(-50%)',
                color: 'var(--hud-text-faint)', fontSize: FS.caption,
              }}>⌕</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search adversaries & vehicles…"
                style={{
                  width: '100%', background: 'color-mix(in srgb, var(--hud-bg) 65%, transparent)', border: `1px solid ${BORDER_HI}`,
                  borderRadius: RADIUS.sm, color: HUD.text, fontFamily: FC,
                  padding: `${SP[1]} ${SP[2]} ${SP[1]} ${SP[6]}`, fontSize: FS.caption, outline: 'none',
                }}
              />
            </div>
            <span style={{ fontSize: FS.overline, color: 'var(--hud-text-faint)', letterSpacing: '0.06em' }}>
              {search ? 'Library results — click ADD to place' : 'Encounter roster'}
            </span>
          </div>

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              display: 'flex', gap: SP[3],
              height: '100%',
              // Explicit per-side padding (not shorthand `padding` + a longhand
              // override — React warns when both are set on the same element,
              // since the shorthand silently sets paddingRight too and the two
              // fight over which wins on rerender).
              //
              // Small top padding (was symmetric SP[3]/SP[3]) — the search-bar
              // panel above was tightened, so this no longer needs to add its
              // own gap on top of that; the bottom gets MORE than before
              // instead, so cards read as sitting comfortably inside the deck
              // body rather than flush against its bottom edge.
              paddingTop: SP[1],
              paddingLeft: SP[4],
              paddingBottom: SP[4],
              // Static right-side gutter so ROSTER cards never render underneath
              // MapToolsRadial's default bottom-right 300px-wide widget footprint
              // (right: 24px) — 19rem (304px) clears its left edge even at the
              // radial's default position. Doesn't track the radial if the GM
              // drags it. Search results don't reserve this — search is a brief,
              // focused interaction, and the deck should use its full width while
              // it's open rather than leave a permanent dead strip (the radial
              // being briefly covered during a search is an acceptable tradeoff).
              paddingRight: search === '' ? '19rem' : SP[4],
              // alignItems:'flex-start' (not 'stretch') — stretch was forcing
              // every roster card to match this row's cross-axis size, which
              // silently shrank the portrait (no explicit flexShrink:0 there
              // either) whenever the row's available height was less than the
              // card's natural content height. flex-start lets cards render at
              // their true natural size instead.
              overflowX: 'auto', overflowY: 'hidden', alignItems: 'flex-start',
            }}>
              {search === '' ? (
                buildRoster(encounter, tokens, advImages, vehImages, activeMapId).map(entry => {
                  const adv = entry.kind === 'adversary' ? (entry.entity as AdversaryInstance) : null
                  const veh = entry.kind === 'vehicle' ? (entry.entity as VehicleInstance) : null
                  return (
                    <EntityCard
                      key={entry.instanceId}
                      entry={entry}
                      focused={focusedEntityId === entry.instanceId}
                      highlighted={!!entry.tokenId && hoveredTokenId === entry.tokenId}
                      onHoverStart={() => { if (entry.tokenId) onHoverToken?.(entry.tokenId) }}
                      onHoverEnd={() => onHoverToken?.(null)}
                      onClick={rect => onOpenDossier?.(entry.instanceId, rect)}
                      onAdjustWounds={delta => {
                        if (adv) void adjustAdversaryWounds(adv, delta)
                        else if (veh) void adjustHullTrauma(veh, delta)
                      }}
                    />
                  )
                })
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], flex: 1, minWidth: 0, overflowY: 'hidden' }}>
                  {/* Off-map alignment toggle — one shared control for every
                      result card's "OFF-MAP" popup button, not a per-card
                      sub-choice. Only relevant when at least one adversary
                      result exists (off-map add is adversary-only). */}
                  {searchResults.some(r => r.kind === 'adversary') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], flexShrink: 0 }}>
                      <span style={{
                        fontFamily: FD, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.06em',
                        textTransform: 'uppercase', color: 'var(--hud-text-faint)',
                      }}>Off-map adds as</span>
                      <button
                        onClick={() => setOffMapAlignment('enemy')}
                        title="Off-map adds default to enemy"
                        style={{
                          ...smallBtn, width: '1rem', height: '1rem', fontSize: FS.overline, color: RED,
                          borderColor: offMapAlignment === 'enemy' ? RED : 'color-mix(in srgb, var(--red) 30%, transparent)',
                        }}
                      >⚔</button>
                      <button
                        onClick={() => setOffMapAlignment('allied_npc')}
                        title="Off-map adds default to allied NPC"
                        style={{
                          ...smallBtn, width: '1rem', height: '1rem', fontSize: FS.overline, color: GREEN,
                          borderColor: offMapAlignment === 'allied_npc' ? GREEN : 'color-mix(in srgb, var(--green) 30%, transparent)',
                        }}
                      >🤝</button>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0, overflowX: 'auto', overflowY: 'hidden' }}>
                    {searchResults.length === 0 ? (
                      <div style={{ fontSize: FS.caption, color: 'var(--hud-text-faint)', padding: SP[2] }}>
                        No matches in the adversary/vehicle library.
                      </div>
                    ) : (
                      // Single row, no wrap — scrolls horizontally only, matching
                      // the roster rail's own pattern (line ~335). flex-wrap here
                      // was the actual root cause of Problem 1's vertical clip:
                      // wrapping fills the fixed-width container top-to-bottom
                      // instead of scrolling sideways, so a card-height reduction
                      // alone couldn't have fixed it — the row would still have
                      // wrapped into more rows than the deck body's fixed height
                      // could show.
                      //
                      // justifyContent: 'safe center' — centers the row when it's
                      // narrower than the available width (few results, no wasted
                      // strip of empty space on one side); automatically falls
                      // back to start-alignment (scrollable, nothing clipped) once
                      // the row overflows, per the CSS `safe` keyword's defined
                      // behavior — no JS overflow measurement needed.
                      <div style={{
                        display: 'flex', gap: SP[2], alignItems: 'stretch', height: '100%',
                        justifyContent: 'safe center' as React.CSSProperties['justifyContent'],
                      }}>
                        {searchResults.map(result => {
                          const resultKey = result.kind === 'adversary' ? `adv:${result.item.id}` : `veh:${result.item.key}`
                          const imageUrl = result.kind === 'adversary'
                            ? (advImages[result.item.name] ?? null)
                            : (vehImages[result.item.key] ?? null)
                          const typeLabel = result.kind === 'adversary'
                            ? result.item.type.toUpperCase()
                            : `VEHICLE · SIL ${result.item.silhouette}`
                          return (
                            <LibraryResultCard
                              key={resultKey}
                              name={result.item.name}
                              typeLabel={typeLabel}
                              imageUrl={imageUrl}
                              showPrompt={addPromptFor === resultKey}
                              onAddClick={() => setAddPromptFor(prev => prev === resultKey ? null : resultKey)}
                              onPickAlignment={alignment => {
                                if (result.kind === 'adversary') void handleAddAdversary(result.item, alignment)
                                else void handleAddVehicle(result.item, alignment)
                                setAddPromptFor(null)
                                setSearch('')
                              }}
                              onOffMapAdd={result.kind === 'adversary' ? () => {
                                void handleAddOffMap(result.item, offMapAlignment)
                                setAddPromptFor(null)
                                setSearch('')
                              } : undefined}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Roster derivation
// ═══════════════════════════════════════════════════════════════

export interface RosterEntry {
  kind:       'adversary' | 'vehicle'
  instanceId: string
  name:       string
  /** `entity.nickname || name` — the roster card/dossier title should read this,
   *  not `name` directly, so a GM-set nickname actually shows up. `name` itself
   *  stays the real identity (image keying, dossier upload path, etc. all key
   *  off it deliberately unchanged). */
  displayName: string
  alignment:  'enemy' | 'allied_npc'
  woundsCurrent: number
  woundsMax:     number
  groupSize?:    number
  isOnMap:    boolean
  isHidden:   boolean
  imageUrl:   string | null
  /** The resolved `map_tokens.id` for this entity's slot, or null when off-map. */
  tokenId:    string | null
  /** The map this entry was added on (Prompt 12) — authoritative even when
   *  off-map/benched. Used by `deployEntry` as the redeploy target instead of
   *  whatever map happens to be currently active. */
  mapId:      string | null
  entity:     AdversaryInstance | VehicleInstance
}

export function buildRoster(
  encounter: CombatEncounter | null,
  tokens: MapToken[],
  advImages: Record<string, string>,
  vehImages: Record<string, string>,
  activeMapId: string | null,
): RosterEntry[] {
  if (!encounter) return []
  const tokenBySlotKey = new Map(tokens.filter(t => t.slot_key).map(t => [t.slot_key as string, t]))

  // AdversaryInstance carries no `alignment` field of its own — alignment
  // lives on the matching initiative_slots entry. VehicleInstance, by
  // contrast, does carry its own `alignment` field directly. Deriving via a
  // slot lookup (rather than a token lookup) means this also works correctly
  // for off-map entities, which have a slot but no map_tokens row yet.
  const advSlotByInstance = new Map(
    encounter.initiative_slots.filter(s => s.adversaryInstanceId).map(s => [s.adversaryInstanceId as string, s])
  )
  const vehSlotByInstance = new Map(
    encounter.initiative_slots.filter(s => s.vehicleInstanceId).map(s => [s.vehicleInstanceId as string, s])
  )

  // Map-scoped roster (Prompt 12) — an entry only belongs to the deck for the
  // map it was added on, matching the already-map-scoped map_tokens. Off-map/
  // benched entries have no token to derive a map from, so map_id (stamped at
  // add-time by every add path) is the sole source of truth here, not a
  // token lookup.
  const advEntries: RosterEntry[] = encounter.adversaries
    .filter(a => a.map_id === activeMapId)
    .map(a => {
      const slot = advSlotByInstance.get(a.instanceId)
      const tok  = slot ? tokenBySlotKey.get(slot.id) : undefined
      return {
        kind: 'adversary', instanceId: a.instanceId, name: a.name,
        displayName: a.nickname || a.name,
        alignment: slot?.alignment === 'allied_npc' ? 'allied_npc' : 'enemy',
        woundsCurrent: a.woundsCurrent ?? 0,
        woundsMax: a.type === 'minion' ? a.woundThreshold * a.groupSize : a.woundThreshold,
        groupSize: a.type === 'minion' ? a.groupSize : undefined,
        isOnMap: !!tok,
        isHidden: tok ? !tok.is_visible : false,
        // `a.name` carries the `nextAutoName` auto-numbered suffix (" 2", " 3", ...)
        // for the 2nd+ instance of the same adversary, but `advImages` is keyed by
        // the base catalog name — strip that exact suffix pattern before falling back.
        imageUrl: advImages[a.name] ?? advImages[a.name.replace(/ \d+$/, '')] ?? null,
        tokenId: tok?.id ?? null,
        mapId: a.map_id ?? null,
        entity: a,
      }
    })
  const vehEntries: RosterEntry[] = (encounter.vehicles ?? [])
    .filter(v => v.map_id === activeMapId)
    .map(v => {
      const slot = vehSlotByInstance.get(v.instanceId)
      const tok  = slot ? tokenBySlotKey.get(slot.id) : undefined
      return {
        kind: 'vehicle', instanceId: v.instanceId, name: v.name,
        displayName: v.nickname || v.name,
        alignment: v.alignment,
        woundsCurrent: v.hullTraumaCurrent, woundsMax: v.hullTraumaThreshold,
        isOnMap: !!tok,
        isHidden: tok ? !tok.is_visible : false,
        imageUrl: vehImages[v.sourceId] ?? v.token_image_url ?? null,
        tokenId: tok?.id ?? null,
        mapId: v.map_id ?? null,
        entity: v,
      }
    })
  return [...advEntries, ...vehEntries]
}

// ═══════════════════════════════════════════════════════════════
// Bench / Deploy / Remove / Hidden — hoisted standalone functions
// ═══════════════════════════════════════════════════════════════
// Exported so EncounterDossier (a sibling component) can reuse the exact
// same cascade-delete/bench semantics instead of reimplementing them a
// second time. Each function's `opts` parameter is exactly what the
// corresponding closure below used to capture from component-local
// state/props. EncounterDeck's own handleBench/handleDeploy/handleRemove/
// handleToggleHidden are thin useCallback wrappers around these, so its
// existing call sites (`onBench={() => void handleBench(entry)}` etc.)
// are unchanged.

export async function benchEntry(
  entry: RosterEntry,
  opts: { encounter: CombatEncounter | null; tokens: MapToken[]; removeToken: (id: string) => Promise<void> },
) {
  const { encounter, tokens, removeToken } = opts
  const slot = encounter?.initiative_slots.find(s =>
    s.adversaryInstanceId === entry.instanceId || s.vehicleInstanceId === entry.instanceId)
  const tok = slot ? tokens.find(t => t.slot_key === slot.id) : undefined
  if (tok) await removeToken(tok.id)
}

export async function deployEntry(
  entry: RosterEntry,
  opts: {
    encounter: CombatEncounter | null
    activeMapId: string | null
    campaignId: string
    tokens: MapToken[]
    addToken: (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  },
) {
  const { encounter, activeMapId, campaignId, tokens, addToken } = opts
  if (!encounter) return
  // Deploy targets the entry's OWN stored map (Prompt 12), not whatever map
  // happens to be currently active — they should always agree in practice
  // (deploy only happens from within that map's own deck view, which only
  // shows entries already filtered to it), but this is explicit rather than
  // assumed. activeMapId is only a fallback for the defensive case where an
  // entry somehow has no map_id of its own.
  const targetMapId = entry.mapId ?? activeMapId
  if (!targetMapId) { console.warn('[EncounterDeck] no map to deploy onto; skipping deploy'); return }
  const slot = encounter.initiative_slots.find(s =>
    s.adversaryInstanceId === entry.instanceId || s.vehicleInstanceId === entry.instanceId)
  if (!slot) return
  const pos = spawnPosition(tokens.filter(t => t.map_id === targetMapId).length)
  await addToken({
    map_id: targetMapId, campaign_id: campaignId,
    participant_type: 'adversary', character_id: null, participant_id: null,
    slot_key: slot.id, label: entry.name, alignment: entry.alignment,
    x: pos.x, y: pos.y, is_visible: true, token_size: 1.0, wound_pct: null,
    token_image_url: entry.imageUrl, token_shape: entry.kind === 'vehicle' ? 'rectangle' : 'circle',
  })
}

export async function removeEntry(
  entry: RosterEntry,
  opts: {
    encounter: CombatEncounter | null
    tokens: MapToken[]
    saveEncounter: (partial: Partial<CombatEncounter>) => Promise<void>
    removeToken: (id: string) => Promise<void>
  },
) {
  const { encounter, tokens, saveEncounter, removeToken } = opts
  if (!encounter) return
  const slot = encounter.initiative_slots.find(s =>
    s.adversaryInstanceId === entry.instanceId || s.vehicleInstanceId === entry.instanceId)
  if (entry.kind === 'adversary') {
    const updatedAdversaries = encounter.adversaries.filter(a => a.instanceId !== entry.instanceId)
    const updatedSlots = encounter.initiative_slots.filter(s => s.adversaryInstanceId !== entry.instanceId)
    await saveEncounter({ adversaries: updatedAdversaries, initiative_slots: updatedSlots })
  } else {
    const updatedVehicles = (encounter.vehicles ?? []).filter(v => v.instanceId !== entry.instanceId)
    const updatedSlots = encounter.initiative_slots.filter(s => s.vehicleInstanceId !== entry.instanceId)
    await saveEncounter({ vehicles: updatedVehicles, initiative_slots: updatedSlots })
  }
  if (slot) {
    const tok = tokens.find(t => t.slot_key === slot.id)
    if (tok) await removeToken(tok.id)
  }
}

export async function toggleHiddenEntry(
  entry: RosterEntry,
  opts: { encounter: CombatEncounter | null; tokens: MapToken[]; toggleVisibility: (id: string, visible: boolean) => Promise<void> },
) {
  const { encounter, tokens, toggleVisibility } = opts
  const slot = encounter?.initiative_slots.find(s =>
    s.adversaryInstanceId === entry.instanceId || s.vehicleInstanceId === entry.instanceId)
  const tok = slot ? tokens.find(t => t.slot_key === slot.id) : undefined
  if (tok) await toggleVisibility(tok.id, !tok.is_visible)
}

// ═══════════════════════════════════════════════════════════════
// EntityCard
// ═══════════════════════════════════════════════════════════════

const CHAMFER = 'polygon(0.625rem 0,calc(100% - 0.625rem) 0,100% 0.625rem,100% calc(100% - 0.625rem),calc(100% - 0.625rem) 100%,0.625rem 100%,0 calc(100% - 0.625rem),0 0.625rem)'

const smallBtn: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${BORDER_HI}`,
  borderRadius: RADIUS.sm, width: '1.375rem', height: '1.375rem', cursor: 'pointer',
  fontFamily: FC, fontSize: FS.sm, color: HUD.textDim,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: `border-color ${EASE.quick}`, lineHeight: 1, flexShrink: 0,
}

// Roster card — Option B ("stat-chips") from the approved card-redesign
// mockup (Prompt 6). Portrait + identity + wounds (the one control a GM
// touches constantly) plus a read-only Soak/Defence/Strain chip row.
// Reveal/Hide, Bench/Deploy, Remove, strain editing, and group-size editing
// all moved to the dossier (Prompt 2 already has all of them — confirmed
// before writing this, not duplicated here). The top-right slot stacks
// group-count, then HIDDEN or OFF-MAP (mutually exclusive with each other,
// not with group-count) — OFF-MAP was dropped here as a deliberate
// reduction and later restored to the same slot HIDDEN uses.
function EntityCard({
  entry, onClick, focused, highlighted, onHoverStart, onHoverEnd, onAdjustWounds,
}: {
  entry:    RosterEntry
  onClick:  (sourceRect: DOMRect) => void
  focused:  boolean
  /** Card↔token hover-glow signal (Prompt 5) — visually reuses the same gold highlight as `focused`. */
  highlighted?:  boolean
  onHoverStart?: () => void
  onHoverEnd?:   () => void
  onAdjustWounds: (delta: number) => void
}) {
  const accent = entry.alignment === 'allied_npc' ? GREEN : RED
  const pct = Math.max(0, 1 - entry.woundsCurrent / Math.max(1, entry.woundsMax))
  const hpColor = pct > 0.5 ? GREEN : pct > 0.2 ? HUD.gold : RED
  const lit = focused || !!highlighted

  const adv = entry.kind === 'adversary' ? (entry.entity as AdversaryInstance) : null
  const veh = entry.kind === 'vehicle' ? (entry.entity as VehicleInstance) : null
  const showStrain = adv ? adv.type === 'nemesis' && adv.strainThreshold !== undefined : true
  const strainCurrent = adv ? (adv.strainCurrent ?? 0) : (veh?.systemStrainCurrent ?? 0)
  const strainMax = adv ? (adv.strainThreshold ?? 0) : (veh?.systemStrainThreshold ?? 0)

  const typeLabel = adv ? adv.type.toUpperCase() : 'VEHICLE'
  // Vehicles use their own terminology, not the adversary labels — this card
  // showed vehicles with adversary stat names (WOUNDS/SK/DEF) verbatim, which
  // read as a copy-paste of the adversary card rather than a vehicle-shaped one.
  const woundsLabel = veh ? 'HULL' : 'WOUNDS'
  const soakLabel = veh ? 'ARM' : 'SK'
  const soakValue = adv ? adv.soak : (veh?.armor ?? 0)
  // Adversary defense is melee/ranged; vehicles have no melee/ranged pair (they use
  // fore/aft/port/starboard) — fore/aft mirrors the dossier's own "Vehicle Profile"
  // convention rather than inventing a new one here.
  const defLabel = veh ? 'SH' : 'DEF'
  const defValue = adv
    ? `${adv.defense.melee}/${adv.defense.ranged}`
    : `${veh?.defense.fore ?? 0}/${veh?.defense.aft ?? 0}`
  // Live alive-count for a minion group — reused directly from AdversaryInstance,
  // not re-derived (Prompt 1/2's own derivation already keeps this current).
  const aliveCount = adv?.groupRemaining

  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn() }

  const chipStyle: React.CSSProperties = {
    flex: '0 0 auto', textAlign: 'center', fontSize: FS.overline, fontWeight: 700,
    letterSpacing: '0.02em', padding: `2px ${SP[1]}`, borderRadius: RADIUS.sm,
    background: 'var(--hud-surface-hi)', border: `1px solid ${BORDER_HI}`, color: 'var(--hud-text-dim)',
    whiteSpace: 'nowrap',
  }

  return (
    <div
      onClick={e => onClick(e.currentTarget.getBoundingClientRect())}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={{
        flex: '0 0 10.75rem', display: 'flex', flexDirection: 'column',
        background: PANEL_BG,
        border: `1px solid ${lit ? HUD.gold : `color-mix(in srgb, ${accent} 45%, ${BORDER_HI})`}`,
        clipPath: CHAMFER, cursor: 'pointer', overflow: 'hidden', position: 'relative',
        boxShadow: lit ? `0 0 16px color-mix(in srgb, ${HUD.gold} 35%, transparent)` : 'none',
        transition: `border-color ${EASE.quick}, transform ${EASE.default}`,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, zIndex: 1 }} />
      {/* Portrait — enlarged to 6rem (96px), the headline fix. flexShrink:0 is
          load-bearing: without it, this div silently shrinks under flex
          pressure (the row's alignItems:stretch forces every card to the
          same height) instead of actually rendering at 96px — this was the
          real root cause of the original "cropped sliver" complaint, not
          just the specified height being too small. */}
      <div style={{ height: '6rem', flexShrink: 0, background: 'var(--hud-surface-lo)', position: 'relative', overflow: 'hidden' }}>
        {entry.imageUrl
          ? <img src={entry.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FD, fontSize: FS.h3, color: 'var(--hud-text-faint)',
            }}>{entry.displayName.charAt(0)}</div>
        }
        {/* Bottom gradient scrim so the name overlay stays legible on any portrait. */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, transparent 40%, color-mix(in srgb, var(--hud-panel) 55%, transparent) 78%, var(--hud-panel) 100%)',
        }} />
        {/* Role tag — top-LEFT, safe inset (fixes the old bottom-right GRP clip). */}
        <span style={{
          position: 'absolute', top: SP[1], left: SP[1], zIndex: 2, maxWidth: 'calc(50% - 0.5rem)',
          fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 6px',
          background: 'color-mix(in srgb, var(--hud-bg) 82%, transparent)', borderRadius: RADIUS.sm,
          border: `1px solid ${BORDER_HI}`, color: entry.alignment === 'allied_npc' ? GREEN : RED,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{typeLabel}</span>
        {/* Group / hidden / off-map chips — top-RIGHT, safe inset, stacked (not
            mutually exclusive with group count): a hidden minion group needs
            both its alive count AND the HIDDEN tag, or the hidden state
            silently disappears behind the count. HIDDEN and OFF-MAP are
            themselves mutually exclusive — isHidden only applies to a token
            on the map, off-map entries have no token at all. */}
        {(entry.groupSize !== undefined || (entry.isHidden && entry.isOnMap) || !entry.isOnMap) && (
          <div style={{
            position: 'absolute', top: SP[1], right: SP[1], zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px',
            maxWidth: 'calc(50% - 0.5rem)',
          }}>
            {entry.groupSize !== undefined && (
              <span style={{
                fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.05em', padding: '2px 6px',
                background: 'color-mix(in srgb, var(--hud-bg) 82%, transparent)', borderRadius: RADIUS.sm,
                border: `1px solid color-mix(in srgb, ${HUD.gold} 50%, transparent)`, color: HUD.gold,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{aliveCount}/{entry.groupSize}</span>
            )}
            {entry.isHidden && entry.isOnMap && (
              <span style={{
                fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px',
                background: 'color-mix(in srgb, var(--hud-bg) 82%, transparent)', borderRadius: RADIUS.sm,
                border: `1px solid ${BORDER_HI}`, color: 'var(--hud-text-dim)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>◌ HIDDEN</span>
            )}
            {!entry.isOnMap && (
              <span style={{
                fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px',
                background: 'color-mix(in srgb, var(--hud-bg) 82%, transparent)', borderRadius: RADIUS.sm,
                border: `1px solid color-mix(in srgb, ${HUD.gold} 50%, transparent)`, color: HUD.gold,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>OFF-MAP</span>
            )}
          </div>
        )}
        {/* Identity overlay — up to 2 lines, ellipsis, never truncated to 1 line. */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, padding: `0 ${SP[2]} ${SP[1]}` }}>
          <div style={{
            fontFamily: FD, fontWeight: 700, fontSize: FS.label, letterSpacing: '0.02em', lineHeight: 1.15,
            color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.9)',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{entry.displayName}</div>
        </div>
      </div>
      <div style={{ padding: `${SP[2]} ${SP[2]} ${SP[2]}`, display: 'flex', flexDirection: 'column', gap: SP[1] }}>
        {/* Wounds — label + value, bar, stepper. The ONLY editable control on this card. */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--hud-text-faint)' }}>{woundsLabel}</span>
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: FS.label, color: HUD.text }}>
            {entry.woundsCurrent}<small style={{ color: 'var(--hud-text-faint)', fontWeight: 400 }}>/{entry.woundsMax}</small>
          </span>
        </div>
        <div style={{
          height: 4, borderRadius: RADIUS.sm, background: 'color-mix(in srgb, var(--hud-bg) 60%, transparent)', overflow: 'hidden',
        }}>
          <div style={{ height: '100%', width: `${pct * 100}%`, background: hpColor, transition: `width ${EASE.default}` }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
          <button onClick={stop(() => onAdjustWounds(-1))} style={{ ...smallBtn, flex: 1 }}>−</button>
          <span style={{ flex: 1, textAlign: 'center', fontFamily: FC, fontSize: FS.overline, fontWeight: 700, color: HUD.text }}>
            {entry.woundsCurrent} / {entry.woundsMax}
          </span>
          <button onClick={stop(() => onAdjustWounds(1))} style={{ ...smallBtn, flex: 1 }}>+</button>
        </div>
        {/* Stat-chip row — content-sized chips that wrap to a 2nd line rather
            than truncate. Equal-thirds + nowrap + ellipsis was tried first but
            cannot fit two-digit nemesis strain ("STR 22/22") in a 172px card
            at this font size — it silently hid the actual number, defeating
            the row's whole purpose (at-a-glance combat math). Wrap instead,
            matching the mockup's own `.chips{flex-wrap:wrap}` rule. */}
        <div style={{ display: 'flex', gap: SP[1], flexWrap: 'wrap' }}>
          <span style={chipStyle}>{soakLabel} <b style={{ color: HUD.text }}>{soakValue}</b></span>
          <span style={chipStyle}>{defLabel} <b style={{ color: HUD.text }}>{defValue}</b></span>
          <span style={chipStyle}>STR <b style={{ color: HUD.text }}>{showStrain ? `${strainCurrent}/${strainMax}` : '—'}</b></span>
        </div>
      </div>
    </div>
  )
}

// Deck-native compact search-result card — replaces the previous
// AdversaryLibrary/VehicleLibrary full-panel mount (Prompt 3). Portrait,
// name, type badge, and a single ADD action that reveals an inline
// Enemy/Friendly prompt on the card itself, matching the mockup's
// `.lcard`/`.align-pop` pattern. No filter chips, no authoring button, no
// second search input, no upload affordance — none of those existed on the
// deck's own cards before this change either.
//
// Portrait height and internal spacing (Prompt 4) are sized to fit the
// deck body's fixed 14.75rem height alongside the search header row and
// the results container's own padding — not an arbitrary shrink, verified
// live against the actual rendered card (no vertical clip/scroll at any
// result count).
//
// `onDirectAdd` (Prompt 4): the off-map add strip previously rendered as a
// separate narrow list of "+ name" rows instead of a card matching the
// rest of the rail. It's consolidated into this same component instead of
// a second one, reusing the deck's one existing off-map alignment toggle
// (a single shared ⚔/🤝 control) — a third popup button, "OFF-MAP", adds
// the entity to the roster without placing a token, using that same
// shared toggle for its alignment rather than a per-card sub-choice.
// Adversary-only (handleAddOffMap has never accepted vehicles — a
// pre-existing asymmetry, not something this change extends).
function LibraryResultCard({
  name, typeLabel, imageUrl, showPrompt, onAddClick, onPickAlignment, onOffMapAdd,
}: {
  name:        string
  typeLabel:   string
  imageUrl:    string | null
  showPrompt?: boolean
  onAddClick?: () => void
  onPickAlignment?: (alignment: 'enemy' | 'allied_npc') => void
  /** Adversary-only — omit for vehicle results. */
  onOffMapAdd?: () => void
}) {
  return (
    <div style={{
      flex: '0 0 6.5rem', display: 'flex', flexDirection: 'column',
      background: PANEL_BG, border: `1px solid ${BORDER_HI}`,
      clipPath: CHAMFER, overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ height: '2.75rem', background: 'var(--hud-surface-lo)', position: 'relative', overflow: 'hidden' }}>
        {imageUrl
          ? <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FD, fontSize: FS.label, color: 'var(--hud-text-faint)',
            }}>{name.charAt(0)}</div>
        }
      </div>
      <div style={{ padding: `2px ${SP[1]} 2px`, display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        <div style={{
          fontFamily: FD, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.03em',
          textTransform: 'uppercase', color: HUD.text, lineHeight: 1.1,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>{name}</div>
        <div style={{
          fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--hud-text-faint)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{typeLabel}</div>
        <button
          className="lib-result-add"
          onClick={onAddClick}
          style={{
            marginTop: 'auto', fontSize: FS.overline, fontWeight: 700, color: HUD.gold,
            border: `1px solid color-mix(in srgb, ${HUD.gold} 40%, transparent)`, borderRadius: RADIUS.sm,
            padding: '1px 0', textAlign: 'center', transition: `border-color ${EASE.quick}`,
          }}
        >＋ ADD</button>
      </div>
      {showPrompt && (
        // Covers the WHOLE card (not just the 2.75rem portrait strip) — three
        // stacked buttons need more room than the portrait alone has, and the
        // outer card is already position:relative + overflow:hidden so this
        // stays clipped to the card's own chamfered bounds.
        <div style={{
          position: 'absolute', inset: 0, background: 'color-mix(in srgb, var(--hud-bg) 92%, transparent)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: SP[1],
          zIndex: Z.dropdown,
        }}>
          <button
            className="lib-result-align-enemy"
            onClick={() => onPickAlignment?.('enemy')}
            style={{
              width: '82%', fontSize: FS.overline, fontWeight: 700,
              padding: `${SP[1]} 0`, borderRadius: RADIUS.sm,
              border: `1px solid color-mix(in srgb, ${RED} 55%, transparent)`, color: RED,
            }}
          >⊗ ENEMY</button>
          <button
            className="lib-result-align-friend"
            onClick={() => onPickAlignment?.('allied_npc')}
            style={{
              width: '82%', fontSize: FS.overline, fontWeight: 700,
              padding: `${SP[1]} 0`, borderRadius: RADIUS.sm,
              border: `1px solid color-mix(in srgb, ${GREEN} 55%, transparent)`, color: GREEN,
            }}
          >🤝 FRIENDLY</button>
          {onOffMapAdd && (
            <button
              className="lib-result-offmap"
              onClick={onOffMapAdd}
              title="Add to roster without placing a token"
              style={{
                width: '82%', fontSize: FS.overline, fontWeight: 700,
                padding: `${SP[1]} 0`, borderRadius: RADIUS.sm,
                border: `1px solid color-mix(in srgb, ${HUD.gold} 55%, transparent)`, color: HUD.gold,
              }}
            >⌖ OFF-MAP</button>
          )}
        </div>
      )}
    </div>
  )
}
