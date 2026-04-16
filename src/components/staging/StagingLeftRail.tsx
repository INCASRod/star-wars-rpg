'use client'

import { useState } from 'react'
import type { Adversary } from '@/lib/adversaries'
import type { Vehicle } from '@/lib/vehicles'
import type { Character } from '@/lib/types'
import { useMapTokens } from '@/hooks/useMapTokens'
import { AdversaryLibrary } from '@/components/gm/AdversaryLibrary'
import { VehicleLibrary } from '@/components/gm/VehicleLibrary'
import { StagingTokenPanel } from './StagingTokenPanel'
import { StagingDrawer } from './StagingDrawer'
import { CombatFeedPanel } from './CombatFeedPanel'

/* ── Design tokens ────────────────────────────────────────── */
const FC   = "var(--font-cinzel), 'Cinzel', serif"
const FR   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const GOLD = '#C8AA50'
const DIM  = '#6A8070'

/* ── Panel registry ───────────────────────────────────────── */
export type StagingPanelId = 'maps' | 'adversaries' | 'vehicles' | 'tokens' | 'combat-feed'

interface RailEntry {
  id:              StagingPanelId
  icon:            string
  label:           string
  drawerTitle:     string
  requiresCombat?: true
}

const RAIL_ENTRIES: RailEntry[] = [
  { id: 'maps',        icon: '◉', label: 'Maps',        drawerTitle: 'Maps' },
  { id: 'adversaries', icon: '◆', label: 'Adversaries', drawerTitle: 'Adversaries' },
  { id: 'vehicles',    icon: '△', label: 'Vehicles',    drawerTitle: 'Vehicles' },
  { id: 'tokens',      icon: '◈', label: 'Tokens',      drawerTitle: 'Tokens' },
  {
    id: 'combat-feed', icon: '⚔', label: 'Combat\nFeed', drawerTitle: 'Combat Feed',
    requiresCombat: true,
  },
]

/* ── Props ────────────────────────────────────────────────── */
export interface StagingLeftRailProps {
  campaignId:   string
  sessionMode:  'exploration' | 'combat'
  /** ID of the currently-active map; passed to StagingTokenPanel. */
  mapId:        string | null
  /** All campaign characters (active + archived); the token panel filters internally. */
  characters:   Character[]
  /** Pass true when a combat encounter is active to enable the Combat Feed button. */
  isCombatActive?: boolean
  /**
   * Called when the user picks Enemy / Friendly NPC in the Adversary "Add Token" flow.
   * Wire up to useMapTokens.addToken in the parent staging view.
   */
  onAddAdversaryToken?: (
    adv:       Adversary & { _isCustom?: boolean },
    alignment: 'enemy' | 'allied_npc',
  ) => void
  /**
   * Called when the user picks Enemy / Friendly NPC in the Vehicle "Add Token" flow.
   * Wire up to useMapTokens.addToken in the parent staging view.
   */
  onAddVehicleToken?: (
    vehicle:   Vehicle & { _isCustom?: boolean },
    alignment: 'enemy' | 'allied_npc',
  ) => void
}

/**
 * StagingLeftRail — permanently-visible vertical icon+label toolbar over the
 * staging map. Clicking a button opens its corresponding left-side drawer;
 * clicking the active button closes it.
 *
 * Uses position:fixed so it sits above GmReferenceDrawer's backdrop (z 8999)
 * without being clipped by any parent overflow or stacking context.
 *
 * z-index stack:
 *   drawer backdrop  8999
 *   drawer panel     9000
 *   this rail        9001  ← always on top, always clickable
 */
export function StagingLeftRail({
  campaignId,
  sessionMode,
  mapId,
  characters,
  isCombatActive = false,
  onAddAdversaryToken,
  onAddVehicleToken,
}: StagingLeftRailProps) {
  const [openPanel, setOpenPanel] = useState<StagingPanelId | null>(null)

  const { tokens: mapTokens, addToken, removeToken, toggleVisibility, removeAllTokens } = useMapTokens(mapId)

  function handleRailClick(id: StagingPanelId, disabled: boolean) {
    if (disabled) return
    setOpenPanel(prev => (prev === id ? null : id))
  }

  const activeEntry = openPanel ? RAIL_ENTRIES.find(e => e.id === openPanel) : null

  return (
    <>
      {/* ── Vertical strip ─────────────────────────────────── */}
      <div
        style={{
          position:             'fixed',
          top:                  0,
          left:                 0,
          bottom:               0,
          width:                60,
          zIndex:               9001,
          display:              'flex',
          flexDirection:        'column',
          alignItems:           'center',
          paddingTop:           12,
          paddingBottom:        12,
          gap:                  4,
          background:           'rgba(6,13,9,0.82)',
          backdropFilter:       'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRight:          '1px solid rgba(200,170,80,0.16)',
        }}
      >
        {RAIL_ENTRIES.map(entry => {
          const disabled = !!entry.requiresCombat && !isCombatActive
          const isActive = openPanel === entry.id

          return (
            <RailButton
              key={entry.id}
              icon={entry.icon}
              label={entry.label}
              active={isActive}
              disabled={disabled}
              onClick={() => handleRailClick(entry.id, disabled)}
            />
          )
        })}
      </div>

      {/* ── Slide-in drawer ────────────────────────────────── */}
      {/*
        `open` stays true while switching panels so the drawer doesn't
        animate close/reopen — only the title + content swap.
      */}
      <StagingDrawer
        direction="left"
        open={openPanel !== null}
        onClose={() => setOpenPanel(null)}
        title={activeEntry?.drawerTitle ?? ''}
      >
        {openPanel === 'adversaries' && (
          <div style={{ padding: '12px 14px' }}>
            <AdversaryLibrary
              campaignId={campaignId}
              sessionMode={sessionMode}
              onAddToken={onAddAdversaryToken}
            />
          </div>
        )}

        {openPanel === 'vehicles' && (
          <div style={{ padding: '12px 14px' }}>
            <VehicleLibrary
              campaignId={campaignId}
              sessionMode={sessionMode}
              onAddToken={onAddVehicleToken}
            />
          </div>
        )}

        {openPanel === 'tokens' && (
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

        {openPanel === 'combat-feed' && (
          <CombatFeedPanel
            campaignId={campaignId}
            characters={characters}
          />
        )}

        {openPanel === 'maps' && (
          <PanelStub panelId={openPanel} />
        )}
      </StagingDrawer>
    </>
  )
}

/* ── RailButton ───────────────────────────────────────────── */
interface RailButtonProps {
  icon:     string
  label:    string
  active:   boolean
  disabled: boolean
  onClick:  () => void
}

function RailButton({ icon, label, active, disabled, onClick }: RailButtonProps) {
  const iconColor  = disabled ? 'rgba(106,128,112,0.28)' : active ? GOLD : DIM
  const labelColor = disabled ? 'rgba(106,128,112,0.22)' : active ? GOLD : 'rgba(106,128,112,0.55)'

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      title={label.replace('\n', ' ')}
      style={{
        width:          52,
        padding:        '10px 0 9px',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            5,
        background:     active ? 'rgba(200,170,80,0.11)' : 'transparent',
        border:         'none',
        borderRadius:   6,
        outline:        active ? '1px solid rgba(200,170,80,0.32)' : 'none',
        cursor:         disabled ? 'not-allowed' : 'pointer',
        transition:     'background 0.15s, outline 0.15s',
        flexShrink:     0,
      }}
      onMouseEnter={e => {
        if (!disabled && !active)
          (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.06)'
      }}
      onMouseLeave={e => {
        if (!active)
          (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      {/* Icon */}
      <span
        style={{
          fontSize:   18,
          lineHeight: 1,
          color:      iconColor,
          display:    'block',
          transition: 'color 0.15s',
        }}
      >
        {icon}
      </span>

      {/* Label — Cinzel, tiny, all-caps */}
      <span
        style={{
          fontFamily:    FC,
          fontSize:      '0.48rem',
          fontWeight:    700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color:         labelColor,
          lineHeight:    1.2,
          textAlign:     'center',
          whiteSpace:    'pre-wrap',   // honours '\n' in label strings
          maxWidth:      46,
          display:       'block',
          transition:    'color 0.15s',
        }}
      >
        {label}
      </span>
    </button>
  )
}

/* ── Stub content (maps, tokens, combat-feed) ─────────────── */
const STUB_HINTS: Partial<Record<StagingPanelId, string>> = {
  'maps':        'Upload and switch between battle maps.',
  'combat-feed': 'Live combat log and round tracker.',
}

function PanelStub({ panelId }: { panelId: StagingPanelId }) {
  return (
    <div
      style={{
        padding:       '24px 16px',
        display:       'flex',
        flexDirection: 'column',
        gap:           8,
      }}
    >
      <div
        style={{
          fontFamily:    FC,
          fontSize:      'var(--text-sm)',
          color:         'rgba(200,170,80,0.35)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {panelId}
      </div>
      <div
        style={{
          fontFamily: FR,
          fontSize:   'var(--text-sm)',
          color:      'rgba(106,128,112,0.5)',
          lineHeight: 1.5,
        }}
      >
        {STUB_HINTS[panelId] ?? ''}
      </div>
      <div
        style={{
          marginTop:  12,
          fontFamily: FR,
          fontSize:   'var(--text-caption)',
          color:      'rgba(106,128,112,0.3)',
          fontStyle:  'italic',
        }}
      >
        Content coming soon.
      </div>
    </div>
  )
}
