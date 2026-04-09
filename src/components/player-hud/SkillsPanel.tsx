'use client'

import { useState, useEffect, useRef } from 'react'
import { C, CHAR_COLOR, CHAR_ABBR3, FONT_CINZEL, FONT_RAJDHANI, panelBase, type CharKey } from './design-tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { Tooltip, TipLabel, TipBody, TipDivider } from '@/components/ui/Tooltip'
import { getSkillTip } from '@/lib/tooltips/skillDescriptions'
import { PanelSearchInput } from '@/components/character/PanelSearchInput'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { SpeciesAbility } from '@/lib/types'

export interface HudSkill {
  key: string
  name: string
  charKey: CharKey
  charVal: number
  rank: number
  isCareer: boolean
}

interface SkillsPanelProps {
  skills: HudSkill[]
  onRoll: (skill: HudSkill) => void
  onUpgrade: (skill: HudSkill) => void
  isCombat: boolean
  xpAvailable: number
  onOpenPopover?: (skill: HudSkill, anchor: DOMRect) => void
  characterId?: string
  /** Dice modifiers from the derived stats engine, keyed by skill key */
  skillModifiers?: Record<string, SkillDiceModifier>
  /** Species special abilities for conditional skill indicators */
  speciesAbilities?: SpeciesAbility[]
}

// ── Skill dice modifier indicator ──────────────────────────────────────────

function SetbackRemovalIndicator({ count, sources }: { count: number; sources: string[] }) {
  const tipContent = (
    <>
      <TipLabel>Removes {count} Setback {count === 1 ? 'die' : 'dice'}</TipLabel>
      <TipDivider />
      {sources.map((s, i) => <TipBody key={i}>{s}</TipBody>)}
    </>
  )
  return (
    <Tooltip content={tipContent} placement="top" maxWidth={220}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'default' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ position: 'relative', display: 'inline-block', width: 16, height: 16 }}>
            <DiceFace type="setback" size={16} active={false} dimmed />
            <svg
              style={{ position: 'absolute', inset: 0 }}
              viewBox="0 0 16 16"
              width={16}
              height={16}
            >
              <line x1="3" y1="3" x2="13" y2="13" stroke="#e05252" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        ))}
      </div>
    </Tooltip>
  )
}

function BoostAddIndicator({ count, sources }: { count: number; sources: string[] }) {
  const tipContent = (
    <>
      <TipLabel>+{count} Boost {count === 1 ? 'die' : 'dice'}</TipLabel>
      <TipDivider />
      {sources.map((s, i) => <TipBody key={i}>{s}</TipBody>)}
    </>
  )
  return (
    <Tooltip content={tipContent} placement="top" maxWidth={220}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'default' }}>
        {Array.from({ length: count }).map((_, i) => (
          <DiceFace key={i} type="boost" size={16} active={false} />
        ))}
      </div>
    </Tooltip>
  )
}

function SkillModifierBadges({ mod }: { mod: SkillDiceModifier }) {
  if (mod.boostAdd <= 0 && mod.setbackRemove <= 0) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 3,
      borderLeft: `1px solid rgba(200,170,80,0.2)`,
      paddingLeft: 4,
      marginLeft: 2,
    }}>
      {mod.boostAdd > 0 && (
        <BoostAddIndicator count={mod.boostAdd} sources={mod.sources} />
      )}
      {mod.setbackRemove > 0 && (
        <SetbackRemovalIndicator count={mod.setbackRemove} sources={mod.sources} />
      )}
    </div>
  )
}

type Filter = 'All' | 'Trained' | 'Career'

const CHAR_ORDER: CharKey[] = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence']

const CHAR_ABBR2: Record<string, string> = {
  brawn: 'br', agility: 'ag', intellect: 'int',
  cunning: 'cun', willpower: 'will', presence: 'pr',
}

const POOL_CAP = 6
const POOL_OVERFLOW_FONT = "'Share Tech Mono', 'Courier New', monospace"

function PoolPreview({ charVal, rank }: { charVal: number; rank: number }) {
  const proficiency = Math.min(charVal, rank)
  const ability     = Math.abs(charVal - rank)
  const total       = proficiency + ability

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

function RankPips({ rank }: { rank: number }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          width: 9, height: 9, borderRadius: 2,
          background: i < rank ? C.gold : 'transparent',
          border: `1px solid ${i < rank ? C.gold : C.border}`,
        }} />
      ))}
    </div>
  )
}

function CornerBrackets({ color = C.gold }: { color?: string }) {
  const s = { position: 'absolute' as const, width: 6, height: 6 }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </>
  )
}

// ── Upgrade helpers ────────────────────────────────────────────────────────

function getSkillUpgradeCost(currentRank: number, isCareer: boolean): number {
  const newRank = currentRank + 1
  return isCareer ? 5 * newRank : (5 * newRank) + 5
}

const FONT_MONO = "'Share Tech Mono','Courier New',monospace"
const FONT_CINZEL_REAL = "var(--font-cinzel),'Cinzel',serif"
const RED = 'rgba(244,67,54,0.8)'

// ── Upgrade button (left of rank pips) ────────────────────────────────────

function UpgradeButton({ skill, xpAvailable, onClick }: {
  skill: HudSkill
  xpAvailable: number
  onClick: () => void
}) {
  const [showTip, setShowTip] = useState(false)
  const cost = getSkillUpgradeCost(skill.rank, skill.isCareer)
  const canAfford = xpAvailable >= cost

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={(e) => { e.stopPropagation(); if (canAfford) onClick() }}
        onMouseEnter={(e) => {
          setShowTip(true)
          if (canAfford) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,170,80,0.2)'
        }}
        onMouseLeave={(e) => {
          setShowTip(false)
          ;(e.currentTarget as HTMLButtonElement).style.background = canAfford ? 'rgba(200,170,80,0.1)' : 'rgba(255,255,255,0.02)'
        }}
        style={{
          width: 28, height: 28, borderRadius: 6,
          background: canAfford ? 'rgba(200,170,80,0.1)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${canAfford ? 'rgba(200,170,80,0.35)' : 'rgba(255,255,255,0.1)'}`,
          color: canAfford ? C.gold : 'rgba(232,223,200,0.2)',
          fontFamily: FONT_CINZEL_REAL,
          fontSize: 'clamp(0.75rem, 1.1vw, 0.85rem)',
          cursor: canAfford ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: '.15s', padding: 0, lineHeight: 1,
        }}
      >
        +
      </button>
      {showTip && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9000,
          background: 'rgba(4,10,6,0.97)',
          border: '1px solid rgba(200,170,80,0.32)',
          borderRadius: 8,
          padding: '10px 12px',
          minWidth: 150,
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontFamily: FONT_CINZEL_REAL, fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, marginBottom: 5 }}>
            Upgrade to Rank {skill.rank + 1}
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 'clamp(0.6rem, 0.9vw, 0.72rem)', color: canAfford ? C.gold : RED, marginBottom: 2 }}>
            Cost: {cost} XP
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 'clamp(0.6rem, 0.9vw, 0.72rem)', color: canAfford ? 'rgba(232,223,200,0.7)' : RED }}>
            Available: {xpAvailable} XP
          </div>
          {!canAfford && (
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 'clamp(0.6rem, 0.9vw, 0.72rem)', color: RED, fontWeight: 700, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Not enough XP
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Inline row confirmation ────────────────────────────────────────────────

function InlineConfirmation({ skill, xpAvailable, onConfirm, onCancel }: {
  skill: HudSkill
  xpAvailable: number
  onConfirm: () => void
  onCancel: () => void
}) {
  const cost = getSkillUpgradeCost(skill.rank, skill.isCareer)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
          fontWeight: 600, color: 'rgba(232,223,200,0.85)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {skill.name} → Rank {skill.rank + 1}
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 'clamp(0.62rem, 0.95vw, 0.75rem)', color: C.gold }}>
          {cost} XP · {xpAvailable} available
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onCancel() }}
          style={{
            width: 26, height: 26, borderRadius: 4,
            background: 'rgba(244,67,54,0.08)',
            border: '1px solid rgba(244,67,54,0.35)',
            color: RED, cursor: 'pointer',
            fontFamily: FONT_RAJDHANI, fontSize: 'clamp(0.78rem, 1.1vw, 0.88rem)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, transition: '.15s',
          }}
        >
          ✗
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onConfirm() }}
          style={{
            width: 26, height: 26, borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(200,170,80,0.25), rgba(200,170,80,0.15))',
            border: `1px solid ${C.gold}`,
            color: C.gold, cursor: 'pointer',
            fontFamily: FONT_RAJDHANI, fontSize: 'clamp(0.78rem, 1.1vw, 0.88rem)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, transition: '.15s',
          }}
        >
          ✓
        </button>
      </div>
    </div>
  )
}

// ── Species conditional ability badge ─────────────────────────────────────

function SpeciesConditionalBadge({ ability }: { ability: SpeciesAbility }) {
  const setbackRemove = ability.setback_remove ?? 0
  const badgeText = setbackRemove > 0
    ? `−${setbackRemove}⬡`
    : '⚠'

  const tipContent = (
    <>
      <TipLabel>{ability.name}</TipLabel>
      <TipBody>{ability.description}</TipBody>
    </>
  )

  return (
    <Tooltip content={tipContent} placement="top" maxWidth={260}>
      <span style={{
        fontFamily: "'Share Tech Mono','Courier New',monospace",
        fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
        background: 'rgba(255,152,0,0.08)',
        border: '1px solid rgba(255,152,0,0.3)',
        borderRadius: 4,
        padding: '1px 5px',
        color: '#FF9800',
        flexShrink: 0,
        cursor: 'help',
        whiteSpace: 'nowrap' as const,
      }}>
        {badgeText}
      </span>
    </Tooltip>
  )
}

// ── Main panel ─────────────────────────────────────────────────────────────

export function SkillsPanel({ skills, onRoll, onUpgrade, isCombat, xpAvailable, onOpenPopover, characterId, skillModifiers = {}, speciesAbilities = [] }: SkillsPanelProps) {
  const [filter, setFilter] = useState<Filter>('All')
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null)
  const [skillSearch, setSkillSearch] = useState('')
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setSkillSearch('') }, [characterId])

  // Cancel any pending confirmation when character changes
  useEffect(() => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    setConfirmingKey(null)
  }, [characterId])

  const startConfirm = (skillKey: string) => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    setConfirmingKey(skillKey)
    confirmTimerRef.current = setTimeout(() => setConfirmingKey(null), 5000)
  }

  const cancelConfirm = () => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    setConfirmingKey(null)
  }

  const executeUpgrade = (skill: HudSkill) => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    setConfirmingKey(null)
    onUpgrade(skill)
  }

  const filterByTab = skills.filter(s => {
    if (filter === 'Trained') return s.rank > 0
    if (filter === 'Career') return s.isCareer
    return true
  })

  const searchQuery = skillSearch.toLowerCase().trim()
  const filtered = searchQuery
    ? filterByTab.filter(s =>
        s.name.toLowerCase().includes(searchQuery) ||
        s.charKey.toLowerCase().includes(searchQuery) ||
        (CHAR_ABBR2[s.charKey] ?? '').includes(searchQuery) ||
        (CHAR_ABBR3[s.charKey] ?? '').toLowerCase().includes(searchQuery)
      )
    : filterByTab

  const grouped = CHAR_ORDER.map(charKey => ({
    charKey,
    charVal: filtered.find(s => s.charKey === charKey)?.charVal ?? 0,
    skills: filtered.filter(s => s.charKey === charKey).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter(g => g.skills.length > 0)

  const handleSkillClick = (skill: HudSkill, e?: React.MouseEvent<HTMLElement>) => {
    if (onOpenPopover && e) {
      onOpenPopover(skill, e.currentTarget.getBoundingClientRect())
    } else {
      onRoll(skill)
    }
  }

  const xpColor = xpAvailable > 20
    ? 'rgba(200,170,80,0.6)'
    : xpAvailable > 0
    ? '#FF9800'
    : 'rgba(244,67,54,0.7)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {/* Filter + XP + mode bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['All', 'Trained', 'Career'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? `${C.gold}22` : 'transparent',
                border: `1px solid ${filter === f ? C.gold : C.border}`,
                borderRadius: 4, padding: '3px 10px',
                fontFamily: FONT_RAJDHANI, fontSize: 11, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: filter === f ? C.gold : C.textDim,
                cursor: 'pointer', transition: '.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Available XP indicator */}
          <div style={{
            fontFamily: FONT_MONO,
            fontSize: 'clamp(0.65rem, 1vw, 0.78rem)',
            color: xpColor,
          }}>
            {xpAvailable} XP
          </div>

          {/* Mode badge */}
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: 9, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: isCombat ? '#E05050' : C.gold,
            border: `1px solid ${isCombat ? 'rgba(224,80,80,0.4)' : `${C.gold}44`}`,
            borderRadius: 3, padding: '2px 7px',
          }}>
            {isCombat ? 'Click to make a check' : 'Click to Upgrade'}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DiceFace type="proficiency" size={14} />
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 'clamp(0.68rem, 1vw, 0.78rem)', fontWeight: 600, color: 'rgba(232,223,200,0.55)' }}>Proficiency dice</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DiceFace type="ability" size={14} />
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 'clamp(0.68rem, 1vw, 0.78rem)', fontWeight: 600, color: 'rgba(232,223,200,0.55)' }}>Ability dice</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 9, height: 9, borderRadius: 2, background: C.gold, border: `1px solid ${C.gold}` }} />
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 'clamp(0.68rem, 1vw, 0.78rem)', fontWeight: 600, color: 'rgba(232,223,200,0.55)' }}>Skill level</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 2, height: 14, background: `${C.gold}88`, borderRadius: 1 }} />
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 'clamp(0.68rem, 1vw, 0.78rem)', fontWeight: 600, color: 'rgba(232,223,200,0.55)' }}>Career</span>
        </div>
      </div>

      {/* Search */}
      <PanelSearchInput
        value={skillSearch}
        onChange={setSkillSearch}
        placeholder="Search skills..."
      />

      {/* No-results message */}
      {grouped.length === 0 && searchQuery && (
        <div style={{
          textAlign: 'center',
          fontFamily: FONT_RAJDHANI,
          fontSize: 'clamp(0.8rem, 1.3vw, 0.9rem)',
          color: 'rgba(200,170,80,0.35)',
          fontStyle: 'italic',
          padding: '16px 0',
        }}>
          No skills matching &ldquo;{skillSearch}&rdquo;
        </div>
      )}

      {/* 2-column grid of characteristic groups */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
      }}>
        {grouped.map(({ charKey, charVal, skills: groupSkills }) => {
          const color = CHAR_COLOR[charKey]
          return (
            <div key={charKey} style={{ ...panelBase, padding: '10px 10px 6px' }}>
              <CornerBrackets />
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 4, flexShrink: 0,
                  background: `${color}22`, border: `1px solid ${color}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT_RAJDHANI, fontSize: 18, fontWeight: 700, color,
                }}>
                  {charVal}
                </div>
                <div style={{
                  fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: `${color}CC`,
                }}>
                  {CHAR_ABBR3[charKey]}
                </div>
              </div>

              {/* Skill rows */}
              {groupSkills.map(skill => {
                const tip = getSkillTip(skill.name)
                const isMaxRank = skill.rank >= 5
                const hoverColor = isCombat ? '#4EC87A' : C.gold
                const isConfirming = confirmingKey === skill.key

                const tooltipContent = tip ? (
                  <>
                    <TipLabel>{skill.name}</TipLabel>
                    <TipBody>{tip.description}</TipBody>
                    {tip.examples.length > 0 && (
                      <>
                        <TipDivider />
                        {tip.examples.map((ex, i) => (
                          <TipBody key={i}>· {ex}</TipBody>
                        ))}
                      </>
                    )}
                  </>
                ) : <TipLabel>{skill.name}</TipLabel>

                return (
                  <div
                    key={skill.key}
                    onClick={!isConfirming ? (e) => handleSkillClick(skill, e) : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 6px', marginBottom: 2,
                      borderRadius: isConfirming ? 6 : 3,
                      ...(isConfirming ? {
                        border: '1px solid rgba(200,170,80,0.3)',
                        background: 'rgba(200,170,80,0.08)',
                      } : {
                        borderLeft: skill.isCareer ? `2px solid ${color}88` : '2px solid transparent',
                        background: 'transparent',
                      }),
                      cursor: !isConfirming ? 'pointer' : 'default',
                      transition: '.15s',
                      opacity: !isConfirming && !isCombat && isMaxRank ? 0.5 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!isConfirming) {
                        (e.currentTarget as HTMLElement).style.background = `${hoverColor}0D`
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isConfirming) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent'
                      }
                    }}
                  >
                    {isConfirming ? (
                      <InlineConfirmation
                        skill={skill}
                        xpAvailable={xpAvailable}
                        onConfirm={() => executeUpgrade(skill)}
                        onCancel={cancelConfirm}
                      />
                    ) : (
                      <>
                        {/* Skill name — Tooltip wraps only this for description */}
                        <Tooltip content={tooltipContent} placement="right" maxWidth={280}>
                          <div style={{
                            flex: 1, fontFamily: FONT_RAJDHANI, fontSize: 14, fontWeight: 600,
                            color: skill.rank > 0 ? C.text : C.textDim,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {skill.name}
                          </div>
                        </Tooltip>

                        {/* Species conditional ability badges */}
                        {speciesAbilities
                          .filter(a => a.is_conditional && Array.isArray(a.affected_skills) && a.affected_skills.includes(skill.key))
                          .map((a, i) => <SpeciesConditionalBadge key={i} ability={a} />)
                        }

                        {/* [+] upgrade button — immediately left of rank pips */}
                        {!isMaxRank && (
                          <UpgradeButton
                            skill={skill}
                            xpAvailable={xpAvailable}
                            onClick={() => startConfirm(skill.key)}
                          />
                        )}

                        <RankPips rank={skill.rank} />
                        <PoolPreview charVal={skill.charVal} rank={skill.rank} />
                        {skillModifiers[skill.key] && (
                          <SkillModifierBadges mod={skillModifiers[skill.key]} />
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
