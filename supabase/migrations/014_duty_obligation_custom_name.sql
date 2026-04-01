-- 014_duty_obligation_custom_name.sql
-- Adds optional GM-defined custom display names for Duty and Obligation types.
-- When set, these override the ref table name everywhere the type is displayed.
-- NULL means "use the ref table name".

ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS duty_custom_name text,
  ADD COLUMN IF NOT EXISTS obligation_custom_name text;
