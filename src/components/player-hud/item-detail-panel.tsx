'use client'
import React, { useState, useRef, useLayoutEffect } from 'react'
import { FONT_BODY, FONT_DISPLAY, RADIUS, FS } from '@/lib/tokens'
import type { WpnDisplay, ArmDisplay, GearRow, EquipState, StowLocation, StowableAsset, RefWeaponQuality, ItemCondition } from '@/lib/types'
import { ItemDetailHero } from './item-detail-hero'
import { ItemConditionTrack } from './item-condition-track'
import { ItemQualityList } from './item-quality-list'
import { StowLocationModal, StowPill } from './stow-location-modal'
import { stripBBCode } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

export type SelectedItem =
  | { kind: 'weapon'; item: WpnDisplay }
  | { kind: 'armor';  item: ArmDisplay }
  | { kind: 'gear';   item: GearRow    }

interface ItemDetailPanelProps {
  selected:              SelectedItem
  refWeaponQualityMap:   Record<string, RefWeaponQuality>
  stowableAssets?:       StowableAsset[]
  baseOfOperationsName?: string | null
  onSetWeaponState:      (id: string, state: EquipState, location?: StowLocation | null) => void
  onSetArmorState:       (id: string, state: EquipState, location?: StowLocation | null) => void
  onSetGearState:        (id: string, state: EquipState, location?: StowLocation | null) => void
  onDiscardWeapon?:      (id: string, note?: string) => void
  onDiscardArmor?:       (id: string, note?: string) => void
  onDiscardGear?:        (id: string, note?: string) => void
  isGmMode?:             boolean
  characterName?:        string
}

// ── Stat box ─────────────────────────────────────────────────────────────────

function StatBox({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: `color-mix(in srgb, ${color} 8%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
      borderRadius: RADIUS.md, padding: '3px var(--space-2)', minWidth: '2.5rem',
    }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'var(--hud-gold)', marginBottom: 4,
      borderBottom: '1px solid var(--hud-border)', paddingBottom: 3,
    }}>
      {children}
    </div>
  )
}

// ── Equip buttons ─────────────────────────────────────────────────────────────

const EQUIP_STATES: EquipState[] = ['stowed', 'carrying', 'equipped']
const EQUIP_LABELS: Record<EquipState, string> = { stowed: 'Stow', carrying: 'Carry', equipped: 'Equipped' }

interface EquipButtonsProps {
  equipState:            EquipState
  condition:             ItemCondition
  stowLocation?:         StowLocation | null
  stowableAssets?:       StowableAsset[]
  baseOfOperationsName?: string | null
  name:                  string
  onSet:                 (state: EquipState, location?: StowLocation | null) => void
}

function EquipButtons({ equipState, condition, stowLocation, stowableAssets, baseOfOperationsName, name, onSet }: EquipButtonsProps) {
  const [stowModalOpen, setStowModalOpen] = useState(false)
  const canEquip = condition !== 'major' && condition !== 'destroyed'

  function handleClick(s: EquipState) {
    if (s === equipState) return
    if (s === 'stowed') { setStowModalOpen(true); return }
    onSet(s)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 4 }}>
        {EQUIP_STATES.map(s => {
          const isActive   = equipState === s
          const isDisabled = s === 'equipped' && !canEquip
          return (
            <button
              key={s}
              onClick={() => !isDisabled && handleClick(s)}
              disabled={isDisabled}
              className={`inv-equip-btn${isActive ? ' inv-equip-btn-active' : ''}`}
              style={{
                flex: 1, height: '1.875rem', borderRadius: RADIUS.md,
                cursor: isDisabled ? 'not-allowed' : isActive ? 'default' : 'pointer',
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                border: '1px solid', transition: 'border-color var(--ease-default), color var(--ease-default)',
                background: isActive ? 'var(--hud-accent-10)' : 'var(--hud-surface-lo)',
                borderColor: isActive ? 'var(--hud-gold)' : 'var(--hud-border)',
                color: isActive ? 'var(--hud-gold)' : isDisabled ? 'var(--hud-text-faint)' : 'var(--hud-text-dim)',
                opacity: isDisabled ? 0.4 : 1,
              }}
            >
              {EQUIP_LABELS[s]}
            </button>
          )
        })}
      </div>
      {equipState === 'stowed' && stowLocation && (
        <div style={{ marginTop: 6 }}>
          <StowPill location={stowLocation} />
        </div>
      )}
      {stowModalOpen && (
        <StowLocationModal
          itemName={name}
          stowableAssets={stowableAssets ?? []}
          baseOfOperationsName={baseOfOperationsName ?? null}
          onConfirm={loc => { setStowModalOpen(false); onSet('stowed', loc) }}
          onCancel={() => setStowModalOpen(false)}
        />
      )}
    </div>
  )
}

// ── Discard strip ─────────────────────────────────────────────────────────────

function DiscardStrip({ isGm, characterName, onCancel, onConfirm }: {
  isGm: boolean; characterName?: string; onCancel: () => void; onConfirm: (note?: string) => void
}) {
  const [note, setNote] = useState('')
  const accent = isGm ? 'var(--hud-gold)' : 'var(--hud-vital-wounds)'
  return (
    <div style={{
      marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)',
      borderTop: '1px solid var(--hud-border)',
      display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.label, color: accent, fontWeight: 600 }}>
          {isGm ? `Remove from ${characterName ?? 'character'}?` : 'Drop this item?'}
        </div>
        {!isGm && (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-dim)' }}>
            You drop it and leave it behind.
          </div>
        )}
        {isGm && (
          <input
            type="text" value={note} onChange={e => setNote(e.target.value)}
            placeholder="Note (optional)"
            style={{
              marginTop: 'var(--space-1)', width: '100%', boxSizing: 'border-box' as const,
              background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)',
              color: 'var(--hud-text)', fontFamily: FONT_BODY, fontSize: FS.overline,
              padding: '3px var(--space-2)', borderRadius: RADIUS.sm, outline: 'none',
            }}
          />
        )}
      </div>
      <button
        onClick={onCancel}
        style={{
          height: '1.625rem', padding: '0 0.625rem', borderRadius: RADIUS.md, cursor: 'pointer',
          fontFamily: FONT_BODY, fontSize: FS.overline,
          background: 'transparent', border: '1px solid var(--hud-border)', color: 'var(--hud-text-dim)',
          flexShrink: 0,
        }}
      >Cancel</button>
      <button
        onClick={() => onConfirm(isGm && note.trim() ? note.trim() : undefined)}
        style={{
          height: '1.625rem', padding: '0 0.625rem', borderRadius: RADIUS.md, cursor: 'pointer',
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
          background: `color-mix(in srgb, ${accent} 9%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accent} 50%, transparent)`,
          color: accent, flexShrink: 0,
        }}
      >
        {isGm ? 'Remove' : 'Discard'}
      </button>
    </div>
  )
}

function DiscardFooter({ isGm, characterName, showDiscard, setShowDiscard, onConfirm }: {
  isGm: boolean; characterName?: string; showDiscard: boolean
  setShowDiscard: (v: boolean) => void; onConfirm: (note?: string) => void
}) {
  if (showDiscard) {
    return (
      <DiscardStrip
        isGm={isGm} characterName={characterName}
        onCancel={() => setShowDiscard(false)}
        onConfirm={note => { setShowDiscard(false); onConfirm(note) }}
      />
    )
  }
  return (
    <div style={{ paddingTop: 'var(--space-2)', borderTop: '1px solid var(--hud-border)' }}>
      <button
        onClick={() => setShowDiscard(true)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: FONT_BODY, fontSize: FS.overline,
          color: 'var(--hud-text-faint)', padding: 0,
        }}
      >
        {isGm ? '× Remove item' : '🗑 Discard item'}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ItemDetailPanel({
  selected, refWeaponQualityMap,
  stowableAssets, baseOfOperationsName,
  onSetWeaponState, onSetArmorState, onSetGearState,
  onDiscardWeapon, onDiscardArmor, onDiscardGear,
  isGmMode, characterName,
}: ItemDetailPanelProps) {
  const [showDiscard, setShowDiscard] = useState(false)
  const [prevId, setPrevId] = useState<string | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const currentId = selected.item.id
  if (currentId !== prevId) { setShowDiscard(false); setPrevId(currentId) }

  // Set data-ticker-pass gate whenever the selected item changes — mirrors
  // HudFullPanel's mechanism so TickerText in ItemDetailHero re-animates.
  useLayoutEffect(() => {
    const el = detailRef.current
    if (!el) return
    el.dataset.tickerPass = 'true'
    const t = setTimeout(() => { if (detailRef.current) delete detailRef.current.dataset.tickerPass }, 600)
    return () => clearTimeout(t)
  }, [currentId])

  const STATS_ROW_STYLE: React.CSSProperties = {
    display: 'flex', gap: 4, padding: '6px 10px',
    background: 'var(--hud-surface-hi)', borderBottom: '1px solid var(--hud-border)',
    flexShrink: 0, flexWrap: 'wrap',
  }

  const BODY_STYLE: React.CSSProperties = {
    flex: 1, overflowY: 'auto', padding: '8px 10px',
    display: 'flex', flexDirection: 'column', gap: 8,
  }

  function renderWeapon(w: WpnDisplay) {
    const dmgVal = w.damage.isMelee
      ? `${w.damage.brawn + w.damage.baseDamage}${w.damage.baseDamage > 0 ? ` (Br+${w.damage.baseDamage})` : ''}`
      : String(w.damage.baseDamage)
    const typeTag = w.damage.isMelee ? 'Melee' : 'Ranged'
    return (
      <>
        <ItemDetailHero name={w.name} typeTag={typeTag} icon="⚔" iconUrl={w.iconUrl} hardPoints={w.hardPoints} hardPointsUsed={0} item_image_url={w.item_image_url} />
        <div style={STATS_ROW_STYLE}>
          <StatBox label="DMG"   value={dmgVal}       color="var(--die-threat)" />
          <StatBox label="CRIT"  value={w.crit}       color="var(--die-challenge)" />
          <StatBox label="RANGE" value={w.range}      color="var(--die-advantage)" />
          <StatBox label="ENC"   value={w.enc}        color="var(--hud-text-dim)" />
          <StatBox label="HP"    value={w.hardPoints} color="var(--hud-accent-purple)" />
        </div>
        <div style={BODY_STYLE}>
          {w.description && <p style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)', lineHeight: 1.5, margin: 0 }}>{stripBBCode(w.description)}</p>}
          <ItemQualityList qualities={w.qualities} refWeaponQualityMap={refWeaponQualityMap} />
          <div><SectionHeader>Condition</SectionHeader><ItemConditionTrack condition={w.condition} /></div>
          <div>
            <SectionHeader>Equip State</SectionHeader>
            <EquipButtons equipState={w.equipState} condition={w.condition} stowLocation={w.stowLocation} stowableAssets={stowableAssets} baseOfOperationsName={baseOfOperationsName} name={w.name} onSet={(s, loc) => onSetWeaponState(w.id, s, loc)} />
          </div>
          {onDiscardWeapon && <DiscardFooter isGm={!!isGmMode} characterName={characterName} showDiscard={showDiscard} setShowDiscard={setShowDiscard} onConfirm={note => onDiscardWeapon(w.id, note)} />}
        </div>
      </>
    )
  }

  function renderArmor(a: ArmDisplay) {
    return (
      <>
        <ItemDetailHero name={a.name} typeTag="Armour" icon="◈" iconUrl={a.iconUrl} hardPoints={a.hardPoints} hardPointsUsed={0} item_image_url={a.item_image_url} />
        <div style={STATS_ROW_STYLE}>
          <StatBox label="SOAK" value={a.soak}       color="var(--die-success)" />
          <StatBox label="DEF"  value={a.defense}    color="var(--die-force)" />
          <StatBox label="ENC"  value={a.enc}        color="var(--hud-text-dim)" />
          <StatBox label="HP"   value={a.hardPoints} color="var(--hud-accent-purple)" />
        </div>
        <div style={BODY_STYLE}>
          {a.description && <p style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)', lineHeight: 1.5, margin: 0 }}>{stripBBCode(a.description)}</p>}
          <div><SectionHeader>Condition</SectionHeader><ItemConditionTrack condition={a.condition} /></div>
          <div>
            <SectionHeader>Equip State</SectionHeader>
            <EquipButtons equipState={a.equipState} condition={a.condition} stowLocation={a.stowLocation} stowableAssets={stowableAssets} baseOfOperationsName={baseOfOperationsName} name={a.name} onSet={(s, loc) => onSetArmorState(a.id, s, loc)} />
          </div>
          {onDiscardArmor && <DiscardFooter isGm={!!isGmMode} characterName={characterName} showDiscard={showDiscard} setShowDiscard={setShowDiscard} onConfirm={note => onDiscardArmor(a.id, note)} />}
        </div>
      </>
    )
  }

  function renderGear(g: GearRow) {
    return (
      <>
        <ItemDetailHero name={g.name} typeTag="Gear" icon="◆" iconUrl={g.iconUrl} hardPoints={0} hardPointsUsed={0} item_image_url={g.item_image_url} />
        <div style={STATS_ROW_STYLE}>
          <StatBox label="QTY" value={g.qty} color="var(--hud-gold)" />
          <StatBox label="ENC" value={g.enc} color="var(--hud-text-dim)" />
        </div>
        <div style={BODY_STYLE}>
          {g.description && <p style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)', lineHeight: 1.5, margin: 0 }}>{stripBBCode(g.description)}</p>}
          <div><SectionHeader>Condition</SectionHeader><ItemConditionTrack condition={g.condition} /></div>
          <div>
            <SectionHeader>Equip State</SectionHeader>
            <EquipButtons equipState={g.equipState} condition={g.condition} stowLocation={g.stowLocation} stowableAssets={stowableAssets} baseOfOperationsName={baseOfOperationsName} name={g.name} onSet={(s, loc) => onSetGearState(g.id, s, loc)} />
          </div>
          {onDiscardGear && <DiscardFooter isGm={!!isGmMode} characterName={characterName} showDiscard={showDiscard} setShowDiscard={setShowDiscard} onConfirm={note => onDiscardGear(g.id, note)} />}
        </div>
      </>
    )
  }

  return (
    <div ref={detailRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--hud-surface-lo)', overflow: 'hidden' }}>
      {selected.kind === 'weapon' && renderWeapon(selected.item)}
      {selected.kind === 'armor'  && renderArmor(selected.item)}
      {selected.kind === 'gear'   && renderGear(selected.item)}
    </div>
  )
}
