'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CharacterSkill } from '@/lib/types'

/** Loads character_skills for the given character IDs. Returns a map keyed by character_id. */
export function useCharacterSkills(characterIds: string[]): Record<string, CharacterSkill[]> {
  const [skillsByChar, setSkillsByChar] = useState<Record<string, CharacterSkill[]>>({})
  const key = characterIds.slice().sort().join(',')

  useEffect(() => {
    if (!key) return
    const supabase = createClient()
    supabase
      .from('character_skills')
      .select('id, character_id, skill_key, rank')
      .in('character_id', characterIds)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, CharacterSkill[]> = {}
        for (const row of data as CharacterSkill[]) {
          if (!map[row.character_id]) map[row.character_id] = []
          map[row.character_id].push(row)
        }
        setSkillsByChar(map)
      })
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return skillsByChar
}
