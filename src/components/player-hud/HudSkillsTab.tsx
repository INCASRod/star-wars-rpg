'use client'
import { DerivedStatsPanel } from '@/components/wireframe/DerivedStatsPanel'
import { SkillsPanel } from './SkillsPanel'
import { rollPool, getSkillPool, type RollResult } from './dice-engine'
import type { Character, HudSkill, SpeciesAbility } from '@/lib/types'
import type { RollMeta } from '@/lib/logRoll'
import type { EffectiveStats, SkillDiceModifier } from '@/lib/derivedStats'

interface HudSkillsTabProps {
  character: Character
  hudSkills: HudSkill[]
  hudTalents: any[]
  isCombat: boolean
  effectiveStats?: EffectiveStats | null
  engineBreakdown?: any
  skillModifiers: Record<string, SkillDiceModifier>
  speciesAbilities: SpeciesAbility[]
  bonusSkillKeys: Set<string>
  onRoll: (result: RollResult, label?: string, pool?: Record<string, number>, meta?: RollMeta) => void
  onBuySkill: (key: string, rank: number, isCareer: boolean) => void
  onOpenPopover: (skill: HudSkill, anchor: DOMRect) => void
  onVitalChange: (field: 'wound_current' | 'strain_current', delta: number) => void
}

export function HudSkillsTab({
  character, hudSkills, hudTalents, isCombat,
  effectiveStats, engineBreakdown,
  skillModifiers, speciesAbilities, bonusSkillKeys,
  onRoll, onBuySkill, onOpenPopover, onVitalChange,
}: HudSkillsTabProps) {
  function handleSkillRoll(skill: HudSkill) {
    const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
    const pool = { proficiency, ability, boost: 0, challenge: 0, difficulty: 2, setback: 0, force: 0 }
    onRoll(rollPool(pool), skill.name, pool as Record<string, number>)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <DerivedStatsPanel
        character={character}
        liveTalents={hudTalents}
        onVitalChange={onVitalChange}
        characterName={character.name}
        effectiveStats={effectiveStats ?? undefined}
        engineBreakdown={engineBreakdown}
      />
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
  )
}
