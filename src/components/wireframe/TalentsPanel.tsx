'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'
import gsap from 'gsap'
import {
  FS, SP, RADIUS, EASE, FONT_BODY, FONT_DISPLAY, HUD, panelBase,
  TALENT_ACTIVATION_COLOR, TALENT_ACTIVATION_META,
} from '@/lib/tokens'
import type { TalentActivationKey } from '@/lib/tokens'
import { PanelSearchInput } from '@/components/character/PanelSearchInput'
import { RichText } from '@/components/ui/RichText'
import { BuySpecButton } from '@/components/player-hud/BuySpecButton'
import { createClient } from '@/lib/supabase/client'
import { fetchActiveDataset } from '@/lib/activeDataset'
import { warmRefDataCache } from '@/lib/refDataCache'
import { useHudPanelContext } from '@/contexts/HudPanelContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type {
  Character, CharacterSpecialization, CharacterTalent, RefSkill, RefSpecialization, RefTalent, SpeciesAbility,
} from '@/lib/types'
import type { HudTalent } from '@/components/player-hud/TalentsPanel'

/** Compatible with HudTalent from player-hud/TalentsPanel — kept for the
 * wireframe gallery page (src/app/wireframe/page.tsx), which renders
 * `<TalentsPanel />` with zero props. */
export interface LiveTalent {
  key: string
  name: string
  rank: number
  activation: string
  description?: string
  isSpeciesGranted?: boolean
}

// ── Known passive stat bonuses ────────────────────────────────────────────────
// RELOCATED UNCHANGED from the old panel (Prompt B2). This is a local,
// hardcoded, name-keyed lookup — NOT derived from applyTalentModifiers or
// derivedStats, and covers exactly these four talents. Deliberately not
// extended and no entries added here; deriving this properly from the real
// modifier-application logic is a separate, later prompt.
interface StatBonus { stat: string; value: number }
const PASSIVE_STAT_BONUSES: Record<string, (rank: number) => StatBonus> = {
  'Toughened':  rank => ({ stat: 'Wound Threshold', value: rank * 2 }),
  'Enduring':   rank => ({ stat: 'Soak', value: rank }),
  'Grit':       rank => ({ stat: 'Strain Threshold', value: rank }),
  'Dedication': rank => ({ stat: 'Characteristic', value: rank }),
}

function activationKey(raw: string): TalentActivationKey {
  if (raw === 'Incidental (OOT)' || raw === 'Out of Turn') return 'oot'
  const lower = raw.toLowerCase()
  if (lower === 'incidental') return 'incidental'
  if (lower === 'maneuver')   return 'maneuver'
  if (lower === 'action')     return 'action'
  return 'passive'
}

/** Derives a human-readable "Applied Effects" line for a species ability
 * from its own fields — never fabricated. `die_modifier` abilities name the
 * skills they boost (no flat number — a boost die isn't one); `skill_rank`
 * abilities show the granted rank. Any other shape, or a skill key with no
 * match in refSkillMap, falls through to null — callers render the drawer's
 * existing "no automatic stat modifiers" note instead of guessing. */
function deriveSpeciesMod(sa: SpeciesAbility, refSkillMap: Record<string, RefSkill>): string | null {
  if (!Array.isArray(sa.affected_skills) || sa.affected_skills.length === 0) return null
  const names = sa.affected_skills.map(k => refSkillMap[k]?.name ?? k).join(' · ')
  if (sa.mechanical_type === 'skill_rank' && sa.rank_start) return `${names} +${sa.rank_start}`
  if (sa.mechanical_type === 'die_modifier') return names
  return null
}

// ── Corner ticks ──────────────────────────────────────────────────────────────
// Same four-corner bracket idiom as ForcePresenceCard.tsx's local
// AxisCornerBrackets (not exported there, so reproduced here rather than
// cross-importing an unrelated feature's internal helper) — reused, not
// reinvented. 6px legs, 1px border, matches that precedent exactly.
function CornerTicks({ color }: { color: string }) {
  const s = { position: 'absolute' as const, width: 6, height: 6, pointerEvents: 'none' as const }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </>
  )
}

// ── Hero constellation — Three.js point-field atmosphere (Prompt B3) ───────
// Mount-once lifecycle, same shape as PresenceSmoke.tsx (the only other
// three.js usage in the codebase): renderer/scene/camera created once, state
// read live via refs inside the animation loop, full disposal on unmount.
// Gating is the CALLER's job (conditional render on isOpen), exactly how
// ForcePresenceCard mounts/unmounts PresenceSmoke — never rendered while the
// panel is closed, so the loop cannot run in the background.
//
// Colour is read from the live --hud-gold / --hud-text-dim CSS custom
// properties at mount time (via getComputedStyle) rather than a fixed hex —
// unlike PresenceSmoke's KOTOR colours, these are ordinary theme tokens and
// MUST inherit both themes. Re-mounting on every panel-open (the same
// lifecycle PresenceSmoke already has) re-reads whichever theme is active
// at that moment.
function HeroConstellation({ heroRef }: { heroRef: React.RefObject<HTMLDivElement | null> }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const hero = heroRef.current
    if (!container || !hero) return

    const cs = getComputedStyle(hero)
    const goldColor    = new THREE.Color(cs.getPropertyValue('--hud-gold').trim() || '#c8a24e')
    const textDimColor = new THREE.Color(cs.getPropertyValue('--hud-text-dim').trim() || '#8a7060')

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    container.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
    camera.position.z = 8

    // Bounded point counts (140 near / 60 far) — fixed, never scaled by
    // anything dynamic, per the budget stated in the implementation prompt.
    function makeLayer(count: number, color: THREE.Color, size: number, opacity: number, spread: number, zOffset: number) {
      const positions = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * spread
        positions[i * 3 + 1] = (Math.random() - 0.5) * (spread * 1.3)
        positions[i * 3 + 2] = zOffset - Math.random() * 4
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const material = new THREE.PointsMaterial({ color, size, transparent: true, opacity, sizeAttenuation: true })
      const points = new THREE.Points(geometry, material)
      scene.add(points)
      return { points, geometry, material }
    }
    const near = makeLayer(140, goldColor, 0.06, 0.55, 14, 2)
    const far  = makeLayer(60, textDimColor, 0.04, 0.3, 16, -4)

    // Mouse parallax — listens on the HERO CARD itself (normal pointer
    // events), not the canvas container (pointer-events: none, sits behind
    // the card's clickable content and must never intercept clicks).
    let mx = 0, my = 0
    function onMouseMove(e: MouseEvent) {
      const r = hero!.getBoundingClientRect()
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2
      my = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    hero.addEventListener('mousemove', onMouseMove)

    const resize = () => {
      const w = container.clientWidth || 1
      const h = container.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    let running = true
    function frame(t: number) {
      if (!running) return
      near.points.rotation.y = t * 0.00004
      far.points.rotation.y  = -t * 0.00002
      camera.position.x += (mx * 0.5 - camera.position.x) * 0.04
      camera.position.y += (-my * 0.35 - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(frame)

    // Disposal sequence copied verbatim from PresenceSmoke.tsx: stop the
    // loop, disconnect the observer, dispose every geometry/material, dispose
    // the renderer, remove its DOM node. (No GSAP tweens run in this effect,
    // so there is nothing to gsap.killTweensOf — PresenceSmoke's own
    // disposal only calls that because it has colour/opacity tweens.)
    return () => {
      running = false
      renderer.setAnimationLoop(null)
      hero!.removeEventListener('mousemove', onMouseMove)
      ro.disconnect()
      near.geometry.dispose(); near.material.dispose()
      far.geometry.dispose(); far.material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
    />
  )
}

// ── Grid item — unified shape for both talent and species cards ─────────────
interface GridItem {
  ident:      string
  actKey:     TalentActivationKey
  name:       string
  rank?:      number
  description: string
  onCardMod?: string
  sources:    string[]
  navSpecKey?: string
  innate:     boolean
}

function buildTalentItems(
  talentsOnly: HudTalent[],
  rawTalents: CharacterTalent[],
  refSpecMap: Record<string, RefSpecialization>,
): GridItem[] {
  // Source specialization NAME(S) per talent_key, from the raw
  // character_talents rows — hudTalents collapses same-key rows across specs
  // and drops specialization_key entirely, so this can only be recovered
  // from the raw array. A talent owned via two specs lists BOTH names.
  // navSpecKey (for "View in Talent Tree") deliberately picks the FIRST
  // matching row encountered while iterating rawTalents — a deterministic
  // but not chronologically-meaningful tiebreak (the array isn't sorted by
  // purchase order); the drawer's displayed source text still shows every
  // owning spec, so this pick only affects which one tree the link opens.
  const bySpecKey = new Map<string, { names: string[]; navSpecKey?: string }>()
  for (const t of rawTalents) {
    const specName = t.specialization_key ? (refSpecMap[t.specialization_key]?.name || t.specialization_key) : null
    const existing = bySpecKey.get(t.talent_key)
    if (existing) {
      if (specName && !existing.names.includes(specName)) existing.names.push(specName)
    } else {
      bySpecKey.set(t.talent_key, { names: specName ? [specName] : [], navSpecKey: t.specialization_key })
    }
  }

  return talentsOnly.map(t => {
    const actKey = activationKey(t.activation)
    const bonusFn = PASSIVE_STAT_BONUSES[t.name] as ((rank: number) => StatBonus) | undefined
    const bonus = actKey === 'passive' && bonusFn && t.rank > 0 ? bonusFn(t.rank) : undefined
    const src = bySpecKey.get(t.key)
    return {
      ident:       `t:${t.key}`,
      actKey,
      name:        t.name,
      rank:        t.rank,
      description: t.description || 'No description available.',
      onCardMod:   bonus ? `${bonus.stat} +${bonus.value}` : undefined,
      sources:     src?.names ?? [],
      navSpecKey:  src?.navSpecKey,
      innate:      false,
    }
  })
}

function buildSpeciesItems(
  speciesAbilities: SpeciesAbility[],
  refSkillMap: Record<string, RefSkill>,
  speciesName: string,
): GridItem[] {
  return speciesAbilities.map(sa => ({
    ident:       `s:${sa.key}`,
    actKey:      'passive' as TalentActivationKey, // species traits are always innate/passive — never derived
    name:        sa.name,
    description: sa.description || 'No description available.',
    onCardMod:   deriveSpeciesMod(sa, refSkillMap) ?? undefined,
    sources:     speciesName ? [speciesName] : [],
    innate:      true,
  }))
}

// ── Talent / species card ────────────────────────────────────────────────────
function ActCard({ item, isOpen, onToggle }: { item: GridItem; isOpen: boolean; onToggle: () => void }) {
  const color = TALENT_ACTIVATION_COLOR[item.actKey]
  const label = TALENT_ACTIVATION_META[item.actKey].label

  return (
    <div
      onClick={onToggle}
      data-role="talent-card"
      style={{
        ...panelBase,
        '--notch': '13px',
        clipPath: 'polygon(var(--notch) 0, 100% 0, 100% calc(100% - var(--notch)), calc(100% - var(--notch)) 100%, 0 100%, 0 var(--notch))',
        borderLeft: `2px ${item.innate ? 'dashed' : 'solid'} ${color}`,
        padding: SP[3],
        display: 'flex', flexDirection: 'column', gap: SP[2],
        cursor: 'pointer',
        transition: `background ${EASE.default}, border-color ${EASE.default}`,
        borderColor: isOpen ? `color-mix(in srgb, ${color} 60%, transparent)` : undefined,
        background: isOpen ? `color-mix(in srgb, ${color} 6%, transparent)` : undefined,
      } as React.CSSProperties}
    >
      {/* Name gets the full row now — the activation badge moved to its own
          line beneath (it was consuming ~1/3 of the header width, which is
          why names truncated as aggressively as "Droid Compa…"). It's
          already redundant with the card's coloured left edge, so a lower-
          prominence second line loses nothing. Innate stays beside the name
          — only the activation badge was the space problem. */}
      <div className="flex items-baseline" style={{ gap: SP[2] }}>
        <span style={{
          flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: FONT_DISPLAY, fontSize: FS.body, fontWeight: 700, color: HUD.text,
        }}>
          {item.name}
        </span>
        {item.innate && (
          <span className="shrink-0" style={{
            fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: HUD.textFaint, border: `1px dashed var(--hud-border)`, borderRadius: RADIUS.sm, padding: `0 ${SP[1]}`,
          }}>
            Innate
          </span>
        )}
      </div>
      <span className="shrink-0" style={{
        fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color,
      }}>
        {item.actKey === 'oot' ? '⚡ OOT' : label}
      </span>

      {!item.innate && (
        <div className="flex items-center" style={{ gap: 3 }}>
          {Array.from({ length: item.rank ?? 0 }, (_, i) => (
            <i key={i} data-role="rank-pip" style={{
              display: 'block', width: 8, height: 8, borderRadius: 1, transform: 'rotate(45deg)',
              background: color, boxShadow: `0 0 4px color-mix(in srgb, ${color} 45%, transparent)`,
            }} />
          ))}
        </div>
      )}

      {item.onCardMod && (
        <div style={{ fontSize: FS.overline, color: HUD.gold }}>
          ↑ {item.onCardMod}
        </div>
      )}
    </div>
  )
}

// ── Drawer ────────────────────────────────────────────────────────────────────
function DrawerContent({
  item, onOpenInTree,
}: {
  item: GridItem
  onOpenInTree?: (specKey: string) => void
}) {
  const color = TALENT_ACTIVATION_COLOR[item.actKey]
  const label = TALENT_ACTIVATION_META[item.actKey].label

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 1.4fr', gap: SP[6] }}>
      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, letterSpacing: '0.02em', color, marginBottom: SP[1] }}>
          {item.name}
        </div>
        <div className="flex items-center" style={{ gap: SP[3], marginBottom: SP[3], fontSize: FS.overline, color: HUD.textDim }}>
          <span style={{ fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color }}>
            {item.actKey === 'oot' ? '⚡ Out of Turn' : label}
          </span>
          {item.sources.length > 0 && <span>{item.sources.join(' · ')}</span>}
          {!item.innate && (item.rank ?? 0) > 1 && <span>{item.rank} ranks</span>}
        </div>
        <div style={{ fontSize: FS.sm, lineHeight: 1.6, color: HUD.text }}>
          <RichText text={item.description} />
        </div>
        {!item.innate && item.navSpecKey && onOpenInTree && (
          <div style={{ marginTop: SP[4] }}>
            <button
              onClick={() => onOpenInTree(item.navSpecKey!)}
              style={{
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                padding: `${SP[1]} ${SP[3]}`, borderRadius: RADIUS.sm, background: 'transparent',
                border: `1px solid color-mix(in srgb, ${HUD.gold} 45%, transparent)`, color: HUD.gold,
                transition: EASE.default,
              }}
            >
              ★ View in Talent Tree
            </button>
          </div>
        )}
      </div>
      <div>
        <div style={{
          fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: HUD.textDim, marginBottom: SP[2],
        }}>
          Applied Effects
        </div>
        {item.onCardMod ? (
          <div style={{
            border: `1px solid var(--hud-border)`, borderLeft: `2px solid ${HUD.gold}`, borderRadius: RADIUS.sm,
            padding: `${SP[2]} ${SP[3]}`, background: 'rgba(0,0,0,0.2)', fontSize: FS.caption, color: HUD.textDim,
          }}>
            ↑ <strong style={{ color: HUD.gold }}>{item.onCardMod}</strong> — automatically applied to your derived stats.
          </div>
        ) : (
          <div style={{
            border: `1px solid var(--hud-border)`, borderRadius: RADIUS.sm,
            padding: `${SP[2]} ${SP[3]}`, background: 'rgba(0,0,0,0.2)', fontSize: FS.caption, color: HUD.textDim,
          }}>
            No automatic stat modifiers — effect applies in play.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Card grid entrance (Prompt B3) — reused for the initial open AND for a
// filter change (which re-runs just this, not the whole hero/systems
// entrance). Plain DOM query scoped to the given container, same idiom the
// visual-spec file itself demonstrates (and the only house precedent for
// "many cards fade/stagger up together") — never a global document query. ──
function animateTalentCardsIn(container: HTMLElement | null, delay = 0) {
  if (!container) return
  const cards = container.querySelectorAll('[data-role="talent-card"]')
  gsap.fromTo(cards, { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.45, delay, ease: 'power3.out' })
  const pips = container.querySelectorAll('[data-role="rank-pip"]')
  gsap.fromTo(pips, { scale: 0 }, { scale: 1, stagger: 0.03, duration: 0.35, delay: delay + 0.2, ease: 'back.out(2.4)' })
}

// ── Animated drawer wrapper ──────────────────────────────────────────────
// STEP 0 FINDING, reported not silently worked around: ForcePanel.tsx has NO
// existing height-spring drawer animation to copy — its drawer is a plain
// conditional-render with zero GSAP (grepped `scrollHeight`/`PowerDrawer`
// height animation, found nothing). No other gsap consumer in the codebase
// has a real height-spring either (PurchaseCeremony sets `height: 'auto'`
// directly, never animates toward it). The height-spring technique below is
// therefore the visual-spec file's own demonstrated approach (measure
// scrollHeight, animate 0 -> that height + opacity, release to `height:
// auto` on complete so later content changes aren't clamped, stagger the
// inner content) — a standard, well-known GSAP idiom, applied here for the
// first time in this codebase rather than copied from a precedent that
// doesn't exist.
function AnimatedDrawer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion) { gsap.set(el, { height: 'auto', opacity: 1 }); return }
    const h = el.scrollHeight
    const tl = gsap.timeline({ onComplete: () => gsap.set(el, { height: 'auto' }) })
    tl.fromTo(el, { height: 0, opacity: 0 }, { height: h, opacity: 1, duration: 0.45, ease: 'power3.out' })
    tl.fromTo(el.children, { y: 10, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'power2.out' }, 0.1)
    return () => { tl.kill() }
    // Mount-once per drawer instance — a new `item.ident` key means React
    // mounts a fresh instance (see the Fragment `key` in the grid below), so
    // this never needs to react to prop changes, only run once on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={ref} style={{ overflow: 'hidden', height: prefersReducedMotion ? 'auto' : 0, opacity: prefersReducedMotion ? 1 : 0 }}>
      <div style={{ padding: SP[5] }}>
        {children}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface TalentsPanelProps {
  character?:          Character
  characterId?:        string
  careerName?:         string
  speciesName?:        string
  charSpecs?:          CharacterSpecialization[]
  refSpecMap?:         Record<string, RefSpecialization>
  refSpecs?:           RefSpecialization[]
  refTalentMap?:       Record<string, RefTalent>
  refSkillMap?:        Record<string, RefSkill>
  careerSpecKeys?:     Set<string>
  specKeyToCareerName?: Record<string, string>
  talents?:            CharacterTalent[]
  hudTalents?:         HudTalent[]
  /** @deprecated pre-redesign prop name for hudTalents — the wireframe
   * gallery page still passes this; hudTalents takes precedence when both
   * are given. */
  liveTalents?:        LiveTalent[]
  speciesAbilities?:   SpeciesAbility[]
  activeSpecKey?:      string | null
  setActiveSpecKey?:   (k: string) => void
  isCombat?:           boolean
  isGmMode?:           boolean
  onBuySpecialization?: (specKey: string, setSpecKey: (k: string) => void) => void
}

export function TalentsPanel({
  character, characterId, careerName, speciesName,
  charSpecs = [], refSpecMap = {}, refSpecs = [], refTalentMap = {}, refSkillMap = {},
  careerSpecKeys = new Set(), specKeyToCareerName = {},
  talents = [], hudTalents, liveTalents,
  speciesAbilities = [],
  activeSpecKey, setActiveSpecKey,
  isCombat = false, isGmMode, onBuySpecialization,
}: TalentsPanelProps) {
  const router = useRouter()
  const [filter, setFilter]   = useState<'all' | TalentActivationKey>('all')
  const [search, setSearch]   = useState('')
  const [openId, setOpenId]   = useState<string | null>(null)
  const [gateTooltip, setGateTooltip] = useState(false)

  const { isOpen }            = useHudPanelContext()
  const prefersReducedMotion  = usePrefersReducedMotion()

  // ── Entrance choreography refs (Prompt B3) ──────────────────────────────
  const topRowRef        = useRef<HTMLDivElement>(null)
  const heroRef           = useRef<HTMLDivElement>(null)
  const careerTitleRef    = useRef<HTMLDivElement>(null)
  const specRowsRef       = useRef<HTMLDivElement>(null)
  const distBarRef        = useRef<HTMLDivElement>(null)
  const chipsRowRef       = useRef<HTMLDivElement>(null)
  const gridRef           = useRef<HTMLDivElement>(null)
  const speciesSectionRef = useRef<HTMLDivElement>(null)
  const hasRunFilterStagger = useRef(false)

  const effectiveHudTalents: HudTalent[] = hudTalents ?? liveTalents ?? []

  // ── Species separation (Prompt B2) — hudTalents already merges species
  // abilities upstream in useCharacterData (talent_rank + die_modifier
  // types only); isSpeciesGranted is set true on every entry that merge
  // produces, and never on a genuinely-purchased character_talents row —
  // confirmed against useCharacterData.ts:1103-1154. Filtering on that flag
  // is what pulls species entries OUT of the talents list; the species
  // section below is fed from speciesAbilities directly instead, which is
  // MORE complete than the merge (skill_rank abilities never reach
  // hudTalents/hudSkills-only today, so this section surfaces some that
  // were previously invisible in this panel entirely).
  const talentsOnly = useMemo(() => effectiveHudTalents.filter(t => !t.isSpeciesGranted), [effectiveHudTalents])

  const talentItems  = useMemo(() => buildTalentItems(talentsOnly, talents, refSpecMap), [talentsOnly, talents, refSpecMap])
  const speciesItems = useMemo(() => buildSpeciesItems(speciesAbilities, refSkillMap, speciesName ?? ''), [speciesAbilities, refSkillMap, speciesName])

  // Counts + distribution — TALENTS ONLY, species never included.
  const counts = useMemo(() => {
    const c: Partial<Record<TalentActivationKey, number>> = {}
    for (const t of talentItems) c[t.actKey] = (c[t.actKey] ?? 0) + 1
    return c
  }, [talentItems])
  const presentKeys = (Object.keys(counts) as TalentActivationKey[]).filter(k => (counts[k] ?? 0) > 0)

  // Passive-bonus summary — same source list as before, relocated unchanged.
  const passiveBonuses = talentItems.filter(t => t.actKey === 'passive' && t.onCardMod).map(t => `${t.onCardMod} (${t.name})`)

  // BEHAVIOUR CHANGE (documented, per Prompt B2 §5): search now COMPOSES
  // with the active filter chip instead of bypassing it. Previously a
  // non-empty search matched across ALL talents regardless of the selected
  // tab, silently ignoring the user's chip selection.
  const searchQuery = search.toLowerCase().trim()
  const filteredTalentItems = useMemo(() => talentItems
    .filter(t => filter === 'all' || t.actKey === filter)
    .filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery) || t.description.toLowerCase().includes(searchQuery))
  , [talentItems, filter, searchQuery])

  // Hover/focus-intent ref-cache warm, ported unchanged from the old footer.
  const prefetchedRef = useRef(false)
  function prefetchTalentSurfaceRefData() {
    if (prefetchedRef.current) return
    prefetchedRef.current = true
    const supabase = createClient()
    fetchActiveDataset(supabase).then(warmRefDataCache).catch(() => {})
  }

  function openTalentTree(specKey: string) {
    if (isCombat || !characterId) return
    setActiveSpecKey?.(specKey)
    const qs = new URLSearchParams({ spec: specKey })
    if (isGmMode) qs.set('gm', '1')
    router.push(`/character/${characterId}/talents?${qs.toString()}`)
  }

  const gateSpecKey = activeSpecKey || charSpecs[0]?.specialization_key || null

  function specTotal(specKey: string): number {
    const ref = refSpecMap[specKey]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ref?.talent_tree?.rows?.reduce((s: number, r: any) => s + (r.talents?.length || 0), 0) || 0
  }
  function specPurchased(specKey: string): number {
    return talents.filter(t => t.specialization_key === specKey).length
  }

  // ONE item open at a time, across BOTH sections (talents + species).
  function toggle(ident: string) {
    setOpenId(id => (id === ident ? null : ident))
  }

  const canBuySpec = !!(character && refSpecs.length >= 0 && onBuySpecialization && setActiveSpecKey)

  // ── Entrance choreography (Prompt B3) — triggers on the panel's OPEN
  // transition via useHudPanelContext, NOT on mount. All six HudFullPanels
  // stay mounted simultaneously, so a mount-fired effect would play once,
  // invisibly, before the user ever opens this panel — the [isOpen] dep is
  // what makes it replay every time the panel is reopened. Full entrance
  // finishes well under 1.2s (last leg — species — starts at 0.85s + its own
  // ~0.45-0.55s run). Nothing here blocks pointer events; GSAP only tweens
  // opacity/transform/flexGrow, never toggles interactivity.
  useEffect(() => {
    if (!isOpen || prefersReducedMotion) return
    hasRunFilterStagger.current = false // re-arm the filter-restagger's own first-run skip for this open

    const tl = gsap.timeline()

    if (topRowRef.current) {
      tl.fromTo(Array.from(topRowRef.current.children), { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power3.out' }, 0)
    }
    if (careerTitleRef.current) {
      tl.fromTo(careerTitleRef.current, { opacity: 0, letterSpacing: '0.3em' }, { opacity: 1, letterSpacing: '0.02em', duration: 0.9, ease: 'power3.out' }, 0.15)
    }
    if (specRowsRef.current) {
      const rows = specRowsRef.current.querySelectorAll('[data-role="spec-row"]')
      if (rows.length) tl.fromTo(rows, { x: -10, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out' }, 0.45)
      const segs = specRowsRef.current.querySelectorAll('[data-role="spec-seg-on"]')
      if (segs.length) tl.fromTo(segs, { scaleX: 0 }, { scaleX: 1, stagger: 0.03, duration: 0.4, ease: 'power2.out' }, 0.6)
    }
    // Distribution bar — the panel's signature moment. Each segment's real
    // width comes from React's own `flex: counts[k]` inline style; GSAP
    // overrides flexGrow down to near-zero then animates it back up to that
    // same value, so the bar visibly assembles itself instead of appearing
    // pre-built. No clearProps here: flex-grow is a distinct DOM style slot
    // even when originally set via the `flex` shorthand, so clearing it
    // resets it to its CSS initial value (0) instead of handing it back to
    // React's shorthand — that was collapsing every segment to zero width
    // right after the entrance animation finished. Leaving the tweened value
    // in place is safe: it already equals the target, and a later
    // filter-driven re-render (different counts) overwrites `flex` via React
    // regardless.
    if (distBarRef.current) {
      const segments = Array.from(distBarRef.current.children) as HTMLElement[]
      segments.forEach(el => {
        const target = parseFloat(el.style.flexGrow || el.style.flex || '1') || 1
        gsap.set(el, { flexGrow: 0.0001 })
        tl.to(el, { flexGrow: target, duration: 0.8, ease: 'power3.inOut' }, 0.55)
      })
    }
    if (chipsRowRef.current) {
      tl.fromTo(Array.from(chipsRowRef.current.children), { y: 8, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.4, ease: 'power2.out' }, 0.7)
    }

    animateTalentCardsIn(gridRef.current, 0.85)
    if (speciesSectionRef.current) {
      animateTalentCardsIn(speciesSectionRef.current, 0.95)
    }

    return () => { tl.kill() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, prefersReducedMotion])

  // Filter change re-runs just the talent-card stagger so the grid
  // recomposes rather than snapping. Skips its own first run — the entrance
  // effect above already handles the initial-open stagger for whatever the
  // default filter ('all') shows; without this skip both effects would fire
  // together on open and double-animate the same cards.
  useEffect(() => {
    if (!isOpen || prefersReducedMotion) return
    if (!hasRunFilterStagger.current) { hasRunFilterStagger.current = true; return }
    animateTalentCardsIn(gridRef.current, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[4], padding: SP[4] }}>

      {/* ── Top row: hero + systems ── */}
      {/* alignItems: 'start' — grid items default to stretch, which forced
          the systems card to match the hero's full height even when its own
          content ended ~200px shorter, leaving a large empty void (the same
          half-empty problem the hero itself was redesigned to escape). Each
          card now sizes to its own content instead. */}
      <div ref={topRowRef} style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: SP[4], alignItems: 'start' }}>

        {/* ── HERO — career identity + owned specs + gateway ── */}
        <div ref={heroRef} style={{
          ...panelBase, position: 'relative', padding: `${SP[5]} ${SP[4]}`, textAlign: 'center', overflow: 'hidden',
          borderColor: 'color-mix(in srgb, var(--hud-gold) 38%, transparent)',
          boxShadow: '0 0 34px color-mix(in srgb, var(--hud-gold) 12%, transparent)',
        }}>
          <CornerTicks color={HUD.gold} />
          {isOpen && !prefersReducedMotion && <HeroConstellation heroRef={heroRef} />}

          <div ref={careerTitleRef} style={{
            position: 'relative',
            // FS.h1 is viewport-fluid (28→56px) but this hero column is a
            // fixed 360px — at wide viewports it overflowed the card for any
            // career name longer than ~6 characters (confirmed live:
            // "SMUGGLER" clipped past the border). FS.h2 still reads as a
            // display heading but stays inside the fixed column for every
            // career name in the dataset, including "TECHNICIAN"/"SYNDICATE".
            fontFamily: FONT_DISPLAY, fontSize: FS.h2, fontWeight: 700, letterSpacing: '0.02em',
            color: HUD.gold, lineHeight: 1.05, marginBottom: SP[4],
            textShadow: '0 0 28px color-mix(in srgb, var(--hud-gold) 30%, transparent)',
          }}>
            {(careerName || '').toUpperCase()}
          </div>

          {charSpecs.length === 0 ? (
            <div style={{ position: 'relative', fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint, padding: `${SP[3]} 0` }}>
              No specializations purchased yet.
            </div>
          ) : (
            <div ref={specRowsRef} style={{ position: 'relative' }}>
            {charSpecs.map(cs => {
              const total = specTotal(cs.specialization_key)
              const owned = specPurchased(cs.specialization_key)
              const name = refSpecMap[cs.specialization_key]?.name || cs.specialization_key
              return (
                <div
                  key={cs.id}
                  data-role="spec-row"
                  onClick={() => openTalentTree(cs.specialization_key)}
                  onMouseEnter={prefetchTalentSurfaceRefData}
                  style={{
                    padding: `${SP[2]} 0`, borderTop: `1px solid var(--hud-border)`,
                    textAlign: 'left', cursor: isCombat ? 'not-allowed' : 'pointer',
                    transition: EASE.default, opacity: isCombat ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-baseline" style={{ gap: SP[2], marginBottom: 5 }}>
                    <span style={{
                      flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      fontFamily: FONT_DISPLAY, fontSize: FS.body, fontWeight: 700, color: HUD.text,
                    }}>
                      {name}
                    </span>
                    <span className="shrink-0" style={{ fontSize: FS.overline, color: HUD.gold }}>
                      {owned} / {total}
                    </span>
                  </div>
                  <div className="flex" style={{ gap: 2 }}>
                    {Array.from({ length: total }, (_, i) => (
                      <i key={i} data-role={i < owned ? 'spec-seg-on' : undefined} style={{
                        display: 'block', flex: 1, height: 4, borderRadius: RADIUS.sm, transformOrigin: 'left',
                        background: i < owned ? HUD.gold : 'color-mix(in srgb, var(--hud-gold) 14%, transparent)',
                        boxShadow: i < owned ? '0 0 5px color-mix(in srgb, var(--hud-gold) 45%, transparent)' : undefined,
                      }} />
                    ))}
                  </div>
                </div>
              )
            })}
            </div>
          )}

          {canBuySpec && (
            <div style={{ marginTop: SP[3] }}>
              <BuySpecButton
                character={character!}
                charSpecs={charSpecs}
                refSpecs={refSpecs}
                refSpecMap={refSpecMap}
                refTalentMap={refTalentMap}
                careerSpecKeys={careerSpecKeys}
                specKeyToCareerName={specKeyToCareerName}
                onBuy={specKey => onBuySpecialization!(specKey, setActiveSpecKey!)}
              />
            </div>
          )}

          <div style={{ marginTop: SP[4], position: 'relative' }}
            onMouseEnter={isCombat ? () => setGateTooltip(true) : prefetchTalentSurfaceRefData}
            onMouseLeave={isCombat ? () => setGateTooltip(false) : undefined}
          >
            <button
              onClick={gateSpecKey ? () => openTalentTree(gateSpecKey) : undefined}
              disabled={isCombat || !gateSpecKey}
              style={{
                width: '100%',
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', cursor: (isCombat || !gateSpecKey) ? 'not-allowed' : 'pointer',
                padding: `${SP[2]} ${SP[3]}`, borderRadius: RADIUS.sm,
                background: (isCombat || !gateSpecKey) ? 'transparent' : 'color-mix(in srgb, var(--hud-gold) 10%, transparent)',
                border: `1px solid color-mix(in srgb, var(--hud-gold) ${(isCombat || !gateSpecKey) ? 30 : 45}%, transparent)`,
                color: (isCombat || !gateSpecKey) ? HUD.textFaint : HUD.gold,
                opacity: (isCombat || !gateSpecKey) ? 0.5 : 1,
                transition: `background ${EASE.quick}, border-color ${EASE.quick}, color ${EASE.quick}`,
              }}
            >
              ★ Explore Talents
            </button>
            {isCombat && gateTooltip && (
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--hud-surface-hi)', border: `1px solid var(--hud-border-hi)`, borderRadius: RADIUS.sm,
                padding: `${SP[1]} ${SP[2]}`, fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim,
                whiteSpace: 'nowrap', zIndex: 800, pointerEvents: 'none',
              }}>
                Talents cannot be purchased during Combat
              </div>
            )}
          </div>
        </div>

        {/* ── SYSTEMS — passive bonuses + activation distribution / filter ── */}
        <div style={{ ...panelBase, position: 'relative', padding: `${SP[4]} ${SP[5]}`, display: 'flex', flexDirection: 'column', gap: SP[3] }}>
          <CornerTicks color={HUD.textDim} />

          <div style={{ fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: HUD.textDim }}>
            Systems Active
          </div>

          {passiveBonuses.length > 0 && (
            <div style={{
              border: `1px solid color-mix(in srgb, var(--hud-gold) 20%, transparent)`, borderRadius: RADIUS.md,
              background: 'color-mix(in srgb, var(--hud-gold) 4%, transparent)', padding: `${SP[2]} ${SP[3]}`,
            }}>
              <div style={{ fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: HUD.gold, marginBottom: SP[1] }}>
                ■ Passive Bonuses Applied
              </div>
              <div className="flex flex-wrap" style={{ gap: SP[4], fontSize: FS.caption, color: HUD.textDim }}>
                {passiveBonuses.map((b, i) => <span key={i}>{b}</span>)}
              </div>
            </div>
          )}

          {/* Activation distribution bar — proportional, doubles as a filter. Talents only. */}
          {talentItems.length > 0 && (
            <div ref={distBarRef} className="flex" style={{ height: 10, borderRadius: RADIUS.sm, overflow: 'hidden', gap: 1 }}>
              {presentKeys.map(k => (
                <i
                  key={k}
                  onClick={() => setFilter(f => (f === k ? 'all' : k))}
                  title={`${TALENT_ACTIVATION_META[k].label} (${counts[k]})`}
                  style={{
                    display: 'block', flex: counts[k], background: TALENT_ACTIVATION_COLOR[k],
                    cursor: 'pointer', opacity: filter === 'all' || filter === k ? 1 : 0.4, transition: EASE.default,
                  }}
                />
              ))}
            </div>
          )}

          {/* Filter chips — zero-count types omitted. Search composes with filter. */}
          <div ref={chipsRowRef} className="flex flex-wrap items-center" style={{ gap: SP[2] }}>
            <FilterChip label="All" count={talentItems.length} active={filter === 'all'} color={HUD.text} onClick={() => setFilter('all')} />
            {presentKeys.map(k => (
              <FilterChip
                key={k}
                label={k === 'oot' ? 'OOT' : TALENT_ACTIVATION_META[k].label}
                count={counts[k] ?? 0}
                active={filter === k}
                color={TALENT_ACTIVATION_COLOR[k]}
                onClick={() => setFilter(f => (f === k ? 'all' : k))}
              />
            ))}
            <div style={{ flex: 1, minWidth: 180 }}>
              <PanelSearchInput value={search} onChange={setSearch} placeholder="Search talents…" />
            </div>
          </div>
        </div>
      </div>

      {/* ── TALENT GRID ── */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: SP[2], borderBottom: `1px solid var(--hud-border)`, marginBottom: SP[3],
        }}>
          <span style={{ fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: HUD.textDim }}>
            Owned Talents
          </span>
          <span style={{ fontSize: FS.overline, letterSpacing: '0.08em', color: HUD.textFaint }}>
            {talentItems.length} talents
          </span>
        </div>

        {filteredTalentItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: `${SP[6]} 0`, fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textFaint, fontStyle: 'italic' }}>
            {searchQuery ? `No talents matching “${search}”` : 'No talents in this category'}
          </div>
        ) : (
          <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: SP[3] }}>
            {filteredTalentItems.map(item => (
              <Fragment key={item.ident}>
                <ActCard item={item} isOpen={openId === item.ident} onToggle={() => toggle(item.ident)} />
                {openId === item.ident && (
                  <div style={{
                    gridColumn: '1 / -1', borderRadius: RADIUS.lg,
                    border: `1px solid var(--hud-border-hi)`,
                    background: `linear-gradient(180deg, color-mix(in srgb, ${TALENT_ACTIVATION_COLOR[item.actKey]} 7%, transparent), transparent 45%), var(--hud-panel)`,
                  }}>
                    <AnimatedDrawer key={item.ident}>
                      <DrawerContent item={item} onOpenInTree={openTalentTree} />
                    </AnimatedDrawer>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ── SPECIES ABILITIES — innate, excluded from talent counts/filters ── */}
      {speciesItems.length > 0 && (
        <div ref={speciesSectionRef}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingBottom: SP[2], borderBottom: `1px solid var(--hud-border)`, marginBottom: SP[3],
          }}>
            <span style={{ fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: HUD.textDim }}>
              Species Abilities
            </span>
            <span style={{ fontSize: FS.overline, letterSpacing: '0.08em', color: HUD.textFaint }}>
              {speciesName} · innate
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: SP[3] }}>
            {speciesItems.map(item => (
              <Fragment key={item.ident}>
                <ActCard item={item} isOpen={openId === item.ident} onToggle={() => toggle(item.ident)} />
                {openId === item.ident && (
                  <div style={{
                    gridColumn: '1 / -1', borderRadius: RADIUS.lg,
                    border: `1px solid var(--hud-border-hi)`,
                    background: `linear-gradient(180deg, color-mix(in srgb, ${TALENT_ACTIVATION_COLOR[item.actKey]} 7%, transparent), transparent 45%), var(--hud-panel)`,
                  }}>
                    <AnimatedDrawer key={item.ident}>
                      <DrawerContent item={item} />
                    </AnimatedDrawer>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterChip({
  label, count, active, color, onClick,
}: { label: string; count: number; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        cursor: 'pointer', padding: `3px ${SP[2]}`, borderRadius: RADIUS.sm,
        background: 'transparent', border: `1px solid ${active ? color : 'var(--hud-border)'}`,
        color, transition: EASE.default, display: 'flex', alignItems: 'center', gap: 5,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: RADIUS.full, background: color }} />
      {label} <span style={{ opacity: 0.6 }}>({count})</span>
    </button>
  )
}
