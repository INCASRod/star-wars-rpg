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
// Combat Check tab (Task 6): a weapon + target picker only. Clicking "OPEN
// COMBAT CHECK" hands (weaponIndex, targetId) up to onOpenCombatCheck, which
// EncounterDossier/GmMapView use to mount the real CombatCheckOverlay wizard
// as its own docked overlay (its .hud-quick-drawer CSS assumes a full-height
// positioned ancestor — not embeddable inline in this narrow column). Vehicle
// entries can browse weapons/targets here for reference, but opening the
// overlay is adversary-only: adaptAdversaryForCombatCheck (the stub-builder
// CombatCheckOverlay needs) only accepts an AdversaryInstance, and no vehicle
// equivalent exists anywhere in this codebase (confirmed against the deleted
// EncounterVehiclePanel, which never mounted CombatCheckOverlay at all — only
// the deleted EncounterAdversaryPanel did).
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSkillPool, rollPool } from '@/components/player-hud/dice-engine'
import { logRoll } from '@/lib/logRoll'
import { getAdversarySkillRank, charactersToAdversaryStubs, weaponSkillKey } from '@/lib/adversaryAdapter'
import { CHAR_FIELD_MAP, getMeleeDifficulty, isMeleeSkill } from '@/lib/combatCheckUtils'
import { vehicleWeaponDisplayName } from '@/lib/vehicles'
import { DiceFace } from '@/components/dice/DiceFace'
import type { AdversaryInstance, AdversaryWeapon } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'
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
  /** Fired when the GM clicks "OPEN COMBAT CHECK" — EncounterDossier/GmMapView mount the real overlay. */
  onOpenCombatCheck: (weaponIndex: number, targetId: string) => void
  onRollLogged?: () => void
}

export function CheckConsole({
  entry, campaignId, characters, encounter, attackWeaponSignal, onOpenCombatCheck, onRollLogged, initialTab,
}: CheckConsoleProps) {
  const adv = entry.kind === 'adversary' ? (entry.entity as AdversaryInstance) : null
  const veh = entry.kind === 'vehicle' ? (entry.entity as VehicleInstance) : null

  // Vehicles have no characteristics/skillRanks in the data model — a bare
  // skill check doesn't apply to them, so they always land on Combat.
  const [tab, setTab] = useState<'skill' | 'combat'>(() => (adv ? (initialTab ?? 'skill') : 'combat'))
  const [selSkill, setSelSkill] = useState<RefSkill | null>(null)
  const [pool, setPool] = useState<Record<DiceType, number>>(EMPTY_SKILL_POOL)
  const refSkills = useRefSkills()

  // Combat tab — weapon + target picker only. The actual roll happens inside
  // CombatCheckOverlay, mounted by EncounterDossier/GmMapView once
  // onOpenCombatCheck fires.
  const [selWeapon, setSelWeapon] = useState<number | null>(null)
  const [selTarget, setSelTarget] = useState<string | null>(null)

  // Reset whenever the dossier is showing a different entity (or flips
  // between adversary/vehicle) — done in an effect rather than during
  // render so a vehicle's forced Combat tab doesn't fight React's render
  // pass.
  useEffect(() => {
    setTab(adv ? (initialTab ?? 'skill') : 'combat')
    setSelSkill(null)
    setPool(EMPTY_SKILL_POOL)
    setSelWeapon(null)
    setSelTarget(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.instanceId, !!adv])

  // Attack button (dossier weapons list) force-switches to Combat with that
  // weapon pre-selected.
  useEffect(() => {
    if (attackWeaponSignal != null) {
      setTab('combat')
      setSelWeapon(attackWeaponSignal)
    }
  }, [attackWeaponSignal])

  const selectSkill = (skill: RefSkill) => {
    if (!adv) return
    setSelSkill(skill)
    const d = computeSkillPool(adv, skill)
    setPool({ ...d, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: 0 })
  }

  // ── Combat tab derivations ──────────────────────────────────────────────
  const weaponOptions = useMemo(() => {
    if (veh) {
      return veh.weapons.map((w, i) => ({
        index: i,
        name: `${w.count > 1 ? `${w.count}× ` : ''}${vehicleWeaponDisplayName(w.weaponKey)}${w.turret ? ' (Turret)' : ''}`,
      }))
    }
    return (adv?.weapons ?? []).map((w, i) => ({ index: i, name: w.name }))
  }, [veh, adv])

  const targetOptions = useMemo(() => {
    const pcStubs = charactersToAdversaryStubs(characters)
    const allied = (encounter?.adversaries ?? []).filter(a => {
      const slot = encounter?.initiative_slots.find(s => s.adversaryInstanceId === a.instanceId)
      return slot?.alignment === 'allied_npc' && a.instanceId !== entry.instanceId
    })
    return [...pcStubs, ...allied].map(t => ({ id: t.instanceId, name: t.name, stub: t }))
  }, [characters, encounter, entry.instanceId])

  const selTargetStub = targetOptions.find(t => t.id === selTarget)?.stub ?? null
  const selWeaponObj = selWeapon !== null
    ? ((veh ? veh.weapons[selWeapon] : adv?.weapons[selWeapon]) ?? null)
    : null
  // Vehicle weapons have no melee/ranged skill concept in this codebase (no
  // vehicle equivalent of adaptAdversaryForCombatCheck exists) — only
  // adversary weapons get the melee opposed-check preview.
  const selWeaponIsMelee = !veh && selWeaponObj
    ? isMeleeSkill(weaponSkillKey(selWeaponObj as AdversaryWeapon))
    : false
  const meleeFallback = selWeaponIsMelee ? getMeleeDifficulty(selTargetStub) : null

  const openCombatCheckOverlay = () => {
    if (selWeapon === null || selTarget === null || veh) return
    onOpenCombatCheck(selWeapon, selTarget)
  }

  const canRoll = tab === 'skill' ? selSkill !== null : false /* Combat tab rolls happen inside CombatCheckOverlay */

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
          <>
            <div className="dossier-sec-label">Weapon</div>
            {weaponOptions.map(w => (
              <div
                key={w.index}
                className={`cc-skill-item${selWeapon === w.index ? ' sel' : ''}`}
                onClick={() => setSelWeapon(w.index)}
              >
                <span style={{ flex: 1, minWidth: 0, fontFamily: FC, fontSize: FS.label, color: HUD.text }}>{w.name}</span>
              </div>
            ))}
            <div className="dossier-sec-label">Target</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1] }}>
              {targetOptions.map(t => (
                <button
                  key={t.id}
                  className={`cc-tgt${selTarget === t.id ? ' sel' : ''}`}
                  onClick={() => setSelTarget(t.id)}
                >{t.name}</button>
              ))}
              {targetOptions.length === 0 && (
                <span style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint }}>No eligible targets</span>
              )}
            </div>
            {meleeFallback?.fallbackReason && (
              <div style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textDim, lineHeight: 1.5 }}>
                <b style={{ color: HUD.gold }}>⚠</b> {meleeFallback.fallbackReason}
              </div>
            )}
            {veh && (
              <div style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint, lineHeight: 1.5 }}>
                Vehicle combat checks aren&apos;t supported yet — weapon/target selection is for reference only.
              </div>
            )}
            <button
              className="cc-roll-btn"
              disabled={selWeapon === null || selTarget === null || !!veh}
              onClick={openCombatCheckOverlay}
            >⌖ OPEN COMBAT CHECK</button>
          </>
        )}
      </div>

      {tab === 'skill' && (
        <div style={{ borderTop: `1px solid ${HUD.border}`, padding: SP[3], display: 'flex', flexDirection: 'column', gap: SP[2] }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 3, minHeight: '1.375rem', alignItems: 'center',
            padding: SP[2], background: 'color-mix(in srgb, var(--hud-bg) 40%, transparent)',
            border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm,
          }}>
            {poolEmpty
              ? <span style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.08em' }}>SELECT A SKILL</span>
              : DIE_TYPES.flatMap(k => Array.from({ length: pool[k] }, (_, i) => <DiceFace key={`${k}-${i}`} type={k} size={16} />))
            }
          </div>
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
          <button className="cc-roll-btn" disabled={!canRoll} onClick={doRoll}>ROLL — PUBLIC</button>
        </div>
      )}
    </div>
  )
}
