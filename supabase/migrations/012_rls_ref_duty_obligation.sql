-- 012_rls_ref_duty_obligation.sql
-- Enable RLS and add SELECT policies for the duty/obligation reference tables.
-- These are lookup tables with no sensitive data — all authenticated users may read them.

ALTER TABLE ref_duty_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_obligation_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read duty types"
  ON ref_duty_types
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read obligation types"
  ON ref_obligation_types
  FOR SELECT
  TO authenticated
  USING (true);
