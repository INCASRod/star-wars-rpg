alter table character_sessions
  add column if not exists ui_theme text not null default 'binary-sunset'
  check (ui_theme in ('binary-sunset', 'operative', 'kyber'));
