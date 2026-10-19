'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useTalentSurfaceData } from '@/hooks/useTalentSurfaceData'
import { buildCharacterTalentTree } from '@/lib/buildTalentTree'
import { TalentSurface } from '@/components/character/TalentSurface'
import { ForcePowerTree } from '@/components/character/ForcePowerTree'
import { CharacterLoader } from '@/components/ui/CharacterLoader'
import type { CharacterSkill } from '@/lib/types'
import styles from './CharacterPreview.module.css'

type Tab = 'sheet' | 'talents' | 'force'

const CHARACTERISTICS = [
  { key: 'brawn', label: 'Brawn', abbr: 'BR' },
  { key: 'agility', label: 'Agility', abbr: 'AG' },
  { key: 'intellect', label: 'Intellect', abbr: 'INT' },
  { key: 'cunning', label: 'Cunning', abbr: 'CUN' },
  { key: 'willpower', label: 'Willpower', abbr: 'WIL' },
  { key: 'presence', label: 'Presence', abbr: 'PR' },
] as const

/**
 * Preview Only (Auth B3): another player's BUILD, read-only. Characteristics, skills, talents with spec trees, Force
 * powers with their trees. Nothing else is mounted: no HUD, no rolls, no purchases, no inventory, notes, backstory,
 * credits, duty, XP history, no session claim, no presence, no notification or pending-action feeds. The same layout
 * serves desktop (left rail) and mobile (top tabs). Trees are fed nodes with `canPurchase` forced off and no handlers.
 */
export function CharacterPreview({ characterId, ownCharacterId }: { characterId: string; ownCharacterId: string | null }) {
  const {
    character, charSpecs, shellReady, supabase,
    refSpecMap, refCareers, refSkillMap,
    talents, refTalentMap, treeReady, treeError,
    forceRating, allForcePowers, buildForcePowerTree, forceReady,
  } = useTalentSurfaceData(characterId)

  const [tab, setTab] = useState<Tab>('sheet')
  const [specKey, setSpecKey] = useState<string | null>(null)
  const [powerKey, setPowerKey] = useState<string | null>(null)
  const [skills, setSkills] = useState<CharacterSkill[]>([])

  useEffect(() => {
    let live = true
    void supabase.from('character_skills').select('*').eq('character_id', characterId).then(({ data }) => {
      if (live) setSkills((data ?? []) as CharacterSkill[])
    })
    return () => { live = false }
  }, [supabase, characterId])

  const effectiveSpecKey = specKey ?? charSpecs[0]?.specialization_key ?? null
  const effectivePowerKey = powerKey ?? allForcePowers[0]?.powerKey ?? null

  const talentTreeData = useMemo(() => {
    if (!treeReady || !effectiveSpecKey) return null
    const t = buildCharacterTalentTree(effectiveSpecKey, refSpecMap, refTalentMap, talents)
    return t ? { ...t, nodes: t.nodes.map(n => ({ ...n, canPurchase: false })) } : null
  }, [treeReady, effectiveSpecKey, refSpecMap, refTalentMap, talents])

  const forceTree = useMemo(() => {
    const t = effectivePowerKey ? buildForcePowerTree(effectivePowerKey) : null
    return t ? { ...t, nodes: t.nodes.map(n => ({ ...n, canPurchase: false })) } : null
  }, [effectivePowerKey, buildForcePowerTree])

  const trained = useMemo(
    () => skills.filter(s => s.rank > 0 || s.is_career).map(s => ({ ...s, ref: refSkillMap[s.skill_key] }))
      .sort((a, b) => (a.ref?.name ?? a.skill_key).localeCompare(b.ref?.name ?? b.skill_key)),
    [skills, refSkillMap],
  )

  if (!shellReady || !character) return <CharacterLoader />

  const careerName = refCareers.find(c => c.key === character.career_key)?.name
  const hasForce = allForcePowers.length > 0 || (forceReady && forceRating > 0)
  const tabs: { id: Tab; label: string }[] = [
    { id: 'sheet', label: 'Characteristics & skills' },
    { id: 'talents', label: 'Talents' },
    ...(hasForce ? [{ id: 'force' as Tab, label: 'Force' }] : []),
  ]

  return (
    <div className={styles.page}>
      <div className={styles.banner} role="status">
        <span className={styles.bannerText}>
          <strong>PREVIEW ONLY.</strong> You are viewing {character.name}&apos;s build. Nothing here can be changed.
        </span>
        <Link className={styles.back} href={ownCharacterId ? `/character/${ownCharacterId}` : '/'}>
          {ownCharacterId ? 'Back to my character' : 'Back'}
        </Link>
      </div>

      <header className={styles.header}>
        <h1 className={styles.name}>{character.name}</h1>
        {careerName && <div className={styles.sub}>{careerName}</div>}
      </header>

      <div className={styles.body}>
        <nav className={styles.nav} aria-label="Build sections">
          {tabs.map(t => (
            <button key={t.id} type="button" className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
          <div className={styles.locked} title="Only the owner and the GM can see these">
            <span aria-hidden>⊘</span> Inventory, notes, backstory: private
          </div>
        </nav>

        <main className={styles.content}>
          {tab === 'sheet' && (
            <>
              <h2 className={styles.h2}>Characteristics</h2>
              <div className={styles.chars}>
                {CHARACTERISTICS.map(c => (
                  <div key={c.key} className={styles.char}>
                    <span className={styles.charVal}>{(character as unknown as Record<string, number>)[c.key]}</span>
                    <span className={styles.charLbl}>{c.label}</span>
                  </div>
                ))}
              </div>

              <h2 className={styles.h2}>Skills</h2>
              {trained.length === 0 ? <p className={styles.muted}>No trained skills.</p> : (
                <ul className={styles.skills}>
                  {trained.map(s => (
                    <li key={s.id} className={styles.skill}>
                      <span className={styles.skillName}>{s.ref?.name ?? s.skill_key}{s.is_career && <span className={styles.career} title="Career skill"> ★</span>}</span>
                      <span className={styles.skillChar}>{s.ref?.characteristic_key}</span>
                      <span className={styles.pips} aria-label={`Rank ${s.rank}`}>
                        {Array.from({ length: 5 }, (_, i) => <span key={i} className={i < s.rank ? styles.pipOn : styles.pip} />)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === 'talents' && (
            <>
              {charSpecs.length > 1 && (
                <div className={styles.chips} role="tablist" aria-label="Specializations">
                  {charSpecs.map(cs => (
                    <button key={cs.id} type="button" className={`${styles.chip} ${effectiveSpecKey === cs.specialization_key ? styles.chipActive : ''}`} onClick={() => setSpecKey(cs.specialization_key)}>
                      {refSpecMap[cs.specialization_key]?.name ?? cs.specialization_key}
                    </button>
                  ))}
                </div>
              )}
              {treeError && <p className={styles.muted}>Could not load the talent tree.</p>}
              <div className={styles.tree}>
                <div className={styles.treeInner}>
                  <TalentSurface activeSpecKey={effectiveSpecKey} talentTreeData={talentTreeData} treeLoading={!treeReady} />
                </div>
              </div>
            </>
          )}

          {tab === 'force' && (
            <>
              {allForcePowers.length > 1 && (
                <div className={styles.chips}>
                  {allForcePowers.map(fp => (
                    <button key={fp.powerKey} type="button" className={`${styles.chip} ${effectivePowerKey === fp.powerKey ? styles.chipActive : ''}`} onClick={() => setPowerKey(fp.powerKey)}>
                      {fp.powerName}
                    </button>
                  ))}
                </div>
              )}
              {forceTree ? (
                <div className={styles.tree}>
                  <div className={styles.treeInner}>
                  <ForcePowerTree powerName={forceTree.powerName} nodes={forceTree.nodes} connections={forceTree.connections} purchasedCount={forceTree.purchasedCount} totalCount={forceTree.totalCount} forceRating={forceRating} />
                  </div>
                </div>
              ) : <p className={styles.muted}>No Force powers.</p>}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
