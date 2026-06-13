'use client'
import React, { useState } from 'react'
import { FONT_DISPLAY, FONT_BODY, FS, SP, HUD, COLOR, RADIUS } from '@/lib/tokens'
import type { WpnDisplay, ArmDisplay, GearRow } from '@/lib/types'
import { MobileBottomSheet } from '@/components/mobile/MobileBottomSheet'

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

function ItemRow({ label, subLabel, onClick }: { label: string; subLabel: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', gap: '2px',  /* compact row — below SP[1] floor */
      width: '100%', textAlign: 'left',
      padding: `${SP[1]} ${SP[2]}`,
      background: 'transparent', border: 'none',
      borderBottom: `1px solid var(--hud-border)`,
      cursor: 'pointer', minHeight: 44,  /* WCAG minimum */
      justifyContent: 'center',
    }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text }}>{label}</span>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.06em' }}>{subLabel}</span>
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
function ItemDetail({ item }: { item: DetailItem }) {
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
        <Stat label="Damage" value={dmgLabel} />
        <Stat label="Critical" value={w.crit} />
        <Stat label="Range" value={w.range || '—'} />
        <Stat label="Encumbrance" value={w.enc} />
        <Stat label="Skill" value={w.skillName || '—'} />
        {quals && <Stat label="Qualities" value={quals} />}
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
        <Stat label="Defense" value={a.defense} />
        <Stat label="Soak Bonus" value={`+${a.soak}`} />
        <Stat label="Encumbrance" value={a.enc} />
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
      <Stat label="Encumbrance" value={g.enc} />
      <Stat label="Quantity" value={g.qty} />
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
}: MobileItemsScreenProps) {
  const [detail, setDetail] = useState<DetailItem | null>(null)

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
              onClick={() => setDetail({ kind: 'gear', data: g })}
            />
          )
        })}
      </div>

      {/* ── Item detail bottom sheet ── */}
      <MobileBottomSheet open={!!detail} onClose={() => setDetail(null)}>
        {detail && <ItemDetail item={detail} />}
      </MobileBottomSheet>
    </div>
  )
}
