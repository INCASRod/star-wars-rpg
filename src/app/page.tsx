'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { randomUUID } from '@/lib/utils'
import type { Character } from '@/lib/types'

// ─── Design Tokens ───────────────────────────────────────────────────────────
const BG = '#060D09'
const PANEL = 'rgba(8,16,10,0.92)'
const RAISED = 'rgba(14,26,18,0.85)'
const INPUT_BG = 'rgba(6,13,9,0.7)'
const GOLD = '#C8AA50'
const GOLD_L = '#E8CC70'
const GOLD_DIM = 'rgba(200,170,80,0.3)'
const BORDER = 'rgba(200,170,80,0.15)'
const BORDER_MD = 'rgba(200,170,80,0.3)'
const BORDER_HI = 'rgba(200,170,80,0.55)'
const C_BR = '#e05252'
const C_AG = '#52a8e0'
const C_INT = '#a852e0'
const C_CUN = '#e0a852'
const C_WIL = '#52e0a8'
const C_PR = '#e05298'
const SUCCESS = '#3cb96b'
const DANGER = '#e05252'
const WARN = '#e0a852'
const TEXT = '#E8DFC8'
const TEXT_SEC = 'rgba(232,223,200,0.58)'
const TEXT_MUT = 'rgba(232,223,200,0.50)'
const FC = "'Rajdhani', sans-serif"
const FR = "'Rajdhani', sans-serif"
const FM = "'Rajdhani', sans-serif"

const CHAR_COLORS: Record<string, string> = {
  brawn: C_BR, agility: C_AG, intellect: C_INT,
  cunning: C_CUN, willpower: C_WIL, presence: C_PR,
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CharacterSession {
  id: string
  campaign_id: string
  character_id: string
  session_key: string
  player_name: string
  is_active: boolean
  claimed_at: string
}

type CardState = 'available' | 'taken' | 'self'

// ─── Player Identity Helpers ──────────────────────────────────────────────────
function getSessionKey(): string {
  let k = localStorage.getItem('holocron_session_key')
  if (!k) { k = randomUUID(); localStorage.setItem('holocron_session_key', k) }
  return k
}
function getStoredName(): string { return localStorage.getItem('holocron_player_name') ?? '' }

// ─── CharacterCard ────────────────────────────────────────────────────────────
interface CharacterCardProps {
  char: Character
  state: CardState
  session: CharacterSession | undefined
  online: boolean
  playerDisplayName: string | undefined
  sessionKey: string
  animDelay: number
  onClaim: () => void
  onDelete: () => void
}

function CharacterCard({
  char, state, session, online, playerDisplayName,
  animDelay, onClaim, onDelete,
}: CharacterCardProps) {
  const [hovered, setHovered] = useState(false)

  const cardBorder = state === 'self'
    ? BORDER_HI
    : hovered && state === 'available'
      ? BORDER_MD
      : BORDER

  const cardBg = PANEL
  const cardShadow = state === 'self'
    ? `0 0 20px rgba(200,170,80,0.15)`
    : hovered && state === 'available'
      ? `0 8px 24px rgba(200,170,80,0.12)`
      : 'none'

  const cardOpacity = state === 'taken' ? 0.55 : 1
  const cardFilter = state === 'taken' ? 'grayscale(0.3)' : 'none'
  const cardCursor = state === 'available' ? 'pointer' : state === 'taken' ? 'not-allowed' : 'default'
  const cardTransform = hovered && state === 'available' ? 'translateY(-2px)' : 'none'

  const avatarBorderColor = state === 'available' ? BORDER_MD : state === 'taken' ? DANGER : GOLD
  const avatarShadow = state === 'self' ? `0 0 12px rgba(200,170,80,0.4)` : 'none'

  const dotColor = state === 'self'
    ? GOLD
    : online
      ? SUCCESS
      : TEXT_MUT

  const dotPulse = state === 'self' || online ? 'pulse-dot 1.8s ease-in-out infinite' : 'none'

  const nameColor = state === 'self' ? GOLD_L : TEXT

  const characteristics: Array<{ key: string; label: string }> = [
    { key: 'brawn', label: 'BR' },
    { key: 'agility', label: 'AG' },
    { key: 'intellect', label: 'INT' },
    { key: 'cunning', label: 'CUN' },
    { key: 'willpower', label: 'WIL' },
    { key: 'presence', label: 'PR' },
  ]

  const derived: Array<{ label: string; value: number | string }> = [
    { label: 'Soak', value: char.soak },
    { label: 'Wounds', value: char.wound_threshold },
    { label: 'Strain', value: char.strain_threshold },
    { label: 'M.Def', value: char.defense_melee },
    { label: 'R.Def', value: char.defense_ranged },
    { label: 'XP', value: char.xp_available },
  ]

  function handleClick() {
    if (state === 'available') onClaim()
  }

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 6,
        padding: '14px 14px 12px',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.2s',
        animation: `fadeUp 0.5s ${animDelay}s ease both`,
        border: `1px solid ${cardBorder}`,
        background: cardBg,
        opacity: cardOpacity,
        filter: cardFilter,
        cursor: cardCursor,
        transform: cardTransform,
        boxShadow: cardShadow,
      }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top gradient line */}
      {state !== 'taken' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          opacity: state === 'self' ? 1 : hovered ? 0.6 : 0,
          transition: 'opacity 0.2s',
        }} />
      )}

      {/* Delete button */}
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          style={{
            position: 'absolute', top: 6, right: 6,
            width: 22, height: 22,
            background: `rgba(224,82,82,0.12)`,
            border: `1px solid ${DANGER}`,
            borderRadius: 3,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: DANGER,
            transition: '0.15s', zIndex: 2,
            fontFamily: FR,
          }}
          title="Delete character"
        >
          ×
        </button>
      )}

      {/* Section 1 — CardHeader */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{
          flexShrink: 0,
          width: 56, height: 56,
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          border: `2px solid ${avatarBorderColor}`,
          boxShadow: avatarShadow,
          background: RAISED,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {char.portrait_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={char.portrait_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{
              fontFamily: FC, fontSize: 22,
              color: state === 'taken' ? DANGER : state === 'self' ? GOLD : TEXT_SEC,
            }}>
              {char.name.charAt(0)}
            </span>
          )}
          {/* Status dot */}
          <div style={{
            position: 'absolute', bottom: 5, right: 8,
            width: 12, height: 12,
            borderRadius: '50%',
            border: `2px solid ${BG}`,
            background: dotColor,
            animation: dotPulse,
          }} />
        </div>

        {/* Identity block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FC, fontSize: 18, fontWeight: 700, color: nameColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {char.name}
          </div>
          <div style={{ fontFamily: FM, fontSize: 12, color: TEXT_MUT, textTransform: 'uppercase', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {char.career_key} // {char.species_key}{playerDisplayName ? ` // ${playerDisplayName}` : ''}
          </div>
          {/* Status badge */}
          <div style={{
            marginTop: 6,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            border: `1px solid ${state === 'available' ? TEXT_MUT : state === 'taken' ? DANGER : GOLD}`,
            borderRadius: 3,
            padding: '3px 8px',
            background: state === 'available'
              ? 'transparent'
              : state === 'taken'
                ? 'rgba(224,82,82,0.1)'
                : 'rgba(200,170,80,0.1)',
          }}>
            {state === 'available' && (
              <span style={{ fontFamily: FM, fontSize: 10, color: TEXT_MUT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Unselected
              </span>
            )}
            {state === 'taken' && (
              <>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: DANGER, animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
                <span style={{ fontFamily: FM, fontSize: 9, color: DANGER, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  In Session · {session?.player_name}
                </span>
              </>
            )}
            {state === 'self' && (
              <>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
                <span style={{ fontFamily: FM, fontSize: 9, color: GOLD, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  You · Active
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Section 2 — CharacteristicRow */}
      <div style={{
        borderTop: `1px solid ${BORDER}`,
        paddingTop: 10,
        marginTop: 4,
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 4,
      }}>
        {characteristics.map(({ key, label }) => (
          <div key={key} style={{
            background: INPUT_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 3,
            padding: '5px 2px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: FC, fontSize: 18, fontWeight: 700, color: CHAR_COLORS[key] }}>
              {(char as unknown as Record<string, number>)[key]}
            </div>
            <div style={{ fontFamily: FM, fontSize: 11, color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Section 3 — DerivedStatsRow */}
      <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {derived.map(({ label, value }) => (
          <div key={label} style={{
            background: INPUT_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 3,
            padding: '4px 8px',
            minWidth: 42,
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: FC, fontSize: 18, fontWeight: 700, color: TEXT }}>
              {value}
            </div>
            <div style={{ fontFamily: FM, fontSize: 11, color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Section 4 — VitalsPips */}
      <div style={{ marginTop: 8 }}>
        {/* Wounds */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FR, fontSize: 11, color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Wounds</span>
            <span style={{ fontFamily: FM, fontSize: 11, color: TEXT_MUT }}>{char.wound_current}/{char.wound_threshold}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
            {Array.from({ length: char.wound_threshold }).map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: 1,
                background: i < char.wound_current ? DANGER : 'transparent',
                border: `1px solid ${i < char.wound_current ? DANGER : 'rgba(224,82,82,0.3)'}`,
              }} />
            ))}
          </div>
        </div>
        {/* Strain */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FR, fontSize: 11, color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strain</span>
            <span style={{
              fontFamily: FM, fontSize: 11, color: TEXT_MUT
            }}>{char.strain_current}/{char.strain_threshold}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
            {Array.from({ length: char.strain_threshold }).map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: 1,
                background: i < char.strain_current ? WARN : 'transparent',
                border: `1px solid ${i < char.strain_current ? WARN : 'rgba(224,162,82,0.3)'}`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Taken overlay */}
      {state === 'taken' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(6,13,9,0.55)',
          backdropFilter: 'blur(1px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            border: `1px solid rgba(224,82,82,0.6)`,
            background: 'rgba(224,82,82,0.12)',
            borderRadius: 4,
            padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: DANGER, animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
            <span style={{ fontFamily: FC, fontSize: 10, color: DANGER, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Selected by {session?.player_name}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter()

  const [characters, setCharacters] = useState<Character[]>([])
  const [sessions, setSessions] = useState<CharacterSession[]>([])
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({})
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [campaignName, setCampaignName] = useState('Legacy of Rebellion')
  const [sessionKey] = useState<string>(() => typeof window !== 'undefined' ? getSessionKey() : '')
  const [playerName, setPlayerName] = useState<string>(() => typeof window !== 'undefined' ? getStoredName() : '')
  const [onlineKeys, setOnlineKeys] = useState<string[]>([])
  const [showNameModal, setShowNameModal] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [showGmInput, setShowGmInput] = useState(false)
  const [gmPin, setGmPin] = useState('')
  const [sessionMode, setSessionMode] = useState<string>('exploration')
  const [pendingCharId, setPendingCharId] = useState<string | null>(null)

  const campaignIdRef = useRef<string | null>(null)

  // ── Data load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // 1. Fetch first campaign
      const { data: campaigns } = await supabase.from('campaigns').select('*').limit(1)
      if (!campaigns?.length) return
      const camp = campaigns[0]
      setCampaignId(camp.id)
      campaignIdRef.current = camp.id
      setCampaignName(camp.name ?? 'Legacy of Rebellion')
      if (camp.settings?.session_mode) setSessionMode(String(camp.settings.session_mode))

      // 2. Fetch characters
      const { data: chars } = await supabase
        .from('characters')
        .select('*')
        .eq('campaign_id', camp.id)
      if (chars) setCharacters(chars as Character[])

      // 3. Fetch players → playerNames map (player_id → display_name)
      const { data: players } = await supabase.from('players').select('id, display_name')
      if (players) {
        const map: Record<string, string> = {}
        for (const p of players) map[p.id] = p.display_name
        setPlayerNames(map)
      }

      // 4. Fetch character_sessions
      const { data: sessData } = await supabase
        .from('character_sessions')
        .select('*')
        .eq('campaign_id', camp.id)
      if (sessData) setSessions(sessData as CharacterSession[])

      // 5. Show name modal if no name
      if (!getStoredName()) setShowNameModal(true)
    }
    load()
  }, [])

  // ── Realtime: sessions ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!campaignId) return
    const supabase = createClient()

    async function refetchSessions() {
      const { data } = await supabase
        .from('character_sessions')
        .select('*')
        .eq('campaign_id', campaignId!)
      if (data) setSessions(data as CharacterSession[])
    }

    const channel = supabase.channel('char-sessions-rt').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'character_sessions', filter: `campaign_id=eq.${campaignId}` },
      () => { void refetchSessions() }
    ).subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [campaignId])

  // ── Realtime: presence ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!campaignId || !sessionKey) return
    const supabase = createClient()

    const ch = supabase.channel(`lobby-presence-${campaignId}`)
    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState<{ sessionKey: string }>()
      setOnlineKeys(Object.values(state).flat().map((p) => p.sessionKey))
    })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await ch.track({ sessionKey, playerName })
        }
      })

    return () => { void supabase.removeChannel(ch) }
  }, [campaignId, sessionKey, playerName])

  // ── claimCharacter ─────────────────────────────────────────────────────────
  async function claimCharacter(characterId: string) {
    if (!campaignId || !playerName) return
    const supabase = createClient()

    // Release any previous claim by this session_key
    await supabase.from('character_sessions')
      .delete().eq('session_key', sessionKey).eq('campaign_id', campaignId)

    // Claim new character
    const { error } = await supabase.from('character_sessions').insert({
      campaign_id: campaignId,
      character_id: characterId,
      session_key: sessionKey,
      player_name: playerName,
      is_active: true,
    })

    if (error) {
      alert('This character was just claimed by another player.')
      return
    }

    router.push(`/character/${characterId}${campaignId ? `?campaign=${campaignId}` : ''}`)
  }

  // ── deleteCharacter ────────────────────────────────────────────────────────
  async function deleteCharacter(charId: string, charName: string) {
    if (!confirm(`Delete ${charName}? This cannot be undone.`)) return
    const supabase = createClient()
    await supabase.from('character_sessions').delete().eq('character_id', charId)
    await supabase.from('xp_transactions').delete().eq('character_id', charId)
    await supabase.from('character_critical_injuries').delete().eq('character_id', charId)
    await supabase.from('character_gear').delete().eq('character_id', charId)
    await supabase.from('character_armor').delete().eq('character_id', charId)
    await supabase.from('character_weapons').delete().eq('character_id', charId)
    await supabase.from('character_talents').delete().eq('character_id', charId)
    await supabase.from('character_skills').delete().eq('character_id', charId)
    await supabase.from('character_specializations').delete().eq('character_id', charId)
    await supabase.from('characters').delete().eq('id', charId)
    setCharacters(prev => prev.filter(c => c.id !== charId))
  }

  // ── GM login ───────────────────────────────────────────────────────────────
  async function handleGmLogin() {
    if (!campaignId) return
    const supabase = createClient()
    const { data } = await supabase.from('campaigns').select('gm_pin').eq('id', campaignId).single()
    if (data?.gm_pin === gmPin) {
      router.push(`/gm?campaign=${campaignId}`)
    } else {
      alert('Invalid PIN')
    }
  }

  // ── Confirm name ───────────────────────────────────────────────────────────
  function confirmName() {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    localStorage.setItem('holocron_player_name', trimmed)
    setPlayerName(trimmed)
    setShowNameModal(false)
    // If there's a pending claim, execute it now
    if (pendingCharId) {
      void claimCharacter(pendingCharId)
      setPendingCharId(null)
    }
  }

  // ── Derived state ──────────────────────────────────────────────────────────
  function getCardState(charId: string): CardState {
    const session = sessions.find(s => s.character_id === charId && s.is_active)
    if (!session) return 'available'
    if (session.session_key === sessionKey) return 'self'
    return 'taken'
  }

  function getSession(charId: string): CharacterSession | undefined {
    return sessions.find(s => s.character_id === charId && s.is_active)
  }

  function isPlayerOnline(charId: string): boolean {
    const sess = getSession(charId)
    return sess ? onlineKeys.includes(sess.session_key) : false
  }

  const activeSessions = sessions.filter(s => s.is_active)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: BG,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* Background: crosshatch SVG */}
      <svg style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.018,
        width: '100%', height: '100%',
      }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="crosshatch" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="20" x2="20" y2="0" stroke={GOLD} strokeWidth="0.5" />
            <line x1="0" y1="0" x2="20" y2="20" stroke={GOLD} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#crosshatch)" />
      </svg>

      {/* Background: radial gradient */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(200,170,80,0.07) 0%, transparent 70%)`,
      }} />

      {/* Content column */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 1240,
        padding: '48px 20px 60px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 28,
      }}>

        {/* Page Header */}
        <div style={{ animation: 'fadeDown 0.6s ease both', width: '100%' }}>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <span style={{
              position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
              fontSize: 20, color: GOLD_DIM, letterSpacing: 0,
            }}>⬡</span>
            <span style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
              fontSize: 20, color: GOLD_DIM, letterSpacing: 0,
            }}>⬡</span>
            <div style={{
              fontFamily: FC,
              fontWeight: 900,
              fontSize: 28,
              letterSpacing: '0.4em',
              color: GOLD,
              textShadow: '0 0 40px rgba(200,170,80,0.6)',
              display: 'inline-block',
            }}>
              HOLOCRON
            </div>
          </div>
          <div style={{
            fontFamily: FM,
            fontSize: 11,
            letterSpacing: '0.3em',
            color: TEXT_MUT,
            textTransform: 'uppercase',
            marginTop: 10,
            textAlign: 'center',
          }}>
            Star Wars RPG · Campaign Manager
          </div>
          <div style={{
            marginTop: 20,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)`,
          }} />
        </div>

        {/* Session Status Bar */}
        <div style={{
          animation: 'fadeDown 0.6s 0.1s ease both',
          width: '100%',
          background: PANEL,
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          backdropFilter: 'blur(12px)',
          padding: '8px 16px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: SUCCESS,
              animation: 'pulse-dot 1.8s ease-in-out infinite',
            }} />
            <span style={{ fontFamily: FM, fontSize: 11, color: TEXT_SEC }}>
              {onlineKeys.length} players online · {activeSessions.length} claimed
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: BORDER_MD, flexShrink: 0, margin: '0 12px' }} />

          {/* Center */}
          <span style={{ fontFamily: FM, fontSize: 11, color: TEXT_SEC }}>
            Session · <span style={{ letterSpacing: '0.05em' }}>{sessionMode.toUpperCase()}</span>
          </span>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: BORDER_MD, flexShrink: 0, margin: '0 12px' }} />

          {/* Right */}
          <span style={{ fontFamily: FC, fontSize: 11, color: TEXT_MUT }}>
            {campaignName}
          </span>
        </div>

        {/* Section label */}
        <div style={{
          fontFamily: FC,
          fontSize: 9,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: `${GOLD}a5`,
          width: '100%',
        }}>
          Select Your Character
        </div>

        {/* Character Grid */}
        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 12,
        }}>
          {characters.map((char, index) => {
            const cardState = getCardState(char.id)
            const sess = getSession(char.id)
            const online = isPlayerOnline(char.id)
            const displayName = playerNames[char.player_id]
            return (
              <CharacterCard
                key={char.id}
                char={char}
                state={cardState}
                session={sess}
                online={online}
                playerDisplayName={displayName}
                sessionKey={sessionKey}
                animDelay={0.15 + index * 0.08}
                onClaim={() => {
                  if (!playerName) {
                    setPendingCharId(char.id)
                    setShowNameModal(true)
                  } else {
                    void claimCharacter(char.id)
                  }
                }}
                onDelete={() => void deleteCharacter(char.id, char.name)}
              />
            )
          })}
        </div>

        {/* Bottom Actions */}
        <div style={{
          animation: 'fadeUp 0.5s 0.3s ease both',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginTop: 8,
          width: '100%',
          maxWidth: 360,
        }}>
          {/* Create character button */}
          <button
            onClick={() => router.push(`/create?campaign=${campaignId}`)}
            style={{
              background: 'rgba(200,170,80,0.12)',
              border: `1px solid ${BORDER_MD}`,
              color: GOLD,
              fontFamily: FR,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              padding: '10px 0',
              width: '100%',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(200,170,80,0.22)'
              el.style.boxShadow = '0 0 16px rgba(200,170,80,0.2)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(200,170,80,0.12)'
              el.style.boxShadow = 'none'
            }}
          >
            + Create New Character
          </button>

          {/* GM Access */}
          {!showGmInput ? (
            <button
              onClick={() => setShowGmInput(true)}
              style={{
                background: 'transparent',
                border: `1px solid ${BORDER}`,
                color: TEXT_MUT,
                fontFamily: FR,
                fontSize: 14,
                letterSpacing: '0.1em',
                padding: '8px 0',
                width: '100%',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
              }}
              onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${BORDER_MD}` }}
              onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${BORDER}` }}
            >
              GM Access
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
              <input
                type="password"
                maxLength={4}
                placeholder="PIN"
                value={gmPin}
                onChange={e => setGmPin(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && void handleGmLogin()}
                autoFocus
                style={{
                  flex: 1,
                  background: INPUT_BG,
                  border: `1px solid ${BORDER_MD}`,
                  borderRadius: 4,
                  padding: '8px 12px',
                  fontFamily: FM,
                  fontSize: 14,
                  color: TEXT,
                  textAlign: 'center',
                  letterSpacing: '0.3em',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => void handleGmLogin()}
                style={{
                  background: `rgba(200,170,80,0.18)`,
                  border: `1px solid ${BORDER_HI}`,
                  color: GOLD,
                  fontFamily: FC,
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  padding: '8px 16px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Enter
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{ fontFamily: FM, fontSize: 10, color: TEXT_MUT, textAlign: 'center' }}>
            Edge of the Empire // Age of Rebellion // Force and Destiny
          </div>
        </div>
      </div>

      {/* Name Entry Modal */}
      {showNameModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: PANEL,
            border: `1px solid ${BORDER_HI}`,
            borderRadius: 8,
            padding: 28,
            maxWidth: 380,
            width: '90%',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ fontFamily: FC, fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}a5` }}>
              Identify Yourself
            </div>
            <div style={{ fontFamily: FC, fontSize: 18, fontWeight: 700, color: GOLD }}>
              Enter Your Name
            </div>
            <div style={{ fontFamily: FR, fontSize: 12, color: TEXT_SEC, marginTop: 8 }}>
              Your name will be visible to other players
            </div>
            <input
              type="text"
              placeholder="Your name…"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmName()}
              autoFocus
              style={{
                width: '100%',
                background: INPUT_BG,
                border: `1px solid ${BORDER_MD}`,
                borderRadius: 4,
                padding: '10px 14px',
                fontFamily: FC,
                fontSize: 14,
                color: TEXT,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={confirmName}
              style={{
                width: '100%',
                background: 'rgba(200,170,80,0.18)',
                border: `1px solid ${BORDER_HI}`,
                borderRadius: 4,
                padding: 10,
                fontFamily: FC,
                fontSize: 13,
                color: GOLD,
                cursor: 'pointer',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
