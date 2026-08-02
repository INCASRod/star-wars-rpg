'use client'

import { Suspense } from 'react'
import { useSearchParams }   from 'next/navigation'
import { useActiveMap }      from '@/hooks/useActiveMap'
import { useMapTokens }      from '@/hooks/useMapTokens'
import { useEncounterState } from '@/hooks/useEncounterState'
import { useSessionMode }    from '@/hooks/useSessionMode'
import { MapCanvas }         from '@/components/map/MapCanvas'
import { InitiativeStrip }   from '@/components/player/InitiativeStrip'
import { FONT_BODY, FS, HUD } from '@/lib/tokens'
import type { Character }    from '@/lib/types'

// No active player on the table display — stub prevents any YOU badge from matching a slot
const STUB_CHARACTER = { id: '', name: '' } as unknown as Character

function TableDisplayInner() {
  const params     = useSearchParams()
  const campaignId = params.get('campaign')

  const { visibleMap }     = useActiveMap(campaignId)
  // visibleOnly: true — server-side is_visible filter (Prompt 11), not just a
  // client-side hide. See useMapTokens.ts's UseMapTokensOptions doc comment
  // for the residual RLS gap this doesn't close.
  const { tokens: visibleTokens } = useMapTokens(visibleMap?.id ?? null, { visibleOnly: true })
  const { encounter }      = useEncounterState(campaignId)
  const { mode: sessionMode } = useSessionMode(campaignId)

  if (!campaignId) {
    return (
      <div
        data-theme="kyber"
        style={{
          width: '100vw', height: '100dvh',
          background:     HUD.bg,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontFamily:     FONT_BODY,
          fontSize:       FS.sm,
          color:          HUD.textFaint,
        }}
      >
        No campaign specified.
      </div>
    )
  }

  return (
    <div
      data-theme="kyber"
      style={{
        position: 'relative',
        width: '100vw', height: '100dvh',
        overflow: 'hidden',
        background: HUD.bg,
        margin: 0, padding: 0,
      }}
    >
      <title>HOLOCRON // Table Display</title>

      {visibleMap ? (
        <MapCanvas
          mapImageUrl={visibleMap.image_url}
          tokens={visibleTokens}
          isGM={false}
          currentCharacterId={null}
          onTokenMove={() => {}}
          gridEnabled={visibleMap.grid_enabled}
          gridSize={visibleMap.grid_size ?? 50}
          tokenScale={visibleMap.token_scale ?? 1}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint,
        }}>
          No active map.
        </div>
      )}

      {/* Gate on sessionMode, not just encounter.is_active — a staging
          encounter (is_active=true, session still exploration) exists as
          soon as the GM starts placing adversary tokens, before combat is
          formally started. See StagingFloatingToolbar.tsx's
          ensureActiveEncounter comment and PlayerHUDDesktop's isCombatActive
          for the same gate on the player side. */}
      {sessionMode === 'combat' && encounter?.is_active && (
        <InitiativeStrip
          encounter={encounter}
          character={STUB_CHARACTER}
          asOverlay={true}
          offsetTop="100px"
        />
      )}
    </div>
  )
}

export default function TableDisplayPage() {
  return (
    <Suspense
      fallback={
        <div style={{ width: '100vw', height: '100dvh', background: HUD.bg }} />
      }
    >
      <TableDisplayInner />
    </Suspense>
  )
}
