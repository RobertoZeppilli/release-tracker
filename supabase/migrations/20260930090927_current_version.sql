-- The Version in use (issue #68): the Version a Developer declares to be on, saved on their follow.
-- It is declared, never observed, so every count that leans on it has to say since when it has been
-- standing. That timestamp is the database's to write: a client that could set it could also make a
-- stale declaration look fresh.
--
-- Validation mirrors the start of the Upgrade Path (GLOSSARY.md): well formed, and not newer than the
-- latest stable Release. Three custom SQLSTATEs travel to the browser through PostgREST, as the follow
-- rules already do: 'FVMAL' not a Version, 'FVNEW' newer than the latest stable, 'FVNST' no stable
-- Release to measure from.

create function public.is_semver(version text)
returns boolean
language sql
immutable
strict
set search_path = ''
as $$
  select version ~ '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z.-]+)?$';
$$;

-- Only the core of a Version, as an integer array: Postgres compares arrays element by element, so
-- `{2,0,0} > {1,9,9}` is SemVer precedence. The prerelease is dropped on purpose, and dropping it
-- loses nothing here: with the same core a prerelease ranks below its Release, so it is never the
-- newer of the two, which is the only question this comparison is asked.
create function public.semver_core(version text)
returns integer[]
language sql
immutable
strict
set search_path = ''
as $$
  select string_to_array(split_part(split_part(version, '+', 1), '-', 1), '.')::integer[];
$$;

alter table public.follows
  add column current_version text,
  add column current_version_declared_at timestamptz,
  add constraint follows_current_version_semver
    check (current_version is null or public.is_semver(current_version)),
  add constraint follows_current_version_declared_at
    check ((current_version is null) = (current_version_declared_at is null));

create function public.enforce_current_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  latest text;
begin
  if new.current_version is null then
    new.current_version_declared_at := null;
    return new;
  end if;

  -- The shape is checked here and not left to the constraint below, which the trigger would never
  -- reach: comparing a Version that is not one would fail first, on the cast, with a SQLSTATE about
  -- text that says nothing about the rule that was broken.
  if not public.is_semver(new.current_version) then
    raise exception 'The Version in use is not a Version'
      using errcode = 'FVMAL';
  end if;

  -- Re-declaring the same Version leaves the timestamp alone: nothing about the declaration moved.
  if tg_op = 'UPDATE' and old.current_version = new.current_version then
    new.current_version_declared_at := old.current_version_declared_at;
  else
    new.current_version_declared_at := now();
  end if;

  select version into latest
  from public.releases
  where technology_id = new.technology_id
    and public.is_semver(version)
    and strpos(split_part(version, '+', 1), '-') = 0
  order by public.semver_core(version) desc
  limit 1;

  if latest is null then
    raise exception 'A Technology with no stable Release cannot have a Version in use'
      using errcode = 'FVNST';
  end if;

  if public.semver_core(new.current_version) > public.semver_core(latest) then
    raise exception 'The Version in use cannot be newer than the latest stable Release'
      using errcode = 'FVNEW';
  end if;

  return new;
end;
$$;

create trigger enforce_current_version
  before insert or update on public.follows
  for each row execute function public.enforce_current_version();

-- Only this one column: a wider grant would let an update move `technology_id`, which would walk
-- past the follow rules that only guard an insert.
grant update (current_version) on public.follows to authenticated;

create policy "Own follows: declare the Version in use" on public.follows for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
