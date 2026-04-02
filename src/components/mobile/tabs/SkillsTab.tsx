'use client'

import { useState, useMemo } from 'react'
import { CHAR_REF_MAP, CHAR_ABBR3 } from '@/components/player-hud/design-tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { getSkillPool } from '@/components/player-hud/dice-engine'
import type { Character, CharacterSkill, RefSkill } from '@/lib/types'
import type { MobilePrePopSkill } from '@/components/mobile/overlays/DiceRollerSheet'
import type { SkillDiceModifier } from '@/lib/derivedStats'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD       = '#C8AA50'
const GOLD_DIM   = 'rgba(200,170,80,0.6)'
const GOLD_BD    = 'rgba(200,170,80,0.15)'
const BORDER     = 'rgba(200,170,80,0.1)'
const TEXT       = 'rgba(255,255,255,0.85)'
const TEXT_DIM   = 'rgba(255,255,255,0.45)'
const STICKY_BG  = 'rgba(6,13,9,0.96)'
const INPUT_BG   = 'rgba(6,13,9,0.9)'
const FONT_C     = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_R     = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M     = "'Courier New', monospace"

type SkillGroup = 'stGeneral' | 'stCombat' | 'stKnowledge'
const GROUP_LABELS: Record<SkillGroup, string> = {
  stGeneral:   'General Skills',
  stCombat:    'Combat Skills',
  stKnowledge: 'Knowledge Skills',
}
const GROUP_ORDER: SkillGroup[] = ['stGeneral', 'stCombat', 'stKnowledge']

function RankPips({ rank }: { rank: number }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: 2,
          background: i < rank ? GOLD : 'transparent',
          border: `1px solid ${i < rank ? GOLD : GOLD_BD}`,
        }} />
      ))}
    </div>
  )
}

const POOL_CAP = 6
const POOL_OVERFLOW_FONT = "'Share Tech Mono', 'Courier New', monospace"

function PoolPips({ proficiency, ability }: { proficiency: number; ability: number }) {
  const total = proficiency + ability

  if (total === 0) {
    return (
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <DiceFace type="ability" size={18} dimmed />
      </div>
    )
  }

  const shown    = Math.min(total, POOL_CAP)
  const overflow = total - shown
  const proShown = Math.min(proficiency, shown)
  const ablShown = shown - proShown

  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: proShown }).map((_, i) => (
        <DiceFace key={`p${i}`} type="proficiency" size={18} />
      ))}
      {Array.from({ length: ablShown }).map((_, i) => (
        <DiceFace key={`a${i}`} type="ability" size={18} />
      ))}
      {overflow > 0 && (
        <span style={{
          fontFamily: POOL_OVERFLOW_FONT,
          fontSize: 'clamp(0.58rem, 0.85vw, 0.68rem)',
          color: 'rgba(232,223,200,0.4)',
        }}>
          +{overflow}
        </span>
      )}
    </div>
  )
}

// ── Skill dice modifier indicators (mobile) ───────────────────────────────

function SetbackRemovalBadge({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
        <div key={i} style={{ position: 'relative', display: 'inline-block', width: 16, height: 16 }}>
          <DiceFace type="setback" size={16} active={false} dimmed />
          <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 16 16" width={16} height={16}>
            <line x1="3" y1="3" x2="13" y2="13" stroke="#e05252" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      ))}
      {count > 3 && (
        <span style={{
          fontFamily: POOL_OVERFLOW_FONT,
          fontSize: 'clamp(0.55rem, 0.8vw, 0.65rem)',
          color: '#e05252',
        }}>×{count}</span>
      )}
    </div>
  )
}

function BoostAddBadge({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
        <DiceFace key={i} type="boost" size={16} active={false} />
      ))}
      {count > 3 && (
        <span style={{
          fontFamily: POOL_OVERFLOW_FONT,
          fontSize: 'clamp(0.55rem, 0.8vw, 0.65rem)',
          color: 'rgba(232,223,200,0.4)',
        }}>×{count}</span>
      )}
    </div>
  )
}

interface SkillsTabProps {
  character: Character
  charSkills: CharacterSkill[]
  refSkills: RefSkill[]
  onSkillTap: (skill: MobilePrePopSkill) => void
  /** Dice modifiers from the derived stats engine, keyed by skill key */
  skillModifiers?: Record<string, SkillDiceModifier>
}

export function SkillsTab({ character, charSkills, refSkills, onSkillTap, skillModifiers = {} }: SkillsTabProps) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Partial<Record<SkillGroup, boolean>>>({})

  const skillMap = useMemo(
    () => Object.fromEntries((Array.isArray(charSkills) ? charSkills : []).map(s => [s.skill_key, s])),
    [charSkills]
  )

  const filtered = useMemo(() => {
    const safeRefSkills = Array.isArray(refSkills) ? refSkills : []
    const q = query.toLowerCase().trim()
    if (!q) return safeRefSkills
    return safeRefSkills.filter(rs => {
      const charAbbr = rs.characteristic_key.toLowerCase()
      return rs.name.toLowerCase().includes(q) || charAbbr.includes(q)
    })
  }, [refSkills, query])

  const grouped = useMemo(() => {
    const groups: Partial<Record<SkillGroup, RefSkill[]>> = {}
    for (const g of GROUP_ORDER) {
      const skills = filtered.filter(rs => rs.type === g).sort((a, b) => a.name.localeCompare(b.name))
      if (skills.length > 0) groups[g] = skills
    }
    return groups
  }, [filtered])

  const toggle = (g: SkillGroup) => setCollapsed(prev => ({ ...prev, [g]: !prev[g] }))

  const handleSkillTap = (rs: RefSkill) => {
    const cs = skillMap[rs.key]
    const rank = cs?.rank ?? 0
    const charKey = CHAR_REF_MAP[rs.characteristic_key]
    const charVal = (character[charKey] as number) ?? 0
    const { proficiency, ability } = getSkillPool(charVal, rank)
    const charAbbr = CHAR_ABBR3[charKey] ?? rs.characteristic_key
    onSkillTap({ name: rs.name, charAbbr, proficiency, ability })
  }

  return (
    <div>
      {/* Sticky search */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '8px 16px',
        background: STICKY_BG,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: GOLD_DIM, fontSize: 14, pointerEvents: 'none',
          }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search skills…"
            style={{
              width: '100%',
              background: INPUT_BG,
              border: `1px solid rgba(200,170,80,0.3)`,
              borderRadius: 6,
              padding: '8px 10px 8px 32px',
              color: GOLD,
              fontFamily: FONT_M,
              fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Grouped skill lists */}
      {GROUP_ORDER.map(g => {
        const skills = grouped[g]
        if (!skills) return null
        const isCollapsed = !!collapsed[g]
        return (
          <div key={g}>
            {/* Group header */}
            <button
              onClick={() => toggle(g)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px',
                background: 'rgba(200,170,80,0.05)',
                border: 'none',
                borderBottom: `1px solid ${BORDER}`,
                cursor: 'pointer',
              }}
            >
              <span style={{
                fontFamily: FONT_C,
                fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
                fontWeight: 700,
                color: GOLD,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                {GROUP_LABELS[g]}
              </span>
              <span style={{ color: GOLD_DIM, fontSize: 12 }}>{isCollapsed ? '▲' : '▼'}</span>
            </button>

            {/* Skill rows */}
            {!isCollapsed && skills.map(rs => {
              const cs = skillMap[rs.key]
              const rank = cs?.rank ?? 0
              const isCareer = cs?.is_career ?? false
              const charKey = CHAR_REF_MAP[rs.characteristic_key]
              const charVal = (character[charKey] as number) ?? 0
              const { proficiency, ability } = getSkillPool(charVal, rank)
              const charAbbr = CHAR_ABBR3[charKey] ?? rs.characteristic_key

              return (
                <button
                  key={rs.key}
                  onClick={() => handleSkillTap(rs)}
                  style={{
                    width: '100%',
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${BORDER}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {/* Career dot */}
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: isCareer ? GOLD : 'transparent',
                    border: `1px solid ${isCareer ? GOLD : GOLD_BD}`,
                  }} />

                  {/* Skill name */}
                  <span style={{
                    fontFamily: FONT_R,
                    fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)',
                    fontWeight: 600,
                    color: TEXT,
                    flex: 1,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {rs.name}
                  </span>

                  {/* Characteristic */}
                  <span style={{
                    fontFamily: FONT_M,
                    fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
                    color: GOLD_DIM,
                    flexShrink: 0,
                    width: 30,
                    textAlign: 'center',
                  }}>
                    {charAbbr}
                  </span>

                  {/* Rank pips */}
                  <div style={{ flexShrink: 0 }}>
                    <RankPips rank={rank} />
                  </div>

                  {/* Dice pool */}
                  <div style={{ flexShrink: 0, minWidth: 48 }}>
                    <PoolPips proficiency={proficiency} ability={ability} />
                  </div>

                  {/* Dice modifier badges */}
                  {skillModifiers[rs.key] && (skillModifiers[rs.key].boostAdd > 0 || skillModifiers[rs.key].setbackRemove > 0) && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      borderLeft: `1px solid rgba(200,170,80,0.2)`,
                      paddingLeft: 4,
                      flexShrink: 0,
                    }}>
                      {skillModifiers[rs.key].boostAdd > 0 && (
                        <BoostAddBadge count={skillModifiers[rs.key].boostAdd} />
                      )}
                      {skillModifiers[rs.key].setbackRemove > 0 && (
                        <SetbackRemovalBadge count={skillModifiers[rs.key].setbackRemove} />
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )
      })}

      <div style={{ height: 16 }} />
    </div>
  )
}
