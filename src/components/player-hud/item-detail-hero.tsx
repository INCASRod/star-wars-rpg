'use client'
import { useState, useEffect } from 'react'
import { FONT_BODY, FONT_DISPLAY, FS, SP } from '@/lib/tokens'
import { TickerText } from '@/components/ui/TickerText'
import { ItemReadoutPlate } from '@/components/shared/ItemReadoutPlate'

interface ItemDetailHeroProps {
  name:           string
  typeTag:        string      // e.g. "Ranged · Light"
  iconUrl:        string | null  // resolver output — always a real path (exact, donor, or fallback glyph), never null in practice
  itemTable:      'weapon' | 'armor' | 'gear'
  refKey:         string | null
  categories?:    string[]
  // GM-uploaded full-art banner. Per-character-instance override that
  // OUTRANKS the resolver's iconUrl entirely when present and loads
  // successfully — see the precedence note below.
  item_image_url: string | null
}

/**
 * Prompt 3 rebuild (item-detail-panel-v3.html): the hero is now purely the
 * art zone — REF designation + category tags live INSIDE it via
 * ItemReadoutPlate's new 'hero' size variant, per the mockup's `.hero .ref`
 * / `.hero .cat` overlay. Name, type tag, and status pills moved OUT into
 * item-detail-panel.tsx's own identity block below the hero (the mockup's
 * separate `.ident` section) — this component no longer renders them.
 *
 * Precedence: item_image_url (a per-character-instance GM upload) always
 * wins over the resolver's iconUrl when it is set AND loads successfully.
 * If it 404s/fails, `bannerErr` demotes it and this component falls through
 * to the resolver's plate instead of a browser broken-image icon -- there
 * is no third option, item_image_url is either the whole banner or it's
 * treated as absent.
 */
export function ItemDetailHero({ name, typeTag, iconUrl, itemTable, refKey, categories, item_image_url }: ItemDetailHeroProps) {
  const [bannerErr, setBannerErr] = useState(false)
  useEffect(() => { setBannerErr(false) }, [item_image_url])

  if (item_image_url && !bannerErr) {
    return (
      <div style={{ position: 'relative', height: '14.375rem', flexShrink: 0, overflow: 'hidden' }}>
        <img src={item_image_url} alt={name} onError={() => setBannerErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, color-mix(in srgb, black 75%, transparent) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'absolute', bottom: SP[2], left: SP[3] }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, color: 'var(--hud-gold)', opacity: 0.6, letterSpacing: '0.1em' }}>
            <TickerText key={`tag-${name}`} text={typeTag} isOpen={true} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'relative', height: '14.375rem', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderBottom: '1px solid var(--hud-border)',
      background:
        'radial-gradient(ellipse at 50% 45%, color-mix(in srgb, var(--hud-gold) 10%, transparent), transparent 70%),' +
        'linear-gradient(160deg, var(--hud-surface-hi), var(--hud-surface-lo))',
    }}>
      <div style={{ position: 'absolute', inset: SP[2] }}>
        {iconUrl && (
          <ItemReadoutPlate iconUrl={iconUrl} table={itemTable} refKey={refKey} categories={categories} alt={name} size="hero" />
        )}
      </div>
    </div>
  )
}
