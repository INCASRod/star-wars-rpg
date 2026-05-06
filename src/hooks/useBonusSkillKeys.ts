'use client'
import { useMemo } from 'react'

export function useBonusSkillKeys(
  skillModifiers: Record<string, { boostAdd: number; setbackRemove: number }>,
  talents: { talent_key: string }[],
  refTalentMap: Record<string, { modifiers?: { relevant_skills?: string[] | null } | null }>,
  speciesAbilities: { mechanical_type?: string; talent_key?: string | null; affected_skills?: (string | null)[] | null }[],
): Set<string> {
  return useMemo(() => {
    const keys = new Set<string>()
    for (const [key, mod] of Object.entries(skillModifiers)) {
      if (mod.boostAdd > 0 || mod.setbackRemove > 0) keys.add(key)
    }
    for (const t of talents) {
      const ref = refTalentMap[t.talent_key]
      const relevant = ref?.modifiers?.relevant_skills
      if (Array.isArray(relevant)) {
        for (const sk of relevant) keys.add(sk)
      }
    }
    for (const sa of speciesAbilities) {
      if (sa.mechanical_type === 'talent_rank' && sa.talent_key) {
        const relevant = refTalentMap[sa.talent_key]?.modifiers?.relevant_skills
        if (Array.isArray(relevant)) {
          for (const sk of relevant) keys.add(sk)
        }
      }
      if (sa.mechanical_type === 'die_modifier' && Array.isArray(sa.affected_skills)) {
        for (const sk of sa.affected_skills) { if (sk) keys.add(sk) }
      }
    }
    return keys
  }, [skillModifiers, talents, refTalentMap, speciesAbilities])
}
