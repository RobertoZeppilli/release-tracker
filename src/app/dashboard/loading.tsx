import { SiteHeader } from "@/components/site-header";
import { PageSkeleton } from "@/components/waiting";

// DESIGN.md, The Waiting Rule. The Dashboard is behind the login and dynamic by nature, so between
// the click and the page there is a real wait. The bar arrives first and unchanged, and under it the
// page is drawn in outline until the real one replaces it. No quota in the bar here: the count is
// the page's own answer and this page has not answered yet.
export default function Loading() {
  return (
    <>
      <SiteHeader section="dashboard" />
      <PageSkeleton opening="dashboard" />
    </>
  );
}
