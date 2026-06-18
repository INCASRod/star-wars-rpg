'use client'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, HUD } from '@/lib/tokens'
import type { DestinyPoolRecord } from '@/components/destiny/DestinyPoolDisplay'

// Sealed colour exceptions — change only in sync with DestinyPoolDisplay.tsx
const LIGHT_CLR = '#0EA5E9'   /* Alliance light side — sealed */
const DARK_CLR  = '#C62828'   /* FFG challenge die / dark side — sealed */
const LIGHT_IMG = '/images/factions/LightSymbol.png'
const DARK_IMG  = '/images/factions/DarkSymbol.png'
const MAX_PER_SIDE = 5  /* mobile pip cap — screen-width constraint */

function DestinyToken({ side, tappable, onClick }: {
  side: 'light' | 'dark'
  tappable: boolean
  onClick?: () => void
}) {
  const color = side === 'light' ? LIGHT_CLR : DARK_CLR   /* sealed — see above */
  const src   = side === 'light' ? LIGHT_IMG : DARK_IMG
  const icon  = (
    <span style={{
      display: 'inline-block',
      width: 14, height: 14,           /* fixed icon geometry */
      WebkitMask: `url('${src}') center/contain no-repeat`,
      mask:        `url('${src}') center/contain no-repeat`,
      background: color,
    }} />
  )
  const sharedStyle = {
    display: 'inline-flex' as const, alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: 26, height: 26,             /* fixed pip geometry */
    borderRadius: RADIUS.full,
    border: `1px solid color-mix(in srgb, ${color} ${tappable ? '60%' : '35%'}, transparent)`,
    background: `color-mix(in srgb, ${color} ${tappable ? '18%' : '10%'}, transparent)`,
    flexShrink: 0 as const,
    padding: 0 as const,
    opacity: tappable ? 1 : 0.7,
  }
  if (tappable) {
    return (
      <button
        type="button"
        aria-label="Spend light side destiny"
        onClick={onClick}
        style={{ ...sharedStyle, cursor: 'pointer' }}
      >
        {icon}
      </button>
    )
  }
  return (
    <span aria-label="dark side destiny token" style={sharedStyle}>
      {icon}
    </span>
  )
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2)
}

interface MobileIdentityBarProps {
  name: string
  careerKey?: string | null
  specKey?: string | null
  speciesKey?: string | null
  xpAvailable: number
  credits: number
  destinyPool: Array<'light' | 'dark'>        // legacy fallback
  destinyPoolRecord: DestinyPoolRecord | null  // primary source
  onSpendDestiny: () => void
  portraitUrl?: string | null
}

export function MobileIdentityBar({
  name, careerKey, specKey, speciesKey, xpAvailable, credits,
  destinyPool, destinyPoolRecord, onSpendDestiny, portraitUrl,
}: MobileIdentityBarProps) {
  // Primary: DB record. Fallback: count entries in legacy flat array.
  const lightCount = destinyPoolRecord
    ? destinyPoolRecord.light_count
    : destinyPool.filter(t => t === 'light').length
  const darkCount  = destinyPoolRecord
    ? destinyPoolRecord.dark_count
    : destinyPool.filter(t => t === 'dark').length
  const hasPool = destinyPoolRecord !== null || destinyPool.length > 0

  const lightVisible  = Math.min(lightCount, MAX_PER_SIDE)
  const lightOverflow = lightCount - lightVisible
  const darkVisible   = Math.min(darkCount, MAX_PER_SIDE)
  const darkOverflow  = darkCount - darkVisible

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--hud-surface-hi)',
      borderBottom: `1px solid var(--hud-border)`,
      padding: `${SP[1]} ${SP[2]}`,
      flexShrink: 0,
      gap: '4px',   /* compact column gap — below SP[1] fluid range */
    }}>
      {/* ── Main row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
        {/* Avatar circle — 40px fixed geometry */}
        <div style={{
          width: 40, height: 40,            /* fixed avatar geometry */
          borderRadius: RADIUS.full,
          border: `2px solid var(--hud-accent)`,
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          background: `color-mix(in srgb, var(--hud-accent) 15%, transparent)`,
        }}>
          {portraitUrl ? (
            <img
              src={portraitUrl}
              alt={name}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}   /* objectFit via inline on native img — unavoidable for fill behaviour */
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
              color: 'var(--hud-accent)', letterSpacing: '0.06em',
            }}>
              {initials(name)}
            </div>
          )}
        </div>

        {/* Character meta */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' /* tight line-stack */ }}>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
            color: HUD.text, letterSpacing: '0.04em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {name}
          </div>
          {careerKey && (
            <div style={{
              fontFamily: FONT_DISPLAY,
              fontSize: FS.overline,
              color: 'var(--hud-accent)', fontVariant: 'small-caps',
              letterSpacing: '0.08em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {careerKey}
            </div>
          )}
          {(specKey || speciesKey) && (
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
              letterSpacing: '0.04em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {[specKey, speciesKey].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>

        {/* XP + Credits pills */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '3px' /* compact pill stack */, alignItems: 'flex-end' }}>
          <div style={{
            background: `color-mix(in srgb, var(--hud-accent) 15%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--hud-accent) 40%, transparent)`,
            borderRadius: RADIUS.sm, padding: `1px ${SP[1]}`,
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            color: 'var(--hud-accent)', letterSpacing: '0.08em',
          }}>
            {xpAvailable} XP
          </div>
          <div style={{
            background: `color-mix(in srgb, var(--hud-gold) 12%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--hud-gold) 30%, transparent)`,
            borderRadius: RADIUS.sm, padding: `1px ${SP[1]}`,
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            color: HUD.gold, letterSpacing: '0.08em',
          }}>
            ₵{credits.toLocaleString()}
          </div>
        </div>
      </div>

      {/* ── Destiny tokens row (only when a pool exists) ── */}
      {hasPool && (
        <div style={{
          display: 'flex', gap: SP[1], alignItems: 'center', flexWrap: 'wrap',
          paddingLeft: 'calc(40px + var(--space-2))',  /* avatar fixed geometry + SP[2] */
        }}>
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: HUD.textFaint, letterSpacing: '0.1em',
          }}>
            DESTINY
          </span>

          {lightCount === 0 && darkCount === 0 ? (
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, color: HUD.textFaint }}>
              No destiny tokens
            </span>
          ) : (
            <>
              {/* Light tokens — tappable */}
              {Array.from({ length: lightVisible }).map((_, i) => (
                <DestinyToken key={`light-${i}`} side="light" tappable onClick={onSpendDestiny} />
              ))}
              {lightOverflow > 0 && (
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: LIGHT_CLR /* Alliance light side — sealed */ }}>
                  +{lightOverflow}
                </span>
              )}

              {/* Separator */}
              {lightCount > 0 && darkCount > 0 && (
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>·</span>
              )}

              {/* Dark tokens — non-tappable */}
              {Array.from({ length: darkVisible }).map((_, i) => (
                <DestinyToken key={`dark-${i}`} side="dark" tappable={false} />
              ))}
              {darkOverflow > 0 && (
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DARK_CLR /* FFG dark side — sealed */ }}>
                  +{darkOverflow}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
