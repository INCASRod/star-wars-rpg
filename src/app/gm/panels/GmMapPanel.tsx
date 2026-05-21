'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MapToken } from '@/hooks/useMapTokens'
import type { Character } from '@/lib/types'
import { GmTokenControls } from './GmTokenControls'
import { HUD } from '@/lib/tokens'

const FONT   = 'var(--font-body)'
const BORDER = 'var(--hud-border)'

const sectionHeader: React.CSSProperties = {
  fontFamily:    FONT,
  fontSize:      'var(--text-overline)',
  fontWeight:    700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color:         'var(--hud-text-dim)',
  marginBottom:  6,
  paddingBottom: 4,
  borderBottom:  `1px solid ${BORDER}`,
}

const controlRow: React.CSSProperties = {
  display:    'flex',
  alignItems: 'center',
  gap:        8,
  padding:    '4px 0',
}

const toggleBtn = (active: boolean): React.CSSProperties => ({
  padding:       '4px 10px',
  background:    active ? 'rgba(78,200,122,0.15)' : 'var(--hud-surface-mid)',
  border:        `1px solid ${active ? 'rgba(78,200,122,0.4)' : 'var(--hud-border-hi)'}`,
  borderRadius:  4,
  cursor:        'pointer',
  fontFamily:    FONT,
  fontSize:      'var(--text-caption)',
  fontWeight:    700,
  letterSpacing: '0.06em',
  color:         active ? '#4EC87A' : 'var(--hud-text-dim)',
  transition:    'background 0.15s, border-color 0.15s',
})

const stepBtn: React.CSSProperties = {
  width:      28,
  height:     28,
  background: 'var(--hud-surface-mid)',
  border:     '1px solid var(--hud-border-hi)',
  borderRadius: 4,
  cursor:     'pointer',
  color:      HUD.gold,
  fontFamily: FONT,
  fontSize:   16,
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
      <div style={{ padding: '12px 14px 0', flexShrink: 0 }}>
        <div style={sectionHeader}>Map</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={onMapsClick}
            style={{
              ...controlRow,
              background:    'var(--hud-surface-mid)',
              border:        '1px solid var(--hud-border-hi)',
              borderRadius:  4,
              cursor:        'pointer',
              padding:       '7px 12px',
              fontFamily:    FONT,
              fontSize:      'var(--text-label)',
              fontWeight:    700,
              color:         HUD.gold,
              width:         '100%',
              justifyContent: 'flex-start',
              gap:           8,
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
      <div style={{ height: 1, background: BORDER, margin: '12px 14px' }} />

      {/* Token Scale section */}
      <div style={{ padding: '0 14px', flexShrink: 0 }}>
        <div style={sectionHeader}>Token Scale</div>
        <div style={controlRow}>
          <button disabled={!mapId} onClick={() => adjustTokenScale(-0.25)} style={stepBtn}>−</button>
          <span style={{
            fontFamily:    FONT,
            fontSize:      'var(--text-sm)',
            fontWeight:    700,
            color:         mapId ? HUD.gold : 'var(--hud-text-dim)',
            minWidth:      48,
            textAlign:     'center',
          }}>
            {tokenScale.toFixed(2)}×
          </span>
          <button disabled={!mapId} onClick={() => adjustTokenScale(0.25)} style={stepBtn}>+</button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: BORDER, margin: '12px 14px' }} />

      {/* Tokens section */}
      <div style={{ padding: '0 0', flex: 1 }}>
        <div style={{ ...sectionHeader, margin: '0 14px', marginBottom: 8 }}>Tokens</div>
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
