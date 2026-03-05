'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { RefSkill, RefSpecies, RefCareer, RefSpecialization, RefTalent, RefWeapon, RefArmor, RefGear, RefItemDescriptor } from '@/lib/types'

interface GameDataState {
  skills: RefSkill[]
  species: RefSpecies[]
  careers: RefCareer[]
  specializations: RefSpecialization[]
  talents: RefTalent[]
  weapons: RefWeapon[]
  armor: RefArmor[]
  gear: RefGear[]
  itemDescriptors: RefItemDescriptor[]
  loaded: boolean
  loading: boolean
  error: string | null
  loadAll: () => Promise<void>
}

export const useGameData = create<GameDataState>((set, get) => ({
  skills: [],
  species: [],
  careers: [],
  specializations: [],
  talents: [],
  weapons: [],
  armor: [],
  gear: [],
  itemDescriptors: [],
  loaded: false,
  loading: false,
  error: null,

  loadAll: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true, error: null })

    const supabase = createClient()

    try {
      const [skills, species, careers, specs, talents, weapons, armor, gear, descriptors] = await Promise.all([
        supabase.from('ref_skills').select('*'),
        supabase.from('ref_species').select('*'),
        supabase.from('ref_careers').select('*'),
        supabase.from('ref_specializations').select('*'),
        supabase.from('ref_talents').select('*'),
        supabase.from('ref_weapons').select('*'),
        supabase.from('ref_armor').select('*'),
        supabase.from('ref_gear').select('*'),
        supabase.from('ref_item_descriptors').select('*'),
      ])

      set({
        skills: (skills.data as RefSkill[]) || [],
        species: (species.data as RefSpecies[]) || [],
        careers: (careers.data as RefCareer[]) || [],
        specializations: (specs.data as RefSpecialization[]) || [],
        talents: (talents.data as RefTalent[]) || [],
        weapons: (weapons.data as RefWeapon[]) || [],
        armor: (armor.data as RefArmor[]) || [],
        gear: (gear.data as RefGear[]) || [],
        itemDescriptors: (descriptors.data as RefItemDescriptor[]) || [],
        loaded: true,
        loading: false,
      })
    } catch (err) {
      set({ error: String(err), loading: false })
    }
  },
}))
