'use client'

import { Suspense }                   from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { PlayerHUDDesktop }           from '@/components/player-hud/PlayerHUDDesktop'
import { MobileShell }                from '@/components/mobile/MobileShell'
import { CharacterLoader }            from '@/components/ui/CharacterLoader'
import { useIsMobile }                from '@/hooks/useIsMobile'
import { useCharacterAccess }         from '@/hooks/useCharacterAccess'
import { ViewModeProvider }           from '@/contexts/ViewModeContext'
import { CharacterPreview }           from '@/components/preview/CharacterPreview'

export default function CharacterPage() {
  return (
    <Suspense fallback={<CharacterLoader />}>
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
  const access       = useCharacterAccess(characterId)

  if (access.status === 'loading') return <CharacterLoader />

  // Preview Only: a signed-in player bound to a different character sees that build, read-only. Nothing from the
  // HUD or the mobile shell is mounted (no session claim, presence, notification feeds or write controls).
  if (access.mode === 'preview') {
    return (
      <ViewModeProvider mode="preview">
        <CharacterPreview characterId={characterId} ownCharacterId={access.ownCharacterId} />
      </ViewModeProvider>
    )
  }

  if (isMobile) {
    return (
      <ViewModeProvider mode={access.mode}>
        <MobileShell
          characterId={characterId}
          campaignId={campaignId}
        />
      </ViewModeProvider>
    )
  }

  return (
    <ViewModeProvider mode={access.mode}>
      <PlayerHUDDesktop
        characterId={characterId}
        isGmMode={isGmMode}
        campaignId={campaignId}
      />
    </ViewModeProvider>
  )
}
