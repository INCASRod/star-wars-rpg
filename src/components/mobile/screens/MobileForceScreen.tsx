'use client'

import { useState, useEffect, useRef } from 'react'
import { useForcePowers } from '@/hooks/useForcePowers'
import type { ForcePowerDisplay, ConflictEntry } from '@/components/player-hud/ForcePanel'
import type { ForceTreeNode } from '@/components/character/ForcePowerTree'
import type { CharacterForceAbility, ForceCommitment, RefForcePower, RefForceAbility } from '@/lib/types'
import { MobileBottomSheet } from '@/components/mobile/MobileBottomSheet'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, HUD, EASE } from '@/lib/tokens'
import { RichText } from '@/components/ui/RichText'

// ── Force purple — sealed game-mechanic consistent colour ─────────────────────
const FORCE_PURPLE     = '#8B5CF6' /* force/purple accent — mobile consistent */
const FORCE_PURPLE_BG  = 'color-mix(in srgb, #8B5CF6 10%, transparent)' /* force/purple accent — mobile consistent */
const FORCE_PURPLE_DIM = 'color-mix(in srgb, #8B5CF6 30%, transparent)' /* force/purple accent — mobile consistent */
const FORCE_PURPLE_FAINT = 'color-mix(in srgb, #8B5CF6 8%, transparent)' /* force/purple accent — mobile consistent */

const DANGER_RED     = '#E85A2A' /* wounds/danger — Ember Tatooine exception */
const DANGER_RED_BG  = 'color-mix(in srgb, #E85A2A 10%, transparent)' /* wounds/danger — Ember Tatooine exception */
const DANGER_RED_DIM = 'color-mix(in srgb, #E85A2A 35%, transparent)' /* wounds/danger — Ember Tatooine exception */

const ABILITY_GREEN     = '#4A7A30' /* FFG ability die — sealed */
const ABILITY_GREEN_BG  = 'color-mix(in srgb, #4A7A30 15%, transparent)' /* FFG ability die — sealed */

// ── Types ─────────────────────────────────────────────────────────────────────

type ForceTab = 'powers' | 'committed'

type ConfirmState = {
  abilityKey: string
  row:        number
  col:        number
  cost:       number
  powerKey:   string
} | null

// ── Props ─────────────────────────────────────────────────────────────────────

interface MobileForceScreenProps {
  forceRating:          number
  forceRatingCommitted: number
  moralityValue:        number | null | undefined
  moralityConfigured:   boolean | null | undefined
  moralityStrengthKey:  string | null | undefined
  moralityWeaknessKey:  string | null | undefined
  isFallen:             boolean
  commitments:          ForceCommitment[]
  charForceAbilities:   CharacterForceAbility[]
  refForcePowers:       RefForcePower[]
  refForceAbilityMap:   Record<string, RefForceAbility>
  refForcePowerMap:     Record<string, RefForcePower>
  conflicts:            ConflictEntry[]
  xpAvailable:          number
  onPurchaseForceAbility: (abilityKey: string, row: number, col: number, cost: number, powerKey: string) => Promise<string | undefined>
  onCancelCommit:       (powerKey: string, effectName: string) => Promise<void>
}

// ── Main component ────────────────────────────────────────────────────────────

export function MobileForceScreen({
  forceRating, forceRatingCommitted, moralityValue, moralityConfigured,
  moralityStrengthKey, moralityWeaknessKey, isFallen, commitments,
  charForceAbilities, refForcePowers, refForceAbilityMap, refForcePowerMap,
  conflicts, xpAvailable, onPurchaseForceAbility, onCancelCommit,
}: MobileForceScreenProps) {
  const [activeTab, setActiveTab]         = useState<ForceTab>('powers')
  const [expandedPower, setExpandedPower] = useState<string | null>(null)
  const [confirming, setConfirming]       = useState<ConfirmState>(null)
  const [conflictSheet, setConflictSheet] = useState<ConflictEntry | null>(null)
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-cancel confirmation after 5 seconds
  useEffect(() => {
    if (!confirming) return
    if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current)
    cancelTimerRef.current = setTimeout(() => setConfirming(null), 5000)
    return () => { if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current) }
  }, [confirming])

  // Build force power tree data — import hook, do not re-implement
  const { allForcePowers } = useForcePowers({
    charForceAbilities, refForcePowers, refForceAbilityMap, refForcePowerMap,
  })

  const purchasedPowers    = allForcePowers.filter(fp => fp.purchasedCount > 0)
  const activeCommitments  = commitments.filter(c => c.dice_count > 0)
  const unresolvedConflicts = conflicts.filter(c => !c.is_resolved)

  async function confirmPurchase() {
    if (!confirming) return
    const { abilityKey, row, col, cost, powerKey } = confirming
    setConfirming(null)
    await onPurchaseForceAbility(abilityKey, row, col, cost, powerKey)
  }

  const moralityNum = moralityValue ?? 50

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Top block: Force Rating + Morality ──────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: 'grid',
        gridTemplateColumns: moralityConfigured ? '1fr 1fr' : '1fr',
        gap: SP[2],
        padding: `${SP[2]} ${SP[3]}`,
        borderBottom: `1px solid var(--hud-border)`,
        background: 'var(--hud-panel)',
      }}>
        {/* Force Rating card */}
        <div style={{
          background: FORCE_PURPLE_FAINT,
          border: `1px solid ${FORCE_PURPLE_DIM}`,
          borderRadius: RADIUS.md,
          padding: SP[2],
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.overline,
            color: FORCE_PURPLE_DIM,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            marginBottom: SP[1],
          }}>
            FORCE RATING
          </div>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.h2, fontWeight: 700,
            color: FORCE_PURPLE,
          }}>
            {forceRating}
          </div>
          {/* Pip row: filled = available, outline = committed */}
          <div style={{
            display: 'flex', gap: '3px', justifyContent: 'center',
            marginTop: SP[1], flexWrap: 'wrap',
          }}>
            {Array.from({ length: forceRating }, (_, i) => {
              const isCommitted = i < forceRatingCommitted
              return (
                <span key={i} style={{
                  width: 8, height: 8, /* fixed pip geometry */
                  borderRadius: RADIUS.full,
                  background: isCommitted ? 'transparent' : FORCE_PURPLE,
                  border: `1px solid ${FORCE_PURPLE}`,
                  display: 'inline-block', flexShrink: 0,
                }} />
              )
            })}
          </div>
          {/* Dark side badge */}
          {isFallen && (
            <div style={{
              marginTop: SP[1],
              background: DANGER_RED_BG,
              border: `1px solid ${DANGER_RED_DIM}`,
              borderRadius: RADIUS.sm,
              padding: `1px ${SP[1]}`, /* 1px vertical — geometry minimum */
              fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
              color: DANGER_RED, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              ☠ DARK SIDE
            </div>
          )}
        </div>

        {/* Morality card — only when morality_configured */}
        {moralityConfigured && (
          <div style={{
            background: FORCE_PURPLE_FAINT,
            border: `1px solid ${FORCE_PURPLE_DIM}`,
            borderRadius: RADIUS.md,
            padding: SP[2],
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.overline,
              color: FORCE_PURPLE_DIM,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              marginBottom: SP[1],
            }}>
              MORALITY
            </div>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.h2, fontWeight: 700,
              color: moralityNum >= 50
                ? ABILITY_GREEN
                : DANGER_RED,
            }}>
              {moralityValue ?? '—'}
            </div>
            {/* Gradient bar */}
            <div style={{
              position: 'relative',
              height: 4, borderRadius: RADIUS.full,
              background: `linear-gradient(to right, ${DANGER_RED}, ${ABILITY_GREEN})`, /* sealed game-mechanic gradient */
              marginTop: SP[1], marginBottom: SP[1],
            }}>
              <div style={{
                position: 'absolute',
                top: -2, /* fixed pip geometry */
                left: `${Math.max(0, Math.min(100, moralityNum))}%`,
                transform: 'translateX(-50%)',
                width: 8, height: 8, /* fixed pip geometry */
                borderRadius: RADIUS.full,
                background: 'var(--hud-text)',
                border: `1px solid var(--hud-bg)`,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DANGER_RED }}>
                {moralityWeaknessKey ?? '—'}
              </span>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: ABILITY_GREEN }}>
                {moralityStrengthKey ?? '—'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Conflict pips — only when unresolved conflicts exist ─────────────── */}
      {unresolvedConflicts.length > 0 && (
        <div style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: SP[1],
          padding: `${SP[1]} ${SP[3]}`,
          borderBottom: `1px solid var(--hud-border)`,
        }}>
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: HUD.textFaint, marginRight: SP[1],
          }}>
            Conflicts:
          </span>
          {conflicts.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setConflictSheet(c)}
              aria-label={`Conflict ${i + 1}${c.description ? `: ${c.description}` : ''}`}
              style={{
                width: 10, height: 10, /* fixed pip geometry */
                borderRadius: RADIUS.full,
                background: c.is_resolved ? 'transparent' : FORCE_PURPLE,
                border: `1px solid ${FORCE_PURPLE}`,
                cursor: 'pointer', padding: 0, flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        borderBottom: `1px solid var(--hud-border)`,
        background: 'var(--hud-surface-lo)',
      }}>
        {(['powers', 'committed'] as const).map(tab => {
          const isActive = activeTab === tab
          const label = tab === 'powers'
            ? 'Powers'
            : `Committed (${activeCommitments.length})`
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: `${SP[2]} 0`,
                background: isActive ? FORCE_PURPLE_BG : 'transparent',
                border: 'none',
                borderBottom: isActive
                  ? `2px solid ${FORCE_PURPLE}`
                  : `2px solid transparent`,
                cursor: 'pointer',
                fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: isActive ? FORCE_PURPLE : HUD.textFaint,
                transition: `color ${EASE.quick}, background ${EASE.quick}`,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Powers tab */}
        {activeTab === 'powers' && (
          <div style={{
            padding: `${SP[2]} ${SP[3]}`,
            display: 'flex', flexDirection: 'column', gap: SP[2],
          }}>
            {purchasedPowers.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: SP[4],
                fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint,
              }}>
                No force powers.
              </div>
            ) : (
              purchasedPowers.map(power => (
                <ForcePowerCard
                  key={power.powerKey}
                  power={power}
                  isExpanded={expandedPower === power.powerKey}
                  confirming={confirming?.powerKey === power.powerKey ? confirming : null}
                  xpAvailable={xpAvailable}
                  onToggle={() => setExpandedPower(
                    prev => prev === power.powerKey ? null : power.powerKey
                  )}
                  onBuyNode={node => setConfirming({
                    abilityKey: node.abilityKey,
                    row:        node.row,
                    col:        node.col,
                    cost:       node.cost,
                    powerKey:   power.powerKey,
                  })}
                  onConfirm={confirmPurchase}
                  onCancel={() => setConfirming(null)}
                />
              ))
            )}
          </div>
        )}

        {/* Committed tab */}
        {activeTab === 'committed' && (
          <div style={{
            padding: `${SP[2]} ${SP[3]}`,
            display: 'flex', flexDirection: 'column', gap: SP[2],
          }}>
            {activeCommitments.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: SP[4],
                fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint,
              }}>
                No committed Force dice.
              </div>
            ) : (
              activeCommitments.map((c, i) => (
                <CommitmentRow
                  key={`${c.power_key}-${c.effect_name}-${i}`}
                  commitment={c}
                  onCancel={() => onCancelCommit(c.power_key, c.effect_name)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Conflict detail bottom sheet (read-only) ─────────────────────────── */}
      <MobileBottomSheet
        open={conflictSheet !== null}
        onClose={() => setConflictSheet(null)}
      >
        {conflictSheet && (
          <div style={{ paddingTop: SP[2] }}>
            {conflictSheet.session_label && (
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                color: HUD.textFaint, marginBottom: SP[1],
              }}>
                {conflictSheet.session_label}
              </div>
            )}
            {conflictSheet.description && (
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.sm,
                color: HUD.text, lineHeight: 1.5, marginBottom: SP[2],
              }}>
                {conflictSheet.description}
              </div>
            )}
            {conflictSheet.narrative && (
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.sm,
                color: HUD.textDim, lineHeight: 1.5,
              }}>
                {conflictSheet.narrative}
              </div>
            )}
          </div>
        )}
      </MobileBottomSheet>
    </div>
  )
}

// ── ForcePowerCard ────────────────────────────────────────────────────────────

interface ForcePowerCardProps {
  power:       ForcePowerDisplay
  isExpanded:  boolean
  confirming:  ConfirmState
  xpAvailable: number
  onToggle:    () => void
  onBuyNode:   (node: ForceTreeNode) => void
  onConfirm:   () => void
  onCancel:    () => void
}

function ForcePowerCard({
  power, isExpanded, confirming, xpAvailable,
  onToggle, onBuyNode, onConfirm, onCancel,
}: ForcePowerCardProps) {
  const pct = power.totalCount > 0
    ? Math.round((power.purchasedCount / power.totalCount) * 100)
    : 0
  // Actual ability slots: span > 0 means this cell is a real node, cost > 0 means purchasable
  const displayNodes = power.treeNodes.filter(n => n.span > 0 && n.cost > 0)

  return (
    <div style={{
      borderRadius: RADIUS.md,
      border: `1px solid var(--hud-border)`,
      background: 'var(--hud-surface-lo)',
      overflow: 'hidden',
    }}>
      {/* Card header (tap to expand) */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: SP[2],
          width: '100%', textAlign: 'left',
          background: 'transparent', border: 'none',
          padding: `${SP[2]} ${SP[2]}`,
          cursor: 'pointer',
        }}
      >
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
          color: HUD.text, flex: 1, minWidth: 0,
        }}>
          {power.powerName}
        </span>
        <span style={{
          fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, flexShrink: 0,
        }}>
          {power.purchasedCount}/{power.totalCount}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--hud-border)' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: FORCE_PURPLE,
          transition: `width ${EASE.panel}`,
        }} />
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ padding: `${SP[1]} ${SP[2]} ${SP[2]}` }}>
          {power.description && (
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim,
              lineHeight: 1.5, marginBottom: SP[2],
            }}>
              <RichText text={power.description} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' /* compact node list — below SP[1] floor */ }}>
            {displayNodes.map(node => (
              <AbilityNodeRow
                key={`${node.row}-${node.col}`}
                node={node}
                xpAvailable={xpAvailable}
                isConfirming={
                  confirming?.abilityKey === node.abilityKey &&
                  confirming.row === node.row &&
                  confirming.col === node.col
                }
                onBuy={() => onBuyNode(node)}
                onConfirm={onConfirm}
                onCancel={onCancel}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── AbilityNodeRow ────────────────────────────────────────────────────────────

interface AbilityNodeRowProps {
  node:         ForceTreeNode
  xpAvailable:  number
  isConfirming: boolean
  onBuy:        () => void
  onConfirm:    () => void
  onCancel:     () => void
}

function AbilityNodeRow({
  node, xpAvailable, isConfirming, onBuy, onConfirm, onCancel,
}: AbilityNodeRowProps) {
  const canAfford = xpAvailable >= node.cost
  const isLocked  = !node.purchased && !node.canPurchase

  return (
    <div style={{
      borderRadius: RADIUS.sm,
      background: node.purchased ? FORCE_PURPLE_FAINT : 'transparent',
    }}>
      {/* Main row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: SP[1],
        padding: `${SP[1]} ${SP[1]}`,
        opacity: isLocked ? 0.4 : 1,
      }}>
        {/* State pip */}
        <span style={{
          width: 8, height: 8, /* fixed pip geometry */
          borderRadius: RADIUS.full,
          background: node.purchased ? FORCE_PURPLE : 'transparent',
          border: `1px solid ${isLocked ? 'color-mix(in srgb, #8B5CF6 25%, transparent)' : FORCE_PURPLE}`, /* force/purple accent — mobile consistent */
          flexShrink: 0, display: 'inline-block',
        }} />

        {/* Name */}
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 600,
          color: isLocked ? HUD.textFaint : (node.purchased ? HUD.text : HUD.textDim),
          flex: 1, minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {isLocked ? '🔒 ' : ''}{node.name}
        </span>

        {/* Right: purchased checkmark or buy button */}
        {node.purchased && (
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: ABILITY_GREEN, flexShrink: 0,
          }}>
            ✓
          </span>
        )}
        {!node.purchased && !isLocked && !isConfirming && (
          <>
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.overline,
              color: HUD.textFaint, flexShrink: 0,
            }}>
              {node.cost} XP
            </span>
            <button
              onClick={onBuy}
              style={{
                fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: `1px ${SP[1]}`, /* 1px vertical — geometry minimum */
                borderRadius: RADIUS.sm,
                border: `1px solid color-mix(in srgb, #8B5CF6 45%, transparent)`, /* force/purple accent — mobile consistent */
                background: 'color-mix(in srgb, #8B5CF6 10%, transparent)', /* force/purple accent — mobile consistent */
                color: FORCE_PURPLE,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              Buy {node.cost} XP
            </button>
          </>
        )}
      </div>

      {/* Inline purchase confirmation */}
      {isConfirming && (
        <div style={{
          borderTop: `1px solid var(--hud-border)`,
          padding: SP[2],
          background: 'color-mix(in srgb, #8B5CF6 5%, transparent)', /* force/purple accent — mobile consistent */
        }}>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.sm,
            color: FORCE_PURPLE, marginBottom: SP[1],
          }}>
            {node.name} — {node.cost} XP
          </div>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: (xpAvailable - node.cost) >= 0 ? ABILITY_GREEN : DANGER_RED,
            marginBottom: SP[1],
          }}>
            {xpAvailable - node.cost} XP remaining after purchase
          </div>
          {node.description && (
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim,
              lineHeight: 1.4, marginBottom: SP[2],
            }}>
              <RichText text={node.description} />
            </div>
          )}
          <div style={{ display: 'flex', gap: SP[2], justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              style={{
                fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
                padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm,
                border: `1px solid var(--hud-border)`,
                background: 'transparent', color: HUD.textDim, cursor: 'pointer',
              }}
            >
              ✗ Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!canAfford}
              style={{
                fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
                padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm,
                border: `1px solid color-mix(in srgb, #8B5CF6 50%, transparent)`, /* force/purple accent — mobile consistent */
                background: canAfford
                  ? 'color-mix(in srgb, #8B5CF6 15%, transparent)' /* force/purple accent — mobile consistent */
                  : 'transparent',
                color: canAfford ? FORCE_PURPLE : HUD.textFaint,
                cursor: canAfford ? 'pointer' : 'not-allowed',
                opacity: canAfford ? 1 : 0.5,
              }}
            >
              ✓ Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── CommitmentRow ─────────────────────────────────────────────────────────────

interface CommitmentRowProps {
  commitment: ForceCommitment
  onCancel:   () => void
}

function CommitmentRow({ commitment, onCancel }: CommitmentRowProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: SP[2],
      padding: `${SP[2]} ${SP[2]}`,
      borderRadius: RADIUS.md,
      border: `1px solid var(--hud-border)`,
      background: 'var(--hud-surface-lo)',
    }}>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: HUD.text,
        }}>
          {commitment.power_name}
        </div>
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, marginTop: 1,
        }}>
          {commitment.effect_name}
        </div>
        {/* Purple pip dots for committed dice count */}
        <div style={{ display: 'flex', gap: '3px', marginTop: SP[1] }}>
          {Array.from({ length: commitment.dice_count }, (_, i) => (
            <span key={i} style={{
              width: 8, height: 8, /* fixed pip geometry */
              borderRadius: RADIUS.full,
              background: FORCE_PURPLE,
              display: 'inline-block', flexShrink: 0,
            }} />
          ))}
        </div>
      </div>

      {/* Cancel button */}
      <button
        onClick={onCancel}
        style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm,
          border: `1px solid ${DANGER_RED_DIM}`,
          background: DANGER_RED_BG,
          color: DANGER_RED,
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        Cancel
      </button>
    </div>
  )
}
