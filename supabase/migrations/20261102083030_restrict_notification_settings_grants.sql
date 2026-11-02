-- The trial of the external channels was a column a client could write (audit of 2026-11-02).
--
-- `grant update on public.notification_settings to authenticated` was the whole table, and the
-- policy only asks whose row it is. `external_trial_started_at` is in that table, and it is the
-- gate of the external channels: `trialOf` reads it in `/settings`, and the delivery job reads it
-- again to decide whether to send. So a Developer could reopen their own thirty days from the
-- browser, in one statement, with nothing but the publishable key. This file says what was open
-- and what closed it, and not how it was done: the repository is public, and the guard of a rule is
-- the test that proves it, not the silence around it.
--
-- `startExternalTrial` does guard it -- it reads before it writes, so a second switch never pushes
-- the end date forward -- but that guard is in the application, and a client is not obliged to go
-- through it. Today it costs little, because Pro is not sold yet; on the day of #174 it is an
-- unpaid subscription, and the code that sells Pro will read this same column.
--
-- The remedy is the rule this schema already applies twice, on `follows.current_version` and on
-- `notifications.seen_at`: close the column, not the table. What a Developer changes here is the
-- language the channels are written in, and nothing else.
--
-- `external_trial_started_at` and `slack_webhook_hint` are now the service role's alone, which is
-- what already writes the webhook beside them: both are facts the app establishes, not preferences
-- the reader states.

revoke insert, update on public.notification_settings from authenticated;

-- The three columns of `writePreferredLocale`, which upserts: `insert` for the row that is not
-- there yet, `update` for the one that is.
--
-- ⚠️ `user_id` is granted on **update** as well, and it took the integration suite against the real
-- database to find out why: an upsert through PostgREST is `insert ... on conflict (user_id) do
-- update set user_id = excluded.user_id, ...`, so the conflict key lands in the `set` list and
-- Postgres asks for `update` on it. Four tests failed with 42501 on the Developer's own save before
-- this line existed. It grants nothing: both policies on this table hold `user_id = auth.uid()`, in
-- `using` and in `with check`, so the column can only ever be rewritten to the value it already
-- has -- a row cannot be moved to another Developer, nor another Developer's row reached.
grant insert (user_id, preferred_locale, updated_at) on public.notification_settings to authenticated;
grant update (user_id, preferred_locale, updated_at) on public.notification_settings to authenticated;

-- The policies are unchanged and stay the second lock: the grants above say which columns, the
-- policies say whose row. Neither alone is enough.
