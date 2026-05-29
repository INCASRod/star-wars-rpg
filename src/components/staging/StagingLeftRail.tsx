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
import { HUD, FONT_BODY, FS, SP, RADIUS, EASE } from '@/lib/tokens'

/* ── Design tokens ────────────────────────────────────────── */
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
          width:                '3.75rem',
          zIndex:               9001,
          display:              'flex',
          flexDirection:        'column',
          alignItems:           'center',
          paddingTop:           SP[3],
          paddingBottom:        SP[3],
          gap:                  SP[1],
          background:           'var(--hud-surface-hi)',
          backdropFilter:       'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRight:          '1px solid var(--hud-border)',
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
          <div style={{ padding: '0.75rem 0.875rem' }}>
            <AdversaryLibrary
              campaignId={campaignId}
              sessionMode={sessionMode}
              onAddToken={onAddAdversaryToken}
            />
          </div>
        )}

        {openPanel === 'vehicles' && (
          <div style={{ padding: '0.75rem 0.875rem' }}>
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
  const iconColor  = disabled ? 'rgba(106,128,112,0.28)' : active ? HUD.gold : DIM
  const labelColor = disabled ? 'rgba(106,128,112,0.22)' : active ? HUD.gold : 'rgba(106,128,112,0.55)'

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      title={label.replace('\n', ' ')}
      className={!disabled && !active ? 'hov-gold-bg' : ''}
      style={{
        width:          '3.25rem',
        padding:        '0.625rem 0 0.5625rem',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            '0.3125rem',
        background:     active ? 'var(--hud-surface-lo)' : 'transparent',
        border:         'none',
        borderRadius:   '0.375rem',
        outline:        active ? '1px solid var(--hud-border-hi)' : 'none',
        cursor:         disabled ? 'not-allowed' : 'pointer',
        transition:     `background ${EASE.default}, outline ${EASE.default}`,
        flexShrink:     0,
      }}
    >
      {/* Icon */}
      <span
        style={{
          fontSize:   '1.125rem',
          lineHeight: 1,
          color:      iconColor,
          display:    'block',
          transition: `color ${EASE.default}`,
        }}
      >
        {icon}
      </span>

      {/* Label — Cinzel, tiny, all-caps */}
      <span
        style={{
          fontFamily:    FONT_BODY,
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
          transition:    `color ${EASE.default}`,
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
        padding:       `1.5rem ${SP[4]}`,
        display:       'flex',
        flexDirection: 'column',
        gap:           SP[2],
      }}
    >
      <div
        style={{
          fontFamily:    FONT_BODY,
          fontSize:      'var(--text-sm)',
          color:         'var(--hud-text-dim)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {panelId}
      </div>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize:   'var(--text-sm)',
          color:      'rgba(106,128,112,0.5)',
          lineHeight: 1.5,
        }}
      >
        {STUB_HINTS[panelId] ?? ''}
      </div>
      <div
        style={{
          marginTop:  '0.75rem',
          fontFamily: FONT_BODY,
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
