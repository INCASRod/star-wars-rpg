'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { FONT_RAJDHANI, FS_OVERLINE, FS_LABEL, FS_SM } from '@/components/player-hud/design-tokens'
import { MarkupText } from '@/components/ui/MarkupText'

/* ═══════════════════════════════════════ */
/*  THEME CONSTANTS                       */
/* ═══════════════════════════════════════ */

const BG       = '#060D09'
const GOLD     = '#C8AA50'
const GOLD_DIM = '#7A6830'
const GOLD_BR  = '#E0C060'
const TEXT     = '#C8D8C0'
const DIM      = '#6A8070'
const FAINT    = '#2A3A2E'
const BORDER   = 'rgba(200,170,80,0.14)'
const BLUE     = '#5AAAE0'
const GREEN    = '#4EC87A'
const RED      = '#E05050'
const PANEL_BG = 'rgba(8,16,10,0.88)'

/* ═══════════════════════════════════════ */
/*  TYPES                                 */
/* ═══════════════════════════════════════ */

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

/* ═══════════════════════════════════════ */
/*  PURCHASE POPOVER                      */
/* ═══════════════════════════════════════ */

function PurchasePopover({ node, xpAvailable, onConfirm, onCancel }: {
  node: ForceTreeNode
  xpAvailable?: number
  onConfirm: () => void
  onCancel: () => void
}) {
  const remaining = (xpAvailable ?? 0) - node.cost
  const canAfford = xpAvailable === undefined || xpAvailable >= node.cost
  return (
    <>
      {/* Backdrop */}
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 499, background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }} />
      {/* Popover */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)', zIndex: 500,
        background: 'rgba(8,16,10,0.98)',
        border: `1px solid rgba(200,170,80,0.5)`,
        borderRadius: 6, padding: '14px 16px',
        minWidth: 280, maxWidth: 320,
        boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,170,80,0.1)',
      }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: GOLD, marginBottom: 4 }}>
          {node.name}
        </div>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: DIM, marginBottom: 2 }}>
          Spend {node.cost} XP
        </div>
        {xpAvailable !== undefined && (
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: remaining >= 0 ? GREEN : RED, marginBottom: 10 }}>
            Remaining after: {remaining} XP
          </div>
        )}
        <div style={{ height: 1, background: 'rgba(200,170,80,0.15)', marginBottom: 10 }} />
        {node.description && (
          <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: DIM, lineHeight: 1.5, maxHeight: 100, overflowY: 'auto', marginBottom: 10 }}>
            <MarkupText text={node.description} />
          </div>
        )}
        <div style={{ height: 1, background: 'rgba(200,170,80,0.15)', marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 3, fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: DIM, padding: '6px 16px', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={canAfford ? onConfirm : undefined} disabled={!canAfford} style={{ background: 'rgba(200,170,80,0.15)', border: '1px solid rgba(200,170,80,0.5)', borderRadius: 3, fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700, color: canAfford ? GOLD : GOLD_DIM, padding: '6px 16px', cursor: canAfford ? 'pointer' : 'not-allowed', opacity: canAfford ? 1 : 0.5 }}>
            Spend {node.cost} XP
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════ */
/*  TOOLTIP                               */
/* ═══════════════════════════════════════ */

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
      zIndex: 9999,
      width: TOOLTIP_W,
      background: 'rgba(4,9,6,0.97)',
      border: `1px solid ${GOLD}40`,
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,.5)', pointerEvents: 'none',
      fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
    }}>
      <div style={{
        fontSize: FS_SM,
        fontWeight: 700, letterSpacing: '0.08em',
        color: node.purchased ? GOLD_BR : TEXT,
        marginBottom: '6px',
      }}>
        {node.name}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '8px', paddingBottom: '8px',
        borderBottom: `1px solid rgba(200,170,80,0.3)`,
      }}>
        <span style={{ fontWeight: 700, color: GOLD }}>
          {node.cost} XP
        </span>
      </div>
      {node.description && (
        <div style={{ color: DIM, lineHeight: '1.6' }}>
          <MarkupText text={node.description} />
        </div>
      )}
      <div style={{
        marginTop: '8px', fontSize: FS_OVERLINE,
        fontWeight: 700, letterSpacing: '0.1em',
        color: node.purchased ? GREEN : node.canPurchase ? GOLD : DIM,
      }}>
        {node.purchased ? 'PURCHASED' : node.canPurchase ? 'CLICK TO PURCHASE' : 'LOCKED'}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════ */
/*  NODE                                  */
/* ═══════════════════════════════════════ */

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
  const isLocked = !node.purchased && !node.canPurchase

  let nodeStyle: React.CSSProperties
  if (isPurchased) {
    nodeStyle = {
      background: 'rgba(200,170,80,0.10)',
      border: `1.5px solid rgba(200,170,80,0.55)`,
      boxShadow: '0 0 14px rgba(200,170,80,0.12), inset 0 1px 0 rgba(200,170,80,0.18)',
    }
  } else if (isAvailable) {
    nodeStyle = {
      background: hovered ? 'rgba(200,170,80,0.07)' : 'rgba(255,255,255,0.03)',
      border: `1.5px dashed ${hovered ? 'rgba(200,170,80,0.5)' : 'rgba(200,170,80,0.22)'}`,
    }
  } else {
    nodeStyle = {
      background: 'rgba(255,255,255,0.015)',
      border: '1px dashed rgba(255,255,255,0.08)',
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
        transition: 'all .25s ease',
        transform: hovered && isAvailable ? 'scale(1.05)' : 'scale(1)',
        zIndex: hovered ? 20 : 1, overflow: 'visible',
        borderRadius: 4,
      }}
    >
      {isPurchased && (
        <div style={{
          position: 'absolute', top: '-1px', right: '-1px',
          width: '12px', height: '12px', background: GOLD,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
        }} />
      )}

      {/* Ability name */}
      <div style={{
        fontFamily: FONT_RAJDHANI, fontSize: FS_SM,
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
        fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
        fontWeight: 700, marginTop: '4px',
        color: costColor,
      }}>
        {isPurchased ? '\u2713' : `${node.cost} XP`}
      </div>

      {hovered && (
        <ForceTooltip node={node} pos={tooltipPos} />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════ */
/*  SVG CONNECTIONS                       */
/* ═══════════════════════════════════════ */

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
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'visible' }}>
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
            stroke={bothPurchased ? 'rgba(200,170,80,0.7)' : onePurchased ? 'rgba(200,170,80,0.35)' : 'rgba(200,170,80,0.15)'}
            strokeWidth={bothPurchased ? 2 : 1.5}
            strokeLinecap="round"
            filter={bothPurchased ? 'url(#force-conn-glow)' : undefined}
          />
        )
      })}
    </svg>
  )
}

/* ═══════════════════════════════════════ */
/*  MAIN FORCE POWER TREE                 */
/* ═══════════════════════════════════════ */

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
      borderRadius: 6,
      overflow: 'hidden',
      fontFamily: FONT_RAJDHANI,
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
            fontFamily: FONT_RAJDHANI, fontSize: FS_SM,
            fontWeight: 700, color: GOLD,
          }}>
            {powerName}
          </div>
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
            color: DIM, marginTop: 2,
          }}>
            {purchasedCount}/{totalCount} abilities
          </div>
        </div>
        {xpAvailable !== undefined && (
          <div style={{
            background: 'rgba(200,170,80,0.1)',
            border: '1px solid rgba(200,170,80,0.3)',
            borderRadius: 3, padding: '2px 10px',
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
            color: GOLD,
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
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
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
                    zIndex: hoveredCell === `${row}-${col}` ? 50 : 1,
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
        background: 'rgba(0,0,0,0.2)',
        padding: '8px 16px',
        display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
      }}>
        {[
          { color: 'rgba(200,170,80,0.55)', label: 'Purchased', style: 'solid' as const },
          { color: 'rgba(200,170,80,0.22)', label: 'Available', style: 'dashed' as const },
          { color: 'rgba(255,255,255,0.08)', label: 'Locked', style: 'dashed' as const },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', border: `1.5px ${item.style} ${item.color}`, opacity: item.label === 'Locked' ? 0.5 : 1, borderRadius: 2 }} />
            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: DIM }}>{item.label}</span>
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
