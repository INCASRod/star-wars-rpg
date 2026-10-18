-- Astrogation E4: the campaign's held "current location" for the Galaxy tab (one row per campaign).
-- Same anon-open pattern as campaign_nav_pins (146): GM-only is enforced by the GM view, not RLS.
CREATE TABLE IF NOT EXISTS campaign_nav_state (
  campaign_id       uuid PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  current_system_id text REFERENCES ref_systems(id),
  current_pin_id    uuid REFERENCES campaign_nav_pins(id) ON DELETE SET NULL,
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaign_nav_state_one_location CHECK (current_system_id IS NULL OR current_pin_id IS NULL)
);

ALTER TABLE campaign_nav_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaign_nav_state_all_anon" ON campaign_nav_state;
CREATE POLICY "campaign_nav_state_all_anon" ON campaign_nav_state FOR ALL USING (true) WITH CHECK (true);
