-- The Waitlist (ADR 0010). Until the launch of 20 January 2027 no new account is born, and what the
-- landing collects instead is an address to warn once, on that day.
--
-- A Signup is an address, a language, a day and where it came from, and nothing else: a name adds
-- nothing to sending a message, and a field nobody needs is a field to keep safe for no reason.
create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  -- Normalized before it arrives: lower case and trimmed, so `A@B.com` and `a@b.com` are one
  -- address. The check is the second lock, because a form can be posted without the page.
  email text not null,
  -- The language the landing was being read in, which is the language the launch message is owed
  -- in: the enum the Notifications already declared (ADR 0008, ADR 0009).
  locale public.locale not null default 'en',
  -- Which page the address was left on. One value today, `landing`, and it is here so the answer to
  -- "where do they come from" does not require a deploy the day it is asked.
  source text not null default 'landing',
  created_at timestamptz not null default now(),
  -- The day the launch message went out to this address. Null until then, which is also how the job
  -- of 20 January 2027 will know who is still owed one (#173).
  confirmed_at timestamptz,
  -- 254 is the longest address an SMTP server has to accept (RFC 5321), and `@` cannot be the first
  -- character: the shape is checked here as well as in `domain`, for the same reason the trim is.
  constraint waitlist_signups_email_shape check (
    email = lower(email)
    and email = btrim(email)
    and length(email) between 3 and 254
    and position('@' in email) > 1
  )
);

-- An address is worth one Signup, and the rule is in the database and not only in the action: asked
-- twice, the second insert conflicts instead of writing a row, and the reader is told it is already
-- there rather than shown an error. They did nothing wrong.
create unique index waitlist_signups_email_once on public.waitlist_signups (email);

-- ⚠️ No client reads this table, and none writes it either. RLS is on with **no policy**, so anon
-- and authenticated are refused by the policies; the grants below are the second lock, because
-- Supabase's default privileges hand both roles every table in `public`. The insert goes through the
-- Server Action with the service key, which never leaves the server.
-- A list of email addresses readable from a browser would be the present for whoever collects
-- addresses, and the privacy notice of this product promises the opposite.
alter table public.waitlist_signups enable row level security;
revoke all on public.waitlist_signups from anon, authenticated;

-- ⚠️ The remote project does not hand a new table to the service role the way the local default
-- privileges do (#188): without this grant the insert of the Server Action answers `42501 permission
-- denied` in production while the local integration suite writes green. `select` as well as
-- `insert`, because on the morning of the launch the list has to be readable to be written to, and
-- the job that sends the one message (#173) is the thing that will read it.
grant select, insert, update on public.waitlist_signups to service_role;
