'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type {
  Character,
  CharacterSpecialization,
  CharacterSkill,
  CharacterTalent,
  CharacterWeapon,
  CharacterArmor,
  CharacterGear,
  CharacterCriticalInjury,
  FullCharacterData,
} from '@/lib/types'

interface CharacterState {
  data: FullCharacterData | null
  loading: boolean
  error: string | null
  load: (characterId: string) => Promise<void>
  updateVital: (field: 'wound_current' | 'strain_current', delta: number) => Promise<void>
}

export const useCharacter = create<CharacterState>((set, get) => ({
  data: null,
  loading: false,
  error: null,

  load: async (characterId: string) => {
    set({ loading: true, error: null })
    const supabase = createClient()

    try {
      const [charRes, specsRes, skillsRes, talentsRes, weaponsRes, armorRes, gearRes, critsRes] = await Promise.all([
        supabase.from('characters').select('*').eq('id', characterId).single(),
        supabase.from('character_specializations').select('*').eq('character_id', characterId),
        supabase.from('character_skills').select('*').eq('character_id', characterId),
        supabase.from('character_talents').select('*').eq('character_id', characterId),
        supabase.from('character_weapons').select('*').eq('character_id', characterId),
        supabase.from('character_armor').select('*').eq('character_id', characterId),
        supabase.from('character_gear').select('*').eq('character_id', characterId),
        supabase.from('character_critical_injuries').select('*').eq('character_id', characterId).eq('is_healed', false),
      ])

      if (charRes.error) throw charRes.error

      set({
        data: {
          character: charRes.data as Character,
          specializations: (specsRes.data as CharacterSpecialization[]) || [],
          skills: (skillsRes.data as CharacterSkill[]) || [],
          talents: (talentsRes.data as CharacterTalent[]) || [],
          weapons: (weaponsRes.data as CharacterWeapon[]) || [],
          armor: (armorRes.data as CharacterArmor[]) || [],
          gear: (gearRes.data as CharacterGear[]) || [],
          criticalInjuries: (critsRes.data as CharacterCriticalInjury[]) || [],
        },
        loading: false,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: message, loading: false })
    }
  },

  updateVital: async (field, delta) => {
    const state = get()
    if (!state.data) return

    const char = state.data.character
    const maxField = field === 'wound_current' ? 'wound_threshold' : 'strain_threshold'
    const newValue = Math.max(0, Math.min(char[field] + delta, char[maxField]))

    // Optimistic update
    set({
      data: {
        ...state.data,
        character: { ...char, [field]: newValue },
      },
    })

    const supabase = createClient()
    const { error } = await supabase
      .from('characters')
      .update({ [field]: newValue })
      .eq('id', char.id)

    if (error) {
      // Revert on failure
      set({
        data: {
          ...state.data,
          character: { ...char },
        },
      })
    }
  },
}))
