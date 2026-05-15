'use client'

import { C } from './design-tokens'
import { FONT_BODY, FS } from '@/lib/tokens'
import { RollFeedPanel } from './RollFeedPanel'
import type { RollEntry } from '@/hooks/useRollFeed'

interface HudRightColumnProps {
  rolls: RollEntry[]
  ownCharacterId: string
  isGm: boolean
}

export function HudRightColumn({ rolls, ownCharacterId, isGm }: HudRightColumnProps) {
  return (
    <div style={{
      background: 'var(--hud-surface-lo)',
      borderLeft: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '6px var(--space-2)',
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.overline,
          fontWeight: 700, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--hud-text-faint)',
        }}>
          Roll Feed
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <RollFeedPanel rolls={rolls} ownCharacterId={ownCharacterId} isGm={isGm} />
      </div>
    </div>
  )
}
