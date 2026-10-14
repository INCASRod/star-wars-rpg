import type { SupabaseClient } from '@supabase/supabase-js'

/** reSpecialized Primer v2.1: every Career Power / Bonus Career Power a character
 * has counts as having the Mentor discount — -5 XP off that power's Basic Power. */
export const MENTOR_DISCOUNT = 5

/** Row of `ref_career_powers` (migration 143). `power_key` is null only for the
 * "any Force Power" cases (PADAWAN / MASTER), which are not handled yet. */
export interface CareerPowerRow {
  scope: 'career' | 'specialization'
  scope_key: string
  power_key: string | null
  any_power_count: number
}

let rowsPromise: Promise<CareerPowerRow[]> | null = null

/** ref_career_powers is ~100 static rows — fetched once per page load. */
export function fetchCareerPowerRows(supabase: SupabaseClient): Promise<CareerPowerRow[]> {
  if (!rowsPromise) {
    rowsPromise = Promise.resolve(
      supabase
        .from('ref_career_powers')
        .select('scope, scope_key, power_key, any_power_count')
        .eq('dataset_source', 'respec'),
    ).then(({ data, error }) => {
      if (error) { rowsPromise = null; console.warn('[careerPowers] fetch failed:', error.message); return [] }
      return (data ?? []) as CareerPowerRow[]
    })
  }
  return rowsPromise
}

/** Named power keys listed for one career or specialization. */
export function powersFor(rows: CareerPowerRow[], scope: CareerPowerRow['scope'], key: string | null | undefined): string[] {
  if (!key) return []
  return rows.filter(r => r.scope === scope && r.scope_key === key && r.power_key).map(r => r.power_key as string)
}

/** Every power that is a Career Power for this character: the career's two plus
 * each owned specialization's two Bonus Career Powers. */
export function deriveCareerPowerKeys(rows: CareerPowerRow[], careerKey: string | null | undefined, specKeys: string[]): Set<string> {
  const out = new Set<string>(powersFor(rows, 'career', careerKey))
  for (const k of specKeys) for (const p of powersFor(rows, 'specialization', k)) out.add(p)
  return out
}
