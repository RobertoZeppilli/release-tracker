import Link from "next/link";
import { SiteHeaderBar } from "./site-header-bar";
import { NAV, type NavItem } from "./site-nav";

// Above 640px the slot is a row inside the bar. Below it the row is gone and the destinations are
// lines of the account sheet instead, which is the second branch the No Dead End Rule always
// allowed (DESIGN.md). It is what makes the bar **one 56px row at every width**: the 40px strip it
// used to grow was a seventh of a 667px screen spent on furniture, and the two links were the part
// a reader needs least often. A viewer with no account reaches both through `sign in`, which is
// where either link would have sent them anyway, and the breadcrumb in the content is what says
// where a public page sits.
const SLOT = "max-sm:hidden";

// The slot holds the two sections on every page, public ones included, and `section` only says which
// of them is being read. Both sit behind sign-in and the links are there for a visitor all the same:
// they land on sign-in and are returned afterwards, which is the rule the `technologies` breadcrumb
// step already followed. The header cannot branch on the viewer anyway, since the session arrives
// after the first paint and a header that changed shape when it arrived would remount the page.
// Where the page sits is no longer in the bar: that is `PageBreadcrumb`, at the top of the content.
// `quota` arrives as an element, not as a component: the header shows what a signed-in page hands
// it and never learns what a Plan is, so the public pages simply pass nothing.
// The bar takes no width of its own any more: every page of the app shares the one container, so
// the wordmark sits over the first letter of what it opens without being told where that is
// (DESIGN.md, Layout, "The bar's container is the page's container").
export function SiteHeader({
  section,
  quota,
}: {
  section?: NavItem;
  quota?: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#content"
        className="absolute -left-[9999px] z-10 bg-raised px-3 py-2 focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      {/* DESIGN.md, Layout: the bar stays on the screen, on every page. A product whose pages are
          long lists of Releases should not ask a reader at the bottom of one to scroll back up to
          reach the other destination. It keeps its height and its shape while the page moves under
          it: no shadow, no hiding on scroll, nothing that grows. */}
      <header className="sticky top-0 z-20 border-b border-rule bg-ground">
        <SiteHeaderBar quota={quota} section={section}>
          <nav aria-label="Sections" className={SLOT}>
            <ul className="flex gap-4 font-mono text-label text-text-muted">
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={item.label === section ? "page" : undefined}
                    className={`no-underline hover:text-text ${item.label === section ? "text-text" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </SiteHeaderBar>
      </header>
    </>
  );
}
