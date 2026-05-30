'use client'
import { FONT_BODY, RADIUS, FS } from '@/lib/tokens'
import type { EquipState, ItemCondition } from '@/lib/types'

interface ItemThumbProps {
  name:       string
  icon:       string
  equipState: EquipState
  condition:  ItemCondition
  isSelected: boolean
  onClick:    () => void
}

const EQUIP_DOT: Record<EquipState, string> = {
  equipped: 'var(--hud-gold)',
  carrying: 'var(--die-success)',
  stowed:   'var(--hud-text-faint)',
}

const COND_STRIP: Record<ItemCondition, string> = {
  undamaged: 'var(--die-success)',
  minor:     'var(--die-success)',
  moderate:  'var(--die-threat)',
  major:     'var(--hud-vital-wounds)',
  destroyed: 'var(--hud-text-faint)',
}

const NAME_COLOR: Record<ItemCondition, string> = {
  undamaged: 'var(--hud-text-dim)',
  minor:     'var(--hud-text-dim)',
  moderate:  'var(--hud-text-dim)',
  major:     'var(--hud-vital-wounds)',
  destroyed: 'var(--hud-text-faint)',
}

export function ItemThumb({ name, icon, equipState, condition, isSelected, onClick }: ItemThumbProps) {
  const isDestroyed = condition === 'destroyed'

  return (
    <button
      onClick={onClick}
      className={`inv-thumb${isSelected ? ' inv-thumb-active' : ''}`}
      style={{
        width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 0, background: 'none', border: '1px solid transparent',
        borderRadius: RADIUS.md, padding: '2px', cursor: 'pointer', outline: 'none',
        opacity: isDestroyed ? 0.55 : 1,
      }}
    >
      {/* image area */}
      <div style={{
        width: '100%', height: 44, position: 'relative',
        background: 'radial-gradient(ellipse at 50% 60%, var(--hud-accent-10) 0%, transparent 70%)',
        borderRadius: RADIUS.sm,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        filter: isDestroyed ? 'grayscale(0.8)' : 'none',
        overflow: 'hidden',
      }}>
        <span style={{ fontSize: 20, color: isSelected ? 'var(--hud-gold)' : 'var(--hud-text-dim)', lineHeight: 1, fontFamily: FONT_BODY }}>
          {icon}
        </span>
        {/* equip dot */}
        <span style={{
          position: 'absolute', top: 3, right: 3,
          width: 5, height: 5, borderRadius: RADIUS.full,
          background: EQUIP_DOT[equipState],
          flexShrink: 0,
        }} />
        {/* condition strip */}
        <span style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 3, background: COND_STRIP[condition],
        }} />
        {/* destroyed overlay */}
        {isDestroyed && (
          <span style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'color-mix(in srgb, black 35%, transparent)',
            fontSize: 14, color: 'var(--hud-text-faint)',
          }}>✕</span>
        )}
      </div>
      {/* name label */}
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.overline,
        color: isSelected ? 'var(--hud-gold)' : NAME_COLOR[condition],
        textAlign: 'center', width: '100%', paddingTop: 2,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
      }}>
        {name}
      </div>
    </button>
  )
}
