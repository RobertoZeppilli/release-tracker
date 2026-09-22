import { CircleX, Clock, Info, type LucideIcon } from "lucide-react";
import type { ReleaseDetail } from "../domain/release-page";

type Block = { Icon: LucideIcon; label: string; title: string; body: string; tone: "muted" | "breaking" };

function utc(date: Date): string {
  return `${date.toISOString().slice(0, 10)} at ${date.toISOString().slice(11, 16)} UTC`;
}

// Dates are absolute: the page is cached, so "today" would go stale. No text promises a Summary
// that will not come: `skipped` and `unavailable` say plainly that there is none.
function block(release: ReleaseDetail, hasGitHub: boolean): Block | null {
  const recorded = release.origin === "detected" ? `Detected ${utc(release.recordedAt)}.` : `Imported ${utc(release.recordedAt)}.`;
  const queued = `${recorded} Summaries usually land within a few hours; the full release notes are already below.`;
  // A ready row whose content does not validate reads as failed: there is no Summary to show.
  const status = release.summaryStatus === "ready" && release.summary === null ? "failed" : release.summaryStatus;
  switch (status) {
    case "pending":
      return { Icon: Clock, label: "pending:", title: "summary queued", body: queued, tone: "muted" };
    case "processing":
      return { Icon: Clock, label: "processing:", title: "summary in progress", body: queued, tone: "muted" };
    case "unavailable":
      return {
        Icon: Info,
        label: "note:",
        title: "no release notes to summarize",
        body: `The maintainers published this version without release notes, and we don't guess what changed.${hasGitHub ? " The commit history on GitHub is the best source." : ""}`,
        tone: "muted",
      };
    case "skipped":
      return release.significance === "digest"
        ? {
            Icon: Info,
            label: "note:",
            title: "no summary for this digest release",
            body: "Digest releases are listed without a summary. The original release notes for this version are below.",
            tone: "muted",
          }
        : {
            Icon: Info,
            label: "note:",
            title: "no summary for this older release",
            body: "We summarize recent releases. The original release notes for this version are below.",
            tone: "muted",
          };
    case "failed":
      return {
        Icon: CircleX,
        label: "error:",
        title: "summary unavailable",
        body: "We couldn't produce a reliable summary for this release. The original release notes are below.",
        tone: "breaking",
      };
    default:
      return null;
  }
}

export function SummaryStatusBlock({ release, hasGitHub }: { release: ReleaseDetail; hasGitHub: boolean }) {
  const content = block(release, hasGitHub);
  if (!content) return null;
  const { Icon, label, title, body, tone } = content;
  return (
    <section aria-label="Summary status" className="mt-6 max-w-measure">
      <p className="font-mono text-status">
        <span className={tone === "breaking" ? "text-breaking" : "text-text-muted"}>
          <Icon aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.8em] align-[-0.08em]" />
          {label}
        </span>{" "}
        {title}
      </p>
      <p className="mt-3 text-text-muted">{body}</p>
    </section>
  );
}
