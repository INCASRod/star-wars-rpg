-- Force notification card: store activated upgrades for GM feed display
ALTER TABLE force_notifications
  ADD COLUMN IF NOT EXISTS activated_upgrades JSONB DEFAULT '[]'::jsonb;
