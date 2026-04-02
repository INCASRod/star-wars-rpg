'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CombatEncounter } from '@/lib/combat'
import type { Character } from '@/lib/types'
import { resolveWeapon, type WeaponRef } from '@/lib/resolve-weapon'
import { FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4, FS_H3 } from '@/components/player-hud/design-tokens'
import { DiceText } from '@/components/dice/DiceText'

// ── Design Tokens ──
const BG = '#060D09'
const PANEL_BG = 'rgba(8,16,10,0.88)'
const RAISED_BG = 'rgba(14,26,18,0.9)'
const GOLD = '#C8AA50'
const BORDER = 'rgba(200,170,80,0.18)'
const BORDER_MD = 'rgba(200,170,80,0.32)'
const CHAR_BR = '#e05252'
const CHAR_AG = '#52a8e0'
const CHAR_CUN = '#e0a852'
const CHAR_INT = '#a852e0'
const CHAR_WIL = '#52e0a8'
const CHAR_PR = '#e05298'
const TEXT = '#E8DFC8'
const TEXT_SEC = 'rgba(232,223,200,0.6)'
const TEXT_MUTED = 'rgba(232,223,200,0.35)'
const TEXTGR = "#72B421"
const FC = "'Rajdhani', sans-serif"
const FR = "'Rajdhani', sans-serif"
const FM = "'Rajdhani', sans-serif"

const panelBase: React.CSSProperties = {
  background: PANEL_BG,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  position: 'relative',
}
const raisedPanel: React.CSSProperties = {
  background: RAISED_BG,
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: `1px solid ${BORDER}`,
  borderRadius: 4,
  position: 'relative',
}

void BG; void BORDER_MD; void FR

interface Props {
  character: Character
  campaignId: string
  talents?: Array<{ name: string; activation: string; description?: string; statBonus?: { stat: string; value: number } }>
}

export function CombatTracker({ character, campaignId, talents = [] }: Props) {
  const [encounter, setEncounter] = useState<CombatEncounter | null>(null)
  const [weaponRef, setWeaponRef] = useState<Record<string, WeaponRef>>({})
  // Active character assignments keyed by default character_id
  const [slotAssignments, setSlotAssignments] = useState<Record<string, string | null>>({})
  const supabase = createClient()

  // Load weapon reference for stat lookup (weapons in adversaries.json are name-only strings)
  useEffect(() => {
    supabase
      .from('ref_weapons')
      .select('name, damage, damage_add, range_value')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, WeaponRef> = {}
        data.forEach((w: { name: string; damage: number; damage_add: number | null; range_value: string | null }) => {
          map[w.name.toLowerCase()] = w
        })
        setWeaponRef(map)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load current encounter
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('combat_encounters')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setEncounter(data[0] as CombatEncounter)
      })
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime subscription
  useEffect(() => {
    if (!campaignId) return
    const channel = supabase
      .channel(`combat-player-${campaignId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'combat_encounters',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        if (payload.new) setEncounter(payload.new as CombatEncounter)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to combat_participants for real-time slot assignment updates
  useEffect(() => {
    if (!campaignId) return
    supabase
      .from('combat_participants')
      .select('character_id, active_character_name')
      .eq('campaign_id', campaignId)
      .eq('slot_type', 'pc')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string | null> = {}
        for (const r of data as { character_id: string; active_character_name: string | null }[]) {
          map[r.character_id] = r.active_character_name
        }
        setSlotAssignments(map)
      })
    const ch = supabase
      .channel(`ct-participants-${campaignId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'combat_participants',
        filter: `campaign_id=eq.${campaignId}`,
      }, (payload) => {
        if (payload.new) {
          const r = payload.new as { character_id: string; active_character_name: string | null; slot_type: string }
          if (r.slot_type === 'pc') {
            setSlotAssignments(prev => ({ ...prev, [r.character_id]: r.active_character_name }))
          }
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!encounter || !encounter.is_active) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12, background: BG }}>
        <div style={{ fontFamily: FC, fontSize: FS_H3, color: TEXT_MUTED }}>NO ACTIVE COMBAT</div>
        <div style={{ fontFamily: FR, fontSize: FS_SM, color: TEXT_MUTED }}>Waiting for DM to start combat…</div>
      </div>
    )
  }

  const currentSlot = encounter.initiative_slots[encounter.current_slot_index]
  const isMyTurn = currentSlot?.characterId === character.id

  const revealedAdversaries = encounter.adversaries.filter(a => a.revealed)
  const publicLog = encounter.log_entries.filter(e => !e.dmOnly)

  // Talent grouping by activation
  const ACTIVATION_ORDER = ['incidental', 'out of turn', 'maneuver', 'action']
  const ACTIVATION_COLORS: Record<string, string> = {
    passive: TEXT_MUTED, incidental: GOLD, maneuver: CHAR_AG,
    action: CHAR_BR, 'out of turn': CHAR_WIL, 'incidental (oot)': CHAR_WIL,
  }
  const talentGroups = ACTIVATION_ORDER.map(act => ({
    activation: act,
    color: ACTIVATION_COLORS[act] ?? TEXT_MUTED,
    items: talents.filter(t =>
      t.activation.toLowerCase() === act ||
      (act === 'out of turn' && t.activation.toLowerCase() === 'incidental (oot)')
    ),
  })).filter(g => g.items.length > 0)

  const passiveTalents = talents.filter(t => t.activation.toLowerCase() === 'passive' && t.statBonus)

  const TypeBadge = ({ type }: { type: string }) => {
    const colors: Record<string, string> = { minion: TEXT_MUTED, rival: GOLD, nemesis: CHAR_BR, pc: CHAR_AG, npc: CHAR_BR }
    const color = colors[type] ?? TEXT_MUTED
    return (
      <span style={{ fontFamily: FM, fontSize: FS_LABEL, color, border: `1px solid ${color}50`, borderRadius: 2, padding: '1px 5px', background: `${color}15` }}>
        {type.toUpperCase()}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG, overflow: 'hidden', position: 'relative' }}>

      {/* Background texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        opacity: 0.015,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Cpath d='M0 0l20 20M20 0L0 20' stroke='%23C8AA50' stroke-width='0.5'/%3E%3C/svg%3E")`,
      }} />

      {/* ── Header Bar ── */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 1,
        background: RAISED_BG, borderBottom: `1px solid ${BORDER}`,
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {/* Character info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: TEXT }}>{character.name}</div>
          <div style={{ fontFamily: FM, fontSize: FS_CAPTION, color: TEXT_MUTED }}>{character.species_key} · {character.career_key}</div>
        </div>

        {/* Combat Active badge */}
        <div style={{
          background: `${CHAR_BR}18`, border: `1px solid ${CHAR_BR}60`,
          borderRadius: 4, padding: '5px 12px',
          display: 'flex', alignItems: 'center', gap: 6,
          animation: 'pulse-border 2s ease-in-out infinite',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: CHAR_BR, boxShadow: `0 0 6px ${CHAR_BR}` }} />
          <span style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.15em', color: CHAR_BR }}>
            COMBAT ACTIVE
          </span>
        </div>

        {/* Round */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FC, fontSize: FS_H3, fontWeight: 700, color: GOLD, lineHeight: 1 }}>{encounter.round}</div>
          <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Round</div>
        </div>
      </div>

      {/* ── Your Turn Alert ── */}
      {isMyTurn && (
        <div style={{
          flexShrink: 0, position: 'relative', zIndex: 1,
          background: `${CHAR_AG}18`, border: `1px solid ${CHAR_AG}60`,
          padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: `0 0 20px ${CHAR_AG}20`,
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: CHAR_AG,
            boxShadow: `0 0 10px ${CHAR_AG}`, flexShrink: 0,
            animation: 'pulse-dot 1s ease-in-out infinite',
          }} />
          <span style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: CHAR_AG, letterSpacing: '0.1em' }}>
            IT&apos;S YOUR TURN — {character.name} is acting now
          </span>
        </div>
      )}

      {/* ── Turn Strip ── */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 1,
        borderBottom: `1px solid ${BORDER}`, padding: '12px 16px',
        overflowX: 'auto', display: 'flex', alignItems: 'center', gap: 0,
        background: PANEL_BG,
      }}>
        {encounter.initiative_slots.map((slot, i) => {
          const isPC = slot.type === 'pc'
          const isCurrent = slot.current
          const isActed = slot.acted
          // Resolve active character for PC slots (may be reassigned by GM)
          const activeName = isPC && slot.characterId
            ? (slotAssignments[slot.characterId] ?? slot.name)
            : slot.name
          const isMe = isPC && (
            slot.characterId === character.id ||
            activeName === character.name
          )
          const adv = slot.adversaryInstanceId
            ? encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
            : null
          const isRevealed = adv?.revealed ?? true
          const displayName = !isPC && !isRevealed ? '???' : activeName
          const ringColor = isCurrent ? (isPC ? CHAR_AG : CHAR_BR) : 'transparent'

          return (
            <div key={slot.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 70, padding: '0 4px' }}>
                {/* Avatar */}
                <div style={{
                  width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                  background: isActed ? '#1a1a1a' : isPC ? `${CHAR_AG}20` : `${CHAR_BR}20`,
                  border: isCurrent
                    ? `3px solid ${ringColor}`
                    : `2px solid ${isPC ? `${CHAR_AG}40` : `${CHAR_BR}40`}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FC, fontSize: FS_H4, color: isActed ? '#555' : isPC ? CHAR_AG : CHAR_BR,
                  position: 'relative',
                  filter: isActed ? 'grayscale(100%)' : 'none',
                  boxShadow: isCurrent ? `0 0 16px ${ringColor}60` : 'none',
                  transition: '.3s',
                }}>
                  {displayName.charAt(0).toUpperCase()}
                  {/* Acted checkmark */}
                  {isActed && (
                    <div style={{
                      position: 'absolute', top: -2, right: -2,
                      width: 16, height: 16, borderRadius: '50%',
                      background: CHAR_WIL, border: `2px solid ${BG}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: FS_LABEL, color: BG, fontWeight: 700,
                    }}>✓</div>
                  )}
                </div>
                {/* "NOW" label */}
                {isCurrent && (
                  <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: CHAR_AG, letterSpacing: '0.15em', animation: 'pulse-dot 1.2s ease-in-out infinite' }}>
                    ▲ NOW
                  </div>
                )}
                {/* Name */}
                <div style={{ fontFamily: FM, fontSize: FS_LABEL, fontWeight: 700, color: isMe ? GOLD : TEXT_MUTED, textAlign: 'center', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isMe ? `YOU · ` : ''}{displayName}
                </div>
              </div>
              {/* Connector dash */}
              {i < encounter.initiative_slots.length - 1 && (
                <div style={{ width: 20, height: 1, background: BORDER_MD, flexShrink: 0 }} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* Left: Adversaries + Log */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: `1px solid ${BORDER}` }}>

          {/* Adversary Reveal Panel */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}b3`, marginBottom: 10 }}>
              Adversaries
            </div>

            {revealedAdversaries.length === 0 && (
              <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: TEXT_MUTED, fontStyle: 'italic' }}>
                No adversaries revealed yet
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {revealedAdversaries.map(adv => {
                const CHAR_COLORS = [CHAR_BR, CHAR_AG, CHAR_INT, CHAR_CUN, CHAR_WIL, CHAR_PR]
                const CHAR_KEYS = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const
                const CHAR_ABBR_LABELS = ['BR', 'AG', 'INT', 'CUN', 'WIL', 'PR']
                const TALENT_COLORS: Record<string, string> = {
                  passive: TEXT_MUTED, incidental: GOLD, maneuver: CHAR_AG,
                  action: CHAR_BR, 'out of turn': CHAR_WIL,
                }
                return (
                  <div key={adv.instanceId} style={{
                    background: PANEL_BG,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: 6,
                    position: 'relative',
                    borderTop: `2px solid ${CHAR_BR}80`,
                    borderRight: `1px solid ${BORDER}`,
                    borderBottom: `1px solid ${BORDER}`,
                    borderLeft: `1px solid ${BORDER}`,
                    padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{adv.name}</span>
                      <TypeBadge type={adv.type} />
                      {adv.type === 'minion' && (
                        <span style={{ fontFamily: FM, fontSize: FS_CAPTION, color: CHAR_BR }}>{adv.groupRemaining}/{adv.groupSize}</span>
                      )}
                    </div>

                    {/* Stats row: characteristic boxes | divider | derived stats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'nowrap' }}>

                      {/* Characteristic boxes */}
                      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                        {CHAR_KEYS.map((key, i) => (
                          <div key={key} style={{
                            background: `${CHAR_COLORS[i]}12`,
                            border: `1px solid ${CHAR_COLORS[i]}35`,
                            borderRadius: 3, padding: '3px 5px', textAlign: 'center', minWidth: 30,
                          }}>
                            <div style={{ fontFamily: FM, fontSize: FS_H4, fontWeight: 700, color: CHAR_COLORS[i], lineHeight: 1 }}>
                              {adv.characteristics[key]}
                            </div>
                            <div style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginTop: 1 }}>{CHAR_ABBR_LABELS[i]}</div>
                          </div>
                        ))}
                      </div>

                      {/* Vertical divider */}
                      <div style={{ width: 1, height: 38, background: BORDER_MD, flexShrink: 0 }} />

                      {/* Derived stats — single inline row */}
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                        {[
                          { label: 'SOAK', value: adv.soak, color: CHAR_WIL },
                          { label: 'M.DEF', value: adv.defense.melee, color: CHAR_CUN },
                          { label: 'R.DEF', value: adv.defense.ranged, color: CHAR_INT },
                        ].map(s => (
                          <div key={s.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED }}>{s.label}</div>
                          </div>
                        ))}
                        {/* Wounds — current/threshold for rival/nemesis */}
                        {adv.type !== 'minion' && (() => {
                          const cur = adv.woundsCurrent ?? 0
                          const max = adv.woundThreshold
                          const dead = cur >= max
                          const crit = cur > 0 && cur >= max * 0.75
                          const woundColor = dead ? CHAR_BR : crit ? CHAR_CUN : CHAR_BR
                          return (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, lineHeight: 1, color: dead ? CHAR_BR : TEXT }}>
                                <span style={{ color: dead ? CHAR_BR : crit ? CHAR_CUN : TEXT }}>{cur}</span>
                                <span style={{ color: TEXT_MUTED, fontSize: FS_LABEL }}>/</span>
                                <span style={{ color: woundColor }}>{max}</span>
                              </div>
                              <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: dead ? CHAR_BR : TEXT_MUTED }}>
                                {dead ? '☠ KILLED' : 'WOUNDS'}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Wound bar — rival/nemesis */}
                    {adv.type !== 'minion' && (() => {
                      const cur = adv.woundsCurrent ?? 0
                      const max = adv.woundThreshold
                      const pct = max > 0 ? Math.min(1, cur / max) : 0
                      const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_BR
                      return (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct * 100}%`, height: '100%', background: barColor,
                              borderRadius: 3, transition: 'width 300ms ease',
                              animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
                            }} />
                          </div>
                          <div style={{
                            fontFamily: "'Share Tech Mono','Courier New',monospace",
                            fontSize: 'clamp(0.62rem,0.9vw,0.72rem)', color: 'rgba(232,223,200,0.4)',
                            textAlign: 'right', marginTop: 2,
                          }}>
                            {cur} / {max} wounds
                          </div>
                        </div>
                      )
                    })()}

                    {/* Wound bar — minion group */}
                    {adv.type === 'minion' && (() => {
                      const cur          = adv.woundsCurrent ?? 0
                      const groupAlive   = adv.groupRemaining
                      const groupInitial = adv.groupSize
                      const minionWoundTotal = adv.woundThreshold * groupAlive
                      const pct = groupAlive === 0 ? 1 : (minionWoundTotal > 0 ? Math.min(1, cur / minionWoundTotal) : 0)
                      const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_BR
                      const skillRank = Math.max(0, groupAlive - 1)
                      return (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct * 100}%`, height: '100%', background: barColor,
                              borderRadius: 3, transition: 'width 300ms ease',
                              animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
                            }} />
                          </div>
                          <div style={{
                            fontFamily: "'Share Tech Mono','Courier New',monospace",
                            fontSize: 'clamp(0.62rem,0.9vw,0.72rem)', color: 'rgba(232,223,200,0.4)',
                            textAlign: 'right', marginTop: 2,
                          }}>
                            {cur} / {minionWoundTotal} wounds
                          </div>
                          <div style={{
                            fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED,
                            marginTop: 3, display: 'flex', gap: 10,
                          }}>
                            <span>
                              <span style={{ color: groupAlive === 0 ? CHAR_BR : TEXT_SEC }}>{groupAlive}</span>
                              {' remaining (of '}{groupInitial}{')'}
                            </span>
                            <span style={{ color: TEXT_MUTED }}>· Skill rank: {skillRank}</span>
                          </div>
                        </div>
                      )
                    })()}

                    {/* Talent chips */}
                    {adv.talents && adv.talents.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                        {adv.talents.map((t, i) => {
                          const color = TALENT_COLORS[(t.activation ?? 'passive').toLowerCase()] ?? TEXT_MUTED
                          return (
                            <span key={i} style={{ fontFamily: FM, fontSize: FS_LABEL, color, background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 3, padding: '2px 6px' }} title={t.description}>
                              {t.name}
                            </span>
                          )
                        })}
                      </div>
                    )}

                    {/* Weapons */}
                    {adv.weapons && adv.weapons.length > 0 && (
                      <div>
                        {adv.weapons.map((w, i) => {
                          const { dmg, range } = resolveWeapon(w, adv.characteristics.brawn, weaponRef)
                          const quals = w.qualities?.length ? ` — ${w.qualities.join(', ')}` : ''
                          return (
                            <div key={i} style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXTGR }}>
                              {w.name} — DMG {dmg} — {range}{quals}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Combat Log Feed */}
          <div style={{ flexShrink: 0, borderTop: `1px solid ${BORDER}`, maxHeight: 180, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '6px 16px 0', flexShrink: 0 }}>
              <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}b3`, marginBottom: 6 }}>
                Combat Log
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {publicLog.length === 0 && (
                <div style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT_MUTED, fontStyle: 'italic' }}>No entries yet</div>
              )}
              {publicLog.map(entry => {
                const leftColor = entry.text.toLowerCase().includes('fail') || entry.text.toLowerCase().includes('hit') ? CHAR_BR
                  : entry.text.toLowerCase().includes('success') ? CHAR_AG
                    : BORDER_MD
                return (
                  <div key={entry.id} style={{
                    borderLeft: `2px solid ${leftColor}`,
                    paddingLeft: 8, display: 'flex', gap: 8, alignItems: 'flex-start',
                  }}>
                    <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, flexShrink: 0 }}>R{entry.round}·S{entry.slot}</span>
                    <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: GOLD, flexShrink: 0, minWidth: 80 }}>{entry.actor}</span>
                    <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: TEXT_SEC }}>{entry.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Talent Quick Reference */}
        <div style={{ width: 300, flexShrink: 0, overflowY: 'auto', padding: '14px 14px' }}>
          <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}b3`, marginBottom: 10 }}>
            Talent Quick Reference
          </div>

          {/* OOT Alert */}
          <div style={{
            background: `${CHAR_WIL}12`, border: `1px solid ${CHAR_WIL}50`,
            borderRadius: 4, padding: '8px 10px', marginBottom: 12,
          }}>
            <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: CHAR_WIL, marginBottom: 3 }}>⚡ Out-of-Turn</div>
            <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: TEXT_MUTED, lineHeight: 1.4 }}>
              Out-of-Turn talents can trigger on ANY player&apos;s turn — watch for them.
            </div>
          </div>

          {/* Talent groups */}
          {talentGroups.map(group => (
            <div key={group.activation} style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.18em', textTransform: 'uppercase', color: group.color, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                {group.activation}
                <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, background: RAISED_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '0 5px' }}>
                  {group.activation === 'incidental' || group.activation === 'out of turn' ? 'No action cost' : 'Costs action/maneuver'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {group.items.map((t, i) => (
                  <div key={i} style={{
                    background: group.activation === 'incidental' ? `${GOLD}08`
                      : group.activation === 'out of turn' ? `${CHAR_WIL}08`
                        : RAISED_BG,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    borderRadius: 4,
                    position: 'relative',
                    borderTop: `1px solid ${BORDER}`,
                    borderRight: `1px solid ${BORDER}`,
                    borderBottom: `1px solid ${BORDER}`,
                    borderLeft: `2px solid ${group.color}60`,
                    padding: '8px 10px',
                  }}>
                    <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{t.name}</div>
                    {t.description && (
                      <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED, lineHeight: 1.4 }}><DiceText text={t.description} /></div>
                    )}
                    <span style={{
                      display: 'inline-block', marginTop: 4,
                      fontFamily: FM, fontSize: FS_OVERLINE, color: group.color,
                      border: `1px solid ${group.color}40`, borderRadius: 2, padding: '0 4px',
                      background: `${group.color}10`,
                    }}>{group.activation.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Passive bonuses */}
          {passiveTalents.length > 0 && (
            <div>
              <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.18em', textTransform: 'uppercase', color: TEXT_MUTED, marginBottom: 6 }}>
                Passive Bonuses
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {passiveTalents.map((t, i) => (
                  <div key={i} style={{ fontFamily: FM, fontSize: FS_CAPTION, color: TEXT_SEC, display: 'flex', gap: 6 }}>
                    <span style={{ color: GOLD }}>+{t.statBonus!.value} {t.statBonus!.stat}</span>
                    <span style={{ color: TEXT_MUTED }}>· {t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {talentGroups.length === 0 && passiveTalents.length === 0 && (
            <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: TEXT_MUTED, fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
              No active talents to display
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(224,82,82,0); }
          50% { box-shadow: 0 0 8px 2px rgba(224,82,82,0.25); }
        }
      `}</style>
    </div>
  )
}
