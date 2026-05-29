'use client'

import { SP, RADIUS, EASE } from '@/lib/tokens'

export type UiTheme = 'ember' | 'kyber'

interface ThemeSwitcherProps {
  current: UiTheme
  onChange: (theme: UiTheme) => void
}

const THEMES: { key: UiTheme; label: string; bg: string; accent: string }[] = [
  { key: 'ember', label: 'Ember Tatooine', bg: '#DCCFBC', accent: '#E03A1E' },
  { key: 'kyber', label: 'Kyber Archive',  bg: '#111326', accent: '#5BBCD8' },
]

export function ThemeSwitcher({ current, onChange }: ThemeSwitcherProps) {
  return (
    <div style={{ display: 'flex', gap: SP[1], alignItems: 'center' }}>
      {THEMES.map(t => {
        const active = t.key === current
        return (
          <button
            key={t.key}
            title={t.label}
            onClick={() => onChange(t.key)}
            style={{
              width: 16,
              height: 16,
              borderRadius: RADIUS.full,
              cursor: 'pointer',
              background: `radial-gradient(circle at 35% 35%, ${t.accent} 0%, ${t.bg} 60%)`,
              border: active ? '2px solid var(--hud-gold)' : '2px solid transparent',
              outline: active ? '1px solid var(--hud-border-hi)' : 'none',
              outlineOffset: 1,
              padding: 0,
              flexShrink: 0,
              transition: `border-color ${EASE.default}`,
            }}
          />
        )
      })}
    </div>
  )
}
