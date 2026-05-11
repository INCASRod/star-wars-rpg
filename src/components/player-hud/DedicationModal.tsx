'use client'

import { useState } from 'react'
import { C, CHAR_COLOR, FONT_RAJDHANI, FS_SM, FS_H4, FS_H3, FS_CAPTION, type CharKey } from './design-tokens'
import type { Character } from '@/lib/types'

const CHAR_KEYS_ORDERED: CharKey[] = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence']

const DEDICATION_CHAR_LABEL: Record<CharKey, string> = {
  brawn:     'Brawn',
  agility:   'Agility',
  intellect: 'Intellect',
  cunning:   'Cunning',
  willpower: 'Willpower',
  presence:  'Presence',
}

export function DedicationModal({
  character, onConfirm, onCancel,
}: {
  character: Character
  onConfirm: (key: CharKey) => void
  onCancel:  () => void
}) {
  const [selected, setSelected] = useState<CharKey | null>(null)

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onCancel}
    >
      <div
        style={{ background: C.panelBg, border: `1px solid ${C.borderHi}`, borderTop: `3px solid ${C.gold}`, padding: '28px 28px 24px', maxWidth: 400, width: '100%', backdropFilter: 'blur(12px)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_H4, fontWeight: 700, color: C.gold, letterSpacing: '0.15em', marginBottom: 4 }}>
          DEDICATION
        </div>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, letterSpacing: '0.05em', marginBottom: 20 }}>
          Choose a characteristic to permanently increase by 1.
        </div>

        {/* Characteristic grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {CHAR_KEYS_ORDERED.map(key => {
            const val = (character[key] as number) ?? 2
            const maxed = val >= 6
            const isSel = selected === key
            const color = CHAR_COLOR[key]
            return (
              <button
                key={key}
                disabled={maxed}
                onClick={() => !maxed && setSelected(key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: isSel ? `${color}22` : 'var(--hud-surface-lo)',
                  border: `1px solid ${isSel ? color : C.border}`,
                  outline: isSel ? `1px solid ${color}` : 'none',
                  cursor: maxed ? 'not-allowed' : 'pointer',
                  opacity: maxed ? 0.35 : 1,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 600, color: isSel ? color : C.text, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {DEDICATION_CHAR_LABEL[key]}
                </span>
                <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_H3, fontWeight: 700, color: isSel ? color : C.textDim, lineHeight: 1 }}>
                  {val} <span style={{ fontSize: FS_CAPTION, color: isSel ? color : 'var(--hud-text-faint)', fontFamily: FONT_RAJDHANI }}>→ {val + 1}</span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px 0', background: 'transparent', border: `1px solid ${C.border}`, fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 600, letterSpacing: '0.1em', color: C.textDim, cursor: 'pointer' }}>
            CANCEL
          </button>
          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            style={{ flex: 2, padding: '10px 0', background: selected ? C.gold : 'var(--hud-surface-lo)', border: `1px solid ${selected ? C.gold : C.border}`, fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700, letterSpacing: '0.12em', color: selected ? C.bg : C.textDim, cursor: selected ? 'pointer' : 'default', transition: 'background 0.15s' }}
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  )
}
