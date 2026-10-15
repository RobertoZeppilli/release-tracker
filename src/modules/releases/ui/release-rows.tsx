import { ChevronRight } from "lucide-react";
import { LocaleLink as Link } from "@/modules/i18n/ui";
import type { ReactNode } from "react";
import type { ListedRelease, MajorRow } from "../domain/group-by-major";
import { releasePath } from "../domain/release-page";
import { SignificanceLabel } from "./significance-glyph";

const ROW = "grid grid-cols-[11ch_14ch_11ch_1fr] items-baseline gap-x-4 border-b border-rule py-3 narrow:grid-cols-[auto_1fr_auto]";

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

const VERSION_LINK = "no-underline hover:underline";

export function ReleaseRow({ slug, release, children }: { slug: string; release: ListedRelease; children?: ReactNode }) {
  return (
    <li className={ROW}>
      <SignificanceLabel significance={release.significance} />
      <Link href={releasePath(slug, release.version)} className={`font-mono text-body text-text ${VERSION_LINK}`}>
        {release.version}
      </Link>
      <time dateTime={isoDate(release.publishedAt)} className="font-mono text-label text-text-faint narrow:justify-self-end">
        {isoDate(release.publishedAt)}
      </time>
      {children && <div className="min-w-0 narrow:col-span-full">{children}</div>}
    </li>
  );
}

export function DigestRow({ slug, releases }: { slug: string; releases: ListedRelease[] }) {
  const first = releases[0].version;
  const last = releases[releases.length - 1].version;
  return (
    <li className="border-b border-rule">
      <details className="group">
        <summary className="grid cursor-pointer list-none grid-cols-[11ch_1fr_auto] items-center gap-x-4 py-2 font-mono text-label text-text-muted hover:text-text phone:grid-cols-[auto_1fr_auto] [&::-webkit-details-marker]:hidden">
          <SignificanceLabel significance="digest" />
          <span className="min-w-0">
            {plural(releases.length, "digest release")}
            {releases.length > 1 && <span className="phone:hidden"> · {first} to {last}</span>}
          </span>
          <ChevronRight
            aria-hidden
            className="size-4 justify-self-end transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-90 motion-reduce:transition-none"
          />
        </summary>
        <ul className="mb-3 grid grid-cols-[repeat(auto-fill,minmax(22ch,1fr))] gap-x-4 gap-y-1 pl-[calc(11ch+var(--spacing-4))] font-mono text-label phone:pl-[0]">
          {releases.map((release) => (
            <li key={release.version}>
              <Link href={releasePath(slug, release.version)} className={`text-text ${VERSION_LINK}`}>
                {release.version}
              </Link>
              <time dateTime={isoDate(release.publishedAt)} className="ml-[1ch] text-text-faint">
                {isoDate(release.publishedAt)}
              </time>
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}

export function Row<T extends ListedRelease>({ slug, row, verdict }: { slug: string; row: MajorRow<T>; verdict?: (release: T) => ReactNode }) {
  if (row.type === "digest") return <DigestRow slug={slug} releases={row.releases} />;
  return (
    <ReleaseRow slug={slug} release={row.release}>
      {verdict?.(row.release)}
    </ReleaseRow>
  );
}

export function rowKey(row: MajorRow<ListedRelease>): string {
  return row.type === "release" ? row.release.version : `digest-${row.releases[0].version}`;
}

// DESIGN.md, Stat Row and Technology page rows: the group's title *is* its stat row. The major, a
// faint gutter, the bar, the counts in words, and then the rule that runs out to the right edge the
// way every section title in the app does. Below 880px the words drop to a line of their own and the
// rule goes with the room it needed.
const GROUP_TITLE =
  "mb-2 grid items-center gap-x-3 pb-2 font-mono text-diagnostic text-text-muted after:h-px after:bg-rule after:content-['']";
const WITH_BAR =
  "grid-cols-[3ch_1ch_minmax(80px,120px)_auto_1fr] narrow:grid-cols-[3ch_1ch_minmax(90px,1fr)] narrow:gap-y-1 narrow:after:hidden";
// No bar: one group has nothing to compare itself with, and the Previews are listed apart from the
// path, so no bar carries them (DESIGN.md, Stat Row, "The bar needs two groups").
const WORDS_ONLY = "grid-cols-[auto_auto_1fr]";

// `bar` is the bar cell, absent wherever there is nothing to compare. The heading is an `h3`: the
// column above it carries the `h2` that names the question, and these name the groups inside it.
export function Group({
  id,
  title,
  words,
  bar,
  children,
}: {
  id: string;
  title: string;
  words: ReactNode;
  bar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className={`${GROUP_TITLE} ${bar ? WITH_BAR : WORDS_ONLY}`}>
        <span className="font-mono text-body font-semibold tracking-[0.02em] text-text">{title}</span>
        {bar && (
          <>
            <span aria-hidden className="text-text-faint">
              |
            </span>
            {bar}
          </>
        )}
        <span className="narrow:col-span-full">{words}</span>
      </h3>
      <ul>{children}</ul>
    </section>
  );
}
