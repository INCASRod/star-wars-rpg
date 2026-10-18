'use client'

import { memo } from 'react'
import { HUD, FONT_BODY, RADIUS, Z, EASE, FS } from '@/lib/tokens'

export type GmPanelId = 'map' | 'tools' | 'party' | 'library' | 'market'

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
  { id: 'market', icon: '⌂', label: 'Market', accent: HUD.gold },
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
  campaignId?:   string | null
}

export const GmLeftRail = memo(function GmLeftRail({
  activePanel, onPanelToggle, onDiceClick, onScreenClick, diceActive, screenActive, deckOpen, onDeckToggle, campaignId,
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

      <div style={{ width: '1.75rem', height: 1, background: 'var(--hud-border-hi)', margin: '0.375rem 0' }} />

      {/* Leaves the page — opens the standalone Console tab. Intentionally the
          only rail item that is an outbound link rather than an in-place panel. */}
      <a
        href={`/gm/console${campaignId ? `?campaign=${campaignId}` : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Console (opens in new tab)"
        className="console-rail-link"
        style={{
          width:          '2.5rem',
          height:         '2.75rem',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '0.1875rem',
          textDecoration: 'none',
        }}
      >
        <OutboundIcon><path d="M5 4.5C5 4.5 8.5 4 12 6c3.5-2 7-1.5 7-1.5V18s-3.5-.5-7 1.5c-3.5-2-7-1.5-7-1.5zM12 6v13.5" /></OutboundIcon>
        <span style={{
          fontFamily:    FONT_BODY,
          fontSize:      'var(--text-overline)',
          fontWeight:    700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color:         'var(--hud-text-dim)',
          lineHeight:    1,
        }}>Console</span>
      </a>

      {/* Same outbound-link pattern as Console: opens the Galaxy / Astrogation tool in its own tab. */}
      <a
        href={`/gm/galaxy${campaignId ? `?campaign=${campaignId}` : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Galaxy (opens in new tab)"
        className="console-rail-link"
        style={{
          width:          '2.5rem',
          height:         '2.75rem',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '0.1875rem',
          textDecoration: 'none',
        }}
      >
        <OutboundIcon><circle cx="12" cy="12" r="1.6" /><path d="M12 12c1.5-3 5.5-3.2 7 .2 1.6 3.7-1.4 7.6-6 7.6-5.4 0-9.4-4.6-8-9.6 1.2-4.2 5.4-6.2 9.2-5.2" /></OutboundIcon>
        <span style={{
          fontFamily:    FONT_BODY,
          fontSize:      'var(--text-overline)',
          fontWeight:    700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color:         'var(--hud-text-dim)',
          lineHeight:    1,
        }}>Galaxy</span>
      </a>
    </div>
  )
})

/** Console (book) and Galaxy (spiral) glyphs: 1.5 stroke, currentColor, FS.h4 box like the rail's text icons. The corner arrow keeps the "opens in a new tab" cue. */
function OutboundIcon({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', fontSize: FS.h4, lineHeight: 1, color: 'var(--hud-text-dim)' }}>
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
      <span style={{ position: 'absolute', top: '-0.4em', right: '-0.5em', fontSize: FS.overline, lineHeight: 1 }}>↗</span>
    </span>
  )
}

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
