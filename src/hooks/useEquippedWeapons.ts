'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CharacterWeapon {
  id:           string
  character_id: string
  weapon_key:   string
  custom_name:  string | null
  is_equipped:  boolean
  equip_state:  string | null
}

/** Loads equipped character_weapons for the given character IDs. Returns a map keyed by character_id. */
export function useEquippedWeapons(characterIds: string[]): Record<string, CharacterWeapon[]> {
  const [equippedByChar, setEquippedByChar] = useState<Record<string, CharacterWeapon[]>>({})
  const key = characterIds.slice().sort().join(',')

  useEffect(() => {
    if (!key) return
    const supabase = createClient()
    supabase
      .from('character_weapons')
      .select('id, character_id, weapon_key, custom_name, is_equipped, equip_state')
      .in('character_id', characterIds)
      .then(({ data }) => {
        if (!data) return
        const equipped = (data as CharacterWeapon[]).filter(w => w.equip_state === 'equipped' || w.is_equipped)
        const byChar: Record<string, CharacterWeapon[]> = {}
        for (const w of equipped) {
          if (!byChar[w.character_id]) byChar[w.character_id] = []
          byChar[w.character_id].push(w)
        }
        setEquippedByChar(byChar)
      })
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return equippedByChar
}
