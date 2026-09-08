'use client'

import { useState } from 'react'
import type { Character, CharacterWeapon, CharacterSkill, RefWeapon, RefSkill, RefWeaponQuality } from '@/lib/types'
import { isRangedSkill, isMeleeSkill } from '@/lib/combatCheckUtils'
import { canDualWield } from '@/lib/weaponHandedness'
import { RichText } from '@/components/ui/RichText'
import type { DualWieldState } from './MobileCombatCheck'

const UNARMED_WEAPON: CharacterWeapon & { _isUnarmed: true } = {
  id: '__unarmed__', character_id: '', weapon_key: '__unarmed__',
  custom_name: 'Unarmed / Brawl', is_equipped: true, equip_state: 'equipped',
  attachments: [], notes: '', _isUnarmed: true,
}

const NON_QUALITY_KEYS = new Set(['STAGGER'])

/** Exported for reuse anywhere a weapon's qualities need filtering — the
 *  Gear destination's detail sheet (Prompt 4a) reuses this, not a second
 *  filter. STAGGER excluded (a Concussive-inflicted condition, not a real
 *  weapon quality); `Array.isArray` guards the qualities field (at least
 *  one weapon stores `{}` rather than `[]`). */
export function displayableQualities(ref: RefWeapon | null | undefined, refWeaponQualityMap: Record<string, RefWeaponQuality>) {
  if (!ref || !Array.isArray(ref.qualities)) return []
  return ref.qualities.filter(q => !NON_QUALITY_KEYS.has(q.key) && !!refWeaponQualityMap[q.key]?.description)
}

/**
 * Tap-accessible weapon quality chips — extracted so the Gear destination's
 * item detail sheet (Prompt 4a) can reuse the exact same component instead
 * of building a second implementation. `QualityBadge` (desktop) is not
 * reusable here: it unconditionally wraps its content in `Tooltip.tsx`'s
 * hover-only trigger, which has no tap path (see Prompt 3a's Step 0 audit).
 * `idPrefix` namespaces the open/closed state across multiple rows sharing
 * quality keys (e.g. two identical weapons in a list).
 */
export function MobileQualityChips({
  qualities, refWeaponQualityMap, idPrefix,
}: {
  qualities: { key: string; count?: number | null }[]
  refWeaponQualityMap: Record<string, RefWeaponQuality>
  idPrefix: string
}) {
  const [openQualityKey, setOpenQualityKey] = useState<string | null>(null)
  if (qualities.length === 0) return null
  return (
    <div className="m-weapon-qualities" onClick={e => e.stopPropagation()}>
      {qualities.map(q => {
        const qref = refWeaponQualityMap[q.key]
        const id = `${idPrefix}-${q.key}`
        const isOpen = openQualityKey === id
        const label = q.count != null ? `${qref?.name ?? q.key} ${q.count}` : (qref?.name ?? q.key)
        return (
          <button
            key={q.key}
            type="button"
            className={`m-quality-chip${isOpen ? ' is-open' : ''}`}
            onClick={() => setOpenQualityKey(isOpen ? null : id)}
          >
            {label}
          </button>
        )
      })}
      {qualities.map(q => {
        const qref = refWeaponQualityMap[q.key]
        const id = `${idPrefix}-${q.key}`
        if (openQualityKey !== id || !qref?.description) return null
        return (
          <div key={`${q.key}-desc`} className="m-quality-desc">
            <RichText text={qref.description} />
          </div>
        )
      })}
    </div>
  )
}

/**
 * Mobile-local equivalent of WeaponSelectStep.tsx's module-private
 * `findDualWieldCandidates` (desktop file, off-limits to modify, and the
 * function itself is never exported) — composes only the already-pure
 * `canDualWield`/`isRangedSkill` with the same instance-id-based filtering,
 * no dice/difficulty maths of its own.
 */
function findDualWieldCandidates(
  selected: CharacterWeapon,
  allEquipped: CharacterWeapon[],
  refWeaponMap: Record<string, RefWeapon>,
): CharacterWeapon[] {
  if (selected.id === '__unarmed__') return []
  const selectedRef = refWeaponMap[selected.weapon_key]
  if (!selectedRef) return []
  if (!canDualWield({ skill_key: selectedRef.skill_key, weapon_key: selected.weapon_key, is_one_handed_override: selected.is_one_handed_override, is_two_handed_override: selected.is_two_handed_override })) return []
  const selectedIsRanged = isRangedSkill(selectedRef.skill_key)
  return allEquipped
    .filter(w => w.id !== selected.id && w.id !== '__unarmed__')
    .filter(w => {
      const ref = refWeaponMap[w.weapon_key]
      if (!ref) return false
      if (isRangedSkill(ref.skill_key) !== selectedIsRanged) return false
      return canDualWield({ skill_key: ref.skill_key, weapon_key: w.weapon_key, is_one_handed_override: w.is_one_handed_override, is_two_handed_override: w.is_two_handed_override })
    })
}

function weaponLabel(w: CharacterWeapon, refWeaponMap: Record<string, RefWeapon>): string {
  if (w.id === '__unarmed__') return 'Unarmed / Brawl'
  return w.custom_name || refWeaponMap[w.weapon_key]?.name || 'Weapon'
}

function statLine(w: CharacterWeapon, refWeaponMap: Record<string, RefWeapon>, refSkillMap: Record<string, RefSkill>, charSkills: CharacterSkill[]): string {
  if (w.id === '__unarmed__') {
    const rank = charSkills.find(s => s.skill_key === 'BRAWL')?.rank ?? 0
    return `Brawl Rank ${rank} · DMG Brawn · CRIT 5`
  }
  const ref = refWeaponMap[w.weapon_key]
  if (!ref) return '—'
  const skillName = refSkillMap[ref.skill_key]?.name ?? ref.skill_key
  const rank = charSkills.find(s => s.skill_key === ref.skill_key)?.rank ?? 0
  const dmg = ref.damage_add != null ? `+${ref.damage_add}` : `${ref.damage}`
  return `${skillName} Rank ${rank} · DMG ${dmg} · CRIT ${ref.crit}`
}

interface MobileWeaponStepProps {
  attackType: 'ranged' | 'melee' | null
  character: Character
  weapons: CharacterWeapon[]
  refWeaponMap: Record<string, RefWeapon>
  refSkillMap: Record<string, RefSkill>
  refWeaponQualityMap: Record<string, RefWeaponQuality>
  charSkills: CharacterSkill[]
  selectedWeapon: CharacterWeapon | null
  onSelect: (w: CharacterWeapon) => void
  dualWield: DualWieldState | null
  onDualWieldChange: (dw: DualWieldState | null) => void
  /** Equips a stowed/carried weapon — same write shape as desktop's
      handleEquipWeapon (character_weapons.is_equipped/equip_state). */
  onEquipWeapon: (weaponId: string, idsToUnequip: string[]) => Promise<void>
}

type FilterKey = 'all' | 'ranged' | 'melee'

export function MobileWeaponStep({
  attackType, character, weapons, refWeaponMap, refSkillMap, refWeaponQualityMap, charSkills,
  selectedWeapon, onSelect, dualWield, onDualWieldChange, onEquipWeapon,
}: MobileWeaponStepProps) {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [dwPickerOpen, setDwPickerOpen] = useState(false)
  const [maneuverWarningFor, setManeuverWarningFor] = useState<string | null>(null)
  const [equipping, setEquipping] = useState(false)

  const allEquipped = weapons.filter(w => w.equip_state === 'equipped' || w.is_equipped)
  const carried = weapons.filter(w => w.equip_state === 'carrying' && !w.is_equipped)
  const rows: CharacterWeapon[] = [...allEquipped, ...carried, UNARMED_WEAPON]

  async function equipAndSelect(w: CharacterWeapon) {
    setEquipping(true)
    const idsToUnequip = allEquipped.filter(e => e.id !== w.id).map(e => e.id)
    await onEquipWeapon(w.id, idsToUnequip)
    setEquipping(false)
    setManeuverWarningFor(null)
    onSelect(w)
  }

  function handleRowTap(w: CharacterWeapon) {
    const isCarried = carried.some(c => c.id === w.id)
    if (isCarried) { setManeuverWarningFor(w.id); return }
    onSelect(w)
  }

  function weaponType(w: CharacterWeapon): 'ranged' | 'melee' | null {
    if (w.id === '__unarmed__') return 'melee'
    const ref = refWeaponMap[w.weapon_key]
    if (!ref?.skill_key) return null
    return isRangedSkill(ref.skill_key) ? 'ranged' : (isMeleeSkill(ref.skill_key) ? 'melee' : null)
  }

  const filteredRows = filter === 'all' ? rows : rows.filter(w => weaponType(w) === filter)

  const dwCandidates = selectedWeapon ? findDualWieldCandidates(selectedWeapon, allEquipped, refWeaponMap) : []
  const dwDisabledReason = !selectedWeapon
    ? 'Choose a weapon first'
    : selectedWeapon.id === '__unarmed__'
      ? 'Unarmed cannot be dual-wielded'
      : dwCandidates.length === 0
        ? 'Needs a second one-handed weapon equipped'
        : null

  function toggleDualWield() {
    if (dwDisabledReason) return
    if (dualWield?.enabled) {
      onDualWieldChange(null)
      setDwPickerOpen(false)
    } else {
      setDwPickerOpen(true)
    }
  }

  function pickSecondary(secondary: CharacterWeapon) {
    if (!selectedWeapon) return
    onDualWieldChange({ enabled: true, primaryWeapon: selectedWeapon, secondaryWeapon: secondary })
    setDwPickerOpen(false)
  }

  function swapDualWield() {
    if (!dualWield) return
    onDualWieldChange({ enabled: true, primaryWeapon: dualWield.secondaryWeapon, secondaryWeapon: dualWield.primaryWeapon })
  }

  const primaryRef = dualWield ? refWeaponMap[dualWield.primaryWeapon.weapon_key] : null
  const secondaryRef = dualWield ? refWeaponMap[dualWield.secondaryWeapon.weapon_key] : null
  const sameSkill = !!primaryRef && !!secondaryRef && primaryRef.skill_key === secondaryRef.skill_key

  return (
    <div>
      <div className="m-filter-row">
        {(['all', 'ranged', 'melee'] as FilterKey[]).map(f => (
          <button key={f} type="button" className={`m-chip${filter === f ? ' is-active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'ranged' ? 'Ranged' : 'Melee'}
          </button>
        ))}
      </div>

      {filteredRows.map(w => {
        const ref = w.id === '__unarmed__' ? null : refWeaponMap[w.weapon_key]
        const qualities = displayableQualities(ref, refWeaponQualityMap)
        const selected = selectedWeapon?.id === w.id
        const isCarried = carried.some(c => c.id === w.id)
        return (
          <div key={w.id} className={`m-weapon-row${selected ? ' is-selected' : ''}`} onClick={() => handleRowTap(w)} role="button" tabIndex={0}>
            <div className="m-weapon-row-top">
              <span className="m-weapon-name">{weaponLabel(w, refWeaponMap)}{isCarried ? ' (carried)' : ''}</span>
            </div>
            <span className="m-weapon-stats">{statLine(w, refWeaponMap, refSkillMap, charSkills)}</span>
            <MobileQualityChips qualities={qualities} refWeaponQualityMap={refWeaponQualityMap} idPrefix={w.id} />
          </div>
        )
      })}

      {maneuverWarningFor && (() => {
        const w = carried.find(c => c.id === maneuverWarningFor)
        if (!w) return null
        return (
          <div className="m-dw-panel" role="alert">
            <div className="m-dw-card-label">⚠ Equipping costs a Maneuver</div>
            <div className="m-weapon-stats">Equipping {weaponLabel(w, refWeaponMap)} will use one of your maneuvers this turn.</div>
            <div className="m-cr-actions">
              <button type="button" className="m-sheet-btn" onClick={() => setManeuverWarningFor(null)}>Cancel</button>
              <button type="button" className="m-sheet-btn is-primary" disabled={equipping} onClick={() => void equipAndSelect(w)}>
                {equipping ? 'Equipping…' : 'Equip'}
              </button>
            </div>
          </div>
        )
      })()}

      {/* ── Dual wield — inline, this step, not a separate review step ────── */}
      <div className="m-dw-toggle-row">
        <div>
          <div className="m-dw-toggle-label">Dual Wield Attack</div>
          {dwDisabledReason && <div className="m-dw-toggle-reason">{dwDisabledReason}</div>}
        </div>
        <button
          type="button"
          className={`m-dw-switch${dualWield?.enabled ? ' is-on' : ''}`}
          disabled={!!dwDisabledReason}
          onClick={toggleDualWield}
          aria-pressed={!!dualWield?.enabled}
          aria-label="Toggle dual wield"
        >
          <span className="m-dw-switch-knob" />
        </button>
      </div>

      {dwPickerOpen && !dualWield?.enabled && (
        <div className="m-dw-panel">
          <div className="m-dw-card-label">Choose off-hand</div>
          {dwCandidates.map(c => (
            <div key={c.id} className="m-weapon-row" onClick={() => pickSecondary(c)} role="button" tabIndex={0}>
              <span className="m-weapon-name">{weaponLabel(c, refWeaponMap)}</span>
              <span className="m-weapon-stats">{statLine(c, refWeaponMap, refSkillMap, charSkills)}</span>
            </div>
          ))}
        </div>
      )}

      {dualWield?.enabled && primaryRef !== undefined && (
        <div className="m-dw-panel">
          <div className="m-dw-cards">
            <div className="m-dw-card is-primary">
              <div className="m-dw-card-label">Primary</div>
              <div className="m-dw-card-name">{weaponLabel(dualWield.primaryWeapon, refWeaponMap)}</div>
            </div>
            <button type="button" className="m-dw-swap-btn" onClick={swapDualWield} aria-label="Swap primary and secondary">⇄</button>
            <div className="m-dw-card">
              <div className="m-dw-card-label">Secondary</div>
              <div className="m-dw-card-name">{weaponLabel(dualWield.secondaryWeapon, refWeaponMap)}</div>
            </div>
          </div>
          <div className="m-dw-rule">
            Combined check uses the lower skill rank and the lower characteristic of the two weapons.{' '}
            {sameSkill ? 'Difficulty +1 (same skill).' : 'Difficulty +2 (different skills).'}
          </div>
        </div>
      )}
    </div>
  )
}
