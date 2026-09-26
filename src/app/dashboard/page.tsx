import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { requireDeveloper } from "@/modules/auth/server";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

// Placeholder until issues #20 and #21 build the Dashboard; the protection is what #16 delivers.
export default async function DashboardPage() {
  const developer = await requireDeveloper("/dashboard");

  return (
    <>
      <SiteHeader nav="dashboard" />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        <h1 className="font-sans text-headline font-semibold">Dashboard</h1>
        <p className="mt-3 font-mono text-status text-text-muted" data-testid="developer-email">
          {developer.email ?? "signed in"}
        </p>
      </main>
    </>
  );
}
