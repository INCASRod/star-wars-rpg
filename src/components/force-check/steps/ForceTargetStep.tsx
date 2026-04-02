'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/lib/types'

const FONT_C = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M = "'Share Tech Mono', 'Courier New', monospace"
const FORCE_BLUE     = '#7EC8E3'
const FORCE_BLUE_DIM = 'rgba(126,200,227,0.15)'

export interface TargetEntry {
  instanceId: string
  name:       string
  kind:       'pc' | 'enemy'
}

interface ForceTargetStepProps {
  isCombat:        boolean
  campaignId:      string | null
  characterId:     string
  selectedTargets: TargetEntry[]
  targetContext:   'environment' | 'character' | null
  onSelectTargets: (targets: TargetEntry[]) => void
  onTargetContext: (ctx: 'environment' | 'character') => void
}

export function ForceTargetStep({
  isCombat, campaignId, characterId,
  selectedTargets, targetContext,
  onSelectTargets, onTargetContext,
}: ForceTargetStepProps) {
  const [pcs, setPcs]           = useState<Character[]>([])
  const [enemies, setEnemies]   = useState<TargetEntry[]>([])
  const [loading, setLoading]   = useState(false)

  const selectedIds = new Set(selectedTargets.map(t => t.instanceId))

  function toggleTarget(t: TargetEntry) {
    if (selectedIds.has(t.instanceId)) {
      onSelectTargets(selectedTargets.filter(s => s.instanceId !== t.instanceId))
    } else {
      onSelectTargets([...selectedTargets, t])
    }
  }

  useEffect(() => {
    if (!campaignId) return
    setLoading(true)
    const supabase = createClient()

    const loadAll = async () => {
      const [{ data: chars }, { data: encounter }] = await Promise.all([
        supabase.from('characters').select('id, name').eq('campaign_id', campaignId).eq('is_archived', false),
        isCombat
          ? supabase.from('combat_encounters').select('adversaries').eq('campaign_id', campaignId).eq('is_active', true).limit(1).single()
          : Promise.resolve({ data: null }),
      ])

      setPcs((chars ?? []) as Character[])

      if (isCombat && encounter) {
        const adv: TargetEntry[] = ((encounter as { adversaries?: {instanceId:string;name:string}[] }).adversaries ?? [])
          .map((a: {instanceId:string;name:string}) => ({ instanceId: a.instanceId, name: a.name, kind: 'enemy' as const }))
        setEnemies(adv)
      }
      setLoading(false)
    }
    loadAll()
  }, [campaignId, isCombat])

  if (!isCombat) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)', color: 'rgba(126,200,227,0.55)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          How will you use this power?
        </div>
        {(['environment', 'character'] as const).map(ctx => (
          <button
            key={ctx}
            onClick={() => onTargetContext(ctx)}
            style={{
              textAlign: 'left', padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
              background: targetContext === ctx ? 'rgba(126,200,227,0.1)' : 'rgba(255,255,255,0.03)',
              border: `${targetContext === ctx ? 2 : 1}px solid ${targetContext === ctx ? FORCE_BLUE : FORCE_BLUE_DIM}`,
              transition: 'all .15s',
            }}
          >
            <div style={{ fontFamily: FONT_C, fontSize: 'clamp(0.88rem, 1.4vw, 1.05rem)', color: targetContext === ctx ? FORCE_BLUE : 'rgba(232,223,200,0.7)', marginBottom: 4 }}>
              {ctx === 'environment' ? '🌍  Use on Environment' : '👤  Use on a Character'}
            </div>
            <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', color: 'rgba(232,223,200,0.45)' }}>
              {ctx === 'environment'
                ? 'Targeting an object, location, or environmental feature'
                : 'Target a PC or friendly NPC'}
            </div>
          </button>
        ))}
        {targetContext === 'character' && pcs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
            <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)', color: 'rgba(232,223,200,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Select character (optional)
            </div>
            {pcs.filter(c => c.id !== characterId).map(c => {
              const t: TargetEntry = { instanceId: c.id, name: c.name, kind: 'pc' }
              const sel = selectedIds.has(c.id)
              return (
                <button key={c.id} onClick={() => toggleTarget(t)} style={{
                  textAlign: 'left', padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                  background: sel ? 'rgba(126,200,227,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${sel ? FORCE_BLUE : FORCE_BLUE_DIM}`,
                  fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)',
                  color: sel ? FORCE_BLUE : 'rgba(232,223,200,0.65)', transition: 'all .15s',
                }}>
                  {sel ? '● ' : '○ '}{c.name}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Combat mode
  const pcTargets: TargetEntry[] = pcs.map(c => ({ instanceId: c.id, name: c.name, kind: 'pc' as const }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)', color: 'rgba(126,200,227,0.55)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
        Select Targets
      </div>

      <div style={{ padding: '7px 10px', background: 'rgba(126,200,227,0.04)', border: `1px solid ${FORCE_BLUE_DIM}`, borderRadius: 6 }}>
        <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)', color: 'rgba(126,200,227,0.5)', fontStyle: 'italic', lineHeight: 1.45 }}>
          ℹ Force powers may target anyone. Select all applicable targets. The GM will determine valid targeting.
        </div>
      </div>

      {loading && (
        <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)', color: 'rgba(232,223,200,0.3)', textAlign: 'center', padding: '16px 0' }}>
          Loading participants…
        </div>
      )}

      {!loading && pcTargets.length === 0 && enemies.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.85rem, 1.3vw, 1rem)', color: 'rgba(232,223,200,0.4)' }}>No participants in the current encounter.</div>
          <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.75rem, 1.2vw, 0.88rem)', color: 'rgba(126,200,227,0.35)' }}>Ask your GM to set up the initiative tracker.</div>
        </div>
      )}

      {pcTargets.length > 0 && (
        <TargetSection label="Player Characters" targets={pcTargets} selectedIds={selectedIds} onToggle={toggleTarget} color={FORCE_BLUE} />
      )}
      {enemies.length > 0 && (
        <TargetSection label="Enemies" targets={enemies} selectedIds={selectedIds} onToggle={toggleTarget} color="#E05050" />
      )}
    </div>
  )
}

function TargetSection({ label, targets, selectedIds, onToggle, color }: {
  label: string
  targets: TargetEntry[]
  selectedIds: Set<string>
  onToggle: (t: TargetEntry) => void
  color: string
}) {
  const [open, setOpen] = useState(true)
  const FONT_C = "var(--font-cinzel), 'Cinzel', serif"
  const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"
  return (
    <div>
      <button onClick={() => setOpen(v => !v)} style={{
        width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 0', marginBottom: open ? 6 : 0,
      }}>
        <span style={{ color: 'rgba(232,223,200,0.3)', fontSize: 10 }}>{open ? '▼' : '▶'}</span>
        <span style={{ fontFamily: FONT_C, fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)', color: `${color}90`, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
        <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.62rem,0.95vw,0.72rem)', color: 'rgba(232,223,200,0.25)' }}>({targets.length})</span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {targets.map(t => {
            const sel = selectedIds.has(t.instanceId)
            return (
              <button key={t.instanceId} onClick={() => onToggle(t)} style={{
                textAlign: 'left', padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
                background: sel ? `${color}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${sel ? `${color}60` : 'rgba(255,255,255,0.06)'}`,
                fontFamily: FONT_R, fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)',
                color: sel ? color : 'rgba(232,223,200,0.6)', transition: 'all .15s',
              }}>
                {sel ? '● ' : '○ '}{t.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
