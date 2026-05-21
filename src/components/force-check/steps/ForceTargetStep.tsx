'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/lib/types'
import { FS } from '@/lib/tokens'

const FONT_C = "var(--font-rajdhani), 'Cinzel', serif"
const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"

const FORCE_BLUE     = '#7EC8E3'
const FORCE_BLUE_DIM = 'rgba(126,200,227,0.15)'

export interface TargetEntry {
  instanceId: string
  name:       string
  kind:       'pc' | 'enemy'
}

interface ForceTargetStepProps {
  isCombat:           boolean
  campaignId:         string | null
  characterId:        string
  selectedTargets:    TargetEntry[]
  targetContext:      'environment' | 'character' | null
  onSelectTargets:    (targets: TargetEntry[]) => void
  onTargetContext:    (ctx: 'environment' | 'character') => void
  /** Pre-fetched campaign characters — skips the DB fetch when provided */
  campaignCharacters?: Character[]
  /** Pre-fetched encounter enemies mapped to TargetEntry — skips the DB fetch when provided */
  encounterEnemies?:  TargetEntry[]
}

export function ForceTargetStep({
  isCombat, campaignId, characterId,
  selectedTargets, targetContext,
  onSelectTargets, onTargetContext,
  campaignCharacters, encounterEnemies,
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
    // Use pre-fetched data if provided — skip DB
    if (campaignCharacters) { setPcs(campaignCharacters); setLoading(false) }
    if (encounterEnemies)   { setEnemies(encounterEnemies); setLoading(false) }
    if (campaignCharacters || encounterEnemies) return

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
  }, [campaignId, isCombat, campaignCharacters, encounterEnemies])

  if (!isCombat) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: 'rgba(58,12,4,0.55)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          How will you use this power?
        </div>
        {(['environment', 'character'] as const).map(ctx => (
          <button
            key={ctx}
            onClick={() => onTargetContext(ctx)}
            style={{
              textAlign: 'left', padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
              background: targetContext === ctx ? 'rgba(126,200,227,0.1)' : 'var(--hud-surface-lo)',
              border: `${targetContext === ctx ? 2 : 1}px solid ${targetContext === ctx ? FORCE_BLUE : FORCE_BLUE_DIM}`,
              transition: 'all .15s',
            }}
          >
            <div style={{ fontFamily: FONT_C, fontSize: FS.sm, color: targetContext === ctx ? '#3A0C04' : 'rgba(90,40,24,0.7)', marginBottom: 4 }}>
              {ctx === 'environment' ? '🌍  Use on Environment' : '👤  Use on a Character'}
            </div>
            <div style={{ fontFamily: FONT_R, fontSize: FS.caption, color: 'rgba(90,40,24,0.45)' }}>
              {ctx === 'environment'
                ? 'Targeting an object, location, or environmental feature'
                : 'Target a PC or friendly NPC'}
            </div>
          </button>
        ))}
        {targetContext === 'character' && pcs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: 'rgba(90,40,24,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Select character (optional)
            </div>
            {pcs.filter(c => c.id !== characterId).map(c => {
              const t: TargetEntry = { instanceId: c.id, name: c.name, kind: 'pc' }
              const sel = selectedIds.has(c.id)
              return (
                <button key={c.id} onClick={() => toggleTarget(t)} style={{
                  textAlign: 'left', padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                  background: sel ? 'rgba(126,200,227,0.08)' : 'transparent',
                  border: `1px solid ${sel ? FORCE_BLUE : FORCE_BLUE_DIM}`,
                  fontFamily: FONT_R, fontSize: FS.label,
                  color: sel ? '#3A0C04' : 'rgba(90,40,24,0.65)', transition: 'all .15s',
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
      <div style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: 'rgba(58,12,4,0.55)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
        Select Targets
      </div>

      <div style={{ padding: '7px 10px', background: 'rgba(126,200,227,0.04)', border: `1px solid ${FORCE_BLUE_DIM}`, borderRadius: 6 }}>
        <div style={{ fontFamily: FONT_R, fontSize: FS.caption, color: 'rgba(58,12,4,0.55)', fontStyle: 'italic', lineHeight: 1.45 }}>
          ℹ Force powers may target anyone. Select all applicable targets. The GM will determine valid targeting.
        </div>
      </div>

      {loading && (
        <div style={{ fontFamily: FONT_R, fontSize: FS.label, color: 'rgba(90,40,24,0.3)', textAlign: 'center', padding: '16px 0' }}>
          Loading participants…
        </div>
      )}

      {!loading && pcTargets.length === 0 && enemies.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontFamily: FONT_R, fontSize: FS.sm, color: 'rgba(90,40,24,0.4)' }}>No participants in the current encounter.</div>
          <div style={{ fontFamily: FONT_R, fontSize: FS.caption, color: 'rgba(58,12,4,0.4)' }}>Ask your GM to set up the initiative tracker.</div>
        </div>
      )}

      {pcTargets.length > 0 && (
        <TargetSection label="Player Characters" targets={pcTargets} selectedIds={selectedIds} onToggle={toggleTarget} color={FORCE_BLUE} textColor="#3A0C04" />
      )}
      {enemies.length > 0 && (
        <TargetSection label="Enemies" targets={enemies} selectedIds={selectedIds} onToggle={toggleTarget} color="#E03A1E" />
      )}
    </div>
  )
}

function TargetSection({ label, targets, selectedIds, onToggle, color, textColor }: {
  label: string
  targets: TargetEntry[]
  selectedIds: Set<string>
  onToggle: (t: TargetEntry) => void
  color: string
  textColor?: string
}) {
  const [open, setOpen] = useState(true)
  const FONT_C = "var(--font-rajdhani), 'Cinzel', serif"
  const FONT_R = "var(--font-rajdhani), 'Rajdhani', sans-serif"
  const resolvedText = textColor ?? color
  return (
    <div>
      <button onClick={() => setOpen(v => !v)} style={{
        width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 0', marginBottom: open ? 6 : 0,
      }}>
        <span style={{ color: 'rgba(90,40,24,0.3)', fontSize: 10 }}>{open ? '▼' : '▶'}</span>
        <span style={{ fontFamily: FONT_C, fontSize: FS.caption, color: `${color}90`, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: FS.overline, color: 'rgba(90,40,24,0.25)' }}>({targets.length})</span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {targets.map(t => {
            const sel = selectedIds.has(t.instanceId)
            return (
              <button key={t.instanceId} onClick={() => onToggle(t)} style={{
                textAlign: 'left', padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
                background: sel ? `${color}10` : 'transparent',
                border: `1px solid ${sel ? `${color}60` : 'var(--hud-border)'}`,
                fontFamily: FONT_R, fontSize: FS.label,
                color: sel ? resolvedText : 'rgba(90,40,24,0.6)', transition: 'all .15s',
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

