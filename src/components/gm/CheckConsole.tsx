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
// Combat Check tab (Prompt 9 — design correction, replacing Task 6's overlay
// mount): the GM knows the rules and needs speed, not a step-by-step modal.
// No target picker (the GM decides who an NPC attacks — the app doesn't
// track it), no opposed-difficulty/melee-vs-target automation (the GM enters
// difficulty manually), no pending_damage generation (this only rolls and
// displays reference info — wounds are applied by hand). Selecting a weapon
// prefills the pool from the ADVERSARY'S RANK IN THAT WEAPON'S GOVERNING
// SKILL, via the exact same computeSkillPool used by the Skill Check tab
// below — just keyed by the weapon's skill instead of a GM-picked one. Every
// adversary always gets a synthetic "Unarmed" entry appended last (AoE Core
// Rulebook, Unarmed Combat, p.224: Brawl, damage = Brawn, Engaged, Crit 5,
// Disorient 1 + Knockdown) — vehicles do NOT get one; they have no Brawn
// characteristic or Brawl skill anywhere in this data model, so "unarmed
// vehicle" isn't a coherent concept. Vehicles also can't roll a Combat Check
// pool at all here (no crew characteristics/skillRanks exist on a
// VehicleInstance to derive Gunnery dice from) — their weapon list stays
// reference-only with Roll disabled, exactly as it already was.
// CombatCheckOverlay itself is untouched — GmMapView no longer mounts it
// from the dossier, but PlayerHUDDesktop.tsx still uses it for PC checks.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSkillPool, rollPool } from '@/components/player-hud/dice-engine'
import { logRoll } from '@/lib/logRoll'
import { getAdversarySkillRank, weaponSkillKey, SKILL_KEY_TO_CHAR, SKILL_NAME_TO_KEY_REVERSE } from '@/lib/adversaryAdapter'
import { CHAR_FIELD_MAP } from '@/lib/combatCheckUtils'
import { resolveWeapon } from '@/lib/resolve-weapon'
import { vehicleWeaponDisplayName, vehicleWeaponStats, vehicleWeaponSkillKey } from '@/lib/vehicles'
import { DiceFace } from '@/components/dice/DiceFace'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'
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

// ── Combat tab weapon option — real weapons + a synthetic Unarmed entry ────
// (adversary-only). index -1 marks the synthetic entry so it never collides
// with a real adv.weapons array index.
interface CombatWeaponOption {
  index:            number
  name:             string
  /** SWRPG skill key (weaponSkillKey()'s output, e.g. 'RANGHVY'), or null for a vehicle weapon (no rollable pool — see file-header comment). */
  skillKey:         string | null
  damage:           number | string
  crit?:            number
  range:            string
  qualities:        string[]
}

const UNARMED_QUALITIES = ['Disorient 1', 'Knockdown']

// Pool for a weapon's governing skill, given its SWRPG key (weaponSkillKey()'s
// output). Deliberately does NOT go through refSkills/ref_skills.name (as
// computeSkillPool above does for the Skill tab) — confirmed via direct
// query that AdversaryInstance.skillRanks is actually keyed in the
// colon-separated form ("Ranged: Heavy": 1), not ref_skills.name's dash
// form ("Ranged - Heavy"). Matching against the wrong string silently
// returns rank 0, so this reads the characteristic (SKILL_KEY_TO_CHAR) and
// the rank (SKILL_NAME_TO_KEY_REVERSE → getAdversarySkillRank) directly,
// bypassing ref_skills entirely for the pieces that need to match
// adv.skillRanks exactly.
function computeWeaponPool(adv: AdversaryInstance, skillKey: string): { proficiency: number; ability: number } {
  const charKey = SKILL_KEY_TO_CHAR[skillKey] ?? 'BR'
  const field = CHAR_FIELD_MAP[charKey]
  const charVal = field ? (adv.characteristics[field as keyof AdversaryInstance['characteristics']] ?? 0) : 0
  const skillName = SKILL_NAME_TO_KEY_REVERSE[skillKey] ?? ''
  const rank = getAdversarySkillRank(adv, skillName)
  return getSkillPool(charVal, rank)
}

export interface CheckConsoleProps {
  entry:       RosterEntry
  campaignId:  string
  /** Full current roster — only used to populate the vehicle Combat Check tab's crew picker (Prompt 10). */
  roster:      RosterEntry[]
  initialTab?: 'skill' | 'combat'
  /** Bumped by the dossier's Attack button to force-switch to Combat with a weapon pre-selected. */
  attackWeaponSignal?: number | null
  onRollLogged?: () => void
}

export function CheckConsole({
  entry, campaignId, roster, attackWeaponSignal, onRollLogged, initialTab,
}: CheckConsoleProps) {
  const adv = entry.kind === 'adversary' ? (entry.entity as AdversaryInstance) : null
  const veh = entry.kind === 'vehicle' ? (entry.entity as VehicleInstance) : null

  // Vehicles have no characteristics/skillRanks in the data model — a bare
  // skill check doesn't apply to them, so they always land on Combat.
  const [tab, setTab] = useState<'skill' | 'combat'>(() => (adv ? (initialTab ?? 'skill') : 'combat'))
  const [selSkill, setSelSkill] = useState<RefSkill | null>(null)
  const [pool, setPool] = useState<Record<DiceType, number>>(EMPTY_SKILL_POOL)
  const refSkills = useRefSkills()

  // Combat tab — inline roller (Prompt 9), same shape as the Skill tab:
  // select a weapon, pool prefills, GM adjusts, rolls inline.
  const [selWeapon, setSelWeapon] = useState<number | null>(null)

  // Vehicle-only crew picker (Prompt 10) — a vehicle has no skills of its
  // own (RAW: a mounted weapon is fired by a crew member's Gunnery/Piloting
  // check), so its pool must be sourced from a chosen roster entity instead
  // of the vehicle itself. Deliberately NOT persisted across rolls or
  // re-opens — real play has crew swap or die mid-encounter, so this resets
  // on every weapon (re)selection, entity switch, and completed roll rather
  // than remembering the last crew used.
  const [selCrewInstanceId, setSelCrewInstanceId] = useState<string | null>(null)

  // Reset whenever the dossier is showing a different entity (or flips
  // between adversary/vehicle) — done in an effect rather than during
  // render so a vehicle's forced Combat tab doesn't fight React's render
  // pass.
  useEffect(() => {
    setTab(adv ? (initialTab ?? 'skill') : 'combat')
    setSelSkill(null)
    setPool(EMPTY_SKILL_POOL)
    setSelWeapon(null)
    setSelCrewInstanceId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.instanceId, !!adv])

  // Attack button (dossier weapons list) force-switches to Combat with that
  // weapon pre-selected.
  useEffect(() => {
    if (attackWeaponSignal != null) {
      setTab('combat')
      setSelWeapon(attackWeaponSignal)
      setSelCrewInstanceId(null)
    }
  }, [attackWeaponSignal])

  const selectSkill = (skill: RefSkill) => {
    if (!adv) return
    setSelSkill(skill)
    const d = computeSkillPool(adv, skill)
    setPool({ ...d, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: 0 })
  }

  // ── Combat tab weapon list ──────────────────────────────────────────────
  const combatWeaponOptions = useMemo<CombatWeaponOption[]>(() => {
    if (veh) {
      // Vehicle weapons are fired by a crew member (Prompt 10's "Select
      // Crew" step below), never the vehicle itself — the weapon's own
      // skillKey just says WHICH skill that crew member needs.
      return veh.weapons.map((w, i) => {
        const stats = vehicleWeaponStats(w.weaponKey)
        return {
          index: i,
          name: `${w.count > 1 ? `${w.count}× ` : ''}${vehicleWeaponDisplayName(w.weaponKey)}${w.turret ? ' (Turret)' : ''}`,
          skillKey: vehicleWeaponSkillKey(w.weaponKey),
          damage: stats?.damage ?? '—',
          crit: stats?.crit,
          range: stats?.range ?? '—',
          qualities: w.qualities.map(q => `${q.key}${q.count > 1 ? ` ${q.count}` : ''}`),
        }
      })
    }
    if (!adv) return []
    const real: CombatWeaponOption[] = adv.weapons.map((w, i) => {
      const { dmg, range, crit } = resolveWeapon(w, adv.characteristics.brawn, {})
      return {
        index: i,
        name: w.name,
        skillKey: weaponSkillKey(w),
        damage: dmg,
        crit,
        range,
        qualities: w.qualities ?? [],
      }
    })
    const unarmed: CombatWeaponOption = {
      index: -1, name: 'Unarmed', skillKey: 'BRAWL',
      damage: adv.characteristics.brawn, crit: 5, range: 'Engaged',
      qualities: UNARMED_QUALITIES,
    }
    return [...real, unarmed]
  }, [veh, adv])

  const selCombatWeapon = selWeapon !== null ? (combatWeaponOptions.find(w => w.index === selWeapon) ?? null) : null

  // Vehicle crew picker (Prompt 10) — every non-vehicle roster entity (enemy
  // adversaries + friendly NPCs, hidden ones included) is eligible; other
  // vehicles are excluded (a vehicle can't crew a vehicle).
  const eligibleCrew = useMemo(() => roster.filter(r => r.kind === 'adversary'), [roster])
  const selCrew = selCrewInstanceId !== null
    ? (eligibleCrew.find(c => c.instanceId === selCrewInstanceId) ?? null)
    : null

  const selectWeapon = (opt: CombatWeaponOption) => {
    setSelWeapon(opt.index)
    setSelCrewInstanceId(null)
    if (!adv || !opt.skillKey) { setPool(EMPTY_SKILL_POOL); return }
    const d = computeWeaponPool(adv, opt.skillKey)
    setPool({ ...d, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: 0 })
  }

  const selectCrew = (crewEntry: RosterEntry) => {
    setSelCrewInstanceId(crewEntry.instanceId)
    if (!selCombatWeapon?.skillKey) return
    const d = computeWeaponPool(crewEntry.entity as AdversaryInstance, selCombatWeapon.skillKey)
    setPool({ ...d, boost: 0, difficulty: 0, challenge: 0, setback: 0, force: 0 })
  }

  const canRoll = tab === 'skill'
    ? selSkill !== null
    : (adv ? selCombatWeapon !== null : (selCombatWeapon !== null && selCrew !== null))

  const doRoll = () => {
    if (tab === 'skill') {
      if (!selSkill || !adv) return
      const result = rollPool(pool)
      logRoll({
        campaignId, characterId: null, characterName: adv.name,
        label: `${selSkill.name} Check`, pool, result, isDM: true, hidden: false,
        meta: { rollType: 'skill', alignment: entry.alignment },
      })
      onRollLogged?.()
      return
    }
    if (!selCombatWeapon) return
    if (veh && !selCrew) return
    const critStr = selCombatWeapon.crit != null ? ` · CRIT ${selCombatWeapon.crit}` : ''
    const qualStr = selCombatWeapon.qualities.length ? ` · ${selCombatWeapon.qualities.join(', ')}` : ''
    const result = rollPool(pool)
    logRoll({
      campaignId, characterId: null, characterName: adv ? adv.name : (veh?.name ?? ''),
      // rollType stays 'skill' (not 'combat') deliberately — RollFeedPanel's
      // 'combat' card computes an automated damage total from roll_meta and
      // never renders roll_label at all, which would both violate "no
      // damage resolution" and hide this weapon's reference info entirely.
      // The 'skill' card renders roll_label as-is, so the reference info
      // (baked into the label below) actually reaches the GM/players. The
      // crew member sourcing the pool is deliberately never named here —
      // this is the vehicle's attack, not the crew's (Prompt 10).
      label: `${selCombatWeapon.name} Check — DMG ${selCombatWeapon.damage}${critStr} · ${selCombatWeapon.range}${qualStr}`,
      pool, result, isDM: true, hidden: false,
      meta: { rollType: 'skill', alignment: entry.alignment },
    })
    if (veh) setSelCrewInstanceId(null)
    onRollLogged?.()
  }

  const poolEmpty = Object.values(pool).every(v => v === 0)

  return (
    <div style={{
      borderLeft: `1px solid ${HUD.border}`, display: 'flex', flexDirection: 'column',
      background: 'color-mix(in srgb, var(--hud-bg) 25%, transparent)',
      // maxHeight matches the center stats column's own cap (32.5rem, see
      // EncounterDossier.tsx) rather than the grid's smaller minHeight
      // floor (26.875rem) — capping to a value SHORTER than what the
      // center column actually uses just relocated the dead-space bug from
      // CheckConsole to the center column instead of fixing it (Skill
      // Check's content wants to grow past 26.875rem, and with nothing
      // else bounding the row, the row grew to fit it while the shorter-
      // capped center column stayed put, floating above blank space).
      // minHeight:0 is required alongside overflowY:'auto': per spec, a
      // flex/grid item's automatic min-height collapses to 0 only once its
      // own overflow is not 'visible' in that axis — without both, this
      // div (a CSS Grid item) refuses to shrink below its own content and
      // forces the whole row taller on Skill Check (which renders a
      // pool-tray/stepper-grid/roll-button block Combat Check doesn't).
      minHeight: 0, maxHeight: '32.5rem', overflowY: 'auto',
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
              <span style={{ flexShrink: 0, display: 'flex', gap: 2 }}>
                {Array.from({ length: d.proficiency }, (_, i) => <DiceFace key={`p${i}`} type="proficiency" size={14} />)}
                {Array.from({ length: d.ability }, (_, i) => <DiceFace key={`a${i}`} type="ability" size={14} />)}
              </span>
            </div>
          )
        })}
        {tab === 'combat' && combatWeaponOptions.map(w => (
          <div
            key={w.index}
            className={`cc-skill-item${selWeapon === w.index ? ' sel' : ''}`}
            onClick={() => selectWeapon(w)}
          >
            <span style={{ flex: 1, minWidth: 0, fontFamily: FC, fontSize: FS.label, color: HUD.text }}>{w.name}</span>
            {w.skillKey && (
              <span style={{ flexShrink: 0, fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint }}>{SKILL_NAME_TO_KEY_REVERSE[w.skillKey] ?? w.skillKey}</span>
            )}
          </div>
        ))}
        {tab === 'combat' && veh && selCombatWeapon && (
          // Crew picker (Prompt 10) — a vehicle has no skills of its own, so
          // the pool must be sourced from a chosen crew member's rank in the
          // weapon's governing skill (usually Gunnery). Ephemeral per roll —
          // see selCrewInstanceId's declaration for why it never persists.
          <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginTop: SP[1] }}>
            <span style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em' }}>SELECT CREW</span>
            {eligibleCrew.length === 0 ? (
              <div style={{
                padding: SP[2], fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint, lineHeight: 1.5,
                border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm, background: 'var(--hud-surface-lo)',
              }}>
                No crew available — add a crew NPC to the encounter.
              </div>
            ) : eligibleCrew.map(c => {
              const d = computeWeaponPool(c.entity as AdversaryInstance, selCombatWeapon.skillKey ?? 'GUNN')
              return (
                <div
                  key={c.instanceId}
                  className={`cc-skill-item${selCrewInstanceId === c.instanceId ? ' sel' : ''}`}
                  onClick={() => selectCrew(c)}
                >
                  <span style={{ flex: 1, minWidth: 0, fontFamily: FC, fontSize: FS.label, color: HUD.text }}>{c.name}</span>
                  <span style={{ flexShrink: 0, display: 'flex', gap: 2 }}>
                    {Array.from({ length: d.proficiency }, (_, i) => <DiceFace key={`p${i}`} type="proficiency" size={14} />)}
                    {Array.from({ length: d.ability }, (_, i) => <DiceFace key={`a${i}`} type="ability" size={14} />)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        {tab === 'combat' && selCombatWeapon && (
          // Reference info — damage/crit/range/qualities — surfaced here so
          // the GM can read off exactly what to apply after rolling, without
          // this tab ever computing or writing a damage total itself.
          <div style={{
            marginTop: SP[1], padding: SP[2], background: 'var(--hud-surface-lo)',
            border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm,
            fontFamily: FC, fontSize: FS.overline, color: HUD.textDim, lineHeight: 1.6,
          }}>
            <b style={{ color: HUD.text }}>DMG {selCombatWeapon.damage}</b>
            {selCombatWeapon.crit != null && <> · CRIT {selCombatWeapon.crit}</>}
            {' · '}{selCombatWeapon.range}
            {selCombatWeapon.qualities.length > 0 && <> · {selCombatWeapon.qualities.join(', ')}</>}
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
            ? <span style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.08em' }}>
                {tab === 'skill' ? 'SELECT A SKILL' : (veh && selCombatWeapon ? 'SELECT CREW' : 'SELECT A WEAPON')}
              </span>
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
    </div>
  )
}
