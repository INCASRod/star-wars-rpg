'use client'

import { Tooltip, TipLabel, TipBody } from '@/components/ui/Tooltip'
import { DiceText } from '@/components/dice/DiceText'
import type { RefWeaponQuality } from '@/lib/types'

interface QualityBadgeProps {
  quality:       { key: string; count?: number | null }
  refQualityMap: Record<string, RefWeaponQuality>
  /** 'desktop' = gold chip (InventoryPanel style); 'mobile' = teal chip (GearTab style) */
  variant?:      'desktop' | 'mobile'
}

export function QualityBadge({ quality, refQualityMap, variant = 'desktop' }: QualityBadgeProps) {
  const ref         = refQualityMap[quality.key]
  const baseName    = ref?.name ?? quality.key
  const displayName = quality.count != null ? `${baseName} ${quality.count}` : baseName
  const description = ref?.description ?? ''

  const chipStyle = variant === 'desktop'
    ? {
        background:  'rgba(200,170,80,0.12)',
        border:      '1px solid rgba(200,170,80,0.2)',
        borderRadius: 10,
        padding:     '1px 7px',
        cursor:      description ? 'help' : 'default',
        fontFamily:  "var(--font-rajdhani), 'Rajdhani', sans-serif",
        fontSize:    'clamp(0.55rem, 0.9vw, 0.65rem)',
        color:       '#C8AA50',
        whiteSpace:  'nowrap' as const,
      }
    : {
        fontFamily:  "'Courier New', monospace",
        fontSize:    'clamp(0.55rem, 2vw, 0.65rem)',
        color:       '#70C8E8',
        background:  'rgba(112,200,232,0.08)',
        border:      '1px solid rgba(112,200,232,0.2)',
        borderRadius: 4,
        padding:     '1px 6px',
        cursor:      description ? 'help' : 'default',
        whiteSpace:  'nowrap' as const,
      }

  const chip = <span style={chipStyle}>{displayName}</span>

  if (!description) return chip

  return (
    <Tooltip
      placement="top"
      maxWidth={280}
      content={
        <>
          <TipLabel>{displayName}</TipLabel>
          <TipBody><DiceText text={description} /></TipBody>
        </>
      }
    >
      {chip}
    </Tooltip>
  )
}
