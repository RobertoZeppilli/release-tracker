-- An optional fence by Technology, so the integration tests can run the job against a database that
-- holds the whole Catalog without claiming the Summaries they did not seed (issue #55).
-- `null` keeps the job's real behaviour: every pending Summary. Dropped and recreated instead of
-- `create or replace` because a second signature would make the call from PostgREST ambiguous.
drop function public.claim_pending_summaries(integer);

-- ADR 0003: one UPDATE … RETURNING takes each pending Summary exactly once, even with overlapping runs.
-- `skip locked` lets a concurrent run take other rows; the outer `status` check guards the re-read.
create function public.claim_pending_summaries(max_count integer, technology_ids uuid[] default null)
returns table (release_id uuid)
language sql
security invoker
set search_path = ''
as $$
  update public.summaries as summary
  set status = 'processing', batch_id = null, updated_at = now()
  where summary.status = 'pending'
    and summary.release_id in (
      select pending.release_id
      from public.summaries as pending
      join public.releases as release on release.id = pending.release_id
      where pending.status = 'pending'
        and (technology_ids is null or release.technology_id = any (technology_ids))
      order by pending.updated_at
      limit max_count
      for update of pending skip locked
    )
  returning summary.release_id;
$$;

revoke execute on function public.claim_pending_summaries(integer, uuid[]) from public, anon, authenticated;
grant execute on function public.claim_pending_summaries(integer, uuid[]) to service_role;
