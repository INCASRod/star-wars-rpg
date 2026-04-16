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

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMapTokens } from '@/hooks/useMapTokens'
import type { MapToken } from '@/hooks/useMapTokens'
import type { Character } from '@/lib/types'
import type { Adversary } from '@/lib/adversaries'
import type { Vehicle } from '@/lib/vehicles'
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
}

export function StagingFloatingToolbar({
  campaignId,
  sessionMode,
  mapId,
  characters,
  mapsLibraryOpen,
  onMapsClick,
}: StagingFloatingToolbarProps) {
  const supabase = useMemo(() => createClient(), [])
  const isCombat = sessionMode === 'combat'

  /* ── Shared map-token state (always mounted, drives canvas + panel) ── */
  const { tokens: mapTokens, addToken, removeToken, toggleVisibility, removeAllTokens } = useMapTokens(mapId)

  /* ── Drawer state ─────────────────────────────────────────
   * Left and right drawers are tracked independently.
   * Opening one side closes the other.                       */
  const [leftPanel,  setLeftPanel]  = useState<LeftPanelId | null>(null)
  const [rightPanel, setRightPanel] = useState<RightPanelId | null>(null)

  function openLeft(id: LeftPanelId) {
    setRightPanel(null)
    setLeftPanel(prev => (prev === id ? null : id))
  }

  function openRight(id: RightPanelId) {
    setLeftPanel(null)
    setRightPanel(prev => (prev === id ? null : id))
  }

  function handleLeftEntry(entry: LeftEntry) {
    if (entry.combatOnly && !isCombat) return
    if (entry.isExternal) {
      // External entries (Maps) are controlled by the parent; close any open local drawer.
      setLeftPanel(null)
      onMapsClick()
      return
    }
    if (entry.side === 'right') {
      openRight(entry.id as RightPanelId)
    } else {
      openLeft(entry.id as LeftPanelId)
    }
  }

  function activeForEntry(entry: LeftEntry): boolean {
    if (entry.isExternal) return mapsLibraryOpen
    if (entry.side === 'right') return rightPanel === entry.id
    return leftPanel === entry.id
  }

  /* ── Adversary token images (for "Add Token" callbacks) ── */
  const [advTokenImages, setAdvTokenImages] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase
      .from('adversary_token_images')
      .select('adversary_key, token_image_url')
      .then(({ data }) => {
        if (data) {
          setAdvTokenImages(
            Object.fromEntries(
              (data as Array<{ adversary_key: string; token_image_url: string }>)
                .map(r => [r.adversary_key, r.token_image_url])
            )
          )
        }
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── "Add Token" callbacks ────────────────────────────────
   * Bypasses the combat-encounter flow — adds a standalone
   * map_token that GmMapView will pick up via its subscription. */
  const handleAddAdversaryToken = useCallback(
    async (adv: Adversary & { _isCustom?: boolean }, alignment: 'enemy' | 'allied_npc') => {
      if (!mapId || !campaignId) return
      await addToken({
        map_id:           mapId,
        campaign_id:      campaignId,
        participant_type: 'adversary',
        character_id:     null,
        participant_id:   null,
        slot_key:         null,
        label:            adv.name,
        alignment,
        x:                0.5,
        y:                0.5,
        is_visible:       false,
        token_size:       1.0,
        wound_pct:        null,
        token_image_url:  advTokenImages[adv.name] ?? null,
        token_shape:      'circle',
      })
    },
    [mapId, campaignId, advTokenImages, addToken], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const handleAddVehicleToken = useCallback(
    async (vehicle: Vehicle & { _isCustom?: boolean }, alignment: 'enemy' | 'allied_npc') => {
      if (!mapId || !campaignId) return
      await addToken({
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
        token_image_url:  null,
        token_shape:      'rectangle',
      })
    },
    [mapId, campaignId, addToken], // eslint-disable-line react-hooks/exhaustive-deps
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
              onClick={() => handleLeftEntry(entry)}
            />
          )
        })}
      </div>

      {/* ── Right pill stack (combat only) ───────────────── */}
      {isCombat && (
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
              onClick={() => openRight(entry.id)}
            />
          ))}
        </div>
      )}

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
function Pill({
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
}
