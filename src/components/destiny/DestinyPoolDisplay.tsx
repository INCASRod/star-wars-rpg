'use client'

// ── Design tokens ─────────────────────────────────────────────────────────────
const FONT_C    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono','Courier New',monospace"
const GOLD      = '#C8AA50'
const DIM       = '#6A8070'
const LIGHT_CLR = '#7EC8E3'   // Force blue
const DARK_CLR  = '#8B2BE2'   // Dark side purple
const FS_OVER   = 'var(--text-overline)'
const FS_CAP    = 'var(--text-caption)'

const MAX_VISIBLE = 10

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
          <button
            key={`${side}-${i}`}
            title={tooltip}
            onClick={canClick ? (side === 'light' ? onClickLight : onClickDark) : undefined}
            style={{
              width: 20, height: 20, borderRadius: '50%',
              border: `2px solid ${canClick ? color : `${color}60`}`,
              background: canClick ? `${color}22` : `${color}0C`,
              cursor:  canClick  ? 'pointer'  : 'not-allowed',
              opacity: canClick  ? 1          : 0.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, flexShrink: 0,
              transition: 'box-shadow .15s, opacity .15s',
            }}
            onMouseEnter={e => { if (canClick) (e.currentTarget as HTMLElement).style.boxShadow = `0 0 8px ${color}80` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'block', opacity: canClick ? 0.9 : 0.5 }} />
          </button>
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
          <span style={{ fontFamily: FONT_C, fontSize: FS_OVER, color: LIGHT_CLR, letterSpacing: '0.1em', fontWeight: 700, whiteSpace: 'nowrap' }}>
            ○ {light_count}
          </span>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {renderTokens(light_count, 'light')}
          </div>
        </div>

        <span style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: DIM }}>·</span>

        {/* Dark tokens */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontFamily: FONT_C, fontSize: FS_OVER, color: DARK_CLR, letterSpacing: '0.1em', fontWeight: 700, whiteSpace: 'nowrap' }}>
            ● {dark_count}
          </span>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {renderTokens(dark_count, 'dark')}
          </div>
        </div>
      </div>

      {/* Session label */}
      {!compact && session_label && (
        <div style={{ fontFamily: FONT_M, fontSize: FS_OVER, color: 'rgba(232,223,200,0.3)', letterSpacing: '0.06em' }}>
          {session_label} · {total} Destiny {total === 1 ? 'Point' : 'Points'}
        </div>
      )}
    </div>
  )
}
