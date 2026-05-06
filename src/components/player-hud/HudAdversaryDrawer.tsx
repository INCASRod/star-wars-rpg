'use client'

import type { Dispatch, SetStateAction } from 'react'
import { createPortal } from 'react-dom'
import { C, FONT_RAJDHANI, FS_LABEL } from './design-tokens'
import { AdversaryCardList } from '@/components/player/AdversaryCardList'
import { VehicleCardList } from '@/components/player/VehicleCardList'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'
import type { InitiativeSlot } from '@/lib/combat'

interface HudAdversaryDrawerProps {
  open: boolean
  onClose: () => void
  encounter: {
    adversaries: AdversaryInstance[]
    vehicles?: VehicleInstance[]
    initiative_slots: InitiativeSlot[]
  }
  sessionCardCollapsed: Record<string, boolean>
  setSessionCardCollapsed: Dispatch<SetStateAction<Record<string, boolean>>>
}

export function HudAdversaryDrawer({
  open,
  onClose,
  encounter,
  sessionCardCollapsed,
  setSessionCardCollapsed,
}: HudAdversaryDrawerProps) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 8999,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.26s',
        }}
      />
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 320,
        zIndex: 9000,
        display: 'flex', flexDirection: 'column',
        background: 'rgba(6,10,8,0.97)',
        borderRight: `1px solid ${open ? 'rgba(224,58,30,0.36)' : 'transparent'}`,
        boxShadow: open ? '8px 0 40px rgba(0,0,0,0.6)' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1), border-color 0.2s',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 50,
          borderBottom: 'rgba(224,58,30,0.14)',
          background: 'rgba(10,18,12,0.92)',
        }}>
          <span style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: C.gold, fontWeight: 700,
          }}>{(encounter.vehicles ?? []).length > 0 ? 'Adversaries & Vehicles' : 'Adversaries'}</span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(106,128,112,1)', fontSize: 18, lineHeight: 1,
              padding: '4px 6px', borderRadius: 4,
            }}
            aria-label="Close adversaries drawer"
          >✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <AdversaryCardList
            revealedAdversaries={encounter.adversaries.filter(a => a.revealed)}
            currentSlot={encounter.initiative_slots.find(s => s.current)}
            initiativeSlots={encounter.initiative_slots}
            cardCollapsed={sessionCardCollapsed}
            setCardCollapsed={setSessionCardCollapsed}
            weaponRef={{}}
          />
          {(encounter.vehicles ?? []).length > 0 && (
            <VehicleCardList
              vehicles={(encounter.vehicles ?? []).filter(v => v.revealed)}
              currentSlot={encounter.initiative_slots.find(s => s.current)}
              initiativeSlots={encounter.initiative_slots}
              cardCollapsed={sessionCardCollapsed}
              setCardCollapsed={setSessionCardCollapsed}
            />
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}
