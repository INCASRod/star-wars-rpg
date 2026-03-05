'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/* ═══════════════════════════════════════ */
/*  TYPES                                 */
/* ═══════════════════════════════════════ */

export interface TalentTreeNode {
  talentKey: string
  name: string
  description?: string
  row: number
  col: number
  purchased: boolean
  activation: string
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
  xpAvailable?: number
}

/* ═══════════════════════════════════════ */
/*  CONSTANTS                             */
/* ═══════════════════════════════════════ */

const ROWS = 5
const COLS = 4
const ROW_COSTS = [5, 10, 15, 20, 25]

const ACTIVATION_ICONS: Record<string, string> = {
  Passive: '\u25C6',
  Action: '\u25B6',
  Maneuver: '\u2B9E',
  Incidental: '\u26A1',
}

const ACTIVATION_COLORS: Record<string, string> = {
  Passive: 'var(--blue)',
  Action: 'var(--red)',
  Maneuver: 'var(--amber)',
  Incidental: 'var(--green)',
}

/* ═══════════════════════════════════════ */
/*  TOOLTIP COMPONENT                     */
/* ═══════════════════════════════════════ */

function TalentTooltip({ node, style }: { node: TalentTreeNode; style: React.CSSProperties }) {
  const cost = ROW_COSTS[node.row]
  return (
    <div style={{
      position: 'absolute',
      zIndex: 200,
      background: '#1A1A1C',
      border: '2px solid var(--gold)',
      padding: '12px 16px',
      minWidth: '220px',
      maxWidth: '300px',
      boxShadow: '0 8px 32px rgba(0,0,0,.5)',
      pointerEvents: 'none',
      isolation: 'isolate',
      ...style,
    }}>
      <div style={{
        fontFamily: 'var(--font-orbitron)',
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: node.purchased ? 'var(--gold-l)' : '#F2EDE4',
        marginBottom: '6px',
      }}>
        {node.name}
        {node.isRanked && (
          <span style={{ color: '#A0A0A0', fontSize: '10px', marginLeft: '6px' }}>RANKED</span>
        )}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '8px', paddingBottom: '8px',
        borderBottom: '1px solid rgba(200,162,78,.3)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: ACTIVATION_COLORS[node.activation] || '#A0A0A0',
        }}>
          {ACTIVATION_ICONS[node.activation] || ''} {node.activation}
        </span>
        <span style={{
          fontFamily: 'var(--font-orbitron)', fontSize: '11px',
          fontWeight: 700, color: 'var(--gold)', marginLeft: 'auto',
        }}>
          {cost} XP
        </span>
      </div>

      {node.description && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: '#D8D0C4', lineHeight: '1.6',
        }}>
          {node.description}
        </div>
      )}

      <div style={{
        marginTop: '8px',
        fontFamily: 'var(--font-orbitron)', fontSize: '10px',
        fontWeight: 700, letterSpacing: '0.1em',
        color: node.purchased ? 'var(--green)' : node.canPurchase ? 'var(--gold-l)' : '#A0A0A0',
      }}>
        {node.purchased ? 'PURCHASED' : node.canPurchase ? 'CLICK TO PURCHASE' : 'LOCKED'}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════ */
/*  NODE COMPONENT                        */
/* ═══════════════════════════════════════ */

function TalentNode({
  node,
  onClickPurchase,
  xpAvailable,
  onHoverChange,
}: {
  node: TalentTreeNode
  onClickPurchase?: (node: TalentTreeNode) => void
  xpAvailable?: number
  onHoverChange?: (hovered: boolean) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [tooltipSide, setTooltipSide] = useState<'bottom' | 'top'>('bottom')
  const nodeRef = useRef<HTMLDivElement>(null)

  const cost = ROW_COSTS[node.row]
  const canAfford = xpAvailable !== undefined ? xpAvailable >= cost : true
  const isClickable = node.canPurchase && !node.purchased

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
    onHoverChange?.(true)
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect()
      setTooltipSide(window.innerHeight - rect.bottom < 200 ? 'top' : 'bottom')
    }
  }, [onHoverChange])

  const handleClick = useCallback(() => {
    if (!node.canPurchase || node.purchased) return
    if (!canAfford) {
      toast.error(`Not enough XP — need ${cost}, have ${xpAvailable ?? 0}`)
      return
    }
    if (onClickPurchase) {
      onClickPurchase(node)
    }
  }, [node, canAfford, cost, xpAvailable, onClickPurchase])

  const isPurchased = node.purchased
  const isAvailable = node.canPurchase && !node.purchased
  const isLocked = !node.purchased && !node.canPurchase

  const borderColor = isPurchased ? 'var(--gold)' : isAvailable ? 'var(--gold-d)' : 'var(--bdr-l)'
  const borderStyle = isAvailable ? 'dashed' : 'solid'
  const bgColor = isPurchased
    ? 'rgba(200, 162, 78, 0.15)'
    : isAvailable ? 'rgba(200, 162, 78, 0.06)' : 'rgba(255, 255, 255, 0.4)'
  const boxShadow = isPurchased
    ? '0 0 12px var(--gold-glow-s), inset 0 0 8px var(--gold-glow)'
    : isAvailable
      ? hovered ? '0 0 14px var(--gold-glow-s)' : '0 0 6px var(--gold-glow)'
      : 'none'

  return (
    <div
      ref={nodeRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => { setHovered(false); onHoverChange?.(false) }}
      onClick={handleClick}
      style={{
        position: 'relative',
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: bgColor,
        border: `2px ${borderStyle} ${borderColor}`,
        padding: '8px 6px',
        cursor: isClickable ? 'pointer' : 'default',
        opacity: isLocked ? 0.45 : 1,
        boxShadow,
        transition: 'all .25s ease',
        transform: hovered && !isLocked ? 'scale(1.05)' : 'scale(1)',
        zIndex: hovered ? 20 : 1,
        overflow: 'visible',
      }}
    >
      {isPurchased && (
        <div style={{
          position: 'absolute', top: '-1px', right: '-1px',
          width: '12px', height: '12px',
          background: 'var(--gold)',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
        }} />
      )}

      {/* Activation */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600,
        color: ACTIVATION_COLORS[node.activation] || '#A0A0A0',
        marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '3px',
      }}>
        <span style={{ fontSize: '11px' }}>{ACTIVATION_ICONS[node.activation] || ''}</span>
        {node.activation}
      </div>

      {/* Talent name */}
      <div style={{
        fontFamily: 'var(--font-orbitron)', fontSize: '13px',
        fontWeight: 700, letterSpacing: '0.03em',
        color: isPurchased ? 'var(--gold)' : isAvailable ? 'var(--ink)' : '#A0A0A0',
        textAlign: 'center', lineHeight: 1.3,
        maxWidth: '100%', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {node.name}
      </div>

      {node.isRanked && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          letterSpacing: '0.06em',
          color: isPurchased ? 'var(--gold-d)' : '#A0A0A0',
          marginTop: '1px',
        }}>
          RANKED
        </div>
      )}

      {/* Cost */}
      <div style={{
        fontFamily: 'var(--font-orbitron)', fontSize: '12px',
        fontWeight: 700, marginTop: '4px',
        color: isPurchased ? 'var(--green)' : (isAvailable && !canAfford) ? 'var(--red)' : '#6B6B6B',
      }}>
        {isPurchased ? '\u2713' : `${cost} XP`}
      </div>

      {isAvailable && canAfford && (
        <div style={{
          position: 'absolute', inset: '-3px',
          border: '1px solid var(--gold-d)',
          opacity: hovered ? 0.9 : 0.3,
          animation: 'talentPulse 2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {hovered && (
        <TalentTooltip
          node={node}
          style={tooltipSide === 'bottom'
            ? { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }
            : { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }
          }
        />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════ */
/*  SVG CONNECTIONS                       */
/* ═══════════════════════════════════════ */

function ConnectionLines({
  connections,
  nodeMap,
  gridRef,
}: {
  connections: TalentTreeConnection[]
  nodeMap: Map<string, TalentTreeNode>
  gridRef: React.RefObject<HTMLDivElement | null>
}) {
  // Draw lines between box edges, not centers
  // We measure the actual grid to compute where each cell's edge is
  const [lines, setLines] = useState<{x1:number,y1:number,x2:number,y2:number,from:string,to:string}[]>([])

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
        // vertical: bottom edge of from → top edge of to
        x1 = fromRect.left + fromRect.width / 2 - gridRect.left
        y1 = fromRect.bottom - gridRect.top
        x2 = toRect.left + toRect.width / 2 - gridRect.left
        y2 = toRect.top - gridRect.top
      } else {
        // horizontal: right edge of from → left edge of to (or vice versa)
        const goingRight = conn.toCol > conn.fromCol
        x1 = (goingRight ? fromRect.right : fromRect.left) - gridRect.left
        y1 = fromRect.top + fromRect.height / 2 - gridRect.top
        x2 = (goingRight ? toRect.left : toRect.right) - gridRect.left
        y2 = toRect.top + toRect.height / 2 - gridRect.top
      }

      newLines.push({
        x1, y1, x2, y2,
        from: `${conn.fromRow}-${conn.fromCol}`,
        to: `${conn.toRow}-${conn.toCol}`,
      })
    }
    setLines(newLines)
  }, [connections, gridRef])

  useEffect(() => {
    computeLines()
    window.addEventListener('resize', computeLines)
    return () => window.removeEventListener('resize', computeLines)
  }, [computeLines])

  return (
    <svg
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0, overflow: 'visible',
      }}
    >
      <defs>
        <filter id="conn-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {lines.map((ln, i) => {
        const fromNode = nodeMap.get(ln.from)
        const toNode = nodeMap.get(ln.to)
        const bothPurchased = fromNode?.purchased && toNode?.purchased
        const eitherPurchased = fromNode?.purchased || toNode?.purchased

        return (
          <line
            key={i}
            x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
            stroke={bothPurchased ? 'var(--gold)' : eitherPurchased ? 'var(--gold-d)' : 'var(--bdr)'}
            strokeWidth={bothPurchased ? 4 : 3}
            strokeOpacity={bothPurchased ? 0.9 : eitherPurchased ? 0.5 : 0.25}
            strokeLinecap="round"
            filter={bothPurchased ? 'url(#conn-glow)' : undefined}
          />
        )
      })}
    </svg>
  )
}

/* ═══════════════════════════════════════ */
/*  MAIN TALENT TREE COMPONENT            */
/* ═══════════════════════════════════════ */

export function TalentTree({ specName, nodes, connections, onPurchase, xpAvailable }: TalentTreeProps) {
  const [confirmNode, setConfirmNode] = useState<TalentTreeNode | null>(null)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const nodeMap = new Map<string, TalentTreeNode>()
  for (const node of nodes) {
    nodeMap.set(`${node.row}-${node.col}`, node)
  }

  const purchased = nodes.filter(n => n.purchased).length
  const total = nodes.length

  const handleConfirmPurchase = () => {
    if (confirmNode && onPurchase) {
      onPurchase(confirmNode.talentKey, confirmNode.row, confirmNode.col)
    }
    setConfirmNode(null)
  }

  return (
    <div style={{
      background: 'var(--parch)',
      border: '1px solid var(--bdr-l)',
      padding: '24px',
    }}>
      <style>{`
        @keyframes talentPulse {
          0%, 100% { opacity: 0.25; box-shadow: 0 0 4px var(--gold-glow); }
          50%      { opacity: 0.65; box-shadow: 0 0 10px var(--gold-glow-s); }
        }
        [data-slot="alert-dialog-overlay"] { z-index: 200 !important; }
        [data-slot="alert-dialog-content"] { z-index: 200 !important; }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '16px', paddingBottom: '12px',
        borderBottom: '2px solid var(--bdr)',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-orbitron)', fontSize: '18px',
            fontWeight: 800, letterSpacing: '0.15em',
            color: 'var(--ink)',
          }}>
            {specName}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '13px',
            color: 'var(--txt2)', marginTop: '4px',
          }}>
            {purchased}/{total} TALENTS PURCHASED
          </div>
        </div>
        {xpAvailable !== undefined && (
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'var(--font-orbitron)', fontSize: '22px',
              fontWeight: 800, color: 'var(--blue)',
            }}>
              {xpAvailable}
            </div>
            <div style={{
              fontFamily: 'var(--font-orbitron)', fontSize: '10px',
              fontWeight: 600, letterSpacing: '0.15em', color: 'var(--txt3)',
            }}>
              XP AVAILABLE
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr',
        gap: 0, position: 'relative',
      }}>
        {/* Row cost labels */}
        <div style={{
          display: 'grid',
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          alignItems: 'stretch', paddingRight: '12px',
        }}>
          {ROW_COSTS.map((cost, row) => (
            <div key={row} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '48px',
            }}>
              <div style={{
                fontFamily: 'var(--font-orbitron)', fontSize: '13px',
                fontWeight: 700, color: 'var(--txt2)',
                background: 'rgba(255,255,255,.6)',
                border: '1px solid var(--bdr-l)',
                padding: '4px 8px', textAlign: 'center',
              }}>
                {cost}<span style={{ fontSize: '10px', color: 'var(--txt3)' }}> XP</span>
              </div>
            </div>
          ))}
        </div>

        {/* Talent grid */}
        <div
          ref={gridRef}
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            gap: '8px',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          }}>
            <ConnectionLines connections={connections} nodeMap={nodeMap} gridRef={gridRef} />
          </div>

          {Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
              const node = nodeMap.get(`${row}-${col}`)
              return (
                <div
                  key={`${row}-${col}`}
                  data-cell={`${row}-${col}`}
                  style={{
                    gridColumn: col + 1, gridRow: row + 1,
                    zIndex: hoveredCell === `${row}-${col}` ? 50 : 1,
                    minHeight: '80px',
                    position: 'relative',
                  }}
                >
                  {node && (
                    <TalentNode
                      node={node}
                      onClickPurchase={(n) => setConfirmNode(n)}
                      xpAvailable={xpAvailable}
                      onHoverChange={(h) => setHoveredCell(h ? `${row}-${col}` : null)}
                    />
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '24px',
        marginTop: '16px', paddingTop: '12px',
        borderTop: '1px solid var(--bdr-l)',
      }}>
        {[
          { color: 'var(--gold)', label: 'Purchased', style: 'solid' as const },
          { color: 'var(--gold-d)', label: 'Available', style: 'dashed' as const },
          { color: 'var(--bdr-l)', label: 'Locked', style: 'solid' as const },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '14px', height: '14px',
              border: `2px ${item.style} ${item.color}`,
              opacity: item.label === 'Locked' ? 0.45 : 1,
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '12px',
              color: 'var(--txt2)',
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmNode} onOpenChange={(open) => !open && setConfirmNode(null)}>
        <AlertDialogContent style={{ fontFamily: 'var(--font-chakra)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{
              fontFamily: 'var(--font-orbitron)', fontSize: '16px',
              fontWeight: 700, letterSpacing: '0.08em',
            }}>
              Purchase {confirmNode?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--txt2)' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{
                    fontFamily: 'var(--font-orbitron)', fontWeight: 700,
                    color: 'var(--gold-d)',
                  }}>
                    {confirmNode ? ROW_COSTS[confirmNode.row] : 0} XP
                  </span>
                  {' '}will be spent. You have{' '}
                  <span style={{
                    fontFamily: 'var(--font-orbitron)', fontWeight: 700,
                    color: 'var(--blue)',
                  }}>
                    {xpAvailable} XP
                  </span>
                  {' '}available.
                </div>
                {confirmNode?.description && (
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '13px',
                    color: 'var(--txt)', background: 'var(--parch)',
                    border: '1px solid var(--bdr-l)', padding: '10px',
                    lineHeight: 1.5, marginTop: '4px',
                  }}>
                    {confirmNode.description}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{
              fontFamily: 'var(--font-orbitron)', fontSize: '12px',
              fontWeight: 600, letterSpacing: '0.1em',
            }}>
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPurchase}
              style={{
                fontFamily: 'var(--font-orbitron)', fontSize: '12px',
                fontWeight: 700, letterSpacing: '0.1em',
                background: 'var(--gold)', color: '#fff',
              }}
            >
              CONFIRM PURCHASE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
