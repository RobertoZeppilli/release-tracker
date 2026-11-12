-- The schema of PRD #1 in SQLite, as the eighteen Postgres migrations left it (issue #211, ADR 0011).
-- Names follow the table in GLOSSARY.md and are unchanged: the same columns, read by the same code.
--
-- Why one file and not eighteen translated one by one. A migration exists to carry a database that
-- already holds rows from one schema to the next, and no SQLite database of this app exists yet:
-- every install starts from here. Replaying the history would mean translating `drop column` on a
-- column nothing ever created, through a dialect that cannot drop a column with a constraint on it.
-- The mechanism stays -- numbered files, applied in order, recorded in `schema_migrations` -- and it
-- is what carries the files that come after this one, where there will be rows to carry.
--
-- What Postgres held that is not here, and where it went:
--
--   * Row level security, policies, grants and the `anon`/`authenticated`/`service_role` roles. They
--     answered "whose row is this" and "may this client touch it". An installed copy belongs to one
--     person and talks to a file, so neither question has a second answer (issue #210, ADR 0011).
--   * `enforce_current_version`, the trigger that validated the Version in use. It needs to parse a
--     SemVer and compare it with the latest stable Release, and SQLite has neither the regex nor the
--     array comparison Postgres did it with. ⚠️ **That rule now has no home**: it moves into the
--     write function for `follows`, with the rest of the layer that replaces `supabase-js`, and
--     until it does a Version in use is only checked by the interface. The two columns keep the one
--     constraint SQLite can state, that they are true or null together.
--   * `claim_pending_summaries`, which took each pending Summary exactly once under `skip locked`.
--     One process writes this file, so the fence it provided is the write lock SQLite already takes.
--
-- Dialect notes, once for the whole file:
--
--   * `uuid` is `text`. The default builds a v4 out of `randomblob`, so an id generated here is the
--     same shape as the ones in a file exported from production, which stay the ids they were.
--     ⚠️ Written out in full at each of the four tables that need it rather than registered as an
--     application function: SQLite checks a default expression when it reads the schema, so a
--     `uuid4()` of ours would make every `create table` here fail for any program that opens the
--     file without it -- the `sqlite3` shell and whatever someone backs their data up with.
--   * `timestamptz` is `text` holding ISO-8601 in UTC, which is what the Zod schemas already parse
--     and what sorts correctly as a string.
--   * An `enum` is `text` with a `check`: the closed set is still refused here and not only by the
--     code, which is the point the Category migration made (issue #86).
--   * `jsonb` is `text` with `json_valid`.

create table technologies (
  id text primary key default (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2)
    || '-' || substr('89ab', (random() & 3) + 1, 1) || substr(hex(randomblob(2)), 2) || '-'
    || hex(randomblob(6)))),
  slug text not null unique,
  name text not null,
  description text not null default '',
  -- The set of strategies lives in the releases module; the Catalog schema validates it.
  classification_strategy text not null,
  -- A closed set of ten, curated in `catalog/<slug>.json` and never read from a Source (issue #86).
  category text not null check (
    category in (
      'language', 'runtime', 'framework', 'server framework', 'database',
      'build tool', 'testing', 'lint and formatting', 'library', 'platform'
    )
  ),
  -- A Technology is never deleted: leaving the Catalog sets `retired` (ADR 0005).
  retired integer not null default 0 check (retired in (0, 1)),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table sources (
  id text primary key default (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2)
    || '-' || substr('89ab', (random() & 3) + 1, 1) || substr(hex(randomblob(2)), 2) || '-'
    || hex(randomblob(6)))),
  technology_id text not null references technologies (id),
  role text not null check (role in ('detection', 'notes')),
  kind text not null,
  config text not null default '{}' check (json_valid(config)),
  -- The Detection's validator for the last listing this Source served: null means always download.
  etag text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  -- The Catalog sync identifies a Source by these three, so it updates one in place (ADR 0005).
  unique (technology_id, role, kind)
);

create index sources_technology_id_idx on sources (technology_id);

create table releases (
  id text primary key default (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2)
    || '-' || substr('89ab', (random() & 3) + 1, 1) || substr(hex(randomblob(2)), 2) || '-'
    || hex(randomblob(6)))),
  technology_id text not null references technologies (id),
  version text not null,
  significance text not null check (significance in ('featured', 'notable', 'digest', 'preview')),
  significance_override text check (significance_override in ('featured', 'notable', 'digest', 'preview')),
  origin text not null check (origin in ('imported', 'detected')),
  published_at text not null,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  unique (technology_id, version)
);

create index releases_published_at_idx on releases (technology_id, published_at desc);

-- Stored exactly as the Source provides them.
create table release_notes (
  release_id text primary key references releases (id),
  -- A Source removed from the Catalog is deleted; the Release Notes it provided stay.
  source_id text references sources (id) on delete set null,
  body text not null,
  url text,
  fetched_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  -- The verdict of a Summary is muted when the Notes only point elsewhere (GLOSSARY.md, Note
  -- giudicabili). The rule needs at most the first NOTES_HEAD_LENGTH characters; the column carries
  -- one over that cap, which is what tells a capped head from a whole one, so the Dashboard judges
  -- every row without reading bodies up to 108k characters.
  -- Keep the 401 here equal to NOTES_HEAD_LENGTH + 1 in `summaries/domain/notes-judgement.ts`.
  body_head text generated always as (substr(body, 1, 401)) stored
);

create table summaries (
  release_id text primary key references releases (id),
  status text not null check (status in ('pending', 'processing', 'ready', 'unavailable', 'skipped', 'failed')),
  -- Validated by the summaries module's Zod schema, never read unchecked.
  content text check (content is null or json_valid(content)),
  model text,
  prompt_version text,
  failure_reason text,
  -- The Message Batch a `processing` Summary was sent in (ADR 0007): the collect run reads it back.
  batch_id text,
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  -- Issue #88: a visible Summary must say where it came from, so "the model does not invent" does
  -- not rest on someone remembering to look.
  constraint summaries_ready_provenance check (
    status <> 'ready'
    or (content is not null and model is not null and prompt_version is not null)
  )
);

create index summaries_status_idx on summaries (status);
create index summaries_batch_id_idx on summaries (batch_id) where batch_id is not null;

-- A follow is a Technology and nothing else: there is nobody to tell apart (issue #210, ADR 0011).
create table follows (
  technology_id text primary key references technologies (id),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  -- The Version in use (issue #68): declared, never observed, so the timestamp says since when the
  -- declaration has been standing. ⚠️ Its SemVer shape and the "not newer than the latest stable"
  -- rule are not checked here; see the note at the top of this file.
  current_version text,
  current_version_declared_at text,
  constraint follows_current_version_declared_at
    check ((current_version is null) = (current_version_declared_at is null))
);

-- The database is the authority on what can be followed (issue #18): the interface only anticipates
-- the rule, and going around it changes nothing. The Free limit left with the Plan (issue #209), so
-- what remains is the retired Technology. 'FRTRD' is the code the interface already reads.
create trigger follows_refuse_retired
before insert on follows
for each row
when (select retired from technologies where id = new.technology_id)
begin
  select raise(abort, 'FRTRD: a retired Technology cannot be followed');
end;

-- A Notification is a fact about a Release or a week, now that there is one reader (ADR 0009).
create table notifications (
  id text primary key default (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2)
    || '-' || substr('89ab', (random() & 3) + 1, 1) || substr(hex(randomblob(2)), 2) || '-'
    || hex(randomblob(6)))),
  event text not null check (event in ('featured_release', 'notable_release', 'weekly_digest')),
  -- A Release event points at its Release; the weekly Digest at an ISO week, `2026-W43`.
  release_id text references releases (id),
  digest_week text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  seen_at text,
  -- What a Notification is about, in one column, so the uniqueness below is a plain index.
  subject text generated always as (coalesce(release_id, digest_week)) stored,
  constraint notifications_subject check (
    case event
      when 'weekly_digest' then release_id is null and digest_week is not null
      else release_id is not null and digest_week is null
    end
  )
);

-- What makes running the job twice harmless: the second insert conflicts instead of duplicating.
-- The check above is what keeps `subject` not null.
create unique index notifications_once_per_subject on notifications (event, subject);
-- The bell's counter, read on every page, so it must not scan the whole history.
create index notifications_unseen_idx on notifications (seen_at) where seen_at is null;
create index notifications_recent_idx on notifications (created_at desc);
-- Kept 90 days (ADR 0009): the job deletes by this index.
create index notifications_created_at_idx on notifications (created_at);

-- One row, written when the settings are first touched. No trigger creates it: a missing row means
-- the declared starting point, which `src/modules/notifications/domain` holds. `singleton` is a
-- column with one legal value, so an upsert has a conflict target to name.
create table notification_settings (
  singleton integer primary key check (singleton = 1),
  preferred_locale text not null default 'en' check (preferred_locale in ('en', 'it', 'fr', 'es', 'de')),
  -- The host and last four characters of the webhook: what is read back instead of the secret.
  slack_webhook_hint text,
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Per event and per channel, so `/settings` and the channels read one table instead of inventing
-- one each. A missing row is the starting point, not "off".
create table notification_preferences (
  event text not null check (event in ('featured_release', 'notable_release', 'weekly_digest')),
  channel text not null check (channel in ('in_app', 'slack', 'email')),
  enabled integer not null check (enabled in (0, 1)),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  primary key (event, channel)
);

-- The Slack webhook. Anyone holding it can post to that channel, which is why it has a table of its
-- own: in Postgres that was what no client could be granted, and here it is what an export of the
-- data file leaves out (#172).
create table notification_secrets (
  singleton integer primary key check (singleton = 1),
  -- A URL that is not Slack's would be this secret posted to somebody else's server, and an empty
  -- string is a channel that looks on and sends nowhere. The write refuses both as well.
  slack_webhook_url text check (
    slack_webhook_url is null or slack_webhook_url like 'https://hooks.slack.com/services/_%'
  ),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- What happened when a channel tried to deliver: one row per Notification and channel, so a second
-- run of the job skips what already went out.
create table notification_deliveries (
  notification_id text not null references notifications (id) on delete cascade,
  channel text not null check (channel in ('in_app', 'slack', 'email')),
  status text not null check (status in ('sent', 'failed')),
  -- Only on a failure, and shown to the reader in `/settings`: what Slack answered, cut to a line.
  -- Never the webhook URL, which would print the secret back on the page.
  error text,
  attempted_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  primary key (notification_id, channel),
  constraint notification_deliveries_error check ((status = 'failed') = (error is not null))
);

-- The job asks "what has not gone out on this channel yet", which is this index read backwards.
create index notification_deliveries_channel_idx on notification_deliveries (channel, attempted_at desc);
