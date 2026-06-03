'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { randomUUID } from '@/lib/utils'
import type { Character } from '@/lib/types'
import { VersionWatermark } from '@/components/ui/VersionWatermark'
import { HUD, CHAR_COLOR, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, Z, EASE } from '@/lib/tokens'
import { useCharacterSelectStore } from '@/store/characterSelectStore'
import { TransitionCard } from '@/components/ui/TransitionCard'

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
  char:            Character
  state:           CardState
  online:          boolean
  animDelay:       number
  onSelect:        (rect: DOMRect) => void
  onDelete:        () => void
  hyperTransform?: string
  hyperOpacity?:   number
}

function CharacterCard({
  char, state, online,
  animDelay, onSelect, onDelete,
  hyperTransform, hyperOpacity,
}: CharacterCardProps) {
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const cardBorder = state === 'self'
    ? BORDER_HI
    : hovered
      ? 'color-mix(in srgb, var(--hud-accent) 65%, transparent)'
      : BORDER

  const cardBg = PANEL
  const cardShadow = state === 'self'
    ? '0 2px 10px rgba(90,40,24,0.18)'
    : undefined

  const cardCursor = state === 'self' ? 'default' : 'pointer'
  const cardTransform = hovered && state !== 'self' ? 'translateY(-2px)' : 'none'

  const [imgError, setImgError] = useState(false)
  const showFallback = !char.portrait_url || imgError

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

  const combat = [
    { label: 'Soak',  value: char.soak },
    { label: 'M.Def', value: char.defense_melee },
    { label: 'R.Def', value: char.defense_ranged },
  ]
  const resources = [
    { label: 'W.Thr', value: char.wound_threshold },
    { label: 'S.Thr', value: char.strain_threshold },
    { label: 'XP',    value: char.xp_available },
  ]

  function handleClick() {
    if (!cardRef.current) return
    onSelect(cardRef.current.getBoundingClientRect())
  }

  return (
    <div
      ref={cardRef}
      className={`char-card hov-lift${hovered && state !== 'self' ? ' char-card--glow' : ''}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '7px',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(12px)',
        transition: hyperTransform !== undefined
          ? 'transform 0.35s cubic-bezier(0.4,0,1,1), opacity 0.3s ease 0.1s'
          : `all ${EASE.default}`,
        animation: `fadeUp 0.5s ${animDelay}s ease both`,
        border: `1px solid ${cardBorder}`,
        background: cardBg,
        cursor: cardCursor,
        ...(hyperTransform !== undefined ? { transform:  hyperTransform } : {}),
        ...(hyperOpacity !== undefined   ? { opacity:    hyperOpacity }   : {}),
        ...(cardShadow                   ? { boxShadow:  cardShadow }     : {}),
      }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top gradient line — unchanged */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '0.125rem',
        background: `linear-gradient(90deg, transparent, ${HUD.gold}, transparent)`,
        opacity: state === 'self' ? 1 : hovered ? 0.6 : 0,
        transition: `opacity ${EASE.default}`,
        zIndex: 10,
      }} />

      {/* Delete button — unchanged */}
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
            transition: EASE.default, zIndex: 15,
            fontFamily: FONT_BODY,
          }}
          title="Delete character"
        >
          ×
        </button>
      )}

      {/* Rebel watermark — right edge, full card height, bleeds off right */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0, right: '-20px',
        pointerEvents: 'none',
        zIndex: 4,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.4s ease 0.08s',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/factions/rebel.png"
          alt=""
          style={{ height: '100%', width: 'auto', filter: 'opacity(0.13)' }}
        />
      </div>

      {/* ── Top section: Zone A (portrait) + Zone B (stats) ── */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* ZONE A — Portrait panel */}
        <div style={{
          width: '95px',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          borderRight: `1px solid ${BORDER}`,
        }}>
          {showFallback ? (
            <div style={{
              width: '100%', height: '100%', minHeight: '90px',
              background: 'var(--hud-surface-lo)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '6px',
            }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUT, textAlign: 'center', lineHeight: 1.4 }}>
                No image uploaded
              </span>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={char.portrait_url!}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
              onError={() => setImgError(true)}
            />
          )}

          {/* Status dot */}
          <div style={{
            position: 'absolute', top: '5px', left: '5px',
            width: '6px', height: '6px',
            borderRadius: RADIUS.full,
            border: '1px solid rgba(0,0,0,0.5)',
            background: dotColor,
            animation: dotPulse,
            zIndex: 5,
          }} />

          {/* Bottom gradient + identity overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 100%)',
            padding: '18px 5px 5px',
            zIndex: 5,
          }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: nameColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {char.name}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUT, textTransform: 'uppercase', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {char.career_key} // {char.species_key}
            </div>
            <div style={{
              marginTop: '3px',
              display: 'inline-flex', alignItems: 'center', gap: '2px',
              border: `1px solid ${state === 'self' ? HUD.gold : TEXT_MUT}`,
              borderRadius: RADIUS.sm,
              padding: '1px 4px',
              background: 'rgba(0,0,0,0.45)',
            }}>
              {state === 'available' && (
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Unselected
                </span>
              )}
              {state === 'self' && (
                <>
                  <div style={{ width: '4px', height: '4px', borderRadius: RADIUS.full, background: HUD.gold, animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    You · Active
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ZONE B — Stats panel */}
        <div style={{ flex: 1, padding: '6px 7px', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>

          {/* Characteristics */}
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, marginBottom: '2px' }}>
              Characteristics
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px' }}>
              {characteristics.map(({ key, label }) => (
                <div key={key} style={{
                  background: INPUT_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: RADIUS.sm,
                  padding: '2px 1px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: CHAR_COLORS[key] }}>
                    {(char as unknown as Record<string, number>)[key]}
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Combat */}
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, marginBottom: '2px' }}>
              Combat
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
              {combat.map(({ label, value }) => (
                <div key={label} style={{
                  background: INPUT_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: RADIUS.sm,
                  padding: '2px 4px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: TEXT }}>
                    {value}
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, marginBottom: '2px' }}>
              Resources
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
              {resources.map(({ label, value }) => (
                <div key={label} style={{
                  background: INPUT_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: RADIUS.sm,
                  padding: '2px 4px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: TEXT }}>
                    {value}
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ZONE C — Pip tracker, full-width bottom strip */}
      <div style={{
        borderTop: `1px solid ${BORDER}`,
        background: 'var(--hud-surface-lo)',
        padding: '5px 8px',
      }}>
        {/* Wounds */}
        <div style={{ marginBottom: '3px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em', width: '28px' }}>Wounds</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUT }}>{char.wound_current}/{char.wound_threshold}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
            {Array.from({ length: char.wound_threshold }).map((_, i) => (
              <div key={i} style={{
                width: '8px', height: '8px', borderRadius: '1px',
                background: i < char.wound_current ? DANGER : 'transparent',
                border: `1px solid ${i < char.wound_current ? DANGER : 'color-mix(in srgb, var(--hud-accent) 25%, transparent)'}`,
              }} />
            ))}
          </div>
        </div>
        {/* Strain */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em', width: '28px' }}>Strain</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: TEXT_MUT }}>{char.strain_current}/{char.strain_threshold}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
            {Array.from({ length: char.strain_threshold }).map((_, i) => (
              <div key={i} style={{
                width: '8px', height: '8px', borderRadius: '1px',
                background: i < char.strain_current ? WARN : 'transparent',
                border: `1px solid ${i < char.strain_current ? WARN : 'var(--hud-border)'}`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Interactable hint */}
      <div className="char-card-hint">
        <div className="char-card-hint-arrow" />
      </div>

    </div>
  )
}

// ─── Hyperspace ───────────────────────────────────────────────────────────────
type HyperspacePhase = 'idle' | 'beat1' | 'beat24' | 'loading'

interface HyperspaceState {
  phase:    HyperspacePhase
  charId:   string
  cardRect: DOMRect | null
}

function runHyperspaceCanvas(
  canvas: HTMLCanvasElement,
  originX: number,
  originY: number,
  onComplete: () => void,
): () => void {
  const ctxOrNull = canvas.getContext('2d')
  if (!ctxOrNull) { onComplete(); return () => {} }
  const ctx: CanvasRenderingContext2D = ctxOrNull
  const W = canvas.width
  const H = canvas.height
  const TOTAL_MS = 900
  const maxDist   = Math.hypot(W, H)

  const STAR_COUNT = 200
  const COLOR_BASES = [
    'rgba(240,248,255,',  // white-silver
    'rgba(200,220,255,',  // ice blue
    'rgba(160,190,255,',  // cool blue
  ]

  const stars = Array.from({ length: STAR_COUNT }, (_, i) => {
    const angle = (i / STAR_COUNT) * Math.PI * 2
                  + (Math.random() - 0.5) * 0.04
    return {
      angle,
      speed:     0.55 + Math.random() * 0.7,
      width:     Math.random() < 0.25
                   ? 2 + Math.random() * 5
                   : 0.4 + Math.random() * 1.2,
      bright:    0.5 + Math.random() * 0.5,
      colorBase: COLOR_BASES[Math.floor(Math.random() * COLOR_BASES.length)],
    }
  })

  let startTime: number | null = null
  let rafId = 0

  function frame(timestamp: number) {
    if (!startTime) startTime = timestamp
    const t = Math.min((timestamp - startTime) / TOTAL_MS, 1)
    ctx.clearRect(0, 0, W, H)

    const alpha = t < 0.15
      ? t / 0.15
      : t > 0.75
        ? 1 - (t - 0.75) / 0.25
        : 1

    const eased = Math.pow(t, 1.5)  // slow-start acceleration
    ctx.globalAlpha = 1
    stars.forEach(star => {
      const tipDist  = eased * star.speed * maxDist
      const tailDist = Math.max(0, tipDist - (20 + eased * 150))
      if (tipDist < 1) return

      const cos   = Math.cos(star.angle)
      const sin   = Math.sin(star.angle)
      const tipX  = originX + cos * tipDist
      const tipY  = originY + sin * tipDist
      const tailX = originX + cos * tailDist
      const tailY = originY + sin * tailDist

      const grad = ctx.createLinearGradient(tailX, tailY, tipX, tipY)
      const a    = (alpha * 0.85 * star.bright).toFixed(3)
      grad.addColorStop(0, star.colorBase + '0)')
      grad.addColorStop(1, star.colorBase + a + ')')

      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(tipX, tipY)
      ctx.strokeStyle = grad
      ctx.lineWidth   = star.width * (0.8 + eased)
      ctx.stroke()
    })

    if (t >= 0.45 && t <= 0.72) {
      const ft     = (t - 0.45) / 0.27
      const fAlpha = Math.sin(ft * Math.PI) * 0.6
      const fRad   = 60 + ft * 200
      const grad   = ctx.createRadialGradient(originX, originY, 0, originX, originY, fRad)
      grad.addColorStop(0,   `rgba(255,240,200,${fAlpha})`)
      grad.addColorStop(0.3, `rgba(224,48,32,${fAlpha * 0.6})`)
      grad.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.globalAlpha = 1
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    }

    if (t < 1) {
      rafId = requestAnimationFrame(frame)
    } else {
      ctx.clearRect(0, 0, W, H)
      onComplete()
    }
  }

  rafId = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(rafId)
}

// ─── Loading Messages ─────────────────────────────────────────────────────
const LOADING_TEXTS = [
  'Accessing rebel alliance records...',
  'Syncing holonet profile data...',
  'Decrypting imperial wanted list...',
  'Establishing secure channel...',
  'Verifying rebel clearance codes...',
  'Loading character dossier...',
] as const

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

  const [hyper, setHyper] = useState<HyperspaceState>({ phase: 'idle', charId: '', cardRect: null })
  const [focusCharacter, setFocusCharacter] = useState<Character | null>(null)
  const [loadingTextIdx, setLoadingTextIdx] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cancelCanvasRef = useRef<(() => void) | null>(null)
  const hyperTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoElRef = useRef<HTMLVideoElement | null>(null)
  const videoFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoRemoveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // ── Hyperspace video helpers ───────────────────────────────────────────────
  function removeHyperspaceVideo() {
    if (videoFadeTimerRef.current)   { clearTimeout(videoFadeTimerRef.current);   videoFadeTimerRef.current   = null }
    if (videoRemoveTimerRef.current) { clearTimeout(videoRemoveTimerRef.current); videoRemoveTimerRef.current = null }
    const v = videoElRef.current
    if (!v) return
    v.pause()
    v.remove()
    videoElRef.current = null
  }

  function startHyperspaceVideo() {
    const v = document.createElement('video')
    v.src         = '/videos/hyperspace-void.mp4'
    v.autoplay    = true
    v.loop        = true
    v.muted       = true
    v.playsInline = true
    v.style.position      = 'fixed'
    v.style.inset         = '0'
    v.style.width         = '100%'
    v.style.height        = '100%'
    v.style.objectFit     = 'cover'
    v.style.zIndex        = '21'
    v.style.pointerEvents = 'none'
    // Desaturate first, then rotate — reliable blue regardless of source hue
    v.style.filter        = 'saturate(0.4) brightness(0.75) contrast(1.1) sepia(0.5) hue-rotate(180deg)'
    v.style.opacity       = '0'
    v.style.transition    = 'opacity 0.5s ease'
    document.body.appendChild(v)
    videoElRef.current = v

    // Fade in on next paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { if (videoElRef.current === v) v.style.opacity = '1' })
    })

    // Begin fade-out at 4 s
    videoFadeTimerRef.current = setTimeout(() => {
      if (videoElRef.current === v) {
        v.style.transition = 'opacity 0.6s ease'
        v.style.opacity    = '0'
      }
    }, 4000)

    // Remove element after fade completes (4.6 s)
    videoRemoveTimerRef.current = setTimeout(() => {
      if (videoElRef.current === v) { v.pause(); v.remove(); videoElRef.current = null }
    }, 4600)
  }

  // ── Cleanup: hyperspace animation and unmount reset ────────────────────────
  useEffect(() => {
    return () => {
      if (hyperTimeoutRef.current) clearTimeout(hyperTimeoutRef.current)
      cancelCanvasRef.current?.()
      removeHyperspaceVideo()
      setHyper({ phase: 'idle', charId: '', cardRect: null })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading text cycling ───────────────────────────────────────────────────
  useEffect(() => {
    if (hyper.phase !== 'loading') return
    setLoadingTextIdx(0)
    const id = setInterval(() => {
      setLoadingTextIdx(prev => (prev + 1) % LOADING_TEXTS.length)
    }, 1800)
    return () => clearInterval(id)
  }, [hyper.phase])

  // ── Navigation: after loading phase begins, push to character screen ───────
  // Timer is 4 600 ms so the video plays in full (4 s) and fades out (600 ms)
  // before the route transition fires.
  useEffect(() => {
    if (hyper.phase !== 'loading') return
    const timer = setTimeout(() => {
      removeHyperspaceVideo()
      router.push(`/character/${hyper.charId}${campaignId ? `?campaign=${campaignId}` : ''}`)
    }, 4600)
    return () => clearTimeout(timer)
  }, [hyper.phase, hyper.charId, campaignId, router]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── claimCharacterDB — DB writes only, no router.push ──────────────────────
  async function claimCharacterDB(characterId: string) {
    if (!campaignId) return
    const supabase = createClient()
    await supabase.from('character_sessions')
      .delete().eq('session_key', sessionKey).eq('campaign_id', campaignId)
    await supabase.from('character_sessions')
      .delete().eq('character_id', characterId).eq('campaign_id', campaignId)
    await supabase.from('character_sessions').insert({
      campaign_id:  campaignId,
      character_id: characterId,
      session_key:  sessionKey,
      is_active:    true,
    })
  }

  // ── handleCardSelect — orchestrates hyperspace animation ───────────────────
  function handleCardSelect(charId: string, rect: DOMRect) {
    if (hyper.phase !== 'idle') return

    // Write selected character to store before navigation fires
    const charForStore = characters.find(c => c.id === charId) ?? null
    useCharacterSelectStore.getState().setSelectedCharacter(charForStore)

    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      void claimCharacter(charId)
      return
    }

    setFocusCharacter(charForStore)
    void claimCharacterDB(charId)

    setHyper({ phase: 'beat1', charId, cardRect: rect })

    hyperTimeoutRef.current = setTimeout(() => {
      setHyper({ phase: 'beat24', charId, cardRect: rect })

      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight

      const cx = rect.left + rect.width  / 2
      const cy = rect.top  + rect.height / 2

      cancelCanvasRef.current = runHyperspaceCanvas(canvas, cx, cy, () => {
        setHyper({ phase: 'loading', charId, cardRect: rect })
        startHyperspaceVideo()
      })
    }, 120)
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
        padding: `10px var(--space-5) 16px`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '8px',
      }}>

        {/* Page Header */}
        <div style={{ animation: 'fadeDown 0.6s ease both', width: '100%' }}>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <span style={{
              position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
              fontSize: FS.label, color: GOLD_DIM, letterSpacing: 0,
            }}>⬡</span>
            <span style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
              fontSize: FS.label, color: GOLD_DIM, letterSpacing: 0,
            }}>⬡</span>
            <div style={{
              fontFamily: FONT_BODY,
              fontWeight: 900,
              fontSize: FS.sm,
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
            fontSize: FS.overline,
            letterSpacing: '0.3em',
            color: TEXT_MUT,
            textTransform: 'uppercase',
            marginTop: '2px',
            textAlign: 'center',
          }}>
            Star Wars RPG · Campaign Manager
          </div>
          <div style={{
            marginTop: '2px',
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '8px',
        }}>
          {characters.map((char, index) => {
            const cardState  = getCardState(char.id)
            const online     = isPlayerOnline(char.id)
            const isSelected = hyper.phase !== 'idle' && hyper.charId === char.id
            const isOther    = hyper.phase !== 'idle' && hyper.charId !== char.id

            let hyperTransform: string | undefined
            let hyperOpacity:   number | undefined

            if (isSelected) {
              if (hyper.phase === 'beat1') {
                hyperTransform = 'scale(0.94)'
              } else if (hyper.phase === 'beat24') {
                hyperTransform = 'scaleX(6) scaleY(0.15) translateX(60px)'
                hyperOpacity   = 0
              }
            } else if (isOther && (hyper.phase === 'beat24' || hyper.phase === 'loading')) {
              hyperOpacity = 0.08
            }

            return (
              <CharacterCard
                key={char.id}
                char={char}
                state={cardState}
                online={online}
                animDelay={0.15 + index * 0.08}
                onSelect={(rect) => handleCardSelect(char.id, rect)}
                onDelete={() => void deleteCharacter(char.id, char.name)}
                hyperTransform={hyperTransform}
                hyperOpacity={hyperOpacity}
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

      {/* ── Hyperspace canvas ── */}
      <canvas
        ref={canvasRef}
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        20,
          pointerEvents: 'none',
          display: hyper.phase === 'beat24' || hyper.phase === 'loading' ? 'block' : 'none',
        }}
      />

      {/* ── Hyperspace dark overlay ── */}
      {(hyper.phase === 'beat24' || hyper.phase === 'loading') && (
        <div style={{
          position:      'fixed',
          inset:         0,
          zIndex:        12,
          background:    'rgba(10,8,6,0)',
          animation:     'hyperspaceOverlay 0.7s ease forwards',
          pointerEvents: 'none',
        }} />
      )}

      {/* ── Hyperspace focus card + loading strip — visible from card click to post-navigation ── */}
      {focusCharacter && (() => {
        // Fly-to-centre: at beat1 place card over the clicked card; on beat24+ spring to centre.
        const rect = hyper.cardRect
        const isBeat1 = hyper.phase === 'beat1'
        let dx = 0, dy = 0
        if (isBeat1 && rect && typeof window !== 'undefined') {
          const cx = rect.left + rect.width  / 2
          const cy = rect.top  + rect.height / 2
          dx = cx - window.innerWidth  / 2
          dy = cy - window.innerHeight / 2
        }
        const cardTransform  = isBeat1 ? `translate(${dx}px,${dy}px) scale(0.85)` : 'translate(0,0) scale(1)'
        const cardTransition = isBeat1 ? 'none' : 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease'
        const cardOpacity    = isBeat1 ? 0 : 1

        return (
        <div style={{
          position:       'fixed',
          inset:          0,
          zIndex:         23,
          background:     'transparent',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '16px',
          pointerEvents:  'none',
        }}>
          <div style={{ transform: cardTransform, transition: cardTransition, opacity: cardOpacity }}>
            <TransitionCard character={focusCharacter} />
          </div>

          {hyper.phase === 'loading' && (
            <div style={{ width: '220px', textAlign: 'center', animation: 'cl-strip 0.4s 0.2s ease both' }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, letterSpacing: '0.28em', textTransform: 'uppercase', color: HUD.gold, marginBottom: '8px' }}>
                H O L O C R O N
              </div>
              <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px', overflow: 'hidden', margin: '0 auto 8px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'linear-gradient(90deg, transparent, var(--hud-accent), var(--hud-gold), transparent)', animation: 'loadingBarSweep 1.4s ease-in-out infinite' }} />
              </div>
              <div key={loadingTextIdx} role="status" aria-live="polite" style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', letterSpacing: '0.06em', textTransform: 'uppercase', animation: 'cl-text 0.3s ease forwards' }}>
                {LOADING_TEXTS[loadingTextIdx]}
              </div>
            </div>
          )}
        </div>
        )
      })()}

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
