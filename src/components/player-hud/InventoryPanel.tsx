'use client'

import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase, FS_OVERLINE, FS_LABEL, FS_SM, RADIUS } from './design-tokens'
import { FONT_BODY } from '@/lib/tokens'
import { useHudPanelContext } from '@/contexts/HudPanelContext'
import { TickerText } from '@/components/ui/TickerText'
import { WeaponDamageDisplay } from '@/components/character/WeaponDamageDisplay'
import { QualityBadge } from '@/components/character/QualityBadge'
import { RichText } from '@/components/ui/RichText'
import { stripBBCode } from '@/lib/utils'
import type { EquipState, RefWeaponQuality, StowLocation, StowLocationType, StowableAsset, WpnDisplay, ArmDisplay, GearRow } from '@/lib/types'
import { HUD } from '@/lib/tokens'

// ── Stow location visual config ─────────────────────────────────────────────

const STOW_COLOR: Record<StowLocationType, string> = {
  vehicle:            'var(--state-success)',
  starship:           'var(--state-advantage)',
  safe_house:         '#D4A84B', // DEVIATION: #D4A84B — no token, keeping raw
  base_of_operations: 'var(--state-activated)',
}

const STOW_ICON: Record<StowLocationType, string> = {
  vehicle:            '▶',
  starship:           '◈',
  safe_house:         '◆',
  base_of_operations: '★',
}

const STOW_TYPE_LABEL: Record<'vehicle' | 'starship' | 'safe_house', string> = {
  vehicle:   'Vehicle',
  starship:  'Starship',
  safe_house:'Safe House',
}

// ── Public interfaces ────────────────────────────────────────────────────────
export type { WpnDisplay, ArmDisplay, GearRow } from '@/lib/types'

interface InventoryPanelProps {
  weapons:              WpnDisplay[]
  armorItems:           ArmDisplay[]
  gearItems:            GearRow[]
  encumbranceCurrent:   number
  encumbranceThreshold: number
  refWeaponQualityMap:  Record<string, RefWeaponQuality>
  stowableAssets?:      StowableAsset[]
  baseOfOperationsName?: string | null
  onSetWeaponState:     (id: string, state: EquipState, location?: StowLocation | null) => void
  onSetArmorState:      (id: string, state: EquipState, location?: StowLocation | null) => void
  onSetGearState:       (id: string, state: EquipState, location?: StowLocation | null) => void
  onDiscardWeapon?:     (id: string, note?: string) => void
  onDiscardArmor?:      (id: string, note?: string) => void
  onDiscardGear?:       (id: string, note?: string) => void
  isGmMode?:            boolean
  characterName?:       string
}

// ── Sub-components ───────────────────────────────────────────────────────────

function EncBar({ current, threshold }: { current: number; threshold: number }) {
  const pct    = threshold > 0 ? Math.min((current / threshold) * 100, 100) : 0
  const overenc = current > threshold
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '0.375rem' }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textDim }}>
          Encumbrance
        </div>
        <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, color: overenc ? 'var(--hud-accent)' : C.gold, fontWeight: 700 }}>
          {current} / {threshold}
        </div>
      </div>
      <div className="overflow-hidden" style={{ height: '0.3125rem', background: C.textFaint, borderRadius: RADIUS.sm }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: overenc
            ? 'linear-gradient(90deg, var(--hud-accent), color-mix(in srgb, var(--hud-accent) 80%, white))'
            : `linear-gradient(90deg, color-mix(in srgb, var(--hud-gold) 53%, transparent), var(--hud-gold))`,
          transition: 'width var(--ease-smooth)',
          borderRadius: RADIUS.sm,
        }} />
      </div>
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  const { isOpen } = useHudPanelContext()
  return (
    <div style={{
      fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
      letterSpacing: '0.15em', textTransform: 'uppercase',
      color: C.textDim, marginBottom: 'var(--space-2)', paddingBottom: 'var(--space-1)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <TickerText text={text} isOpen={isOpen} delayMs={120} />
    </div>
  )
}

const RANGE_COLOR: Record<string, string> = {
  Engaged: 'var(--hud-accent)',
  Short:   '#FF9800', // DEVIATION: #FF9800 — no token (orange), keeping raw
  Medium:  HUD.gold,
  Long:    'var(--state-success)',
  Extreme: 'var(--state-activated)',
}

function StatBadge({ label, value, color = C.textDim }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: `color-mix(in srgb, ${color} 6%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 19%, transparent)`,
      borderRadius: RADIUS.md, padding: '3px var(--space-2)', minWidth: '2.5rem',
    }}>
      <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.125rem' }}>{label}</div>
    </div>
  )
}

function StowPill({ location }: { location: StowLocation }) {
  const color = STOW_COLOR[location.type]
  const icon  = STOW_ICON[location.type]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
      padding: '1px 0.4375rem', borderRadius: RADIUS.xl,
      background: `color-mix(in srgb, ${color} 9%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 27%, transparent)`,
      fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
      color, letterSpacing: '0.04em', flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      {icon} {location.name}
    </span>
  )
}

const EQUIP_BTN_STATES: EquipState[] = ['stowed', 'carrying', 'equipped']
const EQUIP_BTN_LABELS: Record<EquipState, string> = { stowed: 'STOW', carrying: 'CARRY', equipped: 'EQUIP' }
const EQUIP_BTN_ACTIVE: Record<EquipState, React.CSSProperties> = {
  stowed:   { background: 'var(--hud-surface-mid)', borderColor: 'var(--hud-border-hi)', color: 'var(--hud-text)' },
  carrying: { background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--hud-accent) 45%, transparent)', color: C.gold },
  equipped: { background: 'color-mix(in srgb, var(--state-success) 18%, transparent)', borderColor: 'var(--state-success)', color: 'var(--hud-text-faint)' },
}

function EquipStateButtons({ equipState, onSet }: { equipState: EquipState; onSet: (s: EquipState) => void }) {
  return (
    <div className="flex flex-shrink-0" style={{ gap: 'var(--space-1)' }}>
      {EQUIP_BTN_STATES.map(s => {
        const isActive = equipState === s
        const active = EQUIP_BTN_ACTIVE[s]
        return (
          <button
            key={s}
            onClick={() => { if (!isActive) onSet(s) }}
            style={{
              height: '1.75rem', borderRadius: RADIUS.md, padding: '0 0.625rem',
              fontFamily: FONT_BODY,
              fontSize: 'clamp(0.6rem, 0.92vw, 0.72rem)',
              textTransform: 'uppercase',
              cursor: isActive ? 'default' : 'pointer',
              transition: 'border-color var(--ease-default), color var(--ease-default)',
              border: '1px solid',
              ...(isActive ? active : {
                background: 'var(--hud-surface-lo)',
                borderColor: 'var(--hud-border)',
                color: 'var(--hud-text-faint)',
              }),
            }}
            onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.borderColor = 'color-mix(in srgb, var(--hud-accent) 30%, transparent)'; (e.currentTarget as HTMLElement).style.color = 'var(--hud-text-dim)' } }}
            onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--hud-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--hud-text-faint)' } }}
          >
            {EQUIP_BTN_LABELS[s]}
          </button>
        )
      })}
    </div>
  )
}

function CornerBrackets() {
  const s = { position: 'absolute' as const, width: '0.375rem', height: '0.375rem' }
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
  const accentPct = blocked ? '18%' : hov ? '90%' : '40%'
  return (
    <button
      onClick={blocked ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={blocked ? 'Unequip before discarding' : isGm ? 'Remove item' : 'Discard item'}
      style={{
        background: 'none', border: 'none', padding: '2px var(--space-1)',
        cursor: blocked ? 'not-allowed' : 'pointer',
        color: `color-mix(in srgb, var(--hud-accent) ${accentPct}, transparent)`,
        fontSize: isGm ? '1.125rem' : '0.875rem',
        lineHeight: 1, flexShrink: 0,
        transition: 'color var(--ease-default)',
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
  const confirmColor = isGm ? C.gold : 'var(--hud-accent)'
  return (
    <div style={{
      marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: `1px solid var(--hud-border)`,
      display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
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
              marginTop: 'var(--space-1)', width: '100%', boxSizing: 'border-box',
              background: 'var(--hud-surface-lo)', border: `1px solid var(--hud-border)`,
              color: C.text, fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
              padding: '3px var(--space-2)', borderRadius: RADIUS.sm, outline: 'none',
            }}
          />
        )}
      </div>
      <button
        onClick={onCancel}
        style={{
          height: '1.625rem', padding: '0 0.625rem', borderRadius: RADIUS.md, cursor: 'pointer',
          fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
          background: 'transparent', border: `1px solid var(--hud-border)`,
          color: 'var(--hud-text-dim)', flexShrink: 0, marginTop: isGm ? 2 : 0,
        }}
      >Cancel</button>
      <button
        onClick={() => onConfirm(isGm && note.trim() ? note.trim() : undefined)}
        style={{
          height: '1.625rem', padding: '0 0.625rem', borderRadius: RADIUS.md, cursor: 'pointer',
          fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700,
          background: `color-mix(in srgb, ${confirmColor} 9%, transparent)`,
          border: `1px solid color-mix(in srgb, ${confirmColor} 50%, transparent)`,
          color: confirmColor, flexShrink: 0, marginTop: isGm ? 2 : 0,
        }}
      >
        {isGm ? 'Remove' : 'Discard'}
      </button>
    </div>
  )
}

// ── Stow Location Modal ──────────────────────────────────────────────────────

const DIM  = 'var(--hud-text-dim)'
const TEXT = 'var(--hud-text)'
const BG   = 'var(--hud-surface-hi)'

interface StowLocationModalProps {
  itemName:             string
  stowableAssets:       StowableAsset[]
  baseOfOperationsName: string | null
  onConfirm:            (location: StowLocation | null) => void
  onCancel:             () => void
}

function StowLocationModal({
  itemName, stowableAssets, baseOfOperationsName, onConfirm, onCancel,
}: StowLocationModalProps) {
  const BOO_VALUE = '__boo__'
  const defaultVal = baseOfOperationsName
    ? BOO_VALUE
    : stowableAssets[0]?.id ?? ''

  const [selected, setSelected] = useState(defaultVal)

  const hasOptions = !!baseOfOperationsName || stowableAssets.length > 0

  const handleConfirm = () => {
    if (!selected) {
      onConfirm(null)
      return
    }
    if (selected === BOO_VALUE) {
      onConfirm({ id: null, name: baseOfOperationsName!, type: 'base_of_operations' })
      return
    }
    const asset = stowableAssets.find(a => a.id === selected)
    if (asset) onConfirm({ id: asset.id, name: asset.name, type: asset.type })
    else        onConfirm(null)
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="fixed inset-0 cursor-pointer"
        style={{ zIndex: 'var(--z-dialog)', background: 'rgba(0,0,0,0.65)' }}
      />
      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 'var(--z-dialog)',
        width: 'clamp(300px, 36vw, 420px)',
        background: BG,
        border: `1px solid var(--hud-border-hi)`,
        borderRadius: RADIUS.lg,
        padding: 'var(--space-5) 1.375rem',
        boxShadow: '0 16px 48px rgba(0,0,0,0.75)',
      }}>
        {/* Header */}
        <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 700, color: HUD.gold, marginBottom: 'var(--space-1)' }}>
          Stow Item
        </div>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: DIM, marginBottom: '0.875rem', lineHeight: 1.4 }}>
          Where would you like to stow{' '}
          <span style={{ color: TEXT, fontWeight: 600 }}>{itemName}</span>?
        </div>

        <div style={{ height: 1, background: 'var(--hud-border)', marginBottom: 'var(--space-4)' }} />

        {/* Location picker */}
        {hasOptions ? (
          <>
            <div style={{
              fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
              fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--hud-text-faint)', marginBottom: 'var(--space-2)',
            }}>
              Storage Location
            </div>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              style={{
                width: '100%', padding: 'var(--space-2) 0.625rem',
                background: 'var(--hud-surface-lo)',
                border: `1px solid var(--hud-border)`,
                borderRadius: RADIUS.md,
                color: TEXT,
                fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
                outline: 'none', cursor: 'pointer',
                marginBottom: '1.125rem',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23E03A1E' opacity='0.6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.625rem center',
                paddingRight: '1.75rem',
              }}
            >
              <option value="">— No specific location —</option>
              {baseOfOperationsName && (
                <option value={BOO_VALUE}>
                  ★ {baseOfOperationsName} (Base of Operations)
                </option>
              )}
              {stowableAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {STOW_ICON[a.type]} {a.name} ({STOW_TYPE_LABEL[a.type]})
                </option>
              ))}
            </select>

            {/* Preview pill for selected location */}
            {selected && selected !== '' && (
              <div style={{ marginBottom: '1.125rem' }}>
                {(() => {
                  let loc: StowLocation | null = null
                  if (selected === BOO_VALUE && baseOfOperationsName) {
                    loc = { id: null, name: baseOfOperationsName, type: 'base_of_operations' }
                  } else {
                    const a = stowableAssets.find(x => x.id === selected)
                    if (a) loc = { id: a.id, name: a.name, type: a.type }
                  }
                  return loc ? (
                    <div className="flex items-center" style={{ gap: '0.375rem' }}>
                      <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: DIM }}>Will appear as:</span>
                      <StowPill location={loc} />
                    </div>
                  ) : null
                })()}
              </div>
            )}
          </>
        ) : (
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: DIM,
            fontStyle: 'italic', marginBottom: '1.125rem', lineHeight: 1.5,
          }}>
            No group assets available yet. The item will be stowed without a specific location.
            Add vehicles, starships, or safe houses in the Group Sheet to assign a location.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end" style={{ gap: 'var(--space-2)' }}>
          <button
            onClick={onCancel}
            style={{
              height: '2rem', padding: '0 0.875rem', borderRadius: RADIUS.md, cursor: 'pointer',
              fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
              background: 'transparent',
              border: `1px solid var(--hud-border)`,
              color: 'var(--hud-text-dim)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              height: '2rem', padding: '0 1.125rem', borderRadius: RADIUS.md, cursor: 'pointer',
              fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
              background: 'color-mix(in srgb, var(--hud-accent) 14%, transparent)',
              border: `1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)`,
              color: HUD.gold,
            }}
          >
            Stow
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function InventoryPanel({
  weapons, armorItems, gearItems,
  encumbranceCurrent, encumbranceThreshold,
  refWeaponQualityMap,
  stowableAssets = [],
  baseOfOperationsName = null,
  onSetWeaponState, onSetArmorState, onSetGearState,
  onDiscardWeapon, onDiscardArmor, onDiscardGear,
  isGmMode, characterName,
}: InventoryPanelProps) {
  const { isOpen } = useHudPanelContext()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const toggleExpand = (id: string) => setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }))

  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [confirmingDiscard, setConfirmingDiscard] = useState<{ id: string; type: 'weapon' | 'armor' | 'gear' } | null>(null)
  const discardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Stow location modal state ──
  const [pendingStow, setPendingStow] = useState<{
    id:   string
    type: 'weapon' | 'armor' | 'gear'
    name: string
  } | null>(null)

  // Intercept equip-state changes: show modal when stowing, clear location otherwise
  const handleEquipChange = (
    id: string,
    type: 'weapon' | 'armor' | 'gear',
    name: string,
    s: EquipState,
  ) => {
    if (s === 'stowed') {
      setPendingStow({ id, type, name })
    } else {
      if (type === 'weapon') onSetWeaponState(id, s, null)
      else if (type === 'armor') onSetArmorState(id, s, null)
      else onSetGearState(id, s, null)
    }
  }

  const confirmStow = (location: StowLocation | null) => {
    if (!pendingStow) return
    const { id, type } = pendingStow
    if (type === 'weapon') onSetWeaponState(id, 'stowed', location)
    else if (type === 'armor') onSetArmorState(id, 'stowed', location)
    else onSetGearState(id, 'stowed', location)
    setPendingStow(null)
  }

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
    <div className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
      <EncBar current={encumbranceCurrent} threshold={encumbranceThreshold} />

      {/* ── Weapons ── */}
      {weapons.length > 0 && (
        <div>
          <SectionLabel text="Weapons" />
          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            {weapons.map((w, idx) => {
              const isExpanded = !!expandedItems[w.id]
              const descText = w.description ? stripBBCode(w.description).trim() : ''
              const qualDescs = w.qualities
                .map(q => ({ q, ref: refWeaponQualityMap[q.key] }))
                .filter(({ ref }) => ref?.description?.trim())
              const hasContent = !!(descText || qualDescs.length)
              return (
                <div key={w.id} data-stagger={idx}>
                <div className="panel-row-enter">
                <div style={{ ...panelBase, padding: '0.625rem var(--space-3)' }}
                  onMouseEnter={() => setHoveredRow(w.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <CornerBrackets />
                  <div className="flex items-start justify-between" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <div>
                      <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 600, color: C.text }}><TickerText text={w.name} isOpen={isOpen} delayMs={120} /></div>
                      <div className="flex items-center flex-wrap" style={{ gap: '0.375rem', marginTop: '0.125rem' }}>
                        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {w.skillName}
                        </span>
                        {w.stowLocation && <StowPill location={w.stowLocation} />}
                      </div>
                    </div>
                    <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                      <EquipStateButtons equipState={w.equipState} onSet={s => handleEquipChange(w.id, 'weapon', w.name, s)} />
                      {onDiscardWeapon && (hoveredRow === w.id || confirmingDiscard?.id === w.id) && (
                        <TrashBtn isGm={!!isGmMode} isEquipped={w.equipState === 'equipped'} onClick={() => startDiscard(w.id, 'weapon')} />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap" style={{ gap: '0.375rem' }}>
                    <StatBadge label="DMG"  value={<WeaponDamageDisplay {...w.damage} />} color="var(--state-threat)" />
                    <StatBadge label="CRIT" value={w.crit || '—'}    color="var(--hud-accent)" />
                    <StatBadge label="RNG"  value={w.range}          color={RANGE_COLOR[w.range] ?? C.textDim} />
                    <StatBadge label="ENC"  value={w.enc} />
                    <StatBadge label="HP"   value={w.hardPoints} />
                  </div>
                  {w.qualities.length > 0 && (
                    <div className="flex flex-wrap" style={{ gap: 'var(--space-1)', marginTop: '0.375rem' }}>
                      {w.qualities.map((q, i) => (
                        <QualityBadge key={i} quality={q} refQualityMap={refWeaponQualityMap} variant="desktop" />
                      ))}
                    </div>
                  )}
                  {hasContent && isExpanded && (
                    <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: `1px solid ${C.border}` }}>
                      {descText && (
                        <RichText
                          text={descText}
                          style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}
                        />
                      )}
                      {qualDescs.map(({ q, ref }, i) => (
                        <div key={i} style={{ marginTop: descText && i === 0 ? 'var(--space-2)' : 'var(--space-1)' }}>
                          <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_OVERLINE, color: C.gold, fontWeight: 600 }}>
                            {ref.name}{ref.is_ranked && q.count && q.count > 1 ? ` ${q.count}` : ''}:{' '}
                          </span>
                          <RichText
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
                      className="block w-full cursor-pointer text-center"
                      style={{
                        marginTop: '0.375rem',
                        background: 'none', border: 'none',
                        color: C.textDim, fontSize: '0.6rem',
                        padding: '2px 0', opacity: 0.6,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6' }}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  )}
                </div>
                </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Armor ── */}
      {armorItems.length > 0 && (
        <div>
          <SectionLabel text="Armor" />
          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            {armorItems.map((a, idx) => {
              const isExpanded = !!expandedItems[a.id]
              const descText = a.description ? stripBBCode(a.description).trim() : ''
              return (
                <div key={a.id} data-stagger={idx}>
                <div className="panel-row-enter">
                <div style={{ ...panelBase, padding: '0.625rem var(--space-3)' }}
                  onMouseEnter={() => setHoveredRow(a.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <CornerBrackets />
                  <div className="flex items-start justify-between" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <div>
                      <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 600, color: C.text }}><TickerText text={a.name} isOpen={isOpen} delayMs={120} /></div>
                      {a.stowLocation && (
                        <div style={{ marginTop: '0.1875rem' }}>
                          <StowPill location={a.stowLocation} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                      <EquipStateButtons equipState={a.equipState} onSet={s => handleEquipChange(a.id, 'armor', a.name, s)} />
                      {onDiscardArmor && (hoveredRow === a.id || confirmingDiscard?.id === a.id) && (
                        <TrashBtn isGm={!!isGmMode} isEquipped={a.equipState === 'equipped'} onClick={() => startDiscard(a.id, 'armor')} />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap" style={{ gap: '0.375rem' }}>
                    {/* DEVIATION: #5AAAE0 — no token, keeping raw */}
                    <StatBadge label="SOAK"   value={`+${a.soak}`} color="#5AAAE0" />
                    <StatBadge label="DEF"    value={a.defense}    color="var(--state-success)" />
                    <StatBadge label="ENC"    value={a.enc} />
                    <StatBadge label="HP"     value={a.hardPoints} />
                    <StatBadge label="RARITY" value={a.rarity} />
                  </div>
                  {descText && isExpanded && (
                    <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: `1px solid ${C.border}` }}>
                      <RichText
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
                      className="block w-full cursor-pointer text-center"
                      style={{
                        marginTop: '0.375rem',
                        background: 'none', border: 'none',
                        color: C.textDim, fontSize: '0.6rem',
                        padding: '2px 0', opacity: 0.6,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6' }}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  )}
                </div>
                </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Gear ── */}
      {gearItems.length > 0 && (
        <div>
          <SectionLabel text="Gear" />
          <div className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
            {gearItems.map((g, idx) => {
              const isExpanded = !!expandedItems[g.id]
              const descText = g.description ? stripBBCode(g.description).trim() : ''
              const gIsConfirming = confirmingDiscard?.id === g.id
              return (
                <div key={g.id} data-stagger={idx}>
                <div className="panel-row-enter">
                <div style={{
                  borderRadius: RADIUS.md,
                  background: 'var(--hud-surface-lo)', border: `1px solid ${C.border}`,
                }}
                  onMouseEnter={() => setHoveredRow(g.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div className="flex items-center justify-between" style={{ padding: '0.375rem 0.625rem', gap: 'var(--space-2)' }}>
                    <div className="flex items-center" style={{ gap: '0.375rem', minWidth: 0, flex: 1 }}>
                      <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.text, flexShrink: 0 }}><TickerText text={g.name} isOpen={isOpen} delayMs={120} /></span>
                      {g.stowLocation && <StowPill location={g.stowLocation} />}
                    </div>
                    <div className="flex items-center flex-shrink-0" style={{ gap: 'var(--space-3)' }}>
                      {g.qty > 1 && (
                        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim }}>×{g.qty}</span>
                      )}
                      <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim }}>Enc {g.enc}</span>
                      <EquipStateButtons equipState={g.equipState} onSet={s => handleEquipChange(g.id, 'gear', g.name, s)} />
                      {descText && (
                        <button
                          onClick={() => toggleExpand(g.id)}
                          className="cursor-pointer"
                          style={{
                            background: 'none', border: 'none',
                            color: C.textDim, fontSize: '0.6rem', padding: '0 var(--space-1)', opacity: 0.6,
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
                    <div style={{ padding: '0.375rem 0.625rem var(--space-2)', borderTop: `1px solid ${C.border}` }}>
                      <RichText
                        text={descText}
                        style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}
                      />
                    </div>
                  )}
                  {onDiscardGear && gIsConfirming && (
                    <div style={{ padding: '0 0.625rem var(--space-2)' }}>
                      <DiscardStrip isGm={!!isGmMode} characterName={characterName} onCancel={cancelDiscard} onConfirm={executeDiscard} />
                    </div>
                  )}
                </div>
                </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {weapons.length === 0 && armorItems.length === 0 && gearItems.length === 0 && (
        <div className="flex items-center justify-center" style={{ padding: 'var(--space-12)', fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textFaint }}>
          Inventory is empty.
        </div>
      )}

      {/* Stow location modal — rendered to body via portal */}
      {pendingStow && (
        <StowLocationModal
          itemName={pendingStow.name}
          stowableAssets={stowableAssets}
          baseOfOperationsName={baseOfOperationsName}
          onConfirm={confirmStow}
          onCancel={() => setPendingStow(null)}
        />
      )}
    </div>
  )
}
