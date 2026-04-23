'use client'

import { memo } from 'react'

/* ── Design tokens ────────────────────────────────────────── */
const FC   = "var(--font-cinzel), 'Cinzel', serif"
const FR   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const GOLD = '#C8AA50'
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
        height:               44,
        zIndex:               9002,
        display:              'flex',
        alignItems:           'center',
        paddingLeft:          16,
        paddingRight:         16,
        gap:                  12,
        background:           'rgba(6,10,8,0.84)',
        backdropFilter:       'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom:         '1px solid rgba(200,170,80,0.14)',
        boxShadow:            '0 2px 20px rgba(0,0,0,0.5)',
        pointerEvents:        'auto',
      }}
    >
      {/* ── Mode badge ─────────────────────────────────────── */}
      <div
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           6,
          paddingRight:  12,
          borderRight:   '1px solid rgba(200,170,80,0.16)',
        }}
      >
        <span
          style={{
            fontSize:   13,
            color:      isCombat ? RED : GREEN,
            lineHeight: 1,
          }}
        >
          {isCombat ? '⚔' : '◈'}
        </span>
        <span
          style={{
            fontFamily:    FC,
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
            gap:        5,
          }}
        >
          <span
            style={{
              fontFamily:    FR,
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
              fontFamily:    FC,
              fontSize:      'var(--text-sm, 0.82rem)',
              fontWeight:    700,
              letterSpacing: '0.08em',
              color:         GOLD,
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
          hoverColor="#FF6464"
          disabled={sessionBusy}
          onClick={onEndCombat}
        />
      ) : (
        <TopBarButton
          label="▶ Begin Combat"
          color={RED}
          hoverColor="#FF6464"
          disabled={sessionBusy}
          onClick={onBeginCombat}
        />
      )}
    </div>
  )
})

/* ── Internal button ──────────────────────────────────────── */
interface TopBarButtonProps {
  label:      string
  color:      string
  hoverColor: string
  disabled:   boolean
  onClick:    () => void | Promise<void>
}

function TopBarButton({ label, color, hoverColor, disabled, onClick }: TopBarButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={() => void onClick()}
      style={{
        fontFamily:    FC,
        fontSize:      '0.58rem',
        fontWeight:    700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color:         disabled ? 'rgba(106,128,112,0.35)' : color,
        background:    'rgba(200,170,80,0.07)',
        border:        `1px solid ${disabled ? 'rgba(106,128,112,0.14)' : 'rgba(200,170,80,0.18)'}`,
        borderRadius:  4,
        padding:       '5px 14px',
        cursor:        disabled ? 'not-allowed' : 'pointer',
        transition:    'color 0.15s, background 0.15s, border-color 0.15s',
        lineHeight:    1,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          const el = e.currentTarget as HTMLElement
          el.style.color = hoverColor
          el.style.background = 'rgba(200,170,80,0.13)'
          el.style.borderColor = 'rgba(200,170,80,0.30)'
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          const el = e.currentTarget as HTMLElement
          el.style.color = color
          el.style.background = 'rgba(200,170,80,0.07)'
          el.style.borderColor = 'rgba(200,170,80,0.18)'
        }
      }}
    >
      {label}
    </button>
  )
}
