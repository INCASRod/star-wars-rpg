'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MapToken } from '@/hooks/useMapTokens'
import type { Character } from '@/lib/types'
import type { Adversary } from '@/lib/adversaries'
import { adversaryToInstance } from '@/lib/adversaries'
import type { Vehicle } from '@/lib/vehicles'
import { vehicleToVehicleInstance } from '@/lib/vehicles'
import { ensureEncounterForMap } from '@/lib/encounters'
import { AdversaryLibrary } from '@/components/gm/AdversaryLibrary'
import { VehicleLibrary } from '@/components/gm/VehicleLibrary'
import { StagingTokenPanel } from '@/components/staging/StagingTokenPanel'
import { HUD, FONT_BODY, EASE, FS, RADIUS } from '@/lib/tokens'

const FONT   = FONT_BODY
const BORDER = 'var(--hud-border-hi)'

const sectionHeader: React.CSSProperties = {
  fontFamily:    FONT,
  fontSize:      'var(--text-overline)',
  fontWeight:    700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color:         'var(--hud-text-dim)',
  marginBottom:  '0.375rem',
  paddingBottom: '0.25rem',
  borderBottom:  `1px solid var(--hud-border)`,
}

const tokenBtn: React.CSSProperties = {
  display:       'flex',
  alignItems:    'center',
  gap:           '0.5rem',
  width:         '100%',
  padding:       '0.4375rem 0.75rem',
  background:    'var(--hud-surface-mid)',
  border:        `1px solid var(--hud-border-hi)`,
  borderRadius:  RADIUS.md,
  cursor:        'pointer',
  fontFamily:    FONT,
  fontSize:      'var(--text-label)',
  fontWeight:    700,
  letterSpacing: '0.06em',
  color:         'var(--hud-text)',
  textAlign:     'left',
  transition:    `background ${EASE.quick}, border-color ${EASE.quick}`,
}

/* ── Pointer token definitions ── */
const POINTER_DEFS = [
  { type: 'pointer_green',  hex: '#22c55e', label: 'Green'  },
  { type: 'pointer_red',    hex: '#ef4444', label: 'Red'    },
  { type: 'pointer_orange', hex: '#f97316', label: 'Orange' },
] as const

type TokenView = 'menu' | 'adversary' | 'vehicle' | 'player' | 'placed'

export interface GmTokenControlsProps {
  campaignId:      string
  mapId:           string | null
  characters:      Character[]
  tokens:          MapToken[]
  addToken:        (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  removeToken:     (id: string) => Promise<void>
  toggleVisibility:(id: string, visible: boolean) => Promise<void>
  removeAllTokens: () => Promise<void>
  onOpenCrawl:     () => void
  isCrawlActive:   boolean
  crawlLoading:    boolean
}

export function GmTokenControls({
  campaignId, mapId, characters, tokens, addToken, removeToken, toggleVisibility, removeAllTokens,
  onOpenCrawl, isCrawlActive, crawlLoading,
}: GmTokenControlsProps) {
  const supabase = useMemo(() => createClient(), [])
  const [view, setView] = useState<TokenView>('menu')

  /* ── Adversary token placement (mirrors StagingFloatingToolbar) ── */
  const handleAddAdversaryToken = useCallback(
    async (adv: Adversary & { _isCustom?: boolean; _tokenImageUrl?: string | null }, alignment: 'enemy' | 'allied_npc') => {
      if (!mapId || !campaignId) return
      const token = await addToken({
        map_id:           mapId,
        campaign_id:      campaignId,
        participant_type: 'adversary',
        character_id:     null,
        participant_id:   null,
        slot_key:         null,
        label:            adv.name,
        alignment:        alignment === 'allied_npc' ? 'allied_npc' : adv.type,
        x:                0.5,
        y:                0.5,
        is_visible:       false,
        token_size:       1.0,
        wound_pct:        null,
        token_image_url:  adv._tokenImageUrl ?? null,
        token_shape:      'circle',
      })
      if (!token) return
      const enc = await ensureEncounterForMap(supabase, campaignId, mapId)
      if (!enc) return
      const instance = adversaryToInstance(adv, adv.type === 'minion' ? 4 : 1)
      instance.map_id = mapId
      // Add adversary instance for the Enemies panel — slots are created only after initiative is finalised.
      await supabase.from('combat_encounters').update({
        adversaries: [...enc.adversaries, instance],
        updated_at:  new Date().toISOString(),
      }).eq('id', enc.id)
      setView('menu')
    },
    [mapId, campaignId, addToken, supabase],
  )

  /* ── Vehicle token placement ── */
  const handleAddVehicleToken = useCallback(
    async (vehicle: Vehicle & { _isCustom?: boolean; _tokenImageUrl?: string | null }, alignment: 'enemy' | 'allied_npc') => {
      if (!mapId || !campaignId) return
      const token = await addToken({
        map_id:           mapId,
        campaign_id:      campaignId,
        participant_type: 'adversary',
        character_id:     null,
        participant_id:   null,
        slot_key:         null,
        label:            vehicle.name,
        alignment,
        x:                0.5,
        y:                0.5,
        is_visible:       false,
        token_size:       1.0,
        wound_pct:        null,
        token_image_url:  vehicle._tokenImageUrl ?? null,
        token_shape:      'rectangle',
      })
      if (!token) return
      const enc = await ensureEncounterForMap(supabase, campaignId, mapId)
      if (!enc) return
      const instance = vehicleToVehicleInstance(vehicle, alignment, vehicle._tokenImageUrl)
      instance.map_id = mapId
      // Add vehicle instance for the Enemies panel — slots are created only after initiative is finalised.
      await supabase.from('combat_encounters').update({
        vehicles:   [...(enc.vehicles ?? []), instance],
        updated_at: new Date().toISOString(),
      }).eq('id', enc.id)
      setView('menu')
    },
    [mapId, campaignId, addToken, supabase],
  )

  /* ── Pointer token toggle ── */
  async function togglePointer(type: string) {
    if (!mapId || !campaignId) return
    const existing = tokens.find(t => t.token_type === type)
    if (existing) {
      await removeToken(existing.id)
    } else {
      await addToken({
        map_id:           mapId,
        campaign_id:      campaignId,
        participant_type: 'adversary',
        character_id:     null,
        participant_id:   null,
        slot_key:         null,
        label:            null,
        alignment:        null,
        x:                0.5,
        y:                0.5,
        is_visible:       true,
        token_size:       1.0,
        wound_pct:        null,
        token_image_url:  null,
        token_shape:      'circle',
        token_type:       type,
      })
    }
  }

  const backBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--hud-text-dim)', fontFamily: FONT, fontSize: 'var(--text-caption)',
    display: 'flex', alignItems: 'center', gap: '0.25rem',
  }
  const subViewHeader: React.CSSProperties = {
    padding: '0.5rem 0.75rem', borderBottom: `1px solid ${BORDER}`, flexShrink: 0,
  }

  /* ── Adversary library view ── */
  if (view === 'adversary') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={subViewHeader}>
          <button onClick={() => setView('menu')} style={backBtn}>← Back</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.875rem' }}>
          <AdversaryLibrary
            campaignId={campaignId}
            sessionMode="exploration"
            onAddToken={handleAddAdversaryToken}
            mapId={mapId}
          />
        </div>
      </div>
    )
  }

  /* ── Vehicle library view ── */
  if (view === 'vehicle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={subViewHeader}>
          <button onClick={() => setView('menu')} style={backBtn}>← Back</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.875rem' }}>
          <VehicleLibrary
            campaignId={campaignId}
            sessionMode="exploration"
            onAddToken={handleAddVehicleToken}
            mapId={mapId}
          />
        </div>
      </div>
    )
  }

  /* ── Player token panel ── */
  if (view === 'player') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={subViewHeader}>
          <button onClick={() => setView('menu')} style={backBtn}>← Back</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <StagingTokenPanel
            mapId={mapId}
            campaignId={campaignId}
            characters={characters}
            tokens={tokens}
            addToken={addToken}
            removeToken={removeToken}
            toggleVisibility={toggleVisibility}
            removeAllTokens={removeAllTokens}
            playersOnly
          />
        </div>
      </div>
    )
  }

  /* ── Placed tokens view ── */
  if (view === 'placed') {
    const placedTokens = tokens.filter(t => !t.token_type?.startsWith('pointer_'))
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={subViewHeader}>
          <button onClick={() => setView('menu')} style={backBtn}>← Back</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <StagingTokenPanel
            mapId={mapId}
            campaignId={campaignId}
            characters={characters}
            tokens={placedTokens}
            addToken={addToken}
            removeToken={removeToken}
            toggleVisibility={toggleVisibility}
            removeAllTokens={removeAllTokens}
            noPlayers
          />
        </div>
      </div>
    )
  }

  /* ── Menu view ── */
  const placedCount = tokens.filter(t => !t.token_type?.startsWith('pointer_')).length

  return (
    <div style={{ padding: '0.75rem 0.875rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {/* Placed tokens shortcut */}
      <div>
        <div style={sectionHeader}>Placed Tokens</div>
        <button
          style={{ ...tokenBtn, color: placedCount > 0 ? HUD.gold : 'var(--hud-text-dim)', justifyContent: 'space-between' }}
          onClick={() => setView('placed')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>◈</span> Placed Tokens
          </span>
          {placedCount > 0 && (
            <span style={{
              fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700,
              background: 'rgba(150,168,180,0.12)', border: '1px solid var(--hud-border-hi)',
              borderRadius: '0.625rem', padding: '0.0625rem 0.4375rem', color: HUD.gold,
            }}>
              {placedCount}
            </span>
          )}
        </button>
      </div>

      {/* Add tokens */}
      <div>
        <div style={sectionHeader}>Add Tokens</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <button style={{ ...tokenBtn, color: HUD.gold }} onClick={() => setView('player')}>
            <span>👤</span> Manage Player Tokens
          </button>
          <button style={{ ...tokenBtn, color: HUD.gold }} onClick={() => setView('adversary')}>
            <span>◆</span> Add Adversary Token
          </button>
          <button style={{ ...tokenBtn, color: HUD.gold }} onClick={() => setView('vehicle')}>
            <span>△</span> Add Vehicle Token
          </button>
        </div>
      </div>

      {/* Pointer tokens */}
      <div>
        <div style={sectionHeader}>Pointer Tokens</div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {POINTER_DEFS.map(({ type, hex, label }) => {
            const active = tokens.some(t => t.token_type === type)
            return (
              <button
                key={type}
                disabled={!mapId}
                onClick={() => togglePointer(type)}
                title={active ? `Remove ${label}` : `Place ${label}`}
                style={{
                  flex:         1,
                  padding:      '0.375rem 0.25rem',
                  background:   active ? 'var(--hud-surface-hi)' : 'var(--hud-surface-mid)',
                  border:       `1px solid ${active ? 'var(--hud-border-strong)' : 'var(--hud-border-hi)'}`,
                  borderRadius: RADIUS.md,
                  cursor:       mapId ? 'pointer' : 'not-allowed',
                  opacity:      mapId ? 1 : 0.4,
                  display:      'flex',
                  flexDirection:'column',
                  alignItems:   'center',
                  gap:          '0.1875rem',
                }}
              >
                {/* hex is a pre-approved map token colour */}
                <span style={{ width: '0.75rem', height: '0.75rem', borderRadius: RADIUS.full, background: hex, display: 'block', boxShadow: active ? `0 0 6px ${hex}88` : 'none' }} />
                <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: active ? 'var(--hud-text)' : 'var(--hud-text-dim)', fontWeight: 700 }}>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Remove all + Opening Crawl */}
      <div>
        <div style={sectionHeader}>Actions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <button
            disabled={!mapId || tokens.length === 0}
            onClick={removeAllTokens}
            style={{
              ...tokenBtn,
              borderColor: 'var(--state-failure)',
              color:       'var(--state-failure)',
              opacity:     (!mapId || tokens.length === 0) ? 0.4 : 1,
            }}
          >
            Remove All Tokens
          </button>
          <button
            onClick={onOpenCrawl}
            disabled={crawlLoading}
            style={{
              ...tokenBtn,
              color:       isCrawlActive ? 'var(--state-success)' : crawlLoading ? 'var(--hud-text-dim)' : HUD.gold,
              borderColor: isCrawlActive ? 'var(--state-success)' : 'var(--hud-border-hi)',
              opacity:     crawlLoading ? 0.6 : 1,
            }}
          >
            <span>✦</span>
            {crawlLoading ? 'Loading…' : isCrawlActive ? 'Opening Crawl — LIVE' : 'Opening Crawl'}
          </button>
        </div>
      </div>
    </div>
  )
}
