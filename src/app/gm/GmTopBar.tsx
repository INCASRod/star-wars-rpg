'use client'

import { memo } from 'react'
import { HUD } from '@/lib/tokens'

const FONT_DISPLAY = 'var(--font-display)'
const FONT         = 'var(--font-body)'
const DIM          = 'var(--hud-text-dim)'
const RED          = '#E05050'
const GREEN        = '#4EC87A'

export interface GmTopBarProps {
  campaignName:  string
  sessionMode:   'exploration' | 'combat'
  sessionBusy:   boolean
  combatRound:   number
  onBeginCombat: () => void | Promise<void>
  onEndCombat:   () => void | Promise<void>
  onLobby:       () => void
  /** Destiny pool content — rendered between the combat toggle and the Lobby button */
  destinySlot?:  React.ReactNode
}

export const GmTopBar = memo(function GmTopBar({
  campaignName,
  sessionMode, sessionBusy, combatRound,
  onBeginCombat, onEndCombat, onLobby,
  destinySlot,
}: GmTopBarProps) {
  const isCombat = sessionMode === 'combat'

  return (
    <div style={{
      position:             'fixed',
      top:                  0,
      left:                 0,
      right:                0,
      height:               44,
      zIndex:               9002,
      display:              'flex',
      alignItems:           'center',
      paddingLeft:          16,
      paddingRight:         16,
      gap:                  10,
      background:           'var(--hud-surface-hi)',
      backdropFilter:       'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom:         '1px solid var(--hud-border)',
      boxShadow:            '0 2px 20px rgba(0,0,0,0.5)',
    }}>

      {/* ── Left: identity ─────────────────────────────────── */}
      <span style={{
        fontFamily:    FONT_DISPLAY,
        fontSize:      'var(--text-sm)',
        fontWeight:    700,
        color:         HUD.gold,
        letterSpacing: '0.15em',
        textShadow:    '0 0 16px rgba(150,168,180,0.35)',
        flexShrink:    0,
      }}>
        HOLOCRON
      </span>

      <Divider />

      <div style={{
        background:    'rgba(150,168,180,0.10)',
        border:        '1px solid rgba(150,168,180,0.35)',
        borderRadius:  3,
        padding:       '2px 7px',
        fontFamily:    FONT,
        fontSize:      'var(--text-overline)',
        fontWeight:    700,
        letterSpacing: '0.18em',
        color:         HUD.gold,
        flexShrink:    0,
      }}>
        GM
      </div>

      <span style={{
        fontFamily:   FONT,
        fontSize:     'var(--text-sm)',
        color:        'var(--hud-text)',
        whiteSpace:   'nowrap',
        overflow:     'hidden',
        textOverflow: 'ellipsis',
        maxWidth:     200,
      }}>
        {campaignName}
      </span>

      <Divider />

      {/* Mode badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: isCombat ? RED : GREEN, lineHeight: 1 }}>
          {isCombat ? '⚔' : '◈'}
        </span>
        <span style={{
          fontFamily:    FONT,
          fontSize:      '0.6rem',
          fontWeight:    700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color:         isCombat ? RED : GREEN,
        }}>
          {isCombat ? 'Combat' : 'Exploration'}
        </span>
        {isCombat && (
          <span style={{
            fontFamily:    FONT,
            fontSize:      'var(--text-sm)',
            fontWeight:    700,
            letterSpacing: '0.08em',
            color:         HUD.gold,
          }}>
            Round {combatRound}
          </span>
        )}
      </div>

      {/* ── Spacer ─────────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Right: combat toggle ───────────────────────────── */}
      {isCombat ? (
        <TopBarButton label="⬛ End Combat"   color={RED} disabled={sessionBusy} onClick={onEndCombat} />
      ) : (
        <TopBarButton label="▶ Begin Combat" color={RED} disabled={sessionBusy} onClick={onBeginCombat} />
      )}

      {/* ── Right: destiny slot ────────────────────────────── */}
      {destinySlot && (
        <>
          <Divider />
          {destinySlot}
        </>
      )}

      <Divider />

      {/* ── Right: lobby ───────────────────────────────────── */}
      <button
        onClick={onLobby}
        style={{
          background:    'transparent',
          border:        '1px solid var(--hud-border)',
          borderRadius:  3,
          padding:       '4px 12px',
          fontFamily:    FONT,
          fontSize:      'var(--text-caption)',
          color:         DIM,
          cursor:        'pointer',
          letterSpacing: '0.06em',
          flexShrink:    0,
          transition:    'color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.color = 'var(--hud-text)'
          el.style.borderColor = 'var(--hud-border-hi)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.color = DIM
          el.style.borderColor = 'var(--hud-border)'
        }}
      >
        ← Lobby
      </button>
    </div>
  )
})

function Divider() {
  return <div style={{ width: 1, height: 20, background: 'var(--hud-border-hi)', flexShrink: 0 }} />
}

function TopBarButton({
  label, color, disabled, onClick,
}: { label: string; color: string; disabled: boolean; onClick: () => void | Promise<void> }) {
  return (
    <button
      disabled={disabled}
      onClick={() => void onClick()}
      style={{
        fontFamily:    FONT,
        fontSize:      '0.58rem',
        fontWeight:    700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color:         disabled ? 'rgba(150,168,180,0.25)' : color,
        background:    'var(--hud-surface-lo)',
        border:        `1px solid ${disabled ? 'var(--hud-border)' : 'var(--hud-border-hi)'}`,
        borderRadius:  4,
        padding:       '5px 14px',
        cursor:        disabled ? 'not-allowed' : 'pointer',
        transition:    'color 0.15s, background 0.15s, border-color 0.15s',
        flexShrink:    0,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'var(--hud-surface-mid)'
          el.style.borderColor = color
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'var(--hud-surface-lo)'
          el.style.borderColor = 'var(--hud-border-hi)'
        }
      }}
    >
      {label}
    </button>
  )
}
