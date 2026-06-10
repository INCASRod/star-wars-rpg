-- 067_activate_respec.sql
-- Final flip: sets active_dataset to 'respec' for all sessions.
UPDATE campaign_settings SET active_dataset = 'respec', updated_at = now();
