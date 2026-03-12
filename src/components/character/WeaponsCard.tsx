'use client'

import { HudCard } from '../ui/HudCard'
import { Badge } from '../ui/Badge'
import { EquipmentImage } from '../ui/EquipmentImage'
import { removeBtnStyle } from '@/lib/styles'

export interface WeaponDisplay {
  id?: string
  name: string
  meta: string
  skill?: string
  range?: string
  qualities?: string
  damage: number
  crit: number
  icon: string
  itemKey?: string
  categories?: string[]
  equipped?: boolean
  encumbrance?: number
}

interface WeaponsCardProps {
  weapons: WeaponDisplay[]
  animClass?: string
  onToggleEquipped?: (id: string) => void
  isGmMode?: boolean
  onRemoveWeapon?: (id: string) => void
}

export function WeaponsCard({ weapons, animClass = 'al d5', onToggleEquipped, isGmMode, onRemoveWeapon }: WeaponsCardProps) {
  return (
    <HudCard title="Weapons" animClass={animClass}>
      {weapons.map((wpn, i) => (
        <div key={wpn.id || i} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)',
          padding: '0.5rem 0',
          borderBottom: i < weapons.length - 1 ? '1px solid var(--bdr-l)' : 'none',
        }}>
          {/* Equip toggle */}
          <button
            onClick={() => wpn.id && onToggleEquipped?.(wpn.id)}
            style={{
              position: 'relative', flexShrink: 0,
              background: 'none', border: 'none',
              cursor: onToggleEquipped && wpn.id ? 'pointer' : 'default',
              padding: 0,
            }}
            title={wpn.equipped ? 'Unequip' : 'Equip'}
          >
            {wpn.itemKey ? (
              <EquipmentImage
                itemKey={wpn.itemKey}
                itemType="weapon"
                categories={wpn.categories}
                size="sm"
                style={{
                  background: 'var(--parch)', border: '1px solid var(--bdr-l)',
                  opacity: wpn.equipped ? 1 : 0.45,
                  transition: '.2s',
                }}
              />
            ) : (
              <div style={{
                width: '2rem', height: '2rem', background: 'var(--parch)',
                border: '1px solid var(--bdr-l)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--font-md)', flexShrink: 0,
                opacity: wpn.equipped ? 1 : 0.45,
              }}>
                {wpn.icon}
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              width: '0.45rem', height: '0.45rem', borderRadius: '50%',
              background: wpn.equipped ? 'var(--green)' : 'transparent',
              boxShadow: wpn.equipped ? '0 0 0.3rem var(--green)' : 'none',
              border: wpn.equipped ? 'none' : '1.5px solid var(--txt3)',
            }} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--txt)' }}>{wpn.name}</div>
            <div style={{
              marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem',
            }}>
              {wpn.equipped && (
                <Badge color="var(--green)" bg="rgba(45,143,78,.1)">EQUIPPED</Badge>
              )}
              {wpn.skill && (
                <Badge color="var(--blue-l)" bg="rgba(91,143,224,.1)">{wpn.skill}</Badge>
              )}
              {wpn.range && (
                <Badge color="var(--amber)" bg="rgba(196,127,23,.1)">{wpn.range}</Badge>
              )}
              {wpn.qualities?.split(', ').map((q, qi) => (
                <Badge key={qi} color="#9B6DD7" bg="rgba(155,109,215,.1)">{q}</Badge>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--red)' }}>{wpn.damage}</div>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.06rem', color: 'var(--txt3)' }}>DAM</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--amber)' }}>{wpn.crit}</div>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.06rem', color: 'var(--txt3)' }}>CRIT</div>
            </div>
            {isGmMode && onRemoveWeapon && wpn.id && (
              <button
                style={removeBtnStyle}
                title="Remove weapon"
                onClick={() => {
                  if (window.confirm(`Remove ${wpn.name}?`)) onRemoveWeapon(wpn.id!)
                }}
              >✕</button>
            )}
          </div>
        </div>
      ))}
    </HudCard>
  )
}
