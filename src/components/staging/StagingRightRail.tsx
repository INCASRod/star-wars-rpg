'use client'

import { useState } from 'react'
import type { Character } from '@/lib/types'
import { StagingDrawer } from './StagingDrawer'
import { EncounterAdversaryPanel } from './EncounterAdversaryPanel'
import { EncounterVehiclePanel } from './EncounterVehiclePanel'

/* ── Design tokens ────────────────────────────────────────── */
const FC   = "var(--font-cinzel), 'Cinzel', serif"
const GOLD = '#C8AA50'
const DIM  = '#6A8070'

/* ── Panel registry ───────────────────────────────────────── */
type RightPanelId = 'adversaries' | 'vehicles'

interface RailEntry {
  id:          RightPanelId
  icon:        string
  label:       string
  drawerTitle: string
}

const RAIL_ENTRIES: RailEntry[] = [
  { id: 'adversaries', icon: '◆', label: 'Adversaries', drawerTitle: 'Encounter Adversaries' },
  { id: 'vehicles',    icon: '△', label: 'Vehicles',    drawerTitle: 'Encounter Vehicles'    },
]

/* ── Props ────────────────────────────────────────────────── */
export interface StagingRightRailProps {
  campaignId:  string
  characters:  Character[]
  /** Rail is hidden when false — only shown during active combat */
  isCombatActive: boolean
}

/**
 * StagingRightRail — permanently-visible vertical icon+label toolbar on the
 * RIGHT side of the staging canvas, visible only when combat is active.
 *
 * Buttons: Adversaries (◆), Vehicles (△)
 * Each opens a right-side drawer (StagingRightDrawer).
 *
 * z-index stack:
 *   right drawer backdrop  8999
 *   right drawer panel     9000
 *   left rail / top bar    9001–9002
 *   this rail              9003  ← above all, always clickable
 */
export function StagingRightRail({ campaignId, characters, isCombatActive }: StagingRightRailProps) {
  const [openPanel, setOpenPanel] = useState<RightPanelId | null>(null)

  // Hide rail entirely outside combat
  if (!isCombatActive) return null

  const activeEntry = openPanel ? RAIL_ENTRIES.find(e => e.id === openPanel) : null

  function handleClick(id: RightPanelId) {
    setOpenPanel(prev => (prev === id ? null : id))
  }

  return (
    <>
      {/* ── Vertical strip ─────────────────────────────────── */}
      <div
        style={{
          position:             'fixed',
          top:                  0,
          right:                0,
          bottom:               0,
          width:                60,
          zIndex:               9003,
          display:              'flex',
          flexDirection:        'column',
          alignItems:           'center',
          paddingTop:           12,
          paddingBottom:        12,
          gap:                  4,
          background:           'rgba(6,13,9,0.82)',
          backdropFilter:       'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderLeft:           '1px solid rgba(200,170,80,0.16)',
        }}
      >
        {RAIL_ENTRIES.map(entry => (
          <RailButton
            key={entry.id}
            icon={entry.icon}
            label={entry.label}
            active={openPanel === entry.id}
            onClick={() => handleClick(entry.id)}
          />
        ))}
      </div>

      {/* ── Slide-in drawer ────────────────────────────────── */}
      <StagingDrawer
        direction="right"
        open={openPanel !== null}
        onClose={() => setOpenPanel(null)}
        title={activeEntry?.drawerTitle ?? ''}
      >
        {openPanel === 'adversaries' && (
          <EncounterAdversaryPanel
            campaignId={campaignId}
            characters={characters}
          />
        )}

        {openPanel === 'vehicles' && (
          <EncounterVehiclePanel
            campaignId={campaignId}
          />
        )}
      </StagingDrawer>
    </>
  )
}

/* ── RailButton ───────────────────────────────────────────── */
function RailButton({
  icon, label, active, onClick,
}: {
  icon: string; label: string; active: boolean; onClick: () => void
}) {
  const iconColor  = active ? GOLD : DIM
  const labelColor = active ? GOLD : 'rgba(106,128,112,0.55)'

  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width:         52,
        padding:       '10px 0 9px',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           5,
        background:    active ? 'rgba(200,170,80,0.11)' : 'transparent',
        border:        'none',
        borderRadius:  6,
        outline:       active ? '1px solid rgba(200,170,80,0.32)' : 'none',
        cursor:        'pointer',
        transition:    'background 0.15s, outline 0.15s',
        flexShrink:    0,
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.06)'
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1, color: iconColor, display: 'block', transition: 'color 0.15s' }}>
        {icon}
      </span>
      <span style={{
        fontFamily:    FC, fontSize: '0.48rem', fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: labelColor, lineHeight: 1.2, textAlign: 'center',
        whiteSpace: 'pre-wrap', maxWidth: 46, display: 'block',
        transition: 'color 0.15s',
      }}>
        {label}
      </span>
    </button>
  )
}
