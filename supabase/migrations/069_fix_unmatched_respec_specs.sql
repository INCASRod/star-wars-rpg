-- 069_fix_unmatched_respec_specs.sql
-- Fixes 5 versioned reSpec specialization files that were not matched in migration 068.
--
-- Archeologist (Respec 1.2)   → UPDATE existing respec row (key ARCHEOLOGIST)
-- Droid Specialist (Respecialized) → INSERT new respec row (key DROIDSPEC, XML key DROSPEC)
-- Wingmate (Respec 1.0)        → INSERT new respec row (key WINGMATE1.0, matches career)
-- Ground Support (Respec 1.0)  → INSERT new respec row (key GROUNDSUPP1.0, matches career)
-- Maintainer (Respecialized)   → INSERT new respec row (key MAINTAINER, matches career)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Archaeologist: update reSpec row with Respec 1.2 talent tree
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE ref_specializations
SET
  name = 'Archaeologist',
  career_skill_keys = ARRAY['ATHL','DISC','EDU','LORE'],
  talent_tree = '{
    "rows": [
      {
        "index": 0,
        "cost": 5,
        "talents": ["WELLROUND","CONDITIONED","HISTORIAN","RESEARCH"],
        "directions": [
          {"right":false,"down":false,"left":false,"up":false},
          {"right":false,"down":true,"left":false,"up":false},
          {"right":false,"down":true,"left":false,"up":false},
          {"right":false,"down":true,"left":false,"up":false}
        ]
      },
      {
        "index": 1,
        "cost": 10,
        "talents": ["GRIT","TOUGH","KEENEYED","GRIT"],
        "directions": [
          {"right":true,"down":true,"left":false,"up":false},
          {"right":true,"down":true,"left":true,"up":true},
          {"right":true,"down":false,"left":true,"up":true},
          {"right":false,"down":true,"left":true,"up":true}
        ]
      },
      {
        "index": 2,
        "cost": 15,
        "talents": ["CONDITIONED","CONDIMP","KNOWACTI","FIELRESE"],
        "directions": [
          {"right":true,"down":true,"left":false,"up":true},
          {"right":false,"down":false,"left":true,"up":true},
          {"right":true,"down":true,"left":false,"up":false},
          {"right":false,"down":true,"left":true,"up":true}
        ]
      },
      {
        "index": 3,
        "cost": 20,
        "talents": ["STERSTUF","HISTORIAN","HISTIMP","RESEARCH"],
        "directions": [
          {"right":true,"down":true,"left":false,"up":true},
          {"right":true,"down":false,"left":true,"up":false},
          {"right":false,"down":true,"left":true,"up":true},
          {"right":false,"down":true,"left":false,"up":true}
        ]
      },
      {
        "index": 4,
        "cost": 25,
        "talents": ["WATCSTEP","ENDUR","DEDI","UNEAANSW"],
        "directions": [
          {"right":true,"down":false,"left":false,"up":true},
          {"right":true,"down":false,"left":true,"up":false},
          {"right":true,"down":false,"left":true,"up":true},
          {"right":false,"down":false,"left":true,"up":true}
        ]
      }
    ]
  }'::jsonb
WHERE key = 'ARCHEOLOGIST' AND dataset_source = 'respec';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Droid Specialist: insert missing reSpec row (XML key DROSPEC → canonical DROIDSPEC)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ref_specializations (key, name, description, career_skill_keys, talent_tree, dataset_source, is_retired)
VALUES (
  'DROIDSPEC',
  'Droid Specialist',
  'At a Glance: The Droid tech is the "Droid-Weaponizer." They excel at managing their organization''s Droids, and disabling and appropriating enemy Droids. Updated 12/10/2025',
  ARRAY['COMP','COOL','MECH','MELEE'],
  '{
    "rows": [
      {
        "index": 0,
        "cost": 5,
        "talents": ["DESFLAW","GEARHD","DIREC","REPPATCHSPEC"],
        "directions": [
          {"right":false,"down":true,"left":false,"up":false},
          {"right":false,"down":false,"left":false,"up":false},
          {"right":false,"down":true,"left":false,"up":false},
          {"right":false,"down":false,"left":false,"up":false}
        ]
      },
      {
        "index": 1,
        "cost": 10,
        "talents": ["TOUGH","COMBATPROG","GRIT","REPPATCHSPEC"],
        "directions": [
          {"right":false,"down":true,"left":false,"up":true},
          {"right":false,"down":true,"left":false,"up":false},
          {"right":true,"down":false,"left":false,"up":true},
          {"right":false,"down":false,"left":true,"up":false}
        ]
      },
      {
        "index": 2,
        "cost": 15,
        "talents": ["PERMAI","MACHMEND","IMPREPPAT","DIREC"],
        "directions": [
          {"right":true,"down":true,"left":false,"up":true},
          {"right":true,"down":true,"left":true,"up":true},
          {"right":true,"down":true,"left":true,"up":false},
          {"right":false,"down":true,"left":true,"up":false}
        ]
      },
      {
        "index": 3,
        "cost": 20,
        "talents": ["DESFLAW","DESPREP","REROUTEPROC","IMPDIREC"],
        "directions": [
          {"right":true,"down":true,"left":false,"up":true},
          {"right":false,"down":true,"left":true,"up":true},
          {"right":true,"down":true,"left":false,"up":true},
          {"right":false,"down":false,"left":true,"up":true}
        ]
      },
      {
        "index": 4,
        "cost": 25,
        "talents": ["DESFLA","MASTART","DEDI","FINDIREC"],
        "directions": [
          {"right":true,"down":false,"left":false,"up":true},
          {"right":true,"down":false,"left":true,"up":true},
          {"right":true,"down":false,"left":true,"up":true},
          {"right":false,"down":false,"left":true,"up":false}
        ]
      }
    ]
  }'::jsonb,
  'respec',
  false
)
ON CONFLICT (key, dataset_source) DO UPDATE
  SET
    talent_tree       = EXCLUDED.talent_tree,
    career_skill_keys = EXCLUDED.career_skill_keys,
    name              = EXCLUDED.name;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Wingmate: insert new reSpec spec (key WINGMATE1.0 — matches Ace career)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ref_specializations (key, name, description, career_skill_keys, talent_tree, dataset_source, is_retired)
VALUES (
  'WINGMATE1.0',
  'Wingmate',
  'At a Glance: The Wingmate is the ultimate flying support tree. They keep their head on a swivel to make sure their allies are prepared for danger and ready for the next sortie.',
  ARRAY['CHARM','GUNN','PILOTSP','VIGIL'],
  '{
    "rows": [
      {
        "index": 0,
        "cost": 5,
        "talents": ["GRIT","GALMAP","SKILLJOCK","ENCWORD"],
        "directions": [
          {"right":false,"down":true,"left":false,"up":false},
          {"right":false,"down":true,"left":false,"up":false},
          {"right":false,"down":true,"left":false,"up":false},
          {"right":false,"down":true,"left":false,"up":false}
        ]
      },
      {
        "index": 1,
        "cost": 10,
        "talents": ["FULLTH","DEFDRI","SITAWARE","LIGHMOOD"],
        "directions": [
          {"right":true,"down":true,"left":false,"up":true},
          {"right":true,"down":true,"left":true,"up":true},
          {"right":false,"down":true,"left":true,"up":true},
          {"right":false,"down":false,"left":false,"up":true}
        ]
      },
      {
        "index": 2,
        "cost": 15,
        "talents": ["SKILLJOCK","GRIT","MATHSPEE","CORESLIP"],
        "directions": [
          {"right":false,"down":true,"left":false,"up":true},
          {"right":true,"down":false,"left":false,"up":true},
          {"right":true,"down":true,"left":true,"up":true},
          {"right":false,"down":true,"left":true,"up":false}
        ]
      },
      {
        "index": 3,
        "cost": 20,
        "talents": ["FULLTHIMP","DEAD","TRICK","CORSLIIMP"],
        "directions": [
          {"right":true,"down":true,"left":false,"up":true},
          {"right":true,"down":false,"left":true,"up":false},
          {"right":false,"down":true,"left":true,"up":true},
          {"right":false,"down":true,"left":false,"up":true}
        ]
      },
      {
        "index": 4,
        "cost": 25,
        "talents": ["DEDI","BRI","MASPIL","BREOFF"],
        "directions": [
          {"right":true,"down":false,"left":false,"up":true},
          {"right":false,"down":false,"left":true,"up":false},
          {"right":true,"down":false,"left":false,"up":true},
          {"right":false,"down":false,"left":true,"up":true}
        ]
      }
    ]
  }'::jsonb,
  'respec',
  false
)
ON CONFLICT (key, dataset_source) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Ground Support: insert new reSpec spec (key GROUNDSUPP1.0 — matches Ace career)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ref_specializations (key, name, description, career_skill_keys, talent_tree, dataset_source, is_retired)
VALUES (
  'GROUNDSUPP1.0',
  'Ground Support',
  'At a Glance: The Ground Support is the armor, land, and airspeeder pilot that flies in to force multiply, save the day, and otherwise route enemy armor.',
  ARRAY['GUNN','MECH','PERC','PILOTPL'],
  '{
    "rows": [
      {
        "index": 0,
        "cost": 5,
        "talents": ["KEENEYED","GRIT","LETSRIDE","FULLTH"],
        "directions": [
          {"right":false,"down":false,"left":false,"up":false},
          {"right":false,"down":true,"left":false,"up":false},
          {"right":false,"down":false,"left":false,"up":false},
          {"right":false,"down":true,"left":false,"up":false}
        ]
      },
      {
        "index": 1,
        "cost": 10,
        "talents": ["DEFDRI","FIRESUP","ALLTERDRIV","SKILLJOCK"],
        "directions": [
          {"right":true,"down":true,"left":false,"up":false},
          {"right":true,"down":false,"left":true,"up":true},
          {"right":true,"down":true,"left":true,"up":false},
          {"right":false,"down":true,"left":true,"up":true}
        ]
      },
      {
        "index": 2,
        "cost": 15,
        "talents": ["GRIT","FIRSUPIMP","GEARHD","FINETUN"],
        "directions": [
          {"right":true,"down":true,"left":false,"up":true},
          {"right":false,"down":false,"left":true,"up":false},
          {"right":true,"down":false,"left":false,"up":true},
          {"right":false,"down":true,"left":true,"up":true}
        ]
      },
      {
        "index": 3,
        "cost": 20,
        "talents": ["DEFDRI","COMBARMS","FULLSTOP","FULLTHIMP"],
        "directions": [
          {"right":true,"down":true,"left":false,"up":true},
          {"right":true,"down":true,"left":true,"up":false},
          {"right":true,"down":true,"left":true,"up":false},
          {"right":false,"down":true,"left":true,"up":true}
        ]
      },
      {
        "index": 4,
        "cost": 25,
        "talents": ["ATTVEC","CRASHTHRO","MASDRIV","DEDI"],
        "directions": [
          {"right":false,"down":false,"left":false,"up":true},
          {"right":true,"down":false,"left":false,"up":true},
          {"right":true,"down":false,"left":true,"up":true},
          {"right":false,"down":false,"left":true,"up":true}
        ]
      }
    ]
  }'::jsonb,
  'respec',
  false
)
ON CONFLICT (key, dataset_source) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Maintainer: insert new reSpec spec (key MAINTAINER — matches Engineer career)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ref_specializations (key, name, description, career_skill_keys, talent_tree, dataset_source, is_retired)
VALUES (
  'MAINTAINER',
  'Maintainer',
  'At a Glance: The Maintainer is the full service motor pool and armory technician that can fly a sortie in a pinch.',
  ARRAY['COOL','MECH','MELEE','PILOTPL'],
  '{
    "rows": [
      {
        "index": 0,
        "cost": 5,
        "talents": ["SOLREP","FINETUN","FITES","GRIT"],
        "directions": [
          {"right":false,"down":true,"left":false,"up":false},
          {"right":false,"down":false,"left":false,"up":false},
          {"right":false,"down":true,"left":false,"up":false},
          {"right":false,"down":true,"left":false,"up":false}
        ]
      },
      {
        "index": 1,
        "cost": 10,
        "talents": ["GEARHD","BADM","TOUGH","FICAL"],
        "directions": [
          {"right":false,"down":true,"left":false,"up":true},
          {"right":false,"down":true,"left":false,"up":false},
          {"right":true,"down":true,"left":false,"up":true},
          {"right":false,"down":true,"left":true,"up":true}
        ]
      },
      {
        "index": 2,
        "cost": 15,
        "talents": ["CANNIB","FINETUN","CONT","GEARHD"],
        "directions": [
          {"right":true,"down":true,"left":false,"up":true},
          {"right":true,"down":true,"left":true,"up":true},
          {"right":false,"down":true,"left":true,"up":true},
          {"right":false,"down":true,"left":false,"up":true}
        ]
      },
      {
        "index": 3,
        "cost": 20,
        "talents": ["SOLREP","JULINE","MADMAI","FICAIMP"],
        "directions": [
          {"right":false,"down":true,"left":false,"up":true},
          {"right":true,"down":true,"left":false,"up":true},
          {"right":true,"down":true,"left":true,"up":true},
          {"right":false,"down":true,"left":true,"up":true}
        ]
      },
      {
        "index": 4,
        "cost": 25,
        "talents": ["SOREIMP","FITUIMP","KIBA","DEDI"],
        "directions": [
          {"right":false,"down":false,"left":false,"up":true},
          {"right":false,"down":false,"left":false,"up":true},
          {"right":true,"down":false,"left":false,"up":true},
          {"right":false,"down":false,"left":true,"up":true}
        ]
      }
    ]
  }'::jsonb,
  'respec',
  false
)
ON CONFLICT (key, dataset_source) DO NOTHING;
