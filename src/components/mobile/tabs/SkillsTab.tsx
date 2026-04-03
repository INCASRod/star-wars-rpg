'use client'

import { useState, useMemo, useRef } from 'react'
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
const FONT_CINZEL_REAL = "var(--font-cinzel),'Cinzel',serif"
const RED        = 'rgba(244,67,54,0.8)'

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

// ── Upgrade helpers ───────────────────────────────────────────────────────

function getSkillUpgradeCost(currentRank: number, isCareer: boolean): number {
  const newRank = currentRank + 1
  return isCareer ? 5 * newRank : (5 * newRank) + 5
}

// ── Mobile inline confirmation ────────────────────────────────────────────

function MobileInlineConfirmation({ name, newRank, cost, xpAvailable, onConfirm, onCancel }: {
  name: string
  newRank: number
  cost: number
  xpAvailable: number
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '8px 16px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: FONT_R, fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)',
          fontWeight: 600, color: 'rgba(232,223,200,0.85)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {name} → Rank {newRank}
        </div>
        <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.65rem, 2.5vw, 0.78rem)', color: GOLD }}>
          {cost} XP · {xpAvailable} available
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onCancel() }}
          style={{
            width: 36, height: 36, borderRadius: 6,
            background: 'rgba(244,67,54,0.08)',
            border: '1px solid rgba(244,67,54,0.35)',
            color: RED, cursor: 'pointer',
            fontFamily: FONT_R, fontSize: 'clamp(0.85rem, 3.5vw, 1rem)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
        >
          ✗
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onConfirm() }}
          style={{
            width: 36, height: 36, borderRadius: 6,
            background: 'linear-gradient(135deg, rgba(200,170,80,0.25), rgba(200,170,80,0.15))',
            border: `1px solid ${GOLD}`,
            color: GOLD, cursor: 'pointer',
            fontFamily: FONT_R, fontSize: 'clamp(0.85rem, 3.5vw, 1rem)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
        >
          ✓
        </button>
      </div>
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
  /** Available XP for upgrade affordability check */
  xpAvailable?: number
  /** Called when the player confirms a skill upgrade */
  onUpgradeSkill?: (skillKey: string, currentRank: number, isCareer: boolean) => void
}

export function SkillsTab({ character, charSkills, refSkills, onSkillTap, skillModifiers = {}, xpAvailable, onUpgradeSkill }: SkillsTabProps) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Partial<Record<SkillGroup, boolean>>>({})
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const startConfirm = (skillKey: string) => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    setConfirmingKey(skillKey)
    confirmTimerRef.current = setTimeout(() => setConfirmingKey(null), 5000)
  }

  const cancelConfirm = () => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    setConfirmingKey(null)
  }

  const executeUpgrade = (skillKey: string, rank: number, isCareer: boolean) => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    setConfirmingKey(null)
    onUpgradeSkill?.(skillKey, rank, isCareer)
  }

  const handleSkillTap = (rs: RefSkill) => {
    const cs = skillMap[rs.key]
    const rank = cs?.rank ?? 0
    const charKey = CHAR_REF_MAP[rs.characteristic_key]
    const charVal = (character[charKey] as number) ?? 0
    const { proficiency, ability } = getSkillPool(charVal, rank)
    const charAbbr = CHAR_ABBR3[charKey] ?? rs.characteristic_key
    onSkillTap({ name: rs.name, charAbbr, proficiency, ability })
  }

  const xpColor = xpAvailable !== undefined
    ? xpAvailable > 20 ? 'rgba(200,170,80,0.6)'
      : xpAvailable > 0 ? '#FF9800'
      : 'rgba(244,67,54,0.7)'
    : GOLD_DIM

  return (
    <div>
      {/* Sticky search + XP indicator */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '8px 16px',
        background: STICKY_BG,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        {/* XP available indicator */}
        {xpAvailable !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 5 }}>
            <div style={{
              fontFamily: FONT_M,
              fontSize: 'clamp(0.65rem, 2.5vw, 0.78rem)',
              color: xpColor,
            }}>
              Available XP: {xpAvailable}
            </div>
          </div>
        )}

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
              const isMaxRank = rank >= 5
              const isConfirming = confirmingKey === rs.key
              const cost = !isMaxRank ? getSkillUpgradeCost(rank, isCareer) : 0
              const canAfford = xpAvailable !== undefined && xpAvailable >= cost

              return (
                <div
                  key={rs.key}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 44,
                    borderBottom: `1px solid ${BORDER}`,
                    background: isConfirming ? 'rgba(200,170,80,0.05)' : 'transparent',
                  }}
                >
                  {isConfirming ? (
                    <MobileInlineConfirmation
                      name={rs.name}
                      newRank={rank + 1}
                      cost={cost}
                      xpAvailable={xpAvailable ?? 0}
                      onConfirm={() => executeUpgrade(rs.key, rank, isCareer)}
                      onCancel={cancelConfirm}
                    />
                  ) : (
                    <>
                      {/* Main tappable area for dice roll */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSkillTap(rs)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSkillTap(rs)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 0 8px 16px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          minWidth: 0,
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
                      </div>

                      {/* Right-side controls: [+] + pips + pool + modifiers */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '0 16px 0 6px', flexShrink: 0,
                      }}>
                        {/* [+] upgrade button — immediately left of rank pips */}
                        {!isMaxRank && onUpgradeSkill && (
                          <button
                            onClick={(e) => { e.stopPropagation(); if (canAfford) startConfirm(rs.key) }}
                            title={`Upgrade to Rank ${rank + 1} — Cost: ${cost} XP${!canAfford ? ' (Not enough XP)' : ''}`}
                            style={{
                              width: 28, height: 28, borderRadius: 6,
                              background: canAfford ? 'rgba(200,170,80,0.1)' : 'rgba(255,255,255,0.02)',
                              border: `1px solid ${canAfford ? 'rgba(200,170,80,0.35)' : 'rgba(255,255,255,0.1)'}`,
                              color: canAfford ? GOLD : 'rgba(232,223,200,0.2)',
                              fontFamily: FONT_CINZEL_REAL,
                              fontSize: 'clamp(0.75rem, 3vw, 0.85rem)',
                              cursor: canAfford ? 'pointer' : 'not-allowed',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              padding: 0, flexShrink: 0,
                            }}
                          >
                            +
                          </button>
                        )}

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
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      <div style={{ height: 16 }} />
    </div>
  )
}
