-- 011_seed_duty_obligation_types.sql
-- Replace placeholder seed data in ref_duty_types and ref_obligation_types
-- with the full OggDude dataset.

TRUNCATE ref_duty_types, ref_obligation_types;

-- ── Duty types (OggDude DataCustom/Duty.xml) ─────────────────────────────────

INSERT INTO ref_duty_types (key, name, description) VALUES
('AIRSUP', 'Air Superiority', $$[H4]Air Superiority[h4]
The Player Character knows that keeping the skies clear of enemies is often a deciding factor in achieving victory. PCs that pilot starfighters and airspeeders, operate ground-based anti-air emplacements, or even hold the reigns of a flying beast are all dedicated to providing close air support and top cover for ground forces, and denying the enemy the same advantage.$$),

('ANTIISB', 'Anti-ISB Efforts', $$[H4]Anti-ISB Efforts[h4]
The Empire has a vast information network headed by the Imperial Security Bureau, or ISB. Characters with this Duty focus their efforts on undermining this network with actions that specifically target the ISB, such as feeding false information to its known moles, recovering captured prisoners from ISB detention calls, developing profiles of ISB agents, and ensuring that the hated agency spends its resources chasing dead-end leads.$$),

('CAMAR', 'Camaraderie', $$[H4]Camaraderie[h4]
Each fighting unit is a family of sorts, and this is equally true within the ranks of the Alliance military. These
Commanders seek to bring the troops together in a way that fosters trust, respect, and pride. By fostering the bonds that
develop between comrades in combat, Commanders are able to strengthen morale and drive their people to fight harder
and better than other, similar units. Unfortunately, camaraderie can have unfortunate results—alienation from fellow units,
instances of hazing and initiation within the ranks, and overconfidence in the face of overwhelming odds.$$),

('CHEMBIO', 'Chemical/Biological Analysis', $$[H4]Chemical/Biological Analysis[h4]
The Player Character identifies environmental problems from sources either biological (alien flora and fauna, viruses, bacteria) or chemical (toxic gases, poisons, heavy metals in the soil), The Engineer understands that environments can damage delicate machinery, make it seize up, or cause it to perform under spec. The environment can also affect the construction and destruction of structures, and harm or hinder soldiers who have to march through the terrain.$$),

('CIVOUT', 'Civilian Outreach', $$[H4]Civilian Outreach[h4]
The PC believes that the Alliance fights for the civilians. That includes spearheading urban repair as well as communicating with the local population to coordinate and establish supply agreements and recruit new trainee mechanics. The Engineer's work doesn't change, merely the focus. Sometimes, Engineers integrate themselves with the civilian populace to provide technological resources, work with them in resisting the Empire, or prevent civilians from receiving retribution due to Alliance actions.$$),

('CLEARSKIES', 'Clear Skies', $$[H4]Clear Skies[h4]
The PC recognizes the danger that infantry units face from enemy air power. A pair of TIE fighters can turn certain victory on the ground into disaster. This PC always has a plan to take out any enemy air support, whether through the judicious use of portable launchers, jammers, camouflage, concealing terrain, or even anti-air emplacement weapons.$$),

('COMBATVICTORY', 'Combat Victory', $$[H4]Combat Victory[h4]
The Player Character is driven to show that the Alliance can hold its own against Imperial forces in any troop vs. troop engagement. He wants to engage the Empire's military—their best, whenever possible—and provide more victories for the Alliance to tout to the galaxy as proof it can ultimately win the war. This means daring raids, excellent tactics, and acquiring the best firepower possible.$$),

('COMM', 'Communications', $$[H4]Communications[h4]
Player Characters with this Duty understand that the Empire maintains its stranglehold on the galaxy via a strong communications network. Whether working locally or across the galaxy, they specialize in deciphering Imperial communications as well as encrypting and concealing Rebel transmissions. Often these PCs are on the forefront of innovative communication methods, such as using special patterns on fabrics to alert agents of enemy activities of inserting code into Imperial broadcasts to pass secret messages to sleeper agents.$$),

('COMMFAC', 'Communication Facilitation', $$[H4]Communication Facilitation[h4]
The Rebel Alliance is a scattered, often inconsistent organization. Alliance Command occasionally gathers the fleet for big, critical strikes, but usually individual Rebel cells work independently. The PC acts as an intermediary between leadership and other Rebel cells, ensuring that his group is coordinated with others, preventing accidental collisions.$$),

('COUNTERINTELLIGENCE', 'Counter Intelligence', $$[H4]Counter Intelligence[h4]
The PC knows that the survival of the Alliance depends upon its ability to hide from the Empire and avoid complete destruction at the hands of its overwhelming military superiority. To this end, he wants to hunt down and eliminate enemy agents and threats, feed false information to Imperial intelligence networks, and cover the movements of all Alliance assets from observation and reporting.$$),

('COUNTERMEAS', 'Countermeasures', $$[H4]Countermeasures[h4]
Characters with this Duty serve as cryptographers, secure communications specialists, and data manipulators. Whether spreading false transmissions across subspace or the HoloNet, crafting new electronic protection to keep Rebel data secure, or slicing into Imperial transmissions and data vaults, they are phantoms in the code, capable of weaving digital misdirection while ensuring Rebel electronics remain secure.$$),

('DISREL', 'Disaster Relief', $$[H4]Disaster Relief[h4]
While similar to Civilian Outreach, Disaster Relief involves procuring and delivering medical supplies, food, water, and temporary shelters after natural or artificial disasters. This PC destroys fallen buildings to clear areas for traffic and repairs buildings to provide safe places to congregate. Ground vehicles, ships, and droids need to be repaired or repurposed to handle rubble and tight urban environments. These Engineers try to help get civilians' live back to normal.$$),

('DOUBLEAGENT', 'Double Agent Recruitment', $$[H4]Double Agent Recruitment[h4]
PCs selecting this Duty focus on turning Imperial personnel—especially its spies—into Rebellion assets. By playing on the sentiments of those who remain idealistic about the betterment of the galaxy, they gain valuable insight from individuals in positions of trust within the Empire. When that fails, tactics such as blackmail, extortion, and other coercive efforts may be necessary in these desperate times.$$),

('DROIDRETASK', 'Droid Retasking', $$[H4]Droid Retasking[h4]
While the Empire seems to have an infinite number of organic beings in its service, droids also play a critical role in almost all Imperial operations. PCs with this Duty focus their efforts on disabling and reprogramming these droids to gather intelligence or even setting them against their Imperial masters. By attacking this vulnerable and often-overlooked Imperial resource, such PCs provide vital aid to the Rebel Alliance.$$),

('ENEMYDEMOR', 'Enemy Demoralization', $$[H4]Enemy Demoralization[h4]
Undermining enemies' psychological ability to wage war is just as important as defeating them in
battle. Commanders realize this, and do their best to ensure that the Empire suffers every defeat on a psychological level.
By fostering a unit's notoriety, a Commanders can ensure that that its reputation precedes it among the enemy, thereby
weakening the enemy's resolve before a fight even begins. Once a battle is won, a Commander must ensure that the enemy
knows it's been soundly beaten, though the Commander must take care not to resort to the Empire's brand of brutality.$$),

('ENVMANIP', 'Environmental Manipulation', $$[H4]Environmental Manipulation[h4]
These PCs use their skills to alter the environment to clear the way or obstruct passage. This includes constructing and destroying bridges, burrowing around natural and artificial obstructions, and improving or impeding movement. These Engineers also manipulate the environment of outer space, exciting the ions in a nebula to provide sensor cover or harnessing the electromagnetic core of an asteroid to protect a fleet from a solar flare.$$),

('FIELDTRAIN', 'Field Training', $$[H4]Field Training[h4]
The PC trains new Engineers and rank-and-file soldiers to use new and old specialty equipment. Some bases schedule classes and provide classroom space so that Engineers can become full-time instructors. Most Alliance outposts don't have these luxuries, however, so Engineers teach by training in the field. Field training includes teaching civilians with potential, either to assist their own communities or to serve as contracted help for the Alliance.$$),

('GROUNDSUP', 'Ground Superiority', $$[H4]Ground Superiority[h4]
No matter how good air support might be, battles are eventually decided on the ground. This PC knows that taking out enemy infantry and armor in combat from turrets, armored walkers and speeders, mechanized cavalry, and even traditional, mounted cavalry is what holds the line and wins the day. This PC is always on the lookout for key enemy ground assets to disable and destroy.$$),

('INSECURITY', 'Internal Security (Cyphers and Masks)', $$[H4]Internal Security[h4]
Deceivers know their own kind. PCs with this Duty focus on protecting the Alliance from moles, double agents, and traitors. They also help maintain safety by ensuring that strongholds, outposts, and safe houses remain undetected by the Empire. This sometimes includes ensuring that supply lines for these locations are maintained and kept secret.$$),

('INTELLIGENCE', 'Intelligence', $$[H4]Intelligence[h4]
The PC knows that every victory hinges on knowing as much about the Empire's military might and other assets as possible. He is driven to gather any and all potentially useful data, wishing to locate vital and vulnerable targets for Rebellion forces to strike at. He not only wants to know what the Imperial military factions are up to, but also the state of technological research, economic policies, and other aspects of Imperial strength.$$),

('INTERNALSECURITY', 'Internal Security', $$[H4]Internal Security[h4]
The most dangerous threat to the Alliance comes from within its own ranks. Any Rebel soldier, operative, or ally could be an insidious threat waiting to take an action at a critical moment to bring entire operations crashing down, costing lives and assets. Knowing that vigilance against these threats is the truest form of devotion to the cause of the Alliance, the PC watches for any and all signs of betrayal.$$),

('INTERORESIST', 'Interrogation Resistance', $$[H4]Interrogation Resistance[h4]
Even the most skilled Rebel agent can be captured and subjected to Imperial interrogation. PCs with this Duty specialize in ensuring that they and their fellow Rebels have the physical and mental fortitude to endure interrogation. They also work to ensure that information critical to the Alliance is compartmentalized and secure, so that agents who are unable to resist Imperial questioning don't compromise the entire Rebellion.$$),

('LEGENDCRAFT', 'Legend Crafting', $$[H4]Legend Crafting[h4]
PCs selecting this Duty work to create fictitious histories and evidence to back up an infiltrating Spy's cover identity. Known as legends, these false histories help Spies assume a cover identity that becomes a fully realized person and can be easily presented to others. These efforts usually also include planting falsified information or doctored holos into Imperial databases, so that anyone researching the Spy's cover identity will find a host of data that corroborates the legend, enough to pass rigorous examination.$$),

('LOSSPREV', 'Loss Prevention', $$[H4]Loss Prevention[h4]
Ensuring that their troops are as safe as possible under battlefield conditions is these Commanders'
primary concern. They never send their troops into hopeless situations in which defeat is certain, preferring instead to
preserve their unit's strength for meaningful battles if sacrifices must be made. If taken too far, this ideology can result
in weak commanding officers who lose ground because they aren't even willing to try. They may gain a reputation for
cowardice, which harms both discipline and their own chances for advancement.$$),

('MORALE', 'Morale', $$[H4]Morale[h4]
While the troops of the Rebel Alliance know their cause to be just, the hopeless odds stacked against them can be demoralizing. This PC knows that to have any hope of victory, the freedom fighters have to keep their spirits up, and works to help with this via well-timed jokes or inspirational gestures such as flying the Rebellion's insignia on the battlefield.$$),

('MUNITIONS', 'Munitions', $$[H4]Munitions[h4]
This includes the maintenance and use of ammunition and weapons that should detonate at the appropriate time, or at least shouldn't do so while within the soldier's gun or vehicle. Work with munitions also includes placing minefields, disarming explosives. and setting explosives to destroy environmental obstacles or enemy fortifications. Those who work with vehicles, starships, or droids often modify the machines to handle and use specialized munitions.$$),

('OPPLAN', 'Operation Planning', $$[H4]Operation Planning[h4]
Efficient use of resources is a key to the success of the Rebel Alliance. Rebel strikes must be carefully organized to be as effective as possible, while consuming minimal supplies. The Rebellion can tolerate few losses. The PC recognizes this and takes it upon himself to ensure that each mission is engineered for success, with nothing forgotten or wasted.$$),

('PERSONNEL', 'Personnel', $$[H4]Personnel[h4]
More than machines, credits, or information, the people of the Alliance are the most important and vital assets there are, and the Player Character knows this. He is devoted to seeing to their safety, well-being, and capacity for success. No one should ever be left behind; the most successful missions might not achieve every goal, but they are successful nonetheless when no one dies.$$),

('PLACHUNT', 'Placard Hunter', $$[H4]Placard Hunter[h4]
This PC seeks out the most skilled and famous Imperials on the battlefield, and takes them out head on. These duels are often recorded and released on shadowfeeds as a part of Rebel propaganda efforts to showcase how vulnerable the Empire is to Rebel assaults. Whether the PC sees this Duty as a means of testing himself or a way to help larger Rebel efforts, he is likely to be seen abandoning his mission objectives if a tempting enough target is fleeing the scene.$$),

('POLITICALSUPPORT', 'Political Support', $$[H4]Political Support[h4]
Every blaster, starfighter, and thermal detonator in the galaxy is useless without the political will to truly challenge and overthrow Palpatine and his New Order. The Player Character understands this all too well and is determined to see to it that as many factions, systems, and sectors as possible come to the side—and the aid of— the Alliance against the Empire.$$),

('PSYCHOWAR', 'Psychological Warfare (Cyphers and Masks)', $$[H4]Psychological Warfare[h4]
Fear is not only the purview of the Empire. PCs with this Duty attempt to spread fear among enemy forces in an effort to weaken morale and destroy the discipline that is the hallmark of the Imperial Army and Navy. They also regularly combat Imperial propaganda and look within the ranks of the Empire itself for personnel who might easily be swayed into joining the Rebellion.$$),

('PSYCHWAR', 'Psychological Warfare', $$[H4]Psychological Warfare[h4]
While Imperial stormtroopers might appear fearless and disciplined, others within the Imperial Army and Officer Corps aren't as willing to die for the Emperor. Some PCs recognize that it is possible to intimidate, confuse, or frighten an enemy to gain an advantage in an engagement, or avoid one altogether.$$),

('RANDD', 'Research and Development', $$[H4]Research and Development[h4]
Engineers also partake in research and development for technologies and other applied solutions. Necessity is the parent of invention, and every situation, enemy, and environment creates new necessities. Research can include stealing technology from the enemy or finding it in a ruin. These characters set aside time and resources to keep their base evolving, growing, and learning; that knowledge can also be passed on to other Engineers at other bases.$$),

('REBELBASE', 'Rebel Base', $$[H4]Rebel Base[h4]
[P]If a campaign is centered around a Rebel Base, then, at the GM's discretion, one or more of the characters may choose to have a Rebel Base be his Duty. This Duty behaves much like any other, and the CM can use the following as guidance for how to reflect it in the story. If multiple characters choose to have this be their Duty (or one of them, anyway), the CM should consider condensing it into a group Duty. A group Duty is tracked cumulatively. Whenever a group Duty triggers, it counts as triggering for all characters who share in it.
Generally, when one or more characters' Rebel Base Duty triggers, the narrative events should relate to that facility and its inhabitants. [P]At times, this could be relatively mundane. The bonus to the PCs' wound thresholds might come from the base staff recognizing their hard work or even doing something special to make the team more at home. Alternatively, when it triggers, it might mean that the story focuses on the base itself in some way. Perhaps the base comes under attack, for instance, and the PCs' increased wound thresholds represent their desire to protect their home. Much like any other Duty, a Rebel Base Duty provides the CM with plenty of narrative hooks.
[P]Alternatively or in addition to any narrative ramifications, the GM can use the Rebel Base Duty triggering to offer the PCs chances to upgrade their stronghold. If the PCs are at the base, this could mean that an opportunity comes to them. Perhaps a smuggler reaches the base, offering to trade various important supplies for protection from bounty hunters, or a group of fresh recruits arrives and the PCs must train them to work as support staff and soldiers on the base. If this Duty triggers while the PCs are off-base, it might mean that they run across a unique chance to improve the base, recruit a new staff member, or get much-needed supplies. At the GM's discretion, when the Rebel base Duty triggers, the GM can offer the PCs an opportunity to acquire one of the base upgrades found on pages 88-89 without paying the normal price in credits for it.$$),

('RECRUITING', 'Recruiting', $$[H4]Recruiting[h4]
Every engagement with the Empire is a war of attrition, and that is a war the Rebellion simply cannot win. Nonetheless, more people must be found to serve, and they are needed in every capacity. Not only does the Alliance military need more soldiers and pilots, it needs more technicians, engineers, mechanics, scientists, doctors, slicers. and just about every other kind of worker. This Player Character understands the risks of recruitment, as well as the needs, and is constantly on the lookout for allies who are both talented and trustworthy.$$),

('RESCUEREC', 'Rescue and Recovery/Evac', $$[H4]Rescue and Recovery/Evac[h4]
This PC prepares and plans the logistics and execution of rescue operations of both civilians and military personnel. While similar to the Transportation Duty, this work includes defense training, medical support, survival training, observation, and rapid deployment operations. These Engineers live and die by their comms; they need to communicate exactly where they and their personnel are and where they need to be at a moment's notice.$$),

('RESOURCEACQ', 'Resource Acquisition (Cyphers and Masks)', $$[H4]Resource Acquisition[h4]
Blasters and bacta are important for survival, but Spies with this Duty endeavor to acquire other resources to aid the Alliance. These include enemy uniforms, Imperial credentials, and other tools of deception. Spies with this Duty are certainly glad to acquire medical supplies, weapons, and other necessities, but their skill set allows them to obtain equipment more suited to subtle missions.$$),

('RESOURCEACQUISITION', 'Resource Acquisition', $$[H4]Resource Acquisition[h4]
There are never enough supplies to fully support those fighting against the juggernaut that is the Empire, and this PC knows it very well. He is determined to seek out new sources of raw materials, food, clothing, weapons, armor, and equipment of all kinds. One spare crate of medpacs can save quite a few lives, and a handful of comlinks can mean the difference between success and failure on a mission. He will trade, beg, borrow, and steal anything for the cause.$$),

('SABOTAGE', 'Sabotage', $$[H4]Sabotage[h4]
The largest and most powerful military force in the history of the galaxy is also the most vulnerable to acts of destruction and asset denial. The character is focused on disrupting Imperial operations in any way possible, whether it's the manufacture of weapons, troop movements, supply shipments, banking systems, or any other key operation, in order to make the Empire act more slowly and less capably. Truly showy acts of destruction also work to erode a population's will to support the Empire, or so the PC often believes (though the Alliance expressly forbids actual acts of terrorism).$$),

('SIEGEENG', 'Siege Engineering', $$[H4]Siege Engineering[h4]
Engineers often set up and build defensive fortifications (bunkers, trenches, and walls) , artillery (gun towers, and weapon reinforcements), and orbital defense platforms (ground attack satellites, anti-ship satellites, and orbital flak). Natural formations such as caves, ancient temples, canyons, and even asteroid fields can form the basis of an outpost. This PC emphasizes the importance of this kind of constructive support in warfare.$$),

('SPACESUPERIORITY', 'Space Superiority', $$[H4]Space Superiority[h4]
As the Combat Victory-driven PC feels about troop conflicts, so this Player Character feels about ship-to-ship combat and naval engagements. To him, the war will ultimately be decided in the stars, and what the Alliance lacks in sheer numbers, it more than makes up for in the quality and tenacity of its pilots. Every single space battle is an opportunity to show the rest of the galaxy that the Alliance not only can win the war, but is destined to do so.$$),

('SUPPORT', 'Support', $$[H4]Support[h4]
Individually, the lone agents of the Alliance don't stand a chance against the combined might of the Galactic Empire. Only by working together can they hope to achieve a victory in this civil war. This PC is devoted to helping fellow Rebels fulfill their Duties by providing whatever assistance they need. Although he might not get the same amount of reward or recognition as the people he is helping, the PC has many more opportunities than his fellows to fulfill his Duty to the Rebellion.$$),

('SURVEYENEMY', 'Surveying the Enemy', $$[H4]Surveying the Enemy[h4]
This PC focuses on the technical aspects of scouting. the gathering of geographical knowledge, and the mapping of data via the use of sensors, drones, droids, and satellites. This includes constructing physical and electronic camouflage to hide a Rebel base and any vehicle movements from Empire scouts. More destructive methods include eliminating similar enemy systems with electromagnetic devices, damaging probes or satellites, and providing snipers and anti-aircraft ordnance data useful in targeting enemy units.$$),

('TACTINSIGHT', 'Tactical Insight', $$[H4]Tactical Insight[h4]
Wars are sometimes won before a battle is ever fought. These PCs specialize in gathering information on Imperial military tactics and using these secrets to exploit weaknesses in the Empire's deployment plans and combat strategies. They also attempt to undermine Imperial tactics by planting false intelligence in Imperial battlefield reports or allowing fabricated reports on Rebel troop movements to "fall into enemy hands."$$),

('TECHPROCUREMENT', 'Tech Procurement', $$[H4]Tech Procurement[h4]
There is no more prolific or productive time for technological developments than during a war, and this one is no exception. This Player Character sees the true opportunity for Alliance victory in the hands of scientists, engineers, and technicians. Not only can they get the most performance from existing machines and resources, but they can design and develop new ships, weapons, medical techniques, and equipment that can provide the vital edge necessary to survive against the Empire's might. The way this PC sees it, stealing the best developments of the Empire is a crucial way to even the odds.$$),

('TECHSUPERIORITY', 'Tech Superiority', $$[H4]Tech Superiority[h4]
As a stick jockey, this PC knows that while having the best-trained crew is the most important thing, having that crew on the best combat platforms is a very close second. If not for Rebels focused on maintaining tech superiority, the Alliance never would have acquired X-wings, or created the A-wing or B-wing starfighters. These PCs are always looking to bring new designs, schematics, and the engineers that create them back to base.$$),

('TESTING', 'Testing', $$[H4]Testing[h4]
The Alliance often must procure new supplies and technologies from less-than-reputable sources. This PC tests first and tests often. The moment an Engineer neglects safety checks, devices become a dangerous uncertainty. Stolen Imperial technology also carries the risk of sabotage. This PC tests researched technologies and methodologies in controlled labs, during live-fire exercises, and in the middle of battle.$$),

('TRANSPORT', 'Transportation', $$[H4]Transportation[h4]
This PC takes on the responsibility of establishing protected routes to and from a base and the front lines. The Alliance uses a wide variety of transports, ranging from swift airspeeders, agile corvettes, and blocky freighters to slow, wheeled haulers and even pack animals. The character might also recruit private or public civilian transportation organizations. While an army marches on its stomach, this PC would rather it rode instead.$$),

('WETWORK', 'Wetwork', $$[H4]Wetwork[h4]
PCs with this Duty know that sometimes questionable, if not downright immoral, acts must be committed in the name of the greater good. The quiet death of a single key individual, after all, can save many lives or keep important secrets buried for good. They're willing to do the unthinkable for the cause, and eliminate or assassinate critical Imperial personnel to prevent or undo a greater evil.$$);

-- ── Obligation types (OggDude DataCustom/Obligations.xml) ────────────────────

INSERT INTO ref_obligation_types (key, name, description) VALUES
('ADD', 'Addiction', $$[H4]Addiction[h4]
The character has a strong addiction he must keep feeding. Whether it's a physical addiction to stims, dust, or alcohol, or a mental addiction such as gambling, law-breaking, or priceless antiques, the character devotes a lot of time, energy, and resources to pursuing or obtaining the object of his addiction. Avoiding this Obligation has an almost immediate result - withdrawal. The exact nature depends on the addiction, but the character finds it increasingly difficult to concentrate on even mundane tasks, often reflected in the GM adding anywhere from [SE] to [SE][SE][SE] to skill checks.$$),

('ADRENALINE', 'Adrenaline Rush', $$[H4]Adrenaline Rush[h4]
The character is addicted to the rush of adrenaline he gets from battle. It was this character flaw that cost him his position at the upper levels of society. Now he must feed the addiction or the results turn ugly indeed. The character cannot back down from a fight of any kind, and often goes in search of conflict when things get too tame for his tastes. Should the character go an entire session without combat of some kind, the GM may add a penalty of [SE] to any skill checks in the next session (or until the character gets a chance to fight).$$),

('ANTAG', 'Antagonist', $$[H4]Antagonist[h4]
Not all Smugglers are Charmers, and given the contacts a Smuggler makes in his line of work, it's easy for him to insult the wrong person, group, or even species. This doesn't always lead to Bounty, however, since not everyone can afford the credits required for an official bounty. In these cases, the Smuggler just lives with the knowledge that certain parties in the galaxy would make his life very difficult if given the chance.$$),

('BADREP', 'Bad Reputation', $$[H4]Bad Reputation[h4]
Whether deserved or not, some Smugglers find themselves with a reputation for being untrustworthy or difficult to deal with. This can make finding jobs a struggle. Since the best way to reduce this Obligation is to successfully complete contracts, proving himself reliable again, the Smuggler might find himself having to take the least desirable jobs for a while. Once he's repaired his reputation, he will be able to pick and choose again.$$),

('BASE', 'Base of Operation', $$[H4]Base of Operation[h4]
  [B]Group Obligation:[b] When the base of operations Obligation triggers, the narrative events should relate to the base of operations. This could be
as simple as unexpected bills or an afternoon of repairing moisture vaporators on the South Ridge. Alternatively, it could involve a rampaging gundark breaking into the pastureland or a rival mining baron deciding to execute a hostile takeover of the PCs' land. The GM is free to make the narrative effects of the Obligation triggering minimally invasive, if it would distract from an important ongoing plot line, or an unexpected and major issue for the PCs to deal with immediately and personally.$$),

('BET', 'Betrayal', $$[H4]Betrayal[h4]
This Obligation can work in one of two ways: either the character is the target of a deep and personal betrayal, or the character is the one who betrayed others. Whether it's as simple as a betrayed confidence or broken promise or as serious as treason or mutiny, the betrayal eats away at the character and affects his everyday life. The target of the betrayal may seek answers, compensation, or simply revenge.$$),

('BLA', 'Blackmail', $$[H4]Blackmail[h4]
Someone has discovered one of the PC's dirty secrets and is using that knowledge for some sort of gain. To make matters worse, the blackmailer possesses evidence that could possibly leak out - a holovid, bank records, a weapon used during a crime, and so on. In order to keep the secret safe, the character must do what he is told, although the blackmailer is savvy enough to keep the demand simple enough to maintain the blackmail for as long as possible, generally demanding money or favors.$$),

('BOU', 'Bounty', $$[H4]Bounty[h4]
For some reason, the character has a price on his head. This may be in the form of a legal warrant or contract by criminals, collection agencies, or even someone who felt his honor violated in some way. What he did to earn this mark is up to his background, and the severity of his actions can be based on the size of his Obligation.$$),

('COLLATERAL', 'Collateral Accountability', $$[H4]Collateral Accountability[h4]
In the pursuit of a past contract, the character was careless. He accidentally destroyed the prized possession of some major underground figure or killed someone important to that person. Now the figure holds it over the character's head. Ambiguous threats and demands for repayment have become near-constants in this character's life, as the underground figure refuses to let him forget his responsibility. He has a financial blood price or other compensation he could pay, but it is astronomical. Until it is paid off, however, the guilt and fear are ever-present. If this Obligation is triggered, the character can suffer [SE] to some or all skill checks during the session (at the GM's discretion) due to this burden on his nerves.$$),

('CONTRACT', 'Contract', $$[H4]Contract[h4]
The PC has a pressing contract to fulfill, whether it is legally binding or an informal deal. The contract may be for providing, installing or repairing technical items, or on call services. Fulfilling terms of the contract reduces the character's obligation, while putting them off or incurring expenses for the sake of fulfilling the contract might increase it.$$),

('CONTRACTED', 'Contracted', $$[H4]Contracted[h4]
The Colonist has entered into a long-term contract with a corporation or government related to his work at a colony. In many cases, these contracts are how colonists pay their passage to the new world - a form of indentured servitude. Colonists might be contracted to provide bookkeeping, labor, or any other number of services. Failure to live up to a contract can result in financial penalties, imprisonment, deportation, or earning a bounty.$$),

('CREW', 'Crew', $$[H4]Crew[h4]
The PC has an Obligation to keep a work crew or ship's complement safe, healthy and in work. Whether or not the PC usually travels with the work crew, this character serves as a mediator between the crew and outside individuals. The PC might owe the debt due from a time the crew saved the PC's career or even life through hard work and sacrifice.$$),

('CRI', 'Criminal', $$[H4]Criminal[h4]
The character has a criminal record, or was accused of a crime (perhaps one he didn't even commit), and is somehow embroiled in the legal system. Obligation may be settled by paying ongoing legal costs, making attempts to bury evidence, or efforts to prove his innocence.$$),

('DEBT', 'Debt', $$[H4]Debt[h4]
 The character owes someone a great deal, whether that debt consists of money or something else. Perhaps the PC has a huge gambling debt to a Hutt, is indebted to the Czerka Corporation for his starship, owes a wealthy family for patronage, or has some other serious financial obligation. To make matters worse, depending on who owns the debt, even fully paying it off might not get the character completely off the hook - if the character can get that money, he can surely get more.$$),

('DISGRACED', 'Disgraced', $$[H4]Disgraced[h4]
The Colonist did something shameful, often some social taboo that isn't quite illegal. The shame and sideways glances from peers have forced the Colonist to seek a new life where he can start over free of embarrassment. The isolation of some colonies and cultures makes for some strange taboos not observed by the rest of the galaxy. Thus the taboo can be something terrible, or something as benign as drinking from a public fountain or showing a bare but innocuous body part.$$),

('DUT', 'Dutybound', $$[H4]Dutybound:[h4]
The PC has a deep sense of duty that he feels compelled to fulfill, such as military service, making good on a contract, or following some sort of thieves' code. Unlike the Oath Obligation (see below), a Dutybound character has some legal or ritualistic bind to an organization or cause making it extremely difficult or detrimental if he fails to live up to that commitment.$$),

('EXILED', 'Exiled', $$[H4]Exiled[h4]
Going up against politically connected members of the Galactic Empire is a good way to become exiled from the most civilized of the Core Worlds. The Colonist is not allowed to set foot in the Core, or any Imperial-controlled worlds, but is desperate to remove the stain on his reputation. While possible, the smallest misstep can be disastrous, setting progress back months or even years. There is also the trouble of bureaucracy and last minute deadlines that can draw the character away.$$),

('FAILEDREP', 'Failed Installation/Repair', $$[H4]Failed Installation/Repair[h4]
A botched modification, installation, or repair job has publicly damaged the character's reputation and rendered the device, droid or vehicle inoperable. The PC must take action to restore the damaged item, and find a way to socially engineer a return to good standing in the public eye.$$),

('FAM', 'Family', $$[H4]Family[h4]
The character has deep ties with his family that require a great deal of time and attention. This could include providing care for or assistance to siblings or parents, the management of an inheritance, trust, or family business, or simply mediating between squabbling family members.$$),

('FAME', 'Fame', $$[H4]Fame[h4]
The character's reputation casts a long shadow. Perhaps the PC took a famous and difficult bounty, or owns a recognizable and deadly ship, or has beaten another well-known hunter to the punch in the past. Whatever the case, it is hard for the character to move unnoticed throughout the galaxy. This makes covert operations more difficult, but also means that informants are more likely to spill what they know when the PC arrives.$$),

('FAV', 'Favor', $$[H4]Favor[h4]
The PC owes a big favor. Perhaps officials looked the other way when he smuggled in goods, or a friend got him out of prison. Regardless, the favors are stacking up, and soon he's going to be asked to pay them back or return the favor. This favor may be called in a little at a time, prolonging the Obligation.$$),

('FERV', 'Fervor', $$[H4]Fervor[h4]
The character is possessed of a powerful drive to act based on religious or spiritual beliefs. As an Obligation, Fervor means that he cannot resist acting in accordance with his beliefs and teachings. He may even have those who support him in some way (thus explaining the resources he potentially attains due to the Obligation), further exhorting him to follow "the Way" they all revere. Consider the Archaeologist who seeks temples dedicated to a lost god or the Big-Game Hunter who truly believes that it his divine destiny to eradicate "monsters" throughout the galaxy.$$),

('FRONTIER', 'Frontier Justice', $$[H4]Frontier Justice[h4]
Life on the frontier is harsh, cruel, and unfair. Bandits and outlaws can get away with murder and more if the local sheriff is too weak to stop them. Some people are able to let that go and move past it. When the dead are loved ones, however, some can't just move on. The need to get even is so strong it dominates the Colonist's thoughts and dreams, causing him to obsess about the moment of exacted vengeance. The Colonist gladly betrays, abandons, or hurts anyone if it brings him closer to settling the score.$$),

('HIGHRISK', 'High Risk', $$[H4]High Risk[h4]
The Smuggler just can't help it, he has to take the most dangerous jobs and play for the highest stakes. He is a victim of his own pride, and his ego often lands him in trouble. This Smuggler has something to prove and, when challenged, he cannot help but take the opportunity to display his bravery, even if this puts himself and his party in harm's way.$$),

('KEEPERFAITH', 'Keeper of the Faith', $$[H4]Keeper of the Faith[h4]
Much to many other freelancers' amusement, this character has sworn to faithfully uphold both the spirit and the letter of some code of honor. The PC believes very strongly in these edicts and adheres to them with an almost religious fervor. The character never knowingly breaks any of the rules laid down in the code, and may turn on colleagues who do so.$$),

('NOTORIETY', 'Notoriety', $$[H4]Notoriety[h4]
If a Smuggler has Notoriety Obligation, then he will be unable to travel incognito, as his face or name may be recognized. This makes any jobs he takes on harder, if not impossible, to complete. This Obligation is only likely to apply in certain sectors, and the extent of its influence determines the size of the Obligation. The Smuggler's own behavior might have caused this, or another party may have maliciously spread information about him. If the latter, the Obligation could be reduced by tracking down the person responsible and stopping him. Of the former, the Smuggler may have to avoid the affected area long enough that the locals forget him, or he might significantly change his appearance or name to avoid recognition.$$),

('OATH', 'Oath', $$[H4]Oath[h4]
The character has sworn some sort of oath that dictates his thoughts and actions, shaping his moral view of the world. This could be an oath to a deity, a way of living (such as the Jedi Code), or a willingness to sacrifice for the betterment of some group or cause. Whatever the case, the Oath should be both serious and make life difficult in some ways for the character. It is a personal and deep undertaking, possibly without a truly obtainable end goal in sight. Characters who do not live up to this oath face an internal and moral struggle.$$),

('OBS', 'Obsession', $$[H4]Obsession[h4]
The PC has some unhealthy obsession that tends to interfere in his life, whether with a celebrity, a region, a political movement, a cultural icon, or some other facet of society or life. He must pursue this, possibly to the detriment of his health, finances, or well-being. A character with this Obligation tends to get along well with others that share his interest, but is looked at with pity, amusement, or even a bit of fear from others who don't understand.$$),

('PACIFIST', 'Pacifist', $$[H4]Pacifist[h4]
This Colonist abhors violence, either out of a sense of morality or cowardice. Witnessing a violent act can incense or fluster a character so much that he is unable to think straight or control his shaking hands, or simply disgust him to the point that he can't interact with his fellows. If this obligation triggers and the PC participates in a violent act, the GM may add [SE] to any skill checks he makes for the remainder of the session. (This may be avoided through good roleplaying on the player's part, such as having his character always try to talk his way out of a fight, and if he's forced to do battle, only use weapons that stun or incapacitate his opponents).$$),

('PHILAND', 'Philanderer', $$[H4]Philanderer[h4]
Colonies tend to be small places, and if a being gets around, word about it has a tendency to follow close behind. This Colonist has no shortage of scorned lovers still furious over his or her never committing. Former flames have a habit of showing up at the worst moment, or causing delays when the chrono is ticking. The worst is when two or more flings team up to make life miserable for a serial seducer, or when spouses find out and decide the Colonist is deserving of punishment. Nothing is off limits, as all is fair in love and war.$$),

('PRICENAME', 'The Price of a Name', $$[H4]The Price of a Name[h4]
The character claimed to be someone else, taking credit for his accomplishments in a past negotiation in the hopes of a higher payday. The wronged party, either the person impersonated or the hiring party, is now angry. This enemy might respond by chasing down the character, spreading news of the duplicity, or demanding restitution to his reputation or his credit account.$$),

('RESP', 'Responsibility', $$[H4]Responsibility[h4]
A character with the Responsibility Obligation feels a strong sense of accountability or relationship to a person, place, or thing (a responsibility to kin falls under Family Obligation described above). This could include a strong connection to a mentor, a strong desire to care for orphans in a given location, or taking on the needs of an under-represented minority.$$),

('RULEBREAKER', 'Rule Breaker', $$[H4]Rule Breaker[h4]
Either the character very publicly and flagrantly broke one of the rules laid down in the bounty hunter's code, or everyone wrongly believes she did. Whatever the case, this breach of the rules of the code affects the character's personal and professional life in a very real way. Contracts dry up, colleagues refuse to speak to or help the character, or the character is treated in a condescending or irritatingly sympathetic manner.$$),

('SCORE', 'A Score to Settle', $$[H4]A Score to Settle[h4]
The character has always been rough-and-tumble, but somewhere along the way someone wronged him, and he never forgets a debt, real or imagined This could be as simple as someone promising him backup who then disappeared or someone bad-mouthing him in front of a prospective client Now, the character is always looking for ways to even the score.$$),

('SERVITUDE', 'Servitude', $$[H4]Servitude[h4]
Although the Smuggler might act like he's his own boss, he is actually the property of another and must either hand over any earnings or evade his owner entirely. The Smuggler could deal with this Obligation by earning enough credits to buy his freedom, or he could kill or otherwise remove his master.$$),

('SPON', 'Sponsorship', $$[H4]Sponsorship[h4]
This represents a legitimate faction that has placed a great deal of resources in the hands of a character (or a team) for some established purpose. For many Explorers, it is the common Obligation they will incur. It could be a mercantile consortium that sponsors a Trader in order to open up trade with a new planet or civilization or an Imperial agency sponsoring a Scout to investigate a newly discovered star and its planets. Archaeologists are frequently sponsored by academies or other scholastically minded organizations for their expeditions, and Big-Game Hunters may well be sponsored by a conservation group to thin a particular population of beasts... or sponsored by less savory firms to completely eradicate a particular life-form.$$),

('THRILLSEEK', 'Thrill Seeker', $$[H4]Thrill Seeker[h4]
Some people are addicted to alcohol or chems, others to gambling or other seedy vices. This character, however, is a confirmed adrenaline junkie, and chooses bounties not by their challenge or price, but by how exciting or dangerous they are. Avoiding the Obligation—perhaps by being a responsible business operator and considering every job's cost benefit analysis—results in an almost immediate case of excitement withdrawal. when inactive, the character is edgy, moody, easily distracted, and generally unpleasant to be around.$$),

('UNDERCONTRACT', 'Under Contract', $$[H4]Under Contract[h4]
The Smuggler is under contract to obtain rare goods, transport volatile cargo, or provide difficult services. He can only put this off for so long. This Obligation is similar to Debt, but it allows the player and the GM a wider range of possibilities when determining the nature of the contract.$$),

('UNFINBUS', 'Unfinished Business', $$[H4]Unfinished Business[h4]
The PC is working on a long-term project such as a complex computer program or a light freighter refit. It may be personal or commissioned work. While long breaks may be acceptable, the Obligation cannot be totally fulfilled until the unfinished business is complete and it weighs heavily on the PC's mind whenever the character chooses to postpone working on it for any reason.$$),

('VIGILANTE', 'Vigilante', $$[H4]Vigilante[h4]
The character has seen the wheels of justice grind up the innocent and let the guilty walk free. The character has sworn to take the law—or a version of it, at any rate—and bring  justice to those who deserve it. When taking on contracts, this character tends to pursue the most hardened criminals.$$),

('WITNESS', 'Witness Protection', $$[H4]Witness Protection[h4]
Some Colonists never would have chosen life on a distant backwater, but authorities have deemed it necessary to hide them in the witness protection program. The Colonist is being hunted by the Hutt Cartels, Black Sun, the Tenloss Syndicate, or some other galactic-scale criminal organization as a material witness. The Colonist was given a new identity and sent to an obscure planet to safely await trial, but the syndicate won't stop looking for him.$$);
