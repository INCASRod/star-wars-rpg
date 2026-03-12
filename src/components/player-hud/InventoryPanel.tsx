'use client'

import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase, FS_OVERLINE, FS_LABEL, FS_SM } from './design-tokens'
import { Tooltip, TipLabel, TipBody } from '@/components/ui/Tooltip'
import { getQualityTip } from '@/lib/tooltips/weaponQualities'
import type { EquipState } from '@/lib/types'

export interface WpnDisplay {
  id:          string
  name:        string
  damage:      string
  crit:        number
  range:       string
  enc:         number
  hardPoints:  number
  qualities:   string[]
  equipState:  EquipState
  skillName:   string
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
}

export interface GearRow {
  id:         string
  name:       string
  qty:        number
  enc:        number
  equipState: EquipState
}

interface InventoryPanelProps {
  weapons:              WpnDisplay[]
  armorItems:           ArmDisplay[]
  gearItems:            GearRow[]
  encumbranceCurrent:   number
  encumbranceThreshold: number
  onToggleWeapon:       (id: string) => void
  onToggleArmor:        (id: string) => void
  onToggleGear:         (id: string) => void
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

function StatBadge({ label, value, color = C.textDim }: { label: string; value: string | number; color?: string }) {
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

const EQUIP_STATE_STYLE: Record<EquipState, { label: string; color: string; bg: string; border: string }> = {
  equipped: { label: 'Equipped', color: C.gold,      bg: `${C.gold}20`,       border: C.gold },
  carrying: { label: 'Carrying', color: '#60C8E0',   bg: 'rgba(96,200,224,0.12)', border: 'rgba(96,200,224,0.4)' },
  stowed:   { label: 'Stowed',   color: C.textFaint, bg: 'transparent',       border: C.border },
}

function EquipBadge({ equipState, onClick }: { equipState: EquipState; onClick: () => void }) {
  const s = EQUIP_STATE_STYLE[equipState]
  return (
    <button
      onClick={onClick}
      title="Click to cycle: Equipped → Carrying → Stowed"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 3, padding: '2px 8px',
        fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: s.color, cursor: 'pointer',
        transition: '.15s', whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </button>
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

export function InventoryPanel({
  weapons, armorItems, gearItems,
  encumbranceCurrent, encumbranceThreshold,
  onToggleWeapon, onToggleArmor, onToggleGear,
}: InventoryPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <EncBar current={encumbranceCurrent} threshold={encumbranceThreshold} />

      {/* Weapons */}
      {weapons.length > 0 && (
        <div>
          <SectionLabel text="Weapons" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weapons.map(w => (
              <div key={w.id} style={{ ...panelBase, padding: '10px 12px' }}>
                <CornerBrackets />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 600, color: C.text }}>{w.name}</div>
                    <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {w.skillName}
                    </div>
                  </div>
                  <EquipBadge equipState={w.equipState} onClick={() => onToggleWeapon(w.id)} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <StatBadge label="DMG"  value={w.damage}         color="#E07855" />
                  <StatBadge label="CRIT" value={w.crit || '—'}    color="#E05050" />
                  <StatBadge label="RNG"  value={w.range}          color={RANGE_COLOR[w.range] ?? C.textDim} />
                  <StatBadge label="ENC"  value={w.enc} />
                  <StatBadge label="HP"   value={w.hardPoints} />
                </div>
                {w.qualities.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                    {w.qualities.map((q, i) => {
                      const tip  = getQualityTip(q)
                      const chip = (
                        <span key={i} style={{
                          background: `${C.gold}12`, border: `1px solid ${C.border}`,
                          borderRadius: 10, padding: '1px 7px', cursor: tip ? 'help' : 'default',
                          fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.gold,
                        }}>{q}</span>
                      )
                      if (!tip) return chip
                      return (
                        <Tooltip key={i} placement="top" maxWidth={260} content={<><TipLabel>{tip.name}</TipLabel><TipBody>{tip.effect}</TipBody></>}>
                          {chip}
                        </Tooltip>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Armor */}
      {armorItems.length > 0 && (
        <div>
          <SectionLabel text="Armor" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {armorItems.map(a => (
              <div key={a.id} style={{ ...panelBase, padding: '10px 12px' }}>
                <CornerBrackets />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 600, color: C.text }}>{a.name}</div>
                  <EquipBadge equipState={a.equipState} onClick={() => onToggleArmor(a.id)} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <StatBadge label="SOAK"   value={`+${a.soak}`} color="#5AAAE0" />
                  <StatBadge label="DEF"    value={a.defense}    color="#4EC87A" />
                  <StatBadge label="ENC"    value={a.enc} />
                  <StatBadge label="HP"     value={a.hardPoints} />
                  <StatBadge label="RARITY" value={a.rarity} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gear */}
      {gearItems.length > 0 && (
        <div>
          <SectionLabel text="Gear" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {gearItems.map(g => (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px', borderRadius: 4,
                background: 'rgba(8,16,10,0.5)', border: `1px solid ${C.border}`,
              }}>
                <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.text }}>{g.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {g.qty > 1 && (
                    <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim }}>×{g.qty}</span>
                  )}
                  <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim }}>Enc {g.enc}</span>
                  <EquipBadge equipState={g.equipState} onClick={() => onToggleGear(g.id)} />
                </div>
              </div>
            ))}
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
