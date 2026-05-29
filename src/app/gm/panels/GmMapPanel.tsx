'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MapToken } from '@/hooks/useMapTokens'
import type { Character } from '@/lib/types'
import { GmTokenControls } from './GmTokenControls'
import { HUD, FONT_BODY, EASE, FS, RADIUS } from '@/lib/tokens'

const FONT   = FONT_BODY
const BORDER = 'var(--hud-border)'

const sectionHeader: React.CSSProperties = {
  fontFamily:    FONT,
  fontSize:      'var(--text-overline)',
  fontWeight:    700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color:         'var(--hud-text-dim)',
  marginBottom:  '0.375rem',
  paddingBottom: '0.25rem',
  borderBottom:  `1px solid ${BORDER}`,
}

const controlRow: React.CSSProperties = {
  display:    'flex',
  alignItems: 'center',
  gap:        '0.5rem',
  padding:    '0.25rem 0',
}

const toggleBtn = (active: boolean): React.CSSProperties => ({
  padding:       '0.25rem 0.625rem',
  background:    active ? 'rgba(78,200,122,0.15)' : 'var(--hud-surface-mid)',
  border:        `1px solid ${active ? 'rgba(78,200,122,0.4)' : 'var(--hud-border-hi)'}`,
  borderRadius:  RADIUS.md,
  cursor:        'pointer',
  fontFamily:    FONT,
  fontSize:      'var(--text-caption)',
  fontWeight:    700,
  letterSpacing: '0.06em',
  color:         active ? 'var(--state-success)' : 'var(--hud-text-dim)',
  transition:    `background ${EASE.quick}, border-color ${EASE.quick}`,
})

const stepBtn: React.CSSProperties = {
  width:      '1.75rem',
  height:     '1.75rem',
  background: 'var(--hud-surface-mid)',
  border:     '1px solid var(--hud-border-hi)',
  borderRadius: RADIUS.md,
  cursor:     'pointer',
  color:      HUD.gold,
  fontFamily: FONT,
  fontSize:   FS.h4,
  display:    'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export interface GmMapPanelProps {
  campaignId:      string
  mapId:           string | null
  isMapVisible:    boolean
  tokenScale:      number
  onMapsClick:     () => void
  characters:      Character[]
  tokens:          MapToken[]
  addToken:        (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  removeToken:     (id: string) => Promise<void>
  toggleVisibility:(id: string, visible: boolean) => Promise<void>
  removeAllTokens: () => Promise<void>
}

export function GmMapPanel({
  campaignId, mapId, isMapVisible, tokenScale, onMapsClick,
  characters, tokens, addToken, removeToken, toggleVisibility, removeAllTokens,
}: GmMapPanelProps) {
  const supabase = useMemo(() => createClient(), [])

  async function toggleReveal() {
    if (!mapId) return
    await supabase.from('maps').update({ is_visible_to_players: !isMapVisible }).eq('id', mapId)
  }

  async function adjustTokenScale(delta: number) {
    if (!mapId) return
    const next = Math.round(Math.max(0.25, Math.min(4.0, tokenScale + delta)) * 100) / 100
    await supabase.from('maps').update({ token_scale: next }).eq('id', mapId)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>

      {/* Map section */}
      <div style={{ padding: '0.75rem 0.875rem 0', flexShrink: 0 }}>
        <div style={sectionHeader}>Map</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <button
            onClick={onMapsClick}
            style={{
              ...controlRow,
              background:    'var(--hud-surface-mid)',
              border:        '1px solid var(--hud-border-hi)',
              borderRadius:  RADIUS.md,
              cursor:        'pointer',
              padding:       '0.4375rem 0.75rem',
              fontFamily:    FONT,
              fontSize:      'var(--text-label)',
              fontWeight:    700,
              color:         HUD.gold,
              width:         '100%',
              justifyContent: 'flex-start',
              gap:           '0.5rem',
            }}
          >
            <span>◉</span> Map Library
          </button>

          <div style={controlRow}>
            <button
              disabled={!mapId}
              onClick={toggleReveal}
              style={toggleBtn(isMapVisible)}
            >
              {isMapVisible ? '👁 Visible' : '👁 Hidden'}
            </button>
            <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: 'var(--hud-text-dim)' }}>
              {isMapVisible ? 'Map visible to players' : 'Map hidden from players'}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: BORDER, margin: '0.75rem 0.875rem' }} />

      {/* Token Scale section */}
      <div style={{ padding: '0 0.875rem', flexShrink: 0 }}>
        <div style={sectionHeader}>Token Scale</div>
        <div style={controlRow}>
          <button disabled={!mapId} onClick={() => adjustTokenScale(-0.25)} style={stepBtn}>−</button>
          <span style={{
            fontFamily:    FONT,
            fontSize:      'var(--text-sm)',
            fontWeight:    700,
            color:         mapId ? HUD.gold : 'var(--hud-text-dim)',
            minWidth:      '3rem',
            textAlign:     'center',
          }}>
            {tokenScale.toFixed(2)}×
          </span>
          <button disabled={!mapId} onClick={() => adjustTokenScale(0.25)} style={stepBtn}>+</button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: BORDER, margin: '0.75rem 0.875rem' }} />

      {/* Tokens section */}
      <div style={{ padding: 0, flex: 1 }}>
        <div style={{ ...sectionHeader, margin: '0 0.875rem', marginBottom: '0.5rem' }}>Tokens</div>
        <GmTokenControls
          campaignId={campaignId}
          mapId={mapId}
          characters={characters}
          tokens={tokens}
          addToken={addToken}
          removeToken={removeToken}
          toggleVisibility={toggleVisibility}
          removeAllTokens={removeAllTokens}
        />
      </div>
    </div>
  )
}
