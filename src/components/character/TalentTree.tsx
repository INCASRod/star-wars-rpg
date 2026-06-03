'use client'

import { useState } from 'react'
import { RichText } from '@/components/ui/RichText'
import { HUD, FS, FONT_BODY, FONT_DISPLAY, RADIUS, Z, EASE } from '@/lib/tokens'
import { Modal } from '@/components/ui/Modal'

/* ═══════════════════════════════════════════════════════ */
/*  DESIGN TOKENS                                         */
/* ═══════════════════════════════════════════════════════ */

// All font references use FONT_BODY (JetBrains Mono) per design system rules.
// FC (formerly var(--font-body)) and FR (formerly var(--font-body)) unified.
const FR = FONT_BODY

const BG        = HUD.bg
const TEXT      = HUD.text
const DIM       = HUD.textDim
const FAINT     = HUD.textFaint
const BORDER    = HUD.border
const PANEL_BG  = 'var(--hud-surface-lo)'
const GOLD_BR   = HUD.gold
// GOLD_DIM: dimmed accent at ~45% opacity — no HUD named property, use CSS var
const GOLD_DIM  = 'color-mix(in srgb, var(--hud-accent) 45%, transparent)'

// Activation type colours — pre-approved hex exceptions: no CSS vars exist for
// these specific asset/state colours (BLUE, GREEN, RED, ORANGE). Kept as-is per
// the pre-approved hex exception rule for type-identity swatches.
const BLUE   = '#5AAAE0'
const GREEN  = '#4EC87A'
const RED    = '#E05050'
const ORANGE = '#E07855'

/* ═══════════════════════════════════════════════════════ */
/*  EXPORTED TYPES                                        */
/* ═══════════════════════════════════════════════════════ */

export interface TalentTreeNode {
  talentKey: string
  name: string
  description?: string
  row: number
  col: number
  purchased: boolean
  activation: string   // 'Passive' | 'Action' | 'Maneuver' | 'Incidental' | 'Incidental (OOT)'
  isRanked: boolean
  canPurchase: boolean
}

export interface TalentTreeConnection {
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
}

export interface TalentTreeProps {
  specName: string
  nodes: TalentTreeNode[]
  connections: TalentTreeConnection[]
  onPurchase?: (talentKey: string, row: number, col: number) => void
  onRemoveTalent?: (talentKey: string, xpCost: number) => void
  isGmMode?: boolean
  xpAvailable?: number
  /** Read-only preview: all nodes shown as available, no purchase flow */
  previewMode?: boolean
}

/* ═══════════════════════════════════════════════════════ */
/*  CONSTANTS                                             */
/* ═══════════════════════════════════════════════════════ */

const ROW_COSTS = [5, 10, 15, 20, 25]

const ACTIVATION_COLORS: Record<string, string> = {
  'Passive': BLUE,
  'Action': RED,
  'Maneuver': ORANGE,
  'Incidental': GREEN,
  'Incidental (OOT)': GREEN,
}

// viewBox geometry (5 rows × 160px = 800px tall)
const COL_CENTERS = [100, 300, 500, 700]
const ROW_CENTERS = [80, 240, 400, 560, 720]
const NODE_HALF_W = 92
const NODE_HALF_H = 68

/* ═══════════════════════════════════════════════════════ */
/*  ACTIVATION DOT                                        */
/* ═══════════════════════════════════════════════════════ */

function ActivationDot({ activation, dim }: { activation: string; dim?: boolean }) {
  const color = ACTIVATION_COLORS[activation] ?? DIM
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: RADIUS.full,
        background: color,
        opacity: dim ? 0.4 : 1,
        flexShrink: 0,
      }}
    />
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  NODE CARD                                             */
/* ═══════════════════════════════════════════════════════ */

function NodeCard({
  node,
  xpAvailable,
  isGmMode,
  onClickAvailable,
  onClickRemove,
  onClickLocked,
  previewMode,
}: {
  node: TalentTreeNode
  xpAvailable?: number
  isGmMode?: boolean
  onClickAvailable: (n: TalentTreeNode) => void
  onClickRemove: (n: TalentTreeNode) => void
  onClickLocked: (n: TalentTreeNode) => void
  previewMode?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  const cost = ROW_COSTS[node.row]
  const actColor = ACTIVATION_COLORS[node.activation] ?? DIM

  if (node.purchased) {
    /* ── PURCHASED ── */
    return (
      <div
        style={{
          borderRadius: RADIUS.md,
          padding: '8px 10px',
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          overflow: 'hidden',
          background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
          border: '1.5px solid color-mix(in srgb, var(--hud-accent) 55%, transparent)',
          boxShadow: '0 0 14px color-mix(in srgb, var(--hud-accent) 12%, transparent), inset 0 1px 0 color-mix(in srgb, var(--hud-accent) 18%, transparent)',
        }}
      >
        {/* Top-right owned badge */}
        <div
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            // rgba(78,200,122,*) — GREEN identity swatch, pre-approved
            background: 'rgba(78,200,122,0.15)',
            border: '1px solid rgba(78,200,122,0.4)',
            borderRadius: RADIUS.sm,
            padding: '1px 5px',
            fontFamily: FR,
            fontSize: FS.overline,
            fontWeight: 700,
            color: GREEN,
            lineHeight: 1.4,
          }}
        >
          ✓ Owned
        </div>

        {/* Name */}
        <div
          style={{
            fontFamily: FR,
            fontSize: FS.sm,
            fontWeight: 700,
            color: GOLD_BR,
            lineHeight: 1.25,
            paddingRight: 44,
          }}
        >
          {node.name}
        </div>

        {/* Activation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ActivationDot activation={node.activation} />
          <span
            style={{
              fontFamily: FR,
              fontSize: FS.label,
              fontWeight: 700,
              color: actColor,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {node.activation}
          </span>
        </div>

        {/* Ranked dots */}
        {node.isRanked && (
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2].map(i => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: RADIUS.full,
                  background: i === 0 ? HUD.gold : 'color-mix(in srgb, var(--hud-accent) 20%, transparent)',
                  border: `1px solid ${HUD.gold}`,
                  boxShadow: i === 0 ? `0 0 4px ${HUD.gold}` : 'none',
                }}
              />
            ))}
          </div>
        )}

        {/* Description */}
        {node.description && (
          <div
            style={{
              fontFamily: FR,
              fontSize: FS.label,
              color: DIM,
              lineHeight: 1.5,
              overflowY: 'auto',
              fontWeight: 600,
              flex: 1,
              minHeight: 0,
            }}
          >
            <RichText text={node.description} />
          </div>
        )}

        {/* Row cost bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: 5,
            right: 6,
            fontFamily: FR,
            fontSize: FS.overline,
            color: FAINT,
          }}
        >
          {cost} XP
        </div>

        {/* GM remove button */}
        {isGmMode && (
          <button
            onClick={e => { e.stopPropagation(); onClickRemove(node) }}
            style={{
              position: 'absolute',
              bottom: 4,
              left: 4,
              width: 16,
              height: 16,
              borderRadius: RADIUS.sm,
              // rgba(224,80,80,*) — RED identity swatch, pre-approved
              border: '1px solid rgba(224,80,80,0.5)',
              background: 'rgba(224,80,80,0.12)',
              color: RED,
              fontSize: FS.overline,
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            ×
          </button>
        )}
      </div>
    )
  }

  if (previewMode || node.canPurchase) {
    /* ── AVAILABLE (or preview) ── */
    return (
      <div
        onClick={() => previewMode ? onClickLocked(node) : onClickAvailable(node)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: RADIUS.md,
          padding: '8px 10px',
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontWeight: 600,
          gap: 4,
          overflow: 'hidden',
          background: hovered ? 'color-mix(in srgb, var(--hud-accent) 7%, transparent)' : 'color-mix(in srgb, var(--hud-accent) 2%, transparent)',
          border: `1.5px solid ${hovered ? 'color-mix(in srgb, var(--hud-accent) 50%, transparent)' : 'color-mix(in srgb, var(--hud-accent) 22%, transparent)'}`,
          cursor: 'pointer',
          transition: EASE.default,
        }}
      >
        {/* Cost badge */}
        <div
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            background: 'var(--hud-surface-lo)',
            border: `1px solid ${HUD.border}`,
            borderRadius: RADIUS.sm,
            padding: '1px 5px',
            fontFamily: FR,
            fontSize: FS.overline,
            color: GOLD_DIM,
            lineHeight: 1.4,
          }}
        >
          {cost} XP
        </div>

        {/* Name */}
        <div
          style={{
            fontFamily: FR,
            fontSize: FS.sm,
            fontWeight: 700,
            color: TEXT,
            lineHeight: 1.25,
            paddingRight: 44,
          }}
        >
          {node.name}
        </div>

        {/* Activation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ActivationDot activation={node.activation} />
          <span
            style={{
              fontFamily: FR,
              fontSize: FS.label,
              color: actColor,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {node.activation}
          </span>
        </div>

        {/* Description */}
        {node.description && (
          <div
            style={{
              fontFamily: FR,
              fontSize: FS.label,
              color: DIM,
              lineHeight: 1.5,
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
            }}
          >
            <RichText text={node.description} />
          </div>
        )}
      </div>
    )
  }

  /* ── LOCKED ── hoverable for preview, not purchasable */
  return (
    <div
      onClick={() => onClickLocked(node)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: RADIUS.md,
        padding: '8px 10px',
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        overflow: 'hidden',
        background: hovered ? 'color-mix(in srgb, var(--hud-accent) 6%, transparent)' : 'color-mix(in srgb, var(--hud-accent) 1%, transparent)',
        border: hovered ? '1px dashed color-mix(in srgb, var(--hud-accent) 22%, transparent)' : '1px dashed color-mix(in srgb, var(--hud-accent) 12%, transparent)',
        opacity: hovered ? 0.82 : 0.42,
        cursor: 'pointer',
        transition: EASE.default,
      }}
    >
      {/* Locked badge */}
      <div style={{
        position: 'absolute', top: 5, right: 5,
        fontFamily: FR, fontSize: FS.overline, color: FAINT,
        letterSpacing: '0.06em',
      }}>
        🔒 {ROW_COSTS[node.row]} XP
      </div>

      {/* Name */}
      <div style={{
        fontFamily: FR, fontSize: FS.label, fontWeight: 700,
        color: hovered ? TEXT : FAINT,
        lineHeight: 1.25, paddingRight: 52,
        transition: `color ${EASE.default}`,
      }}>
        {node.name}
      </div>

      {/* Activation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <ActivationDot activation={node.activation} dim={!hovered} />
        <span style={{
          fontFamily: FR, fontSize: FS.label,
          color: hovered ? (ACTIVATION_COLORS[node.activation] ?? DIM) : FAINT,
          textTransform: 'uppercase', letterSpacing: '0.04em',
          transition: `color ${EASE.default}`,
        }}>
          {node.activation}
        </span>
      </div>

      {/* Description — always present, opacity transitions on hover */}
      {node.description && (
        <div style={{
          fontFamily: FR, fontSize: FS.label,
          color: DIM, lineHeight: 1.5,
          overflowY: 'auto', flex: 1, minHeight: 0,
          opacity: hovered ? 0.9 : 0.5,
          transition: `opacity ${EASE.default}`,
        }}>
          <RichText text={node.description} />
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  PURCHASE POPOVER                                      */
/* ═══════════════════════════════════════════════════════ */

function PurchasePopover({
  node,
  xpAvailable,
  onConfirm,
  onCancel,
}: {
  node: TalentTreeNode
  xpAvailable?: number
  onConfirm: () => void
  onCancel: () => void
}) {
  const cost = ROW_COSTS[node.row]
  const remaining = (xpAvailable ?? 0) - cost
  const canAfford = xpAvailable === undefined || xpAvailable >= cost

  return (
    <Modal
      open
      onClose={onCancel}
      maxWidth={320}
      zIndex={500}
      backdrop="rgba(0,0,0,0.4)"
      borderColor="color-mix(in srgb, var(--hud-accent) 50%, transparent)"
      shadow="0 8px 32px rgba(0,0,0,0.7)"
      panelBackground="var(--hud-surface-hi)"
    >
      <div style={{ padding: '14px 16px' }}>
        {/* Title */}
        <div
          style={{
            fontFamily: FR,
            fontSize: FS.sm,
            color: HUD.gold,
            marginBottom: 4,
          }}
        >
          {node.name}
          {node.isRanked && (
            <span style={{ fontFamily: FR, fontSize: FS.label, color: DIM, marginLeft: 6 }}>
              · Rank 1
            </span>
          )}
        </div>

        {/* Cost line */}
        <div style={{ fontFamily: FR, fontSize: FS.label, color: DIM, marginBottom: 2 }}>
          Spend {cost} XP
        </div>

        {/* Remaining */}
        {xpAvailable !== undefined && (
          <div
            style={{
              fontFamily: FR,
              fontSize: FS.label,
              color: remaining >= 0 ? GREEN : RED,
              marginBottom: 10,
            }}
          >
            Remaining after: {remaining} XP
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: HUD.border, marginBottom: 10 }} />

        {/* Description */}
        {node.description && (
          <div
            style={{
              fontFamily: FR,
              fontSize: FS.label,
              color: DIM,
              lineHeight: 1.5,
              maxHeight: 100,
              overflowY: 'auto',
              marginBottom: 10,
            }}
          >
            <RichText text={node.description} />
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: HUD.border, marginBottom: 10 }} />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              borderRadius: RADIUS.sm,
              fontFamily: FR,
              fontSize: FS.label,
              color: DIM,
              padding: '6px 16px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={canAfford ? onConfirm : undefined}
            disabled={!canAfford}
            style={{
              background: 'color-mix(in srgb, var(--hud-accent) 15%, transparent)',
              border: '1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)',
              borderRadius: RADIUS.sm,
              fontFamily: FR,
              fontSize: FS.label,
              fontWeight: 700,
              color: canAfford ? HUD.gold : GOLD_DIM,
              padding: '6px 16px',
              cursor: canAfford ? 'pointer' : 'not-allowed',
              opacity: canAfford ? 1 : 0.5,
            }}
          >
            Spend {cost} XP
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  LOCKED PREVIEW POPOVER                                */
/* ═══════════════════════════════════════════════════════ */

function LockedInfoPopover({
  node,
  onClose,
  isPreview,
}: {
  node: TalentTreeNode
  onClose: () => void
  isPreview?: boolean
}) {
  const cost = ROW_COSTS[node.row]
  const actColor = ACTIVATION_COLORS[node.activation] ?? DIM

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth={320}
      zIndex={500}
      backdrop="rgba(0,0,0,0.4)"
      borderColor={HUD.border}
      shadow="0 8px 32px rgba(0,0,0,0.7)"
      panelBackground="var(--hud-surface-hi)"
    >
      <div style={{ padding: '14px 16px' }}>
        {/* Locked / Preview banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: isPreview ? 'var(--hud-surface-lo)' : 'transparent',
          border: `1px solid ${HUD.border}`,
          borderRadius: RADIUS.md, padding: '5px 10px',
          marginBottom: 10,
        }}>
          <span style={{ fontSize: FS.label }}>{isPreview ? '👁' : '🔒'}</span>
          <span style={{ fontFamily: FR, fontSize: FS.label, fontWeight: 700, color: isPreview ? HUD.gold : FAINT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {isPreview ? 'Spec Preview — read-only' : 'Locked — purchase adjacent talents first'}
          </span>
        </div>

        {/* Name */}
        <div style={{ fontFamily: FR, fontSize: FS.sm, color: TEXT, marginBottom: 4 }}>
          {node.name}
          {node.isRanked && (
            <span style={{ fontFamily: FR, fontSize: FS.label, color: DIM, marginLeft: 6 }}>· Ranked</span>
          )}
        </div>

        {/* Activation + cost */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ActivationDot activation={node.activation} />
            <span style={{ fontFamily: FR, fontSize: FS.label, color: actColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {node.activation}
            </span>
          </div>
          <span style={{ fontFamily: FR, fontSize: FS.label, color: GOLD_DIM, marginLeft: 'auto' }}>{cost} XP when unlocked</span>
        </div>

        <div style={{ height: 1, background: HUD.border, marginBottom: 10 }} />

        {/* Description */}
        {node.description ? (
          <div style={{
            fontFamily: FR, fontSize: FS.label, color: DIM,
            lineHeight: 1.5, maxHeight: 140, overflowY: 'auto', marginBottom: 12,
          }}>
            <RichText text={node.description} />
          </div>
        ) : (
          <div style={{ fontFamily: FR, fontSize: FS.label, color: FAINT, fontStyle: 'italic', marginBottom: 12 }}>
            No description available.
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%', background: 'transparent',
            border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm,
            fontFamily: FR, fontSize: FS.label, color: DIM,
            padding: '6px 16px', cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </Modal>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  SVG CONNECTION LINES                                  */
/* ═══════════════════════════════════════════════════════ */

function ConnectionLines({
  connections,
  nodeMap,
}: {
  connections: TalentTreeConnection[]
  nodeMap: Map<string, TalentTreeNode>
}) {
  return (
    <svg
      viewBox="0 0 800 800"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: Z.base,
      }}
    >
      <defs>
        <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {connections.map((conn, i) => {
        const fromNode = nodeMap.get(`${conn.fromRow}-${conn.fromCol}`)
        const toNode = nodeMap.get(`${conn.toRow}-${conn.toCol}`)
        const bothPurchased = !!(fromNode?.purchased && toNode?.purchased)
        const onePurchased = !!(fromNode?.purchased || toNode?.purchased)

        const stroke = bothPurchased ? 'color-mix(in srgb, var(--hud-accent) 70%, transparent)' : onePurchased ? 'color-mix(in srgb, var(--hud-accent) 35%, transparent)' : 'color-mix(in srgb, var(--hud-accent) 15%, transparent)'
        const strokeWidth = bothPurchased ? 2 : 1.5
        const filter = bothPurchased ? 'url(#glow-line)' : undefined

        const isHorizontal = conn.fromRow === conn.toRow
        const isVertical = conn.fromCol === conn.toCol

        let x1: number, y1: number, x2: number, y2: number

        if (isHorizontal) {
          const rowCenter = ROW_CENTERS[conn.fromRow]
          x1 = COL_CENTERS[conn.fromCol] + NODE_HALF_W
          x2 = COL_CENTERS[conn.toCol] - NODE_HALF_W
          y1 = rowCenter
          y2 = rowCenter
        } else if (isVertical) {
          const colCenter = COL_CENTERS[conn.fromCol]
          x1 = colCenter
          x2 = colCenter
          y1 = ROW_CENTERS[conn.fromRow] + NODE_HALF_H
          y2 = ROW_CENTERS[conn.toRow] - NODE_HALF_H
        } else {
          // diagonal — connect edge midpoints
          x1 = COL_CENTERS[conn.fromCol]
          y1 = ROW_CENTERS[conn.fromRow] + NODE_HALF_H
          x2 = COL_CENTERS[conn.toCol]
          y2 = ROW_CENTERS[conn.toRow] - NODE_HALF_H
        }

        return (
          <line
            key={i}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter={filter}
          />
        )
      })}
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  MAIN TALENT TREE COMPONENT                            */
/* ═══════════════════════════════════════════════════════ */

export function TalentTree({
  specName,
  nodes,
  connections,
  onPurchase,
  onRemoveTalent,
  isGmMode,
  xpAvailable,
  previewMode,
}: TalentTreeProps) {
  const [pendingNode, setPendingNode]       = useState<TalentTreeNode | null>(null)
  const [lockedPreview, setLockedPreview]   = useState<TalentTreeNode | null>(null)
  const nodeMap = new Map<string, TalentTreeNode>()
  for (const node of nodes) {
    nodeMap.set(`${node.row}-${node.col}`, node)
  }

  const handleConfirm = () => {
    if (pendingNode && onPurchase) {
      onPurchase(pendingNode.talentKey, pendingNode.row, pendingNode.col)
    }
    setPendingNode(null)
  }

  return (
    <div
      style={{
        background: BG,
        border: `1px solid ${BORDER}`,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        fontFamily: FR,
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          background: PANEL_BG,
          borderBottom: `1px solid ${BORDER}`,
          padding: '12px 16px',
          fontWeight: 700,
        }}
      >
        <div style={{ fontFamily: FR, fontSize: FS.sm, color: HUD.gold, lineHeight: 1.3 }}>
          {specName}
        </div>
        <div style={{ fontFamily: FR, fontSize: FS.label, color: DIM, marginTop: 2 }}>
          Specialization Tree · {nodes.length} Talents
        </div>
      </div>

      {/* ── LEGEND ── */}
      <div
        style={{
          background: 'var(--hud-surface-lo)',
          padding: '8px 16px',
          display: 'flex',
          fontWeight: 600,
          gap: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* State legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              background: HUD.gold,
            }}
          />
          <span style={{ fontFamily: FR, fontSize: FS.label, color: DIM }}>Purchased</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              background: 'transparent',
              border: `1px solid ${HUD.gold}`,
            }}
          />
          <span style={{ fontFamily: FR, fontSize: FS.label, color: DIM }}>Available</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              background: 'color-mix(in srgb, var(--hud-accent) 15%, transparent)',
              border: '1px dashed color-mix(in srgb, var(--hud-accent) 30%, transparent)',
              opacity: 0.5,
            }}
          />
          <span style={{ fontFamily: FR, fontSize: FS.label, color: DIM }}>Locked (click to preview)</span>
        </div>

        {/* Type legend */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Passive', color: BLUE },
            { label: 'Action', color: RED },
            { label: 'Maneuver', color: ORANGE },
            { label: 'Incidental', color: GREEN },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: RADIUS.full,
                  background: color,
                }}
              />
              <span style={{ fontFamily: FR, fontSize: FS.label, color: DIM }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── GRID + SVG ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'visible',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(5, 160px)',
          gap: 0,
        }}
      >
        {/* Static connection lines (always visible) */}
        <ConnectionLines connections={connections} nodeMap={nodeMap} />

        {/* Nodes */}
        {Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 4 }, (_, col) => {
            const node = nodeMap.get(`${row}-${col}`)
            return (
              <div
                key={`${row}-${col}`}
                style={{
                  position: 'relative',
                  padding: 10,
                  zIndex: Z.raised,
                  display: 'flex',
                  alignItems: 'stretch',
                  justifyContent: 'stretch',
                }}
              >
                {node ? (
                  <NodeCard
                    node={node}
                    xpAvailable={xpAvailable}
                    isGmMode={isGmMode}
                    previewMode={previewMode}
                    onClickAvailable={n => setPendingNode(n)}
                    onClickLocked={n => setLockedPreview(n)}
                    onClickRemove={n => {
                      if (onRemoveTalent) {
                        onRemoveTalent(n.talentKey, ROW_COSTS[n.row])
                      }
                    }}
                  />
                ) : (
                  /* Empty cell */
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: RADIUS.md,
                      border: `1px dashed ${FAINT}`,
                      opacity: 0.3,
                    }}
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── PURCHASE POPOVER ── */}
      {pendingNode && (
        <PurchasePopover
          node={pendingNode}
          xpAvailable={xpAvailable}
          onConfirm={handleConfirm}
          onCancel={() => setPendingNode(null)}
        />
      )}

      {/* ── LOCKED PREVIEW POPOVER ── */}
      {lockedPreview && (
        <LockedInfoPopover
          node={lockedPreview}
          onClose={() => setLockedPreview(null)}
          isPreview={previewMode}
        />
      )}
    </div >
  )
}
