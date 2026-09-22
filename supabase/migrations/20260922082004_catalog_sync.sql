-- The Catalog sync (ADR 0005) identifies a Source by Technology, role and kind, so it can update
-- one in place instead of adding a duplicate.
alter table public.sources
  add constraint sources_technology_id_role_kind_key unique (technology_id, role, kind);

-- A Source removed from the Catalog is deleted; the Release Notes it provided stay.
alter table public.release_notes
  drop constraint release_notes_source_id_fkey,
  add constraint release_notes_source_id_fkey
    foreign key (source_id) references public.sources (id) on delete set null;
