import { env } from "@/env";
import { serverEnv } from "@/env/server";
import { isAuthorizedJob } from "@/lib/job-auth";
import { createServiceClient } from "@/lib/supabase-server";
import { createSourceAdapters, detectReleases } from "@/modules/detection/server";
import { deliverSlack, generateNotifications, pruneNotifications } from "@/modules/notifications/server";
import { revalidateReleasePages } from "@/modules/releases/server";

// The daily Detection (ADR 0003), the first of the three crons in `vercel.json`. It never calls the
// AI: it leaves the new Releases `pending` and the Summary jobs take them from there.
// GET because Vercel Cron calls with GET.
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedJob(request, serverEnv.CRON_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const adapters = createSourceAdapters({ githubToken: serverEnv.GITHUB_TOKEN });
  const db = createServiceClient();
  const { detected, ...report } = await detectReleases(db, adapters);
  // Notifications ride along with the only cron there is (ADR 0009): the Summary phases are run by
  // hand, so hanging the Notifications on them alone would leave a Release whose Summary was never
  // coming, `unavailable` or `skipped` from birth, without one. Both steps are idempotent.
  const notifications = await generateNotifications(db);
  // The Slack channel rides the same run, after the Notifications exist: one message per Developer
  // (`docs/DECISIONI.md`), and a broken webhook is written down rather than thrown (#172).
  const slack = await deliverSlack(db, { siteUrl: env.NEXT_PUBLIC_SITE_URL });
  const pruned = await pruneNotifications(db);
  // A new Release changes the Technology page and gives the Release page its own address.
  return Response.json({ ...report, detected, notifications, slack, pruned, revalidated: revalidateReleasePages(detected) });
}
