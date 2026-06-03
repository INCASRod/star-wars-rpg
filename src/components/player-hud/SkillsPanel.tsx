'use client'

import { useState, useEffect, useRef } from 'react'
import { C, CHAR_COLOR, CHAR_ABBR3, panelBase, type CharKey } from './design-tokens'
import { FONT_BODY, FONT_MONO, FS, RADIUS, EASE, SP } from '@/lib/tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { Tooltip, TipLabel, TipBody, TipDivider } from '@/components/ui/Tooltip'
import { RichText } from '@/components/ui/RichText'
import { getSkillTip } from '@/lib/tooltips/skillDescriptions'
import { useHudPanelContext } from '@/contexts/HudPanelContext'
import { TickerText } from '@/components/ui/TickerText'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { SpeciesAbility, HudSkill } from '@/lib/types'

export type { HudSkill } from '@/lib/types'

interface SkillsPanelProps {
  skills: HudSkill[]
  onRoll: (skill: HudSkill) => void
  onUpgrade: (skill: HudSkill) => void
  isCombat: boolean
  xpAvailable: number
  characterId?: string
  /** Dice modifiers from the derived stats engine, keyed by skill key */
  skillModifiers?: Record<string, SkillDiceModifier>
  /** Species special abilities for conditional skill indicators */
  speciesAbilities?: SpeciesAbility[]
  /** Skill keys that have at least one talent providing a bonus — used for "Has Bonus" filter */
  bonusSkillKeys?: Set<string>
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
              <line x1="3" y1="3" x2="13" y2="13" stroke={CHAR_COLOR.brawn} strokeWidth="2" strokeLinecap="round" />
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
      borderLeft: `1px solid var(--hud-border)`,
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

type Filter    = 'All' | 'Trained' | 'Career' | 'Has Bonus'
type GroupView = 'characteristic' | 'type'

const CHAR_ORDER: CharKey[] = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence']

const TYPE_ORDER  = ['stGeneral', 'stCombat', 'stKnowledge'] as const
const TYPE_LABELS: Record<string, string> = {
  stGeneral:   'General',
  stCombat:    'Combat',
  stKnowledge: 'Knowledge',
}
const TYPE_COLORS: Record<string, string> = {
  stGeneral:   'var(--hud-gold)',
  stCombat:    CHAR_COLOR.willpower,  // #C82A10 — combat/danger
  stKnowledge: CHAR_COLOR.intellect,  // #C8AA50 — knowledge
}

const CHAR_ABBR2: Record<string, string> = {
  brawn: 'br', agility: 'ag', intellect: 'int',
  cunning: 'cun', willpower: 'will', presence: 'pr',
}

const POOL_CAP = 6

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
          fontFamily: FONT_BODY,
          fontSize: FS.overline,
          color: 'var(--hud-text-faint)',
        }}>
          +{overflow}
        </span>
      )}
    </div>
  )
}

function RankPips({ rank, color, dimColor }: { rank: number; color: string; dimColor: string }) {
  return (
    <div style={{ display: 'flex', gap: SP[1], alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          width: '0.4rem', height: '0.5rem',
          transform: 'skewX(-12deg)',
          background: i < rank ? color : 'transparent',
          border: `1px solid ${i < rank ? color : dimColor}`,
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
          fontFamily: FONT_BODY, fontSize: FS.sm,
          fontWeight: 600, color: 'var(--hud-text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {skill.name} → Rank {skill.rank + 1}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: C.gold }}>
          {cost} XP · {xpAvailable} available
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onCancel() }}
          style={{
            width: 26, height: 26, borderRadius: RADIUS.md,
            background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--hud-accent) 35%, transparent)',
            color: 'var(--state-failure)', cursor: 'pointer',
            fontFamily: FONT_BODY, fontSize: FS.sm,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, transition: EASE.quick,
          }}
        >
          ✗
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onConfirm() }}
          style={{
            width: 26, height: 26, borderRadius: RADIUS.md,
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--hud-accent) 25%, transparent), color-mix(in srgb, var(--hud-accent) 10%, transparent))',
            border: `1px solid ${C.gold}`,
            color: C.gold, cursor: 'pointer',
            fontFamily: FONT_BODY, fontSize: FS.sm,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, transition: EASE.quick,
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
      <TipBody><RichText text={ability.description} /></TipBody>
    </>
  )

  return (
    <Tooltip content={tipContent} placement="top" maxWidth={260}>
      <span style={{
        fontFamily: FONT_BODY,
        fontSize: FS.overline,
        background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
        border: '1px solid var(--hud-accent-border)',
        borderRadius: RADIUS.md,
        padding: '1px 5px',
        color: 'var(--red-pale)',
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

export function SkillsPanel({ skills, onRoll, onUpgrade, isCombat, xpAvailable, characterId, skillModifiers = {}, speciesAbilities = [], bonusSkillKeys }: SkillsPanelProps) {
  const [filter, setFilter] = useState<Filter>('All')
  const [groupView, setGroupView] = useState<GroupView>('characteristic')
  const [collapsedTypes, setCollapsedTypes] = useState<Set<string>>(
    () => new Set(TYPE_ORDER)
  )
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null)
  const [skillSearch, setSkillSearch] = useState('')
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { isOpen } = useHudPanelContext()

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
    if (filter === 'Has Bonus') {
      const hasDiceMod = !!skillModifiers[s.key] && (skillModifiers[s.key].boostAdd > 0 || skillModifiers[s.key].setbackRemove > 0)
      const hasTalentBonus = bonusSkillKeys?.has(s.key) ?? false
      return hasDiceMod || hasTalentBonus
    }
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

  const groupedByType = TYPE_ORDER.map(typeKey => ({
    typeKey,
    skills: filtered.filter(s => (s.type ?? 'stGeneral') === typeKey).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter(g => g.skills.length > 0)

  const handleSkillClick = (skill: HudSkill) => {
    startConfirm(skill.key)
  }

  const renderSkillRow = (skill: HudSkill, careerBorderColor: string, charColor: string, staggerIdx?: number) => {
    const tip = getSkillTip(skill.name)
    const isMaxRank = skill.rank >= 5
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
        data-stagger={staggerIdx !== undefined ? staggerIdx : undefined}
        onClick={!isConfirming ? () => handleSkillClick(skill) : undefined}
        className={staggerIdx !== undefined
          ? (!isConfirming ? 'skills-row panel-row-enter' : 'panel-row-enter')
          : (!isConfirming ? 'skills-row' : undefined)}
        style={{
          display: 'flex', alignItems: 'center', gap: SP[1],
          padding: `${SP[1]} ${SP[2]}`,
          borderRadius: isConfirming ? RADIUS.lg : RADIUS.sm,
          ...(isConfirming ? {
            border: '1px solid color-mix(in srgb, var(--hud-accent) 35%, transparent)',
            background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
          } : {
            borderLeft: skill.isCareer ? `2px solid ${careerBorderColor}88` : '2px solid transparent',
            background: 'transparent',
          }),
          cursor: !isConfirming ? 'pointer' : 'default',
          transition: EASE.quick,
          opacity: !isConfirming && !isCombat && isMaxRank ? 0.5 : 1,
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
            <Tooltip content={tooltipContent} placement="right" maxWidth={280}>
              <div style={{
                flex: 1, fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 600,
                color: skill.rank > 0 ? C.text : C.textDim,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                <TickerText text={skill.name} isOpen={isOpen} delayMs={120} />
              </div>
            </Tooltip>

            {speciesAbilities
              .filter(a => a.is_conditional && Array.isArray(a.affected_skills) && a.affected_skills.includes(skill.key))
              .map((a, i) => <SpeciesConditionalBadge key={i} ability={a} />)
            }

            <RankPips rank={skill.rank} color={charColor} dimColor={`color-mix(in srgb, ${charColor} 35%, transparent)`} />
            <PoolPreview charVal={skill.charVal} rank={skill.rank} />
            {skillModifiers[skill.key] && (
              <SkillModifierBadges mod={skillModifiers[skill.key]} />
            )}
          </>
        )}
      </div>
    )
  }

  const xpColor = xpAvailable > 20
    ? 'color-mix(in srgb, var(--hud-accent) 60%, transparent)'
    : xpAvailable > 0
    ? 'var(--hud-gold)'
    : 'var(--state-failure)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Controls — filter pills | separator | view toggle | XP + mode */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: SP[3],
        padding: `${SP[1]} 0`,
        borderBottom: `1px solid var(--hud-border)`,
      }}>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['All', 'Trained', 'Career', 'Has Bonus'] as Filter[]).map(f => {
            const active = filter === f
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: active ? `color-mix(in srgb, ${C.gold} 13%, transparent)` : 'transparent',
                  border: `1px solid ${active ? C.gold : C.border}`,
                  borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[2]}`,
                  fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: active ? C.gold : C.textDim,
                  cursor: 'pointer', transition: EASE.quick,
                }}
              >
                {f}
              </button>
            )
          })}
        </div>

        {/* Separator */}
        <div style={{ width: '1px', height: '0.875rem', flexShrink: 0, background: 'var(--hud-border)' }} />

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['characteristic', 'type'] as GroupView[]).map(v => {
            const active = groupView === v
            const label  = v === 'characteristic' ? 'By Characteristic' : 'By Type'
            return (
              <button
                key={v}
                onClick={() => setGroupView(v)}
                style={{
                  background: active ? `color-mix(in srgb, ${C.gold} 13%, transparent)` : 'transparent',
                  border: `1px solid ${active ? C.gold : C.border}`,
                  borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[2]}`,
                  fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: active ? C.gold : C.textDim,
                  cursor: 'pointer', transition: EASE.quick,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* XP indicator + mode hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], marginLeft: 'auto' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: xpColor }}>
            {xpAvailable} XP
          </div>
          <span style={{
            fontFamily: FONT_BODY,
            fontSize: FS.overline,
            color: C.textFaint,
            letterSpacing: '0.08em',
          }}>
            {isCombat ? 'Click a skill to roll' : 'Click a skill to upgrade it'}
          </span>
        </div>
      </div>

      {/* Legend + Search — combined compact row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: SP[3],
        padding: `${SP[1]} ${SP[3]}`,
        borderBottom: `1px solid var(--hud-border)`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
          <div style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: 'var(--die-proficiency)', flexShrink: 0 }} />
          <span style={{ fontSize: FS.overline, color: C.textFaint }}>Proficiency</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
          <div style={{ width: '0.4rem', height: '0.4rem', transform: 'rotate(45deg)', background: 'var(--die-ability)', flexShrink: 0 }} />
          <span style={{ fontSize: FS.overline, color: C.textFaint }}>Ability</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
          <div style={{ width: '0.4rem', height: '0.5rem', transform: 'skewX(-12deg)', background: C.gold, flexShrink: 0 }} />
          <span style={{ fontSize: FS.overline, color: C.textFaint }}>Rank</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
          <div style={{ width: '0.125rem', height: '0.625rem', background: C.gold, flexShrink: 0 }} />
          <span style={{ fontSize: FS.overline, color: C.textFaint }}>Career</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: SP[1] }}>
          <span style={{ fontSize: FS.overline, color: C.textFaint }}>⌕</span>
          <input
            type="text"
            value={skillSearch}
            onChange={e => setSkillSearch(e.target.value)}
            placeholder="Search…"
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              fontFamily: FONT_BODY,
              fontSize: FS.overline,
              color: C.textDim,
              width: '6rem',
            }}
          />
        </div>
      </div>

      {/* No-results message */}
      {(groupView === 'characteristic' ? grouped : groupedByType).length === 0 && searchQuery && (
        <div style={{
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontSize: FS.sm,
          color: 'var(--hud-text-faint)',
          fontStyle: 'italic',
          padding: '16px 0',
        }}>
          No skills matching &ldquo;{skillSearch}&rdquo;
        </div>
      )}

      {/* ── By Characteristic view ── */}
      {groupView === 'characteristic' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
          flex: 1,
          overflow: 'hidden',
          minHeight: 0,
          height: '100%',
        }}>
          {grouped.map(({ charKey, charVal, skills: groupSkills }, groupIdx) => {
            const color = CHAR_COLOR[charKey]
            const charName = charKey.charAt(0).toUpperCase() + charKey.slice(1)
            return (
              <div key={charKey} style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minHeight: 0,
                borderRight: groupIdx % 2 === 0 ? `1px solid var(--hud-border)` : undefined,
                borderBottom: groupIdx < 4 ? `1px solid var(--hud-border)` : undefined,
              }}>
                {/* Group header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: SP[2],
                  padding: `${SP[1]} ${SP[2]}`,
                  borderBottom: `1px solid var(--hud-border)`,
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontFamily: FONT_MONO,
                    fontSize: FS.sm,
                    fontWeight: 700,
                    color: color,
                    width: '1rem',
                    textAlign: 'center',
                    flexShrink: 0,
                  }}>
                    {charVal}
                  </span>
                  <span style={{
                    fontSize: FS.overline,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: color,
                    flex: 1,
                  }}>
                    {charName}
                  </span>
                </div>
                {/* Skill rows — scrollable if content exceeds cell height */}
                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                  {groupSkills.map((skill, idx) => renderSkillRow(skill, color, color, idx))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── By Type view ── */}
      {groupView === 'type' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {groupedByType.map(({ typeKey, skills: groupSkills }) => {
            const color     = TYPE_COLORS[typeKey]
            const collapsed = collapsedTypes.has(typeKey)
            const toggle    = () => setCollapsedTypes(prev => {
              const next = new Set(prev)
              collapsed ? next.delete(typeKey) : next.add(typeKey)
              return next
            })
            return (
              <div key={typeKey} style={{ ...panelBase, padding: 0, overflow: 'hidden' }}>
                <CornerBrackets color={color} />
                {/* Group header — clickable */}
                <button
                  onClick={toggle}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {/* Chevron */}
                  <svg
                    width={10} height={10} viewBox="0 0 10 10"
                    style={{
                      flexShrink: 0,
                      transition: `transform ${EASE.default}`,
                      transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    }}
                  >
                    <polyline
                      points="1,3 5,7 9,3"
                      fill="none" stroke={`${color}88`} strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                  <div style={{
                    fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: `${color}CC`,
                    borderLeft: `2px solid ${color}66`,
                    paddingLeft: 8,
                  }}>
                    <TickerText text={TYPE_LABELS[typeKey]} isOpen={isOpen} delayMs={120} />
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: `${color}66` }}>
                    {groupSkills.length} skill{groupSkills.length !== 1 ? 's' : ''}
                  </div>
                </button>
                {/* Skill rows */}
                {!collapsed && (
                  <div style={{ padding: '0 10px 6px' }}>
                    {groupSkills.map((skill, idx) => renderSkillRow(skill, CHAR_COLOR[skill.charKey], CHAR_COLOR[skill.charKey], idx))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
