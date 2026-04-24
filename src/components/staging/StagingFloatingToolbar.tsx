'use client'

/**
 * StagingFloatingToolbar — independent floating pill buttons overlaid on the
 * staging map canvas:
 *
 *   Left pills (always visible):
 *     Adversaries | Vehicles | Tokens | Combat Feed*
 *
 *   Right pills (combat mode only):
 *     Encounter Adversaries | Encounter Vehicles
 *
 *   (* Combat Feed is always shown but disabled outside combat; it opens the
 *      RIGHT drawer rather than the left one.)
 *
 * Each pill is its own self-contained element with a glassmorphic background —
 * there is no shared container panel behind the group.
 *
 * Z-index stack:
 *   pills          40   – above map canvas, below drawer backdrop (8999)
 *   drawer backdrop 8999
 *   drawer panel   9000
 *   top bar        9002
 *
 * "Add Token" from Adversaries / Vehicles inserts a standalone map_token
 * (circle / rectangle respectively) after the GM picks Enemy or Allied NPC.
 */

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MapToken } from '@/hooks/useMapTokens'
import type { Character } from '@/lib/types'
import type { Adversary } from '@/lib/adversaries'
import { adversaryToInstance } from '@/lib/adversaries'
import type { Vehicle } from '@/lib/vehicles'
import { vehicleToVehicleInstance } from '@/lib/vehicles'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import { AdversaryLibrary } from '@/components/gm/AdversaryLibrary'
import { VehicleLibrary } from '@/components/gm/VehicleLibrary'
import { StagingDrawer } from './StagingDrawer'
import { StagingTokenPanel } from './StagingTokenPanel'
import { CombatFeedPanel } from './CombatFeedPanel'
import { EncounterAdversaryPanel } from './EncounterAdversaryPanel'
import { EncounterVehiclePanel } from './EncounterVehiclePanel'

/* ── Layout constants ─────────────────────────────────────── */
/** TOP BAR (56px) + MODE BAR (48px) + 8px gap = 112px.
 *  Both pill stacks must use this value so they never drift apart. */
const PILL_TOP = 112

/* ── Design tokens ────────────────────────────────────────── */
const FR   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const GOLD = '#C8AA50'
const DIM  = '#6A8070'
const RED  = '#E05050'

/* ── Panel type definitions ───────────────────────────────── */
type LeftPanelId  = 'adversaries' | 'vehicles' | 'tokens'
type RightPanelId = 'combat-feed' | 'enc-adversaries' | 'enc-vehicles'

interface LeftEntry {
  id:          LeftPanelId | 'combat-feed' | 'maps'   // Combat Feed → right drawer; maps → external
  icon:        string
  label:       string
  drawerTitle: string
  side:        'left' | 'right'
  combatOnly?: true
  /** When true, clicking calls onMapsClick instead of opening a local drawer. */
  isExternal?: true
}

interface RightEntry {
  id:          RightPanelId
  icon:        string
  label:       string
  drawerTitle: string
}

const LEFT_ENTRIES: LeftEntry[] = [
  { id: 'maps',        icon: '◉', label: 'Maps',        drawerTitle: '',            side: 'left',  isExternal: true },
  { id: 'adversaries', icon: '◆', label: 'Adversaries', drawerTitle: 'Adversaries', side: 'left'  },
  { id: 'vehicles',    icon: '△', label: 'Vehicles',    drawerTitle: 'Vehicles',    side: 'left'  },
  { id: 'tokens',      icon: '◈', label: 'Tokens',      drawerTitle: 'Tokens',      side: 'left'  },
  { id: 'combat-feed', icon: '⚔', label: 'Combat Feed', drawerTitle: 'Combat Feed', side: 'right', combatOnly: true },
]

const RIGHT_ENTRIES: RightEntry[] = [
  { id: 'enc-adversaries', icon: '◆', label: 'Encounter Adversaries', drawerTitle: 'Encounter Adversaries' },
  { id: 'enc-vehicles',    icon: '△', label: 'Encounter Vehicles',    drawerTitle: 'Encounter Vehicles'    },
]

/* ── Props ────────────────────────────────────────────────── */
export interface StagingFloatingToolbarProps {
  campaignId:      string
  sessionMode:     'exploration' | 'combat'
  mapId:           string | null
  characters:      Character[]
  mapsLibraryOpen: boolean
  onMapsClick:     () => void
  isMapVisible:    boolean
  tokenScale:      number
  // Token state shared from page level (single source of truth with GmMapView)
  tokens:          MapToken[]
  addToken:        (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  removeToken:     (id: string) => Promise<void>
  toggleVisibility:(id: string, visible: boolean) => Promise<void>
  removeAllTokens: () => Promise<void>
  onAddEnemy?:     () => void
}

/* ── Encounter helpers ────────────────────────────────────── */
async function ensureActiveEncounter(
  supabase: ReturnType<typeof createClient>,
  campaignId: string,
): Promise<CombatEncounter | null> {
  const { data: rows } = await supabase
    .from('combat_encounters')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
  if (rows && rows.length > 0) return rows[0] as CombatEncounter

  const { data: created } = await supabase
    .from('combat_encounters')
    .insert({
      campaign_id:        campaignId,
      round:              1,
      is_active:          true,
      current_slot_index: 0,
      initiative_type:    'cool',
      initiative_slots:   [],
      adversaries:        [],
      vehicles:           [],
      log_entries:        [],
    })
    .select('*')
    .single()
  return created as CombatEncounter | null
}

export function StagingFloatingToolbar({
  campaignId,
  sessionMode,
  mapId,
  characters,
  mapsLibraryOpen,
  onMapsClick,
  isMapVisible,
  tokenScale,
  tokens: mapTokens,
  addToken,
  removeToken,
  toggleVisibility,
  removeAllTokens,
  onAddEnemy,
}: StagingFloatingToolbarProps) {
  const supabase = useMemo(() => createClient(), [])
  const isCombat = sessionMode === 'combat'

  async function toggleReveal() {
    if (!mapId) return
    await supabase.from('maps').update({ is_visible_to_players: !isMapVisible }).eq('id', mapId)
  }

  async function adjustTokenScale(delta: number) {
    if (!mapId) return
    const next = Math.round(Math.max(0.25, Math.min(4.0, tokenScale + delta)) * 100) / 100
    await supabase.from('maps').update({ token_scale: next }).eq('id', mapId)
  }

  /* ── Drawer state ─────────────────────────────────────────
   * Left and right drawers are tracked independently.
   * Opening one side closes the other.                       */
  const [leftPanel,  setLeftPanel]  = useState<LeftPanelId | null>(null)
  const [rightPanel, setRightPanel] = useState<RightPanelId | null>(null)

  function openLeft(id: LeftPanelId) {
    setRightPanel(null)
    setLeftPanel(prev => (prev === id ? null : id))
  }

  const handleLeftEntry = useCallback((entry: LeftEntry) => {
    if (entry.combatOnly && !isCombat) return
    if (entry.isExternal) {
      setLeftPanel(null)
      onMapsClick()
      return
    }
    if (entry.side === 'right') {
      setLeftPanel(null)
      setRightPanel(prev => (prev === (entry.id as RightPanelId) ? null : (entry.id as RightPanelId)))
    } else {
      setRightPanel(null)
      setLeftPanel(prev => (prev === (entry.id as LeftPanelId) ? null : (entry.id as LeftPanelId)))
    }
  }, [isCombat, onMapsClick])

  // Pre-computed stable handlers — prevents Pill memo busting on every render
  const leftClickHandlers = useMemo<Record<string, () => void>>(
    () => Object.fromEntries(LEFT_ENTRIES.map(e => [e.id, () => handleLeftEntry(e)])),
    [handleLeftEntry],
  )

  const rightClickHandlers = useMemo<Record<RightPanelId, () => void>>(() => ({
    'combat-feed':     () => { setLeftPanel(null); setRightPanel(p => (p === 'combat-feed'     ? null : 'combat-feed'))     },
    'enc-adversaries': () => { setLeftPanel(null); setRightPanel(p => (p === 'enc-adversaries' ? null : 'enc-adversaries')) },
    'enc-vehicles':    () => { setLeftPanel(null); setRightPanel(p => (p === 'enc-vehicles'    ? null : 'enc-vehicles'))    },
  }), [])

  function activeForEntry(entry: LeftEntry): boolean {
    if (entry.isExternal) return mapsLibraryOpen
    if (entry.side === 'right') return rightPanel === entry.id
    return leftPanel === entry.id
  }

  /* ── "Add Token" callbacks ────────────────────────────────
   * Creates the map token then immediately registers the adversary/vehicle
   * into the active combat encounter (creating one if needed), so the
   * Encounter panels show it without waiting for combat to be activated. */
  const handleAddAdversaryToken = useCallback(
    async (adv: Adversary & { _isCustom?: boolean; _tokenImageUrl?: string | null }, alignment: 'enemy' | 'allied_npc') => {
      if (!mapId || !campaignId) return

      const token = await addToken({
        map_id:           mapId,
        campaign_id:      campaignId,
        participant_type: 'adversary',
        character_id:     null,
        participant_id:   null,
        slot_key:         null,
        label:            adv.name,
        alignment:        alignment === 'allied_npc' ? 'allied_npc' : adv.type,
        x:                0.5,
        y:                0.5,
        is_visible:       false,
        token_size:       1.0,
        wound_pct:        null,
        token_image_url:  adv._tokenImageUrl ?? null,
        token_shape:      'circle',
      })
      if (!token) return

      const enc = await ensureActiveEncounter(supabase, campaignId)
      if (!enc) return

      const instance = adversaryToInstance(adv, adv.type === 'minion' ? 4 : 1)
      const slotId   = crypto.randomUUID()
      const slot: InitiativeSlot = {
        id:                  slotId,
        type:                'npc',
        alignment:           alignment === 'allied_npc' ? 'allied_npc' : 'enemy',
        order:               enc.initiative_slots.length + 1,
        name:                adv.name,
        acted:               false,
        current:             false,
        successes:           0,
        advantages:          0,
        adversaryInstanceId: instance.instanceId,
      }

      await supabase.from('combat_encounters').update({
        adversaries:      [...enc.adversaries, instance],
        initiative_slots: [...enc.initiative_slots, slot],
        updated_at:       new Date().toISOString(),
      }).eq('id', enc.id)

      await supabase.from('map_tokens').update({ slot_key: slotId }).eq('id', token.id)
    },
    [mapId, campaignId, addToken, supabase], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const handleAddVehicleToken = useCallback(
    async (vehicle: Vehicle & { _isCustom?: boolean; _tokenImageUrl?: string | null }, alignment: 'enemy' | 'allied_npc') => {
      if (!mapId || !campaignId) return

      const token = await addToken({
        map_id:           mapId,
        campaign_id:      campaignId,
        participant_type: 'adversary',
        character_id:     null,
        participant_id:   null,
        slot_key:         null,
        label:            vehicle.name,
        alignment,
        x:                0.5,
        y:                0.5,
        is_visible:       false,
        token_size:       1.0,
        wound_pct:        null,
        token_image_url:  vehicle._tokenImageUrl ?? null,
        token_shape:      'rectangle',
      })
      if (!token) return

      const enc = await ensureActiveEncounter(supabase, campaignId)
      if (!enc) return

      const instance = vehicleToVehicleInstance(vehicle, alignment, vehicle._tokenImageUrl)
      const slotId   = crypto.randomUUID()
      const slot: InitiativeSlot = {
        id:               slotId,
        type:             'npc',
        alignment,
        order:            enc.initiative_slots.length + 1,
        name:             vehicle.name,
        acted:            false,
        current:          false,
        successes:        0,
        advantages:       0,
        vehicleInstanceId: instance.instanceId,
      }

      await supabase.from('combat_encounters').update({
        vehicles:         [...(enc.vehicles ?? []), instance],
        initiative_slots: [...enc.initiative_slots, slot],
        updated_at:       new Date().toISOString(),
      }).eq('id', enc.id)

      await supabase.from('map_tokens').update({ slot_key: slotId }).eq('id', token.id)
    },
    [mapId, campaignId, addToken, supabase], // eslint-disable-line react-hooks/exhaustive-deps
  )

  /* ── Drawer title helpers ─────────────────────────────────  */
  const leftTitle  = leftPanel
    ? (LEFT_ENTRIES.find(e => e.id === leftPanel)?.drawerTitle ?? '')
    : ''
  const rightTitle = rightPanel
    ? ([...LEFT_ENTRIES, ...RIGHT_ENTRIES.map(e => ({ ...e, side: 'right' as const }))].find(e => e.id === rightPanel)?.drawerTitle ?? '')
    : ''

  /* ── Render ───────────────────────────────────────────────  */
  return (
    <>
      {/* ── Left pill stack ──────────────────────────────── */}
      {/* Transparent wrapper — provides layout only, no visual panel */}
      <div
        style={{
          position:      'fixed',
          top:           PILL_TOP,
          left:          8,
          zIndex:        40,      // above canvas; below drawer backdrop (8999)
          display:       'flex',
          flexDirection: 'column',
          gap:           6,
          pointerEvents: 'none',  // individual pills handle their own events
        }}
      >
        {LEFT_ENTRIES.map(entry => {
          const disabled = !!entry.combatOnly && !isCombat
          const active   = activeForEntry(entry)
          return (
            <Pill
              key={entry.id}
              icon={entry.icon}
              label={entry.label}
              active={active}
              disabled={disabled}
              accentColor={entry.id === 'combat-feed' ? RED : GOLD}
              onClick={leftClickHandlers[entry.id]}
            />
          )
        })}

        {/* Token scale control */}
        <div
          style={{
            display:              'flex',
            alignItems:           'center',
            gap:                  0,
            background:           'rgba(6,13,9,0.90)',
            backdropFilter:       'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border:               '1px solid rgba(200,170,80,0.22)',
            borderRadius:         8,
            overflow:             'hidden',
            pointerEvents:        'auto',
            boxShadow:            '0 2px 8px rgba(0,0,0,0.35)',
          }}
        >
          <button
            disabled={!mapId}
            onClick={() => adjustTokenScale(-0.25)}
            title="Decrease token scale"
            style={{
              padding:    '7px 11px',
              background: 'transparent',
              border:     'none',
              cursor:     mapId ? 'pointer' : 'not-allowed',
              color:      mapId ? GOLD : DIM,
              fontFamily: FR,
              fontSize:   16,
              lineHeight: 1,
            }}
          >−</button>
          <span style={{
            fontFamily:    FR,
            fontSize:      'var(--text-label)',
            fontWeight:    700,
            letterSpacing: '0.06em',
            color:         mapId ? GOLD : DIM,
            minWidth:      42,
            textAlign:     'center',
            userSelect:    'none',
          }}>
            {tokenScale.toFixed(2)}×
          </span>
          <button
            disabled={!mapId}
            onClick={() => adjustTokenScale(0.25)}
            title="Increase token scale"
            style={{
              padding:    '7px 11px',
              background: 'transparent',
              border:     'none',
              cursor:     mapId ? 'pointer' : 'not-allowed',
              color:      mapId ? GOLD : DIM,
              fontFamily: FR,
              fontSize:   16,
              lineHeight: 1,
            }}
          >+</button>
        </div>

        <Pill
          icon={isMapVisible ? '◉' : '○'}
          label={isMapVisible ? 'Hide Map' : 'Reveal Map'}
          active={isMapVisible}
          disabled={!mapId}
          accentColor='#4EC87A'
          onClick={toggleReveal}
        />
      </div>

      {/* ── Right pill stack (always visible) ───────────────── */}
      <div
        style={{
          position:      'fixed',
          top:           PILL_TOP,
          right:         8,
          zIndex:        40,
          display:       'flex',
          flexDirection: 'column',
          gap:           6,
          pointerEvents: 'none',
        }}
      >
        {RIGHT_ENTRIES.map(entry => (
          <Pill
            key={entry.id}
            icon={entry.icon}
            label={entry.label}
            active={rightPanel === entry.id}
            disabled={false}
            accentColor={GOLD}
            onClick={rightClickHandlers[entry.id]}
          />
        ))}
        {onAddEnemy && isCombat && (
          <Pill
            icon="⚡"
            label="Add Enemy"
            active={false}
            disabled={false}
            accentColor={RED}
            onClick={onAddEnemy}
          />
        )}
      </div>

      {/* ── Left drawer ──────────────────────────────────── */}
      <StagingDrawer
        direction="left"
        open={leftPanel !== null}
        onClose={() => setLeftPanel(null)}
        title={leftTitle}
        railWidth={0}
      >
        {leftPanel === 'adversaries' && (
          <div style={{ padding: '12px 14px' }}>
            <AdversaryLibrary
              campaignId={campaignId}
              sessionMode={sessionMode}
              onAddToken={handleAddAdversaryToken}
              mapId={mapId}
            />
          </div>
        )}

        {leftPanel === 'vehicles' && (
          <div style={{ padding: '12px 14px' }}>
            <VehicleLibrary
              campaignId={campaignId}
              sessionMode={sessionMode}
              onAddToken={handleAddVehicleToken}
              mapId={mapId}
            />
          </div>
        )}

        {leftPanel === 'tokens' && (
          <StagingTokenPanel
            mapId={mapId}
            campaignId={campaignId}
            characters={characters}
            tokens={mapTokens}
            addToken={addToken}
            removeToken={removeToken}
            toggleVisibility={toggleVisibility}
            removeAllTokens={removeAllTokens}
          />
        )}
      </StagingDrawer>

      {/* ── Right drawer ─────────────────────────────────── */}
      <StagingDrawer
        direction="right"
        open={rightPanel !== null}
        onClose={() => setRightPanel(null)}
        title={rightTitle}
        railWidth={0}
      >
        {rightPanel === 'combat-feed' && (
          <CombatFeedPanel
            campaignId={campaignId}
            characters={characters}
          />
        )}

        {rightPanel === 'enc-adversaries' && (
          <EncounterAdversaryPanel
            campaignId={campaignId}
            characters={characters}
          />
        )}

        {rightPanel === 'enc-vehicles' && (
          <EncounterVehiclePanel
            campaignId={campaignId}
          />
        )}
      </StagingDrawer>
    </>
  )
}

/* ── Pill ─────────────────────────────────────────────────── */
/**
 * Each pill is fully self-contained — its own background, border, and
 * border-radius.  The parent container is purely a transparent flex column
 * used for stacking; it contributes no visible panel behind the group.
 */
const Pill = memo(function Pill({
  icon, label, active, disabled, accentColor, onClick,
}: {
  icon:        string
  label:       string
  active:      boolean
  disabled:    boolean
  accentColor: string
  onClick:     () => void
}) {
  const textColor = disabled
    ? 'rgba(106,128,112,0.32)'
    : active
    ? accentColor
    : DIM

  const bg     = active ? `${accentColor}15` : 'rgba(6,13,9,0.90)'
  const border = active
    ? `1px solid ${accentColor}88`
    : disabled
    ? '1px solid rgba(200,170,80,0.07)'
    : '1px solid rgba(200,170,80,0.22)'

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      title={label}
      style={{
        display:              'flex',
        alignItems:           'center',
        gap:                  8,
        padding:              '7px 14px',
        background:           bg,
        backdropFilter:       'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border,
        borderRadius:         8,
        cursor:               disabled ? 'not-allowed' : 'pointer',
        pointerEvents:        'auto',
        whiteSpace:           'nowrap',
        transition:           'background 0.15s, border-color 0.15s',
        boxShadow:            active ? `0 2px 12px rgba(0,0,0,0.5)` : '0 2px 8px rgba(0,0,0,0.35)',
      }}
      onMouseEnter={e => {
        if (!disabled && !active) {
          const el = e.currentTarget as HTMLElement
          el.style.background    = `${accentColor}0a`
          el.style.borderColor   = `${accentColor}44`
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          const el = e.currentTarget as HTMLElement
          el.style.background  = 'rgba(6,13,9,0.90)'
          el.style.borderColor = disabled ? 'rgba(200,170,80,0.07)' : 'rgba(200,170,80,0.22)'
        }
      }}
    >
      <span style={{
        fontSize:   13,
        lineHeight: 1,
        color:      textColor,
        flexShrink: 0,
        transition: 'color 0.15s',
      }}>
        {icon}
      </span>
      <span style={{
        fontFamily:    FR,
        fontSize:      'var(--text-label)',
        fontWeight:    700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color:         textColor,
        lineHeight:    1,
        transition:    'color 0.15s',
      }}>
        {label}
      </span>
    </button>
  )
})
