import { z } from "zod";
import type { Significance, SummaryStatus } from "@/modules/releases";

export const NotificationEventSchema = z.enum(["featured_release", "notable_release", "weekly_digest"]);

export type NotificationEvent = z.infer<typeof NotificationEventSchema>;

export const NotificationChannelSchema = z.enum(["in_app", "slack", "email"]);

export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

// The two events a Release can be. The other Significances are deliberate silence (ADR 0009): a
// `digest` arrives inside the weekly Digest, and a Preview is noise for whoever is not looking for
// one.
export type ReleaseEvent = Extract<NotificationEvent, "featured_release" | "notable_release">;

export function releaseEventFor(significance: Significance): ReleaseEvent | null {
  if (significance === "featured") return "featured_release";
  if (significance === "notable") return "notable_release";
  return null;
}

// A Notification is born when the Summary is settled, never at Detection: ADR 0003 separates the two
// steps, and at Detection nobody knows yet whether the Release has breaking changes, which is the
// only thing worth interrupting someone for. `unavailable`, `skipped` and `failed` are settled too,
// so a Release whose Summary will never arrive still gets one Notification, without a verdict.
const SETTLED: ReadonlySet<SummaryStatus> = new Set(["ready", "unavailable", "skipped", "failed"]);

export function isSummarySettled(status: SummaryStatus): boolean {
  return SETTLED.has(status);
}
