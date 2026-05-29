'use client'

import { useState, useEffect, useRef } from 'react'
import { C, CHAR_COLOR, CHAR_ABBR3, panelBase, type CharKey } from './design-tokens'
import { FONT_BODY, FS, RADIUS, Z, EASE } from '@/lib/tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { Tooltip, TipLabel, TipBody, TipDivider } from '@/components/ui/Tooltip'
import { RichText } from '@/components/ui/RichText'
import { getSkillTip } from '@/lib/tooltips/skillDescriptions'
import { PanelSearchInput } from '@/components/character/PanelSearchInput'
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
  onOpenPopover?: (skill: HudSkill, anchor: DOMRect) => void
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

function RankPips({ rank }: { rank: number }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          width: 9, height: 9, borderRadius: RADIUS.sm,
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
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        className={canAfford ? 'skills-upgrade-btn skills-upgrade-btn--affordable' : 'skills-upgrade-btn skills-upgrade-btn--locked'}
        style={{
          width: 28, height: 28, borderRadius: RADIUS.lg,
          background: canAfford ? 'var(--hud-accent-10)' : 'var(--hud-surface-lo)',
          border: `1px solid ${canAfford ? 'var(--hud-accent-35)' : 'var(--hud-border)'}`,
          color: canAfford ? C.gold : 'rgba(90,40,24,0.2)',
          fontFamily: FONT_BODY,
          fontSize: FS.sm,
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
          zIndex: Z.tooltip,
          background: 'var(--hud-surface-hi)',
          border: `1px solid var(--hud-border-hi)`,
          borderRadius: RADIUS.lg,
          padding: '10px 12px',
          minWidth: 150,
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, marginBottom: 5 }}>
            Upgrade to Rank {skill.rank + 1}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: canAfford ? C.gold : 'var(--state-failure)', marginBottom: 2 }}>
            Cost: {cost} XP
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: canAfford ? 'var(--hud-text-dim)' : 'var(--state-failure)' }}>
            Available: {xpAvailable} XP
          </div>
          {!canAfford && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--state-failure)', fontWeight: 700, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
            background: 'var(--hud-accent-10)',
            border: '1px solid var(--hud-accent-35)',
            color: 'var(--state-failure)', cursor: 'pointer',
            fontFamily: FONT_BODY, fontSize: FS.sm,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, transition: '.15s',
          }}
        >
          ✗
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onConfirm() }}
          style={{
            width: 26, height: 26, borderRadius: RADIUS.md,
            background: 'linear-gradient(135deg, var(--hud-accent-25), var(--hud-accent-10))',
            border: `1px solid ${C.gold}`,
            color: C.gold, cursor: 'pointer',
            fontFamily: FONT_BODY, fontSize: FS.sm,
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
      <TipBody><RichText text={ability.description} /></TipBody>
    </>
  )

  return (
    <Tooltip content={tipContent} placement="top" maxWidth={260}>
      <span style={{
        fontFamily: FONT_BODY,
        fontSize: FS.overline,
        background: 'var(--hud-accent-10)',
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

export function SkillsPanel({ skills, onRoll, onUpgrade, isCombat, xpAvailable, onOpenPopover, characterId, skillModifiers = {}, speciesAbilities = [], bonusSkillKeys }: SkillsPanelProps) {
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

  const handleSkillClick = (skill: HudSkill, e?: React.MouseEvent<HTMLElement>) => {
    if (onOpenPopover && e) {
      onOpenPopover(skill, e.currentTarget.getBoundingClientRect())
    } else {
      onRoll(skill)
    }
  }

  const renderSkillRow = (skill: HudSkill, careerBorderColor: string, staggerIdx?: number) => {
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
        onClick={!isConfirming ? (e) => handleSkillClick(skill, e) : undefined}
        className={staggerIdx !== undefined
          ? (!isConfirming ? 'skills-row panel-row-enter' : 'panel-row-enter')
          : (!isConfirming ? 'skills-row' : undefined)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 6px', marginBottom: 2,
          borderRadius: isConfirming ? RADIUS.lg : RADIUS.sm,
          ...(isConfirming ? {
            border: '1px solid var(--hud-accent-35)',
            background: 'var(--hud-accent-10)',
          } : {
            borderLeft: skill.isCareer ? `2px solid ${careerBorderColor}88` : '2px solid transparent',
            background: 'transparent',
          }),
          cursor: !isConfirming ? 'pointer' : 'default',
          transition: '.15s',
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
                {skill.name}
              </div>
            </Tooltip>

            {speciesAbilities
              .filter(a => a.is_conditional && Array.isArray(a.affected_skills) && a.affected_skills.includes(skill.key))
              .map((a, i) => <SpeciesConditionalBadge key={i} ability={a} />)
            }

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
  }

  const xpColor = xpAvailable > 20
    ? 'var(--hud-accent-60)'
    : xpAvailable > 0
    ? 'var(--hud-gold)'
    : 'var(--state-failure)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {/* Filter + XP + mode bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(['All', 'Trained', 'Career', 'Has Bonus'] as Filter[]).map(f => {
            const active  = filter === f
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: active ? `${C.gold}22` : 'transparent',
                  border: `1px solid ${active ? C.gold : C.border}`,
                  borderRadius: RADIUS.md, padding: '3px 10px',
                  fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: active ? C.gold : C.textDim,
                  cursor: 'pointer', transition: '.15s',
                }}
              >
                {f}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Available XP indicator */}
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: FS.caption,
            color: xpColor,
          }}>
            {xpAvailable} XP
          </div>

          {/* Mode badge */}
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: C.gold,
            border: '1px solid var(--hud-accent-40)',
            borderRadius: RADIUS.sm, padding: '2px 7px',
          }}>
            {isCombat ? 'Click to make a check' : 'Click to Upgrade'}
          </div>
        </div>
      </div>

      {/* Group view toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim,
        }}>
          View:
        </span>
        {(['characteristic', 'type'] as GroupView[]).map(v => {
          const active = groupView === v
          const label  = v === 'characteristic' ? 'By Characteristic' : 'By Type'
          return (
            <button
              key={v}
              onClick={() => setGroupView(v)}
              style={{
                background: active ? `${C.gold}22` : 'transparent',
                border: `1px solid ${active ? C.gold : C.border}`,
                borderRadius: RADIUS.md, padding: '3px 10px',
                fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: active ? C.gold : C.textDim,
                cursor: 'pointer', transition: '.15s',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DiceFace type="proficiency" size={14} />
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 600, color: 'var(--hud-text-faint)' }}>Proficiency dice</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DiceFace type="ability" size={14} />
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 600, color: 'var(--hud-text-faint)' }}>Ability dice</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 9, height: 9, borderRadius: RADIUS.sm, background: C.gold, border: `1px solid ${C.gold}` }} />
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 600, color: 'var(--hud-text-faint)' }}>Skill level</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 2, height: 14, background: `${C.gold}88`, borderRadius: RADIUS.sm }} />
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 600, color: 'var(--hud-text-faint)' }}>Career</span>
        </div>
      </div>

      {/* Search */}
      <PanelSearchInput
        value={skillSearch}
        onChange={setSkillSearch}
        placeholder="Search skills..."
      />

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
                    width: 28, height: 28, borderRadius: RADIUS.md, flexShrink: 0,
                    background: `${color}22`, border: `1px solid ${color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 700, color,
                  }}>
                    {charVal}
                  </div>
                  <div style={{
                    fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: `${color}CC`,
                  }}>
                    <TickerText text={CHAR_ABBR3[charKey]} isOpen={isOpen} delayMs={120} />
                  </div>
                </div>
                {groupSkills.map((skill, idx) => renderSkillRow(skill, color, idx))}
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
                    {groupSkills.map((skill, idx) => renderSkillRow(skill, CHAR_COLOR[skill.charKey], idx))}
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
