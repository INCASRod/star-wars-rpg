'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTalentSurfaceData } from '@/hooks/useTalentSurfaceData'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { buildCharacterTalentTree } from '@/lib/buildTalentTree'
import { computeCareerSkillKeys } from '@/lib/characters'
import { specPurchaseCost } from '@/hooks/useCharacterData'
import { TalentSurface } from '@/components/character/TalentSurface'
import { ForcePowerTree } from '@/components/character/ForcePowerTree'
import { PurchaseCeremony, type SpecCeremonyPayload } from '@/components/character/PurchaseCeremony'
import { BuySpecButton } from '@/components/player-hud/BuySpecButton'
import { DedicationModal } from '@/components/player-hud/DedicationModal'
import { CharacterLoader } from '@/components/ui/CharacterLoader'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, Z } from '@/lib/tokens'
import { type UiTheme } from '@/components/player-hud/ThemeSwitcher'
import styles from '@/components/character/TalentSurface.module.css'

export default function TalentsPage() {
  return (
    <Suspense fallback={<CharacterLoader />}>
      <TalentsPageInner />
    </Suspense>
  )
}

function TalentsPageInner() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const characterId  = params.id as string
  const isGmMode     = searchParams.get('gm') === '1'
  const specParam    = searchParams.get('spec')

  const {
    character, charSpecs, shellReady, shellError,
    refSpecMap, refSpecs, refCareers, refSkillMap,
    careerSpecKeys, specKeyToCareerName,
    talents, refTalentMap, treeReady, treeError,
    supabase, handlePurchaseTalent, handleRemoveTalent, handleBuySpecialization,
    handleResolveDedication, handleCancelDedication,
    sigAbilities, lockedSigAbilities, purchasedSigNodes, hasUnlockedTier5, lockInAbility, purchaseSigNode, sigLoading,
    forceRating, allForcePowers, buildForcePowerTree, refForcePowerMap: refForcePowerMapForce,
    powerBrowseList, forceReady, handlePurchaseForceAbility, ensurePowerLoaded,
  } = useTalentSurfaceData(characterId)

  const [activeSpecKey, setActiveSpecKey] = useState<string | null>(specParam)
  const [pendingDedication, setPendingDedication] = useState<{ talentId: string; row: number; col: number; specKey: string; xpCost: number } | null>(null)
  // Which destination the rail has selected (Prompt 7b, Defect 1; extended to
  // 'force' in Prompt F3) — the main content area shows exactly one of these,
  // never more than one. Independent of activeSpecKey/activeForcePowerKey:
  // switching between destinations must never lose or change which spec/power
  // is active, so this is its own piece of state, not derived from either.
  const [contentView, setContentView] = useState<'tree' | 'sig' | 'force'>('tree')
  const [activeForcePowerKey, setActiveForcePowerKey] = useState<string | null>(null)
  // "+ New Force Power" browse list (Prompt F3) — same self-contained
  // open/closed pattern as BuySpecButton, not a route/contentView change until
  // an actual power is picked from it.
  const [showForceBrowse, setShowForceBrowse] = useState(false)

  // Loader suppression (Prompt 7c) — with ref data cache-backed, the shell
  // batch is now just 2-3 small character-specific queries and a warm cache
  // resolves in a couple frames, so showing CharacterLoader unconditionally
  // would flash it needlessly on every warm navigation. Render nothing for
  // the first 200ms; only show the loader if shell load genuinely exceeds
  // that (cold cache, slow network, or a real failure still in flight).
  const [showLoader, setShowLoader] = useState(false)
  useEffect(() => {
    if (shellReady) return
    const t = setTimeout(() => setShowLoader(true), 200)
    return () => clearTimeout(t)
  }, [shellReady])

  // ── Header entrance choreography (Prompt 9) — career line → mega title →
  // ghost watermark → meta row, once per route load. Guarded by a ref (not
  // shellReady itself) so it never re-fires on subsequent re-renders once
  // shellReady stays true (XP changes, spec switches, realtime updates) —
  // the header itself doesn't remount on those, only its text content
  // changes. Tree entrance (per spec/rail-switch) is TalentTree.tsx's own,
  // separate concern.
  const prefersReducedMotion = usePrefersReducedMotion()
  const headerEnteredRef = useRef(false)
  const careerLineRef = useRef<HTMLDivElement>(null)
  const megaTitleRef = useRef<HTMLHeadingElement>(null)
  const ghostWatermarkRef = useRef<HTMLSpanElement>(null)
  const metaRowRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!shellReady || headerEnteredRef.current) return
    headerEnteredRef.current = true
    if (prefersReducedMotion) return // already visible via normal CSS — nothing to reveal
    const beats = [careerLineRef.current, megaTitleRef.current, ghostWatermarkRef.current, metaRowRef.current].filter((el): el is HTMLElement => !!el)
    if (beats.length === 0) return
    gsap.set(beats, { opacity: 0, y: 8 })
    const tl = gsap.to(beats, { opacity: 1, y: 0, duration: 0.3, stagger: 0.09, ease: 'power2.out', clearProps: 'opacity,y' })
    return () => { tl.kill() }
  }, [shellReady, prefersReducedMotion])

  // ── Spec purchase celebration (Prompt 9) ──
  const [specCeremony, setSpecCeremony] = useState<{ payload: SpecCeremonyPayload; xpBefore: number; xpAfter: number } | null>(null)

  // ── Per-character theme — same lookup PlayerHUDDesktop does (character_sessions.ui_theme),
  // never hardcoded (see src/app/table/page.tsx's data-theme="kyber" for the pattern this must NOT follow).
  const [uiTheme, setUiTheme] = useState<UiTheme>('ember')
  useEffect(() => {
    const sessionKey = localStorage.getItem('holocron_session_key')
    if (!sessionKey) return
    supabase
      .from('character_sessions')
      .select('ui_theme')
      .eq('character_id', characterId)
      .eq('session_key', sessionKey)
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.ui_theme) return
        const LEGACY: Record<string, UiTheme> = { 'binary-sunset': 'ember' }
        const VALID_THEMES: UiTheme[] = ['ember', 'kyber']
        const resolved: UiTheme = LEGACY[data.ui_theme] ?? (VALID_THEMES.includes(data.ui_theme as UiTheme) ? data.ui_theme as UiTheme : 'ember')
        setUiTheme(resolved)
      })
  }, [characterId]) // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveSpecKey = activeSpecKey || charSpecs[0]?.specialization_key || null
  // Gated on treeReady (not just effectiveSpecKey) — ref_talents/character_talents
  // resolve on their own schedule, independent of the shell batch (Prompt 7a).
  // Computing this before treeReady would render nodes with an empty
  // refTalentMap (names falling back to raw talent keys) for a flash before
  // the real data lands; treeLoading on TalentSurface shows a skeleton instead.
  const talentTreeData = useMemo(
    () => (treeReady && effectiveSpecKey) ? buildCharacterTalentTree(effectiveSpecKey, refSpecMap, refTalentMap, talents) : null,
    [treeReady, effectiveSpecKey, refSpecMap, refTalentMap, talents],
  )

  const careerRef = refCareers.find(c => c.key === character?.career_key)
  const activeSpecRef = effectiveSpecKey ? refSpecMap[effectiveSpecKey] : undefined
  const activeForcePower = activeForcePowerKey ? allForcePowers.find(fp => fp.powerKey === activeForcePowerKey) : undefined
  const activeForcePowerRef = activeForcePowerKey ? refForcePowerMapForce[activeForcePowerKey] : undefined
  const forcePowerTreeData = useMemo(
    () => activeForcePowerKey ? buildForcePowerTree(activeForcePowerKey) : null,
    [activeForcePowerKey, buildForcePowerTree],
  )

  const careerSkillNames = useMemo(() => {
    if (!careerRef) return []
    const keys = computeCareerSkillKeys(careerRef.career_skill_keys, activeSpecRef ? [activeSpecRef] : [])
    return [...keys].map(k => refSkillMap[k]?.name ?? k).sort()
  }, [careerRef, activeSpecRef, refSkillMap])

  function handleExit() {
    router.push(`/character/${characterId}${isGmMode ? '?gm=1' : ''}`)
  }

  // Only the shell batch gates this now (character + character_specializations
  // — ref_specializations/careers/skills come from the shared cache, Prompt
  // 7c), not the full 26-query fetch the old useCharacterData mount required.
  // The tree and sig section paint progressively below once shellReady flips
  // (see treeLoading/sig.loading). showLoader delays the visible loader by
  // 200ms so a warm-cache navigation never flashes it at all.
  if (!shellReady) return showLoader ? <CharacterLoader /> : null
  if (shellError || !character) return (
    <div style={{ width: '100vw', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: HUD.bg }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, color: 'var(--state-failure)' }}>{shellError || 'Character not found'}</div>
    </div>
  )

  // Signature Abilities is visible in the rail per the same rule TalentSurface
  // uses for the section itself: whenever there is an active spec — never
  // gated on hasUnlockedTier5 (that only disables the Lock In action).
  const showSigRailEntry = !!effectiveSpecKey

  return (
    <div
      data-theme={uiTheme === 'ember' ? undefined : uiTheme}
      className={styles.routeShell}
      style={{ width: '100vw', height: '100dvh', overflow: 'hidden', background: HUD.bg, display: 'flex', flexDirection: 'column' }}
    >
      {/* Atmosphere — CSS-only depth layer behind everything; pointer-events:none, does not scroll or affect layout */}
      <div className={styles.atmosphere}>
        <div className={styles.atmosphereGlow} />
        <div className={styles.atmosphereVignette} />
        <div className={styles.atmosphereGrain} />
      </div>

      {/* ── Mega header ── */}
      <div className={styles.header} style={{ padding: `${SP[4]} ${SP[6]} ${SP[3]}`, flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            {careerRef && (
              <div ref={careerLineRef} className={styles.careerLine} style={{ marginBottom: SP[2] }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: HUD.accent, whiteSpace: 'nowrap' }}>
                  {careerRef.name}
                </span>
                <span className={styles.careerLineRule} />
              </div>
            )}

            <h1 ref={megaTitleRef} className={styles.megaTitle}>
              {contentView === 'sig' ? 'Signature Abilities'
                : contentView === 'force' ? (activeForcePower?.powerName ?? 'Force Powers')
                : (activeSpecRef?.name ?? talentTreeData?.specName ?? 'Talents')}
            </h1>

            {careerRef && <span ref={ghostWatermarkRef} className={styles.ghostWatermark}>{careerRef.name}</span>}

            {contentView === 'force' && activeForcePowerRef?.min_force_rating ? (
              <div ref={metaRowRef} style={{ marginTop: SP[3] }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: forceRating >= activeForcePowerRef.min_force_rating ? HUD.textDim : 'var(--state-failure)' }}>
                  <span style={{ color: HUD.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: SP[2] }}>Requires</span>
                  Force Rating {activeForcePowerRef.min_force_rating}
                </div>
              </div>
            ) : careerSkillNames.length > 0 && (
              <div ref={metaRowRef} style={{ marginTop: SP[3] }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textDim, maxWidth: '32rem' }}>
                  <span style={{ color: HUD.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: SP[2] }}>Career Skills</span>
                  {careerSkillNames.join(' · ')}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: SP[3], flexShrink: 0, marginLeft: SP[4] }}>
            <div style={{ background: 'color-mix(in srgb, var(--hud-gold) 10%, transparent)', border: `1px solid color-mix(in srgb, var(--hud-gold) 40%, transparent)`, padding: `${SP[2]} ${SP[4]}`, fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700, letterSpacing: '0.1em', color: HUD.gold, whiteSpace: 'nowrap' }}>
              {character.xp_available} XP
            </div>
            <button
              onClick={handleExit}
              style={{ background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.borderHi}`, padding: `${SP[2]} ${SP[6]}`, fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 600, letterSpacing: '0.15em', color: HUD.textDim, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              ← EXIT
            </button>
          </div>
        </div>
      </div>

      {/* ── Rail + content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div className={styles.rail} style={{ borderRight: `1px solid ${HUD.border}`, padding: `${SP[3]} 0` }}>
          {charSpecs.map(cs => {
            const isActive = contentView === 'tree' && effectiveSpecKey === cs.specialization_key
            return (
              <button
                key={cs.id}
                title={refSpecMap[cs.specialization_key]?.name || cs.specialization_key}
                onClick={() => { setActiveSpecKey(cs.specialization_key); setContentView('tree') }}
                className={`${styles.railEntry} ${isActive ? styles.railEntryActive : ''}`}
                style={{ padding: `${SP[2]} ${SP[4]}`, fontSize: FS.sm, fontWeight: isActive ? 700 : 500, letterSpacing: '0.04em', color: isActive ? HUD.gold : HUD.textDim }}
              >
                {refSpecMap[cs.specialization_key]?.name || cs.specialization_key}
                {cs.is_starting && (
                  <span style={{ display: 'block', fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.15em' }}>START</span>
                )}
              </button>
            )
          })}

          <div style={{ padding: `${SP[2]} ${SP[4]}` }}>
            <BuySpecButton
              character={character}
              charSpecs={charSpecs}
              refSpecs={refSpecs}
              refSpecMap={refSpecMap}
              refTalentMap={refTalentMap}
              careerSpecKeys={careerSpecKeys}
              specKeyToCareerName={specKeyToCareerName}
              onBuy={async specKey => {
                // Same formula buySpecialization itself uses internally (useCharacterData.ts) —
                // computed here, before the await, purely to know the XP delta for the
                // celebration; not a second source of truth for the actual charge.
                const xpBefore = character.xp_available
                const cost = specPurchaseCost(charSpecs.length, careerSpecKeys.has(specKey))
                const result = await handleBuySpecialization(specKey, setActiveSpecKey)
                setContentView('tree')
                if (!result) return // failure — buySpecialization already toast.error'd; no celebration
                const newSkillNames = result.newlyGrantedSkillKeys.map(k => refSkillMap[k]?.name ?? k).sort()
                setSpecCeremony({
                  payload: { kind: 'spec', name: result.specName, cost, newSkillNames },
                  xpBefore, xpAfter: xpBefore - cost,
                })
              }}
            />
          </div>

          {showSigRailEntry && (
            <>
              <div style={{ borderTop: `1px solid ${HUD.border}`, margin: `${SP[2]} ${SP[4]}` }} />
              <button
                onClick={() => setContentView('sig')}
                className={`${styles.railEntry} ${contentView === 'sig' ? styles.railEntryActive : ''}`}
                style={{ padding: `${SP[2]} ${SP[4]}`, fontSize: FS.sm, fontWeight: contentView === 'sig' ? 700 : 600, letterSpacing: '0.04em', color: 'var(--die-boost)' }}
              >
                ◈ Signature Abilities
              </button>
            </>
          )}

          {/* Force powers (Prompt F3) — one rail entry per owned power, same
              pattern as spec entries; real owned counts for both test
              characters are 2 and 4, well within a flat list (25 respec
              powers exist total, but only owned ones ever appear here). */}
          {(allForcePowers.length > 0 || forceReady) && (
            <>
              <div style={{ borderTop: `1px solid ${HUD.border}`, margin: `${SP[2]} ${SP[4]}` }} />
              {allForcePowers.map(fp => {
                const isActive = contentView === 'force' && activeForcePowerKey === fp.powerKey
                return (
                  <button
                    key={fp.powerKey}
                    title={fp.powerName}
                    onClick={() => { setActiveForcePowerKey(fp.powerKey); setContentView('force') }}
                    className={`${styles.railEntry} ${isActive ? styles.railEntryActive : ''}`}
                    style={{ padding: `${SP[2]} ${SP[4]}`, fontSize: FS.sm, fontWeight: isActive ? 700 : 500, letterSpacing: '0.04em', color: isActive ? HUD.gold : HUD.textDim }}
                  >
                    {fp.powerName}
                    <span style={{ display: 'block', fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em' }}>
                      {fp.purchasedCount}/{fp.totalCount}
                    </span>
                  </button>
                )
              })}

              <div style={{ padding: `${SP[2]} ${SP[4]}` }}>
                <button
                  onClick={() => setShowForceBrowse(true)}
                  style={{
                    background: 'rgba(224,58,30,0.06)', border: '1px dashed var(--hud-border-hi)',
                    borderRadius: RADIUS.md, padding: '5px 12px', cursor: 'pointer',
                    fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, letterSpacing: '0.12em',
                    color: HUD.textDim,
                  }}
                >
                  + NEW FORCE POWER
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: SP[4], position: 'relative' }}>
          {contentView === 'tree' && treeError && (
            <div style={{ marginBottom: SP[3], padding: SP[3], border: '1px solid var(--state-failure)', borderRadius: RADIUS.md, color: 'var(--state-failure)', fontFamily: FONT_BODY, fontSize: FS.sm }}>
              Failed to load talent tree: {treeError}
            </div>
          )}
          {contentView === 'force' ? (
            forcePowerTreeData ? (
              <ForcePowerTree
                powerName={forcePowerTreeData.powerName}
                nodes={forcePowerTreeData.nodes}
                connections={forcePowerTreeData.connections}
                purchasedCount={forcePowerTreeData.purchasedCount}
                totalCount={forcePowerTreeData.totalCount}
                xpAvailable={character.xp_available}
                onPurchase={(abilityKey, row, col, cost) => handlePurchaseForceAbility(abilityKey, row, col, cost, activeForcePowerKey!)}
                forceRating={forceRating}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: SP[6], fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textFaint }}>
                Select a Force power from the rail, or start a new one.
              </div>
            )
          ) : (
            <TalentSurface
              activeSpecKey={effectiveSpecKey}
              talentTreeData={talentTreeData}
              treeLoading={!treeReady}
              contentView={contentView}
              xpAvailable={character.xp_available}
              isGmMode={isGmMode}
              onPurchaseTalent={handlePurchaseTalent}
              onRemoveTalent={isGmMode ? handleRemoveTalent : undefined}
              onPendingDedication={setPendingDedication}
              sig={{
                availableSigAbilities: sigAbilities,
                lockedSigAbilities,
                purchasedSigNodes,
                hasUnlockedTier5,
                onLockInSigAbility: lockInAbility,
                onPurchaseSigNode: purchaseSigNode,
                loading: sigLoading,
              }}
            />
          )}
        </div>
      </div>

      {/* "+ New Force Power" browse list (Prompt F3) — portalled, same pattern
          as BuySpecButton's SpecSelectorList, listing all 25 powers (minus
          already-owned ones, which already have their own rail entry) using
          the lightweight name/min_force_rating-only fetch. */}
      {showForceBrowse && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setShowForceBrowse(false)}
          style={{ position: 'fixed', inset: 0, zIndex: Z.modal, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: SP[4] }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '28rem', maxHeight: '70vh', overflowY: 'auto', background: 'var(--hud-surface-hi)', border: `1px solid ${HUD.borderHi}`, borderRadius: RADIUS.lg, padding: SP[3] }}
          >
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, letterSpacing: '0.1em', color: HUD.gold, marginBottom: SP[2] }}>
              START A NEW FORCE POWER
            </div>
            {powerBrowseList
              .filter(p => !allForcePowers.some(fp => fp.powerKey === p.key))
              .map(p => (
                <button
                  key={p.key}
                  onClick={() => {
                    ensurePowerLoaded(p.key)
                    setActiveForcePowerKey(p.key)
                    setContentView('force')
                    setShowForceBrowse(false)
                  }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: `${SP[2]} ${SP[3]}`, marginBottom: 2,
                    background: 'transparent', border: 'none', borderRadius: RADIUS.sm,
                    cursor: 'pointer', fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text,
                  }}
                >
                  {p.name}
                  {p.min_force_rating > 1 && (
                    <span style={{ marginLeft: SP[2], fontSize: FS.overline, color: HUD.textFaint }}>FR {p.min_force_rating}+</span>
                  )}
                </button>
              ))}
          </div>
        </div>,
        document.body,
      )}

      {pendingDedication && typeof document !== 'undefined' && createPortal(
        <DedicationModal
          character={character}
          onConfirm={async (charKey) => {
            const { talentId } = pendingDedication
            setPendingDedication(null)
            await handleResolveDedication(talentId, charKey)
          }}
          onCancel={async () => {
            const { talentId, xpCost } = pendingDedication
            setPendingDedication(null)
            await handleCancelDedication(talentId, xpCost)
          }}
        />,
        document.body,
      )}

      {specCeremony && (
        <PurchaseCeremony
          payload={specCeremony.payload}
          xpBefore={specCeremony.xpBefore}
          xpAfter={specCeremony.xpAfter}
          reducedMotion={prefersReducedMotion}
          onDone={() => setSpecCeremony(null)}
        />
      )}
    </div>
  )
}
