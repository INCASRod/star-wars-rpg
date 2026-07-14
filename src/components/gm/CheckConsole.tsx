'use client'

// ═══════════════════════════════════════════════════════════════════════════
// CheckConsole — the check-console column of EncounterDossier.
//
// Skill Check tab: closes the real functional gap this feature exists for —
// today a GM can only roll weapon-based combat checks for an adversary via
// CombatCheckOverlay; there's no way to roll a bare skill check (e.g. "roll
// this adversary's Perception"). This is small, direct glue: getSkillPool /
// rollPool / logRoll are called straight from here — CombatCheckOverlay is
// weapon-shaped and would force an unnecessary weapon-select step.
//
// Combat Check tab body is a placeholder — Task 6's job.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSkillPool, rollPool } from '@/components/player-hud/dice-engine'
import { logRoll } from '@/lib/logRoll'
import { getAdversarySkillRank } from '@/lib/adversaryAdapter'
import { CHAR_FIELD_MAP } from '@/lib/combatCheckUtils'
import { DiceFace } from '@/components/dice/DiceFace'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { CombatEncounter } from '@/lib/combat'
import type { Character } from '@/lib/types'
import type { RosterEntry } from '@/components/gm/EncounterDeck'
import { HUD, FS, SP, FONT_BODY, RADIUS, type DiceType } from '@/lib/tokens'

const FC = FONT_BODY

// ── ref_skills fetch — no existing GM-side (non-character-sheet) precedent ──
interface RefSkill { key: string; name: string; characteristic_key: string }

function useRefSkills() {
  const [skills, setSkills] = useState<RefSkill[]>([])
  useEffect(() => {
    const supabase = createClient()
    supabase.from('ref_skills').select('key, name, characteristic_key').order('name')
      .then(({ data }) => { if (data) setSkills(data as RefSkill[]) })
  }, [])
  return skills
}

// ── Pool pre-fill — the single source of formula truth for this tab ─────────
// getSkillPool already implements "0 ranks still shows the characteristic's
// ability dice" correctly: proficiency = min(charVal, rank), ability =
// abs(charVal - rank) — at rank 0, proficiency = 0, ability = charVal, i.e.
// pure ability dice equal to the characteristic. Exact FFG rules, no separate
// zero-rank branch needed.
function computeSkillPool(adv: AdversaryInstance, skill: RefSkill): { proficiency: number; ability: number } {
  const field = CHAR_FIELD_MAP[skill.characteristic_key]
  const charVal = field ? (adv.characteristics[field as keyof AdversaryInstance['characteristics']] ?? 0) : 0
  const rank = getAdversarySkillRank(adv, skill.name)
  return getSkillPool(charVal, rank)
}

const DIE_TYPES: DiceType[] = ['proficiency', 'ability', 'boost', 'difficulty', 'challenge', 'setback']
const EMPTY_SKILL_POOL: Record<DiceType, number> = {
  proficiency: 0, ability: 0, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: 0,
}

export interface CheckConsoleProps {
  entry:       RosterEntry
  campaignId:  string
  characters:  Character[]
  encounter:   CombatEncounter | null
  initialTab?: 'skill' | 'combat'
  /** Bumped by the dossier's Attack button to force-switch to Combat with a weapon pre-selected — see Task 6. */
  attackWeaponSignal?: number | null
  onRollLogged?: () => void
}

export function CheckConsole({
  entry, campaignId, attackWeaponSignal, onRollLogged, initialTab,
}: CheckConsoleProps) {
  const adv = entry.kind === 'adversary' ? (entry.entity as AdversaryInstance) : null

  // Vehicles have no characteristics/skillRanks in the data model — a bare
  // skill check doesn't apply to them, so they always land on Combat.
  const [tab, setTab] = useState<'skill' | 'combat'>(() => (adv ? (initialTab ?? 'skill') : 'combat'))
  const [selSkill, setSelSkill] = useState<RefSkill | null>(null)
  const [pool, setPool] = useState<Record<DiceType, number>>(EMPTY_SKILL_POOL)
  const refSkills = useRefSkills()

  // Reset whenever the dossier is showing a different entity (or flips
  // between adversary/vehicle) — done in an effect rather than during
  // render so a vehicle's forced Combat tab doesn't fight React's render
  // pass.
  useEffect(() => {
    setTab(adv ? (initialTab ?? 'skill') : 'combat')
    setSelSkill(null)
    setPool(EMPTY_SKILL_POOL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.instanceId, !!adv])

  // Task 6 wires full weapon pre-selection; this task only needs the
  // Attack button to already force-switch to the Combat tab end-to-end.
  useEffect(() => {
    if (attackWeaponSignal != null) setTab('combat')
  }, [attackWeaponSignal])

  const selectSkill = (skill: RefSkill) => {
    if (!adv) return
    setSelSkill(skill)
    const d = computeSkillPool(adv, skill)
    setPool({ ...d, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: 0 })
  }

  const canRoll = tab === 'skill' ? selSkill !== null : false /* Task 6 sets Combat-tab canRoll */

  const doRoll = () => {
    if (tab !== 'skill' || !selSkill || !adv) return
    const result = rollPool(pool)
    logRoll({
      campaignId, characterId: null, characterName: adv.name,
      label: `${selSkill.name} Check`, pool, result, isDM: true, hidden: false,
      meta: { rollType: 'skill', alignment: entry.alignment },
    })
    onRollLogged?.()
  }

  const poolEmpty = Object.values(pool).every(v => v === 0)

  return (
    <div style={{
      borderLeft: `1px solid ${HUD.border}`, display: 'flex', flexDirection: 'column',
      background: 'color-mix(in srgb, var(--hud-bg) 25%, transparent)',
    }}>
      <div style={{ padding: `${SP[2]} ${SP[3]}`, borderBottom: `1px solid ${HUD.border}`, display: 'flex', gap: SP[2] }}>
        {adv && (
          <button className={`cc-tab${tab === 'skill' ? ' on' : ''}`} onClick={() => setTab('skill')}>⬠ SKILL CHECK</button>
        )}
        <button className={`cc-tab${tab === 'combat' ? ' on' : ''}`} onClick={() => setTab('combat')}>⌖ COMBAT CHECK</button>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: SP[3], display: 'flex', flexDirection: 'column',
        gap: SP[1], maxHeight: '26.25rem',
      }}>
        {tab === 'skill' && adv && refSkills.map(skill => {
          const d = computeSkillPool(adv, skill)
          return (
            <div
              key={skill.key}
              className={`cc-skill-item${selSkill?.key === skill.key ? ' sel' : ''}`}
              onClick={() => selectSkill(skill)}
            >
              <span style={{ flex: 1, minWidth: 0, fontFamily: FC, fontSize: FS.label, color: HUD.text }}>{skill.name}</span>
              <span style={{ flexShrink: 0, fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint }}>{skill.characteristic_key}</span>
              <span style={{ flexShrink: 0, fontFamily: FC, fontSize: FS.overline, color: HUD.textDim }}>{d.proficiency}P {d.ability}A</span>
            </div>
          )
        })}
        {tab === 'combat' && (
          <div style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.08em', padding: SP[2] }}>
            COMBAT CHECK — coming in a later task
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${HUD.border}`, padding: SP[3], display: 'flex', flexDirection: 'column', gap: SP[2] }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 3, minHeight: '1.375rem', alignItems: 'center',
          padding: SP[2], background: 'color-mix(in srgb, var(--hud-bg) 40%, transparent)',
          border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm,
        }}>
          {poolEmpty
            ? <span style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.08em' }}>SELECT A SKILL OR WEAPON</span>
            : DIE_TYPES.flatMap(k => Array.from({ length: pool[k] }, (_, i) => <DiceFace key={`${k}-${i}`} type={k} size={16} />))
          }
        </div>
        {tab === 'skill' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: SP[1] }}>
            {DIE_TYPES.map(k => (
              <div key={k} className="cc-dstep">
                <DiceFace type={k} size={14} />
                <button onClick={() => setPool(p => ({ ...p, [k]: Math.max(0, p[k] - 1) }))}>−</button>
                <b>{pool[k]}</b>
                <button onClick={() => setPool(p => ({ ...p, [k]: p[k] + 1 }))}>+</button>
              </div>
            ))}
          </div>
        )}
        <button className="cc-roll-btn" disabled={!canRoll} onClick={doRoll}>ROLL — PUBLIC</button>
      </div>
    </div>
  )
}
