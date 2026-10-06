import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { createRequestClient } from "@/lib/supabase-request";
import { requireDeveloper } from "@/modules/auth/server";
import { buildDashboard, type Dashboard } from "@/modules/dashboard";
import { readDashboard } from "@/modules/dashboard/server";
import {
  DashboardSummary,
  EmptyDashboard,
  readOpenWeeks,
  ReleaseSection,
  Spotlight,
  WEEK_PARAM,
  WeeklyDigest,
} from "@/modules/dashboard/ui";
import { listPickerTechnologies, readFollows } from "@/modules/plans/server";
import { FollowQuota, FollowsProvider } from "@/modules/plans/ui";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Behind the login, so dynamic anyway: the window is read on the server and the page arrives whole.
// The header lives inside the provider because the quota in the top bar is the same live count the
// page shows, and the two must never disagree.
export default async function DashboardPage({ searchParams }: Props) {
  const developer = await requireDeveloper("/dashboard");
  const openWeeks = readOpenWeeks((await searchParams)[WEEK_PARAM]);
  const db = await createRequestClient();
  const [{ followed, releases }, follows] = await Promise.all([readDashboard(db), readFollows(db)]);
  const dashboard = buildDashboard(followed, releases, new Date());

  return (
    <FollowsProvider developerId={developer.id} follows={follows}>
      <SiteHeader nav="dashboard" quota={<FollowQuota />} />
      <main id="content" className="mx-auto max-w-content px-4 pt-6 pb-8 sm:px-5">
        <h1 className="sr-only">Dashboard</h1>
        {followed.length === 0 ? <EmptyState db={db} /> : <FollowedStack dashboard={dashboard} openWeeks={openWeeks} />}
      </main>
    </FollowsProvider>
  );
}

function FollowedStack({ dashboard, openWeeks }: { dashboard: Dashboard; openWeeks: string[] }) {
  return (
    <>
      <DashboardSummary verdict={dashboard.verdict} counts={dashboard.counts} inUse={dashboard.inUse} />
      <Spotlight entries={dashboard.spotlight} thisWeek={dashboard.thisWeek} />
      <ReleaseSection
        id="latest"
        title="latest"
        significance="notable"
        fact="newest first"
        rows={dashboard.latest}
        thisWeek={dashboard.thisWeek}
      />
      {/* The closing band: previews and the digest side by side from 1040px, where the column is wide
          enough for two readable halves. The page ends on a block instead of thinning out row by row
          down to nothing. With only one of the two on the page the empty track collapses and the
          section keeps the full width. */}
      <div className="mt-8 grid items-start gap-7 min-[1040px]:grid-cols-[repeat(auto-fit,minmax(29.5rem,1fr))] [&>section]:mt-0">
        <ReleaseSection
          id="previews"
          title="previews"
          significance="preview"
          fact="betas and release candidates"
          rows={dashboard.previews}
          thisWeek={dashboard.thisWeek}
          band
        />
        <WeeklyDigest weeks={dashboard.digest} open={openWeeks} band />
      </div>
    </>
  );
}

const SHORTLIST = 8;

// Only the empty state needs the Catalog, so nothing else pays for the query.
async function EmptyState({ db }: { db: Awaited<ReturnType<typeof createRequestClient>> }) {
  const technologies = (await listPickerTechnologies(db))
    .filter((technology) => !technology.retired)
    .sort((a, b) => a.name.localeCompare(b.name));

  return <EmptyDashboard shortlist={technologies.slice(0, SHORTLIST)} total={technologies.length} />;
}
