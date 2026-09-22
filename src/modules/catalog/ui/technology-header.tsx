import type { Source } from "../domain/catalog-entry";
import type { StoredTechnology } from "../domain/plan-catalog-sync";
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

export function TechnologyHeader({ technology, latest }: { technology: StoredTechnology; latest: string | null }) {
  const labels = [...new Set(technology.sources.map(sourceLabel))];
  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-sans text-headline font-semibold">{technology.name}</h1>
        {latest && (
          <p className="font-mono text-label text-text-muted">
            latest <strong className="font-normal text-text">{latest}</strong>
          </p>
        )}
        <ul className="flex flex-wrap gap-4 font-mono text-label text-text-muted" aria-label="Sources">
          {labels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>
      {technology.retired && <RetiredNote name={technology.name} latest={latest} />}
    </>
  );
}
