-- The database is the authority on who can be followed (issue #18): the interface only anticipates
-- these two rules, and going around it changes nothing.
--
-- Two custom SQLSTATEs travel to the browser through PostgREST, so the row can say which rule it
-- broke without parsing a message: 'FLIMT' the Free limit, 'FRTRD' a retired Technology. The Free
-- limit counts retired Technologies too; a paid Plan is not limited here (ADR 0004), and what it
-- allows is not decided yet.
create function public.enforce_follow_rules()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  followed integer;
begin
  if (select retired from public.technologies where id = new.technology_id) then
    raise exception 'A retired Technology cannot be followed'
      using errcode = 'FRTRD';
  end if;

  -- One Developer at a time, otherwise two sessions inserting together both read nine and pass.
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));

  if coalesce((select plan from public.plans where user_id = new.user_id), 'free') = 'free' then
    select count(*) into followed from public.follows where user_id = new.user_id;
    if followed >= 10 then
      raise exception 'The Free Plan follows at most 10 Technologies'
        using errcode = 'FLIMT';
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_follow_rules
  before insert on public.follows
  for each row execute function public.enforce_follow_rules();
