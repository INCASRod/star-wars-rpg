'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { MarkupText } from '@/components/ui/MarkupText'
import { HUD, FS, FONT_BODY, RADIUS, Z, EASE } from '@/lib/tokens'
import { Modal } from '@/components/ui/Modal'

/* ═══════════════════════════════════════════════════════ */
/*  THEME CONSTANTS                                       */
/* ═══════════════════════════════════════════════════════ */

const BG       = HUD.bg
// GOLD_DIM: faint text used for locked-state XP label; maps to textFaint token
const GOLD_DIM = HUD.textFaint
const GOLD_BR  = HUD.gold
const TEXT     = HUD.text
const DIM      = HUD.textDim
// FAINT was 'var(--hud-border-hi)' in original — maps to HUD.borderHi
const FAINT    = HUD.borderHi
const BORDER   = HUD.border
// Pre-approved hex exceptions: no CSS vars for these specific type-identity swatches
const BLUE     = '#5AAAE0'
const GREEN    = '#4EC87A'
const RED      = '#E05050'
const PANEL_BG = 'var(--hud-surface-lo)'

/* ═══════════════════════════════════════════════════════ */
/*  TYPES                                                 */
/* ═══════════════════════════════════════════════════════ */

export interface ForceTreeNode {
  abilityKey: string
  name: string
  description?: string
  row: number
  col: number
  span: number      // how many columns this cell spans (0 = covered by neighbor)
  cost: number       // XP cost for this cell
  purchased: boolean
  canPurchase: boolean
}

export interface ForceTreeConnection {
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
}

export interface ForcePowerTreeProps {
  powerName: string
  nodes: ForceTreeNode[]
  connections: ForceTreeConnection[]
  onPurchase?: (abilityKey: string, row: number, col: number, cost: number) => void
  xpAvailable?: number
  purchasedCount: number
  totalCount: number
}

const COLS = 4

/* ═══════════════════════════════════════════════════════ */
/*  PURCHASE POPOVER                                      */
/* ═══════════════════════════════════════════════════════ */

function PurchasePopover({ node, xpAvailable, onConfirm, onCancel }: {
  node: ForceTreeNode
  xpAvailable?: number
  onConfirm: () => void
  onCancel: () => void
}) {
  const remaining = (xpAvailable ?? 0) - node.cost
  const canAfford = xpAvailable === undefined || xpAvailable >= node.cost
  return (
    <Modal
      open
      onClose={onCancel}
      maxWidth={320}
      zIndex={500}
      backdrop="rgba(0,0,0,0.4)"
      borderColor={HUD.borderHi}
      shadow="0 8px 32px rgba(0,0,0,0.7)"
      panelBackground="var(--hud-surface-hi)"
    >
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.gold, marginBottom: 4 }}>
          {node.name}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: DIM, marginBottom: 2 }}>
          Spend {node.cost} XP
        </div>
        {xpAvailable !== undefined && (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: remaining >= 0 ? GREEN : RED, marginBottom: 10 }}>
            Remaining after: {remaining} XP
          </div>
        )}
        <div style={{ height: 1, background: HUD.border, marginBottom: 10 }} />
        {node.description && (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: DIM, lineHeight: 1.5, maxHeight: 100, overflowY: 'auto', marginBottom: 10 }}>
            <MarkupText text={node.description} />
          </div>
        )}
        <div style={{ height: 1, background: HUD.border, marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              borderRadius: RADIUS.sm,
              fontFamily: FONT_BODY,
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
              // rgba(224,58,30,*) — force identity accent, pre-approved
              background: 'rgba(224,58,30,0.15)',
              border: '1px solid rgba(224,58,30,0.5)',
              borderRadius: RADIUS.sm,
              fontFamily: FONT_BODY,
              fontSize: FS.label,
              fontWeight: 700,
              color: canAfford ? HUD.gold : GOLD_DIM,
              padding: '6px 16px',
              cursor: canAfford ? 'pointer' : 'not-allowed',
              opacity: canAfford ? 1 : 0.5,
            }}
          >
            Spend {node.cost} XP
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  TOOLTIP                                               */
/* ═══════════════════════════════════════════════════════ */

const TOOLTIP_W = 300

interface FixedPos {
  left:    number
  top?:    number
  bottom?: number
}

function ForceTooltip({ node, pos }: { node: ForceTreeNode; pos: FixedPos }) {
  return (
    <div style={{
      position: 'fixed',
      left: pos.left,
      ...(pos.top    !== undefined ? { top:    pos.top    } : {}),
      ...(pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
      zIndex: Z.tooltip,
      width: TOOLTIP_W,
      background: 'var(--hud-surface-hi)',
      // HUD.gold + hex alpha suffix: dynamic alpha construction — kept as template
      border: `1px solid ${HUD.gold}40`,
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,.5)',
      pointerEvents: 'none',
      fontFamily: FONT_BODY,
      fontSize: FS.label,
    }}>
      <div style={{
        fontSize: FS.sm,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: node.purchased ? GOLD_BR : TEXT,
        marginBottom: '6px',
      }}>
        {node.name}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '8px', paddingBottom: '8px',
        borderBottom: `1px solid ${HUD.border}`,
      }}>
        <span style={{ fontWeight: 700, color: HUD.gold }}>
          {node.cost} XP
        </span>
      </div>
      {node.description && (
        <div style={{ color: DIM, lineHeight: '1.6' }}>
          <MarkupText text={node.description} />
        </div>
      )}
      <div style={{
        marginTop: '8px',
        fontSize: FS.overline,
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: node.purchased ? GREEN : node.canPurchase ? HUD.gold : DIM,
      }}>
        {node.purchased ? 'PURCHASED' : node.canPurchase ? 'CLICK TO PURCHASE' : 'LOCKED'}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  NODE                                                  */
/* ═══════════════════════════════════════════════════════ */

function ForceNode({
  node, onClickPurchase, xpAvailable, onHoverChange,
}: {
  node: ForceTreeNode
  onClickPurchase?: (node: ForceTreeNode) => void
  xpAvailable?: number
  onHoverChange?: (hovered: boolean) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [tooltipPos, setTooltipPos] = useState<FixedPos>({ left: 0, top: 0 })
  const nodeRef = useRef<HTMLDivElement>(null)
  const canAfford = xpAvailable !== undefined ? xpAvailable >= node.cost : true
  const isClickable = node.canPurchase && !node.purchased

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
    onHoverChange?.(true)
    if (nodeRef.current) {
      const r  = nodeRef.current.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const left = Math.max(8, Math.min(r.left + r.width / 2 - TOOLTIP_W / 2, vw - TOOLTIP_W - 8))
      if (vh - r.bottom >= 200) {
        setTooltipPos({ left, top: r.bottom + 8 })
      } else {
        setTooltipPos({ left, bottom: vh - r.top + 8 })
      }
    }
  }, [onHoverChange])

  const handleClick = useCallback(() => {
    if (!node.canPurchase || node.purchased) return
    if (!canAfford) {
      toast.error(`Not enough XP — need ${node.cost}, have ${xpAvailable ?? 0}`)
      return
    }
    onClickPurchase?.(node)
  }, [node, canAfford, xpAvailable, onClickPurchase])

  const isPurchased = node.purchased
  const isAvailable = node.canPurchase && !node.purchased

  let nodeStyle: React.CSSProperties
  if (isPurchased) {
    nodeStyle = {
      // rgba(224,58,30,*) — force identity accent, pre-approved
      background: 'rgba(224,58,30,0.10)',
      border: `1.5px solid rgba(224,58,30,0.55)`,
      boxShadow: '0 0 14px rgba(224,58,30,0.12), inset 0 1px 0 rgba(224,58,30,0.18)',
    }
  } else if (isAvailable) {
    nodeStyle = {
      // Dynamic hover: rgba(224,58,30,*) — force identity, pre-approved
      background: hovered ? 'rgba(224,58,30,0.07)' : 'transparent',
      border: `1.5px dashed ${hovered ? 'rgba(224,58,30,0.5)' : 'rgba(224,58,30,0.22)'}`,
    }
  } else {
    nodeStyle = {
      background: 'transparent',
      border: `1px dashed ${HUD.border}`,
      opacity: 0.5,
    }
  }

  const nameColor = isPurchased ? GOLD_BR : isAvailable ? TEXT : FAINT
  let costColor: string
  if (isPurchased) {
    costColor = GREEN
  } else if (isAvailable && !canAfford) {
    costColor = RED
  } else {
    costColor = GOLD_DIM
  }

  return (
    <div
      ref={nodeRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => { setHovered(false); onHoverChange?.(false) }}
      onClick={handleClick}
      style={{
        position: 'relative', width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        ...nodeStyle,
        padding: '8px 6px',
        cursor: isClickable ? 'pointer' : 'default',
        transition: EASE.default,
        transform: hovered && isAvailable ? 'scale(1.05)' : 'scale(1)',
        // Z.dropdown (20) for hovered node — elevated within grid but below overlays
        zIndex: hovered ? Z.dropdown : Z.raised,
        overflow: 'visible',
        borderRadius: RADIUS.md,
      }}
    >
      {isPurchased && (
        <div style={{
          position: 'absolute', top: '-1px', right: '-1px',
          width: '12px', height: '12px', background: HUD.gold,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
        }} />
      )}

      {/* Ability name */}
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.sm,
        fontWeight: 700,
        color: nameColor,
        textAlign: 'center', lineHeight: 1.3,
        maxWidth: '100%', overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {node.name}
      </div>

      {/* Cost */}
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.label,
        fontWeight: 700, marginTop: '4px',
        color: costColor,
      }}>
        {isPurchased ? '✓' : `${node.cost} XP`}
      </div>

      {hovered && createPortal(
        <ForceTooltip node={node} pos={tooltipPos} />,
        document.body,
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  SVG CONNECTIONS                                       */
/* ═══════════════════════════════════════════════════════ */

function ForceConnectionLines({
  connections, nodeMap, gridRef,
}: {
  connections: ForceTreeConnection[]
  nodeMap: Map<string, ForceTreeNode>
  gridRef: React.RefObject<HTMLDivElement | null>
}) {
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; from: string; to: string }[]>([])

  const computeLines = useCallback(() => {
    const grid = gridRef.current
    if (!grid) return
    const gridRect = grid.getBoundingClientRect()
    const newLines: typeof lines = []

    for (const conn of connections) {
      const fromEl = grid.querySelector(`[data-cell="${conn.fromRow}-${conn.fromCol}"]`) as HTMLElement
      const toEl = grid.querySelector(`[data-cell="${conn.toRow}-${conn.toCol}"]`) as HTMLElement
      if (!fromEl || !toEl) continue

      const fromRect = fromEl.getBoundingClientRect()
      const toRect = toEl.getBoundingClientRect()

      let x1: number, y1: number, x2: number, y2: number
      const isVertical = conn.fromCol === conn.toCol

      if (isVertical) {
        x1 = fromRect.left + fromRect.width / 2 - gridRect.left
        y1 = fromRect.bottom - gridRect.top
        x2 = toRect.left + toRect.width / 2 - gridRect.left
        y2 = toRect.top - gridRect.top
      } else {
        const goingRight = conn.toCol > conn.fromCol
        x1 = (goingRight ? fromRect.right : fromRect.left) - gridRect.left
        y1 = fromRect.top + fromRect.height / 2 - gridRect.top
        x2 = (goingRight ? toRect.left : toRect.right) - gridRect.left
        y2 = toRect.top + toRect.height / 2 - gridRect.top
      }

      newLines.push({ x1, y1, x2, y2, from: `${conn.fromRow}-${conn.fromCol}`, to: `${conn.toRow}-${conn.toCol}` })
    }
    setLines(newLines)
  }, [connections, gridRef])

  useEffect(() => {
    computeLines()
    window.addEventListener('resize', computeLines)
    return () => window.removeEventListener('resize', computeLines)
  }, [computeLines])

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: Z.base, overflow: 'visible' }}>
      <defs>
        <filter id="force-conn-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {lines.map((ln, i) => {
        const fromNode = nodeMap.get(ln.from)
        const toNode = nodeMap.get(ln.to)
        const bothPurchased = fromNode?.purchased && toNode?.purchased
        const onePurchased = fromNode?.purchased || toNode?.purchased
        return (
          <line key={i}
            x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
            // rgba(224,58,30,*) — force identity accent strokes, pre-approved
            stroke={bothPurchased ? 'rgba(224,58,30,0.7)' : onePurchased ? 'rgba(224,58,30,0.35)' : 'rgba(224,58,30,0.15)'}
            strokeWidth={bothPurchased ? 2 : 1.5}
            strokeLinecap="round"
            filter={bothPurchased ? 'url(#force-conn-glow)' : undefined}
          />
        )
      })}
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  MAIN FORCE POWER TREE                                 */
/* ═══════════════════════════════════════════════════════ */

export function ForcePowerTree({
  powerName, nodes, connections, onPurchase, xpAvailable, purchasedCount, totalCount,
}: ForcePowerTreeProps) {
  const [confirmNode, setConfirmNode] = useState<ForceTreeNode | null>(null)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const nodeMap = new Map<string, ForceTreeNode>()
  for (const node of nodes) {
    nodeMap.set(`${node.row}-${node.col}`, node)
  }

  // Determine rows from nodes
  const maxRow = nodes.reduce((max, n) => Math.max(max, n.row), 0)
  const rows = maxRow + 1

  const handleConfirmPurchase = () => {
    if (confirmNode && onPurchase) {
      onPurchase(confirmNode.abilityKey, confirmNode.row, confirmNode.col, confirmNode.cost)
    }
    setConfirmNode(null)
  }

  return (
    <div style={{
      background: BG,
      border: `1px solid ${BORDER}`,
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
      fontFamily: FONT_BODY,
    }}>
      {/* Header */}
      <div style={{
        background: PANEL_BG,
        borderBottom: `1px solid ${BORDER}`,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.sm,
            fontWeight: 700, color: HUD.gold,
          }}>
            {powerName}
          </div>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.label,
            color: DIM, marginTop: 2,
          }}>
            {purchasedCount}/{totalCount} abilities
          </div>
        </div>
        {xpAvailable !== undefined && (
          <div style={{
            background: 'var(--hud-surface-lo)',
            border: `1px solid ${HUD.border}`,
            borderRadius: RADIUS.sm,
            padding: '2px 10px',
            fontFamily: FONT_BODY, fontSize: FS.label,
            color: HUD.gold,
          }}>
            {xpAvailable} XP
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ padding: '16px' }}>
        <div
          ref={gridRef}
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: '8px',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, zIndex: Z.base, pointerEvents: 'none' }}>
            <ForceConnectionLines connections={connections} nodeMap={nodeMap} gridRef={gridRef} />
          </div>

          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
              const node = nodeMap.get(`${row}-${col}`)
              if (!node) {
                return <div key={`${row}-${col}`} data-cell={`${row}-${col}`} style={{ minHeight: '160px' }} />
              }
              // Skip cells that are covered by a span (span === 0)
              if (node.span === 0) {
                return null
              }
              return (
                <div
                  key={`${row}-${col}`}
                  data-cell={`${row}-${col}`}
                  style={{
                    gridColumn: node.span > 1 ? `${col + 1} / span ${node.span}` : col + 1,
                    gridRow: row + 1,
                    // Z.overlay (100) for the hovered cell to clear other grid cells;
                    // original used 50 which sits between Z.dropdown(20) and Z.overlay(100).
                    // Z.overlay is the correct token-scale choice for elevated grid content.
                    zIndex: hoveredCell === `${row}-${col}` ? Z.overlay : Z.raised,
                    minHeight: '160px',
                    position: 'relative',
                  }}
                >
                  <ForceNode
                    node={node}
                    onClickPurchase={(n) => setConfirmNode(n)}
                    xpAvailable={xpAvailable}
                    onHoverChange={(h) => setHoveredCell(h ? `${row}-${col}` : null)}
                  />
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        // rgba(0,0,0,0.2) — pre-approved rgba(0,0,0,*) overlay tint; no token for this specific shade
        background: 'rgba(0,0,0,0.2)',
        padding: '8px 16px',
        display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
      }}>
        {[
          // rgba(224,58,30,*) — force identity accent, pre-approved
          { color: 'rgba(224,58,30,0.55)', label: 'Purchased', style: 'solid' as const },
          { color: 'rgba(224,58,30,0.22)', label: 'Available', style: 'dashed' as const },
          { color: HUD.border, label: 'Locked', style: 'dashed' as const },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', border: `1.5px ${item.style} ${item.color}`, opacity: item.label === 'Locked' ? 0.5 : 1, borderRadius: RADIUS.sm }} />
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: DIM }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Purchase Popover */}
      {confirmNode !== null && (
        <PurchasePopover
          node={confirmNode}
          xpAvailable={xpAvailable}
          onConfirm={handleConfirmPurchase}
          onCancel={() => setConfirmNode(null)}
        />
      )}
    </div>
  )
}
