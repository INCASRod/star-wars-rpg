'use client'

import { HudCard } from '../ui/HudCard'
import { Badge } from '../ui/Badge'
import { EquipmentImage } from '../ui/EquipmentImage'
import { removeBtnStyle } from '@/lib/styles'

export interface EquipmentItem {
  id: string
  name: string
  subtitle: string
  equipped: boolean
  encumbrance: number
  encumbranceBonus?: number
  type: 'armor' | 'gear'
  itemKey?: string
}

interface EquipmentCardProps {
  items: EquipmentItem[]
  encumbranceCurrent: number
  encumbranceThreshold: number
  animClass?: string
  onToggleEquipped?: (item: EquipmentItem) => void
  isGmMode?: boolean
  onRemoveEquipment?: (id: string, type: 'armor' | 'gear') => void
}

function EquipmentRow({ item, isLast, onToggle, isGmMode, onRemove }: {
  item: EquipmentItem; isLast: boolean; onToggle?: (item: EquipmentItem) => void
  isGmMode?: boolean; onRemove?: (id: string, type: 'armor' | 'gear') => void
}) {
  const parts = item.subtitle.split(/\s*\/\s*/).filter(Boolean)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.5rem 0',
      borderBottom: isLast ? 'none' : '1px solid var(--bdr-l)',
    }}>
      <button
        onClick={() => onToggle?.(item)}
        style={{
          position: 'relative', flexShrink: 0,
          background: 'none', border: 'none',
          cursor: 'pointer', padding: 0,
        }}
        title={item.equipped ? 'Unequip' : 'Equip'}
      >
        {item.itemKey ? (
          <EquipmentImage
            itemKey={item.itemKey}
            itemType={item.type}
            size="sm"
            style={{ opacity: item.equipped ? 1 : 0.5, transition: '.2s' }}
          />
        ) : (
          <div style={{
            width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: item.equipped ? 1 : 0.5,
          }}>
            {item.type === 'armor' ? '\u{1F6E1}' : '\u{1F4E6}'}
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: '0.45rem', height: '0.45rem', borderRadius: '50%',
          background: item.equipped ? 'var(--green)' : 'transparent',
          boxShadow: item.equipped ? '0 0 0.3rem var(--green)' : 'none',
          border: item.equipped ? 'none' : '1.5px solid var(--txt3)',
        }} />
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt)' }}>{item.name}</div>
        <div style={{ marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {item.equipped && (
            <Badge color="var(--green)" bg="rgba(45,143,78,.1)">EQUIPPED</Badge>
          )}
          {item.type === 'armor' && parts.map((p, i) => (
            <Badge key={i} color="var(--blue-l)" bg="rgba(91,143,224,.1)">{p.trim()}</Badge>
          ))}
          {item.type === 'gear' && parts.map((p, i) => (
            <Badge key={i} color="var(--amber)" bg="rgba(196,127,23,.1)">{p.trim()}</Badge>
          ))}
          {item.encumbranceBonus && item.encumbranceBonus > 0 && (
            <Badge color="var(--green)" bg="rgba(45,143,78,.08)">+{item.encumbranceBonus} ENC</Badge>
          )}
        </div>
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)',
        color: 'var(--txt3)',
      }}>
        {item.encumbrance}
      </span>
      {isGmMode && onRemove && (
        <button
          style={removeBtnStyle}
          title={`Remove ${item.name}`}
          onClick={() => {
            if (window.confirm(`Remove ${item.name}?`)) onRemove(item.id, item.type)
          }}
        >✕</button>
      )}
    </div>
  )
}

export function EquipmentCard({ items, encumbranceCurrent, encumbranceThreshold, animClass = 'al d4', onToggleEquipped, isGmMode, onRemoveEquipment }: EquipmentCardProps) {
  const overEncumbered = encumbranceCurrent > encumbranceThreshold
  const armorItems = items.filter(i => i.type === 'armor')
  const gearItems = items.filter(i => i.type === 'gear')

  return (
    <HudCard title="Equipment" animClass={animClass}>
      {items.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '0.5rem 0',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
          color: 'var(--txt3)', letterSpacing: '0.15rem',
        }}>
          NO EQUIPMENT
        </div>
      )}

      {/* Armor section */}
      {armorItems.length > 0 && (
        <>
          <div style={{
            fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 700,
            letterSpacing: '0.12rem', color: 'var(--txt3)',
            padding: '0.25rem 0 0.25rem', marginTop: items.indexOf(armorItems[0]) > 0 ? '0.25rem' : 0,
          }}>
            ARMOR
          </div>
          {armorItems.map((item, i) => (
            <EquipmentRow key={item.id} item={item} isLast={i === armorItems.length - 1 && gearItems.length === 0} onToggle={onToggleEquipped} isGmMode={isGmMode} onRemove={onRemoveEquipment} />
          ))}
        </>
      )}

      {/* Gear section */}
      {gearItems.length > 0 && (
        <>
          <div style={{
            fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 700,
            letterSpacing: '0.12rem', color: 'var(--txt3)',
            padding: '0.25rem 0 0.25rem', marginTop: armorItems.length > 0 ? '0.25rem' : 0,
            borderTop: armorItems.length > 0 ? '1px solid var(--bdr-l)' : 'none',
          }}>
            GEAR
          </div>
          {gearItems.map((item, i) => (
            <EquipmentRow key={item.id} item={item} isLast={i === gearItems.length - 1} onToggle={onToggleEquipped} isGmMode={isGmMode} onRemove={onRemoveEquipment} />
          ))}
        </>
      )}

      {/* Encumbrance row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--bdr-l)',
      }}>
        <span style={{
          fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)', fontWeight: 600,
          letterSpacing: '0.15rem', color: 'var(--txt3)',
        }}>ENCUMBRANCE</span>
        <span style={{
          fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800,
          color: overEncumbered ? 'var(--red)' : 'var(--ink)',
        }}>
          {encumbranceCurrent}{' '}
          <span style={{ color: overEncumbered ? 'var(--red)' : 'var(--txt3)', fontWeight: 400, fontSize: 'var(--font-base)' }}>/ {encumbranceThreshold}</span>
        </span>
      </div>
    </HudCard>
  )
}
