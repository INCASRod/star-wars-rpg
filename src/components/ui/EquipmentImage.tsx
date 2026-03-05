'use client'

import { useState, useEffect } from 'react'
import { resolveFallbackIcon } from '@/lib/equipment-icons'

// Lazy-load manifest once
let manifestCache: Record<string, Record<string, string | null>> | null = null
let manifestPromise: Promise<Record<string, Record<string, string | null>>> | null = null

function loadManifest() {
  if (manifestCache) return Promise.resolve(manifestCache)
  if (manifestPromise) return manifestPromise
  manifestPromise = fetch('/images/manifest.json')
    .then(r => r.json())
    .then(data => { manifestCache = data; return data })
    .catch(() => {
      manifestCache = { weapons: {}, armor: {}, gear: {}, species: {} }
      return manifestCache
    })
  return manifestPromise
}

const TYPE_TO_SECTION: Record<string, string> = {
  weapon: 'weapons',
  armor: 'armor',
  gear: 'gear',
  species: 'species',
}

const SIZE_PX: Record<string, number> = {
  sm: 24,
  md: 48,
  lg: 72,
}

interface EquipmentImageProps {
  itemKey: string
  itemType: 'weapon' | 'armor' | 'gear' | 'species'
  categories?: string[]
  gearType?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: React.CSSProperties
}

export function EquipmentImage({
  itemKey,
  itemType,
  categories,
  gearType,
  size = 'md',
  className,
  style,
}: EquipmentImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const px = SIZE_PX[size]

  useEffect(() => {
    let cancelled = false
    loadManifest().then(manifest => {
      if (cancelled) return
      const section = TYPE_TO_SECTION[itemType]
      const path = manifest[section]?.[itemKey]
      if (path) {
        setImageSrc(path)
      } else {
        setUseFallback(true)
      }
      setLoaded(true)
    })
    return () => { cancelled = true }
  }, [itemKey, itemType])

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

  // Not loaded yet — empty placeholder
  if (!loaded) {
    return <div style={containerStyle} className={className} />
  }

  // Has OggDude PNG image
  if (imageSrc && !useFallback) {
    return (
      <div style={containerStyle} className={className}>
        <img
          src={imageSrc}
          alt=""
          onError={() => setUseFallback(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    )
  }

  // Fallback SVG — render as <img> with currentColor via CSS filter
  if (itemType === 'species') {
    // No fallback for species — show empty
    return <div style={containerStyle} className={className} />
  }

  const fallbackName = resolveFallbackIcon(itemType, categories, gearType)
  return (
    <div style={containerStyle} className={className}>
      <img
        src={`/images/fallback/${fallbackName}.svg`}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: 0.6,
        }}
      />
    </div>
  )
}
