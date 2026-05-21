'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEncounterState } from '@/hooks/useEncounterState'
import type { MapToken } from '@/hooks/useMapTokens'
import type { Character } from '@/lib/types'
import { HUD } from '@/lib/tokens'

/* ── Design tokens (match GmMapView exactly) ──────────────── */
const FC       = 'var(--font-body)'
const FR       = 'var(--font-body)'
const DIM      = '#6A8070'
const TEXT     = 'var(--hud-text)'
const GREEN    = '#4EC87A'
const BORDER   = 'var(--hud-border)'
const BORDER_HI = 'var(--hud-border-hi)'

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'

const btnSmall: React.CSSProperties = {
  background: 'var(--hud-surface-lo)',
  border: `1px solid var(--hud-border)`,
  color: HUD.gold,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.06em',
  padding: '3px 9px',
  borderRadius: 3,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const btnDanger: React.CSSProperties = {
  background: 'rgba(224,80,80,0.10)',
  border: `1px solid rgba(224,80,80,0.35)`,
  color: '#E05050',
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  padding: '4px 9px',
  borderRadius: 3,
  cursor: 'pointer',
  flexShrink: 0,
}

/* ── Internal types (mirrored from GmMapView) ─────────────── */
interface VehicleDrawerSlot {
  slotId:            string
  vehicleInstanceId: string
  name:              string
  alignment:         'enemy' | 'allied_npc'
  token_image_url:   string | null
}


/* ── Props ────────────────────────────────────────────────── */
export interface StagingTokenPanelProps {
  /** ID of the currently-active map. Pass null when no map is active. */
  mapId:      string | null
  campaignId: string
  /** All characters for the campaign (active + archived); the panel filters internally. */
  characters: Character[]
  /** Token state and mutators lifted from StagingFloatingToolbar (always-mounted subscription). */
  tokens:            MapToken[]
  addToken:          (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  removeToken:       (id: string) => Promise<void>
  toggleVisibility:  (id: string, visible: boolean) => Promise<void>
  removeAllTokens:   () => Promise<void>
  /** When true, hides the Vehicles and Placed Tokens sections — shows only the Players section. */
  playersOnly?:      boolean
  /** When true, hides the Players section — shows only Vehicles and Placed Tokens. */
  noPlayers?:        boolean
}

/**
 * StagingTokenPanel — the full token-staging UI extracted from GmMapView's
 * right-side drawer and adapted for the Staging left rail.
 *
 * Token state is owned by the always-mounted StagingFloatingToolbar and passed
 * in as props, ensuring the canvas subscription is never disrupted when this
 * panel mounts/unmounts with the drawer.
 *   • PC tokens default to is_visible: true (visible to players on add)
 *   • Adds "Remove All Tokens" with an inline confirmation step
 */
export function StagingTokenPanel({ mapId, campaignId, characters, tokens, addToken, removeToken, toggleVisibility, removeAllTokens, playersOnly = false, noPlayers = false }: StagingTokenPanelProps) {
  const supabase = useMemo(() => createClient(), [])

  /* ── Encounter state ──────────────────────────────────── */
  const { encounter } = useEncounterState(campaignId)

  /* ── Remove All confirmation state ───────────────────── */
  const [removeAllConfirm, setRemoveAllConfirm] = useState(false)
  const [removeAllBusy,    setRemoveAllBusy]    = useState(false)

  /* ── Derived ──────────────────────────────────────────── */
  const onMapCharIds = useMemo(
    () => new Set(tokens.map(t => t.character_id).filter((v): v is string => v !== null)),
    [tokens],
  )
  const onMapSlotKeys = useMemo(
    () => new Set(tokens.map(t => t.slot_key).filter((v): v is string => v !== null)),
    [tokens],
  )

  // O(1) token lookups — avoids Array.find inside render loops
  const tokensBySlotKey = useMemo(() => {
    const m = new Map<string, MapToken>()
    for (const t of tokens) { if (t.slot_key) m.set(t.slot_key, t) }
    return m
  }, [tokens])
  const tokensByCharId = useMemo(() => {
    const m = new Map<string, MapToken>()
    for (const t of tokens) { if (t.character_id) m.set(t.character_id, t) }
    return m
  }, [tokens])

  // All adversary / vehicle tokens on the map — includes encounter-linked ones
  // so library-placed tokens always appear here regardless of slot_key state
  const standaloneTokens = useMemo(
    () => tokens.filter(t => t.character_id === null),
    [tokens],
  )

  const activeCharacters = useMemo(
    () => characters.filter(c => !c.is_archived),
    [characters],
  )

  const availablePcs = useMemo(
    () => activeCharacters.filter(c => !onMapCharIds.has(c.id)),
    [activeCharacters, onMapCharIds],
  )

  const vehicleSlots = useMemo<VehicleDrawerSlot[]>(() => {
    if (!encounter) return []
    return encounter.initiative_slots
      .filter(s => s.type === 'npc' && s.vehicleInstanceId)
      .map(s => {
        const veh = encounter.vehicles?.find(v => v.instanceId === s.vehicleInstanceId)
        return {
          slotId:            s.id,
          vehicleInstanceId: s.vehicleInstanceId!,
          name:              s.name,
          alignment:         veh?.alignment ?? 'enemy',
          token_image_url:   veh?.token_image_url ?? null,
        }
      })
  }, [encounter])

  /* ── Token add helpers ─────────────────────────────────��� */
  async function addCharacterToken(character: Character, x = 0.5, y = 0.5) {
    if (!mapId || !campaignId) return
    await addToken({
      map_id:           mapId,
      campaign_id:      campaignId,
      participant_type: 'pc',
      character_id:     character.id,
      participant_id:   null,
      slot_key:         null,
      label:            character.name,
      alignment:        'pc',
      x, y,
      is_visible:       true,   // PC tokens default visible to players
      token_size:       1.0,
      wound_pct:        null,
      token_image_url:  character.portrait_url ?? null,
      token_shape:      'circle',
    })
  }

  async function addVehicleToken(slot: VehicleDrawerSlot, x = 0.5, y = 0.5) {
    if (!mapId || !campaignId) return
    await addToken({
      map_id:           mapId,
      campaign_id:      campaignId,
      participant_type: 'adversary',
      character_id:     null,
      participant_id:   null,
      slot_key:         slot.slotId,
      label:            slot.name,
      alignment:        slot.alignment,
      x, y,
      is_visible:       false,
      token_size:       1.0,
      wound_pct:        null,
      token_image_url:  slot.token_image_url,
      token_shape:      'rectangle',
    })
  }

  async function addAllPlayers() {
    if (!mapId || !campaignId) return
    const count = availablePcs.length
    if (count === 0) return
    for (let i = 0; i < count; i++) {
      await addCharacterToken(availablePcs[i], 0.5 + (i - count / 2) * 0.05, 0.5)
    }
  }

  /* ── Reset Board ─────────────────────────────────────── */
  async function handleRemoveAll() {
    setRemoveAllBusy(true)
    await Promise.all([
      // Delete ALL map tokens for this campaign — covers current map AND
      // any legacy tokens left on previous maps from past sessions
      supabase.from('map_tokens').delete().eq('campaign_id', campaignId),
      // Clear adversaries, vehicles, and initiative slots from the active
      // encounter so the Adversaries / Vehicles sections also empty out
      encounter
        ? supabase.from('combat_encounters').update({
            adversaries:      [],
            vehicles:         [],
            initiative_slots: [],
            updated_at:       new Date().toISOString(),
          }).eq('id', encounter.id)
        : Promise.resolve(),
    ])
    setRemoveAllBusy(false)
    setRemoveAllConfirm(false)
  }

  /* ── Render ───────────────────────────────────────────── */
  const hasTokens = tokens.length > 0 || vehicleSlots.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* ── Section B: Vehicles ── */}
      {!playersOnly && vehicleSlots.length > 0 && (
        <>
          <SectionHeader>Vehicles</SectionHeader>

          {vehicleSlots.map(p => {
            const isOnMap    = onMapSlotKeys.has(p.slotId)
            const mapToken   = tokensBySlotKey.get(p.slotId) ?? null
            const tokenColor = p.alignment === 'allied_npc' ? '#4EC87A' : '#e05252'

            return (
              <div key={p.slotId} style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                  {/* Token preview (rectangle) */}
                  {p.token_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.token_image_url} alt="" style={{ width: 40, height: 28, borderRadius: 3, objectFit: 'cover', flexShrink: 0, border: `2px solid ${tokenColor}60` }} />
                  ) : (
                    <div style={{ width: 40, height: 28, borderRadius: 3, flexShrink: 0, background: `${tokenColor}20`, border: `2px solid ${tokenColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FC, fontSize: 13, fontWeight: 700, color: tokenColor }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name + badge */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </div>
                    <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em', color: tokenColor }}>
                      {p.alignment === 'allied_npc' ? 'ALLIED' : 'ENEMY'} · VEHICLE
                    </div>
                  </div>

                  {/* Add / On map */}
                  {mapId && (
                    isOnMap
                      ? <span style={{ fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, color: GREEN, flexShrink: 0 }}>On map ✓</span>
                      : <button onClick={() => void addVehicleToken(p)} style={btnSmall}>+ Add</button>
                  )}
                </div>

                {/* On-map controls */}
                {isOnMap && mapToken && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <button
                      onClick={() => void toggleVisibility(mapToken.id, !mapToken.is_visible)}
                      style={{
                        flex: 1, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                        letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 3,
                        padding: '4px 8px', border: 'none',
                        background: mapToken.is_visible ? 'rgba(78,200,122,0.12)' : 'var(--hud-surface-lo)',
                        color: mapToken.is_visible ? GREEN : DIM,
                        transition: '.15s',
                      }}
                    >
                      {mapToken.is_visible ? '◉ Visible to players' : '◯ Hidden from players'}
                    </button>
                    <button onClick={() => void removeToken(mapToken.id)} style={btnDanger} title="Remove from map">✕</button>
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}

      {/* ── Section C: Standalone (library-placed) tokens ── */}
      {!playersOnly && standaloneTokens.length > 0 && (
        <>
          <SectionHeader topBorder={vehicleSlots.length > 0}>
            Placed Tokens
          </SectionHeader>

          {standaloneTokens.map(token => {
            const isVehicle  = token.token_shape === 'rectangle'
            const tokenColor = token.alignment === 'allied_npc' ? '#5AAAE0'
              : token.alignment === 'nemesis'   ? '#9060D0'
              : token.alignment === 'rival'     ? '#FF9800'
              : token.alignment === 'minion' || token.alignment === 'enemy' ? '#E05252'
              : HUD.gold

            return (
              <div key={token.id} style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                  {/* Token preview */}
                  {token.token_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={token.token_image_url}
                      alt=""
                      style={{
                        width: isVehicle ? 40 : 40,
                        height: isVehicle ? 28 : 40,
                        borderRadius: isVehicle ? 3 : '50%',
                        objectFit: 'cover', flexShrink: 0,
                        border: `2px solid ${tokenColor}60`,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: isVehicle ? 40 : 40,
                      height: isVehicle ? 28 : 40,
                      borderRadius: isVehicle ? 3 : '50%',
                      flexShrink: 0,
                      background: `${tokenColor}20`,
                      border: `2px solid ${tokenColor}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: FC, fontSize: isVehicle ? 13 : 16, fontWeight: 700, color: tokenColor,
                    }}>
                      {(token.label ?? '?')[0].toUpperCase()}
                    </div>
                  )}

                  {/* Name + badge */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {token.label ?? '—'}
                    </div>
                    <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em', color: tokenColor }}>
                      {token.alignment === 'allied_npc' ? 'ALLIED' : 'ENEMY'}
                      {isVehicle ? ' · VEHICLE' : ''}
                    </div>
                  </div>
                </div>

                {/* On-map controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <button
                    onClick={() => void toggleVisibility(token.id, !token.is_visible)}
                    style={{
                      flex: 1, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                      letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 3,
                      padding: '4px 8px', border: 'none',
                      background: token.is_visible ? 'rgba(78,200,122,0.12)' : 'var(--hud-surface-lo)',
                      color: token.is_visible ? GREEN : DIM,
                      transition: '.15s',
                    }}
                  >
                    {token.is_visible ? '◉ Visible to players' : '◯ Hidden from players'}
                  </button>
                  <button onClick={() => void removeToken(token.id)} style={btnDanger} title="Remove from map">✕</button>
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* ── Section D: Players ── */}
      {!noPlayers && (
        <>
          <SectionHeader topBorder={!playersOnly && (vehicleSlots.length > 0 || standaloneTokens.length > 0)}>
            Players
          </SectionHeader>

          {activeCharacters.length === 0 && (
            <div style={{ padding: '12px 14px', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
              No active characters.
            </div>
          )}

          {activeCharacters.map(char => {
            const isOnMap  = onMapCharIds.has(char.id)
            const mapToken = tokensByCharId.get(char.id) ?? null

            return (
              <div key={char.id} style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                  {/* Portrait */}
                  {char.portrait_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={char.portrait_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--hud-border-hi)' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'var(--hud-surface-lo)', border: '2px solid var(--hud-border-hi)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FC, fontSize: 16, fontWeight: 700, color: HUD.gold }}>
                      {char.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name */}
                  <div style={{ flex: 1, fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {char.name}
                  </div>

                  {/* Add / On map */}
                  {mapId && (
                    isOnMap
                      ? <span style={{ fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, color: GREEN, flexShrink: 0 }}>On map ✓</span>
                      : <button onClick={() => void addCharacterToken(char)} style={btnSmall}>+ Add</button>
                  )}
                </div>

                {/* On-map controls */}
                {isOnMap && mapToken && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <button
                      onClick={() => void toggleVisibility(mapToken.id, !mapToken.is_visible)}
                      style={{
                        flex: 1, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                        letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 3,
                        padding: '4px 8px', border: 'none',
                        background: mapToken.is_visible ? 'rgba(78,200,122,0.12)' : 'rgba(255,255,255,0.04)',
                        color: mapToken.is_visible ? GREEN : DIM,
                        transition: '.15s',
                      }}
                    >
                      {mapToken.is_visible ? '◉ Visible to players' : '◯ Hidden from players'}
                    </button>
                    <button onClick={() => void removeToken(mapToken.id)} style={btnDanger} title="Remove from map">✕</button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Add All Players */}
          {mapId && availablePcs.length > 0 && (
            <div style={{ padding: '10px 12px', borderTop: `1px solid ${BORDER}` }}>
              <button
                onClick={() => void addAllPlayers()}
                style={{
                  background: 'var(--hud-surface-hi)', border: `1px solid ${BORDER_HI}`,
                  color: HUD.gold, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 13px',
                  borderRadius: 4, cursor: 'pointer', width: '100%',
                }}
              >
                ◉ Add All Players
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Remove All Tokens ─────────────────────────────── */}
      {hasTokens && (
        <div style={{ padding: '10px 12px', borderTop: `1px solid ${BORDER}`, marginTop: 'auto' }}>
          {!removeAllConfirm ? (
            /* Idle state — show the remove-all trigger */
            <button
              onClick={() => setRemoveAllConfirm(true)}
              style={{
                width: '100%', padding: '6px 0', borderRadius: 4,
                background: 'rgba(224,80,80,0.07)',
                border: '1px solid rgba(224,80,80,0.25)',
                color: 'rgba(224,80,80,0.55)',
                fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: 'pointer', transition: '.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(224,80,80,0.12)'
                el.style.borderColor = 'rgba(224,80,80,0.45)'
                el.style.color = '#E05050'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(224,80,80,0.07)'
                el.style.borderColor = 'rgba(224,80,80,0.25)'
                el.style.color = 'rgba(224,80,80,0.55)'
              }}
            >
              ✕ Remove All Tokens ({tokens.length})
            </button>
          ) : (
            /* Confirmation state */
            <div style={{
              background: 'rgba(224,80,80,0.08)',
              border: '1px solid rgba(224,80,80,0.35)',
              borderRadius: 4, padding: '10px 12px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: '#E05050', fontWeight: 700 }}>
                Remove all {tokens.length} token{tokens.length !== 1 ? 's' : ''} from the map?
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setRemoveAllConfirm(false)}
                  disabled={removeAllBusy}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: 3,
                    background: 'transparent', border: `1px solid ${BORDER}`,
                    color: DIM, fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleRemoveAll()}
                  disabled={removeAllBusy}
                  style={{
                    flex: 2, padding: '5px 0', borderRadius: 3,
                    background: 'rgba(224,80,80,0.15)',
                    border: '1px solid rgba(224,80,80,0.5)',
                    color: '#E05050',
                    fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
                    letterSpacing: '0.06em', cursor: removeAllBusy ? 'wait' : 'pointer',
                    opacity: removeAllBusy ? 0.6 : 1,
                  }}
                >
                  {removeAllBusy ? 'Removing…' : '✕ Confirm Remove All'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

/* ── Section header ─────────────────────���─────────────────── */
function SectionHeader({
  children, topBorder = false,
}: {
  children: React.ReactNode
  topBorder?: boolean
}) {
  return (
    <div style={{
      padding: '10px 14px 6px',
      fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700,
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color: 'var(--hud-text-dim)',
      borderBottom: `1px solid ${BORDER}`,
      borderTop: topBorder ? `1px solid ${BORDER}` : 'none',
    }}>
      {children}
    </div>
  )
}
