'use client'

import { useRef } from 'react'

export interface PanelSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function PanelSearchInput({ value, onChange, placeholder = 'Search...' }: PanelSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div style={{ position: 'relative', marginBottom: 10 }}>
      {/* Search icon */}
      <span style={{
        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--hud-text-faint)', fontSize: 14, pointerEvents: 'none', lineHeight: 1,
      }}>
        🔍
      </span>

      <input
        ref={inputRef}
        className={`hud-input${value ? ' hud-input--padded-r' : ''}`}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />

      {/* Clear button — only shown when query is non-empty */}
      {value && (
        <button
          onMouseDown={e => {
            e.preventDefault()
            onChange('')
            inputRef.current?.focus()
          }}
          className="hov-gold-text"
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--hud-text-faint)',
            fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)', lineHeight: 1, padding: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
