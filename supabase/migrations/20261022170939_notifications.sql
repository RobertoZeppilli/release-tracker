-- Notifications (ADR 0009). A Notification belongs to a Developer, not to a Release: Seen, channel
-- and language are one person's, so two Developers following the same Technology hold two rows.
--
-- The language is here and not on `plans`, which is about money, because email and Slack have no URL
-- to read it from (ADR 0008); in-app reads the segment like everything else.
create type public.notification_event as enum ('featured_release', 'notable_release', 'weekly_digest');
create type public.notification_channel as enum ('in_app', 'slack', 'email');
create type public.locale as enum ('en', 'it', 'fr', 'es', 'de');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event public.notification_event not null,
  -- A Release event points at its Release; the weekly Digest at an ISO week, `2026-W43`.
  release_id uuid references public.releases (id),
  digest_week text,
  created_at timestamptz not null default now(),
  seen_at timestamptz,
  constraint notifications_subject check (
    case event
      when 'weekly_digest' then release_id is null and digest_week is not null
      else release_id is not null and digest_week is null
    end
  )
);

-- What makes running the job twice harmless: the second insert conflicts instead of duplicating.
-- Two partial indexes rather than one over nullable columns, which would not constrain anything.
create unique index notifications_once_per_release on public.notifications (user_id, event, release_id)
  where release_id is not null;
create unique index notifications_once_per_week on public.notifications (user_id, event, digest_week)
  where digest_week is not null;

-- The bell's counter, which is read on every page, so it must not scan a Developer's history.
create index notifications_unseen_idx on public.notifications (user_id) where seen_at is null;
create index notifications_recent_idx on public.notifications (user_id, created_at desc);
-- Kept 90 days (ADR 0009), and the privacy notice says so: the job deletes by this index.
create index notifications_created_at_idx on public.notifications (created_at);

-- One row per Developer, written when they first touch their settings. No trigger creates it: a
-- missing row means the declared starting point, which `src/modules/notifications/domain` holds.
create table public.notification_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  preferred_locale public.locale not null default 'en',
  -- The 30 day trial of the external channels starts the first time one is switched on, not at
  -- sign-up, so nobody finds it spent without having used it (ADR 0009). Null: never started.
  external_trial_started_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Per event and per channel, so `/settings` (#171) and the channels (#172, #173) read one table
-- instead of inventing one each. A missing row is the starting point, not "off".
create table public.notification_preferences (
  user_id uuid not null references auth.users (id) on delete cascade,
  event public.notification_event not null,
  channel public.notification_channel not null,
  enabled boolean not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, event, channel)
);


-- Row level security, as the other tables of a Developer: the server writes with the service role,
-- which bypasses RLS, and client write grants are revoked so a client write fails loudly.

alter table public.notifications enable row level security;
alter table public.notification_settings enable row level security;
alter table public.notification_preferences enable row level security;

revoke all on public.notifications, public.notification_settings, public.notification_preferences
  from anon, authenticated;

-- A Developer reads their own and marks them Seen. `seen_at` is the only column granted, so a
-- client cannot rewrite the event, the Release or the day a Notification was born.
grant select on public.notifications to authenticated;
grant update (seen_at) on public.notifications to authenticated;

create policy "Own notifications: read" on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Own notifications: mark seen" on public.notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.notification_settings to authenticated;

create policy "Own notification settings: read" on public.notification_settings for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Own notification settings: write" on public.notification_settings for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Own notification settings: change" on public.notification_settings for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.notification_preferences to authenticated;

create policy "Own notification preferences: read" on public.notification_preferences for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Own notification preferences: write" on public.notification_preferences for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Own notification preferences: change" on public.notification_preferences for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
