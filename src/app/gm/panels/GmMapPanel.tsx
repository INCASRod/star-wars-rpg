'use client'

import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import type { MapToken } from '@/hooks/useMapTokens'
import type { Character } from '@/lib/types'
import type { CrawlContent } from '@/hooks/useActiveMap'
import { GmTokenControls } from './GmTokenControls'
import { HUD, FONT_BODY, EASE, FS, SP, RADIUS, Z } from '@/lib/tokens'

const FONT   = FONT_BODY
const BORDER = 'var(--hud-border)'

const GREEN = 'var(--state-success)'
const RED   = 'var(--state-failure)'

const darkInput: React.CSSProperties = {
  background:   'var(--hud-surface-lo)',
  border:       `1px solid var(--hud-border-hi)`,
  borderRadius: RADIUS.md,
  color:        HUD.text,
  fontFamily:   FONT,
  fontSize:     FS.label,
  padding:      `${SP[2]} ${SP[2]}`,
  width:        '100%',
  boxSizing:    'border-box',
  outline:      'none',
}

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

  // ── Opening Crawl state ─────────────────────────────────────────────────
  const [crawlMapId,      setCrawlMapId]      = useState<string | null>(null)
  const [crawlHeading,    setCrawlHeading]    = useState('')
  const [crawlSubheading, setCrawlSubheading] = useState('')
  const [crawlBody,       setCrawlBody]       = useState('')
  const [crawlBusy,       setCrawlBusy]       = useState(false)
  const [crawlLoading,    setCrawlLoading]    = useState(false)
  const [previousMapId,   setPreviousMapId]   = useState<string | null>(null)
  const [crawlModalOpen,  setCrawlModalOpen]  = useState(false)

  const isCrawlActive = crawlMapId !== null && mapId === crawlMapId

  // Fetch or create the crawl row, returning its id. Safe to call multiple times.
  async function fetchOrCreateCrawlRow(): Promise<string | null> {
    if (crawlMapId) return crawlMapId
    if (!campaignId) return null

    const { data: rows } = await supabase
      .from('maps')
      .select('id, crawl_content')
      .eq('campaign_id', campaignId)
      .eq('map_type', 'crawl')
      .limit(1)

    if (rows && rows.length > 0) {
      const row = rows[0]
      const content = row.crawl_content as CrawlContent | null
      if (content) {
        setCrawlHeading(content.heading ?? '')
        setCrawlSubheading(content.subheading ?? '')
        setCrawlBody(content.body ?? '')
      }
      setCrawlMapId(row.id as string)
      return row.id as string
    }

    const { data: inserted } = await supabase
      .from('maps')
      .insert({
        campaign_id:           campaignId,
        name:                  'Opening Crawl',
        image_url:             '',
        grid_enabled:          false,
        grid_size:             50,
        is_active:             false,
        is_visible_to_players: false,
        map_type:              'crawl',
        crawl_content:         { heading: '', subheading: '', body: '' },
      })
      .select('id')
      .single()

    if (inserted) {
      setCrawlMapId(inserted.id as string)
      return inserted.id as string
    }
    return null
  }

  async function handleOpenCrawl() {
    if (crawlLoading) return
    setCrawlLoading(true)
    await fetchOrCreateCrawlRow()
    setCrawlLoading(false)
    setCrawlModalOpen(true)
  }

  async function handleSaveCrawl() {
    if (crawlBusy) return
    setCrawlBusy(true)
    const id = await fetchOrCreateCrawlRow()
    if (id) {
      await supabase
        .from('maps')
        .update({ crawl_content: { heading: crawlHeading, subheading: crawlSubheading, body: crawlBody } })
        .eq('id', id)
    }
    setCrawlBusy(false)
  }

  async function handlePlayCrawl() {
    if (crawlBusy) return
    setCrawlBusy(true)
    const id = await fetchOrCreateCrawlRow()
    if (id) {
      await supabase
        .from('maps')
        .update({ crawl_content: { heading: crawlHeading, subheading: crawlSubheading, body: crawlBody } })
        .eq('id', id)
      setPreviousMapId(mapId)
      await supabase.from('maps').update({ is_active: false }).eq('campaign_id', campaignId)
      await supabase.from('maps').update({ is_active: true, is_visible_to_players: true }).eq('id', id)
    }
    setCrawlBusy(false)
  }

  async function handleStopCrawl() {
    if (crawlBusy) return
    const id = crawlMapId ?? await fetchOrCreateCrawlRow()
    if (!id) return
    setCrawlBusy(true)
    await supabase.from('maps').update({ is_visible_to_players: false }).eq('id', id)
    await supabase.from('maps').update({ is_active: false }).eq('campaign_id', campaignId)
    if (previousMapId) {
      await supabase.from('maps').update({ is_active: true }).eq('id', previousMapId)
    }
    setPreviousMapId(null)
    setCrawlBusy(false)
  }

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

          <div style={controlRow}>
            <button
              onClick={() => window.open('/table?campaign=' + campaignId, '_blank')}
              style={toggleBtn(false)}
            >
              ⛶ Table Display
            </button>
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
          onOpenCrawl={() => void handleOpenCrawl()}
          isCrawlActive={isCrawlActive}
          crawlLoading={crawlLoading}
        />
      </div>

      {/* Opening Crawl modal */}
      {crawlModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setCrawlModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: Z.modal,
            background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--hud-surface-hi)', border: `1px solid ${HUD.borderHi}`,
              borderRadius: RADIUS.lg, padding: SP[6], width: '100%', maxWidth: 440,
              display: 'flex', flexDirection: 'column', gap: SP[3],
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: FONT, fontSize: FS.h4, fontWeight: 700, color: HUD.gold }}>✦ Opening Crawl</div>
              <button
                onClick={() => setCrawlModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: HUD.textFaint, fontSize: FS.h4, lineHeight: 1, padding: 0 }}
              >×</button>
            </div>

            {/* Form fields */}
            <input
              value={crawlHeading}
              onChange={e => setCrawlHeading(e.target.value)}
              placeholder="Heading (e.g. Episode IV)"
              style={darkInput}
            />
            <input
              value={crawlSubheading}
              onChange={e => setCrawlSubheading(e.target.value)}
              placeholder="Sub-heading (e.g. A NEW HOPE)"
              style={darkInput}
            />
            <textarea
              value={crawlBody}
              onChange={e => setCrawlBody(e.target.value)}
              placeholder="Crawl body text…"
              rows={6}
              style={{ ...darkInput, resize: 'vertical' }}
            />

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: SP[2], marginTop: SP[1] }}>
              <button
                onClick={() => void handleSaveCrawl()}
                disabled={crawlBusy}
                style={{
                  flex: 1, padding: `${SP[2]} 0`, borderRadius: RADIUS.md,
                  background: 'var(--hud-surface-lo)', border: `1px solid var(--hud-border-hi)`,
                  color: HUD.text, fontFamily: FONT, fontSize: FS.caption, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                  opacity: crawlBusy ? 0.45 : 1,
                  transition: `opacity ${EASE.quick}`,
                }}
              >
                Save Crawl
              </button>
              {isCrawlActive ? (
                <button
                  onClick={() => void handleStopCrawl()}
                  disabled={crawlBusy}
                  style={{
                    flex: 1, padding: `${SP[2]} 0`, borderRadius: RADIUS.md,
                    background: `color-mix(in srgb, ${RED} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${RED} 40%, transparent)`,
                    color: RED, fontFamily: FONT, fontSize: FS.caption, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                    opacity: crawlBusy ? 0.45 : 1,
                    transition: `opacity ${EASE.quick}`,
                  }}
                >
                  Stop Crawl
                </button>
              ) : (
                <button
                  onClick={() => void handlePlayCrawl()}
                  disabled={crawlBusy || (!crawlHeading.trim() && !crawlSubheading.trim() && !crawlBody.trim())}
                  style={{
                    flex: 1, padding: `${SP[2]} 0`, borderRadius: RADIUS.md,
                    background: `color-mix(in srgb, ${GREEN} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${GREEN} 40%, transparent)`,
                    color: GREEN, fontFamily: FONT, fontSize: FS.caption, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                    opacity: (crawlBusy || (!crawlHeading.trim() && !crawlSubheading.trim() && !crawlBody.trim())) ? 0.45 : 1,
                    transition: `opacity ${EASE.quick}`,
                  }}
                >
                  Play Opening
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
