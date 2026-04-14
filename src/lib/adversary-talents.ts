// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Adversary Talent Description Lookup
//
// Maps talent name strings (as they appear in adversaries.json) to canonical
// descriptions sourced from the AoE / EotE / FaD core rulebooks.
//
// Lookup strategy (applied in adversaries.ts normalize()):
//   1. Exact match: TALENT_DESCRIPTIONS['Parry 3']
//   2. Rank-stripped match: TALENT_DESCRIPTIONS['Parry']  (strips trailing " N")
//   3. Improved/Supreme variant: TALENT_DESCRIPTIONS['Parry (Improved)']
//
// ACTIVATION_TYPES maps base talent name → activation keyword.
// Omitted entries default to 'passive'.
// ═══════════════════════════════════════════════════════════════════════════

export const TALENT_DESCRIPTIONS: Record<string, string> = {

  // ── A ───────────────────────────────────────────────────────────────────
  'Adversary':
    'Upgrade the difficulty of any combat checks targeting this character once per rank of Adversary.',
  'All-Terrain Driver':
    'Ignore penalties for driving through difficult terrain; remove one Setback from relevant Piloting (Planetary) checks.',
  'Anatomy Lessons':
    'After a successful attack, spend 2 Advantage to add Intellect ranks to total damage dealt.',
  'Animal Empathy':
    'Remove Setback dice from checks to train, calm, or ride animals equal to ranks in Animal Empathy.',
  'Ataru Technique':
    'May use Cunning instead of Brawn for Lightsaber combat checks. When making a Lightsaber check, may spend Triumph to add Cunning ranks as bonus damage.',

  // ── B ───────────────────────────────────────────────────────────────────
  'Bacta Specialist':
    'Patients under this character\'s care heal one additional wound per rank of Bacta Specialist when making natural recovery checks.',
  'Bad Cop':
    'When making an opposed Coercion check as part of a social encounter, may assist a paired character\'s Charm check. The partner adds Boost dice equal to ranks in Bad Cop.',
  'Bad Motivator':
    'Once per session when repairing a droid or vehicle, may make an Average Mechanics check. On success, the vehicle or droid suffers a serious or critical hit instead of gaining repairs.',
  'Barrage':
    'Add +1 damage per rank of Barrage to successful hits made with ranged weapons at long or extreme range.',
  'Black Market Contacts':
    'When purchasing illegal, black market, or restricted gear, reduce the rarity by 1 per rank of Black Market Contacts.',
  'Blooded':
    'When suffering a Critical Injury result of 01-39, may spend Destiny Point to recover from it immediately.',
  'Body Guard':
    'Once per round, perform the Body Guard maneuver: suffer 2 strain to upgrade difficulty of combat checks targeting a chosen ally by 1 per rank of Body Guard until the start of next turn.',
  'Body Guard (Improved)':
    'When performing the Body Guard maneuver, if the chosen ally is targeted and hit, may spend 2 Advantage to cause the attack to miss.',
  'Bought Info':
    'Spend 50 credits; may ask the GM one yes/no question about a subject. Once per session.',
  'Brace':
    'Perform the Brace maneuver: remove one Setback die per rank from next action caused by difficult terrain, a moving vehicle, or similar conditions.',
  'Brilliant Evasion':
    'Once per encounter, take an action to avoid attacks: reduce the total number of hits targeting this character each round to 0, with a number of those attacks reduced equal to Cunning. Lasts until next turn.',
  'Bypass Security':
    'Remove one Setback die per rank of Bypass Security from checks made to disable or bypass security systems.',

  // ── C ───────────────────────────────────────────────────────────────────
  'Calming Aura':
    'Allies within short range add one Boost die to Discipline and Cool checks.',
  'Careful Planning':
    'Once per session, may introduce a "plan" as a free action — treat one result as if one Destiny Point had been spent.',
  'Centre of Being (Improved)':
    'When activating Centre of Being, the benefits apply until the start of this character\'s next turn rather than just the first attack.',
  'Circle of Shelter':
    'When performing the Body Guard maneuver, may protect one additional ally per rank of Circle of Shelter.',
  'Clever Commander':
    'Once per session, take the Clever Commander action: make an Average Leadership check; on success, allies may each perform one free maneuver.',
  'Clever Solution':
    'Once per session, make an Average check with any Knowledge skill to receive one relevant piece of information that is immediately applicable to the current situation.',
  'Codebreaker':
    'Remove one Setback die per rank of Codebreaker from checks to break codes or decrypt communications. Reduce difficulty of Computers checks to decrypt by 1.',
  'Command':
    'Add one Boost die per rank of Command to Leadership checks. Affected NPCs add a Boost die to Discipline checks for remainder of encounter.',
  'Commanding Presence':
    'Remove one Setback die per rank of Commanding Presence from Leadership or Cool checks.',
  'Conditioned':
    'Remove one Setback die per rank of Conditioned from Athletics or Resilience checks. Reduce the difficulty of these checks by 1 (to a minimum of Easy).',
  'Confidence':
    'May decrease the difficulty of Discipline checks to avoid fear by 1 per rank of Confidence, to a minimum of Easy.',
  'Congenial':
    'Suffer strain to downgrade difficulty of Charm or Negotiation checks. Amount suffered equals levels downgraded, to maximum equal to ranks in Congenial.',
  'Contraption':
    'Once per session, spend 1 Destiny Point and make a Hard Mechanics check to jury-rig a device that performs any function the character needs for the scene. It breaks irreparably at the end of the scene.',
  'Convincing Demeanor':
    'Remove one Setback die per rank of Convincing Demeanor from Deception or Skulduggery checks.',
  'Coordinated Assault':
    'Once per round, take a Coordinated Assault maneuver: a number of allies equal to Ranks in Coordinated Assault within short range add damage equal to rank to their next hit this round.',
  'Crippling Blow':
    'May spend 1 Advantage on a successful combat check to inflict a Critical Injury on the target, even if the hit did not exceed their Wound Threshold.',
  'Cunning Ambusher':
    'Add one Boost die per rank of Cunning Ambusher to the first combat check made against an opponent who has not yet had a turn in the encounter.',

  // ── D ───────────────────────────────────────────────────────────────────
  'Darkside Force User':
    'This character has given in to the dark side of the Force. Treat dark side Force dice results as light side when spending Force points on Force powers.',
  'Dead to Rights':
    'When making a ranged combat check against a target at engaged or short range, may spend 2 Advantage to add half of Agility (rounded up) to damage.',
  'Deadly Accuracy (Brawl)':
    'When making Brawl combat checks, add ranks in Brawl as bonus damage to one hit per attack.',
  'Deadly Accuracy (Melee)':
    'When making Melee combat checks, add ranks in Melee as bonus damage to one hit per attack.',
  'Deadly Accuracy (Ranged: Heavy)':
    'When making Ranged (Heavy) combat checks, add ranks in Ranged (Heavy) as bonus damage to one hit per attack.',
  'Deadly Accuracy (Ranged: Light)':
    'When making Ranged (Light) combat checks, add ranks in Ranged (Light) as bonus damage to one hit per attack.',
  'Deadly accuracy':
    'Add ranks in the relevant combat skill as bonus damage to one hit per attack.',
  'Death From Above':
    'If attacking from elevated terrain, spend 2 Advantage or a Triumph to add the difference in silhouette to damage.',
  'Defensive Driving':
    'Increase defense of vehicle this character pilots by 1 per rank of Defensive Driving.',
  'Defensive Slicing':
    'When attempting to defend a computer system, add Setback dice equal to ranks in Defensive Slicing to opponent\'s attempts to breach the system.',
  'Discredit':
    'Once per session, make an Average Deception check targeting an opponent in a social situation. On success, reduce their Social Standing or standing with an organization.',
  'Disorient':
    'After making a successful attack, spend Advantage to disorient the target; they add Setback dice to all checks for rounds equal to ranks in Disorient.',
  'Distracting Behaviour':
    'Take an action; make an opposed Deception vs Perception check. On success, one opponent is staggered until the end of the current round.',
  'Distracting Behaviour (Improved)':
    'When successfully using Distracting Behaviour, the target is staggered for a number of rounds equal to successes rolled.',
  'Dodge':
    'When targeted by a combat check, may spend 1 Destiny Point as an out-of-turn incidental. Upgrade the difficulty of that check a number of times equal to ranks of Dodge.',
  'Double-Talk':
    'Once per encounter, may make an Average Deception check as a maneuver; on success, create a distraction — one target within short range loses their next free maneuver.',
  'Draw Closer':
    'After successfully activating a Force power, spend 1 Force pip to move an engaged enemy up to short range.',
  'Draw Closer (Skysnare)':
    'A variation of Draw Closer specific to this character\'s technique. Spend 1 Force pip after a successful Force power to reposition an engaged opponent.',
  'Drive Back':
    'On a successful melee hit, spend 2 Advantage to force target to move one range band away.',
  'Droid':
    'This character is a droid. They do not need to breathe, eat, drink, or sleep. They are not affected by poisons or toxins. They can survive in vacuum indefinitely. Recover 1 strain when repaired.',
  'Duelist\'s Training':
    'When engaged with a single opponent, upgrade ability of all combat checks against that opponent once.',
  'Durable':
    'Reduce result of any Critical Injury suffered by 10 per rank of Durable, to a minimum of 1.',

  // ── E ───────────────────────────────────────────────────────────────────
  'Encoded Communique':
    'Once per session, send or intercept a coded message. Make a Hard Computers check; on success, decode or send a message without detection.',
  'Encouraging Words':
    'Once per session, use an action to let an ally recover strain equal to this character\'s Presence ranks.',
  'Enduring':
    'Gain +1 soak per rank of Enduring.',
  'Enhanced Leader':
    'When using the Field Commander talent, grants one additional maneuver to all affected allies.',
  'Expert Handler':
    'Remove one Setback die per rank of Expert Handler from checks to handle, train, ride, or interact with animals.',
  'Expert Tracker':
    'Remove one Setback die per rank of Expert Tracker from Survival checks to track prey. Decrease time to find tracks by 50% per rank.',
  'Eye for Detail':
    'Remove up to 2 Setback dice per rank from Mechanics or Computers checks. Reduce difficulty of these checks by 1 (minimum Easy).',

  // ── F ───────────────────────────────────────────────────────────────────
  'Fear is My Ally':
    'May use Coercion instead of Leadership for command-related checks. Allied minion groups may use this character\'s Coercion ranks as their own.',
  'Fearsome':
    'When enemies first encounter this character in combat, they must make a Daunting Discipline check or suffer 1 strain per rank of Fearsome.',
  'Feint':
    'After winning an opposed Melee check, upgrade the difficulty of the target\'s next combat check once per rank of Feint.',
  'Feral Strength':
    'Add +1 damage per rank of Feral Strength to melee combat checks.',
  'Field Commander':
    'Take an action; spend 1 Destiny Point. Up to Presence number of allies within medium range may immediately perform one free maneuver without suffering strain.',
  'Field Commander (Improved)':
    'Allies benefiting from Field Commander may perform both a free maneuver and a free action.',
  'Fine Tuning':
    'When reducing a ship\'s system strain, reduce 1 additional system strain per rank of Fine Tuning.',
  'Finesse':
    'May use Agility instead of Brawn for Melee combat checks.',
  'Fire Control':
    'Spend 2 Advantage on a successful ranged attack to grant all allies a Boost die on their next ranged attack against the same target.',
  'Flyer':
    'This character has a natural flying ability. May spend a maneuver to take to the air, gaining the benefits of elevated terrain. May not be knocked prone while flying.',
  'Forager':
    'Remove up to 2 Setback dice from Survival checks to find food, water, or shelter. In urban environments, this applies to scrounging supplies.',
  'Force Rating':
    'Increase Force Rating by 1 per rank of Force Rating.',
  'Forewarning':
    'At the beginning of an encounter, may spend a Destiny Point as an out-of-turn incidental; allies may not be surprised and add Boost dice to their Initiative check equal to ranks of Forewarning.',
  'Form on Me':
    'When performing the assist maneuver for combat, add Boost dice equal to Leadership ranks.',
  'Formation Tactics':
    'Allies in short range who attack the same target as this character add one Boost die to their checks.',
  'Formation Tactics (Improved)':
    'Formation Tactics also grants one additional Boost die to all affected allies.',
  'Frenzied Attack':
    'Perform the Frenzied Attack maneuver: suffer strain up to ranks in Frenzied Attack; add the same amount as damage to the next melee attack made this turn.',
  'Full Throttle':
    'Take an action; make a Daunting Piloting check. On success, vehicle\'s Speed increases by 1 for a number of rounds equal to successes.',
  'Full Throttle (Improved)':
    'Full Throttle now requires only a Hard Piloting check instead of Daunting.',
  'Full Throttle (Supreme)':
    'Full Throttle may now be performed as an incidental rather than an action.',

  // ── G ───────────────────────────────────────────────────────────────────
  'Galaxy Mapper':
    'Remove one Setback die per rank from Astrogation checks. Reduce time to calculate hyperspace routes by half.',
  'Gang Leader':
    'Minions under this character\'s command add one Boost die to all combat checks when this character is engaged with the same target.',
  'Gearhead':
    'Remove one Setback die per rank of Gearhead from Mechanics checks. Halve the cost of personally owned equipment modifications.',
  'Good Cop':
    'Add a Boost die per rank of Good Cop to Charm checks when working with a paired "Bad Cop" character.',
  'Grapple':
    'After a successful Brawl attack, spend 2 Advantage to immobilize the target until the start of this character\'s next turn.',
  'Greased Palms':
    'Before making a social check, may spend credits equal to 50 × the number of Boost dice added (up to ranks) to add those Boost dice to the check.',
  'Guns Blazing':
    'When making a ranged attack, may add Setback dice to the check (up to ranks in Guns Blazing) to add the same number of Boost dice to any attacks this character suffers until next turn.',

  // ── H ───────────────────────────────────────────────────────────────────
  'Hard Headed':
    'When staggered, may take an action and suffer strain equal to ranks in Hard Headed to act normally.',
  'Hawk Bat Swoop':
    'Take the Hawk Bat Swoop maneuver; suffer 1 strain to disengage from all melee opponents without incurring the free attack.',
  'Healing Trance':
    'Take an action; enter a healing trance. Make a Hard Discipline check; on success heal wounds equal to successes. May not be performed more than once per encounter.',
  'Heightened Awareness':
    'Allies within close range add one Boost die to Perception and Vigilance checks.',
  'Hidden Storage':
    'Possesses hidden compartments in gear or body that can store items; each rank adds encumbrance 2 worth of storage that is not detected by standard searches.',
  'Hit And Run':
    'After making a melee attack and moving away, opponents do not receive a free attack when disengaging.',
  'Hold Together':
    'Once per encounter, take a Hold Together action on a vehicle; make a Hard Mechanics check. On success, the vehicle is not destroyed until the end of the following round.',
  'Hunter':
    'Add Boost dice per rank of Hunter to checks made while hunting, tracking, or attacking beasts and wild creatures.',
  'Hunter\'s Quarry':
    'Designate one target as Quarry. Gain Boost dice on all checks made to track, find, or attack the Quarry equal to ranks in Hunter\'s Quarry.',
  'Hunter\'s Quarry (Improved)':
    'When attacking the designated Quarry, the first hit each round deals additional damage equal to Cunning ranks.',

  // ── I ───────────────────────────────────────────────────────────────────
  'Idealist':
    'May spend Destiny Points to add Boost dice to social checks involving ideals this character believes in; each Destiny Point spent adds one Boost die.',
  'Imbue Item':
    'May spend Force pips to imbue a weapon or armor with the Force, granting it magical properties for the remainder of the encounter.',
  'Improved Dodge':
    'When activating Dodge, may upgrade the difficulty of the triggering check one additional time per rank of Improved Dodge.',
  'Improved Parry':
    'As Parry (Improved): when enemy rolls Despair or 3+ Threat on a Melee check, may spend to make an immediate counter-attack as an out-of-turn incidental.',
  'Improved Reflect':
    'As Reflect (Improved): when enemy rolls Despair or 3+ Threat on a ranged check, may reflect the attack back at the original attacker.',
  'Improved Scathing Tirade':
    'See Scathing Tirade (Improved).',
  'Incite Rebellion':
    'Take an action; make an opposed Leadership vs Discipline check against a group of NPCs; on success, cause them to rebel against their current commander for one round per success.',
  'Indistinguishable':
    'Opponents attempting to identify or recognize this character must succeed at an opposed Perception check against this character\'s Deception or Skulduggery.',
  'Inspiring Leadership':
    'Allies within medium range who succeed on a social or Leadership check recover 1 strain.',
  'Inspiring Rhetoric':
    'Take an action; make an Average Leadership check. Each success causes one ally within short range to immediately recover 1 strain.',
  'Inspiring Rhetoric (Improved)':
    'Each ally benefiting from Inspiring Rhetoric may also immediately perform one free maneuver.',
  'Inspiring Rhetoric (Supreme)':
    'Inspiring Rhetoric is now a maneuver rather than an action.',
  'Intense Focus':
    'Perform the Intense Focus maneuver: suffer 1 strain to upgrade the ability of the next check made this turn once.',
  'Intense Presence':
    'Once per session, recover strain equal to Presence ranks.',
  'Intimidating':
    'May suffer strain to downgrade the difficulty of Coercion checks or upgrade the difficulty of Discipline checks targeting this character. May be performed as an out-of-turn incidental up to ranks in Intimidating.',
  'Intuitive Evasion':
    'Suffer 1 strain to use Cunning instead of Agility when calculating defense for personal scale.',
  'Intuitive Improvements':
    'When successfully modifying a weapon or armor, increase the number of advantages required to gain additional mods by 1.',
  'It\'s Not That Bad':
    'Once per session, use an action to let an ally re-roll a Critical Injury result. They must accept the new result.',

  // ── J ───────────────────────────────────────────────────────────────────
  'Jetpack Expertise':
    'Reduce the difficulty of checks to avoid hazards while using a jetpack or similar device by 2. Negate the increased difficulty caused by jetpack use.',
  'Jump Up':
    'Once per round, may stand from prone as an incidental rather than a maneuver.',
  'Just Kidding!':
    'When using Deception or Charm in a social check, may suffer 2 strain to force the target to reroll one die.',
  'Just Kidding! (Improved)':
    'When using Just Kidding!, the target must choose the worse result between their original roll and the reroll.',

  // ── K ───────────────────────────────────────────────────────────────────
  'Keen Eyed':
    'Remove one Setback die per rank of Keen Eyed from Perception and Vigilance checks. Reduce the time to search an area by 50% per rank.',
  'Kill with Kindness':
    'Remove one Setback die per rank of Kill with Kindness from Charm or Leadership checks.',
  'Know Somebody':
    'Once per session, may reduce the rarity of one purchased item by 2 per rank of Know Somebody by citing a contact who can provide it.',
  'Know the Enemy':
    'When first engaging an enemy, make an Average Knowledge check. On success, learn one relevant weakness or piece of tactical information.',
  'Know their Weakness':
    'Once per combat, exploit a target\'s weakness — add damage equal to ranks in Know their Weakness to one hit against a designated target.',
  'Knowledge Specialization: Lore':
    'When making Knowledge (Lore) checks, may remove Setback dice equal to ranks, and treat checks as having one rank higher.',
  'Known Schematic':
    'Once per session, declare knowledge of a building or vehicle\'s floor plan. Gain Boost dice on all Mechanics checks for that structure.',
  'Knockdown':
    'When making a successful melee attack, spend 1 Advantage to knock the target prone.',

  // ── L ───────────────────────────────────────────────────────────────────
  'Lead from the Back':
    'Allies within medium range who use this character\'s Leadership skill instead of their own for Initiative checks add one Boost die to the roll.',
  'Lethal Blows':
    'Add +10 to any Critical Injury roll made against opponents, per rank of Lethal Blows.',
  'Let\'s Ride':
    'Once per round, may mount or dismount a vehicle or beast as an incidental rather than a maneuver.',
  'Loom':
    'When making a Coercion check, may add ranks in Coercion as bonus damage to melee attacks against the same target this round.',

  // ── M ───────────────────────────────────────────────────────────────────
  'Makashi Technique':
    'When making a Lightsaber check against a single opponent, may use Presence instead of Brawn. Successful hits reduce target\'s melee defense by 1 until end of round.',
  'Martial Grace':
    'When making Brawl or Melee checks, may use Agility instead of Brawn to determine damage.',
  'Master Doctor':
    'Once per session, perform emergency surgery using the Master Doctor action: make an Average Medicine check; on success, patient heals wounds equal to Intellect minus 1.',
  'Master Driver':
    'Once per session, perform Full Throttle as an incidental.',
  'Master Grenadier':
    'Remove Setback dice from checks with thrown weapons up to ranks in Master Grenadier. Add ranks as bonus damage to thrown weapon attacks.',
  'Master Instructor':
    'Once per session, suffer 2 strain to give another character Boost dice equal to Presence ranks on their next check.',
  'Master of Shadows':
    'When making Stealth checks, remove Setback dice equal to ranks. May use Cunning instead of Agility for Stealth.',
  'Master Pilot':
    'Once per session, perform Full Throttle as an incidental.',
  'Master Strategist':
    'Once per encounter, as an action make an Average Leadership check; until next turn all allies treat their Silhouette as 1 lower for the purpose of avoiding attacks.',
  'Mind Over Matter':
    'Once per session, suffer 2 strain to ignore the effects of one Critical Injury for the rest of the encounter.',
  'Multiple Opponents':
    'Add one Boost die to melee combat checks when engaged with two or more opponents.',

  // ── N ───────────────────────────────────────────────────────────────────
  'Natural Brawler':   'Once per session, may reroll any one Brawl check and keep the preferred result.',
  'Natural Charmer':   'Once per session, may reroll any one Charm check and keep the preferred result.',
  'Natural Commando':  'Once per session, may reroll any one Athletics check and keep the preferred result.',
  'Natural Driver':    'Once per session, may reroll any one Piloting check and keep the preferred result.',
  'Natural Hunter':    'Once per session, may reroll any one Survival check and keep the preferred result.',
  'Natural Leader':    'Once per session, may reroll any one Leadership check and keep the preferred result.',
  'Natural Mystic':    'Once per session, may reroll any one Force power check and keep the preferred result.',
  'Natural Negotiator':'Once per session, may reroll any one Negotiation check and keep the preferred result.',
  'Natural Outdoorsman':'Once per session, may reroll any one Survival or Athletics check in the wilderness and keep the preferred result.',
  'Natural Pilot':     'Once per session, may reroll any one Piloting check and keep the preferred result.',
  'Natural Programmer':'Once per session, may reroll any one Computers check and keep the preferred result.',
  'Natural Rogue':     'Once per session, may reroll any one Skulduggery check and keep the preferred result.',
  'Natural Scholar':   'Once per session, may reroll any one Knowledge check and keep the preferred result.',
  'Natural Tinkerer':  'Once per session, may reroll any one Mechanics check and keep the preferred result.',
  'Niman Technique':
    'May use Willpower instead of Brawn when making Lightsaber combat checks. When using a Force power with the Niman Technique active, may spend Force pips to add Advantage to the check.',
  'No Escape':
    'When attacking a target who is disoriented, staggered, or prone, add one Boost die to the attack.',
  'Nobody\'s Fool':
    'Upgrade the difficulty of Charm, Coercion, or Deception checks targeting this character once per rank of Nobody\'s Fool.',

  // ── O ───────────────────────────────────────────────────────────────────
  'Outdoorsman':
    'Remove one Setback die per rank from Survival checks. Reduce time required to travel through natural terrain by 50% per rank.',

  // ── P ───────────────────────────────────────────────────────────────────
  'Parry':
    'When hit by a melee attack while armed, suffer 3 strain to reduce damage by 2 + ranks in Parry. Must be wielding a melee weapon or unarmed.',
  'Parry (Improved)':
    'When an enemy rolls Despair or 3+ Threat on a melee attack while Parry is active, may spend to immediately make a melee counter-attack as an out-of-turn incidental — this does not cost an action.',
  'Persistent Targeting':
    'When the same target is attacked by this character two rounds in a row, the second attack adds one Boost die.',
  'Physical Training':
    'Add Boost dice to Athletics checks and increase encumbrance threshold by 1 per rank of Physical Training.',
  'Physician':
    'Remove Setback dice from Medicine checks equal to ranks of Physician. Patients recover wounds equal to this character\'s Intellect when treated.',
  'Pin':
    'After a successful Brawl attack, spend 1 Advantage to prevent the target from disengaging until the start of their next turn.',
  'Plausible Deniability':
    'Remove one Setback die per rank of Plausible Deniability from Coercion or Deception checks.',
  'Point Blank':
    'Add +1 damage per rank of Point Blank to ranged attacks made against targets at engaged or short range.',
  'Powerful Blast':
    'Increase the Blast quality rating of weapons by 2 per rank of Powerful Blast.',
  'Pre-emptive Avoidance':
    'As a reaction once per round, spend 1 Destiny Point when another character moves within range; move to a new position to avoid them.',
  'Precise Aim':
    'Once per round, perform the Precise Aim maneuver: suffer 1 strain to reduce the target\'s ranged defense by ranks in Precise Aim until end of turn.',

  // ── Q ───────────────────────────────────────────────────────────────────
  'Quick Draw':
    'Once per round, draw or holster a weapon as an incidental rather than a maneuver.',
  'Quick Draw (Improved)':
    'When using Quick Draw, may also draw a second weapon simultaneously.',
  'Quick Strike':
    'Add one Boost die per rank of Quick Strike to combat checks made against any target that has not yet acted this round.',

  // ── R ───────────────────────────────────────────────────────────────────
  'Rain of Death':
    'May perform a full-auto attack without suffering the normal full-auto strain penalty.',
  'Rapid Reaction':
    'Suffer strain up to ranks in Rapid Reaction to add an equal number of successes to Initiative checks.',
  'Ready for Anything':
    'Once per session, may move one Destiny Point from the GM pool to the players\' pool.',
  'Reconstruct the Scene':
    'When attempting to analyze or reconstruct the details of a past event, make an Average Perception check. Reduce difficulty by 1 per rank of Reconstruct the Scene.',
  'Reflect':
    'When hit by a ranged attack while wielding a lightsaber, suffer 3 strain to reduce damage by 2 + ranks in Reflect.',
  'Reflect (Improved)':
    'When an enemy rolls Despair or 3+ Threat on a ranged attack while Reflect is active, may immediately reflect the attack back at the attacker as an out-of-turn incidental counter-attack.',
  'Researcher':
    'Remove one Setback die per rank of Researcher from Knowledge checks. Halve the time needed to research a topic.',
  'Researcher (Improved)':
    'When researching a topic, gain extra information or piece together clues without additional checks.',
  'Resolve':
    'When suffering strain from an external source (not voluntarily), reduce the amount suffered by 1 per rank of Resolve, to a minimum of 1.',
  'Ritual Caster':
    'May take an action and spend Force pips to perform ritual magic outside of combat, producing persistent supernatural effects that last for a scene.',

  // ── S ───────────────────────────────────────────────────────────────────
  'Saber Swarm':
    'Commit one Force die. While committed, each hit with a Lightsaber weapon deals one additional hit, dealing base damage without any additional modifiers.',
  'Saber Throw':
    'Take a Saber Throw action; spend Force pips to make a ranged Lightsaber attack at short range. The saber returns at the end of the turn.',
  'Scathing Tirade':
    'Take an action; make an Average Coercion check. Each success inflicts 1 strain on each enemy within short range.',
  'Scathing Tirade (Improved)':
    'Enemies suffering from Scathing Tirade are also disoriented until the end of their next turn.',
  'Scathing Tirade (Supreme)':
    'Scathing Tirade may now be performed as a maneuver rather than an action.',
  'Second Chances':
    'Once per session per rank of Second Chances, may reroll a number of dice equal to Cunning on a failed check.',
  'Selective Detonation':
    'When activating the Blast quality, spend 1 Advantage per rank of Selective Detonation to exclude one target from the blast.',
  'Sense Advantage':
    'Once per session, convert all Setback dice in one check to Boost dice instead.',
  'Sense Danger':
    'Once per session, remove up to 2 Setback dice from any skill check.',
  'Sense Emotions':
    'When attempting to read another character\'s emotional state or intentions, use Vigilance vs Discipline. Success reveals surface emotions or general demeanor.',
  'Sense the Scene':
    'Once per encounter, make a Perception check before Initiative is rolled. On success, add one Boost die to Initiative rolls equal to successes.',
  'Shien Technique':
    'May use Cunning instead of Agility when making Lightsaber combat checks. Automatically return ranged attacks to attackers on Despair or 3+ Threat.',
  'Shortcut':
    'During a chase, add one Boost die per rank of Shortcut to any checks made to escape or pursue.',
  'Shortcut (Improved)':
    'When using Shortcut, also upgrade ability of the relevant check once.',
  'Shroud':
    'This character is unusually difficult to perceive even in plain sight. Opponents must succeed on an opposed Perception vs Stealth check to notice this character, even when not hiding.',
  'Side Step':
    'Once per round, perform the Side Step maneuver: suffer 1 strain per rank to upgrade the difficulty of one incoming ranged attack.',
  'Silhouette 3':
    'This character has an unusually large physical profile (Silhouette 3 — roughly the size of a large speeder or beast of burden). Attacks against them from smaller targets receive Boost dice; they treat some terrain as difficult.',
  'Skilled Jockey':
    'Remove one Setback die per rank of Skilled Jockey from Piloting (Planetary) and Piloting (Space) checks.',
  'Skilled Slicer':
    'Remove Setback dice from Computers checks equal to ranks. Spend 2 Advantage on a successful Computers check to perform an additional action on the same system.',
  'Skilled Teacher':
    'When assisting another character, add Boost dice equal to ranks in Skilled Teacher to their check instead of the normal single Boost.',
  'Sleight of Mind':
    'Add Boost dice equal to ranks of Sleight of Mind to Deception checks made to conceal Force use or other mental actions.',
  'Slippery Minded':
    'When a character would force this character to perform an action or reveal information using Coercion or Deception, may make an opposed Discipline vs Coercion/Deception check to resist.',
  'Smooth Talker (Charm)':
    'When making Charm checks, may spend Triumph results to add additional successes equal to the Charm ranks gained through this specialization.',
  'Smooth Talker (Coercion)':
    'When making Coercion checks, treat results as if the skill ranks were one higher per rank of Smooth Talker.',
  'Smooth Talker (Deception)':
    'When making Deception checks, may treat results as if rolling on a different, related social skill.',
  'Smooth Talker (Negotiation)':
    'When making Negotiation checks, may use Deception instead and treat results as Negotiation.',
  'Soft Spot':
    'After making a successful attack, spend 2 Advantage to ignore half of the target\'s total soak (rounded down) for that hit.',
  'Solid Repairs':
    'When repairing hull trauma, restore 1 additional hull trauma per rank of Solid Repairs.',
  'Soresu Technique':
    'May use Intellect instead of Brawn when making Lightsaber combat checks. When performing a Parry incidental, the character may reduce the damage of the triggering hit by an additional 2.',
  'Spare Clip':
    'Weapons with the Limited Ammo quality do not run out of ammo when a Despair is rolled.',
  'Speaks Binary':
    'May communicate with and give orders to droids without a translator. Add Boost dice to social checks with droids per rank of Speaks Binary.',
  'Spitfire':
    'When making a full-auto ranged attack, add one Boost die per rank of Spitfire to the check.',
  'Stalker':
    'Add one Boost die per rank of Stalker to Stealth and Coordination checks.',
  'Stand Firm':
    'When suffering a knockdown result, may spend 1 Destiny Point to remain standing.',
  'Starship Adversary':
    'Upgrade the difficulty of any combat checks targeting the vehicle this character pilots once per rank of Starship Adversary.',
  'Steely Nerves':
    'Suffer 1 strain to ignore the effect of one ongoing Critical Injury for a number of rounds equal to ranks in Steely Nerves.',
  'Stimpack Specialisation':
    'Stimpacks heal 1 additional wound per rank of Stimpack Specialisation when used on this character or a patient this character treats.',
  'Street Smarts':
    'Remove Setback dice from Streetwise and Knowledge (Underworld) checks equal to ranks in Street Smarts.',
  'Stroke of Genius':
    'Once per session, may use an action and make a Hard Intellect check. On success, gain one relevant piece of information about the current problem — equivalent to spending 2 Advantages.',
  'Strong Arm':
    'Treat weapons with the Limited Ammo or Slow-Firing quality as having one additional rank of Reliable.',
  'Stunning Blow':
    'When making a melee attack, spend 1 Advantage to deal damage as strain instead of wounds.',
  'Stunning Blow (Improved)':
    'When Stunning Blow is activated, the target is also disoriented until the end of their next turn.',
  'Surgeon':
    'Remove one Setback die per rank of Surgeon from Medicine checks made to heal wounds. Patients heal one additional wound per rank during natural recovery.',
  'Swift':
    'Do not suffer the movement penalties for moving through difficult or hazardous terrain.',

  // ── T ───────────────────────────────────────────────────────────────────
  'Tactical Direction':
    'Once per round, take a Tactical Direction maneuver; an ally within medium range may immediately perform one free action on their next turn.',
  'Targeted Blow':
    'After a successful melee attack, spend 1 Advantage to add Agility ranks as additional damage.',
  'Technical Aptitude':
    'Reduce time needed to make Computers checks by 50% per rank of Technical Aptitude. Remove one Setback die from Computers checks per rank.',
  'The Force is My Ally':
    'Once per session, commit Force dice up to Force Rating. While committed, add equal number of Boost dice to all checks.',
  'Thorough Assessment':
    'Make a Hard Perception or Knowledge check to fully assess a scene, vehicle, or target. On success, gain Boost dice for all subsequent related checks equal to successes.',
  'Time to Go':
    'Once per round, when an ally within short range is targeted by a combat check, may move to their position and intercept — the attack targets this character instead.',
  'Tinkerer':
    'May add one additional non-stackable mod slot to a number of items equal to ranks in Tinkerer per session.',
  'Touch of Fate':
    'Once per session, add two Boost dice to any one check.',
  'Toughness':
    'Increase wound threshold by 2 per rank of Toughness.',
  'True Aim':
    'Once per round, take the True Aim maneuver; suffer 1 strain. May activate up to ranks in True Aim per round. Upgrade ability of the next ranged combat check once per activation.',
  'Trust No One':
    'When subject to a social manipulation check, add Boost dice to the opposed check equal to ranks in Trust No One.',

  // ── U ───────────────────────────────────────────────────────────────────
  'Unarmed Parry':
    'When hit by a melee attack while unarmed, suffer 3 strain to reduce damage by 2 + ranks in Unarmed Parry. Does not require a weapon.',
  'Uncanny Reactions':
    'Add one Boost die per rank of Uncanny Reactions to all Vigilance checks.',
  'Uncanny Senses':
    'Add one Boost die per rank of Uncanny Senses to all Perception checks.',
  'Up the Ante':
    'When gambling or bluffing, add Boost dice equal to ranks of Up the Ante. May spend Triumph to gain credits or social advantage.',
  'Utinni!':
    'When selling salvage or scavenged parts, increase selling price by 10% per rank. Remove Setback dice from checks to find specific items in junkyards or black markets.',

  // ── V ───────────────────────────────────────────────────────────────────
  'Valuable Facts':
    'Once per session, may reveal a "valuable fact" about the current scene or encounter. Gain 1 Destiny Point if the fact helps resolve a situation.',

  // ── W ───────────────────────────────────────────────────────────────────
  'Wheel and Deal':
    'When selling goods or services legally, gain an additional 10% of the base price per rank of Wheel and Deal.',
  'Works Like a Charm':
    'Once per session, when an item with a Limited Ammo or Slow-Firing quality would malfunction, it does not.',

}

// ── Activation type overrides ───────────────────────────────────────────────
// Omitted entries default to 'passive'. Keys here are BASE names (no rank).
export const TALENT_ACTIVATION: Record<string, string> = {
  'Parry':                    'out of turn',
  'Parry (Improved)':         'out of turn',
  'Reflect':                  'out of turn',
  'Reflect (Improved)':       'out of turn',
  'Improved Parry':           'out of turn',
  'Improved Reflect':         'out of turn',
  'Unarmed Parry':            'out of turn',
  'Dodge':                    'out of turn',
  'Improved Dodge':           'out of turn',
  'Side Step':                'maneuver',
  'Body Guard':               'maneuver',
  'Coordinated Assault':      'maneuver',
  'Frenzied Attack':          'maneuver',
  'Brace':                    'maneuver',
  'True Aim':                 'maneuver',
  'Hawk Bat Swoop':           'maneuver',
  'Quick Draw':               'incidental',
  'Jump Up':                  'incidental',
  'Intense Focus':            'maneuver',
  'Pre-emptive Avoidance':    'out of turn',
  'Let\'s Ride':              'incidental',
  'Field Commander':          'action',
  'Field Commander (Improved)':'action',
  'Scathing Tirade':          'action',
  'Scathing Tirade (Improved)':'action',
  'Scathing Tirade (Supreme)':'maneuver',
  'Inspiring Rhetoric':       'action',
  'Inspiring Rhetoric (Improved)':'action',
  'Inspiring Rhetoric (Supreme)':'maneuver',
  'Full Throttle':            'action',
  'Full Throttle (Improved)': 'action',
  'Full Throttle (Supreme)':  'incidental',
  'Brilliant Evasion':        'action',
  'Saber Throw':              'action',
  'Master Doctor':            'action',
  'Stroke of Genius':         'action',
  'Clever Commander':         'action',
  'Incite Rebellion':         'action',
  'Know the Enemy':           'action',
  'Tactical Direction':       'maneuver',
  'Time to Go':               'out of turn',
  'Crippling Blow':           'active',
  'Knockdown':                'active',
  'Soft Spot':                'active',
  'Anatomy Lessons':          'active',
  'Dead to Rights':           'active',
  'Targeted Blow':            'active',
  'Feint':                    'active',
  'Fire Control':             'active',
  'Barrage':                  'passive',
  'Point Blank':              'passive',
  'Lethal Blows':             'passive',
  'Adversary':                'passive',
  'Enduring':                 'passive',
  'Durable':                  'passive',
  'Toughness':                'passive',
  'Soresu Technique':         'passive',
  'Ataru Technique':          'passive',
  'Makashi Technique':        'passive',
  'Shien Technique':          'passive',
  'Niman Technique':          'passive',
  'Force Rating':             'passive',
  'Feral Strength':           'passive',
  'Quick Strike':             'passive',
  'Stalker':                  'passive',
  'Swift':                    'passive',
  'Finesse':                  'passive',
  'Shroud':                   'passive',
  'Natural Charmer':          'incidental',
  'Natural Negotiator':       'incidental',
  'Natural Leader':           'incidental',
  'Natural Hunter':           'incidental',
  'Natural Pilot':            'incidental',
  'Natural Brawler':          'incidental',
  'Natural Commando':         'incidental',
  'Natural Rogue':            'incidental',
  'Natural Mystic':           'incidental',
  'Natural Tinkerer':         'incidental',
  'Natural Driver':           'incidental',
  'Natural Outdoorsman':      'incidental',
  'Natural Programmer':       'incidental',
  'Natural Scholar':          'incidental',
  'Touch of Fate':            'incidental',
  'Intense Presence':         'incidental',
  'Sense Danger':             'incidental',
  'Sense Advantage':          'incidental',
  'Ready for Anything':       'incidental',
  'Spare Clip':               'incidental',
  'Stand Firm':               'incidental',
  'Steely Nerves':            'incidental',
  'Hard Headed':              'action',
  'Stunning Blow':            'active',
  'Stunning Blow (Improved)': 'active',
  'Pin':                      'active',
  'Grapple':                  'active',
  'Draw Closer':              'active',
  'Drive Back':               'active',
}
