import { ExternalLink, FileText } from "lucide-react";
import type { Translator } from "@/modules/i18n";
import type { ReleaseDetail } from "../domain/release-page";
import { OpenNotesLink } from "./open-notes-link";
import { SignificanceLabel } from "./significance-glyph";

const BUTTON =
  "inline-flex h-[34px] items-center gap-2 whitespace-nowrap rounded-md border border-rule-strong px-3 font-sans text-[14px] font-medium text-text no-underline hover:border-text-faint hover:bg-raised";

export type ExternalSource = { label: string; href: string };

// Without notes there is nothing to open: the action points to the Source instead.
export function ReleaseHeader({
  technologyName,
  release,
  source,
  t,
}: {
  technologyName: string;
  release: ReleaseDetail;
  source: ExternalSource | null;
  t: Translator;
}) {
  const date = release.publishedAt.toISOString().slice(0, 10);
  return (
    <div className="flex flex-wrap items-baseline gap-4">
      <h1 className="font-sans text-headline font-semibold">
        {technologyName} <span className="ml-2 font-mono font-normal text-text-muted">{release.version}</span>
      </h1>
      <p className="flex flex-wrap gap-4 font-mono text-label text-text-muted">
        <time dateTime={date}>{date}</time>
        <SignificanceLabel significance={release.significance} />
      </p>
      <div className="ml-auto phone:ml-[0]">
        {release.notes ? (
          <OpenNotesLink className={BUTTON}>
            <FileText aria-hidden className="size-4" />
            {t("release.notes")}
          </OpenNotesLink>
        ) : (
          source && (
            <a href={source.href} className={BUTTON}>
              <ExternalLink aria-hidden className="size-4" />
              {source.label}
            </a>
          )
        )}
      </div>
    </div>
  );
}
