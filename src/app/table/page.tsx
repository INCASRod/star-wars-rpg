'use client'

import { Suspense, useRef, useState } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { useSearchParams }   from 'next/navigation'
import { useActiveMap }      from '@/hooks/useActiveMap'
import { useMapTokens }      from '@/hooks/useMapTokens'
import { useEncounterState } from '@/hooks/useEncounterState'
import { useSessionMode }    from '@/hooks/useSessionMode'
import { MapCanvas, type MapCanvasHandle } from '@/components/map/MapCanvas'
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
  // No vitals/top bar on the table display, so Reset/Lock keep a home of their own (bottom-right,
  // clear of the strip that is now flush with the top edge).
  const mapHandleRef = useRef<MapCanvasHandle>(null)
  const [mapLocked, setMapLocked] = useState(false)

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
          handleRef={mapHandleRef}
          onLockChange={setMapLocked}
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

      {visibleMap && (
        <div className="absolute flex" style={{ bottom: 'var(--space-2)', right: 'var(--space-2)', gap: 'var(--space-1)', zIndex: 'var(--z-overlay)' }}>
          <button className="map-ctrl-btn" onClick={() => mapHandleRef.current?.resetView()} aria-label="Reset map view">↺ Reset</button>
          <button
            className={`map-ctrl-btn map-ctrl-btn--icon${mapLocked ? ' map-ctrl-btn--locked' : ''}`}
            onClick={() => mapHandleRef.current?.toggleLock()}
            aria-label={mapLocked ? 'Unlock map' : 'Lock map'}
            aria-pressed={mapLocked}
          >
            {mapLocked ? <Lock size={13} strokeWidth={2} /> : <LockOpen size={13} strokeWidth={2} />}
          </button>
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
          offsetTop="0"
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
