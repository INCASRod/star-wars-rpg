-- 009_duty_obligation.sql
-- Adds lore text + configured flag to characters.
-- Creates ref_duty_types and ref_obligation_types seed tables.

-- ── New character columns ─────────────────────────────────────────────────────

ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS duty_lore                 text,
  ADD COLUMN IF NOT EXISTS obligation_lore           text,
  ADD COLUMN IF NOT EXISTS duty_obligation_configured boolean NOT NULL DEFAULT false;

-- ── Reference: Duty types ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ref_duty_types (
  key         text PRIMARY KEY,
  name        text NOT NULL,
  description text
);

INSERT INTO ref_duty_types (key, name, description) VALUES
  ('combat_victory',      'Combat Victory',       'Seek out and defeat enemies of the Rebellion in direct confrontation. This character earns Duty by destroying Imperial forces and assets.'),
  ('counter_intelligence','Counter-Intelligence',  'Root out Imperial infiltrators and spy networks. This character''s mission is identifying traitors, double agents, and surveillance operations that threaten Alliance security.'),
  ('intelligence',        'Intelligence',          'Gather critical information on Imperial operations, troop movements, and military capabilities. Secrets are the lifeblood of the Rebellion.'),
  ('internal_security',   'Internal Security',     'Protect Alliance personnel, safehouses, and classified data from Imperial discovery. The cell structure depends on those willing to guard it.'),
  ('personnel',           'Personnel',             'Recruit new members to the Alliance — soldiers, pilots, medics, or informants. Every life saved from Imperial oppression can become a Rebel asset.'),
  ('recruit',             'Recruit',               'Find and bring skilled or influential individuals into the Alliance fold. Focus on high-value targets: former Imperials, wealthy patrons, gifted Force users.'),
  ('sabotage',            'Sabotage',              'Strike at Imperial infrastructure, supply lines, and communications to degrade their war-making capacity. The less they can move and communicate, the better.'),
  ('space_superiority',   'Space Superiority',     'Contest Imperial dominance of the spaceways. Escort convoys, destroy patrol vessels, and keep hyperspace lanes open for Alliance use.'),
  ('support',             'Support',               'Keep the Alliance operational through logistics, medicine, engineering, or morale. Every front-line fighter needs a support network behind them.')
ON CONFLICT (key) DO NOTHING;

-- ── Reference: Obligation types ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ref_obligation_types (
  key         text PRIMARY KEY,
  name        text NOT NULL,
  description text
);

INSERT INTO ref_obligation_types (key, name, description) VALUES
  ('addiction',      'Addiction',      'A powerful substance, behaviour, or stimulus consumes this character. When Triggered, they must indulge or suffer increasing strain and erratic behaviour until they do.'),
  ('betrayal',       'Betrayal',       'This character wronged someone — a friend, an employer, or an innocent. That wound festers. The betrayed party''s agents or memories resurface at the worst moments.'),
  ('blackmail',      'Blackmail',      'Someone holds damaging information and periodically demands favours, credits, or silence. Refusal risks exposure at a moment that could destroy everything.'),
  ('bounty',         'Bounty',         'A significant price has been placed on this character''s head, attracting bounty hunters, law enforcement, and opportunists at every starport.'),
  ('criminal',       'Criminal',       'A past crime — theft, murder, fraud, or worse — haunts this character. Authorities, victims, or criminal organisations still want answers or revenge.'),
  ('debt',           'Debt',           'A sizable financial obligation looms. Creditors may be patient or impatient, legitimate or dangerous, but the debt must eventually be repaid — with interest.'),
  ('dutybound',      'Dutybound',      'A prior oath, military service, or sworn commitment pulls at this character. Failing to honour it draws censure, shame, or active pursuit from former allies.'),
  ('exile',          'Exile',          'This character has been cast out from a homeworld, faction, or community they once called home. Return is forbidden or extremely dangerous.'),
  ('family',         'Family',         'Loved ones remain vulnerable — hostages of circumstance, Imperial suspicion, or criminal entanglement. Protecting them often means dangerous compromises.'),
  ('favor',          'Favor',          'An influential figure did something significant for this character and expects repayment in kind. The favour owed is vague but the expectation is not.'),
  ('oath',           'Oath',           'A solemn vow — of vengeance, protection, or service — drives this character. Breaking it would be a spiritual or moral catastrophe they cannot contemplate.'),
  ('obsession',      'Obsession',      'A single goal, person, or artefact dominates this character''s thoughts. When it appears, rational decision-making gives way to compulsion.'),
  ('responsibility', 'Responsibility', 'This character bears the weight of others'' welfare — a crew, refugees, a community. Their safety takes priority even when it conflicts with the mission.'),
  ('secret',         'Secret',         'A hidden truth — a past identity, a dark act, a dangerous alliance — must never surface. Discovery would bring devastating personal or professional consequences.')
ON CONFLICT (key) DO NOTHING;
