'use client'

// PC Check Console — GM-side dice authority for a character's dossier.
// Task 5: Skill Check tab + shared 3x2 upgrade grid + public roll/log.
// Task 6 extends this file with the Combat Check tab and the Force die row —
// the props below are intentionally not a closed/final list.

import { useState } from 'react'
import { getSkillPool, rollPool } from '@/components/player-hud/dice-engine'
import type { DiceType } from '@/components/player-hud/design-tokens'
import { logRoll } from '@/lib/logRoll'
import type { Character, HudSkill } from '@/lib/types'
import { FONT_BODY as FONT, FS, SP, RADIUS } from '@/lib/tokens'

export interface PcCheckConsoleProps {
  character:   Character
  campaignId:  string
  hudSkills:   HudSkill[]
  forceRating: number
}

type Tab = 'skill' | 'combat'

const GRID_DICE: DiceType[] = ['ability', 'proficiency', 'boost', 'difficulty', 'challenge', 'setback']

export function PcCheckConsole({ character, campaignId, hudSkills, forceRating }: PcCheckConsoleProps) {
  void forceRating // Force die row lands in Task 6

  const [tab, setTab] = useState<Tab>('skill')
  const [selectedSkillKey, setSelectedSkillKey] = useState<string | null>(null)
  const [pool, setPool] = useState<Record<DiceType, number>>({
    ability: 0, proficiency: 0, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: 0,
  })

  function selectSkill(skill: HudSkill) {
    setSelectedSkillKey(skill.key)
    const { ability, proficiency } = getSkillPool(skill.charVal, skill.rank)
    setPool({ ability, proficiency, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: 0 })
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

  const totalDice = Object.values(pool).reduce((a, b) => a + b, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: SP[1], padding: SP[2], borderBottom: '1px solid var(--hud-border)' }}>
        <button className={tab === 'skill' ? 'gm-cc-tab on' : 'gm-cc-tab'} onClick={() => setTab('skill')}>SKILL CHECK</button>
        <button className={tab === 'combat' ? 'gm-cc-tab on' : 'gm-cc-tab'} onClick={() => setTab('combat')} disabled>COMBAT CHECK</button>
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
        {/* Combat tab rendered in Task 6 */}
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
        {/* Force row rendered in Task 6 */}
        <button className="gm-cc-rollbtn" disabled={totalDice === 0 || !selectedSkillKey} onClick={roll}>ROLL — PUBLIC</button>
      </div>
    </div>
  )
}
