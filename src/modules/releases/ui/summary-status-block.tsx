import { CircleX, Clock, Info, type LucideIcon } from "lucide-react";
import type { Translator } from "@/modules/i18n";
import type { ReleaseDetail } from "../domain/release-page";

type Block = { Icon: LucideIcon; label: string; title: string; body: string; tone: "muted" | "breaking" };

function utc(date: Date, t: Translator): string {
  const iso = date.toISOString();
  return t("release.status.when", { date: iso.slice(0, 10), time: iso.slice(11, 16) });
}

// Dates are absolute: the page is cached, so "today" would go stale. No text promises a Summary
// that will not come: `skipped` and `unavailable` say plainly that there is none.
function block(release: ReleaseDetail, hasGitHub: boolean, t: Translator): Block | null {
  const when = utc(release.recordedAt, t);
  const recorded = t(release.origin === "detected" ? "release.status.detected" : "release.status.imported", { when });
  const queued = t("release.status.queuedBody", { recorded });
  // A ready row whose content does not validate reads as failed: there is no Summary to show.
  const status = release.summaryStatus === "ready" && release.summary === null ? "failed" : release.summaryStatus;
  switch (status) {
    case "pending":
      return { Icon: Clock, label: "pending:", title: t("release.status.queued"), body: queued, tone: "muted" };
    case "processing":
      return { Icon: Clock, label: "processing:", title: t("release.status.processing"), body: queued, tone: "muted" };
    case "unavailable":
      return {
        Icon: Info,
        label: "note:",
        title: t("release.status.unavailable"),
        // Two sentences joined with a space, not one sentence with a hole: a language is free to
        // join them its own way, and the second only exists where the Technology is on GitHub.
        body: [
          t("release.status.unavailableBody"),
          ...(hasGitHub ? [t("release.status.unavailableGitHub")] : []),
        ].join(" "),
        tone: "muted",
      };
    case "skipped":
      return release.significance === "digest"
        ? {
            Icon: Info,
            label: "note:",
            title: t("release.status.digest"),
            body: t("release.status.digestBody"),
            tone: "muted",
          }
        : {
            Icon: Info,
            label: "note:",
            title: t("release.status.older"),
            body: t("release.status.olderBody"),
            tone: "muted",
          };
    case "failed":
      return {
        Icon: CircleX,
        label: "error:",
        title: t("release.status.failed"),
        body: t("release.status.failedBody"),
        tone: "breaking",
      };
    default:
      return null;
  }
}

export function SummaryStatusBlock({
  release,
  hasGitHub,
  t,
}: {
  release: ReleaseDetail;
  hasGitHub: boolean;
  t: Translator;
}) {
  const content = block(release, hasGitHub, t);
  if (!content) return null;
  const { Icon, label, title, body, tone } = content;
  return (
    <section aria-label={t("release.status.label")} className="mt-6 max-w-measure">
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
