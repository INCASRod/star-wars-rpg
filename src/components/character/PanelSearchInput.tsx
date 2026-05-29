'use client'

import { useRef } from 'react'
import { FS } from '@/lib/tokens'

export interface PanelSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function PanelSearchInput({ value, onChange, placeholder = 'Search...' }: PanelSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative mb-2.5">
      {/* Search icon */}
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none leading-none"
        style={{ color: 'var(--hud-text-faint)', fontSize: 14 }}>
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
          className="hov-gold-text absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer leading-none p-0"
          style={{
            color:    'var(--hud-text-faint)',
            fontSize: FS.sm,
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
