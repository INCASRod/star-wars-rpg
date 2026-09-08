-- 129_market_merchants_seed.sql
--
-- Prompt 2's determinism requirement: "Store the seed on the merchant so a
-- snapshot reproduces exactly." 127_market_merchants.sql (Prompt 1) has no
-- seed column — additive companion migration rather than rewriting an
-- already-applied migration file, same pattern as 128's restricted-column
-- addition.

ALTER TABLE market_merchants ADD COLUMN IF NOT EXISTS seed integer;
