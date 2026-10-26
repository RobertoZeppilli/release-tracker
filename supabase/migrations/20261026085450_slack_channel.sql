-- The Slack channel (#172, ADR 0009). The webhook is a secret, so it lives in a table of its own
-- that no client may touch, and what a Developer reads back is a hint beside their settings.
-- The schema goes in before the code (`docs/DECISIONI.md`, migration first).

-- ⚠️ **Not a column of `notification_settings` with a narrower grant**, which is where this started:
-- `insert ... on conflict do update` needs `select` on the **whole table**, not on the columns it
-- names, so revoking `select` on one column would have broken every upsert a Developer's own client
-- makes on that table, the preferred language among them. A secret nobody may read belongs in a
-- table nobody may read.
create table public.notification_secrets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- The Slack incoming webhook. Anyone holding it can post to that channel, which is why it never
  -- leaves the server: the jobs and the Server Actions read it with the service role.
  slack_webhook_url text,
  updated_at timestamptz not null default now(),
  -- A URL that is not Slack's would be this Developer's secret posted to somebody else's server, and
  -- an empty string is a channel that looks on and sends nowhere. The Server Action refuses both as
  -- well, because a row can be written without the page.
  constraint notification_secrets_slack_webhook_url
    check (slack_webhook_url is null or slack_webhook_url like 'https://hooks.slack.com/services/_%')
);

alter table public.notification_secrets enable row level security;
-- No grant and no policy for a client, on purpose: RLS with no policy denies everything, and the
-- missing grant denies it one step earlier. The service role bypasses both.
revoke all on public.notification_secrets from anon, authenticated;

-- What the Developer reads back instead of the URL: the host and the last four characters, written
-- by the server when the URL is saved. A hint is not a secret, so it sits with the settings and is
-- covered by the grants already there.
alter table public.notification_settings add column slack_webhook_hint text;

-- What happened when a channel tried to deliver. One row per Notification and channel, so a second
-- run of the job skips what already went out: the delivery is what makes the send idempotent, the
-- way `notifications_once_per_subject` makes the Notification idempotent.
create type public.notification_delivery_status as enum ('sent', 'failed');

create table public.notification_deliveries (
  notification_id uuid not null references public.notifications (id) on delete cascade,
  channel public.notification_channel not null,
  status public.notification_delivery_status not null,
  -- Only on a failure, and it is shown to the Developer in `/settings`: what Slack answered, cut to
  -- a line. Never the webhook URL, which would print the secret back on the page.
  error text,
  attempted_at timestamptz not null default now(),
  primary key (notification_id, channel),
  constraint notification_deliveries_error check ((status = 'failed') = (error is not null))
);

-- The job asks "what has not gone out on this channel yet", which is this index read backwards.
create index notification_deliveries_channel_idx on public.notification_deliveries (channel, attempted_at desc);

alter table public.notification_deliveries enable row level security;
revoke all on public.notification_deliveries from anon, authenticated;

-- A Developer reads the deliveries of their own Notifications and writes none: the job writes with
-- the service role, which bypasses RLS. The subquery is what ties a delivery to a person, since the
-- table holds no `user_id` of its own.
grant select on public.notification_deliveries to authenticated;

create policy "Own deliveries: read" on public.notification_deliveries for select to authenticated
  using (
    exists (
      select 1 from public.notifications
      where notifications.id = notification_deliveries.notification_id
        and notifications.user_id = (select auth.uid())
    )
  );
