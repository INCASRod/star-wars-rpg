'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase, FS_H3, FS_H4, FS_SM, FS_LABEL, FS_CAPTION, FS_OVERLINE } from '@/components/player-hud/design-tokens'

const FONT_MONO = "'Share Tech Mono','Courier New',monospace"

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
}

type AssetType = 'npc' | 'vehicle' | 'starship' | 'safe_house' | 'strategic_asset' | 'other'

interface LastAllianceReward {
  type: 'equipment' | 'vehicle' | 'strategic_asset'
  description: string
  awarded_at: string
}

// ── Table 9-3 Hardcoded Data ────────────────────────────────────────────────────

const CONTRIBUTION_RANK_TABLE: Record<number, { alliance: string; empire: string }> = {
  0: {
    alliance: 'New recruit or untested collaborator, still under suspicion. Access to basic equipment and vehicles.',
    empire: 'Faceless Rebel scum. Little intelligence value if captured. Not worth the effort to hunt down.',
  },
  1: {
    alliance: 'Tested soldier or trusted collaborator. Respected by Alliance. Access to better tactical equipment. Sergeant to warrant officer rank.',
    empire: 'Minor notoriety. Limited tactical intelligence value. Execution after interrogation. Bounty hunters rare but possible.',
  },
  2: {
    alliance: 'Veteran soldier or important collaborator. Very respected. Access to corvette/gunship-level starships and minor strategic intelligence. Lieutenant to captain rank.',
    empire: 'Moderate notoriety. Possible strategic intelligence value. Bounty hunters an option.',
  },
  3: {
    alliance: 'Top brass or vital collaborator. Highly respected, minor political power. Access to corvette/gunship-level starships and sensitive info. Major to colonel rank.',
    empire: 'Major notoriety. High intelligence value. Imperial assassins authorised. Imprisonment standard.',
  },
  4: {
    alliance: 'Member of the Alliance High Command. Immense political power. Extremely revered. Access to capital-grade starships. Commander, general, or admiral rank.',
    empire: "The Empire's Most Wanted. Entire fleets deployed to locate and eliminate. Failure to report whereabouts considered treason.",
  },
}

// ── Asset badge colours ─────────────────────────────────────────────────────

const ASSET_COLORS: Record<AssetType, string> = {
  npc:              '#4A90D9',
  vehicle:          '#4EC87A',
  starship:         '#40C4D4',
  safe_house:       '#D4A84B',
  strategic_asset:  '#9B59B6',
  other:            '#6A8070',
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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        ...panelBase,
        border: `1px solid ${C.borderHi}`,
        borderRadius: 8, padding: '24px 32px',
        display: 'flex', flexDirection: 'column', gap: 16, minWidth: 280,
      }}>
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
            background: 'rgba(0,0,0,0.4)', border: `1px solid ${C.border}`,
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
    </div>
  )
}

function btnStyle(primary: boolean): React.CSSProperties {
  return {
    padding: '6px 16px',
    background: primary ? 'rgba(200,170,80,0.15)' : 'transparent',
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
}

export function GroupSheet({ campaignId, characterName }: GroupSheetProps) {
  const supabase = useMemo(() => createClient(), [])

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

  // ── Rank tooltip hover ─────────────────────────────────────────────────────
  const [rankTooltip, setRankTooltip] = useState<'alliance' | 'empire' | null>(null)

  // ── Add Asset modal ────────────────────────────────────────────────────────
  const [showAddAsset, setShowAddAsset]     = useState(false)
  const [assetTypeDraft, setAssetTypeDraft] = useState<AssetType>('other')
  const [assetNameDraft, setAssetNameDraft] = useState('')
  const [assetDescDraft, setAssetDescDraft] = useState('')

  // ── Last Alliance Reward edit modal ───────────────────────────────────────
  const [showRewardModal, setShowRewardModal]     = useState(false)
  const [rewardTypeDraft, setRewardTypeDraft]     = useState<'equipment' | 'vehicle' | 'strategic_asset'>('equipment')
  const [rewardDescModalDraft, setRewardDescModalDraft] = useState('')

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
        .select('id,name,duty_type,duty_custom_name,duty_lore,duty_value,is_archived')
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
      added_by: characterName ?? 'GM',
    }).select().single()
    if (data) setAssets(prev => [data as GroupAsset, ...prev])
    setShowAddAsset(false)
    setAssetNameDraft('')
    setAssetDescDraft('')
    setAssetTypeDraft('other')
  }

  async function archiveAsset(id: string) {
    await supabase.from('group_assets').update({ is_archived: true }).eq('id', id)
    setAssets(prev => prev.filter(a => a.id !== id))
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
  const rankData    = CONTRIBUTION_RANK_TABLE[rank] ?? CONTRIBUTION_RANK_TABLE[4]
  const rankDesc    = (campaign?.contribution_rank_descriptions as Record<string, string>)?.[String(rank)] ?? null

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
      {showAddAsset && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#0A1410',
            border: `1px solid ${C.borderHi}`,
            borderRadius: 8, padding: '24px 32px',
            display: 'flex', flexDirection: 'column', gap: 14,
            minWidth: 340, maxWidth: 480, width: '90vw',
            boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
          }}>
            <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, color: C.gold, letterSpacing: '0.08em' }}>
              ADD GROUP ASSET
            </div>
            <div>
              <label style={labelStyle()}>Asset Type</label>
              <select
                value={assetTypeDraft}
                onChange={e => setAssetTypeDraft(e.target.value as AssetType)}
                style={inlineInputStyle()}
              >
                {(Object.keys(ASSET_LABELS) as AssetType[]).map(t => (
                  <option key={t} value={t}>{ASSET_LABELS[t]}</option>
                ))}
              </select>
            </div>
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
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim }}>
              Added by: <span style={{ color: C.text }}>{characterName ?? 'GM'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={btnStyle(false)} onClick={() => setShowAddAsset(false)}>Cancel</button>
              <button style={btnStyle(true)} onClick={addAsset} disabled={!assetNameDraft.trim()}>Add Asset</button>
            </div>
          </div>
        </div>
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
                fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: `${C.gold}66`,
                background: 'transparent', border: 'none', borderBottom: `1px solid ${C.border}`,
                outline: 'none', textAlign: 'center', letterSpacing: '0.14em', width: '16em',
              }}
            />
          ) : (
            <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: `${C.gold}55`, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {campaign.name}
            </span>
          )}
          {gmUnlocked && !editingCampaignName && (
            <button
              onClick={() => { setCampaignNameDraft(campaign.name); setEditingCampaignName(true) }}
              title="Edit campaign name"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: `${C.gold}44`, fontSize: FS_OVERLINE, padding: '0 2px', lineHeight: 1 }}
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
              {groupName}
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
          ) : (
            <>
              <span style={{ fontFamily: FONT_MONO, fontSize: FS_OVERLINE, color: `${C.gold}99`, letterSpacing: '0.1em' }}>
                ★ GM UNLOCKED
              </span>
              <button
                onClick={() => saveCampaignField({ group_name_editable: !campaign.group_name_editable })}
                title={campaign.group_name_editable ? 'Disable player name editing' : 'Allow players to edit name'}
                style={{
                  padding: '2px 8px',
                  background: 'transparent',
                  border: `1px solid ${campaign.group_name_editable ? `${C.gold}55` : C.border}`,
                  borderRadius: 3,
                  cursor: 'pointer',
                  color: campaign.group_name_editable ? `${C.gold}99` : C.textDim,
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
          <span style={{ fontFamily: FONT_MONO, fontSize: FS_CAPTION, color: `${C.gold}55`, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Base of Operations
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
            background: 'rgba(200,170,80,0.03)',
            border: `1px solid rgba(255,255,255,0.07)`,
            borderRadius: 6,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {campaign.base_of_operations_name ? (
                <>
                  <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.gold, fontWeight: 600, letterSpacing: '0.04em' }}>
                    {campaign.base_of_operations_name}
                  </span>
                  {campaign.base_of_operations_description && (
                    <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, marginLeft: 8 }}>
                      {campaign.base_of_operations_description}
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
        <SectionHeader label="GROUP DUTY" />

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
                const loreText  = row.duty_lore?.trim() || null
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
                            background: 'rgba(200,170,80,0.12)',
                            border: `1px solid ${C.gold}55`,
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
                          background: 'rgba(6,13,9,0.97)', border: `1px solid ${C.borderHi}`,
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
                        <input
                          autoFocus
                          type="number"
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
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: FS_CAPTION, color: milestone ? C.gold : C.textDim }}>
              {dutyTotal} / 100
            </span>
          </div>
          <div style={{
            height: 8, borderRadius: 4, background: 'rgba(200,170,80,0.1)',
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${dutyPct}%`,
              background: milestone
                ? `linear-gradient(90deg, ${C.gold}, #F5D77A)`
                : `linear-gradient(90deg, rgba(200,170,80,0.6), rgba(200,170,80,0.9))`,
              transition: 'width 0.4s ease',
              boxShadow: milestone ? `0 0 8px ${C.gold}88` : undefined,
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
                    background: 'rgba(200,170,80,0.12)',
                    border: `1px solid ${C.gold}`,
                    borderRadius: 4,
                    color: C.gold,
                    fontFamily: FONT_CINZEL,
                    fontSize: FS_LABEL,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    boxShadow: `0 0 10px rgba(200,170,80,0.2)`,
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
        <SectionHeader label="CONTRIBUTION RANK" />

        {/* Rank number + pips */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <div style={{
            fontFamily: FONT_CINZEL, fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            color: C.gold, lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            {rank}
          </div>
          {/* Pip row */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: i < rank
                    ? `radial-gradient(circle at 35% 35%, #F5D77A, ${C.gold})`
                    : 'rgba(200,170,80,0.1)',
                  border: `1px solid ${i < rank ? C.gold : C.border}`,
                  boxShadow: i < rank ? `0 0 6px ${C.gold}66` : undefined,
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

          {/* Alliance / Empire tooltips */}
          <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 560 }}>
            <TooltipCard
              label="ALLIANCE STANDING"
              color="#4EC87A"
              text={rankData.alliance}
              hovered={rankTooltip === 'alliance'}
              onHover={() => setRankTooltip('alliance')}
              onLeave={() => setRankTooltip(null)}
            />
            <TooltipCard
              label="IMPERIAL THREAT"
              color="#E05050"
              text={rankData.empire}
              hovered={rankTooltip === 'empire'}
              onHover={() => setRankTooltip('empire')}
              onLeave={() => setRankTooltip(null)}
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
                {rankDesc ?? 'Advance your Group Contribution Rank to see rewards.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ SECTION 4 — GROUP ASSETS ══════════════════════════════════════════ */}
      <div style={{ ...panelBase, borderRadius: 8, padding: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <SectionHeader label="GROUP ASSETS" />
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
                onArchive={() => archiveAsset(asset.id)}
              />
            ))}
          </div>
        )}

      </div>

      {/* ══ SECTION 5 — LAST ALLIANCE REWARD ══════════════════════════════════ */}
      <div style={{ ...panelBase, borderRadius: 8, padding: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <SectionHeader label="LAST ALLIANCE REWARD" />
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
                background: 'rgba(200,170,80,0.1)', border: `1px solid ${C.border}`,
                color: C.gold,
              }}>
                {(ASSET_LABELS as Record<string, string>)[campaign.last_alliance_reward.type] ?? campaign.last_alliance_reward.type}
              </span>
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim }}>
                {formatDate(campaign.last_alliance_reward.awarded_at)}
              </span>
            </div>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.text, lineHeight: 1.5 }}>
              {campaign.last_alliance_reward.description}
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
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: '#0A1410',
          border: `1px solid ${C.borderHi}`,
          borderRadius: 8, padding: '24px 32px',
          display: 'flex', flexDirection: 'column', gap: 14,
          minWidth: 340, maxWidth: 480, width: '90vw',
          boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
        }}>
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
      </div>
    )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: FONT_CINZEL, fontSize: FS_LABEL, color: C.textDim,
      letterSpacing: '0.12em', marginBottom: 4,
      borderBottom: `1px solid ${C.border}`, paddingBottom: 4,
    }}>
      {label}
    </div>
  )
}

function TooltipCard({ label, color, text, hovered, onHover, onLeave }: {
  label: string; color: string; text: string
  hovered: boolean; onHover: () => void; onLeave: () => void
}) {
  return (
    <div
      style={{
        flex: 1, borderRadius: 6, padding: '10px 12px', cursor: 'default',
        background: hovered ? 'rgba(8,16,10,0.95)' : 'rgba(8,16,10,0.6)',
        border: `1px solid ${hovered ? color + '66' : C.border}`,
        transition: 'all 0.2s',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, color, letterSpacing: '0.08em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, lineHeight: 1.5,
        maxHeight: hovered ? 200 : 40,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        {text}
      </div>
      {!hovered && (
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: color + '88', marginTop: 2 }}>
          Hover to expand ›
        </div>
      )}
    </div>
  )
}

function AssetCard({ asset, canArchive, onArchive }: {
  asset: GroupAsset; canArchive: boolean; onArchive: () => void
}) {
  const color = ASSET_COLORS[asset.asset_type]
  return (
    <div style={{
      borderRadius: 6, padding: '10px 12px',
      background: 'rgba(8,16,10,0.5)', border: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <span style={{
        padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0,
        fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, letterSpacing: '0.06em',
        background: color + '22', border: `1px solid ${color}66`, color,
      }}>
        {ASSET_LABELS[asset.asset_type]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.text, fontWeight: 600 }}>
          {asset.name}
        </div>
        {asset.description && (
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, marginTop: 2 }}>
            {asset.description}
          </div>
        )}
        {asset.added_by && (
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, marginTop: 2, opacity: 0.7, textAlign: 'right' }}>
            Added by {asset.added_by}
          </div>
        )}
      </div>
      {canArchive && (
        <button
          onClick={onArchive}
          title="Remove asset"
          style={{
            background: 'none', border: `1px solid ${C.border}`, borderRadius: 4,
            cursor: 'pointer', color: C.textDim, fontSize: FS_CAPTION, padding: '2px 6px',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

// ── Style helpers ───────────────────────────────────────────────────────────────

function tdStyle(): React.CSSProperties {
  return { padding: '6px 8px 6px 0', verticalAlign: 'middle' }
}

function inlineInputStyle(): React.CSSProperties {
  return {
    background: 'rgba(0,0,0,0.4)', border: `1px solid ${C.border}`,
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
