'use client'

// PC Check Console — GM-side dice authority for a character's dossier.
// Task 5: Skill Check tab + shared 3x2 upgrade grid + public roll/log.
// Task 6 extends this file with the Combat Check tab and the Force die row —
// the props below are intentionally not a closed/final list.

import { useState } from 'react'
import { getSkillPool, rollPool } from '@/components/player-hud/dice-engine'
import type { DiceType } from '@/components/player-hud/design-tokens'
import { logRoll } from '@/lib/logRoll'
import { UNARMED_PROFILE } from '@/lib/combatCheckUtils'
import type { Character, HudSkill, WpnDisplay } from '@/lib/types'
import { FONT_BODY as FONT, FONT_DISPLAY, FS, SP, RADIUS, HUD } from '@/lib/tokens'

export interface PcCheckConsoleProps {
  character:   Character
  campaignId:  string
  hudSkills:   HudSkill[]
  hudWeapons:  WpnDisplay[]
  forceRating: number
}

type Tab = 'skill' | 'combat'

interface CombatOption {
  id:        string
  name:      string
  skillName: string
  damage:    number
  crit:      number
}

const GRID_DICE: DiceType[] = ['ability', 'proficiency', 'boost', 'difficulty', 'challenge', 'setback']

export function PcCheckConsole({ character, campaignId, hudSkills, hudWeapons, forceRating }: PcCheckConsoleProps) {
  const [tab, setTab] = useState<Tab>('skill')
  const [selectedSkillKey, setSelectedSkillKey] = useState<string | null>(null)
  const [selectedWeapon, setSelectedWeapon] = useState<CombatOption | null>(null)
  const [pool, setPool] = useState<Record<DiceType, number>>({
    ability: 0, proficiency: 0, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: 0,
  })

  function selectSkill(skill: HudSkill) {
    setSelectedSkillKey(skill.key)
    const { ability, proficiency } = getSkillPool(skill.charVal, skill.rank)
    setPool(p => ({ ability, proficiency, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: p.force }))
  }

  // Combat tab pool prefill — the weapon's own skillName looked up against
  // the character's real hudSkills (rank + charVal already folded for
  // species/career), same formula as the Skill tab. Unarmed's synthetic
  // "Brawl" skillName resolves the same way when the character has ranks in
  // it; falls back to 0/0 if not found (no Brawl entry at all).
  function poolForCombatSkill(skillName: string) {
    const skill = hudSkills.find(s => s.name === skillName)
    if (!skill) return { ability: 0, proficiency: 0 }
    return getSkillPool(skill.charVal, skill.rank)
  }

  function selectWeapon(opt: CombatOption) {
    setSelectedWeapon(opt)
    const { ability, proficiency } = poolForCombatSkill(opt.skillName)
    setPool(p => ({ ability, proficiency, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: p.force }))
  }

  function adjustDie(key: DiceType, delta: number) {
    setPool(p => ({ ...p, [key]: Math.max(0, p[key] + delta) }))
  }

  function roll() {
    const skill = hudSkills.find(s => s.key === selectedSkillKey)
    if (!skill) return
    const result = rollPool(pool)
    logRoll({
      campaignId,
      characterId: character.id,
      characterName: character.name,
      label: `${skill.name} Check`,
      pool,
      result,
      isDM: true,
      hidden: false,
      meta: { rollType: 'skill' },
    })
  }

  function rollCombat() {
    if (!selectedWeapon) return
    const result = rollPool(pool)
    logRoll({
      campaignId,
      characterId: character.id,
      characterName: character.name,
      label: `${selectedWeapon.name} Check`,
      pool,
      result,
      isDM: true,
      hidden: false,
      meta: { rollType: 'combat' },
    })
  }

  const combatList: CombatOption[] = [
    ...hudWeapons
      .filter(w => w.equipState === 'equipped')
      .map(w => ({ id: w.id, name: w.name, skillName: w.skillName, damage: w.damage.baseDamage, crit: w.crit })),
    { id: '__unarmed', name: UNARMED_PROFILE.name, skillName: UNARMED_PROFILE.skillName, damage: character.brawn, crit: UNARMED_PROFILE.crit },
  ]

  const totalDice = Object.values(pool).reduce((a, b) => a + b, 0)
  const canRoll = tab === 'skill' ? (totalDice > 0 && !!selectedSkillKey) : (totalDice > 0 && !!selectedWeapon)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: SP[1], padding: SP[2], borderBottom: '1px solid var(--hud-border)' }}>
        <button className={tab === 'skill' ? 'gm-cc-tab on' : 'gm-cc-tab'} onClick={() => setTab('skill')}>SKILL CHECK</button>
        <button className={tab === 'combat' ? 'gm-cc-tab on' : 'gm-cc-tab'} onClick={() => setTab('combat')}>COMBAT CHECK</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: SP[2], display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {tab === 'skill' && hudSkills.map(skill => (
          <div
            key={skill.key}
            className={selectedSkillKey === skill.key ? 'gm-cc-row sel' : 'gm-cc-row'}
            onClick={() => selectSkill(skill)}
          >
            <span className="n">{skill.name}</span>
            <span className="c">{skill.charKey}</span>
            <span className="pool">{skill.rank}</span>
          </div>
        ))}
        {tab === 'combat' && combatList.map(w => {
          const { ability, proficiency } = poolForCombatSkill(w.skillName)
          return (
            <div
              key={w.id}
              className={selectedWeapon?.id === w.id ? 'gm-cc-row sel' : 'gm-cc-row'}
              onClick={() => selectWeapon(w)}
            >
              <span className="n">{w.name}</span>
              <span className="c">DMG {w.damage} · C{w.crit}</span>
              <span className="pool">{proficiency + ability}</span>
            </div>
          )
        })}
      </div>

      <div style={{ borderTop: '1px solid var(--hud-border)', padding: SP[2], display: 'flex', flexDirection: 'column', gap: SP[2] }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: SP[1] }}>
          {GRID_DICE.map(k => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', borderRadius: RADIUS.sm, padding: '2px 3px' }}>
              <button className="gm-dossier-stepbtn" onClick={() => adjustDie(k, -1)}>−</button>
              <b style={{ fontFamily: FONT, fontSize: FS.overline, minWidth: '11px', textAlign: 'center' }}>{pool[k]}</b>
              <button className="gm-dossier-stepbtn" onClick={() => adjustDie(k, 1)}>＋</button>
            </div>
          ))}
        </div>
        {character.is_force_sensitive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], background: 'color-mix(in srgb, var(--die-force) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--die-force) 28%, transparent)', borderRadius: RADIUS.sm, padding: `5px ${SP[2]}` }}>
            <span style={{ fontFamily: FONT, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--die-force)', flex: 1 }}>
              FORCE DICE <span style={{ fontSize: FS.overline, color: HUD.textFaint }}>(FR {forceRating})</span>
            </span>
            <button className="gm-dossier-stepbtn" onClick={() => adjustDie('force', -1)}>−</button>
            <b style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, color: 'var(--die-force)', minWidth: '12px', textAlign: 'center' }}>{pool.force}</b>
            <button className="gm-dossier-stepbtn" onClick={() => adjustDie('force', 1)}>＋</button>
          </div>
        )}
        <button className="gm-cc-rollbtn" disabled={!canRoll} onClick={tab === 'skill' ? roll : rollCombat}>ROLL — PUBLIC</button>
      </div>
    </div>
  )
}
