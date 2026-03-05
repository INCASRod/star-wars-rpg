-- Seed data for ref_critical_injuries
-- FFG Star Wars RPG Critical Injury table (d100 + modifiers)
-- Schema: (roll_min, roll_max, severity, name, description)

INSERT INTO ref_critical_injuries (roll_min, roll_max, severity, name, description) VALUES
  (1,   5,   'Easy',     'Minor Nick',         'The target suffers 1 strain.'),
  (6,   10,  'Easy',     'Slowed Down',        'The target can only act during the last allied Initiative slot on their next turn.'),
  (11,  15,  'Easy',     'Sudden Jolt',        'The target drops whatever is in hand.'),
  (16,  20,  'Easy',     'Distracted',         'The target cannot perform a free maneuver during their next turn.'),
  (21,  25,  'Easy',     'Off-Balance',        'Add 1 Setback die to the target''s next skill check.'),
  (26,  30,  'Easy',     'Discouraging Wound', 'Move 1 pointed range band closer to the target or 1 pointed range band farther away.'),
  (31,  35,  'Easy',     'Stunned',            'The target is staggered until the end of their next turn.'),
  (36,  40,  'Easy',     'Stinger',            'Increase difficulty of next check by one.'),
  (41,  45,  'Average',  'Bowled Over',        'The target is knocked prone and suffers 1 strain.'),
  (46,  50,  'Average',  'Head Ringer',        'The target increases the difficulty of all Intellect and Cunning checks by one until this Critical Injury is healed.'),
  (51,  55,  'Average',  'Fearsome Wound',     'The target increases the difficulty of all Presence and Willpower checks by one until this Critical Injury is healed.'),
  (56,  60,  'Average',  'Agonizing Wound',    'The target increases the difficulty of all Brawn and Agility checks by one until this Critical Injury is healed.'),
  (61,  65,  'Average',  'Slightly Dazed',     'The target is disoriented until this Critical Injury is healed.'),
  (66,  70,  'Average',  'Scattered Senses',   'The target removes all Boost dice from skill checks until this Critical Injury is healed.'),
  (71,  75,  'Average',  'Hamstrung',          'The target loses their free maneuver until this Critical Injury is healed.'),
  (76,  80,  'Average',  'Overpowered',        'The target leaves themselves open, and the attacker may immediately attempt another free attack against them, using the same pool as the original attack.'),
  (81,  85,  'Hard',     'Winded',             'Until this Critical Injury is healed, the target cannot voluntarily suffer strain to activate any abilities or gain additional maneuvers.'),
  (86,  90,  'Hard',     'Compromised',        'Increase difficulty of all skill checks by one until this Critical Injury is healed.'),
  (91,  95,  'Hard',     'At the Brink',       'The target suffers 1 strain each time they perform an action until this Critical Injury is healed.'),
  (96,  100, 'Hard',     'Crippled',           'One of the target''s limbs (selected by the GM) is crippled; increase difficulty of all checks that require that limb by one until this Critical Injury is healed.'),
  (101, 105, 'Hard',     'Maimed',             'A limb is permanently lost. Unless the target has a cybernetic replacement, the target cannot perform actions that would require the use of that limb. All other actions gain 1 Setback die until this Critical Injury is healed.'),
  (106, 110, 'Hard',     'Horrific Injury',    'Randomly roll 1d10 to determine one of the target''s characteristics—1-3 for Brawn, 4-6 for Agility, 7 for Intellect, 8 for Cunning, 9 for Willpower, 10 for Presence. Until this Critical Injury is healed, treat that characteristic as one point lower.'),
  (111, 115, 'Hard',     'Temporarily Lame',   'Until this Critical Injury is healed, the target cannot perform more than one maneuver during their turn.'),
  (116, 120, 'Hard',     'Blinded',            'The target can no longer see. Upgrade the difficulty of all checks twice. This Critical Injury can be healed normally.'),
  (121, 125, 'Hard',     'Knocked Senseless',  'The target is staggered for the remainder of the encounter.'),
  (126, 130, 'Daunting', 'Gruesome Injury',    'Randomly roll 1d10 to determine one of the target''s characteristics—1-3 for Brawn, 4-6 for Agility, 7 for Intellect, 8 for Cunning, 9 for Willpower, 10 for Presence. That characteristic is permanently reduced by one, to a minimum of 1.'),
  (131, 140, 'Daunting', 'Bleeding Out',       'Every round, the target suffers 1 wound and 1 strain at the beginning of their turn. For every five wounds they suffer beyond their wound threshold, they suffer one additional Critical Injury. Roll on the chart, suffering the injury (if they take this result a second time due to this, count up).'),
  (141, 150, 'Daunting', 'The End Is Nigh',    'The target will die after the last Initiative slot during the next round unless this Critical Injury is healed.'),
  (151, NULL, NULL,      'Dead',               'Complete, irreversible death.');
