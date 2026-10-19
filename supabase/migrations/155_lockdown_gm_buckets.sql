-- Auth B4: storage buckets maps and tokens. Public read is unchanged (image URLs keep working); writes need the
-- signed-in GM. portraits is untouched (players upload their own).
DROP POLICY maps_insert_anon   ON storage.objects;
DROP POLICY maps_update_anon   ON storage.objects;
DROP POLICY maps_delete_anon   ON storage.objects;
DROP POLICY tokens_insert_anon ON storage.objects;
DROP POLICY tokens_update_anon ON storage.objects;
DROP POLICY tokens_delete_anon ON storage.objects;
CREATE POLICY maps_gm_insert   ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'maps'   AND public.is_gm());
CREATE POLICY maps_gm_update   ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'maps'   AND public.is_gm()) WITH CHECK (bucket_id = 'maps'   AND public.is_gm());
CREATE POLICY maps_gm_delete   ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'maps'   AND public.is_gm());
CREATE POLICY tokens_gm_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tokens' AND public.is_gm());
CREATE POLICY tokens_gm_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'tokens' AND public.is_gm()) WITH CHECK (bucket_id = 'tokens' AND public.is_gm());
CREATE POLICY tokens_gm_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'tokens' AND public.is_gm());
