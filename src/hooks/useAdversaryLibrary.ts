import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchAdversaries } from '@/lib/adversaries'
import type { Adversary, AdversaryGear } from '@/lib/adversaries'

export interface UseAdversaryLibraryResult {
  library:          (Adversary & { _isCustom?: boolean })[]
  libSearch:        string
  setLibSearch:     (v: string) => void
  libTypeFilter:    'all' | 'minion' | 'rival' | 'nemesis'
  setLibTypeFilter: (v: 'all' | 'minion' | 'rival' | 'nemesis') => void
  libSourceFilter:  'all' | 'custom'
  setLibSourceFilter: (v: 'all' | 'custom') => void
  libLoading:       boolean
  libError:         string | null
  filteredLib:      (Adversary & { _isCustom?: boolean })[]
}

export function useAdversaryLibrary(): UseAdversaryLibraryResult {
  const [library, setLibrary] = useState<(Adversary & { _isCustom?: boolean })[]>([])
  const [libSearch, setLibSearch] = useState('')
  const [libTypeFilter, setLibTypeFilter] = useState<'all' | 'minion' | 'rival' | 'nemesis'>('all')
  const [libSourceFilter, setLibSourceFilter] = useState<'all' | 'custom'>('all')
  const [libLoading, setLibLoading] = useState(true)
  const [libError, setLibError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      try {
        const [oggdude, customResult] = await Promise.all([
          fetchAdversaries(),
          supabase.from('ref_adversaries').select('*').order('name'),
        ])
        const custom: (Adversary & { _isCustom: true })[] = (customResult.data ?? []).map((row) => {
          const r = row as Record<string, unknown>
          const skillRanks = (r.skill_ranks as Record<string, number>) ?? {}
          return {
            id:          String(r.id),
            name:        String(r.name),
            type:        r.type as 'minion' | 'rival' | 'nemesis',
            brawn:       Number(r.brawn ?? 2),
            agility:     Number(r.agility ?? 2),
            intellect:   Number(r.intellect ?? 2),
            cunning:     Number(r.cunning ?? 2),
            willpower:   Number(r.willpower ?? 2),
            presence:    Number(r.presence ?? 2),
            soak:        Number(r.soak ?? 2),
            wound:       Number(r.wound_threshold ?? 10),
            strain:      r.strain_threshold != null ? Number(r.strain_threshold) : undefined,
            defense:     [Number(r.defense_melee ?? 0), Number(r.defense_ranged ?? 0)],
            skills:      Object.keys(skillRanks),
            skillRanks,
            talents:     (r.talents as Adversary['talents']) ?? [],
            abilities:   (r.abilities as Adversary['abilities']) ?? [],
            weapons:     (r.weapons as Adversary['weapons']) ?? [],
            gear:        (r.gear as AdversaryGear[]) ?? [],
            description: r.description ? String(r.description) : undefined,
            _isCustom:   true,
          }
        })
        setLibrary([...oggdude, ...custom])
      } catch (err) {
        setLibError(String((err as { message?: string })?.message ?? err))
      } finally {
        setLibLoading(false)
      }
    }
    void load()
  }, []) // load once on mount

  const filteredLib = library.filter(a => {
    const matchType   = libTypeFilter === 'all' || a.type === libTypeFilter
    const matchSource = libSourceFilter === 'all' || (libSourceFilter === 'custom' && a._isCustom)
    const matchSearch = !libSearch.trim() || a.name.toLowerCase().includes(libSearch.toLowerCase())
    // When no search and not filtering to custom, hide results to avoid listing all ~500 OggDude entries
    if (!libSearch.trim() && libSourceFilter !== 'custom') return false
    return matchType && matchSource && matchSearch
  })

  return {
    library,
    libSearch,
    setLibSearch,
    libTypeFilter,
    setLibTypeFilter,
    libSourceFilter,
    setLibSourceFilter,
    libLoading,
    libError,
    filteredLib,
  }
}
