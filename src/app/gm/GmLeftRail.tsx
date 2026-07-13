'use client'

import { memo } from 'react'
import { HUD, FONT_BODY, RADIUS, Z, EASE, FS } from '@/lib/tokens'

export type GmPanelId = 'map' | 'tools' | 'party' | 'library'

interface RailButton {
  id:        GmPanelId
  icon:      string
  label:     string
  accent:    string
  imgSrc?:   string
  imgClass?: string
}

const BUTTONS: RailButton[] = [
  { id: 'map',    icon: '◉', label: 'Tokens', accent: HUD.gold },
  { id: 'tools',  icon: '⊞', label: 'Tools',  accent: 'var(--die-force)' },
  { id: 'party',  icon: '◉', label: 'Party',  accent: '#4EC8A8' }, // pre-approved: no matching token
]

interface Props {
  activePanel:   GmPanelId | null
  onPanelToggle: (id: GmPanelId) => void
  onDiceClick:   () => void
  onScreenClick: () => void
  diceActive:    boolean
  screenActive:  boolean
  deckOpen:      boolean
  onDeckToggle:  () => void
}

export const GmLeftRail = memo(function GmLeftRail({
  activePanel, onPanelToggle, onDiceClick, onScreenClick, diceActive, screenActive, deckOpen, onDeckToggle,
}: Props) {
  return (
    <div style={{
      width:         '3.25rem',
      flexShrink:    0,
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           '0.125rem',
      paddingTop:    '0.5rem',
      paddingBottom: '0.5rem',
      background:    'var(--hud-panel)',
      borderRight:   '1px solid var(--hud-border-hi)',
      zIndex:        Z.fab,
    }}>
      {BUTTONS.map(btn => (
        <RailBtn
          key={btn.id}
          icon={btn.icon}
          label={btn.label}
          active={activePanel === btn.id}
          accent={btn.accent}
          imgSrc={btn.imgSrc}
          imgClass={btn.imgClass}
          onClick={() => onPanelToggle(btn.id)}
        />
      ))}

      <RailBtn
        icon=""
        label="Enemies"
        active={deckOpen}
        accent="var(--state-failure)"
        imgSrc="/images/factions/empire.png"
        imgClass="hud-fi hud-fi-empire"
        onClick={onDeckToggle}
      />

      <div style={{ width: '1.75rem', height: 1, background: 'var(--hud-border-hi)', margin: '0.375rem 0' }} />

      <RailBtn icon="⬡" label="Dice"    active={diceActive}              accent={HUD.gold}              onClick={onDiceClick} />
      <RailBtn icon="▦" label="Screen"  active={screenActive}            accent={HUD.gold}              onClick={onScreenClick} />
      <RailBtn icon="⊟" label="Library" active={activePanel === 'library'} accent="var(--die-force)"   onClick={() => onPanelToggle('library')} />
    </div>
  )
})

function RailBtn({ icon, label, active, accent, onClick, imgSrc, imgClass }: {
  icon: string; label: string; active: boolean; accent: string; onClick: () => void;
  imgSrc?: string; imgClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width:          '2.5rem',
        height:         '2.75rem',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '0.1875rem',
        background:     active ? `color-mix(in srgb, ${accent} 9%, transparent)` : 'transparent',
        border:         active ? `1px solid color-mix(in srgb, ${accent} 33%, transparent)` : '1px solid transparent',
        borderRadius:   RADIUS.md,
        cursor:         'pointer',
        transition:     `background ${EASE.quick}, border-color ${EASE.quick}`,
      }}
    >
      {imgSrc
        ? <img src={imgSrc} className={imgClass} alt="" aria-hidden />
        : <span style={{ fontSize: FS.h4, lineHeight: 1 }}>{icon}</span>
      }
      <span style={{
        fontFamily:    FONT_BODY,
        fontSize:      'var(--text-overline)',
        fontWeight:    700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color:         active ? accent : 'var(--hud-text-dim)',
        lineHeight:    1,
      }}>{label}</span>
    </button>
  )
}
