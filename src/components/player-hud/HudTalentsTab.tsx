'use client'

import { TalentTree, type TalentTreeNode, type TalentTreeConnection } from '@/components/character/TalentTree'
import { BuySpecButton } from './BuySpecButton'
import { TalentsPanel as WfTalentsPanel } from '@/components/wireframe/TalentsPanel'
import { FS_CAPTION, FS_OVERLINE, FS_SM } from './design-tokens'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {charSpecs.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
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
                  background: isActive ? 'rgba(224,58,30,0.12)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(224,58,30,0.5)' : 'var(--hud-border)'}`,
                  borderRadius: 4, padding: '5px 12px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: FS_CAPTION, fontWeight: 600, letterSpacing: '0.06em',
                  color: isActive ? 'var(--hud-gold)' : 'var(--hud-text-dim)',
                  transition: '.15s',
                }}
              >
                {ref?.name || cs.specialization_key}
                <span style={{ fontFamily: "var(--font-rajdhani),'Rajdhani',sans-serif", fontSize: FS_OVERLINE, color: isActive ? 'var(--hud-gold)' : 'var(--hud-text-faint)', background: 'var(--hud-surface-lo)', borderRadius: 8, padding: '0 5px' }}>
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
        <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: "var(--font-rajdhani),'Rajdhani',sans-serif", fontSize: FS_SM, color: 'var(--hud-text-faint)' }}>
          No specializations purchased yet.
        </div>
      ) : null}
    </div>
  )
}
