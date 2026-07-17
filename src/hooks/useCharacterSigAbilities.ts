'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchActiveDataset } from '@/lib/activeDataset'
import { randomUUID } from '@/lib/utils'
import type { SigAbility, SigAbilityNode, LockedSigAbility, CharacterSigAbilityNode } from '@/lib/types'

const TIER_5_XP_COST = 25

interface RefSigAbilityRow {
  key: string
  name: string
  description: string
  career_key: string
}

interface RefSigAbilityNodeRow {
  id: string
  sig_ability_key: string
  row_index: number
  col_index: number
  col_span: number
  node_key: string
  name: string
  description: string
  xp_cost: number
  connect_up: boolean
  connect_down: boolean
  connect_left: boolean
  connect_right: boolean
}

export function useCharacterSigAbilities(characterId: string, careerKey: string) {
  const [availableSigAbilities, setAvailableSigAbilities] = useState<SigAbility[]>([])
  const [purchasedNodes, setPurchasedNodes] = useState<CharacterSigAbilityNode[]>([])
  const [hasUnlockedTier5, setHasUnlockedTier5] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!characterId || !careerKey) { setLoading(false); return }
    setLoading(true)
    const supabase = createClient()
    const ds = await fetchActiveDataset(supabase)

    const [abilitiesRes, purchasedRes, charSpecsRes, careerRes] = await Promise.all([
      supabase
        .from('ref_sig_abilities')
        .select('*')
        .eq('dataset_source', ds)
        .eq('is_retired', false)
        .eq('career_key', careerKey),
      supabase
        .from('character_sig_ability_nodes')
        .select('*')
        .eq('character_id', characterId),
      supabase
        .from('character_specializations')
        .select('specialization_key')
        .eq('character_id', characterId),
      // ref_specializations.career_key is always NULL for the respec dataset
      // (migration 064) — in-career association lives on ref_careers.specialization_keys
      // instead, so look the career up directly rather than joining the other way.
      supabase
        .from('ref_careers')
        .select('specialization_keys')
        .eq('dataset_source', ds)
        .eq('key', careerKey)
        .maybeSingle(),
    ])

    const abilities: RefSigAbilityRow[] = abilitiesRes.data ?? []
    const abilityKeys = abilities.map(a => a.key)

    const nodesRes = abilityKeys.length > 0
      ? await supabase.from('ref_sig_ability_nodes').select('*').eq('dataset_source', ds).in('sig_ability_key', abilityKeys)
      : { data: [] as RefSigAbilityNodeRow[] }

    const nodesByAbility = new Map<string, SigAbilityNode[]>()
    for (const n of (nodesRes.data ?? []) as RefSigAbilityNodeRow[]) {
      const node: SigAbilityNode = {
        id: n.id,
        sigAbilityKey: n.sig_ability_key,
        rowIndex: n.row_index,
        colIndex: n.col_index,
        colSpan: n.col_span,
        nodeKey: n.node_key,
        name: n.name,
        description: n.description,
        xpCost: n.xp_cost,
        connectUp: n.connect_up,
        connectDown: n.connect_down,
        connectLeft: n.connect_left,
        connectRight: n.connect_right,
      }
      const list = nodesByAbility.get(n.sig_ability_key) ?? []
      list.push(node)
      nodesByAbility.set(n.sig_ability_key, list)
    }

    setAvailableSigAbilities(abilities.map(a => ({
      key: a.key,
      name: a.name,
      description: a.description,
      careerKey: a.career_key,
      nodes: (nodesByAbility.get(a.key) ?? []).sort((x, y) => x.rowIndex - y.rowIndex || x.colIndex - y.colIndex),
    })))

    setPurchasedNodes(purchasedRes.data ?? [])

    // hasUnlockedTier5: any xp_cost=25 character_talents row under an in-career specialization.
    const specKeys = (charSpecsRes.data ?? []).map((s: { specialization_key: string }) => s.specialization_key)
    const careerSpecKeys = new Set<string>((careerRes.data as { specialization_keys: string[] } | null)?.specialization_keys ?? [])
    const inCareerKeys = specKeys.filter(k => careerSpecKeys.has(k))

    if (inCareerKeys.length > 0) {
      const { count } = await supabase
        .from('character_talents')
        .select('id', { count: 'exact', head: true })
        .eq('character_id', characterId)
        .eq('xp_cost', TIER_5_XP_COST)
        .in('specialization_key', inCareerKeys)
      setHasUnlockedTier5((count ?? 0) > 0)
    } else {
      setHasUnlockedTier5(false)
    }

    setLoading(false)
  }, [characterId, careerKey])

  useEffect(() => {
    fetchAll()
    if (!characterId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`char-sig-abilities-${characterId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'character_sig_ability_nodes', filter: `character_id=eq.${characterId}` },
        fetchAll,
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [characterId, fetchAll])

  const lockedAbilities = useMemo(() => {
    const map: Record<string, LockedSigAbility> = {}
    for (const n of purchasedNodes) {
      if (n.row_index !== 0 || !n.spec_slot) continue
      map[n.spec_slot] = {
        sigAbilityKey: n.sig_ability_key,
        specSlot: n.spec_slot,
        purchasedNodeKeys: purchasedNodes
          .filter(p => p.spec_slot === n.spec_slot && p.sig_ability_key === n.sig_ability_key)
          .map(p => p.node_key),
      }
    }
    return map
  }, [purchasedNodes])

  const lockInAbility = useCallback(async (sigAbilityKey: string, specSlot: string) => {
    if (!hasUnlockedTier5) {
      throw new Error('Tier 5 talents must be unlocked in an in-career specialisation before locking in a signature ability.')
    }
    const ability = availableSigAbilities.find(a => a.key === sigAbilityKey)
    const baseNode = ability?.nodes.find(n => n.rowIndex === 0)
    if (!baseNode) throw new Error(`No base node found for signature ability ${sigAbilityKey}`)

    const supabase = createClient()
    const id = randomUUID()
    const purchasedAt = new Date().toISOString()

    // Optimistic: update local state before the write.
    setPurchasedNodes(prev => [...prev, {
      id, character_id: characterId, sig_ability_key: sigAbilityKey, node_key: baseNode.nodeKey,
      col_index: baseNode.colIndex, row_index: 0, xp_cost: baseNode.xpCost,
      spec_slot: specSlot, purchased_at: purchasedAt,
    }])

    const { data: charRow } = await supabase.from('characters').select('xp_available').eq('id', characterId).single()
    const newXp = (charRow?.xp_available ?? 0) - baseNode.xpCost

    await Promise.all([
      supabase.from('character_sig_ability_nodes').insert({
        id, character_id: characterId, sig_ability_key: sigAbilityKey, node_key: baseNode.nodeKey,
        col_index: baseNode.colIndex, row_index: 0, xp_cost: baseNode.xpCost, spec_slot: specSlot,
      }),
      supabase.from('characters').update({ xp_available: newXp }).eq('id', characterId),
    ])
  }, [hasUnlockedTier5, availableSigAbilities, characterId])

  const purchaseNode = useCallback(async (sigAbilityKey: string, node: SigAbilityNode) => {
    const locked = Object.values(lockedAbilities).find(l => l.sigAbilityKey === sigAbilityKey)
    if (!locked) {
      throw new Error(`Signature ability ${sigAbilityKey} has not been locked in yet — purchase the base node first.`)
    }

    const supabase = createClient()
    const id = randomUUID()
    const purchasedAt = new Date().toISOString()

    // Optimistic: update local state before the write.
    setPurchasedNodes(prev => [...prev, {
      id, character_id: characterId, sig_ability_key: sigAbilityKey, node_key: node.nodeKey,
      col_index: node.colIndex, row_index: node.rowIndex, xp_cost: node.xpCost,
      spec_slot: locked.specSlot, purchased_at: purchasedAt,
    }])

    const { data: charRow } = await supabase.from('characters').select('xp_available').eq('id', characterId).single()
    const newXp = (charRow?.xp_available ?? 0) - node.xpCost

    await Promise.all([
      supabase.from('character_sig_ability_nodes').insert({
        id, character_id: characterId, sig_ability_key: sigAbilityKey, node_key: node.nodeKey,
        col_index: node.colIndex, row_index: node.rowIndex, xp_cost: node.xpCost, spec_slot: locked.specSlot,
      }),
      supabase.from('characters').update({ xp_available: newXp }).eq('id', characterId),
    ])
  }, [lockedAbilities, characterId])

  return {
    availableSigAbilities,
    lockedAbilities,
    purchasedNodes,
    hasUnlockedTier5,
    lockInAbility,
    purchaseNode,
    loading,
  }
}
