'use client'
import { FONT_BODY, FONT_DISPLAY, FS, RADIUS, SP, Z } from '@/lib/tokens'
import { ItemReadoutPlate } from '@/components/shared/ItemReadoutPlate'
import { TickerText } from '@/components/ui/TickerText'
import { useHudPanelContext } from '@/contexts/HudPanelContext'
import type { WpnDisplay, ArmDisplay, GearRow, EquipState, ItemCondition } from '@/lib/types'
import type { EncumbranceStats } from '@/lib/derivedStats'

interface ItemThumbGridProps {
  weapons:    WpnDisplay[]
  armorItems: ArmDisplay[]
  gearItems:  GearRow[]
  selectedId: string | null
  onSelect:   (id: string) => void
  encumbranceStats: EncumbranceStats | null
}

function SectionHead({ label, isOpen }: { label: string; isOpen: boolean }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: Z.raised,
      fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'var(--hud-gold)',
      background: 'var(--hud-surface-hi)',
      borderBottom: '1px solid var(--hud-border)',
      padding: `${SP[1]} ${SP[2]}`,
    }}>
      <TickerText text={label} isOpen={isOpen} />
    </div>
  )
}

const EQUIP_COLOR: Record<EquipState, string> = {
  equipped: 'var(--hud-gold)',
  carrying: 'var(--die-success)',
  stowed:   'var(--hud-text-faint)',
}
const EQUIP_LABEL: Record<EquipState, string> = { equipped: 'Equipped', carrying: 'Carried', stowed: 'Stowed' }
const CONDITION_LABEL: Record<ItemCondition, string> = {
  undamaged: 'Undamaged', minor: 'Minor', moderate: 'Moderate', major: 'Major', destroyed: 'Destroyed',
}
const CONDITION_COLOR: Record<ItemCondition, string> = {
  undamaged: 'var(--die-success)', minor: 'var(--die-success)',
  moderate: 'var(--die-threat)', major: 'var(--hud-vital-wounds)', destroyed: 'var(--hud-text-faint)',
}

// Effective-encumbrance badge — reads the SAME perItem entry the Ledger and
// item detail panel's Encumbrance tab read. No parallel maths: cost/gain
// here are computeEncumbranceStats()'s own output, just displayed inline.
function EncBadge({ id, encumbranceStats }: { id: string; encumbranceStats: EncumbranceStats | null }) {
  const p = encumbranceStats?.perItem[id]
  if (!p) return null
  if (p.gain > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, minWidth: '3.5rem', flexShrink: 0 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: 'var(--green)' }}>+{p.gain}</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)' }}>threshold</span>
      </div>
    )
  }
  if (p.reason === 'anchor_occupied_capacity') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, minWidth: '3.5rem', flexShrink: 0 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: 'var(--hud-text-faint)' }}>+0</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--state-threat)' }}>anchor taken</span>
      </div>
    )
  }
  if (p.cost > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, minWidth: '3.5rem', flexShrink: 0 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: 'var(--die-force)' }}>{p.cost}</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)' }}>
          {p.reason === 'anchor_occupied_armor' ? 'anchor taken' : 'enc'}
        </span>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, minWidth: '3.5rem', flexShrink: 0 }}>
      <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: 'var(--hud-text-faint)' }}>0</span>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)' }}>enc</span>
    </div>
  )
}

interface ManifestRowProps {
  id: string
  name: string
  table: 'weapon' | 'armor' | 'gear'
  iconUrl: string | null
  equipState: EquipState
  condition: ItemCondition
  category?: string
  isSelected: boolean
  onClick: () => void
  encumbranceStats: EncumbranceStats | null
}

// No hover trigger on this row (Prompt 6, Task 2 — removed). Hovering a row
// used to simulate toggling that item's equip state, but the direction
// (stow vs equip) was inferred from current state with no on-screen label
// explaining what was being previewed. The trigger moved to the item detail
// panel's state segmented control, where the button hovered IS the target
// state being simulated.
function ManifestRow({ id, name, table, iconUrl, equipState, condition, category, isSelected, onClick, encumbranceStats }: ManifestRowProps) {
  const eq = EQUIP_COLOR[equipState]
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'grid', gridTemplateColumns: '4rem 1fr auto', gap: SP[2], alignItems: 'center',
        padding: SP[2], marginBottom: SP[1],
        background: isSelected ? `color-mix(in srgb, ${eq} 8%, transparent)` : 'var(--hud-surface-lo)',
        border: '1px solid var(--hud-border)', borderLeft: `2px solid ${eq}`,
        borderRadius: RADIUS.md, cursor: 'pointer', textAlign: 'left',
        borderColor: isSelected ? eq : undefined,
      }}
    >
      <div style={{ width: '4rem', height: '2.5rem', flexShrink: 0 }}>
        {iconUrl && <ItemReadoutPlate iconUrl={iconUrl} table={table} alt={name} size="row" />}
      </div>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: 'var(--hud-text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </span>
        <span style={{ display: 'flex', gap: SP[1], flexWrap: 'wrap', fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <span style={{ color: eq, fontWeight: 700 }}>{EQUIP_LABEL[equipState]}</span>
          {category && <span style={{ color: 'var(--hud-text-faint)' }}>{category}</span>}
          <span style={{ color: CONDITION_COLOR[condition] }}>{CONDITION_LABEL[condition]}</span>
        </span>
      </div>
      <EncBadge id={id} encumbranceStats={encumbranceStats} />
    </button>
  )
}

export function ItemThumbGrid({ weapons, armorItems, gearItems, selectedId, onSelect, encumbranceStats }: ItemThumbGridProps) {
  const { isOpen } = useHudPanelContext()
  return (
    <div style={{
      overflowY: 'auto', overflowX: 'hidden',
      background: 'var(--hud-surface-hi)',
      borderRight: '1px solid var(--hud-border)',
    }}>
      {weapons.length > 0 && (
        <>
          <SectionHead label="Weapons" isOpen={isOpen} />
          <div style={{ padding: SP[1] }}>
            {weapons.map(w => (
              <ManifestRow
                key={w.id} id={w.id} name={w.name} table="weapon" iconUrl={w.iconUrl}
                equipState={w.equipState} condition={w.condition} category={w.categories?.[0]}
                isSelected={selectedId === w.id}
                onClick={() => onSelect(w.id)}
                encumbranceStats={encumbranceStats}
              />
            ))}
          </div>
        </>
      )}
      {armorItems.length > 0 && (
        <>
          <SectionHead label="Armour" isOpen={isOpen} />
          <div style={{ padding: SP[1] }}>
            {armorItems.map(a => (
              <ManifestRow
                key={a.id} id={a.id} name={a.name} table="armor" iconUrl={a.iconUrl}
                equipState={a.equipState} condition={a.condition} category={a.categories?.[0]}
                isSelected={selectedId === a.id}
                onClick={() => onSelect(a.id)}
                encumbranceStats={encumbranceStats}
              />
            ))}
          </div>
        </>
      )}
      {gearItems.length > 0 && (
        <>
          <SectionHead label="Gear" isOpen={isOpen} />
          <div style={{ padding: SP[1] }}>
            {gearItems.map(g => (
              <ManifestRow
                key={g.id} id={g.id} name={g.name} table="gear" iconUrl={g.iconUrl}
                equipState={g.equipState} condition={g.condition} category={g.categories?.[0]}
                isSelected={selectedId === g.id}
                onClick={() => onSelect(g.id)}
                encumbranceStats={encumbranceStats}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
