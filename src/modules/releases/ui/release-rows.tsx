import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ListedRelease, MajorRow } from "../domain/group-by-major";
import { releasePath } from "../domain/release-page";
import { SignificanceLabel } from "./significance-glyph";

const ROW = "grid grid-cols-[11ch_14ch_11ch_1fr] items-baseline gap-x-4 border-b border-rule py-3 max-[880px]:grid-cols-[auto_1fr_auto]";

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
      <time dateTime={isoDate(release.publishedAt)} className="font-mono text-label text-text-faint max-[880px]:justify-self-end">
        {isoDate(release.publishedAt)}
      </time>
      {children && <div className="min-w-0 max-[880px]:col-span-full">{children}</div>}
    </li>
  );
}

export function DigestRow({ slug, releases }: { slug: string; releases: ListedRelease[] }) {
  const first = releases[0].version;
  const last = releases[releases.length - 1].version;
  return (
    <li className="border-b border-rule">
      <details className="group">
        <summary className="grid cursor-pointer list-none grid-cols-[11ch_1fr_auto] items-center gap-x-4 py-2 font-mono text-label text-text-muted hover:text-text max-[640px]:grid-cols-[auto_1fr_auto] [&::-webkit-details-marker]:hidden">
          <SignificanceLabel significance="digest" />
          <span className="min-w-0">
            {plural(releases.length, "digest release")}
            {releases.length > 1 && <span className="max-[640px]:hidden"> · {first} to {last}</span>}
          </span>
          <ChevronRight
            aria-hidden
            className="size-4 justify-self-end transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-90 motion-reduce:transition-none"
          />
        </summary>
        <ul className="mb-3 grid grid-cols-[repeat(auto-fill,minmax(22ch,1fr))] gap-x-4 gap-y-[2px] pl-[calc(11ch+var(--spacing-4))] font-mono text-label max-[640px]:pl-[0]">
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

export function Group({ id, title, detail, children }: { id: string; title: string; detail: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-7">
      <h2
        id={id}
        className="mb-3 flex items-baseline gap-3 font-mono text-section-title font-semibold tracking-[0.02em] text-text-muted after:h-px after:flex-1 after:-translate-y-1 after:bg-rule after:content-['']"
      >
        <span className="text-body text-text">{title}</span> {detail}
      </h2>
      <ul>{children}</ul>
    </section>
  );
}
