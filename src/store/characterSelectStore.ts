import { create } from 'zustand'
import type { Character } from '@/lib/types'

interface CharacterSelectState {
  selectedCharacter: Character | null
  setSelectedCharacter: (c: Character | null) => void
}

export const useCharacterSelectStore = create<CharacterSelectState>()((set) => ({
  selectedCharacter: null,
  setSelectedCharacter: (c) => set({ selectedCharacter: c }),
}))
