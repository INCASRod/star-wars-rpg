'use client'
import { LoreContent } from '@/components/character/LoreContent'
import { CharacterAvatar } from './CharacterAvatar'
import { isForceUserSensitive } from '@/lib/forceUtils'
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
  const isForceUser = isForceUserSensitive(character)

  // Obligation/Duty summary chip — obligation takes priority when both configured
  const obligationChip = character.duty_obligation_configured
    ? character.obligation_type && character.obligation_value !== undefined
      ? `Obligation · ${character.obligation_value}`
      : character.duty_type && character.duty_value !== undefined
      ? `Duty · ${character.duty_value}`
      : undefined
    : undefined

  // Motivation chip — "Type · Specific" or just "Type"
  const motivationChip = character.motivation_configured && character.motivation_type
    ? character.motivation_specific
      ? `${character.motivation_type} · ${character.motivation_specific}`
      : character.motivation_type
    : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <CharacterAvatar
        avatarUrl={character.portrait_url}
        characterName={character.name}
        career={careerName}
        spec={speciesName}
        gender={character.gender}
        onUpload={onPortraitUpload}
        onDelete={onPortraitDelete}
        obligationChip={obligationChip}
        // TODO: wire conflictTotal from conflict entries when GM Force tab feature ships
        conflictTotal={undefined}
        motivationChip={motivationChip}
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
        // TODO: wire conflictEntries from GM Force tab feature
        conflictEntries={[]}
        isForceUser={isForceUser}
        onBackstoryChange={onBackstoryChange}
        onNotesChange={onNotesChange}
      />
    </div>
  )
}
