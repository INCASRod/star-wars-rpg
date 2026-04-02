'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchAdversaries, adversaryToInstance } from '@/lib/adversaries'
import type { Adversary, AdversaryInstance } from '@/lib/adversaries'
import { sortInitiative, advanceInitiative } from '@/lib/combat'
import { randomUUID } from '@/lib/utils'
import type { InitiativeSlot, CombatEncounter } from '@/lib/combat'
import { InitiativeSetupModal } from './InitiativeSetupModal'
import { AddParticipantModal } from '@/components/combat/AddParticipantModal'
import { CombatLog } from '@/components/combat/CombatLog'
import type { Character } from '@/lib/types'
import type { SlotAlignment } from '@/lib/combat'
import { FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4, FS_H3 } from '@/components/player-hud/design-tokens'
import { MarkupText } from '@/components/ui/MarkupText'
import { resolveWeapon, type WeaponRef } from '@/lib/resolve-weapon'
import { CombatCheckOverlay } from '@/components/combat-check/CombatCheckOverlay'
import { adaptAdversaryForCombatCheck, charactersToAdversaryStubs } from '@/lib/adversaryAdapter'
import { logRoll, type RollMeta } from '@/lib/logRoll'
import type { RollResult } from '@/components/player-hud/dice-engine'
import { applyDamageToAdversary } from '@/lib/damageEngine'

// ── Design Tokens ──
const BG = '#060D09'
const PANEL_BG = 'rgba(8,16,10,0.88)'
const RAISED_BG = 'rgba(14,26,18,0.9)'
const INPUT_BG = 'rgba(6,13,9,0.7)'
const GOLD = '#C8AA50'
const BORDER = 'rgba(200,170,80,0.18)'
const BORDER_MD = 'rgba(200,170,80,0.32)'
const CHAR_BR     = '#e05252'
const CHAR_AG     = '#52a8e0'
const ALLIED_GREEN = '#52e08a'
const CHAR_INT = '#a852e0'
const CHAR_CUN = '#e0a852'
const CHAR_WIL = '#52e0a8'
const CHAR_PR = '#e05298'
const TEXTGR = "#72B421"
const TEXT = '#E8DFC8'
const TEXT_SEC = 'rgba(232,223,200,0.6)'
const TEXT_MUTED = 'rgba(232,223,200,0.50)'
const FC = "'Rajdhani', sans-serif"
const FR = "'Rajdhani', sans-serif"
const FM = "'Rajdhani', sans-serif"

const panelBase: React.CSSProperties = {
  background: PANEL_BG,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  position: 'relative',
}
const raisedPanel: React.CSSProperties = {
  background: RAISED_BG,
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: `1px solid ${BORDER}`,
  borderRadius: 4,
  position: 'relative',
}

// Shared button styles defined at module level with hardcoded values
const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(200,170,80,0.32)',
  borderRadius: 4, padding: '5px 12px', cursor: 'pointer',
  fontFamily: "'Rajdhani', sans-serif", fontSize: FS_LABEL, color: '#E8DFC8',
  transition: '.15s',
}
const smallCtrlBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid rgba(200,170,80,0.32)',
  borderRadius: 3, width: 20, height: 20, cursor: 'pointer',
  fontFamily: "'Rajdhani', sans-serif", fontSize: FS_SM, color: 'rgba(232,223,200,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 600, letterSpacing: '0.25em',
      textTransform: 'uppercase', color: `${GOLD}b3`, marginBottom: 10,
    }}>
      {children}
    </div>
  )
}

function StatBox({ label, value, color = GOLD }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      background: `${color}15`, border: `1px solid ${color}40`,
      borderRadius: 3, padding: '3px 8px', textAlign: 'center', minWidth: 32,
    }}>
      <div style={{ fontFamily: FM, fontSize: FS_SM, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginTop: 2 }}>{label}</div>
    </div>
  )
}

// ── Unified wound tracker used on every adversary/NPC slot ───────────────────
function AdversaryWoundTracker({
  adv, accentColor, onAdjust,
}: {
  adv: import('@/lib/adversaries').AdversaryInstance
  accentColor: string
  onAdjust: (delta: number) => void
}) {
  const wounds    = adv.woundsCurrent ?? 0
  const isMinion  = adv.type === 'minion'
  const maxWounds = isMinion ? adv.woundThreshold * adv.groupSize : adv.woundThreshold
  const pct       = maxWounds > 0 ? Math.min(1, wounds / maxWounds) : 0

  const barColor  = pct >= 1   ? '#9C27B0'
                  : pct >= 0.8 ? '#f44336'
                  : pct >= 0.5 ? '#FF9800'
                  : accentColor

  const groupAlive = isMinion
    ? Math.min(adv.groupSize, Math.max(0, adv.groupSize - Math.floor(wounds / adv.woundThreshold)))
    : null
  const skillRank = groupAlive !== null ? Math.max(0, groupAlive - 1) : null

  return (
    <div>
      {/* Bar */}
      <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${pct * 100}%`, height: '100%', background: barColor,
          borderRadius: 4, transition: 'width 300ms ease',
          animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
        }} />
      </div>
      {/* x / y label */}
      <div style={{
        fontFamily: "'Share Tech Mono','Courier New',monospace",
        fontSize: 'clamp(0.65rem,1vw,0.78rem)', color: 'rgba(232,223,200,0.5)',
        textAlign: 'right', marginTop: 2,
      }}>
        {wounds} / {maxWounds}
      </div>
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <button
          onClick={() => onAdjust(-1)}
          disabled={wounds === 0}
          style={{
            width: 40, height: 32, borderRadius: 6,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
            cursor: wounds === 0 ? 'not-allowed' : 'pointer',
            fontFamily: "'Share Tech Mono',monospace", fontSize: 18, lineHeight: 1,
            color: wounds === 0 ? 'rgba(232,223,200,0.2)' : 'rgba(232,223,200,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color .12s',
          }}
          onMouseEnter={e => { if (wounds > 0) (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}66` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
        >−</button>
        <span style={{
          flex: 1, textAlign: 'center',
          fontFamily: "'Share Tech Mono','Courier New',monospace",
          fontSize: 'clamp(0.75rem,1.2vw,0.88rem)', color: 'rgba(232,223,200,0.8)',
        }}>
          {wounds} wound{wounds !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => onAdjust(1)}
          style={{
            width: 40, height: 32, borderRadius: 6,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
            cursor: 'pointer',
            fontFamily: "'Share Tech Mono',monospace", fontSize: 18, lineHeight: 1,
            color: 'rgba(232,223,200,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color .12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}66` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
        >+</button>
      </div>
      {/* Minion count — only for minion groups */}
      {isMinion && groupAlive !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 5 }}>
          {Array.from({ length: adv.groupSize }).map((_, i) => (
            <span key={i} style={{
              fontSize: 'clamp(0.6rem,0.9vw,0.7rem)',
              color: i < groupAlive ? barColor : 'rgba(255,255,255,0.15)',
            }}>
              {i < groupAlive ? '■' : '□'}
            </span>
          ))}
          <span style={{
            fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginLeft: 4,
          }}>
            {groupAlive}/{adv.groupSize} · rank {skillRank}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Pending damage row (from DB) ─────────────────────────────────────────────
interface PendingDamage {
  id:                       string
  campaign_id:              string
  encounter_id:             string | null
  target_instance_id:       string | null
  target_name:              string
  attacker_name:            string
  raw_damage:               number
  soak_value:               number
  net_damage:               number
  status:                   'pending' | 'applied' | 'modified' | 'dismissed'
  weapon_name:              string | null
  attack_type:              string | null
  range_band:               string | null
  created_at:               string
  crit_eligible:            boolean
  crit_rating:              number | null
  crit_modifier:            number
  crit_triggered_by_triumph: boolean
}

// ── Combat participant row (from DB) ──────────────────────────────────────────
interface CombatParticipantRow {
  id: string
  character_id: string
  slot_type: 'pc' | 'npc'
  active_weapon_key: string | null
  active_weapon_name: string | null
  default_character_id: string | null
  active_character_id: string | null
  active_character_name: string | null
  has_acted_this_round: boolean
}

// Props
interface CombatPanelProps {
  campaignId: string
  characters: Character[]  // loaded by parent
  isDm: boolean
  sendToChar?: (charId: string, payload: Record<string, unknown>) => void
}

export function CombatPanel({ campaignId, characters, isDm, sendToChar }: CombatPanelProps) {
  // Adversary library state
  const [library, setLibrary] = useState<Adversary[]>([])
  const [libSearch, setLibSearch] = useState('')
  const [libTypeFilter, setLibTypeFilter] = useState<'all' | 'minion' | 'rival' | 'nemesis'>('all')
  const [libLoading, setLibLoading] = useState(true)
  const [libError, setLibError] = useState<string | null>(null)

  // Encounter state
  const [encounter, setEncounter] = useState<CombatEncounter | null>(null)
  const [roster, setRoster] = useState<AdversaryInstance[]>([])
  const [groupSizes, setGroupSizes] = useState<Record<string, number>>({})

  // UI state
  const [showInitModal, setShowInitModal]       = useState(false)
  const [showAddModal, setShowAddModal]         = useState(false)
  const [openCards, setOpenCards]               = useState<Set<string>>(new Set())
  const [reassignOpenSlotId, setReassignOpenSlotId] = useState<string | null>(null)

  // combat_participants rows keyed by character_id
  const [combatParticipants, setCombatParticipants] = useState<Record<string, CombatParticipantRow>>({})

  // Pending damage + defeat notification
  const [pendingDamages, setPendingDamages] = useState<PendingDamage[]>([])
  const [editedDamages, setEditedDamages]   = useState<Record<string, number>>({})
  const [defeatNotif, setDefeatNotif]       = useState<{ message: string; persistent: boolean } | null>(null)

  // GM adversary combat check overlay
  const [advCombatCheck, setAdvCombatCheck] = useState<{
    adv:        AdversaryInstance
    attackType: 'ranged' | 'melee' | null
    alignment:  string
  } | null>(null)

  // Weapon reference lookup: name (lowercase) → stats
  const [weaponRef, setWeaponRef] = useState<Record<string, WeaponRef>>({})

  const supabase = createClient()

  // Load adversary library
  useEffect(() => {
    fetchAdversaries()
      .then(data => { setLibrary(data); setLibLoading(false) })
      .catch(err => { setLibError(String(err?.message ?? err)); setLibLoading(false) })
  }, [])

  // Load weapon reference for stat lookup (weapons in adversaries.json are name-only strings)
  useEffect(() => {
    supabase
      .from('ref_weapons')
      .select('name, damage, damage_add, range_value')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, WeaponRef> = {}
        data.forEach((w: { name: string; damage: number; damage_add: number | null; range_value: string | null }) => {
          map[w.name.toLowerCase()] = w
        })
        setWeaponRef(map)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load or create encounter for this campaign
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('combat_encounters')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const enc = data[0] as CombatEncounter
          setEncounter(enc)
          setRoster(enc.adversaries ?? [])
        }
      })
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime subscription
  useEffect(() => {
    if (!campaignId) return
    const channel = supabase
      .channel(`combat-${campaignId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'combat_encounters',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        if (payload.new) {
          const enc = payload.new as CombatEncounter
          setEncounter(enc)
          setRoster(enc.adversaries ?? [])
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // combat_participants subscription — tracks weapon selection, active character, acted state
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('combat_participants')
      .select('id, character_id, slot_type, active_weapon_key, active_weapon_name, default_character_id, active_character_id, active_character_name, has_acted_this_round')
      .eq('campaign_id', campaignId)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, CombatParticipantRow> = {}
        for (const r of data as CombatParticipantRow[]) {
          map[r.character_id] = r
        }
        setCombatParticipants(map)
      })
    const ch = supabase
      .channel(`combat-participants-${campaignId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'combat_participants',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        if (payload.new) {
          const r = payload.new as CombatParticipantRow
          setCombatParticipants(prev => ({ ...prev, [r.character_id]: r }))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pending damage: initial load + realtime subscription
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('pending_damage')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')
      .order('created_at')
      .then(({ data }) => { if (data) setPendingDamages(data as PendingDamage[]) })

    const ch = supabase
      .channel(`pending-damage-${campaignId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'pending_damage',
        filter: `campaign_id=eq.${campaignId}`,
      }, payload => {
        setPendingDamages(prev => [...prev, payload.new as PendingDamage])
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'pending_damage',
        filter: `campaign_id=eq.${campaignId}`,
      }, payload => {
        if (payload.new.status !== 'pending') {
          setPendingDamages(prev => prev.filter(d => d.id !== payload.new.id))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered library
  const filteredLib = library.filter(a => {
    const matchType = libTypeFilter === 'all' || a.type === libTypeFilter
    const matchSearch = a.name.toLowerCase().includes(libSearch.toLowerCase())
    return matchType && matchSearch
  })

  // Add adversary to live encounter (combat already running)
  const addToActiveCombat = async (adv: Adversary, alignment: 'enemy' | 'allied_npc' = 'enemy', successes = 0, advantages = 0) => {
    if (!encounter) return
    const size = groupSizes[adv.id] ?? (adv.type === 'minion' ? 4 : 1)
    const instance = adversaryToInstance(adv, size)
    const nextOrder = (encounter.initiative_slots.length ?? 0) + 1
    const newSlot: InitiativeSlot = {
      id: randomUUID(),
      type: 'npc',
      alignment,
      order: nextOrder,
      name: adv.name,
      acted: false,
      current: false,
      successes,
      advantages,
      adversaryInstanceId: instance.instanceId,
    }
    await saveEncounter({
      adversaries: [...encounter.adversaries, instance],
      initiative_slots: [...encounter.initiative_slots, newSlot],
    })
  }

  // Add adversary to roster (pre-combat) or directly to live encounter
  const addToRoster = (adv: Adversary, alignment: 'enemy' | 'allied_npc' = 'enemy') => {
    if (encounter) {
      void addToActiveCombat(adv, alignment)
      return
    }
    const size = groupSizes[adv.id] ?? (adv.type === 'minion' ? 4 : 1)
    setRoster(prev => [...prev, adversaryToInstance(adv, size)])
  }

  const removeFromRoster = (instanceId: string) => {
    setRoster(prev => prev.filter(a => a.instanceId !== instanceId))
  }

  // Save encounter to Supabase
  const saveEncounter = useCallback(async (enc: Partial<CombatEncounter>) => {
    if (!encounter?.id) return
    await supabase
      .from('combat_encounters')
      .update({ ...enc, updated_at: new Date().toISOString() })
      .eq('id', encounter.id)
  }, [encounter?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mark current slot acted — also updates has_acted_this_round and handles round reset
  const handleMarkActed = async () => {
    if (!encounter) return
    const currentSlot = encounter.initiative_slots[encounter.current_slot_index]

    // For PC slots: mark the active character as having acted this round
    if (currentSlot?.type === 'pc' && currentSlot.characterId) {
      const participant = combatParticipants[currentSlot.characterId]
      const activeCharId = participant?.active_character_id ?? currentSlot.characterId
      await supabase.from('combat_participants')
        .update({ has_acted_this_round: true })
        .eq('campaign_id', campaignId)
        .eq('character_id', activeCharId)
    }

    const result = advanceInitiative(
      encounter.initiative_slots, encounter.current_slot_index, encounter.round
    )

    // New round: reset all PC slot assignments, weapon selections, and acted flags
    if (result.round > encounter.round) {
      await supabase.from('combat_participants')
        .update({
          active_character_id: null,
          active_character_name: null,
          has_acted_this_round: false,
          active_weapon_key: null,
          active_weapon_name: null,
          active_weapon_updated_at: null,
        })
        .eq('campaign_id', campaignId)
        .eq('slot_type', 'pc')
      await supabase.from('combat_log').insert({
        campaign_id: campaignId,
        encounter_id: encounter.id,
        participant_name: 'System',
        alignment: 'system',
        roll_type: 'system',
        result_summary: `Round ${result.round} begins — initiative reset to default order`,
        is_visible_to_players: true,
      })
    }

    await saveEncounter({
      initiative_slots: result.slots,
      current_slot_index: result.currentIndex,
      round: result.round,
    })
  }

  // End combat
  const handleEndCombat = async () => {
    if (!encounter?.id) return
    await supabase
      .from('combat_encounters')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', encounter.id)
    setEncounter(null)
    setRoster([])
  }

  // Toggle adversary revealed
  const toggleRevealed = async (instanceId: string) => {
    if (!encounter) return
    const updated = encounter.adversaries.map(a =>
      a.instanceId === instanceId ? { ...a, revealed: !a.revealed } : a
    )
    await saveEncounter({ adversaries: updated })
  }

  // Update minion group remaining
  const updateGroupRemaining = async (instanceId: string, delta: number) => {
    if (!encounter) return
    const updated = encounter.adversaries.map(a =>
      a.instanceId === instanceId
        ? { ...a, groupRemaining: Math.max(0, Math.min(a.groupSize, a.groupRemaining + delta)) }
        : a
    )
    await saveEncounter({ adversaries: updated })
  }

  // Update PC wounds in slot (stored on initiative_slot)
  const updatePCWound = async (slotId: string, delta: number) => {
    if (!encounter) return
    const updated = encounter.initiative_slots.map((s: InitiativeSlot) => {
      if (s.id !== slotId) return s
      const pc = characters.find(ch => ch.id === s.characterId)
      const max = pc?.wound_threshold ?? 99
      const base = s.woundsCurrent ?? pc?.wound_current ?? 0
      const next = Math.max(0, Math.min(max, base + delta))
      return { ...s, woundsCurrent: next }
    })
    await saveEncounter({ initiative_slots: updated })
  }

  // Update rival/nemesis wounds (stored on adversary instance)
  const updateNPCWound = async (instanceId: string, delta: number) => {
    if (!encounter) return
    const updated = encounter.adversaries.map(a => {
      if (a.instanceId !== instanceId) return a
      const next = Math.max(0, (a.woundsCurrent ?? 0) + delta)
      return { ...a, woundsCurrent: next }
    })
    await saveEncounter({ adversaries: updated })
  }

  // Manual wound adjustment from +/− controls — handles both minion groups and rivals/nemeses
  const adjustAdversaryWounds = async (adv: AdversaryInstance, delta: number) => {
    if (!encounter) return
    const currentWounds = adv.woundsCurrent ?? 0
    // Clamp heal so wounds never go below zero
    const clampedDelta = delta < 0 ? Math.max(delta, -currentWounds) : delta
    if (clampedDelta === 0 && delta < 0) return

    const wasDefeated = adv.type === 'minion'
      ? adv.groupRemaining === 0
      : currentWounds >= adv.woundThreshold

    const result = applyDamageToAdversary({
      type:           adv.type,
      name:           adv.name,
      woundThreshold: adv.woundThreshold,
      groupSize:      adv.groupSize,
      groupRemaining: adv.groupRemaining,
      woundsCurrent:  currentWounds,
    }, clampedDelta)

    const updatedAdversaries = encounter.adversaries.map(a =>
      a.instanceId !== adv.instanceId ? a
        : { ...a, woundsCurrent: Math.max(0, result.woundsCurrent), groupRemaining: result.groupRemaining }
    )
    await saveEncounter({ adversaries: updatedAdversaries })

    if (!wasDefeated && result.isDefeated && encounter.id) {
      const msg = result.defeatMessage ?? `${adv.name} — DEFEATED`
      setDefeatNotif({ message: msg, persistent: true })
      await supabase.from('combat_log').insert({
        campaign_id: campaignId, encounter_id: encounter.id,
        participant_name: 'SYSTEM', alignment: 'system', roll_type: 'system',
        result_summary: msg, is_visible_to_players: true,
      })
    }
  }

  // Update individual minion wound within a group
  const updateMinionWound = async (instanceId: string, minionIdx: number, delta: number) => {
    if (!encounter) return
    const updated = encounter.adversaries.map(a => {
      if (a.instanceId !== instanceId) return a
      const wounds = [...(a.minionWounds ?? Array(a.groupSize).fill(0))]
      wounds[minionIdx] = Math.max(0, (wounds[minionIdx] ?? 0) + delta)
      // Sync groupRemaining = count of minions below threshold
      const alive = wounds.filter((w: number) => w < a.woundThreshold).length
      return { ...a, minionWounds: wounds, groupRemaining: alive }
    })
    await saveEncounter({ adversaries: updated })
  }

  // Apply pending damage to target adversary
  const applyPendingDamage = async (pd: PendingDamage, damageAmount: number) => {
    if (!encounter) return
    const targetAdv = pd.target_instance_id
      ? encounter.adversaries.find((a: AdversaryInstance) => a.instanceId === pd.target_instance_id)
      : null

    if (targetAdv) {
      const result = applyDamageToAdversary({
        type:           targetAdv.type,
        name:           targetAdv.name,
        woundThreshold: targetAdv.woundThreshold,
        groupSize:      targetAdv.groupSize,
        groupRemaining: targetAdv.groupRemaining,
        woundsCurrent:  targetAdv.woundsCurrent ?? 0,
      }, damageAmount)

      const updatedAdversaries = encounter.adversaries.map((a: AdversaryInstance) =>
        a.instanceId === pd.target_instance_id
          ? { ...a, woundsCurrent: result.woundsCurrent, groupRemaining: result.groupRemaining }
          : a
      )
      await saveEncounter({ adversaries: updatedAdversaries })

      if (result.defeatMessage) {
        setDefeatNotif({ message: result.defeatMessage, persistent: result.isDefeated })
        if (!result.isDefeated) {
          setTimeout(() => setDefeatNotif(null), 4000)
        }
        if (encounter.id) {
          await supabase.from('combat_log').insert({
            campaign_id: campaignId, encounter_id: encounter.id,
            participant_name: 'SYSTEM', alignment: 'system', roll_type: 'system',
            result_summary: result.defeatMessage, is_visible_to_players: true,
          })
        }
      }
    }

    const isModified = damageAmount !== pd.net_damage
    await supabase.from('pending_damage').update({
      status:         isModified ? 'modified' : 'applied',
      applied_damage: damageAmount,
      resolved_at:    new Date().toISOString(),
    }).eq('id', pd.id)
    setEditedDamages(prev => { const next = { ...prev }; delete next[pd.id]; return next })
  }

  // Dismiss pending damage (no effect applied)
  const dismissPendingDamage = async (id: string) => {
    await supabase.from('pending_damage').update({
      status: 'dismissed', resolved_at: new Date().toISOString(),
    }).eq('id', id)
    setEditedDamages(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  // Toggle NPC slot alignment (enemy ↔ allied_npc)
  const toggleAlignment = async (slotId: string) => {
    if (!encounter) return
    const updated: InitiativeSlot[] = encounter.initiative_slots.map((s: InitiativeSlot) => {
      if (s.id !== slotId) return s
      const current: SlotAlignment = s.alignment ?? 'enemy'
      const next: SlotAlignment = current === 'enemy' ? 'allied_npc' : 'enemy'
      return { ...s, alignment: next }
    })
    await saveEncounter({ initiative_slots: updated })
  }

  // Reassign a PC slot to a different character
  const handleReassign = async (defaultCharId: string, newCharId: string, newCharName: string) => {
    const isRestoringDefault = newCharId === (combatParticipants[defaultCharId]?.default_character_id ?? defaultCharId)
    await supabase.from('combat_participants')
      .update({
        active_character_id:   isRestoringDefault ? null : newCharId,
        active_character_name: isRestoringDefault ? null : newCharName,
        active_weapon_key:   null,
        active_weapon_name:  null,
        active_weapon_updated_at: null,
      })
      .eq('campaign_id', campaignId)
      .eq('character_id', defaultCharId)
  }

  // NPC slot adversary assignment
  const assignAdversaryToSlot = async (slotId: string, instanceId: string) => {
    if (!encounter) return
    const adv = encounter.adversaries.find(a => a.instanceId === instanceId)
    const updated = encounter.initiative_slots.map((s: InitiativeSlot) =>
      s.id === slotId ? { ...s, adversaryInstanceId: instanceId, name: adv?.name ?? s.name } : s
    )
    await saveEncounter({ initiative_slots: updated })
  }

  const currentSlot = encounter
    ? encounter.initiative_slots[encounter.current_slot_index]
    : null


  // Type badge component
  const TypeBadge = ({ type }: { type: 'minion' | 'rival' | 'nemesis' | 'pc' | 'npc' }) => {
    const styles: Record<string, { color: string; label: string }> = {
      minion: { color: TEXT_MUTED, label: 'MINION' },
      rival: { color: GOLD, label: 'RIVAL' },
      nemesis: { color: CHAR_BR, label: 'NEMESIS' },
      pc: { color: CHAR_AG, label: 'PC' },
      npc: { color: CHAR_BR, label: 'NPC' },
    }
    const s = styles[type] ?? styles.rival
    return (
      <span style={{
        fontFamily: FM, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em',
        color: s.color, border: `1px solid ${s.color}50`,
        borderRadius: 3, padding: '1px 5px', background: `${s.color}15`,
      }}>
        {s.label}
      </span>
    )
  }

  const canBeginCombat = roster.length > 0 || characters.length > 0

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0, background: BG, overflow: 'hidden', position: 'relative' }}>

      {/* ── Background texture ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        opacity: 0.015,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Cpath d='M0 0l20 20M20 0L0 20' stroke='%23C8AA50' stroke-width='0.5'/%3E%3C/svg%3E")`,
      }} />

      {/* ══════════ LEFT: ADVERSARY LIBRARY ══════════ */}
      <div style={{
        width: 270, flexShrink: 0, borderRight: `1px solid ${BORDER}`,
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        padding: '14px 12px', gap: 10, position: 'relative', zIndex: 1,
      }}>
        <SectionLabel>Adversary Library</SectionLabel>

        {/* Search */}
        <input
          value={libSearch}
          onChange={e => setLibSearch(e.target.value)}
          placeholder="Search adversaries…"
          style={{
            background: INPUT_BG, border: `1px solid ${BORDER}`,
            borderRadius: 4, padding: '6px 10px', color: TEXT,
            fontFamily: FR, fontSize: FS_LABEL, outline: 'none', width: '100%',
            boxSizing: 'border-box',
          }}
        />

        {/* Type filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'minion', 'rival', 'nemesis'] as const).map(t => (
            <button
              key={t}
              onClick={() => setLibTypeFilter(t)}
              style={{
                flex: 1, padding: '4px 0',
                background: libTypeFilter === t ? `${GOLD}20` : 'transparent',
                border: `1px solid ${libTypeFilter === t ? BORDER_MD : BORDER}`,
                borderRadius: 3, cursor: 'pointer',
                fontFamily: FM, fontSize: FS_OVERLINE, letterSpacing: '0.08em',
                color: libTypeFilter === t ? GOLD : TEXT_MUTED,
                textTransform: 'uppercase',
              }}
            >
              {t === 'all' ? 'ALL' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Results list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {libLoading && (
            <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: TEXT_MUTED, textAlign: 'center', padding: '20px 0' }}>
              Loading adversary database…
            </div>
          )}
          {libError && (
            <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: CHAR_BR, textAlign: 'center', padding: '20px 0' }}>
              {libError}
            </div>
          )}
          {!libLoading && filteredLib.map(adv => (
            <div key={adv.id} style={{ ...raisedPanel, padding: '8px 10px' }}>
              {/* Name + badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 600, color: TEXT }}>{adv.name}</span>
                <TypeBadge type={adv.type} />
              </div>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
                <StatBox label="SOAK" value={adv.soak} color={CHAR_WIL} />
                <StatBox label="WT" value={adv.wound} color={CHAR_BR} />
                <StatBox label="M.DEF" value={Array.isArray(adv.defense) ? (adv.defense[0] ?? 0) : 0} color={CHAR_CUN} />
                <StatBox label="R.DEF" value={Array.isArray(adv.defense) ? (adv.defense[1] ?? 0) : 0} color={CHAR_INT} />
              </div>
              {/* Group size for minion */}
              {adv.type === 'minion' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>Group:</span>
                  <input
                    type="number" min={1} max={20}
                    value={groupSizes[adv.id] ?? 4}
                    onChange={e => setGroupSizes(prev => ({ ...prev, [adv.id]: Number(e.target.value) }))}
                    style={{
                      width: 40, background: INPUT_BG, border: `1px solid ${BORDER}`,
                      borderRadius: 3, padding: '2px 4px', color: TEXT,
                      fontFamily: FM, fontSize: FS_CAPTION, textAlign: 'center', outline: 'none',
                    }}
                  />
                </div>
              )}
              {/* Add button */}
              {(() => {
                const inCombat = !!encounter
                const btnColor = inCombat ? CHAR_AG : GOLD
                return (
                  <button
                    onClick={() => addToRoster(adv)}
                    style={{
                      width: '100%', padding: '5px 0',
                      background: 'transparent', border: `1px solid ${btnColor}60`,
                      borderRadius: 3, cursor: 'pointer',
                      fontFamily: FM, fontSize: FS_OVERLINE, letterSpacing: '0.1em',
                      color: btnColor, textTransform: 'uppercase',
                      transition: '.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${btnColor}15` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    {inCombat ? '⚡ Add to Combat' : '＋ Add to Encounter'}
                  </button>
                )
              })()}
            </div>
          ))}
          {!libLoading && filteredLib.length === 0 && !libError && (
            <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: TEXT_MUTED, textAlign: 'center', padding: '20px 0' }}>
              No adversaries found
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <SectionLabel>Current Encounter</SectionLabel>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'transparent', border: `1px solid ${ALLIED_GREEN}60`,
                borderRadius: 3, padding: '3px 8px', cursor: 'pointer',
                fontFamily: FM, fontSize: FS_OVERLINE, letterSpacing: '0.08em',
                color: ALLIED_GREEN, textTransform: 'uppercase', transition: '.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${ALLIED_GREEN}15` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              title="Add Enemy or Allied NPC with alignment choice"
            >＋ Add Participant</button>
          </div>
          {/* Roster */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
            {roster.length === 0 && (
              <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: TEXT_MUTED, fontStyle: 'italic' }}>
                No adversaries added
              </div>
            )}
            {roster.map(a => (
              <div key={a.instanceId} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: RAISED_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '5px 8px',
              }}>
                <div>
                  <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT }}>{a.name}</span>
                  {a.type === 'minion' && (
                    <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginLeft: 6 }}>×{a.groupSize}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TypeBadge type={a.type} />
                  <button
                    onClick={() => removeFromRoster(a.instanceId)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: CHAR_BR, fontSize: FS_SM, padding: 0, lineHeight: 1 }}
                  >✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Begin Combat button */}
          {(() => {
            const combatActive = !!encounter
            const enabled = canBeginCombat && !combatActive
            return (
              <button
                onClick={() => { if (enabled) setShowInitModal(true) }}
                disabled={!enabled}
                style={{
                  width: '100%', padding: '8px 0',
                  background: enabled ? `${CHAR_BR}18` : 'transparent',
                  border: `1px solid ${enabled ? `${CHAR_BR}60` : BORDER}`,
                  borderRadius: 4, cursor: enabled ? 'pointer' : 'default',
                  fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.15em',
                  color: enabled ? CHAR_BR : TEXT_MUTED,
                  textTransform: 'uppercase', transition: '.15s',
                  opacity: combatActive ? 0.45 : 1,
                }}
              >
                {combatActive ? '◼ Combat In Progress' : '▶ Begin Combat / Set Initiative'}
              </button>
            )
          })()}
        </div>
      </div>

      {/* ══════════ CENTER: INITIATIVE TRACKER ══════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* Defeat notification banner */}
        {defeatNotif && (
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            zIndex: 300, minWidth: 260, maxWidth: 420,
            background: 'rgba(224,82,82,0.12)', border: '1px solid rgba(224,82,82,0.4)',
            borderRadius: 8, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            animation: 'fadeSlideIn 200ms ease-out',
          }}>
            <span style={{ fontSize: 'clamp(0.9rem,1.4vw,1.1rem)' }}>☠</span>
            <span style={{
              fontFamily: "'Cinzel','serif'", fontSize: 'clamp(0.82rem,1.3vw,0.95rem)',
              fontWeight: 700, color: '#e05252', flex: 1,
            }}>{defeatNotif.message}</span>
            {defeatNotif.persistent && (
              <button
                onClick={() => setDefeatNotif(null)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'rgba(224,82,82,0.6)', fontSize: 'clamp(0.8rem,1.2vw,0.9rem)', padding: '0 2px',
                }}
              >✕</button>
            )}
          </div>
        )}

        {/* Round bar */}
        <div style={{
          flexShrink: 0, background: RAISED_BG, borderBottom: `1px solid ${BORDER}`,
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          {/* Round number */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.2em', color: TEXT_MUTED, textTransform: 'uppercase' }}>Round</span>
            <span style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: GOLD, lineHeight: 1 }}>
              {encounter?.round ?? 1}
            </span>
          </div>

          {/* Acting Now banner */}
          {currentSlot && (() => {
            const curAlign: SlotAlignment = currentSlot.alignment ?? (currentSlot.type === 'npc' ? 'enemy' : 'player')
            const bannerColor = curAlign === 'allied_npc' ? ALLIED_GREEN : curAlign === 'player' ? CHAR_AG : CHAR_BR
            const slotLabel = currentSlot.type === 'pc' ? 'PC SLOT'
              : curAlign === 'allied_npc' ? 'ALLIED NPC' : 'ENEMY SLOT'
            return (
              <div style={{
                flex: 1, background: `${bannerColor}15`, border: `1px solid ${bannerColor}50`,
                borderRadius: 4, padding: '6px 12px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: bannerColor,
                  boxShadow: `0 0 8px ${bannerColor}`, flexShrink: 0,
                  animation: 'pulse-dot 1.4s ease-in-out infinite',
                }} />
                <span style={{ fontFamily: FC, fontSize: FS_LABEL, color: bannerColor, fontWeight: 600 }}>
                  Acting Now: {currentSlot.name}
                </span>
                <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginLeft: 4 }}>
                  {slotLabel}
                </span>
              </div>
            )
          })()}
          {!encounter && (
            <div style={{ flex: 1, fontFamily: FR, fontSize: FS_LABEL, color: TEXT_MUTED, fontStyle: 'italic' }}>
              No active combat — click Begin Combat to start
            </div>
          )}

          {/* Prev / Next / End Combat */}
          {encounter && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => {
                  const prev = Math.max(0, encounter.current_slot_index - 1)
                  const updated = encounter.initiative_slots.map((s: InitiativeSlot, i: number) => ({ ...s, current: i === prev }))
                  saveEncounter({ initiative_slots: updated, current_slot_index: prev })
                }}
                style={ghostBtn}
              >← Prev</button>
              <button onClick={handleMarkActed} style={ghostBtn}>Next →</button>
              <button
                onClick={handleEndCombat}
                style={{
                  ...ghostBtn,
                  border: `1px solid ${CHAR_BR}60`,
                  color: CHAR_BR,
                  marginLeft: 8,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${CHAR_BR}18` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >■ End Combat</button>
            </div>
          )}
        </div>

        {/* ── Pending Damage Panel ── */}
        {isDm && pendingDamages.length > 0 && (
          <div style={{
            flexShrink: 0, padding: '10px 14px',
            borderBottom: `1px solid rgba(224,82,82,0.25)`,
            display: 'flex', flexDirection: 'column', gap: 8,
            background: 'rgba(224,82,82,0.04)',
          }}>
            <div style={{
              fontFamily: "'Cinzel','serif'", fontSize: 'clamp(0.72rem,1.1vw,0.82rem)',
              fontWeight: 700, color: '#e05252', textTransform: 'uppercase',
              letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              ⚔ Pending Damage
              <span style={{
                fontFamily: "'Share Tech Mono','monospace'", fontSize: 'clamp(0.6rem,0.9vw,0.7rem)',
                background: 'rgba(224,82,82,0.15)', border: '1px solid rgba(224,82,82,0.3)',
                borderRadius: 3, padding: '1px 5px', color: '#e05252',
              }}>{pendingDamages.length}</span>
            </div>

            {pendingDamages.map(pd => {
              const editedVal = editedDamages[pd.id] ?? pd.net_damage
              const setEdited = (v: number) => setEditedDamages(prev => ({ ...prev, [pd.id]: Math.max(0, v) }))

              return (
                <div key={pd.id} style={{
                  background: 'rgba(224,82,82,0.06)', border: '1px solid rgba(224,82,82,0.3)',
                  borderRadius: 10, padding: '10px 12px',
                }}>
                  {/* Attacker → Target */}
                  <div style={{
                    fontFamily: "'Cinzel','serif'", fontSize: 'clamp(0.85rem,1.3vw,1rem)',
                    color: '#C8AA50', marginBottom: 2,
                  }}>
                    {pd.attacker_name} → {pd.target_name}
                  </div>
                  {/* Weapon/attack line */}
                  {pd.weapon_name && (
                    <div style={{
                      fontFamily: "'Rajdhani',sans-serif", fontSize: 'clamp(0.75rem,1.2vw,0.88rem)',
                      color: 'rgba(232,223,200,0.6)', fontStyle: 'italic', marginBottom: 8,
                    }}>
                      {pd.weapon_name}
                      {pd.attack_type && ` (${pd.attack_type.charAt(0).toUpperCase() + pd.attack_type.slice(1)})`}
                      {pd.range_band && ` · ${pd.range_band.charAt(0).toUpperCase() + pd.range_band.slice(1)}`}
                    </div>
                  )}
                  {/* Damage breakdown */}
                  <div style={{ fontFamily: "'Share Tech Mono','monospace'", marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(0.78rem,1.2vw,0.92rem)', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(232,223,200,0.8)' }}>Raw damage</span>
                      <span style={{ color: 'rgba(232,223,200,0.8)' }}>{pd.raw_damage}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(0.78rem,1.2vw,0.92rem)', marginBottom: 4 }}>
                      <span style={{ color: 'rgba(126,200,227,0.7)' }}>Soak</span>
                      <span style={{ color: 'rgba(126,200,227,0.7)' }}>− {pd.soak_value}</span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 'clamp(0.9rem,1.35vw,1.05rem)', fontWeight: 700,
                      borderTop: '1px solid rgba(200,170,80,0.15)', paddingTop: 3,
                    }}>
                      <span style={{ color: '#C8AA50' }}>Net damage</span>
                      <span style={{ color: '#C8AA50' }}>{pd.net_damage}</span>
                    </div>
                  </div>
                  {/* Critical hit notification */}
                  {pd.crit_eligible && (
                    <div style={{
                      marginBottom: 10,
                      padding: '7px 10px',
                      background: 'rgba(255,152,0,0.08)',
                      border: '1px solid rgba(255,152,0,0.4)',
                      borderRadius: 6,
                    }}>
                      <div style={{
                        fontFamily: "'Cinzel','serif'", fontSize: 'clamp(0.68rem,1.05vw,0.78rem)',
                        fontWeight: 700, color: '#FF9800', letterSpacing: '0.08em',
                        textTransform: 'uppercase', marginBottom: 2,
                      }}>
                        ⚠ Critical Hit Available
                      </div>
                      <div style={{
                        fontFamily: "'Rajdhani',sans-serif", fontSize: 'clamp(0.68rem,1.05vw,0.78rem)',
                        color: 'rgba(255,152,0,0.8)', lineHeight: 1.35,
                      }}>
                        {pd.crit_triggered_by_triumph ? 'Triumph' : `Crit ${pd.crit_rating ?? 4}`}
                        {pd.crit_modifier > 0 && ` · Roll +${pd.crit_modifier}`}
                      </div>
                    </div>
                  )}

                  {/* Editable apply value */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{
                      fontFamily: "'Rajdhani',sans-serif", fontSize: 'clamp(0.72rem,1.1vw,0.82rem)',
                      color: 'rgba(232,223,200,0.6)',
                    }}>Apply:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => setEdited(editedVal - 1)}
                        disabled={editedVal <= 0}
                        style={{
                          width: 22, height: 22, borderRadius: 4,
                          cursor: editedVal <= 0 ? 'not-allowed' : 'pointer',
                          background: 'transparent', border: '1px solid rgba(200,170,80,0.3)',
                          fontFamily: "'Share Tech Mono',monospace", fontSize: 14,
                          color: editedVal <= 0 ? 'rgba(200,170,80,0.2)' : 'rgba(200,170,80,0.7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >−</button>
                      <span style={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: 'clamp(0.9rem,1.35vw,1.05rem)', fontWeight: 700,
                        color: '#C8AA50', minWidth: 28, textAlign: 'center',
                      }}>{editedVal}</span>
                      <button
                        onClick={() => setEdited(editedVal + 1)}
                        style={{
                          width: 22, height: 22, borderRadius: 4, cursor: 'pointer',
                          background: 'rgba(200,170,80,0.1)', border: '1px solid rgba(200,170,80,0.3)',
                          fontFamily: "'Share Tech Mono',monospace", fontSize: 14, color: '#C8AA50',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >+</button>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => void dismissPendingDamage(pd.id)}
                      style={{
                        flex: 1, padding: '7px 0',
                        background: 'transparent', border: '1px solid rgba(232,223,200,0.15)',
                        borderRadius: 6, cursor: 'pointer',
                        fontFamily: "'Cinzel','serif'", fontSize: 'clamp(0.72rem,1.1vw,0.82rem)',
                        color: 'rgba(232,223,200,0.5)',
                      }}
                    >✗ Dismiss</button>
                    <button
                      onClick={() => void applyPendingDamage(pd, editedVal)}
                      style={{
                        flex: 2, padding: '7px 0',
                        background: 'rgba(224,82,82,0.15)', border: '1px solid rgba(224,82,82,0.5)',
                        borderRadius: 6, cursor: 'pointer',
                        fontFamily: "'Cinzel','serif'", fontSize: 'clamp(0.72rem,1.1vw,0.82rem)',
                        fontWeight: 700, color: '#e05252',
                      }}
                    >✓ Apply Damage</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Slot list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionLabel>Initiative Order</SectionLabel>
          {!encounter && (
            <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: FR, fontSize: FS_SM, color: TEXT_MUTED }}>
              Start combat to see the initiative order
            </div>
          )}
          {encounter?.initiative_slots.map((slot: InitiativeSlot, idx: number) => {
            const isCurrent = slot.current
            const isActed = slot.acted
            const isNPC = slot.type === 'npc'

            // PC slot: resolve active vs default character
            const participant = !isNPC && slot.characterId ? combatParticipants[slot.characterId] : null
            const activeCharId = participant?.active_character_id ?? slot.characterId
            const defaultCharId = participant?.default_character_id ?? slot.characterId
            const activeChar = !isNPC ? characters.find(ch => ch.id === activeCharId) : null
            const defaultChar = !isNPC && activeCharId !== defaultCharId
              ? characters.find(ch => ch.id === defaultCharId)
              : null
            const isReassigned = activeCharId !== defaultCharId

            const assignedAdv = slot.adversaryInstanceId
              ? encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
              : null
            const isMinion = assignedAdv?.type === 'minion'
            const isKilledNPC = !isMinion && assignedAdv
              ? (assignedAdv.woundsCurrent ?? 0) >= (assignedAdv.woundThreshold ?? 99)
              : false
            const pcChar = activeChar ?? (!isNPC ? characters.find(ch => ch.id === slot.characterId) : null)
            const pcWT = pcChar?.wound_threshold ?? 0
            const pcWounds = slot.woundsCurrent ?? pcChar?.wound_current ?? 0
            const pcCrit = !isNPC && pcWT > 0 && pcWounds >= pcWT
            const effectiveAlignment: SlotAlignment = slot.alignment ?? (isNPC ? 'enemy' : 'player')
            const accentColor = isKilledNPC ? CHAR_BR
              : effectiveAlignment === 'allied_npc' ? ALLIED_GREEN
              : effectiveAlignment === 'player'     ? CHAR_AG
              : CHAR_BR

            return (
              <div
                key={slot.id}
                style={{
                  background: isKilledNPC ? `${CHAR_BR}08` : isCurrent ? `${accentColor}0a` : PANEL_BG,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: 6,
                  position: 'relative',
                  border: `1px solid ${isKilledNPC ? `${CHAR_BR}40` : isCurrent ? `${accentColor}80` : BORDER}`,
                  borderLeft: `3px solid ${accentColor}`,
                  opacity: isKilledNPC ? 0.55 : isActed ? 0.45 : 1,
                  padding: '8px 12px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: '.2s',
                  boxShadow: isCurrent ? `0 0 12px ${accentColor}30` : 'none',
                }}
              >
                {/* ── Col 1: Init number ── */}
                <span style={{
                  fontFamily: FC, fontSize: FS_H4, fontWeight: 700, minWidth: 20, textAlign: 'center',
                  color: isCurrent ? GOLD : TEXT_MUTED, lineHeight: 1, flexShrink: 0,
                }}>
                  {idx + 1}
                </span>

                {/* ── Col 2: Info ── */}
                <div style={{ flex: 1, minWidth: 0 }}>

                  {/* Row 1: name + alignment badge + NPC selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: FC, fontSize: FS_SM, fontWeight: 700,
                      color: isCurrent ? TEXT : TEXT_SEC,
                      textDecoration: !isNPC && (participant?.has_acted_this_round) ? 'line-through' : 'none',
                      opacity: !isNPC && (participant?.has_acted_this_round) ? 0.5 : 1,
                    }}>
                      {!isNPC ? (activeChar?.name ?? slot.name) : slot.name}
                    </span>
                    {/* Alignment badge — clickable for NPC slots to toggle enemy ↔ allied */}
                    {isNPC ? (
                      <button
                        onClick={() => void toggleAlignment(slot.id)}
                        title="Click to toggle Enemy / Allied NPC"
                        style={{
                          fontFamily: FM, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em',
                          color: accentColor, border: `1px solid ${accentColor}50`,
                          borderRadius: 3, padding: '1px 5px', background: `${accentColor}15`,
                          cursor: 'pointer', transition: '.12s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${accentColor}30` }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${accentColor}15` }}
                      >
                        {effectiveAlignment === 'allied_npc' ? 'ALLIED' : 'ENEMY'}
                      </button>
                    ) : (
                      <TypeBadge type={slot.type} />
                    )}
                    {isNPC && encounter.adversaries.length > 0 && (
                      <select
                        value={slot.adversaryInstanceId ?? ''}
                        onChange={e => assignAdversaryToSlot(slot.id, e.target.value)}
                        style={{
                          background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: 3,
                          padding: '1px 5px', color: TEXT_SEC, fontFamily: FM, fontSize: FS_OVERLINE, outline: 'none',
                        }}
                      >
                        <option value="">— assign —</option>
                        {encounter.adversaries.map(a => (
                          <option key={a.instanceId} value={a.instanceId}>{a.name}{a.type === 'minion' ? ` (${a.groupRemaining}/${a.groupSize})` : ''}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* ↳ Default indicator (only when reassigned) */}
                  {!isNPC && isReassigned && defaultChar && (
                    <div style={{
                      fontFamily: "'Share Tech Mono','Courier New',monospace",
                      fontSize: 'clamp(0.58rem, 0.85vw, 0.68rem)',
                      color: 'rgba(232,223,200,0.3)', fontStyle: 'italic',
                      marginTop: 1,
                    }}>
                      ↳ Default: {defaultChar.name}
                    </div>
                  )}

                  {/* Row 2: stat line + weapon + reassign button */}
                  {!isNPC && pcChar && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      <StatBox label="SOAK" value={pcChar.soak ?? 0} color={CHAR_WIL} />
                      <StatBox label="WOUNDS" value={`${pcWounds}/${pcWT}`} color={CHAR_BR} />
                      <StatBox label="M.DEF" value={pcChar.defense_melee ?? 0} color={CHAR_CUN} />
                      <StatBox label="R.DEF" value={pcChar.defense_ranged ?? 0} color={CHAR_INT} />
                      {participant?.active_weapon_name && (
                        <span style={{
                          fontFamily: FM, fontSize: FS_OVERLINE, color: CHAR_AG,
                          background: `${CHAR_AG}12`, border: `1px solid ${CHAR_AG}40`,
                          borderRadius: 3, padding: '2px 6px', whiteSpace: 'nowrap',
                        }}>
                          ⚔ {participant.active_weapon_name}
                        </span>
                      )}
                      {/* Reassign button */}
                      <div style={{ marginLeft: 'auto', position: 'relative' }}>
                        <button
                          onClick={() => setReassignOpenSlotId(prev => prev === slot.id ? null : slot.id)}
                          style={{
                            fontFamily: FC, fontSize: 'clamp(0.65rem, 1vw, 0.75rem)',
                            color: 'rgba(200,170,80,0.5)', border: '1px solid rgba(200,170,80,0.2)',
                            borderRadius: 5, padding: '2px 8px', background: 'transparent',
                            cursor: 'pointer', transition: '.12s', whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement
                            el.style.color = GOLD; el.style.borderColor = `${GOLD}70`
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement
                            el.style.color = 'rgba(200,170,80,0.5)'; el.style.borderColor = 'rgba(200,170,80,0.2)'
                          }}
                        >⇄ Reassign</button>

                        {/* Inline reassign dropdown */}
                        {reassignOpenSlotId === slot.id && (
                          <>
                          {/* Click-outside backdrop */}
                          <div
                            style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                            onClick={() => setReassignOpenSlotId(null)}
                          />
                          <div style={{
                            position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 200,
                            background: 'rgba(6,13,9,0.97)',
                            border: '1px solid rgba(200,170,80,0.25)',
                            borderRadius: 8, backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            minWidth: 200, padding: '6px 0',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                          }}>
                            <div style={{
                              padding: '2px 12px 6px',
                              fontFamily: FM, fontSize: FS_OVERLINE,
                              color: 'rgba(232,223,200,0.35)',
                              borderBottom: '1px solid rgba(200,170,80,0.1)',
                              marginBottom: 4,
                            }}>
                              Assign this slot to:
                            </div>
                            {characters.map(c => {
                              const isCurrentlyActive = c.id === activeCharId
                              const isDefault = c.id === defaultCharId
                              const hasActed = combatParticipants[c.id]?.has_acted_this_round ?? false
                              return (
                                <button
                                  key={c.id}
                                  disabled={hasActed}
                                  onClick={() => {
                                    if (!slot.characterId) return
                                    void handleReassign(slot.characterId, c.id, c.name)
                                    setReassignOpenSlotId(null)
                                  }}
                                  style={{
                                    width: '100%', padding: '6px 12px',
                                    background: isCurrentlyActive ? `${CHAR_AG}10` : 'transparent',
                                    border: 'none', cursor: hasActed ? 'default' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    opacity: hasActed ? 0.38 : 1,
                                    transition: '.1s',
                                  }}
                                  onMouseEnter={e => { if (!hasActed) (e.currentTarget as HTMLElement).style.background = `${CHAR_AG}18` }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isCurrentlyActive ? `${CHAR_AG}10` : 'transparent' }}
                                >
                                  <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: CHAR_AG, width: 12, flexShrink: 0 }}>
                                    {isCurrentlyActive ? '●' : '○'}
                                  </span>
                                  <span style={{
                                    fontFamily: FC, fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
                                    color: hasActed ? TEXT_MUTED : TEXT, flex: 1, textAlign: 'left',
                                  }}>
                                    {c.name}
                                  </span>
                                  {isDefault && (
                                    <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, fontStyle: 'italic', flexShrink: 0 }}>
                                      (default)
                                    </span>
                                  )}
                                  {hasActed && (
                                    <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, fontStyle: 'italic', flexShrink: 0 }}>
                                      (acted)
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                            <div style={{ padding: '6px 12px 2px', borderTop: '1px solid rgba(200,170,80,0.1)', marginTop: 4 }}>
                              <button
                                onClick={() => setReassignOpenSlotId(null)}
                                style={{
                                  background: 'transparent', border: '1px solid rgba(200,170,80,0.2)',
                                  borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
                                  fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED,
                                }}
                              >Cancel</button>
                            </div>
                          </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  {isNPC && assignedAdv && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                      <StatBox label="SOAK" value={assignedAdv.soak} color={CHAR_WIL} />
                      <StatBox label="WT" value={assignedAdv.woundThreshold} color={CHAR_BR} />
                      <StatBox label="M.DEF" value={assignedAdv.defense.melee} color={CHAR_CUN} />
                      <StatBox label="R.DEF" value={assignedAdv.defense.ranged} color={CHAR_INT} />
                    </div>
                  )}

                  {/* Row 3: unified wound tracker for all NPC types */}
                  {isNPC && assignedAdv && (
                    <div style={{ marginTop: 6 }}>
                      <AdversaryWoundTracker
                        adv={assignedAdv}
                        accentColor={accentColor}
                        onAdjust={delta => { void adjustAdversaryWounds(assignedAdv, delta) }}
                      />
                    </div>
                  )}
                </div>

                {/* ── Col 3: PC wound block only (NPCs use AdversaryWoundTracker in Col 2) ── */}
                {!isNPC && pcWT > 0 && (
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {pcCrit ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: `${CHAR_BR}20`, border: `1px solid ${CHAR_BR}70`,
                        borderRadius: 4, padding: '3px 7px',
                      }}>
                        <span style={{ fontSize: 12 }}>⚡</span>
                        <span style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: CHAR_BR, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>CRIT — D100</span>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => updatePCWound(slot.id, -1)} style={smallCtrlBtn}>−</button>
                        <span style={{
                          fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700,
                          color: pcWounds > 0 ? CHAR_BR : TEXT_MUTED,
                          minWidth: 34, textAlign: 'center',
                          background: `${CHAR_BR}10`, border: `1px solid ${CHAR_BR}30`,
                          borderRadius: 3, padding: '2px 4px',
                        }}>
                          {pcWounds}/{pcWT}
                        </span>
                        <button onClick={() => updatePCWound(slot.id, 1)} style={smallCtrlBtn}>+</button>
                      </>
                    )}
                  </div>
                )}

                {/* ── Col 4: Action buttons ── */}
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  {isActed ? (
                    <span style={{ fontFamily: FM, fontSize: FS_LABEL, fontWeight: 700, color: CHAR_WIL, border: `1px solid ${CHAR_WIL}50`, borderRadius: 3, padding: '3px 8px', whiteSpace: 'nowrap' }}>
                      ✓ Acted
                    </span>
                  ) : isCurrent ? (
                    <>
                      <button
                        onClick={handleMarkActed}
                        style={{ ...ghostBtn, border: `1px solid ${GOLD}60`, color: GOLD, background: `${GOLD}15`, fontSize: FS_LABEL, padding: '4px 10px' }}
                      >Acted</button>
                      <button
                        onClick={() => {
                          const nextIdx = idx + 1
                          const updated = encounter.initiative_slots.map((s: InitiativeSlot, i: number) =>
                            i === idx ? { ...s, acted: true, current: false }
                              : i === nextIdx ? { ...s, current: true }
                                : s
                          )
                          saveEncounter({ initiative_slots: updated, current_slot_index: nextIdx })
                        }}
                        style={{ ...ghostBtn, fontSize: FS_LABEL, padding: '4px 10px' }}
                      >Skip</button>
                    </>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Combat Log ── */}
        <CombatLog
          campaignId={campaignId}
          encounterId={encounter?.id ?? null}
          isDm={isDm}
        />
      </div>

      {/* ══════════ RIGHT: ADVERSARY DETAIL CARDS ══════════ */}
      <div style={{
        width: 490, flexShrink: 0, borderLeft: `1px solid ${BORDER}`,
        overflowY: 'auto', padding: '14px 12px', minHeight: 0,
        display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 1,
      }}>
        <SectionLabel>Encounter Adversaries</SectionLabel>
        {(!encounter?.adversaries || encounter.adversaries.length === 0) && (
          <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: TEXT_MUTED, fontStyle: 'italic' }}>
            No adversaries in encounter
          </div>
        )}
        {encounter?.adversaries?.map(adv => {
          const isOpen = openCards.has(adv.instanceId)
          const toggleOpen = () => setOpenCards(prev => {
            const next = new Set(prev)
            isOpen ? next.delete(adv.instanceId) : next.add(adv.instanceId)
            return next
          })
          const CHAR_COLORS = [CHAR_BR, CHAR_AG, CHAR_INT, CHAR_CUN, CHAR_WIL, CHAR_PR]
          const CHAR_KEYS = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const
          const CHAR_ABBR = ['BR', 'AG', 'INT', 'CUN', 'WIL', 'PR']

          const TALENT_ACT_COLORS: Record<string, string> = {
            passive: TEXT_MUTED, incidental: GOLD, maneuver: CHAR_AG, action: CHAR_BR, 'out of turn': CHAR_WIL,
          }

          // Parse talent description for dice hint chips
          const parseTalentDice = (desc = '') => {
            const d = desc.toLowerCase()
            const chips: { label: string; color: string; title: string }[] = []
            if ((d.match(/add\w* (?:a |one |two |an? )?boost|boost die|boost dice/g) ?? []).length > 0)
              chips.push({ label: '+□', color: '#70C8E8', title: 'Adds Boost die' })
            if ((d.match(/remov\w* (?:a |one |two |an? )?setback|cancel\w* (?:a |)?setback/g) ?? []).length > 0)
              chips.push({ label: '−■', color: '#4EC87A', title: 'Removes Setback die' })
            if ((d.match(/upgrad\w* (?:the |a |an? )?(?:abilit|skill|check|roll)/g) ?? []).length > 0)
              chips.push({ label: '↑', color: '#FFD700', title: 'Upgrades ability to proficiency' })
            if ((d.match(/add\w* (?:a |one |two |an? )?setback|impose\w* (?:a |one |two |an? )?setback/g) ?? []).length > 0)
              chips.push({ label: '+■', color: '#909090', title: 'Adds Setback die' })
            return chips
          }

          // Skill → governing characteristic key
          const SKILL_CHAR: Record<string, keyof typeof adv.characteristics> = {
            'Athletics': 'brawn', 'Brawl': 'brawn', 'Lightsaber': 'brawn', 'Melee': 'brawn', 'Resilience': 'brawn',
            'Coordination': 'agility', 'Gunnery': 'agility', 'Piloting: Planetary': 'agility', 'Piloting: Space': 'agility',
            'Piloting (Planetary)': 'agility', 'Piloting (Space)': 'agility',
            'Ranged: Heavy': 'agility', 'Ranged: Light': 'agility', 'Ranged (Heavy)': 'agility', 'Ranged (Light)': 'agility',
            'Stealth': 'agility',
            'Astrogation': 'intellect', 'Computers': 'intellect', 'Mechanics': 'intellect', 'Medicine': 'intellect',
            'Knowledge: Core Worlds': 'intellect', 'Knowledge: Education': 'intellect', 'Knowledge: Lore': 'intellect',
            'Knowledge: Outer Rim': 'intellect', 'Knowledge: Underworld': 'intellect',
            'Knowledge: Warfare': 'intellect', 'Knowledge: Xenology': 'intellect',
            'Deception': 'cunning', 'Perception': 'cunning', 'Skulduggery': 'cunning',
            'Streetwise': 'cunning', 'Survival': 'cunning',
            'Coercion': 'willpower', 'Discipline': 'willpower', 'Vigilance': 'willpower',
            'Charm': 'presence', 'Cool': 'presence', 'Leadership': 'presence', 'Negotiation': 'presence',
          }
          const CHAR_ABBR_MAP: Record<string, string> = {
            brawn: 'Br', agility: 'Ag', intellect: 'Int', cunning: 'Cun', willpower: 'Wil', presence: 'Pr',
          }
          const CHAR_COLOR_MAP: Record<string, string> = {
            brawn: CHAR_BR, agility: CHAR_AG, intellect: CHAR_INT,
            cunning: CHAR_CUN, willpower: CHAR_WIL, presence: CHAR_PR,
          }

          const advSlot = encounter?.initiative_slots?.find((s: import('@/lib/combat').InitiativeSlot) => s.adversaryInstanceId === adv.instanceId)
          const advAlignment = advSlot?.alignment ?? 'enemy'
          const advAccent = advAlignment === 'allied_npc' ? ALLIED_GREEN : CHAR_BR

          // Wound / defeat state for the card
          const groupTotal   = adv.type === 'minion' ? adv.woundThreshold * adv.groupSize : adv.woundThreshold
          const groupWounds  = adv.woundsCurrent ?? 0
          const woundPct     = groupTotal > 0 ? Math.min(1, groupWounds / groupTotal) : 0
          const isDefeatedAdv = groupWounds >= groupTotal && groupTotal > 0
          const groupAliveAdv = adv.type === 'minion'
            ? Math.max(0, adv.groupSize - Math.floor(groupWounds / adv.woundThreshold))
            : null

          return (
            <div key={adv.instanceId} style={{
              background: isDefeatedAdv ? 'rgba(232,223,200,0.02)' : PANEL_BG,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 6,
              position: 'relative',
              borderTop: `2px solid ${isDefeatedAdv ? 'rgba(232,223,200,0.1)' : `${advAccent}80`}`,
              borderRight: `1px solid ${BORDER}`,
              borderBottom: `1px solid ${BORDER}`,
              borderLeft: `1px solid ${BORDER}`,
              opacity: isDefeatedAdv ? 0.45 : 1,
              transition: 'opacity 400ms',
            }}>
              {/* Header — click to expand/collapse */}
              <div
                style={{ padding: '10px 12px 8px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                onClick={toggleOpen}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontFamily: FC, fontSize: FS_SM, fontWeight: 700,
                      color: TEXT, textDecoration: isDefeatedAdv ? 'line-through' : 'none',
                    }}>{adv.name}</span>
                    {isDefeatedAdv ? (
                      <span style={{
                        fontFamily: FM, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em',
                        color: 'rgba(232,223,200,0.25)', border: '1px solid rgba(232,223,200,0.15)',
                        borderRadius: 3, padding: '1px 5px', background: 'rgba(232,223,200,0.05)',
                      }}>DEFEATED</span>
                    ) : (
                      <TypeBadge type={adv.type} />
                    )}
                    {adv.type === 'minion' && !isDefeatedAdv && (
                      <span style={{
                        fontFamily: FM, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em',
                        color: advAccent, border: `1px solid ${advAccent}50`,
                        borderRadius: 3, padding: '1px 5px', background: `${advAccent}10`,
                      }}>MINION GROUP</span>
                    )}
                  </div>
                </div>
                <span style={{ color: TEXT_MUTED, fontSize: FS_SM }}>{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* Wound tracker — always visible, outside click area */}
              <div style={{ padding: '0 12px 10px' }}>
                <AdversaryWoundTracker
                  adv={adv}
                  accentColor={advAccent}
                  onAdjust={delta => { void adjustAdversaryWounds(adv, delta) }}
                />
              </div>

              {/* Body */}
              {isOpen && (
                <div style={{ padding: '0 12px 12px', borderTop: `1px solid ${BORDER}` }}>

                  {/* Characteristics grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, marginTop: 10, marginBottom: 10 }}>
                    {CHAR_KEYS.map((key, i) => (
                      <div key={key} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: FM, fontSize: FS_H4, fontWeight: 700, color: CHAR_COLORS[i], lineHeight: 1 }}>
                          {adv.characteristics[key]}
                        </div>
                        <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginTop: 2 }}>{CHAR_ABBR[i]}</div>
                      </div>
                    ))}
                  </div>

                  {/* Derived stats pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                    {[
                      { label: 'Soak', value: adv.soak, color: CHAR_WIL },
                      { label: 'WT', value: adv.woundThreshold, color: CHAR_BR },
                      ...(adv.strainThreshold !== undefined ? [{ label: 'ST', value: adv.strainThreshold, color: CHAR_AG }] : []),
                      { label: 'M.Def', value: adv.defense.melee, color: CHAR_CUN },
                      { label: 'R.Def', value: adv.defense.ranged, color: CHAR_INT },
                    ].map(stat => (
                      <div key={stat.label} style={{
                        background: `${stat.color}15`, border: `1px solid ${stat.color}40`,
                        borderRadius: 3, padding: '3px 7px', textAlign: 'center',
                      }}>
                        <div style={{ fontFamily: FM, fontSize: FS_H4, fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                        <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Skills table */}
                  {Object.keys(adv.skillRanks ?? {}).length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${GOLD}90`, marginBottom: 6 }}>Skills</div>
                      {/* Header */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 24px auto', gap: '2px 6px', marginBottom: 3 }}>
                        {['Skill', 'Char', 'Rnk', 'Roll'].map(h => (
                          <div key={h} style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</div>
                        ))}
                      </div>
                      {/* Rows */}
                      {Object.entries(adv.skillRanks).map(([skill, rank]) => {
                        const charKey = SKILL_CHAR[skill]
                        const charVal = charKey ? adv.characteristics[charKey] : 0
                        const prof = Math.min(charVal, rank)
                        const abil = Math.max(charVal, rank) - prof
                        const charColor = charKey ? CHAR_COLOR_MAP[charKey] : TEXT_MUTED
                        return (
                          <div key={skill} style={{
                            display: 'grid', gridTemplateColumns: '1fr 32px 24px auto',
                            gap: '2px 6px', alignItems: 'center',
                            padding: '3px 0', borderBottom: `1px solid ${BORDER}`,
                          }}>
                            <span style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_SEC }}>{skill}</span>
                            <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: charColor, textAlign: 'center' }}>
                              {charKey ? CHAR_ABBR_MAP[charKey] : '—'}
                            </span>
                            <span style={{ fontFamily: FM, fontSize: FS_LABEL, fontWeight: 700, color: TEXTGR, textAlign: 'center' }}>{rank}</span>
                            <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                              {Array.from({ length: prof }).map((_, i) => (
                                <div key={`p${i}`} style={{ width: 11, height: 11, borderRadius: '50%', background: '#FFE066', border: '1px solid #C8AA50', flexShrink: 0 }} title="Proficiency" />
                              ))}
                              {Array.from({ length: abil }).map((_, i) => (
                                <div key={`a${i}`} style={{ width: 11, height: 11, borderRadius: '50%', background: '#4EC87A', border: '1px solid #2fa85a', flexShrink: 0 }} title="Ability" />
                              ))}
                              {prof === 0 && abil === 0 && (
                                <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>—</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Talents */}
                  {adv.talents && adv.talents.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${GOLD}90`, marginBottom: 5 }}>Talents</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {adv.talents.map((t, i) => {
                          const actKey = (t.activation ?? 'passive').toLowerCase()
                          const color = TALENT_ACT_COLORS[actKey] ?? TEXT_MUTED
                          const diceChips = parseTalentDice(t.description)
                          return (
                            <div key={i} style={{
                              background: `${color}15`, border: `1px solid ${color}40`,
                              borderRadius: 3, padding: '3px 7px',
                              display: 'flex', alignItems: 'center', gap: 5,
                            }} title={t.description}>
                              <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color }}>{t.name}</span>
                              {diceChips.map((chip, ci) => (
                                <span key={ci} title={chip.title} style={{
                                  fontFamily: FM, fontSize: FS_OVERLINE, fontWeight: 700,
                                  color: chip.color, background: `${chip.color}18`,
                                  border: `1px solid ${chip.color}50`,
                                  borderRadius: 2, padding: '0 3px',
                                }}>{chip.label}</span>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Abilities */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: CHAR_INT, marginBottom: 6 }}>Abilities</div>
                    <div style={{ background: `${CHAR_INT}0c`, border: `1px solid ${CHAR_INT}30`, borderRadius: 4, padding: '7px 9px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {adv.abilities && adv.abilities.length > 0 ? adv.abilities.map((ab, i) => (
                        <div key={i}>
                          <span style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: CHAR_INT }}>{ab.name}{ab.description ? ': ' : ''}</span>
                          {ab.description && <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT_SEC }}><MarkupText text={ab.description} /></span>}
                        </div>
                      )) : (
                        <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT_MUTED, fontStyle: 'italic' }}>
                          No special abilities
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gear */}
                  {adv.gear && adv.gear.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${GOLD}90`, marginBottom: 5 }}>Gear</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {adv.gear.map((item, i) => (
                          <div key={i} style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_SEC }}>
                            · {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weapons */}
                  {adv.weapons && adv.weapons.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${GOLD}90`, marginBottom: 5 }}>Weapons</div>
                      {adv.weapons.map((w, i) => {
                        const { dmg, range } = resolveWeapon(w, adv.characteristics.brawn, weaponRef)
                        const quals = w.qualities && w.qualities.length > 0 ? ` — ${w.qualities.join(', ')}` : ''
                        return (
                          <div key={i} style={{ fontFamily: FM, fontSize: FS_LABEL, fontWeight: 500, color: TEXTGR, marginBottom: 2 }}>
                            {w.name} — DMG {dmg} — {range}{quals}
                          </div>
                        )
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* Reveal toggle — pinned footer, always visible when card is open */}
              {isOpen && (
                <div style={{
                  borderTop: `1px solid ${BORDER}`, padding: '7px 12px',
                  background: adv.revealed ? `${CHAR_AG}0a` : RAISED_BG,
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={adv.revealed}
                      onChange={() => toggleRevealed(adv.instanceId)}
                      style={{ accentColor: CHAR_AG, width: 14, height: 14 }}
                    />
                    <span style={{ fontFamily: FM, fontSize: FS_LABEL, fontWeight: 600, color: adv.revealed ? CHAR_AG : TEXT_MUTED, letterSpacing: '0.08em' }}>
                      {adv.revealed ? '✓ Revealed to Players' : 'Reveal to Players'}
                    </span>
                  </label>
                </div>
              )}

              {/* Combat check buttons — always visible when card is open */}
              {isOpen && adv.weapons && adv.weapons.length > 0 && (() => {
                const slot = encounter?.initiative_slots?.find((s: import('@/lib/combat').InitiativeSlot) => s.adversaryInstanceId === adv.instanceId)
                const alignment = slot?.alignment ?? 'enemy'
                const accentColor = alignment === 'allied_npc' ? ALLIED_GREEN : CHAR_BR
                return (
                  <div style={{
                    borderTop: `1px solid ${BORDER}`, padding: '7px 12px',
                    display: 'flex', gap: 6,
                  }}>
                    <button
                      onClick={() => setAdvCombatCheck({ adv, attackType: 'melee', alignment })}
                      style={{
                        flex: 1, padding: '5px 0',
                        background: `${accentColor}15`,
                        border: `1px solid ${accentColor}50`,
                        borderRadius: 4, cursor: 'pointer',
                        fontFamily: FM, fontSize: FS_LABEL, fontWeight: 600,
                        color: accentColor, letterSpacing: '0.05em',
                      }}
                    >
                      ⚔ Melee
                    </button>
                    <button
                      onClick={() => setAdvCombatCheck({ adv, attackType: 'ranged', alignment })}
                      style={{
                        flex: 1, padding: '5px 0',
                        background: `${accentColor}15`,
                        border: `1px solid ${accentColor}50`,
                        borderRadius: 4, cursor: 'pointer',
                        fontFamily: FM, fontSize: FS_LABEL, fontWeight: 600,
                        color: accentColor, letterSpacing: '0.05em',
                      }}
                    >
                      ⊕ Ranged
                    </button>
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>

      {/* ── Initiative Setup Modal ── */}
      {showInitModal && (
        <InitiativeSetupModal
          campaignId={campaignId}
          characters={characters}
          roster={roster}
          sendToChar={sendToChar}
          onClose={() => setShowInitModal(false)}
          onStart={async (encounterData) => {
            const { data } = await supabase
              .from('combat_encounters')
              .upsert({ ...encounterData, campaign_id: campaignId })
              .select()
              .single()
            if (data) {
              setEncounter(data as CombatEncounter)
              // Upsert PC participant rows (slot_type, default/active character)
              const pcSlots = encounterData.initiative_slots.filter(s => s.type === 'pc' && s.characterId)
              if (pcSlots.length > 0) {
                const pcRows = pcSlots.map(s => {
                  const char = characters.find(c => c.id === s.characterId)
                  return {
                    campaign_id:           campaignId,
                    character_id:          s.characterId!,
                    slot_type:             'pc' as const,
                    default_character_id:  s.characterId!,
                    active_character_id:   s.characterId!,
                    active_character_name: char?.name ?? s.name,
                    has_acted_this_round:  false,
                    active_weapon_key:     null,
                    active_weapon_name:    null,
                  }
                })
                await supabase.from('combat_participants')
                  .upsert(pcRows, { onConflict: 'campaign_id,character_id' })
              }
              // Write system message to persistent combat log
              await supabase.from('combat_log').insert({
                campaign_id: campaignId,
                encounter_id: data.id,
                participant_name: 'System',
                alignment: 'system',
                roll_type: 'system',
                result_summary: `Combat started — Round 1 · ${encounterData.initiative_type === 'cool' ? 'Cool' : 'Vigilance'} initiative`,
                is_visible_to_players: true,
              })
            }
            setShowInitModal(false)
          }}
        />
      )}

      {/* ── Add Participant Modal ── */}
      {showAddModal && (
        <AddParticipantModal
          library={library}
          encounter={encounter}
          groupSizes={groupSizes}
          onAdd={(adv, alignment, successes, advantages, groupSize) => {
            if (groupSize !== undefined) setGroupSizes(prev => ({ ...prev, [adv.id]: groupSize }))
            if (encounter) {
              void addToActiveCombat(adv, alignment, successes, advantages)
            } else {
              addToRoster(adv, alignment)
            }
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* GM Adversary Combat Check Overlay */}
      {advCombatCheck && (() => {
        const { adv, attackType, alignment } = advCombatCheck
        const adapted = adaptAdversaryForCombatCheck(adv, campaignId)
        // Build targets: PCs + allied NPCs (excluding this adversary)
        const pcStubs = charactersToAdversaryStubs(characters)
        const alliedStubs = (encounter?.adversaries ?? [])
          .filter((a: AdversaryInstance) => {
            const s = encounter?.initiative_slots?.find((sl: import('@/lib/combat').InitiativeSlot) => sl.adversaryInstanceId === a.instanceId)
            return s?.alignment === 'allied_npc' && a.instanceId !== adv.instanceId
          })
        const gmTargets: AdversaryInstance[] = [...pcStubs, ...alliedStubs]

        function handleAdvRoll(result: RollResult, label?: string, pool?: Record<string, number>, meta?: RollMeta) {
          logRoll({
            campaignId,
            characterId: null,
            characterName: adv.name,
            label,
            pool: (pool ?? {}) as Parameters<typeof logRoll>[0]['pool'],
            result,
            isDM: true,
            hidden: false,
            meta: { ...meta, alignment },
          })
        }

        return (
          <CombatCheckOverlay
            open={true}
            initialAttackType={attackType}
            onClose={() => setAdvCombatCheck(null)}
            character={adapted.character}
            weapons={adapted.charWeapons}
            charSkills={adapted.charSkills}
            refWeaponMap={adapted.refWeaponMap}
            refSkillMap={adapted.refSkillMap}
            refWeaponQualityMap={{}}
            skillModifiers={{}}
            campaignId={campaignId}
            characterId={adv.instanceId}
            onRoll={handleAdvRoll}
            isGmMode={true}
            gmTargets={gmTargets}
            gmAlignment={alignment}
          />
        )
      })()}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  )
}

// Suppress unused warning — these are used by the sort import
void sortInitiative
