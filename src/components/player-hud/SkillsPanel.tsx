'use client'

import { useState, useEffect } from 'react'
import { C, CHAR_COLOR, CHAR_ABBR3, FONT_CINZEL, FONT_RAJDHANI, panelBase, type CharKey } from './design-tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { Tooltip, TipLabel, TipBody, TipDivider } from '@/components/ui/Tooltip'
import { getSkillTip } from '@/lib/tooltips/skillDescriptions'
import { PanelSearchInput } from '@/components/character/PanelSearchInput'

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

// ── Upgrade confirmation dialog ──────────────────────────────
function SkillUpgradeDialog({ skill, xpAvailable, onConfirm, onCancel }: {
  skill: HudSkill
  xpAvailable: number
  onConfirm: () => void
  onCancel: () => void
}) {
  const newRank = skill.rank + 1
  const cost = newRank * 5 + (skill.isCareer ? 0 : 5)
  const canAfford = xpAvailable >= cost
  const color = CHAR_COLOR[skill.charKey]

  const pipRow = (rank: number, highlight: boolean) => (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: 2,
          background: i < rank ? (highlight ? C.gold : `${C.gold}55`) : 'transparent',
          border: `1px solid ${i < rank ? C.gold : C.border}`,
          transition: '.15s',
        }} />
      ))}
    </div>
  )

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#0B1511', border: `1px solid ${C.gold}55`,
          borderRadius: 6, padding: '24px 28px', minWidth: 300, maxWidth: 360,
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <CornerBrackets color={C.gold} />

        {/* Header */}
        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: C.textDim, marginBottom: 14,
        }}>
          SKILL UPGRADE
        </div>

        {/* Skill name + career badge */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <div style={{
            fontFamily: FONT_CINZEL, fontSize: 17, fontWeight: 700, color: C.gold,
          }}>
            {skill.name}
          </div>
          {skill.isCareer && (
            <div style={{
              fontFamily: FONT_RAJDHANI, fontSize: 9, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: color, border: `1px solid ${color}55`,
              borderRadius: 3, padding: '1px 5px',
            }}>
              Career
            </div>
          )}
        </div>

        {/* Characteristic */}
        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 600,
          letterSpacing: '0.08em', color: `${color}CC`,
          textTransform: 'uppercase', marginBottom: 20,
        }}>
          {CHAR_ABBR3[skill.charKey]} {skill.charVal}
        </div>

        {/* Rank progress */}
        <div style={{
          background: `${C.gold}08`, border: `1px solid ${C.border}`,
          borderRadius: 4, padding: '12px 14px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 9, color: C.textDim, letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>
                Current
              </div>
              {pipRow(skill.rank, false)}
            </div>
            <div style={{ fontFamily: FONT_CINZEL, fontSize: 14, color: C.gold, flexShrink: 0 }}>→</div>
            <div>
              <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 9, color: C.gold, letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>
                Rank {newRank}
              </div>
              {pipRow(newRank, true)}
            </div>
          </div>
        </div>

        {/* XP cost */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 13, color: C.textDim, letterSpacing: '0.06em' }}>
            Cost
          </div>
          <div style={{ fontFamily: FONT_CINZEL, fontSize: 14, fontWeight: 700, color: canAfford ? C.gold : '#E05050' }}>
            {cost} XP
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 13, color: C.textDim, letterSpacing: '0.06em' }}>
            Available
          </div>
          <div style={{ fontFamily: FONT_CINZEL, fontSize: 14, fontWeight: 700, color: canAfford ? '#4EC87A' : '#E05050' }}>
            {xpAvailable} XP
          </div>
        </div>

        {!canAfford && (
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: 11, fontWeight: 700,
            color: '#E05050', letterSpacing: '0.08em', textAlign: 'center',
            marginBottom: 14, textTransform: 'uppercase',
          }}>
            Insufficient XP
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '8px 0',
              background: 'transparent', border: `1px solid ${C.border}`,
              borderRadius: 4, cursor: 'pointer',
              fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: C.textDim, transition: '.15s',
            }}
          >
            Cancel
          </button>
          <button
            onClick={canAfford ? onConfirm : undefined}
            disabled={!canAfford}
            style={{
              flex: 2, padding: '8px 0',
              background: canAfford ? `${C.gold}22` : 'transparent',
              border: `1px solid ${canAfford ? C.gold : C.border}`,
              borderRadius: 4, cursor: canAfford ? 'pointer' : 'not-allowed',
              fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: canAfford ? C.gold : C.textFaint, transition: '.15s',
              opacity: canAfford ? 1 : 0.5,
            }}
          >
            Confirm Upgrade
          </button>
        </div>
      </div>
    </div>
  )
}

export function SkillsPanel({ skills, onRoll, onUpgrade, isCombat, xpAvailable, onOpenPopover, characterId }: SkillsPanelProps) {
  const [filter, setFilter] = useState<Filter>('All')
  const [pendingSkill, setPendingSkill] = useState<HudSkill | null>(null)
  const [skillSearch, setSkillSearch] = useState('')

  // Reset search when character changes
  useEffect(() => { setSkillSearch('') }, [characterId])

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

  // Group by characteristic, preserving order
  const grouped = CHAR_ORDER.map(charKey => ({
    charKey,
    charVal: filtered.find(s => s.charKey === charKey)?.charVal ?? 0,
    skills: filtered.filter(s => s.charKey === charKey).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter(g => g.skills.length > 0)

  const handleSkillClick = (skill: HudSkill, e?: React.MouseEvent<HTMLElement>) => {
    if (isCombat) {
      if (onOpenPopover && e) {
        onOpenPopover(skill, e.currentTarget.getBoundingClientRect())
      } else {
        onRoll(skill)
      }
    } else {
      if (skill.rank < 5) setPendingSkill(skill)
    }
  }

  const handleConfirmUpgrade = () => {
    if (pendingSkill) {
      onUpgrade(pendingSkill)
      setPendingSkill(null)
    }
  }

  return (
    <>
      {/* Upgrade dialog (exploration mode only) */}
      {pendingSkill && (
        <SkillUpgradeDialog
          skill={pendingSkill}
          xpAvailable={xpAvailable}
          onConfirm={handleConfirmUpgrade}
          onCancel={() => setPendingSkill(null)}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {/* Filter + legend bar */}
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

          {/* Mode badge */}
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: 9, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: isCombat ? '#E05050' : C.gold,
            border: `1px solid ${isCombat ? 'rgba(224,80,80,0.4)' : `${C.gold}44`}`,
            borderRadius: 3, padding: '2px 7px',
          }}>
            {isCombat ? 'Roll to Act' : 'Click to Upgrade'}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 9, height: 9, background: '#D4B840', transform: 'rotate(45deg)' }} />
            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700, color: C.textDim }}>Profession</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#4EC87A' }} />
            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700, color: C.textDim }}>Ability</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 9, height: 9, borderRadius: 1, background: `${C.gold}44`, border: `1px solid ${C.gold}` }} />
            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: 12, fontWeight: 700, color: C.textDim }}>Career</span>
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
                    <Tooltip key={skill.key} content={tooltipContent} placement="right" maxWidth={280}>
                      <div
                        onClick={(e) => handleSkillClick(skill, e)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '5px 6px', borderRadius: 3, marginBottom: 2,
                          borderLeft: skill.isCareer ? `2px solid ${color}88` : '2px solid transparent',
                          cursor: (!isCombat && isMaxRank) ? 'default' : 'pointer',
                          transition: '.15s',
                          background: 'transparent',
                          opacity: (!isCombat && isMaxRank) ? 0.5 : 1,
                        }}
                        onMouseEnter={e => {
                          if (isCombat || !isMaxRank) {
                            (e.currentTarget as HTMLElement).style.background = `${hoverColor}0D`
                          }
                        }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <div style={{
                          flex: 1, fontFamily: FONT_RAJDHANI, fontSize: 14, fontWeight: 600,
                          color: skill.rank > 0 ? C.text : C.textDim,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {skill.name}
                        </div>
                        <RankPips rank={skill.rank} />
                        <PoolPreview charVal={skill.charVal} rank={skill.rank} />
                      </div>
                    </Tooltip>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
