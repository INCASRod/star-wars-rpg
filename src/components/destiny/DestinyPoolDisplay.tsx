'use client'

import { useState } from 'react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const FONT_C    = 'var(--font-body)'
const FONT_M    = 'var(--font-body)'
const DIM       = 'var(--hud-text-faint)'
const LIGHT_CLR = '#1A78A0'   // deep cerulean
const DARK_CLR  = '#8B2BE2'   // Dark side purple
const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'

const MAX_VISIBLE = 10
const LIGHT_IMG   = '/images/factions/LightSymbol.png'
const DARK_IMG    = '/images/factions/DarkSymbol.png'

// ── Destiny symbol icon (transparent PNG masked to a colour) ──────────────────
function DestinyIcon({ side, size, color }: { side: 'light' | 'dark'; size: number; color: string }) {
  const src = side === 'light' ? LIGHT_IMG : DARK_IMG
  return (
    <span style={{
      display: 'inline-block', flexShrink: 0,
      width: size, height: size,
      WebkitMask: `url('${src}') center/contain no-repeat`,
      mask:        `url('${src}') center/contain no-repeat`,
      background:  color,
    }} />
  )
}

// ── Token button ──────────────────────────────────────────────────────────────
function TokenButton({ side, color, canClick, tooltip, onClick }: {
  side: 'light' | 'dark'
  color: string
  canClick: boolean
  tooltip: string
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      title={tooltip}
      onClick={canClick ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 24, height: 24, borderRadius: '50%',
        border: `1.5px solid ${canClick ? `${color}70` : `${color}30`}`,
        background: canClick ? `${color}18` : 'transparent',
        cursor:  canClick ? 'pointer'  : 'not-allowed',
        opacity: canClick ? 1          : 0.4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 4, flexShrink: 0,
        transition: 'box-shadow .15s, opacity .15s',
        boxShadow: hovered && canClick ? `0 0 10px ${color}70` : 'none',
      }}
    >
      <DestinyIcon side={side} size={14} color={color} />
    </button>
  )
}

export interface DestinyPoolRecord {
  id:            string
  campaign_id:   string
  session_label: string | null
  light_count:   number
  dark_count:    number
  generated_at:  string
  is_active:     boolean
}

interface DestinyPoolDisplayProps {
  poolRecord:    DestinyPoolRecord | null
  isGm:          boolean
  /** Called when a player clicks a light token (player side only) */
  onClickLight?: () => void
  /** Called when GM clicks a dark token (GM side only) */
  onClickDark?:  () => void
  /** Compact mode — no session label, no empty state text */
  compact?:      boolean
}

export function DestinyPoolDisplay({
  poolRecord,
  isGm,
  onClickLight,
  onClickDark,
  compact = false,
}: DestinyPoolDisplayProps) {
  if (!poolRecord) {
    if (compact) return null
    return (
      <div style={{ fontFamily: FONT_C, fontSize: FS_CAP, color: DIM, letterSpacing: '0.06em' }}>
        ◈ No Destiny Pool · Ask your GM to generate one
      </div>
    )
  }

  const { light_count, dark_count, session_label } = poolRecord
  const total = light_count + dark_count

  const renderTokens = (count: number, side: 'light' | 'dark') => {
    const color     = side === 'light' ? LIGHT_CLR : DARK_CLR
    const canClick  = side === 'light' ? !isGm && !!onClickLight && count > 0
                                       :  isGm  && !!onClickDark  && count > 0
    const tooltip   = side === 'light'
      ? (isGm ? 'Players spend Light Side Destiny Points' : count > 0 ? 'Click to spend a Light Side Destiny Point' : 'No Light Side points')
      : (!isGm ? 'Only the GM can spend Dark Side Destiny Points' : count > 0 ? 'Click to spend a Dark Side Destiny Point' : 'No Dark Side points')

    const visible = Math.min(count, MAX_VISIBLE)
    const overflow = count - MAX_VISIBLE

    return (
      <>
        {Array.from({ length: visible }).map((_, i) => (
          <TokenButton
            key={`${side}-${i}`}
            side={side}
            color={color}
            canClick={canClick}
            tooltip={tooltip}
            onClick={side === 'light' ? onClickLight : onClickDark}
          />
        ))}
        {overflow > 0 && (
          <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color, opacity: 0.7 }}>
            +{overflow}
          </span>
        )}
      </>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {/* Light tokens */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontFamily: FONT_C, fontSize: FS_OVER, color: LIGHT_CLR, letterSpacing: '0.1em', fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
            <DestinyIcon side="light" size={11} color={LIGHT_CLR} />
            {light_count}
          </span>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {renderTokens(light_count, 'light')}
          </div>
        </div>

        <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM }}>·</span>

        {/* Dark tokens */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontFamily: FONT_C, fontSize: FS_OVER, color: DARK_CLR, letterSpacing: '0.1em', fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
            <DestinyIcon side="dark" size={11} color={DARK_CLR} />
            {dark_count}
          </span>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {renderTokens(dark_count, 'dark')}
          </div>
        </div>
      </div>

      {/* Session label */}
      {!compact && session_label && (
        <div style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: 'var(--hud-text-faint)', letterSpacing: '0.06em' }}>
          {session_label} · {total} Destiny {total === 1 ? 'Point' : 'Points'}
        </div>
      )}
    </div>
  )
}
