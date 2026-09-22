-- The remote project does not expose new tables automatically, so default privileges may not
-- cover the service role there as they do locally. Grant explicitly so both behave the same.

grant usage on schema public to service_role;

grant select, insert, update, delete on public.technologies, public.sources, public.releases,
  public.release_notes, public.summaries, public.follows, public.plans to service_role;
