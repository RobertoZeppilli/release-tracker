-- The Developer is gone as a row (issue #210, ADR 0011). An installed copy belongs to one person,
-- so there is nobody to tell apart: the login, the GitHub callback and `auth.users` leave the
-- product, and with them the column that said whose a row was, the policies that read it and the
-- grants that were written for a signed-in client.
--
-- ⚠️ **This migration travels with the code that stops writing `user_id`, in the same pull
-- request**, unlike `20261112072500_drop_plans.sql` and `20261111081500_drop_waitlist_signups.sql`,
-- which both came after theirs. The rule behind those two is that CI applies every migration from
-- scratch and then runs integration and e2e, so the two halves must never disagree on the same
-- commit. Dropping a table nobody reads keeps that rule when it goes second; dropping the column
-- every write still carries cannot, in either order: the code without the column writes a row the
-- database refuses, and the column without the code is a `not null` nothing fills. One commit is
-- what keeps the two required checks green.
--
-- ⚠️ **What this opens.** The browser talks to Postgres directly (`follows-store`, the bell), and
-- with no session it is the `anon` role. So the grants below are what let one person use their own
-- copy -- and until the Supabase project is switched off in #222, they are also what lets anybody
-- holding the publishable key, which travels in the open, read and write these five tables on the
-- **production** project. The showcase has been files only since #215 and reads none of them, and
-- #211 moves the data to a file on the installer's disk a few days from now. Nothing here touches
-- the Catalog, the Releases, the Notes or the Summaries: those stay read-only for a client.

-- The policies first: they are the only readers left of the column they are about to lose.
drop policy "Own follows: read" on public.follows;
drop policy "Own follows: add" on public.follows;
drop policy "Own follows: remove" on public.follows;
drop policy "Own follows: declare the Version in use" on public.follows;

drop policy "Own notifications: read" on public.notifications;
drop policy "Own notifications: mark seen" on public.notifications;

drop policy "Own notification settings: read" on public.notification_settings;
drop policy "Own notification settings: write" on public.notification_settings;
drop policy "Own notification settings: change" on public.notification_settings;

drop policy "Own notification preferences: read" on public.notification_preferences;
drop policy "Own notification preferences: write" on public.notification_preferences;
drop policy "Own notification preferences: change" on public.notification_preferences;

-- A delivery never held a `user_id` of its own: its policy reached the Notification to find one.
drop policy "Own deliveries: read" on public.notification_deliveries;

-- Row level security went with the account (ADR 0011). It answered one question -- whose row is
-- this -- and in a copy that belongs to one person the question has no second answer. What decides
-- who may touch what is the grant, which is the half that survives.
alter table public.follows disable row level security;
alter table public.notifications disable row level security;
alter table public.notification_settings disable row level security;
alter table public.notification_preferences disable row level security;

-- ⚠️ Not these two. `notification_secrets` holds the Slack webhook and `notification_deliveries`
-- quotes what Slack answered, and both are written by the server with the service role, which
-- bypasses RLS: enabled with no policy and with no grant is how they stay unreachable from a
-- browser (#172). `notification_secrets` loses its column below like the rest; what it does not
-- lose is the lock, and `notification_deliveries` never held a column of its own to lose.

-- ⚠️ Nothing is deleted here, in any table. If two accounts followed the same Technology, or if
-- more than one ever saved their settings, the statements below fail on a duplicate key and the
-- deploy stops: which row survives is not a migration's decision to take quietly.

-- `follows`. A follow is now a Technology and nothing else, which is also the shape issue #217
-- gives it when it moves to `verdict.json`.
alter table public.follows drop column user_id;
alter table public.follows add primary key (technology_id);
-- Redundant now that the primary key is that column: it indexed the lookup the key is.
drop index public.follows_technology_id_idx;

-- The follow rules, which the Plan already halved (#209): the Developer is out of the signature
-- too, so what is left is the one rule about a retired Technology.
create or replace function public.enforce_follow_rules()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select retired from public.technologies where id = new.technology_id) then
    raise exception 'A retired Technology cannot be followed'
      using errcode = 'FRTRD';
  end if;

  return new;
end;
$$;

-- `notifications`. The three indexes were all read "for this Developer, then"; what is left of each
-- is the "then". The unique one is what makes a second run of the job write nothing, so it is
-- recreated under the same name before anything inserts again.
drop index public.notifications_once_per_subject;
drop index public.notifications_unseen_idx;
drop index public.notifications_recent_idx;
alter table public.notifications drop column user_id;
create unique index notifications_once_per_subject on public.notifications (event, subject);
create index notifications_unseen_idx on public.notifications (seen_at) where seen_at is null;
create index notifications_recent_idx on public.notifications (created_at desc);

-- The two tables that held one row per Developer now hold one row. `singleton` is that: a column
-- with one legal value, so the primary key can only ever match the row already there and an upsert
-- has a conflict target to name. It is the shape the code writes against (`write-notification-settings`).
--
-- ⚠️ If more than one account ever saved settings, `add primary key` fails here with
-- `Key (singleton)=(t) is duplicated`. That is the deploy stopping rather than this file choosing
-- whose preferences to keep.
alter table public.notification_settings drop column user_id;
alter table public.notification_settings
  add column singleton boolean not null default true,
  add constraint notification_settings_singleton check (singleton);
alter table public.notification_settings add primary key (singleton);

alter table public.notification_secrets drop column user_id;
alter table public.notification_secrets
  add column singleton boolean not null default true,
  add constraint notification_secrets_singleton check (singleton);
alter table public.notification_secrets add primary key (singleton);

-- A preference is per event and per channel, which is what it always was once the Developer is
-- taken out of the key.
alter table public.notification_preferences drop column user_id;
alter table public.notification_preferences add primary key (event, channel);

-- The grants, rewritten for `anon`, which is who the browser is now. `authenticated` keeps nothing:
-- the role still exists in Supabase, and a grant left on it would be a door nobody watches.
revoke all on public.follows, public.notifications, public.notification_settings,
  public.notification_preferences from anon, authenticated;

-- Follows: read them, add one, let one go, and declare the Version in use. Still only that one
-- column on update, for the reason the `current_version` migration gives: a wider grant would let
-- an update move `technology_id` and walk past the rule that only guards an insert.
grant select, insert, delete on public.follows to anon;
grant update (current_version) on public.follows to anon;

-- Notifications: read them and mark them Seen. `seen_at` is still the only column granted, so the
-- event, the Release and the day a Notification was born stay the job's.
grant select on public.notifications to anon;
grant update (seen_at) on public.notifications to anon;

-- The preferred language and the switches, which are what the reader states. `singleton` is granted
-- on update for the reason `20261102083030` found out the hard way: PostgREST writes an upsert as
-- `insert ... on conflict (singleton) do update set singleton = excluded.singleton, ...`, so the
-- conflict key lands in the `set` list and Postgres asks for `update` on it.
grant select, insert (singleton, preferred_locale, updated_at),
  update (singleton, preferred_locale, updated_at) on public.notification_settings to anon;
grant select, insert, update on public.notification_preferences to anon;

-- `slack_webhook_hint` stays the service role's, as the audit of 2026-11-02 left it: it is a fact
-- the app establishes beside the webhook, not a preference anybody states.

-- Last, the schema nothing points at any more. Supabase keeps `auth` whatever the app does with it,
-- so there is no table to drop here: what went is every foreign key into it, with the columns above.
