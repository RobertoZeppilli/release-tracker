-- The verdict of a Summary is muted when the Release Notes only point elsewhere (GLOSSARY.md,
-- Note giudicabili). The rule is in `src/modules/summaries/domain/notes-judgement.ts` and needs at
-- most the first NOTES_HEAD_LENGTH characters: longer notes describe something. The column carries
-- one character over that cap, which is what tells a capped head from a whole one, so the Dashboard
-- and the Technology page can judge every row without reading bodies up to 108k characters.
-- Keep the 401 here equal to NOTES_HEAD_LENGTH + 1 there.
alter table public.release_notes
  add column body_head text generated always as (left(body, 401)) stored;
