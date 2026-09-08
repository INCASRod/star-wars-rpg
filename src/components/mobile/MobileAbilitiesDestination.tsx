'use client'

import { useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  HudSkill, CharacterTalent, RefTalent, RefSpecialization, CharacterSpecialization,
  SigAbility, LockedSigAbility, CharacterSigAbilityNode, Character,
} from '@/lib/types'
import type { ForcePowerDisplay } from '@/components/player-hud/ForcePanel'
import { getSkillPool, getAvailableForceDice } from '@/components/player-hud/dice-engine'
import { DICE_META, type DiceType } from '@/lib/tokens'
import { MobileAbilityTree, buildTreeTabs, type TreeTab } from './MobileAbilityTree'
import { MobileTalentDetailSheet, type TalentDetailData } from './MobileTalentDetailSheet'
import { MobileSkillDetailSheet } from './MobileSkillDetailSheet'
import { MobileForceUpgradeSheet } from './MobileForceUpgradeSheet'
import { MobilePurchaseConfirmSheet, type PendingPurchase } from './MobilePurchaseConfirmSheet'

type FilterKey = 'all' | 'skills' | 'talents' | 'force' | 'trees'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'skills',  label: 'Skills' },
  { key: 'talents', label: 'Talents' },
  { key: 'force',   label: 'Force' },
  { key: 'trees',   label: 'Trees' },
]

interface ResultRow {
  group: 'Skills' | 'Talents' | 'Force' | 'Trees'
  filterKey: Exclude<FilterKey, 'all'>
  key: string
  name: string
  sub: string
  barColor: string
  onTap: () => void
  right: React.ReactNode
}

function DiceGlyphs({ pool }: { pool: Partial<Record<DiceType, number>> }) {
  const glyphs: { type: DiceType; i: number }[] = []
  for (const [type, count] of Object.entries(pool) as [DiceType, number][]) {
    for (let i = 0; i < count; i++) glyphs.push({ type, i })
  }
  if (glyphs.length === 0) return <span className="m-result-sub">Untrained</span>
  return (
    <>
      {glyphs.map(g => (
        <span key={`${g.type}-${g.i}`} className="m-dice-glyph" style={{ background: DICE_META[g.type].color /* die-identity colour — sealed namespace */ }} />
      ))}
    </>
  )
}

export interface MobileAbilitiesDestinationProps {
  character: Character
  hudSkills: HudSkill[]
  talents: CharacterTalent[]
  hudTalentsSearchable: { key: string; name: string; rank: number; activation: string; description?: string }[]
  refTalentMap: Record<string, RefTalent>
  refSpecMap: Record<string, RefSpecialization>
  charSpecs: CharacterSpecialization[]
  allForcePowers: ForcePowerDisplay[]
  forceRating: number
  sigAbilities: SigAbility[]
  lockedSigAbilities: Record<string, LockedSigAbility>
  purchasedSigNodes: CharacterSigAbilityNode[]
  hasUnlockedTier5: boolean
  /** Prompt 3b — opens the Skill/Force check panel pre-selected to this key. */
  onOpenSkillCheck: (skillKey: string) => void
  onOpenForceCheck: (powerKey: string) => void
  // Prompt 2b — XP purchasing
  supabase: SupabaseClient
  onPurchaseTalent: (talentKey: string, row: number, col: number, activeSpecKey: string) => Promise<string | undefined>
  onBuySkill: (skillKey: string, currentRank: number, isCareer: boolean) => Promise<void>
  onPurchaseForceAbility: (abilityKey: string, row: number, col: number, cost: number, powerKey: string) => Promise<string | undefined>
  onLockInSigAbility: (sigAbilityKey: string, specSlot: string) => Promise<void>
  onPurchaseSigNode: (sigAbilityKey: string, node: SigAbility['nodes'][number]) => Promise<void>
}

export function MobileAbilitiesDestination({
  character, hudSkills, talents, hudTalentsSearchable, refTalentMap, refSpecMap, charSpecs,
  allForcePowers, forceRating, sigAbilities, lockedSigAbilities, purchasedSigNodes, hasUnlockedTier5,
  onOpenSkillCheck, onOpenForceCheck, supabase,
  onPurchaseTalent, onBuySkill, onPurchaseForceAbility, onLockInSigAbility, onPurchaseSigNode,
}: MobileAbilitiesDestinationProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [view, setView] = useState<{ mode: 'search' } | { mode: 'tree'; tab: TreeTab }>({ mode: 'search' })
  const [detail, setDetail] = useState<TalentDetailData | null>(null)
  const [skillDetail, setSkillDetail] = useState<HudSkill | null>(null)
  const [forcePowerDetail, setForcePowerDetail] = useState<ForcePowerDisplay | null>(null)
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null)

  function requestPurchase(label: string, cost: number, execute: () => Promise<unknown>) {
    setDetail(null)
    setSkillDetail(null)
    setForcePowerDetail(null)
    setPendingPurchase({ label, cost, execute })
  }

  const xpAvailable = character.xp_available ?? 0

  const talentPurchase = detail?.purchaseTarget
    ? (() => {
        const target = detail.purchaseTarget!
        if (detail.state !== 'available') return { canBuy: false, disabledReason: undefined, onBuy: () => {} }
        const affordable = xpAvailable >= detail.cost
        if (target.kind === 'sig-base' && !hasUnlockedTier5) {
          return { canBuy: false, disabledReason: 'Requires a Tier 5 talent unlocked in an in-career specialisation.', onBuy: () => {} }
        }
        if (!affordable) {
          return { canBuy: false, disabledReason: `Not enough XP — need ${detail.cost}, have ${xpAvailable}.`, onBuy: () => {} }
        }
        return {
          canBuy: true,
          onBuy: () => requestPurchase(
            target.kind === 'sig-base' || target.kind === 'sig-node' ? `Signature Ability: ${detail.name}` : `Talent: ${detail.name}`,
            detail.cost,
            () => target.kind === 'talent'
              ? onPurchaseTalent(detail.key, target.row, target.col, target.activeSpecKey)
              : target.kind === 'sig-base'
                ? onLockInSigAbility(target.sigAbilityKey, target.specSlot)
                : onPurchaseSigNode(target.sigAbilityKey, target.node),
          ),
        }
      })()
    : undefined

  const tabs = useMemo(
    () => buildTreeTabs(charSpecs, refSpecMap, talents, lockedSigAbilities, sigAbilities),
    [charSpecs, refSpecMap, talents, lockedSigAbilities, sigAbilities],
  )

  const availableForceDice = getAvailableForceDice(forceRating, character.force_rating_committed ?? 0)
  const ownedForcePowers = useMemo(() => allForcePowers.filter(fp => fp.purchasedCount > 0), [allForcePowers])

  function openTalentDetail(talentKey: string) {
    const ref = refTalentMap[talentKey]
    const owned = hudTalentsSearchable.find(t => t.key === talentKey)
    const row = talents.find(t => t.talent_key === talentKey)
    const specName = row?.specialization_key ? (refSpecMap[row.specialization_key]?.name ?? row.specialization_key) : 'Unknown specialization'
    setDetail({
      key: talentKey,
      name: owned?.name ?? ref?.name ?? talentKey,
      description: ref?.description,
      specName,
      row: row?.tree_row ?? 0,
      state: 'owned', // reachable only from the owned-talents search group
      cost: row?.xp_cost ?? 0,
      activation: owned?.activation,
      isRanked: ref?.is_ranked ?? false,
      ownedRank: owned?.rank ?? 0,
      unlockedByText: 'Already owned — see the full tree for its connections.',
      opensText: 'Open this talent’s tree (via a Trees result) to see what it connects to.',
    })
  }

  const allRows = useMemo((): ResultRow[] => {
    const rows: ResultRow[] = []

    for (const s of hudSkills) {
      const pool = getSkillPool(s.charVal, s.rank)
      rows.push({
        group: 'Skills', filterKey: 'skills', key: `skill-${s.key}`, name: s.name,
        sub: `${s.charKey.toUpperCase()} ${s.charVal} · Rank ${s.rank}`,
        barColor: 'var(--hud-mobile-gold)',
        onTap: () => onOpenSkillCheck(s.key),
        right: (
          <>
            <DiceGlyphs pool={pool} />
            {/* Separate tap target from the row itself — the row still opens
                the skill check panel (Prompt 3b); this opens the purchase
                detail view instead, per this prompt's own instruction not
                to hijack the row tap. */}
            <button
              type="button"
              className="m-row-buy-btn"
              aria-label={`View ${s.name} purchase details`}
              onClick={e => { e.stopPropagation(); setSkillDetail(s) }}
            >
              +
            </button>
          </>
        ),
      })
    }

    for (const t of hudTalentsSearchable) {
      const ref = refTalentMap[t.key]
      const row = talents.find(ct => ct.talent_key === t.key)
      const specName = row?.specialization_key ? (refSpecMap[row.specialization_key]?.name ?? '') : ''
      rows.push({
        group: 'Talents', filterKey: 'talents', key: `talent-${t.key}`, name: t.name,
        sub: [specName, t.activation].filter(Boolean).join(' · '),
        barColor: 'var(--hud-mobile-accent)',
        onTap: () => openTalentDetail(t.key),
        right: ref?.is_ranked ? <span className="m-result-rank">×{t.rank}</span> : null,
      })
    }

    for (const fp of ownedForcePowers) {
      rows.push({
        group: 'Force', filterKey: 'force', key: `force-${fp.powerKey}`, name: fp.powerName,
        sub: `${fp.purchasedCount}/${fp.totalCount} abilities`,
        barColor: 'var(--hud-mobile-force)',
        onTap: () => onOpenForceCheck(fp.powerKey),
        right: (
          <>
            <span className="m-result-rank">{availableForceDice}⬡</span>
            <button
              type="button"
              className="m-row-buy-btn"
              aria-label={`View ${fp.powerName} purchase details`}
              onClick={e => { e.stopPropagation(); setForcePowerDetail(fp) }}
            >
              +
            </button>
          </>
        ),
      })
    }

    for (const tab of tabs) {
      rows.push({
        group: 'Trees', filterKey: 'trees', key: `tree-${tab.kind}-${tab.key}`, name: tab.name,
        sub: `${tab.purchased}/${tab.total} nodes owned`,
        barColor: tab.kind === 'sig' ? 'var(--hud-mobile-sig)' : 'var(--hud-mobile-accent)',
        onTap: () => setView({ mode: 'tree', tab }),
        right: <span className="m-result-chevron">›</span>,
      })
    }

    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hudSkills, hudTalentsSearchable, ownedForcePowers, tabs, availableForceDice])

  const q = query.trim().toLowerCase()
  const searchFiltered = q ? allRows.filter(r => r.name.toLowerCase().includes(q)) : allRows
  const chipCounts: Record<FilterKey, number> = {
    all:     searchFiltered.length,
    skills:  searchFiltered.filter(r => r.filterKey === 'skills').length,
    talents: searchFiltered.filter(r => r.filterKey === 'talents').length,
    force:   searchFiltered.filter(r => r.filterKey === 'force').length,
    trees:   searchFiltered.filter(r => r.filterKey === 'trees').length,
  }
  const visibleRows = filter === 'all' ? searchFiltered : searchFiltered.filter(r => r.filterKey === filter)

  const groups: ResultRow['group'][] = ['Skills', 'Talents', 'Force', 'Trees']

  if (view.mode === 'tree') {
    return (
      <>
        <MobileAbilityTree
          tabs={tabs}
          activeTab={tabs.find(t => t.kind === view.tab.kind && t.key === view.tab.key) ?? view.tab}
          onSelectTab={tab => setView({ mode: 'tree', tab })}
          onSelectNode={setDetail}
          onBack={() => setView({ mode: 'search' })}
          xpAvailable={character.xp_available ?? 0}
          refSpecMap={refSpecMap}
          refTalentMap={refTalentMap}
          talents={talents}
          lockedSigAbilities={lockedSigAbilities}
          sigAbilities={sigAbilities}
          purchasedSigNodes={purchasedSigNodes}
        />
        <MobileTalentDetailSheet open={!!detail} onClose={() => setDetail(null)} data={detail} purchase={talentPurchase} />
        <MobilePurchaseConfirmSheet
          pending={pendingPurchase}
          onClose={() => setPendingPurchase(null)}
          xpAvailable={xpAvailable}
          supabase={supabase}
          characterId={character.id}
        />
      </>
    )
  }

  return (
    <div className="m-abilities">
      <div className="m-search-sticky">
        <input
          type="search"
          className="m-search-input"
          placeholder="Search skills, talents, Force powers…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search abilities"
        />
        <div className="m-chip-row">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              className={`m-chip${filter === f.key ? ' is-active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label} <span className="m-chip-count">{chipCounts[f.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="m-result-list">
        {visibleRows.length === 0 ? (
          <div className="m-placeholder">
            <div className="m-placeholder-title">{q ? 'No results' : 'Nothing here yet'}</div>
            <div className="m-placeholder-body">
              {q ? `Nothing matches "${query}".` : 'Owned talents, Force powers, and trees will appear as you acquire them.'}
            </div>
          </div>
        ) : (
          groups.map(group => {
            const rowsInGroup = visibleRows.filter(r => r.group === group)
            if (rowsInGroup.length === 0) return null
            return (
              <div key={group}>
                <div className="m-group-label">{group}</div>
                {rowsInGroup.map(row => (
                  // A `<div role="button">`, not a real `<button>` — the
                  // buy-icon control nested in `row.right` (Skills/Force
                  // rows) is itself a real `<button>`, and a `<button>`
                  // inside a `<button>` is invalid HTML: Chromium's parser
                  // implicitly closes the outer button the instant it hits
                  // the inner one, silently splitting this element out of
                  // the DOM tree React thinks it built (confirmed live —
                  // the inner button became unreachable/"not visible" to
                  // Playwright, a real symptom of the same parse-time
                  // restructuring, not a CSS bug).
                  <div
                    key={row.key} role="button" tabIndex={0} className="m-result-row"
                    onClick={row.onTap}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.onTap() } }}
                  >
                    <span className="m-result-bar" style={{ background: row.barColor /* per-type identity colour */ }} />
                    <span className="m-result-meta">
                      <span className="m-result-name">{row.name}</span>
                      <span className="m-result-sub">{row.sub}</span>
                    </span>
                    <span className="m-result-right">{row.right}</span>
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>

      <MobileTalentDetailSheet open={!!detail} onClose={() => setDetail(null)} data={detail} purchase={talentPurchase} />
      <MobileSkillDetailSheet
        open={!!skillDetail}
        onClose={() => setSkillDetail(null)}
        skill={skillDetail}
        xpAvailable={xpAvailable}
        onRequestPurchase={requestPurchase}
        onBuySkill={onBuySkill}
      />
      <MobileForceUpgradeSheet
        open={!!forcePowerDetail}
        onClose={() => setForcePowerDetail(null)}
        power={forcePowerDetail}
        xpAvailable={xpAvailable}
        forceRating={forceRating}
        onRequestPurchase={requestPurchase}
        onPurchaseForceAbility={onPurchaseForceAbility}
      />
      <MobilePurchaseConfirmSheet
        pending={pendingPurchase}
        onClose={() => setPendingPurchase(null)}
        xpAvailable={xpAvailable}
        supabase={supabase}
        characterId={character.id}
      />
    </div>
  )
}
