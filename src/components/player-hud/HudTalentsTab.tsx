'use client'

import { TalentsPanel as WfTalentsPanel } from '@/components/wireframe/TalentsPanel'
import type { Character, CharacterSpecialization, CharacterTalent, RefSkill, RefSpecialization, RefTalent, SpeciesAbility } from '@/lib/types'
import type { HudTalent } from './TalentsPanel'

interface HudTalentsTabProps {
  character: Character
  characterId: string
  careerName: string
  speciesName: string
  charSpecs: CharacterSpecialization[]
  refSpecMap: Record<string, RefSpecialization>
  refSpecs: RefSpecialization[]
  refTalentMap: Record<string, RefTalent>
  refSkillMap: Record<string, RefSkill>
  careerSpecKeys: Set<string>
  specKeyToCareerName: Record<string, string>
  talents: CharacterTalent[]
  hudTalents: HudTalent[]
  speciesAbilities: SpeciesAbility[]
  activeSpecKey: string | null
  setActiveSpecKey: (k: string) => void
  isCombat: boolean
  isGmMode?: boolean
  onBuySpecialization: (specKey: string, setSpecKey: (k: string) => void) => void
}

// Prompt B2 (Talents redesign) — wireframe/TalentsPanel.tsx now renders the
// entire panel (hero, systems card, grid, species section, drawer). This
// wrapper only exists as the HudFullPanel mount-site data boundary, same
// role useTalentSurfaceData plays for the talents route — it owns no UI of
// its own. The old compact spec/XP bar and per-spec "Upgrade Talents"
// footer were removed; their content is now the hero's job.
export function HudTalentsTab(props: HudTalentsTabProps) {
  return <WfTalentsPanel {...props} />
}
