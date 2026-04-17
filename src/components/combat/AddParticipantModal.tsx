'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Adversary } from '@/lib/adversaries'
import type { Vehicle } from '@/lib/vehicles'
import { fetchVehicles } from '@/lib/vehicles'
import type { CombatEncounter } from '@/lib/combat'
import { FS_OVERLINE, FS_LABEL, FS_SM, FS_H3 } from '@/components/player-hud/design-tokens'

const PANEL_BG    = '#0a1510'
const RAISED_BG   = 'rgba(14,26,18,0.9)'
const INPUT_BG    = 'rgba(6,13,9,0.7)'
const GOLD        = '#C8AA50'
const BORDER      = 'rgba(200,170,80,0.18)'
const BORDER_MD   = 'rgba(200,170,80,0.32)'
const BORDER_HI   = 'rgba(200,170,80,0.55)'
const ENEMY_RED   = '#e05252'
const ALLIED_GREEN = '#52e08a'
const TEXT        = '#E8DFC8'
const TEXT_SEC    = 'rgba(232,223,200,0.6)'
const TEXT_MUTED  = 'rgba(232,223,200,0.35)'
const FC = "'Rajdhani', sans-serif"
const FM = "'Rajdhani', sans-serif"

interface AddParticipantModalProps {
  library: Adversary[]
  encounter: CombatEncounter | null
  groupSizes: Record<string, number>
  onAdd: (adv: Adversary, alignment: 'enemy' | 'allied_npc', successes: number, advantages: number, groupSize?: number) => void
  onAddVehicle: (vehicle: Vehicle, alignment: 'enemy' | 'allied_npc', successes: number, advantages: number) => void
  onClose: () => void
}

export function AddParticipantModal({ library, encounter, groupSizes, onAdd, onAddVehicle, onClose }: AddParticipantModalProps) {
  const [participantTab, setParticipantTab] = useState<'adversaries' | 'vehicles'>('adversaries')
  const [alignment, setAlignment]   = useState<'enemy' | 'allied_npc'>('enemy')
  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'minion' | 'rival' | 'nemesis'>('all')
  const [silFilter, setSilFilter]   = useState<'all' | '1' | '2' | '3' | '4' | '5+'>('all')
  const [initValues, setInitValues] = useState<Record<string, { successes: number; advantages: number }>>({})
  const [localGroupSizes, setLocalGroupSizes] = useState<Record<string, number>>({})
  const [vehicleLibrary, setVehicleLibrary]   = useState<Vehicle[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(false)

  const isMidCombat = !!encounter
  const accentColor = alignment === 'enemy' ? ENEMY_RED : ALLIED_GREEN

  // Load vehicles when that tab is first opened
  useEffect(() => {
    if (participantTab !== 'vehicles' || vehicleLibrary.length > 0 || vehiclesLoading) return
    setVehiclesLoading(true)
    fetchVehicles().then(vs => {
      setVehicleLibrary(vs)
      setVehiclesLoading(false)
    })
  }, [participantTab, vehicleLibrary.length, vehiclesLoading])

  const filteredAdversaries = useMemo(() => library.filter(a => {
    const matchType = typeFilter === 'all' || a.type === typeFilter
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  }), [library, typeFilter, search])

  const filteredVehicles = useMemo(() => vehicleLibrary.filter(v => {
    const matchSil = silFilter === 'all'
      ? true
      : silFilter === '5+'
        ? v.silhouette >= 5
        : v.silhouette === Number(silFilter)
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase())
    return matchSil && matchSearch
  }), [vehicleLibrary, silFilter, search])

  const getInit = (id: string) => initValues[id] ?? { successes: 0, advantages: 0 }
  const setInitField = (id: string, field: 'successes' | 'advantages', v: number) =>
    setInitValues(prev => ({ ...prev, [id]: { ...getInit(id), [field]: Math.max(0, v) } }))

  // Reset search when switching tabs
  function handleTabSwitch(tab: 'adversaries' | 'vehicles') {
    setParticipantTab(tab)
    setSearch('')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 560,
        background: PANEL_BG, border: `1px solid ${BORDER_HI}`,
        borderRadius: 6, maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px', borderBottom: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ fontFamily: FC, fontSize: FS_H3, fontWeight: 700, color: GOLD }}>
            {isMidCombat ? 'ADD TO COMBAT' : 'ADD TO ENCOUNTER'}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: `1px solid ${BORDER_MD}`,
              borderRadius: 4, padding: '5px 10px', cursor: 'pointer',
              fontFamily: FC, fontSize: FS_LABEL, color: TEXT,
            }}
          >✕</button>
        </div>

        {/* Adversaries / Vehicles tab switcher */}
        <div style={{
          display: 'flex', borderBottom: `1px solid ${BORDER}`, flexShrink: 0,
        }}>
          {(['adversaries', 'vehicles'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              style={{
                flex: 1, padding: '9px 0', cursor: 'pointer',
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${participantTab === tab ? GOLD : 'transparent'}`,
                fontFamily: FC, fontSize: FS_SM, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: participantTab === tab ? GOLD : TEXT_MUTED,
                transition: '.15s', marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Alignment toggle */}
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{
            fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: `${GOLD}b3`, marginBottom: 8,
          }}>
            Participant Type
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${BORDER_MD}`, borderRadius: 4, overflow: 'hidden' }}>
            {([
              { key: 'enemy',      label: 'ENEMY',      desc: 'Hostile — red initiative slot',   color: ENEMY_RED },
              { key: 'allied_npc', label: 'ALLIED NPC',  desc: 'Friendly — green initiative slot', color: ALLIED_GREEN },
            ] as const).map(opt => (
              <button
                key={opt.key}
                onClick={() => setAlignment(opt.key)}
                style={{
                  padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
                  background: alignment === opt.key ? `${opt.color}18` : 'transparent',
                  border: 'none',
                  borderRight: opt.key === 'enemy' ? `1px solid ${BORDER_MD}` : 'none',
                  transition: '.15s',
                }}
              >
                <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: alignment === opt.key ? opt.color : TEXT_SEC }}>
                  {opt.label}
                </div>
                <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginTop: 2 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Search + type/silhouette filter */}
        <div style={{ padding: '10px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={participantTab === 'adversaries' ? 'Search adversaries…' : 'Search vehicles…'}
            autoFocus
            style={{
              background: INPUT_BG, border: `1px solid ${BORDER}`,
              borderRadius: 4, padding: '6px 10px', color: TEXT,
              fontFamily: FM, fontSize: FS_LABEL, outline: 'none',
              width: '100%', boxSizing: 'border-box',
            }}
          />

          {participantTab === 'adversaries' && (
            <div style={{ display: 'flex', gap: 4 }}>
              {(['all', 'minion', 'rival', 'nemesis'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  style={{
                    flex: 1, padding: '3px 0',
                    background: typeFilter === t ? `${GOLD}20` : 'transparent',
                    border: `1px solid ${typeFilter === t ? BORDER_MD : BORDER}`,
                    borderRadius: 3, cursor: 'pointer',
                    fontFamily: FM, fontSize: FS_OVERLINE, letterSpacing: '0.06em',
                    color: typeFilter === t ? GOLD : TEXT_MUTED,
                    textTransform: 'uppercase',
                  }}
                >
                  {t === 'all' ? 'ALL' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          )}

          {participantTab === 'vehicles' && (
            <div style={{ display: 'flex', gap: 4 }}>
              {(['all', '1', '2', '3', '4', '5+'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSilFilter(s)}
                  style={{
                    flex: 1, padding: '3px 0',
                    background: silFilter === s ? `${GOLD}20` : 'transparent',
                    border: `1px solid ${silFilter === s ? BORDER_MD : BORDER}`,
                    borderRadius: 3, cursor: 'pointer',
                    fontFamily: FM, fontSize: FS_OVERLINE, letterSpacing: '0.06em',
                    color: silFilter === s ? GOLD : TEXT_MUTED,
                    textTransform: 'uppercase',
                  }}
                >
                  {s === 'all' ? 'ALL' : `Sil ${s}`}
                </button>
              ))}
            </div>
          )}

          {isMidCombat && (
            <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: `${ALLIED_GREEN}b3`, letterSpacing: '0.04em' }}>
              ⚡ Combat active — set initiative result before adding
            </div>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* ── Adversaries tab ── */}
          {participantTab === 'adversaries' && (
            <>
              {filteredAdversaries.length === 0 && (
                <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED, textAlign: 'center', padding: '24px 0' }}>
                  No adversaries found
                </div>
              )}
              {filteredAdversaries.map(adv => {
                const init = getInit(adv.id)
                const defaultSize = groupSizes[adv.id] ?? (adv.type === 'minion' ? 4 : 1)
                const size = localGroupSizes[adv.id] ?? defaultSize
                const setSize = (v: number) => setLocalGroupSizes(prev => ({ ...prev, [adv.id]: Math.max(1, Math.min(20, v)) }))
                const groupThreshold = adv.type === 'minion' ? (adv.wound ?? 5) * size : null
                const skillRank = adv.type === 'minion' ? size - 1 : null

                return (
                  <div key={adv.id} style={{
                    background: RAISED_BG,
                    border: `1px solid ${BORDER}`,
                    borderLeft: `3px solid ${accentColor}60`,
                    borderRadius: 5, padding: '8px 10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 600, color: TEXT }}>{adv.name}</span>
                        <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                          {adv.type}
                          {adv.type === 'minion' && (
                            <span style={{ color: `${GOLD}70`, marginLeft: 5 }}>×{size}</span>
                          )}
                          <span style={{ color: `${GOLD}70`, marginLeft: 8 }}>
                            BR {adv.brawn} · AG {adv.agility}
                          </span>
                        </div>
                      </div>

                      {isMidCombat && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>SUC</span>
                            <input
                              type="number" min={0} max={20} value={init.successes}
                              onChange={e => setInitField(adv.id, 'successes', Number(e.target.value))}
                              style={{
                                width: 38, background: INPUT_BG, border: `1px solid ${BORDER_MD}`,
                                borderRadius: 3, padding: '3px 4px', color: TEXT,
                                fontFamily: FM, fontSize: FS_LABEL, textAlign: 'center', outline: 'none',
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>ADV</span>
                            <input
                              type="number" min={0} max={20} value={init.advantages}
                              onChange={e => setInitField(adv.id, 'advantages', Number(e.target.value))}
                              style={{
                                width: 38, background: INPUT_BG, border: `1px solid ${BORDER_MD}`,
                                borderRadius: 3, padding: '3px 4px', color: TEXT,
                                fontFamily: FM, fontSize: FS_LABEL, textAlign: 'center', outline: 'none',
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => { onAdd(adv, alignment, init.successes, init.advantages, adv.type === 'minion' ? size : undefined); onClose() }}
                        style={{
                          background: `${accentColor}15`, border: `1px solid ${accentColor}50`,
                          borderRadius: 4, padding: '6px 12px', cursor: 'pointer',
                          fontFamily: FC, fontSize: FS_LABEL, fontWeight: 600, color: accentColor,
                          transition: '.12s', flexShrink: 0, whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${accentColor}28` }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${accentColor}15` }}
                      >
                        {isMidCombat ? '⚡ Add' : '＋ Add'}
                      </button>
                    </div>

                    {adv.type === 'minion' && (
                      <div style={{
                        marginTop: 8, paddingTop: 8, borderTop: `1px solid ${BORDER}`,
                        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Group size
                          </span>
                          <button
                            onClick={() => setSize(size - 1)}
                            disabled={size <= 1}
                            style={{
                              width: 20, height: 20, borderRadius: 3, cursor: size <= 1 ? 'not-allowed' : 'pointer',
                              background: 'transparent', border: `1px solid ${BORDER_MD}`,
                              fontFamily: FM, fontSize: FS_SM, color: size <= 1 ? TEXT_MUTED : TEXT,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >−</button>
                          <span style={{
                            fontFamily: FM, fontSize: FS_LABEL, fontWeight: 700, color: GOLD,
                            minWidth: 22, textAlign: 'center',
                          }}>{size}</span>
                          <button
                            onClick={() => setSize(size + 1)}
                            disabled={size >= 20}
                            style={{
                              width: 20, height: 20, borderRadius: 3, cursor: size >= 20 ? 'not-allowed' : 'pointer',
                              background: `${GOLD}18`, border: `1px solid ${BORDER_MD}`,
                              fontFamily: FM, fontSize: FS_SM, color: GOLD,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >+</button>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>
                            WT <span style={{ color: TEXT, fontWeight: 600 }}>{groupThreshold}</span>
                          </span>
                          <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>
                            Skill rank <span style={{ color: TEXT, fontWeight: 600 }}>{skillRank}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}

          {/* ── Vehicles tab ── */}
          {participantTab === 'vehicles' && (
            <>
              {vehiclesLoading && (
                <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED, textAlign: 'center', padding: '24px 0' }}>
                  Loading vehicles…
                </div>
              )}
              {!vehiclesLoading && filteredVehicles.length === 0 && (
                <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED, textAlign: 'center', padding: '24px 0' }}>
                  No vehicles found
                </div>
              )}
              {filteredVehicles.map(v => {
                const init = getInit(v.key)
                return (
                  <div key={v.key} style={{
                    background: RAISED_BG,
                    border: `1px solid ${BORDER}`,
                    borderLeft: `3px solid ${accentColor}60`,
                    borderRadius: 5, padding: '8px 10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 600, color: TEXT }}>{v.name}</span>
                        <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                          {v.type}
                          <span style={{ color: `${GOLD}70`, marginLeft: 8 }}>
                            Sil {v.silhouette} · Spd {v.speed} · HT {v.hullTrauma} · SS {v.systemStrain}
                          </span>
                        </div>
                      </div>

                      {isMidCombat && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>SUC</span>
                            <input
                              type="number" min={0} max={20} value={init.successes}
                              onChange={e => setInitField(v.key, 'successes', Number(e.target.value))}
                              style={{
                                width: 38, background: INPUT_BG, border: `1px solid ${BORDER_MD}`,
                                borderRadius: 3, padding: '3px 4px', color: TEXT,
                                fontFamily: FM, fontSize: FS_LABEL, textAlign: 'center', outline: 'none',
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>ADV</span>
                            <input
                              type="number" min={0} max={20} value={init.advantages}
                              onChange={e => setInitField(v.key, 'advantages', Number(e.target.value))}
                              style={{
                                width: 38, background: INPUT_BG, border: `1px solid ${BORDER_MD}`,
                                borderRadius: 3, padding: '3px 4px', color: TEXT,
                                fontFamily: FM, fontSize: FS_LABEL, textAlign: 'center', outline: 'none',
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => { onAddVehicle(v, alignment, init.successes, init.advantages); onClose() }}
                        style={{
                          background: `${accentColor}15`, border: `1px solid ${accentColor}50`,
                          borderRadius: 4, padding: '6px 12px', cursor: 'pointer',
                          fontFamily: FC, fontSize: FS_LABEL, fontWeight: 600, color: accentColor,
                          transition: '.12s', flexShrink: 0, whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${accentColor}28` }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${accentColor}15` }}
                      >
                        {isMidCombat ? '⚡ Add' : '＋ Add'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
