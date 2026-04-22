'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { sortInitiative } from '@/lib/combat'
import { rollPool } from '@/components/player-hud/dice-engine'
import { randomUUID } from '@/lib/utils'
import type { InitiativeSlot, CombatEncounter } from '@/lib/combat'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { Character } from '@/lib/types'
import { FS_CAPTION, FS_LABEL, FS_SM, FS_H3, FS_OVERLINE } from '@/components/player-hud/design-tokens'

// ── Design Tokens ──
const BG          = '#060D09'
const PANEL_SOLID = '#0a1510'
const RAISED_BG   = 'rgba(14,26,18,0.9)'
const INPUT_BG    = 'rgba(6,13,9,0.7)'
const GOLD        = '#C8AA50'
const BORDER      = 'rgba(200,170,80,0.18)'
const BORDER_MD   = 'rgba(200,170,80,0.32)'
const BORDER_HI   = 'rgba(200,170,80,0.55)'
const CHAR_BR     = '#e05252'
const CHAR_AG     = '#52a8e0'
const CHAR_WIL    = '#52e0a8'
const CHAR_PR     = '#e05298'
const DIE_YELLOW  = '#e8d44d'
const DIE_GREEN   = '#3cb96b'
const TEXT        = '#E8DFC8'
const TEXT_SEC    = 'rgba(232,223,200,0.6)'
const TEXT_MUTED  = 'rgba(232,223,200,0.35)'
const FC          = "'Rajdhani', sans-serif"
const FR          = "'Rajdhani', sans-serif"
const FM          = "'Rajdhani', sans-serif"
const FS_BODY     = 'var(--text-body)'

void BG; void RAISED_BG; void INPUT_BG; void BORDER; void CHAR_WIL; void FR; void TEXT_SEC; void CHAR_PR

function buildDicePool(characteristic: number, skillRank: number) {
  const proficiency = Math.min(characteristic, skillRank)
  const ability = Math.max(characteristic, skillRank) - proficiency
  return { yellow: proficiency, green: ability }
}

function DiePip({ color, label }: { color: string; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 18, height: 18, borderRadius: 3, border: `1px solid ${color}`,
      background: `${color}20`, fontFamily: FM,
      fontSize: FS_CAPTION, fontWeight: 700, color, marginRight: 2, flexShrink: 0,
    }}>{label}</span>
  )
}

function DicePoolPips({ yellow, green }: { yellow: number; green: number }) {
  if (yellow === 0 && green === 0) return <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>—</span>
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      {Array.from({ length: yellow }).map((_, i) => <DiePip key={`y${i}`} color={DIE_YELLOW} label="Y" />)}
      {Array.from({ length: green }).map((_, i) => <DiePip key={`g${i}`} color={DIE_GREEN} label="G" />)}
    </div>
  )
}

interface Props {
  campaignId: string
  characters: Character[]
  roster: AdversaryInstance[]
  sendToChar?: (charId: string, payload: Record<string, unknown>) => void
  onClose: () => void
  onStart: (encounter: Omit<CombatEncounter, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

export function InitiativeSetupModal({ campaignId, characters, roster, sendToChar, onClose, onStart }: Props) {
  const [initType, setInitType] = useState<'cool' | 'vigilance'>('vigilance')

  // PC roll results — updated via broadcast from players
  const [pcResults, setPcResults] = useState<Record<string, { successes: number; advantages: number }>>(() =>
    Object.fromEntries(characters.map(c => [c.id, { successes: 0, advantages: 0 }]))
  )

  // NPC roll results — entered/rolled by GM
  const [npcResults, setNpcResults] = useState<Record<string, { successes: number; advantages: number }>>(() =>
    Object.fromEntries(roster.map(a => [a.instanceId, { successes: 0, advantages: 0 }]))
  )

  // PC skill ranks loaded from DB
  const [charSkillRanks, setCharSkillRanks] = useState<Record<string, { cool: number; vigilance: number }>>({})

  const [isStarting, setIsStarting] = useState(false)
  const [requesting, setRequesting] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  // ── Subscribe to player initiative results ──
  useEffect(() => {
    const ch = supabase
      .channel(`initiative-${campaignId}`)
      .on('broadcast', { event: 'initiative-result' }, ({ payload }: { payload: Record<string, unknown> }) => {
        const charId = payload.characterId as string
        const suc    = payload.successes  as number
        const adv    = payload.advantages as number
        if (charId) {
          setPcResults(prev => ({ ...prev, [charId]: { successes: suc ?? 0, advantages: adv ?? 0 } }))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  // ── Load PC Cool/Vigilance skill ranks from DB ──
  useEffect(() => {
    if (characters.length === 0) return
    supabase
      .from('character_skills')
      .select('character_id, skill_key, rank')
      .in('character_id', characters.map(c => c.id))
      .in('skill_key', ['COOL', 'VIGIL'])
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, { cool: number; vigilance: number }> = {}
        for (const r of data as { character_id: string; skill_key: string; rank: number }[]) {
          if (!map[r.character_id]) map[r.character_id] = { cool: 0, vigilance: 0 }
          if (r.skill_key === 'COOL')  map[r.character_id].cool = r.rank
          if (r.skill_key === 'VIGIL') map[r.character_id].vigilance = r.rank
        }
        setCharSkillRanks(map)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters])

  // ── Request player rolls via already-subscribed GM channels ──
  const handleRequestRolls = () => {
    setRequesting(true)
    if (sendToChar) {
      for (const c of characters) {
        sendToChar(c.id, { type: 'initiative-request', initiativeType: initType })
      }
    }
    setTimeout(() => setRequesting(false), 800)
  }

  // ── Roll adversary initiative ──
  const rollAdvInitiative = (a: AdversaryInstance, skillType: 'cool' | 'vigilance') => {
    const skillName = skillType === 'cool' ? 'Cool' : 'Vigilance'
    const charVal   = skillType === 'cool' ? a.characteristics.presence : a.characteristics.willpower
    const ranks     = (a.skillRanks ?? {}) as Record<string, number>
    const skillRank = ranks[skillName] ?? 0
    const { yellow: proficiency, green: ability } = buildDicePool(charVal, skillRank)
    const result = rollPool({ proficiency, ability, boost: 0, challenge: 0, difficulty: 0, setback: 0, force: 0 })
    const suc = Math.max(0, result.net.success)
    const adv = result.net.advantage
    setNpcResults(prev => ({ ...prev, [a.instanceId]: { successes: suc, advantages: adv } }))
  }

  // Build all slots and sort them
  const allSlots = useMemo((): Array<InitiativeSlot & { pending?: boolean }> => {
    const pcSlots: Array<InitiativeSlot & { pending?: boolean }> = characters.map((c, i) => {
      const r = pcResults[c.id] ?? { successes: 0, advantages: 0 }
      return {
        id: `pc-${c.id}`,
        type: 'pc' as const,
        order: i,
        characterId: c.id,
        name: c.name,
        acted: false,
        current: false,
        successes: r.successes,
        advantages: r.advantages,
        pending: r.successes === 0 && r.advantages === 0,
      }
    })
    const npcSlots: Array<InitiativeSlot & { pending?: boolean }> = roster.map((a, i) => {
      const r = npcResults[a.instanceId] ?? { successes: 0, advantages: 0 }
      return {
        id: `npc-${a.instanceId}`,
        type: 'npc' as const,
        order: i,
        adversaryInstanceId: a.instanceId,
        name: a.name,
        acted: false,
        current: false,
        successes: r.successes,
        advantages: r.advantages,
        pending: r.successes === 0 && r.advantages === 0,
      }
    })
    return sortInitiative([...pcSlots, ...npcSlots])
  }, [characters, roster, pcResults, npcResults])

  const handleStart = async () => {
    setIsStarting(true)
    const finalSlots: InitiativeSlot[] = allSlots.map((s, i) => ({
      id: s.id,
      type: s.type,
      order: i,
      characterId: s.characterId,
      adversaryInstanceId: s.adversaryInstanceId,
      name: s.name,
      acted: false,
      current: i === 0,
      successes: s.successes,
      advantages: s.advantages,
    }))
    const encounter: Omit<CombatEncounter, 'id' | 'created_at' | 'updated_at'> = {
      campaign_id: campaignId,
      round: 1,
      is_active: true,
      current_slot_index: 0,
      initiative_type: initType,
      initiative_slots: finalSlots,
      adversaries: roster,
      vehicles: [],
      log_entries: [{
        id: randomUUID(),
        round: 1, slot: 1,
        actor: 'System',
        text: `Combat started — Round 1 · ${initType === 'cool' ? 'Cool' : 'Vigilance'} initiative`,
        dmOnly: false,
        timestamp: new Date().toISOString(),
      }],
    }
    await onStart(encounter)
    setIsStarting(false)
  }

  const updatePc = (id: string, field: 'successes' | 'advantages', value: number) => {
    setPcResults(prev => ({ ...prev, [id]: { ...prev[id], [field]: Math.max(0, value) } }))
  }
  const updateNpc = (id: string, field: 'successes' | 'advantages', value: number) => {
    setNpcResults(prev => ({ ...prev, [id]: { ...prev[id], [field]: Math.max(0, value) } }))
  }

  const numInput = (value: number, onChange: (v: number) => void) => (
    <input
      type="number" min={0} max={20} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{
        width: 48, background: INPUT_BG, border: `1px solid ${BORDER_MD}`,
        borderRadius: 3, padding: '4px 6px', color: TEXT,
        fontFamily: FM, fontSize: FS_SM, textAlign: 'center', outline: 'none',
      }}
    />
  )

  const rollBtn = (label: string, color: string, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        background: `${color}15`, border: `1px solid ${color}50`,
        borderRadius: 3, padding: '3px 8px', cursor: 'pointer',
        fontFamily: FM, fontSize: FS_OVERLINE, color, letterSpacing: '0.05em',
        transition: '.12s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${color}28` }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${color}15` }}
    >
      🎲 {label}
    </button>
  )

  const thStyle: React.CSSProperties = {
    fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: `${GOLD}b3`,
    padding: '6px 8px', borderBottom: `1px solid ${BORDER}`,
    textAlign: 'left',
  }
  const tdStyle: React.CSSProperties = { padding: '8px 8px', verticalAlign: 'middle' }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9500,
      background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 680,
        background: PANEL_SOLID, border: `1px solid ${BORDER_HI}`,
        borderRadius: 6, maxHeight: '80vh', overflowY: 'auto',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}b3`, marginBottom: 4 }}>
              Initiative Setup
            </div>
            <div style={{ fontFamily: FC, fontSize: FS_H3, fontWeight: 700, color: GOLD }}>
              BEGIN COMBAT
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: `1px solid ${BORDER_MD}`,
            borderRadius: 4, padding: '6px 12px', cursor: 'pointer',
            fontFamily: FC, fontSize: FS_BODY, color: TEXT,
          }}>✕</button>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Step 1: Combat type toggle */}
          <div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}b3`, marginBottom: 10 }}>
              Step 1 — Initiative Skill
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${BORDER_MD}`, borderRadius: 4, overflow: 'hidden' }}>
              {([
                { key: 'cool', title: 'COOL', desc: 'Prepared · Springing an ambush', sub: 'Presence + Cool ranks', color: CHAR_WIL },
                { key: 'vigilance', title: 'VIGILANCE', desc: 'Unexpected · Being ambushed', sub: 'Willpower + Vigilance ranks', color: GOLD },
              ] as const).map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setInitType(opt.key)}
                  style={{
                    padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                    background: initType === opt.key ? `${opt.color}18` : 'transparent',
                    border: 'none', borderRight: opt.key === 'cool' ? `1px solid ${BORDER_MD}` : 'none',
                    transition: '.15s',
                  }}
                >
                  <div style={{ fontFamily: FC, fontSize: FS_BODY, fontWeight: 700, color: initType === opt.key ? opt.color : TEXT_SEC, marginBottom: 2 }}>
                    {opt.title}
                  </div>
                  <div style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT_MUTED }}>{opt.desc}</div>
                  <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: opt.color, marginTop: 3, opacity: 0.75 }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: PC Rolls */}
          {characters.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}b3` }}>
                  Step 2 — Player Character Rolls
                </div>
                <button
                  onClick={handleRequestRolls}
                  disabled={requesting || !sendToChar}
                  title={!sendToChar ? 'Open CombatPanel from GM dashboard to enable player requests' : undefined}
                  style={{
                    background: 'rgba(200,170,80,0.12)', border: `1px solid ${BORDER_HI}`,
                    borderRadius: 4, padding: '6px 14px', cursor: requesting || !sendToChar ? 'default' : 'pointer',
                    fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700,
                    letterSpacing: '0.1em', color: GOLD, textTransform: 'uppercase',
                    opacity: requesting || !sendToChar ? 0.5 : 1, transition: '.15s',
                  }}
                >
                  {requesting ? 'Sending…' : '📡 Request Player Rolls'}
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Character', 'Dice Pool', 'Successes', 'Advantages', 'Status'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {characters.map(c => {
                    const charVal   = initType === 'cool' ? c.presence : c.willpower
                    const skillData = charSkillRanks[c.id] ?? { cool: 0, vigilance: 0 }
                    const skillRank = initType === 'cool' ? skillData.cool : skillData.vigilance
                    const { yellow, green } = buildDicePool(charVal, skillRank)
                    const r = pcResults[c.id] ?? { successes: 0, advantages: 0 }
                    const hasResult = r.successes > 0 || r.advantages > 0
                    return (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td style={tdStyle}>
                          <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 600, color: TEXT }}>{c.name}</div>
                          <div style={{ fontFamily: FM, fontSize: FS_CAPTION, color: TEXT_MUTED, marginTop: 2 }}>
                            {initType === 'cool'
                              ? `Cool · Presence ${charVal}${skillRank > 0 ? ` · Rank ${skillRank}` : ''}`
                              : `Vigilance · Willpower ${charVal}${skillRank > 0 ? ` · Rank ${skillRank}` : ''}`}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <DicePoolPips yellow={yellow} green={green} />
                        </td>
                        <td style={tdStyle}>{numInput(r.successes, v => updatePc(c.id, 'successes', v))}</td>
                        <td style={tdStyle}>{numInput(r.advantages, v => updatePc(c.id, 'advantages', v))}</td>
                        <td style={tdStyle}>
                          {hasResult
                            ? <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: CHAR_AG }}>✓ Received</span>
                            : <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: '#e0a852' }}>⏳ Pending</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Step 3: NPC / Adversary Rolls */}
          {roster.length > 0 && (
            <div>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}b3`, marginBottom: 10 }}>
                Step 3 — Adversary Initiative (GM Rolls)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Adversary', 'Roll', 'Cool Pool', 'Vigilance Pool', 'Successes', 'Adv', 'Status'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roster.map(a => {
                    const ranks = (a.skillRanks ?? {}) as Record<string, number>

                    const coolRank  = ranks['Cool'] ?? 0
                    const vigRank   = ranks['Vigilance'] ?? 0
                    const { yellow: coolY, green: coolG } = buildDicePool(a.characteristics.presence, coolRank)
                    const { yellow: vigY,  green: vigG  } = buildDicePool(a.characteristics.willpower, vigRank)

                    const r = npcResults[a.instanceId] ?? { successes: 0, advantages: 0 }
                    const hasResult = r.successes > 0 || r.advantages > 0
                    return (
                      <tr key={a.instanceId} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {/* Name */}
                        <td style={tdStyle}>
                          <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 600, color: TEXT }}>{a.name}</div>
                          <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginTop: 2 }}>
                            {a.type.toUpperCase()}{a.type === 'minion' ? ` ×${a.groupSize}` : ''}
                          </div>
                          <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>
                            PR {a.characteristics.presence} / WIL {a.characteristics.willpower}
                          </div>
                        </td>
                        {/* Roll buttons */}
                        <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {rollBtn('Cool', CHAR_WIL,  () => rollAdvInitiative(a, 'cool'))}
                            {rollBtn('Vig',  GOLD,      () => rollAdvInitiative(a, 'vigilance'))}
                          </div>
                        </td>
                        {/* Cool Pool */}
                        <td style={tdStyle}>
                          <DicePoolPips yellow={coolY} green={coolG} />
                          {coolRank > 0 && <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>Rank {coolRank}</div>}
                        </td>
                        {/* Vigilance Pool */}
                        <td style={tdStyle}>
                          <DicePoolPips yellow={vigY} green={vigG} />
                          {vigRank > 0 && <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>Rank {vigRank}</div>}
                        </td>
                        {/* Manual inputs */}
                        <td style={tdStyle}>{numInput(r.successes, v => updateNpc(a.instanceId, 'successes', v))}</td>
                        <td style={tdStyle}>{numInput(r.advantages, v => updateNpc(a.instanceId, 'advantages', v))}</td>
                        <td style={tdStyle}>
                          {hasResult
                            ? <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: CHAR_AG }}>✓ Set</span>
                            : <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: '#e0a852' }}>⏳</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Step 4: Initiative Order Preview */}
          <div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}b3`, marginBottom: 10 }}>
              {roster.length > 0 ? 'Step 4' : 'Step 3'} — Initiative Order Preview
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {allSlots.map((slot, i) => (
                <div key={slot.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 12px',
                  background: RAISED_BG, border: `1px solid ${BORDER}`,
                  borderRadius: 4, opacity: slot.pending ? 0.45 : 1,
                }}>
                  <span style={{
                    fontFamily: FC, fontSize: FS_H3, fontWeight: 700,
                    color: i === 0 ? GOLD : TEXT_MUTED,
                    minWidth: 24, lineHeight: 1,
                  }}>{i + 1}</span>
                  <span style={{
                    fontFamily: FM, fontSize: FS_CAPTION,
                    color: slot.type === 'pc' ? CHAR_AG : CHAR_BR,
                    border: `1px solid currentColor`, borderRadius: 2, padding: '1px 5px',
                  }}>{slot.type === 'pc' ? 'PC' : 'NPC'}</span>
                  <span style={{ fontFamily: FC, fontSize: FS_BODY, color: TEXT, flex: 1 }}>{slot.name}</span>
                  <span style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED }}>
                    {slot.pending ? '⏳ awaiting…' : `${slot.successes}s · ${slot.advantages}a`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lock & Start */}
          <button
            onClick={handleStart}
            disabled={isStarting || (characters.length === 0 && roster.length === 0)}
            style={{
              width: '100%', padding: '12px 0',
              background: '#C8AA5025', border: '1px solid #C8AA5088',
              borderRadius: 4, cursor: isStarting ? 'default' : 'pointer',
              fontFamily: FC, fontSize: FS_BODY, fontWeight: 700,
              letterSpacing: '0.15em', color: GOLD, textTransform: 'uppercase',
              opacity: isStarting ? 0.6 : 1, transition: '.15s',
            }}
          >
            {isStarting ? 'Starting…' : 'Lock Order & Start Combat →'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
