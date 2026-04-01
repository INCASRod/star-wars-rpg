'use client'

import { Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { PlayerHUDDesktop } from '@/components/player-hud/PlayerHUDDesktop'
import { MobileSessionCompanion } from '@/components/mobile/MobileSessionCompanion'
import { HolocronLoader } from '@/components/ui/HolocronLoader'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function CharacterPage() {
  return (
    <Suspense fallback={<HolocronLoader />}>
      <CharacterPageInner />
    </Suspense>
  )
}

function CharacterPageInner() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const characterId  = params.id as string
  const isGmMode     = searchParams.get('gm') === '1'
  const campaignId   = searchParams.get('campaign')
  const isMobile     = useIsMobile()

  if (isMobile) {
    return (
      <MobileSessionCompanion
        characterId={characterId}
        campaignId={campaignId}
      />
    )
  }

  return (
    <PlayerHUDDesktop
      characterId={characterId}
      isGmMode={isGmMode}
      campaignId={campaignId}
    />
  )
}
