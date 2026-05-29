'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRefWeapons } from '@/hooks/useRefWeapons'
import { useCharacterSkills } from '@/hooks/useCharacterSkills'
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
import type { RollResult } from '@/components/player-hud/dice-engine'
import { HUD, FS, SP, FONT_BODY, RADIUS, Z, EASE, COLOR, CHAR_COLOR } from '@/lib/tokens'

/* ── Design tokens ────────────────────────────────────────── */
const FC         = FONT_BODY
const BG         = 'var(--hud-bg)'
const PANEL_BG   = 'var(--hud-surface-mid)'
const RAISED_BG  = 'var(--hud-surface-lo)'
const BORDER     = 'var(--hud-border)'
const RED        = COLOR.red          // var(--red)
const BLUE       = COLOR.blue         // var(--blue)
const GREEN      = COLOR.green        // var(--green)
const TEAL       = '#52e0a8'          // no token — keep as-is
const INT_C      = '#a852e0'          // no token — keep as-is (used for Abilities section)
const CUN_C      = COLOR.amber        // var(--amber)
const WIL_C      = '#52e0a8'          // no token — keep as-is (same hue as TEAL)
const TEXTGR     = '#72B421'          // no token — keep as-is (skill rank / weapon text)
const TEXT       = HUD.text
const TEXT_SEC   = HUD.textDim
const TEXT_MUTED = HUD.textFaint

/* ── Characteristic display config ───────────────────────── */
const CHAR_COLORS = [
  CHAR_COLOR.brawn,     // #E03A1E
  CHAR_COLOR.agility,   // #D4903A
  CHAR_COLOR.intellect, // #C8AA50
  CHAR_COLOR.cunning,   // #B07828
  CHAR_COLOR.willpower, // #C82A10
  CHAR_COLOR.presence,  // #E07050
]
const CHAR_KEYS   = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const
const CHAR_ABBR   = ['BR', 'AG', 'INT', 'CUN', 'WIL', 'PR']
const CHAR_ABBR_MAP: Record<string, string> = {
  brawn: 'Br', agility: 'Ag', intellect: 'Int', cunning: 'Cun', willpower: 'Wil', presence: 'Pr',
}
const CHAR_COLOR_MAP: Record<string, string> = {
  brawn:     CHAR_COLOR.brawn,
  agility:   CHAR_COLOR.agility,
  intellect: CHAR_COLOR.intellect,
  cunning:   CHAR_COLOR.cunning,
  willpower: CHAR_COLOR.willpower,
  presence:  CHAR_COLOR.presence,
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
  passive: TEXT_MUTED, incidental: HUD.gold, maneuver: BLUE, action: RED, 'out of turn': WIL_C,
}
const CHAR_ABBR_FULL: Record<string, string> = {
  BR: 'Brawn', AGI: 'Agility', INT: 'Intellect', CUN: 'Cunning', WIL: 'Willpower', PR: 'Presence',
}

/* ── Props ────────────────────────────────────────────────── */
export interface EncounterAdversaryPanelProps {
  campaignId: string
  encounter:  CombatEncounter | null
  characters: Character[]
}

/**
 * EncounterAdversaryPanel — live, fully-interactive adversary detail cards
 * for the staging right drawer. Receives encounter state via props (from
 * useGmSession in GmShell) to avoid competing Supabase Realtime subscriptions.
 */
export function EncounterAdversaryPanel({ campaignId, encounter, characters }: EncounterAdversaryPanelProps) {
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
  const weaponRef = useRefWeapons()

  /* ── Character skills (for CombatCheckOverlay targets) ────── */
  const charSkillsByChar = useCharacterSkills(characters.map(c => c.id))

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
        ? 1 - (result.groupRemaining / Math.max(1, adv.groupSize))
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

  /* ── Minion group size adjustment ───────────────────────── */
  const adjustGroupSize = useCallback(async (adv: AdversaryInstance, delta: number) => {
    if (!encounter || adv.type !== 'minion') return
    const newGroupSize = Math.max(1, adv.groupSize + delta)
    if (newGroupSize === adv.groupSize) return

    let newGroupRemaining: number
    let newWoundsCurrent: number

    if (delta > 0) {
      newGroupRemaining = adv.groupRemaining + 1
      newWoundsCurrent  = adv.woundsCurrent ?? 0
    } else {
      newGroupRemaining = Math.min(adv.groupRemaining, newGroupSize)
      newWoundsCurrent  = Math.min(adv.woundsCurrent ?? 0, adv.woundThreshold * newGroupSize)
    }

    const updatedAdversaries = encounter.adversaries.map(a =>
      a.instanceId !== adv.instanceId ? a
        : { ...a, groupSize: newGroupSize, groupRemaining: newGroupRemaining, woundsCurrent: newWoundsCurrent }
    )
    await saveEncounter({ adversaries: updatedAdversaries })

    const advSlot = encounter.initiative_slots.find((s: InitiativeSlot) => s.adversaryInstanceId === adv.instanceId)
    if (advSlot) {
      const pct = 1 - (newGroupRemaining / Math.max(1, newGroupSize))
      await supabase.from('map_tokens').update({ wound_pct: pct }).eq('slot_key', advSlot.id).eq('campaign_id', campaignId)
    }
  }, [encounter, campaignId, saveEncounter]) // eslint-disable-line react-hooks/exhaustive-deps

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
      chips.push({ label: '+□', color: 'var(--die-boost)', title: 'Adds Boost die' })
    if ((d.match(/remov\w* (?:a |one |two |an? )?setback|cancel\w* (?:a |)?setback/g) ?? []).length > 0)
      chips.push({ label: '−■', color: 'var(--state-success)', title: 'Removes Setback die' })
    if ((d.match(/upgrad\w* (?:the |a |an? )?(?:abilit|skill|check|roll)/g) ?? []).length > 0)
      chips.push({ label: '↑', color: COLOR.gold, title: 'Upgrades ability to proficiency' })
    if ((d.match(/add\w* (?:a |one |two |an? )?setback|impose\w* (?:a |one |two |an? )?setback/g) ?? []).length > 0)
      chips.push({ label: '+■', color: '#909090', title: 'Adds Setback die' }) // no token — neutral grey
    return chips
  }

  const adversaries = encounter?.adversaries ?? []

  if (!encounter || adversaries.length === 0) {
    return (
      <div style={{ padding: `2.5rem ${SP[4]}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{ fontSize: '1.75rem', opacity: 0.3 }}>◆</div>
        <div style={{ fontFamily: FC, fontSize: FS.sm, color: TEXT_MUTED, textAlign: 'center' }}>
          No adversaries in this encounter.
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: `${SP[3]} 0.875rem`, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>

      {/* ── Defeat notification toast ─────────────────────────── */}
      {defeatNotif && (
        <div style={{
          background: `${RED}18`, border: `1px solid ${RED}50`, borderRadius: RADIUS.md,
          padding: `${SP[2]} ${SP[3]}`, display: 'flex', alignItems: 'center', gap: SP[2],
        }}>
          <span style={{ fontSize: '0.875rem' }}>☠</span>
          <span style={{ fontFamily: FC, fontSize: FS.label, color: RED, fontWeight: 700 }}>
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
            background: isDefeated ? 'var(--hud-surface-lo)' : PANEL_BG,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            borderRadius: RADIUS.lg, position: 'relative',
            borderTop: `2px solid ${isDefeated ? 'var(--hud-border)' : `${accent}80`}`,
            borderRight: `1px solid ${BORDER}`,
            borderBottom: `1px solid ${BORDER}`,
            borderLeft: `1px solid ${BORDER}`,
            opacity: isDefeated ? 0.45 : 1,
            transition: `opacity ${EASE.default}`,
          }}>

            {/* ── Header ──────────────────────────────────────── */}
            <div
              style={{ padding: `0.625rem ${SP[3]} ${SP[2]}`, display: 'flex', alignItems: 'center', gap: SP[2], cursor: 'pointer' }}
              onClick={toggleOpen}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: FC, fontSize: FS.sm, fontWeight: 700, color: TEXT,
                    textDecoration: isDefeated ? 'line-through' : 'none',
                  }}>{adv.name}</span>
                  {isDefeated ? (
                    <span style={{
                      fontFamily: FC, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em',
                      color: TEXT_MUTED, border: `1px solid var(--hud-border)`,
                      borderRadius: RADIUS.sm, padding: '1px 5px', background: 'var(--hud-surface-lo)',
                    }}>DEFEATED</span>
                  ) : (
                    <TypeBadge type={adv.type} />
                  )}
                  {adv.type === 'minion' && !isDefeated && (
                    <span style={{
                      fontFamily: FC, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em',
                      color: accent, border: `1px solid color-mix(in srgb, ${accent} 31%, transparent)`, borderRadius: RADIUS.sm,
                      padding: '1px 5px', background: `color-mix(in srgb, ${accent} 6%, transparent)`,
                    }}>MINION GROUP</span>
                  )}
                </div>
              </div>
              <span style={{ color: TEXT_MUTED, fontSize: FS.sm }}>{isOpen ? '▲' : '▼'}</span>

              {/* Remove button */}
              {removeConfirm === adv.instanceId ? (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    background: 'var(--hud-surface-hi)', border: '1px solid rgba(224,80,80,0.4)',
                    borderRadius: RADIUS.md, padding: `0.1875rem ${SP[2]}`, flexShrink: 0,
                  }}
                >
                  <span style={{ fontFamily: FC, fontSize: FS.caption, color: 'rgba(224,80,80,0.85)', whiteSpace: 'nowrap' }}>Remove?</span>
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
                    color: 'rgba(244,67,54,0.35)', fontSize: '0.9375rem', lineHeight: 1,
                    padding: '2px 5px', borderRadius: RADIUS.sm, transition: `color ${EASE.default}`,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(244,67,54,0.85)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(244,67,54,0.35)' }}
                >×</button>
              )}
            </div>

            {/* ── Wound tracker (always visible) ──────────────── */}
            <div style={{ padding: `0 ${SP[3]} ${SP[2]}` }}>
              <AdversaryWoundTracker
                adv={adv} accentColor={accent}
                onAdjust={delta => void adjustAdversaryWounds(adv, delta)}
                onAdjustStrain={delta => void adjustAdversaryStrain(adv, delta)}
                onAdjustGroupSize={adv.type === 'minion' ? delta => void adjustGroupSize(adv, delta) : undefined}
              />
            </div>

            {/* ── Expanded body ────────────────────────────────── */}
            {isOpen && (
              <div style={{ padding: `0 ${SP[3]} ${SP[3]}`, borderTop: `1px solid ${BORDER}` }}>

                {/* Characteristics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: SP[1], marginTop: SP[2], marginBottom: SP[2] }}>
                  {CHAR_KEYS.map((key, i) => (
                    <div key={key} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: FC, fontSize: FS.h4, fontWeight: 700, color: CHAR_COLORS[i], lineHeight: 1 }}>
                        {adv.characteristics[key]}
                      </div>
                      <div style={{ fontFamily: FC, fontSize: FS.overline, color: TEXT_MUTED, marginTop: 2 }}>{CHAR_ABBR[i]}</div>
                    </div>
                  ))}
                </div>

                {/* Derived stats + soak override */}
                {(() => {
                  const gearSoak = parseSoakFromGear(adv.gear ?? [])
                  const expectedSoak = adv.characteristics.brawn + gearSoak.total
                  return (
                    <>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1], marginBottom: gearSoak.total > 0 ? SP[1] : SP[2], alignItems: 'flex-start' }}>
                        {/* Soak — editable */}
                        <div style={{ background: `${WIL_C}15`, border: `1px solid ${WIL_C}40`, borderRadius: RADIUS.sm, padding: `0.1875rem 0.3125rem`, textAlign: 'center', minWidth: '3.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], justifyContent: 'center' }}>
                            <button onClick={e => { e.stopPropagation(); void updateAdversarySoak(adv.instanceId, adv.soak - 1) }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontFamily: FC, fontSize: FS.label, color: `${WIL_C}80`, lineHeight: 1 }}>−</button>
                            <span style={{ fontFamily: FC, fontSize: FS.h4, fontWeight: 700, color: WIL_C, lineHeight: 1 }}>{adv.soak}</span>
                            <button onClick={e => { e.stopPropagation(); void updateAdversarySoak(adv.instanceId, adv.soak + 1) }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontFamily: FC, fontSize: FS.label, color: `${WIL_C}80`, lineHeight: 1 }}>+</button>
                          </div>
                          <div style={{ fontFamily: FC, fontSize: FS.overline, color: TEXT_MUTED }}>Soak</div>
                        </div>
                        {/* Static stats */}
                        {[
                          { label: 'WT',    value: adv.woundThreshold,  color: RED },
                          ...(adv.strainThreshold !== undefined ? [{ label: 'ST', value: adv.strainThreshold, color: BLUE }] : []),
                          { label: 'M.Def', value: adv.defense.melee,   color: CUN_C },
                          { label: 'R.Def', value: adv.defense.ranged,  color: INT_C },
                        ].map(s => (
                          <div key={s.label} style={{ background: `${s.color}15`, border: `1px solid ${s.color}40`, borderRadius: RADIUS.sm, padding: `0.1875rem 0.4375rem`, textAlign: 'center' }}>
                            <div style={{ fontFamily: FC, fontSize: FS.h4, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontFamily: FC, fontSize: FS.overline, color: TEXT_MUTED }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      {/* Soak breakdown */}
                      {gearSoak.total > 0 && (
                        <div style={{ marginBottom: SP[2], display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: FC, fontSize: FS.overline, color: TEXT_MUTED }}>
                            Soak: Br {adv.characteristics.brawn} + {gearSoak.sources.join(' + ')} = {expectedSoak}
                          </span>
                          {adv.soak !== expectedSoak && (
                            <button
                              onClick={e => { e.stopPropagation(); void updateAdversarySoak(adv.instanceId, expectedSoak) }}
                              style={{ background: `color-mix(in srgb, ${HUD.gold} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${HUD.gold} 31%, transparent)`, borderRadius: RADIUS.sm, padding: '1px 6px', cursor: 'pointer', fontFamily: FC, fontSize: FS.overline, color: HUD.gold }}
                            >Apply</button>
                          )}
                        </div>
                      )}
                    </>
                  )
                })()}

                {/* Skills */}
                {Object.keys(adv.skillRanks ?? {}).length > 0 && (
                  <div style={{ marginBottom: SP[2] }}>
                    <div style={{ fontFamily: FC, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: `color-mix(in srgb, ${HUD.gold} 57%, transparent)`, marginBottom: '0.375rem' }}>Skills</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2rem 1.5rem auto', gap: '2px 6px', marginBottom: 3 }}>
                      {['Skill', 'Char', 'Rnk', 'Roll'].map(h => (
                        <div key={h} style={{ fontFamily: FC, fontSize: FS.overline, color: TEXT_MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</div>
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
                        <div key={skill} style={{ display: 'grid', gridTemplateColumns: '1fr 2rem 1.5rem auto', gap: '2px 6px', alignItems: 'center', padding: `0.1875rem 0`, borderBottom: `1px solid ${BORDER}` }}>
                          <span style={{ fontFamily: FC, fontSize: FS.label, color: TEXT_SEC }}>{displaySkillName}</span>
                          <span style={{ fontFamily: FC, fontSize: FS.overline, color: charColor, textAlign: 'center' }}>
                            {charKey ? CHAR_ABBR_MAP[charKey] : '—'}
                          </span>
                          <span style={{ fontFamily: FC, fontSize: FS.label, fontWeight: 700, color: TEXTGR, textAlign: 'center' }}>{rank}</span>
                          <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            {Array.from({ length: prof }).map((_, i) => (
                              <div key={`p${i}`} style={{ width: '0.6875rem', height: '0.6875rem', borderRadius: RADIUS.full, background: 'var(--die-proficiency)', border: `1px solid ${COLOR.gold}`, flexShrink: 0 }} title="Proficiency" />
                            ))}
                            {Array.from({ length: abil }).map((_, i) => (
                              <div key={`a${i}`} style={{ width: '0.6875rem', height: '0.6875rem', borderRadius: RADIUS.full, background: 'var(--die-ability)', border: `1px solid ${COLOR.green}`, flexShrink: 0 }} title="Ability" />
                            ))}
                            {prof === 0 && abil === 0 && <span style={{ fontFamily: FC, fontSize: FS.overline, color: TEXT_MUTED }}>—</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Talents */}
                {adv.talents && adv.talents.length > 0 && (
                  <div style={{ marginBottom: SP[2] }}>
                    <div style={{ fontFamily: FC, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: `color-mix(in srgb, ${HUD.gold} 57%, transparent)`, marginBottom: '0.3125rem' }}>Talents</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1] }}>
                      {adv.talents.map((t, i) => {
                        const actKey = (t.activation ?? 'passive').toLowerCase()
                        const color = TALENT_ACT_COLORS[actKey] ?? TEXT_MUTED
                        const diceChips = parseTalentDice(t.description)
                        return (
                          <div key={i}
                            style={{ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: RADIUS.sm, padding: `0.1875rem 0.4375rem`, display: 'flex', alignItems: 'center', gap: '0.3125rem', cursor: t.description ? 'help' : 'default' }}
                            onMouseEnter={e => { if (t.description) setTalentTooltip({ name: t.name, description: t.description, activation: t.activation, rect: (e.currentTarget as HTMLElement).getBoundingClientRect() }) }}
                            onMouseLeave={() => setTalentTooltip(null)}
                          >
                            <span style={{ fontFamily: FC, fontSize: FS.overline, color }}>{t.name}</span>
                            {diceChips.map((chip, ci) => (
                              <span key={ci} title={chip.title} style={{ fontFamily: FC, fontSize: FS.overline, fontWeight: 700, color: chip.color, background: `${chip.color}18`, border: `1px solid ${chip.color}50`, borderRadius: RADIUS.sm, padding: '0 3px' }}>{chip.label}</span>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Abilities */}
                <div style={{ marginBottom: SP[2] }}>
                  <div style={{ fontFamily: FC, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: INT_C, marginBottom: '0.375rem' }}>Abilities</div>
                  <div style={{ background: `${INT_C}0c`, border: `1px solid ${INT_C}30`, borderRadius: RADIUS.md, padding: `0.4375rem 0.5625rem`, display: 'flex', flexDirection: 'column', gap: '0.3125rem' }}>
                    {adv.abilities && adv.abilities.length > 0
                      ? adv.abilities.map((ab, i) => (
                        <div key={i}>
                          <span style={{ fontFamily: FC, fontSize: FS.caption, fontWeight: 700, color: INT_C }}>{ab.name}{ab.description ? ': ' : ''}</span>
                          {ab.description && <span style={{ fontFamily: FC, fontSize: FS.caption, color: TEXT_SEC }}><RichText text={ab.description} /></span>}
                        </div>
                      ))
                      : <div style={{ fontFamily: FC, fontSize: FS.caption, color: TEXT_MUTED, fontStyle: 'italic' }}>No special abilities</div>
                    }
                  </div>
                </div>

                {/* Gear */}
                {adv.gear && adv.gear.length > 0 && (
                  <div style={{ marginBottom: SP[2] }}>
                    <div style={{ fontFamily: FC, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: `color-mix(in srgb, ${HUD.gold} 57%, transparent)`, marginBottom: '0.3125rem' }}>Gear</div>
                    {adv.gear.map((item, i) => {
                      const label = typeof item === 'string' ? item
                        : [item.name, item.encumbrance ? `Enc ${item.encumbrance}` : ''].filter(Boolean).join(' — ')
                      const notes = typeof item === 'string' ? '' : item.description
                      return (
                        <div key={i} style={{ fontFamily: FC, fontSize: FS.label, color: TEXT_SEC }}>
                          · {label}{notes ? <span> — <RichText text={notes} /></span> : null}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Weapons */}
                {adv.weapons && adv.weapons.length > 0 && (
                  <div style={{ marginBottom: SP[2] }}>
                    <div style={{ fontFamily: FC, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: `color-mix(in srgb, ${HUD.gold} 57%, transparent)`, marginBottom: '0.3125rem' }}>Weapons</div>
                    {adv.weapons.map((w, i) => {
                      const { dmg, range, crit } = resolveWeapon(w, adv.characteristics.brawn, weaponRef)
                      const quals = w.qualities && w.qualities.length > 0 ? w.qualities.join(', ') : ''
                      return (
                        <div key={i} style={{ fontFamily: FC, fontSize: FS.label, fontWeight: 500, color: TEXTGR, marginBottom: 2 }}>
                          {w.name} — DMG {dmg}{crit !== undefined ? ` — Crit ${crit}` : ''} — {range}{quals ? <span> — <RichText text={quals} /></span> : null}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Combat check buttons ──────────────────────────── */}
            {isOpen && adv.weapons && adv.weapons.length > 0 && (
              <div style={{ borderTop: `1px solid ${BORDER}`, padding: `0.4375rem ${SP[3]}`, display: 'flex', gap: '0.375rem' }}>
                {(['melee', 'ranged'] as const).map(type => (
                  <button key={type}
                    onClick={() => setAdvCombatCheck({ adv, attackType: type, alignment: advAlignment })}
                    style={{
                      flex: 1, padding: '0.3125rem 0',
                      background: `color-mix(in srgb, ${accent} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${accent} 31%, transparent)`,
                      borderRadius: RADIUS.md, cursor: 'pointer',
                      fontFamily: FC, fontSize: FS.label, fontWeight: 600, color: accent, letterSpacing: '0.05em',
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
                  <div style={{ borderTop: `1px solid color-mix(in srgb, ${HUD.gold} 25%, transparent)`, padding: `${SP[2]} ${SP[3]}`, background: `color-mix(in srgb, ${HUD.gold} 4%, transparent)` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], marginBottom: SP[1] }}>
                      <span style={{ fontFamily: FC, fontSize: 'clamp(9px,1vw,11px)', fontWeight: 700, letterSpacing: '0.18em', color: HUD.gold, textTransform: 'uppercase' }}>
                        Squad Active
                      </span>
                      <span style={{ fontFamily: FC, fontSize: FS.caption, color: TEXT_SEC }}>{liveCount}/{adv.squad_total_minions ?? 0} minions</span>
                      <button
                        onClick={() => void handleDisbandSquad(adv.instanceId)}
                        style={{ marginLeft: 'auto', background: `${RED}15`, border: `1px solid ${RED}50`, borderRadius: RADIUS.sm, padding: `2px ${SP[2]}`, cursor: 'pointer', fontFamily: FC, fontSize: FS.caption, fontWeight: 600, color: RED }}
                      >Disband</button>
                    </div>
                    {(adv.squad_minion_refs ?? []).map(ref => {
                      const m = encounter.adversaries.find(a => a.instanceId === ref.instanceId)
                      if (!m) return null
                      return (
                        <div key={ref.instanceId} style={{ fontFamily: FC, fontSize: FS.caption, color: TEXT_MUTED, display: 'flex', gap: '0.375rem' }}>
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
                  <div style={{ borderTop: `1px solid color-mix(in srgb, ${HUD.gold} 25%, transparent)`, padding: `${SP[2]} ${SP[3]}`, background: `color-mix(in srgb, ${HUD.gold} 3%, transparent)` }}>
                    <div style={{ fontFamily: FC, fontSize: FS.caption, fontWeight: 600, color: HUD.gold, marginBottom: '0.375rem', letterSpacing: '0.06em' }}>
                      Select minion groups for squad (max {CAP} total):
                    </div>
                    {availableMinions.length === 0 && (
                      <div style={{ fontFamily: FC, fontSize: FS.caption, color: TEXT_MUTED, marginBottom: '0.375rem' }}>No available minion groups</div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginBottom: SP[2] }}>
                      {availableMinions.map(m => {
                        const isSelected = squadSelections.has(m.instanceId)
                        const wouldExceed = !isSelected && selectedTotal + m.groupRemaining > CAP
                        return (
                          <label key={m.instanceId} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: wouldExceed ? 'not-allowed' : 'pointer', opacity: wouldExceed ? 0.45 : 1 }}>
                            <input type="checkbox" checked={isSelected} disabled={wouldExceed}
                              onChange={e => {
                                setSquadSelections(prev => {
                                  const next = new Set(prev)
                                  e.target.checked ? next.add(m.instanceId) : next.delete(m.instanceId)
                                  return next
                                })
                              }}
                              style={{ accentColor: HUD.gold, width: '0.8125rem', height: '0.8125rem' }}
                            />
                            <span style={{ fontFamily: FC, fontSize: FS.caption, color: TEXT }}>{m.name}</span>
                            <span style={{ fontFamily: FC, fontSize: FS.caption, color: TEXT_MUTED }}>({m.groupRemaining} minions)</span>
                          </label>
                        )
                      })}
                    </div>
                    {selectedTotal > 0 && (
                      <div style={{ fontFamily: FC, fontSize: FS.caption, color: TEXT_SEC, marginBottom: '0.375rem' }}>
                        {selectedTotal} minions selected{selectedTotal > CAP && <span style={{ color: RED }}> — exceeds cap of {CAP}</span>}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button
                        onClick={() => void handleConfirmSquad(adv.instanceId)}
                        disabled={selectedTotal === 0 || selectedTotal > CAP}
                        style={{
                          flex: 1, padding: `${SP[1]} 0`,
                          background: selectedTotal > 0 && selectedTotal <= CAP ? `color-mix(in srgb, ${HUD.gold} 13%, transparent)` : 'transparent',
                          border: `1px solid ${selectedTotal > 0 && selectedTotal <= CAP ? HUD.gold : BORDER}`,
                          borderRadius: RADIUS.sm, cursor: selectedTotal > 0 && selectedTotal <= CAP ? 'pointer' : 'not-allowed',
                          fontFamily: FC, fontSize: FS.caption, fontWeight: 600,
                          color: selectedTotal > 0 && selectedTotal <= CAP ? HUD.gold : TEXT_MUTED,
                        }}
                      >Confirm Squad</button>
                      <button
                        onClick={() => { setSquadFormingFor(null); setSquadSelections(new Set()) }}
                        style={{ padding: `${SP[1]} 0.625rem`, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm, cursor: 'pointer', fontFamily: FC, fontSize: FS.caption, color: TEXT_MUTED }}
                      >Cancel</button>
                    </div>
                  </div>
                )
              }

              if (availableMinions.length === 0) return null
              return (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: `0.4375rem ${SP[3]}` }}>
                  <button
                    onClick={() => void handleFormSquad(adv)}
                    style={{ width: '100%', padding: '0.3125rem 0', background: `color-mix(in srgb, ${HUD.gold} 6%, transparent)`, border: `1px solid color-mix(in srgb, ${HUD.gold} 25%, transparent)`, borderRadius: RADIUS.md, cursor: 'pointer', fontFamily: FC, fontSize: FS.label, fontWeight: 600, color: HUD.gold, letterSpacing: '0.05em' }}
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
          zIndex: Z.tooltip,
          background: 'var(--hud-surface-hi)',
          border: '1px solid var(--hud-border-hi)',
          borderRadius: RADIUS.lg, padding: `${SP[2]} ${SP[3]}`,
          maxWidth: '16.25rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: FC, fontSize: FS.label, fontWeight: 700, color: HUD.gold, marginBottom: SP[1] }}>
            {talentTooltip.name}
            {talentTooltip.activation && (
              <span style={{ fontFamily: FC, fontSize: FS.overline, color: TEXT_MUTED, marginLeft: '0.375rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ({talentTooltip.activation})
              </span>
            )}
          </div>
          <div style={{ fontFamily: FC, fontSize: FS.caption, color: TEXT_SEC, lineHeight: 1.5 }}>
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
            gmOverrides={{ isGmMode: true, gmTargets, gmAlignment: alignment, gmHiddenFromPlayers: !adv.revealed }}
          />
        )
      })()}
    </div>
  )
}

/* ── AdversaryWoundTracker (mirrored from CombatPanel) ────── */
function AdversaryWoundTracker({
  adv, accentColor, onAdjust, onAdjustStrain, onAdjustGroupSize,
}: {
  adv: AdversaryInstance
  accentColor: string
  onAdjust: (delta: number) => void
  onAdjustStrain?: (delta: number) => void
  onAdjustGroupSize?: (delta: number) => void
}) {
  const wounds    = adv.woundsCurrent ?? 0
  const isMinion  = adv.type === 'minion'
  const maxWounds = isMinion ? adv.woundThreshold * adv.groupSize : adv.woundThreshold
  const pct       = maxWounds > 0 ? Math.min(1, wounds / maxWounds) : 0

  const AMBER_COLOR  = COLOR.amber   // var(--amber)
  const PURPLE_COLOR = '#9C27B0'     // no token — keep as-is
  const barColor = pct >= 1 ? PURPLE_COLOR : pct >= 0.8 ? COLOR.red : pct >= 0.5 ? AMBER_COLOR : accentColor

  const groupAlive = isMinion
    ? Math.min(adv.groupSize, Math.max(0, adv.groupSize - Math.floor(wounds / adv.woundThreshold)))
    : null
  const skillRank = groupAlive !== null ? Math.max(0, groupAlive - 1) : null

  const btnBase: React.CSSProperties = {
    width: '2.25rem', height: '1.75rem', borderRadius: RADIUS.md,
    background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)',
    cursor: 'pointer', fontFamily: FC, fontSize: FS.h4, lineHeight: 1,
    color: HUD.text,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: `border-color ${EASE.default}`, flexShrink: 0,
  }

  return (
    <div>
      <div style={{ height: 6, background: 'var(--hud-surface-lo)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: barColor, borderRadius: RADIUS.sm, transition: `width 300ms ease`, animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none' }} />
      </div>
      <div style={{ fontFamily: FC, fontSize: 'clamp(0.65rem,1vw,0.78rem)', color: HUD.textFaint, textAlign: 'right', marginTop: 2 }}>
        {wounds} / {maxWounds}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: SP[1] }}>
        <button onClick={() => onAdjust(-1)} disabled={wounds === 0}
          style={{ ...btnBase, cursor: wounds === 0 ? 'not-allowed' : 'pointer', color: wounds === 0 ? HUD.textFaint : HUD.text }}
          onMouseEnter={e => { if (wounds > 0) (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}66` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--hud-border)' }}
        >−</button>
        <span style={{ flex: 1, textAlign: 'center', fontFamily: FC, fontSize: 'clamp(0.75rem,1.2vw,0.88rem)', color: HUD.text }}>
          {wounds} wound{wounds !== 1 ? 's' : ''}
        </span>
        <button onClick={() => onAdjust(1)} style={btnBase}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}66` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--hud-border)' }}
        >+</button>
      </div>
      {isMinion && groupAlive !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: '0.3125rem' }}>
          {Array.from({ length: adv.groupSize }).map((_, i) => (
            <span key={i} style={{ fontSize: 'clamp(0.6rem,0.9vw,0.7rem)', color: i < groupAlive ? barColor : 'var(--hud-surface-lo)' }}>
              {i < groupAlive ? '■' : '□'}
            </span>
          ))}
          <span style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint, marginLeft: SP[1] }}>
            {groupAlive}/{adv.groupSize} · rank {skillRank}
          </span>
        </div>
      )}
      {isMinion && onAdjustGroupSize && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem' }}>
          <span style={{ fontFamily: FC, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.08em', textTransform: 'uppercase', flex: 1 }}>
            Group Size
          </span>
          <button
            onClick={() => onAdjustGroupSize(-1)}
            disabled={adv.groupSize <= 1}
            style={{
              ...btnBase,
              width: '1.75rem', height: '1.5rem',
              cursor: adv.groupSize <= 1 ? 'not-allowed' : 'pointer',
              color: adv.groupSize <= 1 ? HUD.textFaint : HUD.text,
            }}
            title="Remove one unit from group"
          >−</button>
          <span style={{
            fontFamily: FC,
            fontSize: 'clamp(0.7rem,1vw,0.82rem)',
            color: HUD.text,
            minWidth: '1.25rem', textAlign: 'center',
          }}>{adv.groupSize}</span>
          <button
            onClick={() => onAdjustGroupSize(1)}
            style={{ ...btnBase, width: '1.75rem', height: '1.5rem' }}
            title="Add one unit to group"
          >+</button>
        </div>
      )}
      {adv.type === 'nemesis' && adv.strainThreshold && adv.strainThreshold > 0 && onAdjustStrain && (() => {
        const strain    = adv.strainCurrent ?? 0
        const strainMax = adv.strainThreshold
        const sPct      = strainMax > 0 ? Math.min(1, strain / strainMax) : 0
        const sBarColor = sPct >= 1 ? PURPLE_COLOR : AMBER_COLOR
        return (
          <div style={{ marginTop: SP[2] }}>
            <div style={{ fontFamily: FC, fontSize: FS.overline, color: AMBER_COLOR, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: SP[1] }}>Strain</div>
            <div style={{ height: 6, background: 'var(--hud-surface-lo)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
              <div style={{ width: `${sPct * 100}%`, height: '100%', background: sBarColor, borderRadius: RADIUS.sm, transition: `width 300ms ease` }} />
            </div>
            <div style={{ fontFamily: FC, fontSize: 'clamp(0.65rem,1vw,0.78rem)', color: HUD.textFaint, textAlign: 'right', marginTop: 2 }}>
              {strain} / {strainMax}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: SP[1] }}>
              <button onClick={() => onAdjustStrain(-1)} disabled={strain === 0}
                style={{ ...btnBase, cursor: strain === 0 ? 'not-allowed' : 'pointer', color: strain === 0 ? HUD.textFaint : HUD.text }}
                onMouseEnter={e => { if (strain > 0) (e.currentTarget as HTMLElement).style.borderColor = `${AMBER_COLOR}66` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--hud-border)' }}
              >−</button>
              <span style={{ flex: 1, textAlign: 'center', fontFamily: FC, fontSize: 'clamp(0.75rem,1.2vw,0.88rem)', color: HUD.text }}>
                {strain} strain
              </span>
              <button onClick={() => onAdjustStrain(1)} style={btnBase}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${AMBER_COLOR}66` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--hud-border)' }}
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
    minion:  { color: HUD.textFaint, label: 'MINION' },
    rival:   { color: HUD.gold,      label: 'RIVAL' },
    nemesis: { color: COLOR.red,     label: 'NEMESIS' },
  }[type]
  return (
    <span style={{ fontFamily: FC, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em', color: cfg.color, border: `1px solid ${cfg.color}50`, borderRadius: RADIUS.sm, padding: '1px 5px', background: `${cfg.color}15` }}>
      {cfg.label}
    </span>
  )
}

/* ── smallCtrlBtn ─────────────────────────────────────────── */
const smallCtrlBtn: React.CSSProperties = {
  background: 'transparent', border: `1px solid var(--hud-border-hi)`,
  borderRadius: RADIUS.sm, padding: `1px 0.4375rem`, cursor: 'pointer',
  fontFamily: FC, fontSize: FS.caption, color: HUD.text,
  transition: EASE.default, lineHeight: 1,
}

