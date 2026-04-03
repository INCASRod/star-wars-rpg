'use client'

import React, { useState, useRef } from 'react'
import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase, FS_OVERLINE, FS_LABEL, FS_SM } from './design-tokens'
import { WeaponDamageDisplay } from '@/components/character/WeaponDamageDisplay'
import { QualityBadge } from '@/components/character/QualityBadge'
import { DiceText } from '@/components/dice/DiceText'
import { stripBBCode } from '@/lib/utils'
import type { EquipState, RefWeaponQuality } from '@/lib/types'

export interface WpnDisplay {
  id:          string
  name:        string
  damage:      { baseDamage: number; isMelee: boolean; brawn: number }
  crit:        number
  range:       string
  enc:         number
  hardPoints:  number
  qualities:   { key: string; count?: number | null }[]
  equipState:  EquipState
  skillName:   string
  description?: string | null
}

export interface ArmDisplay {
  id:          string
  name:        string
  soak:        number
  defense:     number
  enc:         number
  hardPoints:  number
  rarity:      number
  equipState:  EquipState
  description?: string | null
}

export interface GearRow {
  id:         string
  name:       string
  qty:        number
  enc:        number
  equipState: EquipState
  description?: string | null
}

interface InventoryPanelProps {
  weapons:              WpnDisplay[]
  armorItems:           ArmDisplay[]
  gearItems:            GearRow[]
  encumbranceCurrent:   number
  encumbranceThreshold: number
  refWeaponQualityMap:  Record<string, RefWeaponQuality>
  onSetWeaponState:     (id: string, state: EquipState) => void
  onSetArmorState:      (id: string, state: EquipState) => void
  onSetGearState:       (id: string, state: EquipState) => void
  onDiscardWeapon?:     (id: string, note?: string) => void
  onDiscardArmor?:      (id: string, note?: string) => void
  onDiscardGear?:       (id: string, note?: string) => void
  isGmMode?:            boolean
  characterName?:       string
}

function EncBar({ current, threshold }: { current: number; threshold: number }) {
  const pct    = threshold > 0 ? Math.min((current / threshold) * 100, 100) : 0
  const overenc = current > threshold
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textDim }}>
          Encumbrance
        </div>
        <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, color: overenc ? '#E05050' : C.gold, fontWeight: 700 }}>
          {current} / {threshold}
        </div>
      </div>
      <div style={{ height: 5, background: C.textFaint, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: overenc
            ? 'linear-gradient(90deg, #E05050, #FF6060)'
            : `linear-gradient(90deg, ${C.gold}88, ${C.gold})`,
          transition: 'width .4s ease',
          borderRadius: 3,
        }} />
      </div>
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
      letterSpacing: '0.15em', textTransform: 'uppercase',
      color: C.textDim, marginBottom: 8, paddingBottom: 4,
      borderBottom: `1px solid ${C.border}`,
    }}>
      {text}
    </div>
  )
}

const RANGE_COLOR: Record<string, string> = {
  Engaged: '#2EC9B8',   // teal  — light
  Short:   '#2EC9B8',   // teal  — light
  Medium:  '#AAEE33',   // highlighter green — medium
  Long:    '#A855E8',   // purple — heavy
  Extreme: '#A855E8',   // purple — heavy
}

function StatBadge({ label, value, color = C.textDim }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: `${color}10`, border: `1px solid ${color}30`,
      borderRadius: 4, padding: '3px 8px', minWidth: 40,
    }}>
      <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
    </div>
  )
}


const EQUIP_BTN_STATES: EquipState[] = ['stowed', 'carrying', 'equipped']
const EQUIP_BTN_LABELS: Record<EquipState, string> = { stowed: 'STOW', carrying: 'CARRY', equipped: 'EQUIP' }
const EQUIP_BTN_ACTIVE: Record<EquipState, React.CSSProperties> = {
  stowed:   { background: 'rgba(232,223,200,0.08)', borderColor: 'rgba(232,223,200,0.4)',  color: 'rgba(232,223,200,0.9)' },
  carrying: { background: 'rgba(200,170,80,0.1)',   borderColor: 'rgba(200,170,80,0.45)', color: C.gold },
  equipped: { background: 'rgba(76,175,80,0.1)',    borderColor: 'rgba(76,175,80,0.45)',  color: '#4CAF50' },
}

function EquipStateButtons({ equipState, onSet }: { equipState: EquipState; onSet: (s: EquipState) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
      {EQUIP_BTN_STATES.map(s => {
        const isActive = equipState === s
        const active = EQUIP_BTN_ACTIVE[s]
        return (
          <button
            key={s}
            onClick={() => { if (!isActive) onSet(s) }}
            style={{
              height: 28, borderRadius: 5, padding: '0 10px',
              fontFamily: "'Share Tech Mono', 'Courier New', monospace",
              fontSize: 'clamp(0.6rem, 0.92vw, 0.72rem)',
              textTransform: 'uppercase',
              cursor: isActive ? 'default' : 'pointer',
              transition: 'border-color .15s, color .15s',
              border: '1px solid',
              ...(isActive ? active : {
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.12)',
                color: 'rgba(232,223,200,0.45)',
              }),
            }}
            onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,170,80,0.3)'; (e.currentTarget as HTMLElement).style.color = 'rgba(232,223,200,0.7)' } }}
            onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(232,223,200,0.45)' } }}
          >
            {EQUIP_BTN_LABELS[s]}
          </button>
        )
      })}
    </div>
  )
}

function CornerBrackets() {
  const s = { position: 'absolute' as const, width: 6, height: 6 }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}` }} />
    </>
  )
}

function TrashBtn({
  isGm, isEquipped, onClick,
}: { isGm: boolean; isEquipped: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const blocked = !isGm && isEquipped
  const baseAlpha = isGm ? 'rgba(200,170,80,' : 'rgba(244,67,54,'
  const alpha = blocked ? '0.18)' : hov ? '0.9)' : '0.4)'
  return (
    <button
      onClick={blocked ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={blocked ? 'Unequip before discarding' : isGm ? 'Remove item' : 'Discard item'}
      style={{
        background: 'none', border: 'none', padding: '2px 4px',
        cursor: blocked ? 'not-allowed' : 'pointer',
        color: `${baseAlpha}${alpha}`,
        fontSize: isGm ? 18 : 14,
        lineHeight: 1, flexShrink: 0,
        transition: 'color 0.15s',
      }}
    >
      {isGm ? '×' : '🗑'}
    </button>
  )
}

function DiscardStrip({
  isGm, characterName, onCancel, onConfirm,
}: { isGm: boolean; characterName?: string; onCancel: () => void; onConfirm: (note?: string) => void }) {
  const [note, setNote] = useState('')
  const confirmColor = isGm ? C.gold : '#E05050'
  return (
    <div style={{
      marginTop: 8, paddingTop: 8, borderTop: `1px solid rgba(255,255,255,0.06)`,
      display: 'flex', alignItems: 'flex-start', gap: 8,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: confirmColor, fontWeight: 600 }}>
          {isGm ? `Remove from ${characterName ?? 'character'}?` : 'Drop this item?'}
        </div>
        {!isGm && (
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim }}>
            You drop it and leave it behind.
          </div>
        )}
        {isGm && (
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Note (optional)"
            style={{
              marginTop: 4, width: '100%', boxSizing: 'border-box',
              background: 'rgba(0,0,0,0.3)', border: `1px solid rgba(200,170,80,0.2)`,
              color: C.text, fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
              padding: '3px 8px', borderRadius: 3, outline: 'none',
            }}
          />
        )}
      </div>
      <button
        onClick={onCancel}
        style={{
          height: 26, padding: '0 10px', borderRadius: 5, cursor: 'pointer',
          fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
          background: 'transparent', border: `1px solid rgba(255,255,255,0.15)`,
          color: 'rgba(232,223,200,0.6)', flexShrink: 0, marginTop: isGm ? 2 : 0,
        }}
      >Cancel</button>
      <button
        onClick={() => onConfirm(isGm && note.trim() ? note.trim() : undefined)}
        style={{
          height: 26, padding: '0 10px', borderRadius: 5, cursor: 'pointer',
          fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700,
          background: `${confirmColor}18`, border: `1px solid ${confirmColor}80`,
          color: confirmColor, flexShrink: 0, marginTop: isGm ? 2 : 0,
        }}
      >
        {isGm ? 'Remove' : 'Discard'}
      </button>
    </div>
  )
}

export function InventoryPanel({
  weapons, armorItems, gearItems,
  encumbranceCurrent, encumbranceThreshold,
  refWeaponQualityMap,
  onSetWeaponState, onSetArmorState, onSetGearState,
  onDiscardWeapon, onDiscardArmor, onDiscardGear,
  isGmMode, characterName,
}: InventoryPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const toggleExpand = (id: string) => setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }))

  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
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
  const executeDiscard = (note?: string) => {
    if (!confirmingDiscard) return
    if (discardTimerRef.current) clearTimeout(discardTimerRef.current)
    if (confirmingDiscard.type === 'weapon') onDiscardWeapon?.(confirmingDiscard.id, note)
    else if (confirmingDiscard.type === 'armor') onDiscardArmor?.(confirmingDiscard.id, note)
    else onDiscardGear?.(confirmingDiscard.id, note)
    setConfirmingDiscard(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <EncBar current={encumbranceCurrent} threshold={encumbranceThreshold} />

      {/* Weapons */}
      {weapons.length > 0 && (
        <div>
          <SectionLabel text="Weapons" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weapons.map(w => {
              const isExpanded = !!expandedItems[w.id]
              const descText = w.description ? stripBBCode(w.description).trim() : ''
              const qualDescs = w.qualities
                .map(q => ({ q, ref: refWeaponQualityMap[q.key] }))
                .filter(({ ref }) => ref?.description?.trim())
              const hasContent = !!(descText || qualDescs.length)
              return (
                <div key={w.id} style={{ ...panelBase, padding: '10px 12px' }}
                  onMouseEnter={() => setHoveredRow(w.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <CornerBrackets />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 600, color: C.text }}>{w.name}</div>
                      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {w.skillName}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <EquipStateButtons equipState={w.equipState} onSet={s => onSetWeaponState(w.id, s)} />
                      {onDiscardWeapon && (hoveredRow === w.id || confirmingDiscard?.id === w.id) && (
                        <TrashBtn isGm={!!isGmMode} isEquipped={w.equipState === 'equipped'} onClick={() => startDiscard(w.id, 'weapon')} />
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <StatBadge label="DMG"  value={<WeaponDamageDisplay {...w.damage} />} color="#E07855" />
                    <StatBadge label="CRIT" value={w.crit || '—'}    color="#E05050" />
                    <StatBadge label="RNG"  value={w.range}          color={RANGE_COLOR[w.range] ?? C.textDim} />
                    <StatBadge label="ENC"  value={w.enc} />
                    <StatBadge label="HP"   value={w.hardPoints} />
                  </div>
                  {w.qualities.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                      {w.qualities.map((q, i) => (
                        <QualityBadge key={i} quality={q} refQualityMap={refWeaponQualityMap} variant="desktop" />
                      ))}
                    </div>
                  )}
                  {hasContent && isExpanded && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                      {descText && (
                        <DiceText
                          text={descText}
                          style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}
                        />
                      )}
                      {qualDescs.map(({ q, ref }, i) => (
                        <div key={i} style={{ marginTop: descText && i === 0 ? 8 : 4 }}>
                          <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_OVERLINE, color: C.gold, fontWeight: 600 }}>
                            {ref.name}{ref.is_ranked && q.count && q.count > 1 ? ` ${q.count}` : ''}:{' '}
                          </span>
                          <DiceText
                            text={stripBBCode(ref.description)}
                            style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, lineHeight: 1.55 }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {onDiscardWeapon && confirmingDiscard?.id === w.id && (
                    <DiscardStrip isGm={!!isGmMode} characterName={characterName} onCancel={cancelDiscard} onConfirm={executeDiscard} />
                  )}
                  {hasContent && (
                    <button
                      onClick={() => toggleExpand(w.id)}
                      style={{
                        display: 'block', width: '100%', marginTop: 6,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: C.textDim, fontSize: '0.6rem', textAlign: 'center',
                        padding: '2px 0', opacity: 0.6,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6' }}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Armor */}
      {armorItems.length > 0 && (
        <div>
          <SectionLabel text="Armor" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {armorItems.map(a => {
              const isExpanded = !!expandedItems[a.id]
              const descText = a.description ? stripBBCode(a.description).trim() : ''
              return (
                <div key={a.id} style={{ ...panelBase, padding: '10px 12px' }}
                  onMouseEnter={() => setHoveredRow(a.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <CornerBrackets />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 600, color: C.text }}>{a.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <EquipStateButtons equipState={a.equipState} onSet={s => onSetArmorState(a.id, s)} />
                      {onDiscardArmor && (hoveredRow === a.id || confirmingDiscard?.id === a.id) && (
                        <TrashBtn isGm={!!isGmMode} isEquipped={a.equipState === 'equipped'} onClick={() => startDiscard(a.id, 'armor')} />
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <StatBadge label="SOAK"   value={`+${a.soak}`} color="#5AAAE0" />
                    <StatBadge label="DEF"    value={a.defense}    color="#4EC87A" />
                    <StatBadge label="ENC"    value={a.enc} />
                    <StatBadge label="HP"     value={a.hardPoints} />
                    <StatBadge label="RARITY" value={a.rarity} />
                  </div>
                  {descText && isExpanded && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                      <DiceText
                        text={descText}
                        style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}
                      />
                    </div>
                  )}
                  {onDiscardArmor && confirmingDiscard?.id === a.id && (
                    <DiscardStrip isGm={!!isGmMode} characterName={characterName} onCancel={cancelDiscard} onConfirm={executeDiscard} />
                  )}
                  {descText && (
                    <button
                      onClick={() => toggleExpand(a.id)}
                      style={{
                        display: 'block', width: '100%', marginTop: 6,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: C.textDim, fontSize: '0.6rem', textAlign: 'center',
                        padding: '2px 0', opacity: 0.6,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6' }}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Gear */}
      {gearItems.length > 0 && (
        <div>
          <SectionLabel text="Gear" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {gearItems.map(g => {
              const isExpanded = !!expandedItems[g.id]
              const descText = g.description ? stripBBCode(g.description).trim() : ''
              const gIsConfirming = confirmingDiscard?.id === g.id
              return (
                <div key={g.id} style={{
                  borderRadius: 4,
                  background: 'rgba(8,16,10,0.5)', border: `1px solid ${C.border}`,
                }}
                  onMouseEnter={() => setHoveredRow(g.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 10px',
                  }}>
                    <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.text }}>{g.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {g.qty > 1 && (
                        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim }}>×{g.qty}</span>
                      )}
                      <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim }}>Enc {g.enc}</span>
                      <EquipStateButtons equipState={g.equipState} onSet={s => onSetGearState(g.id, s)} />
                      {descText && (
                        <button
                          onClick={() => toggleExpand(g.id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: C.textDim, fontSize: '0.6rem', padding: '0 4px', opacity: 0.6,
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6' }}
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      )}
                      {onDiscardGear && (hoveredRow === g.id || gIsConfirming) && (
                        <TrashBtn isGm={!!isGmMode} isEquipped={g.equipState === 'equipped'} onClick={() => startDiscard(g.id, 'gear')} />
                      )}
                    </div>
                  </div>
                  {descText && isExpanded && (
                    <div style={{ padding: '6px 10px 8px', borderTop: `1px solid ${C.border}` }}>
                      <DiceText
                        text={descText}
                        style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}
                      />
                    </div>
                  )}
                  {onDiscardGear && gIsConfirming && (
                    <div style={{ padding: '0 10px 8px' }}>
                      <DiscardStrip isGm={!!isGmMode} characterName={characterName} onCancel={cancelDiscard} onConfirm={executeDiscard} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {weapons.length === 0 && armorItems.length === 0 && gearItems.length === 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 48, fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textFaint,
        }}>
          Inventory is empty.
        </div>
      )}
    </div>
  )
}
