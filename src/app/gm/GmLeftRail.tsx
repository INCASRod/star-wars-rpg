'use client'

import { memo } from 'react'
import { HUD, FONT_BODY, RADIUS, Z } from '@/lib/tokens'

export type GmPanelId = 'map' | 'tools' | 'party' | 'combat'

interface RailButton {
  id:        GmPanelId
  icon:      string
  label:     string
  accent:    string
  imgSrc?:   string
  imgClass?: string
}

const BUTTONS: RailButton[] = [
  { id: 'map',    icon: '◎', label: 'Map',    accent: HUD.gold },
  { id: 'tools',  icon: '⊞', label: 'Tools',  accent: '#5AAAE0' },
  { id: 'party',  icon: '◉', label: 'Party',  accent: '#4EC8A8' },
  { id: 'combat', icon: '',  label: 'Enemies', accent: '#E05050',
    imgSrc: '/images/factions/empire.png', imgClass: 'hud-fi hud-fi-empire' },
]

interface Props {
  activePanel:   GmPanelId | null
  onPanelToggle: (id: GmPanelId) => void
  onDiceClick:   () => void
  onScreenClick: () => void
  diceActive:    boolean
  screenActive:  boolean
}

export const GmLeftRail = memo(function GmLeftRail({
  activePanel, onPanelToggle, onDiceClick, onScreenClick, diceActive, screenActive,
}: Props) {
  return (
    <div style={{
      width:         52,
      flexShrink:    0,
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           2,
      paddingTop:    8,
      paddingBottom: 8,
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

      <div style={{ width: 28, height: 1, background: 'var(--hud-border-hi)', margin: '6px 0' }} />

      <RailBtn icon="⬡" label="Dice"   active={diceActive}   accent={HUD.gold} onClick={onDiceClick} />
      <RailBtn icon="▦" label="Screen" active={screenActive} accent={HUD.gold} onClick={onScreenClick} />
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
        width:          40,
        height:         44,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            3,
        background:     active ? `${accent}18` : 'transparent',
        border:         active ? `1px solid ${accent}55` : '1px solid transparent',
        borderRadius:   RADIUS.md,
        cursor:         'pointer',
        transition:     'background 0.15s, border-color 0.15s',
      }}
    >
      {imgSrc
        ? <img src={imgSrc} className={imgClass} alt="" aria-hidden />
        : <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
      }
      <span style={{
        fontFamily:    FONT_BODY,
        fontSize:      '8px',
        fontWeight:    700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color:         active ? accent : 'var(--hud-text-dim)',
        lineHeight:    1,
      }}>{label}</span>
    </button>
  )
}
