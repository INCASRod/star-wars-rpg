'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sortInitiative } from '@/lib/combat'
import { randomUUID } from '@/lib/utils'
import type { InitiativeSlot, CombatEncounter } from '@/lib/combat'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { Character } from '@/lib/types'
import { FS_CAPTION, FS_LABEL, FS_SM, FS_H3 } from '@/components/player-hud/design-tokens'

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
const DIE_YELLOW  = '#e8d44d'
const DIE_GREEN   = '#3cb96b'
const TEXT        = '#E8DFC8'
const TEXT_SEC    = 'rgba(232,223,200,0.6)'
const TEXT_MUTED  = 'rgba(232,223,200,0.35)'
const FC          = "'Rajdhani', sans-serif"
const FR          = "'Rajdhani', sans-serif"
const FM          = "'Rajdhani', sans-serif"
const FS_BODY     = 'var(--text-body)'   // ~15–18px — one step above FS_SM

void BG; void RAISED_BG; void INPUT_BG; void BORDER; void CHAR_WIL; void FR; void TEXT_SEC

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

interface Props {
  campaignId: string
  characters: Character[]
  roster: AdversaryInstance[]
  onClose: () => void
  onStart: (encounter: Omit<CombatEncounter, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

export function InitiativeSetupModal({ campaignId, characters, roster, onClose, onStart }: Props) {
  const [initType, setInitType] = useState<'cool' | 'vigilance'>('vigilance')

  // PC roll results
  const [pcResults, setPcResults] = useState<Record<string, { successes: number; advantages: number }>>(() =>
    Object.fromEntries(characters.map(c => [c.id, { successes: 0, advantages: 0 }]))
  )

  // NPC roll results
  const [npcResults, setNpcResults] = useState<Record<string, { successes: number; advantages: number }>>(() =>
    Object.fromEntries(roster.map(a => [a.instanceId, { successes: 0, advantages: 0 }]))
  )

  const [isStarting, setIsStarting] = useState(false)
  const [requesting, setRequesting] = useState(false)

  // ── Subscribe to player initiative results ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])
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

  const handleRequestRolls = async () => {
    setRequesting(true)
    for (const c of characters) {
      const ch = supabase.channel(`gm-notify-${c.id}`)
      await ch.subscribe()
      await ch.send({
        type: 'broadcast',
        event: 'gm-action',
        payload: { type: 'initiative-request', initiativeType: initType },
      })
      supabase.removeChannel(ch)
    }
    setRequesting(false)
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

  const numberInput = (value: number, onChange: (v: number) => void) => (
    <input
      type="number" min={0} max={20} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{
        width: 50, background: 'rgba(6,13,9,0.7)', border: '1px solid rgba(200,170,80,0.32)',
        borderRadius: 3, padding: '4px 6px', color: '#E8DFC8',
        fontFamily: FM, fontSize: FS_SM, textAlign: 'center', outline: 'none',
      }}
    />
  )

  const tableHeaderStyle: React.CSSProperties = {
    fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: 'rgba(200,170,80,0.7)',
    padding: '6px 8px', borderBottom: '1px solid rgba(200,170,80,0.18)',
    textAlign: 'left',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 740,
        background: PANEL_SOLID, border: `1px solid ${BORDER_HI}`,
        borderRadius: 6, maxHeight: '90vh', overflowY: 'auto',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.7)', marginBottom: 4 }}>
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
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.7)', marginBottom: 10 }}>
              Step 1 — Initiative Type
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${BORDER_MD}`, borderRadius: 4, overflow: 'hidden' }}>
              {([
                { key: 'cool', title: 'COOL', desc: 'Prepared · Springing an ambush', color: CHAR_WIL },
                { key: 'vigilance', title: 'VIGILANCE', desc: 'Unexpected · Being ambushed', color: GOLD },
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
                  <div style={{ fontFamily: FC, fontSize: FS_BODY, fontWeight: 700, color: initType === opt.key ? opt.color : TEXT_SEC, marginBottom: 3 }}>
                    {opt.title}
                  </div>
                  <div style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT_MUTED }}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED, marginTop: 6 }}>
              Different characters may use different skills in the same combat.
            </div>
          </div>

          {/* Step 2: PC Rolls */}
          {characters.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.7)' }}>
                  Step 2 — Player Character Rolls
                </div>
                <button
                  onClick={handleRequestRolls}
                  disabled={requesting}
                  style={{
                    background: 'rgba(200,170,80,0.12)', border: `1px solid ${BORDER_HI}`,
                    borderRadius: 4, padding: '6px 14px', cursor: requesting ? 'default' : 'pointer',
                    fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700,
                    letterSpacing: '0.1em', color: GOLD, textTransform: 'uppercase',
                    opacity: requesting ? 0.6 : 1, transition: '.15s',
                  }}
                  onMouseEnter={e => { if (!requesting) (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.22)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.12)' }}
                >
                  {requesting ? 'Sending…' : '📡 Request Player Rolls'}
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Character', 'Dice Pool', 'Successes', 'Advantages', 'Status'].map(h => (
                      <th key={h} style={tableHeaderStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {characters.map(c => {
                    const charVal   = initType === 'cool' ? c.presence : c.willpower
                    const skillRank = 0  // We don't have initiative skill ranks stored — default 0
                    const { yellow, green } = buildDicePool(charVal, skillRank)
                    const r = pcResults[c.id] ?? { successes: 0, advantages: 0 }
                    const hasResult = r.successes > 0 || r.advantages > 0
                    return (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 600, color: TEXT }}>{c.name}</div>
                          <div style={{ fontFamily: FM, fontSize: FS_CAPTION, color: TEXT_MUTED, marginTop: 2 }}>
                            {initType === 'cool' ? `Cool · Presence ${c.presence}` : `Vigilance · Willpower ${c.willpower}`}
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {Array.from({ length: yellow }).map((_, i) => <DiePip key={`y${i}`} color={DIE_YELLOW} label="Y" />)}
                            {Array.from({ length: green }).map((_, i) => <DiePip key={`g${i}`} color={DIE_GREEN} label="G" />)}
                            {yellow === 0 && green === 0 && <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: TEXT_MUTED }}>No pool</span>}
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px' }}>{numberInput(r.successes, v => updatePc(c.id, 'successes', v))}</td>
                        <td style={{ padding: '10px 8px' }}>{numberInput(r.advantages, v => updatePc(c.id, 'advantages', v))}</td>
                        <td style={{ padding: '10px 8px' }}>
                          {hasResult
                            ? <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: CHAR_AG }}>✓ Entered</span>
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

          {/* Step 3: NPC Rolls */}
          {roster.length > 0 && (
            <div>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.7)', marginBottom: 10 }}>
                Step 3 — Adversary Rolls (DM rolls physically)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Adversary', 'Type', 'Successes', 'Advantages', 'Status'].map(h => (
                      <th key={h} style={tableHeaderStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roster.map(a => {
                    const r = npcResults[a.instanceId] ?? { successes: 0, advantages: 0 }
                    const hasResult = r.successes > 0 || r.advantages > 0
                    return (
                      <tr key={a.instanceId} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 600, color: TEXT }}>{a.name}</div>
                          {a.type === 'minion' && <div style={{ fontFamily: FM, fontSize: FS_CAPTION, color: TEXT_MUTED }}>Group of {a.groupSize}</div>}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            fontFamily: FM, fontSize: FS_CAPTION,
                            color: a.type === 'nemesis' ? CHAR_BR : a.type === 'rival' ? GOLD : TEXT_MUTED,
                            border: `1px solid currentColor`, borderRadius: 2, padding: '1px 5px',
                          }}>{a.type.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '10px 8px' }}>{numberInput(r.successes, v => updateNpc(a.instanceId, 'successes', v))}</td>
                        <td style={{ padding: '10px 8px' }}>{numberInput(r.advantages, v => updateNpc(a.instanceId, 'advantages', v))}</td>
                        <td style={{ padding: '10px 8px' }}>
                          {hasResult
                            ? <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: CHAR_AG }}>✓ Entered</span>
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

          {/* Step 4: Preview */}
          <div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(200,170,80,0.7)', marginBottom: 10 }}>
              Step 4 — Initiative Order Preview
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {allSlots.map((slot, i) => (
                <div key={slot.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 12px',
                  background: 'rgba(14,26,18,0.9)', border: `1px solid ${BORDER}`,
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
                  }}>{slot.type === 'pc' ? 'PC SLOT' : 'NPC SLOT'}</span>
                  <span style={{ fontFamily: FC, fontSize: FS_BODY, color: TEXT, flex: 1 }}>{slot.name}</span>
                  <span style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED }}>
                    {slot.pending ? '⏳ awaiting…' : `${slot.successes} suc · ${slot.advantages} adv`}
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
    </div>
  )
}
