'use client'

import { useState } from 'react'
import { HudCard } from '../ui/HudCard'
import { Badge } from '../ui/Badge'
import { EquipmentImage } from '../ui/EquipmentImage'
import { removeBtnStyle } from '@/lib/styles'
import {
  getWeaponHandedness, canDualWield, validateLoadout,
  type WeaponForLoadout,
} from '@/lib/weaponHandedness'

export interface WeaponDisplay {
  id?: string
  name: string
  meta: string
  skill?: string
  range?: string
  qualities?: string
  damage: number
  crit: number
  icon: string
  itemKey?: string
  categories?: string[]
  equipped?: boolean
  encumbrance?: number
  // Equip-state cycle (for loadout validation)
  equip_state?: 'equipped' | 'carrying' | 'stowed'
  // Handedness detection fields
  skill_key?: string
  weapon_key?: string | null
  is_one_handed_override?: boolean | null
  is_two_handed_override?: boolean | null
}

interface WeaponsCardProps {
  weapons: WeaponDisplay[]
  animClass?: string
  onToggleEquipped?: (id: string) => void
  isGmMode?: boolean
  onRemoveWeapon?: (id: string) => void
  /** GM-only: bypass loadout validation and equip anyway */
  onForceEquip?: (id: string) => void
  /** GM-only: set handedness override for a weapon */
  onHandednessOverride?: (id: string, override: 'auto' | 'one' | 'two') => void
}

// ── Cycle helpers ─────────────────────────────────────────────────────────────
function cycleEquipState(current: string): 'equipped' | 'carrying' | 'stowed' {
  if (current === 'equipped') return 'carrying'
  if (current === 'carrying') return 'stowed'
  return 'equipped'
}

function wouldEquip(wpn: WeaponDisplay): boolean {
  const current = wpn.equip_state ?? (wpn.equipped ? 'equipped' : 'stowed')
  return cycleEquipState(current) === 'equipped'
}

// ── Loadout computation ───────────────────────────────────────────────────────
function buildLoadoutEntry(wpn: WeaponDisplay): WeaponForLoadout | null {
  if (!wpn.skill_key) return null
  return {
    id: wpn.id,
    name: wpn.name,
    skill_key: wpn.skill_key,
    weapon_key: wpn.weapon_key,
    is_one_handed_override: wpn.is_one_handed_override,
    is_two_handed_override: wpn.is_two_handed_override,
  }
}

// ── Block dialog ──────────────────────────────────────────────────────────────
interface BlockDialogState {
  reason: string
  weaponId: string
  weaponName: string
  currentEquippedNames: string[]
}

// ── Tokens (HudCard uses CSS vars, these are for the new modal) ───────────────
const AMBER     = '#FF9800'
const AMBER_BG  = 'rgba(255,152,0,0.06)'
const AMBER_BD  = 'rgba(255,152,0,0.45)'
const GOLD      = '#C8AA50'
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.15)'
const TEXT      = 'rgba(255,255,255,0.85)'
const TEXT_DIM  = 'rgba(255,255,255,0.5)'
const GREEN     = '#4CAF50'
const FONT_C    = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono', 'Courier New', monospace"

export function WeaponsCard({
  weapons, animClass = 'al d5', onToggleEquipped, isGmMode, onRemoveWeapon,
  onForceEquip, onHandednessOverride,
}: WeaponsCardProps) {
  const [blockDialog, setBlockDialog] = useState<BlockDialogState | null>(null)

  // ── Compute loadout status ────────────────────────────────────────────────
  const equippedWeapons = weapons.filter(w => w.equip_state === 'equipped' || w.equipped)
  const equippedEntries = equippedWeapons.map(buildLoadoutEntry).filter(Boolean) as WeaponForLoadout[]
  const loadoutValidation = validateLoadout(equippedEntries)
  const isDualWield = equippedWeapons.length === 2 && equippedEntries.every(w => canDualWield(w))

  // ── Equip click handler with validation ──────────────────────────────────
  function handleEquipClick(wpn: WeaponDisplay) {
    if (!wpn.id) return
    if (!wouldEquip(wpn)) {
      // Unequipping or cycling to carrying/stowed — no validation needed
      onToggleEquipped?.(wpn.id)
      return
    }

    // Would equip — validate
    const entry = buildLoadoutEntry(wpn)
    if (!entry) {
      // No skill_key to validate against, allow
      onToggleEquipped?.(wpn.id)
      return
    }

    const currentlyEquipped = equippedEntries.filter(e => e.id !== wpn.id)
    const validation = validateLoadout([...currentlyEquipped, entry])
    if (!validation.valid) {
      setBlockDialog({
        reason: validation.reason!,
        weaponId: wpn.id,
        weaponName: wpn.name,
        currentEquippedNames: equippedWeapons
          .filter(w => w.id !== wpn.id)
          .map(w => w.name),
      })
      return
    }

    onToggleEquipped?.(wpn.id)
  }

  return (
    <>
      <HudCard title="Weapons" animClass={animClass}>
        {weapons.map((wpn, i) => (
          <div key={wpn.id || i}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)',
              padding: '0.5rem 0',
              borderBottom: i < weapons.length - 1 ? '1px solid var(--bdr-l)' : 'none',
            }}>
              {/* Equip toggle */}
              <button
                onClick={() => wpn.id && handleEquipClick(wpn)}
                style={{
                  position: 'relative', flexShrink: 0,
                  background: 'none', border: 'none',
                  cursor: onToggleEquipped && wpn.id ? 'pointer' : 'default',
                  padding: 0,
                }}
                title={wpn.equipped ? 'Unequip' : 'Equip'}
              >
                {wpn.itemKey ? (
                  <EquipmentImage
                    itemKey={wpn.itemKey}
                    itemType="weapon"
                    categories={wpn.categories}
                    size="sm"
                    style={{
                      background: 'var(--parch)', border: '1px solid var(--bdr-l)',
                      opacity: wpn.equipped ? 1 : 0.45,
                      transition: '.2s',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '2rem', height: '2rem', background: 'var(--parch)',
                    border: '1px solid var(--bdr-l)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'var(--font-md)', flexShrink: 0,
                    opacity: wpn.equipped ? 1 : 0.45,
                  }}>
                    {wpn.icon}
                  </div>
                )}
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: '0.45rem', height: '0.45rem', borderRadius: '50%',
                  background: wpn.equipped ? 'var(--green)' : 'transparent',
                  boxShadow: wpn.equipped ? '0 0 0.3rem var(--green)' : 'none',
                  border: wpn.equipped ? 'none' : '1.5px solid var(--txt3)',
                }} />
              </button>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt)' }}>{wpn.name}</div>
                <div style={{
                  marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem',
                }}>
                  {wpn.equipped && (
                    <Badge color="var(--green)" bg="rgba(45,143,78,.1)">EQUIPPED</Badge>
                  )}
                  {wpn.skill && (
                    <Badge color="var(--blue-l)" bg="rgba(91,143,224,.1)">{wpn.skill}</Badge>
                  )}
                  {wpn.range && (
                    <Badge color="var(--amber)" bg="rgba(196,127,23,.1)">{wpn.range}</Badge>
                  )}
                  {wpn.qualities?.split(', ').map((q, qi) => (
                    <Badge key={qi} color="#9B6DD7" bg="rgba(155,109,215,.1)">{q}</Badge>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--red)' }}>{wpn.damage}</div>
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.06rem', color: 'var(--txt3)' }}>DAM</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--amber)' }}>{wpn.crit}</div>
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.06rem', color: 'var(--txt3)' }}>CRIT</div>
                </div>
                {isGmMode && onRemoveWeapon && wpn.id && (
                  <button
                    style={removeBtnStyle}
                    title="Remove weapon"
                    onClick={() => {
                      if (window.confirm(`Remove ${wpn.name}?`)) onRemoveWeapon(wpn.id!)
                    }}
                  >✕</button>
                )}
              </div>
            </div>

            {/* GM handedness override control */}
            {isGmMode && wpn.id && onHandednessOverride && wpn.skill_key && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 0 6px 2.5rem',
                borderBottom: i < weapons.length - 1 ? 'none' : 'none',
              }}>
                <span style={{
                  fontFamily: FONT_R,
                  fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
                  color: GOLD_DIM,
                }}>
                  Handedness:
                </span>
                <select
                  value={
                    wpn.is_one_handed_override === true ? 'one'
                    : wpn.is_two_handed_override === true ? 'two'
                    : 'auto'
                  }
                  onChange={e => onHandednessOverride(wpn.id!, e.target.value as 'auto' | 'one' | 'two')}
                  style={{
                    fontFamily: FONT_R,
                    fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
                    color: GOLD,
                    background: 'rgba(200,170,80,0.05)',
                    border: `1px solid ${GOLD_BD}`,
                    borderRadius: 4,
                    padding: '1px 4px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="auto">Auto ({getWeaponHandedness({ skill_key: wpn.skill_key!, weapon_key: wpn.weapon_key }) === 'one' ? 'One-handed' : 'Two-handed'})</option>
                  <option value="one">Force One-handed</option>
                  <option value="two">Force Two-handed</option>
                </select>
              </div>
            )}
          </div>
        ))}

        {/* ── Loadout status indicator ── */}
        {equippedWeapons.length >= 2 && (
          <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid var(--bdr-l)' }}>
            {loadoutValidation.valid && isDualWield ? (
              <div style={{
                fontFamily: FONT_M,
                fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)',
                color: GREEN,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>✓</span>
                <span>Dual Wield loadout · Two one-handed weapons equipped</span>
              </div>
            ) : !loadoutValidation.valid ? (
              <div style={{
                fontFamily: FONT_M,
                fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)',
                color: AMBER,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>⚠</span>
                <span>Invalid loadout — review your equipped weapons</span>
              </div>
            ) : null}
          </div>
        )}
      </HudCard>

      {/* ── Hard block dialog ── */}
      {blockDialog && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            width: 'clamp(300px, 40vw, 420px)',
            background: 'rgba(6,13,9,0.97)',
            border: `1px solid ${AMBER_BD}`,
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: '0 0 32px rgba(255,152,0,0.15)',
          }}>
            <div style={{
              fontFamily: FONT_C,
              fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
              fontWeight: 700,
              color: AMBER,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}>
              ⚠  Cannot Equip
            </div>

            <div style={{
              fontFamily: FONT_R,
              fontSize: 'clamp(0.8rem, 1.2vw, 0.92rem)',
              color: TEXT,
              lineHeight: 1.5,
              marginBottom: 8,
            }}>
              {blockDialog.reason}
            </div>

            {blockDialog.currentEquippedNames.length > 0 && (
              <div style={{
                fontFamily: FONT_R,
                fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
                color: TEXT_DIM,
                marginBottom: 16,
              }}>
                Currently equipped: {blockDialog.currentEquippedNames.join(', ')}
              </div>
            )}

            {/* GM override option */}
            {isGmMode && onForceEquip ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setBlockDialog(null)}
                  style={{
                    flex: 1, padding: '9px 0',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8, cursor: 'pointer',
                    fontFamily: FONT_C,
                    fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
                    color: TEXT_DIM,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onForceEquip(blockDialog.weaponId)
                    setBlockDialog(null)
                  }}
                  style={{
                    flex: 2, padding: '9px 0',
                    background: 'rgba(255,152,0,0.08)',
                    border: `1px solid rgba(255,152,0,0.3)`,
                    borderRadius: 8, cursor: 'pointer',
                    fontFamily: FONT_C,
                    fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
                    color: AMBER,
                  }}
                >
                  Override — Equip Anyway
                </button>
              </div>
            ) : (
              <button
                onClick={() => setBlockDialog(null)}
                style={{
                  width: '100%', padding: '9px 0',
                  background: 'rgba(255,152,0,0.08)',
                  border: `1px solid ${AMBER_BD}`,
                  borderRadius: 8, cursor: 'pointer',
                  fontFamily: FONT_C,
                  fontSize: 'clamp(0.8rem, 1.2vw, 0.92rem)',
                  fontWeight: 700,
                  color: AMBER,
                }}
              >
                OK
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
