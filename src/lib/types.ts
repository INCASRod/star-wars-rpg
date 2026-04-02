// ═══════════════════════════════════════
// HOLOCRON TypeScript Types
// ═══════════════════════════════════════

// ── Reference Data Types ──

export interface RefSpecies {
  key: string
  name: string
  description?: string
  brawn: number
  agility: number
  intellect: number
  cunning: number
  willpower: number
  presence: number
  wound_threshold: number
  strain_threshold: number
  starting_xp: number
  abilities?: unknown
  option_choices?: unknown
  source_book?: string
  source_page?: number
}

export interface RefSkill {
  key: string
  name: string
  description?: string
  characteristic_key: string // 'BR', 'AG', 'INT', 'CUN', 'WIL', 'PR'
  type: 'stGeneral' | 'stCombat' | 'stKnowledge'
}

export interface RefCareer {
  key: string
  name: string
  description?: string
  career_skill_keys: string[]
  specialization_keys: string[]
  force_rating: number
}

export interface RefSpecialization {
  key: string
  name: string
  description?: string
  career_key: string
  career_skill_keys: string[]
  talent_tree: TalentTreeData
  is_force_sensitive?: boolean
}

export interface TalentTreeData {
  rows: TalentTreeRow[]
}

export interface TalentTreeRow {
  index: number
  cost: number
  talents: string[] // talent keys
  directions: TalentTreeDirection[]
}

export interface TalentTreeDirection {
  up?: boolean
  down?: boolean
  left?: boolean
  right?: boolean
}

export interface TalentModifiers {
  wound_threshold?: number
  strain_threshold?: number
  soak?: number
  defense_ranged?: number
  defense_melee?: number
  force_rating?: number
}

// Structured modifier fields added by migration 017 — populated from OggDude Talents.xml
export interface TalentAttributes {
  soakValue?: number
  woundThreshold?: number
  strainThreshold?: number
  defenseMelee?: number
  defenseRanged?: number
  forceRating?: number
}

export interface TalentDieModifier {
  skillKey: string
  boostCount?: number
  setbackCount?: number
}

export interface TalentRequirements {
  wearingArmor?: boolean
  soakAtLeast?: number
}

export interface RefTalent {
  key: string
  name: string
  description?: string
  activation: string // 'taPassive', 'taAction', 'taManeuver', 'taIncidental'
  is_force_talent: boolean
  is_ranked: boolean
  modifiers?: TalentModifiers | null
  // Structured fields from migration 017
  attributes?: TalentAttributes | null
  die_modifiers?: TalentDieModifier[] | null
  requirements?: TalentRequirements | null
}

export interface RefWeapon {
  key: string
  name: string
  description?: string
  skill_key: string
  damage: number
  damage_add?: number
  crit: number
  range_value: string // 'wrEngaged', 'wrShort', 'wrMedium', 'wrLong', 'wrExtreme'
  encumbrance: number
  hard_points: number
  price: number
  rarity: number
  restricted: boolean
  qualities?: WeaponQuality[]
  categories?: string[]
}

export interface WeaponQuality {
  key: string
  count?: number
}

export interface RefArmor {
  key: string
  name: string
  description?: string
  defense: number
  soak: number
  encumbrance: number
  hard_points: number
  price: number
  rarity: number
  // Structured fields from migration 018 — seeded from Armor.xml
  soak_bonus?: number
  defense_melee?: number
  defense_ranged?: number
}

// Modifier payload stored in ref_item_attachments.base_mods / added_mods
export interface RefItemAttachmentMods {
  soakAdd?: number
  defenseMeleeAdd?: number
  defenseRangedAdd?: number
  woundThresholdAdd?: number
  strainThresholdAdd?: number
}

export interface RefItemAttachment {
  key: string
  name: string
  description?: string
  base_mods?: RefItemAttachmentMods | null
  added_mods?: RefItemAttachmentMods | null
}

export interface RefGear {
  key: string
  name: string
  description?: string
  encumbrance: number
  price: number
  rarity: number
  encumbrance_bonus?: number | null
}

export interface RefMorality {
  key: string
  name: string
  description?: string
  type: 'Strength' | 'Weakness'
  paired_key?: string
}

export interface RefObligation {
  key: string
  name: string
  description?: string
}

export interface RefDuty {
  key: string
  name: string
  description?: string
}

export interface RefItemDescriptor {
  key: string
  name: string
  description?: string
  is_passive: boolean
}

export interface RefWeaponQuality {
  key:          string
  name:         string
  description:  string
  is_ranked:    boolean
  stat_modifier?: { defenseMelee?: number; defenseRanged?: number } | null
}

export interface RefCriticalInjury {
  id: number
  roll_min: number
  roll_max: number
  severity: string
  name: string
  description?: string
}

export interface RefForcePower {
  key: string
  name: string
  description?: string
  min_force_rating: number
  sources?: unknown
  ability_tree: ForceAbilityTree
}

export interface ForceAbilityTree {
  rows: ForceAbilityRow[]
}

export interface ForceAbilityRow {
  index: number
  abilities: string[]
  directions: TalentTreeDirection[]
  spans: number[]
  costs: number[]
}

export interface RefForceAbility {
  key: string
  name: string
  description?: string
  power_key: string
  sources?: unknown
}

export interface CharacterForceAbility {
  id: string
  character_id: string
  force_power_key: string
  force_ability_key: string
  tree_row: number
  tree_col: number
  xp_cost: number
}

// ── Campaign & Character Types ──

export interface Campaign {
  id: string
  name: string
  gm_pin: string
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  user_id?: string
  display_name: string
  campaign_id: string
  is_gm: boolean
  created_at: string
}

export interface Character {
  id: string
  campaign_id: string
  player_id: string
  name: string
  species_key: string
  career_key: string
  gender?: string
  portrait_url?: string
  brawn: number
  agility: number
  intellect: number
  cunning: number
  willpower: number
  presence: number
  wound_threshold: number
  wound_current: number
  strain_threshold: number
  strain_current: number
  soak: number
  defense_ranged: number
  defense_melee: number
  xp_total: number
  xp_available: number
  credits: number
  encumbrance_threshold: number
  morality_value?: number
  morality_strength_key?: string
  morality_weakness_key?: string
  obligation_type?: string
  obligation_value?: number
  obligation_notes?: string
  duty_type?: string
  duty_value?: number
  duty_notes?: string
  backstory: string
  notes: string
  created_at: string
  updated_at: string
  is_archived?: boolean
  archived_at?: string
  duty_lore?: string
  obligation_lore?: string
  duty_obligation_configured?: boolean
  duty_custom_name?: string | null
  obligation_custom_name?: string | null
  force_rating?: number
  force_rating_committed?: number
  morality_configured?: boolean
  is_dark_side_fallen?: boolean
  dark_side_fallen_at?: string
  redeemed_at?: string
}

export interface RefDutyType {
  key: string
  name: string
  description?: string
}

export interface RefObligationType {
  key: string
  name: string
  description?: string
}

export interface CharacterSpecialization {
  id: string
  character_id: string
  specialization_key: string
  is_starting: boolean
  purchase_order: number
}

export interface CharacterSkill {
  id: string
  character_id: string
  skill_key: string
  rank: number
  is_career: boolean
}

export interface CharacterTalent {
  id: string
  character_id: string
  talent_key: string
  specialization_key?: string
  tree_row?: number
  tree_col?: number
  ranks: number
  xp_cost?: number
}

export type EquipState = 'equipped' | 'carrying' | 'stowed'

export interface CharacterWeapon {
  id: string
  character_id: string
  weapon_key: string
  custom_name?: string
  is_equipped: boolean      // legacy — use equip_state
  equip_state: EquipState
  attachments: unknown[]
  notes?: string
}

export interface CharacterArmor {
  id: string
  character_id: string
  armor_key: string
  custom_name?: string
  is_equipped: boolean      // legacy — use equip_state
  equip_state: EquipState
  attachments: unknown[]
  notes?: string
}

export interface CharacterGear {
  id: string
  character_id: string
  gear_key: string
  custom_name?: string
  quantity: number
  is_equipped: boolean      // legacy — use equip_state
  equip_state: EquipState
  notes?: string
}

export interface CharacterCriticalInjury {
  id: string
  character_id: string
  injury_id?: number
  custom_name?: string
  severity: string
  description?: string
  is_healed: boolean
  received_at: string
}

// ── Composite Types (for HUD rendering) ──

export type CharacteristicKey = 'brawn' | 'agility' | 'intellect' | 'cunning' | 'willpower' | 'presence'

export const CHARACTERISTIC_ABBR: Record<string, CharacteristicKey> = {
  BR: 'brawn',
  AG: 'agility',
  INT: 'intellect',
  CUN: 'cunning',
  WIL: 'willpower',
  PR: 'presence',
}

export const RANGE_LABELS: Record<string, string> = {
  wrEngaged: 'Engaged',
  wrShort: 'Short',
  wrMedium: 'Medium',
  wrLong: 'Long',
  wrExtreme: 'Extreme',
}

export const ACTIVATION_LABELS: Record<string, string> = {
  taPassive: 'Passive',
  taAction: 'Action',
  taManeuver: 'Maneuver',
  taIncidental: 'Incidental',
  taIncidentalOOT: 'Incidental (OOT)',
}

