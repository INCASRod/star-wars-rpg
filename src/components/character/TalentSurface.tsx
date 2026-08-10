'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { TalentTree, type TalentTreeNode, type TalentTreeConnection } from './TalentTree'
import { RichText } from '@/components/ui/RichText'
import { adaptSigAbilityNodes, findCheapestPath, runEnergyTrace, type EnergyGraphNode, type EnergyGraphEdge } from '@/lib/buildTalentTree'
import { useConnectorLayout } from '@/hooks/useConnectorLayout'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { TalentDossier, type DossierNode, type DossierAction } from './TalentDossier'
import { PurchaseCeremony, type TalentCeremonyPayload } from './PurchaseCeremony'
import type { SigAbility, SigAbilityNode, LockedSigAbility, CharacterSigAbilityNode } from '@/lib/types'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, Z, EASE } from '@/lib/tokens'
import connectorStyles from './TalentTree.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// TalentSurface — shared talent-tree + signature-ability layout, extracted
// from the retired HudTalentTreeModal (Prompt 6b). Contains the modal's former
// CONTENTS only — no backdrop, no blur, no click-outside-dismiss, no ✕/CLOSE.
// Modal chrome belongs to whoever mounts this:
//   • owned mode  — /character/[id]/talents route (full-screen shell; the
//     route renders its OWN vertical rail for spec-switching, Prompt 6c —
//     TalentSurface no longer renders a tab bar of any kind)
//   • preview     — SpecSelectorList's SpecTreePreviewModal (its own portal)
//   • creator     — XpInvestmentStep (in-flow, no portal at all)
//
// ─────────────────────────────────────────────────────────────────────────────

function sigCellKey(row: number, col: number): string {
  return row === 0 ? 'base' : `${row}-${col}`
}

// Teal signature-ability accent — no --hud-cyan token exists, so this reuses
// the closest existing --hud-* token (same precedent as TalentsPanel.tsx's
// SPECIES_COLOR, which reuses var(--die-boost) for a non-dice UI accent).
const SIG_TEAL = 'var(--die-boost)'

// Shared stable reference (Prompt 8) — a literal `new Set()` in a prop
// position is a fresh allocation every render, which defeats isOwned's own
// memoization inside SigNodeGrid the same way an unmemoized purchasedRowCols
// does (see LockedSigAbilitySection's comment). Preview mode never has any
// purchased nodes, so one shared empty Set is correct for every caller.
const EMPTY_SIG_ROWCOLS = new Set<string>()

export interface TalentSurfaceSigData {
  availableSigAbilities: SigAbility[]
  lockedSigAbilities: Record<string, LockedSigAbility>
  purchasedSigNodes: CharacterSigAbilityNode[]
  hasUnlockedTier5: boolean
  onLockInSigAbility: (sigAbilityKey: string, specSlot: string) => Promise<void>
  onPurchaseSigNode: (sigAbilityKey: string, node: SigAbilityNode) => Promise<void>
  /** Progressive paint (Prompt 7a) — while true, shows a quiet local loading
      state instead of "No signature abilities available", which would
      otherwise flash incorrectly before the fetch resolves. */
  loading?: boolean
}

export interface TalentSurfaceProps {
  /** Whichever spec's tree/sig-slot is currently displayed — switching it is now the mounting caller's concern (the route's vertical rail, Prompt 6c; preview/creator pass their own single/selected key). TalentSurface only reads it. */
  activeSpecKey: string | null
  talentTreeData: { specName: string; nodes: TalentTreeNode[]; connections: TalentTreeConnection[] } | null
  xpAvailable?: number
  isGmMode?: boolean
  /** Read-only: no purchase flow, all nodes shown as available (mirrors TalentTree's own previewMode). */
  previewMode?: boolean
  /** specKey is always the current activeSpecKey — TalentSurface supplies it, matching the retired modal's own call pattern. Return value is the new character_talents row id (needed for onPendingDedication); creator mode has no DB row and may return void. */
  onPurchaseTalent?: (talentKey: string, row: number, col: number, specKey: string) => void | Promise<string | undefined>
  onRemoveTalent?: (talentKey: string, xpCost: number) => void
  /** DEDI talent purchases need a characteristic choice — bubbles up to whoever owns that flow (the route, today). Omit where DEDI has no special handling (creator mode has none today either). */
  onPendingDedication?: (d: { talentId: string; row: number; col: number; specKey: string; xpCost: number }) => void
  /** Signature-ability section data. Omit entirely to hide the section (preview of an unowned spec, creator). */
  sig?: TalentSurfaceSigData
  /** Progressive paint (Prompt 7a) — true while tree data is still in flight and talentTreeData is legitimately null-because-loading rather than null-because-no-spec-selected. Shows a size-matched skeleton instead of "No talent tree data." so the header/rail can paint before the tree does with no layout shift on arrival. */
  treeLoading?: boolean
  /** Which destination the rail currently has selected (Prompt 7b, Defect 1) — the main content area shows exactly one of these, never both. Defaults to 'tree' so preview/creator (which never pass this or `sig`) are unaffected. */
  contentView?: 'tree' | 'sig'
}

export function TalentSurface({
  activeSpecKey,
  talentTreeData,
  xpAvailable,
  isGmMode,
  previewMode,
  onPurchaseTalent,
  onRemoveTalent,
  onPendingDedication,
  sig,
  treeLoading,
  contentView = 'tree',
}: TalentSurfaceProps) {
  const [expandedAbilityKey, setExpandedAbilityKey] = useState<string | null>(null)
  const [flashActive, setFlashActive] = useState(false)

  const lockedForSlot = sig && activeSpecKey ? sig.lockedSigAbilities[activeSpecKey] : undefined
  const lockedAbility = lockedForSlot
    ? sig?.availableSigAbilities.find(a => a.key === lockedForSlot.sigAbilityKey)
    : undefined

  const handleLockIn = async (sigAbilityKey: string) => {
    if (!activeSpecKey || !sig) return
    await sig.onLockInSigAbility(sigAbilityKey, activeSpecKey)
    setFlashActive(true)
    setTimeout(() => setFlashActive(false), 550)
  }

  return (
    <div className={flashActive ? 'sig-lockin-flash' : undefined}>
      {contentView === 'tree' ? (
        // marginBottom reserves room for a bottom-row plaque's hover expansion
        // (Prompt 7b, Defect 2). RE-MEASURED for the tree-first pass, not
        // scaled from the old number: with the 158px resting plaque (was
        // 140px), the worst real bottom-row talent is cell 4-1, whose
        // un-clamped body at scale(1.05) resolves to 363px — a 205px
        // overshoot (was 148.1px). 220 keeps roughly the same headroom margin
        // the original 160 had over its own 148.1. Applied uniformly across
        // the loading/real/empty states so swapping between them causes no
        // layout shift (same principle as the skeleton's own height, 7a).
        <div style={{ marginBottom: 220 }}>
          {talentTreeData ? (
            <TalentTree
              specName={talentTreeData.specName}
              nodes={talentTreeData.nodes}
              connections={talentTreeData.connections}
              previewMode={previewMode}
              onPurchase={onPurchaseTalent && (async (talentKey, row, col) => {
                if (talentKey === 'DEDI' && onPendingDedication && activeSpecKey) {
                  const newId = await onPurchaseTalent(talentKey, row, col, activeSpecKey)
                  // Same (row+1)*5 formula handlePurchaseTalent uses for xp_cost.
                  if (newId) onPendingDedication({ talentId: newId, row, col, specKey: activeSpecKey, xpCost: (row + 1) * 5 })
                  // Deliberately returns undefined (not `newId`) — DEDI hands
                  // off to the characteristic-choice flow instead of the
                  // generic purchase ceremony (Prompt 9's stated scope
                  // exclusion); TalentTree.tsx treats a falsy result as
                  // "no ceremony," so this opt-out needs no special-casing
                  // on that side.
                  return undefined
                }
                const raw = await onPurchaseTalent(talentKey, row, col, activeSpecKey!)
                return typeof raw === 'string' ? raw : undefined
              })}
              onRemoveTalent={isGmMode ? onRemoveTalent : undefined}
              isGmMode={isGmMode}
              xpAvailable={xpAvailable}
            />
          ) : treeLoading ? (
            <TreeLoadingSkeleton />
          ) : (
            <div style={{ textAlign: 'center', padding: SP[12], fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>No talent tree data.</div>
          )}
        </div>
      ) : (
        sig && activeSpecKey && (
          sig.loading ? (
            <SigLoadingSkeleton />
          ) : lockedForSlot && lockedAbility ? (
            <LockedSigAbilitySection
              locked={lockedForSlot}
              ability={lockedAbility}
              purchasedSigNodes={sig.purchasedSigNodes}
              onPurchaseNode={node => sig.onPurchaseSigNode(lockedForSlot.sigAbilityKey, node)}
              xpAvailable={xpAvailable}
            />
          ) : (
            <SigAbilityBrowseSection
              abilities={sig.availableSigAbilities}
              expandedKey={expandedAbilityKey}
              setExpandedKey={setExpandedAbilityKey}
              hasUnlockedTier5={sig.hasUnlockedTier5}
              onLockIn={handleLockIn}
            />
          )
        )
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PROGRESSIVE-PAINT LOADING SKELETONS (Prompt 7a)
   ══════════════════════════════════════════════════════════════════ */

/** Sized to match TalentTree's real rendered box (header + legend + the grid:
    5×178px rows + 4×44px row gaps — same raw dimensions TalentTree.tsx itself
    uses) so swapping this out for the real tree causes zero layout shift.
    1192px re-measured via live getBoundingClientRect after the tree-first
    resize (was 908px against the old 160px rows) — not estimated, and not
    derived arithmetically, since the header and legend contribute too. */
function TreeLoadingSkeleton() {
  return (
    <div
      style={{
        background: HUD.bg,
        border: `1px solid ${HUD.border}`,
        borderRadius: RADIUS.lg,
        minHeight: 1192,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6 }}>
        Loading talent tree…
      </div>
    </div>
  )
}

function SigLoadingSkeleton() {
  return (
    <div>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase', color: SIG_TEAL,
        marginBottom: SP[2], paddingBottom: SP[1], borderBottom: `1px solid ${HUD.border}`,
      }}>
        ◈ Signature Ability
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint, padding: SP[4], opacity: 0.6 }}>
        Loading…
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

                    <SigNodeGrid
                      baseNode={baseNode}
                      basePurchased={false}
                      nodes={ability.nodes}
                      mode="preview"
                      purchasedRowCols={EMPTY_SIG_ROWCOLS}
                      sigAbilityKey={ability.key}
                      hasUnlockedTier5={hasUnlockedTier5}
                      onLockIn={onLockIn}
                    />
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
  locked, ability, purchasedSigNodes, onPurchaseNode, xpAvailable,
}: {
  locked: LockedSigAbility
  ability: SigAbility
  purchasedSigNodes: CharacterSigAbilityNode[]
  onPurchaseNode: (node: SigAbilityNode) => void | Promise<void>
  xpAvailable?: number
}) {
  // Memoized (Prompt 8) — a fresh Set every render defeats isOwned's own
  // useCallback memoization inside SigNodeGrid (same bars-churn mechanism as
  // the comment in TalentTree.tsx / SigNodeGrid describes).
  const purchasedRowCols = useMemo(() => new Set(
    purchasedSigNodes
      .filter(n => n.sig_ability_key === ability.key && n.spec_slot === locked.specSlot)
      .map(n => `${n.row_index}-${n.col_index}`),
  ), [purchasedSigNodes, ability.key, locked.specSlot])
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

        <SigNodeGrid
          baseNode={baseNode}
          basePurchased
          nodes={ability.nodes}
          mode="interactive"
          purchasedRowCols={purchasedRowCols}
          onPurchaseNode={onPurchaseNode}
          sigAbilityKey={ability.key}
          xpAvailable={xpAvailable}
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

function SigBaseNodeCard({ node, purchased, onClick }: { node: SigAbilityNode; purchased: boolean; onClick: () => void }) {
  if (purchased) {
    // Owned-plate treatment (matches TalentTree's Plaque): solid plate body,
    // dark plate text, inline tick box instead of a floating "Owned" badge,
    // cost removed entirely. Sig nodes have no ranked concept, so there is
    // no Rank: row here — nothing further to show once owned.
    return (
      <div
        onClick={onClick}
        style={{
          borderRadius: RADIUS.md, padding: `${SP[2]} ${SP[3]}`, marginBottom: SP[2],
          position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer',
          background: 'var(--plaque-plate)',
          border: '1.5px solid var(--plaque-plate)',
          boxShadow: '0 0 14px var(--hud-glow), inset 0 1px 0 color-mix(in srgb, white 25%, transparent)',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 13, height: 13, flexShrink: 0, borderRadius: RADIUS.sm,
            background: 'var(--plaque-plate-text)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, lineHeight: 1, color: 'var(--plaque-plate)',
          }}>✓</span>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: 'var(--plaque-plate-text)' }}>
            {node.name}
          </span>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'color-mix(in srgb, var(--plaque-plate-text) 88%, transparent)', lineHeight: 1.5 }}>
          <RichText text={node.description} />
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: RADIUS.md, padding: `${SP[2]} ${SP[3]}`, marginBottom: SP[2],
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer',
        background: `color-mix(in srgb, ${SIG_TEAL} 4%, transparent)`,
        border: '1.5px solid var(--plaque-avail-accent)',
        boxShadow: '0 0 10px color-mix(in srgb, var(--plaque-avail-accent) 45%, transparent)',
      }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: SIG_TEAL, paddingRight: 60 }}>
        {node.name}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textDim, lineHeight: 1.5 }}>
        <RichText text={node.description} />
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 800, color: 'var(--plaque-avail-accent)', alignSelf: 'flex-end' }}>
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
  baseNode, basePurchased, nodes, mode, purchasedRowCols, onPurchaseNode,
  sigAbilityKey, hasUnlockedTier5 = false, onLockIn, xpAvailable,
}: {
  baseNode?: SigAbilityNode
  basePurchased: boolean
  nodes: SigAbilityNode[]
  mode: 'preview' | 'interactive'
  purchasedRowCols: Set<string>
  onPurchaseNode?: (node: SigAbilityNode) => void | Promise<void>
  sigAbilityKey: string
  /** Only meaningful (and only wired by the caller) when basePurchased is false — the base node is already locked in otherwise, so this branch is unreachable. */
  hasUnlockedTier5?: boolean
  onLockIn?: (sigAbilityKey: string) => void | Promise<void>
  xpAvailable?: number
}) {
  const upgradeNodes = nodes.filter(n => n.rowIndex > 0)
  const containerRef = useRef<HTMLDivElement>(null)
  // Carries whichever visual state ('purchased'/'available'/'locked') was
  // already computed for this node by the render loop below (or, for the
  // base node, derived the same way SigBaseNodeCard's own `purchased` prop
  // is) — the dossier action is built from that captured state, not by
  // recomputing eligibility.
  const [selectedSig, setSelectedSig] = useState<{ node: SigAbilityNode; state: 'purchased' | 'available' | 'locked' } | null>(null)

  // Connections only (not the adapter's `nodes` output — the sig cards here
  // still render from raw SigAbilityNode, unchanged this prompt; see the
  // adapter's own header comment for why that's still true).
  const { connections } = useMemo(
    () => adaptSigAbilityNodes(nodes, purchasedRowCols),
    [nodes, purchasedRowCols],
  )

  // Stabilized (Prompt 8) — an inline closure here churns identity every
  // render, which cascades through useConnectorLayout into a brand-new
  // `bars` array reference every render (not just when geometry actually
  // changes). Harmless before the energy trace existed; fatal to it now — see
  // the matching comment in TalentTree.tsx for the full mechanism.
  const isOwned = useCallback(
    (row: number, col: number) => row === 0 ? basePurchased : (mode === 'interactive' && purchasedRowCols.has(`${row}-${col}`)),
    [basePurchased, mode, purchasedRowCols],
  )

  const bars = useConnectorLayout({
    containerRef,
    connections,
    cellKey: sigCellKey,
    isOwned,
    deps: [mode],
  })

  // ── Energy trace (Prompt 8) — same helper, same rendering approach as
  // TalentTree.tsx. Owned state here mirrors useConnectorLayout's own
  // isOwned above exactly (base uses basePurchased; upgrades use
  // purchasedRowCols), so the graph agrees with what's already on screen.
  const prefersReducedMotion = usePrefersReducedMotion()
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const graph = useMemo(() => ({
    nodes: nodes.map((n): EnergyGraphNode => ({
      key: sigCellKey(n.rowIndex, n.colIndex),
      cost: n.xpCost,
      owned: n.rowIndex === 0 ? basePurchased : (mode === 'interactive' && purchasedRowCols.has(`${n.rowIndex}-${n.colIndex}`)),
      isEntryPoint: n.rowIndex === 0,
    })),
    edges: connections.map((c): EnergyGraphEdge => ({
      from: sigCellKey(c.fromRow, c.fromCol), to: sigCellKey(c.toRow, c.toCol),
    })),
  }), [nodes, connections, basePurchased, purchasedRowCols, mode])

  const activePath = useMemo(() => {
    if (!hoveredKey) return null
    return findCheapestPath(graph.nodes, graph.edges, hoveredKey)
  }, [hoveredKey, graph])

  useEffect(() => {
    if (!activePath || !containerRef.current) return
    const handle = runEnergyTrace(containerRef.current, bars, activePath.path, { reducedMotion: prefersReducedMotion })
    return () => handle.kill()
  }, [activePath, bars, prefersReducedMotion])

  const [chipPos, setChipPos] = useState<{ top: number; left: number } | null>(null)
  useEffect(() => {
    const container = containerRef.current
    if (!activePath || !container) { setChipPos(null); return }
    const containerRect = container.getBoundingClientRect()
    const targetEl = container.querySelector<HTMLElement>(`[data-cell-key="${activePath.path[activePath.path.length - 1]}"]`)
    if (!targetEl) { setChipPos(null); return }
    const targetRect = targetEl.getBoundingClientRect()
    const CHIP_HEIGHT = 24
    const CHIP_WIDTH = 190
    const top = targetRect.top - containerRect.top
    const placeAbove = top > CHIP_HEIGHT + 10
    const rawLeft = targetRect.left - containerRect.left + targetRect.width / 2
    const clampedLeft = Math.min(Math.max(rawLeft, CHIP_WIDTH / 2 + 4), containerRect.width - CHIP_WIDTH / 2 - 4)
    setChipPos({
      top: placeAbove ? top - CHIP_HEIGHT - 8 : targetRect.bottom - containerRect.top + 8,
      left: clampedLeft,
    })
  }, [activePath])

  // ── Purchase ceremony (Prompt 9) — mirrors TalentTree.tsx's own wiring.
  // purchaseNode (useCharacterSigAbilities.ts) has no explicit success/
  // failure return, only resolve-or-throw, so success here is "didn't
  // throw" rather than a truthy result.
  const [ceremony, setCeremony] = useState<{ payload: TalentCeremonyPayload; xpBefore: number; xpAfter: number } | null>(null)

  const dossierNode: DossierNode | null = selectedSig ? {
    key:         selectedSig.node.nodeKey,
    name:        selectedSig.node.name,
    description: selectedSig.node.description,
    cost:        selectedSig.node.xpCost,
    tierLabel:   selectedSig.node.rowIndex === 0 ? 'Base Ability' : `Tier ${selectedSig.node.rowIndex}`,
    // activation / isForceTalent / isRanked intentionally omitted — no such
    // concept exists on SigAbilityNode; the dossier already degrades
    // gracefully by simply not rendering those tags.
  } : null

  const dossierAction: DossierAction | null = (() => {
    if (!selectedSig) return null
    const { node: n, state } = selectedSig

    if (n.rowIndex === 0) {
      if (state === 'purchased') return { kind: 'owned' }
      return {
        kind: 'lockIn',
        disabledReason: hasUnlockedTier5 ? undefined : 'Only available when Tier 5 talents are unlocked in this specialisation.',
        onConfirm: () => onLockIn?.(sigAbilityKey),
      }
    }

    if (state === 'purchased') return { kind: 'owned' }
    // 'available' is a display-only value in preview mode (the render loop
    // below sets it unconditionally when mode !== 'interactive', purely so
    // preview nodes don't render dashed-out) — the original inline
    // eligibility gate was always `mode === 'interactive' && state ===
    // 'available'`, never state alone. Mirror that exactly rather than
    // trusting `state` on its own, or a not-locked-in ability would show a
    // live Purchase button.
    if (mode !== 'interactive') {
      return {
        kind: 'locked',
        reasonIcon: '🔒',
        reasonTitle: 'Locked',
        reasonText: 'Lock in this signature ability first.',
      }
    }
    if (state === 'locked') {
      return {
        kind: 'locked',
        reasonIcon: '🔒',
        reasonTitle: 'Locked',
        reasonText: 'Purchase adjacent nodes first.',
      }
    }
    return {
      kind: 'purchase',
      onConfirm: async () => {
        if (!onPurchaseNode) return
        setHoveredKey(null) // kill any live energy trace before the ceremony takes over
        const cellKey = sigCellKey(n.rowIndex, n.colIndex)
        const sourceEl = containerRef.current?.querySelector<HTMLElement>(`[data-cell-key="${cellKey}"]`)
        const rect = sourceEl?.getBoundingClientRect()
        const sourceRect = rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null
        const xpBefore = xpAvailable ?? n.xpCost
        try {
          await onPurchaseNode(n)
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Failed to purchase signature ability node.')
          return
        }
        setCeremony({
          payload: {
            kind: 'talent', name: n.name, cost: n.xpCost,
            activationBg: 'var(--hud-surface-hi)', activationText: SIG_TEAL,
            isForceTalent: false, sourceRect,
          },
          xpBefore, xpAfter: xpBefore - n.xpCost,
        })
      },
    }
  })()

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {baseNode && (
        <div data-cell-key="base">
          <SigBaseNodeCard
            node={baseNode}
            purchased={basePurchased}
            onClick={() => setSelectedSig({ node: baseNode, state: basePurchased ? 'purchased' : 'available' })}
          />
        </div>
      )}

      {/* Measured-DOM connector bars — behind node cards (Z.base < default stacking) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: Z.base, pointerEvents: 'none' }}>
        {bars.map(bar => (
          <div
            key={bar.id}
            data-bar-id={bar.id}
            className={bar.active ? connectorStyles.linkBarActive : connectorStyles.linkBar}
            style={{ top: bar.top, left: bar.left, width: bar.width, height: bar.height }}
          />
        ))}
      </div>

      {/* Energy-trace cost chip (Prompt 8) */}
      {activePath && chipPos && (
        <div
          style={{
            position: 'absolute', top: chipPos.top, left: chipPos.left, transform: 'translateX(-50%)',
            zIndex: Z.tooltip, pointerEvents: 'none',
            background: 'var(--hud-surface-hi)', border: '1px solid var(--path-glow)',
            borderRadius: RADIUS.sm, padding: '3px 10px',
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--path-glow)', whiteSpace: 'nowrap',
            boxShadow: '0 0 12px var(--path-glow)',
          }}
        >
          PATH: {activePath.totalCost} XP · {activePath.purchaseCount} TALENT{activePath.purchaseCount === 1 ? '' : 'S'}
        </div>
      )}

      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: '112px', gap: SP[2] }}>
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
            <div
              key={key}
              data-cell-key={key}
              style={{ gridColumn: node.colIndex + 1, gridRow: node.rowIndex }}
              onMouseEnter={state === 'locked' ? () => setHoveredKey(sigCellKey(node.rowIndex, node.colIndex)) : undefined}
              onMouseLeave={state === 'locked' ? () => {
                // Same enter/leave-ordering guard as TalentTree.tsx.
                const k = sigCellKey(node.rowIndex, node.colIndex)
                setHoveredKey(prev => (prev === k ? null : prev))
              } : undefined}
            >
              <SigNodeCard
                node={node}
                state={state}
                onClick={() => setSelectedSig({ node, state })}
              />
            </div>
          )
        })}
      </div>

      <TalentDossier
        node={dossierNode}
        action={dossierAction}
        onClose={() => setSelectedSig(null)}
      />

      {ceremony && (
        <PurchaseCeremony
          payload={ceremony.payload}
          xpBefore={ceremony.xpBefore}
          xpAfter={ceremony.xpAfter}
          reducedMotion={prefersReducedMotion}
          onDone={() => setCeremony(null)}
        />
      )}
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

  if (state === 'purchased') {
    // Owned-plate treatment (matches TalentTree's Plaque): solid plate body,
    // dark plate text, inline tick box instead of a floating "Owned" badge,
    // cost removed entirely. No Rank: row — sig nodes have no ranked concept.
    return (
      <div
        onClick={onClick}
        style={{
          borderRadius: RADIUS.md, padding: '8px 10px', height: '100%', width: '100%',
          position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden', cursor: 'pointer',
          background: 'var(--plaque-plate)',
          border: '1.5px solid var(--plaque-plate)',
          boxShadow: '0 0 14px var(--hud-glow), inset 0 1px 0 color-mix(in srgb, white 25%, transparent)',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 12, height: 12, flexShrink: 0, borderRadius: RADIUS.sm,
            background: 'var(--plaque-plate-text)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, lineHeight: 1, color: 'var(--plaque-plate)',
          }}>✓</span>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: 'var(--plaque-plate-text)', lineHeight: 1.25 }}>
            {node.name}
          </span>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'color-mix(in srgb, var(--plaque-plate-text) 88%, transparent)', lineHeight: 1.4, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <RichText text={node.description} />
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
          background: hovered ? 'color-mix(in srgb, var(--plaque-avail-accent) 12%, transparent)' : 'color-mix(in srgb, var(--plaque-avail-accent) 5%, transparent)',
          border: `1.5px solid ${hovered ? 'var(--plaque-avail-accent)' : 'color-mix(in srgb, var(--plaque-avail-accent) 55%, transparent)'}`,
          boxShadow: '0 0 10px color-mix(in srgb, var(--plaque-avail-accent) 40%, transparent)',
          cursor: 'pointer',
          transition: EASE.default,
        }}
      >
        <div style={{
          position: 'absolute', top: 5, right: 5,
          background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.border}`,
          borderRadius: RADIUS.sm, padding: '1px 5px',
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 800, color: 'var(--plaque-avail-accent)', lineHeight: 1.4,
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

  /* locked — clickable to view the reason in the dossier, matching the spec tree.
     Retuned (owned-plate treatment, Step 3): ~28%/60% opacity, was 42%/82%. */
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: RADIUS.md, padding: '8px 10px', height: '100%', width: '100%',
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden', cursor: 'pointer',
        background: hovered ? `color-mix(in srgb, ${SIG_TEAL} 5%, transparent)` : `color-mix(in srgb, ${SIG_TEAL} 1%, transparent)`,
        border: `1px dashed color-mix(in srgb, ${SIG_TEAL} ${hovered ? 20 : 10}%, transparent)`,
        filter: `saturate(${hovered ? 0.55 : 0.35})`,
        opacity: hovered ? 0.6 : 0.28,
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
