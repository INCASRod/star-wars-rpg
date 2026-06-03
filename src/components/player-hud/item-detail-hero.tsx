'use client'
import { useState, useEffect } from 'react'
import { FONT_BODY, FONT_DISPLAY, RADIUS, FS, SP } from '@/lib/tokens'
import { TickerText } from '@/components/ui/TickerText'

interface ItemDetailHeroProps {
  name:           string
  typeTag:        string      // e.g. "Ranged · Light"
  icon:           string      // unicode fallback
  iconUrl:        string | null  // Oggdude image for icon box
  hardPoints:     number
  hardPointsUsed: number
  item_image_url: string | null  // GM-uploaded full-art banner
}

export function ItemDetailHero({ name, typeTag, icon, iconUrl, hardPoints, hardPointsUsed, item_image_url }: ItemDetailHeroProps) {
  const [iconErr, setIconErr] = useState(false)
  useEffect(() => { setIconErr(false) }, [iconUrl])
  if (item_image_url) {
    return (
      <div style={{ position: 'relative', height: '5rem', flexShrink: 0, overflow: 'hidden' }}>
        <img src={item_image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, color-mix(in srgb, black 75%, transparent) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'absolute', bottom: SP[2], left: SP[3] }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, color: 'var(--hud-gold)', opacity: 0.6, letterSpacing: '0.1em' }}>
            <TickerText key={`tag-${name}`} text={typeTag} isOpen={true} />
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, color: 'var(--hud-text)', fontWeight: 600 }}>
            <TickerText key={`name-${name}`} text={name} isOpen={true} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height: '5rem', flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: SP[3], padding: `0 ${SP[3]}`,
      background: 'linear-gradient(110deg, var(--hud-surface-hi) 0%, color-mix(in srgb, var(--hud-surface-hi) 80%, color-mix(in srgb, var(--hud-accent) 10%, transparent)) 100%)',
      borderBottom: '1px solid var(--hud-border)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* top-right corner bracket accent */}
      <div style={{
        /* decorative bracket — px intentional */ position: 'absolute', top: SP[1], right: SP[2], width: 14, height: 14,
        borderTop: '1.5px solid var(--hud-gold)', borderRight: '1.5px solid var(--hud-gold)',
        opacity: 0.35, pointerEvents: 'none',
      }} />
      {/* icon box */}
      <div style={{
        width: '3.625rem', height: '3.625rem', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--hud-gold)', borderRadius: RADIUS.md,
        background: 'radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--hud-accent) 20%, transparent) 0%, transparent 70%)',
        overflow: 'hidden',
      }}>
        {iconUrl && !iconErr
          ? <img src={iconUrl} alt="" style={{ width: '2.75rem', height: '2.75rem', objectFit: 'contain', opacity: 0.9 }} onError={() => setIconErr(true)} />
          : <span style={{ /* emoji fallback — raw px required, FS tokens are CSS var strings not valid here */ fontSize: 28, color: 'var(--hud-gold)', fontFamily: FONT_BODY }}>{icon}</span>
        }
      </div>
      {/* text stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, letterSpacing: '0.1em', color: 'var(--hud-gold)', opacity: 0.6 }}>
          <TickerText key={`tag-${name}`} text={typeTag} isOpen={true} />
        </div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.h4, color: 'var(--hud-text)', fontWeight: 600,
          lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          <TickerText key={`name-${name}`} text={name} isOpen={true} />
        </div>
        {hardPoints > 0 && (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)' }}>
            Hard Points {hardPointsUsed} / {hardPoints} used
          </div>
        )}
      </div>
    </div>
  )
}
