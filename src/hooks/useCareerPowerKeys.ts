'use client'
import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchCareerPowerRows, deriveCareerPowerKeys, type CareerPowerRow } from '@/lib/careerPowers'

/** Set of Force power keys that are Career Powers for a character (career +
 * owned specializations' Bonus Career Powers). Drives the Mentor discount in
 * useForcePowers. Empty until ref_career_powers has loaded. */
export function useCareerPowerKeys(
  supabase: SupabaseClient,
  careerKey: string | null | undefined,
  specKeys: string[],
): Set<string> {
  const [rows, setRows] = useState<CareerPowerRow[]>([])
  useEffect(() => {
    let alive = true
    fetchCareerPowerRows(supabase).then(r => { if (alive) setRows(r) })
    return () => { alive = false }
  }, [supabase])
  const specSig = specKeys.join('|')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => deriveCareerPowerKeys(rows, careerKey, specKeys), [rows, careerKey, specSig])
}
