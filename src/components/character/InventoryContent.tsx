'use client'

import { useState } from 'react'
import { HudCard } from '../ui/HudCard'
import { Badge } from '../ui/Badge'
import { EquipmentImage } from '../ui/EquipmentImage'
import { rarityColor, COLOR, FS, FONT_BODY, HUD } from '@/lib/tokens'
import { RANGE_LABELS } from '@/lib/types'
import type {
  CharacterWeapon, CharacterArmor, CharacterGear,
  RefWeapon, RefArmor, RefGear, RefSkill, RefItemDescriptor,
} from '@/lib/types'

const numStyle: React.CSSProperties = {
  justifyContent: 'center', fontFamily: FONT_BODY, fontWeight: 800, fontSize: FS.body,
}

interface InventoryContentProps {
  weapons: CharacterWeapon[]
  armor: CharacterArmor[]
  gear: CharacterGear[]
  refWeaponMap: Record<string, RefWeapon>
  refArmorMap: Record<string, RefArmor>
  refGearMap: Record<string, RefGear>
  refSkillMap: Record<string, RefSkill>
  refDescriptorMap: Record<string, RefItemDescriptor>
  encumbranceThreshold: number
  onToggleEquipped: (id: string, type: 'weapon' | 'armor' | 'gear') => void
}

function EquippedBadge() {
  return <Badge color="var(--green)" bg="rgba(45,143,78,.1)">EQUIPPED</Badge>
}

export function InventoryContent({
  weapons, armor, gear,
  refWeaponMap, refArmorMap, refGearMap, refSkillMap, refDescriptorMap,
  encumbranceThreshold, onToggleEquipped,
}: InventoryContentProps) {
  const [collapsedSections] = useState<Record<string, boolean>>({})

  const weaponEnc = weapons.reduce((sum, w) => {
    if (!w.is_equipped) return sum
    const ref = w.weapon_key ? refWeaponMap[w.weapon_key] : null
    return sum + (ref?.encumbrance || 0)
  }, 0)

  const armorEnc = armor.reduce((sum, a) => {
    if (!a.is_equipped) return sum
    const ref = a.armor_key ? refArmorMap[a.armor_key] : null
    const enc = ref?.encumbrance || 0
    return sum + Math.max(0, enc - 3)
  }, 0)

  const gearEnc = gear.reduce((sum, g) => {
    if (!g.is_equipped) return sum
    const ref = g.gear_key ? refGearMap[g.gear_key] : null
    return sum + ((ref?.encumbrance || 0) * (g.quantity || 1))
  }, 0)

  const totalEnc = weaponEnc + armorEnc + gearEnc
  const overEncumbered = totalEnc > encumbranceThreshold

  function getQualityLabels(qualities?: { key: string; count?: number }[]): string[] {
    if (!qualities?.length) return []
    return qualities.map(q => {
      const desc = refDescriptorMap[q.key]
      const name = desc?.name || q.key
      return q.count && q.count > 0 ? `${name} ${q.count}` : name
    })
  }

  const headerStyle: React.CSSProperties = {
    fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
    letterSpacing: '0.1rem', color: COLOR.txt3, textTransform: 'uppercase',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  }

  const cellStyle: React.CSSProperties = {
    fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 500, color: COLOR.txt2,
    display: 'flex', alignItems: 'center',
  }

  const nameStyle: React.CSSProperties = {
    fontSize: FS.label, fontWeight: 600, color: COLOR.txt,
  }

  return (
    <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
      {/* Encumbrance Summary Strip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.borderHi}`,
        padding: '0.5rem 1rem', backdropFilter: 'blur(6px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 600, letterSpacing: '0.15rem', color: COLOR.txt3 }}>
              ENCUMBRANCE
            </div>
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 800,
              color: overEncumbered ? COLOR.red : COLOR.ink,
            }}>
              {totalEnc}
              <span style={{ color: overEncumbered ? COLOR.red : COLOR.txt3, fontWeight: 400, fontSize: FS.body }}> / {encumbranceThreshold}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { label: 'WEAPONS', value: weaponEnc },
              { label: 'ARMOR', value: armorEnc },
              { label: 'GEAR', value: gearEnc },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 600, letterSpacing: '0.08rem', color: COLOR.txt3 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 600, color: COLOR.txt2 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
        {overEncumbered && (
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            color: COLOR.red, letterSpacing: '0.12rem',
            border: `1px solid ${COLOR.red}`, padding: '0.25rem 0.5rem',
            background: 'rgba(229,62,62,.06)',
          }}>
            OVER-ENCUMBERED
          </div>
        )}
      </div>

      {/* Weapons */}
      <HudCard title={`Weapons (${weapons.length})`} collapsible defaultCollapsed={collapsedSections.weapons}>
        {weapons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1rem 0', fontFamily: FONT_BODY, fontSize: FS.label, color: COLOR.txt3, letterSpacing: '0.15rem' }}>NO WEAPONS</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 80px 50px 50px 70px 40px 40px 1fr', gap: '0.25rem', padding: '0.25rem 0', borderBottom: `1px solid ${HUD.borderHi}`, alignItems: 'center' }}>
              <div /><div style={headerStyle}>NAME</div><div style={headerStyle}>SKILL</div>
              <div style={{ ...headerStyle, textAlign: 'center' }}>DAM</div><div style={{ ...headerStyle, textAlign: 'center' }}>CRIT</div>
              <div style={headerStyle}>RANGE</div><div style={{ ...headerStyle, textAlign: 'center' }}>ENC</div>
              <div style={{ ...headerStyle, textAlign: 'center' }}>HP</div><div style={headerStyle}>QUALITIES</div>
            </div>
            {weapons.map(w => {
              const ref = w.weapon_key ? refWeaponMap[w.weapon_key] : null
              const name = w.custom_name || ref?.name || w.weapon_key || 'Unknown'
              const skill = ref?.skill_key ? refSkillMap[ref.skill_key]?.name || '' : ''
              const range = ref?.range_value ? RANGE_LABELS[ref.range_value] || '' : ''
              const quals = getQualityLabels(ref?.qualities)
              return (
                <div key={w.id} onClick={() => onToggleEquipped(w.id, 'weapon')} className="hov-gold-bg" style={{
                  display: 'grid', gridTemplateColumns: '48px 1fr 80px 50px 50px 70px 40px 40px 1fr',
                  gap: '0.25rem', padding: '0.5rem 0', borderBottom: `1px solid ${HUD.borderHi}`,
                  alignItems: 'center', cursor: 'pointer', transition: 'background .15s',
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <EquipmentImage itemKey={w.weapon_key || ''} itemType="weapon" categories={ref?.categories} size="md" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <span style={nameStyle}>{name}</span>{w.is_equipped && <EquippedBadge />}
                  </div>
                  <div style={cellStyle}>{skill}</div>
                  <div style={{ ...cellStyle, ...numStyle, color: COLOR.red }}>{ref?.damage ?? '—'}</div>
                  <div style={{ ...cellStyle, ...numStyle, color: COLOR.amber }}>{ref?.crit ?? '—'}</div>
                  <div style={cellStyle}>{range}</div>
                  <div style={{ ...cellStyle, ...numStyle, color: COLOR.txt3 }}>{ref?.encumbrance ?? '—'}</div>
                  <div style={{ ...cellStyle, ...numStyle, color: COLOR.red }}>{ref?.hard_points ?? '—'}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
                    {quals.map((q, qi) => (
                      <Badge key={qi} color="#9B6DD7" bg="rgba(155,109,215,.1)">{q}</Badge>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </HudCard>

      {/* Armor */}
      <HudCard title={`Armor (${armor.length})`} collapsible defaultCollapsed={collapsedSections.armor}>
        {armor.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1rem 0', fontFamily: FONT_BODY, fontSize: FS.label, color: COLOR.txt3, letterSpacing: '0.15rem' }}>NO ARMOR</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 50px 50px 40px 40px 50px', gap: '0.25rem', padding: '0.25rem 0', borderBottom: `1px solid ${HUD.borderHi}`, alignItems: 'center' }}>
              <div /><div style={headerStyle}>NAME</div>
              <div style={{ ...headerStyle, textAlign: 'center' }}>SOAK</div><div style={{ ...headerStyle, textAlign: 'center' }}>DEF</div>
              <div style={{ ...headerStyle, textAlign: 'center' }}>ENC</div><div style={{ ...headerStyle, textAlign: 'center' }}>HP</div>
              <div style={{ ...headerStyle, textAlign: 'center' }}>RAR</div>
            </div>
            {armor.map(a => {
              const ref = a.armor_key ? refArmorMap[a.armor_key] : null
              const name = a.custom_name || ref?.name || a.armor_key || 'Armor'
              const enc = ref?.encumbrance || 0
              const displayEnc = a.is_equipped ? Math.max(0, enc - 3) : enc
              return (
                <div key={a.id} onClick={() => onToggleEquipped(a.id, 'armor')} className="hov-gold-bg" style={{
                  display: 'grid', gridTemplateColumns: '48px 1fr 50px 50px 40px 40px 50px',
                  gap: '0.25rem', padding: '0.5rem 0', borderBottom: `1px solid ${HUD.borderHi}`,
                  alignItems: 'center', cursor: 'pointer', transition: 'background .15s',
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <EquipmentImage itemKey={a.armor_key || ''} itemType="armor" size="md" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <span style={nameStyle}>{name}</span>{a.is_equipped && <EquippedBadge />}
                  </div>
                  <div style={{ ...cellStyle, ...numStyle, color: COLOR.blue }}>{ref?.soak ?? '—'}</div>
                  <div style={{ ...cellStyle, ...numStyle, color: COLOR.green }}>{ref?.defense ?? '—'}</div>
                  <div style={{ ...cellStyle, ...numStyle, color: COLOR.txt3 }}>
                    {displayEnc}
                    {a.is_equipped && enc > 3 && <span style={{ fontSize: FS.overline, color: COLOR.green, marginLeft: '0.25rem' }}>-3</span>}
                  </div>
                  <div style={{ ...cellStyle, ...numStyle, color: COLOR.red }}>{ref?.hard_points ?? '—'}</div>
                  <div style={{ ...cellStyle, ...numStyle, color: ref?.rarity != null ? rarityColor(ref.rarity) : COLOR.txt3 }}>{ref?.rarity ?? '—'}</div>
                </div>
              )
            })}
          </>
        )}
      </HudCard>

      {/* Gear */}
      <HudCard title={`Gear (${gear.length})`} collapsible defaultCollapsed={collapsedSections.gear}>
        {gear.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1rem 0', fontFamily: FONT_BODY, fontSize: FS.label, color: COLOR.txt3, letterSpacing: '0.15rem' }}>NO GEAR</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 50px 40px 50px', gap: '0.25rem', padding: '0.25rem 0', borderBottom: `1px solid ${HUD.borderHi}`, alignItems: 'center' }}>
              <div /><div style={headerStyle}>NAME</div>
              <div style={{ ...headerStyle, textAlign: 'center' }}>QTY</div><div style={{ ...headerStyle, textAlign: 'center' }}>ENC</div>
              <div style={{ ...headerStyle, textAlign: 'center' }}>RAR</div>
            </div>
            {gear.map(g => {
              const ref = g.gear_key ? refGearMap[g.gear_key] : null
              const name = g.custom_name || ref?.name || g.gear_key || 'Gear'
              return (
                <div key={g.id} onClick={() => onToggleEquipped(g.id, 'gear')} className="hov-gold-bg" style={{
                  display: 'grid', gridTemplateColumns: '48px 1fr 50px 40px 50px',
                  gap: '0.25rem', padding: '0.5rem 0', borderBottom: `1px solid ${HUD.borderHi}`,
                  alignItems: 'center', cursor: 'pointer', transition: 'background .15s',
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <EquipmentImage itemKey={g.gear_key || ''} itemType="gear" size="md" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <span style={nameStyle}>{name}</span>{g.is_equipped && <EquippedBadge />}
                  </div>
                  <div style={{ ...cellStyle, ...numStyle, color: COLOR.txt2 }}>{g.quantity || 1}</div>
                  <div style={{ ...cellStyle, ...numStyle, color: COLOR.txt3 }}>{(ref?.encumbrance || 0) * (g.quantity || 1)}</div>
                  <div style={{ ...cellStyle, ...numStyle, color: ref?.rarity != null ? rarityColor(ref.rarity) : COLOR.txt3 }}>{ref?.rarity ?? '—'}</div>
                </div>
              )
            })}
          </>
        )}
      </HudCard>
    </div>
  )
}
