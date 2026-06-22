'use client'

import { useEffect, useState } from 'react'
import { MobileBottomSheet } from '@/components/mobile/MobileBottomSheet'
import { useStowLocations } from '@/hooks/useStowLocations'
import type { StowLocation, StowLocationType } from '@/lib/types'
import { FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, HUD } from '@/lib/tokens'

// ── Local icon map ──────────────────────────────────────────────────────────
const STOW_ICON: Record<string, string> = {
  vehicle:            '▶',
  starship:           '◈',
  safe_house:         '◆',
  base_of_operations: '★',
}

// ── Type badge display labels ───────────────────────────────────────────────
const TYPE_LABEL: Record<string, string> = {
  vehicle:            'Vehicle',
  starship:           'Starship',
  safe_house:         'Safe House',
  base_of_operations: 'Base of Ops',
}

// ── Type badge colour tokens (CSS custom properties) ────────────────────────
const TYPE_COLOR: Record<string, { text: string; bg: string }> = {
  starship:           { text: 'var(--die-advantage)',  bg: 'color-mix(in srgb, var(--die-advantage) 12%, transparent)' },
  vehicle:            { text: 'var(--die-success)',    bg: 'color-mix(in srgb, var(--die-success) 12%, transparent)'  },
  safe_house:         { text: 'var(--hud-gold)',       bg: 'color-mix(in srgb, var(--hud-gold) 12%, transparent)'     },
  base_of_operations: { text: 'var(--hud-accent)',     bg: 'color-mix(in srgb, var(--hud-accent) 12%, transparent)'  },
}

// ── Props ───────────────────────────────────────────────────────────────────
interface MobileStowLocationSheetProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (location: StowLocation | null) => void
  campaignId: string
  itemName: string
}

// ── Component ───────────────────────────────────────────────────────────────
export function MobileStowLocationSheet({
  isOpen,
  onClose,
  onConfirm,
  campaignId,
  itemName,
}: MobileStowLocationSheetProps) {
  const [selected, setSelected] = useState<StowLocation | null>(null)

  const { stowableAssets, baseOfOperationsName } = useStowLocations(campaignId)

  // Reset selection when sheet closes
  useEffect(() => {
    if (!isOpen) setSelected(null)
  }, [isOpen])

  // Build the full location list: Base of Operations always first
  const baseOfOps: StowLocation = {
    id:   null,
    name: baseOfOperationsName ?? 'Base of Operations',
    type: 'base_of_operations' as StowLocationType,
  }
  const assetLocations: StowLocation[] = stowableAssets.map(a => ({
    id:   a.id,
    name: a.name,
    type: a.type as StowLocationType,
  }))
  const locations: StowLocation[] = [baseOfOps, ...assetLocations]

  function isSelected(loc: StowLocation): boolean {
    return selected !== null && selected.id === loc.id && selected.name === loc.name
  }

  return (
    <MobileBottomSheet
      open={isOpen}
      onClose={onClose}
      collapsedHeight="55vh"
      expandedHeight="80vh"
    >
      {/* Title */}
      <div style={{
        fontFamily:   FONT_DISPLAY,
        fontSize:     FS.h4,
        fontWeight:   700,
        color:        HUD.text,
        marginBottom: SP[2],
      }}>
        Stow — {itemName}
      </div>

      {/* Section label */}
      <div style={{
        fontFamily:    FONT_DISPLAY,
        fontSize:      FS.overline,
        textTransform: 'uppercase',
        color:         HUD.textFaint,
        letterSpacing: '0.2em',
        marginBottom:  SP[1],
      }}>
        Stow Location
      </div>

      {/* Scrollable location list */}
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        gap:            SP[1],
        overflowY:      'auto',
        flex:           1,
      }}>
        {locations.map(loc => {
          const active   = isSelected(loc)
          const typeColor = TYPE_COLOR[loc.type] ?? TYPE_COLOR.base_of_operations

          return (
            <button
              key={loc.id ?? '__base__'}
              onClick={() => setSelected({ id: loc.id, name: loc.name, type: loc.type })}
              style={{
                width:           '100%',
                minHeight:       44, /* mobile minimum touch target — fixed affordance constant */
                padding:         `${SP[1]} ${SP[2]}`,
                display:         'flex',
                alignItems:      'center',
                gap:             SP[2],
                background:      active
                  ? 'color-mix(in srgb, var(--hud-accent) 12%, transparent)'
                  : 'transparent',
                border:          active
                  ? '1px solid color-mix(in srgb, var(--hud-accent) 40%, transparent)'
                  : '1px solid var(--hud-border)',
                borderRadius:    RADIUS.md,
                cursor:          'pointer',
                textAlign:       'left',
              }}
            >
              {/* Icon */}
              <span style={{
                fontFamily: FONT_BODY,
                fontSize:   FS.sm,
                color:      HUD.textFaint,
                flexShrink: 0,
              }}>
                {STOW_ICON[loc.type] ?? '●'}
              </span>

              {/* Name */}
              <span style={{
                fontFamily: FONT_BODY,
                fontSize:   FS.sm,
                color:      HUD.text,
                flex:       1,
                minWidth:   0,
                overflow:   'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {loc.name}
              </span>

              {/* Type badge */}
              <span style={{
                fontFamily:    FONT_DISPLAY,
                fontSize:      FS.overline,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color:         typeColor.text,
                background:    typeColor.bg,
                padding:       `2px ${SP[1]}`, /* 2px vertical: minimum touch clearance */
                borderRadius:  RADIUS.sm,
                flexShrink:    0,
              }}>
                {TYPE_LABEL[loc.type] ?? loc.type}
              </span>
            </button>
          )
        })}
      </div>

      {/* Sticky bottom action buttons */}
      <div style={{
        display:     'flex',
        flexDirection: 'row',
        gap:         SP[2],
        paddingTop:  SP[2],
        borderTop:   '1px solid var(--hud-border)',
        marginTop:   SP[2],
      }}>
        {/* Cancel */}
        <button
          onClick={onClose}
          style={{
            fontFamily:   FONT_BODY,
            fontSize:     FS.sm,
            borderRadius: RADIUS.md,
            border:       '1px solid var(--hud-border)',
            color:        HUD.textFaint,
            background:   'transparent',
            minHeight:    44, /* mobile minimum touch target — fixed affordance constant */
            flex:         1,
            cursor:       'pointer',
          }}
        >
          Cancel
        </button>

        {/* Confirm */}
        <button
          onClick={() => onConfirm(selected)}
          disabled={selected === null}
          style={{
            fontFamily:   FONT_BODY,
            fontSize:     FS.sm,
            fontWeight:   700,
            borderRadius: RADIUS.md,
            background:   'color-mix(in srgb, var(--hud-accent) 20%, transparent)',
            border:       '1px solid color-mix(in srgb, var(--hud-accent) 60%, transparent)',
            color:        'var(--hud-accent)',
            minHeight:    44, /* mobile minimum touch target — fixed affordance constant */
            flex:         1,
            cursor:       selected === null ? 'not-allowed' : 'pointer',
            opacity:      selected === null ? 0.4 : 1,
          }}
        >
          Confirm
        </button>
      </div>
    </MobileBottomSheet>
  )
}
