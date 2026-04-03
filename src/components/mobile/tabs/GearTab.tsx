'use client'

import React, { useState, useRef } from 'react'
import { RANGE_LABELS } from '@/lib/types'
import { DiceText } from '@/components/dice/DiceText'
import { stripBBCode } from '@/lib/utils'
import type {
  CharacterWeapon, CharacterArmor, CharacterGear,
  RefWeapon, RefArmor, RefGear, RefSkill, RefItemDescriptor, RefWeaponQuality, EquipState,
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

const EQUIP_STATES: EquipState[] = ['stowed', 'carrying', 'equipped']
const EQUIP_LABELS: Record<EquipState, string> = { stowed: 'STOW', carrying: 'CARRY', equipped: 'EQUIP' }
const EQUIP_ACTIVE: Record<EquipState, React.CSSProperties> = {
  stowed:   { background: 'rgba(232,223,200,0.08)', borderColor: 'rgba(232,223,200,0.4)',  color: 'rgba(232,223,200,0.9)' },
  carrying: { background: 'rgba(200,170,80,0.1)',   borderColor: 'rgba(200,170,80,0.45)', color: GOLD },
  equipped: { background: 'rgba(76,175,80,0.1)',    borderColor: 'rgba(76,175,80,0.45)',  color: '#4CAF50' },
}

function EquipStateButtons({ equipState, onSet }: { equipState: EquipState; onSet?: (s: EquipState) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
      {EQUIP_STATES.map(s => {
        const isActive = equipState === s
        const active = EQUIP_ACTIVE[s]
        return (
          <button
            key={s}
            onClick={() => { if (!isActive && onSet) onSet(s) }}
            disabled={!onSet}
            style={{
              height: 28, borderRadius: 5, padding: '0 10px',
              fontFamily: FONT_M,
              fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)',
              textTransform: 'uppercase',
              cursor: (!onSet || isActive) ? 'default' : 'pointer',
              border: '1px solid',
              ...(isActive ? active : {
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.12)',
                color: 'rgba(232,223,200,0.45)',
              }),
            }}
          >
            {EQUIP_LABELS[s]}
          </button>
        )
      })}
    </div>
  )
}

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
  onSetWeaponState?: (id: string, state: EquipState) => void
  onSetArmorState?:  (id: string, state: EquipState) => void
  onSetGearState?:   (id: string, state: EquipState) => void
  onDiscardWeapon?:  (id: string) => void
  onDiscardArmor?:   (id: string) => void
  onDiscardGear?:    (id: string) => void
}

export function GearTab({
  weapons, armor, gear, brawn,
  refWeaponMap, refArmorMap, refGearMap, refSkillMap, refDescriptorMap, refWeaponQualityMap,
  onSetWeaponState, onSetArmorState, onSetGearState,
  onDiscardWeapon, onDiscardArmor, onDiscardGear,
}: GearTabProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const toggleExpand = (id: string) => setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }))

  const [confirmingDiscard, setConfirmingDiscard] = useState<{ id: string; type: 'weapon' | 'armor' | 'gear' } | null>(null)
  const discardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startDiscard = (id: string, type: 'weapon' | 'armor' | 'gear') => {
    if (discardTimerRef.current) clearTimeout(discardTimerRef.current)
    setConfirmingDiscard({ id, type })
    discardTimerRef.current = setTimeout(() => setConfirmingDiscard(null), 5000)
  }
  const cancelDiscard = () => {
    if (discardTimerRef.current) clearTimeout(discardTimerRef.current)
    setConfirmingDiscard(null)
  }
  const executeDiscard = () => {
    if (!confirmingDiscard) return
    if (discardTimerRef.current) clearTimeout(discardTimerRef.current)
    if (confirmingDiscard.type === 'weapon') onDiscardWeapon?.(confirmingDiscard.id)
    else if (confirmingDiscard.type === 'armor') onDiscardArmor?.(confirmingDiscard.id)
    else onDiscardGear?.(confirmingDiscard.id)
    setConfirmingDiscard(null)
  }

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
          const isExpanded = !!expandedItems[cw.id]
          const descText = ref.description ? stripBBCode(ref.description).trim() : ''
          const qualDescs = qualities
            .map(q => ({ q, qref: refWeaponQualityMap[q.key] }))
            .filter(({ qref }) => qref?.description?.trim())
          const hasContent = !!(descText || qualDescs.length)
          return (
            <div key={cw.id} style={{
              background: CARD_BG,
              border: `1px solid ${equip === 'equipped' ? GOLD_BD : 'rgba(200,170,80,0.08)'}`,
              borderRadius: 8,
              padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
                <span style={{ fontFamily: FONT_C, fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)', fontWeight: 700, color: TEXT }}>
                  {cw.custom_name || ref.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <EquipStateButtons equipState={equip} onSet={onSetWeaponState ? (s => onSetWeaponState(cw.id, s)) : undefined} />
                  {onDiscardWeapon && (
                    <button
                      onClick={() => confirmingDiscard?.id === cw.id ? cancelDiscard() : startDiscard(cw.id, 'weapon')}
                      style={{
                        background: 'none', border: 'none', padding: '2px 6px',
                        cursor: 'pointer', lineHeight: 1, flexShrink: 0,
                        color: confirmingDiscard?.id === cw.id ? GOLD_DIM : 'rgba(232,223,200,0.25)',
                        fontSize: 18,
                      }}
                    >×</button>
                  )}
                </div>
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
              {hasContent && isExpanded && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${BORDER}` }}>
                  {descText && (
                    <DiceText
                      text={descText}
                      style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 2.8vw, 0.85rem)', color: TEXT_DIM, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}
                    />
                  )}
                  {qualDescs.map(({ q, qref }, i) => (
                    <div key={i} style={{ marginTop: descText && i === 0 ? 8 : 4 }}>
                      <span style={{ fontFamily: FONT_C, fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)', color: GOLD, fontWeight: 600 }}>
                        {qref.name}{qref.is_ranked && q.count && q.count > 1 ? ` ${q.count}` : ''}:{' '}
                      </span>
                      <DiceText
                        text={stripBBCode(qref.description)}
                        style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 2.8vw, 0.85rem)', color: TEXT_DIM, lineHeight: 1.55 }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {onDiscardWeapon && confirmingDiscard?.id === cw.id && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: FONT_R, fontSize: 'clamp(0.7rem, 2.8vw, 0.82rem)', color: TEXT_DIM, flex: 1 }}>Drop this item?</span>
                  <button onClick={cancelDiscard} style={{ height: 26, padding: '0 10px', borderRadius: 5, cursor: 'pointer', fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(232,223,200,0.6)' }}>Cancel</button>
                  <button onClick={executeDiscard} style={{ height: 26, padding: '0 10px', borderRadius: 5, cursor: 'pointer', fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)', fontWeight: 700, background: 'rgba(244,67,54,0.12)', border: '1px solid rgba(244,67,54,0.5)', color: '#E05050' }}>Drop</button>
                </div>
              )}
              {hasContent && (
                <button
                  onClick={() => toggleExpand(cw.id)}
                  style={{
                    display: 'block', width: '100%', marginTop: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: TEXT_DIM, fontSize: '0.6rem', textAlign: 'center',
                    padding: '2px 0',
                  }}
                >
                  {isExpanded ? '▲' : '▼'}
                </button>
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
          const isExpanded = !!expandedItems[ca.id]
          const descText = ref.description ? stripBBCode(ref.description).trim() : ''
          return (
            <div key={ca.id} style={{
              background: CARD_BG,
              border: `1px solid ${equip === 'equipped' ? GOLD_BD : 'rgba(200,170,80,0.08)'}`,
              borderRadius: 8,
              padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                <span style={{ fontFamily: FONT_C, fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)', fontWeight: 700, color: TEXT }}>
                  {ca.custom_name || ref.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <EquipStateButtons equipState={equip} onSet={onSetArmorState ? (s => onSetArmorState(ca.id, s)) : undefined} />
                  {onDiscardArmor && (
                    <button
                      onClick={() => confirmingDiscard?.id === ca.id ? cancelDiscard() : startDiscard(ca.id, 'armor')}
                      style={{
                        background: 'none', border: 'none', padding: '2px 6px',
                        cursor: 'pointer', lineHeight: 1, flexShrink: 0,
                        color: confirmingDiscard?.id === ca.id ? GOLD_DIM : 'rgba(232,223,200,0.25)',
                        fontSize: 18,
                      }}
                    >×</button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <StatPill label="Soak" value={ref.soak} />
                <StatPill label="Def" value={ref.defense} />
                <StatPill label="ENC" value={ref.encumbrance} />
                {ref.hard_points > 0 && <StatPill label="HP" value={ref.hard_points} />}
              </div>
              {descText && isExpanded && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${BORDER}` }}>
                  <DiceText
                    text={descText}
                    style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 2.8vw, 0.85rem)', color: TEXT_DIM, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}
                  />
                </div>
              )}
              {onDiscardArmor && confirmingDiscard?.id === ca.id && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: FONT_R, fontSize: 'clamp(0.7rem, 2.8vw, 0.82rem)', color: TEXT_DIM, flex: 1 }}>Drop this item?</span>
                  <button onClick={cancelDiscard} style={{ height: 26, padding: '0 10px', borderRadius: 5, cursor: 'pointer', fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(232,223,200,0.6)' }}>Cancel</button>
                  <button onClick={executeDiscard} style={{ height: 26, padding: '0 10px', borderRadius: 5, cursor: 'pointer', fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)', fontWeight: 700, background: 'rgba(244,67,54,0.12)', border: '1px solid rgba(244,67,54,0.5)', color: '#E05050' }}>Drop</button>
                </div>
              )}
              {descText && (
                <button
                  onClick={() => toggleExpand(ca.id)}
                  style={{
                    display: 'block', width: '100%', marginTop: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: TEXT_DIM, fontSize: '0.6rem', textAlign: 'center',
                    padding: '2px 0',
                  }}
                >
                  {isExpanded ? '▲' : '▼'}
                </button>
              )}
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
          const isExpanded = !!expandedItems[cg.id]
          const descText = ref.description ? stripBBCode(ref.description).trim() : ''
          return (
            <div key={cg.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0',
              }}>
                <span style={{ fontFamily: FONT_R, fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', color: TEXT, flex: 1 }}>
                  {cg.custom_name || ref.name}
                  {cg.quantity > 1 && (
                    <span style={{ color: GOLD_DIM, marginLeft: 6 }}>×{cg.quantity}</span>
                  )}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 10 }}>
                  <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)', color: TEXT_DIM }}>
                    ENC {ref.encumbrance}
                  </span>
                  {descText && (
                    <button
                      onClick={() => toggleExpand(cg.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: TEXT_DIM, fontSize: '0.6rem', padding: '0 4px',
                      }}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  )}
                  {onDiscardGear && (
                    <button
                      onClick={() => confirmingDiscard?.id === cg.id ? cancelDiscard() : startDiscard(cg.id, 'gear')}
                      style={{
                        background: 'none', border: 'none', padding: '2px 4px',
                        cursor: 'pointer', lineHeight: 1, flexShrink: 0,
                        color: confirmingDiscard?.id === cg.id ? GOLD_DIM : 'rgba(232,223,200,0.25)',
                        fontSize: 16,
                      }}
                    >×</button>
                  )}
                </div>
              </div>
              {descText && isExpanded && (
                <div style={{ padding: '0 0 8px' }}>
                  <DiceText
                    text={descText}
                    style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 2.8vw, 0.85rem)', color: TEXT_DIM, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}
                  />
                </div>
              )}
              {onDiscardGear && confirmingDiscard?.id === cg.id && (
                <div style={{ paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: FONT_R, fontSize: 'clamp(0.7rem, 2.8vw, 0.82rem)', color: TEXT_DIM, flex: 1 }}>Drop this item?</span>
                  <button onClick={cancelDiscard} style={{ height: 24, padding: '0 8px', borderRadius: 5, cursor: 'pointer', fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(232,223,200,0.6)' }}>Cancel</button>
                  <button onClick={executeDiscard} style={{ height: 24, padding: '0 8px', borderRadius: 5, cursor: 'pointer', fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)', fontWeight: 700, background: 'rgba(244,67,54,0.12)', border: '1px solid rgba(244,67,54,0.5)', color: '#E05050' }}>Drop</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
