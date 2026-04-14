/**
 * Canonical descriptions for adversary abilities that appear as plain strings
 * in the source data (no description embedded). Sourced from FFG Star Wars RPG
 * core rulebooks and sourcebooks.
 *
 * Keys must match the exact string used in adversaries.json abilities arrays.
 */
export const ABILITY_DESCRIPTIONS: Record<string, string> = {

  // ── Size ─────────────────────────────────────────────────────────────────
  'Silhouette 0': 'Silhouette 0 — smaller than an adult human (e.g. a tooka cat or small droid). Attackers targeting this creature from medium range or beyond upgrade difficulty once.',
  'Silhouette 2': 'Silhouette 2 — larger than an adult human (e.g. a bantha or large beast). Affects cover, vehicle targeting, and range band calculations.',
  'Silhouette 3': 'Silhouette 3 — roughly the size of a large beast or light transport. Affects vehicle combat targeting and range calculations.',
  'Silhouette 4': 'Silhouette 4 — light freighter class or very large creature. Significantly affects vehicle combat targeting and defense zone rules.',
  'Silhouette 5': 'Silhouette 5 — frigate or capital ship class. Affects targeting, defense zones, and range band calculations at all distances.',

  // ── Adversary Tier ────────────────────────────────────────────────────────
  'Adversary 1': 'Upgrade the difficulty of any combat checks targeting this character once.',
  'Adversary 2': 'Upgrade the difficulty of any combat checks targeting this character twice.',
  'Adversary 3': 'Upgrade the difficulty of any combat checks targeting this character three times.',

  // ── Force ─────────────────────────────────────────────────────────────────
  'Force Rating 1': 'This character has a Force Rating of 1 and may spend Force points to activate Force powers.',
  'Force Rating 2': 'This character has a Force Rating of 2 and may spend Force points to activate Force powers.',
  'Force Rating 3': 'This character has a Force Rating of 3 and may spend Force points to activate Force powers.',
  'Darkside Force User': 'Draws on the dark side. Force dice generate dark side Force points by default. May spend Destiny Points from the dark side pool.',
  'Force Hunter': 'Automatically detects Force-sensitive characters within Medium range. May roll Force dice on Initiative; spend :forcepip: to gain :success: per point.',
  'Detect Force-Sensitivity': 'Automatically aware of Force-sensitive characters within Short range.',
  'Negate Force Powers': 'When a Force power is activated within Medium range, may spend a Destiny Point to cancel its effects entirely.',
  'Force Mimic': 'After witnessing a Force power used within Short range, may attempt to replicate it using own Force Rating.',
  'Drain Life': 'As an action, make a Force power check against one Engaged target. Spend :forcepip: to deal wounds equal to Force Rating.',
  'Creature of Illusion': 'As an action, make a Force power check (Average ◆◆ Discipline difficulty). On success, create a sustained visual illusion within Short range until this creature is damaged or moves.',
  'Blessing of the Ancients': 'Once per session, call upon ancient power: one ally may reroll all dice on a single check and keep the better result.',
  'Invoke Doellin': 'Once per encounter, invoke the spirit of Doellin, adding :advantage::advantage::advantage: to one ally\'s next check.',
  'force-power-enhance-rots': 'When making an Athletics, Resilience, or Brawl check, may roll an Enhance Force power check and spend :forcepip: to add :success:.',
  'force-power-sense-rots': 'Spend :forcepip: to sense the current thoughts of one living target within Short range, or perceive the environment beyond normal senses for one round.',

  // ── Force Powers ───────────────────────────────────────────────────────────
  'Force Power: Enhance':
    'Channel the Force through the body to exceed normal physical limits. Spend :forcepip: when making an Athletics check to add :success:, or spend :forcepip: to perform a Force Leap — jump to any location within Short range as a maneuver. Upgrades may extend this to Coordination, Resilience, and Piloting checks.',
  'Force Power: Foresee':
    'Peer into the currents of the Force to glimpse likely futures. Spend :forcepip: to have vague visions of the near future (GM describes broad events in the coming scene). Upgrades allow sensing threats, sharing visions with allies, or gaining :boost: dice on upcoming checks.',
  'Force Power: Heal':
    'Channel the Force to mend wounds in living targets. Commit :forcepip: (light side) to remove 1 wound from one living target within Short range per round. Alternatively, make a Force power check — spend :forcepip: to heal wounds equal to Intellect. Dark side Harm upgrade deals wounds instead of healing.',
  'Force Power: Influence':
    'Shape the thoughts and feelings of others through the Force. Spend :forcepip: to inflict or remove one emotion on a target within Short range (fear, calm, anger, despair). Upgrades allow implanting false memories, compelling actions (opposed by Discipline), or affecting multiple targets.',
  'Force Power: Move':
    'Use telekinesis to lift and hurl objects or creatures through the Force. Spend :forcepip: to move one silhouette 0 object within Short range to another location within Short range. Additional :forcepip: increase the silhouette that can be moved or extend the range. May be used to disarm, push, or restrain targets.',
  'Force Power: Sense':
    'Expand awareness through the Force to perceive the living world around you. Spend :forcepip: to sense the current thoughts and emotional state of all living beings within Short range, or perceive the environment clearly in all directions for one round. Upgrades allow detecting Force-sensitive characters, reading surface thoughts, or shrouding one\'s own presence.',
  'Force Power: Bind':
    'Restrain a target with the Force, holding them in place or crushing their body. Make an opposed Force power vs. Resilience check. Spend :forcepip: to immobilize the target until the end of their next turn. Dark side upgrades allow dealing wounds or lifting multiple targets simultaneously.',
  'Force Power: Battle Meditation':
    'Enter a deep concentration to guide allies in combat through the Force. Commit :forcepip: to increase the ability of all combat checks made by allies within Short range by one die per round. Upgrades allow affecting larger groups, adding Defense to allies, or penalizing enemy checks at the cost of Conflict.',
  'Force Power: Farsight':
    'Use the Force to perceive events at remote locations. Spend :forcepip: to visualize a known location anywhere in the galaxy for one round (cannot interact — observation only). Upgrades allow sensing the emotions and intentions of individuals at the remote location, or obscuring the user\'s vision from other Farsight users.',
  'Force Power: Force Choke':
    'Channel the dark side to crush a target\'s throat or body from a distance. Make an opposed Force power vs. Resilience check. On success, spend :forcepip: to deal wounds equal to Force Rating (ignore soak). Sustained — while active, the target cannot speak or use actions requiring movement. Generates Conflict when used.',
  'Force Power: Harm':
    'Channel the dark side to drain life from a living target and restore the user\'s own. Make a Force power check vs. one living target within Short range. Spend :forcepip: to deal wounds equal to Force Rating and recover the same number of wounds. Generates Conflict. Upgrades allow targeting multiple or distant targets.',
  'Force Power: Misdirect':
    'Weave illusions through the Force to confuse and mislead targets. Spend :forcepip: to make one target within Short range perceive the environment as slightly different (shadows, sounds, minor visual changes) until the end of the round. Upgrades allow creating full visual illusions, making the user appear as someone else, or affecting multiple targets.',
  'Force Power: Protect':
    'Interpose the Force between allies and harm, deflecting attacks and hazards. Spend :forcepip: to reduce all damage suffered by one ally within Short range by 1 for one round. Upgrades allow deflecting ranged attacks, extending protection to all allies in range, or reflecting damage back at attackers (costs Conflict).',
  'Force Power: Seek':
    'Use the Force to track and locate specific individuals or objects. Spend :forcepip: to sense the direction and general distance of a specific known target anywhere on the same planet. Upgrades allow pinpointing exact locations, tracking through hyperspace, or locating targets that are actively hiding from the Force.',
  'Force Power: Unleash':
    'Release raw dark side energy at a target. Make a Force power check — spend :forcepip: :forcepip: to deal a ranged attack (Damage 6; Critical 3; Range [Short]; Blast 3; Burn 2). Generates Conflict. Upgrades may increase damage, range, or add additional qualities.',
  'Force Power: Wrack':
    'Inflict intense pain through the dark side by attacking the target\'s connection to the Force. Make an opposed Force power vs. Discipline check. Spend :forcepip: to stagger the target until end of their next turn and deal strain equal to Force Rating. Generates Conflict. Upgrades extend duration or add wounds.',
  'Force Power: Phantasmagoria':
    'Project terrifying illusions so vivid the mind accepts them as real, causing genuine psychic harm. Make an opposed Force power vs. Discipline check. Spend :forcepip: to deal strain equal to Force Rating. Dark side upgrades allow targets to suffer wounds equal to strain dealt. Generates Conflict.',
  'Force Power: Manifestations':
    'Manifest a physical expression of the Force — ranging from spectral visions to tangible energy constructs. The exact effect varies by the Force-user\'s tradition and the GM\'s interpretation. Generally costs :forcepip: to activate and sustain, and may generate Conflict when used aggressively.',
  "Force Power: Jerserra\u2019s Influence":
    'A variant of the Influence power unique to Jerserra. Spend :forcepip: to psychically dominate a weak-willed target within Short range, implanting a compulsion they act on immediately. Targets may resist with an opposed Discipline check. Generates Conflict.',
  "Force power Jerserra\u2019s Influence":
    'A variant of the Influence power unique to Jerserra. Spend :forcepip: to psychically dominate a weak-willed target within Short range, implanting a compulsion they act on immediately. Targets may resist with an opposed Discipline check. Generates Conflict.',
  "Force Power: Warde\u2019s Foresight":
    'A variant of the Foresee power unique to Jedi Knight Warde. Spend :forcepip: to gain a vision of immediate danger — the next attack targeting Warde or an ally within Short range must be rerolled by the attacker. May also be used to anticipate enemy actions, granting :boost: to Initiative.',

  // ── Environmental Adaptation ──────────────────────────────────────────────
  'Amphibious': 'May breathe underwater and move through aquatic environments without penalty.',
  'Aquatic Creature': 'Native to aquatic environments. Remove all :setback: added to checks while underwater.',
  'Arboreal Creature': 'Remove all :setback: from checks made while moving through or fighting in wooded or arboreal environments.',
  'Desert Dweller': 'Remove all :setback: from checks made while operating in desert or arid environments.',
  'Suited to the Cold': 'Remove all :setback: from checks due to cold conditions. Immune to hypothermia and cold-based environmental effects.',
  'Suited to the Heat': 'Remove all :setback: from checks due to heat or hot conditions. Immune to the Overheated condition.',
  'Vacuum Dweller': 'Can survive indefinitely in the vacuum of space. Immune to vacuum exposure and extreme cold.',
  'Ammonia Breather': 'Breathes ammonia — cannot survive in a standard atmosphere without a breathing apparatus. In its native atmosphere, remove all environment-based :setback:.',
  'Fire Resistant': 'Immune to fire and heat damage. Ignore the Burning quality on attacks and environmental fire effects.',
  'Heat Resistance': 'Remove all :setback: imposed by hot environments. Reduces severity of fire-based Critical Injuries by one step.',
  'Helium Allergy': 'Adversely affected by helium. In helium-rich atmospheres, add :setback::setback: to all checks.',
  'Creature of the Sea': 'Native to aquatic environments. Remove all :setback: while underwater and may breathe water as easily as air.',

  // ── Movement & Locomotion ──────────────────────────────────────────────────
  'Flyer': 'This creature can fly. When flying, may traverse vertical obstacles and difficult terrain without additional cost.',
  'Glider': 'Can glide but cannot ascend under own power. Gains :boost::boost: on Athletics checks involving controlled descent.',
  'Sathari Glider': 'Lightweight frame allows gliding. When jumping from height, may glide up to Medium range horizontally without Athletics checks.',
  'Hoverer': 'Hovers above the ground. Does not suffer additional maneuver costs from difficult terrain.',
  'Hover': 'Can hover above the ground. Does not need to spend additional maneuvers to traverse difficult terrain.',
  'Jet booster': 'Equipped with jet boosters. May spend a maneuver to fly up to Short range vertically or horizontally.',
  'Swift': 'Does not suffer penalties for moving through difficult terrain and may perform one additional free Move maneuver once per round.',
  'Surefooted': 'Does not suffer additional difficulties when moving through difficult terrain. Never falls prone due to terrain effects.',
  'Sand Walker': 'Does not suffer additional difficulties when moving through sandy or desert terrain. Ignores quicksand and similar hazards.',
  'Tunnelling': 'Can dig through loose soil or soft rock at normal movement rate. Cannot tunnel through reinforced structures.',
  'Leap': 'Adds :boost::boost: to all Athletics checks to perform vertical or horizontal jumps. May cover twice the normal jumping distance.',
  'Long Arms': 'Exceptionally long arms or appendages. Adds :boost: to Brawl attacks at Engaged range and may interact with objects at Short range as if Engaged.',
  'Many-armed': 'Multiple arms or appendages. May wield multiple items simultaneously and perform one additional free Brawl attack per round when engaged with multiple targets.',
  'Constrictor': 'When hitting with a Brawl attack and generating :advantage::advantage:, may ensnare the target (Immobilized until the target succeeds on an opposed Athletics check).',

  // ── Combat Abilities ───────────────────────────────────────────────────────
  'Trample': 'When this creature charges through an opponent\'s space during a Move maneuver, may make a free Brawl attack against each opponent in its path as an incidental.',
  'Overrun': 'When a Move maneuver takes this creature into an enemy\'s space, may make a free Athletics check against the enemy. On success, the enemy is knocked prone.',
  'Fierce Pounce': 'As an action, leap onto an Engaged target. Make a Brawl check — on success the target is also knocked prone.',
  'Dive Attack': 'When attacking from elevation or while diving from flight, adds :boost::boost: to the next Brawl or Melee attack and deals +2 damage.',
  'Dive-bomb': 'When attacking from a flying position by diving at the target, add :boost: to the attack and deal +2 damage on a hit.',
  'Death Lunge': 'Once per encounter, when this creature suffers a hit, it may immediately make a free Brawl check against the attacker as an out-of-turn incidental.',
  'Sweep Attack': 'May spend :triumph: on a successful Brawl check to simultaneously hit all Engaged opponents, dealing the attack\'s damage to each.',
  'Fire Sweep': 'When attacking, may spend :advantage::advantage: to also hit one additional target adjacent to the original target.',
  'Brute Strength': 'Extraordinary physical power. Brawl and Melee attacks deal damage equal to weapon damage + Brawn + 2.',
  'Strong as a Jakobeast': 'Legendary creature strength. Brawl and Melee attacks deal +2 damage. May spend :advantage: on Brawl checks to knock targets prone.',
  'Strong as a Murra': 'Legendary creature strength rivaling a murra beast. Brawl and Melee attacks deal +2 damage.',
  'Animal Combatant': 'Trained for combat. Remove :setback: from all Brawl and Melee attack checks.',
  'Swipe 1': 'Once per round, after a successful Brawl attack, may spend :advantage: to make a free attack against another Engaged target dealing Brawn+1 damage.',
  'Reckless Strike': 'May suffer 2 strain as an incidental to add :success: to one attack check.',
  'Cornered Fury': 'When wounds equal or exceed half the wound threshold, add :success::advantage: to all combat checks.',
  'Berzerk Rage': 'When suffering a Critical Injury, must make a Daunting (◆◆◆◆) Discipline check or enter a berserk rage — must attack the nearest target regardless of allegiance until calmed.',
  'Enhanced Nemesis Combat': 'Particularly skilled nemesis combatant. May perform one additional free maneuver per turn and ignore one negative dice result per round.',

  // ── Natural Weapons & Hazards ──────────────────────────────────────────────
  'Envenomed Bite': 'When hitting with a Brawl attack, spend :advantage: to inject venom. Target must make a Hard (◆◆◆) Resilience check or suffer a Critical Injury in addition to normal damage.',
  'Poisonous': 'Natural attacks carry a mild toxin. After a hit, spend :advantage: to force the target to make an Average (◆◆) Resilience check or suffer 3 additional wounds.',
  'Poisonous Bite': 'Bite attacks carry a toxin. Spend :advantage: after a hit to force the target to make an Average (◆◆) Resilience check or suffer 3 additional wounds.',
  'Venomous': 'Highly venomous. When hitting with an attack, target must make a Hard (◆◆◆) Resilience check or suffer a Critical Injury and the Staggered condition.',
  'Neurotoxin': 'When hitting with an attack, target must make an Average (◆◆) Resilience check or suffer the Staggered condition until the end of their next turn.',
  'Neurotoxin Doses': 'Carries doses of neurotoxin. As an incidental, apply one dose to a bladed weapon or dart. Victims must make an Average (◆◆) Resilience check or suffer the Staggered condition.',
  'Paralysing Neurotoxin': 'When hitting with an attack, target must make a Hard (◆◆◆) Resilience check or become Immobilized and Staggered until the end of their next turn.',
  'Acidic Drool': 'As an action, spit a stream of acid (Ranged [Light]; Damage 5; Critical 3; Range [Short]; Burn 2; Corrosive). Deals ongoing damage and corrodes equipment.',
  'Sticky Saliva': 'When hitting with a bite or grab and spending :advantage::advantage:, the target is coated in sticky saliva and Immobilized until they or an ally succeeds on a Hard (◆◆◆) Athletics check.',
  'Ink Spray': 'Once per encounter as an out-of-turn incidental, spray ink at all opponents within Short range. Targets must make a Hard (◆◆◆) Resilience check or be Blinded until end of next turn.',
  'Scorching Touch': 'When hitting with a Brawl attack, the target suffers the Burning 2 condition (suffers 2 wounds at start of each turn until extinguished).',
  'Searing Touch': 'When hitting with a Brawl attack, the target suffers the Burning 3 condition. Armor provides no soak against this damage.',
  'Lightning Charge': 'As an action or after a charge, discharge electricity at all Engaged targets. Each must make an Average (◆◆) Resilience check or suffer 4 wounds and the Staggered condition.',
  'Photonic Burst': 'Once per round as an action, release a blinding burst of light. All opponents within Short range make a Hard (◆◆◆) Resilience check or are Blinded until end of their next turn.',
  'Humming Vibrations': 'Constantly emits subsonic vibrations. Opponents within Engaged range add :setback: to Perception checks and must make an Average (◆◆) Resilience check each round or suffer 1 strain.',
  'Allelochemical Transmitters': 'Communicates via chemical signals with creatures of the same species within Medium range, conveying complex tactical information silently.',
  'Pheromone Communication': 'Communicates via pheromones with same-species creatures within Engaged range, allowing silent coordination.',
  'Stinky': 'Emits a powerful odor. Opponents within Engaged range add :setback: to all Perception checks and social checks.',
  'Fecklen Boom': 'Once per encounter, produce a concussive boom. All opponents within Engaged range must make a Hard (◆◆◆) Resilience check or be Staggered until end of their next turn.',

  // ── Natural Armor & Defenses ───────────────────────────────────────────────
  'Barbed Hide': 'Any character making a Brawl check against this creature suffers 2 wounds (ignoring soak) even if the attack fails.',
  'Asharl Pelt': 'Energy-dispersing pelt. Reduces damage from energy weapons (blasters, lightsabers) by 2, to a minimum of 1.',
  'Crystalline': 'Crystalline body provides +1 soak. However, sonic attacks deal +3 damage to this creature and bypass its soak.',
  'Tough Hide': 'Exceptionally tough hide. Increase soak by 1.',
  'Plated Hide 1': 'Thick armored hide provides 1 point of ranged and melee defense in addition to normal soak.',
  'Plated Hide 3': 'Heavy armored hide provides 3 points of ranged and melee defense in addition to normal soak.',
  'Duracrete Plating': 'Armored with duracrete. Reduces damage from all attacks by 2 and provides +2 soak. Cannot move more than one range band per turn.',
  'Dense Feathers': 'Thick feathers provide natural insulation and protection. Add +1 to soak. Remove :setback: from checks due to cold environments.',
  'Blubber': 'Thick layer of blubber provides insulation and armor. Add +1 to soak. Reduces damage from cold-based attacks by 2.',

  // ── Fear ─────────────────────────────────────────────────────────────────
  'Fearsome Aspect': 'When first encountered, opponents within Medium range must make an Average (◆◆) Discipline check or add :setback: to all checks for the remainder of the encounter.',
  'Frightening Visage': 'When first encountered, opponents within Short range must make a Daunting (◆◆◆◆) Discipline check or add :setback::setback: to all checks for the remainder of the encounter.',
  'Terrify (Improved)': 'All Fear checks caused by this character have their difficulty upgraded twice instead of once.',
  'Terrifying Howl': 'As an action, emit a terrifying howl. Opponents within Short range must make an Average (◆◆) Discipline check or add :setback: to all checks until end of their next turn.',
  'Darkest Dreams': 'Characters sleeping within Short range must make a Hard (◆◆◆) Discipline check or gain :setback::setback: to all checks the following day.',
  'Shriek': 'As an action, emit a shriek. Targets within Short range must make a Daunting (◆◆◆◆) Discipline check or be Staggered until end of their next turn.',
  'Soothing Song': 'As an action, emit a soothing song. Opponents within Short range must make an Average (◆◆) Discipline check or become Disoriented. Allies within Short range instead remove 1 strain.',
  'Insectoid Appearance': 'Disturbing to many species. Opponents must make a Hard (◆◆◆) Discipline check when first encountered or add :setback: to Presence-based checks against it.',
  'Fearless': 'Immune to Fear effects. Never needs to make Fear checks and adds :boost: to Discipline checks.',

  // ── Defensive Abilities ────────────────────────────────────────────────────
  'Hardy': 'Reduce the difficulty of all Resilience checks by 1.',
  'Hard to Kill': 'May spend a Destiny Point to ignore any one Critical Injury result for the remainder of the encounter (the injury still applies at encounter\'s end).',
  'Resilient Metabolism': 'Add automatic :success: to all Resilience checks.',
  'Regeneration': 'When recovering wounds via natural rest or bacta treatment, recover 1 additional wound per recovery check.',
  'Energy Parasite': 'When Engaged with a droid or powered vehicle, spend a maneuver to drain energy: the target adds :setback: to all system-dependent checks and this creature heals 1 wound.',
  'Sessile': 'This creature cannot move under its own power and is permanently stationary.',
  'Immobile': 'Cannot spend maneuvers to move. Cannot be moved by most effects.',
  'Restraint': 'Exceptional self-control. May spend a Destiny Point to immediately end a Rage, Berserk, or forced emotion effect as an incidental.',
  'Stubborn 1': 'Upgrade the ability of all Resilience checks once. May reroll 1 die on checks made to resist being moved or affected by status conditions.',
  'Stubborn and Dependable': 'Exceptionally steadfast. Upgrade ability of all Resilience and Discipline checks once. Cannot be involuntarily moved.',
  'Breakaway Systems': 'When suffering a Critical Hit exceeding wound threshold, may eject non-essential systems as a reaction, reducing the Critical result by 30.',
  'Self-destruct Mechanism': 'If reduced to 0 wounds, may activate self-destruct as an out-of-turn incidental, dealing 8 damage (ignoring soak) to all Engaged characters.',
  'Reflect (Improved) 2': 'When hit by a ranged attack while wielding a lightsaber, may reflect it back at the attacker, adding :advantage::advantage: to the reflected attack.',
  'Shield Projector': 'Generates a personal energy shield providing 2 ranged defense. When the shield absorbs a ranged hit, reduce the damage by an additional 2.',
  'Unstable 4': 'Dangerously unstable. At the end of each round, if 4 or more :threat: or a :despair: is generated during the round, this character malfunctions or explodes, dealing 6 damage to all Engaged targets.',

  // ── Perception & Stealth ───────────────────────────────────────────────────
  'Enhanced Senses': 'Remove all :setback: imposed by darkness, concealment, or environmental interference on Perception and Vigilance checks.',
  'Heightened Sense of Smell': 'Remove all :setback: imposed by darkness or concealment when tracking by scent. Add :boost: to Perception checks involving smell.',
  'Keen Senses': 'Add :boost: to all Perception and Vigilance checks. May never be surprised.',
  'Keen Eyed 1': 'Once per session, reroll 1 die on a Perception or Vigilance check. Remove :setback: from Perception checks due to distance.',
  'Olfactory Perception': 'Remove all :setback: from Perception checks involving scent. May track creatures by smell through medium terrain without additional difficulty.',
  'Olfactory Sensor Suite': '(Droid) Advanced chemical sensors. Remove :setback: imposed by darkness or concealment when locating targets by scent or chemical signature.',
  'Magnetic Sense': 'Can sense magnetic fields. Remove :setback: imposed by darkness and disorientation. May navigate underground or underwater without difficulty.',
  'Nightvision': 'Remove all :setback: imposed by low-light conditions on Perception and ranged attack checks.',
  'Infravision': 'Remove all :setback: imposed by lighting conditions by detecting heat signatures.',
  'Sight Hunter': 'Remove :setback: imposed by lighting conditions. However, add :setback::setback: in environments with heavy visual interference (smoke, fog, strobing lights).',
  'Silent Hunter': 'Opponents add :setback::setback: to Perception checks made to detect this creature. Add :boost::boost: to all Stealth checks.',
  'Near-Sighted': 'Add :setback::setback: to all Perception checks beyond Short range and to ranged attacks at Medium range or beyond.',
  'Light-Sensitive': 'Adversely affected by bright light. Add :setback::setback: to all checks in bright conditions. Remove :setback: in darkness.',
  'Camouflaged (Jungle)': 'Coloring blends into jungle or forested environments. Opponents add :setback::setback: to Perception checks to notice it there. Add :boost::boost: to Stealth in such terrain.',
  'Camouflaged (Snow)': 'White fur or coloring blends into snowy environments. Opponents add :setback::setback: to Perception checks to notice it there. Add :boost::boost: to Stealth in arctic terrain.',
  'Natural Camouflage': 'When stationary, opponents add :setback::setback::setback: to Perception checks to notice this creature. Add :boost::boost::boost: to Stealth when motionless.',
  'Living Shadow': 'In dim lighting or darkness, adds :boost::boost::boost: to Stealth and opponents need a Formidable (◆◆◆◆◆) Perception check to detect it.',
  'Shadowblend': 'In any area with shadows, adds :boost::boost: to Stealth and opponents add :setback: to Perception checks.',
  'Shadowed': 'Skilled at operating in darkness. Add :boost: to Stealth and remove :setback: from checks made in low-light conditions.',
  'Cloak': 'As an action, activate cloaking device — invisible to sensors and visual detection until making an attack. Opponents need a Formidable (◆◆◆◆◆) Perception check to detect.',

  // ── Droid/Cybernetic ───────────────────────────────────────────────────────
  'Droid': 'Does not need to breathe, eat, or drink. Can survive indefinitely in a vacuum or underwater. Immune to poisons, toxins, and gases. Does not suffer Strain. Immune to mind-affecting Force powers.',
  'Cyborg': 'Significant cybernetic enhancements. Ignore the first Critical Injury each encounter. Vulnerable to ion damage as if a droid.',
  'Advanced Language Module': 'Equipped with an advanced language module. Can communicate fluently in over 6 million forms of communication.',
  'Computer Affinity': 'Remove :setback: from all Computers checks. Treat all locked terminals as one difficulty lower when slicing.',
  'Sensor Masking': 'Generates sensor-masking signals. Opponents add :setback::setback: to Computers checks to detect this character with sensors.',
  'Cybernetic Communications': 'Can communicate silently via encrypted datalink with other droids or cybernetically-enhanced allies within Medium range.',
  'Contraption': 'Cobbled together from salvaged parts. Critical Hit results are reduced by 10 (minimum 1), but repairs cost half the normal amount.',

  // ── Social & Command ───────────────────────────────────────────────────────
  'Aura of Command': 'Allies within Short range add :boost: to all combat and leadership checks. May spend a maneuver to grant one ally within Short range a free :advantage: on their next check.',
  'Leader': 'Allies within Short range remove :setback: from combat checks. Once per round, may spend a maneuver to direct an ally, granting them :boost: on their next action.',
  'Tactical Direction': 'Once per round, use a maneuver to grant one ally within Medium range an additional free maneuver.',
  'Alliance Leader': 'Allied characters within Medium range add :boost: to Leadership and Discipline checks. Once per encounter, spend a Destiny Point to allow all allies to recover 2 strain.',
  'Military Analyst': 'Spend a maneuver to study an opponent. Next round, gain :boost::boost: on all combat checks against that target.',
  'Spaceport Leader': 'Allied characters within Short range add :boost: to all Streetwise and Underworld checks.',
  'Pirate Leader': 'May spend a maneuver to grant pirates within Medium range :boost: on their next check. Allies within Short range add :boost: to attack checks.',
  'Networking': 'Once per session, call on a contact for information, equipment, or a favor.',
  'Lorekeeper 2': 'Add :boost::boost: to Knowledge checks about ancient history, artifacts, or lore. May reroll 1 die on any Knowledge check.',

  // ── Imperial/Faction ───────────────────────────────────────────────────────
  'Imperial Haughtiness': 'Bearing conveys Imperial authority. Add :boost: to Coercion checks. Remove :setback: from Leadership checks with Imperial personnel.',
  'Imperial Valour': 'This character and allies within Short range may each spend a Destiny Point once per encounter to ignore one Critical Injury for the remainder of the encounter.',
  'Mandalorian Visage': 'Mandalorian armor inspires fear or respect. Add :boost: to Coercion checks. May reroll one die on Coercion checks.',
  'Constabulary Honour 2': 'Allies within Short range remove :setback: from Discipline checks. May spend 2 Destiny Points to negate a :despair: result on a combat check.',
  'Constabulary Honour 3': 'Senior officer aura. Allies within Short range remove :setback::setback: from Discipline checks. Once per encounter, negate one Critical Injury on an ally.',
  'Green Nikto': 'Kajain\'ad\'Nikto species trait. Adapted to arid heat — remove :setback: from checks in desert environments. Add :boost: on Resilience checks.',
  'Red Nikto': 'Kajain\'ad\'Nikto species trait. Remove :setback: from checks in hot, dry environments.',
  'Mountain Nikto': 'Esral\'sa\'Nikto species trait. Adapted to high altitude — remove :setback: from checks in mountainous terrain.',
  'Southern Nikto': 'Gluss\'sa\'Nikto species trait. Remove :setback: from checks in aquatic or coastal environments.',
  'Pale Nikto': 'Nikto sub-species trait. Remove :setback: from checks in shadowy or underground environments.',
  'Huttese': 'Fluent in Huttese. No language barriers with Hutt-aligned NPCs. Add :boost: to social checks with Hutt crime lords.',

  // ── Social / Personal ──────────────────────────────────────────────────────
  'Loyalty': 'Utterly loyal to a specific person or faction. Gain :boost::boost: on Discipline checks to resist manipulation that would harm them.',
  'Loyalty Imprint': 'Imprinted on a specific handler. Prioritizes their safety above all else. Cannot be reprogrammed without a Hard (◆◆◆) Computers check.',
  'Code of Silence': 'Will not reveal information under any circumstances. Immune to social Coercion. Reduces difficulty of Discipline checks to resist interrogation by 2.',
  'Blabber Mouth': 'Has trouble keeping secrets. Coercion checks against this character are one difficulty lower. On a :despair: on Deception, involuntarily reveals sensitive information.',
  'Etiquette and Protocol': 'Versed in formal social customs. Add :boost: to Charm and Negotiation checks in formal or political contexts.',
  'Etiquette and Protocol (Improved)': 'Highly versed in social customs. Add :boost::boost: to all Charm and Negotiation checks. Remove :setback: from Charm, Negotiation, and Leadership checks.',
  'Rhetoric Mimic': 'Can perfectly mimic voices and speech patterns. Add :boost::boost: to Deception checks involving impersonation.',
  'Backup Entertainer': 'Trained in performing arts. Add :boost: to Charm and Deception checks using performance as cover. Once per session, distract a group of targets with a performance.',
  'Intimidating Presence': 'Allies within Short range add :success: to Coercion checks. Opponents within Short range must make an Average (◆◆) Discipline check or add :setback: to checks.',
  'Slave Authority': 'May use Coercion instead of Leadership when commanding enslaved or coerced individuals.',
  'Fearsome Countenance': 'Add automatic :advantage: to all Coercion checks.',

  // ── Medical & Support ─────────────────────────────────────────────────────
  'Surgeon\'s Aid': 'Allies within Short range remove :setback: from Medicine checks. When assisting a Medicine check, provides :boost::boost: instead of the normal :boost:.',
  'Create Bacta': 'Once per session, synthesize 1 dose of crude bacta from available materials (requires Hard ◆◆◆ Medicine check). The bacta heals 4 wounds when applied.',
  'Firefighter': 'Add :boost::boost: to checks made to extinguish fires or rescue individuals from burning environments. May ignore the Burning condition for one round as an incidental.',
  'Covering Fire': 'May spend a maneuver to add +1 ranged Defense to up to three allied characters within Short range until start of this character\'s next turn.',
  'Improved Covering Fire': 'When allied minion groups within Short range use Covering Fire, they instead add +2 ranged Defense.',
  'Gun Crew': 'When serving as part of a gunnery crew, add :boost: to all Gunnery checks. Reduce reload time for crew-served weapons by 1.',
  'Body Guard': 'Once per round, when an ally within Short range would suffer wounds, this character may suffer those wounds instead as an out-of-turn incidental.',
  'Teamwork': 'When assisting another character\'s check, provides :boost::boost: instead of the normal :boost:.',
  'Overwhelming Fire': 'As a maneuver, make a Leadership check to direct allies within Short range; on success, each may make a free ranged attack as an incidental.',
  'Push the Limit': 'Once per encounter, suffer 2 strain to perform an additional maneuver as an incidental.',
  'Technical Master': 'Remove :setback::setback: from all Mechanics checks. When repairing, restore 1 additional Hull Trauma or System Strain per check.',
  'Fire Control': 'As a maneuver, direct one ally within Short range to add :boost: to their next ranged attack.',
  'Projectile Guidance': 'Remove :setback: from all ranged attack checks. The first :advantage: generated may be spent to hit a second adjacent target.',
  'Skilled Jockey 2': 'Add :boost::boost: to all Piloting checks. Once per encounter, reroll one Piloting check and keep the better result.',

  // ── Animal Traits ──────────────────────────────────────────────────────────
  'Companion Animal': 'Bonded to a specific handler. Follows simple commands, defends the handler, and gains :boost: on all checks while the handler is within Short range.',
  'Bantha Affinity': 'Sand People and those with this ability may ride banthas without Riding checks. These banthas will not flee in most combat situations.',
  'Pack Instincts': 'When fighting alongside 3 or more of the same species, add :boost: to all combat checks.',
  'Territorial': 'Will automatically attack any creature entering its territory (within Short range) unless the intruder makes a Hard (◆◆◆) Survival check to appear non-threatening.',
  'Ornery': 'Ill-tempered and unpredictable. Handlers add :setback::setback: to Animal Handling checks. May attack its own handlers on a :despair: result.',
  'Domesticated': 'Domesticated and trained. Follows commands from its handler without checks in normal circumstances.',
  'Domesticable 1': 'Can be domesticated with training. Requires 1 rank in Survival and a series of successful checks over several weeks.',
  'Domesticable 2': 'Can be domesticated with significant expertise. Requires 2 ranks in Survival and at least one month of dedicated training.',
  'Trained Mount 1': 'Trained as a riding animal. Characters with at least 1 rank in Riding may use it without penalty.',
  'Trained Mount 2': 'Highly trained as a riding animal. Characters with at least 2 ranks in Riding may perform advanced maneuvers.',

  // ── Beast of Burden ────────────────────────────────────────────────────────
  'Beast of Burden 4': 'When used as a pack animal, can carry up to encumbrance 4 before becoming encumbered.',
  'Beast of Burden 5': 'When used as a pack animal, can carry up to encumbrance 5 before becoming encumbered.',
  'Beast of Burden 6': 'When used as a pack animal, can carry up to encumbrance 6 before becoming encumbered.',
  'Beast of Burden 10': 'When used as a pack animal, can carry up to encumbrance 10 before becoming encumbered.',
  'Beast of Burden 15': 'When used as a pack animal, can carry up to encumbrance 15 before becoming encumbered.',
  'Beast of Burden 20': 'When used as a pack animal, can carry up to encumbrance 20 before becoming encumbered.',

  // ── Special / Named ────────────────────────────────────────────────────────
  'Wookiee Rage': 'Deals +1 damage with Brawl and Melee attacks when suffering any wounds. When suffering a Critical Injury, deals +2 damage with Brawl and Melee attacks instead.',
  'Swarm': 'Operates as a swarm (silhouette 0 individuals). May move through any opening a small creature could pass through.',
  'Ponderous': 'Cannot spend more than one maneuver moving per turn. Cannot perform the Sprint action.',
  'Ponderous (Thalassian)': 'The Thalassian\'s bulk limits movement. Cannot spend more than one maneuver moving per turn.',
  'Awkward': 'Add :setback: to all Coordination and Stealth checks. Cannot perform the Dodge incidental.',
  'Ambushers': 'When attacking from ambush before targets are aware, add :boost::boost: to the initial attack check.',
  'Cunning Ambusher': 'Add :boost::boost: to all combat checks made while undetected or attacking from stealth.',
  'Cunning Ambusher 1': 'Add :boost: to the first combat check made against a target that is unaware of this character\'s presence.',
  'On the Edge': 'Add :boost::boost: to combat checks in dangerous situations. Remove :setback: from Initiative checks.',
  'Hunter 1': 'Add :boost: to combat checks against targets that have been successfully tracked or identified by this character this encounter.',
  'Jungle Hunter': 'Remove :setback: from combat and Stealth checks in jungle environments. Add :boost: to Survival checks in jungle terrain.',
  'Clone Inhibitor Chip': 'With proper chain of command, upgrade ability of Leadership checks with clones once. Clones with this chip will not disobey direct orders from their commander.',
  'Skilled Cheater': 'Once per session when gambling, cancel a :despair: on a skill check. Add :boost: to all Skulduggery checks.',
  'Luck Be a Lady': 'Once per session, reroll all dice on any one check and keep the new result.',
  'All the Luck in the Galaxy': 'Once per session, flip a Destiny Point to add :triumph: to any check. Remove :setback: from all Deception and Skulduggery checks.',
  'Bad Knee': 'Old injury. Add :setback: to Athletics and Coordination checks. Leg Critical Injury results are increased by 20.',
  'Bloodfly Sickness': 'Carries bloodfly fever. When dealing wounds with Brawl, the target must make an Average (◆◆) Resilience check or contract the sickness, suffering 1 wound per round until treated.',
  'Destabilizing Influence': 'Force-sensitive characters within Medium range must make an Average (◆◆) Discipline check each round or suffer 1 Conflict.',
  'Wilderness Valor': 'When fighting in natural outdoor environments, add :boost: to combat checks and remove :setback: from Survival checks.',
  'Low-Tech User': 'Uncomfortable with advanced technology. Add :setback::setback: to all Computers and Mechanics checks.',
  'Intuitive Navigation': 'Never becomes lost. Remove :setback: from all navigation-based Astrogation and Survival checks.',
  'For Quolas!': 'Fights with fanatical devotion. Once per encounter, declare this ability to add :success::success::advantage::advantage: to one combat check and recover 3 strain.',
}
