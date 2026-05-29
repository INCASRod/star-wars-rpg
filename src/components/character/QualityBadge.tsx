'use client'

import { Tooltip, TipLabel, TipBody } from '@/components/ui/Tooltip'
import { RichText } from '@/components/ui/RichText'
import { FONT_BODY, RADIUS } from '@/lib/tokens'
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
        background:   'var(--hud-surface-mid)',
        border:       '1px solid var(--hud-border)',
        borderRadius: RADIUS.xl,
        padding:      '1px 7px',
        cursor:       description ? 'help' : 'default',
        fontFamily:   FONT_BODY,
        fontSize:     'clamp(0.55rem, 0.9vw, 0.65rem)',
        color:        'var(--hud-gold)',
        whiteSpace:   'nowrap' as const,
      }
    : {
        fontFamily:   FONT_BODY,
        fontSize:     'clamp(0.55rem, 2vw, 0.65rem)',
        color:        'var(--hud-accent)',
        background:   'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
        border:       '1px solid color-mix(in srgb, var(--hud-accent) 20%, transparent)',
        borderRadius: RADIUS.md,
        padding:      '1px 6px',
        cursor:       description ? 'help' : 'default',
        whiteSpace:   'nowrap' as const,
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
          <TipBody><RichText text={description} /></TipBody>
        </>
      }
    >
      {chip}
    </Tooltip>
  )
}
