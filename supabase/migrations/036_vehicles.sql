-- ── Vehicle token images ────────────────────────────────────────────────────
-- Keyed by the OggDude vehicle Key (e.g. "1LTANK") or custom vehicle id.
CREATE TABLE IF NOT EXISTS vehicle_token_images (
  vehicle_key       text PRIMARY KEY,
  token_image_url   text NOT NULL,
  updated_at        timestamptz DEFAULT now()
);

ALTER TABLE vehicle_token_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read vehicle token images"
  ON vehicle_token_images FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can upsert vehicle token images"
  ON vehicle_token_images FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update vehicle token images"
  ON vehicle_token_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ── Custom vehicles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ref_vehicles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  type                text NOT NULL DEFAULT 'Speeder',
  categories          text[] DEFAULT '{}',
  is_starship         boolean DEFAULT false,

  -- Performance
  silhouette          int DEFAULT 3,
  speed               int DEFAULT 2,
  handling            int DEFAULT 0,

  -- Defense arcs
  def_fore            int DEFAULT 0,
  def_aft             int DEFAULT 0,
  def_port            int DEFAULT 0,
  def_starboard       int DEFAULT 0,

  -- Durability
  armor               int DEFAULT 2,
  hull_trauma         int DEFAULT 10,
  system_strain       int DEFAULT 8,

  -- Crew & cargo
  crew                text,
  passengers          int,
  encumbrance_capacity int,
  consumables         text,

  -- Weapons & special features
  weapons             jsonb DEFAULT '[]',
  abilities           jsonb DEFAULT '[]',

  description         text,
  is_custom           boolean DEFAULT true,
  campaign_id         uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  custom_notes        text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE ref_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read vehicles"
  ON ref_vehicles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert custom vehicles"
  ON ref_vehicles FOR INSERT
  TO authenticated WITH CHECK (is_custom = true);

CREATE POLICY "Authenticated users can update custom vehicles"
  ON ref_vehicles FOR UPDATE
  TO authenticated USING (is_custom = true) WITH CHECK (is_custom = true);

CREATE POLICY "Authenticated users can delete custom vehicles"
  ON ref_vehicles FOR DELETE
  TO authenticated USING (is_custom = true);
