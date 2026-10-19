-- Auth B4: hidden rows are readable only by the GM. Reads only; the write behaviour is re-created exactly as it was
-- (open), because players still write roll_log and move map tokens until the next stage. Two SELECT policies per table
-- because is_gm() is executable by authenticated only: anon must not evaluate it.
DROP POLICY roll_log_all ON public.roll_log;
DROP POLICY "Public read roll_log" ON public.roll_log;
CREATE POLICY roll_log_read_anon ON public.roll_log FOR SELECT TO anon USING (hidden IS NOT TRUE);
CREATE POLICY roll_log_read_auth ON public.roll_log FOR SELECT TO authenticated USING (hidden IS NOT TRUE OR public.is_gm());
CREATE POLICY roll_log_update    ON public.roll_log FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY roll_log_delete    ON public.roll_log FOR DELETE TO anon, authenticated USING (true);

DROP POLICY map_tokens_all_anon ON public.map_tokens;
CREATE POLICY map_tokens_read_anon ON public.map_tokens FOR SELECT TO anon USING (is_visible);
CREATE POLICY map_tokens_read_auth ON public.map_tokens FOR SELECT TO authenticated USING (is_visible OR public.is_gm());
CREATE POLICY map_tokens_insert    ON public.map_tokens FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY map_tokens_update    ON public.map_tokens FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY map_tokens_delete    ON public.map_tokens FOR DELETE TO anon, authenticated USING (true);
