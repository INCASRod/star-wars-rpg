'use client'
// ─────────────────────────────────────────────────────────────────────────────
// SpecSelectorList — shared specialisation search + card list
//
// Used by:
//   • PlayerHUDDesktop  BuySpecButton overlay (in-play purchase)
//   • create/page.tsx   SpecStep additional-spec section (creation)
//
// The caller supplies cost / affordability logic so each context can use its
// own XP formula without duplicating the rendering.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { parseOggDudeMarkup } from '@/lib/oggdude-markup'
import { Tooltip, TipBody } from '@/components/ui/Tooltip'
import { TalentTree } from '@/components/character/TalentTree'
import { buildTalentTree } from '@/lib/buildTalentTree'
import type { RefSpecialization, RefTalent } from '@/lib/types'

const FR  = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FM  = "'Share Tech Mono', 'Courier New', monospace"
const GOLD      = '#C8AA50'
const BORDER    = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const TEXT      = '#C8D8C0'
const DIM       = '#6A8070'
const FAINT     = '#2A3A2E'
const EDITOR_BG = 'rgba(6,13,9,0.97)'
const RED       = '#E05050'

const SKILL_LABEL: Record<string, string> = {
  ATHL: 'Athletics', BRAWL: 'Brawl', MELEE: 'Melee', LTSABER: 'Lightsaber',
  RANGLT: 'Ranged (Light)', RANGHVY: 'Ranged (Heavy)', GUNN: 'Gunnery',
  PILOTPL: 'Piloting (Planetary)', PILOTSP: 'Piloting (Space)',
  MECH: 'Mechanics', COMP: 'Computers', MEDIC: 'Medicine',
  ASTRO: 'Astrogation', PERC: 'Perception', VIGIL: 'Vigilance',
  COOL: 'Cool', DISC: 'Discipline', COORD: 'Coordination',
  RESIL: 'Resilience', STEALTH: 'Stealth', SKUL: 'Skulduggery',
  DECEP: 'Deception', CHARM: 'Charm', COERC: 'Coercion',
  NEG: 'Negotiation', SW: 'Streetwise', LEAD: 'Leadership',
  SURV: 'Survival', XENOL: 'Xenology', LOREI: 'Lore',
  KNOW_CORE: 'Core Worlds', KNOW_ED: 'Education', KNOW_LORE: 'Lore',
  KNOW_OUT: 'Outer Rim', KNOW_UW: 'Underworld', KNOW_WAR: 'Warfare',
  KNOW_XEN: 'Xenology',
}

function fmtSkill(key: string): string {
  return SKILL_LABEL[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ── SpecTreePreviewModal ───────────────────────────────────────────────────────

interface SpecTreePreviewModalProps {
  spec:          RefSpecialization
  refTalentMap:  Record<string, RefTalent>
  onClose:       () => void
}

function SpecTreePreviewModal({ spec, refTalentMap, onClose }: SpecTreePreviewModalProps) {
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

  const treeData = buildTalentTree(spec, refTalentMap, new Set())

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.2s',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', flexShrink: 0,
        background: 'rgba(6,13,9,0.97)',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div>
          <div style={{
            fontFamily: FR, fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
            fontWeight: 700, color: GOLD, letterSpacing: '0.06em',
          }}>
            {spec.name}
          </div>
          <div style={{
            fontFamily: FM, fontSize: 'clamp(0.62rem, 0.85vw, 0.7rem)',
            color: DIM, marginTop: 3,
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Specialization Tree — Preview
          </div>
        </div>
        <button
          onClick={close}
          style={{
            background: 'rgba(200,170,80,0.08)',
            border: `1px solid ${BORDER_HI}`,
            borderRadius: 4, color: GOLD,
            fontFamily: FR, fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)',
            fontWeight: 700, padding: '5px 14px',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.16)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.08)' }}
        >
          ✕
        </button>
      </div>

      {/* Scrollable tree body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(12px, 2vw, 24px)' }}>
        {treeData ? (
          <TalentTree
            specName={treeData.specName}
            nodes={treeData.nodes}
            connections={treeData.connections}
            previewMode
          />
        ) : (
          <div style={{
            textAlign: 'center', padding: '48px 0',
            fontFamily: FR, fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
            color: DIM,
          }}>
            No talent tree data available for this specialization.
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

// ── SpecDetailPanel ────────────────────────────────────────────────────────────

interface SpecDetailPanelProps {
  spec:          RefSpecialization
  cost:          number
  affordable:    boolean
  onBuy:         () => void
  onClose:       () => void
  refTalentMap?: Record<string, RefTalent>
}

function SpecDetailPanel({ spec, cost, affordable, onBuy, onClose, refTalentMap }: SpecDetailPanelProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showTree, setShowTree] = useState(false)

  useEffect(() => {
    setMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 260)
  }

  const buy = () => {
    setVisible(false)
    setTimeout(onBuy, 260)
  }

  if (!mounted) return null

  const descHtml = parseOggDudeMarkup(spec.description)

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
              fontWeight: 700, color: GOLD, letterSpacing: '0.06em',
            }}>
              {spec.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: FR, fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                color: GOLD, background: `${GOLD}12`,
                border: `1px solid ${GOLD}30`,
                borderRadius: 3, padding: '1px 7px',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {spec.career_key}
              </span>
              {spec.is_force_sensitive && (
                <span style={{
                  fontFamily: FM, fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                  color: '#7EC8E3', background: 'rgba(126,200,227,0.1)',
                  border: '1px solid rgba(126,200,227,0.3)',
                  borderRadius: 3, padding: '1px 7px',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  ◈ Force
                </span>
              )}
            </div>
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

          {/* XP cost row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 16,
            background: 'rgba(200,170,80,0.05)',
            border: `1px solid ${BORDER}`,
            borderRadius: 4, padding: '8px 12px',
          }}>
            <span style={{
              fontFamily: FR, fontSize: 'clamp(0.75rem, 1vw, 0.82rem)',
              color: DIM, flex: 1,
            }}>
              XP Cost
            </span>
            <span style={{
              fontFamily: FM, fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
              color: affordable ? GOLD : RED,
              fontWeight: 700,
            }}>
              {cost} XP
            </span>
            {!affordable && (
              <span style={{
                fontFamily: FR, fontSize: 'clamp(0.62rem, 0.82vw, 0.68rem)',
                color: RED, background: 'rgba(224,80,80,0.08)',
                border: '1px solid rgba(224,80,80,0.28)',
                borderRadius: 3, padding: '1px 7px',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Cannot Afford
              </span>
            )}
          </div>

          {/* Career skills */}
          {spec.career_skill_keys?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{
                fontFamily: FR, fontSize: 'clamp(0.62rem, 0.85vw, 0.7rem)',
                fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'rgba(200,170,80,0.5)', marginBottom: 8,
              }}>
                Career Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {spec.career_skill_keys.map(k => (
                  <span key={k} style={{
                    fontFamily: FR, fontSize: 'clamp(0.72rem, 0.95vw, 0.8rem)',
                    color: TEXT, background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${BORDER}`,
                    borderRadius: 3, padding: '2px 9px',
                  }}>
                    {fmtSkill(k)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <div style={{
              fontFamily: FR, fontSize: 'clamp(0.62rem, 0.85vw, 0.7rem)',
              fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'rgba(200,170,80,0.5)', marginBottom: 8,
            }}>
              Description
            </div>
            {descHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: descHtml }}
                style={{
                  fontFamily: FR, fontSize: 'clamp(0.8rem, 1.1vw, 0.88rem)',
                  color: TEXT, lineHeight: 1.65,
                }}
              />
            ) : (
              <div style={{
                fontFamily: FR, fontSize: 'clamp(0.8rem, 1.1vw, 0.88rem)',
                color: DIM, fontStyle: 'italic',
              }}>
                No description available.
              </div>
            )}

            {/* Preview tree button */}
            {refTalentMap && (
              <button
                onClick={() => setShowTree(true)}
                style={{
                  marginTop: 16, width: '100%',
                  background: 'rgba(90,170,224,0.07)',
                  border: '1px solid rgba(90,170,224,0.3)',
                  borderRadius: 4, padding: '9px',
                  fontFamily: FR, fontSize: 'clamp(0.78rem, 1.05vw, 0.88rem)',
                  fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: '#7EC8E3',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(90,170,224,0.14)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(90,170,224,0.07)' }}
              >
                Preview Spec Tree
              </button>
            )}
          </div>
        </div>

        {/* Footer — buy button only when affordable */}
        {affordable && (
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${BORDER}` }}>
            <button
              onClick={buy}
              style={{
                width: '100%',
                background: 'rgba(200,170,80,0.14)',
                border: `1px solid ${GOLD}55`,
                borderRadius: 4, padding: '10px',
                fontFamily: FR, fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
                fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: GOLD,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.24)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,170,80,0.14)' }}
            >
              Buy Specialization — {cost} XP
            </button>
          </div>
        )}
      </div>

      {/* Spec tree preview modal */}
      {showTree && refTalentMap && (
        <SpecTreePreviewModal
          spec={spec}
          refTalentMap={refTalentMap}
          onClose={() => setShowTree(false)}
        />
      )}
    </>,
    document.body,
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export interface SpecSelectorListProps {
  /** Full reference list — filtered internally */
  refSpecs: RefSpecialization[]
  /** Spec keys already owned/selected; excluded from the list */
  ownedKeys: Set<string>
  /** Career key used to highlight career specs */
  careerKey: string
  /** Return the XP cost for a given spec */
  getSpecCost: (spec: RefSpecialization) => number
  /** Return true when the user can afford this spec */
  canAfford: (spec: RefSpecialization) => boolean
  /** Called when the user confirms purchase of a spec */
  onSelect: (spec: RefSpecialization) => void
  /** Search box placeholder text */
  searchPlaceholder?: string
  /** Focus the search input on mount */
  autoFocus?: boolean
  /** When provided, enables "Preview Spec Tree" button in the detail panel */
  refTalentMap?: Record<string, RefTalent>
}

export function SpecSelectorList({
  refSpecs,
  ownedKeys,
  careerKey,
  getSpecCost,
  canAfford,
  onSelect,
  searchPlaceholder = 'Search specializations…',
  autoFocus = false,
  refTalentMap,
}: SpecSelectorListProps) {
  const [search, setSearch] = useState('')
  const [selectedSpec, setSelectedSpec] = useState<RefSpecialization | null>(null)

  const available = refSpecs
    .filter(s => !ownedKeys.has(s.key) && s.talent_tree?.rows?.length)
    .sort((a, b) => {
      const ac = a.career_key === careerKey ? 0 : 1
      const bc = b.career_key === careerKey ? 0 : 1
      return ac !== bc ? ac - bc : a.name.localeCompare(b.name)
    })

  const filtered = search
    ? available.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
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
          background: 'rgba(255,255,255,0.04)',
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
        {filtered.map(spec => {
          const isCareer  = spec.career_key === careerKey
          const cost      = getSpecCost(spec)
          const affordable = canAfford(spec)

          const btn = (
            <button
              onClick={() => setSelectedSpec(spec)}
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: isCareer ? 'rgba(200,170,80,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isCareer ? `${GOLD}30` : BORDER}`,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = isCareer ? 'rgba(200,170,80,0.12)' : 'rgba(255,255,255,0.05)'
                el.style.borderColor = isCareer ? `${GOLD}55` : `${GOLD}25`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = isCareer ? 'rgba(200,170,80,0.06)' : 'rgba(255,255,255,0.02)'
                el.style.borderColor = isCareer ? `${GOLD}30` : BORDER
              }}
            >
              {/* Left: name + badges */}
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
                  {spec.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span style={{
                    fontFamily: FR,
                    fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                    color: isCareer ? GOLD : FAINT,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    {isCareer ? '★ Career' : spec.career_key}
                  </span>
                  {spec.is_force_sensitive && (
                    <span style={{
                      fontFamily: FM,
                      fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                      color: '#7EC8E3',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      ◈ Force
                    </span>
                  )}
                </div>
              </div>

              {/* Right: XP cost badge */}
              <div style={{
                fontFamily: FM,
                fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
                color: affordable ? 'rgba(200,170,80,0.5)' : RED,
                whiteSpace: 'nowrap',
                marginLeft: 12,
                flexShrink: 0,
              }}>
                {cost} XP
              </div>
            </button>
          )

          if (!affordable) {
            return (
              <Tooltip
                key={spec.key}
                content={<TipBody>Cannot afford new spec</TipBody>}
                placement="top"
                maxWidth={200}
              >
                {btn}
              </Tooltip>
            )
          }

          return (
            <div key={spec.key}>
              {btn}
            </div>
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
            No specializations found.
          </div>
        )}
      </div>

      {/* Spec detail slide-in */}
      {selectedSpec && (
        <SpecDetailPanel
          spec={selectedSpec}
          cost={getSpecCost(selectedSpec)}
          affordable={canAfford(selectedSpec)}
          onBuy={() => { onSelect(selectedSpec); setSelectedSpec(null) }}
          onClose={() => setSelectedSpec(null)}
          refTalentMap={refTalentMap}
        />
      )}
    </div>
  )
}
