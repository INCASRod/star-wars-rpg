-- Fix vehicle_token_images RLS so anon (PIN-auth) users can read and write.
-- The original policies were TO authenticated only, which blocked uploads since
-- the app never calls supabase.auth.signIn (uses PIN auth → anon role).
-- Match the pattern used by adversary_token_images: single FOR ALL policy, no role restriction.

DROP POLICY IF EXISTS "Authenticated users can read vehicle token images"   ON vehicle_token_images;
DROP POLICY IF EXISTS "Authenticated users can upsert vehicle token images" ON vehicle_token_images;
DROP POLICY IF EXISTS "Authenticated users can update vehicle token images" ON vehicle_token_images;

CREATE POLICY "vehicle_token_images_all_anon"
  ON vehicle_token_images
  FOR ALL
  USING (true)
  WITH CHECK (true);
