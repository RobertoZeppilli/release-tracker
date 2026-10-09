import Link from "next/link";
import { SiteHeaderBar } from "./site-header-bar";

// The signed-in pages, in the order DESIGN.md gives them.
const NAV = [
  { label: "dashboard", href: "/dashboard" },
  { label: "technologies", href: "/technologies" },
] as const;

export type NavItem = (typeof NAV)[number]["label"];

// Below 640px the slot leaves the bar and becomes a 40px strip under it, with the same links in the
// same order: No Dead End Rule in DESIGN.md. Nothing is hidden and nothing opens, so the keyboard
// reaches it in document order. Below 430px the quota shares that strip instead of taking one of its
// own, so the bar stays the two rows DESIGN.md specifies: on an iPhone SE, an iPhone 14 or a Pixel
// the three items did not fit on one line and the bar took a third row, 153px of chrome before the
// verdict.
const SLOT =
  "max-sm:order-3 max-sm:flex max-sm:h-[40px] max-sm:items-center max-sm:border-t max-sm:border-rule min-[430px]:max-sm:w-full max-[429px]:grow";

// The slot holds the two sections on every page, public ones included, and `section` only says which
// of them is being read. Both sit behind sign-in and the links are there for a visitor all the same:
// they land on sign-in and are returned afterwards, which is the rule the `technologies` breadcrumb
// step already followed. The header cannot branch on the viewer anyway, since the session arrives
// after the first paint and a header that changed shape when it arrived would remount the page.
// Where the page sits is no longer in the bar: that is `PageBreadcrumb`, at the top of the content.
// `quota` arrives as an element, not as a component: the header shows what a signed-in page hands
// it and never learns what a Plan is, so the public pages simply pass nothing.
// `wide` is the landing, the one page at the 1240px container: the bar carries the page's own width
// so the wordmark sits over the first letter of the claim. Everywhere else it is the app's 1040.
export function SiteHeader({
  section,
  quota,
  wide,
}: {
  section?: NavItem;
  quota?: React.ReactNode;
  wide?: boolean;
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
        <SiteHeaderBar quota={quota} wide={wide}>
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
