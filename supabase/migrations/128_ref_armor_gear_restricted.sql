-- 128_ref_armor_gear_restricted.sql
--
-- ref_weapons has always had a `restricted` boolean, sourced from OggDude's
-- <Restricted> tag. ref_armor and ref_gear never got the same column —
-- scripts/parse-oggdude.ts's parseWeapons() reads w.Restricted (line 172);
-- parseArmor()/parseGear() never reference a.Restricted/g.Restricted at all,
-- a seeder gap, not a source-data gap. Found while building The Archive
-- Market feature, whose legality/tier rules need "is this item restricted"
-- as a property on every item table, not just weapons.
--
-- Source of truth is oggdude/DataCustom/Armor.xml and Gear.xml (items are
-- OggDude-canonical per CLAUDE.md's dataset rule) — NOT "respec project
-- data/", which is a different, non-canonical copy for these tables and
-- disagrees on <Restricted> counts (respec's Armor.xml has only 31
-- true-tagged rows against oggdude's 43; not investigated further since
-- oggdude is canonical for items regardless).
--
-- Verified counts, keys extracted from oggdude/DataCustom/*.xml via
-- fast-xml-parser (same library scripts/parse-oggdude.ts uses):
--   ref_armor: 112 total rows (matches XML's 112 <Armor> blocks exactly,
--     1:1 key correspondence, no aliasing needed) — 43 restricted=true.
--   ref_gear: 610 total rows (matches XML's 610 <Gear> blocks exactly) —
--     135 restricted=true. One XML row (DATABRBO, "Blackops Data Breaker")
--     has <Restricted>true</Restricted> written TWICE inside one <Gear>
--     block (a duplicate-tag typo in the source file itself, confirmed by
--     direct inspection) — a naive text-grep count therefore double-counts
--     it and reads 136; the correct de-duplicated count of distinct
--     restricted gear ITEMS is 135. DATABRBO is still counted once here.
--
-- Custom (is_custom = true) rows are untouched — restricted defaults false,
-- matching every other new-item default in the item editors; GMs can flip it
-- per item like any other custom field.

ALTER TABLE ref_armor ADD COLUMN IF NOT EXISTS restricted boolean NOT NULL DEFAULT false;
ALTER TABLE ref_gear  ADD COLUMN IF NOT EXISTS restricted boolean NOT NULL DEFAULT false;

UPDATE ref_armor SET restricted = true WHERE key IN (
  'ALLIANCELTSTEALTH','ARC','ARMROBE','CLOAKCOAT','FLIGHTCF9','FLIGHTTX3','FORMCOUNARM','HBA',
  'HT77COLDARM','HUNTTROPHARM','HUTTSHELLARMOR','IMPHAZARD','IMPSTORMCOMM','INDFLDDISR','JEDIBA',
  'JEDICOMM','JEDITEMGUAARM','JEDITRAINSUIT','JEDITRAINSUITW','KAVDANNPA','MANDOARM','MIMETICSUIT',
  'MK1KATARN','MKIIINSARM','MKINIGHTSTALK','MKIXMIM','MODARMORIII','PHASEIARC','PHASEICLONE',
  'POWARMOR','POWCAPARM','PROTECTOR','REBELHEAVY','RIOTARMOR','SCAVCLONE','SITHPAIN','STEELSKIN',
  'ZEPHYRSTEALTH','CLONEDIVE','CLONERECON','KATARNCOMM','PHASEIIARC','PHASEIICLONE'
);

UPDATE ref_gear SET restricted = true WHERE key IN (
  'AFFIDECRYS','ARDOS','ASHMALA','AVASPCARGO','AVASPDOSE','BEASTKAADU','BEASTTHRANTA','BOOSTBLCARGO',
  'BOOSTBLDOSE','CHCUBELOADED','COMSCAN','CORTEXBOMB','CREDITCLEAN','CYBERCAVITY','CYBERDISGUISE',
  'CYNEUROMACH','DAIBENDU','DATABR','DATABRBO','DATADEADDROP','DATASPIKE','DEATHSTCARGO','DEATHSTDOSE',
  'DEMONMASK','DENTOX','DH77HEADCOMM','DIOXIS','DIPLAUTH','DROIDACLAW','DROIDASP19','DROIDASSASIN',
  'DROIDBT','DROIDDZ70','DROIDE522','DROIDEODMKIV','DROIDIG100','DROIDINTEROG','DROIDLSX','DROIDMISEC',
  'DROIDPROBEV','DROIDPROTM3PO','DROIDRA7','DROIDRM','DROIDSRSERIES','DROIDTCSC','DROIDTS',
  'DROIDTSERIES','DROIDWSWMKIII','ELB','ESCCIR','EXPLIMP','EXPLOSIVESBELT','EXPLSHAC','FALSECRED',
  'FLESHCAM','FNGRPRNTMSQ','FORGETOOLS','FRANGFP1','GARROTECHRONO','GLITTERCARGO','GLITTERDOSE',
  'GUNJACK','GUNJACKCONT','HOLOCRONASGU','HOLOCRONBRSW','HOLOCRONCOCO','HOLOCRONCOPER','HOLOCRONDIME',
  'HOLOCRONLOLS','HOLOCRONMERL','HOLOCRONORPS','HOLOCRONSAMP1','HOLOCRONSANC','HOLOCRONSKVI',
  'HOLOCRONWARDE','HOLOCRONXESU','HOLODISGUISE','ID9SEEKER','IMPACT100D','IMPACTD','IRONFIST',
  'JEDIMULTITOOL','JEDIUTILBELT','KARRAK','KARRAK100','KNACKBOLT','KXENFORCER','LESAICARGO',
  'LESAIDOSE','LOCKHAND','LOCKPICKS','LOCKPICKSET','LONGSIGHT1','MEDFOCUS','MICRODRLIST','MODEL31STUN',
  'MUON100D','MUOND','NETUPLINK','NEUTPIX','NEUTPIX100','POISONRING','PSF','QUESTIONER9',
  'QUESTIONER9100','RAQUOR','REPINSIG','REPINSIGREP','REPSEAL','RETINALIMP','RYLL','RYLLCONT',
  'SABACCMARKED','SCRAMBLEKEY','SECCOLLAR','SHADOWCLOAK','SIGMODPAD','SKIFTER','SKIRTOPANOL',
  'SLEIGHTBOXL','SLEIGHTBOXM','SLEIGHTBOXS','SLEIGHTBOXT','SLEIGHTBOXVL','SLICEWIRE','SSNP','SSNT',
  'STAG','STUNCOLOR','WJ880BLIND','YALADAI','YALADAI100','YARROCKCARGO','YARROCKDOSE','NANODROIDS'
);
