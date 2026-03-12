'use client'

import { useState, useRef } from 'react'
import { FS_OVERLINE, FS_LABEL, FS_SM } from '@/components/player-hud/design-tokens'

/* ═══════════════════════════════════════════════════════ */
/*  DESIGN TOKENS                                         */
/* ═══════════════════════════════════════════════════════ */

const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FR = "var(--font-rajdhani), 'Rajdhani', sans-serif"

const BG = '#060D09'
const GOLD = '#C8AA50'
const GOLD_DIM = '#7A6830'
const GOLD_BR = '#E0C060'
const TEXT = '#C8D8C0'
const DIM = '#6A8070'
const FAINT = '#2A3A2E'
const BORDER = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const BLUE = '#5AAAE0'
const GREEN = '#4EC87A'
const RED = '#E05050'
const ORANGE = '#E07855'
const PANEL_BG = 'rgba(8,16,10,0.88)'

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
        borderRadius: '50%',
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
}: {
  node: TalentTreeNode
  xpAvailable?: number
  isGmMode?: boolean
  onClickAvailable: (n: TalentTreeNode) => void
  onClickRemove: (n: TalentTreeNode) => void
}) {
  const [hovered, setHovered] = useState(false)

  const cost = ROW_COSTS[node.row]
  const actColor = ACTIVATION_COLORS[node.activation] ?? DIM

  if (node.purchased) {
    /* ── PURCHASED ── */
    return (
      <div
        style={{
          borderRadius: 4,
          padding: '8px 10px',
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          overflow: 'hidden',
          background: 'rgba(200,170,80,0.10)',
          border: '1.5px solid rgba(200,170,80,0.55)',
          boxShadow: '0 0 14px rgba(200,170,80,0.12), inset 0 1px 0 rgba(200,170,80,0.18)',
        }}
      >
        {/* Top-right owned badge */}
        <div
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            background: 'rgba(78,200,122,0.15)',
            border: '1px solid rgba(78,200,122,0.4)',
            borderRadius: 3,
            padding: '1px 5px',
            fontFamily: FR,
            fontSize: FS_OVERLINE,
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
            fontSize: FS_SM,
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
              fontSize: FS_LABEL,
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
                  borderRadius: '50%',
                  background: i === 0 ? GOLD : 'rgba(200,170,80,0.2)',
                  border: `1px solid ${GOLD}`,
                  boxShadow: i === 0 ? `0 0 4px ${GOLD}` : 'none',
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
              fontSize: FS_LABEL,
              color: DIM,
              lineHeight: 1.5,
              overflowY: 'auto',
              fontWeight: 600,
              flex: 1,
              minHeight: 0,
            }}
          >
            {node.description}
          </div>
        )}

        {/* Row cost bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: 5,
            right: 6,
            fontFamily: FR,
            fontSize: FS_OVERLINE,
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
              borderRadius: 2,
              border: '1px solid rgba(224,80,80,0.5)',
              background: 'rgba(224,80,80,0.12)',
              color: RED,
              fontSize: 10,
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

  if (node.canPurchase) {
    /* ── AVAILABLE ── */
    return (
      <div
        onClick={() => onClickAvailable(node)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 4,
          padding: '8px 10px',
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontWeight: 600,
          gap: 4,
          overflow: 'hidden',
          background: hovered ? 'rgba(200,170,80,0.07)' : 'rgba(255,255,255,0.03)',
          border: `1.5px solid ${hovered ? 'rgba(200,170,80,0.5)' : 'rgba(200,170,80,0.22)'}`,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {/* Cost badge */}
        <div
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            background: 'rgba(200,170,80,0.08)',
            border: '1px solid rgba(200,170,80,0.3)',
            borderRadius: 3,
            padding: '1px 5px',
            fontFamily: FR,
            fontSize: FS_OVERLINE,
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
            fontSize: FS_SM,
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
              fontSize: FS_LABEL,
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
              fontSize: FS_LABEL,
              color: DIM,
              lineHeight: 1.5,
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
            }}
          >
            {node.description}
          </div>
        )}
      </div>
    )
  }

  /* ── LOCKED ── */
  return (
    <div
      style={{
        borderRadius: 4,
        padding: '8px 10px',
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.015)',
        border: '1px dashed rgba(255,255,255,0.08)',
        opacity: 0.5,
      }}
    >
      {/* Name only */}
      <div
        style={{
          fontFamily: FR,
          fontSize: FS_LABEL,
          color: FAINT,
          lineHeight: 1.25,
        }}
      >
        {node.name}
      </div>

      {/* Activation dim */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <ActivationDot activation={node.activation} dim />
        <span
          style={{
            fontFamily: FR,
            fontSize: FS_LABEL,
            color: FAINT,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {node.activation}
        </span>
      </div>
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
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 499,
          background: 'rgba(0,0,0,0.4)',
          cursor: 'pointer',
        }}
      />

      {/* Popover */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 500,
          background: 'rgba(8,16,10,0.98)',
          border: '1px solid rgba(200,170,80,0.5)',
          borderRadius: 6,
          padding: '14px 16px',
          minWidth: 280,
          maxWidth: 320,
          boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,170,80,0.1)',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: FC,
            fontSize: FS_SM,
            color: GOLD,
            marginBottom: 4,
          }}
        >
          {node.name}
          {node.isRanked && (
            <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM, marginLeft: 6 }}>
              · Rank 1
            </span>
          )}
        </div>

        {/* Cost line */}
        <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM, marginBottom: 2 }}>
          Spend {cost} XP
        </div>

        {/* Remaining */}
        {xpAvailable !== undefined && (
          <div
            style={{
              fontFamily: FR,
              fontSize: FS_LABEL,
              color: remaining >= 0 ? GREEN : RED,
              marginBottom: 10,
            }}
          >
            Remaining after: {remaining} XP
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(200,170,80,0.15)', marginBottom: 10 }} />

        {/* Description */}
        {node.description && (
          <div
            style={{
              fontFamily: FR,
              fontSize: FS_LABEL,
              color: DIM,
              lineHeight: 1.5,
              maxHeight: 100,
              overflowY: 'auto',
              marginBottom: 10,
            }}
          >
            {node.description}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(200,170,80,0.15)', marginBottom: 10 }} />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              borderRadius: 3,
              fontFamily: FR,
              fontSize: FS_LABEL,
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
              background: 'rgba(200,170,80,0.15)',
              border: '1px solid rgba(200,170,80,0.5)',
              borderRadius: 3,
              fontFamily: FR,
              fontSize: FS_LABEL,
              fontWeight: 700,
              color: canAfford ? GOLD : GOLD_DIM,
              padding: '6px 16px',
              cursor: canAfford ? 'pointer' : 'not-allowed',
              opacity: canAfford ? 1 : 0.5,
            }}
          >
            Spend {cost} XP
          </button>
        </div>
      </div>
    </>
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
        zIndex: 0,
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

        const stroke = bothPurchased ? 'rgba(200,170,80,0.7)' : onePurchased ? 'rgba(200,170,80,0.35)' : 'rgba(200,170,80,0.15)'
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
}: TalentTreeProps) {
  const [pendingNode, setPendingNode] = useState<TalentTreeNode | null>(null)

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
        borderRadius: 6,
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
          display: 'flex',
          alignItems: 'center',
          fontWeight: 700,
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontFamily: FC, fontSize: FS_SM, color: GOLD, lineHeight: 1.3 }}>
            {specName}
          </div>
          <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM, marginTop: 2 }}>
            Specialization Tree · {nodes.length} Talents
          </div>
        </div>

        {xpAvailable !== undefined && (
          <div
            style={{
              background: 'rgba(200,170,80,0.1)',
              border: '1px solid rgba(200,170,80,0.3)',
              borderRadius: 3,
              padding: '2px 10px',
              fontFamily: FC,
              fontSize: FS_LABEL,
              color: GOLD,
            }}
          >
            {xpAvailable} XP
          </div>
        )}
      </div>

      {/* ── LEGEND ── */}
      <div
        style={{
          background: 'rgba(0,0,0,0.2)',
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
              background: GOLD,
            }}
          />
          <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM }}>Purchased</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              background: 'transparent',
              border: `1px solid ${GOLD}`,
            }}
          />
          <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM }}>Available</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              background: 'rgba(200,170,80,0.15)',
              border: '1px dashed rgba(200,170,80,0.3)',
              opacity: 0.5,
            }}
          />
          <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM }}>Locked</span>
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
                  borderRadius: '50%',
                  background: color,
                }}
              />
              <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM }}>{label}</span>
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
        {/* SVG overlay */}
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
                  zIndex: 1,
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
                    onClickAvailable={n => setPendingNode(n)}
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
                      borderRadius: 4,
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
      {
        pendingNode && (
          <PurchasePopover
            node={pendingNode}
            xpAvailable={xpAvailable}
            onConfirm={handleConfirm}
            onCancel={() => setPendingNode(null)}
          />
        )
      }
    </div >
  )
}
