'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchAdversaries, adversaryToInstance } from '@/lib/adversaries'
import type { Adversary, AdversaryInstance } from '@/lib/adversaries'
import { sortInitiative, advanceInitiative } from '@/lib/combat'
import { randomUUID } from '@/lib/utils'
import type { InitiativeSlot, LogEntry, CombatEncounter } from '@/lib/combat'
import { InitiativeSetupModal } from './InitiativeSetupModal'
import type { Character } from '@/lib/types'
import { FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4, FS_H3 } from '@/components/player-hud/design-tokens'

// ── Design Tokens ──
const BG = '#060D09'
const PANEL_BG = 'rgba(8,16,10,0.88)'
const RAISED_BG = 'rgba(14,26,18,0.9)'
const INPUT_BG = 'rgba(6,13,9,0.7)'
const GOLD = '#C8AA50'
const BORDER = 'rgba(200,170,80,0.18)'
const BORDER_MD = 'rgba(200,170,80,0.32)'
const CHAR_BR = '#e05252'
const CHAR_AG = '#52a8e0'
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
  const [showInitModal, setShowInitModal] = useState(false)
  const [openCards, setOpenCards] = useState<Set<string>>(new Set())
  const [logInput, setLogInput] = useState('')
  const [logDmOnly, setLogDmOnly] = useState(false)

  // Weapon reference lookup: name (lowercase) → stats
  const [weaponRef, setWeaponRef] = useState<Record<string, { damage: number; damage_add: number | null; range_value: string | null }>>({})

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
        const map: Record<string, { damage: number; damage_add: number | null; range_value: string | null }> = {}
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

  // Filtered library
  const filteredLib = library.filter(a => {
    const matchType = libTypeFilter === 'all' || a.type === libTypeFilter
    const matchSearch = a.name.toLowerCase().includes(libSearch.toLowerCase())
    return matchType && matchSearch
  })

  // Add adversary to live encounter (combat already running)
  const addToActiveCombat = async (adv: Adversary) => {
    if (!encounter) return
    const size = groupSizes[adv.id] ?? (adv.type === 'minion' ? 4 : 1)
    const instance = adversaryToInstance(adv, size)
    const nextOrder = (encounter.initiative_slots.length ?? 0) + 1
    const newSlot: InitiativeSlot = {
      id: randomUUID(),
      type: 'npc',
      order: nextOrder,
      name: adv.name,
      acted: false,
      current: false,
      successes: 0,
      advantages: 0,
      adversaryInstanceId: instance.instanceId,
    }
    await saveEncounter({
      adversaries: [...encounter.adversaries, instance],
      initiative_slots: [...encounter.initiative_slots, newSlot],
    })
  }

  // Add adversary to roster (pre-combat) or directly to live encounter
  const addToRoster = (adv: Adversary) => {
    if (encounter) {
      void addToActiveCombat(adv)
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

  // Mark current slot acted
  const handleMarkActed = async () => {
    if (!encounter) return
    const result = advanceInitiative(
      encounter.initiative_slots, encounter.current_slot_index, encounter.round
    )
    await saveEncounter({
      initiative_slots: result.slots,
      current_slot_index: result.currentIndex,
      round: result.round,
    })
  }

  // Add log entry
  const handleAddLog = async () => {
    if (!logInput.trim() || !encounter) return
    const currentSlot = encounter.initiative_slots[encounter.current_slot_index]
    const entry: LogEntry = {
      id: randomUUID(),
      round: encounter.round,
      slot: encounter.current_slot_index + 1,
      actor: currentSlot?.name ?? 'Unknown',
      text: logInput.trim(),
      dmOnly: logDmOnly,
      timestamp: new Date().toISOString(),
    }
    await saveEncounter({ log_entries: [entry, ...(encounter.log_entries ?? [])] })
    setLogInput('')
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
              <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_SEC, marginBottom: 6 }}>
                Soak {adv.soak} · WT {adv.wound} · Def {Array.isArray(adv.defense) ? adv.defense.join('/') : '0/0'}
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
          <SectionLabel>Current Encounter</SectionLabel>
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
          {currentSlot && (
            <div style={{
              flex: 1, background: `${CHAR_AG}15`, border: `1px solid ${CHAR_AG}50`,
              borderRadius: 4, padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: CHAR_AG,
                boxShadow: `0 0 8px ${CHAR_AG}`, flexShrink: 0,
                animation: 'pulse-dot 1.4s ease-in-out infinite',
              }} />
              <span style={{ fontFamily: FC, fontSize: FS_LABEL, color: CHAR_AG, fontWeight: 600 }}>
                Acting Now: {currentSlot.name}
              </span>
              <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginLeft: 4 }}>
                {currentSlot.type === 'pc' ? 'PC SLOT' : 'NPC SLOT'}
              </span>
            </div>
          )}
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
            const assignedAdv = slot.adversaryInstanceId
              ? encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
              : null
            const isMinion = assignedAdv?.type === 'minion'
            const isKilledNPC = !isMinion && assignedAdv
              ? (assignedAdv.woundsCurrent ?? 0) >= (assignedAdv.woundThreshold ?? 99)
              : false
            const pcChar = !isNPC ? characters.find(ch => ch.id === slot.characterId) : null
            const pcWT = pcChar?.wound_threshold ?? 0
            const pcWounds = slot.woundsCurrent ?? pcChar?.wound_current ?? 0
            const pcCrit = !isNPC && pcWT > 0 && pcWounds >= pcWT
            const accentColor = isKilledNPC ? CHAR_BR : isNPC ? CHAR_BR : CHAR_AG

            return (
              <div
                key={slot.id}
                style={{
                  background: isKilledNPC ? `${CHAR_BR}08` : isCurrent ? `${CHAR_AG}0a` : PANEL_BG,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: 6,
                  position: 'relative',
                  border: `1px solid ${isKilledNPC ? `${CHAR_BR}40` : isCurrent ? `${CHAR_AG}80` : BORDER}`,
                  borderLeft: `3px solid ${accentColor}`,
                  opacity: isKilledNPC ? 0.55 : isActed ? 0.45 : 1,
                  padding: '8px 12px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: '.2s',
                  boxShadow: isCurrent ? `0 0 12px ${CHAR_AG}30` : 'none',
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

                  {/* Row 1: name + badge + NPC selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: isCurrent ? TEXT : TEXT_SEC }}>
                      {slot.name}
                    </span>
                    <TypeBadge type={slot.type} />
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

                  {/* Row 2: stat line */}
                  {!isNPC && (
                    <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXTGR, marginTop: 2 }}>
                      {encounter.initiative_type === 'vigilance' ? 'VIG' : 'COOL'} · {slot.successes}s {slot.advantages}a
                    </div>
                  )}
                  {isNPC && assignedAdv && (
                    <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXTGR, marginTop: 2 }}>
                      Soak {assignedAdv.soak} · WT {assignedAdv.woundThreshold} · Def {assignedAdv.defense.melee}/{assignedAdv.defense.ranged}
                    </div>
                  )}

                  {/* Row 3: minion wound chips (only for minions — inline per-unit trackers) */}
                  {isNPC && assignedAdv && isMinion && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 5 }}>
                      {Array.from({ length: assignedAdv.groupSize }).map((_, mi) => {
                        const mw = (assignedAdv.minionWounds ?? [])[mi] ?? 0
                        const isDead = mw >= assignedAdv.woundThreshold
                        return (
                          <div key={mi} style={{
                            background: isDead ? `${CHAR_BR}20` : RAISED_BG,
                            border: `1px solid ${isDead ? `${CHAR_BR}50` : BORDER}`,
                            borderRadius: 3, padding: '2px 5px',
                            display: 'flex', alignItems: 'center', gap: 2,
                            opacity: isDead ? 0.65 : 1,
                          }}>
                            <span style={{ fontFamily: FM, fontSize: FS_LABEL, color: isDead ? CHAR_BR : TEXT_MUTED }}>#{mi + 1}</span>
                            {isDead ? (
                              <span style={{ fontFamily: FC, fontSize: FS_LABEL, color: CHAR_BR }}>☠</span>
                            ) : (
                              <>
                                <button onClick={() => updateMinionWound(assignedAdv.instanceId, mi, -1)} style={{ ...smallCtrlBtn, width: 13, height: 13, fontSize: 8 }}>−</button>
                                <span style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: mw > 0 ? CHAR_BR : TEXT_SEC, minWidth: 22, textAlign: 'center' }}>
                                  {mw}/{assignedAdv.woundThreshold}
                                </span>
                                <button onClick={() => updateMinionWound(assignedAdv.instanceId, mi, 1)} style={{ ...smallCtrlBtn, width: 13, height: 13, fontSize: 8 }}>+</button>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ── Col 3: Wound block (non-minions only) ── */}
                {!isMinion && (
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {/* PC: crit state or tracker */}
                    {!isNPC && pcWT > 0 && (
                      pcCrit ? (
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
                      )
                    )}
                    {/* NPC rival/nemesis: killed state or tracker */}
                    {isNPC && assignedAdv && (
                      isKilledNPC ? (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          background: `${CHAR_BR}20`, border: `1px solid ${CHAR_BR}70`,
                          borderRadius: 4, padding: '3px 7px',
                        }}>
                          <span style={{ fontSize: 11 }}>☠</span>
                          <span style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: CHAR_BR, letterSpacing: '0.06em' }}>KILLED</span>
                          <button
                            onClick={() => updateNPCWound(assignedAdv.instanceId, -(assignedAdv.woundsCurrent ?? 0))}
                            style={{ ...smallCtrlBtn, fontSize: 9 }} title="Reset"
                          >↺</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => updateNPCWound(assignedAdv.instanceId, -1)} style={smallCtrlBtn}>−</button>
                          <span style={{
                            fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700,
                            color: (assignedAdv.woundsCurrent ?? 0) > 0 ? CHAR_BR : TEXT_MUTED,
                            minWidth: 34, textAlign: 'center',
                            background: `${CHAR_BR}10`, border: `1px solid ${CHAR_BR}30`,
                            borderRadius: 3, padding: '2px 4px',
                          }}>
                            {assignedAdv.woundsCurrent ?? 0}/{assignedAdv.woundThreshold}
                          </span>
                          <button onClick={() => updateNPCWound(assignedAdv.instanceId, 1)} style={smallCtrlBtn}>+</button>
                        </>
                      )
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

        {/* ── Combat Log strip ── */}
        <div style={{
          flexShrink: 0, borderTop: `1px solid ${BORDER}`,
          background: RAISED_BG, maxHeight: 150, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '6px 14px 0', flexShrink: 0 }}>
            <SectionLabel>Combat Log</SectionLabel>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {(!encounter?.log_entries || encounter.log_entries.length === 0) && (
              <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT_MUTED, fontStyle: 'italic' }}>No log entries yet</div>
            )}
            {encounter?.log_entries?.map(entry => (
              <div key={entry.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, flexShrink: 0 }}>
                  R{entry.round}·S{entry.slot}
                </span>
                <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: GOLD, flexShrink: 0, minWidth: 80 }}>{entry.actor}</span>
                <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT_SEC, flex: 1 }}>{entry.text}</span>
                {entry.dmOnly && (
                  <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: CHAR_BR, border: `1px solid ${CHAR_BR}40`, borderRadius: 2, padding: '0 4px', flexShrink: 0 }}>DM</span>
                )}
              </div>
            ))}
          </div>
          {/* Log input */}
          {isDm && (
            <div style={{ padding: '6px 14px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 6, flexShrink: 0 }}>
              <input
                value={logInput}
                onChange={e => setLogInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddLog() }}
                placeholder="Log an action…"
                style={{
                  flex: 1, background: INPUT_BG, border: `1px solid ${BORDER}`,
                  borderRadius: 3, padding: '4px 8px', color: TEXT,
                  fontFamily: FR, fontSize: FS_CAPTION, outline: 'none',
                }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, cursor: 'pointer' }}>
                <input type="checkbox" checked={logDmOnly} onChange={e => setLogDmOnly(e.target.checked)} style={{ accentColor: CHAR_BR }} />
                DM
              </label>
              <button onClick={handleAddLog} style={{ ...ghostBtn, fontSize: FS_OVERLINE, padding: '4px 10px' }}>Log</button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ RIGHT: ADVERSARY DETAIL CARDS ══════════ */}
      <div style={{
        width: 350, flexShrink: 0, borderLeft: `1px solid ${BORDER}`,
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

          return (
            <div key={adv.instanceId} style={{
              background: PANEL_BG,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 6,
              position: 'relative',
              borderTop: `2px solid ${CHAR_BR}80`,
              borderRight: `1px solid ${BORDER}`,
              borderBottom: `1px solid ${BORDER}`,
              borderLeft: `1px solid ${BORDER}`,
            }}>
              {/* Header */}
              <div
                style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                onClick={toggleOpen}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{adv.name}</span>
                    <TypeBadge type={adv.type} />
                    {adv.type === 'minion' && (
                      <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: CHAR_BR }}>
                        {adv.groupRemaining}/{adv.groupSize}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ color: TEXT_MUTED, fontSize: FS_SM }}>{isOpen ? '▲' : '▼'}</span>
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

                  {/* Minion group counter */}
                  {adv.type === 'minion' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED }}>Group remaining:</span>
                      <button onClick={() => updateGroupRemaining(adv.instanceId, -1)} style={smallCtrlBtn}>−</button>
                      <span style={{ fontFamily: FC, fontSize: FS_SM, color: CHAR_BR, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{adv.groupRemaining}</span>
                      <button onClick={() => updateGroupRemaining(adv.instanceId, 1)} style={smallCtrlBtn}>+</button>
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
                          return (
                            <span key={i} style={{
                              fontFamily: FM, fontSize: FS_OVERLINE, color,
                              background: `${color}15`, border: `1px solid ${color}40`,
                              borderRadius: 3, padding: '2px 6px',
                            }} title={t.description}>
                              {t.name}
                            </span>
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
                          {ab.description && <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT_SEC }}>{ab.description}</span>}
                        </div>
                      )) : (
                        <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT_MUTED, fontStyle: 'italic' }}>
                          No special abilities
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Weapons */}
                  {adv.weapons && adv.weapons.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${GOLD}90`, marginBottom: 5 }}>Weapons</div>
                      {adv.weapons.map((w, i) => (
                        <div key={i} style={{ fontFamily: FM, fontSize: FS_LABEL, fontWeight: 500, color: TEXTGR, marginBottom: 2 }}>
                          {(() => {
                            const ref = weaponRef[w.name.toLowerCase()]
                            const dmg = (w.damage !== 0 && w.damage !== undefined)
                              ? w.damage
                              : ref?.damage_add
                                ? `Br+${ref.damage_add}`
                                : (ref?.damage ?? 0)
                            const rng = (w.range && w.range !== 'Engaged')
                              ? w.range
                              : (ref?.range_value ?? 'Engaged')
                            const quals = w.qualities && w.qualities.length > 0 ? ` — ${w.qualities.join(', ')}` : ''
                            return `${w.name} — DMG ${dmg} — ${rng}${quals}`
                          })()}
                        </div>
                      ))}
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
            // Upsert encounter to Supabase
            const { data } = await supabase
              .from('combat_encounters')
              .upsert({ ...encounterData, campaign_id: campaignId })
              .select()
              .single()
            if (data) setEncounter(data as CombatEncounter)
            setShowInitModal(false)
          }}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}

// Suppress unused warning — these are used by the sort import
void sortInitiative
