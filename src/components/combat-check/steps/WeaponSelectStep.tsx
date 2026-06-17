'use client'

import { useState } from 'react'
import type { CharacterWeapon, RefWeapon, RefSkill, RefWeaponQuality, Character } from '@/lib/types'
import { isRangedSkill, isMeleeSkill as isMeleeSkillKey } from '@/lib/combatCheckUtils'
import { canDualWield } from '@/lib/weaponHandedness'
import { HUD, FS, FONT_BODY, FONT_DISPLAY, SP, EASE, RADIUS } from '@/lib/tokens'

const CAUTION = 'color-mix(in srgb, var(--state-caution, #FF9800) 100%, transparent)'

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
}

// ── Dual wield detection ──────────────────────────────────────────────────────
function findDualWieldPartner(
  selectedWeapon: CharacterWeapon,
  allEquippedWeapons: CharacterWeapon[],
  refWeaponMap: Record<string, RefWeapon>,
): CharacterWeapon | null {
  const selectedRef = refWeaponMap[selectedWeapon.weapon_key]
  if (!selectedRef) return null
  if (!canDualWield({ skill_key: selectedRef.skill_key, weapon_key: selectedWeapon.weapon_key, is_one_handed_override: selectedWeapon.is_one_handed_override, is_two_handed_override: selectedWeapon.is_two_handed_override })) return null

  const selectedIsRanged = isRangedSkill(selectedRef.skill_key)
  const candidates = allEquippedWeapons
    .filter(w => w.id !== selectedWeapon.id)
    .filter(w => {
      const ref = refWeaponMap[w.weapon_key]
      if (!ref) return false
      if (isRangedSkill(ref.skill_key) !== selectedIsRanged) return false
      return canDualWield({ skill_key: ref.skill_key, weapon_key: w.weapon_key, is_one_handed_override: w.is_one_handed_override, is_two_handed_override: w.is_two_handed_override })
    })

  if (candidates.length !== 1) return null
  return candidates[0]
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily:    FONT_BODY,
      fontSize:      FS.overline,
      fontWeight:    700,
      color:         'var(--hud-text-faint)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.18em',
      marginBottom:  SP[1],
    }}>
      {text}
    </div>
  )
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
}: WeaponSelectStepProps) {
  const [maneuverWarningFor, setManeuverWarningFor] = useState<string | null>(null)
  const [equipping, setEquipping] = useState(false)

  function weaponMatchesType(w: CharacterWeapon): boolean {
    if (attackType === null) return true
    const ref = refWeaponMap[w.weapon_key]
    if (!ref?.skill_key) return false
    if (attackType === 'ranged') return isRangedSkill(ref.skill_key)
    return isMeleeSkillKey(ref.skill_key)
  }

  const matchingWeapons = weapons.filter(weaponMatchesType)
  const equipped = matchingWeapons.filter(w => w.equip_state === 'equipped' || w.is_equipped)
  const stowed   = matchingWeapons.filter(w => w.equip_state !== 'equipped' && !w.is_equipped)

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

  function renderWeaponPill(w: CharacterWeapon, isStowed = false) {
    const isUnarmed   = (w as typeof UNARMED_WEAPON)._isUnarmed
    const ref         = isUnarmed ? null : refWeaponMap[w.weapon_key]
    const name        = isUnarmed ? 'Unarmed / Brawl' : (w.custom_name || ref?.name || 'Weapon')
    const isSelected  = selectedWeapon?.id === w.id
    const showWarning = maneuverWarningFor === w.id
    const skillTag    = !isUnarmed && ref?.skill_key
      ? ref.skill_key.replace('RANGLT','RNG-L').replace('RANGHVY','RNG-H').replace('LTSABER','LT-SBR').replace('GUNN','GUNN').replace('BRAWL','BRAWL').replace('MELEE','MELEE')
      : null

    return (
      <div key={w.id} style={{ width: '100%' }}>
        <button
          onClick={() => {
            if (isStowed && !showWarning) { setManeuverWarningFor(w.id); return }
            if (!isStowed) onSelect(isSelected ? null : w)
          }}
          className="cc-weapon-card"
          style={{
            display:      'flex',
            flexDirection:'column' as const,
            gap:          2, /* name–stats gap */
            width:        '100%',
            textAlign:    'left' as const,
            padding:      `${SP[1]} ${SP[2]}`,
            borderTop:    `1px solid var(--hud-border)`,
            borderRight:  `1px solid var(--hud-border)`,
            borderBottom: `1px solid var(--hud-border)`,
            borderLeft:   isSelected
              ? `2px solid var(--hud-accent)`
              : `2px solid transparent`,
            background:   isSelected
              ? `color-mix(in srgb, var(--hud-accent) 6%, transparent)`
              : 'transparent',
            borderRadius: RADIUS.sm,
            cursor:       'pointer',
            opacity:      isSelected ? 1 : (isStowed ? 0.65 : 0.5),
          }}
        >
          <span style={{
            fontFamily: FONT_DISPLAY,
            fontSize:   FS.label,
            fontWeight: 700,
            color:      'var(--hud-text)',
          }}>
            {name}{isStowed ? ' (stowed)' : ''}
          </span>
          {!isUnarmed && ref && (
            <span style={{
              fontFamily: FONT_BODY,
              fontSize:   FS.overline,
              color:      'var(--hud-text-dim)',
              opacity:    0.6,
            }}>
              DMG {ref.damage_add != null ? `+${ref.damage_add}` : ref.damage}
              {ref.crit ? ` · CRIT ${ref.crit}` : ''}
              {skillTag ? (
                <>
                  {' · '}
                  <span style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize:   FS.overline,
                    fontWeight: 700,
                    border:     `1px solid color-mix(in srgb, var(--hud-gold) 50%, transparent)`,
                    padding:    `0 2px`, /* chip inset — 1px border exception context */
                    clipPath:   'polygon(2px 0%,calc(100% - 2px) 0%,100% 50%,calc(100% - 2px) 100%,2px 100%,0% 50%)',
                    opacity:    0.9,
                  }}>
                    {skillTag}
                  </span>
                </>
              ) : null}
            </span>
          )}
        </button>

        {/* Stowed equip warning — inline expansion */}
        {showWarning && (
          <div style={{
            background:   `color-mix(in srgb, var(--state-caution, #FF9800) 6%, transparent)`,
            border:       `1px solid color-mix(in srgb, var(--state-caution, #FF9800) 50%, transparent)`,
            borderRadius: RADIUS.md,
            padding:      `${SP[2]} ${SP[2]}`,
            marginTop:    SP[1],
          }}>
            <div style={{
              fontFamily:   FONT_BODY,
              fontSize:     FS.overline,
              color:        CAUTION,
              marginBottom: SP[1],
              fontWeight:   700,
            }}>
              ⚠ Equipping costs a Maneuver
            </div>
            <div style={{
              fontFamily:   FONT_BODY,
              fontSize:     FS.overline,
              color:        'var(--hud-text-dim)',
              marginBottom: SP[2],
              lineHeight:   1.4,
            }}>
              Equipping <strong style={{ color: 'var(--hud-text)' }}>{name}</strong> will use one of your maneuvers this turn.
            </div>
            <div style={{ display: 'flex', gap: SP[1] }}>
              <button
                onClick={() => setManeuverWarningFor(null)}
                style={{
                  flex:         1,
                  padding:      `2px ${SP[2]}`,
                  background:   'transparent',
                  border:       '1px solid var(--hud-border)',
                  borderRadius: RADIUS.sm,
                  cursor:       'pointer',
                  fontFamily:   FONT_BODY,
                  fontSize:     FS.overline,
                  color:        'var(--hud-text-dim)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => equipWeapon(w)}
                disabled={equipping}
                style={{
                  flex:         2,
                  padding:      `2px ${SP[2]}`,
                  background:   `color-mix(in srgb, var(--hud-gold) 10%, transparent)`,
                  border:       `1px solid color-mix(in srgb, var(--hud-gold) 38%, transparent)`,
                  borderRadius: RADIUS.sm,
                  cursor:       equipping ? 'wait' : 'pointer',
                  fontFamily:   FONT_BODY,
                  fontSize:     FS.overline,
                  color:        'var(--hud-gold)',
                }}
              >
                {equipping ? 'Equipping…' : 'Equip & Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const hasAnyWeapon = matchingWeapons.length > 0 || attackType === 'melee' || attackType === null

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Unarmed option (melee or all-weapons view) */}
      {(attackType === 'melee' || attackType === null) && (
        <>
          <SectionLabel text="Always Available" />
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: SP[1], marginBottom: SP[2] }}>
            {renderWeaponPill(UNARMED_WEAPON as unknown as CharacterWeapon)}
          </div>
        </>
      )}

      {/* Equipped weapons */}
      {equipped.length > 0 && (
        <>
          <SectionLabel text="Equipped" />
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: SP[1], marginBottom: SP[2] }}>
            {equipped.map(w => renderWeaponPill(w, false))}
          </div>
        </>
      )}

      {/* Stowed weapons */}
      {stowed.length > 0 && (
        <>
          <SectionLabel text="Stowed" />
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: SP[1], marginBottom: SP[2] }}>
            {stowed.map(w => renderWeaponPill(w, true))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!hasAnyWeapon && (
        <div style={{
          padding:    `${SP[4]} ${SP[4]}`,
          textAlign:  'center',
          fontFamily: FONT_BODY,
          fontSize:   FS.label,
          color:      'var(--hud-text-dim)',
        }}>
          No {attackType === 'ranged' ? 'ranged' : attackType === 'melee' ? 'melee' : ''} weapons found.
          <br />
          Add weapons to your inventory to make combat checks.
        </div>
      )}

      {/* Dual Wield compact button */}
      {(() => {
        if (!selectedWeapon || !onDualWieldSelect) return null
        const allEquipped = weapons.filter(w => w.equip_state === 'equipped' || w.is_equipped)
        const partner     = findDualWieldPartner(selectedWeapon, allEquipped, refWeaponMap)
        if (!partner) return null
        return (
          <div style={{ marginTop: SP[2] }}>
            <button
              onClick={() => onDualWieldSelect(selectedWeapon, partner)}
              style={{
                border:       `1px solid color-mix(in srgb, var(--hud-gold) 45%, transparent)`,
                background:   `color-mix(in srgb, var(--hud-gold) 10%, transparent)`,
                color:        'var(--hud-gold)',
                padding:      `2px ${SP[2]}`,
                fontSize:     FS.overline,
                fontWeight:   700,
                borderRadius: RADIUS.sm,
                cursor:       'pointer',
                fontFamily:   FONT_BODY,
                transition:   `border-color ${EASE.quick}, background ${EASE.quick}`,
                width:        'fit-content',
              }}
            >
              ⚔ Dual Wield available
            </button>
          </div>
        )
      })()}
    </div>
  )
}
