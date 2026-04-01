-- 013_rls_ref_duty_obligation_anon.sql
-- Extend read access on the duty/obligation reference tables to the anon role.
-- These are pure lookup tables with no sensitive data; anon reads are safe.

CREATE POLICY "Anon users can read duty types"
  ON ref_duty_types
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can read obligation types"
  ON ref_obligation_types
  FOR SELECT
  TO anon
  USING (true);
