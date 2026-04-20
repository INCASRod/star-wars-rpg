'use client'

import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EquipmentImage } from '@/components/ui/EquipmentImage'
import { parseOggDudeMarkup } from '@/lib/oggdude-markup'
import type { Character, Campaign, Player, RefDutyType, RefObligationType, CriticalInjuryRequest, RefCriticalInjury } from '@/lib/types'
import { DutyObligationTab } from '@/components/gm/DutyObligationTab'
import { ForceNotificationCard, type ForceNotification } from '@/components/gm/ForceNotificationCard'
import { ItemDatabaseTab } from '@/components/gm/ItemDatabaseTab'
import { LootAwardModal, type AwardableItem } from '@/components/gm/LootAwardModal'
import { DestinyGeneratePanel } from '@/components/gm/DestinyGeneratePanel'
import { GmMapView } from '@/components/gm/GmMapView'
import { AdversaryLibrary } from '@/components/gm/AdversaryLibrary'
import { VehicleLibrary } from '@/components/gm/VehicleLibrary'
import { TalentDatabaseTab } from '@/components/gm/TalentDatabaseTab'
import { StagingTopBar } from '@/components/staging/StagingTopBar'
import { StagingFloatingToolbar } from '@/components/staging/StagingFloatingToolbar'
import { useActiveMap } from '@/hooks/useActiveMap'
import { DestinyPoolDisplay, type DestinyPoolRecord } from '@/components/destiny/DestinyPoolDisplay'
import { toast } from 'sonner'
import { rarityColor, rarityLabel } from '@/lib/styles'
import { useRollFeed } from '@/hooks/useRollFeed'
import { RollFeedPanel } from '@/components/player-hud/RollFeedPanel'
import { HolocronLoader } from '@/components/ui/HolocronLoader'
import { GmReferenceDrawer } from '@/components/gm/GmReferenceDrawer'
import { GmDiceRollerFAB } from '@/components/gm/GmDiceRollerFAB'
import { archiveCharacter, restoreCharacter } from '@/lib/characters'

/* ═══════════════════════════════════════
   DESIGN TOKENS (Dark HUD)
   ═══════════════════════════════════════ */
const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FR = "var(--font-rajdhani), 'Rajdhani', sans-serif"
type AwardLogEntry = {
  id: string; type: 'xp' | 'credits'; amount: number
  mode: 'group' | 'individual'; target_name: string | null
  reason: string | null; recipient_count: number | null; created_at: string
}

const BG = '#060D09'
const PANEL_BG = 'rgba(8,16,10,0.88)'
const GOLD = '#C8AA50'
const GOLD_DIM = '#7A6830'
const TEXT = '#C8D8C0'
const DIM = '#6A8070'
const FAINT = '#2A3A2E'
const BORDER = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const GREEN = '#4EC87A'
const RED = '#E05050'
const BLUE = '#5AAAE0'
const CYAN = '#60C8E0'
const PURPLE = '#9060D0'
const ORANGE = '#E07855'

/* ── Font size tokens — CSS clamp() vars from design-rules.md ── */
const FS_OVERLINE = 'var(--text-overline)'  // clamp  9–11px  (replaces 8, 9)
const FS_CAPTION = 'var(--text-caption)'   // clamp 10–12px  (replaces 10)
const FS_LABEL = 'var(--text-label)'     // clamp 11–13px  (replaces 11, 13)
const FS_SM = 'var(--text-sm)'        // clamp 12–14px  (replaces 12, 14)
const FS_H4 = 'var(--text-h4)'        // clamp 16–22px  (replaces 16)
const FS_H3 = 'var(--text-h3)'        // clamp 18–28px  (replaces 18, 20)

const panelBase: React.CSSProperties = {
  background: PANEL_BG,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  position: 'relative',
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700,
    letterSpacing: '0.22em', textTransform: 'uppercase',
    color: 'rgba(200,170,80,0.4)', marginBottom: 8,
  }}>
    {children}
  </div>
)

function CornerBrackets() {
  const s: React.CSSProperties = { position: 'absolute', width: 8, height: 8 }
  return (<>
    <div style={{ ...s, top: 0, left: 0, borderTop: '1px solid rgba(200,170,80,0.35)', borderLeft: '1px solid rgba(200,170,80,0.35)' }} />
    <div style={{ ...s, top: 0, right: 0, borderTop: '1px solid rgba(200,170,80,0.35)', borderRight: '1px solid rgba(200,170,80,0.35)' }} />
    <div style={{ ...s, bottom: 0, left: 0, borderBottom: '1px solid rgba(200,170,80,0.35)', borderLeft: '1px solid rgba(200,170,80,0.35)' }} />
    <div style={{ ...s, bottom: 0, right: 0, borderBottom: '1px solid rgba(200,170,80,0.35)', borderRight: '1px solid rgba(200,170,80,0.35)' }} />
  </>)
}

/* ═══════════════════════════════════════
   LOOT ITEM TYPE
   ═══════════════════════════════════════ */
type LootItem = {
  key: string; name: string; type: 'weapon' | 'armor' | 'gear'
  price: number; rarity: number; encumbrance: number
  description?: string; categories?: string[]
  damage?: number; damage_add?: number; crit?: number
  range_value?: string; qualities?: { key: string; count?: number | null }[]
  skill_key?: string
  defense?: number; soak?: number
}


function OverrideCritSelect({ refCrits, onOverride }: { refCrits: RefCriticalInjury[]; onOverride: (id: number) => void }) {
  const [open, setOpen] = useState(false)
  const FR = "var(--font-rajdhani), 'Rajdhani', sans-serif"
  const FS_CAPTION = 'var(--text-caption)'
  const DIM = '#6A8070'
  const RED = '#E05050'
  const PANEL_BG = 'rgba(8,16,10,0.95)'
  const BORDER = 'rgba(200,170,80,0.14)'

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'rgba(224,120,85,0.08)',
          border: `1px solid rgba(224,120,85,0.3)`,
          borderRadius: 3, padding: '4px 0',
          cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION,
          color: '#E07855',
        }}
      >
        ✎ Override
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 400 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
            zIndex: 410,
            background: PANEL_BG, border: `1px solid ${BORDER}`,
            borderRadius: 4,
            maxHeight: 200, overflowY: 'auto',
          }}>
            {refCrits.map(r => (
              <button
                key={r.id}
                onClick={() => { onOverride(r.id); setOpen(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'transparent', border: 'none',
                  padding: '5px 8px', cursor: 'pointer',
                  fontFamily: FR, fontSize: FS_CAPTION, color: DIM,
                  borderBottom: `1px solid rgba(200,170,80,0.06)`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = RED; (e.currentTarget as HTMLElement).style.background = 'rgba(224,80,80,0.06)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DIM; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                [{r.roll_min}–{r.roll_max}] {r.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════
   LOOT BADGES
   ═══════════════════════════════════════ */
const badgeStyle = (bg: string, fg: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  padding: '2px 7px', borderRadius: '3px',
  fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
  background: bg, color: fg, whiteSpace: 'nowrap',
})

function LootBadges({ item, size = 'sm' }: { item: LootItem; size?: 'sm' | 'md' }) {
  const badges: React.ReactNode[] = []
  const fs = size === 'md' ? '13px' : '11px'
  const pad = '4px 8px'
  const b = (bg: string, fg: string): React.CSSProperties => ({ ...badgeStyle(bg, fg), fontSize: fs, padding: pad })

  if (item.type === 'weapon') {
    const isMelee = ['MELEE', 'BRAWL', 'LTSABER'].includes(item.skill_key || '')
    const isBrawnBased = isMelee && item.damage_add != null
    const dmg = isBrawnBased
      ? `Brawn+${item.damage_add ?? 0}`
      : item.damage != null ? String(item.damage) : null
    if (dmg != null) badges.push(<span key="dmg" style={b('rgba(224,80,80,0.15)', RED)}>DMG {dmg}</span>)
    if (item.crit != null && item.crit > 0) badges.push(<span key="crit" style={b('rgba(224,80,80,0.10)', '#B44')}>CRIT {item.crit}</span>)
    if (item.range_value) badges.push(<span key="rng" style={b('rgba(200,170,80,0.08)', DIM)}>{item.range_value}</span>)
  }
  if (item.type === 'armor') {
    if (item.defense != null && item.defense > 0) badges.push(<span key="def" style={b('rgba(90,170,224,0.15)', BLUE)}>DEF {item.defense}</span>)
    if (item.soak != null && item.soak > 0) badges.push(<span key="soak" style={b('rgba(90,170,224,0.10)', '#2B5DAE')}>SOAK +{item.soak}</span>)
  }
  if (badges.length === 0) return null
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>{badges}</div>
}

/* ═══════════════════════════════════════
   INPUT / BUTTON SHARED STYLES
   ═══════════════════════════════════════ */
const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid rgba(200,170,80,0.25)`,
  color: TEXT,
  fontFamily: FR,
  padding: '6px 10px',
  borderRadius: 3,
  outline: 'none',
  fontSize: FS_SM,
}

const darkInputNarrow: React.CSSProperties = {
  ...darkInput,
  width: '5rem',
  textAlign: 'center',
}

const btnPrimary: React.CSSProperties = {
  background: 'rgba(200,170,80,0.15)',
  border: `1px solid rgba(200,170,80,0.4)`,
  color: GOLD,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '6px 14px',
  borderRadius: 3,
  cursor: 'pointer',
  transition: '.15s',
}

const btnDanger: React.CSSProperties = {
  background: 'rgba(224,80,80,0.15)',
  border: `1px solid rgba(224,80,80,0.4)`,
  color: RED,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '6px 14px',
  borderRadius: 3,
  cursor: 'pointer',
  transition: '.15s',
}

const btnSecondary: React.CSSProperties = {
  background: 'rgba(90,170,224,0.15)',
  border: `1px solid rgba(90,170,224,0.4)`,
  color: BLUE,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '6px 14px',
  borderRadius: 3,
  cursor: 'pointer',
  transition: '.15s',
}

const btnSmall: React.CSSProperties = {
  background: 'rgba(200,170,80,0.08)',
  border: `1px solid rgba(200,170,80,0.2)`,
  color: DIM,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  padding: '4px 10px',
  borderRadius: 3,
  cursor: 'pointer',
  transition: '.15s',
}

const fieldLabel: React.CSSProperties = {
  fontFamily: FC,
  fontSize: FS_OVERLINE,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(200,170,80,0.5)',
  marginBottom: 4,
}

/* ═══════════════════════════════════════
   PAGE EXPORT (Suspense wrapper)
   ═══════════════════════════════════════ */
export default function GmDashboardPage() {
  return (
    <Suspense fallback={
      <div style={{
        width: '100vw', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: BG, fontFamily: FC,
        color: GOLD, fontSize: FS_H3, letterSpacing: '0.3em',
      }}>
        LOADING GM DASHBOARD...
      </div>
    }>
      <GmDashboard />
    </Suspense>
  )
}

/* ═══════════════════════════════════════
   INNER COMPONENT
   ═══════════════════════════════════════ */
function GmDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const campaignId = searchParams.get('campaign')

  // ── Core state ──
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [players, setPlayers] = useState<Record<string, string>>({})
  const [charSpecs, setCharSpecs] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gmScreenOpen, setGmScreenOpen] = useState(false)

  // ── Tabs ──
  type GmTab = 'xp' | 'credits' | 'duty' | 'do' | 'loot' | 'items' | 'talents' | 'combat' | 'adversaries' | 'vehicles' | 'force' | 'staging'
  const GM_TAB_KEY = 'holocron:gm-tab'
  // 'staging' is intentionally excluded — the staging tab must be explicitly clicked each session
  const GM_TAB_VALID: GmTab[] = ['xp', 'credits', 'duty', 'do', 'loot', 'items', 'talents', 'combat', 'adversaries', 'vehicles', 'force']
  const [activeTab, setActiveTab] = useState<GmTab>(() => {
    if (typeof window === 'undefined') return 'xp'
    const saved = window.localStorage.getItem(GM_TAB_KEY)
    return GM_TAB_VALID.includes(saved as GmTab) ? (saved as GmTab) : 'xp'
  })
  // tracks which tools tab was active before entering the staging view, so the Staging button can toggle back
  const prevToolsTab = useRef<GmTab>(activeTab === 'staging' ? 'xp' : activeTab)

  // ── Force notifications ──
  const [forceNotifications, setForceNotifications] = useState<ForceNotification[]>([])

  // ── D&O ref data ──
  const [dutyTypes, setDutyTypes]           = useState<RefDutyType[]>([])
  const [obligationTypes, setObligationTypes] = useState<RefObligationType[]>([])

  // ── Morality ref data ──
  interface RefMorality { key: string; name: string; description?: string; type: 'Strength' | 'Weakness' }
  const [moralityStrengths, setMoralityStrengths] = useState<RefMorality[]>([])
  const [moralityWeaknesses, setMoralityWeaknesses] = useState<RefMorality[]>([])

  // ── Morality setup modal ──
  interface MoralitySetupState {
    id: string; name: string
    score: number
    strengthKey: string; weaknessKey: string
    strengthDesc: string; weaknessDesc: string
  }
  const [moralitySetup, setMoralitySetup] = useState<MoralitySetupState | null>(null)
  const [moralityBusy, setMoralityBusy] = useState(false)

  // ── XP ──
  const [xpAmount, setXpAmount] = useState('')
  const [xpReason, setXpReason] = useState('')
  const [xpBusy, setXpBusy] = useState(false)
  const [xpMode, setXpMode] = useState<'group' | 'individual'>('group')
  const [xpTarget, setXpTarget] = useState('')
  const [xpConfirm, setXpConfirm] = useState<{ amount: number; reason: string; target?: string; targetName?: string } | null>(null)

  // ── Credits ──
  const [creditsAmount, setCreditsAmount] = useState('')
  const [creditsBusy, setCreditsBusy] = useState(false)
  const [creditsMode, setCreditsMode] = useState<'group' | 'individual'>('group')
  const [creditsTarget, setCreditsTarget] = useState('')

  // ── Award history ──
  const [xpHistory,            setXpHistory]            = useState<AwardLogEntry[]>([])
  const [xpHistoryExpanded,    setXpHistoryExpanded]    = useState(false)
  const [creditsHistory,       setCreditsHistory]       = useState<AwardLogEntry[]>([])
  const [creditsHistoryExpanded, setCreditsHistoryExpanded] = useState(false)

  // ── Duty & Obligation ──
  const [odMode, setOdMode] = useState<'group' | 'individual'>('group')
  const [odType, setOdType] = useState<'obligation' | 'duty'>('obligation')
  const [odAmount, setOdAmount] = useState('')
  const [odTarget, setOdTarget] = useState('')
  const [odBusy, setOdBusy] = useState(false)

  // ── Session Mode ──
  const [sessionMode, setSessionMode] = useState<'exploration' | 'combat'>('exploration')
  const [combatRound, setCombatRound] = useState(1)
  const [sessionBusy, setSessionBusy] = useState(false)
  const [mapLibraryOpen, setMapLibraryOpen] = useState(false)

  // ── Critical Injury Request flow ──
  const [refCritsDb, setRefCritsDb] = useState<RefCriticalInjury[]>([])
  const [charActiveCritCounts, setCharActiveCritCounts] = useState<Record<string, number>>({})
  const [critReqOpenFor, setCritReqOpenFor] = useState<string | null>(null)
  const [critReqVicious, setCritReqVicious] = useState(0)
  const [critReqLethal, setCritReqLethal] = useState(0)
  const [critReqGm, setCritReqGm] = useState(0)
  const [critReqBusy, setCritReqBusy] = useState(false)
  const [rolledCritRequests, setRolledCritRequests] = useState<CriticalInjuryRequest[]>([])
  const [critCustomNames, setCritCustomNames] = useState<Record<string, string>>({})

  // ── Loot ──
  const [lootOpen, setLootOpen] = useState(false)
  const [lootType, setLootType] = useState<'all' | 'weapon' | 'armor' | 'gear'>('all')
  const [lootRarityMin, setLootRarityMin] = useState(0)
  const [lootRarityMax, setLootRarityMax] = useState(10)
  const [lootSource, setLootSource] = useState<'Vendor' | 'Searching' | 'Looted'>('Looted')
  const [lootSearchText, setLootSearchText] = useState('')
  const [lootItems, setLootItems] = useState<LootItem[]>([])
  const [lootSelected, setLootSelected] = useState<LootItem | null>(null)
  const [revealItem, setRevealItem] = useState<LootItem | null>(null)
  const [assignTarget, setAssignTarget] = useState<string>('')
  const [lootBusy, setLootBusy] = useState(false)
  const [lootAwardItem, setLootAwardItem] = useState<AwardableItem | null>(null)

  // ── Destiny Pool ──
  const [destinyPool, setDestinyPool] = useState<Array<'light' | 'dark'>>(['light', 'light', 'dark', 'dark', 'dark'])
  const [destinyPoolRecord,   setDestinyPoolRecord]   = useState<DestinyPoolRecord | null>(null)
  const [destinyGenerateOpen, setDestinyGenerateOpen] = useState(false)
  const [manualAdjustOpen,    setManualAdjustOpen]    = useState(false)
  const [gmSpendConfirm,      setGmSpendConfirm]      = useState(false)
  const [manualLight,         setManualLight]         = useState(0)
  const [manualDark,          setManualDark]          = useState(0)
  const [manualBusy,          setManualBusy]          = useState(false)

  // ── Active sessions (charId → session_key) ──
  const [activeSessions, setActiveSessions] = useState<Record<string, string>>({})

  // ── Archive ──
  const [archiveConfirm, setArchiveConfirm] = useState<{ id: string; name: string } | null>(null)
  const [archiveBusy, setArchiveBusy] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  // ── Dark Side Fall / Redemption ──
  const [fallenConfirm, setFallenConfirm] = useState<{ id: string; name: string; isFallen: boolean; morality?: number } | null>(null)
  const [fallenBusy, setFallenBusy] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])

  // ── Map state ──
  const { activeMap, allMaps, removeMap } = useActiveMap(campaignId)

  // ── Derived character lists ──
  const activeChars   = useMemo(() => characters.filter(c => !c.is_archived), [characters])
  const archivedChars = useMemo(() => characters.filter(c =>  c.is_archived), [characters])
  const targetChars   = activeChars

  // ── Optimistic character patch (used by D&O tab inline edits & setup modal) ──
  const handleCharacterUpdated = useCallback((id: string, updates: Partial<Character>) => {
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  // ── Roll Feed ──
  const rolls = useRollFeed(campaignId)

  // ── Toast helpers ──
  const flash = useCallback((msg: string) => toast.success(msg), [])
  const flashError = useCallback((msg: string) => toast.error(msg), [])

  // ── GM broadcast channels ──
  const gmChannelsRef = useRef<Map<string, ReturnType<typeof supabase.channel>>>(new Map())

  // Add channels for new characters only — never destroy on re-render to avoid
  // the race where channels are unsubscribed when a broadcast is sent.
  useEffect(() => {
    const map = gmChannelsRef.current
    for (const c of characters) {
      if (!map.has(c.id)) {
        const ch = supabase.channel(`gm-notify-${c.id}`)
        ch.subscribe()
        map.set(c.id, ch)
      }
    }
  }, [characters, supabase])

  // Destroy channels only on unmount
  useEffect(() => {
    const map = gmChannelsRef.current
    return () => {
      for (const [, ch] of map) supabase.removeChannel(ch)
      map.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Broadcast notification ──
  const notify = useCallback((charId: string, type: 'toast' | 'dialog', message: string) => {
    const ch = gmChannelsRef.current.get(charId)
    if (ch) {
      ch.send({ type: 'broadcast', event: 'gm-action', payload: { type, message } })
    }
  }, [])

  // Send arbitrary gm-action payload to a single character via already-subscribed channel
  const sendToChar = useCallback((charId: string, payload: Record<string, unknown>) => {
    const ch = gmChannelsRef.current.get(charId)
    if (ch) ch.send({ type: 'broadcast', event: 'gm-action', payload })
  }, [])

  // ── Loot query ──
  const buildLootQuery = useCallback(async (limit: number) => {
    const queries: Promise<{ data: LootItem[] }>[] = []
    const nameFilter = lootSearchText.trim() ? `%${lootSearchText.trim()}%` : null

    const buildQ = async (table: string, type: 'weapon' | 'armor' | 'gear'): Promise<{ data: LootItem[] }> => {
      const baseCols = 'key, name, price, rarity, encumbrance, description'
      const cols = type === 'weapon'
        ? `${baseCols}, categories, damage, damage_add, crit, range_value, qualities, skill_key`
        : type === 'armor'
          ? `${baseCols}, defense, soak`
          : baseCols
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (supabase.from(table) as any).select(cols)
        .gte('rarity', lootRarityMin).lte('rarity', lootRarityMax).limit(limit)
      if (nameFilter) q = q.ilike('name', nameFilter)
      const r = await q
      return { data: ((r.data || []) as Record<string, unknown>[]).map(d => ({ ...d, type })) as LootItem[] }
    }

    if (lootType === 'all' || lootType === 'weapon') queries.push(buildQ('ref_weapons', 'weapon'))
    if (lootType === 'all' || lootType === 'armor') queries.push(buildQ('ref_armor', 'armor'))
    if (lootType === 'all' || lootType === 'gear') queries.push(buildQ('ref_gear', 'gear'))

    const results = await Promise.all(queries)
    return results.flatMap(r => r.data)
  }, [supabase, lootType, lootRarityMin, lootRarityMax, lootSearchText])

  const handleLootBrowse = useCallback(async () => {
    setLootBusy(true)
    const items = await buildLootQuery(30)
    items.sort((a, b) => a.name.localeCompare(b.name))
    setLootItems(items)
    setLootSelected(null)
    setLootBusy(false)
  }, [buildLootQuery])

  const handleLootRoll = useCallback(async () => {
    setLootBusy(true)
    const items = await buildLootQuery(100)
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]]
    }
    const count = Math.min(items.length, 3 + Math.floor(Math.random() * 3))
    setLootItems(items.slice(0, count))
    setLootSelected(null)
    setLootBusy(false)
  }, [buildLootQuery])

  const handleRevealToPlayers = useCallback((item: LootItem) => {
    setRevealItem(item)
    for (const c of characters) {
      const ch = gmChannelsRef.current.get(c.id)
      if (ch) {
        ch.send({
          type: 'broadcast', event: 'gm-action',
          payload: {
            type: 'loot-reveal',
            item: {
              name: item.name, key: item.key, itemType: item.type, rarity: item.rarity,
              source: lootSource, description: item.description, categories: item.categories,
              damage: item.damage, damage_add: item.damage_add, crit: item.crit,
              range_value: item.range_value, qualities: item.qualities, skill_key: item.skill_key,
              defense: item.defense, soak: item.soak,
            },
          },
        })
      }
    }
  }, [characters, lootSource])

  const handleDismissReveal = useCallback(() => {
    setRevealItem(null)
    for (const c of characters) {
      const ch = gmChannelsRef.current.get(c.id)
      if (ch) {
        ch.send({ type: 'broadcast', event: 'gm-action', payload: { type: 'loot-dismiss' } })
      }
    }
  }, [characters])

  const handleAssignLoot = useCallback(async () => {
    if (!revealItem || !assignTarget) return
    setLootBusy(true)
    const notes = `Source: ${lootSource}`
    if (revealItem.type === 'weapon') {
      await supabase.from('character_weapons').insert({ character_id: assignTarget, weapon_key: revealItem.key, is_equipped: false, attachments: [], notes })
    } else if (revealItem.type === 'armor') {
      await supabase.from('character_armor').insert({ character_id: assignTarget, armor_key: revealItem.key, is_equipped: false, attachments: [], notes })
    } else {
      await supabase.from('character_gear').insert({ character_id: assignTarget, gear_key: revealItem.key, quantity: 1, is_equipped: false, notes })
    }
    const charName = characters.find(c => c.id === assignTarget)?.name || 'someone'
    notify(assignTarget, 'dialog', `You received ${revealItem.name} (${revealItem.type})!`)
    flash(`${revealItem.name} assigned to ${charName}`)
    handleDismissReveal()
    setRevealItem(null)
    setAssignTarget('')
    setLootBusy(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealItem, assignTarget, lootSource, characters, notify, flash, handleDismissReveal])

  // ── Load data ──
  const loadData = useCallback(async (silent = false) => {
    if (!campaignId) {
      setError('No campaign ID provided')
      setLoading(false)
      return
    }
    if (!silent) setLoading(true)
    try {
      // Ensure the Supabase client has hydrated its session from the cookie
      // before any queries run, so requests carry the JWT and RLS resolves correctly.
      await supabase.auth.getSession()

      const [campRes, charRes, playerRes, sessRes, dutyTypesRes, oblTypesRes, moralityRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', campaignId).single(),
        supabase.from('characters').select('*').eq('campaign_id', campaignId).eq('is_archived', false),
        supabase.from('players').select('id, display_name').eq('campaign_id', campaignId).eq('is_gm', false),
        supabase.from('character_sessions').select('character_id, session_key').eq('campaign_id', campaignId).eq('is_active', true),
        supabase.from('ref_duty_types').select('key, name, description').order('name'),
        supabase.from('ref_obligation_types').select('key, name, description').order('name'),
        supabase.from('ref_moralities').select('key, name, description, type').order('name'),
      ])

      if (campRes.error) throw new Error(campRes.error.message)
      const campData = campRes.data as Campaign & { session_mode?: string; combat_round?: number; settings?: Record<string, unknown> }
      setCampaign(campData as Campaign)
      if (campData.session_mode === 'combat') setSessionMode('combat')
      if (campData.combat_round) setCombatRound(campData.combat_round)

      // Load destiny pool from campaign settings
      const settings = campData.settings || {}
      if (Array.isArray(settings.destiny_pool)) {
        setDestinyPool(settings.destiny_pool as Array<'light' | 'dark'>)
      }

      if (dutyTypesRes.error) throw new Error(
        `Failed to load Duty types: ${dutyTypesRes.error.message}`
      )
      if (dutyTypesRes.data) setDutyTypes(dutyTypesRes.data as RefDutyType[])

      if (oblTypesRes.error) throw new Error(
        `Failed to load Obligation types: ${oblTypesRes.error.message}`
      )
      if (oblTypesRes.data) setObligationTypes(oblTypesRes.data as RefObligationType[])

      if (moralityRes.data) {
        type RawMorality = { key: string; name: string; description?: string; type: string }
        const all = moralityRes.data as RawMorality[]
        setMoralityStrengths(all.filter(m => m.type === 'Strength') as RefMorality[])
        setMoralityWeaknesses(all.filter(m => m.type === 'Weakness') as RefMorality[])
      }

      const chars = (charRes.data as Character[]) || []
      setCharacters(chars)
      setPlayers(
        Object.fromEntries((playerRes.data || []).map((p: { id: string; display_name: string }) => [p.id, p.display_name]))
      )
      setActiveSessions(
        Object.fromEntries((sessRes.data || []).map((s: { character_id: string; session_key: string }) => [s.character_id, s.session_key]))
      )

      if (chars.length > 0) {
        const [specRes, critsRes, refCritsRes] = await Promise.all([
          supabase.from('character_specializations').select('character_id, specialization_key').in('character_id', chars.map(c => c.id)).order('purchase_order'),
          supabase.from('character_critical_injuries').select('character_id').in('character_id', chars.map(c => c.id)).eq('is_healed', false),
          supabase.from('ref_critical_injuries').select('*').order('roll_min'),
        ])
        const specMap: Record<string, string[]> = {}
        for (const row of specRes.data || []) {
          const r = row as { character_id: string; specialization_key: string }
          if (!specMap[r.character_id]) specMap[r.character_id] = []
          specMap[r.character_id].push(r.specialization_key)
        }
        setCharSpecs(specMap)
        const critCounts: Record<string, number> = {}
        for (const row of critsRes.data || []) {
          const r = row as { character_id: string }
          critCounts[r.character_id] = (critCounts[r.character_id] ?? 0) + 1
        }
        setCharActiveCritCounts(critCounts)
        if (refCritsRes.data) setRefCritsDb(refCritsRes.data as RefCriticalInjury[])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  useEffect(() => { loadData() }, [loadData])

  // ── Load award history ──
  const loadAwardHistory = useCallback(async () => {
    if (!campaignId) return
    const { data } = await supabase
      .from('gm_award_log')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (!data) return
    const entries = data as AwardLogEntry[]
    setXpHistory(entries.filter(e => e.type === 'xp'))
    setCreditsHistory(entries.filter(e => e.type === 'credits'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  useEffect(() => { loadAwardHistory() }, [loadAwardHistory])

  // ── Load pending force notifications ──
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('force_notifications')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setForceNotifications(data as ForceNotification[]) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── Load rolled crit requests on mount ──
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('critical_injury_requests')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'rolled')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setRolledCritRequests(data as CriticalInjuryRequest[]) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── Realtime ──
  useEffect(() => {
    if (!campaignId) return
    const channel = supabase
      .channel(`gm-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'characters' }, (payload) => {
        const row = payload.new as Character | undefined
        if (row?.campaign_id === campaignId) loadData(true)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_skills' }, () => loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_talents' }, () => loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_weapons' }, () => loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_armor' }, () => loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_gear' }, () => loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_specializations' }, () => loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_force_abilities' }, () => loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_critical_injuries' }, () => loadData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'critical_injury_requests', filter: `campaign_id=eq.${campaignId}` }, (payload) => {
        const row = payload.new as CriticalInjuryRequest | undefined
        if (!row) return
        if (row.status === 'rolled') {
          setRolledCritRequests(prev => prev.some(r => r.id === row.id) ? prev.map(r => r.id === row.id ? row : r) : [row, ...prev])
        } else if (row.status === 'dismissed') {
          setRolledCritRequests(prev => prev.filter(r => r.id !== row.id))
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'force_notifications', filter: `campaign_id=eq.${campaignId}` }, (payload) => {
        setForceNotifications(prev => [payload.new as ForceNotification, ...prev])
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_sessions', filter: `campaign_id=eq.${campaignId}` }, async () => {
        const { data } = await supabase.from('character_sessions').select('character_id, session_key').eq('campaign_id', campaignId).eq('is_active', true)
        setActiveSessions(Object.fromEntries((data || []).map((s: { character_id: string; session_key: string }) => [s.character_id, s.session_key])))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── Destiny Pool DB subscription ──
  useEffect(() => {
    if (!campaignId) return
    // Load active pool on mount
    supabase.from('destiny_pool').select('*').eq('campaign_id', campaignId).eq('is_active', true).maybeSingle()
      .then(({ data }) => { if (data) setDestinyPoolRecord(data as DestinyPoolRecord) })
    // Subscribe to changes
    const ch = supabase
      .channel(`destiny-pool-gm-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'destiny_pool', filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          const row = payload.new as DestinyPoolRecord
          if (row.is_active) {
            setDestinyPoolRecord(row)
          } else if (destinyPoolRecord?.id === row.id) {
            setDestinyPoolRecord(null)
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── GM spend dark destiny ──
  const handleGmSpendDark = useCallback(async () => {
    if (!destinyPoolRecord || destinyPoolRecord.dark_count < 1) return
    if (!gmSpendConfirm) { setGmSpendConfirm(true); return }
    setGmSpendConfirm(false)
    const prev = { light: destinyPoolRecord.light_count, dark: destinyPoolRecord.dark_count }
    const newLight = prev.light + 1
    const newDark  = prev.dark  - 1
    await supabase.from('destiny_pool').update({ light_count: newLight, dark_count: newDark }).eq('id', destinyPoolRecord.id)
    await supabase.from('destiny_spend_log').insert({
      campaign_id: campaignId, pool_id: destinyPoolRecord.id,
      spent_by: 'GM', side_spent: 'dark',
    })
    // Broadcast flash to all players
    for (const c of characters) {
      sendToChar(c.id, {
        type:           'destiny-gm-spent',
        prevLightCount: prev.light,
        prevDarkCount:  prev.dark,
        newLightCount:  newLight,
        newDarkCount:   newDark,
      })
    }
  }, [destinyPoolRecord, gmSpendConfirm, campaignId, characters, sendToChar, supabase])

  // Sync manual counters when active pool changes
  useEffect(() => {
    setManualLight(destinyPoolRecord?.light_count ?? 0)
    setManualDark(destinyPoolRecord?.dark_count  ?? 0)
  }, [destinyPoolRecord])

  const handleApplyManual = useCallback(async () => {
    if (!campaignId) return
    setManualBusy(true)
    try {
      const { data: existing } = await supabase
        .from('destiny_pool')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .single()
      if (existing) {
        await supabase.from('destiny_pool')
          .update({ light_count: manualLight, dark_count: manualDark })
          .eq('id', existing.id)
      } else {
        await supabase.from('destiny_pool')
          .insert({ campaign_id: campaignId, light_count: manualLight, dark_count: manualDark, session_label: 'Manual', is_active: true })
      }
      setManualAdjustOpen(false)
    } finally {
      setManualBusy(false)
    }
  }, [manualLight, manualDark, campaignId, supabase])

  // ── Destiny Pool ──
  const flipDestinyToken = useCallback(async (idx: number) => {
    const newPool = destinyPool.map((t, i) => i === idx ? (t === 'light' ? 'dark' : 'light') : t) as Array<'light' | 'dark'>
    setDestinyPool(newPool)
    if (!campaignId || !campaign) return
    const settings = (campaign as Campaign & { settings?: Record<string, unknown> }).settings || {}
    await supabase.from('campaigns').update({ settings: { ...settings, destiny_pool: newPool } }).eq('id', campaignId)
  }, [destinyPool, campaignId, campaign, supabase])

  const addDestinyToken = useCallback(async () => {
    const newPool = [...destinyPool, 'light'] as Array<'light' | 'dark'>
    setDestinyPool(newPool)
    if (!campaignId || !campaign) return
    const settings = (campaign as Campaign & { settings?: Record<string, unknown> }).settings || {}
    await supabase.from('campaigns').update({ settings: { ...settings, destiny_pool: newPool } }).eq('id', campaignId)
  }, [destinyPool, campaignId, campaign, supabase])

  const removeDestinyToken = useCallback(async () => {
    if (destinyPool.length === 0) return
    const newPool = destinyPool.slice(0, -1)
    setDestinyPool(newPool)
    if (!campaignId || !campaign) return
    const settings = (campaign as Campaign & { settings?: Record<string, unknown> }).settings || {}
    await supabase.from('campaigns').update({ settings: { ...settings, destiny_pool: newPool } }).eq('id', campaignId)
  }, [destinyPool, campaignId, campaign, supabase])

  // ── XP ──
  const requestXpConfirm = () => {
    const amount = parseInt(xpAmount, 10)
    if (!amount || activeChars.length === 0) return
    if (xpMode === 'individual') {
      if (!xpTarget) return
      const char = characters.find(c => c.id === xpTarget)
      if (!char) return
      setXpConfirm({ amount, reason: xpReason || (amount > 0 ? 'GM grant' : 'GM adjustment'), target: xpTarget, targetName: char.name })
    } else {
      if (amount <= 0) return
      setXpConfirm({ amount, reason: xpReason || 'GM bulk grant' })
    }
  }

  const handleBulkXp = async () => {
    if (!xpConfirm) return
    const { amount, reason } = xpConfirm
    setXpConfirm(null)
    setXpBusy(true)
    try {
      const updates = targetChars.map(c =>
        supabase.from('characters').update({ xp_total: c.xp_total + amount, xp_available: c.xp_available + amount }).eq('id', c.id)
      )
      const transactions = targetChars.map(c =>
        supabase.from('xp_transactions').insert({ character_id: c.id, amount, reason, created_by: 'gm' })
      )
      await Promise.all([...updates, ...transactions])
      setCharacters(prev => prev.map(c => c.is_archived ? c : { ...c, xp_total: c.xp_total + amount, xp_available: c.xp_available + amount }))
      for (const c of activeChars) notify(c.id, 'dialog', `You received ${amount} XP!${reason ? ` Reason: ${reason}` : ''}`)
      const { data: logRow } = await supabase.from('gm_award_log').insert({ campaign_id: campaignId, type: 'xp', amount, mode: 'group', reason, recipient_count: activeChars.length }).select().single()
      if (logRow) setXpHistory(prev => [logRow as AwardLogEntry, ...prev])
      setXpAmount(''); setXpReason('')
      flash(`Granted ${amount} XP to ${activeChars.length} characters`)
    } catch (err: unknown) {
      flashError('Error granting XP: ' + (err instanceof Error ? err.message : String(err)))
    }
    setXpBusy(false)
  }

  const handleIndividualXp = async () => {
    if (!xpConfirm || !xpConfirm.target) return
    const { amount, reason, target } = xpConfirm
    const char = characters.find(c => c.id === target)
    if (!char) return
    setXpConfirm(null)
    setXpBusy(true)
    try {
      await supabase.from('characters').update({ xp_total: char.xp_total + amount, xp_available: char.xp_available + amount }).eq('id', target)
      await supabase.from('xp_transactions').insert({ character_id: target, amount, reason, created_by: 'gm' })
      setCharacters(prev => prev.map(c => c.id === target ? { ...c, xp_total: c.xp_total + amount, xp_available: c.xp_available + amount } : c))
      notify(target, 'dialog', `You ${amount > 0 ? 'received' : 'lost'} ${Math.abs(amount)} XP!${reason ? ` Reason: ${reason}` : ''}`)
      const { data: logRow } = await supabase.from('gm_award_log').insert({ campaign_id: campaignId, type: 'xp', amount, mode: 'individual', target_name: char.name, reason, recipient_count: 1 }).select().single()
      if (logRow) setXpHistory(prev => [logRow as AwardLogEntry, ...prev])
      setXpAmount(''); setXpReason(''); setXpTarget('')
      flash(`${amount > 0 ? 'Granted' : 'Took'} ${Math.abs(amount)} XP ${amount > 0 ? 'to' : 'from'} ${char.name}`)
    } catch (err: unknown) {
      flashError(err instanceof Error ? err.message : String(err))
    }
    setXpBusy(false)
  }

  // ── Credits ──
  const handleBulkCredits = async () => {
    const amount = parseInt(creditsAmount, 10)
    if (!amount || amount <= 0 || targetChars.length === 0) return
    setCreditsBusy(true)
    try {
      await Promise.all(targetChars.map(c => supabase.from('characters').update({ credits: c.credits + amount }).eq('id', c.id)))
      setCharacters(prev => prev.map(c => c.is_archived ? c : { ...c, credits: c.credits + amount }))
      for (const c of targetChars) notify(c.id, 'dialog', `You received ${amount} credits!`)
      const { data: logRow } = await supabase.from('gm_award_log').insert({ campaign_id: campaignId, type: 'credits', amount, mode: 'group', recipient_count: targetChars.length }).select().single()
      if (logRow) setCreditsHistory(prev => [logRow as AwardLogEntry, ...prev])
      setCreditsAmount('')
      flash(`Distributed ${amount} credits to ${targetChars.length} characters`)
    } catch (err: unknown) {
      flashError('Error distributing credits: ' + (err instanceof Error ? err.message : String(err)))
    }
    setCreditsBusy(false)
  }

  const handleIndividualCredits = async () => {
    const amount = parseInt(creditsAmount, 10)
    if (!amount || !creditsTarget) return
    const char = characters.find(c => c.id === creditsTarget)
    if (!char) return
    setCreditsBusy(true)
    try {
      await supabase.from('characters').update({ credits: char.credits + amount }).eq('id', creditsTarget)
      setCharacters(prev => prev.map(c => c.id === creditsTarget ? { ...c, credits: c.credits + amount } : c))
      notify(creditsTarget, 'dialog', `You ${amount > 0 ? 'received' : 'lost'} ${Math.abs(amount)} credits!`)
      const { data: logRow } = await supabase.from('gm_award_log').insert({ campaign_id: campaignId, type: 'credits', amount, mode: 'individual', target_name: char.name, recipient_count: 1 }).select().single()
      if (logRow) setCreditsHistory(prev => [logRow as AwardLogEntry, ...prev])
      setCreditsAmount(''); setCreditsTarget('')
      flash(`${amount > 0 ? 'Gave' : 'Took'} ${Math.abs(amount)} credits ${amount > 0 ? 'to' : 'from'} ${char.name}`)
    } catch (err: unknown) {
      flashError(err instanceof Error ? err.message : String(err))
    }
    setCreditsBusy(false)
  }

  // ── Duty/Obligation ──
  const getODValue = (c: Character, type: 'obligation' | 'duty') =>
    type === 'obligation' ? (c.obligation_value || 0) : (c.duty_value || 0)

  const adjustObligation = async (charId: string, delta: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const next = Math.max(0, (char.obligation_value || 0) + delta)
    await supabase.from('characters').update({ obligation_value: next }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, obligation_value: next } : c))
    notify(charId, 'toast', `Obligation ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`)
  }

  const adjustDuty = async (charId: string, delta: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const next = Math.max(0, (char.duty_value || 0) + delta)
    await supabase.from('characters').update({ duty_value: next }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, duty_value: next } : c))
    notify(charId, 'toast', `Duty ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`)
  }

  const adjustMorality = async (charId: string, delta: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const next = Math.min(100, Math.max(0, (char.morality_value ?? 50) + delta))
    await supabase.from('characters').update({ morality_value: next }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, morality_value: next } : c))
    notify(charId, 'toast', `Morality ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`)
  }

  const openMoralitySetup = useCallback((c: Character) => {
    setMoralitySetup({
      id:          c.id,
      name:        c.name,
      score:       c.morality_value ?? 50,
      strengthKey: c.morality_strength_key ?? '',
      weaknessKey: c.morality_weakness_key ?? '',
      strengthDesc: '',
      weaknessDesc: '',
    })
  }, [])

  const handleMoralitySave = useCallback(async () => {
    if (!moralitySetup) return
    setMoralityBusy(true)
    const { id, name, score, strengthKey, weaknessKey } = moralitySetup
    const update: Partial<Character> = {
      morality_value:        Math.min(100, Math.max(1, score)),
      morality_strength_key: strengthKey || undefined,
      morality_weakness_key: weaknessKey || undefined,
      morality_configured:   true,
    }
    await supabase.from('characters').update(update).eq('id', id)
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...update } : c))
    flash(`Morality configured for ${name}.`)
    setMoralitySetup(null)
    setMoralityBusy(false)
  }, [moralitySetup, supabase, flash])

  const handleBulkOD = async () => {
    const amount = parseInt(odAmount, 10)
    if (!amount || activeChars.length === 0) return
    setOdBusy(true)
    const field = odType === 'obligation' ? 'obligation_value' : 'duty_value'
    const label = odType === 'obligation' ? 'Obligation' : 'Duty'
    try {
      await Promise.all(targetChars.map(c => {
        const current = getODValue(c, odType)
        return supabase.from('characters').update({ [field]: Math.max(0, current + amount) }).eq('id', c.id)
      }))
      setCharacters(prev => prev.map(c => c.is_archived ? c : { ...c, [field]: Math.max(0, getODValue(c, odType) + amount) }))
      for (const c of targetChars) notify(c.id, 'toast', `${label} ${amount > 0 ? 'increased' : 'decreased'} by ${Math.abs(amount)}`)
      setOdAmount('')
      flash(`${amount > 0 ? 'Added' : 'Reduced'} ${Math.abs(amount)} ${label} for ${targetChars.length} characters`)
    } catch (err: unknown) {
      flashError(err instanceof Error ? err.message : String(err))
    }
    setOdBusy(false)
  }

  const handleIndividualOD = async () => {
    const amount = parseInt(odAmount, 10)
    if (!amount || !odTarget) return
    const char = characters.find(c => c.id === odTarget)
    if (!char) return
    setOdBusy(true)
    const field = odType === 'obligation' ? 'obligation_value' : 'duty_value'
    const label = odType === 'obligation' ? 'Obligation' : 'Duty'
    const current = getODValue(char, odType)
    try {
      await supabase.from('characters').update({ [field]: Math.max(0, current + amount) }).eq('id', odTarget)
      setCharacters(prev => prev.map(c => c.id === odTarget ? { ...c, [field]: Math.max(0, current + amount) } : c))
      notify(odTarget, 'toast', `${label} ${amount > 0 ? 'increased' : 'decreased'} by ${Math.abs(amount)}`)
      setOdAmount(''); setOdTarget('')
      flash(`${amount > 0 ? 'Added' : 'Reduced'} ${Math.abs(amount)} ${label} for ${char.name}`)
    } catch (err: unknown) {
      flashError(err instanceof Error ? err.message : String(err))
    }
    setOdBusy(false)
  }

  // ── Session Mode ──
  // Push combat state to all player screens via broadcast (more reliable than postgres_changes)
  const broadcastCombatState = useCallback((mode: 'combat' | 'exploration', round: number) => {
    for (const c of characters) {
      const ch = gmChannelsRef.current.get(c.id)
      if (ch) ch.send({ type: 'broadcast', event: 'gm-action', payload: { type: 'combat-state', mode, round } })
    }
  }, [characters])

  const beginCombat = async () => {
    if (!campaignId) return
    setSessionBusy(true)
    const round = 1
    await supabase.from('campaigns').update({ session_mode: 'combat', combat_round: round, mode_changed_at: new Date().toISOString() }).eq('id', campaignId)
    setSessionMode('combat')
    setCombatRound(round)
    broadcastCombatState('combat', round)
    setSessionBusy(false)
    toast('Combat initiated — players notified.')
  }

  const endEncounter = async () => {
    if (!campaignId) return
    setSessionBusy(true)
    await supabase.from('campaigns').update({ session_mode: 'exploration', combat_round: 0, mode_changed_at: new Date().toISOString() }).eq('id', campaignId)
    setSessionMode('exploration')
    setCombatRound(1)
    broadcastCombatState('exploration', 0)
    setSessionBusy(false)
    toast('Encounter ended — exploration mode.')
  }

  const changeRound = async (delta: number) => {
    if (!campaignId || sessionMode !== 'combat') return
    const next = Math.max(1, combatRound + delta)
    await supabase.from('campaigns').update({ combat_round: next }).eq('id', campaignId)
    setCombatRound(next)
    broadcastCombatState('combat', next)
  }

  // ── Critical Injury Request Helpers ──
  const sendCritRequest = useCallback(async (charId: string) => {
    if (!campaignId) return
    setCritReqBusy(true)
    const existingCount = charActiveCritCounts[charId] ?? 0
    const existingMod = existingCount * 10
    const total = existingMod + critReqVicious * 10 + critReqLethal * 10 + critReqGm
    await supabase.from('critical_injury_requests').insert({
      campaign_id:   campaignId,
      character_id:  charId,
      total_modifier:total,
      vicious_mod:   critReqVicious * 10,
      lethal_mod:    critReqLethal * 10,
      gm_modifier:   critReqGm,
      existing_mod:  existingMod,
      status:       'pending',
    })
    flash(`Critical injury roll requested!`)
    setCritReqOpenFor(null)
    setCritReqVicious(0)
    setCritReqLethal(0)
    setCritReqGm(0)
    setCritReqBusy(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, charActiveCritCounts, critReqVicious, critReqLethal, critReqGm])

  const confirmCritResult = useCallback(async (req: CriticalInjuryRequest) => {
    const customName = critCustomNames[req.id]?.trim()
    if (customName) {
      const { data } = await supabase.from('character_critical_injuries')
        .select('id')
        .eq('character_id', req.character_id)
        .eq('total_roll', req.final_result)
        .order('received_at', { ascending: false })
        .limit(1)
      if (data?.[0]) {
        await supabase.from('character_critical_injuries').update({ custom_name: customName }).eq('id', (data[0] as { id: string }).id)
      }
    }
    await supabase.from('critical_injury_requests').update({ status: 'dismissed', resolved_at: new Date().toISOString() }).eq('id', req.id)
    setRolledCritRequests(prev => prev.filter(r => r.id !== req.id))
    setCritCustomNames(prev => { const n = { ...prev }; delete n[req.id]; return n })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [critCustomNames])

  const cancelCritResult = useCallback(async (req: CriticalInjuryRequest) => {
    const { data } = await supabase.from('character_critical_injuries')
      .select('id')
      .eq('character_id', req.character_id)
      .eq('total_roll', req.final_result)
      .order('received_at', { ascending: false })
      .limit(1)
    if (data?.[0]) {
      await supabase.from('character_critical_injuries').delete().eq('id', (data[0] as { id: string }).id)
      setCharActiveCritCounts(prev => ({ ...prev, [req.character_id]: Math.max(0, (prev[req.character_id] ?? 1) - 1) }))
    }
    await supabase.from('critical_injury_requests').update({ status: 'dismissed', resolved_at: new Date().toISOString() }).eq('id', req.id)
    setRolledCritRequests(prev => prev.filter(r => r.id !== req.id))
    setCritCustomNames(prev => { const n = { ...prev }; delete n[req.id]; return n })
    flash('Critical injury cancelled.')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const overrideCritResult = useCallback(async (req: CriticalInjuryRequest, injuryId: number) => {
    const injury = refCritsDb.find(r => r.id === injuryId)
    if (!injury) return
    // Update the character_critical_injuries row that was just inserted
    // Find it by character_id + total_roll match (best proxy we have)
    const { data } = await supabase.from('character_critical_injuries')
      .select('id')
      .eq('character_id', req.character_id)
      .eq('total_roll', req.final_result)
      .order('received_at', { ascending: false })
      .limit(1)
    if (data?.[0]) {
      const customName = critCustomNames[req.id]?.trim()
      await supabase.from('character_critical_injuries').update({
        injury_id:   injury.id,
        custom_name: customName || injury.name,
        severity:    injury.severity,
        description: injury.description,
      }).eq('id', (data[0] as { id: string }).id)
    }
    await supabase.from('critical_injury_requests').update({ injury_key: injuryId, status: 'dismissed', resolved_at: new Date().toISOString() }).eq('id', req.id)
    setRolledCritRequests(prev => prev.filter(r => r.id !== req.id))
    setCritCustomNames(prev => { const n = { ...prev }; delete n[req.id]; return n })
    flash('Critical injury result overridden.')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refCritsDb, critCustomNames])

  const healCrit = useCallback(async (critId: string, charId: string) => {
    await supabase.from('character_critical_injuries').update({ is_healed: true }).eq('id', critId)
    setCharActiveCritCounts(prev => ({ ...prev, [charId]: Math.max(0, (prev[charId] ?? 1) - 1) }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Wound/Strain Helpers ──
  const addWound = async (charId: string, amount: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newVal = Math.min(char.wound_threshold, char.wound_current + amount)
    await supabase.from('characters').update({ wound_current: newVal }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, wound_current: newVal } : c))
    notify(charId, 'toast', `You suffered ${amount} wound${amount !== 1 ? 's' : ''}!`)
  }

  const healWounds = async (charId: string, amount: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newVal = Math.max(0, char.wound_current - amount)
    await supabase.from('characters').update({ wound_current: newVal }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, wound_current: newVal } : c))
    notify(charId, 'toast', `You healed ${amount} wound${amount !== 1 ? 's' : ''}!`)
  }

  const addStrain = async (charId: string, amount: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newVal = Math.min(char.strain_threshold, char.strain_current + amount)
    await supabase.from('characters').update({ strain_current: newVal }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, strain_current: newVal } : c))
    notify(charId, 'toast', `You suffered ${amount} strain!`)
  }

  const healStrain = async (charId: string, amount: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newVal = Math.max(0, char.strain_current - amount)
    await supabase.from('characters').update({ strain_current: newVal }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, strain_current: newVal } : c))
    notify(charId, 'toast', `You recovered ${amount} strain!`)
  }

  // ── Force logout ──
  const forceLogout = useCallback(async (charId: string) => {
    sendToChar(charId, { type: 'force-logout' })
    const sessionKey = activeSessions[charId]
    if (sessionKey && campaignId) {
      await supabase.from('character_sessions').delete().eq('session_key', sessionKey).eq('campaign_id', campaignId)
    }
    flash('Player kicked')
  }, [activeSessions, campaignId, sendToChar, supabase, flash])

  const releaseAllSessions = useCallback(async () => {
    if (!campaignId) return
    // Broadcast force-logout to every online character
    activeChars.forEach(c => sendToChar(c.id, { type: 'force-logout' }))
    await supabase.from('character_sessions').delete().eq('campaign_id', campaignId)
    setActiveSessions({})
    flash('All sessions released')
  }, [campaignId, characters, sendToChar, supabase, flash])

  // ── Archive / Restore ──
  const handleArchive = useCallback(async () => {
    if (!archiveConfirm) return
    setArchiveBusy(true)
    try {
      sendToChar(archiveConfirm.id, { type: 'force-logout' })
      await archiveCharacter(archiveConfirm.id)
      // Remove from combat tracker so archived character doesn't linger in active encounters
      if (campaignId) {
        await supabase.from('combat_participants')
          .delete()
          .eq('character_id', archiveConfirm.id)
          .eq('campaign_id', campaignId)
      }
      setCharacters(prev => prev.map(c =>
        c.id === archiveConfirm.id ? { ...c, is_archived: true, archived_at: new Date().toISOString() } : c
      ))
      flash(`${archiveConfirm.name} archived`)
    } catch (err: unknown) {
      flashError('Archive failed: ' + (err instanceof Error ? err.message : String(err)))
    }
    setArchiveConfirm(null)
    setArchiveBusy(false)
  }, [archiveConfirm, campaignId, supabase, sendToChar, flash, flashError])

  const handleFallenToggle = useCallback(async () => {
    if (!fallenConfirm) return
    setFallenBusy(true)
    const { id, name, isFallen } = fallenConfirm
    try {
      const update = isFallen
        ? { is_dark_side_fallen: false, redeemed_at: new Date().toISOString() }
        : { is_dark_side_fallen: true,  dark_side_fallen_at: new Date().toISOString() }
      await supabase.from('characters').update(update).eq('id', id)
      setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...update } : c))
      flash(isFallen ? `${name} has been redeemed.` : `${name} has fallen to the Dark Side.`)
    } catch (err: unknown) {
      flashError('Update failed: ' + (err instanceof Error ? err.message : String(err)))
    }
    setFallenConfirm(null)
    setFallenBusy(false)
  }, [fallenConfirm, supabase, flash, flashError])

  const handleRestore = useCallback(async (charId: string, charName: string) => {
    try {
      await restoreCharacter(charId)
      setCharacters(prev => prev.map(c =>
        c.id === charId ? { ...c, is_archived: false, archived_at: undefined } : c
      ))
      flash(`${charName} restored`)
    } catch (err: unknown) {
      flashError('Restore failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }, [flash, flashError])

  // ── Helpers ──
  const charById = (id: string) => characters.find(c => c.id === id)

  // ── Loading / Error ──
  if (loading) return <HolocronLoader />

  if (error || !campaign) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: BG, gap: 16,
      }}>
        <div style={{ fontFamily: FR, color: RED, fontSize: FS_H4 }}>
          {error || 'Campaign not found'}
        </div>
        <button onClick={() => router.push('/')} style={btnPrimary}>
          Return Home
        </button>
      </div>
    )
  }

  // ══════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: BG, display: 'flex', flexDirection: 'column' }}>

      {/* Background: scanlines */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
      }} />
      {/* Background: hex grid SVG */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.04 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hex" x="0" y="0" width="56" height="64" patternUnits="userSpaceOnUse">
              <polygon points="28,2 54,16 54,48 28,62 2,48 2,16" fill="none" stroke={GOLD} strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex)" />
        </svg>
      </div>

      {/* ── TOP BAR ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(4,9,6,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, height: 56, flexShrink: 0,
      }}>
        {/* HOLOCRON wordmark */}
        <span style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: GOLD, letterSpacing: '0.15em', textShadow: `0 0 20px rgba(200,170,80,0.5)` }}>
          HOLOCRON
        </span>
        {/* Divider */}
        <div style={{ width: 1, height: 28, background: BORDER }} />
        {/* Campaign name */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: FC, fontSize: FS_SM, color: TEXT }}>{campaign.name}</span>
          <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.08em' }}>· GM Dashboard</span>
        </div>
        {/* GM badge */}
        <div style={{
          background: 'rgba(200,170,80,0.1)', border: `1px solid rgba(200,170,80,0.35)`,
          borderRadius: 3, padding: '2px 8px',
          fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.18em', color: GOLD,
        }}>
          GM
        </div>
        {/* Spacer */}
        <div style={{ flex: 1 }} />
        {/* Online count */}
        <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, letterSpacing: '0.1em' }}>
          {characters.length} PLAYERS
        </span>
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          style={{ background: 'transparent', border: `1px solid rgba(200,170,80,0.25)`, padding: '5px 14px', fontFamily: FR, fontSize: FS_CAPTION, color: DIM, cursor: 'pointer', borderRadius: 3 }}
        >
          ← Back to Lobby
        </button>
      </div>

      {/* ── MODE BAR ── */}
      <div style={{
        position: 'relative', zIndex: 9,
        background: 'rgba(4,9,6,0.88)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        borderBottom: `1px solid rgba(200,170,80,0.1)`,
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, height: 48, flexShrink: 0,
      }}>
        {/* Mode toggle pill */}
        <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden', border: `1px solid rgba(200,170,80,0.2)` }}>
          <button
            onClick={beginCombat}
            disabled={sessionBusy}
            style={{
              padding: '4px 14px', fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 600,
              letterSpacing: '0.1em', cursor: 'pointer', border: 'none', transition: '.15s',
              background: sessionMode === 'exploration' ? 'rgba(78,200,122,0.12)' : 'transparent',
              color: sessionMode === 'exploration' ? GREEN : DIM,
            }}
          >
            ◈ Exploration
          </button>
          <button
            onClick={endEncounter}
            disabled={sessionBusy}
            style={{
              padding: '4px 14px', fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 600,
              letterSpacing: '0.1em', cursor: 'pointer', border: 'none', transition: '.15s',
              background: sessionMode === 'combat' ? 'rgba(224,80,80,0.12)' : 'transparent',
              color: sessionMode === 'combat' ? RED : DIM,
              boxShadow: sessionMode === 'combat' ? 'inset 0 0 8px rgba(224,80,80,0.15)' : 'none',
            }}
          >
            ⚔ Combat
          </button>
        </div>

        {/* Round counter (combat mode only) */}
        {sessionMode === 'combat' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => changeRound(-1)}
              disabled={combatRound <= 1 || sessionBusy}
              style={{ ...btnSmall, padding: '3px 10px', opacity: combatRound <= 1 ? 0.4 : 1 }}
            >
              −
            </button>
            <span style={{
              fontFamily: FC, fontSize: FS_H3, color: RED, minWidth: 60, textAlign: 'center',
              textShadow: '0 0 12px #E05050',
            }}>
              {combatRound}
            </span>
            <button onClick={() => changeRound(1)} disabled={sessionBusy} style={{ ...btnSmall, padding: '3px 10px' }}>+</button>
            <button
              onClick={endEncounter}
              disabled={sessionBusy}
              style={{ border: '1px solid rgba(224,80,80,0.4)', background: 'rgba(224,80,80,0.1)', color: RED, fontFamily: FR, fontSize: FS_CAPTION, letterSpacing: '0.1em', padding: '4px 10px', cursor: 'pointer', borderRadius: 3 }}
            >
              End Encounter
            </button>
          </div>
        )}

        {/* ◉ Staging tab shortcut — toggles staging view on/off */}
        <button
          onClick={() => {
            if (activeTab === 'staging') {
              // return to the last tools tab; persist it so the dashboard remembers
              setActiveTab(prevToolsTab.current)
              localStorage.setItem(GM_TAB_KEY, prevToolsTab.current)
            } else {
              // remember current tools tab before entering staging; do NOT persist 'staging' to storage
              prevToolsTab.current = activeTab
              setActiveTab('staging')
            }
          }}
          style={{
            fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '5px 14px', border: 'none', cursor: 'pointer',
            borderRadius: 4, transition: '.15s',
            background: activeTab === 'staging' ? 'rgba(82,200,160,0.15)' : 'transparent',
            color: activeTab === 'staging' ? '#52C8A0' : DIM,
            outline: activeTab === 'staging' ? '1px solid rgba(82,200,160,0.4)' : 'none',
          }}
        >
          ◉ Staging
        </button>

        {/* Destiny Pool — single horizontal bar */}
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', maxHeight: 48, overflow: 'hidden' }}>

          {/* Label */}
          <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: BLUE, letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>Destiny</span>

          {/* Token display — flex: 1, collapses to muted text when no pool */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {destinyPoolRecord ? (
              <>
                <DestinyPoolDisplay
                  poolRecord={destinyPoolRecord}
                  isGm={true}
                  onClickDark={handleGmSpendDark}
                  compact
                />
                {gmSpendConfirm && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 8px', background: 'rgba(139,43,226,0.12)', border: '1px solid rgba(139,43,226,0.35)', borderRadius: 4, flexShrink: 0 }}>
                    <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: '#B070D8' }}>Spend dark?</span>
                    <button onClick={handleGmSpendDark} style={{ ...btnSmall, padding: '1px 6px', fontSize: FS_CAPTION, color: '#B070D8', border: '1px solid rgba(139,43,226,0.4)' }}>Spend</button>
                    <button onClick={() => setGmSpendConfirm(false)} style={{ ...btnSmall, padding: '1px 5px', fontSize: FS_CAPTION }}>✕</button>
                  </div>
                )}
              </>
            ) : (
              <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, whiteSpace: 'nowrap' }}>No active pool</span>
            )}
          </div>

          {/* Actions — always inline, never stack */}
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => setDestinyGenerateOpen(true)}
              style={{ ...btnSmall, height: 32, padding: '0 10px', fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)', color: GOLD, border: `1px solid rgba(200,170,80,0.35)`, whiteSpace: 'nowrap' }}
            >
              ◈ Generate
            </button>
            <button
              onClick={() => setManualAdjustOpen(true)}
              style={{ ...btnSmall, height: 32, padding: '0 10px', fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)', color: 'rgba(200,170,80,0.5)', border: '1px solid rgba(200,170,80,0.25)', whiteSpace: 'nowrap' }}
            >
              ✎ Adjust
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', position: 'relative', zIndex: 1 }}>

        {/* ── FULL-SCREEN STAGING VIEW ── */}
        {activeTab === 'staging' && (
          <>
            <GmMapView
              campaignId={campaignId}
              characters={activeChars}
              allMaps={allMaps}
              activeMap={activeMap}
              onDeleteMap={removeMap}
              isStagingTab={true}
              stagingLibraryOpen={mapLibraryOpen}
              onStagingLibraryClose={() => setMapLibraryOpen(false)}
            />
            <StagingTopBar
              sessionMode={sessionMode}
              sessionBusy={sessionBusy}
              combatRound={combatRound}
              onBeginCombat={beginCombat}
              onEndCombat={endEncounter}
            />
            <StagingFloatingToolbar
              campaignId={campaignId ?? ''}
              sessionMode={sessionMode}
              mapId={activeMap?.id ?? null}
              characters={activeChars}
              mapsLibraryOpen={mapLibraryOpen}
              onMapsClick={() => setMapLibraryOpen(o => !o)}
            />
          </>
        )}

        {/* ── LEFT / CENTER CONTENT + RIGHT SIDEBAR ── */}
        {activeTab !== 'staging' && (<>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── CRITICAL INJURY RESULTS ── */}
          {rolledCritRequests.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rolledCritRequests.map(req => {
                const charName = characters.find(c => c.id === req.character_id)?.name ?? 'Unknown'
                const injury = req.injury_key != null ? refCritsDb.find(r => r.id === req.injury_key) : null
                return (
                  <div key={req.id} style={{
                    ...panelBase,
                    padding: 12,
                    borderLeft: '3px solid rgba(220,20,60,0.6)',
                  }}>
                    <CornerBrackets />
                    <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: RED, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                      ⚡ Crit Injury Result — {charName}
                    </div>
                    <div style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT, marginBottom: 6 }}>
                      Roll: <span style={{ color: GOLD, fontFamily: "'Share Tech Mono',monospace" }}>{req.roll_result}</span>
                      {(req.total_modifier ?? 0) > 0 && <> + <span style={{ color: RED }}>{req.total_modifier}</span></>}
                      {' = '}
                      <span style={{ color: GOLD, fontFamily: "'Share Tech Mono',monospace", fontWeight: 700 }}>{req.final_result}</span>
                    </div>
                    {injury && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontFamily: FC, fontSize: FS_SM, color: RED, fontWeight: 700 }}>{injury.name}</span>
                        {' '}
                        <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>({injury.severity})</span>
                        {injury.description && (
                          <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 3, lineHeight: 1.4 }}>{injury.description}</div>
                        )}
                      </div>
                    )}
                    <div style={{ marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Custom injury name (optional)"
                        value={critCustomNames[req.id] ?? ''}
                        onChange={e => setCritCustomNames(prev => ({ ...prev, [req.id]: e.target.value }))}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: 'rgba(8,16,10,0.6)', border: `1px solid rgba(200,170,80,0.2)`,
                          borderRadius: 3, padding: '4px 8px',
                          fontFamily: FR, fontSize: FS_CAPTION, color: TEXT,
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => cancelCritResult(req)}
                        style={{ ...btnSmall, flex: 1, color: RED, borderColor: 'rgba(220,20,60,0.3)' }}
                      >
                        ✕ Cancel
                      </button>
                      <button
                        onClick={() => confirmCritResult(req)}
                        style={{ ...btnSmall, flex: 1, color: GREEN, borderColor: 'rgba(78,200,122,0.3)' }}
                      >
                        ✓ Confirm
                      </button>
                      <OverrideCritSelect
                        refCrits={refCritsDb}
                        onOverride={(injId) => overrideCritResult(req, injId)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── PARTY OVERVIEW ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{
                fontFamily: "'Cinzel','Rajdhani',sans-serif",
                fontSize: 'clamp(0.7rem, 0.95vw, 0.85rem)',
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: GOLD,
              }}>
                Player Characters
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {Object.keys(activeSessions).length > 0 && (
                  <button
                    onClick={releaseAllSessions}
                    style={{ background: 'transparent', border: `1px solid rgba(224,80,80,0.4)`, borderRadius: 3, padding: '3px 10px', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.08em', color: RED, textTransform: 'uppercase', whiteSpace: 'nowrap' }}
                  >
                    ⏻ Release All Sessions
                  </button>
                )}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 10,
            }}>
              {targetChars.map(c => {
                const cardAccent = GOLD
                const isIncap = c.wound_current >= c.wound_threshold
                const isStrainHigh = c.strain_current > c.strain_threshold * 0.75
                const leftBorderColor = isIncap ? RED : isStrainHigh ? CYAN : 'transparent'
                const wPct = Math.min(100, (c.wound_current / c.wound_threshold) * 100)
                const sPct = Math.min(100, (c.strain_current / c.strain_threshold) * 100)
                const wColor = wPct >= 100 ? RED : wPct >= 75 ? ORANGE : GREEN
                const sColor = sPct >= 100 ? RED : sPct >= 75 ? CYAN : '#60C8E0'
                const playerName = players[c.player_id] || ''

                return (
                  <div
                    key={c.id}
                    style={{
                      ...panelBase,
                      padding: 12,
                      borderLeft: `3px solid ${leftBorderColor}`,
                      boxShadow: isIncap ? '0 0 12px rgba(224,80,80,0.2)' : undefined,
                    }}
                  >
                    <CornerBrackets />

                    {/* Header: avatar + info */}
                    <div
                      onClick={() => router.push(`/character/${c.id}?gm=1&campaign=${campaignId}`)}
                      style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, cursor: 'pointer' }}
                    >
                      {c.portrait_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.portrait_url}
                          alt={c.name}
                          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(200,170,80,0.35)', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: `${cardAccent}14`, border: `1.5px solid ${cardAccent}55`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: FC, fontSize: FS_SM, color: cardAccent, flexShrink: 0,
                        }}>
                          {c.name.charAt(0)}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.name}
                        </div>
                        <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 600, color: DIM, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>
                          {c.species_key} · {c.career_key}
                        </div>
                        {playerName && (
                          <div style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 600, color: GOLD_DIM, marginTop: 1 }}>{playerName}</div>
                        )}
                      </div>
                    </div>

                    {/* Dark Side badge */}
                    {c.is_dark_side_fallen && (
                      <div style={{ marginBottom: 6 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '2px 7px',
                          background: 'rgba(139,43,226,0.12)',
                          border: '1px solid rgba(139,43,226,0.4)',
                          borderRadius: 4,
                          fontFamily: "'Share Tech Mono','Courier New',monospace",
                          fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.12em',
                          color: 'rgba(139,43,226,0.8)',
                        }}>
                          ☠ DARK SIDE
                        </span>
                      </div>
                    )}

                    {/* Wound bar */}
                    <div style={{ marginBottom: 5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 600, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase' }}>WOUNDS</span>
                        <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: c.wound_current >= c.wound_threshold ? RED : DIM }}>
                          {c.wound_current}/{c.wound_threshold}
                        </span>
                      </div>
                      <div style={{ height: 7, background: FAINT, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${wPct}%`, background: wColor, boxShadow: `0 0 4px ${wColor}60`, transition: '.3s', borderRadius: 2 }} />
                      </div>
                    </div>

                    {/* Strain bar */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 600, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase' }}>STRAIN</span>
                        <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: c.strain_current >= c.strain_threshold ? RED : DIM }}>
                          {c.strain_current}/{c.strain_threshold}
                        </span>
                      </div>
                      <div style={{ height: 7, background: FAINT, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${sPct}%`, background: sColor, boxShadow: `0 0 4px ${sColor}60`, transition: '.3s', borderRadius: 2 }} />
                      </div>
                    </div>

                    {/* Action buttons 2x2 grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      <button
                        onClick={() => addWound(c.id, 1)}
                        style={{ background: 'rgba(224,80,80,0.12)', border: '1px solid rgba(224,80,80,0.3)', borderRadius: 3, padding: '3px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.06em', color: RED }}
                      >W +1</button>
                      <button
                        onClick={() => healWounds(c.id, 1)}
                        style={{ background: 'rgba(78,200,122,0.12)', border: '1px solid rgba(78,200,122,0.3)', borderRadius: 3, padding: '3px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.06em', color: GREEN }}
                      >W −1</button>
                      <button
                        onClick={() => addStrain(c.id, 1)}
                        style={{ background: 'rgba(96,200,224,0.12)', border: '1px solid rgba(96,200,224,0.3)', borderRadius: 3, padding: '3px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.06em', color: CYAN }}
                      >S +1</button>
                      <button
                        onClick={() => healStrain(c.id, 1)}
                        style={{ background: 'rgba(200,170,80,0.10)', border: '1px solid rgba(200,170,80,0.3)', borderRadius: 3, padding: '3px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.06em', color: GOLD }}
                      >S −1</button>
                    </div>


                    {/* Obligation / Duty / Morality */}
                    {(c.obligation_type || c.duty_type || c.morality_value !== undefined) && (
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5, borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>

                        {c.obligation_type && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Obl </span>
                              <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM }}>{c.obligation_custom_name || obligationTypes.find(o => o.key === c.obligation_type)?.name || c.obligation_type}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                              <button onClick={() => adjustObligation(c.id, -1)} style={{ background: 'rgba(224,80,80,0.10)', border: '1px solid rgba(224,80,80,0.25)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: RED, lineHeight: 1, padding: 0 }}>−</button>
                              <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: (c.obligation_value || 0) > 0 ? ORANGE : DIM, minWidth: 20, textAlign: 'center' }}>{c.obligation_value || 0}</span>
                              <button onClick={() => adjustObligation(c.id, 1)} style={{ background: 'rgba(224,120,85,0.10)', border: '1px solid rgba(224,120,85,0.25)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: ORANGE, lineHeight: 1, padding: 0 }}>+</button>
                            </div>
                          </div>
                        )}

                        {c.duty_type && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Duty </span>
                              <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM }}>{c.duty_custom_name || dutyTypes.find(d => d.key === c.duty_type)?.name || c.duty_type}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                              <button onClick={() => adjustDuty(c.id, -1)} style={{ background: 'rgba(78,200,122,0.08)', border: '1px solid rgba(78,200,122,0.2)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: GREEN, lineHeight: 1, padding: 0 }}>−</button>
                              <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: (c.duty_value || 0) > 0 ? GREEN : DIM, minWidth: 20, textAlign: 'center' }}>{c.duty_value || 0}</span>
                              <button onClick={() => adjustDuty(c.id, 1)} style={{ background: 'rgba(78,200,122,0.08)', border: '1px solid rgba(78,200,122,0.2)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: GREEN, lineHeight: 1, padding: 0 }}>+</button>
                            </div>
                          </div>
                        )}

                        {c.morality_value !== undefined && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Morality</span>
                                  {(c.force_rating ?? 0) >= 1 && c.morality_configured && (
                                    <button
                                      onClick={() => openMoralitySetup(c)}
                                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: BLUE, padding: 0, opacity: 0.7 }}
                                    >
                                      Edit
                                    </button>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <button onClick={() => adjustMorality(c.id, -1)} style={{ background: 'rgba(224,80,80,0.10)', border: '1px solid rgba(224,80,80,0.25)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: RED, lineHeight: 1, padding: 0 }}>−</button>
                                  <span style={{ fontFamily: FR, fontSize: FS_LABEL, fontWeight: 700, color: (c.morality_value ?? 50) >= 50 ? BLUE : RED, minWidth: 24, textAlign: 'center' }}>{c.morality_value ?? 50}</span>
                                  <button onClick={() => adjustMorality(c.id, 1)} style={{ background: 'rgba(90,170,224,0.10)', border: '1px solid rgba(90,170,224,0.25)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE, color: BLUE, lineHeight: 1, padding: 0 }}>+</button>
                                </div>
                              </div>
                              <div style={{ height: 4, background: FAINT, borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%', borderRadius: 2, transition: '.3s',
                                  width: `${c.morality_value ?? 50}%`,
                                  background: `linear-gradient(90deg, ${RED}, #4EC87A 60%, ${BLUE})`,
                                }} />
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                    {/* XP / Credits footer */}
                    <div style={{ marginTop: 6, fontFamily: FR, fontSize: FS_LABEL, fontWeight: 600, textTransform: 'uppercase', color: GOLD_DIM, textAlign: 'center' }}>
                      {c.xp_available} XP · {c.credits} cr
                    </div>

                    {/* Morality config banner — Force-sensitive, not yet configured */}
                    {(c.force_rating ?? 0) >= 1 && !c.morality_configured && (
                      <div style={{
                        marginTop: 6, padding: '6px 10px',
                        background: 'rgba(90,170,224,0.06)',
                        border: '1px solid rgba(90,170,224,0.25)',
                        borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                      }}>
                        <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: 'rgba(90,170,224,0.7)', lineHeight: 1.4 }}>
                          ⚠ Morality not yet configured
                        </span>
                        <button
                          onClick={() => openMoralitySetup(c)}
                          style={{
                            background: 'rgba(90,170,224,0.12)',
                            border: '1px solid rgba(90,170,224,0.35)',
                            borderRadius: 4, padding: '2px 10px', cursor: 'pointer',
                            fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700,
                            color: BLUE, whiteSpace: 'nowrap', flexShrink: 0,
                          }}
                        >
                          Configure Now
                        </button>
                      </div>
                    )}

                    {/* Dark Side Fall / Redemption — Force-sensitive only */}
                    {(c.force_rating ?? 0) >= 1 && (
                      <div style={{ marginTop: 6 }}>
                        {!c.is_dark_side_fallen ? (
                          <button
                            onClick={() => setFallenConfirm({ id: c.id, name: c.name, isFallen: false, morality: c.morality_value })}
                            style={{
                              width: '100%',
                              background: 'rgba(139,43,226,0.06)',
                              border: '1px solid rgba(139,43,226,0.4)',
                              borderRadius: 8, padding: '4px 0', cursor: 'pointer',
                              fontFamily: FR, fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
                              fontWeight: 700, letterSpacing: '0.05em',
                              color: 'rgba(139,43,226,0.8)', transition: '.15s',
                            }}
                          >
                            ☠ Declare: Fallen to the Dark Side
                          </button>
                        ) : (
                          <button
                            onClick={() => setFallenConfirm({ id: c.id, name: c.name, isFallen: true })}
                            style={{
                              width: '100%',
                              background: 'rgba(126,200,227,0.06)',
                              border: '1px solid rgba(126,200,227,0.4)',
                              borderRadius: 8, padding: '4px 0', cursor: 'pointer',
                              fontFamily: FR, fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
                              fontWeight: 700, letterSpacing: '0.05em',
                              color: '#7EC8E3', transition: '.15s',
                            }}
                          >
                            ✦ Grant Redemption
                          </button>
                        )}
                      </div>
                    )}

                    {/* ── Critical Injury Request ── */}
                    <div style={{ marginTop: 8, borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>
                      {critReqOpenFor === c.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {/* Config panel */}
                          <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: RED, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                            ⚡ Crit Injury Roll
                          </div>
                          {/* Auto modifier */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
                            <span>Existing injuries</span>
                            <span style={{ color: RED, fontWeight: 700 }}>+{(charActiveCritCounts[c.id] ?? 0) * 10}</span>
                          </div>
                          {/* Vicious */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
                            <span>Vicious (ranks)</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <button onClick={() => setCritReqVicious(v => Math.max(0, v - 1))} style={{ background: 'rgba(100,100,100,0.15)', border: '1px solid rgba(100,100,100,0.2)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', color: DIM, fontSize: FS_OVERLINE, padding: 0 }}>−</button>
                              <span style={{ fontFamily: "'Share Tech Mono',monospace", color: critReqVicious > 0 ? RED : DIM, minWidth: 16, textAlign: 'center' }}>{critReqVicious}</span>
                              <button onClick={() => setCritReqVicious(v => v + 1)} style={{ background: 'rgba(100,100,100,0.15)', border: '1px solid rgba(100,100,100,0.2)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', color: DIM, fontSize: FS_OVERLINE, padding: 0 }}>+</button>
                            </div>
                          </div>
                          {/* Lethal Blows */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
                            <span>Lethal Blows (ranks)</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <button onClick={() => setCritReqLethal(v => Math.max(0, v - 1))} style={{ background: 'rgba(100,100,100,0.15)', border: '1px solid rgba(100,100,100,0.2)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', color: DIM, fontSize: FS_OVERLINE, padding: 0 }}>−</button>
                              <span style={{ fontFamily: "'Share Tech Mono',monospace", color: critReqLethal > 0 ? RED : DIM, minWidth: 16, textAlign: 'center' }}>{critReqLethal}</span>
                              <button onClick={() => setCritReqLethal(v => v + 1)} style={{ background: 'rgba(100,100,100,0.15)', border: '1px solid rgba(100,100,100,0.2)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', color: DIM, fontSize: FS_OVERLINE, padding: 0 }}>+</button>
                            </div>
                          </div>
                          {/* Additional */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>
                            <span>Additional mod</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <button onClick={() => setCritReqGm(v => Math.max(0, v - 10))} style={{ background: 'rgba(100,100,100,0.15)', border: '1px solid rgba(100,100,100,0.2)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', color: DIM, fontSize: FS_OVERLINE, padding: 0 }}>−</button>
                              <span style={{ fontFamily: "'Share Tech Mono',monospace", color: critReqGm > 0 ? RED : DIM, minWidth: 24, textAlign: 'center' }}>{critReqGm}</span>
                              <button onClick={() => setCritReqGm(v => v + 10)} style={{ background: 'rgba(100,100,100,0.15)', border: '1px solid rgba(100,100,100,0.2)', borderRadius: 2, width: 18, height: 18, cursor: 'pointer', color: DIM, fontSize: FS_OVERLINE, padding: 0 }}>+</button>
                            </div>
                          </div>
                          {/* Total */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Share Tech Mono',monospace", fontSize: FS_CAPTION, color: RED, fontWeight: 700, borderTop: `1px solid rgba(220,20,60,0.15)`, paddingTop: 4 }}>
                            <span>Total modifier</span>
                            <span>+{(charActiveCritCounts[c.id] ?? 0) * 10 + critReqVicious * 10 + critReqLethal * 10 + critReqGm}</span>
                          </div>
                          {/* Actions */}
                          <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                            <button
                              onClick={() => { setCritReqOpenFor(null); setCritReqVicious(0); setCritReqLethal(0); setCritReqGm(0) }}
                              style={{ flex: 1, background: 'transparent', border: `1px solid rgba(100,100,100,0.25)`, borderRadius: 4, padding: '4px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => sendCritRequest(c.id)}
                              disabled={critReqBusy}
                              style={{ flex: 2, background: 'rgba(220,20,60,0.12)', border: `1px solid rgba(220,20,60,0.4)`, borderRadius: 4, padding: '4px 0', cursor: 'pointer', fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.06em', color: RED }}
                            >
                              {critReqBusy ? '…' : 'Send Roll Request'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCritReqOpenFor(c.id)}
                          style={{
                            width: '100%',
                            background: 'rgba(220,20,60,0.06)',
                            border: `1px solid rgba(220,20,60,0.4)`,
                            borderRadius: 8, padding: '5px 0', cursor: 'pointer',
                            fontFamily: FR, fontSize: FS_CAPTION,
                            fontWeight: 700, letterSpacing: '0.06em',
                            color: RED,
                          }}
                        >
                          ⚡ Request Crit Injury Roll
                        </button>
                      )}
                    </div>

                    {/* Archive button */}
                    <div style={{ marginTop: 8, borderTop: `1px solid ${BORDER}`, paddingTop: 6 }}>
                      <button
                        onClick={() => setArchiveConfirm({ id: c.id, name: c.name })}
                        style={{
                          width: '100%', background: 'transparent',
                          border: `1px solid rgba(100,100,100,0.25)`,
                          borderRadius: 3, padding: '3px 0',
                          cursor: 'pointer', fontFamily: FR, fontSize: FS_OVERLINE,
                          fontWeight: 700, letterSpacing: '0.06em',
                          color: 'rgba(150,150,150,0.55)',
                          textTransform: 'uppercase',
                        }}
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── ARCHIVED CHARACTERS ── */}
          {archivedChars.length > 0 && (
            <div>
              <button
                onClick={() => setArchiveOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, background: 'transparent',
                  border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 6,
                }}
              >
                <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.3)' }}>
                  Archived Characters ({archivedChars.length})
                </span>
                <span style={{ color: 'rgba(200,170,80,0.3)', fontSize: 11 }}>{archiveOpen ? '▲' : '▼'}</span>
              </button>
              {archiveOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {archivedChars.map(c => (
                    <div
                      key={c.id}
                      style={{
                        ...panelBase,
                        padding: '10px 14px',
                        display: 'flex', alignItems: 'center', gap: 10,
                        opacity: 0.65,
                      }}
                    >
                      {c.portrait_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.portrait_url}
                          alt={c.name}
                          style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(200,170,80,0.2)', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'rgba(200,170,80,0.05)', border: '1px solid rgba(200,170,80,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: FC, fontSize: FS_LABEL, color: DIM, flexShrink: 0,
                        }}>
                          {c.name.charAt(0)}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: DIM, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.name}
                        </div>
                        <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: 'rgba(106,128,112,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {c.species_key} · {c.career_key}
                        </div>
                      </div>
                      {c.archived_at && (
                        <div style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: 'rgba(106,128,112,0.5)', flexShrink: 0 }}>
                          {new Date(c.archived_at).toLocaleDateString()}
                        </div>
                      )}
                      <button
                        onClick={() => handleRestore(c.id, c.name)}
                        style={{
                          background: 'rgba(78,200,122,0.08)', border: `1px solid rgba(78,200,122,0.25)`,
                          borderRadius: 3, padding: '3px 10px', cursor: 'pointer',
                          fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700,
                          letterSpacing: '0.06em', color: GREEN, textTransform: 'uppercase',
                          flexShrink: 0,
                        }}
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TOOLS (tabbed) ── */}
          <div>
            <SectionLabel>Tools</SectionLabel>
            <div style={{ ...panelBase, overflow: 'hidden' }}>
              <CornerBrackets />

              {/* Tab bar */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}` }}>
                {([
                  ['xp', 'XP'],
                  ['credits', 'Credits'],
                  ['duty', 'Duty/Obl'],
                  ['do', 'D&O'],
                  ['loot', 'Loot'],
                  ['items', 'Items'],
                  ['talents', '✦ Talents'],
                  ['combat', 'Combat'],
                  ['adversaries', '👾 Adversaries'],
                  ['vehicles',   '🚀 Vehicles'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setActiveTab(key); localStorage.setItem(GM_TAB_KEY, key) }}
                    style={{
                      fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      padding: '10px 16px', border: 'none',
                      borderBottom: activeTab === key ? `2px solid ${GOLD}` : '2px solid transparent',
                      background: activeTab === key ? 'rgba(200,170,80,0.07)' : 'transparent',
                      color: activeTab === key ? GOLD : DIM,
                      cursor: 'pointer', transition: '.15s',
                      marginBottom: -1,
                    }}
                  >
                    {label}
                  </button>
                ))}
                {/* Force tab — separate to allow dynamic badge */}
                <button
                  onClick={() => { setActiveTab('force'); localStorage.setItem(GM_TAB_KEY, 'force') }}
                  style={{
                    fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '10px 16px', border: 'none',
                    borderBottom: activeTab === 'force' ? `2px solid #9060D0` : '2px solid transparent',
                    background: activeTab === 'force' ? 'rgba(144,96,208,0.08)' : 'transparent',
                    color: activeTab === 'force' ? '#9060D0' : DIM,
                    cursor: 'pointer', transition: '.15s', marginBottom: -1,
                  }}
                >
                  Force{forceNotifications.filter(n => n.status === 'pending').length > 0
                    ? ` (${forceNotifications.filter(n => n.status === 'pending').length})`
                    : ''}
                </button>
              </div>

              {/* Tab content */}
              <div style={{ padding: 16 }}>

                {/* ── XP TAB ── */}
                {activeTab === 'xp' && (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      {(['group', 'individual'] as const).map(m => (
                        <button key={m} onClick={() => { setXpMode(m); setXpAmount(''); setXpReason('') }} style={{ ...btnPrimary, background: xpMode === m ? 'rgba(200,170,80,0.25)' : 'rgba(200,170,80,0.08)', color: xpMode === m ? GOLD : DIM }}>
                          {m === 'group' ? 'Group' : 'Individual'}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      {xpMode === 'individual' && (
                        <div>
                          <div style={fieldLabel}>Character</div>
                          <select value={xpTarget} onChange={e => setXpTarget(e.target.value)} style={{ ...darkInput, minWidth: 160 }}>
                            <option value="">Select character...</option>
                            {targetChars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.xp_available} avail)</option>)}
                          </select>
                        </div>
                      )}
                      <div>
                        <div style={fieldLabel}>Amount</div>
                        <input type="number" placeholder="0" value={xpAmount} onChange={e => setXpAmount(e.target.value)} style={darkInputNarrow} />
                      </div>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={fieldLabel}>Reason</div>
                        <input type="text" placeholder="Session reward..." value={xpReason} onChange={e => setXpReason(e.target.value)} onKeyDown={e => e.key === 'Enter' && requestXpConfirm()} style={{ ...darkInput, width: '100%' }} />
                      </div>
                      <button
                        onClick={requestXpConfirm}
                        disabled={xpBusy || !xpAmount || (xpMode === 'individual' && !xpTarget)}
                        style={{ ...btnPrimary, opacity: (xpBusy || !xpAmount || (xpMode === 'individual' && !xpTarget)) ? 0.4 : 1 }}
                      >
                        {xpBusy ? 'Processing...' : xpMode === 'group' ? `Grant to All (${targetChars.length})` : parseInt(xpAmount, 10) < 0 ? 'Take XP' : 'Grant XP'}
                      </button>
                    </div>
                    {/* XP History */}
                    {xpHistory.length > 0 && (
                      <div style={{ marginTop: 20, borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
                        <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 8 }}>
                          Award History
                        </div>
                        {(xpHistoryExpanded ? xpHistory : xpHistory.slice(0, 5)).map(e => (
                          <div key={e.id} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 0', borderBottom: `1px solid ${FAINT}` }}>
                            <span style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: e.amount >= 0 ? GOLD : '#E05050', flexShrink: 0 }}>
                              {e.amount >= 0 ? '+' : ''}{e.amount} XP
                            </span>
                            <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>
                              {e.mode === 'group' ? `→ All (${e.recipient_count})` : `→ ${e.target_name}`}
                            </span>
                            {e.reason && (
                              <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {e.reason}
                              </span>
                            )}
                            <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, flexShrink: 0 }}>
                              {new Date(e.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                        {xpHistory.length > 5 && (
                          <button
                            onClick={() => setXpHistoryExpanded(v => !v)}
                            style={{ marginTop: 8, background: 'transparent', border: 'none', color: GOLD_DIM, fontFamily: FR, fontSize: FS_CAPTION, cursor: 'pointer', padding: 0 }}
                          >
                            {xpHistoryExpanded ? '▲ Show less' : `▼ Show all ${xpHistory.length} entries`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── CREDITS TAB ── */}
                {activeTab === 'credits' && (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      {(['group', 'individual'] as const).map(m => (
                        <button key={m} onClick={() => { setCreditsMode(m); setCreditsAmount('') }} style={{ ...btnPrimary, background: creditsMode === m ? 'rgba(200,170,80,0.25)' : 'rgba(200,170,80,0.08)', color: creditsMode === m ? GOLD : DIM }}>
                          {m === 'group' ? 'Group' : 'Individual'}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      {creditsMode === 'individual' && (
                        <div>
                          <div style={fieldLabel}>Character</div>
                          <select value={creditsTarget} onChange={e => setCreditsTarget(e.target.value)} style={{ ...darkInput, minWidth: 160 }}>
                            <option value="">Select character...</option>
                            {targetChars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.credits} cr)</option>)}
                          </select>
                        </div>
                      )}
                      <div>
                        <div style={fieldLabel}>{creditsMode === 'group' ? 'Amount per Character' : 'Amount'}</div>
                        <input type="number" placeholder="0" value={creditsAmount} onChange={e => setCreditsAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && (creditsMode === 'group' ? handleBulkCredits() : handleIndividualCredits())} style={darkInputNarrow} />
                      </div>
                      <button
                        onClick={creditsMode === 'group' ? handleBulkCredits : handleIndividualCredits}
                        disabled={creditsBusy || !creditsAmount || (creditsMode === 'individual' && !creditsTarget)}
                        style={{ ...btnPrimary, opacity: (creditsBusy || !creditsAmount || (creditsMode === 'individual' && !creditsTarget)) ? 0.4 : 1 }}
                      >
                        {creditsBusy ? 'Processing...' : creditsMode === 'group' ? `Distribute to All (${targetChars.length})` : parseInt(creditsAmount, 10) < 0 ? 'Take Credits' : 'Give Credits'}
                      </button>
                    </div>
                    {/* Credits History */}
                    {creditsHistory.length > 0 && (
                      <div style={{ marginTop: 20, borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
                        <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 8 }}>
                          Award History
                        </div>
                        {(creditsHistoryExpanded ? creditsHistory : creditsHistory.slice(0, 5)).map(e => (
                          <div key={e.id} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 0', borderBottom: `1px solid ${FAINT}` }}>
                            <span style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: e.amount >= 0 ? '#4EC87A' : '#E05050', flexShrink: 0 }}>
                              {e.amount >= 0 ? '+' : ''}{e.amount.toLocaleString()} cr
                            </span>
                            <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>
                              {e.mode === 'group' ? `→ All (${e.recipient_count})` : `→ ${e.target_name}`}
                            </span>
                            <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, flexShrink: 0, marginLeft: 'auto' }}>
                              {new Date(e.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                        {creditsHistory.length > 5 && (
                          <button
                            onClick={() => setCreditsHistoryExpanded(v => !v)}
                            style={{ marginTop: 8, background: 'transparent', border: 'none', color: GOLD_DIM, fontFamily: FR, fontSize: FS_CAPTION, cursor: 'pointer', padding: 0 }}
                          >
                            {creditsHistoryExpanded ? '▲ Show less' : `▼ Show all ${creditsHistory.length} entries`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── DUTY/OBLIGATION TAB ── */}
                {activeTab === 'duty' && (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      {(['obligation', 'duty'] as const).map(t => (
                        <button key={t} onClick={() => { setOdType(t); setOdAmount(''); setOdTarget('') }} style={{ ...btnPrimary, background: odType === t ? 'rgba(200,170,80,0.25)' : 'rgba(200,170,80,0.08)', color: odType === t ? GOLD : DIM }}>
                          {t === 'obligation' ? 'Obligation' : 'Duty'}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      {(['group', 'individual'] as const).map(m => (
                        <button key={m} onClick={() => { setOdMode(m); setOdAmount(''); setOdTarget('') }} style={{ ...btnSmall, background: odMode === m ? 'rgba(200,170,80,0.15)' : 'rgba(200,170,80,0.06)', color: odMode === m ? GOLD : DIM }}>
                          {m === 'group' ? 'Group' : 'Individual'}
                        </button>
                      ))}
                    </div>

                    {/* Overview */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {targetChars.map(c => {
                        const val = odType === 'obligation' ? (c.obligation_value || 0) : (c.duty_value || 0)
                        const typeStr = odType === 'obligation'
                          ? (c.obligation_custom_name || obligationTypes.find(o => o.key === c.obligation_type)?.name || c.obligation_type || '—')
                          : (c.duty_custom_name || dutyTypes.find(d => d.key === c.duty_type)?.name || c.duty_type || '—')
                        return (
                          <div key={c.id} style={{ padding: '6px 10px', background: 'rgba(200,170,80,0.05)', border: `1px solid ${BORDER}`, borderRadius: 3 }}>
                            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT }}>{c.name}</div>
                            <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM, marginTop: 2 }}>
                              {typeStr}: <span style={{ fontWeight: 700, color: val > 0 ? GOLD : FAINT }}>{val}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      {odMode === 'individual' && (
                        <div>
                          <div style={fieldLabel}>Character</div>
                          <select value={odTarget} onChange={e => setOdTarget(e.target.value)} style={{ ...darkInput, minWidth: 160 }}>
                            <option value="">Select character...</option>
                            {targetChars.map(c => {
                              const val = odType === 'obligation' ? (c.obligation_value || 0) : (c.duty_value || 0)
                              return <option key={c.id} value={c.id}>{c.name} ({val})</option>
                            })}
                          </select>
                        </div>
                      )}
                      <div>
                        <div style={fieldLabel}>Amount (+/−)</div>
                        <input type="number" placeholder="0" value={odAmount} onChange={e => setOdAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && (odMode === 'group' ? handleBulkOD() : handleIndividualOD())} style={darkInputNarrow} />
                      </div>
                      <button
                        onClick={odMode === 'group' ? handleBulkOD : handleIndividualOD}
                        disabled={odBusy || !odAmount || (odMode === 'individual' && !odTarget)}
                        style={{ ...(parseInt(odAmount, 10) < 0 ? btnDanger : btnPrimary), opacity: (odBusy || !odAmount || (odMode === 'individual' && !odTarget)) ? 0.4 : 1 }}
                      >
                        {odBusy ? 'Processing...' : parseInt(odAmount, 10) < 0
                          ? `Reduce ${odMode === 'group' ? `All (${targetChars.length})` : odType === 'obligation' ? 'Obligation' : 'Duty'}`
                          : `Add to ${odMode === 'group' ? `All (${targetChars.length})` : odType === 'obligation' ? 'Obligation' : 'Duty'}`
                        }
                      </button>
                    </div>
                  </div>
                )}

                {/* ── D&O DASHBOARD TAB ── */}
                {activeTab === 'do' && (
                  <DutyObligationTab
                    characters={activeChars}
                    dutyTypes={dutyTypes}
                    obligationTypes={obligationTypes}
                    onCharacterUpdated={handleCharacterUpdated}
                    campaignId={campaignId}
                  />
                )}

                {/* ── LOOT TAB ── */}
                {activeTab === 'loot' && (
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <p style={{ fontFamily: FR, fontSize: FS_SM, color: DIM, marginBottom: 16 }}>
                      Browse, random-roll, and reveal loot to players with a dramatic card.
                    </p>
                    <button
                      onClick={() => { setLootOpen(true); setLootItems([]); setLootSelected(null); setRevealItem(null); setAssignTarget('') }}
                      style={{ ...btnPrimary, fontSize: FS_SM, padding: '10px 28px' }}
                    >
                      GENERATE LOOT
                    </button>
                    {revealItem && (
                      <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(200,170,80,0.08)', border: `1px solid ${BORDER_HI}`, borderRadius: 3 }}>
                        <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: GOLD_DIM, letterSpacing: '0.15em', textTransform: 'uppercase' }}>CURRENTLY REVEALING: </span>
                        <span style={{ fontFamily: FR, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{revealItem.name}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── ITEMS TAB ── */}
                {activeTab === 'items' && (
                  <ItemDatabaseTab campaignId={campaignId} supabase={supabase} characters={targetChars} sendToChar={sendToChar} />
                )}

                {/* ── TALENTS TAB ── */}
                {activeTab === 'talents' && (
                  <TalentDatabaseTab campaignId={campaignId} supabase={supabase} characters={targetChars} sendToChar={sendToChar} />
                )}

                {/* ── COMBAT TAB ── */}
                {activeTab === 'combat' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Full Combat Panel button — opens in new tab */}
                    <button
                      onClick={() => campaignId && window.open(`/gm/combat?campaign=${campaignId}`, '_blank')}
                      disabled={!campaignId}
                      style={{
                        width: '100%', padding: '10px 0',
                        background: campaignId ? 'rgba(224,82,82,0.12)' : 'transparent',
                        border: `1px solid ${campaignId ? 'rgba(224,82,82,0.45)' : BORDER}`,
                        borderRadius: 4, cursor: campaignId ? 'pointer' : 'default',
                        fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700,
                        letterSpacing: '0.15em', color: campaignId ? RED : DIM,
                        textTransform: 'uppercase', transition: '.15s',
                      }}
                    >
                      ⚔ Open Full Combat Panel ↗
                    </button>
                    {/* Session control summary */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: sessionMode === 'combat' ? 'rgba(224,80,80,0.10)' : 'rgba(78,200,122,0.08)',
                        border: `1px solid ${sessionMode === 'combat' ? 'rgba(224,80,80,0.35)' : 'rgba(78,200,122,0.3)'}`,
                        borderRadius: 4, padding: '6px 14px',
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: sessionMode === 'combat' ? RED : GREEN,
                          boxShadow: `0 0 6px ${sessionMode === 'combat' ? RED : GREEN}`,
                        }} />
                        <span style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.12em', color: sessionMode === 'combat' ? RED : GREEN }}>
                          {sessionMode === 'combat' ? `Combat · Round ${combatRound}` : 'Exploration'}
                        </span>
                      </div>
                      {sessionMode === 'exploration' ? (
                        <button onClick={beginCombat} disabled={sessionBusy} style={{ ...btnDanger, opacity: sessionBusy ? 0.6 : 1 }}>
                          ⚔ Begin Combat
                        </button>
                      ) : (
                        <>
                          <button onClick={() => changeRound(-1)} disabled={combatRound <= 1 || sessionBusy} style={{ ...btnSmall, opacity: combatRound <= 1 ? 0.3 : 1 }}>−</button>
                          <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: GOLD, minWidth: 64, textAlign: 'center' }}>Round {combatRound}</span>
                          <button onClick={() => changeRound(1)} disabled={sessionBusy} style={btnSmall}>+</button>
                          <button onClick={endEncounter} disabled={sessionBusy} style={{ ...btnSecondary, opacity: sessionBusy ? 0.6 : 1 }}>End Encounter</button>
                        </>
                      )}
                    </div>

                  </div>
                )}

                {/* ── ADVERSARY LIBRARY TAB ── */}
                {activeTab === 'adversaries' && campaignId && (
                  <AdversaryLibrary
                    campaignId={campaignId}
                    sessionMode={sessionMode}
                  />
                )}

                {/* ── VEHICLE LIBRARY TAB ── */}
                {activeTab === 'vehicles' && campaignId && (
                  <VehicleLibrary
                    campaignId={campaignId}
                    sessionMode={sessionMode}
                  />
                )}

                {/* ── FORCE TAB ── */}
                {activeTab === 'force' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {forceNotifications.filter(n => n.status === 'pending').length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <div style={{ fontFamily: FR, fontSize: FS_SM, color: DIM }}>No pending Force notifications.</div>
                        <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: PURPLE, marginTop: 4, opacity: 0.6 }}>Dark side use will appear here in real time.</div>
                      </div>
                    ) : (
                      forceNotifications
                        .filter(n => n.status === 'pending')
                        .map(n => (
                          <ForceNotificationCard
                            key={n.id}
                            notification={n}
                            isFallen={characters.find(c => c.id === n.character_id)?.is_dark_side_fallen === true}
                            onAcknowledged={id => setForceNotifications(prev => prev.filter(x => x.id !== id))}
                          />
                        ))
                    )}
                  </div>
                )}


              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{
          width: 320, flexShrink: 0,
          borderLeft: `1px solid rgba(200,170,80,0.1)`,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>

          {/* Roll Feed header */}
          <div style={{
            padding: '10px 12px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: GOLD_DIM, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>Roll Feed</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: GREEN, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: GREEN, boxShadow: `0 0 6px ${GREEN}`, animation: 'pulse 2s ease-in-out infinite' }} />
              Live
            </span>
          </div>

          {/* Roll feed content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            <RollFeedPanel rolls={rolls} ownCharacterId="gm" isGm={true} />
          </div>

        </div>
        </>)} {/* end activeTab !== 'staging' */}
      </div>

      {/* ── LOOT POPUP ── */}
      {lootOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              ...panelBase,
              width: '100%', maxWidth: 820, maxHeight: '92vh',
              padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
              overflowY: 'auto',
            }}
          >
            <CornerBrackets />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, letterSpacing: '0.2em', color: GOLD }}>LOOT GENERATOR</div>
              <button onClick={() => setLootOpen(false)} style={{ ...btnSmall, fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.1em' }}>CLOSE</button>
            </div>

            {/* Source toggle */}
            <div>
              <div style={{ ...fieldLabel, marginBottom: 8 }}>SOURCE</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['Vendor', 'Searching', 'Looted'] as const).map(s => (
                  <button key={s} onClick={() => setLootSource(s)} style={{
                    ...btnSmall,
                    background: lootSource === s ? 'rgba(200,170,80,0.2)' : 'rgba(200,170,80,0.05)',
                    color: lootSource === s ? GOLD : DIM,
                    border: lootSource === s ? `1px solid ${BORDER_HI}` : `1px solid ${BORDER}`,
                    fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.1em', padding: '6px 14px',
                  }}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Type filter */}
            <div>
              <div style={{ ...fieldLabel, marginBottom: 8 }}>TYPE</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {([['all', 'All'], ['weapon', 'Weapons'], ['armor', 'Armor'], ['gear', 'Gear']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setLootType(val as typeof lootType)} style={{
                    ...btnSmall,
                    background: lootType === val ? 'rgba(200,170,80,0.2)' : 'rgba(200,170,80,0.05)',
                    color: lootType === val ? GOLD : DIM,
                    border: lootType === val ? `1px solid ${BORDER_HI}` : `1px solid ${BORDER}`,
                    fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.1em', padding: '6px 14px',
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rarity + search */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <div style={{ ...fieldLabel, marginBottom: 6 }}>RARITY MIN</div>
                <input type="number" min={0} max={10} value={lootRarityMin} onChange={e => setLootRarityMin(Number(e.target.value))} style={{ ...darkInputNarrow, width: '64px' }} />
              </div>
              <div>
                <div style={{ ...fieldLabel, marginBottom: 6 }}>RARITY MAX</div>
                <input type="number" min={0} max={10} value={lootRarityMax} onChange={e => setLootRarityMax(Number(e.target.value))} style={{ ...darkInputNarrow, width: '64px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...fieldLabel, marginBottom: 6 }}>NAME SEARCH</div>
                <input placeholder="Filter by name..." value={lootSearchText} onChange={e => setLootSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLootBrowse()} style={{ ...darkInput, width: '100%' }} />
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleLootBrowse} disabled={lootBusy} style={{ ...btnPrimary, flex: 1, padding: '10px 0', opacity: lootBusy ? 0.5 : 1 }}>BROWSE</button>
              <button onClick={handleLootRoll} disabled={lootBusy} style={{ ...btnSecondary, flex: 1, padding: '10px 0', opacity: lootBusy ? 0.5 : 1 }}>RANDOM ROLL</button>
            </div>

            {/* Results grid */}
            {lootItems.length > 0 && (
              <div style={{ maxHeight: '16rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {lootItems.map(item => {
                  const isSelected = lootSelected?.key === item.key && lootSelected?.type === item.type
                  return (
                    <div
                      key={`${item.type}-${item.key}`}
                      onClick={() => setLootSelected(item)}
                      style={{
                        ...panelBase,
                        padding: 10, cursor: 'pointer',
                        border: `1px solid ${isSelected ? BORDER_HI : BORDER}`,
                        background: isSelected ? 'rgba(200,170,80,0.08)' : PANEL_BG,
                        transition: '.15s', display: 'flex', gap: 8, alignItems: 'center',
                      }}
                    >
                      <EquipmentImage itemKey={item.key} itemType={item.type} categories={item.categories} size="md" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: TEXT, letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                          <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: rarityColor(item.rarity), fontWeight: 700 }}>R{item.rarity}</span>
                          <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>{item.price}cr</span>
                        </div>
                        <div style={{
                          fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 600, textTransform: 'uppercase', marginTop: 2,
                          color: item.type === 'weapon' ? RED : item.type === 'armor' ? BLUE : DIM,
                        }}>{item.type}</div>
                        <LootBadges item={item} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {lootItems.length === 0 && !lootBusy && (
              <div style={{ fontFamily: FR, fontSize: FS_SM, color: DIM, textAlign: 'center', padding: 16 }}>
                Use BROWSE or RANDOM ROLL to generate items.
              </div>
            )}

            {/* Selected item preview */}
            {lootSelected && (
              <div style={{ ...panelBase, padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <CornerBrackets />
                <button
                  onClick={() => setLootSelected(null)}
                  aria-label="Close item detail"
                  style={{
                    position: 'absolute', top: 8, right: 8, zIndex: 1,
                    background: 'transparent', border: 'none',
                    color: DIM, cursor: 'pointer',
                    fontFamily: FR, fontSize: FS_SM, padding: '2px 6px', borderRadius: 3,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GOLD }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DIM }}
                >
                  ✕
                </button>
                <EquipmentImage itemKey={lootSelected.key} itemType={lootSelected.type} categories={lootSelected.categories} size="lg" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT, letterSpacing: '0.05em' }}>{lootSelected.name}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: rarityColor(lootSelected.rarity), fontWeight: 700 }}>Rarity {lootSelected.rarity} ({rarityLabel(lootSelected.rarity)})</span>
                    <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM }}>{lootSelected.price} credits</span>
                    <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM }}>Enc {lootSelected.encumbrance}</span>
                    <span style={{ fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, textTransform: 'uppercase', color: lootSelected.type === 'weapon' ? RED : lootSelected.type === 'armor' ? BLUE : DIM }}>{lootSelected.type}</span>
                  </div>
                  <LootBadges item={lootSelected} size="md" />
                  {lootSelected.qualities && lootSelected.qualities.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {lootSelected.qualities.map((q, i) => (
                        <span key={i} style={badgeStyle('rgba(200,170,80,0.12)', GOLD)}>
                          {q.key}{q.count ? ` ${q.count}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  {lootSelected.description && (
                    <div
                      style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM, marginTop: 8, lineHeight: 1.5 }}
                      dangerouslySetInnerHTML={{ __html: parseOggDudeMarkup(lootSelected.description) }}
                    />
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => handleRevealToPlayers(lootSelected)}
                      style={{ ...btnPrimary, padding: '8px 16px' }}
                    >
                      REVEAL TO PLAYERS
                    </button>
                    <button
                      onClick={() => setLootAwardItem({ key: lootSelected.key, name: lootSelected.name, type: lootSelected.type, encumbrance: lootSelected.encumbrance })}
                      style={{ ...btnSecondary, padding: '8px 16px' }}
                    >
                      AWARD DIRECTLY
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reveal assignment row */}
            {revealItem && (
              <div style={{ padding: 12, background: 'rgba(200,170,80,0.07)', border: `2px solid ${BORDER_HI}`, borderRadius: 4, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.1em', color: GOLD }}>
                  REVEALING: <span style={{ color: TEXT }}>{revealItem.name}</span>
                </div>
                <select value={assignTarget} onChange={e => setAssignTarget(e.target.value)} style={{ ...darkInput, minWidth: 140 }}>
                  <option value="">Assign to...</option>
                  {targetChars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={handleAssignLoot} disabled={!assignTarget || lootBusy} style={{ ...btnPrimary, opacity: assignTarget ? 1 : 0.4 }}>ASSIGN</button>
                <button onClick={handleDismissReveal} style={btnDanger}>DISMISS</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MORALITY SETUP / EDIT MODAL ── */}
      {moralitySetup && (() => {
        const mv = moralitySetup.score
        const scoreColor = mv >= 70 ? BLUE : mv >= 40 ? GOLD : RED
        const selStr = moralityStrengths.find(m => m.key === moralitySetup.strengthKey)
        const selWk  = moralityWeaknesses.find(m => m.key === moralitySetup.weaknessKey)
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ ...panelBase, padding: 24, maxWidth: '30rem', width: '92%', border: '1px solid rgba(90,170,224,0.3)', boxShadow: '0 8px 40px rgba(90,170,224,0.12)' }}>
              <CornerBrackets />
              <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: BLUE, letterSpacing: '0.15em', marginBottom: 14 }}>
                ✦ Configure Morality — {moralitySetup.name}
              </div>

              {/* Score */}
              <div style={{ marginBottom: 14 }}>
                <div style={fieldLabel}>Morality Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="number" min={1} max={100}
                    value={moralitySetup.score}
                    onChange={e => setMoralitySetup(s => s && ({ ...s, score: parseInt(e.target.value) || 50 }))}
                    style={{ ...darkInput, width: 70 }}
                  />
                  <span style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: scoreColor }}>{mv}</span>
                  <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: scoreColor, opacity: 0.8 }}>
                    {mv >= 70 ? 'Strong — Light side' : mv >= 40 ? 'Balanced' : 'Weak — Dark side temptation'}
                  </span>
                </div>
                <div style={{ marginTop: 6, height: 6, background: FAINT, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.max(1, mv))}%`, background: `linear-gradient(90deg, ${RED}, #4EC87A 60%, ${BLUE})`, borderRadius: 3, transition: '.2s' }} />
                </div>
              </div>

              {/* Strength */}
              <div style={{ marginBottom: 10 }}>
                <div style={fieldLabel}>Strength</div>
                <select
                  value={moralitySetup.strengthKey}
                  onChange={e => setMoralitySetup(s => s && ({ ...s, strengthKey: e.target.value }))}
                  style={{ ...darkInput, width: '100%' }}
                >
                  <option value="">— Select a Strength —</option>
                  {moralityStrengths.map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
                </select>
                {selStr?.description && (
                  <div style={{ marginTop: 5, fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, lineHeight: 1.5, maxHeight: 60, overflow: 'hidden' }}>
                    {selStr.description.replace(/\[.*?\]/g, '').slice(0, 160)}…
                  </div>
                )}
              </div>

              {/* Weakness */}
              <div style={{ marginBottom: 18 }}>
                <div style={fieldLabel}>Weakness</div>
                <select
                  value={moralitySetup.weaknessKey}
                  onChange={e => setMoralitySetup(s => s && ({ ...s, weaknessKey: e.target.value }))}
                  style={{ ...darkInput, width: '100%' }}
                >
                  <option value="">— Select a Weakness —</option>
                  {moralityWeaknesses.map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
                </select>
                {selWk?.description && (
                  <div style={{ marginTop: 5, fontFamily: FR, fontSize: FS_OVERLINE, color: DIM, lineHeight: 1.5, maxHeight: 60, overflow: 'hidden' }}>
                    {selWk.description.replace(/\[.*?\]/g, '').slice(0, 160)}…
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setMoralitySetup(null)} style={btnSmall} disabled={moralityBusy}>Cancel</button>
                <button
                  onClick={handleMoralitySave}
                  disabled={moralityBusy}
                  style={{ ...btnSmall, background: 'rgba(90,170,224,0.15)', border: '1px solid rgba(90,170,224,0.5)', color: BLUE, opacity: moralityBusy ? 0.5 : 1 }}
                >
                  {moralityBusy ? '…' : 'Save Morality'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── DARK SIDE FALL / REDEMPTION DIALOG ── */}
      {fallenConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            ...panelBase, padding: 24, maxWidth: '28rem', width: '90%',
            boxShadow: fallenConfirm.isFallen
              ? '0 8px 40px rgba(126,200,227,0.15)'
              : '0 8px 40px rgba(139,43,226,0.2)',
            border: `1px solid ${fallenConfirm.isFallen ? 'rgba(126,200,227,0.3)' : 'rgba(139,43,226,0.35)'}`,
          }}>
            <CornerBrackets />
            <div style={{
              fontFamily: FC, fontSize: FS_SM, fontWeight: 700,
              color: fallenConfirm.isFallen ? '#7EC8E3' : '#8B2BE2',
              letterSpacing: '0.15em', marginBottom: 12,
            }}>
              {fallenConfirm.isFallen ? '✦ Grant Redemption' : '☠ Dark Side Fall'}
            </div>
            <div style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT, lineHeight: 1.7, marginBottom: 8 }}>
              {fallenConfirm.isFallen ? (
                <>
                  Grant Redemption to <strong style={{ color: '#7EC8E3' }}>{fallenConfirm.name}</strong>?
                  This restores standard light side Force mechanics.
                </>
              ) : (
                <>
                  Declare <strong style={{ color: '#8B2BE2' }}>{fallenConfirm.name}</strong> fallen to the Dark Side?
                  This inverts their Force pip mechanics permanently until Redemption is granted.
                </>
              )}
            </div>
            {!fallenConfirm.isFallen && fallenConfirm.morality !== undefined && (
              <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM, marginBottom: 16 }}>
                Current Morality: <span style={{ color: fallenConfirm.morality >= 50 ? BLUE : RED, fontWeight: 700 }}>{fallenConfirm.morality}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                onClick={() => setFallenConfirm(null)}
                style={btnSmall}
                disabled={fallenBusy}
              >
                CANCEL
              </button>
              <button
                onClick={handleFallenToggle}
                disabled={fallenBusy}
                style={{
                  ...btnSmall,
                  background: fallenConfirm.isFallen ? 'rgba(126,200,227,0.15)' : 'rgba(139,43,226,0.2)',
                  border: `1px solid ${fallenConfirm.isFallen ? 'rgba(126,200,227,0.5)' : 'rgba(139,43,226,0.6)'}`,
                  color: fallenConfirm.isFallen ? '#7EC8E3' : '#8B2BE2',
                  opacity: fallenBusy ? 0.5 : 1,
                }}
              >
                {fallenBusy
                  ? '…'
                  : fallenConfirm.isFallen
                  ? 'Confirm — Grant Redemption'
                  : 'Confirm — Fall to Dark Side'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ARCHIVE CONFIRMATION DIALOG ── */}
      {archiveConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ ...panelBase, padding: 24, maxWidth: '26rem', width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
            <CornerBrackets />
            <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: 'rgba(200,170,80,0.55)', letterSpacing: '0.15em', marginBottom: 12 }}>
              Archive Character
            </div>
            <div style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT, lineHeight: 1.7, marginBottom: 20 }}>
              <strong style={{ color: GOLD }}>{archiveConfirm.name}</strong> will be hidden from all player views.
              Their data is preserved and can be restored at any time.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setArchiveConfirm(null)} style={btnSmall} disabled={archiveBusy}>CANCEL</button>
              <button
                onClick={handleArchive}
                disabled={archiveBusy}
                style={{ ...btnDanger, opacity: archiveBusy ? 0.5 : 1 }}
              >
                {archiveBusy ? 'ARCHIVING…' : 'ARCHIVE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── XP CONFIRMATION DIALOG ── */}
      {xpConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ ...panelBase, padding: 24, maxWidth: '28rem', width: '90%', boxShadow: `0 8px 40px rgba(0,0,0,0.5)` }}>
            <CornerBrackets />
            <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: GOLD, letterSpacing: '0.15em', marginBottom: 16 }}>
              Confirm XP {xpConfirm.amount > 0 ? 'Grant' : 'Adjustment'}
            </div>
            <div style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT, lineHeight: 1.7, marginBottom: 20 }}>
              <div><span style={{ color: DIM }}>Target:</span> {xpConfirm.targetName || `All characters (${activeChars.length})`}</div>
              <div>
                <span style={{ color: DIM }}>Amount:</span>{' '}
                <span style={{ color: xpConfirm.amount > 0 ? GREEN : RED, fontWeight: 700 }}>
                  {xpConfirm.amount > 0 ? '+' : ''}{xpConfirm.amount} XP
                </span>
              </div>
              <div><span style={{ color: DIM }}>Reason:</span> {xpConfirm.reason}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setXpConfirm(null)} style={btnSmall}>CANCEL</button>
              <button
                onClick={() => xpConfirm.target ? handleIndividualXp() : handleBulkXp()}
                style={{ ...(xpConfirm.amount < 0 ? btnDanger : btnPrimary) }}
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOOT AWARD MODAL ── */}
      {lootAwardItem && (
        <LootAwardModal
          item={lootAwardItem}
          characters={targetChars}
          campaignId={campaignId}
          supabase={supabase}
          onClose={() => setLootAwardItem(null)}
          onAwardComplete={(charNames) => {
            flash(`${lootAwardItem!.name} awarded to ${charNames.join(', ')}`)
            setLootAwardItem(null)
          }}
          sendToChar={sendToChar}
        />
      )}

      {/* ── DESTINY MANUAL ADJUST MODAL ── */}
      {manualAdjustOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* Scrim */}
          <div
            onClick={() => setManualAdjustOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 199 }}
          />
          {/* Modal */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 200,
            width: 'clamp(320px, 40vw, 440px)',
            background: 'rgba(6,13,9,0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(200,170,80,0.3)',
            borderRadius: 14,
            padding: '24px 28px',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: GOLD, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ✎ Adjust Destiny Pool
              </span>
              <button onClick={() => setManualAdjustOpen(false)} style={{ ...btnSmall, padding: '2px 8px', fontSize: FS_CAPTION }}>✕</button>
            </div>

            {/* Light Side */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: '#7EC8E3', marginBottom: 8 }}>Light Side Destiny</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setManualLight(l => Math.max(0, l - 1))} style={{ ...btnSmall, padding: '3px 12px', fontSize: FS_SM }}>−</button>
                <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_H4, color: '#7EC8E3', minWidth: 32, textAlign: 'center' }}>{manualLight}</span>
                <button onClick={() => setManualLight(l => l + 1)} style={{ ...btnSmall, padding: '3px 12px', fontSize: FS_SM }}>+</button>
              </div>
            </div>

            {/* Dark Side */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: '#B070D8', marginBottom: 8 }}>Dark Side Destiny</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setManualDark(d => Math.max(0, d - 1))} style={{ ...btnSmall, padding: '3px 12px', fontSize: FS_SM }}>−</button>
                <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: FS_H4, color: '#B070D8', minWidth: 32, textAlign: 'center' }}>{manualDark}</span>
                <button onClick={() => setManualDark(d => d + 1)} style={{ ...btnSmall, padding: '3px 12px', fontSize: FS_SM }}>+</button>
              </div>
            </div>

            {/* Note */}
            <div style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)', color: 'rgba(232,223,200,0.3)', fontStyle: 'italic', marginBottom: 20 }}>
              Changes apply immediately to all screens.
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setManualAdjustOpen(false)} style={{ ...btnSmall, padding: '4px 16px', fontSize: FS_SM }}>
                Cancel
              </button>
              <button
                onClick={handleApplyManual}
                disabled={manualBusy || (manualLight === (destinyPoolRecord?.light_count ?? -1) && manualDark === (destinyPoolRecord?.dark_count ?? -1))}
                style={{
                  ...btnSmall, padding: '4px 16px', fontSize: FS_SM, color: GOLD,
                  border: `1px solid rgba(200,170,80,0.35)`,
                  opacity: manualBusy || (manualLight === (destinyPoolRecord?.light_count ?? -1) && manualDark === (destinyPoolRecord?.dark_count ?? -1)) ? 0.35 : 1,
                }}
              >
                {manualBusy ? '…' : 'Apply Changes'}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ── DESTINY GENERATE PANEL ── */}
      {destinyGenerateOpen && campaignId && (
        <DestinyGeneratePanel
          campaignId={campaignId}
          characters={activeChars}
          supabase={supabase}
          activePool={destinyPoolRecord}
          sendToChar={sendToChar}
          onClose={() => setDestinyGenerateOpen(false)}
          onGenerated={(pool) => {
            setDestinyPoolRecord(pool)
            setDestinyGenerateOpen(false)
          }}
        />
      )}

      {/* ── BOTTOM-RIGHT BUTTON BAR ── */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 8998,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <GmDiceRollerFAB isGmScreenOpen={gmScreenOpen} campaignId={campaignId ?? null} />
        <button
          onClick={() => setGmScreenOpen(o => !o)}
          title="GM Reference Screen"
          style={{
            background: gmScreenOpen ? 'rgba(200,170,80,0.2)' : 'rgba(6,13,9,0.92)',
            border: `2px solid ${gmScreenOpen ? GOLD : GOLD_DIM}`,
            borderRadius: 8, padding: '10px 16px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "var(--font-share-tech-mono), 'Share Tech Mono', monospace",
            fontSize: 'var(--text-caption)',
            letterSpacing: '0.14em', textTransform: 'uppercase' as const,
            color: gmScreenOpen ? GOLD : DIM,
            boxShadow: gmScreenOpen ? '0 0 16px rgba(200,170,80,0.2)' : '0 2px 12px rgba(0,0,0,0.5)',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (!gmScreenOpen) { (e.currentTarget as HTMLElement).style.color = GOLD; (e.currentTarget as HTMLElement).style.borderColor = GOLD } }}
          onMouseLeave={e => { if (!gmScreenOpen) { (e.currentTarget as HTMLElement).style.color = DIM; (e.currentTarget as HTMLElement).style.borderColor = GOLD_DIM } }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>⬛</span>
          GM Screen
        </button>
      </div>
      <GmReferenceDrawer open={gmScreenOpen} onClose={() => setGmScreenOpen(false)} />

    </div>
  )
}
