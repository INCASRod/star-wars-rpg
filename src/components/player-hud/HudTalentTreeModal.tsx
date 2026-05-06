'use client'

import { TalentTree, type TalentTreeNode, type TalentTreeConnection } from '@/components/character/TalentTree'
import { BuySpecButton } from './BuySpecButton'
import type { Character, CharacterSpecialization, RefSpecialization, RefTalent } from '@/lib/types'

interface HudTalentTreeModalProps {
  open: boolean
  onClose: () => void
  charSpecs: CharacterSpecialization[]
  refSpecMap: Record<string, RefSpecialization>
  activeSpecKey: string | null
  setActiveSpecKey: (key: string) => void
  talentTreeData: { specName: string; nodes: TalentTreeNode[]; connections: TalentTreeConnection[] } | null
  character: Character
  refSpecs: RefSpecialization[]
  refTalentMap: Record<string, RefTalent>
  isGmMode: boolean
  onPurchaseTalent: (talentKey: string, row: number, col: number, specKey: string) => Promise<string | undefined>
  onRemoveTalent: ((talentId: string, xpCost: number) => void) | undefined
  onBuySpecialization: (specKey: string, setSpecKey: (k: string) => void) => void
  onPendingDedication: (d: { talentId: string; row: number; col: number; specKey: string }) => void
}

export function HudTalentTreeModal({
  open,
  onClose,
  charSpecs,
  refSpecMap,
  activeSpecKey,
  setActiveSpecKey,
  talentTreeData,
  character,
  refSpecs,
  refTalentMap,
  isGmMode,
  onPurchaseTalent,
  onRemoveTalent,
  onBuySpecialization,
  onPendingDedication,
}: HudTalentTreeModalProps) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '1200px', maxHeight: '95vh', overflowY: 'auto', background: 'var(--bs-sky)', border: '1px solid var(--bs-bdr-strong)', boxShadow: '0 8px 48px rgba(0,0,0,.3)', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {charSpecs.map(cs => {
            const ref = refSpecMap[cs.specialization_key]
            const isActive = activeSpecKey === cs.specialization_key
            return (
              <button key={cs.id} onClick={() => setActiveSpecKey(cs.specialization_key)} style={{ background: isActive ? 'var(--bs-red-glow)' : 'var(--bs-card)', border: `1px solid ${isActive ? 'var(--bs-red-sun)' : 'var(--bs-bdr-mid)'}`, padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-caption)', fontWeight: isActive ? 700 : 600, letterSpacing: '0.08em', color: isActive ? 'var(--bs-red-mid)' : 'var(--bs-txt2)' }}>
                {ref?.name || cs.specialization_key}
                {cs.is_starting && <span style={{ fontSize: 'var(--text-overline)', color: 'var(--bs-txt3)', marginLeft: '8px' }}>START</span>}
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
        {talentTreeData ? (
          <TalentTree
            specName={talentTreeData.specName}
            nodes={talentTreeData.nodes}
            connections={talentTreeData.connections}
            onPurchase={async (talentKey, row, col) => {
              if (talentKey === 'DEDI') {
                const newId = await onPurchaseTalent(talentKey, row, col, activeSpecKey!)
                if (newId) onPendingDedication({ talentId: newId, row, col, specKey: activeSpecKey! })
                return
              }
              onPurchaseTalent(talentKey, row, col, activeSpecKey!)
            }}
            onRemoveTalent={isGmMode ? onRemoveTalent : undefined}
            isGmMode={isGmMode}
            xpAvailable={character.xp_available}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-body-sm)', color: 'var(--bs-txt3)' }}>No talent tree data.</div>
        )}
        <button onClick={onClose} style={{ display: 'block', margin: '16px auto 0', background: 'var(--bs-surface)', border: '1px solid var(--bs-bdr-mid)', padding: '12px 32px', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-label)', fontWeight: 600, letterSpacing: '0.15em', color: 'var(--bs-txt2)', cursor: 'pointer' }}>CLOSE</button>
      </div>
    </div>
  )
}
