'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { MarkupText } from '@/components/ui/MarkupText'
import { HUD, FS, FONT_BODY, RADIUS, Z } from '@/lib/tokens'
import { useConnectorLayout } from '@/hooks/useConnectorLayout'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  findCheapestPath, runEnergyTrace,
  type EnergyGraphNode, type EnergyGraphEdge,
} from '@/lib/buildTalentTree'
import { useCursorSheen, LegendGroupLabel, LegendItem, LegendPlaqueSwatch } from './TalentTree'
import { TalentDossier, type DossierNode, type DossierAction } from './TalentDossier'
import { PurchaseCeremony, type ForceCeremonyPayload } from './PurchaseCeremony'
import styles from './TalentTree.module.css'
import forceStyles from './ForcePowerTree.module.css'

/* ═══════════════════════════════════════════════════════ */
/*  THEME CONSTANTS                                       */
/* ═══════════════════════════════════════════════════════ */

const DIM    = HUD.textDim
const BORDER = HUD.border

/* ═══════════════════════════════════════════════════════ */
/*  TYPES                                                 */
/* ═══════════════════════════════════════════════════════ */

export interface ForceTreeNode {
  abilityKey: string
  name: string
  description?: string
  row: number
  col: number
  span: number      // how many columns this cell spans (0 = covered by neighbor)
  cost: number       // XP cost for this cell
  purchased: boolean
  canPurchase: boolean
  /** Owned/total distinct tree positions sharing this abilityKey within this
   * power — most abilities occupy exactly one position (totalRanks: 1), but a
   * few (JERINF's JERINFRANGE, WARFOR's WARFORDURATION, etc.) are genuinely
   * multi-rank, occupying 2-3 positions. Computed in useForcePowers.ts from
   * the same purchasedSet used for `purchased` above — not a separate count. */
  ownedRank: number
  totalRanks: number
}

export interface ForceTreeConnection {
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
}

export interface ForcePowerTreeProps {
  powerName: string
  nodes: ForceTreeNode[]
  connections: ForceTreeConnection[]
  /** Returns the resolved value from the underlying purchase call — a truthy id on success, falsy on failure. ForcePowerTree only starts the purchase ceremony on a truthy result (Prompt F4, mirrors TalentTree's onPurchase contract). */
  onPurchase?: (abilityKey: string, row: number, col: number, cost: number) => Promise<string | undefined> | void
  xpAvailable?: number
  purchasedCount: number
  totalCount: number
  /** Gates the purchase action shape: a character with Force Rating 0 cannot
   * buy any Force ability — handlePurchaseForceAbility already enforces this
   * server-side with a toast; the dossier now explains it proactively
   * (locked-with-reason) instead of only failing after a click (F2). */
  forceRating: number
  /** Read-only preview: every node shown as available (readable), no purchase
   * flow, no energy trace, no ceremony — mirrors TalentTree's previewMode
   * exactly, for browsing an unowned power's full tree before buying its
   * base ability. */
  previewMode?: boolean
}

const COLS = 4

/* ═══════════════════════════════════════════════════════ */
/*  PLAQUE — reuses TalentTree.module.css's notched silhouette          */
/* ═══════════════════════════════════════════════════════ */

/** Resolves a (row,col) to the data-cell-key of whichever plaque actually
 * covers it — identical to (row,col) for a span's own starting column, or
 * the owning span's starting column for a column it merely covers (span:0
 * continuation cell). Force power spans can start at any row/col with any
 * width (1, 2, or 4), unlike the sig-ability tree's fixed row-0/4-wide base,
 * so this walks each row left-to-right tracking the current span owner
 * rather than special-casing row 0 (F1 audit §c — the prior report's
 * simplified sig-tree shortcut does not hold here; verified against real
 * ALTER/HEALHARM tree data, not assumed). */
export function buildForceCellKeyMap(nodes: ForceTreeNode[]): Map<string, string> {
  const byRow = new Map<number, ForceTreeNode[]>()
  for (const n of nodes) {
    if (!byRow.has(n.row)) byRow.set(n.row, [])
    byRow.get(n.row)!.push(n)
  }
  const ownerKey = new Map<string, string>()
  for (const rowNodes of byRow.values()) {
    rowNodes.sort((a, b) => a.col - b.col)
    let ownerCol: number | null = null
    for (const n of rowNodes) {
      if (n.span > 0) ownerCol = n.col
      if (ownerCol !== null) ownerKey.set(`${n.row}-${n.col}`, `${n.row}-${ownerCol}`)
    }
  }
  return ownerKey
}

export function forceCellKey(map: Map<string, string>, row: number, col: number): string {
  return map.get(`${row}-${col}`) ?? `${row}-${col}`
}

/* ═══════════════════════════════════════════════════════ */
/*  ENERGY TRACE ADAPTER (Prompt F4)                       */
/*                                                          */
/*  Converts a Force power's already-computed nodes/         */
/*  connections into the generic EnergyGraphNode[]/           */
/*  EnergyGraphEdge[] shape findCheapestPath/runEnergyTrace    */
/*  (buildTalentTree.ts) already consume for talent trees.     */
/*  Pure — no DOM, no React.                                   */
/*                                                              */
/*  Every key is resolved through the SAME cellKeyMap           */
/*  (buildForceCellKeyMap, above) the component's own            */
/*  connector/plaque rendering already uses — a span-covered      */
/*  column (e.g. ALTERREMASTER's row4-col2 continuation) resolves  */
/*  to its owning plaque's key here exactly as it does there, not   */
/*  a second parallel resolution. Only span>0 nodes become graph     */
/*  nodes (a span:0 continuation cell isn't a real, independently      */
/*  purchasable position — same displayNodes filter useForcePowers.ts   */
/*  already applies). A multi-purchase ability occupying several         */
/*  distinct positions (JERINFRANGE, WARFORDURATION) yields one graph      */
/*  node PER POSITION, each keeping its own cost — the pathfinder never     */
/*  needs to know two nodes share an abilityKey, only that each is its own   */
/*  independently-owned/costed tree position, exactly like a ranked talent's  */
/*  per-row cost. */
/* ═══════════════════════════════════════════════════════ */

export function buildForceEnergyGraph(
  nodes: ForceTreeNode[],
  connections: ForceTreeConnection[],
  cellKeyMap: Map<string, string>,
): { nodes: EnergyGraphNode[]; edges: EnergyGraphEdge[] } {
  const graphNodes: EnergyGraphNode[] = nodes
    .filter(n => n.span > 0)
    .map(n => ({
      key: forceCellKey(cellKeyMap, n.row, n.col),
      cost: n.cost,
      owned: n.purchased,
      isEntryPoint: n.row === 0,
    }))

  const edges: EnergyGraphEdge[] = connections.map(c => ({
    from: forceCellKey(cellKeyMap, c.fromRow, c.fromCol),
    to: forceCellKey(cellKeyMap, c.toRow, c.toCol),
  }))

  return { nodes: graphNodes, edges }
}

function Plaque({
  node, onClickNode, cellKey, onHoverLocked, previewMode,
}: {
  node: ForceTreeNode
  onClickNode: (node: ForceTreeNode) => void
  cellKey: string
  /** Energy trace (Prompt F4) — only ever called for genuinely locked nodes (not owned, not purchasable), mirroring TalentTree's onHoverLocked. */
  onHoverLocked?: (cellKey: string, hovering: boolean) => void
  previewMode?: boolean
}) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const handleMouseMove = useCursorSheen()

  const body = node.description && (
    <div className={styles.body}>
      <MarkupText text={node.description} />
    </div>
  )

  // Filled-only rank pips, same convention as TalentTree's ranked talents —
  // most Force abilities occupy exactly one tree position (totalRanks: 1),
  // so they show no Rank row at all (the tick box already says "owned").
  const pips = node.totalRanks > 1 && node.ownedRank > 0 && (
    <div className={styles.pips}>
      {Array.from({ length: node.ownedRank }, (_, i) => <span key={i} className={styles.pip} />)}
    </div>
  )

  const commonProps = {
    ref: nodeRef,
    'data-cell-key': cellKey,
    onMouseMove: handleMouseMove,
    onClick: () => onClickNode(node),
  }

  if (node.purchased) {
    return (
      <div className={`${styles.plaque} ${styles.owned}`} {...commonProps}>
        <div className={`${styles.header} ${forceStyles.headerForce}`}>
          <span className={styles.tickBox}><span className={styles.tickMark}>✓</span></span>
          <span className={styles.name}>{node.name}</span>
        </div>
        {body}
        {node.totalRanks > 1 && node.ownedRank > 0 && (
          <div className={`${styles.foot} ${styles.footEnd}`}>
            <span className={styles.rankLabel}>Rank:</span>
            {pips}
          </div>
        )}
      </div>
    )
  }

  if (previewMode || node.canPurchase) {
    return (
      <div className={`${styles.plaque} ${styles.reachable}`} {...commonProps}>
        <div className={`${styles.header} ${forceStyles.headerForce}`}>
          <span className={styles.name}>{node.name}</span>
        </div>
        {body}
        <div className={styles.foot}>
          <span className={styles.cost}>{node.cost} XP</span>
          {node.totalRanks > 1 && pips}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${styles.plaque} ${styles.locked}`}
      {...commonProps}
      onMouseEnter={() => onHoverLocked?.(cellKey, true)}
      onMouseLeave={() => onHoverLocked?.(cellKey, false)}
    >
      <div className={`${styles.header} ${forceStyles.headerForce}`}>
        <span className={styles.name}>{node.name}</span>
      </div>
      {body}
      <div className={styles.foot}>
        <span className={styles.cost}>🔒 {node.cost} XP</span>
        {node.totalRanks > 1 && pips}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  MAIN FORCE POWER TREE                                 */
/* ═══════════════════════════════════════════════════════ */

export function ForcePowerTree({
  powerName, nodes, connections, onPurchase, xpAvailable, purchasedCount, totalCount, forceRating, previewMode,
}: ForcePowerTreeProps) {
  const [selectedNode, setSelectedNode] = useState<ForceTreeNode | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const nodeMap = useMemo(() => {
    const m = new Map<string, ForceTreeNode>()
    for (const node of nodes) m.set(`${node.row}-${node.col}`, node)
    return m
  }, [nodes])

  // Maps any (row,col) — including a span's covered/continuation columns —
  // to the data-cell-key of the plaque that actually occupies it. See
  // buildForceCellKeyMap's comment: unlike the sig-ability tree, Force spans
  // can start at any row/col, so this can't be a fixed "row 0 → base" rule.
  const cellKeyMap = useMemo(() => buildForceCellKeyMap(nodes), [nodes])
  const forceCellKeyFor = useCallback((row: number, col: number) => forceCellKey(cellKeyMap, row, col), [cellKeyMap])

  // Routed through forceCellKeyFor (not a literal '${row}-${col}' lookup) so a
  // connector endpoint that lands on a span-covered column (e.g. ALTER's
  // ALTERREMASTER continuation at row4-col2) resolves to the owning node's
  // real purchased state instead of always reading false.
  const isOwned = useCallback(
    (row: number, col: number) => nodeMap.get(forceCellKeyFor(row, col))?.purchased ?? false,
    [nodeMap, forceCellKeyFor],
  )

  const bars = useConnectorLayout({
    containerRef: gridRef,
    connections,
    cellKey: forceCellKeyFor,
    isOwned,
    deps: [powerName],
  })

  // ── Energy trace (Prompt F4) — cheapest-XP-route hover preview ──
  // Same mechanism as TalentTree.tsx's own trace (Prompt 8): a graph built
  // once per tree render (not per hover), a hovered locked node's cheapest
  // path computed via the shared findCheapestPath, and a GSAP handle whose
  // kill() React's effect cleanup guarantees runs before the next hover's
  // handle starts — the same guarantee that already makes rapid hovering
  // across many talent nodes leave zero stuck bars/plaques.
  const prefersReducedMotion = usePrefersReducedMotion()
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const graph = useMemo(
    () => buildForceEnergyGraph(nodes, connections, cellKeyMap),
    [nodes, connections, cellKeyMap],
  )

  const activePath = useMemo(() => {
    if (!hoveredKey) return null
    const target = nodeMap.get(hoveredKey)
    // Only trace to genuinely locked nodes — owned needs no route, purchasable
    // needs no route (it's already the whole "path"). Force Rating alone never
    // blocks a trace here — FR gates the ACTUAL purchase (server-enforced in
    // purchaseForceAbility and surfaced in the dossier below), not adjacency,
    // so a node's reachability answer stays correct regardless of FR; the
    // cost chip separately warns when FR would still block the purchase.
    if (!target || target.purchased || target.canPurchase) return null
    return findCheapestPath(graph.nodes, graph.edges, hoveredKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredKey, graph])

  useEffect(() => {
    if (!activePath || !gridRef.current) return
    const handle = runEnergyTrace(gridRef.current, bars, activePath.path, { reducedMotion: prefersReducedMotion })
    return () => handle.kill()
  }, [activePath, bars, prefersReducedMotion])

  // Cost chip position — identical measurement approach to TalentTree.tsx's
  // own chip (clamped so it never falls outside the grid container).
  const [chipPos, setChipPos] = useState<{ top: number; left: number } | null>(null)
  useEffect(() => {
    const container = gridRef.current
    if (!activePath || !container) { setChipPos(null); return }
    const containerRect = container.getBoundingClientRect()
    const targetEl = container.querySelector<HTMLElement>(`[data-cell-key="${activePath.path[activePath.path.length - 1]}"]`)
    if (!targetEl) { setChipPos(null); return }
    const targetRect = targetEl.getBoundingClientRect()
    const CHIP_HEIGHT = 24
    const CHIP_WIDTH = 220
    const top = targetRect.top - containerRect.top
    const placeAbove = top > CHIP_HEIGHT + 10
    const rawLeft = targetRect.left - containerRect.left + targetRect.width / 2
    const clampedLeft = Math.min(Math.max(rawLeft, CHIP_WIDTH / 2 + 4), containerRect.width - CHIP_WIDTH / 2 - 4)
    setChipPos({
      top: placeAbove ? top - CHIP_HEIGHT - 8 : targetRect.bottom - containerRect.top + 8,
      left: clampedLeft,
    })
  }, [activePath])

  // ── Purchase ceremony (Prompt F4) ──
  const [ceremony, setCeremony] = useState<{ payload: ForceCeremonyPayload; xpBefore: number; xpAfter: number } | null>(null)

  // Determine rows from nodes
  const maxRow = nodes.reduce((max, n) => Math.max(max, n.row), 0)
  const rows = maxRow + 1

  // Dossier view-model — mirrors TalentTree.tsx's pattern exactly (Prompt F2):
  // every eligibility decision below reads a value already computed upstream
  // (canPurchase from useForcePowers.ts, forceRating from the character),
  // nothing here re-derives eligibility.
  const dossierNode: DossierNode | null = selectedNode ? {
    key:         selectedNode.abilityKey,
    name:        selectedNode.name,
    description: selectedNode.description,
    cost:        selectedNode.cost,
    tierLabel:   powerName,
    // activation / isForceTalent / isRanked intentionally omitted — no such
    // concept exists on Force ability nodes; the dossier already degrades
    // gracefully by not rendering those tags (same as the sig tree).
  } : null

  const dossierAction: DossierAction | null = (() => {
    const n = selectedNode
    if (!n) return null

    if (n.purchased) {
      const isMultiRank = n.totalRanks > 1
      return {
        kind: 'owned',
        rankLabel: isMultiRank ? `Ranks owned: ${n.ownedRank}` : undefined,
        rank: isMultiRank ? n.ownedRank : undefined,
      }
    }

    if (previewMode) {
      return {
        kind: 'locked',
        reasonIcon: '👁',
        reasonTitle: 'Power Preview — read-only',
        reasonText: 'This is a read-only preview of the Force power tree.',
      }
    }

    if (!n.canPurchase) {
      return {
        kind: 'locked',
        reasonIcon: '🔒',
        reasonTitle: 'Locked',
        reasonText: 'Purchase adjacent abilities first.',
      }
    }

    // Force Rating gate — handlePurchaseForceAbility enforces this
    // server-side with a toast (`Force Rating 1 required to purchase Force
    // powers`); explained proactively here instead of only after a failed
    // click (F2 scope).
    if (forceRating < 1) {
      return {
        kind: 'locked',
        reasonIcon: '🔒',
        reasonTitle: 'Force Rating Required',
        reasonText: 'Force Rating 1 required to purchase Force powers.',
      }
    }

    const affordable = xpAvailable === undefined || xpAvailable >= n.cost
    return {
      kind: 'purchase',
      disabledReason: affordable ? undefined : `Not enough XP — need ${n.cost}, have ${xpAvailable}`,
      onConfirm: async () => {
        if (!onPurchase) return
        // Kill any live energy trace before the ceremony takes over — same
        // guard TalentTree.tsx's onConfirm applies before its own ceremony.
        setHoveredKey(null)
        const cellKey = forceCellKeyFor(n.row, n.col)
        const sourceEl = gridRef.current?.querySelector<HTMLElement>(`[data-cell-key="${cellKey}"]`)
        const rect = sourceEl?.getBoundingClientRect()
        const sourceRect = rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null
        const xpBefore = xpAvailable ?? n.cost
        // The DB write happens entirely inside onPurchase (handlePurchaseForceAbility)
        // — this await is what makes the ceremony wait for a REAL result, never
        // gating the write itself on any animation. Falsy means the purchase was
        // refused (insufficient XP, Force Rating gate, or an XP-race loss) —
        // no ceremony plays and the existing toast error path already surfaced.
        const result = await onPurchase(n.abilityKey, n.row, n.col, n.cost)
        if (!result) return
        const isMultiRank = n.totalRanks > 1
        setCeremony({
          payload: {
            kind: 'force', name: n.name, powerName, cost: n.cost,
            rankLabel: isMultiRank ? `Rank ${n.ownedRank + 1} of ${n.totalRanks}` : undefined,
            sourceRect,
          },
          xpBefore, xpAfter: xpBefore - n.cost,
        })
      },
    }
  })()

  return (
    // overflow:'hidden' deliberately NOT set here — TalentTree.tsx's own root
    // wrapper removed it (Prompt 7b/6d) after it clipped a hovered bottom-row
    // plaque against this box's own bottom edge; reintroducing it here would
    // bring that same bug into Force power trees (F1 audit §g).
    <div style={{
      background: HUD.bg,
      border: `1px solid ${BORDER}`,
      borderRadius: RADIUS.lg,
      fontFamily: FONT_BODY,
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--hud-surface-lo)',
        borderBottom: `1px solid ${BORDER}`,
        borderTopLeftRadius: RADIUS.lg,
        borderTopRightRadius: RADIUS.lg,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.sm,
            fontWeight: 700, color: HUD.gold,
          }}>
            {powerName}
          </div>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.label,
            color: DIM, marginTop: 2,
          }}>
            {purchasedCount}/{totalCount} abilities
          </div>
        </div>
        {xpAvailable !== undefined && (
          <div style={{
            background: 'var(--hud-surface-lo)',
            border: `1px solid ${HUD.border}`,
            borderRadius: RADIUS.sm,
            padding: '2px 10px',
            fontFamily: FONT_BODY, fontSize: FS.label,
            color: HUD.gold,
          }}>
            {xpAvailable} XP
          </div>
        )}
      </div>

      {/* Legend — same swatches as TalentTree's, reused directly (Owned/Available/Locked
          only; no Type row, Force powers have no activation split) */}
      <div style={{
        background: 'var(--hud-surface-lo)',
        padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <LegendGroupLabel>State</LegendGroupLabel>
        <LegendItem label="Owned" emphasize><LegendPlaqueSwatch variant="owned" /></LegendItem>
        <LegendItem label="Available"><LegendPlaqueSwatch variant="available" /></LegendItem>
        <LegendItem label="Locked"><LegendPlaqueSwatch variant="locked" /></LegendItem>
      </div>

      {/* Grid + connectors */}
      <div
        ref={gridRef}
        style={{
          position: 'relative',
          overflow: 'visible',
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 160px)`,
          gap: 0,
        }}
      >
        {/* Measured-DOM connector bars — behind plaques (Z.base < Z.raised) */}
        <div style={{ position: 'absolute', inset: 0, zIndex: Z.base, pointerEvents: 'none' }}>
          {bars.map(bar => (
            <div
              key={bar.id}
              data-bar-id={bar.id}
              className={bar.active ? styles.linkBarActive : styles.linkBar}
              style={{ top: bar.top, left: bar.left, width: bar.width, height: bar.height }}
            />
          ))}
        </div>

        {/* Energy-trace cost chip (Prompt F4) — same measurement/clamp approach
            as TalentTree's own chip. Appends a Force Rating warning when the
            character's FR is below the purchase gate: the trace only answers
            "what's the cheapest adjacency route," which stays true regardless
            of Force Rating, but the FINAL purchase at the end of that route
            would still be refused server-side (purchaseForceAbility) until FR
            is met — this stops the chip implying "trace it and you're done." */}
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
            PATH: {activePath.totalCost} XP · {activePath.purchaseCount} ABILIT{activePath.purchaseCount === 1 ? 'Y' : 'IES'}
            {forceRating < 1 ? ' · ⚠ REQUIRES FORCE RATING 1' : ''}
          </div>
        )}

        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const node = nodeMap.get(`${row}-${col}`)
            // Skip cells covered by a neighbor's span (span === 0) — their
            // space is already occupied by the spanning plaque's gridColumn.
            if (!node || node.span === 0) return null
            return (
              <div
                key={`${row}-${col}`}
                className={styles.cell}
                style={{
                  position: 'relative',
                  padding: 10,
                  zIndex: Z.raised,
                  gridColumn: node.span > 1 ? `${col + 1} / span ${node.span}` : col + 1,
                  gridRow: row + 1,
                  display: 'flex',
                  alignItems: 'stretch',
                  justifyContent: 'stretch',
                }}
              >
                <Plaque
                  node={node}
                  onClickNode={n => setSelectedNode(n)}
                  cellKey={forceCellKeyFor(row, col)}
                  previewMode={previewMode}
                  onHoverLocked={(key, hovering) => {
                    // Same mouseenter(new)/mouseleave(old) race guard as
                    // TalentTree.tsx — only clear if the leaving node is still
                    // the one currently hovered.
                    setHoveredKey(prev => (hovering ? key : (prev === key ? null : prev)))
                  }}
                />
              </div>
            )
          })
        )}
      </div>

      {/* Dossier — replaces PurchasePopover/ForceTooltip (F2) */}
      <TalentDossier
        node={dossierNode}
        action={dossierAction}
        onClose={() => setSelectedNode(null)}
      />

      {/* Purchase ceremony (Prompt F4) */}
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
