'use client'

import { Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EquipmentImage } from '@/components/ui/EquipmentImage'
import { parseOggDudeMarkup } from '@/lib/oggdude-markup'
import type { Character, Campaign, Player } from '@/lib/types'
import { toast } from 'sonner'
import { rarityColor, rarityLabel } from '@/lib/styles'
import { useRollFeed } from '@/hooks/useRollFeed'
import { RollFeedPanel } from '@/components/player-hud/RollFeedPanel'
import { rollPool } from '@/components/player-hud/dice-engine'
import { logRoll } from '@/lib/logRoll'
import { CombatPanel } from '@/components/dm/CombatPanel'
import { HolocronLoader } from '@/components/ui/HolocronLoader'

/* ═══════════════════════════════════════
   DESIGN TOKENS (Dark HUD)
   ═══════════════════════════════════════ */
const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FR = "var(--font-rajdhani), 'Rajdhani', sans-serif"
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

/* ═══════════════════════════════════════
   CRITICAL INJURY TABLE (d100)
   ═══════════════════════════════════════ */
const CRIT_TABLE: { min: number; max: number; severity: string; name: string }[] = [
  { min: 1, max: 5, severity: 'Easy', name: 'Minor Nick' },
  { min: 6, max: 10, severity: 'Easy', name: 'Slowed Down' },
  { min: 11, max: 15, severity: 'Easy', name: 'Sudden Jolt' },
  { min: 16, max: 20, severity: 'Easy', name: 'Distracted' },
  { min: 21, max: 25, severity: 'Easy', name: 'Off-Balance' },
  { min: 26, max: 30, severity: 'Easy', name: 'Discouraging Wound' },
  { min: 31, max: 35, severity: 'Easy', name: 'Stunned' },
  { min: 36, max: 40, severity: 'Easy', name: 'Stinger' },
  { min: 41, max: 45, severity: 'Average', name: 'Bowled Over' },
  { min: 46, max: 50, severity: 'Average', name: 'Head Ringer' },
  { min: 51, max: 55, severity: 'Average', name: 'Fearsome Wound' },
  { min: 56, max: 60, severity: 'Average', name: 'Agonizing Wound' },
  { min: 61, max: 65, severity: 'Average', name: 'Slightly Dazed' },
  { min: 66, max: 70, severity: 'Average', name: 'Scattered Senses' },
  { min: 71, max: 75, severity: 'Average', name: 'Hamstrung' },
  { min: 76, max: 80, severity: 'Average', name: 'Overpowered' },
  { min: 81, max: 85, severity: 'Hard', name: 'Winded' },
  { min: 86, max: 90, severity: 'Hard', name: 'Compromised' },
  { min: 91, max: 95, severity: 'Hard', name: 'At the Brink' },
  { min: 96, max: 100, severity: 'Hard', name: 'Crippled' },
  { min: 101, max: 105, severity: 'Hard', name: 'Maimed' },
  { min: 106, max: 110, severity: 'Daunting', name: 'Horrific Injury' },
  { min: 111, max: 115, severity: 'Daunting', name: 'Temporarily Lame' },
  { min: 116, max: 120, severity: 'Daunting', name: 'Blinded' },
  { min: 121, max: 125, severity: 'Daunting', name: 'Knocked Senseless' },
  { min: 126, max: 130, severity: 'Daunting', name: 'Gruesome Injury' },
  { min: 131, max: 140, severity: 'Daunting', name: 'Bleeding Out' },
  { min: 141, max: 150, severity: 'Daunting', name: 'The End is Nigh' },
  { min: 151, max: 999, severity: 'Deadly', name: 'Dead' },
]

function lookupCrit(roll: number): { severity: string; name: string } {
  const entry = CRIT_TABLE.find(c => roll >= c.min && roll <= c.max)
  return entry || { severity: 'Deadly', name: 'Dead' }
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
    const dmg = isMelee ? `+${item.damage_add || 0}` : item.damage != null ? String(item.damage) : null
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

  // ── Tabs ──
  type GmTab = 'xp' | 'credits' | 'duty' | 'loot' | 'combat' | 'crit'
  const GM_TAB_KEY = 'holocron:gm-tab'
  const [activeTab, setActiveTab] = useState<GmTab>(() => {
    if (typeof window === 'undefined') return 'xp'
    const saved = window.localStorage.getItem(GM_TAB_KEY)
    const valid: GmTab[] = ['xp', 'credits', 'duty', 'loot', 'combat', 'crit']
    return valid.includes(saved as GmTab) ? (saved as GmTab) : 'xp'
  })
  const [showCombatPanel, setShowCombatPanel] = useState(false)

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

  // ── Crit Roller ──
  const [critResult, setCritResult] = useState<{ roll: number; name: string; severity: string } | null>(null)
  const [critBonus, setCritBonus] = useState('')

  // ── Loot ──
  const [lootOpen, setLootOpen] = useState(false)
  const [lootType, setLootType] = useState<'all' | 'weapon' | 'armor' | 'gear'>('all')
  const [lootRarityMin, setLootRarityMin] = useState(1)
  const [lootRarityMax, setLootRarityMax] = useState(10)
  const [lootSource, setLootSource] = useState<'Vendor' | 'Searching' | 'Looted'>('Looted')
  const [lootSearchText, setLootSearchText] = useState('')
  const [lootItems, setLootItems] = useState<LootItem[]>([])
  const [lootSelected, setLootSelected] = useState<LootItem | null>(null)
  const [revealItem, setRevealItem] = useState<LootItem | null>(null)
  const [assignTarget, setAssignTarget] = useState<string>('')
  const [lootBusy, setLootBusy] = useState(false)

  // ── Destiny Pool ──
  const [destinyPool, setDestinyPool] = useState<Array<'light' | 'dark'>>(['light', 'light', 'dark', 'dark', 'dark'])

  // ── GM Roll panel ──
  const [gmRollLabel, setGmRollLabel] = useState('')
  const [gmRollHidden, setGmRollHidden] = useState(false)
  const [gmProficiency, setGmProficiency] = useState(0)
  const [gmAbility, setGmAbility] = useState(0)
  const [gmBoost, setGmBoost] = useState(0)
  const [gmChallenge, setGmChallenge] = useState(0)
  const [gmDifficulty, setGmDifficulty] = useState(0)
  const [gmSetback, setGmSetback] = useState(0)

  const supabase = createClient()

  // ── Roll Feed ──
  const rolls = useRollFeed(campaignId)

  // ── Toast helpers ──
  const flash = useCallback((msg: string) => toast.success(msg), [])
  const flashError = useCallback((msg: string) => toast.error(msg), [])

  // ── GM broadcast channels ──
  const gmChannelsRef = useRef<Map<string, ReturnType<typeof supabase.channel>>>(new Map())

  useEffect(() => {
    const map = gmChannelsRef.current
    for (const c of characters) {
      if (!map.has(c.id)) {
        const ch = supabase.channel(`gm-notify-${c.id}`)
        ch.subscribe()
        map.set(c.id, ch)
      }
    }
    for (const [id, ch] of map) {
      if (!characters.find(c => c.id === id)) {
        supabase.removeChannel(ch)
        map.delete(id)
      }
    }
    return () => {
      for (const [, ch] of map) supabase.removeChannel(ch)
      map.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters])

  // ── Broadcast notification ──
  const notify = useCallback((charId: string, type: 'toast' | 'dialog', message: string) => {
    const ch = gmChannelsRef.current.get(charId)
    if (ch) {
      ch.send({ type: 'broadcast', event: 'gm-action', payload: { type, message } })
    }
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
      const [campRes, charRes, playerRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', campaignId).single(),
        supabase.from('characters').select('*').eq('campaign_id', campaignId),
        supabase.from('players').select('id, display_name').eq('campaign_id', campaignId),
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

      const chars = (charRes.data as Character[]) || []
      setCharacters(chars)
      setPlayers(
        Object.fromEntries((playerRes.data || []).map((p: { id: string; display_name: string }) => [p.id, p.display_name]))
      )

      if (chars.length > 0) {
        const specRes = await supabase
          .from('character_specializations')
          .select('character_id, specialization_key')
          .in('character_id', chars.map(c => c.id))
          .order('purchase_order')
        const specMap: Record<string, string[]> = {}
        for (const row of specRes.data || []) {
          const r = row as { character_id: string; specialization_key: string }
          if (!specMap[r.character_id]) specMap[r.character_id] = []
          specMap[r.character_id].push(r.specialization_key)
        }
        setCharSpecs(specMap)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  useEffect(() => { loadData() }, [loadData])

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
      .subscribe()

    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

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
    if (!amount || characters.length === 0) return
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
      const updates = characters.map(c =>
        supabase.from('characters').update({ xp_total: c.xp_total + amount, xp_available: c.xp_available + amount }).eq('id', c.id)
      )
      const transactions = characters.map(c =>
        supabase.from('xp_transactions').insert({ character_id: c.id, amount, reason, created_by: 'gm' })
      )
      await Promise.all([...updates, ...transactions])
      setCharacters(prev => prev.map(c => ({ ...c, xp_total: c.xp_total + amount, xp_available: c.xp_available + amount })))
      for (const c of characters) notify(c.id, 'dialog', `You received ${amount} XP!${reason ? ` Reason: ${reason}` : ''}`)
      setXpAmount(''); setXpReason('')
      flash(`Granted ${amount} XP to ${characters.length} characters`)
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
    if (!amount || amount <= 0 || characters.length === 0) return
    setCreditsBusy(true)
    try {
      await Promise.all(characters.map(c => supabase.from('characters').update({ credits: c.credits + amount }).eq('id', c.id)))
      setCharacters(prev => prev.map(c => ({ ...c, credits: c.credits + amount })))
      for (const c of characters) notify(c.id, 'dialog', `You received ${amount} credits!`)
      setCreditsAmount('')
      flash(`Distributed ${amount} credits to ${characters.length} characters`)
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

  const handleBulkOD = async () => {
    const amount = parseInt(odAmount, 10)
    if (!amount || characters.length === 0) return
    setOdBusy(true)
    const field = odType === 'obligation' ? 'obligation_value' : 'duty_value'
    const label = odType === 'obligation' ? 'Obligation' : 'Duty'
    try {
      await Promise.all(characters.map(c => {
        const current = getODValue(c, odType)
        return supabase.from('characters').update({ [field]: Math.max(0, current + amount) }).eq('id', c.id)
      }))
      setCharacters(prev => prev.map(c => ({ ...c, [field]: Math.max(0, getODValue(c, odType) + amount) })))
      for (const c of characters) notify(c.id, 'toast', `${label} ${amount > 0 ? 'increased' : 'decreased'} by ${Math.abs(amount)}`)
      setOdAmount('')
      flash(`${amount > 0 ? 'Added' : 'Reduced'} ${Math.abs(amount)} ${label} for ${characters.length} characters`)
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
  const beginCombat = async () => {
    if (!campaignId) return
    setSessionBusy(true)
    const round = 1
    await supabase.from('campaigns').update({ session_mode: 'combat', combat_round: round, mode_changed_at: new Date().toISOString() }).eq('id', campaignId)
    setSessionMode('combat')
    setCombatRound(round)
    setSessionBusy(false)
    toast('Combat initiated — players notified.')
  }

  const endEncounter = async () => {
    if (!campaignId) return
    setSessionBusy(true)
    await supabase.from('campaigns').update({ session_mode: 'exploration', combat_round: 0, mode_changed_at: new Date().toISOString() }).eq('id', campaignId)
    setSessionMode('exploration')
    setCombatRound(1)
    setSessionBusy(false)
    toast('Encounter ended — exploration mode.')
  }

  const changeRound = async (delta: number) => {
    if (!campaignId || sessionMode !== 'combat') return
    const next = Math.max(1, combatRound + delta)
    await supabase.from('campaigns').update({ combat_round: next }).eq('id', campaignId)
    setCombatRound(next)
  }

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

  // ── Crit Roller ──
  const rollCrit = () => {
    const bonus = parseInt(critBonus, 10) || 0
    const raw = Math.floor(Math.random() * 100) + 1
    const total = raw + bonus
    const result = lookupCrit(total)
    setCritResult({ roll: total, ...result })
  }

  // ── GM Roll ──
  const handleGmRoll = () => {
    if (!campaignId) return
    const pool = {
      proficiency: gmProficiency,
      ability: gmAbility,
      boost: gmBoost,
      challenge: gmChallenge,
      difficulty: gmDifficulty,
      setback: gmSetback,
    }
    const result = rollPool(pool)
    logRoll({
      campaignId,
      characterId: 'gm',
      characterName: 'GM',
      label: gmRollLabel || undefined,
      pool,
      result,
      isDM: true,
      hidden: gmRollHidden,
    })
  }

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
          {Object.keys(players).length} PLAYERS
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

        {/* Destiny Pool */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: BLUE, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Destiny Pool</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {destinyPool.map((token, idx) => (
              <button
                key={idx}
                onClick={() => flipDestinyToken(idx)}
                title={`Click to flip to ${token === 'light' ? 'dark' : 'light'}`}
                style={{
                  width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', padding: 0,
                  background: token === 'light' ? 'rgba(200,170,80,0.1)' : 'rgba(144,96,208,0.15)',
                  outline: token === 'light' ? '2px solid rgba(200,170,80,0.5)' : '2px solid rgba(144,96,208,0.5)',
                  transition: '.15s',
                }}
              >
                <span style={{ fontSize: FS_CAPTION, color: token === 'light' ? GOLD : PURPLE, lineHeight: 1 }}>
                  {token === 'light' ? '☀' : '◆'}
                </span>
              </button>
            ))}
            <button onClick={addDestinyToken} style={{ ...btnSmall, padding: '2px 6px', fontSize: FS_CAPTION }}>+</button>
            <button onClick={removeDestinyToken} disabled={destinyPool.length === 0} style={{ ...btnSmall, padding: '2px 6px', fontSize: FS_CAPTION, opacity: destinyPool.length === 0 ? 0.3 : 1 }}>−</button>
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', position: 'relative', zIndex: 1 }}>

        {/* ── LEFT / CENTER CONTENT ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── PARTY OVERVIEW ── */}
          <div>
            <SectionLabel>Party Overview</SectionLabel>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 10,
            }}>
              {characters.map(c => {
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
                          background: 'rgba(200,170,80,0.08)', border: '1.5px solid rgba(200,170,80,0.35)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: FC, fontSize: FS_SM, color: GOLD, flexShrink: 0,
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
                              <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM }}>{c.obligation_type}</span>
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
                              <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: DIM }}>{c.duty_type}</span>
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
                                <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 700, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Morality</span>
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
                  </div>
                )
              })}
            </div>
          </div>

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
                  ['loot', 'Loot'],
                  ['combat', 'Combat'],
                  ['crit', 'Crit Roller'],
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
                            {characters.map(c => <option key={c.id} value={c.id}>{c.name} ({c.xp_available} avail)</option>)}
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
                        {xpBusy ? 'Processing...' : xpMode === 'group' ? `Grant to All (${characters.length})` : parseInt(xpAmount, 10) < 0 ? 'Take XP' : 'Grant XP'}
                      </button>
                    </div>
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
                            {characters.map(c => <option key={c.id} value={c.id}>{c.name} ({c.credits} cr)</option>)}
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
                        {creditsBusy ? 'Processing...' : creditsMode === 'group' ? `Distribute to All (${characters.length})` : parseInt(creditsAmount, 10) < 0 ? 'Take Credits' : 'Give Credits'}
                      </button>
                    </div>
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
                      {characters.map(c => {
                        const val = odType === 'obligation' ? (c.obligation_value || 0) : (c.duty_value || 0)
                        const typeStr = odType === 'obligation' ? (c.obligation_type || '—') : (c.duty_type || '—')
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
                            {characters.map(c => {
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
                          ? `Reduce ${odMode === 'group' ? `All (${characters.length})` : odType === 'obligation' ? 'Obligation' : 'Duty'}`
                          : `Add to ${odMode === 'group' ? `All (${characters.length})` : odType === 'obligation' ? 'Obligation' : 'Duty'}`
                        }
                      </button>
                    </div>
                  </div>
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

                {/* ── COMBAT TAB ── */}
                {activeTab === 'combat' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Full Combat Panel button */}
                    <button
                      onClick={() => setShowCombatPanel(true)}
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
                      ⚔ Open Full Combat Panel
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

                {/* ── CRIT ROLLER TAB ── */}
                {activeTab === 'crit' && (
                  <div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div>
                        <div style={fieldLabel}>Bonus (existing crits, vicious…)</div>
                        <input type="number" min="0" placeholder="+0" value={critBonus} onChange={e => setCritBonus(e.target.value)} style={darkInputNarrow} />
                      </div>
                      <button onClick={rollCrit} style={{ ...btnPrimary, padding: '8px 20px' }}>Roll d100</button>
                    </div>

                    {critResult && (
                      <div style={{
                        ...panelBase,
                        marginTop: 16, padding: '14px 18px',
                        borderLeft: `3px solid ${critResult.severity === 'Deadly' ? RED : critResult.severity === 'Daunting' ? ORANGE : critResult.severity === 'Hard' ? ORANGE : GREEN}`,
                      }}>
                        <CornerBrackets />
                        <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: critResult.severity === 'Deadly' ? RED : TEXT, letterSpacing: '0.08em', marginBottom: 4 }}>
                          [{critResult.roll}] {critResult.name}
                        </div>
                        <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM, letterSpacing: '0.1em' }}>
                          Severity: <span style={{ color: critResult.severity === 'Deadly' ? RED : critResult.severity === 'Daunting' ? ORANGE : TEXT, fontWeight: 700 }}>{critResult.severity}</span>
                        </div>
                      </div>
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
            <RollFeedPanel rolls={rolls} ownCharacterId="gm" />
          </div>

          {/* GM Roll panel */}
          <div style={{ flexShrink: 0, padding: 12, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: GOLD_DIM, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>GM Roll</div>

            {/* Label */}
            <input
              type="text"
              placeholder="Roll label..."
              value={gmRollLabel}
              onChange={e => setGmRollLabel(e.target.value)}
              style={{ ...darkInput, width: '100%', marginBottom: 8 }}
            />

            {/* Hidden toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <button
                onClick={() => setGmRollHidden(h => !h)}
                style={{
                  ...btnSmall,
                  padding: '3px 10px',
                  background: gmRollHidden ? 'rgba(144,96,208,0.2)' : 'rgba(200,170,80,0.06)',
                  border: gmRollHidden ? '1px solid rgba(144,96,208,0.4)' : `1px solid rgba(200,170,80,0.2)`,
                  color: gmRollHidden ? PURPLE : DIM,
                }}
              >
                {gmRollHidden ? '🔒 Hidden' : '👁 Visible'}
              </button>
            </div>

            {/* Dice counters */}
            {([
              ['proficiency', '⬡ PRO', '#D4B840', gmProficiency, setGmProficiency],
              ['ability', '⬢ ABL', GREEN, gmAbility, setGmAbility],
              ['boost', '⬚ BST', CYAN, gmBoost, setGmBoost],
              ['challenge', '◆ CHL', RED, gmChallenge, setGmChallenge],
              ['difficulty', '● DIF', PURPLE, gmDifficulty, setGmDifficulty],
              ['setback', '■ SET', '#707070', gmSetback, setGmSetback],
            ] as const).map(([, label, color, val, setter]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontFamily: FR, fontSize: FS_OVERLINE, color: color as string, letterSpacing: '0.06em', minWidth: 42 }}>{label}</span>
                <button onClick={() => (setter as React.Dispatch<React.SetStateAction<number>>)(v => Math.max(0, v - 1))} style={{ ...btnSmall, padding: '2px 7px', fontSize: FS_CAPTION }}>−</button>
                <span style={{ fontFamily: FC, fontSize: FS_SM, color: val > 0 ? color as string : FAINT, minWidth: 16, textAlign: 'center' }}>{val}</span>
                <button onClick={() => (setter as React.Dispatch<React.SetStateAction<number>>)(v => v + 1)} style={{ ...btnSmall, padding: '2px 7px', fontSize: FS_CAPTION }}>+</button>
              </div>
            ))}

            {/* Roll button */}
            <button
              onClick={handleGmRoll}
              disabled={!campaignId || (gmProficiency + gmAbility + gmBoost + gmChallenge + gmDifficulty + gmSetback === 0)}
              style={{
                ...btnPrimary,
                width: '100%',
                marginTop: 10,
                padding: '8px 0',
                opacity: (gmProficiency + gmAbility + gmBoost + gmChallenge + gmDifficulty + gmSetback === 0) ? 0.4 : 1,
              }}
            >
              ROLL
            </button>
          </div>
        </div>
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
                  <button
                    onClick={() => handleRevealToPlayers(lootSelected)}
                    style={{ ...btnPrimary, marginTop: 12, padding: '10px 20px' }}
                  >
                    REVEAL TO PLAYERS
                  </button>
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
                  {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={handleAssignLoot} disabled={!assignTarget || lootBusy} style={{ ...btnPrimary, opacity: assignTarget ? 1 : 0.4 }}>ASSIGN</button>
                <button onClick={handleDismissReveal} style={btnDanger}>DISMISS</button>
              </div>
            )}
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
              <div><span style={{ color: DIM }}>Target:</span> {xpConfirm.targetName || `All characters (${characters.length})`}</div>
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

      {/* ── Full Combat Panel Overlay ── */}
      {showCombatPanel && campaignId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, display: 'flex', flexDirection: 'column' }}>
          {/* Close bar */}
          <div style={{
            flexShrink: 0, height: 52, background: 'rgba(6,13,9,0.97)', borderBottom: '1px solid rgba(224,82,82,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
          }}>
            <span style={{ fontFamily: FC, fontSize: FS_LABEL, letterSpacing: '0.2em', textTransform: 'uppercase', color: RED, fontWeight: 700 }}>
              ⚔ Full Combat Panel
            </span>
            <button
              onClick={() => setShowCombatPanel(false)}
              style={{
                background: 'rgba(224,82,82,0.15)', border: `2px solid rgba(224,82,82,0.7)`,
                borderRadius: 4, padding: '7px 20px', cursor: 'pointer',
                fontFamily: FC, fontSize: FS_SM, fontWeight: 700, letterSpacing: '0.12em',
                color: RED, textTransform: 'uppercase', transition: '.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,82,82,0.35)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,82,82,0.15)' }}
            >
              ✕ CLOSE
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <CombatPanel campaignId={campaignId} characters={characters} isDm={true} />
          </div>
        </div>
      )}

    </div>
  )
}
