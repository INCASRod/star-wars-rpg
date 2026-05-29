'use client'

import { TalentTree, type TalentTreeNode, type TalentTreeConnection } from '@/components/character/TalentTree'
import { BuySpecButton } from './BuySpecButton'
import { TalentsPanel as WfTalentsPanel } from '@/components/wireframe/TalentsPanel'
import { FS, SP, RADIUS, EASE, FONT_BODY } from '@/lib/tokens'
import type { Character, CharacterSpecialization, CharacterTalent, RefSpecialization, RefTalent } from '@/lib/types'
import type { HudTalent } from './TalentsPanel'

interface HudTalentsTabProps {
  character: Character
  characterId: string
  charSpecs: CharacterSpecialization[]
  refSpecMap: Record<string, RefSpecialization>
  refSpecs: RefSpecialization[]
  refTalentMap: Record<string, RefTalent>
  talents: CharacterTalent[]
  hudTalents: HudTalent[]
  activeSpecKey: string | null
  setActiveSpecKey: (k: string) => void
  talentTreeData: { specName: string; nodes: TalentTreeNode[]; connections: TalentTreeConnection[] } | null
  isGmMode: boolean
  onPurchaseTalent: (talentKey: string, row: number, col: number, specKey: string) => Promise<string | undefined>
  onRemoveTalent: ((talentId: string, xpCost: number) => void) | undefined
  onBuySpecialization: (specKey: string, setSpecKey: (k: string) => void) => void
  onPendingDedication: (d: { talentId: string; row: number; col: number; specKey: string }) => void
}

export function HudTalentsTab({
  character, characterId, charSpecs, refSpecMap, refSpecs, refTalentMap,
  talents, hudTalents, activeSpecKey, setActiveSpecKey,
  talentTreeData, isGmMode, onPurchaseTalent, onRemoveTalent,
  onBuySpecialization, onPendingDedication,
}: HudTalentsTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[3] }}>
      {charSpecs.length > 0 && (
        <div style={{ display: 'flex', gap: SP[1], flexWrap: 'wrap', alignItems: 'center' }}>
          {charSpecs.map(cs => {
            const ref = refSpecMap[cs.specialization_key]
            const purchased = talents.filter(t => t.specialization_key === cs.specialization_key).length
            const total = ref?.talent_tree?.rows?.reduce((s: number, r: any) => s + (r.talents?.length || 0), 0) || 0
            const isActive = (activeSpecKey || charSpecs[0]?.specialization_key) === cs.specialization_key
            return (
              <button
                key={cs.id}
                onClick={() => setActiveSpecKey(cs.specialization_key)}
                style={{
                  background: isActive ? 'var(--hud-accent-10)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--hud-accent-border)' : 'var(--hud-border)'}`,
                  borderRadius: RADIUS.md, padding: `${SP[1]} ${SP[3]}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: SP[2],
                  fontFamily: FONT_BODY,
                  fontSize: FS.caption, fontWeight: 600, letterSpacing: '0.06em',
                  color: isActive ? 'var(--hud-gold)' : 'var(--hud-text-dim)',
                  transition: EASE.default,
                }}
              >
                {ref?.name || cs.specialization_key}
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: isActive ? 'var(--hud-gold)' : 'var(--hud-text-faint)', background: 'var(--hud-surface-lo)', borderRadius: RADIUS.lg, padding: `0 ${SP[1]}` }}>
                  {purchased}/{total}
                </span>
              </button>
            )
          })}
          <BuySpecButton
            character={character}
            charSpecs={charSpecs}
            refSpecs={refSpecs}
            refSpecMap={refSpecMap}
            refTalentMap={refTalentMap}
            onBuy={specKey => onBuySpecialization(specKey, setActiveSpecKey)}
          />
        </div>
      )}
      <WfTalentsPanel liveTalents={hudTalents} characterName={character.name} characterId={characterId} />
      {talentTreeData ? (
        <TalentTree
          specName={talentTreeData.specName}
          nodes={talentTreeData.nodes}
          connections={talentTreeData.connections}
          onPurchase={async (talentKey, row, col) => {
            const specKey = (activeSpecKey || charSpecs[0]?.specialization_key)!
            if (talentKey === 'DEDI') {
              const newId = await onPurchaseTalent(talentKey, row, col, specKey)
              if (newId) onPendingDedication({ talentId: newId, row, col, specKey })
              return
            }
            onPurchaseTalent(talentKey, row, col, specKey)
          }}
          onRemoveTalent={onRemoveTalent}
          isGmMode={isGmMode}
          xpAvailable={character.xp_available}
        />
      ) : charSpecs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: `${SP[10]} 0`, fontFamily: FONT_BODY, fontSize: FS.sm, color: 'var(--hud-text-faint)' }}>
          No specializations purchased yet.
        </div>
      ) : null}
    </div>
  )
}
