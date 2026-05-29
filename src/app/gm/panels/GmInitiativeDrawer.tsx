'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { InitiativeStrip } from '@/components/player/InitiativeStrip'
import type { GmControls } from '@/components/player/InitiativeStrip'
import type { CombatEncounter } from '@/lib/combat'
import type { Character } from '@/lib/types'
import { HUD, FONT_BODY, EASE, RADIUS } from '@/lib/tokens'

const FONT = FONT_BODY
const DIM  = 'var(--hud-text-dim)'

const actionBtn = (accent: string): React.CSSProperties => ({
  padding:       '0.375rem 1rem',
  background:    `color-mix(in srgb, ${accent} 7%, transparent)`,
  border:        `1px solid color-mix(in srgb, ${accent} 27%, transparent)`,
  borderRadius:  RADIUS.md,
  cursor:        'pointer',
  fontFamily:    FONT,
  fontSize:      'var(--text-caption)',
  fontWeight:    700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color:         accent,
})

export interface GmInitiativeDrawerProps {
  encounter:           CombatEncounter | null
  characters:          Character[]
  isOpen:              boolean
  onClose:             () => void
  onRecheckInitiative: () => void
}

export function GmInitiativeDrawer({ encounter, characters, isOpen, onClose, onRecheckInitiative }: GmInitiativeDrawerProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const supabase = createClient()

  async function advanceTurn() {
    if (!encounter) return
    const slots   = encounter.initiative_slots
    const total   = slots.length
    if (total === 0) return
    const current = encounter.current_slot_index ?? 0
    const acted   = slots.map((s, i) => i === current ? { ...s, acted: true } : s)
    const allActed = acted.every(s => s.acted)
    if (allActed) {
      const reset = acted.map(s => ({ ...s, acted: false, current: false }))
      reset[0] = { ...reset[0], current: true }
      await supabase.from('combat_encounters').update({
        initiative_slots:   reset,
        current_slot_index: 0,
        round:              (encounter.round ?? 1) + 1,
        updated_at:         new Date().toISOString(),
      }).eq('id', encounter.id)
    } else {
      let next = (current + 1) % total
      while (acted[next].acted) next = (next + 1) % total
      const updated = acted.map((s, i) => ({ ...s, current: i === next }))
      await supabase.from('combat_encounters').update({
        initiative_slots:   updated,
        current_slot_index: next,
        updated_at:         new Date().toISOString(),
      }).eq('id', encounter.id)
    }
  }

  async function moveSlot(index: number, direction: -1 | 1) {
    if (!encounter) return
    const orig   = encounter.initiative_slots
    const target = index + direction
    if (target < 0 || target >= orig.length) return
    if (orig[index].acted || orig[target].acted) return

    const slots = [...orig]
    ;[slots[index], slots[target]] = [slots[target], slots[index]]
    const normalised = slots.map((s, idx) => ({ ...s, order: idx + 1 }))

    let currentIdx = encounter.current_slot_index ?? 0
    if (currentIdx === index) currentIdx = target
    else if (currentIdx === target) currentIdx = index

    await supabase.from('combat_encounters').update({
      initiative_slots:   normalised,
      current_slot_index: currentIdx,
      updated_at:         new Date().toISOString(),
    }).eq('id', encounter.id)
  }

  async function swapSlots(slotIdA: string, slotIdB: string) {
    if (!encounter) return
    const orig = encounter.initiative_slots
    const idxA = orig.findIndex(s => s.id === slotIdA)
    const idxB = orig.findIndex(s => s.id === slotIdB)
    if (idxA === -1 || idxB === -1) return
    if (orig[idxA].acted || orig[idxB].acted) return

    const slots = [...orig]
    ;[slots[idxA], slots[idxB]] = [slots[idxB], slots[idxA]]
    const normalised = slots.map((s, idx) => ({ ...s, order: idx + 1 }))

    let currentIdx = encounter.current_slot_index ?? 0
    if (currentIdx === idxA) currentIdx = idxB
    else if (currentIdx === idxB) currentIdx = idxA

    await supabase.from('combat_encounters').update({
      initiative_slots:   normalised,
      current_slot_index: currentIdx,
      updated_at:         new Date().toISOString(),
    }).eq('id', encounter.id)
  }

  async function endCombat() {
    if (!encounter) return
    await supabase.from('combat_encounters').update({
      is_active:  false,
      updated_at: new Date().toISOString(),
    }).eq('id', encounter.id)
    onClose()
  }

  if (!mounted) return null

  // Use the first active character as the viewer for InitiativeStrip
  const viewer = characters[0] ?? ({ id: 'gm' } as Character)

  return createPortal(
    <div
      style={{
        position:   'fixed',
        left:       '3.25rem',
        right:      '12.1875rem',
        bottom:     0,
        height:     'clamp(13.75rem, 32vh, 23.75rem)',
        zIndex:     'var(--z-hud-combat)' as unknown as number,
        background: 'var(--hud-surface-lo)',
        borderTop:  '1px solid var(--hud-border-hi)',
        boxShadow:  '0 -8px 40px rgba(0,0,0,0.6)',
        transform:  isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: `transform ${EASE.panel}`,
        pointerEvents: isOpen ? 'auto' : 'none',
        display:    'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        flexShrink:    0,
        display:       'flex',
        alignItems:    'center',
        gap:           '0.75rem',
        padding:       '0.5rem 1rem',
        borderBottom:  '1px solid var(--hud-border)',
        background:    'var(--hud-panel)',
      }}>
        <span style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: HUD.gold, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Round {encounter?.round ?? 1}
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={advanceTurn}          style={actionBtn(HUD.gold)}>Advance Turn</button>
        <button onClick={onRecheckInitiative}  style={actionBtn(DIM)}>Recheck Initiative</button>
        <button onClick={endCombat}            style={actionBtn('var(--state-failure)')}>End Combat</button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DIM, fontSize: 'var(--text-h3)', lineHeight: 1, padding: '0.125rem 0.25rem' }}>✕</button>
      </div>

      {/* Initiative strip */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden' }}>
        {encounter ? (
          <InitiativeStrip
            encounter={encounter}
            character={viewer}
            gmControls={{
              onMoveLeft:  i      => void moveSlot(i, -1),
              onMoveRight: i      => void moveSlot(i,  1),
              onSwap:      (a, b) => void swapSlots(a, b),
            } satisfies GmControls}
          />
        ) : (
          <div style={{ padding: '1.5rem 1rem', textAlign: 'center', fontFamily: FONT, fontSize: 'var(--text-sm)', color: DIM }}>
            No active encounter.
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
