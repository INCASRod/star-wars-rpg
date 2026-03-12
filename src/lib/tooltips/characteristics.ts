/** Static tooltip content for FFG/Genesys characteristics */

export interface CharacteristicTooltip {
  name:          string
  color:         string
  description:   string
  linkedSkills:  string[]
  diceFormula:   string
}

export const CHAR_TIPS: Record<string, CharacteristicTooltip> = {
  brawn: {
    name:        'Brawn',
    color:       '#E07855',
    description: 'Raw physical power, toughness, and body mass. Brawn determines how hard you hit in melee, how much you can carry, and how much damage you can absorb.',
    linkedSkills: ['Athletics', 'Brawl', 'Melee', 'Resilience', 'Coercion (intimidation)'],
    diceFormula:  'Each point adds 1 Wound Threshold at character creation.',
  },
  agility: {
    name:        'Agility',
    color:       '#4EC87A',
    description: 'Speed, nimbleness, and hand-eye coordination. Agility governs accuracy with ranged weapons, acrobatic feats, and the ability to dodge danger.',
    linkedSkills: ['Coordination', 'Gunnery', 'Piloting (Planetary)', 'Piloting (Space)', 'Ranged (Heavy)', 'Ranged (Light)', 'Skulduggery (sleight of hand)', 'Stealth'],
    diceFormula:  'Proficiency dice = min(characteristic, rank). Ability dice = max(characteristic, rank) − min.',
  },
  intellect: {
    name:        'Intellect',
    color:       '#5AAAE0',
    description: 'Reasoning, memory, and analytical thinking. Intellect drives knowledge checks, medicine, slicing, and mechanical repairs.',
    linkedSkills: ['Astrogation', 'Computers', 'Education', 'Lore', 'Medicine', 'Outer Rim', 'Underworld', 'Warfare', 'Xenology'],
    diceFormula:  'Each point adds 1 Strain Threshold at character creation.',
  },
  cunning: {
    name:        'Cunning',
    color:       '#D4B840',
    description: 'Streetwise instinct, deception, and practical cleverness. Cunning covers survival, perception, and the ability to outmanoeuvre opponents socially.',
    linkedSkills: ['Deception', 'Perception', 'Skullduggery (theft & locks)', 'Streetwise', 'Survival', 'Vigilance'],
    diceFormula:  'Proficiency dice = min(characteristic, rank). Ability dice = remainder.',
  },
  willpower: {
    name:        'Willpower',
    color:       '#B070D8',
    description: 'Mental fortitude, discipline, and connection to the Force. Willpower governs the ability to resist fear, push through pain, and channel Force powers.',
    linkedSkills: ['Cool', 'Discipline', 'Vigilance (secondary)', 'Force powers (some)'],
    diceFormula:  'Each point adds 1 Strain Threshold at character creation. Force-sensitive characters use Willpower for many power checks.',
  },
  presence: {
    name:        'Presence',
    color:       '#D87060',
    description: 'Force of personality, charisma, and social influence. Presence shapes how others perceive you and your ability to lead, charm, or intimidate.',
    linkedSkills: ['Charm', 'Coercion', 'Leadership', 'Negotiation', 'Streetwise (secondary)'],
    diceFormula:  'Proficiency dice = min(characteristic, rank). Ability dice = remainder.',
  },
}
