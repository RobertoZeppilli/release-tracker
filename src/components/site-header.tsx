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

// `path` is the breadcrumb after the wordmark; the last item is the current page. On a signed-in
// page `nav` replaces the breadcrumb with the two destinations, as in DESIGN.md.
// `quota` arrives as an element, not as a component: the header shows what a signed-in page hands
// it and never learns what a Plan is, so the public pages simply pass nothing.
export function SiteHeader({
  path,
  nav,
  quota,
}: {
  path?: readonly PathItem[];
  nav?: NavItem;
  quota?: React.ReactNode;
}) {
  if (nav) return <HeaderShell quota={quota}>{<SignedInNav current={nav} />}</HeaderShell>;
  return <HeaderShell quota={quota}>{path ? <Breadcrumb path={path} /> : null}</HeaderShell>;
}

function SignedInNav({ current }: { current: NavItem }) {
  return (
    <nav aria-label="Sections" className="max-sm:hidden">
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
        <div className="mx-auto flex h-[56px] max-w-content items-center gap-5 px-4 sm:px-5">
          <Link href="/" className="shrink-0 font-mono text-[14px] whitespace-nowrap no-underline [font-variant-ligatures:none]">
            release-tracker
          </Link>
          {children}
          <div className="ml-auto flex shrink-0 items-center gap-4 whitespace-nowrap">
            {quota}
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
    <nav aria-label="Breadcrumb" className="max-sm:hidden">
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
