"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import { computeUpgradePath, type SummarizedRelease, type UpgradePath } from "../domain/upgrade-path";
import { Group, plural, ReleaseRow, Row, rowKey } from "./release-rows";
import { ReleaseRowContent } from "./release-row-content";
import { type FormMessage, UpgradeForm } from "./upgrade-form";
import { declaredStartNote, invalidMessage } from "./upgrade-path-copy";
import { type UpgradeStart, useUpgradeStart } from "./upgrade-start";
import { UpgradeVerdict } from "./upgrade-verdict";

type Props = {
  slug: string;
  name: string;
  latest: string;
  retired: boolean;
  releases: SummarizedRelease[];
  // The plain list of Releases, shown until a valid `from` is given.
  children: ReactNode;
};

function formMessage(
  path: UpgradePath<SummarizedRelease>,
  name: string,
  base: string,
  declared: UpgradeStart | null,
): FormMessage | null {
  if (path.type === "invalid") return { tone: "breaking", label: "error:", body: invalidMessage(path.reason, path.from, path.latest) };
  // The counts below are built on a declaration nobody checked, so the line that introduces them
  // says since when it has been standing (CONTEXT.md, Versione in uso).
  if (declared) return { tone: "muted", label: "note:", body: declaredStartNote(declared.version, declared.declaredAt) };
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

// Reads `?from` on the client so the Technology page itself stays cached (ISR).
export function UpgradePathView({ slug, name, latest, retired, releases, children }: Props) {
  const base = `/technologies/${slug}`;
  const typed = useSearchParams().get("from");
  // `?from=` is a single look and wins over the declared start, without touching what is saved.
  const declared = useUpgradeStart();
  const start = typed ?? declared?.version ?? null;
  const path = start === null ? null : computeUpgradePath(releases, start);
  const versions = releases.filter(({ version }) => !version.includes("-")).map(({ version }) => version);

  return (
    <>
      <UpgradeForm
        action={base}
        latest={latest}
        versions={versions}
        value={start ?? ""}
        message={path && formMessage(path, name, base, typed === null ? declared : null)}
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
        </>
      ) : (
        children
      )}
    </>
  );
}
