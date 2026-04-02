-- Migration 023: Dark Side Fallen flag for Force-sensitive characters
-- GM-controlled only — never auto-triggered by Morality score.

ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS is_dark_side_fallen  boolean      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dark_side_fallen_at  timestamptz,
  ADD COLUMN IF NOT EXISTS redeemed_at          timestamptz;

COMMENT ON COLUMN characters.is_dark_side_fallen IS
  'GM-activated flag. Inverts Force pip mechanics — dark pips free, '
  'light pips cost Destiny Point + strain. Requires morality_score '
  'to be below threshold (GM discretion). Never set automatically.';

COMMENT ON COLUMN characters.dark_side_fallen_at IS
  'Timestamp when the GM last declared this character fallen to the Dark Side.';

COMMENT ON COLUMN characters.redeemed_at IS
  'Timestamp when the GM last granted Redemption to this character.';
