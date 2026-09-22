-- The Message Batch a `processing` Summary was sent in (ADR 0007): the collect run reads it back.
alter table public.summaries add column batch_id text;

create index summaries_batch_id_idx on public.summaries (batch_id) where batch_id is not null;

-- ADR 0003: one UPDATE … RETURNING takes each pending Summary exactly once, even with overlapping runs.
-- `skip locked` lets a concurrent run take other rows; the outer `status` check guards the re-read.
create function public.claim_pending_summaries(max_count integer)
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
      where pending.status = 'pending'
      order by pending.updated_at
      limit max_count
      for update skip locked
    )
  returning summary.release_id;
$$;

revoke execute on function public.claim_pending_summaries(integer) from public, anon, authenticated;
grant execute on function public.claim_pending_summaries(integer) to service_role;
