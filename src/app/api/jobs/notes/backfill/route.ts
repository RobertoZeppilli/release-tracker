import { serverEnv } from "@/env/server";
import { isAuthorizedJob } from "@/lib/job-auth";
import { createServiceClient } from "@/lib/supabase-server";
import { backfillNotes, createSourceAdapters } from "@/modules/detection/server";
import { revalidateReleasePages } from "@/modules/releases/server";

// Issue #80, called by hand and by nobody else: it is deliberately absent from the crons in
// `vercel.json`, like the two Summary jobs. It asks GitHub and the changelogs, never Anthropic, and
// it cannot queue a Summary, so it does not spend.
//
// `?apply=1` writes; without it the run is a dry run that asks the Sources and reports what it
// would fill. `?technology=<slug>` narrows it to one Technology, which is also how a run that hits
// GitHub's rate limit is resumed.
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedJob(request, serverEnv.CRON_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const parameters = new URL(request.url).searchParams;
  const slug = parameters.get("technology") ?? undefined;
  const apply = parameters.get("apply") === "1";

  const adapters = createSourceAdapters({ githubToken: serverEnv.GITHUB_TOKEN });
  const report = await backfillNotes(createServiceClient(), adapters, { slug, apply });
  // Notes are the body of the Release page and the row's link on the Technology page.
  const revalidated = apply ? revalidateReleasePages(report.filled) : [];
  return Response.json({ ...report, revalidated });
}
