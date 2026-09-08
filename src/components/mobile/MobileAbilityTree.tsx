'use client'

import { useMemo, useRef } from 'react'
import type { RefSpecialization, RefTalent, CharacterTalent, CharacterSpecialization, SigAbility, LockedSigAbility, CharacterSigAbilityNode } from '@/lib/types'
import { buildCharacterTalentTree, adaptSigAbilityNodes } from '@/lib/buildTalentTree'
import type { TalentTreeConnection } from '@/components/character/TalentTree'
import { useConnectorLayout } from '@/hooks/useConnectorLayout'
import type { TalentDetailData } from './MobileTalentDetailSheet'

// ── Normalized node shape — one renderer for both talent trees (5 rows) and
// signature ability trees (3 rows, row 0 spans all 4 columns). ────────────
interface NormNode {
  cellKey:      string   // matches the tree's own data-cell-key convention
  key:          string   // talentKey or sig node key — identifies WHAT this node is
  name:         string
  description?: string
  row:          number
  col:          number
  wide:         boolean  // true only for a signature ability's row-0 base node
  cost:         number
  purchased:    boolean
  purchasable:  boolean
  isRanked:     boolean
  ownedRank:    number
  activation?:  string   // absent for signature ability nodes
}

interface TreeBundle {
  specName: string
  rowCount: number
  nodes: NormNode[]
  connections: TalentTreeConnection[]
  cellKey: (row: number, col: number) => string
}

export type TreeTabKind = 'spec' | 'sig'

export interface TreeTab {
  kind: TreeTabKind
  /** specKey for a 'spec' tab, specSlot for a 'sig' tab (see lockedSigAbilities keying). */
  key:  string
  name: string
  purchased: number
  total:     number
}

/** Builds the tab strip data — one tab per owned specialization, plus one
 *  per locked-in signature ability. Any number of each; nothing hard-coded. */
export function buildTreeTabs(
  charSpecs: CharacterSpecialization[],
  refSpecMap: Record<string, RefSpecialization>,
  talents: CharacterTalent[],
  lockedSigAbilities: Record<string, LockedSigAbility>,
  sigAbilities: SigAbility[],
): TreeTab[] {
  const specTabs: TreeTab[] = charSpecs.map(cs => {
    const spec = refSpecMap[cs.specialization_key]
    const purchased = talents.filter(t => t.specialization_key === cs.specialization_key).length
    return { kind: 'spec', key: cs.specialization_key, name: spec?.name ?? cs.specialization_key, purchased, total: 20 }
  })

  const sigTabs: TreeTab[] = Object.values(lockedSigAbilities).map(locked => {
    const ability = sigAbilities.find(a => a.key === locked.sigAbilityKey)
    return {
      kind: 'sig',
      key:  locked.specSlot,
      name: ability?.name ?? locked.sigAbilityKey,
      purchased: locked.purchasedNodeKeys.length,
      total: ability?.nodes.length ?? 0,
    }
  })

  return [...specTabs, ...sigTabs]
}

function buildSpecBundle(
  specKey: string,
  refSpecMap: Record<string, RefSpecialization>,
  refTalentMap: Record<string, RefTalent>,
  talents: CharacterTalent[],
): TreeBundle | null {
  const built = buildCharacterTalentTree(specKey, refSpecMap, refTalentMap, talents)
  if (!built) return null
  const cellKey = (row: number, col: number) => `${row}-${col}`
  return {
    specName: built.specName,
    rowCount: 5,
    cellKey,
    connections: built.connections,
    nodes: built.nodes.map(n => ({
      cellKey: cellKey(n.row, n.col),
      key: n.talentKey, name: n.name, description: n.description,
      row: n.row, col: n.col, wide: false, cost: n.cost,
      purchased: n.purchased, purchasable: n.canPurchase,
      isRanked: n.isRanked, ownedRank: n.ownedRank, activation: n.activation,
    })),
  }
}

function buildSigBundle(
  specSlot: string,
  lockedSigAbilities: Record<string, LockedSigAbility>,
  sigAbilities: SigAbility[],
  purchasedSigNodes: CharacterSigAbilityNode[],
): TreeBundle | null {
  const locked = lockedSigAbilities[specSlot]
  const ability = locked ? sigAbilities.find(a => a.key === locked.sigAbilityKey) : null
  if (!locked || !ability) return null

  const purchasedRowCols = new Set(
    purchasedSigNodes
      .filter(n => n.sig_ability_key === locked.sigAbilityKey && n.spec_slot === specSlot)
      .map(n => `${n.row_index}-${n.col_index}`),
  )
  const { nodes, connections } = adaptSigAbilityNodes(ability.nodes, purchasedRowCols)
  // Sig trees resolve row 0 (the wide base node) to a fixed "base" cell key
  // regardless of column — see adaptSigAbilityNodes's own comment for why.
  const cellKey = (row: number, col: number) => (row === 0 ? 'base' : `${row}-${col}`)

  return {
    specName: ability.name,
    rowCount: 3,
    cellKey,
    connections,
    nodes: nodes.map(n => ({
      cellKey: cellKey(n.row, n.col),
      key: n.key, name: n.name, description: n.description,
      row: n.row, col: n.col, wide: n.colSpan > 1, cost: n.cost,
      purchased: n.purchased, purchasable: n.purchasable,
      isRanked: false, ownedRank: 0, activation: undefined,
    })),
  }
}

/** Plain-language unlock text, derived only from the tree's own connection
 *  edges — never hand-written per node. Both directions of `connections`
 *  are checked since an edge is only ever recorded once (right/down, plus
 *  the sig tree's special base→row-1 "up" edge) but is functionally
 *  bidirectional: owning either end satisfies the adjacency check for the
 *  other's purchasability. */
function buildUnlockText(node: NormNode, bundle: TreeBundle): { unlockedByText: string; opensText: string } {
  const neighborCellKeys = new Set<string>()
  for (const c of bundle.connections) {
    const fromKey = bundle.cellKey(c.fromRow, c.fromCol)
    const toKey   = bundle.cellKey(c.toRow, c.toCol)
    if (fromKey === node.cellKey) neighborCellKeys.add(toKey)
    if (toKey === node.cellKey)   neighborCellKeys.add(fromKey)
  }
  const neighbors = bundle.nodes.filter(n => neighborCellKeys.has(n.cellKey))

  const unlockedByText = node.row === 0
    ? 'Available from the start of this tree — no prerequisite.'
    : neighbors.length > 0
      ? `Unlocked by owning: ${neighbors.map(n => n.name).join(', ')}.`
      : 'No connected prerequisite found in this tree.'

  const unowned = neighbors.filter(n => !n.purchased)
  const opensText = node.purchased
    ? (unowned.length > 0 ? `Owning this opens: ${unowned.map(n => n.name).join(', ')}.` : 'Every connected node is already owned.')
    : (unowned.length > 0 ? `Purchasing this would open: ${unowned.map(n => n.name).join(', ')}.` : 'Purchasing this opens nothing further in this tree.')

  return { unlockedByText, opensText }
}

export interface MobileAbilityTreeProps {
  tabs:      TreeTab[]
  activeTab: TreeTab
  onSelectTab: (tab: TreeTab) => void
  onSelectNode: (data: TalentDetailData) => void
  onBack: () => void
  xpAvailable: number
  refSpecMap: Record<string, RefSpecialization>
  refTalentMap: Record<string, RefTalent>
  talents: CharacterTalent[]
  lockedSigAbilities: Record<string, LockedSigAbility>
  sigAbilities: SigAbility[]
  purchasedSigNodes: CharacterSigAbilityNode[]
}

export function MobileAbilityTree({
  tabs, activeTab, onSelectTab, onSelectNode, onBack, xpAvailable,
  refSpecMap, refTalentMap, talents, lockedSigAbilities, sigAbilities, purchasedSigNodes,
}: MobileAbilityTreeProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const bundle = useMemo(() => {
    return activeTab.kind === 'spec'
      ? buildSpecBundle(activeTab.key, refSpecMap, refTalentMap, talents)
      : buildSigBundle(activeTab.key, lockedSigAbilities, sigAbilities, purchasedSigNodes)
  }, [activeTab, refSpecMap, refTalentMap, talents, lockedSigAbilities, sigAbilities, purchasedSigNodes])

  const nodeByCellKey = useMemo(() => {
    const map = new Map<string, NormNode>()
    if (bundle) for (const n of bundle.nodes) map.set(n.cellKey, n)
    return map
  }, [bundle])

  const bars = useConnectorLayout({
    containerRef: canvasRef,
    connections: bundle?.connections ?? [],
    cellKey: (row, col) => bundle?.cellKey(row, col) ?? `${row}-${col}`,
    isOwned: (row, col) => {
      const key = bundle?.cellKey(row, col) ?? `${row}-${col}`
      return nodeByCellKey.get(key)?.purchased ?? false
    },
    deps: [activeTab.kind, activeTab.key],
  })

  function handleNodeTap(node: NormNode) {
    if (!bundle) return
    const state: TalentDetailData['state'] = node.purchased ? 'owned' : node.purchasable ? 'available' : 'locked'
    const { unlockedByText, opensText } = buildUnlockText(node, bundle)

    let purchaseTarget: TalentDetailData['purchaseTarget']
    if (activeTab.kind === 'spec') {
      purchaseTarget = { kind: 'talent', row: node.row, col: node.col, activeSpecKey: activeTab.key }
    } else {
      const locked = lockedSigAbilities[activeTab.key]
      if (locked) {
        if (node.row === 0) {
          purchaseTarget = { kind: 'sig-base', sigAbilityKey: locked.sigAbilityKey, specSlot: activeTab.key }
        } else {
          const ability = sigAbilities.find(a => a.key === locked.sigAbilityKey)
          const rawNode = ability?.nodes.find(n => n.rowIndex === node.row && n.colIndex === node.col)
          if (rawNode) purchaseTarget = { kind: 'sig-node', sigAbilityKey: locked.sigAbilityKey, node: rawNode }
        }
      }
    }

    onSelectNode({
      key: node.key, name: node.name, description: node.description,
      specName: bundle.specName, row: node.row, state, cost: node.cost,
      activation: node.activation, isRanked: node.isRanked, ownedRank: node.ownedRank,
      unlockedByText, opensText, purchaseTarget,
    })
  }

  return (
    <div className="m-tree-view">
      <div className="m-tree-topbar">
        <button type="button" className="m-icon-btn" onClick={onBack} aria-label="Back to search">←</button>
        <span className="m-tree-topbar-title">{bundle?.specName ?? activeTab.name}</span>
      </div>

      <div className="m-tab-strip">
        {tabs.map(tab => (
          <button
            key={`${tab.kind}-${tab.key}`}
            type="button"
            className={`m-tab${tab.kind === 'sig' ? ' is-sig' : ''}${activeTab.key === tab.key && activeTab.kind === tab.kind ? ' is-active' : ''}`}
            onClick={() => onSelectTab(tab)}
          >
            <span className="m-tab-name">{tab.name}</span>
            <span className="m-tab-count">{tab.purchased}/{tab.total}</span>
          </button>
        ))}
      </div>

      <div className="m-xp-banner"><strong>{xpAvailable}</strong> XP available</div>

      <div className="m-tree-scroll">
        {bundle ? (
          <div className="m-tree-canvas" ref={canvasRef}>
            <div className="m-tree-connectors">
              {bars.map(bar => (
                <div
                  key={bar.id}
                  data-bar-id={bar.id}
                  className={`m-tree-connector-bar${bar.active ? ' is-active' : ''}`}
                  // Measured per-connector geometry — no CSS-class equivalent, documented inline style exception
                  style={{ top: bar.top, left: bar.left, width: bar.width, height: bar.height }}
                />
              ))}
            </div>

            <div
              className="m-tree-grid"
              // grid-template-rows is data-driven (3 or 5 rows depending on
              // tree kind) — no fixed CSS-class value can express this,
              // documented inline style exception
              style={{ gridTemplateRows: `repeat(${bundle.rowCount}, 88px)` }}
            >
              {bundle.nodes.map(node => {
                const stateClass = node.purchased ? 'is-owned' : node.purchasable ? 'is-available' : 'is-locked'
                return (
                  <button
                    key={node.cellKey + (node.wide ? '' : `-${node.col}`)}
                    type="button"
                    data-cell-key={node.cellKey}
                    className={`m-tree-node ${stateClass}`}
                    // grid placement is data-driven per node (row/col from
                    // the tree data) — no CSS-class equivalent, documented
                    // inline style exception
                    style={{ gridRow: node.row + 1, gridColumn: node.wide ? '1 / -1' : node.col + 1 }}
                    onClick={() => handleNodeTap(node)}
                  >
                    <span className="m-tree-node-name">{node.name}</span>
                    <span className="m-tree-node-foot">
                      <span className="m-tree-node-cost">{node.cost} XP</span>
                      {node.purchased && <span className="m-tree-node-check" aria-label="Owned">✓</span>}
                    </span>
                    {node.isRanked && node.ownedRank > 0 && (
                      <span className="m-tree-node-pips" aria-label={`Rank ${node.ownedRank}`}>
                        {Array.from({ length: node.ownedRank }).map((_, i) => <span key={i} className="m-tree-node-pip" />)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="m-placeholder">
            <div className="m-placeholder-title">No tree data</div>
            <div className="m-placeholder-body">This tree could not be loaded.</div>
          </div>
        )}
      </div>

      <div className="m-legend">
        <span className="m-legend-item"><span className="m-legend-swatch is-owned" /> Owned</span>
        <span className="m-legend-item"><span className="m-legend-swatch is-available" /> Available</span>
        <span className="m-legend-item"><span className="m-legend-swatch is-locked" /> Locked</span>
      </div>
    </div>
  )
}
