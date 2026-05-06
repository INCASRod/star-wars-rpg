'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { C, FONT_RAJDHANI, FS_SM, FS_CAPTION } from './design-tokens'
import { MapCanvas } from '@/components/map/MapCanvas'
import { InitiativeStrip } from '@/components/player/InitiativeStrip'
import { HudTalentDrawer } from './HudTalentDrawer'
import { HudAdversaryDrawer } from './HudAdversaryDrawer'
import type { HudTalent } from './TalentsPanel'
import type { MapToken } from '@/hooks/useMapTokens'
import type { CombatEncounter } from '@/lib/combat'
import type { Character } from '@/lib/types'

interface HudSessionTabProps {
  character: Character
  visibleMap: { id: string; image_url: string; grid_enabled: boolean; grid_size?: number; token_scale?: number } | null
  visibleMapTokens: MapToken[]
  onTokenMove: (tokenId: string, x: number, y: number) => void
  isCombatActive: boolean
  encounter: CombatEncounter | null
  hudTalents: HudTalent[]
}

export function HudSessionTab({
  character,
  visibleMap,
  visibleMapTokens,
  onTokenMove,
  isCombatActive,
  encounter,
  hudTalents,
}: HudSessionTabProps) {
  const [talentDrawerOpen, setTalentDrawerOpen] = useState(false)
  const [adversaryDrawerOpen, setAdversaryDrawerOpen] = useState(false)
  const [tokenHoverInfo, setTokenHoverInfo] = useState<{ tokenId: string; x: number; y: number } | null>(null)
  const [sessionCardCollapsed, setSessionCardCollapsed] = useState<Record<string, boolean>>({})

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      {/* Map or placeholder */}
      {visibleMap
        ? (
          <MapCanvas
            mapImageUrl={visibleMap.image_url}
            tokens={visibleMapTokens}
            isGM={false}
            currentCharacterId={character.id}
            onTokenMove={onTokenMove}
            gridEnabled={visibleMap.grid_enabled}
            gridSize={visibleMap.grid_size ?? 50}
            tokenScale={visibleMap.token_scale ?? 1}
            onTokenHover={(id, x, y) => setTokenHoverInfo({ tokenId: id, x, y })}
            onTokenHoverEnd={() => setTokenHoverInfo(null)}
          />
        )
        : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12, background: 'var(--hud-bg)' }}>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textFaint }}>Waiting for GM to set a map</div>
          </div>
        )
      }

      {/* ── Combat overlays — only when an active encounter exists ── */}
      {isCombatActive && encounter && (
        <>
          {/* Initiative strip — full-height glassmorphic wrapper, z:30 sits above panels */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            background: 'rgba(6,13,9,0.85)', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 30,
          }}>
            <InitiativeStrip encounter={encounter} character={character} />
          </div>
        </>
      )}

      {/* ── Session drawer trigger buttons — bottom-left, overlaid on map ── */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        display: 'flex', gap: 6,
        zIndex: 31,
      }}>
        <button
          onClick={() => setTalentDrawerOpen(o => !o)}
          style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: talentDrawerOpen ? '#060D09' : C.gold,
            background: talentDrawerOpen ? C.gold : 'rgba(6,13,9,0.88)',
            border: `1px solid rgba(224,58,30,0.5)`,
            borderRadius: 4, padding: '4px 10px',
            cursor: 'pointer',
          }}
        >Talents</button>
        {isCombatActive && encounter && (
          <button
            onClick={() => setAdversaryDrawerOpen(o => !o)}
            style={{
              fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: adversaryDrawerOpen ? '#060D09' : C.gold,
              background: adversaryDrawerOpen ? C.gold : 'rgba(6,13,9,0.88)',
              border: `1px solid rgba(224,58,30,0.5)`,
              borderRadius: 4, padding: '4px 10px',
              cursor: 'pointer',
            }}
          >{encounter && (encounter.vehicles ?? []).length > 0 ? 'Adversaries & Vehicles' : 'Adversaries'}</button>
        )}
      </div>

      {/* ── Talents drawer — portal, slides in from left ── */}
      <HudTalentDrawer
        open={talentDrawerOpen}
        onClose={() => setTalentDrawerOpen(false)}
        hudTalents={hudTalents}
      />

      {/* ── Adversaries drawer — portal, slides in from left ── */}
      {isCombatActive && encounter && (
        <HudAdversaryDrawer
          open={adversaryDrawerOpen}
          onClose={() => setAdversaryDrawerOpen(false)}
          encounter={encounter}
          sessionCardCollapsed={sessionCardCollapsed}
          setSessionCardCollapsed={setSessionCardCollapsed}
        />
      )}

      {/* Token hover tooltip — portal to body */}
      {tokenHoverInfo && encounter && isCombatActive && (() => {
        const hovToken = visibleMapTokens.find(t => t.id === tokenHoverInfo.tokenId)
        if (!hovToken || hovToken.is_visible === false) return null
        const slot = hovToken.slot_key
          ? encounter.initiative_slots.find(s => s.id === hovToken.slot_key)
          : null
        const adv = slot?.adversaryInstanceId
          ? encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
          : null
        if (!adv || !adv.revealed) return null
        const wMax = adv.type === 'minion' ? adv.woundThreshold * adv.groupSize : adv.woundThreshold
        return createPortal(
          <div style={{
            position: 'fixed',
            left: tokenHoverInfo.x + 14,
            top: tokenHoverInfo.y - 40,
            zIndex: 9999,
            background: 'rgba(6,13,9,0.96)',
            border: '1px solid rgba(224,58,30,0.45)',
            borderRadius: 6, padding: '8px 12px',
            fontFamily: FONT_RAJDHANI,
            minWidth: 150, pointerEvents: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          }}>
            <div style={{ color: C.gold, fontWeight: 700, fontSize: FS_SM, marginBottom: 4 }}>{adv.name}</div>
            <div style={{ color: 'rgba(90,40,24,0.7)', fontSize: FS_CAPTION, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {adv.type === 'minion' && (
                <div>Group: {adv.groupSize} · W: {adv.woundsCurrent ?? 0}/{wMax}</div>
              )}
              {adv.type !== 'minion' && (
                <div>Wounds: {adv.woundsCurrent ?? 0}/{wMax}</div>
              )}
              {adv.strainThreshold != null && adv.type !== 'minion' && (
                <div>Strain: {adv.strainCurrent ?? 0}/{adv.strainThreshold}</div>
              )}
            </div>
          </div>,
          document.body,
        )
      })()}
    </div>
  )
}
