-- 141: reSpec specialization descriptions.
-- update-respec-snapshot.ts took description from the plain (OggDude stub) file even when a
-- reSpecialized override existed, so ~62 specs showed "Please see page N of the ...".
-- Only rows still holding the stub are touched. Description-only; talent trees, career skills and flags are untouched.

UPDATE ref_specializations SET description = '[H4]Advisor[h4]
Not everyone who is skilled in the ways of the Force seeks to hold a position Of tremendous authority. In fact, some believe they would find it too easy to abuse their unique abilities if they placed themselves in a position of leadership. Instead, they choose to accept the Advisor''s role to ensure they cannot be corrupted by the lure of power. Others feel their advice too valuable to limit to one planet or region and wander the stars, sowing the guidance of the Force wherever they might go. Socially adept and Force-sensitive characters with either of these philosophies can be excellent fits for the Advisor specialization.

[P]Advisors acquire [B]Charm, Deception, Negotiation,[b] and [B]Streetwise[b] as additional career skills. If this is the characters starting specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. This combination enables Advisors to take a very pragmatic approach in working with others and offering them the guidance of the Force. An accomplished Advisor can quickly analyze the risks of a situation and then, using the necessary tools, influence the involved parties so that a desired outcome is rapidly achieved. A less scrupulous individual with these techniques could become a successful con artist. Advisors must be careful to avoid that fate.

[P]Some Advisors attach themselves to a planetary government, helping to shape the rule of law and ensure fairness and justice for all. Many popular rulers have had wise Advisors at hand, helping ensure their policies do the most good for the greatest number. Other Advisors choose to work in less glamorous roles—often among the poor and the desperate. There, they try to counsel and guide individuals in dire straits, sometimes providing salvation to those who have lost all hope.' WHERE key = 'ADVISOR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Advocate (reSpecialized)[h4]
[B]ADVOCATE—PITHY DESCRIPTION[b][BR]
[B]At a Glance[b][BR]
The Advocate is a phenomenal social combat-oriented character, operating as the party support, or a take-down artist in equal measure.[BR]
[B]All-in or Hybrid?[b][BR]
½ Buffing Mentor-oriented character ¼ Cunning Social Manipulator ¼ Vicious Social Duelist.[BR]
[B]What Should it be the Best At?[b][BR]
Social Support[BR]
Social Dueling, Especially Defense as Offensive[BR]
[B]What should it be just “good” at?[b][BR]
Being Charming[BR]
Negotiation[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Politico[i](Any social character that cares about more than one social skill will start to look pretty similar. The Politico is kind of a self-contained mover and shaker, whereas the Advocate is more of “side-kick” in social settings, though grossly powerful otherwise)[BR]
[I]Makashi Duelist[i](The focus on turning flubbed attacks into powerful turnabout is a pretty similar thing to Makashi dueling. A great social defense makes for a solid social offense).
Prophet (The prophet is closer to the Politico, making it a solid primary social character, but with a forcey lean. It does end up being a serious force multiplier with some of its talents, and it does have Twisted Words.)[BR]
[I]Advisor[i](Unfortunately, the Advisor is pretty bleh pile of stuff, but the skills and vibes are pretty similar)[BR]
[B]Media Touchstones[b][BR]
Mas Amedda (Episode 1: The Phantom Menace)
Nute Gunray (Episode 1: The Phantom Menace)
Donnel Udina (Mass Effect)
Miles Edgeworth (Ace Attorney)[BR]' WHERE key = 'ADVOCATE' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Aggressor[h4]

The Aggressor relies on fear to intimidate his opposition into surrender or retreat. Aggressors tend to be tough and dangerous combatants, able to dish out brutal damage to anyone who fights them, while surviving the same. They use their confident, terrifying attitudes to convey this to their opponents. Some Aggressors hope their enemies back down without a fight, but others fall into the trap of relishing the fear they inspire.

[P]Aggressors acquire [B]Coercion, Knowledge (Underworld), Ranged (Light),[b] and [B]Streetwise[b] as additional career skills. If this is the character''s starting specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. These skills enable Aggressors to recognize the bravado shown by criminal enforcers and thugs. It also aids them in cowing these individuals, assuring these predators that the Force-sensitive character is a far scarier and more potent individual than they have previously faced.

[P]Tempered by the Force, some characters who undertake this specialization prefer to use their abilities to intimidate foes into surrender so they don''t have to kill needlessly. While they are extremely capable in this regard, they frequently learn the techniques required to cause the bare minimum of damage necessary. Precision is important, as every life still holds value in the Force.

[P]When confronted by a foe that seems irredeemable, however, the Aggressor''s attitude shifts appropriately. All elements of self-restraint are discarded, and the Aggressor is able to simply punish his foes, inflicting devastating blow after devastating blow. Often, opponents simply flee rather than engage an Aggressor. Stories told by survivors—and sometimes allies—add to the character''s reputation, making it even easier to intimidate future enemies.' WHERE key = 'AGGRES' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Agitator (reSpecialized)[h4][P]
[B]AGITATOR—THOUGH IT TAKE A THOUSAND YEARS, WE WILL BE FREE[b][BR]
[B]At a Glance[b][BR]
The Agitator is the Rebel that rolls into a site of Imperial oppression, fans the flame and foments the rising dissent. After the pump is primed, they hand out blasters like match sticks to these would-be rebels, and give a rousing speech to light the spark.[BR]
[B]All-in or Hybrid?[b][BR]
⅙ Deception[BR]
1/2 Coercion[BR]
2/6 Outfitting & Underworld Connections[BR]
[B]What Should it be the Best At?[b][BR]
Making Chaos Happen[BR]
Encouraging Rebellion[BR]
[B]What should it be just “good” at?[b][BR]
Lying[BR] 
Being Generally Cutting[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Enforcer[i](There''s a serious overlap in how they use Coercion and underhanded tactics to solve problems. But while the Enforcer uses it as a hammer and “Enforce", the Agitator uses it like a scalpel. A little push here, a call to action there.)[BR]
[I]Marshal[i](Also uses Coercion to solve problems, but is more about control than chaos).
[B]Media Touchstones[b][BR]
Wilmon (Andor)[BR]
Saw Gerrerra (Rogue One)[BR]
Nezine (Andor)[BR]
Enjolras (Les Miserables)[BR]
G’Kar (Babylon 5)[BR]
[I]updated 12/10/2025[i]' WHERE key = 'AGITATOR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Alchemist - Giving Life to the Inanimate[h4]
During the era of the Galactic Republic, the Jedi Order never embraced alchemy. Various spiritual orders that had worked in alchemy also allied with the dark side of the Force. The Sith, the Nightsisters of Dathomir, and the Frangawl Cult on Bardotta all used the dark side to power their weapons, talismans, and magicks. Whether or not the Jedi thought that alchemy led to the dark side of the Force has been lost to time. Perhaps the Order felt that giving life to the inanimate, pouring the Force into a dead object, replicated the act of giving life, of giving birth, or of playing god, and would cause the Jedi to become prideful.
[P]With the rise of the Empire and the loss of the Jedi Order, now no one can warn a potential Alchemist away from practicing this lost art. This might be just as well. Just like any technology, it isn''t the object but the user that makes it good or bad, light or dark, useful or destructive. In addition, the Force flows through everything, even inanimate objects. Rocks have a measure of the Force in them. How else could a Jedi move them? With that reasoning, nothing should prevent a Jedi from imbuing a machine with the Force, save the Jedi''s own fears, hatred, and obsessions.
[P]An Alchemist''s additional career skills are [B]Knowledge (Education), Knowledge (Xenology), Medicine,[b] and [B]Resilience[b]. Upon character creation, if this is the character''s first specialization, pick two of these skills to automatically gain one rank in each.
[P]The Jedi built their own lightsabers not only for ritual or training purposes, but to infuse a bit of their own essence into the weapon. The Jedi consciously and deliberately built these weapons both as a technical test and as a meditative test. It could be argued that a lightsaber contains the presence of its creator-and perhaps its user(s).
[P]Force alchemy extends this idea and discipline further, crafting physical objects infused with the power of the Force. These objects appear to have a life of their own, and in the eyes of a Force sensitive, perhaps they do. This creates a metaphysical conundrum: if an object possesses a measure of the Force, how is it different from a living being?
[P]Alchemists tend to focus on medicinal concoctions, since the healing of a physical body is the most direct method of using and influencing the Force. The flow of a medicine, tincture, salve, or draught mimics the flow of the Force. Alchemists can work in other materials, but this requires more training and attention. A malformed or malfunctioning machine can''t be fixed with an infusion of the Force. In many ways, it might exacerbate the damage.
[P]Folktales and popular holovids of machines coming to life and terrorizing their creators and innocents may be based on true stories of Alchemists who fell to the dark side of the Force. Force-infused objects can be tortured as much as any living creature. When the Alchemist is a dark side user, alchemical machines take on a sinister and dangerous aura, "malfunctioning" to cause harm or, in the case of a weapon, increasing suffering when it does cause harm.' WHERE key = 'ALCHEMIST' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Ambassador (reSpecialized)[h4]
[B]AMBASSADOR—PITHY DESCRIPTION[b][BR]
[B]At a Glance[b][BR]
The ambassador is the “all positive, classic diplomat" character. They are charming, shrewd, and knowledgeable. Also skillful orators, the ambassador uses the motivations of would-be allies to win them to their cause[BR]
[B]All-in or Hybrid?[b][BR]
⅓ General Charm (and Leadership) ⅓ Negotiation ⅙ Social Defense ⅙ Charm as a Tool
[BR]
[B]What Should it be the Best At?[b][BR]
Making and using friends for the greater good of their government[BR]
Being Charming[BR]
[B]What should it be just “good” at?[b][BR]
Leadership[BR]
Being hard to Rattle[BR] 
Negotiation[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Republic Representative[i](The Rep-Rep is more a pure negotiator, much more like the Arbiter in that sense. Ambassador has to be an equal opportunity schmoozer)[BR]
[I]Senator[i](Senator is structured much more like Politico, playing into Deception and Negotiation than a pure charming character. It dipping its toe into leadership and mass combat is more of a nod to the Senator’s role.).
[I]Arbiter[i](Pure Negotiation. With some odd enforcer abilities. The big difference is that of a mediator vs an interested party).
[I]Charmer[i](Probably the closest in overall social structure, using all the tools of Presence to win friends and allies).
[B]Media Touchstones[b][BR]
Leia Organa (Star Wars: Rebels)[BR]
Bail Organa (Star Wars: Rebels)[BR]
Padme Amidala (Star Wars: Clone Wars)[BR]
Londo Mollari (Babylon 5)[BR]
Delenn (Babylon 5)[BR]
[I]updated 12/10/2025[i]' WHERE key = 'AMBASSADOR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Analyst (Respec1.0)[h4]
[B]ANALYST—CONSTANT BLUR OF SPINNING PLATES AND KNIVES[b][BR]
[B]At a Glance[b][BR]
The analyst is the military or diplomatic attache, capable of fulfilling a comms or technical officer, or being the “know-it-all” character for a more seasoned political type. They are the person who is always in the know, always capable of adding value to any situation through knowledge and insight.[BR]
[B]All-in or Hybrid?[b][BR]
3/5 Knowledge as a Tool 1/10 Perception as “in the action” element 3/10  Computers as Communication Offense & Defense[BR]
[B]What Should it be the Best At?[b][BR]
Planning and Utilizing Knowledge as utility[BR]
Technical Communications[BR]
[B]What should it be just “good” at?[b][BR]
Perception and noticing things[BR]
Assisting social encounters[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Scholar[i](Both have a core in being “intelligence support," but while the Scholar only barely supplements their core niche, the Analyst has a sub-niche in Computers. Also, it has a decided use-case rather than generalized "knows things.”)[BR]
[I]Strategist[i](Closest to the Analyst, they function in similar roles both in a party and in a military unit. The strategist obviously has the option to lead a battle if it comes up, but otherwise, they just know things).[BR]
[I]Slicer[i](Barely any overlap, as the slicer is very focused on offensive and defensive slicing, and the underworld in general. Analyst is just all in on knowledge and it''s particularly good at codebreaking and shielding intelligence).
[B]Media Touchstones[b][BR]
Kleia (Andor)[BR]
EDI (Mass Effect 2&3)[BR]
[I]updated 12/10/2025[i]' WHERE key = 'ANALYST' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Arbiter[h4]


[B]CAREER + SPECIALIZATION POWERS:[b] Influence, Move, Bind, and Insight.
[P]An Arbiter knows that often, no matter how hopeless a situation appears, a path to enlightenment and balance can be achieved through perseverance and negotiation. An Arbiter channels the nonviolent tendencies of the Consular into active negotiation between potential allies who have fallen into conflict through misunderstanding or nefarious influences. Through an understanding of sentient nature and the ebb and flow of conflict, an Arbiter can often pave the way for a group in the face of the most violent opposition.
[P]The additional career skills for an Arbiter are [B]Knowledge (Xenology), Lightsaber, Negotiation,[b] and [B]Perception[b]. Characters who select this as their starting specialization may gain one free rank in two of these skills without spending starting experience. The career path of a Consular is a wide and varied one leading in such directions as those of the healer, student, or mystic. The Arbiter has chosen the path of the negotiator and peacemaker, following an innate impulse to seek peace and balance in the heated atmosphere of conflict and confusion. An Arbiter is able to stand between two foes, see to the heart of the conflict bewteen them, and bring calmness and reconciliation to the situation.
[P]Arbiters are born negotiators. Whether fully aware of their Force powers or not, they tend to find themselves following the career paths of diplomats and mediators, seeking to bring peace to the galaxy. Some Consulars work with the Rebel Alliance, finding like-minded societies and bringing them into the Rebel fold or helping them to overcome Imperial pressure. However, many do their work in secret, laboring with a wide variety of corporations, organizations, and other groups to help bring harmony and tranquility to a wartorn galaxy. Arbiters see the ebb and flow of pressures and struggles and instinctively sense the fault lines of thought and belief that perpetuate the violence and conflict bred by miscommunication and misunderstanding. Arbiters seek to bring balance to the galaxy through negotiation and reconciliation.
[P]The Arbiter understands the importance of calmness, respect, and tact while dealing with a diverse array of possible allies and potential enemies. Although many, when confronted with injustice or intransigent negativity, might reach for their lightsaber, an Arbiter''s first recourse will always be discussion and negotiation. When the local situation looks completely hopeless, when ancient grudges or new transgressions threaten to tear a system down into violence or chaos, an Arbiter will be able to find a path through the bedlam, to see a course of action that will restore peace and create an environment conducive to the prosperity and contentment of all.
[P]An Arbiter is skilled in acting as the face of a group, providing an interface between the group and the authorities controlling its current area of operation. An Arbiter can assist her group with social interactions, negotiations, and acquisitions, opening doors that less diplomatic characters may find indelibly closed. The Arbiter must at all times keep in mind the greater scope of her duties. Peace is always the ultimate goal, but there is often a bigger picture that must be considered. And when the time for negotiation is at an end, even Consulars must be ready to use more direct means, no matter regretful they may be.' WHERE key = 'ARBITER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Archaeologist (Respec 1.2)[h4]
[B]ARCHAEOLOGIST—DELVING INTO ANTIQUITY[b][BR]
[B]At a Glance[b][BR]
The Archaeologist is an action hero that spelunks, discovers that which was lost, and overall excels in the fringes and lost spaces of the Galaxy. Indiana Jones to a T.[BR]
[B]All-in or Hybrid?[b][BR]
Hybrid 1/2 Knowledge Character, 1/2 "Indiana Jones / Aphra Adventurer"[BR]
[B]What Should it be the Best At?[b][BR]
Interacting with Old Stuff (and Technology) and places[BR]
[B]What should it be just “good” at?[b][BR]
Rough & Tumble[BR]
Using knowledge for general utility[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Sage or Analyst[i] in that is combines Knowledge skills & some other niche[BR]
[I]Scholar[i][BR]
[I]Fringer[i][BR]
[B]Media Touchstones[b][BR]
Indiana Jones[BR]
Chelli Aphra (Marvel Comics Star Wars)[BR]
Dr. Liara T''Soni (Mass Effect)[BR]
Updated 12/10/2025' WHERE key = 'ARCHEOLOGIST' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[B]CAREER + SPECIALIZATION POWERS:[b] Influence, Move, Manipulate, and Psychometry.
[P]The Archivist is the Force Librarian. They are Knowledge of the Force and different force culture, and history.' WHERE key = 'ARCHIVIST' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Armorer - The Smith[h4]
Armorers are defined by their ability to survive through a combination of ingenuity and stubbornness. While Protectors draw directly on the Force to avoid harm and Soresu Defenders use lightsabers to deflect incoming strikes, Armorers build a better defense, reinforcing solidly built equipment with the inestimable power of the Force.
[P]Armorers gain [B]Knowledge (Outer Rim), Lightsaber, Mechanics,  and Resilience[b] as additional career skills. These skills help Armorers in getting the tools they need for the job, maintaining and using those implements efficiently, and surviving to do it all again. If this is the character''s starting specialization, he may choose two of these skills and gain one free rank in each without spending starting experience.
[P]Armorers wield a number of talents that enhance their own armor and defenses, letting them survive hits that would fell most of their allies. They are extremely skilled craftspeople, and not only can build and modify their own gear proficiently, but can also use the Force to bolster their handiwork. With sufficient training, Armorers can imbue their armor with the power of the Force, allowing it to repel blows from lightsabers.
[P]Thanks to their sturdy defenses, Armorers often favor close-quarters combat, trusting their protection to see them through to melee range. Though lightsabers are practically legendary in this era of oppression, some Armorers manage to acquire the kyber crystals necessary to forge these weapons. The most skilled Armorers can even use their innate knowledge of the Force to unlock unseen potential in more mundane items, bringing out qualities that others have overlooked. This mystical ability, combined with an Armorer''s natural resourcefulness, means that catching an Armorer unarmed and unready grants only a minimal advantage.
[P]Though they certainly benefit from having a fully stocked machine shop available, Armorers can also do most of their work on the battlefield, scrounging and retrofitting the supplies they need. This flexibility can be a substantial advantage in [B]Force and Destiny[b], for the Empire hounds every step that Force users take, and they must be able to adapt to shifting circumstances and surroundings. If a vessel needs repairing behind enemy lines or a hull breach must be sealed during a firefight, an Armorer is often the best sentient being for the job.
[P]Outside of combat, Armorers can be extremely helpful to their allies. In addition to possessing considerable skill at modifying equipment, they can repair vehicles and other machines that the group needs kept in working order. While Artisans have the edge in refined skill with technology and the deep research into matters involving machines, Armorers can get the job done, and do it under enemy fire.' WHERE key = 'ARMORER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Artisan[h4]

Some Force users have an innate skill with tools and machines. These skilled artificers can use their skill with the Force to enhance their abilities, and even intuitively understand a machine''s form and function. After all, while tools and machines may not be alive, the Force envelopes everything in the galaxy. Artisans feel the Force that surrounds their tools and the items they work on, using this connection to build creations of wondrous beauty and precision. An Artisan does not create scores of the same item for sale Of distribution. Instead, each of his creations is individual and iconic, a true work of art.

[P]Artisans acquire [B]Astrogation, Computers, Knowledge (Education),[b] and [B]Mechanics[b] as additional career skills. If this is the character''s starting specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. In order to fully integrate their Force abilities with the devices they manipulate, Artisans must first have a solid understanding of how those tools work. This requires a fundamental educational grounding in the principles of technology.

[P]Within urban environments, individuals who never learn to recognize their Force talents are prone to follow the Artisan''s path. This is because they are surrounded by technology, and if these individuals take an interest in how things work and how to repair them, their Force abilities may naturally develop in concert. When faced with a broken machine, they can often identify the problem in an intuitive way—some even claim that the machines "speak" to them. Some Artisans live up to the stereotype of the messy inventor, while others remain meticulously neat or even take pains to disguise their craftsmanship from casual observers.' WHERE key = 'ARTISAN' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Ascetic[h4]


[B]CAREER + SPECIALIZATION POWERS:[b] Influence, Move, Ebb/Flow, and Endure.
[P]There are many paths that might lead one to the role of Ascetic. Whether they are particularly sensitive and seek seclusion to contend with some failure that haunts their steps or wish to contemplate the greater role of the Force in the galaxy at large. Ascetics are individuals driven to a calmer, more contemplative approach to their life, their needs, and their place in the galaxy. They do not seek to gather credits, possessions, or laurels, but rather judge their worth by the depth of their understanding of and communion with the Force.
[P]Ascetic receive [B]Athletics, Descipline, Resilience,[b] and [B]Vigilance[b] as additional career skills. Characters who select this as their starting specialization may choose two of these skills and gain one free rank in each without spending starting experience. While most Consulars focus on the acquisition of helpful skills and abilities, Ascetics concentrate on honing their own mind to a razor focus. As a result, they are likely to have a higher strain threshold than any other Consular specialization, and they have the versatility to work their way through almost any difficulty. An Ascetic has spent a considerable time living on the fringes of society, learning to make do with whatever materials and facilities were on hand regardless of their apparent functionality or crude construction. Ascetics may be out of practice in social interactions and interpersonal communication, but the awareness and resilience they have gained through their trials, as well, as the physical strength their chosen path has earned them, can be invaluable to a group when more refined, civilized plans have failed.
[P]An Ascetic may be found almost anywhere, from the urban wastelands and undercities of the Core Worlds to the most inhospitable and isolated corners of the Outer Rim. The distractions and demands of the outside world can jar even the most focussed, powerful minds from the spiritual path. Those who retreat from the noise and the chaos follow the path of the Ascetic. There are times when even the greatest must set themselves apart, focusing on the spheres of the spirit and the mind to the exclusion of all else. By embracing isolation and hardship, many Consulars are able to realize levels of potential that more mundane training techniques could never unleash.
[P]Many Ascetics have chosen their lonely path of deprivation and meditation to plumb the depths of a specific mystery, a troubling event in the balance of the galaxy, or a great personal failing. The growth made possible through this introspection and self-denial means that when Ascetics choose to emerge from their self-imposed exile, they are ideally suited to confront any situation, with the adaptibility of hard-won experience. Often Consulars will surface from such isolation to take up a particular cause or purpose, driven from quiet contemplation of the galaxy by a troubling imbalance sensed from the depths of their serenity.
[P]The Ascetic can well prove to be one of the most versatile characters in his group. Between his high strain threshold, demanding physical training, and versatility bread through voluntary deprivation, an Ascetic can often provide flexible, insightful leadership to his group. Although perhaps lacking in some of the more subtle social skills of other Consulars, an Ascetic knows that meditation on the Force can only take one so far. The knowledge earned through such rigorous contemplation must eventually be put to use in the galaxy at large, either through teaching or direct action, to better bring balance to the Force.' WHERE key = 'ASCETIC' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Assassin (reSpecialized)[h4]
[B]ASSASSIN — INSTRUMENT OF POLICY[b][BR]
[B]At a Glance[b][BR]
Contract Killer, Killer most important[BR]
Infiltration and Stealth a must[BR]
Lethality & Critting to Death[BR]
[B]All-in or Hybrid?[b][BR]
75%Combat 25%Stealth/Infiltration[BR]
[B]What Should it be the Best At?[b][BR]
Lethality & Critting to Death[BR]
Super-Sentient Feats of Excellence[BR]
[B]What should it be just “good” at?[b][BR]
Sniping[BR]
Melee[BR]
Stealth[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Sharpshooter[i][BR]
[I]Infiltrator[i][BR]
[I]Executioner[i][BR]
[I]Makashi Duelist[i][BR]
[B]Media Touchstones[b][BR]
Fennec Shand (The Mandalorian)[BR]
IG-88 (Episode V: Empire Strikes Back)[BR]
Garrus Vakarian (Mass Effect 2/3)[BR]
Legion (Mass Effect 2/3)[BR]
Zam Wessel (Episode II: Attack of the Clones)[BR]
[I]updated 12/10/2025[i]' WHERE key = 'ASSAS' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Assault Specialist[h4]
Please see User Data for details.' WHERE key = 'ASSAULTSPECIALIST' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Ataru Striker[h4]

When working alone in a hostile environment, every physical conflict must be resolved quickly and decisively. Frequently, an uncivilized planet completely lacks any sort of medical facilities. In fact, at times, an isolated explorer could be the only sentient being on the world. In such a situation, a minor injury can be deadly. If a conflict is necessary, it is better to resolve it quickly, taking whatever risks are involved, than to fight more conservatively and prolong the risk of injury. The Ataru Striker embraces this approach, throwing himself into combat with every fiber of his being.

[P]Ataru Strikers acquire [B]Athletics, Coordination, Lightsaber,[b] and [B]Perception[b] as additional career skills. If this is the characters starting specialization, he may choose two of these skills and gain one free rank in ''each, without spending starting experience. This fighting style is highly dependent on the combatant''s ability to quickly assess a situation and use natural athleticism to exploit the environment. In this way, the combatant is able to gain every possible advantage over an opponent. The combination of these edges and the rapid attacks that characterize Ataru martial arts can force a combat to a very quick resolution.
[P]Practitioners of the Ataru fighting style must be supremely confident in their abilities. They must also be exceptionally athletic and capable of committing all their energy into a very brief conflict. When engaged in a physical conflict, Ataru Strikers fight without remorse but also with little concern for their own safety. Every motion is designed to inflict a flurry of rapid and overpowering attacks against their opponents from myriad angles. Their vicious and unrelenting offense is their best (and sometimes only) defense—most opponents are so busy defending themselves that they have no time to attack in turn.

[P]However, this style of unrelenting attack can have its disadvantages. An Ataru Striker needs to see his opponent defeated quickly, before he exhausts himself. An individual who can outlast an Ataru Striker can prove to be his deadliest enemy.' WHERE key = 'ATARU' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Beast Rider (reSpecialized)[h4]
[B]BEAST RIDER—RIDING THE WINDS[b][BR]
[B]At a Glance[b][BR]
The beast rider is the spec that focuses not just on handling beasts but specifically riding beasts. They know how to look after and leverage their beasts’ abilities.[BR]
[B]All-in or Hybrid?[b][BR]
½ Riding Beasts ¼ Beast Care and other beast-related utility ¼ Using beasts in combat.[BR]
[B]What Should it be the Best At?[b][BR]
Riding the beasts, both flying, ground based, and aquatic[BR]
Punching above their weight, nature beats machine-style.[BR]
[B]What should it be just “good” at?[b][BR]
Beast care.[BR]
Taming Beasts.[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Hermit[i](More of the full gamut of “Animal Handling.” Very mystical vs the Beast Rider’s militarism)[BR]
[I]Pathfinder[i](Fighting alongside their bonded creature, but not necessarily riding them. not out of the question though.)[BR]
[I]Rigger[i](Treats their vehicle like a character, where this tree treats the party mascot like a vehicle. Similarities in tone)[BR]
[B]Media Touchstones[b][BR]
Steela Gurrera (The Clone Wars)[BR]
Cal Kestis (Jedi Survivor)[BR]
The Rancor Trainer (The Book of Boba Fett)[BR]
Hiccup (How to Train Your Dragon)[BR]' WHERE key = 'BEASTRIDER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Big-Game Hunter (reSpecialized)[h4]
[B]BIG-GAME HUNTER—KILLS BEASTS, WILL TRAVEL[b][BR]
[B]At a Glance[b][BR]
The Big Game Hunter is a hunter of beasts and master of their environment, and are exceptional marksman, and serves as useful guides in survival situations.[BR]
[B]All-in or Hybrid?[b][BR]
2/3 Beast-Related Combat, 1/3 Survivalism & Related Utility[BR]
[B]What Should it be the Best At?[b][BR]
Killing Big and Dangerous Creatures[BR]
[B]What should it be just “good” at?[b][BR]
Sniping and Ranged Heavy Marksmanship[BR]
Survivalism[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Hunter[i][BR]
[I]Scholar[i][BR]
[I]Survivalist[i][BR]
[B]Media Touchstones[b][BR]
Qyzen Fess (Star Wars: The Old Republic)[BR]
Updated 12/10/2025' WHERE key = 'BGMHUNTER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Blockade Runner[h4]
[B]At a Glance[b]
[BR]The Blockade runner is the pilot that can outrun anything, avoid detection, and generally makes it impossible to be pinned down, or worse, impounded.
[P][B]All-in or Hybrid?[b]
[BR]½ Generic, defensive-leaning Pilot, ¼ Navigator w/ a Focus on Obfuscation, and ¼ Convincing authorities things are “above board”
[P][B]What Should it be the Best At?[b]
[BR]Piloting Defensively
[P][B]What should it be just “good” at?[b]
[BR]Astrogation, 
Social
[P][B]Specs for Comparison / Inspiration[b]
[BR]Pilot (Raw),
Navigator,
Ship Captain
[P][B]Media Touchstones[b]
[BR]Han Solo
[BR]Kay Vess (Star Wars Outlaws)
[BR]Booster Terrik
[BR]Hoban “Wash” Washbourne  (Firefly)' WHERE key = 'BLORUN' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Bodyguard (reSpecialized)[h4]
[B]BODYGUARD—SECURING THE VIP[b][BR]
[B]At a Glance[b][BR]
The Bodyguard is the perfect chauffeur or personal protector, often both.[BR]
[B]All-in or Hybrid?[b][BR]
 Hybrid. ⅛ Offensive capability, ⅛ Perception-based Utility, ½ Defensive & Protective Capability, 1/4 defensive driving[BR]
[B]What Should it be the Best At?[b][BR]
Bodyguarding[BR]
[B]What should it be just “good” at?[b][BR]
Ranged Combat[BR]
Piloting (Planetary), specifically Defensive Driving[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Vanguard[i](sub out raw tank & Damage for attack mitigation and driving)[BR]
[I]Heavy[i](for the amount of Sidestep)[BR]
[I]Gunner[i][BR]
[B]Media Touchstones[b][BR]
Marcus Cole (Babylon5)[BR]
Ta’Lon (Babylon 5)[BR]
John Wick[BR]
[I]updated 12/11/2025[i]' WHERE key = 'BODYGUARD' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Charmer (reSpecialized)[h4]

[B]At a Glance[b][BR]
The Charmer is the faciest face that ever face’d. They are a the perfect embodiment of a character that uses their looks, charm, suaveness to grease every wheel in the galaxy.[BR]
[B]All-in or Hybrid?[b][BR]
All-in on the positive aspects of sociality. Maybe ⅔ Charm, ⅓ Deception and Negotiation, max.[BR]
[B]What Should it be the Best At?[b][BR]
Charm, obviously[BR]
Avoiding consequences (social or otherwise) due to being so socially magnetic[BR]
Buffing Debuffing in a very bard-y way[BR]
[B]What should it be just “good” at?[b][BR]
Deception[BR]
Negotiation[BR]
Other Smuggler stuff[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Diplomat[i][BR]
[I]Republic Representative[i][BR]
[I]Politico[i][BR]
[I]Performer[i][BR]
[B]Media Touchstones[b][BR]
Lando “Balthazar” Calrissian[BR]
Saffron (Firefly)[BR]
Mr. Morden (Babylon 5)[BR]
[I]updated 12/11/2025[i]' WHERE key = 'CHARMER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Clone Commander[h4]
The bio geneticists on Kamino understand that a clone army needs specialized commanders. While nonclone commanders could serve the function, the Kaminoans wished to sell a fully staffed military as a whole package and took on the challenge of providing an independent thinker with unwavering loyalty to their buyer. A Clone Commander can come from the soldier''s ranks, having shown a natural ability to command, or can be engineered on Kamino through specialty training. The Jedi lean on these commanders to advise them, enforce discipline, and execute the Jedi''s orders.
[P]A Clone Commander leads a regiment of four battalions of four companies each, taking orders directly from the Jedi on the field. They must think large scale, advising the Jedi on tactical and strategic matters, questioning when appropriate, but following orders when commanded. They must also interpret those orders, making sure they can accomplish the Jedi''s goals while keeping casualties low. Lastly, they must pay attention to logistics and supply lines, ensuring that their regiments can hold the territory they take or have the ability to wage an offensive. This training provides Clone Commanders with the career skills [B]Knowledge (Core Worlds), Knowledge (Warfare), Leadership, and Perception[b]. If this is the PC''s first specialization, the PC gains one rank in each of two of these skills.' WHERE key = 'CLONECOM' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Clone Officer[h4]
Every military organization depends upon its officers to function effectively. In most armies, this starts with noncommissioned officers, who work directly with line infantry and extends to the highest-ranking generals, who devise the force''s tactics and strategies. Sometimes, an officer needs to be a friend to the soldiers for whom they are responsible. At other times, the officer represents a supreme authority, one who can tolerate no dissension. In the Grand Army of the Republic, Clone Officers assume all but the very highest level of responsibility for their fellow clones, and every officer is a career soldier.

[P]Clone Officers receive [B]Cool, Leadership, Knowledge (Outer Rim),[b] and [B]Knowledge (Warfare)[b] as additional career skills. Characters who select this as their starting specialization may choose two of these skills and gain one free rank in each without spending starting experience. Officers need to recognize trouble at its earliest signs and react calmly to it. They also need their soldiers to believe that they have already foreseen every possible complication and have appropriate plans to respond to each. A thorough familiarity with the army''s standard tactics and the capabilities of the units tender their command are critical for implementing the appropriate strategy.

[P]The Grand Army of the Republic (GAR) includes Clone Officers at a range of ranks, based upon their level of responsibility. In some instances, clones are promoted based upon their performance, but this is not always the case. Due to the differences in training and the constant need for Clone Officers, many Clone Officers are trained to perform at a higher rank from the time they are decanted.

[P]A done sergeant manages a single squad of nine troopers. In this role, they develop a close relationship working with the members of the squad. They learn the particular knacks of each clone in their unit and recognize which troopers are best suited for particular tasks. Sergeants see the same action as the rest of their squad, so they are often at the front lines.

[P]Clone lieutenants assume responsibility for a platoon of four squads. While clone captains take charge of a company that includes four platoons. As the level of responsibility increases, so do the expectations for Clone Officers to operate independently of direct oversight. Missions often require units to operate in isolation from the larger command structure for extended periods.

[P]Clone commander is the highest rank normally assigned to a Clone Officer within the GAR. These clones command full regiments of sixteen companies. They in turn answer to a Jedi general, and they may work closely with a Jedi commander.

[P]Initially, Clone Officers wore color-based arm and chest identifiers on their uniforms. Sergeants wore pesto, lieutenants blue, captains maroon, and commanders yellow. This enabled every Clone Trooper to quickly identify their officers in the heat of battle, even when support systems were down. As the war has progressed, however, enemy units have exploited this easy recognition, and the Jedi have encouraged Clone Officers to uniquely identify themselves. Consequently, armor markings are becoming more personal, and the standard schemes are likely to soon be largely abandoned.' WHERE key = 'CLONEOFF' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Clone Pilot[h4]
Interplanetary conflict inevitably brings battles to the upper atmosphere and the void of space. Capital ships play a prominent role in these battles, but large wings of starfighters are a vital part of every conflict. These specialized ships exploit their smaller profile and variations in armament to avoid detection while occupying a variety of roles. Military transports deploy from capital ships—often through active war zones in the company of starfighter screens—to deliver troops and equipment to a planet’s surface, where clones can engage the enemy.

[P]Every Clone Soldier has the rudimentary knowledge required to pilot repulsorlift vehicles, walkers, and starfighters. However, basic skills alone are inadequate for success in a combat environment. To address this, some Clone Soldiers receive additional training in the Clone Pilot specialization and are inducted into the Republic Navy branch of the Grand Army of the Republic.

[P]Clone Pilots receive [B]Gunnery, Mechanics, Piloting (Planetary),[b] and [B]Piloting (Space)[b] as additional career skills. Characters who select this as their starting specialization may choose two of these skills and gain one free rank in each without spending starting experience. A degree or familiarity with these skills is vital for any Clone Soldier to survive as a starfighter pilot. While any battlefield is profoundly dangerous, the vacuum of space adds significant risks that are not present during typical planetary conflicts. Additional training mitigates some of those dangers but can never completely eliminate them.

[P]Clone Pilots serve as members or a squadron under the command of a Clone Officer, who has also mastered the skills of a pilot. A squadron is typically assigned a particular type of craft, although this can change based on mission requirements. Clone Pilots are sometimes reassigned to other squadrons in which they are expected to fly other craft. Consequently, their training includes exposure to a range of starfighters, speeders, and walkers. Typical starfighter assignments include the Republic Z-95 Headhunter starfighter, the V-19 Torrent starfighter, and the ARC-170 starfighter. Those Clone Pilots assigned to transport duty typically fly Low Altitude Assault Transports (LAATs) or [I]Nu[i]-class attack shuttles. Collectively, these spacecraft represent the core of the Republic Navy''s smaller craft.

[P]Some Clone Pilots are assigned to operate vehicles that work more closely with ground units. These include AT-RT and AT-TE walkers, and BARC speeders, among others. Notably, these craft are not normally under the oversight of the Republic Navy branch of the GAR. As such, Clone Pilots assigned to them do not fall under the oversight of the naval chain of command, leaving them far less likely to pilot starfighters.' WHERE key = 'CLONEPIL' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Clone Trooper[h4]
Standard infantry make up the largest portion of the soldiers in almost every army. Their units handle the direct, personal conflict on the surface of every battlefield, whether that battlefield is on the ground, under the sea, or within the confines of a space station. Because the Clone Troopers—the infantry—represent the front line of the Grand Army of the Republic, their basic level of competency defines the army''s capabilities. In order for the army to be able to overcome its foes quickly and effectively, every Clone Trooper must be more capable than the rank and file of the Separatists'' droid aimies.

[P]Clone Troopers receive [B]Gunnery, Perception, Ranged (Heavy),[b] and [B]Resilience[b] as additional career skills. Characters who select this as their starting specialization may choose two of these skills and gain one free rank in each without spending starting experience. These expand upon the core skills that a soldier needs to succeed in basic battlefield situations. While not every Clone Trooper masters all of them, they are expected to have some level or competency so that they can effectively engage in battle under diverse conditions.

[P]This specialization provides a versatile set of skills that are valuable to every Clone Soldier. A background as a member of the infantry provides a Clone Officer with a better understanding of the soldiers he commands. Similarly, infantry experience gives a Clone Pilot some familiarity with the risks faced by soldiers on the ground, which is useful for providing air support or extraction.

[P]The Clone Trooper specialization encompasses a range of non-specific roles. Some of these are devoted to particular environmental conditions, including the combat roles of cold assault trooper, SCUBA trooper, and Galactic Marine. Other Clone Troopers, including paratroopers, flame troopers, and medics, have more extensive training to work with particular equipment. Soldiers who exhibit particular skills in service might be selected for advanced training within that skill set, including ARC troopers, scout troopers, and special ops clone troopers. While distinctive equipment characterizes each of these different combat and support roles, the training to use that gear and work under extreme situations is also critical to success within these niches.

[P]Even within a unit, soldiers assume particular responsibilities. Often, one trooper is assigned to carry a heavier weapon—such as the Z-6 rotary blaster cannon—while others might wield alternative tools, such as explosives, communications gear, a medpac, or other equipment necessary to complete the mission at hand. Typically, Clone Troopers receive particular training to make use of any non-standard equipment they carry. However, Clone Troopers with less specialized training might redistribute such gear over the course of a mission.' WHERE key = 'CLONETRO' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Clone Veteran[h4]
Cloning, training, mental implants, and programming pale in comparison to field experience. Even the engineers on Kamino and the skeptics in the Republic government can''t deny the skill and talent of a veteran soldier. A training program can''t take into account all the variables of combat, so veterans rely on firsthand knowledge of battle, tactics, and even psychology. Engagement with the enemy means learning about the enemy, and a clone commander or Jedi is wise to ask the counsel of a veteran on any tactical matter.
[P]Thanks to their accelerated training program and genetic design,  clones have an amazing flexibility to learn on the field. Clone Veterans have learned the lessons of their battles and gain the following career skills: [B]Melee, Resilience, Skulduggery, and Survival[b]. If this is the PC''s first specialization, the PC gains one rank in each of two of these skills. Veterans have fought in enough urban environments and infiltrated enough bases to know the ins and outs of security systems Further, they have been thrown into so many different environments that they have prepared some basic survival tactics for all biomes.' WHERE key = 'CLONEVET' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Colossus - Indefatigable and Invincible[h4]

Most Warriors pride themselves on their ability to overcome pain. A Colossus, however, possesses a toughness far beyond that. While many fighters wear their scars with pride, an experienced Colossus ripples with scar tissue, the evidence of wounds enough to kill a normal combatant a dozen times over. Where other Warriors might seek to end conflicts quickly and decisively, a Colossus possesses the stamina, endurance, and strength of will to fight through inconceivable pain and punishment, outlasting the foe no matter the odds.
[P]Colossus characters receive [B]Brawl, Discipline, Melee,[b] and [B]Resilience[b], as additional career skills. If this is the character''s starting specialization, the player chooses two of these skills and gains one free rank in each, without spending starting experience. These skills allow Colossi to endure great punishment both mentally and physically, and to ensure that they are prepared for even the most taxing situations and battles.
[P]Knowingly or not, Colossi reflect a number of stoic Force traditions that arose throughout history. Some of these beliefs influenced the Jedi Order, particularly in teachings of the primacy of the mental and spiritual over the physical. By accepting the transience of physical pain, a Warrior can rise above it. Some arrive at such a state of mind independently, perhaps realizing (aided by a robust constitution) that physical pain is passing, and only makes them stronger.
[P]Becoming a true Colossus is rarely a matter of formal training, and there is no single path. Few sentients have the physical endurance or the mental reserves for this approach to combat. Those who do might hone their natural abilities through a number of means, likely never quite the same. Being a Colossus may mean transcending their natural physical limitations through meditation and focus, maintaining an internal calm even in the midst of ferocious battle. Others take the opposite approach, drawing on their pain and the negative emotions it evokes to fuel themselves in combat. This latter method is representative of those who tread closer to the dark side.
[P]Although all who fit the mold of a Colossus share certain traits when it comes to defense and longevity, they can take very different approaches to dishing out damage. There is no particular fighting style that defines a Colossus''s approach to attacking. Some might heft a heavy blaster. wading heedlessly through enemy fire to unleash a salvo. Others prefer hefty vibro-axes, swords, or other melee weapons, getting up close to enemies and trading blows, confident in their ability to take punishment and give it back in turn. Regardless of their preferred approach, Colossi are sure to have the strength to overcome an opponent with well-placed strikes should the opportunity arise.
[P]Whether by focusing on suffering or by aspiring to higher ideals, a Colossus achieves a preternatural level of physical hardiness and toughness by drawing on the Force. A hardened Force user possesses reserves of willpower to fight on despite agonizing wounds. More importantly, Colossi can allow the Force to flow through them, usng it to achieve impossible feats of endurance. They may be blasted and slashed, but their wounds do not bleed. They walk on broken legs and continue the fight, though it might worsen their injuries. They harness their pain, returning it twice over.' WHERE key = 'COLOSSUS' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Commando (reSpecialized)[h4] 
 [B]Commando - Strike the Target[b][P]


Commandos are specialists trained to strike the enemy from unexpected directions to do the most damage in the most vulnerable locations. Commando teams are often used like surgical instruments by the commanders who have access to them. A Commando knows how to find a target, attack it, disable it, survive the aftermath, and find his way home.

[P]Commandos gain [B]Brawl, Melee, Resilience,[b] and [B]Survival[b] as additional career skills. If Commando is the character''s first specialization, two of these new career skills gain a free rank each. Commandos are masters of close combat and surviving in all conditions. They are usually good at sneaking past enemy guards and listening posts as well.

[P]For any team, a Commando is a fine general-purpose combat specialist to have around. He handles fights well (especially hand-to-hand situations), and can manage in almost any high-stress situation. More often than not, he''s also effective as backup during covert operations. Matters of overall philosophy or strategy rarely concern a Commando; he''s almost always focused on the mission at hand or training to ensure he and his companions survive the next one.

[P]As stand-up confrontations are normally a losing proposition for the Alliance, the Commandos are some of the most important and effective soldiers fighting for the Rebellion. Their capacity to surgically strike at Imperial targets, as well as their value as guards and support personnel for other specialists operating on behalf of the Alliance, makes any single one of them worth more than a platoon of stormtroopers.' WHERE key = 'COMMANDO' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Commodore (reSpecialized)[h4]
[B]COMMODORE—CAPITOL COMMAND[b][BR]
[B]At a Glance[b][BR]
The Commodore is a bit of a misnomer, as the title would presume a literal command or rank. In reality, Commodore covers the full gamut of command, tactical, and technical positions that would find themself stationed on the bridge or command deck of a capital ship. The Commodore is the captain, the helmsman, or the technical officer, potentially all three.[BR]
[B]All-in or Hybrid?[b][BR]
¼ Generic “Capital Ship Leadership” ⅛ Damage Management (Education) ⅛ Systems Management (Computers) ⅛ Navigation (Outer Rim & Astrogation) ¼ Astrogation (Duh)[b][BR]
[B]What Should it be the Best At?[b][BR]
Helming and Command of Capital Ships[BR]
[B]What should it be just “good” at?[b][BR]
Leadership[BR]
General Computers & Knowledge[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Tactician[i](The Tactician is a Operational-level army leader, so they are obviously more about managing planetary warfare and infantry/armor)[BR]
[I]Ship Captain[i](Ship Captains are more about their ship, and generally are about trade, social skills, and bolstering the party passively. The Commodore is more of a technical role in addition to being a leader.)[BR]
[I]Republic Navy Officer[i](The Republic Navy Officer is a little more aggressive than the Commodore, who is a more balanced, utility oriented leader)[BR]
[B]Media Touchstones[b][BR]
Admiral Ackbar (Episode VI: Return of the Jedi)[BR]
Admiral Raddus (Rogue One)[BR]
Captain John Sheridan (Babylon 5)[BR]
Commander Susan Ivonova (Babylon 5)[BR]
Admiral Adama (Battlestar Galactica)[BR]' WHERE key = 'COMMODORE' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Courier (reSpecialized)[h4]
[B] Courier - Ensuring Delivery[b]
[P]
There is more to military intelligence than stealing the enemy''s secrets. That data must be secured and delivered to the specialists who can best exploit it. The Courier specializes in transporting critical information, often while working incognito far behind enemy lines. These experts take the necessary risks of repeatedly crossing through security checkpoints or even active battlefronts. They must be capable of operating under foes'' scrutiny without drawing undue attention. To a certain extent, these Spies are a very specialized type of smuggler, dealing primarily in information rather than physical goods. Not surprisingly, many Couriers developed underworld contacts working as smugglers prior to joining the Rebellion.
[P]Couriers acquire [B]Athletics, Deception, Streetwise,[b] and [B]Vigilance[b] as additional career skills. If this is the character''s starting specialization, the player may choose two of these skills and gain one free rank in each without spending starting experience. In order to avoid Imperial entanglements, Couriers must be capable of operating without drawing attention to themselves. As they cannot expect to always succeed, these characters must also recognize the signs of trouble and have the ability to act quickly to escape entrapment. Because they often face overwhelming odds, personal speed is typically a higher priority than a trusted weapon.
[P]Some Couriers prefer to work consistent routes as they shuttle information away from prying Imperial eyes. These specialists need a reliable cover story that they can use repeatedly. They might pose as merchants or transport drivers plying consistent trade routes. In a few instances, a Rebel might even take on the cover profession as a means of obtaining additional income, carrying innocuous cargo to market while smuggling critical information. Such Spies go to great lengths to ensure that their business interests are completely legitimate, so that they do not attract any undue attention. They also make sure that those interests are at least marginally profitable. A merchant who loses money consistently for years, after all, is just as likely to draw government attention as one who manages exorbitant profits. These individuals may even establish friendly relationships with the guards along their routes, and their frequent passage through Imperial territory becomes just a part of a station''s routine traffic. In these cases, typically only a subset of their transits include military intelligence.
[P]Other Couriers deliver critical data to Rebel specialists in a variety of locations instead of adopting a mundane occupation that involves travel on regular routes. Some are enthusiastic adrenaline junkies who call on wild speed and quick thinking to overcome Imperial security. More risk-averse Couriers simply excel at developing good cover stories and staying true to their roles during a mission. Adrenaline junkies or not, these Couriers are unlikely to have any established relationship with the local Imperial guards. Consequently, they must quickly determine how to bypass security or rely on other intelligence sources to prepare for it.' WHERE key = 'COURIER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Cyber Soldier[h4]
Please see User Data for details.' WHERE key = 'CYBERSOLDIER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Cyber Soldier[h4]
Please see User Data for details.' WHERE key = 'CYBERSOLDIER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Cyber Tech (reSpecialized)[h4]
[B]CYBER TECH—IMPROVING ON ORGANIC[b][BR]
[B]At a Glance[b][BR]
The cyberneticist is an interesting combination of healer and technician, usually culminating in a self-sufficient, highly specialized fusion of sentient and durasteel.[BR]
[B]All-in or Hybrid?[b][BR]
⅖ Cybernetics and crafting-oriented tech, ⅖ Individual cybernetics and superiority, ⅕ Medicine and Surgery[BR]
[B]What Should it be the Best At?[b][BR]
Crafting Cybernetics[BR]
Installing Cybernetics[BR]
Wielding Cybernetics[BR]
Super-Sentient Feats of Excellence[BR]
[B]What should it be just “good” at?[b][BR]
Medicine[BR]
General Tech[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Shipwright[i](Focus on Crafting, but less all-in than the Shipwright happens to be)[BR]
[I]Alchemist[i](Medical-focused crafting spec, with a rough split between crafting and medicine. Pretty analogous)[BR]
[I]Modder[i](Strangely, it feels similar because the Cyber builds one thing, usually themselves, into a weapon to surpass metal gear. Much like the modder does a gun or their whip)[BR]
[B]Media Touchstones[b][BR]
Thundercat (Book of Boba Fett)[BR]
Cornelius Evazan from Mos Eisley (and at least 12 other systems) (Episode IV: A New Hope)[BR]
Viktor Vector (Cyberpunk 2077)[BR]
Updated 12/10/2025' WHERE key = 'CYBERTECH' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Cypher[h4]' WHERE key = 'CYPHERSPY' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Demolitionist (reSpecialized)[h4]
[B]DEMOLITIONIST - NEVER STOP BLOWING UP[b][BR]
[B]At a Glance[b][BR]
The Demolitionist is the specialist - the safecracker, the trapmaker, the walking stick of dynamite. They often fulfil technical roles on the team, but whatever they do, they do it with a bang.[BR]
[B]All-in or Hybrid?[b][BR]
⅘  Explosives and associated Utility, ⅕ unrelated technical utilityBR]
[B]What Should it be the Best At?[b][BR]
Explosives as a Tool, Explosives as Weapons[BR]
[B]What should it be just “good” at?[b][BR]
Skullduggery[BR]
Mechanics[BR]
Technical Tasks[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Sapper[i][BR]
[I]Heavy[i][BR]
[I]Saboteur[i][BR]
[B]Media Touchstones[b][BR]
Heist Movie Safecrackers[BR]
Ank Parako (Star Wars Outlaws)[BR]
Bomb Voyage (The Incredibles)[BR]
Vinny Santorini (Atlantis: The Lost Empire)[BR]
The Evil Midnight Bomber What Bombs at Midnight (The Tick)[BR]
Updated 12/10/2025' WHERE key = 'DEMOLITIONIST' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Detective[h4]
Please see User Data for details.' WHERE key = 'DETECTIVE' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Doctor (reSpecialized)[h4]

[B]DOCTOR—DO NO HARM[b][BR]
[B]At a Glance[b][BR]
Doctors are the masters of conventional Medicine and healing. They also represent an education, sophistication, and moral purity that is lost on most in the outer reaches and in the underworld.[BR]
[B]All-in or Hybrid?[b][BR]
 1/2 Healing, 1/8 Buffing, 3/8 General Non-Combat & Knowledge Utility[BR]
[B]What Should it be the Best At?[b][BR]
Raw Healing Output[BR]
Healing In Proper Medical Environments[BR]
[B]What should it be just “good” at?[b][BR]
Battlefield Medicine[BR]
Incentivizing Peaceful Solutions[BR]
Knowledge-Based Utility[BR]
Medical-Based Buffs[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Medic[i](Should be better at critical injury management, and emergency stim usage, and combat).[BR]
[I]Healer[i](Should be better at holistic healing, and Force protection. Probably the closest thing to a side grade to doctor).[BR]
[I]Alchemist[i](Should be better at making medicine, obviously with Force influence, but worse at raw healing).[BR]
[B]Media Touchstones[b][BR]
Simon Tam (Firefly)[BR]
Leonard McCoy (Star Trek)[BR]
Dr. Franklin (Babylon 5)[BR] 
Julian Bashir (Star Trek: Deep Space 9)[BR]
“Doc” Kimble (Star Wars: The Old Republic)[BR]
Updated 12/11/2025' WHERE key = 'DOCTOR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Driver (reSpecialized)[h4]
[B]DRIVER—PEDAL TO THE METAL[b][BR]
[B]At a Glance[b][BR]
The driver is, bar-none, the best of the best while driving planetary vehicles of all stripes, especially off-road and in dangerous areas.[BR]
[B]All-in or Hybrid?[b][BR]
⅔ Hybrid, mostly engaging with being an excellent planetary pilot, ⅓ with associated vehicle-based Utility like mechanics.[BR]
[B]What Should it be the Best At?[b][BR]
Driving, Especially Off-Road[BR]
[B]What should it be just “good” at?[b][BR]
Piloting[BR]
Mechanics[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Racer[i]
[I]Pilot[i][BR]
[I]Rigger[i][BR]
[B]Media Touchstones[b][BR]
Mad Max/Furiosa[BR]
Young Han Solo (circa Solo: A Star Wars Story)[BR]
Updated 12/10/2025' WHERE key = 'DRIVER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Droid Specialist (reSpecialized)[h4][P]
[B]At a Glance[b][BR]
The Droid tech is the “Droid-Weaponizer."  They excel at managing their organization’s Droids, and disabling and appropriating enemy Droids.[BR]
[B]All-in or Hybrid?[b][BR]
⅕ Disabling Enemy Droids[BR]
⅖ Field Maintenance of Droids[BR] 
⅖ Organizing and Improving Droids[BR]
[B]What Should it be the Best At?[b][BR]
Dealing with Enemy Droids, both in combat and with computers[BR]
Temporary improvements to Droids[BR]
[B]What should it be just “good” at?[b][BR]
General Mechanics[BR]
General Computers[BR]
[B]Specs for Comparison / Inspiration[b][BR]
Droid Tech - This is pretty close overlap, the big difference is that ownership and leadership isn''t the core focus of the Specialist, rather they kill and repair droids.[BR]
Mechanic - The mechanic has a bit of a “tough technical type" vibe, but really their overlap is minor in the general mechanics space.[BR]
Shipwright - They may not seem close at first, but the Shipwright and Droid Specialist absolutely focus on improving already-built things like Ships and Droids. Where they differ is in their care to make things from scratch.[BR]
[B]Media Touchstones[b][BR]
Babu Frik (Star Wars: The Rise of Skywalker)[BR]
Updated 12/10/2025' WHERE key = 'DROIDSPEC' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Droid Tech (reSpecialized)[h4]

[B]At a Glance[b][BR]
The Droid Tech is the ultimate minion master in the game, focusing exclusively on building, repairing, improving, and leading a small squad of droids to fill rolls in the party or be an effective combat force[BR]
[B]All-in or Hybrid?[b][BR]
½ Droid Crafter[BR]½ Droid Leader[BR]
[B]What Should it be the Best At?[b][BR]
Building Droids[BR]
Leading Droids[BR]
[B]What should it be just “good” at?[b][BR]
General Mechanics[BR]
Computers[BR]
General Leadership[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Droid Specialist[i] (Spec is much more focused on breaking and repairing droids, but less focused on crafting and leadership)[BR]
[I]Hermit[i] (Really just in the minion Mastery, but also the healing and holistic support of the minion)[BR]
[I]Separatist Commander[i] (does care more about leadership and specifically Droid leadership, but nothing about Droid creation or repair)[BR]
[B]Media Touchstones[b][BR]
Gauge (Borderlands 2)[BR]
Anakin Skywalker (circa Episode I: The Phantom Menace)[BR]
Babu Frik (Episode IX: The Rise of Skywalker)[BR]
Entrapta (She-Ra)[BR]
Updated 12/10/2025' WHERE key = 'DROIDTECH' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Enforcer (reSpecialized)[h4]
[B]ENFORCER - BREAKING KNEES, TAKING NAMES[b][BR]
[B]At a Glance[b][BR]
The Enforcer is the Thug’s idea of a face-character. Thinly-veiled threats, dire ultimatums, and a willingness to follow through. This character is the master of maneuvering the criminal underworld, and applying the right kind of leverage for the desired result.[BR]
[B]All-in or Hybrid?[b][BR]
⅖  Coercion-focussed sociality and being scary, ⅖ Streetwise and Problem-solving, ⅕ Combat[BR]
[B]What Should it be the Best At?[b][BR]
Coercion and Intimidation[BR]
[B]What should it be just “good” at?[b][BR]
Underworld Maneuvering[BR]
Melee & Brawl Combat[BR]
Being Tough[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Aggressor[i](Largely very similar trees, but Aggressor is more about how to use fear as an offensive weapon. Enforcer would be more utility-focussed.)[BR]
[I]Skip Tracer[i](Comparable in that they have a light combat sub-focus in combat-focussed careers, with a heavy focus on underworld maneuvering.)[BR]
[I]Marshal[i](The closest in terms of tree split; they both care about sociality, streetwise, and a form of nonlethal combat.)[BR]
[I]Warden[i](More of a Martial Artist, but it does have the Fear-based Battlefield control.)[BR]
[B]Media Touchstones[b][BR]
Sevika (Arcane Season 1)[BR]
Al Neri (Godfather)[BR]
Fennec Shand (Book of Boba Fett)[BR]
Updated 12/10/2025' WHERE key = 'ENFORCER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Entrepreneur (reSpecialized)[h4]
[B]ENTREPRENEUR—SECURING THE PURSE[b][BR]
[B]At a Glance[b][BR]
The entrepreneur is a shrewd and competent business-person, using money to make money and solve problems.[BR]
[B]All-in or Hybrid?[b][BR]
 Hybrid ⅓ Making Money, ⅓ Credits-Related Social Utility, ⅙ Credit-Related General Utility, ⅙  General Utility[BR]
[B]What Should it be the Best At?[b][BR]
Making Money[BR]
Using Money to Solve Problems[BR]
[B]What should it be just “good” at?[b][BR]
Trading[BR]
Positive Sociality[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Trader[i][BR]
[I]Republic Representative[i][BR]
[I]Arbiter[i][BR]
[B]Media Touchstones[b][BR]
Davo Sculdun (Andor)[BR]
Luthen Rael (Andor)[BR]
Lando Calrissian (Episode V:Empire Strikes Back)[BR]' WHERE key = 'ENTREPRENEUR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Executioner - Dealing Efficient Death[h4]
Seekers often focus on survival in hostile settings where they must rely soley on their own abilities. Such self reliance can also  be reflected in their combat abilities, as each shot or strike must end a battle as swiftly as possible. Merely wounding or dissuading a foe is not sufficient in these cases, as often only one party can leave the encounter alive. Executioners embody this focus on precise lethality. Many become feared across systems for their effective means of eliminating any threat that requires removal. Determining which threats deserve their deadly and personal attention, though,  can make for complex judgement calls. Such decisions and the methods by which they render them can also lead Executioners down the path to the dark side.
[P]Executioners are perhaps the emodiment of the Seeker career as apex predator, and they excel at the art of death. While other careers and specializations can produce effective fighters. Executioners are more concerned with maximizing the damage they inflict to ensure a quick, definitive end to their conflicts. Given their emerging connection to the Force theire are few who can match these lethal characters'' ability to achieve this goal.
[P]Executioners recieve [B]Discpline[b], [B]Melee[b], [B]Perception[b], and [B]Ranged (Heavy)[b] as additonal career skills, reflecting their deadly and efficitent application of violence. Characters who select this as their starting specialization may choose two of these skills and gain one free rank in each without spending starting experience.
[P]Others might view Exectutioners as brutal killers, but this is a simplistic view. Killing is often the outcome of combat, but Exectioners might attempt to avoid conflict altogether as their aim is only for a fatal end for their target. This could even mean a target is eliminated by long range fire or a decisive lightsaber strike before even becoming aware of any danger. When eliminating one saves hundres f others or frees entire villages from suffering, many Executioners see their work as perhaps distasteful, but certainly necessary.
[P]Executioners are not always grim, dispassionate assassins, though many are driven by intellect rather than emotion. Some may view their calling as a righteous one, celebrating each threat they remove before it can harm others. Others might see each lethal act as a step toward redemption for past sins. Inflicting death should never be an easy act, however. Those who trivialize it or become too emotionally attached to their goals are at risk of becoming enthralled by the dark side of the Force—which some Executioners might not realize until far too late.' WHERE key = 'EXECUTIONER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Field Agent[h4]
The field agent is the jack-of-all-trades spy that operates in the field, often sent to investigate and infiltrate a situation socially. While a decent combatant, they mostly talk their way out of problems and resort to fisticuffs and light concealable weapons.' WHERE key = 'FIELDAGENT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Figurehead (reSpecialized)[h4]
[B]FIGUREHEAD—COMMANDER IN CHIEF[b][BR]
[B]At a Glance[b][BR]
The Figurehead is the civilian leader of military command. This character inspires powerful and sincere loyalty and valor of all those who will listen to them. They are unshakable in the face of danger and insurmountable odds.[BR]
[B]All-in or Hybrid?[b][BR]
All in on Presence, Hybrid as far as focus
⅘  Being an Inspiring Leader ⅕  Leveraging Figurehead Status for Political/Organizational Favor[BR]
[B]What Should it be the Best At?[b][BR]
Pure Leadership[BR]
Non-Combat Leadership[BR]
[B]What should it be just “good” at?[b][BR]
Sociality[BR]
Mass Combat[BR]
Being “Confident/Cool”[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Politico[i](Similar in that they can be genuinely inspiring and bolstering of their allies, different in that they really only lean into the truly positive aspects of leadership)[BR]
[I]Strategist[i](Where a Figurehead is on the holoscreen, the Strategist is at the holo-table crafting battle plans. Both have a significant role)[BR]
[B]Media Touchstones[b][BR]
Admiral Ackbar (Episode VI: Return of the Jedi)[BR]
Mon Mothma (Episode VI: Return of the Jedi)[BR]
Leia Organa (Episode VIII: The Last Jedi)[BR]
Delenn (Babylon 5)[BR]' WHERE key = 'FIGUREHEAD' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Force Adherent - Indomitable Believers[h4]
Force Adherents worship the Force and accept its influence over the galaxy. The Force binds all living things, and those who surrender to this idea are able to reach a level of perception unknown to the common sentient. Even those without sensitivity to the Forse have benefited from this acceptance. Through this belief, Force Adherents are capable of overcoming extreme adversity.
[P]The additional career skills a PC receives when taking the Force Adherent universal specialization are [B]Melee, Discipline, Knowledge (Lore),[b] and [B]Vigilance[b]. Finding purpose and strength in their belief in the Force, such PCs are bastions of belief in these dark times.
[P]Belief in the Force is most commonly assoctiated with the Jedi legends, but multiple cultures throughout the galaxy recognize the same phenomenon. For example, the Lasat, whom many believe to be extinct, worship the Ashla, a personification of the light side of the Force, and acknowledge the Bogan, a personification of the dark side of the Force. Gand findsmen utilize techniques that outsiders view as directly related to the Force as well. For these cultures, the idea of the Force, however it is represented, is an accepted part of their identity. While it is natural for members from these groups to worship the Force, others from outside these cultures are drawn to Force worship as well.
[P]For sentients seeking purpose, turning to the Force can provide guidance. Whether their seeking is triggered by a general sense of meangingfullness or a specific, personal loss, the idea of the Force is a reassuring constant. For these individuals, the rituals, practices, and holy places of Force worship give direction. Making pilgrimages to established Force locations like Jedha, for instance, is frequently an integral part of these Force Adherents'' journeys. However, not all Force Adherents come to their worship for meaning or guidance.
[P]To those who have seen or heard about the incredible deeds of Force-users, such as the Jedi, worship of the Force tantalizes with the possibility of unlocking that strength. Unfortunately for thsoe who seek this power, not all individuals are sensitive to the Force. Regardless, those who pursue Force worship earnestly find a strength they can unlock within themselves.
[P]By developing their understanding of the Force, Force Adherents become more in tune with the galaxy. Even if they cannot tap into the Force directly, they learn to listen to the life around them; where most sentients hear only noise, Force Adherents hear the spiritual call and response of the entire range of beings in the area, In addition, Force Adherents'' meditative contemplation and training allow them to push their bodies past normal limitations. An unwavering belief in the providence of the Force can even eliminate fear of failure, because all is as the Force wills it.
[P]Force Adherent''s worship and training make them more-than-capable fighters, and their knowledge of the Force is practically unrivaled. Due to their enhanced perceptions and reflexes, they are capable of anticipating opponents'' actions in combat. They excel at evading attacks and delivering precise blows. Challenges to Force Adherents are challenges to the flow of the Force itself.' WHERE key = 'FORCEADHERENT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Force Sensitive Emergent[h4]

The Rebel Alliance stands for the restitution of the values and structures that were set aside during the rise of Emperor Palpatine. As Force users have been among those persecuted under the Imperial regime, many of them sympathize with the goals of the Rebellion. As a result of this, one of the Rebel Alliance''s most underestimated assets is a cadre of amateur Force-sensitives who could prove decisive in the struggle against the Empire. Or at least, they would be if they were properly identified and trained.

[P]Within the ranks of Rebel organizations, Force-sensitives are safe from the Empire and have access to one of the few remaining societies in the galaxy that still openly acknowledges and encourages an understanding of the light side of the Force. While the Jedi Order has been shattered by the Empire, there are many within the Rebel Alliance who remember them and their teachings. While few Force-sensitives are ever fortunate enough to receive training from an actual Jedi, at least in the Alliance they can learn about the Order''s traditions and techniques from sympathetic sources.

[P]While they were regarded by the citizens of the galaxy as a benevolent order dedicated to the promotion of peace and harmony throughout the galaxy, the Jedi Knights also had a well-deserved reputation as fierce warriors, particularly when it came to close-quarters fighting with their signature weapon, the lightsaber. While few Force-sensitives hope to develop such prowess, or come to possess a lightsaber of their own, they do tend to develop some skill at martial arts. In fact, a little training in hand-to-hand combat is recommended, both as a method of self-protection and because the associated regimen is said to help put one in the right frame of mind to contemplate the Force.

[P]The Force-Sensitive Emergent specialization does not have any career skills associated with it. When a character purchases this specialization, he automatically receives a Force rating of 1 (if he did not already have it). However, if the character already has a Force rating of 1 or higher, it does not improve when he purchases the Force-Sensitive Emergent specialization.

[P]Just like other specializations, the Force-Sensitive Emergent specialization can be taken at character creation or at any subsequent point. This represents the fact that some Force-sensitives do not become aware of their potential until a relatively late stage of their lives.' WHERE key = 'FORCESENSITIVEEMERGENT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Force Sensitive Exile[h4]

The Jedi are gone, the vast majority hunted down and destroyed by the Emperor and his minions. If any survive, they do so in hiding at the farthest edges of the galaxy. The Galactic Empire regards the ability to use the Force as a crime punishable by the harshest measures. In a few short decades, most of the galaxy has forgotten the Jedi, and dismissed the Force as an ancient religion. For many, this is by far the safest option.

[P]However, although the Empire has purged the Jedi, not all who use the Force have been hunted down and killed. The galaxy is simply too large to track down every Force-sensitive being, and the Emperor''s infamous Order 66 and the hunts that followed primarily concerned themselves with pursuing true Jedi and their descendants and allies. In the hidden corners of the galaxy, those who can touch the Force remain hidden, hunted, and outcast... but alive.

[P]The Force Sensitive Exile specialization does not have any career skills associated with it. However, when a character purchases this specialization, he automatically receives a Force rating of 1, if he did not already have it. If he already has a Force rating of 1 or higher, it does not increase.

[P]Although technically someone is Force sensitive from birth, it can take a great deal of time for him to realize he has this power. For this reason, the Force Sensitive Exile specialization can be taken during character creation or at any later point, just as any other specialization.

[P]The Force Sensitive Exile is not just any Force-sensitive being; he is one who survived the purges. He may have been a young Padawan or even a minor Jedi who managed to flee the Empire and hide. He may also have been a child, hidden by friends or family. Whatever the case, he''s spent the last decades in a hostile galaxy. His formal training is likely to be limited or even non-existent, and he uses his powers carefully or not at all. Even his mastery of the Force is shaped by his experiences—his powers focus more around concealment and control than flashy displays of ability.' WHERE key = 'FORCESENSITIVEEXILE' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Force-Sensitive Outcast[h4]
The Jedi and the Sith are not the sole masters of the Force. The Force awakens in all manner of beings from all walks of life, and while many Force sensitives are discovered by the Jedi—or on rare occasions, by the Sith—no one can say how many go unrecorded. Some Force sensitives receive training in the ways of the Jedi or Sith only to leave in pursuit or their own agendas, whether by choice or expulsion. These are the Force-Sensitive Outcasts, the independent Force users who stay on the outskirts of the galaxy and reject the dogma of the Jedi and the Sith. With a lightsaber at their side and the power of the Force at their fingertips, a Force-Sensitive Outcast is master of their own destiny. [B]A character who purchases this specialization gains a Force rating of 1.[b] If they already had a Force rating of 1 or higher, it does not increase.
[H4]A LIFE ON THE EDGE[h4]
[P]Life isn''t easy for a Force-Sensitive Outcast, who must contend not only with the political might of the Republic and the Separatists, but also with the reach of the Jedi and the Sith. Many characters who forge their own path do so as smugglers, bounty hunters, or criminals, using their talents to gain wealth or influence outside of the law. Yet, a Force-Sensitive Outcast is not necessarily an outlaw at heart, and their clashes with Republic authority may stem from personal conflicts with the Jedi Order.
[P]The doctrine of the Jedi is not welcoming to everyone, and the restrictions on attachment often conflict with a Force-Sensitive Outcast''s values. Some Padawans are naturally adept with the dark side of the Force, strongly feeling its pull no matter how hard they try to heed their masters’ teachings. In rare cases, a Force user might receive training from a Sith Lord, whether within the confines of the Rule of Two or as a secret apprentice. Other Force users might find that their desire for freedom outweighs the benefit of having a mentor leading them to choose the self-taught path. This may eventually bring them into contact with the Jedi or Sith—if that is the will of the Force.
[P]The reach of the Jedi is long, but not all-encompassing. Those who have rejected the Jedi or evaded or refused recruitment are masters at survival and subterfuge, using the Force and their own self-sufficiency to help them persist in a harsh galaxy. Experience is an effective teacher, and Force-Sensitive Outcasts are uniquely situated to learn all manner of tricks and tactics. Despite having little or no proper training in the ways of the Force, such iconoclasts may have skills that rival or exceed those of Jedi in certain areas.
[P]Due to the abundance of Force users during the time of the Republic, it is possible for a non-Jedi to acquire a lightsaber. The blade of a fallen Jedi has been known to appear on the black market, and those who train with the Jedi or the Sith often walk away with their own lightsaber, regardless of the circumstances of the parting. However a Force-Sensitive Outcast acquires such a weapon, it becomes a tangible symbol of their unique talents.
[P]Many of a Force-Sensitive Outcast''s combat skills are likely self-taught, making their battle techniques diverse and unpredictable. They often fight with a pieced-together combination of different formal lightsaber styles, remembering elements of their training (if they had any) and the maneuvers of other lightsaber-wielding combatants, and incorporating them into traditional sword-fighting techniques—with a fair amount of improvisation. A Force-Sensitive Outcast may be a less refined warrior than a Jedi or Sith, but they are no less deadly.' WHERE key = 'FORCEOUTCAST' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Fringer (reSpecialized)[h4]
[B]FRINGER—DISCOVER POSSIBILITIES[b][BR]
[B]At a Glance[b][BR]
The Fringer is an odd duck of “knowing where to be and knowing where not to be”. Find the way, and the way out. That translates to solid piloting, good negotiating and “fixing,” good at getting out of the way when the blaster bolts start flying.[BR]
[B]All-in or Hybrid?[b][BR]
Super Hybrid, likely a 1/4 Generic Danger avoidance, 1/4 Astro & Spaceflight, 1/4 Social Navigation, ¼ Literal Generalism[BR]
[B]What Should it be the Best At?[b][BR]
Avoiding the dangers of being on the fringe[BR]
[B]What should it be just “good” at?[b][BR]
Piloting[BR]
Astrogating[BR]
Underworld-flavored Negotiations[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Trader[i][BR]
[I]Navigator[i][BR]
[B]Media Touchstones[b][BR]
Mad Max/Furiosa[BR]
Luke Skywalker (circa Episode IV: A New Hope)[BR]
Updated 12/10/2025' WHERE key = 'FRINGER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Gadgeteer (reSpecialized)[h4]
[B]GADGETEER—CONNOISSEUR OF TECH[b][BR]
[B]At a Glance[b][BR]
Gadgeteers are masters of weapons and equipment used in the process of tracking, capturing, and eliminating their targets.[BR]
[B]All-in or Hybrid?[b][BR]
40% Weapon-agnostic Combat, 40% technologist, 20% imposing figure[BR]
[B]What Should it be the Best At?[b][BR]
Using a wide variety of weapons and excelling equally with all of them[BR]
Making on-the-fly adjustment to armament.[BR]
[B]What should it be just “good” at?[b][BR]
Being Imposing[BR]
General Mechanics[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Outlaw Tech[i][BR]
[I]Modder[i][BR]
[I]Armorer[i][BR]
[I[Enforcer[i][BR]
[I]Vanguard[i][BR]
[B]Media Touchstones[b][BR]
Boba Fett (Episode V: Empire Strikes Back)[BR]
Cad Bane (The Clone Wars)[BR]
Din Djarin (The Mandalorian)[BR]
Jango Fett (Episode II: Attack of the Clones)[BR]' WHERE key = 'GADG' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Gambler (reSpecialized)[h4]

[B]At a Glance[b][BR]
The Gambler is the risk-taker, the card-shark, the character in any group that’s willing to put it all on red for a big win.[BR]
[B]All-in or Hybrid?[b][BR]
½ Generic gambling-related dice futzing, ½ actual gambler, slight of hand, and deceptive elements[BR]
[B]What Should it be the Best At?[b][BR]
Deception and Sleight of Hand[BR]
Gambling[BR]
Going Big and paying off (not in Ships)[BR]
[B]What should it be just “good” at?[b][BR] 
Computers[BR]
Initiative/Cool[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Thief[i] (Mostly the sleight of hand stuff)[BR]
[I]Scoundrel[i] (generic Smuggler stuff)[BR]
[I]Hotshot[i] (pushing your luck mechanics)[BR]
[B]Media Touchstones[b][BR]
Lando Calrissian[BR]
James Bond (Casino Royale)[BR]' WHERE key = 'GAMBLER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Gunner (reSpecialized)[h4]
[B]GUNNER—PITHY DESCRIPTION[b][BR]
[B]At a Glance[b][BR]
The Gunner should be the expert at using vehicle based weaponry to tackle the opponents whether it be the main gun of a tank, the turret of a starfighter, or a capital ship turbolaser.[BR]
[B]All-in or Hybrid?[b][BR]
⅓ using heavy and Gunnery weapons as a precision “space sniper", ⅓ using gunnery weapons as a bombastic " heavy”, ⅓ being Tanky, but not armored..[BR]
[B]What Should it be the Best At?[b][BR]
Gunnery. These guys should be able to bullseye a womp rat without a targeting computer.[BR]
Bombing runs. The Gunner should be the best combat bomber.[BR]
[B]What should it be just “good” at?[b][BR]
Ranged Heavy and other “heavy weapons” outside of a ship[BR]
Being tanky[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Racer[i](Should be the inverse with Racer being mostly about movement and using the vehicle itself offensively, the Gunner should be all about weapons and barely any actual piloting or driving)[BR]
[I]Heavy[i](The Gunner should be more about specific ship combat and less about personal-scale combat.)[BR]
[I]Rigger[i](Treats their vehicle like a character, where this tree treats the party mascot like a vehicle. Similarities in tone)[BR]
[B]Media Touchstones[b][BR]
Any scenes with the Falcon’s gunner positions; Tobias Beckett, Han, Luke, Finn etc[BR]
Baze Malbus (Rogue One)[BR]
Wrecker (The Bad Batch)[BR]' WHERE key = 'GUNNER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Gunslinger (reSpecialized)[h4]

[B]GUNSLINGER—DOUBLE-TAP[b][BR]
[B]At a Glance[b][BR]
The most skilled small-arms combatants. The fastest draw, the deadest shot. They can take down an army of sleemos before they can even blink.[BR]
[B]All-in or Hybrid?[b][BR]
¾ Ranged Light and “Small Arms Efficacy”, ⅛Outlaw Vibes, ⅛ Initiative Monkey skills”[BR]
[B]What Should it be the Best At?[b][BR]
Ranged Light[BR]
Two-Weapon Fighting[BR]
[B]What should it be just “good” at?[b][BR]
Initiative[BR]
Being Intimidating[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Marshall[i](They are mirrors of one another. Marshall is an off-face that can shoot. Gunslinger is a killer who looks mean)[BR]
[I]Warleader[i](Only share overlap in their ranged light focus, but aren’t “damage” oriented)[BR]
[I]Death Watch Warrior[i](Less focused on movement, but they will have a similar emphasis on death-dealing)[BR]
[I]Bodyguard[i](Mostly worried about protection and retaliation, but a similar focus on one-handed weapons)[BR]
[B]Media Touchstones[b][BR]
Cobb Vanth (The Mandalorian)[BR]
Tobias Beckett (Solo: A Star Wars Story)[BR]
Cad Bane[BR]
Zoe Washburne (Firefly)[BR]
[I]Updated 12/10/2025[i]' WHERE key = 'GUNSLINGER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Healer[h4]
[B]CAREER + SPECIALIZATION POWERS:[b] Influence, Move, Heal/Harm, and Protect/Unleash.
[P]

Consulars are often drawn to their career by a strong sense of compassion. In many, this is expressed by a desire to mitigate bodily harm and cure the sick. A Healer trains to do so, recognizing that helping the individual can be just as important as helping the entirety of galactic civilization.

[P]Healers gain access to the additional career skills of [B]Discipline, Knowledge (Education), Knowledge (Xenology),[b] and [B]Medicine[b]. If this is the character''s starting specialization, he may choose two of these skills and gain one free rank in each without spending starting experience.

[P]For some physicians, healing is focused entirely on the problems of the body. They treat injuries with a detached, clinical approach. A Healer, however, is driven by compassion and affinity with the Force. Because of this, a Healer takes a holistic approach toward medicine. Many Healers learn techniques that use the Force to fuel the body''s natural recuperative abilities—sometimes transforming a potentially lethal injury into one that is survivable. They also seek to calm and heal the wounded spirit just as thoroughly as healing the wounded physical form.

[P]Many Healers have very strong philosophical compunctions against physical violence. As they spend so much of their lives attempting to heal injuries, they can be extremely reluctant to inflict them. Consequently, those who study this specialization exclusively are less likely to gain abilities that are devoted to combat. Some Healers, however, can take the time to develop defensive techniques, believing that dangerous situations are often the ones in which they are most needed.' WHERE key = 'HEALER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Heavy (reSpecialized)[h4]
[B]HEAVY - WALL OF MEAT AND BULLETS[b][BR]
[B]At a Glance[b][BR]
The Heavy lays down the heavy fire, heavy armament, and does it while being a veritable wall of meat.[BR]
They are by far, the highest raw damage output of all Hired Guns, but probably every.[BR]
[B]All-in or Hybrid?[b][BR]
½ Tank, ½ Spank. Very little utility outside of that.[BR]
[B]What Should it be the Best At?[b][BR]
Using heavy weaponry (mostly blasters)[BR]
Carrying Heavy Things[BR]
Soaking Damage[BR]
[B]What should it be just “good” at?[b][BR]
Ship-based Combat[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Gunner[i](Less about taking out ships larger than their own/whittling them down. More about generic firepower superiority.)[BR]
[I]Rigger[i](Applies personal tankiness, rather than shipboard tankiness)[BR]
[I]Vanguard[i](More about being an unmoving personal mortar than a “stick and move” dodge tank.)[BR]
[B]Media Touchstones[b][BR]
CT-782 “Hevy” (The Clone Wars)[BR]
Paz Vizsla (The Mandalorian)[BR]
Baze Malbus (Rogue One)[BR]
Wrecker (The Bad Batch)[BR]
Wrex (Mass Effect)[BR]
Updated 12/10/2025' WHERE key = 'HEAVY' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Hermit - Communing with the Living Force[h4]
While most Seekers are often solitary and self-reliant by nature, some go beyond this simple tendancy toward reclusion and desire to operate independently. A life isolated from the impositions and irritations of outsiders is instead the goal for them, so that they can develop their abilities and connections to the Force in relative calm. Free from outside distractions, these Hermits can further themselves in ways previously unimaginable to them. Those who can be convinced to rejoin society can be of great value, ont only int heir use of the Force but also in dealing with wilderness survival and deadly creatures.
[P]For Hermits, solitude is not necessarily a result of abhoring social interactions or lacking any skills with them. Some Hermits might ahve even sought remote life to escape from outside entanglements. They may have had crushing debts, had bounties placed on their heads, or even deserted from the Imperial military. Hermits who desire seculsion after discovering their nescent Force abilities may use their isolation to more fully concentrate on uncovering the secrets of their mysterious new powers. Meditation can not only help them become more in tune with the Force, but also strenthen their connection with nature and the surrounding wildlife.
[P]Hermits are not only solitary and self-reliant, but also seek to maintain their isolation against intruders and others who would disturb their reclusive existence. Some even hone their ability to avoid others to a great extent, the better to escape unwanted attention. To represent this, Hermits recieve [B]Discipline[b], [B]Knowledge (Xenology)[b], [B]Stealth[b], and [B]Survival[b] as additional career skills, allowing them to better develop their connections not only with the Force, but also with local flora and fauna. Characters who select this as their starting specialization may choose two of these skills and gain one free rank in each without spending starting experience.
[P]Despite their previously isolated ways of life, Hermits are powerful additoins to groups. When parties are stranded in harsh environments, whether sweltering jungles or barren ice wastelands, Hermits likely feel they are returning to their homes. Many find such locations more relacing than the intense industry adn frantic pace of typical cities especially in Core Sytems. Their skills in dealing with these wilderness regions makes them invaluable for ensuring the party''s survival when the characters venture into the wilds.
[P]Hermits'' skills in uncivilized areas also comes into play when facing dangerous animals or untamed creatures the group desires to use as steeds. Lving in the wild, Hermits often develop close bonds with their fellow creatures and can form companionships that might last lifetimes. Many of these Seekers use their Force abilities, possibly unconciously, to strengthen established connections with animals as well as to form new ones.
[P]Despite having lived in isolation for long periods, Hermits are not unprepared for conflict. Most have maintained themselves well, simlpy in order to survive in an unforgiving wilderness where weather and even local plant life can be as hostile as any sentient enemy. Dealing with dangerous creatures and honing themselves to avoid such attacks can turn Hermits into equally dangerous combatants. Overall, this solitude can build powerful individuals, able not only to thrive in the harshest of environments but also to aid others unprepared for life outside advanced urban settings.' WHERE key = 'HERMIT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Hotshot (Respec1.0)[h4]
[B]HOT SHOT - NEED FOR SPEED[b][BR]
[B]At a Glance[b][BR]
The Hotshot is the human embodiment of “brightest stars burn fastest,” - The Hotshot is meant to be flashy, effective, and most importantly, risk-oriented. They will take down the bad guy or die trying, or both. They have the highest highs and the lowest lows of all Pilots, and excel when they’re on a hot streak.[BR]
[B]All-in or Hybrid?[b][BR]
½ at mastering piloting a craft, ¼  at using said craft to blast the enemy to little pieces, ¼ Tempting Fate[BR]
[B]What Should it be the Best At?[b][BR]
Piloting, they should outclass nearly every other pilot in the game in raw skill.[BR]
Taking risks to defeat the enemy.[BR]
[B]What should it be just “good” at?[b][BR]
General flying[BR]
High-speed antics[BR]
Keeping their cool in high-stress situations[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Blockade Runner[i](Generally as evasive, but only because of significant skill difference and not because of talents that make them harder to hit)[BR]
[I]Racer[i](All about going fast and being effective. Racers are all going fast and avoiding certain death, not about ensuring others’ certain death)[BR]
[B]Media Touchstones[b][BR]
Luke Skywalker[BR]
Wedge Antilles[BR]
Anakin Skywalker (minus force stuff)[BR]
Jeff “Joker” Moreau (Mass Effect)[BR]
[I]updated 12/11/2025[i]' WHERE key = 'HOTSHOT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Hunter[h4]

Far from the civilized parts of the galaxy, there are many predators that can endanger sentient life. Some of these are animals that prey upon anything digestible. Others are malicious and twisted individuals who enjoy a savage and bloodthirsty existence. Hunters are Force adepts who are uniquely capable of tracking, confronting, and slaying these creatures, particularly those who hide in the wilds, far from civilization.

[P]Hunters acquire [B]Coordination, Ranged (Heavy), Stealth,[b] and [B]Vigilance[b] as additional career skills. If this is the PC''s starting specialization, he chooses two of these skills and gains one free rank in each. These ranks do not cost experience. Hunters need to be able to sneak up on their targets, move through difficult terrain, and be constantly alert to their surroundings. Many hunters train with ranged weapons so that they can strike their targets from far away.

[P]Most Hunters initially embark upon their careers focused on animal prey. Few, however, engage in this practice out of a desire to prove their mettle or a thirst for blood. Rather, their connection to the Force often lets them differentiate between predators that hunt out of necessity from those that are actively malicious. A Hunter does not normally interfere in the natural cycle of life, but he''s more than willing to restore balance by eliminating a predator that kills needlessly and destroys natural habitats. Sadly, these foul and twisted animalistic intelligences also have their parallels within sentient beings. All too often, a Hunter finds himself hunting intelligent quarry; this can prove to be the most dangerous game of all.' WHERE key = 'HUNTER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Imperial Academy Cadet - Rebellious Students[h4]
The Empire trains cadets to be effective and unquestioning soldiers. To its dismay, some of its most promising students are not willing to blindly obey. For many of the former espiring Imperial pilots, officers, and stormtroopers who have deserted after gaining firsthand exposure to the Empire''s practices, the Empire is an undeniable evil that must be opposed.
[P]The additional career skills a PC receives when taking the Imperial Academy Cadet universal specialization are [B]Knowledge (Warfare), Leadership, Piloting (Space),[b] and [B]Ranged (Light)[b]. Having left their training institutions at some point in their past, these PCs are ready to fight against an Empire they once believed in, but now believe only that it must be overthrown.
[P]To many individuals in these times, the Empire represents stability and order. It is responsible for having saved them from the Seperatists and the traitorous Jedi Order. The Imperial military, specifically, offers opportunities to serve that body in addition to the promise of patriotic fulfilllment, exploration, and power. For those who haven''t experienced the Empire''s oppression, these can be powerful motivators to join up. Many adventurous souls desiring to escape the inevitability of a life without excitement or advancement have looked to the Imperial academies as a way to venture into the wider galaxy. Depending on the academy, however, even getting accepted can be a highly competitive affair, in which only the most naturally talented candidates have a chance-unless, of course, a candidate''s family is connected.
[P]Once a cadet is accepted, the glowing veneer of the Empire can begin to flake away. While cadets have the opportunity to gain knowlege in a variety of fields, the study of warfare is the most heavily emphasized. A select few are groomed to become pilots, but many only benefit from the combat training to become stormtroopers. During training, instructors often encourage and even reward peer sabotage in order to foster callous behaviour and direct their charges'' loyalty only to the Empire. Despite this practice, unyielding cadets occasionally emerge who did not resort to such underhanded tactics and refused to be properly molded during training. When these cadets come to the attention of their instructors, however, it is not uncommon for them to suddenly vanish.
[P]For some who remain, knowing that their life will consist of following strict orders, regardless of the harm to peaceful civilians, quenches any desire to continue. After participating in theoretical or training operations to suppress unruly citizens, it becomes impossible for such cadets to ignore these operations in practice. For those who abandon the military but don''t rebel immediately, the continued abuse they witness can be more than enough to motivate them to join the resistance movement. A few rebel cells have been known to assist disillusioned cadets in their defections. After fleeing their academy, former cadets are able to see the transgressions they may not have noticed before joining.
[P]Imperial Academy Cadets are effective agents against the Empire because their training helps them to anticipate and exploit the Imperials'' common tactics. Any mechanical blueprint a rogue cadet has been exposed to becomes a liability to the Empire. Any glimpsed prototypes lose their element of surprise, and any protocol learned can be exploited for covert missions. To disrupt the enemy, one must know the enemy, and these cadets know the Empire all too well.' WHERE key = 'IMPERIALACADEMYCADET' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4] Infiltrator (reSpecialized)[h4]
 [B]Infiltrator - Finding the Secrets[b][P]


When most people hear the word Spy, the operatives of this specialization are what come to mind. Infiltrators endeavor to place themselves in the very den of the beast, usually sneaking or lying their way in undetected. All too often, Infiltrators face the worst possible odds without the benefit of direct backup, and frequently without a way out if they are discovered by the wrong people at the wrong time.

[P]Infiltrators gain [B]Deception, Melee, Skulduggery,[b] and [B]Streetwise[b] as their additional career skills; taking this as the first specialization for a PC grants a free rank in two of these skills. Masters of covert work, Infiltrators know how to con or lie their way past almost anyone, and they know all of the tricks necessary to break into and out of secure locations, as well as everything else needed for underhanded operations. They tend to prefer silent and deadly attacks, often best accomplished with hand-to-hand weapons.

[P]An Infiltrator rarely relies upon brute force or direct confrontation to accomplish his goals. Instead, he uses stealth, guile, subterfuge, and disguise to integrate himself among his enemies. He gains access to sensitive areas, talks to the right people, and employs every other available tactic to obtain valuable information, steal important secrets and assets, and leave behind a target who is reeling from his efforts.

[P]Lately, Infiltrators are used by the Alliance as part of special strike teams sent throughout Imperial-controlled space, where they are used in combined operations intended to disrupt the Empire''s plans while gathering information at the same time. For more direct combat missions, Infiltrators tend to operate in a support role. When the mission calls for subterfuge and more covert operations, Infiltrators are often the ones in charge.' WHERE key = 'INFILTRATOR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Infochant[h4]
Please see User Data for details.' WHERE key = 'INFOCHANT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Instructor (reSpecialized)[h4]
[B]INSTRUCTOR—LISTEN UP MAGGOTS[b][BR]
[B]At a Glance[b][BR]
The Instructor is the small L squad leader, focused on the immediate group they are in charge of: Their training, their war-fighting, and their safety.[BR]
The instructor has many ways to do so: The hard Ass, the inspiring leader, or the protective mentor. All are valid, because some trainees need some tough love, and a good ass kicking[BR]
[B]All-in or Hybrid?[b][BR]
4-Way Hybrid: ¼ Leadership ¼ Coercion ¼ Teaching ¼ Protecting[BR]
[B]What Should it be the Best At?[b][BR]
Military Small Squad Leadership[BR]
Teaching and Training[BR]
[B]What should it be just “good” at?[b][BR]
Armed Conflict[BR]
Protecting Allies[BR]
Being Imposing[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Marshal[i](The marshall is more about subdual than “Leadership” specifically, but they share the Leadership/Coercion space)[BR]
[I]Warden[i](The Warden is a defensive coercion character, which is pretty close. Obviously the Warden is more of a martial artist)[BR]
[I]Sepratist Commander[i](Coercion as Leadership is their core overlap)[BR]
[I]Warden[i](The teacher is more all-in on teaching and sharing skills and talents. The Instructor is more about being a Force-Multiplier in combat, but they share a similar core.)[BR]
[B]Media Touchstones[b][BR]
ARC Trooper CT-7567 “Rex”(Clone Wars, Rebels)[BR]
CT-9901 “Hunter” (The Bad Batch)[BR]
Vel Sartha (Andor Season 2)[BR]
“Gunny” Highway (Heartbreak Ridge)[BR]
Gunnery Sergeant Hartman (Full Metal Jacket)[BR]
Sgt. Lipton/Sgt. “Bull” Randleman (Band of Brothers)[BR]' WHERE key = 'INSTRUCTOR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Interrogator (reSpecialized)[h4]

[B] Interrogator - Ensuring Answers[b][P]
A portion of the most critical military intelligence is never officially documented. Some parts might not even seem like valuable information at first. A Slicer may never uncover a minister''s esoteric hobbies that could be used for blackmail. An Infiltrator might not recognize that an old plaque conceals a datachip loaded with secrets. Skilled Interrogators, however, can uncover secrets that their subjects might not even recognize they possess. Often, this requires that the subject be captured first, but some operatives are so skilled and subtle that they can extract secrets from targets through casual conversation without letting the targets realize what has happened. These specialists grant the Rebellion unexpected and unorthodox advantages that it needs to succeed against enormous odds.
[P]Interrogators acquire [B]Charm, Coercion, Medicine,[b] and [B]Perception[b] as additional career skills. If this is the character''s starting specialization, the player may choose two of these skills and gain one free rank in each without spending starting experience.
[P]In order to successfully question a target, an Interrogator needs to have some background info about the subject, possibly including personality traits, loved ones, and interests, in addition to knowing what type of information to seek. Personal history is critical to gaining leverage over a target. Interrogators must be versed in a range of information extraction techniques so that they can determine the best method for a particular foe. Physical coercion can work effectively against some enemies, but for others, psychological attacks are far more efficient. Recognizing the best technique and having the appropriate tools readily available makes each interrogation faster and the results more reliable.
[P]A physically imposing questioner may rely upon violence, and this technique can sometimes be effective. However it is invariably cruel. Further, Imperial officers are trained to resist these techniques, reducing their efficacy. Additionally, some subjects recognize that the consequences for giving in to this type of torture can be as severe as those for resisting it. For these reasons, the most effective of interrogations eschew physical techniques for social ones.
[P]Many Interrogators instead use a combination of Charm and Deception to effectively draw information from their subjects. They may intimidate through threats—often to the subject''s friends, family, or special interests—rather than direct violence. Demonstrations of power over those other parties can provide additional leverage, though such demonstrations may be fabricated as necessary.' WHERE key = 'INTERROGATOR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Investigator - A Living Chronicle[h4]

Investigators examine unsolved crimes, using their knowledge and skills to figure out the who, what, when, where, and why. They don''t seek this information merely to satisfy some obsession over the ufly side of society but rather to honor the victims by bringing the perpetrators to justice.
[P]Investigators receive [B]Knowledge (Education)[b], [B]Knowledge (Underworld)[b], [B]Perception[b] and [B]Streetwise[b] as additional career skills. Characters who select this as their starting specialization may choose two  of these skills and gain one free rank in each without spending starting experience.
[P]Investigators piece together what has been lsot or stolen by uncovering the past. Weaving the stories of what happened into a living chronicle, they discover secrets and untangle lies. Only by undertandint the how and why of a crime can Investigators bring the one who did it to justice.
[P]Since crimes are inflicted upon (and inflicted by) people these acts leave an impression in the Force. Particularly violent crimes leave a stron disturbance. Extremely evil crimes leave a wound—a cold, dark space that frightens the unwary and consumes the foolhardy. Investigators can tease out details from those impressions, unwinding them so they can heal. In many ways, investigators are physicians for the souls of communities, solving festering mysteries, airing out toxic secrets, and cauterizing hidden crimes.
[P]These violent impressions can also affect individuals. Even if they haven''t witnessed the crime in question, investigators have heard rumors, have felt their community suffer, and can read their peers with the insight of an insider. In many ways, a community functions as a single, living organism, and damage to that organism reverberates in both predictable and surprising ways. By tracing those symptoms, Investigators get to the source.
[P]Investigators have many tools in their kits besides the Force. Understanding the local customs and language, being familiar with the unspoken rules of a community, and knowing how to bluff their way into a back-room requires knowledge and social skills. Slicing a security camera picking a lock to search an apartment, or staking out a person of interest in an investigation means breaking laws without getting cuaght. And sometimes—oftentimes—successfully sneaking into and out of a building can bring the Investigator one step closer to the truth.
[P]The greatest tools of Investigators, though, can often become their greatest weaknesses. Their emotions can help them understand a person''s motives giving context to a fact. If a perpatrator killed a dangerous drug lord, is that persona  murderer or a savior? However, emotions can cloud an investigator''s judgement. If the good friend who saved a life turns out to be a slaver, is it betrayal to turn that friend in? Finally, the constant exposure to suffering can burn out even the most stalwart Investigators.
[P]In the final analysis, Investigators see crime and victimization as a corruption of the Force. They feel the Force as something that flows through people, affecting their health, psychology, and well-being. A corruption of the Force makes people angrier, more fearful, and more likely to lash out and harm others. These constant cuts caused by crime chip away at a society wouding the Force until the whole society falls to the dark side. Airing out the source of the wound allows the society to finally heal.' WHERE key = 'INVESTIGATOR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Juyo Berserker - Controlled Rage[h4]

In the latter days of the Jedi Order, Padawans studied six forms of lightsaber combat, ensuring familiarity with all. Few Jedi, however, were trusted to study the seventh, the highly restricted Juyo form. The Juyo Berserker is a Warrior who fights with this dangerously aggressive and ferocious manner of lightsbaber combat. A Juyo Berserker could have formal training in Form VII, but the specialization can also apply to a self-taught fighter who harnesses natural rage and ferocity to overcome foes with an all-out offensive.
[P]Juyo Berserkers receive [B]Coercion, Discipline, Lightsaber,[b] and [B]Melee[b] as additional career skills. If this is the character''s starting specialization, the player chooses two of these skills and gains one free rank in each, without spending starting experience. While Juyo is undoubtedly an aggressive form of combat by the standards of the Jedi, it nonetheless requires at least the modicum of control necessary to wield a lightsaber effectively and—relatively—safely. Compared to the other lightsaber forms in use by the Jedi in the latter days of the Republic, however, Juyo is reckless. Walking this fine line is not dissimilar from the way in which Juyo practitioners balance dangerously close to the dark side of the Force.
[P]While a Juyo practitioner may appear calm, the form requires intense emotions to fuel its rapid, unpredictable, powerful strikes. Some Juyo Berserkers—particularly adherents of the Jedi Code, which calls for tranquility and detachment—conceal the emotions raging below the surface. Others, including Sith, fully embrace the anger that drives Juyo and grants it power, snarling like frenzied animals as they lay into their opponents.
[P]For Force sensitives in the age of the Empire, it is all too easy to give in to frustration, anger, and hate when forced into a confrontation. They might unknowingly find themselves mimicking the Juyo style. These sentients might be aware of the conflict raging within them—the struggle between unbridled emotion and stability—or they might remain dangerously ignorant of the path to the dark side of the Force.
[P]A Juyo Berserker focuses on offense nearly to the exclusion of all else. This approach leaves the Berserker vulnerable should an opponent find the opportunity to counterattack, and so a Juyo practitioner must match the foe''s skill in pure ferocity. Juyo fighters particularly risk being overwhelmed by greater numbers; a Berserker must be able to lay about with the blistering relentlessness of many Warriors—or of the deadly predator from which the form draws its name.
[P]Jedi who practiced Juyo were careful to balance inner darkness with the tranquility offered by the light side of the Force. It was in this way that Mace Windu developed the Vaapad variant, a form that allowed him to channel his inner darkness toward positive outcomes, to harness his anger without allowing it to control him, For Warriors bereft of the doctrines of the Jedi this balance is difficult. Without it, a tragic outcome could be all but inevitable.' WHERE key = 'JUYO' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Knight[h4]
A Jedi Knight serves as warrior, diplomat, ambassador, and scholar, leading clone troopers to repel the droid army of the Confederacy of Independent Systems. In many ways, Knights act as the face and symbol of the Republic, more so than the clone troopers, and perhaps even more than the Senators and representatives in the Galactic Senate. While their numbers are few compared to the total population of the galaxy, the Jedi, as a whole, affect billions of lives.
[P]Knights receive [B]Cool, Leadership, Lightsaber,[b] and [B]Negotiation[b] as additional career skills. Characters who select this as their starting specialization may choose two of these skills and gain one free rank in each without spending starting experience. The practical, hands-on nature of a Jedi Knight utilizes such skills as they move toward, into, and out of trouble. [B]A character must have a Force rating of 2 or higher in order to take the Knight specialization.[b]
[P]Jedi Knights are guardians of peace and justice. Through acts of chanty, assistance, teaching, and in some cases, fighting in another''s defense, the Jedi Knights serve the people of the Republic. When Jedi render aid and express compassion, this motivates others to do the same. The Force exists in all living beings, and the suffering of those beings affects the Force. In addition, Knights serve as the general public’s primary guide to the Force and as living examples of what one can accomplish by accepting the Force.
[P]Knights must also serve with stoicism, to avoid letting their emotions overwhelm them. Even in times of peace, Knights regularly decide when Padawans, other Knights, and soldiers should risk their lives for a greater good. Fear of failure or death cannot cloud their judgment. Yet, Knights must take care not to fall into cold indifference, sacrificing lives as if they were mere numbers to be placed in a casualty report.
[P]Taking on the role of a Jedi Knight means taking command of the troops, of the situation, and of one''s self. With a whole galaxy in turmoil, a Knight must combat the hesitation and confusion in themself and in others. The people need leadership, and Knights who doubt themselves cannot serve the people.' WHERE key = 'JEDIKNIGHT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Magus - Following a Different Path[h4]
To hear of a Magus, even during the time of the Galactic Republic, would be a rare event; to meet one, even more so. The Jedi Order, in its waning days, had become quite conservative regarding explorations into the Force. The Jedi either avoided or outright fought the myriad of sects and cults exhibiting mystical powers throughout the galaxy. The Force, they reasoned, was all they needed. Other teachings and experiments deviated too much from the clear path of the Jedi and thus danced too close to illusion and self-deception, leading to temptations toward the dark side of the Force.
[P]Paradoxically, a Force user may be more likely to become a Magus during the Galactic Civil War. With hope and the light in short supply, some disciples may be more open and willing to seek out so-called forbidden knowledge. A Magus develops and collects a hodgepodge of strange rituals and odd practices to commune with the Cosmic Force. They have no training, but at the same time, they have no teachings that would convince them not to try. The danger, of course, comes from a lack of oversight. Without a guiding hand or proper self-reflection, a Magus has a greater chance to experiment with powers fueled by the dark side of the Force.
[P]The Magus receives [B]Coercion, Discipline, Knowledge (Lore),[b] and [B]Medicine[b] as additional career skills. When starting with this specialization, the Magus may choose two of these skills and gain one free rank in each.
[P]Knowledge, especially forbidden knowledge, fuels the Magus. Unrestricted by the Jedi Order, defiant of the Galactic Empire, the Magus seeks a connection to the Force through knowledge. The source of that knowledge doesn''t matter; rituals, objects and places of power, and ancient religious and magical texts all hint at a singular source of energy. While some Magi crave knowledge for its own sake, most explore the Magus path in order to control the Force itself.
[P]If the Force flows through everything and is a part of everything, then by manipulating the Force, the Magus can manipulate reality. The Force can be used to make matter, affect matter. affect life. and perhaps...even create life. With this power, the Magus can do amazing and impossible things. No, not impossible, for nothing is impossible if one believes in the Force.
[P]This confidence, however, is the biggest trap for Magi. They can do impossible things, yes, but it is the Force that allows them to do so, not their knowledge or talent. Despite what they may think, Magi still have mortal trappings. They have histories, memories, early thoughts, and emotions that can never be truly removed. Hubris may be the greatest enemy for Magi. This hubris can trick Magi into thinking that pushing here or pulling there might be for the good of all, or for the good of the Force, but in reality, they are manipulating the Force for their own selfish needs. Many a Force-using tyrant became a Magus before falling to the dark side.' WHERE key = 'MAGUS' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Maintainer[h4][P]
[B]At a Glance[b][BR]
The Maintainer is the full service motor pool and armory technician that can fly a sortie in a pinch.[BR]
[B]All-in or Hybrid?[b][BR]
1/2 Generic Calibration & Repair[BR]
1/2 Ship Management[BR]
[B]What Should it be the Best At?[b][BR]
Taking gear from broken to Better than new[BR]
Performing ship-saving heroics mid combat[BR]
[B]What should it be just “good” at?[b][BR]
General Mechanics[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Mechanic[i] - As its replacement, they are going to share a ton of connectivity, mannerly in their focus on vehicles. The maintainer will have a bit more of an improvement angle, and less focus on skulduggery.[BR]
[I]Outlaw Tech[i] - Their overlap is less about that their working about, and more that they are all spit and polish kitbashers.[BR]
[I]Modder[i] - The Modder shares the general split between personal gear and vehicle focus. Where they differ is that the Maintainer is less worried about perfection of gear and more about basic functionality and minor improvements in the moment' WHERE key = 'MAINTAINER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Majordomo[h4]
Please see User Data for details.' WHERE key = 'MAJORDOMO' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Makashi Duelist[h4]

The presence and showmanship that can come naturally to all Mystics reflects itself in the way of a duelist. For practitioners of Makashi, dominating a combat through one''s presence is just as important as dominating it through martial prowess, and the Makashi Duelist is the ultimate expression of that art.

[P]Makashi Duelists acquire [B]Charm, Cool, Coordination,[b] and [B]Lightsaber[b] as additional career skills. If this is the character''s starting specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. This combination reflects the showmanship and presentation so intrinsic to the duelist''s art. A true Makashi Duelist must always fight with poise and grace, never showing the slightest strain and keeping complete control over his facial expressions and his body''s most minute movements.

[P]Though some detractors may dismiss this fighting style as overly foppish and vain, a Makashi Duelist remains an exceptionally potent combatant. Those detractors forget that the Makashi form was developed to fight against other lightsaber-armed opponents. At its heart, Makashi focuses on one goal: to meet an enemy with a sword or lightsaber and slay him. A true Makashi Duelist never loses sight of this goal, and all his flourishes and feints are but means to an end. Movements that work to deflect and exhaust an opponent—particularly if the foe is not prepared for battle with a Force-sensitive—can soon leave an enemy frustrated with the entire experience. As the opponent becomes increasingly worn down, the Makashi Duelist soon finds an opportunity to exploit the foe''s exhaustion.

[P]A Makashi Duelist''s force of personality, rather than natural athleticism, often drives his combat technique. Elements of personal flair become an effective means of disorienting and distracting an opponent during a battle. Sometimes a verbal misdirection can be every bit as effective as a physical one, leaving an opponent open to a single master stroke.' WHERE key = 'MAKASHI' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Marauder (reSpecialized)[h4]
[B]MARAUDER - LIVING BEAT STICK[b][BR]
[B]At a Glance[b][BR]
The Marauder is the master of hand to hand combat, king of killing, dishes out pain and shrugs it off in turn. If Star Wars has a Barbarian, it would be the Marauder.[BR]
[B]All-in or Hybrid?[b][BR]
4/5 Beats, 1/5 any other utility.[BR]
[B]What Should it be the Best At?[b][BR]
Beating face, and shrugging off damage[BR]
Actively killing and incapacitating[BR]
[B]What should it be just “good” at?[b][BR]
Any specific kind of combat[BR]
Survival[BR]
Coercion[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Colossus[i](Utilizing some of the survivability tools without going that hard on being literally unkillable.)[BR]
[I]Shi-cho Knight[i](Pulling from some of the “generalist fighter” aspects.)[BR]
[I]Executioner[i](Executioner)[BR]
[B]Media Touchstones[b][BR]
Black Krrsantan (Book of Boba Fett)[BR]
Drax (Guardians of the Galaxy)[BR]
Rama (The Raid 2)[BR]
Grog (Vox Machina)[BR]
Updated 12/10/2025' WHERE key = 'MARAUDER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Marshal (reSpecialized)[h4]
[B]MARSHAL—FRONTIER JUSTICE[b][BR]
[B]At a Glance[b][BR]
This character is the steely-nerved lawman, whether that be official or unofficial. They lay down the law with inspiring leadership, imposing stature and reputation, and most importantly, the blaster at their hip.[BR]
[B]All-in or Hybrid?[b][BR]
Three-way hybrid - Coercion and Leadership-focused sociality, Criminal-interaction, and ranged light shoot-em-ups[BR]
[B]What Should it be the Best At?[b][BR]
Transitioning from Combat to Social encounters. [BR]
Non-Lethal Takedowns[BR]
[B]What should it be just “good” at?[b][BR]
Ranged Light[BR]
Coercion[BR]
Criminal Element Interaction[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Gunslinger[i][BR]
[I]Warden[i][BR]
[I]Enforcer[i][BR]
[B]Media Touchstones[b][BR]
Cobb Vanth (Book of Boba Fett)[BR]
Jacobi Sterne (SWRPG - Far Horizons)[BR]
IG-11 (The Mandalorian)[BR]
Michael Girabaldi (Babylon 5)[BR]
Mulan (Li Shang)[BR]
[I]updated 12/11/2025[i]' WHERE key = 'MARSHAL' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Martial Artist (reSpecialized)[h4]
[B]MARTIAL ARTIST - UNARMED AND DANGEROUS[b][BR]
[B]At a Glance[b][BR]
A martial artist should be the master of both attack and defense, and movement while unarmed. They are defined by supreme grace and athleticism, and sheer force of will.[BR]
[B]All-in or Hybrid?[b][BR]
66% Unarmed Combat 34% Martial Utility[BR]
[B]What Should it be the Best At?[b][BR]
Unarmed Attacks, Crits, unarmed parrying[BR]
[B]What should it be just “good” at?[b][BR]
Swift Movement[BR]
Physical and Mental Defenses[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Steel Hand Adept[i][BR]
[I]Warden[i][BR]
[I]Marauder[i][BR]
[I]Colossus[i][BR]
[B]Media Touchstones[b][BR]
Qi’ra (Solo: Star Wars Story)[BR]
Arden Lyn (Masters of Teras Kasi)[BR]
Embo (The Clone Wars)[BR]
Spike Spiegel (Cowboy Bebop)[BR]' WHERE key = 'MARTIALARTIST' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Mechanic (reSpecialized)[h4]
[B]MECHANIC—Mr. Fix-it[b][BR]
[B]At a Glance[b][BR]
The default technical generalist in the setting, the mechanic equal parts cobbler, ship doctor, and technical problem solver.[BR]
[B]All-in or Hybrid?[b][BR]
½ Mechanics Problem Solver & Generalist, ½ Ship Doctoring[BR]
[B]What Should it be the Best At?[b][BR]
Broad-Spectrum Mechanic-ing[BR]
Ship Damage Repair[BR]
[B]What should it be just “good” at?[b][BR]
Crafting[BR]
Piloting[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Rigger[i][BR]
[I]Modder[i][BR]
[I]Artisan[i][BR]
[B]Media Touchstones[b][BR]
Anakin Skywalker (circa Episode I: The Phantom Menace)[BR]
Chewbacca[BR]
Peli Motta (The Mandalorian)[BR]
Updated 12/10/2025' WHERE key = 'MECHANIC' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Medic (reSpecialized)[h4]  

  [B]Medic - Save the Team[b]

[P]
The Alliance cannot afford to fight a war of attrition the way the Empire can. The enemy can pour thousands of stormtroopers and other forces into a meat-grinder of a battle, taking horrific casualties, without blinking an eye over its losses. Every soldier of the Rebellion is, on the other hand, a valuable asset whose loss Alliance High Command feels keenly. The Medic serves to prevent as many of those losses as possible.

[P]Medics go into the field with [B]Knowledge (Xenology), Medicine, Resilience,[b] and [B]Vigilance[b] as additional career skills; if this is the first specialization taken, two of these four begin with a free rank. Medics know how to keep their head when everyone else is panicking, and they know how to be prepared for any contingency. They are skilled at treating the wounds of anyone in their unit, regardless of species.

[P]Many folks think Medics are inherent pacifists. While a Medic might prefer to save a life rather than take it, most realize the necessity of fighting and violence for a greater cause, and are more than ready to strike down an enemy in order to save a comrade. Medics tend to see no one as expendable, which can make them difficult to deal with when a commander wants to pull a team out of a situation and there''s a chance any of those on the deck could still be alive.

[P]The vast majority of Alliance troopers greatly revere the Medics in their units, knowing these brave men and women are often the only thing standing in the way between them and death. Alliance Medics are famous for taking ridiculous risks in the middle of terrible battles just for the chance to save one more Rebellion fighter.' WHERE key = 'MEDIC' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Mercenary Soldier (Respec 1.21)[h4]
[B]MERCENARY SOLDIER - DIRTY DEEDS DONE DIRT CHEAP[b][BR]
[B]At a Glance[b][BR]
The Mercenary Soldier is the leadership-oriented hired gun, the head of a merc band, or the tactical lead on a covert op. They are extremely effective combatants, and even better at managing small-scale skirmishes.[BR]
[B]All-in or Hybrid?[b][BR]
½ Leadership, ½ Ranged Combat[BR]
[B]What Should it be the Best At?[b][BR]
Leading bands of “irregulars”[BR]
[B]What should it be just “good” at?[b][BR]
Ranged Combat[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Commando[i]
[I]Warleader[i]
[I]Tactician[i]
[I]Clone Lieutenant[i]
[I]Clone Soldier[i]
[I]Retired Clone Trooper[i]
[B]Media Touchstones[b][BR]
Barney Ross (The Expendables)[BR]
CT-9901 “Hunter” (The Bad Batch)[BR]
Rick Flag Sr (Creature Commandos)[BR]
Zaeed Massani (Mass Effect)[BR]
[I]updated 12/11/2025[i]' WHERE key = 'MERCENARY' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Modder (reSpecialized)[h4]
[B]MODDER—I Rewired It[b][BR]
[B]At a Glance[b][BR]
The Modder is a gear optimizer to the nth degree. They are a force multiplier for anyone with a ship or a gun.[BR]
[B]All-in or Hybrid?[b][BR]
⅔ Modding and Managing Gear, ⅓ Signature Vehicle stuff[BR]
[B]What Should it be the Best At?[b][BR]
Modding Weapons and min maxing their potential[BR]
Modding Vehicles[BR]
[B]What should it be just “good” at?[b][BR]
Crafting[BR]
General Mechanics[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Outlaw Tech[i](Modder is much more a pure mechanic speed, whereas the the OT is a bit more of a half-tech, half scum tree)[BR]
[I]Artisan[i](Artisan really is a generic ship doctor with a couple elements of increasing hard points and some crafting bits. Modder is all in on well…missing)[BR]
[I]Scavenger[i] (Scavenger is kind of what Outlaw spec should have been, minus the scavenger bits, but it has some overlap with modder by pushing the minmax vibe)[BR]
[I]Rigger[i](Rigger is more defensive and passive in how it interacts with the signature vehicle, also more all-in on Sig vehicle. Modder is split between vehicle and gunplay)[BR]
[B]Media Touchstones[b][BR]
Updated 12/10/2025' WHERE key = 'MODDER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Navigator - Guiding to Safety[h4]
Seekers are often at the forefront of exploration, pushing back the edges of the unknown across planets and systens throughout the galaxy. Most view the mission itself as more important than the plotting needed to undertake it, and determining its best method and route unimportant when compared to what awaits at the destination. Others, though, see these as perhaps at least as important, and certainly more personally rewarding. Navigators represent those Seekers who devote themselves fully to these aspects from charting hyperspace passages or plotting overland routes. No matter the enviornment, none can match Navigators when they set about deciding a course. When Navigators use the Force their abilities might even appear more reliant on fantastic luck than skill to the uninitiated.
[P]Navigators are often excellent pilots as well, but these Seekers are generally more interested in the best way for their vehicle to arrive safely an expeditiously than in its firepower or maneuverability. Some of these individuals may have spent their enitre lives in space, moving from ship to ship or working one specific area filled with hazardous asteroids or nests of black holes. Most travel extensively, regardless of their origins, always seeking out new uncharted regions in need of their abilites.
[P]Navigators recieve [B]Astrogation[b], [B]Knowledge (Outer Rim)[b], [B]Perception[b] and [B]Survival[b] as additional career skills, representing their skills at locating and mapping out pathways, both planetary and stellar. Characters who select this as their starting specialization may choose two of these skills and gin one free rank in each without spending starting experience. The addition of Astrogation allows Navigators to truly excel in outer space, where they can help ensure the group arrives speedily and accurately to distant star systems.
[P]Navigators are also excellent on planets, charting routes over sea, land, and air, as well as even orbital voyages. Their skills are especially critical on uncharted worlds, but they are  also valuable in urban settings, which can be as unfathomable as any dense jungle or endless steppe. When the PCs need to find the fastest, safest, or least conspicuous way to reach their destination, Navigators are whome they turn to invaluable in chases, whether the PCs are trying to run down their quarry or escape pusuit, Navigators can give a group the edge it needs by locating the most efficient route.
[P]Navigators are often driven to find such routes on their own, and might become irritated when inferior passages are used. Not resting until the best path is discovered and followed, they soon become bored when success is achieved, as there is no challenge in following an established route. For some Navigators, this is a never-ending quest, and they are always seeking to shave just one light year from a hyperspace lane, or an hour from a city crossing, somethingn that can always happen as they become more proficient with the Forc. The Force can also allow them to offer guidance of a less tactical and more spiritual nature at times as well, something that can also aid the PCs in their adventures.' WHERE key = 'NAVIGATOR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = 'The Nerf herder is the animal husbandry maximalist, and the outdoors person who can shepherd a flock of animals in the most inhospitable situations.' WHERE key = 'NERFHERDER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Niman Disciple[h4]

Even the most accomplished of negotiators can see negotiations fail and come to violence. In the time of the Republic. many Jedi peacemakers trained with the lightsaber to prepare themselves for that eventuality. Today, Consulars who wish to do the same can focus on self-defense and gain a working knowledge of lightsaber combat by following the path of the Niman Disciple.

[P]Niman Disciples gain the additional career skills of [B]Discipline, Leadership, Lightsaber,[b] and [B]Negotiation,[b] and if this is the PC''s starting specialization, the PC gains one rank in each of two of these skills. They remain focused on working with groups of individuals to come to a peaceful accord, but they acknowledge that the road to that accord may be fraught with danger. These skills can make surviving in a treacherous environment much more possible.
[P]Due to Consulars'' naturally compassionate nature, this path centers on developing defensive measures in concert with negotiation techniques. In general, the associated combat techniques are focused on survival and defense instead of attack. Also, due to the Consular''s emphasis on mental discipline and self control, the Niman Disciple puts more emphasis on integrating his Force abilities into his fighting style, using the Force as his ally to defeat dangerous foes.' WHERE key = 'NIMAN' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Operator (reSpecialized)[h4]
[B]OPERATOR—RIDE ‘EM DOWN, BRING ‘EM IN[b][BR]
[B]At a Glance[b][BR]
Operators are the masters of the vehicle-based, non-lethal takedowns. They track their targets, both on land and in space, ride them down, disable their vehicles, and take them in for a bounty.[BR]
[B]All-in or Hybrid?[b][BR]
⅕ Tracking & Navigation, ⅖ Piloting, and ⅖ nonlethal gunnery.[BR]
[B]What Should it be the Best At?[b][BR]
Nonlethal ship combat, disabling ships.[BR]
[B]What should it be just “good” at?[b][BR]
Flying Ships, especially in rough terrain[BR]
Astronavigation, Navigation[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Rigger[i][BR]
[I]Pilot[i][BR]
[I]Racer[i][BR]
[I]Navigator[i][BR]
[B]Media Touchstones[b][BR]
Jango Fett (Episode II: Attack of the Clones)[BR]' WHERE key = 'OPERATOR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Outlaw Tech (reSpecialized)[h4]
[B]OUTLAW TECH[b][BR]
[B]At a Glance[b][BR]
In a shell nut, the Outlaw Tech is a jack of all technical prowess, with a focus on shady or otherwise dangerous aftermarket modifications, and it''s very adept at navigating the criminal underworld to get them.[BR]
[B]All-in or Hybrid?[b][BR]
⅓ Tech generalist, ⅓ “Dangerous Improvement", ⅓ Underworld Fixing[BR]
[B]What Should it be the Best At?[b][BR]
Pushing weapons and gear in unexpected directions, often dangerously directions[BR]
Securing Materials and equipment for these illegal and nefarious purposes[BR]
[B]What should it be just “good” at?[b][BR]
Mechanics, generally[BR]
Underworld fixing[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Scoundrel[i](Has a bit of the underworld fixxer in common, but otherwise kind of the the generalist vibe)[BR]
[I]Mechanic[i](Both have significant overlap in terms of mechanic generalist, but mechanic cares more about ship-based stuff))[BR]
[I]Scavenger[i] (Cares about pushing stuff to their limit, but unlike the OT, cares about “stuff being broken” and that being a core of the gameplay loop)[BR]
[B]Media Touchstones[b][BR]
Jinx (League of Legends: Arcane)[BR]
Tali''Zorah vas Normandy (Mass Effect)[BR]
MacGyver (MacGyver)[BR]
B.A. Baracus (The A-Team)[BR]
Updated 12/10/2025' WHERE key = 'OUTLAW' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Overseer[h4]
Please see User Data for details.' WHERE key = 'OVERSEER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Padawan Survivor - Fugitive Apprentices[h4]
Order 66 effectively erased the Jedi from existence, but a small handful of Padawans across the stars managed to escape. These young apprentices watched their closest allies suddenly turn and cut down Jedi and Padawans without warning. The remaining Padawan Surivivors have been forced to hide their burgeoning abilities and enter a hostile galaxy alone and unprepared for life outside of the Jedi Order. However, a few have begun to emerge to fight back against the Empire that betrayed them.
[P]The Padawan Surivivor universal specialization does not have any career skills associated with it. When characters purchase this specialization, they automatically recieve a Force rating of 1. If such characters already have a Force rating of 1 or higher, it does not improve when they purchase the Padawan Surivivor specialization. Wary of a galaxy that has turned hostile, Padawan Surivivors still put their faith in the Force as they were trained to do so from a young age.
[P]As former apprentices, these Padawans had been on the path to becoming Jedi Knights. They received training in using the Force and in a range of fighting techniques. Unfortunately, their training was dominated with classroom lessons, and few had actual practical field experience unless they were allowed to join their masters in the Clone Wars. Not only was their formal training abruptly cut short, but the availabilty of Jedi knowledge was severly limited after the issuing of Order 66. That day was one of the darkest in the galaxy''s history, and it devastated the rare Padawans that lived through it.
[P]When the Jedi were branded as traitors and their order destroyed, those rare Padawans still alive were stranded with no resources and no support: their mentors were slain, their former clone trooper allies were hunting them as the Empire''s behest, and they had no one from whom they could seek aid. In order to survive, these former apprentices were forced to seek no-questions-asked jobs or to subsist off a life of crime. If any Imperial informant began to suspect their Force abilities, they would be forced to flee.
[P]As a result, many of the remaining Padawans abandoned their Jedi ideals and began nomadic lives. Many actively pursued any way to blend in, hide their abilities, and subsist on their own. Not all managed to remain hidden, though, with the might of the Empire and the newly-formed Inquisitorius after them at every turn.
[P]While on the run, temporary allegiances were often all that was practical, as lasting bonds proved nearly impossible to maintain, especially when Padawans revealed their abilities. Saving a friend with the Force would frequently result in the friend''s abandonment out of fear of the Empire. Only those already willing to defy the Empire would take that chance. A rebel cell, for instance, could take in Force users because the lives of its members were forfeit already. For Padawan Survivors, whose likes had been shattered by the Empire, rebellion was an exceptionally tempting opportunity.
[P]Having access to an almost-extinguished source of power, Padawan Survivors are capable of unbelieveable acts. Capable fighters and practiced at disappearing, they are able to effectively supplement a covert squad of rebel fighters or smuggles alike. The Force is a powerful ally, and these former Padawans are eager to again use it openly if it means honoring their dead masters and tearing down Imperial rule.' WHERE key = 'PADAWANSURVIVOR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Padawan[h4]
"Padawan" means "learner,” suggesting a deep philosophical foundation, encouraging Jedi to continually stove to learn and understand. A Padawan studies not only facts and information, but also the ideas of fluidity and flexibility, and the act of learning itself so as to be open to understanding. Some Jedi scholars consider ''Padawan" to be a state of mind rather than a title. Many a Knight has found themself revisiting the path of the Padawan to recover the balance they lost or never really had in the first place.
[P]
Padawans receive [B]Coordination[b], [B]Knowledge (Education)[b], [B]Mechanics[b], and [B]Vigilance[b] as additionai career skills, characters who. select this as their starting specialization may choose two of these skills and gain one free rank in each without spending starting experience. These skills reflect the fundamental nature of a Padavvan''s training. At their foundation, Jedi rely on control, focus, and Knowledge.
[P]
Once a child completes their time as an Initiate, obtains their kyber crystal, and constructs their lightsaber, they become a Padawan, an apprentice to a Jedi Knight or Master. The status, role, and function of an apprentice has changed throughout the history of the Jedi Order, but in this time of war, a Padawan acts as a runner, attache, and even lieutenant for their master. To signify their dedication to learning, a Padawan with hair ties it into a braid. A Padawan without hair might wear a band of silka beads or other appropriate material arranged around their head in a similar fashion. Upon completing their training, the Padawan cuts off the braid or beads to symbolize the severing of their attachment to their master.
[P]
The Clone Wars have put the Jedi Council in a difficult position. When the war began, most Padawans had not yet faced the stresses of life in the galaxy, much less the fear and despair that come from war. They had not yet learned to command, to lead. Moreover, many Knights did not want the distraction and added responsibility of training an apprentice in the midst of a galaxy-spanning war. Practical realities forced their hands, however: Padawans needed masters. and Knights needed assistants trained in the ethics of the Jedi Code. While the clones can follow orders, the Jedi Council worried that without a subordinate who could interpret a Knight''s commands through the lens of the Force, only military, not spiritual. needs would be met. So, the council sent its Padawans to war.
[P]
Most non-Jedi do not realize that the title of Padawan represents the idea of learning and the many paths to learning. Knights and even Masters sometimes "become” Padawans again in order to get back to basics. To "open your mind as if a Padawan" means lo rid oneself of preconceived notions or biases and to see things in a fresh, perhaps innocent, light. Although it is a metaphorical lesson, a few have taken this idea literally. All initiates hear the story of ihe Jedi Master Vai Isa. who repeatedly took on the title of Padawan, often testing the patience of her Knights With annoying, “obvious” questions, only to come across a hidden wisdom, enlightening them both.' WHERE key = 'PADAWAN' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Pathfinder[h4]

Few are as capable of exploring a planet and discovering its secrets as a Pathfinder. The combination of Pathfinders'' Force talents and their training enables them to quickly and precisely complete a search, even under the most adverse conditions. A Pathfinder can survive in a hostile wilderness for weeks or months, living off the land with minimal supplies and possibly a faithful companion animal. In fact, some Pathfinders are said to be able to bond with their companions through the Force, communicating with them mentally, seeing through their senses, and even directing their actions.
[P]Pathfinders acquire [B]Medicine, Ranged (Light), Resilience,[b] and [B]Survival[b] as additional career skills. If this is the character''s starting specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. These skills are focused on complementing the Seeker''s career skills, so that the character becomes even more capable of operating independently. The addition of Medicine is primarily for personal benefit but can also be useful in aiding the character''s companions.
[P]Some Pathfinders follow this career because they discover they have a knack for independent survival. This is most commonly true for Force-sensitive Individuals who matured on primitive and uncivilized planets. If his small community was surrounded by hostile wilderness, a character is certain to have spent his youth exploring that environment—likely making friends with many of the wild animals present there. Pathfinders'' natural abilities likely led them to a position of some responsibility within their tribe. Their roles might have included securing the safety of the surrounding wilderness and maintaining any trails leading to agricultural resources or other necessities needed by the community''s residents.

[P]Others who follow the Pathfinder career do so out of a preference for the company of animals over that of sentient beings. Through their Force abilities, some learn to establish effective communications with the relatively primitive minds. In these interactions, they find that they enjoy the sincerity and straightforward nature of wild creatures.' WHERE key = 'PATH' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Peacekeeper[h4]

Across the galaxy, there are always tyrants, and those unlucky enough to suffer under their rule. Some Guardians take direct action through military force to attempt to overthrow such despots. Other Guardians see wars ravaging planets and harming the weak and defenseless. They step in to defend those innocents, and enforce peace at the tip of a lightsaber. These Guardians are often known as Peacekeepers.

[P]Peacekeepers acquire [B]Discipline, Leadership, Perception,[b] and [B]Piloting (Planetary)[b] as additional career skills, and if this is the PC''s starting specialization, the PC gains one rank in each of two of these skills. This combination ensures that they can recognize threats and respond to them in an effective and timely manner. Skilled Peacekeepers must be able to effectively delegate assignments to allies while reserving themselves to confront the challenges for which they are most adept.

[P]Many Peacekeepers only assume this specialization after they have been thrust into a position of authority—sometimes repeatedly. Because of their naturally protective personalities, these Guardians want to do everything in their power to protect their friends. Often, they decide the best choice is to become the best leader they can, out of a sense of responsibility rather than a desire for power.

[P]Characters who pursue the Peacekeeper''s path seldom limit their activities to a single region. Often once one region has been pacified or a tyrant overthrown, a Peacekeeper sets his sight on the next challenge and leads his friends and fellow freedom fighters to overcome it. Under the shadow of the Empire, Peacekeepers are always needed.' WHERE key = 'PEACE' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Performer (reSpecialized)[h4]

[B]PERFORMER—MAKING THEM NOTICE[b][BR]
[B]At a Glance[b][BR]
A Performer is a character that seeks the center of every room, is good at getting all eyes on them, and has the social graces and physical fitness to put on a good show![BR]
[B]All-in or Hybrid?[b][BR]
2-1 Hybrid; “Social Crowd Control” and Melee Supportive Fighter[BR]
[B]What Should it be the Best At?[b][BR]
Debuffing Enemies in social and combat situations[BR]
Utilizing the powers of stardom, performance, etc to their ends[BR]
[B]What should it be just “good” at?[b][BR]
Melee Combat, specifically Dueling[BR]
Buffing Allies[BR]
Being Hard to Hit[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Politico[i][BR]
[I]Advocate[i][BR]
[I]Makashi Duelist[i][BR]
[B]Media Touchstones[b][BR]
Sy Snoodles (Episodes VI: Return Of The Jedi)[BR]
Joh Yowza (Episodes VI: Return Of The Jedi)[BR]
Inara (Firefly)[BR]
[I]updated 12/11/2025[i]' WHERE key = 'PERFORMER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Pilot - A Galaxy of Destinations[h4]

[P]Plenty of folks know how to fly a starship, but a Smuggler who specializes as a Pilot develops a relationship with his ship, and it becomes an extension of his wit and his will. He can make a plodding old transport run far above its performance ratings, and given time and some modifications, he can turn it into one of the fleetest and most maneuverable craft ever to take to the stars.

[P]A Pilot is naturally focused on mastering his craft, and his additional career skills show it: [B]Astrogation, Gunnery, Piloting (Planetary),[b] and [B]Piloting (Space)[b]. If this is the character''s starting Specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. A Pilot''s talents further reinforce his dominance in the cockpit.

[P]Pilot is another specialization that rarely leads to unemployment. If a Pilot doesn''t already have his own ship (and the inevitable Obligation that goes with it), he will likely be able to sign on with any number of groups, criminal or otherwise. Once he establishes his competency at the controls, he''ll be able to get some fairly choice assignments. A Player Character Pilot will be considered indispensable to his group, especially after the first space battle or ship-related crisis.' WHERE key = 'PILOT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Pirate - Nefarious Opportunists[h4]
Pirates care about helping themselves, and they do not care how they do it. They''ll lead a crew to attack well-stocked spaceships. They''ll rescue a naive idealist to steal contraband so they can sell it at a profit. Some Pirates have even seen that there are greater potential reqards-such as ending the ever increasing Imperial stranglehold over their independance-in working as somewhat-reliable rebels.
[P]The additional career skills a PC receives when taking the Pirate universal specialization are [B]Coercion, Deception, Knowledge (Underworld),[b] and [B]Skulduggery[b]. These PCs know the galaxy is a dangerous and unforgiving place, and are always ready to exploit this fact and make serious credits.
[P]For these cunning "entrepreneurs" unafraid to break a few rules, take some risks and resort to violence, anyone else''s gains can become their own. The first law of piracy is that everything belongs to whomever can take it. However, this is an honorable profession; it''s just business, and never personal. At least, it isn''t until someone else makes it personal.
[P]While Pirates work for their own gain, the best opportunists require at least temporary support. Inside contacts, talented slicers, and reliable pilots can be invaluable-as are plenty of hired muscle to back up threats. Skilled Pirates are adept at manipulating those they work with (and anyone in their way) to achieve their goals, often via coercion and leveraging their dangerous reputations. Some might never need to fire a blaster, such is their terrifying renown, while others delight in violence that normal society does not allow.
[P]Unrestricted by standard conventions of right and wrong, the methods that Pirates use can vary wildly. Taking what they want is easy when no one else is left standing, so violence is frequently a first resort. If violence alone can''t work, or is impractical, they rely on cunning. Pirates might propose mututally beneficial agreements to secure assets essential to completing a job. Whether or not the deals are balanced or the Pirates even hold up their end is of little concern to them. This doesn''t mean that come Pirates won''t develop long-term arrangements, but often both parties are aware that such deals are strong only as long as both sides profit handsomely. Even so, most Pirates value their independance too much to be tied down for long, even to lucrative outsiders.
[P]Regardless, Pirates sometimes find themselves aiding fledging anti-Imperial cells. These desperate, outnumbered bands have few legal options for support. Many come to rely on the experience of Pirates for help-especially in learning how to survive outside the law and in finding unsavoury but useful contacts. What might start as purely business dealings can grow to a more lasting association over exciting times, shared conflicts, and a few bottles of something jointly stolen. Whether a band of Pirates commits to a group of rebels for profit, shared aggression against the Empire, or pure boredom may never be known, but Pirates aid can keep such groups alive and fighting long after others have fallen.
[P]Pirates can be duplicitous, conniving, violent con-artists, but they are almost always effective. Whether they are finding criminally-profitable jobs or manipulating their own comrades to make them more effective against the Empire, Pirates are constantly twisting situations to gain the most benefit. They almost always focus the benefit for themselves first, but sometimes it can spill over to their allies.' WHERE key = 'PIRATE' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Pit Fighter[h4]
Please see User Data for details.' WHERE key = 'PITFIGHTER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Pit Fighter[h4]
Please see User Data for details.' WHERE key = 'PITFIGHTER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Poisoner[h4]
Please see User Data for details.' WHERE key = 'POISONERSPEC' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Politico (reSpecialized)[h4]
[B]POLITICO—THE BIGGER FISH[b][BR]
[B]At a Glance[b][BR]
The Politico is a social everyman, able to explore all the avenues of being a “public figure,” whether they are a true-blue local politician, a fixer, a crime boss with a public face.[BR]
[B]All-in or Hybrid?[b][BR]
75% Social, 25% social-adjacent Utility[BR]
[B]What Should it be the Best At?[b][BR]
Covering the full spectrum of sociality[BR]
[B]What should it be just “good” at?[b][BR]
Any one Social[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Prophet[i][BR]
[I]Advisor[i][BR]
[I]Senator[i][BR]
[B]Media Touchstones[b][BR]
Bib Fortuna (Episode VI: Return of the Jedi)[BR]
Greef Karga (The Mandalorian)[BR]
Mok Shaiz (The Book of Boba Fett)[BR]' WHERE key = 'POLITICO' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Propagandist (reSpecialized)[h4]
[B]PROPAGANDIST—PITHY DESCRIPTION[b][BR]
[B]At a Glance[b][BR]
The propagandist is the covert mass communication specialist. They are the master of disseminating information and putting truths and lies to their best respective truths. They function as a storyteller in a galaxy full of War Stories.[BR]
[B]All-in or Hybrid?[b][BR]
⅓ Group-based Deception ⅓ Group Based Charm ⅓ Knowledge & Perception Utility [BR]
[B]What Should it be the Best At?[b][BR]
Twisting broad narratives to influence populations and groups.[BR]
Playing up the benefits of the Rebellion for people.[BR]
Appearing impartial as an agent of a military unit.[BR]
[B]What should it be just “good” at?[b][BR]
Being charming[BR]
Being Deceptive[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Agitator[i](Have a similar vibe of being something of an agitator in the Imperial sense, but more focused on spreading a message than specifically working and enervating a Rebel cell)[BR]
[I]Politico[i](The major overlap is their shared interest in controlling narratives and pulling strings, but the Politico does so for personal gain and on a much smaller scale, whereas the Propagandist tries to sway entire groups of people).
[I]Agitator[i](Have a similar vibe of being something of an agitator in the Imperial sense, but more focused on spreading a message than specifically working and enervating a Rebel cell).[BR]
[B]Media Touchstones[b][BR]
Nemik (Andor)[BR]
Diana Allers (Mass Effect 3)[BR]
Joo Dee (Avatar The Last Airbender)[BR]
updated 12/10/2025' WHERE key = 'PROPAGANDIST' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Prophet - A Cantor for a Choir[h4]
The Jedi Order''s proselytizing ebbed and flowed, much as the Force did throughout the Old Republic. Understanding of the Force couldn''t be pressured upon a student without causing resentment and anger, which promises a fall toward the dark side. So for Prophets, they proselytized not to convert, but to offer a voice of hope and an opportunity to learn about the power of the Force.
[P]Now, with the Jedi Order destroyed and the Galactic Republic shattered, Prophets carry a fervor not seen before in the history of the galaxy. To them, their knowledge of the light side of the Force reflects the struggle against the dark. If the Galactic Empire is the shadow blotting out the stars, then Prophets are single points of light, hoping to ignite a candle here and there to light up the sky.
[P]Prophets gain the following additional career skills: [B]Charm, Coercion, Deception,[b] and [B]Leadership[b]. Characters who start with this specialization first get one rank in two of these skills without spending experience.
[P]Like Advisors, this specialization directly interacts with people, granting them insight and counsel when needed. Unlike Advisors, Prophets address the crowd, not the individual. Their message has to reach as many ears as possible, in the hope that their ideas or warnings catch fire. Prophets influence communities, cities, or even planets if given a medium and a message.
[P]The medium comes in a variety of forms: a sermon on a soapbox or an altar, a HoloNet posting or recording, flyers or tracts passed from hand to claw, or even images on a poster, painting, or pirate transmission. It doesn''t matter what medium, only the passion and truth of the message.
[P]The message might be filtered through a religious lens, but not always. Prophets are keyed into the Cosmic Force more keenly, and images of the future provide wisdom, guidance, and, for followers, an identity. Since Prophets are only mortal, they can only try to interpret with mortal concepts and metaphors. They then have to translate that message into simple language, further diluting the content. The next person''s limited understanding then further alters that message. The real question is whether this constant alteration by verbal or visual transmission distorts the message or enhances it just as the Force intended.
[P]Prophets who use their abilities for evil or selfish ends have an easier time now during the Galactic Civil War. Those suffering from the Empire''s rule want a voice of hope to give them a reason to live on, and as long as the message doesn''t violate Imperial restrictions on religion or political sedition, Prophets can enjoy a safe (and profitable) career. Even on planets free from the Empire, other sources of oppression (slavery, Hutt influence, corporate interests, and the like) may drive people to a religious charlatan, especially one who can produce miracles.
[P]Even well-meaning Prophets should be wary, since it is much too easy for them to insert their own desires, needs, or fears into their visions, distorting them into their own ends, manipulating their followers into believing their own egos.' WHERE key = 'PROPHET' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Protector[h4]

Guardians are often driven by their compassion for the plights of those who cannot protect themselves. Protectors ensure these innocents never come to harm. Few are tougher than a Protector, and even fewer can get through his guard to attack those he defends. Even if his charges do suffer harm, the Protector possesses basic medical knowledge to heal their wounds.

[P]Protectors gain the additional career skills of [B]Athletics, Medicine, Ranged (Light),[b] and [B]Resilience[b]. If this is the characters starting specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. This combination enables the character to assist those who are in need during a crisis. These skills complement many of the talent selections, so that the Protector remains capable of effectively shielding others from suffering harm without sacrificing his own capabilities.

[P]Protectors could be considered bodyguards, but their efforts are seldom limited to protecting a single individual. Instead, Protectors are more likely to defend the needy on a larger scale. Often, they function as rescue workers, using their medical knowledge to stabilize injuries in the field and then providing additional protection. In other cases, Protectors may shelter refugees or other victims fleeing terrible situations. holding the line until the innocents can escape to safety. When a Protector does defend a single individual, It is likely because a great threat—even another Force user—pursues the person.

[P]Some Protectors might come to master their abilities while working in a military or law enforcement role. Some Force techniques might manifest spontaneously as they instinctively act to keep companions safe. This could be particularly relevant for individuals who have not recognized their connection to the Force. Its presence might enable them to save an ally from danger in a seemingly inexplicable fashion. However, once these individuals realize the power they have, they must decide whether to continue their career and keep it a secret, or leave the life they''ve known and explore their new abilities.' WHERE key = 'PROTECT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Quartermaster (reSpecialized)[h4]
[B]QUARTERMASTER—PITHY DESCRIPTION[b][BR]
[B]At a Glance[b][BR]
The Quartermaster is the person in charge of armaments, requisitions, and general preparedness for any military operation. They are both the gateway to and gatekeeper for any tools of rebellion.[BR]
[B]All-in or Hybrid?[b][BR]
½  General Negotiation & Making Credits ¼ Supplies and Material-Based Utility ¼ Narrative Forward Debuffing[BR]
[B]What Should it be the Best At?[b][BR]
Procurement of material for the waging of war[BR
Managing resources in a military unit[BR]
[B]What should it be just “good” at?[b][BR]
Negotiation not relating to supply[BR]
Computers, but not slicing.[BR]
Being detail-oriented[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Entrepreneur[i](second-closest match after the Trader. They share a shrewd logistics sense for making money do work, but the focus of the QM is to put the money to greatest effect, not having money make more money)[BR]
[I]Analyst[i](Their overlap is specifically in their attention to detail and how that effects their allies. The QM has even less of a computers focus than the Analyst).[BR]
[I]Trader[i](Probably the closest of the trees. It’s about the stuff, not the money. Especially with how the characters can dip into the underhandness).[BR]
[B]Media Touchstones[b][BR]
RADAR (M*A*S*H)[BR]
Red (Shawshank Redemption)[BR]
Steve Cortez (Mass Effect)[BR]
[I]updated 12/11/2025[i]' WHERE key = 'QUARTERMASTER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Racer - Eyes to the Future[h4]
Racers race. Whether by landspeeder, airspeeder, starship, or on foot, the Racer speeds forward to be the first, and the fastest. However, the Force grants not only extra sensory insight about the race, but also guides Racers to think about what the race means.
[P]Racers recieve [B]Cool[b], [B]Coordination[b], [B]Piloting (Planetary)[b] and [B]Piloting (Space)[b] as additional career skills. Characters who select this as their starting specialization may choose two of these skills and gain one free rank in each without spending starting experience.
[P]For these characters, racing is less about speed and more about knowing their position in time and space. Racers don''t ask how to get somewhere, they intuit their arrival at their destinations. In many ways, they  push to understand the future in relation to the positioning of self. The Force, racing forward in time, in its own way, has carved a path that Racers must follow.
[P]With the Force, physical obstacle aren''t obstacles per se. They represent perceptual shadows on the fabric of space time. Racers use the Force to peer into these shadows, seeing not only what exists in the shadow, but also when such interactions exist in the shadow. If they don''t exist in the shadow at all, Racers avoid them. They were either never supposed to be there or their life possibly ended before then. If Racers know they don''t exist at some point in a  potential future, then they can pick a future in which they do.
[P]As their skills develop, this perception extends from their own relative position to those of other living beings. Racers become predictive not only about their own place in space-time, but also about other beings'' places relative to them. This allows Racers an eerie ability to be at the right place at the right time to intercept an individual. Catching a bounty just before the target escapes or rescuing a person in need at just the right time is an incredible benefit to the community. In the wrong hands, this talent can be terrifying, as dark side Force users employ it to talk their target stalking and harassing with a looming presence at every turn.
[P]Obviously, Racers must have a calm demeanor and steady hands, even if the adrenaline rush and excitement of a race would shake the steeliest nerves. Anger can push them to excessive aggression, and fear can lead to hesitation at the wrong moment. Mistakes cost lives, not just for Racers'' lives but also those of other pilots, audience members, pit crew and innocent bystanders. Many Racers claim to attain a paradoxical stillness in the middle of a race, achieving a transcendental oneness with vehicle, speed, and self. At this point, the Force flows naturally through them. However, ordinary, practiced skill in piloting a starship or speeder is a must, even Racers can''t rely on the Force alone.
[P]Podracing is the first obvious practical application for this specialization. The Racer specialization also can be useful with everything from racing on foot to racing starships. For  Racers, notions of time, space and position become almost meaningless. Racers can be twelve parsecs away from a target but close to interception with a fast hyperdrive, while those on foot may be only a yard away but separated by a high, impssable durasteel wall. Which one of these Racers is closer to the goal?' WHERE key = 'RACER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Recruit[h4]

Due to [B]Age of Rebellion''s[b] focus on the Galactic Civil War, most groups of PCs find themselves embroiled in conflict very quickly. Against a force like the Empire, any form of military training can mean the difference between life and death. While the Alliance isn''t as organized or regimented as the Empire, they do try to give a decent number of their members some form of combat training. This training helps to enhance the Rebels'' chance not only to survive in combat but to fight effectively to achieve their goals.

[P]The Recruit specialization is a universal specialization, and the experience cost to take it is ten times the total number of specializations that the character would have after adding the new specialization. While this means that the specialization costs the same as a career specialization, note that universal specializations are not career specializations.

[P]The additional career skills a PC receives when taking this specialization are [B]Athletics, Discipline, Survival,[b] and [B]Vigilance[b]. Alliance operatives who go through this training enhance their physical fitness, awareness, and general competency at a wide variety of skills. Those who commit extra time and effort can also enhance their abilities with weapons and ground vehicles, as well as their general knowledge of the many worlds to which they may end up traveling.

[P]Characters from almost any career can benefit from becoming a Recruit and gaining some basic military training. Small teams of specialists going up against the Empire''s best will likely need to call upon every scrap of combat ability they collectively possess to survive dramatic fights for their very lives.

[P]The Alliance strongly recommends such training for any Rebels who are actively going into the field, regardless of their career, goals, or role in a team. Even Diplomats are actively encouraged to undergo military training; they do no good to anyone if they cannot come back alive from their latest efforts to negotiate a treaty or acquire supplies. Becoming a Recruit might not make a character a full-fledged special forces hero, but it certainly doesn''t hurt.' WHERE key = 'RECRUIT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Republic Navy Officer[h4]
Waging war against the Confederacy or Independent Systems requires the coordination the brightest military minds within the Republic. The clone army is an effective fighting force on the ground, but it is only as effective as the tactical leadership that commands and supports it from orbit. Drawn from the experienced commanders of Republic worlds'' various system defense fleets, the naval Officers of the Republic serve as the Grand Army''s frontline strategic leadership amid the raging conflict. Even the Jedi rely on the judgment of the officers they fight beside, as they lack the experience necessary to conduct large-scale naval actions or organize troop deployments.

[H4]MILITARY BRILLIANCE[h4]

[P]Victory is a moving target, which makes the task of a Republic Navy Officer immensely difficult. While the Separatists have been building and training their commanders in secret for years, the Republic leadership was largely unprepared for the sudden onset of open conflict.

[P]The Jedi and the Senate are not experienced at waging war, so they have been forced to draw their officers from the isolated defense fleets scattered throughout the Republic, resulting in a  diverse group of military commanders with wildly different skills, training, approaches, and experiences.

[P]Yet, one thing the officers of the Republic Navy share is an excellent tactical and strategic sense. They are as capable of outmaneuvering a single dangerous warship as they are organizing the defense fleet of an entire star system. Having had to outwit pirates often before the war, officers know the spacelanes of the galaxy and can operate amid dangerous obstacles that would slag less experienced navigators.

[P]To represent their training in tactical combat and command, a Republic Navy Officer receives [B]Astrogation, Discipline, Knowledge (Warfare),[b] and [B]Leadership[b] as additional career skills. Regardless of their unique background, a Republic Navy Officer understands war and knows what must be done to achieve victory.

[P]Beyond their military expertise, a naval officer must be a capable leader. Even a brilliant strategy is useless if the spacers carrying it out don''t have faith in their ship or fleet, and a talented officer inspires that faith. Whether captaining a single vessel or coordinating the assault of an entire armada, a Republic Navy Officer is a symbol to the crews they command. Clone troopers rely on the ships of the Navy to travel between worlds and reach the battlefield, and the best officers ensure not only victory in orbital battles, but pave the way for a successful ground strike.

[P]In addition to inspiring the clones and other crew who serve under them, many Republic Navy Officers work closely with a Jedi general. Although a non-Jedi officer is officially outranked by their Jedi colleague, the officer''s military experience often ensures they serve more as a mentor than a subordinate, and naval strategies are frequently developed by the two working in concert. The Jedi tend to be more at home directing ground engagements or leading starfighter dogfights, leaving the command of the orbital or interplanetary forces to their trusted naval commanders.' WHERE key = 'REPNAVYOFF' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Republic Representative[h4]
Resolving the conflicts of thousands of civilizations across the galaxy is a colossal undertaking, yet the Galactic Senate takes that as its function. The Senators who debate and negotiate within the Senate rotunda represent entire planets or corporate organizations; each Senator is a single voice speaking for millions. Yet, in representing such a massive constituency it is almost impossible for one person to balance the needs of the myriad smaller groups within the whole. For this reason, many worlds have one or more Republic Senate representatives, sometimes known as junior representatives, nonvoting members of the Senate who represent a minority political party or species. Representatives work closely with Senators as a delegation, to better represent the interests of a planet''s entire population. Republic Representatives are expert politicians in their own right , working with each other and their world''s Senator to determine what problems—or solutions—they should collectively bring before the Galactic Senate.

[H4]ENVOYS IN THE ROTUNDA[h4]

[P]The retinue of a Senator is, in many ways, like a miniature Senate of its own. Because no Senator can be familiar with all of the diverse cultures they represent, the many junior representatives who work with them stand in as the voices of their constituents. Each representative is sent to represent a distinct population or political coalition. A representative must be a master of diplomacy to ensure that their constituency''s issues are taken seriously by the rest of their delegation, and they must be adaptable enough to retain the favor of their Senator and their political allies. Although a representative does not hold the power to vote or introduce legislation—except when fulfilling a Senator''s duties during that Senator''s leave of absence—they can sit on committees, and they receive all the same briefings as a Senator.

[P]To succeed in the Senate, a character with the specialization receives [B]Charm, Cool, Knowledge (choose any one),[b] and [B]Negotiation[b] as additional career skills. When a character takes this specialization the player chooses one Knowledge skill appropriate for the group the character represents to become a career skill. The Senate is a stressful and dangerous place, full of competing interests and shifting loyalties. The ability to keep one''s head when being rebuked by a Senator is highly sought after, as is a composure that betrays no hint of betrayal when a political alliance is going sour.

[P]A Senator''s responsibilities keep them on Coruscant much of the time, while those of a Republic Representative often take them away from the Senate. As an intermediary between their homeworld and the heart of the Republic, a Republic Representative is often among the stars, visiting the people of their world or carrying out assignments for the Senator. They tend to be more worldly than the full Senators of the rotunda, and most develop a wide network of associates among the less politically active communities of their homeworld.

[P]However, when a Senator has to step away from Coruscant for any reason, they appoint a highly regarded Republic Representative to act as their proxy and rake on all the roles and responsibilities of a full Senator in the interim. This is often seen as a mark of high esteem and a first step toward inheriting the position from the current Senator when their term ends.

[P]As they are politicians, Republic Representatives rarely train in martial techniques. The intrigues of the Senate are complex enough that mastering its intricacies is a lifelong undertaking. Furthermore, the tenets of the Republic are ones of peace and democracy rather than strength and valor, so peaceful solutions are always preferred to violent confrontation. Truly skilled representatives don’t even need weapons to defend themselves, for the right words can defuse a dangerous situation. One might say that Republic Representatives are never truly unarmed—that their weapons are smooth charm and sharp critiques.' WHERE key = 'REPREP' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Retired Clone Trooper - Decommissioned Soldiers[h4]
Literally bred for battle, these warriors were the bulk of the Republic''s fighting force in the Clone Wars. Exceptionally trained, they were invaluable allies to the Jedi Order until they were manipulated into betraying its members. As the clones'' accelerated aging process continues unabate, their life spans are reaching their ends, but they remain effective, tactically minded warriors whom none should underestimate.
[P]The additional career skills a PC receives when taking the Retired Clone Trooper universal specialization are [B]Discipline, Knowledge (Warfare), Ranged (Heavy), Ranged (Light), Resilience,[b] and [B]Vigilance[b]. Player Characters who take this universal specialization must be human males, given that they were once clone troopers, but gain a wider set of career skills from their Kaminoan training. Such PCs have seen too much of war, but realize that the Empire cannot be stopped unless they lend their skills to the battle.
Clone troopers were grown on Kamino using the human bounty hunter Jango Fett as their genetic template. These clones were engineered with an accelerated growth rate in order to become effective combatants in a significantly reduced period of time, and they had inhibitor chips installed to prevent unintended violent outbursts-or at least that was the official reason. While the troopers developed, they were given extensive generic combat training in addition to specific training as pilots, gunners, shock troopers, and a variety of other specializations. Possessing the ability for creative thought clone troopers were significantly more effective than the mass-produced, programmed droids they were sent to combat.
[P]During the Clone Wars, clone troopers became battle brothers; after surviving countless battles together, they established a fierce loyalty not only for each other but also for their Jedi generals. Without the contributions of both clone troopers and Jedi, the Republic would have had no chance of winning. The bond appeared unbreakable to all.
[P]Near the end of the war, though, Chancellor Palpatine branded the Jedi as traitors and ordered the clone troopers to eliminate their Jedi comrades, no questions asked-and they did. Almost no Jedi or Padawans survived. Soon afterward, due to their accelerated aging, the clone troopers were decommissioned and replaced with non-clone stormtroopers, who lacked their intensive training. Once retired, some clone troopers were horrified about their execution of Order 66. A few went as far as removing their inhibitor chip, blaming it for making them follow the order, since troopers who had removed it beforehand did not carry out the order.
[P]Today, a handful of these soldiers still survive and grapple with the consequences for their actions. Whether due to shame for their role in Order 66, anger against the Empire, or a desire to continue to fight for their Clone Wars ideals, a few have abandoned their leisure to fight in this nascent rebellion.
[P]Retired Clone Troopers are powerful allies despite their age. Not only do they retain their tactical combat knowledge and training, but they have striven to maintain their genetically imbued physical conditioning as well. This is enhanced by the practical skills derived from their years of fighting and winning battles. As former soldiers of both the Republic and the Empire, they also know the location of multiple abandoned military bases scattered across the galaxy. Experience is power, and Retired Clone Troopers are steeped in it.' WHERE key = 'RETIREDCLONETROOPER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Rigger (reSpecialized)[h4]
[B]RIGGER—”I AM MY SHIP”[b][BR]
[B]At a Glance[b][BR]
The Rigger is the ultimate “I am my ship” specialization, where the character’s progression directly correlates to their ship’s excellence. They are the master of just passively turning their ship both effective and unkillable.[BR]
[B]All-in or Hybrid?[b][BR]
4/5 Signature Vehicle ⅕ Outfitting And Acquisition[BR]
[B]What Should it be the Best At?[b][BR]
Shipboard Survivability[BR]
[B]What should it be just “good” at?[b][BR]
Outfitting Their Vehicle (generally)[BR]
Mechanics[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Modder[i](A split “signature equipment” specialization that cares about weapons and vehicles in equal measure. The Rigger is 100% more interested in the ship, big or small.)[BR]
[I]Shipwright[i](Does most of their excellence when building the Vehicle. So in that way they are similar in that they pregame a lot of their excellence, but the Education focus of the Shipwright gives it a tonne of mid-adventure utility.)[BR]
[B]Media Touchstones[b][BR]
Lando Calrissian (Solo)[BR]
L3-37 (Solo)[BR]
Kenickie (Grease)[BR]
Michael Knight (Knight Rider)[BR]
Max Rockatansky (Mad Max)[BR]' WHERE key = 'RIGGER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Saboteur (reSpecialized)[h4]
[B]SABOTEUR[b][BR]
[B]At a Glance[b][BR]
The Saboteur is one part infiltration expert, one part demolitions expert, and one part technical saboteur. They sneak in, perform precise disabling, and get out, usually through a hole they made.[BR]
[B]All-in or Hybrid?[b][BR]
⅓ Stealth and Infiltration ⅓ Direct Combat Explosives ⅓ Technical Dismantling [BR]
[B]What Should it be the Best At?[b][BR]
Covert Subterfuge[BR]
Explosives and Mechanics as applied to Subterfuge[BR]
[B]What should it be just “good” at?[b][BR]
General Mechanics[BR]
Slicing/Infiltration[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Thief[i](Serious overlap with regard to covert break ins, but there isn''t a focus on destruction, mostly slipping in and skipping out).[BR]
[I]Infiltrator[i](Big focus on infiltration is shared, and military subterfuge, but leverage traditional combat as a tool rather than explosives).[BR]
[I]Slicer[i](Overlap in espionage, but ultimately explosives are louder than most slicing eventualities).[BR]
[B]Media Touchstones[b][BR]
Updated 12/10/2025' WHERE key = 'SABOTEUR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Sage[h4]


[B]CAREER + SPECIALIZATION POWERS:[b] Influence, Move, Foresee, and Sense.
[P]Many Consulars know the universal truth: knowledge is power, and understanding a situation can give one a decisive advantage. This holds just as true when resolving disputes or negotiations as it does on the battlefield. A Sage focuses on studying the world around him, recognizing that information offers tremendous advantages to himself and his allies. He then uses that power to help change the hearts and minds of others to achieve his goals.

[P]Equal parts scholar and diplomat, Sages gain the additional career skills [B]Astrogation, Charm, Cool,[b] and [B]Knowledge (Lore)[b]. If this is a PC''s first specialization, the PC gains one rank in each of two of these skills. Sages see knowledge and understanding as the basis for long-term peace and harmony. It is their belief that hatred often springs from ignorance. When a sentient comes to appreciate the backgrounds of another being''s beliefs and practices, it becomes far easier not only accept that being but to feel compassion for him.
[P]Some researchers may become lost in their academic pursuits, obsessing over dry facts while blind to the plight of the weak and helpless. Not so a Sage, who maintains connections to those around him via the Living Force. The Force provides a means of grounding Sages'' studies so that they keep what they learn in perspective, always mindful of how they can use their knowledge to help others.' WHERE key = 'SAGE' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Sapper (Respec Alpha)[h4]
[B]SAPPER[b][BR]
[B]At a Glance[b][BR]
Sapper is the battlefield engineer through and through. They are about fortifications building and destruction, with a heavy emphasis on explosions[BR]
[B]All-in or Hybrid?[b][BR]
⅙ Fortification Building ⅙ Countermobility ⅓ Fortification Destruction/Sapping ⅓ General Explosives [BR]
[B]What Should it be the Best At?[b][BR]
Dealing with the ins and outs of base building and enemy fortification destruction 
Large Explosives, especially charges[BR]
Battlefield Impediments[BR]
[B]What should it be just “good” at?[b][BR]
General Mechanics[BR]
Survival[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Saboteur[i](The Sapper is a hammer whereas the Saboteur is more like a well-placed dagger, as far as subterfuge is concerned).[BR]
[I]Demolitionist[i](They share a focus on blowing stuff up, but the only thing that the Demo actually makes is bombs, whereas the Sapper focuses heavily on fortifications).[BR]
[B]Media Touchstones[b][BR]
Updated 12/10/2025' WHERE key = 'SAPPER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Scavenger[h4]
As the Clone Wars erupt across the galaxy, there are many beings who have no interest in which side wins or loses. Scavengers have always existed in the Outer Rim, but during wartime, any individual might find themself lurking among the wreckage of droids and vehicles, salvaging valuables. For this reason, sentients from all walks of life might become Scavengers and learn to turn damaged or forgotten technology into profit on the black market, whether dealing in individual scanners and blasters or salvaging entire starships.

[H4]SURVIVING ON DESTRUCTION[h4]

[P]To venture out into a ruinous battlefield requires great courage, and only the most daring survivalists succeed at deriving profit from the wreckage of warfare. The dangers of a former battleground—from shattered tanks and unstable munitions to not-quite-disabled battle droids—are enough of a deterrence that most Scavengers find themselves working alone. The isolation and danger give anyone who chooses such a life great tenacity. The pay is usually better than the rate for any other work they could find, and the freedom is liberating.

[P]Scavengers receive [B]Mechanics, Perception, Streetwise,[b] and [B]Survival[b] as additional career skills. These skills are honed by constant forays into burned out factories or the hulking wrecks of starships, where local predators or malfunctioning battle droids might at any time emerge with deadly intent.

[P]It is the ability to find treasure within the detritus of the Republic and the Separatists that draws individuals to such dangerous endeavors. A Scavenger is a master of improvisation. They often refurbish The technology they find in new and innovative ways to either sell on the black market or use for their own purposes. They are as much inventors as they are survivors, creating handmade and unique equipment that only they know how to use.

 [P]Not all of a Scavenger''s discoveries are from the wreckage of war, however. Occasionally a battle unearths ancient relics or technology from before even the Republic, or a tip or rumor puts a Scavenger''s skills to the test as they venture into territory unseen for generations. Instead of recovering the wreckage of a Republic or Separatist war machine, they may find themselves in the possession of a device so old that it would be priceless to academics or religious leaders—a device that can do things that no other technology can replicate.

[P]If a Scavenger doesn''t find their own use for a broken hull or circuit board, an extensive network within the black market offers plenty of ways to turn a profit on it. For every innovator willing to venture into danger for their parts, there are a dozen smugglers and technicians who would rather trade credits for safety and buy whatever materials a Scavenger can recover. This means that every piece of tech or wreckage is potentially valuable to someone. A reliable Scavenger can build up relationships with experienced fences that lead to improved profits and information that wouldn''t be available any other way.' WHERE key = 'SCAVENGER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Scholar (reSpecialized)[h4]
[B]SCHOLAR—THE GIFT OF KNOWLEDGE[b][BR]
[B]At a Glance[b][BR]
The Scholar turns knowing things into doing things, understand enough broad subject matter to help their colleagues during difficult situations, and comes in clutch with a valuable factoid.[BR]
[B]All-in or Hybrid?[b][BR]
All-in on Knowledge[BR]
Slight niche concerning being good at learning[BR]
Slight niche concerning noticing things[BR]
[B]What Should it be the Best At?[b][BR]
Knowing things and leveraging that into general utility & support[BR]
[B]What should it be just “good” at?[b][BR]
Learning New Things[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Doctor[i] (No Real overlap aside from subject matter expertise, and Voice of Reason)[BR]
[IScientist[i] (All in on Intelligence, but split between knowledge and mechanics)[BR]
[I]Sage[i](Knowledge and Force Powers split)[BR]
[B]Media Touchstones[b][BR]
Eno Cordova (Jedi Survivor)[BR]
Jocasta Nu (Episode II: Attack of the Clones)[BR]
Lor San Tekka (Episode VII: The Force Awakens)[BR]' WHERE key = 'SCHOLAR' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]SCIENTIST (reSpecialized)[h4][BR]
[B]At a Glance[b][BR]
The scientist is the “creation-focused” Scholarly archetype that serves to role-fill as the “swiss army smartypants” that can do any number of important intelligence things in the party. Scientists know things and they make things.[BR]
[B]All-in or Hybrid?[b][BR]
½ Using Knowledge for General and Social Utility ½ Using Int-Based Skills to Craft/Make Things/Improve Things[BR]
[B]What Should it be the Best At?[b][BR]
Scientist ideally should be the best at making things, but not in a Grease-Monkey kind of way[BR]
Knowing Things, a-la the Scholar[BR]
[B]What should it be just “good” at?[b][BR]
Medicine[BR]
Mechanics[BR]
Computers[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Scholar[i](The closest as a 1 to 1. The Scientist cares heavily about knowing things, but doesn’t go deep as the scholar. It tries to leverage pure intelligence though).[BR]
[I]Doctor[i](They both share medicine and both leverage knowledge socially, but that’s about it. The Medicine side of the Scholar is very understated).[BR]
[I]Analyst[i](Very similar trees. They have socially-leaning Knowledge side that centers around utility, and the other half leans towards  a different niche (computers). But while it’s a single niche for Analyst, it’s more like 3 niches for Scientist).[BR]
[B]Media Touchstones[b][BR]
Mordin Solus (Mass Effect 2)[BR]
Praxideke Meng (The Expanse)[BR]
Miranda Lawson (Mass Effect)[BR]
[I]updated 12/11/2025[i]' WHERE key = 'SCIENTIST' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Scoundrel (reSpecialized)[h4]
[B]SCOUNDREL—TALK YOURSELF IN AND OUT OF TROUBLE[b][BR]
[B]At a Glance[b][BR]
The scoundrel is the quick-witted conman, borrowing from Chewie to pay Han. Always working a deal, abandoning it in a flash when it all goes south. Often utilising deception as a means (although maybe not always successfully). When the chips are down, will scrap for their freedom.[BR]
[B]All-in or Hybrid?[b][BR]
½ Deception focused 1/4 Ranged Light combatant (single weapon only), 1/4 Cool/Initiative[BR]
[B]What Should it be the Best At?[b][BR]
Deceiving and con jobs.[BR]
Getting out of trouble.[BR]
[B]What should it be just “good” at?[b][BR]
Single pistol Ranged Light weapons.[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Gunslinger[i](The Scoundrel is very much a watered down and catch all spec for most of what the other more specialized specs do for Smuggler)[BR]
[I]Thief[i](Barely any overlap, aside from incidental caring about Deception)[BR]
[I]Charmer[i](Less so part of the Scoundrels repertoire but there should be a small element of charm to the scruffy looking nerf-herder)[BR]
[I]Death Watch Warrior[i](Less focused on movement, but they will have a similar emphasis on death-dealing)[BR]
[I]Pirate[i](The pirate is the Scoundrel who has an entire crew at their disposal to pillage what they desire, although more overt than the scoundrel)[BR]
[I]Performer[i](Some distraction and deception elements)[BR]
[B]Media Touchstones[b][BR]
Han Solo[BR]
Jod Na Nawood (Skeleton Crew)[BR]
Malcolm Reynolds (Firefly)[BR]
Jack Sparrow (Pirates of the Caribbean)[BR]
Eddy (Ed, Edd, & Eddy)[BR]
Updated 12/10/2025' WHERE key = 'SCOUND' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Scout (reSpecialized)[h4]
[B]SCOUT - BLAZING THE TRAIL[b][BR]
[B]At a Glance[b][BR]
The scout is the perfect “roughing it" support specialization, acting as a Chiss Army Knife in those situations, assisting their allies in a number of way out in the wild.[BR]
[B]All-in or Hybrid?[b][BR]
Hybrid, probably 3-way between active scouting and naturalism, and role-filling in the party.[BR]
[B]What Should it be the Best At?[b][BR]
Surviving and Traversing the wilderness[BR]
Actually Scouting[BR]
Initiative Support[BR]
[B]What should it be just “good” at?[b][BR]
Athleticism[BR]
Piloting Planetary[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Pathfinder[i][BR]
[I]Navigator[i][BR]
[I]Survivalist[i][BR]
[B]Media Touchstones[b][BR]
Mad Max/Furiosa[BR]
Rey (circa Episode VII: The Force Awakens)[BR]
Updated 12/10/2025' WHERE key = 'SCOUT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Seer[h4]

Some individuals are able to remain constantly aware of the Force''s presence, even as they go about their daily lives. They recognize its influence in the subtlest of ways. For them, minor ripples in the Force reveal deep meanings and forewarn of critical events far in the future. However, this quantity of information—particularly in environments filled with other sentients—can become overwhelming. Because of this, many who follow the path of the Seer choose to live lives of relative isolation, far from crowded towns and cities.

[P]Seers acquire [B]Discipline, Knowledge (Lore), Survival,[b] and [B]Vigilance[b] as additional career skills. If this is the character''s starting specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. Successful Seers must be able to maintain focus on daily life even as they also observe the Force. They must learn to recognize a broad range of subtle signs. They must also be prepared to dwell in a potentially hostile environment, apart from civilization, so that they can be spared from information overload.

[P]Among Force-sensitive individuals, Seers are arguably the ones who feel the strongest sense of guidance from the Force. Dwelling within the Force at all times, they can recognize even minor ripples and follow them to their source to stop a small problem from turning into a major crisis. Similarly, they may recognize an event that occurs far away and advise those nearby to take action so they can be prepared well in advance of an upcoming crisis. Seers'' abilities often give them insights into the future, guiding them to places and people who most need their wisdom and advice. This sometimes enables Seers to be in just the right place at the right time to take action that proves to be pivotal.

[P]The challenge for many Seers is to know the best time to move into a civilized area. As their sensitivity can become muddled, they may miss a sign of great import. Consequently, some prefer to remain apart from society for as long as possible, depending on allies to carry their missives. Seldom, however, are others capable of communicating a warning as effectively as the Seer who initially sensed the danger.' WHERE key = 'SEER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Sentry - Hunting The Hunters[h4]
Despite the grand legends of the Jedi and their sweeping battles in half-forgotten wars, neighborhoods still need day-to-day protection. Padawans may have dreamt of striking down an evil general or forginf alliances between powerful armies, but  when they became Sentries, they patrolled the streets streets, city blocks, and alleyways to help the overlooked, the common people. These foot soldiers gained none of the glory of their peers, and their thankless tasks have not been preserved in Jedi myths, but their work has benefited countless lives throughout the years.
[P]Sentries gain access to the additional career skills of [B]Coordination[b], [B]Lightsaber[b], [B]Stealth[b] and [B]Vigilance[b]. Characters who select this as ther starting specialization may choose two of these skills and gain one free rank in each without spending starting experience.
[P]Although both have a lightsaber-focused specialization, Sentries and Shien Experts differ considerably. Whereas Shien Experts approach life and combat as tactical exercises, Sentries concentrate on the immediate and the personal. They reach their targets through speed or subterfuge, stay aware of potential threats, and strike sure and quick.
[P]Sentries are concerned with the present; a crim commited is a violation too far and stopped too late. While other Sentinels concern themselves on the bigger picture, Sentries pick up the pieces in the moment. They catch those who slip through the cracks and are forgotten, and stop those who break through safeguards to do irreparble damage. To Sentries, the details are the real picture, and allowing one person to suffer in order to promote justice is no justice at all.
[P]Perhpas the most personally engaged of the Sentinel speicalists, Sentries defend individuals, whether a specific person they are charged with protecting or a random person walking down the street. During the days of the Jedi Order, Sentries were accused of being too attached to the singular, becoming too emotionally involved with people and losing sight of larger tasks. However, the sentries remained steadfast, channeling grief, anger, and love into pushing themselves to their limits to save their charges, and finding strength in their personal attachments.
[P]Despite their efforts—or perhaps becuase of them—Sentries don''t have a glowing repuation for purity. They revel in their repuation, utilizing fear and surpise against their opponents. Sentries can only maintain this reputation among their adversaties if their communites fear them as well. They must become the monster who the monsters fear.
[P]The Force guides Sentries to be in the right place at the right time to prevent violence. They move unseen, somtimes on rooftops to get a higher perspective, sometimes in the shadows to get an up-close point of view. Their senses expand as Sentries search for an oppurtunity, an opening, to get the jump on evil.
[P]Once engaged in combat, their priorities change. After slipping out of the shadows or dropping down from above, sentries operate visibly and engourage their enemies to target them. Sentries want to be the most intimidating and to be the most dangerous-looking so that their enemies will fear them and fight them rather than their charges. Their talents lie not in ending a fight quickly or attacking directly though. Sentries work best when surprising opponents, removing them one by one and giving the rest a chane to run away or surrender in this way. This lets Sentries use the negative emotions of fear and anger to disorient their opponents.' WHERE key = 'SENTRY' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Shadow[h4]

In the ancient days of the Jedi Order, Sentinels worked tirelessly to police the galaxy''s criminal underbelly. However, a small subset of these enforcers focused their attentions on a far greater and more dangerous threat. They trained tirelessly to find and eliminate those who had fallen to the dark side of the Force and willingly embraced corruption These Sentinels were called Shadows, and they hunted the Sith.

[P]For many years, the Sith were thought destroyed, and the Jedi Shadows gave up their calling or pursued other dark side Force users. They never realized that the Sith had not been eliminated, and were hiding right under their noses.

[P]Now, with the Jedi Order destroyed and a Dark Lord of the Sith ruling the Galactic Empire, those who would follow the path of the Shadow find their roles reversed. No longer the secret investigators of an established order who searched the shadows of civilization, they are now the ones who must stay hidden. However, within these dark corners. Shadows still work tirelessly to bring justice to untouchable criminals and dark side Force users alike.

[P]Shadows acquire [B]Knowledge (Underworld), Skulduggery, Stealth,[b] and [B]Streetwise[b] as additional career skills. If this is the character''s starting specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. These characters recognize that stealth and deception are integral to finding the targets they hunt. Criminal organizations are often mired in secrecy. and uncovering these secrets requires underhanded methods. While their techniques are frequently of questionable moral character. Shadows firmly believe their ultimate accomplishments more than justify the tools that they must use.

[P]Of course, an initiate who has turned to the dark side can prove a powerful opponent for a Shadow. Working against such an adversary can require all of an adept''s mundane and Force talents. A Shadow''s willingness to examine and utilize every tool and asset can play a major factor in overcoming such capable foes.' WHERE key = 'SHADOW' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Sharpshooter (reSpecialized)[h4]   
 [B]Sharpshooter - Take the Shot[b]

[P]
With a love of firearms and a pride in personal accuracy, the Sharpshooter is the most desirable asset a team can ask for when a firelight erupts. He maintains his composure under a blanket of blaster bolts, takes careful aim, and eliminates threats with ruthless efficiency and lightning speed. Sharpshooters are, simply, the masters of personal-scale ranged combat.

[P]Not surprisingly, Sharpshooters gain [B]Cool, Perception, Ranged (Heavy),[b] and [B]Ranged (Light)[b] as career skills, and two of these gain a free rank if this is the first specialization for the PC. The focus on personal-scale ranged weapons is a natural fit for Sharpshooters, and their ability to take in their surroundings completely and assess targets carefully under high-stress situations is essential to their survival.

[P]Most Sharpshooters are thoroughly comfortable with any ranged weapon, though many will focus attention and effort on mastering a single (often highly-personalized) weapon. Some prefer a sniper role, taking up a hidden position and removing threats from the field as invisible dealers of death. Other Sharpshooters prefer a more direct approach, blaster energy blazing in waves of destruction as they cover their teammates against hordes of Imperial soldiers.

[P]The focus on individual excellence within the Alliance elevates the Sharpshooter over his typical counterpart in the Empire. He is encouraged to train to higher degrees of proficiency, and he is encouraged to master techniques of survival, depending on his team to stay alive. The average stormtrooper is given a decent amount of training, but the lack of attention to personal excellence means he will never reach the pinnacle of accuracy and deadly effectiveness attained by a Sharpshooter in the Rebellion.' WHERE key = 'SHARPSHOOTER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Shien Expert[h4]

A lightsaber is a potent weapon. When wielded forcefully, it can even overpower an opponent who has a weapon capable of parrying it. Further, its ability to deflect blaster bolts can make it an effective ranged weapon as well. Those who consider themselves Shien Experts—masters of the Shien lightsaber form—embrace the seeming contradiction between those two uses. They know that true lightsaber masters must possess the cunning to use such weapons to their full potential. It takes clever precision to reflect a ranged attack back toward an adversary. but just as much shrewd brilliance to recognize the right time to overpower adversaries through raw force.

[P]Shien Experts acquire [B]Athletics, Lightsaber, Resilience,[b] and [B]Skulduggery[b] as additional career skills. If this is the characters starting specialization, he may choose two of these skills and gain one free rank in each. without spending starting experience. In order to effectively follow this path, a character needs to be flexible and to recognize the best approaches for different types of physical conflicts. Resilience and Athletics are critical tools for engaging in and enduring a prolonged battle, while  Skulduggery enables the character to case out and prepare possible combat locations ahead of time to exploit the environment against an opponent.

[P]Whenever possible, a Shien Expert prepares a battleground well in advance of a conflict. Often, these individuals take the time to study a range of different locations soon after they arrive in a city. Once combat begins, they can carefully exploit the environment and trigger any traps they may have prepared to unleash upon their opponents.

[P]During combat, Shien Experts continue to constantly analyze the situation. While they take advantage of the terrain throughout a battle, they are also selective in choosing the best way to use their training as well as their lightsaber. This can change with each passing instant, in reaction to the armament, position, and stance of their enemies. For these individuals, an extended conflict is a sure route to victory as they react to every move their opponents make with a clever counter or powerful strike.' WHERE key = 'SHIEN' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Shii-Cho Knight[h4]

The ancient lightsaber fighting style of Shii-Cho is said to be the first lightsaber form taught to the Jedi and their predecessors. It focuses on the essentials of saber fighting and borrows heavily from other sword fighting techniques. Appropriately, the modern practitioners of this form focus on perfecting the core tenants of sword fighting, recognizing the strength of simplicity. Shii-Cho Knights eschew fancy maneuvers, preferring to focus on the fundamentals of block, parry. and strike.

[P]Shii-Cho Knights acquire [B]Athletics, Coordination, Lightsaber,[b] and [B]Melee[b] as additional career skills. If this is the character''s starting specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. These skills provide them with a solid grounding in the core techniques of any physical conflict. They are familiar with the weapon they wield, but they are also very comfortable exploiting their natural athleticism and flexibility. Because of this, they can not only avoid an enemy''s attack, but also make certain that they are able to strike effectively when their target is at a disadvantage.

[P]Followers of this path are seldom concerned with personal appearances or the style that they exhibit in a conflict. Instead, they are focused on precision and on achieving their ultimate goal of victory. For them, a solid grounding in the basics is something they can rely on in any situation. When lives are on the line, they devote their attention to executing their maneuvers in a traditional way, using them to counter an opponent while simultaneously restricting his options.' WHERE key = 'SHIICHO' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Ship Captain - Independant Leaders[h4]
For Ship Captains, their vessel and their crew are everything. Without them, captains are imprisoned in an incomplete existence. With both, they''re free. To protect this freedon, they demand an unmatched excellence from everyone aboard and provide the kind of leadership that gets these results. If crew members aren''t highly skilled when joining a crew, Ship Captains will push them to become so through inspirational words and leading by example. In exchange, crew members become a family and gain access to a wealth of camaraderie, connections, and experience.
[P]The additional career skills an PC receives when taking the Ship Captain universal specialization are [B]Charm, Leadership, Negotitation,[b] and [B]Piloting (Space)[b]. Given a good ship and loyal crew, there is little this PC cannot accomplish.
[P]Ship Captains captain ships. It''s what they do and who they are. For most beings, investment in a vessel is an unfathomable dream. For Ship Captains, the lack of a vessel is an unbearable nightmare. Once they''ve tasted the freedom only a starship or wide-ranging skimmer can provide, it becomes impossible to return to a predictable life and a seemingly meaningless existence. Ship Captains control their own lives.
[P]In order to live their dreams, Ship Captains rely on the contributions of an effective and close-knit crew. While they can find jobs and know the best places to sell goods, they aren''t necessarily the finest of pilots, engineers, or fighters. When needed, they can always step in to fill a vacancy in order to escape pursuit, make a temporary fix, or shoot a blaster, but the best captains have specialists to fill these roles. Such specialists tend to travel with a single captain for extended durations. As captains and crews become comfortable with each other, all members learn how best to perform their key responsibilities and where they can most effectively support everyone else. For many, this professional arrangement acts as a surrogate family structure, with the captain as parent.
[P]As surrogate parents, Ship Captains are responsible for keeping everyone in line and for pushing them to be their best. When there is a dispute between crew members, captains resolve it. When a decision needs to be made, captains make it, and when shipmates doubt their own capabilities in a moment of crises, captains instill them with confidence. Ship Captains themselves must be strong to earn the respect of their crews, but they cannot operate through strength and threats alone. If that strength can''t be tempered with compassion, every crew member will eventually find reasons to leave.
[P]This compassion is one reason why some captains rebel against the injustices of the Empire. For some of them, the Empire''s human-centric policies are intolerable, as they view species, beliefs, and affiliations as largely irrelevant as long as shipmates meld with the rest of the crew and perform well. Many others see the tightening grip of the Empire as a threat to their independant existence. This threat can be even more pronounced in light of a captain and crew''s past transgressions against the Empire.
[P]Independant and driven to stay that way, Ship Captains are dangerous threats to the Empire. No matter what role, legal or otherwise, they may have had before they gained ownership and command of a vessel, they offer much to freedom fighters. With the capability to lead strikes with effectively supported crews, they give hope to and signal the possibility of a more powerful organized resistance. Wherever they are needed, Ship Captains can get there and inspire their crews to victory.' WHERE key = 'SHIPCAPTAIN' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]SHIPWRIGHT (reSpecialized)[h4][BR]
[B]At a Glance[b][BR]
The Shipwright is the craftiest crafter in the game, and on top of getting the most out of developing new ships, they also can eke the most out of their designs in structured encounter[BR]
[B]All-in or Hybrid?[b][BR]
¼  Ship-Improvement In Encounters ¼  Crafting Focus ¼  Anti-Ship Gunnery ¼ Ship Repair[BR]
[B]What Should it be the Best At?[b][BR]
Building and Situationally-Improving Starships[BR]
[B]What should it be just “good” at?[b][BR]
Piloting Gunnery Knowing Stuff[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Droid Tech[i](Heavily invested in Crafting, but the goal is completely different. It invests in talents that leverage multi-step crafts the same way).[BR]
[I]Rigger[i](TImproves ships passively rather than actively. Also doesn’t “make” ships).[BR]
[IMechanic[i](The Mechanic is more about protecting the ship, which isn’t the priority of the shipwright. But they both dedicate a few slots to repairing the ship).[BR]
[B]Media Touchstones[b][BR]
Quarie (Star Wars: Rebels)[BR]
Frankie (One Piece)[BR]' WHERE key = 'SHIPWRIGHT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Skip Tracer (reSpecialized)[h4]
[B]SKIP TRACER—GIVING THEM A CHOICE[b][BR]
[B]At a Glance[b][BR]
Skip Tracers are the masters of getting to the target using a variety of social tools, contacts, and underhandedness. And once they’ve found them, negotiate paying off their bounty, or to come in quietly.[BR]
[B]All-in or Hybrid?[b][BR]
½ Underworld and skulduggery nonsense (the tracking), ¼ Combat Prowess, ¼ Negotiating.[BR]
[B]What Should it be the Best At?[b][BR]
Leveraging Information and People in the seedier parts of society to get their mark.[BR]
[B]What should it be just “good” at?[b][BR]
Being ready for danger and good at being the danger[BR]
General Negotiation[BR]
Breaking & Entering[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Investigator[i][BR]
[I]Marshal[i][BR]
[I]Interrogator[i][BR]
[I]Scoundrel[i][BR]
[B]Media Touchstones[b][BR]
Din Djarin (The Mandalorian)[BR]
Faye Valentine (Cowboy Bebop)[BR]
Greedo (Episode IV: A New Hope)[BR]' WHERE key = 'SKIPTRACER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Sleeper Agent (reSpecialized)[h4]
[B] Sleeper Agent - Ensuring Trust[b]
[P]
Spies must be able to tell convincing lies. Often, a lie only needs to hold up for a few seconds—just long enough for the agent to complete a crime. In some cases, the lie must be more convincing and survive much more detailed scrutiny. Sleeper Agents must be able to operate in isolation from their support network for months or even years at a time. During such missions, operatives should blend seamlessly into their host environments, never arousing even the slightest suspicion. Sustaining believable lies for this much time requires dedication so that no hint of their real identity ever emerges. For some Sleeper Agents, their artificial guises are so ingrained that it takes effort to emerge from them once a lengthy mission is finally over.
[P]Sleeper Agents acquire [B]Charm, Cool, Discipline,[b] and [B]Knowledge (Education)[b] as additional career skills. If this is the character''s starting specialization, the player may choose two of these skills and gain one free rank in each without spending starting experience.
[P]On a mission, the vast majority of Sleeper Agents'' time involves working a mundane job that may seem unrelated to their objective. In a few cases, the job is a military one, but those assignments require extensive security checks. More often, the Sleeper Agent works a civilian job that may have military connections. The agent may even serve as a member of a criminal organization. Whichever is the case, the Sleeper Agent''s duties offer peripheral access to a resource that is of great interest to the Rebellion. It is vitally important that agents remain constantly discreet about their true intentions.
[P]All Sleeper Agents must be proficient in some profession that is not inherently related to uncovering military intelligence for the Rebellion. They might not need to be experts, but they must be able to convincingly assume an unremarkable civilian or military career. This act must be sustained for an extended period of time while the operatives wait to have their missions activated. Some missions focus entirely upon placing agents in critical places so that they can be activated to avert a currently unknown crisis. In these cases, the agents might pursue their cover career for years. Other missions have established timeframes or discrete objectives that the operative must pursue without raising suspicion.
[P]Critically, Sleeper Agents must remain unflinchingly loyal to their cause. At the same time, they must be able to maintain the illusion that they are loyal to the enemy. In the case of extended assignments, they must build friendships and working relationships with their foes—relationships that they know they will eventually betray. Few individuals are capable of maintaining this level of duplicity without developing some level of emotional attachment. Such attachment incurs terrible risk, as it could lead to hesitation at a critical juncture.' WHERE key = 'SLEEPERAGENT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Slicer (reSpecialized)[h4]
[B]SLICER[b][BR]
[B]At a Glance[b][BR]
Slicer is the quintessential hacker. They infiltrate the analogue computer systems of Star Wars the way a thief picks a lock, and if thy''re lucky, get away unnoticed.[BR]
[B]All-in or Hybrid?[b][BR]
⅔ Slicing & Computers, ⅙ General Stealth, and ⅙ Underworld Stuff[BR]
[B]What Should it be the Best At?[b][BR]
Slicing & Computers[BR]
[B]What should it be just “good” at?[b][BR]
Stealth[BR]
Underworld fixing[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Strategist[i](More of a military analyst than an aggressive slicer, but cyber-warfare is)[BR]
[I]Analyst[i](The analyst plays more into the helpful support archetype, and the slicing is more of a sub niche))[BR]
[B]Media Touchstones[b][BR]
D.J. (Episode XIII: The Last Jedi)[BR]
Conder Nash (Star Wars Aftermath: Life Debt)[BR]
Updated 12/10/2025' WHERE key = 'SLICER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Soresu Defender[h4]

Guardians frequently and deliberately put themselves in harm''s way in order to aid others. However, just as the Protector is unmatched at keeping others safe. the Soresu Defender has mastered the art of self defense. With lightsaber in hand, Soresu Defenders can fend off hordes of enemies or stand firm against hails of blaster fire. surviving the worst the enemy can throw at them.

[P]A Soresu Defender earns additional career skill access to [B]Discipline, Knowledge (Lore), Lightsaber,[b] and [B]Vigilance[b]. If this is the character''s starting specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. With this combination of skills, the character can maintain constant vigilance, recognize threats, and remain resolute in the face of danger.

[P]Soresu Defenders depend on the Force to guide them through dangers. Their techniques rest almost entirely on knowing how best to use their weapons for defensive purposes. In many ways, this style approaches the level of precognition, as the Force guides its practitioners to use their weapons to deflect an incoming attack or to move out of the way of an assault. Individuals who are unaware of their Force potential can become accomplished martial artists using these techniques, but true Soresu Defenders must be sensitive to the Force.' WHERE key = 'SORESU' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Spice Dealer[h4]
Please see User Data for details.' WHERE key = 'SPICEDEALER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Squadron Leader (reSpecialized)[h4]
[B]SQUADRON LEADER—”WAIT FOR MY SIGNAL”[b][BR]
[B]At a Glance[b][BR]
The Squadron Leader is the tip of the spear, the first to call the attack, the retreat, evasive maneuvers, etc. [BR]
They make the call when there''s a shot to be made.[BR]
[B]All-in or Hybrid?[b][BR]
½  Leadership ½ Squad-Based piloting[BR]
[B]What Should it be the Best At?[b][BR]
Squad Based Piloting[BR]
[B]What should it be just “good” at?[b][BR]
Armed Conflict[BR]
Piloting[BR]
Dogfighting[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Wingmate[i](Definitely a party-focused pilot, but a good bit different. The Wingmate covers for their allies, whereas the Leader managers the action economy)[BR]
[I]Warden[i](The Warden is a defensive coercion character, which is pretty close. Obviously the Warden is more of a martial artist)[BR]
[I]Instructor[i](The Ground-level version of the Wingmate, all about managing the action economy)[BR]
[I]Merc Soldier[i](definitely the “warrior who leads", which is about where the Squadron lives)[BR]
[B]Media Touchstones[b][BR]
Garvin Dreis “Red Leader” (ANH)[BR]
Wedge Antilles (ESB and ROTJ)[BR]
Antoc Merrick (Rogue One)[BR]' WHERE key = 'SQUADLEADER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Starfighter Ace[h4]

Starfighter pilots enthusiastically engage in one of the most dangerous forms of battle imaginable. Their shields and armor—for starfighters that have either—offer virtually no resistance to the weapons of the capital ships they oppose. Instead, they must trust in the Force to protect them as they launch their daring assaults. Those who embrace the risks of space combat may pursue the Starfighter Ace specialization.

[P]Starfighter Aces acquire [B]Astrogation, Gunnery, Mechanics,[b] and [B]Piloting (Space)[b] as additional career skills. If this is the character''s starting specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. These provide the essentials needed to successfully pilot a starfighter in combat. Force adepts who acquire these skills most often control single-passenger craft, in which they must assume responsibility for weapons at the same time that they handle navigation.

[P]While this style of combat is dependent on a vehicle, it remains physically exhausting. Even with a full range of technological enhancements, effective pilots must be capable of enduring rapid and extreme shifts in velocity and direction. They must also remain ready to strike a deadly blow against an opponent at just the right instant, even while struggling to endure extreme physiological conditions.' WHERE key = 'STARACE' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Steel Hand Adept[h4]
See page 28 of the Knights of Fate Sourcebook for details.' WHERE key = 'STEELHAND' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Strategist (reSpecialized)[h4]
[B]STRATEGIST—ANALYZING THE DATA[b][BR]
[B]At a Glance[b][BR]
The Strategist is both the intelligent battle-leading Master of War, and the gifted know it all who can come in clutch when knowing is half the battle. [BR]
[B]All-in or Hybrid?[b][BR]
½ Knowledge-Based War Leader ½ Warfare & General Knowledge Specialist[BR]
[B]What Should it be the Best At?[b][BR]
Mass Combat[BR]
Putting Knowledge to Work[BR]
[B]What should it be just “good” at?[b][BR]
Initiative as a niche[BR]
Force Multiplying[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Analyst[i](They both have a serious investment in knowledge, and while the Analyst is more generalist and supportive in non-combat scenarios)[BR]
[I]Tactician[i](If the Strategist is the master of war, the tactician is the master of Battle. The tactician focuses more preparedness and cunning, where the Strategist is all on knowledge)[BR]
[I]Figurehead[i](More of a head of state or military-oriented diplomat, the figurehead can lead the war through sheer force of personality. They support in non mass combat situation with Presence vs the Strategist’s intellect)[BR]
[IScholar[i](Shares the scholar’s utility in using knowledge for utility and as a force multiplier, but isn''t as all in on it)[BR]
[B]Media Touchstones[b][BR]
Grand Admiral Thrawn (Star Wars: Rebels)[BR]
Jan Dodonna (Andor, Rebels, ANH)[BR]
Crix Madine (ROTJ)[BR]
Sima Yi (Romance of the Three Kingdoms)[BR]
Ender (Ender’s Game)[BR]' WHERE key = 'STRATEGIST' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Survivalist (reSpecialized)[h4]
[B]SURVIVALIST—MASTER OF THE WILD[b][BR]
[B]At a Glance[b][BR]
A rugged, self sufficient, primal Hunter and killer of sentients. Good at going for the throat when the opportunity presents itself.[BR]
[B]All-in or Hybrid?[b][BR]
½ Rugged Outlander & Survivalist ½ Hunter and Killer.[BR]
[B]What Should it be the Best At?[b][BR]
Tracking Sentients and Killing Them[BR]
[B]What should it be just “good” at?[b][BR]
Being fairly hardy and hard to land meaningful hits on[BR]
Using knowledge and craftiness to become stronger[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Big Game Hunter[i][BR]
[I]Trailblazer[i][BR]
[B]Media Touchstones[b][BR]
Zuckuss (Episode V: The Empire Strikes Back)[BR]
John Rambo (Rambo: First Blood)[BR]
Daryl Dixon (The Walking Dead)[BR]
updated 12/10/2025' WHERE key = 'SURV' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Tactician (reSpecialized)[h4]
[B]TACTICIAN—PITHY DESCRIPTION[b][BR]
[B]At a Glance[b][BR]
The Tactician is the perfect melding of the squad-based NCO and the battle commander. They manage the tactics, battle plan, and sometimes lead the charge against the enemy. [BR]
[B]All-in or Hybrid?[b][BR]
⅕ Competent Ranged Combatant 2/5 Squad Commander 2/5 Ground Combat Tactical Leader[BR]
[B]What Should it be the Best At?[b][BR]
Ground Combat Battle Planning[BR]
[B]What should it be just “good” at?[b][BR]
Ranged Combat[BR]
Survivalism[BR]
Leadership[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Mercenary Soldier[i](the Merc Soldier is a gunman who can lead, whereas the Tactician is a Warleader who can shoot. They definitely have a ton of overlap)[BR]
[I]Squadron Leader [i](SL and Tactician are definitely similar in that they are embedded in a unit to some extent. The Squadron Leader obviously belongs in space, but it has the half fighter, half leader vibe. The Tactician has a decided lean towards leadership)[BR]
[I]Instructor[i](much like the SL, it''s a half leader, half unit fighter. Obviously more of a defensive leader)[BR]
[I]Commodore[i](Probably the closest to a space counterpart. Commodore is much better while in their signature command, but can still excel otherwise. They are much more of a utility + Leader)[BR]
[I]Warleader[i](Probably the closest to a 1 for 1. It''s all about leadership and survival and combat. The force element is not even as pronounced as it could have been)[BR]
[I]Clone Commander[i](More of a Commodore + Strategist, but there are similarities in the percentage of leadership it does)[BR]
[B]Media Touchstones[b][BR]
Micha Evron (Twilight Company)[BR]
Captain Rex (Star Wars: Clone Wars)[BR] 
General Reikan (Empire Strikes Back)[BR]' WHERE key = 'TACTICIAN' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Teacher[h4]


[B]CAREER + SPECIALIZATION POWERS:[b] Influence, Move, Imbue/Exhaust, and Valor/Horrify.
[P]There comes a time in the life of most who feel the draw of the Force when they decide that they can best serve the galaxy by passing along the accumulated knowledge and wisdom of their lifetime. Whether they have been classically trained in one of the ancient disciplines, have pursued a more mundane education in an academy or conservatory, or are self-taught through innate discipline and drive, Teachers now seek to assist others in gaining the training and enlightenment they have accrued. Through the efforts of Teachers, their allies can attain greater abilities and assets than they would have alone.
[P]A Teacher''s additional career skill are [B]Knowledge (Education), Knowledge (Lore), Leadership,[b] and [B]Perception[b]. Characters who select this as their starting specialization may choose two of these skills and gain one free rank in each, without spending starting experience. Given their selection of skills, Teachers will be far better at enhancing the potential of their group than any other Consular. In addition to providing valuable assistance to their companions, Teachers are more than capable of holding their own in almost any situation. They can pursue a wide range of skills and abilities with an eye toward passing this knowledge along to others. Teachers feel the presence of the Force throughout their life and will feel the draw of many paths through the years. Through this process, they will accumulate a vast store of knowledge and experience. Many reach a point where the drive to push on is overcome by the desire to push on is overcome by the desire to pass on their knowledge to others, to better serve the galaxy.
[P]Some Teachers work closely with established schools and academies, perhaps echoing the techniques and traditions of the fallen Jedi Temple. Many of these work in the Outer Rim, far from the prying eyes of the Galactic Empire. Others, feeling no need for more advanced aids and accoutrements, content themselves with little more than a clearing or a log to sit their pupils upon, from which they might contemplate the mysteries of the galaxy together. Teachers are often keenly aware of their place in the scheme of life and seek to pass the peace and assurance of this knowledge on to their students, that their own purposes. No matter the particular goal of the moment, a Teacher will have advice and instruction to assist in its achievement.
[P]In the course of a lifetime, any setting can turn into a classroom with a willing Teacher on one side and an apt pupil on the other. Whether in a dry, dusty hut in the middle of a desert, the sodden expanse of a humid swamp, or the cramped confines of a tramp freighter, Teachers will do what is needed to see that their students are prepared for the tasks that lie before them.
[P]Often the path of the Teacher is not one that is selected, but one that is thrust upon one by circumstance. In the pursuit of expansive goals, it may be hard to realize that it is best left to others to achieve them, the responsibility of the Teacher being to assist them and shepherd them along. Having a Teacher in a group can be a great boon no matter the goal, given the versatility of Teachers'' abilities and their capacity to assist other members of their group in any efforts they may make. When the need is greatest and a new generation must rise to confront the darkness, there can be no greater ally in the Force than knowledge passed down from the vantage of experience and understanding.' WHERE key = 'TEACHER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Thief (reSpecialized)[h4]

[B]At a Glance[b][BR]
This is the smuggler who is most at home in the shadows, taking what he needs as he needs it. Able to get in and get out without anyone knowing they were there.[BR]
[B]All-in or Hybrid?[b][BR]
2/5 Stealth, 2/5 Stealing & Sleight of Hand, 1/5 Selling off or ‘fencing’ their stolen goods[BR]
[B]What Should it be the Best At?[b][BR]
Stealth[BR]
Pickpocketing and Stealing goods[BR]
Entry and Exit[BR]
[B]What should it be just “good” at?[b][BR]
Selling off goods that are stolen. They mostly get the goods.[BR]
Underhanded Combat, they prefer to cut and run rather than fight.[BR]
Disruption of Security[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Courier[i] (The courier is the spy version of the thief, more oriented towards athleticism)[BR]
[I]Scavenger[i] (Like the thief, they gain things to be sold)[BR]
[I]Assassin[i] (Get in, do your thing, get out)[BR]
[B]Media Touchstones[b][BR]
Kay Vess (Star Wars Outlaws)[BR]
Ezra Bridger (circa Star Wars Rebels)[BR]
Garret (Thief)[BR]
Robin Hood[BR]
Aladdin[BR]
Gambit (X-Men)' WHERE key = 'THIEF' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Trader (reSpecialized)[h4]
[B]TRADER—THE ART OF THE DEAL[b][BR]
[B]At a Glance[b][BR]
The Trader is the consummate communicator and pitch-man. They can make a deal as easily as they can breathe.They are Shrewd, capable, and a little bit untrustworthy.[BR]
[B]All-in or Hybrid?[b][BR]
Hybrid, ⅓ general utility related to criminality and “knowing people” being well-traveled, and ⅔ about trading and salesmanship, extending that to more general utility.[BR]
[B]What Should it be the Best At?[b][BR]
Trading, especially physical goods[BR]
[B]What should it be just “good” at?[b][BR]
General Negotiating[BR]
Underworld Maneuvering[BR]
Social Defense[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Entrepreneur[i][BR]
[I]Scavenger[i][BR]
[B]Media Touchstones[b][BR]
Badger (Firefly)[BR]
Watto (TPM)[BR]
Quark (DS9)[BR]
Updated 12/10/2025' WHERE key = 'TRADER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Trailblazer (reSpecialized)[h4]
[B]Trailblazer - Unseen Paths[b][P]

When facing a numerically superior enemy with access to better weapons, armor, and supplies, an army must leverage absolutely every advantage possible. The Soldiers of the Alliance to Restore the Republic have grown accustomed to fighting while outnumbered and outgunned, and have honed their wits to compensate and regain the advantage against the Empire. One area in which rebel Soldiers frequently have the edge is in knowledge of the terrain and how to use it. Even storm troopers, the supposed elite of the Empire, frequently fall prey to its rigid modes of thinking, and Trailblazers can use their superior knowledge of the terrain and unorthodox tactics to surprise and overwhelm their foes.
[P]Catching the enemy off guard is one of the oldest and most diverse tactics in the galaxy, and Trailblazers seek to turn it to their advantage at every turn. To this end, a Trailblazer recieves [B]Knowledge (Outer Rim)[b], [B]Perception[b], [B]Stealth[b] and [B]Survival[b] as additional career skills. If this is a character''s starting specialization, he may choose two of these skills and gain on free rank in each, without spending starting experience. Survival makes the Trailblazer better at tracking foes and setting clever traps, while Stealth helps in avoiding enemies who might uncover the Trailblazer''s presence.
[P]Trailblazers tend to favor patience and indirect solutions, pitting the foe against the wilderness or using the features of the terrain to eliminate enemy advantages. Heavy walkers cannot function in the confines of a forest, for instance nor can massive infantry surges push through urban environments without exposing themselves to risk. Trailblazers work to make the best of cover and prefer to fight on their own turf, where they can turn every piece of their knowledge to their advantage. The Cunning Snare talent, in particular, shnes here, giving the Trailblazer the ability to set up a devasting trap for unsuspecting foes. while this talent takes some setup to use, the payout can be considerable, levelling a fight with a numerically superior or better-equipped foe. The Trailblazer can even use this talent without advanced supplies, using cleverness and woodcraft to overcome dire situations if the PCs are ever stranded without access to optimal gear—and on the shifting battlefields of the Galactic Civil War, Soldiers of the Rebellion can find themselves cut off and without support in an instant.
[P]Trailblazers often act as guides to other members of their squads, helping them to avoid the dangers of the wild and the battlefield alike as the group moves to the most advantageous position possible.  A skilled Trailblazer can not only allow a group of PCs to win difficult battles through subterfuge and trickery, but also to avoid unnecessary battles entirely. The Rebel Alliance frequently needs to achieve objectives without the Empire noticing, and so the best battle is often the one that was never fought. A Trailblazer can be a substantial boon to any [B]Age of Rebellion[b] group in other contexts, too whether the PCs are moving through the wilds or the streets of a city.' WHERE key = 'TRAILBLAZER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Vanguard (reSpecialized)[h4]
[B]Vanguard - Unrelenting Onlaught[b][P]

Vanguards are first to the fight, Soldiers skilled in taking point and taking charge. While they generally do not command in the traditional sense, their preferred mode of combat is to hit hard and fast, and thus allies tend to fall in behind them, if only so that they are not left behind. This means that Vanguards shoulder a great deal of the risk in battle, but most would rather take a blaster bolt than let a squadmate be shot. As a result of taking so many hits over the course of their military careers, the Vanguards who survive tend to be extremely tough.
[P]Vanguards have [B]Athletics[b], [B]Cool[b], [B]Vigilance[b], and [B]Resilience[b] as additional career skills. If this is a character''s starting specialization, he may choose two of these skills and gain one free rank in each, without spending starting experience. Having both Cool and Vigilance means that Vanguards are extremely unlikely to flinch or hesitate when the shots start flying, regardless of whether they are launching an ambush or reacting to an unexpected move. Athletics reflects the physical acumen of Vanguards, while Resilience stems from the long history of hits such characters have likely taken.
[P]On battlefields often dominated by massive walkers, sudden starfighter strikes, and orbital bombardments, standing still in the open can be a death sentence, and Vanguards know it. Rather than hunkering down and hoping to avoid the worst, Vanguards take the battle directly to the enemy, seizing the in itiative to end the battle before their foes even realize that it has begun. They tend to favor rapid strikes, armored assaults, and shipboard actions that leave the enemy reeling and unable to bring its arm or to bear. So long as they keep moving, their logic goes, the enemy cannot hope to pin them down. Barriers to their entry, from blast doors to bunkers, are som ething to be smashed so that they can move on to the next target. The Moving Target talent is particularly useful when keeping mobile to stay alive, and makes a Vanguard with the drop on the enemy extremely difficult to bring down.
[P]Off the field of battle, Vanguards are frequently quick to action as well. Hesitation on the battlefield is often fatal, and many Vanguards apply this mentality to their other activities, trying to keep opponents.' WHERE key = 'VANGUARD' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Warden - The Daunting Defender[h4]
Whether they wield the power of the Force consciously or not, Wardens know that they have been gifted with power. But more importantly, they know that they must wield this might to perform a necessary duty, subduing those who would abuse that same power to harm the Warden''s friends and allies. While Guardians of all stripes might be driven by a desire to create a fairer world, the concept of justice is especially important to Wardens. The job of punishing the wicked is frequently a thankless one, especially in the era of the Empire, when the ruling regime is so deeply corrupt. Many Wardens see this burden as inevitable; after all, it is their role to make sure evil is stripped of the means to threaten their chosen allies, not to be loved for these efforts.
[P]The Warden is unique among Guardian specializations in being focused specifically on weakening enemies rather than just bolstering allies. In some ways, this specialization is the mirror image of the Aggressor. Both wield fear as a weapon, but the Warden uses dread to weaken foes'' strikes rather than make them more vulnerable to attacks, and relies on counterattacking instead of striking first. What a Warden lacks in raw toughness as compared to a Protector or Armorer, this unique Guardian makes up for with the ability to control foes options by restricting their movement, inflicting strain upon them and intimidating them into submission.
[P]To assist in their task of identifying and subduing threats to their allies, Wardens have [B]Brawl, Coercion, Discipline and Knowledge (Underworld)[b] as additional career skills. If this is the characters stating specialization, he may choose two of these skills and gain one free rank in each without spending starting experience.
[P]Wardens are suited to taking major roles on and off the battlefield, thanks to their specialization''s focus on Coercion. While using intimidation as a primary social tool can have consequences for the character''s morality, many unnecessary fights can be avoided if potential foes are too afraid to draw weapons against a Warden. In battle, Wardens shine in close quarters, where foes must approach to attack and thus suffer the consequences of engaging such frightening enemies. Wardens do what is needed to give their allies the best chance of survival in a harsh galaxy, and if this includes some unsavory tasks, so be it.' WHERE key = 'WARDEN' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Warleader - The Shrewd Leader[h4]
Not all Guardians solve their problems through feats of prowess with the lightsaber alone. The mind can be a deadlier weapon still, and a little foresight can do as much to win a battle as the greatest feat of heroism. The Warleader possesses a number of tricks and abilities that help to carry the day in battle, and more importantly, to keep friends and allies alive to fight another day.
[P]Warleaders are calculating fighters who rely more on mental acuity and guile tan on raw combat strength. While Warleaders are capable combatants in their own right, thanks to their ranged combat skills, their greatest edge comes when they have comrades in arms to guide in battle. Unlike Peacekeepers, Warleaders do not focus on inspiring others; while individual Warleaders might indeed be charismatic, their friends trust them with their lives not because of rousing speeches, but because of their reliability in the field.
[P]Warleaders might not protect their allies by deftly deflecting blaster shots with  lightsaber or heroically taking blows meant for them, but their guidance can keep comrades safe just the same. Warleaders acquire [B]Leadership, Perception, Ranged (Light) and Survival[b] as additional career skills, all of which assist them in negotiation on the battlefield and guiding their allies across it. If this is the character''s starting specialization, he may chose two of these skills and gain one free rank in each without spending starting experience.
[P]Whether through formal military training, practical combat experience or simply having keen minds, PC''s who take on this specialization are well-equipped to handle matters of strategy and tactics. Warleaders often have an intuitive grasp of the field of combat thanks to their connection to the Force, and combine this with shrewd tactics to concoct and execute forward-thinking plans that seem almost prescient to their foes. Cover is an especially valuable resource for Warleaders. They can use it not only to grant their comrades additional defensive benefits, but also to gain the edge over enemies by guiding allies to strike them from unexpected angles.
[P]Trust is the foundation of any Warleader''s command. More often than not in [B]Force and Destiny[b], a party of Player Characters consists of a group of equals pursuing a common goal rather than a formally structured organization. Even if one PC is nominally in charge, that person might or might not be the Warleader. When battle breaks out, however, the Warleader keeps friends out of the line of fire, exposes weaknesses in enemy plans, and comes up with cunning strategies  that catch foes off guard.
[P]Outside of battle, the Warleader''s acute problem-solving skills can also be very useful, as can the character''s foresight. Regardless of the situation, the Warleader can look at challenges from an angle others might have neglected. In doing so, the Warleader can help lead the group to victory through unexpected solutions.' WHERE key = 'WARLEADER' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Archeologist (Respec 1.2)[h4]
[B]ARCHAEOLOGIST—DELVING INTO ANTIQUITY[b][BR]
[B]At a Glance[b][BR]
The Archaeologist is an action hero that spelunks, discovers that which was lost, and overall excels in the fringes and lost spaces of the Galaxy. Indiana Jones to a T.[BR]
[B]All-in or Hybrid?[b][BR]
Hybrid 1/2 Knowledge Character, 1/2 "Indiana Jones / Aphra Adventurer"[BR]
[B]What Should it be the Best At?[b][BR]
Interacting with Old Stuff (and Technology) and places[BR]
[B]What should it be just “good” at?[b][BR]
Rough & Tumble[BR]
Using knowledge for general utility[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Sage or Analyst[i] in that is combines Knowledge skills & some other niche[BR]
[I]Scholar[i][BR]
[I]Fringer[i][BR]
[B]Media Touchstones[b][BR]
Indiana Jones[BR]
Chelli Aphra (Marvel Comics Star Wars)[BR]
Dr. Liara T''Soni (Mass Effect)[BR]
Updated 12/10/2025' WHERE key = 'ARCHEOLOGIST' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Field Agent[h4]
The field agent is the jack-of-all-trades spy that operates in the field, often sent to investigate and infiltrate a situation socially. While a decent combatant, they mostly talk their way out of problems and resort to fisticuffs and light concealable weapons.' WHERE key = 'FIELDAGENT' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Ground Support (reSpecialized)[h4]
[B]GROUND SUPPORT—(Driver Replacement)[b][BR]
[B]At a Glance[b][BR]
The Ground Support is the armor, land, and airspeeder pilot that flies in to force multiply, save the day, and otherwise route enemy armor. They’re not afraid to get deep into enemy territory and push through to the other side.[BR]
[B]All-in or Hybrid?[b][BR]
½ General Driving w/ Defensive Focus ¼  Tank as Offensive Power ¼ Perception and Force Multiplier [BR]
[B]What Should it be the Best At?[b][BR]
Driving bulkier, worse handling vehicles, both on the ground and in space[BR]
Driving under Poor Conditions[BR]
Support of Ground operatives[BR]
[B]What should it be just “good” at?[b][BR]
General Piloting[BR]
Navigation in space and on land[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Bodyguard[i](A much more personal-scale combatant that transitions to defensive land vehicles. More about being tanky and supporting infantry while inside the vehicle.)[BR]
[I]Clone Pilot[i](the clone pilot is more about troop transport directly than anything else, but leans into the RAW pilot Direction.)[BR]
[I]Gunner[i](Less about raw output than the Gunner, more about a holistic land pilot during mixed combat.)[BR]
[B]Media Touchstones[b][BR]
Bodhi (Rogue One)[BR]' WHERE key = 'GROUNDSUPP' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
UPDATE ref_specializations SET description = '[H4]Wingmate (Respec 1.0)[h4]
[B]WINGMATE—Pilot Replacement[b][BR]
[B]At a Glance[b][BR]
The Wingmate is the ultimate flying support tree. They keep their head on a swivel to make sure their allies are prepared for danger and ready for the next sortie.[BR]
[B]All-in or Hybrid?[b][BR]
⅔  Piloting Generalist ⅓ Space Piloting Support[b][BR]
[B]What Should it be the Best At?[b][BR]
Defending allies in space combat[BR]
[B]What should it be just “good” at?[b][BR]
Piloting Space Generalist[BR]
Dogfighting[BR]
Initiative[BR]
[B]Specs for Comparison / Inspiration[b][BR]
[I]Pilot (RAW)[i](The Wingmate maintains many of its core elements, but doesn''t go to the same extremes with all of them, specially top speed and damage output)[BR]
[I]Vanguard[i](Generally the idea of a “initiative"-forward bodyguard, but less emphasis on personal tankiness.)[BR]
[I]Bodyguard[i](Very similar, using vigilance instead of perception)[BR]
[B]Media Touchstones[b][BR]
Wedge Antilles (A New Hope)[BR]
Coran Horn (Rogue Squadron Books)[BR]' WHERE key = 'WINGMATE' AND dataset_source = 'respec' AND description ILIKE '%Please see page%';
