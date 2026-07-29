'use client'
import { useMemo, useCallback } from 'react'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import { buildForceCellKeyMap, type ForceTreeNode, type ForceTreeConnection } from '@/components/character/ForcePowerTree'

interface CharForceAbility {
  force_power_key: string
  force_ability_key: string
  tree_row: number
  tree_col: number
}

interface RefForceAbility {
  name: string
  description?: string | null
  pip_cost?: number | null
}

interface RefForcePower {
  key: string
  name: string
  description?: string | null
  ability_tree?: {
    rows?: {
      index: number
      abilities: string[]
      directions?: { up?: boolean; down?: boolean; left?: boolean; right?: boolean }[]
      spans?: number[]
      costs?: number[]
    }[]
  } | null
}

interface UseForcePowersParams {
  charForceAbilities: CharForceAbility[]
  refForcePowers: RefForcePower[]
  refForceAbilityMap: Record<string, RefForceAbility>
  refForcePowerMap: Record<string, RefForcePower>
}

export function useForcePowers({ charForceAbilities, refForcePowers, refForceAbilityMap, refForcePowerMap }: UseForcePowersParams) {
  const buildForcePowerTree = useCallback((powerKey: string): {
    powerName: string
    nodes: ForceTreeNode[]
    connections: ForceTreeConnection[]
    purchasedCount: number
    totalCount: number
  } | null => {
    const refPower = refForcePowerMap[powerKey]
    if (!refPower?.ability_tree?.rows) return null
    const purchasedSet = new Set(charForceAbilities.filter(a => a.force_power_key === powerKey).map(a => `${a.tree_row}-${a.tree_col}`))
    const nodes: ForceTreeNode[] = []
    const connections: ForceTreeConnection[] = []
    // Pass 1: build every node's row/col/span/cost/purchased and the
    // connection list. canPurchase is deferred to pass 2 below — it needs the
    // full span-ownership map, which itself needs every node's span first.
    for (const row of refPower.ability_tree.rows) {
      const abilities = row.abilities || []
      const dirs = row.directions || []
      const spans = row.spans || []
      const costs = row.costs || []
      for (let col = 0; col < abilities.length; col++) {
        const aKey = abilities[col]
        const ref  = refForceAbilityMap[aKey]
        const span = spans[col] ?? 1
        const cost = costs[col] ?? 0
        const isPurchased = purchasedSet.has(`${row.index}-${col}`)
        const dir = dirs[col] || {}
        nodes.push({ abilityKey: aKey, name: ref?.name || aKey, description: ref?.description ?? undefined, row: row.index, col, span, cost, purchased: isPurchased, canPurchase: false, ownedRank: 0, totalRanks: 0 })
        if (span > 0) {
          if (dir.right && col < 3) connections.push({ fromRow: row.index, fromCol: col, toRow: row.index, toCol: col + 1 })
          if (dir.down) connections.push({ fromRow: row.index, fromCol: col, toRow: row.index + 1, toCol: col })
        }
      }
    }

    // Pass 2: canPurchase. A span>1 node (e.g. the row-0 base, span 4) is only
    // ever recorded as purchased at its OWNING column — an adjacency check
    // against a neighbour column it merely covers must resolve to that owning
    // column before testing purchasedSet, or it never sees the purchase (e.g.
    // ALTER's row-1 children never saw the base as owned). Uses the exact same
    // resolution ForcePowerTree.tsx's connector/plaque rendering already
    // relies on (buildForceCellKeyMap) — one shared source of truth for
    // "what column does this position actually belong to," not a second
    // parallel implementation.
    const ownerKeyMap = buildForceCellKeyMap(nodes)
    const isPurchasedAt = (row: number, col: number) =>
      purchasedSet.has(ownerKeyMap.get(`${row}-${col}`) ?? `${row}-${col}`)

    const nodeByPos = new Map(nodes.map(n => [`${n.row}-${n.col}`, n]))
    for (const row of refPower.ability_tree.rows) {
      const dirs = row.directions || []
      const costs = row.costs || []
      const abilities = row.abilities || []
      for (let col = 0; col < abilities.length; col++) {
        const node = nodeByPos.get(`${row.index}-${col}`)
        if (!node || node.purchased || (costs[col] ?? 0) <= 0) continue
        const dir = dirs[col] || {}
        let canPurchase = false
        if (row.index === 0) canPurchase = true
        else {
          if (dir.up) canPurchase = canPurchase || isPurchasedAt(row.index - 1, col)
          if (dir.left && col > 0) canPurchase = canPurchase || isPurchasedAt(row.index, col - 1)
          if (dir.right && col < 3) canPurchase = canPurchase || isPurchasedAt(row.index, col + 1)
          if (dir.down) canPurchase = canPurchase || isPurchasedAt(row.index + 1, col)
        }
        node.canPurchase = canPurchase
      }
    }

    const displayNodes = nodes.filter(n => n.span > 0)

    // Some abilities occupy more than one distinct (row,col) position within
    // the same power's tree (e.g. JERINF's JERINFRANGE, WARFOR's WARFORDURATION)
    // — a ranked-talent-equivalent. ownedRank/totalRanks are derived from the
    // exact same purchasedSet/displayNodes already computed above, not a
    // second counting mechanism.
    const totalByKey = new Map<string, number>()
    const ownedByKey = new Map<string, number>()
    for (const n of displayNodes) {
      if (n.cost <= 0) continue
      totalByKey.set(n.abilityKey, (totalByKey.get(n.abilityKey) ?? 0) + 1)
      if (n.purchased) ownedByKey.set(n.abilityKey, (ownedByKey.get(n.abilityKey) ?? 0) + 1)
    }
    for (const n of nodes) {
      n.totalRanks = totalByKey.get(n.abilityKey) ?? 0
      n.ownedRank = ownedByKey.get(n.abilityKey) ?? 0
    }

    return { powerName: refPower.name, nodes, connections, purchasedCount: displayNodes.filter(n => n.purchased).length, totalCount: displayNodes.filter(n => n.cost > 0).length }
  }, [charForceAbilities, refForcePowerMap, refForceAbilityMap])

  const allForcePowers = useMemo((): ForcePowerDisplay[] => {
    // Ability keys get renamed across reSpec snapshot reseeds (e.g. migration 102),
    // but a character's purchase is permanently anchored to its tree position — match
    // on (power, row, col), the same way buildForcePowerTree does, not on the key.
    const purchasedPositions = new Set<string>()
    for (const a of charForceAbilities) {
      purchasedPositions.add(`${a.force_power_key}:${a.tree_row}-${a.tree_col}`)
    }
    return refForcePowers
      .filter(fp => fp.ability_tree?.rows?.length)
      .map(fp => {
        const abilityMap = new Map<string, ForcePowerDisplay['abilities'][number]>()
        for (const row of (fp.ability_tree?.rows ?? [])) {
          for (let col = 0; col < (row.abilities || []).length; col++) {
            const aKey = row.abilities[col]
            const cost = (row.costs || [])[col] ?? 0
            if (!aKey || cost === 0) continue
            const ref = refForceAbilityMap[aKey]
            if (!ref) continue
            const isPurchased = purchasedPositions.has(`${fp.key}:${row.index}-${col}`)
            const existing = abilityMap.get(aKey)
            if (existing) {
              existing.totalRanks++
              if (isPurchased) existing.purchasedRanks++
            } else {
              abilityMap.set(aKey, { key: aKey, name: ref.name, description: ref.description ?? undefined, purchasedRanks: isPurchased ? 1 : 0, totalRanks: 1, cost, pip_cost: ref.pip_cost ?? 1 })
            }
          }
        }
        const abilities = Array.from(abilityMap.values())
        const purchasedCount = abilities.reduce((s, a) => s + Math.min(a.purchasedRanks, a.totalRanks), 0)
        const totalCount     = abilities.reduce((s, a) => s + a.totalRanks, 0)
        const treeData = buildForcePowerTree(fp.key)
        return {
          powerKey: fp.key, powerName: fp.name, description: fp.description ?? undefined,
          purchasedCount, totalCount, abilities,
          treeNodes: treeData?.nodes ?? [],
          treeConnections: treeData?.connections ?? [],
        }
      })
      .sort((a, b) => {
        if (a.purchasedCount > 0 && b.purchasedCount === 0) return -1
        if (a.purchasedCount === 0 && b.purchasedCount > 0) return 1
        return a.powerName.localeCompare(b.powerName)
      })
  }, [charForceAbilities, refForcePowers, refForceAbilityMap, buildForcePowerTree])

  return { allForcePowers, buildForcePowerTree }
}
