-- 078_fix_brawn_weapon_damage_add.sql
-- Brawn-based weapons (BRAWL/MELEE/LTSABER) store their damage bonus in
-- damage_add, not damage. Weapons where damage > 0 and damage_add = 0 had
-- their bonus in the wrong column — this moves it to damage_add so they
-- display as "Brawn+N" instead of "Brawn+0".

UPDATE ref_weapons
SET damage_add = damage
WHERE skill_key IN ('BRAWL', 'MELEE', 'LTSABER')
  AND damage > 0
  AND damage_add = 0;
