import { Info } from "lucide-react";
import type { Source } from "../domain/catalog-entry";
import type { StoredTechnology } from "../domain/plan-catalog-sync";

function sourceLabel(source: Source): string {
  switch (source.kind) {
    case "npm":
      return `npm ${source.package}`;
    case "github-releases":
      return `github ${source.repo}`;
  }
}

export function TechnologyHeader({ technology }: { technology: StoredTechnology }) {
  const labels = [...new Set(technology.sources.map(sourceLabel))];
  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-sans text-headline font-semibold">{technology.name}</h1>
        <ul className="flex flex-wrap gap-4 font-mono text-label text-text-muted" aria-label="Sources">
          {labels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>
      {technology.retired && (
        <div role="note" className="mt-5 border-y border-rule py-3">
          <p className="text-text-muted">
            <span className="font-mono text-diagnostic">
              <Info aria-hidden className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
              note:
            </span>{" "}
            {technology.name} is no longer tracked. Its releases stay readable, but new versions are not detected.
          </p>
        </div>
      )}
    </>
  );
}
