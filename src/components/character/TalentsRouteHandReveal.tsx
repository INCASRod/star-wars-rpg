'use client'

import { forwardRef } from 'react'
import { CardFace, type HandCard } from '@/components/player-hud/HandOverlay'
import handStyles from '@/components/player-hud/HandOverlay.module.css'

export interface TalentsRouteHandRevealProps {
  card: HandCard
}

/** Ephemeral single-card hand strip for the talents route (H4b). The talents
    route has no persistent HandOverlay mount, so this exists ONLY for the
    duration of a hand-bound purchase ceremony — mounted by PurchaseCeremony
    itself, at the same bottom-center position HandOverlay's fan occupies in
    PlayerHUDDesktop, so the moment feels continuous with where the hand
    normally lives. Reuses HandOverlay's CardFace/CSS; never a second card
    renderer. */
export const TalentsRouteHandReveal = forwardRef<HTMLDivElement, TalentsRouteHandRevealProps>(
  function TalentsRouteHandReveal({ card }, ref) {
    return (
      <div className={handStyles.handZone}>
        <div className={handStyles.hand}>
          <div
            ref={ref}
            className={`${handStyles.card} ${card.kind === 'force' ? handStyles.forceCard : ''}`}
          >
            <CardFace card={card} />
          </div>
        </div>
      </div>
    )
  },
)
