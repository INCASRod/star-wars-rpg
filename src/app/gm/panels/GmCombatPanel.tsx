'use client'

import type { Character } from '@/lib/types'
import type { CombatEncounter } from '@/lib/combat'
import { EncounterAdversaryPanel } from '@/components/staging/EncounterAdversaryPanel'
import { EncounterVehiclePanel } from '@/components/staging/EncounterVehiclePanel'
import { FONT_BODY, EASE, RADIUS } from '@/lib/tokens'

const FONT = FONT_BODY
const DIM  = 'var(--hud-text-dim)'

const headerBtn = (accent: string): React.CSSProperties => ({
  display:       'flex',
  alignItems:    'center',
  gap:           '0.375rem',
  padding:       '0.375rem 0.875rem',
  background:    'transparent',
  border:        '1px solid var(--hud-border-hi)',
  borderRadius:  RADIUS.md,
  cursor:        'pointer',
  fontFamily:    FONT,
  fontSize:      'var(--text-caption)',
  fontWeight:    700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color:         accent,
  transition:    `background ${EASE.quick}, border-color ${EASE.quick}`,
  whiteSpace:    'nowrap',
})

export interface GmCombatPanelProps {
  campaignId:    string
  encounter:     CombatEncounter | null
  characters:    Character[]
  onStartCombat: () => void
}

export function GmCombatPanel({
  campaignId, encounter, characters, onStartCombat,
}: GmCombatPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Action bar */}
      <div style={{
        padding:      '0.5rem 0.75rem',
        borderBottom: '1px solid var(--hud-border-hi)',
        flexShrink:   0,
        display:      'flex',
        gap:          '0.5rem',
        flexWrap:     'wrap',
      }}>
        <button onClick={onStartCombat} style={headerBtn('var(--state-success)')}>
          ▶ Start Combat
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Encounter adversaries */}
        <div style={{ borderBottom: '1px solid var(--hud-border)' }}>
          <div style={{
            padding:       '0.375rem 0.75rem',
            fontFamily:    FONT,
            fontSize:      'var(--text-overline)',
            fontWeight:    700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         'var(--state-failure)',
            background:    'var(--hud-surface-lo)',
          }}>
            Adversaries
          </div>
          <EncounterAdversaryPanel campaignId={campaignId} encounter={encounter} characters={characters} />
        </div>

        {/* Encounter vehicles */}
        <div>
          <div style={{
            padding:       '0.375rem 0.75rem',
            fontFamily:    FONT,
            fontSize:      'var(--text-overline)',
            fontWeight:    700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         'var(--die-force)',
            background:    'var(--hud-surface-lo)',
          }}>
            Vehicles
          </div>
          <EncounterVehiclePanel campaignId={campaignId} encounter={encounter} />
        </div>

        {/* Empty state — both panels handle their own empty states, this is a fallback hint */}
        {!encounter && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', fontFamily: FONT, fontSize: 'var(--text-sm)', color: DIM }}>
            Add tokens via 🗺 Map → Tokens
          </div>
        )}
      </div>
    </div>
  )
}
