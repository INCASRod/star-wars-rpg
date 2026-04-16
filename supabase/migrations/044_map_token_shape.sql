-- Add token_shape column to map_tokens for vehicle rectangular tokens
-- Default 'circle' preserves existing behaviour for all current tokens
ALTER TABLE map_tokens
  ADD COLUMN IF NOT EXISTS token_shape text NOT NULL DEFAULT 'circle'
    CHECK (token_shape IN ('circle', 'rectangle'));
