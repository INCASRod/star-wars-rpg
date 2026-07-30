'use client'
// ─────────────────────────────────────────────────────────────────────────────
// ForcePowerSelectorList — shared Force power search + card list
//
// Mirrors SpecSelectorList's proven shape exactly (search box → row list →
// slide-in detail panel → "Preview Tree" button → explicit "Purchase" footer
// button) rather than inventing a second pattern — selecting a power from the
// browse list is browsing, never an instant purchase; the detail panel is
// where the player actually commits, with the option to look at the full
// (unowned) tree first via a read-only preview modal.
//
// Used by: talents/page.tsx's "+ NEW FORCE POWER" rail button.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { RichText } from '@/components/ui/RichText'
import { ForcePowerTree, type ForceTreeNode, type ForceTreeConnection } from '@/components/character/ForcePowerTree'
import type { RefForcePower } from '@/lib/types'
import { HUD } from '@/lib/tokens'

const FR  = 'var(--font-body)'
const FM  = 'var(--font-body)'
const BORDER    = 'var(--hud-border)'
const BORDER_HI = 'var(--hud-border-hi)'
const TEXT      = 'var(--hud-text)'
const DIM       = 'var(--hud-text-faint)'
const FAINT     = 'var(--hud-text-faint)'
const EDITOR_BG = 'var(--hud-surface-hi)'
const RED       = 'var(--state-failure)'

export interface ForcePowerBrowseEntry {
  key: string
  name: string
  min_force_rating: number
}

// ── ForcePowerTreePreviewModal ─────────────────────────────────────────────

interface ForcePowerTreePreviewModalProps {
  powerName: string
  nodes: ForceTreeNode[]
  connections: ForceTreeConnection[]
  onClose: () => void
}

function ForcePowerTreePreviewModal({ powerName, nodes, connections, onClose }: ForcePowerTreePreviewModalProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  if (!mounted) return null

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.2s',
    }}>
      {/* Header — same shell as SpecTreePreviewModal */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', flexShrink: 0,
        background: 'var(--hud-surface-hi)',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div>
          <div style={{
            fontFamily: FR, fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
            fontWeight: 700, color: HUD.gold, letterSpacing: '0.06em',
          }}>
            {powerName}
          </div>
          <div style={{
            fontFamily: FM, fontSize: 'clamp(0.62rem, 0.85vw, 0.7rem)',
            color: DIM, marginTop: 3,
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Force Power Tree — Preview
          </div>
        </div>
        <button
          onClick={close}
          className="hov-surface-mid"
          style={{
            border: `1px solid ${BORDER_HI}`,
            borderRadius: 4, color: HUD.gold,
            fontFamily: FR, fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)',
            fontWeight: 700, padding: '5px 14px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {/* Scrollable tree body — read-only preview of an unowned power: every
          node reads as available, no purchase flow. */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(12px, 2vw, 24px)' }}>
        <ForcePowerTree
          powerName={powerName}
          nodes={nodes}
          connections={connections}
          purchasedCount={0}
          totalCount={nodes.filter(n => n.span > 0 && n.cost > 0).length}
          forceRating={99}
          previewMode
        />
      </div>
    </div>,
    document.body,
  )
}

// ── ForcePowerDetailPanel ───────────────────────────────────────────────────

interface ForcePowerDetailPanelProps {
  entry: ForcePowerBrowseEntry
  power: RefForcePower | undefined
  treeData: { powerName: string; nodes: ForceTreeNode[]; connections: ForceTreeConnection[] } | null
  xpAvailable: number
  forceRating: number
  onEnsureLoaded: (key: string) => void
  onBuy: () => void
  onClose: () => void
}

function ForcePowerDetailPanel({ entry, power, treeData, xpAvailable, forceRating, onEnsureLoaded, onBuy, onClose }: ForcePowerDetailPanelProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showTree, setShowTree] = useState(false)

  useEffect(() => {
    setMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  useEffect(() => { onEnsureLoaded(entry.key) }, [entry.key, onEnsureLoaded])

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 260)
  }

  const buy = () => {
    setVisible(false)
    setTimeout(onBuy, 260)
  }

  if (!mounted) return null

  const baseNode = treeData?.nodes.find(n => n.row === 0 && n.col === 0) ?? null
  const loaded = !!power && !!baseNode
  const cost = baseNode?.cost ?? 0
  const affordable = xpAvailable >= cost
  const meetsForceRating = forceRating >= entry.min_force_rating

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 600,
          background: 'rgba(0,0,0,0.35)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.26s',
        }}
      />

      {/* Slide-in panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 610,
        width: 'clamp(320px, 42vw, 580px)',
        background: EDITOR_BG,
        borderLeft: `1px solid ${BORDER_HI}`,
        boxShadow: '-8px 0 40px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <div>
            <div style={{
              fontFamily: FR, fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
              fontWeight: 700, color: HUD.gold, letterSpacing: '0.06em',
            }}>
              {entry.name}
            </div>
            {entry.min_force_rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: FM, fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                  color: meetsForceRating ? 'var(--die-force)' : RED,
                  background: meetsForceRating ? 'color-mix(in srgb, var(--die-force) 10%, transparent)' : 'color-mix(in srgb, var(--state-failure) 8%, transparent)',
                  border: `1px solid ${meetsForceRating ? 'color-mix(in srgb, var(--die-force) 30%, transparent)' : 'color-mix(in srgb, var(--state-failure) 28%, transparent)'}`,
                  borderRadius: 3, padding: '1px 7px',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  ◈ Requires Force Rating {entry.min_force_rating}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={close}
            style={{
              background: 'none', border: 'none', color: DIM,
              cursor: 'pointer', fontFamily: FR,
              fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
              lineHeight: 1, padding: '2px 4px', flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4, 20px)' }}>

          {!loaded ? (
            <div style={{
              fontFamily: FR, fontSize: 'clamp(0.8rem, 1.1vw, 0.88rem)',
              color: DIM, fontStyle: 'italic', padding: '8px 0',
            }}>
              Loading power details…
            </div>
          ) : (
            <>
              {/* XP cost row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 16,
                background: 'var(--hud-surface-lo)',
                border: `1px solid ${BORDER}`,
                borderRadius: 4, padding: '8px 12px',
              }}>
                <span style={{
                  fontFamily: FR, fontSize: 'clamp(0.75rem, 1vw, 0.82rem)',
                  color: DIM, flex: 1,
                }}>
                  Base Power Cost
                </span>
                <span style={{
                  fontFamily: FM, fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
                  color: affordable ? HUD.gold : RED,
                  fontWeight: 700,
                }}>
                  {cost} XP
                </span>
                {!affordable && (
                  <span style={{
                    fontFamily: FR, fontSize: 'clamp(0.62rem, 0.82vw, 0.68rem)',
                    color: RED, background: 'color-mix(in srgb, var(--state-failure) 8%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--state-failure) 28%, transparent)',
                    borderRadius: 3, padding: '1px 7px',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    Cannot Afford
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <div style={{
                  fontFamily: FR, fontSize: 'clamp(0.62rem, 0.85vw, 0.7rem)',
                  fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: 'var(--hud-text-dim)', marginBottom: 8,
                }}>
                  {baseNode?.name ?? 'Basic Power'}
                </div>
                {power?.description || baseNode?.description ? (
                  <div style={{ fontFamily: FR, fontSize: 'clamp(0.8rem, 1.1vw, 0.88rem)', color: TEXT, lineHeight: 1.65 }}>
                    <RichText text={power?.description || baseNode?.description || ''} />
                  </div>
                ) : (
                  <div style={{
                    fontFamily: FR, fontSize: 'clamp(0.8rem, 1.1vw, 0.88rem)',
                    color: DIM, fontStyle: 'italic',
                  }}>
                    No description available.
                  </div>
                )}

                {/* Preview tree button */}
                {treeData && (
                  <button
                    onClick={() => setShowTree(true)}
                    className="hov-accent-subtle"
                    style={{
                      marginTop: 16, width: '100%',
                      border: '1px solid color-mix(in srgb, var(--hud-accent) 30%, transparent)',
                      borderRadius: 4, padding: '9px',
                      fontFamily: FR, fontSize: 'clamp(0.78rem, 1.05vw, 0.88rem)',
                      fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'var(--hud-accent)',
                      cursor: 'pointer',
                    }}
                  >
                    👁 Preview Power Tree
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer — buy button only once loaded and affordable */}
        {loaded && affordable && (
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${BORDER}` }}>
            <button
              onClick={buy}
              className="hov-surface-mid"
              style={{
                width: '100%',
                border: `1px solid color-mix(in srgb, ${HUD.gold} 33%, transparent)`,
                borderRadius: 4, padding: '10px',
                fontFamily: FR, fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
                fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: HUD.gold,
                cursor: 'pointer',
              }}
            >
              Purchase Base Power — {cost} XP
            </button>
          </div>
        )}
      </div>

      {/* Force power tree preview modal */}
      {showTree && treeData && (
        <ForcePowerTreePreviewModal
          powerName={treeData.powerName}
          nodes={treeData.nodes}
          connections={treeData.connections}
          onClose={() => setShowTree(false)}
        />
      )}
    </>,
    document.body,
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export interface ForcePowerSelectorListProps {
  /** Lightweight browse list (key/name/min_force_rating only, no ability_tree) — covers every power, not just owned ones. */
  powerBrowseList: ForcePowerBrowseEntry[]
  /** Power keys already owned; excluded from the list. */
  ownedKeys: Set<string>
  /** Full ref row, once loaded via onEnsureLoaded — sparse until then. */
  refForcePowerMap: Record<string, RefForcePower>
  /** Full tree data (for cost/description/preview), once loaded — returns null until onEnsureLoaded resolves. */
  buildForcePowerTree: (key: string) => { powerName: string; nodes: ForceTreeNode[]; connections: ForceTreeConnection[] } | null
  /** Triggers the full-data fetch for a power the player has selected but doesn't own yet. */
  onEnsureLoaded: (key: string) => void
  xpAvailable: number
  forceRating: number
  /** Called when the player confirms the base-power purchase. */
  onBuy: (entry: ForcePowerBrowseEntry) => void
  searchPlaceholder?: string
  autoFocus?: boolean
}

export function ForcePowerSelectorList({
  powerBrowseList,
  ownedKeys,
  refForcePowerMap,
  buildForcePowerTree,
  onEnsureLoaded,
  xpAvailable,
  forceRating,
  onBuy,
  searchPlaceholder = 'Search Force powers…',
  autoFocus = false,
}: ForcePowerSelectorListProps) {
  const [search, setSearch] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<ForcePowerBrowseEntry | null>(null)

  const available = powerBrowseList
    .filter(p => !ownedKeys.has(p.key))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))

  const filtered = search
    ? available.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : available

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 0 }}>
      {/* Search */}
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={search}
        onChange={e => setSearch(e.target.value)}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '7px 10px',
          background: 'var(--hud-surface-lo)',
          border: `1px solid ${BORDER}`,
          borderRadius: 4,
          fontFamily: FR,
          fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
          color: TEXT,
          outline: 'none',
        }}
      />

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.map(entry => {
          const meetsForceRating = forceRating >= entry.min_force_rating
          return (
            <button
              key={entry.key}
              onClick={() => setSelectedEntry(entry)}
              className="spec-row"
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                '--spec-row-bg-rest':      'transparent',
                '--spec-row-bg-hover':     'var(--hud-surface-lo)',
                '--spec-row-border-rest':  BORDER,
                '--spec-row-border-hover': `color-mix(in srgb, ${HUD.gold} 15%, transparent)`,
                borderRadius: 4,
                cursor: 'pointer',
              } as React.CSSProperties}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: FR,
                  fontSize: 'clamp(0.85rem, 1.15vw, 0.95rem)',
                  fontWeight: 700,
                  color: TEXT,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {entry.name}
                </div>
                {entry.min_force_rating > 0 && (
                  <div style={{ marginTop: 2 }}>
                    <span style={{
                      fontFamily: FM,
                      fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                      color: meetsForceRating ? FAINT : RED,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      ◈ FR {entry.min_force_rating}+
                    </span>
                  </div>
                )}
              </div>

              <div style={{
                fontFamily: FR,
                fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                color: 'var(--hud-accent)',
                whiteSpace: 'nowrap',
                marginLeft: 12,
                flexShrink: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                View →
              </div>
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '24px 0',
            fontFamily: FR,
            fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
            color: FAINT,
          }}>
            No Force powers found.
          </div>
        )}
      </div>

      {/* Detail slide-in */}
      {selectedEntry && (
        <ForcePowerDetailPanel
          entry={selectedEntry}
          power={refForcePowerMap[selectedEntry.key]}
          treeData={buildForcePowerTree(selectedEntry.key)}
          xpAvailable={xpAvailable}
          forceRating={forceRating}
          onEnsureLoaded={onEnsureLoaded}
          onBuy={() => { onBuy(selectedEntry); setSelectedEntry(null) }}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  )
}
