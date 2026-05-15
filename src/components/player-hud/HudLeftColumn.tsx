'use client'

import { C } from './design-tokens'
import { FONT_BODY, FONT_DISPLAY, FS } from '@/lib/tokens'
import { SkillsPanel } from './SkillsPanel'
import { getSkillPool, rollPool } from './dice-engine'
import type { DiceType } from './design-tokens'
import type { Character, HudSkill, SpeciesAbility } from '@/lib/types'
import type { SkillDiceModifier } from '@/lib/derivedStats'
import type { RollResult } from './dice-engine'
import type { RollMeta } from '@/lib/logRoll'

interface HudLeftColumnProps {
  character: Character
  hudSkills: HudSkill[]
  isCombat: boolean
  skillModifiers: Record<string, SkillDiceModifier>
  speciesAbilities: SpeciesAbility[]
  bonusSkillKeys: Set<string>
  onRoll: (result: RollResult, label?: string, pool?: Record<string, number>, meta?: RollMeta) => void
  onBuySkill: (key: string, rank: number, isCareer: boolean) => void
  onOpenPopover: (skill: HudSkill, anchor: DOMRect) => void
}

export function HudLeftColumn({
  character, hudSkills, isCombat, skillModifiers, speciesAbilities, bonusSkillKeys,
  onRoll, onBuySkill, onOpenPopover,
}: HudLeftColumnProps) {
  function handleSkillRoll(skill: HudSkill) {
    const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
    const pool: Record<DiceType, number> = { proficiency, ability, boost: 0, challenge: 0, difficulty: 2, setback: 0, force: 0 }
    onRoll(rollPool(pool), skill.name, pool as Record<string, number>)
  }

  return (
    <div style={{
      background: 'var(--hud-surface-lo)',
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── Characteristics 3×2 grid ── */}
      <div style={{ padding: 'var(--space-2)', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {([
            { label: 'Brawn',     value: character.brawn },
            { label: 'Agility',   value: character.agility },
            { label: 'Intellect', value: character.intellect },
            { label: 'Cunning',   value: character.cunning },
            { label: 'Willpower', value: character.willpower },
            { label: 'Presence',  value: character.presence },
          ] as const).map(ch => (
            <div key={ch.label} style={{
              textAlign: 'center', padding: '6px 4px',
              background: 'var(--hud-surface-lo)',
              border: '1px solid var(--hud-border)',
              borderRadius: 6,
            }}>
              <div style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
                fontWeight: 700, color: C.gold, lineHeight: 1,
              }}>
                {ch.value}
              </div>
              <div style={{
                fontFamily: FONT_BODY,
                fontSize: FS.overline,
                fontWeight: 700, letterSpacing: '0.08em',
                color: 'var(--hud-text-faint)', marginTop: 3,
                textTransform: 'uppercase',
              }}>
                {ch.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--hud-border)', flexShrink: 0 }} />

      {/* ── Compact scrollable skill list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-1) var(--space-2)' }}>
        <SkillsPanel
          skills={hudSkills}
          onRoll={handleSkillRoll}
          onUpgrade={skill => onBuySkill(skill.key, skill.rank, skill.isCareer)}
          isCombat={isCombat}
          xpAvailable={character.xp_available}
          onOpenPopover={onOpenPopover}
          characterId={character.id}
          skillModifiers={skillModifiers}
          speciesAbilities={speciesAbilities}
          bonusSkillKeys={bonusSkillKeys}
        />
      </div>
    </div>
  )
}
