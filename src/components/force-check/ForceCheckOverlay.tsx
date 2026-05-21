'use client'

import { useState, useEffect } from 'react'
import { FS } from '@/lib/tokens'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/lib/types'
import type { ForceRollResult } from '@/lib/forceRoll'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import type { TargetEntry } from './steps/ForceTargetStep'
import { SelectPowerStep } from './steps/SelectPowerStep'
import { RollForceDiceStep } from './steps/RollForceDiceStep'
import { DarkSidePipsStep } from './steps/DarkSidePipsStep'
import { ForceTargetStep } from './steps/ForceTargetStep'
import { ForceResolveStep } from './steps/ForceResolveStep'

const BG         = 'var(--hud-surface-hi)'
const FORCE_BLUE = '#7EC8E3'
const FB_DIM     = 'rgba(126,200,227,0.45)'
const FB_BD      = 'rgba(126,200,227,0.25)'
const FB_BAR     = 'rgba(126,200,227,0.6)'
const TEXT_DIM   = 'var(--hud-text-dim)'
const FONT_C     = 'var(--font-body)'
const FONT_R     = 'var(--font-body)'

type Step = 1 | 2 | 3 | 4 | 5

const STEP_LABELS_NORMAL: Record<Step, string> = {
  1: 'Select Power',
  2: 'Roll Force Dice',
  3: 'Dark Side Pips',
  4: 'Select Target',
  5: 'Resolve',
}
const STEP_LABELS_FALLEN: Record<Step, string> = {
  1: 'Select Power',
  2: 'Roll Force Dice',
  3: 'Light Side Temptation',
  4: 'Select Target',
  5: 'Resolve',
}

interface ForceCheckState {
  currentStep:      Step
  selectedPowerKey: string | null
  forceRoll:        ForceRollResult | null
  darkPipsUsed:     number
  selectedTargets:  TargetEntry[]
  targetContext:    'environment' | 'character' | null
  encounterId:      string | null
}

function makeInitialState(): ForceCheckState {
  return {
    currentStep:      1,
    selectedPowerKey: null,
    forceRoll:        null,
    darkPipsUsed:     0,
    selectedTargets:  [],
    targetContext:    null,
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
    if (s === 2) return showDarkStep ? 3 : 4
    if (s === 3) return 4
    if (s === 4) return 5
    return s
  }

  function getPrevStep(s: Step): Step {
    if (s === 2) return 1
    if (s === 3) return 2
    if (s === 4) return showDarkStep ? 3 : 2
    if (s === 5) return 4
    return s
  }

  const selectedPower = forcePowers.find(p => p.powerKey === state.selectedPowerKey) ?? null

  function canAdvance(): boolean {
    switch (state.currentStep) {
      case 1: return state.selectedPowerKey !== null
      case 2: return state.forceRoll !== null
      case 3: return true   // 0 dark pips is a valid choice
      case 4: return true   // target is optional
      default: return false
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  const goBack = () => {
    if (state.currentStep <= 1 || busy) return
    setState(s => ({ ...s, currentStep: getPrevStep(s.currentStep) }))
  }

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
        const targetLabel = state.selectedTargets.length > 0
          ? state.selectedTargets.map(t => t.name).join(', ')
          : isCombat ? ''
          : state.targetContext === 'environment' ? 'Environment' : ''

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

  const isResolve   = state.currentStep === 5
  const totalSteps  = isDathomiri ? 4 : 5
  const accentColor = isFallen ? '#8B2BE2' : FORCE_BLUE
  const borderColor = isFallen ? 'rgba(139,43,226,0.3)' : 'rgba(126,200,227,0.25)'
  const barColor    = isFallen ? 'rgba(139,43,226,0.6)' : FB_BAR
  const dimColor    = isFallen ? 'rgba(139,43,226,0.5)' : FB_DIM
  const bdColor     = isFallen ? 'rgba(139,43,226,0.15)' : FB_BD
  // Text colors — dark on light-blue bg for normal path; keep purple for fallen
  const textColor     = isFallen ? '#8B2BE2'              : '#3A0C04'
  const textDimColor  = isFallen ? 'rgba(139,43,226,0.5)' : 'rgba(58,12,4,0.55)'
  const textFaintColor = isFallen ? 'rgba(139,43,226,0.3)' : 'rgba(58,12,4,0.3)'

  return (
    <div
      className={`hud-quick-drawer${open ? ' open' : ''}`}
      style={{
        background: BG,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: `1px solid ${borderColor}`,
      }}
    >

      {/* ── Header ── */}
      <div style={{
        padding: '10px 14px',
        borderBottom: `1px solid ${bdColor}`,
        display: 'flex', flexDirection: 'column', gap: 4,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Back */}
          <button
            onClick={goBack}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px',
              fontFamily: FONT_R, fontSize: FS.caption, color: textDimColor,
              visibility: (!isResolve && state.currentStep > 1) ? 'visible' : 'hidden',
            }}
          >
            ← Back
          </button>

          {/* Title */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              fontFamily: FONT_C, fontSize: FS.label, fontWeight: 700,
              color: textColor, textTransform: 'uppercase', letterSpacing: '0.15em',
              textShadow: isFallen ? '0 0 12px rgba(139,43,226,0.4)' : 'none',
            }}>
              {isFallen ? '☠' : '✦'} Force Check
            </div>
            {!isResolve && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: FS.overline, color: textDimColor, marginTop: 2 }}>
                {STEP_LABELS[state.currentStep]}
              </div>
            )}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 6px',
              fontFamily: 'var(--font-body)', fontSize: 15, color: TEXT_DIM,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      {!isResolve && (
        <div style={{ height: 4, background: isFallen ? 'rgba(139,43,226,0.1)' : 'rgba(126,200,227,0.1)', flexShrink: 0 }}>
          <div style={{
            height: '100%',
            width: `${(state.currentStep / totalSteps) * 100}%`,
            background: barColor,
            transition: 'width 200ms ease',
          }} />
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', overscrollBehavior: 'contain' }}>

        {state.currentStep === 1 && (
          <SelectPowerStep
            powers={forcePowers}
            selectedPowerKey={state.selectedPowerKey}
            onSelect={pk => setState(s => ({ ...s, selectedPowerKey: pk }))}
          />
        )}

        {state.currentStep === 2 && (
          <RollForceDiceStep
            forceRating={forceRating}
            committedForce={committedForce}
            result={state.forceRoll}
            isDathomiri={isDathomiri}
            isFallen={isFallen}
            onRoll={result => setState(s => ({ ...s, forceRoll: result, darkPipsUsed: 0 }))}
          />
        )}

        {state.currentStep === 3 && state.forceRoll && (
          <DarkSidePipsStep
            lightPips={isFallen ? state.forceRoll.totalDark : state.forceRoll.totalLight}
            darkPips={isFallen ? state.forceRoll.totalLight : state.forceRoll.totalDark}
            darkPipsUsed={state.darkPipsUsed}
            onChangeDark={n => setState(s => ({ ...s, darkPipsUsed: n }))}
            isFallen={isFallen}
          />
        )}

        {state.currentStep === 4 && (
          <ForceTargetStep
            isCombat={isCombat}
            campaignId={campaignId}
            characterId={characterId}
            selectedTargets={state.selectedTargets}
            targetContext={state.targetContext}
            onSelectTargets={targets => setState(s => ({ ...s, selectedTargets: targets }))}
            onTargetContext={ctx => setState(s => ({ ...s, targetContext: ctx }))}
          />
        )}

        {state.currentStep === 5 && state.forceRoll && selectedPower && (
          <ForceResolveStep
            powerName={selectedPower.powerName}
            powerDesc={selectedPower.description}
            forceRoll={state.forceRoll}
            darkPipsUsed={state.darkPipsUsed}
            targets={state.selectedTargets}
            targetContext={state.targetContext}
            isCombat={isCombat}
            isFallen={isFallen}
            onUseAgain={handleUseAgain}
            onDone={handleDone}
          />
        )}
      </div>

      {/* ── Footer (Next/Continue button, steps 1-4) ── */}
      {!isResolve && (
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${bdColor}`, flexShrink: 0 }}>
          <button
            onClick={goNext}
            disabled={!canAdvance() || busy}
            style={{
              width: '100%', height: 48, borderRadius: 10,
              border: 'none',
              cursor: (canAdvance() && !busy) ? 'pointer' : 'not-allowed',
              fontFamily: FONT_C, fontSize: 'clamp(0.85rem, 1.3vw, 1rem)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              background: (canAdvance() && !busy)
                ? isFallen
                  ? 'linear-gradient(135deg, rgba(139,43,226,0.35), rgba(139,43,226,0.2))'
                  : 'linear-gradient(135deg, rgba(126,200,227,0.35), rgba(126,200,227,0.2))'
                : isFallen ? 'rgba(139,43,226,0.06)' : 'rgba(126,200,227,0.06)',
              color: (canAdvance() && !busy) ? textColor : textFaintColor,
              transition: 'background 150ms',
            }}
          >
            {busy ? '…' : state.currentStep === 4 ? 'Resolve' : 'Continue'}
          </button>
        </div>
      )}
    </div>
  )
}
