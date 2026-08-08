'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase, FS_H3, FS_H4, FS_SM, FS_LABEL, FS_CAPTION, FS_OVERLINE } from '@/components/player-hud/design-tokens'
import type { Adversary, AdversaryGear } from '@/lib/adversaries'
import { fetchAdversaries } from '@/lib/adversaries'
import type { Vehicle } from '@/lib/vehicles'
import { fetchVehicles, dbRowToVehicle, vehicleWeaponDisplayName, vehicleWeaponStats } from '@/lib/vehicles'
import { resolveWeapon } from '@/lib/resolve-weapon'
import { RichText } from '@/components/ui/RichText'
import { Modal } from '@/components/ui/Modal'
import { TickerText } from '@/components/ui/TickerText'
import { useHudPanelContext } from '@/contexts/HudPanelContext'
import { useQuartermaster } from '@/hooks/useQuartermaster'
import { QuartermasterModal } from '@/components/QuartermasterModal'
import { GroupStorageModal } from '@/components/group/GroupStorageModal'
import { FONT_BODY, FS, RADIUS, SP } from '@/lib/tokens'
import { NumberField } from '@/components/ui/NumberField'

const FONT_MONO = 'var(--font-body)'

// ── Types ──────────────────────────────────────────────────────────────────────

interface CampaignGroupData {
  id: string
  name: string
  gm_pin: string
  group_name: string | null
  group_name_editable: boolean
  base_of_operations_name: string | null
  base_of_operations_description: string | null
  contribution_rank: number
  contribution_rank_descriptions: Record<string, string>
  last_alliance_reward: LastAllianceReward | null
}

interface CharacterDutyRow {
  id: string
  name: string
  duty_type: string | null
  duty_custom_name: string | null
  duty_lore: string | null
  duty_notes: string | null
  duty_value: number
  is_archived: boolean
}

interface RefDutyType {
  key: string
  name: string
}

interface GroupAsset {
  id: string
  campaign_id: string
  asset_type: AssetType
  name: string
  description: string | null
  added_by: string | null
  created_at: string
  is_archived: boolean
  is_group_storage: boolean
}

type AssetType = 'npc' | 'vehicle' | 'starship' | 'safe_house' | 'strategic_asset' | 'other'

interface LastAllianceReward {
  type: 'equipment' | 'vehicle' | 'strategic_asset'
  description: string
  awarded_at: string
}

// ── Table 9-3 Contribution Rank data (Core Rulebook p.325) ──────────────────
// Five tiers; a circle lights up only when the rank crosses a tier threshold.
// Thresholds: tier 1 = 0, tier 2 = 2, tier 3 = 5, tier 4 = 7, tier 5 = 9.

const _T1 = {
  alliance: 'New recruit or untested collaborator, still under suspicion. Access to basic equipment and vehicles. Recruit to corporal rank.',
  empire:   'Faceless Rebel scum. Little intelligence value if captured. Re-education possible, otherwise imprisonment. Not worth the effort to hunt down individuals.',
}
const _T2 = {
  alliance: 'Tested soldier or trusted collaborator. Respected and trusted by the Alliance. Access to better tactical-level equipment and vehicles. Sergeant to warrant officer rank.',
  empire:   'Minor notoriety. Limited but useful tactical intelligence value if captured. Re-education possible, but unlikely. Execution after interrogation. Use of bounty hunters to capture/eliminate is rare, but possible.',
}
const _T3 = {
  alliance: 'Veteran soldier or important collaborator. Very respected by the Alliance. Access to corvette/gunship-level starships and minor strategic intelligence. Lieutenant to captain rank.',
  empire:   'Moderate notoriety. Possible strategic intelligence value. Re-education not possible. Imprisonment and lifelong interrogation standard practice. Use of bounty hunters to capture is an option.',
}
const _T4 = {
  alliance: 'Top brass or vital collaborator. Highly respected by the Alliance. Minor but notable political power. Access to corvette/gunship-level starships and sensitive info. Major to colonel rank.',
  empire:   'Major notoriety. Extremely high intelligence value if captured. Use of bounty hunters and Imperial assassins authorized for capture/elimination. No chance of re-education. Failure to report whereabouts considered a severe crime.',
}
const _T5 = {
  alliance: 'Member of the Alliance High Command. Immense political power. Extremely revered and respected by allies. Access to capital-grade starships. Commander, general, or admiral ranking.',
  empire:   "The Empire's Most Wanted. Entire fleets used to locate and eliminate. Capture or death key to destruction of the Rebellion. Immense intelligence value. Failure to report whereabouts is considered treason.",
}

const CONTRIBUTION_RANK_TABLE: Record<number, { alliance: string; empire: string }> = {
  0: _T1, 1: _T1,
  2: _T2, 3: _T2, 4: _T2,
  5: _T3, 6: _T3,
  7: _T4, 8: _T4,
  9: _T5, 10: _T5,
}

/** Minimum rank required to enter each of the five tiers (index = tier − 1). */
const RANK_TIER_THRESHOLDS = [0, 2, 5, 7, 9] as const

const MAX_CONTRIBUTION_RANK = 10

// ── Asset badge colours ─────────────────────────────────────────────────────

const ASSET_COLORS: Record<AssetType, string> = {
  npc:              '#4A90D9',
  vehicle:          '#4EC87A',
  starship:         '#40C4D4',
  safe_house:       '#D4A84B',
  strategic_asset:  '#9B59B6',
  other:            'var(--hud-text-dim)',
}

const ASSET_LABELS: Record<AssetType, string> = {
  npc:              'NPC',
  vehicle:          'Vehicle',
  starship:         'Starship',
  safe_house:       'Safe House',
  strategic_asset:  'Strategic Asset',
  other:            'Other',
}

const REWARD_TYPES = ['equipment', 'vehicle', 'strategic_asset'] as const

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

function calcDutyRanges(rows: CharacterDutyRow[]) {
  const sorted = [...rows].sort((a, b) => b.duty_value - a.duty_value)
  let cursor = 0
  return sorted.map(r => {
    if (r.duty_value === 0) return { ...r, rangeStart: 0, rangeEnd: 0 }
    const start = cursor + 1
    const end   = cursor + r.duty_value
    cursor = end
    return { ...r, rangeStart: start, rangeEnd: end }
  })
}

// ── PIN Modal ─────────────────────────────────────────────────────────────────

function PinModal({ onConfirm, onCancel }: { onConfirm: (pin: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  return (
    <Modal open zIndex={200} maxWidth={380} borderColor={C.borderHi} backdrop="rgba(0,0,0,0.7)">
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, color: C.gold, letterSpacing: '0.08em' }}>
          GM VERIFICATION
        </div>
        <input
          ref={inputRef}
          type="password"
          placeholder="Enter GM PIN"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onConfirm(val) }}
          style={{
            background: 'var(--hud-surface-lo)', border: `1px solid ${C.border}`,
            borderRadius: 4, padding: '8px 12px',
            fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.text,
            outline: 'none', letterSpacing: '0.2em',
          }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnStyle(false)}>Cancel</button>
          <button onClick={() => onConfirm(val)} style={btnStyle(true)}>Unlock</button>
        </div>
      </div>
    </Modal>
  )
}

function btnStyle(primary: boolean): React.CSSProperties {
  return {
    padding: '6px 16px',
    background: primary ? 'rgba(224,58,30,0.15)' : 'transparent',
    border: `1px solid ${primary ? C.gold : C.border}`,
    borderRadius: 4,
    color: primary ? C.gold : C.textDim,
    fontFamily: FONT_CINZEL, fontSize: FS_LABEL, letterSpacing: '0.08em',
    cursor: 'pointer',
  }
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface GroupSheetProps {
  campaignId: string
  characterName?: string
  characterId?: string
}

export function GroupSheet({ campaignId, characterName, characterId }: GroupSheetProps) {
  const supabase = useMemo(() => createClient(), [])
  const { isOpen } = useHudPanelContext()

  // ── Data state ─────────────────────────────────────────────────────────────
  const [campaign, setCampaign]   = useState<CampaignGroupData | null>(null)
  const [duties, setDuties]       = useState<CharacterDutyRow[]>([])
  const [assets, setAssets]       = useState<GroupAsset[]>([])
  const [dutyTypes, setDutyTypes] = useState<RefDutyType[]>([])
  const [loading, setLoading]     = useState(true)

  // ── GM unlock state ────────────────────────────────────────────────────────
  const [gmUnlocked, setGmUnlocked]   = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [pinError, setPinError]         = useState(false)

  // ── Edit states ────────────────────────────────────────────────────────────
  const [editingCampaignName, setEditingCampaignName] = useState(false)
  const [campaignNameDraft, setCampaignNameDraft]     = useState('')
  const [editingGroupName, setEditingGroupName] = useState(false)
  const [groupNameDraft, setGroupNameDraft]     = useState('')
  const [editingBoo, setEditingBoo]             = useState(false)
  const [booNameDraft, setBooNameDraft]         = useState('')
  const [booDescDraft, setBooDescDraft]         = useState('')
  const [editingRewardDesc, setEditingRewardDesc] = useState<number | null>(null) // rank number
  const [rewardDescDraft, setRewardDescDraft]     = useState('')
  const [editingDutyChar, setEditingDutyChar]   = useState<string | null>(null)
  const [dutyEditDraft, setDutyEditDraft]       = useState('')
  const [hoveredDutyChar, setHoveredDutyChar]   = useState<string | null>(null)

  // (rank tooltip hover removed — cards are always expanded)

  // ── Add Asset modal ────────────────────────────────────────────────────────
  const [showAddAsset, setShowAddAsset]     = useState(false)
  const [assetTypeDraft, setAssetTypeDraft] = useState<AssetType>('other')
  const [assetNameDraft, setAssetNameDraft] = useState('')
  const [assetDescDraft, setAssetDescDraft] = useState('')
  const [assetSearch, setAssetSearch]       = useState('')
  const [adversaryLib, setAdversaryLib]     = useState<(Adversary & { _isCustom?: boolean })[]>([])
  const [vehicleLib, setVehicleLib]         = useState<Vehicle[]>([])
  const [libLoading, setLibLoading]         = useState(false)
  const [viewingAsset, setViewingAsset]     = useState<GroupAsset | null>(null)
  const [assetStorageDraft,     setAssetStorageDraft]     = useState(false)
  const [groupStorageAssetId,   setGroupStorageAssetId]   = useState<string | null>(null)
  const [groupStorageAssetName, setGroupStorageAssetName] = useState('')
  const [groupStorageAssetType, setGroupStorageAssetType] = useState<AssetType>('starship')

  // ── Last Alliance Reward edit modal ───────────────────────────────────────
  const [showRewardModal, setShowRewardModal]     = useState(false)

  // ── Quartermaster ──
  const { qm, buyRows: qmBuyRows, buyItem: qmBuyItem, sellItem: qmSellItem, loading: qmLoading } = useQuartermaster(supabase, campaignId)
  const [showQm, setShowQm] = useState(false)
  const [rewardTypeDraft, setRewardTypeDraft]     = useState<'equipment' | 'vehicle' | 'strategic_asset'>('equipment')
  const [rewardDescModalDraft, setRewardDescModalDraft] = useState('')

  // ── Shared library loader ─────────────────────────────────────────────────
  const loadAdversaries = useCallback(() => {
    if (adversaryLib.length > 0) return
    setLibLoading(true)
    Promise.all([
      fetchAdversaries(),
      supabase.from('ref_adversaries').select('*').order('name'),
    ]).then(([oggdude, customResult]) => {
      const custom: (Adversary & { _isCustom: true })[] = (customResult.data ?? []).map((row) => {
        const r = row as Record<string, unknown>
        const skillRanks = (r.skill_ranks as Record<string, number>) ?? {}
        return {
          id:          String(r.id),
          name:        String(r.name),
          type:        r.type as 'minion' | 'rival' | 'nemesis',
          brawn:       Number(r.brawn ?? 2),
          agility:     Number(r.agility ?? 2),
          intellect:   Number(r.intellect ?? 2),
          cunning:     Number(r.cunning ?? 2),
          willpower:   Number(r.willpower ?? 2),
          presence:    Number(r.presence ?? 2),
          soak:        Number(r.soak ?? 2),
          wound:       Number(r.wound_threshold ?? 10),
          strain:      r.strain_threshold != null ? Number(r.strain_threshold) : undefined,
          defense:     [Number(r.defense_melee ?? 0), Number(r.defense_ranged ?? 0)],
          skills:      Object.keys(skillRanks),
          skillRanks,
          talents:     (r.talents as Adversary['talents']) ?? [],
          abilities:   (r.abilities as Adversary['abilities']) ?? [],
          weapons:     (r.weapons as Adversary['weapons']) ?? [],
          gear:        (r.gear as AdversaryGear[]) ?? [],
          description: r.description ? String(r.description) : undefined,
          _isCustom:   true,
        }
      })
      setAdversaryLib([...oggdude, ...custom])
      setLibLoading(false)
    })
  }, [adversaryLib.length, supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadVehicles = useCallback(() => {
    if (vehicleLib.length > 0) return
    setLibLoading(true)
    Promise.all([
      fetchVehicles(),
      supabase.from('ref_vehicles').select('*').order('name'),
    ]).then(([oggdude, customResult]) => {
      const custom = (customResult.data ?? []).map(r => dbRowToVehicle(r as Record<string, unknown>))
      setVehicleLib([...oggdude, ...custom])
      setLibLoading(false)
    })
  }, [vehicleLib.length, supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Trigger library load when Add Asset modal or View modal needs it ──────
  useEffect(() => {
    const t = showAddAsset ? assetTypeDraft : viewingAsset?.asset_type
    if (!t) return
    if (t === 'npc') loadAdversaries()
    else if (t === 'vehicle' || t === 'starship') loadVehicles()
  }, [showAddAsset, assetTypeDraft, viewingAsset, loadAdversaries, loadVehicles])

  // ── Load data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    const [campRes, dutyRes, assetRes, dutyTypesRes] = await Promise.all([
      supabase
        .from('campaigns')
        .select('id,name,gm_pin,group_name,group_name_editable,base_of_operations_name,base_of_operations_description,contribution_rank,contribution_rank_descriptions,last_alliance_reward')
        .eq('id', campaignId)
        .single(),
      supabase
        .from('characters')
        .select('id,name,duty_type,duty_custom_name,duty_lore,duty_notes,duty_value,is_archived')
        .eq('campaign_id', campaignId)
        .eq('is_archived', false),
      supabase
        .from('group_assets')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false }),
      supabase
        .from('ref_duty_types')
        .select('key,name')
        .order('name'),
    ])
    if (campRes.data) setCampaign(campRes.data as CampaignGroupData)
    if (dutyRes.data) setDuties(dutyRes.data as CharacterDutyRow[])
    if (assetRes.data) setAssets(assetRes.data as GroupAsset[])
    if (dutyTypesRes.data) setDutyTypes(dutyTypesRes.data as RefDutyType[])
    setLoading(false)
  }, [supabase, campaignId])

  useEffect(() => { load() }, [load])

  // ── Realtime: campaigns ────────────────────────────────────────────────────
  useEffect(() => {
    const ch = supabase
      .channel(`group-campaign:${campaignId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'campaigns', filter: `id=eq.${campaignId}` },
        (payload) => {
          setCampaign(prev => prev ? { ...prev, ...(payload.new as Partial<CampaignGroupData>) } : prev)
        })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [supabase, campaignId])

  // ── Realtime: group_assets ─────────────────────────────────────────────────
  useEffect(() => {
    const ch = supabase
      .channel(`group-assets:${campaignId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_assets', filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          const a = payload.new as GroupAsset
          if (!a.is_archived) setAssets(prev => [a, ...prev])
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'group_assets', filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          const a = payload.new as GroupAsset
          setAssets(prev => a.is_archived
            ? prev.filter(x => x.id !== a.id)
            : prev.map(x => x.id === a.id ? a : x))
        })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [supabase, campaignId])

  // ── PIN verification ───────────────────────────────────────────────────────
  function requireGm(action: () => void) {
    if (gmUnlocked) { action(); return }
    setPendingAction(() => action)
    setShowPinModal(true)
  }

  async function handlePinConfirm(pin: string) {
    if (!campaign) return
    if (campaign.gm_pin === pin) {
      setGmUnlocked(true)
      setShowPinModal(false)
      setPinError(false)
      pendingAction?.()
      setPendingAction(null)
    } else {
      setPinError(true)
      setTimeout(() => setPinError(false), 2000)
    }
  }

  // ── Campaign save helpers ──────────────────────────────────────────────────
  async function saveCampaignField(fields: Partial<CampaignGroupData>) {
    await supabase.from('campaigns').update(fields).eq('id', campaignId)
    setCampaign(prev => prev ? { ...prev, ...fields } : prev)
  }

  // ── Duty table helpers ─────────────────────────────────────────────────────
  async function saveDutyValue(charId: string, val: string) {
    const n = parseInt(val, 10)
    if (isNaN(n) || n < 0) return
    await supabase.from('characters').update({ duty_value: n }).eq('id', charId)
    setDuties(prev => prev.map(d => d.id === charId ? { ...d, duty_value: n } : d))
    setEditingDutyChar(null)
  }

  // ── Reset Group Duty (milestone) ──────────────────────────────────────────
  async function handleResetGroupDuty() {
    if (!campaign || dutyTotal < 100) return
    const currentRank = campaign.contribution_rank ?? 0
    const currentRankDesc = (campaign.contribution_rank_descriptions as Record<string, string>)?.[String(currentRank)] ?? null
    const newRank = currentRank + 1

    // Build updated rank descriptions with the current rank's entry cleared
    const updatedDescs: Record<string, string> = { ...((campaign.contribution_rank_descriptions as Record<string, string>) ?? {}) }
    delete updatedDescs[String(currentRank)]

    // Promote current rank reward to Last Alliance Reward
    const newReward: LastAllianceReward | null = currentRankDesc
      ? { type: 'strategic_asset', description: currentRankDesc, awarded_at: new Date().toISOString() }
      : campaign.last_alliance_reward

    // Reset every active character's duty_value to 0
    const charIds = duties.map(d => d.id)
    if (charIds.length > 0) {
      await supabase.from('characters').update({ duty_value: 0 }).in('id', charIds)
    }

    // Update campaign: increment rank, clear rank reward, set last alliance reward
    await saveCampaignField({
      contribution_rank: newRank,
      contribution_rank_descriptions: updatedDescs,
      last_alliance_reward: newReward,
    })

    // Reflect duty reset in local state
    setDuties(prev => prev.map(d => ({ ...d, duty_value: 0 })))
  }

  // ── Asset helpers ──────────────────────────────────────────────────────────
  async function addAsset() {
    if (!assetNameDraft.trim()) return
    const { data } = await supabase.from('group_assets').insert({
      campaign_id: campaignId,
      asset_type: assetTypeDraft,
      name: assetNameDraft.trim(),
      description: assetDescDraft.trim() || null,
      is_group_storage: assetStorageDraft,
    }).select().single()
    setShowAddAsset(false)
    setAssetNameDraft('')
    setAssetDescDraft('')
    setAssetTypeDraft('other')
    setAssetSearch('')
    setAssetStorageDraft(false)
  }

  async function archiveAsset(id: string) {
    await supabase.from('group_assets').update({ is_archived: true }).eq('id', id)
    setAssets(prev => prev.filter(a => a.id !== id))
  }

  async function toggleAssetGroupStorage(assetId: string, current: boolean) {
    await supabase
      .from('group_assets')
      .update({ is_group_storage: !current })
      .eq('id', assetId)
    setViewingAsset(prev => prev ? { ...prev, is_group_storage: !current } : null)
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const dutyRows       = calcDutyRanges(duties)
  const dutyTotal      = duties.reduce((s, d) => s + (d.duty_value ?? 0), 0)
  const topContributor = duties.length > 0
    ? duties.reduce((best, d) => d.duty_value > best.duty_value ? d : best, duties[0]).id
    : null
  const dutyPct     = Math.min(100, dutyTotal)
  const milestone   = dutyTotal >= 100
  const rank        = campaign?.contribution_rank ?? 0
  const rankData    = CONTRIBUTION_RANK_TABLE[rank] ?? CONTRIBUTION_RANK_TABLE[MAX_CONTRIBUTION_RANK]
  // Find the next tier boundary — skip ranks that share the same tier object
  const nextRankEntry = (() => {
    if (rank >= MAX_CONTRIBUTION_RANK) return null
    for (let r = rank + 1; r <= MAX_CONTRIBUTION_RANK; r++) {
      const candidate = CONTRIBUTION_RANK_TABLE[r]
      if (candidate && candidate !== rankData) return candidate
    }
    return null
  })()
  // Number of tier circles to illuminate — advances only at tier thresholds
  const tierLit = RANK_TIER_THRESHOLDS.filter(t => rank >= t).length
  const rankDesc    = (campaign?.contribution_rank_descriptions as Record<string, string>)?.[String(rank)] ?? null

  const filteredAdversaries = useMemo(() => {
    const q = assetSearch.toLowerCase()
    return adversaryLib.filter(a => a.name.toLowerCase().includes(q))
  }, [adversaryLib, assetSearch])

  const filteredVehicles = useMemo(() => {
    const q = assetSearch.toLowerCase()
    return vehicleLib
      .filter(v => assetTypeDraft === 'starship' ? v.isStarship : !v.isStarship)
      .filter(v => v.name.toLowerCase().includes(q))
  }, [vehicleLib, assetSearch, assetTypeDraft])

  const viewAdversary = useMemo(() => {
    if (!viewingAsset || viewingAsset.asset_type !== 'npc') return null
    const n = viewingAsset.name.toLowerCase()
    return adversaryLib.find(a => a.name.toLowerCase() === n) ?? null
  }, [viewingAsset, adversaryLib])

  const viewVehicle = useMemo(() => {
    if (!viewingAsset || (viewingAsset.asset_type !== 'vehicle' && viewingAsset.asset_type !== 'starship')) return null
    const n = viewingAsset.name.toLowerCase()
    return vehicleLib.find(v => v.name.toLowerCase() === n) ?? null
  }, [viewingAsset, vehicleLib])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, color: C.textDim, letterSpacing: '0.1em' }}>
          LOADING GROUP DATA…
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, color: C.textDim }}>No campaign found.</div>
      </div>
    )
  }

  const groupName = campaign.group_name ?? campaign.name ?? 'Legacy of Rebellion'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)' }}>

      {/* ── PIN Modal ──────────────────────────────────────────────────────── */}
      {showPinModal && (
        <PinModal
          onConfirm={handlePinConfirm}
          onCancel={() => { setShowPinModal(false); setPendingAction(null) }}
        />
      )}
      {pinError && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 300,
          background: 'rgba(200,50,50,0.9)', borderRadius: 6, padding: '8px 16px',
          fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: '#fff',
        }}>
          Invalid PIN
        </div>
      )}

      {/* ── Add Asset Modal (at root to escape backdropFilter stacking context) ── */}
      {showAddAsset && (() => {
        const useLibrary = assetTypeDraft === 'npc' || assetTypeDraft === 'vehicle' || assetTypeDraft === 'starship'
        const libraryItems = assetTypeDraft === 'npc' ? filteredAdversaries : filteredVehicles
        const closeModal = () => { setShowAddAsset(false); setAssetSearch(''); setAssetNameDraft(''); setAssetDescDraft(''); setAssetTypeDraft('other'); setAssetStorageDraft(false) }
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: 'var(--hud-surface-hi)',
              border: `1px solid ${C.borderHi}`,
              borderRadius: 8,
              display: 'flex', flexDirection: 'column',
              width: '90vw', maxWidth: useLibrary ? 520 : 480,
              maxHeight: '88vh',
              boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
            }}>
              {/* Header */}
              <div style={{ padding: '18px 24px 14px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, color: C.gold, letterSpacing: '0.08em' }}>
                  ADD GROUP ASSET
                </div>
              </div>

              {/* Scrollable body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Asset type */}
                <div>
                  <label style={labelStyle()}>Asset Type</label>
                  <select
                    value={assetTypeDraft}
                    onChange={e => { setAssetTypeDraft(e.target.value as AssetType); setAssetNameDraft(''); setAssetSearch('') }}
                    style={inlineInputStyle()}
                  >
                    {(Object.keys(ASSET_LABELS) as AssetType[]).map(t => (
                      <option key={t} value={t}>{ASSET_LABELS[t]}</option>
                    ))}
                  </select>
                </div>

                {/* Library search + list for NPC / Vehicle / Starship */}
                {useLibrary && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={labelStyle()}>
                      {assetTypeDraft === 'npc' ? 'Select from Adversary Library' : 'Select from Vehicle Library'}
                    </label>
                    <input
                      autoFocus
                      value={assetSearch}
                      onChange={e => setAssetSearch(e.target.value)}
                      placeholder={assetTypeDraft === 'npc' ? 'Search adversaries…' : 'Search vehicles…'}
                      style={inlineInputStyle()}
                    />
                    <div style={{
                      maxHeight: 220, overflowY: 'auto',
                      border: `1px solid ${C.border}`, borderRadius: 6,
                      background: 'var(--hud-surface-lo)',
                    }}>
                      {libLoading && (
                        <div style={{ padding: '16px', fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, textAlign: 'center' }}>
                          Loading…
                        </div>
                      )}
                      {!libLoading && libraryItems.length === 0 && (
                        <div style={{ padding: '16px', fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, textAlign: 'center' }}>
                          No results found
                        </div>
                      )}
                      {!libLoading && libraryItems.map((item, i) => {
                        const itemName = item.name
                        const isCustom = !!(item as { _isCustom?: boolean })._isCustom
                        const subtitle = assetTypeDraft === 'npc'
                          ? (item as Adversary).type
                          : `${(item as Vehicle).type} · Sil ${(item as Vehicle).silhouette}`
                        const isSelected = assetNameDraft === itemName
                        return (
                          <button
                            key={'id' in item ? item.id : (item as Vehicle).key}
                            onClick={() => setAssetNameDraft(itemName)}
                            style={{
                              width: '100%', textAlign: 'left',
                              background: isSelected ? `color-mix(in srgb, ${C.gold} 9%, transparent)` : 'transparent',
                              border: 'none',
                              borderBottom: i < libraryItems.length - 1 ? `1px solid ${C.border}` : 'none',
                              padding: '8px 12px', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                            }}
                          >
                            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: isSelected ? C.gold : C.text, fontWeight: isSelected ? 600 : 400 }}>
                              {isCustom && <span style={{ color: C.gold, marginRight: 5, fontSize: FS_SM }}>★</span>}
                              {itemName}
                            </span>
                            <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: C.textDim, textTransform: 'uppercase', flexShrink: 0 }}>
                              {subtitle}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    {/* Editable name field showing selected/custom name */}
                    <div>
                      <label style={labelStyle()}>Name</label>
                      <input
                        value={assetNameDraft}
                        onChange={e => setAssetNameDraft(e.target.value)}
                        placeholder="Select above or type a custom name"
                        style={inlineInputStyle()}
                      />
                    </div>
                  </div>
                )}

                {/* Plain name field for non-library types */}
                {!useLibrary && (
                  <div>
                    <label style={labelStyle()}>Name</label>
                    <input
                      autoFocus
                      value={assetNameDraft}
                      onChange={e => setAssetNameDraft(e.target.value)}
                      placeholder="Asset name"
                      style={inlineInputStyle()}
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label style={labelStyle()}>Description (optional)</label>
                  <textarea
                    value={assetDescDraft}
                    onChange={e => setAssetDescDraft(e.target.value)}
                    placeholder="Notes or description…"
                    rows={3}
                    style={{ ...inlineInputStyle(), resize: 'vertical' }}
                  />
                </div>

                {/* Group Storage — only for stowable asset types */}
                {(assetTypeDraft === 'vehicle' || assetTypeDraft === 'starship' || assetTypeDraft === 'safe_house') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
                    <input
                      id="gs-checkbox"
                      type="checkbox"
                      checked={assetStorageDraft}
                      onChange={e => setAssetStorageDraft(e.target.checked)}
                      style={{ accentColor: 'var(--hud-gold)', cursor: 'pointer' }}
                    />
                    <label htmlFor="gs-checkbox" style={{ ...labelStyle(), marginBottom: 0, cursor: 'pointer' }}>
                      Group Storage
                    </label>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div style={{ padding: '12px 24px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>
                <button style={btnStyle(false)} onClick={closeModal}>Cancel</button>
                <button style={btnStyle(true)} onClick={addAsset} disabled={!assetNameDraft.trim()}>Add Asset</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Asset View Modal ──────────────────────────────────────────────────── */}
      {viewingAsset && (
        <AssetViewModal
          asset={viewingAsset}
          adversary={viewAdversary}
          vehicle={viewVehicle}
          loading={libLoading && (viewingAsset.asset_type === 'npc' || viewingAsset.asset_type === 'vehicle' || viewingAsset.asset_type === 'starship')}
          onClose={() => setViewingAsset(null)}
          gmUnlocked={gmUnlocked}
          onToggleGroupStorage={() => toggleAssetGroupStorage(viewingAsset.id, viewingAsset.is_group_storage)}
        />
      )}

      {/* ══ SECTION 1 — GROUP IDENTITY ════════════════════════════════════════ */}
      <div style={{ ...panelBase, borderRadius: 8, padding: 'var(--space-3)' }}>

        {/* ── Tier 1: Campaign name (page label) ───────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
          {editingCampaignName ? (
            <input
              autoFocus
              value={campaignNameDraft}
              onChange={e => setCampaignNameDraft(e.target.value)}
              onBlur={() => { saveCampaignField({ name: campaignNameDraft }); setEditingCampaignName(false) }}
              onKeyDown={e => {
                if (e.key === 'Enter') { saveCampaignField({ name: campaignNameDraft }); setEditingCampaignName(false) }
                if (e.key === 'Escape') setEditingCampaignName(false)
              }}
              style={{
                fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: `color-mix(in srgb, ${C.gold} 40%, transparent)`,
                background: 'transparent', border: 'none', borderBottom: `1px solid ${C.border}`,
                outline: 'none', textAlign: 'center', letterSpacing: '0.14em', width: '16em',
              }}
            />
          ) : (
            <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: `color-mix(in srgb, ${C.gold} 33%, transparent)`, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              <TickerText text={campaign.name} isOpen={isOpen} />
            </span>
          )}
          {gmUnlocked && !editingCampaignName && (
            <button
              onClick={() => { setCampaignNameDraft(campaign.name); setEditingCampaignName(true) }}
              title="Edit campaign name"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: `color-mix(in srgb, ${C.gold} 27%, transparent)`, fontSize: FS_OVERLINE, padding: '0 2px', lineHeight: 1 }}
            >✎</button>
          )}
        </div>

        {/* ── Tier 2: Group name (hero) ─────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          {editingGroupName ? (
            <input
              autoFocus
              value={groupNameDraft}
              onChange={e => setGroupNameDraft(e.target.value)}
              onBlur={() => { saveCampaignField({ group_name: groupNameDraft }); setEditingGroupName(false) }}
              onKeyDown={e => {
                if (e.key === 'Enter') { saveCampaignField({ group_name: groupNameDraft }); setEditingGroupName(false) }
                if (e.key === 'Escape') setEditingGroupName(false)
              }}
              style={{
                fontFamily: FONT_CINZEL, fontSize: FS_H3, color: C.gold,
                background: 'transparent', border: 'none', borderBottom: `1px solid ${C.gold}`,
                outline: 'none', textAlign: 'center', letterSpacing: '0.06em', width: '18em',
              }}
            />
          ) : (
            <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_H3, color: C.gold, letterSpacing: '0.06em' }}>
              <TickerText text={groupName} isOpen={isOpen} />
            </span>
          )}
          {(gmUnlocked || campaign.group_name_editable) && !editingGroupName && (
            <button
              onClick={() => { setGroupNameDraft(groupName); setEditingGroupName(true) }}
              title="Edit group name"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, fontSize: FS_CAPTION, marginLeft: 6, verticalAlign: 'middle' }}
            >✎</button>
          )}
        </div>

        {/* ── GM badge row ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 'var(--space-3)' }}>
          {!gmUnlocked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => requireGm(() => {})} style={{
                padding: '2px 10px',
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: 3,
                color: C.textDim,
                fontFamily: FONT_MONO, fontSize: FS_OVERLINE, letterSpacing: '0.1em',
                cursor: 'pointer',
              }}>
                GM EDIT
              </button>
              <button
                onClick={() => setShowQm(true)}
                disabled={!qm?.is_open}
                className="qm-group-btn"
                style={{
                  padding: '2px 10px',
                  background: qm?.is_open
                    ? 'color-mix(in srgb, var(--state-success) 10%, transparent)'
                    : 'transparent',
                  border: qm?.is_open
                    ? `1px solid color-mix(in srgb, var(--state-success) 35%, transparent)`
                    : `1px solid ${C.border}`,
                  borderRadius: RADIUS.sm,
                  color: qm?.is_open ? 'var(--state-success)' : C.textDim,
                  fontFamily: FONT_MONO, fontSize: FS_OVERLINE, letterSpacing: '0.1em',
                  cursor: qm?.is_open ? 'pointer' : 'not-allowed',
                  opacity: qm?.is_open ? 1 : 0.5,
                  transition: 'border-color var(--ease-quick), background var(--ease-quick)',
                }}
              >
                {qm?.is_open ? '🛒 QUARTERMASTER' : '🛒 QM CLOSED'}
              </button>
            </div>
          ) : (
            <>
              <span style={{ fontFamily: FONT_MONO, fontSize: FS_OVERLINE, color: `color-mix(in srgb, ${C.gold} 60%, transparent)`, letterSpacing: '0.1em' }}>
                ★ GM UNLOCKED
              </span>
              <button
                onClick={() => saveCampaignField({ group_name_editable: !campaign.group_name_editable })}
                title={campaign.group_name_editable ? 'Disable player name editing' : 'Allow players to edit name'}
                style={{
                  padding: '2px 8px',
                  background: 'transparent',
                  border: `1px solid ${campaign.group_name_editable ? `color-mix(in srgb, ${C.gold} 33%, transparent)` : C.border}`,
                  borderRadius: 3,
                  cursor: 'pointer',
                  color: campaign.group_name_editable ? `color-mix(in srgb, ${C.gold} 60%, transparent)` : C.textDim,
                  fontFamily: FONT_MONO, fontSize: FS_OVERLINE, letterSpacing: '0.08em',
                }}
              >
                {campaign.group_name_editable ? 'PLAYER EDIT ON' : 'PLAYER EDIT OFF'}
              </button>
            </>
          )}
        </div>

        {/* ── Tier 3: Base of Operations block ─────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: `color-mix(in srgb, ${C.gold} 33%, transparent)`, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            <TickerText text="Base of Operations" isOpen={isOpen} />
          </span>
        </div>
        {editingBoo ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              autoFocus
              value={booNameDraft}
              onChange={e => setBooNameDraft(e.target.value)}
              placeholder="Base of Operations name"
              style={inlineInputStyle()}
            />
            <textarea
              value={booDescDraft}
              onChange={e => setBooDescDraft(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              style={{ ...inlineInputStyle(), resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={btnStyle(false)} onClick={() => setEditingBoo(false)}>Cancel</button>
              <button style={btnStyle(true)} onClick={() => {
                saveCampaignField({ base_of_operations_name: booNameDraft || null, base_of_operations_description: booDescDraft || null })
                setEditingBoo(false)
              }}>Save</button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: 'var(--hud-surface-lo)',
            border: `1px solid var(--hud-border)`,
            borderRadius: 6,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {campaign.base_of_operations_name ? (
                <>
                  <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.gold, fontWeight: 600, letterSpacing: '0.04em' }}>
                    <TickerText text={campaign.base_of_operations_name} isOpen={isOpen} />
                  </span>
                  {campaign.base_of_operations_description && (
                    <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, marginLeft: 8 }}>
                      <TickerText text={campaign.base_of_operations_description} isOpen={isOpen} parallel wrap />
                    </span>
                  )}
                </>
              ) : (
                <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, fontStyle: 'italic' }}>
                  No base of operations recorded
                </span>
              )}
            </div>
            {gmUnlocked && (
              <button
                onClick={() => { setBooNameDraft(campaign.base_of_operations_name ?? ''); setBooDescDraft(campaign.base_of_operations_description ?? ''); setEditingBoo(true) }}
                title="Edit base of operations"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, fontSize: FS_SM, flexShrink: 0, padding: '0 2px' }}
              >✎</button>
            )}
          </div>
        )}
      </div>

      {/* ══ SECTION 2 — GROUP DUTY TABLE ══════════════════════════════════════ */}
      <div style={{ ...panelBase, borderRadius: 8, padding: 'var(--space-3)' }}>
        <SectionHeader label="GROUP DUTY" isOpen={isOpen} />

        {duties.length === 0 ? (
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, padding: '8px 0' }}>
            No active characters in this campaign.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr>
                {(['Duty Range', 'Character', 'Duty Type', 'Duty Value'] as const).map(h => (
                  <th key={h} style={{
                    fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, color: C.textDim,
                    letterSpacing: '0.08em', textAlign: 'left', paddingBottom: 6,
                    borderBottom: `1px solid ${C.border}`,
                  }}>{h}</th>
                ))}
                {gmUnlocked && <th />}
              </tr>
            </thead>
            <tbody>
              {dutyRows.map(row => {
                const isTop     = row.id === topContributor && row.duty_value > 0
                const loreText  = row.duty_lore?.trim() || row.duty_notes?.trim() || null
                const isHovered = hoveredDutyChar === row.id
                return (
                  <tr
                    key={row.id}
                    style={{ borderBottom: `1px solid ${C.border}`, position: 'relative' }}
                    onMouseEnter={() => loreText ? setHoveredDutyChar(row.id) : undefined}
                    onMouseLeave={() => setHoveredDutyChar(null)}
                  >
                    <td style={tdStyle()}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: FS_SM, color: C.textDim }}>
                        {row.rangeStart}–{row.rangeEnd}
                      </span>
                    </td>
                    <td style={{ ...tdStyle(), position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.text }}>
                          {row.name}
                        </span>
                        {isTop && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '1px 6px', borderRadius: 10,
                            background: 'var(--hud-surface-lo)',
                            border: `1px solid color-mix(in srgb, ${C.gold} 33%, transparent)`,
                            fontFamily: FONT_MONO, fontSize: FS_OVERLINE,
                            color: C.gold, letterSpacing: '0.06em', whiteSpace: 'nowrap',
                          }}>
                            ★ TOP CONTRIBUTOR
                          </span>
                        )}
                        {loreText && (
                          <span style={{ fontFamily: FONT_MONO, fontSize: FS_OVERLINE, color: C.textDim, opacity: 0.5, cursor: 'default' }}
                            title="">
                            ···
                          </span>
                        )}
                      </div>
                      {/* Duty lore tooltip — renders below for top contributor (first row) to avoid clipping above the table header */}
                      {isHovered && loreText && (
                        <div style={{
                          position: 'absolute',
                          ...(isTop ? { top: 'calc(100% + 4px)' } : { bottom: 'calc(100% + 6px)' }),
                          left: 0, zIndex: 50,
                          background: 'var(--hud-surface-hi)', border: `1px solid ${C.borderHi}`,
                          borderRadius: 6, padding: '10px 14px',
                          maxWidth: 320, minWidth: 180,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                          pointerEvents: 'none',
                        }}>
                          <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, color: C.gold, letterSpacing: '0.08em', marginBottom: 6 }}>
                            {row.duty_custom_name || dutyTypes.find(d => d.key === row.duty_type)?.name || row.duty_type || 'Duty'}
                          </div>
                          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.text, lineHeight: 1.55 }}>
                            {loreText}
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={tdStyle()}>
                      <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim }}>
                        {row.duty_custom_name || dutyTypes.find(d => d.key === row.duty_type)?.name || row.duty_type || '—'}
                      </span>
                    </td>
                    <td style={tdStyle()}>
                      {editingDutyChar === row.id ? (
                        <NumberField
                          autoFocus
                          min={0}
                          value={dutyEditDraft}
                          onChange={e => setDutyEditDraft(e.target.value)}
                          onBlur={() => saveDutyValue(row.id, dutyEditDraft)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveDutyValue(row.id, dutyEditDraft)
                            if (e.key === 'Escape') setEditingDutyChar(null)
                          }}
                          style={{ ...inlineInputStyle(), width: 60, padding: '2px 6px' }}
                        />
                      ) : (
                        <span style={{ fontFamily: FONT_MONO, fontSize: FS_SM, color: C.gold }}>
                          {row.duty_value}
                        </span>
                      )}
                    </td>
                    {gmUnlocked && (
                      <td style={tdStyle()}>
                        <button
                          onClick={() => { setDutyEditDraft(String(row.duty_value)); setEditingDutyChar(row.id) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, fontSize: FS_SM }}
                        >✎</button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Duty progress bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, color: C.textDim, letterSpacing: '0.08em' }}>
              GROUP DUTY
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: FS_CAPTION, color: milestone ? C.gold : C.textDim }}>
              {dutyTotal} / 100
            </span>
          </div>
          <div style={{
            height: 8, borderRadius: 4, background: 'var(--hud-border)',
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${dutyPct}%`,
              background: milestone
                ? `linear-gradient(90deg, ${C.gold}, #F5D77A)`
                : `linear-gradient(90deg, rgba(224,58,30,0.6), rgba(224,58,30,0.9))`,
              transition: 'width 0.4s ease',
              boxShadow: milestone ? `0 0 8px color-mix(in srgb, ${C.gold} 53%, transparent)` : undefined,
            }} />
          </div>
          {milestone && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{
                fontFamily: FONT_CINZEL, fontSize: FS_SM, color: C.gold,
                letterSpacing: '0.1em',
              }}>
                ★ CONTRIBUTION MILESTONE REACHED ★
              </div>
              {gmUnlocked && (
                <button
                  onClick={() => handleResetGroupDuty()}
                  style={{
                    padding: '6px 20px',
                    background: 'rgba(224,58,30,0.12)',
                    border: `1px solid ${C.gold}`,
                    borderRadius: 4,
                    color: C.gold,
                    fontFamily: FONT_CINZEL,
                    fontSize: FS_LABEL,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    boxShadow: `0 0 10px rgba(224,58,30,0.2)`,
                  }}
                >
                  ↑ RESET GROUP DUTY & ADVANCE RANK
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══ SECTION 3 — CONTRIBUTION RANK ═════════════════════════════════════ */}
      <div style={{ ...panelBase, borderRadius: 8, padding: 'var(--space-3)' }}>
        <SectionHeader label="CONTRIBUTION RANK" isOpen={isOpen} />

        {/* Rank number + pips */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <div style={{
            fontFamily: FONT_CINZEL, fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            color: C.gold, lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            {rank}
          </div>
          {/* Pip row — one pip per tier; lights up when rank crosses that tier's threshold */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: RANK_TIER_THRESHOLDS.length }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: i < tierLit
                    ? `radial-gradient(circle at 35% 35%, #F5D77A, ${C.gold})`
                    : 'var(--hud-surface-mid)',
                  border: `1px solid ${i < tierLit ? C.gold : C.border}`,
                  boxShadow: i < tierLit ? `0 0 6px color-mix(in srgb, ${C.gold} 40%, transparent)` : undefined,
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>

          {/* GM +/- controls */}
          {gmUnlocked && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => saveCampaignField({ contribution_rank: Math.max(0, rank - 1) })} style={btnStyle(false)}>−</button>
              <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, color: C.textDim, letterSpacing: '0.08em' }}>ADJUST RANK</span>
              <button onClick={() => saveCampaignField({ contribution_rank: Math.min(10, rank + 1) })} style={btnStyle(false)}>+</button>
            </div>
          )}

          {/* Alliance / Empire cards — always expanded */}
          <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 560 }}>
            <TooltipCard
              label="ALLIANCE STANDING"
              color="#4EC87A"
              text={rankData.alliance}
              nextText={nextRankEntry ? nextRankEntry.alliance : null}
              symbolSrc="/images/factions/rebel.png"
              symbolCorner="right"
              isOpen={isOpen}
            />
            <TooltipCard
              label="IMPERIAL THREAT"
              color="#E05050"
              text={rankData.empire}
              nextText={nextRankEntry ? nextRankEntry.empire : null}
              symbolSrc="/images/factions/empire.png"
              symbolCorner="left"
              symbolFilter="invert(1) opacity(0.15)"
              isOpen={isOpen}
            />
          </div>

          {/* Rank reward description */}
          <div style={{ width: '100%', maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, color: C.textDim, letterSpacing: '0.08em' }}>
                RANK REWARD
              </span>
              {gmUnlocked && editingRewardDesc !== rank && (
                <button
                  onClick={() => { setRewardDescDraft(rankDesc ?? ''); setEditingRewardDesc(rank) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, fontSize: FS_SM }}
                >✎</button>
              )}
            </div>
            {editingRewardDesc === rank ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  autoFocus
                  value={rewardDescDraft}
                  onChange={e => setRewardDescDraft(e.target.value)}
                  placeholder="Describe the reward for reaching this rank…"
                  rows={3}
                  style={{ ...inlineInputStyle(), resize: 'vertical', width: '100%' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={btnStyle(false)} onClick={() => setEditingRewardDesc(null)}>Cancel</button>
                  <button style={btnStyle(true)} onClick={async () => {
                    const updated = { ...((campaign.contribution_rank_descriptions as Record<string, string>) ?? {}), [String(rank)]: rewardDescDraft }
                    await saveCampaignField({ contribution_rank_descriptions: updated })
                    setEditingRewardDesc(null)
                  }}>Save</button>
                </div>
              </div>
            ) : (
              <div style={{
                fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: rankDesc ? C.text : C.textDim,
                fontStyle: rankDesc ? 'normal' : 'italic', lineHeight: 1.5,
              }}>
                <TickerText text={rankDesc ?? 'Advance your Group Contribution Rank to see rewards.'} isOpen={isOpen} parallel wrap />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ SECTION 4 — GROUP ASSETS ══════════════════════════════════════════ */}
      <div style={{ ...panelBase, borderRadius: 8, padding: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <SectionHeader label="GROUP ASSETS" isOpen={isOpen} />
          {gmUnlocked && (
            <button
              onClick={() => setShowAddAsset(true)}
              style={{ ...btnStyle(true), fontSize: FS_CAPTION }}
            >
              + ADD ASSET
            </button>
          )}
        </div>

        {assets.length === 0 ? (
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, fontStyle: 'italic' }}>
            No assets recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {assets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                canArchive={gmUnlocked}
                onView={() => setViewingAsset(asset)}
                onArchive={() => archiveAsset(asset.id)}
                isOpen={isOpen}
                onViewStorage={asset.is_group_storage ? () => {
                  setGroupStorageAssetId(asset.id)
                  setGroupStorageAssetName(asset.name)
                  setGroupStorageAssetType(asset.asset_type)
                } : undefined}
              />
            ))}
          </div>
        )}

      </div>

      {/* ══ SECTION 5 — LAST ALLIANCE REWARD ══════════════════════════════════ */}
      <div style={{ ...panelBase, borderRadius: 8, padding: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <SectionHeader label="LAST ALLIANCE REWARD" isOpen={isOpen} />
          {gmUnlocked && (
            <button
              onClick={() => {
                const r = campaign.last_alliance_reward
                setRewardTypeDraft(r?.type ?? 'equipment')
                setRewardDescModalDraft(r?.description ?? '')
                setShowRewardModal(true)
              }}
              style={{ ...btnStyle(false), fontSize: FS_CAPTION }}
            >
              ✎ EDIT
            </button>
          )}
        </div>

        {campaign.last_alliance_reward ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                padding: '2px 10px', borderRadius: 12, fontSize: FS_CAPTION,
                fontFamily: FONT_CINZEL, letterSpacing: '0.06em',
                background: 'var(--hud-surface-lo)', border: `1px solid ${C.border}`,
                color: C.gold,
              }}>
                <TickerText text={(ASSET_LABELS as Record<string, string>)[campaign.last_alliance_reward.type] ?? campaign.last_alliance_reward.type} isOpen={isOpen} />
              </span>
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim }}>
                <TickerText text={formatDate(campaign.last_alliance_reward.awarded_at)} isOpen={isOpen} />
              </span>
            </div>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.text, lineHeight: 1.5 }}>
              <TickerText text={campaign.last_alliance_reward.description} isOpen={isOpen} parallel wrap />
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, fontStyle: 'italic' }}>
            No Alliance reward recorded yet. Reach 100 combined Duty to earn your first reward.
          </div>
        )}

      </div>

      {/* ── Reward edit modal (at root to escape backdropFilter stacking context) ── */}
      {showRewardModal && (
      <Modal open onClose={() => setShowRewardModal(false)} zIndex={200} maxWidth={480} backdrop="rgba(0,0,0,0.75)" borderColor={C.borderHi} shadow="0 8px 40px rgba(0,0,0,0.8)" panelBackground="var(--hud-surface-hi)">
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, color: C.gold, letterSpacing: '0.08em' }}>
            SET ALLIANCE REWARD
          </div>
          <div>
            <label style={labelStyle()}>Reward Type</label>
            <select
              value={rewardTypeDraft}
              onChange={e => setRewardTypeDraft(e.target.value as typeof rewardTypeDraft)}
              style={inlineInputStyle()}
            >
              {REWARD_TYPES.map(t => <option key={t} value={t}>{(ASSET_LABELS as Record<string, string>)[t] ?? t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle()}>Description</label>
            <textarea
              autoFocus
              value={rewardDescModalDraft}
              onChange={e => setRewardDescModalDraft(e.target.value)}
              placeholder="Describe the reward the Alliance has provided…"
              rows={4}
              style={{ ...inlineInputStyle(), resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={btnStyle(false)} onClick={() => setShowRewardModal(false)}>Cancel</button>
            <button style={btnStyle(true)} onClick={async () => {
              const reward: LastAllianceReward = {
                type: rewardTypeDraft,
                description: rewardDescModalDraft,
                awarded_at: new Date().toISOString(),
              }
              await saveCampaignField({ last_alliance_reward: reward })
              setShowRewardModal(false)
            }}>
              Save Reward
            </button>
          </div>
        </div>
      </Modal>
    )}

      {showQm && (
        <QuartermasterModal
          campaignId={campaignId}
          characterName={characterName ?? ''}
          characterId={characterId}
          supabase={supabase}
          onClose={() => setShowQm(false)}
          qm={qm}
          qmLoading={qmLoading}
          buyRows={qmBuyRows}
          buyItem={qmBuyItem}
          sellItem={qmSellItem}
        />
      )}

      {groupStorageAssetId && (
        <GroupStorageModal
          assetId={groupStorageAssetId}
          assetName={groupStorageAssetName}
          characterId={characterId ?? null}
          onClose={() => setGroupStorageAssetId(null)}
        />
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function SectionHeader({ label, isOpen }: { label: string; isOpen: boolean }) {
  return (
    <div style={{
      fontFamily: FONT_CINZEL, fontSize: FS_LABEL, color: C.textDim,
      letterSpacing: '0.12em', marginBottom: 4,
      borderBottom: `1px solid ${C.border}`, paddingBottom: 4,
    }}>
      <TickerText text={label} isOpen={isOpen} />
    </div>
  )
}

function TooltipCard({ label, color, text, nextText, symbolSrc, symbolCorner, symbolFilter, isOpen }: {
  label: string; color: string; text: string
  nextText?: string | null
  symbolSrc?: string; symbolCorner?: 'left' | 'right'; symbolFilter?: string
  isOpen: boolean
}) {
  return (
    <div style={{
      flex: 1, borderRadius: 6, padding: '10px 12px',
      background: 'var(--hud-surface-lo)',
      border: `1px solid ${color}66`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Faction symbol watermark */}
      {symbolSrc && (
        <img
          src={symbolSrc}
          alt=""
          style={{
            position: 'absolute',
            top: 6,
            ...(symbolCorner === 'right' ? { right: 8 } : { left: 8 }),
            width: 56,
            height: 56,
            objectFit: 'contain',
            opacity: symbolFilter ? 1 : 0.18,
            filter: symbolFilter,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      )}
      {/* Current rank */}
      <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, color, letterSpacing: '0.08em', marginBottom: 4, fontWeight: 700 }}>
        <TickerText text={label} isOpen={isOpen} />
      </div>
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: 'var(--hud-text)', lineHeight: 1.5, marginBottom: nextText !== undefined ? 8 : 0 }}>
        <TickerText text={text} isOpen={isOpen} parallel wrap />
      </div>
      {/* Next rank */}
      {nextText !== undefined && (
        <>
          <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, color: color + '88', letterSpacing: '0.08em', marginBottom: 3, fontWeight: 600 }}>
            <TickerText text="NEXT RANK" isOpen={isOpen} />
          </div>
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: 'var(--hud-text-dim)', lineHeight: 1.5 }}>
            <TickerText text={nextText ?? 'Maximum rank achieved.'} isOpen={isOpen} parallel wrap />
          </div>
        </>
      )}
    </div>
  )
}

// ── Asset View Modal ─────────────────────────────────────────────────────────

const _VM_RAISED  = 'var(--hud-surface-mid)'
const _VM_BORDER  = 'var(--hud-border)'
const _VM_DIM     = 'var(--hud-text-dim)'
const _VM_TEXT    = 'var(--hud-text)'
const _VM_RED     = '#E05050'
const _VM_GREEN   = '#4EC87A'
const _VM_BLUE    = '#5AAAE0'

function _VmSection({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700,
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color: 'var(--hud-text-dim)', borderBottom: `1px solid ${_VM_BORDER}`,
      paddingBottom: 4, marginBottom: 8,
    }}>{children}</div>
  )
}

function _VmStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: _VM_RAISED, border: `1px solid ${_VM_BORDER}`, borderRadius: 4,
      padding: '6px 10px', minWidth: 48,
    }}>
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: _VM_DIM, letterSpacing: '0.1em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: color ?? _VM_TEXT }}>{value}</div>
    </div>
  )
}

function AssetViewModal({ asset, adversary, vehicle, loading, onClose, gmUnlocked, onToggleGroupStorage }: {
  asset: GroupAsset
  adversary: (Adversary & { _isCustom?: boolean }) | null
  vehicle: (Vehicle & { _isCustom?: boolean }) | null
  loading: boolean
  onClose: () => void
  gmUnlocked: boolean
  onToggleGroupStorage: () => void
}) {
  const [mounted, setMounted]   = useState(false)
  const [visible, setVisible]   = useState(false)
  useEffect(() => {
    setMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 260)
  }

  const useLibrary = asset.asset_type === 'npc' || asset.asset_type === 'vehicle' || asset.asset_type === 'starship'
  const accentColor = ASSET_COLORS[asset.asset_type]

  if (!mounted) return null
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 10050,
          background: 'rgba(0,0,0,0.5)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.26s',
        }}
      />

      {/* Slide-in panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 10060,
        width: 'clamp(340px, 42vw, 560px)',
        background: 'var(--hud-surface-hi)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderLeft: `1px solid ${C.borderHi}`,
        boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${C.border}`, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0,
            fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, letterSpacing: '0.06em',
            background: accentColor + '22', border: `1px solid ${accentColor}66`, color: accentColor,
          }}>
            {ASSET_LABELS[asset.asset_type]}
          </span>
          <div style={{ flex: 1, fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: C.gold, letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {(adversary?._isCustom || vehicle?._isCustom) && <span style={{ color: C.gold }}>★ </span>}
            {asset.name}
          </div>
          <button onClick={handleClose} style={{ background: 'transparent', border: 'none', color: _VM_DIM, cursor: 'pointer', fontFamily: FONT_CINZEL, fontSize: FS_H4, lineHeight: 1, padding: '0 4px', flexShrink: 0 }}>×</button>
        </div>

        {/* GM: Group Storage toggle — stowable types only */}
        {gmUnlocked && (asset.asset_type === 'vehicle' || asset.asset_type === 'starship' || asset.asset_type === 'safe_house') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], padding: `${SP[2]} 20px`, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <input
              id="gs-view-toggle"
              type="checkbox"
              checked={asset.is_group_storage}
              onChange={onToggleGroupStorage}
              style={{ accentColor: 'var(--hud-gold)', cursor: 'pointer' }}
            />
            <label htmlFor="gs-view-toggle" style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: C.text, cursor: 'pointer' }}>
              Group Storage — players can view and take items stowed here
            </label>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Loading */}
          {loading && (
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, textAlign: 'center', padding: '24px 0' }}>
              Loading stat block…
            </div>
          )}

          {/* ── Adversary stat block ── */}
          {!loading && adversary && (() => {
            const adv = adversary
            const defense = Array.isArray(adv.defense) ? adv.defense : [0, 0]
            const skillEntries = Object.entries(adv.skillRanks ?? {}).filter(([, r]) => r > 0)
            return (
              <>
                {/* Type badge */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontFamily: FONT_MONO, fontSize: FS_CAPTION, fontWeight: 700,
                    color: adv.type === 'nemesis' ? C.gold : adv.type === 'rival' ? _VM_BLUE : _VM_DIM,
                    border: `1px solid currentColor`, borderRadius: 3, padding: '1px 7px', letterSpacing: '0.1em',
                    background: adv.type === 'nemesis' ? `color-mix(in srgb, ${C.gold} 9%, transparent)` : adv.type === 'rival' ? `${_VM_BLUE}18` : `color-mix(in srgb, ${_VM_DIM} 9%, transparent)`,
                  }}>
                    {adv.type.toUpperCase()}
                  </span>
                </div>

                {/* Characteristics */}
                <div>
                  <_VmSection>Characteristics</_VmSection>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <_VmStat label="BR"  value={adv.brawn}    />
                    <_VmStat label="AG"  value={adv.agility}  />
                    <_VmStat label="INT" value={adv.intellect} />
                    <_VmStat label="CUN" value={adv.cunning}  />
                    <_VmStat label="WIL" value={adv.willpower} />
                    <_VmStat label="PR"  value={adv.presence} />
                  </div>
                </div>

                {/* Derived */}
                <div>
                  <_VmSection>Derived Stats</_VmSection>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <_VmStat label="Soak" value={adv.soak} />
                    <_VmStat label="WT"   value={adv.wound} />
                    {adv.strain != null && <_VmStat label="ST" value={adv.strain} />}
                    {defense[0] > 0 && <_VmStat label="Def M" value={defense[0]} />}
                    {defense[1] > 0 && <_VmStat label="Def R" value={defense[1]} />}
                  </div>
                </div>

                {/* Skills */}
                {skillEntries.length > 0 && (
                  <div>
                    <_VmSection>Skills</_VmSection>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
                      {skillEntries.map(([skill, rank]) => (
                        <span key={skill} style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: _VM_TEXT }}>
                          {skill} <span style={{ color: C.gold, fontWeight: 700 }}>{rank}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weapons */}
                {adv.weapons && adv.weapons.length > 0 && (
                  <div>
                    <_VmSection>Weapons</_VmSection>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {adv.weapons.map((w, i) => {
                        const { dmg, range, crit } = resolveWeapon(w, adv.brawn, {})
                        return (
                          <div key={i} style={{ padding: '6px 10px', background: _VM_RAISED, borderRadius: 4, border: `1px solid ${_VM_BORDER}`, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700, color: _VM_TEXT, minWidth: 100 }}>{w.name}</span>
                            {w.skillCategory && <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: _VM_DIM }}>{w.skillCategory}</span>}
                            <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: _VM_RED }}>Dmg {dmg}</span>
                            {crit !== undefined && <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: _VM_RED }}>Crit {crit}</span>}
                            {range && <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: _VM_DIM }}>{range}</span>}
                            {w.qualities && w.qualities.length > 0 && (
                              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: _VM_DIM }}>
                                <RichText text={w.qualities.join(', ')} />
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Talents & Abilities */}
                {((adv.talents && adv.talents.length > 0) || (adv.abilities && adv.abilities.length > 0)) && (
                  <div>
                    <_VmSection>Talents &amp; Abilities</_VmSection>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {adv.talents?.map((t, i) => (
                        <div key={i}>
                          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700, color: C.gold }}>{t.name}</span>
                          {t.description && <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: _VM_DIM }}> — <RichText text={t.description} /></span>}
                        </div>
                      ))}
                      {adv.abilities?.map((a, i) => (
                        <div key={i}>
                          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700, color: _VM_GREEN }}>{a.name}</span>
                          {a.description && <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: _VM_DIM }}> — <RichText text={a.description} /></span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {adv.description && (
                  <div>
                    <_VmSection>Description</_VmSection>
                    <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: _VM_DIM, lineHeight: 1.6 }}>
                      <RichText text={adv.description} />
                    </div>
                  </div>
                )}
              </>
            )
          })()}

          {/* ── Vehicle stat block ── */}
          {!loading && vehicle && (() => {
            const v = vehicle
            const handlingStr = v.handling >= 0 ? `+${v.handling}` : `${v.handling}`
            const handlingColor = v.handling < 0 ? _VM_RED : v.handling > 0 ? _VM_GREEN : _VM_TEXT
            return (
              <>
                {/* Type badge */}
                <div>
                  <span style={{
                    fontFamily: FONT_MONO, fontSize: FS_CAPTION, fontWeight: 700,
                    color: v.isStarship ? _VM_BLUE : C.gold,
                    border: `1px solid currentColor`, borderRadius: 3, padding: '1px 7px', letterSpacing: '0.1em',
                    background: v.isStarship ? `${_VM_BLUE}18` : `color-mix(in srgb, ${C.gold} 9%, transparent)`,
                  }}>
                    {v.isStarship ? 'STARSHIP' : 'GROUND VEHICLE'}
                  </span>
                  {v.type && <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: _VM_DIM, marginLeft: 10 }}>{v.type}</span>}
                </div>

                {/* Performance */}
                <div>
                  <_VmSection>Performance</_VmSection>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <_VmStat label="Sil"   value={v.silhouette} />
                    <_VmStat label="Speed" value={v.speed}      />
                    <_VmStat label="Hdl"   value={handlingStr} color={handlingColor} />
                  </div>
                </div>

                {/* Combat */}
                <div>
                  <_VmSection>Combat Stats</_VmSection>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <_VmStat label="Armor" value={v.armor}       />
                    <_VmStat label="Hull"  value={v.hullTrauma}  />
                    <_VmStat label="Sys"   value={v.systemStrain} />
                    {v.defFore      > 0 && <_VmStat label="Def F" value={v.defFore}      />}
                    {v.defAft       > 0 && <_VmStat label="Def A" value={v.defAft}       />}
                    {v.defPort      > 0 && <_VmStat label="Def P" value={v.defPort}      />}
                    {v.defStarboard > 0 && <_VmStat label="Def S" value={v.defStarboard} />}
                  </div>
                </div>

                {/* Crew & Cargo */}
                {(v.crew || v.passengers != null || v.encumbranceCapacity != null || v.consumables) && (
                  <div>
                    <_VmSection>Crew &amp; Cargo</_VmSection>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: FONT_RAJDHANI, fontSize: FS_SM }}>
                      {v.crew               && <div><span style={{ color: _VM_DIM }}>Crew: </span><span style={{ color: _VM_TEXT }}>{v.crew}</span></div>}
                      {v.passengers != null  && <div><span style={{ color: _VM_DIM }}>Passengers: </span><span style={{ color: _VM_TEXT }}>{v.passengers}</span></div>}
                      {v.encumbranceCapacity != null && <div><span style={{ color: _VM_DIM }}>Cargo: </span><span style={{ color: _VM_TEXT }}>{v.encumbranceCapacity} enc.</span></div>}
                      {v.consumables         && <div><span style={{ color: _VM_DIM }}>Consumables: </span><span style={{ color: _VM_TEXT }}>{v.consumables}</span></div>}
                    </div>
                  </div>
                )}

                {/* Hyperdrive */}
                {v.isStarship && (v.hyperdrivePrimary != null || v.naviComputer != null) && (
                  <div>
                    <_VmSection>Hyperdrive</_VmSection>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: FONT_RAJDHANI, fontSize: FS_SM }}>
                      {v.hyperdrivePrimary != null && v.hyperdrivePrimary > 0 && <div><span style={{ color: _VM_DIM }}>Primary: </span><span style={{ color: _VM_TEXT }}>Class {v.hyperdrivePrimary}</span></div>}
                      {v.hyperdriveBackup  != null && v.hyperdriveBackup  > 0 && <div><span style={{ color: _VM_DIM }}>Backup: </span><span style={{ color: _VM_TEXT }}>Class {v.hyperdriveBackup}</span></div>}
                      {v.naviComputer != null && <div><span style={{ color: _VM_DIM }}>Navicomputer: </span><span style={{ color: _VM_TEXT }}>{v.naviComputer ? 'Yes' : 'No'}</span></div>}
                      {v.sensorRange && <div><span style={{ color: _VM_DIM }}>Sensors: </span><span style={{ color: _VM_TEXT }}>{v.sensorRange.replace('sr', '')}</span></div>}
                    </div>
                  </div>
                )}

                {/* Weapons */}
                {v.weapons && v.weapons.length > 0 && (
                  <div>
                    <_VmSection>Weapons</_VmSection>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {v.weapons.map((w, i) => {
                        const stats = vehicleWeaponStats(w.weaponKey)
                        const displayName = vehicleWeaponDisplayName(w.weaponKey)
                        const arcParts = [
                          w.firingArcs.fore      && 'Fore',
                          w.firingArcs.aft       && 'Aft',
                          w.firingArcs.port      && 'Port',
                          w.firingArcs.starboard && 'Stbd',
                          w.firingArcs.dorsal    && 'Dorsal',
                          w.firingArcs.ventral   && 'Ventral',
                        ].filter(Boolean).join('/')
                        return (
                          <div key={i} style={{ padding: '6px 10px', background: _VM_RAISED, borderRadius: 4, border: `1px solid ${_VM_BORDER}` }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700, color: _VM_TEXT, minWidth: 140 }}>
                                {w.count > 1 ? `${w.count}× ` : ''}{displayName}{w.turret ? ' (Turret)' : ''}
                              </span>
                              {stats && stats.damage > 0 && <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: _VM_RED }}>Dmg {stats.damage}</span>}
                              {stats?.crit !== undefined && <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: _VM_RED }}>Crit {stats.crit}</span>}
                              {stats && <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: _VM_DIM }}>{stats.range}</span>}
                              {arcParts && <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: _VM_DIM }}>[{arcParts}]</span>}
                            </div>
                            {w.qualities.length > 0 && (
                              <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: _VM_DIM, marginTop: 3 }}>
                                {w.qualities.map(q => `${q.key}${q.count > 1 ? ` ${q.count}` : ''}`).join(', ')}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Special Features */}
                {v.abilities && v.abilities.length > 0 && (
                  <div>
                    <_VmSection>Special Features</_VmSection>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {v.abilities.map((a, i) => (
                        <div key={i}>
                          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700, color: _VM_GREEN }}>{a.name}</span>
                          {a.description && <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: _VM_DIM }}> — {a.description}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {v.description && (
                  <div>
                    <_VmSection>Description</_VmSection>
                    <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: _VM_DIM, lineHeight: 1.6 }}>
                      <RichText text={v.description} />
                    </div>
                  </div>
                )}
              </>
            )
          })()}

          {/* ── Library type but not found ── */}
          {!loading && useLibrary && !adversary && !vehicle && (
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, textAlign: 'center', padding: '16px 0' }}>
              No stat block found in library for &ldquo;{asset.name}&rdquo;.
              {asset.description && (
                <div style={{ marginTop: 12, textAlign: 'left', color: _VM_TEXT, lineHeight: 1.6 }}>
                  {asset.description}
                </div>
              )}
            </div>
          )}

          {/* ── Non-library types: just show description ── */}
          {!useLibrary && (
            asset.description ? (
              <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: _VM_TEXT, lineHeight: 1.7 }}>
                {asset.description}
              </div>
            ) : (
              <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, textAlign: 'center', padding: '16px 0' }}>
                No description added.
              </div>
            )
          )}
        </div>
      </div>
    </>,
    document.body
  )
}

function AssetCard({ asset, canArchive, onArchive, onView, isOpen, onViewStorage }: {
  asset: GroupAsset; canArchive: boolean; onArchive: () => void; onView: () => void; isOpen: boolean; onViewStorage: (() => void) | undefined
}) {
  const color = ASSET_COLORS[asset.asset_type]
  return (
    <div style={{
      borderRadius: 6, padding: '10px 12px',
      background: 'var(--hud-surface-lo)', border: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <span style={{
        padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0,
        fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, letterSpacing: '0.06em',
        background: color + '22', border: `1px solid ${color}66`, color,
      }}>
        <TickerText text={ASSET_LABELS[asset.asset_type]} isOpen={isOpen} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.text, fontWeight: 600 }}>
          <TickerText text={asset.name} isOpen={isOpen} />
        </div>
        {asset.description && (
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, marginTop: 2 }}>
            <TickerText text={asset.description} isOpen={isOpen} parallel wrap />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {asset.is_group_storage && onViewStorage && (
          <button
            onClick={onViewStorage}
            title="View group storage"
            style={{
              background: `color-mix(in srgb, ${color} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${color} 50%, transparent)`,
              borderRadius: RADIUS.sm,
              cursor: 'pointer',
              color,
              fontFamily: FONT_BODY,
              fontSize: FS_CAPTION,
              fontWeight: 600,
              padding: `${SP[1]} ${SP[2]}`,
              whiteSpace: 'nowrap' as const,
            }}
          >
            📦 Storage
          </button>
        )}
        <button
          onClick={onView}
          title="View stat block"
          style={{
            background: `${color}10`, border: `1px solid ${color}50`, borderRadius: 4,
            cursor: 'pointer', color, fontSize: FS_CAPTION,
            fontFamily: FONT_RAJDHANI, fontWeight: 600, padding: '2px 8px',
          }}
        >
          View
        </button>
        {canArchive && (
          <button
            onClick={onArchive}
            title="Remove asset"
            style={{
              background: 'none', border: `1px solid ${C.border}`, borderRadius: 4,
              cursor: 'pointer', color: C.textDim, fontSize: FS_CAPTION, padding: '2px 6px',
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

// ── Style helpers ───────────────────────────────────────────────────────────────

function tdStyle(): React.CSSProperties {
  return { padding: '6px 8px 6px 0', verticalAlign: 'middle' }
}

function inlineInputStyle(): React.CSSProperties {
  return {
    background: 'var(--hud-surface-lo)', border: `1px solid ${C.border}`,
    borderRadius: 4, padding: '6px 10px', width: '100%',
    fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.text,
    outline: 'none', boxSizing: 'border-box',
  }
}

function labelStyle(): React.CSSProperties {
  return {
    display: 'block', marginBottom: 4,
    fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, color: C.textDim, letterSpacing: '0.08em',
  }
}

