'use client'
import React, { useState } from 'react'
import { FONT_DISPLAY, FONT_BODY, FS, SP, HUD, COLOR, RADIUS } from '@/lib/tokens'
import type { WpnDisplay, ArmDisplay, GearRow, StowLocation } from '@/lib/types'
import { MobileBottomSheet } from '@/components/mobile/MobileBottomSheet'
import { MobileStowLocationSheet } from '@/components/mobile/MobileStowLocationSheet'
import { RichText } from '@/components/ui/RichText'
import { ItemReadoutPlate } from '@/components/shared/ItemReadoutPlate'
import type { ItemTable } from '@/lib/itemIconResolver'

// ─── Sealed colour exception ──────────────────────────────────────
const DANGER_COLOR = '#E85A2A'  /* wounds/danger — sealed exception */

// ─── Props ────────────────────────────────────────────────────────
interface MobileItemsScreenProps {
  hudWeapons:   WpnDisplay[]
  hudArmor:     ArmDisplay[]
  hudGear:      GearRow[]
  encCurrent:   number
  encThreshold: number
  credits:      number
  handleSetEquipState: (
    id: string,
    type: 'weapon' | 'armor' | 'gear',
    state: 'equipped' | 'carrying' | 'stowed',
    location?: StowLocation | null,
  ) => Promise<void>
  campaignId: string
}

// ─── Detail union type ─────────────────────────────────────────────
type DetailItem =
  | { kind: 'weapon'; data: WpnDisplay }
  | { kind: 'armor';  data: ArmDisplay }
  | { kind: 'gear';   data: GearRow }

// ─── Sub-components ────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: SP[2],
      padding: `${SP[1]} ${SP[2]}`,
      background: 'var(--hud-surface-lo)',
      borderBottom: `1px solid var(--hud-border)`,
    }}>
      <span style={{
        fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
        letterSpacing: '0.15em', textTransform: 'uppercase', flex: 1,
      }}>{title}</span>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>{count}</span>
    </div>
  )
}

function ItemRow({ label, subLabel, onClick, iconUrl, table }: { label: string; subLabel: string; onClick: () => void; iconUrl?: string | null; table?: ItemTable }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: SP[2],
      width: '100%', textAlign: 'left',
      padding: `${SP[1]} ${SP[2]}`,
      background: 'transparent', border: 'none',
      borderBottom: `1px solid var(--hud-border)`,
      cursor: 'pointer', minHeight: 44,  /* WCAG minimum */
    }}>
      {iconUrl && table && (
        <div style={{ width: '1.75rem', height: '1.75rem', flexShrink: 0 }}>
          <ItemReadoutPlate iconUrl={iconUrl} table={table} alt={label} size="row" />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 /* compact row — below SP[1] floor */ }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text }}>{label}</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.06em' }}>{subLabel}</span>
      </div>
    </button>
  )
}

// ─── Stat row used inside ItemDetail ──────────────────────────────
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: `${SP[1]} 0`,
      borderBottom: `1px solid var(--hud-border)`,
    }}>
      <span style={{
        fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>{label}</span>
      <span style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: HUD.text,
      }}>{value}</span>
    </div>
  )
}

// ─── Weapon damage display helper ─────────────────────────────────
function weaponDamageLabel(w: WpnDisplay): string {
  if (w.damage.isMelee) return `${w.damage.brawn + w.damage.baseDamage} (${w.damage.brawn}+${w.damage.baseDamage})`
  return String(w.damage.baseDamage)
}

// ─── Qualities label helper ───────────────────────────────────────
function qualitiesLabel(qualities: WpnDisplay['qualities']): string {
  if (!qualities || qualities.length === 0) return ''
  return qualities.map(q => q.count != null && q.count > 0 ? `${q.key} ${q.count}` : q.key).join(', ')
}

// ─── Item detail panel ─────────────────────────────────────────────
function ItemDetail({
  item,
  onEquip,
  onCarry,
  onStow,
  loading,
}: {
  item: DetailItem
  onEquip: () => void
  onCarry: () => void
  onStow: () => void
  loading: 'stowed' | 'carrying' | 'equipped' | null
}) {
  // Derive shared state from item
  const equipState = item.kind === 'weapon' ? item.data.equipState
                   : item.kind === 'armor'  ? item.data.equipState
                   :                          item.data.equipState
  const condition  = item.kind === 'weapon' ? item.data.condition
                   : item.kind === 'armor'  ? item.data.condition
                   :                          item.data.condition
  const enc        = item.kind === 'weapon' ? item.data.enc
                   : item.kind === 'armor'  ? item.data.enc
                   :                          item.data.enc
  const equipDisabled = condition === 'major' || condition === 'destroyed'
  const equipLabel    = item.kind === 'gear' ? '✓ Equip' : '⚔ Equip'

  // Shared button base style
  const btnBase: React.CSSProperties = {
    flex: 1,
    minHeight: 44,  /* WCAG minimum touch target — fixed affordance constant */
    fontFamily: FONT_DISPLAY,
    fontSize: FS.overline,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    borderRadius: RADIUS.sm,
    border: '1px solid',
    cursor: 'pointer',
  }

  // EquipStateRow — three buttons
  const equipStateRow = (
    <div style={{ display: 'flex', gap: SP[1], marginBottom: SP[2] }}>
      {/* STOW */}
      <button
        disabled={loading !== null}
        onClick={onStow}
        style={{
          ...btnBase,
          background: equipState === 'stowed'
            ? 'color-mix(in srgb, var(--die-advantage) 15%, transparent)'
            : 'var(--hud-surface-lo)',
          borderColor: equipState === 'stowed'
            ? 'color-mix(in srgb, var(--die-advantage) 50%, transparent)'
            : 'var(--hud-border)',
          color: equipState === 'stowed' ? 'var(--die-advantage)' : HUD.textFaint,
        }}
      >
        {loading === 'stowed' ? '…' : '📦 Stow'}
      </button>

      {/* CARRY */}
      <button
        disabled={loading !== null}
        onClick={onCarry}
        style={{
          ...btnBase,
          background: equipState === 'carrying'
            ? 'color-mix(in srgb, var(--hud-gold) 15%, transparent)'
            : 'var(--hud-surface-lo)',
          borderColor: equipState === 'carrying'
            ? 'color-mix(in srgb, var(--hud-gold) 50%, transparent)'
            : 'var(--hud-border)',
          color: equipState === 'carrying' ? 'var(--hud-gold)' : HUD.textFaint,
        }}
      >
        {loading === 'carrying' ? '…' : '🎒 Carry'}
      </button>

      {/* EQUIP */}
      <button
        disabled={equipDisabled || loading !== null}
        onClick={onEquip}
        style={{
          ...btnBase,
          background: equipState === 'equipped'
            ? 'color-mix(in srgb, var(--hud-accent) 15%, transparent)'
            : 'var(--hud-surface-lo)',
          borderColor: equipState === 'equipped'
            ? 'color-mix(in srgb, var(--hud-accent) 50%, transparent)'
            : 'var(--hud-border)',
          color: equipState === 'equipped' ? 'var(--hud-accent)' : HUD.textFaint,
          opacity: (equipDisabled || loading !== null) ? 0.4 : 1,
          cursor: (equipDisabled || loading !== null) ? 'not-allowed' : 'pointer',
        }}
      >
        {loading === 'equipped' ? '…' : equipLabel}
      </button>
    </div>
  )

  // EncHint — shown when enc > 0
  const encHint = enc > 0 ? (
    <div style={{
      fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
      marginBottom: SP[2], letterSpacing: '0.06em',
    }}>
      ENC {enc} ·{item.kind === 'armor' ? ' equipped saves 3 enc' : ` stowing saves ${enc} enc`}
    </div>
  ) : null

  if (item.kind === 'weapon') {
    const w = item.data
    const dmgLabel = weaponDamageLabel(w)
    const quals = qualitiesLabel(w.qualities)
    return (
      <div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700, color: HUD.text,
          marginBottom: SP[2],
        }}>{w.name}</div>
        {equipStateRow}
        {encHint}
        <Stat label="Damage" value={dmgLabel} />
        <Stat label="Critical" value={w.crit} />
        <Stat label="Range" value={w.range || '—'} />
        <Stat label="Encumbrance" value={w.enc} />
        <Stat label="Skill" value={w.skillName || '—'} />
        {quals && <Stat label="Qualities" value={quals} />}
        {w.description && (
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: FS.label,
            color: HUD.textDim,
            lineHeight: 1.5,
            paddingTop: SP[2],
            borderTop: `1px solid var(--hud-border)`,
          }}>
            <RichText text={w.description} />
          </div>
        )}
      </div>
    )
  }

  if (item.kind === 'armor') {
    const a = item.data
    return (
      <div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700, color: HUD.text,
          marginBottom: SP[2],
        }}>{a.name}</div>
        {equipStateRow}
        {encHint}
        <Stat label="Defense" value={a.defense} />
        <Stat label="Soak Bonus" value={`+${a.soak}`} />
        <Stat label="Encumbrance" value={a.enc} />
        {a.description && (
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: FS.label,
            color: HUD.textDim,
            lineHeight: 1.5,
            paddingTop: SP[2],
            borderTop: `1px solid var(--hud-border)`,
          }}>
            <RichText text={a.description} />
          </div>
        )}
      </div>
    )
  }

  // gear
  const g = item.data
  return (
    <div>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700, color: HUD.text,
        marginBottom: SP[2],
      }}>{g.name}</div>
      {equipStateRow}
      {encHint}
      <Stat label="Encumbrance" value={g.enc} />
      <Stat label="Quantity" value={g.qty} />
      {g.description && (
        <div style={{
          fontFamily: FONT_BODY,
          fontSize: FS.label,
          color: HUD.textDim,
          lineHeight: 1.5,
          paddingTop: SP[2],
          borderTop: `1px solid var(--hud-border)`,
        }}>
          <RichText text={g.description} />
        </div>
      )}
    </div>
  )
}

// ─── Main screen ───────────────────────────────────────────────────
export function MobileItemsScreen({
  hudWeapons,
  hudArmor,
  hudGear,
  encCurrent,
  encThreshold,
  credits,
  handleSetEquipState,
  campaignId,
}: MobileItemsScreenProps) {
  const [detail, setDetail] = useState<DetailItem | null>(null)
  const [stowSheetOpen, setStowSheetOpen]     = useState(false)
  const [pendingStowItem, setPendingStowItem] = useState<{ id: string; type: 'weapon' | 'armor' | 'gear' } | null>(null)
  const [loadingAction, setLoadingAction]     = useState<'stowed' | 'carrying' | 'equipped' | null>(null)

  // Encumbrance bar logic
  const overEnc  = encThreshold > 0 && encCurrent >= encThreshold
  const encPct   = encThreshold > 0 ? Math.min(1, encCurrent / encThreshold) : 0
  const barColor = overEnc ? DANGER_COLOR : COLOR.blue

  const creditsFormatted = credits.toLocaleString()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Fixed header ── */}
      <div style={{
        padding: `${SP[2]} ${SP[2]} ${SP[1]}`,
        borderBottom: `1px solid var(--hud-border)`,
        flexShrink: 0,
      }}>
        {/* Row 1: ENC label + value + credits */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], marginBottom: SP[1] }}>
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: overEnc ? DANGER_COLOR : HUD.textFaint,  /* wounds/danger — sealed exception */
            letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>ENC</span>
          <span style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
            color: barColor,
          }}>{encCurrent} / {encThreshold}</span>
          <div style={{ flex: 1 }} />
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: HUD.textFaint, letterSpacing: '0.06em',
          }}>₵{creditsFormatted}</span>
        </div>

        {/* Row 2: Encumbrance bar */}
        <div style={{
          height: 4,  /* fixed bar geometry — UI affordance constant */
          borderRadius: RADIUS.sm,
          background: `color-mix(in srgb, ${barColor} 20%, transparent)`,  /* DANGER_COLOR in color-mix — wounds/danger sealed exception */
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${encPct * 100}%`,
            borderRadius: RADIUS.sm,
            background: barColor,
            transition: 'width var(--ease-smooth)',
          }} />
        </div>
      </div>

      {/* ── Scrollable section list ── */}
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>

        {/* Weapons */}
        <SectionHeader title="Weapons" count={hudWeapons.length} />
        {hudWeapons.map(w => {
          const dmg = w.damage.isMelee
            ? `${w.damage.brawn + w.damage.baseDamage} Dmg`
            : `${w.damage.baseDamage} Dmg`
          const subLabel = `${dmg} · Crit ${w.crit} · ${w.range || '—'}`
          return (
            <ItemRow
              key={w.id}
              label={w.name}
              subLabel={subLabel}
              iconUrl={w.iconUrl}
              table="weapon"
              onClick={() => setDetail({ kind: 'weapon', data: w })}
            />
          )
        })}

        {/* Armor */}
        <SectionHeader title="Armor" count={hudArmor.length} />
        {hudArmor.map(a => {
          const subLabel = `Def ${a.defense} · Soak +${a.soak}`
          return (
            <ItemRow
              key={a.id}
              label={a.name}
              subLabel={subLabel}
              iconUrl={a.iconUrl}
              table="armor"
              onClick={() => setDetail({ kind: 'armor', data: a })}
            />
          )
        })}

        {/* Gear */}
        <SectionHeader title="Gear" count={hudGear.length} />
        {hudGear.map(g => {
          const subLabel = `Enc ${g.enc}${g.qty > 1 ? ` · ×${g.qty}` : ''}`
          return (
            <ItemRow
              key={g.id}
              label={g.name}
              subLabel={subLabel}
              iconUrl={g.iconUrl}
              table="gear"
              onClick={() => setDetail({ kind: 'gear', data: g })}
            />
          )
        })}
      </div>

      {/* ── Item detail bottom sheet ── */}
      <MobileBottomSheet open={!!detail} onClose={() => setDetail(null)}>
        {detail && (
          <ItemDetail
            item={detail}
            loading={loadingAction}
            onEquip={async () => {
              setLoadingAction('equipped')
              try {
                const type = detail.kind === 'weapon' ? 'weapon' : detail.kind === 'armor' ? 'armor' : 'gear'
                await handleSetEquipState(detail.data.id, type, 'equipped', null)
              } finally { setLoadingAction(null) }
            }}
            onCarry={async () => {
              setLoadingAction('carrying')
              try {
                const type = detail.kind === 'weapon' ? 'weapon' : detail.kind === 'armor' ? 'armor' : 'gear'
                await handleSetEquipState(detail.data.id, type, 'carrying', null)
              } finally { setLoadingAction(null) }
            }}
            onStow={() => {
              const type = detail.kind === 'weapon' ? 'weapon' : detail.kind === 'armor' ? 'armor' : 'gear'
              setPendingStowItem({ id: detail.data.id, type })
              setStowSheetOpen(true)
            }}
          />
        )}
      </MobileBottomSheet>

      {/* ── Stow location sheet (portal, layers above item detail sheet) ── */}
      <MobileStowLocationSheet
        isOpen={stowSheetOpen}
        onClose={() => { setStowSheetOpen(false); setPendingStowItem(null) }}
        onConfirm={async (location) => {
          if (!pendingStowItem) return
          setLoadingAction('stowed')
          try {
            await handleSetEquipState(pendingStowItem.id, pendingStowItem.type, 'stowed', location)
            setStowSheetOpen(false)
            setPendingStowItem(null)
            setDetail(null)  // close item detail sheet after successful stow
          } finally { setLoadingAction(null) }
        }}
        campaignId={campaignId}
        itemName={pendingStowItem
          ? (detail?.kind === 'weapon' ? detail.data.name
             : detail?.kind === 'armor' ? detail.data.name
             : detail?.data.name ?? '')
          : ''}
      />
    </div>
  )
}
