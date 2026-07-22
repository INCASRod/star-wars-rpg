'use client'

import { useRef, useState } from 'react'
import { TalentTree, type TalentTreeNode, type TalentTreeConnection } from '@/components/character/TalentTree'
import { BuySpecButton } from './BuySpecButton'
import { RichText } from '@/components/ui/RichText'
import type {
  Character, CharacterSpecialization, RefSpecialization, RefTalent,
  SigAbility, SigAbilityNode, LockedSigAbility, CharacterSigAbilityNode,
} from '@/lib/types'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, Z, EASE } from '@/lib/tokens'

// Teal signature-ability accent — no --hud-cyan token exists, so this reuses
// the closest existing --hud-* token (same precedent as TalentsPanel.tsx's
// SPECIES_COLOR, which reuses var(--die-boost) for a non-dice UI accent).
const SIG_TEAL = 'var(--die-boost)'

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
  careerSpecKeys: Set<string>
  specKeyToCareerName: Record<string, string>
  isGmMode: boolean
  onPurchaseTalent: (talentKey: string, row: number, col: number, specKey: string) => Promise<string | undefined>
  onRemoveTalent: ((talentId: string, xpCost: number) => void) | undefined
  onBuySpecialization: (specKey: string, setSpecKey: (k: string) => void) => void
  onPendingDedication: (d: { talentId: string; row: number; col: number; specKey: string; xpCost: number }) => void
  availableSigAbilities: SigAbility[]
  lockedSigAbilities: Record<string, LockedSigAbility>
  purchasedSigNodes: CharacterSigAbilityNode[]
  hasUnlockedTier5: boolean
  onLockInSigAbility: (sigAbilityKey: string, specSlot: string) => Promise<void>
  onPurchaseSigNode: (sigAbilityKey: string, node: SigAbilityNode) => Promise<void>
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
  careerSpecKeys,
  specKeyToCareerName,
  isGmMode,
  onPurchaseTalent,
  onRemoveTalent,
  onBuySpecialization,
  onPendingDedication,
  availableSigAbilities,
  lockedSigAbilities,
  purchasedSigNodes,
  hasUnlockedTier5,
  onLockInSigAbility,
  onPurchaseSigNode,
}: HudTalentTreeModalProps) {
  const sigSectionRef = useRef<HTMLDivElement>(null)
  const [expandedAbilityKey, setExpandedAbilityKey] = useState<string | null>(null)
  const [flashActive, setFlashActive] = useState(false)

  if (!open) return null

  const lockedForSlot = activeSpecKey ? lockedSigAbilities[activeSpecKey] : undefined
  const lockedAbility = lockedForSlot
    ? availableSigAbilities.find(a => a.key === lockedForSlot.sigAbilityKey)
    : undefined

  const handleLockIn = async (sigAbilityKey: string) => {
    if (!activeSpecKey) return
    await onLockInSigAbility(sigAbilityKey, activeSpecKey)
    setFlashActive(true)
    setTimeout(() => setFlashActive(false), 550)
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: Z.overlay, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: SP[6] }}>
      <div
        onClick={e => e.stopPropagation()}
        className={flashActive ? 'sig-lockin-flash' : undefined}
        style={{ width: '100%', maxWidth: '1200px', maxHeight: '95vh', overflowY: 'auto', background: HUD.bg, border: '1px solid var(--hud-border-strong)', boxShadow: '0 8px 48px rgba(0,0,0,.3)', padding: SP[4] }}
      >
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
            careerSpecKeys={careerSpecKeys}
            specKeyToCareerName={specKeyToCareerName}
            onBuy={specKey => onBuySpecialization(specKey, setActiveSpecKey)}
          />
          {activeSpecKey && !lockedForSlot && (
            <button
              onClick={() => sigSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              style={{
                background: `color-mix(in srgb, ${SIG_TEAL} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${SIG_TEAL} 40%, transparent)`,
                padding: `${SP[2]} ${SP[4]}`,
                cursor: 'pointer',
                fontFamily: FONT_DISPLAY,
                fontSize: FS.caption,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: SIG_TEAL,
              }}
            >
              ◈ Add Signature Ability
            </button>
          )}
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
                // Same (row+1)*5 formula handlePurchaseTalent uses for xp_cost.
                if (newId) onPendingDedication({ talentId: newId, row, col, specKey: activeSpecKey!, xpCost: (row + 1) * 5 })
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

        {activeSpecKey && (
          <div ref={sigSectionRef} style={{ marginTop: SP[6] }}>
            {lockedForSlot && lockedAbility ? (
              <LockedSigAbilitySection
                locked={lockedForSlot}
                ability={lockedAbility}
                purchasedSigNodes={purchasedSigNodes}
                onPurchaseNode={node => onPurchaseSigNode(lockedForSlot.sigAbilityKey, node)}
              />
            ) : (
              <SigAbilityBrowseSection
                abilities={availableSigAbilities}
                expandedKey={expandedAbilityKey}
                setExpandedKey={setExpandedAbilityKey}
                hasUnlockedTier5={hasUnlockedTier5}
                onLockIn={handleLockIn}
              />
            )}
          </div>
        )}

        <button onClick={onClose} style={{ display: 'block', margin: `${SP[4]} auto 0`, background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.borderHi}`, padding: `${SP[3]} ${SP[8]}`, fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 600, letterSpacing: '0.15em', color: HUD.textDim, cursor: 'pointer' }}>CLOSE</button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SIGNATURE ABILITY — BROWSE SECTION (no ability locked for this spec)
   ══════════════════════════════════════════════════════════════════ */

function SigAbilityBrowseSection({
  abilities, expandedKey, setExpandedKey, hasUnlockedTier5, onLockIn,
}: {
  abilities: SigAbility[]
  expandedKey: string | null
  setExpandedKey: (key: string | null) => void
  hasUnlockedTier5: boolean
  onLockIn: (sigAbilityKey: string) => void
}) {
  return (
    <div>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase', color: SIG_TEAL,
        marginBottom: SP[2], paddingBottom: SP[1], borderBottom: `1px solid ${HUD.border}`,
      }}>
        ◈ Signature Ability
      </div>

      {abilities.length === 0 ? (
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint, padding: SP[4] }}>
          No signature abilities available for this career.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
          {abilities.map(ability => {
            const baseNode = ability.nodes.find(n => n.rowIndex === 0)
            const isExpanded = expandedKey === ability.key
            return (
              <div key={ability.key} style={{ border: `1px solid ${HUD.borderHi}`, borderRadius: RADIUS.md, overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedKey(isExpanded ? null : ability.key)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: SP[2],
                    background: 'var(--hud-surface-lo)', border: 'none', cursor: 'pointer',
                    padding: `${SP[2]} ${SP[3]}`, textAlign: 'left',
                  }}
                >
                  <span style={{ color: SIG_TEAL, fontSize: FS.sm }}>◈</span>
                  <span style={{ flex: 1, fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: HUD.text }}>
                    {ability.name}
                  </span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textFaint }}>
                    {baseNode?.xpCost ?? 30} XP
                  </span>
                  <span style={{ color: HUD.textFaint, fontSize: FS.label, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: `transform ${EASE.quick}` }}>▾</span>
                </button>

                {isExpanded && (
                  <div style={{ padding: SP[3], borderTop: `1px solid ${HUD.border}` }}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textDim, lineHeight: 1.5, marginBottom: SP[3] }}>
                      <RichText text={ability.description} />
                    </div>

                    {baseNode && <SigBaseNodeCard node={baseNode} purchased={false} />}

                    <SigNodeGrid nodes={ability.nodes} mode="preview" purchasedRowCols={new Set()} />

                    <button
                      onClick={() => hasUnlockedTier5 && onLockIn(ability.key)}
                      disabled={!hasUnlockedTier5}
                      style={{
                        width: '100%', marginTop: SP[3],
                        background: hasUnlockedTier5 ? `color-mix(in srgb, ${SIG_TEAL} 14%, transparent)` : 'var(--hud-surface-lo)',
                        border: `1px solid ${hasUnlockedTier5 ? `color-mix(in srgb, ${SIG_TEAL} 50%, transparent)` : HUD.border}`,
                        borderRadius: RADIUS.md,
                        padding: `${SP[2]} 0`,
                        fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700, letterSpacing: '0.1em',
                        color: hasUnlockedTier5 ? SIG_TEAL : HUD.textFaint,
                        cursor: hasUnlockedTier5 ? 'pointer' : 'not-allowed',
                      }}
                    >
                      ◈ Add Signature Ability — {baseNode?.xpCost ?? 30} XP
                    </button>
                    {!hasUnlockedTier5 && (
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, textAlign: 'center', marginTop: SP[1] }}>
                        Only available when Tier 5 talents are unlocked in this specialisation
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SIGNATURE ABILITY — LOCKED SECTION (base node already purchased)
   ══════════════════════════════════════════════════════════════════ */

function LockedSigAbilitySection({
  locked, ability, purchasedSigNodes, onPurchaseNode,
}: {
  locked: LockedSigAbility
  ability: SigAbility
  purchasedSigNodes: CharacterSigAbilityNode[]
  onPurchaseNode: (node: SigAbilityNode) => void
}) {
  const purchasedRowCols = new Set(
    purchasedSigNodes
      .filter(n => n.sig_ability_key === ability.key && n.spec_slot === locked.specSlot)
      .map(n => `${n.row_index}-${n.col_index}`),
  )
  const baseNode = ability.nodes.find(n => n.rowIndex === 0)

  return (
    <div className="sig-locked-drop-in">
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase', color: SIG_TEAL,
        marginBottom: SP[2], paddingBottom: SP[1], borderBottom: `1px solid ${HUD.border}`,
      }}>
        ◈ Signature Ability
      </div>

      <div style={{ border: `1px solid ${HUD.borderHi}`, borderRadius: RADIUS.md, padding: SP[3] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], marginBottom: SP[2] }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: SIG_TEAL, flex: 1 }}>
            {ability.name}
          </span>
          <span style={{
            background: 'color-mix(in srgb, var(--hud-gold) 13%, transparent)',
            border: '1px solid color-mix(in srgb, var(--hud-gold) 45%, transparent)',
            borderRadius: RADIUS.sm, padding: '1px 8px',
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            color: HUD.gold, letterSpacing: '0.1em',
          }}>
            LOCKED IN
          </span>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textDim, lineHeight: 1.5, marginBottom: SP[3] }}>
          <RichText text={ability.description} />
        </div>

        {baseNode && <SigBaseNodeCard node={baseNode} purchased />}

        <SigNodeGrid
          nodes={ability.nodes}
          mode="interactive"
          purchasedRowCols={purchasedRowCols}
          onPurchaseNode={onPurchaseNode}
        />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SIGNATURE ABILITY — BASE NODE CARD (row 0, full width)
   Sits above the upgrade grid, below the flavour description. Reuses the
   same purchased/available treatment as SigNodeCard below, just full-width
   instead of a single grid cell — this node isn't part of the row>0
   upgrade grid, it's the ability's own activation text + 30 XP cost.
   ══════════════════════════════════════════════════════════════════ */

function SigBaseNodeCard({ node, purchased }: { node: SigAbilityNode; purchased: boolean }) {
  if (purchased) {
    return (
      <div style={{
        borderRadius: RADIUS.md, padding: `${SP[2]} ${SP[3]}`, marginBottom: SP[2],
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 4,
        background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
        border: '1.5px solid color-mix(in srgb, var(--hud-accent) 55%, transparent)',
        boxShadow: '0 0 14px color-mix(in srgb, var(--hud-accent) 12%, transparent), inset 0 1px 0 color-mix(in srgb, var(--hud-accent) 18%, transparent)',
      }}>
        <div style={{
          position: 'absolute', top: 8, right: 10,
          background: 'color-mix(in srgb, var(--state-success) 15%, transparent)',
          border: '1px solid color-mix(in srgb, var(--state-success) 40%, transparent)',
          borderRadius: RADIUS.sm, padding: '1px 5px',
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, color: 'var(--state-success)', lineHeight: 1.4,
        }}>
          ✓ Owned
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: HUD.gold, paddingRight: 60 }}>
          {node.name}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textDim, lineHeight: 1.5 }}>
          <RichText text={node.description} />
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, alignSelf: 'flex-end' }}>
          {node.xpCost} XP
        </div>
      </div>
    )
  }

  return (
    <div style={{
      borderRadius: RADIUS.md, padding: `${SP[2]} ${SP[3]}`, marginBottom: SP[2],
      position: 'relative', display: 'flex', flexDirection: 'column', gap: 4,
      background: `color-mix(in srgb, ${SIG_TEAL} 4%, transparent)`,
      border: `1.5px solid color-mix(in srgb, ${SIG_TEAL} 30%, transparent)`,
    }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: SIG_TEAL, paddingRight: 60 }}>
        {node.name}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textDim, lineHeight: 1.5 }}>
        <RichText text={node.description} />
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: SIG_TEAL, alignSelf: 'flex-end' }}>
        {node.xpCost} XP
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SIGNATURE ABILITY — 4-COLUMN NODE GRID (mirrors TalentTree's
   locked/available/purchased visual logic and connector pattern)
   ══════════════════════════════════════════════════════════════════ */

function SigNodeGrid({
  nodes, mode, purchasedRowCols, onPurchaseNode,
}: {
  nodes: SigAbilityNode[]
  mode: 'preview' | 'interactive'
  purchasedRowCols: Set<string>
  onPurchaseNode?: (node: SigAbilityNode) => void
}) {
  const upgradeNodes = nodes.filter(n => n.rowIndex > 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: '112px', gap: SP[2] }}>
      {upgradeNodes.map(node => {
        const key = `${node.rowIndex}-${node.colIndex}`
        const isPurchased = mode === 'interactive' && purchasedRowCols.has(key)

        let canPurchase = false
        if (mode === 'interactive' && !isPurchased) {
          if (node.connectUp) {
            // The base node (row 0) always spans all 4 columns and is always
            // already purchased by the time this grid renders (it's what
            // unlocks the section) — so "up" from row 1 is always satisfied.
            canPurchase = canPurchase || node.rowIndex - 1 === 0 || purchasedRowCols.has(`${node.rowIndex - 1}-${node.colIndex}`)
          }
          if (node.connectDown) canPurchase = canPurchase || purchasedRowCols.has(`${node.rowIndex + 1}-${node.colIndex}`)
          if (node.connectLeft && node.colIndex > 0) canPurchase = canPurchase || purchasedRowCols.has(`${node.rowIndex}-${node.colIndex - 1}`)
          if (node.connectRight && node.colIndex < 3) canPurchase = canPurchase || purchasedRowCols.has(`${node.rowIndex}-${node.colIndex + 1}`)
        }

        const state: 'purchased' | 'available' | 'locked' = isPurchased
          ? 'purchased'
          : (mode === 'preview' || canPurchase) ? 'available' : 'locked'

        return (
          <div key={key} style={{ gridColumn: node.colIndex + 1, gridRow: node.rowIndex }}>
            <SigNodeCard
              node={node}
              state={state}
              onClick={() => { if (mode === 'interactive' && state === 'available' && onPurchaseNode) onPurchaseNode(node) }}
            />
          </div>
        )
      })}
    </div>
  )
}

function SigNodeCard({
  node, state, onClick,
}: {
  node: SigAbilityNode
  state: 'purchased' | 'available' | 'locked'
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const clickable = state !== 'locked'

  if (state === 'purchased') {
    // Same gold "purchased" treatment as TalentTree's NodeCard.
    return (
      <div style={{
        borderRadius: RADIUS.md, padding: '8px 10px', height: '100%', width: '100%',
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden',
        background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
        border: '1.5px solid color-mix(in srgb, var(--hud-accent) 55%, transparent)',
        boxShadow: '0 0 14px color-mix(in srgb, var(--hud-accent) 12%, transparent), inset 0 1px 0 color-mix(in srgb, var(--hud-accent) 18%, transparent)',
      }}>
        <div style={{
          position: 'absolute', top: 5, right: 5,
          background: 'color-mix(in srgb, var(--state-success) 15%, transparent)',
          border: '1px solid color-mix(in srgb, var(--state-success) 40%, transparent)',
          borderRadius: RADIUS.sm, padding: '1px 5px',
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, color: 'var(--state-success)', lineHeight: 1.4,
        }}>
          ✓ Owned
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: HUD.gold, lineHeight: 1.25, paddingRight: 44 }}>
          {node.name}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, lineHeight: 1.4, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <RichText text={node.description} />
        </div>
        <div style={{ position: 'absolute', bottom: 5, right: 6, fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
          {node.xpCost} XP
        </div>
      </div>
    )
  }

  if (state === 'available') {
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: RADIUS.md, padding: '8px 10px', height: '100%', width: '100%',
          position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden',
          background: hovered ? `color-mix(in srgb, ${SIG_TEAL} 8%, transparent)` : `color-mix(in srgb, ${SIG_TEAL} 3%, transparent)`,
          border: `1.5px solid ${hovered ? `color-mix(in srgb, ${SIG_TEAL} 55%, transparent)` : `color-mix(in srgb, ${SIG_TEAL} 25%, transparent)`}`,
          cursor: clickable ? 'pointer' : 'default',
          transition: EASE.default,
        }}
      >
        <div style={{
          position: 'absolute', top: 5, right: 5,
          background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.border}`,
          borderRadius: RADIUS.sm, padding: '1px 5px',
          fontFamily: FONT_BODY, fontSize: FS.overline, color: SIG_TEAL, lineHeight: 1.4,
        }}>
          {node.xpCost} XP
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: HUD.text, lineHeight: 1.25, paddingRight: 44 }}>
          {node.name}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, lineHeight: 1.4, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <RichText text={node.description} />
        </div>
      </div>
    )
  }

  /* locked */
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: RADIUS.md, padding: '8px 10px', height: '100%', width: '100%',
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden',
        background: hovered ? `color-mix(in srgb, ${SIG_TEAL} 5%, transparent)` : `color-mix(in srgb, ${SIG_TEAL} 1%, transparent)`,
        border: `1px dashed color-mix(in srgb, ${SIG_TEAL} ${hovered ? 20 : 10}%, transparent)`,
        opacity: hovered ? 0.82 : 0.42,
        transition: EASE.default,
      }}
    >
      <div style={{ position: 'absolute', top: 5, right: 5, fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
        🔒 {node.xpCost} XP
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: hovered ? HUD.text : HUD.textFaint, lineHeight: 1.25, paddingRight: 52 }}>
        {node.name}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, lineHeight: 1.4, overflowY: 'auto', flex: 1, minHeight: 0, opacity: hovered ? 0.9 : 0.5 }}>
        <RichText text={node.description} />
      </div>
    </div>
  )
}
