-- 010_session_roll_state.sql
-- Per-campaign session roll state for Duty & Obligation reveals.
-- One row per campaign. GM writes; players read via Realtime.

CREATE TABLE IF NOT EXISTS session_roll_state (
  id                           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id                  uuid REFERENCES campaigns(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Duty roll
  duty_roll                    integer,
  duty_triggered               boolean,
  duty_triggered_char_id       uuid REFERENCES characters(id),
  duty_is_doubles              boolean NOT NULL DEFAULT false,
  duty_revealed                boolean NOT NULL DEFAULT false,

  -- Obligation roll
  obligation_roll              integer,
  obligation_triggered         boolean,
  obligation_triggered_char_id uuid REFERENCES characters(id),
  obligation_revealed          boolean NOT NULL DEFAULT false,

  updated_at                   timestamptz NOT NULL DEFAULT now(),
  updated_by                   uuid REFERENCES auth.users(id)
);

-- Enable Realtime so players receive reveal updates instantly
ALTER PUBLICATION supabase_realtime ADD TABLE session_roll_state;
