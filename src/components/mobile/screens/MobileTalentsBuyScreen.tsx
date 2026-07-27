'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { buildTalentTree } from '@/lib/buildTalentTree'
import { countOwnedRanks } from '@/lib/derivedStats'
import type { TalentTreeNode } from '@/components/character/TalentTree'
import type { CharacterSpecialization, CharacterTalent, RefSpecialization, RefTalent } from '@/lib/types'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, HUD } from '@/lib/tokens'

// ── Sealed game-mechanic activation colours ──────────────────────────────────
const ACTIVATION_DOT: Record<string, string> = {
  Passive:        'var(--hud-boost)',
  Action:         '#E85A2A', /* wounds/danger — Ember Tatooine exception */
  Maneuver:       '#C8961A', /* FFG proficiency die — sealed */
  Incidental:     '#4A7A30', /* FFG ability die — sealed */
  'Out of Turn':  '#4A7A30', /* FFG ability die — sealed */
}

type ConfirmState = { talentKey: string; row: number; col: number } | null

// ── Props ─────────────────────────────────────────────────────────────────────

interface MobileTalentsBuyScreenProps {
  charSpecs:        CharacterSpecialization[]
  refSpecMap:       Record<string, RefSpecialization>
  talents:          CharacterTalent[]
  refTalentMap:     Record<string, RefTalent>
  xpAvailable:      number
  onPurchaseTalent: (talentKey: string, row: number, col: number, specKey: string) => Promise<unknown>
}

// ── Main component ────────────────────────────────────────────────────────────

export function MobileTalentsBuyScreen({
  charSpecs, refSpecMap, talents, refTalentMap, xpAvailable, onPurchaseTalent,
}: MobileTalentsBuyScreenProps) {
  const [activeSpecKey, setActiveSpecKey]     = useState<string | null>(charSpecs[0]?.specialization_key ?? null)
  const [expandedNodeKey, setExpandedNodeKey] = useState<string | null>(null)
  const [confirming, setConfirming]           = useState<ConfirmState>(null)
  const [collapsedTiers, setCollapsedTiers]   = useState<Set<number>>(new Set())
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync active spec if charSpecs changes and current key is no longer valid
  useEffect(() => {
    if (activeSpecKey && charSpecs.some(cs => cs.specialization_key === activeSpecKey)) return
    setActiveSpecKey(charSpecs[0]?.specialization_key ?? null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charSpecs])

  // Auto-cancel confirmation after 5 seconds
  useEffect(() => {
    if (!confirming) return
    if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current)
    cancelTimerRef.current = setTimeout(() => setConfirming(null), 5000)
    return () => { if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current) }
  }, [confirming])

  const treeNodes = useMemo((): TalentTreeNode[] => {
    if (!activeSpecKey) return []
    const spec = refSpecMap[activeSpecKey]
    if (!spec) return []
    const purchasedSet = new Set(
      talents
        .filter(t => t.specialization_key === activeSpecKey)
        .map(t => `${t.tree_row ?? 0}-${t.tree_col ?? 0}`)
    )
    return buildTalentTree(spec, refTalentMap, purchasedSet, talents)?.nodes ?? []
  }, [activeSpecKey, refSpecMap, talents, refTalentMap])

  // XP display colour — accent >20, gold 1-20, danger red 0
  const xpColor = xpAvailable > 20
    ? 'var(--hud-accent)'
    : xpAvailable > 0
      ? HUD.gold
      : '#E85A2A' /* wounds/danger — Ember Tatooine exception */

  async function confirmBuy(node: TalentTreeNode) {
    if (!activeSpecKey) return
    setConfirming(null)
    await onPurchaseTalent(node.talentKey, node.row, node.col, activeSpecKey)
  }

  function switchSpec(key: string) {
    setActiveSpecKey(key)
    setConfirming(null)
    setExpandedNodeKey(null)
  }

  function toggleTier(row: number) {
    setCollapsedTiers(prev => {
      const next = new Set(prev)
      next.has(row) ? next.delete(row) : next.add(row)
      return next
    })
  }

  // Nodes grouped by tier (row index)
  const tierNodes: TalentTreeNode[][] = Array.from({ length: 5 }, (_, row) =>
    treeNodes.filter(n => n.row === row)
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'baseline', gap: SP[2],
        padding: `${SP[2]} ${SP[3]}`,
        borderBottom: `1px solid var(--hud-border)`,
        background: 'var(--hud-panel)',
      }}>
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.h2, fontWeight: 700, color: xpColor,
        }}>
          {xpAvailable}
        </span>
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.overline, color: HUD.textFaint,
          letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>
          XP AVAILABLE
        </span>
      </div>

      {/* ── Spec chip bar ──────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: 'flex', gap: SP[1],
        padding: `${SP[1]} ${SP[2]}`,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        borderBottom: `1px solid var(--hud-border)`,
        background: 'var(--hud-surface-lo)',
      }}>
        {charSpecs.map(cs => {
          const ref = refSpecMap[cs.specialization_key]
          const isActive = cs.specialization_key === activeSpecKey
          const bought = talents.filter(t => t.specialization_key === cs.specialization_key).length
          const tot = ref?.talent_tree?.rows?.reduce((s, r) => s + r.talents.length, 0) ?? 0
          return (
            <button
              key={cs.specialization_key}
              onClick={() => switchSpec(cs.specialization_key)}
              style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: SP[1],
                padding: `${SP[1]} ${SP[2]}`,
                borderRadius: RADIUS.sm,
                border: `1px solid ${isActive ? 'var(--hud-accent)' : 'var(--hud-border)'}`,
                background: isActive
                  ? 'color-mix(in srgb, var(--hud-accent) 12%, transparent)'
                  : 'transparent',
                cursor: 'pointer',
              }}
            >
              <span style={{
                fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
                color: isActive ? 'var(--hud-accent)' : HUD.textDim,
                maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {ref?.name ?? cs.specialization_key}
              </span>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, flexShrink: 0 }}>
                {bought}/{tot}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Tier list ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `${SP[2]} ${SP[3]}` }}>
        {!activeSpecKey ? (
          <div style={{
            padding: SP[4], textAlign: 'center',
            fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint,
          }}>
            No specialisation selected.
          </div>
        ) : (
          tierNodes.map((nodes, row) => {
            const cost = nodes[0]?.cost ?? (row + 1) * 5
            const purchasedInTier = nodes.filter(n => n.purchased).length
            const isCollapsed = collapsedTiers.has(row)

            return (
              <div key={row} style={{ marginBottom: SP[3] }}>
                {/* Tier section header */}
                <button
                  onClick={() => toggleTier(row)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', background: 'transparent', border: 'none',
                    padding: `${SP[1]} 0`, cursor: 'pointer',
                    borderBottom: `1px solid var(--hud-border)`,
                    marginBottom: SP[1],
                  }}
                >
                  <span style={{
                    fontFamily: FONT_DISPLAY, fontSize: FS.overline, color: HUD.textFaint,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                  }}>
                    TIER {row + 1} — {cost} XP
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
                      {purchasedInTier}/{nodes.length}
                    </span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
                      {isCollapsed ? '▶' : '▼'}
                    </span>
                  </div>
                </button>

                {!isCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
                    {nodes.map(node => {
                      const nodeKey = `${node.row}-${node.col}`
                      const isConfirming = (
                        confirming?.talentKey === node.talentKey &&
                        confirming.row === node.row &&
                        confirming.col === node.col
                      )
                      const rankCount = countOwnedRanks(talents, t => t.talent_key === node.talentKey)
                      return (
                        <TalentNodeCard
                          key={nodeKey}
                          node={node}
                          cost={cost}
                          rankCount={rankCount}
                          xpAvailable={xpAvailable}
                          isExpanded={expandedNodeKey === nodeKey}
                          isConfirming={isConfirming}
                          onToggleExpand={() => setExpandedNodeKey(
                            prev => prev === nodeKey ? null : nodeKey
                          )}
                          onBuy={() => setConfirming({
                            talentKey: node.talentKey, row: node.row, col: node.col,
                          })}
                          onConfirm={() => confirmBuy(node)}
                          onCancel={() => setConfirming(null)}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── TalentNodeCard ────────────────────────────────────────────────────────────

interface TalentNodeCardProps {
  node:           TalentTreeNode
  cost:           number
  rankCount:      number
  xpAvailable:    number
  isExpanded:     boolean
  isConfirming:   boolean
  onToggleExpand: () => void
  onBuy:          () => void
  onConfirm:      () => void
  onCancel:       () => void
}

function TalentNodeCard({
  node, cost, rankCount, xpAvailable,
  isExpanded, isConfirming,
  onToggleExpand, onBuy, onConfirm, onCancel,
}: TalentNodeCardProps) {
  const dotColor   = ACTIVATION_DOT[node.activation] ?? HUD.textFaint
  const isLocked   = !node.purchased && !node.canPurchase
  const isAvail    = !node.purchased && node.canPurchase
  const canAfford  = xpAvailable >= cost

  const cardBg = node.purchased
    ? 'color-mix(in srgb, var(--hud-accent) 10%, transparent)'
    : isLocked
      ? 'color-mix(in srgb, var(--hud-accent) 1%, transparent)'
      : 'var(--hud-surface-lo)'

  const cardBorder = node.purchased
    ? 'color-mix(in srgb, var(--hud-accent) 55%, transparent)'
    : isLocked
      ? 'color-mix(in srgb, var(--hud-accent) 12%, transparent)'
      : 'color-mix(in srgb, var(--hud-accent) 22%, transparent)'

  return (
    <div style={{
      borderRadius: RADIUS.md,
      border: `${isLocked ? '1px dashed' : '1px solid'} ${cardBorder}`,
      background: cardBg,
      opacity: isLocked ? 0.42 : 1,
      overflow: 'hidden',
    }}>
      {/* Main tap row */}
      <button
        onClick={isLocked ? undefined : onToggleExpand}
        disabled={isLocked}
        style={{
          display: 'flex', alignItems: 'center', gap: SP[2],
          width: '100%', textAlign: 'left',
          background: 'transparent', border: 'none',
          padding: `${SP[2]} ${SP[2]}`,
          cursor: isLocked ? 'default' : 'pointer',
        }}
      >
        {/* Activation dot */}
        <span style={{
          width: 8, height: 8, /* fixed pip geometry */
          borderRadius: RADIUS.full,
          background: dotColor,
          flexShrink: 0,
          display: 'inline-block',
        }} />

        {/* Talent name */}
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 600,
          color: node.purchased
            ? '#C8961A' /* FFG proficiency die — sealed */
            : isLocked ? HUD.textFaint : HUD.text,
          flex: 1, minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {isLocked ? '🔒 ' : ''}{node.name}
        </span>

        {/* Right badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], flexShrink: 0 }}>
          {node.purchased && node.isRanked && (
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
              background: 'var(--hud-surface-hi)',
              borderRadius: RADIUS.sm, padding: `0 ${SP[1]}`,
            }}>
              Rank {rankCount}
            </span>
          )}
          {node.purchased && (
            <span style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.overline,
              color: '#4A7A30', /* FFG ability die — sealed */
              background: 'color-mix(in srgb, #4A7A30 15%, transparent)', /* FFG ability die — sealed */
              borderRadius: RADIUS.sm, padding: `0 ${SP[1]}`,
            }}>
              ✓ Owned
            </span>
          )}
          {!node.purchased && (
            <span style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.overline,
              color: canAfford ? HUD.gold : '#E85A2A', /* wounds/danger — Ember Tatooine exception */
            }}>
              {cost} XP
            </span>
          )}
        </div>
      </button>

      {/* Description (expanded) */}
      {isExpanded && node.description && (
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim,
          lineHeight: 1.5,
          padding: `${SP[1]} ${SP[2]} ${SP[2]}`,
          borderTop: `1px solid var(--hud-border)`,
        }}>
          {node.description}
        </div>
      )}

      {/* Buy button (available, not confirming) */}
      {isAvail && !isConfirming && (
        <div style={{ padding: `0 ${SP[2]} ${SP[2]}`, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={e => { e.stopPropagation(); onBuy() }}
            style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: `${SP[1]} ${SP[2]}`,
              borderRadius: RADIUS.sm,
              border: `1px solid color-mix(in srgb, var(--hud-accent) 45%, transparent)`,
              background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
              color: 'var(--hud-accent)',
              cursor: 'pointer',
            }}
          >
            {node.isRanked ? `Buy Rank ${rankCount + 1}` : 'Buy'}
          </button>
        </div>
      )}

      {/* Inline purchase confirmation */}
      {isConfirming && (
        <div style={{
          borderTop: `1px solid var(--hud-border)`,
          padding: SP[2],
          background: 'color-mix(in srgb, var(--hud-accent) 5%, transparent)',
        }}>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.sm,
            color: 'var(--hud-accent)', marginBottom: SP[1],
          }}>
            {node.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: SP[2], marginBottom: SP[1] }}>
            <span style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: HUD.gold,
            }}>
              {cost} XP
            </span>
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.overline,
              color: (xpAvailable - cost) >= 0
                ? '#4A7A30' /* FFG ability die — sealed */
                : '#E85A2A', /* wounds/danger — Ember Tatooine exception */
            }}>
              {xpAvailable - cost} XP remaining
            </span>
          </div>
          {node.description && (
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim,
              lineHeight: 1.4, marginBottom: SP[2],
            }}>
              {node.description}
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
                border: `1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)`,
                background: canAfford
                  ? 'color-mix(in srgb, var(--hud-accent) 15%, transparent)'
                  : 'transparent',
                color: canAfford ? 'var(--hud-accent)' : HUD.textFaint,
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
