import { createClient } from '@/lib/supabase/client'
import type { RefSkill, RefTalent, RefSpecialization, RefCareer } from '@/lib/types'

/**
 * Shared reference-data cache (Prompt 7c) — ref_skills, ref_talents,
 * ref_specializations, ref_careers are static per dataset and identical for
 * every character. Fetched at most once per session per dataset, shared by
 * useCharacterData (the sheet) and useTalentSurfaceData (the talents route).
 *
 * Keyed by dataset string ('respec' | 'oggdude') — a dataset switch (via
 * campaign_settings.active_dataset) can never serve the wrong dataset's rows
 * because the cache key IS the dataset value; a different `ds` is simply a
 * cache miss that fetches fresh. In practice `fetchActiveDataset` itself
 * caches the resolved dataset for the life of the page (see activeDataset.ts)
 * and nothing in the app writes campaign_settings.active_dataset at runtime,
 * so this never actually changes mid-session today — but the keying makes
 * that assumption's failure mode "extra fetch," not "wrong data."
 *
 * ref_talents' two queries (dataset-filtered standard + is_custom overrides)
 * are merged here into one array, exactly as both consumers already merged
 * them identically — this is shared normalization, not one consumer's shape
 * imposed on another. ref_specializations' retired-spec fallback merge is
 * NOT done here — that depends on which specs a specific character owns, so
 * it stays in each consumer as character-specific post-processing on top of
 * this cache's dataset-scoped rows.
 *
 * Module-level singleton — safe under Next.js: this only ever runs in the
 * browser (every caller is a 'use client' hook using the browser Supabase
 * client), so there is no SSR module-instance sharing across requests/users
 * to worry about; the cache lives for the lifetime of one browser tab, same
 * as fetchActiveDataset's own `_cached` variable in activeDataset.ts.
 */

export interface RefDataSet {
  refSkills: RefSkill[]
  refTalents: RefTalent[]
  refSpecializations: RefSpecialization[]
  refCareers: RefCareer[]
}

const cache = new Map<string, RefDataSet>()
const inFlight = new Map<string, Promise<RefDataSet>>()

async function fetchRefData(dataset: string): Promise<RefDataSet> {
  const supabase = createClient()
  const [skillsRes, talStdRes, talCustRes, specRes, careerRes] = await Promise.all([
    supabase.from('ref_skills').select('*'),
    supabase.from('ref_talents').select('*').eq('dataset_source', dataset).eq('is_retired', false),
    supabase.from('ref_talents').select('*').eq('is_custom', true),
    supabase.from('ref_specializations').select('*').eq('dataset_source', dataset).eq('is_retired', false),
    supabase.from('ref_careers').select('*').eq('dataset_source', dataset).eq('is_retired', false),
  ])

  const stdTalents  = (talStdRes.data as RefTalent[]) || []
  const custTalents = (talCustRes.data as RefTalent[]) || []
  const stdKeys     = new Set(stdTalents.map(t => t.key))

  return {
    refSkills: (skillsRes.data as RefSkill[]) || [],
    refTalents: [...stdTalents, ...custTalents.filter(t => !stdKeys.has(t.key))],
    refSpecializations: (specRes.data as RefSpecialization[]) || [],
    refCareers: (careerRes.data as RefCareer[]) || [],
  }
}

/** Returns cached data if present, joins an in-flight request if one is already running for this dataset, or starts a new fetch. Two consumers mounting in quick succession share ONE request. */
export function getRefData(dataset: string): Promise<RefDataSet> {
  const cached = cache.get(dataset)
  if (cached) return Promise.resolve(cached)

  const pending = inFlight.get(dataset)
  if (pending) return pending

  const promise = fetchRefData(dataset)
    .then(data => {
      cache.set(dataset, data)
      inFlight.delete(dataset)
      return data
    })
    .catch(err => {
      inFlight.delete(dataset)
      throw err
    })
  inFlight.set(dataset, promise)
  return promise
}

/** Fire-and-forget cache warm for hover/focus-intent prefetch — never throws into the caller, idempotent (a warm or in-flight cache is a no-op beyond the promise already in progress). */
export function warmRefDataCache(dataset: string): void {
  getRefData(dataset).catch(() => {})
}
