'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Character, RefDutyType, RefObligationType, CharacterCriticalInjury } from '@/lib/types'
import type { GmConflictRow } from '@/hooks/useGmCampaignConflicts'
import type { MapToken } from '@/hooks/useMapTokens'
import { FONT_BODY as FONT, FS, SP, RADIUS, HUD } from '@/lib/tokens'
import { GmPartyMiniCard } from './GmPartyMiniCard'
import { GmCharacterDossier } from '@/components/gm/GmCharacterDossier'
import { ArchivedCharactersModal } from './ArchivedCharactersModal'
import type { GmCharacterCardProps } from '@/components/gm/GmCharacterCard'

type CardCallbacks = Pick<
  GmCharacterCardProps,
  | 'players' | 'obligationTypes' | 'dutyTypes'
  | 'charActiveCritCounts' | 'critReqOpenFor'
  | 'critReqVicious' | 'critReqLethal' | 'critReqGm' | 'critReqBusy'
  | 'onAdjustObligation' | 'onAdjustDuty' | 'onAdjustMorality'
  | 'onMoralitySetup' | 'onFallenConfirm' | 'onArchiveConfirm'
  | 'onCritOpen' | 'onCritClose'
  | 'onSetCritVicious' | 'onSetCritLethal' | 'onSetCritGm'
  | 'onSendCritRequest'
  | 'refCritsDb'
  | 'addCritOpenFor' | 'addCritRefId'
  | 'addCritName' | 'addCritDesc' | 'addCritSeverity' | 'addCritBusy'
  | 'onAddCritOpen' | 'onAddCritClose' | 'onSelectAddCritRef'
  | 'onSetAddCritName' | 'onSetAddCritDesc' | 'onAddCritApply'
>

export interface GmPartyPanelProps extends CardCallbacks {
  campaignId:        string
  characters:        Character[]
  charCrits:         Record<string, CharacterCriticalInjury[]>
  charConflicts:     Record<string, GmConflictRow[]>
  onHealCrit:        (id: string) => void
  onResolveConflict: (id: string) => void
  onRestored:        (char: Character) => void
  mapId:             string | null
  tokens:            MapToken[]
  addToken:          (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  removeToken:       (id: string) => Promise<void>
}

export function GmPartyPanel({ campaignId, characters, charCrits, charConflicts, onHealCrit, onResolveConflict, onRestored, mapId, tokens, addToken, removeToken, ...cardCallbacks }: GmPartyPanelProps) {
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [archivedOpen, setArchivedOpen] = useState(false)
  const [originRect, setOriginRect]   = useState<DOMRect | null>(null)
  const selected = characters.find(c => c.id === selectedId) ?? null
  const cardListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardListRef.current) return
    gsap.from(cardListRef.current.children, {
      x: -18, opacity: 0, stagger: 0.055, duration: 0.4, ease: 'power3.out',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters.length])

  function pulseTokenDots() {
    gsap.utils.toArray<HTMLElement>('.gm-party-tokdot').forEach((dot, i) => {
      gsap.fromTo(dot, { scale: 1.9 }, { scale: 1, duration: 0.35, ease: 'back.out(3)', delay: i * 0.06, clearProps: 'scale' })
    })
  }

  async function placeAllPCs() {
    if (!mapId) return
    for (const c of characters) {
      if (tokens.some(t => t.character_id === c.id)) continue
      await addToken({
        map_id: mapId, campaign_id: campaignId, participant_type: 'pc',
        character_id: c.id, participant_id: null, slot_key: null,
        label: c.name, alignment: 'pc', x: 0.5, y: 0.5,
        is_visible: true, token_size: 1.0, wound_pct: null,
        token_image_url: c.portrait_url ?? null, token_shape: 'circle',
      })
    }
    pulseTokenDots()
  }

  async function removeAllPCs() {
    const pcTokens = tokens.filter(t => t.participant_type === 'pc' && characters.some(c => c.id === t.character_id))
    for (const t of pcTokens) {
      await removeToken(t.id)
    }
    pulseTokenDots()
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding:      '0.5rem 0.875rem',
          borderBottom: '1px solid var(--hud-border)',
          flexShrink:   0,
        }}>
          <span style={{
            fontFamily:    FONT,
            fontSize:      'var(--text-overline)',
            fontWeight:    700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         'var(--hud-text-dim)',
          }}>
            {characters.length} Character{characters.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Bulk token controls */}
        <div style={{ display: 'flex', gap: SP[2], padding: `${SP[2]} 0.875rem`, borderBottom: '1px solid var(--hud-border)', background: 'var(--hud-surface-lo)' }}>
          <button className="gm-party-bulkbtn" onClick={placeAllPCs}>◈ PLACE ALL PCs</button>
          <button className="gm-party-bulkbtn danger" onClick={removeAllPCs}>✕ REMOVE ALL PCs</button>
        </div>

        {/* Card list */}
        <div ref={cardListRef} style={{ flex: 1, overflowY: 'auto', padding: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {characters.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 0', fontFamily: FONT, fontSize: 'var(--text-sm)', color: 'var(--hud-text-dim)' }}>
              No active characters.
            </div>
          )}
          {characters.map(c => (
            <GmPartyMiniCard
              key={c.id}
              character={c}
              onMap={tokens.some(t => t.character_id === c.id)}
              critCount={cardCallbacks.charActiveCritCounts?.[c.id] ?? 0}
              onClick={e => { setOriginRect(e.currentTarget.getBoundingClientRect()); setSelectedId(c.id) }}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          flexShrink: 0,
          borderTop:  `1px solid ${HUD.border}`,
          padding:    `${SP[1]} ${SP[3]}`,
        }}>
          <button
            onClick={() => setArchivedOpen(true)}
            style={{
              background:    'none',
              border:        'none',
              color:         HUD.textDim,
              fontFamily:    FONT,
              fontSize:      FS.overline,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor:        'pointer',
              padding:       `2px 0`,
            }}
          >
            View Archived
          </button>
        </div>
      </div>

      {/* Character dossier (portal) */}
      {selected && (
        <GmCharacterDossier
          character={selected}
          campaignId={campaignId}
          mapId={mapId}
          tokens={tokens}
          addToken={addToken}
          removeToken={removeToken}
          originRect={originRect}
          onArchive={payload => { cardCallbacks.onArchiveConfirm(payload); setSelectedId(null) }}
          onClose={() => setSelectedId(null)}
        />
      )}

      <ArchivedCharactersModal
        isOpen={archivedOpen}
        onClose={() => setArchivedOpen(false)}
        campaignId={campaignId}
        onRestored={onRestored}
      />
    </>
  )
}
