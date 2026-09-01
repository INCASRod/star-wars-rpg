'use client'
import React, { useState, useRef, useLayoutEffect } from 'react'
import { FONT_BODY, FONT_DISPLAY, RADIUS, FS, SP } from '@/lib/tokens'
import type { WpnDisplay, ArmDisplay, GearRow, EquipState, StowLocation, StowableAsset, RefWeaponQuality, ItemCondition } from '@/lib/types'
import type { EncumbranceStats } from '@/lib/derivedStats'
import { ItemDetailHero } from './item-detail-hero'
import { ItemQualityList } from './item-quality-list'
import { StowLocationModal, StowPill } from './stow-location-modal'
import { RichText } from '@/components/ui/RichText'

// ── Types ────────────────────────────────────────────────────────────────────

export type SelectedItem =
  | { kind: 'weapon'; item: WpnDisplay }
  | { kind: 'armor';  item: ArmDisplay }
  | { kind: 'gear';   item: GearRow    }

interface ItemDetailPanelProps {
  selected:              SelectedItem
  refWeaponQualityMap:   Record<string, RefWeaponQuality>
  encumbranceStats:      EncumbranceStats | null
  // Ledger hover-preview trigger (Prompt 6, Task 2) — hovering a state
  // button below simulates moving THIS item to that state. id=null on
  // mouse-leave clears the preview. Optional so callers that don't wire the
  // Ledger (none today) don't have to pass a no-op.
  onHoverState?:         (id: string | null, type: 'weapon' | 'armor' | 'gear', targetState?: EquipState) => void
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
      borderRadius: RADIUS.md, padding: `${SP[1]} var(--space-2)`, minWidth: '2.5rem',
    }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: SP[1] }}>{label}</div>
    </div>
  )
}

// ── Status pill ──────────────────────────────────────────────────────────────

const CONDITION_TONE: Record<ItemCondition, 'ok' | 'warn'> = {
  undamaged: 'ok', minor: 'ok', moderate: 'warn', major: 'warn', destroyed: 'warn',
}
const CONDITION_LABEL: Record<ItemCondition, string> = {
  undamaged: 'Undamaged', minor: 'Minor Damage', moderate: 'Moderate Damage', major: 'Major Damage', destroyed: 'Destroyed',
}
const EQUIP_STATE_LABEL: Record<EquipState, string> = { equipped: 'Equipped', carrying: 'Carried', stowed: 'Stowed' }

function Pill({ children, tone }: { children: React.ReactNode; tone?: 'eq' | 'ok' | 'warn' }) {
  const toneStyle = tone === 'eq'
    ? { background: 'color-mix(in srgb, var(--hud-gold) 14%, transparent)', borderColor: 'var(--hud-gold)', color: 'var(--hud-gold)', fontWeight: 700 }
    : tone === 'ok'
    ? { borderColor: 'color-mix(in srgb, var(--die-success) 45%, transparent)', color: 'var(--die-success)' }
    : tone === 'warn'
    ? { borderColor: 'color-mix(in srgb, var(--hud-vital-wounds) 45%, transparent)', color: 'var(--hud-vital-wounds)' }
    : { color: 'var(--hud-text-dim)' }
  return (
    <span style={{
      fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.14em', textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: RADIUS.sm, border: '1px solid var(--hud-border-hi)',
      ...toneStyle,
    }}>
      {children}
    </span>
  )
}

// ── Section header (Mods/Lore empty-state label) ──────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'var(--hud-gold)', marginBottom: SP[1],
      borderBottom: '1px solid var(--hud-border)', paddingBottom: SP[1],
    }}>
      {children}
    </div>
  )
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

type TabKey = 'enc' | 'mods' | 'lore'
const TABS: { key: TabKey; label: string }[] = [
  { key: 'enc',  label: 'Encumbrance' },
  { key: 'mods', label: 'Mods' },
  { key: 'lore', label: 'Lore' },
]

function TabBar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <div style={{ display: 'flex', borderTop: '1px solid var(--hud-border)', borderBottom: '1px solid var(--hud-border)' }}>
      {TABS.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            flex: 1, fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.14em', textTransform: 'uppercase',
            background: 'transparent', border: 0, borderBottom: `2px solid ${active === t.key ? 'var(--hud-gold)' : 'transparent'}`,
            color: active === t.key ? 'var(--hud-gold)' : 'var(--hud-text-faint)',
            padding: `${SP[2]} 4px`, cursor: 'pointer', transition: `color ${'var(--ease-default)'}, border-color var(--ease-default)`,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── Encumbrance tab ──────────────────────────────────────────────────────────

function EncumbranceLedgerRow({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'gain' | 'dim' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${SP[1]} 0`, borderBottom: '1px solid var(--hud-border)' }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-dim)' }}>{label}</span>
      <span style={{
        fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
        color: tone === 'gain' ? 'var(--green)' : tone === 'dim' ? 'var(--hud-text-faint)' : 'var(--hud-text)',
      }}>
        {value}
      </span>
    </div>
  )
}

function reasonNote(reason: 'anchor_occupied_armor' | 'anchor_occupied_capacity'): string {
  return reason === 'anchor_occupied_armor'
    ? 'Another suit is already worn on this anchor — full encumbrance charged, no worn reduction.'
    : 'Another item already occupies this anchor — no threshold bonus granted while it stays there.'
}

function EncumbranceTab({ item, isArmor, encumbranceStats }: {
  item: { id: string; enc: number }
  isArmor: boolean
  encumbranceStats: EncumbranceStats | null
}) {
  const perItem = encumbranceStats?.perItem[item.id]
  if (!perItem) {
    return <p style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)', fontStyle: 'italic' }}>Encumbrance data unavailable.</p>
  }
  const wornReduction = isArmor && perItem.cost < item.enc
  const costSuppressed = perItem.reason === 'anchor_occupied_armor'
  const gainSuppressed = perItem.reason === 'anchor_occupied_capacity'

  return (
    <div>
      <EncumbranceLedgerRow label="Base encumbrance" value={item.enc} />
      {wornReduction && <EncumbranceLedgerRow label="Worn reduction" value="−3" tone="dim" />}
      {perItem.gain > 0 && <EncumbranceLedgerRow label="Threshold granted (worn)" value={`+${perItem.gain}`} tone="gain" />}
      <EncumbranceLedgerRow label="Mods" value="none installed" tone="dim" />
      {(costSuppressed || gainSuppressed) && (
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-vital-wounds)', padding: `${SP[1]} 0` }}>
          ⚠ {reasonNote(perItem.reason!)}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: SP[2] }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-dim)' }}>Net effect</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, color: perItem.gain > 0 ? 'var(--green)' : 'var(--hud-gold)' }}>
          {perItem.gain > 0 ? `+${perItem.gain} capacity` : `${perItem.cost} load`}
        </span>
      </div>
    </div>
  )
}

// ── Mods tab ─────────────────────────────────────────────────────────────────

function ModsTab({ hardPoints, hardPointsUsed }: { hardPoints: number; hardPointsUsed: number }) {
  if (hardPoints <= 0) {
    return <p style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)', fontStyle: 'italic' }}>No hard points. This item cannot take attachments.</p>
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: SP[1] }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Hard Points</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-dim)' }}>{hardPointsUsed} / {hardPoints}</span>
      </div>
      <div style={{ display: 'flex', gap: 3, marginBottom: SP[1] }}>
        {Array.from({ length: hardPoints }, (_, i) => (
          <span key={i} style={{
            width: 14, height: 8, borderRadius: 1,
            border: '1px solid var(--hud-border-hi)',
            background: i < hardPointsUsed ? 'color-mix(in srgb, var(--hud-gold) 45%, transparent)' : 'transparent',
          }} />
        ))}
      </div>
      <p style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-faint)', fontStyle: 'italic', margin: 0 }}>
        No attachments installed.
      </p>
    </div>
  )
}

// ── Equip buttons (state segmented control) ───────────────────────────────────

const EQUIP_STATES: EquipState[] = ['stowed', 'carrying', 'equipped']

interface EquipButtonsProps {
  itemId:                string
  itemType:              'weapon' | 'armor' | 'gear'
  equipState:            EquipState
  condition:             ItemCondition
  stowLocation?:         StowLocation | null
  stowableAssets?:       StowableAsset[]
  baseOfOperationsName?: string | null
  name:                  string
  onSet:                 (state: EquipState, location?: StowLocation | null) => void
  onHoverState?:         (id: string | null, type: 'weapon' | 'armor' | 'gear', targetState?: EquipState) => void
}

function EquipButtons({ itemId, itemType, equipState, condition, stowLocation, stowableAssets, baseOfOperationsName, name, onSet, onHoverState }: EquipButtonsProps) {
  const [stowModalOpen, setStowModalOpen] = useState(false)
  const canEquip = condition !== 'major' && condition !== 'destroyed'

  function handleClick(s: EquipState) {
    if (s === equipState) return
    if (s === 'stowed') { setStowModalOpen(true); return }
    onSet(s)
  }

  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', border: '1px solid var(--hud-border-hi)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
        {EQUIP_STATES.map(s => {
          const isActive   = equipState === s
          const isDisabled = s === 'equipped' && !canEquip
          return (
            <button
              key={s}
              onClick={() => !isDisabled && handleClick(s)}
              disabled={isDisabled}
              // Hovering a button the item is ALREADY in previews nothing —
              // onHoverState still fires (simpler than special-casing), but
              // isActive means targetState === equipState so the Ledger's
              // simStats comes back identical to the true state and
              // LedgerHero's own ghostDirection logic naturally suppresses
              // the ghost (simLoadPct === loadPct).
              onMouseEnter={() => onHoverState?.(itemId, itemType, s)}
              onMouseLeave={() => onHoverState?.(null, itemType)}
              style={{
                flex: 1, height: '1.875rem',
                cursor: isDisabled ? 'not-allowed' : isActive ? 'default' : 'pointer',
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                border: 0, transition: 'background var(--ease-default), color var(--ease-default)',
                background: isActive ? 'var(--hud-gold)' : 'transparent',
                color: isActive ? 'var(--hud-surface-lo)' : isDisabled ? 'var(--hud-text-faint)' : 'var(--hud-text-dim)',
                opacity: isDisabled ? 0.4 : 1,
              }}
            >
              {EQUIP_STATE_LABEL[s]}
            </button>
          )
        })}
      </div>
      {equipState === 'stowed' && stowLocation && (
        <div style={{ marginTop: SP[1] }}>
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

// ── Discard ──────────────────────────────────────────────────────────────────

function DiscardStrip({ isGm, characterName, onCancel, onConfirm }: {
  isGm: boolean; characterName?: string; onCancel: () => void; onConfirm: (note?: string) => void
}) {
  const [note, setNote] = useState('')
  const accent = isGm ? 'var(--hud-gold)' : 'var(--hud-vital-wounds)'
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: SP[2], flex: 1 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.label, color: accent, fontWeight: 600 }}>
          {isGm ? `Remove from ${characterName ?? 'character'}?` : 'Drop this item?'}
        </div>
        {isGm && (
          <input
            type="text" value={note} onChange={e => setNote(e.target.value)}
            placeholder="Note (optional)"
            style={{
              marginTop: SP[1], width: '100%', boxSizing: 'border-box' as const,
              background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)',
              color: 'var(--hud-text)', fontFamily: FONT_BODY, fontSize: FS.overline,
              padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm, outline: 'none',
            }}
          />
        )}
      </div>
      <button
        onClick={onCancel}
        style={{
          height: '1.625rem', padding: `0 ${SP[2]}`, borderRadius: RADIUS.sm, cursor: 'pointer',
          fontFamily: FONT_BODY, fontSize: FS.overline,
          background: 'transparent', border: '1px solid var(--hud-border)', color: 'var(--hud-text-dim)',
          flexShrink: 0,
        }}
      >Cancel</button>
      <button
        onClick={() => onConfirm(isGm && note.trim() ? note.trim() : undefined)}
        style={{
          height: '1.625rem', padding: `0 ${SP[2]}`, borderRadius: RADIUS.sm, cursor: 'pointer',
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

// ── Main component ────────────────────────────────────────────────────────────

export function ItemDetailPanel({
  selected, refWeaponQualityMap, encumbranceStats, onHoverState,
  stowableAssets, baseOfOperationsName,
  onSetWeaponState, onSetArmorState, onSetGearState,
  onDiscardWeapon, onDiscardArmor, onDiscardGear,
  isGmMode, characterName,
}: ItemDetailPanelProps) {
  const [showDiscard, setShowDiscard] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('enc')
  const [prevId, setPrevId] = useState<string | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const currentId = selected.item.id
  if (currentId !== prevId) { setShowDiscard(false); setActiveTab('enc'); setPrevId(currentId) }

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
    display: 'flex', gap: SP[1], padding: `${SP[2]} ${SP[2]} 0`,
    flexWrap: 'wrap', alignItems: 'center',
  }

  function IdentityBlock({ name, typeTag, state, condition }: { name: string; typeTag: string; state: EquipState; condition: ItemCondition }) {
    return (
      <div style={{ padding: `${SP[2]} ${SP[2]} 0` }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 600, color: 'var(--hud-text)', margin: 0, lineHeight: 1.15 }}>{name}</h2>
        <div style={{ display: 'flex', gap: SP[1], marginTop: SP[1], flexWrap: 'wrap' }}>
          <Pill tone="eq">{EQUIP_STATE_LABEL[state]}</Pill>
          <Pill>{typeTag}</Pill>
          <Pill tone={CONDITION_TONE[condition]}>{CONDITION_LABEL[condition]}</Pill>
        </div>
      </div>
    )
  }

  // No heading, deliberately — Prompt 4's audit found the effect_text/
  // lore_text split (migration 124) misroutes ~55% of weapons, ~30% of
  // armour, ~25% of gear (flavour text landing here instead of mechanics),
  // with no reliable textual signal to auto-correct it. Labelling this
  // block "Effect" asserted a mechanical/flavour distinction the data
  // can't support. The left border is kept as a structural cue only — do
  // not restore a label here; see docs/architecture.md before changing this.
  function EffectBlock({ effectText }: { effectText?: string | null }) {
    if (!effectText || !effectText.trim()) return null
    return (
      <div style={{
        margin: `${SP[2]} ${SP[2]} 0`, padding: SP[2], borderRadius: RADIUS.md,
        background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', borderLeft: '2px solid var(--hud-gold)',
      }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text)', lineHeight: 1.7 }}>
          <RichText text={effectText} />
        </div>
      </div>
    )
  }

  // Tab bar + active tab content only — NOT the footer. Lives INSIDE the
  // single scroll region below (see the root return), alongside the hero/
  // identity/stats/effect block, so the tab content isn't the only thing
  // that can scroll — everything above it can too when it doesn't fit.
  function TabsBody({ isArmor, hardPoints, hardPointsUsed, loreText, item }: {
    isArmor: boolean; hardPoints: number; hardPointsUsed: number; loreText?: string | null
    item: { id: string; enc: number }
  }) {
    return (
      <>
        <TabBar active={activeTab} onChange={setActiveTab} />
        <div style={{ padding: `${SP[2]} ${SP[2]}` }}>
          {activeTab === 'enc' && <EncumbranceTab item={item} isArmor={isArmor} encumbranceStats={encumbranceStats} />}
          {activeTab === 'mods' && <ModsTab hardPoints={hardPoints} hardPointsUsed={hardPointsUsed} />}
          {activeTab === 'lore' && (
            loreText && loreText.trim()
              ? <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-dim)', lineHeight: 1.85 }}><RichText text={loreText} /></div>
              : <p style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)', fontStyle: 'italic' }}>No lore recorded.</p>
          )}
        </div>
      </>
    )
  }

  // State control + Discard — pinned outside the scroll region (flexShrink:0
  // sibling in the root return) so it's reachable regardless of how tall the
  // scrollable content above it is.
  function Footer({ equipState, condition, stowLocation, name, itemId, itemType, onSet, onDiscard }: {
    equipState: EquipState; condition: ItemCondition; stowLocation?: StowLocation | null; name: string; itemId: string
    itemType: 'weapon' | 'armor' | 'gear'
    onSet: (state: EquipState, location?: StowLocation | null) => void
    onDiscard?: (id: string, note?: string) => void
  }) {
    return (
      <div style={{
        padding: `${SP[2]} ${SP[2]}`, borderTop: '1px solid var(--hud-border)',
        display: 'flex', gap: SP[2], alignItems: 'flex-start', background: 'var(--hud-surface-lo)', flexShrink: 0,
      }}>
        {showDiscard ? (
          <DiscardStrip
            isGm={!!isGmMode} characterName={characterName}
            onCancel={() => setShowDiscard(false)}
            onConfirm={note => { setShowDiscard(false); onDiscard?.(itemId, note) }}
          />
        ) : (
          <>
            <EquipButtons itemId={itemId} itemType={itemType} equipState={equipState} condition={condition} stowLocation={stowLocation} stowableAssets={stowableAssets} baseOfOperationsName={baseOfOperationsName} name={name} onSet={onSet} onHoverState={onHoverState} />
            {onDiscard && (
              <button
                onClick={() => setShowDiscard(true)}
                style={{
                  fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.14em', textTransform: 'uppercase',
                  background: 'transparent', border: '1px solid color-mix(in srgb, var(--hud-vital-wounds) 40%, transparent)',
                  color: 'var(--hud-vital-wounds)', borderRadius: RADIUS.sm, padding: `0 ${SP[3]}`, cursor: 'pointer', flexShrink: 0,
                }}
              >
                {isGmMode ? 'Remove' : 'Discard'}
              </button>
            )}
          </>
        )}
      </div>
    )
  }

  function renderScrollBody(kind: SelectedItem['kind']): React.ReactNode {
    if (kind === 'weapon') {
      const w = (selected as { kind: 'weapon'; item: WpnDisplay }).item
      const dmgVal = w.damage.isMelee
        ? `${w.damage.brawn + w.damage.baseDamage}${w.damage.baseDamage > 0 ? ` (Br+${w.damage.baseDamage})` : ''}`
        : String(w.damage.baseDamage)
      const typeTag = w.damage.isMelee ? 'Melee' : 'Ranged'
      return (
        <>
          <ItemDetailHero name={w.name} typeTag={typeTag} iconUrl={w.iconUrl} itemTable="weapon" refKey={w.refKey} categories={w.categories} item_image_url={w.item_image_url} />
          <IdentityBlock name={w.name} typeTag={typeTag} state={w.equipState} condition={w.condition} />
          <div style={STATS_ROW_STYLE}>
            <StatBox label="DMG"   value={dmgVal}       color="var(--die-threat)" />
            <StatBox label="CRIT"  value={w.crit}       color="var(--die-challenge)" />
            <StatBox label="RANGE" value={w.range}      color="var(--die-advantage)" />
            <StatBox label="SKILL" value={w.skillName}  color="var(--die-force)" />
            <StatBox label="ENC"   value={w.enc}        color="var(--hud-text-dim)" />
            <StatBox label="HP"    value={w.hardPoints} color="var(--hud-accent-purple)" />
            {w.qualities.length > 0 && (
              <ItemQualityList qualities={w.qualities} refWeaponQualityMap={refWeaponQualityMap} />
            )}
          </div>
          <EffectBlock effectText={w.effectText} />
          <TabsBody isArmor={false} hardPoints={w.hardPoints} hardPointsUsed={0} loreText={w.loreText} item={{ id: w.id, enc: w.enc }} />
        </>
      )
    }
    if (kind === 'armor') {
      const a = (selected as { kind: 'armor'; item: ArmDisplay }).item
      return (
        <>
          <ItemDetailHero name={a.name} typeTag="Armour" iconUrl={a.iconUrl} itemTable="armor" refKey={a.refKey} categories={a.categories} item_image_url={a.item_image_url} />
          <IdentityBlock name={a.name} typeTag="Armour" state={a.equipState} condition={a.condition} />
          <div style={STATS_ROW_STYLE}>
            <StatBox label="SOAK" value={a.soak}       color="var(--die-success)" />
            <StatBox label="DEF"  value={a.defense}    color="var(--die-force)" />
            <StatBox label="ENC"  value={a.enc}        color="var(--hud-text-dim)" />
            <StatBox label="HP"   value={a.hardPoints} color="var(--hud-accent-purple)" />
          </div>
          <EffectBlock effectText={a.effectText} />
          <TabsBody isArmor hardPoints={a.hardPoints} hardPointsUsed={0} loreText={a.loreText} item={{ id: a.id, enc: a.enc }} />
        </>
      )
    }
    const g = (selected as { kind: 'gear'; item: GearRow }).item
    return (
      <>
        <ItemDetailHero name={g.name} typeTag="Gear" iconUrl={g.iconUrl} itemTable="gear" refKey={g.refKey} categories={g.categories} item_image_url={g.item_image_url} />
        <IdentityBlock name={g.name} typeTag="Gear" state={g.equipState} condition={g.condition} />
        <div style={STATS_ROW_STYLE}>
          <StatBox label="QTY" value={g.qty} color="var(--hud-gold)" />
          <StatBox label="ENC" value={g.enc} color="var(--hud-text-dim)" />
        </div>
        <EffectBlock effectText={g.effectText} />
        <TabsBody isArmor={false} hardPoints={0} hardPointsUsed={0} loreText={g.loreText} item={{ id: g.id, enc: g.enc }} />
      </>
    )
  }

  function renderFooter(): React.ReactNode {
    if (selected.kind === 'weapon') {
      const w = selected.item
      return <Footer equipState={w.equipState} condition={w.condition} stowLocation={w.stowLocation} name={w.name} itemId={w.id} itemType="weapon" onSet={(s, loc) => onSetWeaponState(w.id, s, loc)} onDiscard={onDiscardWeapon} />
    }
    if (selected.kind === 'armor') {
      const a = selected.item
      return <Footer equipState={a.equipState} condition={a.condition} stowLocation={a.stowLocation} name={a.name} itemId={a.id} itemType="armor" onSet={(s, loc) => onSetArmorState(a.id, s, loc)} onDiscard={onDiscardArmor} />
    }
    const g = selected.item
    return <Footer equipState={g.equipState} condition={g.condition} stowLocation={g.stowLocation} name={g.name} itemId={g.id} itemType="gear" onSet={(s, loc) => onSetGearState(g.id, s, loc)} onDiscard={onDiscardGear} />
  }

  return (
    <div ref={detailRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--hud-surface-lo)', overflow: 'hidden', minHeight: 0 }}>
      {/* Single scroll region — hero through tab content. Root-cause fix
          (Prompt 3a): the Prompt 3 rebuild grew the hero (80px -> 230px) and
          added the identity block + effect block as fixed, unscrollable
          content ABOVE a too-small nested scroll area; once that fixed stack
          plus the tab bar plus the footer exceeded the panel's available
          height, the footer/tabs were clipped by this container's own
          overflow:hidden with no way to reach them. Folding everything above
          the footer into one overflowY:auto region restores the old (pre-
          Prompt-3) single-scroll guarantee while still pinning the footer. */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {renderScrollBody(selected.kind)}
      </div>
      {renderFooter()}
    </div>
  )
}
