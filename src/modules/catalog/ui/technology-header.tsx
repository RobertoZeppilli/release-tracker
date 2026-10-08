import type { Source } from "../domain/catalog-entry";
import type { StoredTechnology } from "../domain/plan-catalog-sync";
import { TechnologyMark } from "./technology-mark";
import { RetiredNote } from "./retired-note";

function sourceLabel(source: Source): string {
  switch (source.kind) {
    case "npm":
      return `npm ${source.package}`;
    case "github-releases":
    case "changelog":
      return `github ${source.repo}`;
  }
}

// `follow` arrives as an element, not as a component: the Follow belongs to the `plans` module, and
// the Catalog has no reason to know what following is.
export function TechnologyHeader({
  technology,
  latest,
  follow,
}: {
  technology: StoredTechnology;
  latest: string | null;
  follow?: React.ReactNode;
}) {
  const labels = [...new Set(technology.sources.map(sourceLabel))];
  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="flex items-center gap-2 font-sans text-headline font-semibold">
          <TechnologyMark slug={technology.slug} size={5} />
          {technology.name}
        </h1>
        {/* One group for the facts, as in the mock: they wrap together, so the Follow keeps a line of
            its own under 640px instead of trailing the Sources. */}
        <div className="flex flex-wrap items-center gap-4 font-mono text-label text-text-muted">
          {latest && (
            <p>
              latest <strong className="font-normal text-text">{latest}</strong>
            </p>
          )}
          <ul className="flex flex-wrap gap-4" aria-label="Sources">
            {labels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
        {follow}
      </div>
      {technology.retired && <RetiredNote name={technology.name} latest={latest} />}
    </>
  );
}
