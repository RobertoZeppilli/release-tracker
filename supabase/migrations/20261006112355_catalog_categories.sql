-- The Category of a Technology (issue #86): the trade it plies in a stack, and the way the Catalog
-- reads. Curated by us in `catalog/<slug>.json`, never read from a Source, and a closed set of ten:
-- an enum, so a value outside CONTEXT.md is refused here and not only by the Catalog schema.
create type public.technology_category as enum ('language', 'runtime', 'framework', 'server framework', 'database', 'build tool', 'testing', 'lint and formatting', 'library', 'platform');

alter table public.technologies add column category public.technology_category;

-- Backfill by slug, because every Technology needs one and there is no "other" to fall back on. The
-- Catalog files carry the same pairs; `pnpm catalog:sync` keeps them in step from here on.
update public.technologies as t
set category = v.category::public.technology_category
from (values
  ('typescript', 'language'),
  ('rust', 'language'),
  ('nodejs', 'runtime'),
  ('deno', 'runtime'),
  ('bun', 'runtime'),
  ('angular', 'framework'),
  ('astro', 'framework'),
  ('next', 'framework'),
  ('nuxt', 'framework'),
  ('react', 'framework'),
  ('svelte', 'framework'),
  ('sveltekit', 'framework'),
  ('vue', 'framework'),
  ('express', 'server framework'),
  ('fastify', 'server framework'),
  ('nestjs', 'server framework'),
  ('trpc', 'server framework'),
  ('prisma', 'database'),
  ('drizzle-orm', 'database'),
  ('vite', 'build tool'),
  ('webpack', 'build tool'),
  ('turborepo', 'build tool'),
  ('pnpm', 'build tool'),
  ('vitest', 'testing'),
  ('jest', 'testing'),
  ('playwright', 'testing'),
  ('storybook', 'testing'),
  ('eslint', 'lint and formatting'),
  ('prettier', 'lint and formatting'),
  ('biome', 'lint and formatting'),
  ('axios', 'library'),
  ('zod', 'library'),
  ('tailwindcss', 'library'),
  ('zustand', 'library'),
  ('redux-toolkit', 'library'),
  ('electron', 'platform'),
  ('terraform', 'platform')
) as v (slug, category)
where t.slug = v.slug;

-- A Technology the backfill does not name would have no Category, and guessing one is exactly the
-- "other" group the Category is there to avoid: stop with a readable reason instead.
do $$
declare
  orphans text;
begin
  select string_agg(slug, ', ' order by slug) into orphans from public.technologies where category is null;
  if orphans is not null then
    raise exception 'no category for: %. Add it to the enum backfill before running this migration.', orphans;
  end if;
end $$;

alter table public.technologies alter column category set not null;
