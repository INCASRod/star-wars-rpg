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
import { RichText } from '@/components/ui/RichText'
import { Tooltip, TipBody } from '@/components/ui/Tooltip'
import { TalentTree } from '@/components/character/TalentTree'
import { buildTalentTree } from '@/lib/buildTalentTree'
import type { RefSpecialization, RefTalent } from '@/lib/types'
import { HUD } from '@/lib/tokens'

const FR  = 'var(--font-body)'
const FM  = 'var(--font-body)'
const BORDER    = 'var(--hud-border)'
const BORDER_HI = 'var(--hud-border-hi)'
const TEXT      = 'var(--hud-text)'
const DIM       = 'var(--hud-text-faint)'
const FAINT     = 'var(--hud-text-faint)'
const EDITOR_BG = 'var(--hud-surface-hi)'
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
        background: 'var(--hud-surface-hi)',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div>
          <div style={{
            fontFamily: FR, fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
            fontWeight: 700, color: HUD.gold, letterSpacing: '0.06em',
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
  blockReason:   string | null
  isCareer:      boolean
  careerLabel:   string | null
  onBuy:         () => void
  onClose:       () => void
  refTalentMap?: Record<string, RefTalent>
}

function SpecDetailPanel({ spec, cost, affordable, blockReason, isCareer, careerLabel, onBuy, onClose, refTalentMap }: SpecDetailPanelProps) {
  const canBuy = affordable && !blockReason
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
              {spec.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
              {(isCareer || careerLabel) && (
                <span style={{
                  fontFamily: FR, fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                  color: HUD.gold, background: `color-mix(in srgb, ${HUD.gold} 7%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${HUD.gold} 19%, transparent)`,
                  borderRadius: 3, padding: '1px 7px',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  {isCareer ? '★ Career' : careerLabel}
                </span>
              )}
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
            background: 'var(--hud-surface-lo)',
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
              color: canBuy ? HUD.gold : RED,
              fontWeight: 700,
            }}>
              {cost} XP
            </span>
            {!blockReason && !affordable && (
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

          {/* Blocked reason (e.g. droid/clone cannot take Force-sensitive specs) */}
          {blockReason && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 16,
              background: 'rgba(224,80,80,0.08)',
              border: '1px solid rgba(224,80,80,0.28)',
              borderRadius: 4, padding: '8px 12px',
              fontFamily: FR, fontSize: 'clamp(0.75rem, 1vw, 0.82rem)',
              color: RED,
            }}>
              {blockReason}
            </div>
          )}

          {/* Career skills */}
          {spec.career_skill_keys?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{
                fontFamily: FR, fontSize: 'clamp(0.62rem, 0.85vw, 0.7rem)',
                fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--hud-text-dim)', marginBottom: 8,
              }}>
                Career Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {spec.career_skill_keys.map(k => (
                  <span key={k} style={{
                    fontFamily: FR, fontSize: 'clamp(0.72rem, 0.95vw, 0.8rem)',
                    color: TEXT, background: 'var(--hud-surface-lo)',
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
              color: 'var(--hud-text-dim)', marginBottom: 8,
            }}>
              Description
            </div>
            {spec.description ? (
              <div style={{ fontFamily: FR, fontSize: 'clamp(0.8rem, 1.1vw, 0.88rem)', color: TEXT, lineHeight: 1.65 }}>
                <RichText text={spec.description} />
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
            {refTalentMap && (
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
                Preview Spec Tree
              </button>
            )}
          </div>
        </div>

        {/* Footer — buy button only when affordable and not blocked */}
        {canBuy && (
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
  /** Spec keys that are in-career for the character's career (from ref_careers.specialization_keys — ref_specializations.career_key is always NULL for the respec dataset) */
  careerSpecKeys: Set<string>
  /** For a non-career spec, return the name of a career that claims it (for the chip label), or null for Universal specs that belong to no career */
  otherCareerName?: (spec: RefSpecialization) => string | null
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
  /** Return a non-null reason to show a spec as blocked (e.g. droid/clone + Force-sensitive) — disables selection instead of erroring on click */
  blockedReason?: (spec: RefSpecialization) => string | null
}

export function SpecSelectorList({
  refSpecs,
  ownedKeys,
  careerSpecKeys,
  otherCareerName,
  getSpecCost,
  canAfford,
  onSelect,
  searchPlaceholder = 'Search specializations…',
  autoFocus = false,
  refTalentMap,
  blockedReason,
}: SpecSelectorListProps) {
  const [search, setSearch] = useState('')
  const [selectedSpec, setSelectedSpec] = useState<RefSpecialization | null>(null)

  const available = refSpecs
    .filter(s => !ownedKeys.has(s.key) && s.talent_tree?.rows?.length)
    .sort((a, b) => {
      const ac = careerSpecKeys.has(a.key) ? 0 : 1
      const bc = careerSpecKeys.has(b.key) ? 0 : 1
      return ac !== bc ? ac - bc : a.name.localeCompare(b.name)
    })

  const filtered = search
    ? available.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : available

  // Sort already buckets in-career specs first — find where the "other careers"
  // bucket begins so we can drop a divider there, matching the creation flow's
  // first-spec picker (src/app/create/page.tsx "OTHER CAREERS" divider).
  const firstOtherIdx = filtered.findIndex(s => !careerSpecKeys.has(s.key))

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
        {filtered.map((spec, index) => {
          const isCareer  = careerSpecKeys.has(spec.key)
          const careerLabel = isCareer ? null : (otherCareerName?.(spec) ?? null)
          const cost      = getSpecCost(spec)
          const affordable = canAfford(spec)
          const blockReason = blockedReason?.(spec) ?? null

          const divider = index === firstOtherIdx && firstOtherIdx > 0 && (
            <div key="other-careers-divider" style={{
              fontFamily: FR,
              fontSize: 'clamp(0.6rem, 0.85vw, 0.68rem)',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: FAINT,
              background: 'var(--hud-surface-lo)',
              border: `1px solid ${BORDER}`,
              borderRadius: 4,
              padding: '3px 12px',
              marginTop: 2,
            }}>
              Other Careers
            </div>
          )

          const btn = (
            <button
              onClick={() => { if (!blockReason) setSelectedSpec(spec) }}
              disabled={!!blockReason}
              className="spec-row"
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                '--spec-row-bg-rest':      isCareer ? 'var(--hud-surface-lo)' : 'transparent',
                '--spec-row-bg-hover':     isCareer ? 'var(--hud-surface-mid)' : 'var(--hud-surface-lo)',
                '--spec-row-border-rest':  isCareer ? `color-mix(in srgb, ${HUD.gold} 19%, transparent)` : BORDER,
                '--spec-row-border-hover': isCareer ? `color-mix(in srgb, ${HUD.gold} 33%, transparent)` : `color-mix(in srgb, ${HUD.gold} 15%, transparent)`,
                borderRadius: 4,
                cursor: blockReason ? 'not-allowed' : 'pointer',
                opacity: blockReason ? 0.45 : 1,
              } as React.CSSProperties}
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
                  {(isCareer || careerLabel) && (
                    <span style={{
                      fontFamily: FR,
                      fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                      color: isCareer ? HUD.gold : FAINT,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      {isCareer ? '★ Career' : careerLabel}
                    </span>
                  )}
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
                color: affordable ? 'var(--hud-text-dim)' : RED,
                whiteSpace: 'nowrap',
                marginLeft: 12,
                flexShrink: 0,
              }}>
                {cost} XP
              </div>
            </button>
          )

          if (blockReason || !affordable) {
            return [
              divider,
              <Tooltip
                key={spec.key}
                content={<TipBody>{blockReason ?? 'Cannot afford new spec'}</TipBody>}
                placement="top"
                maxWidth={200}
              >
                {btn}
              </Tooltip>,
            ]
          }

          return [
            divider,
            <div key={spec.key}>
              {btn}
            </div>,
          ]
        }).flat()}

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
          blockReason={blockedReason?.(selectedSpec) ?? null}
          isCareer={careerSpecKeys.has(selectedSpec.key)}
          careerLabel={careerSpecKeys.has(selectedSpec.key) ? null : (otherCareerName?.(selectedSpec) ?? null)}
          onBuy={() => { onSelect(selectedSpec); setSelectedSpec(null) }}
          onClose={() => setSelectedSpec(null)}
          refTalentMap={refTalentMap}
        />
      )}
    </div>
  )
}
