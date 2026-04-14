'use client'

import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CombatPanel } from '@/components/dm/CombatPanel'
import { HolocronLoader } from '@/components/ui/HolocronLoader'
import { GmReferenceDrawer } from '@/components/gm/GmReferenceDrawer'
import type { Character } from '@/lib/types'

const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FST = "var(--font-share-tech-mono), 'Share Tech Mono', monospace"
const RED = '#E05050'
const GOLD = '#C8AA50'
const DIM = '#6A8070'
const BORDER = 'rgba(200,170,80,0.14)'

function CombatPageInner() {
  const params = useSearchParams()
  const campaignId = params.get('campaign')

  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [gmScreenOpen, setGmScreenOpen] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  // GM broadcast channels — same pattern as main GM page
  const gmChannelsRef = useRef<Map<string, ReturnType<typeof supabase.channel>>>(new Map())

  // Set up channels whenever characters list changes
  useEffect(() => {
    const map = gmChannelsRef.current
    for (const c of characters) {
      if (!map.has(c.id)) {
        const ch = supabase.channel(`gm-notify-${c.id}`)
        ch.subscribe()
        map.set(c.id, ch)
      }
    }
  }, [characters, supabase])

  // Cleanup channels on unmount
  useEffect(() => {
    return () => {
      for (const ch of gmChannelsRef.current.values()) {
        supabase.removeChannel(ch)
      }
    }
  }, [supabase])

  const sendToChar = useCallback((charId: string, payload: Record<string, unknown>) => {
    const ch = gmChannelsRef.current.get(charId)
    if (ch) ch.send({ type: 'broadcast', event: 'gm-action', payload })
  }, [])

  // Load characters for this campaign
  useEffect(() => {
    if (!campaignId) { setLoading(false); return }
    supabase
      .from('characters')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_archived', false)
      .then(({ data }) => {
        if (data) setCharacters(data as Character[])
        setLoading(false)
      })
  }, [campaignId, supabase])

  if (!campaignId) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#060D09', color: DIM,
        fontFamily: FC, fontSize: 14, letterSpacing: '0.1em',
      }}>
        Missing campaign ID. Open this from the GM dashboard.
      </div>
    )
  }

  if (loading) return <HolocronLoader />

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#060D09' }}>
      {/* Top bar */}
      <div style={{
        flexShrink: 0, height: 52,
        background: 'rgba(6,13,9,0.97)',
        borderBottom: '1px solid rgba(224,82,82,0.5)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}>
        <span style={{
          fontFamily: FC, fontSize: 'var(--text-label)',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: RED, fontWeight: 700,
        }}>
          ⚔ Full Combat Panel
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: FC, fontSize: 'var(--text-overline)', color: GOLD, opacity: 0.5, letterSpacing: '0.12em' }}>
            {characters.length} CHARACTERS LOADED
          </span>
          <button
            onClick={() => window.close()}
            style={{
              background: 'rgba(224,82,82,0.15)',
              border: '2px solid rgba(224,82,82,0.7)',
              borderRadius: 4, padding: '7px 20px',
              cursor: 'pointer',
              fontFamily: FC, fontSize: 'var(--text-body-sm)',
              fontWeight: 700, letterSpacing: '0.12em',
              color: RED, textTransform: 'uppercase',
              transition: '.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,82,82,0.35)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,82,82,0.15)' }}
          >
            ✕ CLOSE TAB
          </button>
        </div>
      </div>

      {/* Combat panel fills the rest */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <CombatPanel
          campaignId={campaignId}
          characters={characters}
          isDm={true}
          sendToChar={sendToChar}
        />
      </div>

      {/* Floating GM Screen button */}
      <button
        onClick={() => setGmScreenOpen(o => !o)}
        title="GM Reference Screen"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 8998,
          background: gmScreenOpen ? 'rgba(200,170,80,0.2)' : 'rgba(6,13,9,0.92)',
          border: `2px solid ${gmScreenOpen ? GOLD : 'rgba(200,170,80,0.3)'}`,
          borderRadius: 8, padding: '10px 16px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: FST, fontSize: 'var(--text-caption)',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: gmScreenOpen ? GOLD : DIM,
          boxShadow: gmScreenOpen ? '0 0 16px rgba(200,170,80,0.2)' : '0 2px 12px rgba(0,0,0,0.5)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { if (!gmScreenOpen) { (e.currentTarget as HTMLElement).style.color = GOLD; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,170,80,0.6)' } }}
        onMouseLeave={e => { if (!gmScreenOpen) { (e.currentTarget as HTMLElement).style.color = DIM; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,170,80,0.3)' } }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>⬛</span>
        GM Screen
      </button>

      <GmReferenceDrawer open={gmScreenOpen} onClose={() => setGmScreenOpen(false)} />
    </div>
  )
}

export default function CombatPage() {
  return (
    <Suspense fallback={<HolocronLoader />}>
      <CombatPageInner />
    </Suspense>
  )
}
