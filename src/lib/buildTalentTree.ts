// ─────────────────────────────────────────────────────────────────────────────
// buildTalentTree — shared talent-tree data builder
//
// Converts a RefSpecialization + a set of purchased (row-col) keys into the
// TalentTreeNode[] + TalentTreeConnection[] arrays that <TalentTree> consumes.
//
// Used by:
//   • PlayerHUDDesktop  (in-play spec tree display & purchase)
//   • XpInvestmentStep  (character creator talent selection)
// ─────────────────────────────────────────────────────────────────────────────

import gsap from 'gsap'
import { ACTIVATION_LABELS } from '@/lib/types'
import type { RefSpecialization, RefTalent, CharacterTalent, SigAbilityNode } from '@/lib/types'
import type { TalentTreeNode, TalentTreeConnection } from '@/components/character/TalentTree'
import { countOwnedRanks } from '@/lib/derivedStats'

export function buildTalentTree(
  spec: RefSpecialization,
  refTalentMap: Record<string, RefTalent>,
  /** Set of "<row>-<col>" strings for already-purchased nodes in this spec */
  purchasedSet: Set<string>,
  /** Character's full owned-talent rows (any spec) — used to derive ownedRank per talentKey. Omit for read-only/preview trees. */
  talents: CharacterTalent[] = [],
): { specName: string; nodes: TalentTreeNode[]; connections: TalentTreeConnection[] } | null {
  if (!spec?.talent_tree?.rows) return null

  const nodes: TalentTreeNode[] = []
  const connections: TalentTreeConnection[] = []

  for (const row of spec.talent_tree.rows) {
    // Position-implied fallback (row 0 = 5 XP, +5 per row) for rows missing a
    // stored cost — see migration 098, which back-filled every reSpec row to
    // match this same formula.
    const rowCost = row.cost ?? (row.index + 1) * 5

    for (let col = 0; col < (row.talents || []).length; col++) {
      const tKey = row.talents[col]
      const ref  = refTalentMap[tKey]
      const isPurchased = purchasedSet.has(`${row.index}-${col}`)
      const dir  = (row.directions || [])[col] || {}

      let canPurchase = false
      if (!isPurchased) {
        if (row.index === 0) {
          canPurchase = true
        } else {
          if (dir.up)              canPurchase = canPurchase || purchasedSet.has(`${row.index - 1}-${col}`)
          if (dir.left  && col > 0) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col - 1}`)
          if (dir.right && col < 3) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col + 1}`)
          if (dir.down)            canPurchase = canPurchase || purchasedSet.has(`${row.index + 1}-${col}`)
        }
      }

      nodes.push({
        talentKey:     tKey,
        name:          ref?.name || tKey,
        description:   ref?.description,
        row:           row.index,
        col,
        purchased:     isPurchased,
        activation:    ref ? (ACTIVATION_LABELS[ref.activation] || ref.activation) : 'Passive',
        isRanked:      ref?.is_ranked || false,
        isForceTalent: ref?.is_force_talent || false,
        cost:          rowCost,
        ownedRank:     countOwnedRanks(talents, t => t.talent_key === tKey, t => t.ranks || 1),
        canPurchase,
      })

      // Horizontal connection (right)
      if (dir.right && col < 3)
        connections.push({ fromRow: row.index, fromCol: col, toRow: row.index, toCol: col + 1 })
      // Vertical connection (down)
      if (dir.down)
        connections.push({ fromRow: row.index, fromCol: col, toRow: row.index + 1, toCol: col })
    }
  }

  return { specName: spec.name, nodes, connections }
}

/**
 * Character-aware wrapper around buildTalentTree — resolves the spec ref and
 * derives the purchased-node set from the character's owned talents, so
 * callers only need a specKey. Shared by PlayerHUDDesktop and the
 * /character/[id]/talents route (previously duplicated inline in
 * PlayerHUDDesktop as a local `buildTalentTree` function).
 */
export function buildCharacterTalentTree(
  specKey: string,
  refSpecMap: Record<string, RefSpecialization>,
  refTalentMap: Record<string, RefTalent>,
  talents: CharacterTalent[],
): { specName: string; nodes: TalentTreeNode[]; connections: TalentTreeConnection[] } | null {
  const refSpec = refSpecMap[specKey]
  if (!refSpec) return null
  const purchasedSet = new Set(talents.filter(t => t.specialization_key === specKey).map(t => `${t.tree_row}-${t.tree_col}`))
  return buildTalentTree(refSpec, refTalentMap, purchasedSet, talents)
}

// ─────────────────────────────────────────────────────────────────────────────
// AbilityTreeNode — common shape for a future shared tree renderer
//
// Normalizes what TalentTreeNode (specialization trees) and SigAbilityNode
// (signature ability trees) both need, so one renderer can eventually serve
// both. Does NOT replace either existing type — TalentTree.tsx and SigNodeGrid
// (TalentSurface.tsx) are unchanged and keep rendering from their own
// shapes. `colSpan` is what makes the two families compatible: specialization
// nodes are always 1 (buildTalentTree never sets it, callers of this adapter
// get 1 for every upgrade node); a signature ability's base node is 4 (spans
// the full row) — the wide base node is a deliberate, kept feature, not a bug.
// `isForceTalent` is `null` for signature-ability nodes — there is no
// equivalent concept on that side, so this is explicit "not applicable"
// rather than a false that could be misread as "confirmed non-Force".
// ─────────────────────────────────────────────────────────────────────────────
export interface AbilityTreeNode {
  key: string
  name: string
  description?: string
  row: number
  col: number
  colSpan: number
  cost: number
  purchased: boolean
  purchasable: boolean
  isForceTalent: boolean | null
}

/**
 * Converts one signature ability's SigAbilityNode[] (base + upgrades) into
 * AbilityTreeNode[] + TalentTreeConnection[], reusing TalentTreeConnection
 * as-is since it's already a generic (fromRow/fromCol/toRow/toCol) edge shape
 * with nothing talent-specific about it.
 *
 * Purchasability for upgrade nodes (rowIndex > 0) mirrors SigNodeGrid's inline
 * adjacency check in TalentSurface.tsx exactly (row 1's "up" connection
 * is always satisfied since the base node is purchased by the time this grid
 * renders) — this prompt does not change that inline logic, only reproduces
 * it here so the adapter's output is correct on its own. The base node
 * (rowIndex 0) has no prerequisite, matching buildTalentTree's own row-0
 * handling above.
 *
 * `purchasedRowCols` uses the same "<row>-<col>" key convention as
 * useCharacterSigAbilities/TalentSurface's purchasedRowCols Set.
 */
export function adaptSigAbilityNodes(
  nodes: SigAbilityNode[],
  purchasedRowCols: Set<string>,
): { nodes: AbilityTreeNode[]; connections: TalentTreeConnection[] } {
  const treeNodes: AbilityTreeNode[] = []
  const connections: TalentTreeConnection[] = []

  for (const node of nodes) {
    const key = `${node.rowIndex}-${node.colIndex}`
    const isPurchased = purchasedRowCols.has(key)

    let purchasable = false
    if (node.rowIndex === 0) {
      purchasable = !isPurchased
    } else if (!isPurchased) {
      if (node.connectUp)
        purchasable = purchasable || node.rowIndex - 1 === 0 || purchasedRowCols.has(`${node.rowIndex - 1}-${node.colIndex}`)
      if (node.connectDown)
        purchasable = purchasable || purchasedRowCols.has(`${node.rowIndex + 1}-${node.colIndex}`)
      if (node.connectLeft && node.colIndex > 0)
        purchasable = purchasable || purchasedRowCols.has(`${node.rowIndex}-${node.colIndex - 1}`)
      if (node.connectRight && node.colIndex < 3)
        purchasable = purchasable || purchasedRowCols.has(`${node.rowIndex}-${node.colIndex + 1}`)
    }

    treeNodes.push({
      key:           node.nodeKey,
      name:          node.name,
      description:   node.description,
      row:           node.rowIndex,
      col:           node.colIndex,
      colSpan:       node.colSpan,
      cost:          node.xpCost,
      purchased:     isPurchased,
      purchasable,
      isForceTalent: null,
    })

    // Edges among the upgrade grid (rowIndex > 0) — mirrors SigNodeGrid's own
    // upgradeNodes filter — plus, as of Prompt 4, base→row-1 edges: any
    // row-1 node with connectUp sits directly under the full-width base node,
    // so its "up" connection is a real bar to draw, not just (as it was
    // treated for purchasability purposes) an always-satisfied prerequisite.
    // fromCol is set to the row-1 node's own column — there's no single
    // "base column," so the connector layer resolves row 0 to a fixed
    // "base" DOM key regardless of fromCol (see TalentSurface.tsx).
    if (node.rowIndex > 0) {
      if (node.connectRight && node.colIndex < 3)
        connections.push({ fromRow: node.rowIndex, fromCol: node.colIndex, toRow: node.rowIndex, toCol: node.colIndex + 1 })
      if (node.connectDown)
        connections.push({ fromRow: node.rowIndex, fromCol: node.colIndex, toRow: node.rowIndex + 1, toCol: node.colIndex })
      if (node.rowIndex === 1 && node.connectUp)
        connections.push({ fromRow: 0, fromCol: node.colIndex, toRow: 1, toCol: node.colIndex })
    }
  }

  return { nodes: treeNodes, connections }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATH-FINDING — cheapest XP route to a locked node (Prompt 8)
//
// Generic over both trees: callers convert their own node/edge shape into
// EnergyGraphNode[]/EnergyGraphEdge[] keyed by the same string id their
// `data-cell-key` DOM attribute uses (the spec tree's "row-col"; the sig
// tree's "base"/"row-col") — that shared id space is what lets the trace
// renderer (runEnergyTrace, below) look up the real plaque/bar elements
// straight from the path result with no extra key translation.
//
// Does NOT reimplement eligibility (canPurchase/purchasable) — it only
// answers "what is the cheapest way to reach this node," consuming each
// node's already-computed cost and owned state. "Reachable" here means
// "connected in the tree graph," not "currently purchasable" — those are
// different questions on purpose.
// ─────────────────────────────────────────────────────────────────────────────

export interface EnergyGraphNode {
  key: string
  cost: number
  owned: boolean
  /** Tier-1 / row-0 nodes are always independently purchasable regardless of what else is owned. */
  isEntryPoint: boolean
}

export interface EnergyGraphEdge {
  from: string
  to: string
}

export interface EnergyPathResult {
  /** Ordered node keys from the route's start through the target, inclusive of both ends. */
  path: string[]
  /** Sum of cost for every UNOWNED node on the path (owned nodes cost 0 to pass through). */
  totalCost: number
  /** Count of nodes on the path that would actually need purchasing. */
  purchaseCount: number
}

/**
 * Node-weighted shortest path (Dijkstra), converted to edge-weighted the
 * standard way: the cost of entering node B from A is charged to that edge,
 * as ownedCost(B) — 0 if B is already owned, B.cost otherwise. A virtual
 * source node connects to every OWNED node (weight 0 — free to start
 * anywhere already owned) and every ENTRY POINT node (weight = its own
 * cost — tier-1 nodes are always buyable from nothing). Ties on total cost
 * prefer the route with fewer nodes (a cheaper-per-node route reads as
 * "more direct" even at equal XP).
 */
export function findCheapestPath(
  nodes: EnergyGraphNode[],
  edges: EnergyGraphEdge[],
  targetKey: string,
): EnergyPathResult | null {
  const nodeMap = new Map(nodes.map(n => [n.key, n]))
  const target = nodeMap.get(targetKey)
  if (!target) return null

  // Already owned — nothing to path to.
  if (target.owned) return { path: [targetKey], totalCost: 0, purchaseCount: 0 }

  const ownedCost = (n: EnergyGraphNode) => (n.owned ? 0 : n.cost)

  const adjacency = new Map<string, string[]>()
  for (const n of nodes) adjacency.set(n.key, [])
  for (const e of edges) {
    adjacency.get(e.from)?.push(e.to)
    adjacency.get(e.to)?.push(e.from)
  }

  const SOURCE = '__energy_source__'
  const dist = new Map<string, number>([[SOURCE, 0]])
  const hops = new Map<string, number>([[SOURCE, 0]])
  const prev = new Map<string, string | null>()
  const visited = new Set<string>()
  const frontier = new Set<string>([SOURCE])

  const sourceEdges: Array<[string, number]> = []
  for (const n of nodes) {
    if (n.owned) sourceEdges.push([n.key, 0])
    else if (n.isEntryPoint) sourceEdges.push([n.key, n.cost])
  }

  while (frontier.size > 0) {
    let u: string | null = null
    let best = Infinity
    for (const cand of frontier) {
      const d = dist.get(cand) ?? Infinity
      if (d < best) { best = d; u = cand }
    }
    if (u === null) break
    frontier.delete(u)
    if (visited.has(u)) continue
    visited.add(u)
    if (u === targetKey) break

    const neighbors: Array<[string, number]> = u === SOURCE
      ? sourceEdges
      : (adjacency.get(u) ?? []).map(v => {
          const vNode = nodeMap.get(v)
          return [v, vNode ? ownedCost(vNode) : Infinity] as [string, number]
        })

    for (const [v, weight] of neighbors) {
      if (visited.has(v)) continue
      const nd = (dist.get(u) ?? Infinity) + weight
      const nh = (hops.get(u) ?? 0) + 1
      const currentD = dist.get(v) ?? Infinity
      const currentH = hops.get(v) ?? Infinity
      if (nd < currentD || (nd === currentD && nh < currentH)) {
        dist.set(v, nd)
        hops.set(v, nh)
        prev.set(v, u)
        frontier.add(v)
      }
    }
  }

  // Unreachable — should not happen in a connected tree, but never crash/hang.
  if (!dist.has(targetKey)) return null

  const path: string[] = []
  let cur: string | null = targetKey
  while (cur && cur !== SOURCE) {
    path.unshift(cur)
    cur = prev.get(cur) ?? null
  }

  const totalCost = dist.get(targetKey) ?? 0
  const purchaseCount = path.filter(k => !(nodeMap.get(k)?.owned ?? false)).length

  return { path, totalCost, purchaseCount }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENERGY TRACE — GSAP orchestration for the hover path animation (Prompt 8)
//
// Not pure (touches the DOM via gsap) and not React (no hooks) — lives here
// rather than in a new file because it's still squarely a "tree graph"
// concern: it consumes the exact same path result and the same bar/plaque
// DOM shape (data-cell-key / data-bar-id) the pathfinding above and
// useConnectorLayout above already establish. Callers (TalentTree.tsx,
// SigNodeGrid in TalentSurface.tsx) own the hover state and the container
// ref; this function only ever touches elements found inside the container
// they hand it, and only ever elements on the given path — nothing else is
// read or written.
//
// Every element this function sets an inline style on is pushed onto
// `touched` and reverted via `clearProps` on kill, regardless of where in
// the timeline the kill happens — this is what guarantees rapid hovering
// across many nodes never leaves a bar/plaque stuck in path-glow: the
// caller's job is only to call `.kill()` on the previous handle before
// starting a new trace (or on hover-out), every single time.
// ─────────────────────────────────────────────────────────────────────────────

export interface EnergyTraceBar {
  id: string
  top: number
  left: number
  width: number
  height: number
}

export interface EnergyTraceHandle {
  kill: () => void
}

const PATH_GLOW = 'var(--path-glow)'
const SEGMENT_SECONDS = 0.12
const BLOOM_SECONDS = 0.16

function findBarWithDirection(bars: EnergyTraceBar[], a: string, b: string): { bar: EnergyTraceBar; forward: boolean } | null {
  const fwd = bars.find(x => x.id === `${a}>${b}`)
  if (fwd) return { bar: fwd, forward: true }
  const rev = bars.find(x => x.id === `${b}>${a}`)
  if (rev) return { bar: rev, forward: false }
  return null
}

/**
 * Runs (or, under reduced motion, instantly applies) the energy trace for
 * `path` inside `container`. `bars` is the live ConnectorBar[] geometry
 * (structurally compatible with useConnectorLayout's own output — only the
 * id/top/left/width/height fields are used). Returns a handle whose `kill()`
 * must be called exactly once, whether the trace finished naturally or the
 * user moved on before it did.
 */
export function runEnergyTrace(
  container: HTMLElement,
  bars: EnergyTraceBar[],
  path: string[],
  opts: { reducedMotion: boolean },
): EnergyTraceHandle {
  const touched: HTMLElement[] = []

  const plaqueEl = (cellKey: string) => container.querySelector<HTMLElement>(`[data-cell-key="${cellKey}"]`)

  function chargeBarInstant(el: HTMLElement) {
    touched.push(el)
    gsap.set(el, { backgroundColor: PATH_GLOW, boxShadow: `0 0 8px ${PATH_GLOW}` })
  }
  function chargePlaqueInstant(el: HTMLElement, strong: boolean) {
    touched.push(el)
    gsap.set(el, {
      opacity: 1,
      filter: 'none',
      borderColor: PATH_GLOW,
      boxShadow: strong ? `0 0 20px ${PATH_GLOW}` : `0 0 10px ${PATH_GLOW}`,
    })
  }

  function revert() {
    for (const el of touched) {
      gsap.set(el, { clearProps: 'opacity,filter,backgroundColor,boxShadow,borderColor,scaleX,scaleY,scale,transformOrigin' })
    }
  }

  const segments = path.slice(0, -1).map((from, i) => ({ from, to: path[i + 1] }))

  if (opts.reducedMotion) {
    // Same end state, applied instantly, no timeline — this is decision
    // support, not decoration; reduced motion must not lose information.
    for (const seg of segments) {
      const found = findBarWithDirection(bars, seg.from, seg.to)
      const barEl = found ? container.querySelector<HTMLElement>(`[data-bar-id="${found.bar.id}"]`) : null
      if (barEl) chargeBarInstant(barEl)
    }
    for (let i = 1; i < path.length; i++) {
      const el = plaqueEl(path[i])
      if (el) chargePlaqueInstant(el, i === path.length - 1)
    }
    return { kill: revert }
  }

  const tl = gsap.timeline()

  segments.forEach((seg, i) => {
    const found = findBarWithDirection(bars, seg.from, seg.to)
    const barEl = found ? container.querySelector<HTMLElement>(`[data-bar-id="${found.bar.id}"]`) : null
    const isLast = i === segments.length - 1

    if (barEl) {
      touched.push(barEl)
      const horizontal = found!.bar.width >= found!.bar.height
      const origin = horizontal
        ? (found!.forward ? 'left center' : 'right center')
        : (found!.forward ? 'top center' : 'bottom center')
      tl.set(barEl, {
        transformOrigin: origin,
        backgroundColor: PATH_GLOW,
        boxShadow: `0 0 8px ${PATH_GLOW}`,
        [horizontal ? 'scaleX' : 'scaleY']: 0,
      })
      tl.to(barEl, { [horizontal ? 'scaleX' : 'scaleY']: 1, duration: SEGMENT_SECONDS, ease: 'power1.inOut' })
    } else {
      tl.to({}, { duration: SEGMENT_SECONDS })
    }

    tl.call(() => {
      const el = plaqueEl(seg.to)
      if (el) chargePlaqueInstant(el, isLast)
      if (isLast && el) {
        gsap.fromTo(el, { scale: 1 }, { scale: 1.06, duration: BLOOM_SECONDS, yoyo: true, repeat: 1, ease: 'sine.inOut' })
      }
    })
  })

  return {
    kill: () => {
      tl.kill()
      revert()
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TREE ENTRANCE — GSAP orchestration for the tier-by-tier "power on" reveal
// (Prompt 9). Same conventions as runEnergyTrace above: not pure, touches the
// DOM via gsap, lives here because it consumes the same bar/plaque DOM shape
// (data-cell-key / data-bar-id) and the same ConnectorBar-shaped geometry.
// Does NOT rebuild or re-render the connector layer — it only ever animates
// scaleX/scaleY/transformOrigin on the bar elements useConnectorLayout already
// laid out, the same "wipe" technique runEnergyTrace uses for its path
// segments (this codebase's existing substitute for literal SVG stroke-dash,
// since bars are plain positioned <div>s, not <path> elements).
//
// Only ever sets opacity/scale/transform-adjacent inline styles — never
// pointer-events or visibility — so every plaque stays clickable at every
// point in the timeline, satisfying "must stay interactive throughout."
// Callers are responsible for calling `.kill()` on click-through-entrance
// (jumping instantly to the fully-revealed state) and for only starting this
// once per real tree-data change (mount/spec-switch), not on every re-render.
// ─────────────────────────────────────────────────────────────────────────────

export interface EntranceTier {
  /** data-cell-key values for every plaque in this row/tier. */
  cellKeys: string[]
  /** data-bar-id values for connectors leaving this row (into the row below, or rightward within it) — drawn immediately after this tier's plaques settle. */
  barIds: string[]
}

export interface EntranceHandle {
  /** Kills the in-flight timeline and reverts every touched element back to its natural (CSS-driven) state — final visual result is identical whether the entrance finished naturally or was cut short. */
  kill: () => void
}

const ENTRANCE_PLAQUE_SECONDS = 0.22
const ENTRANCE_PLAQUE_STAGGER = 0.035
const ENTRANCE_BAR_SECONDS = 0.16

/**
 * Runs the tier-by-tier entrance for `tiers` (ascending row order) inside
 * `container`. `bars` is the live ConnectorBar[] geometry (same shape
 * runEnergyTrace consumes — only id/width/height are used, to decide
 * horizontal vs vertical wipe direction). Under reduced motion this is a
 * true no-op (elements are never hidden in the first place — see the
 * `reducedMotion` branch in the caller, which must skip invoking this
 * function's hiding step entirely rather than relying on this handle to
 * undo it), returning an inert handle purely so callers don't need a
 * separate reduced-motion code path at the call site.
 */
export function runTreeEntrance(
  container: HTMLElement,
  tiers: EntranceTier[],
  bars: EnergyTraceBar[],
  opts: { reducedMotion: boolean },
): EntranceHandle {
  if (opts.reducedMotion) return { kill: () => {} }

  const touched: HTMLElement[] = []
  const barMap = new Map(bars.map(b => [b.id, b]))

  function revert() {
    gsap.killTweensOf(touched)
    // `.plaque` (TalentTree.module.css) declares `transition: opacity
    // var(--ease-default), filter var(--ease-default), ...` for its normal
    // hover/state changes. clearProps removes gsap's inline opacity/scale
    // override, which hands the property back to the CSS cascade (e.g. a
    // locked plaque's own opacity: 0.28) — but with that transition rule
    // still active, the browser eases toward the new value over ~200-300ms
    // instead of snapping, so a cut-short entrance kept visibly drifting for
    // a quarter-second after the "kill". Disabling transitions for exactly
    // the frame where the inline override is removed forces an instant
    // snap; restoring `transition` immediately after (post-reflow) leaves
    // the plaque's normal hover/interaction transitions intact going
    // forward — this only ever suppresses the one transition tied to this
    // clearProps write.
    for (const el of touched) {
      const prevTransition = el.style.transition
      el.style.transition = 'none'
      gsap.set(el, { clearProps: 'opacity,scale,scaleX,scaleY,transformOrigin' })
      void el.offsetHeight // force layout so the transition:none above actually applies before it's restored
      el.style.transition = prevTransition
    }
  }

  // Runs the same clearProps cleanup whether the entrance finishes on its
  // own or gets cut short — without this, natural completion left every
  // plaque pinned at gsap's inline opacity:1/scale:1 forever (nothing else
  // ever clears it), which permanently defeated a locked plaque's own
  // dimmed CSS look (opacity: 0.28 + filter) the moment the entrance
  // finished, not just during it.
  const tl = gsap.timeline({ onComplete: revert })

  // Each tier gets one label marking where its block starts (the current end
  // of the timeline when reached) — every bar in that tier is positioned AT
  // that label, so they wipe in parallel with each other and with the
  // plaque fade, not chained one after another. Without this, a tier with
  // several outgoing bars took far longer than its plaques alone (measured:
  // 5 tiers of an average spec took 3.4s total with bars serialized: fixed
  // to ~1.6s with them parallel — still tier-by-tier, just each tier's own
  // work happens together instead of bar-by-bar).
  tiers.forEach((tier, i) => {
    const label = `tier${i}`
    tl.addLabel(label)

    const plaqueEls = tier.cellKeys
      .map(k => container.querySelector<HTMLElement>(`[data-cell-key="${k}"]`))
      .filter((el): el is HTMLElement => !!el)
    plaqueEls.forEach(el => touched.push(el))

    if (plaqueEls.length > 0) {
      tl.fromTo(
        plaqueEls,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: ENTRANCE_PLAQUE_SECONDS, stagger: ENTRANCE_PLAQUE_STAGGER, ease: 'power2.out' },
        label,
      )
    }

    tier.barIds.forEach(barId => {
      const barEl = container.querySelector<HTMLElement>(`[data-bar-id="${barId}"]`)
      const bar = barMap.get(barId)
      if (!barEl || !bar) return
      touched.push(barEl)
      const horizontal = bar.width >= bar.height
      tl.set(barEl, { transformOrigin: horizontal ? 'left center' : 'top center', [horizontal ? 'scaleX' : 'scaleY']: 0 }, label)
      tl.to(barEl, { [horizontal ? 'scaleX' : 'scaleY']: 1, duration: ENTRANCE_BAR_SECONDS, ease: 'power1.inOut' }, label)
    })
  })

  return {
    kill: () => {
      // Jump every child tween to its declared END value FIRST, before
      // killing — a bare tl.kill() leaves elements frozen wherever their
      // individual sub-tween happened to be (mid-fade for a stagger not yet
      // reached, or still visibly drifting for a few more frames while
      // gsap's ticker finishes flushing already-queued renders). Jumping to
      // progress(1) means every touched element is already at its correct
      // fully-revealed state by the time clearProps below removes the
      // inline override, so any stray post-kill render is harmless (it
      // would just reapply the same, already-correct values).
      tl.progress(1)
      tl.kill()
      revert()
    },
  }
}
