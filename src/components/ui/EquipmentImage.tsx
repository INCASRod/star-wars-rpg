'use client'

import { useState, useEffect, useMemo } from 'react'
import manifest from '../../../public/images/manifest.json'
import { createIconResolverContext, resolveItemIcon, type ItemTable } from '@/lib/itemIconResolver'

const SIZE_REM: Record<string, string> = {
  sm: '1.5rem',
  md: '3rem',
  lg: '4.5rem',
}

interface EquipmentImageProps {
  itemKey: string
  itemType: 'weapon' | 'armor' | 'gear' | 'species'
  categories?: string[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: React.CSSProperties
}

const EMPTY_OVERRIDES = new Map<string, string>()

/**
 * Thin wrapper over itemIconResolver for the legacy surfaces that predate
 * the Player HUD Inventory tab's ItemThumb/ItemDetailHero (GmLootModal,
 * VendorPurchaseDialog, WeaponsCard/EquipmentCard/InventoryContent character
 * sheet views, HudModalsOverlay's loot flash). These call sites only ever
 * have ONE item's own categories in hand, not the full ref-table catalog or
 * a campaign's overrides, so only rungs 1 (skipped — no overrides available
 * here) and 2 (exact) can ever resolve; category-donor rungs 3/4 require
 * sibling-item data this component doesn't have and fall through to rung 5
 * (fallback glyph) same as before, just via the shared resolver instead of
 * the old manifest+generic-SVG duplicate path.
 */
export function EquipmentImage({
  itemKey,
  itemType,
  categories,
  size = 'md',
  className,
  style,
}: EquipmentImageProps) {
  const [imgErr, setImgErr] = useState(false)
  useEffect(() => { setImgErr(false) }, [itemKey, itemType])

  const px = SIZE_REM[size]
  const containerStyle: React.CSSProperties = {
    width: px,
    height: px,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    ...style,
  }

  if (itemType === 'species') {
    const path = (manifest.species as Record<string, string | null>)[itemKey]
    if (!path || imgErr) return <div style={containerStyle} className={className} />
    return (
      <div style={containerStyle} className={className}>
        <img src={path} alt="" onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    )
  }

  const table = itemType as ItemTable
  // eslint-disable-next-line react-hooks/rules-of-hooks -- itemType is a stable prop across a given call site, not a conditional hook call in practice
  const resolution = useMemo(() => {
    const ctx = createIconResolverContext(EMPTY_OVERRIDES, {
      weapon: table === 'weapon' ? { [itemKey]: categories } : {},
      armor:  table === 'armor'  ? { [itemKey]: categories } : {},
      gear:   table === 'gear'   ? { [itemKey]: categories } : {},
    })
    return resolveItemIcon(ctx, table, itemKey, categories)
  }, [table, itemKey, categories])

  const fallbackPath = `/images/equipment/_fallback-${table}.png`
  const isFallback = resolution.rung === 'fallback' || imgErr
  return (
    <div style={containerStyle} className={className}>
      <img
        src={imgErr ? fallbackPath : resolution.path}
        alt=""
        onError={() => setImgErr(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: isFallback ? 0.6 : 1,
        }}
      />
    </div>
  )
}
