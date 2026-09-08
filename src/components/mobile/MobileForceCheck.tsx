'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { rollForceDice, getAvailableForceDice } from '@/components/player-hud/dice-engine'
import { isDathomiri } from '@/lib/dathomiriUtils'
import { RichText } from '@/components/ui/RichText'
import { SYM_COLOR } from '@/lib/tokens'
import type { Character } from '@/lib/types'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import type { ForceRollResult } from '@/lib/forceRoll'

/**
 * Force Point identity — verbatim same shape/semantics as
 * ForceCheckOverlay.tsx's own `ForcePoint`/`pointId`. `idx` is the point's
 * index WITHIN ITS OWN KIND across the whole roll (not per-die); `dieIndex`
 * only matters for desktop's flight animation, which this panel doesn't
 * reproduce — allocation identity here, as on desktop, is `kind`+`idx` only.
 */
interface ForcePoint {
  kind: 'light' | 'dark'
  idx: number
  dieIndex: number
}
const pointId = (p: ForcePoint) => `${p.kind}-${p.idx}`

export interface MobileForceCheckProps {
  open: boolean
  onClose: () => void
  character: Character
  forceRating: number
  committedForce: number
  allForcePowers: ForcePowerDisplay[]
  isCombat: boolean
  campaignId: string | null
  characterId: string
  encounterId: string | null
  initialPowerKey?: string | null
}

export function MobileForceCheck({
  open, onClose, character, forceRating, committedForce, allForcePowers, isCombat,
  campaignId, characterId, encounterId: propEncounterId, initialPowerKey,
}: MobileForceCheckProps) {
  const [selectedPowerKey, setSelectedPowerKey] = useState<string | null>(initialPowerKey ?? null)
  const [forceRoll, setForceRoll] = useState<ForceRollResult | null>(null)

  // Same defect and same fix as MobileSkillCheck.tsx's own comment on this
  // pattern: this panel never unmounts (just toggles `open`), so the
  // `useState(initialPowerKey ?? null)` initializer above only ever runs
  // once and never re-syncs to a later, different `initialPowerKey` prop.
  // Re-seed explicitly on every open (keyed on `open` only, not
  // `initialPowerKey`, so a manual pick made while the panel stays open
  // isn't clobbered).
  useEffect(() => {
    if (open) setSelectedPowerKey(initialPowerKey ?? null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const [activatedKeys, setActivatedKeys] = useState<Set<string>>(new Set())
  const [alloc, setAlloc] = useState<Record<string, ForcePoint[]>>({})
  const [armed, setArmed] = useState<ForcePoint | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [committed, setCommitted] = useState(false)

  const isFallen = character.is_dark_side_fallen === true
  const dathomiri = isDathomiri(character)
  const available = getAvailableForceDice(forceRating, committedForce)
  const purchased = useMemo(() => allForcePowers.filter(p => p.purchasedCount > 0), [allForcePowers])
  const selPower = purchased.find(p => p.powerKey === selectedPowerKey) ?? null

  const upgrades = useMemo(() => (selPower ? selPower.abilities.filter(a => a.purchasedRanks > 0) : []), [selPower])
  const basicKey = selPower?.basicAbilityKey ?? null
  const basicUpgrade = useMemo(() => (basicKey ? upgrades.find(u => u.key === basicKey) ?? null : null), [upgrades, basicKey])
  const nonBasicUpgrades = useMemo(() => upgrades.filter(u => u.key !== basicKey), [upgrades, basicKey])

  const points = useMemo<ForcePoint[]>(() => {
    if (!forceRoll) return []
    const out: ForcePoint[] = []
    let li = 0, di = 0
    forceRoll.dice.forEach((d, dieIndex) => {
      for (let i = 0; i < d.light; i++) out.push({ kind: 'light', idx: li++, dieIndex })
      for (let i = 0; i < d.dark; i++) out.push({ kind: 'dark', idx: di++, dieIndex })
    })
    return out
  }, [forceRoll])

  const placedIds = useMemo(() => {
    const s = new Set<string>()
    for (const list of Object.values(alloc)) for (const p of list) s.add(pointId(p))
    return s
  }, [alloc])

  const lightSpentIdx = useMemo(() => new Set(Object.values(alloc).flat().filter(p => p.kind === 'light').map(p => p.idx)), [alloc])
  const darkSpentIdx = useMemo(() => new Set(Object.values(alloc).flat().filter(p => p.kind === 'dark').map(p => p.idx)), [alloc])
  const lightSpent = lightSpentIdx.size
  const darkSpent = darkSpentIdx.size

  const stage1Done = !!selPower
  const stage2Done = !!forceRoll

  function resetAll() {
    setSelectedPowerKey(null)
    setForceRoll(null)
    setActivatedKeys(new Set())
    setAlloc({})
    setArmed(null)
    setExpanded(new Set())
    setBusy(false)
    setCommitted(false)
  }

  function handleClose() {
    resetAll()
    onClose()
  }

  function selectPower(key: string) {
    setSelectedPowerKey(prev => prev === key ? null : key)
    setForceRoll(null)
    setActivatedKeys(new Set())
    setAlloc({})
    setArmed(null)
  }

  function handleRoll() {
    if (!stage1Done || available === 0) return
    const result = rollForceDice(available)
    setForceRoll(result)
    setActivatedKeys(new Set())
    setAlloc({})
    setArmed(null)
  }

  // Pip assignment is entirely local React state — no async/server round
  // trip per tap, so there is no race window for a promise-chain queue to
  // close: every handler below uses the functional setState form, which
  // React serializes correctly on its own. The one genuinely async,
  // rapid-tap-adjacent action here is the Commit write below, and it is
  // guarded the same way desktop's `busy` flag guards it — a single in-flight
  // write at a time, not a per-row queue, because there is only one write
  // action in this flow (unlike, say, a market row's independent per-row
  // read-modify-write).
  function handleRowTap(key: string) {
    if (armed) {
      const id = pointId(armed)
      if (placedIds.has(id)) { setArmed(null); return }
      setAlloc(prev => ({ ...prev, [key]: [...(prev[key] ?? []), armed] }))
      setActivatedKeys(prev => new Set(prev).add(key))
      setArmed(null)
      return
    }
    if (activatedKeys.has(key) && (alloc[key]?.length ?? 0) > 0) return
    setActivatedKeys(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function handleChipTap(key: string, chipIndex: number) {
    setAlloc(prev => {
      const list = prev[key] ?? []
      return { ...prev, [key]: list.filter((_, i) => i !== chipIndex) }
    })
  }

  function handleTokenTap(p: ForcePoint) {
    const id = pointId(p)
    if (placedIds.has(id)) return
    setArmed(prev => (prev && pointId(prev) === id ? null : p))
  }

  // ── Channel the Force — write sequence verbatim from ForceCheckOverlay.tsx's
  // handleChannelForce, including the hand-mapped roll_log result shape with
  // its known quirk (netAdvantage reads the TOTAL rolled dark pips, not the
  // spent count, unlike netSuccess/triumph). Reproduced exactly, not fixed —
  // per Step 0 instruction, two clients writing different shapes for the same
  // action is worse than one odd shape written consistently. No character
  // mutation anywhere in this function — strain is advisory-only, carried
  // only as a payload field on force_notifications/roll_log.roll_meta,
  // exactly matching desktop.
  async function handleChannelForce() {
    if (!selPower || !forceRoll || busy) return
    setBusy(true)
    try {
      const sb = campaignId ? createClient() : null
      const activatedUpgrades = nonBasicUpgrades
        .filter(u => activatedKeys.has(u.key))
        .map(u => ({ name: u.name, fp_cost: u.pip_cost, is_dark: false }))

      if (darkSpent > 0 && sb && campaignId) {
        await sb.from('force_notifications').insert({
          campaign_id: campaignId, character_id: characterId,
          character_name: character.name,
          type: isFallen ? 'dark_side_use' : 'force_use',
          dark_pips_used: darkSpent, power_name: selPower.powerName,
          strain_cost: dathomiri ? 0 : darkSpent,
          activated_upgrades: activatedUpgrades,
          status: 'pending',
        })
      }
      if (sb && campaignId) {
        let encId: string | null = propEncounterId ?? null
        if (!encId && isCombat) {
          const { data } = await sb.from('combat_encounters')
            .select('id').eq('campaign_id', campaignId).eq('is_active', true).limit(1).single()
          encId = data?.id ?? null
        }
        const totalFP = lightSpent + darkSpent
        await sb.from('combat_log').insert({
          campaign_id: campaignId, encounter_id: encId,
          participant_name: character.name, alignment: 'player',
          roll_type: 'force power', weapon_name: selPower.powerName,
          dice_pool: { force: available },
          result: { totalLight: forceRoll.totalLight, totalDark: forceRoll.totalDark, darkPipsUsed: darkSpent, totalFP },
          result_summary: `Force Power: ${selPower.powerName}. ${totalFP} FP`,
          is_visible_to_players: true,
        })
        await sb.from('roll_log').insert({
          campaign_id: campaignId, character_id: characterId,
          character_name: character.name,
          roll_label: selPower.powerName,
          pool: { force: available, proficiency: 0, ability: 0, boost: 0, challenge: 0, difficulty: 0, setback: 0 },
          result: { netSuccess: lightSpent, netAdvantage: forceRoll.totalDark, triumph: darkSpent, despair: 0, succeeded: totalFP > 0 },
          is_dm: false, hidden: false, roll_type: 'force',
          weapon_name: selPower.powerName, target_name: null,
          alignment: 'player', is_visible_to_players: true,
          roll_meta: {
            power_name: selPower.powerName,
            activated_upgrades: activatedUpgrades,
            dark_pips_used: darkSpent,
            strain_cost: dathomiri ? 0 : darkSpent,
            dice_results: forceRoll.dice,
          },
        })
      }
    } catch { /* non-blocking, matches desktop */ }
    setBusy(false)
    setCommitted(true)
  }

  const activeCount = useMemo(() => upgrades.filter(u => activatedKeys.has(u.key)).length, [upgrades, activatedKeys])
  const bankRemaining = points.length - placedIds.size
  const canChannel = selPower !== null && forceRoll !== null

  const rowsToRender = useMemo(() => {
    const rows: { key: string; name: string; description?: string; basic: boolean }[] = []
    if (basicUpgrade) rows.push({ key: basicUpgrade.key, name: basicUpgrade.name, description: basicUpgrade.description, basic: true })
    for (const u of nonBasicUpgrades) rows.push({ key: u.key, name: u.name, description: u.description, basic: false })
    return rows
  }, [basicUpgrade, nonBasicUpgrades])

  const statusText = !selPower
    ? 'Choose the Force power you are using this turn'
    : !forceRoll
      ? 'Roll your Force dice to generate Force Points'
      : committed
        ? 'Committed'
        : darkSpent > 0
          ? `Dark side: flip a Destiny token and take ${darkSpent} Conflict — resolve with your GM`
          : activeCount > 0
            ? 'Ready to commit'
            : "Activate your power's effects and place your Force Points"

  if (!open) return null

  return createPortal(
    <div className="m-combat-root" data-mobile-shell="">
      <div className="m-combat-header">
        <span className="m-combat-title">Force Check</span>
        <button type="button" className="m-icon-btn" onClick={handleClose} aria-label="Close">✕</button>
      </div>

      <div className="m-combat-body">
        {/* ── Stage 1 — Choose Power ──────────────────────────────────── */}
        <div className="m-deck-group-label">1 · Power</div>
        {purchased.length === 0 ? (
          <div className="m-weapon-stats">No Force powers purchased yet.</div>
        ) : (
          purchased.map(p => (
            <div
              key={p.powerKey}
              className={`m-force-power-row${p.powerKey === selectedPowerKey ? ' is-selected' : ''}`}
              onClick={() => selectPower(p.powerKey)}
              role="button"
              tabIndex={0}
            >
              <span className="m-force-power-name">{p.powerName}</span>
              <span className="m-force-power-count">{p.purchasedCount} / {p.totalCount} upgrades</span>
            </div>
          ))
        )}

        {/* ── Stage 2 — Roll ──────────────────────────────────────────── */}
        {stage1Done && (
          <>
            <div className="m-deck-group-label">2 · Roll Force Dice</div>
            <div className="m-weapon-stats">
              Your Force Rating gives you {available} Force {available === 1 ? 'die' : 'dice'} — these are the dice you are about to roll, not pips. Rolling them generates the Force Points (pips) you spend on your power's effects.
            </div>
            <div className="m-force-dice-row">
              {(forceRoll?.dice ?? Array.from({ length: available }, () => ({ light: 0, dark: 0 }))).map((d, i) => (
                <div key={i} className="m-force-die">
                  {!forceRoll ? '?' : d.light === 0 && d.dark === 0 ? '—' : (
                    <>
                      {Array.from({ length: d.light }).map((_, li) => <span key={`l${li}`} style={{ color: SYM_COLOR.lightPip /* sealed dice-identity colour */ }}>✦</span>)}
                      {Array.from({ length: d.dark }).map((_, di) => <span key={`d${di}`} style={{ color: SYM_COLOR.darkPip /* sealed dice-identity colour */ }}>✧</span>)}
                    </>
                  )}
                </div>
              ))}
            </div>
            {!forceRoll && (
              <button type="button" className="m-force-roll-btn" onClick={handleRoll} disabled={available === 0}>
                Roll {available} Force {available === 1 ? 'Die' : 'Dice'}
              </button>
            )}
            {forceRoll && (
              <div className="m-weapon-stats">
                Rolled {forceRoll.totalLight} Light · {forceRoll.totalDark} Dark
              </div>
            )}
            {committedForce > 0 && <div className="m-weapon-stats">{committedForce} die committed to ongoing effects</div>}
          </>
        )}

        {/* ── Stage 3 — Allocate ──────────────────────────────────────── */}
        {stage2Done && (
          <>
            <div className="m-deck-group-label">3 · Spend</div>
            <div className="m-force-bank">
              {points.length === 0 ? (
                <span className="m-weapon-stats">No Force Points generated</span>
              ) : points.map(p => {
                const id = pointId(p)
                const used = placedIds.has(id)
                return (
                  <button
                    key={id}
                    type="button"
                    className={`m-force-pip${used ? ' is-used' : ''}${armed && pointId(armed) === id ? ' is-armed' : ''}`}
                    style={{
                      // Force light/dark pip fills — sealed dice-identity colours (SYM_COLOR)
                      background: `color-mix(in srgb, ${p.kind === 'light' ? SYM_COLOR.lightPip : SYM_COLOR.darkPip} ${p.kind === 'light' ? 20 : 25}%, transparent)`,
                      color: p.kind === 'light' ? SYM_COLOR.lightPip : SYM_COLOR.darkPip,
                    }}
                    onClick={() => handleTokenTap(p)}
                    disabled={committed}
                    aria-label={p.kind === 'light' ? 'Light Force Point' : 'Dark Force Point'}
                  >
                    {p.kind === 'light' ? '✦' : '✧'}
                  </button>
                )
              })}
            </div>
            <div className="m-weapon-stats">
              {armed ? 'Point in hand — tap an effect to place it' : bankRemaining > 0 ? 'Tap a point, then tap an effect to spend it there' : points.length > 0 ? 'All points spent' : ''}
            </div>

            {rowsToRender.length === 0 ? (
              <div className="m-weapon-stats">No upgrades purchased for this power.</div>
            ) : rowsToRender.map(row => {
              const on = activatedKeys.has(row.key)
              const chips = alloc[row.key] ?? []
              const hasDark = chips.some(c => c.kind === 'dark')
              const isExp = expanded.has(row.key)
              return (
                <div key={row.key} className={`m-force-upgrade-row${on ? ' is-on' : ''}`}>
                  <div className="m-force-upgrade-head" role="button" tabIndex={0} onClick={() => !committed && handleRowTap(row.key)}>
                    <span>{on ? '✓' : '○'}</span>
                    <span className="m-force-upgrade-name">{row.name}</span>
                    {row.description && (
                      <button type="button" className="m-sheet-btn" style={{ flex: 'none', minHeight: 32, padding: '0 8px' }} onClick={e => { e.stopPropagation(); setExpanded(prev => { const n = new Set(prev); n.has(row.key) ? n.delete(row.key) : n.add(row.key); return n }) }}>
                        {isExp ? 'Less' : 'More'}
                      </button>
                    )}
                  </div>
                  {isExp && row.description && (
                    <div className="m-force-upgrade-desc"><RichText text={row.description} /></div>
                  )}
                  {on && (
                    <div className="m-force-upgrade-chips">
                      {chips.length === 0 ? (
                        <span className="m-weapon-stats">Active — no points spent</span>
                      ) : chips.map((c, ci) => (
                        <button
                          key={`${pointId(c)}-${ci}`}
                          type="button"
                          className="m-force-chip"
                          style={{
                            // Force light/dark pip fills — sealed dice-identity colours (SYM_COLOR)
                            background: `color-mix(in srgb, ${c.kind === 'light' ? SYM_COLOR.lightPip : SYM_COLOR.darkPip} ${c.kind === 'light' ? 20 : 25}%, transparent)`,
                            color: c.kind === 'light' ? SYM_COLOR.lightPip : SYM_COLOR.darkPip,
                          }}
                          disabled={committed}
                          onClick={() => handleChipTap(row.key, ci)}
                          aria-label="Return this point to the bank"
                        >
                          {c.kind === 'light' ? '✦' : '✧'}
                        </button>
                      ))}
                    </div>
                  )}
                  {hasDark && (
                    <div className="m-force-dark-warning">Dark side: flip a Destiny token and take Conflict — resolve with your GM.</div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>

      <div className="m-combat-footer">
        <div className="m-combat-footer-sub">{statusText}</div>
        <button
          type="button"
          className="m-sheet-btn is-primary"
          disabled={!canChannel || busy || committed}
          onClick={() => void handleChannelForce()}
        >
          {committed ? 'Committed' : `Commit — ${lightSpent} Light · ${darkSpent} Dark`}
        </button>
      </div>
    </div>,
    document.body,
  )
}
