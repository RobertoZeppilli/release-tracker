-- The Plan is gone (issue #209, ADR 0011). Verdict is not sold any more, so there is no Free and no
-- Pro, no limit of ten Technologies, and no thirty day trial of the external channels: one level of
-- service, and `follows` is the only table that records what a Developer watches.
--
-- The retired Technology rule stays, because it was never about money: a Technology that has left
-- the Catalog has no Release coming (ADR 0005), and 'FRTRD' still travels to the browser.
--
-- ⚠️ The code that read `plans` is already gone: pull request #228 took it out before this
-- migration, on purpose. The CI applies every migration from scratch and then runs integration and
-- e2e, so a migration that drops the table while the old code is still asserting against it turns
-- two required checks red. Nothing reads the table in between -- production has been a static
-- showcase since #215 and has no server to read with.
--
-- ⚠️ This file is parked outside `supabase/migrations/` so the CI does not apply it yet. Move it
-- there with a fresh timestamp, and delete this copy in the same commit.

-- Without the Free branch, and without the advisory lock that went with it: the lock serialized the
-- two sessions that could both count nine follows and both pass, and there is no count left to race
-- on. One rule remains, so the function keeps its name and loses half its body.
create or replace function public.enforce_follow_rules()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select retired from public.technologies where id = new.technology_id) then
    raise exception 'A retired Technology cannot be followed'
      using errcode = 'FRTRD';
  end if;

  return new;
end;
$$;

-- No row is created when a Developer is born, because there is no Plan to put them on. The trigger
-- goes before the function it calls.
drop trigger on_auth_user_created on auth.users;
drop function public.create_free_plan();

-- The table takes its policy and its grant with it, and then the enum has nothing left to type.
drop table public.plans;
drop type public.plan;

-- The gate of the external channels, closed to the client by the audit of 2026-11-02 and now
-- without anything to gate: Slack and the email are part of the one level of service.
alter table public.notification_settings drop column external_trial_started_at;
