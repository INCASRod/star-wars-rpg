'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AdversaryInstance } from '@/lib/adversaries'

// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD      = '#C8AA50'
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.15)'
const TEXT      = 'rgba(255,255,255,0.85)'
const TEXT_DIM  = 'rgba(255,255,255,0.5)'
const CARD_BG   = 'rgba(255,255,255,0.03)'
const FONT_C    = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono', 'Courier New', monospace"

const TYPE_COLORS: Record<string, string> = {
  minion:  'rgba(200,170,80,0.4)',
  rival:   '#FF9800',
  nemesis: '#e05252',
}

interface TargetSelectStepProps {
  campaignId:      string | null
  attackType:      'ranged' | 'melee'
  selectedTargets: AdversaryInstance[]
  onSelect:        (targets: AdversaryInstance[]) => void
  /** When set, skip the DB fetch and show these pre-built targets instead */
  gmTargets?:      AdversaryInstance[]
}

function WoundBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.min(1, current / max) : 0
  const color = pct >= 0.75 ? '#e05252' : pct >= 0.5 ? '#FF9800' : '#4CAF50'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        flex: 1, height: 4, background: 'rgba(255,255,255,0.08)',
        borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct * 100}%`, height: '100%',
          background: color, transition: 'width 200ms',
        }} />
      </div>
      <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)', color: TEXT_DIM, whiteSpace: 'nowrap' }}>
        {current}/{max}
      </span>
    </div>
  )
}

export function TargetSelectStep({ campaignId, attackType, selectedTargets, onSelect, gmTargets }: TargetSelectStepProps) {
  const [enemies, setEnemies]   = useState<AdversaryInstance[]>([])
  const [loading, setLoading]   = useState(false)
  const [encounterId, setEncounterId] = useState<string | null>(null)

  useEffect(() => {
    // GM mode: targets are provided directly — skip DB fetch
    if (gmTargets) {
      setEnemies(gmTargets)
      return
    }
    if (!campaignId) return
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('combat_encounters')
      .select('id, adversaries')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .limit(1)
      .single()
      .then(({ data, error: err }) => {
        if (!err && data) {
          setEncounterId(data.id)
          const all = (data.adversaries as AdversaryInstance[]) ?? []
          setEnemies(all.filter(a => a.revealed !== false))
        }
        setLoading(false)
      })
  }, [campaignId, gmTargets])

  function toggleTarget(enemy: AdversaryInstance) {
    const already = selectedTargets.find(t => t.instanceId === enemy.instanceId)
    if (already) {
      onSelect(selectedTargets.filter(t => t.instanceId !== enemy.instanceId))
    } else {
      onSelect([...selectedTargets, enemy])
    }
  }

  function getWoundsDisplay(enemy: AdversaryInstance) {
    if (enemy.type === 'minion') {
      const remaining = enemy.groupRemaining ?? enemy.groupSize ?? 1
      const total = enemy.groupSize ?? 1
      const wounds = (enemy.minionWounds ?? [])[0] ?? 0
      return { current: wounds, max: enemy.woundThreshold, extra: `${remaining}/${total} remain` }
    }
    const current = enemy.woundsCurrent ?? 0
    return { current, max: enemy.woundThreshold }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', fontFamily: FONT_R, fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)', color: GOLD_DIM }}>
        Loading encounter…
      </div>
    )
  }

  if (!campaignId) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)', color: TEXT_DIM, lineHeight: 1.5 }}>
          No campaign selected. Join a campaign to see combat targets.
        </div>
        <button
          onClick={() => onSelect([])}
          style={{
            marginTop: 16, padding: '8px 20px',
            background: 'rgba(200,170,80,0.1)', border: `1px solid ${GOLD_BD}`,
            borderRadius: 6, cursor: 'pointer',
            fontFamily: FONT_C, fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)', color: GOLD,
          }}
        >
          Skip Target
        </button>
      </div>
    )
  }

  if (enemies.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_R, fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)', color: TEXT_DIM, lineHeight: 1.5, marginBottom: 16 }}>
          No enemies in the current encounter.
          <br />
          Ask your GM to add enemies to the initiative tracker.
        </div>
        <button
          onClick={() => onSelect([])}
          style={{
            padding: '10px 24px',
            background: 'rgba(200,170,80,0.1)', border: `1px solid ${GOLD_BD}`,
            borderRadius: 6, cursor: 'pointer',
            fontFamily: FONT_C, fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)', color: GOLD,
          }}
        >
          Skip Target
        </button>
      </div>
    )
  }

  const multipleSelected = selectedTargets.length > 1

  return (
    <div>
      {multipleSelected && (
        <div style={{
          background: 'rgba(200,170,80,0.06)',
          border: `1px solid rgba(200,170,80,0.2)`,
          borderRadius: 6, padding: '8px 12px', marginBottom: 12,
          fontFamily: FONT_R, fontSize: 'clamp(0.7rem, 1.05vw, 0.82rem)', color: GOLD_DIM,
        }}>
          ℹ Multiple targets selected. The GM will determine valid targeting.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {enemies.map(enemy => {
          const isSelected = selectedTargets.some(t => t.instanceId === enemy.instanceId)
          const typeColor  = TYPE_COLORS[enemy.type] ?? TEXT_DIM
          const wounds = getWoundsDisplay(enemy)

          return (
            <button
              key={enemy.instanceId}
              onClick={() => toggleTarget(enemy)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: isSelected ? 'rgba(200,170,80,0.06)' : CARD_BG,
                border: `${isSelected ? 2 : 1}px solid ${isSelected ? GOLD : GOLD_BD}`,
                borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                transition: 'border-color 120ms, background 120ms',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                {/* Type icon */}
                <div style={{
                  width: 28, height: 28, borderRadius: 4,
                  background: `${typeColor}15`,
                  border: `1px solid ${typeColor}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: FONT_M, fontSize: 'clamp(0.55rem, 0.82vw, 0.65rem)', color: typeColor,
                }}>
                  {enemy.type === 'minion'  && 'MIN'}
                  {enemy.type === 'rival'   && 'RVL'}
                  {enemy.type === 'nemesis' && 'NEM'}
                </div>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: FONT_R,
                    fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)',
                    fontWeight: 700,
                    color: isSelected ? GOLD : TEXT,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {enemy.name}
                    {enemy.type === 'minion' && enemy.groupRemaining != null && (
                      <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.58rem, 0.85vw, 0.68rem)', color: TEXT_DIM, marginLeft: 6 }}>
                        ×{enemy.groupRemaining}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                    <span style={{
                      fontFamily: FONT_M,
                      fontSize: 'clamp(0.55rem, 0.82vw, 0.65rem)',
                      color: typeColor,
                      textTransform: 'capitalize',
                    }}>
                      {enemy.type}
                    </span>
                    {enemy.soak > 0 && (
                      <span style={{
                        fontFamily: FONT_M,
                        fontSize: 'clamp(0.55rem, 0.82vw, 0.65rem)',
                        color: TEXT_DIM,
                      }}>
                        · Soak {enemy.soak}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div style={{ fontFamily: FONT_M, fontSize: 'clamp(0.55rem, 0.82vw, 0.65rem)', color: GOLD, flexShrink: 0 }}>
                    ✓
                  </div>
                )}
              </div>

              {/* Wound bar */}
              <WoundBar current={wounds.current} max={wounds.max} />
            </button>
          )
        })}
      </div>

      {enemies.length > 0 && (
        <button
          onClick={() => onSelect([])}
          style={{
            marginTop: 12, width: '100%', padding: '8px 0',
            background: 'transparent', border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: 6, cursor: 'pointer',
            fontFamily: FONT_R, fontSize: 'clamp(0.7rem, 1.05vw, 0.82rem)', color: TEXT_DIM,
          }}
        >
          Skip Target (GM will handle)
        </button>
      )}
    </div>
  )
}
