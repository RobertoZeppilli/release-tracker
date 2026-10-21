import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { createRequestClient } from "@/lib/supabase-request";
import { requireDeveloper } from "@/modules/auth/server";
import { buildDashboard, type Dashboard } from "@/modules/dashboard";
import { readDashboard } from "@/modules/dashboard/server";
import {
  EmptyDashboard,
  readOpenWeeks,
  StandingColumn,
  Stream,
  WEEK_PARAM,
  windowLine,
} from "@/modules/dashboard/ui";
import { currentLocale, getTranslator } from "@/modules/i18n/server";
import { listPickerTechnologies, readFollows } from "@/modules/plans/server";
import { FollowQuota, FollowsProvider } from "@/modules/plans/ui";

// A title in the page's own language, which is why it is a function and no longer a constant: the
// page is behind the login and carries no canonical, so the whole of its metadata is the title.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("page.dashboard.title"), robots: { index: false } };
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// The two questions, a column each, and nothing printed in both (DESIGN.md, The Two Questions Rule).
// The 1241px step and not 1240: the mock's own query is `max-width: 1040px`, so at exactly 1040px
// the page is one column, which is what DESIGN.md says ("at 1040px and below").
const SPLIT = "grid max-w-content items-start gap-7 min-[1041px]:grid-cols-[minmax(0,360px)_minmax(0,1fr)] min-[1041px]:gap-8";
// With no follows the page is one column and not the split: the split separates two questions, and
// with nothing followed neither has an answer (DESIGN.md, Empty State). The container stays the
// page's own 1240px and the content is capped inside it: the mock centred a 1040px column instead,
// which left the wordmark and the account panel 100px off the content they open (DESIGN.md, Layout,
// "The bar's container is the page's container").
const ONE_COLUMN = "max-w-content [&>*]:max-w-column";

// Behind the login, so dynamic anyway: the window is read on the server and the page arrives whole.
// The header lives inside the provider because the quota in the top bar is the same live count the
// page shows, and the two must never disagree.
export default async function DashboardPage({ searchParams }: Props) {
  const developer = await requireDeveloper("/dashboard");
  const t = await getTranslator();
  const openWeeks = readOpenWeeks((await searchParams)[WEEK_PARAM]);
  const db = await createRequestClient();
  const [{ followed, releases }, follows] = await Promise.all([readDashboard(db), readFollows(db)]);
  const dashboard = buildDashboard(followed, releases, new Date());
  const empty = followed.length === 0;

  return (
    <FollowsProvider developerId={developer.id} follows={follows}>
      <SiteHeader section="dashboard" quota={<FollowQuota />} />
      <main
        id="content"
        className={`mx-auto px-4 pt-5 pb-8 sm:px-5 sm:pt-6 ${empty ? ONE_COLUMN : SPLIT}`}
      >
        <h1 className="sr-only">{t("page.dashboard.title")}</h1>
        {empty ? (
          <EmptyState db={db} />
        ) : (
          <FollowedStack dashboard={dashboard} openWeeks={openWeeks} />
        )}
      </main>
    </FollowsProvider>
  );
}

// The translator is read here and handed down: the components live under `dashboard/ui`, whose index
// client components import too, so none of them may import `i18n/server` itself.
async function FollowedStack({ dashboard, openWeeks }: { dashboard: Dashboard; openWeeks: string[] }) {
  const t = await getTranslator();
  const locale = await currentLocale();

  return (
    <>
      <StandingColumn verdict={dashboard.verdict} standing={dashboard.standing} t={t} />
      <Stream stream={dashboard.stream} openWeeks={openWeeks} t={t} locale={locale} />
      {/* The window the page read, said once, at the end: the Stream's title names its size and
          this names its edges. */}
      <p className="col-span-full mt-7 font-mono text-meta leading-[normal] text-text-faint">
        {windowLine(dashboard.window.start, dashboard.window.end, t)}
      </p>
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
