-- Migration 088: Signature Abilities — reference data + character progress
--
-- NOTE: originally specced as migration 082, but 082_crawl_map_type.sql
-- already exists (current floor at authoring time is 087 + a dated
-- realtime migration) — renumbered to the next free slot after a
-- read-only audit confirmed the collision.
--
-- Follows the dataset_source + is_retired pattern from migration 062
-- (ref_talents, ref_specializations, etc.) so signature abilities can
-- coexist with future non-respec datasets. No FK on career_key/
-- sig_ability_key, matching 062's approach of dropping FKs on
-- dataset-keyed reference columns. No RLS, matching every other ref_*
-- table in this schema.

-- ── ref_sig_abilities ──────────────────────────────────────────────────────
-- One row per signature ability (e.g. "Unmatched Authority"), keyed to the
-- career it belongs to. `description` is the flavour/lore text from the
-- ability's own <Description>, not any single node's description.

CREATE TABLE IF NOT EXISTS ref_sig_abilities (
  key             TEXT    NOT NULL,
  dataset_source  TEXT    NOT NULL DEFAULT 'respec',
  name            TEXT    NOT NULL,
  description     TEXT    NOT NULL,
  career_key      TEXT    NOT NULL,
  is_retired      BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (key, dataset_source)
);

-- ── ref_sig_ability_nodes ──────────────────────────────────────────────────
-- One row per tree node (base node at row_index = 0, upgrade nodes at
-- row_index >= 1). col_span > 1 marks a node that spans multiple grid
-- columns (the base node always spans all 4).

CREATE TABLE IF NOT EXISTS ref_sig_ability_nodes (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  sig_ability_key  TEXT    NOT NULL,
  dataset_source   TEXT    NOT NULL DEFAULT 'respec',
  row_index        INTEGER NOT NULL,
  col_index        INTEGER NOT NULL,
  col_span         INTEGER NOT NULL DEFAULT 1,
  node_key         TEXT    NOT NULL,
  name             TEXT    NOT NULL,
  description      TEXT    NOT NULL,
  xp_cost          INTEGER NOT NULL,
  connect_up       BOOLEAN NOT NULL DEFAULT false,
  connect_down     BOOLEAN NOT NULL DEFAULT false,
  connect_left     BOOLEAN NOT NULL DEFAULT false,
  connect_right    BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_ref_sig_ability_nodes_lookup
  ON ref_sig_ability_nodes (sig_ability_key, dataset_source);

-- ── character_sig_ability_nodes ────────────────────────────────────────────
-- Purchase record: one row per node a character has bought, including the
-- base node (row_index = 0) that "locks in" the signature ability.

CREATE TABLE IF NOT EXISTS character_sig_ability_nodes (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id     UUID        NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  sig_ability_key  TEXT        NOT NULL,
  node_key         TEXT        NOT NULL,
  col_index        INTEGER     NOT NULL,
  row_index        INTEGER     NOT NULL,
  xp_cost          INTEGER     NOT NULL,
  purchased_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (character_id, sig_ability_key, node_key, col_index, row_index)
);

CREATE INDEX IF NOT EXISTS idx_character_sig_ability_nodes_character
  ON character_sig_ability_nodes (character_id);
