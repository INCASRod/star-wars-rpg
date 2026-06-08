'use client'
import { useMemo, useCallback } from 'react'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import type { ForceTreeNode, ForceTreeConnection } from '@/components/character/ForcePowerTree'

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
        let canPurchase = false
        if (!isPurchased && cost > 0) {
          if (row.index === 0) canPurchase = true
          else {
            if (dir.up) canPurchase = canPurchase || purchasedSet.has(`${row.index - 1}-${col}`)
            if (dir.left && col > 0) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col - 1}`)
            if (dir.right && col < 3) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col + 1}`)
            if (dir.down) canPurchase = canPurchase || purchasedSet.has(`${row.index + 1}-${col}`)
          }
        }
        nodes.push({ abilityKey: aKey, name: ref?.name || aKey, description: ref?.description ?? undefined, row: row.index, col, span, cost, purchased: isPurchased, canPurchase })
        if (span > 0) {
          if (dir.right && col < 3) connections.push({ fromRow: row.index, fromCol: col, toRow: row.index, toCol: col + 1 })
          if (dir.down) connections.push({ fromRow: row.index, fromCol: col, toRow: row.index + 1, toCol: col })
        }
      }
    }
    const displayNodes = nodes.filter(n => n.span > 0)
    return { powerName: refPower.name, nodes, connections, purchasedCount: displayNodes.filter(n => n.purchased).length, totalCount: displayNodes.filter(n => n.cost > 0).length }
  }, [charForceAbilities, refForcePowerMap, refForceAbilityMap])

  const allForcePowers = useMemo((): ForcePowerDisplay[] => {
    const purchaseCount = new Map<string, number>()
    for (const a of charForceAbilities) {
      const k = `${a.force_power_key}:${a.force_ability_key}`
      purchaseCount.set(k, (purchaseCount.get(k) ?? 0) + 1)
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
            const existing = abilityMap.get(aKey)
            if (existing) {
              existing.totalRanks++
            } else {
              const purchased = purchaseCount.get(`${fp.key}:${aKey}`) ?? 0
              abilityMap.set(aKey, { key: aKey, name: ref.name, description: ref.description ?? undefined, purchasedRanks: purchased, totalRanks: 1, cost, pip_cost: ref.pip_cost ?? 1 })
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
