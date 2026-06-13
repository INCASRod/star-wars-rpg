'use client'
import { RollFeedPanel } from '@/components/player-hud/RollFeedPanel'
import type { RollEntry } from '@/hooks/useRollFeed'
import { SP } from '@/lib/tokens'

interface MobileFeedScreenProps {
  rolls: RollEntry[]
  ownCharacterId: string
}

export function MobileFeedScreen({ rolls, ownCharacterId }: MobileFeedScreenProps) {
  return (
    <div style={{ padding: SP[2], paddingBottom: SP[6] /* scroll clearance */ }}>
      <RollFeedPanel
        rolls={rolls}
        ownCharacterId={ownCharacterId}
        isGm={false}
      />
    </div>
  )
}
