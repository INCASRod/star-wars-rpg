/** Static tooltip descriptions for all 36 FFG Star Wars skills */

export interface SkillTooltip {
  description: string
  examples:    string[]
}

export const SKILL_TIPS: Record<string, SkillTooltip> = {
  // ── GENERAL ─────────────────────────────────────
  Astrogation: {
    description: 'Plotting hyperspace jump routes and navigating the galaxy. A failed check can result in a misjump into an obstacle or the deep unknown.',
    examples:    ['Calculate a jump to Coruscant (Easy)', 'Astrogate through the Kessel Run (Daunting)', 'Escape an Interdiction field (Hard)'],
  },
  Athletics: {
    description: 'Raw physical activity: running, climbing, swimming, jumping. Used whenever the body is pushed to its limits.',
    examples:    ['Sprint across a catwalk (Easy)', 'Climb a sheer durasteel wall (Hard)', 'Swim against a strong current (Average)'],
  },
  Brawl: {
    description: 'Unarmed combat using fists, knees, elbows, or improvised body parts. Deals Brawn+0 damage, Engaged range.',
    examples:    ['Throw a punch (Average)', 'Grapple an opponent (Average)', 'Deliver a headbutt (Easy)'],
  },
  Charm: {
    description: 'Making a friendly impression through compliments, wit, and likability. Works best on targets who are already neutral or positive toward you.',
    examples:    ['Talk your way past a guard (Easy)', 'Negotiate a discount (Average)', 'Convince a crime lord to trust you (Hard)'],
  },
  Coercion: {
    description: 'Persuasion through threats, intimidation, and fear. Creates Conflict. May work quickly but leaves long-term resentment.',
    examples:    ['Intimidate a thug (Easy)', 'Threaten a bureaucrat (Average)', 'Break a prisoner\'s will (Hard)'],
  },
  Computers: {
    description: 'Slicing, programming, and operating computer systems — from cracking datapads to controlling starship systems.',
    examples:    ['Access a security terminal (Easy)', 'Slice an Imperial database (Hard)', 'Override a lockdown (Daunting)'],
  },
  Cool: {
    description: 'Remaining calm under pressure and acting first in tense standoffs. Used to determine Initiative in non-combat encounters.',
    examples:    ['Calm Initiative roll', 'Resist social pressure (Average)', 'Maintain composure while bluffing (Average)'],
  },
  Coordination: {
    description: 'Balance, flexibility, tumbling, and acrobatic maneuvers. Useful for escaping grapples and navigating hazardous terrain.',
    examples:    ['Tumble through a closing blast door (Average)', 'Walk a tightrope (Easy)', 'Land after a fall (Hard)'],
  },
  Deception: {
    description: 'Lying, bluffing, and creating false impressions. Contested by the target\'s Perception or Discipline.',
    examples:    ['Lie to a questioning officer (Average)', 'Maintain a cover identity (Hard)', 'Bluff past a checkpoint (Average)'],
  },
  Discipline: {
    description: 'Willpower and mental fortitude. Resists fear, manipulation, and Force-induced effects. Also governs Initiative in combat.',
    examples:    ['Combat Initiative roll', 'Resist a mind-affecting Force power (Hard)', 'Stay calm while being tortured (Daunting)'],
  },
  Leadership: {
    description: 'Directing allies, organizing groups, and inspiring others. A strong leader can grant extra actions or boost morale.',
    examples:    ['Rally fleeing allies (Average)', 'Coordinate a squad assault (Hard)', 'Inspire civilians to resist (Daunting)'],
  },
  Lore: {
    description: 'Academic knowledge of history, culture, religions, and the Force. Covers galactic history and ancient civilizations.',
    examples:    ['Recall Imperial history (Easy)', 'Identify a Sith artifact (Hard)', 'Translate Old Republic runes (Daunting)'],
  },
  Mechanics: {
    description: 'Repairing, modifying, and building mechanical and electronic systems — from speeders to starships.',
    examples:    ['Patch a hyperdrive (Average)', 'Rig an explosive (Easy)', 'Build a custom weapon mod (Hard)'],
  },
  Medicine: {
    description: 'Diagnosing and treating injuries, disease, and poisons. Restores Wounds and removes Critical Injuries.',
    examples:    ['Patch a blaster wound (Easy)', 'Perform surgery (Hard)', 'Synthesize an antitoxin (Daunting)'],
  },
  Melee: {
    description: 'One- and two-handed melee weapons: vibroswords, vibroknives, clubs, stun batons. Engaged range.',
    examples:    ['Strike with a vibroblade (Average)', 'Parry an attack (Average)', 'Dual-wield vibroblades (Hard)'],
  },
  Negotiation: {
    description: 'Formal bargaining, deal-making, and trade. Unlike Charm, Negotiation is transactional — both parties want something.',
    examples:    ['Haggle over cargo price (Average)', 'Broker a peace deal (Hard)', 'Arrange a prisoner exchange (Average)'],
  },
  Perception: {
    description: 'Noticing environmental details, hidden threats, and lies. Opposed by Stealth or Deception.',
    examples:    ['Spot an ambush (Average)', 'Detect a concealed weapon (Hard)', 'See through a disguise (Daunting)'],
  },
  Piloting_Planetary: {
    description: 'Operating atmospheric and ground vehicles: speeders, walkers, submarines. Used within planetary atmospheres.',
    examples:    ['Chase through Mos Eisley (Average)', 'Perform a stunt maneuver (Hard)', 'Escape in a stolen speeder (Easy)'],
  },
  Piloting_Space: {
    description: 'Operating starships in space: capital ships, fighters, freighters. Used in ship combat and astro-maneuvers.',
    examples:    ['Evade a TIE squadron (Hard)', 'Dock with a space station (Easy)', 'Fly through an asteroid field (Daunting)'],
  },
  Resilience: {
    description: 'Physical endurance and resistance to toxins, extreme environments, and physical exhaustion. Determines Wound Threshold.',
    examples:    ['Survive a firefight in extreme heat (Average)', 'Resist a poison (Hard)', 'March for 48 hours without rest (Hard)'],
  },
  Skulduggery: {
    description: 'Criminal tradecraft: lock-picking, pickpocketing, sleight of hand, forgery, and general shady activity.',
    examples:    ['Pick a basic lock (Easy)', 'Pickpocket a mark (Average)', 'Bypass a security door (Hard)'],
  },
  Stealth: {
    description: 'Moving unseen and unheard. Opposed by the target\'s Perception. Encumbrance penalties can apply.',
    examples:    ['Sneak past a sentry (Average)', 'Shadow a target through a crowd (Hard)', 'Infiltrate an Imperial facility (Daunting)'],
  },
  Streetwise: {
    description: 'Knowledge of the urban underworld: criminal contacts, black markets, gang territories, and criminal customs.',
    examples:    ['Find a fence for stolen goods (Easy)', 'Locate a smuggler\'s contact (Average)', 'Navigate Hutt space politics (Hard)'],
  },
  Survival: {
    description: 'Wilderness navigation, tracking, foraging, and enduring harsh natural environments. Keeps you alive in the field.',
    examples:    ['Track quarry across Tatooine (Average)', 'Find water in a jungle (Easy)', 'Survive a rancor attack (Daunting)'],
  },
  Vigilance: {
    description: 'Awareness of your surroundings and readiness for sudden danger. Used for surprise Initiative checks in ambushes.',
    examples:    ['Surprise Initiative roll', 'Detect a trap (Average)', 'Notice someone following you (Hard)'],
  },

  // ── KNOWLEDGE ───────────────────────────────────
  Education: {
    description: 'Formal academic learning: science, mathematics, engineering theory, and general scholarly knowledge.',
    examples:    ['Recall Imperial regulations (Easy)', 'Understand a technical schematic (Average)', 'Hack a classified research archive (Hard)'],
  },
  Outer_Rim: {
    description: 'Knowledge of the Outer Rim Territories: planets, factions, local customs, trade routes, and hidden outposts.',
    examples:    ['Know a safe planet to hide on (Easy)', 'Identify a Hutt cartel by symbol (Average)', 'Navigate Black Sun territories (Hard)'],
  },
  Underworld: {
    description: 'Knowledge of criminal organisations, the black market, contraband, and the people who move illegal goods.',
    examples:    ['Identify spice by type (Easy)', 'Know a crime boss\'s reputation (Average)', 'Understand cartel codes (Hard)'],
  },
  Warfare: {
    description: 'Military tactics, strategy, unit organization, and the history of conflicts across the galaxy.',
    examples:    ['Assess enemy troop disposition (Average)', 'Plan a flanking assault (Hard)', 'Counter an Imperial formation (Daunting)'],
  },
  Xenology: {
    description: 'Knowledge of alien species, their biology, culture, languages, and customs throughout the galaxy.',
    examples:    ['Identify a species by appearance (Easy)', 'Understand Wookiee customs (Average)', 'Communicate with a rare species (Hard)'],
  },

  // ── COMBAT (ranged) ─────────────────────────────
  Gunnery: {
    description: 'Operating heavy mounted weapons: starship cannons, vehicle weapons, and emplaced turrets.',
    examples:    ['Fire a quad laser at a fighter (Average)', 'Hit a moving capital ship (Hard)', 'Destroy a shield generator (Daunting)'],
  },
  Ranged_Heavy: {
    description: 'Heavy ranged weapons held by the character: blaster rifles, heavy blasters, missile launchers, and repeating blasters.',
    examples:    ['Shoot a stormtrooper (Easy)', 'Snipe at long range (Hard)', 'Fire a rocket launcher (Average)'],
  },
  Ranged_Light: {
    description: 'Light one-handed ranged weapons: blaster pistols, hold-out blasters, and slings.',
    examples:    ['Draw and fire a blaster pistol (Easy)', 'Shoot while in cover (Average)', 'Hip-fire during a chase (Hard)'],
  },

  // ── FORCE ────────────────────────────────────────
  Lightsaber: {
    description: 'Combat with a lightsaber (or other Force-imbued weapon). Uses the character\'s highest Force-related characteristic.',
    examples:    ['Strike with a lightsaber (Average)', 'Deflect a blaster bolt (Hard)', 'Duel another Force-user (Daunting)'],
  },
}

/** Look up a skill tooltip by name (handles spaces, underscores, and parentheses) */
export function getSkillTip(name: string): SkillTooltip | undefined {
  // Try direct lookup first
  if (SKILL_TIPS[name]) return SKILL_TIPS[name]

  // Normalise: replace spaces/( /) with underscores, drop special chars
  const key = name
    .replace(/\s*\(.*?\)/g, '')  // drop (Planetary) etc for plain key
    .trim()
    .replace(/\s+/g, '_')

  if (SKILL_TIPS[key]) return SKILL_TIPS[key]

  // Try with parenthetical content as suffix
  const withParen = name.replace(/\s+\(([^)]+)\)/, '_$1').replace(/\s+/g, '_')
  return SKILL_TIPS[withParen]
}
