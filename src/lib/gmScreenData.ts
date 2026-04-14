// ═══════════════════════════════════════════════════════════
// HOLOCRON — GM Reference Screen Static Data
// Source: Age of Rebellion Core Rulebook
// ═══════════════════════════════════════════════════════════

// ── Shared types ──────────────────────────────────────────

export interface DiceType {
  name:     string
  color:    string
  sides:    number
  contains: string[]
}

export interface DiceSymbol {
  name:  string
  rules: string
}

export interface DifficultyLevel {
  name:    string
  dice:    string
  example: string
}

export interface RangeDifficulty {
  band:       string
  difficulty: string
  dice:       string
}

export interface RangeModifier {
  situation: string
  modifier:  string
}

export interface SpendingEntry {
  cost:    string
  results: string[]
}

export interface CombatManeuver {
  name:        string
  description: string
}

export interface CombatAction {
  name:        string
  description: string
}

export interface CriticalInjury {
  rollMin:   number
  rollMax:   number
  severity:  string
  dieName:   string
  name:      string
  effect:    string
}

export interface ArmorEntry {
  name:       string
  defense:    number | string
  soak:       number | string
  encumbrance?: number | string
  notes?:     string
}

export interface VehicleCritHit {
  rollMin:   number
  rollMax:   number
  severity:  string
  dieName:   string
  name:      string
  effect:    string
}

export interface SilhouetteRow {
  difference: string
  difficulty: string
  dice:       string
}

export interface DamageControlRow {
  hullLevel:  string
  difficulty: string
  dice:       string
}

export interface MedicalCheckRow {
  wounds:     string
  difficulty: string
  dice:       string
}

export interface WeaponEntry {
  name:     string
  skill:    string
  damage:   string
  crit:     string
  range:    string
  encum:    string | number
  hp:       string | number
  price:    string
  rarity:   string | number
  special:  string
}

export interface WeaponGroup {
  label:   string
  weapons: WeaponEntry[]
}

export interface ItemQuality {
  name:        string
  type:        'Active' | 'Passive'
  description: string
}

// ══════════════════════════════════════════════════════════
// TAB: DICE
// ══════════════════════════════════════════════════════════

export const DICE_TYPES: DiceType[] = [
  {
    name:     'Ability',
    color:    '#4EC87A',
    sides:    8,
    contains: ['Success', 'Advantage', 'Success+Advantage', 'Blank'],
  },
  {
    name:     'Proficiency',
    color:    '#C8AA50',
    sides:    12,
    contains: ['Success', 'Advantage', 'Success+Advantage', 'Triumph', 'Blank'],
  },
  {
    name:     'Difficulty',
    color:    '#7B52AB',
    sides:    8,
    contains: ['Failure', 'Threat', 'Failure+Threat', 'Blank'],
  },
  {
    name:     'Challenge',
    color:    '#E05050',
    sides:    12,
    contains: ['Failure', 'Threat', 'Failure+Threat', 'Despair', 'Blank'],
  },
  {
    name:     'Boost',
    color:    '#5AAAE0',
    sides:    6,
    contains: ['Success', 'Advantage', 'Success+Advantage', 'Blank'],
  },
  {
    name:     'Setback',
    color:    '#3A3A3A',
    sides:    6,
    contains: ['Failure', 'Threat', 'Blank'],
  },
  {
    name:     'Force',
    color:    '#E8DFC8',
    sides:    12,
    contains: ['Light Side (1)', 'Light Side (2)', 'Dark Side (1)', 'Dark Side (2)'],
  },
]

export const DICE_SYMBOLS: DiceSymbol[] = [
  {
    name:  'Success',
    rules: 'Each net Success contributes to the magnitude of the result. On a combat check, each net Success adds +1 damage. Cancel Failures one-for-one.',
  },
  {
    name:  'Failure',
    rules: 'Each Failure cancels one Success. If Failures outnumber Successes, the check fails. Net Failures do not increase negative effects beyond the check failing.',
  },
  {
    name:  'Advantage',
    rules: 'Advantage can be spent for secondary beneficial effects even on a failed check. It cancels Threat one-for-one. Common spends: recover 1 strain (1), add Boost to next ally check (1), trigger weapon quality (varies).',
  },
  {
    name:  'Threat',
    rules: 'Threat can trigger secondary negative effects even on a successful check. It cancels Advantage one-for-one. Common spends: suffer 1 strain (1), attacker falls prone (2), enemy free maneuver (2).',
  },
  {
    name:  'Triumph',
    rules: 'Counts as one uncancellable Success AND triggers a powerful special effect. Unlike Advantage, Triumph cannot be cancelled by Despair or Threat. Common uses: activate Critical Injury, perform something remarkable.',
  },
  {
    name:  'Despair',
    rules: 'Counts as one uncancellable Failure AND triggers a significant complication. Unlike Threat, Despair cannot be cancelled by Triumph or Advantage. Common uses: weapon runs out of ammo, equipment damaged, enemy reinforcements arrive.',
  },
]

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  {
    name:    'Simple',
    dice:    '—',
    example: 'Routine task; outcome rarely in question. No roll needed unless the GM wants to gauge the magnitude of success.',
  },
  {
    name:    'Easy',
    dice:    '1♦',
    example: 'Picking a primitive lock, tending minor cuts, finding food on a lush planet, shooting a target at short range.',
  },
  {
    name:    'Average',
    dice:    '2♦',
    example: 'Picking a typical lock, stitching a small wound, finding food on a temperate planet, shooting at medium range, striking while engaged.',
  },
  {
    name:    'Hard',
    dice:    '3♦',
    example: 'Picking a complicated lock, setting broken bones, finding food on a rugged planet, shooting at long range.',
  },
  {
    name:    'Daunting',
    dice:    '4♦',
    example: 'Picking a sophisticated lock, performing surgery, finding food on a barren desert planet, shooting at extreme range.',
  },
  {
    name:    'Formidable',
    dice:    '5♦',
    example: 'Picking a lock with no comprehensible mechanism, cloning a new body, finding shelter on a planet without breathable atmosphere.',
  },
]

// ══════════════════════════════════════════════════════════
// TAB: COMBAT
// ══════════════════════════════════════════════════════════

export const ATTACK_DIFFICULTIES: RangeDifficulty[] = [
  { band: 'Engaged',  difficulty: 'Easy',     dice: '1♦' },
  { band: 'Short',    difficulty: 'Easy',     dice: '1♦' },
  { band: 'Medium',   difficulty: 'Average',  dice: '2♦' },
  { band: 'Long',     difficulty: 'Hard',     dice: '3♦' },
  { band: 'Extreme',  difficulty: 'Daunting', dice: '4♦' },
]

export const ATTACK_DIFFICULTY_NOTE = 'Brawl and Melee attacks are always Average (2♦), regardless of range band. Engaged range with Ranged weapons incurs additional modifiers (see below).'

export const RANGED_MODIFIERS: RangeModifier[] = [
  { situation: 'Engaged — Ranged (Light)',  modifier: '+1 Difficulty die' },
  { situation: 'Engaged — Ranged (Heavy)',  modifier: '+2 Difficulty dice' },
  { situation: 'Engaged — Gunnery',         modifier: 'Cannot make the check' },
]

export const ADVANTAGE_TRIUMPH_SPENDING: SpendingEntry[] = [
  {
    cost: '1 Advantage',
    results: [
      'Recover 1 strain.',
      'Add a Boost die to the next allied active character\'s check.',
      'Notice a single important point in the conflict (location of a control panel, weak point on a vehicle, etc.).',
    ],
  },
  {
    cost: '1 Advantage (per trigger)',
    results: [
      'Perform an immediate free maneuver, without exceeding the 2-maneuver-per-turn limit.',
      'Add a Setback die to the targeted character\'s next check.',
      'Negate the target\'s defensive bonuses (cover, Guarded Stance, equipment) until end of the current round.',
      'Ignore penalising environmental effects (weather, zero-g) until end of your next turn.',
    ],
  },
  {
    cost: '2 Advantage or 1 Triumph',
    results: [
      'Gain +1 melee or ranged defense until end of your next turn.',
      'Force the target to drop a weapon or item it is wielding.',
      'Disable an opponent or piece of gear rather than dealing wounds (temporary, agreed between player and GM).',
    ],
  },
  {
    cost: '3 Advantage or 1 Triumph',
    results: [
      'Inflict a Critical Injury on a successful attack that deals damage past soak (cost may vary by weapon quality).',
      'Activate a weapon quality (actual cost may vary; check weapon\'s quality rating).',
    ],
  },
  {
    cost: '1 Triumph',
    results: [
      'Upgrade the ability of any allied character\'s next check (including your own).',
      'Upgrade the difficulty of the targeted character\'s next check.',
      'Do something vital — shoot the controls to seal blast doors, sever a power conduit, etc.',
      'Destroy a piece of equipment the target is using.',
    ],
  },
]

export const THREAT_DESPAIR_SPENDING: SpendingEntry[] = [
  {
    cost: '1 Threat',
    results: [
      'The active character suffers 1 strain.',
      'An opponent immediately performs one free maneuver in response to the active character\'s check.',
      'Add a Setback die to any allied character\'s next check (including the active character).',
      'The active character falls prone.',
    ],
  },
  {
    cost: '2 Threat or 1 Despair',
    results: [
      'The active character loses the benefits of a prior maneuver (cover, Guarded Stance) until it is performed again.',
      'The character\'s ranged weapon immediately runs out of ammunition for the remainder of the encounter.',
      'The tool or melee weapon being used becomes damaged.',
      'Upgrade the difficulty of any allied character\'s next check.',
    ],
  },
  {
    cost: '3 Threat or 1 Despair',
    results: [
      'The active character cannot voluntarily suffer strain to activate abilities or gain additional maneuvers until their next turn.',
    ],
  },
  {
    cost: '4 Threat or 1 Despair',
    results: [
      'The active character grants the enemy a significant advantage — accidentally blasting escape route controls, knocking a companion into the open, etc.',
    ],
  },
  {
    cost: '1 Despair',
    results: [
      'A complication arises: a weapon malfunctions, an alarm is triggered, reinforcements arrive, or a similar dramatic setback decided by the GM.',
    ],
  },
]

export const COMBAT_MANEUVERS: CombatManeuver[] = [
  {
    name:        'Aim',
    description: 'Steady a weapon before attacking. Gain 1 Boost die on the next combat check (or 2 consecutive Aim maneuvers grant 2 Boost dice). Alternatively, aim at a specific location; costs extra Difficulty dice on the attack.',
  },
  {
    name:        'Assist',
    description: 'Help an engaged ally. The next check that ally performs gains 1 Boost die. Multiple characters assisting add additional Boost dice.',
  },
  {
    name:        'Guarded Stance',
    description: 'Assume a defensive fighting posture. Until the end of your next turn: add 1 Setback die to all your own combat checks, but gain +1 melee defense.',
  },
  {
    name:        'Interact with the Environment',
    description: 'Manipulate a single object in the environment: open or close a door, take cover (grants ranged defense 1), press a button, pick up a loose item from the ground.',
  },
  {
    name:        'Manage Gear',
    description: 'Draw, holster, or reload a weapon; retrieve an item from a bag or equipment slot; stow an item on your person.',
  },
  {
    name:        'Mount / Dismount',
    description: 'Mount or dismount a domesticated animal, vehicle, or riding animal that is within engaged range.',
  },
  {
    name:        'Move',
    description: 'Move within or between range bands. Options include: engage or disengage from an opponent, move to a new location within short range, sprint (move up to medium range, suffer 1 strain).',
  },
  {
    name:        'Drop Prone / Stand from Prone',
    description: 'Drop prone: enemies add 1 Boost die to ranged attacks against you, but add 2 Setback dice to melee attacks. Standing from prone requires a maneuver.',
  },
  {
    name:        'Preparation',
    description: 'Some abilities require preparation maneuvers before they can be used (e.g., weapons with the Prepare quality). Each use of this maneuver satisfies one Prepare rating.',
  },
  {
    name:        'Exchange Action for Maneuver',
    description: 'Forfeit your action this turn to gain an additional maneuver. A character may take no more than 2 maneuvers per turn total.',
  },
]

export const COMBAT_ACTIONS: CombatAction[] = [
  {
    name:        'Exchange Action for Maneuver',
    description: 'Forfeit the action to perform an additional maneuver. No more than 2 maneuvers may be taken per turn.',
  },
  {
    name:        'Activate an Ability',
    description: 'Spend the action to activate a talent, special ability, or species trait that requires an action.',
  },
  {
    name:        'Activate a Force Power',
    description: 'Spend the action to activate a Force power. Most Force powers require an action to use; some upgrades may reduce this.',
  },
  {
    name:        'Perform a Skill Check',
    description: 'Make any non-combat skill check: Computers, Medicine, Mechanics, Negotiation, etc. Counts as the character\'s action for the turn.',
  },
  {
    name:        'Perform a Combat Check',
    description: 'Attack a target using Brawl, Gunnery, Lightsaber, Melee, Ranged (Light), or Ranged (Heavy). Resolve the attack, apply damage, and spend symbols.',
  },
]

export const ACTION_ECONOMY_NOTE = 'Each character gets 1 Action and 1 Maneuver per turn. A character may suffer 2 strain to perform a second maneuver. Maximum 2 maneuvers per turn regardless of source.'

// ══════════════════════════════════════════════════════════
// TAB: INJURIES
// ══════════════════════════════════════════════════════════

export const CRITICAL_INJURIES: CriticalInjury[] = [
  { rollMin: 1,   rollMax: 5,   severity: 'Easy',     dieName: '1♦',  name: 'Minor Nick',          effect: 'The target suffers 1 strain.' },
  { rollMin: 6,   rollMax: 10,  severity: 'Easy',     dieName: '1♦',  name: 'Slowed Down',         effect: 'The target can only act during the last allied Initiative slot on his next turn.' },
  { rollMin: 11,  rollMax: 15,  severity: 'Easy',     dieName: '1♦',  name: 'Off-Balance',         effect: 'Add 1 Setback die to the target\'s next skill check.' },
  { rollMin: 16,  rollMax: 20,  severity: 'Easy',     dieName: '1♦',  name: 'Sudden Jolt',         effect: 'The target drops whatever is held in hand.' },
  { rollMin: 21,  rollMax: 25,  severity: 'Easy',     dieName: '1♦',  name: 'Distracted',          effect: 'The target cannot perform a free maneuver during his next turn.' },
  { rollMin: 26,  rollMax: 30,  severity: 'Easy',     dieName: '1♦',  name: 'Discouraging Wound',  effect: 'Flip one light side Destiny Point to dark side (reverse if NPC).' },
  { rollMin: 31,  rollMax: 35,  severity: 'Easy',     dieName: '1♦',  name: 'Stunned',             effect: 'The target is staggered until the end of his next turn.' },
  { rollMin: 36,  rollMax: 40,  severity: 'Easy',     dieName: '1♦',  name: 'Stinger',             effect: 'Increase the difficulty of the target\'s next check by one.' },
  { rollMin: 41,  rollMax: 45,  severity: 'Average',  dieName: '2♦',  name: 'Bowled Over',         effect: 'The target is knocked prone and suffers 1 strain.' },
  { rollMin: 46,  rollMax: 50,  severity: 'Average',  dieName: '2♦',  name: 'Head Ringer',         effect: 'The target increases the difficulty of all Intellect and Cunning checks by one until end of encounter.' },
  { rollMin: 51,  rollMax: 55,  severity: 'Average',  dieName: '2♦',  name: 'Fearsome Wound',      effect: 'The target increases the difficulty of all Presence and Willpower checks by one until end of encounter.' },
  { rollMin: 56,  rollMax: 60,  severity: 'Average',  dieName: '2♦',  name: 'Agonizing Wound',     effect: 'The target increases the difficulty of all Brawn and Agility checks by one until end of encounter.' },
  { rollMin: 61,  rollMax: 65,  severity: 'Average',  dieName: '2♦',  name: 'Slightly Dazed',      effect: 'The target is disoriented until the end of the encounter.' },
  { rollMin: 66,  rollMax: 70,  severity: 'Average',  dieName: '2♦',  name: 'Scattered Senses',    effect: 'The target removes all Boost dice from all skill checks until the end of the encounter.' },
  { rollMin: 71,  rollMax: 75,  severity: 'Average',  dieName: '2♦',  name: 'Hamstrung',           effect: 'The target loses his free maneuver until the end of the encounter.' },
  { rollMin: 76,  rollMax: 80,  severity: 'Average',  dieName: '2♦',  name: 'Overpowered',         effect: 'The target leaves himself open; the attacker may immediately attempt one free attack using the exact same dice pool as the original attack.' },
  { rollMin: 81,  rollMax: 85,  severity: 'Average',  dieName: '2♦',  name: 'Winded',              effect: 'Until the end of the encounter, the target cannot voluntarily suffer strain to activate abilities or gain additional maneuvers.' },
  { rollMin: 86,  rollMax: 90,  severity: 'Hard',     dieName: '3♦',  name: 'Compromised',         effect: 'Increase the difficulty of all the target\'s skill checks by one until the end of the encounter.' },
  { rollMin: 91,  rollMax: 95,  severity: 'Hard',     dieName: '3♦',  name: 'At the Brink',        effect: 'The target suffers 1 strain each time he performs an action.' },
  { rollMin: 96,  rollMax: 100, severity: 'Hard',     dieName: '3♦',  name: 'Crippled',            effect: 'One of the target\'s limbs (GM\'s choice) is crippled until healed or replaced. Increase difficulty of all checks requiring that limb by one.' },
  { rollMin: 101, rollMax: 105, severity: 'Hard',     dieName: '3♦',  name: 'Maimed',              effect: 'One of the target\'s limbs (GM\'s choice) is permanently lost. The target cannot perform actions requiring that limb. All other actions gain 1 Setback die.' },
  { rollMin: 106, rollMax: 110, severity: 'Hard',     dieName: '3♦',  name: 'Horrific Injury',     effect: 'Roll 1d10: 1–3 Brawn, 4–6 Agility, 7 Intellect, 8 Cunning, 9 Presence, 10 Willpower. Treat that characteristic as 1 lower until this Critical Injury is healed.' },
  { rollMin: 111, rollMax: 115, severity: 'Hard',     dieName: '3♦',  name: 'Temporarily Lame',    effect: 'Until this Critical Injury is healed, the target cannot perform more than one maneuver during his turn.' },
  { rollMin: 116, rollMax: 120, severity: 'Daunting', dieName: '4♦',  name: 'Blinded',             effect: 'The target can no longer see. Upgrade the difficulty of all checks twice. Upgrade Perception and Vigilance checks three times instead.' },
  { rollMin: 121, rollMax: 125, severity: 'Daunting', dieName: '4♦',  name: 'Knocked Senseless',   effect: 'The target is staggered for the remainder of the encounter.' },
  { rollMin: 126, rollMax: 130, severity: 'Daunting', dieName: '4♦',  name: 'Gruesome Injury',     effect: 'Roll 1d10: 1–3 Brawn, 4–6 Agility, 7 Intellect, 8 Cunning, 9 Presence, 10 Willpower. That characteristic is permanently reduced by 1 (minimum 1).' },
  { rollMin: 131, rollMax: 150, severity: 'Daunting', dieName: '4♦',  name: 'Bleeding Out',        effect: 'Every round, the target suffers 1 wound and 1 strain at the beginning of his turn. For every 5 wounds beyond wound threshold, suffer 1 additional Critical Injury (re-roll this result).' },
  { rollMin: 151, rollMax: 151, severity: 'Daunting', dieName: '4♦',  name: 'The End Is Nigh',     effect: 'The target will die after the last Initiative slot during the next round unless given immediate medical attention.' },
  { rollMin: 152, rollMax: 999, severity: 'Daunting', dieName: '4♦',  name: 'Dead',                effect: 'Complete, immediate, and final death.' },
]

export const CRITICAL_INJURY_FOOTNOTE = 'Add +10 to the d100 roll for every Critical Injury the character is already suffering.'

export const ARMOR_TABLE: ArmorEntry[] = [
  { name: 'Adverse Environment Gear', defense: 0, soak: 1, encumbrance: 2, notes: 'Also provides protection from hostile environments.' },
  { name: 'Armored Clothing',          defense: 0, soak: 1, encumbrance: 1 },
  { name: 'Heavy Battle Armor',        defense: 2, soak: 3, encumbrance: 8 },
  { name: 'Heavy Clothing',            defense: 0, soak: 0, encumbrance: 0 },
  { name: 'Laminate Armor',            defense: 1, soak: 2, encumbrance: 4 },
  { name: 'Padded Armor',              defense: 0, soak: 2, encumbrance: 3 },
  { name: 'Personal Deflector Shield', defense: 1, soak: 0, encumbrance: 2, notes: 'Ranged defense only.' },
]

// ══════════════════════════════════════════════════════════
// TAB: VEHICLES
// ══════════════════════════════════════════════════════════

export const VEHICLE_CRIT_HITS: VehicleCritHit[] = [
  { rollMin: 1,   rollMax: 7,   severity: 'Easy',     dieName: '1♦', name: 'Mechanical Stress',    effect: 'The ship or vehicle suffers 1 point of system strain.' },
  { rollMin: 8,   rollMax: 14,  severity: 'Easy',     dieName: '1♦', name: 'Jostled',              effect: 'A small explosion rocks the vehicle. All crew suffer 1 strain and are disoriented for one round.' },
  { rollMin: 15,  rollMax: 20,  severity: 'Easy',     dieName: '1♦', name: 'Losing Power to Shields', effect: 'Decrease defense in the affected zone by 1 until repaired. If no defense, suffer 1 system strain.' },
  { rollMin: 21,  rollMax: 27,  severity: 'Average',  dieName: '2♦', name: 'Knocked Off Course',   effect: 'On his next turn, the pilot cannot execute maneuvers and must make a Piloting check to regain control. Difficulty depends on current speed.' },
  { rollMin: 28,  rollMax: 34,  severity: 'Average',  dieName: '2♦', name: 'Tailspin',             effect: 'All firing from the vehicle suffers 1 Setback die until end of pilot\'s next turn. All crew are immobilized until end of pilot\'s next turn.' },
  { rollMin: 35,  rollMax: 41,  severity: 'Average',  dieName: '2♦', name: 'Component Hit',        effect: 'One component of the attacker\'s choice is knocked offline and inoperable until the end of the following round.' },
  { rollMin: 42,  rollMax: 48,  severity: 'Average',  dieName: '2♦', name: 'Shields Failing',      effect: 'Reduce defense in all defense zones by 1 until repaired. If no defense, suffer 2 system strain.' },
  { rollMin: 49,  rollMax: 55,  severity: 'Average',  dieName: '2♦', name: 'Navicomputer Failure', effect: 'The navicomputer fails; the ship cannot jump to hyperspace until repaired. Without a hyperdrive, navigation systems fail entirely.' },
  { rollMin: 56,  rollMax: 62,  severity: 'Average',  dieName: '2♦', name: 'Power Fluctuations',   effect: 'The pilot cannot voluntarily inflict system strain on the ship (e.g., to gain extra maneuvers) until this Critical Hit is repaired.' },
  { rollMin: 63,  rollMax: 70,  severity: 'Hard',     dieName: '3♦', name: 'Shields Down',         effect: 'Decrease defense in affected zone to 0 and all other zones by 1 until repaired. If no defense, suffer 4 system strain.' },
  { rollMin: 71,  rollMax: 76,  severity: 'Hard',     dieName: '3♦', name: 'Engine Damaged',       effect: 'The vehicle\'s maximum speed is reduced by 1 (minimum 1) until repaired.' },
  { rollMin: 77,  rollMax: 82,  severity: 'Hard',     dieName: '3♦', name: 'Shield Overload',      effect: 'All defense zones reduced to 0. Cannot be repaired until end of encounter. Vehicle suffers 2 system strain. If no defense, reduce armor by 1 until repaired.' },
  { rollMin: 83,  rollMax: 88,  severity: 'Hard',     dieName: '3♦', name: 'Engines Down',         effect: 'Maximum speed reduced to 0 until repaired; continues on present course. No maneuvers can be executed until repaired.' },
  { rollMin: 89,  rollMax: 94,  severity: 'Hard',     dieName: '3♦', name: 'Major System Failure', effect: 'One component of the attacker\'s choice is heavily damaged and Inoperable until the Critical Hit is repaired.' },
  { rollMin: 95,  rollMax: 100, severity: 'Daunting', dieName: '4♦', name: 'Major Hull Breach',    effect: 'A gaping tear depressurizes the ship. Sil 4 and smaller: fully depressurized in rounds equal to silhouette. Sil 5+: partial depressurization by section. In atmosphere, suffer Destabilized instead.' },
  { rollMin: 101, rollMax: 110, severity: 'Daunting', dieName: '4♦', name: 'Destabilized',         effect: 'Structural integrity is severely compromised. Reduce hull trauma threshold and system strain threshold to half until repaired.' },
  { rollMin: 111, rollMax: 120, severity: 'Daunting', dieName: '4♦', name: 'Fire!',                effect: 'Fire rages through the ship. Immediately suffer 2 system strain; anyone in the fire takes damage. Fire takes rounds equal to half silhouette (rounded up) to extinguish.' },
  { rollMin: 121, rollMax: 135, severity: 'Daunting', dieName: '4♦', name: 'Breaking Up',          effect: 'At the end of the following round, the ship is completely destroyed. All aboard have one round to reach an escape pod or bail out.' },
  { rollMin: 136, rollMax: 999, severity: 'Daunting', dieName: '4♦', name: 'Vaporized',            effect: 'The ship or vehicle is completely destroyed in a dramatic fireball. Nothing and no one survives.' },
]

export const VEHICLE_CRIT_FOOTNOTE = 'Add +10 to the d100 roll for every Critical Hit the ship is already suffering.'

export const SILHOUETTE_TABLE: SilhouetteRow[] = [
  { difference: 'Same silhouette',       difficulty: 'Average',   dice: '2♦' },
  { difference: 'Target 1 larger',       difficulty: 'Easy',      dice: '1♦' },
  { difference: 'Target 2+ larger',      difficulty: 'Simple',    dice: '—'  },
  { difference: 'Target 1 smaller',      difficulty: 'Hard',      dice: '3♦' },
  { difference: 'Target 2 smaller',      difficulty: 'Daunting',  dice: '4♦' },
  { difference: 'Target 3+ smaller',     difficulty: 'Formidable',dice: '5♦' },
]

export const DAMAGE_CONTROL_TABLE: DamageControlRow[] = [
  { hullLevel: 'Below half hull trauma threshold',    difficulty: 'Easy',    dice: '1♦' },
  { hullLevel: 'At or above half hull trauma threshold', difficulty: 'Average', dice: '2♦' },
  { hullLevel: 'At or above hull trauma threshold',   difficulty: 'Hard',    dice: '3♦' },
]

export const MEDICAL_CHECK_TABLE: MedicalCheckRow[] = [
  { wounds: 'Not wounded',                        difficulty: 'Easy',     dice: '1♦' },
  { wounds: 'Up to half wound threshold',         difficulty: 'Average',  dice: '2♦' },
  { wounds: 'Above half wound threshold',         difficulty: 'Hard',     dice: '3♦' },
  { wounds: 'At or beyond wound threshold',       difficulty: 'Daunting', dice: '4♦' },
]

// ══════════════════════════════════════════════════════════
// TAB: WEAPONS
// ══════════════════════════════════════════════════════════

export const RANGED_WEAPON_GROUPS: WeaponGroup[] = [
  {
    label: 'Energy Weapons',
    weapons: [
      { name: 'Holdout Blaster',       skill: 'Ranged (Light)', damage: '5',  crit: '1', range: 'Short',  encum: 1, hp: 1, price: '200',        rarity: 4,  special: 'Stun setting' },
      { name: 'Light Blaster Pistol',  skill: 'Ranged (Light)', damage: '5',  crit: '2', range: 'Medium', encum: 1, hp: 1, price: '300',        rarity: 4,  special: 'Stun setting' },
      { name: 'Blaster Pistol',        skill: 'Ranged (Light)', damage: '6',  crit: '3', range: 'Medium', encum: 1, hp: 2, price: '400',        rarity: 4,  special: 'Stun setting' },
      { name: 'Heavy Blaster Pistol',  skill: 'Ranged (Light)', damage: '7',  crit: '3', range: 'Medium', encum: 2, hp: 3, price: '700',        rarity: 6,  special: 'Stun setting' },
      { name: 'Blaster Carbine',       skill: 'Ranged (Heavy)', damage: '9',  crit: '5', range: 'Medium', encum: 3, hp: 4, price: '850',        rarity: 3,  special: 'Stun setting' },
      { name: 'Blaster Rifle',         skill: 'Ranged (Heavy)', damage: '9',  crit: '3', range: 'Long',   encum: 4, hp: 4, price: '900',        rarity: 5,  special: 'Stun setting' },
      { name: 'Heavy Blaster Rifle',   skill: 'Ranged (Heavy)', damage: '10', crit: '3', range: 'Long',   encum: 4, hp: 4, price: '1,500',      rarity: 6,  special: 'Auto-fire, Cumbersome 3' },
      { name: 'Ion Blaster',           skill: 'Ranged (Light)', damage: '10', crit: '5', range: 'Short',  encum: 2, hp: 2, price: '250',        rarity: 3,  special: 'Disorient 5, Ion' },
      { name: 'Disruptor Pistol',      skill: 'Ranged (Light)', damage: '11', crit: '2', range: 'Short',  encum: 1, hp: 1, price: '(R) 3,000',  rarity: 6,  special: 'Vicious 4' },
      { name: 'Disruptor Rifle',       skill: 'Ranged (Heavy)', damage: '10', crit: '2', range: 'Long',   encum: 5, hp: 4, price: '(R) 5,000',  rarity: 6,  special: 'Cumbersome 2, Vicious 5' },
    ],
  },
  {
    label: 'Slugthrowers',
    weapons: [
      { name: 'Slugthrower Pistol',    skill: 'Ranged (Light)', damage: '4',  crit: '5', range: 'Short',  encum: 1, hp: 2, price: '100',  rarity: 3, special: '—' },
      { name: 'Slugthrower Rifle',     skill: 'Ranged (Heavy)', damage: '7',  crit: '5', range: 'Medium', encum: 5, hp: 2, price: '250',  rarity: 5, special: 'Cumbersome 2' },
    ],
  },
  {
    label: 'Explosives & Other',
    weapons: [
      { name: 'Flame Projector',        skill: 'Ranged (Heavy)', damage: '8',  crit: '2',   range: 'Short',   encum: 6, hp: 1, price: '1,000',      rarity: 6, special: 'Burn 3, Blast 8' },
      { name: 'Missile Tube',           skill: 'Gunnery',        damage: '20', crit: '2',   range: 'Extreme', encum: 4, hp: 4, price: '(R) 7,500',   rarity: 8, special: 'Guided 3, Breach 1, Prepare 1, Limited Ammo 6' },
      { name: 'Frag Grenade',           skill: 'Ranged (Light)', damage: '8',  crit: '4',   range: 'Short',   encum: 0, hp: 0, price: '25',          rarity: 2, special: 'Blast 6, Limited Ammo 1' },
      { name: 'Armor-Piercing Grenade', skill: 'Ranged (Light)', damage: '13', crit: '4',   range: 'Short',   encum: 0, hp: 0, price: '50',          rarity: 5, special: 'Blast 4, Limited Ammo 1, Pierce 2' },
      { name: 'Stun Grenade',           skill: 'Ranged (Light)', damage: '8',  crit: 'N/A', range: 'Short',   encum: 0, hp: 0, price: '15',          rarity: 2, special: 'Disorient 4, Stun Damage, Blast 8, Limited Ammo 1' },
      { name: 'Anti-Vehicle Mine',      skill: 'Mechanics',      damage: '25', crit: '2',   range: 'Engaged', encum: 0, hp: 0, price: '(R) 400',     rarity: 4, special: 'Blast 2, Breach 4, Limited Ammo 1' },
      { name: 'Anti-Personnel Mine',    skill: 'Mechanics',      damage: '5',  crit: '5',   range: 'Engaged', encum: 0, hp: 0, price: '(R) 150',     rarity: 4, special: 'Blast 4, Vicious 4, Limited Ammo 1' },
      { name: 'Thermal Detonator',      skill: 'Ranged (Light)', damage: '20', crit: 'N/A', range: 'Short',   encum: 0, hp: 0, price: '(R) 8,000',   rarity: 8, special: 'Blast 15, Breach 1, Vicious 2, Limited Ammo 1' },
    ],
  },
]

export const MELEE_WEAPON_GROUPS: WeaponGroup[] = [
  {
    label: 'Brawl Weapons',
    weapons: [
      { name: 'Brass Knuckles', skill: 'Brawl', damage: 'Br+1', crit: '4', range: 'Engaged', encum: 1, hp: 0, price: '25',  rarity: 2, special: 'Disorient 3' },
      { name: 'Shock Gloves',   skill: 'Brawl', damage: 'Br+2', crit: '4', range: 'Engaged', encum: 1, hp: 0, price: '700', rarity: 4, special: 'Disorient 2, Stun Damage' },
    ],
  },
  {
    label: 'Melee Weapons',
    weapons: [
      { name: 'Combat Knife',  skill: 'Melee',      damage: 'Br+1', crit: '3', range: 'Engaged', encum: 1, hp: 1, price: '50',           rarity: 2,  special: '—' },
      { name: 'Force Pike',    skill: 'Melee',      damage: 'Br+3', crit: '2', range: 'Engaged', encum: 3, hp: 1, price: '500',          rarity: 5,  special: 'Pierce 2, Stun setting' },
      { name: 'Lightsaber',    skill: 'Lightsaber', damage: '10',   crit: '2', range: 'Engaged', encum: 1, hp: 1, price: '(R) 10,000',   rarity: 10, special: 'Breach 1, Sunder, Vicious 2' },
      { name: 'Truncheon',     skill: 'Melee',      damage: '6',    crit: '2', range: 'Engaged', encum: 1, hp: 0, price: '25',           rarity: 2,  special: 'Disorient 2' },
      { name: 'Vibro-ax',      skill: 'Melee',      damage: 'Br+3', crit: '3', range: 'Engaged', encum: 4, hp: 1, price: '750',          rarity: 5,  special: 'Pierce 2, Sunder, Vicious 3' },
      { name: 'Vibroknife',    skill: 'Melee',      damage: 'Br+1', crit: '2', range: 'Engaged', encum: 1, hp: 1, price: '250',          rarity: 3,  special: 'Pierce 2, Vicious 1' },
      { name: 'Vibrosword',    skill: 'Melee',      damage: 'Br+2', crit: '2', range: 'Engaged', encum: 2, hp: 1, price: '750',          rarity: 5,  special: 'Defensive 1, Pierce 2, Vicious 2' },
    ],
  },
  {
    label: 'Improvised Weapons',
    weapons: [
      { name: 'Improvised Weapon', skill: 'Brawl or Melee', damage: 'Br-1', crit: '6', range: 'Engaged', encum: 'varies', hp: 0, price: '—', rarity: '—', special: 'Inaccurate 1, Inferior' },
    ],
  },
]

export const ITEM_QUALITIES: ItemQuality[] = [
  { name: 'Accurate',      type: 'Passive', description: 'For each rank, add 1 Boost die to attack checks made using this weapon.' },
  { name: 'Auto-fire',     type: 'Active',  description: 'Increase attack difficulty by 1. On a hit, spend 1 Advantage to trigger Auto-fire, dealing one additional hit per trigger (may trigger multiple times).' },
  { name: 'Blast',         type: 'Active',  description: 'On a successful hit, each character engaged with the target suffers damage equal to the Blast rating. If the attack misses, Blast can still activate by spending Advantage.' },
  { name: 'Breach',        type: 'Passive', description: 'Ignore 1 point of armor (and 10 points of soak) per rank of Breach.' },
  { name: 'Burn',          type: 'Active',  description: 'On a successful hit, the target continues to suffer the weapon\'s base damage at the start of their turn for a number of rounds equal to the Burn rating.' },
  { name: 'Concussive',    type: 'Active',  description: 'The target is staggered for a number of rounds equal to the Concussive rating.' },
  { name: 'Cortosis',      type: 'Passive', description: 'Weapons: immune to Sunder quality. Armor: the wearer\'s soak is immune to Pierce and Breach qualities.' },
  { name: 'Cumbersome',    type: 'Passive', description: 'Requires Brawn equal to or greater than the Cumbersome rating. For each point of Brawn below the rating, increase the difficulty of all checks with this weapon by 1.' },
  { name: 'Defensive',     type: 'Passive', description: 'While wielding this weapon, increase melee defense by the weapon\'s Defensive rating.' },
  { name: 'Deflection',    type: 'Passive', description: 'Increase ranged defense by the item\'s Deflection rating while it is worn or used.' },
  { name: 'Disorient',     type: 'Active',  description: 'When triggered, the target is disoriented for a number of rounds equal to the Disorient rating. Disoriented targets add 1 Setback die to all skill checks.' },
  { name: 'Ensnare',       type: 'Active',  description: 'When triggered, the target is immobilized for a number of rounds equal to the Ensnare rating. The target may attempt a Hard Athletics check as their action to break free.' },
  { name: 'Guided',        type: 'Active',  description: 'If the attack misses and Guided activates (3 Advantage), the attacker may make a follow-up attack check at the end of the round.' },
  { name: 'Inaccurate',    type: 'Passive', description: 'Add 1 Setback die to all attack checks per rank of Inaccurate.' },
  { name: 'Inferior',      type: 'Passive', description: 'The weapon generates 1 automatic Threat on all checks and has its base damage reduced by 1. Inferior armor has its encumbrance increased by 1 and defense reduced by 1.' },
  { name: 'Ion',           type: 'Passive', description: 'Damage dealt goes to system strain rather than hull trauma. Still reduced by armor/soak.' },
  { name: 'Knockdown',     type: 'Active',  description: 'When triggered, the target is knocked prone. Costs 2 Advantage plus 1 additional Advantage per silhouette beyond 1.' },
  { name: 'Limited Ammo',  type: 'Passive', description: 'The weapon can be fired a number of times equal to its Limited Ammo rating before requiring a maneuver to reload. Once all ammo is spent it must be restocked.' },
  { name: 'Linked',        type: 'Active',  description: 'On a hit, spend 2 Advantage to deal an additional hit. May trigger a number of times equal to the Linked rating.' },
  { name: 'Pierce',        type: 'Passive', description: 'Ignore 1 point of soak per rank of Pierce. If Pierce exceeds total soak, the target\'s soak is completely bypassed.' },
  { name: 'Prepare',       type: 'Passive', description: 'The user must perform a number of Preparation maneuvers equal to the Prepare rating before the weapon can be fired.' },
  { name: 'Slow-Firing',   type: 'Passive', description: 'After firing, the weapon cannot be fired again for a number of rounds equal to its Slow-Firing rating.' },
  { name: 'Stun',          type: 'Active',  description: 'When activated, the weapon inflicts strain equal to its Stun rating on the target.' },
  { name: 'Stun Damage',   type: 'Passive', description: 'All damage dealt is strain rather than wounds. Still reduced by soak.' },
  { name: 'Sunder',        type: 'Active',  description: 'When triggered (1 Advantage), one item openly wielded by the target is damaged one step.' },
  { name: 'Superior',      type: 'Passive', description: 'Generates 1 automatic Advantage on all checks made with it and has its base damage increased by 1.' },
  { name: 'Tractor',       type: 'Passive', description: 'On a hit, the target cannot move unless its pilot makes a successful Piloting check with difficulty equal to the Tractor rating.' },
  { name: 'Vicious',       type: 'Passive', description: 'When this weapon scores a Critical Injury or Hit, add 10 × Vicious rating to the Critical roll result.' },
]

// ── Squad Formation Reference ──────────────────────────────

export interface SquadRule {
  title:       string
  description: string
}

export const SQUAD_OVERVIEW: SquadRule[] = [
  {
    title: 'What is a Squad?',
    description: 'A Squad is a special unit formed by a Rival or Nemesis leader who rallies nearby Minion groups under their direct command. Squads move and act as one initiative slot, combining the leader\'s tactical ability with the minions\' numbers.',
  },
  {
    title: 'Forming a Squad',
    description: 'The leader makes an Average (◆◆) Leadership check using Presence + Leadership ranks. On a success, the leader may select up to 11 total minions from available groups in the encounter. Their initiative slots are absorbed — the squad acts on the leader\'s turn.',
  },
  {
    title: 'Squad Cap',
    description: 'A squad may contain at most 11 minions across all attached groups. Partial groups can be split — the remaining members of the group continue to act independently.',
  },
]

export const SQUAD_COMBAT_RULES: SquadRule[] = [
  {
    title: 'Squad Actions',
    description: 'On the leader\'s turn, the squad may perform one action and up to two maneuvers collectively. All minions execute the same action (e.g., all fire at the same target). The leader may also perform their own action and maneuvers separately.',
  },
  {
    title: 'Minion Wounds',
    description: 'Minion wounds within a squad are tracked per group as normal. When a minion group within the squad is eliminated, its slot is permanently removed. If all minion groups are eliminated, the squad disbands automatically.',
  },
  {
    title: 'Leader Incapacitation',
    description: 'If the squad leader is incapacitated or defeated, the squad immediately disbands. All surviving minion groups regain their own initiative slots at the end of the current round.',
  },
]

export const SQUAD_DISBAND_RULES: SquadRule[] = [
  {
    title: 'Voluntary Disband',
    description: 'The GM may disband a squad at any time as a free action on the leader\'s turn. All surviving minion groups immediately regain their own initiative slots.',
  },
  {
    title: 'Automatic Disband Triggers',
    description: 'A squad automatically disbands when: (1) the leader is incapacitated or defeated, (2) all attached minion groups are eliminated, or (3) the encounter ends.',
  },
]

export const SQUAD_LEADERSHIP_CHECK: SquadRule[] = [
  {
    title: 'Check',
    description: 'Average (◆◆) Leadership — Presence + Leadership skill ranks.',
  },
  {
    title: 'Success',
    description: 'Leader may select minion groups (up to 11 total minions). Their initiative slots are suppressed.',
  },
  {
    title: 'Failure',
    description: 'No squad is formed. The leader may attempt again on a future turn as their action.',
  },
  {
    title: 'Triumph',
    description: 'The leader may select one additional minion group beyond the normal cap, or remove 1 Setback from all minion checks this round.',
  },
  {
    title: 'Despair',
    description: 'Formation fails and the leader suffers 2 strain from the failed coordination attempt.',
  },
]
