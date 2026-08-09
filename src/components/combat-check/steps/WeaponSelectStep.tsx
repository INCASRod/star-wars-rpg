'use client'

import { useState, useEffect, useRef } from 'react'
import type { CharacterWeapon, RefWeapon, RefSkill, RefWeaponQuality, Character } from '@/lib/types'
import { isRangedSkill, isMeleeSkill as isMeleeSkillKey } from '@/lib/combatCheckUtils'
import { canDualWield } from '@/lib/weaponHandedness'

export interface WeaponManeuvers {
  aim1:    boolean
  aim2:    boolean
  assist:  boolean
  guarded: boolean
  onToggleAim1:    () => void
  onToggleAim2:    () => void
  onToggleAssist:  () => void
  onToggleGuarded: () => void
}

interface WeaponSelectStepProps {
  attackType:         'ranged' | 'melee' | null
  character:          Character
  weapons:            CharacterWeapon[]
  refWeaponMap:       Record<string, RefWeapon>
  refSkillMap:        Record<string, RefSkill>
  refWeaponQualityMap: Record<string, RefWeaponQuality>
  charSkills:         { skill_key: string; rank: number }[]
  selectedWeapon:     CharacterWeapon | null
  onSelect:           (weapon: CharacterWeapon | null) => void
  onNext:             () => void
  /** Skip DB equip writes — weapons are already marked equipped */
  isGmMode?:          boolean
  /** Called when a stowed weapon is equipped mid-combat — parent owns the DB write */
  onEquipWeapon?:     (weaponId: string, idsToUnequip: string[]) => Promise<void>
  /** Called when player chooses Dual Wield Attack */
  onDualWieldSelect?: (primary: CharacterWeapon, secondary: CharacterWeapon) => void
  /** Maneuver toggle state and handlers — renders inside selected weapon card */
  maneuvers?:         WeaponManeuvers
}

// ── Dual wield detection ──────────────────────────────────────────────────────
/**
 * Every equipped weapon eligible as an off-hand for `selectedWeapon`.
 *
 * Exclusion is by **instance id**, never by weapon type or key — a character
 * carrying two of the same blaster can wield both, and each instance is offered
 * separately. Previously this returned a partner only when exactly one
 * candidate existed, so anyone with two or more eligible off-hands could not
 * dual wield at all.
 *
 * Unarmed is never dual-wieldable in either direction: not as an off-hand, and
 * selecting it as primary offers no dual wield. (The `refWeaponMap` lookup
 * already misses for `__unarmed__`, but that is incidental — the sentinel check
 * is explicit so adding a ref row later cannot silently enable it.)
 *
 * Every other eligibility condition is unchanged: same ranged/melee class, and
 * both weapons passing `canDualWield`.
 */
function findDualWieldCandidates(
  selectedWeapon: CharacterWeapon,
  allEquippedWeapons: CharacterWeapon[],
  refWeaponMap: Record<string, RefWeapon>,
): CharacterWeapon[] {
  if (selectedWeapon.weapon_key === '__unarmed__' || selectedWeapon.id === '__unarmed__') return []
  const selectedRef = refWeaponMap[selectedWeapon.weapon_key]
  if (!selectedRef) return []
  if (!canDualWield({ skill_key: selectedRef.skill_key, weapon_key: selectedWeapon.weapon_key, is_one_handed_override: selectedWeapon.is_one_handed_override, is_two_handed_override: selectedWeapon.is_two_handed_override })) return []

  const selectedIsRanged = isRangedSkill(selectedRef.skill_key)
  return allEquippedWeapons
    .filter(w => w.id !== selectedWeapon.id)
    .filter(w => w.weapon_key !== '__unarmed__' && w.id !== '__unarmed__')
    .filter(w => {
      const ref = refWeaponMap[w.weapon_key]
      if (!ref) return false
      if (isRangedSkill(ref.skill_key) !== selectedIsRanged) return false
      return canDualWield({ skill_key: ref.skill_key, weapon_key: w.weapon_key, is_one_handed_override: w.is_one_handed_override, is_two_handed_override: w.is_two_handed_override })
    })
}

/** Fake weapon entry for Unarmed/Brawl */
const UNARMED_WEAPON: CharacterWeapon & { _isUnarmed: true } = {
  id: '__unarmed__',
  character_id: '',
  weapon_key: '__unarmed__',
  custom_name: 'Unarmed / Brawl',
  is_equipped: true,
  equip_state: 'equipped',
  attachments: [],
  notes: '',
  _isUnarmed: true,
}

/** Weapon stat line — shared by the chip and every picker row. */
function statLineFor(w: CharacterWeapon | null, refWeaponMap: Record<string, RefWeapon>): string {
  if (!w) return 'No weapon selected'
  if (w.id === '__unarmed__') return 'Brawl · DMG Brawn · CRIT 5'
  const ref = refWeaponMap[w.weapon_key]
  if (!ref) return '—'
  const dmg   = ref.damage_add != null ? `DMG +${ref.damage_add}` : `DMG ${ref.damage}`
  const crit  = ref.crit ? ` · CRIT ${ref.crit}` : ''
  const skill = ref.skill_key ? ` · ${ref.skill_key}` : ''
  return `${dmg}${crit}${skill}`
}

/** Module scope — a component declared inside the step body would be a new
 *  type on every render. */
function PickerRow({ w, isStowed, selected, onPick, refWeaponMap }: {
  w: CharacterWeapon; isStowed: boolean; selected: boolean; onPick: () => void
  refWeaponMap: Record<string, RefWeapon>
}) {
  const unarmed = w.id === '__unarmed__'
  const ref     = unarmed ? null : refWeaponMap[w.weapon_key]
  const label   = unarmed ? 'Unarmed / Brawl' : (w.custom_name || ref?.name || 'Weapon')
  return (
    <button
      type="button"
      data-selected={selected ? 'true' : 'false'}
      className={`fc-picker-row${selected ? ' is-selected' : ''}`}
      onClick={onPick}
    >
      {/* Same crosshair placeholder treatment for every row — a proper icon
          pass is planned separately. */}
      <span className="fc-chip-icon">⌖</span>
      <span className="fc-chip-meta">
        <span className="fc-chip-name">{label}{isStowed ? ' (carried)' : ''}</span>
        <span className="fc-chip-stats">{statLineFor(w, refWeaponMap)}</span>
      </span>
    </button>
  )
}

export function WeaponSelectStep({
  attackType,
  character,
  weapons,
  refWeaponMap,
  refSkillMap,
  refWeaponQualityMap,
  charSkills,
  selectedWeapon,
  onSelect,
  onNext,
  isGmMode,
  onEquipWeapon,
  onDualWieldSelect,
  maneuvers,
}: WeaponSelectStepProps) {
  const [maneuverWarningFor, setManeuverWarningFor] = useState<string | null>(null)
  const [equipping, setEquipping] = useState(false)
  /** Presentational only — which off-hand the player picked in the slot UI. */
  const [offHandId, setOffHandId] = useState<string | null>(null)

  function weaponMatchesType(w: CharacterWeapon): boolean {
    if (attackType === null) return true
    const ref = refWeaponMap[w.weapon_key]
    if (!ref?.skill_key) return false
    if (attackType === 'ranged') return isRangedSkill(ref.skill_key)
    return isMeleeSkillKey(ref.skill_key)
  }

  const matchingWeapons = weapons.filter(weaponMatchesType)
  const equipped = matchingWeapons.filter(w => w.equip_state === 'equipped' || w.is_equipped)
  const carried  = matchingWeapons.filter(w => w.equip_state === 'carrying' && !w.is_equipped)

  async function equipWeapon(w: CharacterWeapon) {
    if (!onEquipWeapon) return
    setEquipping(true)
    const idsToUnequip = equipped.filter(e => e.id !== w.id).map(e => e.id)
    await onEquipWeapon(w.id, idsToUnequip)
    setEquipping(false)
    setManeuverWarningFor(null)
    onSelect(w)
    onNext()
  }

  const hasAnyWeapon = equipped.length > 0 || carried.length > 0 || attackType === 'melee' || attackType === null

  const isMeleeSel = selectedWeapon
    ? (selectedWeapon.id === '__unarmed__'
        ? true
        : (refWeaponMap[selectedWeapon.weapon_key]?.skill_key ? isMeleeSkillKey(refWeaponMap[selectedWeapon.weapon_key]!.skill_key) : false))
    : false

  // ── Presentational state (focus-console redesign) ─────────────────────────
  // Which picker is open. No mechanical meaning — the weapon itself still lives
  // in CombatCheckOverlay's `selectedWeapon`.
  const [pickerOpen, setPickerOpen]   = useState<null | 'primary' | 'offhand'>(null)
  const [dwOn, setDwOn]               = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const isUnarmedSel = selectedWeapon?.id === '__unarmed__'
  const selRef       = selectedWeapon && !isUnarmedSel ? refWeaponMap[selectedWeapon.weapon_key] : null
  const selName      = !selectedWeapon
    ? 'Choose a weapon'
    : isUnarmedSel ? 'Unarmed / Brawl' : (selectedWeapon.custom_name || selRef?.name || 'Weapon')


  // Off-hand candidates come straight from the 1a eligibility function — the
  // picker is a presentation of that list, never its own filter.
  const allEquipped     = weapons.filter(ww => ww.equip_state === 'equipped' || ww.is_equipped)
  const dualCandidates  = selectedWeapon && onDualWieldSelect
    ? findDualWieldCandidates(selectedWeapon, allEquipped, refWeaponMap)
    : []
  const offHand         = selectedWeapon && dwOn ? dualCandidates.find(c => c.id === offHandId) ?? null : null

  // Scroll the current selection into view whenever a picker opens.
  useEffect(() => {
    if (!pickerOpen) return
    const el = scrollRef.current?.querySelector('[data-selected="true"]')
    if (el) (el as HTMLElement).scrollIntoView({ block: 'nearest' })
  }, [pickerOpen])

  function choosePrimary(w: CharacterWeapon, isStowed: boolean) {
    if (isStowed) { setManeuverWarningFor(w.id); return }
    setPickerOpen(null)
    onSelect(selectedWeapon?.id === w.id ? null : w)
  }

  function chooseOffHand(c: CharacterWeapon) {
    setPickerOpen(null)
    setOffHandId(c.id)
    // Existing handler, existing flow — this still routes into dualWieldReview.
    onDualWieldSelect!(selectedWeapon!, c)
  }

  // Unarmed is a permanent final row — always offered, never filtered out,
  // including under a ranged attack type (picking it flips the check to
  // melee in handleWeaponSelect).
  const showUnarmed = true

  return (
    <div>
      {/* ── Current weapon chip ─────────────────────────────────────────────── */}
      <button
        type="button"
        className="fc-chip"
        onClick={() => setPickerOpen(pickerOpen === 'primary' ? null : 'primary')}
      >
        <span className="fc-chip-icon">⌖</span>
        <span className="fc-chip-meta">
          <span className="fc-chip-name">{selName}</span>
          <span className="fc-chip-stats">{statLineFor(selectedWeapon, refWeaponMap)}</span>
        </span>
        <span className="fc-chip-swap">{pickerOpen === 'primary' ? 'Close ▴' : 'Swap ▾'}</span>
      </button>

      {/* ── Picker — same component for primary and off-hand ────────────────── */}
      {pickerOpen && (
        <div className="fc-picker">
          <div className="fc-picker-scroll" ref={scrollRef}>
            {pickerOpen === 'offhand' ? (
              dualCandidates.length > 0 ? (
                <>
                  <div className="fc-picker-group">Eligible Off-Hand</div>
                  {dualCandidates.map(c => (
                    <PickerRow
                      key={c.id}
                      refWeaponMap={refWeaponMap}
                      w={c}
                      isStowed={false}
                      selected={offHandId === c.id}
                      onPick={() => chooseOffHand(c)}
                    />
                  ))}
                </>
              ) : (
                <div className="fc-picker-group">No eligible off-hand weapon</div>
              )
            ) : (
              <>
                {/* Section order is 1a's: Equipped → Carried → Always Available. */}
                {equipped.length > 0 && <div className="fc-picker-group">Equipped</div>}
                {equipped.map(w => (
                  <PickerRow key={w.id} refWeaponMap={refWeaponMap} w={w} isStowed={false}
                    selected={selectedWeapon?.id === w.id}
                    onPick={() => choosePrimary(w, false)} />
                ))}
                {carried.length > 0 && <div className="fc-picker-group">Carried</div>}
                {carried.map(w => (
                  <PickerRow key={w.id} refWeaponMap={refWeaponMap} w={w} isStowed
                    selected={selectedWeapon?.id === w.id}
                    onPick={() => choosePrimary(w, true)} />
                ))}
                {showUnarmed && <div className="fc-picker-group">Always Available</div>}
                {showUnarmed && (
                  <PickerRow
                    refWeaponMap={refWeaponMap}
                    w={UNARMED_WEAPON as unknown as CharacterWeapon}
                    isStowed={false}
                    selected={isUnarmedSel}
                    onPick={() => choosePrimary(UNARMED_WEAPON as unknown as CharacterWeapon, false)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Stowed equip warning — unchanged flow, restyled shell ───────────── */}
      {maneuverWarningFor && (() => {
        const w = carried.find(c => c.id === maneuverWarningFor)
        if (!w) return null
        const nm = w.custom_name || refWeaponMap[w.weapon_key]?.name || 'Weapon'
        return (
          <div className="fc-note" role="alert">
            <b>⚠ Equipping costs a Maneuver</b>
            <div>Equipping {nm} will use one of your maneuvers this turn.</div>
            <div className="fc-mod-row">
              <button type="button" className="fc-mod-btn" onClick={() => setManeuverWarningFor(null)}>
                Cancel
              </button>
              <button type="button" className="fc-mod-btn is-on" disabled={equipping}
                onClick={() => void equipWeapon(w)}>
                {equipping ? 'Equipping…' : 'Equip'}
              </button>
            </div>
          </div>
        )
      })()}

      {/* ── Two-Weapon Attack ───────────────────────────────────────────────── */}
      {selectedWeapon && onDualWieldSelect && dualCandidates.length > 0 && (
        <>
          <button
            type="button"
            className={`fc-dw-toggle${dwOn ? ' is-on' : ''}`}
            onClick={() => { setDwOn(v => !v); setPickerOpen(null) }}
          >
            <span className="fc-dw-box">✓</span> Two-Weapon Attack
          </button>

          {dwOn && (
            <>
              <div className="fc-dw-slots">
                <div className="fc-dw-slot is-filled">
                  <div className="fc-dw-slot-label">Primary</div>
                  <div className="fc-dw-slot-weap">{selName}</div>
                </div>
                <div className="fc-dw-link" aria-hidden>⇄</div>
                <button
                  type="button"
                  className={`fc-dw-slot${offHand ? ' is-filled' : ''}`}
                  onClick={() => setPickerOpen(pickerOpen === 'offhand' ? null : 'offhand')}
                >
                  <div className="fc-dw-slot-label">Off-Hand</div>
                  {offHand
                    ? <div className="fc-dw-slot-weap">{offHand.custom_name || refWeaponMap[offHand.weapon_key]?.name || 'Secondary'}</div>
                    : <div className="fc-dw-slot-hint">Tap to choose</div>}
                </button>
              </div>
              {/* Rule text lifted verbatim from DualWieldReviewStep — not invented. */}
              <div className="fc-dw-rule">
                Combined check uses lower skill rank and lower characteristic.{' '}
                {offHand
                  ? (refWeaponMap[selectedWeapon.weapon_key]?.skill_key === refWeaponMap[offHand.weapon_key]?.skill_key
                      ? <>Difficulty <b>+1</b> (same skill).</>
                      : <>Difficulty <b>+2</b> (different skills).</>)
                  : <>Difficulty <b>+1</b> same skill, <b>+2</b> different skills.</>}
                <br />
                Primary hits on success; secondary hits by spending <b>2 Advantage</b> or <b>Triumph</b>.
              </div>
            </>
          )}
        </>
      )}

      {/* ── Maneuvers — existing handlers and enable conditions, restyled ───── */}
      {selectedWeapon && maneuvers && (
        <div className="fc-mod-row">
          <button
            type="button"
            className={`fc-mod-btn${maneuvers.aim1 ? ' is-on' : ''}`}
            onClick={maneuvers.onToggleAim1}
          >
            Aim<small>+1 Boost</small>
          </button>
          <button
            type="button"
            className={`fc-mod-btn${maneuvers.aim2 ? ' is-on' : ''}`}
            onClick={maneuvers.onToggleAim2}
            disabled={!maneuvers.aim1}
          >
            2nd Aim<small>+1 Boost</small>
          </button>
          <button
            type="button"
            className={`fc-mod-btn${maneuvers.assist ? ' is-on' : ''}`}
            onClick={maneuvers.onToggleAssist}
          >
            Assist<small>+1 Boost</small>
          </button>
          {isMeleeSel && (
            <button
              type="button"
              className={`fc-mod-btn${maneuvers.guarded ? ' is-on is-neg' : ''}`}
              onClick={maneuvers.onToggleGuarded}
            >
              Guarded<small>+1 Setback</small>
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasAnyWeapon && (
        <div className="fc-note">
          No {attackType === 'ranged' ? 'ranged' : attackType === 'melee' ? 'melee' : ''} weapons found.
          Add weapons to your inventory to make combat checks.
        </div>
      )}
    </div>
  )
}
