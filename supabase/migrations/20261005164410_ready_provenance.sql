-- Issue #88: a visible Summary must say where it came from. A row written by hand with
-- `status = 'ready'` used to render as a real Summary, only without the `model · prompt` tail,
-- so "the model does not invent" rested on someone remembering to look. The database refuses it now.
-- Same shape as follows_current_version_declared_at: the columns are true or null together.
alter table public.summaries
  add constraint summaries_ready_provenance
    check (
      status <> 'ready'
      or (content is not null and model is not null and prompt_version is not null)
    );
