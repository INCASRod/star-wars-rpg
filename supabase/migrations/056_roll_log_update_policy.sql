-- Allow updating roll_log rows (e.g. marking refunded, toggling hidden).
CREATE POLICY "Public update roll_log" ON roll_log FOR UPDATE USING (true);
