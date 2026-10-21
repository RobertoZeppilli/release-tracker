import type { Translator } from "@/modules/i18n";
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
  t,
}: {
  technology: StoredTechnology;
  latest: string | null;
  follow?: React.ReactNode;
  // A prop, for the reason `RetiredNote` gives.
  t: Translator;
}) {
  const labels = [...new Set(technology.sources.map(sourceLabel))];
  return (
    <>
      {/* Two shapes, one row each. In the 360px column of the split it is a grid: the name takes the
          first line with the Follow at its end, and the facts drop under them, because the one-line
          row of the old full-width band wrapped three times in a column this narrow (DESIGN.md,
          Technology, the split). The Follow is placed by the grid itself, in the one cell the two
          explicit items leave free, so the `plans` module never has to know what this layout is.
          Where the two columns become one it is the row it always was, the Follow at its end. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 split:grid split:grid-cols-[minmax(0,1fr)_auto]">
        <h1 className="flex min-w-0 items-center gap-2 font-sans text-headline font-semibold split:col-start-1 split:row-start-1">
          <TechnologyMark slug={technology.slug} size={5} />
          {technology.name}
        </h1>
        {/* One group for the facts: they wrap together, so the Follow keeps a line of its own under
            640px instead of trailing the Sources. */}
        <div className="flex flex-wrap items-center gap-4 font-mono text-label text-text-muted split:col-span-2 split:row-start-2">
          {latest && (
            <p>
              {t("catalog.latest")} <strong className="font-normal text-text">{latest}</strong>
            </p>
          )}
          <ul className="flex flex-wrap gap-4" aria-label={t("catalog.sources")}>
            {labels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
        {follow}
      </div>
      {technology.retired && <RetiredNote name={technology.name} latest={latest} t={t} />}
    </>
  );
}
