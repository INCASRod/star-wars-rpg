'use client'
import { FONT_DISPLAY, FS, Z } from '@/lib/tokens'
import { ItemThumb } from './item-thumb'
import type { WpnDisplay, ArmDisplay, GearRow } from '@/lib/types'

interface ItemThumbGridProps {
  weapons:    WpnDisplay[]
  armorItems: ArmDisplay[]
  gearItems:  GearRow[]
  selectedId: string | null
  onSelect:   (id: string) => void
}

function SectionHead({ label }: { label: string }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: Z.raised,
      fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'var(--hud-gold)',
      background: 'var(--hud-surface-hi)',
      borderBottom: '1px solid var(--hud-border)',
      padding: '4px 5px',
    }}>
      {label}
    </div>
  )
}

const WEAPON_ICON = '⚔'
const ARMOR_ICON  = '◈'
const GEAR_ICON   = '◆'

export function ItemThumbGrid({ weapons, armorItems, gearItems, selectedId, onSelect }: ItemThumbGridProps) {
  return (
    <div style={{
      width: 148, flexShrink: 0,
      overflowY: 'auto', overflowX: 'hidden',
      background: 'var(--hud-surface-hi)',
      borderRight: '1px solid var(--hud-border)',
    }}>
      {weapons.length > 0 && (
        <>
          <SectionHead label="Weapons" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 4, padding: 5 }}>
            {weapons.map(w => (
              <ItemThumb
                key={w.id} name={w.name} icon={WEAPON_ICON} iconUrl={w.iconUrl}
                equipState={w.equipState} condition={w.condition}
                isSelected={selectedId === w.id}
                onClick={() => onSelect(w.id)}
              />
            ))}
          </div>
        </>
      )}
      {armorItems.length > 0 && (
        <>
          <SectionHead label="Armour" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 4, padding: 5 }}>
            {armorItems.map(a => (
              <ItemThumb
                key={a.id} name={a.name} icon={ARMOR_ICON} iconUrl={a.iconUrl}
                equipState={a.equipState} condition={a.condition}
                isSelected={selectedId === a.id}
                onClick={() => onSelect(a.id)}
              />
            ))}
          </div>
        </>
      )}
      {gearItems.length > 0 && (
        <>
          <SectionHead label="Gear" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 4, padding: 5 }}>
            {gearItems.map(g => (
              <ItemThumb
                key={g.id} name={g.name} icon={GEAR_ICON} iconUrl={g.iconUrl}
                equipState={g.equipState} condition={g.condition}
                isSelected={selectedId === g.id}
                onClick={() => onSelect(g.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
