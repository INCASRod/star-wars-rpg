-- 074_respec_tree_and_talent_updates.sql
-- Updates 32 changed reSpec specialization trees to match April 2026 PDFs.

-- PART 1: New custom talent inserts

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('DYNPERS','Dynamic Personality','Once per encounter, after making a successful social check, suffer strain up to the character''s Presence to increase or decrease an affected character''s strain by that number until end of the next round.','taIncidental',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('HITDECK','Hit the Deck','After determining the character would be hit by an explosion but before damage is applied, spend a Destiny Point to perform a Move maneuver as an incidental to move into cover or out of the blast radius.','taIncidental',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('HITDECKIMP','Hit the Deck (Improved)','When activating Hit the Deck, allies within short range equal to Cunning or Vigilance may also perform a Move maneuver as an incidental to move into cover or out of the blast radius.','taIncidental',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('EXPLSURP','Explosive Surprise','Once per session, make a [B]Hard ([DI][DI][DI])[b] Skulduggery check to establish how a previously existing device has been covertly placed within long range. Spend [AD][AD][AD] to activate or detonate it as an incidental while within extreme range.','taAction',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('DIAGN','Diagnostician','Once per session, make a [B]Hard ([DI][DI][DI])[b] Medicine check. On success, reveal a medical condition a target is suffering from. The GM may impose negative effects on the diagnosed character.','taAction',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('KILINSTN','Killer Instincts','Unarmed and improvised weapon attacks the character makes gain Pierce equal to their ranks in Survival.','taPassive',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('TIMSPLIT','Time-Splitter','Once per encounter, perform the Time-Splitter maneuver to ignore a weapon''s Slow-Firing quality this round and increase the difficulty of the next check using it equal to its Slow-Firing ranks. May also allow use of a weapon already fired this round by upgrading the difficulty equal to the number of times fired.','taManeuver',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('GUNSBLAZIMP','Guns Blazing (Improved)','Once per encounter after a successful combat check with two Ranged (Light) weapons, may spend 5 [AD] or [TR] to generate an additional hit from the primary weapon allocated to a different enemy.','taPassive',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('WHERITHURTS','Where It Hurts','Once per encounter, make a [B]Hard ([DI][DI][DI])[b] Perception check and choose a foe within long range. On success, attacks against that target gain Pierce equal to Cunning until end of encounter. Spend [AD] or [TR] to immediately take another action.','taAction',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('OVERKILL','Overkill','Once per attack when the character causes a foe to exceed their wound threshold, suffer 2 strain to deal damage equal to the excess to another target within short range.','taIncidental',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('NOTIMEBL','No Time to Bleed','Once per session, spend a Destiny Point to recover strain and/or wounds in any combination up to ranks in Discipline.','taManeuver',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('FOLLEAD','Follow My Lead','Once per round, spend [TR] from a check to allow an ally within short range to use the character''s skill ranks for their next check using that skill.','taPassive',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('KILLCONF','Kill Confirmed','Once per session, upgrade the difficulty of the next ranged attack once to have one hit ignore the target''s Soak. The GM may spend [TH][TH][TH] or [DE] to have the weapon malfunction.','taIncidental',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('DREADHEAD','Dreadhead','Custom reSpec talent for the Maintainer specialization. Consult your Game Master for the full description and effects.','taAction',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('SUBISSUE','Substandard Issue','Once per encounter, subject a character to a [B]Hard ([DI][DI][DI])[b] Negotiation check. May suffer 2 strain to add [BO]. On success, the target loses access to 1 item they carry.','taIncidental',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

INSERT INTO ref_talents (key,name,description,activation,is_ranked,is_force_talent,dataset_source,is_retired)
VALUES ('REVENGIMP','Reverse Engineering (Improved)','The character may scrap the original item when taking the Reverse Engineering action. May spend [AD] to give the crafted item a Superior quality at the cost of one Hard Point. Items without Hard Points gain a narrative benefit.','taPassive',false,false,'respec',false)
ON CONFLICT (key,dataset_source) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,activation=EXCLUDED.activation;

-- PART 2: Description updates for existing custom talents

UPDATE ref_talents SET name='Animal Companion',description='Choose an animal no larger than Silhouette 2 to bond with as an Animal Companion. If lost or destroyed, the character may work with the GM to bond with a new one.',activation='taPassive',is_ranked=false
WHERE key='ANIMCOMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Animal Companion (Improved)',description='The character''s Animal Companion may be up to Silhouette 3. The Animal Companion''s Critical Rating is 1 higher.',activation='taPassive',is_ranked=false
WHERE key='ANCOIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Wily Rider',description='While mounted, the animal counts as Silhouette one lower when being attacked, minimum 1.',activation='taPassive',is_ranked=false
WHERE key='WILYRIDE' AND dataset_source='respec';

UPDATE ref_talents SET name='Master Rider',description='Once per turn while mounted, suffer 2 strain to perform a Survival or riding check or handle a mounted beast as a maneuver instead of an action.',activation='taManeuver',is_ranked=false
WHERE key='MASTRID' AND dataset_source='respec';

UPDATE ref_talents SET name='Wrangle',description='Once per round, suffer strain up to Athletics ranks to perform the Wrangle maneuver. The wrangled creature treats surroundings as difficult terrain. Spend [AD] to Immobilize for rounds equal to Athletics ranks. Requires rope or similar restraint.',activation='taManeuver',is_ranked=false
WHERE key='WRANGLE' AND dataset_source='respec';

UPDATE ref_talents SET name='Ride Down',description='While mounted, the mount''s Brawl attacks and soothe/train checks gain the Blast quality. Once per encounter the mount deals additional damage equal to its speed.',activation='taIncidental',is_ranked=false
WHERE key='RIDDOW' AND dataset_source='respec';

UPDATE ref_talents SET name='Trusty Companion',description='Once per session when successfully attacked, spend 1 Destiny Point to have a nearby Animal Companion become the target instead. Or when an Animal Companion within short range is hit, spend 1 Destiny Point to become the target instead.',activation='taIncidental',is_ranked=false
WHERE key='TRUSCOMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Break Them In',description='Make a [B]Hard ([DI][DI][DI])[b] Athletics check to forcibly train engaged animals, upgrading difficulty by the highest Willpower. On success, one animal becomes docile and suffers 5 strain. Gain [BO] per 2 additional animals per additional [AD].',activation='taAction',is_ranked=false
WHERE key='BRTHIN' AND dataset_source='respec';

UPDATE ref_talents SET name='Fearsome (Improved)',description='On a successful Coercion check, the target suffers strain equal to ranks of Fearsome in addition to normal effects.',activation='taPassive',is_ranked=false
WHERE key='FEARIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Sending a Message',description='Once per encounter, after incapacitating a foe or inflicting a Critical Injury, suffer 1 strain to add [BO] to all checks by foes within medium range equal to their Willpower this encounter.',activation='taIncidental',is_ranked=false
WHERE key='SENDMESS' AND dataset_source='respec';

UPDATE ref_talents SET name='...Or Else',description='Once per session, after a Coercion check that fails or results in [TH], spend a Destiny Point to add [BO] to the result instead.',activation='taIncidental',is_ranked=false
WHERE key='ORELSE' AND dataset_source='respec';

UPDATE ref_talents SET name='Against the Odds',description='Add 1 [BO] per rank of Against the Odds to Daunting difficulty or harder checks.',activation='taIncidental',is_ranked=true
WHERE key='AGAODD' AND dataset_source='respec';

UPDATE ref_talents SET name='Up the Ante',description='When gambling, win 50% more credits per rank of Up the Ante.',activation='taPassive',is_ranked=true
WHERE key='UPANTE' AND dataset_source='respec';

UPDATE ref_talents SET name='Swindler',description='Add 1 [BO] per rank to checks to cheat or commit subterfuge, per GM discretion.',activation='taPassive',is_ranked=true
WHERE key='SWIND' AND dataset_source='respec';

UPDATE ref_talents SET name='Raise the Stakes (Improved)',description='Double the number of Advantages and Triumphs required to activate Raise the Stakes.',activation='taPassive',is_ranked=false
WHERE key='RAISTAIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Let''s Make It Interesting',description='Once per session, after a successful gambling check, spend a Destiny Point to have winnings substitute or supplement a narrative reward rather than only credits.',activation='taIncidental',is_ranked=false
WHERE key='MAKITINT' AND dataset_source='respec';

UPDATE ref_talents SET name='Fortune Favors the Bold',description='Once per check, suffer 2 strain to upgrade the difficulty of the next check once. If successful, add [BO] equal to the final difficulty of the check.',activation='taIncidental',is_ranked=false
WHERE key='FORTFAVORBOLD' AND dataset_source='respec';

UPDATE ref_talents SET name='Reversal of Fortunes',description='Once per session, when making a gambling check, spend a Destiny Point to cancel a failure result and add [TH] to the next adversary check in the scene.',activation='taIncidental',is_ranked=false
WHERE key='REVFOR' AND dataset_source='respec';

UPDATE ref_talents SET name='Raise the Stakes',description='Once per check as an incidental, wager and upgrade the difficulty of the next check once. On success, add [BO] equal to the final difficulty.',activation='taPassive',is_ranked=false
WHERE key='RAISSTAK' AND dataset_source='respec';

UPDATE ref_talents SET name='Clever Solution',description='Once per encounter, make a [B]Hard ([DI][DI][DI])[b] Computers check. On success, use the linked characteristic in place of another for the remainder of the encounter.',activation='taIncidental',is_ranked=false
WHERE key='CLEVERSOLN' AND dataset_source='respec';

UPDATE ref_talents SET name='Make Your Own Luck',description='Once per session, make a [B]Hard ([DI][DI][DI])[b] Cool check. On success, allies equal to Cool ranks may reroll 1 positive die on their next check. Spend [TR] to allow one ally to reroll positive or negative.',activation='taAction',is_ranked=false
WHERE key='MAKLUCK' AND dataset_source='respec';

UPDATE ref_talents SET name='Second Chances',description='Once per encounter, choose positive dice equal to ranks in Second Chances and reroll them.',activation='taIncidental',is_ranked=true
WHERE key='SECCHANCE' AND dataset_source='respec';

UPDATE ref_talents SET name='Bolster',description='Perform the Bolster maneuver to remove 1 [SE] per rank imposed by a single environmental circumstance from checks made this encounter. May be used multiple times for additional environmental circumstances.',activation='taManeuver',is_ranked=true
WHERE key='BOLSTER' AND dataset_source='respec';

UPDATE ref_talents SET name='Bolster (Improved)',description='Perform the Bolster maneuver to remove [SE] imposed by a single environmental circumstance for all allies within short range. May be used multiple times for additional circumstances.',activation='taManeuver',is_ranked=false
WHERE key='BOLSTIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Sustained Fire',description='When performing an Aim maneuver, if the character succeeded on an attack this or last round, upgrade the ability of that attack instead of gaining the standard Aim benefit.',activation='taPassive',is_ranked=false
WHERE key='SUSTFIRE' AND dataset_source='respec';

UPDATE ref_talents SET name='Weapons Free',description='Once per session, increase the number of weapons that may fire this round, inflicting a hit per additional weapon or group fired.',activation='taPassive',is_ranked=false
WHERE key='WEAPFREE' AND dataset_source='respec';

UPDATE ref_talents SET name='Trigger Discipline',description='When making a ranged attack, suffer 2 strain to remove [BO] up to ranks of Trigger Discipline from the pool, adding [AD] for each removed.',activation='taIncidental',is_ranked=true
WHERE key='TRIGDISC' AND dataset_source='respec';

UPDATE ref_talents SET name='Master Missileer',description='When making a ranged attack, spend a Destiny Point to have the hit count as if it had the Guided quality, causing strain equal to the character''s combat skill ranks.',activation='taIncidental',is_ranked=false
WHERE key='MASTMISS' AND dataset_source='respec';

UPDATE ref_talents SET name='One in a Million',description='Once per session, when inflicting a Critical Hit, may spend 3 strain to change the result to any Hard Critical result.',activation='taIncidental',is_ranked=false
WHERE key='ONEINAMIL' AND dataset_source='respec';

UPDATE ref_talents SET name='Trick Shot',description='Remove [SE] from Ranged checks due to the target''s cover or from the Aim maneuver. May also target foes without line of sight, per GM discretion.',activation='taPassive',is_ranked=false
WHERE key='TRSH' AND dataset_source='respec';

UPDATE ref_talents SET name='Shoot First',description='Once per session when a foe would attack, spend a Destiny Point to attack that foe before they act as an out-of-turn incidental. They are considered to have not yet acted this round.',activation='taIncidental',is_ranked=false
WHERE key='SHFR' AND dataset_source='respec';

UPDATE ref_talents SET name='Ask Questions Later',description='Once per encounter as an out-of-turn incidental, add [BO] to a social check made by the character or an ally based on adversaries defeated this encounter.',activation='taIncidental',is_ranked=false
WHERE key='ASQULA' AND dataset_source='respec';

UPDATE ref_talents SET name='Guns Blazing',description='When making a combat check with two Ranged (Light) weapons, spend [AD][AD][AD] to generate an additional hit from one weapon allocated to a different target.',activation='taPassive',is_ranked=false
WHERE key='GUNSBLAZING' AND dataset_source='respec';

UPDATE ref_talents SET name='Suppressing Fire',description='Spend [AD] on a ranged attack to force the target to suffer strain equal to ranks of Suppressing Fire if they leave their current position before end of the character''s next turn.',activation='taPassive',is_ranked=true
WHERE key='SUPPRFIRE' AND dataset_source='respec';

UPDATE ref_talents SET name='Suppressing Fire (Improved)',description='Foes who suffer strain from Suppressing Fire and foes within short range of that character upgrade the difficulty of their next check once.',activation='taPassive',is_ranked=false
WHERE key='SUPFIRIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Lock and Load',description='Once per encounter, load or reload a weapon as an incidental including Limited Ammo weapons. Also reduces preparation time or Prepare quality by 1.',activation='taIncidental',is_ranked=false
WHERE key='LOCK&LOAD' AND dataset_source='respec';

UPDATE ref_talents SET name='Return Fire!',description='Once per round, when an enemy incapacitates or inflicts a Critical Injury on an ally within short range, suffer 5 strain to inflict a hit on the attacking enemy with an equipped weapon.',activation='taIncidental',is_ranked=false
WHERE key='RETUFIRE' AND dataset_source='respec';

UPDATE ref_talents SET name='Fight Through It',description='Once per encounter, when an ally would exceed a threshold, make a [B]Hard ([DI][DI][DI])[b] Coercion check to reset that ally''s wounds or strain back below the threshold.',activation='taIncidental',is_ranked=false
WHERE key='FIGHTHRO' AND dataset_source='respec';

UPDATE ref_talents SET name='That''s How It''s Done',description='Suffer 1 strain to upgrade the ability of an ally''s next skill check once. The number of allies that may benefit per rank increases by 1.',activation='taPassive',is_ranked=true
WHERE key='THATHOWDONE' AND dataset_source='respec';

UPDATE ref_talents SET name='Stern Mentor',description='Once per encounter, make a [B]Hard ([DI][DI][DI])[b] Coercion check. On success, allies equal to Willpower may suffer 2 strain to decrease their next check''s difficulty once.',activation='taPassive',is_ranked=false
WHERE key='STERMENT' AND dataset_source='respec';

UPDATE ref_talents SET name='Encouraging Words',description='After an ally within short range performs a check, make an Average ([DI][DI]) Leadership check. On success, add Leadership ranks to the ally''s check this encounter.',activation='taManeuver',is_ranked=false
WHERE key='ENCWORD' AND dataset_source='respec';

UPDATE ref_talents SET name='Master Instructor',description='Once per round, when an ally performs a skill check, the character may add their ranks from a shared skill to that check, subject to having higher ranks than the ally.',activation='taPassive',is_ranked=false
WHERE key='MASINST' AND dataset_source='respec';

UPDATE ref_talents SET name='Skilled Teacher',description='Once per round, allow an ally to use the character''s ranks in a skill the character has higher ranks in for one check.',activation='taPassive',is_ranked=true
WHERE key='SKILLEDTEACH' AND dataset_source='respec';

UPDATE ref_talents SET name='Field Commander (Improved)',description='Field Commander''s effects apply to twice the normal number of allies. Affected allies may also perform 1 free maneuver.',activation='taAction',is_ranked=false
WHERE key='FLDCOMMIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Body Guard (Improved)',description='Once per round, an ally protected by Body Guard increases the difficulty of attacks against them by 1 additional time.',activation='taPassive',is_ranked=false
WHERE key='BODIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Kill or Be Killed',description='Once per session when exceeding wound threshold, spend a Destiny Point to make a melee attack. If the target is incapacitated, recover wounds equal to ranks of Resilience.',activation='taIncidental',is_ranked=false
WHERE key='KILORKILL' AND dataset_source='respec';

UPDATE ref_talents SET name='Savage Response',description='When suffering a Critical Injury without being incapacitated, suffer 3 strain to inflict a hit on an engaged foe with an equipped Melee or Brawl weapon.',activation='taIncidental',is_ranked=false
WHERE key='SAVARESP' AND dataset_source='respec';

UPDATE ref_talents SET name='Unyielding',description='Once per round, when hit by a ranged attack, suffer 2 strain to perform a Move maneuver toward the attacker as an out-of-turn incidental.',activation='taIncidental',is_ranked=false
WHERE key='UNYIELD' AND dataset_source='respec';

UPDATE ref_talents SET name='Juggernaut',description='Once per round when suffering a Critical Injury, spend a Destiny Point to reduce the result by 10 per rank of Resilience, minimum 1.',activation='taIncidental',is_ranked=false
WHERE key='JUGGERNAUT' AND dataset_source='respec';

UPDATE ref_talents SET name='Bloodlust',description='After incapacitating or inflicting a Critical Injury on a foe, add [BO] equal to ranks of Bloodlust to the next check the character makes that encounter.',activation='taIncidental',is_ranked=true
WHERE key='BLOOLUST' AND dataset_source='respec';

UPDATE ref_talents SET name='Always Prepared',description='Once per session as an incidental, produce a previously undiscovered piece of equipment with rarity no higher than 4. If producing a weapon, it has the Limited Ammo 1 quality.',activation='taIncidental',is_ranked=false
WHERE key='ALWAPREP' AND dataset_source='respec';

UPDATE ref_talents SET name='Percussive Maintenance',description='Once per encounter as a maneuver, before a repair or damage check on an engaged machine or vehicle, suffer 3 wounds to add successes equal to ranks of Melee or Brawl (whichever is higher).',activation='taManeuver',is_ranked=false
WHERE key='PERMAI' AND dataset_source='respec';

UPDATE ref_talents SET name='Emergency Bypass',description='Once per encounter, when an engaged starship or vehicle suffers a Critical Hit, spend a Destiny Point to have it suffer system strain equal to the critical severity to choose a different result of the same severity.',activation='taIncidental',is_ranked=false
WHERE key='EMERBYPA' AND dataset_source='respec';

UPDATE ref_talents SET name='Bad Motivator (Improved)',description='Once per session when taking the Bad Motivator action, choose a trigger under which the device fails. The device functions normally until that trigger occurs.',activation='taPassive',is_ranked=false
WHERE key='BADM' AND dataset_source='respec';

UPDATE ref_talents SET name='Solid Repairs (Improved)',description='Once per encounter, make a [B]Hard ([DI][DI][DI])[b] Mechanics check to increase the armor of an engaged starship or vehicle by 1 until end of encounter. Spend [AD] to recover hull trauma equal to Solid Repairs ranks.',activation='taAction',is_ranked=false
WHERE key='SOREIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Fine Tuning (Improved)',description='Once per encounter, make a [B]Hard ([DI][DI][DI])[b] Mechanics check to increase the system strain threshold of an engaged vessel by Fine Tuning ranks for the encounter. Spend [AD] to recover system strain equal to Fine Tuning ranks.',activation='taManeuver',is_ranked=false
WHERE key='FITUIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Hidden Feature',description='Once per session as an incidental, while aboard a vessel they created or know intimately, activate a previously undisclosed hidden feature as if spending a Destiny Point. Any character may reactivate it later by spending a Destiny Point.',activation='taIncidental',is_ranked=false
WHERE key='HIDFEA' AND dataset_source='respec';

UPDATE ref_talents SET name='Master of Arms (Improved)',description='Once per encounter, make a [B]Hard ([DI][DI][DI])[b] Mechanics check. On success, allies equal to Intellect add [BO] to all checks involving the Signature Vehicle until end of the character''s next turn.',activation='taAction',is_ranked=false
WHERE key='MASARMIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Signature Superiority',description='Once per encounter while aboard the Signature Vehicle, make a [B]Hard ([DI][DI][DI])[b] Mechanics check. On success, the character and allies equal to Intellect add [BO] to checks involving the Signature Vehicle until end of next turn.',activation='taAction',is_ranked=false
WHERE key='SIGNSUPE' AND dataset_source='respec';

UPDATE ref_talents SET name='Signature Vehicle (Improved)',description='The Signature Vehicle may have silhouette 5 or less. Increase its top speed by 1 and handling by 1.',activation='taPassive',is_ranked=false
WHERE key='SIGVEHIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Special Modifications',description='Once per session, make an Average ([DI][DI]) Mechanics check to temporarily convert an attachment into another valid attachment with equal or lesser hard points and rarity. May be made permanent by spending XP and credits.',activation='taPassive',is_ranked=false
WHERE key='SPECMODI' AND dataset_source='respec';

UPDATE ref_talents SET name='Tinkerer (Improved)',description='Each item benefiting from the character''s Tinkerer talent adds [BO] equal to Tinkerer ranks to the next check involving it.',activation='taPassive',is_ranked=false
WHERE key='TINKIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Make It Dangerous',description='Once per encounter as a maneuver, make a [B]Hard ([DI][DI][DI])[b] Mechanics check to add Burn, Stun Damage, or Vicious 1 to a weapon within engaged range until end of the character''s next turn. Spend [AD] to extend the effect one round.',activation='taManeuver',is_ranked=false
WHERE key='MAKEDANG' AND dataset_source='respec';

UPDATE ref_talents SET name='Cannibalize',description='Once per encounter, scrap an existing piece of gear to add [BO] to a check to create, improve, or repair a similar piece of gear, mechanical object, starship, or vehicle.',activation='taIncidental',is_ranked=false
WHERE key='CANNIB' AND dataset_source='respec';

UPDATE ref_talents SET name='Just Like New',description='Spend a Destiny Point to treat a non-destroyed piece of equipment as undamaged until end of the character''s next turn.',activation='taIncidental',is_ranked=false
WHERE key='JULINE' AND dataset_source='respec';

UPDATE ref_talents SET name='Make It Dangerous (Improved)',description='Suffer 1 strain to decrease the difficulty of Make It Dangerous to Average ([DI][DI]). Spend [AD] on the weapon check to cause a Crippled effect on a hit, unless a more grievous injury would result.',activation='taPassive',is_ranked=false
WHERE key='MAKDANIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Misappropriate',description='Once per session, make a [B]Hard ([DI][DI][DI])[b] Computers or Skulduggery check. On success, reveal how the character''s knowledge of supply lines meaningfully hampers enemy readiness. Spend [TR] to establish the character''s allies have access to the missing resource instead.',activation='taAction',is_ranked=false
WHERE key='MISAPPR' AND dataset_source='respec';

UPDATE ref_talents SET name='Bargain Hunter',description='When making a check to purchase or sell goods or services, add [BO] or remove [SE] equal to ranks of Bargain Hunter.',activation='taAction',is_ranked=true
WHERE key='BARGHUNT' AND dataset_source='respec';

UPDATE ref_talents SET name='Emergency Outfitting',description='Once per session, make an Average ([DI][DI]) Vigilance check to reveal an undisclosed piece of equipment for immediate use. Spend [AD] to produce additional identical items equal to Vigilance ranks.',activation='taAction',is_ranked=false
WHERE key='EMEROUTF' AND dataset_source='respec';

UPDATE ref_talents SET name='Well-Supplied',description='Once per session, spend 25 credits times the difficulty of a check to add [BO] to an ally''s skill check. The character must justify their prior investment in the ally''s success.',activation='taIncidental',is_ranked=false
WHERE key='WELLSUPP' AND dataset_source='respec';

UPDATE ref_talents SET name='For a Good Cause',description='Once per session, spend 1 Destiny Point to reduce the purchase price of a good or service by 50%, provided it directly furthers the character''s faction''s stated goals.',activation='taIncidental',is_ranked=false
WHERE key='FORAGOOD' AND dataset_source='respec';

UPDATE ref_talents SET name='Wheel and Deal',description='When selling goods legally, gain 10% more credits per rank of Wheel and Deal.',activation='taPassive',is_ranked=true
WHERE key='WHEEL' AND dataset_source='respec';

UPDATE ref_talents SET name='Wheel and Deal (Improved)',description='When selling illegal goods, upgrade the difficulty by 1 to gain 10% more credits per rank of Wheel and Deal.',activation='taIncidental',is_ranked=false
WHERE key='WHE&DEAIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Bypass Security (Improved)',description='Spend 2 [AD] or [TR] from a Bypass Security check to add Bypass Security ranks as [BO] to any Computers check to access a connected system, per GM discretion.',activation='taIncidental',is_ranked=false
WHERE key='BYPSECIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Bad Motivator (Improved)',description='Once per session when taking the Bad Motivator action, choose a trigger under which the device will fail. The device functions normally until that circumstance occurs.',activation='taPassive',is_ranked=false
WHERE key='BADMOTIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Booby Trap',description='Once per encounter, assemble a trap within short range. When triggered, make opposed Vigilance vs. Skulduggery. On success, deal wounds; spend [AD] or [TR] to Immobilize or Stagger the triggering character.',activation='taAction',is_ranked=false
WHERE key='BOOBTRAP' AND dataset_source='respec';

UPDATE ref_talents SET name='Making a Door',description='Once per encounter, make a [B]Hard ([DI][DI][DI])[b] Skulduggery check to treat an explosive as Breach 1 against structures or vehicles. Spend [AD][AD][AD] to treat as Breach 2 instead.',activation='taAction',is_ranked=false
WHERE key='MAKIDOOR' AND dataset_source='respec';

UPDATE ref_talents SET name='Masked Blast',description='Before using explosives, spend a Destiny Point to establish a louder noise to mask it. Bystanders must make opposed Vigilance vs. Stealth to notice the explosion.',activation='taIncidental',is_ranked=false
WHERE key='MASKBLAS' AND dataset_source='respec';

UPDATE ref_talents SET name='Master Saboteur',description='Once per session when using the Sunder quality, each [AD] spent to activate Sunder damages the target one step instead of one quality rating.',activation='taPassive',is_ranked=false
WHERE key='MASTSABO' AND dataset_source='respec';

UPDATE ref_talents SET name='Counter-Mobility',description='When defending a position, make a [B]Hard ([DI][DI][DI])[b] Vigilance check (12 hours). On success, foes treat the approach to extreme range as difficult terrain. Spend [AD][AD][AD] for planetary close range.',activation='taAction',is_ranked=false
WHERE key='COUNMOBI' AND dataset_source='respec';

UPDATE ref_talents SET name='Constructor',description='Remove [SE] or add [BO] per rank from checks to construct objects, defense works, fortifications, tunnels, bunkers, and similar combat engineering projects.',activation='taPassive',is_ranked=true
WHERE key='CONSTRUC' AND dataset_source='respec';

UPDATE ref_talents SET name='Constructor (Improved)',description='While in cover from a position they constructed, the character and allies increase soak against ranged attacks by 1 per rank of Constructor.',activation='taPassive',is_ranked=false
WHERE key='CONSTRIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Careful Planning',description='Once per session, spend a Destiny Point to declare that the character had previously prepared for a relevant contingency. Subject to GM approval; should not alter already-established facts.',activation='taIncidental',is_ranked=false
WHERE key='CAREPLAN' AND dataset_source='respec';

UPDATE ref_talents SET name='Reverse Engineering',description='Once per session, spend credits and make a Knowledge (Education) or Mechanics check to craft an imitation of a piece of gear the character has access to. Difficulty equals half the item''s encumbrance rounded up; time is 2 hours times the difficulty.',activation='taAction',is_ranked=false
WHERE key='REVEG' AND dataset_source='respec';

UPDATE ref_talents SET name='Subject Matter Expert',description='Once per encounter, spend 1 Destiny Point to add [AD] to a check to which the character''s personal experience is relevant.',activation='taIncidental',is_ranked=false
WHERE key='SME' AND dataset_source='respec';

UPDATE ref_talents SET name='Synthesis',description='Once per encounter as an action, make a [B]Hard ([DI][DI][DI])[b] Medicine check to create a single unit of any medical supply or chemical compound from nearby materials. Spend [TR] to create additional units.',activation='taAction',is_ranked=false
WHERE key='SYNTH' AND dataset_source='respec';

UPDATE ref_talents SET name='Technobabble',description='Once per session, make a [B]Hard ([DI][DI][DI])[b] Knowledge (Education) check to establish a technical fact relevant to the current problem. Should not alter core setting facts but may introduce reasonable technological conveniences.',activation='taAction',is_ranked=false
WHERE key='TECBAB' AND dataset_source='respec';

UPDATE ref_talents SET name='Eureka!',description='Once per session, after succeeding on an Intellect-linked check, spend strain equal to the check''s difficulty to add [AD] to the result.',activation='taIncidental',is_ranked=false
WHERE key='EURE' AND dataset_source='respec';

UPDATE ref_talents SET name='Dangerous Development',description='When repairing or crafting an item, suffer 2 strain and upgrade the check. On success, add one permanent improvement. An item may only benefit from Dangerous Development once.',activation='taManeuver',is_ranked=false
WHERE key='DANGDEV' AND dataset_source='respec';

UPDATE ref_talents SET name='Friends in Low Places',description='Add 1 [BO] per rank to checks to find or interact with the criminal element.',activation='taIncidental',is_ranked=true
WHERE key='JAOATR' AND dataset_source='respec';

UPDATE ref_talents SET name='Friends in Low Places',description='Add 1 [BO] per rank to checks to find or interact with the criminal element.',activation='taIncidental',is_ranked=true
WHERE key='FRLOW' AND dataset_source='respec';

UPDATE ref_talents SET name='Master of Dealing',description='Once per round, suffer 2 strain to reduce the difficulty of the next check to find, buy, or sell stolen or illegal goods once.',activation='taIncidental',is_ranked=false
WHERE key='MAODL' AND dataset_source='respec';

UPDATE ref_talents SET name='Opportunist',description='Add 1 [BO] per rank to combat checks against enemies who have attacked an ally this round or are otherwise distracted.',activation='taPassive',is_ranked=true
WHERE key='OPP' AND dataset_source='respec';

UPDATE ref_talents SET name='Swindler',description='Add or remove 1 [BO] per rank from checks related to cheating or subterfuge, per GM discretion.',activation='taPassive',is_ranked=true
WHERE key='SWI' AND dataset_source='respec';

UPDATE ref_talents SET name='Boring Conversation Anyway',description='Once per session, spend 2 [AD] or 1 [TR] from a failed social check to immediately make an attack check against that target as an incidental.',activation='taAction',is_ranked=false
WHERE key='BOCOAN' AND dataset_source='respec';

UPDATE ref_talents SET name='Double-Cross',description='Once per encounter, reveal how previously unknown scheming meaningfully impacts the current action. If the check fails and generates [DE], the GM may decide the character is the one being double-crossed.',activation='taAction',is_ranked=false
WHERE key='DUBX' AND dataset_source='respec';

UPDATE ref_talents SET name='Keen Eyed',description='Remove [SE] per rank from Perception and Vigilance checks. Decrease time to search an area or spot hidden objects.',activation='taPassive',is_ranked=true
WHERE key='KEENEYED' AND dataset_source='respec';

UPDATE ref_talents SET name='Keen Eyed (Improved)',description='Once per person, make a Formidable Perception or Vigilance check to add [BO] to the next observation checks they and allies make. Decrease difficulty once per rank of Keen Eyed.',activation='taPassive',is_ranked=false
WHERE key='KEEEYEIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Read the Wind',description='Once per encounter, make a [B]Hard ([DI][DI][DI])[b] Perception check. On success, a moderate environmental effect appears. Spend [AD] for an additional environmental effect.',activation='taAction',is_ranked=false
WHERE key='READWIND' AND dataset_source='respec';

UPDATE ref_talents SET name='Read the Wind (Improved)',description='Suffer 2 strain to perform the Read the Wind action as a maneuver.',activation='taManeuver',is_ranked=false
WHERE key='REAWINIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Read the Wind (Supreme)',description='Once per round, suffer strain up to ranks in Perception to remove that many [SE] imposed by environmental conditions from an engaged ally, adding 1 symbol for each removed. If 4 or more are removed, add 1 [AD].',activation='taAction',is_ranked=false
WHERE key='REAWINSUP' AND dataset_source='respec';

UPDATE ref_talents SET name='The Land Provides',description='Once per session, make a [B]Hard ([DI][DI][DI])[b] Survival check to fashion a low-tech solution using nearby forageable materials. Functions until end of encounter; GM may impose Inferior or Limited Ammo.',activation='taAction',is_ranked=false
WHERE key='LANDPROV' AND dataset_source='respec';

UPDATE ref_talents SET name='Natural Remedy',description='May use Survival instead of Medicine to heal wounds and Critical Injuries by increasing the difficulty of the check once.',activation='taPassive',is_ranked=false
WHERE key='NATUREME' AND dataset_source='respec';

UPDATE ref_talents SET name='On the Lookout',description='When making an initiative check, spend a Destiny Point to add [BO] to both the character''s check and to checks by allies equal to ranks in Cunning.',activation='taIncidental',is_ranked=false
WHERE key='ONLOOK' AND dataset_source='respec';

UPDATE ref_talents SET name='Gatherer',description='When foraging for food, water, or shelter, add 1 [BO] or remove 1 [SE] per rank of Gatherer from the check.',activation='taAction',is_ranked=true
WHERE key='GATHERER' AND dataset_source='respec';

UPDATE ref_talents SET name='Overcharged Battery',description='Once per round while piloting a starship, before a gunnery check from that vessel, have it suffer 2 system strain to increase attack damage by 2 or reduce Critical Rating by 1, minimum 1.',activation='taIncidental',is_ranked=false
WHERE key='OVBATT' AND dataset_source='respec';

UPDATE ref_talents SET name='Leverage',description='Suffer strain up to ranks of Leverage and add that many [BO] to the next skill check made by an equal number of enemies.',activation='taAction',is_ranked=true
WHERE key='LEVER' AND dataset_source='respec';

UPDATE ref_talents SET name='Stakeout',description='Once per session, make a [B]Hard ([DI][DI][DI])[b] Cool or Skulduggery check while surveilling a person or place. For the rest of the session, add [BO] to checks associated with that location or person.',activation='taAction',is_ranked=false
WHERE key='STAKEOUT' AND dataset_source='respec';

UPDATE ref_talents SET name='Stakeout (Improved)',description='When using Stakeout, spend 1 [AD] to extend the benefit to 1 ally per [AD] spent. Spend [TR] to extend to an additional character.',activation='taPassive',is_ranked=false
WHERE key='STAKEIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Dirty Tricks',description='Once per session, make a [B]Hard ([DI][DI][DI])[b] Skulduggery check to add [TH] to the next check made by enemies equal to ranks of Cunning.',activation='taAction',is_ranked=false
WHERE key='DIRTTRIC' AND dataset_source='respec';

UPDATE ref_talents SET name='Relentless',description='Add [BO] per rank to checks made to pursue, track, or investigate a target when the character has an active bounty, contract, or official obligation against them.',activation='taPassive',is_ranked=true
WHERE key='RELENTLESS' AND dataset_source='respec';

UPDATE ref_talents SET name='Ultimatum',description='Once per session, make a [B]Hard ([DI][DI][DI])[b] Coercion check to give an adversary a choice between two outcomes. The adversary must choose one and act on it.',activation='taAction',is_ranked=false
WHERE key='ULTIMATUM' AND dataset_source='respec';

UPDATE ref_talents SET name='Disruptive',description='When making a Computers check, spend [AD] per rank to add [TH] to the next Computers check by a character in the same connected system this encounter.',activation='taIncidental',is_ranked=true
WHERE key='DEFSLI' AND dataset_source='respec';

UPDATE ref_talents SET name='Disruptive (Improved)',description='Spend 2 [AD] from a Computers check opposing a foe''s Computers check to add Disruptive ranks to that foe''s Computers check in that system.',activation='taPassive',is_ranked=false
WHERE key='DEFSLIIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Logic Bomb',description='Once per session, make a [B]Hard ([DI][DI][DI])[b] Computers check against a connected system. On success, inflict strain equal to Knowledge (Education) ranks and spend [AD] to render the target''s slicing gear unstable.',activation='taAction',is_ranked=false
WHERE key='LOGIBOMB' AND dataset_source='respec';

UPDATE ref_talents SET name='Master Slicer',description='When making a Computers check, may spend [TR] to make further Computers checks within the same connected system.',activation='taPassive',is_ranked=false
WHERE key='MASSLIC' AND dataset_source='respec';

UPDATE ref_talents SET name='Ghost in the Machine',description='Suffer strain equal to Stealth ranks to add net successes to or reduce attempts to trace, locate, or identify the character while slicing.',activation='taIncidental',is_ranked=false
WHERE key='GHOSMACH' AND dataset_source='respec';

UPDATE ref_talents SET name='Delayed Response',description='Once per session, after being detected while slicing, spend a Destiny Point to delay alarms, pursuit, or reprisal until end of the character''s next turn.',activation='taPassive',is_ranked=false
WHERE key='DELARESP' AND dataset_source='respec';

UPDATE ref_talents SET name='Forceful Expulsion',description='Once per session, make a [B]Hard ([DI][DI][DI])[b] Computers check against a connected device and declare a trigger. On success, when the trigger occurs, enact a single command or shut it down.',activation='taAction',is_ranked=false
WHERE key='FORCEXPL' AND dataset_source='respec';

UPDATE ref_talents SET name='Shadowfeed Secret',description='Once per session, choose a target and make a Knowledge (Underworld) check. Difficulty based on target obscurity. On success, add successes to any Computers check to slice that target this session.',activation='taAction',is_ranked=false
WHERE key='SHADSECR' AND dataset_source='respec';

UPDATE ref_talents SET name='Skilled Slicer',description='When making a Computers check, may spend [TR] to make further Computers checks within the same connected system without additional penalties.',activation='taPassive',is_ranked=false
WHERE key='SKILLSLIC' AND dataset_source='respec';

UPDATE ref_talents SET name='Stroke of Genius',description='Once per session, add 1 [AD] to any Computers check with a result higher than the character''s linked Intellect.',activation='taPassive',is_ranked=false
WHERE key='STRGEN' AND dataset_source='respec';

UPDATE ref_talents SET name='Attack Pattern Delta',description='When piloting a starship or vehicle, make an Average ([DI][DI]) Leadership check to have allied vehicles within close range equal to Leadership ranks gain the benefit of the character''s Defensive Driving ranks until they leave close range or end of next turn.',activation='taAction',is_ranked=false
WHERE key='ATTADELT' AND dataset_source='respec';

UPDATE ref_talents SET name='Wing Commander',description='While piloting a starship or vehicle, the character and nearby allies may spend [AD] or [TR] from initiative checks to perform a pilot-only maneuver before turns begin during the encounter.',activation='taPassive',is_ranked=false
WHERE key='WINGCOMM' AND dataset_source='respec';

UPDATE ref_talents SET name='Make It Count',description='Once per round, after an enemy takes an ally out of action within short range, spend 1 Destiny Point to add [BO] equal to Presence to all checks made by allies equal to Presence.',activation='taIncidental',is_ranked=false
WHERE key='MAKITCOU' AND dataset_source='respec';

UPDATE ref_talents SET name='Brilliant Evasion',description='Once per round, when an allied ship within medium range would be attacked, the character may add [BO] to that ship''s defense checks. Allies within short range add [BO][BO] instead.',activation='taIncidental',is_ranked=false
WHERE key='BRI' AND dataset_source='respec';

UPDATE ref_talents SET name='Expert Tracker (Improved)',description='Once per session, make a Formidable Survival or Perception check to find an item lost by a tracked target. Decrease difficulty once per Expert Tracker rank to find a more significant item.',activation='taPassive',is_ranked=false
WHERE key='EXPTRAIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Natural Camouflage',description='When making a Stealth check in natural environments, suffer 2 strain to substitute Survival for the required skill.',activation='taPassive',is_ranked=false
WHERE key='NATUCAMO' AND dataset_source='respec';

UPDATE ref_talents SET name='Know Your Prey',description='Once per encounter, make a [B]Hard ([DI][DI][DI])[b] Knowledge (Xenology) check. On success, all checks against the character for the rest of the encounter are affected. Spend [AD] to extend to one ally per [AD].',activation='taAction',is_ranked=false
WHERE key='KNOWPREY' AND dataset_source='respec';

UPDATE ref_talents SET name='Nowhere Is Safe',description='Spend [TH][TH] or [DE] from a non-vehicle attack to reduce the target''s defense by Perception ranks until end of the character''s next turn. May reduce defense from talents, armor, and cover.',activation='taPassive',is_ranked=false
WHERE key='NOISSAFE' AND dataset_source='respec';

UPDATE ref_talents SET name='Nowhere Is Safe (Improved)',description='After a successful attack against a defenseless target, suffer 3 strain to add [TH] to the check. A target is defenseless if they have no relevant defense and are not benefiting from Guarded Stance.',activation='taPassive',is_ranked=false
WHERE key='NOSAFIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Blooded (Improved)',description='The character''s Blooded talent triggers one additional time per encounter.',activation='taPassive',is_ranked=false
WHERE key='BLOIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Hand Off',description='Once as an out-of-turn incidental, suffer 2 strain to covertly pick up or hide an engaged item of encumbrance 1 or smaller, or exchange up to two such items with an ally within short range.',activation='taIncidental',is_ranked=false
WHERE key='HANDOFF' AND dataset_source='respec';

UPDATE ref_talents SET name='Decoy',description='Once per session, spend a Destiny Point to produce a facsimile of an encumbrance 1 or smaller item. Any character attempting to identify it as counterfeit must make an opposed Perception vs. Skulduggery check.',activation='taAction',is_ranked=false
WHERE key='DECOY' AND dataset_source='respec';

UPDATE ref_talents SET name='Fade Away',description='Once per encounter, when targeted by a combat check, spend a Destiny Point to add Stealth ranks to defense. If the attack fails, the character may not be targeted until the beginning of their next turn.',activation='taIncidental',is_ranked=false
WHERE key='FADEAWAY' AND dataset_source='respec';

UPDATE ref_talents SET name='Exit Strategy',description='Once per session, make a [B]Hard ([DI][DI][DI])[b] Vigilance check to identify which characters within medium range can safely leave the encounter.',activation='taAction',is_ranked=false
WHERE key='EXITSTRA' AND dataset_source='respec';

UPDATE ref_talents SET name='Solid Repairs',description='When repairing hull trauma on a starship or vehicle, repair 1 additional hull trauma per rank of Solid Repairs.',activation='taPassive',is_ranked=true
WHERE key='SOLREP' AND dataset_source='respec';

UPDATE ref_talents SET name='Fine Tuning',description='When removing system strain from a starship or vehicle, remove 1 additional system strain per rank of Fine Tuning.',activation='taPassive',is_ranked=true
WHERE key='FINETUN' AND dataset_source='respec';

UPDATE ref_talents SET name='Field Tester',description='Remove 1 [SE] per rank of Field Tester from checks made to repair or improve equipment this session.',activation='taPassive',is_ranked=true
WHERE key='FITES' AND dataset_source='respec';

UPDATE ref_talents SET name='Field Calibration',description='Make an Average ([DI][DI]) Mechanics check to add [BO] to the next check made by an ally using a calibrated item.',activation='taManeuver',is_ranked=false
WHERE key='FICAL' AND dataset_source='respec';

UPDATE ref_talents SET name='Madcap Maintenance',description='Once per round, make a check to repair or maintain gear or a vessel. On success, add [BO] to the next check using it. On failure, the item suffers a point of damage or a System Failure critical if a vehicle.',activation='taAction',is_ranked=false
WHERE key='MADMAI' AND dataset_source='respec';

UPDATE ref_talents SET name='Field Calibration (Improved)',description='Once per round, suffer 2 strain to perform the Field Calibration action as a maneuver.',activation='taManeuver',is_ranked=false
WHERE key='FICAIMP' AND dataset_source='respec';

UPDATE ref_talents SET name='Kitbash',description='Once per session, make a [B]Hard ([DI][DI][DI])[b] Mechanics check to acquire a piece of gear using available components and improvised tools.',activation='taAction',is_ranked=false
WHERE key='KIBA' AND dataset_source='respec';

UPDATE ref_talents SET name='Inspiring Rhetoric (Supreme)',description='When making an Inspiring Rhetoric check, may spend [TR] to give each affected ally the benefits of Inspiring Rhetoric and Improved Inspiring Rhetoric simultaneously until the start of the character''s next turn.',activation='taAction',is_ranked=false
WHERE key='INSPRHETSUP' AND dataset_source='respec';

UPDATE ref_talents SET name='Savvy',description='When providing or accepting assistance, add [BO] equal to ranks of Savvy to the assisted character''s check in place of the normal assistance bonus.',activation='taPassive',is_ranked=true
WHERE key='SAVVY' AND dataset_source='respec';

UPDATE ref_talents SET name='Convincing Demeanor',description='Remove 1 [SE] per rank from Deception and Negotiation checks.',activation='taPassive',is_ranked=true
WHERE key='CONV' AND dataset_source='respec';

-- PART 3: Talent tree updates per specialization

-- AMBASSADOR
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["CONF","CONGENIAL","GRIT","SAVVY"],"directions":[{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":5,"talents":["INSPRHET","RESPKIND","NOBFOOL","GRIT"],"directions":[{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":2,"cost":15,"talents":["KILL","INTENSPRE","ESCACLAU","CONGENIAL"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["INSPRHETIMP","ACALLAID","WORKLIKECHARM","CONCOPT"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":4,"cost":25,"talents":["INSPRHETSUP","DEDI","GREAGOOD","UNITPEOP"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'AMBASSADOR' AND dataset_source = 'respec';

-- ANALYST
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["KEENEYED","RESEARCH","GRIT","COD"],"directions":[{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["ACTILIST","VALFACT","RESEARCH","COD"],"directions":[{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["SUPPEVI","RESEARCHIMP","THORASS","ENCCOMM"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["CAREPLAN","SME","GRIT","STRGEN"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["ACTLISIMP","DEDI","THOASSIMP","CODEIMPR"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":false}]}]}'::jsonb WHERE key = 'ANALYST' AND dataset_source = 'respec';

-- CHARMER
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["INSPRHET","CONGENIAL","CONV","HAPPHELP"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["INSPRHETIMP","KILL","CONGENIAL","GRIT"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["KILL","KILKINIMP","SAVVY","HAPHELIMP"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["INTENSPRE","GRIT","WORKLIKECHARM","JUSTKID"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["INSPRHETSUP","DYNPERS","DEDI","DONTSHOOT"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'CHARMER' AND dataset_source = 'respec';

-- CYBERTECH
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["TOUGH","CYBERNETICIST","MOREMACH","ENGREDUN"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":5,"talents":["STROFLES","SURG","OVERCHARGE","ENERGTRANS"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":10,"talents":["MOREMACH","EYEDET","GRIT","ENERSIPH"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["STRFLEIMP","MASTCYBE","MACMANIMP","MOREMACH"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":false,"down":false,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["STRFLESUP","DEDI","OVERCHARGEIMP","OVERCHARGESUP"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'CYBERTECH' AND dataset_source = 'respec';

-- DEMOLITIONIST
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["STEADYNERVES","GRIT","PWRBLST","TOUGH"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["IMPDET","HITDECK","STRONG","TOUGH"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["INVENT","HITDECKIMP","ENDUR","PWRBLST"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["IMPDETIMP","STENERIMP","GRIT","MAKIDOOR"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["IMPDETSUP","EXPLSURP","DEDI","MASGREN"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'DEMOLITIONIST' AND dataset_source = 'respec';

-- DOCTOR
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["GRIT","STIMAP","TOUGH","SURG"],"directions":[{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["VOORE","GRIT","PHYSICIAN","HEALSELF"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["DRSORD","SURG","STIMAPIMP","DIAGN"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["GRIT","IMPSURG","SURG","INTENSFOC"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":4,"cost":25,"talents":["DONOHA","DEDI","STIMAPSUP","ANAT"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":false}]}]}'::jsonb WHERE key = 'DOCTOR' AND dataset_source = 'respec';

-- DROIDTECH
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["EYEDET","DIREC","MACHMEND","DROCOM"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["MACHMEND","DEFTMAKER","MACHMEND","COMP"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":2,"cost":15,"talents":["MACMENIMP","IMPDIREC","GRIT","DIREC"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["EYEDET","BINALLY","DEFTMAKER","ACCACC"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["REROUTEPROC","THANMAK","DEDI","SUPDIREC"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'DROIDTECH' AND dataset_source = 'respec';

-- ENFORCER
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["INTIM","FEARSOME","TOUGH","STRSMART"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["TOUGH","LOOM","STUNBL","TALKTALK"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["FEARSOME","SENDMESS","CRIPV","STRSMART"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["FEARIMP","INTIM","SOFTSP","STRSMARTIMP"],"directions":[{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":4,"cost":25,"talents":["FEARSOME","ORELSE","MADEYOUTALK","DEDI"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'ENFORCER' AND dataset_source = 'respec';

-- GAMBLER
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["AGAODD","CONV","UPANTE","SWIND"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["GRIT","TOUGH","DEDI","RAISTAIMP"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":2,"cost":15,"talents":["SECCHANCE","UPANTE","MAKITINT","CONV"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["AGAODD","SECCHANCE","FORTFAVORBOLD","REVFOR"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["RAISSTAK","CLEVERSOLN","MAKLUCK","SECCHANCE"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'GAMBLER' AND dataset_source = 'respec';

-- GUNNER
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["OVERDEF","BRA","TOUGH","BURLY"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["GRIT","FIRESUP","BRA","DURA"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["OVERDEF","DEPSHOT","TRIGDISC","TOUGH"],"directions":[{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["TIMSPLIT","WEAPFREE","SUSTFIRE","ENDUR"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":false}]},{"index":4,"cost":25,"talents":["MASTMISS","DEDI","ONEINAMIL","EXHPORT"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":false,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'GUNNER' AND dataset_source = 'respec';

-- GUNSLINGER
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["GRIT","PLAUSDEN","RAPREA","QUICKDR"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["SIDESTEP","TRSH","QUICKST","QUICKDRIMP"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":2,"cost":15,"talents":["TOUGH","RAPREA","SORRYMESS","GRIT"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["SIDESTEP","SHFR","QUICKST","SPITFIRE"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["ASQULA","DEDI","GUNSBLAZING","GUNSBLAZIMP"],"directions":[{"up":false,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'GUNSLINGER' AND dataset_source = 'respec';

-- HEAVY
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["SUPPRFIRE","BURLY","TOUGH","DURA"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["BOLSTER","LOCK&LOAD","SIDESTEP","GRIT"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":2,"cost":15,"talents":["WHERITHURTS","SUPPRFIRE","DURA","BURLY"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["BOLSTER","TOUGH","OVERKILL","TOUGH"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":4,"cost":25,"talents":["RAINDEATH","SUPFIRIMP","DEDI","HEROICRES"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'HEAVY' AND dataset_source = 'respec';

-- INSTRUCTOR
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["UNQUAUTH","WELLROUND","TOUGH","BOD"],"directions":[{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":5,"talents":["FLDCOMM","ENCWORD","GRIT","DURA"],"directions":[{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["UNQUAUTH","MASINST","SKILLEDTEACH","BOD"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["FLDCOMMIMP","STERMENT","TOUGH","BODIMP"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":4,"cost":25,"talents":["FIGHTHRO","DEDI","THATHOWDONE","RETUFIRE"],"directions":[{"up":false,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'INSTRUCTOR' AND dataset_source = 'respec';

-- MAINTAINER
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["SOLREP","FINETUN","FITES","GRIT"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["GEARHD","BADM","TOUGH","FICAL"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["CANNIB","FINETUN","CONT","DREADHEAD"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["SOLREP","JULINE","MADMAI","FICAIMP"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["SOREIMP","FITUIMP","KIBA","DEDI"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'MAINTAINER' AND dataset_source = 'respec';

-- MARAUDER
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["INTIM","LETHALBL","FERSTR","FERSTR"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["TOUGH","DEFSTA","FERSTR","BLOOLUST"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["JUGGERNAUT","LETHALBL","BLOOLUST","KILINSTN"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["TOUGH","UNYIELD","ENDUR","FERSTR"],"directions":[{"up":false,"down":true,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":4,"cost":25,"talents":["TOUGHIMP","SAVARESP","DEDI","KILORKILL"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'MARAUDER' AND dataset_source = 'respec';

-- MECHANIC
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["SKILLJOCK","SOLREP","FINETUN","BYP"],"directions":[{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["TOUGH","GEARHD","GRIT","ALWAPREP"],"directions":[{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["PERMAI","SOLREP","EMERBYPA","GEARHD"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["GEARHD","ENDUR","FINETUN","BADM"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":4,"cost":25,"talents":["HOLDTOG","SOREIMP","FITUIMP","DEDI"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":false}]}]}'::jsonb WHERE key = 'MECHANIC' AND dataset_source = 'respec';

-- MERCENARY
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["GRIT","STRONG","COM","BOLSTER"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":false}]},{"index":1,"cost":10,"talents":["DYNFIRE","FLDCOMM","SIDESTEP","BOLSTER"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["PERSISTARGET","CONF","TOUGH","BOLSTIMP"],"directions":[{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["PERTARIMP","COM","NOTIMEBL","FOLLEAD"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":4,"cost":25,"talents":["KILLCONF","FLDCOMMIMP","COORDASS","DEDI"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'MERCENARY' AND dataset_source = 'respec';

-- MODDER
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["GEARHD","TINK","GRIT","SIGVEH"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["MASOFARM","TINK","FANCPAINT","TUNEDTHRUST"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":false},{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["TOUGH","GEARHD","SIGVEHIMP","CUSTCOOL"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["MASARMIMP","UNLOPOTE","HIDFEA","CUSTLOAD"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["SPECMODI","TINKIMP","DEDI","SIGNSUPE"],"directions":[{"up":false,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'MODDER' AND dataset_source = 'respec';

-- OUTLAW
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["FINETUN","INVENT","UTINNI","STRSMART"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["EXCEEDSPEC","CREATDES","SOLREP","TALKTALK"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["GRIT","CREATDES","CONT","MAKEDANG"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["EXCEEDSPECIMP","CANNIB","INVENT","TOUGH"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["EXCEEDSPECSUP","DEDI","JULINE","MAKDANIMP"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":false}]}]}'::jsonb WHERE key = 'OUTLAW' AND dataset_source = 'respec';

-- QUARTERMASTER
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["GRIT","CONGENIAL","WHEEL","CONGENIAL"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":5,"talents":["SOUNDINV","BOUGHT","GREASE","GRIT"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":2,"cost":10,"talents":["ALWAPREP","EMEROUTF","BARGHUNT","SOUNDINV"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]},{"index":3,"cost":15,"talents":["FORAGOOD","WELLSUPP","WHEEL","WHE&DEAIMP"],"directions":[{"up":false,"down":false,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":false}]},{"index":4,"cost":20,"talents":["SUBISSUE","DEDI","MASMERC","MISAPPR"],"directions":[{"up":false,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":false}]}]}'::jsonb WHERE key = 'QUARTERMASTER' AND dataset_source = 'respec';

-- SABOTEUR
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["BYP","STALK","TOUGH","PWRBLST"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["GRIT","BADM","IMPDET","HITDECK"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["BYPSECIMP","BYPSECIMP","HITDECKIMP","IMPDETIMP"],"directions":[{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["PWRBLST","BOOBTRAP","BADMOTIMP","MASGREN"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":4,"cost":25,"talents":["MAKIDOOR","MASKBLAS","DEDI","MASTSABO"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":false}]}]}'::jsonb WHERE key = 'SABOTEUR' AND dataset_source = 'respec';

-- SAPPER
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["PWRBLST","GRIT","DURA","CONSTRUC"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["STRONG","KNOWSCH","IMPDEF","TOUGH"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["PWRBLST","CONT","CONSTRUC","COUMOBIMP"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["IMPDET","MASGREN","CONSTRIMP","COUNMOBI"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["MASTDEMO","WEAKFOUND","IMPPOS","DEDI"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'SAPPER' AND dataset_source = 'respec';

-- SCIENTIST
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["GRIT","RESEARCH","INVENT","TINK"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["VALFACT","CAREPLAN","INVENT","REVEG"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["SME","RESEARCHIMP","SYNTH","GRIT"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["TECBAB","RESEARCH","INTENSFOC","REVENGIMP"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["STRGEN","EURE","DEDI","DANGDEV"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'SCIENTIST' AND dataset_source = 'respec';

-- SCOUND
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["RAPREA","OPP","FRLOW","CONV"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["QUICKDR","SWI","MAODL","BLATHER"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":2,"cost":15,"talents":["DODGE","TALKTALK","FRLOW","GRIT"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["TOUGH","OPP","BOCOAN","CONV"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["DODGEIMP","SOFTSP","DUBX","DEDI"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'SCOUND' AND dataset_source = 'respec';

-- SCOUT
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["SWIFT","KEENEYED","OUTDOOR","GATHERER"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["ALLTERDRIV","GRIT","READWIND","NATUREME"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["BOLSTER","ALWAPREP","REAWINIMP","TOUGH"],"directions":[{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["BOLSTIMP","ONLOOK","KEENEYED","LANDPROV"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":4,"cost":25,"talents":["CLEVERSOLN","REAWINSUP","KEEEYEIMP","DEDI"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'SCOUT' AND dataset_source = 'respec';

-- SHIPWRIGHT
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["DOCKEXP","SOLREP","CREATDES","CREATDES"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":5,"talents":["SOLREP","DOCKEXP","CREATDES","GRIT"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["KNOWSCH","EYEDET","SMARTHAND","DEPSHOT"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["HIDFEA","PUSHSPEC","FINETUN","CREATDES"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["DEDI","MASTART","OVBATT","EXHPORT"],"directions":[{"up":false,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'SHIPWRIGHT' AND dataset_source = 'respec';

-- SKIPTRACER
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["GRIT","STRSMART","LEVER","STRSMART"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["BYP","TOUGH","STRSMART","INFORM"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["STAKEOUT","EXTRACK","STRSMARTIMP","GRIT"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["RELENTLESS","DIRTTRIC","NOBFOOL","BOUGHT"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["STAKEIMP","SOFTSP","DEDI","ULTIMATUM"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'SKIPTRACER' AND dataset_source = 'respec';

-- SLICER
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["BYP","COD","STALK","GRIT"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["GRIT","GRIT","DEFSLI","LOGIBOMB"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["COD","BYP","DEFSLIIMP","MASSLIC"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["GHOSMACH","BYPSECIMP","DELARESP","FORCEXPL"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["SHADSECR","SKILLSLIC","DEDI","STRGEN"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'SLICER' AND dataset_source = 'respec';

-- SURV
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["OUTDOOR","EXTRACK","NATUCAMO","GATHERER"],"directions":[{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["TOUGH","GRIT","EXPTRAIMP","SWIFT"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":false,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":2,"cost":15,"talents":["BLO","KNOWPREY","NOISSAFE","OUTDOOR"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":3,"cost":20,"talents":["TOUGH","BLOIMP","EXTRACK","LANDPROV"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":false,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false}]},{"index":4,"cost":25,"talents":["HEROICRES","SOFTSP","DEDI","NOSAFIMP"],"directions":[{"up":true,"down":false,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'SURV' AND dataset_source = 'respec';

-- THIEF
UPDATE ref_specializations SET talent_tree = '{"rows":[{"index":0,"cost":5,"talents":["STALK","STRSMART","BYP","GRIT"],"directions":[{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false},{"up":false,"down":false,"left":false,"right":false},{"up":false,"down":true,"left":false,"right":false}]},{"index":1,"cost":10,"talents":["GRIT","HANDOFF","DODGE","GRIT"],"directions":[{"up":false,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":true,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":2,"cost":15,"talents":["STALK","DIRTTRIC","CONV","BYP"],"directions":[{"up":true,"down":true,"left":false,"right":true},{"up":false,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":true},{"up":true,"down":true,"left":true,"right":false}]},{"index":3,"cost":20,"talents":["MASSHAD","DODGE","DECOY","BYPSECIMP"],"directions":[{"up":true,"down":true,"left":false,"right":false},{"up":true,"down":true,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":false},{"up":true,"down":true,"left":false,"right":false}]},{"index":4,"cost":25,"talents":["FADEAWAY","DEDI","EXITSTRA","STAKEOUT"],"directions":[{"up":true,"down":false,"left":false,"right":true},{"up":true,"down":false,"left":true,"right":true},{"up":false,"down":false,"left":true,"right":true},{"up":true,"down":false,"left":true,"right":false}]}]}'::jsonb WHERE key = 'THIEF' AND dataset_source = 'respec';
