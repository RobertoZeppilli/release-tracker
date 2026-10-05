import Link from "next/link";
import { AuthStatus } from "@/modules/auth/ui";
import { ThemeToggle } from "./theme-toggle";

export type PathItem = string | { label: string; href: string };

// The signed-in pages, in the order DESIGN.md gives them.
const NAV = [
  { label: "dashboard", href: "/dashboard" },
  { label: "technologies", href: "/technologies" },
] as const;

export type NavItem = (typeof NAV)[number]["label"];

// The first step of every public breadcrumb. `/technologies` sits behind sign-in, and the step is a
// link all the same: the breadcrumb says where the page sits, not what the viewer may open, and
// `requireDeveloper` brings a visitor back here once signed in. It cannot depend on the viewer
// anyway, since the session only arrives after the first paint.
export const TECHNOLOGIES_CRUMB = { label: "technologies", href: "/technologies" } as const;

// Below 640px the slot leaves the bar and becomes a 40px strip under it, with the same links in the
// same order: No Dead End Rule in DESIGN.md. Nothing is hidden and nothing opens, so the keyboard
// reaches it in document order. Below 430px the quota comes down into the strip beside it, so the
// bar stays the two rows DESIGN.md specifies: on an iPhone SE, an iPhone 14 or a Pixel the three
// items did not fit on one line and the bar took a third row, 153px of chrome before the verdict.
const SLOT =
  "max-sm:order-3 max-sm:flex max-sm:h-[40px] max-sm:items-center max-sm:border-t max-sm:border-rule min-[430px]:max-sm:w-full max-[429px]:grow";

// The quota in the bar at 430px and up, in the strip below it. It carries the strip's rule with it,
// and the strip has no gap between the two, so the rule runs unbroken across the row.
const QUOTA =
  "ml-auto flex h-[56px] items-center max-[429px]:order-3 max-[429px]:ml-0 max-[429px]:h-[40px] max-[429px]:border-t max-[429px]:border-rule";

// `path` is the breadcrumb after the wordmark; the last item is the current page. On a signed-in
// page `nav` replaces the breadcrumb with the two destinations, as in DESIGN.md; `nav` without a
// section (the home page) shows the same destinations with none of them current.
// `quota` arrives as an element, not as a component: the header shows what a signed-in page hands
// it and never learns what a Plan is, so the public pages simply pass nothing.
export function SiteHeader({
  path,
  nav,
  quota,
}: {
  path?: readonly PathItem[];
  nav?: NavItem | true;
  quota?: React.ReactNode;
}) {
  if (nav) return <HeaderShell quota={quota}>{<SignedInNav current={nav} />}</HeaderShell>;
  return <HeaderShell quota={quota}>{path ? <Breadcrumb path={path} /> : null}</HeaderShell>;
}

function SignedInNav({ current }: { current: NavItem | true }) {
  return (
    <nav aria-label="Sections" className={SLOT}>
      <ul className="flex gap-4 font-mono text-label text-text-muted">
        {NAV.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              aria-current={item.label === current ? "page" : undefined}
              className={`no-underline hover:text-text ${item.label === current ? "text-text" : ""}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function HeaderShell({ children, quota }: { children: React.ReactNode; quota?: React.ReactNode }) {
  return (
    <>
      <a
        href="#content"
        className="absolute -left-[9999px] z-10 bg-raised px-3 py-2 focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-content flex-wrap items-center gap-x-5 px-4 max-[429px]:gap-x-0 sm:h-[56px] sm:flex-nowrap sm:px-5">
          <Link
            href="/"
            className="flex h-[56px] shrink-0 items-center font-mono text-[14px] whitespace-nowrap no-underline [font-variant-ligatures:none]"
          >
            release-tracker
          </Link>
          {children}
          {quota && <span className={QUOTA}>{quota}</span>}
          <div
            className={`flex h-[56px] shrink-0 items-center gap-4 whitespace-nowrap ${quota ? "max-[429px]:ml-auto" : "ml-auto"}`}
          >
            <AuthStatus />
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
}

function Breadcrumb({ path }: { path: readonly PathItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className={SLOT}>
      <ol className="flex gap-2 font-mono text-label text-text-muted">
        {path.map((item, index) => {
          const current = index === path.length - 1;
          const label = typeof item === "string" ? item : item.label;
          return (
            <li key={label} className="flex gap-2">
              {index > 0 && <span aria-hidden>/</span>}
              {typeof item === "string" ? (
                <span aria-current={current ? "page" : undefined} className={current ? "text-text" : undefined}>
                  {item}
                </span>
              ) : (
                <Link href={item.href} className="no-underline hover:text-text">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
