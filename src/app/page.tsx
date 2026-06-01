'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { randomUUID } from '@/lib/utils'
import type { Character } from '@/lib/types'
import { VersionWatermark } from '@/components/ui/VersionWatermark'
import { HUD, CHAR_COLOR, FONT_BODY, FS, SP, RADIUS, Z, EASE } from '@/lib/tokens'

// ─── Design Tokens ───────────────────────────────────────────────────────────
const BG        = 'var(--hud-bg)'
const PANEL     = 'var(--hud-surface-hi)'
const RAISED    = 'var(--hud-surface-mid)'
const INPUT_BG  = 'var(--hud-surface-lo)'
const GOLD_L    = HUD.gold
const GOLD_DIM  = 'var(--hud-text-faint)'
const BORDER    = 'var(--hud-border)'
const BORDER_MD = 'var(--hud-border)'
const BORDER_HI = 'var(--hud-border-hi)'
// Raw hex for SVG attributes and <style> strings — CSS vars can't be used there
const ACCENT_HEX = '#E03A1E'
const SUCCESS   = 'var(--state-success)'
const DANGER    = 'var(--state-wounds)'
const WARN      = 'var(--state-strain)'
const TEXT      = 'var(--hud-text)'
const TEXT_SEC  = 'var(--hud-text-dim)'
const TEXT_MUT  = 'var(--hud-text-faint)'

const CHAR_COLORS: Record<string, string> = {
  brawn:     CHAR_COLOR.brawn,
  agility:   CHAR_COLOR.agility,
  intellect: CHAR_COLOR.intellect,
  cunning:   CHAR_COLOR.cunning,
  willpower: CHAR_COLOR.willpower,
  presence:  CHAR_COLOR.presence,
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

type CardState = 'available' | 'self'

// ─── Player Identity Helpers ──────────────────────────────────────────────────
function getSessionKey(): string {
  let k = localStorage.getItem('holocron_session_key')
  if (!k) { k = randomUUID(); localStorage.setItem('holocron_session_key', k) }
  return k
}

// ─── CharacterCard ────────────────────────────────────────────────────────────
interface CharacterCardProps {
  char: Character
  state: CardState
  online: boolean
  animDelay: number
  onClaim: () => void
  onDelete: () => void
}

function CharacterCard({
  char, state, online,
  animDelay, onClaim, onDelete,
}: CharacterCardProps) {
  const [hovered, setHovered] = useState(false)

  const cardBorder = state === 'self'
    ? BORDER_HI
    : hovered
      ? 'color-mix(in srgb, var(--hud-accent) 65%, transparent)'
      : BORDER

  const cardBg = PANEL
  const cardShadow = state === 'self'
    ? '0 2px 10px rgba(90,40,24,0.18)'
    : hovered
      ? '0 4px 12px rgba(90,40,24,0.10)'
      : 'none'

  const cardCursor = state === 'self' ? 'default' : 'pointer'
  const cardTransform = hovered && state !== 'self' ? 'translateY(-2px)' : 'none'

  const avatarBorderColor = state === 'self' ? HUD.gold : BORDER_MD
  const avatarShadow = state === 'self' ? '0 0 8px rgba(90,40,24,0.2)' : 'none'

  const dotColor = state === 'self'
    ? HUD.gold
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
    onClaim()
  }

  return (
    <div
      className={`char-card hov-lift${hovered && state !== 'self' ? ' char-card--glow' : ''}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '7px',
        padding: '8px',
        backdropFilter: 'blur(12px)',
        transition: `all ${EASE.default}`,
        animation: `fadeUp 0.5s ${animDelay}s ease both`,
        border: `1px solid ${cardBorder}`,
        background: cardBg,
        cursor: cardCursor,
      }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '0.125rem',
        background: `linear-gradient(90deg, transparent, ${HUD.gold}, transparent)`,
        opacity: state === 'self' ? 1 : hovered ? 0.6 : 0,
        transition: `opacity ${EASE.default}`,
      }} />

      {/* Delete button */}
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          style={{
            position: 'absolute', top: '0.375rem', right: '0.375rem',
            width: '1.375rem', height: '1.375rem',
            background: 'rgba(224,82,82,0.12)',
            border: `1px solid ${DANGER}`,
            borderRadius: RADIUS.sm,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: FS.sm, fontWeight: 700, color: DANGER,
            transition: EASE.default, zIndex: Z.raised,
            fontFamily: FONT_BODY,
          }}
          title="Delete character"
        >
          ×
        </button>
      )}

      {/* Rebel Alliance watermark — fades in on hover via .char-card-watermark CSS */}
      <div className="char-card-watermark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/factions/rebel.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center', filter: 'opacity(0.2)' }}
        />
      </div>

      {/* Section 1 — CardHeader */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '5px', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{
          flexShrink: 0,
          width: '22px', height: '22px',
          borderRadius: RADIUS.full,
          overflow: 'hidden',
          position: 'relative',
          border: `1px solid ${avatarBorderColor}`,
          boxShadow: avatarShadow,
          background: RAISED,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {char.portrait_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={char.portrait_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{
              fontFamily: FONT_BODY, fontSize: '8px',
              color: state === 'self' ? HUD.gold : TEXT_SEC,
            }}>
              {char.name.charAt(0)}
            </span>
          )}
          {/* Status dot */}
          <div style={{
            position: 'absolute', bottom: '2px', right: '2px',
            width: '5px', height: '5px',
            borderRadius: RADIUS.full,
            border: `1px solid ${BG}`,
            background: dotColor,
            animation: dotPulse,
          }} />
        </div>

        {/* Identity block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: '7.5px', fontWeight: 700, color: nameColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {char.name}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: '6.5px', color: TEXT_MUT, textTransform: 'uppercase', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {char.career_key} // {char.species_key}
          </div>
          {/* Status badge */}
          <div style={{
            marginTop: '2px',
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            border: `1px solid ${state === 'self' ? HUD.gold : TEXT_MUT}`,
            borderRadius: RADIUS.sm,
            padding: '1px 4px',
            background: state === 'self' ? 'var(--hud-surface-lo)' : 'transparent',
          }}>
            {state === 'available' && (
              <span style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: TEXT_MUT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Unselected
              </span>
            )}
            {state === 'self' && (
              <>
                <div style={{ width: '4px', height: '4px', borderRadius: RADIUS.full, background: HUD.gold, animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
                <span style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: HUD.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
        paddingTop: '3px',
        marginTop: '3px',
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '2px',
      }}>
        {characteristics.map(({ key, label }) => (
          <div key={key} style={{
            background: INPUT_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: RADIUS.sm,
            padding: '2px 1px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: '9px', fontWeight: 700, color: CHAR_COLORS[key] }}>
              {(char as unknown as Record<string, number>)[key]}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Section 3 — DerivedStatsRow */}
      <div style={{ marginTop: '3px', display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
        {derived.map(({ label, value }) => (
          <div key={label} style={{
            background: INPUT_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: RADIUS.sm,
            padding: '2px 4px',
            minWidth: '2rem',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: '8px', fontWeight: 700, color: TEXT }}>
              {value}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '5px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Section 4 — VitalsPips */}
      <div style={{ marginTop: '3px' }}>
        {/* Wounds */}
        <div style={{ marginBottom: '3px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em', width: '28px' }}>Wounds</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: TEXT_MUT }}>{char.wound_current}/{char.wound_threshold}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
            {Array.from({ length: char.wound_threshold }).map((_, i) => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '1px',
                background: i < char.wound_current ? DANGER : 'transparent',
                border: `1px solid ${i < char.wound_current ? DANGER : 'color-mix(in srgb, var(--hud-accent) 25%, transparent)'}`,
              }} />
            ))}
          </div>
        </div>
        {/* Strain */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: '5.5px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em', width: '28px' }}>Strain</span>
            <span style={{
              fontFamily: FONT_BODY, fontSize: '5.5px', color: TEXT_MUT
            }}>{char.strain_current}/{char.strain_threshold}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
            {Array.from({ length: char.strain_threshold }).map((_, i) => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '1px',
                background: i < char.strain_current ? WARN : 'transparent',
                border: `1px solid ${i < char.strain_current ? WARN : 'var(--hud-border)'}`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Interactable hint — arrow circle, bottom-right, appears on hover */}
      <div className="char-card-hint">
        <div className="char-card-hint-arrow" />
      </div>

    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter()

  const [characters, setCharacters] = useState<Character[]>([])
  const [sessions, setSessions] = useState<CharacterSession[]>([])
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [campaignName, setCampaignName] = useState('Legacy of Rebellion')
  const [sessionKey] = useState<string>(() => typeof window !== 'undefined' ? getSessionKey() : '')
  const [onlineKeys, setOnlineKeys] = useState<string[]>([])
  const [showGmInput, setShowGmInput] = useState(false)
  const [gmPin, setGmPin] = useState('')
  const [sessionMode, setSessionMode] = useState<string>('exploration')
  const [createHovered, setCreateHovered] = useState(false)

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
        .eq('is_archived', false)
      if (chars) setCharacters(chars as Character[])

      // 3. Fetch character_sessions
      const { data: sessData } = await supabase
        .from('character_sessions')
        .select('*')
        .eq('campaign_id', camp.id)
      if (sessData) setSessions(sessData as CharacterSession[])
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
          await ch.track({ sessionKey })
        }
      })

    return () => { void supabase.removeChannel(ch) }
  }, [campaignId, sessionKey])

  // ── claimCharacter ─────────────────────────────────────────────────────────
  async function claimCharacter(characterId: string) {
    if (!campaignId) return
    const supabase = createClient()

    // Release any previous claim by this session_key
    await supabase.from('character_sessions')
      .delete().eq('session_key', sessionKey).eq('campaign_id', campaignId)

    // Release any existing session for this character (so anyone can take it)
    await supabase.from('character_sessions')
      .delete().eq('character_id', characterId).eq('campaign_id', campaignId)

    // Claim the character
    await supabase.from('character_sessions').insert({
      campaign_id:  campaignId,
      character_id: characterId,
      session_key:  sessionKey,
      is_active:    true,
    })

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

  // ── Derived state ──────────────────────────────────────────────────────────
  function getCardState(charId: string): CardState {
    const session = sessions.find(s => s.character_id === charId && s.is_active)
    if (session?.session_key === sessionKey) return 'self'
    return 'available'
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
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: Z.base, opacity: 0.018,
        width: '100%', height: '100%',
      }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="crosshatch" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="20" x2="20" y2="0" stroke={ACCENT_HEX} strokeWidth="0.5" />
            <line x1="0" y1="0" x2="20" y2="20" stroke={ACCENT_HEX} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#crosshatch)" />
      </svg>

      {/* Background: radial gradient */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: Z.base, pointerEvents: 'none',
        background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(224,58,30,0.06) 0%, transparent 70%)`,
      }} />

      {/* Content column */}
      <div style={{
        position: 'relative', zIndex: Z.raised,
        width: '100%', maxWidth: '77.5rem',
        padding: `${SP[12]} var(--space-5) 3.75rem`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: SP[6],
      }}>

        {/* Page Header */}
        <div style={{ animation: 'fadeDown 0.6s ease both', width: '100%' }}>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <span style={{
              position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
              fontSize: FS.bodyLg, color: GOLD_DIM, letterSpacing: 0,
            }}>⬡</span>
            <span style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
              fontSize: FS.bodyLg, color: GOLD_DIM, letterSpacing: 0,
            }}>⬡</span>
            <div style={{
              fontFamily: FONT_BODY,
              fontWeight: 900,
              fontSize: FS.h1,
              letterSpacing: '0.4em',
              color: HUD.gold,
              textShadow: '0 0 40px rgba(224,58,30,0.45)',
              display: 'inline-block',
            }}>
              HOLOCRON
            </div>
          </div>
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: FS.label,
            letterSpacing: '0.3em',
            color: TEXT_MUT,
            textTransform: 'uppercase',
            marginTop: SP[5],
            textAlign: 'center',
          }}>
            Star Wars RPG · Campaign Manager
          </div>
          <div style={{
            marginTop: SP[5],
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)`,
          }} />
        </div>

        {/* Session Status Bar */}
        <div style={{
          animation: 'fadeDown 0.6s 0.1s ease both',
          width: '100%',
          background: PANEL,
          border: `1px solid ${BORDER}`,
          borderRadius: RADIUS.lg,
          backdropFilter: 'blur(12px)',
          padding: `${SP[2]} ${SP[4]}`,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
            <div style={{
              width: '0.5rem', height: '0.5rem', borderRadius: RADIUS.full,
              background: SUCCESS,
              animation: 'pulse-dot 1.8s ease-in-out infinite',
            }} />
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: TEXT_SEC }}>
              {onlineKeys.length} players online · {activeSessions.length} claimed
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '1.25rem', background: BORDER_MD, flexShrink: 0, margin: `0 0.75rem` }} />

          {/* Center */}
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: TEXT_SEC }}>
            Session · <span style={{ letterSpacing: '0.05em' }}>{sessionMode.toUpperCase()}</span>
          </span>

          {/* Divider */}
          <div style={{ width: '1px', height: '1.25rem', background: BORDER_MD, flexShrink: 0, margin: `0 0.75rem` }} />

          {/* Right */}
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: TEXT_MUT }}>
            {campaignName}
          </span>
        </div>

        {/* Section label */}
        <div style={{
          fontFamily: FONT_BODY,
          fontSize: FS.overline,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: TEXT_MUT,
          width: '100%',
        }}>
          Select Your Character
        </div>

        {/* Character Grid */}
        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}>
          {characters.map((char, index) => {
            const cardState = getCardState(char.id)
            const online = isPlayerOnline(char.id)
            return (
              <CharacterCard
                key={char.id}
                char={char}
                state={cardState}
                online={online}
                animDelay={0.15 + index * 0.08}
                onClaim={() => void claimCharacter(char.id)}
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
          gap: SP[3],
          marginTop: SP[2],
          width: '100%',
          maxWidth: '22.5rem',
        }}>
          {/* Create character button */}
          <button
            onClick={() => router.push(`/create?campaign=${campaignId}`)}
            onMouseEnter={() => setCreateHovered(true)}
            onMouseLeave={() => setCreateHovered(false)}
            style={{
              background: createHovered ? 'color-mix(in srgb, var(--hud-accent) 20%, transparent)' : 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
              boxShadow: createHovered ? '0 0 16px rgba(224,58,30,0.2)' : 'none',
              border: `1px solid ${BORDER_MD}`,
              color: HUD.gold,
              fontFamily: FONT_BODY,
              fontSize: FS.sm,
              fontWeight: 700,
              letterSpacing: '0.1em',
              padding: `0.625rem 0`,
              width: '100%',
              borderRadius: RADIUS.md,
              cursor: 'pointer',
              transition: `all ${EASE.default}`,
              textTransform: 'uppercase',
            }}
          >
            + Create New Character
          </button>

          {/* GM Access */}
          {!showGmInput ? (
            <button
              onClick={() => setShowGmInput(true)}
              className="gm-access-btn"
              style={{
                background: 'transparent',
                border: `1px solid ${BORDER}`,
                color: TEXT_MUT,
                fontFamily: FONT_BODY,
                fontSize: FS.sm,
                letterSpacing: '0.1em',
                padding: `${SP[2]} 0`,
                width: '100%',
                borderRadius: RADIUS.md,
                cursor: 'pointer',
                transition: `all ${EASE.default}`,
                textTransform: 'uppercase',
              }}
            >
              GM Access
            </button>
          ) : (
            <div style={{ display: 'flex', gap: SP[2], width: '100%', alignItems: 'center' }}>
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
                  borderRadius: RADIUS.md,
                  padding: `${SP[2]} ${SP[3]}`,
                  fontFamily: FONT_BODY,
                  fontSize: FS.sm,
                  color: TEXT,
                  textAlign: 'center',
                  letterSpacing: '0.3em',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => void handleGmLogin()}
                style={{
                  background: 'color-mix(in srgb, var(--hud-accent) 20%, transparent)',
                  border: `1px solid ${BORDER_HI}`,
                  color: HUD.gold,
                  fontFamily: FONT_BODY,
                  fontSize: FS.label,
                  letterSpacing: '0.1em',
                  padding: `${SP[2]} ${SP[4]}`,
                  borderRadius: RADIUS.md,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Enter
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: TEXT_MUT, textAlign: 'center' }}>
            Edge of the Empire // Age of Rebellion // Force and Destiny
          </div>
        </div>
      </div>

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
        .gm-access-btn:hover { border-color: var(--hud-border-hi); }
      `}</style>
      <VersionWatermark />
    </div>
  )
}
