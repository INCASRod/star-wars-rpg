-- Migration 057: Add DELETE RLS policies for character purchase refund operations
-- These policies allow the GM refund hook to delete specialization/talent/force ability rows
-- when reverting a purchase and restoring XP.

-- Allow deleting rows for GM purchase refund operations on character_specializations.
CREATE POLICY "Public delete character_specializations"
  ON character_specializations FOR DELETE USING (true);

-- Allow deleting rows for GM purchase refund operations on character_force_abilities.
CREATE POLICY "Public delete character_force_abilities"
  ON character_force_abilities FOR DELETE USING (true);
