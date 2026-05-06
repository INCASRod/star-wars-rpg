import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { WeaponRef } from '@/lib/resolve-weapon'

/** Loads all ref_weapons once on mount and returns them keyed by lowercased name. */
export function useRefWeapons(): Record<string, WeaponRef> {
  const [refWeapons, setRefWeapons] = useState<Record<string, WeaponRef>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('ref_weapons')
      .select('name, damage, damage_add, range_value')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, WeaponRef> = {}
        for (const w of data as { name: string; damage: number; damage_add: number | null; range_value: string | null }[]) {
          map[w.name.toLowerCase()] = w
        }
        setRefWeapons(map)
      })
  }, []) // load once on mount

  return refWeapons
}
