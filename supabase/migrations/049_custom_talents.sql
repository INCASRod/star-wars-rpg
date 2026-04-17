-- Migration 049: Custom talents GM creation + character assignment
-- Extends ref_talents with is_custom / campaign_id so GMs can create
-- campaign-specific talents and assign them to characters.

-- ── Extend ref_talents ────────────────────────────────────────────────────────

ALTER TABLE ref_talents
  ADD COLUMN IF NOT EXISTS is_custom   boolean   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS campaign_id uuid       REFERENCES campaigns(id) ON DELETE CASCADE;

-- ── RLS: allow GM-owned campaigns to write custom talents ─────────────────────

-- Drop old blanket public-read policy and replace with a scoped one that also
-- exposes custom talents to players in the same campaign.
DROP POLICY IF EXISTS "Public read ref_talents" ON ref_talents;

CREATE POLICY "ref_talents_select" ON ref_talents
  FOR SELECT USING (
    is_custom = false                          -- all canon talents are always readable
    OR campaign_id IN (
      SELECT campaign_id FROM players WHERE user_id = auth.uid()
    )
  );

-- GMs may insert / update / delete custom talents for their campaign.
CREATE POLICY "ref_talents_gm_write" ON ref_talents
  FOR ALL
  USING (
    is_custom = true
    AND campaign_id IN (
      SELECT campaign_id FROM players WHERE user_id = auth.uid() AND is_gm = true
    )
  )
  WITH CHECK (
    is_custom = true
    AND campaign_id IN (
      SELECT campaign_id FROM players WHERE user_id = auth.uid() AND is_gm = true
    )
  );

-- ── character_talents: add DELETE policy + cascade FK ─────────────────────────

-- Allow GMs (and players) to remove talent assignments.
CREATE POLICY "character_talents_delete" ON character_talents
  FOR DELETE USING (true);

-- Rebuild FK with ON DELETE CASCADE so that deleting a custom talent from
-- ref_talents automatically removes all character_talent rows for it.
ALTER TABLE character_talents
  DROP CONSTRAINT IF EXISTS character_talents_talent_key_fkey;

ALTER TABLE character_talents
  ADD CONSTRAINT character_talents_talent_key_fkey
    FOREIGN KEY (talent_key) REFERENCES ref_talents(key) ON DELETE CASCADE;
