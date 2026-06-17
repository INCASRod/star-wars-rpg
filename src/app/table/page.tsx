'use client'

import { Suspense, useMemo } from 'react'
import { useSearchParams }   from 'next/navigation'
import { useActiveMap }      from '@/hooks/useActiveMap'
import { useMapTokens }      from '@/hooks/useMapTokens'
import { useEncounterState } from '@/hooks/useEncounterState'
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
  const { tokens }         = useMapTokens(visibleMap?.id ?? null)
  const { encounter }      = useEncounterState(campaignId)

  const visibleTokens = useMemo(() => tokens.filter(t => t.is_visible), [tokens])

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

      {encounter?.is_active && (
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
