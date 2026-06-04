'use client'

import { useState, useEffect } from 'react'
import { FS, HUD, FONT_DISPLAY, FONT_BODY, SP, EASE, RADIUS } from '@/lib/tokens'
import { createClient } from '@/lib/supabase/client'
import type { Character, ForceCommitment } from '@/lib/types'
import type { ForceRollResult } from '@/lib/forceRoll'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import type { AdversaryInstance } from '@/lib/adversaries'
import { SelectPowerStep } from './steps/SelectPowerStep'
import { RollForceDiceStep } from './steps/RollForceDiceStep'
import { DarkSidePipsStep } from './steps/DarkSidePipsStep'
import { ForceResolveStep } from './steps/ForceResolveStep'

const BG = 'var(--hud-surface-hi)'

type Step = 1 | 2 | 3 | 5

const STEP_LABELS_NORMAL: Record<Step, string> = {
  1: 'Select Power',
  2: 'Roll Force Dice',
  3: 'Dark Side Pips',
  5: 'Resolve',
}
const STEP_LABELS_FALLEN: Record<Step, string> = {
  1: 'Select Power',
  2: 'Roll Force Dice',
  3: 'Light Side Temptation',
  5: 'Resolve',
}

interface ForceCheckState {
  currentStep:      Step
  selectedPowerKey: string | null
  forceRoll:        ForceRollResult | null
  darkPipsUsed:     number
  encounterId:      string | null
}

function makeInitialState(): ForceCheckState {
  return {
    currentStep:      1,
    selectedPowerKey: null,
    forceRoll:        null,
    darkPipsUsed:     0,
    encounterId:      null,
  }
}

export interface ForceCheckOverlayProps {
  open:           boolean
  onClose:        () => void
  character:      Character
  forceRating:    number
  committedForce: number
  forcePowers:    ForcePowerDisplay[]
  isDathomiri:    boolean
  isCombat:       boolean
  campaignId:     string | null
  characterId:    string
  /** Pre-fetched active encounter ID — skips the combat_encounters SELECT when writing combat_log */
  encounterId?:   string | null
  /** Visible adversary tokens from the map — shown as targets regardless of combat state */
  visibleEnemies?: AdversaryInstance[]
}

export function ForceCheckOverlay({
  open, onClose,
  character, forceRating, committedForce,
  forcePowers, isDathomiri, isCombat,
  campaignId, characterId,
  encounterId: propEncounterId,
}: ForceCheckOverlayProps) {
  const [state, setState] = useState<ForceCheckState>(makeInitialState)
  const [busy, setBusy] = useState(false)

  // ── Reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) { setState(makeInitialState()); setBusy(false) }
  }, [open])

  // ── Derived ───────────────────────────────────────────────────────────────
  const isFallen = character.is_dark_side_fallen === true
  const STEP_LABELS = isFallen ? STEP_LABELS_FALLEN : STEP_LABELS_NORMAL

  // Skip step 3 for Dathomiri (all pips free), or when the costly-pip count is 0
  const costlyPipsRolled = isFallen
    ? (state.forceRoll?.totalLight ?? 0)   // fallen: light pips are costly
    : (state.forceRoll?.totalDark  ?? 0)   // normal: dark pips are costly
  const showDarkStep = !isDathomiri && costlyPipsRolled > 0

  function getNextStep(s: Step): Step {
    if (s === 1) return 2
    if (s === 2) return showDarkStep ? 3 : 5
    if (s === 3) return 5
    return s
  }

  function getPrevStep(s: Step): Step {
    if (s === 2) return 1
    if (s === 3) return 2
    if (s === 5) return showDarkStep ? 3 : 2
    return s
  }

  const selectedPower = forcePowers.find(p => p.powerKey === state.selectedPowerKey) ?? null

  // ── Commit a Force die to an ongoing effect ───────────────────────────────
  const handleCommit = async (
    powerKey: string,
    powerName: string,
    effectName: string,
  ) => {
    if (!campaignId) return
    const supabase = createClient()
    const current: ForceCommitment[] = character.force_commitments ?? []
    const existing = current.find(
      c => c.power_key === powerKey && c.effect_name === effectName,
    )
    const updated: ForceCommitment[] = existing
      ? current.map(c =>
          c.power_key === powerKey && c.effect_name === effectName
            ? { ...c, dice_count: c.dice_count + 1 }
            : c,
        )
      : [...current, { power_key: powerKey, power_name: powerName, effect_name: effectName, dice_count: 1 }]

    const newCommitted = (character.force_rating_committed ?? 0) + 1
    await supabase
      .from('characters')
      .update({ force_rating_committed: newCommitted, force_commitments: updated })
      .eq('id', characterId)
  }

  // ── Record upgrade activation in roll feed ────────────────────────────────
  const handleUpgradeActivate = (upgradeName: string) => {
    if (!campaignId) return
    const supabase = createClient()
    void supabase.from('roll_log').insert({
      campaign_id:    campaignId,
      character_id:   characterId,
      character_name: character.name,
      roll_label:     `${selectedPower?.powerName ?? 'Force Power'} — ${upgradeName} activated`,
      pool: { force: 0, proficiency: 0, ability: 0, boost: 0, challenge: 0, difficulty: 0, setback: 0 },
      result: { netSuccess: 1, netAdvantage: 0, triumph: 0, despair: 0, succeeded: true },
      is_dm:              false,
      hidden:             false,
      roll_type:          'force',
      weapon_name:        selectedPower?.powerName ?? '',
      target_name:        null,
      alignment:          'player',
      is_visible_to_players: true,
    })
  }

  function canAdvance(): boolean {
    switch (state.currentStep) {
      case 1: return state.selectedPowerKey !== null
      case 2: return state.forceRoll !== null
      case 3: return true   // 0 dark pips is a valid choice
      default: return false
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  const goBack = () => {
    if (state.currentStep <= 1 || busy) return
    setState(s => ({ ...s, currentStep: getPrevStep(s.currentStep) }))
  }
  void goBack // kept for future use; navigation available via completed-step click

  const goNext = async () => {
    if (!canAdvance() || busy) return
    setBusy(true)

    const nextStep = getNextStep(state.currentStep)
    let encounterId = state.encounterId

    try {
      const supabase = campaignId ? createClient() : null

      // Step 3 → 4: notify GM for costly pip use (dark pips for normal chars; light pips for fallen)
      if (state.currentStep === 3 && state.darkPipsUsed > 0 && supabase && campaignId) {
        await supabase.from('force_notifications').insert({
          campaign_id:    campaignId,
          character_id:   characterId,
          character_name: character.name,
          type:           'dark_side_use',
          dark_pips_used: state.darkPipsUsed,
          power_name:     selectedPower?.powerName ?? '',
          strain_cost:    state.darkPipsUsed,
          status:         'pending',
        })
      }

      // Advancing to step 5: write combat_log entry
      if (nextStep === 5 && supabase && campaignId && state.forceRoll) {
        // Prefer prop-seeded id → cached state → DB lookup (last resort)
        if (!encounterId) encounterId = propEncounterId ?? null
        if (!encounterId && isCombat) {
          const { data } = await supabase
            .from('combat_encounters')
            .select('id')
            .eq('campaign_id', campaignId)
            .eq('is_active', true)
            .limit(1)
            .single()
          encounterId = data?.id ?? null
        }

        const freeFP  = isFallen ? state.forceRoll.totalDark : state.forceRoll.totalLight
        const totalFP = freeFP + state.darkPipsUsed
        const targetLabel = ''

        await supabase.from('combat_log').insert({
          campaign_id:           campaignId,
          encounter_id:          encounterId,
          participant_name:      character.name,
          alignment:             'player',
          roll_type:             'force power',
          weapon_name:           selectedPower?.powerName ?? '',
          dice_pool:             { force: Math.max(0, forceRating - committedForce) },
          result: {
            totalLight:   state.forceRoll.totalLight,
            totalDark:    state.forceRoll.totalDark,
            darkPipsUsed: state.darkPipsUsed,
            totalFP,
          },
          result_summary: `Force Power: ${selectedPower?.powerName ?? ''}. ${totalFP} FP${targetLabel ? ` → ${targetLabel}` : ''}`,
          is_visible_to_players: true,
        })

        // Write to roll_log so the roll feed and Latest Rolls panel see this roll.
        // Encoding: netSuccess=totalLight, netAdvantage=totalDark, triumph=darkPipsUsed.
        // roll_type='force' triggers the ForceCard renderer; ACTIVATED is shown instead of SUCCESS/FAILURE.
        await supabase.from('roll_log').insert({
          campaign_id:    campaignId,
          character_id:   characterId,
          character_name: character.name,
          roll_label:     selectedPower?.powerName ?? 'Force Power',
          pool: {
            force:       Math.max(0, forceRating - committedForce),
            proficiency: 0, ability: 0, boost: 0,
            challenge: 0, difficulty: 0, setback: 0,
          },
          result: {
            netSuccess:   state.forceRoll.totalLight,
            netAdvantage: state.forceRoll.totalDark,
            triumph:      state.darkPipsUsed,
            despair:      0,
            succeeded:    totalFP > 0,
          },
          is_dm:              false,
          hidden:             false,
          roll_type:          'force',
          weapon_name:        selectedPower?.powerName ?? '',
          target_name:        targetLabel || null,
          alignment:          'player',
          is_visible_to_players: true,
        })
      }
    } catch (_e) {
      // Non-blocking — still advance the step
    }

    setState(s => ({ ...s, currentStep: nextStep, encounterId }))
    setBusy(false)
  }

  const handleUseAgain = () => { setState(makeInitialState()); setBusy(false) }
  const handleDone     = () => onClose()

  const isResolve  = state.currentStep === 5
  const totalSteps = isDathomiri ? 3 : 4

  // fallen/dark-side Force mechanic colours — pre-approved exception
  const accentColor    = isFallen ? '#8B2BE2'              : 'var(--die-force)'
  const bdColor        = isFallen ? 'rgba(139,43,226,0.15)' : 'color-mix(in srgb, var(--die-force) 25%, transparent)'
  const barColor       = isFallen ? 'rgba(139,43,226,0.6)' : 'color-mix(in srgb, var(--die-force) 60%, transparent)'
  const textColor      = isFallen ? '#8B2BE2'              : HUD.text
  const textDimColor   = isFallen ? 'rgba(139,43,226,0.5)' : HUD.textDim
  const textFaintColor = isFallen ? 'rgba(139,43,226,0.3)' : HUD.textFaint

  // ── Visible steps 1-4 (step 3 hidden for Dathomiri) ──────────────────────
  const visibleSteps = ([1, 2, 3] as Step[]).filter(n => n !== 3 || !isDathomiri)

  return (
    <div
      className={`hud-quick-drawer${open ? ' open' : ''}`}
      style={{
        background: BG,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: `1px solid ${bdColor}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      {/* ── Header strip ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: SP[2],
        padding: `${SP[2]} ${SP[3]}`,
        borderBottom: `1px solid var(--hud-border)`,
        background: 'var(--hud-panel)',
        flexShrink: 0,
      }}>
        <span style={{
          color: accentColor,
          fontSize: FS.sm,
          lineHeight: 1,
          flexShrink: 0,
        }}>
          {isFallen ? '☠' : '✦'}
        </span>
        <span style={{
          fontFamily: FONT_BODY,
          fontSize: FS.label,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: `color-mix(in srgb, ${accentColor} 80%, transparent)`,
          flex: 1,
        }}>
          Force Check
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--hud-text-faint)',
            fontSize: FS.sm,
            padding: `0 ${SP[1]}`,
            lineHeight: 1,
          }}
        >✕</button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `${SP[2]} ${SP[2]}`, overscrollBehavior: 'contain' }}>

        {/* Steps 1–4 with active/complete/locked visual treatment */}
        {!isResolve && visibleSteps.map(stepNum => {
          const isActive    = state.currentStep === stepNum
          const isDone      = state.currentStep > stepNum
          const isLocked    = state.currentStep < stepNum
          return (
            <div
              key={stepNum}
              style={{
                padding: `${SP[2]} ${SP[2]}`,
                borderLeft: isActive
                  ? `2px solid color-mix(in srgb, var(--die-force) 45%, transparent)`
                  : '2px solid transparent',
                background: isActive
                  ? `color-mix(in srgb, var(--die-force) 4%, transparent)`
                  : 'transparent',
                opacity: isDone ? 0.6 : isLocked ? 0.3 : 1,
                pointerEvents: isLocked ? 'none' as const : undefined,
                marginBottom: isActive ? SP[2] : 0,
              }}
            >
              {/* Step header label (always shown) */}
              <div
                onClick={isDone ? () => setState(s => ({ ...s, currentStep: stepNum })) : undefined}
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: FS.overline,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: isActive
                    ? `color-mix(in srgb, ${accentColor} 80%, transparent)`
                    : isDone ? HUD.textDim : HUD.textFaint,
                  marginBottom: isActive ? SP[2] : 0,
                  cursor: isDone ? 'pointer' : 'default',
                }}
              >
                {STEP_LABELS[stepNum]}{isDone ? ' ✓' : ''}
              </div>

              {/* Active step content */}
              {isActive && stepNum === 1 && (
                <SelectPowerStep
                  powers={forcePowers}
                  selectedPowerKey={state.selectedPowerKey}
                  onSelect={pk => setState(s => ({ ...s, selectedPowerKey: pk }))}
                />
              )}
              {isActive && stepNum === 2 && (
                <RollForceDiceStep
                  forceRating={forceRating}
                  committedForce={committedForce}
                  result={state.forceRoll}
                  isDathomiri={isDathomiri}
                  isFallen={isFallen}
                  onRoll={result => setState(s => ({ ...s, forceRoll: result, darkPipsUsed: 0 }))}
                  selectedPower={selectedPower}
                  onCommit={handleCommit}
                  onUpgradeActivate={handleUpgradeActivate}
                />
              )}
              {isActive && stepNum === 3 && state.forceRoll && (
                <DarkSidePipsStep
                  lightPips={isFallen ? state.forceRoll.totalDark : state.forceRoll.totalLight}
                  darkPips={isFallen ? state.forceRoll.totalLight : state.forceRoll.totalDark}
                  darkPipsUsed={state.darkPipsUsed}
                  onChangeDark={n => setState(s => ({ ...s, darkPipsUsed: n }))}
                  isFallen={isFallen}
                />
              )}
            </div>
          )
        })}

        {/* Step 5: Resolve — no step styling */}
        {isResolve && state.forceRoll && selectedPower && (
          <ForceResolveStep
            powerName={selectedPower.powerName}
            powerDesc={selectedPower.description}
            forceRoll={state.forceRoll}
            darkPipsUsed={state.darkPipsUsed}
            targets={[]}
            targetContext={null}
            isCombat={isCombat}
            isFallen={isFallen}
            onUseAgain={handleUseAgain}
            onDone={handleDone}
          />
        )}
      </div>

      {/* ── Footer (Next/Continue button, steps 1-4) ─────────────────────────── */}
      {!isResolve && (
        <div style={{ padding: `${SP[2]} ${SP[3]}`, borderTop: `1px solid ${bdColor}`, flexShrink: 0 }}>
          {/* Progress indicator */}
          <div style={{
            display: 'flex',
            gap: SP[1],
            justifyContent: 'center',
            marginBottom: SP[2],
          }}>
            {Array.from({ length: totalSteps }).map((_, i) => {
              const stepN = (i + 1) as Step
              const isPast    = state.currentStep > stepN
              const isCurrent = state.currentStep === stepN
              return (
                <div key={i} style={{
                  width: isCurrent ? SP[3] : SP[2],
                  height: SP[1],
                  borderRadius: RADIUS.full,
                  background: isCurrent
                    ? `color-mix(in srgb, ${accentColor} 80%, transparent)`
                    : isPast
                      ? `color-mix(in srgb, ${accentColor} 40%, transparent)`
                      : `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                  transition: `width ${EASE.quick}, background ${EASE.quick}`,
                }} />
              )
            })}
          </div>

          <button
            onClick={goNext}
            disabled={!canAdvance() || busy}
            style={{
              width: '100%',
              padding: `${SP[2]} 0`,
              borderRadius: RADIUS.md,
              border: 'none',
              cursor: (canAdvance() && !busy) ? 'pointer' : 'not-allowed',
              fontFamily: FONT_DISPLAY,
              fontSize: FS.sm,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: (canAdvance() && !busy)
                ? isFallen
                  ? `color-mix(in srgb, #8B2BE2 25%, transparent)` /* fallen/dark-side Force mechanic colour — pre-approved exception */
                  : `color-mix(in srgb, var(--die-force) 20%, transparent)`
                : isFallen
                  ? `color-mix(in srgb, #8B2BE2 6%, transparent)` /* fallen/dark-side Force mechanic colour — pre-approved exception */
                  : `color-mix(in srgb, var(--die-force) 6%, transparent)`,
              color: (canAdvance() && !busy) ? textColor : textFaintColor,
              transition: `background ${EASE.quick}`,
            }}
          >
            {busy ? '…' : getNextStep(state.currentStep) === 5 ? 'Resolve' : 'Continue'}
          </button>
        </div>
      )}
    </div>
  )
}
