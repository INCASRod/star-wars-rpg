-- 061_quartermaster.sql
-- Quartermaster system: per-campaign shop for buying and selling gear.
-- One QM row per campaign (unique constraint); items reference ref_weapons/armor/gear by TEXT key.

CREATE TABLE quartermaster (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  is_open      BOOLEAN     NOT NULL DEFAULT FALSE,
  sell_pct     INTEGER     NOT NULL DEFAULT 25,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id)
);

CREATE TABLE quartermaster_items (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quartermaster_id  UUID        NOT NULL REFERENCES quartermaster(id) ON DELETE CASCADE,
  item_key          TEXT        NOT NULL,
  item_type         TEXT        NOT NULL CHECK (item_type IN ('weapon', 'armor', 'gear')),
  stock             INTEGER     NOT NULL DEFAULT 1 CHECK (stock >= 0),
  price_override    INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quartermaster_id, item_key, item_type)
);

CREATE INDEX idx_qi_quartermaster_id ON quartermaster_items (quartermaster_id);

-- After running this migration, also run in Supabase dashboard:
-- ALTER PUBLICATION supabase_realtime ADD TABLE quartermaster;
-- ALTER PUBLICATION supabase_realtime ADD TABLE quartermaster_items;
