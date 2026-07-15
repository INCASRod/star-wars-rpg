'use client'

import { useState, useMemo, type ReactNode } from 'react'
import { rollPool, type RollResult } from './dice-engine'
import { CHAR_COLOR, CHAR_FULL, DICE_COLOR, FONT_BODY, FONT_DISPLAY, FS, SP, EASE, RADIUS, Z } from '@/lib/tokens'
import type { HudSkill } from '@/lib/types'

// ── Constants ──────────────────────────────────────────────────────────────
const CHAR_ORDER = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const
type CharKey = typeof CHAR_ORDER[number]
type FilterMode = 'all' | 'trained' | 'career'
type SkillCheckMode = 'browse' | 'roll'

// die clip-path geometry — not spacing
const CLIP_OCT = 'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)'
const CLIP_DIA = 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'

const DIFF_LABELS = ['Simple', 'Easy', 'Average', 'Hard', 'Daunting', 'Formidable'] as const
// difficulty pip colours — die-identity game-mechanic pre-approved exception
const DIFF_BORDER_INACTIVE = 'rgba(123,31,162,0.20)'
const DIFF_BORDER_ACTIVE   = 'rgba(123,31,162,0.70)'
const DIFF_BG_ACTIVE       = 'rgba(123,31,162,0.10)'
const DIFF_COLOR_ACTIVE    = 'rgb(190,130,230)'

// ── Props ──────────────────────────────────────────────────────────────────
interface HudSkillQuickListProps {
  skills:        HudSkill[]
  onOpenPopover: (skill: HudSkill, anchor: DOMRect) => void  // kept — compat with existing modal
  onRoll?:       (result: RollResult, label?: string, pool?: Record<string, number>) => void
}

// ── Shared ─────────────────────────────────────────────────────────────────

function ScanlineOverlay() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: Z.fab,
      backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,color-mix(in srgb,black 3%,transparent) 2px,color-mix(in srgb,black 3%,transparent) 4px)',
    }} />
  )
}

// ── Browse mode sub-components ─────────────────────────────────────────────

function CharGroupHeader({ charKey, charVal }: { charKey: CharKey; charVal: number }) {
  const color = CHAR_COLOR[charKey] /* characteristic color — sealed namespace */
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: SP[2],
      padding: `${SP[1]} ${SP[2]}`,
      background: 'rgba(0,0,0,0.25)',
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 900, color, lineHeight: 1 }}>
          {charVal}
        </span>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color, opacity: 0.7 }}>
          {CHAR_FULL[charKey as keyof typeof CHAR_FULL]}
        </span>
      </div>
      <div style={{ flex: 1, height: 1, background: color, opacity: 0.20 }} />
    </div>
  )
}

function SkillRow({ skill, onSelect }: { skill: HudSkill; onSelect: (s: HudSkill) => void }) {
  const color     = CHAR_COLOR[skill.charKey as CharKey] ?? 'var(--hud-text-dim)' /* characteristic color — sealed namespace */
  const isTrained = skill.rank > 0
  const profCount = Math.min(skill.charVal, skill.rank)
  const ablCount  = skill.charVal - profCount

  return (
    <button
      className="sc-skill-row"
      onClick={() => onSelect(skill)}
      style={{
        display: 'flex', alignItems: 'stretch',
        width: '100%', padding: 0,
        background: 'transparent', border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.035)',
        cursor: 'pointer', textAlign: 'left' as const,
      }}
    >
      {/* Left accent bar */}
      <div
        className="sc-accent-bar"
        style={{
          width: 2, flexShrink: 0,
          background: color, /* characteristic color — sealed namespace */
          opacity: isTrained ? 1 : 0,
          transition: `opacity ${EASE.quick}`,
          alignSelf: 'stretch',
        }}
      />
      {/* Career dot */}
      {skill.isCareer ? (
        <div style={{
          width: SP[1], flexShrink: 0, alignSelf: 'stretch',
          borderLeft: `2px solid ${color}`, /* characteristic color — sealed namespace */
          opacity: 0.45,
          margin: `${SP[1]} 0`,
        }} />
      ) : (
        <div style={{ width: SP[1], flexShrink: 0 }} />
      )}
      {/* Row content */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: SP[1], padding: `${SP[1]} ${SP[2]} ${SP[1]} ${SP[1]}` }}>
        {/* Skill name */}
        <span style={{
          fontFamily: FONT_BODY,
          fontSize:   FS.label,
          fontWeight: isTrained ? 600 : 400,
          color:      isTrained ? 'var(--hud-text)' : 'var(--hud-text-dim)',
          flex: 1, minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
        }}>
          {skill.name}
        </span>
        {/* Rank pips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              width: 5, height: 7, /* die shape px — geometry not spacing */
              transform: 'skewX(-10deg)',
              background:  i < skill.rank ? color : 'transparent', /* characteristic color — sealed namespace */
              border:      `1px solid ${i < skill.rank ? color : `color-mix(in srgb, ${color} 22%, transparent)`}`, /* sealed */
              flexShrink: 0,
            }} />
          ))}
        </div>
        {/* Dice preview — player side only, no difficulty dice */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, minWidth: '4rem', justifyContent: 'flex-end' }}>
          {Array.from({ length: profCount }).map((_, i) => (
            <div key={`p${i}`} style={{
              width: 12, height: 12, /* die shape px — geometry not spacing */
              background: DICE_COLOR.proficiency, /* die-identity hex — sealed namespace */
              clipPath: CLIP_OCT, flexShrink: 0,
            }} />
          ))}
          {profCount > 0 && ablCount > 0 && (
            <div style={{ width: 1, height: 9, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
          )}
          {Array.from({ length: ablCount }).map((_, i) => (
            <div key={`a${i}`} style={{
              width: 12, height: 12, /* die shape px — geometry not spacing */
              background: DICE_COLOR.ability, /* die-identity hex — sealed namespace */
              clipPath: CLIP_DIA, flexShrink: 0,
            }} />
          ))}
          {profCount === 0 && ablCount === 0 && (
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', opacity: 0.35 }}>—</span>
          )}
        </div>
      </div>
    </button>
  )
}

function FilterChips({ filter, setFilter }: { filter: FilterMode; setFilter: (f: FilterMode) => void }) {
  const chips: { key: FilterMode; label: string }[] = [
    { key: 'all',     label: 'All' },
    { key: 'trained', label: 'Trained' },
    { key: 'career',  label: 'Career' },
  ]
  return (
    <div style={{
      display: 'flex', gap: SP[1], padding: `${SP[1]} ${SP[2]}`,
      borderBottom: '1px solid var(--hud-border)', flexShrink: 0,
    }}>
      {chips.map(c => {
        const active = filter === c.key
        return (
          <button
            key={c.key}
            className="sc-filter-chip"
            onClick={() => setFilter(c.key)}
            style={{
              clipPath:      'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)',
              padding:       `2px ${SP[2]}`,
              fontFamily:    FONT_DISPLAY,
              fontSize:      FS.overline,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              border:        `1px solid ${active ? 'var(--hud-gold)' : 'var(--hud-border)'}`,
              color:         active ? 'var(--hud-gold)' : 'var(--hud-text-dim)',
              background:    active ? 'color-mix(in srgb, var(--hud-gold) 10%, transparent)' : 'transparent',
              cursor:        'pointer',
            }}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Roll mode sub-components ───────────────────────────────────────────────

function BackBar({ skill, onBack }: { skill: HudSkill; onBack: () => void }) {
  const fullName = CHAR_FULL[skill.charKey as keyof typeof CHAR_FULL] ?? skill.charKey
  const abbr     = fullName.toUpperCase()
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: SP[2],
      padding: `${SP[1]} ${SP[2]}`,
      borderBottom: '1px solid var(--hud-border)',
      flexShrink: 0,
    }}>
      <button
        className="sc-back-btn"
        onClick={onBack}
        style={{
          clipPath:      'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)',
          padding:       `2px ${SP[2]}`,
          fontFamily:    FONT_DISPLAY,
          fontSize:      FS.overline,
          letterSpacing: '0.18em',
          textTransform: 'uppercase' as const,
          border:        'none',
          outline:       '1px solid color-mix(in srgb, var(--hud-border) 35%, transparent)',
          color:         'var(--hud-text-dim)',
          background:    'transparent',
          cursor:        'pointer',
          flexShrink:    0,
        }}
      >
        ← Skills
      </button>
      <span style={{
        fontFamily:    FONT_DISPLAY,
        fontSize:      FS.label,
        fontWeight:    700,
        letterSpacing: '0.10em',
        color:         'var(--hud-text)',
        flex:          1,
        textAlign:     'center' as const,
        overflow:      'hidden',
        whiteSpace:    'nowrap' as const,
        textOverflow:  'ellipsis',
      }}>
        {skill.name}
      </span>
      <span style={{
        fontFamily:    FONT_DISPLAY,
        fontSize:      FS.overline,
        letterSpacing: '0.12em',
        color:         'var(--hud-text-dim)',
        opacity:       0.45,
        flexShrink:    0,
      }}>
        {abbr} {skill.charVal} · RANK {skill.rank}
      </span>
    </div>
  )
}

function DiceTray({ pool }: { pool: Record<string, number> }) {
  const { proficiency = 0, ability = 0, boost = 0, setback = 0, challenge = 0, difficulty = 0 } = pool
  const hasPlayer = proficiency + ability + boost > 0
  const hasDiff   = challenge + difficulty + setback > 0
  const hasAny    = hasPlayer || hasDiff
  return (
    <div style={{
      padding:      `${SP[1]} ${SP[2]}`,
      background:   'rgba(0,0,0,0.25)',
      borderBottom: '1px solid var(--hud-border)',
      flexShrink:   0,
    }}>
      <div style={{
        fontFamily:    FONT_DISPLAY, fontSize: FS.overline,
        letterSpacing: '0.18em', textTransform: 'uppercase' as const,
        color: 'var(--hud-text-faint)', opacity: 0.28,
        marginBottom: SP[1],
      }}>
        Dice Pool
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' as const }}>
        {Array.from({ length: proficiency }).map((_, i) => (
          <div key={`pro${i}`} className="cc-die" style={{ width: 30, height: 30, /* die shape px */ background: DICE_COLOR.proficiency /* die-identity hex — sealed namespace */, clipPath: CLIP_OCT }} />
        ))}
        {Array.from({ length: ability }).map((_, i) => (
          <div key={`abl${i}`} className="cc-die" style={{ width: 27, height: 27, /* die shape px */ background: DICE_COLOR.ability /* die-identity hex — sealed namespace */, clipPath: CLIP_DIA }} />
        ))}
        {Array.from({ length: boost }).map((_, i) => (
          <div key={`bst${i}`} className="cc-die" style={{ width: 30, height: 30, /* die shape px */ background: DICE_COLOR.boost /* die-identity hex — sealed namespace */, borderRadius: RADIUS.sm }} />
        ))}
        {hasPlayer && hasDiff && (
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.10)', flexShrink: 0, margin: `0 ${SP[1]}` }} />
        )}
        {Array.from({ length: challenge }).map((_, i) => (
          <div key={`chl${i}`} className="cc-die" style={{ width: 30, height: 30, /* die shape px */ background: DICE_COLOR.challenge /* die-identity hex — sealed namespace */, clipPath: CLIP_OCT }} />
        ))}
        {Array.from({ length: difficulty }).map((_, i) => (
          <div key={`dif${i}`} className="cc-die" style={{ width: 27, height: 27, /* die shape px */ background: DICE_COLOR.difficulty /* die-identity hex — sealed namespace */, clipPath: CLIP_DIA }} />
        ))}
        {Array.from({ length: setback }).map((_, i) => (
          <div key={`set${i}`} className="cc-die" style={{ width: 30, height: 30, /* die shape px */ background: DICE_COLOR.setback /* die-identity hex — sealed namespace */, borderRadius: RADIUS.sm }} />
        ))}
        {!hasAny && (
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', opacity: 0.4 }}>
            — —
          </span>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: SP[2],
      padding: `${SP[1]} ${SP[2]} 0`,
    }}>
      <span style={{
        fontFamily:    FONT_DISPLAY, fontSize: FS.overline,
        letterSpacing: '0.28em', textTransform: 'uppercase' as const,
        color: 'var(--hud-text-faint)', opacity: 0.38,
        flexShrink: 0,
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--hud-border)', opacity: 0.5 }} />
    </div>
  )
}

function RollStepper({
  label, sublabel, value, min = 0, max, onAdd, onRemove, dimmed = false,
}: {
  label:    string
  sublabel: string
  value:    number
  min?:     number
  max?:     number
  onAdd:    () => void
  onRemove: () => void
  dimmed?:  boolean
}) {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        `${SP[1]} ${SP[2]}`,
      borderBottom:   '1px solid var(--hud-border)',
      opacity:        dimmed ? 0.30 : 1,
      pointerEvents:  dimmed ? 'none' as const : 'auto' as const,
      transition:     `opacity ${EASE.quick}`,
    }}>
      <div style={{ minWidth: 0, overflow: 'hidden' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text)', whiteSpace: 'nowrap' as const }}>
          {label}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', opacity: 0.65 }}>
          {sublabel}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], flexShrink: 0 }}>
        <button
          className="sc-step-btn"
          onClick={onRemove}
          disabled={value <= min}
          style={{
            width: '1.5rem', height: '1.5rem', flexShrink: 0,
            borderRadius: RADIUS.sm,
            border:       '1px solid var(--hud-border)',
            background:   'transparent',
            fontFamily:   FONT_BODY,
            fontSize:     FS.label,
            color:        value <= min ? 'var(--hud-border-hi)' : 'var(--hud-text-faint)',
            cursor:       value <= min ? 'not-allowed' as const : 'pointer' as const,
            display:      'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >−</button>
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.caption,
          color: 'var(--hud-gold)',
          minWidth: '1.25rem', textAlign: 'center' as const,
        }}>
          {value > 0 ? `+${value}` : '0'}
        </span>
        <button
          className="sc-step-btn"
          onClick={onAdd}
          disabled={max !== undefined && value >= max}
          style={{
            width: '1.5rem', height: '1.5rem', flexShrink: 0,
            borderRadius: RADIUS.sm,
            border:       '1px solid var(--hud-border)',
            background:   'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
            fontFamily:   FONT_BODY,
            fontSize:     FS.label,
            color:        'var(--hud-gold)',
            cursor:       (max !== undefined && value >= max) ? 'not-allowed' as const : 'pointer' as const,
            display:      'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >+</button>
      </div>
    </div>
  )
}

function DifficultySelector({ selected, onSelect }: { selected: number; onSelect: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', padding: `${SP[1]} ${SP[2]}` }}>
      {DIFF_LABELS.map((label, idx) => {
        const active = selected === idx
        return (
          <button
            key={idx}
            className="sc-diff-btn"
            onClick={() => onSelect(idx)}
            style={{
              flex:          1,
              display:       'flex',
              flexDirection: 'column' as const,
              alignItems:    'center',
              gap:           2,
              padding:       `${SP[1]} 2px`,
              border:        `1px solid ${active ? DIFF_BORDER_ACTIVE : DIFF_BORDER_INACTIVE}`, /* die-identity game-mechanic exception */
              background:    active ? DIFF_BG_ACTIVE : 'transparent', /* die-identity game-mechanic exception */
              color:         active ? DIFF_COLOR_ACTIVE : 'var(--hud-text-dim)', /* die-identity game-mechanic exception */
              cursor:        'pointer',
              marginLeft:    idx > 0 ? -1 : 0,
              position:      'relative' as const,
              zIndex:        active ? 1 : 0,
              minWidth:      0,
            }}
          >
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
              {label}
            </span>
            {idx === 0 ? (
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, opacity: 0.4 }}>—</span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 1, justifyContent: 'center', maxWidth: 24 }}>
                {Array.from({ length: idx }).map((_, pi) => (
                  <div key={pi} style={{
                    width: 6, height: 6, /* die shape px — geometry not spacing */
                    background: DICE_COLOR.difficulty, /* die-identity hex — sealed namespace */
                    clipPath: CLIP_DIA,
                    flexShrink: 0,
                  }} />
                ))}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────

export function HudSkillQuickList({ skills, onOpenPopover: _onOpenPopover, onRoll }: HudSkillQuickListProps) {
  // ── Mode state ──────────────────────────────────────────────────────────
  const [mode,     setMode]     = useState<SkillCheckMode>('browse')
  const [filter,   setFilter]   = useState<FilterMode>('all')
  const [query,    setQuery]    = useState('')
  const [selected, setSelected] = useState<HudSkill | null>(null)

  // Roll mode local state
  const [boostAdd,           setBoostAdd]           = useState(0)
  const [setbackAdd,         setSetbackAdd]         = useState(0)
  const [upgradeSkill,       setUpgradeSkill]       = useState(0)
  const [selectedDifficulty, setSelectedDifficulty] = useState(2) // Average
  const [diffUpgrades,       setDiffUpgrades]       = useState(0)

  // ── Browse: group skills by characteristic ────────────────────────────
  const filteredSkills = useMemo(() => {
    const q = query.trim().toLowerCase()
    return skills
      .filter(s => !q || s.name.toLowerCase().includes(q))
      .filter(s => filter === 'all' ? true : filter === 'trained' ? s.rank > 0 : s.isCareer)
  }, [skills, query, filter])

  const skillsByChar = useMemo(() => {
    const map: Partial<Record<CharKey, HudSkill[]>> = {}
    for (const s of filteredSkills) {
      const k = s.charKey as CharKey
      ;(map[k] ??= []).push(s)
    }
    for (const k of CHAR_ORDER) {
      map[k]?.sort((a, b) => a.name.localeCompare(b.name))
    }
    return map
  }, [filteredSkills])

  // ── Roll mode: live pool calculation ─────────────────────────────────
  const pool = useMemo(() => {
    if (!selected) return {} as Record<string, number>
    const proficiency = Math.min(selected.charVal, selected.rank + upgradeSkill)
    const ability     = selected.charVal - proficiency
    const baseDiff    = selectedDifficulty
    const challenge   = Math.min(diffUpgrades, baseDiff)
    const difficulty  = baseDiff - challenge
    return { proficiency, ability, boost: boostAdd, setback: setbackAdd, challenge, difficulty }
  }, [selected, boostAdd, setbackAdd, upgradeSkill, selectedDifficulty, diffUpgrades])

  const upgradeSkillCap = selected ? selected.charVal - Math.min(selected.charVal, selected.rank) : 0
  const playerDiceTotal = (pool.proficiency ?? 0) + (pool.ability ?? 0) + (pool.boost ?? 0)
  const canRoll         = playerDiceTotal > 0

  // ── Handlers ──────────────────────────────────────────────────────────
  const selectSkill = (skill: HudSkill) => {
    setSelected(skill)
    setBoostAdd(0); setSetbackAdd(0); setUpgradeSkill(0)
    setSelectedDifficulty(2); setDiffUpgrades(0)
    setMode('roll')
  }

  const goBack = () => {
    setMode('browse')
    setSelected(null)
  }

  const handleDifficultySelect = (v: number) => {
    setSelectedDifficulty(v)
    setDiffUpgrades(0)
  }

  const handleRollClick = () => {
    if (!selected || !canRoll) return
    const result = rollPool(pool as Parameters<typeof rollPool>[0])
    onRoll?.(result, `${selected.name} Check`, pool)
    goBack()
  }

  // ── Pool summary ──────────────────────────────────────────────────────
  const poolSummary = useMemo(() => {
    const parts: string[] = []
    if (pool.proficiency) parts.push(`${pool.proficiency}×PROF`)
    if (pool.ability)     parts.push(`${pool.ability}×ABIL`)
    if (pool.boost)       parts.push(`${pool.boost}×BST`)
    const diffParts: string[] = []
    if (pool.challenge)   diffParts.push(`${pool.challenge}×CHL`)
    if (pool.difficulty)  diffParts.push(`${pool.difficulty}×DIF`)
    if (pool.setback)     diffParts.push(`${pool.setback}×SET`)
    if (selectedDifficulty === 0 && !diffParts.length) diffParts.push('Simple')
    return diffParts.length
      ? `${parts.join(' · ')} vs ${diffParts.join(' · ')}`
      : parts.join(' · ') || '—'
  }, [pool, selectedDifficulty])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative' }}>

      {/* ══════════════════ BROWSE MODE ══════════════════ */}
      {mode === 'browse' && (
        <>
          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: SP[1],
            padding: `${SP[1]} ${SP[2]}`,
            borderBottom: '1px solid var(--hud-border)',
            flexShrink: 0,
          }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search skills…"
              className="hud-skill-search"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text)',
              }}
            />
            <span style={{
              fontFamily:    FONT_DISPLAY,
              fontSize:      FS.overline,
              letterSpacing: '0.05em',
              color:         'var(--hud-text-faint)',
              opacity:       0.28,
              flexShrink:    0,
            }}>
              Tap to roll
            </span>
          </div>

          {/* Filter chips */}
          <FilterChips filter={filter} setFilter={setFilter} />

          {/* Skill list grouped by characteristic */}
          <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
            {CHAR_ORDER.map(charKey => {
              const group = skillsByChar[charKey]
              if (!group?.length) return null
              const charVal = group[0]?.charVal ?? 0
              return (
                <div key={charKey}>
                  <CharGroupHeader charKey={charKey} charVal={charVal} />
                  {group.map(skill => (
                    <SkillRow key={skill.key} skill={skill} onSelect={selectSkill} />
                  ))}
                </div>
              )
            })}
            {filteredSkills.length === 0 && (
              <div style={{
                padding: `${SP[3]} ${SP[2]}`, textAlign: 'center' as const,
                fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)',
              }}>
                {query ? `No skills match "${query}"` : 'No skills'}
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════════ ROLL MODE ══════════════════ */}
      {mode === 'roll' && selected && (
        <>
          <BackBar skill={selected} onBack={goBack} />
          <DiceTray pool={pool} />

          <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
            <SectionLabel>Your Pool</SectionLabel>
            <RollStepper
              label="Add Boost"
              sublabel="+1 blue □ — favourable circumstance"
              value={boostAdd} min={0}
              onAdd={() => setBoostAdd(v => v + 1)}
              onRemove={() => setBoostAdd(v => Math.max(0, v - 1))}
            />
            <RollStepper
              label="Upgrade Skill"
              sublabel="Ability ◆ → Proficiency ✦"
              value={upgradeSkill} min={0} max={upgradeSkillCap}
              onAdd={() => setUpgradeSkill(v => Math.min(upgradeSkillCap, v + 1))}
              onRemove={() => setUpgradeSkill(v => Math.max(0, v - 1))}
              dimmed={upgradeSkillCap === 0}
            />

            <SectionLabel>Difficulty</SectionLabel>
            <DifficultySelector selected={selectedDifficulty} onSelect={handleDifficultySelect} />
            <RollStepper
              label="Add Setback"
              sublabel="+1 black ■ — adverse condition"
              value={setbackAdd} min={0}
              onAdd={() => setSetbackAdd(v => v + 1)}
              onRemove={() => setSetbackAdd(v => Math.max(0, v - 1))}
            />

            <SectionLabel>Upgrade / Downgrade</SectionLabel>
            <RollStepper
              label="Upgrade Difficulty"
              sublabel="Difficulty ◆ → Challenge ✦ — deadlier"
              value={diffUpgrades} min={0} max={selectedDifficulty}
              onAdd={() => setDiffUpgrades(v => Math.min(selectedDifficulty, v + 1))}
              onRemove={() => setDiffUpgrades(v => Math.max(0, v - 1))}
              dimmed={selectedDifficulty === 0}
            />
          </div>

          {/* Roll CTA */}
          <div style={{ padding: SP[2], borderTop: '1px solid var(--hud-border)', flexShrink: 0 }}>
            <button
              onClick={handleRollClick}
              disabled={!canRoll}
              className="cc-roll-cta"
              style={{
                width:         '100%',
                padding:       `${SP[2]} 0`,
                clipPath:      'polygon(8px 0%,calc(100% - 8px) 0%,100% 50%,calc(100% - 8px) 100%,8px 100%,0% 50%)',
                background:    canRoll ? 'var(--hud-accent)' : 'color-mix(in srgb, var(--hud-accent) 20%, transparent)',
                border:        'none',
                cursor:        canRoll ? 'pointer' as const : 'not-allowed' as const,
                opacity:       canRoll ? 1 : 0.25,
                fontFamily:    FONT_DISPLAY,
                fontSize:      FS.label,
                fontWeight:    700,
                color:         canRoll ? 'rgba(0,0,0,0.85)' : 'var(--hud-text-faint)',
                letterSpacing: '0.28em',
                textTransform: 'uppercase' as const,
                transition:    `background ${EASE.quick}, opacity ${EASE.quick}`,
              }}
            >
              ⋄ Roll Dice
            </button>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.overline,
              opacity:    0.38, textAlign: 'center' as const,
              marginTop:  SP[1], color: 'var(--hud-text-faint)',
            }}>
              {poolSummary}
            </div>
          </div>
        </>
      )}

      <ScanlineOverlay />
    </div>
  )
}
