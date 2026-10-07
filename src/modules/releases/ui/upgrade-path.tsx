import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { HelpPointer } from "@/components/help-pointer";
import type { DefaultStartReason } from "../domain/default-upgrade-start";
import { computeUpgradePath, recordedHistory, type SummarizedRelease, type UpgradePath } from "../domain/upgrade-path";
import { HistoryOverview } from "./history-overview";
import { Group, plural, ReleaseRow, Row, rowKey } from "./release-rows";
import { ReleaseRowContent } from "./release-row-content";
import { type FormMessage, UpgradeForm } from "./upgrade-form";
import { declaredStartNote, defaultStartNote, invalidMessage } from "./upgrade-path-copy";
import { UpgradeVerdict } from "./upgrade-verdict";

// The start of the path and where it came from, which decides what the note under the field says.
// A start the reader typed needs no note: they can see what they wrote. `none` is the plain list,
// which is what an emptied field asks for.
export type PathStart =
  | { kind: "none" }
  | { kind: "typed"; version: string }
  | { kind: "declared"; version: string; declaredAt: Date }
  | { kind: "default"; version: string; reason: DefaultStartReason };

type Props = {
  slug: string;
  name: string;
  latest: string;
  retired: boolean;
  releases: SummarizedRelease[];
  start: PathStart;
  // The plain list of Releases, shown when there is no path to show.
  children: ReactNode;
};

function formMessage(path: UpgradePath<SummarizedRelease>, name: string, base: string, start: PathStart): FormMessage | null {
  if (path.type === "invalid") return { tone: "breaking", label: "error:", body: invalidMessage(path.reason, path.from, path.latest) };
  // The counts below are built on a start nobody asked for, or on a declaration nobody checked, so
  // the line that introduces them says where it comes from (CONTEXT.md, Cammino di upgrade).
  if (start.kind === "declared") return { tone: "muted", label: "note:", body: declaredStartNote(path.from, start.declaredAt) };
  if (start.kind === "default") return { tone: "muted", label: "note:", body: defaultStartNote(path.from, start.reason) };
  if (path.recorded) return null;
  const links = path.suggestions.map((version, index) => (
    <Fragment key={version}>
      {index > 0 && " or "}
      <Link href={`${base}?from=${encodeURIComponent(version)}`} className="text-inherit underline">
        {version}
      </Link>
    </Fragment>
  ));
  return {
    tone: "muted",
    label: "note:",
    body: (
      <>
        {path.from} is not a recorded {name} release, so the path counts the recorded releases after it. Did you mean {links}?
      </>
    ),
  };
}

// The Upgrade Path as it is drawn: the form, then either the path from `start` or the plain list.
// It takes the start already chosen, so the same markup serves the page's first render and the
// client that reads `?from=` out of the URL.
export function UpgradePathBlock({ slug, name, latest, retired, releases, start, children }: Props) {
  const base = `/technologies/${slug}`;
  const path = start.kind === "none" ? null : computeUpgradePath(releases, start.version);
  // Counted on the Releases the list below prints, not on the ones recorded: a link that promises
  // completeness has to promise the number the reader can count.
  const history = recordedHistory(releases);
  const versions = releases.filter(({ version }) => !version.includes("-")).map(({ version }) => version);
  // An empty `?from=` is how the form says "no path": the way back to the whole history.
  const hidden = path?.type === "path" ? releases.length - path.range.length - path.previews.length : 0;

  return (
    <>
      <UpgradeForm
        action={base}
        latest={latest}
        versions={versions}
        value={start.kind === "none" ? "" : start.version}
        message={path && formMessage(path, name, base, start)}
      />
      {path?.type === "path" ? (
        <>
          <UpgradeVerdict from={path.from} to={path.to} counts={path.counts} majors={path.majors} />
          {path.majors.map((group) => (
            <Group
              key={group.major}
              id={`v${group.major}`}
              title={`v${group.major}`}
              detail={`${plural(group.counts.total, "release")}${path.from.startsWith(`${group.major}.`) ? ` after ${path.from}` : ""}`}
            >
              {group.rows.map((row) => (
                <Row key={rowKey(row)} slug={slug} row={row} verdict={(release) => <ReleaseRowContent slug={slug} release={release} />} />
              ))}
            </Group>
          ))}
          {!retired && path.previews.length > 0 && (
            <Group id="previews" title="previews" detail={`ahead of ${path.to}`}>
              {path.previews.map((release) => (
                <ReleaseRow key={release.version} slug={slug} release={release}>
                  <ReleaseRowContent slug={slug} release={release} />
                </ReleaseRow>
              ))}
            </Group>
          )}
          {hidden > 0 && (
            <p className="mt-3">
              <HelpPointer href={`${base}?from=`}>show all {plural(history.listed, "release")}</HelpPointer>
            </p>
          )}
        </>
      ) : (
        <>
          {!path && <HistoryOverview history={history} base={base} />}
          {children}
        </>
      )}
    </>
  );
}
