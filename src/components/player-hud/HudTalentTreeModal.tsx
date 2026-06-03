'use client'

import { TalentTree, type TalentTreeNode, type TalentTreeConnection } from '@/components/character/TalentTree'
import { BuySpecButton } from './BuySpecButton'
import type { Character, CharacterSpecialization, RefSpecialization, RefTalent } from '@/lib/types'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, Z, EASE } from '@/lib/tokens'

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
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: Z.overlay, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: SP[6] }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '1200px', maxHeight: '95vh', overflowY: 'auto', background: HUD.bg, border: '1px solid var(--hud-border-strong)', boxShadow: '0 8px 48px rgba(0,0,0,.3)', padding: SP[4] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], marginBottom: SP[3], flexWrap: 'wrap' }}>
          {charSpecs.map(cs => {
            const ref = refSpecMap[cs.specialization_key]
            const isActive = activeSpecKey === cs.specialization_key
            return (
              <button key={cs.id} onClick={() => setActiveSpecKey(cs.specialization_key)} style={{ background: isActive ? 'color-mix(in srgb, var(--hud-accent) 10%, transparent)' : HUD.panel, border: `1px solid ${isActive ? HUD.gold : HUD.borderHi}`, padding: `${SP[2]} ${SP[4]}`, cursor: 'pointer', fontFamily: FONT_DISPLAY, fontSize: FS.caption, fontWeight: isActive ? 700 : 600, letterSpacing: '0.08em', color: isActive ? HUD.gold : HUD.textDim }}>
                {ref?.name || cs.specialization_key}
                {cs.is_starting && <span style={{ fontSize: FS.overline, color: HUD.textFaint, marginLeft: SP[2] }}>START</span>}
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
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            style={{
              fontFamily: FONT_BODY,
              fontSize: FS.sm,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--hud-text-dim)',
              padding: `${SP[1]} ${SP[2]}`,
              borderRadius: RADIUS.sm,
              lineHeight: 1,
              transition: `color ${EASE.quick}`,
            }}
          >
            ✕
          </button>
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
          <div style={{ textAlign: 'center', padding: SP[12], fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>No talent tree data.</div>
        )}
        <button onClick={onClose} style={{ display: 'block', margin: `${SP[4]} auto 0`, background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.borderHi}`, padding: `${SP[3]} ${SP[8]}`, fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 600, letterSpacing: '0.15em', color: HUD.textDim, cursor: 'pointer' }}>CLOSE</button>
      </div>
    </div>
  )
}
