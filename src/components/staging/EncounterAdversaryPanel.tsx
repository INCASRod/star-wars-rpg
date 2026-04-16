'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEncounterState } from '@/hooks/useEncounterState'
import { applyDamageToAdversary } from '@/lib/damageEngine'
import { getSkillPool, rollPool } from '@/components/player-hud/dice-engine'
import { logRoll, type RollMeta } from '@/lib/logRoll'
import { resolveWeapon, type WeaponRef } from '@/lib/resolve-weapon'
import { adaptAdversaryForCombatCheck, charactersToAdversaryStubs } from '@/lib/adversaryAdapter'
import { CombatCheckOverlay } from '@/components/combat-check/CombatCheckOverlay'
import { RichText } from '@/components/ui/RichText'
import type { Adversary, AdversaryInstance, AdversaryGear } from '@/lib/adversaries'
import type { CombatEncounter, InitiativeSlot } from '@/lib/combat'
import type { Character, CharacterSkill } from '@/lib/types'
import { EMPTY_POOL } from '@/components/player-hud/design-tokens'
import { FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4 } from '@/components/player-hud/design-tokens'
import type { RollResult } from '@/components/player-hud/dice-engine'

/* ── Design tokens ────────────────────────────────────────── */
const BG        = '#060D09'
const PANEL_BG  = 'rgba(8,16,10,0.88)'
const RAISED_BG = 'rgba(14,26,18,0.9)'
const GOLD      = '#C8AA50'
const BORDER    = 'rgba(200,170,80,0.18)'
const RED       = '#e05252'
const BLUE      = '#52a8e0'
const GREEN     = '#52e08a'
const TEAL      = '#52e0a8'
const INT_C     = '#a852e0'
const CUN_C     = '#e0a852'
const WIL_C     = '#52e0a8'
const TEXTGR    = '#72B421'
const TEXT      = '#E8DFC8'
const TEXT_SEC  = 'rgba(232,223,200,0.6)'
const TEXT_MUTED = 'rgba(232,223,200,0.45)'
const FC        = "'Rajdhani', sans-serif"

/* ── Characteristic display config ───────────────────────── */
const CHAR_COLORS = [RED, BLUE, INT_C, CUN_C, WIL_C, '#e05298']
const CHAR_KEYS   = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const
const CHAR_ABBR   = ['BR', 'AG', 'INT', 'CUN', 'WIL', 'PR']
const CHAR_ABBR_MAP: Record<string, string> = {
  brawn: 'Br', agility: 'Ag', intellect: 'Int', cunning: 'Cun', willpower: 'Wil', presence: 'Pr',
}
const CHAR_COLOR_MAP: Record<string, string> = {
  brawn: RED, agility: BLUE, intellect: INT_C, cunning: CUN_C, willpower: WIL_C, presence: '#e05298',
}
const SKILL_CHAR: Record<string, keyof AdversaryInstance['characteristics']> = {
  Athletics: 'brawn', Brawl: 'brawn', Lightsaber: 'brawn', Melee: 'brawn', Resilience: 'brawn',
  Coordination: 'agility', Gunnery: 'agility', 'Piloting: Planetary': 'agility', 'Piloting: Space': 'agility',
  'Piloting (Planetary)': 'agility', 'Piloting (Space)': 'agility',
  'Ranged: Heavy': 'agility', 'Ranged: Light': 'agility', 'Ranged (Heavy)': 'agility', 'Ranged (Light)': 'agility',
  Stealth: 'agility',
  Astrogation: 'intellect', Computers: 'intellect', Mechanics: 'intellect', Medicine: 'intellect',
  'Knowledge: Core Worlds': 'intellect', 'Knowledge: Education': 'intellect', 'Knowledge: Lore': 'intellect',
  'Knowledge: Outer Rim': 'intellect', 'Knowledge: Underworld': 'intellect',
  'Knowledge: Warfare': 'intellect', 'Knowledge: Xenology': 'intellect',
  Deception: 'cunning', Perception: 'cunning', Skulduggery: 'cunning',
  Streetwise: 'cunning', Survival: 'cunning',
  Coercion: 'willpower', Discipline: 'willpower', Vigilance: 'willpower',
  Charm: 'presence', Cool: 'presence', Leadership: 'presence', Negotiation: 'presence',
}
const TALENT_ACT_COLORS: Record<string, string> = {
  passive: TEXT_MUTED, incidental: GOLD, maneuver: BLUE, action: RED, 'out of turn': WIL_C,
}
const CHAR_ABBR_FULL: Record<string, string> = {
  BR: 'Brawn', AGI: 'Agility', INT: 'Intellect', CUN: 'Cunning', WIL: 'Willpower', PR: 'Presence',
}

/* ── Props ────────────────────────────────────────────────── */
export interface EncounterAdversaryPanelProps {
  campaignId: string
  characters: Character[]
}

/**
 * EncounterAdversaryPanel — live, fully-interactive adversary detail cards
 * for the staging right drawer. All behaviour from CombatPanel's right column
 * is preserved: wound tracking, soak overrides, reveal toggle, combat check
 * buttons, squad formation, defeat logging, and map token wound_pct sync.
 */
export function EncounterAdversaryPanel({ campaignId, characters }: EncounterAdversaryPanelProps) {
  const { encounter, isLoading } = useEncounterState(campaignId)
  const supabase = createClient()

  /* ── UI state ────────────────────────────────────────────── */
  const [openCards,       setOpenCards]       = useState<Set<string>>(new Set())
  const [removeConfirm,   setRemoveConfirm]   = useState<string | null>(null)   // instanceId
  const [squadFormingFor, setSquadFormingFor] = useState<string | null>(null)
  const [squadSelections, setSquadSelections] = useState<Set<string>>(new Set())
  const [talentTooltip,   setTalentTooltip]   = useState<{
    name: string; description: string; activation?: string; rect: DOMRect
  } | null>(null)
  const [advCombatCheck, setAdvCombatCheck] = useState<{
    adv: AdversaryInstance; attackType: 'ranged' | 'melee' | null; alignment: string
  } | null>(null)

  /* ── Weapon reference (for stats display) ─────────────────── */
  const [weaponRef, setWeaponRef] = useState<Record<string, WeaponRef>>({})
  useEffect(() => {
    supabase.from('ref_weapons').select('name, damage, damage_add, range_value')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, WeaponRef> = {}
        for (const w of data as { name: string; damage: number; damage_add: number | null; range_value: string | null }[]) {
          map[w.name.toLowerCase()] = w
        }
        setWeaponRef(map)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Character skills (for CombatCheckOverlay targets) ────── */
  const [charSkillsByChar, setCharSkillsByChar] = useState<Record<string, CharacterSkill[]>>({})
  useEffect(() => {
    const ids = characters.map(c => c.id)
    if (ids.length === 0) return
    supabase.from('character_skills').select('id, character_id, skill_key, rank').in('character_id', ids)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, CharacterSkill[]> = {}
        for (const row of data as CharacterSkill[]) {
          if (!map[row.character_id]) map[row.character_id] = []
          map[row.character_id].push(row)
        }
        setCharSkillsByChar(map)
      })
  }, [characters]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Synthetic weapon refs (adversary instance weapons) ────── */
  const syntheticWeaponRef = useMemo<Record<string, import('@/lib/types').RefWeapon>>(() => {
    if (!encounter?.adversaries) return {}
    const map: Record<string, import('@/lib/types').RefWeapon> = {}
    for (const adv of encounter.adversaries) {
      adv.weapons.forEach((w, i) => {
        const key = `adv-${adv.instanceId}-w${i}`
        const { dmg, range, crit } = resolveWeapon(w, adv.characteristics.brawn, {})
        map[key] = {
          key, name: w.name, skill_key: '',
          damage: parseInt(dmg) || 0, damage_add: undefined,
          crit: crit ?? 4, range_value: `wr${range}`,
          encumbrance: 0, hard_points: 0, price: 0, rarity: 0, restricted: false,
          qualities: [],
        }
      })
    }
    return map
  }, [encounter?.adversaries])

  /* ── Defeat notification state ───────────────────────────── */
  const [defeatNotif, setDefeatNotif] = useState<{ message: string } | null>(null)

  /* ── save helper ─────────────────────────────────────────── */
  const saveEncounter = useCallback(async (partial: Partial<CombatEncounter>) => {
    if (!encounter?.id) return
    await supabase
      .from('combat_encounters')
      .update({ ...partial, updated_at: new Date().toISOString() })
      .eq('id', encounter.id)
  }, [encounter?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Adversary wound adjustment ──────────────────────────── */
  const adjustAdversaryWounds = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (!encounter) return
    const currentWounds = adv.woundsCurrent ?? 0
    const clampedDelta = delta < 0 ? Math.max(delta, -currentWounds) : delta
    if (clampedDelta === 0 && delta < 0) return

    const wasDefeated = adv.type === 'minion'
      ? adv.groupRemaining === 0
      : currentWounds >= adv.woundThreshold

    const result = applyDamageToAdversary({
      type: adv.type, name: adv.name,
      woundThreshold: adv.woundThreshold,
      groupSize: adv.groupSize, groupRemaining: adv.groupRemaining,
      woundsCurrent: currentWounds,
    }, clampedDelta)

    const updatedAdversaries = encounter.adversaries.map(a =>
      a.instanceId !== adv.instanceId ? a
        : { ...a, woundsCurrent: Math.max(0, result.woundsCurrent), groupRemaining: result.groupRemaining }
    )
    await saveEncounter({ adversaries: updatedAdversaries })

    // Sync wound_pct on map token
    const advSlot = encounter.initiative_slots.find((s: InitiativeSlot) => s.adversaryInstanceId === adv.instanceId)
    if (advSlot) {
      const pct = adv.type === 'minion'
        ? (result.groupRemaining / Math.max(1, adv.groupSize))
        : Math.min(1, result.woundsCurrent / Math.max(1, adv.woundThreshold))
      await supabase.from('map_tokens').update({ wound_pct: pct }).eq('slot_key', advSlot.id).eq('campaign_id', campaignId)
    }

    if (!wasDefeated && result.isDefeated && encounter.id) {
      const msg = result.defeatMessage ?? `${adv.name} — DEFEATED`
      setDefeatNotif({ message: msg })
      setTimeout(() => setDefeatNotif(null), 5000)
      await supabase.from('combat_log').insert({
        campaign_id: campaignId, encounter_id: encounter.id,
        participant_name: 'SYSTEM', alignment: 'system', roll_type: 'system',
        result_summary: msg, is_visible_to_players: true,
      })
      if (adv.squad_active) await handleDisbandSquad(adv.instanceId)
    }
  }, [encounter, campaignId, saveEncounter]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Adversary strain adjustment ─────────────────────────── */
  const adjustAdversaryStrain = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (!encounter || adv.type !== 'nemesis') return
    const strainMax = adv.strainThreshold ?? 0
    const current   = adv.strainCurrent ?? 0
    const next      = Math.max(0, Math.min(strainMax > 0 ? strainMax : 999, current + delta))
    const updated   = encounter.adversaries.map(a =>
      a.instanceId !== adv.instanceId ? a : { ...a, strainCurrent: next }
    )
    await saveEncounter({ adversaries: updated })
  }, [encounter, saveEncounter])

  /* ── Toggle reveal ───────────────────────────────────────── */
  const toggleRevealed = useCallback(async (instanceId: string) => {
    if (!encounter) return
    const updated = encounter.adversaries.map(a =>
      a.instanceId !== instanceId ? a : { ...a, revealed: !a.revealed }
    )
    await saveEncounter({ adversaries: updated })
  }, [encounter, saveEncounter])

  /* ── Update soak override ────────────────────────────────── */
  const updateAdversarySoak = useCallback(async (instanceId: string, newSoak: number) => {
    if (!encounter) return
    const updated = encounter.adversaries.map(a =>
      a.instanceId !== instanceId ? a : { ...a, soak: Math.max(0, newSoak) }
    )
    await saveEncounter({ adversaries: updated })
  }, [encounter, saveEncounter])

  /* ── Remove adversary ────────────────────────────────────── */
  const removeAdversary = useCallback(async (instanceId: string) => {
    if (!encounter) return
    const adv = encounter.adversaries.find(a => a.instanceId === instanceId)
    const updatedAdversaries = encounter.adversaries.filter(a => a.instanceId !== instanceId)
    const updatedSlots = encounter.initiative_slots.filter(
      (s: InitiativeSlot) => s.adversaryInstanceId !== instanceId
    )
    await saveEncounter({ adversaries: updatedAdversaries, initiative_slots: updatedSlots })
    if (adv && encounter.id) {
      await supabase.from('combat_log').insert({
        campaign_id: campaignId, encounter_id: encounter.id,
        participant_name: 'System', alignment: 'system', roll_type: 'system',
        result_summary: `${adv.name} removed from encounter`, is_visible_to_players: false,
      })
    }
    setRemoveConfirm(null)
  }, [encounter, campaignId, saveEncounter]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Squad formation ─────────────────────────────────────── */
  const handleFormSquad = useCallback(async (adv: AdversaryInstance) => {
    if (!encounter) return
    const presence   = adv.characteristics.presence
    const leaderRank = adv.skillRanks['Leadership'] ?? 0
    const base   = getSkillPool(presence, leaderRank)
    const pool   = { ...EMPTY_POOL, ...base, difficulty: 1 }
    const result: RollResult = rollPool(pool)
    const successes = result.net.success ?? 0

    void logRoll({
      campaignId, characterId: null, characterName: adv.name,
      label: `${adv.name} — Leadership (Form Squad)`,
      pool, result, isDM: true, hidden: !adv.revealed,
      meta: { type: 'squad_formation' } as RollMeta,
    })

    if (encounter.id) {
      const summary = successes > 0
        ? `${adv.name} rallies nearby minions into a squad! (${successes} success${successes !== 1 ? 'es' : ''})`
        : `${adv.name} fails to organize a squad. (0 net successes)`
      await supabase.from('combat_log').insert({
        campaign_id: campaignId, encounter_id: encounter.id,
        participant_name: adv.name, alignment: 'enemy', roll_type: 'Leadership',
        result_summary: summary, is_visible_to_players: false,
      })
    }
    if (successes > 0) {
      setSquadFormingFor(adv.instanceId)
      setSquadSelections(new Set())
    }
  }, [encounter, campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirmSquad = useCallback(async (leaderInstanceId: string) => {
    if (!encounter) return
    const selections = [...squadSelections]
    if (selections.length === 0) return
    const refs = selections.map(iid => {
      const m = encounter.adversaries.find(a => a.instanceId === iid)
      return { instanceId: iid, count: m?.groupRemaining ?? 1 }
    })
    const totalMinions = refs.reduce((s, r) => s + r.count, 0)
    const updatedAdversaries = encounter.adversaries.map(a =>
      a.instanceId === leaderInstanceId
        ? { ...a, squad_active: true, squad_minion_refs: refs, squad_total_minions: totalMinions }
        : a
    )
    const updatedSlots = encounter.initiative_slots.map((s: InitiativeSlot) =>
      selections.includes(s.adversaryInstanceId ?? '')
        ? { ...s, squad_suppressed: true, suppressed_by: leaderInstanceId }
        : s
    )
    await saveEncounter({ adversaries: updatedAdversaries, initiative_slots: updatedSlots })
    setSquadFormingFor(null)
    setSquadSelections(new Set())
  }, [encounter, squadSelections, saveEncounter])

  const handleDisbandSquad = useCallback(async (leaderInstanceId: string) => {
    if (!encounter) return
    const updatedAdversaries = encounter.adversaries.map(a =>
      a.instanceId !== leaderInstanceId ? a
        : { ...a, squad_active: false, squad_minion_refs: [], squad_total_minions: 0 }
    )
    const updatedSlots = encounter.initiative_slots.map((s: InitiativeSlot) =>
      s.suppressed_by === leaderInstanceId
        ? { ...s, squad_suppressed: false, suppressed_by: undefined }
        : s
    )
    const leaderAdv = encounter.adversaries.find(a => a.instanceId === leaderInstanceId)
    if (leaderAdv && encounter.id) {
      await supabase.from('combat_log').insert({
        campaign_id: campaignId, encounter_id: encounter.id,
        participant_name: leaderAdv.name, alignment: 'enemy', roll_type: 'system',
        result_summary: `${leaderAdv.name}'s squad disbanded — minions act independently again.`,
        is_visible_to_players: false,
      })
    }
    await saveEncounter({ adversaries: updatedAdversaries, initiative_slots: updatedSlots })
  }, [encounter, campaignId, saveEncounter]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Soak gear parser ────────────────────────────────────── */
  function parseSoakFromGear(gear: AdversaryGear[]): { total: number; sources: string[] } {
    let total = 0; const sources: string[] = []
    for (const item of gear) {
      const text = `${item.name} ${item.description ?? ''}`
      const m = text.match(/\(\+(\d+)\s*soak\)/i)
      if (m) {
        const bonus = parseInt(m[1]); total += bonus
        sources.push(`${item.name.replace(/\s*\(\+\d+\s*soak\)/i, '').trim()} +${bonus}`)
      }
    }
    return { total, sources }
  }

  /* ── Parse talent dice hints ─────────────────────────────── */
  function parseTalentDice(desc = '') {
    const d = desc.toLowerCase()
    const chips: { label: string; color: string; title: string }[] = []
    if ((d.match(/add\w* (?:a |one |two |an? )?boost|boost die|boost dice/g) ?? []).length > 0)
      chips.push({ label: '+□', color: '#70C8E8', title: 'Adds Boost die' })
    if ((d.match(/remov\w* (?:a |one |two |an? )?setback|cancel\w* (?:a |)?setback/g) ?? []).length > 0)
      chips.push({ label: '−■', color: '#4EC87A', title: 'Removes Setback die' })
    if ((d.match(/upgrad\w* (?:the |a |an? )?(?:abilit|skill|check|roll)/g) ?? []).length > 0)
      chips.push({ label: '↑', color: '#FFD700', title: 'Upgrades ability to proficiency' })
    if ((d.match(/add\w* (?:a |one |two |an? )?setback|impose\w* (?:a |one |two |an? )?setback/g) ?? []).length > 0)
      chips.push({ label: '+■', color: '#909090', title: 'Adds Setback die' })
    return chips
  }

  /* ── Empty / loading ─────────────────────────────────────── */
  if (isLoading) {
    return <div style={{ padding: '32px 16px', textAlign: 'center', fontFamily: FC, fontSize: FS_SM, color: TEXT_MUTED }}>Loading…</div>
  }

  const adversaries = encounter?.adversaries ?? []

  if (!encounter || adversaries.length === 0) {
    return (
      <div style={{ padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 28, opacity: 0.3 }}>◆</div>
        <div style={{ fontFamily: FC, fontSize: FS_SM, color: TEXT_MUTED, textAlign: 'center' }}>
          No adversaries in this encounter.
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* ── Defeat notification toast ─────────────────────────── */}
      {defeatNotif && (
        <div style={{
          background: `${RED}18`, border: `1px solid ${RED}50`, borderRadius: 5,
          padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>☠</span>
          <span style={{ fontFamily: FC, fontSize: FS_LABEL, color: RED, fontWeight: 700 }}>
            {defeatNotif.message}
          </span>
        </div>
      )}

      {adversaries.map(adv => {
        const isOpen = openCards.has(adv.instanceId)
        const toggleOpen = () => setOpenCards(prev => {
          const next = new Set(prev)
          isOpen ? next.delete(adv.instanceId) : next.add(adv.instanceId)
          return next
        })

        const advSlot = encounter.initiative_slots.find((s: InitiativeSlot) => s.adversaryInstanceId === adv.instanceId)
        const advAlignment = advSlot?.alignment ?? 'enemy'
        const accent = advAlignment === 'allied_npc' ? GREEN : RED

        const groupTotal   = adv.type === 'minion' ? adv.woundThreshold * adv.groupSize : adv.woundThreshold
        const isDefeated   = (adv.woundsCurrent ?? 0) >= groupTotal && groupTotal > 0

        const availableMinions = encounter.adversaries.filter(a =>
          a.type === 'minion' && a.groupRemaining > 0 && !a.squad_active
        )

        return (
          <div key={adv.instanceId} style={{
            background: isDefeated ? 'rgba(232,223,200,0.02)' : PANEL_BG,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 6, position: 'relative',
            borderTop: `2px solid ${isDefeated ? 'rgba(232,223,200,0.1)' : `${accent}80`}`,
            borderRight: `1px solid ${BORDER}`,
            borderBottom: `1px solid ${BORDER}`,
            borderLeft: `1px solid ${BORDER}`,
            opacity: isDefeated ? 0.45 : 1,
            transition: 'opacity 400ms',
          }}>

            {/* ── Header ──────────────────────────────────────── */}
            <div
              style={{ padding: '10px 12px 8px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              onClick={toggleOpen}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT,
                    textDecoration: isDefeated ? 'line-through' : 'none',
                  }}>{adv.name}</span>
                  {isDefeated ? (
                    <span style={{
                      fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em',
                      color: 'rgba(232,223,200,0.25)', border: '1px solid rgba(232,223,200,0.15)',
                      borderRadius: 3, padding: '1px 5px', background: 'rgba(232,223,200,0.05)',
                    }}>DEFEATED</span>
                  ) : (
                    <TypeBadge type={adv.type} />
                  )}
                  {adv.type === 'minion' && !isDefeated && (
                    <span style={{
                      fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em',
                      color: accent, border: `1px solid ${accent}50`, borderRadius: 3,
                      padding: '1px 5px', background: `${accent}10`,
                    }}>MINION GROUP</span>
                  )}
                </div>
              </div>
              <span style={{ color: TEXT_MUTED, fontSize: FS_SM }}>{isOpen ? '▲' : '▼'}</span>

              {/* Remove button */}
              {removeConfirm === adv.instanceId ? (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(6,13,9,0.97)', border: '1px solid rgba(224,80,80,0.4)',
                    borderRadius: 4, padding: '3px 8px', flexShrink: 0,
                  }}
                >
                  <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: 'rgba(224,80,80,0.85)', whiteSpace: 'nowrap' }}>Remove?</span>
                  <button onClick={() => setRemoveConfirm(null)}
                    style={smallCtrlBtn}>Cancel</button>
                  <button onClick={() => void removeAdversary(adv.instanceId)}
                    style={{ ...smallCtrlBtn, color: RED, borderColor: `${RED}50` }}>Remove</button>
                </div>
              ) : (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setRemoveConfirm(adv.instanceId)
                    setTimeout(() => setRemoveConfirm(p => p === adv.instanceId ? null : p), 5000)
                  }}
                  title={`Remove ${adv.name}`}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
                    color: 'rgba(244,67,54,0.35)', fontSize: 15, lineHeight: 1,
                    padding: '2px 5px', borderRadius: 3, transition: 'color .15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(244,67,54,0.85)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(244,67,54,0.35)' }}
                >×</button>
              )}
            </div>

            {/* ── Wound tracker (always visible) ──────────────── */}
            <div style={{ padding: '0 12px 10px' }}>
              <AdversaryWoundTracker
                adv={adv} accentColor={accent}
                onAdjust={delta => void adjustAdversaryWounds(adv, delta)}
                onAdjustStrain={delta => void adjustAdversaryStrain(adv, delta)}
              />
            </div>

            {/* ── Expanded body ────────────────────────────────── */}
            {isOpen && (
              <div style={{ padding: '0 12px 12px', borderTop: `1px solid ${BORDER}` }}>

                {/* Characteristics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4, marginTop: 10, marginBottom: 10 }}>
                  {CHAR_KEYS.map((key, i) => (
                    <div key={key} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: CHAR_COLORS[i], lineHeight: 1 }}>
                        {adv.characteristics[key]}
                      </div>
                      <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginTop: 2 }}>{CHAR_ABBR[i]}</div>
                    </div>
                  ))}
                </div>

                {/* Derived stats + soak override */}
                {(() => {
                  const gearSoak = parseSoakFromGear(adv.gear ?? [])
                  const expectedSoak = adv.characteristics.brawn + gearSoak.total
                  return (
                    <>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: gearSoak.total > 0 ? 4 : 10, alignItems: 'flex-start' }}>
                        {/* Soak — editable */}
                        <div style={{ background: `${WIL_C}15`, border: `1px solid ${WIL_C}40`, borderRadius: 3, padding: '3px 5px', textAlign: 'center', minWidth: 52 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                            <button onClick={e => { e.stopPropagation(); void updateAdversarySoak(adv.instanceId, adv.soak - 1) }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontFamily: FC, fontSize: FS_LABEL, color: `${WIL_C}80`, lineHeight: 1 }}>−</button>
                            <span style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: WIL_C, lineHeight: 1 }}>{adv.soak}</span>
                            <button onClick={e => { e.stopPropagation(); void updateAdversarySoak(adv.instanceId, adv.soak + 1) }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontFamily: FC, fontSize: FS_LABEL, color: `${WIL_C}80`, lineHeight: 1 }}>+</button>
                          </div>
                          <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>Soak</div>
                        </div>
                        {/* Static stats */}
                        {[
                          { label: 'WT',    value: adv.woundThreshold,  color: RED },
                          ...(adv.strainThreshold !== undefined ? [{ label: 'ST', value: adv.strainThreshold, color: BLUE }] : []),
                          { label: 'M.Def', value: adv.defense.melee,   color: CUN_C },
                          { label: 'R.Def', value: adv.defense.ranged,  color: INT_C },
                        ].map(s => (
                          <div key={s.label} style={{ background: `${s.color}15`, border: `1px solid ${s.color}40`, borderRadius: 3, padding: '3px 7px', textAlign: 'center' }}>
                            <div style={{ fontFamily: FC, fontSize: FS_H4, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      {/* Soak breakdown */}
                      {gearSoak.total > 0 && (
                        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>
                            Soak: Br {adv.characteristics.brawn} + {gearSoak.sources.join(' + ')} = {expectedSoak}
                          </span>
                          {adv.soak !== expectedSoak && (
                            <button
                              onClick={e => { e.stopPropagation(); void updateAdversarySoak(adv.instanceId, expectedSoak) }}
                              style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}50`, borderRadius: 3, padding: '1px 6px', cursor: 'pointer', fontFamily: FC, fontSize: FS_OVERLINE, color: GOLD }}
                            >Apply</button>
                          )}
                        </div>
                      )}
                    </>
                  )
                })()}

                {/* Skills */}
                {Object.keys(adv.skillRanks ?? {}).length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${GOLD}90`, marginBottom: 6 }}>Skills</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 24px auto', gap: '2px 6px', marginBottom: 3 }}>
                      {['Skill', 'Char', 'Rnk', 'Roll'].map(h => (
                        <div key={h} style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT_MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</div>
                      ))}
                    </div>
                    {Object.entries(adv.skillRanks).map(([skill, rank]) => {
                      let charKey = SKILL_CHAR[skill]
                      if (skill === 'Lightsaber') {
                        const ovr = adv.characteristicOverrides?.['Lightsaber']
                        const MAP: Record<string, keyof AdversaryInstance['characteristics']> = {
                          BR: 'brawn', AGI: 'agility', INT: 'intellect', CUN: 'cunning', WIL: 'willpower', PR: 'presence',
                        }
                        charKey = ovr ? MAP[ovr] : 'brawn'
                      }
                      const charVal = charKey ? adv.characteristics[charKey] : 0
                      const prof = Math.min(charVal, rank)
                      const abil = Math.max(charVal, rank) - prof
                      const charColor = charKey ? CHAR_COLOR_MAP[charKey] : TEXT_MUTED
                      const overrideKey = skill === 'Lightsaber' ? adv.characteristicOverrides?.['Lightsaber'] : undefined
                      const displaySkillName = skill === 'Lightsaber'
                        ? `Lightsaber (${CHAR_ABBR_FULL[overrideKey ?? 'BR'] ?? 'Brawn'})`
                        : skill
                      return (
                        <div key={skill} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 24px auto', gap: '2px 6px', alignItems: 'center', padding: '3px 0', borderBottom: `1px solid ${BORDER}` }}>
                          <span style={{ fontFamily: FC, fontSize: FS_LABEL, color: TEXT_SEC }}>{displaySkillName}</span>
                          <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: charColor, textAlign: 'center' }}>
                            {charKey ? CHAR_ABBR_MAP[charKey] : '—'}
                          </span>
                          <span style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: TEXTGR, textAlign: 'center' }}>{rank}</span>
                          <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            {Array.from({ length: prof }).map((_, i) => (
                              <div key={`p${i}`} style={{ width: 11, height: 11, borderRadius: '50%', background: '#FFE066', border: '1px solid #C8AA50', flexShrink: 0 }} title="Proficiency" />
                            ))}
                            {Array.from({ length: abil }).map((_, i) => (
                              <div key={`a${i}`} style={{ width: 11, height: 11, borderRadius: '50%', background: '#4EC87A', border: '1px solid #2fa85a', flexShrink: 0 }} title="Ability" />
                            ))}
                            {prof === 0 && abil === 0 && <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT_MUTED }}>—</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Talents */}
                {adv.talents && adv.talents.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${GOLD}90`, marginBottom: 5 }}>Talents</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {adv.talents.map((t, i) => {
                        const actKey = (t.activation ?? 'passive').toLowerCase()
                        const color = TALENT_ACT_COLORS[actKey] ?? TEXT_MUTED
                        const diceChips = parseTalentDice(t.description)
                        return (
                          <div key={i}
                            style={{ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 3, padding: '3px 7px', display: 'flex', alignItems: 'center', gap: 5, cursor: t.description ? 'help' : 'default' }}
                            onMouseEnter={e => { if (t.description) setTalentTooltip({ name: t.name, description: t.description, activation: t.activation, rect: (e.currentTarget as HTMLElement).getBoundingClientRect() }) }}
                            onMouseLeave={() => setTalentTooltip(null)}
                          >
                            <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color }}>{t.name}</span>
                            {diceChips.map((chip, ci) => (
                              <span key={ci} title={chip.title} style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, color: chip.color, background: `${chip.color}18`, border: `1px solid ${chip.color}50`, borderRadius: 2, padding: '0 3px' }}>{chip.label}</span>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Abilities */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: INT_C, marginBottom: 6 }}>Abilities</div>
                  <div style={{ background: `${INT_C}0c`, border: `1px solid ${INT_C}30`, borderRadius: 4, padding: '7px 9px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {adv.abilities && adv.abilities.length > 0
                      ? adv.abilities.map((ab, i) => (
                        <div key={i}>
                          <span style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: INT_C }}>{ab.name}{ab.description ? ': ' : ''}</span>
                          {ab.description && <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT_SEC }}><RichText text={ab.description} /></span>}
                        </div>
                      ))
                      : <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT_MUTED, fontStyle: 'italic' }}>No special abilities</div>
                    }
                  </div>
                </div>

                {/* Gear */}
                {adv.gear && adv.gear.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${GOLD}90`, marginBottom: 5 }}>Gear</div>
                    {adv.gear.map((item, i) => {
                      const label = typeof item === 'string' ? item
                        : [item.name, item.encumbrance ? `Enc ${item.encumbrance}` : ''].filter(Boolean).join(' — ')
                      const notes = typeof item === 'string' ? '' : item.description
                      return (
                        <div key={i} style={{ fontFamily: FC, fontSize: FS_LABEL, color: TEXT_SEC }}>
                          · {label}{notes ? <span> — <RichText text={notes} /></span> : null}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Weapons */}
                {adv.weapons && adv.weapons.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${GOLD}90`, marginBottom: 5 }}>Weapons</div>
                    {adv.weapons.map((w, i) => {
                      const { dmg, range, crit } = resolveWeapon(w, adv.characteristics.brawn, weaponRef)
                      const quals = w.qualities && w.qualities.length > 0 ? w.qualities.join(', ') : ''
                      return (
                        <div key={i} style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 500, color: TEXTGR, marginBottom: 2 }}>
                          {w.name} — DMG {dmg}{crit !== undefined ? ` — Crit ${crit}` : ''} — {range}{quals ? <span> — <RichText text={quals} /></span> : null}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Reveal toggle ─────────────────────────────────── */}
            {isOpen && (
              <div style={{ borderTop: `1px solid ${BORDER}`, padding: '7px 12px', background: adv.revealed ? `${BLUE}0a` : RAISED_BG }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox" checked={adv.revealed}
                    onChange={() => void toggleRevealed(adv.instanceId)}
                    style={{ accentColor: BLUE, width: 14, height: 14 }}
                  />
                  <span style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 600, color: adv.revealed ? BLUE : TEXT_MUTED, letterSpacing: '0.08em' }}>
                    {adv.revealed ? '✓ Revealed to Players' : 'Reveal to Players'}
                  </span>
                </label>
              </div>
            )}

            {/* ── Combat check buttons ──────────────────────────── */}
            {isOpen && adv.weapons && adv.weapons.length > 0 && (
              <div style={{ borderTop: `1px solid ${BORDER}`, padding: '7px 12px', display: 'flex', gap: 6 }}>
                {(['melee', 'ranged'] as const).map(type => (
                  <button key={type}
                    onClick={() => setAdvCombatCheck({ adv, attackType: type, alignment: advAlignment })}
                    style={{
                      flex: 1, padding: '5px 0',
                      background: `${accent}15`, border: `1px solid ${accent}50`,
                      borderRadius: 4, cursor: 'pointer',
                      fontFamily: FC, fontSize: FS_LABEL, fontWeight: 600, color: accent, letterSpacing: '0.05em',
                    }}
                  >
                    {type === 'melee' ? '⚔ Melee' : '⊕ Ranged'}
                  </button>
                ))}
              </div>
            )}

            {/* ── Squad formation ───────────────────────────────── */}
            {isOpen && adv.type !== 'minion' && (() => {
              const CAP = 11

              if (adv.squad_active) {
                const liveCount = (adv.squad_minion_refs ?? []).reduce((sum, ref) => {
                  const m = encounter.adversaries.find(a => a.instanceId === ref.instanceId)
                  return sum + (m?.groupRemaining ?? 0)
                }, 0)
                return (
                  <div style={{ borderTop: `1px solid ${GOLD}40`, padding: '8px 12px', background: `${GOLD}09` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(9px,1vw,11px)', fontWeight: 700, letterSpacing: '0.18em', color: GOLD, textTransform: 'uppercase' }}>
                        Squad Active
                      </span>
                      <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT_SEC }}>{liveCount}/{adv.squad_total_minions ?? 0} minions</span>
                      <button
                        onClick={() => void handleDisbandSquad(adv.instanceId)}
                        style={{ marginLeft: 'auto', background: `${RED}15`, border: `1px solid ${RED}50`, borderRadius: 3, padding: '2px 8px', cursor: 'pointer', fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 600, color: RED }}
                      >Disband</button>
                    </div>
                    {(adv.squad_minion_refs ?? []).map(ref => {
                      const m = encounter.adversaries.find(a => a.instanceId === ref.instanceId)
                      if (!m) return null
                      return (
                        <div key={ref.instanceId} style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT_MUTED, display: 'flex', gap: 6 }}>
                          <span>{m.name}</span>
                          <span style={{ color: m.groupRemaining > 0 ? TEXT_SEC : RED }}>{m.groupRemaining}/{ref.count}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              }

              if (squadFormingFor === adv.instanceId) {
                const selectedMinions = [...squadSelections]
                const selectedTotal = selectedMinions.reduce((sum, iid) => {
                  const m = encounter.adversaries.find(a => a.instanceId === iid)
                  return sum + (m?.groupRemaining ?? 0)
                }, 0)
                return (
                  <div style={{ borderTop: `1px solid ${GOLD}40`, padding: '8px 12px', background: `${GOLD}07` }}>
                    <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 600, color: GOLD, marginBottom: 6, letterSpacing: '0.06em' }}>
                      Select minion groups for squad (max {CAP} total):
                    </div>
                    {availableMinions.length === 0 && (
                      <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT_MUTED, marginBottom: 6 }}>No available minion groups</div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                      {availableMinions.map(m => {
                        const isSelected = squadSelections.has(m.instanceId)
                        const wouldExceed = !isSelected && selectedTotal + m.groupRemaining > CAP
                        return (
                          <label key={m.instanceId} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: wouldExceed ? 'not-allowed' : 'pointer', opacity: wouldExceed ? 0.45 : 1 }}>
                            <input type="checkbox" checked={isSelected} disabled={wouldExceed}
                              onChange={e => {
                                setSquadSelections(prev => {
                                  const next = new Set(prev)
                                  e.target.checked ? next.add(m.instanceId) : next.delete(m.instanceId)
                                  return next
                                })
                              }}
                              style={{ accentColor: GOLD, width: 13, height: 13 }}
                            />
                            <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT }}>{m.name}</span>
                            <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT_MUTED }}>({m.groupRemaining} minions)</span>
                          </label>
                        )
                      })}
                    </div>
                    {selectedTotal > 0 && (
                      <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT_SEC, marginBottom: 6 }}>
                        {selectedTotal} minions selected{selectedTotal > CAP && <span style={{ color: RED }}> — exceeds cap of {CAP}</span>}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => void handleConfirmSquad(adv.instanceId)}
                        disabled={selectedTotal === 0 || selectedTotal > CAP}
                        style={{
                          flex: 1, padding: '4px 0',
                          background: selectedTotal > 0 && selectedTotal <= CAP ? `${GOLD}20` : 'transparent',
                          border: `1px solid ${selectedTotal > 0 && selectedTotal <= CAP ? GOLD : BORDER}`,
                          borderRadius: 3, cursor: selectedTotal > 0 && selectedTotal <= CAP ? 'pointer' : 'not-allowed',
                          fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 600,
                          color: selectedTotal > 0 && selectedTotal <= CAP ? GOLD : TEXT_MUTED,
                        }}
                      >Confirm Squad</button>
                      <button
                        onClick={() => { setSquadFormingFor(null); setSquadSelections(new Set()) }}
                        style={{ padding: '4px 10px', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 3, cursor: 'pointer', fontFamily: FC, fontSize: FS_CAPTION, color: TEXT_MUTED }}
                      >Cancel</button>
                    </div>
                  </div>
                )
              }

              if (availableMinions.length === 0) return null
              return (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: '7px 12px' }}>
                  <button
                    onClick={() => void handleFormSquad(adv)}
                    style={{ width: '100%', padding: '5px 0', background: `${GOLD}10`, border: `1px solid ${GOLD}40`, borderRadius: 4, cursor: 'pointer', fontFamily: FC, fontSize: FS_LABEL, fontWeight: 600, color: GOLD, letterSpacing: '0.05em' }}
                  >Form Squad</button>
                </div>
              )
            })()}
          </div>
        )
      })}

      {/* ── Talent tooltip portal ─────────────────────────────── */}
      {talentTooltip && (
        <div style={{
          position: 'fixed',
          top: talentTooltip.rect.bottom + 6,
          left: Math.min(talentTooltip.rect.left, window.innerWidth - 280),
          zIndex: 9100,
          background: 'rgba(6,10,8,0.97)',
          border: '1px solid rgba(200,170,80,0.35)',
          borderRadius: 6, padding: '8px 12px',
          maxWidth: 260,
          boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: GOLD, marginBottom: 4 }}>
            {talentTooltip.name}
            {talentTooltip.activation && (
              <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginLeft: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ({talentTooltip.activation})
              </span>
            )}
          </div>
          <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT_SEC, lineHeight: 1.5 }}>
            <RichText text={talentTooltip.description} />
          </div>
        </div>
      )}

      {/* ── Combat check overlay ──────────────────────────────── */}
      {advCombatCheck && (() => {
        const { adv, attackType, alignment } = advCombatCheck
        const adapted = adaptAdversaryForCombatCheck(adv, campaignId)
        const pcStubs = charactersToAdversaryStubs(characters, charSkillsByChar)
        const alliedStubs = (encounter?.adversaries ?? []).filter(a => {
          const s = encounter?.initiative_slots.find((sl: InitiativeSlot) => sl.adversaryInstanceId === a.instanceId)
          return s?.alignment === 'allied_npc' && a.instanceId !== adv.instanceId
        })
        const gmTargets = [...pcStubs, ...alliedStubs] as AdversaryInstance[]

        function handleAdvRoll(result: RollResult, label?: string, pool?: Record<string, number>, meta?: RollMeta) {
          logRoll({
            campaignId, characterId: null, characterName: adv.name,
            label, pool: (pool ?? {}) as Parameters<typeof logRoll>[0]['pool'],
            result, isDM: true, hidden: !adv.revealed,
            meta: { ...meta, alignment },
          })
        }

        return (
          <CombatCheckOverlay
            open={true}
            initialAttackType={attackType}
            onClose={() => setAdvCombatCheck(null)}
            character={adapted.character}
            weapons={adapted.charWeapons}
            charSkills={adapted.charSkills}
            refWeaponMap={adapted.refWeaponMap}
            refSkillMap={adapted.refSkillMap}
            refWeaponQualityMap={{}}
            skillModifiers={{}}
            campaignId={campaignId}
            characterId={adv.instanceId}
            onRoll={handleAdvRoll}
            isGmMode={true}
            gmTargets={gmTargets}
            gmAlignment={alignment}
            gmHiddenFromPlayers={!adv.revealed}
          />
        )
      })()}
    </div>
  )
}

/* ── AdversaryWoundTracker (mirrored from CombatPanel) ────── */
function AdversaryWoundTracker({
  adv, accentColor, onAdjust, onAdjustStrain,
}: {
  adv: AdversaryInstance
  accentColor: string
  onAdjust: (delta: number) => void
  onAdjustStrain?: (delta: number) => void
}) {
  const wounds    = adv.woundsCurrent ?? 0
  const isMinion  = adv.type === 'minion'
  const maxWounds = isMinion ? adv.woundThreshold * adv.groupSize : adv.woundThreshold
  const pct       = maxWounds > 0 ? Math.min(1, wounds / maxWounds) : 0

  const AMBER  = '#FF9800'
  const PURPLE = '#9C27B0'
  const barColor = pct >= 1 ? PURPLE : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? AMBER : accentColor

  const groupAlive = isMinion
    ? Math.min(adv.groupSize, Math.max(0, adv.groupSize - Math.floor(wounds / adv.woundThreshold)))
    : null
  const skillRank = groupAlive !== null ? Math.max(0, groupAlive - 1) : null

  const btnBase: React.CSSProperties = {
    width: 36, height: 28, borderRadius: 5,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
    cursor: 'pointer', fontFamily: FC, fontSize: 16, lineHeight: 1,
    color: 'rgba(232,223,200,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color .12s', flexShrink: 0,
  }

  return (
    <div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 300ms ease', animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none' }} />
      </div>
      <div style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.65rem,1vw,0.78rem)', color: TEXT_MUTED, textAlign: 'right', marginTop: 2 }}>
        {wounds} / {maxWounds}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <button onClick={() => onAdjust(-1)} disabled={wounds === 0}
          style={{ ...btnBase, cursor: wounds === 0 ? 'not-allowed' : 'pointer', color: wounds === 0 ? 'rgba(232,223,200,0.2)' : 'rgba(232,223,200,0.8)' }}
          onMouseEnter={e => { if (wounds > 0) (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}66` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
        >−</button>
        <span style={{ flex: 1, textAlign: 'center', fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.75rem,1.2vw,0.88rem)', color: 'rgba(232,223,200,0.8)' }}>
          {wounds} wound{wounds !== 1 ? 's' : ''}
        </span>
        <button onClick={() => onAdjust(1)} style={btnBase}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}66` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
        >+</button>
      </div>
      {isMinion && groupAlive !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 5 }}>
          {Array.from({ length: adv.groupSize }).map((_, i) => (
            <span key={i} style={{ fontSize: 'clamp(0.6rem,0.9vw,0.7rem)', color: i < groupAlive ? barColor : 'rgba(255,255,255,0.15)' }}>
              {i < groupAlive ? '■' : '□'}
            </span>
          ))}
          <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: TEXT_MUTED, marginLeft: 4 }}>
            {groupAlive}/{adv.groupSize} · rank {skillRank}
          </span>
        </div>
      )}
      {adv.type === 'nemesis' && adv.strainThreshold && adv.strainThreshold > 0 && onAdjustStrain && (() => {
        const strain    = adv.strainCurrent ?? 0
        const strainMax = adv.strainThreshold
        const sPct      = strainMax > 0 ? Math.min(1, strain / strainMax) : 0
        const AMBER_C   = '#FF9800'
        const PURPLE_C  = '#9C27B0'
        const sBarColor = sPct >= 1 ? PURPLE_C : AMBER_C
        return (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: AMBER_C, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Strain</div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${sPct * 100}%`, height: '100%', background: sBarColor, borderRadius: 3, transition: 'width 300ms ease' }} />
            </div>
            <div style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.65rem,1vw,0.78rem)', color: TEXT_MUTED, textAlign: 'right', marginTop: 2 }}>
              {strain} / {strainMax}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <button onClick={() => onAdjustStrain(-1)} disabled={strain === 0}
                style={{ ...btnBase, cursor: strain === 0 ? 'not-allowed' : 'pointer', color: strain === 0 ? 'rgba(232,223,200,0.2)' : 'rgba(232,223,200,0.8)' }}
                onMouseEnter={e => { if (strain > 0) (e.currentTarget as HTMLElement).style.borderColor = `${AMBER_C}66` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
              >−</button>
              <span style={{ flex: 1, textAlign: 'center', fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.75rem,1.2vw,0.88rem)', color: 'rgba(232,223,200,0.8)' }}>
                {strain} strain
              </span>
              <button onClick={() => onAdjustStrain(1)} style={btnBase}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${AMBER_C}66` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
              >+</button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

/* ── TypeBadge ────────────────────────────────────────────── */
function TypeBadge({ type }: { type: 'minion' | 'rival' | 'nemesis' }) {
  const cfg = {
    minion:  { color: TEXT_MUTED, label: 'MINION' },
    rival:   { color: GOLD,       label: 'RIVAL' },
    nemesis: { color: RED,        label: 'NEMESIS' },
  }[type]
  return (
    <span style={{ fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.1em', color: cfg.color, border: `1px solid ${cfg.color}50`, borderRadius: 3, padding: '1px 5px', background: `${cfg.color}15` }}>
      {cfg.label}
    </span>
  )
}

/* ── smallCtrlBtn ─────────────────────────────────────────── */
const smallCtrlBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid rgba(200,170,80,0.32)',
  borderRadius: 3, padding: '1px 7px', cursor: 'pointer',
  fontFamily: "'Rajdhani', sans-serif", fontSize: FS_CAPTION, color: TEXT,
  transition: '.15s', lineHeight: 1,
}
