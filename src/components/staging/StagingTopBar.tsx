'use client'

import { memo } from 'react'
import { HUD, FONT_BODY, FS, SP, RADIUS, EASE } from '@/lib/tokens'

/* ── Design tokens ────────────────────────────────────────── */
const DIM  = '#6A8070'
const RED  = '#E05050'
const GREEN = '#4EC87A'

export interface StagingTopBarProps {
  sessionMode:    'exploration' | 'combat'
  sessionBusy:    boolean
  combatRound:    number
  onBeginCombat:  () => void | Promise<void>
  onEndCombat:    () => void | Promise<void>
}

/**
 * StagingTopBar — a thin glassmorphic bar pinned to the top of the staging
 * canvas, always visible over the map.
 *
 * - Exploration mode: green ◈ badge + ▶ Begin Combat button (red)
 * - Combat mode:      red ⚔ badge + Round N label + ⬛ End Combat button
 *
 * Left-padded to 68px so it clears the 60px StagingLeftRail without overlap.
 *
 * z-index: 9002 (above rail at 9001 so it reads on top of the rail's top edge).
 */
export const StagingTopBar = memo(function StagingTopBar({
  sessionMode,
  sessionBusy,
  combatRound,
  onBeginCombat,
  onEndCombat,
}: StagingTopBarProps) {
  const isCombat = sessionMode === 'combat'

  return (
    <div
      style={{
        position:             'fixed',
        top:                  0,
        left:                 0,
        right:                0,
        height:               '2.75rem',
        zIndex:               9002,
        display:              'flex',
        alignItems:           'center',
        paddingLeft:          SP[4],
        paddingRight:         SP[4],
        gap:                  SP[3],
        background:           'var(--hud-surface-hi)',
        backdropFilter:       'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom:         '1px solid var(--hud-border)',
        boxShadow:            '0 2px 20px rgba(0,0,0,0.5)',
        pointerEvents:        'auto',
      }}
    >
      {/* ── Mode badge ─────────────────────────────────────── */}
      <div
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '0.375rem',
          paddingRight:  '0.75rem',
          borderRight:   '1px solid var(--hud-border)',
        }}
      >
        <span
          style={{
            fontSize:   FS.sm,
            color:      isCombat ? RED : GREEN,
            lineHeight: 1,
          }}
        >
          {isCombat ? '⚔' : '◈'}
        </span>
        <span
          style={{
            fontFamily:    FONT_BODY,
            fontSize:      '0.6rem',
            fontWeight:    700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color:         isCombat ? RED : GREEN,
          }}
        >
          {isCombat ? 'Combat' : 'Exploration'}
        </span>
      </div>

      {/* ── Round indicator (combat only) ──────────────────── */}
      {isCombat && (
        <div
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '0.3125rem',
          }}
        >
          <span
            style={{
              fontFamily:    FONT_BODY,
              fontSize:      'var(--text-sm, 0.8rem)',
              color:         DIM,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Round
          </span>
          <span
            style={{
              fontFamily:    FONT_BODY,
              fontSize:      'var(--text-sm, 0.82rem)',
              fontWeight:    700,
              letterSpacing: '0.08em',
              color:         HUD.gold,
            }}
          >
            {combatRound}
          </span>
        </div>
      )}

      {/* ── Spacer ─────────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Combat toggle button ───────────────────────────── */}
      {isCombat ? (
        <TopBarButton
          label="⬛ End Combat"
          color={RED}
          disabled={sessionBusy}
          onClick={onEndCombat}
        />
      ) : (
        <TopBarButton
          label="▶ Begin Combat"
          color={RED}
          disabled={sessionBusy}
          onClick={onBeginCombat}
        />
      )}
    </div>
  )
})

/* ── Internal button ──────────────────────────────────────── */
interface TopBarButtonProps {
  label:    string
  color:    string
  disabled: boolean
  onClick:  () => void | Promise<void>
}

function TopBarButton({ label, color, disabled, onClick }: TopBarButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={() => void onClick()}
      className="staging-topbar-btn"
      style={{
        fontFamily:    FONT_BODY,
        fontSize:      '0.58rem',
        fontWeight:    700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color:         disabled ? 'rgba(106,128,112,0.35)' : color,
        background:    'var(--hud-surface-lo)',
        border:        `1px solid ${disabled ? 'rgba(106,128,112,0.14)' : 'var(--hud-border)'}`,
        borderRadius:  RADIUS.md,
        padding:       '0.3125rem 0.875rem',
        cursor:        disabled ? 'not-allowed' : 'pointer',
        transition:    `color ${EASE.default}, background ${EASE.default}, border-color ${EASE.default}`,
        lineHeight:    1,
      }}
    >
      {label}
    </button>
  )
}
