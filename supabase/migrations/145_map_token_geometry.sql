-- Per-placement token geometry (width, height, rotation) for map_tokens.
--
-- Units: base units, 1.0 = 24px, the same unit as token_size. These are
-- multiplied by maps.token_scale at render time like every other token size.
-- token_w / token_h NULL = legacy behaviour (both fall back to token_size).
-- token_size keeps its meaning. token_rot is degrees, clockwise, default 0.
-- Existing RLS policy (map_tokens_all_anon) is untouched.
ALTER TABLE map_tokens
  ADD COLUMN IF NOT EXISTS token_w   float,
  ADD COLUMN IF NOT EXISTS token_h   float,
  ADD COLUMN IF NOT EXISTS token_rot float NOT NULL DEFAULT 0;
