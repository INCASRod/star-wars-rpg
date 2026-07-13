'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import gsap from 'gsap'
import type { Character } from '@/lib/types'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import { adversaryToInstance, fetchAdversaries, type Adversary, type AdversaryInstance } from '@/lib/adversaries'
import { vehicleToVehicleInstance, type Vehicle, type VehicleInstance } from '@/lib/vehicles'
import type { MapToken } from '@/hooks/useMapTokens'
import { useAdversaryTokenImages } from '@/hooks/useAdversaryTokenImages'
import { useVehicleTokenImages } from '@/hooks/useVehicleTokenImages'
import { useEncounterCombatControls } from '@/hooks/useEncounterCombatControls'
import { createClient } from '@/lib/supabase/client'
import { randomUUID } from '@/lib/utils'
import { AdversaryLibrary } from '@/components/gm/AdversaryLibrary'
import { VehicleLibrary } from '@/components/gm/VehicleLibrary'
import { HUD, FS, SP, FONT_BODY, FONT_DISPLAY, RADIUS, Z, EASE, COLOR } from '@/lib/tokens'

const FC = FONT_BODY
const FD = FONT_DISPLAY
const RED = COLOR.red
const GREEN = COLOR.green
const BORDER_HI = 'var(--hud-border-hi)'
const PANEL_BG = 'color-mix(in srgb, var(--hud-panel) 92%, transparent)'

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
  /**
   * Active map id for newly-created tokens. Required — falling back to
   * `tokens[0]?.map_id` here previously created corrupt `map_tokens` rows
   * (`map_id: ''`) whenever the deck was opened on a map with zero existing
   * tokens. Every mount (including GmMapView.tsx's Task-9 temporary stub)
   * must pass the real `activeMap?.id ?? null`.
   */
  activeMapId:         string | null
}

export function EncounterDeck({
  campaignId, encounter, setEncounter, saveEncounter, tokens,
  addToken, removeToken, toggleVisibility, updateTokenWoundPct,
  markPending, clearPending, stagingAddToEncounter,
  open, onOpenChange, characters, onMapAreaResize, focusedEntityId,
  activeMapId,
}: EncounterDeckProps) {
  const supabase = useMemo(() => createClient(), [])
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [search, setSearch] = useState('')

  // Off-map add candidates. AdversaryLibrary's own "Add Token" flow always
  // creates a token — there's no built-in off-map option inside that
  // component, and it's out of scope for this task to modify. This is a
  // deliberately minimal, disclosed-scope companion list (OggDude adversaries
  // only, not custom homebrew) surfaced as a compact trigger next to the
  // library search results (review follow-up: downsized from a full third
  // column to a slim single-button-per-row strip — see render below).
  const [offMapCandidates, setOffMapCandidates] = useState<Adversary[]>([])
  useEffect(() => {
    let cancelled = false
    fetchAdversaries().then(list => { if (!cancelled) setOffMapCandidates(list) }).catch(() => {})
    return () => { cancelled = true }
  }, [])
  const offMapMatches = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return []
    return offMapCandidates.filter(a => a.name.toLowerCase().includes(q)).slice(0, 6)
  }, [offMapCandidates, search])
  // Shared default alignment for off-map adds — a single small toggle instead
  // of two full alignment buttons on every row (review follow-up).
  const [offMapAlignment, setOffMapAlignment] = useState<'enemy' | 'allied_npc'>('enemy')

  const { tokenImages: advImages } = useAdversaryTokenImages()
  const { tokenImages: vehImages } = useVehicleTokenImages()

  const { adjustAdversaryWounds, adjustAdversaryStrain, adjustGroupSize, adjustHullTrauma, adjustSystemStrain } =
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
    await addToken({
      map_id: activeMapId, campaign_id: campaignId,
      participant_type: 'adversary', character_id: null, participant_id: null,
      slot_key: slotId, label: instance.name,
      alignment: alignment === 'allied_npc' ? 'allied_npc' : adv.type,
      x: 0.5, y: 0.5, is_visible: true, token_size: 1.0, wound_pct: null,
      token_image_url: adv._tokenImageUrl ?? null, token_shape: 'circle',
    })
  }, [encounter, saveEncounter, addToken, activeMapId, campaignId, nextAutoName])

  const handleAddVehicle = useCallback(async (
    vehicle: Vehicle & { _isCustom?: boolean; _tokenImageUrl?: string | null },
    alignment: 'enemy' | 'allied_npc',
  ) => {
    if (!encounter) return
    if (!activeMapId) { console.warn('[EncounterDeck] no activeMapId; skipping vehicle add'); return }
    const instance = vehicleToVehicleInstance(vehicle, alignment, vehicle._tokenImageUrl)
    instance.name = nextAutoName(vehicle.name, vehicle.key)
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
    await addToken({
      map_id: activeMapId, campaign_id: campaignId,
      participant_type: 'adversary', character_id: null, participant_id: null,
      slot_key: slotId, label: instance.name, alignment,
      x: 0.5, y: 0.5, is_visible: true, token_size: 1.0, wound_pct: null,
      token_image_url: vehicle._tokenImageUrl ?? null, token_shape: 'rectangle',
    })
  }, [encounter, saveEncounter, addToken, activeMapId, campaignId, nextAutoName])

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

  // ── Bench / Deploy / Remove / Hidden toggle ─────────────────────────
  const handleBench = useCallback(async (entry: RosterEntry) => {
    const slot = encounter?.initiative_slots.find(s =>
      s.adversaryInstanceId === entry.instanceId || s.vehicleInstanceId === entry.instanceId)
    const tok = slot ? tokens.find(t => t.slot_key === slot.id) : undefined
    if (tok) await removeToken(tok.id)
  }, [tokens, encounter, removeToken])

  const handleDeploy = useCallback(async (entry: RosterEntry) => {
    if (!encounter) return
    if (!activeMapId) { console.warn('[EncounterDeck] no activeMapId; skipping deploy'); return }
    const slot = encounter.initiative_slots.find(s =>
      s.adversaryInstanceId === entry.instanceId || s.vehicleInstanceId === entry.instanceId)
    if (!slot) return
    await addToken({
      map_id: activeMapId, campaign_id: campaignId,
      participant_type: 'adversary', character_id: null, participant_id: null,
      slot_key: slot.id, label: entry.name, alignment: entry.alignment,
      x: 0.5, y: 0.5, is_visible: true, token_size: 1.0, wound_pct: null,
      token_image_url: entry.imageUrl, token_shape: entry.kind === 'vehicle' ? 'rectangle' : 'circle',
    })
  }, [encounter, addToken, activeMapId, campaignId])

  const handleRemove = useCallback(async (entry: RosterEntry) => {
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
  }, [encounter, saveEncounter, tokens, removeToken])

  const handleToggleHidden = useCallback(async (entry: RosterEntry) => {
    const slot = encounter?.initiative_slots.find(s =>
      s.adversaryInstanceId === entry.instanceId || s.vehicleInstanceId === entry.instanceId)
    const tok = slot ? tokens.find(t => t.slot_key === slot.id) : undefined
    if (tok) await toggleVisibility(tok.id, !tok.is_visible)
  }, [encounter, tokens, toggleVisibility])

  // GSAP open/close — height + opacity on the body, never display:none toggling
  // (display toggling would skip the transition entirely).
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    if (open) {
      gsap.to(el, {
        height: 236, duration: 0.4, ease: 'power3.out',
        onComplete: () => onMapAreaResize?.(),
      })
    } else {
      gsap.to(el, {
        height: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => onMapAreaResize?.(),
      })
    }
  }, [open, onMapAreaResize])

  const adversaries = encounter?.adversaries ?? []
  const vehicles     = encounter?.vehicles ?? []
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '14.75rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: SP[3],
            padding: `${SP[2]} ${SP[4]}`, borderBottom: `1px solid var(--hud-border)`,
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
              display: 'flex', gap: SP[3], padding: `${SP[3]} ${SP[4]}`, height: '100%',
              // Static right-side gutter so cards never render underneath MapToolsRadial's
              // default bottom-right 300px-wide widget footprint (right: 24px), which stays
              // untouched per this plan's scope — 19rem (304px) clears its left edge even at
              // the radial's default position. Doesn't track the radial if the GM drags it.
              paddingRight: '19rem',
              overflowX: 'auto', overflowY: 'hidden', alignItems: 'stretch',
            }}>
              {search === '' ? (
                buildRoster(encounter, tokens, advImages, vehImages).map(entry => {
                  const adv = entry.kind === 'adversary' ? (entry.entity as AdversaryInstance) : null
                  const veh = entry.kind === 'vehicle' ? (entry.entity as VehicleInstance) : null
                  return (
                    <EntityCard
                      key={entry.instanceId}
                      entry={entry}
                      focused={focusedEntityId === entry.instanceId}
                      onClick={() => { /* Prompt 2: open dossier. This prompt: no-op beyond focus, handled via focusedEntityId prop from GmMapView's onTokenClick */ }}
                      onAdjustWounds={delta => {
                        if (adv) void adjustAdversaryWounds(adv, delta)
                        else if (veh) void adjustHullTrauma(veh, delta)
                      }}
                      onAdjustStrain={delta => {
                        if (adv) void adjustAdversaryStrain(adv, delta)
                        else if (veh) void adjustSystemStrain(veh, delta)
                      }}
                      onAdjustGroupSize={delta => { if (adv) void adjustGroupSize(adv, delta) }}
                      onBench={() => void handleBench(entry)}
                      onDeploy={() => void handleDeploy(entry)}
                      onRemove={() => void handleRemove(entry)}
                      onToggleHidden={() => void handleToggleHidden(entry)}
                    />
                  )
                })
              ) : (
                <div style={{ display: 'flex', gap: SP[3], flex: 1, minWidth: 0 }}>
                  <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
                    <AdversaryLibrary campaignId={campaignId} sessionMode="exploration" onAddToken={handleAddAdversary} mapId={activeMapId} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
                    <VehicleLibrary campaignId={campaignId} sessionMode="exploration" onAddToken={handleAddVehicle} mapId={activeMapId} />
                  </div>
                  {/* Off-map add — a slim, visually secondary trigger (not a third
                      full library column). One compact button per row; alignment
                      for the add is set once via the small ⚔/🤝 toggle in the
                      strip header rather than two buttons per row. */}
                  <div style={{ flex: '0 0 6rem', minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' /* below the SP floor — compact strip, matches badge convention elsewhere in this file */ }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2px' }}>
                      <span style={{
                        fontFamily: FD, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.06em',
                        textTransform: 'uppercase', color: 'var(--hud-text-faint)',
                      }}>Off-map</span>
                      <span style={{ display: 'flex', gap: '2px' }}>
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
                      </span>
                    </div>
                    {offMapMatches.length === 0 ? (
                      <div style={{ fontSize: FS.overline, color: 'var(--hud-text-faint)' }}>—</div>
                    ) : offMapMatches.map(adv => (
                      <div key={adv.id} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <button
                          onClick={() => void handleAddOffMap(adv, offMapAlignment)}
                          title={`Add ${adv.name} off-map (${offMapAlignment === 'allied_npc' ? 'allied NPC' : 'enemy'})`}
                          style={{ ...smallBtn, width: '1rem', height: '1rem', fontSize: FS.overline, flexShrink: 0 }}
                        >+</button>
                        <span style={{
                          flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          fontSize: FS.overline, color: HUD.textDim,
                        }}>{adv.name}</span>
                      </div>
                    ))}
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
  alignment:  'enemy' | 'allied_npc'
  woundsCurrent: number
  woundsMax:     number
  groupSize?:    number
  isOnMap:    boolean
  isHidden:   boolean
  imageUrl:   string | null
  entity:     AdversaryInstance | VehicleInstance
}

function buildRoster(
  encounter: CombatEncounter | null,
  tokens: MapToken[],
  advImages: Record<string, string>,
  vehImages: Record<string, string>,
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

  const advEntries: RosterEntry[] = encounter.adversaries.map(a => {
    const slot = advSlotByInstance.get(a.instanceId)
    const tok  = slot ? tokenBySlotKey.get(slot.id) : undefined
    return {
      kind: 'adversary', instanceId: a.instanceId, name: a.name,
      alignment: slot?.alignment === 'allied_npc' ? 'allied_npc' : 'enemy',
      woundsCurrent: a.woundsCurrent ?? 0,
      woundsMax: a.type === 'minion' ? a.woundThreshold * a.groupSize : a.woundThreshold,
      groupSize: a.type === 'minion' ? a.groupSize : undefined,
      isOnMap: !!tok,
      isHidden: tok ? !tok.is_visible : false,
      imageUrl: advImages[a.name] ?? null,
      entity: a,
    }
  })
  const vehEntries: RosterEntry[] = (encounter.vehicles ?? []).map(v => {
    const slot = vehSlotByInstance.get(v.instanceId)
    const tok  = slot ? tokenBySlotKey.get(slot.id) : undefined
    return {
      kind: 'vehicle', instanceId: v.instanceId, name: v.name,
      alignment: v.alignment,
      woundsCurrent: v.hullTraumaCurrent, woundsMax: v.hullTraumaThreshold,
      isOnMap: !!tok,
      isHidden: tok ? !tok.is_visible : false,
      imageUrl: vehImages[v.sourceId] ?? v.token_image_url ?? null,
      entity: v,
    }
  })
  return [...advEntries, ...vehEntries]
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

function EntityCard({
  entry, onClick, focused,
  onAdjustWounds, onAdjustStrain, onAdjustGroupSize,
  onBench, onDeploy, onRemove, onToggleHidden,
}: {
  entry:    RosterEntry
  onClick:  () => void
  focused:  boolean
  onAdjustWounds:    (delta: number) => void
  onAdjustStrain:    (delta: number) => void
  onAdjustGroupSize: (delta: number) => void
  onBench:        () => void
  onDeploy:       () => void
  onRemove:       () => void
  onToggleHidden: () => void
}) {
  const accent = entry.alignment === 'allied_npc' ? GREEN : RED
  const pct = Math.max(0, 1 - entry.woundsCurrent / Math.max(1, entry.woundsMax))
  const hpColor = pct > 0.5 ? GREEN : pct > 0.2 ? HUD.gold : RED

  const adv = entry.kind === 'adversary' ? (entry.entity as AdversaryInstance) : null
  const veh = entry.kind === 'vehicle' ? (entry.entity as VehicleInstance) : null
  const showStrain = adv ? adv.type === 'nemesis' && adv.strainThreshold !== undefined : true
  const strainCurrent = adv ? (adv.strainCurrent ?? 0) : (veh?.systemStrainCurrent ?? 0)
  const strainMax = adv ? (adv.strainThreshold ?? 0) : (veh?.systemStrainThreshold ?? 0)

  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn() }

  return (
    <div
      onClick={onClick}
      style={{
        flex: '0 0 8rem', display: 'flex', flexDirection: 'column',
        background: PANEL_BG,
        border: `1px solid ${focused ? HUD.gold : `color-mix(in srgb, ${accent} 45%, ${BORDER_HI})`}`,
        clipPath: CHAMFER, cursor: 'pointer', overflow: 'hidden', position: 'relative',
        boxShadow: focused ? `0 0 16px color-mix(in srgb, ${HUD.gold} 35%, transparent)` : 'none',
        transition: `border-color ${EASE.quick}, transform ${EASE.default}`,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />
      <div style={{ height: '5.5rem', background: 'var(--hud-surface-lo)', position: 'relative', overflow: 'hidden' }}>
        {entry.imageUrl
          ? <img src={entry.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FD, fontSize: FS.h3, color: 'var(--hud-text-faint)',
            }}>{entry.name.charAt(0)}</div>
        }
        {!entry.isOnMap && (
          <span style={{
            position: 'absolute', top: SP[1], right: SP[1], fontSize: FS.overline, fontWeight: 700,
            letterSpacing: '0.1em', padding: '2px 5px', // below the SP floor — compact badge, matches AdversaryLibrary's TypeBadge convention
            background: 'color-mix(in srgb, var(--hud-bg) 85%, transparent)',
            border: `1px solid color-mix(in srgb, ${HUD.gold} 45%, transparent)`, color: HUD.gold,
          }}>OFF-MAP</span>
        )}
        {entry.isHidden && entry.isOnMap && (
          <span style={{
            position: 'absolute', top: SP[1], left: SP[1], fontSize: FS.overline, fontWeight: 700,
            letterSpacing: '0.1em', padding: '2px 5px', // below the SP floor — compact badge
            background: 'color-mix(in srgb, var(--hud-bg) 85%, transparent)',
            border: `1px solid ${BORDER_HI}`, color: 'var(--hud-text-dim)',
          }}>◌ HIDDEN</span>
        )}
        {entry.groupSize && (
          <span style={{
            position: 'absolute', bottom: SP[1], right: SP[1], fontSize: FS.overline, fontWeight: 700,
            padding: '1px 5px', // below the SP floor — compact badge
            background: 'color-mix(in srgb, var(--hud-bg) 90%, transparent)', border: `1px solid ${HUD.gold}`, color: HUD.gold,
            borderRadius: RADIUS.sm,
          }}>GRP {entry.groupSize}</span>
        )}
      </div>
      <div style={{ padding: `${SP[1]} ${SP[2]} 0.4375rem`, display: 'flex', flexDirection: 'column', gap: SP[1], flex: 1 }}>
        <div style={{
          fontFamily: FD, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: HUD.text, lineHeight: 1.15,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>{entry.name}</div>
        <div style={{
          height: 3, borderRadius: RADIUS.sm, background: 'color-mix(in srgb, var(--hud-bg) 60%, transparent)', overflow: 'hidden', marginTop: 'auto',
        }}>
          <div style={{ height: '100%', width: `${pct * 100}%`, background: hpColor, transition: `width ${EASE.default}` }} />
        </div>

        {/* Wound / hull stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SP[1] }}>
          <button onClick={stop(() => onAdjustWounds(-1))} style={smallBtn}>−</button>
          <span style={{ fontFamily: FC, fontSize: FS.overline, fontWeight: 700, color: HUD.text }}>
            {entry.woundsCurrent}/{entry.woundsMax}
          </span>
          <button onClick={stop(() => onAdjustWounds(1))} style={smallBtn}>+</button>
        </div>

        {/* Strain / system strain stepper — nemesis adversaries and vehicles only */}
        {showStrain && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SP[1] }}>
            <button onClick={stop(() => onAdjustStrain(-1))} style={smallBtn}>−</button>
            <span style={{ fontFamily: FC, fontSize: FS.overline, color: 'var(--hud-text-dim)' }}>
              {strainCurrent}/{strainMax} STR
            </span>
            <button onClick={stop(() => onAdjustStrain(1))} style={smallBtn}>+</button>
          </div>
        )}

        {/* Group size stepper — minions only */}
        {entry.groupSize !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SP[1] }}>
            <button onClick={stop(() => onAdjustGroupSize(-1))} style={smallBtn}>−</button>
            <span style={{ fontFamily: FC, fontSize: FS.overline, color: 'var(--hud-text-dim)' }}>
              {entry.groupSize} GRP
            </span>
            <button onClick={stop(() => onAdjustGroupSize(1))} style={smallBtn}>+</button>
          </div>
        )}

        {/* Bench/Deploy · Hidden · Remove */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SP[1] }}>
          {entry.isOnMap ? (
            <button onClick={stop(onBench)} title="Bench — remove token, keep card" style={smallBtn}>⌖</button>
          ) : (
            <button onClick={stop(onDeploy)} title="Deploy — place token on map" style={{ ...smallBtn, color: HUD.gold }}>⌖</button>
          )}
          {entry.isOnMap && (
            <button onClick={stop(onToggleHidden)} title={entry.isHidden ? 'Reveal token' : 'Hide token'} style={smallBtn}>◌</button>
          )}
          <button onClick={stop(onRemove)} title="Remove — delete card and token" style={{ ...smallBtn, color: RED, borderColor: 'color-mix(in srgb, var(--red) 40%, transparent)' }}>✕</button>
        </div>
      </div>
    </div>
  )
}
