'use client'
import { FONT_DISPLAY, FS, Z, SP } from '@/lib/tokens'
import { ItemThumb } from './item-thumb'
import { TickerText } from '@/components/ui/TickerText'
import { useHudPanelContext } from '@/contexts/HudPanelContext'
import type { WpnDisplay, ArmDisplay, GearRow } from '@/lib/types'

interface ItemThumbGridProps {
  weapons:    WpnDisplay[]
  armorItems: ArmDisplay[]
  gearItems:  GearRow[]
  selectedId: string | null
  onSelect:   (id: string) => void
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

const WEAPON_ICON = '⚔'
const ARMOR_ICON  = '◈'
const GEAR_ICON   = '◆'

export function ItemThumbGrid({ weapons, armorItems, gearItems, selectedId, onSelect }: ItemThumbGridProps) {
  const { isOpen } = useHudPanelContext()
  return (
    <div style={{
      width: '9.25rem', flexShrink: 0,
      overflowY: 'auto', overflowX: 'hidden',
      background: 'var(--hud-surface-hi)',
      borderRight: '1px solid var(--hud-border)',
    }}>
      {weapons.length > 0 && (
        <>
          <SectionHead label="Weapons" isOpen={isOpen} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: SP[1], padding: SP[1] }}>
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
          <SectionHead label="Armour" isOpen={isOpen} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: SP[1], padding: SP[1] }}>
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
          <SectionHead label="Gear" isOpen={isOpen} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: SP[1], padding: SP[1] }}>
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
