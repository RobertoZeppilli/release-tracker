import type { Translator } from "@/modules/i18n";
import { LocaleLink as Link } from "@/modules/i18n/ui";
import { Fragment, type ReactNode } from "react";
import { ColumnTitle } from "@/components/column-title";
import type { DefaultStartReason } from "../domain/default-upgrade-start";
import {
  computeUpgradePath,
  type PathCounts,
  type PathMajor,
  recordedHistory,
  type SummarizedRelease,
  type UpgradePath,
} from "../domain/upgrade-path";
import { HistoryOverview } from "./history-overview";
import { BarLegend, MajorBar, MajorWords } from "./major-bar";
import { Group, ReleaseRow, Row, rowKey } from "./release-rows";
import { ReleaseRowContent } from "./release-row-content";
import { type FormMessage, UpgradeForm } from "./upgrade-form";
import { UpgradePanel } from "./upgrade-panel";
import { defaultStartNote, invalidMessage } from "./upgrade-path-copy";
import { UpgradeVerdict } from "./upgrade-verdict";

// The start of the path and where it came from, which decides what the note under the field says.
// A start the reader typed needs no note: they can see what they wrote. A declared one needs none
// either, since the `in use` row above the field holds it. `none` is the plain list, which is what
// an emptied field asks for.
export type PathStart =
  | { kind: "none" }
  | { kind: "typed"; version: string }
  | { kind: "declared"; version: string }
  | { kind: "default"; version: string; reason: DefaultStartReason };

type Props = {
  slug: string;
  name: string;
  latest: string;
  retired: boolean;
  releases: SummarizedRelease[];
  start: PathStart;
  // The breadcrumb and the Technology's own header, passed as an element because they belong at the
  // top of the left column and not in a band over the split: the name, the sources and the Follow
  // go with the panel and the verdict, and the right column names its own ordering (DESIGN.md,
  // Technology, the split).
  head?: ReactNode;
  // The Version in use row of the panel, passed as an element: declaring one belongs to the `plans`
  // module, and the Upgrade Path has no reason to know what following is. It renders nothing for a
  // Visitor, which is every reader of the cached page until the session is known.
  declaration?: ReactNode;
  // The plain list of Releases, shown when there is no path to show.
  children: ReactNode;
  // ⚠️ A prop and not `getTranslator()`: this block is rendered by the page **and** by the client
  // view that reads `?from=`, so it compiles into both graphs and can neither import `i18n/server`
  // nor call a hook.
  t: Translator;
};

function formMessage(
  path: UpgradePath<SummarizedRelease>,
  name: string,
  base: string,
  start: PathStart,
  t: Translator,
): FormMessage | null {
  if (path.type === "invalid")
    return { tone: "breaking", label: "error:", body: invalidMessage(path.reason, path.from, path.latest, t) };
  // The counts below are built on a start nobody asked for, so the line that introduces them says
  // where it comes from (CONTEXT.md, Cammino di upgrade). A declared start needs no line of its own
  // any more: the `in use` row of the panel carries the version and the day it was declared, two
  // rows above the `from` that repeats it.
  if (start.kind === "default")
    return { tone: "muted", label: "note:", body: defaultStartNote(path.from, start.reason, t) };
  if (path.recorded) return null;
  const links = path.suggestions.map((version, index) => (
    <Fragment key={version}>
      {index > 0 && ` ${t("path.or")} `}
      <Link href={`${base}?from=${encodeURIComponent(version)}`} className="text-link underline">
        {version}
      </Link>
    </Fragment>
  ));
  return {
    tone: "muted",
    label: "note:",
    // Two sentences and the links between them: a message cannot carry an element, so the question
    // is a message of its own and the versions are composed after it (`message.ts`).
    body: (
      <>
        {t("path.unrecorded.why", { from: path.from, name })} {t("path.unrecorded.ask")} {links}?
      </>
    ),
  };
}

// The two questions of the page, a column each (DESIGN.md, The Two Questions Rule): *what do I have
// to do about this Technology* on the left, as the header, the panel and the verdict, and *what has
// changed in it* on the right, as the list. They are the two grid items of the page's split, so
// this renders them as siblings and nothing is printed in both.
//
// It takes the start already chosen, so the same markup serves the page's first render and the
// client that reads `?from=` out of the URL.
export function UpgradePathBlock({
  slug,
  name,
  latest,
  retired,
  releases,
  start,
  head,
  declaration,
  children,
  t,
}: Props) {
  const base = `/technologies/${slug}`;
  const computed = start.kind === "none" ? null : computeUpgradePath(releases, start.version);
  // The path as the page walks it, or null in every state where the list is the whole history: no
  // start, and a refused one, which keeps the list it already had.
  const path = computed?.type === "path" ? computed : null;
  // Counted on the Releases the list below prints, not on the ones recorded: a link that promises
  // completeness has to promise the number the reader can count.
  const history = recordedHistory(releases);
  const versions = releases.filter(({ version }) => !version.includes("-")).map(({ version }) => version);
  // An empty `?from=` is how the form says "no path": the way back to the whole history.
  const hidden = path ? releases.length - path.range.length - path.previews.length : 0;

  return (
    <>
      {/* The cell takes the height of the row and the block inside it sticks: a sticky grid item is
          free to ride past the bottom of its own row, and at the end of a short page it printed
          itself over the footer (DESIGN.md, Technology, the split). */}
      <div className="self-stretch">
        <div className="split:sticky split:top-[72px]">
          {head}
          <section aria-labelledby="plan-title" className="mt-5 stacked:mt-7">
            <h2 id="plan-title" className="sr-only">
              {t("path.whatToDo")}
            </h2>
            <UpgradePanel latest={latest} t={t}>
              {declaration}
              <UpgradeForm
                action={base}
                latest={latest}
                versions={versions}
                value={start.kind === "none" ? "" : start.version}
                message={computed && formMessage(computed, name, base, start, t)}
                t={t}
              />
            </UpgradePanel>
            {path ? (
              <UpgradeVerdict
                from={path.from}
                to={path.to}
                counts={path.counts}
                showAll={hidden > 0 ? { href: `${base}?from=`, total: history.listed } : null}
                t={t}
              />
            ) : (
              !computed && <HistoryOverview history={history} base={base} t={t} />
            )}
          </section>
        </div>
      </div>

      <section aria-labelledby="stream-title">
        {/* The column names its own ordering, because the ordering is information: a path is read in
            the direction the upgrade is performed, the recorded history newest major first. */}
        <ColumnTitle id="stream-title">
          {t(path ? "path.changed.inOrder" : "path.changed.newest")}
        </ColumnTitle>
        <BarLegend counts={legendCounts(path ? path.majors : history.majors)} t={t} />
        {path ? (
          <PathGroups
            slug={slug}
            majors={path.majors}
            from={path.from}
            to={path.to}
            previews={retired ? [] : path.previews}
            t={t}
          />
        ) : (
          children
        )}
      </section>
    </>
  );
}

// The legend explains a fill, so it is there only where a bar draws one: with a single major there
// are no bars, and the gutter, the bar and the legend go together (DESIGN.md, Stat Row).
function legendCounts(majors: PathMajor<SummarizedRelease>[]): PathCounts[] {
  return majors.length > 1 ? majors.map((group) => group.counts) : [];
}

function PathGroups({
  slug,
  majors,
  from,
  to,
  previews,
  t,
}: {
  slug: string;
  majors: PathMajor<SummarizedRelease>[];
  from: string;
  to: string;
  previews: SummarizedRelease[];
  t: Translator;
}) {
  const widest = Math.max(1, ...majors.map((group) => group.counts.total));
  const bars = majors.length > 1;

  return (
    <div className="[&>section+section]:mt-7">
      {majors.map((group) => (
        <Group
          key={group.major}
          id={`v${group.major}`}
          title={`v${group.major}`}
          words={
            <MajorWords counts={group.counts} after={from.startsWith(`${group.major}.`) ? from : undefined} t={t} />
          }
          bar={bars ? <MajorBar counts={group.counts} widest={widest} /> : undefined}
        >
          {group.rows.map((row) => (
            <Row
              key={rowKey(row)}
              slug={slug}
              row={row}
              verdict={(release) => <ReleaseRowContent slug={slug} release={release} t={t} />}
              t={t}
            />
          ))}
        </Group>
      ))}
      {previews.length > 0 && (
        <Group id="previews" title="previews" words={t("path.previews.ahead", { version: to })}>
          {previews.map((release) => (
            <ReleaseRow key={release.version} slug={slug} release={release}>
              <ReleaseRowContent slug={slug} release={release} t={t} />
            </ReleaseRow>
          ))}
        </Group>
      )}
    </div>
  );
}
