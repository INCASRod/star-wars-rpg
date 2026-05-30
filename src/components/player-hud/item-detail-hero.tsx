'use client'
import { useState, useEffect } from 'react'
import { FONT_BODY, FONT_DISPLAY, RADIUS, FS } from '@/lib/tokens'

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
      <div style={{ position: 'relative', height: 80, flexShrink: 0, overflow: 'hidden' }}>
        <img src={item_image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, color-mix(in srgb, black 75%, transparent) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'absolute', bottom: 8, left: 12 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, color: 'var(--hud-gold)', opacity: 0.6, letterSpacing: '0.1em' }}>
            {typeTag}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, color: 'var(--hud-text)', fontWeight: 600 }}>
            {name}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height: 80, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px',
      background: 'linear-gradient(110deg, var(--hud-surface-hi) 0%, color-mix(in srgb, var(--hud-surface-hi) 80%, var(--hud-accent-10)) 100%)',
      borderBottom: '1px solid var(--hud-border)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* top-right corner bracket accent */}
      <div style={{
        position: 'absolute', top: 6, right: 8, width: 14, height: 14,
        borderTop: '1.5px solid var(--hud-gold)', borderRight: '1.5px solid var(--hud-gold)',
        opacity: 0.35, pointerEvents: 'none',
      }} />
      {/* icon box */}
      <div style={{
        width: 58, height: 58, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--hud-gold)', borderRadius: RADIUS.md,
        background: 'radial-gradient(ellipse at 50% 60%, var(--hud-accent-20) 0%, transparent 70%)',
        overflow: 'hidden',
      }}>
        {iconUrl && !iconErr
          ? <img src={iconUrl} alt="" style={{ width: 44, height: 44, objectFit: 'contain', opacity: 0.9 }} onError={() => setIconErr(true)} />
          : <span style={{ fontSize: 28, color: 'var(--hud-gold)', fontFamily: FONT_BODY }}>{icon}</span>
        }
      </div>
      {/* text stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, letterSpacing: '0.1em', color: 'var(--hud-gold)', opacity: 0.6 }}>
          {typeTag}
        </div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.h4, color: 'var(--hud-text)', fontWeight: 600,
          lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
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
