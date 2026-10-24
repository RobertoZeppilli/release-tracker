-- Initial schema for the entities of PRD #1. Names follow the table in GLOSSARY.md.

create type public.significance as enum ('featured', 'notable', 'digest', 'preview');
create type public.source_role as enum ('detection', 'notes');
create type public.release_origin as enum ('imported', 'detected');
create type public.summary_status as enum ('pending', 'processing', 'ready', 'unavailable', 'skipped', 'failed');
create type public.plan as enum ('free', 'pro', 'team');

-- A Technology is never deleted: leaving the Catalog sets `retired` (ADR 0005).
create table public.technologies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  -- The set of strategies lives in the releases module; the Catalog schema validates it.
  classification_strategy text not null,
  retired boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid not null references public.technologies (id),
  role public.source_role not null,
  kind text not null,
  config jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index sources_technology_id_idx on public.sources (technology_id);

create table public.releases (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid not null references public.technologies (id),
  version text not null,
  significance public.significance not null,
  significance_override public.significance,
  origin public.release_origin not null,
  published_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (technology_id, version)
);

create index releases_published_at_idx on public.releases (technology_id, published_at desc);

-- Stored exactly as the Source provides them.
create table public.release_notes (
  release_id uuid primary key references public.releases (id),
  source_id uuid references public.sources (id),
  body text not null,
  url text,
  fetched_at timestamptz not null default now()
);

create table public.summaries (
  release_id uuid primary key references public.releases (id),
  status public.summary_status not null,
  -- Validated by the summaries module's Zod schema, never read unchecked.
  content jsonb,
  model text,
  prompt_version text,
  failure_reason text,
  updated_at timestamptz not null default now()
);

create index summaries_status_idx on public.summaries (status);

create table public.follows (
  user_id uuid not null references auth.users (id) on delete cascade,
  technology_id uuid not null references public.technologies (id),
  created_at timestamptz not null default now(),
  primary key (user_id, technology_id)
);

create index follows_technology_id_idx on public.follows (technology_id);

create table public.plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan public.plan not null default 'free',
  updated_at timestamptz not null default now()
);

-- Every Developer starts on Free.
create function public.create_free_plan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.plans (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_free_plan();

-- Row level security. The server writes with the service role, which bypasses RLS.
-- Write grants are also revoked so a client write fails loudly instead of matching zero rows.

alter table public.technologies enable row level security;
alter table public.sources enable row level security;
alter table public.releases enable row level security;
alter table public.release_notes enable row level security;
alter table public.summaries enable row level security;
alter table public.follows enable row level security;
alter table public.plans enable row level security;

revoke all on public.technologies, public.sources, public.releases, public.release_notes,
  public.summaries, public.follows, public.plans from anon, authenticated;

grant select on public.technologies, public.sources, public.releases, public.release_notes,
  public.summaries to anon, authenticated;

create policy "Public read" on public.technologies for select to anon, authenticated using (true);
create policy "Public read" on public.sources for select to anon, authenticated using (true);
create policy "Public read" on public.releases for select to anon, authenticated using (true);
create policy "Public read" on public.release_notes for select to anon, authenticated using (true);
create policy "Public read" on public.summaries for select to anon, authenticated using (true);

grant select, insert, delete on public.follows to authenticated;

create policy "Own follows: read" on public.follows for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Own follows: add" on public.follows for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Own follows: remove" on public.follows for delete to authenticated
  using (user_id = (select auth.uid()));

grant select on public.plans to authenticated;

create policy "Own plan: read" on public.plans for select to authenticated
  using (user_id = (select auth.uid()));

revoke execute on function public.create_free_plan() from public, anon, authenticated;
