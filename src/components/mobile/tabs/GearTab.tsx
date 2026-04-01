'use client'

import React from 'react'
import { RANGE_LABELS } from '@/lib/types'
import type {
  CharacterWeapon, CharacterArmor, CharacterGear,
  RefWeapon, RefArmor, RefGear, RefSkill, RefItemDescriptor, RefWeaponQuality,
} from '@/lib/types'
import { WeaponDamageDisplay, isMeleeSkill } from '@/components/character/WeaponDamageDisplay'
import { QualityBadge } from '@/components/character/QualityBadge'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD     = '#C8AA50'
const GOLD_DIM = 'rgba(200,170,80,0.6)'
const GOLD_BD  = 'rgba(200,170,80,0.15)'
const BORDER   = 'rgba(200,170,80,0.1)'
const TEXT     = 'rgba(255,255,255,0.85)'
const TEXT_DIM = 'rgba(255,255,255,0.5)'
const CARD_BG  = 'rgba(255,255,255,0.03)'
const FONT_C   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_R   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M   = "'Courier New', monospace"

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: FONT_C,
      fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
      fontWeight: 700,
      color: GOLD,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      padding: '12px 16px 6px',
      borderBottom: `1px solid ${BORDER}`,
      marginBottom: 8,
    }}>
      {label}
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: FONT_M,
      fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
      color: TEXT_DIM,
      background: 'rgba(200,170,80,0.06)',
      border: `1px solid rgba(200,170,80,0.15)`,
      borderRadius: 10,
      padding: '2px 8px',
      whiteSpace: 'nowrap',
    }}>
      {label} {value}
    </span>
  )
}

interface GearTabProps {
  weapons: CharacterWeapon[]
  armor: CharacterArmor[]
  gear: CharacterGear[]
  brawn: number
  refWeaponMap: Record<string, RefWeapon>
  refArmorMap: Record<string, RefArmor>
  refGearMap: Record<string, RefGear>
  refSkillMap: Record<string, RefSkill>
  refDescriptorMap: Record<string, RefItemDescriptor>
  refWeaponQualityMap: Record<string, RefWeaponQuality>
}

export function GearTab({
  weapons, armor, gear, brawn,
  refWeaponMap, refArmorMap, refGearMap, refSkillMap, refDescriptorMap, refWeaponQualityMap,
}: GearTabProps) {
  return (
    <div style={{ paddingBottom: 16 }}>

      {/* ── Weapons ── */}
      <SectionHeader label="Weapons" />
      {weapons.length === 0 && (
        <p style={{ fontFamily: FONT_R, color: GOLD_DIM, fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', padding: '4px 16px 12px' }}>None.</p>
      )}
      <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(Array.isArray(weapons) ? weapons : []).map(cw => {
          const ref = refWeaponMap[cw.weapon_key]
          if (!ref) return null
          const skillRef = refSkillMap[ref.skill_key]
          const qualities = (Array.isArray(ref.qualities) ? ref.qualities : []) as { key: string; count?: number }[]
          const equip = cw.equip_state ?? (cw.is_equipped ? 'equipped' : 'stowed')
          return (
            <div key={cw.id} style={{
              background: CARD_BG,
              border: `1px solid ${equip === 'equipped' ? GOLD_BD : 'rgba(200,170,80,0.08)'}`,
              borderRadius: 8,
              padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ fontFamily: FONT_C, fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)', fontWeight: 700, color: TEXT }}>
                  {cw.custom_name || ref.name}
                </span>
                <span style={{
                  fontFamily: FONT_M,
                  fontSize: 'clamp(0.5rem, 2vw, 0.65rem)',
                  textTransform: 'uppercase',
                  color: equip === 'equipped' ? GOLD : TEXT_DIM,
                  background: equip === 'equipped' ? 'rgba(200,170,80,0.12)' : 'transparent',
                  border: `1px solid ${equip === 'equipped' ? GOLD_BD : BORDER}`,
                  borderRadius: 4,
                  padding: '1px 5px',
                  flexShrink: 0,
                  marginLeft: 8,
                }}>
                  {equip}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {skillRef && <StatPill label="Skill" value={skillRef.name} />}
                <StatPill label="DMG" value={
                  <WeaponDamageDisplay
                    baseDamage={ref.damage_add != null ? ref.damage_add : ref.damage}
                    isMelee={ref.damage_add != null && isMeleeSkill(ref.skill_key)}
                    brawn={brawn}
                  />
                } />
                {ref.crit > 0 && <StatPill label="CRIT" value={ref.crit} />}
                <StatPill label="Range" value={RANGE_LABELS[ref.range_value] ?? ref.range_value} />
                <StatPill label="ENC" value={ref.encumbrance} />
                {ref.hard_points > 0 && <StatPill label="HP" value={ref.hard_points} />}
              </div>
              {qualities.length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {qualities.map((q, i) => (
                    <QualityBadge key={i} quality={q} refQualityMap={refWeaponQualityMap} variant="mobile" />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Armor ── */}
      <SectionHeader label="Armor" />
      {armor.length === 0 && (
        <p style={{ fontFamily: FONT_R, color: GOLD_DIM, fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', padding: '4px 16px 12px' }}>None.</p>
      )}
      <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(Array.isArray(armor) ? armor : []).map(ca => {
          const ref = refArmorMap[ca.armor_key]
          if (!ref) return null
          const equip = ca.equip_state ?? (ca.is_equipped ? 'equipped' : 'stowed')
          return (
            <div key={ca.id} style={{
              background: CARD_BG,
              border: `1px solid ${equip === 'equipped' ? GOLD_BD : 'rgba(200,170,80,0.08)'}`,
              borderRadius: 8,
              padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: FONT_C, fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)', fontWeight: 700, color: TEXT }}>
                  {ca.custom_name || ref.name}
                </span>
                <span style={{
                  fontFamily: FONT_M,
                  fontSize: 'clamp(0.5rem, 2vw, 0.65rem)',
                  textTransform: 'uppercase',
                  color: equip === 'equipped' ? GOLD : TEXT_DIM,
                  background: equip === 'equipped' ? 'rgba(200,170,80,0.12)' : 'transparent',
                  border: `1px solid ${equip === 'equipped' ? GOLD_BD : BORDER}`,
                  borderRadius: 4,
                  padding: '1px 5px',
                  flexShrink: 0,
                  marginLeft: 8,
                }}>
                  {equip}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <StatPill label="Soak" value={ref.soak} />
                <StatPill label="Def" value={ref.defense} />
                <StatPill label="ENC" value={ref.encumbrance} />
                {ref.hard_points > 0 && <StatPill label="HP" value={ref.hard_points} />}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Personal Gear ── */}
      <SectionHeader label="Personal Gear" />
      {gear.length === 0 && (
        <p style={{ fontFamily: FONT_R, color: GOLD_DIM, fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', padding: '4px 16px 12px' }}>None.</p>
      )}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {(Array.isArray(gear) ? gear : []).map(cg => {
          const ref = refGearMap[cg.gear_key]
          if (!ref) return null
          return (
            <div key={cg.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <span style={{ fontFamily: FONT_R, fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', color: TEXT, flex: 1 }}>
                {cg.custom_name || ref.name}
                {cg.quantity > 1 && (
                  <span style={{ color: GOLD_DIM, marginLeft: 6 }}>×{cg.quantity}</span>
                )}
              </span>
              <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)', color: TEXT_DIM, flexShrink: 0, marginLeft: 10 }}>
                ENC {ref.encumbrance}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
