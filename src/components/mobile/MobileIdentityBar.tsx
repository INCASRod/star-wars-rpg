'use client'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, HUD } from '@/lib/tokens'

// Destiny pip colours match DestinyPoolDisplay.tsx — change only in sync with that file.
const DESTINY_LIGHT = '#0EA5E9'
const DESTINY_DARK  = '#A845F5'
// Image paths verified against src/components/destiny/DestinyPoolDisplay.tsx
const LIGHT_IMG     = '/images/factions/LightSymbol.png'
const DARK_IMG      = '/images/factions/DarkSymbol.png'

function DestinyPip({ side }: { side: 'light' | 'dark' }) {
  const color = side === 'light' ? DESTINY_LIGHT : DESTINY_DARK
  const src   = side === 'light' ? LIGHT_IMG : DARK_IMG
  return (
    <span style={{
      display: 'inline-block', flexShrink: 0,
      width: 14, height: 14, /* fixed pip geometry */
      WebkitMask: `url('${src}') center/contain no-repeat`,
      mask:        `url('${src}') center/contain no-repeat`,
      background: color,
    }} />
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
  destinyPool: Array<'light' | 'dark'>
}

export function MobileIdentityBar({
  name, careerKey, specKey, speciesKey, xpAvailable, credits, destinyPool,
}: MobileIdentityBarProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--hud-surface-hi)',
      borderBottom: `1px solid var(--hud-border)`,
      padding: `${SP[1]} ${SP[2]}`,
      flexShrink: 0,
      gap: '4px', /* compact column gap — below SP[1] fluid range */
    }}>
      {/* ── Main row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
        {/* Avatar circle — 40px fixed geometry */}
        <div style={{
          width: 40, height: 40,
          borderRadius: RADIUS.full,
          border: `2px solid var(--hud-accent)`,
          background: `color-mix(in srgb, var(--hud-accent) 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
          color: 'var(--hud-accent)', letterSpacing: '0.06em',
        }}>
          {initials(name)}
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
              fontFamily: FONT_DISPLAY, /* small-caps identity heading — career as display role, not plain label */
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

      {/* ── Destiny tokens row (only when pool is non-empty) ── */}
      {destinyPool.length > 0 && (
        <div style={{ display: 'flex', gap: '4px' /* pip gap */, alignItems: 'center', paddingLeft: 'calc(40px + var(--space-2))' /* avatar fixed geometry + SP[2] gap */ }}>
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: HUD.textFaint, letterSpacing: '0.1em',
          }}>
            DESTINY
          </span>
          {destinyPool.map((side, i) => (
            <DestinyPip key={i} side={side} />
          ))}
        </div>
      )}
    </div>
  )
}
