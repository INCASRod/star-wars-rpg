'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HudCard } from '@/components/ui/HudCard'
import { EquipmentImage } from '@/components/ui/EquipmentImage'
import type { Character, Campaign, Player } from '@/lib/types'

/* ═══════════════════════════════════════
   LOOT ITEM TYPE
   ═══════════════════════════════════════ */
type LootItem = {
  key: string; name: string; type: 'weapon' | 'armor' | 'gear'
  price: number; rarity: number; encumbrance: number
  description?: string; categories?: string[]
}

function rarityColor(r: number): string {
  if (r <= 2) return 'var(--txt3)'
  if (r <= 4) return 'var(--green)'
  if (r <= 6) return 'var(--blue)'
  if (r <= 8) return '#7B3FA0'
  return 'var(--gold)'
}

function rarityLabel(r: number): string {
  if (r <= 2) return 'Common'
  if (r <= 4) return 'Uncommon'
  if (r <= 6) return 'Rare'
  if (r <= 8) return 'Epic'
  return 'Legendary'
}

/* ═══════════════════════════════════════
   CRITICAL INJURY TABLE (d100)
   Fallback if ref_critical_injuries table
   is unavailable or empty.
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
   SHARED INLINE STYLES
   ═══════════════════════════════════════ */
const S = {
  page: {
    minHeight: '100vh',
    background: 'var(--sand)',
    padding: 'var(--sp-xl)',
    overflowY: 'auto' as const,
  },
  radialBg: {
    position: 'fixed' as const, inset: 0,
    backgroundImage: `radial-gradient(circle at 30% 40%, rgba(200,162,78,.06) 0%, transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(43,93,174,.04) 0%, transparent 50%)`,
    pointerEvents: 'none' as const, zIndex: 0,
  },
  content: {
    position: 'relative' as const,
    zIndex: 1,
    maxWidth: '80rem',
    margin: '0 auto',
  },
  heading: {
    fontFamily: 'var(--font-orbitron)',
    fontWeight: 900 as const,
    fontSize: 'var(--font-hero)',
    letterSpacing: '0.4rem',
    color: 'var(--gold-d)',
    textShadow: '0 0 60px var(--gold-glow-s)',
    marginBottom: 'var(--sp-xs)',
  },
  subheading: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-sm)',
    color: 'var(--txt3)',
    letterSpacing: '0.2rem',
    marginBottom: 'var(--sp-xl)',
  },
  sectionTitle: {
    fontFamily: 'var(--font-orbitron)',
    fontWeight: 700 as const,
    fontSize: 'var(--font-sm)',
    letterSpacing: '0.2rem',
    color: 'var(--gold-d)',
    textTransform: 'uppercase' as const,
    marginBottom: 'var(--sp-md)',
    marginTop: 'var(--sp-xl)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
    gap: 'var(--sp-md)',
  },
  input: {
    padding: 'var(--sp-sm) var(--sp-md)',
    border: '1px solid var(--bdr-l)',
    background: 'var(--white)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-sm)',
    fontWeight: 500 as const,
    color: 'var(--ink)',
    outline: 'none',
    width: '100%',
  },
  inputNarrow: {
    padding: 'var(--sp-sm) var(--sp-md)',
    border: '1px solid var(--bdr-l)',
    background: 'var(--white)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-sm)',
    fontWeight: 500 as const,
    color: 'var(--ink)',
    outline: 'none',
    width: '6rem',
    textAlign: 'center' as const,
  },
  btnPrimary: {
    background: 'var(--gold)',
    border: 'none',
    padding: 'var(--sp-sm) var(--sp-lg)',
    fontFamily: 'var(--font-orbitron)',
    fontSize: 'var(--font-xs)',
    fontWeight: 700 as const,
    letterSpacing: '0.15rem',
    color: 'var(--white)',
    cursor: 'pointer',
    transition: '.2s',
    textTransform: 'uppercase' as const,
  },
  btnSmall: {
    background: 'rgba(255,255,255,.5)',
    backdropFilter: 'blur(4px)',
    border: '1px solid var(--bdr-l)',
    padding: 'var(--sp-xs) var(--sp-sm)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-sm)',
    color: 'var(--ink)',
    cursor: 'pointer',
    transition: '.2s',
  },
  btnDanger: {
    background: 'var(--red)',
    border: 'none',
    padding: 'var(--sp-xs) var(--sp-sm)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-sm)',
    color: 'var(--white)',
    cursor: 'pointer',
    transition: '.2s',
  },
  btnSecondary: {
    background: 'var(--blue)',
    border: 'none',
    padding: 'var(--sp-xs) var(--sp-sm)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-sm)',
    color: 'var(--white)',
    cursor: 'pointer',
    transition: '.2s',
  },
  label: {
    fontFamily: 'var(--font-orbitron)',
    fontSize: 'var(--font-2xs)',
    fontWeight: 600 as const,
    letterSpacing: '0.15rem',
    color: 'var(--txt3)',
    textTransform: 'uppercase' as const,
    marginBottom: 'var(--sp-xs)',
  },
  statValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-base)',
    color: 'var(--ink)',
  },
  meta: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-sm)',
    color: 'var(--txt3)',
  },
}

/* ═══════════════════════════════════════
   COMBAT TRACKER SLOT
   ═══════════════════════════════════════ */
interface CombatSlot {
  characterId: string
  initiative: number
  tempDamage: string
  tempStrain: string
}

/* ═══════════════════════════════════════
   GM DASHBOARD PAGE
   ═══════════════════════════════════════ */
export default function GmDashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sand)', fontFamily: 'var(--font-orbitron)', color: 'var(--gold-d)', fontSize: 'var(--font-xl)', letterSpacing: '0.3rem' }}>
        LOADING GM DASHBOARD...
      </div>
    }>
      <GmDashboard />
    </Suspense>
  )
}

function GmDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const campaignId = searchParams.get('campaign')

  // ── State ──
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [players, setPlayers] = useState<Record<string, string>>({})
  const [charSpecs, setCharSpecs] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Tabs
  const [activeTab, setActiveTab] = useState<'xp' | 'credits' | 'loot' | 'combat' | 'crit'>('xp')

  // XP
  const [xpAmount, setXpAmount] = useState('')
  const [xpReason, setXpReason] = useState('')
  const [xpBusy, setXpBusy] = useState(false)
  const [xpMode, setXpMode] = useState<'group' | 'individual'>('group')
  const [xpTarget, setXpTarget] = useState('')
  const [xpConfirm, setXpConfirm] = useState<{ amount: number; reason: string; target?: string; targetName?: string } | null>(null)

  // Credits
  const [creditsAmount, setCreditsAmount] = useState('')
  const [creditsBusy, setCreditsBusy] = useState(false)
  const [creditsMode, setCreditsMode] = useState<'group' | 'individual'>('group')
  const [creditsTarget, setCreditsTarget] = useState('')

  // Combat Tracker
  const [combatActive, setCombatActive] = useState(false)
  const [combatSlots, setCombatSlots] = useState<CombatSlot[]>([])
  const [currentTurn, setCurrentTurn] = useState(0)

  // Crit roller
  const [critResult, setCritResult] = useState<{ roll: number; name: string; severity: string } | null>(null)
  const [critBonus, setCritBonus] = useState('')

  // Loot generator
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

  // Status messages
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const supabase = createClient()

  // ── Flash a temporary status message ──
  const flash = useCallback((msg: string) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(null), 3000)
  }, [])

  // ── Broadcast notification to character page ──
  const notify = useCallback((charId: string, type: 'toast' | 'dialog', message: string) => {
    supabase.channel(`gm-notify-${charId}`).send({
      type: 'broadcast',
      event: 'gm-action',
      payload: { type, message },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Loot: query builder ──
  const buildLootQuery = useCallback(async (limit: number) => {
    const queries: Promise<{ data: LootItem[] }>[] = []
    const nameFilter = lootSearchText.trim() ? `%${lootSearchText.trim()}%` : null

    const buildQ = async (table: string, type: 'weapon' | 'armor' | 'gear'): Promise<{ data: LootItem[] }> => {
      let q = supabase.from(table).select('key, name, price, rarity, encumbrance, description, categories')
        .gte('rarity', lootRarityMin).lte('rarity', lootRarityMax).limit(limit)
      if (nameFilter) q = q.ilike('name', nameFilter)
      const r = await q
      return { data: (r.data || []).map((d: Record<string, unknown>) => ({ ...d, type })) as LootItem[] }
    }

    if (lootType === 'all' || lootType === 'weapon') queries.push(buildQ('ref_weapons', 'weapon'))
    if (lootType === 'all' || lootType === 'armor') queries.push(buildQ('ref_armor', 'armor'))
    if (lootType === 'all' || lootType === 'gear') queries.push(buildQ('ref_gear', 'gear'))

    const results = await Promise.all(queries)
    return results.flatMap(r => r.data)
  }, [supabase, lootType, lootRarityMin, lootRarityMax, lootSearchText])

  // ── Loot: browse (list) ──
  const handleLootBrowse = useCallback(async () => {
    setLootBusy(true)
    const items = await buildLootQuery(30)
    items.sort((a, b) => a.name.localeCompare(b.name))
    setLootItems(items)
    setLootSelected(null)
    setLootBusy(false)
  }, [buildLootQuery])

  // ── Loot: random roll ──
  const handleLootRoll = useCallback(async () => {
    setLootBusy(true)
    const items = await buildLootQuery(100)
    // Shuffle and pick 3-5
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]]
    }
    const count = Math.min(items.length, 3 + Math.floor(Math.random() * 3))
    setLootItems(items.slice(0, count))
    setLootSelected(null)
    setLootBusy(false)
  }, [buildLootQuery])

  // ── Loot: reveal to all players ──
  const handleRevealToPlayers = useCallback((item: LootItem) => {
    setRevealItem(item)
    // Broadcast to ALL characters
    for (const c of characters) {
      supabase.channel(`gm-notify-${c.id}`).send({
        type: 'broadcast', event: 'gm-action',
        payload: {
          type: 'loot-reveal',
          item: { name: item.name, key: item.key, itemType: item.type, rarity: item.rarity, source: lootSource, description: item.description, categories: item.categories },
        },
      })
    }
  }, [characters, supabase, lootSource])

  // ── Loot: dismiss reveal ──
  const handleDismissReveal = useCallback(() => {
    setRevealItem(null)
    for (const c of characters) {
      supabase.channel(`gm-notify-${c.id}`).send({
        type: 'broadcast', event: 'gm-action',
        payload: { type: 'loot-dismiss' },
      })
    }
  }, [characters, supabase])

  // ── Loot: assign to character ──
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
    // Dismiss reveal on all players
    handleDismissReveal()
    setRevealItem(null)
    setAssignTarget('')
    setLootBusy(false)
  }, [revealItem, assignTarget, lootSource, characters, supabase, notify, flash, handleDismissReveal])

  // ── Load campaign data ──
  const loadData = useCallback(async () => {
    if (!campaignId) {
      setError('No campaign ID provided')
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [campRes, charRes, playerRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', campaignId).single(),
        supabase.from('characters').select('*').eq('campaign_id', campaignId),
        supabase.from('players').select('id, display_name').eq('campaign_id', campaignId),
      ])

      if (campRes.error) throw new Error(campRes.error.message)
      setCampaign(campRes.data as Campaign)
      const chars = (charRes.data as Character[]) || []
      setCharacters(chars)
      setPlayers(
        Object.fromEntries((playerRes.data || []).map((p: { id: string; display_name: string }) => [p.id, p.display_name]))
      )

      // Fetch specializations for all characters
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

  useEffect(() => {
    loadData()
  }, [loadData])

  // ── Realtime: refresh when any character in this campaign changes ──
  useEffect(() => {
    if (!campaignId) return
    const channel = supabase
      .channel(`gm-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'characters' }, (payload) => {
        const row = payload.new as Character | undefined
        if (row?.campaign_id === campaignId) loadData()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── Request XP confirmation (group or individual) ──
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

  // ── Bulk XP grant (confirmed) ──
  const handleBulkXp = async () => {
    if (!xpConfirm) return
    const { amount, reason } = xpConfirm
    setXpConfirm(null)
    setXpBusy(true)
    try {
      const updates = characters.map(c =>
        supabase.from('characters').update({
          xp_total: c.xp_total + amount,
          xp_available: c.xp_available + amount,
        }).eq('id', c.id)
      )
      const transactions = characters.map(c =>
        supabase.from('xp_transactions').insert({
          character_id: c.id,
          amount,
          reason,
          created_by: 'gm',
        })
      )
      await Promise.all([...updates, ...transactions])

      setCharacters(prev =>
        prev.map(c => ({
          ...c,
          xp_total: c.xp_total + amount,
          xp_available: c.xp_available + amount,
        }))
      )
      for (const c of characters) {
        notify(c.id, 'dialog', `You received ${amount} XP!${reason ? ` Reason: ${reason}` : ''}`)
      }
      setXpAmount('')
      setXpReason('')
      flash(`Granted ${amount} XP to ${characters.length} characters`)
    } catch (err: unknown) {
      flash('Error granting XP: ' + (err instanceof Error ? err.message : String(err)))
    }
    setXpBusy(false)
  }

  // ── Individual XP grant/take (confirmed) ──
  const handleIndividualXp = async () => {
    if (!xpConfirm || !xpConfirm.target) return
    const { amount, reason, target } = xpConfirm
    const char = characters.find(c => c.id === target)
    if (!char) return
    setXpConfirm(null)
    setXpBusy(true)
    try {
      await supabase.from('characters').update({
        xp_total: char.xp_total + amount,
        xp_available: char.xp_available + amount,
      }).eq('id', target)

      await supabase.from('xp_transactions').insert({
        character_id: target,
        amount,
        reason,
        created_by: 'gm',
      })

      setCharacters(prev =>
        prev.map(c => c.id === target ? {
          ...c,
          xp_total: c.xp_total + amount,
          xp_available: c.xp_available + amount,
        } : c)
      )
      notify(target, 'dialog', `You ${amount > 0 ? 'received' : 'lost'} ${Math.abs(amount)} XP!${reason ? ` Reason: ${reason}` : ''}`)
      setXpAmount('')
      setXpReason('')
      setXpTarget('')
      flash(`${amount > 0 ? 'Granted' : 'Took'} ${Math.abs(amount)} XP ${amount > 0 ? 'to' : 'from'} ${char.name}`)
    } catch (err: unknown) {
      flash('Error: ' + (err instanceof Error ? err.message : String(err)))
    }
    setXpBusy(false)
  }

  // ── Bulk credits distribution ──
  const handleBulkCredits = async () => {
    const amount = parseInt(creditsAmount, 10)
    if (!amount || amount <= 0 || characters.length === 0) return
    setCreditsBusy(true)
    try {
      const updates = characters.map(c =>
        supabase.from('characters').update({
          credits: c.credits + amount,
        }).eq('id', c.id)
      )
      await Promise.all(updates)

      setCharacters(prev =>
        prev.map(c => ({ ...c, credits: c.credits + amount }))
      )
      for (const c of characters) {
        notify(c.id, 'dialog', `You received ${amount} credits!`)
      }
      setCreditsAmount('')
      flash(`Distributed ${amount} credits to ${characters.length} characters`)
    } catch (err: unknown) {
      flash('Error distributing credits: ' + (err instanceof Error ? err.message : String(err)))
    }
    setCreditsBusy(false)
  }

  // ── Individual credits grant ──
  const handleIndividualCredits = async () => {
    const amount = parseInt(creditsAmount, 10)
    if (!amount || !creditsTarget) return
    const char = characters.find(c => c.id === creditsTarget)
    if (!char) return
    setCreditsBusy(true)
    try {
      await supabase.from('characters').update({
        credits: char.credits + amount,
      }).eq('id', creditsTarget)

      setCharacters(prev =>
        prev.map(c => c.id === creditsTarget ? { ...c, credits: c.credits + amount } : c)
      )
      notify(creditsTarget, 'dialog', `You ${amount > 0 ? 'received' : 'lost'} ${Math.abs(amount)} credits!`)
      setCreditsAmount('')
      setCreditsTarget('')
      flash(`${amount > 0 ? 'Gave' : 'Took'} ${Math.abs(amount)} credits ${amount > 0 ? 'to' : 'from'} ${char.name}`)
    } catch (err: unknown) {
      flash('Error: ' + (err instanceof Error ? err.message : String(err)))
    }
    setCreditsBusy(false)
  }

  // ── Combat tracker: initialize ──
  const initCombat = () => {
    const slots: CombatSlot[] = characters.map(c => ({
      characterId: c.id,
      initiative: 0,
      tempDamage: '',
      tempStrain: '',
    }))
    setCombatSlots(slots)
    setCombatActive(true)
    setCurrentTurn(0)
  }

  // ── Combat tracker: set initiative ──
  const setInitiative = (charId: string, val: string) => {
    const num = parseFloat(val) || 0
    setCombatSlots(prev =>
      prev.map(s => s.characterId === charId ? { ...s, initiative: num } : s)
    )
  }

  // ── Combat tracker: sort by initiative ──
  const sortByInitiative = () => {
    setCombatSlots(prev => [...prev].sort((a, b) => b.initiative - a.initiative))
    setCurrentTurn(0)
  }

  // ── Combat tracker: move up/down ──
  const moveSlot = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= combatSlots.length) return
    setCombatSlots(prev => {
      const next = [...prev]
      const temp = next[idx]
      next[idx] = next[newIdx]
      next[newIdx] = temp
      return next
    })
  }

  // ── Combat tracker: apply damage to a character ──
  const applyDamage = async (charId: string) => {
    const slot = combatSlots.find(s => s.characterId === charId)
    if (!slot) return
    const dmg = parseInt(slot.tempDamage, 10)
    if (!dmg) return

    const char = characters.find(c => c.id === charId)
    if (!char) return

    const newWounds = Math.min(char.wound_current + dmg, char.wound_threshold)
    await supabase.from('characters').update({ wound_current: newWounds }).eq('id', charId)

    setCharacters(prev => prev.map(c =>
      c.id === charId ? { ...c, wound_current: newWounds } : c
    ))
    notify(charId, 'toast', `You took ${dmg} wound${dmg !== 1 ? 's' : ''}!`)
    setCombatSlots(prev => prev.map(s =>
      s.characterId === charId ? { ...s, tempDamage: '' } : s
    ))
  }

  // ── Combat tracker: apply strain to a character ──
  const applyStrain = async (charId: string) => {
    const slot = combatSlots.find(s => s.characterId === charId)
    if (!slot) return
    const str = parseInt(slot.tempStrain, 10)
    if (!str) return

    const char = characters.find(c => c.id === charId)
    if (!char) return

    const newStrain = Math.min(char.strain_current + str, char.strain_threshold)
    await supabase.from('characters').update({ strain_current: newStrain }).eq('id', charId)

    setCharacters(prev => prev.map(c =>
      c.id === charId ? { ...c, strain_current: newStrain } : c
    ))
    notify(charId, 'toast', `You took ${str} strain!`)
    setCombatSlots(prev => prev.map(s =>
      s.characterId === charId ? { ...s, tempStrain: '' } : s
    ))
  }

  // ── Combat tracker: next / prev turn ──
  const nextTurn = () => {
    setCurrentTurn(prev => (prev + 1) % combatSlots.length)
  }
  const prevTurn = () => {
    setCurrentTurn(prev => (prev - 1 + combatSlots.length) % combatSlots.length)
  }

  // ── Combat tracker: end combat ──
  const endCombat = () => {
    setCombatActive(false)
    setCombatSlots([])
    setCurrentTurn(0)
  }

  // ── Roll d100 critical injury ──
  const rollCrit = () => {
    const bonus = parseInt(critBonus, 10) || 0
    const raw = Math.floor(Math.random() * 100) + 1
    const total = raw + bonus
    const result = lookupCrit(total)
    setCritResult({ roll: total, ...result })
  }

  // ── Heal wounds/strain helpers ──
  const healWounds = async (charId: string, amount: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newVal = Math.max(0, char.wound_current - amount)
    await supabase.from('characters').update({ wound_current: newVal }).eq('id', charId)
    setCharacters(prev => prev.map(c =>
      c.id === charId ? { ...c, wound_current: newVal } : c
    ))
    notify(charId, 'toast', `You healed ${amount} wound${amount !== 1 ? 's' : ''}!`)
  }

  const healStrain = async (charId: string, amount: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newVal = Math.max(0, char.strain_current - amount)
    await supabase.from('characters').update({ strain_current: newVal }).eq('id', charId)
    setCharacters(prev => prev.map(c =>
      c.id === charId ? { ...c, strain_current: newVal } : c
    ))
    notify(charId, 'toast', `You recovered ${amount} strain!`)
  }

  // ── Helpers ──
  const charById = (id: string) => characters.find(c => c.id === id)

  const woundColor = (current: number, threshold: number) => {
    const pct = current / threshold
    if (pct >= 1) return 'var(--red)'
    if (pct >= 0.75) return 'var(--amber)'
    return 'var(--green)'
  }

  const addWound = async (charId: string, amount: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newVal = Math.min(char.wound_threshold, char.wound_current + amount)
    await supabase.from('characters').update({ wound_current: newVal }).eq('id', charId)
    setCharacters(prev => prev.map(c =>
      c.id === charId ? { ...c, wound_current: newVal } : c
    ))
    notify(charId, 'toast', `You suffered ${amount} wound${amount !== 1 ? 's' : ''}!`)
  }

  const addStrain = async (charId: string, amount: number) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newVal = Math.min(char.strain_threshold, char.strain_current + amount)
    await supabase.from('characters').update({ strain_current: newVal }).eq('id', charId)
    setCharacters(prev => prev.map(c =>
      c.id === charId ? { ...c, strain_current: newVal } : c
    ))
    notify(charId, 'toast', `You suffered ${amount} strain!`)
  }

  // ══════════════════════════════════════
  // LOADING / ERROR
  // ══════════════════════════════════════
  if (loading) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--sand)', fontFamily: 'var(--font-orbitron)',
        color: 'var(--gold-d)', fontSize: 'var(--font-xl)', letterSpacing: '0.3rem',
      }}>
        LOADING GM DASHBOARD...
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'var(--sand)', gap: 'var(--sp-md)',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 'var(--font-md)',
        }}>
          {error || 'Campaign not found'}
        </div>
        <button onClick={() => router.push('/')} style={S.btnPrimary}>
          Return Home
        </button>
      </div>
    )
  }

  // ══════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════
  return (
    <div style={S.page}>
      <div style={S.radialBg} />

      <div style={S.content}>
        {/* ── Header ── */}
        <div style={{ marginBottom: 'var(--sp-lg)' }}>
          <div style={S.heading}>{campaign.name}</div>
          <div style={S.subheading}>
            GM Dashboard // {characters.length} Character{characters.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => router.push('/')}
            style={{ ...S.btnSmall, marginRight: 'var(--sp-sm)' }}
          >
            &larr; Back to Lobby
          </button>
          <button onClick={loadData} style={S.btnSmall}>
            Refresh Data
          </button>
        </div>

        {/* ── Status toast ── */}
        {statusMsg && (
          <div style={{
            position: 'fixed', top: 'var(--sp-lg)', right: 'var(--sp-lg)',
            zIndex: 100,
            background: 'var(--green)', color: 'var(--white)',
            padding: 'var(--sp-sm) var(--sp-lg)',
            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
            boxShadow: '0 4px 20px rgba(0,0,0,.15)',
          }}>
            {statusMsg}
          </div>
        )}

        {/* ══════════════════════════════════════
            CHARACTER CARDS
            ══════════════════════════════════════ */}
        <div style={S.sectionTitle}>Characters</div>
        <div style={S.grid}>
          {characters.map(c => (
            <HudCard key={c.id} title={players[c.player_id] || 'Unknown Player'}>
              <div
                onClick={() => router.push(`/character/${c.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-md)',
                  marginBottom: 'var(--sp-sm)',
                }}>
                  {/* Portrait */}
                  {c.portrait_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.portrait_url}
                      alt={c.name}
                      style={{
                        width: '3rem', height: '3rem',
                        objectFit: 'cover', borderRadius: '50%',
                        border: '2px solid var(--gold)',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '3rem', height: '3rem',
                      borderRadius: '50%',
                      background: 'var(--sand-warm)',
                      border: '2px solid var(--bdr)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)',
                      color: 'var(--txt3)', flexShrink: 0,
                    }}>
                      {c.name.charAt(0)}
                    </div>
                  )}

                  {/* Name + meta */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-orbitron)',
                      fontSize: 'var(--font-base)', fontWeight: 700,
                      color: 'var(--ink)', letterSpacing: '0.08rem',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {c.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
                      color: 'var(--txt3)', marginTop: '0.15rem', fontWeight: 500,
                    }}>
                      {c.species_key} // {c.career_key}
                      {charSpecs[c.id]?.length ? ` // ${charSpecs[c.id].join(', ')}` : ''}
                    </div>
                  </div>
                </div>

                {/* Wounds bar */}
                <div style={{ marginBottom: 'var(--sp-xs)' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '0.15rem',
                  }}>
                    <span style={{ ...S.meta, fontSize: 'var(--font-base)' }}>
                      Wounds
                      {c.wound_current >= c.wound_threshold && (
                        <span style={{
                          marginLeft: '0.3rem', color: 'var(--red)', fontWeight: 800,
                          fontSize: 'var(--font-2xs)', letterSpacing: '0.08rem',
                        }}>
                          INCAPACITATED
                        </span>
                      )}
                    </span>
                    <span style={{
                      ...S.meta,
                      fontSize: 'var(--font-base)',
                      color: woundColor(c.wound_current, c.wound_threshold),
                      fontWeight: 600,
                    }}>
                      {c.wound_current} / {c.wound_threshold}
                    </span>
                  </div>
                  <div style={{
                    height: '0.25rem', background: 'var(--bdr-l)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (c.wound_current / c.wound_threshold) * 100)}%`,
                      background: woundColor(c.wound_current, c.wound_threshold),
                      transition: '.3s',
                    }} />
                  </div>
                </div>

                {/* Strain bar */}
                <div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '0.15rem',
                  }}>
                    <span style={{ ...S.meta, fontSize: 'var(--font-base)' }}>
                      Strain
                      {c.strain_current >= c.strain_threshold && (
                        <span style={{
                          marginLeft: '0.3rem', color: 'var(--red)', fontWeight: 800,
                          fontSize: 'var(--font-2xs)', letterSpacing: '0.08rem',
                        }}>
                          UNCONSCIOUS
                        </span>
                      )}
                    </span>
                    <span style={{
                      ...S.meta,
                      fontSize: 'var(--font-base)',
                      color: woundColor(c.strain_current, c.strain_threshold),
                      fontWeight: 600,
                    }}>
                      {c.strain_current} / {c.strain_threshold}
                    </span>
                  </div>
                  <div style={{
                    height: '0.25rem', background: 'var(--bdr-l)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (c.strain_current / c.strain_threshold) * 100)}%`,
                      background: woundColor(c.strain_current, c.strain_threshold),
                      transition: '.3s',
                    }} />
                  </div>
                </div>
              </div>

              {/* Quick heal buttons (outside the link area) */}
              <div style={{
                display: 'flex', gap: 'var(--sp-xs)',
                marginTop: 'var(--sp-sm)',
                borderTop: '1px solid var(--bdr-l)',
                paddingTop: 'var(--sp-sm)',
              }}>
                <button
                  onClick={() => addWound(c.id, 1)}
                  style={{ ...S.btnSmall, color: 'var(--red)' }}
                  title="Add 1 wound"
                >
                  Wound +1
                </button>
                <button
                  onClick={() => healWounds(c.id, 1)}
                  style={S.btnSmall}
                  title="Heal 1 wound"
                >
                  Wound -1
                </button>
                <button
                  onClick={() => addStrain(c.id, 1)}
                  style={{ ...S.btnSmall, color: 'var(--amber)' }}
                  title="Add 1 strain"
                >
                  Strain +1
                </button>
                <button
                  onClick={() => healStrain(c.id, 1)}
                  style={S.btnSmall}
                  title="Heal 1 strain"
                >
                  Strain -1
                </button>
                <div style={{ flex: 1 }} />
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-sm)',
                  fontWeight: 700,
                  color: 'var(--txt3)',
                  alignSelf: 'center',
                }}>
                  {c.xp_available} XP // {c.credits} cr
                </div>
              </div>
            </HudCard>
          ))}
        </div>

        {/* ══════════════════════════════════════
            TAB BAR
            ══════════════════════════════════════ */}
        <div style={{
          display: 'flex', gap: 'var(--sp-xs)',
          marginTop: 'var(--sp-lg)',
          borderBottom: '2px solid var(--bdr-l)',
          marginBottom: 'var(--sp-lg)',
        }}>
          {([
            ['xp', 'XP'],
            ['credits', 'Credits'],
            ['loot', 'Loot'],
            ['combat', 'Combat'],
            ['crit', 'Crit Roller'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: 'var(--font-xs)',
                fontWeight: 700,
                letterSpacing: '0.12rem',
                textTransform: 'uppercase',
                padding: 'var(--sp-sm) var(--sp-lg)',
                border: 'none',
                borderBottom: activeTab === key ? '3px solid var(--gold)' : '3px solid transparent',
                background: activeTab === key ? 'rgba(200,162,78,.08)' : 'transparent',
                color: activeTab === key ? 'var(--gold-d)' : 'var(--txt3)',
                cursor: 'pointer',
                transition: '.2s',
                marginBottom: '-2px',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            XP TAB
            ══════════════════════════════════════ */}
        {activeTab === 'xp' && (
          <>
            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: 'var(--sp-xs)', marginBottom: 'var(--sp-md)' }}>
              <button
                onClick={() => { setXpMode('group'); setXpAmount(''); setXpReason('') }}
                style={{
                  ...S.btnPrimary,
                  background: xpMode === 'group' ? 'var(--gold)' : 'rgba(200,162,78,.15)',
                  color: xpMode === 'group' ? 'var(--white)' : 'var(--gold-d)',
                }}
              >
                Group
              </button>
              <button
                onClick={() => { setXpMode('individual'); setXpAmount(''); setXpReason('') }}
                style={{
                  ...S.btnPrimary,
                  background: xpMode === 'individual' ? 'var(--gold)' : 'rgba(200,162,78,.15)',
                  color: xpMode === 'individual' ? 'var(--white)' : 'var(--gold-d)',
                }}
              >
                Individual
              </button>
            </div>

            {xpMode === 'group' ? (
              <HudCard title="Award Experience — Group">
                <div style={{
                  display: 'flex', gap: 'var(--sp-md)',
                  alignItems: 'flex-end', flexWrap: 'wrap',
                }}>
                  <div>
                    <div style={S.label}>Amount</div>
                    <input
                      type="number"
                      min="1"
                      placeholder="0"
                      value={xpAmount}
                      onChange={e => setXpAmount(e.target.value)}
                      style={S.inputNarrow}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '10rem' }}>
                    <div style={S.label}>Reason</div>
                    <input
                      type="text"
                      placeholder="Session reward, quest completion..."
                      value={xpReason}
                      onChange={e => setXpReason(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && requestXpConfirm()}
                      style={S.input}
                    />
                  </div>
                  <button
                    onClick={requestXpConfirm}
                    disabled={xpBusy || !xpAmount}
                    style={{
                      ...S.btnPrimary,
                      opacity: xpBusy || !xpAmount ? 0.5 : 1,
                    }}
                  >
                    {xpBusy ? 'Granting...' : `Grant to All (${characters.length})`}
                  </button>
                </div>
              </HudCard>
            ) : (
              <HudCard title="Award Experience — Individual">
                <div style={{
                  display: 'flex', gap: 'var(--sp-md)',
                  alignItems: 'flex-end', flexWrap: 'wrap',
                }}>
                  <div>
                    <div style={S.label}>Character</div>
                    <select
                      value={xpTarget}
                      onChange={e => setXpTarget(e.target.value)}
                      style={{
                        ...S.input,
                        width: 'auto',
                        minWidth: '10rem',
                      }}
                    >
                      <option value="">Select character...</option>
                      {characters.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.xp_available} avail)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div style={S.label}>Amount</div>
                    <input
                      type="number"
                      placeholder="0"
                      value={xpAmount}
                      onChange={e => setXpAmount(e.target.value)}
                      style={S.inputNarrow}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '10rem' }}>
                    <div style={S.label}>Reason</div>
                    <input
                      type="text"
                      placeholder="Bonus XP, adjustment..."
                      value={xpReason}
                      onChange={e => setXpReason(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && requestXpConfirm()}
                      style={S.input}
                    />
                  </div>
                  <button
                    onClick={requestXpConfirm}
                    disabled={xpBusy || !xpAmount || !xpTarget}
                    style={{
                      ...S.btnPrimary,
                      background: parseInt(xpAmount, 10) < 0 ? 'var(--red)' : 'var(--gold)',
                      opacity: xpBusy || !xpAmount || !xpTarget ? 0.5 : 1,
                    }}
                  >
                    {xpBusy ? 'Processing...' : parseInt(xpAmount, 10) < 0 ? 'Take XP' : 'Grant XP'}
                  </button>
                </div>
              </HudCard>
            )}
          </>
        )}

        {/* ══════════════════════════════════════
            CREDITS TAB
            ══════════════════════════════════════ */}
        {activeTab === 'credits' && (
          <>
            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: 'var(--sp-xs)', marginBottom: 'var(--sp-md)' }}>
              <button
                onClick={() => { setCreditsMode('group'); setCreditsAmount('') }}
                style={{
                  ...S.btnPrimary,
                  background: creditsMode === 'group' ? 'var(--gold)' : 'rgba(200,162,78,.15)',
                  color: creditsMode === 'group' ? 'var(--white)' : 'var(--gold-d)',
                }}
              >
                Group
              </button>
              <button
                onClick={() => { setCreditsMode('individual'); setCreditsAmount('') }}
                style={{
                  ...S.btnPrimary,
                  background: creditsMode === 'individual' ? 'var(--gold)' : 'rgba(200,162,78,.15)',
                  color: creditsMode === 'individual' ? 'var(--white)' : 'var(--gold-d)',
                }}
              >
                Individual
              </button>
            </div>

            {creditsMode === 'group' ? (
              <HudCard title="Distribute Credits — Group">
                <div style={{
                  display: 'flex', gap: 'var(--sp-md)',
                  alignItems: 'flex-end', flexWrap: 'wrap',
                }}>
                  <div>
                    <div style={S.label}>Amount per Character</div>
                    <input
                      type="number"
                      min="1"
                      placeholder="0"
                      value={creditsAmount}
                      onChange={e => setCreditsAmount(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleBulkCredits()}
                      style={S.inputNarrow}
                    />
                  </div>
                  <button
                    onClick={handleBulkCredits}
                    disabled={creditsBusy || !creditsAmount}
                    style={{
                      ...S.btnPrimary,
                      opacity: creditsBusy || !creditsAmount ? 0.5 : 1,
                    }}
                  >
                    {creditsBusy ? 'Distributing...' : `Distribute to All (${characters.length})`}
                  </button>
                </div>
              </HudCard>
            ) : (
              <HudCard title="Distribute Credits — Individual">
                <div style={{
                  display: 'flex', gap: 'var(--sp-md)',
                  alignItems: 'flex-end', flexWrap: 'wrap',
                }}>
                  <div>
                    <div style={S.label}>Character</div>
                    <select
                      value={creditsTarget}
                      onChange={e => setCreditsTarget(e.target.value)}
                      style={{
                        ...S.input,
                        width: 'auto',
                        minWidth: '10rem',
                      }}
                    >
                      <option value="">Select character...</option>
                      {characters.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.credits} cr)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div style={S.label}>Amount</div>
                    <input
                      type="number"
                      placeholder="0"
                      value={creditsAmount}
                      onChange={e => setCreditsAmount(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleIndividualCredits()}
                      style={S.inputNarrow}
                    />
                  </div>
                  <button
                    onClick={handleIndividualCredits}
                    disabled={creditsBusy || !creditsAmount || !creditsTarget}
                    style={{
                      ...S.btnPrimary,
                      background: parseInt(creditsAmount, 10) < 0 ? 'var(--red)' : 'var(--gold)',
                      opacity: creditsBusy || !creditsAmount || !creditsTarget ? 0.5 : 1,
                    }}
                  >
                    {creditsBusy ? 'Processing...' : parseInt(creditsAmount, 10) < 0 ? 'Take Credits' : 'Give Credits'}
                  </button>
                </div>
              </HudCard>
            )}
          </>
        )}

        {/* ══════════════════════════════════════
            LOOT TAB
            ══════════════════════════════════════ */}
        {activeTab === 'loot' && (
          <HudCard title="Loot Generator">
            <div style={{ textAlign: 'center', padding: 'var(--sp-lg)' }}>
              <p style={{ ...S.meta, marginBottom: 'var(--sp-md)' }}>
                Browse, random-roll, and reveal loot to players with a dramatic card.
              </p>
              <button
                onClick={() => { setLootOpen(true); setLootItems([]); setLootSelected(null); setRevealItem(null); setAssignTarget('') }}
                style={{ ...S.btnPrimary, fontSize: 'var(--font-sm)', padding: 'var(--sp-md) var(--sp-xl)' }}
              >
                GENERATE LOOT
              </button>
              {revealItem && (
                <div style={{ marginTop: 'var(--sp-md)', padding: 'var(--sp-sm)', background: 'var(--gold-glow)', border: '1px solid var(--gold-l)' }}>
                  <span style={{ ...S.label, color: 'var(--gold-d)' }}>CURRENTLY REVEALING: </span>
                  <span style={{ ...S.statValue, fontWeight: 700 }}>{revealItem.name}</span>
                </div>
              )}
            </div>
          </HudCard>
        )}

        {/* ══════════════════════════════════════
            LOOT GENERATOR POPUP
            ══════════════════════════════════════ */}
        {lootOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}>
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '800px', maxHeight: '92vh',
                background: 'var(--sand)', border: '2px solid var(--gold)',
                boxShadow: '0 0 60px var(--gold-glow-s), 0 8px 48px rgba(0,0,0,.3)',
                padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
                overflowY: 'auto',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ ...S.sectionTitle, margin: 0 }}>LOOT GENERATOR</div>
                <button onClick={() => setLootOpen(false)} style={{ ...S.btnSmall, fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 700, letterSpacing: '0.1rem' }}>CLOSE</button>
              </div>

              {/* Row 1: Source toggle */}
              <div>
                <div style={S.label}>SOURCE</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['Vendor', 'Searching', 'Looted'] as const).map(s => (
                    <button key={s} onClick={() => setLootSource(s)} style={{
                      ...S.btnSmall,
                      background: lootSource === s ? 'var(--gold)' : 'rgba(255,255,255,.5)',
                      color: lootSource === s ? 'var(--white)' : 'var(--ink)',
                      fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)',
                      fontWeight: 700, letterSpacing: '0.08rem',
                      border: lootSource === s ? '1px solid var(--gold-d)' : '1px solid var(--bdr-l)',
                      padding: 'var(--sp-sm) var(--sp-md)',
                    }}>
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Type filter */}
              <div>
                <div style={S.label}>TYPE</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {([['all', 'All'], ['weapon', 'Weapons'], ['armor', 'Armor'], ['gear', 'Gear']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setLootType(val as typeof lootType)} style={{
                      ...S.btnSmall,
                      background: lootType === val ? 'var(--gold)' : 'rgba(255,255,255,.5)',
                      color: lootType === val ? 'var(--white)' : 'var(--ink)',
                      fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)',
                      fontWeight: 700, letterSpacing: '0.08rem',
                      border: lootType === val ? '1px solid var(--gold-d)' : '1px solid var(--bdr-l)',
                      padding: 'var(--sp-sm) var(--sp-md)',
                    }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Rarity + Name search */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <div style={S.label}>RARITY MIN</div>
                  <input type="number" min={0} max={10} value={lootRarityMin} onChange={e => setLootRarityMin(Number(e.target.value))} style={{ ...S.inputNarrow, width: '4rem' }} />
                </div>
                <div>
                  <div style={S.label}>RARITY MAX</div>
                  <input type="number" min={0} max={10} value={lootRarityMax} onChange={e => setLootRarityMax(Number(e.target.value))} style={{ ...S.inputNarrow, width: '4rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={S.label}>NAME SEARCH</div>
                  <input
                    placeholder="Filter by name..."
                    value={lootSearchText}
                    onChange={e => setLootSearchText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLootBrowse()}
                    style={S.input}
                  />
                </div>
              </div>

              {/* Row 4: Action buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleLootBrowse} disabled={lootBusy} style={{ ...S.btnPrimary, flex: 1, textAlign: 'center', opacity: lootBusy ? 0.5 : 1 }}>
                  BROWSE
                </button>
                <button onClick={handleLootRoll} disabled={lootBusy} style={{ ...S.btnSecondary, flex: 1, textAlign: 'center', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 700, letterSpacing: '0.15rem', padding: 'var(--sp-sm) var(--sp-lg)', opacity: lootBusy ? 0.5 : 1 }}>
                  RANDOM ROLL
                </button>
              </div>

              {/* Results grid */}
              {lootItems.length > 0 && (
                <div style={{ maxHeight: '16rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                  {lootItems.map(item => {
                    const isSelected = lootSelected?.key === item.key && lootSelected?.type === item.type
                    return (
                      <div
                        key={`${item.type}-${item.key}`}
                        onClick={() => setLootSelected(item)}
                        style={{
                          padding: '10px', cursor: 'pointer',
                          background: isSelected ? 'var(--gold-glow)' : 'rgba(255,255,255,.6)',
                          border: `2px solid ${isSelected ? 'var(--gold)' : 'var(--bdr-l)'}`,
                          transition: '.2s', display: 'flex', gap: '8px', alignItems: 'center',
                        }}
                      >
                        <EquipmentImage itemKey={item.key} itemType={item.type} categories={item.categories} size="md" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.04rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.name}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)', color: rarityColor(item.rarity), fontWeight: 700 }}>
                              R{item.rarity}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)', color: 'var(--txt3)' }}>
                              {item.price}cr
                            </span>
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-2xs)',
                            color: item.type === 'weapon' ? 'var(--red)' : item.type === 'armor' ? 'var(--blue)' : 'var(--txt3)',
                            fontWeight: 600, textTransform: 'uppercase', marginTop: '1px',
                          }}>
                            {item.type}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {lootItems.length === 0 && !lootBusy && (
                <div style={{ ...S.meta, textAlign: 'center', padding: 'var(--sp-md)' }}>
                  Use BROWSE or RANDOM ROLL to generate items.
                </div>
              )}

              {/* Selected item preview */}
              {lootSelected && (
                <div style={{
                  background: 'rgba(255,255,255,.8)', border: '1px solid var(--bdr)',
                  padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start',
                }}>
                  <EquipmentImage itemKey={lootSelected.key} itemType={lootSelected.type} categories={lootSelected.categories} size="lg" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.05rem' }}>
                      {lootSelected.name}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: rarityColor(lootSelected.rarity), fontWeight: 700 }}>
                        Rarity {lootSelected.rarity} ({rarityLabel(lootSelected.rarity)})
                      </span>
                      <span style={{ ...S.meta }}>{lootSelected.price} credits</span>
                      <span style={{ ...S.meta }}>Enc {lootSelected.encumbrance}</span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', fontWeight: 600, textTransform: 'uppercase',
                        color: lootSelected.type === 'weapon' ? 'var(--red)' : lootSelected.type === 'armor' ? 'var(--blue)' : 'var(--txt3)',
                      }}>{lootSelected.type}</span>
                    </div>
                    {lootSelected.description && (
                      <div style={{ fontFamily: 'var(--font-chakra)', fontSize: 'var(--font-sm)', color: 'var(--txt2)', marginTop: '6px', lineHeight: 1.4 }}>
                        {lootSelected.description}
                      </div>
                    )}
                    <button
                      onClick={() => handleRevealToPlayers(lootSelected)}
                      style={{ ...S.btnPrimary, marginTop: '10px', fontSize: 'var(--font-xs)' }}
                    >
                      REVEAL TO PLAYERS
                    </button>
                  </div>
                </div>
              )}

              {/* After reveal: Assignment row */}
              {revealItem && (
                <div style={{
                  background: 'var(--gold-glow)', border: '2px solid var(--gold)',
                  padding: '14px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
                }}>
                  <div style={{ ...S.label, margin: 0, color: 'var(--gold-d)' }}>
                    REVEALING: <span style={{ color: 'var(--ink)' }}>{revealItem.name}</span>
                  </div>
                  <select
                    value={assignTarget}
                    onChange={e => setAssignTarget(e.target.value)}
                    style={{ padding: '0.3rem 0.5rem', border: '1px solid var(--bdr-l)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', fontWeight: 500 }}
                  >
                    <option value="">Assign to...</option>
                    {characters.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignLoot}
                    disabled={!assignTarget || lootBusy}
                    style={{ ...S.btnPrimary, fontSize: 'var(--font-xs)', opacity: assignTarget ? 1 : 0.4 }}
                  >
                    ASSIGN
                  </button>
                  <button
                    onClick={handleDismissReveal}
                    style={{ ...S.btnDanger, fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 700, letterSpacing: '0.08rem', padding: 'var(--sp-xs) var(--sp-sm)' }}
                  >
                    DISMISS
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            COMBAT TAB
            ══════════════════════════════════════ */}
        {activeTab === 'combat' && (
          <>
            {!combatActive ? (
              <HudCard title="Initiative">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-md)',
                }}>
                  <span style={S.meta}>No active encounter</span>
                  <button
                    onClick={initCombat}
                    disabled={characters.length === 0}
                    style={{
                      ...S.btnPrimary,
                      opacity: characters.length === 0 ? 0.5 : 1,
                    }}
                  >
                    Start Encounter
                  </button>
                </div>
              </HudCard>
            ) : (
              <HudCard title="Active Encounter">
                {/* Turn controls */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)',
                  marginBottom: 'var(--sp-md)',
                  padding: 'var(--sp-sm) var(--sp-md)',
                  background: 'var(--sand-warm)',
                  border: '1px solid var(--bdr-l)',
                }}>
                  <button onClick={prevTurn} style={S.btnSmall}>&larr; Prev</button>
                  <div style={{
                    fontFamily: 'var(--font-orbitron)',
                    fontSize: 'var(--font-sm)', fontWeight: 700,
                    color: 'var(--gold-d)', letterSpacing: '0.1rem',
                    flex: 1, textAlign: 'center',
                  }}>
                    Turn: {charById(combatSlots[currentTurn]?.characterId)?.name || '---'}
                  </div>
                  <button onClick={nextTurn} style={S.btnSmall}>Next &rarr;</button>
                  <button onClick={sortByInitiative} style={S.btnSecondary}>
                    Sort Init
                  </button>
                  <button onClick={endCombat} style={S.btnDanger}>
                    End Combat
                  </button>
                </div>

                {/* Initiative slots */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-xs)' }}>
                  {combatSlots.map((slot, idx) => {
                    const char = charById(slot.characterId)
                    if (!char) return null
                    const isActive = idx === currentTurn
                    return (
                      <div
                        key={slot.characterId}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)',
                          padding: 'var(--sp-sm) var(--sp-md)',
                          background: isActive ? 'rgba(200,162,78,.12)' : 'rgba(255,255,255,.4)',
                          border: isActive ? '1px solid var(--gold)' : '1px solid var(--bdr-l)',
                          transition: '.2s',
                        }}
                      >
                        {/* Order controls */}
                        <div style={{
                          display: 'flex', flexDirection: 'column', gap: '0.1rem',
                        }}>
                          <button
                            onClick={() => moveSlot(idx, -1)}
                            disabled={idx === 0}
                            style={{
                              ...S.btnSmall,
                              padding: '0 var(--sp-xs)',
                              fontSize: 'var(--font-sm)',
                              opacity: idx === 0 ? 0.3 : 1,
                            }}
                          >
                            &#9650;
                          </button>
                          <button
                            onClick={() => moveSlot(idx, 1)}
                            disabled={idx === combatSlots.length - 1}
                            style={{
                              ...S.btnSmall,
                              padding: '0 var(--sp-xs)',
                              fontSize: 'var(--font-sm)',
                              opacity: idx === combatSlots.length - 1 ? 0.3 : 1,
                            }}
                          >
                            &#9660;
                          </button>
                        </div>

                        {/* Initiative input */}
                        <input
                          type="number"
                          value={slot.initiative || ''}
                          onChange={e => setInitiative(slot.characterId, e.target.value)}
                          placeholder="Init"
                          style={{
                            ...S.inputNarrow,
                            width: '3.5rem',
                            background: isActive ? 'var(--white)' : 'rgba(255,255,255,.6)',
                          }}
                        />

                        {/* Character info */}
                        <div style={{ flex: 1, minWidth: '6rem' }}>
                          <div style={{
                            fontFamily: 'var(--font-orbitron)',
                            fontSize: 'var(--font-sm)', fontWeight: 700,
                            color: isActive ? 'var(--gold-d)' : 'var(--ink)',
                            letterSpacing: '0.05rem',
                          }}>
                            {char.name}
                          </div>
                          <div style={S.meta}>
                            W: <span style={{
                              color: woundColor(char.wound_current, char.wound_threshold),
                              fontWeight: 600,
                            }}>
                              {char.wound_current}/{char.wound_threshold}
                            </span>
                            {' '} S: <span style={{
                              color: woundColor(char.strain_current, char.strain_threshold),
                              fontWeight: 600,
                            }}>
                              {char.strain_current}/{char.strain_threshold}
                            </span>
                          </div>
                        </div>

                        {/* Damage input + apply */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 'var(--sp-xs)',
                        }}>
                          <input
                            type="number"
                            min="1"
                            placeholder="Dmg"
                            value={slot.tempDamage}
                            onChange={e =>
                              setCombatSlots(prev =>
                                prev.map(s =>
                                  s.characterId === slot.characterId
                                    ? { ...s, tempDamage: e.target.value }
                                    : s
                                )
                              )
                            }
                            style={{
                              ...S.inputNarrow,
                              width: '3rem',
                            }}
                          />
                          <button
                            onClick={() => applyDamage(slot.characterId)}
                            disabled={!slot.tempDamage}
                            style={{
                              ...S.btnDanger,
                              opacity: slot.tempDamage ? 1 : 0.4,
                              padding: 'var(--sp-xs)',
                              fontSize: 'var(--font-xs)',
                            }}
                          >
                            +Wound
                          </button>
                        </div>

                        {/* Strain input + apply */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 'var(--sp-xs)',
                        }}>
                          <input
                            type="number"
                            min="1"
                            placeholder="Str"
                            value={slot.tempStrain}
                            onChange={e =>
                              setCombatSlots(prev =>
                                prev.map(s =>
                                  s.characterId === slot.characterId
                                    ? { ...s, tempStrain: e.target.value }
                                    : s
                                )
                              )
                            }
                            style={{
                              ...S.inputNarrow,
                              width: '3rem',
                            }}
                          />
                          <button
                            onClick={() => applyStrain(slot.characterId)}
                            disabled={!slot.tempStrain}
                            style={{
                              ...S.btnSecondary,
                              opacity: slot.tempStrain ? 1 : 0.4,
                              padding: 'var(--sp-xs)',
                              fontSize: 'var(--font-xs)',
                            }}
                          >
                            +Strain
                          </button>
                        </div>

                        {/* Quick heal */}
                        <div style={{
                          display: 'flex', flexDirection: 'column', gap: '0.1rem',
                        }}>
                          <button
                            onClick={() => healWounds(char.id, 1)}
                            style={{ ...S.btnSmall, padding: '0 var(--sp-xs)', fontSize: 'var(--font-2xs)' }}
                          >
                            Heal W
                          </button>
                          <button
                            onClick={() => healStrain(char.id, 1)}
                            style={{ ...S.btnSmall, padding: '0 var(--sp-xs)', fontSize: 'var(--font-2xs)' }}
                          >
                            Heal S
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </HudCard>
            )}
          </>
        )}

        {/* ══════════════════════════════════════
            CRIT TAB
            ══════════════════════════════════════ */}
        {activeTab === 'crit' && (
          <HudCard title="Critical Injury Roller">
            <div style={{
              display: 'flex', gap: 'var(--sp-md)',
              alignItems: 'flex-end', flexWrap: 'wrap',
            }}>
              <div>
                <div style={S.label}>Bonus (existing crits, vicious, etc.)</div>
                <input
                  type="number"
                  min="0"
                  placeholder="+0"
                  value={critBonus}
                  onChange={e => setCritBonus(e.target.value)}
                  style={S.inputNarrow}
                />
              </div>
              <button onClick={rollCrit} style={S.btnPrimary}>
                Roll d100
              </button>

              {critResult && (
                <div style={{
                  padding: 'var(--sp-sm) var(--sp-md)',
                  background: critResult.severity === 'Deadly'
                    ? 'var(--red-pale)'
                    : critResult.severity === 'Daunting'
                      ? 'var(--amber-pale)'
                      : critResult.severity === 'Hard'
                        ? 'var(--amber-pale)'
                        : 'var(--green-pale)',
                  border: '1px solid var(--bdr-l)',
                  flex: 1,
                  minWidth: '12rem',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-orbitron)',
                    fontSize: 'var(--font-sm)', fontWeight: 700,
                    color: critResult.severity === 'Deadly' ? 'var(--red)' : 'var(--ink)',
                    letterSpacing: '0.08rem',
                  }}>
                    [{critResult.roll}] {critResult.name}
                  </div>
                  <div style={S.meta}>
                    Severity: {critResult.severity}
                  </div>
                </div>
              )}
            </div>
          </HudCard>
        )}

        {/* ══════════════════════════════════════
            XP CONFIRMATION DIALOG
            ══════════════════════════════════════ */}
        {xpConfirm && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: 'var(--sand)',
              border: '2px solid var(--gold)',
              padding: 'var(--sp-xl)',
              maxWidth: '28rem',
              width: '90%',
              boxShadow: '0 8px 40px rgba(0,0,0,.25)',
            }}>
              <div style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: 'var(--font-md)',
                fontWeight: 700,
                color: 'var(--gold-d)',
                letterSpacing: '0.15rem',
                marginBottom: 'var(--sp-md)',
              }}>
                Confirm XP {xpConfirm.amount > 0 ? 'Grant' : 'Adjustment'}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-base)',
                color: 'var(--ink)',
                lineHeight: 1.6,
                marginBottom: 'var(--sp-lg)',
              }}>
                <div><strong>Target:</strong> {xpConfirm.targetName || `All characters (${characters.length})`}</div>
                <div><strong>Amount:</strong> <span style={{ color: xpConfirm.amount > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{xpConfirm.amount > 0 ? '+' : ''}{xpConfirm.amount} XP</span></div>
                <div><strong>Reason:</strong> {xpConfirm.reason}</div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-md)', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setXpConfirm(null)}
                  style={S.btnSmall}
                >
                  CANCEL
                </button>
                <button
                  onClick={() => xpConfirm.target ? handleIndividualXp() : handleBulkXp()}
                  style={{
                    ...S.btnPrimary,
                    background: xpConfirm.amount < 0 ? 'var(--red)' : 'var(--gold)',
                  }}
                >
                  CONFIRM
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer spacer ── */}
        <div style={{ height: 'var(--sp-xl)' }} />
      </div>
    </div>
  )
}
