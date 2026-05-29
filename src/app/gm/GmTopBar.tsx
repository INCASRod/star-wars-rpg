'use client'

import { memo } from 'react'
import { HUD, FONT_DISPLAY, FONT_BODY, RADIUS } from '@/lib/tokens'

const FONT = FONT_BODY

export interface GmTopBarProps {
  campaignName:       string
  sessionMode:        'exploration' | 'combat'
  sessionBusy:        boolean
  combatRound:        number
  onBeginCombat:      () => void | Promise<void>
  onEndCombat:        () => void | Promise<void>
  onInitiativeOrder:  () => void
  initiativeOpen:     boolean
  onLobby:            () => void
  /** Destiny pool content — rendered between the combat toggle and the Lobby button */
  destinySlot?:       React.ReactNode
}

export const GmTopBar = memo(function GmTopBar({
  campaignName,
  sessionMode, sessionBusy, combatRound,
  onBeginCombat, onEndCombat, onInitiativeOrder, initiativeOpen, onLobby,
  destinySlot,
}: GmTopBarProps) {
  const isCombat = sessionMode === 'combat'

  return (
    <div style={{
      position:             'fixed',
      top:                  0,
      left:                 0,
      right:                0,
      height:               '2.75rem',
      zIndex:               'var(--z-hud-combat)' as unknown as number,
      display:              'flex',
      alignItems:           'center',
      paddingLeft:          'var(--space-4)',
      paddingRight:         'var(--space-4)',
      gap:                  '0.625rem',
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
        background:    'var(--hud-surface-lo)',
        border:        '1px solid var(--hud-border-hi)',
        borderRadius:  RADIUS.sm,
        padding:       '0.125rem 0.4375rem',
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
        maxWidth:     '12.5rem',
      }}>
        {campaignName}
      </span>

      <Divider />

      {/* Mode badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
        <span style={{ fontSize: 'var(--text-sm)', color: isCombat ? 'var(--state-failure)' : 'var(--state-success)', lineHeight: 1 }}>
          {isCombat ? '⚔' : '◈'}
        </span>
        <span style={{
          fontFamily:    FONT,
          fontSize:      'var(--text-overline)',
          fontWeight:    700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color:         isCombat ? 'var(--state-failure)' : 'var(--state-success)',
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
        <>
          <TopBarButton label="◉ Initiative Order" color={HUD.gold} disabled={false} onClick={onInitiativeOrder} active={initiativeOpen} />
          <TopBarButton label="⬛ End Combat" color="var(--state-failure)" disabled={sessionBusy} onClick={onEndCombat} />
        </>
      ) : (
        <TopBarButton label="▶ Begin Combat" color="var(--state-failure)" disabled={sessionBusy} onClick={onBeginCombat} />
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
        className="gm-lobby-btn"
        style={{
          background:    'transparent',
          border:        '1px solid var(--hud-border)',
          borderRadius:  RADIUS.sm,
          padding:       '0.25rem 0.75rem',
          fontFamily:    FONT,
          fontSize:      'var(--text-caption)',
          color:         'var(--hud-text-dim)',
          cursor:        'pointer',
          letterSpacing: '0.06em',
          flexShrink:    0,
        }}
      >
        ← Lobby
      </button>
    </div>
  )
})

function Divider() {
  return <div style={{ width: 1, height: '1.25rem', background: 'var(--hud-border-hi)', flexShrink: 0 }} />
}

function TopBarButton({
  label, color, disabled, onClick, active = false,
}: { label: string; color: string; disabled: boolean; onClick: () => void | Promise<void>; active?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={() => void onClick()}
      className="gm-top-bar-btn"
      style={{
        '--btn-accent':  color,
        fontFamily:      FONT,
        fontSize:        'var(--text-overline)',
        fontWeight:      700,
        letterSpacing:   '0.12em',
        textTransform:   'uppercase',
        color:           disabled ? 'var(--hud-text-faint)' : color,
        background:      active ? `${color}18` : 'var(--hud-surface-lo)',
        border:          `1px solid ${disabled ? 'var(--hud-border)' : active ? color : 'var(--hud-border-hi)'}`,
        borderRadius:    RADIUS.md,
        padding:         '0.3125rem 0.875rem',
        cursor:          disabled ? 'not-allowed' : 'pointer',
        flexShrink:      0,
      } as React.CSSProperties}
    >
      {label}
    </button>
  )
}
