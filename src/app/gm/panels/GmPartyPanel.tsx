'use client'

import { useState } from 'react'
import type { Character, RefDutyType, RefObligationType, CharacterCriticalInjury } from '@/lib/types'
import type { GmConflictRow } from '@/hooks/useGmCampaignConflicts'
import { FONT_BODY as FONT } from '@/lib/tokens'
import { GmPartyMiniCard } from './GmPartyMiniCard'
import { GmCharacterModal } from './GmCharacterModal'
import type { GmCharacterCardProps } from '@/components/gm/GmCharacterCard'

type CardCallbacks = Pick<
  GmCharacterCardProps,
  | 'players' | 'obligationTypes' | 'dutyTypes'
  | 'charActiveCritCounts' | 'critReqOpenFor'
  | 'critReqVicious' | 'critReqLethal' | 'critReqGm' | 'critReqBusy'
  | 'onAddWound' | 'onHealWounds' | 'onAddStrain' | 'onHealStrain'
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
}

export function GmPartyPanel({ campaignId, characters, charCrits, charConflicts, onHealCrit, onResolveConflict, ...cardCallbacks }: GmPartyPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = characters.find(c => c.id === selectedId) ?? null

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

        {/* Card list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {characters.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 0', fontFamily: FONT, fontSize: 'var(--text-sm)', color: 'var(--hud-text-dim)' }}>
              No active characters.
            </div>
          )}
          {characters.map(c => (
            <GmPartyMiniCard
              key={c.id}
              character={c}
              onAddWound={cardCallbacks.onAddWound}
              onHealWound={cardCallbacks.onHealWounds}
              onAddStrain={cardCallbacks.onAddStrain}
              onHealStrain={cardCallbacks.onHealStrain}
              onClick={() => setSelectedId(c.id)}
              crits={charCrits[c.id] ?? []}
              conflicts={charConflicts[c.id] ?? []}
              onHealCrit={onHealCrit}
              onResolveConflict={onResolveConflict}
            />
          ))}
        </div>
      </div>

      {/* Character modal (portal) */}
      {selected && (
        <GmCharacterModal
          isOpen={!!selected}
          onClose={() => setSelectedId(null)}
          c={selected}
          campaignId={campaignId}
          {...cardCallbacks}
        />
      )}
    </>
  )
}
