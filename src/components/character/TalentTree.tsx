'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { RichText } from '@/components/ui/RichText'
import { HUD, FS, FONT_BODY, FONT_DISPLAY, RADIUS, Z, ACTIVATION_TOKEN, SP } from '@/lib/tokens'
import { useConnectorLayout } from '@/hooks/useConnectorLayout'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  findCheapestPath, runEnergyTrace, runTreeEntrance,
  type EnergyGraphNode, type EnergyGraphEdge, type EntranceTier,
} from '@/lib/buildTalentTree'
import { TalentDossier, type DossierNode, type DossierAction } from './TalentDossier'
import { PurchaseCeremony, type TalentCeremonyPayload } from './PurchaseCeremony'
import styles from './TalentTree.module.css'

/** activation label → {bg,text} token pair, for the purchase ceremony's card colour (same tokens Plaque's own header already uses via HEADER_CLASS/ACTIVATION_TOKEN — not a new colour source). */
const ACTIVATION_TOKEN_BY_LABEL: Record<string, { bg: string; text: string }> = {
  Passive:            ACTIVATION_TOKEN.passive,
  Action:             ACTIVATION_TOKEN.active,
  Maneuver:           ACTIVATION_TOKEN.maneuver,
  Incidental:         ACTIVATION_TOKEN.incidental,
  'Incidental (OOT)': ACTIVATION_TOKEN.incidental,
}

/* ═══════════════════════════════════════════════════════ */
/*  DESIGN TOKENS                                         */
/* ═══════════════════════════════════════════════════════ */

// All font references use FONT_BODY (JetBrains Mono) per design system rules.
// FC (formerly var(--font-body)) and FR (formerly var(--font-body)) unified.
const FR = FONT_BODY

// The tree card's own surface. Indirected through a custom property so the
// talents route can set `--tree-card-bg: transparent` on its scroll stage and
// let the ghost watermark behind the card show through the plaques. Every
// other mount (preview modal, creator) never sets the variable and therefore
// keeps the original opaque HUD.bg — no prop, no behaviour change, nothing for
// those surfaces to regress.
const BG        = `var(--tree-card-bg, ${HUD.bg})`
const DIM       = HUD.textDim
const FAINT     = HUD.textFaint
const BORDER    = HUD.border
const PANEL_BG  = 'var(--hud-surface-lo)'

/* ═══════════════════════════════════════════════════════════════════
   LEGEND SWATCHES — shared source of truth for BOTH this component's own
   in-tree legend and the talents route's mega-header legend
   (talents/page.tsx imports these directly rather than redefining them, so
   the two legends can never drift out of sync again). Every swatch
   reproduces its real on-tree counterpart exactly: same clip-path formula
   as .plaque below (notch scaled down), same tokens, same locked
   opacity/filter — not an approximation.
   ══════════════════════════════════════════════════════════════════ */

/** Identical formula to .plaque's own clip-path (TalentTree.module.css) — only --notch is overridden smaller, the shape itself is untouched. */
export const MINI_PLAQUE_CLIP = 'polygon(var(--notch) 0, calc(100% - var(--notch)) 0, 100% var(--notch), 100% calc(100% - var(--notch)), calc(100% - var(--notch)) 100%, var(--notch) 100%, 0 calc(100% - var(--notch)), 0 var(--notch))'

export function LegendGroupLabel({ children }: { children: ReactNode }) {
  return (
    <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: HUD.textFaint }}>
      {children}
    </span>
  )
}

export function LegendItem({ label, emphasize, children }: { label: string; emphasize?: boolean; children: ReactNode }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
      {children}
      <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, letterSpacing: '0.06em', color: emphasize ? HUD.text : HUD.textDim }}>
        {label}
      </span>
    </span>
  )
}

/** Miniature plaque swatch — real notched silhouette (scaled), real tokens, real locked opacity/filter. */
export function LegendPlaqueSwatch({ variant }: { variant: 'owned' | 'available' | 'locked' }) {
  const base: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 20, height: 20, flexShrink: 0,
    ['--notch' as string]: '3px',
    clipPath: MINI_PLAQUE_CLIP,
  }

  if (variant === 'owned') {
    return (
      <span style={{ ...base, background: 'var(--plaque-plate)' }}>
        <span style={{ fontSize: 10, lineHeight: 1, color: 'var(--plaque-plate-text)', fontWeight: 700 }}>✓</span>
      </span>
    )
  }
  if (variant === 'available') {
    return (
      <span style={{
        ...base,
        background: 'var(--plaque-body)',
        border: '1.5px solid var(--plaque-avail-accent)',
        boxShadow: '0 0 6px color-mix(in srgb, var(--plaque-avail-accent) 45%, transparent)',
      }} />
    )
  }
  // locked — identical opacity/filter to .locked below
  return (
    <span style={{
      ...base,
      background: 'var(--plaque-body)',
      border: '1px solid var(--plaque-edge)',
      opacity: 0.28,
      filter: 'saturate(0.35)',
    }} />
  )
}

/** Horizontal bar swatch — matches the real plaque header bar exactly (same --activation-* tokens). */
export function LegendActivationBar({ bg }: { bg: string }) {
  return <span style={{ display: 'inline-block', width: 20, height: 8, borderRadius: 1, background: bg }} />
}

/* ═══════════════════════════════════════════════════════ */
/*  EXPORTED TYPES                                        */
/* ═══════════════════════════════════════════════════════ */

export interface TalentTreeNode {
  talentKey: string
  name: string
  description?: string
  row: number
  col: number
  purchased: boolean
  activation: string   // 'Passive' | 'Action' | 'Maneuver' | 'Incidental' | 'Incidental (OOT)'
  isRanked: boolean
  /** From ref_talents.is_force_talent. Not yet rendered — surfaced for a later prompt's Force-talent indicator. */
  isForceTalent: boolean
  /** XP cost for this node's row, sourced from ref_specializations.talent_tree.rows[].cost (see buildTalentTree). */
  cost: number
  /** Total owned ranks of this talentKey across the character (any spec) — see countOwnedRanks in derivedStats.ts. Not yet rendered. */
  ownedRank: number
  canPurchase: boolean
}

export interface TalentTreeConnection {
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
}

export interface TalentTreeProps {
  specName: string
  nodes: TalentTreeNode[]
  connections: TalentTreeConnection[]
  /** Returns the resolved value from the underlying purchase call — a truthy id on success, falsy on failure OR on the deliberate DEDI-dedication opt-out (see TalentSurface.tsx's onPurchase wrapper). TalentTree only starts the purchase ceremony on a truthy result. */
  onPurchase?: (talentKey: string, row: number, col: number) => Promise<string | undefined> | void
  onRemoveTalent?: (talentKey: string, xpCost: number) => void
  isGmMode?: boolean
  xpAvailable?: number
  /** Read-only preview: all nodes shown as available, no purchase flow */
  previewMode?: boolean
}

/* ═══════════════════════════════════════════════════════ */
/*  PLAQUE — notched FFG-style talent node                */
/* ═══════════════════════════════════════════════════════ */

const HEADER_CLASS: Record<string, string> = {
  Passive:            styles.headerPassive,
  Action:             styles.headerActive,
  Maneuver:           styles.headerManeuver,
  Incidental:         styles.headerIncidental,
  'Incidental (OOT)': styles.headerIncidental,
}

/** Cursor-follow sheen — writes --mx/--my directly via ref, no React state (avoids a re-render per mousemove). rAF-throttled. Exported so ForcePowerTree.tsx can reuse it instead of duplicating (Prompt F1). */
export function useCursorSheen() {
  const rafRef = useRef<number | null>(null)
  return (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const clientX = e.clientX
    const clientY = e.clientY
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${((clientX - rect.left) / rect.width) * 100}%`)
      el.style.setProperty('--my', `${((clientY - rect.top) / rect.height) * 100}%`)
      rafRef.current = null
    })
  }
}

function Plaque({
  node,
  isGmMode,
  onClickNode,
  onClickRemove,
  previewMode,
  onHoverLocked,
}: {
  node: TalentTreeNode
  isGmMode?: boolean
  onClickNode: (n: TalentTreeNode) => void
  onClickRemove: (n: TalentTreeNode) => void
  previewMode?: boolean
  /** Energy trace (Prompt 8) — only ever called for genuinely locked nodes (not owned, not purchasable); preview-mode plaques never reach this branch. */
  onHoverLocked?: (row: number, col: number, hovering: boolean) => void
}) {
  const handleMouseMove = useCursorSheen()
  const headerClass = HEADER_CLASS[node.activation] ?? styles.headerPassive
  // Filled-only rank pips (no per-talent max-rank data exists to display an
  // empty-slot ceiling) — ranked talents show one pip per owned rank, derived
  // from the shared countOwnedRanks-backed node.ownedRank (Prompt 2), not
  // recomputed here. Non-ranked talents show a single pip only when owned.
  const pipCount = node.isRanked ? node.ownedRank : (node.purchased ? 1 : 0)

  const header = (
    <div className={`${styles.header} ${headerClass}`}>
      <span className={styles.name}>{node.name}</span>
      {node.isForceTalent && <span className={styles.forceGlyph}>✦</span>}
    </div>
  )

  const body = node.description && (
    <div className={styles.body}>
      <RichText text={node.description} />
    </div>
  )

  const pips = pipCount > 0 && (
    <div className={styles.pips}>
      {Array.from({ length: pipCount }, (_, i) => <span key={i} className={styles.pip} />)}
    </div>
  )

  // Connector bars measure this element, not the padded grid-cell wrapper
  // (which touches its neighbours with zero gap — see useConnectorLayout) —
  // the data-cell-key must sit on the plaque itself so bar length is the
  // real visual gap between plaques, not zero.
  const cellKey = specCellKey(node.row, node.col)

  if (node.purchased) {
    /* ── OWNED ── clickable: opens the dossier in its "Purchased" state.
       Owned-plate treatment: filled tick box in the header (faithful to the
       printed FFG sheet's checkbox), cost removed entirely (not struck
       through), reclaimed footer space shows "Rank:" + pips for ranked
       talents only — a non-ranked owned talent has nothing further to say
       once the tick box + plate already show it's owned. */
    return (
      <div
        className={`${styles.plaque} ${styles.owned}`}
        data-cell-key={cellKey}
        onMouseMove={handleMouseMove}
        onClick={() => onClickNode(node)}
      >
        <div className={`${styles.header} ${headerClass}`}>
          <span className={styles.tickBox}><span className={styles.tickMark}>✓</span></span>
          <span className={styles.name}>{node.name}</span>
          {node.isForceTalent && <span className={styles.forceGlyph}>✦</span>}
        </div>
        {body}
        {node.isRanked && pipCount > 0 && (
          <div className={`${styles.foot} ${styles.footEnd}`}>
            <span className={styles.rankLabel}>Rank:</span>
            {pips}
          </div>
        )}
        {isGmMode && (
          <button
            onClick={e => { e.stopPropagation(); onClickRemove(node) }}
            className={styles.removeBtn}
          >
            ×
          </button>
        )}
      </div>
    )
  }

  if (previewMode || node.canPurchase) {
    /* ── REACHABLE (or preview) ── */
    return (
      <div
        className={`${styles.plaque} ${styles.reachable}`}
        data-cell-key={cellKey}
        onMouseMove={handleMouseMove}
        onClick={() => onClickNode(node)}
      >
        {header}
        {body}
        <div className={styles.foot}>
          <span className={styles.cost}>{node.cost} XP</span>
          {pips}
        </div>
      </div>
    )
  }

  /* ── LOCKED ── hoverable for preview, not purchasable */
  return (
    <div
      className={`${styles.plaque} ${styles.locked}`}
      data-cell-key={cellKey}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => onHoverLocked?.(node.row, node.col, true)}
      onMouseLeave={() => onHoverLocked?.(node.row, node.col, false)}
      onClick={() => onClickNode(node)}
    >
      {header}
      {body}
      <div className={styles.foot}>
        <span className={styles.cost}>🔒 {node.cost} XP</span>
        {pips}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  MAIN TALENT TREE COMPONENT                            */
/* ═══════════════════════════════════════════════════════ */

function specCellKey(row: number, col: number): string {
  return `${row}-${col}`
}

export function TalentTree({
  specName,
  nodes,
  connections,
  onPurchase,
  onRemoveTalent,
  isGmMode,
  xpAvailable,
  previewMode,
}: TalentTreeProps) {
  const [selectedNode, setSelectedNode] = useState<TalentTreeNode | null>(null)
  // Memoized (Prompt 8) — this used to be a plain for-loop rebuilding a new
  // Map every render, which is what made `isOwned` below a fresh closure
  // every render too, which made useConnectorLayout's `measure` callback churn
  // identity every render, which re-triggered bar re-measurement on every
  // render (including hover-only renders) and produced a brand-new `bars`
  // array reference each time — invisible before Prompt 8 since nothing
  // depended on `bars`' referential identity, but fatal to the energy trace's
  // effect (which does): the trace timeline kept getting killed and restarted
  // before any of its `tl.call()` charging callbacks ever had a chance to
  // fire. Stabilizing nodeMap → isOwned → bars fixes the cause, not just the
  // trace's symptom.
  const nodeMap = useMemo(() => {
    const m = new Map<string, TalentTreeNode>()
    for (const node of nodes) m.set(`${node.row}-${node.col}`, node)
    return m
  }, [nodes])

  const isOwned = useCallback(
    (row: number, col: number) => nodeMap.get(specCellKey(row, col))?.purchased ?? false,
    [nodeMap],
  )

  const gridRef = useRef<HTMLDivElement>(null)
  const bars = useConnectorLayout({
    containerRef: gridRef,
    connections,
    cellKey: specCellKey,
    isOwned,
    deps: [specName],
  })

  // ── Energy trace (Prompt 8) — cheapest-XP-route hover preview ──
  const prefersReducedMotion = usePrefersReducedMotion()
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  // Graph built once per tree render (nodes/connections change), not per hover.
  const graph = useMemo(() => ({
    nodes: nodes.map((n): EnergyGraphNode => ({
      key: specCellKey(n.row, n.col), cost: n.cost, owned: n.purchased, isEntryPoint: n.row === 0,
    })),
    edges: connections.map((c): EnergyGraphEdge => ({
      from: specCellKey(c.fromRow, c.fromCol), to: specCellKey(c.toRow, c.toCol),
    })),
  }), [nodes, connections])

  const activePath = useMemo(() => {
    if (!hoveredKey) return null
    const target = nodeMap.get(hoveredKey)
    // Only trace to genuinely locked nodes — owned needs no route, purchasable
    // needs no route (it's already the whole "path").
    if (!target || target.purchased || target.canPurchase) return null
    return findCheapestPath(graph.nodes, graph.edges, hoveredKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredKey, graph])

  // Runs (or, under reduced motion, instantly applies) the trace whenever the
  // path changes — and, critically, React tears down the PREVIOUS effect
  // (killing its handle) before this one runs again on the next hover, so
  // rapid movement across many locked nodes can never stack timelines or
  // leave a bar/plaque stuck in path-glow.
  useEffect(() => {
    if (!activePath || !gridRef.current) return
    const handle = runEnergyTrace(gridRef.current, bars, activePath.path, { reducedMotion: prefersReducedMotion })
    return () => handle.kill()
  }, [activePath, bars, prefersReducedMotion])

  // ── Entrance choreography (Prompt 9) — tier-by-tier "power on" reveal ──
  // Grouped straight from `nodes`/`connections` (not `bars`, which is DOM-
  // measured geometry) so the tier membership itself is stable across
  // re-renders; only the bar *elements* it looks up at run time come from
  // the live `bars` array.
  const entranceTiers = useMemo<EntranceTier[]>(() => {
    const byRow = new Map<number, EntranceTier>()
    for (let row = 0; row < 5; row++) byRow.set(row, { cellKeys: [], barIds: [] })
    for (const node of nodes) byRow.get(node.row)?.cellKeys.push(specCellKey(node.row, node.col))
    for (const conn of connections) {
      const id = `${specCellKey(conn.fromRow, conn.fromCol)}>${specCellKey(conn.toRow, conn.toCol)}`
      byRow.get(conn.fromRow)?.barIds.push(id)
    }
    return Array.from(byRow.values()).filter(t => t.cellKeys.length > 0)
  }, [nodes, connections])

  // `bars` gets a brand-new array reference on every ResizeObserver-driven
  // remeasure, including harmless ones (fonts settling, a second measure
  // pass) that change nothing visually. Depending on `bars` itself in the
  // entrance effect below made it re-run its cleanup (killing/reverting the
  // just-started timeline) the instant a second remeasure landed — often
  // within the same frame the entrance began, so it never got to paint a
  // single visible frame. `barsRef` gives the entrance effect a way to read
  // CURRENT bar geometry without re-running every time that geometry's
  // array identity changes.
  const barsRef = useRef(bars)
  useEffect(() => { barsRef.current = bars }, [bars])

  // Tags which spec's bars are currently known-measured. Sets bail out of
  // re-rendering when the new value equals the current one (same specName),
  // so once a spec's bars are marked ready, further same-spec remeasures are
  // no-ops here too — this is what actually decouples the entrance effect
  // from `bars`' identity churn, not just moving the read into a ref.
  const [barsReadyFor, setBarsReadyFor] = useState<string | null>(null)
  useEffect(() => {
    if (bars.length > 0) setBarsReadyFor(specName)
  }, [bars, specName])

  // Guards against re-running on incidental re-renders (hover, resize-driven
  // bar recalculation, dossier open/close): only fires again when `specName`
  // itself changes (mount, or a genuine rail tree-switch) AND that spec's
  // bars have been tagged ready above.
  const enteredSpecRef = useRef<string | null>(null)
  useEffect(() => {
    const container = gridRef.current
    if (!container || entranceTiers.length === 0) return
    if (connections.length > 0 && barsReadyFor !== specName) return // not measured yet
    if (enteredSpecRef.current === specName) return
    enteredSpecRef.current = specName
    const handle = runTreeEntrance(container, entranceTiers, barsRef.current, { reducedMotion: prefersReducedMotion })
    const killOnClick = () => handle.kill()
    container.addEventListener('click', killOnClick, { once: true })
    return () => {
      container.removeEventListener('click', killOnClick)
      handle.kill()
    }
  }, [specName, entranceTiers, connections.length, barsReadyFor, prefersReducedMotion])

  // ── Purchase ceremony (Prompt 9) ──
  const [ceremony, setCeremony] = useState<{ payload: TalentCeremonyPayload; xpBefore: number; xpAfter: number } | null>(null)

  // Cost chip position — measured against the target plaque's live rect,
  // clamped so it never falls outside the grid container (top-row / edge
  // nodes would otherwise push it above or past the sides).
  const [chipPos, setChipPos] = useState<{ top: number; left: number } | null>(null)
  useEffect(() => {
    const container = gridRef.current
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

  // Dossier view-model — every eligibility decision below reads a value
  // buildTalentTree/Prompt 2-4 already computed (canPurchase, purchased,
  // ownedRank, previewMode); nothing here re-derives eligibility.
  const dossierNode: DossierNode | null = selectedNode ? {
    key:           selectedNode.talentKey,
    name:          selectedNode.name,
    description:   selectedNode.description,
    activation:    selectedNode.activation,
    isForceTalent: selectedNode.isForceTalent,
    isRanked:      selectedNode.isRanked,
    cost:          selectedNode.cost,
    tierLabel:     `Tier ${selectedNode.row + 1}`,
  } : null

  const dossierAction: DossierAction | null = (() => {
    const n = selectedNode
    if (!n) return null

    if (n.purchased) {
      return {
        kind: 'owned',
        rankLabel: n.isRanked ? `Ranks owned: ${n.ownedRank}` : undefined,
        rank: n.isRanked ? n.ownedRank : undefined,
      }
    }

    if (previewMode) {
      return {
        kind: 'locked',
        reasonIcon: '👁',
        reasonTitle: 'Spec Preview — read-only',
        reasonText: 'This is a read-only preview of the specialization tree.',
      }
    }

    if (n.canPurchase) {
      const affordable = xpAvailable === undefined || xpAvailable >= n.cost
      return {
        kind: 'purchase',
        disabledReason: affordable ? undefined : `Not enough XP — need ${n.cost}, have ${xpAvailable}`,
        onConfirm: async () => {
          if (!onPurchase) return
          // Kill any live energy trace before the ceremony takes over — traces
          // never target this node itself (activePath excludes canPurchase
          // nodes above) but the cursor could still be resting on a different
          // locked node while the dossier is open.
          setHoveredKey(null)
          const cellKey = specCellKey(n.row, n.col)
          const sourceEl = gridRef.current?.querySelector<HTMLElement>(`[data-cell-key="${cellKey}"]`)
          const rect = sourceEl?.getBoundingClientRect()
          const sourceRect = rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null
          const xpBefore = xpAvailable ?? n.cost
          // The DB write happens entirely inside onPurchase — this await is
          // what makes the ceremony wait for a REAL result, never gating the
          // write itself on any animation (the write already ran to
          // completion by the time this resolves). Falsy covers both an
          // actual failure (already toast.error'd inside purchaseTalent) and
          // the deliberate DEDI-dedication opt-out (TalentSurface.tsx's
          // wrapper returns undefined for DEDI on purpose) — neither plays a
          // ceremony.
          const result = await onPurchase(n.talentKey, n.row, n.col)
          if (!result) return
          const token = ACTIVATION_TOKEN_BY_LABEL[n.activation] ?? ACTIVATION_TOKEN.passive
          setCeremony({
            payload: {
              kind: 'talent', name: n.name, cost: n.cost,
              activationBg: token.bg, activationText: token.text,
              isForceTalent: n.isForceTalent, sourceRect,
              handBound: n.activation !== 'Passive',
            },
            xpBefore, xpAfter: xpBefore - n.cost,
          })
        },
      }
    }

    return {
      kind: 'locked',
      reasonIcon: '🔒',
      reasonTitle: 'Locked',
      reasonText: 'Purchase adjacent talents first.',
    }
  })()

  return (
    // overflow:'hidden' deliberately removed here (Prompt 7b, Defect 2) — it
    // used to clip a hovered bottom-row plaque mid-sentence against this box's
    // own bottom edge (measured: plaque bottom 757.9-875.1px vs this box's
    // bottom ~745px, live-verified in 6d/7b). The rounded-corner look it
    // protected only mattered at the TOP: the header/legend below are the only
    // children with a background distinct from this wrapper's own `background:
    // BG` — the grid itself has no background of its own, so it already shows
    // BG straight through with no seam at the bottom, clipped or not. Only the
    // header needs its own top corner radius now.
    <div
      style={{
        background: BG,
        border: `1px solid ${BORDER}`,
        borderRadius: RADIUS.lg,
        fontFamily: FR,
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          background: PANEL_BG,
          borderBottom: `1px solid ${BORDER}`,
          borderTopLeftRadius: RADIUS.lg,
          borderTopRightRadius: RADIUS.lg,
          padding: '12px 16px',
          fontWeight: 700,
        }}
      >
        <div style={{ fontFamily: FR, fontSize: FS.sm, color: HUD.gold, lineHeight: 1.3 }}>
          {specName}
        </div>
        <div style={{ fontFamily: FR, fontSize: FS.label, color: DIM, marginTop: 2 }}>
          Specialization Tree · {nodes.length} Talents
        </div>
      </div>

      {/* ── LEGEND ── same swatches as the talents route's mega-header legend
           (LegendGroupLabel/LegendItem/LegendPlaqueSwatch/LegendActivationBar,
           defined above in this file) — the only legend available at all in
           the preview modal and creator, which mount TalentTree without that
           header, so it stays here rather than being removed. */}
      <div
        style={{
          background: 'var(--hud-surface-lo)',
          padding: '8px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <LegendGroupLabel>State</LegendGroupLabel>
          <LegendItem label="Owned" emphasize><LegendPlaqueSwatch variant="owned" /></LegendItem>
          <LegendItem label="Available"><LegendPlaqueSwatch variant="available" /></LegendItem>
          <LegendItem label="Locked (click to preview)"><LegendPlaqueSwatch variant="locked" /></LegendItem>
          <LegendItem label="Ranks owned">
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {[0, 1].map(i => (
                <span key={i} style={{ width: 12, height: 12, flexShrink: 0, clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)', background: 'var(--hud-gold)' }} />
              ))}
            </span>
          </LegendItem>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <LegendGroupLabel>Type</LegendGroupLabel>
          <LegendItem label="Action"><LegendActivationBar bg={ACTIVATION_TOKEN.active.bg} /></LegendItem>
          <LegendItem label="Maneuver"><LegendActivationBar bg={ACTIVATION_TOKEN.maneuver.bg} /></LegendItem>
          <LegendItem label="Passive"><LegendActivationBar bg={ACTIVATION_TOKEN.passive.bg} /></LegendItem>
          <LegendItem label="Incidental"><LegendActivationBar bg={ACTIVATION_TOKEN.incidental.bg} /></LegendItem>
          <LegendItem label="Force">
            <span style={{ fontSize: FS.sm, lineHeight: 1, color: 'var(--force-spark)', textShadow: '0 0 4px var(--force-spark), 0 0 8px color-mix(in srgb, var(--force-spark) 55%, transparent)' }}>✦</span>
          </LegendItem>
        </div>
      </div>

      {/* ── GRID + CONNECTORS ── */}
      <div
        ref={gridRef}
        style={{
          position: 'relative',
          overflow: 'visible',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          // Row height, not a plaque property: .plaque is `position:absolute;
          // inset:10px` inside its cell, so the resting plaque is always
          // rowHeight − 20. 178px yields the ~158px plaque this pass calls for
          // (was 160 → 140). Connector bars and the energy-trace chip both
          // measure live rects under a ResizeObserver, so they re-derive from
          // this automatically — but the hover-reserve in TalentSurface.tsx is
          // a literal and had to be re-measured by hand.
          gridTemplateRows: 'repeat(5, 178px)',
          // Visual gap between plaques = grid gap + 2×inset(10). 36/44 here
          // gives the ~56px column / ~64px row separation the design asks for.
          columnGap: 36,
          rowGap: 44,
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

        {/* Energy-trace cost chip (Prompt 8) */}
        {activePath && chipPos && (
          <div
            style={{
              position: 'absolute', top: chipPos.top, left: chipPos.left, transform: 'translateX(-50%)',
              zIndex: Z.tooltip, pointerEvents: 'none',
              background: 'var(--hud-surface-hi)', border: '1px solid var(--path-glow)',
              borderRadius: RADIUS.sm, padding: '3px 10px',
              fontFamily: FR, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--path-glow)', whiteSpace: 'nowrap',
              boxShadow: '0 0 12px var(--path-glow)',
            }}
          >
            PATH: {activePath.totalCost} XP · {activePath.purchaseCount} TALENT{activePath.purchaseCount === 1 ? '' : 'S'}
          </div>
        )}

        {/* Nodes */}
        {Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 4 }, (_, col) => {
            const node = nodeMap.get(`${row}-${col}`)
            return (
              <div
                key={`${row}-${col}`}
                className={styles.cell}
                style={{
                  position: 'relative',
                  padding: 10,
                  zIndex: Z.raised,
                  display: 'flex',
                  alignItems: 'stretch',
                  justifyContent: 'stretch',
                }}
              >
                {node ? (
                  <Plaque
                    node={node}
                    isGmMode={isGmMode}
                    previewMode={previewMode}
                    onClickNode={n => setSelectedNode(n)}
                    onClickRemove={n => {
                      if (onRemoveTalent) {
                        onRemoveTalent(n.talentKey, n.cost)
                      }
                    }}
                    onHoverLocked={(r, c, hovering) => {
                      // Guard against a mouseenter(new)/mouseleave(old) ordering
                      // race when the cursor moves directly between two adjacent
                      // locked plaques — only clear if the leaving node is still
                      // the one currently hovered, so a fast move never
                      // incorrectly wipes out the trace a newer enter just set.
                      const key = specCellKey(r, c)
                      setHoveredKey(prev => (hovering ? key : (prev === key ? null : prev)))
                    }}
                  />
                ) : (
                  /* Empty cell */
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: RADIUS.md,
                      border: `1px dashed ${FAINT}`,
                      opacity: 0.3,
                    }}
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── DOSSIER ── */}
      <TalentDossier
        node={dossierNode}
        action={dossierAction}
        onClose={() => setSelectedNode(null)}
      />

      {/* ── PURCHASE CEREMONY ── */}
      {ceremony && (
        <PurchaseCeremony
          payload={ceremony.payload}
          xpBefore={ceremony.xpBefore}
          xpAfter={ceremony.xpAfter}
          reducedMotion={prefersReducedMotion}
          onDone={() => setCeremony(null)}
        />
      )}
    </div >
  )
}
