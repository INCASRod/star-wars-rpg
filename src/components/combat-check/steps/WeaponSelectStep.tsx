'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WeaponDamageDisplay, isMeleeSkill } from '@/components/character/WeaponDamageDisplay'
import { QualityBadge } from '@/components/character/QualityBadge'
import type { CharacterWeapon, RefWeapon, RefSkill, RefWeaponQuality, Character } from '@/lib/types'
import { getSkillPool } from '@/components/player-hud/dice-engine'
import { CHAR_FIELD_MAP, isRangedSkill, isMeleeSkill as isMeleeSkillKey } from '@/lib/combatCheckUtils'
import { RANGE_LABELS } from '@/lib/types'
import { canDualWield } from '@/lib/weaponHandedness'

// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD      = '#C8AA50'
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.15)'
const TEXT      = 'rgba(255,255,255,0.85)'
const TEXT_DIM  = 'rgba(255,255,255,0.5)'
const CARD_BG   = 'rgba(255,255,255,0.03)'
const RED_SOFT  = '#e05252'
const ORANGE    = '#FF9800'
const FONT_C    = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono', 'Courier New', monospace"

interface WeaponSelectStepProps {
  attackType:         'ranged' | 'melee'
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

  // Find one-handed partners that are the same attack type (both ranged or both melee).
  // Weapons of the opposite type (e.g. a blaster when looking for a melee partner)
  // are ignored so they don't block dual-wield detection.
  const selectedIsRanged = isRangedSkill(selectedRef.skill_key)
  const candidates = allEquippedWeapons
    .filter(w => w.id !== selectedWeapon.id)
    .filter(w => {
      const ref = refWeaponMap[w.weapon_key]
      if (!ref) return false
      if (isRangedSkill(ref.skill_key) !== selectedIsRanged) return false
      return canDualWield({ skill_key: ref.skill_key, weapon_key: w.weapon_key, is_one_handed_override: w.is_one_handed_override, is_two_handed_override: w.is_two_handed_override })
    })

  // Exactly one same-type one-handed partner = valid dual-wield loadout
  if (candidates.length !== 1) return null
  return candidates[0]
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: FONT_C,
      fontSize: 'clamp(0.58rem, 0.9vw, 0.68rem)',
      fontWeight: 700,
      color: GOLD_DIM,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      margin: '12px 0 6px',
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
  onDualWieldSelect,
}: WeaponSelectStepProps) {
  const [maneuverWarningFor, setManeuverWarningFor] = useState<string | null>(null)
  const [equipping, setEquipping] = useState(false)

  const skillMap = Object.fromEntries(charSkills.map(s => [s.skill_key, s]))

  function weaponMatchesType(w: CharacterWeapon): boolean {
    const ref = refWeaponMap[w.weapon_key]
    if (!ref?.skill_key) return false
    if (attackType === 'ranged') return isRangedSkill(ref.skill_key)
    return isMeleeSkillKey(ref.skill_key)
  }

  const matchingWeapons = weapons.filter(weaponMatchesType)
  const equipped  = matchingWeapons.filter(w => w.equip_state === 'equipped' || w.is_equipped)
  const stowed    = matchingWeapons.filter(w => w.equip_state !== 'equipped' && !w.is_equipped)

  function getPool(w: CharacterWeapon) {
    if ((w as typeof UNARMED_WEAPON)._isUnarmed) {
      const rank = skillMap['BRAWL']?.rank ?? 0
      return getSkillPool(character.brawn, rank)
    }
    const ref  = refWeaponMap[w.weapon_key]
    const skill = ref?.skill_key ? refSkillMap[ref.skill_key] : null
    const charKey = skill?.characteristic_key
    const charVal = charKey ? ((character[CHAR_FIELD_MAP[charKey] as keyof Character] as number) ?? 0) : 0
    const rank = ref?.skill_key ? (skillMap[ref.skill_key]?.rank ?? 0) : 0
    return getSkillPool(charVal, rank)
  }

  async function equipWeapon(w: CharacterWeapon) {
    setEquipping(true)
    const supabase = createClient()

    // Unequip any currently equipped weapon of the same skill type
    const toUnequip = equipped.filter(e => e.id !== w.id)
    for (const e of toUnequip) {
      await supabase
        .from('character_weapons')
        .update({ is_equipped: false, equip_state: 'stowed' })
        .eq('id', e.id)
    }

    // Equip this weapon
    await supabase
      .from('character_weapons')
      .update({ is_equipped: true, equip_state: 'equipped' })
      .eq('id', w.id)

    setEquipping(false)
    setManeuverWarningFor(null)
    onSelect(w)
    onNext()
  }

  function renderWeaponCard(w: CharacterWeapon, isStowed = false) {
    const isUnarmed = (w as typeof UNARMED_WEAPON)._isUnarmed
    const ref  = isUnarmed ? null : refWeaponMap[w.weapon_key]
    const skill = ref?.skill_key ? refSkillMap[ref.skill_key] : null
    const name = isUnarmed ? 'Unarmed / Brawl' : (w.custom_name || ref?.name || 'Weapon')
    const isSelected = selectedWeapon?.id === w.id
    const showWarning = maneuverWarningFor === w.id

    const { proficiency, ability } = getPool(w)

    const isRangedType = ref?.skill_key ? isRangedSkill(ref.skill_key) : false
    // A melee weapon is only brawn-scaled when damage_add is explicitly set;
    // fixed-damage melee weapons (e.g. lightsabers) have damage_add == null.
    const hasBrawnScale = !isRangedType && ref?.damage_add != null
    const baseDmg = hasBrawnScale ? (ref?.damage_add ?? 0) : (ref?.damage ?? 0)
    const isMelee = hasBrawnScale

    return (
      <div key={w.id}>
        <button
          onClick={() => {
            if (isStowed && !showWarning) {
              setManeuverWarningFor(w.id)
              return
            }
            if (!isStowed) {
              onSelect(isSelected ? null : w)
            }
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: isSelected ? 'rgba(200,170,80,0.06)' : CARD_BG,
            border: `${isSelected ? 2 : 1}px solid ${isSelected ? GOLD : GOLD_BD}`,
            borderRadius: 8,
            cursor: 'pointer',
            textAlign: 'left',
            opacity: isStowed ? 0.65 : 1,
            transition: 'border-color 120ms, background 120ms',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Name */}
              <div style={{
                fontFamily: FONT_C,
                fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)',
                fontWeight: 700,
                color: isSelected ? GOLD : TEXT,
                marginBottom: 4,
              }}>
                {name}
              </div>

              {/* Stats row */}
              <div style={{
                fontFamily: FONT_M,
                fontSize: 'clamp(0.62rem, 0.95vw, 0.75rem)',
                color: TEXT_DIM,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2px 10px',
                marginBottom: ref?.qualities?.length ? 6 : 0,
              }}>
                {skill && <span>{skill.name}</span>}
                {!isUnarmed && ref && (
                  <span style={{ color: '#E07855' }}>
                    DMG <WeaponDamageDisplay
                      baseDamage={baseDmg}
                      isMelee={isMelee}
                      brawn={character.brawn}
                    />
                  </span>
                )}
                {isUnarmed && <span style={{ color: '#E07855' }}>DMG +0+Br</span>}
                {!isUnarmed && ref && ref.crit > 0 && (
                  <span style={{ color: '#E05050' }}>CRIT {ref.crit}</span>
                )}
                {isUnarmed && <span style={{ color: '#E05050' }}>CRIT 5</span>}
                {!isUnarmed && ref?.range_value && (
                  <span>{RANGE_LABELS[ref.range_value] ?? ref.range_value}</span>
                )}
                {isUnarmed && <span>Engaged</span>}
              </div>

              {/* Qualities */}
              {!isUnarmed && ref?.qualities && ref.qualities.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {ref.qualities.map((q, i) => (
                    <QualityBadge key={i} quality={q} refQualityMap={refWeaponQualityMap} variant="desktop" />
                  ))}
                </div>
              )}
            </div>

            {/* Dice pool preview */}
            <div style={{ display: 'flex', gap: 2, flexShrink: 0, alignItems: 'center' }}>
              {Array.from({ length: proficiency }).map((_, i) => (
                <div key={`p${i}`} style={{
                  width: 12, height: 12, background: '#F5C518',
                  clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
                }} />
              ))}
              {Array.from({ length: ability }).map((_, i) => (
                <div key={`a${i}`} style={{
                  width: 12, height: 12, background: '#4CAF50',
                  transform: 'rotate(45deg)',
                }} />
              ))}
            </div>

            {isSelected && (
              <div style={{
                fontFamily: FONT_M,
                fontSize: 'clamp(0.55rem, 0.82vw, 0.65rem)',
                color: GOLD,
                flexShrink: 0,
                paddingLeft: 6,
              }}>
                ✓ SELECTED
              </div>
            )}
          </div>
        </button>

        {/* Maneuver warning (inline expansion for stowed weapons) */}
        {showWarning && (
          <div style={{
            background: 'rgba(255,152,0,0.06)',
            border: `1px solid ${ORANGE}50`,
            borderRadius: '0 0 8px 8px',
            borderTop: 'none',
            padding: '12px 14px',
          }}>
            <div style={{
              fontFamily: FONT_R,
              fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)',
              color: ORANGE,
              marginBottom: 8,
              fontWeight: 700,
            }}>
              ⚠ Equipping costs a Maneuver
            </div>
            <div style={{
              fontFamily: FONT_R,
              fontSize: 'clamp(0.7rem, 1.05vw, 0.82rem)',
              color: TEXT_DIM,
              marginBottom: 12,
              lineHeight: 1.4,
            }}>
              Equipping <strong style={{ color: TEXT }}>{name}</strong> will use one of your
              maneuvers this turn. You may pay for an extra maneuver by suffering 2 strain.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setManeuverWarningFor(null)}
                style={{
                  flex: 1, padding: '8px 0',
                  background: 'transparent',
                  border: `1px solid rgba(255,255,255,0.15)`,
                  borderRadius: 6, cursor: 'pointer',
                  fontFamily: FONT_C,
                  fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
                  color: TEXT_DIM,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => equipWeapon(w)}
                disabled={equipping}
                style={{
                  flex: 2, padding: '8px 0',
                  background: equipping ? 'rgba(200,170,80,0.15)' : 'rgba(200,170,80,0.15)',
                  border: `1px solid ${GOLD}60`,
                  borderRadius: 6, cursor: equipping ? 'wait' : 'pointer',
                  fontFamily: FONT_C,
                  fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
                  color: GOLD,
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

  const hasAnyWeapon = matchingWeapons.length > 0 || attackType === 'melee'

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Unarmed option (melee only) */}
      {attackType === 'melee' && (
        <>
          <SectionLabel text="Always Available" />
          {renderWeaponCard(UNARMED_WEAPON as unknown as CharacterWeapon)}
        </>
      )}

      {/* Equipped weapons */}
      {equipped.length > 0 && (
        <>
          <SectionLabel text="Equipped" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {equipped.map(w => renderWeaponCard(w, false))}
          </div>
        </>
      )}

      {/* Stowed weapons */}
      {stowed.length > 0 && (
        <>
          <SectionLabel text="Stowed" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stowed.map(w => renderWeaponCard(w, true))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!hasAnyWeapon && (
        <div style={{
          padding: '40px 16px',
          textAlign: 'center',
          fontFamily: FONT_R,
          fontSize: 'clamp(0.8rem, 1.2vw, 0.92rem)',
          color: TEXT_DIM,
        }}>
          No {attackType === 'ranged' ? 'ranged' : 'melee'} weapons found.
          <br />
          Add weapons to your inventory to make combat checks.
        </div>
      )}

      {/* ── Dual Wield offer card ── */}
      {(() => {
        if (!selectedWeapon || !onDualWieldSelect) return null
        const allEquipped = weapons.filter(w => w.equip_state === 'equipped' || w.is_equipped)
        const partner = findDualWieldPartner(selectedWeapon, allEquipped, refWeaponMap)
        if (!partner) return null
        const partnerRef = refWeaponMap[partner.weapon_key]
        const partnerSkillName = partnerRef?.skill_key
          ? (refSkillMap[partnerRef.skill_key]?.name ?? partnerRef.skill_key)
          : 'Unknown'
        const partnerName = partner.custom_name || partnerRef?.name || 'Weapon'
        return (
          <div style={{
            marginTop: 16,
            background: 'rgba(200,170,80,0.06)',
            border: '1px solid rgba(200,170,80,0.3)',
            borderRadius: 10,
            padding: '14px 16px',
          }}>
            <div style={{
              fontFamily: "var(--font-cinzel), 'Cinzel', serif",
              fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
              fontWeight: 700,
              color: GOLD,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              ⚔⚔  Dual Wield Available
            </div>
            <div style={{
              fontFamily: FONT_R,
              fontSize: 'clamp(0.8rem, 1.2vw, 0.92rem)',
              color: 'rgba(232,223,200,0.75)',
              lineHeight: 1.4,
              marginBottom: 14,
            }}>
              You also have <strong style={{ color: 'rgba(232,223,200,0.9)' }}>{partnerName}</strong> equipped ({partnerSkillName}).
              <br />
              Would you like to attack with both weapons?
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onNext}
                style={{
                  flex: 1, padding: '9px 0',
                  background: 'transparent',
                  border: '1px solid rgba(200,170,80,0.2)',
                  borderRadius: 8, cursor: 'pointer',
                  fontFamily: FONT_R,
                  fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
                  color: TEXT_DIM,
                }}
              >
                Single Weapon Attack
              </button>
              <button
                onClick={() => onDualWieldSelect(selectedWeapon, partner)}
                style={{
                  flex: 2, padding: '9px 0',
                  background: 'linear-gradient(135deg, #C8AA50, #8B7430)',
                  border: 'none',
                  borderRadius: 8, cursor: 'pointer',
                  fontFamily: "var(--font-cinzel), 'Cinzel', serif",
                  fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
                  fontWeight: 700,
                  color: '#060D09',
                  letterSpacing: '0.08em',
                }}
              >
                Dual Wield Attack
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
