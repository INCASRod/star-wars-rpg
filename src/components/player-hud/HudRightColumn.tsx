'use client'
import { CombatCheckButton } from '@/components/character/CombatCheckButton'
import { ForceCheckButton } from '@/components/character/ForceCheckButton'
import { RollFeedMini } from './RollFeedPanel'
import { isForceUserSensitive } from '@/lib/forceUtils'
import type { Character } from '@/lib/types'
import type { EffectiveStats } from '@/lib/derivedStats'
import type { RollEntry } from '@/hooks/useRollFeed'

interface HudRightColumnProps {
  character: Character
  effectiveStats?: EffectiveStats | null
  forceRating: number
  isCombat: boolean
  rolls: RollEntry[]
  onOpenCombatCheck: () => void
  onOpenForceCheck: () => void
  onExpandFeed: () => void
}

export function HudRightColumn({
  character, effectiveStats, forceRating, isCombat, rolls,
  onOpenCombatCheck, onOpenForceCheck, onExpandFeed,
}: HudRightColumnProps) {
  return (
    <div style={{
      background: 'var(--hud-surface-lo)',
      overflowY: 'auto', overflowX: 'hidden',
      padding: 'var(--space-2)',
      display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
    }}>
      <CombatCheckButton onOpen={onOpenCombatCheck} isInCombat={isCombat} />
      {isForceUserSensitive(character, effectiveStats?.forceRating ?? forceRating) && (
        <div style={{ marginTop: 8 }}>
          <ForceCheckButton onOpen={onOpenForceCheck} />
        </div>
      )}
      {rolls.length > 0 && (
        <RollFeedMini rolls={rolls} ownCharacterId={character.id} onExpand={onExpandFeed} />
      )}
    </div>
  )
}
