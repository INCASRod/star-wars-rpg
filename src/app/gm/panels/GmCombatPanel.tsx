'use client'

import type { Character } from '@/lib/types'
import type { CombatEncounter } from '@/lib/combat'
import { EncounterAdversaryPanel } from '@/components/staging/EncounterAdversaryPanel'
import { EncounterVehiclePanel } from '@/components/staging/EncounterVehiclePanel'
import { HUD } from '@/lib/tokens'

const FONT  = 'var(--font-body)'
const RED   = '#E05050'
const GREEN = '#4EC87A'
const DIM   = 'var(--hud-text-dim)'

const headerBtn = (accent: string, active = false): React.CSSProperties => ({
  display:       'flex',
  alignItems:    'center',
  gap:           6,
  padding:       '6px 14px',
  background:    active ? `${accent}18` : 'transparent',
  border:        `1px solid ${active ? `${accent}55` : 'var(--hud-border-hi)'}`,
  borderRadius:  4,
  cursor:        'pointer',
  fontFamily:    FONT,
  fontSize:      'var(--text-caption)',
  fontWeight:    700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color:         active ? accent : DIM,
  transition:    'background 0.15s, border-color 0.15s',
  whiteSpace:    'nowrap',
})

export interface GmCombatPanelProps {
  campaignId:       string
  encounter:        CombatEncounter | null
  characters:       Character[]
  onStartCombat:    () => void
  onInitiativeOrder:() => void
  initiativeOpen:   boolean
}

export function GmCombatPanel({
  campaignId, encounter, characters, onStartCombat, onInitiativeOrder, initiativeOpen,
}: GmCombatPanelProps) {
  const isActive = encounter?.is_active === true

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Action bar */}
      <div style={{
        padding:      '8px 12px',
        borderBottom: '1px solid var(--hud-border-hi)',
        flexShrink:   0,
        display:      'flex',
        gap:          8,
        flexWrap:     'wrap',
      }}>
        <button onClick={onStartCombat} style={headerBtn(GREEN)}>
          ▶ Start Combat
        </button>
        {isActive && (
          <button onClick={onInitiativeOrder} style={headerBtn(HUD.gold, initiativeOpen)}>
            ◉ Initiative Order
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Encounter adversaries */}
        <div style={{ borderBottom: '1px solid var(--hud-border)' }}>
          <div style={{
            padding:       '6px 12px',
            fontFamily:    FONT,
            fontSize:      'var(--text-overline)',
            fontWeight:    700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         RED,
            background:    'var(--hud-surface-lo)',
          }}>
            Adversaries
          </div>
          <EncounterAdversaryPanel campaignId={campaignId} encounter={encounter} characters={characters} />
        </div>

        {/* Encounter vehicles */}
        <div>
          <div style={{
            padding:       '6px 12px',
            fontFamily:    FONT,
            fontSize:      'var(--text-overline)',
            fontWeight:    700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         '#5AAAE0',
            background:    'var(--hud-surface-lo)',
          }}>
            Vehicles
          </div>
          <EncounterVehiclePanel campaignId={campaignId} encounter={encounter} />
        </div>

        {/* Empty state — both panels handle their own empty states, this is a fallback hint */}
        {!encounter && (
          <div style={{ textAlign: 'center', padding: '32px 16px', fontFamily: FONT, fontSize: 'var(--text-sm)', color: DIM }}>
            Add tokens via 🗺 Map → Tokens
          </div>
        )}
      </div>
    </div>
  )
}
