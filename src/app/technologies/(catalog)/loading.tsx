import { SiteHeader } from "@/components/site-header";
import { WaitingBar } from "@/components/waiting";

// The Catalogue is behind the login and reads the follows of this Developer, so it is dynamic and
// the wait is real (DESIGN.md, The Waiting Rule).
//
// ⚠️ **The route group is what makes this legal, and it is not cosmetic**: a loading boundary applies
// to a segment **and to everything under it**, so the same file one directory up put the Technology
// and Release pages behind a shell that streams before the page runs, and their 404s started
// answering 200. Fifteen E2E caught it. `(catalog)` holds `/technologies` alone, the public pages
// sit outside it, and the address does not change.
export default function Loading() {
  return (
    <>
      <SiteHeader section="technologies" />
      <WaitingBar opening="technologies" />
    </>
  );
}
