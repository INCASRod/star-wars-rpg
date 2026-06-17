'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, HUD, EASE } from '@/lib/tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { getSkillPool } from '@/components/player-hud/dice-engine'
import type { HudSkill } from '@/lib/types'

// ── Sealed game-mechanic colours ──────────────────────────────────────────────
const XP_GOLD = '#C8961A' /* FFG proficiency die — sealed */
const DANGER  = '#E85A2A' /* wounds/danger — Ember Tatooine exception */
const ABILITY_GREEN = '#4A7A30' /* FFG ability die — sealed */

// ── Characteristic abbreviations (2-char, matches MobileSkillsScreen) ─────────
const CHAR_ABBR2: Record<string, string> = {
  brawn: 'Br', agility: 'Ag', cunning: 'Cu',
  intellect: 'In', willpower: 'Wi', presence: 'Pr',
}

// Badge tints (matches MobileSkillsScreen)
const CHAR_BADGE_BG: Record<string, string> = {
  brawn:     `color-mix(in srgb, var(--hud-accent) 18%, transparent)`,
  agility:   `color-mix(in srgb, #4A7A30 20%, transparent)`, /* FFG ability die — sealed */
  cunning:   `color-mix(in srgb, var(--hud-gold) 15%, transparent)`,
  intellect: `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
  willpower: `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
  presence:  `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
}

const CHAR_ORDER = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence']
const CHAR_NAMES: Record<string, string> = {
  brawn: 'Brawn', agility: 'Agility', intellect: 'Intellect',
  cunning: 'Cunning', willpower: 'Willpower', presence: 'Presence',
}
const TYPE_ORDER = ['stGeneral', 'stCombat', 'stKnowledge']
const TYPE_NAMES: Record<string, string> = {
  stGeneral: 'General', stCombat: 'Combat', stKnowledge: 'Knowledge',
}

type ViewMode = 'by-char' | 'by-type'

// ── Props ─────────────────────────────────────────────────────────────────────
interface MobileSkillsBuyScreenProps {
  hudSkills:   HudSkill[]
  xpAvailable: number
  onBuySkill:  (skillKey: string, currentRank: number, isCareer: boolean) => Promise<void>
}

// ── CharBadge ─────────────────────────────────────────────────────────────────
function CharBadge({ charKey }: { charKey: string }) {
  return (
    <div style={{
      width: 22, height: 22, /* fixed badge geometry */
      borderRadius: RADIUS.sm,
      background: CHAR_BADGE_BG[charKey] ?? `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
      color: HUD.text, letterSpacing: '0.05em',
    }}>
      {CHAR_ABBR2[charKey] ?? '?'}
    </div>
  )
}

// ── PipTrack ──────────────────────────────────────────────────────────────────
function PipTrack({ rank }: { rank: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' /* below SP[1] floor — fixed pip geometry */, alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: 1, /* fixed pip geometry */
          background: i < rank ? 'var(--hud-gold)' : 'transparent',
          border: `1px solid ${i < rank ? 'var(--hud-gold)' : 'var(--hud-border-hi)'}`,
        }} />
      ))}
    </div>
  )
}

// ── SkillRow ──────────────────────────────────────────────────────────────────
interface SkillRowProps {
  skill:        HudSkill
  xpAvailable:  number
  isConfirming: boolean
  hasError:     boolean
  onTap:        () => void
  onCancel:     () => void
  onConfirm:    () => void
}

function SkillRow({ skill, xpAvailable, isConfirming, hasError, onTap, onCancel, onConfirm }: SkillRowProps) {
  const isMax    = skill.rank >= 5
  const nextRank = skill.rank + 1
  const cost     = nextRank * 5 + (skill.isCareer ? 0 : 5)
  const affordable = xpAvailable >= cost

  const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)

  // Skill name colour: gold if ranked, accent if career+unranked, faint otherwise
  const nameColor = skill.rank > 0
    ? XP_GOLD /* FFG proficiency die — sealed */
    : skill.isCareer
      ? 'var(--hud-accent)'
      : HUD.textFaint

  return (
    <div style={{ borderBottom: `1px solid var(--hud-border)` }}>
      {/* ── Main row ── */}
      <button
        onClick={isMax ? undefined : onTap}
        aria-disabled={isMax}
        style={{
          display: 'flex', alignItems: 'center', gap: SP[1],
          width: '100%', textAlign: 'left',
          padding: `${SP[1]} ${SP[2]}`,
          background: isConfirming
            ? `color-mix(in srgb, var(--hud-accent) 6%, transparent)`
            : 'transparent',
          border: 'none',
          borderLeft: `2px solid ${skill.isCareer ? 'var(--hud-accent)' : 'transparent'}`,
          cursor: isMax ? 'default' : 'pointer',
          minHeight: 44, /* minimum touch target */
          transition: `background ${EASE.quick}`,
        }}
      >
        <CharBadge charKey={skill.charKey} />

        <div style={{
          flex: 1, minWidth: 0,
          display: 'flex', flexDirection: 'column', gap: '2px', /* compact label+pip stack */
        }}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.sm,
            color: nameColor, fontWeight: skill.isCareer ? 700 : 400,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {skill.name}
          </div>
          <PipTrack rank={skill.rank} />
        </div>

        {/* Die pool */}
        <div style={{
          display: 'flex', gap: '2px' /* below SP[1] floor — fixed die geometry */,
          flexShrink: 0, alignItems: 'center',
        }}>
          {Array.from({ length: Math.min(proficiency, 4) }).map((_, i) => (
            <DiceFace key={`p${i}`} type="proficiency" size={16} />
          ))}
          {Array.from({ length: Math.min(ability, 4) }).map((_, i) => (
            <DiceFace key={`a${i}`} type="ability" size={16} />
          ))}
        </div>

        {/* XP cost / MAX badge */}
        {isMax ? (
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: HUD.textFaint, flexShrink: 0,
            padding: `1px ${SP[1]}`,
          }}>
            MAX
          </div>
        ) : (
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
            letterSpacing: '0.04em', flexShrink: 0,
            padding: `1px ${SP[1]}`,
            borderRadius: RADIUS.sm,
            color: affordable
              ? XP_GOLD  /* FFG proficiency die — sealed */
              : DANGER,  /* wounds/danger — Ember Tatooine exception */
            border: `1px solid ${affordable
              ? `color-mix(in srgb, #C8961A 30%, transparent)` /* FFG proficiency die — sealed */
              : `color-mix(in srgb, #E85A2A 30%, transparent)` /* wounds/danger — Ember Tatooine exception */
            }`,
            background: affordable
              ? `color-mix(in srgb, #C8961A 8%, transparent)` /* FFG proficiency die — sealed */
              : `color-mix(in srgb, #E85A2A 8%, transparent)`, /* wounds/danger — Ember Tatooine exception */
          }}>
            {cost} XP
          </div>
        )}
      </button>

      {/* ── Inline purchase error ── */}
      {hasError && (
        <div style={{
          padding: `${SP[1]} ${SP[2]}`,
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
          color: DANGER, /* wounds/danger — Ember Tatooine exception */
          letterSpacing: '0.06em',
        }}>
          Purchase failed
        </div>
      )}

      {/* ── Inline confirmation panel ── */}
      {isConfirming && (
        <div style={{
          padding: SP[2],
          background: `color-mix(in srgb, var(--hud-accent) 5%, transparent)`,
          borderTop: `1px solid color-mix(in srgb, var(--hud-accent) 20%, transparent)`,
          display: 'flex', flexDirection: 'column', gap: SP[1],
        }}>
          {/* Skill + cost summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
            <span style={{
              flex: 1, minWidth: 0,
              fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
              color: 'var(--hud-accent)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {skill.name} → Rank {nextRank}
            </span>
            <span style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
              color: XP_GOLD, /* FFG proficiency die — sealed */
              flexShrink: 0,
            }}>
              {cost} XP
            </span>
          </div>

          {/* Remaining XP */}
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.overline,
            color: xpAvailable - cost >= 0
              ? ABILITY_GREEN /* FFG ability die — sealed */
              : DANGER, /* wounds/danger — Ember Tatooine exception */
          }}>
            {xpAvailable - cost} XP remaining
          </div>

          {/* Cancel / Confirm buttons */}
          <div style={{ display: 'flex', gap: SP[1] }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: `${SP[1]} 0`,
                background: 'transparent',
                border: `1px solid var(--hud-border)`,
                borderRadius: RADIUS.md,
                cursor: 'pointer',
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: HUD.textFaint,
              }}
            >
              ✗ Cancel
            </button>
            <button
              onClick={affordable ? onConfirm : undefined}
              aria-disabled={!affordable}
              style={{
                flex: 1,
                padding: `${SP[1]} 0`,
                background: affordable
                  ? 'var(--hud-accent)'
                  : `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
                border: `1px solid ${affordable ? 'var(--hud-accent)' : 'var(--hud-border)'}`,
                borderRadius: RADIUS.md,
                cursor: affordable ? 'pointer' : 'not-allowed',
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: affordable ? 'var(--hud-bg)' : HUD.textFaint,
                opacity: affordable ? 1 : 0.5,
              }}
            >
              ✓ Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Section (collapsible group of skill rows) ─────────────────────────────────
interface SectionProps {
  sectionKey:   string
  label:        string
  badge?:       string
  badgeBg?:     string
  rightLabel?:  string
  isCollapsed:  boolean
  onToggle:     () => void
  skills:       HudSkill[]
  xpAvailable:  number
  confirming:   string | null
  rowError:     string | null
  onRowTap:     (key: string) => void
  onCancel:     () => void
  onConfirm:    (skill: HudSkill) => void
}

function Section({
  label, badge, badgeBg, rightLabel, isCollapsed, onToggle,
  skills, xpAvailable, confirming, rowError, onRowTap, onCancel, onConfirm,
}: SectionProps) {
  return (
    <div>
      {/* Section header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: SP[1],
          padding: `${SP[1]} ${SP[2]}`,
          background: 'var(--hud-surface-hi)',
          border: 'none',
          borderBottom: `1px solid var(--hud-border)`,
          cursor: 'pointer',
          minHeight: 32, /* fixed section header height */
        }}
      >
        {badge && (
          <div style={{
            width: 22, height: 22, /* fixed badge geometry */
            borderRadius: RADIUS.sm,
            background: badgeBg ?? `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
            color: HUD.text, letterSpacing: '0.05em',
          }}>
            {badge}
          </div>
        )}
        <span style={{
          flex: 1,
          fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: HUD.text,
        }}>
          {label}
        </span>
        {rightLabel && (
          <span style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
            color: HUD.text, flexShrink: 0,
          }}>
            {rightLabel}
          </span>
        )}
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.overline,
          color: HUD.textFaint, flexShrink: 0, marginLeft: SP[1],
        }}>
          {isCollapsed ? '▶' : '▼'}
        </span>
      </button>

      {/* Skill rows */}
      {!isCollapsed && skills.map(skill => (
        <SkillRow
          key={skill.key}
          skill={skill}
          xpAvailable={xpAvailable}
          isConfirming={confirming === skill.key}
          hasError={rowError === skill.key}
          onTap={() => {
            if (confirming === skill.key) {
              onCancel()
            } else {
              onRowTap(skill.key)
            }
          }}
          onCancel={onCancel}
          onConfirm={() => onConfirm(skill)}
        />
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export function MobileSkillsBuyScreen({ hudSkills, xpAvailable, onBuySkill }: MobileSkillsBuyScreenProps) {
  const [viewMode, setViewMode]   = useState<ViewMode>('by-char')
  const [search, setSearch]       = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [confirming, setConfirming] = useState<string | null>(null)
  const [rowError, setRowError]   = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cancel auto-close timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  // Switch view mode: clear search and any open confirmation
  function handleViewMode(mode: ViewMode) {
    setViewMode(mode)
    setSearch('')
    cancelConfirm()
  }

  // Open confirmation panel for a row (cancels any prior timer)
  function openConfirm(skillKey: string) {
    if (timerRef.current) clearTimeout(timerRef.current)
    setConfirming(skillKey)
    setRowError(null)
    timerRef.current = setTimeout(() => setConfirming(null), 5000)
  }

  function cancelConfirm() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setConfirming(null)
  }

  async function executeConfirm(skill: HudSkill) {
    if (timerRef.current) clearTimeout(timerRef.current)
    setConfirming(null)
    try {
      await onBuySkill(skill.key, skill.rank, skill.isCareer)
    } catch {
      setRowError(skill.key)
      setTimeout(() => setRowError(null), 3000)
    }
  }

  // XP header colour: accent > 20, gold 1-20, danger 0
  const xpColor = xpAvailable > 20
    ? 'var(--hud-accent)'
    : xpAvailable > 0
      ? XP_GOLD /* FFG proficiency die — sealed */
      : DANGER  /* wounds/danger — Ember Tatooine exception */

  // Filter by name or characteristic abbreviation
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return hudSkills
    return hudSkills.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (CHAR_ABBR2[s.charKey]?.toLowerCase() ?? '').includes(q) ||
      s.charKey.toLowerCase().includes(q)
    )
  }, [hudSkills, search])

  // Group by characteristic
  const byChar = useMemo(() => {
    const groups: Record<string, HudSkill[]> = {}
    for (const k of CHAR_ORDER) groups[k] = []
    for (const s of filtered) {
      if (groups[s.charKey]) groups[s.charKey].push(s)
    }
    return groups
  }, [filtered])

  // Group by skill type
  const byType = useMemo(() => {
    const groups: Record<string, HudSkill[]> = {
      stGeneral: [], stCombat: [], stKnowledge: [],
    }
    for (const s of filtered) {
      const t = s.type ?? 'stGeneral'
      if (groups[t]) groups[t].push(s)
      else groups.stGeneral.push(s)
    }
    return groups
  }, [filtered])

  const toggleSection = (key: string) =>
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))

  const noResults = filtered.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        borderBottom: `1px solid var(--hud-border)`,
        background: 'var(--hud-panel)',
        padding: SP[2],
        display: 'flex', flexDirection: 'column', gap: SP[1],
      }}>
        {/* XP display + view mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700,
              color: xpColor, letterSpacing: '0.04em', lineHeight: 1,
            }}>
              {xpAvailable}
            </div>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: HUD.textFaint, marginTop: '2px', /* fixed pixel — below SP[1] floor */
            }}>
              XP AVAILABLE
            </div>
          </div>

          {/* View mode pills */}
          <div style={{ display: 'flex', gap: '2px' /* fixed pill gap */, flexShrink: 0 }}>
            {(['by-char', 'by-type'] as ViewMode[]).map(mode => {
              const active = viewMode === mode
              return (
                <button
                  key={mode}
                  onClick={() => handleViewMode(mode)}
                  style={{
                    padding: `${SP[1]} ${SP[2]}`,
                    borderRadius: RADIUS.md,
                    border: `1px solid ${active ? 'var(--hud-accent)' : 'var(--hud-border)'}`,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: active ? 'var(--hud-accent)' : HUD.textFaint,
                    whiteSpace: 'nowrap',
                    transition: `color ${EASE.quick}, border-color ${EASE.quick}`,
                  }}
                >
                  {mode === 'by-char' ? 'By Char' : 'By Type'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Search bar */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search skills or characteristic…"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: `${SP[1]} ${SP[2]}`,
            background: 'var(--hud-surface-hi)',
            border: `1px solid var(--hud-border)`,
            borderRadius: RADIUS.md,
            fontFamily: FONT_BODY, fontSize: FS.sm,
            color: HUD.text,
            outline: 'none',
          }}
        />
      </div>

      {/* ── Skill list ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        {noResults ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: SP[2], padding: SP[4],
            flex: 1, minHeight: '200px',
          }}>
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.sm,
              color: HUD.textFaint, textAlign: 'center',
            }}>
              No skills match
            </div>
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'transparent',
                border: `1px solid var(--hud-border)`,
                borderRadius: RADIUS.md,
                padding: `${SP[1]} ${SP[2]}`,
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: HUD.textFaint, cursor: 'pointer',
              }}
            >
              Clear search
            </button>
          </div>
        ) : viewMode === 'by-char' ? (
          CHAR_ORDER.map(charKey => {
            const skills = byChar[charKey]
            if (!skills || skills.length === 0) return null
            const charVal = skills[0]?.charVal ?? 0
            return (
              <Section
                key={charKey}
                sectionKey={charKey}
                label={CHAR_NAMES[charKey]}
                badge={CHAR_ABBR2[charKey]}
                badgeBg={CHAR_BADGE_BG[charKey]}
                rightLabel={String(charVal)}
                isCollapsed={!!collapsed[charKey]}
                onToggle={() => toggleSection(charKey)}
                skills={skills}
                xpAvailable={xpAvailable}
                confirming={confirming}
                rowError={rowError}
                onRowTap={openConfirm}
                onCancel={cancelConfirm}
                onConfirm={executeConfirm}
              />
            )
          })
        ) : (
          TYPE_ORDER.map(typeKey => {
            const skills = byType[typeKey]
            if (!skills || skills.length === 0) return null
            return (
              <Section
                key={typeKey}
                sectionKey={typeKey}
                label={TYPE_NAMES[typeKey]}
                isCollapsed={!!collapsed[typeKey]}
                onToggle={() => toggleSection(typeKey)}
                skills={skills}
                xpAvailable={xpAvailable}
                confirming={confirming}
                rowError={rowError}
                onRowTap={openConfirm}
                onCancel={cancelConfirm}
                onConfirm={executeConfirm}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
