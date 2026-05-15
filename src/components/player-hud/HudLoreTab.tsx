'use client'
import { LoreContent } from '@/components/character/LoreContent'
import { CharacterAvatar } from './CharacterAvatar'
import type { Character, RefSpecies } from '@/lib/types'

interface HudLoreTabProps {
  character: Character
  careerName: string
  speciesName: string
  refSpeciesAll: RefSpecies[]
  refDutyTypes: { key: string; name: string }[]
  refObligationTypes: { key: string; name: string }[]
  onBackstoryChange: (val: string) => void
  onNotesChange: (val: string) => void
  onPortraitUpload: (file: File) => Promise<void>
  onPortraitDelete: () => Promise<void>
}

export function HudLoreTab({
  character, careerName, speciesName,
  refSpeciesAll, refDutyTypes, refObligationTypes,
  onBackstoryChange, onNotesChange,
  onPortraitUpload, onPortraitDelete,
}: HudLoreTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <CharacterAvatar
        avatarUrl={character.portrait_url}
        characterName={character.name}
        career={careerName}
        spec={speciesName}
        onUpload={onPortraitUpload}
        onDelete={onPortraitDelete}
      />
      <LoreContent
        characterName={character.name}
        careerName={careerName}
        speciesName={speciesName}
        gender={character.gender}
        backstory={character.backstory || ''}
        notes={character.notes || ''}
        speciesRef={refSpeciesAll.find(s => s.key === character.species_key)}
        motivationType={character.motivation_type || character.obligation_type || character.duty_type}
        motivationSpecific={character.motivation_specific}
        motivationDesc={character.motivation_description || character.obligation_notes || character.duty_notes}
        motivationConfigured={character.motivation_configured}
        dutyType={character.duty_type}
        dutyValue={character.duty_value}
        dutyLore={character.duty_lore}
        dutyCustomName={character.duty_custom_name}
        dutyResolvedType={refDutyTypes.find(d => d.key === character.duty_type)?.name}
        obligationType={character.obligation_type}
        obligationValue={character.obligation_value}
        obligationLore={character.obligation_lore}
        obligationCustomName={character.obligation_custom_name}
        obligationResolvedType={refObligationTypes.find(o => o.key === character.obligation_type)?.name}
        dutyObligationConfigured={character.duty_obligation_configured}
        onBackstoryChange={onBackstoryChange}
        onNotesChange={onNotesChange}
      />
    </div>
  )
}
