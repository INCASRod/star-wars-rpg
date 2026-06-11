-- 073_fix_doctor_voice_of_reason.sql
-- VOORE is the custom reSpec talent "Voice of Reason" from the Doctor (Respecialized 1.2) tree.
-- Description sourced from the reSpecialized Colonist: Doctor v1.51 PDF (31-MAR-2026).

INSERT INTO ref_talents
  (key, name, description, activation, is_ranked, is_force_talent, dataset_source, is_retired)
VALUES (
  'VOORE',
  'Voice of Reason',
  'Once per encounter when making Leadership or Negotiation check, the character may substitute a Knowledge skill instead. The character''s Knowledge skill is combined with their Presence characteristic to form the dice pool. When the character does this, the player must explain how their knowledge is persuading others or driving the conversation.',
  'taIncidental', false, false, 'respec', false
)
ON CONFLICT (key, dataset_source) DO NOTHING;
