import { SiteHeader } from "@/components/site-header";
import { WaitingBar } from "@/components/waiting";

// DESIGN.md, The Waiting Rule: the Dashboard is behind the login and dynamic by nature, so between
// the click and the page there is a wait with no control to reserve space for. The bar arrives
// first, unchanged, and under it the progress bar runs until the page is built. Nothing
// stands in for the content: a block in the shape of a Standing column would claim to know what is
// coming (The Reserved Space Rule). No quota in the bar here, because the count is the page's own
// answer and this page has not answered yet.
export default function Loading() {
  return (
    <>
      <SiteHeader section="dashboard" />
      <WaitingBar opening="dashboard" />
    </>
  );
}
