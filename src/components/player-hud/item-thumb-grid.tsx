'use client'
import { useState } from 'react'
import { FONT_BODY, FONT_DISPLAY, FS, RADIUS, SP, Z, EASE } from '@/lib/tokens'
import { isModItem, isCyberneticItem, itemCategoryLabel } from '@/lib/itemCategories'
import { ItemReadoutPlate } from '@/components/shared/ItemReadoutPlate'
import { TickerText } from '@/components/ui/TickerText'
import { useHudPanelContext } from '@/contexts/HudPanelContext'
import type { WpnDisplay, ArmDisplay, GearRow, EquipState, ItemCondition } from '@/lib/types'
import type { EncumbranceStats, CyberneticsResult } from '@/lib/derivedStats'

interface ItemThumbGridProps {
  weapons:    WpnDisplay[]
  armorItems: ArmDisplay[]
  gearItems:  GearRow[]
  selectedId: string | null
  onSelect:   (id: string) => void
  encumbranceStats: EncumbranceStats | null
  /** Installed-implant roster + cap counters from the derived stats engine. */
  cybernetics?: CyberneticsResult | null
  onUninstallCybernetic?: (gearRowId: string) => Promise<{ ok: boolean }>
}

// ── Cybernetics anchor section (migration 135/136) ───────────────────────────
// The cybernetics "anchor" is not a worn slot like body/back/waist — it is a
// capacity, so this section leads with `used / cap` rather than a single
// occupant. Over cap is a WARNING, never a block: the numerals turn
// var(--state-threat) exactly as ModsTab's hard-point counter does when a mod
// overruns its hard points, and the note below uses the same
// var(--hud-vital-wounds) ⚠ line as EncumbranceTab's anchor-occupied note.
// No new warning style is introduced here.
function CyberneticsAnchor({ cybernetics, onUninstall, onSelect, selectedId }: {
  cybernetics: CyberneticsResult
  onUninstall?: (gearRowId: string) => Promise<{ ok: boolean }>
  onSelect: (id: string) => void
  selectedId: string | null
}) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const { implantsUsed, implantCap, overCap, installed } = cybernetics

  async function handleUninstall(id: string) {
    if (!onUninstall || busyId) return
    setBusyId(id)
    await onUninstall(id)
    setBusyId(null)
  }

  return (
    <div style={{ padding: SP[1] }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${SP[1]} ${SP[1]}` }}>
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--hud-text-faint)',
        }}>
          Implant Capacity
        </span>
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
          color: overCap ? 'var(--state-threat)' : 'var(--hud-text-dim)',
        }}>
          {implantsUsed} / {implantCap}
        </span>
      </div>
      {overCap && (
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-vital-wounds)', padding: `${SP[1]} ${SP[1]}` }}>
          ⚠ Over the implant cap by {implantsUsed - implantCap}. Exceeding the cap is allowed but has consequences.
        </div>
      )}
      {installed.length === 0 ? (
        <p style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-faint)', fontStyle: 'italic', margin: 0, padding: SP[1] }}>
          No implants installed.
        </p>
      ) : installed.map(imp => (
        <div
          key={imp.id}
          style={{
            display: 'flex', alignItems: 'center', gap: SP[2],
            padding: `${SP[1]} ${SP[1]}`, borderBottom: '1px solid var(--hud-border)',
            background: selectedId === imp.id ? 'color-mix(in srgb, var(--hud-gold) 8%, transparent)' : 'transparent',
          }}
        >
          <button
            onClick={() => onSelect(imp.id)}
            style={{
              flex: 1, minWidth: 0, textAlign: 'left', background: 'transparent', border: 0, padding: 0,
              cursor: 'pointer', fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
              color: 'var(--hud-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {imp.label}
            {!imp.countsTowardCap && (
              <span style={{ color: 'var(--hud-text-faint)', fontWeight: 400 }}> · no slot</span>
            )}
          </button>
          {onUninstall && (
            <button
              onClick={() => handleUninstall(imp.id)}
              disabled={busyId !== null}
              style={{
                // 2px vertical — secondary/inline button density per the UI gate.
                flexShrink: 0, fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: `2px ${SP[2]}`, borderRadius: RADIUS.sm,
                cursor: busyId !== null ? 'wait' : 'pointer',
                background: 'transparent', border: '1px solid var(--hud-border-hi)', color: 'var(--hud-gold)',
                opacity: busyId !== null ? 0.4 : 1,
              }}
            >
              Uninstall
            </button>
          )}
        </div>
      ))}
    </div>
  )
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
  wornAnchor?: string | null
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
function ManifestRow({ id, name, table, iconUrl, equipState, condition, category, wornAnchor, isSelected, onClick, encumbranceStats }: ManifestRowProps) {
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
          {wornAnchor && <span style={{ color: 'var(--hud-text-faint)' }}>{wornAnchor[0].toUpperCase() + wornAnchor.slice(1)}</span>}
          <span style={{ color: CONDITION_COLOR[condition] }}>{CONDITION_LABEL[condition]}</span>
        </span>
      </div>
      <EncBadge id={id} encumbranceStats={encumbranceStats} />
    </button>
  )
}

// ── Category filter (migration 134) ──────────────────────────────────────────
// MOD and CYBERNETIC are tag readings over ordinary gear rows, so they sit in
// the same chip row as the three table categories rather than in a second
// control. 'all' is the default — nothing is hidden unless a chip is picked.
type CategoryFilter = 'all' | 'weapon' | 'armor' | 'gear' | 'mod' | 'cybernetic'
const CATEGORY_FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'weapon',     label: 'Weapons' },
  { key: 'armor',      label: 'Armour' },
  { key: 'gear',       label: 'Gear' },
  { key: 'mod',        label: 'Mod' },
  { key: 'cybernetic', label: 'Cybernetic' },
]

function CategoryChips({ active, counts, onChange }: {
  active: CategoryFilter
  counts: Record<CategoryFilter, number>
  onChange: (f: CategoryFilter) => void
}) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: Z.sticky,
      display: 'flex', flexWrap: 'wrap', gap: SP[1],
      padding: `${SP[1]} ${SP[2]}`,
      background: 'var(--hud-surface-hi)',
      borderBottom: '1px solid var(--hud-border)',
    }}>
      {CATEGORY_FILTERS.map(f => {
        const isActive = active === f.key
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            disabled={counts[f.key] === 0 && f.key !== 'all'}
            style={{
              // 2px vertical — inline chip density per the UI gate.
              fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: `2px ${SP[2]}`, borderRadius: RADIUS.sm, cursor: 'pointer',
              background: isActive ? 'var(--hud-gold)' : 'transparent',
              color: isActive ? 'var(--hud-surface-lo)' : 'var(--hud-text-dim)',
              border: `1px solid ${isActive ? 'var(--hud-gold)' : 'var(--hud-border-hi)'}`,
              opacity: counts[f.key] === 0 && f.key !== 'all' ? 0.35 : 1,
              transition: `background ${EASE.quick}, color ${EASE.quick}, border-color ${EASE.quick}`,
            }}
          >
            {f.label} {counts[f.key]}
          </button>
        )
      })}
    </div>
  )
}

export function ItemThumbGrid({ weapons, armorItems, gearItems, selectedId, onSelect, encumbranceStats, cybernetics, onUninstallCybernetic }: ItemThumbGridProps) {
  const { isOpen } = useHudPanelContext()
  const [filter, setFilter] = useState<CategoryFilter>('all')

  // Gear splits three ways by tag: plain gear, mods, cybernetics. A row is
  // never counted twice — isModItem wins over isCyberneticItem, matching
  // itemCategoryLabel()'s own precedence.
  const modGear    = gearItems.filter(g => isModItem(g.categories))
  const cyberGear  = gearItems.filter(g => !isModItem(g.categories) && isCyberneticItem(g.categories))
  const plainGear  = gearItems.filter(g => !isModItem(g.categories) && !isCyberneticItem(g.categories))

  const counts: Record<CategoryFilter, number> = {
    all:        weapons.length + armorItems.length + gearItems.length,
    weapon:     weapons.length,
    armor:      armorItems.length,
    gear:       plainGear.length,
    mod:        modGear.length,
    cybernetic: cyberGear.length,
  }

  const showWeapons = filter === 'all' || filter === 'weapon' ? weapons : []
  const showArmor   = filter === 'all' || filter === 'armor'  ? armorItems : []
  const showGear =
    filter === 'all'        ? gearItems :
    filter === 'gear'       ? plainGear :
    filter === 'mod'        ? modGear   :
    filter === 'cybernetic' ? cyberGear : []

  return (
    <div style={{
      overflowY: 'auto', overflowX: 'hidden',
      background: 'var(--hud-surface-hi)',
      borderRight: '1px solid var(--hud-border)',
    }}>
      <CategoryChips active={filter} counts={counts} onChange={setFilter} />
      {cybernetics && (filter === 'all' || filter === 'cybernetic') && (
        <>
          <SectionHead label="Cybernetics" isOpen={isOpen} />
          <CyberneticsAnchor
            cybernetics={cybernetics}
            onUninstall={onUninstallCybernetic}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        </>
      )}
      {showWeapons.length > 0 && (
        <>
          <SectionHead label="Weapons" isOpen={isOpen} />
          <div style={{ padding: SP[1] }}>
            {showWeapons.map(w => (
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
      {showArmor.length > 0 && (
        <>
          <SectionHead label="Armour" isOpen={isOpen} />
          <div style={{ padding: SP[1] }}>
            {showArmor.map(a => (
              <ManifestRow
                key={a.id} id={a.id} name={a.name} table="armor" iconUrl={a.iconUrl}
                equipState={a.equipState} condition={a.condition} category={a.categories?.[0]}
                wornAnchor={a.wornAnchor}
                isSelected={selectedId === a.id}
                onClick={() => onSelect(a.id)}
                encumbranceStats={encumbranceStats}
              />
            ))}
          </div>
        </>
      )}
      {showGear.length > 0 && (
        <>
          <SectionHead label={filter === 'mod' ? 'Mods' : filter === 'cybernetic' ? 'Cybernetics' : 'Gear'} isOpen={isOpen} />
          <div style={{ padding: SP[1] }}>
            {showGear.map(g => (
              <ManifestRow
                key={g.id} id={g.id} name={g.name} table="gear" iconUrl={g.iconUrl}
                equipState={g.equipState} condition={g.condition}
                // MOD/CYBERNETIC outrank the raw first tag on the sub-line —
                // "Mod" alone reads as noise next to the item name.
                category={itemCategoryLabel('gear', g.categories) === 'GEAR' ? g.categories?.[0] : itemCategoryLabel('gear', g.categories)}
                wornAnchor={g.wornAnchor}
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
