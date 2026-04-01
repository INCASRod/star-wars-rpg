'use client'

import { useRef, useState } from 'react'

const FONT_MONO     = "'Share Tech Mono', 'Courier New', monospace"
const INPUT_BG      = 'rgba(6,13,9,0.7)'
const BORDER_DIM    = 'rgba(200,170,80,0.25)'
const BORDER_FOCUS  = 'rgba(200,170,80,0.55)'
const ICON_COLOR    = 'rgba(200,170,80,0.4)'
const TEXT_COLOR    = '#E8DFC8'

const STYLE_ID = 'panel-search-placeholder'

export interface PanelSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function PanelSearchInput({ value, onChange, placeholder = 'Search...' }: PanelSearchInputProps) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div style={{ position: 'relative', marginBottom: 10 }}>
      {/* Placeholder color — cannot be set via inline style */}
      <style id={STYLE_ID}>{`.panel-search-input::placeholder{color:rgba(200,170,80,0.35)}`}</style>

      {/* Search icon */}
      <span style={{
        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
        color: ICON_COLOR, fontSize: 14, pointerEvents: 'none', lineHeight: 1,
      }}>
        🔍
      </span>

      <input
        ref={inputRef}
        className="panel-search-input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: INPUT_BG,
          border: `1px solid ${focused ? BORDER_FOCUS : BORDER_DIM}`,
          borderRadius: 6,
          padding: value ? '7px 30px 7px 34px' : '7px 12px 7px 34px',
          color: TEXT_COLOR,
          fontFamily: FONT_MONO,
          fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
      />

      {/* Clear button — only shown when query is non-empty */}
      {value && (
        <button
          onMouseDown={e => {
            // mousedown fires before blur so we can restore focus
            e.preventDefault()
            onChange('')
            inputRef.current?.focus()
          }}
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: ICON_COLOR,
            fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)', lineHeight: 1, padding: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(200,170,80,0.8)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ICON_COLOR }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
