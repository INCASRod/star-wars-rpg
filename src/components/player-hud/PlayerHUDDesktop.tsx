'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCharacterData } from '@/hooks/useCharacterData'
import { LoreContent } from '@/components/character/LoreContent'
import { TalentTree, type TalentTreeNode, type TalentTreeConnection } from '@/components/character/TalentTree'
import { ForcePowerTree, type ForceTreeNode, type ForceTreeConnection } from '@/components/character/ForcePowerTree'
import {
  C, CHAR_COLOR, CHAR_ABBR3, CHAR_REF_MAP,
  FONT_CINZEL, FONT_RAJDHANI, panelBase,
  FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4, FS_H3,
  type CharKey,
} from './design-tokens'
import { rollPool, getSkillPool, type RollResult } from './dice-engine'
import { CharacterAvatar } from './CharacterAvatar'
import { DiceModal } from './DiceModal'
import { SkillsPanel, type HudSkill } from './SkillsPanel'
import { TalentsPanel, type HudTalent } from './TalentsPanel'
import { InventoryPanel, type WpnDisplay, type ArmDisplay, type GearRow } from './InventoryPanel'
import { ForcePanel, type ForcePowerSummary } from './ForcePanel'
import { ForceRollModal } from './ForceRollModal'
import { rollForceDice, type ForceRollResult } from './dice-engine'
import { DiceRoller, type QuickRollSkill, type QuickWeapon } from './DiceRoller'
import { CombatTransition } from './CombatTransition'
import { RollFeedPanel, RollFeedMini } from './RollFeedPanel'
import { RANGE_LABELS, ACTIVATION_LABELS, type Character, type CharacterSpecialization, type RefSpecialization } from '@/lib/types'
import { parseOggDudeMarkup } from '@/lib/oggdude-markup'
import { EquipmentImage } from '@/components/ui/EquipmentImage'
import { HolocronLoader } from '@/components/ui/HolocronLoader'
import { useSessionMode } from '@/hooks/useSessionMode'
import { useRollFeed } from '@/hooks/useRollFeed'
import { logRoll } from '@/lib/logRoll'
import { DerivedStatsPanel } from '@/components/wireframe/DerivedStatsPanel'
import { TalentsPanel as WfTalentsPanel } from '@/components/wireframe/TalentsPanel'
import { DiceFeed as WfDiceFeed } from '@/components/wireframe/DiceFeed'
import { CombatTracker } from '@/components/player/CombatTracker'
import { InitiativeRollModal } from './InitiativeRollModal'

const CHAR_TO_FIELD: Record<string, keyof Character> = {
  BR: 'brawn', AG: 'agility', INT: 'intellect', CUN: 'cunning', WIL: 'willpower', PR: 'presence',
}

interface PlayerHUDDesktopProps {
  characterId: string
  isGmMode?:   boolean
  campaignId?: string | null
}

// ── Corner brackets decoration ──────────────────────────────
function CornerBrackets({ color = C.gold, size = 6 }: { color?: string; size?: number }) {
  const s: React.CSSProperties = { position: 'absolute', width: size, height: size }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </>
  )
}

// ── Background scanline / hex grid / glows ──────────────────
function BackgroundEffects() {
  const hexSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="52"><polygon points="30,1 59,16 59,36 30,51 1,36 1,16" fill="none" stroke="#C8AA50" stroke-width="0.5"/></svg>`
  )
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent 2px, rgba(0,0,0,0.025) 4px)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.03, backgroundImage: `url("data:image/svg+xml,${hexSvg}")` }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '40%', zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 0% 0%, rgba(78,200,122,0.04) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40%', height: '40%', zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 100% 100%, rgba(200,170,80,0.06) 0%, transparent 70%)' }} />
    </>
  )
}

// ── Compact vital bar for top bar ───────────────────────────
function CompactVital({ label, current, threshold, color }: { label: string; current: number; threshold: number; color: string }) {
  const pct = threshold > 0 ? Math.min((current / threshold) * 100, 100) : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, color: C.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_OVERLINE, color }}>{current}/{threshold}</span>
      </div>
      <div style={{ height: 5, background: C.textFaint, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .3s' }} />
      </div>
    </div>
  )
}

// ── Full vital bar for left column ──────────────────────────
function VitalBar({ label, current, threshold, color, onInc, onDec }: {
  label: string; current: number; threshold: number; color: string
  onInc?: () => void; onDec?: () => void
}) {
  const pct = threshold > 0 ? Math.min((current / threshold) * 100, 100) : 0
  const overLimit = current >= threshold
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textDim }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {onDec && <button onClick={onDec} style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, width: 16, height: 16, cursor: 'pointer', color: C.textDim, fontSize: FS_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>}
          <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, color: overLimit ? '#E05050' : color, fontWeight: 700 }}>{current}/{threshold}</span>
          {onInc && <button onClick={onInc} style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, width: 16, height: 16, cursor: 'pointer', color: C.textDim, fontSize: FS_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>}
        </div>
      </div>
      <div style={{ height: 6, background: C.textFaint, borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 3, transition: 'width .3s' }} />
      </div>
      {/* Pip row — max 10 per row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {Array.from({ length: threshold }).map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: 2,
            background: i < current ? color : 'transparent',
            border: `1px solid ${i < current ? color : C.textFaint}`,
            transition: '.15s',
          }} />
        ))}
      </div>
    </div>
  )
}

// ── Characteristic square ────────────────────────────────────
function CharStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: 6, flexShrink: 0,
      background: `${color}18`, border: `1px solid ${color}44`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 12px ${color}18`,
    }}>
      <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H3, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, color: `${color}BB`, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
    </div>
  )
}

// ── Section label ────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700,
      letterSpacing: '0.15em', textTransform: 'uppercase',
      color: C.textDim, marginBottom: 8, paddingBottom: 4,
      borderBottom: `1px solid ${C.border}`,
    }}>
      {text}
    </div>
  )
}

// ── Tab component ────────────────────────────────────────────
type TabName = 'Skills' | 'Talents' | 'Inventory' | 'Force' | 'Lore' | 'Feed' | 'Combat'

function TabBar({ active, onChange, hasCombat }: { active: TabName; onChange: (t: TabName) => void; hasCombat?: boolean }) {
  const tabs: TabName[] = ['Skills', 'Talents', 'Inventory', 'Force', 'Lore', 'Feed', 'Combat']
  return (
    <div style={{
      display: 'flex', borderBottom: `1px solid ${C.border}`,
      paddingLeft: 16, gap: 2, flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const isCombatTab = tab === 'Combat'
        const isFeed      = tab === 'Feed'
        const tabColor    = (isCombatTab || (isFeed && hasCombat)) ? '#E05050' : C.gold
        const dimColor    = isCombatTab && hasCombat ? '#E0505088' : isFeed && hasCombat ? '#E0505088' : C.textDim
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              background: 'transparent', border: 'none', borderBottom: `2px solid ${active === tab ? tabColor : 'transparent'}`,
              padding: '10px 14px', cursor: 'pointer',
              fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 600, letterSpacing: '0.08em',
              color: active === tab ? tabColor : dimColor,
              transition: '.15s', marginBottom: -1,
            }}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}

// ── BuySpecButton ─────────────────────────────────────────────
function BuySpecButton({
  character, charSpecs, refSpecs, refSpecMap, onBuy,
}: {
  character: Character
  charSpecs: CharacterSpecialization[]
  refSpecs: RefSpecialization[]
  refSpecMap: Record<string, RefSpecialization>
  onBuy: (specKey: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ownedKeys = new Set(charSpecs.map(s => s.specialization_key))
  const available = refSpecs
    .filter(s => !ownedKeys.has(s.key) && s.talent_tree?.rows?.length)
    .sort((a, b) => {
      const ac = a.career_key === character.career_key ? 0 : 1
      const bc = b.career_key === character.career_key ? 0 : 1
      return ac !== bc ? ac - bc : a.name.localeCompare(b.name)
    })
  const filtered = search
    ? available.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : available

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'rgba(200,170,80,0.06)',
          border: `1px dashed ${C.gold}55`,
          borderRadius: 4,
          padding: '5px 12px',
          cursor: 'pointer',
          fontFamily: FONT_RAJDHANI,
          fontSize: FS_LABEL,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: `${C.gold}88`,
          transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = `${C.gold}99`
          el.style.color = C.gold
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = `${C.gold}55`
          el.style.color = `${C.gold}88`
        }}
      >
        + NEW SPEC
      </button>
    )
  }

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          ...panelBase,
          background: 'rgba(6,13,9,0.98)',
          border: `1px solid ${C.gold}40`,
          boxShadow: `0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px ${C.gold}15`,
          borderRadius: 6,
          padding: '20px 20px 16px',
          width: '100%', maxWidth: 480,
          maxHeight: '80vh',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: C.gold,
          }}>
            Buy New Specialization
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: FONT_RAJDHANI, fontSize: FS_H4, color: C.textDim,
              lineHeight: 1, padding: '0 4px',
            }}
          >×</button>
        </div>

        {/* XP info */}
        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim,
          lineHeight: 1.5,
          background: 'rgba(200,170,80,0.06)', border: `1px solid ${C.border}`,
          borderRadius: 4, padding: '8px 10px',
        }}>
          Career specs cost{' '}
          <span style={{ color: C.gold, fontWeight: 700 }}>{charSpecs.length * 10} XP</span>
          {' '}· Non-career costs{' '}
          <span style={{ color: C.gold, fontWeight: 700 }}>{(charSpecs.length + 1) * 10} XP</span>
          {' '}· Available:{' '}
          <span style={{ color: '#4EC87A', fontWeight: 700 }}>{character.xp_available} XP</span>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search specializations…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '7px 10px',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
            color: C.text,
            outline: 'none',
          }}
        />

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map(spec => {
            const isCareer = spec.career_key === character.career_key
            const cost = isCareer ? charSpecs.length * 10 : (charSpecs.length + 1) * 10
            const canAfford = character.xp_available >= cost
            return (
              <button
                key={spec.key}
                onClick={() => { onBuy(spec.key); setOpen(false) }}
                disabled={!canAfford}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: isCareer ? 'rgba(200,170,80,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isCareer ? `${C.gold}30` : C.border}`,
                  borderRadius: 4,
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  opacity: canAfford ? 1 : 0.4,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!canAfford) return
                  const el = e.currentTarget as HTMLElement
                  el.style.background = isCareer ? 'rgba(200,170,80,0.12)' : 'rgba(255,255,255,0.05)'
                  el.style.borderColor = isCareer ? `${C.gold}55` : `${C.gold}25`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = isCareer ? 'rgba(200,170,80,0.06)' : 'rgba(255,255,255,0.02)'
                  el.style.borderColor = isCareer ? `${C.gold}30` : C.border
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700,
                    color: canAfford ? C.text : C.textDim,
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {spec.name}
                  </div>
                  <div style={{
                    fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
                    color: isCareer ? C.gold : C.textFaint,
                    textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2,
                  }}>
                    {isCareer ? '★ Career' : spec.career_key}
                  </div>
                </div>
                <div style={{
                  fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
                  color: canAfford ? C.gold : '#E05050',
                  whiteSpace: 'nowrap', marginLeft: 12, flexShrink: 0,
                }}>
                  {cost} XP
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '24px 0',
              fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textFaint,
            }}>
              No specializations found.
            </div>
          )}
        </div>

        {/* Cancel */}
        <button
          onClick={() => setOpen(false)}
          style={{
            background: 'transparent',
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            padding: '7px',
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: C.textDim, cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = '#E05050'
            el.style.color = '#E05050'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = C.border
            el.style.color = C.textDim
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export function PlayerHUDDesktop({ characterId, isGmMode = false, campaignId }: PlayerHUDDesktopProps) {
  const router = useRouter()

  // ── Data ──
  const {
    character, skills, talents, weapons, armor, gear, crits, charSpecs,
    charForceAbilities, playerName, loading, error,
    refSkills, refCareers, refSpeciesAll, refForcePowers, refForceAbilities,
    refSkillMap, refTalentMap, refWeaponMap, refArmorMap, refGearMap,
    refSpecMap, refDescriptorMap, refForcePowerMap, refForceAbilityMap,
    forceRating, supabase, refSpecs,
    handleVitalChange, handleToggleWeaponEquipped, handleToggleEquippedById,
    handleRollCrit, handleHealCrit, handlePortraitUpload, handlePortraitDelete,
    handleCharacteristicChange, handleSoakChange, handleDefenseChange,
    handleMoralityChange, handleMoralityKeyChange, handleObligationChange, handleDutyChange,
    handleRemoveWeapon, handleRemoveEquipment, handleRemoveTalent, handleReduceSkill,
    handlePurchaseTalent, handleBackstoryChange, handleNotesChange,
    handlePurchaseForceAbility, handleBuySpecialization, handleBuySkill,
  } = useCharacterData(characterId)

  // ── Session / roll feed ──
  const effectiveCampaignId = campaignId ?? character?.campaign_id ?? null
  const effectiveCampaignIdRef = useRef(effectiveCampaignId)
  useEffect(() => { effectiveCampaignIdRef.current = effectiveCampaignId }, [effectiveCampaignId])

  // ── Auto-release session on tab/browser close ──────────────────────────────
  useEffect(() => {
    const handlePageHide = () => {
      const key = typeof window !== 'undefined' ? localStorage.getItem('holocron_session_key') : null
      const cid = effectiveCampaignIdRef.current
      if (!key || !cid) return
      navigator.sendBeacon('/api/release-session', new Blob(
        [JSON.stringify({ session_key: key, campaign_id: cid })],
        { type: 'application/json' },
      ))
    }
    window.addEventListener('pagehide', handlePageHide)
    return () => window.removeEventListener('pagehide', handlePageHide)
  }, [])
  const { mode: dbMode, round: dbRound, transitionPending: dbTransitionPending, prevMode: dbPrevMode } = useSessionMode(effectiveCampaignId)
  // Broadcast override — GM pushes combat state directly for instant delivery
  const [broadcastSession, setBroadcastSession] = useState<{ mode: 'combat' | 'exploration'; round: number } | null>(null)
  const [broadcastTransition, setBroadcastTransition] = useState<{ pending: boolean; prevMode: 'combat' | 'exploration' | null }>({ pending: false, prevMode: null })
  const sessionMode = broadcastSession?.mode ?? dbMode
  const combatRound = broadcastSession?.round ?? dbRound
  const transitionPending = broadcastTransition.pending || dbTransitionPending
  const prevMode = broadcastTransition.prevMode ?? dbPrevMode
  const sessionModeRef = useRef<'combat' | 'exploration'>('exploration')
  sessionModeRef.current = sessionMode
  const rolls = useRollFeed(effectiveCampaignId)
  const isCombat = sessionMode === 'combat'

  // ── UI State ──
  const TAB_KEY = `holocron:char-tab:${characterId}`
  const [activeTab, setActiveTab] = useState<TabName>(() => {
    if (typeof window === 'undefined') return 'Skills'
    const saved = window.localStorage.getItem(TAB_KEY)
    const valid: TabName[] = ['Skills', 'Talents', 'Inventory', 'Force', 'Lore', 'Feed', 'Combat']
    return valid.includes(saved as TabName) ? (saved as TabName) : 'Skills'
  })
  const [rollResult, setRollResult]             = useState<RollResult | null>(null)
  const [rollLabel, setRollLabel]               = useState<string | undefined>()
  const [showTalentTree, setShowTalentTree]     = useState(false)
  const [activeSpecKey, setActiveSpecKey]       = useState<string | null>(null)
  const [showForceTree, setShowForceTree]       = useState(false)
  const [activePowerKey, setActivePowerKey]     = useState<string | null>(null)
  const [gmDialog, setGmDialog]                 = useState<string | null>(null)
  const [lootReveal, setLootReveal]             = useState<Record<string, unknown> | null>(null)
  const [initRoll, setInitRoll]                 = useState<{ type: 'cool' | 'vigilance'; campaignId: string } | null>(null)
  const [forceRollResult, setForceRollResult]   = useState<ForceRollResult | null>(null)

  // ── Destiny Pool ──
  const [destinyPool, setDestinyPool]           = useState<Array<'light' | 'dark'>>([])
  const [pendingSpend, setPendingSpend]         = useState<number | null>(null)
  const pendingTimer                            = useRef<ReturnType<typeof setTimeout> | null>(null)
  const destinyChannelRef                       = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Load pool on mount
  useEffect(() => {
    if (!effectiveCampaignId) return
    supabase.from('campaigns').select('settings').eq('id', effectiveCampaignId).single()
      .then(({ data }) => {
        const pool = (data?.settings as Record<string, unknown> | null)?.destiny_pool
        if (Array.isArray(pool)) setDestinyPool(pool as Array<'light' | 'dark'>)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCampaignId])

  // postgres_changes — pool syncs when GM or another player updates it
  useEffect(() => {
    if (!effectiveCampaignId) return
    const ch = supabase
      .channel(`destiny-db-${effectiveCampaignId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'campaigns', filter: `id=eq.${effectiveCampaignId}` },
        (payload) => {
          const pool = (payload.new.settings as Record<string, unknown> | null)?.destiny_pool
          if (Array.isArray(pool)) setDestinyPool(pool as Array<'light' | 'dark'>)
        })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCampaignId])

  // Campaign events — spend notifications from other players
  useEffect(() => {
    if (!effectiveCampaignId) return
    const ch = supabase
      .channel(`campaign-events-${effectiveCampaignId}`)
      .on('broadcast', { event: 'destiny-spent' }, ({ payload }: { payload: Record<string, unknown> }) => {
        if (payload.characterId === characterId) return // own spend, skip
        const who   = payload.characterName as string
        const side  = payload.tokenType === 'light' ? '○ Light' : '● Dark'
        import('sonner').then(m => m.toast.info(`${who} spent a ${side} Side destiny point`))
      })
      .subscribe()
    destinyChannelRef.current = ch
    return () => { supabase.removeChannel(ch); destinyChannelRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCampaignId, characterId])

  const handleSpendDestiny = useCallback(async (idx: number) => {
    const cid = effectiveCampaignIdRef.current
    if (!cid || !character) return

    // Two-tap confirm: first tap highlights, second tap within 2s confirms
    if (pendingSpend !== idx) {
      setPendingSpend(idx)
      if (pendingTimer.current) clearTimeout(pendingTimer.current)
      pendingTimer.current = setTimeout(() => setPendingSpend(null), 2000)
      return
    }
    // Confirmed
    if (pendingTimer.current) clearTimeout(pendingTimer.current)
    setPendingSpend(null)

    const token   = destinyPool[idx]
    const newPool = destinyPool.map((t, i) =>
      i === idx ? (t === 'light' ? 'dark' : 'light') : t
    ) as Array<'light' | 'dark'>

    setDestinyPool(newPool)

    // Persist
    const { data: camp } = await supabase.from('campaigns').select('settings').eq('id', cid).single()
    const settings = ((camp?.settings as Record<string, unknown>) ?? {})
    await supabase.from('campaigns').update({ settings: { ...settings, destiny_pool: newPool } }).eq('id', cid)

    // Notify other players
    destinyChannelRef.current?.send({
      type: 'broadcast', event: 'destiny-spent',
      payload: { characterId: character.id, characterName: character.name, tokenType: token },
    })

    const side = token === 'light' ? '○ Light' : '● Dark'
    import('sonner').then(m => m.toast.success(`Spent a ${side} Side destiny point`))
  }, [destinyPool, character, supabase, pendingSpend])

  // ── GM Broadcast listener ──
  useEffect(() => {
    const channel = supabase
      .channel(`gm-notify-${characterId}`)
      .on('broadcast', { event: 'gm-action' }, ({ payload }: { payload: Record<string, unknown> }) => {
        if (payload.type === 'toast') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          import('sonner').then(m => m.toast(payload.message as any))
        } else if (payload.type === 'combat-state') {
          const newMode = payload.mode as 'combat' | 'exploration'
          const newRound = payload.round as number
          const curMode = sessionModeRef.current
          if (newMode !== curMode) {
            setBroadcastTransition({ pending: true, prevMode: curMode })
            setTimeout(() => {
              setBroadcastSession({ mode: newMode, round: newRound })
              setBroadcastTransition({ pending: false, prevMode: null })
            }, 1200)
          } else {
            setBroadcastSession({ mode: newMode, round: newRound })
          }
        } else if (payload.type === 'loot-reveal') {
          setLootReveal(payload.item as Record<string, unknown>)
        } else if (payload.type === 'loot-dismiss') {
          setLootReveal(null)
        } else if (payload.type === 'initiative-request') {
          const cid = effectiveCampaignIdRef.current
          if (cid) setInitRoll({ type: payload.initiativeType as 'cool' | 'vigilance', campaignId: cid })
        } else {
          setGmDialog(payload.message as string)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  // ── Derived: career / spec / species names ──
  const careerName = useMemo(() =>
    refCareers.find(c => c.key === character?.career_key)?.name || character?.career_key || ''
  , [refCareers, character])

  const specNames = useMemo(() =>
    charSpecs.map(cs => refSpecMap[cs.specialization_key]?.name || cs.specialization_key).join(' / ')
  , [charSpecs, refSpecMap])

  const speciesName = useMemo(() =>
    refSpeciesAll.find(s => s.key === character?.species_key)?.name || character?.species_key || ''
  , [refSpeciesAll, character])

  // ── Skills for HUD ──
  const hudSkills = useMemo((): HudSkill[] => {
    if (!character) return []
    const charSkillMap = Object.fromEntries(skills.map(s => [s.skill_key, s]))
    return refSkills.map(rs => {
      const cs = charSkillMap[rs.key]
      const charKey = CHAR_REF_MAP[rs.characteristic_key] as CharKey
      const charVal = (character[CHAR_TO_FIELD[rs.characteristic_key] as keyof Character] as number) || 0
      return {
        key: rs.key, name: rs.name,
        charKey, charVal,
        rank: cs?.rank || 0, isCareer: cs?.is_career || false,
      }
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [character, skills, refSkills])

  // ── Talents for HUD ──
  const hudTalents = useMemo((): HudTalent[] =>
    talents.map(t => {
      const ref = refTalentMap[t.talent_key]
      return {
        key:         t.talent_key,
        name:        ref?.name || t.talent_key,
        rank:        t.ranks,
        activation:  ref ? ACTIVATION_LABELS[ref.activation] || ref.activation : 'Passive',
        description: ref?.description,
      }
    })
  , [talents, refTalentMap])

  // ── Weapons for HUD ──
  const hudWeapons = useMemo((): WpnDisplay[] =>
    weapons.map(w => {
      const ref = w.weapon_key ? refWeaponMap[w.weapon_key] : null
      const isMelee = ['MELEE', 'BRAWL', 'LTSABER'].includes(ref?.skill_key || '')
      const dmg = isMelee
        ? `+${ref?.damage_add || 0}`
        : String(ref?.damage || 0)
      const quals = Array.isArray(ref?.qualities)
        ? ref.qualities.map((q: { key: string; count?: number }) => {
            const d = refDescriptorMap[q.key]
            return q.count ? `${d?.name || q.key} ${q.count}` : (d?.name || q.key)
          })
        : []
      return {
        id:         w.id,
        name:       w.custom_name || ref?.name || w.weapon_key || 'Unknown',
        damage:     dmg,
        crit:       ref?.crit || 0,
        range:      ref?.range_value ? RANGE_LABELS[ref.range_value] || '' : '',
        enc:        ref?.encumbrance || 0,
        hardPoints: ref?.hard_points || 0,
        qualities:  quals,
        equipState: w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying'),
        skillName:  ref?.skill_key ? refSkillMap[ref.skill_key]?.name || '' : '',
      }
    })
  , [weapons, refWeaponMap, refSkillMap, refDescriptorMap])

  // ── Armor for HUD ──
  const hudArmor = useMemo((): ArmDisplay[] =>
    armor.map(a => {
      const ref = a.armor_key ? refArmorMap[a.armor_key] : null
      return {
        id:         a.id,
        name:       a.custom_name || ref?.name || a.armor_key || 'Armor',
        soak:       ref?.soak || 0,
        defense:    ref?.defense || 0,
        enc:        ref?.encumbrance || 0,
        hardPoints: ref?.hard_points || 0,
        rarity:     ref?.rarity || 0,
        equipState: a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying'),
      }
    })
  , [armor, refArmorMap])

  // ── Gear for HUD ──
  const hudGear = useMemo((): GearRow[] =>
    gear.map(g => {
      const ref = g.gear_key ? refGearMap[g.gear_key] : null
      return {
        id:      g.id,
        name:    g.custom_name || ref?.name || g.gear_key || 'Gear',
        qty:        g.quantity,
        enc:        ref?.encumbrance || 0,
        equipState: g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying'),
      }
    })
  , [gear, refGearMap])

  // ── Encumbrance ──
  // equipped  → counts (armor -3 for wearing bonus per FFG rules)
  // carrying  → counts full enc (in backpack/on person)
  // stowed    → 0 (in ship locker / external storage)
  const encumbranceCurrent = useMemo(() => {
    let sum = 0
    for (const a of armor) {
      const state = a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying')
      if (state === 'stowed') continue
      const enc = refArmorMap[a.armor_key]?.encumbrance || 0
      sum += state === 'equipped' ? Math.max(0, enc - 3) : enc
    }
    for (const g of gear) {
      const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying')
      if (state === 'stowed') continue
      sum += refGearMap[g.gear_key]?.encumbrance || 0
    }
    for (const w of weapons) {
      const state = w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying')
      if (state === 'stowed') continue
      sum += refWeaponMap[w.weapon_key]?.encumbrance || 0
    }
    return sum
  }, [armor, gear, weapons, refArmorMap, refGearMap, refWeaponMap])

  // Storage containers (backpacks, modular storage) increase enc threshold when carried/equipped
  const encumbranceBonus = useMemo(() =>
    gear.reduce((s, g) => {
      const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying')
      const ref = refGearMap[g.gear_key]
      return s + (state !== 'stowed' && ref?.encumbrance_bonus ? ref.encumbrance_bonus : 0)
    }, 0)
  , [gear, refGearMap])

  // ── Force powers summary ──
  const allForcePowers = useMemo((): ForcePowerSummary[] => {
    const byPower: Record<string, number> = {}
    for (const a of charForceAbilities) { byPower[a.force_power_key] = (byPower[a.force_power_key] || 0) + 1 }
    return refForcePowers
      .filter(fp => fp.ability_tree?.rows?.length)
      .map(fp => {
        const purchasedCount = byPower[fp.key] || 0
        const totalCount = fp.ability_tree?.rows?.reduce((s: number, r: { costs: number[] }) =>
          s + (r.costs?.filter((c: number) => c > 0).length || 0), 0) || 0
        return { powerKey: fp.key, powerName: fp.name, purchasedCount, totalCount }
      })
      .sort((a, b) => {
        if (a.purchasedCount > 0 && b.purchasedCount === 0) return -1
        if (a.purchasedCount === 0 && b.purchasedCount > 0) return 1
        return a.powerName.localeCompare(b.powerName)
      })
  }, [charForceAbilities, refForcePowers])

  // ── Quick Roll skills (rank > 0) ──
  const quickSkills = useMemo((): QuickRollSkill[] =>
    hudSkills.filter(s => s.rank > 0)
  , [hudSkills])

  // ── Equipped weapon quick-refs ──
  const equippedWeaponQuick = useMemo((): QuickWeapon[] => {
    if (!character) return []
    return weapons.filter(w => w.is_equipped).map(w => {
      const ref   = w.weapon_key ? refWeaponMap[w.weapon_key] : null
      const skill = ref?.skill_key ? refSkillMap[ref.skill_key] : null
      const charKey = skill?.characteristic_key
      const charVal = charKey ? (character[CHAR_TO_FIELD[charKey] as keyof Character] as number) || 0 : 0
      const skillData = charKey ? hudSkills.find(s => s.key === ref?.skill_key) : undefined
      const isMelee = ['MELEE', 'BRAWL', 'LTSABER'].includes(ref?.skill_key || '')
      return {
        id:        w.id,
        name:      w.custom_name || ref?.name || 'Weapon',
        damage:    isMelee ? `+${ref?.damage_add || 0}` : String(ref?.damage || 0),
        crit:      ref?.crit || 0,
        range:     ref?.range_value ? RANGE_LABELS[ref.range_value] || '' : '',
        skillName: skill?.name || '',
        charVal,
        rank:      skillData?.rank || 0,
      }
    })
  }, [weapons, refWeaponMap, refSkillMap, hudSkills, character])

  // ── Talent tree building ──
  function buildTalentTree(specKey: string) {
    const refSpec = refSpecMap[specKey]
    if (!refSpec?.talent_tree?.rows) return null
    const purchasedSet = new Set(talents.filter(t => t.specialization_key === specKey).map(t => `${t.tree_row}-${t.tree_col}`))
    const nodes: TalentTreeNode[] = []
    const connections: TalentTreeConnection[] = []
    for (const row of refSpec.talent_tree.rows) {
      for (let col = 0; col < (row.talents || []).length; col++) {
        const tKey = row.talents[col]
        const ref  = refTalentMap[tKey]
        const isPurchased = purchasedSet.has(`${row.index}-${col}`)
        const dir  = (row.directions || [])[col] || {}
        let canPurchase = false
        if (!isPurchased) {
          if (row.index === 0) canPurchase = true
          else {
            if (dir.up) canPurchase = canPurchase || purchasedSet.has(`${row.index - 1}-${col}`)
            if (dir.left && col > 0) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col - 1}`)
            if (dir.right && col < 3) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col + 1}`)
            if (dir.down) canPurchase = canPurchase || purchasedSet.has(`${row.index + 1}-${col}`)
          }
        }
        nodes.push({ talentKey: tKey, name: ref?.name || tKey, description: ref?.description, row: row.index, col, purchased: isPurchased, activation: ref ? ACTIVATION_LABELS[ref.activation] || ref.activation : 'Passive', isRanked: ref?.is_ranked || false, canPurchase })
        if (dir.right && col < 3) connections.push({ fromRow: row.index, fromCol: col, toRow: row.index, toCol: col + 1 })
        if (dir.down) connections.push({ fromRow: row.index, fromCol: col, toRow: row.index + 1, toCol: col })
      }
    }
    return { specName: refSpec.name, nodes, connections }
  }

  // ── Force power tree building ──
  function buildForcePowerTree(powerKey: string) {
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
        nodes.push({ abilityKey: aKey, name: ref?.name || aKey, description: ref?.description, row: row.index, col, span, cost, purchased: isPurchased, canPurchase })
        if (span > 0) {
          if (dir.right && col < 3) connections.push({ fromRow: row.index, fromCol: col, toRow: row.index, toCol: col + 1 })
          if (dir.down) connections.push({ fromRow: row.index, fromCol: col, toRow: row.index + 1, toCol: col })
        }
      }
    }
    const displayNodes = nodes.filter(n => n.span > 0)
    return { powerName: refPower.name, nodes, connections, purchasedCount: displayNodes.filter(n => n.purchased).length, totalCount: displayNodes.filter(n => n.cost > 0).length }
  }

  const effectiveSpecKey = activeSpecKey || charSpecs[0]?.specialization_key || null
  const talentTreeData = useMemo(() => effectiveSpecKey ? buildTalentTree(effectiveSpecKey) : null, [effectiveSpecKey, charSpecs, refSpecMap, refTalentMap, talents])
  const forcePowerTreeData = useMemo(() => activePowerKey ? buildForcePowerTree(activePowerKey) : null, [activePowerKey, charForceAbilities, refForcePowers, refForcePowerMap, refForceAbilityMap])

  // ── Roll handler ──
  const handleRoll = (result: RollResult, label?: string, pool?: Record<string, number>) => {
    setRollResult(result)
    setRollLabel(label)
    if (character && effectiveCampaignId) {
      logRoll({
        campaignId:    effectiveCampaignId,
        characterId:   character.id,
        characterName: character.name,
        label,
        pool:          (pool || {}) as Parameters<typeof logRoll>[0]['pool'],
        result,
      })
    }
  }

  const handleSkillRoll = (skill: HudSkill) => {
    const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
    const pool = { proficiency, ability, boost: 0, challenge: 0, difficulty: 2, setback: 0 }
    const result = rollPool(pool)
    handleRoll(result, skill.name, pool as Record<string, number>)
  }

  const handleSkillUpgrade = (skill: HudSkill) => {
    handleBuySkill(skill.key, skill.rank, skill.isCareer)
  }

  // ── Loading / Error ──
  if (loading) return <HolocronLoader />
  if (error || !character) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_H4, color: '#E05050' }}>{error || 'Character not found'}</div>
      </div>
    )
  }

  const charVals = {
    brawn:     character.brawn,
    agility:   character.agility,
    intellect: character.intellect,
    cunning:   character.cunning,
    willpower: character.willpower,
    presence:  character.presence,
  }

  const encThreshold = character.encumbrance_threshold + encumbranceBonus
  const hasMorality  = character.morality_value !== undefined && character.morality_value !== null

  // ════════════════════════════
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: C.bg }}>
      <BackgroundEffects />
      <CombatTransition pending={transitionPending} prevMode={prevMode} />

      {/* GM mode overlays */}
      {isGmMode && (
        <>
          <button onClick={() => router.push(`/gm?campaign=${campaignId}`)} style={{ position: 'fixed', top: 8, left: 8, zIndex: 200, background: C.gold, border: 'none', padding: '6px 14px', fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 700, letterSpacing: '0.1em', color: C.bg, cursor: 'pointer' }}>← GM</button>
          <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 200, border: `2px solid ${C.gold}`, padding: '3px 12px', fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.15em', color: C.gold }}>GM MODE</div>
        </>
      )}

      {/* Main 3-column grid */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'clamp(220px, 18vw, 320px) 1fr clamp(260px, 20vw, 360px)',
        gridTemplateRows: 'clamp(48px, 4vh, 64px) 1fr',
        height: '100vh',
      }}>

        {/* ══ TOP BAR ══════════════════════════════════════════ */}
        <div style={{
          gridColumn: '1 / -1',
          background: isCombat ? 'rgba(30,4,4,0.96)' : 'rgba(4,9,6,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: isCombat ? '1px solid rgba(224,80,80,0.35)' : `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', padding: '0 var(--space-3)', gap: 'var(--space-2)',
          zIndex: 10,
          transition: 'background 0.6s, border-color 0.6s',
        }}>
          {/* Logo */}
          <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: C.gold, letterSpacing: '0.15em', whiteSpace: 'nowrap', textShadow: `0 0 12px ${C.gold}60` }}>
            HOLOCRON
          </div>
          <div style={{ width: 1, height: 28, background: C.border }} />
          {/* Character identity */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 0 10px rgba(255,255,255,0.25)' }}>
              {character.name}
            </div>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {[careerName, specNames, speciesName].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: C.border }} />
          {/* Destiny Pool */}
          {destinyPool.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textDim, whiteSpace: 'nowrap' }}>
                Destiny
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {destinyPool.map((token, idx) => {
                  const isPending = pendingSpend === idx
                  const isLight   = token === 'light'
                  return (
                    <button
                      key={idx}
                      title={isPending ? 'Click again to confirm' : `Spend ${isLight ? 'Light' : 'Dark'} Side destiny`}
                      onClick={() => handleSpendDestiny(idx)}
                      style={{
                        width: 20, height: 20, borderRadius: '50%',
                        border: `2px solid ${isPending ? (isLight ? '#FFFFFF' : '#8060C0') : (isLight ? 'rgba(255,255,255,0.5)' : 'rgba(120,80,200,0.5)')}`,
                        background: isLight
                          ? (isPending ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)')
                          : (isPending ? 'rgba(80,40,160,0.7)'   : 'rgba(40,20,80,0.5)'),
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: '.15s',
                        boxShadow: isPending
                          ? (isLight ? '0 0 8px rgba(255,255,255,0.6)' : '0 0 8px rgba(120,80,200,0.7)')
                          : 'none',
                        padding: 0,
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 9, color: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(160,120,255,0.9)', lineHeight: 1 }}>
                        {isLight ? '○' : '●'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <div style={{ width: 1, height: 28, background: C.border }} />
          {/* Resources */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* XP pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(200,170,80,0.1)', border: '1px solid rgba(200,170,80,0.3)',
              borderRadius: 4, padding: '3px 10px',
            }}>
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.gold }}>XP</span>
              <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 700, color: '#FFFFFF' }}>{character.xp_available}</span>
            </div>
            {/* Credits pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(78,200,122,0.1)', border: '1px solid rgba(78,200,122,0.3)',
              borderRadius: 4, padding: '3px 10px',
            }}>
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4EC87A' }}>Credits</span>
              <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 700, color: '#FFFFFF' }}>{character.credits.toLocaleString()}</span>
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: C.border }} />
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
            {playerName}
          </div>
          <button
            onClick={async () => {
              const sessionKey = typeof window !== 'undefined' ? localStorage.getItem('holocron_session_key') : null
              const cid = effectiveCampaignId
              if (sessionKey && cid) {
                await supabase.from('character_sessions').delete()
                  .eq('session_key', sessionKey)
                  .eq('campaign_id', cid)
              }
              router.push('/')
            }}
            style={{
              fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_CAPTION,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: C.textDim, background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
              transition: '.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E05050'; (e.currentTarget as HTMLElement).style.borderColor = '#E05050' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.textDim; (e.currentTarget as HTMLElement).style.borderColor = C.border }}
          >⏻ LOGOUT</button>
          {/* Combat mode badge */}
          {isCombat && (
            <div style={{
              marginLeft: 'auto',
              background: 'rgba(224,80,80,0.18)', border: '1px solid rgba(224,80,80,0.5)',
              borderRadius: 4, padding: '3px 10px',
              fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.18em',
              color: '#E05050', textShadow: '0 0 8px #E05050',
              whiteSpace: 'nowrap',
            }}>
              COMBAT · ROUND {combatRound}
            </div>
          )}
        </div>

        {/* ══ LEFT COLUMN ══════════════════════════════════════ */}
        <div style={{
          background: 'rgba(4,9,6,0.7)',
          borderRight: `1px solid ${C.border}`,
          overflowY: 'auto', overflowX: 'hidden',
          padding: 'var(--space-2) var(--space-2)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
        }}>
          {/* Avatar */}
          <CharacterAvatar
            avatarUrl={character.portrait_url}
            characterName={character.name}
            career={careerName}
            spec={specNames}
            onUpload={handlePortraitUpload}
            onDelete={handlePortraitDelete}
          />

          {/* Characteristics */}
          <div style={{ ...panelBase, padding: 'var(--space-2)' }}>
            <CornerBrackets />
            <SectionLabel text="Characteristics" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {(Object.entries(charVals) as [CharKey, number][]).map(([key, val]) => (
                <CharStat key={key} value={val} label={CHAR_ABBR3[key]} color={CHAR_COLOR[key]} />
              ))}
            </div>
          </div>

          {/* Vitals */}
          <div style={{ ...panelBase, padding: 'var(--space-2) var(--space-2)' }}>
            <CornerBrackets />
            <SectionLabel text="Vitals" />
            <VitalBar
              label="Wounds" current={character.wound_current} threshold={character.wound_threshold} color="#E05050"
              onInc={() => handleVitalChange('wound_current', 1)}
              onDec={() => handleVitalChange('wound_current', -1)}
            />
            <VitalBar
              label="Strain" current={character.strain_current} threshold={character.strain_threshold} color="#60C8E0"
              onInc={() => handleVitalChange('strain_current', 1)}
              onDec={() => handleVitalChange('strain_current', -1)}
            />
          </div>

          {/* Combat Stats */}
          <div style={{ ...panelBase, padding: 'var(--space-2) var(--space-2)' }}>
            <CornerBrackets />
            <SectionLabel text="Combat" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { label: 'Soak',        value: character.soak,           color: '#4EC87A' },
                { label: 'Rng Def',     value: character.defense_ranged,  color: '#5AAAE0' },
                { label: 'Mel Def',     value: character.defense_melee,   color: '#E07855' },
                { label: 'Force',       value: forceRating,               color: '#B070D8' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: `${stat.color}10`, border: `1px solid ${stat.color}30`,
                  borderRadius: 4, padding: '6px 8px', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H3, fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Morality */}
          {hasMorality && (
            <div style={{ ...panelBase, padding: 'var(--space-2) var(--space-2)' }}>
              <CornerBrackets />
              <SectionLabel text="Morality" />
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_H3, fontWeight: 700, color: C.gold }}>{character.morality_value}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, color: '#E05050', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{character.morality_weakness_key || 'Weakness'}</span>
                <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, color: '#5AAAE0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{character.morality_strength_key || 'Strength'}</span>
              </div>
              <div style={{ position: 'relative', height: 8, background: C.textFaint, borderRadius: 4 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${character.morality_value || 50}%`, borderRadius: 4, background: 'linear-gradient(90deg, #E05050, #4EC87A 60%, #5AAAE0)' }} />
                <div style={{ position: 'absolute', top: '50%', left: `${character.morality_value || 50}%`, transform: 'translate(-50%, -50%)', width: 12, height: 12, borderRadius: '50%', background: C.gold, border: `2px solid ${C.bg}`, boxShadow: `0 0 6px ${C.gold}` }} />
              </div>
            </div>
          )}

          {/* Duty / Obligation */}
          {(character.duty_type || character.obligation_type) && (
            <div style={{ ...panelBase, padding: 'var(--space-2) var(--space-2)' }}>
              <CornerBrackets />
              <SectionLabel text="Commitment" />
              <div style={{ display: 'flex', gap: 8 }}>
                {character.duty_type && (
                  <div style={{ flex: 1, background: `${C.gold}10`, border: `1px solid ${C.borderHi}`, borderRadius: 4, padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: C.gold }}>{character.duty_value}</div>
                    <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{character.duty_type}</div>
                  </div>
                )}
                {character.obligation_type && (
                  <div style={{ flex: 1, background: 'rgba(224,120,85,0.10)', border: '1px solid rgba(224,120,85,0.3)', borderRadius: 4, padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: '#E07855' }}>{character.obligation_value}</div>
                    <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{character.obligation_type}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Critical Injuries */}
          <div style={{ ...panelBase, padding: 'var(--space-2) var(--space-2)' }}>
            <CornerBrackets />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <SectionLabel text="Critical Injuries" />
              <button onClick={handleRollCrit} style={{ background: 'rgba(224,80,80,0.15)', border: '1px solid rgba(224,80,80,0.4)', borderRadius: 3, padding: '2px 8px', fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.08em', color: '#E05050', cursor: 'pointer' }}>
                Roll Crit
              </button>
            </div>
            {crits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '12px 0', fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textFaint }}>
                No Active Injuries
              </div>
            ) : (
              crits.map(c => (
                <div key={c.id} style={{ background: 'rgba(224,80,80,0.08)', border: '1px solid rgba(224,80,80,0.25)', borderRadius: 4, padding: '6px 8px', marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 600, color: '#E05050' }}>{c.custom_name || 'Injury'}</div>
                    <button onClick={() => handleHealCrit(c.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: '#4EC87A' }}>Heal</button>
                  </div>
                  {c.description && <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, marginTop: 3, lineHeight: 1.4 }}>{c.description}</div>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ══ CENTER COLUMN ════════════════════════════════════ */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${C.border}`,
          overflow: 'hidden',
        }}>
          <TabBar active={activeTab} onChange={t => { setActiveTab(t); localStorage.setItem(TAB_KEY, t) }} hasCombat={isCombat} />

          <div key={activeTab} style={{
            flex: 1, overflowY: 'auto', padding: 'var(--space-2) var(--space-3)',
            animation: 'hudTabIn 0.2s ease forwards',
          }}>
            {activeTab === 'Skills' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <DerivedStatsPanel
                  character={character}
                  liveTalents={hudTalents}
                  onVitalChange={handleVitalChange}
                  characterName={character.name}
                />
                <SkillsPanel
                  skills={hudSkills}
                  onRoll={handleSkillRoll}
                  onUpgrade={handleSkillUpgrade}
                  isCombat={isCombat}
                  xpAvailable={character.xp_available}
                />
              </div>
            )}
            {activeTab === 'Talents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Spec selector bar */}
                {charSpecs.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    {charSpecs.map(cs => {
                      const ref = refSpecMap[cs.specialization_key]
                      const purchased = talents.filter(t => t.specialization_key === cs.specialization_key).length
                      const total = ref?.talent_tree?.rows?.reduce((s, r) => s + (r.talents?.length || 0), 0) || 0
                      const isActive = (activeSpecKey || charSpecs[0]?.specialization_key) === cs.specialization_key
                      return (
                        <button
                          key={cs.id}
                          onClick={() => setActiveSpecKey(cs.specialization_key)}
                          style={{
                            background: isActive ? 'rgba(200,170,80,0.12)' : 'transparent',
                            border: `1px solid ${isActive ? 'rgba(200,170,80,0.5)' : 'rgba(200,170,80,0.2)'}`,
                            borderRadius: 4, padding: '5px 12px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: FS_CAPTION, fontWeight: 600, letterSpacing: '0.06em',
                            color: isActive ? '#C8AA50' : '#6A8070',
                            transition: '.15s',
                          }}
                        >
                          {ref?.name || cs.specialization_key}
                          <span style={{ fontFamily: "var(--font-rajdhani),'Rajdhani',sans-serif", fontSize: FS_OVERLINE, color: isActive ? '#C8AA5088' : '#2A3A2E', background: 'rgba(200,170,80,0.08)', borderRadius: 8, padding: '0 5px' }}>
                            {purchased}/{total}
                          </span>
                        </button>
                      )
                    })}
                    <BuySpecButton
                      character={character}
                      charSpecs={charSpecs}
                      refSpecs={refSpecs}
                      refSpecMap={refSpecMap}
                      onBuy={specKey => handleBuySpecialization(specKey, setActiveSpecKey)}
                    />
                  </div>
                )}
                {/* ── Quick-Reference panel by activation type ── */}
                <WfTalentsPanel liveTalents={hudTalents} characterName={character.name} />
                {/* Inline talent tree */}
                {talentTreeData ? (
                  <TalentTree
                    specName={talentTreeData.specName}
                    nodes={talentTreeData.nodes}
                    connections={talentTreeData.connections}
                    onPurchase={(talentKey, row, col) => handlePurchaseTalent(talentKey, row, col, (activeSpecKey || charSpecs[0]?.specialization_key)!)}
                    onRemoveTalent={isGmMode ? handleRemoveTalent : undefined}
                    isGmMode={isGmMode}
                    xpAvailable={character.xp_available}
                  />
                ) : charSpecs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: "var(--font-rajdhani),'Rajdhani',sans-serif", fontSize: FS_SM, color: '#2A3A2E' }}>
                    No specializations purchased yet.
                  </div>
                ) : null}
              </div>
            )}
            {activeTab === 'Inventory' && (
              <InventoryPanel
                weapons={hudWeapons}
                armorItems={hudArmor}
                gearItems={hudGear}
                encumbranceCurrent={encumbranceCurrent}
                encumbranceThreshold={encThreshold}
                onToggleWeapon={handleToggleWeaponEquipped}
                onToggleArmor={id => handleToggleEquippedById(id, 'armor')}
                onToggleGear={id => handleToggleEquippedById(id, 'gear')}
              />
            )}
            {activeTab === 'Force' && (
              <ForcePanel
                forceRating={forceRating}
                moralityValue={character.morality_value ?? 50}
                moralityStrength={character.morality_strength_key || ''}
                moralityWeakness={character.morality_weakness_key || ''}
                forcePowers={allForcePowers.filter(fp => fp.purchasedCount > 0)}
                onViewPower={pk => { setActivePowerKey(pk); setShowForceTree(true) }}
                onAdd={() => { setActivePowerKey(allForcePowers[0]?.powerKey ?? null); setShowForceTree(true) }}
                onRollForce={() => setForceRollResult(rollForceDice(forceRating))}
              />
            )}
            {activeTab === 'Lore' && (
              <LoreContent
                characterName={character.name}
                careerName={careerName}
                speciesName={speciesName}
                gender={character.gender}
                backstory={character.backstory || ''}
                notes={character.notes || ''}
                speciesRef={refSpeciesAll.find(s => s.key === character.species_key)}
                motivationType={character.obligation_type || character.duty_type}
                motivationDesc={character.obligation_notes || character.duty_notes}
                onBackstoryChange={handleBackstoryChange}
                onNotesChange={handleNotesChange}
              />
            )}
            {activeTab === 'Feed' && (
              <WfDiceFeed
                liveRolls={rolls}
                ownCharacterId={character.id}
              />
            )}
            {activeTab === 'Combat' && effectiveCampaignId && (
              <CombatTracker
                character={character}
                campaignId={effectiveCampaignId}
                talents={hudTalents}
              />
            )}
            {activeTab === 'Combat' && !effectiveCampaignId && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12, padding: 40 }}>
                <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, color: C.textFaint }}>NO CAMPAIGN</div>
                <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textFaint }}>Join a campaign to see combat tracking</div>
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT COLUMN ═════════════════════════════════════ */}
        <div style={{
          background: 'rgba(4,9,6,0.7)',
          overflowY: 'auto', overflowX: 'hidden',
          padding: 'var(--space-2)',
        }}>
          <DiceRoller
            trainedSkills={quickSkills}
            equippedWeapons={equippedWeaponQuick}
            onRoll={handleRoll}
          />
          {rolls.length > 0 && (
            <div style={{ marginTop: 'var(--space-2)' }}>
              <RollFeedMini
                rolls={rolls}
                ownCharacterId={character.id}
                onExpand={() => setActiveTab('Feed')}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Dice Result Modal ─────────────────────────────── */}
      {rollResult && (
        <DiceModal result={rollResult} skillName={rollLabel} onDismiss={() => setRollResult(null)} />
      )}

      {/* ── Talent Tree Modal ──────────────────────────────── */}
      {showTalentTree && (
        <div onClick={() => setShowTalentTree(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '1200px', maxHeight: '95vh', overflowY: 'auto', background: 'var(--sand)', border: '1px solid var(--bdr)', boxShadow: '0 8px 48px rgba(0,0,0,.3)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {charSpecs.map(cs => {
                const ref = refSpecMap[cs.specialization_key]
                const isActive = activeSpecKey === cs.specialization_key
                return (
                  <button key={cs.id} onClick={() => setActiveSpecKey(cs.specialization_key)} style={{ background: isActive ? 'var(--gold-glow)' : 'rgba(255,255,255,.6)', border: `1px solid ${isActive ? 'var(--gold)' : 'var(--bdr-l)'}`, padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-caption)', fontWeight: isActive ? 700 : 600, letterSpacing: '0.08em', color: isActive ? 'var(--gold-d)' : 'var(--txt2)' }}>
                    {ref?.name || cs.specialization_key}
                    {cs.is_starting && <span style={{ fontSize: 'var(--text-overline)', color: 'var(--txt3)', marginLeft: '8px' }}>START</span>}
                  </button>
                )
              })}
              <BuySpecButton
                character={character}
                charSpecs={charSpecs}
                refSpecs={refSpecs}
                refSpecMap={refSpecMap}
                onBuy={specKey => handleBuySpecialization(specKey, setActiveSpecKey)}
              />
            </div>
            {talentTreeData ? (
              <TalentTree
                specName={talentTreeData.specName}
                nodes={talentTreeData.nodes}
                connections={talentTreeData.connections}
                onPurchase={(talentKey, row, col) => handlePurchaseTalent(talentKey, row, col, activeSpecKey!)}
                onRemoveTalent={isGmMode ? handleRemoveTalent : undefined}
                isGmMode={isGmMode}
                xpAvailable={character.xp_available}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '48px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-body-sm)', color: 'var(--txt3)' }}>No talent tree data.</div>
            )}
            <button onClick={() => setShowTalentTree(false)} style={{ display: 'block', margin: '16px auto 0', background: 'rgba(255,255,255,.8)', border: '1px solid var(--bdr)', padding: '12px 32px', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-label)', fontWeight: 600, letterSpacing: '0.15em', color: 'var(--txt2)', cursor: 'pointer' }}>CLOSE</button>
          </div>
        </div>
      )}

      {/* ── Force Power Tree Modal ────────────────────────── */}
      {showForceTree && (
        <div onClick={() => setShowForceTree(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '1100px', maxHeight: '95vh', overflowY: 'auto', background: '#060D09', border: `1px solid rgba(200,170,80,0.18)`, boxShadow: '0 8px 48px rgba(0,0,0,.7), 0 0 0 1px rgba(200,170,80,0.08)', borderRadius: 8, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Power selector tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {allForcePowers.map(fp => {
                const isActive = activePowerKey === fp.powerKey
                return (
                  <button
                    key={fp.powerKey}
                    onClick={() => setActivePowerKey(fp.powerKey)}
                    style={{
                      background: isActive ? 'rgba(200,170,80,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? 'rgba(200,170,80,0.55)' : 'rgba(200,170,80,0.14)'}`,
                      borderRadius: 4, padding: '6px 12px', cursor: 'pointer',
                      fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: '0.06em',
                      color: isActive ? '#C8AA50' : '#6A8070',
                      transition: 'all .15s',
                    }}
                  >
                    {fp.powerName}
                    <span style={{ fontSize: FS_OVERLINE, color: isActive ? 'rgba(200,170,80,0.6)' : '#3A5040', marginLeft: 6 }}>
                      {fp.purchasedCount}/{fp.totalCount}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Tree */}
            {forcePowerTreeData ? (
              <ForcePowerTree
                powerName={forcePowerTreeData.powerName}
                nodes={forcePowerTreeData.nodes}
                connections={forcePowerTreeData.connections}
                onPurchase={(abilityKey, row, col, cost) => handlePurchaseForceAbility(abilityKey, row, col, cost, activePowerKey!)}
                xpAvailable={character.xp_available}
                purchasedCount={forcePowerTreeData.purchasedCount}
                totalCount={forcePowerTreeData.totalCount}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '48px', fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: '#3A5040' }}>No force power tree data.</div>
            )}

            {/* Close */}
            <button
              onClick={() => setShowForceTree(false)}
              style={{
                display: 'block', margin: '4px auto 0',
                background: 'rgba(200,170,80,0.08)',
                border: '1px solid rgba(200,170,80,0.3)',
                borderRadius: 4, padding: '10px 40px',
                fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
                fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#C8AA50', cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── GM Dialog ─────────────────────────────────────── */}
      {gmDialog && (
        <div onClick={() => setGmDialog(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', background: 'var(--sand)', border: '2px solid var(--gold)', boxShadow: '0 0 40px var(--gold-glow-s), 0 8px 48px rgba(0,0,0,.3)', padding: '32px 28px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--gold-d)', marginBottom: '16px' }}>INCOMING TRANSMISSION</div>
            <div style={{ fontFamily: 'var(--font-chakra)', fontSize: 'var(--font-md)', color: 'var(--ink)', lineHeight: 1.6, marginBottom: '24px' }}>{gmDialog}</div>
            <button onClick={() => setGmDialog(null)} style={{ background: 'var(--gold)', border: 'none', padding: '12px 40px', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-label)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--white)', cursor: 'pointer' }}>DISMISS</button>
          </div>
        </div>
      )}

      {/* ── Force Roll Modal ──────────────────────────────── */}
      {forceRollResult && (
        <ForceRollModal
          result={forceRollResult}
          forceRating={forceRating}
          onDismiss={() => setForceRollResult(null)}
        />
      )}

      {/* ── Initiative Roll Modal ─────────────────────────── */}
      {initRoll && character && (
        <InitiativeRollModal
          character={character}
          skills={skills}
          initiativeType={initRoll.type}
          campaignId={initRoll.campaignId}
          forceRating={forceRating}
          onClose={() => setInitRoll(null)}
        />
      )}

      {/* ── Loot Reveal ───────────────────────────────────── */}
      {lootReveal && (() => {
        const r = lootReveal as Record<string, unknown>
        const rarity = (r.rarity as number) || 0
        const color = rarity <= 2 ? 'var(--txt3)' : rarity <= 4 ? 'var(--green)' : rarity <= 6 ? 'var(--blue)' : rarity <= 8 ? '#7B3FA0' : 'var(--gold)'
        const label = rarity <= 2 ? 'Common' : rarity <= 4 ? 'Uncommon' : rarity <= 6 ? 'Rare' : rarity <= 8 ? 'Epic' : 'Legendary'
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '420px', background: 'var(--sand)', border: `3px solid ${color}`, boxShadow: `0 0 40px ${color}, 0 8px 48px rgba(0,0,0,.4)`, padding: '32px 28px 28px', textAlign: 'center', position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 700, letterSpacing: '0.25em', color, marginBottom: '16px', textTransform: 'uppercase' }}>{r.source as string}</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <EquipmentImage itemKey={r.key as string} itemType={r.itemType as 'weapon' | 'armor' | 'gear'} categories={r.categories as string[]} size="lg" style={{ width: 120, height: 120 }} />
              </div>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--ink)', marginBottom: '8px', lineHeight: 1.2 }}>{r.name as string}</div>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 700, color, marginBottom: '12px', letterSpacing: '0.1em' }}>Rarity {rarity} — {label}</div>
              <button onClick={() => setLootReveal(null)} style={{ background: 'var(--gold)', border: 'none', padding: '10px 32px', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-label)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--white)', cursor: 'pointer' }}>CLAIM</button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
